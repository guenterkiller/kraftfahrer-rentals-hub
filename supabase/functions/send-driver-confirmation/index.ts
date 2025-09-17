// supabase/functions/send-driver-confirmation/index.ts
// Deno Edge Function – sofortiger Versand der Fahrer-Einsatzbestätigung (E-Mail + PDF)
// Erwartet: POST { assignment_id: string }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { htmlToSimplePdf } from "./pdf.ts"; // siehe pdf.ts weiter unten

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "info@kraftfahrer-mieten.com";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!; // Resend HTTP API

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// --- TEMPLATES ---
import htmlTpl from "./templates/driver-confirmation.html" assert { type: "text" };
import txtTpl from "./templates/driver-confirmation.txt" assert { type: "text" };

// simple replacer
function render(tpl: string, vars: Record<string, string | number | null | undefined>) {
  return tpl.replace(/{{\s*([^}]+)\s*}}/g, (_, k) => {
    const v = vars[k.trim()];
    return (v === undefined || v === null) ? "" : String(v);
  });
}

function ensure(v?: string | null) { return !!(v && v.trim().length); }

// derive display helpers
function withCurrency(n?: number | null) {
  if (typeof n === "number") {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
  }
  return "nach Absprache";
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), { status: 405 });
    }

    const { assignment_id } = await req.json();
    if (!assignment_id) {
      return new Response(JSON.stringify({ ok: false, error: "assignment_id required" }), { status: 400 });
    }

    // Daten holen (Assignment + Job + Fahrer)
    // Passen ggf. die Feldnamen an euer Schema an.
    const { data: rows, error } = await sb
      .from("job_assignments")
      .select(`
        id, job_id, driver_id, status,
        rate_type, rate_value, start_date, end_date, admin_note,
        job_requests:job_id (
          id, status, customer_name, company, customer_phone, customer_email,
          einsatzort, fahrzeugtyp, besonderheiten, zeitraum
        ),
        fahrer_profile:driver_id (
          id, vorname, nachname, email, telefon
        )
      `)
      .eq("id", assignment_id)
      .limit(1)
      .maybeSingle();

    if (error || !rows) {
      return new Response(JSON.stringify({ ok: false, error: "assignment not found" }), { status: 404 });
    }

    const ja = rows as any;
    const jr = ja.job_requests;
    const fp = ja.fahrer_profile;

    // Pflicht-Validierungen (hard stop)
    if (!fp || !ensure(fp.email) || !ensure(fp.vorname) || !ensure(fp.nachname)) {
      return new Response(JSON.stringify({ ok: false, error: "Fahrerdaten unvollständig." }), { status: 400 });
    }
    if (!jr) {
      return new Response(JSON.stringify({ ok: false, error: "Auftragsdaten fehlen." }), { status: 400 });
    }
    if (!ensure(jr.customer_phone) && !ensure(jr.customer_email)) {
      return new Response(JSON.stringify({ ok: false, error: "Kontakt Auftraggeber fehlt (Telefon oder E-Mail)." }), { status: 400 });
    }

    const zeitraum = ja.start_date && ja.end_date
      ? new Intl.DateTimeFormat("de-DE").format(new Date(ja.start_date)) +
        " – " + new Intl.DateTimeFormat("de-DE").format(new Date(ja.end_date))
      : jr.zeitraum || "nach Absprache";

    const adminEmailRes = await sb.from("admin_settings").select("admin_email").limit(1).maybeSingle();
    const adminEmail = adminEmailRes.data?.admin_email ?? "info@kraftfahrer-mieten.com";

    const vars = {
      "fp.vorname": fp.vorname,
      "fp.nachname": fp.nachname,
      "jr.firma_oder_name": jr.company || jr.customer_name || "",
      "jr.ansprechpartner": jr.customer_name || "",
      "jr.telefon": jr.customer_phone || "",
      "jr.email": jr.customer_email || "",
      "jr.einsatzort": jr.einsatzort || "Siehe Nachricht",
      "jr.fahrzeugtyp": jr.fahrzeugtyp || "",
      "jr.besonderheiten": jr.besonderheiten || "",
      "ja.rate_type": ja.rate_type || "nach Absprache",
      "ja.rate_value": ja.rate_value || "",
      "ja.rate_suffix": ja.rate_type ? (ja.rate_type === "hourly" ? "€/Std" : ja.rate_type === "daily" ? "€/Tag" : "€") : "",
      "einsatz_zeitraum": zeitraum,
      "heute": new Intl.DateTimeFormat("de-DE").format(new Date()),
    };

    // Anzeige für Satz
    const satzAnzeige = withCurrency(typeof ja.rate_value === "number" ? ja.rate_value : undefined);
    const html = render(htmlTpl, { ...vars, "ja.rate_value": satzAnzeige });
    const txt = render(txtTpl, { ...vars, "ja.rate_value": satzAnzeige });

    // PDF bauen (Simple PDF – Text-basiert; falls ihr bereits einen HTML→PDF nutzt, dort einbinden)
    const pdfBytes = await htmlToSimplePdf(html, txt);

    // PDF in private Bucket speichern
    const filePath = `confirmations/assignments/${assignment_id}/driver-confirmation-${new Date().toISOString().slice(0,10)}.pdf`;
    const up = await sb.storage.from("confirmations").upload(filePath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (up.error) {
      // speichern ist nett, aber nicht kritisch für Mailversand → nur loggen
      console.error("PDF upload error", up.error);
    }

    // E-Mail via Resend API senden (TO: Fahrer, BCC: Admin)
    const subject = `Einsatzbestätigung – ${vars["jr.firma_oder_name"]} – ${zeitraum}`;
    const formData = new FormData();
    formData.set("from", MAIL_FROM);
    formData.set("to", fp.email);
    formData.set("bcc", adminEmail);
    formData.set("subject", subject);
    formData.set("html", html);
    formData.set("text", txt);

    // PDF anhängen
    formData.set("attachments", new File([pdfBytes], "Einsatzbestaetigung.pdf", { type: "application/pdf" }));

    const mailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
      body: formData,
    });

    let status: "sent" | "failed" = "sent";
    if (!mailRes.ok) status = "failed";

    // email_log schreiben
    await sb.from("email_log").insert({
      template: "driver_confirmation_v2",
      subject,
      recipient: fp.email,
      status,
      assignment_id,
      job_id: jr.id,
      sent_at: new Date().toISOString(),
    });

    if (!mailRes.ok) {
      const errTxt = await mailRes.text();
      return new Response(JSON.stringify({ ok: false, error: `Mail error: ${errTxt}` }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true, pdf_path: filePath }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false, error: "unexpected error" }), { status: 500 });
  }
});
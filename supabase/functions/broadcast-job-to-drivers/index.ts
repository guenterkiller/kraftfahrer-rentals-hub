// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SR = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MAIL_FROM = Deno.env.get("MAIL_FROM")!;
const ADMIN_TO = Deno.env.get("ADMIN_TO")!;
const INTERNAL_SECRET = Deno.env.get("INTERNAL_FN_SECRET")!;

const supa = createClient(
  SUPABASE_URL,
  SR,
  { global: { headers: { "x-application-name": "broadcast-job-to-drivers" } } }
);

const norm = (s?: string) => (s ?? "").toUpperCase().replaceAll("+", "").replace(/\s+/g, " ").trim();

function matchClass(job: any, fahrerKlassen?: string | null) {
  if (!fahrerKlassen) return false;
  
  const jobType = norm(job?.fahrzeugtyp);
  const jobKlasse = norm(job?.fuehrerscheinklasse);
  const fahrerKls = ` ${norm(fahrerKlassen)} `;
  
  const needsCE = jobType.includes("LKW-CE") || jobKlasse.includes("CE");
  const needsC1E = jobType.includes("LKW-C1E") || jobKlasse.includes("C1E");
  const needsC = jobType.includes("LKW-C") || jobKlasse.includes("C");
  
  if (needsCE) return fahrerKls.includes(" CE ");
  if (needsC1E) return fahrerKls.includes(" C1E ");
  if (needsC) return fahrerKls.includes(" C ");
  
  return true; // Fallback für andere Fahrzeugtypen
}

serve(async (req) => {
  try {
    // Strict Auth
    const secret = Deno.env.get("INTERNAL_FN_SECRET");
    if (!secret || req.headers.get("x-internal-fn") !== secret) {
      return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), { status: 401 });
    }

    // Safe JSON parsing
    let payload: any;
    try {
      payload = await req.json();
    } catch {
      return new Response(JSON.stringify({ ok: false, error: "invalid JSON body" }), { status: 400 });
    }

    const { jobRequestId, job, customer } = payload;
    if (!jobRequestId || !job?.fahrzeugtyp || !customer?.email) {
      return new Response(JSON.stringify({ ok: false, error: "missing fields" }), { status: 400 });
    }

    const { data: jr, error: jrErr } = await supa.from("job_requests").select("*").eq("id", jobRequestId).single();
    if (jrErr) throw jrErr;

    const { data: fahrer, error: dErr } = await supa
      .from("fahrer_profile")
      .select("id,email,vorname,nachname,fuehrerscheinklassen,email_opt_out,status")
      .eq("status", "aktiv")
      .eq("email_opt_out", false);
    if (dErr) throw dErr;

    // Filter candidates by license class
    const candidates = (fahrer ?? []).filter(f => matchClass(job, f.fuehrerscheinklassen));

    let sent = 0, skipped = 0, failed = 0;

    for (const d of candidates) {
      const email = d.email?.trim();
      if (!email) { 
        skipped++; 
        continue; 
      }

      const subject = `NEUER Auftrag: ${job.fahrzeugtyp.toUpperCase()} – ${jr?.zeitraum ?? ""}`;
      const text = [
        `Hallo ${d.vorname ?? "Fahrer/in"},`,
        ``,
        `Neue Kundenanfrage:`,
        `• Fahrzeug: ${job.fahrzeugtyp}`,
        `• Führerscheinklasse: ${job.fuehrerscheinklasse ?? "—"}`,
        `• Zeitraum: ${jr?.zeitraum ?? "—"}`,
        `• Einsatzort: ${jr?.einsatzort ?? "—"}`,
        ``,
        `Kunde: ${customer.name}  |  ${customer.phone ?? ""}  |  ${customer.email}`,
        ``,
        `Interessiert? Antworte direkt auf diese E-Mail (geht an den Kunden).`,
        ``,
        `Abmelden: https://fahrerexpress.de/optout?f=${d.id}`
      ].join("\n");

      try {
        await resend.emails.send({ 
          from: MAIL_FROM, 
          to: [email], 
          subject, 
          text, 
          reply_to: customer.email,
          ...(ADMIN_TO && { bcc: [ADMIN_TO] }) // Optional admin copy
        });
        sent++;
        await supa.from("job_mail_log").insert({ 
          job_request_id: jobRequestId, 
          fahrer_id: d.id, 
          email, 
          status: "sent" 
        });
      } catch (e) {
        failed++;
        const errorMsg = (e && (e as any).message) ? (e as any).message : String(e);
        await supa.from("job_mail_log").insert({ 
          job_request_id: jobRequestId, 
          fahrer_id: d.id, 
          email, 
          status: "failed", 
          error: errorMsg 
        });
        console.error("driver mail failed", email, e);
      }
    }

    return new Response(JSON.stringify({ ok: true, sent, skipped, failed }), { 
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    const msg = (err && (err as any).message) ? (err as any).message : String(err);
    console.error("Broadcast error:", err);
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500 });
  }
});
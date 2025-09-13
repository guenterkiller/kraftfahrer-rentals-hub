// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SR = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MAIL_FROM = Deno.env.get("MAIL_FROM")!;
const INTERNAL_SECRET = Deno.env.get("INTERNAL_FN_SECRET")!;
const sb = createClient(SUPABASE_URL, SR);

function matchClass(jobType: string, classes?: string | null) {
  if (!classes) return false;
  const s = ` ${classes.toUpperCase()} `;
  if (jobType === "lkw-ce")  return s.includes(" CE ");
  if (jobType === "lkw-c1e") return s.includes(" C1E ");
  if (jobType === "lkw-c")   return s.includes(" C ");
  return true;
}

serve(async (req) => {
  try {
    if (req.headers.get("x-internal-fn") !== INTERNAL_SECRET) {
      return new Response(JSON.stringify({ ok:false, error:"unauthorized" }), { status: 401 });
    }

    const { jobRequestId, job, customer } = await req.json();
    if (!jobRequestId || !job?.fahrzeugtyp || !customer?.email) {
      return new Response(JSON.stringify({ ok:false, error:"missing fields" }), { status: 400 });
    }

    const { data: jr, error: jrErr } = await sb.from("job_requests").select("*").eq("id", jobRequestId).single();
    if (jrErr) throw jrErr;

    const { data: drivers, error: dErr } = await sb
      .from("fahrer_profile")
      .select("id,email,vorname,nachname,fuehrerscheinklassen,status,email_opt_out")
      .eq("status","aktiv");
    if (dErr) throw dErr;

    let sent=0, skipped=0, failed=0;

    for (const d of drivers ?? []) {
      const email = d.email?.trim();
      if (!email || d.email_opt_out || !matchClass(job.fahrzeugtyp, d.fuehrerscheinklassen)) { skipped++; continue; }

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
        await resend.emails.send({ from: MAIL_FROM, to:[email], subject, text, reply_to: customer.email });
        sent++;
        await sb.from("job_mail_log").insert({ job_request_id: jobRequestId, fahrer_id: d.id, email, status:"sent" });
      } catch (e) {
        failed++;
        await sb.from("job_mail_log").insert({ job_request_id: jobRequestId, fahrer_id: d.id, email, status:"failed", error:String(e) });
        console.error("driver mail failed", email, e);
      }
    }

    return new Response(JSON.stringify({ ok:true, sent, skipped, failed }), { headers:{ "Content-Type":"application/json" }});
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok:false, error:String(e) }), { status:500 });
  }
});
// Verbindliche Fahrerannahme (purpose = 'binding') – getrennt vom Interessens-Ablauf.
import { Resend } from "https://esm.sh/resend@4.0.0";
import {
  BINDING_CONSENT_TEXT,
  DRIVER_CONTRACT_VERSION,
  buildDriverContractSections,
  buildDriverContractText,
  normalizeCommissionPct,
} from "../_shared/driver-contract-terms.ts";
import {
  checkBindingInvite,
  formatEur,
  rateUnitLabel,
  sha256Hex,
  stableStringify,
} from "../_shared/binding-acceptance.ts";
import { buildBindingAcceptancePdf } from "../_shared/binding-acceptance-pdf.ts";

import { AGENCY, notifyAgency } from "../_shared/binding-acceptance-mail.ts";
export { notifyAgency };

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Identische Formatierung wie in der Zuteilungs-E-Mail (send-driver-confirmation):
// gespeicherter Wert ohne Zeitzonenumrechnung (UTC = Laufzeitzone der Zuteilungs-E-Mail).
const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleString("de-DE", { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null;

export function buildJobLines(job: any, assignment: any): [string, string][] {
  const address = [job?.customer_street, job?.customer_house_number].filter(Boolean).join(" ");
  const city = [job?.customer_postal_code, job?.customer_city].filter(Boolean).join(" ");
  const besteller = [job?.company || job?.customer_name, [address, city].filter(Boolean).join(", ")].filter(Boolean).join(" – ");
  const start = fmtDate(assignment?.start_date), end = fmtDate(assignment?.end_date);
  const zeitraum = start && end ? `${start} – ${end}` : start ? `ab ${start}` : (job?.zeitraum || "nach Absprache");
  const rate = assignment?.rate_value != null && Number(assignment.rate_value) > 0
    ? `${formatEur(Number(assignment.rate_value))} netto je ${rateUnitLabel(assignment.rate_type)} zzgl. gesetzlicher USt`
    : "nach Vereinbarung";
  return [
    ["Besteller", besteller || "–"],
    ["Einsatzort", job?.einsatzort || "–"],
    ["Tätigkeit / Fahrzeug", job?.fahrzeugtyp || "–"],
    ["Einsatztätigkeiten und Anforderungen", job?.nachricht || "–"],
    ["Einsatzbeginn und -dauer", zeitraum],
    ["Vereinbarte Vergütung", rate],
    ["Zuschläge", "Samstag 25 %, Sonn- und Feiertag 50 %"],
  ];
}

type Ctx = {
  supabase: any;
  invite: any;
  intent: string | null;
  action: string | null;
  consentConfirmed: boolean;
  checkboxText: string | null;
  ip: string;
  userAgent: string;
  json: (payload: unknown, status?: number) => Response;
};

export async function handleBinding(ctx: Ctx): Promise<Response> {
  const { supabase, invite, json } = ctx;
  const { data: assignment } = await supabase
    .from("job_assignments")
    .select("id, job_id, driver_id, status, rate_type, rate_value, start_date, end_date, commission_pct, updated_at")
    .eq("id", invite.assignment_id)
    .maybeSingle();

  const now = new Date();
  let check = checkBindingInvite(invite, assignment, now);
  // Konditionen nach Linkversand geändert → Link ungültig
  if (check === "ok" && assignment && new Date(assignment.updated_at).getTime() > new Date(invite.created_at).getTime() + 2000) {
    check = "invalid";
  }
  if (check !== "ok") return json({ status: check === "cancelled" ? "invalid" : check, mode: "binding" });

  const job = invite.job;
  const driver = invite.driver;
  const commission = normalizeCommissionPct(assignment.commission_pct);
  const jobLines = buildJobLines(job, assignment);

  if (ctx.intent === "load") {
    return json({
      status: "ready",
      mode: "binding",
      contract_version: DRIVER_CONTRACT_VERSION,
      commission_pct: commission,
      contract_sections: buildDriverContractSections(commission),
      consent_text: BINDING_CONSENT_TEXT,
      job_lines: jobLines,
      expires_at: invite.token_expires_at,
      driver: driver ? { vorname: driver.vorname, nachname: driver.nachname } : null,
    });
  }

  if (ctx.action !== "accept" && ctx.action !== "decline") return json({ status: "invalid", mode: "binding" });

  if (ctx.action === "accept" && (!ctx.consentConfirmed || ctx.checkboxText !== BINDING_CONSENT_TEXT)) {
    return json({ status: "consent_required", mode: "binding" }, 400);
  }

  // Atomarer Claim: nur ein Aufruf kann den Link von pending wechseln
  const newStatus = ctx.action === "accept" ? "accepted" : "declined";
  const respondedAt = now.toISOString();
  const { data: claimed } = await supabase
    .from("assignment_invites")
    .update({ status: newStatus, responded_at: respondedAt, ip: ctx.ip || null, user_agent: ctx.userAgent || null })
    .eq("id", invite.id)
    .eq("status", "pending")
    .select("id");
  if (!claimed || claimed.length === 0) return json({ status: "already_answered", mode: "binding" });

  const driverName = `${driver?.vorname ?? ""} ${driver?.nachname ?? ""}`.trim();
  const acceptedAtLocal = now.toLocaleString("de-DE", { timeZone: "Europe/Berlin" });

  if (newStatus === "declined") {
    await notifyAgency(supabase, {
      subject: `Fahrer lehnt verbindliche Annahme ab – ${job?.einsatzort ?? ""}`,
      html: `<p><strong>${esc(driverName)}</strong> hat die verbindliche Annahme der Zuteilung abgelehnt (${esc(acceptedAtLocal)}).</p>
             <p>Auftrag: ${esc(job?.einsatzort)} · ${esc(job?.zeitraum)}<br/>Zuteilung: ${esc(assignment.id)}</p>
             <p>Keine automatische Neuzuteilung – bitte im Admin-Bereich entscheiden.</p>`,
      jobId: assignment.job_id, assignmentId: assignment.id, template: "admin_binding_declined",
    });
    return json({ status: "declined", mode: "binding" });
  }

  const contractText = buildDriverContractText(commission);
  const snapshot = {
    captured_at: respondedAt,
    flow: "binding",
    invite_id: invite.id,
    assignment: {
      id: assignment.id, rate_type: assignment.rate_type, rate_value: assignment.rate_value,
      start_date: assignment.start_date, end_date: assignment.end_date, commission_pct: commission,
    },
    job: {
      id: job?.id, customer_name: job?.customer_name, company: job?.company,
      customer_street: job?.customer_street, customer_house_number: job?.customer_house_number,
      customer_postal_code: job?.customer_postal_code, customer_city: job?.customer_city,
      einsatzort: job?.einsatzort, zeitraum: job?.zeitraum, fahrzeugtyp: job?.fahrzeugtyp,
      nachricht: job?.nachricht, besonderheiten: job?.besonderheiten,
    },
    job_lines: jobLines,
  };
  const contentHash = await sha256Hex(stableStringify({
    driver_id: invite.driver_id, job_id: assignment.job_id, assignment_id: assignment.id,
    accepted_at: respondedAt, contract_version: DRIVER_CONTRACT_VERSION, commission_pct: commission,
    contract_text: contractText, consent_text: BINDING_CONSENT_TEXT, snapshot,
  }));

  const { data: acc, error: accErr } = await supabase
    .from("job_driver_acceptances")
    .insert({
      job_id: assignment.job_id, driver_id: invite.driver_id, invite_id: invite.id, assignment_id: assignment.id,
      billing_model: "agency", accepted_at: respondedAt, ip: ctx.ip || null, user_agent: ctx.userAgent || null,
      terms_version: DRIVER_CONTRACT_VERSION, contract_version: DRIVER_CONTRACT_VERSION, contract_text: contractText,
      commission_pct: commission, checkbox_text: BINDING_CONSENT_TEXT, consent_confirmed: true,
      job_snapshot: snapshot, content_hash: contentHash, flow: "binding",
    })
    .select("id")
    .single();

  if (accErr || !acc) {
    console.error("binding acceptance insert failed:", accErr);
    // Claim zurücknehmen, damit der Fahrer es erneut versuchen kann
    await supabase.from("assignment_invites").update({ status: "pending", responded_at: null }).eq("id", invite.id);
    return json({ status: "error", mode: "binding" }, 500);
  }

  // PDF erzeugen, ablegen, versenden (Fehler hier machen die Annahme nicht ungültig)
  try {
    const pdf = await buildBindingAcceptancePdf({
      acceptedAtLocal, driverName, driverId: invite.driver_id, jobId: assignment.job_id, assignmentId: assignment.id,
      contractVersion: DRIVER_CONTRACT_VERSION, commissionPct: commission, jobLines, contractText,
      consentText: BINDING_CONSENT_TEXT, contentHash,
    });
    const path = `binding/${assignment.id}/${acc.id}.pdf`;
    const { error: upErr } = await supabase.storage.from("confirmations").upload(path, pdf, { contentType: "application/pdf", upsert: false });
    if (!upErr) await supabase.from("job_driver_acceptances").update({ pdf_path: path }).eq("id", acc.id);
    else console.error("PDF upload failed:", upErr);

    const b64 = btoa(Array.from(pdf, (b) => String.fromCharCode(b)).join(""));
    const html = confirmationHtml(driverName, acceptedAtLocal, jobLines, contractText, contentHash, commission);
    const subject = `Annahmebestätigung – verbindliche Auftragsannahme – ${job?.einsatzort ?? "Auftrag"}`;
    const key = Deno.env.get("RESEND_API_KEY");
    if (key && driver?.email) {
      const resend = new Resend(key);
      const { data: m, error: mErr } = await resend.emails.send({
        from: "Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>",
        to: [driver.email], bcc: [AGENCY], subject, html,
        attachments: [{ filename: `Annahmebestaetigung-${assignment.id.slice(0, 8)}.pdf`, content: b64 }],
      });
      await supabase.from("email_log").insert({
        job_id: assignment.job_id, assignment_id: assignment.id, recipient: driver.email, subject,
        template: "driver_binding_acceptance", status: mErr ? "error" : "sent",
        error_message: mErr ? JSON.stringify(mErr) : null, message_id: (m as any)?.id ?? null,
        sent_at: mErr ? null : new Date().toISOString(), delivery_mode: "both", pdf_path: upErr ? null : path,
      });
    }
  } catch (e) {
    console.error("binding confirmation mail/pdf error:", e);
  }

  return json({ status: "accepted", mode: "binding", accepted_at: respondedAt, content_hash: contentHash });
}

function confirmationHtml(name: string, at: string, lines: [string, string][], contract: string, hash: string, pct: number) {
  const rows = lines.map(([k, v]) => `<p style="margin:3px 0;font-size:14px;"><strong>${esc(k)}:</strong> ${esc(v)}</p>`).join("");
  const contractHtml = contract.split("\n\n").map((b) => {
    const [t, ...r] = b.split("\n");
    return `<p style="margin:12px 0 4px;font-size:14px;"><strong>${esc(t)}</strong></p>${r.map((p) => `<p style="margin:2px 0;font-size:13px;line-height:1.55;">${esc(p)}</p>`).join("")}`;
  }).join("");
  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;color:#1f2937;">
    <h2 style="color:#0d2340;margin:0 0 8px;">Annahmebestätigung</h2>
    <p>Hallo ${esc(name)},</p>
    <p>Sie haben den folgenden Auftrag am <strong>${esc(at)}</strong> über Ihren persönlichen Bestätigungslink zu den unten aufgeführten Bedingungen verbindlich angenommen (Provisionssatz ${pct} %).</p>
    <h3 style="color:#0d2340;">Auftragsdaten</h3>${rows}
    <h3 style="color:#0d2340;">Vertragsbedingungen</h3>${contractHtml}
    <h3 style="color:#0d2340;">Zustimmungserklärung</h3><p style="font-size:13px;">${esc(BINDING_CONSENT_TEXT)}</p>
    <p style="font-size:12px;color:#6b7280;margin-top:16px;">Die vollständige Bestätigung liegt als PDF bei. Digitaler Fingerabdruck: ${esc(hash)}</p>
    <p style="font-size:14px;">Viele Grüße<br/>Fahrerexpress | kraftfahrer-mieten.com</p></div>`;
}

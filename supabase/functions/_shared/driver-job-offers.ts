// Automatische, unverbindliche Interessenangebote nach Freischaltung und Vertragsannahme.
// Ausschließlich serverseitig verwenden: der stabile Token ist zugleich die atomare
// Einladungssperre (vorhandener UNIQUE-Index) und der Idempotency-Key des Providers.
import { selectOfferableJobs, MAX_INVITES } from "./driver-job-matching.ts";
import { isDriverActive } from "./job-release.ts";
import { MEDIATION_CONTRACT_VERSION } from "./driver-mediation-contract.ts";
import { interpretSendResult } from "./mail-delivery.ts";

// deno-lint-ignore no-explicit-any
type Any = any;

export type DriverJobOfferResult = {
  jobs: Any[];
  validJobs: Any[];
  matchingJobs: Any[];
  unclearJobs: Array<{ id: string; zeitraum: string; reason: string }>;
  invitesCreated: number;
  invitesSent: number;
  skippedDuplicate: number;
  skippedExpired: number;
  skippedNoMatch: number;
  skippedAssigned: number;
  failed: number;
};

const INVITE_TEMPLATE = "driver_job_invite_post_approval";

async function stableInterestToken(secret: string, driverId: string, jobId: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`interest-offer-v1:${driverId}:${jobId}`),
  );
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 48);
}

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inviteHtml(driver: Any, job: Any, token: string, siteBase: string): { subject: string; html: string } {
  const acceptLink = `${siteBase}/fahrer-antwort-bestaetigen?action=accept&token=${encodeURIComponent(token)}`;
  const declineLink = `${siteBase}/fahrer-antwort-bestaetigen?action=decline&token=${encodeURIComponent(token)}`;
  const subject = `Auftragsangebot: ${job.fahrzeugtyp} – ${job.einsatzort}`;
  const nl2br = (value: unknown) => escapeHtml(value).replace(/\n/g, "<br/>");
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;">
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;padding:24px;">
      <h2 style="color:#1f2937;margin:0 0 16px 0;">Unverbindliches Auftragsangebot</h2>
      <p style="color:#111827;font-size:15px;">Hallo ${escapeHtml(driver.vorname || "")},</p>
      <p style="color:#111827;font-size:15px;">für Sie liegt ein passendes Fahrergesuch vor. Ihre Rückmeldung ist eine unverbindliche Interessenbekundung.</p>
      <h3 style="color:#1f2937;font-size:16px;margin:24px 0 8px 0;">Einsatzdetails</h3>
      <table role="presentation" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;width:100%;">
        <tr><td style="padding:6px 0;color:#374151;font-size:14px;"><strong>Einsatzort:</strong> ${escapeHtml(job.einsatzort || "-")}</td></tr>
        <tr><td style="padding:6px 0;color:#374151;font-size:14px;"><strong>Zeitraum:</strong> ${escapeHtml(job.zeitraum || "-")}</td></tr>
        <tr><td style="padding:6px 0;color:#374151;font-size:14px;"><strong>Fahrzeugtyp:</strong> ${escapeHtml(job.fahrzeugtyp || "-")}</td></tr>
        <tr><td style="padding:6px 0;color:#374151;font-size:14px;"><strong>Führerschein:</strong> ${escapeHtml(job.fuehrerscheinklasse || "-")}</td></tr>
        ${job.besonderheiten ? `<tr><td style="padding:6px 0;color:#374151;font-size:14px;"><strong>Besonderheiten:</strong> ${escapeHtml(job.besonderheiten)}</td></tr>` : ""}
      </table>
      ${job.nachricht ? `<h3 style="color:#1f2937;font-size:16px;margin:24px 0 8px 0;">Aufgabenbeschreibung laut Auftrag</h3><div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;color:#374151;font-size:14px;line-height:1.5;">${nl2br(job.nachricht)}</div>` : ""}
      <h3 style="color:#1f2937;font-size:16px;margin:28px 0 12px 0;">Ihre unverbindliche Rückmeldung</h3>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px 0;"><tr>
        <td style="padding:6px 0;"><a href="${acceptLink}" style="background:#10b981;color:#ffffff;padding:14px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600;font-size:15px;min-width:240px;text-align:center;">Ich habe Interesse an diesem Auftrag</a></td>
      </tr><tr><td style="padding:6px 0;"><a href="${declineLink}" style="background:#6b7280;color:#ffffff;padding:14px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600;font-size:15px;min-width:240px;text-align:center;">Ich habe kein Interesse</a></td></tr></table>
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:12px 16px;margin:20px 0;color:#92400e;font-size:14px;"><strong>Hinweis:</strong> Ihre Rückmeldung dient ausschließlich der Verfügbarkeitsprüfung und ist keine verbindliche Auftragsannahme. Ein persönliches verbindliches Angebot mit vereinbarter Vergütung erhalten Sie erst nach einer Zuteilung durch Fahrerexpress.</div>
      <p style="color:#6b7280;font-size:13px;margin:16px 0;">Diese Links sind 48 Stunden gültig.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;"/>
      <p style="color:#374151;font-size:13px;margin:0;"><strong>Rückfragen:</strong><br/>Telefon: +49 1577 1442285<br/>E-Mail: info@kraftfahrer-mieten.com</p>
    </div></body></html>`;
  return { subject, html };
}

async function insertMailLog(supabase: Any, value: Any): Promise<string | null> {
  const { error } = await supabase.from("email_log").insert(value);
  return error ? String(error.message ?? error) : null;
}

/**
 * Versendet höchstens fünf allgemeine Interessenangebote an genau diesen Fahrer.
 * Keine Freischaltungs- oder Administrator-Mail und keine verbindliche Zuteilung.
 */
export async function dispatchDriverJobOffers(input: {
  supabase: Any;
  resend: Any;
  driver: Any;
  mailFrom: string;
  mailReplyTo: string;
  tokenSecret: string;
  siteBase?: string;
}): Promise<DriverJobOfferResult> {
  const { supabase, resend, driver } = input;
  const fromAddress = input.mailFrom.split("<").pop()?.replace(/[<>]/g, "") ?? input.mailFrom;
  if (!/@kraftfahrer-mieten\.com$/i.test(fromAddress.trim())) {
    throw new Error("MAIL_FROM verwendet keine freigegebene Absenderdomain; kein Versand");
  }
  const empty: DriverJobOfferResult = {
    jobs: [], validJobs: [], matchingJobs: [], unclearJobs: [], invitesCreated: 0,
    invitesSent: 0, skippedDuplicate: 0, skippedExpired: 0, skippedNoMatch: 0,
    skippedAssigned: 0, failed: 0,
  };
  if (!isDriverActive(driver) || driver.email_opt_out === true || !driver.email) return empty;
  if (!input.tokenSecret) throw new Error("Kein serverseitiges Token-Geheimnis konfiguriert; kein Versand");

  const { data: accepted, error: acceptedError } = await supabase
    .from("driver_contract_decisions").select("id")
    .eq("driver_id", driver.id).eq("decision", "accept")
    .eq("contract_version", MEDIATION_CONTRACT_VERSION).maybeSingle();
  if (acceptedError) throw new Error("Vertragsannahme konnte nicht geprüft werden; kein Versand");
  if (!accepted) return empty;

  // Das Erfassungsalter ist kein Ablaufkriterium: der Einsatzzeitraum entscheidet.
  const { data: jobs, error: jobsError } = await supabase.from("job_requests").select("*")
    .in("status", ["open", "sent", "pending", "approved"])
    .not("approved_at", "is", null)
    .order("created_at", { ascending: false }).limit(100);
  if (jobsError) throw new Error(`Offene Aufträge konnten nicht gelesen werden: ${jobsError.message ?? jobsError}`);

  const selection = selectOfferableJobs(driver, jobs ?? []);
  let matchingJobs = selection.matchingJobs;
  let skippedAssigned = 0;
  if (matchingJobs.length > 0) {
    const { data: assignments, error: assignmentError } = await supabase.from("job_assignments")
      .select("job_id").in("job_id", matchingJobs.map((job: Any) => job.id))
      .in("status", ["assigned", "confirmed"]);
    if (assignmentError) throw new Error(`Zuteilungen konnten nicht geprüft werden: ${assignmentError.message ?? assignmentError}`);
    const assigned = new Set((assignments ?? []).map((row: Any) => row.job_id));
    matchingJobs = matchingJobs.filter((job: Any) => !assigned.has(job.id));
    skippedAssigned = selection.matchingJobs.length - matchingJobs.length;
  }

  const result: DriverJobOfferResult = {
    ...empty, jobs: jobs ?? [], validJobs: selection.validJobs, matchingJobs,
    unclearJobs: selection.unclearJobs, skippedExpired: selection.skippedExpired,
    skippedNoMatch: selection.skippedNoMatch, skippedAssigned,
  };
  let attempted = 0;

  for (const job of matchingJobs) {
    if (attempted >= MAX_INVITES) break;
    const { data: existing, error: existingError } = await supabase.from("assignment_invites")
      .select("id, token, status, token_expires_at, responded_at")
      .eq("job_id", job.id).eq("driver_id", driver.id)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (existingError) throw new Error(`Einladung konnte nicht geprüft werden: ${existingError.message ?? existingError}`);

    let invite = existing;
    if (invite) {
      result.skippedDuplicate++;
      const usable = invite.status === "pending" && !invite.responded_at &&
        new Date(invite.token_expires_at).getTime() > Date.now();
      if (!usable) continue;
    } else {
      const token = await stableInterestToken(input.tokenSecret, driver.id, job.id);
      const row = {
        job_id: job.id, driver_id: driver.id, token,
        token_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        status: "pending", purpose: "interest",
      };
      const { error: insertError } = await supabase.from("assignment_invites").insert(row);
      if (insertError) {
        if (insertError.code !== "23505") {
          result.failed++;
          await insertMailLog(supabase, {
            recipient: driver.email, subject: `Auftragsangebot: ${job.fahrzeugtyp} – ${job.einsatzort}`,
            template: INVITE_TEMPLATE, status: "failed", job_id: job.id,
            error_message: `Einladung nicht gespeichert: ${insertError.message ?? insertError}`, delivery_mode: "inline",
          });
          continue;
        }
        const { data: claimed, error: claimError } = await supabase.from("assignment_invites")
          .select("id, token, status, token_expires_at, responded_at").eq("token", token).maybeSingle();
        if (claimError || !claimed) throw new Error("Parallele Einladung konnte nicht gelesen werden; kein Versand");
        invite = claimed;
        result.skippedDuplicate++;
      } else {
        invite = row;
        result.invitesCreated++;
      }
    }

    attempted++;
    const { data: sentLog, error: sentLogError } = await supabase.from("email_log").select("id")
      .eq("recipient", driver.email).eq("template", INVITE_TEMPLATE).eq("job_id", job.id)
      .eq("status", "sent").not("message_id", "is", null).limit(1).maybeSingle();
    if (sentLogError) {
      result.failed++;
      console.error("Versandstatus nicht prüfbar; kein Versand", sentLogError);
      continue;
    }
    if (sentLog) continue;

    const { subject, html } = inviteHtml(driver, job, invite.token, input.siteBase ?? "https://www.kraftfahrer-mieten.com");
    let delivery;
    try {
      const headers = new Headers(resend.headers ?? undefined);
      headers.set("Idempotency-Key", `driver-interest/${invite.token}`);
      delivery = interpretSendResult(await resend.emails.send({
        from: input.mailFrom, to: [driver.email], reply_to: input.mailReplyTo, subject, html,
      }, { headers }));
    } catch (error) {
      delivery = { ok: false as const, error: error instanceof Error ? error.message : String(error) };
    }

    const logError = await insertMailLog(supabase, {
      recipient: driver.email, subject, template: INVITE_TEMPLATE,
      status: delivery.ok ? "sent" : "failed", message_id: delivery.ok ? delivery.messageId : null,
      sent_at: delivery.ok ? new Date().toISOString() : null,
      error_message: delivery.ok ? null : delivery.error, job_id: job.id, delivery_mode: "inline",
    });
    if (delivery.ok) result.invitesSent++;
    if (!delivery.ok || logError) {
      result.failed++;
      if (logError) console.error("Versandprotokoll fehlgeschlagen; Wiederholung nutzt denselben Provider-Schlüssel", logError);
    }
  }
  return result;
}

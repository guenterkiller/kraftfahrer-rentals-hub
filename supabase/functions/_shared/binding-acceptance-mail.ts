import { Resend } from "https://esm.sh/resend@4.0.0";

export const AGENCY = "info@kraftfahrer-mieten.com";

export async function notifyAgency(supabase: any, o: { subject: string; html: string; jobId: string; assignmentId: string; template: string }) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return false;
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from: Deno.env.get("MAIL_FROM") || "Kraftfahrer-Mieten <noreply@kraftfahrer-mieten.com>",
    to: [AGENCY], subject: o.subject, html: `<div style="font-family:Arial,sans-serif;max-width:600px;">${o.html}</div>`,
  });
  await supabase.from("email_log").insert({
    job_id: o.jobId, assignment_id: o.assignmentId, recipient: AGENCY, subject: o.subject, template: o.template,
    status: error ? "error" : "sent", error_message: error ? JSON.stringify(error) : null,
    message_id: (data as any)?.id ?? null, sent_at: error ? null : new Date().toISOString(), delivery_mode: "inline",
  });
  return !error;
}

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { Resend } from 'npm:resend@6.1.2';
import { verifyAdminAuth } from '../_shared/admin-auth.ts';
import { wrapDriverEmailHtml } from '../_shared/email-templates/driver-html-shell.ts';
import { cancellationTemplates, invitationTemplates, deliverCancellations, normalizeEmail, type Driver } from './cancellation.ts';

const schema = z.object({ jobId: z.string().uuid(), reason: z.string().trim().min(1).max(2000) }).strict();
const driverFields = 'id,vorname,nachname,email,status,is_blocked,is_inactive,email_opt_out';
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Nur POST erlaubt' }, 405);
  let cancelled = false;
  try {
    const auth = await verifyAdminAuth(req);
    if (!auth.success) return new Response(await auth.response.text(), {
      status: auth.response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: 'Auftrags-ID und Stornierungsgrund sind erforderlich.', details: parsed.error.flatten().fieldErrors }, 400);
    const { jobId, reason } = parsed.data;
    const { supabase, user } = auth;
    const { data: job, error: jobError } = await supabase.from('job_requests').select('id,status,einsatzort,zeitraum').eq('id', jobId).maybeSingle();
    if (jobError) throw jobError;
    if (!job) return json({ error: 'Auftrag nicht gefunden' }, 404);
    if (job.status === 'cancelled') return json({ success: true, alreadyCancelled: true, sent: 0, failed: 0, skipped: 0, alreadySent: 0 });
    if (['completed', 'rejected'].includes(job.status)) return json({ error: 'Erledigte oder abgelehnte Aufträge können nicht storniert werden.' }, 409);

    // Use precisely the existing direct Resend secret; never create or substitute a key.
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ error: 'Bestehender RESEND_API_KEY ist im Funktionsserver nicht verfügbar.' }, 500);
    const resend = new Resend(apiKey);
    // Paginate every source: never silently drop recipients at Supabase's 1000-row cap.
    async function allRows<T>(query: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
      const rows: T[] = [];
      for (let from = 0; ; from += 500) {
        const result = await query(from, from + 499);
        if (result.error) throw result.error;
        const page = result.data ?? [];
        rows.push(...page);
        if (page.length < 500) return rows;
      }
    }
    const [assignments, invites, previousMails] = await Promise.all([
      allRows<{ id: string; driver_id: string; status: string }>((from, to) => supabase.from('job_assignments').select('id,driver_id,status').eq('job_id', jobId).order('id').range(from, to)),
      allRows<{ driver_id: string }>((from, to) => supabase.from('assignment_invites').select('driver_id').eq('job_id', jobId).order('id').range(from, to)),
      allRows<{ recipient: string }>((from, to) => supabase.from('email_log').select('recipient').eq('job_id', jobId).eq('status', 'sent').in('template', invitationTemplates).order('id').range(from, to)),
    ]);
    const activeAssignments = assignments.filter(a => ['assigned', 'confirmed'].includes(a.status));
    const assignedIds = new Set(activeAssignments.map(a => a.driver_id));
    const candidateIds = new Set([...assignments.map(a => a.driver_id), ...invites.map(i => i.driver_id)]);
    const priorAddresses = new Set(previousMails.map(m => normalizeEmail(m.recipient)));
    const profiles = await allRows<Driver>((from, to) => supabase.from('fahrer_profile').select(driverFields).order('id').range(from, to));
    const candidates = profiles.filter(d => candidateIds.has(d.id) || priorAddresses.has(normalizeEmail(d.email)));

    // Compare-and-set claims a fresh cancellation; concurrent/double clicks cannot send twice.
    const now = new Date().toISOString();
    const { data: claimed, error: claimError } = await supabase.from('job_requests').update({ status: 'cancelled', updated_at: now }).eq('id', jobId).eq('status', job.status).select('id');
    if (claimError) throw claimError;
    if (!claimed?.length) return json({ error: 'Auftragsstatus wurde zwischenzeitlich geändert. Bitte neu laden.' }, 409);
    cancelled = true;
    const { error: actionError } = await supabase.from('admin_actions').insert({ action: 'job_cancelled', job_id: jobId, admin_email: user.email, note: reason });
    if (actionError) throw actionError;
    if (activeAssignments.length) {
      const { error } = await supabase.from('job_assignments').update({ status: 'cancelled', cancelled_at: now, cancelled_reason: reason, updated_at: now }).eq('job_id', jobId).in('status', ['assigned', 'confirmed']);
      if (error) throw error;
    }
    // Final parent write comes AFTER assignment transitions; read back before any mail.
    const { data: finalJob, error: finalError } = await supabase.from('job_requests').update({ status: 'cancelled', updated_at: now }).eq('id', jobId).select('status').single();
    if (finalError || finalJob?.status !== 'cancelled') throw finalError ?? new Error('Stornierter Status konnte nicht bestätigt werden');
    const { data: remaining, error: remainingError } = await supabase.from('job_assignments').select('id').eq('job_id', jobId).in('status', ['assigned', 'confirmed']).limit(1);
    if (remainingError || remaining?.length) throw remainingError ?? new Error('Es bestehen weiterhin aktive Zuweisungen. Keine Mail versendet.');

    const counts = await deliverCancellations(candidates, assignedIds, job, {
      refresh: async id => {
        const { data, error } = await supabase.from('fahrer_profile').select(driverFields).eq('id', id).maybeSingle();
        if (error) throw error;
        return data as Driver | null;
      },
      alreadySent: async email => {
        const { data, error } = await supabase.from('email_log').select('id').eq('job_id', jobId).ilike('recipient', email).in('template', cancellationTemplates).eq('status', 'sent').limit(1);
        if (error) throw error;
        return Boolean(data?.length);
      },
      send: async (driver, mail) => {
        const { data, error } = await resend.emails.send({
          from: Deno.env.get('MAIL_FROM') || 'Kraftfahrer-Mieten <noreply@kraftfahrer-mieten.com>',
          replyTo: Deno.env.get('MAIL_REPLY_TO') || 'info@kraftfahrer-mieten.com',
          to: [driver.email], subject: mail.subject, text: mail.text,
          html: wrapDriverEmailHtml(mail.html, { subject: mail.subject, showUnsubscribe: false }),
        }, { idempotencyKey: `job-cancelled/${jobId}/${driver.email}` });
        if (error) throw new Error(error.message);
        return data?.id ?? null;
      },
      log: async (driver, mail, status, errorMessage, messageId) => {
        if (status === 'skipped') {
          const { error } = await supabase.from('admin_actions').insert({
            action: 'job_cancellation_recipient_skipped', job_id: jobId, admin_email: user.email,
            note: JSON.stringify({ driver_id: driver.id, reason: errorMessage }),
          });
          if (error) throw error;
          return;
        }
        const { error } = await supabase.from('email_log').insert({
          job_id: jobId, assignment_id: activeAssignments.find(a => a.driver_id === driver.id)?.id ?? null,
          recipient: normalizeEmail(driver.email), subject: mail.subject, template: mail.template,
          status: status === 'failed' ? 'error' : 'sent',
          error_message: errorMessage ?? null, message_id: messageId ?? null,
          sent_at: status === 'sent' ? new Date().toISOString() : null,
        });
        if (error) throw error;
      },
      pause: () => new Promise(resolve => setTimeout(resolve, 1000)),
    });
    const { error: summaryError } = await supabase.from('admin_actions').insert({ action: 'job_cancellation_mail_completed', job_id: jobId, admin_email: user.email, note: JSON.stringify(counts) });
    if (summaryError) throw summaryError;
    return json({ success: true, ...counts });
  } catch (error) {
    console.error('admin-cancel-job:', error instanceof Error ? error.message : 'Unbekannter Fehler');
    return json({ success: false, cancelled, error: cancelled ? 'Auftrag ist storniert, aber Verarbeitung oder Mailversand ist unvollständig. Bitte Protokoll prüfen.' : 'Stornierung fehlgeschlagen.' }, 500);
  }
});
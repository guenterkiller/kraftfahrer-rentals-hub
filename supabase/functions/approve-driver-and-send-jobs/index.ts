import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { driverMayReceiveOffers } from '../_shared/driver-contract-gate.ts';
import { Resend } from "npm:resend@2.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { DriverApprovalEmail } from './_templates/driver-approval-email.tsx';
import { selectOfferableJobs, inviteDecision, MAX_INVITES } from './matching.ts';
import { makeDriverUnsubscribeToken, buildDriverUnsubscribeUrl } from '../_shared/driver-unsubscribe-token.ts';
import { AdminDriverApprovalNotification } from './_templates/admin-driver-approval-notification.tsx';
import { 
  verifyAdminAuth, 
  createCorsHeaders, 
  handleCorsPreflightRequest,
  createErrorResponse,
  logAdminAction 
} from "../_shared/admin-auth.ts";

function randomToken(len = 48): string {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => ("0" + b.toString(16)).slice(-2)).join("").slice(0, len);
}


serve(async (req) => {
  const corsHeaders = createCorsHeaders();
  
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(corsHeaders);
  }

  try {
    console.log('🚀 approve-driver-and-send-jobs v3.0-shared-auth called');
    
    // Verify admin authentication using shared helper
    const authResult = await verifyAdminAuth(req);
    if (!authResult.success) {
      return authResult.response;
    }
    const { user, supabase } = authResult;

    // Runtime guard for MAIL_FROM domain
    const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "info@kraftfahrer-mieten.com";
    const addr = MAIL_FROM.split('<').pop()?.replace(/[<>]/g,'') ?? MAIL_FROM;
    if (!/@kraftfahrer-mieten\.com$/i.test(addr.trim())) {
      throw new Error(`MAIL_FROM uses unverified domain: ${MAIL_FROM}`);
    }
    
    // Parse request body to get driverId
    const { driverId }: { driverId?: string } = await req.json();
    
    console.log('👤 Driver ID to approve:', driverId);

    if (!driverId) {
      console.error('❌ Missing driver ID');
      return createErrorResponse('Driver ID is required', 400, corsHeaders);
    }

    // Initialize Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // 1. Get driver details
    const { data: driver, error: driverError } = await supabase
      .from('fahrer_profile')
      .select('*')
      .eq('id', driverId)
      .single();

    if (driverError || !driver) {
      console.error('❌ Driver not found:', driverError);
      return createErrorResponse('Driver not found', 404, corsHeaders);
    }

    console.log('👤 Driver found:', driver.vorname, driver.nachname);

    // Stichtagsschalter Vermittlungsvertrag (aus = unverändert)
    if (!(await driverMayReceiveOffers(supabase, driverId))) {
      return createErrorResponse('Vermittlungsvertrag noch nicht angenommen', 409, corsHeaders);
    }

    // 2. Update driver status to 'approved'
    const { error: updateError } = await supabase
      .from('fahrer_profile')
      .update({ status: 'approved' })
      .eq('id', driverId);

    if (updateError) {
      console.error('❌ Failed to update driver status:', updateError);
      return createErrorResponse('Failed to update driver status', 500, corsHeaders);
    }

    console.log('✅ Driver status updated to approved');

    // 3. Get recent open/sent/pending jobs (last 60 days created window — date check via zeitraum)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const OPEN_STATUSES = ['open', 'sent', 'pending', 'approved'];
    const { data: jobs, error: jobsError } = await supabase
      .from('job_requests')
      .select('*')
      .in('status', OPEN_STATUSES)
      .not('approved_at', 'is', null)
      .gte('created_at', sixtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (jobsError) {
      console.error('❌ Failed to fetch jobs:', jobsError);
    }

    console.log('📋 Found jobs:', jobs?.length || 0);

    // 3b. Freigabe, Zeitraum und Führerscheinklasse (reine Regeln in matching.ts)
    const { validJobs, matchingJobs, skippedExpired, skippedNoMatch, unclearJobs } =
      selectOfferableJobs(driver, jobs || []);
    console.log(`🎯 Valid jobs: ${validJobs.length}/${jobs?.length || 0} – matching: ${matchingJobs.length} (skippedExpired=${skippedExpired}, skippedNoMatch=${skippedNoMatch})`);

    // 3c. Create assignment_invites for each matching job (skip if invite already exists)
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const invitesToSend: Array<{ job: any; token: string }> = [];
    let skippedDuplicate = 0;
    for (const job of matchingJobs) {
      const { data: existing } = await supabase
        .from('assignment_invites')
        .select('id, status')
        .eq('job_id', job.id)
        .eq('driver_id', driver.id)
        .limit(1)
        .maybeSingle();

      const decision = inviteDecision(existing, invitesToSend.length);
      if (decision === 'limit') break;
      if (decision === 'duplicate') {
        console.log(`↩️  Invite already exists for job ${job.id} (status=${existing?.status}) – skipping`);
        skippedDuplicate++;
        continue;
      }

      const token = randomToken(48);
      const expires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      const { error: insErr } = await supabase
        .from('assignment_invites')
        .insert({
          job_id: job.id,
          driver_id: driver.id,
          token,
          token_expires_at: expires,
          status: 'pending',
        });
      if (insErr) {
        console.error('❌ Failed to create invite:', insErr);
        continue;
      }
      invitesToSend.push({ job, token });
    }

    // 4. Render driver email HTML using React Email
    const _unsubSecret = Deno.env.get("INTERNAL_FN_SECRET") || "";
    const driverUnsubscribeUrl = _unsubSecret
      ? buildDriverUnsubscribeUrl(await makeDriverUnsubscribeToken(driver.id, _unsubSecret))
      : undefined;
    const driverHtml = await renderAsync(
      React.createElement(DriverApprovalEmail, {
        driverName: `${driver.vorname} ${driver.nachname}`,
        hasMatchingJobs: invitesToSend.length > 0,
        unsubscribeUrl: driverUnsubscribeUrl,
      })
    );

    // 5. Send email to driver
    const mailReplyTo = Deno.env.get('MAIL_REPLY_TO') || 'info@kraftfahrer-mieten.com';
    const driverEmailSubject = 'Sie sind jetzt bei Fahrerexpress freigeschaltet';
    let driverMessageId: string | null = null;
    let driverEmailError: string | null = null;
    let driverEmailStatus: 'sent' | 'failed' = 'failed';

    try {
      const emailResponse = await resend.emails.send({
        from: MAIL_FROM,
        to: [driver.email],
        reply_to: mailReplyTo,
        subject: driverEmailSubject,
        html: driverHtml,
      });

      driverMessageId = (emailResponse as any)?.data?.id ?? (emailResponse as any)?.id ?? null;
      driverEmailStatus = 'sent';
      console.log('✅ Driver email sent successfully:', driverMessageId);
    } catch (error) {
      console.error('❌ Driver email sending failed:', error);
      driverEmailError = error instanceof Error ? error.message : 'Unknown email error';
      driverEmailStatus = 'failed';
    }

    // 6. Log driver email attempt
    try {
      await supabase.from('email_log').insert({
        recipient: driver.email,
        subject: driverEmailSubject,
        template: 'driver_approval_with_jobs',
        status: driverEmailStatus,
        message_id: driverMessageId,
        error_message: driverEmailError,
        sent_at: driverEmailStatus === 'sent' ? new Date().toISOString() : null,
        delivery_mode: 'inline'
      });
    } catch (logError) {
      console.error('❌ Failed to log driver email:', logError);
    }

    // 6b. Send a separate per-job invite email with accept/decline buttons (token-based)
    for (const { job, token } of invitesToSend) {
      // Links zeigen auf Frontend-Bestätigungsseite (Schutz vor Mail-Link-Scannern).
      // Erst der Button-Klick auf der Seite löst per POST die Annahme/Ablehnung aus.
      const SITE_BASE = Deno.env.get("SITE_URL") || "https://www.kraftfahrer-mieten.com";
      const acceptLink = `${SITE_BASE}/fahrer-antwort-bestaetigen?action=accept&token=${encodeURIComponent(token)}`;
      const declineLink = `${SITE_BASE}/fahrer-antwort-bestaetigen?action=decline&token=${encodeURIComponent(token)}`;
      const inviteSubject = `Auftragsangebot: ${job.fahrzeugtyp} – ${job.einsatzort}`;
      const escape = (s: any) => String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const nl2br = (s: any) => escape(s).replace(/\n/g, '<br/>');
      const inviteHtml = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;">
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#ffffff; padding:24px;">
          <h2 style="color:#1f2937;margin:0 0 16px 0;">Auftragsangebot</h2>
          <p style="color:#111827;font-size:15px;">Hallo ${escape(driver.vorname || '')},</p>
          <p style="color:#111827;font-size:15px;">für Sie liegt ein passendes Auftragsangebot vor.</p>

          <h3 style="color:#1f2937;font-size:16px;margin:24px 0 8px 0;">Einsatzdetails</h3>
          <table role="presentation" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;width:100%;">
            <tr><td style="padding:6px 0;color:#374151;font-size:14px;"><strong>Einsatzort:</strong> ${escape(job.einsatzort || '-')}</td></tr>
            <tr><td style="padding:6px 0;color:#374151;font-size:14px;"><strong>Zeitraum:</strong> ${escape(job.zeitraum || '-')}</td></tr>
            <tr><td style="padding:6px 0;color:#374151;font-size:14px;"><strong>Fahrzeugtyp:</strong> ${escape(job.fahrzeugtyp || '-')}</td></tr>
            <tr><td style="padding:6px 0;color:#374151;font-size:14px;"><strong>Führerschein:</strong> ${escape(job.fuehrerscheinklasse || '-')}</td></tr>
            ${job.besonderheiten ? `<tr><td style="padding:6px 0;color:#374151;font-size:14px;"><strong>Besonderheiten:</strong> ${escape(job.besonderheiten)}</td></tr>` : ''}
          </table>

          ${job.nachricht ? `
          <h3 style="color:#1f2937;font-size:16px;margin:24px 0 8px 0;">Aufgabenbeschreibung laut Auftrag</h3>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;color:#374151;font-size:14px;line-height:1.5;">${nl2br(job.nachricht)}</div>
          ` : ''}

          <h3 style="color:#1f2937;font-size:16px;margin:28px 0 12px 0;">Ihre Rückmeldung</h3>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px 0;">
            <tr><td style="padding:6px 0;">
              <a href="${acceptLink}" style="background:#10b981;color:#ffffff;padding:14px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600;font-size:15px;min-width:240px;text-align:center;">Ich kann den Auftrag übernehmen</a>
            </td></tr>
            <tr><td style="padding:6px 0;">
              <a href="${declineLink}" style="background:#6b7280;color:#ffffff;padding:14px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600;font-size:15px;min-width:240px;text-align:center;">Ich kann nicht übernehmen</a>
            </td></tr>
          </table>

          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:12px 16px;margin:20px 0;color:#92400e;font-size:14px;">
            <strong>Hinweis:</strong> Ihre Rückmeldung dient der Verfügbarkeitsprüfung. Die endgültige Einsatzbestätigung erfolgt separat durch Fahrerexpress.
          </div>

          <p style="color:#6b7280;font-size:13px;margin:16px 0;">Diese Links sind 48 Stunden gültig.</p>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;"/>
          <p style="color:#374151;font-size:13px;margin:0;">
            <strong>Rückfragen:</strong><br/>
            Telefon: +49 1577 1442285<br/>
            E-Mail: info@kraftfahrer-mieten.com
          </p>
        </div></body></html>`;
      try {
        const r = await resend.emails.send({
          from: MAIL_FROM,
          to: [driver.email],
          reply_to: mailReplyTo,
          subject: inviteSubject,
          html: inviteHtml,
        });
        const mid = (r as any)?.data?.id ?? null;
        await supabase.from('email_log').insert({
          recipient: driver.email,
          subject: inviteSubject,
          template: 'driver_job_invite_post_approval',
          status: 'sent',
          message_id: mid,
          job_id: job.id,
          sent_at: new Date().toISOString(),
          delivery_mode: 'inline',
        });
      } catch (e) {
        console.error('❌ Failed to send invite email:', e);
        await supabase.from('email_log').insert({
          recipient: driver.email,
          subject: inviteSubject,
          template: 'driver_job_invite_post_approval',
          status: 'failed',
          job_id: job.id,
          error_message: e instanceof Error ? e.message : String(e),
          delivery_mode: 'inline',
        });
      }
    }

    // 7. Render admin notification email
    const adminHtml = await renderAsync(
      React.createElement(AdminDriverApprovalNotification, {
        driverName: `${driver.vorname} ${driver.nachname}`,
        driverEmail: driver.email,
        driverId: driver.id,
        approvedAt: new Date().toLocaleString('de-DE'),
        jobsSent: invitesToSend.length,
      })
    );

    // 8. Send admin notification email
    const adminEmail = 'info@kraftfahrer-mieten.com';
    const adminEmailSubject = `✅ Fahrer freigeschaltet: ${driver.vorname} ${driver.nachname}`;
    let adminMessageId: string | null = null;
    let adminEmailError: string | null = null;
    let adminEmailStatus: 'sent' | 'failed' = 'failed';

    try {
      const adminEmailResponse = await resend.emails.send({
        from: MAIL_FROM,
        to: [adminEmail],
        subject: adminEmailSubject,
        html: adminHtml,
      });

      adminMessageId = (adminEmailResponse as any)?.data?.id ?? (adminEmailResponse as any)?.id ?? null;
      adminEmailStatus = 'sent';
      console.log('✅ Admin notification sent successfully:', adminMessageId);
    } catch (error) {
      console.error('❌ Admin notification sending failed:', error);
      adminEmailError = error instanceof Error ? error.message : 'Unknown email error';
      adminEmailStatus = 'failed';
    }

    // 9. Log admin notification
    try {
      await supabase.from('email_log').insert({
        recipient: adminEmail,
        subject: adminEmailSubject,
        template: 'admin_driver_approval_notification',
        status: adminEmailStatus,
        message_id: adminMessageId,
        error_message: adminEmailError,
        sent_at: adminEmailStatus === 'sent' ? new Date().toISOString() : null,
        delivery_mode: 'inline'
      });
    } catch (logError) {
      console.error('❌ Failed to log admin notification:', logError);
    }

    // 10. Log admin action
    await logAdminAction(supabase, 'approve_driver', user.email, {
      note: `Approved driver: ${driver.vorname} ${driver.nachname} (${driver.email}); openJobs=${jobs?.length || 0}, validJobs=${validJobs.length}, matchingJobs=${matchingJobs.length}, invitesSent=${invitesToSend.length}, skippedDuplicate=${skippedDuplicate}, skippedExpired=${skippedExpired}, skippedNoMatch=${skippedNoMatch}, unclearPeriod=${unclearJobs.length}`
    });

    console.log('✅ Process completed successfully');

    return new Response(JSON.stringify({
      ok: true,
      openJobs: jobs?.length || 0,
      validJobs: validJobs.length,
      matchingJobs: matchingJobs.length,
      invitesSent: invitesToSend.length,
      skippedDuplicate,
      skippedExpired,
      skippedNoMatch,
      unclearJobs,

      driverEmailSent: driverEmailStatus === 'sent',
      adminEmailSent: adminEmailStatus === 'sent',
      driverMessageId: driverMessageId,
      adminMessageId: adminMessageId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return createErrorResponse('Internal server error', 500, corsHeaders);
  }
});

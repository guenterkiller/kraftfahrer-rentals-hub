import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { DriverApprovalEmail } from './_templates/driver-approval-email.tsx';
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

// Defensive license-class match: job license must be contained in driver's classes
function driverMatchesJob(driver: any, job: any): boolean {
  const driverClasses: string[] = Array.isArray(driver?.fuehrerscheinklassen)
    ? driver.fuehrerscheinklassen.map((c: string) => String(c).toUpperCase().trim())
    : [];
  if (driverClasses.length === 0) return false;
  const required = String(job?.fuehrerscheinklasse || '').toUpperCase().trim();
  if (!required) return false;
  // Direct match or driver holds a higher class that includes the required one
  if (driverClasses.includes(required)) return true;
  // CE includes C and C1; C includes C1 — be conservative: only direct equality.
  return false;
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

    // 3. Get recent open jobs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: jobs, error: jobsError } = await supabase
      .from('job_requests')
      .select('*')
      .eq('status', 'open')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (jobsError) {
      console.error('❌ Failed to fetch jobs:', jobsError);
    }

    console.log('📋 Found jobs:', jobs?.length || 0);

    // 3b. Filter to jobs that match this driver (defensive)
    const matchingJobs = (jobs || []).filter((job) => driverMatchesJob(driver, job));
    console.log(`🎯 Matching jobs for driver: ${matchingJobs.length}/${jobs?.length || 0}`);

    // 3c. Create assignment_invites for each matching job (skip if invite already exists)
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const invitesToSend: Array<{ job: any; token: string }> = [];
    for (const job of matchingJobs) {
      const { data: existing } = await supabase
        .from('assignment_invites')
        .select('id, status')
        .eq('job_id', job.id)
        .eq('driver_id', driver.id)
        .limit(1)
        .maybeSingle();

      if (existing) {
        console.log(`↩️  Invite already exists for job ${job.id} (status=${existing.status}) – skipping`);
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
    const driverHtml = await renderAsync(
      React.createElement(DriverApprovalEmail, {
        driverName: `${driver.vorname} ${driver.nachname}`,
        jobs: matchingJobs,
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
      const acceptLink = `${SUPABASE_URL}/functions/v1/respond-invite?a=accept&t=${token}`;
      const declineLink = `${SUPABASE_URL}/functions/v1/respond-invite?a=decline&t=${token}`;
      const inviteSubject = `Auftragsangebot: ${job.fahrzeugtyp} – ${job.einsatzort}`;
      const inviteHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color:#1f2937;">Neues Auftragsangebot</h2>
          <p>Hallo ${driver.vorname || ''},</p>
          <p>für Sie liegt ein passendes Auftragsangebot vor:</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:20px;border-radius:8px;margin:20px 0;">
            <p><strong>Einsatzort:</strong> ${job.einsatzort || '-'}</p>
            <p><strong>Zeitraum:</strong> ${job.zeitraum || '-'}</p>
            <p><strong>Fahrzeugtyp:</strong> ${job.fahrzeugtyp || '-'}</p>
            <p><strong>Führerschein:</strong> ${job.fuehrerscheinklasse || '-'}</p>
            ${job.besonderheiten ? `<p><strong>Besonderheiten:</strong> ${job.besonderheiten}</p>` : ''}
            ${job.nachricht ? `<p><strong>Tätigkeit:</strong> ${job.nachricht}</p>` : ''}
          </div>
          <div style="margin:24px 0;">
            <a href="${acceptLink}" style="background:#10b981;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin-right:10px;">Ich kann den Auftrag übernehmen</a>
            <a href="${declineLink}" style="background:#ef4444;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Ich kann nicht übernehmen</a>
          </div>
          <p style="color:#666;font-size:13px;">Diese Links sind 48 Stunden gültig.<br/>Rückfragen: +49-1577-1442285 · info@kraftfahrer-mieten.com</p>
        </div>`;
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
      note: `Approved driver: ${driver.vorname} ${driver.nachname} (${driver.email}); invites sent: ${invitesToSend.length}/${matchingJobs.length} matching of ${jobs?.length || 0} open jobs`
    });

    console.log('✅ Process completed successfully');

    return new Response(JSON.stringify({
      ok: true,
      openJobs: jobs?.length || 0,
      matchingJobs: matchingJobs.length,
      invitesSent: invitesToSend.length,
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

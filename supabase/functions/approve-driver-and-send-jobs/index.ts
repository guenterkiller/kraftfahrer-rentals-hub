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

    // 4. Render driver email HTML using React Email
    const driverHtml = await renderAsync(
      React.createElement(DriverApprovalEmail, {
        driverName: `${driver.vorname} ${driver.nachname}`,
        jobs: jobs || [],
      })
    );

    // 5. Send email to driver
    const mailReplyTo = Deno.env.get('MAIL_REPLY_TO') || 'info@kraftfahrer-mieten.com';
    const driverEmailSubject = '🎉 Sie sind freigeschaltet! – Aktuelle Fahrergesuche';
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

      driverMessageId = emailResponse.id || null;
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

    // 7. Render admin notification email
    const adminHtml = await renderAsync(
      React.createElement(AdminDriverApprovalNotification, {
        driverName: `${driver.vorname} ${driver.nachname}`,
        driverEmail: driver.email,
        driverId: driver.id,
        approvedAt: new Date().toLocaleString('de-DE'),
        jobsSent: jobs?.length || 0,
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

      adminMessageId = adminEmailResponse.id || null;
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
      note: `Approved driver: ${driver.vorname} ${driver.nachname} (${driver.email})`
    });

    console.log('✅ Process completed successfully');

    return new Response(JSON.stringify({
      ok: true,
      sentJobs: jobs?.length || 0,
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

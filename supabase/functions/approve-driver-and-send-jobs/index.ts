import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { DriverApprovalEmail } from './_templates/driver-approval-email.tsx';
import { AdminDriverApprovalNotification } from './_templates/admin-driver-approval-notification.tsx';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Resend
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApproveDriverRequest {
  driverId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 approve-driver-and-send-jobs function called');
    
    // Runtime guard for MAIL_FROM domain
    const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "info@kraftfahrer-mieten.com";
    const addr = MAIL_FROM.split('<').pop()?.replace(/[<>]/g,'') ?? MAIL_FROM;
    if (!/@kraftfahrer-mieten\.com$/i.test(addr.trim())) {
      throw new Error(`MAIL_FROM uses unverified domain: ${MAIL_FROM}`);
    }
    
    // Parse request body to get email and driverId
    const { email, driverId }: { email?: string; driverId?: string } = await req.json();
    
    console.log('📧 Request from email:', email);
    console.log('👤 Driver ID to approve:', driverId);
    
    // Check admin email authorization
    const ADMIN_EMAIL = 'guenter.killer@t-online.de';
    if (!email || email !== ADMIN_EMAIL) {
      console.error('❌ Unauthorized email:', email);
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid admin email' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!driverId) {
      console.error('❌ Missing driver ID');
      return new Response(JSON.stringify({ error: 'Driver ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Admin email verified:', email);

    // 1. Get driver details
    const { data: driver, error: driverError } = await supabase
      .from('fahrer_profile')
      .select('*')
      .eq('id', driverId)
      .single();

    if (driverError || !driver) {
      console.error('❌ Driver not found:', driverError);
      return new Response(JSON.stringify({ error: 'Driver not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('👤 Driver found:', driver.vorname, driver.nachname);

    // 2. Update driver status to 'approved'
    const { error: updateError } = await supabase
      .from('fahrer_profile')
      .update({ status: 'approved' })
      .eq('id', driverId);

    if (updateError) {
      console.error('❌ Failed to update driver status:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update driver status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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
      // Continue with email even if jobs can't be fetched
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

    // 6. Log driver email attempt to email_log table
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
      console.log('✅ Driver email logged to email_log');
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

    // 9. Log admin notification to email_log table
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
      console.log('✅ Admin notification logged to email_log');
    } catch (logError) {
      console.error('❌ Failed to log admin notification:', logError);
    }

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
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);
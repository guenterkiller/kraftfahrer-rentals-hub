import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { NoShowNotice } from '../_shared/email-templates/no-show-notice.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NoShowNoticeRequest {
  assignment_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🚨 No-Show notice request received');

  try {
    const { assignment_id }: NoShowNoticeRequest = await req.json();

    // Runtime guard for MAIL_FROM domain
    const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "info@kraftfahrer-mieten.com";
    const addr = MAIL_FROM.split('<').pop()?.replace(/[<>]/g,'') ?? MAIL_FROM;
    if (!/@kraftfahrer-mieten\.com$/i.test(addr.trim())) {
      throw new Error(`MAIL_FROM uses unverified domain: ${MAIL_FROM}`);
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize Resend client
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    console.log(`📋 Processing No-Show notice for assignment: ${assignment_id}`);

    // Fetch assignment, job and driver details
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('job_assignments')
      .select(`
        *,
        job_requests(*),
        fahrer_profile(*)
      `)
      .eq('id', assignment_id)
      .single();

    if (assignmentError || !assignmentData) {
      console.error('❌ Assignment not found:', assignmentError);
      return new Response(
        JSON.stringify({ error: 'Assignment not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const job = assignmentData.job_requests;
    const driver = assignmentData.fahrer_profile;

    // Get admin email for BCC
    const { data: adminSettings } = await supabase
      .from('admin_settings')
      .select('admin_email')
      .single();

    const adminEmail = adminSettings?.admin_email || 'info@kraftfahrer-mieten.com';

    console.log(`📧 Generating No-Show notice email for: ${job.customer_email}`);

    // Format dates
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('de-DE');
    };

    const formatTime = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    };

    // Generate email content with fee calculation
    const subject = `No-Show-Mitteilung – Fahrer ist nicht erschienen (${formatDate(assignmentData.start_date || job.created_at)} / ${job.company || job.customer_name})`;

    const feeEur = assignmentData.no_show_fee_cents ? (assignmentData.no_show_fee_cents / 100).toFixed(2) : '150.00';
    const tier = assignmentData.no_show_tier || 'standard';

    const tierLabels: Record<string, string> = {
      '<6h': 'kurzfristige Absage unter 6 Stunden',
      '6-24h': 'Absage 6-24 Stunden vorher',
      '24-48h': 'Absage 24-48 Stunden vorher',
      '>=48h': 'rechtzeitige Absage über 48 Stunden',
      'override': 'individuell festgelegt',
      'standard': 'Standardpauschale'
    };

    const emailHtml = await renderAsync(
      React.createElement(NoShowNotice, {
        customerName: job.customer_name,
        company: job.company,
        customerPhone: job.customer_phone,
        customerEmail: job.customer_email,
        einsatzort: job.einsatzort,
        zeitraum: job.zeitraum,
        startDate: assignmentData.start_date,
        endDate: assignmentData.end_date,
        fahrzeugtyp: job.fahrzeugtyp,
        fuehrerscheinklasse: job.fuehrerscheinklasse,
        feeEur,
        tierLabel: tierLabels[tier] || tier,
      })
    );

    // Send email
    const emailResponse = await resend.emails.send({
      from: MAIL_FROM,
      to: [job.customer_email],
      bcc: [adminEmail],
      replyTo: 'info@kraftfahrer-mieten.com',
      subject,
      html: emailHtml,
    });

    if (emailResponse.error) {
      console.error('❌ Failed to send No-Show notice:', emailResponse.error);
      
      // Log failed email attempt
      await supabase.from('email_log').insert({
        template: 'no_show_notice',
        recipient: job.customer_email,
        assignment_id,
        job_id: job.id,
        status: 'failed',
        error_message: emailResponse.error.message,
        subject
      });

      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailResponse.error }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log(`✅ No-Show notice email sent successfully: ${emailResponse.data?.id}`);

    // Log successful email with metadata
    await supabase.from('email_log').insert({
      template: 'no_show_notice',
      recipient: job.customer_email,
      assignment_id,
      job_id: job.id,
      status: 'sent',
      message_id: emailResponse.data?.id,
      sent_at: new Date().toISOString(),
      subject,
      meta: {
        fee_eur: feeEur,
        tier: tier,
        tier_label: tierLabels[tier] || tier
      }
    });

    console.log('✅ No-Show notice completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'No-Show notice sent successfully',
        email_id: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('❌ Error in send-no-show-notice function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
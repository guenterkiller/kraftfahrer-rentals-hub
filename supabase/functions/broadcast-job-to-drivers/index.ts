import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";

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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 broadcast-job-to-drivers function called');
    
    // Parse request body to get email and jobId
    const { email, jobId }: { email?: string; jobId?: string } = await req.json();
    
    console.log('📧 Request from email:', email);
    console.log('💼 Job ID to broadcast:', jobId);
    
    // Check admin email authorization
    const ADMIN_EMAIL = 'guenter.killer@t-online.de';
    if (!email || email !== ADMIN_EMAIL) {
      console.error('❌ Unauthorized email:', email);
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid admin email' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!jobId) {
      console.error('❌ Missing job ID');
      return new Response(JSON.stringify({ error: 'Job ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Admin email verified:', email);

    // Fetch job details
    console.log('📋 Fetching job details...');
    const { data: jobData, error: jobError } = await supabase
      .from('job_requests')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !jobData) {
      console.error('❌ Error fetching job:', jobError);
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Job details fetched:', jobData.customer_name);

    // Fetch all active drivers who haven't opted out
    console.log('👥 Fetching active drivers...');
    const { data: driversData, error: driversError } = await supabase
      .from('fahrer_profile')
      .select('*')
      .in('status', ['active', 'approved'])
      .eq('email_opt_out', false);

    if (driversError) {
      console.error('❌ Error fetching drivers:', driversError);
      return new Response(JSON.stringify({ error: 'Error fetching drivers' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Found ${driversData?.length || 0} active drivers`);

    if (!driversData || driversData.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No active drivers found',
        sentToCount: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prepare email content
    const emailSubject = `🚛 Neue Fahreranfrage: ${jobData.customer_name} - ${jobData.fahrzeugtyp}`;
    
    const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #2563eb; margin-bottom: 20px; text-align: center;">🚛 Neue Fahreranfrage</h1>
        
        <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; margin-top: 0;">Job-Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Kunde:</td>
              <td style="padding: 8px 0; color: #1f2937;">${jobData.customer_name}</td>
            </tr>
            ${jobData.company ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Firma:</td>
              <td style="padding: 8px 0; color: #1f2937;">${jobData.company}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Einsatzort:</td>
              <td style="padding: 8px 0; color: #1f2937;">${jobData.einsatzort}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Zeitraum:</td>
              <td style="padding: 8px 0; color: #1f2937;">${jobData.zeitraum}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Fahrzeugtyp:</td>
              <td style="padding: 8px 0; color: #1f2937;">${jobData.fahrzeugtyp}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Führerschein:</td>
              <td style="padding: 8px 0; color: #1f2937;">${jobData.fuehrerscheinklasse}</td>
            </tr>
            ${jobData.besonderheiten ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Besonderheiten:</td>
              <td style="padding: 8px 0; color: #d97706;">${jobData.besonderheiten}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        ${jobData.nachricht ? `
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #92400e; margin-top: 0;">📝 Nachricht vom Kunden:</h3>
          <p style="color: #78350f; line-height: 1.6; margin: 0;">${jobData.nachricht.replace(/\n/g, '<br>')}</p>
        </div>
        ` : ''}

        <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #166534; margin-top: 0;">📞 Kontakt</h3>
          <p style="color: #15803d; margin: 0;">
            <strong>E-Mail:</strong> ${jobData.customer_email}<br>
            <strong>Telefon:</strong> ${jobData.customer_phone}
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px;">
            Bei Interesse kontaktieren Sie bitte direkt den Kunden oder<br>
            melden Sie sich bei Fahrerexpress-Agentur.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>Fahrerexpress-Agentur - Günter Killer<br>
          Diese E-Mail wurde automatisch generiert.</p>
        </div>
      </div>
    </div>
    `;

    // Send emails to all drivers
    let sentCount = 0;
    let errorCount = 0;
    
    console.log('📤 Starting email sending process...');
    
    for (const driver of driversData) {
      try {
        console.log(`📧 Sending email to: ${driver.email}`);
        
        const emailResponse = await resend.emails.send({
          from: Deno.env.get('MAIL_FROM') || 'Fahrerexpress <noreply@fahrerexpress.de>',
          to: [driver.email],
          subject: emailSubject,
          html: emailBody,
          replyTo: jobData.customer_email
        });

        if (emailResponse.data?.id) {
          sentCount++;
          console.log(`✅ Email sent successfully to ${driver.email}`);
          
          // Log the email in job_mail_log
          await supabase.rpc('log_job_mail', {
            p_job_request_id: jobId,
            p_fahrer_id: driver.id,
            p_email: driver.email,
            p_status: 'sent',
            p_subject: emailSubject,
            p_mail_template: 'job_broadcast',
            p_reply_to: jobData.customer_email,
            p_driver_snapshot: driver,
            p_meta: { email_id: emailResponse.data.id }
          });
          
        } else {
          console.error(`❌ Failed to send email to ${driver.email}:`, emailResponse);
          errorCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error sending email to ${driver.email}:`, error);
        errorCount++;
        
        // Log the error in job_mail_log
        try {
          await supabase.rpc('log_job_mail', {
            p_job_request_id: jobId,
            p_fahrer_id: driver.id,
            p_email: driver.email,
            p_status: 'error',
            p_error: error instanceof Error ? error.message : 'Unknown error',
            p_subject: emailSubject,
            p_mail_template: 'job_broadcast',
            p_reply_to: jobData.customer_email,
            p_driver_snapshot: driver
          });
        } catch (logError) {
          console.error('Failed to log email error:', logError);
        }
      }
    }

    console.log(`✅ Email sending completed. Sent: ${sentCount}, Errors: ${errorCount}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Job successfully sent to drivers`,
      sentToCount: sentCount,
      errorCount: errorCount,
      totalDrivers: driversData.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in broadcast-job-to-drivers:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsletterRequest {
  email: string;
  subject: string;
  message: string;
  sendToActiveOnly?: boolean;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎯 Newsletter: Starting request processing');
    
    const { email, subject, message, sendToActiveOnly = false }: NewsletterRequest = await req.json();
    
    // Admin authorization
    if (email !== "guenter.killer@t-online.de") {
      console.log('❌ Newsletter: Unauthorized access attempt from:', email);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Newsletter: Admin authorized, loading drivers...');
    console.log('📧 Newsletter settings:', { subject, sendToActiveOnly });

    // Get all driver profiles
    let query = supabase
      .from('fahrer_profile')
      .select('email, vorname, nachname, status')
      .eq('email_opt_out', false); // Only send to drivers who haven't opted out

    if (sendToActiveOnly) {
      query = query.eq('status', 'active');
    }

    const { data: drivers, error: driversError } = await query;

    if (driversError) {
      console.error('❌ Newsletter: Error loading drivers:', driversError);
      throw driversError;
    }

    if (!drivers || drivers.length === 0) {
      console.log('⚠️ Newsletter: No drivers found');
      return new Response(
        JSON.stringify({ error: 'No drivers found', recipientCount: 0 }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Newsletter: Found ${drivers.length} drivers to send to`);

    // Prepare email content
    const emailHtml = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Fahrerexpress-Agentur</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Rundschreiben</p>
        </div>
        
        <div style="padding: 30px 20px; background: #ffffff;">
          <h2 style="color: #1e40af; margin-top: 0;">${subject}</h2>
          
          <div style="white-space: pre-line; color: #374151; margin: 20px 0;">
${message}
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #f3f4f6; border-radius: 8px;">
            <p style="margin: 0; font-weight: bold; color: #1e40af;">Kontakt</p>
            <p style="margin: 5px 0 0 0; color: #6b7280;">
              📧 info@kraftfahrer-mieten.com<br>
              📱 +49 (0) 160 123 456 78<br>
              🌐 www.kraftfahrer-mieten.com
            </p>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 15px 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">
            Diese E-Mail wurde an alle registrierten Fahrer der Fahrerexpress-Agentur gesendet.
          </p>
        </div>
      </div>
    `;

    // Send emails to all drivers
    let successCount = 0;
    let errorCount = 0;

    console.log(`📤 Newsletter: Starting to send emails to ${drivers.length} recipients`);

    for (const driver of drivers) {
      try {
        const personalizedSubject = `[Fahrerexpress] ${subject}`;
        
        await resend.emails.send({
          from: Deno.env.get('MAIL_FROM') || 'noreply@kraftfahrer-mieten.com',
          to: [driver.email],
          subject: personalizedSubject,
          html: emailHtml,
          reply_to: 'info@kraftfahrer-mieten.com'
        });

        // Log successful email
        await supabase.from('email_log').insert({
          recipient: driver.email,
          subject: personalizedSubject,
          template: 'driver_newsletter',
          status: 'sent',
          sent_at: new Date().toISOString()
        });

        successCount++;
        console.log(`✅ Newsletter: Sent to ${driver.email}`);
        
      } catch (emailError) {
        console.error(`❌ Newsletter: Failed to send to ${driver.email}:`, emailError);
        
        // Log failed email
        await supabase.from('email_log').insert({
          recipient: driver.email,
          subject: `[Fahrerexpress] ${subject}`,
          template: 'driver_newsletter',
          status: 'failed',
          error_message: emailError.message
        });

        errorCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`📊 Newsletter: Complete - ${successCount} sent, ${errorCount} failed`);

    // Log admin action
    await supabase.from('admin_actions').insert({
      action: 'send_driver_newsletter',
      admin_email: email,
      note: `Newsletter sent: "${subject}" to ${successCount}/${drivers.length} drivers`
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        recipientCount: successCount,
        failedCount: errorCount,
        totalDrivers: drivers.length
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ Newsletter: Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
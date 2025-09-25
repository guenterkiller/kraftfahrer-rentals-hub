import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { subject, message } = await req.json();

    if (!subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Subject and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all active drivers (both German and English status)
    // Include drivers with status: active, approved, aktiv
    const { data: drivers, error: driversError } = await supabase
      .from('fahrer_profile')
      .select('email, vorname, nachname, status, email_opt_out')
      .in('status', ['active', 'approved', 'aktiv'])
      .eq('email_opt_out', false); // Only drivers who haven't opted out

    if (driversError) {
      console.error('Error fetching drivers:', driversError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch drivers' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!drivers || drivers.length === 0) {
      console.log('No active drivers found with status: active, approved, or aktiv');
      return new Response(
        JSON.stringify({ sentCount: 0, message: 'No active drivers found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${drivers.length} eligible drivers:`);
    drivers.forEach(d => console.log(`- ${d.vorname} ${d.nachname} (${d.status}) - ${d.email}`));

    // Send emails to all drivers with rate limiting (max 2 per second)
    let sentCount = 0;
    let errorCount = 0;

    for (let i = 0; i < drivers.length; i++) {
      const driver = drivers[i];
      
      console.log(`Attempting to send email ${i + 1}/${drivers.length} to ${driver.email} (${driver.vorname} ${driver.nachname})`);
      
      try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(driver.email)) {
          console.error(`Invalid email format for ${driver.email}`);
          errorCount++;
          continue;
        }

        const emailBody = `
Hallo ${driver.vorname} ${driver.nachname},

${message}

Mit freundlichen Grüßen
Ihr Fahrerexpress Team
        `.trim();

        const emailPayload = {
          from: `Fahrerexpress <${Deno.env.get('MAIL_FROM')}>`,
          reply_to: 'info@kraftfahrer-mieten.com',
          to: [driver.email],
          subject: subject,
          text: emailBody,
        };

        console.log(`Sending email to ${driver.email} with payload:`, emailPayload);

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload),
        });

        const responseText = await response.text();
        console.log(`Response for ${driver.email}: Status ${response.status}, Body: ${responseText}`);

        if (response.ok) {
          const result = JSON.parse(responseText);
          sentCount++;
          console.log(`✅ Email sent successfully to ${driver.email}:`, result);
          
          // Log email sending success
          await supabase
            .from('email_log')
            .insert({
              recipient: driver.email,
              subject,
              template: 'newsletter',
              status: 'sent',
              sent_at: new Date().toISOString(),
              message_id: result.id,
            });
        } else {
          console.error(`❌ Failed to send email to ${driver.email}: Status ${response.status}, Response: ${responseText}`);
          errorCount++;
          
          // Log email sending failure
          await supabase
            .from('email_log')
            .insert({
              recipient: driver.email,
              subject,
              template: 'newsletter',
              status: 'failed',
              error_message: `HTTP ${response.status}: ${responseText}`,
            });
        }
      } catch (error) {
        console.error(`❌ Exception sending email to ${driver.email}:`, error);
        errorCount++;
        
        // Log email sending failure
        await supabase
          .from('email_log')
          .insert({
            recipient: driver.email,
            subject,
            template: 'newsletter',
            status: 'failed',
            error_message: error.message,
          });
      }

      // Rate limiting: Wait 1 second between emails to avoid rate limits
      if (i < drivers.length - 1) {
        console.log(`Waiting 1 second before next email...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Newsletter sending complete: ${sentCount} sent, ${errorCount} failed out of ${drivers.length} total drivers`);

    return new Response(
      JSON.stringify({ 
        sentCount, 
        errorCount,
        totalDrivers: drivers.length,
        message: `Newsletter sent to ${sentCount} out of ${drivers.length} drivers (${errorCount} failed)` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Newsletter send error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
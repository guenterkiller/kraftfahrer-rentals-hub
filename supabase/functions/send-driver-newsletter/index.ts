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
    const { data: drivers, error: driversError } = await supabase
      .from('fahrer_profile')
      .select('email, vorname, nachname, status')
      .in('status', ['active', 'approved', 'aktiv']);

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

    console.log(`Found ${drivers.length} active drivers:`, drivers.map(d => `${d.vorname} ${d.nachname} (${d.status})`));

    // Send emails to all drivers with rate limiting (max 2 per second)
    let sentCount = 0;
    let errorCount = 0;

    for (let i = 0; i < drivers.length; i++) {
      const driver = drivers[i];
      
      try {
        const emailBody = `
Hallo ${driver.vorname} ${driver.nachname},

${message}

Mit freundlichen Grüßen
Ihr Fahrerexpress Team
        `.trim();

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Fahrerexpress <noreply@fahrerexpress.de>',
            reply_to: 'info@kraftfahrer-mieten.com',
            to: [driver.email],
            subject: subject,
            text: emailBody,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          sentCount++;
          console.log(`Email sent successfully to ${driver.email}:`, result);
          
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
          const errorText = await response.text();
          console.error(`Failed to send email to ${driver.email}:`, errorText);
          errorCount++;
          
          // Log email sending failure
          await supabase
            .from('email_log')
            .insert({
              recipient: driver.email,
              subject,
              template: 'newsletter',
              status: 'failed',
              error_message: errorText,
            });
        }
      } catch (error) {
        console.error(`Error sending email to ${driver.email}:`, error);
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

      // Rate limiting: Wait 600ms between emails (max 2 per second)
      // Skip delay for the last email
      if (i < drivers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }

    return new Response(
      JSON.stringify({ 
        sentCount, 
        totalDrivers: drivers.length,
        message: `Newsletter sent to ${sentCount} out of ${drivers.length} drivers` 
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
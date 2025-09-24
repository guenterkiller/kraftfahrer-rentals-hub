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

    // Send emails to all drivers
    let sentCount = 0;
    const emailPromises = drivers.map(async (driver) => {
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
          sentCount++;
          console.log(`Email sent successfully to ${driver.email}`);
        } else {
          console.error(`Failed to send email to ${driver.email}:`, await response.text());
        }
      } catch (error) {
        console.error(`Error sending email to ${driver.email}:`, error);
      }
    });

    await Promise.all(emailPromises);

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
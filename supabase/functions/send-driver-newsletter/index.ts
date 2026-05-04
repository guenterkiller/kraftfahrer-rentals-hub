import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { makeDriverUnsubscribeToken, buildDriverUnsubscribeUrl } from "../_shared/driver-unsubscribe-token.ts";

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
    // Authentication: accept EITHER x-newsletter-secret header OR valid admin JWT
    const secret = req.headers.get('x-newsletter-secret');
    const expectedSecret = Deno.env.get('INTERNAL_FN_SECRET');
    const authHeader = req.headers.get('authorization');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let isAuthorized = false;
    
    // Path 1: Header-based secret (for system/cron calls)
    if (secret && expectedSecret && secret === expectedSecret) {
      isAuthorized = true;
    }
    
    // Path 2: JWT-based admin check (for admin panel)
    if (!isAuthorized && authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (!authError && user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        if (roleData) isAuthorized = true;
      }
    }
    
    if (!isAuthorized) {
      console.error('Unauthorized newsletter request – no valid secret or admin JWT');
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { subject, message, testEmail } = await req.json();

    if (!subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Subject and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let drivers: any[] | null = null;
    let driversError: any = null;

    if (testEmail && typeof testEmail === 'string' && testEmail.includes('@')) {
      // TEST-MODUS: Nur an angegebene Adresse senden, kein Versand an alle
      console.log(`TEST MODE: sending only to ${testEmail}`);
      // Versuche, einen passenden Fahrer zu finden (für korrekten Abmeldelink). Sonst Dummy-ID.
      const { data: matched } = await supabase
        .from('fahrer_profile')
        .select('id, email, vorname, nachname, status, email_opt_out')
        .eq('email', testEmail.toLowerCase().trim())
        .maybeSingle();
      drivers = [
        matched ?? {
          id: '00000000-0000-0000-0000-000000000000',
          email: testEmail,
          vorname: 'Test',
          nachname: 'Empfänger',
          status: 'active',
          email_opt_out: false,
        },
      ];
    } else {
      const result = await supabase
        .from('fahrer_profile')
        .select('id, email, vorname, nachname, status, email_opt_out')
        .in('status', ['active', 'approved', 'aktiv'])
        .eq('email_opt_out', false);
      drivers = result.data;
      driversError = result.error;
    }

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

        // Persönlichen Abmeldelink generieren (HMAC, gleiche Logik wie driver-unsubscribe)
        const unsubSecret = Deno.env.get('INTERNAL_FN_SECRET') || '';
        let unsubscribeUrl = 'mailto:info@kraftfahrer-mieten.com?subject=Abmeldung%20Fahrer-Newsletter';
        if (unsubSecret && driver.id) {
          try {
            const token = await makeDriverUnsubscribeToken(driver.id, unsubSecret);
            unsubscribeUrl = buildDriverUnsubscribeUrl(token);
          } catch (e) {
            console.error('Could not build unsubscribe token:', e);
          }
        }

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Fahrerexpress</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 12px;">Informationen für unsere Fahrer</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none;">
    <p style="margin: 0 0 15px 0;">Hallo ${driver.vorname} ${driver.nachname},</p>
    ${message.split('\n').map((line: string) => line.trim() ? `<p style="margin: 0 0 10px 0;">${line}</p>` : '<br>').join('')}
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e5e5; border-top: none;">
    <p style="margin: 0; color: #666; font-size: 14px;">
      Mit freundlichen Grüßen<br>
      <strong>Ihr Fahrerexpress-Team</strong>
    </p>
    <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;">
      Fahrerexpress-Agentur | Tel: 01577 1442285<br>
      <a href="https://www.kraftfahrer-mieten.com" style="color: #059669;">www.kraftfahrer-mieten.com</a>
    </p>
    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 15px 0;" />
    <p style="margin: 0; color: #555; font-size: 12px; line-height: 1.5;">
      Sie erhalten diese E-Mail, weil Sie sich als Fahrer bei Fahrerexpress registriert haben.
      Wenn Sie künftig keine Fahrerinformationen oder Auftragsbenachrichtigungen mehr erhalten möchten,
      können Sie sich
      <a href="${unsubscribeUrl}" style="color: #059669; font-weight: bold; text-decoration: underline;">hier abmelden</a>.
    </p>
  </div>
</body>
</html>
        `.trim();

        const emailPayload = {
          from: Deno.env.get('MAIL_FROM') || 'Fahrerexpress Fahrer-Team <info@kraftfahrer-mieten.com>',
          reply_to: 'info@kraftfahrer-mieten.com',
          to: [driver.email],
          subject: subject,
          html: emailHtml,
        };

        console.log(`Sending email to ${driver.email}`);

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
      } catch (error: any) {
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
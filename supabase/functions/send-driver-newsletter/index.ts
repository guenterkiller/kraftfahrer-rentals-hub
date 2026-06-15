import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { makeDriverUnsubscribeToken, buildDriverUnsubscribeUrl } from "../_shared/driver-unsubscribe-token.ts";
import { wrapDriverEmailHtml } from "../_shared/email-templates/driver-html-shell.ts";
import {
  buildDriverNewsletterInnerHtml,
  DRIVER_NEWSLETTER_TEMPLATES,
  type DriverNewsletterTemplateId,
} from "../_shared/driver-newsletter-templates.ts";

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

    const body = await req.json();
    const {
      subject: rawSubject,
      message: rawMessage,
      testEmail,
      templateId: rawTemplateId,
      dryRun,
    } = body ?? {};

    // Template auswählen – Default: 'free' (Abwärtskompatibilität)
    const templateId: DriverNewsletterTemplateId =
      rawTemplateId === 'fahrerinformationen_v1' ? 'fahrerinformationen_v1' : 'free';

    // Bei fester Vorlage: Subject IMMER aus Template, Message wird ignoriert.
    let effectiveSubject: string;
    let effectiveMessage: string | undefined;
    if (templateId === 'free') {
      if (!rawSubject || !rawMessage) {
        return new Response(
          JSON.stringify({ error: 'Subject and message are required for free template' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      effectiveSubject = String(rawSubject);
      effectiveMessage = String(rawMessage);
    } else {
      const tpl = DRIVER_NEWSLETTER_TEMPLATES[templateId];
      effectiveSubject = tpl.subject; // fest aus Code
      effectiveMessage = undefined;   // freier Text wird IGNORIERT
    }

    // DRY-RUN: nur Vorschau-HTML zurückgeben, NICHTS senden.
    if (dryRun === true) {
      const { innerHtml } = buildDriverNewsletterInnerHtml({
        templateId,
        vorname: 'Vorname',
        nachname: 'Nachname',
        freeMessage: effectiveMessage,
      });
      const previewHtml = wrapDriverEmailHtml(innerHtml, {
        subject: effectiveSubject,
        previewText: effectiveSubject,
        unsubscribeUrl: 'https://kraftfahrer-mieten.com/abmelden?token=PREVIEW',
        showUnsubscribe: true,
      });
      return new Response(
        JSON.stringify({
          dryRun: true,
          templateId,
          subject: effectiveSubject,
          html: previewHtml,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let drivers: any[] | null = null;
    let driversError: any = null;

    if (testEmail && typeof testEmail === 'string' && testEmail.includes('@')) {
      // TEST-MODUS: Nur an angegebene Adresse senden, kein Versand an alle
      console.log(`TEST MODE: sending only to ${testEmail}`);
      // Versuche, einen passenden Fahrer zu finden (für korrekten Abmeldelink).
      // Falls kein Profil existiert: KEINE Null-UUID verwenden – stattdessen
      // wird der Abmeldelink unten ausgeblendet.
      const { data: matched } = await supabase
        .from('fahrer_profile')
        .select('id, email, vorname, nachname, status, email_opt_out')
        .eq('email', testEmail.toLowerCase().trim())
        .maybeSingle();
      drivers = [
        matched ?? {
          id: null,
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
        .select('id, email, vorname, nachname, status, email_opt_out, is_blocked')
        .eq('status', 'approved')
        .eq('email_opt_out', false)
        .or('is_blocked.is.null,is_blocked.eq.false');
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

        // Persönlichen Abmeldelink generieren (HMAC, gleiche Logik wie driver-unsubscribe).
        // Wenn kein echtes Fahrerprofil vorliegt (z. B. Testmail an eine Adresse
        // ohne Profil), wird der Abmeldelink im Footer ausgeblendet – KEIN
        // Dummy-Link, KEINE Null-UUID.
        const unsubSecret = Deno.env.get('INTERNAL_FN_SECRET') || '';
        let unsubscribeUrl = 'mailto:info@kraftfahrer-mieten.com?subject=Abmeldung%20Fahrer-Newsletter';
        let showUnsubscribe = true;
        if (unsubSecret && driver.id) {
          try {
            const token = await makeDriverUnsubscribeToken(driver.id, unsubSecret);
            unsubscribeUrl = buildDriverUnsubscribeUrl(token);
          } catch (e) {
            console.error('Could not build unsubscribe token:', e);
          }
        } else if (!driver.id) {
          showUnsubscribe = false;
        }

        const { innerHtml } = buildDriverNewsletterInnerHtml({
          templateId,
          vorname: driver.vorname,
          nachname: driver.nachname,
          freeMessage: effectiveMessage,
        });
        const emailHtml = wrapDriverEmailHtml(innerHtml, {
          subject: effectiveSubject,
          previewText: effectiveSubject,
          unsubscribeUrl,
          showUnsubscribe,
        });

        const emailPayload = {
          from: Deno.env.get('MAIL_FROM') || 'Fahrerexpress Fahrer-Team <info@kraftfahrer-mieten.com>',
          reply_to: 'info@kraftfahrer-mieten.com',
          to: [driver.email],
          subject: effectiveSubject,
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
              subject: effectiveSubject,
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
              subject: effectiveSubject,
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
            subject: effectiveSubject,
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
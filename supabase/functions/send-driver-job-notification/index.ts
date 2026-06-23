import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { verifyAdminAuth, createCorsHeaders, handleCorsPreflightRequest } from '../_shared/admin-auth.ts';
import { wrapDriverEmailHtml } from '../_shared/email-templates/driver-html-shell.ts';
import { makeDriverUnsubscribeToken, buildDriverUnsubscribeUrl } from '../_shared/driver-unsubscribe-token.ts';

const corsHeaders = createCorsHeaders();

interface JobNotificationRequest {
  jobId: string;
  driverId: string;
  billingModel: 'agency'; // Nur noch Agenturmodell
}

// Token-Generierung (48 Zeichen)
function randomToken(len = 48): string {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => ("0" + b.toString(16)).slice(-2)).join("").slice(0, len);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(corsHeaders);
  }

  try {
    const authResult = await verifyAdminAuth(req);
    if (!authResult.success) return authResult.response;
    const supabase = authResult.supabase;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const resend = new Resend(resendApiKey);
    
    const { jobId, driverId, billingModel }: JobNotificationRequest = await req.json();

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('job_requests')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get driver details
    const { data: driver, error: driverError } = await supabase
      .from('fahrer_profile')
      .select('*')
      .eq('id', driverId)
      .single();

    if (driverError || !driver) {
      return new Response(JSON.stringify({ error: 'Driver not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }


    // Generate unique token and store invitation
    if (driver.email_opt_out || driver.is_blocked || driver.is_inactive) {
      console.log(`⛔ Skipping driver ${driverId} (email_opt_out=${driver.email_opt_out}, is_blocked=${driver.is_blocked}, is_inactive=${driver.is_inactive})`);
      const reason = driver.is_blocked ? 'blocked' : driver.is_inactive ? 'inactive' : 'email_opt_out';
      return new Response(JSON.stringify({ skipped: true, reason }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = randomToken(48);
    const tokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48); // 48 Stunden

    const { error: inviteError } = await supabase
      .from('assignment_invites')
      .insert({
        job_id: jobId,
        driver_id: driverId,
        token: token,
        token_expires_at: tokenExpiresAt.toISOString(),
        status: 'pending'
      });

    if (inviteError) {
      console.error('Failed to create invite:', inviteError);
      return new Response(JSON.stringify({ error: 'Failed to create invitation' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Persönlicher tokenbasierter Abmeldelink (HMAC, driver-unsubscribe Edge Function).
    let unsubscribeUrl: string | undefined;
    const unsubSecret = Deno.env.get('INTERNAL_FN_SECRET') || '';
    if (unsubSecret && driverId) {
      try {
        const token = await makeDriverUnsubscribeToken(driverId, unsubSecret);
        unsubscribeUrl = buildDriverUnsubscribeUrl(token);
      } catch (e) { console.error('Could not build unsubscribe token:', e); }
    }

    const innerHtml = `
      <h2 class="body-text" style="margin:0 0 14px 0;font-size:20px;line-height:1.25;color:#0d2340;font-weight:700;">Neuer Fahrerauftrag verfügbar</h2>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f8fafc" style="background-color:#f8fafc;border:1px solid #e5e7eb;border-left:4px solid #bb2c29;border-collapse:separate;border-radius:6px;margin:0 0 18px 0;">
        <tr><td style="padding:16px 18px;">
          <h3 class="body-text" style="margin:0 0 8px 0;font-size:16px;color:#0d2340;font-weight:700;">Agenturabrechnung – Vertrag mit Fahrerexpress</h3>
          <p class="body-text" style="margin:0;font-size:15px;line-height:1.6;color:#374151;">Dieser Auftrag wird über Fahrerexpress abgerechnet. Sie erbringen die Leistung als selbstständiger Fahrer im Vertragsverhältnis mit Fahrerexpress.</p>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background-color:#ffffff;border:1px solid #e5e7eb;border-collapse:separate;border-radius:6px;margin:0 0 18px 0;">
        <tr><td style="padding:18px 20px;">
          <h3 class="body-text" style="margin:0 0 10px 0;font-size:16px;color:#0d2340;font-weight:700;">Auftragsdetails</h3>
          <p class="body-text" style="margin:4px 0;font-size:15px;line-height:1.55;color:#374151;"><strong>Kunde:</strong> ${job.customer_name}</p>
          <p class="body-text" style="margin:4px 0;font-size:15px;line-height:1.55;color:#374151;"><strong>Unternehmen:</strong> ${job.company || 'Nicht angegeben'}</p>
          <p class="body-text" style="margin:4px 0;font-size:15px;line-height:1.55;color:#374151;"><strong>Einsatzort:</strong> ${job.einsatzort}</p>
          <p class="body-text" style="margin:4px 0;font-size:15px;line-height:1.55;color:#374151;"><strong>Zeitraum:</strong> ${(job.zeitraum ?? "").replace(/\s*Tag\(e\)\s*$/i, "").trim()}</p>
          <p class="body-text" style="margin:4px 0;font-size:15px;line-height:1.55;color:#374151;"><strong>Fahrzeugtyp:</strong> ${job.fahrzeugtyp}</p>
          <p class="body-text" style="margin:4px 0;font-size:15px;line-height:1.55;color:#374151;"><strong>Führerscheinklasse:</strong> ${job.fuehrerscheinklasse}</p>
          ${job.besonderheiten ? `<p class="body-text" style="margin:4px 0;font-size:15px;line-height:1.55;color:#374151;"><strong>Besonderheiten:</strong> ${job.besonderheiten}</p>` : ''}
          <p class="body-text" style="margin:4px 0;font-size:15px;line-height:1.55;color:#374151;"><strong>Nachricht:</strong> ${job.nachricht}</p>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f8fafc" style="background-color:#f8fafc;border:1px solid #e5e7eb;border-left:4px solid #bb2c29;border-collapse:separate;border-radius:6px;margin:0 0 18px 0;">
        <tr><td style="padding:18px 20px;text-align:center;">
          <h3 class="body-text" style="margin:0 0 8px 0;font-size:17px;color:#0d2340;font-weight:700;">Interesse? Bitte melden Sie sich!</h3>
          <p class="body-text" style="margin:0 0 8px 0;font-size:15px;line-height:1.55;color:#374151;">Rufen Sie uns an oder schreiben Sie per SMS/WhatsApp:</p>
          <p class="body-text" style="margin:8px 0 8px 0;font-size:22px;line-height:1.2;color:#bb2c29;font-weight:700;">
            <a href="tel:+4915771442285" style="color:#bb2c29;text-decoration:none;">+49-1577-1442285</a>
          </p>
          <p class="body-text" style="margin:0;font-size:14px;line-height:1.55;color:#374151;">
            Nennen Sie kurz Ihren Namen und dass Sie den Auftrag in <strong>${job.einsatzort}</strong> annehmen oder ablehnen möchten.
          </p>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background-color:#ffffff;border:1px solid #e5e7eb;border-collapse:separate;border-radius:6px;margin:0 0 14px 0;">
        <tr><td style="padding:16px 18px;">
          <p class="body-text" style="margin:0 0 6px 0;font-size:15px;line-height:1.55;color:#0d2340;"><strong>Vergütung &amp; Vermittlungsanteil</strong></p>
          <p class="body-text" style="margin:0;font-size:15px;line-height:1.6;color:#374151;">
            Vergütung und Vermittlungsanteil ergeben sich aus dem konkreten Auftragsangebot vor Einsatzbeginn.
            Die geltenden Fahrer-Vermittlungsbedingungen wurden Ihnen per E-Mail übermittelt.
          </p>
        </td></tr>
      </table>

      <p class="body-text" style="margin:8px 0 0 0;font-size:12px;color:#6b7280;">
        Diese E-Mail wurde automatisch generiert. Bei Fragen: info@kraftfahrer-mieten.com
      </p>
    `;

    const emailHtml = wrapDriverEmailHtml(innerHtml, {
      subject: `Neuer Auftrag: ${job.fahrzeugtyp} - Agenturabrechnung`,
      previewText: `Neuer Auftrag in ${job.einsatzort} – Agenturabrechnung über Fahrerexpress`,
      unsubscribeUrl,
      showUnsubscribe: !!unsubscribeUrl,
    });

    // Send email
    const emailResult = await resend.emails.send({
      from: 'Fahrerexpress <info@kraftfahrer-mieten.com>',
      to: [driver.email],
      subject: `🚛 Neuer Auftrag: ${job.fahrzeugtyp} - Agenturabrechnung`,
      html: emailHtml
    });

    if (emailResult.error) {
      console.error('Email sending failed:', emailResult.error);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log the notification
    await supabase
      .from('email_log')
      .insert({
        recipient: driver.email,
        template: 'driver_job_notification',
        job_id: jobId,
        status: 'sent',
        message_id: emailResult.data?.id
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Driver notification sent',
      emailId: emailResult.data?.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-driver-job-notification:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);
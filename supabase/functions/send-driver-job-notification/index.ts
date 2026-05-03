import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { verifyAdminAuth, createCorsHeaders, handleCorsPreflightRequest } from '../_shared/admin-auth.ts';

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
    if (driver.email_opt_out || driver.is_blocked) {
      console.log(`⛔ Skipping driver ${driverId} (email_opt_out=${driver.email_opt_out}, is_blocked=${driver.is_blocked})`);
      return new Response(JSON.stringify({ skipped: true, reason: driver.email_opt_out ? 'email_opt_out' : 'blocked' }), {
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

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🚛 Neuer Fahrerauftrag verfügbar</h2>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2563eb; margin-top: 0;">Agenturabrechnung – Vertrag mit Fahrerexpress</h3>
          <p style="margin: 10px 0;">Dieser Auftrag wird über Fahrerexpress abgerechnet. Sie erbringen die Leistung als selbstständiger Subunternehmer von Fahrerexpress.</p>
        </div>

        <div style="background: #fff; border: 1px solid #e5e5e5; padding: 20px; border-radius: 8px;">
          <h3>Auftragsdetails:</h3>
          <p><strong>Kunde:</strong> ${job.customer_name}</p>
          <p><strong>Unternehmen:</strong> ${job.company || 'Nicht angegeben'}</p>
          <p><strong>Einsatzort:</strong> ${job.einsatzort}</p>
          <p><strong>Zeitraum:</strong> ${job.zeitraum}</p>
          <p><strong>Fahrzeugtyp:</strong> ${job.fahrzeugtyp}</p>
          <p><strong>Führerscheinklasse:</strong> ${job.fuehrerscheinklasse}</p>
          ${job.besonderheiten ? `<p><strong>Besonderheiten:</strong> ${job.besonderheiten}</p>` : ''}
          <p><strong>Nachricht:</strong> ${job.nachricht}</p>
        </div>

        <div style="text-align: center; margin: 30px 0; padding: 24px; background: #f0fdf4; border: 2px solid #16a34a; border-radius: 12px;">
          <h3 style="color: #166534; margin-top: 0;">📱 Interesse? Bitte melden Sie sich!</h3>
          <p style="font-size: 16px; font-weight: bold; color: #166534;">
            Rufen Sie uns an oder schreiben Sie per SMS/WhatsApp:
          </p>
          <p style="font-size: 24px; font-weight: bold; color: #16a34a; margin: 16px 0;">
            📞 +49-1577-1442285
          </p>
          <p style="font-size: 14px; color: #666;">
            Nennen Sie kurz Ihren Namen und dass Sie den Auftrag in <strong>${job.einsatzort}</strong> annehmen oder ablehnen möchten.
          </p>
        </div>

        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px;"><strong>📋 Vergütung & Vermittlungsanteil:</strong></p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">
            Vergütung und Vermittlungsanteil ergeben sich aus dem konkreten Auftragsangebot vor Einsatzbeginn.
            Details: <a href="https://www.kraftfahrer-mieten.com/fahrer-vermittlungsbedingungen">Vermittlungsbedingungen für Fahrer</a>.
          </p>
        </div>

        <p style="font-size: 12px; color: #666;">
          Diese E-Mail wurde automatisch generiert. Bei Fragen: info@kraftfahrer-mieten.com
        </p>
      </div>
    `;

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
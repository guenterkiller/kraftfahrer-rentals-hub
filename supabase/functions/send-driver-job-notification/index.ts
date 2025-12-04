import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseKey || !resendApiKey) {
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
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
          <p style="margin: 0; font-size: 14px;"><strong>📋 Vermittlungsgebühr:</strong></p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">
            • 15 % für LKW CE Fahrer<br>
            • 20 % für Baumaschinenführer<br><br>
            Die Gebühr wird automatisch von Ihrem Rechnungsbetrag abgezogen.
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
      subject: `🚛 Neuer Auftrag: ${job.fahrzeugtyp} - ${billingInfo.title}`,
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
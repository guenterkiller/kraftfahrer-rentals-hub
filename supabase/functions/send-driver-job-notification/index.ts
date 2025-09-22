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
  billingModel: 'direct' | 'agency';
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

    // Generate response URLs with billing model
    const baseUrl = 'https://kraftfahrer-mieten.com';
    const acceptUrl = `${baseUrl}/driver/accept?job=${jobId}&driver=${driverId}&action=accept&billing=${billingModel}`;
    const declineUrl = `${baseUrl}/driver/accept?job=${jobId}&driver=${driverId}&action=decline`;

    // Generate rechtssichere email content based on billing model
    const billingInfo = billingModel === 'agency' 
      ? {
          title: "Agenturabrechnung – Vertrag mit Fahrerexpress",
          description: "Dieser Auftrag wird über Fahrerexpress abgerechnet. Sie erbringe die Leistung als selbstständiger Subunternehmer von Fahrerexpress.",
          consentText: `
            <div style="background: #fff3cd; border: 2px solid #856404; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h4 style="color: #856404; margin-top: 0;">⚠️ Wichtiger Hinweis - Rechtliche Zustimmung erforderlich:</h4>
              <p style="font-weight: bold; color: #856404;">
                <strong>Subunternehmer-Einsatz:</strong> Dieser Auftrag wird über Fahrerexpress abgerechnet. 
                Ich erbringe die Leistung als selbstständiger Subunternehmer von Fahrerexpress und stelle meine Rechnung an Fahrerexpress. 
                Die vereinbarte Provision/Marge wird von Fahrerexpress einbehalten. 
                Es handelt sich ausdrücklich nicht um Arbeitnehmerüberlassung, sondern um eine Dienst-/Werkleistung.
              </p>
              <p style="color: #856404; font-size: 14px;">
                Mit Klick auf "Annehmen" bestätigen Sie diese Bedingungen.
              </p>
            </div>
          `,
          acceptText: "✅ Auftrag als Subunternehmer annehmen"
        }
      : {
          title: "Direktabrechnung – Vertrag mit Auftraggeber", 
          description: "Sie rechnen direkt mit dem Auftraggeber ab. Fahrerexpress berechnet Ihnen eine Vermittlungsprovision.",
          consentText: `
            <div style="background: #d1f7d1; border: 2px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h4 style="color: #155724; margin-top: 0;">ℹ️ Direktabrechnung:</h4>
              <p style="font-weight: bold; color: #155724;">
                Ich rechne direkt mit dem Auftraggeber ab. Fahrerexpress stellt mir eine Vermittlungsprovision gemäß Vereinbarung in Rechnung.
              </p>
            </div>
          `,
          acceptText: "✅ Auftrag mit Direktabrechnung annehmen"
        };

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🚛 Neuer Fahrerauftrag verfügbar</h2>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2563eb; margin-top: 0;">${billingInfo.title}</h3>
          <p style="margin: 10px 0; font-weight: bold;">${billingInfo.description}</p>
        </div>

        ${billingInfo.consentText}

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

        <div style="margin: 30px 0; text-align: center;">
          <a href="${acceptUrl}" 
             style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 10px;">
            ${billingInfo.acceptText}
          </a>
          <br>
          <a href="${declineUrl}" 
             style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 10px;">
            ❌ Auftrag ablehnen
          </a>
        </div>

        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px;"><strong>Rechtlicher Hinweis:</strong></p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">
            Mit dem Klick auf "Annehmen" bestätigen Sie, dass Sie die Bedingungen des gewählten Abrechnungsmodells verstehen und akzeptieren.
            Es handelt sich ausdrücklich nicht um Arbeitnehmerüberlassung, sondern um Dienst-/Werkverträge.
          </p>
        </div>

        <p style="font-size: 12px; color: #666;">
          Diese E-Mail wurde automatisch generiert. Bei Fragen wenden Sie sich an info@kraftfahrer-mieten.com
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
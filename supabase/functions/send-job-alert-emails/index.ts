import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface JobAlertRequest {
  job_id: string;
  einsatzort: string;
  zeitraum: string;
  fahrzeugtyp: string;
  fuehrerscheinklasse: string;
  besonderheiten?: string;
  customer_name: string;
  customer_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: JobAlertRequest = await req.json();
    console.log("Received job alert request:", requestData);

    // Get all active drivers from jobalarm_fahrer
    const { data: drivers, error: driversError } = await supabase
      .from('jobalarm_fahrer')
      .select('email');

    if (driversError) {
      console.error("Error fetching drivers:", driversError);
      throw new Error("Failed to fetch driver emails");
    }

    if (!drivers || drivers.length === 0) {
      console.log("No drivers found for job alerts");
      return new Response(
        JSON.stringify({ message: "No drivers registered for job alerts" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending job alerts to ${drivers.length} drivers`);

    // Create unique response URLs for each driver
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const baseUrl = `${supabaseUrl}/functions/v1/handle-driver-response`;
    
    // Send emails to all drivers
    const emailPromises = drivers.map(async (driver) => {
      const availableUrl = `${baseUrl}?job_id=${requestData.job_id}&email=${encodeURIComponent(driver.email)}&response=available`;
      const unavailableUrl = `${baseUrl}?job_id=${requestData.job_id}&email=${encodeURIComponent(driver.email)}&response=unavailable`;

      return resend.emails.send({
        from: "Fahrer-Vermittlung <noreply@resend.dev>",
        to: [driver.email],
        subject: `🚛 Neuer Fahrerauftrag verfügbar - ${requestData.einsatzort}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Neuer Fahrerauftrag verfügbar</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Auftragsdaten:</h3>
              <p><strong>Einsatzort:</strong> ${requestData.einsatzort}</p>
              <p><strong>Zeitraum:</strong> ${requestData.zeitraum}</p>
              <p><strong>Fahrzeugtyp:</strong> ${requestData.fahrzeugtyp}</p>
              <p><strong>Führerscheinklasse:</strong> ${requestData.fuehrerscheinklasse}</p>
              ${requestData.besonderheiten ? `<p><strong>Besonderheiten:</strong> ${requestData.besonderheiten}</p>` : ''}
            </div>

            <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Ihre Antwort:</h3>
              <p>Sind Sie für diesen Auftrag verfügbar?</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${availableUrl}" 
                   style="display: inline-block; background: #22c55e; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 8px; margin: 0 10px; font-weight: bold;">
                  ✅ Ich bin verfügbar
                </a>
                
                <a href="${unavailableUrl}" 
                   style="display: inline-block; background: #ef4444; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 8px; margin: 0 10px; font-weight: bold;">
                  ❌ Ich bin nicht verfügbar
                </a>
              </div>
            </div>

            <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #0066cc;">
                <strong>Hinweis:</strong> Bitte antworten Sie schnell, da der Auftrag an den ersten verfügbaren Fahrer vergeben wird.
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666; text-align: center;">
              Diese E-Mail wurde automatisch gesendet. Bei Fragen kontaktieren Sie uns direkt.
            </p>
          </div>
        `,
      });
    });

    // Wait for all emails to be sent
    const results = await Promise.allSettled(emailPromises);
    
    let successCount = 0;
    let failureCount = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
        console.log(`Email sent successfully to ${drivers[index].email}`);
      } else {
        failureCount++;
        console.error(`Failed to send email to ${drivers[index].email}:`, result.reason);
      }
    });

    console.log(`Job alert emails sent: ${successCount} successful, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        message: `Job alert sent to ${successCount} drivers`,
        successCount,
        failureCount,
        totalDrivers: drivers.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-job-alert-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
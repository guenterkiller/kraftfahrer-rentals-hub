import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AssignDriverRequest {
  jobId: string;
  driverEmail: string;
  driverName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId, driverEmail, driverName }: AssignDriverRequest = await req.json();

    console.log("📧 Assigning driver to job:", { jobId, driverEmail, driverName });

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('job_requests')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error("❌ Job not found:", jobError);
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("✅ Job details found:", job);

    // Send email to driver
    const emailResponse = await resend.emails.send({
      from: "info@kraftfahrer-mieten.com",
      to: [driverEmail],
      subject: "Neue Fahreranfrage erhalten",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Neue Fahreranfrage verfügbar</h2>
          
          <p>Hallo ${driverName},</p>
          
          <p>wir haben eine neue Fahreranfrage erhalten, die zu Ihrem Profil passen könnte:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Auftragsdaten:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 40%;">Kunde:</td>
                <td style="padding: 8px 0;">${job.customer_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Unternehmen:</td>
                <td style="padding: 8px 0;">${job.company || 'Nicht angegeben'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Einsatzort:</td>
                <td style="padding: 8px 0;">${job.einsatzort}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Zeitraum:</td>
                <td style="padding: 8px 0;">${job.zeitraum}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Fahrzeugtyp:</td>
                <td style="padding: 8px 0;">${job.fahrzeugtyp}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Führerscheinklasse:</td>
                <td style="padding: 8px 0;">${job.fuehrerscheinklasse}</td>
              </tr>
              ${job.besonderheiten ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Besonderheiten:</td>
                <td style="padding: 8px 0;">${job.besonderheiten}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #1e40af;">Nächste Schritte:</h4>
            <p style="margin-bottom: 0;">
              Wenn Sie Interesse an diesem Auftrag haben, melden Sie sich bitte umgehend bei unserer Agentur:
            </p>
            <ul style="margin: 10px 0;">
              <li>📞 Telefon: [Ihre Telefonnummer]</li>
              <li>📧 E-Mail: info@kraftfahrer-mieten.com</li>
            </ul>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            Mit freundlichen Grüßen<br>
            Ihr Team von Kraftfahrer-Mieten.com
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
          </p>
        </div>
      `,
    });

    console.log("📧 Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Driver successfully assigned and notified",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in assign-driver-to-job function:", error);
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
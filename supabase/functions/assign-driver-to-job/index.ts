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
      cc: ["info@kraftfahrer-mieten.com"],
      subject: "Neue Fahraufgabe über Fahrerexpress – Bitte Rückmeldung",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
          <p>Hallo ${driverName},</p>
          
          <p>Sie wurden für folgenden Einsatz angefragt:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
            <p style="margin: 0;"><strong>📍 Ort:</strong> ${job.einsatzort}</p>
            <p style="margin: 8px 0;"><strong>📅 Zeitraum:</strong> ${job.zeitraum}</p>
            <p style="margin: 8px 0;"><strong>🚛 Fahrzeugtyp:</strong> ${job.fahrzeugtyp}</p>
            <p style="margin: 8px 0;"><strong>👤 Auftraggeber:</strong> ${job.customer_name}</p>
            <p style="margin: 8px 0;"><strong>📞 Kontakt:</strong> ${job.customer_phone}${job.customer_email ? ' / ' + job.customer_email : ''}</p>
            <p style="margin: 8px 0 0 0;"><strong>📄 Nachricht:</strong> ${job.nachricht}</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
            <h3 style="margin-top: 0; color: #856404;">📄 Vermittlungsbedingungen</h3>
            <p>Mit dieser E-Mail weisen wir Sie ausdrücklich auf folgende verbindliche Regelungen hin:</p>
            
            <h4 style="color: #856404; margin-top: 20px;">§ X – Vermittlungsprovision</h4>
            <p>Die Fahrerexpress-Agentur – Günter Killer erhält für jeden vermittelten Auftrag eine Provision in Höhe von <strong>15 % des tatsächlichen, vom Kunden gezahlten Netto-Honorars</strong> (ohne Umsatzsteuer) an den Fahrer.</p>
            <ul style="margin: 10px 0;">
              <li>Die Provision ist innerhalb von <strong>5 Werktagen</strong> nach Zahlungseingang durch den Fahrer zu überweisen.</li>
              <li>Der Fahrer verpflichtet sich, dem Vermittler eine Kopie der Rechnung oder einen Zahlungsnachweis zu senden.</li>
              <li>Bei nachträglicher Honorarkürzung (Rabatt, Skonto etc.) reduziert sich die Provision entsprechend.</li>
              <li>Erfolgt kein Nachweis, darf der Vermittler das ursprünglich vereinbarte Honorar zur Berechnung ansetzen.</li>
            </ul>
            
            <h4 style="color: #856404; margin-top: 20px;">§ Y – Kundenschutz (6 Monate)</h4>
            <p>Der Fahrer verpflichtet sich, während der laufenden Vermittlung und für <strong>6 Monate danach</strong>, keine direkten Verträge mit dem übermittelten Kunden abzuschließen – außer über den Vermittler.</p>
            <p>Bei Verstoß ist eine pauschale Vertragsstrafe i. H. v. <strong>1.000 € je Fall</strong> fällig.</p>
          </div>
          
          <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb;">
            <p style="margin: 0;"><strong>Bitte bestätigen Sie dem Kunden direkt die Einsatzmöglichkeit</strong> – und informieren Sie uns kurz per E-Mail an <a href="mailto:info@kraftfahrer-mieten.com">info@kraftfahrer-mieten.com</a>, ob Sie den Einsatz übernehmen.</p>
          </div>
          
          <p style="margin-top: 30px;">Vielen Dank und gute Fahrt!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-weight: bold;">Günter Killer</p>
            <p style="margin: 5px 0;">Fahrerexpress-Agentur</p>
            <p style="margin: 5px 0;"><a href="https://www.kraftfahrer-mieten.com" style="color: #007bff;">www.kraftfahrer-mieten.com</a></p>
          </div>
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
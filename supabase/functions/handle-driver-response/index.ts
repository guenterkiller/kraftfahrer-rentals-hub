import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const handler = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get('job_id');
    const email = url.searchParams.get('email');
    const response = url.searchParams.get('response');

    console.log("Driver response received:", { jobId, email, response });

    if (!jobId || !email || !response) {
      return new Response(
        '<html><body><h2>❌ Ungültige Anfrage</h2><p>Parameter fehlen.</p></body></html>',
        { 
          status: 400,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if this driver has already responded to this job
    const { data: existingResponse } = await supabase
      .from('jobalarm_antworten')
      .select('*')
      .eq('job_id', jobId)
      .eq('fahrer_email', email)
      .single();

    if (existingResponse) {
      return new Response(
        `<html><body><h2>ℹ️ Antwort bereits erfasst</h2><p>Sie haben bereits auf diesen Auftrag geantwortet.</p></body></html>`,
        { 
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }

    // Save the response to jobalarm_antworten
    const { error: insertError } = await supabase
      .from('jobalarm_antworten')
      .insert([{
        job_id: jobId,
        fahrer_email: email,
        antwort: response
      }]);

    if (insertError) {
      console.error("Error saving driver response:", insertError);
      return new Response(
        '<html><body><h2>❌ Fehler</h2><p>Die Antwort konnte nicht gespeichert werden.</p></body></html>',
        { 
          status: 500,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }

    // Get job details for notification email
    const { data: jobData } = await supabase
      .from('job_requests')
      .select('*')
      .eq('id', jobId)
      .single();

    let responseMessage = '';
    let responseColor = '';

    if (response === 'available') {
      responseMessage = '✅ Vielen Dank! Ihre Verfügbarkeit wurde erfasst.';
      responseColor = '#22c55e';

      // Send notification email to customer
      if (jobData) {
        try {
          await resend.emails.send({
            from: "Fahrer-Vermittlung <noreply@resend.dev>",
            to: ["info@kraftfahrer-mieten.com"],
            cc: ["guenter.killer@t-online.de"],
            subject: `🎉 Fahrer verfügbar für Auftrag ${jobData.einsatzort}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #22c55e;">Fahrer hat sich gemeldet!</h2>
                
                <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e;">
                  <p><strong>Fahrer E-Mail:</strong> ${email}</p>
                  <p><strong>Status:</strong> ✅ Verfügbar</p>
                </div>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Auftragsdaten:</h3>
                  <p><strong>Einsatzort:</strong> ${jobData.einsatzort}</p>
                  <p><strong>Zeitraum:</strong> ${jobData.zeitraum}</p>
                  <p><strong>Fahrzeugtyp:</strong> ${jobData.fahrzeugtyp}</p>
                  <p><strong>Kunde:</strong> ${jobData.customer_name} (${jobData.customer_email})</p>
                </div>

                <p>Bitte kontaktieren Sie den Fahrer direkt für weitere Absprachen.</p>
              </div>
            `,
          });

          // Check if this is the first available response - if so, mark job as assigned
          const { data: availableResponses } = await supabase
            .from('jobalarm_antworten')
            .select('*')
            .eq('job_id', jobId)
            .eq('antwort', 'available');

          if (availableResponses && availableResponses.length === 1) {
            // This is the first available response, mark job as assigned
            await supabase
              .from('job_requests')
              .update({ status: 'assigned' })
              .eq('id', jobId);
          }

        } catch (emailError) {
          console.error("Error sending notification email:", emailError);
        }
      }

    } else {
      responseMessage = '❌ Vielen Dank für Ihre Rückmeldung.';
      responseColor = '#ef4444';
    }

    // Return success page
    return new Response(
      `<html>
        <head>
          <meta charset="utf-8">
          <title>Antwort erfasst</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .success { color: ${responseColor}; background: ${response === 'available' ? '#f0fdf4' : '#fef2f2'}; 
                      padding: 20px; border-radius: 8px; text-align: center; }
            .details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="success">
            <h2>${responseMessage}</h2>
            <p>Ihre Antwort wurde erfolgreich gespeichert.</p>
          </div>
          
          ${jobData ? `
            <div class="details">
              <h3>Auftragsdaten:</h3>
              <p><strong>Einsatzort:</strong> ${jobData.einsatzort}</p>
              <p><strong>Zeitraum:</strong> ${jobData.zeitraum}</p>
              <p><strong>Fahrzeugtyp:</strong> ${jobData.fahrzeugtyp}</p>
            </div>
          ` : ''}
          
          ${response === 'available' ? 
            '<p><strong>Nächste Schritte:</strong> Sie werden zeitnah kontaktiert, falls Ihr Angebot berücksichtigt wird.</p>' : 
            '<p>Vielen Dank für Ihre ehrliche Rückmeldung. Beim nächsten passenden Auftrag melden wir uns wieder bei Ihnen.</p>'
          }
        </body>
      </html>`,
      { 
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );

  } catch (error: any) {
    console.error("Error in handle-driver-response function:", error);
    return new Response(
      '<html><body><h2>❌ Fehler</h2><p>Ein unerwarteter Fehler ist aufgetreten.</p></body></html>',
      { 
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  }
};

serve(handler);
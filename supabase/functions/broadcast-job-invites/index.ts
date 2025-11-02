import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "guenter.killer@t-online.de";

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Hole die 2 neuesten offenen Jobs
    const { data: jobs, error: jobsError } = await supabase
      .from("job_requests")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(2);

    if (jobsError) throw jobsError;
    if (!jobs || jobs.length === 0) {
      return new Response(JSON.stringify({ error: "No open jobs found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`📋 Found ${jobs.length} open jobs to broadcast`);

    // Hole alle approved Fahrer
    const { data: drivers, error: driversError } = await supabase
      .from("fahrer_profile")
      .select("id, vorname, nachname, email")
      .eq("status", "approved")
      .eq("email_opt_out", false);

    if (driversError) throw driversError;
    if (!drivers || drivers.length === 0) {
      return new Response(JSON.stringify({ error: "No approved drivers found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`👥 Found ${drivers.length} approved drivers`);

    const results = [];
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    // Für jeden Fahrer
    for (const driver of drivers) {
      const invites = [];

      // Erstelle Invite-Token für jeden Job
      for (const job of jobs) {
        // Generiere Token
        const tokenBytes = crypto.getRandomValues(new Uint8Array(24));
        const token = Array.from(tokenBytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        // Speichere Invite
        const { data: invite, error: inviteError } = await supabase
          .from("assignment_invites")
          .insert({
            job_id: job.id,
            driver_id: driver.id,
            token: token,
            token_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            status: 'pending'
          })
          .select()
          .single();

        if (inviteError) {
          console.error(`❌ Failed to create invite for driver ${driver.email}, job ${job.id}:`, inviteError);
          continue;
        }

        invites.push({ job, invite });
      }

      // Sende Mail mit beiden Jobs
      if (resend && invites.length > 0) {
        const acceptLink1 = invites[0] ? `${supabaseUrl}/functions/v1/handle-driver-job-response?a=accept&t=${invites[0].invite.token}` : '';
        const declineLink1 = invites[0] ? `${supabaseUrl}/functions/v1/handle-driver-job-response?a=decline&t=${invites[0].invite.token}` : '';
        
        const acceptLink2 = invites[1] ? `${supabaseUrl}/functions/v1/handle-driver-job-response?a=accept&t=${invites[1].invite.token}` : '';
        const declineLink2 = invites[1] ? `${supabaseUrl}/functions/v1/handle-driver-job-response?a=decline&t=${invites[1].invite.token}` : '';

        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1f2937;">Neue Aufträge verfügbar!</h1>
            <p>Hallo ${driver.vorname || 'Fahrer'},</p>
            <p>Wir haben neue Aufträge für dich:</p>

            ${invites[0] ? `
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1f2937; margin-top: 0;">Auftrag 1: ${invites[0].job.customer_name}</h2>
              ${invites[0].job.company ? `<p><strong>Firma:</strong> ${invites[0].job.company}</p>` : ''}
              <p><strong>Einsatzort:</strong> ${invites[0].job.einsatzort}</p>
              <p><strong>Zeitraum:</strong> ${invites[0].job.zeitraum}</p>
              <p><strong>Fahrzeugtyp:</strong> ${invites[0].job.fahrzeugtyp}</p>
              <p><strong>Führerschein:</strong> ${invites[0].job.fuehrerscheinklasse}</p>
              ${invites[0].job.besonderheiten ? `<p><strong>Besonderheiten:</strong> ${invites[0].job.besonderheiten}</p>` : ''}
              
              <div style="margin-top: 20px;">
                <a href="${acceptLink1}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                  ✅ Annehmen
                </a>
                <a href="${declineLink1}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  ❌ Ablehnen
                </a>
              </div>
            </div>
            ` : ''}

            ${invites[1] ? `
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1f2937; margin-top: 0;">Auftrag 2: ${invites[1].job.customer_name}</h2>
              ${invites[1].job.company ? `<p><strong>Firma:</strong> ${invites[1].job.company}</p>` : ''}
              <p><strong>Einsatzort:</strong> ${invites[1].job.einsatzort}</p>
              <p><strong>Zeitraum:</strong> ${invites[1].job.zeitraum}</p>
              <p><strong>Fahrzeugtyp:</strong> ${invites[1].job.fahrzeugtyp}</p>
              <p><strong>Führerschein:</strong> ${invites[1].job.fuehrerscheinklasse}</p>
              ${invites[1].job.besonderheiten ? `<p><strong>Besonderheiten:</strong> ${invites[1].job.besonderheiten}</p>` : ''}
              
              <div style="margin-top: 20px;">
                <a href="${acceptLink2}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                  ✅ Annehmen
                </a>
                <a href="${declineLink2}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  ❌ Ablehnen
                </a>
              </div>
            </div>
            ` : ''}

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Diese Links sind 48 Stunden gültig.<br>
              Bei Fragen: +49-1577-1442285 oder info@kraftfahrer-mieten.com
            </p>
          </div>
        `;

        try {
          const emailResult = await resend.emails.send({
            from: 'Fahrerexpress <info@kraftfahrer-mieten.com>',
            to: [driver.email],
            subject: `${invites.length} neue Aufträge verfügbar`,
            html: html
          });

          console.log(`✅ Mail sent to ${driver.email}:`, emailResult);

          // Log in email_log
          await supabase.from("email_log").insert({
            recipient: driver.email,
            subject: `${invites.length} neue Aufträge verfügbar`,
            template: "job-broadcast",
            status: "sent",
            sent_at: new Date().toISOString(),
            message_id: emailResult.data?.id
          });

          results.push({ driver: driver.email, status: 'sent', jobs: invites.length });
        } catch (emailError) {
          console.error(`❌ Failed to send mail to ${driver.email}:`, emailError);
          
          await supabase.from("email_log").insert({
            recipient: driver.email,
            subject: `${invites.length} neue Aufträge verfügbar`,
            template: "job-broadcast",
            status: "failed",
            error_message: emailError.message || String(emailError)
          });

          results.push({ driver: driver.email, status: 'failed', error: emailError.message });
        }
      }
    }

    console.log(`📊 Broadcast complete: ${results.length} drivers processed`);

    return new Response(JSON.stringify({
      success: true,
      jobs: jobs.length,
      drivers: drivers.length,
      results: results
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in broadcast-job-invites:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(handler);

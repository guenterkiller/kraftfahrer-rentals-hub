import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function page(title: string, body?: string, isSuccess: boolean = true) {
  const bgColor = isSuccess ? '#d4fdf7' : '#fef2f2';
  const borderColor = isSuccess ? '#10b981' : '#ef4444';
  const textColor = isSuccess ? '#065f46' : '#991b1b';
  
  return new Response(
    `<!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 24px;
          line-height: 1.55;
        }
        .message {
          background: ${bgColor};
          border: 1px solid ${borderColor};
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        h1 {
          color: ${textColor};
          margin: 0 0 15px 0;
          font-size: 20px;
        }
        p {
          color: ${textColor};
          margin: 10px 0;
        }
        .contact {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="message">
        <h1>${title}</h1>
        ${body ? `<p>${body}</p>` : ""}
        <p>Vielen Dank! Du kannst dieses Fenster schließen.</p>
      </div>
      <div class="contact">
        <p><strong>Bei Fragen:</strong></p>
        <p>
          📞 +49-1577-1442285<br>
          ✉️ info@kraftfahrer-mieten.com
        </p>
      </div>
    </body>
    </html>`,
    { 
      status: 200,
      headers: { ...corsHeaders, "content-type": "text/html; charset=utf-8" } 
    }
  );
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Support both formats: ?a=accept&t=token OR ?p=base64payload (für Mailer mit Tracking-Problemen)
    let action = url.searchParams.get("a"); // accept | decline
    let token = url.searchParams.get("t"); // Einmal-Token
    
    // Fallback: Kompakt-Payload für kaputte Tracking-Links
    const p = url.searchParams.get("p");
    if (p && !action && !token) {
      try {
        const obj = JSON.parse(atob(p));
        action = obj?.a;
        token = obj?.t;
      } catch (e) {
        console.error("Failed to parse p parameter:", e);
      }
    }

    console.log(`📩 Driver response: action=${action}, token=${token?.substring(0, 8)}...`);

    if (!token || !action || !["accept", "decline"].includes(action)) {
      return page("Ungültiger Link", "Bitte verwende den Button aus der E-Mail.", false);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "guenter.killer@t-online.de";

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return page("Systemfehler", "Fehlende Konfiguration. Bitte melde dich beim Disponenten.", false);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Token auflösen → invite nachschlagen (KEINE AUTO-ZUWEISUNG!)
    const { data: invite, error } = await supabase
      .from("assignment_invites")
      .select(`
        id, 
        job_id, 
        driver_id, 
        token_expires_at, 
        status,
        responded_at,
        driver:fahrer_profile(id, vorname, nachname, email, telefon, plz, ort),
        job:job_requests(id, customer_name, company, einsatzort, zeitraum, fahrzeugtyp, fuehrerscheinklasse, status)
      `)
      .eq("token", token)
      .maybeSingle();

    if (error) {
      console.error("Error fetching invite:", error);
      return page("Fehler", "Einladung konnte nicht geladen werden. Bitte melde dich beim Disponenten.", false);
    }

    if (!invite) {
      return page("Einladung nicht gefunden", "Bitte melde dich beim Disponenten.", false);
    }

    // Ablaufdatum prüfen
    if (new Date(invite.token_expires_at) < new Date()) {
      return page("Link abgelaufen", "Dieser Link ist leider abgelaufen. Bitte melde dich beim Disponenten für einen neuen Link.", false);
    }

    // One-Shot-Schutz: Prüfe ob bereits beantwortet
    if (invite.responded_at) {
      return page("Bereits beantwortet", "Du hast auf diese Einladung bereits geantwortet.");
    }

    const driver = invite.driver as any;
    const job = invite.job as any;
    const friendlyAction = action === "accept" ? "ANGENOMMEN ✅" : "ABGELEHNT ❌";
    const actionVerb = action === "accept" ? "angenommen" : "abgelehnt";

    // Log in email_log
    await supabase.from("email_log").insert({
      recipient: adminEmail,
      subject: `[Antwort] ${driver?.vorname || "Fahrer"} ${driver?.nachname || ""} – ${friendlyAction} – Job ${job?.customer_name || invite.job_id}`,
      template: "driver-response",
      status: "pending",
      job_id: invite.job_id,
    });

    // Admin-E-Mail senden (NUR Information, KEINE Auto-Zuweisung)
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      
      const subject = `[Antwort] ${driver?.vorname || "Fahrer"} ${driver?.nachname || ""} – ${friendlyAction} – Job ${job?.customer_name || invite.job_id}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${action === 'accept' ? '#d4fdf7' : '#fef2f2'}; border: 2px solid ${action === 'accept' ? '#10b981' : '#ef4444'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: ${action === 'accept' ? '#065f46' : '#991b1b'}; margin: 0 0 15px 0;">
              ${friendlyAction} - Fahrerantwort eingegangen
            </h2>
            <p style="color: ${action === 'accept' ? '#065f46' : '#991b1b'}; margin: 0; font-size: 16px;">
              <strong>${driver?.vorname || "Fahrer"} ${driver?.nachname || ""}</strong> hat den Auftrag <strong>${actionVerb}</strong>.
            </p>
          </div>
          
          <div style="background: #fff; border: 1px solid #e5e5e5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Fahrerdetails:</h3>
            <p><strong>Name:</strong> ${driver?.vorname || ""} ${driver?.nachname || ""}</p>
            <p><strong>E-Mail:</strong> ${driver?.email || "Keine Angabe"}</p>
            <p><strong>Telefon:</strong> ${driver?.telefon || "Keine Angabe"}</p>
            <p><strong>Ort:</strong> ${driver?.plz || ""} ${driver?.ort || ""}</p>
            
            <h3 style="color: #1f2937;">Auftragsdetails:</h3>
            <p><strong>Job-ID:</strong> ${invite.job_id}</p>
            <p><strong>Kunde:</strong> ${job?.customer_name || "Unbekannt"}</p>
            ${job?.company ? `<p><strong>Firma:</strong> ${job.company}</p>` : ""}
            <p><strong>Einsatzort:</strong> ${job?.einsatzort || "Keine Angabe"}</p>
            <p><strong>Zeitraum:</strong> ${job?.zeitraum || "Nach Absprache"}</p>
            <p><strong>Fahrzeugtyp:</strong> ${job?.fahrzeugtyp || "LKW"}</p>
            <p><strong>Führerscheinklasse:</strong> ${job?.fuehrerscheinklasse || "C+E"}</p>
            <p><strong>Job-Status:</strong> ${job?.status || "open"}</p>
            
            <h3 style="color: #1f2937;">Antwort-Details:</h3>
            <p><strong>Aktion:</strong> ${friendlyAction}</p>
            <p><strong>Zeit:</strong> ${new Date().toLocaleString("de-DE", { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })} Uhr</p>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0;">
              <strong>⚠️ Wichtig:</strong> Es wurde <strong>KEINE</strong> automatische Zuweisung vorgenommen. 
              Bitte im Admin-Dashboard manuell entscheiden und den Fahrer zuweisen, wenn gewünscht.
            </p>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Diese E-Mail wurde automatisch versendet, als der Fahrer auf den Button geklickt hat.
          </p>
        </div>
      `;

      try {
        const emailResult = await resend.emails.send({
          from: 'Fahrerexpress System <info@kraftfahrer-mieten.com>',
          to: [adminEmail],
          subject: subject,
          html: html
        });

        console.log(`✅ Admin notification sent to ${adminEmail}:`, emailResult);

        // Update email_log
        await supabase.from("email_log")
          .update({ 
            status: "sent", 
            sent_at: new Date().toISOString(),
            message_id: emailResult.data?.id 
          })
          .eq("recipient", adminEmail)
          .eq("template", "driver-response")
          .order("created_at", { ascending: false })
          .limit(1);

      } catch (emailError) {
        console.error('❌ Failed to send admin notification:', emailError);
        
        // Update email_log with error
        await supabase.from("email_log")
          .update({ 
            status: "failed",
            error_message: emailError.message || String(emailError)
          })
          .eq("recipient", adminEmail)
          .eq("template", "driver-response")
          .order("created_at", { ascending: false })
          .limit(1);
      }
    }

    // Log in jobalarm_antworten (Statistik/Tracking)
    const userAgent = req.headers.get("user-agent") || "";
    const forwardedFor = req.headers.get("x-forwarded-for") || "";
    const realIp = req.headers.get("x-real-ip") || "";
    const ip = forwardedFor || realIp || "";
    
    await supabase.from("jobalarm_antworten").insert({
      job_id: invite.job_id,
      fahrer_email: driver?.email || "unknown",
      antwort: action
    });
    
    // Mark invite as responded (One-Shot-Schutz)
    await supabase
      .from("assignment_invites")
      .update({ responded_at: new Date().toISOString() })
      .eq("id", invite.id);
    
    console.log(`📊 Logged response: job=${invite.job_id}, driver=${driver?.email}, action=${action}, ip=${ip}`);

    // Erfolgsseite zurückgeben
    const confirmMsg = action === "accept"
      ? "Danke! Deine Zusage wurde an die Disposition weitergeleitet. Wir melden uns in Kürze bei dir."
      : "Danke für deine Rückmeldung. Wir haben die Disposition informiert.";
    
    console.log(`✅ Driver response processed: ${actionVerb} by ${driver?.vorname} ${driver?.nachname}`);
    
    return page("Rückmeldung erfasst", confirmMsg, true);

  } catch (e) {
    console.error("Unexpected error in handle-driver-job-response:", e);
    return page("Unerwarteter Fehler", "Bitte melde dich beim Disponenten.", false);
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function page(title: string, message?: string, accent: "ok" | "warn" = "ok") {
  const color = accent === "ok" ? "#16a34a" : "#ef4444";
  
  return new Response(
    `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Fahrerexpress – Rückmeldung</title>
  <style>
    :root { --accent:${color}; --text:#111827; --muted:#6b7280; --bg:#ffffff; }
    body { margin:0; font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif; background:var(--bg); color:var(--text); }
    .wrap { max-width:560px; margin:48px auto; padding:0 20px; }
    .card { border:1px solid #e5e7eb; border-radius:16px; padding:24px; box-shadow:0 1px 2px rgba(0,0,0,.04); }
    .logo { display:flex; align-items:center; gap:10px; margin-bottom:12px; color:var(--accent); font-weight:700; letter-spacing:.2px }
    .logo svg{ width:28px; height:28px; }
    h1 { font-size:20px; margin:8px 0 6px; }
    p { margin:6px 0 0; color:var(--muted); line-height:1.5 }
    .ok { color:var(--accent); font-weight:700 }
    .btn { margin-top:16px; display:inline-block; padding:10px 14px; border-radius:10px; background:var(--accent); color:#fff; text-decoration:none; font-weight:600; cursor:pointer; border:none; font-size:14px; }
    .btn:hover { opacity:0.9; }
    .foot { margin-top:18px; font-size:12px; color:#9ca3af }
    .contact { margin-top:20px; padding:12px; background:#f9fafb; border-radius:8px; font-size:13px; color:#6b7280; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-width="2" d="M3 13h2l2 7h8l2-7h2"/><path stroke-width="2" d="M5 13l4-9h6l4 9"/><circle cx="7.5" cy="20.5" r="1.5"/><circle cx="16.5" cy="20.5" r="1.5"/></svg>
        <span>Fahrerexpress</span>
      </div>
      <h1>${title}</h1>
      ${message ? `<p>${message}</p>` : ""}
      <button class="btn" onclick="window.close();">Fenster schließen</button>
      <div class="foot">Wenn sich das Fenster nicht automatisch schließt, bitte einfach schließen.</div>
      <div class="contact">
        <strong>Bei Fragen:</strong><br>
        📞 +49-1577-1442285 | ✉️ info@kraftfahrer-mieten.com
      </div>
    </div>
  </div>
  <script>
    // Versuche, In-App WebView Tabs elegant zu schließen
    setTimeout(function(){ try { window.close(); } catch(_){} }, 600);
  </script>
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
      return page("Ungültiger Link", "Bitte verwende den Button aus der E-Mail.", "warn");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "guenter.killer@t-online.de";

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return page("Systemfehler", "Fehlende Konfiguration. Bitte melde dich beim Disponenten.", "warn");
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
      return page("Fehler", "Einladung konnte nicht geladen werden. Bitte melde dich beim Disponenten.", "warn");
    }

    if (!invite) {
      return page("Einladung nicht gefunden", "Bitte melde dich beim Disponenten.", "warn");
    }

    // Ablaufdatum prüfen
    if (new Date(invite.token_expires_at) < new Date()) {
      return page("Link abgelaufen oder ungültig", "Bitte melde dich kurz beim Disponenten für einen neuen Link.", "warn");
    }

    // Atomare One-Shot-Sperre: Setze responded_at NUR wenn noch null
    // Race-Condition-sicher durch UPDATE mit WHERE-Bedingung
    const nowIso = new Date().toISOString();
    const { data: lockRow, error: lockErr } = await supabase
      .from("assignment_invites")
      .update({ responded_at: nowIso })
      .eq("id", invite.id)
      .is("responded_at", null)
      .select("id");

    if (lockErr) {
      console.error("Lock error:", lockErr);
      return page("Technischer Fehler", "Bitte melde dich beim Disponenten.", "warn");
    }

    // Wenn keine Zeile betroffen → bereits beantwortet (kein Mail/Log)
    if (!lockRow || lockRow.length === 0) {
      console.log(`⚠️ Already responded: invite=${invite.id}, token=${token?.substring(0, 8)}...`);
      return page("Bereits beantwortet", "Danke! Deine Rückmeldung liegt bereits vor.", "ok");
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
    // Die Tabelle erwartet 'available' (= accept) oder 'unavailable' (= decline)
    const antwortValue = action === "accept" ? "available" : "unavailable";
    
    await supabase.from("jobalarm_antworten").insert({
      job_id: invite.job_id,
      fahrer_email: driver?.email || "unknown",
      antwort: antwortValue
    });
    
    console.log(`📊 Logged response: job=${invite.job_id}, driver=${driver?.email}, action=${action}`);

    // Erfolgsseite zurückgeben
    const successTitle = action === "accept" ? "Rückmeldung erfasst ✅" : "Rückmeldung erfasst ❌";
    const confirmMsg = action === "accept"
      ? "Danke! Deine Zusage wurde an die Disposition weitergeleitet."
      : "Danke für deine Rückmeldung. Wir informieren die Disposition.";
    
    console.log(`✅ Driver response processed: ${actionVerb} by ${driver?.vorname} ${driver?.nachname}`);
    
    return page(successTitle, confirmMsg, "ok");

  } catch (e) {
    console.error("Unexpected error in handle-driver-job-response:", e);
    return page("Unerwarteter Fehler", "Bitte melde dich beim Disponenten.", "warn");
  }
};

serve(handler);

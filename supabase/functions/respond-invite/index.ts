import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

function page(msg: string, isSuccess: boolean = true) {
  const bgColor = isSuccess ? '#d4fdf7' : '#fef2f2';
  const borderColor = isSuccess ? '#10b981' : '#ef4444';
  const textColor = isSuccess ? '#065f46' : '#991b1b';
  
  return new Response(
    `<!DOCTYPE html>
    <html>
    <head>
      <title>${msg}</title>
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
        h2 {
          color: ${textColor};
          margin: 0 0 15px 0;
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
        }
      </style>
    </head>
    <body>
      <div class="message">
        <h2>${msg}</h2>
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
      headers: { "content-type": "text/html; charset=utf-8" } 
    }
  );
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("a"); // "accept" | "decline"
    const token = url.searchParams.get("t"); // Einmal-Token

    console.log(`📩 Invite response: action=${action}, token=${token?.substring(0, 8)}...`);

    if (!action || !token || !["accept", "decline"].includes(action)) {
      return page("❌ Ungültiger Link oder Aktion", false);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return page("⚠️ Systemfehler: Fehlende Konfiguration", false);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Token validieren und Einladung laden
    const { data: invite, error } = await supabase
      .from("assignment_invites")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (error) {
      console.error("Error fetching invite:", error);
      return page("⚠️ Fehler beim Laden der Einladung", false);
    }

    if (!invite) {
      return page("❌ Einladung nicht gefunden", false);
    }

    // Status prüfen
    if (invite.status !== "pending") {
      const statusText = invite.status === "accepted" 
        ? "angenommen" 
        : invite.status === "declined" 
        ? "abgelehnt" 
        : "abgelaufen";
      return page(`ℹ️ Bereits beantwortet: "${statusText}"`, false);
    }

    // Ablaufdatum prüfen
    if (new Date(invite.token_expires_at) < new Date()) {
      await supabase
        .from("assignment_invites")
        .update({ 
          status: "expired", 
          responded_at: new Date().toISOString() 
        })
        .eq("id", invite.id);
      
      return page("⏱️ Dieser Link ist abgelaufen", false);
    }

    // Status aktualisieren
    const newStatus = action === "accept" ? "accepted" : "declined";
    const userAgent = req.headers.get("user-agent") ?? "";
    const forwardedFor = req.headers.get("x-forwarded-for") ?? "";
    const realIp = req.headers.get("x-real-ip") ?? "";
    const ip = forwardedFor || realIp || "";

    const { error: updateError } = await supabase
      .from("assignment_invites")
      .update({
        status: newStatus,
        responded_at: new Date().toISOString(),
        user_agent: userAgent,
        ip: ip || null
      })
      .eq("id", invite.id);

    if (updateError) {
      console.error("Error updating invite:", updateError);
      return page("⚠️ Fehler beim Speichern der Antwort", false);
    }

    console.log(`✅ Invite ${invite.id} updated to ${newStatus}`);

    // Bei Accept: Assignment erstellen
    if (newStatus === "accepted") {
      const { error: rpcError } = await supabase.rpc("ensure_job_assignment", {
        p_job_id: invite.job_id,
        p_driver_id: invite.driver_id
      });

      if (rpcError) {
        console.error("Error creating assignment:", rpcError);
        return page("⚠️ Annahme gespeichert, aber Assignment-Erstellung fehlgeschlagen", false);
      }

      console.log(`✅ Assignment created for job ${invite.job_id} and driver ${invite.driver_id}`);
      return page("✅ Bestätigt: Du hast den Auftrag angenommen", true);
    } else {
      console.log(`✅ Invite declined for job ${invite.job_id}`);
      return page("✅ Bestätigt: Du hast den Auftrag abgelehnt", true);
    }

  } catch (e) {
    console.error("Unexpected error in respond-invite:", e);
    return page("⚠️ Unerwarteter Fehler. Bitte melde dich beim Disponenten.", false);
  }
};

serve(handler);

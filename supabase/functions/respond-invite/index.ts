import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "https://esm.sh/resend@4.0.0";

type ResponseStatus =
  | "accepted"
  | "declined"
  | "already_answered"
  | "expired"
  | "invalid"
  | "error";

const MESSAGES: Record<ResponseStatus, string> = {
  accepted:
    "Vielen Dank. Ihre Rückmeldung wurde übermittelt. Fahrerexpress meldet sich zur weiteren Abstimmung.",
  declined: "Vielen Dank. Ihre Rückmeldung wurde übermittelt.",
  already_answered: "Ihre Rückmeldung wurde bereits erfasst.",
  expired: "Dieser Link ist abgelaufen.",
  invalid: "Dieser Link ist ungültig oder wurde nicht gefunden.",
  error:
    "Es ist ein Fehler aufgetreten. Bitte melden Sie sich direkt bei Fahrerexpress: info@kraftfahrer-mieten.com oder 01577 1442285.",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function reply(status: ResponseStatus, httpStatus = 200): Response {
  return new Response(
    JSON.stringify({ status, message: MESSAGES[status] }),
    {
      status: httpStatus,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

function safeGetReply(action: string | null, token: string | null): Response {
  // GET ist immer side-effect-free (Schutz vor Mail-Link-Scannern / Prefetch).
  // Liefert nur neutralen Hinweis – KEINE DB-Writes, KEINE Admin-Mail.
  const body = {
    status: "preview",
    message:
      "Bitte bestätigen Sie Ihre Rückmeldung auf der Webseite. Diese Adresse ändert keinen Status.",
    action: action ?? null,
    has_token: !!token,
    confirm_url: token && action
      ? `https://www.kraftfahrer-mieten.com/fahrer-antwort-bestaetigen?action=${encodeURIComponent(action)}&token=${encodeURIComponent(token)}`
      : "https://www.kraftfahrer-mieten.com/",
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

const handler = async (req: Request): Promise<Response> => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(req.url);

    // ===== GET = side-effect-free =====
    // Schützt gegen Mail-Link-Scanner / Prefetch (z.B. Go-http-client/2.0 von Google Cloud).
    if (req.method === "GET") {
      const a = url.searchParams.get("a") ?? url.searchParams.get("action");
      const t = url.searchParams.get("t") ?? url.searchParams.get("token");
      console.log(
        `🔎 GET (no-op) respond-invite: action=${a}, token=${t?.substring(0, 8)}..., ua=${req.headers.get("user-agent")}`,
      );
      return safeGetReply(a, t);
    }

    // ===== Nur POST darf Status ändern =====
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json; charset=utf-8",
            "Allow": "POST, GET, OPTIONS",
          },
        },
      );
    }

    // POST: Body kann JSON oder FormData sein. Query-Params als Fallback.
    let action: string | null = null;
    let token: string | null = null;
    const ct = req.headers.get("content-type") || "";
    try {
      if (ct.includes("application/json")) {
        const body = await req.json();
        action = body?.action ?? body?.a ?? null;
        token = body?.token ?? body?.t ?? null;
      } else if (
        ct.includes("application/x-www-form-urlencoded") ||
        ct.includes("multipart/form-data")
      ) {
        const form = await req.formData();
        action = (form.get("action") ?? form.get("a")) as string | null;
        token = (form.get("token") ?? form.get("t")) as string | null;
      }
    } catch (_e) {
      // ignore – fallback auf Query
    }
    if (!action) action = url.searchParams.get("action") ?? url.searchParams.get("a");
    if (!token) token = url.searchParams.get("token") ?? url.searchParams.get("t");

    // Normalisierung: accepted/declined → accept/decline
    if (action === "accepted") action = "accept";
    if (action === "declined") action = "decline";

    console.log(`📩 POST respond-invite: action=${action}, token=${token?.substring(0, 8)}...`);

    if (!action || !token || !["accept", "decline"].includes(action)) {
      return reply("invalid");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return reply("error");
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
      return reply("error");
    }

    if (!invite) {
      return reply("invalid");
    }

    // Status prüfen
    if (invite.status !== "pending") {
      return reply("already_answered");
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
      
      return reply("expired");
    }

    // Status aktualisieren
    const newStatus = action === "accept" ? "accepted" : "declined";
    const userAgent = req.headers.get("user-agent") ?? "";
    const forwardedFor = req.headers.get("x-forwarded-for") ?? "";
    const realIp = req.headers.get("x-real-ip") ?? "";
    const rawIp = forwardedFor || realIp || "";
    // x-forwarded-for kann mehrere IPs enthalten, nur die erste verwenden
    const ip = rawIp.split(",")[0].trim();

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
      return reply("error");
    }

    console.log(`✅ Invite ${invite.id} updated to ${newStatus}`);

    // Admin-Mail senden
    try {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      const adminTo = Deno.env.get("ADMIN_TO") || Deno.env.get("ADMIN_EMAIL") || "info@kraftfahrer-mieten.com";
      const mailFrom = Deno.env.get("MAIL_FROM") || "Kraftfahrer-Mieten <noreply@kraftfahrer-mieten.com>";

      const { data: driver } = await supabase
        .from("fahrer_profile")
        .select("vorname, nachname, email, telefon")
        .eq("id", invite.driver_id)
        .maybeSingle();

      const { data: job } = await supabase
        .from("job_requests")
        .select("fahrzeugtyp, einsatzort, zeitraum, nachricht")
        .eq("id", invite.job_id)
        .maybeSingle();

      const driverName = driver ? `${driver.vorname ?? ""} ${driver.nachname ?? ""}`.trim() : "Unbekannt";
      const subject = newStatus === "accepted"
        ? "Fahrer kann Auftrag übernehmen"
        : "Fahrer kann Auftrag nicht übernehmen";
      const respondedAt = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });

      const html = `
        <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:${newStatus === "accepted" ? "#16a34a" : "#dc2626"};">${subject}</h2>
          <h3>Fahrer</h3>
          <p>
            <strong>Name:</strong> ${driverName}<br/>
            <strong>E-Mail:</strong> ${driver?.email ?? "-"}<br/>
            <strong>Telefon:</strong> ${driver?.telefon ?? "-"}
          </p>
          <h3>Auftrag</h3>
          <p>
            <strong>Fahrzeugtyp:</strong> ${job?.fahrzeugtyp ?? "-"}<br/>
            <strong>Einsatzort:</strong> ${job?.einsatzort ?? "-"}<br/>
            <strong>Zeitraum:</strong> ${job?.zeitraum ?? "-"}<br/>
            <strong>Tätigkeit:</strong> ${job?.nachricht ?? "-"}
          </p>
          <p>
            <strong>Antwort:</strong> ${newStatus === "accepted" ? "übernehmen" : "nicht übernehmen"}<br/>
            <strong>Zeitpunkt:</strong> ${respondedAt}
          </p>
          <p style="color:#666;font-size:12px;">Job-ID: ${invite.job_id}<br/>Fahrer-ID: ${invite.driver_id}</p>
        </div>`;

      if (resendKey) {
        const resend = new Resend(resendKey);
        const { error: mailError } = await resend.emails.send({
          from: mailFrom,
          to: [adminTo],
          subject,
          html,
        });
        if (mailError) {
          console.error("Admin mail send error:", mailError);
        } else {
          console.log(`✅ Admin notified: ${subject}`);
        }
      } else {
        console.warn("RESEND_API_KEY not set – admin mail skipped");
      }
    } catch (mailErr) {
      console.error("Admin notification error:", mailErr);
    }

    // Bei Accept: Assignment erstellen oder vorhandenes erkennen
    if (newStatus === "accepted") {
      // Doppeltes Assignment erkennen
      const { data: existingAssignment } = await supabase
        .from("job_assignments")
        .select("id, status")
        .eq("job_id", invite.job_id)
        .eq("driver_id", invite.driver_id)
        .maybeSingle();

      let assignmentError: any = null;
      if (!existingAssignment) {
        const { error: rpcError } = await supabase.rpc("ensure_job_assignment", {
          p_job_id: invite.job_id,
          p_driver_id: invite.driver_id,
        });
        assignmentError = rpcError ?? null;
      } else {
        console.log(`ℹ️ Assignment already exists (${existingAssignment.id}, status=${existingAssignment.status})`);
      }

      if (assignmentError) {
        console.error("Error creating assignment:", assignmentError);
        // Admin-Fehlermail
        try {
          const resendKey = Deno.env.get("RESEND_API_KEY");
          const adminTo = Deno.env.get("ADMIN_TO") || Deno.env.get("ADMIN_EMAIL") || "info@kraftfahrer-mieten.com";
          const mailFrom = Deno.env.get("MAIL_FROM") || "Kraftfahrer-Mieten <noreply@kraftfahrer-mieten.com>";
          if (resendKey) {
            const { data: drv } = await supabase
              .from("fahrer_profile")
              .select("vorname, nachname, email")
              .eq("id", invite.driver_id)
              .maybeSingle();
            const drvName = drv ? `${drv.vorname ?? ""} ${drv.nachname ?? ""}`.trim() : "-";
            const errMsg = (assignmentError as any)?.message || JSON.stringify(assignmentError);
            const ts = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
            const errHtml = `
              <div style="font-family:Arial,sans-serif;max-width:600px;">
                <h2 style="color:#dc2626;">Fehler bei Assignment-Erstellung nach Fahrerannahme</h2>
                <p><strong>Fahrername:</strong> ${drvName}</p>
                <p><strong>Fahrer-E-Mail:</strong> ${drv?.email ?? "-"}</p>
                <p><strong>Job-ID:</strong> ${invite.job_id}</p>
                <p><strong>Driver-ID:</strong> ${invite.driver_id}</p>
                <p><strong>Invite-ID:</strong> ${invite.id}</p>
                <p><strong>Invite-Status:</strong> ${newStatus}</p>
                <p><strong>Fehlermeldung:</strong> ${errMsg}</p>
                <p><strong>Zeitpunkt:</strong> ${ts}</p>
              </div>`;
            const resendErr = new Resend(resendKey);
            await resendErr.emails.send({
              from: mailFrom,
              to: [adminTo],
              subject: "Fehler bei Assignment-Erstellung nach Fahrerannahme",
              html: errHtml,
            });
          }
        } catch (e) {
          console.error("Failed to send admin error mail:", e);
        }
        // Fahrer sieht keinen technischen Fehler
        return reply("accepted");
      }

      console.log(`✅ Assignment ready for job ${invite.job_id} and driver ${invite.driver_id}`);
      return reply("accepted");
    } else {
      console.log(`✅ Invite declined for job ${invite.job_id}`);
      return reply("declined");
    }

  } catch (e) {
    console.error("Unexpected error in respond-invite:", e);
    return reply("error");
  }
};

serve(handler);

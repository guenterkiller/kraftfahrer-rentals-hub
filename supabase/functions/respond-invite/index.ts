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
      // Feste Admin-Empfänger – ADMIN_TO/ADMIN_EMAIL bewusst ignoriert
      const adminRecipients = ["info@kraftfahrer-mieten.com", "guenter.killer@t-online.de"];
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
      const zeitraumClean = (job?.zeitraum ?? "-").replace(/\s*Tag\(e\)\s*$/i, "").trim();
      const subject = newStatus === "accepted"
        ? "Fahrer möchte Auftrag übernehmen"
        : "Fahrer lehnt Auftrag ab";
      const respondedAt = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });

      const noteHtml = newStatus === "accepted"
        ? `<p style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px;color:#92400e;">
             <strong>Hinweis:</strong> Dies ist nur eine Rückmeldung des Fahrers. Der Auftrag ist noch nicht zugewiesen.
             Die Zuweisung muss manuell im Adminbereich erfolgen.
           </p>`
        : `<p style="background:#fee2e2;border-left:4px solid #dc2626;padding:12px;color:#991b1b;">
             <strong>Hinweis:</strong> Der Fahrer hat mitgeteilt, dass er diesen Auftrag nicht übernehmen möchte.
           </p>`;

      const driverContactHtml = newStatus === "accepted"
        ? `<h3>Fahrer</h3>
           <p>
             <strong>Name:</strong> ${driverName}<br/>
             <strong>E-Mail:</strong> ${driver?.email ?? "-"}<br/>
             <strong>Telefon:</strong> ${driver?.telefon ?? "-"}
           </p>`
        : `<h3>Fahrer</h3>
           <p><strong>Name:</strong> ${driverName}</p>`;

      const html = `
        <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:${newStatus === "accepted" ? "#16a34a" : "#dc2626"};">${subject}</h2>
          ${driverContactHtml}
          <h3>Auftrag</h3>
          <p>
            <strong>Einsatzort:</strong> ${job?.einsatzort ?? "-"}<br/>
            <strong>Zeitraum:</strong> ${zeitraumClean}<br/>
            <strong>Tätigkeit:</strong> ${job?.nachricht ?? "-"}
          </p>
          ${noteHtml}
          <p style="color:#666;font-size:12px;">Zeitpunkt: ${respondedAt}<br/>Job-ID: ${invite.job_id}<br/>Fahrer-ID: ${invite.driver_id}</p>
        </div>`;

      if (resendKey) {
        const resend = new Resend(resendKey);
        const { data: mailData, error: mailError } = await resend.emails.send({
          from: mailFrom,
          to: adminRecipients,
          subject,
          html,
          reply_to: driver?.email || undefined,
        });
        if (mailError) {
          console.error("Admin mail send error:", JSON.stringify(mailError));
          await supabase.from("email_log").insert({
            recipient: adminRecipients.join(", "),
            subject,
            template: newStatus === "accepted" ? "admin_invite_accepted" : "admin_invite_declined",
            status: "failed",
            error_message: typeof mailError === "string" ? mailError : JSON.stringify(mailError),
            job_id: invite.job_id,
          });
        } else {
          const messageId = (mailData as any)?.id ?? null;
          console.log(`✅ Admin notified: ${subject} (message_id=${messageId}, to=${adminRecipients.join(", ")}, from=${mailFrom})`);
          await supabase.from("email_log").insert({
            recipient: adminRecipients.join(", "),
            subject,
            template: newStatus === "accepted" ? "admin_invite_accepted" : "admin_invite_declined",
            status: "sent",
            message_id: messageId,
            sent_at: new Date().toISOString(),
            job_id: invite.job_id,
          });
        }
      } else {
        console.warn("RESEND_API_KEY not set – admin mail skipped");
      }
    } catch (mailErr) {
      console.error("Admin notification error:", mailErr);
    }

    // WICHTIG: respond-invite erstellt KEINE job_assignments mehr.
    // Die Fahrerantwort ist nur eine Interessens-Rückmeldung.
    // Die echte Zuweisung erfolgt ausschließlich manuell durch den Admin.
    if (newStatus === "accepted") {
      console.log(`✅ Invite ${invite.id} accepted (Rückmeldung) – KEINE automatische Zuweisung`);
      return reply("accepted");
    } else {
      console.log(`✅ Invite ${invite.id} declined`);
      return reply("declined");
    }

  } catch (e) {
    console.error("Unexpected error in respond-invite:", e);
    return reply("error");
  }
};

serve(handler);

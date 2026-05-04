import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SECRET = Deno.env.get("INTERNAL_FN_SECRET") || "";

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sign(driverId: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`unsub:${driverId}`));
  return toHex(sig);
}

export async function makeUnsubscribeToken(driverId: string): Promise<string> {
  const sig = await sign(driverId);
  return `${driverId}.${sig}`;
}

function textResponse(message: string, status = 200): Response {
  return new Response(message, {
    status,
    headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
  });
}

const MSG_INVALID = "Ungültiger Abmeldelink. Bitte kontaktieren Sie info@kraftfahrer-mieten.com.";
const MSG_ERROR = "Fehler bei der Abmeldung. Bitte kontaktieren Sie info@kraftfahrer-mieten.com.";
const MSG_ALREADY = "Sie sind bereits abgemeldet. Sie erhalten keine weiteren Auftragsangebote von Fahrerexpress.";
const MSG_OK = "Abmeldung gespeichert. Sie erhalten keine weiteren Auftragsangebote von Fahrerexpress.";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (!SECRET) {
    console.error("INTERNAL_FN_SECRET not configured");
    return textResponse(MSG_ERROR, 500);
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const [driverId, providedSig] = token.split(".");

  if (!driverId || !providedSig) {
    return textResponse(MSG_INVALID, 400);
  }

  const expectedSig = await sign(driverId);
  if (expectedSig !== providedSig) {
    return textResponse(MSG_INVALID, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: driver, error } = await supabase
    .from("fahrer_profile")
    .select("id, vorname, nachname, email, telefon, email_opt_out, unsubscribed_at")
    .eq("id", driverId)
    .maybeSingle();

  if (error || !driver) {
    return textResponse(MSG_INVALID, 404);
  }

  // Bereits abgemeldet?
  if (driver.email_opt_out) {
    return textResponse(MSG_ALREADY);
  }

  const nowIso = new Date().toISOString();
  const { error: updErr } = await supabase
    .from("fahrer_profile")
    .update({
      email_opt_out: true,
      unsubscribed_at: nowIso,
      unsubscribed_reason: "self-service-unsubscribe",
    })
    .eq("id", driverId);

  if (updErr) {
    console.error("Update error:", updErr);
    return textResponse(MSG_ERROR, 500);
  }

  // Admin-Mail
  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const adminTo = Deno.env.get("ADMIN_TO") || Deno.env.get("ADMIN_EMAIL") || "info@kraftfahrer-mieten.com";
    const mailFrom = Deno.env.get("MAIL_FROM") || "Kraftfahrer-Mieten <noreply@kraftfahrer-mieten.com>";
    const adminSubject = "Fahrer hat sich von Auftragsangeboten abgemeldet";
    if (resendKey) {
      const resend = new Resend(resendKey);
      const ts = new Date(nowIso).toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
      const driverName = `${driver.vorname ?? ""} ${driver.nachname ?? ""}`.trim() || "Unbekannt";
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;">
          <h2 style="color:#dc2626;">Fahrer hat sich von Auftragsangeboten abgemeldet</h2>
          <p><strong>Name:</strong> ${driverName}</p>
          <p><strong>E-Mail:</strong> ${driver.email ?? "-"}</p>
          <p><strong>Telefon:</strong> ${driver.telefon ?? "-"}</p>
          <p><strong>Zeitpunkt:</strong> ${ts}</p>
          <p style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px;color:#92400e;">
            Hinweis: Der Fahrer erhält keine weiteren Auftragsangebote.
            Das Profil bleibt erhalten und wird nicht automatisch gelöscht.
          </p>
          <p style="color:#666;font-size:12px;">Fahrer-ID: ${driver.id}</p>
        </div>`;
      const { data: mail, error: mErr } = await resend.emails.send({
        from: mailFrom,
        to: [adminTo],
        subject: adminSubject,
        html,
      });
      const sendStatus = mErr ? "failed" : "sent";
      await supabase.from("email_log").insert({
        recipient: adminTo,
        subject: adminSubject,
        template: "driver_unsubscribe_admin_notification",
        status: sendStatus,
        message_id: (mail as any)?.id ?? null,
        sent_at: sendStatus === "sent" ? new Date().toISOString() : null,
        error_message: mErr ? JSON.stringify(mErr) : null,
      });
    }
  } catch (e) {
    console.error("Admin notification failed:", e);
    try {
      await supabase.from("email_log").insert({
        recipient: Deno.env.get("ADMIN_TO") || Deno.env.get("ADMIN_EMAIL") || "info@kraftfahrer-mieten.com",
        subject: "Fahrer hat sich von Auftragsangeboten abgemeldet",
        template: "driver_unsubscribe_admin_notification",
        status: "failed",
        error_message: String(e),
      });
    } catch (_) { /* ignore */ }
  }

  return textResponse(MSG_OK);
});
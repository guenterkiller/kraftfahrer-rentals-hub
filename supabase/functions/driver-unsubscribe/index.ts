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

function htmlPage(title: string, body: string): Response {
  const html = `<!doctype html><html lang="de"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${title}</title>
<style>
  body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f8f9fa;margin:0;padding:32px 16px;color:#1a1a1a}
  .card{max-width:560px;margin:0 auto;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.08);padding:32px}
  h1{font-size:22px;margin:0 0 16px}
  p{line-height:1.6;font-size:15px}
  .muted{color:#6b7280;font-size:13px;margin-top:24px}
  a{color:#bb2c29}
</style></head><body><div class="card">${body}</div></body></html>`;
  return new Response(html, {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (!SECRET) {
    console.error("INTERNAL_FN_SECRET not configured");
    return htmlPage("Fehler", `<h1>Konfigurationsfehler</h1><p>Bitte kontaktieren Sie info@kraftfahrer-mieten.com.</p>`);
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const [driverId, providedSig] = token.split(".");

  if (!driverId || !providedSig) {
    return htmlPage("Ungültiger Link", `<h1>Ungültiger Abmeldelink</h1><p>Der Link ist unvollständig oder fehlerhaft. Bitte schreiben Sie an <a href="mailto:info@kraftfahrer-mieten.com">info@kraftfahrer-mieten.com</a>.</p>`);
  }

  const expectedSig = await sign(driverId);
  if (expectedSig !== providedSig) {
    return htmlPage("Ungültiger Link", `<h1>Ungültiger Abmeldelink</h1><p>Der Link ist nicht gültig. Bitte schreiben Sie an <a href="mailto:info@kraftfahrer-mieten.com">info@kraftfahrer-mieten.com</a>.</p>`);
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
    return htmlPage("Nicht gefunden", `<h1>Profil nicht gefunden</h1><p>Bitte schreiben Sie an <a href="mailto:info@kraftfahrer-mieten.com">info@kraftfahrer-mieten.com</a>.</p>`);
  }

  // Bereits abgemeldet?
  if (driver.email_opt_out) {
    return htmlPage(
      "Bereits abgemeldet",
      `<h1>Sie sind bereits abgemeldet</h1>
       <p>Sie erhalten keine weiteren Auftragsangebote von Fahrerexpress.</p>
       <p class="muted">Falls Sie Ihr Profil später wieder aktivieren möchten, kontaktieren Sie uns bitte unter <a href="mailto:info@kraftfahrer-mieten.com">info@kraftfahrer-mieten.com</a>.</p>`,
    );
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
    return htmlPage("Fehler", `<h1>Fehler bei der Abmeldung</h1><p>Bitte versuchen Sie es später erneut oder schreiben Sie an <a href="mailto:info@kraftfahrer-mieten.com">info@kraftfahrer-mieten.com</a>.</p>`);
  }

  // Admin-Mail
  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const adminTo = Deno.env.get("ADMIN_TO") || Deno.env.get("ADMIN_EMAIL") || "info@kraftfahrer-mieten.com";
    const mailFrom = Deno.env.get("MAIL_FROM") || "Kraftfahrer-Mieten <noreply@kraftfahrer-mieten.com>";
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
      await resend.emails.send({
        from: mailFrom,
        to: [adminTo],
        subject: "Fahrer hat sich von Auftragsangeboten abgemeldet",
        html,
      });
    }
  } catch (e) {
    console.error("Admin notification failed:", e);
  }

  return htmlPage(
    "Abmeldung gespeichert",
    `<h1>Abmeldung gespeichert</h1>
     <p>Ihre Abmeldung wurde gespeichert. Sie erhalten keine weiteren Auftragsangebote von Fahrerexpress.</p>
     <p class="muted">Falls Sie Ihr Profil später wieder aktivieren möchten, kontaktieren Sie uns bitte unter <a href="mailto:info@kraftfahrer-mieten.com">info@kraftfahrer-mieten.com</a>.</p>
     <p class="muted">Wenn Sie zusätzlich die Löschung Ihrer gespeicherten Daten wünschen, schreiben Sie bitte ebenfalls an <a href="mailto:info@kraftfahrer-mieten.com">info@kraftfahrer-mieten.com</a>.</p>`,
  );
});
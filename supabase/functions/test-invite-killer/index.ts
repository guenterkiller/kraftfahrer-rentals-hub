import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const DRIVER_EMAIL = "guenter.killer@t-online.de";

function randomToken(len = 48): string {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => ("0" + b.toString(16)).slice(-2)).join("").slice(0, len);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fahrer
    const { data: driver, error: dErr } = await supabase
      .from("fahrer_profile")
      .select("id, vorname, nachname, email")
      .ilike("email", DRIVER_EMAIL)
      .maybeSingle();
    if (dErr || !driver) throw new Error("Driver not found: " + dErr?.message);

    // Neuester Job (egal ob open/sent/assigned – Test-Invite)
    const { data: job, error: jErr } = await supabase
      .from("job_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (jErr || !job) throw new Error("No job found: " + jErr?.message);

    // Invite
    const token = randomToken(48);
    const expires = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const { data: invite, error: iErr } = await supabase
      .from("assignment_invites")
      .insert({
        job_id: job.id,
        driver_id: driver.id,
        token,
        token_expires_at: expires,
        status: "pending",
      })
      .select()
      .single();
    if (iErr) throw new Error("Invite insert failed: " + iErr.message);

    const baseUrl = "https://www.kraftfahrer-mieten.com/fahrer-antwort-bestaetigen";
    const acceptUrl = `${baseUrl}?action=accept&token=${token}`;
    const declineUrl = `${baseUrl}?action=decline&token=${token}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2>🚛 Neuer Fahrerauftrag (Test-Invite)</h2>
        <div style="background:#fff;border:1px solid #e5e5e5;padding:20px;border-radius:8px;">
          <h3>Auftragsdetails</h3>
          <p><strong>Einsatzort:</strong> ${job.einsatzort}</p>
          <p><strong>Zeitraum:</strong> ${job.zeitraum}</p>
          <p><strong>Fahrzeugtyp:</strong> ${job.fahrzeugtyp}</p>
          <p><strong>Führerscheinklasse:</strong> ${job.fuehrerscheinklasse}</p>
          <p><strong>Tätigkeit:</strong> ${job.nachricht}</p>
        </div>

        <div style="text-align:center;margin:30px 0;">
          <a href="${acceptUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:6px;">
            ✅ Ich kann den Auftrag übernehmen
          </a>
          <br/>
          <a href="${declineUrl}" style="display:inline-block;background:#dc2626;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:6px;">
            ❌ Ich kann nicht übernehmen
          </a>
        </div>

        <p style="font-size:12px;color:#666;">
          Falls die Buttons nicht funktionieren:<br/>
          Annehmen: <a href="${acceptUrl}">${acceptUrl}</a><br/>
          Ablehnen: <a href="${declineUrl}">${declineUrl}</a>
        </p>
        <p style="font-size:12px;color:#666;">Invite-ID: ${invite.id} · Job-ID: ${job.id}</p>
      </div>`;

    const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
    const { data: mail, error: mErr } = await resend.emails.send({
      from: Deno.env.get("MAIL_FROM") || "Fahrerexpress <info@kraftfahrer-mieten.com>",
      to: [DRIVER_EMAIL],
      subject: `🚛 Test-Invite: ${job.fahrzeugtyp} – ${job.einsatzort}`,
      html,
    });

    if (mErr) {
      await supabase.from("email_log").insert({
        recipient: DRIVER_EMAIL,
        subject: "Test-Invite",
        template: "test_invite_killer",
        status: "failed",
        error_message: JSON.stringify(mErr),
        job_id: job.id,
      });
      throw new Error("Mail failed: " + JSON.stringify(mErr));
    }

    await supabase.from("email_log").insert({
      recipient: DRIVER_EMAIL,
      subject: "Test-Invite",
      template: "test_invite_killer",
      status: "sent",
      message_id: (mail as any)?.id ?? null,
      sent_at: new Date().toISOString(),
      job_id: job.id,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        invite_id: invite.id,
        job_id: job.id,
        driver_id: driver.id,
        status: invite.status,
        mail_to: DRIVER_EMAIL,
        mail_id: (mail as any)?.id ?? null,
        accept_url: acceptUrl,
        decline_url: declineUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
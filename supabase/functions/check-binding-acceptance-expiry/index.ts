// Markiert abgelaufene Links zur verbindlichen Fahrerannahme und benachrichtigt den Admin genau einmal.
// Keine automatische Neuzuteilung. Aufruf durch den Admin-Bereich beim Laden.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { verifyAdminAuth, createCorsHeaders, handleCorsPreflightRequest, createErrorResponse } from "../_shared/admin-auth.ts";
import { notifyAgency } from "../respond-invite/binding.ts";

serve(async (req) => {
  const corsHeaders = createCorsHeaders();
  if (req.method === "OPTIONS") return handleCorsPreflightRequest(corsHeaders);
  if (req.method !== "POST") return createErrorResponse("Method not allowed", 405, corsHeaders);

  const auth = await verifyAdminAuth(req);
  if (!auth.success) return auth.response;
  const { supabase } = auth;

  try {
    const nowIso = new Date().toISOString();
    const { data: due, error } = await supabase
      .from("assignment_invites")
      .select("id, job_id, driver_id, assignment_id, token_expires_at, driver:fahrer_profile(vorname, nachname), job:job_requests(einsatzort, zeitraum)")
      .eq("purpose", "binding")
      .eq("status", "pending")
      .is("expiry_notified_at", null)
      .lte("token_expires_at", nowIso)
      .limit(50);
    if (error) throw error;

    let notified = 0;
    for (const inv of due ?? []) {
      // Atomarer Claim: nur ein Aufruf verschickt die Meldung
      const { data: claimed } = await supabase
        .from("assignment_invites")
        .update({ status: "expired", expiry_notified_at: nowIso })
        .eq("id", inv.id).eq("status", "pending").is("expiry_notified_at", null)
        .select("id");
      if (!claimed?.length) continue;
      const d: any = Array.isArray(inv.driver) ? inv.driver[0] : inv.driver;
      const j: any = Array.isArray(inv.job) ? inv.job[0] : inv.job;
      const name = `${d?.vorname ?? ""} ${d?.nachname ?? ""}`.trim() || "Fahrer";
      const until = new Date(inv.token_expires_at).toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
      const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
      await notifyAgency(supabase, {
        subject: `Verbindliche Fahrerannahme abgelaufen – ${j?.einsatzort ?? "Auftrag"}`,
        html: `<p>Der Annahmelink für <strong>${esc(name)}</strong> ist am ${esc(until)} abgelaufen, ohne dass der Auftrag verbindlich angenommen wurde.</p>
               <p>Auftrag: ${esc(j?.einsatzort)} · ${esc(j?.zeitraum)}<br/>Zuteilung: ${esc(inv.assignment_id)}</p>
               <p>Es erfolgt keine automatische Neuzuteilung. Bitte im Admin-Bereich entscheiden (Link erneut senden oder Zuweisung auflösen).</p>`,
        jobId: inv.job_id, assignmentId: inv.assignment_id, template: "admin_binding_expired",
      });
      notified++;
    }
    return new Response(JSON.stringify({ ok: true, notified }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("check-binding-acceptance-expiry error:", e);
    return createErrorResponse("Interner Fehler", 500, corsHeaders);
  }
});

// Persönliches Zustimmungsverfahren zum Vermittlungsvertrag.
// Öffentlich (per Token): load / accept / reject. Admin (JWT): create_invite, status.
// Versendet KEINE E-Mails.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { z } from "npm:zod@3.23.8";
import {
  MEDIATION_CONTRACT_VERSION, MEDIATION_CONTRACT_TITLE, MEDIATION_CONTRACT_PARTIES,
  MEDIATION_CONTRACT_SECTIONS, MEDIATION_ACCEPT_TEXT, MEDIATION_REJECT_TEXT,
  buildMediationContractText, buildDecisionHashInput,
} from "../_shared/driver-mediation-contract.ts";
import { inviteState, inviteExpiry, rejectionProfileUpdate, sha256Hex } from "../_shared/driver-contract-gate.ts";
import { verifyAdminAuth } from "../_shared/admin-auth.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("load"), token: z.string().min(20).max(200) }),
  z.object({ action: z.literal("accept"), token: z.string().min(20).max(200), consent: z.literal(true) }),
  z.object({ action: z.literal("reject"), token: z.string().min(20).max(200), consent: z.literal(true) }),
  z.object({ action: z.literal("create_invite"), driverId: z.string().uuid() }),
  z.object({ action: z.literal("status") }),
]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  let raw: unknown;
  try { raw = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    const a = (raw as any)?.action;
    if ((a === "accept" || a === "reject") && (raw as any)?.consent !== true) return json({ status: "consent_required" }, 400);
    return json({ error: "invalid_input" }, 400);
  }
  const body = parsed.data;
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // ---------- Admin ----------
  if (body.action === "create_invite" || body.action === "status") {
    const auth = await verifyAdminAuth(req);
    if (!auth.success) return auth.response;
    if (body.action === "status") {
      const { data: decisions } = await db.from("driver_contract_decisions")
        .select("driver_id, decision, contract_version, decided_at").order("decided_at", { ascending: false });
      const { data: invites } = await db.from("driver_contract_invites")
        .select("driver_id, status, expires_at, contract_version, created_at").order("created_at", { ascending: false });
      return json({ version: MEDIATION_CONTRACT_VERSION, decisions: decisions ?? [], invites: invites ?? [] });
    }
    const { data: drv } = await db.from("fahrer_profile").select("id").eq("id", body.driverId).maybeSingle();
    if (!drv) return json({ error: "driver_not_found" }, 404);
    const { data: done } = await db.from("driver_contract_decisions").select("decision")
      .eq("driver_id", body.driverId).eq("contract_version", MEDIATION_CONTRACT_VERSION).maybeSingle();
    if (done) return json({ error: "already_decided", decision: done.decision }, 409);
    // Ältere offene Links derselben Person ungültig machen
    await db.from("driver_contract_invites").update({ status: "superseded" })
      .eq("driver_id", body.driverId).eq("status", "pending");
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const expires_at = inviteExpiry();
    const { error } = await db.from("driver_contract_invites").insert({
      driver_id: body.driverId, token, contract_version: MEDIATION_CONTRACT_VERSION,
      expires_at, created_by: auth.user.email ?? null,
    });
    if (error) return json({ error: "insert_failed" }, 500);
    await db.from("admin_actions").insert({ action: "driver_contract_invite_created", admin_email: auth.user.email ?? null, note: `Fahrer ${body.driverId}` });
    return json({ url: `https://www.kraftfahrer-mieten.com/fahrer-vertrag?token=${token}`, expires_at });
  }

  // ---------- Fahrer (Token) ----------
  const { data: inv } = await db.from("driver_contract_invites")
    .select("id, driver_id, status, expires_at, used_at, contract_version, driver:fahrer_profile(vorname, nachname)")
    .eq("token", body.token).maybeSingle();
  if (!inv) return json({ status: "invalid" }, 404);
  const state = inviteState(inv as any);
  if (state !== "ok") return json({ status: state === "used" ? "already_answered" : "expired" }, 410);

  if (body.action === "load") {
    const d: any = (inv as any).driver;
    return json({
      status: "ok", version: MEDIATION_CONTRACT_VERSION, title: MEDIATION_CONTRACT_TITLE,
      parties: MEDIATION_CONTRACT_PARTIES, sections: MEDIATION_CONTRACT_SECTIONS,
      accept_text: MEDIATION_ACCEPT_TEXT, reject_text: MEDIATION_REJECT_TEXT,
      driver_name: d ? `${d.vorname ?? ""} ${d.nachname ?? ""}`.trim() : "", expires_at: inv.expires_at,
    });
  }

  // Link zuerst beanspruchen (verhindert Doppelklicks)
  const decidedAt = new Date().toISOString();
  const { data: claimed } = await db.from("driver_contract_invites")
    .update({ status: "used", used_at: decidedAt }).eq("id", inv.id).eq("status", "pending").is("used_at", null).select("id");
  if (!claimed || claimed.length === 0) return json({ status: "already_answered" }, 409);

  const decision = body.action;
  const hash = await sha256Hex(buildDecisionHashInput({ driverId: inv.driver_id, decision, decidedAt }));
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || null;
  const { error: decErr } = await db.from("driver_contract_decisions").insert({
    driver_id: inv.driver_id, invite_id: inv.id, decision, contract_version: MEDIATION_CONTRACT_VERSION,
    contract_text: buildMediationContractText(),
    consent_text: decision === "accept" ? MEDIATION_ACCEPT_TEXT : MEDIATION_REJECT_TEXT,
    content_hash: hash, ip, user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null, decided_at: decidedAt,
  });
  if (decErr) {
    console.error("decision insert failed", decErr.code);
    return json({ status: decErr.code === "23505" ? "already_answered" : "error" }, decErr.code === "23505" ? 409 : 500);
  }
  if (decision === "reject") {
    await db.from("fahrer_profile").update(rejectionProfileUpdate(decidedAt)).eq("id", inv.driver_id);
  }
  await db.from("admin_actions").insert({ action: `driver_contract_${decision}`, note: `Fahrer ${inv.driver_id}, Fassung ${MEDIATION_CONTRACT_VERSION}, SHA-256 ${hash}` });
  return json({ status: decision === "accept" ? "accepted" : "rejected", content_hash: hash, decided_at: decidedAt });
});

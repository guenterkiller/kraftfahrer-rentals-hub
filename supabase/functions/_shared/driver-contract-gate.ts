// Reine Regeln des Vermittlungsvertrags-Zustimmungsverfahrens (ohne DB/Mail testbar).
import { MEDIATION_CONTRACT_VERSION, CONTRACT_LINK_VALID_DAYS } from "./driver-mediation-contract.ts";

export type InviteRow = { status: string; expires_at: string; used_at: string | null; contract_version: string };

export type InviteState = "ok" | "expired" | "used" | "outdated";

export function inviteState(inv: InviteRow, now: Date = new Date()): InviteState {
  if (inv.used_at || inv.status !== "pending") return "used";
  if (inv.contract_version !== MEDIATION_CONTRACT_VERSION) return "outdated";
  if (new Date(inv.expires_at).getTime() <= now.getTime()) return "expired";
  return "ok";
}

export function inviteExpiry(from: Date = new Date()): string {
  return new Date(from.getTime() + CONTRACT_LINK_VALID_DAYS * 24 * 3600 * 1000).toISOString();
}

/** Profiländerung bei Ablehnung: deaktivieren, Angebote und Werbe-E-Mails sperren. */
export function rejectionProfileUpdate(nowIso: string) {
  return {
    is_inactive: true,
    inactive_since: nowIso,
    inactive_reason: "Vermittlungsvertrag abgelehnt",
    inactive_reason_code: "contract_rejected",
    email_opt_out: true,
    updated_at: nowIso,
  };
}

/**
 * Stichtagsschalter: Ist er aus, bleibt der laufende Betrieb unverändert.
 * Ist er an, erhalten nur Fahrer mit angenommener aktueller Fassung Angebote.
 */
export function mayReceiveOffers(contractRequired: boolean, acceptedVersion: string | null): boolean {
  if (!contractRequired) return true;
  return acceptedVersion === MEDIATION_CONTRACT_VERSION;
}

export async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// deno-lint-ignore no-explicit-any
export async function isContractRequired(supabase: any): Promise<boolean> {
  const { data } = await supabase.from("feature_flags").select("enabled").eq("flag_name", "driver_contract_required").maybeSingle();
  return data?.enabled === true;
}

// deno-lint-ignore no-explicit-any
export async function driverMayReceiveOffers(supabase: any, driverId: string): Promise<boolean> {
  const required = await isContractRequired(supabase);
  if (!required) return true;
  const { data } = await supabase
    .from("driver_contract_decisions")
    .select("contract_version")
    .eq("driver_id", driverId)
    .eq("decision", "accept")
    .eq("contract_version", MEDIATION_CONTRACT_VERSION)
    .maybeSingle();
  return mayReceiveOffers(true, data?.contract_version ?? null);
}

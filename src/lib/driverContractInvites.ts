import type { Database } from "@/integrations/supabase/types";
import { MEDIATION_CONTRACT_VERSION } from "@/lib/driverMediationContract";

type InviteRow = Database["public"]["Tables"]["driver_contract_invites"]["Row"];
export type ContractInviteState = "pending" | "expired" | "used" | "superseded" | "outdated" | "unknown";

export function contractInviteState(
  invite: Pick<InviteRow, "status" | "used_at" | "expires_at" | "contract_version">,
  now = Date.now(),
): ContractInviteState {
  if (invite.status === "superseded") return "superseded";
  if (invite.used_at || invite.status === "used") return "used";
  if (invite.status === "expired") return "expired";
  if (invite.status !== "pending") return "unknown";
  if (invite.contract_version !== MEDIATION_CONTRACT_VERSION) return "outdated";
  if (new Date(invite.expires_at).getTime() <= now) return "expired";
  return "pending";
}

export function matchesContractDriver(
  driver: { vorname: string; nachname: string; email: string } | null,
  search: string,
): boolean {
  const words = search.trim().toLocaleLowerCase("de-DE").split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  if (!driver) return false;
  const value = `${driver.vorname} ${driver.nachname} ${driver.email}`.toLocaleLowerCase("de-DE");
  return words.every((word) => value.includes(word));
}
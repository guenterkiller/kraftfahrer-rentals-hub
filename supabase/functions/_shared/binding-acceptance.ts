// Reine Hilfslogik für die verbindliche Fahrerannahme (ohne Netzwerk/DB, testbar).

export const BINDING_LINK_HOURS = 48;

/** Ablauf: 48 h ab jetzt, längstens bis Einsatzbeginn. */
export function computeBindingExpiry(now: Date, startDate: string | null | undefined): Date {
  const max = new Date(now.getTime() + BINDING_LINK_HOURS * 3600 * 1000);
  if (startDate) {
    const s = new Date(startDate);
    if (!isNaN(s.getTime()) && s < max) return s;
  }
  return max;
}

export function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Deterministische Serialisierung (sortierte Schlüssel) für den Fingerabdruck. */
export function stableStringify(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v ?? null);
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(o[k])}`).join(",")}}`;
}

export type BindingInviteState = {
  purpose: string;
  status: string;
  token_expires_at: string;
  driver_id: string;
  assignment_id: string | null;
};
export type BindingAssignmentState = {
  id: string;
  driver_id: string;
  status: string;
};

export type BindingCheck =
  | "ok"
  | "invalid"
  | "already_answered"
  | "expired"
  | "cancelled";

/** Prüft, ob ein Link für eine verbindliche Annahme (noch) verwendet werden darf. */
export function checkBindingInvite(
  invite: BindingInviteState | null,
  assignment: BindingAssignmentState | null,
  now: Date,
): BindingCheck {
  if (!invite || invite.purpose !== "binding" || !invite.assignment_id) return "invalid";
  if (!assignment || assignment.id !== invite.assignment_id) return "invalid";
  if (assignment.driver_id !== invite.driver_id) return "invalid";
  if (invite.status !== "pending") return invite.status === "expired" ? "expired" : "already_answered";
  if (["cancelled", "no_show", "completed"].includes(assignment.status)) return "cancelled";
  if (new Date(invite.token_expires_at) <= now) return "expired";
  return "ok";
}

export function rateUnitLabel(rateType: string | null | undefined): string {
  return rateType === "hourly" ? "Stunde" : rateType === "daily" ? "Einsatztag" : rateType === "weekly" ? "Woche" : "pauschal";
}

export function formatEur(v: number | null | undefined): string {
  if (v == null || isNaN(Number(v))) return "nach Vereinbarung";
  return `${Number(v).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

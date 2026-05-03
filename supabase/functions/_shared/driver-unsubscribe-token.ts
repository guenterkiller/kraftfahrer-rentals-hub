// Erzeugt HMAC-Token für Fahrer-Selbstabmeldung.
// Token-Format: `${driverId}.${hmacSha256Hex(`unsub:${driverId}`)}`
// Geprüft in supabase/functions/driver-unsubscribe/index.ts.

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function makeDriverUnsubscribeToken(driverId: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`unsub:${driverId}`));
  return `${driverId}.${toHex(sig)}`;
}

export function buildDriverUnsubscribeUrl(token: string): string {
  const supaUrl = Deno.env.get("SUPABASE_URL") || "";
  return `${supaUrl}/functions/v1/driver-unsubscribe?token=${encodeURIComponent(token)}`;
}
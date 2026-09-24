/**
 * Zentrale E-Mail-Bereinigung und -Validierung.
 * Verwendet in Fahrerregistrierung und Admin-Dialog „Fahrerdaten bearbeiten“.
 * Hinweis: Identische Logik in supabase/functions/fahrerwerden/index.ts (serverseitig).
 */
export function sanitizeEmail(raw: string | null | undefined): string {
  let v = String(raw ?? "").trim();
  // Umschließende Anführungszeichen / spitze Klammern entfernen (mehrfach)
  for (let i = 0; i < 3; i++) {
    v = v.replace(/^[\s"'`„“”‚‘’<(\[]+|[\s"'`„“”‚‘’>)\],;]+$/g, "");
  }
  // Kopierte Linkreste: mailto:, ggf. mehrfach, und Query-Teile (?subject=...)
  v = v.replace(/^(mailto:)+/i, "");
  v = v.replace(/\?.*$/, "");
  // Unsichtbare Zeichen und innere Leerzeichen entfernen
  v = v.replace(/[\u200B-\u200D\uFEFF\s]/g, "");
  return v.toLowerCase();
}

const EMAIL_RE = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i;

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  if (/^mailto:/i.test(email) || email.includes("..")) return false;
  return EMAIL_RE.test(email);
}

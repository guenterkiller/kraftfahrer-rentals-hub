// Reine Regeln für den Versand der Vertrags-E-Mail bei der Freischaltung (ohne DB/Mail testbar).

export type ContractMailStatus = 'sent' | 'failed' | 'skipped_existing' | 'decided';

/** Resend v2 meldet Fehler als Rückgabewert ({ error }) statt per Ausnahme. */
export function interpretSendResult(r: unknown): { ok: true; messageId: string } | { ok: false; error: string } {
  // deno-lint-ignore no-explicit-any
  const res = r as any;
  if (res?.error) {
    const msg = res.error?.message ?? res.error?.name ?? JSON.stringify(res.error);
    return { ok: false, error: String(msg) };
  }
  const id = res?.data?.id;
  if (typeof id !== 'string' || id.length === 0) {
    return { ok: false, error: 'E-Mail-Dienst hat keine Versand-ID zurückgegeben' };
  }
  return { ok: true, messageId: id };
}

/**
 * Entscheidung je Freischaltung:
 * - Vertragsentscheidung (Annahme/Ablehnung) vorhanden → nichts ändern, nichts senden.
 * - Gültiger Link vorhanden und bereits erfolgreich versandt → nicht erneut senden.
 * - Gültiger Link vorhanden, aber nie erfolgreich versandt → denselben Link erneut senden.
 * - Kein gültiger Link → genau einen neuen Link anlegen und senden.
 */
export function contractMailAction(input: {
  hasDecision: boolean;
  hasValidInvite: boolean;
  inviteMailSucceeded: boolean;
}): 'none_decided' | 'skip' | 'resend_existing' | 'create_and_send' {
  if (input.hasDecision) return 'none_decided';
  if (input.hasValidInvite) return input.inviteMailSucceeded ? 'skip' : 'resend_existing';
  return 'create_and_send';
}

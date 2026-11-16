// Unveränderliche Versandkopie jeder ausgehenden Kundenmail.
// Gespeichert wird exakt das, was an den Versanddienst übergeben wurde (Betreff, Empfänger, HTML, Text),
// zusammen mit Versandstatus und Versandkennung. Die Datenbank verhindert jede spätere Änderung.

export interface CustomerMailPayload {
  from: string;
  to: string;
  bcc?: string[] | null;
  replyTo?: string | null;
  subject: string;
  html?: string | null;
  text?: string | null;
}

export interface CustomerMailSnapshotInput {
  jobId?: string | null;
  assignmentId?: string | null;
  template: string;
  payload: CustomerMailPayload;
  result: { ok: true; messageId: string | null } | { ok: false; error: string };
  sentAt?: Date;
}

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Baut die zu speichernde Zeile; rein, ohne Datenbankzugriff (testbar). */
export async function buildCustomerMailSnapshotRow(input: CustomerMailSnapshotInput) {
  const p = input.payload;
  const hashBasis = JSON.stringify({ from: p.from, to: p.to, bcc: p.bcc ?? null, subject: p.subject, html: p.html ?? null, text: p.text ?? null });
  return {
    job_id: input.jobId ?? null,
    assignment_id: input.assignmentId ?? null,
    template: input.template,
    recipient: p.to,
    from_address: p.from,
    bcc: p.bcc && p.bcc.length ? p.bcc : null,
    reply_to: p.replyTo ?? null,
    subject: p.subject,
    html: p.html ?? null,
    text_body: p.text ?? null,
    content_sha256: await sha256Hex(hashBasis),
    provider: 'resend',
    provider_message_id: input.result.ok ? input.result.messageId : null,
    status: input.result.ok ? 'sent' : 'failed',
    error_message: input.result.ok ? null : input.result.error,
    sent_at: input.result.ok ? (input.sentAt ?? new Date()).toISOString() : null,
  };
}

// deno-lint-ignore no-explicit-any
export async function storeCustomerMailSnapshot(supabase: any, input: CustomerMailSnapshotInput): Promise<boolean> {
  try {
    const row = await buildCustomerMailSnapshotRow(input);
    const { error } = await supabase.from('customer_email_snapshots').insert(row);
    if (error) { console.error('Versandkopie konnte nicht gespeichert werden:', error.message); return false; }
    return true;
  } catch (e) {
    console.error('Versandkopie konnte nicht gespeichert werden:', e);
    return false;
  }
}

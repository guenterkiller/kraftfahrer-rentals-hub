export async function requireMailResult(data: any, error: any): Promise<'sent' | 'skipped'> {
  if (error) {
    const detail = error.context instanceof Response
      ? await error.context.clone().json().catch(() => null) : null;
    throw new Error(detail?.error || detail?.message || error.message || 'E-Mail-Versand fehlgeschlagen');
  }
  if (data?.ok !== true) throw new Error(data?.error || 'E-Mail-Versand nicht bestätigt');
  if (data.skipped === true) return 'skipped';
  if (data.contractEmailStatus === 'failed') throw new Error(`Vertrags-E-Mail nicht versendet: ${data.contractEmailError || 'E-Mail-Dienst hat den Versand nicht bestätigt'}`);
  if (data.contractEmailStatus === 'skipped_existing' || data.contractEmailStatus === 'decided') return 'skipped';
  if (data.contractEmailStatus === 'sent' && data.contractEmailSent === true) return 'sent';
  if (typeof data.email_id === 'string' && data.email_id.length > 0) return 'sent';
  throw new Error('E-Mail-Dienst hat den Versand nicht bestätigt');
}
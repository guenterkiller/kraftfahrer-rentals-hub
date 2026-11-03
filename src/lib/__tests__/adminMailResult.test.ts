import { describe, it, expect } from 'vitest';
import { requireMailResult } from '../adminMailResult';
describe('Verwaltung meldet nur bestätigten Versand', () => {
  it('übersprungener Versand ist kein Erfolg', async () => {
    expect(await requireMailResult({ ok: true, skipped: true }, null)).toBe('skipped');
  });
  it('Angebot benötigt Versand-ID', async () => {
    await expect(requireMailResult({ ok: true }, null)).rejects.toThrow();
    expect(await requireMailResult({ ok: true, email_id: 'TEST' }, null)).toBe('sent');
  });
  it('fehlgeschlagene Vertragsmail ist kein Erfolg', async () => {
    await expect(requireMailResult({ ok: true, contractEmailStatus: 'failed', contractEmailError: 'TEST Fehler' }, null)).rejects.toThrow('TEST Fehler');
  });
  it('Vertragsmail braucht bestätigten Status und Versandflag', async () => {
    await expect(requireMailResult({ ok: true, contractEmailStatus: 'sent', contractEmailSent: false }, null)).rejects.toThrow();
    expect(await requireMailResult({ ok: true, contractEmailStatus: 'sent', contractEmailSent: true }, null)).toBe('sent');
  });
  it('zeigt konkrete Serverfehlermeldung statt allgemeinem HTTP-Fehler', async () => {
    await expect(requireMailResult(null, { message: 'HTTP error', context: new Response(JSON.stringify({ error: 'Link abgelaufen' })) })).rejects.toThrow('Link abgelaufen');
  });
});
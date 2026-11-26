import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { normalizeAvailability } from '../../../preview/fahrer-registration/availability';
import { serializeAvailability, displayAvailability } from '../driverRegistration';

// Execute the actual disconnected handler; every external import is replaced.
// An unexpected import fails closed, so these tests cannot send mail or reach Supabase.
function fixture() {
  const writes: { table: string; value: any }[] = [];
  const mails: any[] = [];
  const db = {
    from(table: string) {
      return {
        select() { return { eq() { return { maybeSingle: async () => ({ data: null, error: null }) }; } }; },
        insert(value: any) {
          writes.push({ table, value });
          return {
            select: async () => ({ data: [{ ...value[0], id: 'isolated-driver' }], error: null }),
            then(resolve: (value: any) => void) { return Promise.resolve({ error: null }).then(resolve); },
          };
        },
      };
    },
  };
  const exports: Record<string, any> = {};
  const requireMock = (id: string): any => {
    if (id === './availability.ts') return { normalizeAvailability };
    if (id === 'https://esm.sh/@supabase/supabase-js@2') return { createClient: () => db };
    if (id === 'npm:resend@2.0.0') return { Resend: class { emails = { send: async (mail: any) => { mails.push(mail); return { data: { id: 'mock-only' } }; } }; } };
    if (id === 'npm:@react-email/components@0.0.22') return { renderAsync: async () => '<p>isolated renderer</p>' };
    if (id === 'npm:react@18.3.1') return { default: { createElement: () => ({}) } };
    if (id.endsWith('/driver-registration-confirmation.tsx')) return { DriverRegistrationConfirmation: () => null };
    if (id.endsWith('/admin-driver-notification.tsx')) return { AdminDriverNotification: () => null };
    if (id.endsWith('/storage-config.ts')) return { DRIVER_DOCS_BUCKET: 'mock-only', ALLOWED_MIME_TYPES: new Set(), MAX_FILE_SIZE: 5242880 };
    if (id.endsWith('/terms-version.ts')) return { TERMS_VERSION_DRIVER: 'unchanged-mock-version' };
    throw new Error(`Unexpected external import: ${id}`);
  };
  const source = readFileSync('preview/fahrer-registration/fahrerwerden.ts', 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(code, {
    exports, require: requireMock, Request, Response, FormData, File, URL, Date,
    console: { log() {}, warn() {}, error() {} },
    Deno: { env: { get: (name: string) => name === 'MAIL_FROM' ? 'info@kraftfahrer-mieten.com' : 'mock-not-a-secret' } },
  });
  return { handler: exports.handler as (req: Request) => Promise<Response>, writes, mails };
}

const base = { name: 'TEST Fahrer', email: 'test@example.invalid', phone: '000', strasse: 'Testweg', hausnummer: '1', plz: '00000', ort: 'Testort', land: 'Deutschland' };
function request(availability: string | undefined, kind: 'json' | 'multipart' | 'fallback') {
  const data = { ...base, ...(availability === undefined ? {} : { availability }) };
  if (kind === 'json') return new Request('http://isolated.invalid/fahrerwerden', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => form.append(key, value));
  if (kind === 'fallback') {
    return new Request('http://isolated.invalid/fahrerwerden', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data) });
  }
  return new Request('http://isolated.invalid/fahrerwerden', { method: 'POST', body: form });
}

afterEach(() => vi.useRealTimers());
describe('Registrierungsentwurf: echter Handler mit isolierter Speicherung', () => {
  it.each(['json', 'multipart', 'fallback'] as const)('alle drei Werte werden über %s gespeichert und wieder angezeigt', async kind => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-26T12:00:00Z'));
    for (const [choice, date, label] of [['sofort', '', 'Ab sofort'], ['absprache', '', 'Nach Absprache'], ['ab_datum', '2026-12-01', 'Ab 01.12.2026']]) {
      const f = fixture();
      const stored = serializeAvailability(choice, date);
      const response = await f.handler(request(stored ?? undefined, kind));
      expect(response.status).toBe(200);
      expect((await response.json()).success).toBe(true);
      const profile = f.writes.find(write => write.table === 'fahrer_profile')?.value[0];
      expect(profile.verfuegbarkeit).toBe(stored);
      expect(displayAvailability(profile.verfuegbarkeit)).toBe(label);
      expect(profile.status).toBe('pending');
      expect(profile.vorname).toBe('TEST');
      expect(profile.strasse).toBe('Testweg');
      expect(profile.agb_version).toBe('unchanged-mock-version');
      expect(f.writes.some(write => write.table === 'driver_contract_decisions')).toBe(false);
      expect(f.mails).toHaveLength(2); // Existing notifications only, entirely mocked.
    }
  });
  it.each(['ab_datum:', 'ab_datum:2026-11-25', 'ab_datum:2027-02-29', 'unbekannt'])('ungültig %s: 400 vor jedem Schreib-/Versandzugriff', async value => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-26T12:00:00Z'));
    const f = fixture();
    const response = await f.handler(request(value, 'multipart'));
    expect(response.status).toBe(400);
    expect(f.writes).toHaveLength(0);
    expect(f.mails).toHaveLength(0);
  });
  it('alte Anmeldung ohne neues Feld bleibt zulässig', async () => {
    const f = fixture();
    expect((await f.handler(request(undefined, 'multipart'))).status).toBe(200);
    expect(f.writes.find(write => write.table === 'fahrer_profile')?.value[0].verfuegbarkeit).toBeNull();
  });
});
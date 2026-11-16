// Original-Alt-Endpunkt mit Mock-Umgebung: keine Datenbank und kein Versand.
import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';

Deno.test('Altannahme ohne individuelle Vergütung wird vor jedem Datenbankzugriff gesperrt', async () => {
  const key = '__legacyAcceptMocks';
  let clients = 0;
  Reflect.set(globalThis, key, {
    env: { get: (name: string) => ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'].includes(name) ? 'TEST-NOT-SECRET' : null },
    createClient: () => { clients++; return {}; },
  });
  try {
    const original = await Deno.readTextFile(new URL('./index.ts', import.meta.url));
    const source = original.replace(/^import \{ serve \}.*$/m, '')
      .replace(/^import \{ createClient \}.*$/m, `const { createClient } = globalThis.${key};`)
      .replace(/from (['"])(\.\.?\/[^'"]+)\1/g, (_m, _q, p) => `from '${new URL(p, import.meta.url).href}'`)
      .replaceAll('Deno.env', `globalThis.${key}.env`)
      .replace('const handler = async (req: Request): Promise<Response> => {', 'export const handler = async (req: Request): Promise<Response> => {')
      .replace(/serve\(handler\);\s*$/, '');
    const { handler } = await import(`data:application/typescript;base64,${btoa(unescape(encodeURIComponent(source)))}`);
    const response = await handler(new Request('https://test.invalid', {
      method: 'POST',
      headers: { Authorization: 'Bearer TEST-NOT-SECRET', 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: 'TEST-JOB', driverId: 'TEST-DRIVER', action: 'accept', termsAccepted: true }),
    }));
    const body = await response.json();
    assertEquals(response.status, 410);
    assertEquals(body.error.includes('persönliche Auftragsangebot'), true);
    assertEquals(clients, 1); // Nur Client-Konstruktion; keine Abfrage, kein Insert, kein RPC, keine Mail.
  } finally {
    Reflect.deleteProperty(globalThis, key);
  }
});

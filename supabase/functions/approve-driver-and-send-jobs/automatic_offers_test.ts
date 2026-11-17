import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

type Options = { accepted?: boolean; status?: string; blocked?: boolean; parallel?: boolean };

async function loadApproval(options: Options = {}) {
  const key = "__approvalAutomationMocks";
  const state = {
    driver: { id: "TEST-DRIVER", email: "driver@example.invalid", vorname: "TEST", nachname: "Fahrer", status: options.status ?? "pending", is_blocked: options.blocked === true, is_inactive: false, email_opt_out: false },
    sends: [] as any[], inserts: [] as any[], offerCalls: 0, approvalUpdates: 0,
  };
  class Query {
    filters: Record<string, any> = {};
    updateValue: any = null;
    constructor(public table: string) {}
    select() { return this; }
    eq(key: string, value: any) { this.filters[key] = value; return this; }
    is() { return this; }
    gt() { return this; }
    gte() { return this; }
    not() { return this; }
    order() { return this; }
    limit() { return this; }
    single() { return Promise.resolve({ data: { ...state.driver }, error: null }); }
    maybeSingle() {
      if (this.table === "driver_contract_decisions") return Promise.resolve({ data: options.accepted && this.filters.decision === "accept" ? { id: "TEST-ACCEPT" } : null, error: null });
      return Promise.resolve({ data: null, error: null });
    }
    update(value: any) { this.updateValue = value; return this; }
    insert(value: any) { state.inserts.push({ table: this.table, value }); return Promise.resolve({ error: null }); }
    then(resolve: any, reject: any) {
      if (this.table === "fahrer_profile" && this.updateValue) {
        state.approvalUpdates++;
        if (state.driver.status !== this.filters.status) return Promise.resolve({ data: [], error: null }).then(resolve, reject);
        state.driver.status = this.updateValue.status;
        return Promise.resolve({ data: [{ id: state.driver.id }], error: null }).then(resolve, reject);
      }
      return Promise.resolve({ data: null, error: null }).then(resolve, reject);
    }
  }
  const fakeClient = { from: (table: string) => new Query(table) };
  Reflect.set(globalThis, key, {
    env: { get: (name: string) => ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "RESEND_API_KEY", "INTERNAL_FN_SECRET"].includes(name) ? "TEST-ONLY" : undefined },
    React: { createElement: () => "TEST HTML" }, renderAsync: async () => "TEST HTML",
    verifyAdminAuth: async () => ({ success: true, user: { email: "admin@example.invalid" }, supabase: fakeClient }),
    createCorsHeaders: () => ({}), handleCorsPreflightRequest: () => new Response(),
    createErrorResponse: (error: string, status: number) => new Response(JSON.stringify({ error }), { status }), logAdminAction: async () => {},
    Resend: class { headers = new Headers(); emails = { send: (payload: any, options: any) => { state.sends.push({ payload, options }); return Promise.resolve({ data: { id: `TEST-MAIL-${state.sends.length}` } }); } }; },
    dispatchDriverJobOffers: async () => {
      state.offerCalls++;
      return { jobs: [], validJobs: [], matchingJobs: [], unclearJobs: [], invitesCreated: 0, invitesSent: 1, skippedDuplicate: 0, skippedExpired: 0, skippedNoMatch: 0, skippedAssigned: 0, failed: 0 };
    },
  });
  const original = await Deno.readTextFile(new URL("./index.ts", import.meta.url));
  const source = original.replace(/^import \{ serve \}.*$/m, "")
    .replace(/^import \{ Resend \}.*$/m, `const { Resend } = globalThis.${key};`)
    .replace(/^import React.*$/m, `const { React } = globalThis.${key};`)
    .replace(/^import \{ renderAsync \}.*$/m, `const { renderAsync } = globalThis.${key};`)
    .replace(/^import \{ (Driver\w+|AdminDriverApprovalNotification) \}.*$/gm, "const $1 = () => null;")
    .replace(/^import \{ dispatchDriverJobOffers \}.*$/m, `const { dispatchDriverJobOffers } = globalThis.${key};`)
    .replace(/import \{\s*verifyAdminAuth,[\s\S]*?from "\.\.\/_shared\/admin-auth.ts";/, `const { verifyAdminAuth, createCorsHeaders, handleCorsPreflightRequest, createErrorResponse, logAdminAction } = globalThis.${key};`)
    .replace(/from (['"])(\.\.?\/[^'"]+)\1/g, (_m, _q, p) => `from '${new URL(p, import.meta.url).href}'`)
    .replaceAll("Deno.env", `globalThis.${key}.env`)
    .replace("serve(async (req) => {", "export const handler = async (req: Request) => {")
    .replace(/\}\);\s*$/, "};");
  const { handler } = await import(`data:application/typescript;base64,${btoa(unescape(encodeURIComponent(source)))}#${crypto.randomUUID()}`);
  const call = () => handler(new Request("https://test.invalid", { method: "POST", body: JSON.stringify({ driverId: "TEST-DRIVER" }) }));
  return { state, call, cleanup: () => Reflect.deleteProperty(globalThis, key) };
}

Deno.test("Freischaltung vor Vertrag: Vertragsmail und eine Adminmail, kein Jobabgleich", async () => {
  const t = await loadApproval({ accepted: false });
  try {
    const response = await t.call();
    const body = await response.json();
    assertEquals(response.status, 200);
    assertEquals(body.contractPending, true);
    assertEquals(body.contractEmailSent, true);
    assertEquals(t.state.offerCalls, 0);
    assertEquals(t.state.sends.map((s) => s.payload.subject), [
      "Ihr persönlicher Vermittlungsvertrag – bitte prüfen und bestätigen",
      "Fahrer administrativ freigeschaltet – Vertragsannahme ausstehend: TEST Fahrer",
    ]);
  } finally { t.cleanup(); }
});

Deno.test("Freischaltung mit bereits angenommenem Vertrag: sofortiger Abgleich plus einmalige Statusmails", async () => {
  const t = await loadApproval({ accepted: true });
  try {
    const response = await t.call();
    const body = await response.json();
    assertEquals(response.status, 200);
    assertEquals(body.invitesSent, 1);
    assertEquals(t.state.offerCalls, 1);
    assertEquals(t.state.sends.length, 2);
    assert(t.state.sends.some((s) => s.payload.subject === "Sie sind jetzt bei Fahrerexpress freigeschaltet"));
    assert(t.state.sends.some((s) => s.payload.subject === "✅ Fahrer freigeschaltet: TEST Fahrer"));
  } finally { t.cleanup(); }
});

Deno.test("erneuter Freischaltungsaufruf mit Vertrag: nur idempotenter Abgleich, keine Status-/Adminmail", async () => {
  const t = await loadApproval({ accepted: true, status: "approved" });
  try {
    const response = await t.call();
    const body = await response.json();
    assertEquals(body.repeated, true);
    assertEquals(body.driverEmailSent, false);
    assertEquals(body.adminEmailSent, false);
    assertEquals(t.state.offerCalls, 1);
    assertEquals(t.state.sends.length, 0);
    assertEquals(t.state.approvalUpdates, 0);
  } finally { t.cleanup(); }
});

Deno.test("erneuter Freischaltungsaufruf ohne Vertrag: keine doppelte Vertrags- oder Adminmail", async () => {
  const t = await loadApproval({ accepted: false, status: "approved" });
  try {
    const response = await t.call();
    const body = await response.json();
    assertEquals(body.skipped, true);
    assertEquals(t.state.offerCalls, 0);
    assertEquals(t.state.sends.length, 0);
  } finally { t.cleanup(); }
});

Deno.test("parallele Erstfreischaltung: nur ein Claim versendet Vertrags- und Adminmail", async () => {
  const t = await loadApproval({ accepted: false, parallel: true });
  try {
    const responses = await Promise.all([t.call(), t.call()]);
    await Promise.all(responses.map((r) => r.text()));
    assertEquals(t.state.approvalUpdates, 2);
    assertEquals(t.state.sends.length, 2);
    assertEquals(t.state.inserts.filter((i) => i.table === "driver_contract_invites").length, 1);
    assertEquals(t.state.offerCalls, 0);
  } finally { t.cleanup(); }
});

Deno.test("gesperrter Fahrer: keine Freischaltung, kein Abgleich und keine Mail", async () => {
  const t = await loadApproval({ accepted: true, blocked: true });
  try {
    const response = await t.call();
    assertEquals(response.status, 400);
    await response.text();
    assertEquals(t.state.approvalUpdates, 0);
    assertEquals(t.state.offerCalls, 0);
    assertEquals(t.state.sends.length, 0);
  } finally { t.cleanup(); }
});

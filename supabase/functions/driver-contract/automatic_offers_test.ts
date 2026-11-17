import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

type Scenario = "accept" | "reject" | "decision_error" | "offers_error";

async function loadHandler(scenario: Scenario) {
  const key = `__contractAutomationMocks_${scenario}`;
  const state = {
    invite: {
      id: "TEST-CONTRACT-INVITE", driver_id: "TEST-DRIVER", status: "pending",
      used_at: null as string | null, expires_at: "2030-01-01T00:00:00Z", contract_version: "2026-10-25",
      token: "TEST-TOKEN-THAT-IS-LONG-ENOUGH", driver: { vorname: "TEST", nachname: "Fahrer" },
    },
    decisions: [] as any[],
    adminActions: [] as any[],
    profileUpdates: [] as any[],
    offerCalls: [] as any[],
    providerSends: 0,
  };
  class Query {
    filters: Record<string, any> = {};
    updateValue: any = null;
    constructor(public table: string) {}
    select() { return this; }
    eq(key: string, value: any) { this.filters[key] = value; return this; }
    is(key: string, value: any) { this.filters[key] = value; return this; }
    order() { return this; }
    maybeSingle() {
      if (this.table === "driver_contract_invites") return Promise.resolve({ data: { ...state.invite, driver: state.invite.driver }, error: null });
      return Promise.resolve({ data: null, error: null });
    }
    single() {
      if (this.table === "fahrer_profile") return Promise.resolve({ data: { id: "TEST-DRIVER", status: "approved", email: "driver@example.invalid" }, error: null });
      return this.maybeSingle();
    }
    update(value: any) { this.updateValue = value; return this; }
    insert(value: any) {
      if (this.table === "driver_contract_decisions") {
        if (scenario === "decision_error") return Promise.resolve({ error: { code: "TEST", message: "TEST insert failed" } });
        state.decisions.push(value);
      } else if (this.table === "admin_actions") state.adminActions.push(value);
      return Promise.resolve({ error: null });
    }
    then(resolve: any, reject: any) {
      if (this.table === "driver_contract_invites" && this.updateValue) {
        if (state.invite.status !== "pending" || state.invite.used_at !== null) {
          return Promise.resolve({ data: [], error: null }).then(resolve, reject);
        }
        state.invite.status = this.updateValue.status;
        state.invite.used_at = this.updateValue.used_at;
        return Promise.resolve({ data: [{ id: state.invite.id }], error: null }).then(resolve, reject);
      }
      if (this.table === "fahrer_profile" && this.updateValue) {
        state.profileUpdates.push(this.updateValue);
        return Promise.resolve({ data: null, error: null }).then(resolve, reject);
      }
      return Promise.resolve({ data: null, error: null }).then(resolve, reject);
    }
  }
  const mocks = {
    createClient: () => ({ from: (table: string) => new Query(table) }),
    dispatchDriverJobOffers: async (input: any) => {
      state.offerCalls.push({ input, decisionPersisted: state.decisions.some((d) => d.decision === "accept") });
      if (scenario === "offers_error") throw new Error("TEST offers unavailable");
      return { matchingJobs: [{ id: "TEST-JOB" }], invitesSent: 1, failed: 0, skippedDuplicate: 0, skippedAssigned: 0 };
    },
    Resend: class { emails = { send: () => { state.providerSends++; return Promise.resolve({ data: { id: "UNEXPECTED" } }); } }; },
    env: { get: (name: string) => name === "SUPABASE_URL" || name === "SUPABASE_SERVICE_ROLE_KEY" || name === "RESEND_API_KEY" || name === "INTERNAL_FN_SECRET" ? "TEST-ONLY" : undefined },
  };
  Reflect.set(globalThis, key, mocks);
  const original = await Deno.readTextFile(new URL("./index.ts", import.meta.url));
  const source = original.replace(/^import \{ serve \}.*$/m, "")
    .replace(/^import \{ createClient \}.*$/m, `const { createClient } = globalThis.${key};`)
    .replace(/^import \{ dispatchDriverJobOffers \}.*$/m, `const { dispatchDriverJobOffers } = globalThis.${key};`)
    .replace(/^import \{ Resend \}.*$/m, `const { Resend } = globalThis.${key};`)
    .replace(/from (['"])(\.\.?\/[^'"]+)\1/g, (_m, _q, p) => `from '${new URL(p, import.meta.url).href}'`)
    .replaceAll("Deno.env", `globalThis.${key}.env`)
    .replace("serve(async (req) => {", "export const handler = async (req: Request) => {")
    .replace(/\}\);\s*$/, "};");
  const { handler } = await import(`data:application/typescript;base64,${btoa(unescape(encodeURIComponent(source)))}#${scenario}-${crypto.randomUUID()}`);
  const call = (action: "accept" | "reject") => handler(new Request("https://test.invalid", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, token: "TEST-TOKEN-THAT-IS-LONG-ENOUGH", consent: true }),
  }));
  return { state, call, cleanup: () => Reflect.deleteProperty(globalThis, key) };
}

Deno.test("tatsächlicher Vertragshandler: Annahme erst nach dauerhaftem Nachweis, dann genau ein Abgleich", async () => {
  const t = await loadHandler("accept");
  try {
    const response = await t.call("accept");
    const body = await response.json();
    assertEquals(response.status, 200);
    assertEquals(body.status, "accepted");
    assertEquals(body.job_offers, { status: "checked", matching: 1, sent: 1, failed: 0, skipped_duplicate: 0, skipped_assigned: 0 });
    assertEquals(t.state.decisions.length, 1);
    assertEquals(t.state.offerCalls.length, 1);
    assert(t.state.offerCalls[0].decisionPersisted);
    assertEquals(t.state.providerSends, 0);
    assert(t.state.adminActions.some((a) => a.action === "driver_contract_accept_jobs_checked"));
  } finally { t.cleanup(); }
});

Deno.test("erneuter Klick nach Annahme: kein zweiter Nachweis und kein zweiter Abgleich", async () => {
  const t = await loadHandler("accept");
  try {
    await (await t.call("accept")).text();
    const second = await t.call("accept");
    assertEquals(second.status, 410);
    assertEquals((await second.json()).status, "already_answered");
    assertEquals(t.state.decisions.length, 1);
    assertEquals(t.state.offerCalls.length, 1);
    assertEquals(t.state.providerSends, 0);
  } finally { t.cleanup(); }
});

Deno.test("parallele Vertragsannahmen: nur ein Claim darf den Abgleich starten", async () => {
  const t = await loadHandler("accept");
  try {
    const responses = await Promise.all([t.call("accept"), t.call("accept")]);
    const bodies = await Promise.all(responses.map(async (r) => { const b = await r.json(); return { http: r.status, ...b }; }));
    assertEquals(bodies.filter((b) => b.status === "accepted").length, 1);
    assertEquals(bodies.filter((b) => b.status === "already_answered").length, 1);
    assertEquals(t.state.decisions.length, 1);
    assertEquals(t.state.offerCalls.length, 1);
    assertEquals(t.state.providerSends, 0);
  } finally { t.cleanup(); }
});

Deno.test("Ablehnung: dauerhafte Sperre und niemals automatische Auftragsangebote", async () => {
  const t = await loadHandler("reject");
  try {
    const response = await t.call("reject");
    assertEquals((await response.json()).status, "rejected");
    assertEquals(t.state.decisions[0].decision, "reject");
    assertEquals(t.state.profileUpdates[0].email_opt_out, true);
    assertEquals(t.state.profileUpdates[0].is_inactive, true);
    assertEquals(t.state.offerCalls.length, 0);
    assertEquals(t.state.providerSends, 0);
  } finally { t.cleanup(); }
});

Deno.test("Fehler beim dauerhaften Speichern: kein automatischer Abgleich", async () => {
  const t = await loadHandler("decision_error");
  try {
    const response = await t.call("accept");
    assertEquals(response.status, 500);
    assertEquals((await response.json()).status, "error");
    assertEquals(t.state.decisions.length, 0);
    assertEquals(t.state.offerCalls.length, 0);
    assertEquals(t.state.providerSends, 0);
  } finally { t.cleanup(); }
});

Deno.test("Fehler im Angebotsabgleich: Annahme bleibt gespeichert und Fehler wird intern protokolliert", async () => {
  const t = await loadHandler("offers_error");
  try {
    const response = await t.call("accept");
    const body = await response.json();
    assertEquals(body.status, "accepted");
    assertEquals(body.job_offers, { status: "failed" });
    assertEquals(t.state.decisions.length, 1);
    assert(t.state.adminActions.some((a) => a.action === "driver_contract_accept_jobs_failed"));
    assertEquals(t.state.providerSends, 0);
  } finally { t.cleanup(); }
});

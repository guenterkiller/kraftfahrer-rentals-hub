import { assert, assertEquals, assertStringIncludes, assertRejects } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { dispatchDriverJobOffers } from "./driver-job-offers.ts";

const DRIVER_ID = "00000000-0000-4000-8000-000000000101";
const JOB_ID = "00000000-0000-4000-8000-000000000201";
const driver = {
  id: DRIVER_ID, vorname: "TEST", nachname: "Fahrer", email: "driver@example.invalid",
  status: "approved", is_blocked: false, is_inactive: false, email_opt_out: false,
  fuehrerscheinklassen: ["CE"],
};
const job = (id = JOB_ID, extra: Record<string, unknown> = {}) => ({
  id, status: "sent", approved_at: "2026-11-16T08:00:00Z", created_at: new Date().toISOString(),
  fuehrerscheinklasse: "C+E", zeitraum: "01.06.2030 bis 30.06.2030",
  fahrzeugtyp: "TEST LKW CE", einsatzort: "TEST-ORT", nachricht: "TEST-AUFGABE",
  tarif_netto: 1645, ...extra,
});

type WorldOptions = {
  accepted?: boolean;
  jobs?: any[];
  assignments?: any[];
  driver?: any;
  invites?: any[];
  logs?: any[];
  failFirstMail?: boolean;
  jobsError?: boolean;
};

function makeWorld(options: WorldOptions = {}) {
  const state = {
    decisions: options.accepted === false ? [] : [{ id: "DECISION", driver_id: DRIVER_ID, decision: "accept", contract_version: "2026-10-25" }],
    jobs: options.jobs ?? [job()],
    assignments: options.assignments ?? [],
    invites: [...(options.invites ?? [])],
    logs: [...(options.logs ?? [])],
  };
  const mailAttempts: any[] = [];
  const providerSuccesses = new Map<string, string>();
  let failuresLeft = options.failFirstMail ? 1 : 0;

  class Query {
    filters: Array<{ kind: string; key: string; value: any }> = [];
    rowLimit = 1000;
    constructor(public table: string) {}
    select() { return this; }
    eq(key: string, value: any) { this.filters.push({ kind: "eq", key, value }); return this; }
    in(key: string, value: any[]) { this.filters.push({ kind: "in", key, value }); return this; }
    not(key: string, kind: string, value: any) { this.filters.push({ kind: `not-${kind}`, key, value }); return this; }
    gte(key: string, value: any) { this.filters.push({ kind: "gte", key, value }); return this; }
    order() { return this; }
    limit(value: number) { this.rowLimit = value; return this; }
    rows(): any[] {
      if (this.table === "job_requests" && options.jobsError) return [];
      let rows = this.table === "driver_contract_decisions" ? state.decisions
        : this.table === "job_requests" ? state.jobs
        : this.table === "job_assignments" ? state.assignments
        : this.table === "assignment_invites" ? state.invites
        : this.table === "email_log" ? state.logs : [];
      rows = rows.filter((row) => this.filters.every((filter) => {
        if (filter.kind === "eq") return row[filter.key] === filter.value;
        if (filter.kind === "in") return filter.value.includes(row[filter.key]);
        if (filter.kind === "not-is") return row[filter.key] !== filter.value;
        if (filter.kind === "gte") return row[filter.key] >= filter.value;
        return true;
      }));
      return rows.slice(0, this.rowLimit).map((row) => ({ ...row }));
    }
    maybeSingle() {
      if (this.table === "job_requests" && options.jobsError) return Promise.resolve({ data: null, error: { message: "TEST job read failed" } });
      return Promise.resolve({ data: this.rows()[0] ?? null, error: null });
    }
    single() { return this.maybeSingle(); }
    insert(value: any) {
      if (this.table === "assignment_invites") {
        if (state.invites.some((row) => row.token === value.token)) {
          return Promise.resolve({ data: null, error: { code: "23505", message: "TEST duplicate token" } });
        }
        state.invites.push({ ...value, created_at: new Date().toISOString() });
      } else if (this.table === "email_log") {
        state.logs.push({ ...value, id: `LOG-${state.logs.length + 1}`, created_at: new Date().toISOString() });
      }
      return Promise.resolve({ data: null, error: null });
    }
    then(resolve: any, reject: any) {
      if (this.table === "job_requests" && options.jobsError) {
        return Promise.resolve({ data: null, error: { message: "TEST job read failed" } }).then(resolve, reject);
      }
      return Promise.resolve({ data: this.rows(), error: null }).then(resolve, reject);
    }
  }
  const supabase = { from(table: string) { return new Query(table); } };
  const resend = {
    headers: new Headers(),
    emails: {
      send(payload: any, options: any) {
        const key = options.headers.get("Idempotency-Key");
        mailAttempts.push({ payload, key });
        if (providerSuccesses.has(key)) {
          return Promise.resolve({ data: { id: providerSuccesses.get(key) }, error: null });
        }
        if (failuresLeft > 0) {
          failuresLeft--;
          return Promise.resolve({ data: null, error: { message: "TEST temporary provider failure" } });
        }
        const id = `TEST-PROVIDER-${providerSuccesses.size + 1}`;
        providerSuccesses.set(key, id);
        return Promise.resolve({ data: { id }, error: null });
      },
    },
  };
  const dispatch = () => dispatchDriverJobOffers({
    supabase, resend, driver: options.driver ?? driver,
    mailFrom: "info@kraftfahrer-mieten.com", mailReplyTo: "info@kraftfahrer-mieten.com",
    tokenSecret: "TEST-ONLY-NOT-A-REAL-SECRET", siteBase: "https://test.invalid",
  });
  return { state, mailAttempts, providerSuccesses, dispatch };
}

Deno.test("ohne gespeicherte aktuelle Vertragsannahme: keine Einladung und keine Mail", async () => {
  const w = makeWorld({ accepted: false });
  const result = await w.dispatch();
  assertEquals(result.invitesSent, 0);
  assertEquals(w.state.invites.length, 0);
  assertEquals(w.mailAttempts.length, 0);
});

Deno.test("nur freigegebener, passender, nicht abgelaufener und nicht zugeteilter Auftrag", async () => {
  const assignedId = "00000000-0000-4000-8000-000000000202";
  const w = makeWorld({ jobs: [
    job(), job(assignedId), job("expired", { zeitraum: "01.01.2024 bis 02.01.2024" }),
    job("wrong-license", { fuehrerscheinklasse: "D" }), job("unreleased", { approved_at: null }),
  ], assignments: [{ job_id: assignedId, status: "assigned" }] });
  const result = await w.dispatch();
  assertEquals(result.invitesSent, 1);
  assertEquals(result.skippedAssigned, 1);
  assertEquals(result.skippedExpired, 1);
  assertEquals(result.skippedNoMatch, 1);
  assertEquals(w.state.invites.map((row) => row.job_id), [JOB_ID]);
  assertEquals(w.state.invites[0].purpose, "interest");
  assertEquals(w.providerSuccesses.size, 1);
  const html = w.mailAttempts[0].payload.html;
  assertStringIncludes(html, "unverbindliche Interessenbekundung");
  assertStringIncludes(html, "keine verbindliche Auftragsannahme");
  assert(!html.includes("1.645"));
  assert(!html.toLowerCase().includes("provision"));
});

Deno.test("alter Erfassungszeitpunkt schließt einen noch gültigen Auftrag nicht aus", async () => {
  const w = makeWorld({ jobs: [job(JOB_ID, { created_at: "2025-01-01T08:00:00Z" })] });
  const result = await w.dispatch();
  assertEquals(result.invitesSent, 1);
  assertEquals(w.providerSuccesses.size, 1);
});

Deno.test("erneuter Aufruf nach erfolgreichem Versand erzeugt keine zweite Mail", async () => {
  const w = makeWorld();
  const first = await w.dispatch();
  const second = await w.dispatch();
  assertEquals(first.invitesSent, 1);
  assertEquals(second.invitesSent, 0);
  assertEquals(second.skippedDuplicate, 1);
  assertEquals(w.state.invites.length, 1);
  assertEquals(w.mailAttempts.length, 1);
});

Deno.test("parallele Aufrufe: ein eindeutiger Token und genau eine Providerzustellung", async () => {
  const w = makeWorld();
  const [a, b] = await Promise.all([w.dispatch(), w.dispatch()]);
  assertEquals(a.invitesCreated + b.invitesCreated, 1);
  assertEquals(w.state.invites.length, 1);
  assertEquals(w.providerSuccesses.size, 1);
  assertEquals(new Set(w.mailAttempts.map((attempt) => attempt.key)).size, 1);
  assertEquals(w.mailAttempts[0].key, `driver-interest/${w.state.invites[0].token}`);
});

Deno.test("kein passender Auftrag: weder Einladung noch Auftragsmail", async () => {
  const w = makeWorld({ jobs: [] });
  const result = await w.dispatch();
  assertEquals(result.matchingJobs.length, 0);
  assertEquals(result.invitesSent, 0);
  assertEquals(w.mailAttempts.length, 0);
});

Deno.test("nicht freigeschaltet, gesperrt, deaktiviert oder Opt-out: vollständig gesperrt", async () => {
  for (const change of [{ status: "pending" }, { is_blocked: true }, { is_inactive: true }, { email_opt_out: true }]) {
    const w = makeWorld({ driver: { ...driver, ...change } });
    const result = await w.dispatch();
    assertEquals(result.invitesSent, 0);
    assertEquals(w.state.invites.length, 0);
    assertEquals(w.mailAttempts.length, 0);
  }
});

Deno.test("Fehlerfall: fehlgeschlagener Versand wird protokolliert und mit identischem Link sicher wiederholt", async () => {
  const w = makeWorld({ failFirstMail: true });
  const failed = await w.dispatch();
  assertEquals(failed.invitesSent, 0);
  assertEquals(failed.failed, 1);
  assertEquals(w.state.logs[0].status, "failed");
  const firstKey = w.mailAttempts[0].key;
  const firstHtml = w.mailAttempts[0].payload.html;
  const retried = await w.dispatch();
  assertEquals(retried.invitesSent, 1);
  assertEquals(w.state.invites.length, 1);
  assertEquals(w.mailAttempts[1].key, firstKey);
  assertEquals(w.mailAttempts[1].payload.html, firstHtml);
  assertEquals(w.state.logs.filter((row) => row.status === "sent").length, 1);
});

Deno.test("Abfragefehler: kein Versand und kein falscher Leerstand", async () => {
  const w = makeWorld({ jobsError: true });
  await assertRejects(() => w.dispatch(), Error, "Offene Aufträge konnten nicht gelesen werden");
  assertEquals(w.state.invites.length, 0);
  assertEquals(w.mailAttempts.length, 0);
});

Deno.test("abgelehnte oder abgelaufene Einladung wird niemals erneut versendet", async () => {
  for (const invite of [
    { job_id: JOB_ID, driver_id: DRIVER_ID, token: "OLD", status: "declined", token_expires_at: "2030-06-01T00:00:00Z", responded_at: "2026-11-01T00:00:00Z" },
    { job_id: JOB_ID, driver_id: DRIVER_ID, token: "OLD", status: "pending", token_expires_at: "2026-01-01T00:00:00Z", responded_at: null },
  ]) {
    const w = makeWorld({ invites: [invite] });
    const result = await w.dispatch();
    assertEquals(result.invitesSent, 0);
    assertEquals(result.skippedDuplicate, 1);
    assertEquals(w.mailAttempts.length, 0);
  }
});

Deno.test("höchstens fünf Auftragsmails je automatischem Abgleich", async () => {
  const jobs = Array.from({ length: 7 }, (_, index) => job(`TEST-JOB-${index}`));
  const w = makeWorld({ jobs });
  const result = await w.dispatch();
  assertEquals(result.invitesSent, 5);
  assertEquals(w.state.invites.length, 5);
  assertEquals(w.providerSuccesses.size, 5);
});

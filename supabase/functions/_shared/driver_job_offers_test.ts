import { assert, assertEquals, assertStringIncludes, assertRejects } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { dispatchDriverJobOffers, dispatchReleasedJobToContractDrivers } from "./driver-job-offers.ts";

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
  tarif_type: "lkw_ce_woche", tarif_netto: 1645, tarif_unit: "je Woche (5 Einsatztage, bis 9 Stunden je Einsatztag)",
  tarif_needs_review: false, besonderheiten: null,
  kosten_uebersicht: { netto: 1645, positionen: [{ label: "LKW-Fahrer CE – Wochenpreis: 1 Woche (Mo–Fr) × 1.645,00 €", betrag: 1645 }] },
  ...extra,
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
  drivers?: any[];
  decisions?: any[];
};

function makeWorld(options: WorldOptions = {}) {
  const state = {
    decisions: options.decisions ?? (options.accepted === false ? [] : [{ id: "DECISION", driver_id: DRIVER_ID, decision: "accept", contract_version: "2026-10-25" }]),
    drivers: options.drivers ?? [options.driver ?? driver],
    jobs: options.jobs ?? [job()],
    assignments: options.assignments ?? [],
    invites: [...(options.invites ?? [])],
    logs: [...(options.logs ?? [])],
    actions: [] as any[],
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
        : this.table === "email_log" ? state.logs
        : this.table === "fahrer_profile" ? state.drivers : [];
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
      } else if (this.table === "admin_actions") {
        state.actions.push(value);
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
  const release = (releasedJob: any = state.jobs[0]) => dispatchReleasedJobToContractDrivers({
    supabase, resend, job: releasedJob, mailFrom: "info@kraftfahrer-mieten.com", mailReplyTo: "info@kraftfahrer-mieten.com",
    tokenSecret: "TEST-ONLY-NOT-A-REAL-SECRET", siteBase: "https://test.invalid", pauseMs: 0,
  });
  return { state, mailAttempts, providerSuccesses, dispatch, release };
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

// ---- Vergütungsbox im ersten Auftragsangebot (Testbuchungen, Kundenpreis nur als Eingangswert) ----
const ceWeeks = (extra: Record<string, unknown> = {}) => job(JOB_ID, {
  zeitraum: "vom 03.06.2030 bis 11.07.2030",
  kosten_uebersicht: { netto: 8883, positionen: [
    { label: "LKW-Fahrer CE – Wochenpreis: 5 Wochen (Mo–Fr) × 1.645,00 €", betrag: 8225 },
    { label: "2 Einsatztage (Mo–Fr) × 329,00 €", betrag: 658 },
  ] }, ...extra,
});

Deno.test("CE-Woche 1.645 € Kundenpreis, 1 Woche: Box 1.316,00 € gesamt und je Woche, kein Kundenpreis", async () => {
  const w = makeWorld();
  const result = await w.dispatch();
  assertEquals(result.invitesSent, 1);
  const html = w.mailAttempts[0].payload.html;
  assertStringIncludes(html, 'data-testid="driver-compensation-box"');
  assertStringIncludes(html, "Ihre Vergütung für diesen Auftrag");
  assertStringIncludes(html, "1.316,00 €</p>");
  assertStringIncludes(html, "<strong>1.316,00 €</strong> netto je Woche");
  assert(html.indexOf("driver-compensation-box") < html.indexOf("Einsatzdetails"), "Box steht oben");
  for (const leak of ["1.645", "Provision", "provision", "Vermittlungsanteil", "Marge"]) assert(!html.includes(leak), leak);
});

Deno.test("CE-Woche 5 Wochen + 2 Resttage ohne Wochenende: 8.883 € Fahrleistung → 7.106,40 € netto, Provision genau einmal", async () => {
  const w = makeWorld({ jobs: [ceWeeks()] });
  await w.dispatch();
  const html = w.mailAttempts[0].payload.html;
  assertStringIncludes(html, "7.106,40 €");
  assertStringIncludes(html, "5 Wochen (Mo–Fr): 6.580,00 € netto");
  assertStringIncludes(html, "2 Einsatztage (Mo–Fr): 526,40 € netto");
  assertStringIncludes(html, "Grundsatz: 1.316,00 € netto je Woche");
  for (const leak of ["1.645", "329,00", "8.883", "5.684"]) assert(!html.includes(leak), leak);
});

Deno.test("Event 2 Tage × 489 €: 25 % → 733,50 € netto", async () => {
  const w = makeWorld({ jobs: [job(JOB_ID, { tarif_type: "event", tarif_netto: 489, tarif_unit: "je Einsatztag",
    kosten_uebersicht: { netto: 978, positionen: [{ label: "Event-Tourneepauschale: 2 Einsatztage × 489,00 €", betrag: 978 }] } })] });
  await w.dispatch();
  const html = w.mailAttempts[0].payload.html;
  assertStringIncludes(html, "733,50 €</p>");
  assertStringIncludes(html, "<strong>366,75 €</strong> netto je Einsatztag");
  assert(!html.includes("489"));
});

Deno.test("fehlende Tarifart oder Kalkulation: keine Einladung, keine Mail, genaues Protokoll", async () => {
  for (const [extra, field] of [
    [{ tarif_type: null }, "job_requests.tarif_type"],
    [{ kosten_uebersicht: null }, "job_requests.kosten_uebersicht"],
    [{ tarif_needs_review: true }, "job_requests.tarif_needs_review"],
  ] as const) {
    const w = makeWorld({ jobs: [job(JOB_ID, extra)] });
    const result = await w.dispatch();
    assertEquals(result.invitesSent, 0);
    assertEquals(w.state.invites.length, 0);
    assertEquals(w.mailAttempts.length, 0);
    assertEquals(result.blockedNoRemuneration[0].jobId, JOB_ID);
    assertStringIncludes(w.state.actions[0].note, field);
    assertEquals(w.state.actions[0].action, "driver_interest_offer_blocked");
  }
});

Deno.test("Altbestand mit nicht gebuchten Sa/So-Positionen (Völklingen-Muster): gesperrt statt falscher Betrag", async () => {
  const w = makeWorld({ jobs: [ceWeeks({ kosten_uebersicht: { netto: 9319.25, positionen: [
    { label: "LKW-Fahrer CE – Wochenpreis: 5 Wochen (Mo–Fr) × 1.645,00 €", betrag: 8225 },
    { label: "2 Einsatztage (Mo–Fr) × 329,00 €", betrag: 658 },
    { label: "Sa, 08.06.2030: 349,00 € + 25 % Zuschlag", betrag: 436.25 },
  ] } })] });
  const result = await w.dispatch();
  assertEquals(w.mailAttempts.length, 0);
  assertStringIncludes(result.blockedNoRemuneration[0].reasons[0], "Wochenendarbeit");
});

Deno.test("gebuchte Wochenendarbeit: Zuschlag als Fahrer-Nettobetrag ohne Kundenbetrag", async () => {
  const w = makeWorld({ jobs: [ceWeeks({ besonderheiten: "Wochenendarbeit", kosten_uebersicht: { netto: 9319.25, positionen: [
    { label: "LKW-Fahrer CE – Wochenpreis: 5 Wochen (Mo–Fr) × 1.645,00 €", betrag: 8225 },
    { label: "2 Einsatztage (Mo–Fr) × 329,00 €", betrag: 658 },
    { label: "Sa, 08.06.2030: 349,00 € + 25 % Zuschlag", betrag: 436.25 },
  ] } })] });
  await w.dispatch();
  const html = w.mailAttempts[0].payload.html;
  assertStringIncludes(html, "7.455,40 €");
  assertStringIncludes(html, "Sa, 08.06.2030: Tagessatz + 25 % Zuschlag: 349,00 € netto");
  assert(!html.includes("436,25"));
});

Deno.test("Nachweis: vollständige Testmail aus dem echten Renderer", async () => {
  const w = makeWorld({ jobs: [ceWeeks({ einsatzort: "TEST – Völklingen, 66333", fahrzeugtyp: "TEST – LKW-Fahrer CE", nachricht: "TESTDATEN – Werksverkehr" })] });
  await w.dispatch();
  const out = Deno.env.get("PROOF_OUT");
  if (out) await Deno.writeTextFile(out, w.mailAttempts[0].payload.html);
});

// ---- Automatischer Versand bei Auftragsfreigabe an Vertragsfahrer ----
const D2 = "00000000-0000-4000-8000-000000000102";
const DTEST = "00000000-0000-4000-8000-000000000103";
const DNOCONTRACT = "00000000-0000-4000-8000-000000000104";
const accept = (id: string) => ({ id: `DEC-${id}`, driver_id: id, decision: "accept", contract_version: "2026-10-25" });
const releaseWorld = (extra: WorldOptions = {}) => makeWorld({
  jobs: [ceWeeks()],
  drivers: [
    driver,
    { ...driver, id: D2, email: "driver2@example.invalid" },
    { ...driver, id: DTEST, email: "testfahrer@example.invalid", is_test: true },
    { ...driver, id: DNOCONTRACT, email: "ohnevertrag@example.invalid" },
  ],
  decisions: [accept(DRIVER_ID), accept(D2), accept(DTEST), { ...accept(DNOCONTRACT), contract_version: "1999-01-01" }],
  ...extra,
});

Deno.test("Freigabe: Angebot mit 7.106,40 € an alle echten Vertragsfahrer, Testfahrer und Fahrer ohne aktuelle Annahme ausgeschlossen", async () => {
  const w = releaseWorld();
  const r = await w.release();
  assertEquals(r.skipped, null);
  assertEquals(r.invitesSent, 2);
  assertEquals(r.excludedTestDrivers, 1);
  assertEquals(r.contractDrivers, 2);
  assertEquals(w.mailAttempts.map((a) => a.payload.to[0]).sort(), ["driver2@example.invalid", "driver@example.invalid"]);
  for (const a of w.mailAttempts) {
    assertStringIncludes(a.payload.html, "7.106,40 €");
    assertStringIncludes(a.payload.html, "Unverbindliches Auftragsangebot");
    for (const leak of ["1.645", "8.883", "Provision"]) assert(!a.payload.html.includes(leak), leak);
  }
  assertEquals(w.state.logs.filter((l) => l.status === "sent" && l.template === "driver_job_invite_post_approval").length, 2);
});

Deno.test("Freigabe wiederholt (erneutes Senden): keine zweite Mail", async () => {
  const w = releaseWorld();
  const first = await w.release();
  const second = await w.release();
  assertEquals(first.invitesSent, 2);
  assertEquals(second.invitesSent, 0);
  assertEquals(second.skippedDuplicate, 2);
  assertEquals(w.mailAttempts.length, 2);
});

Deno.test("Freigabe parallel doppelt ausgelöst: je Fahrer genau ein Token und eine Providerzustellung", async () => {
  const w = releaseWorld();
  await Promise.all([w.release(), w.release()]);
  assertEquals(w.state.invites.length, 2);
  assertEquals(w.providerSuccesses.size, 2);
  assertEquals(new Set(w.mailAttempts.map((a) => a.key)).size, 2);
});

Deno.test("Freigabe ohne Kalkulation: keine Einladung, keine Mail, genau ein Sperrprotokoll", async () => {
  const w = releaseWorld({ jobs: [ceWeeks({ kosten_uebersicht: null })] });
  const r = await w.release();
  assertEquals(r.skipped, "no_remuneration");
  assertEquals(w.mailAttempts.length, 0);
  assertEquals(w.state.invites.length, 0);
  assertEquals(w.state.actions.length, 1);
  assertEquals(w.state.actions[0].action, "driver_interest_offer_blocked");
  assertStringIncludes(w.state.actions[0].note, "job_requests.kosten_uebersicht");
});

Deno.test("Freigabe mit falschen Wochenendposten (Völklingen-Original 13.681,75 €): gesperrt", async () => {
  const sat = (d: string) => ({ label: `Sa, ${d}: 349,00 € + 25 % Zuschlag`, betrag: 436.25 });
  const sun = (d: string) => ({ label: `So, ${d}: 349,00 € + 50 % Zuschlag`, betrag: 523.5 });
  const w = releaseWorld({ jobs: [ceWeeks({ kosten_uebersicht: { netto: 13681.75, positionen: [
    { label: "LKW-Fahrer CE – Wochenpreis: 5 Wochen (Mo–Fr) × 1.645,00 €", betrag: 8225 },
    { label: "2 Einsatztage (Mo–Fr) × 329,00 €", betrag: 658 },
    sat("21.11.2026"), sun("22.11.2026"), sat("28.11.2026"), sun("29.11.2026"), sat("05.12.2026"),
    sun("06.12.2026"), sat("12.12.2026"), sun("13.12.2026"), sat("19.12.2026"), sun("20.12.2026"),
  ] } })] });
  const r = await w.release();
  assertEquals(r.skipped, "no_remuneration");
  assertStringIncludes(r.blockedReasons[0], "Wochenendarbeit");
  assertEquals(w.mailAttempts.length, 0);
});

Deno.test("Freigabe eines Testauftrags oder nicht freigegebenen Auftrags: niemand erhält eine Mail", async () => {
  for (const extra of [{ is_test: true }, { approved_at: null }, { status: "assigned" }]) {
    const w = releaseWorld({ jobs: [ceWeeks(extra)] });
    const r = await w.release();
    assert(r.skipped === "test_job" || r.skipped === "not_released");
    assertEquals(w.mailAttempts.length, 0);
    assertEquals(w.state.invites.length, 0);
  }
});

Deno.test("Freigabe: bereits abgelehnte Einladung aus alter Rundmail wird nicht erneut angeschrieben", async () => {
  const w = releaseWorld({ invites: [{ job_id: JOB_ID, driver_id: D2, token: "OLD-BROADCAST", status: "declined",
    token_expires_at: "2030-06-01T00:00:00Z", responded_at: "2026-11-16T09:00:00Z" }] });
  const r = await w.release();
  assertEquals(r.invitesSent, 1);
  assertEquals(w.mailAttempts.map((a) => a.payload.to[0]), ["driver@example.invalid"]);
});

Deno.test("Testfahrer erhält auch beim Einzelabgleich kein automatisches Angebot", async () => {
  const w = makeWorld({ driver: { ...driver, is_test: true } });
  const r = await w.dispatch();
  assertEquals(r.invitesSent, 0);
  assertEquals(w.mailAttempts.length, 0);
});

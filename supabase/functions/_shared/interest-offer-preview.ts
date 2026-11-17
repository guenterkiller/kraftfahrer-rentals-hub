// Daten der unverbindlichen Interessen-Seite: gleiche Vergütung wie in der ersten Angebotsmail,
// aber weder Kundenidentität noch Kundenpreis oder Vermittlungsprovision in der Serverantwort.
import { interestRemuneration } from "./driver-job-offers.ts";
import { driverSurchargeText } from "./driver-offer-remuneration.ts";
import { tarifOhneZuschlaege } from "./kosten-uebersicht.ts";

// deno-lint-ignore no-explicit-any
type Any = any;

const hasBookedDays = (value: unknown): boolean =>
  Array.isArray(value) && value.some((day) => String(day ?? "").trim().length > 0);

const weekendExplicitlyBooked = (job: Any): boolean =>
  hasBookedDays(job?.weekend_days) || String(job?.besonderheiten ?? "").split(",")
    .some((entry) => entry.trim() === "Wochenendarbeit");

/** Zuschläge nur bei tatsächlich gebuchten Tagen; Pauschaltarife behalten ihren bestehenden Ausschlusstext. */
export function interestSurchargeText(job: Any): string | null {
  if (tarifOhneZuschlaege(job?.tarif_type)) return driverSurchargeText(job?.tarif_type);
  const weekend = weekendExplicitlyBooked(job);
  const holiday = hasBookedDays(job?.holiday_days);
  if (weekend && holiday) return driverSurchargeText(job?.tarif_type);
  if (holiday) return "Gesetzliche Feiertage 50 %";
  if (weekend) return "Samstag 25 %, Sonntag 50 %";
  return null;
}

/** Öffentliche, tokengebundene Vorschau ohne Kundenidentität und ohne interne Abrechnungszeilen. */
export function buildInterestOfferPreview(job: Any): {
  job: Record<string, unknown> | null;
  job_lines: [string, string][] | null;
} {
  if (!job) return { job: null, job_lines: null };
  const pay = interestRemuneration(job);
  // Diese interne Zeile enthält den Ausgangsbetrag vor Provision und wird weder im Mailrenderer noch hier ausgegeben.
  const lines = pay.ok
    ? pay.lines.filter(([label]) => !label.startsWith("Fahrerhonorar netto vor Provision"))
    : null;
  return {
    job: {
      id: job.id,
      einsatzort: job.einsatzort,
      zeitraum: job.zeitraum,
      fahrzeugtyp: job.fahrzeugtyp,
      fuehrerscheinklasse: job.fuehrerscheinklasse,
      besonderheiten: job.besonderheiten,
      nachricht: job.nachricht,
      tarif_type: job.tarif_type ?? null,
      surcharge_text: interestSurchargeText(job),
    },
    job_lines: lines,
  };
}

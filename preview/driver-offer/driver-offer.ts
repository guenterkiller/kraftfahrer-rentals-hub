// VORSCHAU-ENTWURF – nicht deployt, nicht mit Versand/respond-invite verbunden (siehe preview/AGENTS.md).
// Verwendet die produktiven Angebotszeilen unverändert und ersetzt nur den Vergütungsblock.
import { buildCompleteOfferLines, remuneration, renderOfferLines, type OfferData } from '../../supabase/functions/_shared/binding-offer.ts';
import { formatEuro } from '../../supabase/functions/_shared/kosten-uebersicht.ts';

export type DriverOfferView = { mode: 'binding' | 'interest'; lines: [string, string][]; missing: string[] };

/** Provisionssatz aus der gespeicherten Tarifart (Nutzervorgabe 09.11.2026); unbekannt/Prüfung → null, nie geraten. */
export function commissionPctForTarif(tarifType: unknown): 20 | 25 | null {
  switch (String(tarifType ?? '')) {
    case 'lkw_ce': case 'lkw_ce_woche': case 'fernfahrer': return 20;
    case 'baumaschine': case 'event': case 'ueberfuehrung': case 'Überführung': return 25;
    default: return null;
  }
}

/** Vergütete Einheiten nur aus tatsächlich gespeicherten Angaben: Tage aus Kalenderdaten, Wochen nur bei ganzen 7-Tage-Blöcken, Pauschale = 1; Stunden sind nicht gespeichert. */
export function paidUnits(assignment: OfferData, days: number | null): { units: number; label: string } | null {
  switch (assignment?.rate_type) {
    case 'daily': return days ? { units: days, label: days === 1 ? 'Einsatztag' : 'Einsatztage' } : null;
    case 'weekly': return days && days % 7 === 0 ? { units: days / 7, label: days === 7 ? 'Woche' : 'Wochen' } : null;
    case 'fixed': case 'flat': return { units: 1, label: 'Pauschale' };
    default: return null;
  }
}

export function buildDriverOfferView(job: OfferData, assignment: OfferData): DriverOfferView {
  const { days } = remuneration(job, assignment);
  const rate = Number(assignment?.rate_value);
  const rateCents = Number.isFinite(rate) && rate > 0 ? Math.round(rate * 100) : null;
  const pct = commissionPctForTarif(job?.tarif_type);
  const stored = assignment?.commission_pct;
  const units = paidUnits(assignment, days);
  const missing: string[] = [];
  if (rateCents === null) missing.push('Auftragsbezogen vereinbarter Fahrersatz');
  if (days === null) missing.push('Einsatzzeitraum (Kalenderdaten)');
  if (units === null) missing.push('Vergütete Einheiten (Tage/Wochen/Stunden) nicht eindeutig gespeichert');
  if (job?.tarif_needs_review) missing.push('Tarifzuordnung noch zu prüfen');
  if (pct === null) missing.push('Tarifart ohne festgelegte Provisionsregel');
  else if (stored != null && stored !== '' && Number(stored) !== pct)
    missing.push(`Gespeicherter Provisionssatz (${stored} %) weicht von der Tarifregel (${pct} %) ab`);

  const complete = missing.length === 0;
  const feeCents = complete ? rateCents! * units!.units : null;
  const commissionCents = complete ? Math.round(feeCents! * pct! / 100) : null;
  const unitWord = assignment?.rate_type === 'weekly' ? 'Woche' : assignment?.rate_type === 'daily' ? 'Einsatztag' : 'Pauschale';
  const base = buildCompleteOfferLines(job, assignment).filter(([l]) =>
    !/^(Nettoauftragswert|Gesamtwert Fahrerdienstleistung|Agenturprovision|Vermittlungsanteil|Nettovergütung des|Verbleibende Fahrervergütung|Vergütete|Stand-|Ruhetage)/.test(l));
  const lines: [string, string][] = [
    ...base,
    ['Vergütete Einheiten', complete ? `${units!.units} ${units!.label} (aus dem vereinbarten Zeitraum)` : 'Nicht eindeutig bestimmt'],
    ['Stand-/Ruhetage', 'Nicht gesondert vereinbart – keine zusätzlichen Tage angesetzt'],
    ['Fahrerhonorar netto vor Provision (gesamter Auftrag)', complete
      ? `${formatEuro(rateCents! / 100)} je ${unitWord} × ${units!.units} = ${formatEuro(feeCents! / 100)}`
      : 'Nicht bestimmt – keine Zahl angegeben'],
    ['Vermittlungsprovision', complete ? `${pct} % = ${formatEuro(commissionCents! / 100)} netto` : 'Nicht festgelegt – keine Zahl angegeben'],
    ['Verbleibende Nettovergütung (gesamter Auftrag, zzgl. provisionsfreier An-/Abfahrt)', complete ? formatEuro((feeCents! - commissionCents!) / 100) : 'Nicht bestimmt – keine Zahl angegeben'],
    ['Antwortart', complete ? 'Verbindliche Annahme oder Ablehnung möglich' : `Nur unverbindliche Interessenbekundung – fehlend: ${missing.join('; ')}`],
  ];
  return { mode: complete ? 'binding' : 'interest', lines, missing };
}

/** E-Mail und Bestätigungsseite erhalten exakt dieselben Zeilen. */
export const renderDriverOfferEmail = (v: DriverOfferView) => renderOfferLines(v.lines);
export const driverOfferPagePayload = (v: DriverOfferView) => ({ status: 'ready', mode: v.mode, job_lines: v.lines, can_accept_binding: v.mode === 'binding' });

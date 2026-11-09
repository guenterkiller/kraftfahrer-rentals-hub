// VORSCHAU-ENTWURF – nicht deployt, nicht mit Versand/respond-invite verbunden (siehe preview/AGENTS.md).
// Verwendet unverändert die produktive Angebotslogik und ergänzt nur strengere Annahmebedingungen.
import { buildCompleteOfferLines, remuneration, renderOfferLines, type OfferData } from '../../supabase/functions/_shared/binding-offer.ts';
import { formatEuro } from '../../supabase/functions/_shared/kosten-uebersicht.ts';

export type DriverOfferView = { mode: 'binding' | 'interest'; lines: [string, string][]; missing: string[] };

/** Provision nur, wenn an der Zuteilung ausdrücklich 20 oder 25 % gespeichert sind – kein Standardwert. */
export function storedCommissionPct(assignment: OfferData): 20 | 25 | null {
  const v = assignment?.commission_pct;
  return v === 20 || v === 25 || v === '20' || v === '25' ? Number(v) as 20 | 25 : null;
}

export function buildDriverOfferView(job: OfferData, assignment: OfferData): DriverOfferView {
  const pay = remuneration(job, assignment);
  const pct = storedCommissionPct(assignment);
  const missing: string[] = [];
  if (!(Number(assignment?.rate_value) > 0)) missing.push('Vereinbarter Fahrersatz');
  if (pay.days === null) missing.push('Einsatzzeitraum (Kalenderdaten)');
  if (pay.serviceCents === null) missing.push('Fahrerhonorar netto für den gesamten Auftrag');
  if (pct === null) missing.push('Festgelegter Vermittlungsprovisionssatz');
  if (job?.tarif_type === 'event' && pct !== 25) missing.push('Eventauftrag erfordert festgelegte 25 %');

  // Bestehende Zeilen, Vergütungsblock aber nur mit gesichertem Satz; sonst keine Zahlen.
  const base = buildCompleteOfferLines(job, assignment).filter(([l]) =>
    !/^(Nettoauftragswert|Gesamtwert Fahrerdienstleistung|Agenturprovision|Vermittlungsanteil|Nettovergütung des|Verbleibende Fahrervergütung)/.test(l));
  const complete = missing.length === 0 && pay.serviceCents !== null && pct !== null;
  const commissionCents = complete ? Math.round(pay.serviceCents! * pct! / 100) : null;
  const lines: [string, string][] = [
    ...base,
    ['Vergütete Einsatztage', complete ? `${pay.days} (laut vereinbartem Zeitraum und gespeicherter Kalkulation)` : 'Nicht eindeutig bestimmt'],
    ['Stand-/Ruhetage', 'Nicht gesondert erfasst – keine zusätzlichen vergüteten oder unvergüteten Tage angesetzt'],
    ['Fahrerhonorar netto vor Provision (gesamter Auftrag)', complete ? formatEuro(pay.serviceCents! / 100) : 'Nicht bestimmt – keine Zahl angegeben'],
    ['Vermittlungsprovision', complete ? `${pct} % = ${formatEuro(commissionCents! / 100)} netto` : 'Nicht festgelegt – keine Zahl angegeben'],
    ['Verbleibende Nettovergütung (gesamter Auftrag, zzgl. provisionsfreier An-/Abfahrt)', complete ? formatEuro((pay.serviceCents! - commissionCents!) / 100) : 'Nicht bestimmt – keine Zahl angegeben'],
    ['Antwortart', complete ? 'Verbindliche Annahme oder Ablehnung möglich' : `Nur unverbindliche Interessenbekundung – fehlend: ${missing.join(', ')}`],
  ];
  return { mode: complete ? 'binding' : 'interest', lines, missing };
}

/** E-Mail und Bestätigungsseite erhalten exakt dieselben Zeilen. */
export const renderDriverOfferEmail = (v: DriverOfferView) => renderOfferLines(v.lines);
export const driverOfferPagePayload = (v: DriverOfferView) => ({ status: 'ready', mode: v.mode, job_lines: v.lines, can_accept_binding: v.mode === 'binding' });

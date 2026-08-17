/**
 * Zentrale, verbindliche Tariftexte (Preisschilder / Tarifkarten).
 *
 * Diese Texte müssen auf der gesamten Webseite, im Buchungsformular und in den
 * E-Mails WORTGLEICH verwendet werden. Keine abweichenden Kurzfassungen.
 */

export interface TarifText {
  name: string;
  /** Betrag als Anzeigewert, z. B. "349,00 €" */
  amount: string;
  /** Einheit, ergibt zusammen mit amount die verbindliche Preiszeile */
  unit: string;
  /** Vollständige Preiszeile (amount + unit) */
  priceLine: string;
  /** Verbindliche Zusatzhinweise in fester Reihenfolge */
  details: string[];
  /** Ergänzende verbindliche Absätze (z. B. Wochenpreis-Abgrenzung) */
  notes?: string[];
  /** Kompakte Einheit für Preiskarten */
  cardUnit: string;
  /** Kompakte Zusatzzeilen für Preiskarten (keine Wiederholungen, keine Ausschlüsse) */
  cardLines: string[];
}

const build = (
  name: string,
  amount: string,
  unit: string,
  details: string[],
  notes: string[] | undefined,
  cardUnit: string,
  cardLines: string[],
): TarifText => ({
  name,
  amount,
  unit,
  priceLine: `${amount} ${unit}`,
  details,
  notes,
  cardUnit,
  cardLines,
});

/** Gemeinsamer Hinweis oberhalb aller Preiskarten (einmalig anzeigen). */
export const PREISKARTEN_HINWEIS =
  'Alle Preise netto zzgl. gesetzlicher MwSt. Es gelten die veröffentlichten Preise und Konditionen.';

/** Gemeinsamer Link unterhalb der Preiskarten. */
export const PREISKARTEN_LINK_TEXT = 'Details: Preise & Konditionen';

/** Titel für Preiskarten mit sauberen Umbruchstellen an Schrägstrichen. */
export const tarifTitel = (name: string): string => name.replace(/\//g, '/\u200B');

export const TARIF_TEXTE = {
  lkw_ce: build(
    'LKW-Fahrer CE',
    '349,00 €',
    'netto je tatsächlichem Einsatztag',
    [
      'Bis zu 9 Stunden Einsatzzeit',
      'Zuzüglich An- und Abfahrt, Mehrstunden sowie gegebenenfalls Wochenend- und Feiertagszuschläge gemäß Preisliste',
    ],
    undefined,
    'netto je tatsächlichem Einsatztag',
    ['Bis zu 9 Stunden Einsatzzeit'],
  ),
  lkw_ce_woche: build(
    'LKW-Fahrer CE – Wochenpreis',
    '1.645,00 €',
    'netto für 5 Einsatztage von Montag bis Freitag',
    [
      'Bis zu 9 Stunden Einsatzzeit je Einsatztag',
      'Der Wochenpreis gilt ausschließlich für Montag bis Freitag',
      'Samstage, Sonntage und gesetzliche Feiertage sind nicht im Wochenpreis enthalten und werden bei einem Einsatz separat nach dem geltenden Tagessatz zuzüglich des zutreffenden Zuschlags berechnet.',
      'Zuzüglich An- und Abfahrt sowie tatsächlich angefallener Mehrstunden gemäß Preisliste',
    ],
    [
      'Fällt ein gesetzlicher Feiertag auf einen Montag bis Freitag, ist dieser Feiertagseinsatz ebenfalls nicht im Wochenpreis enthalten und wird separat nach dem geltenden Tagessatz zuzüglich 50 % Feiertagszuschlag berechnet.',
    ],
    'netto für 5 Einsatztage',
    ['Montag bis Freitag', 'Bis zu 9 Stunden Einsatzzeit je Einsatztag'],
  ),
  fernfahrer: build(
    'Fernfahrer-Pauschale',
    '450,00 €',
    'netto je tatsächlichem Fernverkehrs-Einsatztag',
    ['Zuzüglich An- und Abfahrt sowie gegebenenfalls veröffentlichter Zuschläge'],
    undefined,
    'netto je tatsächlichem Fernverkehrs-Einsatztag',
    [],
  ),
  baumaschine: build(
    'Baumaschinenführer/Mischmeister/Spezialfahrzeuge',
    '489,00 €',
    'netto je tatsächlichem Einsatztag',
    [
      'Bis zu 8 Stunden Einsatzzeit',
      'Mehrarbeit: 60,00 € netto je angefangene Stunde',
      'Zuzüglich An- und Abfahrt sowie gegebenenfalls Wochenend- und Feiertagszuschläge gemäß Preisliste',
    ],
    undefined,
    'netto je tatsächlichem Einsatztag',
    ['Bis zu 8 Stunden Einsatzzeit'],
  ),
} as const;

export type TarifTextKey = keyof typeof TARIF_TEXTE;

/** Kompakte Einzeiler für Auswahllisten (Preis + enthaltene Einsatzzeit). */
export const tarifKurz = (key: TarifTextKey): string => {
  const t = TARIF_TEXTE[key];
  return [t.priceLine, ...t.details].join(' · ');
};

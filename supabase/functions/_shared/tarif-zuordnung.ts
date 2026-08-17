/**
 * Zentrale Tarifzuordnung Fahrerexpress.
 *
 * Abgrenzung: Der Tarif "Baumaschinenführer / Mischmeister" gilt auch für
 * Spezialfahrzeuge (Saugwagen, Saugbagger, Pumptruck / Estrich-Pumptruck,
 * Betonpumpe, Mischfahrzeug, Spül-/Reinigungsfahrzeug, Kanal-/Entsorgungs-
 * fahrzeug, Arbeitsmaschine), wenn die Bedienung einer fest aufgebauten
 * Maschine oder Anlage wesentlicher Bestandteil des Einsatzes ist.
 * Reiner LKW-CE-Transport ohne maßgebliche Maschinenbedienung bleibt beim
 * LKW-CE-Tarif.
 *
 * Wichtig: Freitext-Stichwörter lösen NIE allein einen Tarif aus. Sie führen
 * lediglich zu einer Markierung "manuelle Prüfung", wenn sie der Angabe des
 * Bestellers widersprechen.
 */

export type Maschinenbedienung = 'ja' | 'nein' | 'unklar' | '';

export type TarifKey =
  | 'lkw_ce'
  | 'lkw_ce_woche'
  | 'fernfahrer'
  | 'baumaschine'
  | 'pruefung';

export interface TarifResult {
  tarif: TarifKey;
  label: string;
  /** Netto-Grundpreis in EUR, null wenn Prüfung erforderlich */
  netto: number | null;
  /** Einheit des Grundpreises */
  einheit: string;
  /** Netto-Preis je angefangene Mehrstunde in EUR, null wenn unbestimmt */
  mehrstunde: number | null;
  needsReview: boolean;
  reason: string;
}

/** Stichwörter für Spezialfahrzeuge mit typischer Maschinenbedienung. */
const SPEZIALFAHRZEUG_KEYWORDS = [
  'saugwagen', 'saugbagger', 'saugfahrzeug',
  'pumptruck', 'pump-truck', 'estrichpump', 'estrich-pump', 'estrichpumpe',
  'betonpumpe', 'autobetonpumpe', 'fahrmischer', 'mischfahrzeug', 'mischer',
  'mischmeister', 'spülwagen', 'spuelwagen', 'spülfahrzeug', 'reinigungsfahrzeug',
  'kanalreinigung', 'kanalfahrzeug', 'entsorgungsfahrzeug', 'kombifahrzeug',
  'arbeitsmaschine', 'baumaschine', 'bagger', 'radlader', 'walze', 'raupe',
  'flüssigboden', 'fluessigboden', 'silo', 'förderanlage', 'foerderanlage',
];

export const SPEZIALFAHRZEUG_BEISPIELE = [
  'Saugwagen / Saugbagger',
  'Pumptruck / Estrich-Pumptruck',
  'Betonpumpe',
  'Mischfahrzeug / Mischmeister',
  'Spül- und Reinigungsfahrzeug',
  'Kanal- und Entsorgungsfahrzeug',
  'Arbeitsmaschine / vergleichbares Spezialfahrzeug',
];

export const BAUMASCHINE_LABEL = 'Baumaschinenführer / Mischmeister (Maschinen- und Anlagenbedienung)';

const containsKeyword = (text: string): boolean => {
  const t = (text || '').toLowerCase();
  return SPEZIALFAHRZEUG_KEYWORDS.some((k) => t.includes(k));
};

export interface TarifInput {
  /** Gewählte Kategorie im Formular */
  kategorie: string;
  /** Antwort auf die Pflichtfrage zur Maschinen-/Anlagenbedienung */
  maschinenbedienung: Maschinenbedienung;
  /** Fernverkehr / Übernachtung im LKW */
  longDistance?: boolean;
  /** Detail-Tätigkeit (Spezialfahrzeugtyp) */
  taetigkeit?: string;
  /** Freitext des Bestellers */
  beschreibung?: string;
}

const PRUEFUNG: Omit<TarifResult, 'reason'> = {
  tarif: 'pruefung',
  label: 'Tarifzuordnung wird manuell geprüft',
  netto: null,
  einheit: 'wird nach Prüfung mitgeteilt',
  mehrstunde: null,
  needsReview: true,
};

export function resolveTarif(input: TarifInput): TarifResult {
  const kategorie = (input.kategorie || '').trim();
  const mb = input.maschinenbedienung || '';
  const freitext = `${input.taetigkeit || ''} ${input.beschreibung || ''}`;
  const keywordHit = containsKeyword(freitext) || containsKeyword(kategorie);

  const isBaumaschinenKategorie = /baumaschin|mischmeister|spezialfahrzeug/i.test(kategorie);
  const isWoche = /wochenpreis/i.test(kategorie);
  const isFern = !!input.longDistance && !isBaumaschinenKategorie && !isWoche;

  // 1. Keine oder unklare Angabe zur Maschinenbedienung -> manuelle Prüfung
  if (mb === '' || mb === 'unklar') {
    return {
      ...PRUEFUNG,
      reason:
        'Die Angabe zur Bedienung einer fest aufgebauten Maschine oder Anlage fehlt oder ist unklar. Die Tarifzuordnung wird vor der verbindlichen Bestätigung geprüft.',
    };
  }

  // 2. Maschinen-/Anlagenbedienung ausdrücklich bestätigt -> Baumaschinentarif
  if (mb === 'ja') {
    return {
      tarif: 'baumaschine',
      label: BAUMASCHINE_LABEL,
      netto: 489,
      einheit: 'je Einsatztag bis 8 Stunden',
      mehrstunde: 60,
      needsReview: false,
      reason: isBaumaschinenKategorie
        ? 'Bedienung einer fest aufgebauten Maschine oder Anlage ist wesentlicher Bestandteil des Einsatzes.'
        : 'Bedienung einer fest aufgebauten Maschine oder Anlage wurde bestätigt; damit gilt der Tarif Baumaschinenführer / Mischmeister unabhängig von der zunächst gewählten Kategorie.',
    };
  }

  // 3. mb === 'nein'
  if (isBaumaschinenKategorie) {
    // Widerspruch: Kategorie Spezialfahrzeug, aber keine Maschinenbedienung
    return {
      ...PRUEFUNG,
      reason:
        'Es wurde die Kategorie Baumaschinenführer / Mischmeister / Spezialfahrzeuge gewählt, jedoch keine Maschinen- oder Anlagenbedienung angegeben. Die Tarifzuordnung wird geprüft.',
    };
  }

  if (keywordHit) {
    // Freitext deutet auf Spezialfahrzeug hin, Angabe sagt "nein" -> prüfen
    return {
      ...PRUEFUNG,
      reason:
        'Die Einsatzbeschreibung deutet auf ein Spezialfahrzeug mit fest aufgebauter Maschine oder Anlage hin, es wurde jedoch keine Maschinenbedienung angegeben. Die Tarifzuordnung wird geprüft.',
    };
  }

  if (isWoche) {
    return {
      tarif: 'lkw_ce_woche',
      label: 'LKW-Fahrer CE – Wochenpreis',
      netto: 1645,
      einheit: 'je Woche (5 Einsatztage, bis 9 Stunden je Einsatztag)',
      mehrstunde: null,
      needsReview: false,
      reason: 'Reiner CE-Transport ohne maßgebliche Maschinenbedienung.',
    };
  }

  if (isFern) {
    return {
      tarif: 'fernfahrer',
      label: 'Fernfahrer-Pauschale',
      netto: 450,
      einheit: 'je Fernverkehrs-Einsatztag',
      mehrstunde: null,
      needsReview: false,
      reason: 'Reiner CE-Fernverkehr ohne maßgebliche Maschinenbedienung.',
    };
  }

  return {
    tarif: 'lkw_ce',
    label: 'LKW-Fahrer CE',
    netto: 349,
    einheit: 'je Einsatztag bis 9 Stunden',
    mehrstunde: null,
    needsReview: false,
    reason: 'Reiner CE-Transport ohne maßgebliche Maschinenbedienung.',
  };
}

export const MASCHINENBEDIENUNG_LABELS: Record<Exclude<Maschinenbedienung, ''>, string> = {
  ja: 'Ja – Bedienung einer fest aufgebauten Maschine oder Anlage ist wesentlicher Teil des Einsatzes',
  nein: 'Nein – reiner Transport / Fahren',
  unklar: 'Unklar – muss geprüft werden',
};

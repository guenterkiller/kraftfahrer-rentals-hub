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
 * Wichtig: Maßgeblich ist ausschließlich die vom Besteller gewählte Tarifkarte.
 * Freitext-Stichwörter überschreiben diese Auswahl NIE. Sie können lediglich
 * einen internen Kontrollhinweis auslösen. Preise werden nie individuell
 * festgelegt.
 */

export type Maschinenbedienung = 'ja' | 'nein' | 'unklar' | '';

export type TarifKey =
  | 'lkw_ce'
  | 'lkw_ce_woche'
  | 'fernfahrer'
  | 'baumaschine'
  | 'ueberfuehrung'
  | 'pruefung';

/** Feste Leistungsbezeichnung und gespeicherte Tarifart für LKW-Überführungen. */
export const UEBERFUEHRUNG_LABEL = 'LKW-Überführung – individuelles Angebot';
export const UEBERFUEHRUNG_TARIF_TYPE = 'Überführung';
export const UEBERFUEHRUNG_KOSTEN_HINWEIS = 'Kosten nach Fahrzeug, Strecke und Aufwand – individuelles Angebot.';

/** Erkennt eine Überführungsanfrage (explizites Kennzeichen oder feste Leistungsbezeichnung). */
export const isUeberfuehrung = (leistung?: string, kategorie?: string): boolean =>
  (leistung || '').trim().toLowerCase() === 'ueberfuehrung' ||
  /überführung|ueberfuehrung/i.test(kategorie || '');

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
  /** Interner Kontrollhinweis bei möglichem Widerspruch (nicht für Besteller-Rückfragen) */
  internalConflict?: boolean;
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

export const BAUMASCHINE_LABEL = 'Baumaschinenführer/Mischmeister/Spezialfahrzeuge';

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
  /** Leistungsart; 'ueberfuehrung' hat Vorrang vor allen Standardtarifen */
  leistung?: string;
}

const ZUORDNUNG_HINWEIS =
  'Die veröffentlichten Preise und Konditionen sind eindeutig. Aufgrund unvollständiger Angaben zur konkreten Tätigkeit konnte der passende Tarif noch nicht automatisch zugeordnet werden. Die Zuordnung erfolgt vor der verbindlichen Einsatzbestätigung.';

export const TARIF_ZUORDNUNG_HINWEIS = ZUORDNUNG_HINWEIS;

const PRUEFUNG: Omit<TarifResult, 'reason'> = {
  tarif: 'pruefung',
  label: 'Passenden Tarif manuell zuordnen',
  netto: null,
  einheit: 'Der zutreffende veröffentlichte Tagessatz wird nach Prüfung der Tätigkeit zugeordnet',
  mehrstunde: null,
  needsReview: true,
};

const BAUMASCHINE_TARIF: Omit<TarifResult, 'reason'> = {
  tarif: 'baumaschine',
  label: BAUMASCHINE_LABEL,
  netto: 489,
  einheit: 'je Einsatztag bis 8 Stunden',
  mehrstunde: 60,
  needsReview: false,
};

export function resolveTarif(input: TarifInput): TarifResult {
  const kategorie = (input.kategorie || '').trim();

  // 0. LKW-Überführung: immer individuelles Angebot, Vorrang vor allen Standardtarifen.
  //    Kein Tagessatz, kein Wochenpreis, keine Mehrstunde, keine Einheit – auch nicht bei Fernverkehr.
  if (isUeberfuehrung(input.leistung, kategorie)) {
    return {
      tarif: 'ueberfuehrung',
      label: UEBERFUEHRUNG_LABEL,
      netto: null,
      einheit: '',
      mehrstunde: null,
      needsReview: false,
      reason: 'LKW-Überführung auf eigener Achse – Kosten nach Fahrzeug, Strecke und Aufwand, individuelles Angebot. Satz wird im Admin festgelegt.',
    };
  }
  const freitext = `${input.taetigkeit || ''} ${input.beschreibung || ''}`;
  const keywordHit = containsKeyword(freitext);

  const isBaumaschinenKategorie = /baumaschin|mischmeister|spezialfahrzeug/i.test(kategorie);
  const isWoche = /wochenpreis/i.test(kategorie);
  const isFern = !!input.longDistance && !isBaumaschinenKategorie && !isWoche;

  // 1. Der Besteller hat den Tarif Baumaschinenführer / Mischmeister / Spezialfahrzeuge gewählt.
  if (isBaumaschinenKategorie) {
    return {
      ...BAUMASCHINE_TARIF,
      reason:
        'Vom Besteller gewählter veröffentlichter Tarif: Baumaschinenführer/Mischmeister/Spezialfahrzeuge.',
    };
  }

  // 2. Keine Tarifkarte gewählt -> Zuordnung zu einem veröffentlichten Tarif erforderlich
  if (!kategorie) {
    return { ...PRUEFUNG, reason: ZUORDNUNG_HINWEIS };
  }

  // Möglicher Widerspruch: Beschreibung deutet auf Anlagenbedienung, gewählt wurde CE.
  const conflictNote = keywordHit
    ? ' Interner Kontrollhinweis: Die Tätigkeitsbeschreibung nennt ein Spezialfahrzeug bzw. eine technische Anlage – Tarifauswahl des Bestellers bleibt unverändert gespeichert.'
    : '';

  if (isWoche) {
    return {
      tarif: 'lkw_ce_woche',
      label: 'LKW-Fahrer CE – Wochenpreis',
      netto: 1645,
      einheit: 'je Woche (5 Einsatztage, bis 9 Stunden je Einsatztag)',
      mehrstunde: null,
      needsReview: false,
      internalConflict: keywordHit,
      reason: 'Vom Besteller gewählter veröffentlichter Tarif: LKW-Fahrer CE – Wochenpreis.' + conflictNote,
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
      internalConflict: keywordHit,
      reason: 'Vom Besteller gewählter veröffentlichter Tarif: Fernfahrer-Pauschale.' + conflictNote,
    };
  }

  return {
    tarif: 'lkw_ce',
    label: 'LKW-Fahrer CE',
    netto: 349,
    einheit: 'je Einsatztag bis 9 Stunden',
    mehrstunde: 45,
    needsReview: false,
    internalConflict: keywordHit,
    reason: 'Vom Besteller gewählter veröffentlichter Tarif: LKW-Fahrer CE.' + conflictNote,
  };
}

export const MASCHINENBEDIENUNG_LABELS: Record<Exclude<Maschinenbedienung, ''>, string> = {
  ja: 'Ja – Bedienung einer fest aufgebauten Maschine oder Anlage ist wesentlicher Teil des Einsatzes',
  nein: 'Nein – reiner Transport / Fahren',
  unklar: 'Unklar – Tarifzuordnung erforderlich',
};

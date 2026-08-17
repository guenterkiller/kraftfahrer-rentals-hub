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
 * zu einer manuellen Zuordnung der Tarifkategorie, wenn die Tätigkeit nicht
 * eindeutig beschrieben ist. Preise werden nie individuell festgelegt.
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
  const mb = input.maschinenbedienung || '';
  const freitext = `${input.taetigkeit || ''} ${input.beschreibung || ''}`;
  // Nur die beschriebene Tätigkeit entscheidet – die reine Kategoriewahl genügt nicht.
  const keywordHit = containsKeyword(freitext);

  const isBaumaschinenKategorie = /baumaschin|mischmeister|spezialfahrzeug/i.test(kategorie);
  const isWoche = /wochenpreis/i.test(kategorie);
  const isFern = !!input.longDistance && !isBaumaschinenKategorie && !isWoche;

  // 1. Tätigkeit beschreibt eindeutig die Bedienung einer Pumpe, Saug-, Misch-,
  //    Förder- oder anderen technischen Anlage -> veröffentlichter Tarif
  //    Baumaschinenführer / Mischmeister gilt automatisch.
  if (keywordHit) {
    return {
      ...BAUMASCHINE_TARIF,
      reason:
        'Die beschriebene Tätigkeit umfasst die Bedienung einer Pumpe, Saug-, Misch-, Förder- oder anderen technischen Anlage. Damit gilt der veröffentlichte Tarif Baumaschinenführer / Mischmeister.',
    };
  }

  // 2. Maschinen-/Anlagenbedienung ausdrücklich bestätigt -> gleicher Tarif
  if (mb === 'ja') {
    return {
      ...BAUMASCHINE_TARIF,
      reason: isBaumaschinenKategorie
        ? 'Bedienung einer fest aufgebauten Maschine oder Anlage ist wesentlicher Bestandteil des Einsatzes. Es gilt der veröffentlichte Tarif Baumaschinenführer / Mischmeister.'
        : 'Bedienung einer fest aufgebauten Maschine oder Anlage wurde bestätigt; damit gilt der veröffentlichte Tarif Baumaschinenführer / Mischmeister unabhängig von der zunächst gewählten Kategorie.',
    };
  }

  // 3. Tätigkeit nicht eindeutig beschrieben -> Tarifkategorie wird manuell zugeordnet
  if (mb === '' || mb === 'unklar') {
    return { ...PRUEFUNG, reason: ZUORDNUNG_HINWEIS };
  }

  // 4. Kategorie Spezialfahrzeug gewählt, Tätigkeit dazu aber nicht eindeutig
  if (isBaumaschinenKategorie) {
    return { ...PRUEFUNG, reason: ZUORDNUNG_HINWEIS };
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
  unklar: 'Unklar – Tarifzuordnung erforderlich',
};

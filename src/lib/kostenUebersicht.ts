/**
 * Unverbindliche Vorkalkulation im Buchungsformular und in der Kundenbestätigung.
 *
 * Reine Rechenlogik auf Grundlage der veröffentlichten Tarife (349/1.645/450/489 € netto)
 * und Zuschläge (Samstag 25 %, Sonntag/Feiertag 50 %). Keine neuen Preise, keine Schätzwerte.
 * Fahrtkosten und Unterkunftskosten werden NICHT berechnet, sondern als offen gekennzeichnet.
 *
 * Diese Datei muss mit supabase/functions/_shared/kosten-uebersicht.ts inhaltlich
 * übereinstimmen (Gleichheit per Test geprüft).
 */
import { listSurchargeDays, germanHolidays } from './germanHolidays';

export type UnterkunftOption = 'gestellt' | 'fahrer_organisiert' | 'keine';

/** Verbindliche Optionsbeschriftungen (Formular, Kundenbestätigung, Admin). */
export const UNTERKUNFT_OPTIONEN: Record<UnterkunftOption, string> = {
  gestellt: 'Unterkunft wird vom Auftraggeber gestellt und bezahlt.',
  fahrer_organisiert:
    'Unterkunft wird vom Fahrer organisiert. Der Auftraggeber übernimmt die Kosten bis zu einer vorher vereinbarten Obergrenze.',
  keine: 'Keine Übernachtung erforderlich.',
};

export const UNTERKUNFT_OPTIONSWERTE: readonly UnterkunftOption[] = ['gestellt', 'fahrer_organisiert', 'keine'];

/** Gesetzlicher Umsatzsteuersatz. */
export const UST_SATZ = 0.19;

/** Kennzeichnung der Vorkalkulation (Formular und E-Mail wortgleich). */
export const VORKALKULATION_TITEL = 'Unverbindliche Vorkalkulation';
export const VORKALKULATION_HINWEIS =
  'Diese Vorkalkulation basiert auf den veröffentlichten Tarifen und dem gewählten Einsatzzeitraum. Sie ist unverbindlich; abgerechnet wird nach tatsächlich geleisteten Einsatztagen, angefangenen Mehrstunden, berechnungsfähigen Fahrtkilometern und zutreffenden Zuschlägen.';
export const OFFENE_KOSTEN_HINWEIS =
  'Offene Zusatzkosten (An- und Abfahrt sowie gegebenenfalls Unterkunft) werden Ihnen vor verbindlicher Auftragserteilung mitgeteilt und bedürfen Ihrer Zustimmung.';
export const FAHRTKOSTEN_OFFEN =
  'An- und Abfahrt: abhängig vom Standort des eingesetzten Fahrers – die voraussichtlichen Fahrtkosten werden vor verbindlicher Auftragserteilung mitgeteilt (erste 25 km je einfacher Fahrt frei, danach 0,40 € netto je tatsächlich gefahrenem Kilometer).';

export interface KostenPosition {
  label: string;
  betrag: number;
}

export interface KostenUebersicht {
  positionen: KostenPosition[];
  /** Summe netto in EUR */
  netto: number;
  /** Umsatzsteuer in EUR */
  ust: number;
  /** Bruttosumme in EUR */
  brutto: number;
}

const TAGESSATZ: Record<string, number> = {
  lkw_ce: 349,
  fernfahrer: 450,
  baumaschine: 489,
};

const WOCHENPREIS = 1645;
const WOCHENPREIS_RESTTAG = 329; // 1.645 / 5
const WOCHENPREIS_ZUSCHLAG_BASIS = 349; // geltender Tagessatz für Wochenend-/Feiertagseinsätze

const TARIF_NAME: Record<string, string> = {
  lkw_ce: 'LKW-Fahrer CE',
  lkw_ce_woche: 'LKW-Fahrer CE – Wochenpreis',
  fernfahrer: 'Fernfahrer-Pauschale',
  baumaschine: 'Baumaschinenführer/Mischmeister/Spezialfahrzeuge',
};

const round2 = (v: number) => Math.round(v * 100) / 100;

export const formatEuro = (v: number): string =>
  `${v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

/**
 * Berechnet die Vorkalkulation für einen Einsatzzeitraum (ISO-Daten, inklusiv).
 * Liefert null bei Überführung, manueller Tarifprüfung oder ungültigem Zeitraum.
 */
export const berechneKostenUebersicht = (
  tarifKey: string,
  startISO: string,
  endISO: string,
): KostenUebersicht | null => {
  if (!startISO) return null;
  const start = new Date(`${startISO}T00:00:00Z`);
  const end = new Date(`${(endISO || startISO)}T00:00:00Z`);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;

  const isWoche = tarifKey === 'lkw_ce_woche';
  const tagessatz = TAGESSATZ[tarifKey];
  if (!isWoche && !tagessatz) return null;

  const surchargeDays = listSurchargeDays(startISO, endISO || startISO);
  const surchargeByDate = new Map(surchargeDays.map((d) => [d.date, d]));

  const positionen: KostenPosition[] = [];
  const holidayCache: Record<number, Record<string, string>> = {};

  if (isWoche) {
    // Mo–Fr ohne Feiertag: volle Wochen zu 1.645 €, Resttage zu 329 €.
    // Sa/So/Feiertage: separat zum geltenden Tagessatz (349 €) zzgl. Zuschlag.
    let werktage = 0;
    const sonderPositionen: KostenPosition[] = [];
    for (let d = start; d <= end; d = new Date(d.getTime() + 86400000)) {
      const y = d.getUTCFullYear();
      holidayCache[y] = holidayCache[y] || germanHolidays(y);
      const dateISO = isoOf(d);
      const surcharge = surchargeByDate.get(dateISO);
      if (surcharge) {
        sonderPositionen.push({
          label: `${surcharge.label}: ${formatEuro(WOCHENPREIS_ZUSCHLAG_BASIS)} + ${surcharge.percent} % Zuschlag`,
          betrag: round2(WOCHENPREIS_ZUSCHLAG_BASIS * (1 + surcharge.percent / 100)),
        });
      } else {
        werktage += 1;
      }
    }
    const volleWochen = Math.floor(werktage / 5);
    const resttage = werktage % 5;
    if (volleWochen > 0) {
      positionen.push({
        label: `${TARIF_NAME.lkw_ce_woche}: ${volleWochen} ${volleWochen === 1 ? 'Woche' : 'Wochen'} (Mo–Fr) × ${formatEuro(WOCHENPREIS)}`,
        betrag: volleWochen * WOCHENPREIS,
      });
    }
    if (resttage > 0) {
      positionen.push({
        label: `${resttage} ${resttage === 1 ? 'Einsatztag' : 'Einsatztage'} (Mo–Fr) × ${formatEuro(WOCHENPREIS_RESTTAG)}`,
        betrag: resttage * WOCHENPREIS_RESTTAG,
      });
    }
    positionen.push(...sonderPositionen);
  } else {
    // Jeder Kalendertag ist ein Einsatztag; Sa/So/Feiertage mit Zuschlag.
    let normalTage = 0;
    const sonderPositionen: KostenPosition[] = [];
    for (let d = start; d <= end; d = new Date(d.getTime() + 86400000)) {
      const dateISO = isoOf(d);
      const surcharge = surchargeByDate.get(dateISO);
      if (surcharge) {
        sonderPositionen.push({
          label: `${surcharge.label}: ${formatEuro(tagessatz)} + ${surcharge.percent} % Zuschlag`,
          betrag: round2(tagessatz * (1 + surcharge.percent / 100)),
        });
      } else {
        normalTage += 1;
      }
    }
    if (normalTage > 0) {
      positionen.push({
        label: `${TARIF_NAME[tarifKey]}: ${normalTage} ${normalTage === 1 ? 'Einsatztag' : 'Einsatztage'} × ${formatEuro(tagessatz)}`,
        betrag: normalTage * tagessatz,
      });
    }
    positionen.push(...sonderPositionen);
  }

  if (positionen.length === 0) return null;

  const netto = round2(positionen.reduce((s, p) => s + p.betrag, 0));
  const ust = round2(netto * UST_SATZ);
  return { positionen, netto, ust, brutto: round2(netto + ust) };
};

/** Offene (nicht berechenbare) Positionen je nach Unterkunftsauswahl. */
export const offenePositionen = (
  unterkunftOption: UnterkunftOption | '',
  obergrenze: number | null,
): string[] => {
  const offen: string[] = [FAHRTKOSTEN_OFFEN];
  if (unterkunftOption === 'fahrer_organisiert') {
    offen.push(
      `Unterkunftskosten: bis zur vereinbarten Obergrenze von ${formatEuro(obergrenze ?? 0)} netto – die tatsächlichen Kosten werden vor verbindlicher Auftragserteilung mitgeteilt.`,
    );
  }
  return offen;
};

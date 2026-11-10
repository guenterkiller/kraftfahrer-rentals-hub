import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  berechneKostenUebersicht, fernverkehrMitWochenende,
  FERNVERKEHR_OHNE_GESAMTPREIS, FERNVERKEHR_WERKTAGE_HINWEIS,
} from '../kostenUebersicht';

const mail = readFileSync('supabase/functions/_shared/email-templates/customer-booking-confirmation.tsx', 'utf8');

describe('Fernverkehr-Vorkalkulation im Formular wie Kundenmail', () => {
  it('Zeitraum mit Samstag/Sonntag: kein Gesamtbetrag (Ruhetage offen)', () => {
    expect(fernverkehrMitWochenende('2026-11-16', '2026-11-23')).toBe(true);
    expect(fernverkehrMitWochenende('2026-11-21', '2026-11-21')).toBe(true);
  });
  it('Mo–Fr ohne Wochenende: Gesamtbetrag bleibt 2.121,06 € (Wochenpreis unverändert)', () => {
    expect(fernverkehrMitWochenende('2026-11-16', '2026-11-20')).toBe(false);
    expect(berechneKostenUebersicht('fernfahrer', '2026-11-16', '2026-11-20')?.netto).toBe(2121.06);
    expect(berechneKostenUebersicht('fernfahrer', '2026-11-16', '2026-11-16')?.netto).toBe(450);
  });
  it('Hinweistexte sind wortgleich mit der Kunden-Eingangsbestätigung', () => {
    expect(mail).toContain(`'${FERNVERKEHR_OHNE_GESAMTPREIS}'`);
    expect(mail).toContain(`'${FERNVERKEHR_WERKTAGE_HINWEIS}'`);
  });
  it('CE-Woche bleibt 1.645 € für Mo–Fr', () => {
    expect(berechneKostenUebersicht('lkw_ce_woche', '2026-11-16', '2026-11-20')?.netto).toBe(1645);
  });
});

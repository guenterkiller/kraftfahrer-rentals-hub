import { describe, it, expect } from 'vitest';
import { OVERNIGHT_COSTS } from '../overnightCosts';
import { OVERNIGHT_COSTS as EMAIL_COSTS } from '../../../supabase/functions/_shared/overnight-costs';

describe('Übernachtungskosten', () => {
  it('verwendet identische freigegebene Texte auf Webseite und in E-Mails', () => {
    expect(OVERNIGHT_COSTS).toEqual(EMAIL_COSTS);
  });
});
import { TRAVEL_COSTS, travelCostPerTrip } from '../overnightCosts';
import { TRAVEL_COSTS as EMAIL_TRAVEL } from '../../../supabase/functions/_shared/overnight-costs';
describe('An- und Abfahrtskosten', () => {
  it('Webseite und E-Mail identisch', () => expect(TRAVEL_COSTS).toEqual(EMAIL_TRAVEL));
  it('Beispiel 150 km stimmt', () => {
    expect(travelCostPerTrip(150)).toBeCloseTo(50);
    expect(travelCostPerTrip(150) * 2).toBeCloseTo(100);
    expect(travelCostPerTrip(150) * 2 * 3).toBeCloseTo(300);
    expect(travelCostPerTrip(20)).toBe(0);
  });
});

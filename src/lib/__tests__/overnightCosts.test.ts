import { describe, it, expect } from 'vitest';
import { OVERNIGHT_COSTS } from '../overnightCosts';
import { OVERNIGHT_COSTS as EMAIL_COSTS } from '../../../supabase/functions/_shared/overnight-costs';

describe('Übernachtungskosten', () => {
  it('verwendet identische freigegebene Texte auf Webseite und in E-Mails', () => {
    expect(OVERNIGHT_COSTS).toEqual(EMAIL_COSTS);
  });
});
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { TARIF_TEXTE } from '../tarifTexte';
import { berechneKostenUebersicht, offenePositionen } from '../kostenUebersicht';

const VERBOTEN = /provision|vermittlungsanteil|fahrervergütung|\b2[05] ?%/i;

describe('Fahrerprovision ist nie kundenöffentlich', () => {
  it('Eventseite, Startseite und Buchungsformular nennen keine Provision', () => {
    for (const f of ['src/pages/ShowtruckEventfahrer.tsx', 'src/pages/Index.tsx', 'src/components/SimpleBookingForm.tsx', 'src/pages/PreiseUndAblauf.tsx']) {
      expect(readFileSync(f, 'utf8')).not.toMatch(/provision|vermittlungsanteil|commission/i);
    }
  });
  it('Tariftexte und Kostenvorschau der Eventpauschale ohne Provision', () => {
    expect(JSON.stringify(TARIF_TEXTE)).not.toMatch(VERBOTEN);
    const k = berechneKostenUebersicht('event', '2026-11-06', '2026-11-08');
    expect(k?.netto).toBe(1467);
    expect(JSON.stringify([k, offenePositionen('gestellt', null)])).not.toMatch(VERBOTEN);
  });
});

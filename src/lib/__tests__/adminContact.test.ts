import { describe, expect, it } from 'vitest';
import { loadAdminContact } from '../adminContact';
describe('Getrennte Firma und Ansprechpartner', () => {
  it('lädt Firma unabhängig vom Ansprechpartner', () => {
    expect(loadAdminContact({ company: 'TEST GmbH', customer_name: 'TEST Kontakt' })).toEqual({ company: 'TEST GmbH', contact: 'TEST Kontakt' });
  });
  it('erfindet bei fehlender Firma keine Firma aus dem Ansprechpartner', () => {
    expect(loadAdminContact({ company: null, customer_name: 'TEST Kontakt' })).toEqual({ company: '', contact: 'TEST Kontakt' });
  });
});
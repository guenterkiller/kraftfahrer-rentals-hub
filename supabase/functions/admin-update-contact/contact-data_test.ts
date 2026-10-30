import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { contactUpdate } from './contact-data.ts';
Deno.test('Kontakt-Speicherung überschreibt Firma nicht durch Ansprechpartner', () => {
  const result = contactUpdate({ cName: 'TEST GmbH', contact: 'TEST Kontakt', street: 'Testweg', house: '1', postal: '00000', city: 'Teststadt', phone: '000', contactEmail: 'test@example.invalid' });
  assertEquals(result.company, 'TEST GmbH');
  assertEquals(result.customer_name, 'TEST Kontakt');
});
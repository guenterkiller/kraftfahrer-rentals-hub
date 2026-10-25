import { assertEquals } from 'jsr:@std/assert@1';
import { validateCustomerConfirmation, CUSTOMER_TERMS_VERSION, CUSTOMER_TERMS_TEXT } from '../_shared/customer-confirmation.ts';

Deno.test('Neue Bestätigung verwendet serverseitigen Text, Altformular ohne Nachweis', () => {
  const result = validateCustomerConfirmation({ bedingungen_akzeptiert: true, bedingungen_fassung: CUSTOMER_TERMS_VERSION });
  assertEquals(result.ok, true);
  if (!result.ok) throw new Error(result.error);
  assertEquals(result.evidence.customer_terms_text, CUSTOMER_TERMS_TEXT);
  assertEquals(result.evidence.customer_confirmation_at, null);
  assertEquals(validateCustomerConfirmation({ bedingungen_akzeptiert: true }).ok, false);
  assertEquals(validateCustomerConfirmation({ bedingungen_akzeptiert: false, datenschutz: true }).ok, false);
  const legacy = validateCustomerConfirmation({ datenschutz: true });
  if (!legacy.ok) throw new Error(legacy.error);
  assertEquals(legacy.evidence.customer_confirmation_given, null);
});
/**
 * Annahmeseite: zeigt aus der gespeicherten Angebotskopie ausschließlich den
 * Nettobetrag nach Provision. Honorar vor Provision, Satz, Provision und
 * Kunden-/Tarifpreise werden ausgeblendet. Der Betrag wird nie neu berechnet.
 */
export const NET_LABEL =
  "Ihre Nettovergütung für diesen Auftrag (nach Abzug der Vermittlungsprovision)";

const HIDDEN =
  /^(Fahrleistung:|Nettoauftragswert|Gesamtwert Fahrerdienstleistung|Agenturprovision|Vermittlungsanteil|Vermittlungsprovision|Fahrerhonorar netto vor Provision|Vereinbarter Satz netto|Mehrstundenpreis netto)/;
const NET_SOURCE =
  /^(Verbleibende Nettovergütung|Verbleibende Fahrervergütung netto|Nettovergütung des selbstständigen Fahrers)/;
const EURO_AMOUNT = /^-?[\d.]+,\d{2}\s?€$/;

export function acceptancePageLines(
  lines: [string, string][],
  bindingAllowed: boolean,
): [string, string][] {
  const out: [string, string][] = [];
  for (const [k, v] of lines) {
    if (HIDDEN.test(k)) continue;
    if (NET_SOURCE.test(k)) {
      const value = v.trim().replace(/\u00a0/g, " ");
      if (bindingAllowed && EURO_AMOUNT.test(value)) out.push([NET_LABEL, value]);
      continue;
    }
    out.push([k, v]);
  }
  return out;
}

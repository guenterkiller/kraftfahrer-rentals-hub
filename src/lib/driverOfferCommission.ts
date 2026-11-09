// Spiegel von commissionPctForTarif in supabase/functions/_shared/driver-offer-remuneration.ts (Gleichheit getestet).
/** Provisionssatz nach gespeicherter Tarifart; unbekannt/„Prüfung nötig“ → null (Admin wählt). */
export function commissionPctForTarif(tarifType: unknown): 20 | 25 | null {
  switch (String(tarifType ?? '')) {
    case 'lkw_ce': case 'lkw_ce_woche': case 'fernfahrer': return 20;
    case 'baumaschine': case 'event': case 'ueberfuehrung': case 'Überführung': return 25;
    default: return null;
  }
}

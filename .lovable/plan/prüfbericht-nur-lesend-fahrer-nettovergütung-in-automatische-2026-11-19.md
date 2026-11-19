# Prüfbericht (nur lesend): Fahrer-Nettovergütung in automatischen Erstangeboten

Keine Änderung vorgesehen. Dieser Plan enthält nur den Befund; „Approve“ löst nichts aus.

## Befund Git-Code
- Rücksetz-Commit `16466c39` stellt Stand `ce4e0c7a` (17.11.) wieder her. Unterschied zu `ce4e0c7a`: nur `package.json` / `bun.lock`. Unter `supabase/functions` ist nichts verändert.
- Die Vergütungsanzeige ist also im Code vollständig vorhanden.

## Die drei Mail- bzw. Seitenpfade
1. **Erste Angebotsmail (unverbindlich):** `_shared/driver-job-offers.ts`. `interestRemuneration()` berechnet den Betrag, `renderDriverCompensationBox()` zeigt ihn an, Anrede „Hallo Vorname Nachname,“. Ohne belegbare Kalkulation wird nichts versendet, es entsteht ein Sperreintrag `driver_interest_offer_blocked`. Aufgerufen wird das von:
   - `driver-contract` bei der Vertragsannahme,
   - `approve-driver-and-send-jobs` beim Freischalten,
   - `admin-approve-job` bei „Freigeben & Senden“ / „Erneut senden“.
   Für Völklingen ergibt das 7.106,40 € netto: 8.883,00 € gespeicherte Kalkulation − 20 %. Das gilt für den ganzen gespeicherten Zeitraum 17.11.–23.12.2026, also 5 Wochen + 2 Tage ohne Wochenende.
2. **Interessensbestätigung (Antwortseite):** `respond-invite/index.ts` mit `_shared/interest-offer-preview.ts` (`buildInterestOfferPreview`). Gleicher Betrag, ohne Kundenname und ohne Kundenpreis. Die Seite selbst ist `src/pages/FahrerAntwortBestaetigen.tsx`.
3. **Verbindliche Zuweisungsmail:** `send-driver-confirmation/index.ts`. Zeigt die Box aus dem gespeicherten v3-Angebot. Die zugehörige Annahme läuft über `respond-invite/binding.ts`.
- **Alte Sammel-Rundmails ohne Honorar:** `broadcast-job-to-drivers` und `broadcast-job-invites` gibt es weiterhin. Fahrer mit angenommenem Vertrag und Testfahrer sind dort ausgeschlossen.

## Live-Stand (Supabase Functions)
- Ein Rücksetzen in Lovable ändert nur den Code. Bereits eingespielte Funktionen werden dadurch nicht zurückgenommen.
- Zuletzt eingespielt am 17.11.:
  - `driver-contract`, `approve-driver-and-send-jobs` und `admin-approve-job` mit Stand `6f9ca8f8`,
  - `respond-invite` mit Stand `ce4e0c7a`.
- Der Rücksetzpunkt liegt nach diesen Ständen. Live und Code sollten deshalb übereinstimmen.
- **Unsicherheit:** Den tatsächlich laufenden Quelltext habe ich in dieser Prüfung nicht erneut ausgelesen. Ob seit dem 17.11. automatisch erneut eingespielt wurde, ist nicht geprüft. Inhaltlich wäre das aber derselbe Code.

## Weitere Hinweise
- Der Betrag hängt an der gespeicherten Kalkulation des Auftrags. Wird der Zeitraum geändert, ändert sich auch der angezeigte Betrag.
- Die Webseite bei IONOS (Antwortseite) zeigt den neuen Stand nur nach einem neuen Upload.

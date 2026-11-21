# Annahmebestätigung an Fahrer: Befund und minimaler Änderungsvorschlag

## Befund (nur gelesen)

**Wer sendet die Mail:** Function `respond-invite`, Datei `supabase/functions/respond-invite/binding.ts`.
- Versand ab Zeile 185–215 nach dem Speichern der verbindlichen Annahme (Betreff „Annahmebestätigung – verbindliche Auftragsannahme – …“, PDF im Anhang, Kopie an die Agentur, Protokoll `driver_binding_acceptance`).
- Inhalt erzeugt von `confirmationHtml()` (Zeile 224–233).

**HTML oder Text:** Es wird **nur HTML** übergeben (`html`), kein `text`-Teil. Es ist also kein reiner Text, aber nur ein schlichtes `<div>` mit Überschrift, Absätzen und Fingerabdruck.

**Gemeinsamer Layout-Renderer vorhanden:** `wrapDriverEmailHtml()` in `supabase/functions/_shared/email-templates/driver-html-shell.ts` (dunkelblauer Kopf, rote Linie, Fußzeile). Er wird schon benutzt von `send-driver-confirmation` (VERBINDLICHES AUFTRAGSANGEBOT), `send-driver-job-notification`, `send-customer-assignment-notice`, `admin-cancel-job`, `send-driver-newsletter`.

**Warum sie anders aussieht:** `confirmationHtml()` ruft `wrapDriverEmailHtml()` **nicht** auf und nutzt auch nicht die Vergütungsbox `renderDriverCompensationBox()`, sondern nur die einfache Zeilenliste `renderShortOffer()`.

**Vergütungslabel:** Über `shortOfferLines()` erscheint der Betrag als „Ihre Nettovergütung für diesen Auftrag: 5.790,40 €“ (`NET_LABEL`, `_shared/short-offer.ts` Z. 8). Das klingt nach garantiertem Gesamtbetrag. **„voraussichtlich“, „Berechnungsgrundlage … geplante Einsatztage“ und der „Hinweis zur Vergütung“ fehlen** in dieser Mail. Das PDF (`_shared/binding-acceptance-pdf.ts`) ist davon getrennt und wurde nicht geändert.

## Vorschlag: minimaler Änderungsumfang (erst nach Freigabe)

Nur eine Produktivdatei: `supabase/functions/respond-invite/binding.ts`, Funktion `confirmationHtml()`.
1. Den bestehenden Inhalt in `wrapDriverEmailHtml()` einbetten (gleicher Kopf und Fuß wie im Angebot, keine Abmeldezeile).
2. Statt der einfachen Netto-Zeile die vorhandene `renderDriverCompensationBox(jobLines, true, true)` nutzen. Dann erscheinen derselbe Betrag, „voraussichtliches Nettohonorar für den geplanten Gesamteinsatz“, „Berechnungsgrundlage: 22 geplante Einsatztage“ und der bereits freigegebene „Hinweis zur Vergütung“ wörtlich wie in der Angebotsmail.
3. Die Netto-Zeile aus der Einsatzdatenliste in dieser Mail weglassen, damit der Betrag nicht doppelt und nicht ohne Prognose-Hinweis steht.

Unverändert: Annahme-Speicherung, Fingerabdruck, PDF, Empfänger, Betreff, Agentur-Kopie, Beträge, alle anderen Mails. `NET_LABEL` bleibt unverändert, weil es auch anderswo genutzt wird.

**Tests:** Vorhandenen Test in `_shared/operational_mails_test.tsx` (Z. 173) erweitern: Kopf/Fuß vorhanden, 5.790,40 € und 263,20 € unverändert, Prognose-Kennzeichnung und Hinweis vorhanden, Fingerabdruck und PDF-Hinweis bleiben. Vorschau mit TEST-Daten.

**Aktivierung später:** nur `respond-invite` bereitstellen, nach Ihrer Freigabe.

Bis zur Freigabe wurde nichts geändert, versendet oder bereitgestellt.

# Fahrerregistrierung – nicht aktivierter Serverentwurf

Dieser Ordner ist vom produktiven Versand getrennt. `fahrerwerden.ts` wird ausschließlich mit gemockten Abhängigkeiten getestet, registriert keinen Server und darf ohne ausdrückliche Betreiberfreigabe nicht eingespielt werden.

## Notwendige spätere Aktivierung

Das bisherige `supabase/functions/fahrerwerden/index.ts` ignoriert Verfügbarkeit. Die neue Webseite übermittelt `availability`: `sofort`, `absprache` oder `ab_datum:YYYY-MM-DD`; ohne Auswahl einen leeren Wert. Der Entwurf validiert diese Werte in allen drei bestehenden Eingabewegen vor Dateiupload, Speicherung und Versand und speichert sie im bereits vorhandenen nullable Textfeld `fahrer_profile.verfuegbarkeit`. Keine Migration erforderlich. Bei Aktivierung muss `availability.ts` in den Funktionsordner übernommen werden; die bestehenden Produktionsimporte und `serve(handler)` bleiben erhalten. Nur Parser, Validierung und das eine Insertfeld sind funktionale Änderungen; sichere Adresszugriffe ersetzen im Entwurf bestehende Non-null-Assertions.

**Bis zur gesonderten Aktivierung speichert der produktive Server die neue Verfügbarkeit weiterhin nicht.** Deshalb neue Webseite und Serverkorrektur später koordiniert aktivieren, nicht allein veröffentlichen.

## Grenzen und Bestandsschutz

- Keine bestehenden Datensätze geändert. Alte Verfügbarkeitswerte bleiben im Administrator-Dialog lesbar, unbekannte Werte werden unverändert angezeigt. Das Bearbeiten anderer Fahrerdaten schreibt Verfügbarkeit nicht zurück.
- Keine zusätzlichen E-Mails, keine geänderten Vorlagen, keine Änderung der manuellen Freischaltung oder Vertragsentscheidung. Die bisherigen beiden Benachrichtigungen sind ausschließlich gemockt geprüft.
- Die bisherigen `agb_*`-Felder werden vom produktiven Handler automatisch bei Registrierung gesetzt. Die vier bisherigen Checkboxwerte und ihre Texte wurden nicht übermittelt oder einzeln protokolliert. Diese Felder bleiben unverändert und sind weder Nachweis der neuen Checkboxen noch Nachweis einer Annahme des Vermittlungsvertrags. Die tatsächliche Vertragsentscheidung bleibt separat in `driver_contract_decisions`.
- Das Formular verlangt zwei Kenntnisnahmen, keine Datenschutz-Einwilligung und keine Vertragsannahme. Ein zusätzlicher rechtlicher Zustimmungsnachweis ist nicht Gegenstand dieses Auftrags. Rechtliche Schlussabnahme bleibt beim Betreiber.
- „Nach der Registrierung“ bedeutet im unveränderten Hinweis nicht unmittelbar: der vorhandene Vertragsversand erfolgt erst nach manueller Freischaltung. Dieser Prozess wurde nicht verändert.

## Reproduzierbare Prüfungen

`bun x vitest run src/lib/__tests__/driverRegistration.test.ts src/lib/__tests__/driverRegistrationHandler.test.ts src/lib/__tests__/driverMediationContract.test.ts src/lib/__tests__/fahrerVertragRedirect.test.ts`

Beispiele: `ab_datum:2026-12-01` → Profilfeld identisch / Anzeige `Ab 01.12.2026`; `sofort` → `Ab sofort`; `absprache` → `Nach Absprache`. Bei Prüftag 26.11.2026: gestern, fehlendes Datum und 29.02.2027 → HTTP 400, null Schreibzugriffe, null Mails. Heute und 29.02.2028 sind zulässig. Drei bestehende Eingabewege werden geprüft; neun isolierte erfolgreiche Registrierungen bleiben `pending`, erzeugen keine Vertragsentscheidung und nur die bisherigen zwei gemockten Benachrichtigungen.
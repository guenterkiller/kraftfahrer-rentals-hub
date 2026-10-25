# Kundenbestätigung bei neuen Buchungsanfragen

## Prüfergebnis
- Das aktuelle Formular enthält eine Pflicht-Checkbox und sendet `bedingungen_akzeptiert`. Die Anfragefunktion prüft diese Bestätigung, speichert aber bislang weder Bestätigung noch Zeitpunkt oder bestätigten Text.
- Für das bisherige Liveformular akzeptiert sie übergangsweise `datenschutz=true`, wenn das neue Bestätigungsfeld fehlt. Dieser alte Wert belegt nicht den neuen Checkbox-Text oder eine bestimmte Fassung der Vermittlungsbedingungen.
- Die Kundenanfragen sind nur für serverseitig geprüfte Administratoren lesbar. Der Nachweis soll diese vorhandene Zugriffssicherung nutzen.

## Geplante Änderung
### 1. Minimaler Nachweis an der jeweiligen Anfrage
Fünf optionale Nachweisfelder an `job_requests` ergänzen:
- **Pflichtbestätigung erteilt:** `true` ausschließlich bei ausdrücklicher Bestätigung aus dem neuen Formular; kein pauschaler Standardwert.
- **Bestätigungszeitpunkt:** serverseitiger UTC-Zeitpunkt des Eingangs der bestätigten Anfrage. Das ist nicht der behauptete Zeitpunkt des Klicks auf dem Kundengerät.
- **Bestätigte Fassung:** eindeutige technische Kennung des unveränderten Textes der Auftraggeber-Vermittlungsbedingungen.
- **Bestätigungstext:** exakter freigegebener Wortlaut der Pflicht-Checkbox.
- **Bedingungstext:** vollständiger unveränderlicher Textstand der verlinkten Vermittlungsbedingungen; ein bloßer Link zur später veränderbaren Seite genügt nicht.

Keine zusätzlichen Namen, Kontaktdaten, IP-Adressen, Geräteangaben oder sonstigen Kundendaten im Nachweis. Keine separate Nachweistabelle erforderlich. Alle bisherigen Anfragen behalten leere Nachweisfelder; keine nachträgliche Ergänzung und keine Umdeutung vorhandener Werte.

### 2. Formular und serverseitige Speicherung
- Eine gemeinsame, inhaltlich unveränderte Textquelle für die Auftraggeberbedingungen schaffen und eine eigene Fassungskennung vergeben; keine Fahrer-Vertragsversion wiederverwenden. Die Seite, die Formularverknüpfung und die serverseitige Textkopie müssen denselben Stand verwenden.
- Das Formular sendet neben `bedingungen_akzeptiert` nur die zugehörige Fassungskennung. Bestätigungszeitpunkt und gespeicherte Texte bestimmt der Server selbst, nicht der Kunde.
- Bei ausdrücklich bestätigtem neuen Formular nur eine bekannte Fassung akzeptieren. Bei fehlender oder unbekannter Fassung keine vermeintlich passende aktuelle Version unterstellen, sondern verständlich ablehnen und zum erneuten Laden auffordern.
- Anfrage und vollständigen Nachweis in einem einzigen Speichervorgang anlegen. Bei einem Fehler keine Anfrage ohne den zugesagten Nachweis aus diesem neuen Weg speichern.
- Nachweisfelder nach der Anlage gegen Änderungen und nachträgliche Ergänzung schützen; normale Bearbeitung der Anfrage bleibt möglich. Bestehende Löschschutzregeln unverändert erhalten.

### 3. Übergang für das alte Liveformular
- Den bisherigen Ersatzweg bis zum IONOS-Upload unverändert beibehalten: nur bei fehlendem `bedingungen_akzeptiert` darf weiterhin `datenschutz=true` die bisherige Verarbeitung ermöglichen. Ein ausdrücklich falsches neues Bestätigungsfeld darf diesen Ersatzweg nicht nutzen.
- Bei diesem Weg **keinen neuen Bestätigungsnachweis behaupten**: die fünf Felder bleiben leer. Neue Anfragen mit `bedingungen_akzeptiert`, aber ohne Fassungskennung werden dagegen abgewiesen; die aktualisierte Vorschau erhält die Kennung zusammen mit der neuen Speicherung.
- Keine nachträgliche Zuordnung eines heutigen Bedingungstextes zu alten Anfragen.
- Erst nach gesondert freigegebenem IONOS-Upload prüfen, ob alle tatsächlich erreichbaren Formulare die Bestätigung und Fassungskennung senden, einschließlich alter zwischengespeicherter Seiten und weiterer Anfragewege. Entfernung des Ersatzwegs erst nach dieser Prüfung und gesonderter Freigabe; nicht Bestandteil dieser Umsetzung.

### 4. Anzeige im Administratorbereich
Bei jeder Anfrage einen rein lesenden Bereich **„Kundenbestätigung“** anzeigen:
- „Pflichtbestätigung erteilt“, Datum/Uhrzeit in deutscher Darstellung (Europe/Berlin) und Fassungskennung.
- Aufklappbare Ansicht des gespeicherten Checkbox- und Bedingungstextes.
- Bei alten oder über den Ersatzweg eingegangenen Anfragen: **„Kein gespeicherter Bestätigungsnachweis vorhanden.“** Kein Annahmedatum aus dem Erstellungsdatum ableiten; keinen positiven Bestätigungsstatus anzeigen.
- Kein Bearbeiten, Nachtragen oder Bestätigen durch Administratoren.

## Technische Umsetzung nach Freigabe
- Betroffene Stellen: `SimpleBookingForm.tsx`, `Vermittlungsbedingungen.tsx`, neue zusammengehörige Text-/Versionsmodule für Frontend und Server, `submit-fahrer-anfrage`, `Admin.tsx` sowie eine kleine Datenbankmigration mit fünf nullable Feldern und Schutztrigger.
- Vorhandene Rechte beibehalten: keine öffentliche Leseberechtigung, kein neuer öffentlicher Schreibweg und keine neue Rolle. Der vorhandene service-role-Speicherweg schreibt den Nachweis; Administratorzugriff wird weiterhin serverseitig geprüft.
- Weitere Formulare und die vorhandene `submit_job_request`-Funktion auf Erreichbarkeit prüfen. Nicht modernisierte Wege dürfen keinen vollständigen neuen Nachweis erzeugen oder einen vorhandenen überschreiben; ihre bisherigen Abläufe nicht eigenmächtig umbauen.
- Strukturentscheidung und Tests im Projekt dokumentieren. Keine Änderungen an E-Mail-Vorlagen oder Versandaufrufen.

## Prüfung ohne produktive Buchung oder E-Mail
- Isolierte Tests mit abgeschalteten Versandabhängigkeiten: vollständige Bestätigung, fehlende/falsche Bestätigung, fehlende/unbekannte Fassung, manipulierte Texte/Zeitangaben und alter Ersatzweg.
- Konkrete Prüfung des gespeicherten Nachweises sowie seines Änderungsschutzes mit isolierten beziehungsweise vollständig zurückgerollten Beispieldaten; keine Bestandsdatensätze bearbeiten.
- Administratoranzeige für vollständigen und fehlenden Nachweis mit Beispieldaten prüfen.
- Regressionen für Hotelbudget 0 €, 20 €, 75 € und Ablehnung von 75,01 €, Preise und bestehende Formularregeln; genau eine Pflicht-Checkbox. Keine produktive Anfrage absenden und keine Fahrerangebote auslösen.

## Grenzen
Dieser Plan dokumentiert die übermittelte Kundenbestätigung nachvollziehbar, stellt aber keine zusätzliche Identitätsprüfung oder juristische Garantie dar. Preise, Hotelbudget, Fahrtkosten, Zuschläge, Stornierung, Fahrerzuteilung, Widerspruchsmöglichkeit und E-Mails bleiben unverändert. Noch keine Datenbankänderung, Bereitstellung, Veröffentlichung oder IONOS-Übertragung.
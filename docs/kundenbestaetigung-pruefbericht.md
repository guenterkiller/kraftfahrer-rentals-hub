# Kundenbestätigung – technischer Prüfbericht

## Ergebnis
- Neue Anfragen aus dem aktualisierten Formular enthalten die Bestätigung, serverseitigen Eingangszeitpunkt, Fassungskennung, den exakten Checkbox-Text und einen vollständigen Bedingungstext.
- Die fünf Felder werden mit der Anfrage angelegt. Ein Datenbanktrigger setzt die Zeit und verhindert Änderungen oder nachträgliches Ergänzen. Keine zusätzliche IP-Erfassung.
- Administratoren können den Nachweis in den Anfragedetails am Computer und am Mobilgerät lesen und aufklappen. Fehlende Nachweise werden ausdrücklich als fehlend angezeigt.
- Der Altformularweg bleibt erhalten und erzeugt keinen behaupteten Bestätigungsnachweis. Er darf nicht durch ein ausdrücklich falsches neues Bestätigungsfeld aktiviert werden.
- `submit-fahrer-anfrage` wurde erfolgreich eingespielt. Die neue Formular- und Administratoranzeige benötigt weiterhin den gesondert freizugebenden IONOS-Upload. Der Ersatzweg wird jetzt nicht entfernt.

## Durchgeführte Prüfungen
- 53 Frontend-/Regeltests und ein Deno-Nachweistest bestanden; automatische Vorschauprüfung: build OK.
- Tatsächlichen Anfragehandler mit ausschließlich simuliertem Speichern und simulierten Versandabhängigkeiten geprüft; Netzwerk im Test gesperrt. Hotelbudget 0 €, 20 €, 75 € korrekt übernommen; 75,01 €, negative, fehlende und ungültige Werte vor Speicherung abgewiesen. Fehlende/falsche Bestätigung und unbekannte/fehlende Fassung abgewiesen, Altformular ohne Nachweis akzeptiert.
- Datenbankmigration enthält isolierte, vollständig zurückgerollte Prüfeinträge: vollständige Nachweisspeicherung, echte serverseitige Zeit, Schutz vor Änderung und Nachtragen, Ablehnung unvollständiger Nachweise sowie unveränderte normale Anfragebearbeitung geprüft.
- Browserprüfung mit vollständig abgefangenen Supabase-Anfragen: aktuelle Formularwerte 0/20/75 korrekt im Payload, 75,01 im Formular abgewiesen, Checkbox erforderlich und Datenschutz ohne eigene Checkbox; Nachweis und fehlender Nachweis in der isolierten Administratoransicht sichtbar, auch mobil.
- Vollständiger sichtbarer Text der Vermittlungsbedingungen vor/nach Auslagerung der Textquelle exakt identisch.
- Nachkontrolle der 79 vorhandenen Kundenanfragen: ursprüngliche Datenprüfsumme unverändert (`8f509be50af4c22cea34f712f5ad055a`), kein Nachweis nachgetragen, keine Prüfeinträge verblieben.
- Keine aktiven Verwendungen der alten `BookingForm` oder Aufrufe von `submit_job_request` in den aktuellen Frontendquellen gefunden. Bestehende unmodernisierte Wege unverändert; sie können keinen vollständigen neuen Nachweis erzeugen oder vorhandene Nachweise überschreiben.

## Grenzen und unveränderter Umfang
Keine produktive Testbuchung, keine echten E-Mails, keine Fahrerangebote, kein IONOS-Upload und keine Veröffentlichung. Preise, Hotelbudgetregel, Fahrtkosten, Zuschläge, Stornierung, Vermittlungsabläufe, Widerspruchsmöglichkeit und E-Mail-Vorlagen/Versandaufrufe unverändert.

Die vollständige Administratoranzeige wurde isoliert geprüft, nicht mit einer echten Administrator-Sitzung des externen Supabase-Projekts. Der tatsächliche Anfragehandler und der tatsächliche Datenbankschutz wurden getrennt geprüft; keine echte Anfrage wurde zwischen diesen Schritten erzeugt. Das stellt keine produktive End-to-End-Abnahme dar.

Die Datenbankprüfung meldete keine neuen Sicherheitswarnungen. 27 bereits bestehende Hinweise bleiben unverändert: Ausführungsrechte vorhandener Funktionen (24), lange OTP-Gültigkeit, deaktivierter Schutz gegen kompromittierte Passwörter und verfügbare PostgreSQL-Sicherheitspatches.
# Fahrerfreischaltung – Vorschau und vorbereitete Serveränderungen

## Geprüfter Stand
- Registrierung speichert `pending`; Vertragsannahme setzt keinen Freischaltungsstatus.
- Freischaltung erfolgt durch die authentifizierte Administratorfunktion. Sie prüft bisher weder Unterlagen noch deren Prüfung und lehnt gesperrte/inaktive Fahrer nicht ausdrücklich vor der Freigabe ab.
- Reguläre Broadcast-Wege wählen freigegebene, ungesperrte, nicht inaktive Fahrer aus; die Freischaltungsfunktion erzeugt Angebote erst nach ihrem Statuswechsel.
- Vertragsentscheidung und Freischaltung sind getrennte Vorgänge. Der Stichtagsschalter bleibt unverändert.

## Nur in der Oberfläche umgesetzt
- Alle bisherigen Freischalt-Schaltflächen öffnen zunächst die Unterlagenprüfung. Gewerbeanmeldung und Führerschein müssen in den Dokumentdatensätzen vorhanden sein. Der Administrator bestätigt die Prüfung der Gewerbeanmeldung und sämtlicher für die Tätigkeit erforderlichen Fahrerunterlagen ausdrücklich; es gibt keine automatische Freischaltung.
- Prüfbestätigungen sind nur flüchtige Dialogzustände, kein gespeicherter Prüfungsnachweis. Fahrerkarte und Zertifikate bleiben tätigkeitsabhängig; ihr Erfordernis bestätigt der Administrator, statt pauschal neue Registrierungsanforderungen einzuführen.
- Gesperrte/inaktive Fahrer lassen sich über diesen Dialog nicht freischalten. Dies ersetzt keine serverseitige Schutzregel.
- Die gespeicherte Vertragsentscheidung samt tatsächlicher Fassung ist auch in der mobilen Fahrerliste sichtbar; ältere Entscheidungen werden nicht umgedeutet.
- Die vorhandene Vertragsseiten-Weiterleitung nach zehn Sekunden bleibt unverändert: nur nach gespeicherter Annahme/Ablehnung, nicht bei Fehlern.

## Vorbereitete Fahrerbestätigung (nicht im Versand aktiviert)
Betreff unverändert: vorhandener Registrierungsbetreff.

Hallo {{driverName}},

willkommen bei der Fahrerexpress-Agentur. Ihre Registrierung als selbstständige/r Fahrer/in ist eingegangen.

**Prüfung und Freischaltung**
Ihre Registrierung und die Annahme des Vermittlungsvertrags bedeuten noch keine Freischaltung. Bitte reichen Sie Ihre Gewerbeanmeldung und alle erforderlichen Fahrerunterlagen ein. Fahrerexpress prüft Ihre Unterlagen; ausschließlich der Administrator schaltet Ihr Profil nach erfolgreicher Prüfung manuell frei. Erst danach können Sie passende Auftragsangebote per E-Mail erhalten. Diese enthalten Einsatzort, Zeitraum und Vergütung. Sie entscheiden frei, ob Sie ein Angebot annehmen oder ablehnen möchten.

**Ihr persönlicher Vermittlungsvertrag**
Bitte lesen Sie den vollständigen Vermittlungsvertrag und nehmen Sie ihn auf Ihrer persönlichen Seite an oder lehnen Sie ihn ab. Der Link ist 14 Tage gültig. Ein Klick in dieser E-Mail allein entscheidet nichts.

Button: **Vermittlungsvertrag prüfen** → {{contractUrl}}

Bei Fragen erreichen Sie uns unter info@kraftfahrer-mieten.com oder 01577 1442285.

Wir freuen uns auf die Zusammenarbeit!
Ihr Fahrerexpress-Team

Die vorhandene gemeinsame Kopf-/Fußzeile mit Geschäfts- und Kontaktangaben bleibt erhalten; der persönliche Link bleibt optional wie bisher. Keine zusätzliche E-Mail.

## Vorbereitete Administratorbenachrichtigung (nicht im Versand aktiviert)
Betreff unverändert: Neue Fahrer-Registrierung: {{firstName}} {{lastName}}

**Neue Fahrerregistrierung**
Ein selbstständiger Unternehmer hat sich registriert. Das Profil ist noch nicht freigeschaltet.

**Kontaktdaten**
Vorname: {{firstName}} · Nachname: {{lastName}}
E-Mail: {{email}} · Telefon: {{phone}}

**Standort / An- und Abfahrt**
Straße: {{strasse}} · Hausnummer: {{hausnummer}}
Postleitzahl: {{plz}} · Ort: {{ort}} · Land: {{land}}

**Fahrerdetails**
Führerscheinklassen: {{licenseClasses}}
Berufserfahrung: {{experienceYears}} Jahre
Einsatzbereiche / Spezialisierungen: {{specializations}}
Regionen / Einsatzgebiet: {{regions}}
Spezialanforderungen: {{specialRequirements}}
Gewerbeanmeldung eingereicht: {{Ja/Nein}}
Fahrerkarte eingereicht: {{Ja/Nein}}

**Unterlagen**
Führerschein, Fahrerkarte, Zertifikate, Gewerbeanmeldung: je {{vorhanden/nicht vorhanden}}, bei mehreren Dateien deren Anzahl; abgelehnte Dateien weiterhin einzeln mit Dateiname und Ablehnungsgrund. Nicht erfasste Angaben bleiben ausdrücklich „nicht erfasst“.

**Vor manueller Freischaltung**
1. Gewerbeanmeldung, Führerschein, erforderliche Fahrerkarte und Zertifikate prüfen.
2. Fahrerstandort, Führerscheinklassen und Einsatzbereiche prüfen.
3. Vertragsentscheidung im Administratorbereich prüfen; Registrierung und Vertragsannahme allein schalten niemanden frei.
4. Nur nach erfolgreicher Prüfung manuell freischalten. Erst danach erhält der Fahrer passende Auftragsangebote.

Registriert am: {{Registrierungszeitpunkt}}

Gemeinsame Kopf-/Fußzeile, alle Kontaktdaten, Dateianzahlen und Uploadfehler bleiben erhalten. Kein zusätzlicher Versandweg.

## Vorbereitete Vertragskorrektur (nicht aktiviert)
Nur § 4 Abs. 2 ersetzen durch:

> 2. Der Fahrer muss seine Gewerbeanmeldung vor der Freischaltung bei Fahrerexpress einreichen. Die Gewerbeanmeldung und die erforderlichen Fahrerunterlagen müssen vorliegen und von Fahrerexpress geprüft sein. Die Freischaltung erfolgt ausschließlich manuell durch den Administrator nach erfolgreicher Prüfung. Registrierung und Annahme dieses Vermittlungsvertrags bewirken keine Freischaltung. Ohne vorliegenden Gewerbenachweis erfolgt keine Auszahlung.

Keine andere Vertragsregel ändern. Vor Aktivierung eine neue eindeutige Vertragsfassung vergeben und beide Textmodule wortgleich halten. Bereits gespeicherte Entscheidungen, Vertragstexte und Nachweise bleiben unverändert; bestehende Einladungen nicht stillschweigend auf einen anderen Vertragstext umstellen.

## Warum diese Teile noch nicht aktiviert sind
Änderungen unter `supabase/functions` werden unmittelbar produktiv bereitgestellt. Daher wurden die beiden Versandvorlagen, das serverseitige Vertragsmodul und die Freischaltungsfunktion bei diesem ausdrücklich auf die Vorschau begrenzten Auftrag nicht verändert. Nur eine Oberflächenprüfung ist keine vollständige technische Durchsetzung der Unterlagenregel.

Für eine spätere gesondert freigegebene Serverkorrektur sind die Unterlagenvoraussetzungen und die ausdrückliche Administrator-Prüfbestätigung serverseitig zu validieren, gesperrte/inaktive Fahrer vor Statuswechsel und Angeboten abzuweisen und der bestätigte Freigabestatus vor Angebotsanlage zu prüfen. Keine bestehende Freigabe rückwirkend ändern und keinen Stichtagsschalter automatisch aktivieren.
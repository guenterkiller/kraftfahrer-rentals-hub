# Prüfbericht: Upload der Gewerbeanmeldung bei der Fahreranmeldung (nur lesend)

Es wurde nichts geändert, nichts geschrieben, keine Testanmeldung gemacht und nichts versendet.

## 1. Befund zum 06.11.2026 (Datenbank und Speicher, nur gelesen)

- **Neue Fahrerprofile am 06.11.2026: 0.** Auch seit dem 05.11. gibt es keine neuen Profile.
- **Neue Dateien im Unterlagenspeicher am 06.11.2026: 0.**
- Letztes neues Fahrerprofil und letzte hochgeladene Datei: **22.10.2026, 18:22 Uhr**. In den letzten 30 Tagen gab es 5 neue Profile.
- **Server-Protokolle:** Für die Anmeldefunktion liefert der Zugang keine Einträge, auch nicht für andere Tage. Die Protokolle sind über diese Verbindung nicht abrufbar; einzelne fehlgeschlagene Versuche am 06.11. lassen sich daher **weder belegen noch ausschließen**.
- **Folgerung:** Die Anmeldung des Fahrers ist am 06.11. **nicht beim Server angekommen** oder wurde vorher abgebrochen. Hätte der Server sie angenommen, gäbe es ein Profil, auch wenn nur die Datei abgelehnt worden wäre (siehe 2e). Das spricht dafür, dass der Vorgang **im Browser des Fahrers** gestoppt ist.

## 2. Vollständiger Ablauf (Fundstellen)

a) **Dateiauswahl:** `src/pages/FahrerRegistrierung.tsx` Z. 1257–1263 ist ein verstecktes Dateifeld `#gewerbeanmeldung` mit `accept=".jpg,.jpeg,.png,.pdf,…"`. Der Knopf „Datei wählen“ öffnet es (Z. 1269). Auf Mobil und Desktop ist der Ablauf gleich; einen eigenen Weg für die Kamera gibt es nicht.

b) **Prüfung direkt bei der Auswahl:** `handleFileChange` (Z. 297–326) mit `validateFiles` (`src/utils/fileValidation.ts`). Abgelehnt werden:
   - HEIC/HEIF (Standardformat der iPhone-Kamera),
   - Dateien über **5 MB**,
   - fehlender oder anderer Dateityp als JPG/PNG/PDF,
   - eine andere Dateiendung.

   Bei einer Ablehnung wird die Datei verworfen und eine Fehlermeldung angezeigt.

c) **Pflicht:** Das Hochladen der Gewerbeanmeldung ist **keine** Pflicht. Pflicht ist nur das Häkchen „Gewerbenachweis bestätigt“ (Z. 261–263). Eine Anmeldung ohne Datei ist also möglich.

d) **Absenden:** Z. 370–390 prüft alle Dateien noch einmal. Bei **einem** Dateifehler wird **die gesamte Anmeldung abgebrochen** („Datei-Validierungsfehler“). Danach geht alles in einer einzigen Sendung an die Serverfunktion `fahrerwerden` (Z. 449–452). Dafür ist keine Anmeldung oder Benutzerkonto nötig (`verify_jwt = false`).

e) **Server:** `supabase/functions/fahrerwerden/index.ts`:
   - Z. 17–35 prüft dieselben Regeln (5 MB, JPG/PNG/PDF, kein HEIC).
   - Z. 316–318 speichert die Datei im privaten Speicher `fahrer-dokumente` unter `uploads/<E-Mail>/gewerbeanmeldung_N.<Endung>`.
   - Eine abgelehnte Datei blockiert **nicht** die Anmeldung. Der Fahrer sieht dann „Registrierung erfolgreich – Dokument nicht hochgeladen“ (Frontend Z. 476–488).

f) **Speicher:** Der Speicher `fahrer-dokumente` ist privat, erlaubt höchstens 5 MB und nur PDF/JPEG/PNG. Geschrieben wird nur serverseitig; der Browser lädt nie direkt hoch.

## 3. Wahrscheinlichster Fehlergrund (aus dem Code belegt, im Einzelfall nicht bewiesen)

Die Dateiprüfung im Browser verhindert, dass die Anmeldung beim Server ankommt. Typische Auslöser auf Mobilgeräten:

1. **iPhone-Foto im HEIC-Format.** Es wird abgelehnt. Zwar wandelt das iPhone beim Hochladen über den Browser meist in JPG um, aber nicht immer (z. B. aus der Dateien-App).
2. **Handyfoto größer als 5 MB.** Moderne Smartphones erzeugen oft Fotos mit 4–12 MB. Eine automatische Verkleinerung gibt es nicht.
3. **Fehlender Dateityp:** Manche Android-Dateimanager oder Cloud-Apps (Google Drive, WhatsApp-Dokumente) übermitteln einen leeren Dateityp. Dann erscheint „Dieser Dateityp wird nicht unterstützt“, obwohl die Datei ein gültiges PDF ist (`fileValidation.ts`, Prüfung des Dateityps vor der Dateiendung).
4. **Gesamte Anmeldung blockiert:** Ist eine Datei fehlerhaft (auch bei Führerschein oder Fahrerkarte), bricht Z. 380–388 die Anmeldung komplett ab, statt ohne diese Datei fortzufahren. So entsteht kein Profil. Das passt zum Befund (0 Profile).
5. **Gleiche Datei erneut wählen:** Nach einer Ablehnung wird das Dateifeld nicht geleert. Wählt der Fahrer dieselbe Datei noch einmal, passiert nichts sichtbar, weil das Feld keine Änderung erkennt.

Nicht belegt sind Fehler bei Berechtigungen, Speicher, Datenbank oder Serverfunktion; es gibt keine Hinweise und keine abrufbaren Protokolle dazu.

## 4. Nur auf IONOS bzw. extern prüfbar

- Welche Version des Anmeldeformulars live auf IONOS läuft. Die oben genannten Fundstellen sind der Stand in der Vorschau.
- Die Protokolle der Serverfunktion `fahrerwerden` vom 06.11. im Supabase-Dashboard (Edge Functions → fahrerwerden → Logs). Damit wäre zu sehen, ob überhaupt Anfragen ankamen (Status 400/409/500).
- **Am schnellsten beim Fahrer erfragen:** Gerät (iPhone/Android), Browser, Dateityp und -größe sowie den genauen Wortlaut der Fehlermeldung.

## 5. Minimalinvasiver Reparaturvorschlag (erst nach Freigabe)

Diese Änderungen betreffen nur das Anmeldeformular; SEO und Tracking bleiben unberührt.

1. Fehlerhafte Datei **nicht mehr die ganze Anmeldung blockieren lassen**. Nur diese Datei entfernen, deutlich anzeigen und die Anmeldung trotzdem senden. Der Server verhält sich bereits so.
2. **Fehlenden Dateityp akzeptieren**, wenn die Dateiendung `.pdf/.jpg/.jpeg/.png` ist. Ebenso im Server bestimmen (Typ aus der Dateiendung ableiten). Der Speicher erlaubt weiterhin nur diese drei Typen.
3. **Große JPG/PNG-Fotos im Browser automatisch auf unter 5 MB verkleinern**, bevor sie gesendet werden. Bei PDF bleibt die Grenze von 5 MB.
4. Das Dateifeld nach einer Ablehnung leeren, damit eine erneute Auswahl funktioniert.
5. In der Fehlermeldung einen klaren Hinweis geben: „Alternativ per E-Mail an info@kraftfahrer-mieten.com senden“. Dieser Text erscheint bisher nur nach erfolgreicher Anmeldung; als Textänderung braucht er Ihre Freigabe.

**Tests nach der Umsetzung:** nur automatisierte Prüfungen der Dateiprüfung, z. B. HEIC, 6-MB-Foto, PDF ohne Dateityp, gültiges PDF. Keine echte Anmeldung und keine echten Uploads.

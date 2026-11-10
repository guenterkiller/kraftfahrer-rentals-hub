# Ursachenanalyse Windows-Build Fahrerexpress

## Bereits lesend geprüfte Befunde

1. **GitHub-Synchronisierung: in Ordnung.** Der GitHub-Branch `main` (guenterkiller/kraftfahrer-rentals-hub) steht auf Commit `d945567d` „Annahme-Preis filtert Nettobetrag“. Das ist identisch mit dem aktuellen Projektstand. Die Änderung an der Annahmeseite ist also enthalten, und `git clone` zieht genau diesen Stand.
2. **Im Repository sind vorhanden:** `public/sitemap.xml`, `public/robots.txt`, `public/.htaccess`, `package-lock.json`, `scripts/prerender.mjs` und `scripts/validate-prerender.mjs`. `npm run build` führt `vite build` und danach das Prerendering aus. Die Datei `sw.js` erzeugt das PWA-Plugin beim Build. Das Prerendering bricht bewusst mit Fehler ab, wenn `dist/index.html` fehlt oder der Headless-Browser (puppeteer) nicht startet.
3. **Die roten Meldungen stammen nicht aus dem Projektskript.** Weder „kraftfahrer-fertig“ noch „robocopy“ noch „BUILD ERFOLGREICH!“ kommen im Repository vor. Das mitgelieferte `build-complete-dist.ps1` nutzt `$ErrorActionPreference = "Stop"` und bricht nach jedem fehlgeschlagenen Schritt ab. Der Nutzer hat also eine eigene, einzeln eingegebene Befehlsfolge verwendet. Dabei ist `npm run build` als erster Schritt gescheitert. Dadurch fehlten `dist/index.html` und `dist/sitemap.xml`, und alle späteren Schritte (SEO-Prüfung, robocopy, Kopie nach `kraftfahrer-fertig`) liefen ins Leere. Die Meldung „BUILD ERFOLGREICH!“ war ein reiner Text-Befehl ohne Prüfung.
4. **Warum mein Build abweicht:** Mein gemeldeter Build (`ionos-upload-fahrerexpress_v2.zip`, 22/22 Seiten) entstand in der Linux-Umgebung. Dort sind die Abhängigkeiten und der Chromium-Browser für puppeteer bereits installiert. Auf Windows nach `npm ci` ist die wahrscheinlichste Ursache, dass `vite build` oder der puppeteer-Browser scheitert, etwa wegen fehlendem Chrome-Download, Node-Version oder Virenscanner. Das ist noch **unbestätigt**, weil die erste rote Meldung von `npm run build` nicht vorliegt.

## Nächste Schritte nach Freigabe (nur lesend bzw. in isoliertem Temp-Ordner)

1. Frischen Klon von GitHub `main` in `/tmp` anlegen, dort `npm ci` und `npm run build` ausführen. Es gibt keine Änderung am Projekt, kein Deployment und keine E-Mails.
2. Im Ergebnis prüfen, ob vorhanden sind: `dist/index.html`, `sitemap.xml`, `robots.txt`, `sw.js`, `.htaccess`, `prerender/` mit 22 Seiten. Dazu `validate-prerender.mjs` ausführen.
3. Exakten Bericht liefern: Reproduzierbar ja/nein, mit Dateiliste und Commit.
4. Vom Nutzer die **erste** rote Meldung aus `npm run build` unter Windows sowie die Ausgabe von `node -v` erbitten, um die Windows-Ursache endgültig zu bestätigen.

## Empfohlener einziger verlässlicher Weg

- **Variante A (empfohlen, ohne Windows-Build):** Die von mir erzeugte und geprüfte ZIP-Datei `ionos-upload-fahrerexpress_v2.zip` aus den Dateien verwenden. Sie entspricht Commit `d945567d`. Ihren Inhalt vollständig samt `.htaccess` und `prerender/` ins IONOS-Hauptverzeichnis laden.
- **Variante B (falls lokal gebaut werden soll):** Ausschließlich das Skript `build-complete-dist.ps1` als Ganzes ausführen, keine Einzelbefehle. Es bricht bei jedem Fehler ab und gibt nur bei geprüftem Ergebnis „Erfolg“ aus.

Keine Code-, Skript- oder Inhaltsänderungen in diesem Schritt.

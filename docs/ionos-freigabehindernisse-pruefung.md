# IONOS-Freigabehindernisse – 25.10.2026

## Tatsächlich korrigiert
- `submit_job_request` hat keine Ausführungsberechtigung mehr für PUBLIC, anon, authenticated oder service_role. Die Migration enthält dauerhafte Berechtigungstests und tatsächliche Aufrufprüfungen unter drei Rollen mit ausschließlich NULL-Eingaben; kein Datensatz wurde angelegt.
- Lokale Quellen enthalten keinen Laufzeitaufruf des alten RPC. Die gerouteten Formulare rufen `submit-fahrer-anfrage` auf; `admin-create-job` bleibt ein separat authentifizierter Administratorweg. Der aktive Edge-Handler schreibt direkt mit dem serverseitigen Client, nicht über den gesperrten RPC.
- Direkte anonyme Tabellen-Einfügung ist gesperrt. Der beabsichtigte Datenschutz-only-Übergang im Edge-Handler bleibt bestehen und erzeugt ausdrücklich keinen Bestätigungsnachweis. Eine universelle Aussage, dass jede öffentliche Anfrage bereits den neuen Nachweis erzwingen müsse, wäre daher falsch.
- Die 79 vorhandenen Anfragen sind vor/nach Korrektur identisch: Prüfsumme über vollständige Zeilen `c1c51fa8a8fcf8c06bcafa34d9ca2240`.

## Repository-Nachweis
Die öffentliche GitHub-API lieferte zuletzt `guenterkiller/kraftfahrer-rentals-hub`, Standardbranch `main`, Commit `0192afe1bc6b1a07da88627c260ce611d90fd7bd`. Der rekursive, nicht abgeschnittene Dateibaum wurde anhand Git-Blob-IDs mit dem lokalen HEAD verglichen. Nur drei neue Änderungen fehlen dort zu diesem Zeitpunkt: `AGENTS.md`, `build-complete-dist.ps1` und die aktuelle Berechtigungsmigration. Formular, Hotelbudget, Nachweismodule, Anfragehandler, Administratoransicht und bisherige Nachweismigration stimmen exakt überein.

`brasilio-thomazo/fahrerexpress.de` war in der letzten direkten GitHub-API-/ls-remote-Prüfung nicht öffentlich lesbar (404 beziehungsweise Anmeldung erforderlich). Ein früher Hintergrundabruf lieferte widersprüchliche Metadaten, aber keine lesbaren Dateien. Daraus wird kein vollständiger Stand dieses Repositories behauptet.

Nach dem positiven Abgleich wurde das PowerShell-Skript auf das nachgewiesene Repository und explizit `main` umgestellt. Fehler beim Klonen brechen ab, die Herkunft wird geprüft und der konkrete Commit ausgegeben. Kein Git-Push durchgeführt; neue Änderungen müssen vor Verwendung des Skripts in GitHub synchronisiert vorliegen.

## Prüfungen
- 53 Frontend-Regeltests bestanden.
- 8 Deno-Tests bestanden: Bestätigung/Legacy, Budgetvalidierung sowie Kunden-/Administrator-Mailwerte 0/20/75 ausschließlich gerendert.
- 4 bestehende Prerender-Regeltests bestanden.
- Tatsächlicher Anfragehandler lokal mit simuliertem DB-/Versandclient und gesperrtem Netzwerk geprüft: 0/20/75 gespeichert im Testdouble; fehlende/ungültige Budgets und Bestätigung/Fassung abgewiesen; Legacy ohne erfundenen Nachweis.
- Automatische Projektprüfung meldet zuletzt `build OK`.
- 25 verbleibende Linterwarnungen sind vorbestehend; keine neue Warnung durch die Berechtigungskorrektur.

## Offen: vollständiger Produktionsbuild
Es liegt in dieser Umgebung kein `dist`-Artefakt vor. Der automatische Prüfstatus belegt keinen vollständigen ausgeführten IONOS-Produktionsbuild einschließlich Prerendering. Die Ausführungsregeln dieser Umgebung untersagen manuelle Projektbuilds; deshalb wurde weder `npm run build` ausgeführt noch ein Uploadpaket als geprüft ausgegeben. Nach GitHub-Synchronisation muss der vollständige Produktionslauf und sein tatsächliches Ergebnis noch überprüft werden. Die Version ist deshalb noch nicht abschließend für den IONOS-Upload freigegeben.

Keine echten Buchungen, E-Mails, Bestandsdatenänderungen, Veröffentlichung oder IONOS-Übertragung.
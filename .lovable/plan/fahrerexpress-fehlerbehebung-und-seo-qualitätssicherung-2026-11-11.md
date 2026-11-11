# Fahrerexpress – Fehlerbehebung und SEO-Qualitätssicherung

## Gezielte Korrekturen
- Auf `/fahrer-infos` die vorhandene Überschrift „Interner Informationsbereich“ unverändert als echte H1 auszeichnen, mit gleicher Darstellung. Die bisherige H1-Ausnahme in den Exportprüfungen entfernen.
- Den optionalen Arrayzugriff in der Kundenbestätigung durch ausdrückliche Prüfung beider Datumswerte typsicher machen. E-Mail-Texte und Berechnungen bleiben unverändert.
- Die 23 npm-Audit-Meldungen anhand des Windows-relevanten `package-lock.json` prüfen. Kompatible Aktualisierungen gezielt übernehmen und beide verwendeten Lockdateien abgleichen; keine erzwungenen Hauptversionswechsel. Nicht sicher behebbare Risiken mit Paket, Schwere und tatsächlicher Verwendung dokumentieren.

## Prüfung und Nachweis
- Alle 22 Sitemap-Seiten auf individuelle Title/Description/H1, Canonical, OG, Robots, Links und JSON-LD prüfen; vorhandene Inhalte und URLs erhalten.
- Besonders die vier genannten Leistungs-/Preisseiten prüfen. Export unter echtem Apache mit der unveränderten IONOS-Konfiguration auf HTTP-Auslieferung ohne JavaScript, Weiterleitungen und Schleifen prüfen, nicht nur Dateien lesen.
- Bestehende öffentliche Website zusätzlich nur lesend prüfen. Ohne IONOS-Upload kann deren aktueller Stand von der korrigierten Vorschau abweichen; dies ausdrücklich unterscheiden.
- Website-/Servertests, Typprüfungen, Produktionsbuild und 22/22-Prerender-Validierung erneut prüfen; Desktop und Mobilansicht der H1-Korrektur vergleichen.
- Nach den Tests GitHub `main` erneut abrufen und den nachweisbaren Commit nennen. Falls die automatische Synchronisierung noch nicht erfolgt ist, keine Übertragung behaupten.

## Grenzen
Keine neuen Seiten, keine Textneugestaltung, keine Tarif-/Provisions-/Vertragsänderung, keine echten E-Mails oder Auftragsänderungen, keine Bereitstellung der Serverfunktionen, keine Veröffentlichung und kein IONOS-Upload. Danach muss der Inhaber lokal neu bauen.

## Technische Durchführung
Die Projektumgebung erstellt Builds automatisch; zusätzliche vollständige Produktionsprüfung bei Bedarf in einer isolierten Kopie. Keine manuelle Änderung der Git-Historie oder eigenständiger Git-Push. Verbleibende Hauptversionsrisiken werden berichtet statt ungeprüft migriert.

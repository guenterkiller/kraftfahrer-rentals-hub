# Löschverwaltung in Supabase

## Selbst löschen

Im Supabase-Tabelleneditor kann eine einzelne Zeile aus `fahrer_profile` oder `job_requests` gelöscht werden. Die Datenbank prüft zuerst die Berechtigung und vorhandene Nachweise. Ein Fehler bricht die gesamte Löschung ab. Keine Fremdschlüssel oder Schutzregeln abschalten.

Alternativ im SQL-Editor die Rolle **postgres** verwenden. Die ID und die vorhandene E-Mail-Adresse aus genau der gewünschten Zeile übernehmen. Die folgenden Platzhalter müssen ersetzt werden:

```sql
-- Fahrerprofil:
SELECT public.admin_delete_driver(
  'FAHRER-UUID-HIER'::uuid,
  'vorhandene-fahreradresse@example.de'
);

-- Kundenanfrage (separat ausführen):
SELECT public.admin_delete_job(
  'AUFTRAG-UUID-HIER'::uuid,
  'vorhandene-kundenadresse@example.de'
);
```

Erfolg: `geloescht: true`. Falsche E-Mail, fehlender Datensatz, fehlende Berechtigung oder geschützte Verknüpfung: Fehlermeldung, keine teilweise Löschung.

## Grenzen

- Fahrer mit Vertragsentscheidungen, bestehender AGB-Zustimmung, verwendeten Vertragseinladungen, Auftragsverknüpfungen oder Unterlagen bleiben erhalten. Unverwendete Vertragseinladungen eines ansonsten unbelasteten Profils werden zuerst entfernt.
- Kundenanfragen mit Zuteilungen, Annahmen, Freigabe, Versand, Abrechnung, beantworteten/verbindlichen Einladungen oder Dateien bleiben erhalten. Bei unbelasteten Anfragen entfernen die bestehenden Fremdschlüssel zugehörige Auftragsangebote, Antwort- und Protokollzeilen gemeinsam mit der Anfrage.
- Die Regeln stellen keine juristische Feststellung zur Aufbewahrungspflicht dar. Ungeklärte Geschäfts-/Vertragsnachweise bleiben vorsorglich erhalten. Dafür ist eine konkrete Aufbewahrungsentscheidung nötig, nicht das Abschalten des Löschschutzes.
- Gespeicherte Dateien werden nicht direkt aus `storage.objects` gelöscht: SQL-Löschung von Metadaten würde die tatsächlichen Dateien nicht zuverlässig entfernen. Datensätze mit Dateien brechen deshalb ab.
- Kein Zugriff auf Löschfunktionen über die Website; SQL-Editor mit postgres ist der vorgesehene Funktionszugang. Tabelleneditor-Löschungen durch authentifizierte Nutzer benötigen eine serverseitig bestätigte Administratorrolle.
- Authentifizierung, Administratorrollen, Systemtabellen und E-Mail-Funktionen werden nicht geändert.

## Kontrolle vom 25.10.2026

- Alle vier freigegebenen Testeinträge sind gelöscht: die zwei künstlichen TEST-Fahrer sowie das vom Administrator selbst angelegte Testprofil „Günter Killer“ samt seinem Vertragsentscheidungsnachweis, der zugehörigen Vertragseinladung und 21 Angebotsverknüpfungen.
- Die Fahrer-E-Mail-Adresse guenter.killer@t-online.de ist in `fahrer_profile` nicht mehr geführt und damit für eine erneute Registrierung frei. Der Administratorzugang in `user_roles` und `auth.users` blieb unberührt.
- Atomare Funktionslöschung, direkte Tabellenlöschung, falsche Bestätigung, Nachweisschutz, Abrechnungsschutz und fehlende anonyme Berechtigung wurden mit zurückgerollten SQL-Beispieldaten geprüft.
- Prüfsummen von Fahrerprofilen, Aufträgen, Zuteilungen, Auftragsannahmen, Vertragsentscheidungen, Benutzerrollen und Authentifizierungskonten waren vor und nach der Schutz-/Rollback-Prüfung identisch.
- Keine neuen Registrierungen, Vermittlungen oder E-Mails ausgelöst; diese Abläufe wurden nur lesend geprüft, nicht vollständig erneut ausgeführt. Keine Veröffentlichung.
# Fahrervertragseinladungen – übersichtliche Administratoransicht

## Ergebnis der ausschließlich lesenden Prüfung
- Die App besitzt bisher keine eigene Übersicht aller Vertragseinladungen. `src/components/admin/DriverContractStatus.tsx` zeigt nur einen Vertragsstatus je Fahrer in der Desktop-Fahrerliste (`src/pages/Admin.tsx`); in der mobilen Ansicht fehlt diese Anzeige. Eine Suche nach Namen oder E-Mail ist dort nicht vorhanden.
- Technische Fahrer-IDs werden in dieser Statusanzeige nicht sichtbar ausgegeben. Die beschriebene ID-lastige Darstellung lässt sich daher anhand des App-Codes nicht zuordnen; sie kann die Tabellenansicht in Supabase betreffen. Der Vorschlag betrifft ausdrücklich die eigene Administratorverwaltung, nicht den Supabase-Tabelleneditor.
- Die vorhandene Beziehung `driver_contract_invites.driver_id → fahrer_profile.id` ist in der Datenbank und den generierten Typen bestätigt. Alle fünf derzeitigen Einladungen haben ein zugehöriges Fahrerprofil.
- Beide Tabellen erlauben das Lesen durch authentifizierte Administratoren über die vorhandene Prüfung `is_admin_user(auth.uid())`. Dafür sind keine neuen Tabellen oder Berechtigungen erforderlich.
- Die bisherige Statuskomponente nimmt den ersten passenden Eintrag ohne ausdrückliche Datumssortierung. Sie ist deshalb keine verlässliche Einladungshistorie.

## Vorgeschlagene Darstellung
Eine kompakte, ausschließlich lesende Übersicht „Fahrervertragseinladungen“ in der bestehenden Administratorverwaltung, ohne Umbau der übrigen Bereiche.

Je Einladung eine Zeile mit:
1. **Fahrer:** Vorname und Nachname aus dem verknüpften Profil.
2. **E-Mail-Adresse:** aus demselben Profil.
3. **Vertragseinladung erstellt am:** Datum und Uhrzeit aus `created_at`, deutsch und in Europe/Berlin. Das ist das Erstellungsdatum, kein belegtes E-Mail-Versanddatum.
4. **Vertragsversion:** die tatsächlich in der jeweiligen Einladung gespeicherte Fassung, nicht pauschal die aktuelle Vertragsversion.
5. **Einladungsstatus:** deutsche Anzeige, beispielsweise „Offen“, „Abgelaufen“ oder „Verwendet“. Ablauf wird aus dem vorhandenen Ablaufdatum erkannt; dadurch wird kein Datensatz geändert. Weitere tatsächlich vorkommende Statuswerte werden anhand der bestehenden Funktion zugeordnet.
6. **Fahrerprofil ansehen:** öffnet die vorhandenen Fahrerdaten des exakt verknüpften Fahrers; keine neue öffentliche Profilseite und keine Bearbeitung durch das Öffnen.

Über der Liste ein Suchfeld „Name oder E-Mail suchen“; Groß-/Kleinschreibung spielt keine Rolle. Neueste Einladungen zuerst, mit eindeutigem Sortierkriterium bei gleichen Zeitpunkten. Auf kleinen Bildschirmen dieselben Angaben in gut lesbarer Anordnung, ohne Änderungen an anderen Verwaltungsbereichen.

„Verwendet“ bedeutet nicht automatisch „Vertrag angenommen“: Annahme oder Ablehnung bleiben die separat gespeicherten Vertragsentscheidungen. Die bestehende Vertragsstatusanzeige und ihre Aktionen bleiben erhalten.

## Technische Umsetzung nach ausdrücklicher Freigabe
- **Neu: `src/components/admin/DriverContractInvites.tsx`:** lesende, typisierte Abfrage der Einladungen mit eingebetteten Profilfeldern über die vorhandene Fremdschlüsselbeziehung; Darstellung, Suche, Sortierung sowie deutsche Lade-, Fehler- und Leerzustände. Persönliche Linkschlüssel werden nicht abgefragt oder angezeigt.
- **`src/pages/Admin.tsx`:** Übersicht einbinden und mit dem vorhandenen Fahrerdaten-Dialog verbinden; dessen bestehende Bearbeitungsaktionen unverändert lassen.
- Einladungen vollständig seitenweise laden, falls die Liste über die Supabase-Abfragegrenze wächst; Suche muss alle zugänglichen Einladungen erfassen, nicht nur die erste Seite.
- `driver_contract_invites`, `fahrer_profile`, Vertragsentscheidungen, Serverfunktionen und generierte Supabase-Typen bleiben unverändert. Keine Migration und keine neuen Schreibzugriffe.
- Bei Umsetzung die neue Komponente als Architekturregel in `AGENTS.md` dokumentieren; keine Änderung geschäftlicher Regeln.

## Prüfung nach einer späteren Umsetzungsfreigabe
- Name, E-Mail, gespeicherte Vertragsversion und Erstellungsdatum stimmen je Zeile mit der Fahrerzuordnung überein.
- Suche nach Vorname, Nachname, vollständigem Namen und E-Mail; leere Suche und keine Treffer.
- Mehrere Einladungen desselben Fahrers bleiben einzeln sichtbar, korrekt sortiert und demselben Profil zugeordnet.
- Offene, zeitlich abgelaufene und verwendete Einladungen werden korrekt unterschieden; verwendet wird nicht als angenommener Vertrag ausgegeben.
- Fahrerprofilzugang, Desktop- und mobile Lesbarkeit sowie bestehende Verwaltungsaktionen prüfen.
- Administratorzugriff bleibt geschützt; keine Vertragslink-Erzeugung, E-Mails oder Änderungen an Fahrer-, Auftrags- oder Vertragsdaten durch Anzeige und Suche.

## Freigabegrenze
Dies ist nur der Umsetzungsvorschlag. Bisher wurden ausschließlich Code und Datenbank lesend geprüft. Keine Umsetzung, Tabellenänderung, Löschung, E-Mail, Veröffentlichung oder IONOS-Übertragung. Umsetzung erst nach Ihrer ausdrücklichen Freigabe.
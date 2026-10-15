# SEO-Freigabe A, B und D
- [ ] A: Fahrzeugverantwortung mit Vermittlungsbedingungen abgleichen und FAQ präzisieren, sofern widerspruchsfrei.
- [ ] B: Bestehende Startseiten-Linkzeile um /lkw-ueberfuehrung ergänzen; bisherige Links unverändert.
- [ ] D: Je eine Überführungskarte auf /lkw-fahrer-buchen und /fahrer-fuer-speditionen ergänzen.
- [ ] C: Tatsächlich missverständliche Formulierungen nur prüfen, nicht ändern.
- [ ] E/F: Google-Search-Console-Rankings und Klickzahlen prüfen; Seitentitel unverändert lassen.
- [ ] Automatische Build-Prüfung, interne Links und genauen Änderungsbericht abschließen; nichts veröffentlichen.

# Auftragsstornierung
- [x] Status-Trigger und Versandzugänge lesend prüfen: Funktion vorhanden, aber kein aktiver Trigger daran gebunden.
- [x] Ausschließlich bestehenden RESEND_API_KEY wiederverwenden; kein neues Secret oder neuer Schlüssel.
- [x] Admin-Stornierung und zwei freigegebene Fahrer-Mails mit strengem Filter umgesetzt, ohne Schema-/RLS-Änderung.
- [x] Sechs isolierte Tests, Funktionstypprüfung und automatische Build-Prüfung erfolgreich; Edge-Deployment bestätigt.
- [x] Nachweisbericht mit Grenzen der Live-Prüfung liefern.
- [ ] Authentifizierter kompletter Stornierungsablauf samt bestehendem Resend-Laufzeitzugang: externe Supabase ohne verfügbare Admin-Testsitzung; reale Testmails nicht freigegeben.
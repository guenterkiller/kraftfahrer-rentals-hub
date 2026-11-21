# Befund (nur lesend): Mails bei verbindlicher Fahrerzuweisung

Keine Änderung, kein Klick, kein Versand. Dieser Plan enthält nur den Prüfbericht; es ist keine Umsetzung vorgesehen.

## 1. Was bei der Zuweisung automatisch passiert
Reihenfolge beim Klick auf „Zuweisen" (`src/components/AdminAssignmentDialog.tsx` ca. Z. 375–420):
1. Server `admin-assign-driver/index.ts` legt die Zuweisung an, setzt den Auftrag auf „zugewiesen" und ruft **sofort serverseitig** `send-customer-assignment-notice` auf (Z. 193–220). Kundenmail = „Einsatzbestätigung durch Fahrerexpress". **Sie wartet nicht auf die Annahme des Fahrers** (Kommentar Z. 192/193 und `send-customer-assignment-notice/index.ts` Z. 63).
2. Danach im Browser `sendAssignmentNotifications` (`src/lib/assignmentNotifications.ts`): interne Bestätigung (`admin_confirm_assignment` → Auftrag „confirmed"), erneuter Aufruf der Kundenmail (nur als Absicherung), dann `send-driver-confirmation` = „VERBINDLICHES AUFTRAGSANGEBOT" mit persönlichem Annahmelink.

Ergebnis: je **eine** Mail an Fahrer und Besteller. Das passt zu Arlind Emini (Angebot, Annahme 19.11.2026 16:11) und Timberpak (Einsatzbestätigung).

## 2. „Kundenmail senden" (`src/pages/Admin.tsx` Z. 836–860, Knöpfe Z. 2076/2344)
- Ruft dieselbe Funktion `send-customer-assignment-notice` auf, **keine andere Mail**.
- Gedacht als manuelle Wiederholung bzw. Nachholung, wenn der automatische Versand fehlgeschlagen ist.
- Schutz vor Doppelversand (Z. 29–44): Gibt es für diese Zuweisung schon einen Eintrag „customer_assignment_notice / sent", wird nichts gesendet. Die Meldung lautet dann „Bereits gesendet".
- **Bei Timberpak wäre ein Klick also ohne Versand**, sofern der Versand korrekt protokolliert wurde. Das habe ich nicht in den Live-Daten nachgeprüft.

## 3. „E-Mail erneut senden" (`Admin.tsx` Z. 811–834)
- Betrifft nur die **Fahrermail** (`send-driver-confirmation`, stage „resend").
- Liegt schon eine verbindliche Annahme vor, wird nichts gesendet: „Bestehende Annahme bleibt unverändert" (Z. 105–108). **Bei Arlind Emini also kein Versand.**
- Sonst gilt: Ist das Angebot beantwortet oder beendet, wird nichts gesendet. Ist es schon zugestellt, wird ebenfalls nichts gesendet. Nur nach einem Fehlversand geht es mit demselben Link, derselben Frist und demselben gespeicherten Angebot erneut raus (Z. 110–136).

## 4. Der JSON-Kasten [FAHRERANGEBOT_V1]
Das ist die Admin-Notiz der Zuweisung (`asg.admin_note`), die wörtlich angezeigt wird (`Admin.tsx` ca. Z. 2064). Sie wird erzeugt und gelesen in `src/lib/offerReadiness.ts` bzw. `_shared/offer-readiness.ts`. Sie enthält die Satzangabe 329 €/Tag × 22 Tage. Das ist nur eine technische Darstellung, es wird nichts versendet. Kunden sehen sie nicht.

## Risiken
- **Missverständliche Beschriftung:** „Kundenmail senden" klingt nach Erstversand, ist aber eine Wiederholung mit Dublettensperre.
- **Lücke bei der Wiederholung:** Ist der automatische Kundenversand fehlgeschlagen, steht der Auftrag nach der internen Bestätigung auf „confirmed". Die Kundenfunktion verlangt aber „assigned" (Z. 68). Ein späterer Klick auf „Kundenmail senden" endet dann mit dem Fehler 409, statt nachzuholen. Es entsteht keine Dublette, aber der Kunde bekäme die Mail nie.
- **Wirksamkeit der Dublettensperre:** Sie hängt am Eintrag im Mailprotokoll. Fehlt dieser Eintrag nach einem erfolgreichen Versand, etwa durch einen Fehler beim Schreiben, wäre ein zweiter Versand möglich. Das ist unwahrscheinlich, aber nicht ausgeschlossen.
- **Technischer Text:** Der JSON-Kasten ist für Admins schwer lesbar. Das ist ein reines Anzeigethema.

## Nicht geprüft
Die Live-Einträge im Mailprotokoll zu Timberpak und Arlind Emini habe ich nicht abgefragt. Auf Wunsch kann ich sie lesend prüfen. Änderungen, etwa eine andere Beschriftung oder die Lücke bei der Wiederholung, nehme ich nur nach Freigabe vor.

# Prüfbericht MIAG Fahrzeugbau GmbH (nur gelesen, keine Änderungen)

## 1. Bewiesen aus den gespeicherten Buchungsdaten
Auftrag `6093aeaf-…`, eingegangen 09.11.2026 14:19:55 Uhr (deutsche Zeit), Fassung `auftraggeber-b598fc8b5a207da5`.

| Feld | Gespeicherter Wert |
|---|---|
| Gewählte Tarifkarte (`fahrzeugtyp`) | **LKW-Fahrer CE – Wochenpreis** |
| Tarif (`tarif_type`/`tarif_label`) | `lkw_ce_woche` / LKW-Fahrer CE – Wochenpreis, 1.645 € je Woche |
| Begründung | „Vom Besteller gewählter veröffentlichter Tarif: LKW-Fahrer CE – Wochenpreis." |
| Besonderheiten | **„Fernverkehr / Übernachtung im LKW"** |
| Zeitraum | 16.11.–23.11.2026 (8 Kalendertage) |
| Wochenendtage | Sa 21.11. (25 %), So 22.11. (50 %) |
| Unterkunft | vom Fahrer organisiert |
| Gespeicherte Kostenvorschau | 1.645 + 329 + 436,25 + 523,50 = **2.933,75 € netto**, 557,41 € USt., 3.491,16 € brutto |

Folgerung: Der Kunde hat **nicht** die Fernfahrer-Pauschale als Tarif gewählt, sondern die Karte „Wochenpreis". „Fernverkehr" ist nur als Zusatzmerkmal gespeichert. Die Admin-Vorkalkulation entspricht exakt der gespeicherten Kostenvorschau, die serverseitig berechnet und dem Kunden im Formular und in der Bestätigungsmail gezeigt wird (gleiches Modul). Die Mail selbst habe ich nicht eingesehen (es wird kein Mailinhalt gespeichert).

## 2. Warum „Fernverkehr" gespeichert ist, aber 450 € nicht gilt (Codebeleg)
- `src/lib/tarifZuordnung.ts`, `resolveTarif`: `isFern = longDistance && !isBaumaschinen && !isWoche`. Bei gewähltem Wochenpreis wird der Fernfahrertarif bewusst nie angewendet; Wochenpreis hat Vorrang.
- `src/components/SimpleBookingForm.tsx` Z. 244: Ist `longDistance` gesetzt, wird „Fernverkehr / Übernachtung im LKW" in die Besonderheiten geschrieben.
- `longDistance` lässt sich auf drei Wegen setzen: Radiokarte Fernfahrer (Z. 699–710), Feld „Fernfahrer-Pauschale" (Z. 942ff., nur bei „LKW CE" sichtbar) und die allgemeine Checkbox **„Langstreckenfahrten"** (Z. 824–830). Beim Klick auf die Wochenpreis-Karte wird `longDistance` auf false gesetzt (Z. 688).
- **Vermutung (nicht bewiesen):** Der Kunde hat die Wochenpreis-Karte gewählt und danach „Langstreckenfahrten" angehakt. Dadurch steht „Fernverkehr" in den Besonderheiten, der Tarif bleibt aber Wochenpreis. Das Formular weist auf diesen Widerspruch nicht hin – mögliche Ursache des Missverständnisses.

## 3. Preislogik Wochenpreis (bewiesen, `src/lib/kostenUebersicht.ts` Z. 96–172)
- Mo–Fr 16.–20.11. = 1 volle Woche × 1.645 €.
- **23.11. fehlt nicht**: Montag 23.11. ist der „1 Einsatztag (Mo–Fr) × 329 €" (1.645/5).
- Sa/So sind nicht im Wochenpreis enthalten und werden mit 349 € Tagessatz + 25 %/50 % berechnet (veröffentlichter Text `tarifTexte.ts` Z. 75).
- Alle 8 Kalendertage werden als Einsatztage gezählt. Eine Wochenendruhe (keine Arbeit Sa/So) kennt das Formular nicht; ohne Wochenendeinsatz wären es 1.974 € netto.

## 4. Fernfahrer-Pauschale und Zuschläge (bewiesen im Code)
- `kostenUebersicht.ts` Z. 135/175ff.: Zuschläge gelten für alle Tarife außer Event, **also auch für Fernfahrer** (450 € + 25 % = 562,50 € Sa, + 50 % = 675 € So).
- Veröffentlichter Text `tarifTexte.ts` Z. 88: „Zuzüglich An- und Abfahrt sowie gegebenenfalls veröffentlichter Zuschläge."
- Vergleich für denselben Zeitraum als Fernfahrer: 6 × 450 + 562,50 + 675 = **3.937,50 € netto** – also teurer als der berechnete Wochenpreis (2.933,75 €).
- Hinweis: Ihre gespeicherte Projektregel beschreibt die Fernfahrerpauschale als „450 €/Tag pauschal, keine Stunden/Mehrstunden". Ob Wochenendzuschläge darin enthalten sein sollen, ist dort nicht ausdrücklich geregelt; der Code berechnet sie zusätzlich. Das bitte geschäftlich entscheiden.

## 5. Empfehlungen (nur Vorschläge, nichts umgesetzt)
1. Mit dem Kunden klären, ob Wochenpreis oder Fernfahrer gemeint war, und welche Tage tatsächlich gefahren werden (Wochenendruhe?). Gespeicherte Bestätigung nicht nachträglich ändern.
2. Formular: Bei Wochenpreis + „Langstreckenfahrten" einen Hinweis zeigen bzw. den Zusatz nicht als „Fernverkehr / Übernachtung im LKW" speichern (Textänderung → Freigabe nötig).
3. Verwaltung: Hinweis anzeigen, wenn Besonderheiten „Fernverkehr" enthalten, der Tarif aber nicht Fernfahrer ist.
4. Klarstellen, ob Fernfahrer-Wochenendzuschläge gewollt sind; erst danach Text/Logik angleichen.

Keine Änderungen, keine Mails, keine Veröffentlichung.

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const FahrerVermittlungsbedingungen = () => {
  useSEO({
    title: "Vermittlungsbedingungen für Fahrer – Fahrerexpress",
    description: "Vermittlungsbedingungen für selbstständige Fahrer der Fahrerexpress-Agentur. Rechtssichere Zusammenarbeit als Subunternehmer.",
    keywords: "Vermittlungsbedingungen, Fahrer, Fahrerexpress, Subunternehmer, LKW Fahrer",
    noindex: true
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Vermittlungsbedingungen für Fahrer
          </h1>

          <Card className="mb-8">
            <CardContent className="p-6 md:p-8 space-y-8">
              
              {/* 1. Geltungsbereich */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">1. Geltungsbereich</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Diese Vermittlungsbedingungen gelten für alle Registrierungen, Auftragsangebote und Einsätze, die über die Fahrerexpress-Agentur (Günter Killer, Walther-von-Cronberg-Platz 12, 60594 Frankfurt am Main) vermittelt werden.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Mit der Registrierung als Fahrer erkennt der Fahrer diese Vermittlungsbedingungen als verbindlich an.
                </p>
              </section>

              <Separator />

              {/* 2. Rechtsstellung des Fahrers */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">2. Rechtsstellung des Fahrers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Der Fahrer handelt als selbstständiger Unternehmer und ist selbst verantwortlich für Gewerbeanmeldung, Steuern, Sozialabgaben, Versicherungen sowie seine persönliche Absicherung.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Es wird ausdrücklich <strong className="text-foreground">kein Arbeitsverhältnis</strong> begründet.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Es besteht kein Anspruch auf Einsätze oder eine Mindestvergütung. Der Fahrer kann einzelne Auftragsangebote frei annehmen oder ablehnen.
                </p>
              </section>

              <Separator />

              {/* 3. Vermittlungsmodell */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">3. Vermittlungsmodell</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Die Fahrerexpress-Agentur vermittelt Einsätze zwischen Auftraggebern und selbstständigen Fahrern und übernimmt die Einsatzkoordination.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Ein Anspruch auf Einsätze besteht nicht.
                </p>
              </section>

              <Separator />

              {/* 4. Vermittlungsanteil */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">4. Vermittlungsanteil</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Für die Kundengewinnung, Werbung, Pflege und Aktualisierung der Webseite, Bearbeitung von Anfragen, Preisgestaltung, Auftragsklärung, Organisation, Vermittlung, Einsatzkoordination, Kundenabwicklung, Rechnungsstellung und Zahlungsüberwachung erhält die Fahrerexpress-Agentur einen Vermittlungsanteil.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Dieser Vermittlungsanteil wird vom vereinbarten Netto-Auftragswert der reinen Fahrerdienstleistung abgezogen. Der Fahrer stellt Fahrerexpress seine Rechnung bereits nach Abzug dieses Vermittlungsanteils. Der Vermittlungsanteil wird also nicht nachträglich von einer vollen Fahrerrechnung einbehalten.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Für Standardeinsätze beträgt der Vermittlungsanteil in der Regel <strong className="text-foreground">20 %</strong> der mit dem Auftraggeber vereinbarten Netto-Arbeitsvergütung. Die Arbeitsvergütung umfasst insbesondere Tagessätze, Überstunden und einsatzbezogene Zuschläge.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  An- und Abfahrt, Fahrtkosten, Übernachtungskosten, Maut, Parkgebühren, Bahnkosten oder sonstige vorab freigegebene Auslagen werden gesondert behandelt und nicht vom Vermittlungsanteil gekürzt. Sie werden nur berücksichtigt, wenn sie vorab durch Fahrerexpress vereinbart oder freigegeben wurden. Nachweisbare und freigegebene Auslagen können separat erstattet oder in das konkrete Auftragsangebot eingerechnet werden.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Für Sonder-, Projekt-, Pauschal-, kurzfristige oder besonders aufwendige Einsätze kann der Vermittlungsanteil <strong className="text-foreground">bis zu 25 %</strong> betragen.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Bei Pauschal- oder Sonderaufträgen kann sich der Vermittlungsanteil auf den vereinbarten Gesamt-Einsatzwert oder die Gesamtpauschale beziehen, wenn dies im konkreten Auftragsangebot so mitgeteilt wird.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Maßgeblich ist immer das konkrete Auftragsangebot vor Einsatzbeginn. Der Fahrer entscheidet frei, ob er dieses Angebot annimmt oder ablehnt.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Ein Anspruch auf einen bestimmten Prozentsatz eines öffentlich sichtbaren Webseitenpreises besteht nicht.
                </p>
              </section>

              <Separator />

              {/* 5. Zahlung der vereinbarten Vergütung */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">5. Zahlung der vereinbarten Vergütung</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Die Zahlung der vereinbarten Vergütung erfolgt auf Grundlage einer ordnungsgemäßen Rechnung des Fahrers nach vollständiger und ordnungsgemäßer Durchführung des Einsatzes.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Soweit im konkreten Auftragsangebot nichts anderes vereinbart ist, erfolgt die Zahlung nach Zahlungseingang des Auftraggebers bei Fahrerexpress, spätestens innerhalb von 5 Werktagen danach, sofern keine berechtigten Einwendungen gegen die Leistung bestehen.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Ein Anspruch auf Vorschuss- oder Abschlagszahlungen besteht nicht.
                </p>
              </section>

              <Separator />

              {/* 6. Keine Direktabsprachen */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">6. Keine Direktabsprachen</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Der direkte Kontakt zum Auftraggeber ist nur im Rahmen des konkret freigegebenen Einsatzes und zur Durchführung des Auftrags zulässig.</li>
                  <li>Keine Preisabsprachen mit Auftraggebern.</li>
                  <li>Keine Folgeaufträge am Fahrerexpress vorbei.</li>
                  <li>Keine Weitergabe interner Einsatzdaten an Dritte.</li>
                </ul>
              </section>

              <Separator />

              {/* 7. Pflichten bei angenommenem Einsatz */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">7. Pflichten bei angenommenem Einsatz</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>pünktliches Erscheinen am Einsatzort</li>
                  <li>ordnungsgemäße Durchführung des Einsatzes</li>
                  <li>sofortige Meldung bei Problemen oder Verzögerungen</li>
                  <li>richtige und vollständige Angaben zu Qualifikationen</li>
                  <li>sorgfältiger Umgang mit Fahrzeugen, Maschinen und Kundenmaterial</li>
                </ul>
              </section>

              <Separator />

              {/* 8. Nichterscheinen / Abbruch */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">8. Nichterscheinen / Abbruch</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Bei schuldhafter Pflichtverletzung, insbesondere bei Nichterscheinen nach angenommener Einsatzbestätigung oder unberechtigtem Abbruch des Einsatzes, kann der Fahrer für daraus entstehende Schäden im gesetzlich zulässigen Umfang haften.
                </p>
              </section>

              <Separator />

              {/* 9. Sperrung */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">9. Sperrung</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Bei erheblichen Pflichtverletzungen kann Fahrerexpress den Fahrer vorübergehend oder dauerhaft von weiteren Einsatzangeboten ausschließen.
                </p>
              </section>

              <Separator />

              {/* 10. Vertragsschluss */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">10. Vertragsschluss</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Der Vertrag kommt zustande durch:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2 ml-4">
                  <li>die Registrierung als Fahrer und</li>
                  <li>die Annahme eines konkreten Auftragsangebots.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Eine gesonderte Unterschrift ist nicht erforderlich.
                </p>
              </section>

              <Separator />

              {/* 11. Gerichtsstand */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">11. Gerichtsstand</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Gerichtsstand ist – soweit gesetzlich zulässig – Frankfurt am Main.
                </p>
              </section>

              <Separator />

              {/* Kontakt */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">Kontakt</h2>
                <div className="flex flex-col sm:flex-row gap-4 text-foreground">
                  <a 
                    href="mailto:info@kraftfahrer-mieten.com" 
                    className="flex items-center gap-2 underline decoration-muted-foreground/50 hover:text-primary hover:decoration-primary transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                    info@kraftfahrer-mieten.com
                  </a>
                  <a 
                    href="tel:+4915771442285" 
                    className="flex items-center gap-2 underline decoration-muted-foreground/50 hover:text-primary hover:decoration-primary transition-colors"
                  >
                    <Phone className="h-5 w-5" />
                    01577 1442285
                  </a>
                </div>
              </section>

            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FahrerVermittlungsbedingungen;

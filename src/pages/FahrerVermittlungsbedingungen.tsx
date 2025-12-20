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
    keywords: "Vermittlungsbedingungen, Fahrer, Fahrerexpress, Subunternehmer, LKW Fahrer"
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
                  Der Fahrer handelt als selbstständiger Unternehmer.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Es wird ausdrücklich <strong className="text-foreground">kein Arbeitsverhältnis</strong> begründet.
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

              {/* 4. Abrechnung & Auszahlung */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">4. Abrechnung & Auszahlung</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Die Abrechnung der Einsätze erfolgt über die Fahrerexpress-Agentur.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Die Auszahlung an den Fahrer erfolgt erst nach vollständigem Zahlungseingang des Auftraggebers bei der Fahrerexpress-Agentur und spätestens innerhalb von 5 Werktagen danach.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Ein Anspruch auf Vorschuss- oder Abschlagszahlungen besteht nicht.
                </p>
              </section>

              <Separator />

              {/* 5. Direktbeauftragungen */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">5. Direktbeauftragungen</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Direkte Beauftragungen durch Auftraggeber, die über Fahrerexpress vermittelt wurden, sind im sachlichen Zusammenhang mit dem jeweiligen Projekt unzulässig.
                </p>
              </section>

              <Separator />

              {/* 6. Vertragsschluss */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">6. Vertragsschluss</h2>
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

              {/* 7. Gerichtsstand */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">7. Gerichtsstand</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Gerichtsstand ist – soweit gesetzlich zulässig – Frankfurt am Main.
                </p>
              </section>

              <Separator />

              {/* Kontakt */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">Kontakt</h2>
                <div className="flex flex-col sm:flex-row gap-4 text-muted-foreground">
                  <a 
                    href="mailto:info@kraftfahrer-mieten.com" 
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                    info@kraftfahrer-mieten.com
                  </a>
                  <a 
                    href="tel:+4915771442285" 
                    className="flex items-center gap-2 hover:text-primary transition-colors"
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

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const Vermittlungsbedingungen = () => {
  useSEO({
    title: "Vermittlungsbedingungen für Auftraggeber – Fahrerexpress",
    description: "Vermittlungsbedingungen für Auftraggeber der Fahrerexpress-Agentur. Rechtssichere Vermittlung selbstständiger LKW-Fahrer.",
    keywords: "Vermittlungsbedingungen, Auftraggeber, Fahrerexpress, LKW Fahrer Vermittlung"
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Vermittlungsbedingungen für Auftraggeber
          </h1>

          <Card className="mb-8">
            <CardContent className="p-6 md:p-8 space-y-8">
              
              {/* 1. Geltungsbereich */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">1. Geltungsbereich</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Diese Vermittlungsbedingungen gelten für alle Anfragen, Buchungen und Aufträge von Fahrerdienstleistungen über die Fahrerexpress-Agentur (Günter Killer, Walther-von-Cronberg-Platz 12, 60594 Frankfurt am Main).
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Mit der Bestellung eines Fahrers erkennt der Auftraggeber diese Vermittlungsbedingungen als verbindlich an.
                </p>
              </section>

              <Separator />

              {/* 2. Vertragsmodell */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">2. Vertragsmodell</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Die Fahrerexpress-Agentur vermittelt ausschließlich selbstständige, gewerblich tätige Fahrer.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Es handelt sich ausdrücklich <strong className="text-foreground">nicht</strong> um Arbeitnehmerüberlassung, Personalgestellung oder ein arbeitsrechtliches Vertragsverhältnis.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Der Einsatz erfolgt auf Grundlage eines projektbezogenen Dienst- oder Werkvertrags.
                </p>
              </section>

              <Separator />

              {/* 3. Rolle der Fahrerexpress-Agentur */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">3. Rolle der Fahrerexpress-Agentur</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Fahrerexpress fungiert als Vermittlungs- und Koordinationsagentur.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Die Einsatzkoordination sowie die Abrechnung erfolgen ausschließlich über Fahrerexpress, insbesondere aus Gründen der Qualitätssicherung und der ordnungsgemäßen Dokumentation.
                </p>
              </section>

              <Separator />

              {/* 4. Abwicklung & Abrechnung */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">4. Abwicklung & Abrechnung</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Die Abrechnung der beauftragten Einsätze erfolgt über die Fahrerexpress-Agentur.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Der Auftraggeber erhält eine Rechnung über die vereinbarten Leistungen.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Direkte Beauftragungen von durch Fahrerexpress vermittelten Fahrern im sachlichen Zusammenhang mit dem jeweiligen Projekt sind unzulässig.
                </p>
              </section>

              <Separator />

              {/* 5. Zahlungsbedingungen */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">5. Zahlungsbedingungen</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Rechnungen sind innerhalb von 7 Kalendertagen ab Rechnungsdatum ohne Abzug zu begleichen.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Es gelten die gesetzlichen Regelungen zum Zahlungsverzug gemäß § 288 BGB.
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
                  <li>die Bestellung eines Fahrers durch den Auftraggeber (z. B. per Formular, E-Mail oder Telefon) und</li>
                  <li>die Bestätigung durch die Fahrerexpress-Agentur.</li>
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
                  Gerichtsstand für alle Streitigkeiten aus Vertragsverhältnissen, die diesen Vermittlungsbedingungen unterliegen, ist – soweit gesetzlich zulässig – Frankfurt am Main.
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

export default Vermittlungsbedingungen;

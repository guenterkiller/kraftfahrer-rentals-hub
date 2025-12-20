import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Scale, Clock, Building2 } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const Vermittlungsbedingungen = () => {
  useSEO({
    title: "Vermittlungsbedingungen für Auftraggeber – Fahrerexpress",
    description: "Vermittlungsbedingungen für Auftraggeber bei Fahrerexpress. Selbstständige Fahrer, zentrale Abwicklung, klare Zahlungsbedingungen.",
    keywords: "Vermittlungsbedingungen, Auftraggeber, Fahrerexpress, LKW Fahrer Vermittlung, Zahlungsbedingungen"
  });

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Startseite
            </Link>
          </Button>

          <h1 className="text-3xl font-bold text-center mb-8">
            Vermittlungsbedingungen für Auftraggeber
          </h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Geltungsbereich
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Diese Vermittlungsbedingungen gelten für alle Aufträge und Bestellungen von 
                Fahrer-Dienstleistungen über die Fahrerexpress-Agentur (Günter Killer, 
                Walther-von-Cronberg-Platz 12, 60594 Frankfurt am Main).
              </p>
              <p>
                Mit der Bestellung eines Fahrers akzeptiert der Auftraggeber diese 
                Vermittlungsbedingungen.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-6 w-6 text-primary" />
                Vertragsmodell
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="font-semibold">
                  Wichtiger Hinweis: Es handelt sich ausdrücklich nicht um Arbeitnehmerüberlassung.
                </p>
              </div>
              <p>
                Die von Fahrerexpress vermittelten Fahrer sind <strong>selbstständige Unternehmer</strong>, 
                die ihre Leistung auf Basis eines Dienst- oder Werkvertrags erbringen.
              </p>
              <p>
                Fahrerexpress fungiert als Vermittlungsagentur und übernimmt die 
                Einsatzkoordination und Abrechnung aus Gründen der Qualitätssicherung.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Abwicklung und Abrechnung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2">
                <li>
                  Die Abrechnung erfolgt <strong>ausschließlich über Fahrerexpress</strong>.
                </li>
                <li>
                  Der Auftraggeber erhält eine übersichtliche Rechnung für alle 
                  beauftragten Einsätze.
                </li>
                <li>
                  Direktvereinbarungen zwischen Auftraggeber und vermittelten Fahrern 
                  außerhalb der Fahrerexpress-Plattform sind während der Projektlaufzeit 
                  und für einen angemessenen Zeitraum danach nicht gestattet.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Zahlungsbedingungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Zahlungsziel:</strong> 7 Kalendertage nach Rechnungsstellung
                </li>
                <li>
                  Die Rechnung gilt nach Ablauf der Zahlungsfrist als anerkannt, 
                  sofern keine schriftlichen Einwände erfolgen.
                </li>
                <li>
                  Bei Zahlungsverzug werden Verzugszinsen gemäß § 288 BGB berechnet.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Transparente Preise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Sie erhalten transparente Tagessätze ohne versteckte Kosten:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>LKW CE-Fahrer: 349 €/Tag (netto)</li>
                <li>Baumaschinenführer: 459 €/Tag (netto)</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Weitere Konditionen (z.B. für längere Einsätze) auf Anfrage.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Gerichtsstand</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Gerichtsstand für alle Streitigkeiten aus Verträgen, die diesen 
                Vermittlungsbedingungen unterliegen, ist <strong>Frankfurt am Main</strong>.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Vertragsschluss</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Der Vertrag kommt zustande durch:
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Bestellung durch den Auftraggeber (Formular, E-Mail, Telefon)</li>
                <li>Schriftliche Bestätigung durch Fahrerexpress</li>
              </ol>
              <p className="text-sm text-muted-foreground">
                Mit der Bestellung akzeptiert der Auftraggeber diese Vermittlungsbedingungen. 
                Eine gesonderte Unterschrift ist nicht erforderlich.
              </p>
            </CardContent>
          </Card>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
            <p className="mb-4">
              Bei Fragen zu den Vermittlungsbedingungen stehen wir Ihnen gerne zur Verfügung:
            </p>
            <p>
              <a href="mailto:info@kraftfahrer-mieten.com" className="text-primary hover:underline font-medium">
                info@kraftfahrer-mieten.com
              </a>
              {" | "}
              <a href="tel:+4915771442285" className="text-primary hover:underline font-medium">
                01577 1442285
              </a>
            </p>
          </div>

          <div className="text-center pt-8">
            <Button asChild size="lg">
              <Link to="/#fahreranfrage">
                Jetzt Fahrer anfragen
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Vermittlungsbedingungen;

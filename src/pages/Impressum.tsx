import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const Impressum = () => {
  useSEO({
    title: "Impressum | Fahrerexpress-Agentur Frankfurt",
    description: "Impressum der Fahrerexpress-Agentur Frankfurt. Kontaktdaten, Geschäftsführung und rechtliche Angaben gemäß TMG.",
    keywords: "Impressum Fahrerexpress, Kontakt Frankfurt, Günter Killer, Fahrerexpress-Agentur",
    noindex: true
  });
  return (
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Zurück zur Startseite
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Impressum</CardTitle>
              <p className="text-muted-foreground">gemäß § 5 TMG</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Angaben gemäß § 5 Telemediengesetz (TMG):</h3>
                
                <div className="space-y-2">
                  <p className="font-semibold">Günter Killer</p>
                  <p>Fahrerexpress-Agentur</p>
                  <p className="text-sm text-muted-foreground">
                    Selbstständiger Berufskraftfahrer (C+E) – deutschlandweit im Einsatz
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Adresse:</h4>
                <p>Walther-von-Cronberg-Platz 12</p>
                <p>60594 Frankfurt am Main</p>
                <p>Deutschland</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Kontakt:</h4>
                <p>Mobil: +49 (0)1577 1442285</p>
                <p>E-Mail: info@kraftfahrer-mieten.com</p>
                <p>Web: www.kraftfahrer-mieten.com</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Umsatzsteuer-Identifikationsnummer:</h4>
                <p>gemäß § 27a Umsatzsteuergesetz: DE207642217</p>
              </div>
              
              <div className="pt-6 border-t">
                <h4 className="font-semibold mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</h4>
                <p>Günter Killer</p>
                <p>Walther-von-Cronberg-Platz 12</p>
                <p>60594 Frankfurt am Main</p>
              </div>
              
              <div className="pt-6 border-t">
                <h4 className="font-semibold mb-2">Tätigkeitsbeschreibung:</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Selbstständige Durchführung von Fahrdienstleistungen im gesamten Bundesgebiet. Einsatz erfolgt flexibel nach Auftrag und Fahrzeugart – ohne Einschränkung auf bestimmte Fahrzeugtypen.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Keine Güter- oder Personenbeförderung im eigenen Namen. Keine Vermittlungstätigkeit.
                </p>
              </div>
              
              <div className="pt-6 border-t">
                <h4 className="font-semibold mb-2">Haftungsausschluss:</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehme ich jedoch keine Gewähr. Als Diensteanbieter bin ich gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG bin ich als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.
                </p>
              </div>
              
              <div className="pt-6 border-t">
                <h4 className="font-semibold mb-2">Streitschlichtung:</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                </p>
                <p className="text-sm text-muted-foreground">
                  <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    https://ec.europa.eu/consumers/odr
                  </a>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Ich bin nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Impressum;
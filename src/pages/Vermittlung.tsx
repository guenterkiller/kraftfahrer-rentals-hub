import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Euro, Clock, Users } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const Vermittlung = () => {
  useSEO({
    title: "Fahrervermittlung deutschlandweit – LKW Fahrer bundesweit",
    description: "Fahrervermittlung deutschlandweit – selbstständige Berufskraftfahrer bundesweit. Vermittlung selbstständiger Unternehmer auf Basis eines Dienst- oder Werkvertrags.",
    keywords: "Fahrervermittlung deutschlandweit, selbstständige Fahrer bundesweit, LKW Fahrer Vermittlung deutschlandweit, Fahrerservice bundesweit, Subunternehmer Fahrer deutschlandweit, Fahrer buchen ohne Arbeitnehmerüberlassung"
  });
  return (
    <div className="min-h-screen bg-muted">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Startseite
            </Link>
          </Button>

          <h1 className="text-3xl font-bold text-center mb-6">Fahrervermittlung deutschlandweit</h1>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <Users className="h-8 w-8" />
                Vermittlungsmodell
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground">
                Die Fahrerexpress-Agentur vermittelt selbstständige Unternehmer für Fahrerdienstleistungen.
                Die Einsätze werden zentral über die Agentur koordiniert und abgerechnet.
                Es handelt sich nicht um Arbeitnehmerüberlassung.
              </p>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Für Auftraggeber
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Sie erhalten eine übersichtliche Rechnung direkt von der Fahrerexpress-Agentur. Die Einsätze werden über uns gebündelt abgerechnet. Die Vergütung erfolgt transparent auf Basis der vereinbarten Tages- und Nebenkosten.
                  </p>
                  <p>
                    Sie erhalten transparente und klar definierte Tagessätze (z.&nbsp;B. LKW CE-Fahrer ab 349&nbsp;€, Baumaschinenführer ab 459&nbsp;€).
                  </p>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <p className="font-semibold">
                      Die Fahrer arbeiten als selbstständige Unternehmer mit eigenem Gewerbe auf Basis eines Dienst- oder Werkvertrags. Es erfolgt keine Arbeitnehmerüberlassung.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Für Fahrer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Als selbstständiger Fahrer erhalten Sie Zugang zu passenden Aufträgen entsprechend Ihrer Qualifikation und Verfügbarkeit.
                  </p>
                  
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm">
                      Details zur Zusammenarbeit für Fahrer (Vergütung, Vermittlungsbedingungen, Abrechnung) werden nach Registrierung im Partnerbereich bzw. per E-Mail bereitgestellt.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gibt es eine Mindestlaufzeit?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Nein. Sie können Ihre Teilnahme jederzeit beenden. Es entstehen keine Fixkosten oder Verpflichtungen.
                  </p>
                </CardContent>
              </Card>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm">
                  Für Rückfragen zur Abrechnung stehen wir Ihnen gerne zur Verfügung:{" "}
                  <a href="mailto:info@kraftfahrer-mieten.com" className="text-primary hover:underline">
                    info@kraftfahrer-mieten.com
                  </a>
                </p>
              </div>

              <div className="text-center pt-6">
                <Button asChild size="lg">
                  <Link to="/fahrer-registrierung">
                    Jetzt als selbstständiger Fahrer registrieren
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Vermittlung;
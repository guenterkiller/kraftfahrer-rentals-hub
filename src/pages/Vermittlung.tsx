import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Euro, Clock, Users } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const Vermittlung = () => {
  useSEO({
    title: "Vermittlung & Provision für selbstständige Fahrer | Fahrerexpress",
    description: "Transparente Vermittlungskosten: 15% Provision nur bei erfolgreichem Einsatz. Keine Fixkosten, keine Mindestlaufzeit für Kraftfahrer.",
    keywords: "Vermittlungsprovision, Fahrer Provision, Vermittlungskosten selbstständige Fahrer, 15 Prozent Provision"
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

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center flex items-center justify-center gap-2">
                <Users className="h-8 w-8" />
                Vermittlung & Provision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground">
                Wenn Sie sich über unsere Seite als selbstständiger Fahrer eintragen, vermitteln wir Sie an Auftraggeber in ganz Deutschland.
              </p>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="h-5 w-5" />
                    Was kostet das?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-semibold mb-3">Vermittlungskosten für Fahrer</h3>
                  <p className="mb-3">
                    Für die erfolgreiche Vermittlung eines Einsatzes berechnen wir <strong>nur dem vermittelten Fahrer</strong> eine Provision in Höhe von <strong>15 % des Nettohonorars</strong>. Die Vermittlung ist für Auftraggeber vollständig kostenlos.
                  </p>
                  <p>
                    Die Provision wird ausschließlich bei tatsächlichem Einsatz fällig und kann entweder per Einbehalt oder separater Rechnung abgerechnet werden.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Wie läuft die Abrechnung?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Die Provision wird nach Einsatzabschluss per Rechnung gestellt – entweder pro Auftrag oder gesammelt am Monatsende.
                  </p>
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

              <Card>
                <CardHeader>
                  <CardTitle>Was ist nicht provisionspflichtig?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Direktaufträge außerhalb unserer Vermittlung</li>
                    <li>Einsätze ohne vorherige Abstimmung mit Fahrerexpress</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm">
                  Für Rückfragen zur Abrechnung stehen wir Ihnen jederzeit zur Verfügung:{" "}
                  <a href="mailto:info@kraftfahrer-mieten.com" className="text-primary hover:underline">
                    info@kraftfahrer-mieten.com
                  </a>
                </p>
              </div>

              <div className="text-center pt-6">
                <Button asChild size="lg">
                  <Link to="/fahrerregistrierung">
                    Jetzt als Fahrer registrieren
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
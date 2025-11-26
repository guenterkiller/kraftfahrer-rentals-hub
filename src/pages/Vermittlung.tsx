import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Euro, Clock, Users } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const Vermittlung = () => {
  useSEO({
    title: "Vermittlungsmodell – Ersatzfahrer kurzfristig mieten | Fahrerexpress",
    description: "Transparentes Vermittlungsmodell für selbstständige Fahrer. Auftraggeber zahlen Fahrer direkt, wir vermitteln kompetente Partner.",
    keywords: "Fahrervermittlung, selbstständige Fahrer, Fahrerservice, ersatzfahrer vermittlung"
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
                Vermittlungsmodell
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground">
                Fahrerexpress vermittelt selbstständige Fahrer an Auftraggeber in ganz Deutschland. Wir bringen kompetente Partner zusammen.
              </p>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Für Fahrer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <p className="font-semibold">
                      Für Fahrer gelten transparente Vermittlungsbedingungen, die nach Registrierung bereitgestellt werden.
                    </p>
                  </div>
                  
                  <p>
                    Als selbstständiger Fahrer erhalten Sie Zugang zu qualifizierten Aufträgen in Ihrer Region.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Abrechnungsmodell
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p>
                    <strong>Für den Auftraggeber:</strong> Sie erhalten eine einzige Rechnung direkt von Fahrerexpress. Wir kümmern uns um die Abwicklung – Sie haben keinen Mehraufwand.
                  </p>
                  <p>
                    <strong>Für den Fahrer:</strong> Sie erhalten nach erfolgreichem Einsatz Ihre Vergütung transparent und zuverlässig.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Rechtsgrundlage:</strong> Vermittlungsvertrag nach § 652 BGB zwischen Fahrerexpress und Fahrer. Der Fahrer erbringt seine Leistung als selbstständiger Subunternehmer gegenüber dem Auftraggeber.
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
                  <Link to="/fahrer-registrierung">
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
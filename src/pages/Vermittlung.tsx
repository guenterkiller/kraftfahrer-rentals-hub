import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Euro, Clock, Users } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const Vermittlung = () => {
  useSEO({
    title: "Vermittlung & Provision – Ersatzfahrer kurzfristig mieten | Fahrerexpress",
    description: "Transparente Vermittlungskosten: 15% Provision nur bei erfolgreichem Einsatz. Keine Fixkosten, keine Mindestlaufzeit für Kraftfahrer und Ersatzfahrer.",
    keywords: "Vermittlungsprovision, Fahrer Provision, Vermittlungskosten selbstständige Fahrer, 15 Prozent Provision, ersatzfahrer kosten"
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
                    Vermittlungsgebühr für Fahrer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Für jeden erfolgreichen Einsatz berechnet die Fahrerexpress-Agentur eine Vermittlungsgebühr an den Fahrer.
                  </p>
                  
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Die Vermittlungsgebühr beträgt:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-semibold">•</span>
                        <span><strong>15 % des Gesamthonorars</strong> bei LKW CE Fahrern</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-semibold">•</span>
                        <span><strong>20 % des Gesamthonorars</strong> bei Baumaschinenführern</span>
                      </li>
                    </ul>
                  </div>

                  <p className="text-sm">
                    Das Gesamthonorar umfasst die Tagespauschale laut Website inklusive berechtigter Nebenkosten (Kilometer, Übernachtung, Spesen, Mehrstunden).
                  </p>

                  <p className="font-semibold">
                    Die Vermittlung ist für Auftraggeber kostenlos.
                  </p>

                  <p>
                    Die Vermittlungsgebühr wird ausschließlich bei tatsächlichem Einsatz fällig.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Abrechnung der Provision
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p>
                    Der Fahrer stellt seine Rechnung an die Fahrerexpress-Agentur <strong>abzüglich der Vermittlungsgebühr</strong>.
                  </p>
                  <p>
                    Die Provision wird direkt einbehalten oder alternativ per separater Provisionsrechnung abgerechnet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Rechtsgrundlage:</strong> Vermittlungsvertrag nach § 652 BGB (Maklervertrag) zwischen Fahrerexpress und Fahrer. Der Fahrer erbringt seine Leistung als selbstständiger Subunternehmer gegenüber dem Auftraggeber im Rahmen eines Werk-/Dienstvertrags.
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

              <Card>
                <CardHeader>
                  <CardTitle>Abgrenzung zur Arbeitnehmerüberlassung</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Die Beauftragung selbstständiger Fahrer ist keine Arbeitnehmerüberlassung, wenn folgende Kriterien erfüllt sind:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-semibold">✓</span>
                      <span>Der Fahrer erbringt die Leistung als selbstständiger Unternehmer auf Basis eines Dienst-/Werkvertrags</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-semibold">✓</span>
                      <span>Das Fahrzeug wird vom Auftraggeber gestellt, die Fahrleistung erfolgt jedoch eigenverantwortlich</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-semibold">✓</span>
                      <span>Der Fahrer bleibt weisungsunabhängig in der Ausführung und trägt ein eigenes Unternehmerrisiko</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-semibold">✓</span>
                      <span>Der Fahrer kann eigene Arbeitskräfte/Subunternehmer einsetzen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-semibold">✓</span>
                      <span>Keine Eingliederung in die Betriebsorganisation des Auftraggebers</span>
                    </li>
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
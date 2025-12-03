import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const FahrerInfos = () => {
  useSEO({
    title: "Interner Bereich für Partner | Fahrerexpress",
    description: "Informationen für registrierte Partner und Fahrer"
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
                <Lock className="h-8 w-8" />
                Interner Informationsbereich
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
                <p className="text-lg font-semibold mb-4">
                  Interner Informationsbereich für registrierte Fahrer
                </p>
                <p className="text-muted-foreground">
                  Die Inhalte sind nur für Partner bestimmt und werden nach erfolgreicher Registrierung bereitgestellt.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Inhalte für registrierte Partner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    Nach Ihrer erfolgreichen Registrierung als Fahrer erhalten Sie Zugang zu:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Detaillierte Informationen zur Vergütung und Abrechnung</li>
                    <li>Vermittlungsbedingungen und Provisionsstruktur</li>
                    <li>Rechtliche Rahmenbedingungen der Zusammenarbeit</li>
                    <li>Erwartungen und Anforderungen an selbstständige Fahrer</li>
                    <li>Vertragsunterlagen und Dokumentation</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Interne Subunternehmer-Vereinbarung */}
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-xl">📋 Subunternehmer-Vereinbarung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">Status</h4>
                    <p className="text-muted-foreground text-sm">Der Fahrer bestätigt, als selbstständiger Unternehmer tätig zu sein und alle gesetzlichen Pflichten (Versicherung, Steuern, Berufsrisiken) selbst zu tragen.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Einsatzannahme</h4>
                    <p className="text-muted-foreground text-sm">Mit Annahme eines Einsatzes entsteht eine verbindliche Leistungspflicht gegenüber der Fahrerexpress-Agentur.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Vergütung</h4>
                    <p className="text-muted-foreground text-sm">Der Fahrer erhält die vereinbarte Vergütung abzüglich der Vermittlungsgebühr (15 % LKW / 20 % Baumaschinen).</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Pflichten</h4>
                    <ul className="text-muted-foreground text-sm list-disc list-inside ml-2 space-y-1">
                      <li>pünktliche und vollständige Durchführung des Einsatzes</li>
                      <li>sofortige Meldung bei Problemen</li>
                      <li>Geheimhaltung aller Einsatz- und Kundendaten</li>
                      <li>Durchführung des Einsatzes ausschließlich in eigener Person</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Nichterscheinen</h4>
                    <p className="text-muted-foreground text-sm">Bei Nichterscheinen haftet der Fahrer im Innenverhältnis für alle Schäden, die der Fahrerexpress-Agentur entstehen, einschließlich: Ersatzfahrer, Vertragsstrafen, Fehlzeiten, Ausfallkosten, Forderungen des Auftraggebers.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Verbot der Direktakquise</h4>
                    <p className="text-muted-foreground text-sm">Direktaufträge oder Folgeaufträge mit Auftraggebern sind ohne schriftliche Zustimmung der Agentur nicht zulässig.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Beendigung</h4>
                    <p className="text-muted-foreground text-sm">Die Agentur kann die Zusammenarbeit jederzeit beenden.</p>
                  </div>
                </CardContent>
              </Card>

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

export default FahrerInfos;

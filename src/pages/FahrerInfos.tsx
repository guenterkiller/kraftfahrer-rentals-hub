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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Impressum = () => {
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
                <h3 className="font-semibold text-lg mb-4">Angaben gemäß § 5 TMG:</h3>
                
                <div className="space-y-2">
                  <p className="font-semibold">Günter Killer</p>
                  <p>Fahrerexpress-Agentur</p>
                  <p className="text-sm text-muted-foreground">
                    Selbstständiger C+E-Fahrer · Fahrmischerfahrer · Mischmeister für Flüssigboden
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Adresse:</h4>
                <p>Walther-von-Cronberg-Platz 12</p>
                <p>60594 Frankfurt am Main</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Kontakt:</h4>
                <p>Mobil: 01577 1442285</p>
                <p>E-Mail: info@kraftfahrer-mieten.com</p>
                <p>Website: www.kraftfahrer-mieten.com</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Umsatzsteuer-Identifikationsnummer:</h4>
                <p>gemäß § 27a UStG: DE207642217</p>
              </div>
              
              <div className="pt-6 border-t">
                <h4 className="font-semibold mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</h4>
                <p>Günter Killer</p>
                <p>Walther-von-Cronberg-Platz 12</p>
                <p>60594 Frankfurt am Main</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Impressum;
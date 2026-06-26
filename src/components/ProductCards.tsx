import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Droplets } from "lucide-react";
import { Link } from "react-router-dom";

const ProductCards = () => {
  const scrollToForm = () => {
    const element = document.querySelector('#fahreranfrage');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <Badge variant="secondary" className="mb-4">Transparent & Fair</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Unsere Dienstleistungen & Preise
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            Preise verstehen sich netto zzgl. MwSt. – zusätzlich An- und Abfahrt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">

          {/* LKW-Fahrer CE */}
          <Card className="bg-card border border-border border-t-4 border-t-red-600 hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader className="pb-2 min-h-[64px]">
              <h3 className="text-base font-semibold leading-tight break-words hyphens-auto text-foreground">LKW-Fahrer CE</h3>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 pt-0 text-center">
              <div className="mb-4 pb-4 border-b border-border space-y-2">
                <div className="text-4xl font-bold text-foreground">349 €</div>
                <p className="text-sm font-medium text-foreground">pro Einsatztag</p>
                <p className="text-xs text-muted-foreground">Einsatzdauer bis max. 9 Stunden je Einsatztag</p>
                <p className="text-xs text-muted-foreground">Zusätzlich: An- und Abfahrt</p>
              </div>
              <Button
                onClick={scrollToForm}
                className="w-full h-11 text-sm font-semibold bg-red-700 hover:bg-red-800 text-white mt-auto"
              >
                LKW-Fahrer anfragen
              </Button>
            </CardContent>
          </Card>

          {/* LKW-Fahrer CE – Wochenpreis */}
          <Card className="relative bg-card border border-border border-t-4 border-t-red-600 ring-1 ring-red-200 hover:shadow-lg transition-shadow flex flex-col h-full">
            <span className="absolute -top-2.5 right-3 z-10 bg-red-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
              Planbar buchen
            </span>
            <CardHeader className="pb-2 min-h-[64px]">
              <h3 className="text-base font-semibold leading-tight break-words hyphens-auto text-foreground">LKW-Fahrer CE – Wochenpreis</h3>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 pt-0 text-center">
              <div className="mb-4 pb-4 border-b border-border space-y-2">
                <div className="text-4xl font-bold text-foreground">1.645 €</div>
                <p className="text-sm font-medium text-foreground">pro Woche</p>
                <p className="text-xs text-muted-foreground">Nur für LKW-Fahrer CE: 5 Einsatztage</p>
                <p className="text-xs text-muted-foreground">Zusätzlich: An- und Abfahrt</p>
              </div>
              <Button
                onClick={scrollToForm}
                className="w-full h-11 text-sm font-semibold bg-red-700 hover:bg-red-800 text-white mt-auto"
              >
                Woche anfragen
              </Button>
            </CardContent>
          </Card>

          {/* Fernfahrer-Pauschale */}
          <Card className="bg-card border border-border border-t-4 border-t-green-600 hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader className="pb-2 min-h-[64px]">
              <h3 className="text-base font-semibold leading-tight break-words hyphens-auto text-foreground">Fernfahrer-Pauschale</h3>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 pt-0 text-center">
              <div className="mb-4 pb-4 border-b border-border space-y-2">
                <div className="text-4xl font-bold text-foreground">450 €</div>
                <p className="text-sm font-medium text-foreground">pro Einsatztag</p>
                <p className="text-xs text-muted-foreground">Gültig für: 1 Fernverkehrs-Einsatztag</p>
                <p className="text-xs text-muted-foreground">Zusätzlich: An- und Abfahrt</p>
              </div>
              <Button
                onClick={scrollToForm}
                className="w-full h-11 text-sm font-semibold bg-green-700 hover:bg-green-800 text-white mt-auto"
              >
                Fernfahrer anfragen
              </Button>
            </CardContent>
          </Card>

          {/* Baumaschinenführer / Mischmeister */}
          <Card className="bg-card border border-border border-t-4 border-t-orange-500 hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader className="pb-2 min-h-[64px]">
              <h3 className="text-base font-semibold leading-tight break-words hyphens-auto text-foreground">Baumaschinenführer / Mischmeister</h3>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 pt-0 text-center">
              <div className="mb-4 pb-4 border-b border-border space-y-2">
                <div className="text-4xl font-bold text-foreground">489 €</div>
                <p className="text-sm font-medium text-foreground">pro Einsatztag</p>
                <p className="text-xs text-muted-foreground">Gültig für: bis 8 Stunden</p>
                <p className="text-xs text-muted-foreground">Zusätzlich: An- und Abfahrt</p>
              </div>
              <Button
                onClick={scrollToForm}
                className="w-full h-11 text-xs sm:text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white mt-auto whitespace-normal leading-tight px-2"
              >
                Baumaschinen / Mischmeister anfragen
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Mischmeister Flüssigboden Link */}
        <div className="text-center mt-8 mb-8">
          <Link
            to="/fluessigboden-service"
            className="text-primary underline decoration-primary/50 hover:decoration-primary transition-colors inline-flex items-center gap-2"
          >
            <Droplets className="h-4 w-4" />
            Mischmeister für Flüssigboden – bundesweit buchbar →
          </Link>
        </div>

        {/* Abrechnungsmodell-Hinweis */}
        <Card className="max-w-7xl mx-auto mt-4 border-l-4 border-l-primary animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 p-2 h-fit rounded-lg bg-primary/10">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">
                  Eine Rechnung – Kein Mehraufwand für Sie
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong>Sie erhalten immer nur eine Rechnung direkt von Fahrerexpress – ohne zusätzliche Fahrerabrechnungen.</strong>
                  {' '}Der Fahrer stellt seine Rechnung an uns. Abrechnungsmodell: Agenturabrechnung (Dienst-/Werkleistung durch selbstständige Subunternehmer, keine Arbeitnehmerüberlassung).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProductCards;

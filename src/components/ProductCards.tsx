import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Check, Construction, Droplets } from "lucide-react";
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">

          {/* LKW-Fahrer CE */}
          <Card className="relative overflow-hidden border-2 border-red-200 bg-red-50/60 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-red-600 shadow-lg flex-shrink-0">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-tight text-red-900">LKW-Fahrer CE</h3>
                  <p className="text-xs text-muted-foreground">Bundesweit verfügbar</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="mb-4 pb-4 border-b border-border text-center">
                <div className="text-4xl font-bold text-red-700">349 €</div>
                <p className="text-sm text-red-800 font-medium">pro Einsatztag</p>
                <p className="text-xs text-red-700 mt-2">Gültig für: bis 10 Stunden</p>
                <p className="text-xs text-red-700 mt-1">Zusätzlich: An- und Abfahrt</p>
              </div>
              <Button
                onClick={scrollToForm}
                className="w-full h-11 text-sm font-semibold bg-red-700 hover:bg-red-800 text-white shadow-lg mt-auto"
                size="lg"
              >
                LKW-Fahrer anfragen
              </Button>
            </CardContent>
          </Card>

          {/* LKW-Fahrer CE – Wochenpreis */}
          <Card className="relative overflow-hidden border border-red-200 bg-red-50/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <span className="absolute top-2 right-2 z-10 bg-red-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
              Planbar &amp; günstiger
            </span>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-red-500 shadow-lg flex-shrink-0">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 pr-16">
                  <h3 className="text-lg font-semibold leading-tight text-red-900">LKW-Fahrer CE – Wochenpreis</h3>
                  <p className="text-xs text-muted-foreground">5 Einsatztage planbar</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="mb-4 pb-4 border-b border-border text-center">
                <div className="text-4xl font-bold text-red-700">1.645 €</div>
                <p className="text-sm text-red-800 font-medium">pro Woche</p>
                <p className="text-xs text-red-700 mt-2">Nur für LKW-Fahrer CE: 5 Einsatztage à bis 10 Stunden</p>
                <p className="text-xs text-red-700 mt-1">Zusätzlich: An- und Abfahrt</p>
              </div>
              <Button
                onClick={scrollToForm}
                className="w-full h-11 text-sm font-semibold bg-red-700 hover:bg-red-800 text-white shadow-lg mt-auto"
                size="lg"
              >
                Woche anfragen
              </Button>
            </CardContent>
          </Card>

          {/* Fernfahrer-Pauschale */}
          <Card className="relative overflow-hidden border-2 border-green-200 bg-green-50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-green-600 shadow-lg flex-shrink-0">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-tight text-green-900">Fernfahrer-Pauschale</h3>
                  <p className="text-xs text-muted-foreground">Fernverkehrseinsatz</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="mb-4 pb-4 border-b border-border text-center">
                <div className="text-4xl font-bold text-green-700">450 €</div>
                <p className="text-sm text-green-800 font-medium">pro Einsatztag</p>
                <p className="text-xs text-green-700 mt-2">Gültig für: 1 Fernverkehrs-Einsatztag</p>
                <p className="text-xs text-green-700 mt-1">Zusätzlich: An- und Abfahrt</p>
              </div>
              <Button
                onClick={scrollToForm}
                className="w-full h-11 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg mt-auto"
                size="lg"
              >
                Fernfahrer anfragen
              </Button>
            </CardContent>
          </Card>

          {/* Baumaschinenführer / Mischmeister */}
          <Card className="relative overflow-hidden border-2 border-orange-200 bg-orange-50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-orange-600 shadow-lg flex-shrink-0">
                  <Construction className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-tight text-orange-900">Baumaschinenführer / Mischmeister</h3>
                  <p className="text-xs text-muted-foreground">Deutschlandweit verfügbar</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="mb-4 pb-4 border-b border-border text-center">
                <div className="text-4xl font-bold text-orange-700">489 €</div>
                <p className="text-sm text-orange-800 font-medium">pro Einsatztag</p>
                <p className="text-xs text-orange-700 mt-2">Gültig für: bis 8 Stunden</p>
                <p className="text-xs text-orange-700 mt-1">Zusätzlich: An- und Abfahrt</p>
              </div>
              <Button
                onClick={scrollToForm}
                className="w-full h-11 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-lg mt-auto"
                size="lg"
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

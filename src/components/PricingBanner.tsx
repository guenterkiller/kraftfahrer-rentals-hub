import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const PricingBanner = () => {
  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.querySelector('#fahreranfrage');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Transparente Festpreise – Keine versteckten Kosten
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Faire Konditionen für LKW CE Fahrer und Baumaschinenführer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto mb-8">
          {/* LKW CE Fahrer */}
          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-5">
              <div className="text-center">
                <h3 className="text-xl font-bold text-red-900 mb-2">LKW-Fahrer CE</h3>
                <div className="text-4xl font-bold text-red-700 mb-1">349 €</div>
                <p className="text-red-800 font-medium text-sm mb-3">pro Einsatztag</p>
                <p className="text-red-700 text-xs">Einsatzdauer bis max. 9 Stunden je Einsatztag</p>
                <p className="text-red-700 text-xs mt-1">Zusätzlich: An- und Abfahrt</p>
              </div>
            </CardContent>
          </Card>

          {/* LKW CE Wochenpreis */}
          <Card className="relative border border-red-200 bg-red-50/60 hover:shadow-xl transition-all duration-300">
            <span className="absolute top-2 right-2 z-10 bg-red-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
              Planbar buchen
            </span>
            <CardContent className="p-5">
              <div className="text-center">
                <h3 className="text-xl font-bold text-red-900 mb-2 pr-20">LKW-Fahrer CE – Wochenpreis</h3>
                <div className="text-4xl font-bold text-red-700 mb-1">1.645 €</div>
                <p className="text-red-800 font-medium text-sm mb-3">pro Woche</p>
                <p className="text-red-700 text-xs">Nur für LKW-Fahrer CE: 5 Einsatztage</p>
                <p className="text-red-700 text-xs mt-1">Zusätzlich: An- und Abfahrt</p>
              </div>
            </CardContent>
          </Card>

          {/* Fernfahrer-Pauschale */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-5">
              <div className="text-center">
                <h3 className="text-xl font-bold text-green-900 mb-2">Fernfahrer-Pauschale</h3>
                <div className="text-4xl font-bold text-green-700 mb-1">450 €</div>
                <p className="text-green-800 font-medium text-sm mb-3">pro Einsatztag</p>
                <p className="text-green-700 text-xs">Gültig für: 1 Fernverkehrs-Einsatztag</p>
                <p className="text-green-700 text-xs mt-1">Zusätzlich: An- und Abfahrt</p>
              </div>
            </CardContent>
          </Card>

          {/* Baumaschinenführer / Mischmeister */}
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-5">
              <div className="text-center">
                <h3 className="text-xl font-bold text-orange-900 mb-2">Baumaschinenführer / Mischmeister</h3>
                <div className="text-4xl font-bold text-orange-700 mb-1">489 €</div>
                <p className="text-orange-800 font-medium text-sm mb-3">pro Einsatztag</p>
                <p className="text-orange-700 text-xs">Gültig für: bis 8 Stunden</p>
                <p className="text-orange-700 text-xs mt-1">Zusätzlich: An- und Abfahrt</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={scrollToForm}
              size="lg" 
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
            >
              Jetzt unverbindlich anfragen
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
            >
              <Link to="/preise-und-ablauf">
                Alle Details & Konditionen
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            💡 <strong>Langzeitprojekte?</strong> Ab 3 Monaten bieten wir individuelle Konditionen – sprechen Sie uns an!
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingBanner;

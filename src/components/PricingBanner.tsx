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

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
          {/* LKW CE Fahrer */}
          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                  BELIEBT
                </div>
                <h3 className="text-2xl font-bold text-red-900 mb-2">LKW CE Fahrer</h3>
                <div className="text-5xl font-bold text-red-700 mb-2">349 €</div>
                <p className="text-red-800 font-medium mb-1">pro Tag (8 Std.)</p>
                <p className="text-red-700 text-sm mb-4">+ 30 € je Überstunde</p>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-4 text-left text-sm space-y-1">
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">CE-Führerschein inklusive</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">Bundesweit verfügbar</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">Geprüft & versichert</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Baumaschinenführer */}
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="inline-block bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                  SPEZIALIST
                </div>
                <h3 className="text-2xl font-bold text-orange-900 mb-2">Baumaschinenführer</h3>
                <div className="text-5xl font-bold text-orange-700 mb-2">459 €</div>
                <p className="text-orange-800 font-medium mb-1">pro Tag (8 Std.)</p>
                <p className="text-orange-700 text-sm mb-4">+ 60 € je Überstunde</p>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-4 text-left text-sm space-y-1">
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">Kran, Bagger, Radlader</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">Baustellen-Erfahrung</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">Qualifiziert & zertifiziert</span>
                  </p>
                </div>
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
            💡 <strong>Langzeitprojekte?</strong> Ab 5 Tagen bieten wir attraktive Staffelpreise – sprechen Sie uns an!
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingBanner;

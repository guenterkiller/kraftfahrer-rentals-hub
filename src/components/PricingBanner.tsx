import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import TarifCardText, { PreiskartenHinweis } from "@/components/TarifCardText";
import { TARIF_TEXTE, tarifTitel } from "@/lib/tarifTexte";

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
          <PreiskartenHinweis className="mt-3 max-w-3xl mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto mb-8">
          {/* LKW CE Fahrer */}
          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-5">
              <div className="text-center">
                <h3 className="text-xl font-bold text-red-900 mb-2">LKW-Fahrer CE</h3>
                <TarifCardText
                      tarif={TARIF_TEXTE.lkw_ce}
                      amountClassName="text-4xl font-bold text-red-700 mb-1"
                      unitClassName="text-red-800 font-medium text-sm mb-2"
                      detailClassName="text-red-700 text-xs mt-1"
                    />
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
                <TarifCardText
                      tarif={TARIF_TEXTE.lkw_ce_woche}
                      amountClassName="text-4xl font-bold text-red-700 mb-1"
                      unitClassName="text-red-800 font-medium text-sm mb-2"
                      detailClassName="text-red-700 text-xs mt-1"
                    />
              </div>
            </CardContent>
          </Card>

          {/* Fernfahrer-Pauschale */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-5">
              <div className="text-center">
                <h3 className="text-xl font-bold text-green-900 mb-2">Fernfahrer-Pauschale</h3>
                <TarifCardText
                      tarif={TARIF_TEXTE.fernfahrer}
                      amountClassName="text-4xl font-bold text-green-700 mb-1"
                      unitClassName="text-green-800 font-medium text-sm mb-2"
                      detailClassName="text-green-700 text-xs mt-1"
                    />
              </div>
            </CardContent>
          </Card>

          {/* Baumaschinenführer / Mischmeister */}
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-5">
              <div className="text-center">
                <h3 className="text-base font-bold text-orange-900 mb-2 leading-snug break-words hyphens-none">{tarifTitel(TARIF_TEXTE.baumaschine.name)}</h3>
                <TarifCardText
                      tarif={TARIF_TEXTE.baumaschine}
                      amountClassName="text-4xl font-bold text-orange-700 mb-1"
                      unitClassName="text-orange-800 font-medium text-sm mb-2"
                      detailClassName="text-orange-700 text-xs mt-1"
                    />
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
                Details: Preise & Konditionen
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

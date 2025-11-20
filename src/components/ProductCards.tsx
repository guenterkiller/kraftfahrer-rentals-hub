import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Construction, Check } from "lucide-react";

const ProductCards = () => {
  const scrollToForm = () => {
    const element = document.querySelector('#fahreranfrage');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Ihre Fahrerpreise</h2>
          <p className="text-muted-foreground">
            Preise verstehen sich <strong>netto je 8-Stunden-Tag</strong> zzgl. MwSt., Fahrt- und ggf. Übernachtungskosten
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* LKW CE Fahrer */}
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">LKW CE Fahrer</h3>
            </div>
            
            <div className="mb-6 pb-6 border-b border-border">
              <div className="text-4xl font-bold text-foreground mb-1">349 €</div>
              <p className="text-muted-foreground text-sm">pro 8-Stunden-Tag (netto)</p>
              <p className="text-primary font-medium text-sm mt-2">Überstunden: 30 €/h</p>
            </div>

            <ul className="space-y-2.5 mb-6">
              <li className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-foreground/90">Nah-, Fern- und Baustellenverkehr</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-foreground/90">ADR, Fahrmischer, Kranführer</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-foreground/90">Abrechnung im 15-Minuten-Takt nach 8 Std.</span>
              </li>
            </ul>

            <Button 
              onClick={scrollToForm}
              className="w-full"
              size="default"
            >
              LKW-Fahrer anfragen
            </Button>
          </div>

          {/* Baumaschinenführer */}
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Construction className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Baumaschinenführer</h3>
            </div>
            
            <div className="mb-6 pb-6 border-b border-border">
              <div className="text-4xl font-bold text-foreground mb-1">459 €</div>
              <p className="text-muted-foreground text-sm">pro 8-Stunden-Tag (netto)</p>
              <p className="text-primary font-medium text-sm mt-2">Überstunden: 60 €/h</p>
            </div>

            <ul className="space-y-2.5 mb-6">
              <li className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-foreground/90">Bagger, Radlader, Walzen</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-foreground/90">Kranführer, Spezialmaschinen</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-foreground/90">Projektpreise ab 10 Einsatztagen</span>
              </li>
            </ul>

            <Button 
              onClick={scrollToForm}
              className="w-full"
              size="default"
            >
              Baumaschinenführer anfragen
            </Button>
          </div>

        </div>

        {/* Abrechnungsmodell-Hinweis */}
        <div className="max-w-4xl mx-auto mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            Abrechnungsmodell: Agenturabrechnung – Vertragspartner ist Fahrerexpress
          </h4>
          <p className="text-sm text-blue-800">
            Die Fahrleistung wird von einem selbstständigen Subunternehmer erbracht, der seine Rechnung an Fahrerexpress stellt. 
            Dienst-/Werkleistung – keine Arbeitnehmerüberlassung.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProductCards;

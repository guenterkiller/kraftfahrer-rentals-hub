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
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* LKW CE Fahrer */}
          <Card className="border-2 border-border bg-card hover:shadow-xl transition-all duration-300 hover:border-primary/20">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <Truck className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">LKW CE Fahrer mieten</CardTitle>
              </div>
              <div className="text-3xl font-bold text-foreground">
                ab 349 € 
                <span className="text-lg font-normal text-muted-foreground ml-1">/ Tag</span>
              </div>
              <p className="text-sm text-muted-foreground">(8 Std., zzgl. MwSt.)</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3.5">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground/90 leading-relaxed">Fernverkehr, Nahverkehr, Container, Baustellenverkehr</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground/90 leading-relaxed">Selbstständige Fahrer mit eigenem Gewerbe</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground/90 leading-relaxed">Abrechnung im 15-Minuten-Takt nach 8 Std.</span>
                </li>
              </ul>
              <Button 
                onClick={scrollToForm}
                className="w-full"
                size="lg"
              >
                LKW-Fahrer anfragen
              </Button>
            </CardContent>
          </Card>

          {/* Baumaschinenführer */}
          <Card className="border-2 border-border bg-card hover:shadow-xl transition-all duration-300 hover:border-primary/20">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <Construction className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">Baumaschinenführer mieten</CardTitle>
              </div>
              <div className="text-3xl font-bold text-foreground">
                ab 459 € 
                <span className="text-lg font-normal text-muted-foreground ml-1">/ Tag</span>
              </div>
              <p className="text-sm text-muted-foreground">(8 Std., zzgl. MwSt.)</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3.5">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground/90 leading-relaxed">Bagger, Radlader, Fahrmischer, Flüssigboden</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground/90 leading-relaxed">Projektpreise ab 10 Einsatztagen</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground/90 leading-relaxed">Bundesweite Einsätze möglich</span>
                </li>
              </ul>
              <Button 
                onClick={scrollToForm}
                className="w-full"
                size="lg"
              >
                Baumaschinenführer anfragen
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
};

export default ProductCards;

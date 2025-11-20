import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Drill, Check } from "lucide-react";

const ProductCards = () => {
  const scrollToForm = () => {
    const element = document.querySelector('#fahreranfrage');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* LKW CE Fahrer - Blau-Akzent */}
          <Card className="border border-border bg-card hover:shadow-lg transition-all duration-300 hover:border-blue-200 group">
            <CardHeader className="border-b border-border bg-gradient-to-br from-blue-50/50 to-background pb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Truck className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">LKW CE Fahrer mieten</CardTitle>
              </div>
              <div className="text-3xl font-bold text-blue-600">ab 349 € <span className="text-xl font-normal text-muted-foreground">/ Tag</span></div>
              <p className="text-sm text-muted-foreground">(8 Std., zzgl. MwSt.)</p>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground leading-relaxed">Fernverkehr, Nahverkehr, Container, Baustellenverkehr</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground leading-relaxed">Selbstständige Fahrer mit eigenem Gewerbe</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground leading-relaxed">Abrechnung im 15-Minuten-Takt nach 8 Std.</span>
                </li>
              </ul>
              <Button 
                onClick={scrollToForm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                LKW-Fahrer anfragen
              </Button>
            </CardContent>
          </Card>

          {/* Baumaschinenführer - Grau-Akzent */}
          <Card className="border border-border bg-card hover:shadow-lg transition-all duration-300 hover:border-slate-300 group">
            <CardHeader className="border-b border-border bg-gradient-to-br from-slate-50/50 to-background pb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-600 group-hover:text-white transition-colors">
                  <Drill className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">Baumaschinenführer mieten</CardTitle>
              </div>
              <div className="text-3xl font-bold text-slate-700">ab 459 € <span className="text-xl font-normal text-muted-foreground">/ Tag</span></div>
              <p className="text-sm text-muted-foreground">(8 Std., zzgl. MwSt.)</p>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground leading-relaxed">Bagger, Radlader, Fahrmischer, Flüssigboden</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground leading-relaxed">Projektpreise ab 10 Einsatztagen</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground leading-relaxed">Bundesweite Einsätze möglich</span>
                </li>
              </ul>
              <Button 
                onClick={scrollToForm}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white"
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

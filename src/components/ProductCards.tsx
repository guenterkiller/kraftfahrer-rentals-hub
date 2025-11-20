import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Drill } from "lucide-react";

const ProductCards = () => {
  const scrollToForm = () => {
    const element = document.querySelector('#fahreranfrage');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* LKW CE Fahrer */}
          <Card className="border-2 border-gray-200 bg-white hover:shadow-xl transition-all duration-300 hover:border-primary/30">
            <CardHeader className="border-b bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-center gap-3 mb-2">
                <Truck className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">LKW CE Fahrer mieten</CardTitle>
              </div>
              <div className="text-3xl font-bold text-primary">ab 349 € / Tag</div>
              <p className="text-sm text-muted-foreground">(8 Std., zzgl. MwSt.)</p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-success font-bold mt-0.5" aria-hidden="true">✔</span>
                  <span>Fernverkehr, Nahverkehr, Container, Baustellenverkehr</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success font-bold mt-0.5" aria-hidden="true">✔</span>
                  <span>Selbstständige Fahrer mit eigenem Gewerbe</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success font-bold mt-0.5" aria-hidden="true">✔</span>
                  <span>Abrechnung im 15-Minuten-Takt nach 8 Std.</span>
                </li>
              </ul>
              <Button 
                onClick={scrollToForm}
                className="w-full mt-4"
                variant="default"
                aria-label="LKW CE Fahrer anfragen - zum Anfrageformular springen"
              >
                LKW-Fahrer anfragen
              </Button>
            </CardContent>
          </Card>

          {/* Baumaschinenführer */}
          <Card className="border-2 border-gray-200 bg-white hover:shadow-xl transition-all duration-300 hover:border-primary/30">
            <CardHeader className="border-b bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-center gap-3 mb-2">
                <Drill className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Baumaschinenführer mieten</CardTitle>
              </div>
              <div className="text-3xl font-bold text-primary">ab 459 € / Tag</div>
              <p className="text-sm text-muted-foreground">(8 Std., zzgl. MwSt.)</p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-success font-bold mt-0.5" aria-hidden="true">✔</span>
                  <span>Bagger, Radlader, Fahrmischer, Flüssigboden</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success font-bold mt-0.5" aria-hidden="true">✔</span>
                  <span>Projektpreise ab 10 Einsatztagen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success font-bold mt-0.5" aria-hidden="true">✔</span>
                  <span>Bundesweite Einsätze möglich</span>
                </li>
              </ul>
              <Button 
                onClick={scrollToForm}
                className="w-full mt-4"
                variant="default"
                aria-label="Baumaschinenführer anfragen - zum Anfrageformular springen"
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

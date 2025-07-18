import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Euro, Clock, Truck } from "lucide-react";

const PricingSection = () => {
  const pricingTiers = [
    {
      title: "Standard LKW-Fahrer",
      price: "55",
      unit: "€/Stunde",
      icon: Truck,
      features: [
        "CE-Führerschein",
        "Fahrerkarte",
        "Modul 95",
        "Deutschlandweit",
        "Kurzfristig verfügbar"
      ]
    },
    {
      title: "Spezialist",
      price: "68",
      unit: "€/Stunde", 
      icon: CheckCircle,
      features: [
        "ADR-Schein",
        "Kran-/Staplerschein",
        "Gefahrgut-Transport",
        "Schwertransport",
        "Erfahrung 10+ Jahre"
      ]
    },
    {
      title: "Baumaschinenführer",
      price: "62",
      unit: "€/Stunde",
      icon: Clock,
      features: [
        "Baggerführerschein",
        "Radlader-Erfahrung",
        "Kranführerschein",
        "Baustellenerfahrung",
        "Flexible Arbeitszeiten"
      ]
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Preise & Konditionen</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Transparente Preisgestaltung ohne versteckte Kosten. Alle Preise verstehen sich als Honorar für selbstständige Fahrer.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {pricingTiers.map((tier, index) => (
            <Card key={index} className="relative hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-6">
                <tier.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl mb-2">{tier.title}</CardTitle>
                <div className="text-3xl font-bold text-primary mb-1">
                  {tier.price}
                </div>
                <div className="text-muted-foreground">{tier.unit}</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant="outline">
                  Anfrage stellen
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-muted p-8 rounded-lg max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Euro className="h-5 w-5 text-primary" />
            Warum diese Preise?
          </h3>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-4">
              Unsere Preise berücksichtigen die Realität selbstständiger Fahrer:
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Brutto-Stundensatz:</span>
                  <span className="font-semibold">55€</span>
                </div>
                <div className="flex justify-between">
                  <span>- Steuern (25-30%):</span>
                  <span className="text-red-600">-15€</span>
                </div>
                <div className="flex justify-between">
                  <span>- Sozialabgaben:</span>
                  <span className="text-red-600">-8€</span>
                </div>
                <div className="flex justify-between">
                  <span>- Rücklagen/Altersvorsorge:</span>
                  <span className="text-red-600">-7€</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>- Ausfallzeiten (20%):</span>
                  <span className="text-red-600">-5€</span>
                </div>
                <div className="flex justify-between">
                  <span>- Fahrtkosten/Spesen:</span>
                  <span className="text-red-600">-3€</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Netto-Verdienst:</span>
                  <span className="font-bold text-green-600">~17€/h</span>
                </div>
              </div>
            </div>
          </div>
          
          <h4 className="font-semibold mb-3">Zusätzliche Konditionen:</h4>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h5 className="font-semibold mb-2">Mindestbuchung:</h5>
              <p className="text-muted-foreground">8 Stunden pro Einsatz</p>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Bereitschaftszeit:</h5>
              <p className="text-muted-foreground">35 €/Stunde</p>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Wochenende/Feiertage:</h5>
              <p className="text-muted-foreground">+25% Zuschlag</p>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Nachtarbeit:</h5>
              <p className="text-muted-foreground">+20% Zuschlag (22-6 Uhr)</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Alle Preise zzgl. gesetzlicher MwSt. Fahrtkosten werden separat berechnet.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
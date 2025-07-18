import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Euro, Clock, Truck } from "lucide-react";

const PricingSection = () => {
  const pricingTiers = [
    {
      title: "Standard LKW-Fahrer",
      price: "399",
      unit: "€ (8-Stunden-Tag)",
      icon: Truck,
      features: [
        "CE-Führerschein",
        "Fahrerkarte",
        "Modul 95",
        "Transport & Baustelle",
        "Überführungsfahrten"
      ]
    },
    {
      title: "Spezialfahrer",
      price: "539",
      unit: "€ (8-Stunden-Tag)", 
      icon: CheckCircle,
      features: [
        "ADR-Schein",
        "Kran-/Staplererfahrung",
        "Gefahrgut",
        "Schwertransport",
        "Komplexe Einsätze"
      ]
    },
    {
      title: "Baumaschinenführer",
      price: "489",
      unit: "€ (8-Stunden-Tag)",
      icon: Clock,
      features: [
        "Bagger-Erfahrung",
        "Radlader-Erfahrung",
        "Kran-Erfahrung",
        "Flexibel auf Baustellen",
        "Vielseitig einsetzbar"
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
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Euro className="h-5 w-5 text-primary" />
            Erweiterungen & Zuschläge
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm mb-8">
            <div>
              <h5 className="font-semibold mb-2">Bereitschaft / Reservezeit:</h5>
              <p className="text-muted-foreground">160 € / Tag (max. 8 Std.)</p>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Wochenend- oder Feiertagseinsatz:</h5>
              <p className="text-muted-foreground">+25%</p>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Nachtarbeit:</h5>
              <p className="text-muted-foreground">+20% (22–6 Uhr)</p>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Kurzeinsätze:</h5>
              <p className="text-muted-foreground">Pauschal 299 € (unter 5 Std.)</p>
            </div>
          </div>
          
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Vorteile für Auftraggeber
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h5 className="font-semibold mb-2">Klare Kalkulation:</h5>
              <p className="text-muted-foreground">Ohne Überraschungen</p>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Keine Arbeitgeberpflichten:</h5>
              <p className="text-muted-foreground">Keine Sozialabgaben, kein Lohnnebenkostenrisiko</p>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Flexible Verfügbarkeit:</h5>
              <p className="text-muted-foreground">Kurzfristige Verfügbarkeit</p>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Rechnung:</h5>
              <p className="text-muted-foreground">Mit ausgewiesener MwSt.</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Alle Preise zzgl. gesetzlicher MwSt. Fahrtkosten nach Aufwand.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
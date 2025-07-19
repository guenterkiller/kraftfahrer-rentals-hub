import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Euro, Clock, Truck, Calculator, TrendingUp } from "lucide-react";

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
                <Button className="w-full" variant="outline" asChild>
                  <a href="#contact">Anfrage stellen</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Preiskalkulation */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-8 rounded-lg max-w-4xl mx-auto mb-12 border border-blue-200 dark:border-blue-800">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Wie setzen sich unsere Preise zusammen?
          </h3>
          <p className="text-muted-foreground mb-6 text-sm">
            Transparente Aufschlüsselung am Beispiel eines Standard LKW-Fahrers (399 € Netto-Tagespreis):
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                <span className="font-semibold">Netto-Honorar (8h)</span>
                <span className="font-bold text-primary">399,00 €</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <span>MwSt. (19%)</span>
                <span className="font-medium">75,81 €</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <span className="font-semibold">Brutto-Rechnungsbetrag</span>
                <span className="font-bold text-green-700 dark:text-green-400">474,81 €</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Was vom Netto-Honorar abgeht:</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>• Krankenversicherung (15-16%)</span>
                  <span>~60 €</span>
                </div>
                <div className="flex justify-between">
                  <span>• Rentenversicherung (18,6%)</span>
                  <span>~74 €</span>
                </div>
                <div className="flex justify-between">
                  <span>• Einkommensteuer (~25%)</span>
                  <span>~100 €</span>
                </div>
                <div className="flex justify-between">
                  <span>• Fahrzeugkosten, Versicherung</span>
                  <span>~40 €</span>
                </div>
                <div className="flex justify-between">
                  <span>• Ausfallzeiten (Urlaub, Krankheit)</span>
                  <span>~30 €</span>
                </div>
                <div className="flex justify-between">
                  <span>• Betriebskosten, Büro, Buchhaltung</span>
                  <span>~25 €</span>
                </div>
                <hr className="border-gray-300 dark:border-gray-600" />
                <div className="flex justify-between font-semibold">
                  <span>Verbleibt netto für den Fahrer:</span>
                  <span>~70 € (8,75 €/h)</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Warum diese Preise notwendig sind:</h4>
                <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <li>• Selbstständige tragen alle Sozialabgaben allein (Arbeitgeber + Arbeitnehmeranteil)</li>
                  <li>• Keine bezahlten Krankheitstage oder Urlaubstage</li>
                  <li>• Auslastung selten bei 100% - Akquise und Ausfallzeiten müssen einkalkuliert werden</li>
                  <li>• Eigenfinanzierung der Altersvorsorge notwendig</li>
                  <li>• Keine Lohnfortzahlung bei Unfällen oder längerer Krankheit</li>
                </ul>
              </div>
            </div>
          </div>
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
          
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Anfahrt & Fahrtkosten
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm mb-8">
            <div>
              <h5 className="font-semibold mb-2">Anfahrt inklusive:</h5>
              <p className="text-muted-foreground">Bis 25 km (einfache Strecke) im Tagespreis enthalten</p>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Kilometervergütung:</h5>
              <p className="text-muted-foreground">0,40 €/km (Hin- und Rückweg) ab 25 km</p>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Weite Einsätze ({'>'}150 km):</h5>
              <p className="text-muted-foreground">Fahrt am Vortag & Übernachtung empfohlen</p>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Übernachtungskosten:</h5>
              <p className="text-muted-foreground">Pauschal 85 € netto/Nacht oder auf Nachweis</p>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-8">
            <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">💡 Zusatztipp für weite Einsätze:</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Bei Einsätzen über 150 km empfehlen wir eine frühzeitige Abstimmung mit dem Kunden 
              und lassen uns die Konditionen schriftlich bestätigen.
            </p>
          </div>
          
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
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
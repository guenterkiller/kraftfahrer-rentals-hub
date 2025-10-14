import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Euro, Clock, Truck, Calculator, TrendingUp } from "lucide-react";

const PricingSection = () => {
  const pricingTiers = [
    {
      title: "Standard LKW-Fahrer",
      hourly: "50",
      price: "359",
      projectPrice: "349",
      unit: "€ / Tag (8h)",
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
      title: "CE/40 t",
      hourly: "55",
      price: "399",
      projectPrice: "379",
      unit: "€ / Tag (8h)",
      icon: Truck,
      features: [
        "CE-Führerschein",
        "Hängerzug-Erfahrung",
        "Baustellenverkehr",
        "Logistik & Fernverkehr",
        "Überführungen"
      ]
    },
    {
      title: "Baumaschinenführer",
      hourly: "62",
      price: "489",
      projectPrice: "469",
      unit: "€ / Tag (8h)",
      icon: Clock,
      features: [
        "Bagger-Erfahrung",
        "Radlader-Erfahrung",
        "Kran-Erfahrung",
        "Flexibel auf Baustellen",
        "Vielseitig einsetzbar"
      ]
    },
    {
      title: "Spezialfahrer (ADR/Kran)",
      hourly: "68",
      price: "539",
      projectPrice: "519",
      unit: "€ / Tag (8h)", 
      icon: CheckCircle,
      features: [
        "ADR-Schein",
        "Kran-/Staplererfahrung",
        "Gefahrgut",
        "Schwertransport",
        "Komplexe Einsätze"
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
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-12">
          {pricingTiers.map((tier, index) => (
            <Card key={index} className="relative hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-6">
                <tier.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg mb-3">{tier.title}</CardTitle>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Kurzeinsatz</div>
                    <div className="text-2xl font-bold text-primary">
                      {tier.hourly} €/h
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Standard</div>
                    <div className="text-xl font-bold text-primary">
                      {tier.price} €
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Projekt (4+ Wo.)</div>
                    <div className="text-xl font-bold text-green-600">
                      {tier.projectPrice} €
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">netto / Tag (8h)</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      <span className="text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" size="sm" variant="outline" onClick={() => {
                  document.getElementById('fahreranfrage')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  Fahrer buchen
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info paragraph for short-term engagements */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg max-w-4xl mx-auto mb-12 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>ℹ️ Kurzeinsätze (4–6 h):</strong> Sind auf Anfrage möglich und werden mit einem erhöhten Stundensatz berechnet. 
            Regelmäßige Einsätze werden nach Tagessatz oder Projektpreis abgerechnet.
          </p>
        </div>

        {/* Preisstaffelung für längere Einsätze */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 p-8 rounded-lg max-w-6xl mx-auto mb-12 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            <h3 className="text-2xl font-bold">Preisstaffelung für längere Einsätze</h3>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Unsere Preisstruktur ist klar und linear: Je nach Einsatzdauer (Kurzeinsatz, Standard-Tag oder längeres Projekt) gelten unterschiedliche Konditionen. 
            Projektpreise gelten ab 4 Wochen garantierter Laufzeit mit fester Wochenplanung.
          </p>

          {/* Pricing Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-green-100 dark:bg-green-900/30">
                  <th className="p-3 text-left font-semibold border-b border-green-200 dark:border-green-700">Fahrerprofil</th>
                  <th className="p-3 text-center font-semibold border-b border-green-200 dark:border-green-700">Kurzeinsatz (4–6 h)</th>
                  <th className="p-3 text-center font-semibold border-b border-green-200 dark:border-green-700">Standard-Tagessatz (8 h)</th>
                  <th className="p-3 text-center font-semibold border-b border-green-200 dark:border-green-700">Projektpreis ab 4 Wochen</th>
                  <th className="p-3 text-left font-semibold border-b border-green-200 dark:border-green-700">Beschreibung</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-3 font-medium">Standard-LKW-Fahrer (bis 7,5 t / 12 t)</td>
                  <td className="p-3 text-center">
                    <div className="font-bold text-orange-600 dark:text-orange-400">50 € / h</div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="font-bold text-primary">359 € / Tag</div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="font-bold text-green-600 dark:text-green-400">349 € / Tag</div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">CE- oder C-Führerschein, Modul 95, Fahrerkarte, Nahverkehr / Verteiler / Baustelle</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-3 font-medium">LKW-Fahrer (CE, 40 t / Hängerzug)</td>
                  <td className="p-3 text-center">
                    <div className="font-bold text-orange-600 dark:text-orange-400">55 € / h</div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="font-bold text-primary">399 € / Tag</div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="font-bold text-green-600 dark:text-green-400">379 € / Tag</div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">Baustellenverkehr, Logistik, Überführungen, Fernverkehr</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-3 font-medium">Baumaschinenführer</td>
                  <td className="p-3 text-center">
                    <div className="font-bold text-orange-600 dark:text-orange-400">62 € / h</div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="font-bold text-primary">489 € / Tag</div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="font-bold text-green-600 dark:text-green-400">469 € / Tag</div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">Bagger-, Radlader- oder Kranerfahrung</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-3 font-medium">Spezialfahrer (ADR, Kran, Schwertransport)</td>
                  <td className="p-3 text-center">
                    <div className="font-bold text-orange-600 dark:text-orange-400">68 € / h</div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="font-bold text-primary">539 € / Tag</div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="font-bold text-green-600 dark:text-green-400">519 € / Tag</div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">Gefahrgut, Kran- oder Spezialfahrten</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mb-6">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              💡 <strong>Kurzeinsätze (4–6 h)</strong> werden mit erhöhtem Stundensatz berechnet. <strong>Projektpreise</strong> gelten nur bei fester Wochenplanung (mind. 4 Wochen, 5 Tage/Woche). Alle Preise zzgl. 19 % MwSt.
            </p>
          </div>

          {/* Ergänzender Text */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-3 text-lg">Staffelpreise mit Planungssicherheit</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Unsere Staffelpreise richten sich nach der tatsächlichen Laufzeit und Planungssicherheit des Einsatzes.
              Damit profitieren Auftraggeber bei längeren Projekten von planbaren Konditionen – ohne versteckte Kosten, ohne Arbeitgeberpflichten.
              Jeder Fahrer arbeitet auf selbstständiger Basis gemäß § 84 HGB.
            </p>
          </div>
        </div>

        {/* Preiskalkulation */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-8 rounded-lg max-w-4xl mx-auto mb-12 border border-blue-200 dark:border-blue-800">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Wie setzen sich unsere Preise zusammen?
          </h3>
          <p className="text-muted-foreground mb-6 text-sm">
            Transparente Aufschlüsselung am Beispiel eines Standard LKW-Fahrers (359 € Netto-Tagespreis):
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                <span className="font-semibold">Netto-Honorar (8h)</span>
                <span className="font-bold text-primary">359,00 €</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <span>MwSt. (19%)</span>
                <span className="font-medium">68,21 €</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <span className="font-semibold">Brutto-Rechnungsbetrag</span>
                <span className="font-bold text-green-700 dark:text-green-400">427,21 €</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Was bleibt vom Tagespreis?</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                  <span>Tagesumsatz netto</span>
                  <span className="font-medium">359,00 €</span>
                </div>
                <div className="text-xs text-muted-foreground ml-2">Abzüge pro Tag:</div>
                <div className="space-y-1 text-xs ml-4">
                  <div className="flex justify-between">
                    <span>• Krankenversicherung (anteilig)</span>
                    <span>-30,00 €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Rentenversicherung (anteilig)</span>
                    <span>-37,00 €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Einkommensteuer (anteilig)</span>
                    <span>-50,00 €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Fahrzeug & Betriebskosten</span>
                    <span>-20,00 €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Ausfallzeiten-Rücklage*</span>
                    <span>-62,00 €</span>
                  </div>
                </div>
                <hr className="border-gray-300 dark:border-gray-600" />
                <div className="flex justify-between font-semibold text-green-700 dark:text-green-400 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <span>Verbleibt netto/Tag:</span>
                  <span>180,00 € (22,50 €/h)</span>
                </div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-xs border border-amber-200 dark:border-amber-800">
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">*Warum so hohe Ausfallzeiten-Rücklage?</p>
                <p className="text-amber-700 dark:text-amber-300">
                  Von 365 Tagen sind nur ~200 buchbar. An den anderen 165 Tagen (Urlaub, Krankheit, keine Aufträge) 
                  muss trotzdem Miete, Versicherung etc. bezahlt werden. Daher müssen pro Arbeitstag 125€ zurückgelegt werden.
                </p>
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
              <h5 className="font-semibold mb-2">Kurzeinsätze (4–6 h):</h5>
              <p className="text-muted-foreground">Nach erhöhtem Stundensatz (siehe Tabelle)</p>
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
              <h5 className="font-semibold mb-2">Planbare Verfügbarkeit:</h5>
              <p className="text-muted-foreground">Einsätze meist ab kommender Kalenderwoche</p>
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
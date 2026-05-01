import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PricingSection = () => {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById('fahreranfrage');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const trackClick = (event: string, label: string, value: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        event_category: 'Pricing Section',
        event_label: label,
        value
      });
    }
    scrollToBooking();
  };

  return (
    <section id="pricing" className="py-20 bg-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">LKW-Fahrer, Baumaschinenführer & Mischmeister – Sie haben die Wahl</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Vermittelte LKW CE Fahrer, Baumaschinenführer für Bagger, Radlader & mehr sowie Mischmeister für Flüssigboden – alle arbeiten als selbstständige Subunternehmer. Fahrerexpress vermittelt nach § 652 BGB (Maklervertrag).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 max-w-7xl mx-auto">
          {/* LKW-Fahrer CE */}
          <Card className="border-2 border-red-200 bg-red-50/60 hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-red-900">LKW-Fahrer CE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 flex flex-col flex-1 pt-0 text-center">
              <div className="text-4xl font-bold text-red-700">349 €</div>
              <p className="text-sm text-red-800 font-medium">pro Einsatztag</p>
              <p className="text-xs text-red-700">Gültig für: bis 10 Stunden</p>
              <p className="text-xs text-red-700">Zusätzlich: An- und Abfahrt</p>
              <Button
                className="w-full mt-auto bg-red-700 hover:bg-red-800 text-white"
                onClick={() => trackClick('category_click_lkw', 'LKW-Fahrer CE', 349)}
              >
                CE-Fahrer buchen
              </Button>
            </CardContent>
          </Card>

          {/* Wochenpreis */}
          <Card className="relative border border-red-200 bg-red-50/40 hover:shadow-lg transition-shadow flex flex-col">
            <span className="absolute top-2 right-2 z-10 bg-red-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
              Planbar &amp; günstiger
            </span>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-red-900 pr-24">LKW-Fahrer CE – Wochenpreis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 flex flex-col flex-1 pt-0 text-center">
              <div className="text-4xl font-bold text-red-700">1.645 €</div>
              <p className="text-sm text-red-800 font-medium">pro Woche</p>
              <p className="text-xs text-red-700">Nur für LKW-Fahrer CE: 5 Einsatztage à bis 10 Stunden</p>
              <p className="text-xs text-red-700">Zusätzlich: An- und Abfahrt</p>
              <Button
                className="w-full mt-auto bg-red-700 hover:bg-red-800 text-white"
                onClick={() => trackClick('category_click_lkw_woche', 'LKW-Fahrer CE Wochenpreis', 1645)}
              >
                Woche buchen
              </Button>
            </CardContent>
          </Card>

          {/* Fernfahrer-Pauschale */}
          <Card className="border-2 border-green-200 bg-green-50 hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-900">Fernfahrer-Pauschale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 flex flex-col flex-1 pt-0 text-center">
              <div className="text-4xl font-bold text-green-700">450 €</div>
              <p className="text-sm text-green-800 font-medium">pro Einsatztag</p>
              <p className="text-xs text-green-700">Gültig für: 1 Fernverkehrs-Einsatztag</p>
              <p className="text-xs text-green-700">Zusätzlich: An- und Abfahrt</p>
              <Button
                className="w-full mt-auto bg-green-600 hover:bg-green-700 text-white"
                onClick={() => trackClick('category_click_fernfahrer', 'Fernfahrer-Pauschale', 450)}
              >
                Fernfahrer buchen
              </Button>
            </CardContent>
          </Card>

          {/* Baumaschinenführer / Mischmeister */}
          <Card className="border-2 border-orange-200 bg-orange-50 hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-orange-900">Baumaschinenführer / Mischmeister</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 flex flex-col flex-1 pt-0 text-center">
              <div className="text-4xl font-bold text-orange-700">489 €</div>
              <p className="text-sm text-orange-800 font-medium">pro Einsatztag</p>
              <p className="text-xs text-orange-700">Gültig für: bis 8 Stunden</p>
              <p className="text-xs text-orange-700">Zusätzlich: An- und Abfahrt</p>
              <Button
                className="w-full mt-auto bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => trackClick('category_click_baumaschinen', 'Baumaschinenführer / Mischmeister', 489)}
              >
                Baumaschinen / Mischmeister buchen
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* An- und Abfahrt */}
        <Card className="max-w-5xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-base">An- und Abfahrt</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Die An- und Abfahrt wird zusätzlich zum Tagessatz berechnet und vor Auftragserteilung klar ausgewiesen.</p>
            <ul className="ml-4 space-y-1 text-muted-foreground">
              <li>• erste 25 km der Gesamtstrecke frei</li>
              <li>• ab dem 26. km: 0,40 € je gefahrenem Kilometer</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-muted/40 max-w-5xl mx-auto mb-8">
          <CardContent className="text-sm pt-6">
            <p>Bei auswärtigen Einsätzen kann zusätzlich eine Übernachtung erforderlich sein. Diese wird vor Auftragserteilung abgestimmt.</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/50 max-w-5xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-base">Wichtiger Hinweis</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Alle Fahrer arbeiten selbstständig als Subunternehmer. Vermittlung nach § 652 BGB (Maklervertrag). Abrechnung erfolgt über Fahrerexpress.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PricingSection;

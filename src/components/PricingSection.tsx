import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 max-w-7xl mx-auto items-stretch">
          {/* LKW-Fahrer CE */}
          <Card className="bg-card border border-border border-t-4 border-t-red-600 hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader className="pb-2 min-h-[64px]">
              <CardTitle className="text-base font-semibold leading-tight break-words hyphens-auto">LKW-Fahrer CE</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 pt-0 text-center space-y-2">
              <div className="text-4xl font-bold text-foreground">349 €</div>
              <p className="text-sm font-medium text-foreground">pro Einsatztag</p>
              <p className="text-xs text-muted-foreground">Gültig für: bis 10 Stunden</p>
              <p className="text-xs text-muted-foreground">Zusätzlich: An- und Abfahrt</p>
              <Button
                className="w-full h-11 mt-auto bg-red-700 hover:bg-red-800 text-white text-sm font-semibold"
                onClick={() => trackClick('category_click_lkw', 'LKW-Fahrer CE', 349)}
              >
                LKW-Fahrer anfragen
              </Button>
            </CardContent>
          </Card>

          {/* Wochenpreis */}
          <Card className="relative bg-card border border-border border-t-4 border-t-red-600 ring-1 ring-red-200 hover:shadow-lg transition-shadow flex flex-col h-full">
            <span className="absolute -top-2.5 right-3 z-10 bg-red-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
              Planbar buchen
            </span>
            <CardHeader className="pb-2 min-h-[64px]">
              <CardTitle className="text-base font-semibold leading-tight break-words hyphens-auto">LKW-Fahrer CE – Wochenpreis</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 pt-0 text-center space-y-2">
              <div className="text-4xl font-bold text-foreground">1.645 €</div>
              <p className="text-sm font-medium text-foreground">pro Woche</p>
              <p className="text-xs text-muted-foreground">Nur für LKW-Fahrer CE: 5 Einsatztage à bis 10 Stunden</p>
              <p className="text-xs text-muted-foreground">Zusätzlich: An- und Abfahrt</p>
              <Button
                className="w-full h-11 mt-auto bg-red-700 hover:bg-red-800 text-white text-sm font-semibold"
                onClick={() => trackClick('category_click_lkw_woche', 'LKW-Fahrer CE Wochenpreis', 1645)}
              >
                Woche anfragen
              </Button>
            </CardContent>
          </Card>

          {/* Fernfahrer-Pauschale */}
          <Card className="bg-card border border-border border-t-4 border-t-green-600 hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader className="pb-2 min-h-[64px]">
              <CardTitle className="text-base font-semibold leading-tight break-words hyphens-auto">Fernfahrer-Pauschale</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 pt-0 text-center space-y-2">
              <div className="text-4xl font-bold text-foreground">450 €</div>
              <p className="text-sm font-medium text-foreground">pro Einsatztag</p>
              <p className="text-xs text-muted-foreground">Gültig für: 1 Fernverkehrs-Einsatztag</p>
              <p className="text-xs text-muted-foreground">Zusätzlich: An- und Abfahrt</p>
              <Button
                className="w-full h-11 mt-auto bg-green-700 hover:bg-green-800 text-white text-sm font-semibold"
                onClick={() => trackClick('category_click_fernfahrer', 'Fernfahrer-Pauschale', 450)}
              >
                Fernfahrer anfragen
              </Button>
            </CardContent>
          </Card>

          {/* Baumaschinenführer / Mischmeister */}
          <Card className="bg-card border border-border border-t-4 border-t-orange-500 hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader className="pb-2 min-h-[64px]">
              <CardTitle className="text-base font-semibold leading-tight break-words hyphens-auto">Baumaschinenführer / Mischmeister</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 pt-0 text-center space-y-2">
              <div className="text-4xl font-bold text-foreground">489 €</div>
              <p className="text-sm font-medium text-foreground">pro Einsatztag</p>
              <p className="text-xs text-muted-foreground">Gültig für: bis 8 Stunden</p>
              <p className="text-xs text-muted-foreground">Zusätzlich: An- und Abfahrt</p>
              <Button
                className="w-full h-11 mt-auto bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold whitespace-normal leading-tight px-2"
                onClick={() => trackClick('category_click_baumaschinen', 'Baumaschinenführer / Mischmeister', 489)}
              >
                Baumaschinen / Mischmeister anfragen
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

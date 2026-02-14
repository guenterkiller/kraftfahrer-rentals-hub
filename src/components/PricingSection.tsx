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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-7xl mx-auto">
          {/* LKW CE Fahrer */}
          <Card className="border-primary bg-primary/5 hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="bg-primary/10 rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                LKW CE Fahrer
                <Badge className="bg-primary text-primary-foreground">Vermittelt</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-col flex-1 pt-4">
              <div>
                <h3 className="font-semibold text-base mb-2">Nahverkehr & Baustelle</h3>
                <p className="text-2xl font-bold text-primary">349 € / Tag</p>
                <p className="text-sm text-muted-foreground">8 Std. • 30 € Überstunde</p>
              </div>
              <div className="pt-3 border-t flex-1">
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Nah- und Verteilerverkehr</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Fahrmischer, ADR, Wechselbrücke</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Baustellenverkehr, Container</span>
                  </li>
                </ul>
              </div>
              <Button 
                className="w-full mt-auto bg-primary hover:bg-primary/90"
                onClick={() => trackClick('category_click_lkw', 'LKW CE Fahrer', 349)}
              >
                CE-Fahrer buchen
              </Button>
            </CardContent>
          </Card>

          {/* Fernfahrer-Pauschale */}
          <Card className="border-green-500 bg-green-50 hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="bg-green-100 rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                Fernfahrer-Pauschale
                <Badge className="bg-green-600 text-white">NEU</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-col flex-1 pt-4">
              <div>
                <h3 className="font-semibold text-base mb-2">Fernverkehr + Übernachtung</h3>
                <p className="text-2xl font-bold text-green-700">450 € / Tag</p>
                <p className="text-sm text-muted-foreground">Pauschale pro Einsatztag</p>
              </div>
              <div className="pt-3 border-t flex-1">
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Bis 10 Std. abgegolten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Keine Stundenabrechnung</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Übernachtung im Führerhaus</span>
                  </li>
                </ul>
              </div>
              <Button 
                className="w-full mt-auto bg-green-600 hover:bg-green-700 text-white"
                onClick={() => trackClick('category_click_fernfahrer', 'Fernfahrer-Pauschale', 450)}
              >
                Fernfahrer buchen
              </Button>
            </CardContent>
          </Card>

          {/* Baumaschinenführer */}
          <Card className="border-muted bg-muted/10 hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="bg-muted/20 rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                Baumaschinen­führer
                <Badge variant="secondary">Vermittelt</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-col flex-1 pt-4">
              <div>
                <h3 className="font-semibold text-base mb-2">Bagger, Radlader & mehr</h3>
                <p className="text-2xl font-bold text-foreground">459 € / Tag</p>
                <p className="text-sm text-muted-foreground">8 Std. • 60 € Überstunde</p>
              </div>
              <div className="pt-3 border-t flex-1">
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Bagger, Radlader, Fahrmischer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Störungsbehebung & Reparaturen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Baustellenlogistik</span>
                  </li>
                </ul>
              </div>
              <Button 
                className="w-full mt-auto"
                variant="outline"
                onClick={() => trackClick('category_click_baumaschinen', 'Baumaschinenführer', 459)}
              >
                Baumaschinenführer buchen
              </Button>
            </CardContent>
          </Card>

          {/* Mischmeister */}
          <Card className="border-blue-500 bg-blue-50 hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="bg-blue-100 rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                Mischmeister
                <Badge className="bg-blue-600 text-white">Flüssigboden</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-col flex-1 pt-4">
              <div>
                <h3 className="font-semibold text-base mb-2">Anlagenbediener Flüssigboden</h3>
                <p className="text-2xl font-bold text-blue-700">489 € / Tag</p>
                <p className="text-sm text-muted-foreground">8 Std. • 65 € Überstunde</p>
              </div>
              <div className="pt-3 border-t flex-1">
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Mischanlage bedienen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Radlader, Bagger, Fahrmischer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Anlage bauseits gestellt</span>
                  </li>
                </ul>
              </div>
              <Button 
                className="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => trackClick('category_click_mischmeister', 'Mischmeister', 489)}
              >
                Mischmeister buchen
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Fernfahrer-Pauschale Details */}
        <Card className="bg-green-50 border-green-200 max-w-5xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              🚛 Fernfahrer-Pauschale – Details
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Fernfahrer-Pauschale: Pauschalvergütung pro Einsatztag für Fernverkehr mit Übernachtung im Führerhaus. Gesetzlich zulässige Lenk- und Arbeitszeiten sind möglich, begründen jedoch keinen Anspruch auf zusätzliche Vergütung innerhalb der Pauschale.</p>
            <p><strong>Arbeitszeit bis 10 Stunden ist mit der Pauschale abgegolten.</strong></p>
            <p>Ab Überschreitung von 10 Stunden fällt ein Zuschlag an oder es gilt ein zusätzlicher Einsatztag (gemäß Auftragsbestätigung).</p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fahrtkosten</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-semibold">25 Kilometer inklusive</p>
              <p className="text-muted-foreground mt-1">Danach 0,40€ pro Kilometer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Langzeiteinsätze</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-semibold">Ab 3 Monaten</p>
              <p className="text-muted-foreground mt-1">Individuelle Konditionen auf Anfrage</p>
            </CardContent>
          </Card>
        </div>

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

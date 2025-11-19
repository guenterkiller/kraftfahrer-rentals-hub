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

  return (
    <section id="pricing" className="py-20 bg-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Transparente Preise</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            LKW/Spedition oder Baumaschinen – klare Preise für Ihre Anforderungen. Alle Preise verstehen sich als Netto-Honorar für selbstständige Fahrer.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                LKW- / Speditionsfahrer (CE)
                <Badge variant="secondary">Vermittelte Fahrer</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Alle Speditions-Einsatzarten</h3>
                <p className="text-3xl font-bold text-primary">349€</p>
                <p className="text-sm text-muted-foreground">pro Tag (8 Stunden)</p>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm font-medium">Überstunden</p>
                <p className="text-xl font-semibold">30€/Stunde</p>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">Einsatzarten (alle inklusive):</p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>CE-Fahrer (Nah-/Fernverkehr)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Fahrmischerfahrer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Wechselbrücke, Container, Hängerzug</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Mitnahmestapler, Eventlogistik</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Entsorgung, Baustellenverkehr</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>ADR (wenn Fahrer vorhanden)</span>
                  </li>
                </ul>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm"><strong>Wochenpreis:</strong> ab 1.490 € (5 Tage)</p>
              </div>
              <Button 
                className="w-full mt-4"
                variant="outline"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'category_click_standard', {
                      event_category: 'Pricing Section',
                      event_label: 'LKW Speditionsfahrer CE',
                      value: 349
                    });
                  }
                  scrollToBooking();
                }}
              >
                CE-Fahrer buchen
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/40 bg-primary/5 hover:border-primary/60 transition-all">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                Baumaschinenbedienung
                <Badge variant="secondary">Günter Killer persönlich</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Günter Killer persönlich</h3>
                <p className="text-3xl font-bold text-primary">459€</p>
                <p className="text-sm text-muted-foreground">pro Tag (8 Stunden)</p>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm font-medium">Überstunden</p>
                <p className="text-xl font-semibold">60€/Stunde</p>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">Einsatzbereiche:</p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Baggerfahren</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Radladerfahren</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Fahrmischer & Betonlogistik</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Flüssigboden (Mischmeister)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Mischanlagen bedienen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Störungsbehebung & Reparaturen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Baustellenlogistik & Materialfluss</span>
                  </li>
                </ul>
              </div>
              <Button 
                className="w-full mt-4"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'category_click_premium', {
                      event_category: 'Pricing Section',
                      event_label: 'Baumaschinenbedienung Günter Killer',
                      value: 459
                    });
                  }
                  scrollToBooking();
                }}
              >
                Günter Killer buchen
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader>
              <CardTitle className="text-xl">Standard-Kategorie</CardTitle>
              <p className="text-sm text-muted-foreground">Vermittelte Fahrer</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">CE-LKW-Fahrer</h3>
                <p className="text-sm text-muted-foreground mb-2">Einheitlicher Tagespreis für alle Einsatzarten</p>
                <p className="text-3xl font-bold text-primary">349€</p>
                <p className="text-sm text-muted-foreground">pro Tag (8 Stunden)</p>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm font-medium">Überstunden</p>
                <p className="text-xl font-semibold">30€/Stunde</p>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">Gilt für folgende Tätigkeiten:</p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Fahrmischer, Wechselbrücke, Hängerzug</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Fernverkehr, Nahverkehr</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Baustellenverkehr, Mitnahmestapler</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>ADR, Baustofflogistik, Entsorgung</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Container, Express- und Kurierfahrten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Eventlogistik und alle weiteren CE-Fahrer-Einsatzarten</span>
                  </li>
                </ul>
              </div>
              <Button 
                className="w-full mt-4"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'category_click_standard', {
                      event_category: 'Pricing Section',
                      event_label: 'Standard CE-LKW-Fahrer',
                      value: 349
                    });
                  }
                  scrollToBooking();
                }}
              >
                Fahrer buchen
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
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
              <CardTitle className="text-base">Wochenpreise</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-semibold">Ab 5 Tagen</p>
              <p className="text-primary text-lg font-bold mt-1">1.490€/Woche</p>
              <p className="text-muted-foreground text-xs mt-1">(nur CE-Fahrer)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monatspreise</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-semibold">Nur auf Anfrage</p>
              <p className="text-muted-foreground mt-1">Individuelle Konditionen</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/50 max-w-5xl mx-auto mb-16">
          <CardHeader>
            <CardTitle className="text-base">Wichtiger Hinweis</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Alle Fahrer arbeiten selbstständig nach Paragraph 84 HGB. Keine Arbeitnehmerüberlassung. Abrechnung erfolgt über Fahrerexpress.</p>
          </CardContent>
        </Card>

      </div>
    </section>
  );
};

export default PricingSection;
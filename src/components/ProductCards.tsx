import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Check, Star, Droplets, Construction } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const ProductCards = () => {
  const navigate = useNavigate();
  
  const scrollToForm = () => {
    const element = document.querySelector('#fahreranfrage');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <Badge variant="secondary" className="mb-4">Transparent & Fair</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Unsere Dienstleistungen & Preise
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            Preise verstehen sich <strong>netto je 8-Stunden-Tag</strong><br className="md:hidden" /> 
            zzgl. MwSt., Fahrt- und ggf. Übernachtungskosten
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* LKW CE Fahrer - Featured Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
            <Badge className="absolute top-4 right-4" variant="default">
              <Star className="h-3 w-3 mr-1" />
              Beliebt
            </Badge>
            
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg">
                  <Truck className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">LKW CE Fahrer</h3>
                  <p className="text-sm text-muted-foreground">Bundesweit verfügbar</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">349 €</span>
                  <span className="text-muted-foreground">/Tag</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">8-Stunden-Tag (netto)</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
                  <span className="text-sm font-semibold text-primary">Überstunden: 30 €/h</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground">Nah-, Fern- und Baustellenverkehr</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground">ADR, Fahrmischer, Kranführer</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground">Abrechnung im 15-Minuten-Takt nach 8 Std.</span>
                </li>
              </ul>

              <Button 
                onClick={scrollToForm}
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                LKW-Fahrer anfragen
              </Button>
            </CardContent>
          </Card>

          {/* Baumaschinenführer */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16" />
            
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-secondary/70 shadow-lg">
                  <Construction className="h-7 w-7 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Baumaschinenführer</h3>
                  <p className="text-sm text-muted-foreground">Deutschlandweit verfügbar</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-bold text-foreground">459 €</span>
                  <span className="text-muted-foreground">/Tag</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">8-Stunden-Tag (netto)</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10">
                  <span className="text-sm font-semibold text-secondary-foreground">Überstunden: 60 €/h</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground">Bagger, Radlader, Walzen</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground">Kranführer, Spezialmaschinen</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground">Projektpreise ab 10 Einsatztagen</span>
                </li>
              </ul>

              <Button 
                onClick={scrollToForm}
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                size="lg"
                variant="secondary"
              >
                Baumaschinenführer anfragen
              </Button>
            </CardContent>
          </Card>

          {/* Mischmeister für Flüssigboden */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16" />
            <Badge className="absolute top-4 right-4 bg-green-600">
              Neu
            </Badge>
            
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-accent/70 shadow-lg">
                  <Droplets className="h-7 w-7 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Mischmeister Flüssigboden</h3>
                  <p className="text-sm text-muted-foreground">Bundesweit buchbar</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-bold text-foreground">489 €</span>
                  <span className="text-muted-foreground">/Tag</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">8-Stunden-Tag (netto)</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 border border-orange-300">
                  <span className="text-sm font-semibold text-orange-700">Überstunden: 65 €/h</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground">Mischanlage + Radlader + Bagger</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground">CE-Führerschein für Fahrmischer</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground">Bis zu 2 Personen einsparen</span>
                </li>
              </ul>

              <Button 
                onClick={() => navigate('/fluessigboden-service')}
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                size="lg"
                variant="default"
              >
                Mischmeister anfragen
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Neuer Textlink unter den Karten */}
        <div className="text-center mt-8 mb-8">
          <Link 
            to="/fluessigboden-service" 
            className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2"
          >
            Neu: Mischmeister für Flüssigboden jetzt buchbar →
          </Link>
        </div>

        {/* Abrechnungsmodell-Hinweis mit Kundenvorteil */}
        <Card className="max-w-7xl mx-auto mt-4 border-l-4 border-l-primary animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 p-2 h-fit rounded-lg bg-primary/10">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">
                  ✅ Eine Rechnung – Kein Mehraufwand für Sie
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong>Sie erhalten immer nur eine Rechnung direkt von Fahrerexpress – ohne zusätzliche Fahrerabrechnungen.</strong> 
                  Der Fahrer stellt seine Rechnung an uns. Abrechnungsmodell: Agenturabrechnung (Dienst-/Werkleistung durch selbstständige Subunternehmer, keine Arbeitnehmerüberlassung).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProductCards;

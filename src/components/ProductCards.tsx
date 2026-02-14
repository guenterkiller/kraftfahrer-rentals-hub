import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          
          {/* LKW CE Fahrer */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
            <Badge className="absolute top-2 right-2 md:top-3 md:right-3 z-10" variant="default">
              <Star className="h-3 w-3 mr-1" />
              Beliebt
            </Badge>
            
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg flex-shrink-0">
                  <Truck className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-tight">LKW CE Fahrer</h3>
                  <p className="text-xs text-muted-foreground">Bundesweit verfügbar</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex flex-col flex-1">
              <div className="mb-4 pb-4 border-b border-border">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">349 €</span>
                  <span className="text-sm text-muted-foreground">/Tag</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">8-Stunden-Tag (netto)</p>
                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10">
                  <span className="text-xs font-semibold text-primary">Überstunden: 30 €/h</span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100 flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-xs text-foreground">Nah-, Fern- und Baustellenverkehr</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100 flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-xs text-foreground">ADR, Fahrmischer, Kranführer</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100 flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-xs text-foreground">15-Min-Takt nach 8 Std.</span>
                </li>
              </ul>

              <Button 
                onClick={scrollToForm}
                className="w-full h-11 text-sm font-semibold shadow-lg hover:shadow-xl transition-all mt-auto"
                size="lg"
              >
                LKW-Fahrer anfragen
              </Button>
            </CardContent>
          </Card>

          {/* Fernfahrer-Pauschale */}
          <Card className="relative overflow-hidden border-2 hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16" />
            <Badge className="absolute top-2 right-2 md:top-3 md:right-3 z-10 bg-green-600 text-white">
              NEU
            </Badge>
            
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-600 to-green-500 shadow-lg flex-shrink-0">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-tight">Fernfahrer-Pauschale</h3>
                  <p className="text-xs text-muted-foreground">Fernverkehr + Übernachtung</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex flex-col flex-1">
              <div className="mb-4 pb-4 border-b border-border">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-green-700">450 €</span>
                  <span className="text-sm text-muted-foreground">/Tag</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Pauschale pro Einsatztag (netto)</p>
                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 border border-green-300">
                  <span className="text-xs font-semibold text-green-700">Keine Stundenabrechnung</span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100 flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-xs text-foreground">Bis 10 Std. abgegolten</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100 flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-xs text-foreground">Übernachtung im Führerhaus</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100 flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-xs text-foreground">Pauschal – keine Überstunden</span>
                </li>
              </ul>

              <Button 
                onClick={scrollToForm}
                className="w-full h-11 text-sm font-semibold shadow-lg hover:shadow-xl transition-all bg-green-600 hover:bg-green-700 text-white mt-auto"
                size="lg"
              >
                Fernfahrer buchen
              </Button>
            </CardContent>
          </Card>

          {/* Baumaschinenführer */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16" />
            
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-secondary to-secondary/70 shadow-lg flex-shrink-0">
                  <Construction className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-tight">Baumaschinen­führer</h3>
                  <p className="text-xs text-muted-foreground">Deutschlandweit verfügbar</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex flex-col flex-1">
              <div className="mb-4 pb-4 border-b border-border">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-foreground">459 €</span>
                  <span className="text-sm text-muted-foreground">/Tag</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">8-Stunden-Tag (netto)</p>
                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary/10">
                  <span className="text-xs font-semibold text-secondary-foreground">Überstunden: 60 €/h</span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100 flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-xs text-foreground">Bagger, Radlader, Walzen</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100 flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-xs text-foreground">Kranführer, Spezialmaschinen</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100 flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-xs text-foreground">Projektpreise ab 10 Einsatztagen</span>
                </li>
              </ul>

              <Button 
                onClick={scrollToForm}
                className="w-full h-11 text-sm font-semibold shadow-lg hover:shadow-xl transition-all mt-auto"
                size="lg"
                variant="secondary"
              >
                Baumaschinenführer anfragen
              </Button>
            </CardContent>
          </Card>

          {/* Mischmeister für Flüssigboden */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16" />
            <Badge className="absolute top-2 right-2 md:top-3 md:right-3 z-10 bg-primary">
              Seit 2015
            </Badge>
            
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent to-accent/70 shadow-lg flex-shrink-0">
                  <Droplets className="h-6 w-6 text-accent-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-tight">Mischmeister Flüssigboden</h3>
                  <p className="text-xs text-muted-foreground">Bundesweit buchbar</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex flex-col flex-1">
              <div className="mb-4 pb-4 border-b border-border">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-foreground">489 €</span>
                  <span className="text-sm text-muted-foreground">/Tag</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">8-Stunden-Tag (netto)</p>
                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-100 border border-orange-300">
                  <span className="text-xs font-semibold text-orange-700">Überstunden: 65 €/h</span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100 flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-xs text-foreground">Mischanlage + Radlader + Bagger</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100 flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-xs text-foreground">CE-Führerschein für Fahrmischer</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100 flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-xs text-foreground">Bis zu 2 Personen einsparen</span>
                </li>
              </ul>

              <Button 
                onClick={() => navigate('/fluessigboden-service')}
                className="w-full h-11 text-sm font-semibold shadow-lg hover:shadow-xl transition-all mt-auto"
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
            className="text-primary underline decoration-primary/50 hover:decoration-primary transition-colors inline-flex items-center gap-2"
          >
            Mischmeister für Flüssigboden – bundesweit buchbar →
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

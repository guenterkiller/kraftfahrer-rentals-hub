import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Globe, CreditCard, Shield, CheckCircle } from "lucide-react";

const EUDriverRecruitment = () => {
  const euCountries = [
    { flag: "🇩🇪", name: "Deutschland", lang: "de" },
    { flag: "🇵🇱", name: "Polen", lang: "pl", translation: "Polska" },
    { flag: "🇷🇴", name: "Rumänien", lang: "ro", translation: "România" },
    { flag: "🇧🇬", name: "Bulgarien", lang: "bg", translation: "България" },
    { flag: "🇭🇺", name: "Ungarn", lang: "hu", translation: "Magyarország" },
    { flag: "🇨🇿", name: "Tschechien", lang: "cs", translation: "Česko" },
    { flag: "🇸🇰", name: "Slowakei", lang: "sk", translation: "Slovensko" },
    { flag: "🇦🇹", name: "Österreich", lang: "de-AT" },
    { flag: "🇨🇭", name: "Schweiz", lang: "de-CH" },
  ];

  const benefits = [
    {
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      title: "Transparente Bezahlung",
      titleEn: "Transparent Payment",
      description: "Faire Tagessätze ab 349 € – faire und transparente Vergütung",
      descriptionEn: "Fair daily rates from €349 – fair and transparent compensation"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Klare Vertragsstruktur",
      titleEn: "Clear Contract Structure",
      description: "Selbstständige Tätigkeit auf Basis klarer Vertrags- und Abrechnungsstrukturen",
      descriptionEn: "Self-employed work based on clear contract and billing structures"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Bundesweite Einsätze",
      titleEn: "Nationwide Assignments",
      description: "Vielfältige Aufträge in ganz Deutschland und EU",
      descriptionEn: "Diverse assignments throughout Germany and EU"
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "EU-weite Vermittlung",
      titleEn: "EU-wide Placement",
      description: "Wir vermitteln selbstständige Unternehmer aus allen EU/EWR-Ländern – je nach Qualifikation und rechtlicher Einsatzmöglichkeit",
      descriptionEn: "We place self-employed professionals from all EU/EEA countries – depending on qualifications and legal requirements"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20" id="eu-fahrer">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            EU-Fahrer willkommen – Kierowcy z UE mile widziani
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-2">
            Wir vermitteln qualifizierte LKW-Fahrer, Baumaschinenführer und Mischmeister aus der gesamten Europäischen Union
          </p>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto italic">
            We place qualified truck drivers, construction machine operators and liquid screed specialists from across the European Union
          </p>
        </div>

        {/* EU Länder Flags */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-scale-in">
          {euCountries.map((country, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 bg-card hover:bg-accent p-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-sm"
            >
              <span className="text-4xl" role="img" aria-label={country.name}>
                {country.flag}
              </span>
              <span className="text-sm font-medium text-card-foreground">
                {country.translation || country.name}
              </span>
            </div>
          ))}
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in">
              <CardHeader>
                <div className="mb-4">{benefit.icon}</div>
                <CardTitle className="text-xl mb-2">{benefit.title}</CardTitle>
                <CardDescription className="text-xs italic text-muted-foreground">
                  {benefit.titleEn}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{benefit.description}</p>
                <p className="text-xs italic text-muted-foreground">{benefit.descriptionEn}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Multilingual CTA Section */}
        <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-8 mb-8 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-6 text-foreground">
              Jetzt als EU-Fahrer registrieren
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-card p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  🇩🇪 Für deutsche Fahrer
                </h4>
                <p className="text-sm text-muted-foreground">
                  Bundesweite Vermittlung, transparente Konditionen, schnelle Abwicklung
                </p>
              </div>
              
              <div className="bg-card p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  🇪🇺 For EU drivers
                </h4>
                <p className="text-sm text-muted-foreground">
                  Work legally in Germany, fair payment, support in English
                </p>
              </div>
              
              <div className="bg-card p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  🇵🇱 Dla polskich kierowców
                </h4>
                <p className="text-sm text-muted-foreground">
                  Legalna praca w Niemczech, uczciwe wynagrodzenie, wsparcie
                </p>
              </div>
              
              <div className="bg-card p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  🇷🇴 Pentru șoferi români
                </h4>
                <p className="text-sm text-muted-foreground">
                  Muncă legală în Germania, plată corectă, suport disponibil
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                asChild
              >
                <Link to="/fahrer-registrierung">
                  🚀 Jetzt registrieren / Register now
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                asChild
              >
                <a href="tel:+4915771442285">
                  📞 Kostenlose Beratung / Free consultation
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* SEO-optimized multilingual keywords section */}
        <div className="text-center text-sm text-muted-foreground max-w-4xl mx-auto">
          <p className="mb-2">
            <strong>Suche nach:</strong> LKW Fahrer aus Polen, Rumänien, Bulgarien, Ungarn • Kierowcy ciężarówek z Polski do Niemiec • 
            Șoferi profesioniști români în Germania • Bulgarian truck drivers Germany • EU Fahrer Vermittlung • 
            Internationale LKW-Fahrer • Berufskraftfahrer EU-Ausland • Europäische Kraftfahrer Deutschland • Fahrer aus EU-Ländern
          </p>
        </div>
      </div>
    </section>
  );
};

export default EUDriverRecruitment;
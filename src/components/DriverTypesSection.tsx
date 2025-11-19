import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import lkwFahrerHero from "@/assets/lkw-fahrer-hero.jpg";
import tankwagenFahrer from "@/assets/tankwagen-fahrer.jpg";
import kranFahrer from "@/assets/kran-fahrer.jpg";
import fahrmischerFahrer from "@/assets/fahrmischer-fahrer.jpg";

const DriverTypesSection = () => {
  const driverTypes = [
    {
      title: "LKW CE Fahrer",
      subtitle: "Vermittelte Fahrer",
      description: "349 € pro Tag (8 Stunden) • 30 € Überstunde",
      image: lkwFahrerHero,
      features: ["Alle Speditions- & Logistikeinsätze", "Fahrmischer, ADR, Fernverkehr", "Wechselbrücke, Container, Hängerzug", "Entsorgung, Baustelle, Eventlogistik"],
      path: "/lkw-fahrer-buchen",
      isPremium: false
    },
    {
      title: "Baumaschinenbedienung",
      subtitle: "Vermittelte Baumaschinenführer",
      description: "459 € pro Tag (8 Stunden) • 60 € Überstunde",
      image: "/lovable-uploads/b2cd4743-98d6-4618-81c8-418636570dfc.png",
      features: ["Bagger, Radlader, Fahrmischer", "Flüssigboden, Mischanlagen", "Störungsbehebung & Reparaturen", "Baustellenlogistik & Materialfluss"],
      path: "/baumaschinenfuehrer-buchen",
      isPremium: true
    }
  ];

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Success Banner with new 2-category structure */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 px-6 py-3 rounded-full">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-800 font-semibold">
              Klare Preisstruktur – Spedition 349€ oder Baumaschinenbedienung 459€
            </span>
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          LKW/Spedition oder Baumaschinen – Sie haben die Wahl
        </h2>
        <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
          Vermittelte CE-Fahrer für alle Speditions-Einsatzarten oder vermittelte Baumaschinenführer für Bagger, Radlader & mehr – 
          alle arbeiten als selbstständige Subunternehmer nach § 84 HGB.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
          {driverTypes.map((type, index) => (
            <Card key={index} className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${type.isPremium ? 'border-2 border-primary' : ''}`}>
              {type.isPremium && (
                <div className="bg-primary text-primary-foreground text-center py-2 font-semibold">
                  🏗️ Baumaschinenführer
                </div>
              )}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={type.image} 
                  alt={type.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl">{type.title}</CardTitle>
                {type.subtitle && (
                  <p className="text-sm text-muted-foreground">{type.subtitle}</p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-lg font-semibold text-primary">{type.description}</p>
                
                <ul className="space-y-2">
                  {type.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  asChild 
                  className="w-full" 
                  variant={type.isPremium ? "default" : "outline"}
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).gtag) {
                      (window as any).gtag('event', type.isPremium ? 'category_click_premium' : 'category_click_standard', {
                        event_category: 'Driver Category',
                        event_label: type.title,
                        value: type.isPremium ? 459 : 349
                      });
                    }
                  }}
                >
                  <Link to={type.path}>
                    {type.isPremium ? "Premiumfahrer buchen" : "CE-Fahrer buchen"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing summary */}
        <div className="mt-12 p-6 bg-muted rounded-lg max-w-3xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-2">
            <strong>Fahrtkosten:</strong> 25 km inklusive, danach 0,40 € pro km • <strong>Wochenpreise:</strong> CE ab 1.490 €/Woche
          </p>
          <p className="text-xs text-muted-foreground">
            Alle Fahrer arbeiten selbstständig nach § 84 HGB. Keine Arbeitnehmerüberlassung.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DriverTypesSection;
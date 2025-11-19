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
      title: "Premium – All-in-One Maschinenbediener",
      subtitle: "Günter Killer persönlich",
      description: "459 € pro Tag (8 Stunden) • 60 € Überstunde",
      image: "/lovable-uploads/b2cd4743-98d6-4618-81c8-418636570dfc.png",
      features: ["Bagger, Radlader, Fahrmischer", "Flüssigboden, Mischanlagen", "Störungsbehebung & Reparaturen", "Baustellenlogistik & Materialfluss"],
      path: "/baumaschinenfuehrer-buchen",
      isPremium: true
    },
    {
      title: "Standard – CE-LKW-Fahrer",
      subtitle: "Vermittelte Fahrer",
      description: "349 € pro Tag (8 Stunden) • 30 € Überstunde",
      image: lkwFahrerHero,
      features: ["Einheitlich für alle CE-Arten", "Fahrmischer, ADR, Fernverkehr", "Baustellenverkehr, Container", "Express, Kurier, Eventlogistik"],
      path: "/lkw-fahrer-buchen",
      isPremium: false
    }
  ];

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Success Banner */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 px-6 py-3 rounded-full">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-800 font-semibold">
              Über 500 erfolgreiche Einsätze seit 2009 – geprüft & rechtssicher vermittelt
            </span>
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Fahrer-Sparten – schnell & bundesweit verfügbar
        </h2>
        <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
          Spezialisierte Fahrer für jeden Einsatzbereich. Von Standard-LKW bis Gefahrgut – 
          alle Fahrer sind geprüft, versichert und als selbstständige Subunternehmer tätig.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {driverTypes.map((type, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={type.image} 
                  alt={`${type.title} - Professionelle Fahrer für ${type.title.toLowerCase()} deutschlandweit verfügbar über Fahrerexpress`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold mb-1">{type.title}</h3>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg">{type.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {type.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {type.features.map((feature, featureIndex) => (
                    <span 
                      key={featureIndex}
                      className="inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                <Button asChild className="w-full">
                  <Link to={type.path}>
                    {type.title} buchen
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Keywords Section */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold mb-4">
            Weitere Fahrerarten – schnell & bundesweit verfügbar
          </h3>
           <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/begleitfahrzeuge-bf3" className="text-primary hover:underline">
              BF3-Begleitfahrzeuge buchen
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/tankwagenfahrer-buchen" className="text-primary hover:underline">
              Tankwagenfahrer buchen
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/adr-fahrer-buchen" className="text-primary hover:underline">
              ADR-Fahrer mieten
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/fahrmischerfahrer-buchen" className="text-primary hover:underline">
              Fahrmischerfahrer gesucht
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriverTypesSection;
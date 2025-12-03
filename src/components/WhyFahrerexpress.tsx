import { Shield, Euro, Wrench, Phone, Briefcase, TrendingUp } from "lucide-react";

const WhyFahrerexpress = () => {
  const benefits = [
    {
      icon: Shield,
      title: "Selbstständige Profis",
      description: "Rechtssichere Zusammenarbeit mit selbstständigen Fahrern deutschlandweit"
    },
    {
      icon: Euro,
      title: "Transparente Tagessätze",
      description: "Ohne versteckte Kosten – Sie wissen genau, was Sie zahlen"
    },
    {
      icon: Wrench,
      title: "Spezialisierung auf LKW & Baumaschinen",
      description: "Fokus auf Baustellenlogistik und Transportwesen in ganz Deutschland"
    },
    {
      icon: Phone,
      title: "Persönlicher Ansprechpartner",
      description: "Kurze Wege statt anonymes Callcenter – bundesweite Betreuung"
    },
    {
      icon: Briefcase,
      title: "Erfahrene Fahrer",
      description: "Mit eigener Berufserfahrung im Bau- und Logistikbereich"
    },
    {
      icon: TrendingUp,
      title: "Deutschlandweite Vermittlung",
      description: "Fahrer kurzfristig verfügbar – bundesweit einsetzbar"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Warum mit Fahrerexpress arbeiten?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ihre Vorteile bei der Zusammenarbeit mit uns
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={index} 
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/30"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyFahrerexpress;

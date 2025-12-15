import { Shield, Euro, Wrench, Phone, Briefcase, TrendingUp } from "lucide-react";

const WhyFahrerexpress = () => {
  const benefits = [
    {
      icon: Shield,
      title: "Ersatzfahrer bei Fahrerausfall",
      description: "Aushilfsfahrer und Vertretungsfahrer bei Krankheit oder Urlaub – kurzfristig verfügbar"
    },
    {
      icon: Euro,
      title: "Mietfahrer ab 349 €/Tag",
      description: "Transparente Tagessätze – Leihfahrer und Mietfahrer ohne versteckte Kosten"
    },
    {
      icon: Wrench,
      title: "Kipper, Baustelle, Sattelzug",
      description: "Kipper-Fahrer, Baustellen-Fahrer, Fahrmischer-Fahrer und CE-Fahrer deutschlandweit"
    },
    {
      icon: Phone,
      title: "Fahrer Dienstleister",
      description: "Ihr Fahrer-Personal Ansprechpartner – externe LKW Fahrer auf Abruf bestellen"
    },
    {
      icon: Briefcase,
      title: "Fahrer tageweise buchen",
      description: "Fahrer tageweise oder wochenweise leihen – flexibel nach Ihrem Bedarf"
    },
    {
      icon: TrendingUp,
      title: "Fahrer sofort deutschlandweit",
      description: "Fahrer Personalvermittlung bundesweit – Notfallfahrer in 24-72 Stunden"
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

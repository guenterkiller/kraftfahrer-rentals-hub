import { Shield, CheckCircle, FileCheck, Users } from "lucide-react";

const TrustSignals = () => {
  const signals = [
    {
      icon: CheckCircle,
      text: "Alle Fahrer geprüft & versichert"
    },
    {
      icon: FileCheck,
      text: "Transparente Abrechnung"
    },
    {
      icon: Shield,
      text: "Keine Sozialversicherungspflicht"
    },
    {
      icon: Users,
      text: "Über 500 erfolgreiche Vermittlungen"
    }
  ];

  return (
    <section className="py-8 bg-gradient-to-r from-green-50 to-blue-50 border-y border-green-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {signals.map((signal, index) => {
            const Icon = signal.icon;
            return (
              <div 
                key={index} 
                className="flex flex-col items-center text-center gap-2 p-4 bg-white/60 backdrop-blur-sm rounded-lg hover:shadow-md transition-shadow"
              >
                <Icon className="h-8 w-8 text-green-600" />
                <p className="text-xs md:text-sm font-medium text-gray-800 leading-tight">
                  {signal.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;

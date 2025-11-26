import { Card, CardContent } from "@/components/ui/card";
import { Send, Settings, CheckCircle, Receipt } from "lucide-react";

const HowItWorksTimeline = () => {
  const steps = [
    {
      icon: Send,
      title: "1. Anfrage senden",
      description: "Eckdaten über unser Formular oder telefonisch übermitteln. Alle relevanten Informationen werden strukturiert erfasst."
    },
    {
      icon: Settings,
      title: "2. Disposition",
      description: "Wir prüfen verfügbare Fahrer und weisen den passenden Kandidaten über unseren Adminbereich zu. Schnell und zielgerichtet."
    },
    {
      icon: CheckCircle,
      title: "3. Einsatzbestätigung",
      description: "Sie erhalten die Bestätigung mit allen Details. Der Fahrer nimmt direkten Kontakt auf und koordiniert den Einsatzstart."
    },
    {
      icon: Receipt,
      title: "4. Abrechnung",
      description: "Sie erhalten eine übersichtliche Rechnung für die erbrachte Leistung. Unsere Fahrer arbeiten als selbstständige Unternehmer auf Basis eines Dienst-/Werkvertrags – keine Arbeitnehmerüberlassung."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">
          So läuft's ab
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Von der Anfrage bis zur Abrechnung – transparent und rechtssicher
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Card key={index} className="text-center relative">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
                
                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-primary">
                    <div className="w-6 h-6 border-t-2 border-r-2 border-primary transform rotate-45"></div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksTimeline;
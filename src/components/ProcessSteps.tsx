import { Send, UserCheck, Truck } from "lucide-react";

const ProcessSteps = () => {
  const steps = [
    {
      icon: Send,
      title: "Anfrage senden",
      description: "Online-Formular mit Einsatzort, Zeitraum, Fahrzeugart & Anforderungen ausfüllen."
    },
    {
      icon: UserCheck,
      title: "Passende Unternehmer vorgeschlagen bekommen",
      description: "Wir prüfen passende selbstständige Unternehmer und melden uns schnellstmöglich mit einer Rückmeldung."
    },
    {
      icon: Truck,
      title: "Einsatz starten",
      description: "Der selbstständige Unternehmer stimmt die Details direkt mit Ihnen ab. Mit Bestätigung des Einsatzes entsteht ein verbindlicher Auftrag."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ablauf der Fahrervermittlung
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Von der Anfrage bis zum Einsatz – einfach, transparent und rechtssicher in 3 Schritten
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto left-0 right-0 w-fit">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Hinweise */}
        <div className="text-center mb-8 max-w-3xl mx-auto space-y-3">
          <p className="text-muted-foreground leading-relaxed">
            <strong>Kurz erklärt:</strong> Anfrage senden → passende selbstständige Unternehmer werden vorgeschlagen → Einsatz erfolgt nach Bestätigung. Keine Arbeitnehmerüberlassung (AÜG).
          </p>
          <p className="text-sm text-muted-foreground">
            Mit Absenden des Formulars stellen Sie eine verbindliche Anfrage zur Fahrerdisposition. Ein kostenpflichtiger Auftrag entsteht erst nach Bestätigung durch Fahrerexpress und erfolgreicher Fahrerzuteilung. Die Auftragsbestätigung kann in Textform erfolgen; eine Bestätigung per E-Mail ist ausreichend.
          </p>
        </div>

        <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-3xl mx-auto">
          <p className="text-sm text-blue-900">
            <strong>Die Abrechnung erfolgt über die Fahrerexpress-Agentur.</strong> Vertragspartner ist Fahrerexpress. Die Fahrer arbeiten eigenverantwortlich auf Basis eines Dienst- oder Werkvertrags – keine Arbeitnehmerüberlassung.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;

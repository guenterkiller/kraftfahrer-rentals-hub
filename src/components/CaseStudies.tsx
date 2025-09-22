import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CaseStudies = () => {
  const scrollToBooking = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.querySelector('#fahreranfrage');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const cases = [
    {
      title: "Spedition (Frankfurt)",
      description: "Ersatzfahrer, Start in der Folgewoche, 8 Tage",
      result: "Termintreu, klare Abrechnung.",
      icon: "🚚"
    },
    {
      title: "Betonlogistik (München)",
      description: "Fahrmischer & Mischmeister, 3 Wochen",
      result: "Reibungslose Übergabe.",
      icon: "🧱"
    },
    {
      title: "Eventlogistik (Berlin)",
      description: "Roadshow, 5 Städte",
      result: "Flexibel trotz Planänderungen.",
      icon: "🎤"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">
          Fallbeispiele aus der Praxis
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Erfolgreiche Einsätze unserer Fahrer – von Kurzeinsätzen bis zu mehrwöchigen Projekten
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {cases.map((caseStudy, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">{caseStudy.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{caseStudy.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {caseStudy.description}
                </p>
                <p className="text-sm font-medium text-green-600">
                  „{caseStudy.result}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button 
            size="lg"
            onClick={scrollToBooking}
            className="bg-primary hover:bg-primary/90"
          >
            Ähnlichen Einsatz anfragen
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Marcus Weber",
      company: "Weber Spedition GmbH",
      rating: 5,
      text: "Seit Jahren zuverlässig – schnelle Vermittlung auch bei Notfällen. Top Fahrer!",
      location: "Frankfurt am Main"
    },
    {
      name: "Sandra Müller",
      company: "Bauunternehmen Müller",
      rating: 5,
      text: "Professionelle Baumaschinenführer, die unser Projekt termingerecht abgeschlossen haben.",
      location: "München"
    },
    {
      name: "Thomas Klein",
      company: "Klein Transport AG",
      rating: 5,
      text: "Kurzfristige Verfügbarkeit und faire Preise. Sehr empfehlenswert für Personalengpässe.",
      location: "Hamburg"
    },
    {
      name: "Andrea Schmidt",
      company: "Event Logistics Pro",
      rating: 5,
      text: "Für unsere Roadshows immer die perfekten Fahrer gefunden. Absolut zuverlässig!",
      location: "Berlin"
    }
  ];

  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Kundenstimmen</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Vertrauen Sie auf die Erfahrungen unserer zufriedenen Kunden aus ganz Deutschland
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-primary mb-4" />
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="border-t pt-4">
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12 space-y-4">
          <div className="inline-flex items-center gap-6 bg-white rounded-lg px-6 py-4 shadow-md">
            <div className="text-center border-r pr-6">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-xs text-muted-foreground">Erfolgreiche<br/>Vermittlungen</div>
            </div>
            <div className="text-center border-r pr-6">
              <div className="text-3xl font-bold text-green-600">8/10</div>
              <div className="text-xs text-muted-foreground">Kunden buchen<br/>erneut</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">15+</div>
              <div className="text-xs text-muted-foreground">Jahre<br/>Erfahrung</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Bundesweite Vermittlung • Rechtskonforme Abwicklung • Faire Konditionen
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
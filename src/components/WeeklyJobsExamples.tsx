import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Euro } from "lucide-react";
import { Link } from "react-router-dom";

const WeeklyJobsExamples = () => {
  const jobs = [
    {
      region: "Raum NRW",
      type: "C+E Tageseinsatz",
      duration: "3 Tage",
      rate: "399–459 €",
      description: "Fernverkehr Deutschland"
    },
    {
      region: "Bayern",
      type: "Fahrmischer",
      duration: "1 Woche",
      rate: "429–489 €",
      description: "Betonlogistik München"
    },
    {
      region: "Niedersachsen",
      type: "ADR-Fahrer",
      duration: "5 Tage",
      rate: "459–519 €",
      description: "Gefahrguttransport"
    },
    {
      region: "Hessen",
      type: "Kranfahrer",
      duration: "2 Wochen",
      rate: "469–529 €",
      description: "Baustellen Frankfurt"
    },
    {
      region: "Berlin/Brandenburg",
      type: "Baumaschinenführer",
      duration: "Projekt",
      rate: "439–499 €",
      description: "Erdbau & Tiefbau"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">
          Einsätze dieser Woche (Beispiele)
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Aktuelle Einsatzmöglichkeiten für registrierte Fahrer – anonymisiert dargestellt
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {jobs.map((job, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-blue-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">{job.region}</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <Euro className="h-4 w-4" />
                    <span className="text-sm font-bold">{job.rate}</span>
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{job.type}</h3>
                <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                <p className="text-sm text-blue-600 font-medium">
                  Dauer: {job.duration}
                </p>
                
                <div className="mt-4 pt-4 border-t">
                  <span className="text-xs text-muted-foreground">
                    Netto/Tag · Für registrierte Fahrer
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button 
            size="lg"
            asChild
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Link to="/fahrer-registrierung">
              Jetzt registrieren & Jobalarm aktivieren
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WeeklyJobsExamples;
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Users, Wrench, MapPin, Clock, CheckCircle } from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: Users,
      title: "Personalengpass überbrücken",
      description: "Vermittlung selbstständiger LKW- und Busfahrer bei Krankheit, Urlaub, Auftragsspitzen oder Fahrermangel"
    },
    {
      icon: Truck,
      title: "Fahrzeugüberführungen",
      description: "Fahrzeugüberführungen und Auslieferungen mit Ihren Fahrzeugen (LKW, Bus, Wohnmobil, Sonderfahrzeuge)"
    },
    {
      icon: Wrench,
      title: "Baumaschinenführer",
      description: "Vermittlung von selbstständigen Baumaschinenführern (z. B. Bagger, Radlader)"
    },
    {
      icon: MapPin,
      title: "Projektlösungen",
      description: "Projektbezogene Fahrerlösungen für Speditionen, Bau- und Entsorgungsbetriebe, Events und Roadshows"
    }
  ];

  const qualifications = [
    "CE-Führerschein",
    "Fahrerkarte",
    "Modul 95",
    "ADR (bei Bedarf)",
    "Kran-/Staplerschein",
    "Mischmeister für Flüssigboden",
    "Fahrmischerfahrer"
  ];

  const specialServices = [
    "Ersatzfahrer auf selbstständiger Basis",
    "Werbe-, Messe- und Showfahrzeuge",
    "Express- und Kurierfahrten",
    "Roadshows und Eventlogistik"
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Leistungen im Überblick</h2>
        <p className="text-center text-lg text-muted-foreground mb-12">Finden Sie schnell den passenden Fahrer für Ihren Bedarf</p>
        
        {/* Spezialized Driver Landing Pages */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">LKW-Fahrer (C+E)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">Sattelzug & Fernverkehr</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/lkw-fahrer-buchen">LKW-Fahrer buchen</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Kraftfahrer allgemein</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">Alle Fahrzeugklassen</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/kraftfahrer-mieten">Kraftfahrer mieten</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Fahrmischerfahrer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">Betonmischer & Baustelle</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/fahrmischerfahrer-gesucht">Fahrmischerfahrer finden</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Wrench className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Baumaschinenführer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">Bagger, Radlader, Kran</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/baumaschinenfuehrer-buchen">Baumaschinenführer buchen</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Baumaschinenführer & Subunternehmer Details */}
        <div className="mb-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Wrench className="h-6 w-6 text-primary" />
                Baumaschinenführer & Subunternehmer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Wir vermitteln deutschlandweit selbstständige Baumaschinenführer als Subunternehmer – 
                immer mit Geräten, die vom Auftraggeber gestellt werden.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Baggerfahrer für Aushub & Erdarbeiten</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Radladerfahrer für Verladearbeiten</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Mischmeister für Flüssigbodenanlagen</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Weitere Baumaschinenführer nach Bedarf</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Wichtiger Hinweis:</p>
                  <p className="text-sm text-muted-foreground">
                    Alle Einsätze erfolgen als Dienst-/Werkleistung durch selbstständige Subunternehmer. 
                    Keine Arbeitnehmerüberlassung, keine Maschinenvermietung – Sie stellen die Geräte, 
                    wir den passenden Fahrer.
                  </p>
                </div>
              </div>
              
              <div className="text-center pt-4">
                <Button asChild>
                  <Link to="/baumaschinenfuehrer-buchen">Jetzt Baumaschinenführer buchen</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <service.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Fahrerprofile & Qualifikationen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {qualifications.map((qualification, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{qualification}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Besondere Einsatzbereiche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {specialServices.map((service, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
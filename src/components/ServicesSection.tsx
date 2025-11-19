import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Users, Wrench, MapPin, Clock, CheckCircle, HardHat, ShieldCheck } from "lucide-react";

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
    "Staplerführerschein",
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
        <p className="text-center text-lg text-muted-foreground mb-12">LKW/Spedition oder Baumaschinen – transparente Preise für alle Einsatzarten</p>
        
        {/* Main 2 Categories */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          <Link to="/lkw-fahrer-buchen">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="bg-muted text-muted-foreground py-2 font-semibold">LKW- / Speditionsfahrer</div>
              <CardHeader>
                <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">CE-Fahrer (Vermittelt)</CardTitle>
                <p className="text-sm text-muted-foreground">Alle Speditions-Einsatzarten</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary mb-2">349 €/Tag</p>
                <p className="text-sm text-muted-foreground mb-4">Fahrmischer, ADR, Fernverkehr, Wechselbrücke, Container, Baustelle, Eventlogistik</p>
                <Button variant="outline" size="sm" className="w-full">CE-Fahrer buchen</Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/baumaschinenfuehrer-buchen">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer h-full border-2 border-primary">
              <div className="bg-primary text-primary-foreground py-2 font-semibold">🏗️ Baumaschinenführer</div>
              <CardHeader>
                <HardHat className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">Baumaschinenbedienung</CardTitle>
                <p className="text-sm text-muted-foreground">Vermittelte Baumaschinenführer</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary mb-2">459 €/Tag</p>
                <p className="text-sm text-muted-foreground mb-4">Bagger, Radlader, Fahrmischer, Flüssigboden, Mischanlagen, Störungsbehebung</p>
                <Button size="sm" className="w-full">Baumaschinenführer buchen</Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Services Overview Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {services.map((service, index) => (
            <Card key={index}>
              <CardHeader>
                <service.icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-base">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Qualifications & Special Services */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Qualifikationen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {qualifications.map((qual, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    {qual}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Verfügbarkeit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  24-72h Vorlauf (werktags)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  Tages- bis Projekteinsätze
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  Bundesweit verfügbar
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  Wochenpreise verfügbar
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Spezialleistungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {specialServices.map((service, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-primary">→</span>
                    {service}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Legal Notice */}
        <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3">Rechtssichere Subunternehmer</h3>
            <p className="text-muted-foreground mb-6">
              Alle Fahrer und Maschinenbediener arbeiten als selbstständige Subunternehmer nach § 84 HGB. 
              Keine Arbeitnehmerüberlassung. Vollständig versichert und rechtssicher. Abrechnung über Fahrerexpress.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/baumaschinenfuehrer-buchen">
                <Button size="lg" className="gap-2">
                  <HardHat className="h-5 w-5" />
                  Premium buchen
                </Button>
              </Link>
              <Link to="/lkw-fahrer-buchen">
                <Button size="lg" variant="outline" className="gap-2">
                  <Truck className="h-5 w-5" />
                  Standard CE buchen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
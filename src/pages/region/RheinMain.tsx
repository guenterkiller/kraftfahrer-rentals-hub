import { useSEO } from '@/hooks/useSEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, MapPin, Clock, Users, Shield, Star } from 'lucide-react';

const RheinMain = () => {
  const seoData = {
    title: "LKW-Fahrer & Kraftfahrer mieten im Rhein-Main-Gebiet | Fahrerexpress",
    description: "Professionelle LKW-Fahrer, Kranführer & Baumaschinenführer im Rhein-Main-Gebiet. Keine Same-Day-Buchung. Jetzt Fahrer mieten!",
    keywords: "LKW Fahrer Rhein-Main, Kraftfahrer mieten Rhein-Main-Gebiet, Kranführer Frankfurt, Baumaschinenführer Rhein-Main, ADR Fahrer, Main-Taunus",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Kraftfahrer-Vermittlung Rhein-Main-Gebiet",
      "description": "Professionelle Vermittlung von LKW-Fahrern, Kranführern und Baumaschinenführern im Rhein-Main-Gebiet",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Fahrerexpress-Agentur - Günter Killer",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Walther-von-Cronberg-Platz 12",
          "addressLocality": "Frankfurt am Main",
          "postalCode": "60594",
          "addressCountry": "DE"
        }
      },
      "areaServed": {
        "@type": "Place",
        "name": "Rhein-Main-Gebiet",
        "containedInPlace": {
          "@type": "State",
          "name": "Hessen"
        }
      },
      "serviceType": "Fahrerdienstleistungen",
      "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": "https://kraftfahrer-mieten.com/rhein-main",
        "servicePhone": "+49-1577-1442285"
      }
    }
  };

  useSEO(seoData);

  const scrollToBooking = () => {
    const element = document.getElementById('fahreranfrage');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Skip to content */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
        Zum Hauptinhalt springen
      </a>

      {/* Header */}
      <header className="bg-gradient-to-r from-primary via-primary to-primary-glow text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              LKW-Fahrer & Kraftfahrer mieten im Rhein-Main-Gebiet
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Metropolregion-Spezialist für Fahrerdienstleistungen. Von Frankfurt über Wiesbaden bis Mainz – 
              Kurze Wege, dichte Infrastruktur. 🇪🇺 EU/EWR-Fahrer verfügbar.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Metropolregion-Expert</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>Kurze Anfahrtswege</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Planbare Verfügbarkeit</span>
              </div>
            </div>
            <Button 
              onClick={scrollToBooking}
              size="lg" 
              variant="secondary"
              className="mr-4 bg-white text-primary hover:bg-white/90"
            >
              Fahrer jetzt sichern
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary"
              asChild
            >
              <a href="tel:+4915771442285">Jetzt anrufen</a>
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="py-16">
        <div className="container mx-auto px-4">
          {/* Intro Section */}
          <section className="max-w-4xl mx-auto mb-16">
            <div className="bg-card rounded-lg p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Ihr Fahrer-Partner im Rhein-Main-Gebiet
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Das Rhein-Main-Gebiet ist Deutschlands Wirtschaftszentrum mit höchster Infrastrukturdichte. 
                Als lokal ansässige Agentur in Frankfurt kennen wir die besonderen Herausforderungen: 
                dichten Verkehr, komplexe Verkehrsführung und hohe Qualitätsansprüche. 
                Unsere Fahrer sind darauf spezialisiert.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Frankfurt</h3>
                  <p className="text-sm text-muted-foreground">Banken, Messen, Flughafen – Kerngebiet</p>
                </div>
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Mainz/Wiesbaden</h3>
                  <p className="text-sm text-muted-foreground">Landeshauptstädte, Verwaltung, Industrie</p>
                </div>
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Kreise</h3>
                  <p className="text-sm text-muted-foreground">Main-Taunus, Hochtaunus, Rheingau, Groß-Gerau</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Metropolregion-Expertise
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Unsere Fahrer kennen die Verkehrsströme, Umweltzonen und 
                    logistischen Besonderheiten der dichtesten Region Deutschlands.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Kurze Reaktionszeiten
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Durch lokale Präsenz und kurze Wege können wir im Rhein-Main-Gebiet 
                    besonders schnell reagieren – planbar und zuverlässig.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              Fahrerleistungen im Rhein-Main-Gebiet
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    LKW-Fahrer (C/CE)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    City-Logistik und Fernverkehr im dichtesten Verkehrsgebiet. 
                    Erfahren mit Umweltzonen, Zufahrtsbeschränkungen und Zeitfenstern.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• City-Logistik Frankfurt</li>
                    <li>• Umweltzonen-konform</li>
                    <li>• Zeitfenster-Management</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    ADR-Fahrer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Gefahrguttransporte zu Chemiestandorten Frankfurt, Höchst und 
                    Wiesbaden. Spezialkenntnisse für Industriegebiet Rhein-Main.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• Industriepark Höchst</li>
                    <li>• Chemiestandorte RMG</li>
                    <li>• Flughafen Frankfurt</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Kranführer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hochhaus-Baustellen Frankfurt, Banken-Towers und Infrastruktur. 
                    Spezialisiert auf beengte Platzverhältnisse in der Metropole.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• Hochhaus-Montage FFM</li>
                    <li>• Stadtkrane Innenstadt</li>
                    <li>• Infrastruktur RMG</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Fahrmischerfahrer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Betonlieferungen für Wohnungsbau und Infrastruktur-Projekte. 
                    Routiniert mit der komplexen Verkehrssituation im Ballungsraum.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• Wohnungsbau RMG</li>
                    <li>• Verkehrsinfrastruktur</li>
                    <li>• Rush-Hour Management</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Baumaschinenführer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tiefbau, Straßenbau und Erschließung in der Metropolregion. 
                    Erfahren mit Verkehrsführung und Lärmschutzbestimmungen.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• U-Bahn Frankfurt</li>
                    <li>• Straßenbau A66/A661</li>
                    <li>• Lärmschutz-konform</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    BF3-Begleitfahrzeuge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Schwertransport-Begleitung durch das dichteste Verkehrsnetz. 
                    Koordination mit Polizei Frankfurt und Verkehrszentrale Hessen.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• A3/A5 Kreuz FFM</li>
                    <li>• City-Durchfahrten</li>
                    <li>• Behörden-Kontakte</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Reference Case */}
          <section className="mb-16">
            <div className="bg-muted rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Referenz aus dem Rhein-Main-Gebiet
              </h2>
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 rounded-full p-3">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">
                          Messe-Logistik Frankfurt
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Für eine internationale Automobilmesse in Frankfurt vermittelten wir 
                          kurzfristig LKW-Fahrer für den Auf- und Abbau. Trotz dichtem Messeverkehr 
                          und engen Zeitfenstern erfolgte die Logistik reibungslos.
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium">Fahrzeuge:</span> 5x Sattelzug
                          </div>
                          <div>
                            <span className="font-medium">Dauer:</span> 1 Woche
                          </div>
                          <div>
                            <span className="font-medium">Besonderheit:</span> Messe-Zeitfenster
                          </div>
                          <div>
                            <span className="font-medium">Vorlauf:</span> 48 Stunden
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Regional Advantages */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              Vorteile im Rhein-Main-Gebiet
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Kurze Anfahrt</h3>
                  <p className="text-sm text-muted-foreground">
                    Maximale Entfernung 50km – kurze Wege sparen Zeit und Kosten
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Lokale Kenntnisse</h3>
                  <p className="text-sm text-muted-foreground">
                    Verkehrsführung, Umweltzonen und Zufahrtsbeschränkungen bekannt
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Dichte Verfügbarkeit</h3>
                  <p className="text-sm text-muted-foreground">
                    Viele qualifizierte Fahrer in der Metropolregion ansässig
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Infrastruktur-Experten</h3>
                  <p className="text-sm text-muted-foreground">
                    Spezialkenntnisse für Flughafen, Messe und Banken-Viertel
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Links Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              Weitere Informationen
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Preise & Ablauf</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Transparente Preise für Rhein-Main-Einsätze
                  </p>
                  <Button asChild variant="outline">
                    <a href="/preise-und-ablauf">Mehr erfahren</a>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">BF3-Begleitfahrzeuge</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Schwertransporte durch die Metropolregion
                  </p>
                  <Button asChild variant="outline">
                    <a href="/begleitfahrzeuge-bf3">Mehr erfahren</a>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Fahrmischerfahrer</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Betonlieferungen in der dichtesten Region
                  </p>
                  <Button asChild variant="outline">
                    <a href="/fahrmischerfahrer-buchen">Mehr erfahren</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-primary text-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Fahrer im Rhein-Main-Gebiet benötigt?
            </h2>
            <p className="text-xl mb-6 text-white/90">
              Nutzen Sie unsere Metropolregion-Expertise für Ihre Fahrerdienstleistungen. 
              Kurze Wege, lokale Kenntnisse – planbar und zuverlässig.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={scrollToBooking}
                size="lg" 
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
              >
                Fahrer jetzt buchen
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary"
                asChild
              >
                <a href="tel:+4915771442285">Direkt anrufen: 01577 1442285</a>
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default RheinMain;
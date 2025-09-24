import { useSEO } from '@/hooks/useSEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, MapPin, Clock, Users, Shield, Star } from 'lucide-react';

const Hessen = () => {
  const seoData = {
    title: "LKW-Fahrer & Kraftfahrer mieten in Hessen | Fahrerexpress",
    description: "Professionelle LKW-Fahrer, Kranführer & Baumaschinenführer in ganz Hessen. 24-72h Vorlauf, keine Same-Day-Buchung. Jetzt Fahrer mieten!",
    keywords: "LKW Fahrer Hessen, Kraftfahrer mieten Hessen, Kranführer Hessen, Baumaschinenführer Hessen, ADR Fahrer Hessen, Frankfurt, Kassel, Darmstadt",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Kraftfahrer-Vermittlung Hessen",
      "description": "Professionelle Vermittlung von LKW-Fahrern, Kranführern und Baumaschinenführern in ganz Hessen",
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
        "@type": "State",
        "name": "Hessen",
        "containedInPlace": {
          "@type": "Country",
          "name": "Deutschland"
        }
      },
      "serviceType": "Fahrerdienstleistungen",
      "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": "https://kraftfahrer-mieten.com/hessen",
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
              LKW-Fahrer & Kraftfahrer mieten in Hessen
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Landesweite Fahrerexpress-Vermittlung für Transporte, Bauprojekte und Spezialaufgaben. 
              Von Frankfurt über Kassel bis Darmstadt – mit 24-72h Vorlauf.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Hessenweit verfügbar</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>Alle Regionen</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>24-72h Vorlauf</span>
              </div>
            </div>
            <Button 
              onClick={scrollToBooking}
              size="lg" 
              variant="secondary"
              className="mr-4 bg-white text-primary hover:bg-white/90"
            >
              Fahrer in 24-72 h sichern
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
                Fahrerdienstleistungen in ganz Hessen
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Mit unserem Sitz in Frankfurt am Main bedienen wir das gesamte Bundesland Hessen. 
                Ob im Ballungsraum Rhein-Main, im nordhessischen Kassel oder in der Wissenschaftsstadt Darmstadt – 
                unsere erfahrenen Fahrer kennen die regionalen Besonderheiten und Verkehrswege.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Südhessen</h3>
                  <p className="text-sm text-muted-foreground">Frankfurt, Darmstadt, Offenbach, Rhein-Main-Gebiet</p>
                </div>
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Mittelhessen</h3>
                  <p className="text-sm text-muted-foreground">Gießen, Marburg, Wetzlar, Vogelsberg</p>
                </div>
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Nordhessen</h3>
                  <p className="text-sm text-muted-foreground">Kassel, Fulda, Hersfeld-Rotenburg</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Regionaler Spezialist
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Unsere Fahrer kennen die hessischen Verkehrswege, Industriegebiete 
                    und regionalen Besonderheiten – von der A5 bis zur A7.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Planbare Verfügbarkeit
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    24-72 Stunden Vorlauf gewährleisten qualifizierte Fahrer 
                    in ganz Hessen. Kein Same-Day – dafür zuverlässig.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              Unsere Fahrerleistungen in Hessen
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
                    Erfahrene Fernverkehrs- und Regionalfahrer für alle hessischen Routen. 
                    Von der A3 bis zur A44 – unsere Fahrer kennen sich aus.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• Fernverkehr deutschlandweit</li>
                    <li>• Regional Hessen & Umland</li>
                    <li>• Autobahn & Landstraße</li>
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
                    Gefahrguttransporte zu hessischen Industriestandorten. 
                    Von der Chemie in Frankfurt bis zur Pharma in Marburg.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• Chemiestandorte Hessen</li>
                    <li>• Pharma-Industrie</li>
                    <li>• Industriegebiet-Kenntnisse</li>
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
                    Kran- und Hubarbeiten in ganz Hessen. Von Hochhäusern in Frankfurt 
                    bis zu Windkraftanlagen im Vogelsberg.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• Mobilkran alle Größen</li>
                    <li>• Stadtkrane Frankfurt</li>
                    <li>• Windkraft-Montage</li>
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
                    Betonlieferungen von Neubaugebieten bis zur Infrastruktur. 
                    Zuverlässige Versorgung aller hessischen Baustellen.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• Wohnungsbau Hessen</li>
                    <li>• Infrastrukturprojekte</li>
                    <li>• Termingerechte Lieferung</li>
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
                    Erdbau, Tiefbau und Straßenbau in allen hessischen Regionen. 
                    Vom Rhein-Main-Gebiet bis zur nordhessischen Tiefebene.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• Straßenbau A-Straßen</li>
                    <li>• Wohngebiet-Erschließung</li>
                    <li>• Gewerbebau Hessen</li>
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
                    Schwertransport-Begleitung auf allen hessischen Autobahnen. 
                    Koordination mit Behörden und Polizei.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• A3, A5, A7 Erfahrung</li>
                    <li>• Behörden-Kontakte</li>
                    <li>• Großraum-Expertise</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Reference Case */}
          <section className="mb-16">
            <div className="bg-muted rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Referenz aus Nordhessen
              </h2>
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 rounded-full p-3">
                        <Star className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">
                          Windpark-Montage bei Kassel
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Für einen Windpark im Raum Kassel vermittelten wir einen 
                          spezialisierten Kranführer mit Schwerlast-Erfahrung. 
                          Die 3-wöchige Montage von 8 Windkraftanlagen erfolgte 
                          termingerecht und ohne Zwischenfälle.
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium">Fahrzeug:</span> Mobilkran 750t
                          </div>
                          <div>
                            <span className="font-medium">Dauer:</span> 3 Wochen
                          </div>
                          <div>
                            <span className="font-medium">Besonderheit:</span> Windkraft-Spezialist
                          </div>
                          <div>
                            <span className="font-medium">Vorlauf:</span> 72 Stunden
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Regional Coverage */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              Unser Einsatzgebiet in Hessen
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              <Card>
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold mb-2">Rhein-Main</h3>
                  <p className="text-xs text-muted-foreground">
                    Frankfurt, Offenbach, Hanau, Main-Taunus-Kreis, Hochtaunus
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold mb-2">Südhessen</h3>
                  <p className="text-xs text-muted-foreground">
                    Darmstadt, Groß-Gerau, Bergstraße, Odenwald
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold mb-2">Mittelhessen</h3>
                  <p className="text-xs text-muted-foreground">
                    Gießen, Marburg, Wetzlar, Wetterau, Vogelsberg
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold mb-2">Nordhessen</h3>
                  <p className="text-xs text-muted-foreground">
                    Kassel, Fulda, Hersfeld-Rotenburg, Werra-Meißner
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
                    Transparente Kostenübersicht für alle Hessen-Einsätze
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
                    Schwertransport-Begleitung auf hessischen Autobahnen
                  </p>
                  <Button asChild variant="outline">
                    <a href="/begleitfahrzeuge-bf3">Mehr erfahren</a>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Kranfahrer buchen</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Spezialisierte Kranführer für Hessen-Projekte
                  </p>
                  <Button asChild variant="outline">
                    <a href="/kranfahrer-buchen">Mehr erfahren</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-primary text-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Fahrer in Hessen benötigt?
            </h2>
            <p className="text-xl mb-6 text-white/90">
              Kontaktieren Sie uns für eine landesweite Fahrerxpress-Vermittlung. 
              Von Frankfurt bis Kassel – mit 24-72h Vorlauf.
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

export default Hessen;
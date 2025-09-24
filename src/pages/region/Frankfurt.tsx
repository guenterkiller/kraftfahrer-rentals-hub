import { useSEO } from '@/hooks/useSEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, MapPin, Clock, Users, Shield, Star } from 'lucide-react';

const Frankfurt = () => {
  const seoData = {
    title: "LKW-Fahrer & Kraftfahrer mieten in Frankfurt am Main | Fahrerexpress",
    description: "Professionelle LKW-Fahrer, Kranführer & Baumaschinenführer in Frankfurt am Main. 24-72h Vorlauf, keine Same-Day-Buchung. Jetzt Fahrer mieten!",
    keywords: "LKW Fahrer Frankfurt, Kraftfahrer mieten Frankfurt am Main, Kranführer Frankfurt, Baumaschinenführer Frankfurt, ADR Fahrer Frankfurt, Hessen",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Kraftfahrer-Vermittlung Frankfurt am Main",
      "description": "Professionelle Vermittlung von LKW-Fahrern, Kranführern und Baumaschinenführern in Frankfurt am Main und Umgebung",
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
        "@type": "City",
        "name": "Frankfurt am Main",
        "containedInPlace": {
          "@type": "State",
          "name": "Hessen"
        }
      },
      "serviceType": "Fahrerdienstleistungen",
      "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": "https://kraftfahrer-mieten.com/frankfurt",
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
              LKW-Fahrer & Kraftfahrer mieten in Frankfurt am Main
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Professionelle Fahrer für Transporte, Bauprojekte und Spezialaufgaben im Rhein-Main-Gebiet. 
              Flexibel, zuverlässig und rechtssicher – mit 24-72h Vorlauf.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Planbare Verfügbarkeit</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>Lokal in Frankfurt</span>
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
                Ihr Partner für Fahrerdienstleistungen in Frankfurt am Main
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Als erfahrene Vermittlungsagentur mit Sitz direkt in Frankfurt am Main vermitteln wir Ihnen 
                schnell und zuverlässig qualifizierte Fahrer für alle Fahrzeugtypen. Ob LKW-Transport, 
                Kranarbeiten oder Baumaschinenführung – unsere selbstständigen Fahrer kennen die Region 
                und die spezifischen Anforderungen vor Ort.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Rechtssichere Abwicklung
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Dienst-/Werkleistung ohne Arbeitnehmerüberlassung. Transparente Verträge 
                    und professionelle Abrechnung direkt über Fahrerexpress.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Planungssicherheit
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    24-72 Stunden Vorlauf garantieren verfügbare Fahrer. 
                    Kein Same-Day-Service – dafür planbare Qualität.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              Unsere Fahrerleistungen in Frankfurt
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
                    Sattelzug- und Fernverkehrsfahrer für Transporte im Rhein-Main-Gebiet. 
                    Erfahren mit regionalen Routen und Lieferstellen.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• Sattelzugfahrer</li>
                    <li>• Fernverkehr & Regional</li>
                    <li>• Stückgut & Teilladung</li>
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
                    Gefahrguttransporte für Industriestandorte in Frankfurt und Umgebung. 
                    Zertifiziert und erfahren.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• ADR-Basiskurs & Aufbauten</li>
                    <li>• Tankwagen & Stückgut</li>
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
                    Mobilkran- und Autokranführer für Baustellen im Frankfurter Stadtgebiet. 
                    Erfahren mit engen Platzverhältnissen.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• Mobilkran bis 500t</li>
                    <li>• Autokran & Teleskop</li>
                    <li>• Innenstadterfahrung</li>
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
                    Betonmischer für Bauprojekte in Frankfurt und den Vororten. 
                    Routiniert mit Lieferlogistik und Baustellen-Koordination.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• 8-12m³ Fahrmischer</li>
                    <li>• Betonpumpen-Koordination</li>
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
                    Bagger-, Radlader- und Walzenfahrer für Tiefbau und Hochbau 
                    im Großraum Frankfurt.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• Minibagger bis Großbagger</li>
                    <li>• Radlader & Teleskoplader</li>
                    <li>• Straßenwalzen</li>
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
                    Zertifizierte BF3-Fahrer für Schwer- und Großraumtransporte 
                    durch das Rhein-Main-Gebiet.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• BF3-Zertifikat aktuell</li>
                    <li>• Autobahn & Innerorts</li>
                    <li>• Behörden-Koordination</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Reference Case */}
          <section className="mb-16">
            <div className="bg-muted rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Referenz aus Frankfurt
              </h2>
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 rounded-full p-3">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">
                          Hochbau-Projekt Frankfurter Innenstadt
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Für ein Neubauprojekt in der Frankfurter City vermittelten wir 
                          kurzfristig (48h Vorlauf) einen erfahrenen Kranführer für 
                          Autokranarbeiten. Trotz enger Platzverhältnisse und dichtem 
                          Verkehr erfolgte die Montage termingerecht.
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium">Fahrzeug:</span> Autokran 40t
                          </div>
                          <div>
                            <span className="font-medium">Dauer:</span> 3 Tage
                          </div>
                          <div>
                            <span className="font-medium">Besonderheit:</span> Innenstadtlage
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
                    Transparente Kostenübersicht und Buchungsprozess
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
                    Spezialisierte Begleitdienste für Schwertransporte
                  </p>
                  <Button asChild variant="outline">
                    <a href="/begleitfahrzeuge-bf3">Mehr erfahren</a>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">LKW-Fahrer buchen</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Direkt C/CE-Fahrer für Ihre Transportaufgaben
                  </p>
                  <Button asChild variant="outline">
                    <a href="/lkw-fahrer-buchen">Mehr erfahren</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-primary text-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Fahrer in Frankfurt am Main benötigt?
            </h2>
            <p className="text-xl mb-6 text-white/90">
              Kontaktieren Sie uns für eine schnelle und professionelle Vermittlung. 
              24-72h Vorlauf – planbar und zuverlässig.
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

export default Frankfurt;
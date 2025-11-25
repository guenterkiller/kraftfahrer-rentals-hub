import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Phone, Mail, Settings, Droplets, FileText, Shield, UserCheck, AlertCircle, Truck, Construction } from "lucide-react";
import Navigation from "@/components/Navigation";
import FahreranfrageSection from "@/components/FahreranfrageSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const FlüssigbodenService = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'category_view_fluessigboden', {
        event_category: 'Page View',
        event_label: 'Flüssigboden Service',
        value: 459
      });
    }
  }, []);

  const seoData = {
    title: "Mischmeister für Flüssigboden – Subunternehmer mit CE, Radlader & Bagger | Fahrerexpress",
    description: "Mischmeister für Flüssigboden als selbstständiger Subunternehmer: Bedienung von Mischanlage, Radlader, Bagger und CE-Fahrmischer. Bis zu 2 Mitarbeiter einsparen. Bundesweit buchbar – Unterkunft bauseits, klare Tagessätze.",
    keywords: "Flüssigboden, Mischmeister, Subunternehmer, Verfüllmaterialien, Mischanlagen, fließfähige Baustoffe, Radlader, Bagger, CE-Fahrmischer, Flüssigboden Service, Mischmeister buchen",
    ogTitle: "Mischmeister für Flüssigboden – Subunternehmer mit CE, Radlader & Bagger | Fahrerexpress",
    ogDescription: "Mischmeister für Flüssigboden als selbstständiger Subunternehmer: Bedienung von Mischanlage, Radlader, Bagger und CE-Fahrmischer. Bis zu 2 Mitarbeiter einsparen. Bundesweit buchbar – Unterkunft bauseits, klare Tagessätze.",
    ogUrl: "https://www.kraftfahrer-mieten.com/fluessigboden-service",
    ogType: "website",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Flüssigboden-Service – Mischmeister",
      "description": "Mischmeister für fließfähige Verfüllmaterialien mit bauseits gestellter Misch- und Pumptechnik",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Fahrerexpress-Agentur – Günter Killer",
        "url": "https://www.kraftfahrer-mieten.com",
        "telephone": "+49-1577-1442285",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Walther-von-Cronberg-Platz 12",
          "postalCode": "60594",
          "addressLocality": "Frankfurt am Main",
          "addressCountry": "DE"
        },
        "areaServed": "DE"
      }
    }
  };

  useSEO(seoData);

  const scrollToBooking = () => {
    const element = document.querySelector('#fahreranfrage');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Zum Hauptinhalt springen
      </a>
      
      <Navigation />
      
      <main id="main-content" className="pt-16">
        {/* Hero Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-background to-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Mischmeister für Flüssigboden – Subunternehmer mit CE, Radlader & Bagger
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Einsatz als selbstständiger Subunternehmer für fließfähige Verfüllmaterialien. Bedienung von Mischanlage, Radlader, Bagger und CE-Fahrmischer. Bis zu zwei Arbeitskräfte können eingespart werden.
            </p>
            
            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 p-3 bg-background border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium">Mischanlage + Radlader + Bagger</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-background border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium">CE-Führerschein</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-background border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium">Bis zu 2 Personen einsparen</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-background border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium">489 € pro Tag</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={scrollToBooking}
                className="text-lg px-8 py-3"
              >
                Jetzt Mischmeister buchen
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                asChild
                className="text-lg px-8 py-3"
              >
                <a href="tel:+4915771442285" className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Sofort anrufen
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Contact Info */}
        <section className="py-8 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <span className="font-semibold">+49 1577 1442285</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <span className="font-semibold">info@kraftfahrer-mieten.com</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Verfügbarkeit:</strong> Deutschlandweit • <strong>Reaktionszeit:</strong> Meist &lt; 24h
              </div>
            </div>
          </div>
        </section>

        {/* Rechtssicherer Abschnitt - MAIN CONTENT */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-muted shadow-lg">
              <CardHeader className="bg-muted/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <CardTitle className="text-2xl md:text-3xl font-bold mb-3">
                      Leistungsprofil – Mischmeister für Flüssigboden
                    </CardTitle>
                    <div className="text-base text-muted-foreground leading-relaxed space-y-3">
                      <p>
                        Der Einsatz erfolgt ausschließlich als selbstständiger Subunternehmer.
                        Die Herstellung und Verarbeitung fließfähiger Verfüllmaterialien erfolgt auf Grundlage der vom Auftraggeber bereitgestellten Technik, Rezeptur und Anweisung.
                      </p>
                      <p>
                        Ich betreibe die Mischanlage, versorge diese per Radlader/Bagger und kann bei Bedarf den Fahrmischer selbst fahren (CE). Die Verantwortung für Technik, Material, Mischparameter und Gewährleistung liegt vollständig beim Auftraggeber.
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Leistungen */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Vorteile & Besonderheiten
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <UserCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Subunternehmerleistung (keine Arbeitnehmerüberlassung)</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Settings className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Mischmeister für Flüssigboden</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Droplets className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Bedienung bauseitiger Mischanlagen</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Construction className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Radlader- & Baggerbedienung</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Truck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Führerschein CE – Fahrmischer selbst fahren möglich</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Einsparung von bis zu 2 Arbeitskräften</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Arbeit erfolgt ausschließlich nach Anweisung & Rezeptur des Auftraggebers</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Einsatz bundesweit möglich</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Unterkunft bauseits (Pflicht)</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Keine Gewährleistung / keine Systemfreigaben</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Keine Marken oder Logos verwenden</span>
                      </div>
                    </div>
                  </div>

                  {/* Einsatzbedingungen */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      Einsatzbedingungen
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Technik & Material bauseits</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Subunternehmer-Einsatz (eigene Rechnung)</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Entladestelle nahe der Mischanlage</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Überschaubare Tagesmengen</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Unterkunft bauseits zu stellen</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                        <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">Keine Haftung für Material, Anlage oder Ergebnisse</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preisübersicht */}
                <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-lg">
                  <h4 className="text-xl font-semibold mb-6 flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    Preisübersicht – Mischmeister für Flüssigboden
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-background rounded-lg border-2 border-primary/30">
                      <div className="text-sm text-muted-foreground mb-1">Tagessatz (8 Std.)</div>
                      <div className="text-3xl font-bold text-primary">489 €</div>
                      <div className="text-xs text-muted-foreground mt-1">zzgl. MwSt.</div>
                    </div>
                    <div className="p-4 bg-background rounded-lg border-2 border-orange-200 shadow-sm">
                      <div className="text-sm text-muted-foreground mb-1">Überstunden</div>
                      <div className="text-3xl font-bold text-orange-600">65 €/Std.</div>
                      <div className="text-xs text-muted-foreground mt-1">zzgl. MwSt.</div>
                    </div>
                    <div className="p-4 bg-background rounded-lg border">
                      <div className="text-sm text-muted-foreground mb-1">Fahrtkosten</div>
                      <div className="text-2xl font-bold text-foreground">0,75 €/km</div>
                      <div className="text-xs text-muted-foreground mt-1">zzgl. MwSt.</div>
                    </div>
                    <div className="p-4 bg-background rounded-lg border">
                      <div className="text-sm text-muted-foreground mb-1">Unterkunft</div>
                      <div className="text-lg font-bold text-foreground">Bauseits zu stellen</div>
                      <div className="text-xs text-muted-foreground mt-1">Pflicht, keine Pauschale</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary mb-6">
                    <h5 className="font-semibold mb-3 text-foreground">Zuschläge</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Samstag:</span>
                        <span className="font-semibold">+50%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sonntag:</span>
                        <span className="font-semibold">+100%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Feiertag:</span>
                        <span className="font-semibold">+100%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-green-50 dark:bg-green-950/20 border-2 border-green-500/30 rounded-lg">
                    <div className="flex items-start gap-3 mb-2">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-lg text-foreground mb-1">Komplettpreis bis 10 Stunden</div>
                        <div className="text-3xl font-bold text-green-600 mb-2">599 € / Tag</div>
                        <div className="text-sm text-muted-foreground">Inkl. 2 Überstunden • zzgl. MwSt. • Optional verfügbar</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Haftungsausschluss - ausführlich */}
                <div className="mt-8 p-6 bg-muted/50 border-2 border-muted rounded-lg">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-600" />
                    Haftungsausschluss – Mischmeister für fließfähige Verfüllmaterialien
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                    <p>
                      Der Mischmeister arbeitet ausschließlich mit bauseits gestellter Technik, Rezeptur und den vom Auftraggeber bereitgestellten Materialien.
                      Der Auftraggeber bleibt Betreiber der Anlage im Sinne der technischen und rechtlichen Verantwortung.
                    </p>
                    <p>
                      Der Mischmeister führt die Arbeiten weisungsgebunden und ausschließlich nach Vorgaben aus.
                      Er übernimmt keine Haftung, Gewährleistung oder Funktionsverantwortung für:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Misch- oder Pumpanlage</li>
                      <li>Mischqualität oder Materialeigenschaften</li>
                      <li>Rezepturen, Zusammensetzungen oder Parameter</li>
                      <li>Technische Ausführung des Einbaus</li>
                      <li>Baustellenabläufe oder Ergebnisse</li>
                      <li>Bauphysikalische Eigenschaften oder spätere Belastbarkeit</li>
                    </ul>
                    <p className="font-semibold text-foreground">
                      Jegliche Verantwortung liegt ausschließlich beim Auftraggeber bzw. Betreiber der Anlage.
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-8 text-center">
                  <Button 
                    size="lg" 
                    onClick={scrollToBooking}
                    className="text-lg px-8 py-3"
                  >
                    Mischmeister anfragen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Häufige Fragen zum Mischmeister für Flüssigboden
            </h2>
            <div className="space-y-4">
              <details className="group rounded-lg border border-muted p-4 hover:border-primary/50 transition-colors bg-background">
                <summary className="font-semibold cursor-pointer flex items-center justify-between group-open:text-primary">
                  Was bedeutet "bauseits gestellte Technik"?
                  <span className="ml-2 transform group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-3 text-muted-foreground">
                  Der Auftraggeber stellt die komplette Misch- und Pumptechnik sowie alle Anlagen zur Verfügung. Der Mischmeister bedient diese Technik nach Ihren Vorgaben.
                </div>
              </details>
              
              <details className="group rounded-lg border border-muted p-4 hover:border-primary/50 transition-colors bg-background">
                <summary className="font-semibold cursor-pointer flex items-center justify-between group-open:text-primary">
                  Wer trägt die Verantwortung für die Materialqualität?
                  <span className="ml-2 transform group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-3 text-muted-foreground">
                  Die vollständige Verantwortung für Materialqualität, Rezeptur, Anlagenwartung und Gewährleistung liegt beim Auftraggeber. Der Mischmeister führt die Arbeiten ausschließlich nach Ihren Anweisungen aus.
                </div>
              </details>
              
              <details className="group rounded-lg border border-muted p-4 hover:border-primary/50 transition-colors bg-background">
                <summary className="font-semibold cursor-pointer flex items-center justify-between group-open:text-primary">
                  Welche Konditionen gelten?
                  <span className="ml-2 transform group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-3 text-muted-foreground">
                  <strong>489 € pro Tag (8 Stunden), 65 € pro Überstunde.</strong> Optional: Komplettpreis bis 10 Stunden für 599 €/Tag. Fahrtkosten: 0,75 € pro Kilometer. Unterkunft wird bauseits gestellt (Pflicht). Alle Anlagen und Materialien werden bauseits gestellt. Zuschläge: Samstag +50%, Sonn- und Feiertag +100%.
                </div>
              </details>
              
              <details className="group rounded-lg border border-muted p-4 hover:border-primary/50 transition-colors bg-background">
                <summary className="font-semibold cursor-pointer flex items-center justify-between group-open:text-primary">
                  Erfolgt eine technische Beratung?
                  <span className="ml-2 transform group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-3 text-muted-foreground">
                  Nein. Es erfolgt <strong>keine Beratung, keine Systemfreigabe und keine Gewährleistungsübernahme</strong>. Der Mischmeister arbeitet ausschließlich nach Ihren bereitgestellten Rezepturen und Arbeitsanweisungen.
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* Related Services */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Weitere Fahrerarten
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Baumaschinenführer</CardTitle>
                  <p className="text-sm text-muted-foreground">Bagger, Radlader, Mischanlagen – 459 € pro Tag</p>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/baumaschinenfuehrer-buchen">Mehr erfahren</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">LKW CE Fahrer</CardTitle>
                  <p className="text-sm text-muted-foreground">Vermittelte CE-Fahrer – 349 € pro Tag</p>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/lkw-fahrer-buchen">Mehr erfahren</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Preise & Konditionen</CardTitle>
                  <p className="text-sm text-muted-foreground">Alle Preise und Ablauf im Detail</p>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/preise-und-ablauf">Mehr erfahren</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section id="fahreranfrage" className="scroll-mt-16">
          <FahreranfrageSection />
        </section>

        {/* Legal Disclaimer */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-muted-foreground font-medium">
              Dienst-/Werkleistung durch selbstständige Subunternehmer – keine Arbeitnehmerüberlassung.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="scroll-mt-16">
          <ContactSection />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FlüssigbodenService;

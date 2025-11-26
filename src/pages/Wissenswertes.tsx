import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, FileText, Users, Shield, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";

const Wissenswertes = () => {
  useSEO({
    title: "Wissenswertes – Rechtliche Grundlagen für Ersatzfahrer & LKW-Fahrer | Fahrerexpress",
    description: "Alles über die Beauftragung selbstständiger Fahrer und Ersatzfahrer: Rechtliche Hinweise, Scheinselbstständigkeit vermeiden, Versicherungsschutz & Vertragsgestaltung.",
    keywords: "selbstständige Fahrer beauftragen, ersatzfahrer rechtlich, scheinselbstständigkeit vermeiden, arbeitnehmerüberlassung, kraftfahrer rechtlich, vertragsgestaltung fahrer"
  });
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Wissenswertes für Auftraggeber
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Alles was Sie über die Beauftragung selbstständiger Fahrer wissen müssen
            </p>
          </div>

          {/* Einleitender Infoblock */}
          <section className="mb-16">
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="text-2xl">⭐ Was Sie beim Einsatz selbstständiger Fahrer wissen müssen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p className="font-semibold text-foreground">Wir vermitteln Fahrer – keine Fahrzeuge.</p>
                <p>
                  Die von uns vermittelten selbstständigen Fahrer führen ausschließlich das vom Auftraggeber bereitgestellte Fahrzeug.
                  Sie fahren im Auftrag des Auftraggebers dessen Transporte und Aufträge.
                </p>
                <p>
                  Da der Fahrer kein eigenes Fahrzeug einsetzt, handelt es sich nicht um eine Transportleistung im rechtlichen Sinne.
                </p>
                <ul className="space-y-2 pl-6">
                  <li>➡ Keine Transportversicherung erforderlich.</li>
                  <li>➡ Keine Vollkaskopflicht für den Fahrer.</li>
                  <li>➡ Empfehlenswert für den Fahrer: eine Betriebshaftpflicht.</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <Separator className="my-16" />

          {/* Vorteile selbstständiger Fahrer */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">🚛 Vorteile selbstständiger Fahrer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Flexibel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    24–72 h Vorlauf
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    Keine Sozialabgaben
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Kein Urlaub, keine Lohnfortzahlung
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Hohe Erfahrung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Fachkenntnis
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-red-600" />
                    Kein Arbeitsrecht
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Keine Lohnabrechnung
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    Rechtssichere Zusammenarbeit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ohne ANÜ
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Qualitätsorientiert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Eigenverantwortung
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator className="my-16" />

          {/* Rechtliche Hinweise */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">⚖ Rechtliche Hinweise</h2>
            
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>🚫 Scheinselbstständigkeit vermeiden</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Keine detaillierten Arbeitszeiten vorschreiben</li>
                    <li>✓ Ergebnis definieren, nicht den Weg</li>
                    <li>✓ Fahrer nicht in Dienstpläne integrieren</li>
                    <li>✓ Fahrer sollte mehrere Auftraggeber haben</li>
                    <li>✓ Fahrer nutzt eigene Schutzausrüstung (soweit sinnvoll)</li>
                    <li>✓ Selbstständige Rechnungsstellung</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator className="my-16" />

          {/* Versicherung und Haftung */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">🛡 Versicherung & Haftung</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Versicherungsschutz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-foreground mb-2">Empfehlenswerte Versicherungen für selbstständige Fahrer:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Betriebshaftpflichtversicherung</li>
                      <li>• Berufshaftpflichtversicherung (optional)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-foreground mb-2">Vom Auftraggeber zu stellen:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Kfz-Haftpflichtversicherung (gesetzlich verpflichtend für den Fahrzeughalter)</li>
                      <li>• Vollkaskoversicherung (optional, Entscheidung des Fahrzeughalters)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-foreground mb-2">Nicht erforderlich für den Fahrer:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Transportversicherung</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      → Selbstständige Fahrer erbringen keine eigene Transportleistung und nutzen kein eigenes Fahrzeug, daher besteht keine Transportversicherungspflicht.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Haftungsregelung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground mb-3">
                    Klare Haftungsregelungen im Vertrag:
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Der Auftraggeber bleibt Fahrzeughalter nach StVG</li>
                    <li>• Schäden am Fahrzeug werden über die Fahrzeugversicherung des Auftraggebers reguliert</li>
                    <li>• Der Fahrer haftet nur bei Vorsatz oder grober Fahrlässigkeit</li>
                    <li>• Eine Betriebshaftpflicht des Fahrers deckt Schäden außerhalb des Fahrzeugs</li>
                    <li>• Haftungsausschlüsse und Verantwortlichkeiten sollen vertraglich eindeutig festgelegt werden</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator className="my-16" />

          {/* Vertragsgestaltung */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">📄 Vertragsgestaltung – das sollte geregelt sein</h2>
            
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Leistungsbeschreibung:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Art der Transporte</li>
                      <li>• Fahrzeugtyp</li>
                      <li>• Einsatzort</li>
                      <li>• Besonderheiten (ADR, Kran usw.)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Vergütung:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Tages-/Stundensatz</li>
                      <li>• Abrechnungsweise</li>
                      <li>• Zahlungsziel</li>
                      <li>• Spesenregelung</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Pflichten des Fahrers:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Führerschein</li>
                      <li>• Selbstständiger Status</li>
                      <li>• Kenntnisse gesetzlicher Vorschriften</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Pflichten des Auftraggebers:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Fahrzeug stellen</li>
                      <li>• Betriebsmittel & Kraftstoff</li>
                      <li>• Versicherungen</li>
                      <li>• Ladungssicherung sicherstellen</li>
                    </ul>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-lg mb-4">Kündigung:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Fristen</li>
                      <li>• außerordentliche Gründe</li>
                      <li>• Abwicklung</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Häufig gestellte Fragen</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Wie kurzfristig kann ich einen Fahrer beauftragen?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    In der Regel können erfahrene selbstständige Fahrer sehr kurzfristig eingesetzt werden. 
                    In der Regel 24–72 Stunden Vorlauf (werktags) ab schriftlicher Bestätigung. Same-Day ist ausgeschlossen.
                    Fahrer verfügbar sind.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Was kostet ein selbstständiger Fahrer?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Typische Stundensätze liegen je nach Fahrzeug und Einsatzart zwischen 45 und 75 Euro. 
                    Für exakte Angebote kontaktieren Sie uns mit Ihrer Anfrage.
                  </p>
                </CardContent>
              </Card>

                <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Muss ich ein Fahrzeug zur Verfügung stellen?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    <strong>Ja.</strong>
                  </p>
                  <p className="text-muted-foreground mb-2">
                    Die von uns vermittelten Fahrer haben kein eigenes Fahrzeug.
                  </p>
                  <p className="text-muted-foreground">
                    Sie fahren ausschließlich Ihr Firmenfahrzeug und führen Ihre Aufträge aus.
                    Das ist rechtlich zulässig, da keine eigene Transportleistung durch den Fahrer erfolgt.
                  </p>
                </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Wie erfolgt die Abrechnung?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">
                      <strong>Sie erhalten eine Rechnung direkt von Fahrerexpress.</strong>
                    </p>
                    <p className="text-muted-foreground">
                      Die Fahrer stellen ihre Rechnung an uns – Sie haben keinen Aufwand mit mehreren Rechnungen. 
                      Das Abrechnungsmodell ist immer die Agenturabrechnung, bei der Fahrerexpress als Vertragspartner auftritt.
                    </p>
                  </CardContent>
                </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Wie ist die Qualifikation der Fahrer sichergestellt?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Alle über Fahrerexpress vermittelten Fahrer verfügen über gültige Führerscheine, 
                    entsprechende Berufserfahrung und notwendige Zusatzqualifikationen wie ADR-Schein 
                    oder Kranführerschein, je nach Anforderung.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Haben Sie weitere Fragen?</CardTitle>
                <CardDescription>
                  Wir beraten Sie gerne persönlich zu allen Aspekten der Fahrerbeauftragung
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <a href="/#contact">Kostenlose Beratung</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="tel:+49123456789">📞 Anrufen</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Wissenswertes;
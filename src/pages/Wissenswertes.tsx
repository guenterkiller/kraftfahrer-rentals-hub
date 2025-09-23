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

          {/* Vorteile selbstständiger Fahrer */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Vorteile selbstständiger Fahrer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Flexibilität
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Kurzfristig (24–72 h) planbar, ohne lange Vertragsbindung.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    Kosteneffizienz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Keine Sozialversicherungsbeiträge, Urlaubsgeld oder Lohnfortzahlung bei Krankheit.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Erfahrung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Selbstständige Fahrer bringen oft jahrelange Berufserfahrung und Fachkompetenz mit.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    Rechtssicherheit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Kein Risiko der Scheinselbstständigkeit bei korrekter Ausgestaltung der Zusammenarbeit.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-red-600" />
                    Weniger Bürokratie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Einfache Vertragsgestaltung ohne komplexe arbeitsrechtliche Bestimmungen.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Qualität
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Eigenverantwortliche Arbeitsweise führt oft zu höherer Motivation und Qualität.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator className="my-16" />

          {/* Rechtliche Hinweise */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Rechtliche Hinweise</h2>
            
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Abgrenzung zur Arbeitnehmerüberlassung
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Die Beauftragung selbstständiger Fahrer ist <strong>keine Arbeitnehmerüberlassung</strong>, 
                    wenn folgende Kriterien erfüllt sind:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Der Fahrer arbeitet eigenverantwortlich und weisungsunabhängig</li>
                    <li>✓ Sie stellen das Fahrzeug/die Geräte, er bringt die Fachkompetenz</li>
                    <li>✓ Er trägt ein unternehmerisches Risiko</li>
                    <li>✓ Er kann eigene Arbeitskräfte einsetzen</li>
                    <li>✓ Er ist nicht in die Betriebsorganisation eingegliedert</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scheinselbstständigkeit vermeiden</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Um eine Scheinselbstständigkeit zu vermeiden, sollten Sie beachten:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Keine festen Arbeitszeiten vorgeben</li>
                    <li>✓ Ergebnis vereinbaren, nicht die Art der Durchführung</li>
                    <li>✓ Fahrer sollte für mehrere Auftraggeber tätig sein</li>
                    <li>✓ Eigene Geschäftsausstattung des Fahrers</li>
                    <li>✓ Rechnungsstellung durch den Fahrer</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator className="my-16" />

          {/* Versicherung und Haftung */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Versicherung und Haftung</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Versicherungsschutz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    Wichtige Versicherungen für selbstständige Fahrer:
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Berufshaftpflichtversicherung</li>
                    <li>• Betriebshaftpflichtversicherung</li>
                    <li>• Kfz-Haftpflichtversicherung</li>
                    <li>• Vollkasko für das Fahrzeug</li>
                    <li>• Transportversicherung (falls relevant)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Haftungsregelung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    Klare Haftungsregelungen im Vertrag:
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Haftung bei Schäden durch den Fahrer</li>
                    <li>• Haftungsausschlüsse definieren</li>
                    <li>• Nachweis ausreichender Versicherung</li>
                    <li>• Schadensregulierung festlegen</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator className="my-16" />

          {/* Mustervertrag */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Vertragsgestaltung</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Wichtige Vertragsbestandteile</CardTitle>
                <CardDescription>
                  Diese Punkte sollten in jedem Vertrag mit selbstständigen Fahrern enthalten sein
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Leistungsbeschreibung</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Art der Transportleistung</li>
                      <li>• Fahrzeugtyp und -ausstattung</li>
                      <li>• Einsatzgebiet und -zeiten</li>
                      <li>• Besondere Anforderungen</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Vergütung</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Stundensatz oder Pauschale</li>
                      <li>• Abrechnungsmodalitäten</li>
                      <li>• Zahlungsziele</li>
                      <li>• Spesen und Nebenkosten</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Pflichten des Fahrers</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Führerscheinnachweis</li>
                      <li>• Versicherungsnachweis</li>
                      <li>• Fahrzeugwartung</li>
                      <li>• Einhaltung von Vorschriften</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Kündigung</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Kündigungsfristen</li>
                      <li>• Außerordentliche Kündigung</li>
                      <li>• Abwicklung nach Vertragsende</li>
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
                  <p className="text-muted-foreground">
                    Ja, in der Regel stellen Sie als Auftraggeber das Fahrzeug zur Verfügung. 
                    Die selbstständigen Fahrer bringen ihre Erfahrung und Qualifikation mit, 
                    fahren aber Ihr Firmenfahrzeug. Dies ist rechtlich zulässig und üblich in der Branche.
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
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, FileText, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const BF3Ablauf = () => {
  useSEO({
    title: "BF3-Fahrer Ablauf & Kosten – Begleitfahrer für Schwertransport | Fahrerexpress",
    description: "Alles über BF3-Fahrer: Ablauf, Kosten, Berechtigung und Checkliste für Schwertransporte. Qualifizierte BF3-Fahrer deutschlandweit. Fahrzeug stellen Sie.",
    keywords: "BF3 Fahrer, BF3 Kosten, BF3 Berechtigung, Begleitfahrer Ablauf, Schwertransport Begleitung, BF3 Checkliste, WVZA Fahrer"
  });

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-muted pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                BF3-Fahrer: Ablauf & Kosten
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Qualifizierte BF3-Fahrer für Schwer- und Großraumtransporte. 
                Alles was Sie über BF3-Begleitfahrer wissen müssen.
              </p>
            </div>

            {/* Was ist BF3 */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl">Was bedeutet BF3-Berechtigung?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <p className="font-semibold text-blue-900">
                    ⚠️ Wichtig: Wir vermitteln ausschließlich qualifizierte BF3-Fahrer. 
                    Das entsprechend ausgerüstete Begleitfahrzeug stellt der Auftraggeber.
                  </p>
                </div>
                <p>
                  <strong>BF3-Berechtigung</strong> qualifiziert Fahrer zur Führung von Begleitfahrzeugen 
                  mit Wechselverkehrszeichenanlage (WVZA), die Schwer- und Großraumtransporte begleiten, 
                  um andere Verkehrsteilnehmer zu warnen und den Transport abzusichern.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">🚛 Wann wird BF3 benötigt?</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Transportbreite über 3,00 m</li>
                      <li>• Transporthöhe über 4,00 m</li>
                      <li>• Transportlänge über 20,75 m</li>
                      <li>• Transportgewicht über 40 t</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">📋 Ihr Fahrzeug benötigt:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Wechselverkehrszeichenanlage (WVZA)</li>
                      <li>• Rundumkennleuchte gelb</li>
                      <li>• Funkgerät für Kommunikation</li>
                      <li>• TÜV-Zulassung und Versicherung</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ablauf */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-8">BF3-Transport Ablauf</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
                    <CardTitle className="text-lg">Genehmigung</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm">Transportgenehmigung bei zuständiger Behörde beantragen. BF3-Begleitung wird vorgeschrieben.</p>
                    <Badge variant="secondary" className="mt-3">
                      <Clock className="h-3 w-3 mr-1" />
                      5-14 Tage
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
                    <CardTitle className="text-lg">Buchung</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm">BF3-Fahrer mit entsprechender Berechtigung buchen. Ihr Begleitfahrzeug bereitstellen. Terminkoordination.</p>
                    <Badge variant="secondary" className="mt-3">
                      <Clock className="h-3 w-3 mr-1" />
                      1-3 Tage
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
                    <CardTitle className="text-lg">Vorbereitung</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm">Routenbesprechung, Fahrzeugkontrolle (Ihr Begleitfahrzeug), WVZA-Test und Funkverbindung prüfen.</p>
                    <Badge variant="secondary" className="mt-3">
                      <Clock className="h-3 w-3 mr-1" />
                      30-60 Min
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">4</div>
                    <CardTitle className="text-lg">Transport</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm">Professionelle Begleitung durch unseren BF3-Fahrer mit Ihrem vorausfahrenden Begleitfahrzeug und Verkehrsregelung.</p>
                    <Badge variant="secondary" className="mt-3">
                      <Clock className="h-3 w-3 mr-1" />
                      Je nach Route
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Kosten */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl">BF3-Fahrer Kosten & Preise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
                  <p className="text-sm font-semibold text-amber-900">
                    💡 Hinweis: Die Preise gelten nur für den Fahrer. Ihr Begleitfahrzeug mit WVZA-Ausrüstung ist nicht enthalten.
                  </p>
                </div>
                <div className="grid md:grid-cols-1 gap-6">
                  <div className="p-5 bg-background rounded-lg border-2 border-primary/20">
                    <h3 className="text-xl font-semibold mb-3">BF3 Begleitfahrer – Konditionen</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Tagessatz auf Anfrage – abhängig von Einsatzart, Strecke und Dauer</li>
                      <li>• Zusätzlich: An- und Abfahrt – erste 25 km der Gesamtstrecke frei, ab dem 26. km 0,40 € je gefahrenem Kilometer</li>
                      <li>• Weitere Kosten nur nach vorheriger Vereinbarung</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm">
                    <strong>Hinweis:</strong> BF3-Fahrer können bei längeren Transporten eine wirtschaftliche Alternative zur Polizeibegleitung sein.
                    Ihr eigenes Begleitfahrzeug mit WVZA bleibt Voraussetzung.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Checkliste */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  BF3-Transport Checkliste
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">✅ Vor dem Transport</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">Transportgenehmigung mit BF3-Auflage vorhanden</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">BF3-Fahrer rechtzeitig (3-7 Tage) gebucht</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">Route besprochen und genehmigt</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">Funkkanal und Kommunikation abgestimmt</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">Treffpunkt und Startzeit festgelegt</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">⚠️ Häufige Fehler vermeiden</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                        <span className="text-sm">BF3-Fahrer zu spät gebucht (Verfügbarkeit)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                        <span className="text-sm">Ungeprüfte WVZA-Ausrüstung</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                        <span className="text-sm">Keine Funkverbindung getestet</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                        <span className="text-sm">Route nicht komplett abgestimmt</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                        <span className="text-sm">Keine Backup-Lösung bei Ausfall</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl">Häufige Fragen zu BF3-Transporten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Wer darf BF3-Fahrzeuge führen?</h4>
                  <p className="text-muted-foreground">Nur Fahrer mit gültiger BF3-Berechtigung der zuständigen Straßenverkehrsbehörde. Diese wird nach einer Schulung und Prüfung erteilt.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Benötige ich ein eigenes Begleitfahrzeug?</h4>
                  <p className="text-muted-foreground">Ja, Sie stellen das Begleitfahrzeug mit kompletter WVZA-Ausrüstung. Wir vermitteln ausschließlich den qualifizierten BF3-Fahrer, der Ihr Fahrzeug bedient.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Wie weit im Voraus muss ich buchen?</h4>
                  <p className="text-muted-foreground">Idealerweise 3-7 Tage, je nach Region und Verfügbarkeit. Für eilige Transporte sind auch kurzfristige Buchungen möglich.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Was passiert bei schlechtem Wetter?</h4>
                  <p className="text-muted-foreground">BF3-Transporte sind wetterunabhängig möglich. Bei extremen Bedingungen kann die Behörde Transportstopps anordnen.</p>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="text-center">
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">BF3-Fahrer benötigt?</h3>
                  <p className="text-lg mb-6 text-muted-foreground">
                    Qualifizierte BF3-Fahrer mit gültiger Berechtigung deutschlandweit verfügbar. Fahrzeug stellen Sie.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg">
                      <Link to="/begleitfahrzeuge-bf3">BF3-Fahrer buchen</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <a href="tel:+4915771442285">Sofort anrufen</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BF3Ablauf;
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Euro, Phone, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const PreiseUndAblauf = () => {
  useSEO({
    title: "Preise & Ablauf – LKW-Fahrer mieten ab 25€/h | Fahrerexpress",
    description: "Transparente Preise für Kraftfahrer-Vermittlung. Stundensätze ab 25€, keine Vermittlungsgebühr für Auftraggeber. Schneller Ablauf in 3 Schritten.",
    keywords: "LKW-Fahrer Preise, Kraftfahrer Kosten, Vermittlungsgebühr, Stundensatz Fahrer, LKW-Fahrer mieten Kosten, Fahrerexpress Preise"
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
                Transparente Preise & einfacher Ablauf
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Erfahren Sie, was die Vermittlung qualifizierter Kraftfahrer kostet und wie schnell wir Ihnen helfen können.
              </p>
            </div>

            {/* Preisübersicht */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="border-2 border-primary/20">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Euro className="h-5 w-5" />
                    Standard LKW-Fahrer
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="text-3xl font-bold text-primary">25-35€</div>
                  <div className="text-muted-foreground">pro Stunde (netto)</div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      C+E Führerschein
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Aktuelle Fahrerkarte
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Berufserfahrung 2+ Jahre
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-500/20">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Users className="h-5 w-5" />
                    Spezialfahrer
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="text-3xl font-bold text-orange-600">30-45€</div>
                  <div className="text-muted-foreground">pro Stunde (netto)</div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      ADR-Schein (Tankwagen)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Kranschein
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      BF3-Berechtigung
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-500/20">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5" />
                    Baumaschinenführer
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="text-3xl font-bold text-green-600">35-50€</div>
                  <div className="text-muted-foreground">pro Stunde (netto)</div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Kranführer
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Baggerfahrer
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Mischmeister
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Wichtige Hinweise */}
            <Card className="mb-12 bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-blue-800">Wichtige Preisinformationen</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">✅ Für Auftraggeber kostenlos</h4>
                    <p className="text-sm">Keine Vermittlungsgebühr, keine Anmeldekosten. Sie zahlen nur den Stundensatz direkt an den Fahrer.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">🚛 Fahrzeug & Sprit</h4>
                    <p className="text-sm">Ihr Fahrzeug, Ihr Sprit. Der Fahrer bringt nur seine Expertise mit.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">⏰ Mindestdauer</h4>
                    <p className="text-sm">Minimum 4 Stunden pro Einsatz. Fahrtkosten zum Einsatzort werden separat berechnet.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">📋 Keine AÜG-Kosten</h4>
                    <p className="text-sm">Selbstständige Fahrer, kein Personalleasing. Günstigere Alternative zur Zeitarbeit.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ablauf in 3 Schritten */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-8">So einfach funktioniert es</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card>
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
                    <CardTitle>Anfrage stellen</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p>Teilen Sie uns Ihren Bedarf mit: Fahrzeugtyp, Einsatzort, Zeitraum und besondere Anforderungen.</p>
                    <Badge variant="secondary" className="mt-3">⏱️ 2 Minuten</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
                    <CardTitle>Fahrer-Auswahl</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p>Wir prüfen verfügbare Fahrer und senden Ihnen den passenden Kandidaten mit allen Qualifikationen.</p>
                    <Badge variant="secondary" className="mt-3">⏱️ 2-4 Stunden</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
                    <CardTitle>Einsatz startet</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p>Der Fahrer kontaktiert Sie direkt, um Details zu klären. Pünktlich zum vereinbarten Termin am Einsatzort.</p>
                    <Badge variant="secondary" className="mt-3">⏱️ Sofort einsatzbereit</Badge>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* FAQ Preise */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl">Häufige Fragen zu Preisen & Ablauf</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Entstehen für mich als Auftraggeber Kosten?</h4>
                  <p className="text-muted-foreground">Nein. Für Auftraggeber ist die Vermittlung komplett kostenlos. Sie zahlen nur den vereinbarten Stundensatz direkt an den Fahrer.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Wie schnell kann ein Fahrer verfügbar sein?</h4>
                  <p className="text-muted-foreground">Bei Standardanfragen meist innerhalb von 2-4 Stunden. Für Spezialeinsätze (ADR, Kran) benötigen wir 6-12 Stunden Vorlauf.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Sind die Fahrer versichert?</h4>
                  <p className="text-muted-foreground">Ja, alle Fahrer haben eine Betriebshaftpflichtversicherung. Ihr Fahrzeug bleibt über Ihre Versicherung abgesichert.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Was passiert bei Ausfällen?</h4>
                  <p className="text-muted-foreground">Wir stellen kostenlos einen Ersatzfahrer. Bei kurzfristigen Ausfällen (unter 4 Stunden vor Einsatzbeginn) bemühen wir uns nach besten Kräften.</p>
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <div className="text-center">
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Bereit für Ihren Einsatz?</h3>
                  <p className="text-lg mb-6 text-muted-foreground">
                    Starten Sie jetzt Ihre kostenlose Anfrage oder rufen Sie uns direkt an.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg">
                      <Link to="/lkw-fahrer-buchen">Jetzt Fahrer buchen</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <a href="tel:+4915771442285" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        01577 144 2285
                      </a>
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

export default PreiseUndAblauf;
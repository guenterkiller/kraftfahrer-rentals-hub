import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Euro, Phone, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const PreiseUndAblauf = () => {
  useSEO({
    title: "Preise & Ablauf – CE-Fahrer 349€ oder Baumaschinenbedienung 459€",
    description: "Klare Preisstruktur: LKW-/Speditionsfahrer (CE) 349€/Tag oder Baumaschinenbedienung (Günter Killer) 459€/Tag. Wochen- und Monatspreise verfügbar. Einfacher Ablauf in 3 Schritten.",
    keywords: "LKW-Fahrer Preise, CE-Fahrer Kosten 349€, Baumaschinenbedienung 459€, Günter Killer, Speditionsfahrer, Fahrmischer, Baustellenlogistik"
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
            <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
              <Card className="border-primary/20 hover:border-primary/40 transition-all bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Baumaschinenbedienung
                    <Badge variant="secondary">Vermittelte Baumaschinenführer</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Baumaschinenführer</h3>
                    <p className="text-3xl font-bold text-primary">459€</p>
                    <p className="text-sm text-muted-foreground">pro Tag (8 Stunden)</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">Überstunden</p>
                    <p className="text-xl font-semibold">60€/Stunde</p>
                  </div>
                  <div className="pt-3">
                    <p className="text-sm font-medium mb-2">Einsatzbereiche:</p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>✓ Baggerfahren</li>
                      <li>✓ Radladerfahren</li>
                      <li>✓ Fahrmischer & Betonlogistik</li>
                      <li>✓ Flüssigboden (Mischmeister)</li>
                      <li>✓ Mischanlagen bedienen</li>
                      <li>✓ Störungsbehebung & Reparaturen</li>
                      <li>✓ Baustellenlogistik & Materialfluss</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 hover:border-primary/40 transition-all">
                <CardHeader>
                  <CardTitle className="text-xl">LKW CE Fahrer</CardTitle>
                  <p className="text-sm text-muted-foreground">Vermittelte Fahrer</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">CE-LKW-Fahrer</h3>
                    <p className="text-sm text-muted-foreground mb-2">Einheitlicher Tagespreis für alle Einsatzarten</p>
                    <p className="text-3xl font-bold text-primary">349€</p>
                    <p className="text-sm text-muted-foreground">pro Tag (8 Stunden)</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">Überstunden</p>
                    <p className="text-xl font-semibold">30€/Stunde</p>
                  </div>
                  <div className="pt-3">
                    <p className="text-sm font-medium mb-2">Gilt für folgende Tätigkeiten:</p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>✓ Fahrmischer, Wechselbrücke, Hängerzug</li>
                      <li>✓ Fernverkehr, Nahverkehr</li>
                      <li>✓ Baustellenverkehr, Mitnahmestapler</li>
                      <li>✓ ADR, Baustofflogistik, Entsorgung</li>
                      <li>✓ Container, Express- und Kurierfahrten</li>
                      <li>✓ Eventlogistik und alle weiteren CE-Fahrer-Einsatzarten</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Zusatzinformationen */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Fahrtkosten</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="font-semibold">25 Kilometer inklusive</p>
                  <p className="text-muted-foreground mt-1">Danach 0,40€ pro Kilometer</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Wochenpreise</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="font-semibold">Ab 5 Tagen</p>
                  <p className="text-primary text-lg font-bold mt-1">1.490€/Woche</p>
                  <p className="text-muted-foreground text-xs mt-1">(nur CE-Fahrer)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Monatspreise</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="font-semibold">Nur auf Anfrage</p>
                  <p className="text-muted-foreground mt-1">Individuelle Konditionen für längere Projekte</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/50 max-w-4xl mx-auto mb-12">
              <CardHeader>
                <CardTitle className="text-base">Wichtiger Hinweis</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Alle Fahrer arbeiten selbstständig nach Paragraph 84 HGB. Keine Arbeitnehmerüberlassung. Abrechnung erfolgt über Fahrerexpress.</p>
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
                    <Badge variant="secondary" className="mt-3">⏱️ Planbar innerhalb 24-72h</Badge>
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
                  <p className="text-muted-foreground">In der Regel 24–72 Stunden Vorlauf (werktags) ab schriftlicher Bestätigung. Same-Day ist ausgeschlossen.</p>
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
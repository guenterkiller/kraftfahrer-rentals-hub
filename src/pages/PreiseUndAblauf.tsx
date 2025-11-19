import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const PreiseUndAblauf = () => {
  useSEO({
    title: "Preise & Ablauf – Transparente Konditionen für Fahrervermittlung",
    description: "Alle Details zu Preisen, Fahrtkosten, Langzeiteinsätzen und Buchungsablauf. LKW CE Fahrer 349€/Tag, Baumaschinenführer 459€/Tag.",
    keywords: "Fahrer Preise, Fahrtkosten, Langzeiteinsatz, Wochenpreis, Monatspreise, Buchungsablauf"
  });

  const scrollToBooking = () => {
    window.location.href = '/#fahreranfrage';
  };

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-muted pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                Preise & Ablauf im Detail
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Transparente Konditionen, klare Prozesse – so funktioniert die professionelle Fahrervermittlung.
              </p>
            </div>

            {/* Preisübersicht Kompakt */}
            <Card className="mb-12 bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Aktuelle Tagespreise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">LKW CE Fahrer</div>
                    <div className="text-3xl font-bold text-primary">349 €</div>
                    <div className="text-sm text-muted-foreground mt-1">pro Tag (8 Std.) • 30 € ÜS</div>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Baumaschinenführer</div>
                    <div className="text-3xl font-bold text-primary">459 €</div>
                    <div className="text-sm text-muted-foreground mt-1">pro Tag (8 Std.) • 60 € ÜS</div>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <Button onClick={scrollToBooking} size="lg">
                    Jetzt Fahrer buchen
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Fahrtkosten & Zusatzkosten */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Fahrtkosten-Regelung
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold">Inklusive:</p>
                    <p className="text-muted-foreground">Erste 25 km (Hin- und Rückweg) ohne Aufpreis</p>
                  </div>
                  <div>
                    <p className="font-semibold">Darüber hinaus:</p>
                    <p className="text-muted-foreground">0,40 € pro Kilometer (Hin- und Rückweg)</p>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>Beispiel:</strong> Entfernung 60 km → 35 km berechnet × 2 (Hin/Rück) × 0,40 € = 28 € Fahrtkosten
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    Überstunden & Zuschläge
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold">LKW CE Fahrer:</p>
                    <p className="text-muted-foreground">30 € pro Überstunde (ab 9. Stunde)</p>
                  </div>
                  <div>
                    <p className="font-semibold">Baumaschinenführer:</p>
                    <p className="text-muted-foreground">60 € pro Überstunde (ab 9. Stunde)</p>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>Hinweis:</strong> Nacht-, Sonn- und Feiertagszuschläge nach aktueller Preisliste
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Langzeiteinsätze */}
            <Card className="mb-12 bg-muted/30">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Wochen- und Monatspreise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">LKW CE Fahrer – Langzeitkonditionen</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-background rounded-lg text-center">
                        <div className="text-sm text-muted-foreground mb-1">Woche (5 Tage)</div>
                        <div className="text-2xl font-bold text-primary">ab 1.490 €</div>
                        <div className="text-xs text-muted-foreground mt-1">statt 1.745 €</div>
                      </div>
                      <div className="p-4 bg-background rounded-lg text-center">
                        <div className="text-sm text-muted-foreground mb-1">2 Wochen</div>
                        <div className="text-2xl font-bold text-primary">auf Anfrage</div>
                        <div className="text-xs text-muted-foreground mt-1">Sonderkonditionen</div>
                      </div>
                      <div className="p-4 bg-background rounded-lg text-center">
                        <div className="text-sm text-muted-foreground mb-1">Monat+</div>
                        <div className="text-2xl font-bold text-primary">individuell</div>
                        <div className="text-xs text-muted-foreground mt-1">Nach Vereinbarung</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="font-semibold text-lg mb-3">Baumaschinenführer – Projektpreise</h3>
                    <p className="text-muted-foreground mb-4">
                      Bei Langzeiteinsätzen ab 2 Wochen bieten wir attraktive Projektpreise. 
                      Je nach Einsatzdauer und Planungssicherheit erstellen wir Ihnen ein individuelles Angebot.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Staffelpreise ab 10 Einsatztagen</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Garantierte Verfügbarkeit bei Langzeitbuchungen</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ablauf in 3 Schritten */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-8">So einfach funktioniert die Buchung</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">1</div>
                    <CardTitle>Anfrage stellen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Nutzen Sie unser Online-Formular: Fahrzeugtyp, Einsatzort, Zeitraum und Besonderheiten angeben.
                    </p>
                    <div className="text-sm text-primary font-semibold">⏱️ Dauer: 2-3 Minuten</div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">2</div>
                    <CardTitle>Fahrer-Prüfung</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Wir prüfen verfügbare Fahrer mit passenden Qualifikationen und schlagen Ihnen geeignete Kandidaten vor.
                    </p>
                    <div className="text-sm text-primary font-semibold">⏱️ Reaktionszeit: 2-6 Stunden</div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">3</div>
                    <CardTitle>Einsatz startet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Der Fahrer kontaktiert Sie direkt zur Detailabstimmung und erscheint pünktlich zum vereinbarten Termin.
                    </p>
                    <div className="text-sm text-primary font-semibold">⏱️ Start: 24-72 Stunden</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Beispielrechnungen */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Beispielrechnungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-3">Beispiel 1: LKW CE Fahrer – Tageseinsatz Hamburg</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>1 Tag (8 Std.) LKW CE Fahrer</span>
                      <span className="font-semibold">349,00 €</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2 Überstunden à 30 €</span>
                      <span className="font-semibold">60,00 €</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fahrtkosten (45 km → 20 km × 2 × 0,40 €)</span>
                      <span className="font-semibold">16,00 €</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold text-base">
                      <span>Gesamt netto</span>
                      <span className="text-primary">425,00 €</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-3">Beispiel 2: Baumaschinenführer – Wochenprojekt</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>5 Tage à 459 € (Standard 8 Std./Tag)</span>
                      <span className="font-semibold">2.295,00 €</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fahrtkosten 5× (30 km → 5 km × 2 × 0,40 €)</span>
                      <span className="font-semibold">20,00 €</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold text-base">
                      <span>Gesamt netto</span>
                      <span className="text-primary">2.315,00 €</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Bei Wochenpreisen (ab 1.490 € für CE-Fahrer) reduzieren sich die Kosten weiter
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wichtige Hinweise */}
            <Card className="mb-12 border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle>Wichtige Hinweise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p><strong>Keine Arbeitnehmerüberlassung:</strong> Alle Fahrer arbeiten selbstständig nach § 84 HGB</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p><strong>Nettopreise:</strong> Alle Preise verstehen sich zzgl. gesetzlicher MwSt.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p><strong>Abrechnung:</strong> Nach tatsächlichem Einsatzumfang – Sie erhalten eine Rechnung von Fahrerexpress</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p><strong>Kurzzeiteinsätze:</strong> Same-Day-Buchungen sind ausgeschlossen – Mindestvorlauf 24h werktags</p>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Bereit für Ihre Fahreranfrage?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Nutzen Sie unser Online-Formular oder rufen Sie direkt an – wir beraten Sie gerne zu den passenden Konditionen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={scrollToBooking}>
                  Jetzt Fahrer buchen
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="tel:+4915771442285">☎ +49 1577 1442285</a>
                </Button>
              </div>
            </div>

            {/* Weitere Infos Links */}
            <div className="grid md:grid-cols-2 gap-6 mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">LKW CE Fahrer im Detail</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Alle Einsatzarten: Fahrmischer, Fernverkehr, ADR, Container, Wechselbrücke und mehr.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/lkw-fahrer-buchen">Mehr erfahren</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Baumaschinenführer im Detail</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Bagger, Radlader, Fahrmischer, Flüssigboden, Mischanlagen, Störungsbehebung.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/baumaschinenfuehrer-buchen">Mehr erfahren</Link>
                  </Button>
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

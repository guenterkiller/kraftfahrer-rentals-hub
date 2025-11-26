import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Euro, FileText, Shield, Truck, AlertCircle } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import baggerIcon from "@/assets/bagger-icon.png";

const PreiseUndAblauf = () => {
  useSEO({
    title: "Preise & Ablauf – LKW Fahrer mieten und Baumaschinenführer buchen",
    description: "Transparente Konditionen für Fahrervermittlung: LKW Fahrer mieten ab 349€/Tag netto, Baumaschinenführer buchen ab 459€/Tag. Ersatzfahrer LKW, Subunternehmer Fahrer, Fahrerservice für B2B.",
    keywords: "lkw fahrer mieten, fahrer buchen, ersatzfahrer lkw, subunternehmer fahrer, baumaschinenführer mieten, fahrerservice, fahrervermittlung, lkw fahrer tagespreis, baumaschinenführer kosten"
  });

  const scrollToBooking = () => {
    window.location.href = '/#fahreranfrage';
  };

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Preise & Ablauf im Detail
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Transparente Konditionen, klare Abläufe – so funktioniert die professionelle Vermittlung selbstständiger LKW-Fahrer & Baumaschinenführer.
              </p>
            </div>

            {/* Aktuelle Tagespreise */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-8">Aktuelle Tagespreise (netto)</h2>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-6">
                <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-2xl text-red-900">LKW CE Fahrer mieten</CardTitle>
                    <CardDescription className="text-red-700">Professionelle Ersatzfahrer für alle LKW-Einsätze</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-5xl font-bold text-red-700 mb-2">349 €</div>
                      <p className="text-red-800 font-medium">pro Tag (8 Std.) netto</p>
                      <p className="text-red-700 text-sm mt-2">30 € je Überstunde netto</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 mt-4">
                      <p className="text-xs text-red-900"><strong>Ideal für:</strong> Nah-, Fern- und Baustellenverkehr, Fahrmischer, ADR, Container, Entsorgung</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-2xl text-orange-900 flex items-center gap-2">
                      <img src={baggerIcon} alt="Bagger" className="h-6 w-6" />
                      Baumaschinenführer buchen
                    </CardTitle>
                    <CardDescription className="text-orange-700">Spezialisierte Fachkräfte für Baumaschinen</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-5xl font-bold text-orange-700 mb-2">459 €</div>
                      <p className="text-orange-800 font-medium">pro Tag (8 Std.) netto</p>
                      <p className="text-orange-700 text-sm mt-2">60 € je Überstunde netto</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-4xl mx-auto">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-sm text-blue-900">
                    <p><strong>👉 Mindestbuchung:</strong> 1 Einsatztag = 8 Stunden</p>
                    <p><strong>👉 Abrechnungstaktung:</strong> im 15-Minuten-Takt nach der 8. Stunde</p>
                    <p><strong>👉 Alle Preise:</strong> Netto-Preise zzgl. gesetzlicher MwSt.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vergleich zu Zeitarbeit */}
            <Card className="mb-12 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Vorteile gegenüber klassischer Zeitarbeit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">✅</div>
                    <p className="font-semibold text-green-900 mb-1">Kein AÜG</p>
                    <p className="text-sm text-muted-foreground">Keine Arbeitnehmerüberlassungs-regelungen</p>
                  </div>
                  <div className="bg-white border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">💰</div>
                    <p className="font-semibold text-green-900 mb-1">Keine Lohnnebenkosten</p>
                    <p className="text-sm text-muted-foreground">Kein Sozialversicherungsaufwand, keine Verwaltung</p>
                  </div>
                  <div className="bg-white border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <p className="font-semibold text-green-900 mb-1">Keine Bindungsfristen</p>
                    <p className="text-sm text-muted-foreground">Flexibel ab 1 Tag buchbar, keine Kündigungsfristen</p>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-green-900"><strong>💡 Unser Modell:</strong> Unsere Fahrer arbeiten als selbstständige Unternehmer auf Basis eines Dienst-/Werkvertrags. Es handelt sich nicht um Arbeitnehmerüberlassung – professionelle Vermittlung für B2B-Kunden.</p>
                </div>
              </CardContent>
            </Card>

            {/* Fahrtkosten-Regelung */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Truck className="h-6 w-6 text-primary" />
                  Fahrtkosten-Regelung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="font-semibold text-green-900 mb-2">Inklusive:</p>
                    <p className="text-green-800">Erste 25 km frei (Hin- & Rückweg)</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="font-semibold text-amber-900 mb-2">Ab dem 26. km:</p>
                    <p className="text-amber-800">0,40 € je gefahrenen Kilometer</p>
                  </div>
                </div>
                <div className="space-y-2 text-muted-foreground">
                  <p>➡ Berechnungsgrundlage: Wohnort des Fahrers zum Einsatzort</p>
                  <p>➡ Parkgebühren, Maut, Tunnel, Fähren → 1:1 an Auftraggeber weiterberechnet</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="font-semibold mb-2">Beispiel:</p>
                  <p className="text-muted-foreground">Entfernung 60 km → 35 km zu berechnen × 2 (Hin & Rück) × 0,40 € = <strong className="text-foreground">28,00 € Fahrtkosten netto</strong></p>
                </div>
              </CardContent>
            </Card>

            {/* Überstunden & Zuschläge */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Clock className="h-6 w-6 text-primary" />
                  Überstunden & Zuschläge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-semibold text-red-700 mb-2">LKW CE Fahrer:</p>
                    <p className="text-muted-foreground">30 € je Überstunde (ab 9. Stunde)</p>
                  </div>
                  <div>
                    <p className="font-semibold text-orange-700 mb-2">Baumaschinenführer:</p>
                    <p className="text-muted-foreground">60 € je Überstunde (ab 9. Stunde)</p>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <p className="font-semibold">Zuschläge auf den Stundensatz:</p>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• <strong>Nachtarbeit</strong> (22:00–06:00 Uhr): +25 %</li>
                    <li>• <strong>Samstag</strong>: +25 %</li>
                    <li>• <strong>Sonntag</strong>: +50 %</li>
                    <li>• <strong>Feiertage</strong>: +100 %</li>
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-blue-900"><strong>⏱️ Wichtig:</strong> Wartezeiten und Standzeiten gelten als Arbeitszeit und werden entsprechend abgerechnet.</p>
                </div>
              </CardContent>
            </Card>

            {/* Wochen- & Monatspreise */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-2xl text-red-900">LKW CE Fahrer – Langzeitkonditionen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Woche (5 Tage)</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-700">ab 1.490 €</div>
                        <div className="text-sm text-red-600 line-through">statt 1.745 €</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">2 Wochen</span>
                      <span className="font-semibold">auf Anfrage</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monat+</span>
                      <span className="font-semibold">individuell nach Projekt</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground pt-3 border-t space-y-1">
                    <p>➡ Woche = 5 Einsatztage (Mo–Fr)</p>
                    <p>➡ Überstunden & Fahrtkosten werden zusätzlich berechnet.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="text-2xl text-orange-900">Baumaschinenführer – Projektpreise</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-muted-foreground">Bei Einsätzen ab 2 Wochen bieten wir attraktive Projekt- und Staffelpreise:</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Staffelpreise ab 10 Einsatztagen</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Garantierte Verfügbarkeit für Langzeitprojekte</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Individuelle Paketpreise möglich</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Spesen & Übernachtungen */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Übernachtungen & Unterbringung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-semibold">Bei Einsätzen über 50 km einfacher Strecke oder mehrtägigen Projekten:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-semibold text-blue-900 mb-2">Option 1: Übernachtungspauschale</p>
                    <div className="text-2xl font-bold text-blue-700 mb-1">50 € pro Nacht</div>
                    <p className="text-sm text-blue-800">Falls keine Schlafkabine im LKW vorhanden ist</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="font-semibold text-green-900 mb-2">Option 2: Unterkunft durch AG</p>
                    <p className="text-sm text-green-800">Hotel oder Unterkunft wird direkt vom Auftraggeber gestellt bzw. gebucht</p>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">➡ Bei Fernverkehr mit Schlafkabine entfällt die Übernachtungspauschale.</p>
                </div>
              </CardContent>
            </Card>

            {/* Stornierungsregelungen */}
            <Card className="mb-12 border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                  Stornierungsregelungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p><strong>Storno bis 24 Std. vorher</strong> → kostenlos</p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p><strong>Storno unter 24 Std.</strong> → 80 % des Tagessatzes</p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p><strong>Same-Day-Buchungen</strong> sind ausgeschlossen (Mindestvorlauf 24h werktags)</p>
                </div>
              </CardContent>
            </Card>

            {/* Buchungsprozess */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-8">So einfach funktioniert die Buchung</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <span className="text-2xl font-bold text-primary">1</span>
                    </div>
                    <CardTitle>Anfrage stellen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-2">Im Online-Formular Fahrzeugtyp, Einsatzort, Zeitraum & Besonderheiten angeben.</p>
                    <p className="text-sm text-primary font-semibold">⏱️ 2–3 Minuten</p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <span className="text-2xl font-bold text-primary">2</span>
                    </div>
                    <CardTitle>Fahrer-Prüfung</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-2">Wir prüfen freie Fahrer mit passenden Qualifikationen und schlagen geeignete Kandidaten vor.</p>
                    <p className="text-sm text-primary font-semibold">⏱️ Antwortzeit: 2–6 Stunden</p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <span className="text-2xl font-bold text-primary">3</span>
                    </div>
                    <CardTitle>Einsatz startet & Abrechnung</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-2">Der Fahrer meldet sich direkt zur Abstimmung und erscheint pünktlich zum Termin. Sie erhalten eine übersichtliche Rechnung direkt von der Fahrerexpress-Agentur mit transparenter Abrechnung der erbrachten Leistung.</p>
                    <p className="text-sm text-primary font-semibold">💼 Professionelle Abwicklung</p>
                    <p className="text-xs text-muted-foreground mt-2">Hinweis: Unsere Fahrer arbeiten als selbstständige Unternehmer auf Basis eines Dienst- oder Werkvertrags. Es handelt sich nicht um Arbeitnehmerüberlassung.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Beispielrechnungen */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-8">Beispielrechnungen</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-red-900">Beispiel 1: LKW CE Fahrer – Tageseinsatz Hamburg</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">1 Tag (8 Std.) LKW CE Fahrer</span>
                        <span className="font-semibold">349,00 €</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">2 Überstunden à 30 €</span>
                        <span className="font-semibold">60,00 €</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground text-sm">Fahrtkosten (45 km → 20 km × 2 × 0,40 €)</span>
                        <span className="font-semibold">16,00 €</span>
                      </div>
                      <div className="flex justify-between py-3 bg-red-50 rounded-lg px-3 mt-3">
                        <span className="font-bold text-red-900">Gesamt netto:</span>
                        <span className="font-bold text-red-900 text-xl">425,00 €</span>
                      </div>
                      <div className="text-xs text-muted-foreground text-center mt-2">
                        zzgl. gesetzl. MwSt.
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-orange-900">Beispiel 2: Baumaschinenführer – Wochenprojekt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">5 Tage à 459 €</span>
                        <span className="font-semibold">2.295,00 €</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground text-sm">Fahrtkosten 5× (30 km → 5 km × 2 × 0,40 €)</span>
                        <span className="font-semibold">20,00 €</span>
                      </div>
                      <div className="flex justify-between py-3 bg-orange-50 rounded-lg px-3 mt-3">
                        <span className="font-bold text-orange-900">Gesamt netto:</span>
                        <span className="font-bold text-orange-900 text-xl">2.315,00 €</span>
                      </div>
                      <div className="text-xs text-muted-foreground text-center mt-2">
                        zzgl. gesetzl. MwSt.
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-green-800">➡ Bei Wochenpreisen (ab 1.490 €) reduzieren sich die Kosten weiter.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Rechtliche Hinweise */}
            <Card className="mb-12 border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  Rechtliche Hinweise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Selbstständige Fahrer</h3>
                  <p className="text-muted-foreground">Unsere Fahrer arbeiten als selbstständige Unternehmer auf Basis eines Dienst-/Werkvertrags. Es handelt sich nicht um Arbeitnehmerüberlassung.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Zusammenarbeit</h3>
                  <p className="text-muted-foreground">Der Abschluss eines Einsatzes erfolgt direkt zwischen Ihnen und dem Fahrer – wir übernehmen die professionelle Vermittlung. Keine zusätzliche Provision für Sie.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Haftung & Versicherung</h3>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Der Fahrer verfügt über eigene Berufshaftpflicht- und Gewerbeversicherung.</li>
                    <li>• Keine Sozialversicherungspflicht für Sie als Auftraggeber.</li>
                    <li>• Keine AÜG-Meldepflichten erforderlich.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Zahlungsbedingungen */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Euro className="h-6 w-6 text-primary" />
                  Zahlungsbedingungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Rechnungsstellung nach Einsatzende</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Zahlungsziel: 7 Tage netto</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Nettopreise zzgl. gesetzlicher MwSt.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">Bereit für Ihre Fahreranfrage?</CardTitle>
                <CardDescription className="text-base">
                  Nutzen Sie das Online-Formular oder rufen Sie direkt an – wir beraten Sie gerne.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-2xl font-bold text-primary mb-4">
                  📞 +49 1577 1442285
                </div>
                <Button onClick={scrollToBooking} size="lg" className="text-lg px-8 py-6">
                  👉 Jetzt Fahrer buchen
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PreiseUndAblauf;

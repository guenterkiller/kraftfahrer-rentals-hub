import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Euro, FileText, Shield, Truck, AlertCircle } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "react-router-dom";
import baggerIcon from "@/assets/bagger-icon.svg";

const PreiseUndAblauf = () => {
  useSEO({
    title: "Preise & Ablauf – LKW Fahrer mieten ab 349 € tageweise",
    description: "LKW CE Fahrer, Baumaschinenführer und Mischmeister für Flüssigboden – transparente Tagessätze & Ablauf. Ab 349 €/Tag.",
    keywords: "LKW Fahrer mieten Preis, Fahrer leihen Kosten, Fahrer bestellen Tagessatz, Mietfahrer Preis, Leihfahrer Kosten, Aushilfsfahrer Tagessatz, Ersatzfahrer LKW Preis, Fahrer tageweise, Fahrer wochenweise, Fahrer auf Abruf, Kipper Fahrer Preis, Baustellen Fahrer Kosten, Fahrmischer Fahrer, Sattelzug Fahrer, Fahrer Dienstleister, Fahrer-Dienstleistungen Kosten, externe LKW Fahrer, LKW Fahrer Vermittlung",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Fahrervermittlung für selbstständige Unternehmer",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Fahrerexpress-Agentur - Günter Killer",
        "telephone": "+49-1577-1442285"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Deutschland"
      },
      "audience": {
        "@type": "BusinessAudience",
        "audienceType": "B2B"
      },
      "description": "Vermittlung von LKW CE Fahrern, Baumaschinenführern und Mischmeistern als selbstständige Subunternehmer für Speditionen, Bauunternehmen und Logistikdienstleister deutschlandweit."
    }
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
                Fahrer mieten, leihen oder bestellen – Preise & Ablauf
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Ersatzfahrer, Aushilfsfahrer, Mietfahrer & Leihfahrer tageweise oder wochenweise auf Abruf. Transparente Tagessätze für externe Fahrer-Dienstleistungen.
              </p>
            </div>

            {/* Aktuelle Tagespreise */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-8">Mietfahrer & Leihfahrer – Tagespreise (netto)</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-6">
                <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl text-red-900">LKW Fahrer buchen</CardTitle>
                    <CardDescription className="text-red-700">Nahverkehr, Baustelle, Verteiler</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-red-700 mb-2">349 €</div>
                      <p className="text-red-800 font-medium text-sm">pro Tag (8 Std.) netto</p>
                      <p className="text-red-700 text-xs mt-2">30 € je Überstunde</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-900 flex items-center gap-2">
                      🛣️ Fernfahrer-Pauschale
                    </CardTitle>
                    <CardDescription className="text-green-700">Fernverkehr mit Übernachtung</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-green-700 mb-2">450 €</div>
                      <p className="text-green-800 font-medium text-sm">Pauschale pro Einsatztag (netto)</p>
                      <p className="text-green-700 text-xs mt-2">Bis 10 Std. abgegolten – keine Stundenabrechnung</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl text-orange-900 flex items-center gap-2">
                      <img src={baggerIcon} alt="Bagger" className="h-5 w-5" />
                      Baumaschinenführer
                    </CardTitle>
                    <CardDescription className="text-orange-700">Bagger, Radlader & mehr</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-orange-700 mb-2">459 €</div>
                      <p className="text-orange-800 font-medium text-sm">pro Tag (8 Std.) netto</p>
                      <p className="text-orange-700 text-xs mt-2">60 € je Überstunde</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-900">Mischmeister</CardTitle>
                    <CardDescription className="text-blue-700">Anlagenbediener Flüssigboden</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-blue-700 mb-2">489 €</div>
                      <p className="text-blue-800 font-medium text-sm">pro Tag (8 Std.) netto</p>
                      <p className="text-blue-700 text-xs mt-2">65 € je Überstunde</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Fernfahrer-Pauschale Detail */}
              <Card className="bg-green-50 border-green-200 max-w-4xl mx-auto mb-6">
                <CardContent className="pt-6">
                  <div className="space-y-2 text-sm">
                    <p><strong>🚛 Fernfahrer-Pauschale:</strong> Pauschalvergütung pro Einsatztag für Fernverkehr mit Übernachtung im Führerhaus. Gesetzlich zulässige Lenk- und Arbeitszeiten sind möglich, begründen jedoch keinen Anspruch auf zusätzliche Vergütung innerhalb der Pauschale.</p>
                    <p><strong>Arbeitszeit bis 10 Stunden ist mit der Pauschale abgegolten.</strong></p>
                    <p>Ab Überschreitung von 10 Stunden fällt ein Zuschlag an oder es gilt ein zusätzlicher Einsatztag (gemäß Auftragsbestätigung).</p>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-4xl mx-auto">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-sm text-blue-900">
                    <p><strong>👉 Mindestbuchung:</strong> 1 Einsatztag = 8 Stunden (bzw. Pauschale bei Fernverkehr)</p>
                    <p><strong>👉 Abrechnungstaktung:</strong> im 15-Minuten-Takt nach der 8. Stunde (nicht bei Fernfahrer-Pauschale)</p>
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
                    <p className="font-semibold text-red-700 mb-2">LKW CE Fahrer (Nahverkehr):</p>
                    <p className="text-muted-foreground">30 € je Überstunde (ab 9. Stunde)</p>
                  </div>
                  <div>
                    <p className="font-semibold text-orange-700 mb-2">Baumaschinenführer:</p>
                    <p className="text-muted-foreground">60 € je Überstunde (ab 9. Stunde)</p>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-green-900 mb-1">Fernfahrer-Pauschale:</p>
                  <p className="text-sm text-green-800">Keine Stundenabrechnung. Arbeitszeit bis 10 Stunden ist mit der Tagespauschale (450 €) abgegolten. Ab Überschreitung von 10 Stunden fällt ein Zuschlag an oder es gilt ein zusätzlicher Einsatztag.</p>
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

            {/* Einsatzdauer & Langzeitkonditionen */}
            <Card className="mb-12 border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                  Einsatzdauer & Langzeitkonditionen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="font-semibold text-lg mb-2">Kurz- und Mitteleinsätze (unter 3 Monaten)</p>
                  <p className="text-muted-foreground">
                    Für Einsätze bis unter 3 Monaten gelten unsere transparenten Tagessätze ohne Wochenrabatte.
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>LKW CE Fahrer: 349 € pro Tag (8 Std.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Fernfahrer-Pauschale: 450 € pro Einsatztag (bis 10 Std., keine Stundenabrechnung)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Baumaschinenführer: 459 € pro Tag (8 Std.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Mischmeister Flüssigboden: 489 € pro Tag (8 Std.)</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="font-semibold text-lg mb-2">Langzeiteinsätze (ab 3 Monaten)</p>
                  <p className="text-muted-foreground">
                    Langzeiteinsätze ab 3 Monaten werden individuell kalkuliert – fair für selbstständige Fahrer und Auftraggeber.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    ➡ Sprechen Sie uns an für ein individuelles Angebot.
                  </p>
                </div>
              </CardContent>
            </Card>

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
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-blue-800">➡ Langzeiteinsätze ab 3 Monaten werden individuell kalkuliert.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Was bleibt beim Fahrer übrig - Infobox */}
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold text-emerald-900 mb-2">Transparenz für Auftraggeber</h2>
              <p className="text-muted-foreground">Warum der Tagessatz fair kalkuliert ist – ein Blick hinter die Zahlen</p>
            </div>
            <Card className="mb-12 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-emerald-900">
                  <Euro className="h-6 w-6 text-emerald-600" />
                  Was bleibt beim Fahrer realistisch übrig?
                </CardTitle>
                <CardDescription className="text-emerald-700">
                  Orientierungsrechnung für selbstständige LKW-Fahrer (CE)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <p className="font-semibold text-emerald-900 mb-3">Beispiel: 20 Einsatztage im Monat</p>
                  <div className="space-y-2 text-sm md:text-base">
                    <div className="flex justify-between py-2 border-b border-emerald-100">
                      <span className="text-muted-foreground">Monatliche Einnahmen (20 Tage)</span>
                      <span className="font-semibold">ca. 5.900 €</span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground pt-2 pb-1 font-medium">Typische Abgaben als Selbstständiger:</p>
                    
                    <div className="flex justify-between py-2 border-b border-emerald-100">
                      <span className="text-muted-foreground">– Krankenversicherung (gesetzl./privat)</span>
                      <span className="font-semibold text-red-600">– ca. 450–650 €</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-emerald-100">
                      <span className="text-muted-foreground">– Altersvorsorge / Rentenversicherung</span>
                      <span className="font-semibold text-red-600">– ca. 300–500 €</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-emerald-100">
                      <span className="text-muted-foreground">– Einkommensteuer (geschätzt)</span>
                      <span className="font-semibold text-red-600">– ca. 700–1.000 €</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-emerald-100">
                      <span className="text-muted-foreground">– Betriebsausgaben (Telefon, Buchhaltung etc.)</span>
                      <span className="font-semibold text-red-600">– ca. 100–200 €</span>
                    </div>
                  </div>
                  
                  {/* Ergebnis hervorgehoben */}
                  <div className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-4 text-white">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="font-bold text-lg">≈ Netto beim Fahrer:</span>
                      <span className="font-bold text-2xl sm:text-3xl">ca. 3.800 – 4.000 €</span>
                    </div>
                  </div>
                </div>

                {/* Zusätzliche Einnahmen */}
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <p className="font-semibold text-emerald-900 mb-2">💡 Zusätzliche Einnahmen möglich:</p>
                  <ul className="space-y-1 text-sm text-emerald-800">
                    <li>• Überstunden (30 € je Stunde ab der 9. Std.)</li>
                    <li>• Zuschläge für Nacht-, Wochenend- & Feiertagsarbeit</li>
                    <li>• Fahrtkosten-Erstattung ab dem 26. km</li>
                    <li>• Übernachtungspauschale bei Fernverkehr</li>
                  </ul>
                </div>

                {/* Disclaimer */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs md:text-sm text-amber-900">
                      <p className="font-semibold mb-1">⚠️ Wichtiger Hinweis</p>
                      <p>Die dargestellten Werte sind Durchschnittswerte und begründen keinen Anspruch auf tatsächliche oder zukünftige Einnahmen. Die tatsächlichen Abgaben hängen von individuellen Faktoren ab (Familienstand, gewählte Versicherungen, absetzbare Betriebsausgaben). Diese Berechnung dient ausschließlich der Orientierung und stellt <strong>keine Steuer- oder Rechtsberatung</strong> dar.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  <p className="text-muted-foreground">Unsere Fahrer arbeiten als selbstständige Unternehmer auf Basis eines Dienst-/Werkvertrags. Es handelt sich nicht um Arbeitnehmerüberlassung. Der Subunternehmer ist in der Ausführung seiner Tätigkeit fachlich eigenverantwortlich und nicht in die Arbeitsorganisation des Auftraggebers eingegliedert.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Zusammenarbeit</h3>
                  <p className="text-muted-foreground">Die Einsätze werden über die Fahrerexpress-Agentur koordiniert. Die Fahrleistung wird von selbstständigen Unternehmern erbracht, Sie erhalten eine übersichtliche Rechnung direkt von der Fahrerexpress-Agentur. Für Sie als Auftraggeber entstehen keine zusätzlichen Vermittlungsgebühren über die vereinbarten Tages- und Nebenkosten hinaus.</p>
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

            {/* Mini-AGB für Auftraggeber */}
            <Card className="mb-12 border-gray-300 bg-gray-50/50">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6 text-gray-700" />
                  Allgemeine Vertragsbedingungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">1. Vertragsverhältnis</h3>
                  <p className="text-muted-foreground">Die Fahrerexpress-Agentur erbringt Dienstleistungen mit selbstständigen Subunternehmern. Vertragspartner des Auftraggebers ist ausschließlich die Fahrerexpress-Agentur.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">2. Einsatzdurchführung</h3>
                  <p className="text-muted-foreground">Die Leistung wird durch geeignete Subunternehmer ausgeführt. Ein Wechsel der Einsatzperson ist zulässig, sofern die Leistung gleichwertig erbracht wird.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">3. Haftung</h3>
                  <p className="text-muted-foreground">Bei Nichterscheinen eines Subunternehmers haftet die Fahrerexpress-Agentur nur für eigenes Verschulden und maximal bis zur Höhe des vereinbarten Auftragswertes. Folgeschäden sind ausgeschlossen, sofern nicht grobe Fahrlässigkeit vorliegt.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">4. Abrechnung</h3>
                  <p className="text-muted-foreground">Der Auftraggeber erhält eine Rechnung der Fahrerexpress-Agentur. Die Agentur begleicht im Anschluss die Vergütung der eingesetzten Subunternehmer.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">5. Verbot der Direktabwerbung</h3>
                  <p className="text-muted-foreground">Der Auftraggeber verpflichtet sich, Fahrer nicht direkt oder am System vorbei zu beauftragen.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">6. Gerichtsstand</h3>
                  <p className="text-muted-foreground">Gerichtsstand ist Frankfurt am Main.</p>
                </div>
              </CardContent>
            </Card>

            {/* Interne Verlinkung zu Landingpages */}
            <Card className="mb-12 border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl">Passende Fahrer für Ihren Bedarf</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Link to="/ersatzfahrer-lkw" className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <Truck className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Ersatzfahrer bei Fahrerausfall buchen</span>
                  </Link>
                  <Link to="/mietfahrer" className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <Truck className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Mietfahrer für flexible Einsätze</span>
                  </Link>
                  <Link to="/lkw-fahrer-kurzfristig" className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">LKW-Fahrer kurzfristig verfügbar</span>
                  </Link>
                  <Link to="/fahrer-fuer-speditionen" className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Fahrer für Speditionen bundesweit</span>
                  </Link>
                </div>
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

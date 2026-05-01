import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Euro, FileText, Shield, Truck, AlertCircle } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "react-router-dom";
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
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-3">
                Selbstständige Unternehmer tageweise oder wochenweise auf Abruf. Transparente Tagessätze für externe Fahrer-Dienstleistungen.
              </p>
              <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
                Die Fahrerexpress-Agentur vermittelt ausschließlich selbstständige Unternehmer mit eigenem Gewerbe für Fahrerdienstleistungen – Fahrzeuge werden nicht gestellt.
              </p>
            </div>

            {/* Kompakte Preisstruktur */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-4">Mietfahrer & selbstständige Fahrer – Preise</h2>
              <p className="text-center text-sm text-muted-foreground max-w-3xl mx-auto mb-8">
                Die Fahrerexpress-Agentur vermittelt selbstständige Unternehmer für Fahrerdienstleistungen. Fahrzeuge werden nicht gestellt. Alle Preise verstehen sich netto zzgl. gesetzlicher MwSt.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto mb-6">
                <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg sm:text-xl text-red-900 leading-snug">
                      LKW-Fahrer CE
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-red-700 mb-2">349 €</div>
                      <p className="text-red-800 font-medium text-sm">pro Einsatztag</p>
                      <p className="text-red-700 text-xs mt-3 leading-snug">Gültig für: bis 10 Stunden</p>
                      <p className="text-red-700 text-xs mt-1 leading-snug">Zusätzlich: An- und Abfahrt</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative border border-red-200 bg-red-50/50 hover:shadow-lg transition-shadow">
                  <span className="absolute top-3 right-3 z-10 bg-red-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                    Planbar &amp; günstiger
                  </span>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg sm:text-xl text-red-900 leading-snug pr-28">
                      LKW-Fahrer CE – Wochenpreis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-red-700 mb-2">1.645 €</div>
                      <p className="text-red-800 font-medium text-sm">pro Woche</p>
                      <p className="text-red-700 text-xs mt-3 leading-snug">Nur für LKW-Fahrer CE: 5 Einsatztage à bis 10 Stunden</p>
                      <p className="text-red-700 text-xs mt-1 leading-snug">Zusätzlich: An- und Abfahrt</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg sm:text-xl text-green-900 leading-snug">
                      Fernfahrer-Pauschale
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-700 mb-2">450 €</div>
                      <p className="text-green-800 font-medium text-sm">pro Einsatztag</p>
                      <p className="text-green-700 text-xs mt-3 leading-snug">Gültig für: 1 Fernverkehrs-Einsatztag</p>
                      <p className="text-green-700 text-xs mt-1 leading-snug">Zusätzlich: An- und Abfahrt</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg text-orange-900 leading-snug">
                      Baumaschinenführer / Mischmeister
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-orange-700 mb-2">489 €</div>
                      <p className="text-orange-800 font-medium text-sm">pro Einsatztag</p>
                      <p className="text-orange-700 text-xs mt-3 leading-snug">Gültig für: bis 8 Stunden</p>
                      <p className="text-orange-700 text-xs mt-1 leading-snug">Zusätzlich: An- und Abfahrt</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-muted/50 border border-border rounded-lg p-4 max-w-4xl mx-auto">
                <p className="text-sm text-foreground">
                  Weitere Kosten entstehen nur, wenn sie vorher ausdrücklich vereinbart wurden.
                </p>
                <p className="text-sm text-foreground mt-2">
                  Bei auswärtigen Einsätzen kann zusätzlich eine Übernachtung erforderlich sein. Diese wird vor Auftragserteilung abgestimmt.
                </p>
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
                    <p className="font-semibold text-green-900 mb-1">Keine Arbeitnehmerüberlassung (AÜG)</p>
                    <p className="text-sm text-muted-foreground">Vermittlung selbstständiger Unternehmer</p>
                  </div>
                  <div className="bg-white border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">💰</div>
                    <p className="font-semibold text-green-900 mb-1">Keine Lohnnebenkosten</p>
                    <p className="text-sm text-muted-foreground">Selbstständige Unternehmer – keine Verwaltung</p>
                  </div>
                  <div className="bg-white border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <p className="font-semibold text-green-900 mb-1">Keine Bindungsfristen</p>
                    <p className="text-sm text-muted-foreground">Flexibel ab 1 Tag buchbar, keine Kündigungsfristen</p>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-green-900"><strong>💡 Unser Modell:</strong> Die Fahrerexpress-Agentur vermittelt ausschließlich selbstständige Unternehmer mit eigenem Gewerbe für Fahrerdienstleistungen auf Basis eines Dienst-/Werkvertrags. Es erfolgt ausdrücklich keine Überlassung von Arbeitnehmern. Die eingesetzten Unternehmer entscheiden eigenständig über die konkrete Ausführung der Tätigkeit im Rahmen des vereinbarten Auftrags. Der Auftraggeber beschränkt sich auf die Beschreibung des gewünschten Arbeitsergebnisses. Eine fachliche Weisungsbefugnis gegenüber dem eingesetzten Unternehmer besteht nicht.</p>
                </div>
              </CardContent>
            </Card>

            {/* An- und Abfahrt */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Truck className="h-6 w-6 text-primary" />
                  An- und Abfahrt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Die An- und Abfahrt wird zusätzlich zum Tagessatz berechnet und vor Auftragserteilung klar ausgewiesen.
                </p>
                <div>
                  <p className="font-semibold mb-2">Berechnung:</p>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• erste 25 km der Gesamtstrecke frei</li>
                    <li>• ab dem 26. km: 0,40 € je gefahrenem Kilometer</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Mehrzeiten & Sonderfälle */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Clock className="h-6 w-6 text-primary" />
                  Mehrzeiten & Sonderfälle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Die genannten Preise gelten für den vereinbarten Einsatztag bzw. Wochenpreis. Weitere Kosten entstehen nur, wenn sie vor Auftragserteilung ausdrücklich vereinbart wurden, zum Beispiel bei Nacht-, Wochenend-, Feiertagseinsätzen, besonderen Zusatzleistungen oder außergewöhnlichen Mehrzeiten.
                </p>
              </CardContent>
            </Card>

            {/* Langzeiteinsätze */}
            <Card className="mb-12 border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                  Langzeiteinsätze
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Langzeiteinsätze ab 3 Monaten werden individuell kalkuliert. Sprechen Sie uns an für ein individuelles Angebot.
                </p>
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
                  <p><strong>Storno unter 24 Std.</strong> → Wir behalten uns vor, den entgangenen Aufwand pauschal mit 80 % des vereinbarten Tagessatzes zu berechnen, sofern kein geringerer Schaden nachgewiesen wird.</p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p><strong>Absage am Einsatztag oder Nichterscheinen</strong> → 100 % des vereinbarten Tagessatzes</p>
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
                    <p className="text-muted-foreground mb-2">Wir prüfen passende selbstständige Unternehmer und melden uns schnellstmöglich mit einer Rückmeldung.</p>
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
                    <p className="text-muted-foreground mb-2">Der selbstständige Unternehmer meldet sich direkt zur Abstimmung und erscheint pünktlich zum Termin. Sie erhalten eine übersichtliche Rechnung direkt von der Fahrerexpress-Agentur.</p>
                    <p className="text-sm text-primary font-semibold">💼 Mit Bestätigung des Einsatzes entsteht ein verbindlicher Auftrag.</p>
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
                  <h3 className="font-semibold text-lg mb-2">Keine eigene Fahrerstellung</h3>
                  <p className="text-muted-foreground">Die Fahrerexpress-Agentur vermittelt ausschließlich selbstständige Unternehmer mit eigenem Gewerbe für Fahrerdienstleistungen – Fahrzeuge werden nicht gestellt.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Keine Arbeitnehmerüberlassung (AÜG)</h3>
                  <p className="text-muted-foreground">Es erfolgt ausdrücklich keine Überlassung von Arbeitnehmern, sondern die Vermittlung selbstständiger Unternehmer auf Basis eines Dienst-/Werkvertrags. Der Subunternehmer ist in der Ausführung seiner Tätigkeit fachlich eigenverantwortlich und nicht in die Arbeitsorganisation des Auftraggebers eingegliedert.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Weisungsrecht</h3>
                  <p className="text-muted-foreground">Die Fahrer arbeiten eigenverantwortlich auf Basis eines Dienst- oder Werkvertrags. Es erfolgt keine Eingliederung in den Betrieb des Auftraggebers (keine Arbeitnehmerüberlassung).</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Sozialversicherung</h3>
                  <p className="text-muted-foreground">Die eingesetzten Unternehmer sind eigenständig tätig. Eine sozialversicherungsrechtliche Bewertung erfolgt im Einzelfall durch die zuständigen Behörden.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Haftung & Versicherung</h3>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Der selbstständige Unternehmer verfügt über eigene Berufshaftpflicht- und Gewerbeversicherung.</li>
                    <li>• Für Schäden im Zusammenhang mit der Durchführung des Einsatzes haftet der ausführende Unternehmer im Rahmen seiner betrieblichen Versicherungen.</li>
                    <li>• Die Fahrerexpress-Agentur haftet nur für eigenes Verschulden sowie für Auswahlverschulden bei der Vermittlung geeigneter Unternehmer.</li>
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
                  <p className="text-muted-foreground">Die Fahrerexpress-Agentur erbringt Dienstleistungen mit selbstständigen Subunternehmern. Vertragspartner des Auftraggebers ist ausschließlich die Fahrerexpress-Agentur. Die Fahrerexpress-Agentur schuldet die Organisation und Vermittlung der Dienstleistung. Die konkrete Leistungserbringung erfolgt durch selbstständige Unternehmer in eigener Verantwortung.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">2. Einsatzdurchführung</h3>
                  <p className="text-muted-foreground">Die Leistung wird durch geeignete Subunternehmer ausgeführt. Ein Wechsel der Einsatzperson ist zulässig, sofern die Leistung gleichwertig erbracht wird.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">3. Haftung</h3>
                  <p className="text-muted-foreground">Bei Nichterscheinen eines Subunternehmers haftet die Fahrerexpress-Agentur nur für eigenes Verschulden und maximal bis zur Höhe des vereinbarten Auftragswertes. Folgeschäden sind ausgeschlossen, soweit gesetzlich zulässig und kein vorsätzliches oder grob fahrlässiges Verhalten vorliegt.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">4. Abrechnung</h3>
                  <p className="text-muted-foreground">Vertragspartner des Auftraggebers ist die Fahrerexpress-Agentur. Die Rechnungsstellung erfolgt nach Einsatzende durch die Fahrerexpress-Agentur gemäß Auftragsbestätigung.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">5. Verbot der Direktbeauftragung</h3>
                  <p className="text-muted-foreground">Die direkte oder umgehende Beauftragung von durch Fahrerexpress vermittelten Unternehmern außerhalb der Agentur ist nur mit Zustimmung der Fahrerexpress-Agentur zulässig. Dies gilt auch für einen Zeitraum von 12 Monaten nach Einsatzende.</p>
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

import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, FileText, Users, Shield, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";

const Wissenswertes = () => {
  useSEO({
    title: "Wissenswertes – Fahrer mieten, leihen oder bestellen rechtssicher",
    description: "Mietfahrer, Leihfahrer, Aushilfsfahrer rechtssicher beauftragen: externe Fahrer-Dienstleistungen ohne Arbeitnehmerüberlassung.",
    keywords: "Fahrer mieten rechtssicher, Fahrer leihen legal, Mietfahrer beauftragen, Leihfahrer LKW, Aushilfsfahrer rechtlich, externe Fahrer, Fahrer Dienstleister, externe Fahrer-Dienstleistungen, Fahrer-Vermittlung, Scheinselbstständigkeit vermeiden, Fahrer auf Abruf, Fahrer tageweise, Ersatzfahrer, Vertretungsfahrer"
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
                  <li>➡ Da die vermittelten Fahrer kein eigenes Fahrzeug einsetzen und keine eigene Transportleistung anbieten, ist in der Regel keine eigene Transportversicherung des Fahrers erforderlich. Die konkrete Versicherungssituation sollte im Einzelfall geprüft werden.</li>
                  <li>➡ Eine Vollkaskoversicherung für das Fahrzeug ist Sache des Fahrzeughalters bzw. Auftraggebers.</li>
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
                    Kurzfristige Vermittlung nach Verfügbarkeit
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
                    Einfache Abrechnung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Keine eigene Personalabrechnung nötig – Abrechnung über Fahrerexpress
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    Zusammenarbeit auf klar geregelter vertraglicher Basis
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
                    <li>✓ Die Zusammenarbeit erfolgt auf Basis eines Dienst- oder Werkvertrags ohne Eingliederung in die Betriebsorganisation des Auftraggebers</li>
                    <li>✓ Ergebnis definieren, nicht den Weg</li>
                    <li>✓ Fahrer nicht in Dienstpläne integrieren</li>
                    <li>✓ Eine selbstständige Tätigkeit sollte nicht auf eine dauerhafte Eingliederung in den Betrieb eines einzelnen Auftraggebers hinauslaufen.</li>
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
                    <li>• Die Haftung richtet sich nach den gesetzlichen Bestimmungen sowie den individuell vereinbarten Vertragsregelungen</li>
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
                      <li>• Klare Preisstruktur</li>
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

          <Separator className="my-16" />

          {/* Qualifikationen & Voraussetzungen für selbstständige LKW-Fahrer */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">🎓 Qualifikationen & Voraussetzungen für selbstständige LKW-Fahrer</h2>
            <p className="text-muted-foreground mb-8 max-w-4xl">
              Wer als selbstständiger LKW-Fahrer (Berufskraftfahrer) im gewerblichen Güterverkehr tätig wird, muss eine Reihe gesetzlicher Voraussetzungen erfüllen.
              Die folgende Übersicht fasst die wichtigsten Punkte zusammen – von der Fahrerkarte über die Berufskraftfahrerqualifikation bis zum CE-Führerschein und den typischen Einsatzgebieten.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>CE-Führerschein</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>
                    Die Fahrerlaubnisklasse <strong>CE</strong> berechtigt zum Führen von LKW über 3,5 t zulässiger Gesamtmasse mit Anhänger – inklusive Sattelzügen und Gliederzügen.
                    Sie ist die wichtigste Voraussetzung für den Einsatz im Fernverkehr, im Baustellenverkehr, mit Fahrmischer, Silofahrzeug, Tankwagen oder Wechselbrücke.
                  </p>
                  <p>
                    Ergänzende Klassen wie <strong>C1, C, D1, D oder DE</strong> erweitern das Einsatzspektrum (z. B. mittlere LKW, Busse, Reisebusse mit Anhänger).
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fahrerkarte (Tachograph)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>
                    Die <strong>Fahrerkarte</strong> ist die persönliche Chipkarte für den digitalen Tachographen und für jeden gewerblichen LKW-Fahrer ab 3,5 t Pflicht.
                    Sie zeichnet Lenk- und Ruhezeiten gemäß EU-Verordnung 561/2006 fahrerbezogen auf.
                  </p>
                  <p>
                    Beantragt wird die Fahrerkarte beim zuständigen Kraftfahrt-Bundesamt bzw. den Fahrerlaubnisbehörden der Länder. Sie ist 5 Jahre gültig und muss rechtzeitig verlängert werden.
                    Selbstständige Berufskraftfahrer sind selbst für eine gültige Fahrerkarte verantwortlich.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Berufskraftfahrerqualifikation (BKrFQG)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>
                    Im gewerblichen Güter- und Personenverkehr ist neben dem Führerschein die <strong>Grundqualifikation</strong> oder eine Berufsausbildung zum Berufskraftfahrer (BKF) erforderlich (Berufskraftfahrer-Qualifikations-Gesetz – BKrFQG).
                  </p>
                  <p>
                    Zusätzlich müssen Berufskraftfahrer alle 5 Jahre <strong>5 Module Weiterbildung</strong> (insgesamt 35 Stunden) absolvieren. Der Nachweis erfolgt über die <strong>Schlüsselzahl 95</strong> im Führerschein bzw. den Fahrerqualifizierungsnachweis.
                  </p>
                  <p>
                    Selbstständige LKW-Fahrer, die wir vermitteln, sind selbst für die fristgerechte Weiterbildung und einen gültigen Qualifikationsnachweis verantwortlich.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Unternehmer im Güterverkehr</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>
                    Selbstständige LKW-Fahrer, die ausschließlich vom Auftraggeber gestellte Fahrzeuge bewegen, erbringen eine reine <strong>Fahrer-Dienstleistung</strong> – keine eigene Transportleistung mit eigenem Fahrzeug.
                    Eine Güterkraftverkehrserlaubnis (GüKG / EU-Lizenz) ist dafür in der Regel nicht erforderlich, weil das eigene Unternehmen keine Güter mit eigenen Fahrzeugen befördert.
                  </p>
                  <p>
                    Voraussetzung für die Selbstständigkeit ist eine ordnungsgemäße <strong>Gewerbeanmeldung</strong>, eine steuerliche Erfassung beim Finanzamt sowie – empfohlen – eine Betriebshaftpflichtversicherung.
                    Wer mit eigenem LKW gewerblich Güter befördert, benötigt zusätzlich die Güterkraftverkehrserlaubnis und einen Verkehrsleiter mit fachlicher Eignung.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Voraussetzungen für selbstständige LKW-Fahrer auf einen Blick</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Gültiger Führerschein CE (oder C1/C, D1/D, DE je nach Einsatz)</li>
                    <li>✓ Gültige Fahrerkarte für den digitalen Tachographen</li>
                    <li>✓ Berufskraftfahrerqualifikation mit Schlüsselzahl 95 (oder gleichwertiger Nachweis aus EU/EWR)</li>
                    <li>✓ Eingetragenes Gewerbe und steuerliche Erfassung</li>
                    <li>✓ Eigenverantwortliche Arbeitsweise, mehrere Auftraggeber, keine Eingliederung in den Betrieb des Auftraggebers</li>
                    <li>✓ Empfehlenswert: Betriebshaftpflichtversicherung</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    Sie erfüllen diese Voraussetzungen?{" "}
                    <a href="/fahrer-registrierung" className="text-primary underline hover:no-underline">
                      Als selbstständiger LKW-Fahrer registrieren
                    </a>.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Typische Einsatzgebiete für CE-Fahrer</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>Fernverkehr & Linienverkehr</strong> – nationale und europaweite Touren mit Sattelzug</li>
                    <li>• <strong>Nahverkehr & Verteilerverkehr</strong> – regionale Auslieferung, Wechselbrücke, Containerverkehr</li>
                    <li>• <strong>Baustellenverkehr</strong> – Kipper, Fahrmischer (Beton), Silofahrzeuge, Abrollkipper</li>
                    <li>• <strong>Tank- und Gefahrgutverkehr</strong> – Tankzüge, ADR-Transporte (mit gültiger ADR-Bescheinigung)</li>
                    <li>• <strong>Spezialverkehre</strong> – Schwertransport-Begleitung (BF3), Kranbetrieb, Eventlogistik</li>
                    <li>• <strong>Kurzfristige Vertretung</strong> – Ersatzfahrer bei Krankheit, Urlaub oder Auftragsspitzen</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Mini-AGB */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">📋 Allgemeine Vertragsbedingungen</h2>
            
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2">1. Vertragsverhältnis</h4>
                  <p className="text-muted-foreground">Die Fahrerexpress-Agentur organisiert und vermittelt Fahrerdienstleistungen mit selbstständigen Subunternehmern. Vertragspartner des Auftraggebers ist ausschließlich die Fahrerexpress-Agentur.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">2. Einsatzdurchführung</h4>
                  <p className="text-muted-foreground">Die Leistung wird durch geeignete Subunternehmer ausgeführt. Ein Wechsel der Einsatzperson ist zulässig, sofern die Leistung gleichwertig erbracht wird.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">3. Haftung</h4>
                  <p className="text-muted-foreground">Bei Nichterscheinen eines Subunternehmers haftet die Fahrerexpress-Agentur nur für eigenes Verschulden und maximal bis zur Höhe des vereinbarten Auftragswertes. Folgeschäden sind ausgeschlossen, soweit gesetzlich zulässig und kein vorsätzliches oder grob fahrlässiges Verhalten vorliegt.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">4. Abrechnung</h4>
                  <p className="text-muted-foreground">Der Auftraggeber erhält nach Einsatzende eine Rechnung der Fahrerexpress-Agentur gemäß Auftragsbestätigung.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">5. Verbot der Direktbeauftragung</h4>
                  <p className="text-muted-foreground">Die direkte oder umgehende Beauftragung eines durch Fahrerexpress vermittelten Unternehmers außerhalb der Fahrerexpress-Agentur ist ohne vorherige Zustimmung von Fahrerexpress unzulässig. Dies gilt für den konkreten Einsatz sowie für Folgeaufträge im sachlichen Zusammenhang für einen Zeitraum von 12 Monaten nach Einsatzende.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">6. Gerichtsstand</h4>
                  <p className="text-muted-foreground">Gerichtsstand ist Frankfurt am Main.</p>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator className="my-16" />

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
                    Wir melden uns schnellstmöglich mit einer Rückmeldung. Same-Day ist ausgeschlossen. Kurzfristige Vermittlung nach Verfügbarkeit.
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
                    Die Preise richten sich nach Einsatzart, Dauer, Fahrzeugtyp und Auftragsumfang. Maßgeblich ist die jeweilige Auftragsbestätigung. Eine Übersicht finden Sie auf der Seite „Preise & Ablauf“.
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
                    <p className="text-muted-foreground">
                      Sie erhalten eine Rechnung direkt von Fahrerexpress gemäß Auftragsbestätigung. Damit haben Sie einen zentralen Ansprechpartner für Abrechnung und Einsatzkoordination.
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
                    Fahrer werden vor Einsatz nach den angegebenen Qualifikationen geprüft. Je nach Einsatzanforderung werden Führerschein, Berufserfahrung und Zusatzqualifikationen wie ADR-Schein oder Kranführerschein berücksichtigt.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Bieten Sie Ihre Fahrer wirklich deutschlandweit an?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ja. Die Fahrerexpress-Agentur vermittelt selbstständige LKW-Fahrer, Kraftfahrer und Baumaschinenführer deutschlandweit. Sie können LKW-Fahrer deutschlandweit buchen – unsere Fahrer-Vermittlung ist bundesweit aktiv.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Stellen Sie auch LKW oder Baumaschinen zur Verfügung?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Nein. Wir vermitteln ausschließlich Fahrer und Bediener – keine Fahrzeuge, keine Baumaschinen, keine Anlagen. Geräte und Fahrzeuge stellt immer der Auftraggeber. Unsere Baumaschinenführer sind nur Bediener, keine Maschine wird mitgeliefert. Mischmeister/Anlagenbediener bedienen nur bauseits gestellte Anlagen.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Brauchen wir eine Arbeitnehmerüberlassung, wenn wir über die Fahrerexpress-Agentur buchen?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Nein. Keine Arbeitnehmerüberlassung (AÜG). Es erfolgt ausdrücklich keine Überlassung von Arbeitnehmern, sondern die Vermittlung selbstständiger Unternehmer per Dienstleistungs- oder Werkvertrag.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Wie schnell bekommen wir einen Ersatzfahrer bei Ausfall?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Bei kurzfristigen Ausfällen können wir einen Ersatzfahrer deutschlandweit organisieren – kurzfristig im Rahmen der Verfügbarkeit. Kraftfahrer mieten ist bundesweit möglich.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Vermitteln Sie auch Baggerfahrer und Radladerfahrer?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ja. Wir vermitteln selbstständige Baggerfahrer, Radladerfahrer und Baumaschinenführer deutschlandweit als Subunternehmer für einzelne Bauabschnitte, Tagesbaustellen oder komplette Projekte. Die Maschinen stellt immer der Auftraggeber – wir liefern nur qualifizierte Bediener.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Bieten Sie Mischmeister für Flüssigboden an?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ja. Wir vermitteln erfahrene Mischmeister und Anlagenbediener für Flüssigboden deutschlandweit als Subunternehmer. Der Mischmeister bedient Ihre bauseits gestellte Anlage, Radlader/Bagger und Fahrmischer – keine eigene Maschinenvermietung.
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
                    <a href="tel:+4915771442285">📞 Anrufen: 01577 1442285</a>
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
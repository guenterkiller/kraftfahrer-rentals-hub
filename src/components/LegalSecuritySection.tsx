import { Shield, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LegalSecuritySection = () => {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white border-t">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full mb-3 md:mb-4">
              <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3">
              Rechtssicher & transparent
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Ihre Sicherheit steht an erster Stelle
            </p>
          </div>

          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                So arbeiten wir
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    <strong>Es wird kein eigenes Fahrpersonal gestellt.</strong> Die Fahrerexpress-Agentur vermittelt ausschließlich selbstständige Unternehmer mit eigenem Gewerbe.
                  </p>
                </div>
                
                <div className="flex items-start gap-2 md:gap-3">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    <strong>Keine Arbeitnehmerüberlassung (AÜG).</strong> Es erfolgt ausdrücklich keine Überlassung von Arbeitnehmern, sondern die Vermittlung selbstständiger Unternehmer.
                  </p>
                </div>
                
                <div className="flex items-start gap-2 md:gap-3">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    <strong>Der Auftraggeber erteilt keine arbeitsrechtlichen Weisungen.</strong> Die Zusammenarbeit erfolgt auf Basis einer eigenständigen unternehmerischen Leistung.
                  </p>
                </div>

                <div className="flex items-start gap-2 md:gap-3">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    Die eingesetzten Unternehmer sind eigenständig tätig. <strong>Eine sozialversicherungsrechtliche Bewertung erfolgt im Einzelfall durch die zuständigen Behörden.</strong>
                  </p>
                </div>
                
                <div className="flex items-start gap-2 md:gap-3">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    Sie erhalten eine <strong>übersichtliche Rechnung direkt von der Fahrerexpress-Agentur</strong>. Keine zusätzlichen Vermittlungsgebühren – transparente Tagessätze ohne versteckte Kosten.
                  </p>
                </div>

                <div className="flex items-start gap-2 md:gap-3">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    Für Schäden im Zusammenhang mit der Durchführung des Einsatzes <strong>haftet der ausführende Unternehmer im Rahmen seiner betrieblichen Versicherungen.</strong>
                  </p>
                </div>
                
                <div className="flex items-start gap-2 md:gap-3">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    Die Fahrerexpress-Agentur vermittelt ausschließlich selbstständige Unternehmer mit eigenem Gewerbe für Fahrerdienstleistungen – <strong>Fahrzeuge werden nicht gestellt.</strong>
                  </p>
                </div>

                <div className="flex items-start gap-2 md:gap-3">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    Alle Preise auf dieser Seite verstehen sich <strong>zzgl. gesetzlicher MwSt.</strong>
                  </p>
                </div>
              </div>

              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t bg-blue-50 -mx-4 md:-mx-6 px-4 md:px-6 py-3 md:py-4 rounded-b-lg">
                <p className="text-xs md:text-sm text-blue-900 leading-relaxed">
                  <strong>💡 Hinweis:</strong> Die von uns vermittelten Fahrer sind selbstständige Unternehmer mit eigenem Gewerbe. Die Fahrerexpress-Agentur beschäftigt selbst keine Fahrer. Begriffe wie „Mietfahrer", „Leihfahrer" oder „Ersatzfahrer" sind umgangssprachlich und bezeichnen keine arbeitsrechtliche Einordnung.
                </p>
                <p className="text-xs text-blue-800 mt-2 leading-relaxed">
                  Alle Preis-, Abrechnungs- und Beispielangaben dienen der Orientierung und stellen keine Zusicherung, Garantie oder steuerliche Beratung dar.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mini-AGB Kurzfassung */}
          <Card className="mt-6 md:mt-8 border-gray-200">
            <CardHeader className="bg-gray-50 py-3 md:py-4">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <FileText className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                Vertragsbedingungen im Überblick
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 md:pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                <div>
                  <p className="font-semibold mb-1">Vertragspartner</p>
                  <p className="text-muted-foreground">Ausschließlich Fahrerexpress-Agentur</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Abrechnung</p>
                  <p className="text-muted-foreground">Eine Rechnung von Fahrerexpress</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Haftung</p>
                  <p className="text-muted-foreground">Max. Auftragswert, keine Folgeschäden</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Gerichtsstand</p>
                  <p className="text-muted-foreground">Frankfurt am Main</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LegalSecuritySection;

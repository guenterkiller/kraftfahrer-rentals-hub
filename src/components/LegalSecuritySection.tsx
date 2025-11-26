import { Shield, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LegalSecuritySection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white border-t">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Rechtssicher & transparent
            </h2>
            <p className="text-lg text-muted-foreground">
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
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Unsere Fahrer arbeiten als selbstständige Unternehmer</strong> auf Basis eines Dienst-/Werkvertrags.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 leading-relaxed">
                    Es handelt sich <strong>nicht um Arbeitnehmerüberlassung</strong> (kein AÜG).
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 leading-relaxed">
                    Der Abschluss eines Einsatzes erfolgt direkt zwischen Ihnen und dem Fahrer – <strong>wir übernehmen die professionelle Vermittlung</strong>.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Keine zusätzliche Provision für Sie</strong> – transparente Tagessätze ohne versteckte Kosten.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 leading-relaxed">
                    Alle Preise auf dieser Seite verstehen sich <strong>zzgl. gesetzlicher MwSt.</strong>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t bg-blue-50 -mx-6 px-6 py-4 rounded-b-lg">
                <p className="text-sm text-blue-900 leading-relaxed">
                  <strong>💡 Ihr Vorteil:</strong> Rechtssichere Zusammenarbeit mit selbstständigen Fahrern – 
                  keine Sozialversicherungspflicht, keine Equal-Pay-Problematik, keine AÜG-Meldepflichten.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LegalSecuritySection;

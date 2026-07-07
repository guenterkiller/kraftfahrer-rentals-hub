import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface JobOffer {
  id: string;
  customer_name: string;
  company?: string;
  einsatzort: string;
  zeitraum: string;
  fahrzeugtyp: string;
  fuehrerscheinklasse: string;
  besonderheiten?: string;
  nachricht: string;
  billing_model: 'agency'; // Nur noch Agenturmodell
  created_at: string;
}

interface JobAcceptanceDialogProps {
  job: JobOffer;
  driverId: string;
  onAccept: (jobId: string, termsAccepted: boolean) => void;
  onDecline: (jobId: string) => void;
}

const JobAcceptanceDialog: React.FC<JobAcceptanceDialogProps> = ({
  job,
  driverId,
  onAccept,
  onDecline
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!termsAccepted) {
      return; // Prevent submission without terms acceptance
    }
    
    setIsSubmitting(true);
    try {
      await onAccept(job.id, termsAccepted);
    } finally {
      setIsSubmitting(false);
    }
  };

  const billingInfo = {
    title: "Agenturabrechnung (Subunternehmer-Modell)",
    description: "Du stellst deine Rechnung nach Einsatzende direkt an Fahrerexpress. Fahrerexpress stellt dem Auftraggeber eine Gesamtrechnung. Die vereinbarte Vermittlungsgebühr wird automatisch berücksichtigt.",
    alertColor: "bg-yellow-50 border-yellow-200",
    iconColor: "text-yellow-600",
    consentRequired: true,
    consentText: "Ich bestätige den Einsatz als selbstständiger Subunternehmer im Rahmen eines Werk-/Dienstvertrags gegenüber dem Auftraggeber. Ich stelle meine Rechnung an Fahrerexpress. Die vereinbarte Vermittlungsgebühr wird automatisch berücksichtigt. Vermittlung nach § 652 BGB (Maklervertrag) – keine Arbeitnehmerüberlassung und kein Arbeitsverhältnis."
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🚛 Neuer Auftrag verfügbar
          <Badge variant="outline" className="ml-auto">
            {new Date(job.created_at).toLocaleDateString('de-DE')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Billing Model Alert */}
        <Alert className={billingInfo.alertColor}>
          <AlertTriangle className={`h-4 w-4 ${billingInfo.iconColor}`} />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-semibold text-lg">{billingInfo.title}</div>
              <div className="text-sm">{billingInfo.description}</div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Job Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-600">Kunde</label>
              <p className="text-base">{job.customer_name}</p>
            </div>
            {job.company && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Unternehmen</label>
                <p className="text-base">{job.company}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-gray-600">Einsatzort</label>
              <p className="text-base">{job.einsatzort}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Zeitraum</label>
              <p className="text-base">{job.zeitraum}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-600">Fahrzeugtyp</label>
              <p className="text-base">{job.fahrzeugtyp}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Führerscheinklasse</label>
              <p className="text-base">{job.fuehrerscheinklasse}</p>
            </div>
            {job.besonderheiten && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Besonderheiten</label>
                <p className="text-base">{job.besonderheiten}</p>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="text-sm font-semibold text-gray-600">Nachricht</label>
          <div className="bg-gray-50 p-3 rounded-md mt-1">
            <p className="text-base">{job.nachricht}</p>
          </div>
        </div>

        {/* Terms Acceptance */}
        <div className="border-2 border-yellow-300 bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms-consent"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              className="mt-1"
              required
            />
            <div className="flex-1">
              <label htmlFor="terms-consent" className="text-sm cursor-pointer">
                <div className="font-semibold text-yellow-800 mb-2">
                  ⚠️ Rechtliche Zustimmung erforderlich:
                </div>
                <div className="text-yellow-700 leading-relaxed">
                  {billingInfo.consentText}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <Alert className="bg-amber-50 border-amber-300">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <div className="font-semibold mb-1">Hinweis:</div>
            <div className="text-sm leading-relaxed">
              Bei der Vergabe dieses Fahrauftrags werden vorrangig selbstständige Fahrer aus der Nähe des Einsatzortes berücksichtigt. Erst wenn sich keine geeigneten regionalen Fahrer melden, werden Bewerbungen aus anderen Regionen berücksichtigt. Bitte bewerben Sie sich daher nur, wenn Sie den Einsatzort wirtschaftlich erreichen können.
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
            onClick={handleAccept}
            disabled={isSubmitting || !termsAccepted}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            {isSubmitting ? (
              <>⏳ Wird verarbeitet...</>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Dienst-/Werkvertrag als Subunternehmer annehmen
              </>
            )}
          </Button>
          
          <Button
            onClick={() => onDecline(job.id)}
            disabled={isSubmitting}
            variant="destructive"
            className="flex-1"
            size="lg"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Auftrag ablehnen
          </Button>
        </div>

        {/* Legal Notice */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="font-semibold mb-1">Rechtlicher Hinweis:</div>
            <div className="text-sm">
              Mit der Annahme bestätigen Sie, dass Sie die Bedingungen des gewählten Abrechnungsmodells verstehen und akzeptieren.
              Es handelt sich um eine Vermittlung nach § 652 BGB (Maklervertrag). Fahrerexpress vermittelt zwischen selbstständigen Fahrern und Auftraggebern.
              Es handelt sich ausdrücklich nicht um Arbeitnehmerüberlassung, sondern um Dienst-/Werkverträge zwischen selbstständigen Subunternehmern und Auftraggebern.
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default JobAcceptanceDialog;
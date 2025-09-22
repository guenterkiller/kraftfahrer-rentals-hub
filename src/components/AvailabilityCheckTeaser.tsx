import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

const AvailabilityCheckTeaser = () => {
  const scrollToBooking = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.querySelector('#fahreranfrage');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4 mb-6">
      <div className="flex items-start gap-3">
        <Clock className="text-green-600 h-6 w-6 mt-1" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Jetzt Verfügbarkeit prüfen
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            In 60 Sek. Eckdaten senden – wir disponieren zügig und melden uns spätestens bis zum nächsten Werktag.
            <br />
            <strong>Dienst-/Werkleistung, keine Arbeitnehmerüberlassung.</strong>
          </p>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={scrollToBooking}
            aria-label="Verfügbarkeit prüfen"
          >
            Verfügbarkeit prüfen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCheckTeaser;
import { Button } from "@/components/ui/button";

const BookingPriorityBanner = () => {
  const scrollToBooking = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.querySelector('#fahreranfrage');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="rounded-xl border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 p-6 mb-6 shadow-md">
      <div className="flex items-start gap-4">
        <div className="text-4xl">⚡</div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-blue-900 mb-2">
            Professionelle Anfrage in 2 Minuten – direkt & strukturiert
          </h2>
          <div className="space-y-2 text-sm text-blue-800 mb-4">
            <p className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Schnellere Vermittlung:</strong> Alle Infos auf einen Blick, keine zeitraubenden Rückfragen</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Präzise Fahrerzuweisung:</strong> Wir finden genau den Fahrer, der zu Ihren Anforderungen passt</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Transparente Preise:</strong> Sofort sichtbar – LKW CE 349€, Baumaschinen 459€ pro Tag</span>
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-900">
              <strong>⏰ Wichtiger Hinweis:</strong> Die meisten Fahrer sind Mo–Fr im Einsatz. 
              Neue Buchungen können in der Regel ab der kommenden Woche eingeplant werden. 
              <strong> Mindestvorlauf: 24h werktags.</strong>
            </p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
            onClick={scrollToBooking}
            size="lg"
            aria-label="Zum Buchungsformular scrollen"
          >
            Jetzt Fahrer anfragen – unverbindlich
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingPriorityBanner;
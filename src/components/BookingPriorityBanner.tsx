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
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🚀</div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Schneller zum Fahrer: Bitte „Fahrer buchen" nutzen
          </h2>
          <p className="text-sm text-gray-700 mt-1">
            Ihre Anfrage wird strukturiert erfasst und zügig disponiert. So vermeiden wir Rückfragen und können den passenden Fahrer schnell zuweisen.
            <strong>Hinweis:</strong> Viele Fahrer sind Mo–Fr im Einsatz – neue Einsätze sind meist ab kommender Woche planbar.
          </p>
          <Button 
            className="mt-3 bg-blue-600 hover:bg-blue-700"
            onClick={scrollToBooking}
            aria-label="Jetzt Fahrer buchen – schnelles Formular"
          >
            Jetzt Fahrer buchen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingPriorityBanner;
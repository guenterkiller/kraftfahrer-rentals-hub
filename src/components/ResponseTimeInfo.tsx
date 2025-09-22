import { Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const ResponseTimeInfo = () => {
  const handleCall = () => {
    window.location.href = "tel:+4915771442285";
  };

  return (
    <div className="bg-blue-50 rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-blue-600" />
        Antwortzeit & Erreichbarkeit
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 font-semibold">⏰</div>
          <div>
            <p className="font-medium">Antwortzeit</p>
            <p className="text-sm text-gray-700">
              Spätestens nächster Werktag, oft schneller
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="text-blue-600 font-semibold">📞</div>
          <div className="flex-1">
            <p className="font-medium">Telefon-Hotline</p>
            <p className="text-sm text-gray-700 mb-2">
              01577 1442285 (Mo–Fr 8–18 Uhr, Sa 9–14 Uhr)
            </p>
            <Button 
              size="sm"
              onClick={handleCall}
              className="md:hidden bg-blue-600 hover:bg-blue-700"
            >
              <Phone className="h-4 w-4 mr-1" />
              Jetzt anrufen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseTimeInfo;
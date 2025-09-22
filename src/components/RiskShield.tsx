import { Shield } from "lucide-react";

const RiskShield = () => {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center mb-8">
      <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Kein Risiko für Sie
      </h3>
      <p className="text-sm text-gray-700">
        Sollte kein Fahrer verfügbar sein, entstehen keine Kosten. 
        Transparente Konditionen, eine Rechnung, kein AÜG.
      </p>
    </div>
  );
};

export default RiskShield;
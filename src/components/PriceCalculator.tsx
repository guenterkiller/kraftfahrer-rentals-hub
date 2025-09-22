import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

const PriceCalculator = () => {
  const [days, setDays] = useState<number>(1);
  const [totalKm, setTotalKm] = useState<number>(0);
  const [nightWeekend, setNightWeekend] = useState<boolean>(false);
  const [calculated, setCalculated] = useState<boolean>(false);

  const calculatePrice = () => {
    const basePrice = 399; // Base daily rate
    const totalBasePrice = days * basePrice;
    
    // Travel costs: free up to 50km, then 0.40€ per km
    const travelCosts = totalKm > 50 ? (totalKm - 50) * 0.40 : 0;
    
    // Night/weekend surcharge: 15% for simplicity
    const nightWeekendSurcharge = nightWeekend ? totalBasePrice * 0.15 : 0;
    
    // Overnight allowance for long distances
    const overnightAllowance = totalKm > 150 ? days * 45 : 0;
    
    const totalPrice = totalBasePrice + travelCosts + nightWeekendSurcharge + overnightAllowance;
    
    setCalculated(true);
    return {
      basePrice: totalBasePrice,
      travelCosts,
      nightWeekendSurcharge,
      overnightAllowance,
      totalPrice
    };
  };

  const result = calculated ? calculatePrice() : null;

  return (
    <Card className="max-w-md mx-auto mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Mini-Preisrechner
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Abschätzender Kostenvoranschlag
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="days">Einsatztage</Label>
          <Input
            id="days"
            type="number"
            min="1"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="km">Gesamtkilometer (hin + zurück)</Label>
          <Input
            id="km"
            type="number"
            min="0"
            value={totalKm}
            onChange={(e) => setTotalKm(Number(e.target.value))}
            className="mt-1"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="nightweekend"
            checked={nightWeekend}
            onCheckedChange={(checked) => setNightWeekend(checked as boolean)}
          />
          <Label htmlFor="nightweekend" className="text-sm">
            Nacht-/Wochenendeinsatz
          </Label>
        </div>
        
        <Button onClick={calculatePrice} className="w-full">
          Preis berechnen
        </Button>
        
        {result && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Geschätzte Kosten:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Grundpreis ({days} Tage):</span>
                <span>{result.basePrice.toFixed(2)} €</span>
              </div>
              {result.travelCosts > 0 && (
                <div className="flex justify-between">
                  <span>Anfahrt (ab 50km):</span>
                  <span>{result.travelCosts.toFixed(2)} €</span>
                </div>
              )}
              {result.nightWeekendSurcharge > 0 && (
                <div className="flex justify-between">
                  <span>Nacht-/WE-Zuschlag:</span>
                  <span>{result.nightWeekendSurcharge.toFixed(2)} €</span>
                </div>
              )}
              {result.overnightAllowance > 0 && (
                <div className="flex justify-between">
                  <span>Übernachtungspauschale:</span>
                  <span>{result.overnightAllowance.toFixed(2)} €</span>
                </div>
              )}
              <div className="border-t pt-2 font-semibold flex justify-between">
                <span>Gesamt (netto):</span>
                <span>{result.totalPrice.toFixed(2)} €</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              <strong>Unverbindliche Richtkalkulation.</strong> Finale Konditionen im Angebot.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceCalculator;
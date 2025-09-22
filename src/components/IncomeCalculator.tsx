import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const IncomeCalculator = () => {
  const [workDays, setWorkDays] = useState<number>(20);
  const [profile, setProfile] = useState<string>("standard");
  const [result, setResult] = useState<any>(null);

  const calculateIncome = () => {
    const dailyRates = {
      standard: 399,
      special: 459 // ADR, Kran, Fahrmischer
    };

    const dailyRate = dailyRates[profile as keyof typeof dailyRates];
    const grossIncome = workDays * dailyRate;
    
    // Typical deductions for self-employed drivers
    const socialContributions = grossIncome * 0.20; // 20% for social security
    const insurance = grossIncome * 0.05; // 5% for insurance
    const reserves = grossIncome * 0.15; // 15% for sick days, vacation, etc.
    
    const netIncome = grossIncome - socialContributions - insurance - reserves;
    
    const calculatedResult = {
      grossIncome,
      socialContributions,
      insurance,
      reserves,
      netIncome
    };
    
    setResult(calculatedResult);
  };

  return (
    <Card className="max-w-md mx-auto mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Einnahme-Rechner
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Realistische Beispielrechnung für selbstständige Fahrer
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="workdays">Einsatztage pro Monat</Label>
          <Input
            id="workdays"
            type="number"
            min="1"
            max="31"
            value={workDays}
            onChange={(e) => setWorkDays(Number(e.target.value))}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="profile">Fahrer-Profil</Label>
          <Select value={profile} onValueChange={setProfile}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard LKW-Fahrer (399 €/Tag)</SelectItem>
              <SelectItem value="special">Spezialfahrer ADR/Kran (459 €/Tag)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={calculateIncome} className="w-full">
          Einnahmen berechnen
        </Button>
        
        {result && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold mb-2">Monatliche Kalkulation:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Brutto-Einnahmen:</span>
                <span className="font-medium">{result.grossIncome.toFixed(0)} €</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- Sozialabgaben (ca. 20%):</span>
                <span>-{result.socialContributions.toFixed(0)} €</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- Versicherungen (ca. 5%):</span>
                <span>-{result.insurance.toFixed(0)} €</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- Rücklagen Urlaub/Krankheit:</span>
                <span>-{result.reserves.toFixed(0)} €</span>
              </div>
              <div className="border-t pt-2 font-semibold flex justify-between text-green-700">
                <span>Netto verfügbar:</span>
                <span>{result.netIncome.toFixed(0)} €</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              <strong>Realistische Beispielrechnung.</strong> Deine tatsächlichen Werte können abweichen.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeCalculator;
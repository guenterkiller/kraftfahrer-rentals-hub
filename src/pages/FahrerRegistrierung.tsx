import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const FahrerRegistrierung = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    vorname: "",
    nachname: "",
    email: "",
    telefon: "",
    adresse: "",
    plz: "",
    ort: "",
    fuehrerscheinklassen: [] as string[],
    erfahrung_jahre: "",
    spezialisierungen: [] as string[],
    verfuegbare_regionen: [] as string[],
    stundensatz: "",
    verfuegbarkeit: "",
    beschreibung: "",
  });

  const fuehrerscheinklassen = ["B", "C1", "C", "CE", "D1", "D", "DE"];
  const spezialisierungen = [
    "Baustellen-LKW",
    "Fernfahrt",
    "Fahrmischer",
    "Kipper",
    "Kran",
    "Schwertransport",
    "Gefahrgut",
    "Kühlfahrzeuge"
  ];
  const bundeslaender = [
    "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen",
    "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen",
    "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen",
    "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"
  ];

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field as keyof typeof prev] as string[], value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('fahrer_profile')
        .insert([{
          vorname: formData.vorname,
          nachname: formData.nachname,
          email: formData.email,
          telefon: formData.telefon,
          adresse: formData.adresse,
          plz: formData.plz,
          ort: formData.ort,
          fuehrerscheinklassen: formData.fuehrerscheinklassen,
          erfahrung_jahre: parseInt(formData.erfahrung_jahre),
          spezialisierungen: formData.spezialisierungen,
          verfuegbare_regionen: formData.verfuegbare_regionen,
          stundensatz: parseFloat(formData.stundensatz),
          verfuegbarkeit: formData.verfuegbarkeit,
          beschreibung: formData.beschreibung,
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Registrierung erfolgreich!",
        description: "Vielen Dank für Ihre Registrierung! Wir werden Ihre Daten prüfen und uns bei Ihnen melden.",
      });

      // Nach erfolgreichem Submit zur Startseite weiterleiten
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

      // Form zurücksetzen
      setFormData({
        vorname: "",
        nachname: "",
        email: "",
        telefon: "",
        adresse: "",
        plz: "",
        ort: "",
        fuehrerscheinklassen: [],
        erfahrung_jahre: "",
        spezialisierungen: [],
        verfuegbare_regionen: [],
        stundensatz: "",
        verfuegbarkeit: "",
        beschreibung: "",
      });

    } catch (error) {
      toast({
        title: "Fehler bei der Registrierung",
        description: "Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-muted pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Zurück Button */}
            <div className="mb-6">
              <Button variant="ghost" asChild className="mb-4">
                <Link to="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Zurück zur Startseite
                </Link>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Fahrer-Registrierung bei Fahrerexpress
                </CardTitle>
                <p className="text-center text-muted-foreground">
                  Registrieren Sie sich als selbständiger Kraftfahrer und werden Sie Teil unseres Netzwerks
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Persönliche Daten */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vorname">Vorname *</Label>
                      <Input
                        id="vorname"
                        value={formData.vorname}
                        onChange={(e) => setFormData({...formData, vorname: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="nachname">Nachname *</Label>
                      <Input
                        id="nachname"
                        value={formData.nachname}
                        onChange={(e) => setFormData({...formData, nachname: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">E-Mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefon">Telefon *</Label>
                      <Input
                        id="telefon"
                        value={formData.telefon}
                        onChange={(e) => setFormData({...formData, telefon: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  {/* Adresse */}
                  <div>
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input
                      id="adresse"
                      value={formData.adresse}
                      onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plz">PLZ</Label>
                      <Input
                        id="plz"
                        value={formData.plz}
                        onChange={(e) => setFormData({...formData, plz: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ort">Ort</Label>
                      <Input
                        id="ort"
                        value={formData.ort}
                        onChange={(e) => setFormData({...formData, ort: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Qualifikationen */}
                  <div>
                    <Label>Führerscheinklassen *</Label>
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mt-2">
                      {fuehrerscheinklassen.map((klasse) => (
                        <div key={klasse} className="flex items-center space-x-2">
                          <Checkbox
                            id={klasse}
                            checked={formData.fuehrerscheinklassen.includes(klasse)}
                            onCheckedChange={(checked) => 
                              handleCheckboxChange('fuehrerscheinklassen', klasse, checked as boolean)
                            }
                          />
                          <Label htmlFor={klasse} className="text-sm">{klasse}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="erfahrung">Berufserfahrung (Jahre) *</Label>
                    <Select onValueChange={(value) => setFormData({...formData, erfahrung_jahre: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen Sie Ihre Erfahrung" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Jahr</SelectItem>
                        <SelectItem value="2">2-3 Jahre</SelectItem>
                        <SelectItem value="5">5-10 Jahre</SelectItem>
                        <SelectItem value="10">10-20 Jahre</SelectItem>
                        <SelectItem value="20">Über 20 Jahre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Spezialisierungen */}
                  <div>
                    <Label>Spezialisierungen</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {spezialisierungen.map((spez) => (
                        <div key={spez} className="flex items-center space-x-2">
                          <Checkbox
                            id={spez}
                            checked={formData.spezialisierungen.includes(spez)}
                            onCheckedChange={(checked) => 
                              handleCheckboxChange('spezialisierungen', spez, checked as boolean)
                            }
                          />
                          <Label htmlFor={spez} className="text-sm">{spez}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verfügbare Regionen */}
                  <div>
                    <Label>Verfügbare Bundesländer</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 max-h-40 overflow-y-auto">
                      {bundeslaender.map((land) => (
                        <div key={land} className="flex items-center space-x-2">
                          <Checkbox
                            id={land}
                            checked={formData.verfuegbare_regionen.includes(land)}
                            onCheckedChange={(checked) => 
                              handleCheckboxChange('verfuegbare_regionen', land, checked as boolean)
                            }
                          />
                          <Label htmlFor={land} className="text-sm">{land}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stundensatz">Stundensatz (€) *</Label>
                      <Input
                        id="stundensatz"
                        type="number"
                        step="0.50"
                        value={formData.stundensatz}
                        onChange={(e) => setFormData({...formData, stundensatz: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="verfuegbarkeit">Verfügbarkeit</Label>
                      <Select onValueChange={(value) => setFormData({...formData, verfuegbarkeit: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Verfügbarkeit wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sofort">Sofort verfügbar</SelectItem>
                          <SelectItem value="1woche">In 1 Woche</SelectItem>
                          <SelectItem value="2wochen">In 2 Wochen</SelectItem>
                          <SelectItem value="1monat">In 1 Monat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="beschreibung">Beschreibung / Zusätzliche Informationen</Label>
                    <Textarea
                      id="beschreibung"
                      value={formData.beschreibung}
                      onChange={(e) => setFormData({...formData, beschreibung: e.target.value})}
                      rows={4}
                      placeholder="Beschreiben Sie Ihre Erfahrungen, besonderen Qualifikationen oder Präferenzen..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Registrierung läuft..." : "Jetzt registrieren"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FahrerRegistrierung;
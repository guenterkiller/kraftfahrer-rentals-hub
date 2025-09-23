import { useState } from "react";
import { Car, ShieldAlert, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SimpleBookingForm = () => {
  const [loading, setLoading] = useState(false);
  const [agreedToPrices, setAgreedToPrices] = useState(false);
  const [agreedToData, setAgreedToData] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [adrRequired, setAdrRequired] = useState(false);
  const [craneRequired, setCraneRequired] = useState(false);
  const [longDistance, setLongDistance] = useState(false);
  const [nightShift, setNightShift] = useState(false);
  const [weekendWork, setWeekendWork] = useState(false);
  const [heavyLift, setHeavyLift] = useState(false);
  const [specialLicense, setSpecialLicense] = useState(false);
  const [constructionSite, setConstructionSite] = useState(false);
  const [temperatureControlled, setTemperatureControlled] = useState(false);
  const [oversizeLoad, setOversizeLoad] = useState(false);
  const [forklift, setForklift] = useState(false);
  const [tankSilo, setTankSilo] = useState(false);
  const [international, setInternational] = useState(false);
  const [languages, setLanguages] = useState(false);
  const [bf3Certified, setBf3Certified] = useState(false);
  const [escortExperience, setEscortExperience] = useState(false);
  const [requiresBf2, setRequiresBf2] = useState(false);
  const [requiresBf3, setRequiresBf3] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const payload = {
        vorname: formData.get('vorname'),
        nachname: formData.get('nachname'),
        email: formData.get('email'),
        phone: formData.get('telefon'),
        company: formData.get('unternehmen'),
        customer_street: formData.get('strasse'),
        customer_house_number: formData.get('hausnummer'),
        customer_postal_code: formData.get('plz'),
        customer_city: formData.get('ort'),
        einsatzbeginn: formData.get('einsatzbeginn'),
        einsatzdauer: formData.get('einsatzdauer'),
        fahrzeugtyp: formData.get('fahrzeugtyp'),
        nachricht: formData.get('beschreibung'),
        anforderungen: [
          adrRequired && 'ADR-Schein',
          craneRequired && 'Kran-Erfahrung',
          longDistance && 'Langstrecke',
          nightShift && 'Nachtschicht',
          weekendWork && 'Wochenendarbeit',
          heavyLift && 'Schwerlast',
          specialLicense && 'Sonderführerschein',
          constructionSite && 'Baustelle',
          temperatureControlled && 'Kühltransport',
          oversizeLoad && 'Übermaß',
          forklift && 'Stapler',
          tankSilo && 'Tank/Silo',
          international && 'International',
          languages && 'Fremdsprachen',
          bf3Certified && 'BF3-zertifiziert',
          escortExperience && 'Begleitung',
          requiresBf2 && 'BF2 erforderlich',
          requiresBf3 && 'BF3 erforderlich'
        ].filter(Boolean),
        datenschutz: agreedToData,
        newsletter: newsletter,
        billing_model: 'agency'
      };

      console.log('Sending payload:', payload);

      const { data, error } = await supabase.functions.invoke('submit-fahrer-anfrage', {
        body: payload,
        headers: { 'Content-Type': 'application/json' }
      });

      if (error) {
        // Enhanced error logging to see exact server response
        console.error('Function error:', error);
        // @ts-ignore
        const responseText = await error.context?.response?.text?.();
        console.error('Function error body:', responseText || error.message);
        throw new Error(responseText || error.message);
      }

      toast({
        title: "Anfrage erfolgreich gesendet!",
        description: "Wir melden uns spätestens bis zum nächsten Werktag bei Ihnen.",
      });

      // Reset form
      if (e.currentTarget) {
        e.currentTarget.reset();
      }
      setAgreedToPrices(false);
      setAgreedToData(false);
      setNewsletter(false);
      setAdrRequired(false);
      setCraneRequired(false);
      setLongDistance(false);
      setNightShift(false);
      setWeekendWork(false);
      setHeavyLift(false);
      setSpecialLicense(false);
      setConstructionSite(false);
      setTemperatureControlled(false);
      setOversizeLoad(false);
      setForklift(false);
      setTankSilo(false);
      setInternational(false);
      setLanguages(false);
      setBf3Certified(false);
      setEscortExperience(false);
      setRequiresBf2(false);
      setRequiresBf3(false);

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Fehler beim Senden",
        description: "Bitte versuchen Sie es erneut oder rufen Sie uns an.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToForm = () => {
    const element = document.querySelector('#booking-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-white" id="fahreranfrage">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Priority Banner */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🚀</div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Schneller zum Fahrer: Bitte „Fahrer buchen" nutzen
                </h2>
                <p className="text-sm text-gray-700 mt-1">
                  Ihre Anfrage wird strukturiert erfasst und zügig disponiert. So vermeiden wir Rückfragen und können den passenden Fahrer schnell zuweisen.
                </p>
                <Button 
                  className="mt-3 bg-blue-600 hover:bg-blue-700"
                  type="button"
                  onClick={scrollToForm}
                >
                  Jetzt Fahrer buchen
                </Button>
              </div>
            </div>
          </div>

          <Card id="booking-form">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Fahrer buchen
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Beschreiben Sie Ihren Fahrbedarf - wir finden den passenden Fahrer für Sie
              </p>
            </CardHeader>
            <CardContent>
              {/* Billing Model Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Abrechnungsmodell: Agenturabrechnung – Vertragspartner ist Fahrerexpress</h3>
                <p className="text-sm text-blue-700">
                  Die Fahrleistung wird von einem selbstständigen Subunternehmer erbracht, der seine Rechnung an Fahrerexpress stellt. 
                  Dienst-/Werkleistung – keine Arbeitnehmerüberlassung.
                </p>
              </div>

              {/* Pricing Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">💰</span>
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2">Ihr Fahrerpreis</h3>
                    <div className="text-sm space-y-1">
                      <p>– Standard LKW-Fahrer: <strong>399 € netto / Tag (8 Std.)</strong></p>
                      <p>– Spezialfahrer (ADR/Kran): <strong>539 € netto / Tag (8 Std.)</strong></p>
                      <p>– Baumaschinenführer: <strong>489 € netto / Tag (8 Std.)</strong></p>
                    </div>
                    <p className="text-xs text-green-700 mt-2">
                      Alle Preise zzgl. MwSt., Fahrtkosten und evtl. Übernachtung nach Aufwand. 
                      Mit Absenden des Formulars buchen Sie verbindlich zum angegebenen Tagespreis.
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      <strong>Hinweis:</strong> Die Vermittlungsprovision bezieht sich auf das gesamte Nettohonorar 
                      des Einsatzes einschließlich berechtigter Nebenkosten (z. B. Fahrt-/Übernachtung/Mehrstunden).
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Ihre Anfrage</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bitte geben Sie Ihre Kontaktdaten und Details zu Ihrem Fahrbedarf an
                  </p>
                </div>

                {/* Personal Data */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vorname">Vorname *</Label>
                    <Input id="vorname" name="vorname" required />
                  </div>
                  <div>
                    <Label htmlFor="nachname">Nachname *</Label>
                    <Input id="nachname" name="nachname" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">E-Mail-Adresse *</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="telefon">Telefonnummer *</Label>
                    <Input id="telefon" name="telefon" type="tel" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="unternehmen">Unternehmen</Label>
                  <Input id="unternehmen" name="unternehmen" />
                </div>

                {/* Address */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="strasse">Straße *</Label>
                    <Input id="strasse" name="strasse" placeholder="Musterstraße" required />
                  </div>
                  <div>
                    <Label htmlFor="hausnummer">Hausnummer *</Label>
                    <Input id="hausnummer" name="hausnummer" placeholder="123" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="plz">Postleitzahl *</Label>
                    <Input id="plz" name="plz" placeholder="12345" pattern="[0-9]{5}" required />
                  </div>
                  <div>
                    <Label htmlFor="ort">Ort *</Label>
                    <Input id="ort" name="ort" placeholder="Musterstadt" required />
                  </div>
                </div>

                {/* Job Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="einsatzbeginn">Gewünschter Einsatzbeginn</Label>
                    <Input id="einsatzbeginn" name="einsatzbeginn" placeholder="tt.mm.jjjj" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="einsatzdauer">Einsatzdauer</Label>
                    <Input id="einsatzdauer" name="einsatzdauer" placeholder="z.B. 3 Tage, 2 Wochen" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fahrzeugtyp">Benötigter Fahrzeugtyp</Label>
                  <Select name="fahrzeugtyp">
                    <SelectTrigger>
                      <SelectValue placeholder="Bitte wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lkw">LKW (C/CE)</SelectItem>
                      <SelectItem value="fahrmischer">Fahrmischer</SelectItem>
                      <SelectItem value="kran">Kran/Mobilkran</SelectItem>
                      <SelectItem value="baumaschinen">Baumaschinen</SelectItem>
                      <SelectItem value="sattelzug">Sattelzug</SelectItem>
                      <SelectItem value="kleintransporter">Kleintransporter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Special Requirements */}
                <div>
                  <Label className="text-base font-medium">Spezialanforderungen</Label>
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="adr" 
                        checked={adrRequired}
                        onCheckedChange={(checked) => setAdrRequired(checked as boolean)}
                      />
                      <Label htmlFor="adr">ADR-Schein erforderlich</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="kran" 
                        checked={craneRequired}
                        onCheckedChange={(checked) => setCraneRequired(checked as boolean)}
                      />
                      <Label htmlFor="kran">Kran-Erfahrung erforderlich</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="langstrecke" 
                        checked={longDistance}
                        onCheckedChange={(checked) => setLongDistance(checked as boolean)}
                      />
                      <Label htmlFor="langstrecke">Langstreckenfahrten</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="nacht" 
                        checked={nightShift}
                        onCheckedChange={(checked) => setNightShift(checked as boolean)}
                      />
                      <Label htmlFor="nacht">Nachtschicht möglich</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="weekend" 
                        checked={weekendWork}
                        onCheckedChange={(checked) => setWeekendWork(checked as boolean)}
                      />
                      <Label htmlFor="weekend">Wochenendarbeit erforderlich</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="heavylift" 
                        checked={heavyLift}
                        onCheckedChange={(checked) => setHeavyLift(checked as boolean)}
                      />
                      <Label htmlFor="heavylift">Schwerlasttransporte</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="speciallicense" 
                        checked={specialLicense}
                        onCheckedChange={(checked) => setSpecialLicense(checked as boolean)}
                      />
                      <Label htmlFor="speciallicense">Sonderführerschein erforderlich</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="construction" 
                        checked={constructionSite}
                        onCheckedChange={(checked) => setConstructionSite(checked as boolean)}
                      />
                      <Label htmlFor="construction">Baustellen-Erfahrung</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="temperature" 
                        checked={temperatureControlled}
                        onCheckedChange={(checked) => setTemperatureControlled(checked as boolean)}
                      />
                      <Label htmlFor="temperature">Kühltransporte</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="oversize" 
                        checked={oversizeLoad}
                        onCheckedChange={(checked) => setOversizeLoad(checked as boolean)}
                      />
                      <Label htmlFor="oversize">Überbreite/Überlänge</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="forklift" 
                        checked={forklift}
                        onCheckedChange={(checked) => setForklift(checked as boolean)}
                      />
                      <Label htmlFor="forklift">Mitnahmestapler / Gabelstapler</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tanksilo" 
                        checked={tankSilo}
                        onCheckedChange={(checked) => setTankSilo(checked as boolean)}
                      />
                      <Label htmlFor="tanksilo">Tank- oder Silotransporte</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="international" 
                        checked={international}
                        onCheckedChange={(checked) => setInternational(checked as boolean)}
                      />
                      <Label htmlFor="international">Auslandseinsätze möglich</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="languages" 
                        checked={languages}
                        onCheckedChange={(checked) => setLanguages(checked as boolean)}
                      />
                      <Label htmlFor="languages">Sprachkenntnisse (Deutsch, Englisch)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bf3certified" 
                        checked={bf3Certified}
                        onCheckedChange={(checked) => setBf3Certified(checked as boolean)}
                      />
                      <Label htmlFor="bf3certified">Berechtigung für BF3-Schulungen vorhanden</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="escortexperience" 
                        checked={escortExperience}
                        onCheckedChange={(checked) => setEscortExperience(checked as boolean)}
                      />
                      <Label htmlFor="escortexperience">Erfahrung im Schwertransport-Begleitwesen</Label>
                    </div>
                  </div>
                </div>

                {/* Begleitfahrzeuge Requirements */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Car className="w-4 h-4 text-warning" />
                      <ShieldAlert className="w-4 h-4 text-warning" />
                    </div>
                    <Label className="text-base font-medium">Benötigen Sie Fahrer für Begleitfahrzeuge?</Label>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Unsere Fahrer unterstützen Sie bei der Begleitung von Großraum- und Schwertransporten. 
                    Ob BF2 mit Rundumkennleuchte oder BF3/BF4 mit Wechselverkehrszeichenanlage.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="requiresbf2" 
                        checked={requiresBf2}
                        onCheckedChange={(checked) => setRequiresBf2(checked as boolean)}
                      />
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-orange-500" />
                        <Label htmlFor="requiresbf2">Ja, BF2 (Rundumkennleuchte)</Label>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="requiresbf3" 
                        checked={requiresBf3}
                        onCheckedChange={(checked) => setRequiresBf3(checked as boolean)}
                      />
                      <div className="flex items-center gap-2">
                        <Construction className="w-4 h-4 text-orange-600" />
                        <Label htmlFor="requiresbf3">Ja, BF3/BF4 (Wechselverkehrszeichenanlage)</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="beschreibung">Beschreiben Sie Ihren Fahrbedarf *</Label>
                  <Textarea 
                    id="beschreibung" 
                    name="beschreibung"
                    placeholder="z.B. Einsatzort, besondere Anforderungen, weitere Details..."
                    className="min-h-[100px]"
                    required
                  />
                </div>

                {/* Consents */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="prices" 
                      checked={agreedToPrices}
                      onCheckedChange={(checked) => setAgreedToPrices(checked as boolean)}
                      required
                    />
                    <Label htmlFor="prices">Ich habe die Preise gelesen und verstanden. *</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="data" 
                      checked={agreedToData}
                      onCheckedChange={(checked) => setAgreedToData(checked as boolean)}
                      required
                    />
                    <Label htmlFor="data">
                      Ich stimme der Verarbeitung meiner Daten zu. *
                      <a href="/datenschutz" className="text-blue-600 hover:underline ml-1">
                        Datenschutzerklärung
                      </a>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="newsletter" 
                      checked={newsletter}
                      onCheckedChange={(checked) => setNewsletter(checked as boolean)}
                    />
                    <Label htmlFor="newsletter">
                      Ich möchte über neue Fahrer und Angebote per E-Mail informiert werden
                    </Label>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                  disabled={loading || !agreedToPrices || !agreedToData}
                >
                  {loading ? "Wird gesendet..." : (
                    <div className="text-center">
                      <div>Fahrer buchen</div>
                      <div className="text-sm opacity-90">ab 399 € netto</div>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SimpleBookingForm;
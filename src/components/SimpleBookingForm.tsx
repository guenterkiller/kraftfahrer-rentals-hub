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
  const [fahrzeugtyp, setFahrzeugtyp] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submission started');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Debug form data
    console.log('Form data entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    try {
      // Check form validity first
      const form = e.currentTarget;
      if (!form.checkValidity()) {
        console.log('Form is not valid');
        return;
      }

      const payload = {
        vorname: formData.get('vorname') as string,
        nachname: formData.get('nachname') as string,
        email: formData.get('email') as string,
        phone: formData.get('telefon') as string,
        company: formData.get('unternehmen') as string,
        customer_street: formData.get('strasse') as string,
        customer_house_number: formData.get('hausnummer') as string,
        customer_postal_code: formData.get('plz') as string,
        customer_city: formData.get('ort') as string,
        einsatzbeginn: formData.get('einsatzbeginn') as string,
        einsatzdauer: formData.get('einsatzdauer') as string,
        fahrzeugtyp: fahrzeugtyp || 'lkw',
        nachricht: formData.get('beschreibung') as string,
        datenschutz: agreedToData,
        newsletter: false,
        billing_model: 'agency',
        anforderungen: [
          adrRequired && 'ADR-Schein',
          craneRequired && 'Ladekran-Erfahrung',
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
        ].filter(Boolean)
      };

      console.log('Sending payload:', payload);
      console.log('Consent states - prices:', agreedToPrices, 'data:', agreedToData);

      // Track conversion with category
      const isBaumaschinen = fahrzeugtyp === 'Baumaschinenführer';
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', isBaumaschinen ? 'category_submit_baumaschinen' : 'category_submit_lkw', {
          event_category: 'Form Submission',
          event_label: fahrzeugtyp,
          value: isBaumaschinen ? 459 : 349
        });
      }

      const { data, error } = await supabase.functions.invoke('submit-fahrer-anfrage', {
        body: payload
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
      setFahrzeugtyp('');

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
    <section className="py-16 bg-background" id="fahreranfrage">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card id="booking-form">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Unverbindliche Fahreranfrage in 2 Minuten
              </CardTitle>
              <p className="text-center text-muted-foreground mb-4">
                Beschreiben Sie Ihren Fahrbedarf - wir melden uns innerhalb von 6 Stunden mit einer Rückmeldung
              </p>
              
              {/* Quick Benefits */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Unverbindlich</strong> – keine versteckten Kosten</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Schnell</strong> – Antwort in 2-6h</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Transparent</strong> – faire Festpreise</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Billing Model Info */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Abrechnungsmodell: Agenturabrechnung – Vertragspartner ist Fahrerexpress</h3>
                <p className="text-sm text-muted-foreground">
                  Die Fahrleistung wird von einem selbstständigen Subunternehmer erbracht, der seine Rechnung an Fahrerexpress stellt. 
                  Dienst-/Werkleistung – keine Arbeitnehmerüberlassung.
                </p>
              </div>

              {/* Pricing Info - Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-center mb-2 flex items-center justify-center gap-2">
                  <span className="text-2xl">💰</span>
                  Ihre Fahrerpreise
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  Preise verstehen sich <strong>netto je 8-Stunden-Tag</strong> zzgl. MwSt., Fahrt- und ggf. Übernachtungskosten
                </p>
              </div>

              {/* Pricing Cards - 2 separate Karten */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* LKW CE Fahrer Card */}
                <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100 hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-red-900">
                      🚛 LKW CE Fahrer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border-2 border-red-200 shadow-sm">
                      <div className="text-3xl font-bold text-red-700 mb-1">349 €</div>
                      <div className="text-sm text-gray-600">pro 8-Stunden-Tag (netto)</div>
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <div className="text-sm font-medium text-red-600">Überstunden: 30 €/h</div>
                      </div>
                    </div>
                    <ul className="text-xs space-y-1.5 text-gray-700">
                      <li className="flex items-start gap-1.5">
                        <span className="text-red-600 mt-0.5 font-bold">✓</span>
                        <span>Nah-, Fern- und Baustellenverkehr</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-red-600 mt-0.5 font-bold">✓</span>
                        <span>ADR, Fahrmischer, Kranführer</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Baumaschinenführer Card */}
                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-orange-900">
                      🏗️ Baumaschinenführer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border-2 border-orange-200 shadow-sm">
                      <div className="text-3xl font-bold text-orange-700 mb-1">459 €</div>
                      <div className="text-sm text-gray-600">pro 8-Stunden-Tag (netto)</div>
                      <div className="mt-3 pt-3 border-t border-orange-200">
                        <div className="text-sm font-medium text-orange-600">Überstunden: 60 €/h</div>
                      </div>
                    </div>
                    <ul className="text-xs space-y-1.5 text-gray-700">
                      <li className="flex items-start gap-1.5">
                        <span className="text-orange-600 mt-0.5 font-bold">✓</span>
                        <span>Bagger, Radlader, Walzen</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-orange-600 mt-0.5 font-bold">✓</span>
                        <span>Kranführer, Spezialmaschinen</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Details Link */}
              <div className="text-center mb-6">
                <a 
                  href="/preise-und-ablauf" 
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Details: Preise & Konditionen →
                </a>
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
                    <Input 
                      id="einsatzbeginn" 
                      name="einsatzbeginn" 
                      type="date" 
                      min={(() => {
                        const today = new Date();
                        let nextWorkday = new Date(today);
                        nextWorkday.setDate(today.getDate() + 1);
                        
                        // Skip weekend to Monday
                        while (nextWorkday.getDay() === 0 || nextWorkday.getDay() === 6) {
                          nextWorkday.setDate(nextWorkday.getDate() + 1);
                        }
                        
                        return nextWorkday.toISOString().split('T')[0];
                      })()}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Frühester Einsatz: nächster Werktag (24–72 h Vorlauf); kein Same-Day
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="einsatzdauer">Einsatzdauer</Label>
                    <Input id="einsatzdauer" name="einsatzdauer" placeholder="z.B. 3 Tage, 2 Wochen" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fahrzeugtyp">Benötigter Fahrertyp / Qualifikation *</Label>
                  <p className="text-sm opacity-80 mb-2" aria-live="polite">
                    Beispiel: <em>7,5 t</em>, <em>40 t</em>, <em>ADR</em>, <em>Tankwagen</em>, <em>Baumaschinenführer</em>, <em>Ladekran</em>.
                  </p>
                  <Select value={fahrzeugtyp} onValueChange={setFahrzeugtyp} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Fahrertyp wählen: CE-Fahrer oder Baumaschinenführer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ce-fahrer">CE-LKW-Fahrer (349 €)</SelectItem>
                      <SelectItem value="baumaschinenfuehrer">Baumaschinenführer (459 €)</SelectItem>
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
                      <Label htmlFor="kran">Ladekran-Erfahrung erforderlich</Label>
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
                  disabled={loading || !agreedToPrices || !agreedToData || !fahrzeugtyp}
                >
                  {loading ? "Wird gesendet..." : (
                    <div className="text-center">
                      <div>Fahrer buchen</div>
                      <div className="text-sm opacity-90">ab 349 € netto</div>
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
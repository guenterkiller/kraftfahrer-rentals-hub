import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BookingForm = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [allowWhatsApp, setAllowWhatsApp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const vehicleOptions = [
    "Baumaschinenführer (459 €/Tag)",
    "LKW CE Fahrer (349 €/Tag)"
  ];

  const qualificationOptions = [
    "ADR-Schein (Gefahrgut)",
    "Fahrmischer-Erfahrung",
    "Ladekran-Erfahrung",
    "Staplerführerschein",
    "Bagger/Radlader-Erfahrung",
    "BF3-Begleitung"
  ];

  const handleVehicleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setVehicleTypes(prev => [...prev, type]);
    } else {
      setVehicleTypes(prev => prev.filter(t => t !== type));
    }
  };

  const handleQualificationChange = (qual: string, checked: boolean) => {
    if (checked) {
      setQualifications(prev => [...prev, qual]);
    } else {
      setQualifications(prev => prev.filter(q => q !== qual));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Track conversion event
    try {
      // Track with category-specific details
      const isBaumaschine = vehicleTypes.includes('Baumaschinenführer');
      const isLKW = vehicleTypes.includes('LKW CE Fahrer');
      
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'submit_fahrer_buchen', {
          event_category: 'engagement',
          event_label: 'booking_form',
          baumaschine_selected: isBaumaschine,
          lkw_selected: isLKW,
          vehicle_types: vehicleTypes.join(', ')
        });
        
        // Track specific category conversions
        if (isBaumaschine) {
          (window as any).gtag('event', 'category_submit_baumaschine', {
            event_category: 'Form Submission',
            event_label: 'Baumaschinenführer',
            value: 459
          });
        }
        if (isLKW) {
          (window as any).gtag('event', 'category_submit_lkw', {
            event_category: 'Form Submission',
            event_label: 'LKW CE Fahrer',
            value: 349
          });
        }
      }
    } catch (error) {
      console.warn('GA tracking error:', error);
    }

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await supabase.functions.invoke('submit-fahrer-anfrage', {
        body: {
          // Extract vorname/nachname from contact_person
          vorname: (formData.get('contact_person') as string)?.split(' ')[0] || '',
          nachname: (formData.get('contact_person') as string)?.split(' ').slice(1).join(' ') || '',
          email: formData.get('email'),
          phone: formData.get('phone'),
          company: formData.get('company'),
          
          // Customer address (correct format)
          customer_street: formData.get('customer_street'),
          customer_house_number: formData.get('customer_house_number'),
          customer_postal_code: formData.get('customer_postal_code'),
          customer_city: formData.get('customer_city'),
          
          // Job details
          einsatzbeginn: startDate?.toISOString().split('T')[0],
          einsatzdauer: formData.get('duration'),
          fahrzeugtyp: vehicleTypes.join(', '),
          anforderungen: qualifications,
          nachricht: [
            formData.get('description'),
            `Einsatzort: ${formData.get('location')}`,
            formData.get('hourly_rate') ? `Gewünschter Stundensatz: ${formData.get('hourly_rate')}€` : '',
            allowWhatsApp ? 'WhatsApp-Kontakt erwünscht' : ''
          ].filter(Boolean).join('\n'),
          
          // Required consents
          datenschutz: true, // User submits form = consent
          newsletter: false,
          
          // Billing model
          billing_model: formData.get('billing_model') || 'agency'
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Anfrage erfolgreich gesendet!",
        description: "Wir melden uns spätestens bis zum nächsten Werktag bei Ihnen.",
      });

      // Reset form
      e.currentTarget.reset();
      setStartDate(undefined);
      setVehicleTypes([]);
      setQualifications([]);
      setAllowWhatsApp(false);

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

  return (
    <section className="py-16 bg-white" id="fahreranfrage">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Fahrer buchen – Vollständige Anfrage
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Alle erforderlichen Daten für die Fahrerzuweisung und Abrechnung
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6" aria-label="Vollständige Fahreranfrage">
                {/* Company & Contact */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Unternehmen/Firma *</Label>
                    <Input id="company" name="company" required />
                  </div>
                  <div>
                    <Label htmlFor="contact_person">Ansprechpartner *</Label>
                    <Input id="contact_person" name="contact_person" required />
                  </div>
                </div>

                {/* Contact Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">E-Mail *</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon *</Label>
                    <Input id="phone" name="phone" type="tel" required />
                  </div>
                </div>

                {/* Customer Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Firmenanschrift</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="customer_street">Straße *</Label>
                      <Input id="customer_street" name="customer_street" required />
                    </div>
                    <div>
                      <Label htmlFor="customer_house_number">Hausnummer *</Label>
                      <Input id="customer_house_number" name="customer_house_number" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer_postal_code">PLZ *</Label>
                      <Input 
                        id="customer_postal_code" 
                        name="customer_postal_code" 
                        pattern="[0-9]{5}"
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_city">Ort *</Label>
                      <Input id="customer_city" name="customer_city" required />
                    </div>
                  </div>
                </div>

                {/* WhatsApp Option */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="whatsapp" 
                    checked={allowWhatsApp}
                    onCheckedChange={(checked) => setAllowWhatsApp(checked as boolean)}
                  />
                  <Label htmlFor="whatsapp">Kontakt per WhatsApp erlauben</Label>
                </div>

                {/* Start Date */}
                <div>
                  <Label>Frühester Starttermin *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !startDate && "text-muted-foreground"
                        )}
                        aria-label="Startdatum auswählen"
                        aria-describedby="start-date-hint"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                        {startDate ? (
                          <>
                            {format(startDate, "PPP", { locale: de })}
                            <span className="ml-2 text-sm text-muted-foreground">
                              (KW {format(startDate, "I", { locale: de })})
                            </span>
                          </>
                        ) : (
                          <span>Datum auswählen</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        disabled={(date) => {
                          const today = new Date();
                          let nextWorkday = new Date(today);
                          nextWorkday.setDate(today.getDate() + 1);
                          
                          // Skip weekend to Monday
                          while (nextWorkday.getDay() === 0 || nextWorkday.getDay() === 6) {
                            nextWorkday.setDate(nextWorkday.getDate() + 1);
                          }
                          
                          return date < nextWorkday;
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Vehicle Types */}
                <fieldset>
                  <legend className="text-base font-medium">Fahrzeugtyp (Mehrfachauswahl möglich) *</legend>
                  <div className="grid grid-cols-2 gap-2 mt-2" role="group" aria-label="Fahrzeugtyp auswählen">
                    {vehicleOptions.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`vehicle-${type}`}
                          checked={vehicleTypes.includes(type)}
                          onCheckedChange={(checked) => 
                            handleVehicleTypeChange(type, checked as boolean)
                          }
                        />
                        <Label htmlFor={`vehicle-${type}`} className="text-sm">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </fieldset>

                {/* Qualifications */}
                <fieldset>
                  <legend className="text-base font-medium">Erforderliche Qualifikationen</legend>
                  <div className="grid grid-cols-2 gap-2 mt-2" role="group" aria-label="Qualifikationen auswählen">
                    {qualificationOptions.map((qual) => (
                      <div key={qual} className="flex items-center space-x-2">
                        <Checkbox
                          id={`qual-${qual}`}
                          checked={qualifications.includes(qual)}
                          onCheckedChange={(checked) => 
                            handleQualificationChange(qual, checked as boolean)
                          }
                        />
                        <Label htmlFor={`qual-${qual}`} className="text-sm">
                          {qual}
                        </Label>
                      </div>
                    ))}
                  </div>
                </fieldset>

                {/* Duration & Location */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Voraussichtliche Dauer *</Label>
                    <Select name="duration" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-tag">1 Tag</SelectItem>
                        <SelectItem value="2-5-tage">2-5 Tage</SelectItem>
                        <SelectItem value="1-woche">1 Woche</SelectItem>
                        <SelectItem value="2-wochen">2 Wochen</SelectItem>
                        <SelectItem value="1-monat">1 Monat</SelectItem>
                        <SelectItem value="laenger">Länger</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Einsatzort/Region *</Label>
                    <Input id="location" name="location" required />
                  </div>
                </div>

                {/* Hourly Rate */}
                <div>
                  <Label htmlFor="hourly_rate">Gewünschter Stundensatz (optional)</Label>
                  <Input 
                    id="hourly_rate" 
                    name="hourly_rate" 
                    type="number" 
                    placeholder="z.B. 50"
                    min="0"
                  />
                </div>

                {/* Billing Model - hidden field, always 'agency' */}
                <input type="hidden" name="billing_model" value="agency" />

                {/* Description */}
                <div>
                  <Label htmlFor="description">Weitere Details zum Einsatz</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    placeholder="Spezielle Anforderungen, Arbeitszeiten, besondere Hinweise etc."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Legal Notice */}
                <div className="bg-blue-50 p-4 rounded-lg text-sm">
                  <p className="font-medium mb-2">Rechtlicher Hinweis:</p>
                  <p>
                    Die Leistung wird als <strong>Dienst-/Werkleistung</strong> durch 
                    selbstständige Subunternehmer erbracht. <strong>Keine Arbeitnehmerüberlassung.</strong>
                  </p>
                </div>

                {/* Timing Notice */}
                <div className="bg-yellow-50 p-4 rounded-lg text-sm border border-yellow-200">
                  <p className="font-medium mb-2">⏰ Wichtige Timing-Hinweise:</p>
                  <ul className="space-y-1">
                    <li>• <strong>Frühester Einsatz:</strong> nächster Werktag nach schriftlicher Bestätigung (werktags)</li>
                    <li>• <strong>Same-Day nicht möglich</strong> - Planung benötigt 24–72h Vorlauf</li>
                    <li>• <strong>Weite Einsätze (&gt;150 km):</strong> Anreise am Vortag empfohlen; Übernachtung nach Vereinbarung</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading || vehicleTypes.length === 0 || !startDate}
                  aria-label="Jetzt Fahrer anfragen"
                >
                  {loading ? "Wird gesendet..." : "Jetzt Fahrer anfragen"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;
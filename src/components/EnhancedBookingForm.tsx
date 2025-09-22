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

const EnhancedBookingForm = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [allowWhatsApp, setAllowWhatsApp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const vehicleOptions = [
    "LKW (C/CE)",
    "Fahrmischer",
    "Kran/Mobilkran", 
    "Baumaschinen",
    "Sattelzug",
    "Kleintransporter"
  ];

  const qualificationOptions = [
    "ADR-Schein",
    "Kranführerschein",
    "Staplerführerschein",
    "Baumaschinenführerschein",
    "Personenbeförderung",
    "Schwertransport"
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
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'submit_fahrer_buchen', {
          event_category: 'engagement',
          event_label: 'booking_form'
        });
      }
    } catch (error) {
      console.warn('GA tracking error:', error);
    }

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await supabase.functions.invoke('submit-fahrer-anfrage', {
        body: {
          company: formData.get('company'),
          contact_person: formData.get('contact_person'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          start_date: startDate?.toISOString(),
          calendar_week: startDate ? format(startDate, 'I', { locale: de }) : null,
          vehicle_types: vehicleTypes,
          qualifications: qualifications,
          duration: formData.get('duration'),
          location: formData.get('location'),
          description: formData.get('description'),
          allow_whatsapp: allowWhatsApp,
          hourly_rate: formData.get('hourly_rate'),
          status: 'lead' // Initial CRM status
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
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Fahrer buchen – schnelles Formular
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Strukturierte Erfassung für zügige Disposition
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company & Contact */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Unternehmen *</Label>
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
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
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
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Vehicle Types */}
                <div>
                  <Label className="text-base font-medium">Fahrzeugtyp (Mehrfachauswahl möglich) *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
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
                </div>

                {/* Qualifications */}
                <div>
                  <Label className="text-base font-medium">Erforderliche Qualifikationen</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
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
                </div>

                {/* Duration & Location */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Voraussichtliche Dauer</Label>
                    <Select name="duration">
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

                {/* Description */}
                <div>
                  <Label htmlFor="description">Weitere Details zum Einsatz</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    placeholder="Spezielle Anforderungen, Arbeitszeiten, etc."
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

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading || vehicleTypes.length === 0}
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

export default EnhancedBookingForm;
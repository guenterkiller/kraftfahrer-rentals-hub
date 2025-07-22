import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Star, Clock, Euro } from "lucide-react";

interface FahrerProfile {
  id: string;
  vorname: string;
  nachname: string;
  plz: string;
  ort: string;
  fuehrerscheinklassen: string[];
  spezialisierungen: string[];
  verfuegbare_regionen: string[];
  verfuegbarkeit: string;
  stundensatz: number;
  erfahrung_jahre: number;
  beschreibung: string;
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  datenschutz: boolean;
}

const Fahrerboerse = () => {
  const [fahrer, setFahrer] = useState<FahrerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFahrer, setSelectedFahrer] = useState<FahrerProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    datenschutz: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchFahrer();
  }, []);

  const fetchFahrer = async () => {
    try {
      const { data, error } = await supabase
        .from('fahrer_profile')
        .select('*')
        .eq('status', 'active'); // Only show active drivers

      if (error) {
        console.error('Error fetching drivers:', error);
        toast({
          title: "Fehler",
          description: "Fahrer konnten nicht geladen werden.",
          variant: "destructive",
        });
        return;
      }

      setFahrer(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.phone || !contactForm.message || !contactForm.datenschutz) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus und stimmen Sie der Datenschutzerklärung zu.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const fahrerInfo = selectedFahrer 
        ? `Anfrage bezüglich Fahrer: ${selectedFahrer.vorname} ${selectedFahrer.nachname.charAt(0)}., ${selectedFahrer.ort}\n\n`
        : '';

      const response = await fetch('https://hxnabnsoffzevqhruvar.supabase.co/functions/v1/send-fahrer-anfrage-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bmFibnNvZmZ6ZXZxaHJ1dmFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTI1OTMsImV4cCI6MjA2ODQ4ODU5M30.WI-nu1xYjcjz67ijVTyTGC6GPW77TOsFdy1cpPW4dzc`
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          company: contactForm.company,
          message: fahrerInfo + contactForm.message
        })
      });

      if (response.ok) {
        toast({
          title: "Anfrage gesendet!",
          description: "Vielen Dank für Ihre Anfrage. Wir melden uns zeitnah bei Ihnen.",
        });
        setContactForm({
          name: "",
          email: "",
          phone: "",
          company: "",
          message: "",
          datenschutz: false
        });
        setSelectedFahrer(null);
      } else {
        throw new Error("Server error");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Fehler",
        description: "Es gab einen Fehler beim Senden Ihrer Anfrage. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (vorname: string, nachname: string) => {
    return `${vorname} ${nachname.charAt(0)}.`;
  };

  const getLocationDisplay = (plz: string, ort: string) => {
    return `${plz} ${ort}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Fahrer werden geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Fahrerbörse
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Entdecken Sie unsere verfügbaren Berufskraftfahrer und finden Sie den passenden Fahrer für Ihren Bedarf.
            </p>
          </div>

          {fahrer.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                Derzeit sind keine Fahrer verfügbar. Schauen Sie später wieder vorbei!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fahrer.map((driver) => (
                <Card key={driver.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{getInitials(driver.vorname, driver.nachname)}</span>
                      {driver.stundensatz && (
                        <Badge variant="secondary" className="ml-2">
                          <Euro className="w-3 h-3 mr-1" />
                          {driver.stundensatz}€/h
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {getLocationDisplay(driver.plz || "", driver.ort || "")}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Führerscheinklassen */}
                    {driver.fuehrerscheinklassen && driver.fuehrerscheinklassen.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Führerscheinklassen:</p>
                        <div className="flex flex-wrap gap-1">
                          {driver.fuehrerscheinklassen.map((klasse) => (
                            <Badge key={klasse} variant="outline" className="text-xs">
                              {klasse}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Spezialisierungen */}
                    {driver.spezialisierungen && driver.spezialisierungen.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Zusatzqualifikationen:</p>
                        <div className="flex flex-wrap gap-1">
                          {driver.spezialisierungen.map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Verfügbarkeit */}
                    {driver.verfuegbarkeit && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {driver.verfuegbarkeit}
                      </div>
                    )}

                    {/* Erfahrung */}
                    {driver.erfahrung_jahre && (
                      <div className="text-sm text-gray-600">
                        <strong>Erfahrung:</strong> {driver.erfahrung_jahre} Jahre
                      </div>
                    )}

                    {/* Regionen */}
                    {driver.verfuegbare_regionen && driver.verfuegbare_regionen.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Verfügbare Regionen:</p>
                        <p className="text-sm text-gray-600">
                          {driver.verfuegbare_regionen.join(", ")}
                        </p>
                      </div>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full"
                          onClick={() => setSelectedFahrer(driver)}
                        >
                          Jetzt anfragen
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Fahrer buchen</DialogTitle>
                          <DialogDescription>
                            Anfrage für {getInitials(driver.vorname, driver.nachname)} aus {getLocationDisplay(driver.plz || "", driver.ort || "")}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="contact-name">Vor- und Nachname *</Label>
                              <Input
                                id="contact-name"
                                value={contactForm.name}
                                onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="contact-phone">Telefon *</Label>
                              <Input
                                id="contact-phone"
                                type="tel"
                                value={contactForm.phone}
                                onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="contact-email">E-Mail *</Label>
                            <Input
                              id="contact-email"
                              type="email"
                              value={contactForm.email}
                              onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="contact-company">Unternehmen</Label>
                            <Input
                              id="contact-company"
                              value={contactForm.company}
                              onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="contact-message">Ihre Nachricht *</Label>
                            <Textarea
                              id="contact-message"
                              value={contactForm.message}
                              onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                              placeholder="Beschreiben Sie Ihren Fahrbedarf, Einsatzort, Zeitraum..."
                              rows={4}
                              required
                            />
                          </div>

                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="contact-datenschutz"
                              checked={contactForm.datenschutz}
                              onCheckedChange={(checked) => setContactForm({...contactForm, datenschutz: checked as boolean})}
                            />
                            <Label htmlFor="contact-datenschutz" className="text-sm">
                              Ich stimme der Verarbeitung meiner Daten zu. *{" "}
                              <a href="/impressum" target="_blank" className="text-primary hover:underline">
                                Datenschutzerklärung
                              </a>
                            </Label>
                          </div>
                          
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full"
                          >
                            {isSubmitting ? "Wird gesendet..." : "Anfrage senden"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fahrerboerse;
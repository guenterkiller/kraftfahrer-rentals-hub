
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formular wurde abgesendet!');
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const vorname = formData.get('vorname') as string || '';
      const nachname = formData.get('nachname') as string || '';
      const email = formData.get('email') as string || '';
      const telefon = formData.get('telefon') as string || '';
      const unternehmen = formData.get('unternehmen') as string || '';
      const nachricht = formData.get('nachricht') as string || '';

      console.log('Formulardaten:', { vorname, nachname, email, telefon, unternehmen, nachricht });

      // Validierung
      if (!vorname || !nachname || !email || !nachricht) {
        console.log('Validierung fehlgeschlagen - fehlende Felder');
        toast({
          title: "Fehler",
          description: "Bitte füllen Sie alle Pflichtfelder aus.",
          variant: "destructive",
        });
        return;
      }

      // E-Mail über Edge Function senden
      console.log('Sende Anfrage an Edge Function...', { vorname, nachname, email });
      console.log('Supabase client:', supabase);
      
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          vorname,
          nachname,
          email,
          telefon,
          unternehmen,
          nachricht
        }
      });

      console.log('Edge Function Response:', { data, error });

      if (error) {
        console.error('Fehler beim E-Mail-Versand:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        toast({
          title: "Fehler beim Senden",
          description: `Fehler: ${error.message}. Bitte kontaktieren Sie uns direkt: 01577 1442285`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Anfrage gesendet!",
        description: "Vielen Dank! Wir melden uns in Kürze bei Ihnen.",
      });

      // Form zurücksetzen
      (e.target as HTMLFormElement).reset();

    } catch (error: any) {
      console.error("Fehler beim Kontaktformular:", error);
      toast({
        title: "Fehler",
        description: "Bitte kontaktieren Sie uns direkt: 01577 1442285",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Kontakt</h2>
        
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Kontaktinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">Günter Killer</h3>
                <p className="text-muted-foreground">Fahrerexpress-Agentur</p>
                <p className="text-sm text-muted-foreground">
                  Selbstständiger C+E-Fahrer · Fahrmischerfahrer · Mischmeister für Flüssigboden
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Mobil</p>
                  <p className="text-muted-foreground">01577 1442285</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">E-Mail</p>
                  <p className="text-muted-foreground">info@kraftfahrer-mieten.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Adresse</p>
                  <p className="text-muted-foreground">
                    Walther-von-Cronberg-Platz 12<br />
                    60594 Frankfurt<br />
                    Deutschland
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Erreichbarkeit</p>
                  <p className="text-muted-foreground">
                    Mo-Fr: 8:00 - 18:00 Uhr<br />
                    Sa: 9:00 - 14:00 Uhr<br />
                    Notfall: 24/7 verfügbar
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>Website:</strong> www.kraftfahrer-mieten.com<br />
                  <strong>USt-IdNr.:</strong> DE207642217
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Anfrage senden</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input 
                    name="vorname" 
                    placeholder="Vorname" 
                    required 
                    onChange={(e) => console.log('Vorname:', e.target.value)}
                  />
                  <Input 
                    name="nachname" 
                    placeholder="Nachname" 
                    required 
                    onChange={(e) => console.log('Nachname:', e.target.value)}
                  />
                </div>
                
                <Input name="email" placeholder="E-Mail-Adresse" type="email" required />
                <Input name="telefon" placeholder="Telefonnummer" type="tel" />
                <Input name="unternehmen" placeholder="Unternehmen" />
                
                <Textarea 
                  name="nachricht"
                  placeholder="Beschreiben Sie Ihren Fahrbedarf (Fahrzeugtyp, Zeitraum, Einsatzort, etc.)"
                  rows={4}
                  required
                />
                
                <Button 
                  className="w-full" 
                  size="lg" 
                  type="submit"
                  disabled={isSubmitting}
                  onClick={() => console.log('Button geklickt!')}
                >
                  {isSubmitting ? "Wird gesendet..." : "Anfrage senden"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            <Link to="/impressum" className="hover:text-primary transition-colors">
              Impressum
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

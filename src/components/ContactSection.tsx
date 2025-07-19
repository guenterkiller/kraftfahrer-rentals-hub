
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const vorname = formData.get('vorname') as string;
      const nachname = formData.get('nachname') as string;
      const email = formData.get('email') as string;
      const telefon = formData.get('telefon') as string;
      const unternehmen = formData.get('unternehmen') as string;
      const nachricht = formData.get('nachricht') as string;

      if (!vorname || !nachname || !email || !nachricht) {
        setMessage('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
      }

      const response = await fetch('https://hxnabnsoffzevqhruvar.supabase.co/functions/v1/simple-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bmFibnNvZmZ6ZXZxaHJ1dmFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTI1OTMsImV4cCI6MjA2ODQ4ODU5M30.WI-nu1xYjcjz67ijVTyTGC6GPW77TOsFdy1cpPW4dzc`,
        },
        body: JSON.stringify({
          vorname,
          nachname,
          email,
          telefon,
          unternehmen,
          nachricht
        })
      });

      if (response.ok) {
        setMessage('Anfrage erfolgreich gesendet! Wir melden uns in Kürze bei Ihnen.');
        (e.target as HTMLFormElement).reset();
      } else {
        setMessage('Fehler beim Senden. Bitte kontaktieren Sie uns direkt: 01577 1442285');
      }

    } catch (error) {
      setMessage('Fehler beim Senden. Bitte kontaktieren Sie uns direkt: 01577 1442285');
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
              {message && (
                <div className={`mb-4 p-3 rounded ${message.includes('erfolgreich') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {message}
                </div>
              )}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input name="vorname" placeholder="Vorname" required />
                  <Input name="nachname" placeholder="Nachname" required />
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

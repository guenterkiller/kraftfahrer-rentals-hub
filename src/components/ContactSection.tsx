
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const ContactSection = () => {
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      vorname: formData.get('vorname'),
      nachname: formData.get('nachname'),
      email: formData.get('email'),
      telefon: formData.get('telefon'),
      unternehmen: formData.get('unternehmen'),
      nachricht: formData.get('nachricht')
    };

    try {
      // Formspree endpoint - kostenloser Service für Formulare
      const response = await fetch('https://formspree.io/f/mnnqvqpn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Anfrage erfolgreich gesendet!",
          description: "Vielen Dank für Ihre Anfrage! Wir werden uns zeitnah bei Ihnen melden.",
        });
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error('Fehler beim Senden');
      }
    } catch (error) {
      toast({
        title: "Fehler beim Senden",
        description: "Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt per Telefon.",
        variant: "destructive",
      });
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
                
                <Button className="w-full" size="lg" type="submit">
                  Anfrage senden
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

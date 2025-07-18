import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Anfrage gesendet",
      description: "Vielen Dank für Ihre Anfrage! Wir werden uns zeitnah bei Ihnen melden.",
    });
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
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Telefon</p>
                  <p className="text-muted-foreground">+49 (0) 123 456 789</p>
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
                    Musterstraße 123<br />
                    12345 Musterstadt<br />
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
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Anfrage senden</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input placeholder="Vorname" />
                  <Input placeholder="Nachname" />
                </div>
                
                <Input placeholder="E-Mail-Adresse" type="email" />
                <Input placeholder="Telefonnummer" type="tel" />
                <Input placeholder="Unternehmen" />
                
                <Textarea 
                  placeholder="Beschreiben Sie Ihren Fahrbedarf (Fahrzeugtyp, Zeitraum, Einsatzort, etc.)"
                  rows={4}
                />
                
                <Button className="w-full" size="lg" type="submit">
                  Anfrage senden
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const ContactSection = () => {

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
              <CardTitle>Fahrer buchen</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Nutzen Sie unser zentrales Buchungsformular, um den passenden Fahrer für Ihren Bedarf zu finden.
              </p>
              <Button 
                size="lg" 
                asChild
                className="w-full"
              >
                <a 
                  href="#fahreranfrage"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.querySelector('#fahreranfrage');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  Fahrer buchen
                </a>
              </Button>
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

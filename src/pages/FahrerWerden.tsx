import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, CheckCircle, Phone, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

const FahrerWerden = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      
      {/* Sticky CTA Button - Mobile */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg px-8 py-3" asChild>
          <Link to="/fahrer-registrierung">
            🚀 Fahrer werden – Jetzt registrieren
          </Link>
        </Button>
      </div>

      {/* Sticky CTA Button - Desktop */}
      <div className="fixed top-20 right-6 z-50 hidden md:block">
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg px-6 py-3" asChild>
          <Link to="/fahrer-registrierung">
            🚀 Fahrer werden – Jetzt registrieren
          </Link>
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
              Jetzt als selbstständiger Fahrer registrieren 🚛
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Du bist LKW-Fahrer, Fahrmischerfahrer oder Baumaschinenführer mit Gewerbe?<br />
              Dann melde dich jetzt bei der Fahrerexpress-Agentur an – kostenlos & unverbindlich!
            </p>
          </div>

          {/* Benefits Card */}
          <Card className="mb-8 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                🔧 Was du bekommst:
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <span className="text-lg">Vermittlung an Bauunternehmen, Speditionen und Events</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <span className="text-lg">Flexible Einsätze deutschlandweit</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <span className="text-lg">Keine Zeitarbeit – reine Direktvermittlung</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guarantee Section */}
          <Card className="mb-12 bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Clock className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-bold text-primary">
                  📬 Antwort innerhalb von 24 Stunden garantiert!
                </h3>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center">
            <Button 
              size="lg" 
              className="text-xl px-12 py-6 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              asChild
            >
              <Link to="/fahrer-registrierung">
                Jetzt registrieren → Führt direkt zum Formular
              </Link>
            </Button>
          </div>

          {/* Contact Info */}
          <div className="text-center mt-12 text-muted-foreground">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Phone className="h-5 w-5" />
              <span>Fragen? Kontaktiere uns direkt!</span>
            </div>
            <p className="font-medium">Fahrerexpress-Agentur – Günter Killer</p>
            <p>www.kraftfahrer-mieten.com</p>
          </div>
        </div>
      </div>

      {/* Bottom padding for mobile sticky button */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default FahrerWerden;
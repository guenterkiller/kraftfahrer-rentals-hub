import { useSEO } from "@/hooks/useSEO";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, MapPin, Users, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { TruckerChat } from "@/components/TruckerChat";

const TruckerLadies = () => {
  useSEO({
    title: "Trucker Ladies – Chat & Community für alle Fahrer | Fahrerexpress",
    description: "Vernetze dich mit Fahrern und Fahrerinnen, tausche dich aus, finde Kontakte auf deiner Route – kostenlos und respektvoll.",
    keywords: "trucker community, fahrer chat, lkw fahrer community, trucker ladies, fahrer austausch"
  });

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-muted pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
                Trucker Ladies – Chat & Community für alle Fahrer
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Vernetze dich mit Fahrern und Fahrerinnen, tausche dich aus, finde Kontakte auf deiner Route – kostenlos und respektvoll.
              </p>
            </div>

            {/* 4 Kacheln */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Live-Chat für unterwegs</h3>
                      <p className="text-muted-foreground">
                        Offener Chat für alle Fahrer – hier wird geredet, gelacht und geholfen.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <MapPin className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Wer ist gerade wo?</h3>
                      <p className="text-muted-foreground">
                        Finde Fahrerinnen und Fahrer in deiner Nähe – Autohof, Rastplatz, Strecke.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Kontakte & Bekanntschaften</h3>
                      <p className="text-muted-foreground">
                        Neue Leute kennenlernen – freundschaftlich, locker, ohne Druck.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <MessageCircle className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Trucker-Talk & Community</h3>
                      <p className="text-muted-foreground">
                        Themen, die nur Fahrer verstehen. Von Alltag bis Spaß.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <div className="bg-primary/5 rounded-lg p-8 text-center mb-12">
              <h2 className="text-2xl font-bold mb-4">Jetzt Teil der Community werden</h2>
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
                <Link to="/fahrer-registrierung">
                  Jetzt kostenlos registrieren
                </Link>
              </Button>
            </div>

            {/* Live Chat */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-center mb-6">Live-Chat</h2>
              <TruckerChat />
            </div>

            {/* Hinweis */}
            <div className="text-center text-sm text-muted-foreground max-w-3xl mx-auto">
              <p>
                Trucker Ladies ist ein Community-Chat der Fahrerexpress-Agentur für Fahrerinnen und Fahrer. 
                Er ergänzt unsere Fahrerservices und bietet Austausch und Kontakte unterwegs.
              </p>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TruckerLadies;

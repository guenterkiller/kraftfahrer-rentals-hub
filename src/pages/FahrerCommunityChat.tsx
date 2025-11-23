import { useSEO } from "@/hooks/useSEO";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, MapPin, Users, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { TruckerChat } from "@/components/TruckerChat";
import { FEATURE_FLAGS } from "@/utils/featureFlags";

const FahrerCommunityChat = () => {
  useSEO({
    title: "Fahrer-Community-Chat | Austausch für LKW-Fahrer – Trucker-Ladies by Fahrerexpress",
    description: "Der Fahrer-Community-Chat für LKW-Fahrer: Echtzeit-Chat, Fahrer in der Nähe, Rastplatz-Kontakte, Austausch unter Kollegen. Kostenlos, ohne Dating-Funktion, sicher & anonym.",
    keywords: "trucker community, fahrer chat, lkw fahrer community, fahrer austausch, berufskraftfahrer chat"
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
                Fahrer-Community-Livechat
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Fahrer-Community-Chat – Echtzeit-Austausch für LKW-Fahrer unterwegs
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
                        Offener Community-Chat für Fahrer – hier wird geredet, gelacht und geholfen.
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
                      <h3 className="text-xl font-bold mb-2">Tipps & Hilfe</h3>
                      <p className="text-muted-foreground">
                        Sofortige Antworten von Fahrerkollegen – Fragen stellen, Erfahrungen teilen, Probleme lösen.
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
            {FEATURE_FLAGS.TRUCKER_CHAT_ENABLED && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-center mb-6">Live-Chat</h2>
                <p className="text-sm opacity-60 text-center mb-4 max-w-2xl mx-auto">
                  Hinweis: Dies ist kein Dating-Service. Der Community-Chat dient ausschließlich dem Austausch unter Fahrerinnen und Fahrern.
                </p>
                <TruckerChat />
              </div>
            )}

            {/* FAQ Section */}
            <div className="bg-card rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-center">FAQ – Häufige Fragen zum Fahrer-Community-Chat</h2>
              
              <div className="space-y-6 max-w-3xl mx-auto">
                <div>
                  <h3 className="font-bold text-lg mb-2">Was ist der Fahrer-Community-Chat?</h3>
                  <p className="text-muted-foreground">
                    Ein offener Austauschbereich für LKW-Fahrerinnen und -Fahrer. Hier kann man sich unterwegs, in der Pause oder abends locker unterhalten, Fragen stellen und Tipps teilen.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">Wer kann im Chat schreiben?</h3>
                  <p className="text-muted-foreground">
                    Schreiben können nur registrierte Fahrer mit Login.<br />
                    Lesen darf jeder — der Chat bleibt öffentlich einsehbar.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">Wird mein Standort genau angezeigt?</h3>
                  <p className="text-muted-foreground">
                    Nein.<br />
                    Es werden nur ungefähre Standort-Cluster angezeigt (Radius ca. 300–600 m).<br />
                    Keine exakten GPS-Daten, keine Adressen.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">Ist das ein Support- oder Buchungschat?</h3>
                  <p className="text-muted-foreground">
                    Nein.<br />
                    Der Chat dient nur dem Austausch unter Fahrern.<br />
                    Kundenanfragen und Buchungen laufen weiterhin ausschließlich über das Kontaktformular oder Telefon.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">Sind private Daten sichtbar?</h3>
                  <p className="text-muted-foreground">
                    Nur Vorname + Initial (z. B. „Matthias K.").<br />
                    Keine privaten Daten, keine komplette Adresse, keine Telefone.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">Was passiert bei Beleidigungen oder Spam?</h3>
                  <p className="text-muted-foreground">
                    Nutzer können:<br />
                    • Beiträge melden<br />
                    • Teilnehmer stummschalten<br />
                    <br />
                    Admins können Nachrichten löschen oder Nutzer sperren.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">Warum gibt es diesen Chat?</h3>
                  <p className="text-muted-foreground">
                    Viele Fahrer sind den ganzen Tag allein unterwegs.<br />
                    Mit dem Community-Chat entsteht ein Ort für Austausch, Vernetzung und ein bisschen Gesellschaft auf der Straße — ganz ohne Druck.
                  </p>
                </div>
              </div>
            </div>

            {/* Hinweis */}
            <div className="text-center text-sm text-muted-foreground max-w-3xl mx-auto">
              <p>
                Der Fahrer-Community-Chat ist ein ergänzendes Community-Angebot der Fahrerexpress-Agentur und dient ausschließlich dem Austausch unter Fahrerinnen und Fahrern.
              </p>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FahrerCommunityChat;

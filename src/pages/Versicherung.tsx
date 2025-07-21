import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Shield, Heart, Calculator, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const Versicherung = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Header */}
          <div className="text-center mb-16">
            <div className="mb-6">
              <Shield className="h-16 w-16 mx-auto text-blue-600 mb-4" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              🛡️ Absichern statt abrutschen
            </h1>
            <h2 className="text-2xl md:text-3xl text-primary mb-6">
              Versicherungen für selbstständige Fahrer
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Viele selbstständige LKW-Fahrer schuften ihr Leben lang – aber am Ende reicht es nicht einmal für die Miete. 
              <strong className="text-destructive"> Keine Rente, keine Rücklagen, keine Sicherheit.</strong> Über 60 % aller Selbstständigen landen im Alter in der Grundsicherung.
            </p>
            <div className="mt-8 p-6 bg-destructive/10 border border-destructive/20 rounded-lg max-w-2xl mx-auto">
              <p className="text-lg font-semibold text-destructive">
                ⚠️ Wer jetzt nicht vorsorgt, wird später verlieren.
              </p>
            </div>
          </div>

          {/* Risiken ohne Absicherung */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Was dir ohne Absicherung passieren kann</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Kein Einkommen bei Krankheit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ohne Krankentagegeld stehst du bei längerer Krankheit ohne Einkommen da. 
                    Schon nach 6 Wochen wird es kritisch.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Kein Schutz bei Berufsunfähigkeit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Rückenprobleme, Herzinfarkt oder Unfall – ohne Berufsunfähigkeitsversicherung 
                    bedeutet das oft das Aus für deine Existenz.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Altersarmut garantiert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ohne private Altersvorsorge landest du im Alter bei der Grundsicherung – 
                    aktuell 502 € im Monat. Davon kannst du nicht leben.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator className="my-16" />

          {/* Schutz durch richtige Versicherungen */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-green-600">
              ✅ So schützt du dich jetzt
            </h2>
            <p className="text-center text-lg mb-8 text-muted-foreground">
              Ich arbeite mit seriösen Partnern, die faire Tarife für Selbstständige anbieten
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Heart className="h-5 w-5" />
                    Berufsunfähigkeitsversicherung
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    <strong>Dein wichtigster Schutz:</strong> Bei Berufsunfähigkeit erhältst du eine monatliche Rente.
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      💡 <strong>Beispiel:</strong> 2.000 € monatliche Rente für nur 80-120 € Beitrag
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Calculator className="h-5 w-5" />
                    Krankentagegeld
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    <strong>Einkommen bei Krankheit:</strong> Ab dem ersten Krankheitstag abgesichert.
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      💡 <strong>Beispiel:</strong> 100 € täglich für nur 35-50 € Beitrag
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="h-5 w-5" />
                    Altersvorsorge (Rürup/Privat)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    <strong>Rente die reicht:</strong> Rürup-Rente mit Steuervorteilen oder flexible private Vorsorge.
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      💡 <strong>Steuer sparen:</strong> Bis zu 27.565 € absetzbar (2024)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Shield className="h-5 w-5" />
                    Haftpflicht & Unfallschutz
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    <strong>Rundumschutz:</strong> Private Haftpflicht, Berufshaftpflicht und Unfallversicherung.
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      💡 <strong>Komplett-Paket:</strong> Oft schon ab 25 € monatlich
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator className="my-16" />

          {/* Warum Fahrerexpress */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Warum über Fahrerexpress absichern?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Branchenkenntnis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ich kenne die Risiken von Fahrern und empfehle nur seriöse Partner mit fairen Tarifen 
                    für Selbstständige.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Transparenz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Keine versteckten Kosten, faire Beratung. Du bekommst ehrliche Empfehlungen 
                    statt Verkaufsgeschwätz.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-purple-600" />
                    Kostenlos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Die Beratung und Vermittlung kosten dich nichts. Die Anbieter zahlen mir eine 
                    Provision – ohne Mehrkosten für dich.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="max-w-3xl mx-auto bg-gradient-to-r from-blue-50 to-green-50 border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl">
                  👉 Jetzt absichern und in Ruhe alt werden
                </CardTitle>
                <CardDescription className="text-lg">
                  Kostenloser Versicherungsvergleich für selbstständige Fahrer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  <strong>Keine Zeit verlieren:</strong> Je älter du wirst, desto teurer werden die Beiträge. 
                  Sichere dir jetzt noch günstige Konditionen.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="text-lg px-8 py-6" disabled>
                    🛡️ Jetzt Versicherungs-Vergleich starten
                    <span className="text-xs block mt-1">(Verfügbar nach Partner-Freigabe)</span>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href="tel:0157714422885">📞 Persönliche Beratung</a>
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground bg-white/50 p-4 rounded-lg max-w-2xl mx-auto">
                  <p className="font-medium text-center">
                    💼 <strong>Rechtlicher Hinweis:</strong>
                  </p>
                  <p className="mt-2">
                    Wir erhalten ggf. eine Provision, wenn Sie über diesen Link einen Vertrag abschließen. 
                    Für Sie entstehen dadurch keine Mehrkosten. Die Beratung erfolgt unabhängig und produktneutral.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Versicherung;
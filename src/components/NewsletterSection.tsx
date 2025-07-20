import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Briefcase, Download } from "lucide-react";

const NewsletterSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;

    if (!email) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie Ihre E-Mail-Adresse ein.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Hier würde normalerweise eine API-Anfrage stattfinden
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simuliert API-Aufruf
      
      toast({
        title: "Erfolgreich angemeldet!",
        description: "Sie erhalten nun regelmäßig Informationen über verfügbare Fahrer-Einsätze.",
      });
      
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Es gab einen Fehler bei der Anmeldung. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
    // Simuliert einen Download-Link
    toast({
      title: "Download gestartet",
      description: "Die Checkliste wird heruntergeladen.",
    });
  };

  return (
    <section className="py-16 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Bleiben Sie informiert
          </h2>
          <p className="text-lg text-muted-foreground">
            Erhalten Sie aktuelle Informationen und wertvolle Ressourcen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Jobalarm für Fahrer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Jobalarm für Fahrer
              </CardTitle>
              <CardDescription>
                Erhalten Sie freie Einsätze direkt per E-Mail
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="newsletter-email">E-Mail-Adresse</Label>
                  <Input
                    type="email"
                    id="newsletter-email"
                    name="email"
                    placeholder="ihre.email@beispiel.de"
                    required
                    className="mt-1"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Wird angemeldet..." : "Jetzt anmelden"}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-3">
                * Sie können sich jederzeit wieder abmelden. Keine Spam-Mails.
              </p>
            </CardContent>
          </Card>

          {/* Download-Angebot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Kostenlose Checkliste
              </CardTitle>
              <CardDescription>
                "Was kostet ein selbstständiger Fahrer wirklich?"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <ul className="space-y-1">
                    <li>✓ Stundensatz-Kalkulation</li>
                    <li>✓ Rechtliche Hinweise</li>
                    <li>✓ Versicherungsaspekte</li>
                    <li>✓ Steuerliche Überlegungen</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={handleDownload}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Jetzt kostenlos herunterladen
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                * PDF-Download ohne E-Mail-Angabe möglich
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Newsletter für Auftraggeber */}
        <Card className="mt-8">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Newsletter für Auftraggeber
            </CardTitle>
            <CardDescription>
              Erhalten Sie Tipps zur Fahrersuche und Informationen über neue Services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <Input
                  type="email"
                  name="email"
                  placeholder="Ihre E-Mail-Adresse"
                  required
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  Anmelden
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default NewsletterSection;
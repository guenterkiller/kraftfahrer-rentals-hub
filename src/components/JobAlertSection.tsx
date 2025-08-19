import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const JobAlertSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleJobAlertSubmit = async (e: React.FormEvent) => {
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
      // Save to Supabase jobalarm_fahrer table
      const { error } = await supabase
        .from('jobalarm_fahrer' as any)
        .insert([{ email }]);

      if (error) {
        console.error('Error saving job alert:', error);
        toast({
          title: "Fehler",
          description: "Es gab einen Fehler bei der Anmeldung. Bitte versuchen Sie es später erneut.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Erfolgreich angemeldet!",
        description: "Sie erhalten nun regelmäßig Informationen über verfügbare Fahrer-Einsätze.",
      });
      
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Fehler",
        description: "Es gab einen Fehler bei der Anmeldung. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 px-4 bg-muted/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Jobalarm für Fahrer
          </h2>
          <p className="text-lg text-muted-foreground">
            Erhalten Sie freie Einsätze direkt per E-Mail
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
                Job-Benachrichtigungen
              </CardTitle>
              <CardDescription className="text-center">
                Verpassen Sie keine neuen Fahreraufträge mehr
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJobAlertSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="jobalert-email">E-Mail-Adresse</Label>
                  <Input
                    type="email"
                    id="jobalert-email"
                    name="email"
                    autoComplete="email"
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
              <p className="text-xs text-muted-foreground mt-3 text-center">
                * Sie können sich jederzeit wieder abmelden. Keine Spam-Mails.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default JobAlertSection;
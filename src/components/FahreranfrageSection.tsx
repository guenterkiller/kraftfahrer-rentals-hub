import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const FahreranfrageSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      vorname: formData.get("vorname") as string,
      nachname: formData.get("nachname") as string,
      email: formData.get("email") as string,
      telefon: formData.get("telefon") as string,
      unternehmen: formData.get("unternehmen") as string,
      nachricht: formData.get("nachricht") as string,
      datenschutz: formData.get("datenschutz") === "on",
    };

    // Validation
    if (!data.vorname || !data.nachname || !data.email || !data.telefon || !data.nachricht || !data.datenschutz) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus und stimmen Sie der Datenschutzerklärung zu.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: result, error } = await supabase.functions.invoke("send-fahreranfrage", {
        body: data,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Anfrage gesendet!",
        description: "Vielen Dank für Ihre Anfrage. Wir melden uns zeitnah bei Ihnen.",
      });

      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error("Error submitting fahreranfrage:", error);
      toast({
        title: "Fehler",
        description: "Es gab einen Fehler beim Senden Ihrer Anfrage. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Fahrer anfragen
          </h2>
          <p className="text-lg text-gray-600">
            Beschreiben Sie Ihren Fahrbedarf - wir finden den passenden Fahrer für Sie
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Ihre Anfrage</CardTitle>
            <CardDescription>
              Bitte geben Sie Ihre Kontaktdaten und Details zu Ihrem Fahrbedarf an
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vorname">Vorname *</Label>
                  <Input
                    type="text"
                    id="vorname"
                    name="vorname"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="nachname">Nachname *</Label>
                  <Input
                    type="text"
                    id="nachname"
                    name="nachname"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">E-Mail-Adresse *</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="telefon">Telefonnummer *</Label>
                <Input
                  type="text"
                  id="telefon"
                  name="telefon"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="unternehmen">Unternehmen</Label>
                <Input
                  type="text"
                  id="unternehmen"
                  name="unternehmen"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="nachricht">Beschreiben Sie Ihren Fahrbedarf *</Label>
                <Textarea
                  id="nachricht"
                  name="nachricht"
                  rows={6}
                  required
                  placeholder="z.B. Fahrzeugart, Einsatzdauer, Einsatzort, besondere Anforderungen..."
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="datenschutz"
                  name="datenschutz"
                  required
                />
                <Label htmlFor="datenschutz" className="text-sm">
                  Ich stimme der Verarbeitung meiner Daten zu. *{" "}
                  <a 
                    href="/impressum" 
                    target="_blank" 
                    className="text-primary hover:underline"
                  >
                    Datenschutzerklärung
                  </a>
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Wird gesendet..." : "Anfrage senden"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FahreranfrageSection;
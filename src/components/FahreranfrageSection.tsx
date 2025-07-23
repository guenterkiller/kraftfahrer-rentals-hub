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
    
    // Client-side validation
    const vorname = formData.get("vorname") as string;
    const nachname = formData.get("nachname") as string;
    const email = formData.get("email") as string;
    const telefon = formData.get("telefon") as string;
    const nachricht = formData.get("nachricht") as string;
    const datenschutz = formData.get("datenschutz") === "on";

    if (!vorname || !nachname || !email || !telefon || !nachricht || !datenschutz) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus und stimmen Sie der Datenschutzerklärung zu.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Collect all form data
      const einsatzbeginn = formData.get("einsatzbeginn") as string;
      const einsatzdauer = formData.get("einsatzdauer") as string;
      const fahrzeugtyp = formData.get("fahrzeugtyp") as string;
      
      // Collect special requirements as array
      const anforderungen = Array.from(formData.getAll("anforderungen"));
      const besonderheiten = anforderungen.length > 0 ? anforderungen.join(", ") : "";
      
      // Convert einsatzbeginn to proper ISO format if provided
      let zeitraumFormatted = "Nach Absprache";
      if (einsatzbeginn) {
        try {
          // Create ISO date string for the beginning of the day
          const date = new Date(einsatzbeginn + "T08:00:00");
          const isoDateString = date.toISOString();
          
          zeitraumFormatted = einsatzdauer 
            ? `Ab ${new Date(isoDateString).toLocaleDateString('de-DE')} für ${einsatzdauer}`
            : `Ab ${new Date(isoDateString).toLocaleDateString('de-DE')}`;
        } catch (dateError) {
          console.error("Date conversion error:", dateError);
          zeitraumFormatted = einsatzbeginn + (einsatzdauer ? ` für ${einsatzdauer}` : "");
        }
      } else if (einsatzdauer) {
        zeitraumFormatted = `Dauer: ${einsatzdauer}`;
      }

      // Extract location from message or use a default
      const einsatzort = nachricht.includes("Einsatzort") 
        ? nachricht.split("Einsatzort")[1]?.split(/[,\n]/)[0]?.trim() || "Siehe Nachricht"
        : "Siehe Nachricht";

      // Prepare data for database insert with proper validation
      const jobRequestData = {
        customer_name: `${vorname} ${nachname}`.trim(),
        customer_email: email.trim(),
        customer_phone: telefon.trim(),
        company: (formData.get('unternehmen') as string)?.trim() || null,
        einsatzort: einsatzort.trim(),
        zeitraum: zeitraumFormatted,
        fahrzeugtyp: fahrzeugtyp || "Nicht angegeben",
        fuehrerscheinklasse: "C+E", // Default, could be made dynamic
        besonderheiten: besonderheiten || null,
        nachricht: nachricht.trim(),
        status: 'open'
      };

      // Save job request to database
      const { data: jobRequest, error: jobError } = await supabase
        .from('job_requests')
        .insert([jobRequestData])
        .select()
        .single();

      if (jobError) {
        console.error("Error saving job request:", jobError);
        throw new Error("Failed to save job request");
      }

      console.log("Job request saved:", jobRequest);

      // Send job alert emails to all drivers (only if job was saved successfully)
      if (jobRequest && jobRequest.id) {
        const alertResponse = await supabase.functions.invoke('send-job-alert-emails', {
          body: {
            job_id: jobRequest.id,
            einsatzort: jobRequestData.einsatzort,
            zeitraum: jobRequestData.zeitraum,
            fahrzeugtyp: jobRequestData.fahrzeugtyp,
            fuehrerscheinklasse: jobRequestData.fuehrerscheinklasse,
            besonderheiten: jobRequestData.besonderheiten,
            customer_name: jobRequestData.customer_name,
            customer_email: jobRequestData.customer_email
          }
        });

        if (alertResponse.error) {
          console.error("Error sending job alert emails:", alertResponse.error);
          // Don't fail the whole request if emails fail
        }
      }

      // Also send the original customer notification email with correct data structure
      const customerResponse = await supabase.functions.invoke('send-fahrer-anfrage-email', {
        body: {
          vorname: vorname.trim(),
          nachname: nachname.trim(),
          email: email.trim(),
          phone: telefon.trim(),
          company: (formData.get('unternehmen') as string)?.trim() || '',
          message: nachricht.trim(),
          // Add fields that the function expects for job requests
          einsatzbeginn: einsatzbeginn || '',
          einsatzdauer: einsatzdauer || '',
          fahrzeugtyp: fahrzeugtyp || '',
          spezialanforderungen: anforderungen,
          datenschutz: datenschutz,
          newsletter: formData.get("newsletter") === "on"
        }
      });

      if (customerResponse.error) {
        console.error("Error sending customer email:", customerResponse.error);
      }

      toast({
        title: "Anfrage gesendet!",
        description: "Vielen Dank für Ihre Anfrage. Alle verfügbaren Fahrer wurden benachrichtigt. Wir melden uns zeitnah bei Ihnen.",
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
            Fahrer buchen
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="einsatzbeginn">Gewünschter Einsatzbeginn</Label>
                  <Input
                    type="date"
                    id="einsatzbeginn"
                    name="einsatzbeginn"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="einsatzdauer">Einsatzdauer</Label>
                  <Input
                    type="text"
                    id="einsatzdauer"
                    name="einsatzdauer"
                    placeholder="z.B. 3 Tage, 2 Wochen"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fahrzeugtyp">Benötigter Fahrzeugtyp</Label>
                <select 
                  id="fahrzeugtyp"
                  name="fahrzeugtyp"
                  className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="">Bitte wählen</option>
                  <option value="lkw-ce">LKW C+E</option>
                  <option value="fahrmischer">Fahrmischer</option>
                  <option value="sattelzug">Sattelzug</option>
                  <option value="kipper">Kipper</option>
                  <option value="pritsche">Pritschenwagen</option>
                  <option value="sonstige">Sonstige</option>
                </select>
              </div>

              <div>
                <Label>Spezialanforderungen</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="adr" name="anforderungen" value="adr" />
                    <Label htmlFor="adr" className="text-sm">ADR-Schein erforderlich</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="kran" name="anforderungen" value="kran" />
                    <Label htmlFor="kran" className="text-sm">Kran-Erfahrung erforderlich</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="langstrecke" name="anforderungen" value="langstrecke" />
                    <Label htmlFor="langstrecke" className="text-sm">Langstreckenfahrten</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="nachtschicht" name="anforderungen" value="nachtschicht" />
                    <Label htmlFor="nachtschicht" className="text-sm">Nachtschicht möglich</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="nachricht">Beschreiben Sie Ihren Fahrbedarf *</Label>
                <Textarea
                  id="nachricht"
                  name="nachricht"
                  rows={6}
                  required
                  placeholder="z.B. Einsatzort, besondere Anforderungen, weitere Details..."
                  className="mt-1"
                />
              </div>


              <div className="space-y-3">
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
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newsletter"
                    name="newsletter"
                  />
                  <Label htmlFor="newsletter" className="text-sm">
                    Ich möchte über neue Fahrer und Angebote per E-Mail informiert werden
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Wird gesendet..." : "Fahrer buchen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FahreranfrageSection;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Info } from "lucide-react";
import BookingPriorityBanner from "@/components/BookingPriorityBanner";
import BookingAdvantagesInfo from "@/components/BookingAdvantagesInfo";
import BookingFAQ from "@/components/BookingFAQ";
const FahreranfrageSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [priceAcknowledged, setPriceAcknowledged] = useState(false);
  const [priceAckTime, setPriceAckTime] = useState<string | null>(null);
  const [pricePlan, setPricePlan] = useState<string>("Standard LKW-Fahrer");

  const derivePlan = () => {
    const adr = (document.getElementById('adr') as HTMLInputElement | null)?.checked;
    const kran = (document.getElementById('kran') as HTMLInputElement | null)?.checked;
    const fahrzeugtyp = (document.getElementById('fahrzeugtyp') as HTMLSelectElement | null)?.value || '';
    const msg = ((document.getElementById('nachricht') as HTMLTextAreaElement | null)?.value || '').toLowerCase();
    if (adr || kran) return "Spezialfahrer (ADR/Kran)";
    if (msg.includes('baumaschin')) return "Baumaschinenführer";
    return "Standard LKW-Fahrer";
  };

  const sendGAEvent = (plan: string, tsIso: string) => {
    try {
      // gtag is loaded in index.html, but guard just in case
      const gtag = (window as any).gtag;
      if (typeof gtag === 'function') {
        gtag('event', 'price_acknowledged', {
          plan,
          timestamp: tsIso,
        });
      } else {
        // no-op if GA is blocked
        console.warn('gtag not available; price_acknowledged not sent');
      }
    } catch (e) {
      console.error('GA event error', e);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    
    // Client-side validation
    const vorname = formData.get("vorname") as string;
    const nachname = formData.get("nachname") as string;
    const email = formData.get("email") as string;
    const telefon = formData.get("phone") as string;
    const customerStreet = formData.get("customer_street") as string;
    const customerHouseNumber = formData.get("customer_house_number") as string;
    const customerPostalCode = formData.get("customer_postal_code") as string;
    const customerCity = formData.get("customer_city") as string;
    const nachricht = formData.get("nachricht") as string;
    const datenschutz = formData.get("datenschutz") === "on";
    const preiseOk = formData.get("preise_ok") === "on";

    if (!vorname || !nachname || !email || !telefon || !customerStreet || !customerHouseNumber || !customerPostalCode || !customerCity || !nachricht || !datenschutz || !preiseOk) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus und bestätigen Sie die Preise sowie die Datenschutzerklärung.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // PLZ validation
    if (!/^\d{5}$/.test(customerPostalCode)) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine gültige 5-stellige Postleitzahl ein.",
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

      // Prepare data for Edge Function
      const requestData = {
        vorname: vorname.trim(),
        nachname: nachname.trim(),
        email: email.trim(),
        phone: telefon.trim(),
        company: (formData.get('unternehmen') as string)?.trim() || '',
        customer_street: customerStreet.trim(),
        customer_house_number: customerHouseNumber.trim(),
        customer_postal_code: customerPostalCode.trim(),
        customer_city: customerCity.trim(),
        einsatzbeginn: einsatzbeginn || '',
        einsatzdauer: einsatzdauer || '',
        fahrzeugtyp: fahrzeugtyp || '',
        anforderungen: anforderungen,
        nachricht: nachricht.trim(),
        datenschutz: datenschutz,
        newsletter: formData.get("newsletter") === "on",
        price_acknowledged: true,
        price_ack_time: priceAckTime || new Date().toISOString(),
        price_plan: pricePlan,
        billing_model: 'agency' // Standard Agenturabrechnung - nur Admin kann ändern
      };

      // Call Edge Function instead of direct Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

      const response = await fetch(`${supabaseUrl}/functions/v1/submit-fahrer-anfrage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      let payload: any = null;
      try { payload = await response.clone().json(); } catch { /* non-JSON */ }

      if (!response.ok || (payload && payload.success === false)) {
        const msg = payload?.error || payload?.message || `${response.status} ${response.statusText}`;
        throw new Error(msg);
      }

      console.log("Edge Function success:", payload ?? await response.text());

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
        <BookingPriorityBanner />
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            LKW-Fahrer buchen & Kraftfahrer mieten
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Berufskraftfahrer kurzfristig buchen - deutschlandweit verfügbar
          </p>
          <p className="text-base text-gray-500">
            Ob LKW-Fahrer (C/CE), Fahrmischerfahrer, Baumaschinenführer oder ADR-Fahrer – 
            finden Sie schnell den passenden Fahrer für Ihren Einsatz
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
              {/* Abrechnungsmodell Anzeige */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 md:p-5">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h3 className="font-bold text-lg text-blue-700">Abrechnungsmodell</h3>
                </div>
                <div className="font-medium text-blue-600 mb-1">
                  Agenturabrechnung – Vertragspartner ist Fahrerexpress
                </div>
                <p className="text-sm text-blue-600 mb-2">
                  Fahrerexpress tritt als Hauptauftragnehmer auf und rechnet direkt mit Ihnen ab.
                  Die Fahrleistung wird von einem selbstständigen LKW-Fahrer / Kraftfahrer / Baumaschinenführer als Subunternehmer erbracht, der seine Rechnung an Fahrerexpress stellt.
                </p>
                <div className="text-xs text-blue-700 bg-blue-100 rounded px-2 py-1 inline-block">
                  <strong>Hinweis:</strong> Es handelt sich um eine Dienst-/Werkleistung – keine Arbeitnehmerüberlassung.
                </div>
                
                {/* Mobile Tooltip */}
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="md:hidden ml-2 text-blue-500 text-xs underline" aria-label="Weitere Details">
                        Details anzeigen
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="text-xs">
                        <p><strong>Abrechnungsmodell:</strong> Fahrerexpress rechnet direkt mit Ihnen ab.</p>
                        <p><strong>Leistung:</strong> Ein selbstständiger Fahrer erbringt die Leistung als Subunternehmer.</p>
                        <p><strong>Rechtsform:</strong> Dienst-/Werkleistung, keine Arbeitnehmerüberlassung.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <input type="hidden" name="billing_model" value="agency" />
              </div>

              {/* Preisbox */}
              <div role="note" aria-label="Ihr Fahrerpreis" className="rounded-lg border border-primary/20 bg-muted/40 p-4 md:p-5 relative">
                <div className="absolute inset-x-0 top-0 h-1 bg-primary rounded-t-lg" />
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className="text-2xl">💰</span>
                  <div>
                    <h3 className="font-bold text-xl md:text-2xl mb-2">Ihr Fahrerpreis</h3>
                    <TooltipProvider delayDuration={100}>
                      <ul className="space-y-1">
                        <li className="text-base md:text-lg flex items-center">
                          <span>– Standard LKW-Fahrer (C+E): <span className="font-semibold text-primary text-lg md:text-xl">399 € netto / Tag</span> (8 Std.)</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="ml-2 inline-flex items-center text-muted-foreground hover:text-foreground" aria-label="Preisdetails">
                                <Info className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              inkl. 8 Std., Mehrstunden nach Absprache.
                            </TooltipContent>
                          </Tooltip>
                        </li>
                        <li className="text-base md:text-lg flex items-center">
                          <span>– Spezialfahrer (ADR/Kran): <span className="font-semibold text-primary text-lg md:text-xl">539 € netto / Tag</span> (8 Std.)</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="ml-2 inline-flex items-center text-muted-foreground hover:text-foreground" aria-label="Preisdetails">
                                <Info className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              inkl. 8 Std., Mehrstunden nach Absprache.
                            </TooltipContent>
                          </Tooltip>
                        </li>
                        <li className="text-base md:text-lg flex items-center">
                          <span>– Baumaschinenführer: <span className="font-semibold text-primary text-lg md:text-xl">489 € netto / Tag</span> (8 Std.)</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="ml-2 inline-flex items-center text-muted-foreground hover:text-foreground" aria-label="Preisdetails">
                                <Info className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              inkl. 8 Std., Mehrstunden nach Absprache.
                            </TooltipContent>
                          </Tooltip>
                        </li>
                      </ul>
                    </TooltipProvider>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Alle Preise zzgl. MwSt., Fahrtkosten und evtl. Übernachtung nach Aufwand. Mit Absenden des Formulars buchen Sie verbindlich zum angegebenen Tagespreis.
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground font-medium">
                      Hinweis: Die Vermittlungsprovision bezieht sich auf das gesamte Nettohonorar des Einsatzes einschließlich berechtigter Nebenkosten (z. B. Fahrt-/Übernachtung/Mehrstunden).
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vorname">Vorname *</Label>
                  <Input
                    type="text"
                    id="vorname"
                    name="vorname"
                    autoComplete="given-name"
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
                    autoComplete="family-name"
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
                  autoComplete="email"
                  required
                  className="mt-1"
                />
              </div>

                <div>
                  <Label htmlFor="phone">Telefonnummer *</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    autoComplete="tel"
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
                  autoComplete="organization"
                  className="mt-1"
                />
              </div>

              {/* Customer Address Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_street">Straße *</Label>
                  <Input
                    type="text"
                    id="customer_street"
                    name="customer_street"
                    autoComplete="address-line1"
                    required
                    className="mt-1"
                    placeholder="Musterstraße"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_house_number">Hausnummer *</Label>
                  <Input
                    type="text"
                    id="customer_house_number"
                    name="customer_house_number"
                    required
                    className="mt-1"
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_postal_code">Postleitzahl *</Label>
                  <Input
                    type="text"
                    id="customer_postal_code"
                    name="customer_postal_code"
                    autoComplete="postal-code"
                    required
                    pattern="[0-9]{5}"
                    maxLength={5}
                    className="mt-1"
                    placeholder="12345"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_city">Ort *</Label>
                  <Input
                    type="text"
                    id="customer_city"
                    name="customer_city"
                    autoComplete="address-level2"
                    required
                    className="mt-1"
                    placeholder="Musterstadt"
                  />
                </div>
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
                    autoComplete="off"
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
                  autoComplete="off"
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
                  autoComplete="off"
                  rows={6}
                  required
                  placeholder="z.B. Einsatzort, besondere Anforderungen, weitere Details..."
                  className="mt-1"
                />
              </div>


              <div className="space-y-3">
                <div className="flex items-center space-x-2">
<Checkbox
  id="preise_ok"
  name="preise_ok"
  required
  onCheckedChange={(checked) => {
    const isChecked = checked === true;
    if (isChecked) {
      const plan = derivePlan();
      const ts = new Date().toISOString();
      setPricePlan(plan);
      setPriceAckTime(ts);
      setPriceAcknowledged(true);
      sendGAEvent(plan, ts);
    } else {
      setPriceAcknowledged(false);
      setPriceAckTime(null);
    }
  }}
/>
                  <Label htmlFor="preise_ok" className="text-sm">
                    Ich habe die Preise gelesen und verstanden. *
                  </Label>
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
  href="/datenschutz" 
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
                {isSubmitting ? "Wird gesendet..." : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Fahrer buchen</span>
                    <Badge variant="secondary" className="text-[11px] md:text-xs px-2 py-1">ab 399 € netto</Badge>
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        <BookingAdvantagesInfo />
        
        {/* SEO-optimized Info Block */}
        <div className="rounded-xl border border-muted p-6 mt-8 bg-gradient-to-r from-background to-muted/30">
          <h3 className="text-xl font-bold mb-4 text-foreground">
            Schnell den passenden Fahrer finden
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Ob <strong>LKW-Fahrer (C/CE)</strong>, <strong>Fahrmischerfahrer</strong>, <strong>Kraftfahrer für Fernverkehr</strong>, 
            <strong>Baumaschinenführer</strong> oder <strong>Spezialfahrer mit ADR/Kran</strong> – über Fahrerexpress können Sie 
            <strong>kurzfristig und deutschlandweit</strong> selbstständige Fahrer buchen. Alle Fahrer erbringen ihre Leistung 
            als selbstständige Subunternehmer – <strong>ohne Arbeitnehmerüberlassung</strong>, rechtssicher und transparent.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
            <div className="text-center p-2 bg-background rounded border">
              <div className="font-semibold text-primary">C+E Fahrer</div>
              <div className="text-xs text-muted-foreground">Sattelzug & LKW</div>
            </div>
            <div className="text-center p-2 bg-background rounded border">
              <div className="font-semibold text-primary">ADR-Fahrer</div>
              <div className="text-xs text-muted-foreground">Gefahrgut</div>
            </div>
            <div className="text-center p-2 bg-background rounded border">
              <div className="font-semibold text-primary">Kranfahrer</div>
              <div className="text-xs text-muted-foreground">Mobile Krane</div>
            </div>
            <div className="text-center p-2 bg-background rounded border">
              <div className="font-semibold text-primary">Baumaschinisten</div>
              <div className="text-xs text-muted-foreground">Bagger & Co.</div>
            </div>
          </div>
        </div>

        {/* SEO FAQ Section */}
        <div className="mt-8 space-y-4">
          <h3 className="text-2xl font-bold text-center mb-6">Häufige Fragen zum Fahrer buchen</h3>
          
          <div className="space-y-4">
            <details className="group rounded-lg border border-muted p-4 hover:border-primary/50 transition-colors">
              <summary className="font-semibold cursor-pointer flex items-center justify-between group-open:text-primary">
                Kann ich kurzfristig einen LKW-Fahrer buchen?
                <span className="ml-2 transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 text-muted-foreground">
                Ja, über Fahrerexpress sind bundesweit kurzfristige Fahrereinsätze möglich. 
                Unsere registrierten <strong>Berufskraftfahrer</strong> erhalten sofort eine Benachrichtigung 
                über neue Aufträge und können oft innerhalb weniger Stunden verfügbar sein.
              </div>
            </details>

            <details className="group rounded-lg border border-muted p-4 hover:border-primary/50 transition-colors">
              <summary className="font-semibold cursor-pointer flex items-center justify-between group-open:text-primary">
                Welche Fahrer kann ich mieten?
                <span className="ml-2 transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 text-muted-foreground">
                Sie können verschiedene Fahrertypen buchen: <strong>LKW-Fahrer (C+E)</strong>, <strong>Kraftfahrer</strong>, 
                <strong>Fahrmischerfahrer</strong>, <strong>Baumaschinenführer</strong> sowie <strong>Spezialfahrer mit ADR-Schein oder Kranführerschein</strong>. 
                Alle Fahrer verfügen über die erforderlichen Qualifikationen und Führerscheinklassen.
              </div>
            </details>

            <details className="group rounded-lg border border-muted p-4 hover:border-primary/50 transition-colors">
              <summary className="font-semibold cursor-pointer flex items-center justify-between group-open:text-primary">
                Handelt es sich um Zeitarbeit oder Arbeitnehmerüberlassung?
                <span className="ml-2 transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 text-muted-foreground">
                <strong>Nein.</strong> Alle Fahrer sind selbstständig tätig und erbringen ihre Leistung als 
                Subunternehmer im Rahmen von <strong>Dienst-/Werkverträgen</strong>. Es handelt sich ausdrücklich 
                <strong>nicht um Arbeitnehmerüberlassung</strong> oder Zeitarbeit.
              </div>
            </details>

            <details className="group rounded-lg border border-muted p-4 hover:border-primary/50 transition-colors">
              <summary className="font-semibold cursor-pointer flex items-center justify-between group-open:text-primary">
                Wie schnell finde ich einen verfügbaren Fahrer?
                <span className="ml-2 transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 text-muted-foreground">
                Nach Ihrer Buchung werden sofort alle passenden <strong>Kraftfahrer in Ihrer Region</strong> 
                benachrichtigt. In der Regel erhalten wir innerhalb von 1-4 Stunden Rückmeldungen von 
                verfügbaren Fahrern. Bei dringenden Anfragen kontaktieren wir Sie umgehend telefonisch.
              </div>
            </details>

            <details className="group rounded-lg border border-muted p-4 hover:border-primary/50 transition-colors">
              <summary className="font-semibold cursor-pointer flex items-center justify-between group-open:text-primary">
                In welchen Regionen kann ich Fahrer buchen?
                <span className="ml-2 transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 text-muted-foreground">
                Wir vermitteln <strong>Fahrer deutschlandweit</strong>. Besonders stark vertreten sind wir in 
                den Ballungsräumen München, Hamburg, Frankfurt, Berlin, Köln/Düsseldorf und Stuttgart. 
                Auch für ländliche Regionen finden wir in der Regel passende Kraftfahrer.
              </div>
            </details>
          </div>
        </div>

        <BookingFAQ />
      </div>
    </section>
  );
};

export default FahreranfrageSection;
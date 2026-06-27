import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { validateFiles, uploadViaEdge } from "@/utils/fileValidation";
import beispielFuehrerschein from "@/assets/beispiel-fuehrerschein.png";
import beispielFahrerkarte from "@/assets/beispiel-fahrerkarte.png";

const FahrerRegistrierung = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useSEO({
    title: "Partner werden – Fahrer-Netzwerk deutschlandweit | Fahrerexpress",
    description: "Partner werden bei Fahrerexpress – deutschlandweite Vermittlung für selbstständige LKW-Fahrer & Baumaschinenführer.",
    keywords: "Fahrer-Netzwerk, selbstständiger Berufskraftfahrer, Fahrer-Partner werden, Kooperation LKW-Fahrer, Subunternehmer Kraftfahrer, EU-Fahrer Deutschland, Fahrerservice Partner, freiberuflicher Kraftfahrer, Werkvertrag Fahrer",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Fahrer-Netzwerk & Vermittlungsservice",
      "name": "Partner-Netzwerk für selbstständige Kraftfahrer",
      "description": "Werden Sie Partner in unserem bundesweiten Fahrer-Netzwerk. Wir vermitteln selbstständige Berufskraftfahrer und Baumaschinenführer an Unternehmen deutschlandweit.",
      "provider": {
        "@type": "Organization",
        "name": "Fahrerexpress-Agentur - Günter Killer",
        "url": "https://kraftfahrer-mieten.com"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Deutschland"
      },
      "offers": {
        "@type": "Offer",
        "description": "Flexible Auftragsannahme für selbstständige Kraftfahrer. Faire Konditionen und bundesweite Einsatzmöglichkeiten.",
        "priceCurrency": "EUR"
      }
    }
  });
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({
    vorname: "",
    nachname: "",
    email: "",
    telefon: "",
    adresse: "",
    plz: "",
    ort: "",
    fuehrerscheinklassen: [] as string[],
    erfahrung_jahre: "",
    spezialisierungen: [] as string[],
    verfuegbare_regionen: [] as string[],
    stundensatz: "",
    verfuegbarkeit: "",
    beschreibung: "",
    vermittlungszustimmung: false,
    einsatzbereitschaft_bestaetigt: false,
    gewerbenachweis_bestaetigt: false,
    // Neue BF2/BF3 Erlaubnisse
    bf2_erlaubnis: false,
    bf3_erlaubnis: false,
    // Spezialanforderungen
    spezialanforderungen: [] as string[],
    // EU/EWR Firmensitz
    firmensitz_land: "",
  });

  // File upload states
  const [selectedFiles, setSelectedFiles] = useState<{
    fuehrerschein: FileList | null,
    fahrerkarte: FileList | null,
    gewerbeanmeldung: FileList | null,
    zertifikate: FileList | null
  }>({
    fuehrerschein: null,
    fahrerkarte: null,
    gewerbeanmeldung: null,
    zertifikate: null
  });

  // File validation errors
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  const fuehrerscheinklassen = ["B", "C1", "C", "CE", "D1", "D", "DE"];
  const spezialisierungen = [
    // Baumaschinenführer
    "Bagger",
    "Radlader",
    "Fahrmischer", 
    "Flüssigboden/Mischanlagen",
    "Baustellenlogistik & Materialfluss",
    "Kleinere Reparaturen & Technik",
    
    // LKW CE Fahrer
    "Wechselbrücke",
    "Hängerzug",
    "Fernverkehr",
    "Nahverkehr",
    "Baustellenverkehr",
    "Mitnahmestapler",
    "ADR (Gefahrgut)",
    "Baustofflogistik",
    "Entsorgung",
    "Containertransporte",
    "Kurier- und Expresslogistik",
    "Eventlogistik",
    "Sonstige"
  ];
  
  // Spezialanforderungen - was der Fahrer hat/kann/bereit ist zu machen
  const spezialanforderungen = [
    "ADR-Schein im Besitz",
    "Langstreckenfahrten möglich",
    "Wochenendfahrten möglich", 
    "Sonderführerschein vorhanden",
    "Mitnahmestapler / Gabelstapler möglich",
    "Auslandseinsätze möglich",
    "BF2/BF3-Berechtigung vorhanden",
    "Ladekran-Erfahrung vorhanden",
    "Nachtschicht möglich",
    "Baustellen-Erfahrung vorhanden",
    "Überbreite/Überlänge möglich",
    "Sprachkenntnisse vorhanden (Deutsch, Englisch)",
    "Erfahrung im Schwertransport-Begleitwesen vorhanden"
  ];
  const bundeslaender = [
    "deutschlandweit",
    "europaweit",
    "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen",
    "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen",
    "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen",
    "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"
  ];

  const euLaender = [
    "Deutschland", "Österreich", "Schweiz", "Belgien", "Niederlande", 
    "Frankreich", "Italien", "Spanien", "Portugal", "Polen", "Tschechien", 
    "Slowakei", "Ungarn", "Slowenien", "Kroatien", "Dänemark", "Schweden", 
    "Finnland", "Norwegen", "Island", "Luxemburg", "Irland", "Griechenland", 
    "Bulgarien", "Rumänien", "Estland", "Lettland", "Litauen", "Malta", "Zypern"
  ];

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field as keyof typeof prev] as string[], value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
    // Clear validation error when user interacts with field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateField = (field: string, value: any) => {
    const errors: {[key: string]: string} = {};
    
    switch (field) {
      case 'vorname':
        if (!value || value.trim() === '') {
          errors.vorname = 'Bitte geben Sie Ihren Vornamen ein';
        }
        break;
      case 'nachname':
        if (!value || value.trim() === '') {
          errors.nachname = 'Bitte geben Sie Ihren Nachnamen ein';
        }
        break;
      case 'email':
        if (!value || value.trim() === '') {
          errors.email = 'Bitte geben Sie Ihre E-Mail-Adresse ein';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
        }
        break;
      case 'telefon':
        if (!value || value.trim() === '') {
          errors.telefon = 'Bitte geben Sie Ihre Telefonnummer ein';
        }
        break;
      case 'stundensatz':
        // Optionales Feld – nur Zahlenformat prüfen, falls etwas eingegeben wurde
        if (value && value.trim() !== '' && (isNaN(Number(value)) || Number(value) <= 0)) {
          errors.stundensatz = 'Bitte als gültige Zahl angeben (z. B. 35) oder Feld leer lassen';
        }
        break;
      case 'fuehrerscheinklassen':
        if (!value || value.length === 0) {
          errors.fuehrerscheinklassen = 'Bitte wählen Sie mindestens eine Führerscheinklasse aus';
        } else {
          const QUALIFYING = ['C1', 'C', 'CE', 'D1', 'D', 'DE'];
          const hasQualifying = (value as string[]).some((k) => QUALIFYING.includes(k));
          if (!hasQualifying) {
            errors.fuehrerscheinklassen =
              'Für eine Registrierung bei Fahrerexpress ist mindestens eine Fahrerlaubnis der Klassen C1, C, CE, D1, D oder DE erforderlich.';
          }
        }
        break;
      case 'erfahrung_jahre':
        if (!value || value.trim() === '') {
          errors.erfahrung_jahre = 'Bitte wählen Sie Ihre Berufserfahrung aus.';
        }
        break;
      case 'vermittlungszustimmung':
        if (!value) {
          errors.vermittlungszustimmung = 'Sie müssen den Vermittlungsbedingungen zustimmen';
        }
        break;
      case 'einsatzbereitschaft_bestaetigt':
        if (!value) {
          errors.einsatzbereitschaft_bestaetigt = 'Bitte bestätigen Sie Ihre grundsätzliche Einsatzbereitschaft';
        }
        break;
      case 'gewerbenachweis_bestaetigt':
        if (!value) {
          errors.gewerbenachweis_bestaetigt = 'Bitte bestätigen Sie, dass Sie selbstständig tätig sind und den Gewerbenachweis nachreichen';
        }
        break;
    }
    
    return errors;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // File validation function
  const validateFilesAndShow = (files: FileList) => {
    const validationResults = validateFiles(Array.from(files));
    setFileErrors(validationResults);
    
    // Check if there are any actual errors (not just "OK" messages)
    const hasErrors = validationResults.some(msg => !msg.includes('✓ OK'));
    
    return !hasErrors; // Return true if no errors
  };

  const handleFileChange = (field: 'fuehrerschein' | 'fahrerkarte' | 'gewerbeanmeldung' | 'zertifikate', files: FileList | null) => {
    if (!files || files.length === 0) {
      setFileErrors([]);
      return;
    }
    
    // Validate files and update state
    const isValid = validateFilesAndShow(files);
    
    setSelectedFiles(prev => ({
      ...prev,
      [field]: files
    }));

    // Show validation results in toast
    toast({
      title: isValid ? "Datei(en) ausgewählt" : "Datei-Validierung",
      description: `${files.length} Datei(en) für ${field} ${isValid ? 'ausgewählt' : 'validiert'}`,
      variant: isValid ? "default" : "destructive"
    });
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Validate all required fields
    const vornameErrors = validateField('vorname', formData.vorname);
    const nachnameErrors = validateField('nachname', formData.nachname);
    const emailErrors = validateField('email', formData.email);
    const telefonErrors = validateField('telefon', formData.telefon);
    const stundensatzErrors = validateField('stundensatz', formData.stundensatz);
    const fuehrerscheinklassenErrors = validateField('fuehrerscheinklassen', formData.fuehrerscheinklassen);
    const erfahrungErrors = validateField('erfahrung_jahre', formData.erfahrung_jahre);
    const vermittlungErrors = validateField('vermittlungszustimmung', formData.vermittlungszustimmung);
    const einsatzErrors = validateField('einsatzbereitschaft_bestaetigt', formData.einsatzbereitschaft_bestaetigt);
    const gewerbeErrors = validateField('gewerbenachweis_bestaetigt', formData.gewerbenachweis_bestaetigt);
    
    Object.assign(errors, vornameErrors, nachnameErrors, emailErrors, telefonErrors, stundensatzErrors, fuehrerscheinklassenErrors, erfahrungErrors, vermittlungErrors, einsatzErrors, gewerbeErrors);
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation before submit
    if (!validateForm()) {
      toast({
        title: "Eingabefehler",
        description: "Bitte korrigieren Sie die markierten Felder.",
        variant: "destructive",
      });
      return;
    }

    // Validate all selected files before proceeding
    const allFiles: File[] = [];
    if (selectedFiles.fuehrerschein) allFiles.push(...Array.from(selectedFiles.fuehrerschein));
    if (selectedFiles.fahrerkarte) allFiles.push(...Array.from(selectedFiles.fahrerkarte));
    if (selectedFiles.gewerbeanmeldung) allFiles.push(...Array.from(selectedFiles.gewerbeanmeldung));
    if (selectedFiles.zertifikate) allFiles.push(...Array.from(selectedFiles.zertifikate));

    if (allFiles.length > 0) {
      const fileValidation = validateFiles(allFiles);
      const hasFileErrors = fileValidation.some(msg => !msg.includes('✓ OK'));
      
      if (hasFileErrors) {
        toast({
          title: "Datei-Validierungsfehler",
          description: "Bitte korrigieren Sie die Dateien bevor Sie fortfahren.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      console.log("Sende Fahrer-Registrierung über fahrerwerden Function...");

      // Prepare FormData for the fahrerwerden function which includes email sending
      const formDataToSend = new FormData();
      
      // Basic data
      formDataToSend.append("name", `${formData.vorname} ${formData.nachname}`);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.telefon);
      formDataToSend.append("company", "");
      formDataToSend.append("message", "");
      formDataToSend.append("description", formData.beschreibung || "");
      formDataToSend.append("license_classes", JSON.stringify(formData.fuehrerscheinklassen));
      formDataToSend.append("experience", formData.erfahrung_jahre || "");
      formDataToSend.append("specializations", JSON.stringify(formData.spezialisierungen));
      formDataToSend.append("regions", JSON.stringify(formData.verfuegbare_regionen));
      formDataToSend.append("hourly_rate", formData.stundensatz || "");
      // Neue Felder für BF2/BF3 und Spezialanforderungen
      formDataToSend.append("bf2_erlaubnis", formData.bf2_erlaubnis.toString());
      formDataToSend.append("bf3_erlaubnis", formData.bf3_erlaubnis.toString());
      formDataToSend.append("spezialanforderungen", JSON.stringify(formData.spezialanforderungen));
      formDataToSend.append("firmensitz_land", formData.firmensitz_land || "");

      // Add file uploads
      if (selectedFiles.fuehrerschein) {
        Array.from(selectedFiles.fuehrerschein).forEach(file => {
          formDataToSend.append("fuehrerschein", file);
        });
      }

      if (selectedFiles.fahrerkarte) {
        Array.from(selectedFiles.fahrerkarte).forEach(file => {
          formDataToSend.append("fahrerkarte", file);
        });
      }

      if (selectedFiles.gewerbeanmeldung) {
        Array.from(selectedFiles.gewerbeanmeldung).forEach(file => {
          formDataToSend.append("gewerbeanmeldung", file);
        });
      }

      if (selectedFiles.zertifikate) {
        Array.from(selectedFiles.zertifikate).forEach(file => {
          formDataToSend.append("zertifikate", file);
        });
      }

      // Send to fahrerwerden function which includes email functionality
      const response = await fetch('https://hxnabnsoffzevqhruvar.supabase.co/functions/v1/fahrerwerden', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      
      if (response.status === 409) {
        toast({
          title: "E-Mail bereits registriert",
          description: "Ein Fahrer mit dieser E-Mail-Adresse ist bereits registriert. Bitte verwenden Sie eine andere E-Mail-Adresse oder kontaktieren Sie uns unter info@kraftfahrer-mieten.com",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (!response.ok || !result?.success) {
        console.error('Fahrerwerden error:', result);
        throw new Error(result?.error || 'Fehler bei der Registrierung');
      }

      console.log("Registration completed successfully with emails sent");

      toast({
        title: "Registrierung erfolgreich!",
        description: "Vielen Dank für Ihre Registrierung! Wir werden Ihre Daten prüfen und uns bei Ihnen melden.",
      });

      // Nach erfolgreichem Submit zur Startseite weiterleiten
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

      // Form NUR nach erfolgreichem Submit zurücksetzen
      setFormData({
        vorname: "",
        nachname: "",
        email: "",
        telefon: "",
        adresse: "",
        plz: "",
        ort: "",
        fuehrerscheinklassen: [],
        erfahrung_jahre: "",
        spezialisierungen: [],
        verfuegbare_regionen: [],
        stundensatz: "",
        verfuegbarkeit: "",
        beschreibung: "",
        vermittlungszustimmung: false,
        einsatzbereitschaft_bestaetigt: false,
        gewerbenachweis_bestaetigt: false,
        bf2_erlaubnis: false,
        bf3_erlaubnis: false,
        spezialanforderungen: [],
        firmensitz_land: "",
      });
      setSelectedFiles({
        fuehrerschein: null,
        fahrerkarte: null,
        gewerbeanmeldung: null,
        zertifikate: null
      });
      setValidationErrors({});
      setFileErrors([]);

    } catch (error: unknown) {
      const message = typeof error === 'string'
        ? error
        : (error && typeof error === 'object' && 'message' in error
          ? String((error as any).message)
          : JSON.stringify(error));
      console.error("Fehler beim Senden:", error);
      toast({
        title: "Fehler bei der Registrierung",
        description: message || "Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.",
        variant: "destructive",
      });
      // WICHTIG: Form-Daten bleiben erhalten bei Fehlern!
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-muted pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Zurück Button */}
            <div className="mb-6">
              <Button variant="ghost" asChild className="mb-4">
                <Link to="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Zurück zur Startseite
                </Link>
              </Button>
            </div>


            {/* Werbetext für selbstständige Fahrer */}
            <Card className="mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8">
                  <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
                      💬 Warum selbstständige Fahrer mit Fahrerexpress zusammenarbeiten
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      Sie entscheiden eigenverantwortlich, welche Auftragsangebote Sie annehmen.
                      Einsatzort, Zeitraum, Fahrzeugart und Konditionen werden vor jedem Auftrag transparent abgestimmt.
                    </p>
                    <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium text-primary">
                        🇪🇺 Fahrer aus Deutschland, allen EU-Staaten und dem Europäischen Wirtschaftsraum können sich registrieren – sofern Führerschein, Fahrerkarte, Qualifikation und rechtliche Einsatzvoraussetzungen passen.
                      </p>
                    </div>
                  </div>

                  <div className="bg-card/50 rounded-lg p-6 border border-primary/10">
                    <p className="text-lg mb-4">
                      Bei Fahrerexpress arbeiten Sie als selbstständiger Unternehmer auf Augenhöhe –
                      mit klar abgestimmten Aufträgen, transparenter Vergütung und einem Ansprechpartner, der die Branche aus eigener Erfahrung kennt.
                    </p>

                    <div className="grid md:grid-cols-3 gap-4 my-6">
                      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                        <span className="text-2xl">🚛</span>
                        <span className="text-sm">Sie möchten als selbstständiger Unternehmer eigenverantwortlich arbeiten?</span>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                        <span className="text-2xl">🧭</span>
                        <span className="text-sm">Sie möchten selbst entscheiden, welche Auftragsangebote zu Ihnen passen?</span>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                        <span className="text-2xl">💼</span>
                        <span className="text-sm">Sie prüfen jedes Auftragsangebot mit Einsatzort, Zeitraum, Fahrzeugart und Konditionen vorab.</span>
                      </div>
                    </div>

                    <div className="text-center bg-primary/10 rounded-lg p-4 mb-6">
                      <p className="text-lg font-semibold text-primary">
                        👉 Dann ist jetzt der richtige Moment, sich bei uns zu registrieren.
                      </p>
                    </div>
                  </div>

                  <div className="bg-card/50 rounded-lg p-6 border border-green-500/20">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      ✅ Was Sie erwartet:
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                          <span>Auftragsangebote deutschlandweit – jeder Einsatz wird vorab einzeln abgestimmt</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                          <span>Transparente Vergütung – klare Konditionen vor jedem Auftrag</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                          <span>Keine klassische Lohnabrechnung wie bei Arbeitnehmern – Sie rechnen Ihre vereinbarte Leistung als selbstständiger Unternehmer ab</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                          <span>Persönliche Betreuung – direkter Ansprechpartner statt Callcenter</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Hinweis: Es handelt sich nicht um Zeitarbeit und nicht um eine Festanstellung. Es besteht kein Anspruch auf bestimmte Aufträge – jeder Fahrer entscheidet selbst, ob er ein konkretes Auftragsangebot annimmt.
                    </p>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-6 text-center">
                    <div className="space-y-4">
                      <p className="text-lg flex items-center justify-center gap-2">
                        <span className="text-2xl">🔧</span>
                        Sie bringen Erfahrung, Führerschein und unternehmerische Motivation mit – wir vermitteln Ihnen passende Auftragsangebote.
                      </p>
                      <div className="border-t border-primary/20 pt-4">
                        <p className="text-xl font-bold text-primary mb-2">
                          📝 Registrieren Sie sich jetzt als selbstständiger Fahrer und reichen Sie Ihre Unterlagen zur Prüfung ein.
                        </p>
                        <p className="text-lg text-muted-foreground">
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Voraussetzungen Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">
                  Voraussetzungen für die Registrierung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <span>Das Portal richtet sich ausschließlich an selbstständige Berufskraftfahrer mit Führerscheinklasse C1, C, CE, D1, D oder DE. Klasse B allein ist nicht ausreichend.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <span>Fahrerkarte für den digitalen Tachographen</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <span>Berufserfahrung als Kraftfahrer, idealerweise mindestens 2 Jahre</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <span className="font-semibold">Gewerbeschein / Gewerbeanmeldung ist erforderlich. Falls der Nachweis bei der Registrierung nicht zur Hand ist, muss er spätestens mit der ersten Rechnung an Fahrerexpress nachgereicht werden.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <span>Eigene steuerliche und sozialversicherungsrechtliche Verantwortung als selbstständiger Unternehmer</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <span className="font-medium">🇪🇺 Bei EU/EWR-Fahrern: anerkennungsfähige Fahrerlaubnis und erforderliche Berufskraftfahrerqualifikation</span>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/30">
                  <p className="text-sm font-semibold mb-1">Aufnahmebedingungen für unser Fahrer-Netzwerk</p>
                  <p className="text-sm">
                    Für die Aufnahme in unser Fahrer-Netzwerk benötigen wir eine gültige Gewerbeanmeldung,
                    einen gültigen Führerschein, eine Fahrerkarte und vollständige Kontaktdaten.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Hinweis: Fahrer, die dauerhaft nicht reagieren oder keine Aufträge annehmen, können aus dem aktiven Verteiler entfernt werden.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Fahrer-Registrierung bei Fahrerexpress
                </CardTitle>
                <p className="text-center text-muted-foreground mb-4">
                  Registrieren Sie sich als selbständiger Kraftfahrer und werden Sie Teil unseres Netzwerks
                </p>
                
                {/* EU-Willkommens-Banner */}
                <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-6 mt-4">
                  <h3 className="text-lg font-semibold text-center mb-3 flex items-center justify-center gap-2">
                    <span>🇪🇺</span>
                    <span>EU/EWR-Fahrer willkommen!</span>
                    <span>🇪🇺</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-card p-3 rounded">
                      <p className="font-medium mb-1">🇩🇪 Deutsch</p>
                      <p className="text-muted-foreground text-xs">Wir vermitteln selbstständige Unternehmer aus allen EU/EWR-Ländern – die Einsatzmöglichkeit wird individuell anhand Qualifikation und rechtlicher Voraussetzungen geprüft.</p>
                    </div>
                    <div className="bg-card p-3 rounded">
                      <p className="font-medium mb-1">🇬🇧 English</p>
                      <p className="text-muted-foreground text-xs">We support legally compliant cooperation with self-employed drivers from EU/EEA countries – eligibility is reviewed individually.</p>
                    </div>
                    <div className="bg-card p-3 rounded">
                      <p className="font-medium mb-1">🇵🇱 Polski</p>
                      <p className="text-muted-foreground text-xs">Pośredniczymy we współpracy z samodzielnymi kierowcami z krajów UE/EOG – możliwość współpracy jest oceniana indywidualnie.</p>
                    </div>
                    <div className="bg-card p-3 rounded">
                      <p className="font-medium mb-1">🇷🇴 Română</p>
                      <p className="text-muted-foreground text-xs">Intermediem colaborarea cu șoferi independenți din țările UE/SEE – eligibilitatea este verificată individual.</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-primary/20">
                    <p className="text-center text-sm font-medium">
                      ✅ Transparente Vergütung • Transparent payment • Uczciwe wynagrodzenie • Plată corectă
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6" aria-label="Fahrer-Registrierungsformular">
                  {/* Persönliche Daten */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vorname">Vorname *</Label>
                      <Input
                        id="vorname"
                        value={formData.vorname}
                        onChange={(e) => handleInputChange('vorname', e.target.value)}
                        className={validationErrors.vorname ? "border-destructive" : ""}
                        required
                      />
                      {validationErrors.vorname && (
                        <p id="vorname-error" className="text-sm text-destructive mt-1" role="alert">{validationErrors.vorname}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="nachname">Nachname *</Label>
                      <Input
                        id="nachname"
                        value={formData.nachname}
                        onChange={(e) => handleInputChange('nachname', e.target.value)}
                        className={validationErrors.nachname ? "border-destructive" : ""}
                        required
                      />
                      {validationErrors.nachname && (
                        <p id="nachname-error" className="text-sm text-destructive mt-1" role="alert">{validationErrors.nachname}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">E-Mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={validationErrors.email ? "border-destructive" : ""}
                        required
                      />
                      {validationErrors.email && (
                        <p id="email-error" className="text-sm text-destructive mt-1" role="alert">{validationErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="telefon">Telefon *</Label>
                      <Input
                        id="telefon"
                        value={formData.telefon}
                        onChange={(e) => handleInputChange('telefon', e.target.value)}
                        className={validationErrors.telefon ? "border-destructive" : ""}
                        required
                      />
                      {validationErrors.telefon && (
                        <p id="telefon-error" className="text-sm text-destructive mt-1" role="alert">{validationErrors.telefon}</p>
                      )}
                    </div>
                  </div>

                  {/* EU/EWR Firmensitz */}
                  <div>
                    <Label htmlFor="firmensitz_land">Firmensitz (Land) – optional</Label>
                    <Select onValueChange={(value) => handleInputChange('firmensitz_land', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Land auswählen (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {euLaender.map((land) => (
                          <SelectItem key={land} value={land}>
                            {land}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Adresse */}
                  <div>
                      <Label htmlFor="adresse">Adresse</Label>
                      <Input
                        id="adresse"
                        value={formData.adresse}
                        onChange={(e) => handleInputChange('adresse', e.target.value)}
                      />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plz">PLZ</Label>
                      <Input
                        id="plz"
                        value={formData.plz}
                        onChange={(e) => handleInputChange('plz', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ort">Ort</Label>
                      <Input
                        id="ort"
                        value={formData.ort}
                        onChange={(e) => handleInputChange('ort', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Qualifikationen */}
                  <fieldset>
                    <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Führerscheinklassen *</legend>
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mt-2" role="group" aria-label="Führerscheinklassen auswählen">
                      {fuehrerscheinklassen.map((klasse) => (
                        <div key={klasse} className="flex items-center space-x-2">
                          <Checkbox
                            id={klasse}
                            checked={formData.fuehrerscheinklassen.includes(klasse)}
                            onCheckedChange={(checked) => 
                              handleCheckboxChange('fuehrerscheinklassen', klasse, checked as boolean)
                            }
                          />
                          <Label htmlFor={klasse} className="text-sm">{klasse}</Label>
                        </div>
                      ))}
                    </div>
                    {validationErrors.fuehrerscheinklassen && (
                      <p id="fuehrerschein-error" className="text-sm text-destructive mt-1" role="alert">{validationErrors.fuehrerscheinklassen}</p>
                    )}
                  </fieldset>

                  <div>
                    <Label htmlFor="erfahrung">Berufserfahrung (Jahre) *</Label>
                    <Select 
                      value={formData.erfahrung_jahre} 
                      onValueChange={(value) => handleInputChange('erfahrung_jahre', value)}
                    >
                      <SelectTrigger className={validationErrors.erfahrung_jahre ? "border-destructive" : "bg-yellow-50 border-yellow-400/70 dark:bg-yellow-950/30 dark:border-yellow-600/60"}>
                        <SelectValue placeholder="Wählen Sie Ihre Erfahrung" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Jahr</SelectItem>
                        <SelectItem value="2">2-3 Jahre</SelectItem>
                        <SelectItem value="5">5-10 Jahre</SelectItem>
                        <SelectItem value="10">10-20 Jahre</SelectItem>
                        <SelectItem value="20">Über 20 Jahre</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.erfahrung_jahre && (
                      <p id="erfahrung-error" className="text-sm text-destructive mt-1" role="alert">{validationErrors.erfahrung_jahre}</p>
                    )}
                  </div>

                  {/* Spezialisierungen */}
                  <fieldset>
                    <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Weitere Qualifikationen / zusätzliche Spezialisierungen
                    </legend>
                    <p className="text-xs text-muted-foreground mt-1">
                      Unser Fokus liegt auf selbstständigen LKW-Fahrern und Berufskraftfahrern. Zusätzliche Qualifikationen (z.&nbsp;B. Baumaschinen) können hier optional angegeben werden.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2" role="group" aria-label="Spezialisierungen auswählen">
                      {spezialisierungen.map((spez) => (
                        <div key={spez} className="flex items-center space-x-2">
                          <Checkbox
                            id={spez}
                            checked={formData.spezialisierungen.includes(spez)}
                            onCheckedChange={(checked) => 
                              handleCheckboxChange('spezialisierungen', spez, checked as boolean)
                            }
                          />
                          <Label htmlFor={spez} className="text-sm">{spez}</Label>
                        </div>
                      ))}
                    </div>
                  </fieldset>

                  {/* Spezialanforderungen */}
                  <fieldset>
                    <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Spezialanforderungen</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2" role="group" aria-label="Spezialanforderungen auswählen">
                      {spezialanforderungen.map((anforderung) => (
                        <div key={anforderung} className="flex items-center space-x-2">
                          <Checkbox
                            id={anforderung}
                            checked={formData.spezialanforderungen.includes(anforderung)}
                            onCheckedChange={(checked) => 
                              handleCheckboxChange('spezialanforderungen', anforderung, checked as boolean)
                            }
                          />
                          <Label htmlFor={anforderung} className="text-sm">{anforderung}</Label>
                        </div>
                      ))}
                    </div>
                  </fieldset>

                  {/* BF2/BF3 Erlaubnisse */}
                  <fieldset className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg" aria-hidden="true">🚛</span>
                      <legend className="text-base font-semibold">Haben Sie BF2/BF3-Berechtigung?</legend>
                    </div>
                    <p id="bf-berechtigung-hint" className="text-sm text-muted-foreground mb-4">
                      Falls Sie als Fahrer für Großraum- und Schwertransport-Begleitung qualifiziert sind (BF2 mit Rundumkennleuchte oder BF3/BF4 mit Wechselverkehrszeichenanlage), geben Sie dies bitte an.
                    </p>
                    <div className="space-y-3" role="group" aria-describedby="bf-berechtigung-hint">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="bf2_erlaubnis"
                          checked={formData.bf2_erlaubnis}
                          onCheckedChange={(checked) => 
                            handleInputChange('bf2_erlaubnis', checked as boolean)
                          }
                        />
                        <Label htmlFor="bf2_erlaubnis" className="text-sm flex items-center gap-2">
                          <span className="text-orange-500">🔶</span>
                          Ja, BF2 (Rundumkennleuchte)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="bf3_erlaubnis"
                          checked={formData.bf3_erlaubnis}
                          onCheckedChange={(checked) => 
                            handleInputChange('bf3_erlaubnis', checked as boolean)
                          }
                        />
                        <Label htmlFor="bf3_erlaubnis" className="text-sm flex items-center gap-2">
                          <span className="text-red-500">🔶</span>
                          Ja, BF3/BF4 (Wechselverkehrszeichenanlage)
                        </Label>
                      </div>
                    </div>
                  </fieldset>

                  {/* Verfügbare Regionen */}
                  <fieldset>
                    <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Verfügbare Bundesländer</legend>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 max-h-40 overflow-y-auto" role="group" aria-label="Bundesländer für Einsätze auswählen">
                      {bundeslaender.map((land) => (
                        <div key={land} className="flex items-center space-x-2">
                          <Checkbox
                            id={land}
                            checked={formData.verfuegbare_regionen.includes(land)}
                            onCheckedChange={(checked) => 
                              handleCheckboxChange('verfuegbare_regionen', land, checked as boolean)
                            }
                          />
                          <Label htmlFor={land} className="text-sm">{land}</Label>
                        </div>
                      ))}
                    </div>
                  </fieldset>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stundensatz">Gewünschter Tagessatz / Vergütungsvorstellung netto (optional)</Label>
                      <Input
                        id="stundensatz"
                        type="text"
                        placeholder="z. B. 280 € pro Einsatztag, 350 € bei Fernverkehr oder nach Vereinbarung"
                        value={formData.stundensatz}
                        onChange={(e) => handleInputChange('stundensatz', e.target.value)}
                        className={validationErrors.stundensatz ? "border-destructive" : ""}
                      />
                      {validationErrors.stundensatz && (
                        <p id="stundensatz-error" className="text-sm text-destructive mt-1" role="alert">{validationErrors.stundensatz}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="verfuegbarkeit">Grundsätzliche Verfügbarkeit (optional)</Label>
                      <Select
                        value={formData.verfuegbarkeit}
                        onValueChange={(value) => handleInputChange('verfuegbarkeit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Bitte auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kurzfristig">kurzfristig verfügbar</SelectItem>
                          <SelectItem value="tageweise">tageweise verfügbar</SelectItem>
                          <SelectItem value="wochenweise">wochenweise verfügbar</SelectItem>
                          <SelectItem value="absprache">nur nach Absprache</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2">
                    Die konkrete Vergütung und der Einsatzzeitraum werden Ihnen jeweils im einzelnen Auftragsangebot mitgeteilt. Sie entscheiden frei, ob Sie ein Angebot annehmen oder ablehnen.
                  </p>

                    {/* Dokument-Uploads */}
                   <div className="space-y-4">
                     <Label className="text-base font-semibold">
                       Dokumente hochladen – erforderlich für die Prüfung
                     </Label>
                      <p className="text-sm text-muted-foreground -mt-2">
                        Bitte laden Sie Führerschein, Fahrerkarte und Gewerbeanmeldung hoch, sofern sie Ihnen bereits vorliegt. Falls der Nachweis aktuell nicht zur Hand ist, muss er spätestens mit der ersten Rechnung an Fahrerexpress mitgesendet werden.
                      </p>
                     
                     <div className="grid md:grid-cols-2 gap-4">
                       <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                         <div className="flex flex-col items-center space-y-2">
                           <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                            <h4 className="font-medium">Führerschein</h4>
                              <figure className="mt-1 mb-1">
                                <img
                                  src={beispielFuehrerschein}
                                  alt="Beispielabbildung eines europäischen Führerscheins (Muster, keine echten Daten)"
                                  loading="lazy"
                                  width={160}
                                  height={100}
                                  className="w-40 h-24 object-contain rounded border border-muted-foreground/20 mx-auto bg-white"
                                />
                                <figcaption className="text-[11px] text-muted-foreground mt-1">Beispiel Führerschein</figcaption>
                              </figure>
                             <p className="text-sm text-muted-foreground mb-2">
                               Laden Sie eine Kopie Ihres Führerscheins hoch (mehrere Dateien möglich)
                             </p>
                             <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded mb-3 space-y-1">
                               <p className="font-medium">📋 Erlaubte Formate: JPG/JPEG, PNG, PDF · Max. 5 MB pro Datei</p>
                               <p>📷 Fotos bitte gut lesbar, gerade, ohne Spiegelungen</p>
                               <p>❌ Nicht erlaubt: HEIC/HEIF, ZIP/RAR, DOC/DOCX, EXE u. Ä.</p>
                               <p>🔒 Sicherheit: Dateien werden nicht öffentlich gespeichert; Zugriff nur über kurzlebige, signierte Links</p>
                             </div>
                             {selectedFiles.fuehrerschein && selectedFiles.fuehrerschein.length > 0 && (
                               <p className="text-xs text-primary font-medium">
                                 ✓ {selectedFiles.fuehrerschein.length} Datei(en) ausgewählt
                               </p>
                             )}
                             <Input
                               type="file"
                               accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                               multiple
                               className="hidden"
                               id="fuehrerschein"
                               onChange={(e) => handleFileChange('fuehrerschein', e.target.files)}
                             />
                           <Button
                             type="button"
                             variant="outline"
                             size="sm"
                             onClick={() => document.getElementById('fuehrerschein')?.click()}
                             aria-label="Führerschein hochladen"
                           >
                             <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                             Datei wählen
                           </Button>
                         </div>
                       </div>

                       <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                         <div className="flex flex-col items-center space-y-2">
                           <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                            <h4 className="font-medium">Fahrerkarte</h4>
                              <figure className="mt-1 mb-1">
                                <img
                                  src={beispielFahrerkarte}
                                  alt="Beispielabbildung einer Fahrerkarte für den digitalen Tachographen (Muster, keine echten Daten)"
                                  loading="lazy"
                                  width={160}
                                  height={100}
                                  className="w-40 h-24 object-contain rounded border border-muted-foreground/20 mx-auto bg-white"
                                />
                                <figcaption className="text-[11px] text-muted-foreground mt-1">Beispiel Fahrerkarte / Qualifizierungsnachweis</figcaption>
                              </figure>
                             <p className="text-sm text-muted-foreground mb-2">
                               Laden Sie eine Kopie Ihrer Fahrerkarte hoch (mehrere Dateien möglich)
                             </p>
                             <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded mb-3 space-y-1">
                               <p className="font-medium">📋 Erlaubte Formate: JPG/JPEG, PNG, PDF · Max. 5 MB pro Datei</p>
                               <p>📷 Fotos bitte gut lesbar, gerade, ohne Spiegelungen</p>
                               <p>❌ Nicht erlaubt: HEIC/HEIF, ZIP/RAR, DOC/DOCX, EXE u. Ä.</p>
                               <p>🔒 Sicherheit: Dateien werden nicht öffentlich gespeichert; Zugriff nur über kurzlebige, signierte Links</p>
                             </div>
                             {selectedFiles.fahrerkarte && selectedFiles.fahrerkarte.length > 0 && (
                               <p className="text-xs text-primary font-medium">
                                 ✓ {selectedFiles.fahrerkarte.length} Datei(en) ausgewählt
                               </p>
                             )}
                             <Input
                               type="file"
                               accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                               multiple
                               className="hidden"
                               id="fahrerkarte"
                               onChange={(e) => handleFileChange('fahrerkarte', e.target.files)}
                             />
                           <Button
                             type="button"
                             variant="outline"
                             size="sm"
                             onClick={() => document.getElementById('fahrerkarte')?.click()}
                             aria-label="Fahrerkarte hochladen"
                           >
                             <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                             Datei wählen
                           </Button>
                         </div>
                       </div>
                     </div>

                     <div className="border-2 border-dashed border-primary/40 rounded-lg p-6 text-center bg-primary/5">
                       <div className="flex flex-col items-center space-y-2">
                         <FileText className="h-8 w-8 text-primary" aria-hidden="true" />
                          <h4 className="font-medium">Gewerbeanmeldung / Gewerbeschein</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Bitte laden Sie Ihre Gewerbeanmeldung hoch, sofern sie Ihnen bereits vorliegt. Falls der Nachweis aktuell nicht zur Hand ist, muss er spätestens mit der ersten Rechnung an Fahrerexpress mitgesendet werden.
                          </p>
                          <p className="text-xs text-destructive font-medium mb-2">
                            Ohne nachgereichten Gewerbenachweis kann keine weitere Zusammenarbeit bzw. Auszahlung erfolgen.
                          </p>
                         <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded mb-3 space-y-1">
                           <p className="font-medium">📋 Erlaubte Formate: JPG/JPEG, PNG, PDF · Max. 5 MB pro Datei</p>
                           <p>📷 Bitte gut lesbar, gerade, ohne Spiegelungen</p>
                           <p>🔒 Sicherheit: Dateien werden nicht öffentlich gespeichert; Zugriff nur über kurzlebige, signierte Links</p>
                         </div>
                         {selectedFiles.gewerbeanmeldung && selectedFiles.gewerbeanmeldung.length > 0 && (
                           <p className="text-xs text-primary font-medium">
                             ✓ {selectedFiles.gewerbeanmeldung.length} Datei(en) ausgewählt
                           </p>
                         )}
                         <Input
                           type="file"
                           accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                           multiple
                           className="hidden"
                           id="gewerbeanmeldung"
                           onChange={(e) => handleFileChange('gewerbeanmeldung', e.target.files)}
                         />
                         <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onClick={() => document.getElementById('gewerbeanmeldung')?.click()}
                           aria-label="Gewerbeanmeldung hochladen"
                         >
                           <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                           Datei wählen
                         </Button>
                       </div>
                     </div>

                     <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                       <div className="flex flex-col items-center space-y-2">
                         <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                          <h4 className="font-medium">Weitere Zertifikate</h4>
                           <p className="text-sm text-muted-foreground mb-2">
                             ADR-Schein, Fahrmischer-Qualifikation, etc. (Mehrere Dateien möglich)
                           </p>
                          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded mb-3 space-y-1">
                            <p className="font-medium">📋 Erlaubte Formate: JPG/JPEG, PNG, PDF · Max. 5 MB pro Datei</p>
                            <p>📷 Fotos bitte gut lesbar, gerade, ohne Spiegelungen</p>
                            <p>❌ Nicht erlaubt: HEIC/HEIF, ZIP/RAR, DOC/DOCX, EXE u. Ä.</p>
                            <p>🔒 Sicherheit: Dateien werden nicht öffentlich gespeichert; Zugriff nur über kurzlebige, signierte Links</p>
                          </div>
                          {selectedFiles.zertifikate && selectedFiles.zertifikate.length > 0 && (
                            <p className="text-xs text-primary font-medium">
                              ✓ {selectedFiles.zertifikate.length} Datei(en) ausgewählt
                            </p>
                          )}
                          <Input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                            multiple
                            className="hidden"
                            id="zertifikate"
                            onChange={(e) => handleFileChange('zertifikate', e.target.files)}
                          />
                         <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onClick={() => document.getElementById('zertifikate')?.click()}
                           aria-label="Zertifikate hochladen"
                         >
                           <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                           Dateien wählen
                         </Button>
                       </div>
                     </div>

                     {/* File Validation Results */}
                     {fileErrors.length > 0 && (
                       <div className="bg-muted/50 p-4 rounded-lg">
                         <h5 className="font-medium mb-2">Datei-Validierung:</h5>
                         <div className="text-sm space-y-1">
                           {fileErrors.map((error, index) => (
                             <p key={index} className={error.includes('✓ OK') ? 'text-green-600' : 'text-destructive'}>
                               {error}
                             </p>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>

                    <div>
                      <Label htmlFor="beschreibung">Beschreibung / Zusätzliche Informationen</Label>
                      <Textarea
                        id="beschreibung"
                        value={formData.beschreibung}
                        onChange={(e) => handleInputChange('beschreibung', e.target.value)}
                        rows={4}
                        placeholder="Beschreiben Sie Ihre Erfahrungen, besonderen Qualifikationen oder Präferenzen..."
                      />
                    </div>

                   {/* Einverständniserklärungen */}
                   <div className="space-y-3 border-t pt-6">
                     <div className="flex items-start space-x-2">
                       <Checkbox id="datenschutz" required />
                        <Label htmlFor="datenschutz" className="text-sm leading-relaxed">
                          Ich stimme der Verarbeitung meiner Daten gemäß der{" "}
                          <Link to="/datenschutz" className="text-primary underline decoration-primary/50 hover:decoration-primary">
                            Datenschutzerklärung
                          </Link>{" "}
                          zu. *
                        </Label>
                     </div>
                     
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="vermittlungszustimmung"
                          checked={formData.vermittlungszustimmung}
                          onCheckedChange={(checked) => handleInputChange('vermittlungszustimmung', checked)}
                          required 
                        />
                        <Label htmlFor="vermittlungszustimmung" className="text-sm leading-relaxed">
                          Die vollständigen Bedingungen zur Zusammenarbeit erhalten Sie nach Ihrer Registrierung per E-Mail. Mit dem Absenden der Registrierung bestätigen Sie, dass Sie als selbstständiger Fahrer tätig sind und die später übermittelten Bedingungen vor Annahme eines Einsatzes prüfen. *
                        </Label>
                      </div>
                      {validationErrors.vermittlungszustimmung && (
                        <p id="vermittlung-error" className="text-sm text-destructive mt-1" role="alert">{validationErrors.vermittlungszustimmung}</p>
                      )}

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="einsatzbereitschaft_bestaetigt"
                          checked={formData.einsatzbereitschaft_bestaetigt}
                          onCheckedChange={(checked) => handleInputChange('einsatzbereitschaft_bestaetigt', checked)}
                          required
                        />
                        <Label htmlFor="einsatzbereitschaft_bestaetigt" className="text-sm leading-relaxed">
                          Ich bestätige, dass ich grundsätzlich einsatzbereit bin und passende Auftragsangebote ernsthaft prüfen möchte. *
                        </Label>
                       </div>
                       {validationErrors.einsatzbereitschaft_bestaetigt && (
                         <p id="einsatzbereitschaft-error" className="text-sm text-destructive mt-1" role="alert">{validationErrors.einsatzbereitschaft_bestaetigt}</p>
                       )}

                       <div className="flex items-start space-x-2">
                         <Checkbox
                           id="gewerbenachweis_bestaetigt"
                           checked={formData.gewerbenachweis_bestaetigt}
                           onCheckedChange={(checked) => handleInputChange('gewerbenachweis_bestaetigt', checked)}
                           required
                         />
                          <Label htmlFor="gewerbenachweis_bestaetigt" className="text-sm leading-relaxed">
                            Ich bestätige, dass ich als selbstständiger Unternehmer tätig bin, über eine Gewerbeanmeldung verfüge und den Gewerbenachweis spätestens mit meiner ersten Rechnung an Fahrerexpress mitsende. *
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          Mir ist bekannt, dass ohne vorliegenden Gewerbenachweis keine Auszahlung und keine weitere Zusammenarbeit erfolgen kann.
                        </p>
                        {validationErrors.gewerbenachweis_bestaetigt && (
                          <p id="gewerbenachweis-error" className="text-sm text-destructive mt-1" role="alert">{validationErrors.gewerbenachweis_bestaetigt}</p>
                        )}
                    </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                    aria-label="Registrierung abschließen"
                  >
                    {isLoading ? "Registrierung läuft..." : "Jetzt registrieren"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-xl">
                  Häufig gestellte Fragen zur Fahrer-Registrierung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h4 className="font-semibold mb-2">Können sich Fahrer aus EU-Ländern registrieren?</h4>
                    <p className="text-sm text-muted-foreground">
                      Ja, Fahrer aus allen EU-Staaten und dem Europäischen Wirtschaftsraum (EWR) können sich bei uns registrieren. 
                      Die Fahrerlaubnis muss in Deutschland anerkannt sein oder entsprechend umgeschrieben werden.
                    </p>
                  </div>
                  <div className="border-b pb-4">
                    <h4 className="font-semibold mb-2">Wie schnell kann ich nach der Registrierung Aufträge erhalten?</h4>
                    <p className="text-sm text-muted-foreground">
                      Nach erfolgreicher Prüfung Ihrer Unterlagen können Sie für passende Auftragsangebote berücksichtigt werden.
                      Eine bestimmte Bearbeitungs- oder Einsatzzeit wird nicht zugesagt.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Muss ich ein Gewerbe anmelden?</h4>
                    <p className="text-sm text-muted-foreground">
                      Ja, für die selbstständige Tätigkeit als Kraftfahrer ist eine Gewerbeanmeldung erforderlich. 
                      Für steuerliche Fragen wenden Sie sich bitte an einen Steuerberater. Allgemeine organisatorische Hinweise zur Registrierung können wir geben.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default FahrerRegistrierung;
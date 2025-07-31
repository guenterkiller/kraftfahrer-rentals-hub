import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const FahrerRegistrierung = () => {
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
  });

  // File upload states
  const [selectedFiles, setSelectedFiles] = useState<{
    fuehrerschein: FileList | null,
    fahrerkarte: FileList | null,
    zertifikate: FileList | null
  }>({
    fuehrerschein: null,
    fahrerkarte: null,
    zertifikate: null
  });

  const fuehrerscheinklassen = ["B", "C1", "C", "CE", "D1", "D", "DE"];
  const spezialisierungen = [
    "Baustellen-LKW",
    "Fernfahrt",
    "Fahrmischer",
    "Kipper",
    "Kran",
    "Schwertransport",
    "Gefahrgut",
    "Kühlfahrzeuge"
  ];
  const bundeslaender = [
    "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen",
    "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen",
    "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen",
    "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"
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
        if (!value || value.trim() === '') {
          errors.stundensatz = 'Bitte geben Sie Ihren Stundensatz ein';
        } else if (isNaN(Number(value)) || Number(value) <= 0) {
          errors.stundensatz = 'Bitte geben Sie den Stundenlohn als gültige Zahl ein (z.B. 25)';
        }
        break;
      case 'fuehrerscheinklassen':
        if (!value || value.length === 0) {
          errors.fuehrerscheinklassen = 'Bitte wählen Sie mindestens eine Führerscheinklasse aus';
        }
        break;
      case 'erfahrung_jahre':
        if (!value || value.trim() === '') {
          errors.erfahrung_jahre = 'Bitte wählen Sie Ihre Berufserfahrung aus';
        }
        break;
      case 'vermittlungszustimmung':
        if (!value) {
          errors.vermittlungszustimmung = 'Sie müssen der Vermittlungsprovision zustimmen';
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

  const handleFileChange = (field: 'fuehrerschein' | 'fahrerkarte' | 'zertifikate', files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setSelectedFiles(prev => ({
      ...prev,
      [field]: files
    }));

    toast({
      title: "Datei(en) ausgewählt",
      description: `${files.length} Datei(en) für ${field} ausgewählt`,
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
    
    Object.assign(errors, vornameErrors, nachnameErrors, emailErrors, telefonErrors, stundensatzErrors, fuehrerscheinklassenErrors, erfahrungErrors, vermittlungErrors);
    
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

    setIsLoading(true);

    try {

      console.log("Sende Fahrer-Bewerbung über Edge Function...");

      // Upload files to Supabase Storage and get URLs
      const uploadedFiles: { [key: string]: string } = {};
      
      if (selectedFiles.fuehrerschein && selectedFiles.fuehrerschein.length > 0) {
        const fuehrerscheinFiles: string[] = [];
        for (let i = 0; i < selectedFiles.fuehrerschein.length; i++) {
          try {
            const file = selectedFiles.fuehrerschein[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-fuehrerschein_${i + 1}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('driver-documents')
              .upload(fileName, file);
              
            if (uploadError) throw uploadError;
            fuehrerscheinFiles.push(fileName);
          } catch (error) {
            console.error(`Upload Fehler Führerschein ${i + 1}:`, error);
            toast({
              title: "Upload-Fehler",
              description: `Fehler beim Hochladen des Führerscheins ${i + 1}. Formular wird trotzdem übermittelt.`,
              variant: "destructive",
            });
          }
        }
        if (fuehrerscheinFiles.length > 0) {
          uploadedFiles.fuehrerschein = fuehrerscheinFiles.join(',');
        }
      }

      if (selectedFiles.fahrerkarte && selectedFiles.fahrerkarte.length > 0) {
        const fahrerkarteFiles: string[] = [];
        for (let i = 0; i < selectedFiles.fahrerkarte.length; i++) {
          try {
            const file = selectedFiles.fahrerkarte[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-fahrerkarte_${i + 1}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('driver-documents')
              .upload(fileName, file);
              
            if (uploadError) throw uploadError;
            fahrerkarteFiles.push(fileName);
          } catch (error) {
            console.error(`Upload Fehler Fahrerkarte ${i + 1}:`, error);
            toast({
              title: "Upload-Fehler", 
              description: `Fehler beim Hochladen der Fahrerkarte ${i + 1}. Formular wird trotzdem übermittelt.`,
              variant: "destructive",
            });
          }
        }
        if (fahrerkarteFiles.length > 0) {
          uploadedFiles.fahrerkarte = fahrerkarteFiles.join(',');
        }
      }

      if (selectedFiles.zertifikate && selectedFiles.zertifikate.length > 0) {
        const zertifikatFiles: string[] = [];
        for (let i = 0; i < selectedFiles.zertifikate.length; i++) {
          try {
            const file = selectedFiles.zertifikate[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-zertifikat_${i + 1}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('driver-documents')
              .upload(fileName, file);
              
            if (uploadError) throw uploadError;
            zertifikatFiles.push(fileName);
          } catch (error) {
            console.error(`Upload Fehler Zertifikat ${i + 1}:`, error);
          }
        }
        if (zertifikatFiles.length > 0) {
          uploadedFiles.zertifikate = zertifikatFiles.join(',');
        }
      }

      // Verwende die Edge Function für Fahrer-Bewerbungen
      const response = await supabase.functions.invoke('fahrerwerden', {
        body: {
          name: `${formData.vorname} ${formData.nachname}`.trim(),
          email: formData.email,
          phone: formData.telefon,
          company: formData.adresse ? `${formData.adresse}, ${formData.plz} ${formData.ort}`.trim() : null,
          message: formData.verfuegbarkeit || null,
          description: formData.beschreibung || null,
          license_classes: formData.fuehrerscheinklassen,
          experience: formData.erfahrung_jahre || null,
          specializations: formData.spezialisierungen,
          regions: formData.verfuegbare_regionen,
          hourly_rate: formData.stundensatz ? `${formData.stundensatz} €` : null,
          uploaded_files: uploadedFiles
        }
      });

      // Check for specific status codes and handle them appropriately
      if (response.error) {
        console.error("Edge Function Fehler:", response.error);
        
        // Handle duplicate email error specifically
        if (response.error.message && response.error.message.includes('bereits registriert')) {
          toast({
            title: "E-Mail bereits registriert",
            description: "Ein Fahrer mit dieser E-Mail-Adresse ist bereits registriert.",
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(response.error.message || "Fehler beim Speichern der Bewerbung");
      }

      console.log("Fahrer-Bewerbung erfolgreich gespeichert:", response.data);

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
      });
      setSelectedFiles({
        fuehrerschein: null,
        fahrerkarte: null,
        zertifikate: null
      });
      setValidationErrors({});

    } catch (error: any) {
      console.error("Fehler beim Senden:", error);
      toast({
        title: "Fehler bei der Registrierung",
        description: error.message || "Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.",
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

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Fahrer-Registrierung bei Fahrerexpress
                </CardTitle>
                <p className="text-center text-muted-foreground">
                  Registrieren Sie sich als selbständiger Kraftfahrer und werden Sie Teil unseres Netzwerks
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        <p className="text-sm text-destructive mt-1">{validationErrors.vorname}</p>
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
                        <p className="text-sm text-destructive mt-1">{validationErrors.nachname}</p>
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
                        <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>
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
                        <p className="text-sm text-destructive mt-1">{validationErrors.telefon}</p>
                      )}
                    </div>
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
                  <div>
                    <Label>Führerscheinklassen *</Label>
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mt-2">
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
                      <p className="text-sm text-destructive mt-1">{validationErrors.fuehrerscheinklassen}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="erfahrung">Berufserfahrung (Jahre) *</Label>
                    <Select 
                      value={formData.erfahrung_jahre} 
                      onValueChange={(value) => handleInputChange('erfahrung_jahre', value)}
                    >
                      <SelectTrigger className={validationErrors.erfahrung_jahre ? "border-destructive" : ""}>
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
                      <p className="text-sm text-destructive mt-1">{validationErrors.erfahrung_jahre}</p>
                    )}
                  </div>

                  {/* Spezialisierungen */}
                  <div>
                    <Label>Spezialisierungen</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
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
                  </div>

                  {/* Verfügbare Regionen */}
                  <div>
                    <Label>Verfügbare Bundesländer</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 max-h-40 overflow-y-auto">
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
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stundensatz">Stundensatz (€) *</Label>
                      <Input
                        id="stundensatz"
                        type="number"
                        step="0.50"
                        placeholder="z.B. 25"
                        value={formData.stundensatz}
                        onChange={(e) => handleInputChange('stundensatz', e.target.value)}
                        className={validationErrors.stundensatz ? "border-destructive" : ""}
                        required
                      />
                      {validationErrors.stundensatz && (
                        <p className="text-sm text-destructive mt-1">{validationErrors.stundensatz}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="verfuegbarkeit">Verfügbarkeit</Label>
                      <Select 
                        value={formData.verfuegbarkeit} 
                        onValueChange={(value) => handleInputChange('verfuegbarkeit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Verfügbarkeit wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sofort">Sofort verfügbar</SelectItem>
                          <SelectItem value="1woche">In 1 Woche</SelectItem>
                          <SelectItem value="2wochen">In 2 Wochen</SelectItem>
                          <SelectItem value="1monat">In 1 Monat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                   {/* Dokument-Uploads */}
                   <div className="space-y-4">
                     <Label>Dokumente hochladen (optional)</Label>
                     
                     <div className="grid md:grid-cols-2 gap-4">
                       <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                         <div className="flex flex-col items-center space-y-2">
                           <FileText className="h-8 w-8 text-muted-foreground" />
                            <h4 className="font-medium">Führerschein</h4>
                             <p className="text-sm text-muted-foreground">
                               Laden Sie eine Kopie Ihres Führerscheins hoch (mehrere Dateien möglich)
                             </p>
                             {selectedFiles.fuehrerschein && selectedFiles.fuehrerschein.length > 0 && (
                               <p className="text-xs text-primary font-medium">
                                 ✓ {selectedFiles.fuehrerschein.length} Datei(en) ausgewählt
                               </p>
                             )}
                             <Input
                               type="file"
                               accept=".pdf,.jpg,.jpeg,.png"
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
                           >
                             <Upload className="h-4 w-4 mr-2" />
                             Datei wählen
                           </Button>
                         </div>
                       </div>

                       <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                         <div className="flex flex-col items-center space-y-2">
                           <FileText className="h-8 w-8 text-muted-foreground" />
                            <h4 className="font-medium">Fahrerkarte</h4>
                             <p className="text-sm text-muted-foreground">
                               Laden Sie eine Kopie Ihrer Fahrerkarte hoch (mehrere Dateien möglich)
                             </p>
                             {selectedFiles.fahrerkarte && selectedFiles.fahrerkarte.length > 0 && (
                               <p className="text-xs text-primary font-medium">
                                 ✓ {selectedFiles.fahrerkarte.length} Datei(en) ausgewählt
                               </p>
                             )}
                             <Input
                               type="file"
                               accept=".pdf,.jpg,.jpeg,.png"
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
                           >
                             <Upload className="h-4 w-4 mr-2" />
                             Datei wählen
                           </Button>
                         </div>
                       </div>
                     </div>

                     <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                       <div className="flex flex-col items-center space-y-2">
                         <FileText className="h-8 w-8 text-muted-foreground" />
                         <h4 className="font-medium">Weitere Zertifikate</h4>
                          <p className="text-sm text-muted-foreground">
                            ADR-Schein, Kranführerschein, etc. (Mehrere Dateien möglich)
                          </p>
                          {selectedFiles.zertifikate && selectedFiles.zertifikate.length > 0 && (
                            <p className="text-xs text-primary font-medium">
                              ✓ {selectedFiles.zertifikate.length} Datei(en) ausgewählt
                            </p>
                          )}
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
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
                         >
                           <Upload className="h-4 w-4 mr-2" />
                           Dateien wählen
                         </Button>
                       </div>
                     </div>
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
                         <Link to="/impressum" className="text-primary hover:underline">
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
                          Ich bin selbstständig tätig und stimme der Vermittlungsprovision von 15 % pro vermitteltem Einsatz zu. *{" "}
                          <Link to="/vermittlung" className="text-primary hover:underline">
                            Mehr Informationen
                          </Link>
                        </Label>
                      </div>
                      {validationErrors.vermittlungszustimmung && (
                        <p className="text-sm text-destructive mt-1">{validationErrors.vermittlungszustimmung}</p>
                      )}
                    </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Registrierung läuft..." : "Jetzt registrieren"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FahrerRegistrierung;
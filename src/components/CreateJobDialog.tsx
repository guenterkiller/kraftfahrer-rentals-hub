import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateJobDialogProps {
  open: boolean;
  onClose: () => void;
  onJobCreated: (jobId: string) => void;
}

// Fahrzeugtyp / Einsatzart – nur Beschreibung, KEINE Preise
const FAHRZEUGTYP_OPTIONS = [
  "LKW CE",
  "7,5-t-Lkw",
  "BE / Anhänger",
  "Autotransporter geschlossen",
  "Autotransporter offen",
  "Eventcontainer / Spezialfahrzeug",
  "Baumaschine",
  "Fahrmischer",
  "Sonstiger Fahrereinsatz",
];

// Tarife – exakt analog zur Seite „Preise & Ablauf"
type TarifOption = {
  type: string;
  label: string;
  netto: number | null;
  unit: string;
};

const TARIF_OPTIONS: TarifOption[] = [
  { type: "lkw_ce_tag",        label: "LKW-Fahrer CE – 349 € netto pro Einsatztag",            netto: 349,  unit: "tag" },
  { type: "lkw_ce_woche",      label: "LKW-Fahrer CE – Wochenpreis – 1.645 € netto pro Woche", netto: 1645, unit: "woche" },
  { type: "fernfahrer_tag",    label: "Fernfahrer-Pauschale – 450 € netto pro Einsatztag",     netto: 450,  unit: "tag" },
  { type: "baumaschine_tag",   label: "Baumaschinenführer / Mischmeister – 489 € netto pro Einsatztag", netto: 489, unit: "tag" },
  { type: "individuell",       label: "Individuell / nach Absprache",                          netto: null, unit: "individuell" },
];

const ALLOWED_MIME = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function CreateJobDialog({ open, onClose, onJobCreated }: CreateJobDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Customer data
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [company, setCompany] = useState("");
  const [customerStreet, setCustomerStreet] = useState("");
  const [customerHouseNumber, setCustomerHouseNumber] = useState("");
  const [customerPostalCode, setCustomerPostalCode] = useState("");
  const [customerCity, setCustomerCity] = useState("");

  // Job data
  const [einsatzort, setEinsatzort] = useState("");
  const [zeitraum, setZeitraum] = useState("");
  const [fahrzeugtyp, setFahrzeugtyp] = useState("");
  const [tarifType, setTarifType] = useState("");
  const [fuehrerscheinklasse, setFuehrerscheinklasse] = useState("C+E");
  const [besonderheiten, setBesonderheiten] = useState("");
  const [nachricht, setNachricht] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const resetForm = () => {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCompany("");
    setCustomerStreet("");
    setCustomerHouseNumber("");
    setCustomerPostalCode("");
    setCustomerCity("");
    setEinsatzort("");
    setZeitraum("");
    setFahrzeugtyp("");
    setTarifType("");
    setFuehrerscheinklasse("C+E");
    setBesonderheiten("");
    setNachricht("");
    setAttachments([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const accepted: File[] = [];
    const rejected: string[] = [];
    Array.from(files).forEach((f) => {
      if (!ALLOWED_MIME.includes(f.type)) {
        rejected.push(`${f.name}: nur JPG/PNG/PDF`);
      } else if (f.size > MAX_FILE_SIZE) {
        rejected.push(`${f.name}: größer als 10 MB`);
      } else {
        accepted.push(f);
      }
    });
    if (rejected.length > 0) {
      toast({ title: "Einige Dateien abgelehnt", description: rejected.join("\n"), variant: "destructive" });
    }
    setAttachments((prev) => [...prev, ...accepted]);
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateJob = async () => {
    // Basic validation
    if (!customerName || !customerEmail || !customerPhone || !einsatzort || 
        !zeitraum || !fahrzeugtyp || !tarifType || !nachricht) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus (inkl. Fahrzeugtyp und Tarif).",
        variant: "destructive"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      toast({
        title: "Ungültige E-Mail",
        description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        variant: "destructive"
      });
      return;
    }

    // PLZ validation if provided
    if (customerPostalCode && !/^\d{5}$/.test(customerPostalCode)) {
      toast({
        title: "Ungültige PLZ",
        description: "PLZ muss 5-stellig sein.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      const tarif = TARIF_OPTIONS.find((t) => t.type === tarifType);

      // Create job via edge function
      const { data, error } = await supabase.functions.invoke('admin-create-job', {
        body: {
          customerName,
          customerEmail,
          customerPhone,
          company: company || undefined,
          customerStreet: customerStreet || undefined,
          customerHouseNumber: customerHouseNumber || undefined,
          customerPostalCode: customerPostalCode || undefined,
          customerCity: customerCity || undefined,
          einsatzort,
          zeitraum,
          fahrzeugtyp,
          fuehrerscheinklasse,
          besonderheiten: besonderheiten || undefined,
          nachricht,
          tarifType: tarif?.type,
          tarifLabel: tarif?.label,
          tarifNetto: tarif?.netto,
          tarifUnit: tarif?.unit,
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Fehler beim Erstellen des Auftrags');
      }

      const newJobId: string = data.jobId;

      // Upload attachments (if any)
      let uploadedCount = 0;
      let uploadErrors = 0;
      for (const file of attachments) {
        try {
          // Sicheren technischen Dateinamen erzeugen (keine personenbezogenen Daten im Pfad/URL)
          const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/);
          const ext = extMatch ? extMatch[1].toLowerCase() : "bin";
          const uuid = crypto.randomUUID();
          const path = `${newJobId}/${uuid}.${ext}`;
          const technicalName = `${uuid}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from("job-attachments")
            .upload(path, file, { contentType: file.type, upsert: false });
          if (upErr) throw upErr;

          const { error: insErr } = await supabase.from("job_attachments").insert({
            job_id: newJobId,
            filename: technicalName,
            original_filename: file.name,
            filepath: path,
            mime_type: file.type,
            size_bytes: file.size,
          });
          if (insErr) throw insErr;
          uploadedCount++;
        } catch (e: any) {
          console.error("Upload fehlgeschlagen:", file.name, e);
          uploadErrors++;
        }
      }

      toast({
        title: "Auftrag erstellt",
        description:
          `Auftrag für ${customerName} angelegt` +
          (attachments.length > 0 ? ` • Anhänge: ${uploadedCount}/${attachments.length}` : "") +
          (uploadErrors > 0 ? ` (${uploadErrors} Fehler)` : "") +
          ` • Versand erfolgt erst nach Klick auf "Freigeben & an Fahrer senden".`,
      });

      resetForm();
      onJobCreated(newJobId);
      onClose();

    } catch (error: any) {
      console.error('Error creating job:', error);
      toast({
        title: "Fehler beim Erstellen",
        description: error.message || "Auftrag konnte nicht erstellt werden.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="create-job-description">
        <DialogHeader>
          <DialogTitle>Neuen Auftrag anlegen</DialogTitle>
          <p id="create-job-description" className="sr-only">Formular zur Erstellung eines neuen Fahrerauftrags mit Kunden- und Auftragsdaten</p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Customer Data Section */}
          <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-3">Kunde / Auftraggeber</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label htmlFor="customer-name" className="text-sm">Name / Firma *</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Max Mustermann / Firma GmbH"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="company" className="text-sm">Zusätzliche Firmeninfo</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Abteilung, Zusatzinfo..."
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label htmlFor="customer-email" className="text-sm">E-Mail *</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="kontakt@firma.de"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customer-phone" className="text-sm">Telefon *</Label>
                <Input
                  id="customer-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+49 123 456789"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label htmlFor="customer-street" className="text-sm">Straße</Label>
                <Input
                  id="customer-street"
                  value={customerStreet}
                  onChange={(e) => setCustomerStreet(e.target.value)}
                  placeholder="Musterstraße"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customer-house" className="text-sm">Hausnummer</Label>
                <Input
                  id="customer-house"
                  value={customerHouseNumber}
                  onChange={(e) => setCustomerHouseNumber(e.target.value)}
                  placeholder="123"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="customer-postal" className="text-sm">PLZ</Label>
                <Input
                  id="customer-postal"
                  value={customerPostalCode}
                  onChange={(e) => setCustomerPostalCode(e.target.value)}
                  placeholder="12345"
                  pattern="[0-9]{5}"
                  maxLength={5}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customer-city" className="text-sm">Ort</Label>
                <Input
                  id="customer-city"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder="Musterstadt"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Job Data Section */}
          <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-3">Auftragsdaten</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label htmlFor="einsatzort" className="text-sm">Einsatzort *</Label>
                <Input
                  id="einsatzort"
                  value={einsatzort}
                  onChange={(e) => setEinsatzort(e.target.value)}
                  placeholder="Frankfurt am Main"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="zeitraum" className="text-sm">Zeitraum *</Label>
                <Input
                  id="zeitraum"
                  value={zeitraum}
                  onChange={(e) => setZeitraum(e.target.value)}
                  placeholder="2 Wochen ab 01.10.2024"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label htmlFor="fahrzeugtyp" className="text-sm">Fahrzeugtyp *</Label>
                <Select value={fahrzeugtyp} onValueChange={setFahrzeugtyp}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fahrzeugtyp / Einsatzart" />
                  </SelectTrigger>
                  <SelectContent>
                    {FAHRZEUGTYP_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fuehrerscheinklasse" className="text-sm">Führerscheinklasse *</Label>
                <Select value={fuehrerscheinklasse} onValueChange={setFuehrerscheinklasse}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="C+E">C+E</SelectItem>
                    <SelectItem value="C1">C1</SelectItem>
                    <SelectItem value="C1+E">C1+E</SelectItem>
                    <SelectItem value="B">B (Kleinfahrzeuge)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tarif */}
            <div className="mb-3">
              <Label htmlFor="tarif" className="text-sm">Tarif * (entspricht Seite „Preise &amp; Ablauf")</Label>
              <Select value={tarifType} onValueChange={setTarifType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tarif / Preisgrundlage wählen" />
                </SelectTrigger>
                <SelectContent>
                  {TARIF_OPTIONS.map((t) => (
                    <SelectItem key={t.type} value={t.type}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Zusätzlich An- und Abfahrt. Für Sonderfälle „Individuell / nach Absprache" wählen.
              </p>
            </div>

            <div className="mb-3">
              <Label htmlFor="besonderheiten" className="text-sm">Besonderheiten</Label>
              <Textarea
                id="besonderheiten"
                value={besonderheiten}
                onChange={(e) => setBesonderheiten(e.target.value)}
                placeholder="Besondere Anforderungen, Zertifikate, etc."
                rows={2}
                className="mt-1"
              />
            </div>

            <div className="mb-3">
              <Label htmlFor="nachricht" className="text-sm">Detaillierte Beschreibung *</Label>
              <Textarea
                id="nachricht"
                value={nachricht}
                onChange={(e) => setNachricht(e.target.value)}
                placeholder="Detaillierte Beschreibung des Auftrags, Arbeitszeiten, spezielle Anforderungen..."
                rows={4}
                className="mt-1"
              />
            </div>

            {/* Anhänge */}
            <div>
              <Label htmlFor="attachments" className="text-sm">Anhänge (JPG, PNG, PDF – max. 10 MB pro Datei)</Label>
              <Input
                id="attachments"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                multiple
                onChange={(e) => handleFilesSelected(e.target.files)}
                className="mt-1"
              />
              {attachments.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm">
                  {attachments.map((f, i) => (
                    <li key={i} className="flex items-center justify-between bg-white border rounded px-2 py-1">
                      <span className="truncate">{f.name} <span className="text-gray-500">({Math.round(f.size / 1024)} KB)</span></span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        className="text-red-600 text-xs ml-2"
                        aria-label={`Datei ${f.name} entfernen`}
                      >
                        Entfernen
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Anhänge werden privat gespeichert. Versand an Fahrer erfolgt erst nach „Freigeben &amp; an Fahrer senden".
              </p>
            </div>
          </div>

          <div className="p-3 border border-amber-200 bg-amber-50 rounded-lg text-sm text-amber-900">
            ℹ️ Der Auftrag wird zunächst als <strong>Entwurf (pending)</strong> gespeichert. Es wird <strong>keine automatische E-Mail</strong> an Fahrer gesendet. Den Versand starten Sie bewusst über den Button <strong>„Freigeben &amp; an Fahrer senden"</strong> in der Auftragsliste.
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleClose} variant="outline" className="flex-1" aria-label="Abbrechen und Dialog schließen">
              Abbrechen
            </Button>
            <Button 
              onClick={handleCreateJob} 
              disabled={isCreating}
              className="flex-1"
              aria-label="Auftrag als Entwurf speichern"
            >
              {isCreating ? "Speichere..." : "Auftrag speichern (Entwurf)"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
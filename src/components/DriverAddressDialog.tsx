import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DriverAddressDriver {
  id: string;
  vorname?: string | null;
  nachname?: string | null;
  strasse?: string | null;
  hausnummer?: string | null;
  plz?: string | null;
  ort?: string | null;
  land?: string | null;
}

interface DriverAddressDialogProps {
  open: boolean;
  onClose: () => void;
  driver: DriverAddressDriver | null;
  onSaved: () => void;
}

/**
 * Admin-Dialog zum Nachtragen/Korrigieren der Fahreradresse.
 * Schreibt ausschließlich in public.fahrer_profile für den aktiv gewählten Fahrer.
 * Die Adminprüfung erfolgt serverseitig über die RLS-Policy
 * `fahrer_profile_admin_update` (is_admin_user(auth.uid())).
 */
export function DriverAddressDialog({ open, onClose, driver, onSaved }: DriverAddressDialogProps) {
  const [strasse, setStrasse] = useState("");
  const [hausnummer, setHausnummer] = useState("");
  const [plz, setPlz] = useState("");
  const [ort, setOrt] = useState("");
  const [land, setLand] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && driver) {
      setStrasse(driver.strasse ?? "");
      setHausnummer(driver.hausnummer ?? "");
      setPlz(driver.plz ?? "");
      setOrt(driver.ort ?? "");
      setLand(driver.land ?? "");
    }
  }, [open, driver]);

  const handleSave = async () => {
    if (!driver) return;

    const s = strasse.trim();
    const h = hausnummer.trim();
    const p = plz.trim();
    const o = ort.trim();
    const l = land.trim();

    if (!s || !h || !p || !o || !l) {
      toast({
        title: "Angaben unvollständig",
        description: "Bitte Straße, Hausnummer, PLZ, Ort und Land ausfüllen.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("fahrer_profile")
        .update({
          strasse: s,
          hausnummer: h,
          plz: p,
          ort: o,
          land: l,
          // Legacy-Feld: automatisch aus Straße + Hausnummer gebildet
          adresse: `${s} ${h}`,
        })
        .eq("id", driver.id);

      if (error) throw error;

      toast({
        title: "Adresse gespeichert",
        description: `${s} ${h}, ${p} ${o}, ${l}`,
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error("Fehler beim Speichern der Fahreradresse:", err);
      toast({
        title: "Speichern fehlgeschlagen",
        description: err instanceof Error ? err.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const driverName = driver ? `${driver.vorname ?? ""} ${driver.nachname ?? ""}`.trim() : "";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adresse bearbeiten{driverName ? ` – ${driverName}` : ""}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="driver-strasse">Straße</Label>
              <Input id="driver-strasse" value={strasse} onChange={(e) => setStrasse(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="driver-hausnummer">Hausnummer</Label>
              <Input id="driver-hausnummer" value={hausnummer} onChange={(e) => setHausnummer(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label htmlFor="driver-plz">PLZ</Label>
              <Input id="driver-plz" value={plz} onChange={(e) => setPlz(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label htmlFor="driver-ort">Ort</Label>
              <Input id="driver-ort" value={ort} onChange={(e) => setOrt(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="driver-land">Land</Label>
            <Input id="driver-land" value={land} onChange={(e) => setLand(e.target.value)} placeholder="Deutschland" />
          </div>
          <p className="text-xs text-muted-foreground">
            Das Legacy-Feld „adresse“ wird automatisch aus Straße und Hausnummer gebildet.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Speichern…" : "Adresse speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DriverAddressDialog;

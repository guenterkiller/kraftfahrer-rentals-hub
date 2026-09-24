import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sanitizeEmail, isValidEmail } from "@/lib/emailSanitize";

export interface DriverAddressDriver {
  id: string;
  vorname?: string | null;
  nachname?: string | null;
  email?: string | null;
  telefon?: string | null;
  strasse?: string | null;
  hausnummer?: string | null;
  plz?: string | null;
  ort?: string | null;
  land?: string | null;
  fuehrerscheinklassen?: string[] | null;
}

interface DriverAddressDialogProps {
  open: boolean;
  onClose: () => void;
  driver: DriverAddressDriver | null;
  onSaved: () => void;
}

/**
 * Admin-Dialog zum Bearbeiten der Fahrerstammdaten
 * (Persönliche Daten, Kontaktdaten, Adresse, Fahrerdaten).
 * Schreibt ausschließlich in public.fahrer_profile für den aktiv gewählten Fahrer.
 * Status, Sperrung, Deaktivierung, Dokumente und Zuweisungen bleiben unberührt.
 * Die Adminprüfung erfolgt serverseitig über die RLS-Policy
 * `fahrer_profile_admin_update` (is_admin_user(auth.uid())).
 */
export function DriverAddressDialog({ open, onClose, driver, onSaved }: DriverAddressDialogProps) {
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [strasse, setStrasse] = useState("");
  const [hausnummer, setHausnummer] = useState("");
  const [plz, setPlz] = useState("");
  const [ort, setOrt] = useState("");
  const [land, setLand] = useState("");
  const [klassen, setKlassen] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && driver) {
      setVorname(driver.vorname ?? "");
      setNachname(driver.nachname ?? "");
      setEmail(driver.email ?? "");
      setTelefon(driver.telefon ?? "");
      setStrasse(driver.strasse ?? "");
      setHausnummer(driver.hausnummer ?? "");
      setPlz(driver.plz ?? "");
      setOrt(driver.ort ?? "");
      setLand(driver.land ?? "");
      setKlassen((driver.fuehrerscheinklassen ?? []).join(", "));
    }
  }, [open, driver]);

  const handleSave = async () => {
    if (!driver) return;

    const v = vorname.trim();
    const n = nachname.trim();
    const e = sanitizeEmail(email);
    const t = telefon.trim();
    const s = strasse.trim();
    const h = hausnummer.trim();
    const p = plz.trim();
    const o = ort.trim();
    const l = land.trim();
    const kl = klassen
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    if (!v || !n || !e || !t) {
      toast({
        title: "Angaben unvollständig",
        description: "Vorname, Nachname, E-Mail und Telefon sind Pflichtfelder.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(e)) {
      toast({
        title: "E-Mail ungültig",
        description: "Bitte eine gültige E-Mail-Adresse eingeben.",
        variant: "destructive",
      });
      return;
    }

    if (!s || !h || !p || !o || !l) {
      toast({
        title: "Adresse unvollständig",
        description: "Bitte Straße, Hausnummer, PLZ, Ort und Land ausfüllen.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const newValues: Record<string, string> = {
        vorname: v, nachname: n, email: e, telefon: t, strasse: s, hausnummer: h,
        plz: p, ort: o, land: l, fuehrerscheinklassen: kl.join(", "),
      };
      const oldValues: Record<string, string> = {
        vorname: driver.vorname ?? "", nachname: driver.nachname ?? "", email: driver.email ?? "",
        telefon: driver.telefon ?? "", strasse: driver.strasse ?? "", hausnummer: driver.hausnummer ?? "",
        plz: driver.plz ?? "", ort: driver.ort ?? "", land: driver.land ?? "",
        fuehrerscheinklassen: (driver.fuehrerscheinklassen ?? []).join(", "),
      };

      const { error } = await supabase
        .from("fahrer_profile")
        .update({
          vorname: v,
          nachname: n,
          email: e,
          telefon: t,
          strasse: s,
          hausnummer: h,
          plz: p,
          ort: o,
          land: l,
          fuehrerscheinklassen: kl,
          // Legacy-Feld: automatisch aus Straße + Hausnummer gebildet
          adresse: `${s} ${h}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", driver.id);

      if (error) throw error;

      // Änderungsprotokoll in admin_actions (ein Eintrag pro geändertem Feld)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const ts = new Date().toISOString();
        const rows = Object.keys(newValues)
          .filter((k) => oldValues[k] !== newValues[k])
          .map((k) => ({
            action: "driver_profile_update",
            admin_email: user?.email ?? null,
            note: JSON.stringify({
              fahrer_id: driver.id,
              zeitpunkt: ts,
              feld: k,
              alt: oldValues[k],
              neu: newValues[k],
            }),
          }));
        if (rows.length > 0) {
          const { error: logErr } = await supabase.from("admin_actions").insert(rows);
          if (logErr) console.warn("Änderungsprotokoll fehlgeschlagen:", logErr.message);
        }
      } catch (logErr) {
        console.warn("Änderungsprotokoll fehlgeschlagen:", logErr);
      }

      // Newsletter-/Abmeldestatus: liegt auf dem Fahrerprofil selbst
      // (email_opt_out, unsubscribed_at) und wird hier nicht angefasst –
      // er bleibt damit bei einer E-Mail-Änderung automatisch erhalten.
      // Zusätzlich existiert die alte, rein E-Mail-basierte Jobalarm-Liste.
      let listHint = "";
      const oldEmail = (driver.email ?? "").trim();
      if (oldEmail && oldEmail.toLowerCase() !== e.toLowerCase()) {
        try {
          // Nur umziehen, wenn die alte Adresse eindeutig zu diesem Fahrer gehört.
          const { data: otherDrivers } = await supabase
            .from("fahrer_profile")
            .select("id")
            .ilike("email", oldEmail)
            .neq("id", driver.id);

          if (!otherDrivers || otherDrivers.length === 0) {
            const { data: oldEntries } = await supabase
              .from("jobalarm_fahrer")
              .select("id")
              .ilike("email", oldEmail);

            if (oldEntries && oldEntries.length > 0) {
              const { data: newEntries } = await supabase
                .from("jobalarm_fahrer")
                .select("id")
                .ilike("email", e);

              if (!newEntries || newEntries.length === 0) {
                await supabase.from("jobalarm_fahrer").insert({ email: e.toLowerCase() });
              }
              await supabase
                .from("jobalarm_fahrer")
                .delete()
                .in("id", oldEntries.map((r) => r.id));
              listHint = " Jobalarm-Eintrag auf die neue Adresse übertragen.";
            }
          } else {
            listHint = " Alte Adresse wird von einem weiteren Fahrer genutzt – Jobalarm-Liste unverändert.";
          }
        } catch (listErr) {
          console.error("Jobalarm-Liste konnte nicht umgezogen werden:", listErr);
          listHint = " Hinweis: Jobalarm-Liste konnte nicht automatisch angepasst werden.";
        }
      }

      toast({
        title: "Fahrerdaten gespeichert",
        description: `${v} ${n} – ${s} ${h}, ${p} ${o}, ${l}.${listHint}`,
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error("Fehler beim Speichern der Fahrerdaten:", err);
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
  const emailChanged = Boolean(driver && email.trim() && email.trim() !== (driver.email ?? ""));

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="font-semibold uppercase tracking-wide text-[10px] text-muted-foreground pt-1">
      {children}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fahrerdaten bearbeiten{driverName ? ` – ${driverName}` : ""}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <SectionTitle>Persönliche Daten</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="driver-vorname">Vorname</Label>
              <Input id="driver-vorname" value={vorname} onChange={(e) => setVorname(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="driver-nachname">Nachname</Label>
              <Input id="driver-nachname" value={nachname} onChange={(e) => setNachname(e.target.value)} />
            </div>
          </div>

          <SectionTitle>Kontaktdaten</SectionTitle>
          <div className="space-y-1">
            <Label htmlFor="driver-email">E-Mail-Adresse</Label>
            <Input id="driver-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="driver-telefon">Telefonnummer</Label>
            <Input id="driver-telefon" value={telefon} onChange={(e) => setTelefon(e.target.value)} />
          </div>
          {emailChanged && (
            <p className="text-xs text-amber-700">
              Hinweis: Die E-Mail wird nur im Fahrerprofil geändert. Bereits hochgeladene Dokumente und
              Zuweisungen bleiben unverändert erreichbar. Newsletter-/Abmelde-Einträge zur alten Adresse
              bleiben bestehen.
            </p>
          )}

          <SectionTitle>Adresse</SectionTitle>
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

          <SectionTitle>Fahrerdaten</SectionTitle>
          <div className="space-y-1">
            <Label htmlFor="driver-klassen">Führerscheinklassen</Label>
            <Input
              id="driver-klassen"
              value={klassen}
              onChange={(e) => setKlassen(e.target.value)}
              placeholder="z. B. C, CE, C1E"
            />
            <p className="text-xs text-muted-foreground">Mehrere Klassen mit Komma trennen.</p>
          </div>

          <p className="text-xs text-muted-foreground">
            Das Legacy-Feld „adresse“ wird automatisch aus Straße und Hausnummer gebildet. Status, Sperrung
            und Deaktivierung werden hier nicht verändert; es werden keine E-Mails versendet.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Speichern…" : "Fahrerdaten speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DriverAddressDialog;

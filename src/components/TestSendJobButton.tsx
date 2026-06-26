import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

const DEFAULT_TEST_EMAIL = "guenter.killer@t-online.de";

interface DriverOption {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
}

interface TestSendJobButtonProps {
  jobId: string;
  size?: "sm" | "default";
  className?: string;
}

export function TestSendJobButton({ jobId, size = "sm", className }: TestSendJobButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingDrivers(true);
    supabase
      .from("fahrer_profile")
      .select("id, vorname, nachname, email")
      .eq("status", "approved")
      .eq("email_opt_out", false)
      .eq("is_blocked", false)
      .not("email", "is", null)
      .order("nachname", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          toast({ title: "Fahrer konnten nicht geladen werden", description: error.message, variant: "destructive" });
          setDrivers([]);
        } else {
          const list = (data || []) as DriverOption[];
          setDrivers(list);
          // Default-Auswahl: Günter Killer wenn vorhanden
          const killer = list.find((d) => d.email?.toLowerCase() === DEFAULT_TEST_EMAIL);
          setSelectedDriverId(killer?.id || list[0]?.id || "");
        }
        setLoadingDrivers(false);
      });
    return () => { cancelled = true; };
  }, [open, toast]);

  const handleSend = async () => {
    setSending(true);
    try {
      const payload: { jobId: string; driverId?: string; driverEmail?: string } = { jobId };
      if (selectedDriverId) payload.driverId = selectedDriverId;
      else payload.driverEmail = DEFAULT_TEST_EMAIL;

      const { data, error } = await supabase.functions.invoke("send-test-job-invite", { body: payload });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Versand fehlgeschlagen");

      toast({
        title: "Testmail gesendet",
        description: `An ${data.recipient} (Anhänge: ${data.attachments}). Status bleibt pending.`,
      });
      setOpen(false);
    } catch (e: any) {
      toast({ title: "Testversand fehlgeschlagen", description: e?.message || "Unbekannter Fehler", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <span className="inline-flex">
      <Button
        size={size}
        variant="outline"
        className={`text-purple-700 border-purple-300 hover:bg-purple-50 ${className || ""}`}
        onClick={() => setOpen(true)}
      >
        <Send className="h-4 w-4 mr-1" />
        Testmail senden
      </Button>

      <Dialog open={open} onOpenChange={(o) => !sending && setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auftrag testweise an einen Fahrer senden</DialogTitle>
            <DialogDescription>
              Es wird nur eine einzige Mail an den ausgewählten Fahrer gesendet.
              Der Auftragsstatus bleibt <strong>pending</strong> – kein Broadcast.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="test-driver">Testempfänger (nur approved, nicht gesperrt, nicht abgemeldet)</Label>
            <Select value={selectedDriverId} onValueChange={setSelectedDriverId} disabled={loadingDrivers || drivers.length === 0}>
              <SelectTrigger id="test-driver">
                <SelectValue placeholder={loadingDrivers ? "Lade Fahrer…" : "Fahrer auswählen"} />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.nachname}, {d.vorname} – {d.email}
                    {d.email?.toLowerCase() === DEFAULT_TEST_EMAIL ? "  ⭐" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Standard-Testempfänger: <code>{DEFAULT_TEST_EMAIL}</code> (wird automatisch vorausgewählt, wenn vorhanden).
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>Abbrechen</Button>
            <Button onClick={handleSend} disabled={sending || (!selectedDriverId && drivers.length === 0)}>
              {sending ? "Sende…" : "Testmail jetzt senden"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </span>
  );
}
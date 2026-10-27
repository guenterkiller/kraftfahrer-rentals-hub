import { useCallback, useEffect, useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const CONFIRM_TEXT = "TESTDATEN LÖSCHEN";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type Kind = "driver" | "job";
type Row = { id: string; kind: Kind; name: string; email: string; created_at: string; status: string | null };
type Preview = {
  name: string; email: string; blocked: string | null; archivable?: boolean; status?: string;
  counts: Record<string, number>; files: Array<{ bucket: string; path: string }>;
};

const countLabels: Record<string, string> = {
  vertragsentscheidungen: "Vertragsentscheidungen", vertragslinks: "Vertragslinks", angebote: "Angebote",
  zuteilungen: "Zuteilungen", annahmen: "Annahmen", unterlagen: "Unterlagen", anhaenge: "Anhänge",
};

async function callPurge(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("admin-purge-test-data", { body });
  if (error) {
    let detail = error.message;
    if (error instanceof FunctionsHttpError) {
      try { const j = await error.context.json(); detail = j?.error || detail; return { ok: false, ...j, error: detail }; } catch { /* ignore */ }
    }
    return { ok: false, error: detail };
  }
  return data;
}

export function TestDataCleanup() {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Array<{ id: string; email: string; created_at: string }>>([]);
  const [newAddress, setNewAddress] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Row | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [a, d, j] = await Promise.all([
      db.from("test_identities").select("id,email,created_at").order("email"),
      db.from("fahrer_profile").select("id,vorname,nachname,email,created_at,status").eq("is_test", true).order("created_at", { ascending: false }),
      db.from("job_requests").select("id,customer_name,company,customer_email,created_at,status").eq("is_test", true).order("created_at", { ascending: false }),
    ]);
    setAddresses(a.data ?? []);
    setRows([
      ...(d.data ?? []).map((r: any) => ({ id: r.id, kind: "driver" as const, name: `${r.vorname} ${r.nachname}`, email: r.email, created_at: r.created_at, status: r.status })),
      ...(j.data ?? []).map((r: any) => ({ id: r.id, kind: "job" as const, name: r.company || r.customer_name, email: r.customer_email, created_at: r.created_at, status: r.status })),
    ]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addAddress = async () => {
    const email = newAddress.trim().toLowerCase();
    if (!email) return;
    const { error } = await db.from("test_identities").insert({ email });
    if (error) toast({ title: "Adresse nicht gespeichert", description: error.message, variant: "destructive" });
    else { setNewAddress(""); toast({ title: "Test-Adresse hinzugefügt", description: "Gilt nur für künftig neu angelegte Datensätze." }); load(); }
  };

  const removeAddress = async (id: string, email: string) => {
    if (!window.confirm(`Test-Adresse ${email} entfernen? Bereits gekennzeichnete Datensätze können dann nicht mehr gelöscht werden.`)) return;
    const { error } = await db.from("test_identities").delete().eq("id", id);
    if (error) toast({ title: "Entfernen fehlgeschlagen", description: error.message, variant: "destructive" });
    else load();
  };

  const open = async (row: Row) => {
    setActive(row); setPreview(null); setConfirmEmail(""); setConfirmText("");
    const res = await callPurge({ mode: "preview", kind: row.kind, id: row.id });
    if (!res?.ok) { toast({ title: "Prüfung fehlgeschlagen", description: res?.error, variant: "destructive" }); setActive(null); return; }
    setPreview(res.preview);
  };

  const run = async (mode: "purge" | "archive") => {
    if (!active) return;
    setBusy(true);
    const res = await callPurge({ mode, kind: active.kind, id: active.id, confirmEmail, confirmText });
    setBusy(false);
    if (res?.ok) {
      toast({ title: mode === "purge" ? "Testdaten vollständig gelöscht" : "Testauftrag archiviert (ohne E-Mail)",
        description: mode === "purge" ? `${active.name} wurde vollständig entfernt.` : `${active.name} ist jetzt storniert.` });
      setActive(null); load();
    } else {
      toast({ title: res?.partial ? "Teilweise bereinigt – bitte wiederholen" : "Nicht ausgeführt",
        description: res?.error || "Unbekannter Fehler", variant: "destructive" });
      load();
    }
  };

  const emailOk = preview && confirmEmail.trim().toLowerCase() === preview.email.trim().toLowerCase();

  return (
    <Card className="mt-6">
      <CardHeader><CardTitle>Testdaten bereinigen</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-2">
          <h3 className="font-semibold">Eigene Test-E-Mail-Adressen</h3>
          <p className="text-sm text-muted-foreground">
            Nur Fahrerprofile und Kundenanfragen, die <strong>nach</strong> dem Eintragen mit einer dieser Adressen neu angelegt werden, erhalten das Testkennzeichen. Bestehende Datensätze werden nie nachträglich gekennzeichnet.
          </p>
          <ul className="space-y-1">
            {addresses.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
                <span>{a.email}</span>
                <Button size="sm" variant="outline" onClick={() => removeAddress(a.id, a.email)}>Entfernen</Button>
              </li>
            ))}
            {!addresses.length && !loading && <li className="text-sm text-muted-foreground">Keine Adressen hinterlegt.</li>}
          </ul>
          <div className="flex gap-2">
            <Input type="email" placeholder="test@beispiel.de" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} aria-label="Neue Test-Adresse" />
            <Button onClick={addAddress}>Hinzufügen</Button>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold">Gekennzeichnete Testdatensätze</h3>
          {loading ? <p className="text-sm">Wird geladen …</p> : !rows.length ? (
            <p className="text-sm text-muted-foreground">Keine gekennzeichneten Testdatensätze vorhanden.</p>
          ) : (
            <ul className="space-y-2">
              {rows.map((r) => (
                <li key={r.kind + r.id} className="flex flex-wrap items-center justify-between gap-2 rounded border p-2 text-sm">
                  <span>
                    <strong>{r.kind === "driver" ? "Fahrerprofil" : "Kundenanfrage"}:</strong> {r.name} ({r.email}) – angelegt {new Date(r.created_at).toLocaleDateString("de-DE")}{r.status ? `, Status ${r.status}` : ""}
                  </span>
                  <Button size="sm" variant="destructive" onClick={() => open(r)}>Prüfen und bereinigen</Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </CardContent>

      <Dialog open={!!active} onOpenChange={(o) => { if (!o && !busy) setActive(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Testdaten bereinigen: {active?.name}</DialogTitle>
            <DialogDescription>Es werden keine E-Mails versendet.</DialogDescription>
          </DialogHeader>
          {!preview ? <p className="text-sm">Prüfung läuft …</p> : (
            <div className="space-y-3 text-sm">
              <p>Mitgelöscht würden:</p>
              <ul className="list-disc pl-5">
                {Object.entries(preview.counts).map(([k, v]) => <li key={k}>{countLabels[k] ?? k}: {v}</li>)}
                <li>Gespeicherte Dateien: {preview.files.length}</li>
              </ul>
              {preview.blocked && (
                <p className="rounded border border-destructive p-2 text-destructive"><strong>Endgültige Löschung nicht zulässig:</strong> {preview.blocked}</p>
              )}
              {(!preview.blocked || preview.archivable) && (
                <div className="space-y-2">
                  <Label htmlFor="tdc-email">E-Mail-Adresse des Datensatzes zur Bestätigung</Label>
                  <Input id="tdc-email" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} autoComplete="off" />
                  {!preview.blocked && (<>
                    <Label htmlFor="tdc-text">Bitte „{CONFIRM_TEXT}" eintippen</Label>
                    <Input id="tdc-text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" />
                  </>)}
                </div>
              )}
              {preview.blocked && !preview.archivable && active?.kind === "job" && (
                <p className="text-muted-foreground">Archivierung ebenfalls nicht möglich (bereits storniert oder Zuteilung/Annahme echter Fahrer vorhanden).</p>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setActive(null)} disabled={busy}>Abbrechen</Button>
            {preview?.blocked && preview.archivable && (
              <Button onClick={() => run("archive")} disabled={busy || !emailOk}>Still archivieren (ohne E-Mail)</Button>
            )}
            {preview && !preview.blocked && (
              <Button variant="destructive" onClick={() => run("purge")} disabled={busy || !emailOk || confirmText !== CONFIRM_TEXT}>
                {busy ? "Wird gelöscht …" : "Testdaten endgültig löschen"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

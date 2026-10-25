import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Data = {
  version: string; title: string; parties: string;
  sections: { title: string; paragraphs: string[] }[];
  accept_text: string; reject_text: string; driver_name: string; expires_at: string;
};

const RESULT: Record<string, string> = {
  accepted: "Vielen Dank. Sie haben den Vermittlungsvertrag verbindlich angenommen. Ihre Zustimmung wurde dokumentiert.",
  rejected: "Ihre Ablehnung wurde dokumentiert. Sie erhalten keine weiteren Vermittlungsangebote und keine Werbe-E-Mails.",
  already_answered: "Ihre Entscheidung wurde bereits erfasst.",
  expired: "Dieser Link ist abgelaufen. Bitte wenden Sie sich an info@kraftfahrer-mieten.com.",
  invalid: "Dieser Link ist ungültig.",
  consent_required: "Bitte bestätigen Sie zuerst die Erklärung.",
  error: "Es ist ein Fehler aufgetreten. Bitte wenden Sie sich an info@kraftfahrer-mieten.com.",
};

async function call(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("driver-contract", { body });
  if (data) return data;
  try { return await (error as any)?.context?.json(); } catch { return { status: "error" }; }
}

export default function FahrerVertrag() {
  useSEO({ title: "Vermittlungsvertrag | Fahrerexpress", description: "Persönlicher Vermittlungsvertrag", noindex: true } as any);
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [data, setData] = useState<Data | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [mode, setMode] = useState<"accept" | "reject" | null>(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) { setResult("invalid"); return; }
    call({ action: "load", token }).then((r) => (r?.status === "ok" ? setData(r) : setResult(r?.status ?? "error")));
  }, [token]);

  const submit = async () => {
    if (!mode || !checked) return setResult("consent_required");
    setBusy(true);
    const r = await call({ action: mode, token, consent: true });
    setBusy(false);
    setResult(r?.status ?? "error");
  };

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      {result && result !== "consent_required" ? (
        <p role="status" className="rounded-md border border-border bg-muted p-4 text-foreground">{RESULT[result] ?? RESULT.error}</p>
      ) : !data ? (
        <p className="text-muted-foreground">Vertrag wird geladen …</p>
      ) : (
        <article className="space-y-5 text-foreground">
          <h1 className="text-2xl font-bold">{data.title}</h1>
          <p className="text-sm text-muted-foreground">Fassung {data.version}{data.driver_name ? ` · für ${data.driver_name}` : ""} · Link gültig bis {new Date(data.expires_at).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })}</p>
          <p>{data.parties}</p>
          {data.sections.map((s) => (
            <section key={s.title}>
              <h2 className="mb-1 text-lg font-semibold">{s.title}</h2>
              {s.paragraphs.map((p, i) => <p key={i} className="mb-1 leading-relaxed">{p}</p>)}
            </section>
          ))}
          <div className="space-y-3 rounded-md border border-border p-4">
            <div className="flex flex-wrap gap-3">
              <Button variant={mode === "accept" ? "default" : "outline"} onClick={() => { setMode("accept"); setChecked(false); }}>Vermittlungsvertrag annehmen</Button>
              <Button variant={mode === "reject" ? "destructive" : "outline"} onClick={() => { setMode("reject"); setChecked(false); }}>Vermittlungsvertrag ablehnen</Button>
            </div>
            {mode && (
              <>
                <div className="flex items-start gap-2">
                  <Checkbox id="contract-consent" checked={checked} onCheckedChange={(v) => setChecked(v === true)} />
                  <Label htmlFor="contract-consent" className="leading-relaxed">{mode === "accept" ? data.accept_text : data.reject_text}</Label>
                </div>
                {result === "consent_required" && <p role="alert" className="text-sm text-destructive">{RESULT.consent_required}</p>}
                <Button disabled={busy} variant={mode === "reject" ? "destructive" : "default"} onClick={submit}>
                  {mode === "accept" ? "Verbindlich annehmen" : "Verbindlich ablehnen"}
                </Button>
              </>
            )}
          </div>
        </article>
      )}
    </main>
  );
}

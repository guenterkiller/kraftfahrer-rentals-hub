import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

type ServerStatus =
  | "accepted"
  | "declined"
  | "already_answered"
  | "expired"
  | "invalid"
  | "error"
  | null;

const RESPOND_URL = `${import.meta.env.VITE_SUPABASE_URL ?? ""}/functions/v1/respond-invite`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

const STATUS_TEXT: Record<Exclude<ServerStatus, null>, string> = {
  accepted:
    "Vielen Dank. Ihre Rückmeldung wurde übermittelt. Fahrerexpress meldet sich zur weiteren Abstimmung.",
  declined: "Vielen Dank. Ihre Rückmeldung wurde übermittelt.",
  already_answered: "Ihre Rückmeldung wurde bereits erfasst.",
  expired: "Dieser Link ist abgelaufen.",
  invalid: "Dieser Link ist ungültig oder wurde nicht gefunden.",
  error:
    "Es ist ein Fehler aufgetreten. Bitte melden Sie sich direkt bei Fahrerexpress: info@kraftfahrer-mieten.com oder 01577 1442285.",
};

export default function FahrerAntwortBestaetigen() {
  useSEO({
    title: "Auftrags-Rückmeldung bestätigen | Fahrerexpress",
    description: "Bitte bestätigen Sie Ihre Rückmeldung zum Auftragsangebot.",
    noindex: true,
  });

  const [params] = useSearchParams();
  const action = (params.get("action") || "").toLowerCase();
  const token = params.get("token") || "";

  const isValidAction = action === "accept" || action === "decline";
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ServerStatus>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const heading = useMemo(() => {
    if (action === "accept") return "Möchten Sie diesen Auftrag wirklich übernehmen?";
    if (action === "decline") return "Möchten Sie diesen Auftrag wirklich ablehnen?";
    return "Rückmeldung bestätigen";
  }, [action]);

  const buttonLabel =
    action === "accept" ? "Ja, Auftrag übernehmen" : "Ja, Auftrag ablehnen";

  async function submit() {
    if (!isValidAction || !token || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(RESPOND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ANON_KEY ? { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } : {}),
        },
        body: JSON.stringify({ action, token }),
      });
      const data = await res.json().catch(() => ({}));
      const status: ServerStatus = (data?.status as ServerStatus) ?? "error";
      setResult(status);
    } catch (_e) {
      setErrorMsg(
        "Verbindung fehlgeschlagen. Bitte versuchen Sie es erneut oder rufen Sie uns an: 01577 1442285.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    // Nichts automatisch ausführen – aktive Bestätigung erforderlich.
  }, []);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-card border border-border rounded-lg shadow-sm p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-foreground mb-4">
          {result ? "Rückmeldung" : heading}
        </h1>

        {!isValidAction || !token ? (
          <p className="text-foreground">
            Dieser Link ist ungültig oder unvollständig. Bitte verwenden Sie den
            Link aus Ihrer E-Mail oder kontaktieren Sie uns.
          </p>
        ) : result ? (
          <p className="text-foreground">{STATUS_TEXT[result]}</p>
        ) : (
          <>
            <p className="text-muted-foreground mb-6">
              Bitte bestätigen Sie Ihre Rückmeldung mit einem Klick. Erst dann
              wird Ihre Antwort gespeichert.
            </p>

            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className={
                action === "accept"
                  ? "w-full inline-flex justify-center items-center px-5 py-3 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
                  : "w-full inline-flex justify-center items-center px-5 py-3 rounded-md bg-gray-700 text-white font-semibold hover:bg-gray-800 disabled:opacity-60"
              }
            >
              {submitting ? "Wird übermittelt…" : buttonLabel}
            </button>

            {errorMsg && (
              <p className="mt-4 text-sm text-destructive">{errorMsg}</p>
            )}
          </>
        )}

        <hr className="my-6 border-border" />
        <div className="text-sm text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">Kontakt Fahrerexpress</p>
          <p>Telefon/WhatsApp: 01577 1442285</p>
          <p>E-Mail: info@kraftfahrer-mieten.com</p>
          <p className="mt-3">
            <Link to="/" className="underline">Zur Startseite</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

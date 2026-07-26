import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import {
  DRIVER_ACCEPT_CHECKBOX_TEXT,
  DRIVER_ACCEPT_LEGAL_HINT,
} from "@/lib/driverConsentText";

const CHECKBOX_TEXT = DRIVER_ACCEPT_CHECKBOX_TEXT;

type ServerStatus =
  | "accepted"
  | "declined"
  | "already_answered"
  | "expired"
  | "invalid"
  | "consent_required"
  | "error"
  | null;

const STATUS_TEXT: Record<Exclude<ServerStatus, null>, string> = {
  accepted:
    "Sie haben den Auftrag zu den dargestellten Einsatzdaten, Einsatztätigkeiten, Anforderungen und Konditionen als selbstständiger Unternehmer angenommen. Fahrerexpress meldet sich zur organisatorischen Bestätigung. Diese Bestätigung wurde revisionssicher dokumentiert.",
  declined: "Vielen Dank. Ihre Rückmeldung wurde übermittelt.",
  already_answered: "Ihre Rückmeldung wurde bereits erfasst.",
  expired: "Dieser Link ist abgelaufen.",
  invalid: "Dieser Link ist ungültig oder wurde nicht gefunden.",
  consent_required:
    "Bitte bestätigen Sie die Pflicht-Checkbox, um den Auftrag verbindlich anzunehmen.",
  error:
    "Es ist ein Fehler aufgetreten. Bitte melden Sie sich direkt bei Fahrerexpress: info@kraftfahrer-mieten.com oder 01577 1442285.",
};

type JobPreview = {
  id: string;
  customer_name: string | null;
  company: string | null;
  einsatzort: string | null;
  zeitraum: string | null;
  fahrzeugtyp: string | null;
  fuehrerscheinklasse: string | null;
  besonderheiten: string | null;
  nachricht: string | null;
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
  const [loading, setLoading] = useState<boolean>(action === "accept");
  const [job, setJob] = useState<JobPreview | null>(null);
  const [driverName, setDriverName] = useState<string>("");
  const [consent, setConsent] = useState<boolean>(false);

  const heading = useMemo(() => {
    if (action === "accept") return "Auftragsangebot – bitte prüfen und verbindlich bestätigen";
    if (action === "decline") return "Möchten Sie diesen Auftrag wirklich ablehnen?";
    return "Rückmeldung bestätigen";
  }, [action]);

  const buttonLabel =
    action === "accept"
      ? "Auftrag zu diesen Bedingungen annehmen"
      : "Ja, Auftrag ablehnen";

  async function submit() {
    if (!isValidAction || !token || submitting) return;
    if (action === "accept" && !consent) {
      setErrorMsg("Bitte bestätigen Sie die Pflicht-Checkbox, um den Auftrag verbindlich anzunehmen.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke("respond-invite", {
        body:
          action === "accept"
            ? { action, token, consent_confirmed: true, checkbox_text: CHECKBOX_TEXT }
            : { action, token },
      });
      if (error) {
        console.error("respond-invite error:", error);
        setResult("error");
        return;
      }
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
    let cancelled = false;
    async function load() {
      if (action !== "accept" || !token) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.functions.invoke("respond-invite", {
          body: { intent: "load", token },
        });
        if (cancelled) return;
        if (error) {
          setResult("error");
          return;
        }
        const status = data?.status;
        if (status === "ready") {
          setJob(data?.job ?? null);
          if (data?.driver?.vorname) {
            setDriverName(
              `${data.driver.vorname} ${data.driver.nachname ?? ""}`.trim(),
            );
          }
        } else if (
          status === "already_answered" ||
          status === "expired" ||
          status === "invalid"
        ) {
          setResult(status);
        } else {
          setResult("error");
        }
      } catch {
        if (!cancelled) setResult("error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [action, token]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-sm p-6 md:p-8">
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
        ) : loading ? (
          <p className="text-muted-foreground">Auftragsdaten werden geladen…</p>
        ) : (
          <>
            {action === "accept" && job && (
              <section
                aria-label="Auftragsdetails"
                className="mb-6 rounded-md border border-border bg-muted/40 p-4 text-sm text-foreground"
              >
                {driverName && (
                  <p className="mb-2">
                    <strong>Fahrer:</strong> {driverName}
                  </p>
                )}
                <dl className="grid grid-cols-1 gap-y-1 md:grid-cols-3 md:gap-x-4">
                  <dt className="font-medium">Auftraggeber</dt>
                  <dd className="md:col-span-2">
                    {job.company || job.customer_name || "–"}
                  </dd>
                  <dt className="font-medium">Einsatzort</dt>
                  <dd className="md:col-span-2">{job.einsatzort || "–"}</dd>
                  <dt className="font-medium">Zeitraum</dt>
                  <dd className="md:col-span-2">{job.zeitraum || "–"}</dd>
                  <dt className="font-medium">Fahrzeugtyp</dt>
                  <dd className="md:col-span-2">{job.fahrzeugtyp || "–"}</dd>
                  <dt className="font-medium">Führerscheinklasse</dt>
                  <dd className="md:col-span-2">{job.fuehrerscheinklasse || "–"}</dd>
                  {job.besonderheiten && (
                    <>
                      <dt className="font-medium">Besonderheiten</dt>
                      <dd className="md:col-span-2 whitespace-pre-line">
                        {job.besonderheiten}
                      </dd>
                    </>
                  )}
                </dl>
                <div className="mt-3">
                  <p className="font-medium">Einsatztätigkeiten und Anforderungen</p>
                  <p className="whitespace-pre-line">{job.nachricht || "–"}</p>
                  <p className="mt-2 text-xs italic text-muted-foreground">
                    Diese Auftragsbeschreibung wurde vom Auftraggeber übermittelt und
                    von Fahrerexpress unverändert weitergegeben.
                  </p>
                </div>
                <div className="mt-3 rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                  <strong>Konditionen:</strong> Wochenend- und Feiertagszuschläge
                  gelten automatisch (Samstag 25 %, Sonn-/Feiertag 50 %). Details
                  zu Vergütung und Vermittlungsanteil ergeben sich aus dem
                  Auftragsangebot vor Einsatzbeginn.
                </div>
              </section>
            )}

            {action === "accept" ? (
              <div className="mb-4">
                <p className="mb-3 text-xs text-muted-foreground">
                  {DRIVER_ACCEPT_LEGAL_HINT}
                </p>
                <label className="flex items-start gap-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>{CHECKBOX_TEXT}</span>
                </label>
              </div>
            ) : (
              <p className="text-muted-foreground mb-6">
                Bitte bestätigen Sie Ihre Rückmeldung mit einem Klick. Erst dann
                wird Ihre Antwort gespeichert.
              </p>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={submitting || (action === "accept" && !consent)}
              className={
                action === "accept"
                  ? "w-full inline-flex justify-center items-center px-5 py-3 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
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

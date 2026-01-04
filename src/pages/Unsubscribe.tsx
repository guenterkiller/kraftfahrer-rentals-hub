import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "already" | "error">("loading");
  const [email, setEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const processUnsubscribe = async () => {
      if (!token) {
        setStatus("error");
        setErrorMessage("Kein gültiger Abmeldelink. Bitte verwenden Sie den Link aus Ihrer E-Mail.");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("customer-unsubscribe", {
          body: null,
          method: "GET",
        });

        // Since invoke doesn't support query params directly, we need to use fetch
        const response = await fetch(
          `https://hxnabnsoffzevqhruvar.supabase.co/functions/v1/customer-unsubscribe?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (result.success) {
          setEmail(result.email || "");
          if (result.message === "Sie wurden bereits abgemeldet") {
            setStatus("already");
          } else {
            setStatus("success");
          }
        } else {
          setStatus("error");
          setErrorMessage(result.error || "Ein Fehler ist aufgetreten.");
        }
      } catch (err: any) {
        console.error("Unsubscribe error:", err);
        setStatus("error");
        setErrorMessage("Verbindungsfehler. Bitte versuchen Sie es später erneut.");
      }
    };

    processUnsubscribe();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-xl shadow-lg p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Abmeldung wird verarbeitet...
            </h1>
            <p className="text-muted-foreground">
              Bitte warten Sie einen Moment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4 w-fit mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Sie wurden erfolgreich vom Kunden-Newsletter abgemeldet.
            </h1>
            <p className="text-muted-foreground mb-4">
              {email && (
                <>
                  Die E-Mail-Adresse <span className="font-medium">{email}</span> erhält keine Kunden-Newsletter mehr.
                </>
              )}
              {!email && "Sie erhalten keine Kunden-Newsletter mehr."}
            </p>
            <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground mb-6">
              <Mail className="h-5 w-5 inline mr-2" />
              Diese Abmeldung betrifft nur den Kunden-Newsletter. Wichtige Auftragsbenachrichtigungen erhalten Sie weiterhin.
            </div>
            <Link 
              to="/" 
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Zur Startseite
            </Link>
          </>
        )}

        {status === "already" && (
          <>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4 w-fit mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Bereits abgemeldet
            </h1>
            <p className="text-muted-foreground mb-4">
              {email && (
                <>
                  <span className="font-medium">{email}</span> ist bereits vom Kunden-Newsletter abgemeldet.
                </>
              )}
              {!email && "Sie sind bereits abgemeldet."}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 w-fit mx-auto mb-4">
              <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Abmeldung fehlgeschlagen
            </h1>
            <p className="text-muted-foreground mb-4">
              {errorMessage}
            </p>
            <p className="text-sm text-muted-foreground">
              Bei Problemen kontaktieren Sie uns unter{" "}
              <a href="mailto:info@fahrerexpress.de" className="text-primary hover:underline">
                info@fahrerexpress.de
              </a>
            </p>
          </>
        )}

        {status !== "success" && (
          <div className="mt-8 pt-6 border-t border-border">
            <Link 
              to="/" 
              className="text-primary hover:underline text-sm"
            >
              ← Zurück zur Startseite
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;

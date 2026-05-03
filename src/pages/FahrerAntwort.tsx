import { useSearchParams } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

type Status = "accepted" | "declined" | "already_answered" | "expired" | "invalid" | "error";

const MESSAGES: Record<Status, { title: string; text: string; tone: "success" | "info" | "error" }> = {
  accepted: {
    title: "Rückmeldung übermittelt",
    text: "Vielen Dank. Ihre Rückmeldung wurde übermittelt. Fahrerexpress meldet sich zur weiteren Abstimmung.",
    tone: "success",
  },
  declined: {
    title: "Rückmeldung übermittelt",
    text: "Vielen Dank. Ihre Rückmeldung wurde übermittelt.",
    tone: "success",
  },
  already_answered: {
    title: "Bereits beantwortet",
    text: "Ihre Rückmeldung wurde bereits erfasst.",
    tone: "info",
  },
  expired: {
    title: "Link abgelaufen",
    text: "Dieser Link ist abgelaufen.",
    tone: "error",
  },
  invalid: {
    title: "Ungültiger Link",
    text: "Dieser Link ist ungültig oder wurde nicht gefunden.",
    tone: "error",
  },
  error: {
    title: "Fehler",
    text: "Es ist ein Fehler aufgetreten. Bitte melden Sie sich direkt bei Fahrerexpress.",
    tone: "error",
  },
};

export default function FahrerAntwort() {
  const [params] = useSearchParams();
  const raw = (params.get("status") ?? "invalid") as Status;
  const status: Status = (Object.keys(MESSAGES) as Status[]).includes(raw) ? raw : "invalid";
  const m = MESSAGES[status];

  useSEO({
    title: "Fahrer-Rückmeldung – Kraftfahrer-Mieten",
    description: "Bestätigung Ihrer Rückmeldung zum Auftragsangebot.",
    noindex: true,
  });

  const toneClass =
    m.tone === "success"
      ? "bg-green-50 border-green-500 text-green-900"
      : m.tone === "error"
      ? "bg-red-50 border-red-500 text-red-900"
      : "bg-blue-50 border-blue-500 text-blue-900";

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <div className={`border rounded-lg p-6 ${toneClass}`}>
        <h1 className="text-2xl font-semibold mb-3">{m.title}</h1>
        <p className="text-base leading-relaxed">{m.text}</p>
      </div>

      <section className="mt-10 pt-6 border-t text-muted-foreground">
        <p className="font-medium text-foreground mb-2">Bei Fragen:</p>
        <p>
          Telefon: <a className="underline" href="tel:+4915771442285">+49 1577 1442285</a>
          <br />
          E-Mail:{" "}
          <a className="underline" href="mailto:info@kraftfahrer-mieten.com">
            info@kraftfahrer-mieten.com
          </a>
        </p>
      </section>
    </main>
  );
}
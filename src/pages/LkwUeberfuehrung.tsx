import { Link } from "react-router-dom";
import { Phone, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import FahreranfrageSection from "@/components/FahreranfrageSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import SafeFAQAnswer from "@/components/SafeFAQAnswer";
import { useSEO } from "@/hooks/useSEO";

const PAGE_URL = "https://www.kraftfahrer-mieten.com/lkw-ueberfuehrung";

const faqItems = [
  {
    question: "Was bedeutet „LKW Überführung auf eigener Achse“?",
    answer: "Das Fahrzeug wird auf seinen eigenen Rädern vom Abholort zum Zielort gefahren und nicht auf einem Tieflader oder Anhänger transportiert.",
  },
  {
    question: "Kann ich meinen LKW überführen lassen, wenn mir der Fahrer fehlt?",
    answer: "Ja. Fahrerexpress vermittelt selbstständige Fahrer für die Überführung fahrbereiter LKW und Nutzfahrzeuge. Sie stellen das Fahrzeug, wir vermitteln den Fahrer.",
  },
  {
    question: "Welche Fahrzeuge können überführt werden?",
    answer: "LKW und Nutzfahrzeuge auf eigener Achse, zum Beispiel Sattelzugmaschinen, Koffer-LKW, Kipper und andere LKW nach Absprache.",
  },
  {
    question: "Was muss beim Fahrzeug erfüllt sein?",
    answer: "Das Fahrzeug muss fahrbereit, verkehrssicher, zugelassen bzw. ordnungsgemäß für die Überführungsfahrt ausgestattet und versichert sein. Das stellt der Auftraggeber sicher.",
  },
  {
    question: "Was ist bei einem nicht zugelassenen Fahrzeug?",
    answer: "Für die Überführungsfahrt muss die jeweils erforderliche Zulassung bzw. Kennzeichnung vorhanden sein. Der Auftraggeber stellt sicher, dass alle dafür notwendigen Voraussetzungen erfüllt sind.",
  },
  {
    question: "Was kostet eine LKW-Überführung?",
    answer: "Das hängt unter anderem von Strecke, Fahrzeug, Zeitaufwand und den Bedingungen des Einsatzes ab. Nach Ihrer Anfrage erhalten Sie ein individuelles Angebot.",
  },
  {
    question: "Stellt Fahrerexpress ein Fahrzeug oder einen Transporter?",
    answer: "Nein. Fahrerexpress vermittelt nur selbstständige Fahrer für die Überführung, kein eigenes Fahrzeug und keinen Fahrzeugtransporter.",
  },
];

const LkwUeberfuehrung = () => {
  useSEO({
    title: "LKW Überführung auf eigener Achse – LKW überführen lassen | Fahrerexpress",
    description: "LKW Überführung auf eigener Achse: Fahrerexpress vermittelt selbstständige Fahrer, die Ihren LKW oder Ihr Nutzfahrzeug überführen. Deutschlandweit. Jetzt anfragen.",
    keywords: "LKW Überführung, LKW Überführung auf eigener Achse, LKW überführen lassen, LKW Fahrer für Überführung, Überführungsfahrer LKW, Nutzfahrzeug Überführung",
    hreflang: { de: PAGE_URL, "x-default": PAGE_URL },
    faqData: faqItems,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "LKW Überführung auf eigener Achse",
      serviceType: "B2B Fahrervermittlung",
      description: "Vermittlung selbstständiger Fahrer für die Überführung fahrbereiter LKW und Nutzfahrzeuge des Auftraggebers auf eigener Achse. Kein eigenes Fahrzeug, kein Fahrzeugtransporter.",
      url: PAGE_URL,
      provider: {
        "@type": "LocalBusiness",
        name: "Fahrerexpress-Agentur – Günter Killer",
        url: "https://www.kraftfahrer-mieten.com",
        telephone: "+49-1577-1442285",
      },
      areaServed: { "@type": "Country", name: "Deutschland" },
    },
  } as any);

  const scrollToBooking = () => {
    document.querySelector("#booking-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
        Zum Hauptinhalt springen
      </a>
      <Navigation />

      <main id="main-content" className="pt-16">
        <section className="py-16 px-4 bg-gradient-to-br from-background to-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              LKW Überführung auf eigener Achse – Fahrer für Ihre Überführung
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed">
              Ihr LKW muss von A nach B und Ihnen fehlt der passende Fahrer?
            </p>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Fahrerexpress vermittelt selbstständige Fahrer für LKW-Überführungen auf eigener Achse. Das Fahrzeug wird auf seinen eigenen Rädern vom Abholort zum vereinbarten Zielort gefahren. Deutschlandweit und ohne eigenen Fuhrpark durch Fahrerexpress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={scrollToBooking} className="text-lg px-8 py-3 bg-red-600 hover:bg-red-700 text-white">
                Überführung anfragen
              </Button>
              <Button variant="outline" size="lg" asChild className="text-lg px-8 py-3">
                <a href="tel:+4915771442285" className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Anrufen
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">LKW und Nutzfahrzeuge auf eigener Achse überführen</h2>
            <p className="text-muted-foreground mb-6">
              Wir vermitteln selbstständige Fahrer für die Überführung fahrbereiter LKW und Nutzfahrzeuge auf eigener Achse sowie für LKW-Sonderfahrten.
            </p>
            <p className="font-semibold mb-3">Beispiele:</p>
            <ul className="grid sm:grid-cols-2 gap-3">
              {["Sattelzugmaschinen", "Koffer-LKW", "Kipper", "andere LKW nach Absprache"].map((v) => (
                <li key={v} className="flex items-center gap-2 p-3 border rounded-lg bg-background">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">So läuft Ihre LKW-Überführung ab</h2>
            <ol className="space-y-4">
              {[
                ["Anfrage senden", "Sie nennen Fahrzeug, Abholort, Zielort und Wunschtermin."],
                ["Abstimmung", "Wir prüfen, ob ein passender selbstständiger Fahrer verfügbar ist, und melden uns bei Ihnen."],
                ["Angebot", "Sie erhalten ein individuelles Angebot für Ihre Überführung."],
                ["Überführung", "Nach Ihrer Bestätigung fährt der Fahrer das Fahrzeug auf eigener Achse zum vereinbarten Zielort."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4 p-4 bg-background border rounded-lg">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">{i + 1}</span>
                  <p><strong>{t}:</strong> <span className="text-muted-foreground">{d}</span></p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Was kostet eine LKW-Überführung?</h2>
            <p className="text-muted-foreground">
              Die Kosten einer LKW-Überführung richten sich unter anderem nach Strecke, Fahrzeug, Zeitaufwand und den Bedingungen des konkreten Einsatzes. Nach Ihrer Anfrage erhalten Sie ein individuelles Angebot.
            </p>
          </div>
        </section>

        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto border-2 border-primary/20 rounded-lg p-6 bg-primary/5">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" /> Wichtiger Hinweis
            </h2>
            <p className="text-muted-foreground">
              Fahrerexpress vermittelt selbstständige Fahrer für die Überführung. Fahrerexpress stellt kein eigenes Fahrzeug und keinen Fahrzeugtransporter. Der Auftraggeber stellt sicher, dass das Fahrzeug fahrbereit und verkehrssicher ist und dass alle für die konkrete Überführungsfahrt erforderlichen Zulassungs-, Kennzeichnungs- und Versicherungsanforderungen erfüllt sind.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Häufige Fragen zur LKW-Überführung</h2>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <details key={item.question} className="group rounded-lg border border-muted p-4 hover:border-primary/50 transition-colors">
                  <summary className="font-semibold cursor-pointer flex items-center justify-between group-open:text-primary">
                    {item.question}
                    <span className="ml-2 transform group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <SafeFAQAnswer text={item.answer} className="mt-3 text-muted-foreground" />
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Überführungsfahrer für Ihren LKW anfragen</h2>
            <p className="text-muted-foreground mb-6">
              Sie brauchen einen LKW-Fahrer für eine Überführung oder möchten ein Nutzfahrzeug überführen lassen? Senden Sie uns Ihre Anfrage mit Fahrzeug, Strecke und Wunschtermin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={scrollToBooking} className="text-lg px-8 py-3 bg-red-600 hover:bg-red-700 text-white">
                Überführung anfragen
              </Button>
              <Button variant="outline" size="lg" asChild className="text-lg px-8 py-3">
                <Link to="/lkw-fahrer-buchen" className="no-underline">LKW-Fahrer buchen</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="fahreranfrage" className="scroll-mt-16">
          <FahreranfrageSection variant="ueberfuehrung" />
        </section>

        <section id="contact" className="scroll-mt-16">
          <ContactSection />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LkwUeberfuehrung;

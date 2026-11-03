import { Link } from "react-router-dom";
import { ArrowRight, Phone, Truck, MapPin, CalendarDays } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FahreranfrageSection from "@/components/FahreranfrageSection";
import TarifCardText from "@/components/TarifCardText";
import { Button } from "@/components/ui/button";
import { TARIF_TEXTE, PREISKARTEN_HINWEIS } from "@/lib/tarifTexte";
import { useSEO } from "@/hooks/useSEO";

const PAGE_URL = "https://www.kraftfahrer-mieten.com/showtruck-eventfahrer";

const services = [
  { icon: Truck, title: "Showtrucks & Promotionfahrzeuge", text: "Showtruck Fahrer mieten oder einen Promotiontruck Fahrer anfragen: Wir vermitteln selbstständige Berufskraftfahrer für Ihre Showtrucks, Werbetrucks und Promotionfahrzeuge. Das Fahrzeug stellt Ihr Unternehmen." },
  { icon: CalendarDays, title: "Konzert- & Messetourneen", text: "Sie suchen LKW Fahrer für Konzerttourneen oder Fahrer für Messetourneen? Nennen Sie uns die geplanten Stationen, Einsatztage und Fahrzeuganforderungen. Die Vermittlung erfolgt bundesweit nach Verfügbarkeit." },
  { icon: MapPin, title: "Roadshows & Veranstaltungstechnik", text: "Wir vermitteln Fahrer für Roadshows und Fahrer für Veranstaltungstechnik mit den Fahrzeugen des Auftraggebers. Fahrten, Fahrzeuganforderungen und weitere tatsächlich benötigte Tätigkeiten werden anhand Ihrer Einsatzbeschreibung abgestimmt." },
];

export default function ShowtruckEventfahrer() {
  useSEO({
    title: "Showtruck-Fahrer & Eventfahrer mieten – bundesweit | Fahrerexpress",
    description: "Showtruck-Fahrer, Eventfahrer und Fahrer für Werbefahrzeuge, Promotiontrucks, Tourneen und Roadshows bundesweit anfragen. Selbstständige Fahrer ab 489 € netto/Tag.",
    hreflang: { de: PAGE_URL, "x-default": PAGE_URL },
    breadcrumbs: [{ name: "Startseite", url: "https://www.kraftfahrer-mieten.com/" }, { name: "Showtruck- & Eventfahrer", url: PAGE_URL }],
    structuredData: {
      "@context": "https://schema.org", "@type": "Service",
      name: "Showtruck-, Werbefahrzeug- und Eventfahrer",
      serviceType: "Fahrervermittlung für selbstständige Unternehmer",
      url: PAGE_URL,
      description: "Bundesweite Vermittlung selbstständiger Berufskraftfahrer für Showtrucks, Promotionfahrzeuge, Werbetrucks, Konzerttourneen, Messen, Roadshows und Veranstaltungstechnik. Fahrzeuge stellt der Auftraggeber.",
      provider: { "@type": "Organization", name: "Fahrerexpress-Agentur – Günter Killer", url: "https://www.kraftfahrer-mieten.com/" },
      areaServed: { "@type": "Country", name: "Deutschland" },
      audience: { "@type": "BusinessAudience", audienceType: "B2B" },
    },
  });

  const scrollToBooking = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-16">
        <section className="relative isolate overflow-hidden">
          <img src="/uploads/lkw-autobahn-professionell.webp" alt="LKW unterwegs auf einer Autobahn" className="absolute inset-0 -z-20 h-full w-full object-cover" fetchPriority="high" />
          <div className="absolute inset-0 -z-10 bg-foreground/90" />
          <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16 text-background">
            <p className="mb-4 font-semibold">Fahrerexpress · Bundesweite Fahrervermittlung</p>
            <h1 className="max-w-4xl text-3xl md:text-5xl font-bold leading-tight mb-6 break-words">Showtruck-Fahrer &amp; Eventfahrer mieten – bundesweit</h1>
            <p className="max-w-3xl text-lg leading-relaxed mb-6">Selbstständige Berufskraftfahrer für Showtrucks, Werbefahrzeuge, Promotionfahrzeuge und Eventfahrzeuge – für Ihre Konzerttourneen, Messen und Roadshows. Sie stellen das Fahrzeug, Fahrerexpress vermittelt den Fahrer nach Verfügbarkeit.</p>
            <p className="font-semibold text-lg mb-7">Spezialfahrzeuge: ab {TARIF_TEXTE.baumaschine.amount} netto je Einsatztag</p>
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <Button size="lg" onClick={scrollToBooking}><ArrowRight aria-hidden="true" />Fahrer buchen</Button>
              <Button size="lg" variant="secondary" asChild><a href="tel:+4915771442285"><Phone aria-hidden="true" />Anrufen</a></Button>
            </div>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Fahrer für Werbefahrzeuge, Tourneen und Events</h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-3xl">Ob Sie einen Eventfahrer buchen, einen Werbefahrzeug Fahrer suchen oder einen Tourneefahrer mieten möchten: Fahrerexpress vermittelt selbstständige Unternehmer für Fahrerdienstleistungen in ganz Deutschland. Es handelt sich nicht um Arbeitnehmerüberlassung; Fahrzeuge und Ausstattung stellt der Auftraggeber.</p>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map(({ icon: Icon, title, text }) => <article key={title} className="border border-border rounded-lg p-5 bg-card">
                <Icon className="h-7 w-7 text-primary mb-4" aria-hidden="true" />
                <h3 className="text-lg font-semibold mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{text}</p>
              </article>)}
            </div>
          </div>
        </section>

        <section className="py-12 px-4 bg-muted/50">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Preise für Showtruck- und Eventfahrer</h2>
              <p className="text-muted-foreground mb-4">Showtruck-Fahrer, Werbefahrzeuge, Promotionfahrzeuge und Eventfahrzeuge gehören zur Kategorie „Baumaschinenführer / Mischmeister / Spezialfahrzeuge“ mit einem regulären Tagessatz ab {TARIF_TEXTE.baumaschine.amount} netto.</p>
              <p className="text-sm text-muted-foreground mb-4">{PREISKARTEN_HINWEIS}</p>
              <Link to="/preise-und-ablauf" className="text-primary font-semibold underline">Alle Preise, Zusatzkosten und Konditionen</Link>
            </div>
            <div className="border-l-2 border-primary pl-6">
              <TarifCardText tarif={TARIF_TEXTE.baumaschine} amountClassName="text-3xl font-bold text-primary mb-2" unitClassName="font-semibold" detailClassName="text-muted-foreground mt-3" />
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">{TARIF_TEXTE.baumaschine.details.slice(1).map((detail) => <li key={detail}>{detail}</li>)}</ul>
              <p className="mt-3 text-sm text-muted-foreground">Gegebenenfalls anfallende Unterkunftskosten richten sich nach den bestehenden veröffentlichten Konditionen.</p>
            </div>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Ihren Einsatz anfragen</h2>
            <p className="text-muted-foreground mb-4 max-w-3xl">Geben Sie in Ihrer Anfrage Fahrzeugtyp, Einsatzort, Zeitraum, Tourneestationen und die benötigten Tätigkeiten an. Für diese Einsätze wählen Sie die bestehende Kategorie „Baumaschinenführer / Mischmeister / Spezialfahrzeuge“ und beschreiben das Showtruck-, Werbe- oder Eventfahrzeug.</p>
            <p className="text-muted-foreground max-w-3xl mb-6">Mit dem Absenden stellen Sie eine Anfrage. Ein kostenpflichtiger Auftrag entsteht erst nach Bestätigung durch Fahrerexpress und erfolgreicher Fahrerzuteilung. Eine bestimmte Verfügbarkeit wird nicht garantiert.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <Link to="/lkw-fahrer-buchen" className="text-primary font-semibold underline">LKW-Fahrer CE</Link>
              <Link to="/baumaschinenfuehrer-buchen" className="text-primary font-semibold underline">Baumaschinenführer &amp; Spezialfahrzeuge</Link>
            </div>
          </div>
        </section>
        <section id="fahreranfrage" className="scroll-mt-16"><FahreranfrageSection /></section>
      </main>
      <Footer />
    </div>
  );
}
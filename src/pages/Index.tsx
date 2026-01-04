import { lazy, Suspense } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import { useSEO } from "@/hooks/useSEO";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// ============================================
// MOBILE PERFORMANCE: Below-the-fold lazy loading
// Diese Komponenten werden erst geladen wenn sichtbar/interaktiv
// ============================================
const ProductCards = lazy(() => import("@/components/ProductCards"));
const ProcessSteps = lazy(() => import("@/components/ProcessSteps"));
const WhyFahrerexpress = lazy(() => import("@/components/WhyFahrerexpress"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const EUDriverRecruitment = lazy(() => import("@/components/EUDriverRecruitment"));
const FahreranfrageSection = lazy(() => import("@/components/FahreranfrageSection"));
const LegalSecuritySection = lazy(() => import("@/components/LegalSecuritySection"));
const BookingPriorityBanner = lazy(() => import("@/components/BookingPriorityBanner"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const Footer = lazy(() => import("@/components/Footer"));

// Leichtgewichtiger Placeholder für lazy-loaded Sections
const SectionLoader = () => (
  <div className="py-16 bg-background animate-pulse">
    <div className="container mx-auto px-4">
      <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4" />
      <div className="h-4 bg-muted rounded w-2/3 mx-auto" />
    </div>
  </div>
);
const Index = () => {
  const navigate = useNavigate();
  
  useSEO({
    title: "LKW Fahrer buchen & mieten – deutschlandweit ab 349 €",
    description: "LKW Fahrer deutschlandweit buchen – Ersatzfahrer, Aushilfsfahrer & Mietfahrer bundesweit. Kurzfristig, auf Abruf, ohne Arbeitnehmerüberlassung.",
    keywords: "LKW Fahrer buchen deutschlandweit, Kraftfahrer mieten bundesweit, CE Fahrer deutschlandweit, Ersatzfahrer LKW, Aushilfsfahrer LKW, Mietfahrer LKW, Leihfahrer LKW, Fahrer leihen, Fahrer bestellen, Fahrer-Dienstleistungen, externe LKW Fahrer, Fahrer Dienstleister, Fahrer sofort, Fahrer auf Abruf, Fahrer tageweise, Fahrer wochenweise, Notfallfahrer, Urlaubsvertretung Fahrer, Krankheitsvertretung Fahrer, Vertretungsfahrer, Fahrerausfall, Kipper Fahrer, Baustellen Fahrer, Sattelzug Fahrer, Fahrmischer Fahrer, Baumaschinenführer buchen, LKW Fahrer Vermittlung, Fahrer kurzfristig verfügbar",
    ogImage: "https://kraftfahrer-mieten.com/uploads/facebook-preview-v2.jpg",
    hreflang: {
      'de': 'https://kraftfahrer-mieten.com/',
      'de-AT': 'https://kraftfahrer-mieten.com/',
      'de-CH': 'https://kraftfahrer-mieten.com/',
      'en': 'https://kraftfahrer-mieten.com/',
      'pl': 'https://kraftfahrer-mieten.com/',
      'ro': 'https://kraftfahrer-mieten.com/',
      'bg': 'https://kraftfahrer-mieten.com/',
      'hu': 'https://kraftfahrer-mieten.com/',
      'x-default': 'https://kraftfahrer-mieten.com/'
    },
    faqData: [
      {
        question: "Ist Fahrerexpress eine Zeitarbeitsfirma?",
        answer: "Nein."
      },
      {
        question: "Stellen Sie Fahrzeuge oder Maschinen?",
        answer: "Nein."
      },
      {
        question: "Arbeiten die Fahrer selbstständig?",
        answer: "Ja."
      },
      {
        question: "Gibt es Arbeitnehmerüberlassung?",
        answer: "Nein."
      },
      {
        question: "Wie funktioniert die Zusammenarbeit?",
        answer: "Sie erhalten eine übersichtliche Rechnung direkt von der Fahrerexpress-Agentur. Die Einsätze werden über uns gebündelt abgerechnet – die Fahrer arbeiten als selbstständige Unternehmer. Hinweis: Unsere Fahrer arbeiten als selbstständige Unternehmer auf Basis eines Dienst- oder Werkvertrags. Es handelt sich nicht um Arbeitnehmerüberlassung."
      },
      {
        question: "Wie schnell können Fahrer verfügbar sein?",
        answer: "In der Regel 24–72 Stunden Vorlauf (werktags) ab schriftlicher Bestätigung. Same-Day ist ausgeschlossen."
      },
      {
        question: "Welche Führerscheinklassen sind verfügbar?",
        answer: "C+E (Sattelzug), C, C1+E, ADR-Schein, Ladekran-Erfahrung, Fahrmischer-Qualifikation und weitere Spezialführerscheine je nach Anfrage."
      },
      {
        question: "Sind die Fahrer versichert?",
        answer: "Ja, alle Fahrer verfügen über entsprechende Berufshaftpflicht- und Fahrzeugversicherungen. Vollständiger Versicherungsschutz garantiert."
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
        "name": "LKW-Fahrer buchen deutschlandweit & Kraftfahrer mieten bundesweit - Fahrerexpress",
        "description": "LKW-Fahrer deutschlandweit buchen und Kraftfahrer bundesweit mieten - selbstständige Berufskraftfahrer in ganz Deutschland ohne Arbeitnehmerüberlassung",
      "url": "https://kraftfahrer-mieten.com/",
      "mainEntity": {
        "@type": "LocalBusiness",
        "name": "Fahrerexpress-Agentur - Günter Killer",
        "description": "LKW CE Fahrer (349 €), Baumaschinenführer (459 €) und Mischmeister (489 €) deutschlandweit buchen – selbstständige Subunternehmer bundesweit verfügbar, keine Arbeitnehmerüberlassung",
        "url": "https://kraftfahrer-mieten.com",
        "telephone": "+49-1577-1442285",
        "priceRange": "Faire Preise",
        "areaServed": {
          "@type": "Country",
          "name": "Deutschland"
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Walther-von-Cronberg-Platz 12",
          "addressLocality": "Frankfurt am Main",
          "postalCode": "60594",
          "addressCountry": "DE"
        }
      }
    }
  });

  return (
    <div className="min-h-screen">
      {/* Skip link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Zum Hauptinhalt springen
      </a>
      
      <Navigation />
      
      <main id="main-content">
        <HeroSection />
        
        {/* SEO H2-Struktur für Keyword-Abdeckung (mieten, leihen, etc.) */}
        <section aria-label="Leistungsübersicht" className="py-8 bg-background">
          <div className="container mx-auto px-4 max-w-4xl space-y-4">
            <h2 className="text-2xl font-bold text-foreground">LKW-Fahrer mieten oder leihen – flexibel & kurzfristig</h2>
            <h2 className="text-2xl font-bold text-foreground">Ersatzfahrer & Aushilfsfahrer bei Fahrerausfall</h2>
            <h2 className="text-2xl font-bold text-foreground">CE-Fahrer, Kipperfahrer & Baustellenfahrer bundesweit</h2>
            <h2 className="text-2xl font-bold text-foreground">Mietfahrer & Leihfahrer ohne Arbeitnehmerüberlassung</h2>
          </div>
        </section>

        {/* AUFGABE 1: Zentraler Definitions-Block für Google & KI */}
        <section aria-label="Leistungsdefinition Fahrerexpress" className="py-8 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-muted-foreground leading-relaxed">
              Fahrerexpress ist eine Vermittlungsagentur für selbstständige LKW-Fahrer (CE),
              Baumaschinenführer und Mischmeister in Deutschland und der EU.
              Wir stellen keine Fahrzeuge und betreiben keine Zeitarbeit.
              Die Fahrer arbeiten selbstständig und werden rechtssicher über eine
              Agenturabrechnung vermittelt.
            </p>
          </div>
        </section>

        {/* AUFGABE 2: Klarstellung Mieten/Leihen */}
        <section aria-label="Begriffsklarstellung" className="pb-8 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-sm text-muted-foreground">
              Hinweis: Begriffe wie „Mietfahrer", „Leihfahrer" oder „Ersatzfahrer"
              werden umgangssprachlich verwendet und bezeichnen ausschließlich
              selbstständige Unternehmer – keine Arbeitnehmerüberlassung.
            </p>
          </div>
        </section>

        {/* Below-the-fold: Lazy-loaded für bessere Mobile-Performance */}
        <Suspense fallback={<SectionLoader />}>
          <ProductCards />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <ProcessSteps />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <WhyFahrerexpress />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <TestimonialsSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <FahreranfrageSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <LegalSecuritySection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <BookingPriorityBanner />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <EUDriverRecruitment />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <ContactSection />
        </Suspense>
        
        {/* SEO-Block für Flüssigboden-Service */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Mischmeister für Flüssigboden
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Ergänzend zu unseren Fahrerdiensten bieten wir auch den Einsatz eines Mischmeisters für fließfähige Verfüllmaterialien an. Der Einsatz erfolgt als selbstständiger Subunternehmer inklusive Bedienung der bauseits gestellten Mischanlage, Radlader/Bagger sowie CE-Fahrmischer. Durch diese Kombination können auf der Baustelle bis zu zwei zusätzliche Mitarbeiter eingespart werden. Alle Arbeiten erfolgen ausschließlich nach Rezeptur und Anweisung des Auftraggebers, ohne Gewährleistungs- oder Betreiberverantwortung.
            </p>
            <div className="flex justify-center">
              <Button 
                asChild 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link to="/fluessigboden-service">
                  Mischmeister buchen
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ-Block für SEO */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Häufige Fragen zur Fahrer-Vermittlung</h2>
            
            {/* AUFGABE 3: Mini-FAQ für maschinenlesbare Ja/Nein-Signale */}
            <section aria-label="Kurz-FAQ Fahrerexpress" className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Kurze Antworten zur Fahrervermittlung</h3>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Ist Fahrerexpress eine Zeitarbeitsfirma?</strong><br />Nein.</p>
                <p><strong>Stellen Sie Fahrzeuge oder Maschinen?</strong><br />Nein.</p>
                <p><strong>Arbeiten die Fahrer selbstständig?</strong><br />Ja.</p>
                <p><strong>Gibt es Arbeitnehmerüberlassung?</strong><br />Nein.</p>
              </div>
            </section>

            <div className="space-y-6">
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">Bieten Sie LKW-Fahrer wirklich deutschlandweit an?</h3>
                <p className="text-muted-foreground">
                  Ja, die Fahrerexpress-Agentur vermittelt selbstständige LKW-Fahrer, Kraftfahrer und Baumaschinenführer bundesweit in ganz Deutschland. Sie können LKW-Fahrer buchen deutschlandweit – unsere Fahrer-Vermittlung ist bundesweit aktiv.
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">Stellen Sie auch LKW oder Baumaschinen zur Verfügung?</h3>
                <p className="text-muted-foreground">
                  Nein. Wir vermitteln ausschließlich Fahrer und Bediener – keine Fahrzeuge, keine Baumaschinen, keine Anlagen. Geräte und Fahrzeuge stellt immer der Auftraggeber. Unsere Baumaschinenführer sind nur Bediener, keine Maschine wird mitgeliefert.
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">Brauchen wir eine Arbeitnehmerüberlassung?</h3>
                <p className="text-muted-foreground">
                  Nein. Unsere Fahrer sind selbstständige LKW-Fahrer, Baumaschinenführer oder Mischmeister/Anlagenbediener. Die Vermittlung erfolgt rechtssicher per Dienstleistungs- oder Werkvertrag – ohne klassische Arbeitnehmerüberlassung.
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">Wie schnell bekommen wir einen Ersatzfahrer bei Fahrerausfall?</h3>
                <p className="text-muted-foreground">
                  Bei Fahrerausfall durch Krankheit oder Urlaub können Sie kurzfristig einen Aushilfsfahrer, Mietfahrer oder Leihfahrer bestellen. Unsere Ersatzfahrer und Vertretungsfahrer sind deutschlandweit auf Abruf verfügbar – tageweise oder wochenweise. Externe LKW Fahrer für Speditionen sofort buchbar.
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">Kann ich einen Fahrer sofort oder für heute bestellen?</h3>
                <p className="text-muted-foreground">
                  Same-Day-Buchungen sind ausgeschlossen – wir benötigen mindestens 24 Stunden Vorlauf. Fahrer auf Abruf, tageweise oder wochenweise buchbar. Für kurzfristigen Bedarf empfehlen wir, Ihren Fahrer-Dienstleister frühzeitig zu kontaktieren.
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">Vermitteln Sie auch Kipper-Fahrer und Baustellen-Fahrer?</h3>
                <p className="text-muted-foreground">
                  Ja. Wir vermitteln Kipper-Fahrer, Baustellen-Fahrer, Fahrmischer-Fahrer und Sattelzug-Fahrer deutschlandweit. Alle arbeiten als selbstständige Fahrer – Sie können Fahrer leihen ohne Arbeitnehmerüberlassung.
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">Vermitteln Sie auch Baggerfahrer und Radladerfahrer?</h3>
                <p className="text-muted-foreground">
                  Ja. Wir vermitteln selbstständige Baggerfahrer, Radladerfahrer und Baumaschinenführer deutschlandweit als Subunternehmer für einzelne Bauabschnitte oder Tagesbaustellen. Die Maschinen stellt immer der Auftraggeber – wir liefern nur qualifizierte Bediener.
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">Bieten Sie auch Mischmeister für Flüssigboden an?</h3>
                <p className="text-muted-foreground">
                  Ja. Wir vermitteln erfahrene Mischmeister und Anlagenbediener für Flüssigboden deutschlandweit. Der Mischmeister bedient Ihre bauseits gestellte Anlage, Radlader/Bagger und Fahrmischer – keine eigene Maschinenvermietung.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Suspense fallback={<div className="py-8 bg-muted" />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;

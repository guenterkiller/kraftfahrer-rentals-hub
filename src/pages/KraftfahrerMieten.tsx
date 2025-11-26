import LandingPageLayout from "@/components/LandingPageLayout";

const KraftfahrerMieten = () => {
  const seoData = {
    title: "Kraftfahrer mieten – Berufskraftfahrer kurzfristig & bundesweit | Fahrerexpress",
    description: "Kraftfahrer mieten für Nah-/Fernverkehr, Baustelle, Überführungen. Selbstständige Fahrer, transparente Tagespreise, rechtssichere Vermittlung.",
    keywords: "Kraftfahrer mieten, Berufskraftfahrer mieten, Fahrer mieten kurzfristig, Kraftfahrer Vermittlung, selbstständige Kraftfahrer, Fahrer gesucht",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Kraftfahrer mieten",
      "description": "Kraftfahrer mieten für Nah-/Fernverkehr, Baustelle und Überführungen - selbstständige Berufskraftfahrer",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Fahrerexpress-Agentur – Günter Killer",
        "url": "https://www.kraftfahrer-mieten.com",
        "telephone": "+49-1577-1442285",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Walther-von-Cronberg-Platz 12",
          "postalCode": "60594",
          "addressLocality": "Frankfurt am Main",
          "addressCountry": "DE"
        },
        "areaServed": "DE"
      }
    }
  };

  const heroData = {
    h1: "Kraftfahrer mieten – schnell & rechtssicher",
    intro: "Bei Spitzen, Krankheit oder Urlaub: Selbstständige Kraftfahrer bundesweit verfügbar. Der Abschluss eines Einsatzes erfolgt direkt zwischen Ihnen und dem Fahrer – wir übernehmen die Vermittlung, keine zusätzliche Provision für Sie.",
    bullets: [
      "Engpässe überbrücken (Tag/Woche/Projekt)",
      "Direkte Zusammenarbeit mit dem Fahrer",
      "ADR, Ladekran, Fahrmischer optional"
    ]
  };

  const faqData = {
    title: "Kraftfahrer mieten – Häufige Fragen",
    items: [
      {
        question: "Was ist die Mindestdauer für Kraftfahrer?",
        answer: "<strong>Tages- und Projekt-Einsätze</strong> sind möglich. Von einzelnen Tagen bis zu mehrwöchigen Projekten – je nach Ihrem Bedarf und Verfügbarkeit der Kraftfahrer."
      },
      {
        question: "In welchen Regionen können Sie Kraftfahrer vermitteln?",
        answer: "<strong>Deutschlandweit.</strong> Besonders stark in Ballungsräumen wie München, Hamburg, Frankfurt, Berlin, Köln/Düsseldorf und Stuttgart."
      },
      {
        question: "Welche Qualifikationen haben die Kraftfahrer?",
        answer: "Alle Kraftfahrer verfügen über gültige <strong>Führerscheine (B, C, C+E)</strong>, Berufskraftfahrer-Qualifikation und optional <strong>ADR, Ladekran-Erfahrung, Fahrmischer</strong>-Zusatzqualifikationen."
      },
      {
        question: "Wie funktioniert die Zusammenarbeit?",
        answer: "Unsere Kraftfahrer arbeiten als <strong>selbstständige Unternehmer</strong> auf Basis eines Dienst-/Werkvertrags. Es handelt sich nicht um Arbeitnehmerüberlassung. Der Abschluss eines Einsatzes erfolgt direkt zwischen Ihnen und dem Fahrer – wir übernehmen die professionelle Vermittlung."
      }
    ]
  };

  const relatedServices = [
    {
      title: "LKW-Fahrer buchen",
      path: "/lkw-fahrer-buchen",
      description: "Speziell C+E Sattelzugfahrer"
    },
    {
      title: "Fahrmischerfahrer",
      path: "/fahrmischerfahrer-gesucht",
      description: "Erfahrene Betonmischer-Spezialisten"
    },
    {
      title: "Baumaschinenführer",
      path: "/baumaschinenfuehrer-buchen",
      description: "Bagger, Radlader"
    }
  ];

  return (
    <LandingPageLayout 
      seoData={seoData}
      hero={heroData}
      faq={faqData}
      relatedServices={relatedServices}
    />
  );
};

export default KraftfahrerMieten;
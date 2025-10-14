import LandingPageLayout from "@/components/LandingPageLayout";

const KraftfahrerMieten = () => {
  const seoData = {
    title: "Kraftfahrer mieten – Berufskraftfahrer kurzfristig & bundesweit | Fahrerexpress",
    description: "Kraftfahrer mieten für Nah-/Fernverkehr, Baustelle, Überführungen. Selbstständige Fahrer, transparente Tagespreise, rechtssicher ohne Arbeitnehmerüberlassung.",
    keywords: "Kraftfahrer mieten, Berufskraftfahrer mieten, Fahrer mieten kurzfristig, Kraftfahrer Vermittlung, selbstständige Kraftfahrer, Fahrer gesucht",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Kraftfahrer mieten",
      "description": "Kraftfahrer mieten für Nah-/Fernverkehr, Baustelle und Überführungen - selbstständige Berufskraftfahrer ohne Arbeitnehmerüberlassung",
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
    intro: "Bei Spitzen, Krankheit oder Urlaub: Mieten Sie selbstständige Kraftfahrer bundesweit. Abrechnung zentral über Fahrerexpress; der Fahrer erbringt seine Leistung als selbstständiger Subunternehmer und stellt seine Rechnung an Fahrerexpress. Kein Arbeitsverhältnis, kein AÜG.",
    bullets: [
      "Engpässe überbrücken (Tag/Woche/Projekt)",
      "Ein Ansprechpartner, eine Rechnung",
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
        question: "Wie unterscheidet sich das von Zeitarbeit?",
        answer: "Unsere Kraftfahrer sind <strong>selbstständige Subunternehmer</strong> im Rahmen von Dienst-/Werkverträgen. <strong>Keine Arbeitnehmerüberlassung</strong>, sondern rechtssichere Vermittlung."
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
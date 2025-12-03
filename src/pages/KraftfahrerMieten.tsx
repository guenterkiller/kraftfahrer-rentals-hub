import LandingPageLayout from "@/components/LandingPageLayout";

const KraftfahrerMieten = () => {
  const seoData = {
    title: "Kraftfahrer mieten deutschlandweit – bundesweit kurzfristig",
    description: "Kraftfahrer deutschlandweit mieten – Berufskraftfahrer für Nah-/Fernverkehr, Baustellen. Kurzfristig, ohne AÜG.",
    keywords: "Kraftfahrer mieten deutschlandweit, Berufskraftfahrer bundesweit, Fahrer mieten kurzfristig, Kraftfahrer Vermittlung bundesweit, selbstständige Kraftfahrer deutschlandweit, Ersatzfahrer bundesweit, Notfallfahrer Deutschland, Urlaubsvertretung Fahrer deutschlandweit",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Kraftfahrer mieten deutschlandweit",
      "description": "Kraftfahrer deutschlandweit mieten – selbstständige Berufskraftfahrer in ganz Deutschland für Nah-/Fernverkehr, Baustellen und Überführungen",
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
        "areaServed": {
          "@type": "Country",
          "name": "Deutschland"
        }
      }
    }
  };

  const heroData = {
    h1: "Kraftfahrer mieten – schnell & rechtssicher",
    intro: "Bei Spitzen, Krankheit oder Urlaub: Selbstständige Kraftfahrer bundesweit verfügbar. Sie erhalten eine übersichtliche Rechnung direkt von der Fahrerexpress-Agentur. Die Einsätze werden über uns gebündelt abgerechnet – keine zusätzlichen Vermittlungsgebühren über die vereinbarten Tages- und Nebenkosten hinaus.",
    bullets: [
      "Engpässe überbrücken (Tag/Woche/Projekt)",
      "Transparente Abrechnung über die Agentur",
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
        answer: "Sie erhalten eine übersichtliche Rechnung direkt von der Fahrerexpress-Agentur. Die Einsätze werden über uns gebündelt abgerechnet – die Fahrer arbeiten als selbstständige Unternehmer. <strong>Hinweis:</strong> Unsere Fahrer arbeiten als selbstständige Unternehmer auf Basis eines Dienst- oder Werkvertrags. Es handelt sich nicht um Arbeitnehmerüberlassung."
      },
      {
        question: "Bieten Sie Kraftfahrer wirklich deutschlandweit an?",
        answer: "Ja. Wir vermitteln <strong>selbstständige LKW-Fahrer und Kraftfahrer bundesweit</strong> in ganz Deutschland. Kraftfahrer mieten ist deutschlandweit möglich – unsere Fahrer-Vermittlung ist bundesweit aktiv."
      },
      {
        question: "Stellen Sie auch LKW oder Baumaschinen zur Verfügung?",
        answer: "Nein. Wir vermitteln ausschließlich <strong>Fahrer und Bediener</strong> – keine Fahrzeuge, keine Baumaschinen, keine Anlagen. Geräte und Fahrzeuge stellt immer der Auftraggeber. Baumaschinenführer sind nur Bediener, Mischmeister/Anlagenbediener bedienen nur bauseits gestellte Anlagen."
      },
      {
        question: "Brauchen wir eine Arbeitnehmerüberlassung?",
        answer: "Nein. Unsere Fahrer sind <strong>selbstständige Kraftfahrer, Baumaschinenführer oder Mischmeister</strong>. Die Vermittlung erfolgt rechtssicher per Dienstleistungs- oder Werkvertrag – ohne klassische Arbeitnehmerüberlassung."
      },
      {
        question: "Wie schnell bekommen wir einen Ersatzfahrer bei Ausfall?",
        answer: "Bei kurzfristigen Ausfällen können wir in der Regel sehr schnell einen <strong>Ersatzfahrer oder Notfallfahrer</strong> deutschlandweit organisieren – je nach Verfügbarkeit meist innerhalb von 24–72 Stunden."
      },
      {
        question: "Vermitteln Sie auch Baggerfahrer und Radladerfahrer?",
        answer: "Ja. Neben LKW-Fahrern und Kraftfahrern vermitteln wir auch <strong>Baggerfahrer, Radladerfahrer und Baumaschinenführer deutschlandweit</strong>. Alle arbeiten als Subunternehmer für einzelne Bauabschnitte oder Tagesbaustellen – keine Maschinenvermietung, nur Bediener."
      },
      {
        question: "Bieten Sie Mischmeister für Flüssigboden an?",
        answer: "Ja. Wir vermitteln erfahrene <strong>Mischmeister und Anlagenbediener für Flüssigboden</strong> deutschlandweit als Subunternehmer. Der Mischmeister bedient Ihre bauseits gestellte Anlage – keine eigene Maschinenvermietung."
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
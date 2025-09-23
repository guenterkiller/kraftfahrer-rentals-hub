import LandingPageLayout from "@/components/LandingPageLayout";

const LKWFahrerBuchen = () => {
  const seoData = {
    title: "LKW-Fahrer buchen ab 399 € – deutschlandweit & kurzfristig | Fahrerexpress",
    description: "LKW-Fahrer (C/CE) kurzfristig buchen. Bundesweit verfügbar, transparente Preise, rechtssichere Dienst-/Werkleistung – keine Arbeitnehmerüberlassung. Tankwagenfahrer ADR, Kranfahrer, Fahrmischerfahrer.",
    keywords: "LKW-Fahrer buchen, C+E Fahrer buchen, LKW-Fahrer kurzfristig, Berufskraftfahrer C/CE, LKW-Fahrer Vermittlung, Sattelzugfahrer buchen, Tankwagenfahrer buchen, ADR-Fahrer mieten, Kranfahrer buchen, Fahrmischerfahrer gesucht",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "LKW-Fahrer buchen",
      "description": "LKW-Fahrer (C/CE) kurzfristig buchen - bundesweit verfügbare Berufskraftfahrer als selbstständige Subunternehmer",
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
      },
      "offers": {
        "@type": "Offer",
        "price": "399",
        "priceCurrency": "EUR",
        "description": "LKW-Fahrer (C+E) Tagespreis für 8 Stunden"
      }
    }
  };

  const heroData = {
    h1: "LKW-Fahrer buchen – ab 399 € (8 Std.)",
    intro: "Sie benötigen kurzfristig einen LKW-Fahrer (C/CE) für Transport, Baustelle oder Überführung? Über Fahrerexpress buchen Sie bundesweit selbstständige Berufskraftfahrer – flexibel, zuverlässig und mit Rechnung von Fahrerexpress. Die Leistung wird als Dienst-/Werkvertrag erbracht (kein AÜG). Auf Wunsch Spezialqualifikationen wie ADR, Kran, Fahrmischer.",
    bullets: [
      "C/CE-Fahrer für Nah- & Fernverkehr",
      "ADR / Kran / Fahrmischer verfügbar", 
      "Heute anfragen, kurzfristig starten"
    ]
  };

  const faqData = {
    title: "LKW-Fahrer buchen – Häufige Fragen",
    items: [
      {
        question: "Ist das Zeitarbeit oder Arbeitnehmerüberlassung?",
        answer: "<strong>Nein.</strong> Es handelt sich um eine <strong>Dienst-/Werkleistung</strong> ohne AÜG-Überlassung. Der LKW-Fahrer erbringt seine Leistung als selbstständiger Subunternehmer."
      },
      {
        question: "Wie schnell kann ein LKW-Fahrer starten?",
        answer: "Meist binnen <strong>24–48 Stunden</strong>. Bei dringenden Anfragen oft noch am selben Tag. Unsere registrierten C+E-Fahrer erhalten sofort eine Benachrichtigung."
      },
      {
        question: "Welche Führerscheinklassen sind verfügbar?",
        answer: "Hauptsächlich <strong>C+E (Sattelzug)</strong>, aber auch C, C1+E je nach Anfrage. Zusätzlich ADR-Schein, Kranführerschein oder Fahrmischer-Qualifikation."
      },
      {
        question: "Wie läuft die Abrechnung?",
        answer: "Sie erhalten <strong>eine Rechnung von Fahrerexpress</strong>. Der LKW-Fahrer stellt seine Leistung als Subunternehmer über uns in Rechnung. Transparente Tagespreise ohne versteckte Kosten."
      }
    ]
  };

  const relatedServices = [
    {
      title: "Tankwagenfahrer buchen",
      path: "/tankwagenfahrer-buchen",
      description: "ADR-Fahrer für Mineralöl, Chemie & Lebensmittel"
    },
    {
      title: "Fahrmischerfahrer",
      path: "/fahrmischerfahrer-gesucht", 
      description: "Erfahrene Betonmischer-Spezialisten"
    },
    {
      title: "Baumaschinenführer",
      path: "/baumaschinenfuehrer-buchen",
      description: "Bagger, Radlader, Kran-Operateure"
    },
    {
      title: "Kraftfahrer mieten",
      path: "/kraftfahrer-mieten",
      description: "Berufskraftfahrer für alle Fahrzeugklassen"
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

export default LKWFahrerBuchen;
import LandingPageLayout from "@/components/LandingPageLayout";

const FahrmischerfahrerGesucht = () => {
  const seoData = {
    title: "Fahrmischerfahrer gesucht – kurzfristig verfügbar | Fahrerexpress",
    description: "Erfahrene Fahrmischerfahrer kurzfristig für Betonwerke & Baustellen. Selbstständige Subunternehmer, transparente Preise, rechtssichere Abwicklung.",
    keywords: "Fahrmischerfahrer gesucht, Betonmischerfahrer, Fahrmischer Fahrer buchen, Betonfahrer mieten, Mischmeister, Transportbetonfahrer",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Fahrmischerfahrer gesucht",
      "description": "Erfahrene Fahrmischerfahrer kurzfristig für Betonwerke und Baustellen - selbstständige Subunternehmer ohne Arbeitnehmerüberlassung",
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
    h1: "Fahrmischerfahrer buchen – erfahren & zuverlässig",
    intro: "Für Betonlogistik und Baustellen liefern wir erfahrene Fahrmischerfahrer als selbstständige Subunternehmer. Abrechnung über Fahrerexpress, Dienst-/Werkvertrag, keine Arbeitnehmerüberlassung.",
    bullets: [
      "Fahrmischer & Mischmeister",
      "Baustellenroutine, QS-Abläufe",
      "Kurzfristig einplanbar"
    ]
  };

  const faqData = {
    title: "Fahrmischerfahrer – Häufige Fragen",
    items: [
      {
        question: "Können Fahrmischerfahrer auch Schichten/Nacht arbeiten?",
        answer: "<strong>Nach Absprache.</strong> Viele unserer Fahrmischerfahrer sind flexibel bei Arbeitszeiten und können auch Früh-, Spät- oder Nachtschichten übernehmen."
      },
      {
        question: "Wie läuft PPE/Sicherheitsunterweisung?",
        answer: "<strong>Nach Kundenvorgaben.</strong> Fahrmischerfahrer bringen persönliche Schutzausrüstung mit und nehmen an erforderlichen Sicherheitsunterweisungen teil."
      },
      {
        question: "Kennen sich die Fahrer mit Betonqualitäten aus?",
        answer: "Ja, unsere <strong>Fahrmischerfahrer sind erfahren</strong> mit verschiedenen Betonrezepturen, Additive und Qualitätskontroll-Verfahren auf der Baustelle."
      },
      {
        question: "Wie kurzfristig sind Fahrmischerfahrer verfügbar?",
        answer: "Meist <strong>binnen 24-48 Stunden</strong>. Bei dringenden Betonierungs-Terminen kontaktieren wir sofort verfügbare Fahrmischerfahrer in Ihrer Region."
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
      title: "Kraftfahrer mieten",
      path: "/kraftfahrer-mieten",
      description: "Berufskraftfahrer für alle Fahrzeugklassen"
    },
    {
      title: "Baumaschinenführer",
      path: "/baumaschinenfuehrer-buchen",
      description: "Bagger, Radlader, Kran-Operateure"
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

export default FahrmischerfahrerGesucht;
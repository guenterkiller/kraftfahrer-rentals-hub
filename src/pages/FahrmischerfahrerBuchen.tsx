import LandingPageLayout from "@/components/LandingPageLayout";

const FahrmischerfahrerBuchen = () => {
  const seoData = {
    title: "Fahrmischerfahrer buchen – Betonlogistik | Fahrerexpress",
    description: "Fahrmischerfahrer und Mischmeister kurzfristig mieten – erfahren, bundesweit verfügbar, transparente Preise.",
    keywords: "Fahrmischerfahrer buchen, Mischmeister, Betonmischer Fahrer, Fahrmischer, Betonlogistik",
    faqData: [
      {
        question: "Sind auch Mischmeister mit Erfahrung verfügbar?",
        answer: "Ja, unsere Fahrmischerfahrer sind erfahrene Mischmeister mit langjähriger Praxis im Betonmischer-Betrieb. Kenntnisse in Betonlogistik und Baustellen-Versorgung inklusive."
      },
      {
        question: "Welche Qualifikationen haben die Fahrmischerfahrer?",
        answer: "Erfahrene Mischmeister mit langjähriger Praxis im Betonmischer-Betrieb. Kenntnisse in Betonlogistik und Baustellen-Versorgung."
      },
      {
        question: "Wie schnell ist ein Fahrmischerfahrer verfügbar?",
        answer: "In der Regel 24–72 Stunden Vorlauf (werktags) ab schriftlicher Bestätigung. Same-Day ist ausgeschlossen."
      },
      {
        question: "Welche Fahrmischer können gefahren werden?",
        answer: "Alle gängigen Betonmischer und Fahrmischer. Von kleineren Fahrmischern bis zu großvolumigen Betonmisch-LKW – je nach Baustellen-Anforderung."
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Fahrmischerfahrer buchen",
      "description": "Fahrmischerfahrer und Mischmeister für Betonlogistik und Baustellen-Versorgung",
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
        "price": "489",
        "priceCurrency": "EUR",
        "description": "Fahrmischerfahrer Tagespreis für 8 Stunden"
      }
    }
  };

  const heroData = {
    h1: "Fahrmischerfahrer buchen – ab 60 €/h bzw. 489 € netto/Tag",
    intro: "Sie benötigen kurzfristig einen erfahrenen Fahrmischerfahrer für Betonlogistik? Über Fahrerexpress buchen Sie bundesweit qualifizierte Mischmeister und Fahrmischerfahrer für Baustellen-Versorgung. Rechtssichere Dienst-/Werkleistung durch selbstständige Subunternehmer ohne Arbeitnehmerüberlassung. Kurzeinsätze 60 €/h, Standardtag 489 €, Projektpreis ab 4 Wochen 469 €.",
    bullets: [
      "Erfahrene Mischmeister",
      "Betonlogistik-Expertise",
      "Bundesweite Verfügbarkeit"
    ]
  };

  const faqData = {
    title: "Häufige Fragen zur Fahrmischerfahrer Buchung",
    items: [
      {
        question: "Welche Qualifikationen haben die Fahrmischerfahrer?",
        answer: "<strong>Erfahrene Mischmeister</strong> mit langjähriger Praxis im Betonmischer-Betrieb. Kenntnisse in Betonlogistik und Baustellen-Versorgung."
      },
      {
        question: "Wie schnell ist ein Fahrmischerfahrer verfügbar?",
        answer: "In der Regel <strong>24–72 Stunden Vorlauf</strong> (werktags) ab schriftlicher Bestätigung. Same-Day ist ausgeschlossen."
      },
      {
        question: "Sind die Fahrmischerfahrer versichert?",
        answer: "<strong>Ja, vollständig versichert.</strong> Alle Fahrmischerfahrer verfügen über entsprechende Berufshaftpflicht und Fahrzeugversicherungen."
      },
      {
        question: "Welche Fahrmischer können gefahren werden?",
        answer: "Alle gängigen <strong>Betonmischer und Fahrmischer</strong>. Von kleineren Fahrmischern bis zu großvolumigen Betonmisch-LKW – je nach Baustellen-Anforderung."
      }
    ]
  };

  const relatedServices = [
    {
      title: "Tankwagenfahrer",
      path: "/tankwagenfahrer-buchen",
      description: "ADR-Tankwagenfahrer für Gefahrgut-Transport"
    },
    {
      title: "ADR-Fahrer",
      path: "/adr-fahrer-buchen",
      description: "Gefahrgut-Fahrer mit ADR-Schein"
    },
    {
      title: "Kranfahrer",
      path: "/kranfahrer-buchen",
      description: "Mobilkran-Operateure mit Kranschein"
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

export default FahrmischerfahrerBuchen;
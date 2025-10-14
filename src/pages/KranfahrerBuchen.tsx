import LandingPageLayout from "@/components/LandingPageLayout";

const KranfahrerBuchen = () => {
  const seoData = {
    title: "Kranfahrer buchen – Mobilkran & Baustellen | Fahrerexpress",
    description: "Erfahrene Kranfahrer kurzfristig mieten – mit Kranschein, bundesweit verfügbar, rechtssicher als Subunternehmer.",
    keywords: "Kranfahrer buchen, Mobilkran Fahrer, Kranoperateur, Kranschein Fahrer, Baustellen Kranfahrer",
    faqData: [
      {
        question: "Welche Krantypen können bedient werden?",
        answer: "Alle gängigen Mobilkrane und Autokrane. Von kleineren Mobilkranen bis zu großen Teleskopkranen – je nach Hebekapazität und Einsatzbereich. Unsere Fahrer haben Erfahrung mit verschiedensten Krantypen."
      },
      {
        question: "Welche Kranscheine haben die Fahrer?",
        answer: "Aktuelle Kranführerscheine für verschiedene Krantypen. Mobilkran, Turmdrehkran und Ladekran-Qualifikationen je nach Anforderung."
      },
      {
        question: "Wie schnell ist ein Kranfahrer verfügbar?",
        answer: "In der Regel 24–72 Stunden Vorlauf (werktags) ab schriftlicher Bestätigung. Same-Day ist ausgeschlossen."
      },
      {
        question: "Sind die Kranfahrer versichert?",
        answer: "Ja, vollständig versichert. Alle Kranfahrer verfügen über entsprechende Berufshaftpflicht und Maschinenversicherungen."
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Kranfahrer buchen",
      "description": "Kranfahrer und Mobilkran-Operateure für Baustellen und Hebeeinsätze",
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
        "price": "539",
        "priceCurrency": "EUR",
        "description": "Kranfahrer Tagespreis für 8 Stunden"
      }
    }
  };

  const heroData = {
    h1: "Kranfahrer buchen – ab 68 €/h bzw. 539 € netto/Tag",
    intro: "Sie benötigen kurzfristig einen erfahrenen Kranfahrer für Mobilkran-Einsätze? Über Fahrerexpress buchen Sie bundesweit qualifizierte Kranoperateure mit gültigem Kranschein für Baustellen und Hebevorgänge. Rechtssichere Dienst-/Werkleistung durch selbstständige Subunternehmer ohne Arbeitnehmerüberlassung. Kurzeinsätze 68 €/h, Standardtag 539 €, Projektpreis ab 4 Wochen 519 €.",
    bullets: [
      "Kranschein & Zertifizierung",
      "Mobilkran-Expertise",
      "Bundesweite Verfügbarkeit"
    ]
  };

  const faqData = {
    title: "Häufige Fragen zur Kranfahrer Buchung",
    items: [
      {
        question: "Welche Kranscheine haben die Fahrer?",
        answer: "<strong>Aktuelle Kranführerscheine</strong> für verschiedene Krantypen. Mobilkran, Turmdrehkran und Ladekran-Qualifikationen je nach Anforderung."
      },
      {
        question: "Wie schnell ist ein Kranfahrer verfügbar?",
        answer: "In der Regel <strong>24–72 Stunden Vorlauf</strong> (werktags) ab schriftlicher Bestätigung. Same-Day ist ausgeschlossen."
      },
      {
        question: "Sind die Kranfahrer versichert?",
        answer: "<strong>Ja, vollständig versichert.</strong> Alle Kranfahrer verfügen über entsprechende Berufshaftpflicht und Maschinenversicherungen."
      },
      {
        question: "Welche Krantypen können bedient werden?",
        answer: "Alle gängigen <strong>Mobilkrane und Autokrane</strong>. Von kleineren Mobilkranen bis zu großen Teleskopkranen – je nach Hebekapazität und Einsatzbereich."
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
      title: "Fahrmischerfahrer",
      path: "/fahrmischerfahrer-buchen",
      description: "Betonmischer-Spezialisten & Mischmeister"
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

export default KranfahrerBuchen;
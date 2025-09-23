import LandingPageLayout from "@/components/LandingPageLayout";

const TankwagenfahrerBuchen = () => {
  const seoData = {
    title: "Tankwagenfahrer buchen mit ADR-Schein – Gefahrgut Transport | Fahrerexpress",
    description: "ADR-Tankwagenfahrer für Mineralöl, Chemie & Lebensmittel kurzfristig buchen. Gefahrgut-Transport bundesweit, transparente Preise, rechtssicher.",
    keywords: "Tankwagenfahrer buchen, ADR-Fahrer mieten, Gefahrgut Transport, Tankwagen ADR, Mineralöl Transport, Chemie Tankwagen",
    faqData: [
      {
        question: "Haben die Fahrer einen gültigen ADR-Schein?",
        answer: "Ja, alle Tankwagenfahrer verfügen über aktuelle ADR-Scheine für alle relevanten Gefahrgutklassen. Spezialisierung auf Mineralöl, Chemie und Lebensmitteltransporte mit regelmäßigen Fortbildungen."
      },
      {
        question: "Wie schnell ist ein Tankwagenfahrer verfügbar?",
        answer: "In der Regel 24–72 Stunden Vorlauf (werktags) ab schriftlicher Bestätigung. Same-Day ist ausgeschlossen."
      },
      {
        question: "Sind die Fahrer versichert für Gefahrgut?",
        answer: "Ja, vollständig versichert. Alle Tankwagenfahrer verfügen über entsprechende Berufshaftpflicht und ADR-Versicherungen für Gefahrguttransporte."
      },
      {
        question: "Welche Fahrzeugtypen können gefahren werden?",
        answer: "Alle gängigen Tankwagen und Silofahrzeuge. Von kleineren Tankwagen bis zu großvolumigen Sattelzug-Tankaufliegern – je nach Transportanforderung."
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Tankwagenfahrer buchen",
      "description": "ADR-Tankwagenfahrer für Gefahrgut-Transporte - spezialisiert auf Mineralöl, Chemie und Lebensmittelbereich",
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
        "price": "449",
        "priceCurrency": "EUR",
        "description": "Tankwagenfahrer (ADR) Tagespreis für 8 Stunden"
      }
    }
  };

  const heroData = {
    h1: "Tankwagenfahrer buchen – ADR-Fahrer ab 449 €",
    intro: "Sie benötigen kurzfristig einen ADR-Tankwagenfahrer für Gefahrgut-Transporte? Über Fahrerexpress buchen Sie bundesweit qualifizierte Tankwagenfahrer mit gültigem ADR-Schein für Mineralöl, Chemie und Lebensmitteltransporte. Rechtssichere Dienst-/Werkleistung ohne Arbeitnehmerüberlassung.",
    bullets: [
      "ADR-Schein aktuell & gültig",
      "Mineralöl, Chemie & Lebensmittel", 
      "Bundesweite Verfügbarkeit"
    ]
  };

  const faqData = {
    title: "Tankwagenfahrer buchen – Häufige Fragen",
    items: [
      {
        question: "Welche ADR-Qualifikationen haben die Fahrer?",
        answer: "<strong>Aktuelle ADR-Scheine</strong> für alle relevanten Gefahrgutklassen. Spezialisierung auf <strong>Mineralöl, Chemie und Lebensmitteltransporte</strong>. Regelmäßige Fortbildungen und Zertifizierungen."
      },
      {
        question: "Wie schnell ist ein Tankwagenfahrer verfügbar?",
        answer: "In der Regel <strong>24–72 Stunden Vorlauf</strong> (werktags) ab schriftlicher Bestätigung. Same-Day ist ausgeschlossen."
      },
      {
        question: "Sind die Fahrer versichert für Gefahrgut?",
        answer: "<strong>Ja, vollständig versichert.</strong> Alle Tankwagenfahrer verfügen über entsprechende Berufshaftpflicht und ADR-Versicherungen für Gefahrguttransporte."
      },
      {
        question: "Welche Fahrzeugtypen können gefahren werden?",
        answer: "Alle gängigen <strong>Tankwagen und Silofahrzeuge</strong>. Von kleineren Tankwagen bis zu großvolumigen Sattelzug-Tankaufliegern – je nach Transportanforderung."
      }
    ]
  };

  const relatedServices = [
    {
      title: "LKW-Fahrer buchen",
      path: "/lkwfahrer-buchen",
      description: "Standard C/CE-Fahrer für alle Transportarten"
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

export default TankwagenfahrerBuchen;
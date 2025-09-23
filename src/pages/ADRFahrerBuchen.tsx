import LandingPageLayout from "@/components/LandingPageLayout";
import adrHero from "@/assets/adr-fahrer-hero.jpg";

const ADRFahrerBuchen = () => {
  const seoData = {
    title: "ADR-Fahrer buchen – Gefahrgut-Transporte | Fahrerexpress",
    description: "ADR-Fahrer für Gefahrgut kurzfristig mieten – selbstständige Subunternehmer, bundesweit verfügbar, transparent & rechtssicher.",
    keywords: "ADR-Fahrer buchen, Gefahrgut Transport, ADR-Schein Fahrer, Gefahrguttransport, Fahrer mieten ADR",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "ADR-Fahrer buchen",
      "description": "ADR-Fahrer für Gefahrgut-Transporte - kurzfristig verfügbar und rechtssicher",
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
        "description": "ADR-Fahrer Tagespreis für 8 Stunden"
      }
    }
  };

  const heroData = {
    h1: "ADR-Fahrer buchen – ab 539 € netto/Tag",
    intro: "Sie benötigen kurzfristig einen ADR-Fahrer für Gefahrgut-Transporte? Über Fahrerexpress buchen Sie bundesweit qualifizierte ADR-Fahrer mit gültigem Gefahrgutschein. Rechtssichere Dienst-/Werkleistung durch selbstständige Subunternehmer ohne Arbeitnehmerüberlassung.",
    bullets: [
      "ADR-Schein aktuell & gültig",
      "Gefahrgut-Transport Expertise",
      "Bundesweite Verfügbarkeit"
    ],
    heroImage: adrHero,
    heroImageAlt: "ADR-Fahrer buchen deutschlandweit - Gefahrgut Transport mit orange Warntafel"
  };

  const faqData = {
    title: "Häufige Fragen zur ADR-Fahrer Buchung",
    items: [
      {
        question: "Welche ADR-Qualifikationen haben die Fahrer?",
        answer: "<strong>Aktuelle ADR-Scheine</strong> für alle relevanten Gefahrgutklassen. Regelmäßige Fortbildungen und Zertifizierungen nach den neuesten Vorschriften."
      },
      {
        question: "Wie schnell ist ein ADR-Fahrer verfügbar?",
        answer: "Bei dringenden Anfragen oft <strong>binnen 24 Stunden</strong>. Unser Pool an ADR-Fahrern ermöglicht kurzfristige Einsätze deutschlandweit."
      },
      {
        question: "Sind die Fahrer für Gefahrgut versichert?",
        answer: "<strong>Ja, vollständig versichert.</strong> Alle ADR-Fahrer verfügen über entsprechende Berufshaftpflicht und Gefahrgut-Versicherungen."
      },
      {
        question: "Welche Fahrzeugtypen können gefahren werden?",
        answer: "Alle gängigen <strong>Gefahrgut-Fahrzeuge</strong>. Von Transportern bis zu Sattelzügen – je nach ADR-Klasse und Transportanforderung."
      }
    ]
  };

  const relatedServices = [
    {
      title: "Tankwagenfahrer",
      path: "/tankwagenfahrer-buchen",
      description: "ADR-Tankwagenfahrer für Mineralöl & Chemie"
    },
    {
      title: "Kranfahrer",
      path: "/kranfahrer-buchen",
      description: "Mobilkran-Operateure mit Kranschein"
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

export default ADRFahrerBuchen;
import LandingPageLayout from "@/components/LandingPageLayout";

const BegleitfahrzeugeBF3 = () => {
  const seoData = {
    title: "BF3-Begleitfahrzeuge buchen – Schwertransport Begleitung | Fahrerexpress",
    description: "BF3-Begleitfahrzeuge für Schwertransporte kurzfristig buchen. Qualifizierte Fahrer mit BF3-Berechtigung für Großraum- und Schwertransport-Begleitung bundesweit.",
    keywords: "BF3 Begleitfahrzeuge, Schwertransport Begleitung, BF3 Berechtigung, Begleitfahrer buchen, Wechselverkehrszeichenanlage, Großraum Transport, Schwerlast Begleitung",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "BF3-Begleitfahrzeuge buchen",
      "description": "BF3-Begleitfahrzeuge und qualifizierte Begleitfahrer für Schwertransporte und Großraumtransporte",
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
        "price": "649",
        "priceCurrency": "EUR",
        "description": "BF3-Begleitfahrzeug mit qualifiziertem Fahrer Tagespreis für 8 Stunden"
      }
    }
  };

  const heroData = {
    h1: "BF3-Begleitfahrzeuge buchen – ab 649 € netto/Tag",
    intro: "Sie benötigen kurzfristig ein BF3-Begleitfahrzeug für Schwertransporte? Über Fahrerexpress buchen Sie bundesweit qualifizierte Begleitfahrer mit gültiger BF3-Berechtigung und Wechselverkehrszeichenanlage. Für Großraum- und Schwertransporte gemäß StVO. Rechtssichere Dienst-/Werkleistung ohne Arbeitnehmerüberlassung.",
    bullets: [
      "BF3-Berechtigung & WVZA-Ausrüstung",
      "Schwertransport-Erfahrung",
      "Bundesweite Verfügbarkeit 24/7"
    ]
  };

  const faqData = {
    title: "BF3-Begleitfahrzeuge – Häufige Fragen",
    items: [
      {
        question: "Was ist ein BF3-Begleitfahrzeug?",
        answer: "<strong>BF3-Begleitfahrzeuge</strong> sind speziell ausgerüstete Fahrzeuge mit <strong>Wechselverkehrszeichenanlage (WVZA)</strong> für die Begleitung von Schwer- und Großraumtransporten. Gemäß StVO § 46 für Transporte über 3,50m Breite oder besondere Gefahrensituationen."
      },
      {
        question: "Welche Qualifikationen haben die BF3-Fahrer?",
        answer: "<strong>Gültige BF3-Berechtigung</strong> nach Richtlinie für die Ausbildung und Prüfung von Begleitfahrzeugführern. Regelmäßige Fortbildungen und mehrjährige Erfahrung im <strong>Schwertransport-Begleitwesen</strong>."
      },
      {
        question: "Wie schnell ist ein BF3-Begleitfahrzeug verfügbar?",
        answer: "Bei dringenden Anfragen oft <strong>binnen 12-24 Stunden</strong>. Unser Pool an BF3-Fahrern ermöglicht kurzfristige Einsätze deutschlandweit, auch am Wochenende und an Feiertagen."
      },
      {
        question: "Welche Ausrüstung ist im BF3-Fahrzeug enthalten?",
        answer: "<strong>Komplette WVZA-Ausrüstung:</strong> Wechselverkehrszeichenanlage, Rundumkennleuchten, Funkgerät, Warneinrichtungen gemäß StVO. Alle Fahrzeuge TÜV-geprüft und vollständig versichert."
      },
      {
        question: "Für welche Transporte wird BF3 benötigt?",
        answer: "<strong>Breite über 3,50m:</strong> Baumaschinen, Fertigteile, Windkraftanlagen. <strong>Besondere Gefahren:</strong> Tiefbettransporte, außergewöhnliche Ladung. Gemäß behördlicher Genehmigung und Routenfestlegung."
      }
    ]
  };

  const relatedServices = [
    {
      title: "Schwertransport-Fahrer",
      path: "/lkw-fahrer-buchen",
      description: "Erfahrene Fahrer für Schwer- und Großraumtransporte"
    },
    {
      title: "Kranfahrer buchen", 
      path: "/kranfahrer-buchen",
      description: "Mobilkran-Operateure für Hebevorgänge"
    },
    {
      title: "Baumaschinenführer",
      path: "/baumaschinenfuehrer-buchen", 
      description: "Bagger, Radlader und Spezialmaschinen"
    },
    {
      title: "LKW-Fahrer allgemein",
      path: "/lkw-fahrer-buchen",
      description: "Standard C/CE-Fahrer für alle Transportarten"
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

export default BegleitfahrzeugeBF3;
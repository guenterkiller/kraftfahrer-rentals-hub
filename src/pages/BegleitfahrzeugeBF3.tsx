import LandingPageLayout from "@/components/LandingPageLayout";

const BegleitfahrzeugeBF3 = () => {
  const seoData = {
    title: "BF3-Fahrer buchen – Qualifizierte Begleitfahrer für Schwertransport | Fahrerexpress",
    description: "BF3-Fahrer mit gültiger Berechtigung für Schwertransporte kurzfristig buchen. Qualifizierte Begleitfahrer für Großraum- und Schwertransport-Begleitung bundesweit. Fahrzeug stellen Sie.",
    keywords: "BF3 Fahrer, Schwertransport Begleitung, BF3 Berechtigung, Begleitfahrer buchen, WVZA Fahrer, Großraum Transport, Schwerlast Begleitung, BF3 qualifiziert",
    faqData: [
      {
        question: "Stellen Sie auch das Begleitfahrzeug?",
        answer: "Nein, wir vermitteln ausschließlich qualifizierte BF3-Fahrer. Das entsprechend ausgerüstete Begleitfahrzeug mit WVZA-Anlage stellt der Auftraggeber. Unsere Fahrer bringen nur ihre BF3-Berechtigung und Erfahrung mit."
      },
      {
        question: "Was ist die BF3-Berechtigung?",
        answer: "Die BF3-Berechtigung qualifiziert Fahrer zur Führung von Begleitfahrzeugen mit Wechselverkehrszeichenanlage (WVZA) für Schwer- und Großraumtransporte. Gemäß StVO § 46 für Transporte über 3,50m Breite erforderlich."
      },
      {
        question: "Welche Qualifikationen haben die BF3-Fahrer?",
        answer: "Gültige BF3-Berechtigung nach Richtlinie für die Ausbildung und Prüfung von Begleitfahrzeugführern. Regelmäßige Fortbildungen und mehrjährige Erfahrung im Schwertransport-Begleitwesen."
      },
      {
        question: "Für welche Transporte wird BF3 benötigt?",
        answer: "Breite über 3,50m: Baumaschinen, Fertigteile, Windkraftanlagen. Besondere Gefahren: Tiefbettransporte, außergewöhnliche Ladung. Gemäß behördlicher Genehmigung und Routenfestlegung."
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "BF3-Fahrer buchen",
      "description": "Qualifizierte BF3-Fahrer für Schwertransporte und Großraumtransporte. Begleitfahrzeug stellt Auftraggeber.",
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
        "description": "BF3-qualifizierter Fahrer Tagespreis für 8 Stunden (Fahrzeug nicht enthalten)"
      }
    }
  };

  const heroData = {
    h1: "BF3-Fahrer buchen – ab 649 € netto/Tag",
    intro: "Sie benötigen kurzfristig einen qualifizierten BF3-Fahrer für Schwertransporte? Über Fahrerexpress buchen Sie bundesweit erfahrene Begleitfahrer mit gültiger BF3-Berechtigung. Das entsprechend ausgerüstete Begleitfahrzeug stellen Sie. Rechtssichere Dienst-/Werkleistung ohne Arbeitnehmerüberlassung.",
    bullets: [
      "Gültige BF3-Berechtigung",
      "Mehrjährige Schwertransport-Erfahrung",
      "Bundesweite Verfügbarkeit 24/7"
    ]
  };

  const faqData = {
    title: "BF3-Fahrer – Häufige Fragen",
    items: [
      {
        question: "Stellen Sie auch das Begleitfahrzeug?",
        answer: "<strong>Nein, wir vermitteln ausschließlich Fahrer.</strong> Das entsprechend ausgerüstete Begleitfahrzeug mit <strong>Wechselverkehrszeichenanlage (WVZA)</strong> stellt der Auftraggeber. Unsere Fahrer bringen die BF3-Berechtigung und langjährige Erfahrung mit."
      },
      {
        question: "Welche Qualifikationen haben die BF3-Fahrer?",
        answer: "<strong>Gültige BF3-Berechtigung</strong> nach Richtlinie für die Ausbildung und Prüfung von Begleitfahrzeugführern. Regelmäßige Fortbildungen und mehrjährige Erfahrung im <strong>Schwertransport-Begleitwesen</strong>."
      },
      {
        question: "Wie schnell ist ein BF3-Fahrer verfügbar?",
        answer: "In der Regel <strong>24–72 Stunden Vorlauf</strong> (werktags) ab schriftlicher Bestätigung. Same-Day ist ausgeschlossen."
      },
      {
        question: "Was muss das Begleitfahrzeug haben?",
        answer: "<strong>Ihr Fahrzeug benötigt:</strong> Wechselverkehrszeichenanlage (WVZA), Rundumkennleuchte gelb, Funkgerät, TÜV-Zulassung. Unser Fahrer übernimmt die Bedienung Ihrer Ausrüstung."
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
      title: "Baumaschinenführer",
      path: "/baumaschinenfuehrer-buchen", 
      description: "Bagger, Radlader und Spezialmaschinen"
    },
    {
      title: "LKW-Fahrer allgemein",
      path: "/lkw-fahrer-buchen",
      description: "C/CE-Fahrer für alle Transportarten"
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
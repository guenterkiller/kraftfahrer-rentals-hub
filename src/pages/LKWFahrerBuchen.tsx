import LandingPageLayout from "@/components/LandingPageLayout";

const LKWFahrerBuchen = () => {
  const seoData = {
    title: "CE-LKW-Fahrer buchen ab 349 € – Standard-Kategorie deutschlandweit",
    description: "CE-LKW-Fahrer für alle Einsatzarten buchen: Fahrmischer, ADR, Fernverkehr, Nahverkehr – einheitlich 349 €/Tag, 30 € Überstunde. Rechtssicher & kurzfristig.",
    keywords: "CE-LKW-Fahrer buchen, LKW-Fahrer mieten, Kraftfahrer Standard, Fahrmischer, ADR-Fahrer, CE Fahrer deutschlandweit",
    faqData: [
      {
        question: "Ist das Zeitarbeit oder Arbeitnehmerüberlassung?",
        answer: "Nein. Es handelt sich um eine Dienst-/Werkleistung ohne AÜG-Überlassung. Der LKW-Fahrer erbringt seine Leistung als selbstständiger Subunternehmer."
      },
      {
        question: "Wie schnell kann ein LKW-Fahrer starten?",
        answer: "In der Regel 24–72 Stunden Vorlauf (werktags) ab schriftlicher Bestätigung. Same-Day ist ausgeschlossen."
      },
      {
        question: "Welche Führerscheinklassen sind verfügbar?",
        answer: "Hauptsächlich C+E (Sattelzug), aber auch C, C1+E je nach Anfrage. Zusätzlich ADR-Schein, Ladekran-Erfahrung oder Fahrmischer-Qualifikation."
      },
      {
        question: "Wie läuft die Abrechnung?",
        answer: "Sie erhalten eine Rechnung von Fahrerexpress. Der LKW-Fahrer stellt seine Leistung als Subunternehmer über uns in Rechnung. Transparente Tagespreise ohne versteckte Kosten."
      }
    ],
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
    h1: "LKW-Fahrer buchen – ab 399 € netto/Tag",
    intro: "Sie benötigen kurzfristig einen LKW-Fahrer (C/CE) für Transport, Baustelle oder Überführung? Über Fahrerexpress buchen Sie bundesweit selbstständige Berufskraftfahrer – flexibel, zuverlässig und mit Rechnung von Fahrerexpress. Die Leistung wird als Dienst-/Werkvertrag erbracht (kein AÜG). Kurzeinsätze 55 €/h, Standardtag 399 €, Projektpreis ab 4 Wochen 379 €. Auf Wunsch Spezialqualifikationen wie ADR, Kran, Fahrmischer.",
    bullets: [
      "C/CE-Fahrer für Nah- & Fernverkehr",
      "ADR / Kran / Fahrmischer verfügbar", 
      "Kurzfristig (24-72h) verfügbar"
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
        answer: "In der Regel <strong>24–72 Stunden Vorlauf</strong> (werktags) ab schriftlicher Bestätigung. Same-Day ist ausgeschlossen."
      },
      {
        question: "Welche Führerscheinklassen sind verfügbar?",
        answer: "Hauptsächlich <strong>C+E (Sattelzug)</strong>, aber auch C, C1+E je nach Anfrage. Zusätzlich ADR-Schein, Ladekran-Erfahrung oder Fahrmischer-Qualifikation."
      },
      {
        question: "Wie läuft die Abrechnung?",
        answer: "Sie erhalten <strong>eine Rechnung von Fahrerexpress</strong>. Der LKW-Fahrer stellt seine Leistung als Subunternehmer über uns in Rechnung. Transparente Tagespreise ohne versteckte Kosten."
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
      title: "Baumaschinenführer",
      path: "/baumaschinenfuehrer-buchen",
      description: "Bagger, Radlader & Erdbaumaschinen"
    },
    {
      title: "Fahrmischerfahrer",
      path: "/fahrmischerfahrer-buchen",
      description: "Betonmischer-Spezialisten & Mischmeister"
    },
    {
      title: "ADR-Fahrer",
      path: "/adr-fahrer-buchen",
      description: "Gefahrgut-Fahrer mit ADR-Schein"
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
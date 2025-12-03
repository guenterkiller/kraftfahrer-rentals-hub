import { useEffect } from "react";
import LandingPageLayout from "@/components/LandingPageLayout";

const LKWFahrerBuchen = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'category_view_lkw', {
        event_category: 'Page View',
        event_label: 'LKW CE Fahrer',
        value: 349
      });
    }
  }, []);
  const seoData = {
    title: "LKW CE Fahrer buchen deutschlandweit – Ersatzfahrer ab 349 €/Tag | Fahrerexpress",
    description: "LKW Fahrer deutschlandweit buchen – CE-Fahrer für Speditionen, Baustellen, Fernverkehr in ganz Deutschland. Kurzfristig verfügbar, ohne Arbeitnehmerüberlassung. 349 € pro Tag.",
    keywords: "LKW Fahrer buchen deutschlandweit, CE Fahrer deutschlandweit verfügbar, Ersatzfahrer LKW bundesweit, LKW Fahrer für Speditionen deutschlandweit, CE Fahrer für Sattelzug buchen, LKW Fahrer kurzfristig verfügbar, Fahrer für Baustellen deutschlandweit, Notfallfahrer bundesweit, Urlaubsvertretung LKW Fahrer, ADR-Fahrer deutschlandweit, Fahrmischer Fahrer bundesweit, LKW Fahrer mieten",
    hreflang: {
      'de': 'https://kraftfahrer-mieten.com/lkw-fahrer-buchen',
      'de-AT': 'https://kraftfahrer-mieten.com/lkw-fahrer-buchen',
      'de-CH': 'https://kraftfahrer-mieten.com/lkw-fahrer-buchen',
      'x-default': 'https://kraftfahrer-mieten.com/lkw-fahrer-buchen'
    },
    faqData: [
      {
        question: "Ist das Zeitarbeit?",
        answer: "Nein. Es handelt sich um eine Dienst-/Werkleistung. Der LKW-Fahrer erbringt seine Leistung als selbstständiger Subunternehmer."
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
        answer: "Sie erhalten ausschließlich eine Rechnung von Fahrerexpress. Die Fahrer stellen ihre Rechnung an uns – Sie haben keine zweite Rechnung. Transparente Tagespreise ohne versteckte Kosten."
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "LKW-Fahrer buchen deutschlandweit",
      "description": "LKW-Fahrer (C/CE) deutschlandweit buchen – kurzfristig verfügbare Berufskraftfahrer in ganz Deutschland als selbstständige Subunternehmer",
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
      },
      "offers": {
        "@type": "Offer",
        "price": "349",
        "priceCurrency": "EUR",
        "description": "LKW-Fahrer (C+E) Tagespreis für 8 Stunden"
      }
    }
  };

  const heroData = {
    h1: "LKW CE Fahrer deutschlandweit buchen",
    intro: "Qualifizierte CE-Fahrer für alle Einsatzarten in ganz Deutschland: Fahrmischer, Wechselbrücke, Container, ADR. Sie erhalten eine übersichtliche Rechnung direkt von der Fahrerexpress-Agentur. Transparente Preise: 349 € pro Tag (8h), 30 € Überstunde. Wochenpreis ab 1.490 €.",
    bullets: ["Alle Einsatzarten", "349 € pro Tag", "Deutschlandweit kurzfristig verfügbar"]
  };

  const faqData = {
    title: "LKW-Fahrer buchen – Häufige Fragen",
    items: [
      {
        question: "Wie funktioniert die Zusammenarbeit?",
        answer: "Sie erhalten eine übersichtliche Rechnung direkt von der Fahrerexpress-Agentur. Die Einsätze werden über uns gebündelt abgerechnet – die Fahrer arbeiten als selbstständige Unternehmer. <strong>Hinweis:</strong> Unsere Fahrer arbeiten als selbstständige Unternehmer auf Basis eines Dienst- oder Werkvertrags. Es handelt sich nicht um Arbeitnehmerüberlassung."
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
        question: "Wie sehen die Konditionen aus?",
        answer: "<strong>Transparente Tagespreise:</strong> 349 € pro Tag (8h), 30 € Überstunde, Wochenpreis ab 1.490 €. Fahrtkosten: 25 km inklusive, danach 0,40 € pro Kilometer. Keine versteckten Kosten."
      }
    ]
  };

  const relatedServices = [
    {
      title: "Baumaschinenführer",
      path: "/baumaschinenfuehrer-buchen",
      description: "Vermittelte Baumaschinenführer – 459 € pro Tag"
    },
    {
      title: "Preise & Konditionen",
      path: "/preise-und-ablauf",
      description: "Alle Preise und Ablauf im Detail"
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
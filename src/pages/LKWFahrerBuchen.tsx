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
    title: "LKW CE Fahrer buchen – Vermittelte Fahrer ab 349 €",
    description: "Qualifizierte CE-Fahrer für alle Logistik-Einsatzarten: Fahrmischer, Wechselbrücke, Container, ADR. 349 € pro Tag.",
    keywords: "CE-LKW-Fahrer, LKW CE Fahrer, Fahrmischer, ADR-Fahrer, LKW Fahrer Deutschland, LKW Fahrer Österreich, LKW Fahrer Schweiz, Berufskraftfahrer DACH, CE Fahrer EU, truck driver hire Germany",
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
        "areaServed": ["DE", "AT", "CH"]
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
    h1: "LKW CE Fahrer buchen",
    intro: "Qualifizierte CE-Fahrer für alle Einsatzarten: Fahrmischer, Wechselbrücke, Container, ADR. Selbstständige Fahrer, transparente Preise: 349 € pro Tag (8h), 30 € Überstunde. Wochenpreis ab 1.490 €.",
    bullets: ["Alle Einsatzarten", "349 € pro Tag", "Deutschlandweit verfügbar"]
  };

  const faqData = {
    title: "LKW-Fahrer buchen – Häufige Fragen",
    items: [
      {
        question: "Wie funktioniert die Zusammenarbeit?",
        answer: "<strong>Unsere Fahrer arbeiten als selbstständige Unternehmer</strong> auf Basis eines Dienst-/Werkvertrags. Es handelt sich nicht um Arbeitnehmerüberlassung. Der Abschluss eines Einsatzes erfolgt direkt zwischen Ihnen und dem Fahrer – wir übernehmen die professionelle Vermittlung."
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
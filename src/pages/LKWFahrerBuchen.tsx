import { useEffect } from "react";
import LandingPageLayout from "@/components/LandingPageLayout";

const LKWFahrerBuchen = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'category_view_standard', {
        event_category: 'Page View',
        event_label: 'Standard CE-LKW-Fahrer',
        value: 349
      });
    }
  }, []);
  const seoData = {
    title: "LKW- / Speditionsfahrer (CE) buchen – Vermittelte Fahrer ab 349 €",
    description: "Qualifizierte CE-Fahrer für alle Logistik-Einsatzarten: Fahrmischer, Wechselbrücke, Container, ADR. 349 € pro Tag.",
    keywords: "CE-LKW-Fahrer, Speditionsfahrer, Fahrmischer, ADR-Fahrer",
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
    h1: "LKW- / Speditionsfahrer (CE) buchen",
    intro: "Qualifizierte CE-Fahrer für alle Speditions-Einsatzarten: Fahrmischer, Wechselbrücke, Container, ADR. 349 € pro Tag (8h), 30 € Überstunde. Wochenpreis ab 1.490 €.",
    bullets: ["Alle Speditions-Einsatzarten", "349 € pro Tag", "Deutschlandweit verfügbar"]
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
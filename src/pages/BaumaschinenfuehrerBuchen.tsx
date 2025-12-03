import { useEffect } from "react";
import LandingPageLayout from "@/components/LandingPageLayout";

const BaumaschinenfuehrerBuchen = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'category_view_baumaschinen', {
        event_category: 'Page View',
        event_label: 'Baumaschinenführer',
        value: 459
      });
    }
  }, []);
  const seoData = {
    title: "Baumaschinenführer buchen deutschlandweit – Baggerfahrer bundesweit ab 459 €",
    description: "Baumaschinenführer deutschlandweit buchen – Bagger, Radlader, Fahrmischer in ganz Deutschland. Kurzfristig verfügbar, ohne Arbeitnehmerüberlassung. 459 € pro Tag.",
    keywords: "Baumaschinenführer deutschlandweit buchen, Baggerfahrer bundesweit, Radladerfahrer deutschlandweit, Baumaschinenführer kurzfristig verfügbar, Fahrer für Baustellen deutschlandweit, Baumaschinenführer mieten bundesweit, selbstständige Baumaschinenführer",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Baumaschinenführer buchen deutschlandweit",
      "description": "Baumaschinenführer deutschlandweit buchen – Bagger, Radlader, Fahrmischer, Mischanlagen in ganz Deutschland. Kurzfristig verfügbar, selbstständige Subunternehmer.",
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
      }
    }
  };

  const heroData = {
    h1: "Baumaschinenführer deutschlandweit buchen",
    intro: "Qualifizierte Baumaschinenführer in ganz Deutschland: Bagger, Radlader, Fahrmischer, Flüssigboden, Mischanlagen, Störungsbehebung. Selbstständige Experten bundesweit verfügbar, transparente Preise: 459 € pro Tag (8h), 60 € Überstunde.",
    bullets: ["Alle Baumaschinen & Anlagen", "Deutschlandweit kurzfristig verfügbar", "459 € pro Tag"]
  };

  const faqData = {
    title: "Baumaschinenführer buchen – Häufige Fragen",
    items: [
      {
        question: "Welche Baumaschinen werden abgedeckt?",
        answer: "<strong>Alle gängigen Baumaschinen:</strong> Baggerfahren, Radladerfahren, Fahrmischer & Betonlogistik, Flüssigboden (Mischmeister), Bedienung von Mischanlagen, Störungsbehebung & Reparaturkenntnisse, Baustellenlogistik, Materialfluss, Prozessüberwachung."
      },
      {
        question: "Welche Qualifikationen haben die Baumaschinenführer?",
        answer: "<strong>Umfassende Erfahrung und Zertifizierungen</strong> für alle genannten Baumaschinen und Anlagen. Langjährige Praxis in Baustellenlogistik und technischer Problemlösung."
      },
      {
        question: "Warum ist der Preis höher als bei CE-Fahrern?",
        answer: "<strong>Höhere technische Anforderungen:</strong> Baumaschinenbedienung erfordert spezialisierte Kenntnisse, umfassendere technische Fähigkeiten und eigenständige Prozessverantwortung. Ideal für anspruchsvolle Bauprojekte."
      },
      {
        question: "Wie sind die Konditionen?",
        answer: "<strong>459 € pro Tag (8 Stunden), 60 € pro Überstunde.</strong> Fahrtkosten: 25 km inklusive, danach 0,40 € pro Kilometer. Sie stellen die Geräte/Maschinen/Anlagen."
      }
    ]
  };

  const relatedServices = [
    {
      title: "LKW CE Fahrer",
      path: "/lkw-fahrer-buchen",
      description: "Vermittelte CE-Fahrer – 349 € pro Tag"
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

export default BaumaschinenfuehrerBuchen;
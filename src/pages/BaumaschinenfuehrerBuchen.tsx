import { useEffect } from "react";
import LandingPageLayout from "@/components/LandingPageLayout";

const BaumaschinenfuehrerBuchen = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'category_view_premium', {
        event_category: 'Page View',
        event_label: 'Premium All-in-One Maschinenbediener',
        value: 459
      });
    }
  }, []);
  const seoData = {
    title: "Baumaschinenbedienung buchen – Günter Killer persönlich ab 459 €",
    description: "Günter Killer persönlich für Bagger, Radlader, Fahrmischer, Flüssigboden, Mischanlagen. 459 € pro Tag.",
    keywords: "Baumaschinenbedienung, Günter Killer, Baggerfahrer, Radlader",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Baumaschinenbedienung – Günter Killer persönlich",
      "description": "Günter Killer persönlich für Baumaschinenbedienung: Bagger, Radlader, Fahrmischer, Flüssigboden, Mischanlagen, Störungsbehebung, Reparaturen, Baustellenlogistik",
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
      }
    }
  };

  const heroData = {
    h1: "Baumaschinenbedienung – Günter Killer persönlich",
    intro: "Günter Killer persönlich für Bagger, Radlader, Fahrmischer, Flüssigboden, Mischanlagen, Störungsbehebung. 459 € pro Tag (8h), 60 € Überstunde.",
    bullets: ["Günter Killer persönlich", "Alle Baumaschinen", "Störungsbehebung & Reparaturen"]
  };

  const faqData = {
    title: "Baumaschinenbedienung – Häufige Fragen",
    items: [
      {
        question: "Was macht Günter Killer bei der Baumaschinenbedienung?",
        answer: "<strong>Vielseitiger Maschinenbediener:</strong> Baggerfahren, Radladerfahren, Fahrmischer & Betonlogistik, Flüssigboden (Mischmeister), Bedienung von Mischanlagen, Störungsbehebung & Reparaturkenntnisse, Baustellenlogistik, Materialfluss koordinieren, Prozessüberwachung."
      },
      {
        question: "Welche Qualifikationen hat Günter Killer?",
        answer: "<strong>Umfassende Erfahrung und Zertifizierungen</strong> für alle genannten Baumaschinen und Anlagen. Langjährige Praxis in Baustellenlogistik und technischer Problemlösung."
      },
      {
        question: "Warum Günter Killer persönlich?",
        answer: "<strong>Direkter Einsatz von Günter Killer persönlich</strong> statt vermittelter Fahrer. Höhere Expertise im Baumaschinenbereich, umfassendere technische Kenntnisse, eigenständige Prozessverantwortung. Ideal für anspruchsvolle Bauprojekte."
      },
      {
        question: "Wie sind die Konditionen?",
        answer: "<strong>459 € pro Tag (8 Stunden), 60 € pro Überstunde.</strong> Fahrtkosten: 25 km inklusive, danach 0,40 € pro Kilometer. Sie stellen die Geräte/Maschinen/Anlagen."
      }
    ]
  };

  const relatedServices = [
    {
      title: "LKW- / Speditionsfahrer (CE)",
      path: "/lkw-fahrer-buchen",
      description: "Vermittelte Fahrer – 349 € pro Tag"
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
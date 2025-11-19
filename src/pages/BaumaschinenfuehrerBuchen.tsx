import LandingPageLayout from "@/components/LandingPageLayout";

const BaumaschinenfuehrerBuchen = () => {
  const seoData = {
    title: "Premium All-in-One Maschinenbediener buchen – Günter Killer persönlich ab 459 €",
    description: "Premium-Kategorie: Günter Killer persönlich als All-in-One Maschinenbediener für Bagger, Radlader, Fahrmischer, Flüssigboden, Mischanlagen, Störungsbehebung, Reparaturen, Baustellenlogistik. 459 € pro Tag (8h), 60 € Überstunde. Deutschlandweit verfügbar.",
    keywords: "All-in-One Maschinenbediener, Premium Baumaschinenführer, Günter Killer, Bagger Radlader Fahrmischer, Flüssigboden Mischmeister, Baustellenlogistik, technische Störungsbehebung",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Premium All-in-One Maschinenbediener – Günter Killer",
      "description": "Premium-Kategorie: Günter Killer persönlich als All-in-One Maschinenbediener für Bagger, Radlader, Fahrmischer, Flüssigboden, Störungsbehebung und mehr",
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
    h1: "Premium All-in-One Maschinenbediener – Günter Killer persönlich",
    intro: "Premium-Kategorie: Günter Killer persönlich als vielseitiger All-in-One Maschinenbediener. Einsatzbereiche: Bagger, Radlader, Fahrmischer, Flüssigboden, Mischanlagen, kleinere Reparaturen, technische Störungsbehebung, Baustellenlogistik, Materialfluss, eigenständige Prozessüberwachung. 459 € pro Tag (8 Stunden), 60 € pro Überstunde. Sie stellen die Geräte, wir den Experten.",
    bullets: [
      "Günter Killer persönlich",
      "All-in-One: Bagger, Radlader, Fahrmischer, Mischanlagen",
      "Störungsbehebung & Baustellenlogistik"
    ]
  };

  const faqData = {
    title: "Premium All-in-One Maschinenbediener – Häufige Fragen",
    items: [
      {
        question: "Was macht Günter Killer als All-in-One Maschinenbediener?",
        answer: "<strong>Vielseitiger Experte:</strong> Bagger, Radlader, Fahrmischer, Flüssigbodenanlagen, Mischanlagen bedienen. Zusätzlich: kleinere Reparaturen, technische Störungsbehebung, Baustellenlogistik, Materialfluss koordinieren, eigenständige Prozessüberwachung."
      },
      {
        question: "Welche Qualifikationen hat Günter Killer?",
        answer: "<strong>Umfassende Erfahrung und Zertifizierungen</strong> für alle genannten Maschinen und Anlagen. Langjährige Praxis in Baustellenlogistik und technischer Problemlösung."
      },
      {
        question: "Warum Premium-Kategorie?",
        answer: "<strong>Direkter Einsatz von Günter Killer persönlich</strong> statt vermittelter Fahrer. Höhere Expertise, umfassendere Einsatzmöglichkeiten, eigenständige Prozessverantwortung. Ideal für anspruchsvolle Projekte und komplexe Baustellenabläufe."
      },
      {
        question: "Wie sind die Konditionen?",
        answer: "<strong>459 € pro Tag (8 Stunden), 60 € pro Überstunde.</strong> Fahrtkosten: 25 km inklusive, danach 0,40 € pro Kilometer. Sie stellen die Geräte/Maschinen."
      }
    ]
  };

  const relatedServices = [
    {
      title: "Standard – CE-LKW-Fahrer",
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
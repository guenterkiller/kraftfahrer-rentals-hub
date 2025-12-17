import { useEffect } from "react";
import LandingPageLayout from "@/components/LandingPageLayout";

const ErsatzfahrerLkw = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'category_view_ersatzfahrer', {
        event_category: 'Page View',
        event_label: 'Ersatzfahrer LKW',
        value: 349
      });
    }
  }, []);

  const seoData = {
    title: "Ersatzfahrer LKW – Sofort-Vertretung bei Fahrerausfall",
    description: "Ersatzfahrer LKW bei Krankheit, Urlaub oder Fahrerausfall. Vertretungsfahrer deutschlandweit in 24-72h verfügbar. Keine Arbeitnehmerüberlassung.",
    keywords: "Ersatzfahrer LKW, Ersatzfahrer LKW sofort, LKW Fahrer Krankheitsvertretung, Vertretungsfahrer, Krankheitsvertretung Fahrer, Urlaubsvertretung LKW, Fahrerausfall, Notfallfahrer LKW, kurzfristiger Ersatz, LKW Fahrer Vertretung, Aushilfsfahrer Krankheit, Ersatz LKW Fahrer, spontaner Ersatzfahrer, Fahrerengpass, Personalengpass LKW",
    hreflang: {
      'de': 'https://www.kraftfahrer-mieten.com/ersatzfahrer-lkw',
      'x-default': 'https://www.kraftfahrer-mieten.com/ersatzfahrer-lkw'
    },
    faqData: [
      {
        question: "Wie schnell bekomme ich einen Ersatzfahrer bei Fahrerausfall?",
        answer: "In der Regel 24–72 Stunden Vorlauf (werktags). Wir haben deutschlandweit Fahrer auf Abruf."
      },
      {
        question: "Was kostet ein Ersatzfahrer pro Tag?",
        answer: "349 € pro Tag (8h) für LKW CE-Fahrer. Keine versteckten Kosten, transparente Abrechnung."
      },
      {
        question: "Ist das Arbeitnehmerüberlassung?",
        answer: "Nein. Unsere Ersatzfahrer arbeiten als selbstständige Subunternehmer auf Dienst-/Werkvertragsbasis."
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Ersatzfahrer LKW bei Fahrerausfall",
      "description": "Kurzfristige Ersatzfahrer und Vertretungsfahrer für LKW bei Krankheit, Urlaub oder spontanem Ausfall – deutschlandweit verfügbar",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Fahrerexpress-Agentur – Günter Killer",
        "url": "https://www.kraftfahrer-mieten.com",
        "telephone": "+49-1577-1442285"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Deutschland"
      },
      "offers": {
        "@type": "Offer",
        "price": "349",
        "priceCurrency": "EUR",
        "description": "Ersatzfahrer LKW Tagespreis"
      }
    }
  };

  const heroData = {
    h1: "Ersatzfahrer LKW – Schnelle Hilfe bei Fahrerausfall",
    intro: "Ihr Fahrer fällt kurzfristig aus? Krankheit, Urlaub oder spontaner Engpass – wir vermitteln Ersatzfahrer und Vertretungsfahrer deutschlandweit. Kein Stillstand, keine verpassten Touren. Selbstständige Fahrer auf Abruf, ab 349 € pro Tag.",
    bullets: ["Krankheitsvertretung in 24-72h", "Urlaubsvertretung planbar", "Kein AÜG notwendig"]
  };

  const faqData = {
    title: "Ersatzfahrer LKW – Häufige Fragen",
    items: [
      {
        question: "Wann brauche ich einen Ersatzfahrer?",
        answer: "<strong>Typische Situationen:</strong> Krankheit, Unfall, Urlaub, Kündigungen, plötzliche Auftragsspitzen. Mit einem Ersatzfahrer vermeiden Sie Ausfallzeiten und halten Ihre Lieferketten stabil."
      },
      {
        question: "Wie schnell kann ein Ersatzfahrer starten?",
        answer: "In der Regel <strong>24–72 Stunden</strong> (werktags) ab Bestätigung. Same-Day ist ausgeschlossen – wir brauchen Zeit für Matching und Anfahrt."
      },
      {
        question: "Sind Ersatzfahrer teurer als reguläre Fahrer?",
        answer: "Die Tagespauschale von <strong>349 € (8h)</strong> ist fix – egal ob geplante Urlaubsvertretung oder spontaner Krankheitsfall. Keine Zuschläge für Kurzfristigkeit."
      },
      {
        question: "Wie läuft die Vertretung organisatorisch ab?",
        answer: "Sie buchen, wir matchen einen geeigneten Fahrer aus unserem Pool. Der Fahrer kommt mit seinem Know-how – <strong>Fahrzeug und Einweisung stellen Sie</strong>. Eine Rechnung, kein Papierkram."
      },
      {
        question: "Was passiert bei längerer Krankheit?",
        answer: "Kein Problem – Ersatzfahrer sind tage- oder wochenweise buchbar. Bei längeren Einsätzen besprechen wir individuelle Konditionen. Flexibel verlängerbar."
      },
      {
        question: "Haben die Fahrer die nötigen Qualifikationen?",
        answer: "Ja. Alle Fahrer haben gültige <strong>Führerscheinklasse C+E, Module 95 und Fahrerkarte</strong>. Auf Wunsch auch ADR-Schein oder Kranschein."
      },
      {
        question: "Muss ich bei Ersatzfahrern etwas bei der BG melden?",
        answer: "Nein. Da unsere Fahrer <strong>selbstständig</strong> sind, ist das deren eigene Sache. Sie haben keine sozialversicherungsrechtlichen Pflichten."
      }
    ]
  };

  const relatedServices = [
    {
      title: "LKW-Fahrer buchen",
      path: "/lkw-fahrer-buchen",
      description: "Alle Infos zu LKW CE Fahrern"
    },
    {
      title: "Preise & Ablauf",
      path: "/preise-und-ablauf",
      description: "Transparente Preisübersicht"
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

export default ErsatzfahrerLkw;

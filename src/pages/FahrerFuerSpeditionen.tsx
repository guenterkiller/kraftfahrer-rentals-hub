import { useEffect } from "react";
import LandingPageLayout from "@/components/LandingPageLayout";

const FahrerFuerSpeditionen = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'category_view_speditionen', {
        event_category: 'Page View',
        event_label: 'Fahrer für Speditionen',
        value: 349
      });
    }
  }, []);

  const seoData = {
    title: "Fahrer für Speditionen – Externe LKW Fahrer buchen",
    description: "Externe Fahrer für Speditionen und Logistikunternehmen. Subunternehmer-Fahrer bei Personalengpass, Auftragsspitzen oder Krankheit. Ab 349 €/Tag.",
    keywords: "Fahrer für Speditionen, Speditionsfahrer, externe Fahrer Spedition, LKW Fahrer Logistik, Subunternehmer Spedition, Fahrer Transportunternehmen, Berufskraftfahrer Spedition, Fernfahrer buchen, Nahverkehr Fahrer, Verteilerverkehr Fahrer, Spedition Personalengpass, Logistik Fahrer mieten",
    hreflang: {
      'de': 'https://www.kraftfahrer-mieten.com/fahrer-fuer-speditionen',
      'x-default': 'https://www.kraftfahrer-mieten.com/fahrer-fuer-speditionen'
    },
    faqData: [
      {
        question: "Kennen sich Ihre Fahrer mit Speditionsabläufen aus?",
        answer: "Ja. Unsere Fahrer haben Erfahrung mit Ladungssicherung, Zollpapieren, Lieferscheinen und typischen Speditionsanforderungen."
      },
      {
        question: "Können Fahrer auch Fernverkehr fahren?",
        answer: "Ja. Wir haben Fahrer für Nahverkehr, Fernverkehr und internationale Touren (je nach Qualifikation)."
      },
      {
        question: "Wie funktioniert die Einweisung in unser System?",
        answer: "Der Fahrer bekommt von Ihnen eine Einweisung in Fahrzeug, Touren und interne Abläufe. Das dauert meist 30-60 Minuten."
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Fahrer für Speditionen deutschlandweit",
      "description": "Externe LKW-Fahrer für Speditionen und Logistikunternehmen – selbstständige Subunternehmer für Nah- und Fernverkehr",
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
        "description": "Speditionsfahrer Tagespreis"
      }
    }
  };

  const heroData = {
    h1: "Fahrer für Speditionen – Externe Kapazitäten buchen",
    intro: "Personalengpass in der Spedition? Auftragsspitze, Urlaubszeit oder Krankheitswelle? Wir vermitteln erfahrene LKW-Fahrer für Speditionen und Logistikunternehmen – deutschlandweit, als selbstständige Subunternehmer. Ab 349 € pro Tag.",
    bullets: ["Erfahrung mit Speditionsabläufen", "Nah- und Fernverkehr", "Keine Arbeitnehmerüberlassung"]
  };

  const faqData = {
    title: "Fahrer für Speditionen – Häufige Fragen",
    items: [
      {
        question: "Welche Erfahrung haben Ihre Fahrer mit Speditionen?",
        answer: "Unsere Fahrer haben <strong>Praxis in Logistik und Transport:</strong> Ladungssicherung, Lieferscheine, Zollpapiere, Tourenplanung. Viele kommen selbst aus Speditionen."
      },
      {
        question: "Nahverkehr oder Fernverkehr – was bieten Sie?",
        answer: "Beides. <strong>Nahverkehr:</strong> Verteilertouren, Stückgut, Baustellenbelieferung. <strong>Fernverkehr:</strong> Nationale und internationale Touren (EU). Geben Sie bei der Anfrage an, was Sie brauchen."
      },
      {
        question: "Wie integriere ich den Fahrer in meinen Betrieb?",
        answer: "Kurze <strong>Einweisung in Ihr Fahrzeug und Ihre Abläufe</strong> (30-60 Min). Danach übernimmt der Fahrer die zugewiesenen Touren. Ihre Disposition plant, der Fahrer fährt."
      },
      {
        question: "Können Fahrer auch Telematik und Scanner bedienen?",
        answer: "Ja, viele Fahrer kennen <strong>gängige Telematiksysteme</strong> (Fleetboard, TomTom, etc.) und Handscanner. Spezifische Systeme erklären Sie kurz vor Ort."
      },
      {
        question: "Was wenn ein Fahrer nicht zu uns passt?",
        answer: "Ehrliches Feedback – wir suchen dann einen Ersatz. Unser Ziel: <strong>Langfristige Zusammenarbeit</strong>, nicht einmaliges Vermitteln. Passende Fahrer kommen gerne wieder."
      },
      {
        question: "Können wir den gleichen Fahrer mehrfach buchen?",
        answer: "<strong>Ja, wenn verfügbar.</strong> Viele Speditionen buchen wiederholt dieselben Fahrer – das spart Einarbeitung und schafft Verlässlichkeit."
      },
      {
        question: "Warum Subunternehmer statt Zeitarbeit?",
        answer: "<strong>Einfacher für Sie:</strong> Keine Sozialabgaben, keine AÜG-Bürokratie, keine Tarifbindung. Der Fahrer arbeitet als Selbstständiger – Sie zahlen eine Tagespauschale, fertig."
      },
      {
        question: "Was ist bei Schäden oder Unfällen?",
        answer: "Unsere Fahrer haben <strong>eigene Haftpflichtversicherung</strong>. Bei Unfällen mit Ihrem Fahrzeug greift Ihre Kfz-Versicherung. Grobe Fahrlässigkeit: Der Fahrer haftet selbst."
      }
    ]
  };

  const relatedServices = [
    {
      title: "LKW-Fahrer buchen",
      path: "/lkw-fahrer-buchen",
      description: "Alle LKW CE Fahrer-Infos"
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

export default FahrerFuerSpeditionen;

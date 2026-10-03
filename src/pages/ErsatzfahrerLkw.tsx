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
    title: "Ersatzfahrer LKW – Vertretung bei Krankheit, Urlaub & Fahrerausfall | Fahrerexpress",
    description: "Fahrer krank, im Urlaub oder ausgefallen? Ersatzfahrer LKW als Krankheits- oder Urlaubsvertretung – selbstständige CE-Fahrer deutschlandweit nach Verfügbarkeit.",
    keywords: "Ersatzfahrer, Ersatzfahrer LKW, Fahrer Vertretung, Krankheitsvertretung, Urlaubsvertretung, Fahrer krank, Fahrer ausgefallen",
    hreflang: {
      'de': 'https://www.kraftfahrer-mieten.com/ersatzfahrer-lkw',
      'x-default': 'https://www.kraftfahrer-mieten.com/ersatzfahrer-lkw'
    },
    faqData: [
      {
        question: "Mein Fahrer ist krank – wo bekomme ich kurzfristig Ersatz?",
        answer: "Stellen Sie eine Anfrage über das Formular oder rufen Sie an. Wir suchen schnellstmöglich einen passenden selbstständigen CE-Fahrer als Ersatzfahrer für Ihren LKW – deutschlandweit und nach Verfügbarkeit. Kurzfristige Einsätze ab etwa 24 Stunden Vorlauf sind je nach Fahrerverfügbarkeit möglich. Eine kurzfristige Vermittlung können wir jedoch nicht garantieren."
      },
      {
        question: "Was kostet ein Ersatzfahrer pro Tag?",
        answer: "349 € pro Einsatztag für LKW-Fahrer CE, zzgl. An- und Abfahrt. Einsatzdauer bis maximal 9 Stunden je Einsatztag. Keine versteckten Kosten, transparente Abrechnung."
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
      "description": "Vermittlung selbstständiger CE-Fahrer als Ersatzfahrer für den vorhandenen LKW des Auftraggebers bei Krankheit, Urlaub oder Fahrerausfall – deutschlandweit nach Verfügbarkeit. Keine Fahrzeugvermietung, keine Arbeitnehmerüberlassung.",
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
    h1: "Ersatzfahrer LKW – wenn Ihr Fahrer krank ist oder ausfällt",
    intro: "Ihr Fahrer ist krank, im Urlaub oder heute nicht erschienen – und der LKW steht ohne Fahrer? Wir suchen schnellstmöglich einen passenden selbstständigen CE-Fahrer als Vertretung für Ihr Fahrzeug, deutschlandweit und nach Verfügbarkeit. Ab 349 € pro Einsatztag. Wir vermitteln Fahrer, keine Fahrzeuge.",
    bullets: ["Krankheits- & Urlaubsvertretung", "Für Ihren vorhandenen LKW", "Keine Arbeitnehmerüberlassung"]
  };

  const faqData = {
    title: "Krankheitsvertretung und Urlaubsvertretung für LKW-Fahrer – Häufige Fragen",
    items: [
      {
        question: "Mein Fahrer ist krank – wo bekomme ich kurzfristig Ersatz?",
        answer: "Stellen Sie eine Anfrage über das Formular oder rufen Sie an. Wir suchen <strong>schnellstmöglich einen passenden selbstständigen CE-Fahrer</strong> als Ersatzfahrer für Ihren LKW – deutschlandweit und nach Verfügbarkeit."
      },
      {
        question: "Was tun, wenn ein Fahrer morgens nicht erscheint?",
        answer: "Wenn Ihr Fahrer ausgefallen ist und der LKW ohne Fahrer steht, fragen Sie die benötigten Einsatztage direkt an. Wir prüfen nach Eingang, welcher Fahrer verfügbar ist, und melden uns schnellstmöglich. Ein Einsatz am selben Tag ist ausgeschlossen."
      },
      {
        question: "Wann brauche ich einen Ersatzfahrer?",
        answer: "<strong>Typische Situationen:</strong> Fahrer krank, Unfall, Urlaub, Kündigung oder ein Fahrer erscheint nicht. Ein Ersatzfahrer übernimmt als Vertretung Ihr vorhandenes Fahrzeug, damit der LKW nicht stillsteht."
      },
      {
        question: "Wie schnell kann ein Ersatzfahrer starten?",
        answer: "Wir melden uns schnellstmöglich nach Eingang Ihrer Anfrage. Kurzfristige Einsätze ab etwa 24 Stunden Vorlauf sind je nach Fahrerverfügbarkeit möglich. Eine kurzfristige Vermittlung können wir jedoch nicht garantieren."
      },
      {
        question: "Sind Ersatzfahrer teurer als reguläre Fahrer?",
        answer: "Die Tagespauschale von <strong>349 € pro Einsatztag</strong> ist fix – egal ob geplante Urlaubsvertretung oder spontaner Krankheitsfall. Zusätzlich: An- und Abfahrt. Keine Zuschläge für Kurzfristigkeit."
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

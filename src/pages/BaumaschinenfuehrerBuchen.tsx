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
    title: "Baumaschinenführer buchen deutschlandweit – ab 459 €/Tag",
    description: "Baumaschinenführer mieten, leihen oder bestellen – Baggerfahrer, Radladerfahrer auf Abruf. Tageweise, ohne AÜG. 459 €/Tag.",
    keywords: "Baumaschinenführer buchen, Baumaschinenführer mieten, Baumaschinenführer leihen, Baggerfahrer bestellen, Radladerfahrer mieten, Baustellen Fahrer, Fahrer auf Abruf, Fahrer tageweise, Aushilfsfahrer Baustelle, Ersatzfahrer Baumaschine, Mietfahrer Bagger, externe Fahrer-Dienstleistungen, Fahrer Dienstleister Bau",
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
    intro: "Qualifizierte Bediener für Bagger, Radlader, Fahrmischer, Flüssigboden-Mischanlagen deutschlandweit. Wir vermitteln ausschließlich selbstständige Maschinenführer – keine Maschinen. Gerät/Anlage stellt der Auftraggeber. 459 € pro Tag (8h), 60 € Überstunde.",
    bullets: ["Nur Bediener – keine Maschinen", "Deutschlandweit kurzfristig verfügbar", "459 € pro Tag"]
  };

  const faqData = {
    title: "Baumaschinenführer buchen – Häufige Fragen",
    items: [
      {
        question: "Werden Maschinen mitgeliefert?",
        answer: "<strong>Nein.</strong> Wir vermitteln ausschließlich qualifizierte Bediener/Maschinenführer. Die Maschinen, Geräte und Anlagen stellt der Auftraggeber. Unsere Fahrer bringen nur ihre Qualifikation und Erfahrung mit."
      },
      {
        question: "Welche Baumaschinen können bedient werden?",
        answer: "<strong>Alle gängigen Baumaschinen:</strong> Bagger, Radlader, Fahrmischer, Flüssigboden-Mischanlagen, Betonlogistik, Störungsbehebung, Baustellenlogistik, Materialfluss, Prozessüberwachung."
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
      },
      {
        question: "Vermitteln Sie Baggerfahrer und Radladerfahrer deutschlandweit?",
        answer: "Ja. Wir vermitteln selbstständige <strong>Baggerfahrer, Radladerfahrer und Baumaschinenführer deutschlandweit</strong> als Subunternehmer für einzelne Bauabschnitte, Tagesbaustellen oder komplette Projekte. Bundesweite Fahrer-Vermittlung ohne Maschinenvermietung."
      },
      {
        question: "Arbeiten Ihre Baumaschinenführer als Subunternehmer?",
        answer: "Ja. Alle vermittelten Baumaschinenführer sind <strong>selbstständige Subunternehmer</strong> und arbeiten für einzelne Bauabschnitte oder Tagesbaustellen. Die Vermittlung erfolgt per Dienst- oder Werkvertrag – keine Arbeitnehmerüberlassung erforderlich."
      },
      {
        question: "Bieten Sie auch Mischmeister für Flüssigboden an?",
        answer: "Ja. Wir vermitteln erfahrene <strong>Mischmeister und Anlagenbediener für Flüssigboden</strong> deutschlandweit als Subunternehmer. Der Mischmeister bedient Ihre bauseits gestellte Anlage – keine eigene Maschinenvermietung."
      },
      {
        question: "Wie schnell bekommen wir einen Ersatzfahrer bei Fahrerausfall?",
        answer: "Bei Fahrerausfall können Sie kurzfristig einen <strong>Aushilfsfahrer oder Mietfahrer</strong> bestellen. Unsere Ersatzfahrer sind deutschlandweit auf Abruf verfügbar – tageweise oder wochenweise. Externe Fahrer-Dienstleistungen für Baustellen sofort buchbar."
      },
      {
        question: "Kann ich einen Baumaschinenführer tageweise oder wochenweise bestellen?",
        answer: "Ja. Sie können <strong>Fahrer tageweise, wochenweise oder projektbezogen</strong> bestellen. Fahrer auf Abruf – flexibel nach Ihrem Bedarf. Als Fahrer-Dienstleister bieten wir externe Fahrer-Dienstleistungen für Baustellen."
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
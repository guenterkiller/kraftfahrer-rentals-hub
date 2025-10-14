import LandingPageLayout from "@/components/LandingPageLayout";

const BaumaschinenfuehrerBuchen = () => {
  const seoData = {
    title: "Baumaschinenführer buchen ab 62 €/h bzw. 489 € – Baggerfahrer & Radlader deutschlandweit",
    description: "Jetzt deutschlandweit Baumaschinenführer buchen: Baggerfahrer, Radladerfahrer, Mischmeister für Flüssigboden. Kurzeinsatz 62 €/h, Standardtag 489 €, Projekt ab 469 €. Geräte stellt der Auftraggeber. Rechtssicher & kurzfristig verfügbar.",
    keywords: "Baumaschinenführer buchen, Baggerfahrer mieten, Radladerfahrer buchen, Baumaschinenführer Subunternehmer, Mischmeister Flüssigboden deutschlandweit, Kranführer buchen, Maschinisten mieten",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Baumaschinenführer buchen",
      "description": "Baumaschinenführer kurzfristig für Bagger, Radlader und Kran - selbstständige Subunternehmer ohne Arbeitnehmerüberlassung",
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
    h1: "Baumaschinenführer buchen – Baggerfahrer & Radlader deutschlandweit",
    intro: "Deutschlandweit Baumaschinenführer für Erdarbeiten, Aushub und Verladung buchen. Baggerfahrer, Radladerfahrer und Mischmeister für Flüssigbodenanlagen als selbstständige Subunternehmer – Sie stellen die Geräte, wir den qualifizierten Fahrer.",
    bullets: [
      "Erfahrene Maschinisten",
      "Tages- bis Projekt-Einsätze", 
      "Deutschlandweit verfügbar"
    ]
  };

  const faqData = {
    title: "Baumaschinenführer – Häufige Fragen",
    items: [
      {
        question: "Welche Nachweise/Scheine werden bereitgestellt?",
        answer: "<strong>Werden bereitgestellt.</strong> Unsere Baumaschinenführer verfügen über gültige Führerscheine, Maschinenscheine und erforderliche Befähigungsnachweise."
      },
      {
        question: "Wie läuft die Sicherheitsunterweisung?",
        answer: "<strong>Vor Ort oder Online möglich.</strong> Je nach Baustellen-Anforderungen nehmen die Baumaschinenführer an SiGe-Unterweisungen teil."
      },
      {
        question: "Welche Baumaschinen können bedient werden?",
        answer: "Hauptsächlich <strong>Bagger (Mobilbagger, Raupenbagger)</strong>, <strong>Radlader</strong>, <strong>Mobilkrane</strong>, <strong>Mischmeister für Flüssigboden</strong> und weitere Erdbaumaschinen je nach Qualifikation. <em>Immer mit Ihren Geräten/Maschinen – keine Maschinenvermietung.</em>"
      },
      {
        question: "Wie lange dauern typische Einsätze?",
        answer: "Von <strong>Tageseinsätzen bis zu mehrwöchigen Projekten</strong>. Flexibel nach Ihrem Bauvorhaben und Verfügbarkeit der Baumaschinenführer."
      }
    ]
  };

  const relatedServices = [
    {
      title: "LKW-Fahrer buchen",
      path: "/lkw-fahrer-buchen",
      description: "Speziell C+E Sattelzugfahrer"
    },
    {
      title: "Kraftfahrer mieten",
      path: "/kraftfahrer-mieten",
      description: "Berufskraftfahrer für alle Fahrzeugklassen"
    },
    {
      title: "Fahrmischerfahrer",
      path: "/fahrmischerfahrer-gesucht",
      description: "Erfahrene Betonmischer-Spezialisten"
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
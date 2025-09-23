import LandingPageLayout from "@/components/LandingPageLayout";

const BaumaschinenfuehrerBuchen = () => {
  const seoData = {
    title: "Baumaschinenführer buchen – Bagger, Radlader, Kran | Fahrerexpress",
    description: "Baumaschinenführer kurzfristig: Bagger, Radlader, Kran. Selbstständige Subunternehmer, bundesweit, ohne AÜG – rechtssicherer Werk-/Dienstvertrag.",
    keywords: "Baumaschinenführer buchen, Baggerfahrer mieten, Radladerfahrer, Kranführer buchen, Maschinisten mieten, Baumaschinenoperateur",
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
    h1: "Baumaschinenführer buchen – Bagger & Radlader",
    intro: "Für Erd- und Tiefbauprojekte vermitteln wir selbstständige Baumaschinenführer (Bagger, Radlader, Kran). Einsatz im Werk-/Dienstvertrag, Abrechnung über Fahrerexpress, keine Arbeitnehmerüberlassung.",
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
        answer: "Hauptsächlich <strong>Bagger (Mobilbagger, Raupenbagger)</strong>, <strong>Radlader</strong>, <strong>Mobilkrane</strong> und weitere Erdbaumaschinen je nach Qualifikation."
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
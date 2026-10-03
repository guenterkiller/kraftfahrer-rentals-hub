import { useEffect } from "react";
import LandingPageLayout from "@/components/LandingPageLayout";

const Mietfahrer = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'category_view_mietfahrer', {
        event_category: 'Page View',
        event_label: 'Mietfahrer',
        value: 349
      });
    }
  }, []);

  const seoData = {
    title: "Mietfahrer & Leihfahrer LKW – Fahrer für einige Tage oder Wochen | Fahrerexpress",
    description: "LKW Fahrer mieten für einige Tage oder Wochen: Mietfahrer und Leihfahrer als selbstständige, vermittelte Fahrer – keine Arbeitnehmerüberlassung. Deutschlandweit ab 349 €/Tag.",
    keywords: "Mietfahrer, Leihfahrer, LKW Fahrer mieten, Leihfahrer LKW, Fahrer für eine Woche, offene Fahrerstelle überbrücken",
    hreflang: {
      'de': 'https://www.kraftfahrer-mieten.com/mietfahrer',
      'x-default': 'https://www.kraftfahrer-mieten.com/mietfahrer'
    },
    faqData: [
      {
        question: "Was ist ein Mietfahrer?",
        answer: "Ein Mietfahrer ist ein selbstständiger Berufskraftfahrer, den Sie tageweise oder wochenweise für Ihre Transporte buchen können – ohne Arbeitsvertrag."
      },
      {
        question: "Wie lange kann ich einen Mietfahrer buchen?",
        answer: "Flexibel: ab einem Tag bis mehrere Wochen. Sie zahlen nur die gebuchten Einsatztage."
      },
      {
        question: "Brauche ich einen Arbeitsvertrag mit dem Mietfahrer?",
        answer: "Nein. Der Mietfahrer arbeitet als selbstständiger Subunternehmer. Kein Arbeitsvertrag, keine Sozialabgaben für Sie."
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Mietfahrer für LKW deutschlandweit",
      "description": "Mietfahrer und Leihfahrer für LKW für einzelne Tage bis mehrere Wochen – Vermittlung selbstständiger Fahrer bei Personalengpass, Saisonspitze oder offener Fahrerstelle. Keine Arbeitnehmerüberlassung, keine Fahrzeugvermietung.",
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
        "description": "Mietfahrer LKW Tagespreis"
      }
    }
  };

  const heroData = {
    h1: "Mietfahrer und Leihfahrer LKW – für einige Tage oder mehrere Wochen",
    intro: "Sie brauchen einen Fahrer für eine Woche, eine Saisonspitze oder wollen eine offene Fahrerstelle überbrücken? Viele suchen dafür nach „LKW Fahrer mieten“ oder „Leihfahrer“. Bei uns bedeutet das: Wir vermitteln selbstständige LKW-Fahrer für genau Ihren Zeitraum – keine Arbeitnehmerüberlassung, kein Arbeitsvertrag. Ab 349 € pro Tag.",
    bullets: ["Tage bis mehrere Wochen", "Offene Stelle überbrücken", "Keine Arbeitnehmerüberlassung"]
  };

  const faqData = {
    title: "Mietfahrer, Leihfahrer, Zeitarbeit – Häufige Fragen",
    items: [
      {
        question: "Ist ein Leihfahrer bei Ihnen ein Leiharbeiter?",
        answer: "Nein. „Leihfahrer“ ist ein gängiger Suchbegriff – wir bieten jedoch <strong>keine Arbeitnehmerüberlassung</strong> an. Wir vermitteln selbstständige Fahrer, die auf Basis eines Dienst- oder Werkvertrags tätig sind."
      },
      {
        question: "Ich suche einen Fahrer für eine Woche – geht das?",
        answer: "Ja. Fahrer für einige Tage oder eine Woche sind nach Verfügbarkeit vermittelbar, auch zum Überbrücken einer offenen Fahrerstelle. Abgerechnet werden die tatsächlichen Einsatztage."
      },
      {
        question: "Was genau ist ein Mietfahrer?",
        answer: "Ein <strong>Mietfahrer</strong> ist ein selbstständiger Berufskraftfahrer, den Sie temporär für Ihre Transporte buchen. Anders als bei Leiharbeit: Kein Arbeitsvertrag, keine Sozialabgaben, keine langfristige Bindung."
      },
      {
        question: "Für welche Einsätze eignen sich Mietfahrer?",
        answer: "<strong>Saisonale Spitzen:</strong> Erntezeit, Weihnachtsgeschäft, Baustellensaison. <strong>Projektbezogen:</strong> Großbaustellen, Umzüge, Events. <strong>Flexibel:</strong> Bei unklarer Auftragslage."
      },
      {
        question: "Wie unterscheidet sich ein Mietfahrer von Zeitarbeit?",
        answer: "Mietfahrer sind <strong>selbstständige Unternehmer</strong> – keine Leiharbeiter. Sie zahlen eine Tagespauschale, keine Sozialabgaben. Die Fahrer haben eigene Steuernummer und rechnen über uns ab."
      },
      {
        question: "Kann ich einen Mietfahrer kurzfristig abbestellen?",
        answer: "Ja, mit angemessener Vorlaufzeit. Details klären wir bei Buchung. Keine versteckten Stornogebühren bei rechtzeitiger Absage."
      },
      {
        question: "Was muss ich als Auftraggeber bereitstellen?",
        answer: "Sie stellen <strong>Fahrzeug, Kraftstoff und Ladung</strong>. Der Mietfahrer bringt seine Qualifikation und Erfahrung mit. Kurze Einweisung in Ihr Fahrzeug genügt."
      },
      {
        question: "Sind Mietfahrer auch am Wochenende verfügbar?",
        answer: "Ja, nach Verfügbarkeit. <strong>Wochenend- und Feiertagszuschläge:</strong> Samstag +25 %, Sonntag und gesetzliche Feiertage +50 % auf den jeweiligen Tagessatz. Zuschläge gelten automatisch, wenn der Einsatz auf diese Tage fällt."
      },
      {
        question: "Wie buche ich einen Mietfahrer?",
        answer: "Einfach: <strong>Formular ausfüllen, Anfrage senden</strong>, wir melden uns mit passendem Fahrer. Bestätigung per E-Mail, Fahrer startet zum vereinbarten Termin."
      }
    ]
  };

  const relatedServices = [
    {
      title: "LKW-Fahrer buchen",
      path: "/lkw-fahrer-buchen",
      description: "Komplette Infos zu LKW CE Fahrern"
    },
    {
      title: "Ersatzfahrer",
      path: "/ersatzfahrer-lkw",
      description: "Bei Fahrerausfall schnell handeln"
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

export default Mietfahrer;

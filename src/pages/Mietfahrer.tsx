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
    title: "Mietfahrer LKW – tageweise mieten ab 349 €",
    description: "Mietfahrer für LKW tageweise oder wochenweise mieten. Flexibel, keine Bindung, keine AÜG. Ab 349 €/Tag deutschlandweit.",
    keywords: "Mietfahrer, LKW Fahrer mieten, Fahrer mieten, Mietfahrer LKW, Leihfahrer, Fahrer tageweise, Fahrer wochenweise, Fahrer auf Zeit, temporärer Fahrer, flexibler Fahrer, Miet-LKW-Fahrer",
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
      "description": "LKW Mietfahrer tageweise oder wochenweise mieten – flexible Fahrervermittlung ohne Arbeitnehmerüberlassung",
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
    h1: "Mietfahrer LKW – flexibel tageweise buchen",
    intro: "Brauchen Sie einen Fahrer nur für bestimmte Tage oder Wochen? Mit unseren Mietfahrern buchen Sie genau die Kapazität, die Sie brauchen – ohne langfristige Bindung. Ab 349 € pro Tag.",
    bullets: ["Tageweise buchbar", "Keine Vertragsbindung", "Flexible Verlängerung"]
  };

  const faqData = {
    title: "Mietfahrer – Häufige Fragen",
    items: [
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
        answer: "Ja, nach Absprache. <strong>Wochenend-Zuschläge:</strong> Samstag +25%, Sonntag +50%. Feiertage +100%. Alle Konditionen transparent vorab."
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

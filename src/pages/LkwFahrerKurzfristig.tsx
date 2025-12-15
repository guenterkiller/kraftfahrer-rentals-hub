import { useEffect } from "react";
import LandingPageLayout from "@/components/LandingPageLayout";

const LkwFahrerKurzfristig = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'category_view_kurzfristig', {
        event_category: 'Page View',
        event_label: 'LKW Fahrer kurzfristig',
        value: 349
      });
    }
  }, []);

  const seoData = {
    title: "LKW Fahrer kurzfristig buchen – Schnell & zuverlässig",
    description: "LKW Fahrer kurzfristig gesucht? Fahrer auf Abruf in 24-72h deutschlandweit. Spontane Buchung ohne langfristige Bindung. Ab 349 €/Tag.",
    keywords: "LKW Fahrer kurzfristig, Fahrer kurzfristig buchen, kurzfristiger LKW Fahrer, Fahrer auf Abruf, schnell Fahrer finden, LKW Fahrer sofort, dringend LKW Fahrer, Fahrer spontan, eilig Fahrer gesucht, kurzfristige Fahrervermittlung, schnelle Fahrerbeschaffung",
    hreflang: {
      'de': 'https://www.kraftfahrer-mieten.com/lkw-fahrer-kurzfristig',
      'x-default': 'https://www.kraftfahrer-mieten.com/lkw-fahrer-kurzfristig'
    },
    faqData: [
      {
        question: "Wie kurzfristig kann ich einen LKW Fahrer buchen?",
        answer: "Ab 24 Stunden Vorlauf werktags. Same-Day ist nicht möglich, aber 24-72h Reaktionszeit bei den meisten Anfragen."
      },
      {
        question: "Gibt es Zuschläge für kurzfristige Buchungen?",
        answer: "Nein. Der Tagespreis von 349 € gilt unabhängig von der Vorlaufzeit. Keine Extra-Kosten für Kurzfristigkeit."
      },
      {
        question: "Was wenn kein Fahrer verfügbar ist?",
        answer: "Wir sind ehrlich: Wenn kein passender Fahrer frei ist, sagen wir Ihnen das sofort. Meist finden wir aber schnell jemanden."
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "LKW Fahrer kurzfristig buchen",
      "description": "Kurzfristige Vermittlung von LKW-Fahrern deutschlandweit – schnelle Reaktionszeit, keine Bindung, selbstständige Subunternehmer",
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
        "description": "LKW Fahrer kurzfristig Tagespreis"
      }
    }
  };

  const heroData = {
    h1: "LKW Fahrer kurzfristig buchen – Schnelle Hilfe",
    intro: "Fahrer krank? Auftrag reinbekommen? Engpass in der Disposition? Wir vermitteln LKW-Fahrer kurzfristig – deutschlandweit, in 24-72 Stunden. Keine langen Vorlaufzeiten, keine Verträge. Einfach buchen, Fahrer kommt.",
    bullets: ["24-72h Reaktionszeit", "Keine Kurzfristigkeitszuschläge", "Deutschlandweit verfügbar"]
  };

  const faqData = {
    title: "LKW Fahrer kurzfristig – Häufige Fragen",
    items: [
      {
        question: "Was bedeutet kurzfristig bei Ihnen?",
        answer: "Wir können Fahrer in der Regel innerhalb von <strong>24–72 Stunden</strong> (werktags) bereitstellen. Das ist schneller als die meisten Personalagenturen – aber Same-Day ist ausgeschlossen."
      },
      {
        question: "Warum kein Same-Day-Service?",
        answer: "Ehrlichkeit: Unsere Fahrer sind <strong>Profis, keine Springer</strong>. Sie brauchen Zeit für Anfahrt, Einweisung, Vorbereitung. Qualität vor Schnelligkeit – dafür zuverlässig."
      },
      {
        question: "Was wenn der Fahrer morgen früh starten muss?",
        answer: "Wenn Sie heute Nachmittag buchen und morgen früh benötigen: <strong>Schwierig, aber möglich</strong> – je nach Fahrerverfügbarkeit in Ihrer Region. Fragen Sie an!"
      },
      {
        question: "Kosten kurzfristige Buchungen mehr?",
        answer: "<strong>Nein.</strong> Ob Sie 3 Wochen vorher oder 2 Tage vorher buchen – der Tagespreis bleibt 349 €. Keine Eilzuschläge, keine versteckten Kosten."
      },
      {
        question: "Wie erhöhe ich meine Chancen auf kurzfristige Verfügbarkeit?",
        answer: "<strong>Tipps:</strong> Flexibel beim Starttermin sein (+/- 1 Tag), genaue Infos geben (Fahrzeugtyp, Einsatzort, Dauer), früh am Tag anfragen. Je mehr Details, desto schneller finden wir jemanden."
      },
      {
        question: "Was wenn mein Einsatz länger dauert als geplant?",
        answer: "<strong>Kein Problem.</strong> Sie können den Fahrer tageweise verlängern. Überstunden (über 8h) werden mit 30 €/Stunde abgerechnet. Flexible Anpassung möglich."
      },
      {
        question: "Vermitteln Sie auch Fahrer für Nachtfahrten?",
        answer: "Ja. Nachtarbeit (20-6 Uhr) mit <strong>+25% Zuschlag</strong>. Viele Fahrer fahren regelmäßig nachts – geben Sie Ihren Bedarf bei der Anfrage an."
      }
    ]
  };

  const relatedServices = [
    {
      title: "Ersatzfahrer",
      path: "/ersatzfahrer-lkw",
      description: "Bei Fahrerausfall schnell handeln"
    },
    {
      title: "Mietfahrer",
      path: "/mietfahrer",
      description: "Fahrer tageweise mieten"
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

export default LkwFahrerKurzfristig;

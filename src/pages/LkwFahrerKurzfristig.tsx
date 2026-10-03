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
    title: "LKW Fahrer kurzfristig gesucht – für Zusatztouren & Auftragsspitzen | Fahrerexpress",
    description: "Fahrer kurzfristig gesucht für eine zusätzliche Tour oder Auftragsspitze? Wir vermitteln selbstständige LKW-Fahrer CE deutschlandweit nach Verfügbarkeit, ab 349 €/Tag.",
    keywords: "Fahrer kurzfristig, LKW Fahrer kurzfristig, kurzfristig Fahrer gesucht, LKW Fahrer gesucht, Fahrer für zusätzliche Tour, Auftragsspitze Fahrer",
    hreflang: {
      'de': 'https://www.kraftfahrer-mieten.com/lkw-fahrer-kurzfristig',
      'x-default': 'https://www.kraftfahrer-mieten.com/lkw-fahrer-kurzfristig'
    },
    faqData: [
      {
        question: "Wie kurzfristig kann ich einen LKW Fahrer anfragen?",
        answer: "Jederzeit. Wir suchen schnellstmöglich einen passenden selbstständigen CE-Fahrer – deutschlandweit und nach Verfügbarkeit. Ein Einsatz am selben Tag ist ausgeschlossen."
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
      "description": "Kurzfristige Vermittlung selbstständiger CE-Fahrer für zusätzliche Touren, Auftragsspitzen und unerwarteten Mehrbedarf – deutschlandweit nach Verfügbarkeit, ohne Kurzfristigkeitszuschlag. Keine Fahrzeugvermietung.",
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
    h1: "LKW Fahrer kurzfristig – für zusätzliche Touren und Auftragsspitzen",
    intro: "Kurzfristig Fahrer gesucht, weil ein neuer Auftrag reinkommt oder ein zusätzliches Fahrzeug besetzt werden muss? Wir suchen schnellstmöglich einen selbstständigen CE-Fahrer für Ihre zusätzliche Tour – deutschlandweit, nach Verfügbarkeit, ohne Kurzfristigkeitszuschlag. Wir vermitteln Fahrer, keine Fahrzeuge.",
    bullets: ["Zusatztouren besetzen", "Keine Kurzfristigkeitszuschläge", "Deutschlandweit"]
  };

  const faqData = {
    title: "LKW Fahrer kurzfristig gesucht – Häufige Fragen",
    items: [
      {
        question: "Ich brauche dringend einen LKW-Fahrer für morgen – geht das?",
        answer: "Fragen Sie an! Ob es klappt, hängt von der <strong>Verfügbarkeit</strong> passender Fahrer ab. Wir suchen schnellstmöglich und sagen Ihnen ehrlich, ob ein Fahrer frei ist. Ein Einsatz am selben Tag ist ausgeschlossen."
      },
      {
        question: "Ich habe eine zusätzliche Tour, aber keinen Fahrer – was tun?",
        answer: "Genau dafür sind wir da: bei Auftragsspitzen oder unerwartetem Mehrbedarf vermitteln wir einen <strong>selbstständigen CE-Fahrer</strong>, der Ihr zusätzliches Fahrzeug übernimmt – tageweise, nach Verfügbarkeit."
      },
      {
        question: "Was bedeutet kurzfristig bei Ihnen?",
        answer: "Wir melden uns schnellstmöglich mit einer Rückmeldung und vermitteln kurzfristig nach Verfügbarkeit. Same-Day ist ausgeschlossen."
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
        answer: "<strong>Kein Problem.</strong> Sie können den Fahrer tageweise verlängern – jeder weitere Einsatztag zu 349 €. Flexible Anpassung möglich."
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

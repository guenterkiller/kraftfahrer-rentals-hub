import { useEffect } from "react";
import LandingPageLayout from "@/components/LandingPageLayout";

const LKWFahrerBuchen = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'category_view_lkw', {
        event_category: 'Page View',
        event_label: 'LKW CE Fahrer',
        value: 349
      });
    }
  }, []);
  const seoData = {
    title: "LKW CE Fahrer buchen – ab 349 €/Tag deutschlandweit",
    description: "LKW Fahrer buchen oder mieten – Ersatzfahrer, Mietfahrer deutschlandweit. Kurzfristig auf Abruf, tageweise. 349 €/Tag.",
    keywords: "LKW Fahrer buchen, LKW Fahrer mieten, LKW Fahrer leihen, Ersatzfahrer LKW, Ersatzfahrer LKW sofort, LKW Fahrer Krankheitsvertretung, Aushilfsfahrer LKW, LKW Mietfahrer, LKW Leihfahrer, Fahrer bestellen, externe Fahrer-Dienstleistungen, externe LKW Fahrer, Fahrer Dienstleister, Fahrer sofort, Fahrer auf Abruf, Fahrer tageweise, Fahrer wochenweise, Notfallfahrer LKW, Vertretungsfahrer, Krankheitsvertretung Fahrer, Urlaubsvertretung LKW Fahrer, Fahrerausfall, Kipper Fahrer, Baustellen Fahrer, Sattelzug Fahrer, Fahrmischer Fahrer, CE Fahrer, ADR-Fahrer, LKW Fahrer Vermittlung",
    hreflang: {
      'de': 'https://kraftfahrer-mieten.com/lkw-fahrer-buchen',
      'de-AT': 'https://kraftfahrer-mieten.com/lkw-fahrer-buchen',
      'de-CH': 'https://kraftfahrer-mieten.com/lkw-fahrer-buchen',
      'x-default': 'https://kraftfahrer-mieten.com/lkw-fahrer-buchen'
    },
    faqData: [
      {
        question: "Wie funktioniert die Zusammenarbeit?",
        answer: "Sie erhalten eine übersichtliche Rechnung direkt von der Fahrerexpress-Agentur. Die Einsätze werden über uns gebündelt abgerechnet – die Fahrer arbeiten als selbstständige Unternehmer. Hinweis: Unsere Fahrer arbeiten als selbstständige Unternehmer auf Basis eines Dienst- oder Werkvertrags. Es handelt sich nicht um Arbeitnehmerüberlassung."
      },
      {
        question: "Wie schnell kann ein LKW-Fahrer starten?",
        answer: "In der Regel 24–72 Stunden Vorlauf (werktags) ab schriftlicher Bestätigung. Same-Day ist ausgeschlossen."
      },
      {
        question: "Welche Führerscheinklassen sind verfügbar?",
        answer: "Hauptsächlich C+E (Sattelzug), aber auch C, C1+E je nach Anfrage. Zusätzlich ADR-Schein, Ladekran-Erfahrung oder Fahrmischer-Qualifikation."
      },
      {
        question: "Wie sehen die Konditionen aus?",
        answer: "Transparente Tagespreise: 349 € pro Tag (8h), 30 € Überstunde. Fahrtkosten: 25 km inklusive, danach 0,40 € pro Kilometer. Langzeiteinsätze ab 3 Monaten werden individuell kalkuliert. Keine versteckten Kosten."
      },
      {
        question: "Bieten Sie LKW-Fahrer wirklich deutschlandweit an?",
        answer: "Ja. Wir vermitteln selbstständige LKW-Fahrer bundesweit in ganz Deutschland. Unsere Fahrer-Vermittlung ist deutschlandweit aktiv – Sie können LKW-Fahrer buchen deutschlandweit, egal ob für Speditionen, Baustellen oder Fernverkehr."
      },
      {
        question: "Stellen Sie auch LKW oder Baumaschinen zur Verfügung?",
        answer: "Nein. Wir vermitteln ausschließlich Fahrer und Bediener – keine Fahrzeuge, keine Baumaschinen. Geräte und Fahrzeuge stellt immer der Auftraggeber. Baumaschinenführer sind bei uns nur Bediener, keine Maschine wird mitgeliefert."
      },
      {
        question: "Brauchen wir eine Arbeitnehmerüberlassung?",
        answer: "Nein. Unsere Fahrer sind selbstständige LKW-Fahrer und arbeiten auf Basis eines Dienst- oder Werkvertrags. Die Vermittlung erfolgt rechtssicher ohne klassische Arbeitnehmerüberlassung."
      },
      {
        question: "Wie schnell bekommen wir einen Ersatzfahrer bei Fahrerausfall?",
        answer: "Bei Fahrerausfall durch Krankheit oder Urlaub können Sie kurzfristig einen Aushilfsfahrer, Mietfahrer oder Leihfahrer bestellen. Unsere Ersatzfahrer und Vertretungsfahrer sind deutschlandweit auf Abruf verfügbar – tageweise oder wochenweise. Externe LKW Fahrer sofort buchbar."
      },
      {
        question: "Kann ich einen Fahrer sofort oder für heute bestellen?",
        answer: "Same-Day-Buchungen sind ausgeschlossen – wir benötigen mindestens 24 Stunden Vorlauf. Fahrer auf Abruf, tageweise oder wochenweise buchbar. Als Fahrer-Dienstleister empfehlen wir, Ihren LKW-Fahrer frühzeitig zu bestellen."
      },
      {
        question: "Vermitteln Sie auch Kipper-Fahrer und Baustellen-Fahrer?",
        answer: "Ja. Wir vermitteln Kipper-Fahrer, Baustellen-Fahrer, Fahrmischer-Fahrer und Sattelzug-Fahrer deutschlandweit. Alle arbeiten als selbstständige Fahrer – Sie können Fahrer leihen ohne Arbeitnehmerüberlassung. Externe Fahrer-Dienstleistungen für Speditionen und Bauunternehmen."
      },
      {
        question: "Vermitteln Sie auch Baggerfahrer und Baumaschinenführer?",
        answer: "Ja. Neben LKW-Fahrern vermitteln wir auch Baggerfahrer, Radladerfahrer und Baumaschinenführer deutschlandweit als Subunternehmer für Tagesbaustellen oder komplette Projekte. Die Maschinen stellt der Auftraggeber – wir liefern nur qualifizierte Bediener."
      },
      {
        question: "Bieten Sie auch Mischmeister für Flüssigboden an?",
        answer: "Ja. Wir vermitteln erfahrene Mischmeister und Anlagenbediener für Flüssigboden deutschlandweit als Subunternehmer. Der Mischmeister bedient Ihre bauseits gestellte Anlage – keine Maschinenvermietung."
      },
      {
        question: "Arbeiten Ihre Fahrer als Subunternehmer?",
        answer: "Ja. Alle vermittelten Fahrer sind selbstständige Subunternehmer und arbeiten für einzelne Bauabschnitte, Tagesbaustellen oder komplette Einsätze. Die Vermittlung erfolgt per Dienst- oder Werkvertrag – keine Arbeitnehmerüberlassung."
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "LKW-Fahrer buchen deutschlandweit",
      "description": "LKW-Fahrer (C/CE) deutschlandweit buchen – kurzfristig verfügbare Berufskraftfahrer in ganz Deutschland als selbstständige Subunternehmer",
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
      },
      "offers": {
        "@type": "Offer",
        "price": "349",
        "priceCurrency": "EUR",
        "description": "LKW-Fahrer (C+E) Tagespreis für 8 Stunden"
      }
    }
  };

  const heroData = {
    h1: "LKW CE Fahrer buchen – deutschlandweit verfügbar",
    intro: "Ersatzfahrer, Aushilfsfahrer oder Mietfahrer für alle LKW-Einsatzarten: Sattelzug, Kipper, Fahrmischer, Baustelle, ADR. Fahrer auf Abruf – tageweise buchbar. 349 € pro Tag (8h).",
    bullets: ["Ersatzfahrer bei Fahrerausfall", "Fahrer sofort auf Abruf", "Transparente Tagessätze"]
  };

  const faqData = {
    title: "LKW-Fahrer buchen – Häufige Fragen",
    items: [
      {
        question: "Wie funktioniert die Zusammenarbeit?",
        answer: "Sie erhalten eine übersichtliche Rechnung direkt von der Fahrerexpress-Agentur. Die Einsätze werden über uns gebündelt abgerechnet – die Fahrer arbeiten als selbstständige Unternehmer. <strong>Hinweis:</strong> Unsere Fahrer arbeiten als selbstständige Unternehmer auf Basis eines Dienst- oder Werkvertrags. Es handelt sich nicht um Arbeitnehmerüberlassung."
      },
      {
        question: "Wie schnell kann ein LKW-Fahrer starten?",
        answer: "In der Regel <strong>24–72 Stunden Vorlauf</strong> (werktags) ab schriftlicher Bestätigung. Same-Day ist ausgeschlossen."
      },
      {
        question: "Welche Führerscheinklassen sind verfügbar?",
        answer: "Hauptsächlich <strong>C+E (Sattelzug)</strong>, aber auch C, C1+E je nach Anfrage. Zusätzlich ADR-Schein, Ladekran-Erfahrung oder Fahrmischer-Qualifikation."
      },
      {
        question: "Wie sehen die Konditionen aus?",
        answer: "<strong>Transparente Tagespreise:</strong> 349 € pro Tag (8h), 30 € Überstunde. Fahrtkosten: 25 km inklusive, danach 0,40 € pro Kilometer. Langzeiteinsätze ab 3 Monaten werden individuell kalkuliert. Keine versteckten Kosten."
      },
      {
        question: "Bieten Sie LKW-Fahrer wirklich deutschlandweit an?",
        answer: "Ja. Wir vermitteln <strong>selbstständige LKW-Fahrer bundesweit</strong> in ganz Deutschland. Unsere Fahrer-Vermittlung ist deutschlandweit aktiv – Sie können LKW-Fahrer buchen deutschlandweit, egal ob für Speditionen, Baustellen oder Fernverkehr."
      },
      {
        question: "Stellen Sie auch LKW oder Baumaschinen zur Verfügung?",
        answer: "Nein. Wir vermitteln ausschließlich <strong>Fahrer und Bediener</strong> – keine Fahrzeuge, keine Baumaschinen. Geräte und Fahrzeuge stellt immer der Auftraggeber. Baumaschinenführer sind bei uns nur Bediener, keine Maschine wird mitgeliefert."
      },
      {
        question: "Brauchen wir eine Arbeitnehmerüberlassung?",
        answer: "Nein. Unsere Fahrer sind <strong>selbstständige LKW-Fahrer</strong> und arbeiten auf Basis eines Dienst- oder Werkvertrags. Die Vermittlung erfolgt rechtssicher ohne klassische Arbeitnehmerüberlassung."
      },
      {
        question: "Wie schnell bekommen wir einen Ersatzfahrer bei Fahrerausfall?",
        answer: "Bei Fahrerausfall durch Krankheit oder Urlaub können Sie kurzfristig einen <strong>Aushilfsfahrer, Mietfahrer oder Leihfahrer</strong> bestellen. Unsere Ersatzfahrer und Vertretungsfahrer sind deutschlandweit auf Abruf verfügbar – tageweise oder wochenweise. Externe LKW Fahrer sofort buchbar."
      },
      {
        question: "Kann ich einen Fahrer sofort oder für heute bestellen?",
        answer: "Same-Day-Buchungen sind ausgeschlossen – wir benötigen mindestens <strong>24 Stunden Vorlauf</strong>. Fahrer auf Abruf, tageweise oder wochenweise buchbar. Als Fahrer-Dienstleister empfehlen wir, Ihren LKW-Fahrer frühzeitig zu bestellen."
      },
      {
        question: "Vermitteln Sie auch Kipper-Fahrer und Baustellen-Fahrer?",
        answer: "Ja. Wir vermitteln <strong>Kipper-Fahrer, Baustellen-Fahrer, Fahrmischer-Fahrer und Sattelzug-Fahrer</strong> deutschlandweit. Alle arbeiten als selbstständige Fahrer – Sie können Fahrer leihen ohne Arbeitnehmerüberlassung. Externe Fahrer-Dienstleistungen für Speditionen und Bauunternehmen."
      },
      {
        question: "Vermitteln Sie auch Baggerfahrer und Baumaschinenführer?",
        answer: "Ja. Neben LKW-Fahrern vermitteln wir auch <strong>Baggerfahrer, Radladerfahrer und Baumaschinenführer deutschlandweit</strong> als Subunternehmer für Tagesbaustellen oder komplette Projekte. Die Maschinen stellt der Auftraggeber – wir liefern nur qualifizierte Bediener."
      },
      {
        question: "Bieten Sie auch Mischmeister für Flüssigboden an?",
        answer: "Ja. Wir vermitteln erfahrene <strong>Mischmeister und Anlagenbediener für Flüssigboden</strong> deutschlandweit als Subunternehmer. Der Mischmeister bedient Ihre bauseits gestellte Anlage – keine Maschinenvermietung."
      },
      {
        question: "Arbeiten Ihre Fahrer als Subunternehmer?",
        answer: "Ja. Alle vermittelten Fahrer sind <strong>selbstständige Subunternehmer</strong> und arbeiten für einzelne Bauabschnitte, Tagesbaustellen oder komplette Einsätze. Die Vermittlung erfolgt per Dienst- oder Werkvertrag – keine Arbeitnehmerüberlassung."
      }
    ]
  };

  const relatedServices = [
    {
      title: "Baumaschinenführer",
      path: "/baumaschinenfuehrer-buchen",
      description: "Vermittelte Baumaschinenführer – 459 € pro Tag"
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

export default LKWFahrerBuchen;
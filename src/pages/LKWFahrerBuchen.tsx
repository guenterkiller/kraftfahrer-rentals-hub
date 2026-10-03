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
    title: "LKW CE Fahrer buchen – Berufskraftfahrer mit Fahrerkarte | Fahrerexpress",
    description: "LKW Fahrer buchen: selbstständige CE-Fahrer und Berufskraftfahrer mit Fahrerkarte und Module 95 für Sattelzug, Kipper und Baustelle – deutschlandweit, 349 €/Tag.",
    keywords: "LKW Fahrer, LKW Fahrer buchen, CE Fahrer, Berufskraftfahrer, CE Fahrer Sattelzug, LKW Fahrer gesucht",
    hreflang: {
      'de': 'https://www.kraftfahrer-mieten.com/lkw-fahrer-buchen',
      'de-AT': 'https://www.kraftfahrer-mieten.com/lkw-fahrer-buchen',
      'de-CH': 'https://www.kraftfahrer-mieten.com/lkw-fahrer-buchen',
      'x-default': 'https://www.kraftfahrer-mieten.com/lkw-fahrer-buchen'
    },
    faqData: [
      {
        question: "Wie funktioniert die Zusammenarbeit?",
        answer: "Sie erhalten eine übersichtliche Rechnung direkt von der Fahrerexpress-Agentur. Die Einsätze werden über uns gebündelt abgerechnet – die Fahrer arbeiten als selbstständige Unternehmer. Hinweis: Unsere Fahrer arbeiten als selbstständige Unternehmer auf Basis eines Dienst- oder Werkvertrags. Es handelt sich nicht um Arbeitnehmerüberlassung."
      },
      {
        question: "Wie schnell kann ein LKW-Fahrer starten?",
        answer: "Wir melden uns schnellstmöglich mit einer Rückmeldung. Same-Day ist ausgeschlossen."
      },
      {
        question: "Welche Führerscheinklassen sind verfügbar?",
        answer: "Hauptsächlich C+E (Sattelzug), aber auch C, C1+E je nach Anfrage. Zusätzlich ADR-Schein, Ladekran-Erfahrung oder Fahrmischer-Qualifikation."
      },
      {
        question: "Wie sehen die Konditionen aus?",
        answer: "Transparente Preise: 349 € pro Einsatztag zzgl. An- und Abfahrt (erste 25 km frei, danach 0,40 € je gefahrenem Kilometer). Wochenpreis LKW-Fahrer CE: 1.645,00 € netto für 5 Einsatztage von Montag bis Freitag – bis zu 9 Stunden Einsatzzeit je Einsatztag. Langzeiteinsätze ab 3 Monaten werden individuell kalkuliert."
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
        answer: "Nein. Keine Arbeitnehmerüberlassung (AÜG). Es erfolgt ausdrücklich keine Überlassung von Arbeitnehmern, sondern die Vermittlung selbstständiger Unternehmer per Dienstleistungs- oder Werkvertrag."
      },
      {
        question: "Wie schnell bekommen wir einen Ersatzfahrer bei Fahrerausfall?",
        answer: "Bei Fahrerausfall durch Krankheit oder Urlaub können Sie kurzfristig einen Aushilfsfahrer, Mietfahrer oder Leihfahrer bestellen. Unsere Ersatzfahrer und Vertretungsfahrer sind deutschlandweit nach Verfügbarkeit buchbar – tageweise oder wochenweise. Externe LKW Fahrer kurzfristig anfragbar."
      },
      {
        question: "Wie kurzfristig kann ein Fahrer eingesetzt werden?",
        answer: "Kurzfristige Einsätze ab etwa 24 Stunden Vorlauf können je nach Fahrerverfügbarkeit möglich sein. Voraussetzung ist, dass ein geeigneter selbstständiger Fahrer aktuell verfügbar ist und den Einsatz übernehmen kann. Eine Vermittlung innerhalb von 24 Stunden können wir nicht garantieren."
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
      "description": "Vermittlung selbstständiger LKW-Fahrer CE und Berufskraftfahrer mit Fahrerkarte und Module 95 für Sattelzug, Kipper, Fahrmischer, Baustelle und ADR – deutschlandweit nach Verfügbarkeit. Das Fahrzeug stellt der Auftraggeber.",
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
        "description": "LKW-Fahrer (C+E) Tagespreis pro Einsatztag"
      }
    }
  };

  const heroData = {
    h1: "LKW CE Fahrer buchen – qualifizierte Berufskraftfahrer deutschlandweit",
    intro: "Sie suchen einen CE-Fahrer für Sattelzug, Kipper, Fahrmischer, Baustelle oder ADR? Wir vermitteln selbstständige Berufskraftfahrer mit Führerschein CE, Fahrerkarte und Module 95 – nach Verfügbarkeit. 349 € pro Einsatztag zzgl. An- und Abfahrt. Das Fahrzeug stellen Sie.",
    bullets: ["CE + Fahrerkarte + Module 95", "ADR auf Wunsch", "Transparente Tagessätze"]
  };

  const faqData = {
    title: "Welche Qualifikation haben die CE-Fahrer? – Häufige Fragen",
    items: [
      {
        question: "Ich suche einen CE-Fahrer für Sattelzug – welche Nachweise hat der Fahrer?",
        answer: "Vermittelte LKW-Fahrer verfügen über eine gültige <strong>Fahrerlaubnis CE, Fahrerkarte und Module 95</strong> (Berufskraftfahrer-Qualifikation). Zusatzqualifikationen wie ADR geben Sie bei der Anfrage an."
      },
      {
        question: "Wie funktioniert die Zusammenarbeit?",
        answer: "Sie erhalten eine übersichtliche Rechnung direkt von der Fahrerexpress-Agentur. Die Einsätze werden über uns gebündelt abgerechnet – die Fahrer arbeiten als selbstständige Unternehmer. <strong>Hinweis:</strong> Unsere Fahrer arbeiten als selbstständige Unternehmer auf Basis eines Dienst- oder Werkvertrags. Es handelt sich nicht um Arbeitnehmerüberlassung."
      },
      {
        question: "Wie schnell kann ein LKW-Fahrer starten?",
        answer: "Wir melden uns schnellstmöglich mit einer Rückmeldung. Same-Day ist ausgeschlossen."
      },
      {
        question: "Welche Führerscheinklassen sind verfügbar?",
        answer: "Hauptsächlich <strong>C+E (Sattelzug)</strong>, aber auch C, C1+E je nach Anfrage. Zusätzlich ADR-Schein, Ladekran-Erfahrung oder Fahrmischer-Qualifikation."
      },
      {
        question: "Wie sehen die Konditionen aus?",
        answer: "<strong>Transparente Preise:</strong> 349 € pro Einsatztag zzgl. An- und Abfahrt (erste 25 km frei, danach 0,40 € je gefahrenem Kilometer). Wochenpreis LKW-Fahrer CE: 1.645,00 € netto für 5 Einsatztage von Montag bis Freitag – bis zu 9 Stunden Einsatzzeit je Einsatztag. Langzeiteinsätze ab 3 Monaten individuell."
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
        answer: "Bei Fahrerausfall durch Krankheit oder Urlaub können Sie kurzfristig einen <strong>Aushilfsfahrer, Mietfahrer oder Leihfahrer</strong> bestellen. Unsere Ersatzfahrer und Vertretungsfahrer sind deutschlandweit nach Verfügbarkeit buchbar – tageweise oder wochenweise. Externe LKW Fahrer kurzfristig anfragbar."
      },
      {
        question: "Wie kurzfristig kann ein Fahrer eingesetzt werden?",
        answer: "Kurzfristige Einsätze ab etwa 24 Stunden Vorlauf können je nach Fahrerverfügbarkeit möglich sein. Voraussetzung ist, dass ein geeigneter selbstständiger Fahrer aktuell verfügbar ist und den Einsatz übernehmen kann. Eine Vermittlung innerhalb von 24 Stunden können wir nicht garantieren."
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
      description: "Baumaschinenführer / Mischmeister – 489 € pro Einsatztag"
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
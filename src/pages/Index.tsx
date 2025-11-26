import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ProductCards from "@/components/ProductCards";
import ProcessSteps from "@/components/ProcessSteps";
import WhyFahrerexpress from "@/components/WhyFahrerexpress";
import TestimonialsSection from "@/components/TestimonialsSection";
import EUDriverRecruitment from "@/components/EUDriverRecruitment";
import FahreranfrageSection from "@/components/FahreranfrageSection";
import LegalSecuritySection from "@/components/LegalSecuritySection";
import BookingPriorityBanner from "@/components/BookingPriorityBanner";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  
  useSEO({
    title: "LKW Fahrer mieten & Kraftfahrer (CE) bundesweit buchen – EU-Fahrer willkommen",
    description: "Fahrerexpress vermittelt bundesweit selbstständige LKW-Fahrer (CE) aus Deutschland und EU für Transporte & Baustellen. Kierowcy z Polski, Rumänii, Bułgarii mile widziani! – zusätzlich Mischmeister für Flüssigboden als Subunternehmer buchbar.",
    keywords: "LKW Fahrer mieten, Kraftfahrer buchen, Fahrer CE bundesweit, selbstständige LKW Fahrer, EU Fahrer Deutschland, LKW Fahrer aus Polen, Kierowcy z Polski do Niemiec, Șoferi profesioniști români Germania, Bulgarian truck drivers Germany, LKW Fahrer Rumänien, Kraftfahrer Bulgarien Ungarn, Berufskraftfahrer EU-Ausland, Fahrer vermitteln Europa, Internationale Fahrer Deutschland, Fahrerservice Europa, LKW-Fahrer Vermittlung DACH, Mischmeister Flüssigboden, Flüssigboden Service, Subunternehmer Flüssigboden, Mischanlage Bediener, Radlader Bagger Mischmeister, CE-Fahrmischer",
    ogImage: "https://kraftfahrer-mieten.com/uploads/facebook-preview-v2.jpg",
    hreflang: {
      'de': 'https://kraftfahrer-mieten.com/',
      'de-AT': 'https://kraftfahrer-mieten.com/',
      'de-CH': 'https://kraftfahrer-mieten.com/',
      'en': 'https://kraftfahrer-mieten.com/',
      'pl': 'https://kraftfahrer-mieten.com/',
      'ro': 'https://kraftfahrer-mieten.com/',
      'bg': 'https://kraftfahrer-mieten.com/',
      'hu': 'https://kraftfahrer-mieten.com/',
      'x-default': 'https://kraftfahrer-mieten.com/'
    },
    faqData: [
      {
        question: "Wie funktioniert die Zusammenarbeit?",
        answer: "Sie erhalten eine übersichtliche Rechnung direkt von der Fahrerexpress-Agentur. Die Einsätze werden über uns gebündelt abgerechnet – die Fahrer arbeiten als selbstständige Unternehmer. Hinweis: Unsere Fahrer arbeiten als selbstständige Unternehmer auf Basis eines Dienst- oder Werkvertrags. Es handelt sich nicht um Arbeitnehmerüberlassung."
      },
      {
        question: "Wie schnell können Fahrer verfügbar sein?",
        answer: "In der Regel 24–72 Stunden Vorlauf (werktags) ab schriftlicher Bestätigung. Same-Day ist ausgeschlossen."
      },
      {
        question: "Welche Führerscheinklassen sind verfügbar?",
        answer: "C+E (Sattelzug), C, C1+E, ADR-Schein, Ladekran-Erfahrung, Fahrmischer-Qualifikation und weitere Spezialführerscheine je nach Anfrage."
      },
      {
        question: "Sind die Fahrer versichert?",
        answer: "Ja, alle Fahrer verfügen über entsprechende Berufshaftpflicht- und Fahrzeugversicherungen. Vollständiger Versicherungsschutz garantiert."
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
        "name": "LKW-Fahrer buchen & Kraftfahrer mieten - Fahrerexpress",
        "description": "Kurzfristig LKW-Fahrer buchen und Kraftfahrer mieten - deutschlandweit verfügbare Berufskraftfahrer ohne Arbeitnehmerüberlassung",
      "url": "https://kraftfahrer-mieten.com/",
      "mainEntity": {
        "@type": "LocalBusiness",
        "name": "Fahrerexpress-Agentur - Günter Killer",
        "description": "Baumaschinenführer (459 €) oder LKW CE Fahrer (349 €) bundesweit buchen - selbstständige Subunternehmer ohne Arbeitnehmerüberlassung",
        "url": "https://kraftfahrer-mieten.com",
        "telephone": "+49-1577-1442285",
        "priceRange": "Faire Preise",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Walther-von-Cronberg-Platz 12",
          "addressLocality": "Frankfurt am Main",
          "postalCode": "60594",
          "addressCountry": "DE"
        }
      }
    }
  });

  return (
    <div className="min-h-screen">
      {/* Skip link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Zum Hauptinhalt springen
      </a>
      
      <Navigation />
      
      <main id="main-content">
        <HeroSection />
        <ProductCards />
        <ProcessSteps />
        <WhyFahrerexpress />
        <TestimonialsSection />
        <FahreranfrageSection />
        <LegalSecuritySection />
        <BookingPriorityBanner />
        <EUDriverRecruitment />
        <ContactSection />
        
        {/* Neuer SEO-Block für Flüssigboden-Service */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Zusätzlicher Service: Mischmeister für Flüssigboden
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Ergänzend zu unseren Fahrerdiensten bieten wir auch den Einsatz eines Mischmeisters für fließfähige Verfüllmaterialien an. Der Einsatz erfolgt als selbstständiger Subunternehmer inklusive Bedienung der bauseits gestellten Mischanlage, Radlader/Bagger sowie CE-Fahrmischer. Durch diese Kombination können auf der Baustelle bis zu zwei zusätzliche Mitarbeiter eingespart werden. Alle Arbeiten erfolgen ausschließlich nach Rezeptur und Anweisung des Auftraggebers, ohne Gewährleistungs- oder Betreiberverantwortung.
            </p>
            <div className="flex justify-center">
              <Button 
                asChild 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link to="/fluessigboden-service">
                  Mischmeister buchen
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;

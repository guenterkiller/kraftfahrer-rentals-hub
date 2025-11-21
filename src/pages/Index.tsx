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
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useSEO({
    title: "LKW Fahrer mieten & Kraftfahrer (CE) bundesweit buchen – EU-Fahrer willkommen",
    description: "Fahrerexpress vermittelt bundesweit selbstständige LKW-Fahrer (CE) aus Deutschland und EU für Transporte & Baustellen. Kierowcy z Polski, Rumänii, Bułgarii mile widziani!",
    keywords: "LKW Fahrer mieten, Kraftfahrer buchen, Fahrer CE bundesweit, selbstständige LKW Fahrer, EU Fahrer Deutschland, LKW Fahrer aus Polen, Kierowcy z Polski do Niemiec, Șoferi profesioniști români Germania, Bulgarian truck drivers Germany, LKW Fahrer Rumänien, Kraftfahrer Bulgarien Ungarn, European truck driver jobs, Berufskraftfahrer EU-Ausland, HGV driver hire Europe, International drivers Germany",
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
        question: "Ist das Zeitarbeit oder Arbeitnehmerüberlassung?",
        answer: "Nein, ausschließlich selbstständige Fahrer ohne AÜG. Es handelt sich um eine rechtssichere Dienst-/Werkleistung durch selbstständige Subunternehmer."
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
      </main>
      
      <Footer />
      
      {/* Floating Admin Button */}
      <button
        onClick={() => navigate('/admin/login')}
        className="fixed bottom-6 right-6 bg-destructive text-destructive-foreground px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 z-50 font-semibold text-base flex items-center gap-2"
        aria-label="Admin-Bereich öffnen"
      >
        🔐 Admin
      </button>
    </div>
  );
};

export default Index;

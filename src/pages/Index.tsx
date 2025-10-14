import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import DriverTypesSection from "@/components/DriverTypesSection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import FahreranfrageSection from "@/components/FahreranfrageSection";
import HowItWorksTimeline from "@/components/HowItWorksTimeline";
import IndustriesRow from "@/components/IndustriesRow";
import WhatsAppContact from "@/components/WhatsAppContact";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "LKW-Fahrer buchen & Kraftfahrer mieten – Fahrerexpress Agentur",
    description: "Kurzfristig bundesweit Fahrer buchen – LKW-Fahrer, Kraftfahrer, Fahrmischerfahrer, ADR-Fahrer. Flexibel, zuverlässig & ohne Arbeitnehmerüberlassung.",
    keywords: "LKW-Fahrer buchen, Kraftfahrer mieten, Fahrer gesucht, Berufskraftfahrer kurzfristig buchen, C+E Fahrer buchen, ADR-Fahrer mieten, LKW mit Ladekran, Fahrmischerfahrer gesucht, Baumaschinenführer buchen, Fahrer mieten deutschlandweit",
    ogImage: "https://kraftfahrer-mieten.com/uploads/facebook-preview-v2.jpg",
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
        "description": "Kurzfristig LKW-Fahrer buchen, Kraftfahrer mieten und Baumaschinenführer deutschlandweit - selbstständige Berufskraftfahrer ohne Arbeitnehmerüberlassung",
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
      
      {/* Main content with semantic structure */}
      <main id="main-content" className="pt-16">
        <section id="home" aria-label="Hero Bereich">
          <HeroSection />
        </section>
        
        <section id="about" aria-label="Über uns" className="scroll-mt-16">
          <AboutSection />
        </section>
        
        <section id="services" aria-label="Unsere Dienstleistungen" className="scroll-mt-16">
          <ServicesSection />
        </section>
        
        <section id="driver-types" aria-label="Fahrerarten im Detail" className="scroll-mt-16">
          <DriverTypesSection />
        </section>
        
        <section id="pricing" aria-label="Preise und Konditionen" className="scroll-mt-16">
          <PricingSection />
        </section>
        
        <HowItWorksTimeline />
        <IndustriesRow />
        
        <section id="fahreranfrage" aria-label="Fahrer anfragen" className="scroll-mt-16">
          <FahreranfrageSection />
        </section>
        
        <section id="testimonials" aria-label="Kundenbewertungen" className="scroll-mt-16">
          <TestimonialsSection />
        </section>
        
        <section id="contact" aria-label="Kontakt" className="scroll-mt-16">
          <ContactSection />
        </section>
      </main>
      
      <WhatsAppContact />
      
      {/* Fallback Admin-Badge (fixed position, bottom right) */}
      <div className="fixed bottom-4 right-4 z-40">
        <Link 
          to="/admin" 
          className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-xs rounded-lg shadow-lg hover:bg-red-700 transition-colors"
          title="Admin-Bereich (nur für Günter Killer)"
        >
          🔐 Admin
        </Link>
      </div>
    </div>
  );
};

export default Index;

import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import JobAlertSection from "@/components/JobAlertSection";
import FahreranfrageSection from "@/components/FahreranfrageSection";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "LKW-Fahrer mieten – Bundesweit, flexibel & kurzfristig verfügbar | Fahrerexpress",
    description: "Ersatzfahrer LKW, Baumaschinenführer & Kraftfahrer kurzfristig mieten. Flexibel, rechtskonform & bundesweit. Fahrerexpress – Ihre Lösung bei Fahrermangel.",
    keywords: "kraftfahrer mieten, ersatzfahrer lkw, selbständiger berufskraftfahrer gesucht, LKW-Fahrer mieten, kurzfristig fahrer mieten, baumaschinenführer mieten, selbstständige Kraftfahrer, bundesweite Vermittlung",
    ogImage: "https://kraftfahrer-mieten.com/uploads/facebook-preview-v2.jpg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "LKW-Fahrer mieten - Fahrerexpress",
      "description": "Bundesweite Vermittlung selbstständiger LKW-Fahrer und Baumaschinenführer",
      "url": "https://kraftfahrer-mieten.com/",
      "mainEntity": {
        "@type": "LocalBusiness",
        "name": "Fahrerexpress-Agentur - Günter Killer",
        "description": "Bundesweite Vermittlung selbstständiger LKW-Fahrer, Kraftfahrer und Baumaschinenführer",
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
        
        <section id="pricing" aria-label="Preise und Konditionen" className="scroll-mt-16">
          <PricingSection />
        </section>
        
        <section id="testimonials" aria-label="Kundenbewertungen" className="scroll-mt-16">
          <TestimonialsSection />
        </section>
        
        <section id="jobalert" aria-label="Job-Benachrichtigungen" className="scroll-mt-16">
          <JobAlertSection />
        </section>
        
        <section id="fahreranfrage" aria-label="Fahrer anfragen" className="scroll-mt-16">
          <FahreranfrageSection />
        </section>
        
        <section id="contact" aria-label="Kontakt" className="scroll-mt-16">
          <ContactSection />
        </section>
        
        {/* Temporärer Admin-Link */}
        <div className="bg-red-100 p-4 text-center">
          <Link to="/admin/login" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            🔐 Admin Login (Temporär)
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Index;

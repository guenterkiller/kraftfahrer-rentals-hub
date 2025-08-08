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
    title: "LKW-Fahrer mieten – Selbstständige Fahrer bundesweit | Fahrerexpress",
    description: "Jetzt erfahrene LKW-Fahrer & Baumaschinenführer mieten. Flexibel, rechtskonform & bundesweit. Fahrerexpress – Ihre Lösung bei Fahrermangel.",
    keywords: "kraftfahrer mieten, selbständiger berufskraftfahrer gesucht, LKW-Fahrer mieten, selbstständige Kraftfahrer, Baumaschinenführer, bundesweite Vermittlung",
    ogImage: "https://lovable.dev/opengraph-image-p98pqg.png"
  });
  return (
    <div>
      <Navigation />
      <div id="home">
        <HeroSection />
      </div>
      <div id="about">
        <AboutSection />
      </div>
      <div id="services">
        <ServicesSection />
      </div>
      <div id="pricing">
        <PricingSection />
      </div>
      <div id="testimonials">
        <TestimonialsSection />
      </div>
      <div id="jobalert">
        <JobAlertSection />
      </div>
      <div id="fahreranfrage">
        <FahreranfrageSection />
      </div>
      <div id="contact">
        <ContactSection />
      </div>
    </div>
  );
};

export default Index;

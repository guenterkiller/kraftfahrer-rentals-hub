import { Button } from "@/components/ui/button";
import { Truck, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * LCP-optimierte Hero Section mit:
 * - Picture-Element für AVIF/WebP/JPG Fallback
 * - Responsive srcset für mobile/desktop
 * - Explizite width/height für CLS-Vermeidung
 * - fetchpriority="high" für priorisiertes Laden
 */
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32 sm:pb-40 md:pb-48">
      {/* Hero image optimiert für Core Web Vitals - LCP Element */}
      {/* Mobile: 768px, Desktop: 1920px - responsive srcset für optimale Ladezeiten */}
      <div className="absolute inset-0 z-0">
        <picture>
          {/* AVIF Desktop (beste Kompression) */}
          <source
            type="image/avif"
            media="(min-width: 768px)"
            srcSet="/hero/hero-desktop.avif"
          />
          {/* AVIF Mobile */}
          <source
            type="image/avif"
            media="(max-width: 767px)"
            srcSet="/hero/hero-mobile.avif"
          />
          {/* WebP Desktop Fallback */}
          <source
            type="image/webp"
            media="(min-width: 768px)"
            srcSet="/hero/hero-desktop.webp"
          />
          {/* WebP Mobile Fallback */}
          <source
            type="image/webp"
            media="(max-width: 767px)"
            srcSet="/hero/hero-mobile.webp"
          />
          {/* Fallback img */}
          <img
            src="/hero/hero-mobile.webp"
            alt="Roter LKW-Sattelzug auf Autobahn bei Sonnenuntergang - LKW-Fahrer und Kraftfahrer bundesweit buchen"
            className="w-full h-full object-cover object-center"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            loading="eager"
            decoding="sync"
            // @ts-expect-error fetchpriority is a valid HTML attribute
            fetchpriority="high"
          />
        </picture>
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/50 via-black/40 to-primary/30" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 text-center text-white animate-fade-in">
        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-snug sm:leading-tight drop-shadow-lg">
          LKW Fahrer buchen – deutschlandweit
        </h1>
        
        <p className="text-base sm:text-xl md:text-2xl mb-4 sm:mb-8 drop-shadow-lg max-w-4xl mx-auto leading-relaxed">
          Ersatzfahrer, Aushilfsfahrer & Mietfahrer ab <span className="text-white font-bold bg-red-600 px-2 py-1 rounded">349 €</span> pro Tag – Fahrer auf Abruf, tageweise oder wochenweise bestellen
        </p>
        
        <div className="bg-white/15 backdrop-blur-md px-4 py-3 mb-6 sm:mb-10 max-w-2xl mx-auto rounded-2xl border-2 border-white/30 shadow-xl animate-fade-in">
          <p className="text-xs sm:text-sm md:text-base text-white font-medium">
            🇪🇺 <strong className="text-white">EU/EWR-Fahrer verfügbar:</strong> Qualifizierte Kraftfahrer aus Deutschland und der gesamten Europäischen Union
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 md:gap-6 justify-center items-center mb-10 sm:mb-16 animate-slide-up">
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border-2 border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" aria-hidden="true" />
            <span className="text-xs sm:text-sm md:text-base font-semibold">Fahrer auf Abruf</span>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border-2 border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" aria-hidden="true" />
            <span className="text-xs sm:text-sm md:text-base font-semibold">Ersatz- & Mietfahrer</span>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border-2 border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300">
            <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" aria-hidden="true" />
            <span className="text-xs sm:text-sm md:text-base font-semibold">Tageweise buchbar</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 justify-center max-w-2xl mx-auto animate-scale-in">
          <Button 
            size="lg" 
            className="text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-7 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-primary/50 focus:outline-none w-full sm:w-auto rounded-xl font-bold" 
            asChild
          >
            <a 
              href="#fahreranfrage"
              onClick={(e) => {
                e.preventDefault();
                const element = document.querySelector('#fahreranfrage');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              aria-label="Direkt zum Fahreranfrage-Formular springen"
            >
              Jetzt Fahrer anfragen
            </a>
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-7 bg-white hover:bg-white/95 text-gray-900 hover:text-gray-900 border-3 border-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto rounded-xl font-bold" 
            asChild
          >
            <Link to="/preise-und-ablauf" aria-label="Preise und Konditionen ansehen">
              Preise & Konditionen ansehen
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
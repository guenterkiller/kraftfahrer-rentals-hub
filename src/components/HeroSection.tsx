import { Button } from "@/components/ui/button";
import { Truck, Clock, Users } from "lucide-react";
import heroImage from "@/assets/german-truck.jpg";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Optimized hero image für bessere Core Web Vitals (LCP) */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Professioneller LKW-Fahrer mit Sattelzug auf deutscher Autobahn - Fahrerexpress vermittelt bundesweit"
          className="w-full h-full object-cover object-center"
          loading="eager"
          decoding="async"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 text-center text-white animate-fade-in">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight drop-shadow-lg">
          LKW-Fahrer und Baumaschinenführer mieten – selbstständige Profis bundesweit
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl mb-8 drop-shadow-lg max-w-4xl mx-auto leading-relaxed">
          Transparente Tagessätze ab 349 € – Vermittlung geprüfter, selbstständiger Fahrer ohne Arbeitnehmerüberlassung.
        </p>
        
        <div className="bg-white/10 backdrop-blur-sm px-4 py-2 mb-8 max-w-2xl mx-auto rounded-lg border border-white/20 animate-fade-in">
          <p className="text-sm md:text-base text-white/90">
            🇪🇺 <strong>EU/EWR-Fahrer verfügbar:</strong> Qualifizierte Kraftfahrer aus Deutschland und der gesamten Europäischen Union
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-12 animate-slide-up">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20">
            <Clock className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
            <span className="text-sm md:text-base font-medium">Planbare Verfügbarkeit</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20">
            <Users className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
            <span className="text-sm md:text-base font-medium">Bundesweite Vermittlung</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20">
            <Truck className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
            <span className="text-sm md:text-base font-medium">Professionelle Fahrer</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center max-w-2xl mx-auto animate-scale-in">
          <Button 
            size="lg" 
            className="text-base md:text-lg px-8 md:px-10 py-5 md:py-7 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-primary/50 focus:outline-none" 
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
            className="text-base md:text-lg px-8 md:px-10 py-5 md:py-7 bg-white/95 hover:bg-white text-primary border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
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
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu on escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <nav className="fixed top-0 w-full bg-white/98 backdrop-blur-md border-b z-50 shadow-sm" role="navigation" aria-label="Hauptnavigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-1 sm:gap-2">
          <Link 
            to="/" 
            className="group focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg flex-shrink min-w-0 flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 py-1.5 bg-[#0d2340] hover:bg-[#0f2950] transition-colors"
            aria-label="Fahrerexpress Startseite"
          >
            <svg
              viewBox="0 0 48 36"
              aria-hidden="true"
              className="h-7 w-9 sm:h-8 sm:w-10 flex-shrink-0"
            >
              {/* roter Bogen-Akzent */}
              <path
                d="M44 18 A18 18 0 0 0 8 18"
                fill="none"
                stroke="#bb2c29"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* LKW-Signet weiß */}
              <g fill="#ffffff">
                <rect x="6" y="16" width="20" height="12" rx="1.5" />
                <path d="M26 19 h7 l5 4 v5 h-12 z" />
                <circle cx="14" cy="30" r="2.5" fill="#0d2340" stroke="#ffffff" strokeWidth="1.2" />
                <circle cx="32" cy="30" r="2.5" fill="#0d2340" stroke="#ffffff" strokeWidth="1.2" />
                {/* Speedlines */}
                <rect x="1" y="19" width="4" height="1.4" rx="0.7" opacity="0.85" />
                <rect x="2" y="22" width="3" height="1.4" rx="0.7" opacity="0.7" />
              </g>
            </svg>
            <span className="h-7 sm:h-8 w-px bg-[#bb2c29]/70 flex-shrink-0" aria-hidden="true" />
            <span className="flex flex-col leading-tight min-w-0">
              <span className="text-white font-bold text-[13px] sm:text-base md:text-lg tracking-tight whitespace-nowrap">
                <span className="hidden xs:inline sm:inline">Fahrerexpress-Agentur</span>
                <span className="xs:hidden sm:hidden">Fahrerexpress</span>
                <span className="hidden md:inline"> – Günter Killer</span>
              </span>
              <span className="text-white/75 text-[10px] sm:text-[11px] md:text-xs font-medium whitespace-nowrap">
                Vermittlung selbstständiger Fahrer
              </span>
            </span>
          </Link>
          
          {/* Desktop und Mobile Navigation nebeneinander */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Desktop: Leistungen Dropdown */}
            <div className="hidden lg:block relative group">
              <button 
                className="px-3 py-2 text-sm font-semibold rounded-md bg-background/90 text-foreground hover:bg-accent hover:text-accent-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Leistungen
              </button>
              <div className="absolute left-0 top-full mt-1 w-56 bg-white/100 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link 
                    to="/lkw-fahrer-buchen"
                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
                  >
                    LKW CE Fahrer
                  </Link>
                  <Link 
                    to="/baumaschinenfuehrer-buchen"
                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
                  >
                    Baumaschinenführer
                  </Link>
                  <Link 
                    to="/fluessigboden-service"
                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
                  >
                    Flüssigboden-Service
                  </Link>
                  <div className="border-t border-gray-200 my-1"></div>
                  <Link 
                    to="/preise-und-ablauf"
                    className="block px-4 py-2.5 text-sm font-semibold text-primary hover:bg-gray-50 transition-colors"
                  >
                    Preise & Ablauf
                  </Link>
                </div>
              </div>
            </div>
            
            <Button
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:outline-none text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap" 
              asChild
            >
              <Link to="/fahrer-registrierung" aria-label="Als selbstständiger Fahrer registrieren und Aufträge erhalten" title="Als selbstständiger Fahrer registrieren und Aufträge erhalten">
                <span className="hidden sm:inline">🚀 Als Fahrer registrieren</span>
                <span className="sm:hidden">🚀 Fahrer registrieren</span>
              </Link>
            </Button>
            
            {/* Desktop: Fahrer buchen Button */}
            <Button 
              size="sm" 
              className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:outline-none" 
              asChild
            >
              <Link 
                to="/#fahreranfrage"
                onClick={(e) => {
                  const form = document.querySelector('#booking-form');
                  if (form) {
                    e.preventDefault();
                    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                aria-label="Fahrer buchen - Zum Formular"
              >
                <span className="inline-block animate-drive">🚚</span> Fahrer buchen
              </Link>
            </Button>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Menü schließen" : "Menü öffnen"}
            >
              {isMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            id="mobile-menu" 
            className="md:hidden py-4 border-t bg-white/95 backdrop-blur-sm animate-fade-in"
            role="menu"
            aria-labelledby="mobile-menu-button"
          >
            <div className="flex flex-col space-y-3">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:outline-none" 
                asChild
              >
                <Link 
                  to="/#fahreranfrage"
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    const form = document.querySelector('#booking-form');
                    if (form) {
                      e.preventDefault();
                      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  role="menuitem"
                  aria-label="Fahrer buchen - Zum Formular"
                >
                  <span className="inline-block animate-drive">🚚</span> Fahrer buchen
                </Link>
              </Button>
              
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:outline-none" 
                asChild
              >
                <Link 
                  to="/fahrer-registrierung"
                  onClick={() => setIsMenuOpen(false)}
                  role="menuitem"
                  aria-label="Als selbstständiger Fahrer registrieren und Aufträge erhalten"
                >
                  🚀 Als Fahrer registrieren
                </Link>
              </Button>
              
              <div className="pt-2 border-t">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-2">
                  Unsere Leistungen
                </p>
                <Link 
                  to="/lkw-fahrer-buchen"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-foreground underline decoration-muted-foreground/50 hover:text-primary hover:decoration-primary hover:bg-muted/50 rounded-md transition-colors"
                  role="menuitem"
                >
                  LKW CE Fahrer
                </Link>
                <Link 
                  to="/baumaschinenfuehrer-buchen"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-foreground underline decoration-muted-foreground/50 hover:text-primary hover:decoration-primary hover:bg-muted/50 rounded-md transition-colors"
                  role="menuitem"
                >
                  Baumaschinenführer
                </Link>
                <Link 
                  to="/fluessigboden-service"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-foreground underline decoration-muted-foreground/50 hover:text-primary hover:decoration-primary hover:bg-muted/50 rounded-md transition-colors"
                  role="menuitem"
                >
                  Flüssigboden-Service
                </Link>
                <Link 
                  to="/preise-und-ablauf"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-foreground underline decoration-muted-foreground/50 hover:text-primary hover:decoration-primary hover:bg-muted/50 rounded-md transition-colors"
                  role="menuitem"
                >
                  Preise & Ablauf
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
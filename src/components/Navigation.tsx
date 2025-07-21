import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const menuItems = [
    { label: "Startseite", href: "#home" },
    { label: "Leistungen", href: "#services" },
    { label: "Über mich", href: "#about" },
    { label: "Preise", href: "#pricing" },
    { label: "Projekte", href: "/projekte" },
    { label: "Wissenswertes", href: "/wissenswertes" },
    { label: "Kontakt", href: "#contact" },
    { label: "Fahrer werden", href: "/fahrer-registrierung" }
  ];

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    if (href.startsWith('#')) {
      if (isHomePage) {
        // Auf der Startseite - normales Scrolling
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        // Auf anderer Seite - zur Startseite mit Anker navigieren
        e.preventDefault();
        window.location.href = `/${href}`;
      }
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="font-bold text-sm md:text-xl text-primary">
            <div className="hidden sm:block">Fahrerexpress-Agentur - Günter Killer</div>
            <div className="sm:hidden">Fahrerexpress<br/>Günter Killer</div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.slice(0, -1).map((item) => {
              if (item.href.startsWith('/')) {
                return (
                  <Link 
                    key={item.label}
                    to={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <a 
                  key={item.label}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm"
                  onClick={(e) => handleNavClick(item.href, e)}
                >
                  {item.label}
                </a>
              );
            })}
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all" asChild>
              <Link to="/fahrer-registrierung">
                🚀 Fahrer werden
              </Link>
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <a 
                href="#contact"
                onClick={(e) => handleNavClick('#contact', e)}
              >
                Fahrer buchen
              </a>
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              {menuItems.slice(0, -1).map((item) => {
                if (item.href.startsWith('/')) {
                  return (
                    <Link 
                      key={item.label}
                      to={item.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <a 
                    key={item.label}
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    onClick={(e) => {
                      setIsMenuOpen(false);
                      handleNavClick(item.href, e);
                    }}
                  >
                    {item.label}
                  </a>
                );
              })}
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all mb-2" asChild>
                <Link 
                  to="/fahrer-registrierung"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🚀 Fahrer werden
                </Link>
              </Button>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <a 
                  href="#contact"
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    handleNavClick('#contact', e);
                  }}
                >
                  Fahrer buchen
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
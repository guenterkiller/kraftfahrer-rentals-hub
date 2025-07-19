import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: "Startseite", href: "#home" },
    { label: "Leistungen", href: "#services" },
    { label: "Über mich", href: "#about" },
    { label: "Preise", href: "#pricing" },
    { label: "Referenzen", href: "#testimonials" },
    { label: "Kontakt", href: "#contact" },
    { label: "Fahrer werden", href: "/fahrer-registrierung" }
  ];

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="font-bold text-sm md:text-xl text-primary">
            <div className="hidden sm:block">Fahrerexpress-Agentur - Günter Killer</div>
            <div className="sm:hidden">Fahrerexpress<br/>Günter Killer</div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.slice(0, -1).map((item) => (
              <a 
                key={item.label}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
            <Link 
              to="/fahrer-registrierung"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Fahrer werden
            </Link>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <a href="#contact">Fahrer anfragen</a>
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
              {menuItems.slice(0, -1).map((item) => (
                <a 
                  key={item.label}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Link 
                to="/fahrer-registrierung"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Fahrer werden
              </Link>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <a href="#contact">Fahrer anfragen</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Lock } from "lucide-react";
import { FEATURE_FLAGS } from "@/utils/featureFlags";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Hauptkategorien */}
          <div>
            <h3 className="font-bold text-lg mb-4">Fahrer buchen</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/lkw-fahrer-buchen" className="text-muted-foreground hover:text-primary transition-colors">
                  LKW CE Fahrer buchen
                </Link>
              </li>
              <li>
                <Link to="/baumaschinenfuehrer-buchen" className="text-muted-foreground hover:text-primary transition-colors">
                  Baumaschinenführer buchen
                </Link>
              </li>
              <li>
                <Link to="/fluessigboden-service" className="text-muted-foreground hover:text-primary transition-colors">
                  Flüssigboden-Service (Mischmeister)
                </Link>
              </li>
              <li>
                <Link to="/preise-und-ablauf" className="text-muted-foreground hover:text-primary transition-colors">
                  Preise & Ablauf
                </Link>
              </li>
            </ul>
          </div>

          {/* Informationen */}
          <div>
            <h3 className="font-bold text-lg mb-4">Informationen</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/vermittlung" className="text-muted-foreground hover:text-primary transition-colors">
                  Vermittlung
                </Link>
              </li>
              <li>
                <Link to="/vermittlungsbedingungen" className="text-muted-foreground hover:text-primary transition-colors">
                  Vermittlungsbedingungen
                </Link>
              </li>
              <li>
                <Link to="/wissenswertes" className="text-muted-foreground hover:text-primary transition-colors">
                  Wissenswertes
                </Link>
              </li>
              <li>
                <Link to="/projekte" className="text-muted-foreground hover:text-primary transition-colors">
                  Referenz-Projekte
                </Link>
              </li>
            </ul>
          </div>

          {/* Für Fahrer */}
          <div>
            <h3 className="font-bold text-lg mb-4">Für Fahrer</h3>
            <ul className="space-y-2 text-sm mb-4">
              <li>
                <Link to="/fahrer-registrierung" className="text-muted-foreground hover:text-primary transition-colors">
                  Partner werden
                </Link>
              </li>
              <li>
                <Link to="/fahrer-vermittlungsbedingungen" className="text-muted-foreground hover:text-primary transition-colors">
                  Vermittlungsbedingungen
                </Link>
              </li>
              {FEATURE_FLAGS.TRUCKER_CHAT_ENABLED && (
                <li>
                  <Link to="/trucker-ladies" className="text-muted-foreground hover:text-primary transition-colors">
                    Fahrer-Community-Chat
                  </Link>
                </li>
              )}
            </ul>
            <p className="text-xs text-muted-foreground font-semibold">
              🇩🇪 Bundesweit verfügbar<br />
              🇪🇺 EU/EWR-Fahrer
            </p>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="font-bold text-lg mb-4">Kontakt</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                <a href="tel:+4915771442285" className="text-muted-foreground hover:text-primary transition-colors">
                  01577 1442285
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                <a href="mailto:info@kraftfahrer-mieten.com" className="text-muted-foreground hover:text-primary transition-colors break-all">
                  info@kraftfahrer-mieten.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-muted-foreground">
                  60594 Frankfurt<br />
                  Walther-von-Cronberg-Platz 12
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} Fahrerexpress-Agentur • Günter Killer • USt-IdNr: DE207642217</p>
          <div className="flex gap-4 items-center">
            <Link 
              to="/admin/login" 
              className="hover:text-primary-foreground transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted hover:bg-primary border border-border hover:border-primary"
            >
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Admin</span>
            </Link>
            <Link to="/impressum" className="hover:text-primary transition-colors">
              Impressum
            </Link>
            <Link to="/datenschutz" className="hover:text-primary transition-colors">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

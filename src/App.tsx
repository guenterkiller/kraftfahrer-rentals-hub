import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useWebVitals } from "@/hooks/useWebVitals";
import Index from "./pages/Index";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import NotFound from "./pages/NotFound";
import FahrerRegistrierung from "./pages/FahrerRegistrierung";

import Wissenswertes from "./pages/Wissenswertes";
import Projekte from "./pages/Projekte";
import Vermittlung from "./pages/Vermittlung";
import FahrerCommunityChat from "./pages/FahrerCommunityChat";
import FahrerInfos from "./pages/FahrerInfos";
// import TruckerChat from './components/TruckerChat';
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import DriverJobResponse from "./pages/DriverJobResponse";
import AdminRoute from "./components/AdminRoute";
import LKWFahrerBuchen from "./pages/LKWFahrerBuchen";
import KraftfahrerMieten from "./pages/KraftfahrerMieten";
import ErsatzfahrerLkw from "./pages/ErsatzfahrerLkw";
import Mietfahrer from "./pages/Mietfahrer";
import LkwFahrerKurzfristig from "./pages/LkwFahrerKurzfristig";
import FahrerFuerSpeditionen from "./pages/FahrerFuerSpeditionen";

import BaumaschinenfuehrerBuchen from "./pages/BaumaschinenfuehrerBuchen";
import BegleitfahrzeugeBF3 from "./pages/BegleitfahrzeugeBF3";
import PreiseUndAblauf from "./pages/PreiseUndAblauf";
import BF3Ablauf from "./pages/BF3Ablauf";
import FlüssigbodenService from "./pages/FlüssigbodenService";
const queryClient = new QueryClient();

// Analytics Tracker Component (DSGVO-konform)
function AnalyticsTracker() {
  usePageTracking();
  useWebVitals();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AnalyticsTracker />
        <Toaster />
        <Sonner />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/lkw-fahrer-buchen" element={<LKWFahrerBuchen />} />
          <Route path="/lkwfahrer-buchen" element={<LKWFahrerBuchen />} />
          <Route path="/kraftfahrer-mieten" element={<KraftfahrerMieten />} />
          <Route path="/ersatzfahrer-lkw" element={<ErsatzfahrerLkw />} />
          <Route path="/mietfahrer" element={<Mietfahrer />} />
          <Route path="/lkw-fahrer-kurzfristig" element={<LkwFahrerKurzfristig />} />
          <Route path="/fahrer-fuer-speditionen" element={<FahrerFuerSpeditionen />} />
          <Route path="/baumaschinenfuehrer-buchen" element={<BaumaschinenfuehrerBuchen />} />
          <Route path="/fluessigboden-service" element={<FlüssigbodenService />} />
          
          {/* 301 Redirects for removed pages → LKW CE Fahrer category */}
          <Route path="/tankwagenfahrer-buchen" element={<LKWFahrerBuchen />} />
          <Route path="/adr-fahrer-buchen" element={<LKWFahrerBuchen />} />
          <Route path="/fahrmischerfahrer-buchen" element={<LKWFahrerBuchen />} />
          <Route path="/fahrmischerfahrer-gesucht" element={<LKWFahrerBuchen />} />
          <Route path="/begleitfahrzeuge-bf3" element={<BegleitfahrzeugeBF3 />} />
          <Route path="/preise-und-ablauf" element={<PreiseUndAblauf />} />
          <Route path="/bf3-ablauf-kosten" element={<BF3Ablauf />} />
          <Route path="/fahrer-registrierung" element={<FahrerRegistrierung />} />
          <Route path="/fahrer-infos" element={<FahrerInfos />} />
          
          
          <Route path="/vermittlung" element={<Vermittlung />} />
          <Route path="/wissenswertes" element={<Wissenswertes />} />
          <Route path="/projekte" element={<Projekte />} />
          {/* <Route path="/trucker-ladies" element={<FahrerCommunityChat />} /> */} {/* Chat deactivated */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/driver/accept" element={<DriverJobResponse />} />
          
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { usePageTracking } from "./hooks/usePageTracking";
import Index from "./pages/Index";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import NotFound from "./pages/NotFound";
import FahrerRegistrierung from "./pages/FahrerRegistrierung";

import Wissenswertes from "./pages/Wissenswertes";
import Projekte from "./pages/Projekte";
import Vermittlung from "./pages/Vermittlung";
import Versicherung from "./pages/Versicherung";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import DriverJobResponse from "./pages/DriverJobResponse";
import AdminRoute from "./components/AdminRoute";
import LKWFahrerBuchen from "./pages/LKWFahrerBuchen";
import KraftfahrerMieten from "./pages/KraftfahrerMieten";

import BaumaschinenfuehrerBuchen from "./pages/BaumaschinenfuehrerBuchen";
import BegleitfahrzeugeBF3 from "./pages/BegleitfahrzeugeBF3";
import PreiseUndAblauf from "./pages/PreiseUndAblauf";
import BF3Ablauf from "./pages/BF3Ablauf";


const queryClient = new QueryClient();

const AppContent = () => {
  usePageTracking();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/lkw-fahrer-buchen" element={<LKWFahrerBuchen />} />
          <Route path="/lkwfahrer-buchen" element={<LKWFahrerBuchen />} />
          <Route path="/kraftfahrer-mieten" element={<KraftfahrerMieten />} />
          <Route path="/baumaschinenfuehrer-buchen" element={<BaumaschinenfuehrerBuchen />} />
          
          {/* 301 Redirects for removed pages → LKW CE Fahrer category */}
          <Route path="/tankwagenfahrer-buchen" element={<LKWFahrerBuchen />} />
          <Route path="/adr-fahrer-buchen" element={<LKWFahrerBuchen />} />
          <Route path="/fahrmischerfahrer-buchen" element={<LKWFahrerBuchen />} />
          <Route path="/fahrmischerfahrer-gesucht" element={<LKWFahrerBuchen />} />
          <Route path="/begleitfahrzeuge-bf3" element={<BegleitfahrzeugeBF3 />} />
          <Route path="/preise-und-ablauf" element={<PreiseUndAblauf />} />
          <Route path="/bf3-ablauf-kosten" element={<BF3Ablauf />} />
          <Route path="/fahrer-registrierung" element={<FahrerRegistrierung />} />
          
          
          <Route path="/vermittlung" element={<Vermittlung />} />
          <Route path="/wissenswertes" element={<Wissenswertes />} />
          <Route path="/projekte" element={<Projekte />} />
          <Route path="/versicherung" element={<Versicherung />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
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

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import NotFound from "./pages/NotFound";
import FahrerRegistrierung from "./pages/FahrerRegistrierung";
import FahrerAdmin from "./pages/FahrerAdmin";
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
import FahrmischerfahrerGesucht from "./pages/FahrmischerfahrerGesucht";
import BaumaschinenfuehrerBuchen from "./pages/BaumaschinenfuehrerBuchen";
import TankwagenfahrerBuchen from "./pages/TankwagenfahrerBuchen";
import ADRFahrerBuchen from "./pages/ADRFahrerBuchen";
import KranfahrerBuchen from "./pages/KranfahrerBuchen";
import FahrmischerfahrerBuchen from "./pages/FahrmischerfahrerBuchen";
import BegleitfahrzeugeBF3 from "./pages/BegleitfahrzeugeBF3";
import PreiseUndAblauf from "./pages/PreiseUndAblauf";
import BF3Ablauf from "./pages/BF3Ablauf";
import Frankfurt from "./pages/region/Frankfurt";
import Hessen from "./pages/region/Hessen";
import RheinMain from "./pages/region/RheinMain";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/lkw-fahrer-buchen" element={<LKWFahrerBuchen />} />
          <Route path="/lkwfahrer-buchen" element={<LKWFahrerBuchen />} />
          <Route path="/kraftfahrer-mieten" element={<KraftfahrerMieten />} />
          <Route path="/fahrmischerfahrer-gesucht" element={<FahrmischerfahrerGesucht />} />
          <Route path="/baumaschinenfuehrer-buchen" element={<BaumaschinenfuehrerBuchen />} />
          <Route path="/tankwagenfahrer-buchen" element={<TankwagenfahrerBuchen />} />
          <Route path="/adr-fahrer-buchen" element={<ADRFahrerBuchen />} />
          <Route path="/kranfahrer-buchen" element={<KranfahrerBuchen />} />
          <Route path="/fahrmischerfahrer-buchen" element={<FahrmischerfahrerBuchen />} />
          <Route path="/begleitfahrzeuge-bf3" element={<BegleitfahrzeugeBF3 />} />
          <Route path="/preise-und-ablauf" element={<PreiseUndAblauf />} />
          <Route path="/bf3-ablauf-kosten" element={<BF3Ablauf />} />
          <Route path="/fahrer-registrierung" element={<FahrerRegistrierung />} />
          
          {/* Regional Pages */}
          <Route path="/frankfurt" element={<Frankfurt />} />
          <Route path="/hessen" element={<Hessen />} />
          <Route path="/rhein-main" element={<RheinMain />} />
          <Route path="/fahrer-admin" element={<FahrerAdmin />} />
          
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

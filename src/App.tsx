import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Impressum from "./pages/Impressum";
import NotFound from "./pages/NotFound";
import FahrerRegistrierung from "./pages/FahrerRegistrierung";
import FahrerAdmin from "./pages/FahrerAdmin";
import Fahrerboerse from "./pages/Fahrerboerse";
import Wissenswertes from "./pages/Wissenswertes";
import Projekte from "./pages/Projekte";
import Vermittlung from "./pages/Vermittlung";
import Versicherung from "./pages/Versicherung";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/fahrer-registrierung" element={<FahrerRegistrierung />} />
          <Route path="/fahrer-admin" element={<FahrerAdmin />} />
          <Route path="/fahrerboerse" element={<Fahrerboerse />} />
          <Route path="/vermittlung" element={<Vermittlung />} />
          <Route path="/wissenswertes" element={<Wissenswertes />} />
          <Route path="/projekte" element={<Projekte />} />
          <Route path="/versicherung" element={<Versicherung />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/impressum" element={<Impressum />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

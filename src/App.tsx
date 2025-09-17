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
import AdminRoute from "./components/AdminRoute";
import JobResponse from "./pages/JobResponse";

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
          
          <Route path="/vermittlung" element={<Vermittlung />} />
          <Route path="/wissenswertes" element={<Wissenswertes />} />
          <Route path="/projekte" element={<Projekte />} />
          <Route path="/versicherung" element={<Versicherung />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/job/:assignmentId/response" element={<JobResponse />} />
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

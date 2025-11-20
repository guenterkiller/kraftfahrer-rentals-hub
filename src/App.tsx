import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ScrollToTop from "./components/ScrollToTop";

// Lazy load all pages for better code splitting
const Index = lazy(() => import("./pages/Index"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FahrerRegistrierung = lazy(() => import("./pages/FahrerRegistrierung"));
const Wissenswertes = lazy(() => import("./pages/Wissenswertes"));
const Projekte = lazy(() => import("./pages/Projekte"));
const Vermittlung = lazy(() => import("./pages/Vermittlung"));
const Versicherung = lazy(() => import("./pages/Versicherung"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const DriverJobResponse = lazy(() => import("./pages/DriverJobResponse"));
const AdminRoute = lazy(() => import("./components/AdminRoute"));
const LKWFahrerBuchen = lazy(() => import("./pages/LKWFahrerBuchen"));
const KraftfahrerMieten = lazy(() => import("./pages/KraftfahrerMieten"));
const BaumaschinenfuehrerBuchen = lazy(() => import("./pages/BaumaschinenfuehrerBuchen"));
const PreiseUndAblauf = lazy(() => import("./pages/PreiseUndAblauf"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
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
          <Route path="/preise-und-ablauf" element={<PreiseUndAblauf />} />
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

// Critical path: Index page loaded synchronously for fast initial render
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// ============================================
// CODE-SPLITTING: Lazy-loaded routes
// Diese werden erst geladen wenn benötigt
// ============================================

// Admin-Bereich (nur bei Zugriff geladen)
const Admin = lazy(() => import("./pages/Admin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const DriverJobResponse = lazy(() => import("./pages/DriverJobResponse"));

// Landing Pages (lazy für reduzierten initialen Bundle)
const LKWFahrerBuchen = lazy(() => import("./pages/LKWFahrerBuchen"));
const KraftfahrerMieten = lazy(() => import("./pages/KraftfahrerMieten"));
const ErsatzfahrerLkw = lazy(() => import("./pages/ErsatzfahrerLkw"));
const Mietfahrer = lazy(() => import("./pages/Mietfahrer"));
const LkwFahrerKurzfristig = lazy(() => import("./pages/LkwFahrerKurzfristig"));
const FahrerFuerSpeditionen = lazy(() => import("./pages/FahrerFuerSpeditionen"));
const BaumaschinenfuehrerBuchen = lazy(() => import("./pages/BaumaschinenfuehrerBuchen"));
const FlüssigbodenService = lazy(() => import("./pages/FlüssigbodenService"));
const BegleitfahrzeugeBF3 = lazy(() => import("./pages/BegleitfahrzeugeBF3"));
const BF3Ablauf = lazy(() => import("./pages/BF3Ablauf"));
const PreiseUndAblauf = lazy(() => import("./pages/PreiseUndAblauf"));

// Fahrer-Bereich (lazy)
const FahrerRegistrierung = lazy(() => import("./pages/FahrerRegistrierung"));
const FahrerInfos = lazy(() => import("./pages/FahrerInfos"));

// Info-Seiten (lazy)
const Wissenswertes = lazy(() => import("./pages/Wissenswertes"));
const Projekte = lazy(() => import("./pages/Projekte"));
const Vermittlung = lazy(() => import("./pages/Vermittlung"));
const Vermittlungsbedingungen = lazy(() => import("./pages/Vermittlungsbedingungen"));
const FahrerVermittlungsbedingungen = lazy(() => import("./pages/FahrerVermittlungsbedingungen"));

// Legal (lazy)
const Impressum = lazy(() => import("./pages/Impressum"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));

const queryClient = new QueryClient();

// ============================================
// DEFERRED ANALYTICS: Tracking nach initialem Render
// ============================================
function DeferredAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Tracking erst nach initialem Render laden (requestIdleCallback oder setTimeout)
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => setShouldLoad(true), { timeout: 2000 });
    } else {
      // Fallback: nach 1s laden
      const timer = setTimeout(() => setShouldLoad(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!shouldLoad) return null;

  // Dynamisch importieren nach idle
  return <LazyAnalyticsTracker />;
}

// Lazy-loaded Analytics Tracker
const LazyAnalyticsTracker = lazy(() => 
  import("./components/AnalyticsTracker").then(module => ({ default: module.AnalyticsTracker }))
);

// Minimal loading fallback (kein visueller Spinner für schnellere wahrgenommene Performance)
const PageFallback = () => null;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        {/* Deferred Analytics - lädt nach initialem Render */}
        <Suspense fallback={null}>
          <DeferredAnalytics />
        </Suspense>
        
        <Toaster />
        <Sonner />
        <ScrollToTop />
        
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Critical path: Index synchron geladen */}
            <Route path="/" element={<Index />} />
            
            {/* Landing Pages - lazy loaded */}
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
            
            {/* Fahrer-Bereich */}
            <Route path="/fahrer-registrierung" element={<FahrerRegistrierung />} />
            <Route path="/fahrer-infos" element={<FahrerInfos />} />
            
            {/* Info-Seiten */}
            <Route path="/vermittlung" element={<Vermittlung />} />
            <Route path="/vermittlungsbedingungen" element={<Vermittlungsbedingungen />} />
            <Route path="/fahrer-vermittlungsbedingungen" element={<FahrerVermittlungsbedingungen />} />
            <Route path="/wissenswertes" element={<Wissenswertes />} />
            <Route path="/projekte" element={<Projekte />} />
            
            {/* Admin-Bereich - lazy loaded */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/driver/accept" element={<DriverJobResponse />} />
            
            {/* Legal */}
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

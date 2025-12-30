/**
 * Leichtgewichtiger Page Loader für Suspense Fallback
 * Kein großes Animation-Asset, nur CSS-basiert
 */
const PageLoader = () => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-background"
      role="status"
      aria-label="Seite wird geladen"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Einfacher CSS-Spinner ohne externe Assets */}
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Laden...</span>
      </div>
    </div>
  );
};

export default PageLoader;

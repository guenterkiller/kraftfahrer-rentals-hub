const BookingAdvantagesInfo = () => {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-6 mt-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">🎯</span>
        Warum unser Online-Formular die beste Wahl ist
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="font-semibold mb-1">Schnellere Bearbeitung</p>
            <p className="text-sm text-muted-foreground">Strukturierte Daten ermöglichen direkte Fahrerzuweisung ohne Rückfragen</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="font-semibold mb-1">Präzise Vermittlung</p>
            <p className="text-sm text-muted-foreground">Klare Anforderungen = perfekt passender Fahrer für Ihr Projekt</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="font-semibold mb-1">Datenschutzkonform</p>
            <p className="text-sm text-muted-foreground">SSL-verschlüsselt und DSGVO-konform – Ihre Daten sind sicher</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <p className="font-semibold mb-1">Vollständige Transparenz</p>
            <p className="text-sm text-muted-foreground">Sie sehen sofort alle Kosten – keine Überraschungen</p>
          </div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg p-4 mt-4">
        <p className="text-sm text-muted-foreground">
          <strong>💬 Lieber telefonieren oder per E-Mail?</strong> Gerne! Beachten Sie jedoch: 
          Anfragen per Formular werden <strong>bevorzugt bearbeitet</strong>, da alle wichtigen Informationen sofort vorliegen.
        </p>
      </div>
    </div>
  );
};

export default BookingAdvantagesInfo;
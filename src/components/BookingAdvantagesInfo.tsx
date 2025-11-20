const BookingAdvantagesInfo = () => {
  return (
    <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-blue-50 p-6 mt-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">🎯</span>
        Warum unser Online-Formular die beste Wahl ist
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Schnellere Bearbeitung</p>
            <p className="text-sm text-gray-600">Strukturierte Daten ermöglichen direkte Fahrerzuweisung ohne Rückfragen</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Präzise Vermittlung</p>
            <p className="text-sm text-gray-600">Klare Anforderungen = perfekt passender Fahrer für Ihr Projekt</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Datenschutzkonform</p>
            <p className="text-sm text-gray-600">SSL-verschlüsselt und DSGVO-konform – Ihre Daten sind sicher</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Vollständige Transparenz</p>
            <p className="text-sm text-gray-600">Sie sehen sofort alle Kosten – keine Überraschungen</p>
          </div>
        </div>
      </div>
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 mt-4 border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>💬 Lieber telefonieren oder per E-Mail?</strong> Gerne! Beachten Sie jedoch: 
          Anfragen per Telefon oder E-Mail müssen wir manuell ins System übertragen, was die Bearbeitungszeit verlängern kann.
        </p>
      </div>
    </div>
  );
};

export default BookingAdvantagesInfo;
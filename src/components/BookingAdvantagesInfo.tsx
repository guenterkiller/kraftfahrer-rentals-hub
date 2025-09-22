const BookingAdvantagesInfo = () => {
  return (
    <div className="rounded-xl border border-muted p-4 mt-6">
      <h3 className="text-base font-semibold mb-3">Warum „Fahrer buchen" schneller ist</h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="text-green-600 font-semibold">✅</span>
          <span><strong>Direkte Erfassung</strong> im System – keine Rückfragen nötig</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-600 font-semibold">⚡</span>
          <span><strong>Schnelle Disposition</strong> – wir weisen den passenden Fahrer über den Adminbereich zu</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-purple-600 font-semibold">🧾</span>
          <span><strong>Klare Daten</strong> – alle Einsatzinfos an einem Ort, weniger Missverständnisse</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-green-600 font-semibold">🔒</span>
          <span><strong>Datenschutzkonform</strong> – sichere Übertragung Ihrer Angaben</span>
        </li>
      </ul>
      <p className="text-sm text-muted-foreground mt-3">
        <strong>E-Mail stattdessen?</strong> Gern – beachten Sie: E-Mails müssen wir <em>händisch</em> übernehmen. 
        Das kann je nach Aufkommen Zeit kosten.
      </p>
    </div>
  );
};

export default BookingAdvantagesInfo;
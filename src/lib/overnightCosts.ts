/** Freigegebene Übernachtungshinweise; Preise und Tarifermittlung bleiben unverändert. */
export const OVERNIGHT_COSTS = {
  title: 'Übernachtungskosten bei auswärtigen Einsätzen',
  standard: [
    'Bei auswärtigen Einsätzen können Übernachtungen erforderlich sein. Die Kosten hierfür sind nicht in den regulären Tages- und Wochenpreisen enthalten.',
    'Der Auftraggeber kann eine geeignete Unterkunft bereitstellen oder die vorab vereinbarten Übernachtungskosten zusätzlich übernehmen. Die Abstimmung erfolgt vor verbindlicher Auftragserteilung.',
  ],
  fernfahrerTitle: 'Ausnahme: Fernfahrer-Pauschale',
  fernfahrer: [
    'Bei der Fernfahrer-Pauschale von 450,00 € netto je Einsatztag ist grundsätzlich die Übernachtung im Führerhaus vorgesehen, sofern dieses über eine geeignete Schlafmöglichkeit verfügt und die gesetzlichen Voraussetzungen eingehalten werden.',
    'Zusätzliche Hotelkosten entstehen bei diesem Tarif nicht automatisch. Sollte ausnahmsweise eine externe Unterkunft erforderlich sein, werden deren Kosten vorab mit dem Auftraggeber vereinbart.',
  ],
  legal: 'Die gesetzlichen Vorschriften zu Ruhezeiten und Übernachtungen außerhalb des Fahrzeugs bleiben unberührt. Insbesondere darf eine regelmäßige wöchentliche Ruhezeit von mindestens 45 Stunden nicht im Fahrzeug verbracht werden.',
} as const;
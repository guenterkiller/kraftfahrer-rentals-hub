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
  multiWeekTitle: 'Mehrwöchige auswärtige Einsätze',
  multiWeek: 'Bei mehrwöchigen auswärtigen Einsätzen werden tatsächlich durchgeführte Heimfahrten zum Wochenende und erneute Anreisen zum Beginn der folgenden Einsatzwoche ebenfalls nach der Regelung zu den An- und Abfahrtskosten berechnet. Die voraussichtlichen Fahrtkosten werden dem Auftraggeber vor verbindlicher Auftragserteilung mitgeteilt.',
  legal: 'Die gesetzlichen Vorschriften zu Ruhezeiten und Übernachtungen außerhalb des Fahrzeugs bleiben unberührt. Insbesondere darf eine regelmäßige wöchentliche Ruhezeit von mindestens 45 Stunden nicht im Fahrzeug verbracht werden.',
} as const;

/** Verbindliche Regelung zu An- und Abfahrtskosten (Preisseite, Kundenbestätigung, Fahrtkostenhinweise). */
export const TRAVEL_COSTS = {
  title: 'An- und Abfahrtskosten',
  rules: [
    'Die ersten 25 Kilometer je einfacher Fahrt zwischen dem Wohnort bzw. Standort des eingesetzten Fahrers und dem Einsatzort sind kostenfrei.',
    'Ab dem 26. Kilometer werden 0,40 € netto je tatsächlich gefahrenem Kilometer berechnet.',
    'Die Regelung gilt sowohl für die Anreise als auch für die Rückfahrt.',
    'Bei mehrwöchigen auswärtigen Einsätzen werden tatsächlich durchgeführte Heimfahrten zum Wochenende und erneute Anreisen zum Beginn der folgenden Einsatzwoche ebenfalls nach dieser Regelung berechnet.',
    'Die voraussichtlichen Fahrtkosten werden dem Auftraggeber vor verbindlicher Auftragserteilung mitgeteilt.',
  ],
  short: 'erste 25 km je einfacher Fahrt frei, danach 0,40 € netto je tatsächlich gefahrenem Kilometer – gilt für Anreise und Rückfahrt',
  exampleTitle: 'Berechnungsbeispiel bei 150 km einfacher Entfernung',
  example: [
    'Anreise: (150 − 25) × 0,40 € = 50,00 € netto',
    'Rückfahrt: (150 − 25) × 0,40 € = 50,00 € netto',
    'Gesamt: 100,00 € netto',
    'Bei drei Einsatzwochen mit jeweils einer An- und einer Abreise ergeben sich 300,00 € netto Fahrtkosten.',
  ],
} as const;

/** Fahrtkosten je einfacher Fahrt nach der verbindlichen Regelung. */
export const travelCostPerTrip = (km: number): number => Math.max(0, Math.round(km) - 25) * 0.4;
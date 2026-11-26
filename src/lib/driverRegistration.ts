import { format, isValid, parseISO } from 'date-fns';

export const AVAILABILITY_OPTIONS = [
  { value: 'sofort', label: 'Ab sofort' },
  { value: 'absprache', label: 'Nach Absprache' },
  { value: 'ab_datum', label: 'Ab Datum' },
] as const;

export function registrationToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find(p => p.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function calendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = parseISO(value);
  return isValid(date) && format(date, 'yyyy-MM-dd') === value;
}

export function availabilityError(choice: string, date: string, today = registrationToday()): string | null {
  if (!choice) return null; // Das bestehende Feld bleibt optional.
  if (!AVAILABILITY_OPTIONS.some(option => option.value === choice)) return 'Bitte wählen Sie eine gültige Verfügbarkeit aus.';
  if (choice !== 'ab_datum') return null;
  if (!calendarDate(date)) return 'Bitte geben Sie ein gültiges Kalenderdatum an.';
  if (date < today) return 'Das Verfügbarkeitsdatum darf nicht in der Vergangenheit liegen.';
  return null;
}

export function serializeAvailability(choice: string, date: string): string | null {
  return choice === 'ab_datum' ? `ab_datum:${date}` : choice || null;
}

export function displayAvailability(value?: string | null): string {
  if (!value) return 'Nicht angegeben';
  const option = AVAILABILITY_OPTIONS.find(option => option.value === value);
  if (option) return option.label;
  if (value.startsWith('ab_datum:') && calendarDate(value.slice(9))) {
    return `Ab ${format(parseISO(value.slice(9)), 'dd.MM.yyyy')}`;
  }
  const legacy: Record<string, string> = {
    kurzfristig: 'kurzfristig verfügbar', tageweise: 'tageweise verfügbar', wochenweise: 'wochenweise verfügbar',
  };
  return legacy[value] ?? value; // Unbekannte Altwerte niemals verwerfen.
}

export function registrationDeclarationErrors(privacy: boolean, business: boolean): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!privacy) errors.datenschutz = 'Bitte bestätigen Sie die Kenntnisnahme der Datenschutzerklärung.';
  if (!business) errors.gewerbenachweis_bestaetigt = 'Bitte bestätigen Sie Ihre Selbstständigkeit und die Voraussetzungen für die Freischaltung.';
  return errors;
}
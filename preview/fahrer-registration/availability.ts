// Disconnected server draft; no database writes or side effects in this module.
export function normalizeAvailability(value: unknown, today = berlinToday()):
  { ok: true; value: string | null } | { ok: false; error: string } {
  if (value === undefined || value === null || value === '') return { ok: true, value: null };
  if (value === 'sofort' || value === 'absprache') return { ok: true, value };
  if (typeof value !== 'string' || !/^ab_datum:\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { ok: false, error: 'Bitte wählen Sie eine gültige Verfügbarkeit aus.' };
  }
  const date = value.slice(9);
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    return { ok: false, error: 'Bitte geben Sie ein gültiges Kalenderdatum an.' };
  }
  if (date < today) return { ok: false, error: 'Das Verfügbarkeitsdatum darf nicht in der Vergangenheit liegen.' };
  return { ok: true, value };
}

function berlinToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find(p => p.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

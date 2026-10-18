/** Akzeptiert nur explizite, positive Eurobeträge, die auch nach Cent-Rundung positiv sind. */
export const parseUnterkunftObergrenze = (value: unknown): number | null => {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !/^\d+(?:[.,]\d+)?$/.test(value.trim())) return null;
  const parsed = typeof value === 'number' ? value : Number(value.trim().replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  const rounded = Math.round(parsed * 100) / 100;
  return Number.isFinite(rounded) && rounded > 0 ? rounded : null;
};
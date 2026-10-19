// Reine Auswahlregeln der automatischen Vermittlung bei Fahrerfreischaltung.
// Keine Datenbank- oder Mailzugriffe – vollständig mit Beispieldaten testbar.
import { isJobReleased } from '../_shared/job-release.ts';

export const MAX_INVITES = 5;

// Normalize license class strings: "C+E", "C + E", "Klasse CE", "Führerschein CE" → "CE"
export function normalizeClass(raw: string): string {
  if (!raw) return '';
  let s = String(raw).toUpperCase();
  s = s.replace(/KLASSE/g, '').replace(/FÜHRERSCHEIN/g, '').replace(/FUEHRERSCHEIN/g, '');
  s = s.replace(/[\s+\-_/.]/g, '');
  return s.trim();
}

// Defensive license-class match with normalization.
export function driverMatchesJob(driver: any, job: any): boolean {
  const driverClasses: string[] = Array.isArray(driver?.fuehrerscheinklassen)
    ? driver.fuehrerscheinklassen.map((c: string) => normalizeClass(c)).filter(Boolean)
    : [];
  if (driverClasses.length === 0) return false;
  const required = normalizeClass(String(job?.fuehrerscheinklasse || ''));
  if (!required) return false;
  if (driverClasses.includes(required)) return true;
  // CE driver covers C / C1 jobs (CE > C > C1)
  if (driverClasses.includes('CE') && (required === 'C' || required === 'C1')) return true;
  if (driverClasses.includes('C') && required === 'C1') return true;
  return false;
}

// Parse all D.M.YYYY dates out of a freetext `zeitraum`.
export function parseZeitraumDates(zeitraum: string): Date[] {
  if (!zeitraum) return [];
  const re = /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/g;
  const dates: Date[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(String(zeitraum))) !== null) {
    const d = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    let y = parseInt(m[3], 10);
    if (y < 100) y += 2000;
    if (y < 2020 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) continue;
    dates.push(new Date(y, mo - 1, d));
  }
  return dates;
}

// Strict validity check: a job may only be offered if its Einsatzende is NOT in the past.
// No grace window. Undecidable cases are skipped (defensive) and reported.
// Returns { valid, reason }.
export function jobPeriodIsValid(job: any): { valid: boolean; reason: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1) Explicit end date columns win, if present.
  const explicitEnd = job?.end_date ?? job?.einsatz_ende ?? null;
  if (explicitEnd) {
    const end = new Date(explicitEnd);
    if (!isNaN(end.getTime())) {
      end.setHours(0, 0, 0, 0);
      return end >= today
        ? { valid: true, reason: 'end_date_future' }
        : { valid: false, reason: 'end_date_past' };
    }
  }

  // 2) Fall back to freetext `zeitraum`.
  const dates = parseZeitraumDates(job?.zeitraum || '');
  if (dates.length === 0) return { valid: false, reason: 'no_parseable_date' };

  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
  maxDate.setHours(0, 0, 0, 0);

  if (dates.length === 1) {
    // Only a start date known, no end date: skip if the start lies clearly in the past.
    const graceDays = 7;
    const limit = new Date(today.getTime() - graceDays * 24 * 60 * 60 * 1000);
    if (maxDate < limit) return { valid: false, reason: 'start_only_far_past' };
    return { valid: true, reason: 'start_only_recent' };
  }

  return maxDate >= today
    ? { valid: true, reason: 'zeitraum_end_future' }
    : { valid: false, reason: 'zeitraum_end_past' };
}


export function selectOfferableJobs(driver: any, jobs: any[]) {
  let skippedExpired = 0;
  let skippedNoMatch = 0;
  const unclearJobs: Array<{ id: string; zeitraum: string; reason: string }> = [];
  const validJobs = jobs.filter((job) => {
    // Nur ausdrücklich vom Admin freigegebene Aufträge vermitteln
    if (!isJobReleased(job)) return false;
    const { valid, reason } = jobPeriodIsValid(job);
    if (!valid) {
      skippedExpired++;
      if (reason === 'no_parseable_date' || reason === 'start_only_far_past') {
        unclearJobs.push({ id: job.id, zeitraum: job.zeitraum || '', reason });
      }
      return false;
    }
    return true;
  });
  const matchingJobs = validJobs.filter((job) => {
    if (!driverMatchesJob(driver, job)) { skippedNoMatch++; return false; }
    return true;
  });
  return { validJobs, matchingJobs, skippedExpired, skippedNoMatch, unclearJobs };
}

/** Bereits vorhandene Einladung (auch abgelehnt/abgelaufen) → nie erneut senden. */
export function inviteDecision(existing: unknown, alreadyPlanned: number): 'limit' | 'duplicate' | 'create' {
  if (alreadyPlanned >= MAX_INVITES) return 'limit';
  if (existing) return 'duplicate';
  return 'create';
}

export interface Driver {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  status: string | null;
  is_blocked: boolean | null;
  is_inactive: boolean | null;
  email_opt_out: boolean | null;
}

export const cancellationTemplates = ['job_cancelled_assigned', 'job_cancelled_invited'];
export const invitationTemplates = ['job-broadcast', 'driver_job_notification', 'driver_job_invite_post_approval'];
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function eligible(driver: Driver): boolean {
  return driver.status === 'approved' && driver.is_blocked === false &&
    driver.is_inactive === false && driver.email_opt_out === false;
}

export function uniqueRecipients(drivers: Driver[], assignedIds: Set<string>) {
  const ids = new Set<string>();
  const emails = new Set<string>();
  // A currently assigned driver always takes priority over a merely informed driver.
  return [...drivers].sort((a, b) => Number(assignedIds.has(b.id)) - Number(assignedIds.has(a.id)))
    .filter(driver => {
      const email = normalizeEmail(driver.email);
      if (!eligible(driver) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || ids.has(driver.id) || emails.has(email)) return false;
      ids.add(driver.id);
      emails.add(email);
      return true;
    });
}

export function cancellationMail(driver: Driver, job: { einsatzort: string; zeitraum: string }, assigned: boolean) {
  const subject = `${assigned ? 'Auftrag storniert' : 'Auftrag nicht mehr verfügbar'} – ${job.einsatzort} / ${job.zeitraum}`;
  const paragraphs = [
    `Hallo ${driver.vorname} ${driver.nachname},`,
    assigned
      ? `der Auftrag in ${job.einsatzort} für den Zeitraum ${job.zeitraum} wurde storniert.`
      : `der zuvor versandte Auftrag in ${job.einsatzort} für den Zeitraum ${job.zeitraum} wurde storniert und steht nicht mehr zur Verfügung.`,
    assigned
      ? 'Der Einsatz findet nicht statt. Bitte plane diesen Auftrag nicht weiter ein.'
      : 'Eine Bewerbung bzw. Rückmeldung zu diesem Auftrag ist daher nicht mehr erforderlich.',
    'Freundliche Grüße\nGünter Killer\nFahrerexpress-Agentur',
  ];
  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char));
  return {
    subject: subject.replace(/[\r\n]/g, ' '),
    text: paragraphs.join('\n\n'),
    html: paragraphs.map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join(''),
    template: assigned ? cancellationTemplates[0] : cancellationTemplates[1],
  };
}

// Dependencies are injected so tests cannot contact production or send real mail.
export async function deliverCancellations(
  drivers: Driver[], assignedIds: Set<string>, job: { einsatzort: string; zeitraum: string },
  deps: {
    refresh: (id: string) => Promise<Driver | null>;
    alreadySent: (email: string) => Promise<boolean>;
    send: (driver: Driver, mail: ReturnType<typeof cancellationMail>) => Promise<string | null>;
    log: (driver: Driver, mail: ReturnType<typeof cancellationMail>, status: string, error?: string, messageId?: string | null) => Promise<void>;
    pause: () => Promise<void>;
  },
) {
  const recipients = uniqueRecipients(drivers, assignedIds);
  const result = { sent: 0, failed: 0, skipped: drivers.length - recipients.length, alreadySent: 0 };
  const usedEmails = new Set<string>();
  for (const original of recipients) {
    let mail = cancellationMail(original, job, assignedIds.has(original.id));
    try {
      const driver = await deps.refresh(original.id);
      // No fallback to invitation snapshots, stale flags or old email addresses.
      if (!driver || !eligible(driver) || normalizeEmail(driver.email) !== normalizeEmail(original.email)) {
        result.skipped++;
        await deps.log(original, mail, 'skipped', 'Aktuell nicht versandberechtigt oder Adresse geändert');
        continue;
      }
      const email = normalizeEmail(driver.email);
      if (usedEmails.has(email) || await deps.alreadySent(email)) {
        result.alreadySent++;
        continue;
      }
      // Recheck immediately after the log lookup, immediately before the send.
      const latest = await deps.refresh(driver.id);
      if (!latest || !eligible(latest) || normalizeEmail(latest.email) !== email) {
        result.skipped++;
        await deps.log(driver, mail, 'skipped', 'Aktuell nicht versandberechtigt oder Adresse geändert');
        continue;
      }
      mail = cancellationMail(latest, job, assignedIds.has(latest.id));
      usedEmails.add(email);
      const messageId = await deps.send({ ...latest, email }, mail);
      result.sent++;
      await deps.log(latest, mail, 'sent', undefined, messageId);
    } catch (error) {
      result.failed++;
      // Stop safely if logging itself is unavailable; never hide a partial delivery.
      await deps.log(original, mail, 'failed', error instanceof Error ? error.message : String(error));
    }
    await deps.pause();
  }
  return result;
}
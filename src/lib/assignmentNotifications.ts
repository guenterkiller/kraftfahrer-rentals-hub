export type AssignmentMailStatus = 'sent' | 'failed';

export interface AssignmentNotificationResult {
  adminConfirmation: AssignmentMailStatus;
  customerConfirmation: AssignmentMailStatus;
  driverOffer: AssignmentMailStatus;
  errors: string[];
}

interface AssignmentNotificationDeps {
  confirmAdminAssignment: () => Promise<void>;
  sendCustomerConfirmation: () => Promise<void>;
  sendDriverOffer: () => Promise<void>;
}

const messageOf = (error: unknown) => error instanceof Error ? error.message : String(error);

/**
 * Die Kunden-Einsatzbestätigung folgt der Zuweisung durch Fahrerexpress.
 * Fahrerangebot und Kundenbestätigung laufen danach unabhängig: Ein Fehlschlag
 * darf den anderen Versand nicht verhindern. Keine Fahrerannahme ist erforderlich.
 */
export async function sendAssignmentNotifications(
  deps: AssignmentNotificationDeps,
): Promise<AssignmentNotificationResult> {
  const result: AssignmentNotificationResult = {
    adminConfirmation: 'sent',
    customerConfirmation: 'sent',
    driverOffer: 'sent',
    errors: [],
  };

  try {
    await deps.confirmAdminAssignment();
  } catch (error) {
    result.adminConfirmation = 'failed';
    result.errors.push(`Interne Bestätigung: ${messageOf(error)}`);
  }

  try {
    await deps.sendCustomerConfirmation();
  } catch (error) {
    result.customerConfirmation = 'failed';
    result.errors.push(`Kunden-Einsatzbestätigung: ${messageOf(error)}`);
  }

  try {
    await deps.sendDriverOffer();
  } catch (error) {
    result.driverOffer = 'failed';
    result.errors.push(`Fahrerangebot: ${messageOf(error)}`);
  }

  return result;
}

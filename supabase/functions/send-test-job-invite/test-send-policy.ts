// Regeln für den Testversand. Testmails sind immer reine Vorschau:
// keine Antwortlinks, keine Einladungen, keine Zuordnungen oder Annahmen.
import { isJobReleased, type JobReleaseInput } from "../_shared/job-release.ts";

/** Ausdrücklich freigegebene interne Testadresse. */
export const INTERNAL_TEST_EMAIL = "guenter.killer@t-online.de";

export type TestSendDecision =
  | { allowed: true; createInvite: false }
  | { allowed: false; reason: "job_not_released" };

export function decideTestSend(recipientEmail: string, job: JobReleaseInput | null): TestSendDecision {
  const isInternal = (recipientEmail || "").trim().toLowerCase() === INTERNAL_TEST_EMAIL;
  if (isInternal || isJobReleased(job)) return { allowed: true, createInvite: false };
  return { allowed: false, reason: "job_not_released" };
}

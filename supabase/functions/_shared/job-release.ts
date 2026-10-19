// Zentrale Freigaberegel für Kundenaufträge.
// Ein Auftrag gilt nur dann als zur Vermittlung freigegeben, wenn der Admin ihn
// ausdrücklich über „Freigeben & Senden" freigegeben hat (approved_at gesetzt)
// und er sich in einem noch vermittelbaren Status befindet.

export const RELEASABLE_STATUSES = ["approved", "sent", "open", "pending"] as const;

export type JobReleaseInput = {
  status?: string | null;
  approved_at?: string | null;
};

export function isJobReleased(job: JobReleaseInput | null | undefined): boolean {
  if (!job) return false;
  if (!job.approved_at) return false;
  return (RELEASABLE_STATUSES as readonly string[]).includes(String(job.status ?? ""));
}

export type DriverEligibilityInput = {
  status?: string | null;
  is_blocked?: boolean | null;
  is_inactive?: boolean | null;
};

/** Fahrer darf über Links nur reagieren, wenn freigeschaltet, nicht gesperrt und nicht deaktiviert. */
export function isDriverActive(driver: DriverEligibilityInput | null | undefined): boolean {
  if (!driver) return false;
  return driver.status === "approved" && driver.is_blocked !== true && driver.is_inactive !== true;
}

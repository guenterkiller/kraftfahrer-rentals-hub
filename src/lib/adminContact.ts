/** Keep company and contact person independent; never infer company from a person's name. */
export function loadAdminContact(job: { company?: string | null; customer_name?: string | null }) {
  return { company: job.company?.trim() || '', contact: job.customer_name?.trim() || '' };
}
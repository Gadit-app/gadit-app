/**
 * Our own accounts, kept out of every admin count (Gadi 2026-10-10: "כל מה
 * שקשור אלי אתה יכול להוריד"). They still appear in the lists, marked as
 * internal; they just never count as customers, schools or signups.
 */
export const INTERNAL_EMAILS = new Set<string>([
  "gadibenlavi@gmail.com", // Gadi: his own family + the college "school"
  "demo.school@gadit.app",
  "demo.school.ar@gadit.app",
  "googleplay-review@gadit.app",
  "demo.individual@gadit.app",
]);

export function isInternalEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  // Every @gadit.app address is ours (demo accounts, the Play reviewer).
  return INTERNAL_EMAILS.has(e) || e.endsWith("@gadit.app");
}

/** The four customer categories Gadit sells today (Gadi 2026-10-10). Legacy
 *  plan values "clear" and "deep" are both Individual; Family and Schools
 *  also store plan "deep" and are told apart by familyId / schoolId. */
export type CustomerCategory = "basic" | "individual" | "family" | "schools";

export function customerCategory(d: { plan?: unknown; familyId?: unknown; schoolId?: unknown }, uid: string): CustomerCategory {
  if (typeof d.schoolId === "string" && d.schoolId === uid) return "schools";
  if (d.familyId) return "family";
  if (d.plan === "clear" || d.plan === "deep") return "individual";
  return "basic";
}

export const CATEGORY_LABEL: Record<CustomerCategory, string> = {
  basic: "Basic",
  individual: "Individual",
  family: "Family",
  schools: "Schools",
};

/** Paying = a live subscription that collects money: active, or past_due
 *  inside the 7-day grace period (the account keeps access). Trials are the
 *  pipeline, counted apart. One definition for every admin page (Gadi
 *  2026-10-10: Overview read 40 while Subscribers read 45). */
export function isPayingStatus(status: unknown): boolean {
  return status === "active" || status === "past_due";
}

/** Our own accounts plus everyone attached to them: members of an internal
 *  owner's family, and accounts inside an internal owner's school. */
export function internalUids(rows: Array<{ uid: string; email?: string | null; familyId?: unknown; schoolId?: unknown }>): Set<string> {
  const out = new Set<string>();
  const fams = new Set<string>();
  for (const r of rows) {
    if (!isInternalEmail(r.email)) continue;
    out.add(r.uid);
    if (typeof r.familyId === "string" && r.familyId) fams.add(r.familyId);
  }
  for (const r of rows) {
    if (typeof r.familyId === "string" && fams.has(r.familyId)) out.add(r.uid);
    if (typeof r.schoolId === "string" && out.has(r.schoolId)) out.add(r.uid);
  }
  return out;
}

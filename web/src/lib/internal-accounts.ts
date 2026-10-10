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
]);

export function isInternalEmail(email: string | null | undefined): boolean {
  return !!email && INTERNAL_EMAILS.has(email.trim().toLowerCase());
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

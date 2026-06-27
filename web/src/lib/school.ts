/**
 * Schools subscription shared types + helpers.
 *
 * Architecture (mirrors families/, see web/src/lib/family.ts):
 *   - One Firebase Auth user = the paying principal (or coordinator).
 *     schoolId === ownerUid. They sign in normally (email/password or
 *     Google) and manage classrooms from /schools.
 *   - Classrooms are a subcollection: schools/{schoolId}/classrooms/{classroomId}.
 *     Each classroom has a 6-character ALPHANUMERIC class code (e.g.
 *     "AB42KL") and an optional teacher name + grade label. Unlimited
 *     classrooms per school subscription, no cap.
 *   - Students do NOT have accounts. A kid lands on /c/<CODE>, types
 *     a word, gets the definition. No login, no password, no PII. The
 *     class code is the only identifier. This is intentional — it
 *     sidesteps every minor-data regulation (DPDP, COPPA, GDPR-K) in
 *     one move, because there is no minor data stored.
 *   - Word searches from /c/<CODE> are logged anonymously to
 *     schools/{schoolId}/classrooms/{classroomId}/searches/{searchId}
 *     so the teacher can see "what did my class look up today" without
 *     ever knowing which child searched what.
 *   - Subscription lives on schools/{schoolId} doc with the same fields
 *     used by /api/webhook for personal Clear/Deep/Family, plus a
 *     `plan` field ("monthly" | "yearly") for billing cycle.
 *
 * Why this shape:
 *   - Matches the family.ts pattern Gadi already mastered, so the build
 *     is largely mechanical translation of family flows to school flows.
 *   - The "no student accounts" decision dissolves the entire privacy
 *     surface area. A school's classroom code is no more sensitive than
 *     a Kahoot room code.
 */

export interface School {
  ownerUid: string;
  plan: "monthly" | "yearly";
  /** Display name of the school. Shown to teachers + on /c/<CODE>. */
  name: string;
  /** Optional school logo. Uploaded by principal to Firebase Storage,
   *  URL stored here. Displayed on the kid-facing /c/<CODE> page so the
   *  classroom feels like part of the school, not a third-party site. */
  logoUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Classroom {
  id: string;           // classroom doc id
  /** 6-character alphanumeric uppercase code, e.g. "AB42KL". Used in
   *  the /c/<CODE> URL kids visit. Unique within a school. */
  code: string;
  /** Optional human label, e.g. "Class 7B — Sara". Teacher facing. */
  name: string;
  /** Optional grade label for analytics later, e.g. "5", "9". */
  grade?: string | null;
  /** Optional teacher display name. */
  teacherName?: string | null;
  /** Total searches ever, kept on the doc so the schools list page can
   *  show "37 words this week" without a separate aggregation. */
  searchCount: number;
  createdAt: string;
}

/** Generate a 6-character alphanumeric class code. Excludes characters
 *  that look alike on a printed sheet (0/O, 1/I/L) — a kid copying the
 *  code off a wall poster will not confuse them. */
export function generateClassCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0,O,1,I,L
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

/** Validate a code typed by a kid at /c/<CODE> or /join. Forgiving:
 *  uppercases, strips whitespace, must be exactly 6 chars from the
 *  generator's alphabet. */
export function normalizeClassCode(raw: string): string | null {
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned.length !== 6) return null;
  // Reject characters not in the generator alphabet
  if (!/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]+$/.test(cleaned)) return null;
  return cleaned;
}

/** Hard cap on file size for school logos. 500KB keeps Firebase Storage
 *  bandwidth costs predictable and 99% of school logos are well under
 *  this once compressed. The /schools logo upload UI will reject larger
 *  files client-side with a friendly message. */
export const MAX_LOGO_BYTES = 500 * 1024;

/** Accepted MIME types for school logos. PNG for transparency, JPG for
 *  photo logos. SVG is deliberately excluded — it's an XML injection
 *  surface when displayed on a kid-facing page and most schools don't
 *  have an SVG version anyway. */
export const ALLOWED_LOGO_MIMES = ["image/png", "image/jpeg"] as const;

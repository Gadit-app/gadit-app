/**
 * Family subscription shared types + helpers.
 *
 * Architecture (mirrors Yooniz):
 *   - One Firebase Auth user = the paying owner. familyId === ownerUid.
 *   - Other members (kids, secondary parents) have NO email/password.
 *     They sign in via `signInWithCustomToken` after their device is
 *     paired with a 6-digit code. Their Firebase Auth uid is synthetic:
 *     `${familyId}_${memberId}`.
 *   - The custom token carries a `role` claim ("kid" or "parent") that
 *     the UI uses to decide what to render (kid view vs full).
 *   - Subscription lives on `families/{familyId}` with the same fields
 *     used by /api/webhook for personal Clear/Deep, plus a `plan` field
 *     ("monthly" | "yearly") for the billing cycle.
 *   - Notebook / search history / streaks stay scoped by
 *     `users/{uid}` — because every member has their own uid (real or
 *     synthetic), the existing per-uid Firestore structure works
 *     unchanged. We just create `users/{syntheticUid}` doc on pair
 *     redeem with `plan: "deep"` so feature gates pass.
 */

export type MemberRole = "father" | "mother" | "boy" | "girl";

export interface FamilyMember {
  id: string;            // member doc id
  role: MemberRole;
  name: string;
  colorIndex: number;    // 0..7, picks from MEMBER_COLORS
  avatarPhotoUrl?: string | null;
  isOwner: boolean;
  userId?: string | null;       // present once the device is paired (real or synthetic Firebase Auth uid)
  deviceLinkedAt?: string | null;
  createdAt: string;
}

export interface Family {
  ownerUid: string;
  plan: "monthly" | "yearly";
  createdAt: string;
  updatedAt?: string;
}

/** Eight friendly avatar fills. Member's colorIndex maps into this list.
 *  Family avatars are chips with the role icon on a colored circle; the
 *  user can later upload a photo to override the colored chip. */
export const MEMBER_COLORS = [
  "#0EA5A5", // teal
  "#7C3AED", // purple
  "#F59E0B", // amber
  "#EC4899", // pink
  "#10B981", // green
  "#3B82F6", // blue
  "#EF4444", // red
  "#8B5CF6", // violet
] as const;

export function memberColorFor(m: { colorIndex?: number }): string {
  const i = typeof m.colorIndex === "number" ? m.colorIndex : 0;
  return MEMBER_COLORS[Math.max(0, Math.min(MEMBER_COLORS.length - 1, i))];
}

/** "Parent" group = father + mother. "Children" group = boy + girl. */
export function isParentRole(role: MemberRole): boolean {
  return role === "father" || role === "mother";
}

/** Six-digit numeric pairing code, e.g. "048213". */
export function generateSixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Pairing codes are valid for 15 minutes — mirrors Yooniz. */
export const PAIRING_CODE_TTL_MS = 30 * 60 * 1000;

/** Cap on number of children per Family subscription. Parents don't
 *  count toward this cap. Set to 5 (Gadi 2026-06-26) — high enough to
 *  cover real families but low enough that someone can't share one
 *  $6.99 plan across an extended group. */
export const MAX_KIDS_PER_FAMILY = 5;

/** Synthetic uid format used for paired members. familyId === ownerUid. */
export function syntheticUidFor(familyId: string, memberId: string): string {
  return `${familyId}_${memberId}`;
}

/** Default member name when the parent leaves the field blank. */
export function defaultMemberName(role: MemberRole, lang: string): string {
  const en = { father: "Dad", mother: "Mom", boy: "My son", girl: "My daughter" };
  const he = { father: "אבא", mother: "אמא", boy: "הבן שלי", girl: "הבת שלי" };
  const t = lang === "he" ? he : en;
  return t[role];
}

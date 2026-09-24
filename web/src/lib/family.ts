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
  avatarId?: string | null;     // picked illustrated avatar (see AVATARS); overrides the colored initial, but a real photo still wins
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

/** Illustrated character avatars a kid can pick (Gadi 2026-08-16), the way
 *  they pick a Roblox character. Each id has an image at /avatars/{id}.webp
 *  (generated via gpt-image-1). `emoji` is a lightweight fallback/label. */
export type AvatarDef = { id: string; emoji: string; name: Record<string, string> };

/** Kid characters (modern flat, learning-themed) for boy/girl members. */
export const KID_AVATARS: AvatarDef[] = [
  { id: "kid1", emoji: "📖", name: { he: "קוראת", en: "Reader", ar: "قارئة", ru: "Читатель" } },
  { id: "kid2", emoji: "🔬", name: { he: "מדען", en: "Scientist", ar: "عالِم", ru: "Учёный" } },
  { id: "kid3", emoji: "🎨", name: { he: "אמנית", en: "Artist", ar: "فنانة", ru: "Художник" } },
  { id: "kid4", emoji: "🧭", name: { he: "חוקר", en: "Explorer", ar: "مستكشف", ru: "Исследователь" } },
  { id: "kid5", emoji: "🎧", name: { he: "מוזיקאית", en: "Musician", ar: "موسيقية", ru: "Музыкант" } },
  { id: "kid6", emoji: "✏️", name: { he: "כותב", en: "Writer", ar: "كاتب", ru: "Писатель" } },
  { id: "kid7", emoji: "⭐", name: { he: "חולמת", en: "Dreamer", ar: "حالمة", ru: "Мечтатель" } },
  { id: "kid8", emoji: "🎮", name: { he: "גיימר", en: "Gamer", ar: "لاعب", ru: "Геймер" } },
  { id: "kid9", emoji: "💡", name: { he: "ממציאה", en: "Inventor", ar: "مخترعة", ru: "Изобретатель" } },
  { id: "kid10", emoji: "⚽", name: { he: "ספורטאי", en: "Athlete", ar: "رياضي", ru: "Спортсмен" } },
  { id: "kid11", emoji: "😄", name: { he: "צוחקת", en: "Giggler", ar: "ضاحكة", ru: "Весельчак" } },
  { id: "kid12", emoji: "🧠", name: { he: "גאון", en: "Genius", ar: "عبقري", ru: "Гений" } },
];

/** Parent avatars (dads + moms), simpler, for father/mother members. */
export const PARENT_AVATARS: (AvatarDef & { for: "father" | "mother" })[] = [
  { id: "dad1", for: "father", emoji: "👨", name: { he: "אבא", en: "Dad", ar: "أب", ru: "Папа" } },
  { id: "dad2", for: "father", emoji: "👨🏾", name: { he: "אבא", en: "Dad", ar: "أب", ru: "Папа" } },
  { id: "dad3", for: "father", emoji: "👨‍🦱", name: { he: "אבא", en: "Dad", ar: "أب", ru: "Папа" } },
  { id: "dad4", for: "father", emoji: "👱‍♂️", name: { he: "אבא", en: "Dad", ar: "أب", ru: "Папа" } },
  { id: "mom1", for: "mother", emoji: "👩", name: { he: "אמא", en: "Mom", ar: "أم", ru: "Мама" } },
  { id: "mom2", for: "mother", emoji: "👩🏾", name: { he: "אמא", en: "Mom", ar: "أم", ru: "Мама" } },
  { id: "mom3", for: "mother", emoji: "🧕", name: { he: "אמא", en: "Mom", ar: "أم", ru: "Мама" } },
  { id: "mom4", for: "mother", emoji: "👱‍♀️", name: { he: "אמא", en: "Mom", ar: "أم", ru: "Мама" } },
];

const ALL_AVATARS: AvatarDef[] = [...KID_AVATARS, ...PARENT_AVATARS];
const AVATAR_IDS = new Set(ALL_AVATARS.map((a) => a.id));

/** The avatars offered for a member, by role: kids get the character set,
 *  parents get the dad/mom set matching their role. */
export function avatarsForRole(role: MemberRole): AvatarDef[] {
  if (role === "father") return PARENT_AVATARS.filter((a) => a.for === "father");
  if (role === "mother") return PARENT_AVATARS.filter((a) => a.for === "mother");
  return KID_AVATARS;
}

/** The image URL for a picked avatar id, or null if unset/unknown. */
export function avatarUrl(id?: string | null): string | null {
  return id && AVATAR_IDS.has(id) ? `/avatars/${id}.webp` : null;
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
const DEFAULT_MEMBER_NAMES: Record<string, Record<MemberRole, string>> = {
  en: { father: "Dad", mother: "Mom", boy: "My son", girl: "My daughter" },
  he: { father: "אבא", mother: "אמא", boy: "הבן שלי", girl: "הבת שלי" },
  ar: { father: "أبي", mother: "أمي", boy: "ابني", girl: "ابنتي" },
  ru: { father: "Папа", mother: "Мама", boy: "Мой сын", girl: "Моя дочь" },
  es: { father: "Papá", mother: "Mamá", boy: "Mi hijo", girl: "Mi hija" },
  pt: { father: "Pai", mother: "Mãe", boy: "Meu filho", girl: "Minha filha" },
  fr: { father: "Papa", mother: "Maman", boy: "Mon fils", girl: "Ma fille" },
  de: { father: "Papa", mother: "Mama", boy: "Mein Sohn", girl: "Meine Tochter" },
  cs: { father: "Táta", mother: "Máma", boy: "Můj syn", girl: "Moje dcera" },
  sk: { father: "Otec", mother: "Mama", boy: "Môj syn", girl: "Moja dcéra" },
  it: { father: "Papà", mother: "Mamma", boy: "Mio figlio", girl: "Mia figlia" },
  ja: { father: "パパ", mother: "ママ", boy: "息子", girl: "娘" },
  hi: { father: "पापा", mother: "मम्मी", boy: "मेरा बेटा", girl: "मेरी बेटी" },
  am: { father: "አባት", mother: "እናት", boy: "ወንድ ልጄ", girl: "ሴት ልጄ" },
  uk: { father: "Тато", mother: "Мама", boy: "Мій син", girl: "Моя донька" },
  tr: { father: "Baba", mother: "Anne", boy: "Oğlum", girl: "Kızım" },
  pl: { father: "Tata", mother: "Mama", boy: "Mój syn", girl: "Moja córka" },
  fa: { father: "بابا", mother: "مامان", boy: "پسرم", girl: "دخترم" },
  id: { father: "Ayah", mother: "Ibu", boy: "Anak laki-laki saya", girl: "Anak perempuan saya" },
  nl: { father: "Papa", mother: "Mama", boy: "Mijn zoon", girl: "Mijn dochter" },
  el: { father: "Μπαμπάς", mother: "Μαμά", boy: "Ο γιος μου", girl: "Η κόρη μου" },
  zu: { father: "Baba", mother: "Mama", boy: "Indodana yami", girl: "Indodakazi yami" },
  vi: { father: "Bố", mother: "Mẹ", boy: "Con trai tôi", girl: "Con gái tôi" },
  fil: { father: "Tatay", mother: "Nanay", boy: "Anak kong lalaki", girl: "Anak kong babae" },
  af: { father: "Pa", mother: "Ma", boy: "My seun", girl: "My dogter" },
  sw: { father: "Baba", mother: "Mama", boy: "Mwanangu wa kiume", girl: "Mwanangu wa kike" },
  "zh-CN": { father: "爸爸", mother: "妈妈", boy: "我的儿子", girl: "我的女儿" },
  "zh-TW": { father: "爸爸", mother: "媽媽", boy: "我的兒子", girl: "我的女兒" },
  ko: { father: "아빠", mother: "엄마", boy: "우리 아들", girl: "우리 딸" },
  th: { father: "พ่อ", mother: "แม่", boy: "ลูกชายของฉัน", girl: "ลูกสาวของฉัน" },
  bn: { father: "বাবা", mother: "মা", boy: "আমার ছেলে", girl: "আমার মেয়ে" },
  da: { father: "Far", mother: "Mor", boy: "Min søn", girl: "Min datter" },
  hu: { father: "Apa", mother: "Anya", boy: "A fiam", girl: "A lányom" },
};

export function defaultMemberName(role: MemberRole, lang: string): string {
  const t = DEFAULT_MEMBER_NAMES[lang] ?? DEFAULT_MEMBER_NAMES.en;
  return t[role];
}

/**
 * The 3-tier Schools USD pricing. Gadi raised the old flat $69 / $149 to a
 * proper by-student-count ladder ($97 / $297 / $497), yearly = 10x monthly
 * (two months free).
 *
 * 2026-08-26: split into THREE Stripe products (one per band) so the hosted
 * Stripe checkout shows the size band ("Gadit Schools: up to 100 students")
 * instead of one generic "Gadit Schools" line for every tier. The old single
 * product (prod_UmbRMt53Eitoes) and its 6 prices are retired — no live sub
 * used them (only canceled test subs), so no grandfathering was needed.
 *   S  prod_V8z3bN3VAPaG0M   M  prod_V8z3GxYryw2Z1O   L  prod_V8z3au6PWPmDwz
 *
 * Stripe price IDs are PUBLIC — they ship in the client bundle — so
 * hardcoding them here is safe and gives every surface (/pricing,
 * /checkout, /schools, the webhook, admin revenue) one source of truth
 * without needing six new Vercel env vars.
 *
 * The OLD prices are deliberately NOT listed here. They stay wired via
 * the STRIPE_PRICE_SCHOOLS_* env vars in the webhook / create-checkout,
 * so any grandfathered school (e.g. Greenworth on the old $69) keeps
 * provisioning correctly on renewal. New self-serve checkouts use the
 * tiers below.
 */

export type SchoolsTierKey = "s" | "m" | "l";

export interface SchoolsTier {
  key: SchoolsTierKey;
  monthly: string; // Stripe price id
  yearly: string; // Stripe price id
  maxStudents: number;
  usdMonthly: string;
  usdYearly: string;
  /** ≈ per-month figure shown on the yearly toggle (yearly / 12, rounded). */
  usdYearlyPerMonth: string;
}

export const SCHOOLS_TIERS: Record<SchoolsTierKey, SchoolsTier> = {
  s: {
    key: "s",
    monthly: "price_1U8h59RprLKxF6OiFSWeZlxH",
    yearly: "price_1U8h5ARprLKxF6Oi3Gl4M8PV",
    maxStudents: 100,
    usdMonthly: "$97",
    usdYearly: "$970",
    usdYearlyPerMonth: "$81",
  },
  m: {
    key: "m",
    monthly: "price_1U8h5BRprLKxF6OikfQgQRL0",
    yearly: "price_1U8h5BRprLKxF6OiGxI5xxJN",
    maxStudents: 500,
    usdMonthly: "$297",
    usdYearly: "$2,970",
    usdYearlyPerMonth: "$247",
  },
  l: {
    key: "l",
    monthly: "price_1U8h5CRprLKxF6OiuZDEwRgT",
    yearly: "price_1U8h5CRprLKxF6OirePwJ7j3",
    maxStudents: 1000,
    usdMonthly: "$497",
    usdYearly: "$4,970",
    usdYearlyPerMonth: "$414",
  },
};

export const SCHOOLS_TIER_LIST: SchoolsTier[] = [
  SCHOOLS_TIERS.s,
  SCHOOLS_TIERS.m,
  SCHOOLS_TIERS.l,
];

/** All 6 new Schools price IDs (monthly + yearly across the 3 tiers). */
export const NEW_SCHOOLS_PRICE_IDS: string[] = SCHOOLS_TIER_LIST.flatMap((t) => [
  t.monthly,
  t.yearly,
]);

/** The 3 yearly IDs, for billing-cycle detection in the webhook. */
export const NEW_SCHOOLS_YEARLY_IDS: string[] = SCHOOLS_TIER_LIST.map((t) => t.yearly);

export function isNewSchoolsPrice(priceId: string | null | undefined): boolean {
  return !!priceId && NEW_SCHOOLS_PRICE_IDS.includes(priceId);
}

/** "up to N students" for a tier header, one template instead of a per-tier
 *  ternary. Native in all 33 UI languages; English is only the safety net. */
export function studentsUpTo(n: number, lang: string): string {
  switch (lang) {
    case "he": return `עד ${n} תלמידים`;
    case "ar": return `حتى ${n} طالب`;
    case "ru": return `до ${n} учеников`;
    case "es": return `hasta ${n} alumnos`;
    case "pt": return `até ${n} alunos`;
    case "fr": return `jusqu'à ${n} élèves`;
    case "de": return `bis ${n} Schüler`;
    case "cs": return `až ${n} studentů`;
    case "sk": return `až ${n} študentov`;
    case "it": return `fino a ${n} studenti`;
    case "ja": return `最大${n}人の生徒`;
    case "hi": return `${n} छात्रों तक`;
    case "am": return `እስከ ${n} ተማሪዎች`;
    case "uk": return `до ${n} учнів`;
    case "tr": return `${n} öğrenciye kadar`;
    case "pl": return `do ${n} uczniów`;
    case "fa": return `تا ${n} دانش‌آموز`;
    case "id": return `hingga ${n} siswa`;
    case "nl": return `tot ${n} leerlingen`;
    case "el": return `έως ${n} μαθητές`;
    case "zu": return `kufika kubafundi abangu-${n}`;
    case "xh": return `ukuya kubafundi aba-${n}`;
    case "nso": return `go fihla go baithuti ba ${n}`;
    case "tn": return `go fitlha baithuti ba le ${n}`;
    case "st": return `ho fihlela baithuti ba ${n}`;
    case "ts": return `ku fika eka vadyondzi va ${n}`;
    case "ss": return `kufika ebafundzini labangu-${n}`;
    case "ve": return `u swika kha vhagudi vha ${n}`;
    case "nr": return `abafundi abafika ku-${n}`;
    case "vi": return `tối đa ${n} học sinh`;
    case "fil": return `hanggang ${n} estudyante`;
    case "af": return `tot ${n} leerders`;
    case "sw": return `hadi wanafunzi ${n}`;
    case "zh-CN": return `最多 ${n} 名学生`;
    case "zh-TW": return `最多 ${n} 名學生`;
    case "ko": return `학생 최대 ${n}명`;
    case "th": return `นักเรียนสูงสุด ${n} คน`;
    case "bn": return `সর্বোচ্চ ${n} জন শিক্ষার্থী`;
    case "da": return `op til ${n} elever`;
    case "hu": return `legfeljebb ${n} diák`;
    default: return `up to ${n} students`;
  }
}

/** Resolve the tier a new-schools price belongs to (or null). */
export function schoolsTierForPrice(priceId: string | null | undefined): SchoolsTier | null {
  if (!priceId) return null;
  return SCHOOLS_TIER_LIST.find((t) => t.monthly === priceId || t.yearly === priceId) ?? null;
}

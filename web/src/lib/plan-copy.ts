import MORE from "./plan-copy-i18n.json";

/**
 * Copy for the new plan structure (Gadi 2026-10-06): Free, Individual,
 * Family. Hebrew and English are written here; the other UI languages come
 * from plan-copy-i18n.json (scripts/plan-copy-i18n.mjs), English fallback.
 * {n} / {max} / {price} are filled by planCopy().
 */
export const PLAN_COPY = {
  en: {
    nbFreeCount: "{n} of {max} words in your free notebook",
    nbFreeFull: "Your free notebook is full ({max} words). With Individual, every word you look up is saved.",
    nbFreeCta: "See Individual",
  },
  he: {
    nbFreeCount: "{n} מתוך {max} מילים במחברת החינמית",
    nbFreeFull: "המחברת החינמית מלאה ({max} מילים). ב-Individual כל מילה שמחפשים נשמרת.",
    nbFreeCta: "להכיר את Individual",
  },
};

export type PlanCopyKey = keyof typeof PLAN_COPY.en;
const OTHER = MORE as Record<string, Partial<Record<PlanCopyKey, string>>>;

export function planCopy(lang: string, key: PlanCopyKey, vars: Record<string, string | number> = {}): string {
  const base =
    (lang === "he" ? PLAN_COPY.he[key] : lang === "en" ? PLAN_COPY.en[key] : OTHER[lang]?.[key]) ?? PLAN_COPY.en[key];
  return base.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** Free accounts keep up to this many words in the notebook. */
export const FREE_NOTEBOOK_MAX = 30;

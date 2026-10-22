/**
 * Code translations of the lifecycle emails (Gadi 2026-10-22): checkout
 * recovery, activation and the weekly parent report, one JSON per UI
 * language (Hebrew and English live in the content files themselves).
 * The editor store (email-templates-store.ts) uses them as the default for
 * a language: a saved Firestore translation wins, then these, then English.
 * Recovery copy follows Gadi's edited Hebrew (emailTemplates/rec-*.he).
 */
import L_ar from "./ar.json";
import L_ru from "./ru.json";
import L_es from "./es.json";
import L_pt from "./pt.json";
import L_fr from "./fr.json";
import L_de from "./de.json";
import L_cs from "./cs.json";
import L_sk from "./sk.json";
import L_it from "./it.json";
import L_ja from "./ja.json";
import L_hi from "./hi.json";
import L_am from "./am.json";
import L_uk from "./uk.json";
import L_tr from "./tr.json";
import L_pl from "./pl.json";
import L_fa from "./fa.json";
import L_id from "./id.json";
import L_nl from "./nl.json";
import L_el from "./el.json";
import L_zu from "./zu.json";
import L_vi from "./vi.json";
import L_fil from "./fil.json";
import L_af from "./af.json";
import L_sw from "./sw.json";
import L_zh_CN from "./zh-CN.json";
import L_zh_TW from "./zh-TW.json";
import L_ko from "./ko.json";
import L_th from "./th.json";
import L_bn from "./bn.json";
import L_da from "./da.json";
import L_hu from "./hu.json";
import L_xh from "./xh.json";
import L_nso from "./nso.json";
import L_tn from "./tn.json";
import L_st from "./st.json";
import L_ts from "./ts.json";
import L_ss from "./ss.json";
import L_ve from "./ve.json";
import L_nr from "./nr.json";

/** A plural form set (Intl.PluralRules categories); "other" is required. */
export type PluralForms = { other: string } & Partial<Record<"zero" | "one" | "two" | "few" | "many", string>>;

export type I18nMail = { subject: string; body: string; cta: string; next: string; signature?: string };

export type WeeklyStrings = {
  subjectActiveOne: string;
  subjectActiveMany: string;
  subjectQuietOne: string;
  subjectQuietMany: string;
  greeting: string;
  introActiveOne: string;
  introActiveMany: string;
  introQuietOne: string;
  introQuietMany: string;
  together: PluralForms;
  childFallback: string;
  newLabel: PluralForms;
  wordsLabel: string;
  more: PluralForms;
  total: PluralForms;
  streak: PluralForms;
  learned: PluralForms;
  langEn: string;
  langHe: string;
  idea: string;
  ideaGame: string;
  ideaFirst: string;
  ideaConnect: string;
  playCta: string;
  connectCta: string;
  outroActive: string;
  outroQuiet: string;
  cta: string;
  next: string;
};

/** The fixed email strings (footer, default closing / signature / guides
 *  link) for a language that has none in FAMILY_FIXED (the South African ones). */
export type I18nFixed = { unsub: string; tagline: string; closing: string; signature: string; helpText: string };

export type EmailI18n = {
  recovery: Record<string, I18nMail>;
  activation: Record<string, I18nMail>;
  weekly: WeeklyStrings;
  fixed?: I18nFixed;
};

export const EMAIL_I18N: Record<string, EmailI18n> = {
  "ar": L_ar as EmailI18n,
  "ru": L_ru as EmailI18n,
  "es": L_es as EmailI18n,
  "pt": L_pt as EmailI18n,
  "fr": L_fr as EmailI18n,
  "de": L_de as EmailI18n,
  "cs": L_cs as EmailI18n,
  "sk": L_sk as EmailI18n,
  "it": L_it as EmailI18n,
  "ja": L_ja as EmailI18n,
  "hi": L_hi as EmailI18n,
  "am": L_am as EmailI18n,
  "uk": L_uk as EmailI18n,
  "tr": L_tr as EmailI18n,
  "pl": L_pl as EmailI18n,
  "fa": L_fa as EmailI18n,
  "id": L_id as EmailI18n,
  "nl": L_nl as EmailI18n,
  "el": L_el as EmailI18n,
  "zu": L_zu as EmailI18n,
  "vi": L_vi as EmailI18n,
  "fil": L_fil as EmailI18n,
  "af": L_af as EmailI18n,
  "sw": L_sw as EmailI18n,
  "zh-CN": L_zh_CN as EmailI18n,
  "zh-TW": L_zh_TW as EmailI18n,
  "ko": L_ko as EmailI18n,
  "th": L_th as EmailI18n,
  "bn": L_bn as EmailI18n,
  "da": L_da as EmailI18n,
  "hu": L_hu as EmailI18n,
  "xh": L_xh as EmailI18n,
  "nso": L_nso as EmailI18n,
  "tn": L_tn as EmailI18n,
  "st": L_st as EmailI18n,
  "ts": L_ts as EmailI18n,
  "ss": L_ss as EmailI18n,
  "ve": L_ve as EmailI18n,
  "nr": L_nr as EmailI18n,
};

/** Pick the plural form of a count for a language, then fill {n}. */
export function plural(lang: string, forms: PluralForms, n: number, vars: Record<string, string> = {}): string {
  let cat: string = "other";
  try { cat = new Intl.PluralRules(lang).select(n); } catch { /* unknown locale: "other" */ }
  const s = (forms as Record<string, string | undefined>)[cat] ?? forms.other;
  return fill(s, { n: String(n), ...vars });
}

/** Replace {key} placeholders that have a value; others stay as they are. */
export function fill(s: string, vars: Record<string, string>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? vars[k] : m));
}

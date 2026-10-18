import type { ReactElement, ReactNode } from "react";
import type { Lang } from "@/lib/i18n";
import { PrivacyBodyEs, TermsBodyEs } from "./SpanishBodies";
import { PrivacyBodyPt, TermsBodyPt } from "./PortugueseBodies";
import { PrivacyBodyFr, TermsBodyFr } from "./FrenchBodies";
import { titlesAr, PrivacyBodyAr, TermsBodyAr } from "./ArabicBodies";
import { titlesFa, PrivacyBodyFa, TermsBodyFa } from "./PersianBodies";
import { titlesRu, PrivacyBodyRu, TermsBodyRu } from "./RussianBodies";
import { titlesUk, PrivacyBodyUk, TermsBodyUk } from "./UkrainianBodies";
import { titlesDe, PrivacyBodyDe, TermsBodyDe } from "./GermanBodies";
import { titlesNl, PrivacyBodyNl, TermsBodyNl } from "./DutchBodies";
import { titlesDa, PrivacyBodyDa, TermsBodyDa } from "./DanishBodies";
import { titlesCs, PrivacyBodyCs, TermsBodyCs } from "./CzechBodies";
import { titlesSk, PrivacyBodySk, TermsBodySk } from "./SlovakBodies";
import { titlesPl, PrivacyBodyPl, TermsBodyPl } from "./PolishBodies";
import { titlesHu, PrivacyBodyHu, TermsBodyHu } from "./HungarianBodies";
import { titlesIt, PrivacyBodyIt, TermsBodyIt } from "./ItalianBodies";
import { titlesEl, PrivacyBodyEl, TermsBodyEl } from "./GreekBodies";
import { titlesTr, PrivacyBodyTr, TermsBodyTr } from "./TurkishBodies";
import { titlesJa, PrivacyBodyJa, TermsBodyJa } from "./JapaneseBodies";
import { titlesKo, PrivacyBodyKo, TermsBodyKo } from "./KoreanBodies";
import { titlesZhCN, PrivacyBodyZhCN, TermsBodyZhCN } from "./ChineseSimplifiedBodies";
import { titlesZhTW, PrivacyBodyZhTW, TermsBodyZhTW } from "./ChineseTraditionalBodies";
import { titlesHi, PrivacyBodyHi, TermsBodyHi } from "./HindiBodies";
import { titlesBn, PrivacyBodyBn, TermsBodyBn } from "./BengaliBodies";
import { titlesTh, PrivacyBodyTh, TermsBodyTh } from "./ThaiBodies";
import { titlesAm, PrivacyBodyAm, TermsBodyAm } from "./AmharicBodies";
import { titlesSw, PrivacyBodySw, TermsBodySw } from "./SwahiliBodies";
import { titlesId, PrivacyBodyId, TermsBodyId } from "./IndonesianBodies";
import { titlesVi, PrivacyBodyVi, TermsBodyVi } from "./VietnameseBodies";
import { titlesFil, PrivacyBodyFil, TermsBodyFil } from "./FilipinoBodies";
import { titlesAf, PrivacyBodyAf, TermsBodyAf } from "./AfrikaansBodies";
import { titlesZu, PrivacyBodyZu, TermsBodyZu } from "./ZuluBodies";
import { titlesXh, PrivacyBodyXh, TermsBodyXh } from "./XhosaBodies";
import { titlesNso, PrivacyBodyNso, TermsBodyNso } from "./SepediBodies";
import { titlesTn, PrivacyBodyTn, TermsBodyTn } from "./TswanaBodies";
import { titlesSt, PrivacyBodySt, TermsBodySt } from "./SesothoBodies";
import { titlesTs, PrivacyBodyTs, TermsBodyTs } from "./TsongaBodies";
import { titlesSs, PrivacyBodySs, TermsBodySs } from "./SwatiBodies";
import { titlesVe, PrivacyBodyVe, TermsBodyVe } from "./VendaBodies";
import { titlesNr, PrivacyBodyNr, TermsBodyNr } from "./NdebeleBodies";

/**
 * Every translated Privacy Policy and Terms of Use body, keyed by UI language.
 * English and Hebrew live in the page files themselves. The type requires an
 * entry for every other UI language, so adding a language without its legal
 * translation fails the type check. The English text stays the binding
 * version; LegalPage shows that notice under every translation.
 */
type LegalDoc = { privacy: { title: string; Body: () => ReactElement }; terms: { title: string; Body: () => ReactElement } };

const LEGAL: Record<Exclude<Lang, "en" | "he">, LegalDoc> = {
  ar: { privacy: { title: titlesAr.privacy, Body: PrivacyBodyAr }, terms: { title: titlesAr.terms, Body: TermsBodyAr } },
  ru: { privacy: { title: titlesRu.privacy, Body: PrivacyBodyRu }, terms: { title: titlesRu.terms, Body: TermsBodyRu } },
  es: { privacy: { title: "Política de privacidad", Body: PrivacyBodyEs }, terms: { title: "Términos de uso", Body: TermsBodyEs } },
  pt: { privacy: { title: "Política de privacidade", Body: PrivacyBodyPt }, terms: { title: "Termos de uso", Body: TermsBodyPt } },
  fr: { privacy: { title: "Politique de confidentialité", Body: PrivacyBodyFr }, terms: { title: "Conditions d’utilisation", Body: TermsBodyFr } },
  de: { privacy: { title: titlesDe.privacy, Body: PrivacyBodyDe }, terms: { title: titlesDe.terms, Body: TermsBodyDe } },
  cs: { privacy: { title: titlesCs.privacy, Body: PrivacyBodyCs }, terms: { title: titlesCs.terms, Body: TermsBodyCs } },
  sk: { privacy: { title: titlesSk.privacy, Body: PrivacyBodySk }, terms: { title: titlesSk.terms, Body: TermsBodySk } },
  it: { privacy: { title: titlesIt.privacy, Body: PrivacyBodyIt }, terms: { title: titlesIt.terms, Body: TermsBodyIt } },
  ja: { privacy: { title: titlesJa.privacy, Body: PrivacyBodyJa }, terms: { title: titlesJa.terms, Body: TermsBodyJa } },
  hi: { privacy: { title: titlesHi.privacy, Body: PrivacyBodyHi }, terms: { title: titlesHi.terms, Body: TermsBodyHi } },
  am: { privacy: { title: titlesAm.privacy, Body: PrivacyBodyAm }, terms: { title: titlesAm.terms, Body: TermsBodyAm } },
  uk: { privacy: { title: titlesUk.privacy, Body: PrivacyBodyUk }, terms: { title: titlesUk.terms, Body: TermsBodyUk } },
  tr: { privacy: { title: titlesTr.privacy, Body: PrivacyBodyTr }, terms: { title: titlesTr.terms, Body: TermsBodyTr } },
  pl: { privacy: { title: titlesPl.privacy, Body: PrivacyBodyPl }, terms: { title: titlesPl.terms, Body: TermsBodyPl } },
  fa: { privacy: { title: titlesFa.privacy, Body: PrivacyBodyFa }, terms: { title: titlesFa.terms, Body: TermsBodyFa } },
  id: { privacy: { title: titlesId.privacy, Body: PrivacyBodyId }, terms: { title: titlesId.terms, Body: TermsBodyId } },
  nl: { privacy: { title: titlesNl.privacy, Body: PrivacyBodyNl }, terms: { title: titlesNl.terms, Body: TermsBodyNl } },
  el: { privacy: { title: titlesEl.privacy, Body: PrivacyBodyEl }, terms: { title: titlesEl.terms, Body: TermsBodyEl } },
  zu: { privacy: { title: titlesZu.privacy, Body: PrivacyBodyZu }, terms: { title: titlesZu.terms, Body: TermsBodyZu } },
  xh: { privacy: { title: titlesXh.privacy, Body: PrivacyBodyXh }, terms: { title: titlesXh.terms, Body: TermsBodyXh } },
  nso: { privacy: { title: titlesNso.privacy, Body: PrivacyBodyNso }, terms: { title: titlesNso.terms, Body: TermsBodyNso } },
  tn: { privacy: { title: titlesTn.privacy, Body: PrivacyBodyTn }, terms: { title: titlesTn.terms, Body: TermsBodyTn } },
  st: { privacy: { title: titlesSt.privacy, Body: PrivacyBodySt }, terms: { title: titlesSt.terms, Body: TermsBodySt } },
  ts: { privacy: { title: titlesTs.privacy, Body: PrivacyBodyTs }, terms: { title: titlesTs.terms, Body: TermsBodyTs } },
  ss: { privacy: { title: titlesSs.privacy, Body: PrivacyBodySs }, terms: { title: titlesSs.terms, Body: TermsBodySs } },
  ve: { privacy: { title: titlesVe.privacy, Body: PrivacyBodyVe }, terms: { title: titlesVe.terms, Body: TermsBodyVe } },
  nr: { privacy: { title: titlesNr.privacy, Body: PrivacyBodyNr }, terms: { title: titlesNr.terms, Body: TermsBodyNr } },
  vi: { privacy: { title: titlesVi.privacy, Body: PrivacyBodyVi }, terms: { title: titlesVi.terms, Body: TermsBodyVi } },
  fil: { privacy: { title: titlesFil.privacy, Body: PrivacyBodyFil }, terms: { title: titlesFil.terms, Body: TermsBodyFil } },
  af: { privacy: { title: titlesAf.privacy, Body: PrivacyBodyAf }, terms: { title: titlesAf.terms, Body: TermsBodyAf } },
  sw: { privacy: { title: titlesSw.privacy, Body: PrivacyBodySw }, terms: { title: titlesSw.terms, Body: TermsBodySw } },
  "zh-CN": { privacy: { title: titlesZhCN.privacy, Body: PrivacyBodyZhCN }, terms: { title: titlesZhCN.terms, Body: TermsBodyZhCN } },
  "zh-TW": { privacy: { title: titlesZhTW.privacy, Body: PrivacyBodyZhTW }, terms: { title: titlesZhTW.terms, Body: TermsBodyZhTW } },
  ko: { privacy: { title: titlesKo.privacy, Body: PrivacyBodyKo }, terms: { title: titlesKo.terms, Body: TermsBodyKo } },
  th: { privacy: { title: titlesTh.privacy, Body: PrivacyBodyTh }, terms: { title: titlesTh.terms, Body: TermsBodyTh } },
  bn: { privacy: { title: titlesBn.privacy, Body: PrivacyBodyBn }, terms: { title: titlesBn.terms, Body: TermsBodyBn } },
  da: { privacy: { title: titlesDa.privacy, Body: PrivacyBodyDa }, terms: { title: titlesDa.terms, Body: TermsBodyDa } },
  hu: { privacy: { title: titlesHu.privacy, Body: PrivacyBodyHu }, terms: { title: titlesHu.terms, Body: TermsBodyHu } },
};

/** The translated locales of one document, ready for LegalPage's `locales` prop. */
export function translatedLegalLocales(
  doc: "privacy" | "terms",
): Partial<Record<Lang, { title: string; body: ReactNode }>> {
  const out: Partial<Record<Lang, { title: string; body: ReactNode }>> = {};
  for (const [code, entry] of Object.entries(LEGAL) as [Lang, LegalDoc][]) {
    const { title, Body } = entry[doc];
    out[code] = { title, body: <Body /> };
  }
  return out;
}

/** For checks: the language codes that have a translated body. */
export const TRANSLATED_LEGAL_LANGS = Object.keys(LEGAL) as Lang[];

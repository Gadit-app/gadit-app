import I18N from "./ui-i18n.json";
import { FAMILY_SWITCH_EN, FAMILY_SWITCH_HE, type FamilySwitchUi } from "./ui-base";

/** The Family switch words in the interface language (English when missing). */
export function familySwitchUi(lang: string): FamilySwitchUi {
  if (lang === "he") return FAMILY_SWITCH_HE;
  const t = (I18N as Record<string, Partial<FamilySwitchUi>>)[lang];
  return t ? { ...FAMILY_SWITCH_EN, ...t } : FAMILY_SWITCH_EN;
}

/**
 * The words of the help window in every language (Gadi 2026-11-15). Hebrew and
 * English are in ui-base.ts; the others in ui-i18n.json, made by
 * scripts/help-chat-ui-i18n.ts. They reach the browser with the
 * GET /api/help-chat answer, so a page carries only its own language.
 */
import MORE from "./ui-i18n.json";
import { HELP_UI_EN, HELP_UI_HE, type HelpUi } from "./ui-base";

export { HELP_UI_EN, HELP_UI_HE, type HelpUi };

const more = MORE as unknown as Record<string, HelpUi>;

export function helpUi(lang: string): HelpUi {
  if (lang === "he") return HELP_UI_HE;
  if (lang === "en") return HELP_UI_EN;
  return more[lang] ?? HELP_UI_EN;
}

"use client";

/**
 * GrammarModeToggle — iOS-style switch that turns on POS labels
 * (noun / verb / adjective …) next to each meaning. Same visual
 * grammar as KidsModeToggle so the two read as a pair when they
 * sit side-by-side on the homepage / word page.
 *
 * Not paywalled. The POS data is already in the cached /api/define
 * response; this toggle only flips its display.
 *
 * Christopher (2026-06-19 WhatsApp) asked for POS info; Gadi kept
 * the default clean and exposed the data behind this opt-in switch.
 */

import { useLang } from "@/lib/lang-context";
import { useGrammarMode } from "@/lib/use-grammar-mode";

const LABEL: Record<string, string> = {
  he: "מצב דקדוק",
  en: "Grammar",
  ar: "وضع النحو",
  ru: "Грамматика",
  es: "Gramática",
  pt: "Gramática",
  fr: "Grammaire",
  de: "Grammatik",
  cs: "Gramatika",
  sk: "Gramatika",
  it: "Grammatica",
  ja: "文法モード",
  hi: "व्याकरण",
};

const TOOLTIP_ON: Record<string, string> = {
  he: "כיבוי תוויות הדקדוק",
  en: "Hide grammar labels",
  ar: "إخفاء تسميات النحو",
  ru: "Скрыть грамматику",
  es: "Ocultar etiquetas de gramática",
  pt: "Ocultar etiquetas de gramática",
  fr: "Masquer les étiquettes de grammaire",
  de: "Grammatik-Tags ausblenden",
  cs: "Skrýt gramatické značky",
  sk: "Skryť gramatické značky",
  it: "Nascondi etichette grammaticali",
  ja: "文法ラベルを非表示",
  hi: "व्याकरण लेबल छिपाएँ",
};

const TOOLTIP_OFF: Record<string, string> = {
  he: "הצגת תוויות דקדוק (שם עצם / פועל / תואר)",
  en: "Show grammar labels (noun / verb / adjective)",
  ar: "إظهار تسميات النحو (اسم / فعل / صفة)",
  ru: "Показать грамматику (сущ. / глагол / прил.)",
  es: "Mostrar etiquetas de gramática (sustantivo / verbo / adjetivo)",
  pt: "Mostrar etiquetas de gramática (substantivo / verbo / adjetivo)",
  fr: "Afficher les étiquettes de grammaire (nom / verbe / adjectif)",
  de: "Grammatik-Tags anzeigen (Substantiv / Verb / Adjektiv)",
  cs: "Zobrazit gramatické značky (podst. jm. / sloveso / příd. jm.)",
  sk: "Zobraziť gramatické značky (podst. m. / sloveso / príd. m.)",
  it: "Mostra etichette grammaticali (sostantivo / verbo / aggettivo)",
  ja: "文法ラベルを表示（名詞 / 動詞 / 形容詞）",
  hi: "व्याकरण लेबल दिखाएँ (संज्ञा / क्रिया / विशेषण)",
};

export function GrammarModeToggle() {
  const { lang } = useLang();
  const [on, setOn] = useGrammarMode();

  const tooltip = on
    ? (TOOLTIP_ON[lang] ?? TOOLTIP_ON.en)
    : (TOOLTIP_OFF[lang] ?? TOOLTIP_OFF.en);

  return (
    <button
      type="button"
      onClick={() => setOn(!on)}
      title={tooltip}
      aria-label={tooltip}
      aria-pressed={on}
      role="switch"
      className={`wb-grammar-toggle${on ? " is-on" : ""}`}
    >
      <span className="wb-grammar-toggle-label">
        {LABEL[lang] ?? LABEL.en}
      </span>
      <span className="wb-grammar-toggle-track" aria-hidden="true">
        <span className="wb-grammar-toggle-thumb" />
      </span>
    </button>
  );
}

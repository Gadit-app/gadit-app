"use client";

/**
 * Word Result page — "Wordbook" redesign (locked April 2026).
 *
 * Source of truth: web/public/gadit-final.html
 *
 * Composition (top → bottom on cream paper):
 *   <ProgressSignal />    "Saved · 2 days ago" chip — only when isSaved
 *   <WordHeader />        meta line + word title + share
 *   <MeaningsBlock />     Meanings — NO card, sit directly on paper; each
 *                         meaning carries its own tab row (image, kids,
 *                         quiz, word games)
 *   <IdiomsSection />     idioms from every meaning
 *   <OriginCard />        rust card: Language + Originally meant + optional story
 *   <GadItButton />       "Gad it!" at the end of the page
 *   <WordQuestions />     ask-about-this-word chips
 *
 * Saving to the notebook and offline are automatic (WordClient), so the
 * page has no save or pin buttons.
 *
 * Defensive against missing API fields:
 *   - pos / ipa aren't currently returned by /api/define; WordHeader accepts
 *     them as props but does NOT render them (per redesign — no IPA, pos
 *     only shown in the meta line if present).
 *   - Etymology can arrive as a string (legacy) or a structured object.
 *     OriginCard handles both shapes.
 *   - kidsExplanation lives per-meaning in the schema: the meaning's "kids"
 *     tab, or the main text in Kids Mode.
 */

import { WaitText, WaitDots } from "@/components/WaitText";
import { MeaningPractice } from "./MeaningPractice";
import { meaningPracticeCopy } from "@/lib/meaning-practice-i18n";
import { gadCopy, GAD_TAP_HINT } from "@/lib/gadit-button-copy";
import { nativeShareFallback } from "@/lib/native-app";
import { useState, useEffect, useMemo } from "react";
import { miscUi } from "@/lib/misc-ui-i18n";
import { planCopy, FREE_NOTEBOOK_MAX } from "@/lib/plan-copy";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useAuth } from "@/lib/auth-context";
import { v2 } from "@/lib/i18n-v2";
import { useHref, wordPath } from "@/lib/href";
import WordQuestions from "@/components/design/WordQuestions";
import type { Lang } from "@/lib/i18n";
import { LANGUAGES, langNameIn } from "@/lib/i18n";
import { isEtymologyFieldGarbled } from "@/lib/define-guard";
import { TTSButton } from "@/components/design/TTSButton";
import { TappableText } from "@/components/design/TappableText";
import { ImageLightbox } from "@/components/design/ImageLightbox";
import { useKidsMode } from "@/lib/use-kids-mode";
import { formatPos } from "@/lib/format-pos";

// ─── Types matching the live /api/define schema ────────────────
export type Plan = "basic" | "clear" | "deep";

export interface KidsExplanation {
  intro?: string;
  explanation: string;
  examples: string[];
}

export interface Idiom {
  phrase: string;
  meaning: string;
  /** The same idiom meaning retold for a child (simpler words), shown in Kids
   *  Mode in place of `meaning`. Absent on older cached results. */
  kidsMeaning?: string;
}

export interface Meaning {
  meaning: string;
  examples: string[];
  pos?: string;
  /** A single clean everyday antonym for THIS sense, in the meaning's own
   *  language, or null/absent when the sense has no clear one-word opposite.
   *  Rendered as a tappable chip that links to that word's own page. */
  opposite?: string | null;
  kidsExplanation?: KidsExplanation;
  idioms?: Idiom[];
}

export interface Etymology {
  sourceLanguage: string;
  originalWord: string;
  breakdown: string;
  originalMeaning: string;
  historyNote?: string;
  /** Kids Mode: the origin story retold for a child, shown in place of the
   *  technical fields above when Kids Mode is on. */
  kidsExplanation?: string;
}

export interface WordResult {
  word: string;
  language: string;
  /** The headword's equivalent in the UI language — only populated for
   *  cross-language lookups (e.g. a German user searching "חלום" gets
   *  "Traum"). Empty/absent when the word is already in the UI language. */
  translation?: string;
  meanings: Meaning[];
  etymology: Etymology | string;
  generalIdioms?: Idiom[];
  ipa?: string;
  /** Set by the define API's "did you mean" path (RULE 1b) when the typed
   *  string is not a real word but a nearby real word likely was intended.
   *  Rendered as a clickable chip that searches the suggested word. */
  suggestedWord?: string;
  /** When the searched word was a misspelling the model auto-corrected: the
   *  original (wrong) spelling as typed. `word` holds the correct spelling. */
  correctedFrom?: string | null;
}

// Actions the page hands to WordClient through onAction: the quiz tab
// ("practice"), the word games tab ("compare") and a locked Gad it! button.
export type ActionId = "practice" | "compare" | "gadit";

// ─── Helpers ───────────────────────────────────────────────────
const LANG_NAMES: Record<string, string[]> = {
  en: ["english"],
  he: ["hebrew", "עברית"],
  ar: ["arabic", "العربية"],
  ru: ["russian", "русский"],
  es: ["spanish", "español"],
  pt: ["portuguese", "português"],
  fr: ["french", "français"],
  de: ["german", "deutsch"],
  cs: ["czech", "čeština", "cestina"],
  sk: ["slovak", "slovenčina", "slovencina"],
  it: ["italian", "italiano"],
  ja: ["japanese", "日本語"],
  hi: ["hindi", "हिन्दी", "हिंदी"],
  am: ["amharic", "አማርኛ"],
  uk: ["ukrainian", "українська"],
  tr: ["turkish", "türkçe"],
  pl: ["polish", "polski"],
  fa: ["persian", "farsi", "فارسی"],
  id: ["indonesian", "bahasa indonesia"],
  nl: ["dutch", "nederlands"],
  el: ["greek", "ελληνικά"],
  zu: ["zulu", "isizulu"],
  xh: ["xhosa", "isixhosa"],
  nso: ["sepedi", "sesotho sa leboa", "northern sotho"],
  tn: ["tswana", "setswana"],
  st: ["sesotho", "southern sotho", "sotho"],
  ts: ["xitsonga"],
  ss: ["swati", "siswati"],
  ve: ["venda", "tshivenḓa"],
  nr: ["ndebele", "south ndebele", "isindebele"],
  vi: ["vietnamese", "tiếng việt"],
  fil: ["filipino", "tagalog"],
  af: ["afrikaans"],
  sw: ["swahili", "kiswahili"],
  "zh-TW": ["traditional chinese", "chinese (traditional)", "繁體中文", "繁體", "繁体"],
  "zh-CN": ["chinese", "简体中文", "中文"],
  ko: ["korean", "한국어"],
  th: ["thai", "ไทย"],
  bn: ["bengali", "bangla", "বাংলা"],
  da: ["danish", "dansk"],
  hu: ["hungarian", "magyar"],
};

const SPELLING_FIX_COPY: Record<string, string> = {
  en: "Spelling fix:", he: "תיקון כתיב:", ar: "تصحيح الإملاء:", ru: "Исправление написания:",
  es: "Corrección ortográfica:", pt: "Correção ortográfica:", fr: "Correction orthographique :",
  de: "Rechtschreibkorrektur:", cs: "Oprava pravopisu:", sk: "Oprava pravopisu:",
  it: "Correzione ortografica:", ja: "スペルの修正:", hi: "वर्तनी सुधार:", am: "የፊደል እርማት:",
  uk: "Виправлення написання:", tr: "Yazım düzeltmesi:", pl: "Poprawka pisowni:", fa: "اصلاح املا:",
  id: "Perbaikan ejaan:", nl: "Spelling verbeterd:", el: "Διόρθωση ορθογραφίας:",
  zu: "Ukulungiswa kopelo:", xh: "Ukulungiswa kopelo:", nso: "Phošollo ya mopeleto:", tn: "Mopeleto o o baakantsweng:", st: "Tokiso ya mopeleto:", ts: "Ku lulamisa mapeletelo:", ss: "Kulungiswa kwekupela:", ve: "Mupeleto wo lugiswa:", nr: "Ukulungiswa kokupela:", vi: "Sửa chính tả:", fil: "Pagwawasto sa baybay:",
  af: "Spelregstelling:", sw: "Marekebisho ya tahajia:", "zh-CN": "拼写更正：", "zh-TW": "拼字更正：",
  ko: "맞춤법 수정:", th: "แก้คำสะกด:", bn: "বানান সংশোধন:", da: "Stavning rettet:",
  hu: "Helyesírási javítás:",
};

function langMatchesUi(language: string, lang: Lang): boolean {
  const langName = (language || "").toLowerCase().trim();
  if (!langName) return true;
  return (LANG_NAMES[lang] ?? []).some((n) => langName.includes(n));
}

// Reverse: take the language label /api/define returns ("English",
// "German", "Čeština", "العربية") and return our 2-letter Lang code.
// Used to pick the right TTS voice locale for the speaker button.
/** The word's language named in the viewer's own language (Gadi 2026-10-06:
 *  a Russian student saw "Hebrew"). Falls back to the model's label when the
 *  language is not one of ours. */
export function wordLangLabel(language: string, lang: Lang): string {
  const langName = (language || "").toLowerCase().trim();
  for (const [code, names] of Object.entries(LANG_NAMES)) {
    if (names.some((n) => langName.includes(n))) return langNameIn(code, lang);
  }
  return language;
}

function detectWordLang(language: string): string {
  const langName = (language || "").toLowerCase().trim();
  for (const [code, names] of Object.entries(LANG_NAMES)) {
    if (names.some((n) => langName.includes(n))) return code;
  }
  return "en";
}

// ─── CrispTech icons — 1.5px line family, currentColor only ─────
// Single visual family. BookIcon and ScrollIcon sit in the Meanings and
// Word Origin eyebrows (globals.css decides whether they show).

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5.5C3 4.7 3.7 4 4.5 4H11v15H4.5C3.7 19 3 18.3 3 17.5V5.5Z" />
      <path d="M21 5.5C21 4.7 20.3 4 19.5 4H13v15h6.5C20.3 19 21 18.3 21 17.5V5.5Z" />
      <path d="M6 8h2.5M6 11h2.5M15.5 8H18M15.5 11H18" />
    </svg>
  );
}
function ScrollIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 5h11a2.5 2.5 0 0 1 2.5 2.5V18a2 2 0 0 1-2 2H7" />
      <path d="M5 5a2 2 0 0 0-2 2v2h2" />
      <path d="M7 20a2 2 0 0 1-2-2V9" />
      <path d="M9 9h6M9 12h6M9 15h4" />
    </svg>
  );
}

// Crosshair — used in the image tab's empty state
function CrosshairIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
    </svg>
  );
}

// Lock — shown on a tab the plan does not open
function LockIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
function CheckIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function ShareIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}

// ─── ProgressSignal ────────────────────────────────────────────
export function ProgressSignal({ savedAgo }: { savedAgo: string }) {
  const { lang } = useLang();
  return (
    <div className="wb-progress-wrap">
      <div className="wb-progress">
        <CheckIcon />
        {v2(lang, "savedAgoTemplate", savedAgo)}
      </div>
    </div>
  );
}

// ─── WordHeader ────────────────────────────────────────────────
export function WordHeader({
  word,
  language,
  translation,
  pos,
  onShare,
  // ipa accepted for API stability — not rendered in this design.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipa: _ipa,
  showNiqqud = false,
  niqqudOn = false,
  onToggleNiqqud,
}: {
  word: string;
  language: string;
  translation?: string;
  pos?: string;
  ipa?: string;
  onShare?: () => void;
  /** Niqqud toggle, shown next to the word's speaker (Hebrew word + signed-in
   *  only). Vowel points for young readers. Gadi 2026-08-22. */
  showNiqqud?: boolean;
  niqqudOn?: boolean;
  onToggleNiqqud?: () => void;
}) {
  const { lang } = useLang();
  // The vowel-points toggle labels itself for the WORD's script: Arabic word
  // shows تشكيل (tashkeel), otherwise Hebrew ניקוד / Latin Niqqud.
  const isArabicHeadword = /[؀-ۿ]/.test(word);
  const showLang = !langMatchesUi(language, lang);
  // Cross-language anchor: when the word is in another language, show its
  // equivalent in the UI language right under the headword (חלום → Traum),
  // so a reader browsing in German who looked up a Hebrew word gets the one
  // German word for it — the piece that was missing before. Guarded so a
  // garbled value is never shown, and only when the word IS foreign.
  // Not gated on showLang: the model fills `translation` ONLY when the word
  // is in a different language than the UI, so its presence alone is the
  // reliable cross-language signal. showLang depends on the model's
  // `language` field, which Kids Mode sometimes mis-stamps as the UI
  // language (an English "dream" tagged "Hebrew"), and that used to hide
  // the gloss even though the equivalent word was right there.
  const cleanTranslation =
    typeof translation === "string" && translation.trim() &&
    !isEtymologyFieldGarbled("originalMeaning", translation.trim())
      ? translation.trim()
      : "";
  // word-meta: "pos · language" — both italicized in Latin, plain in HE/AR.
  // Hide entire row if neither is shown.
  const showMeta = !!pos || showLang;
  // BCP-47 lang tag for TTS — driven by the WORD's language, not the
  // UI. An English word should be pronounced in English even when
  // the user is browsing in Hebrew.
  const audioLang = detectWordLang(language);
  return (
    <div className="wb-word-head">
      <div className="wb-word-head-main">
        {showMeta && (
          <div className="wb-word-meta">
            {pos && <em>{pos}</em>}
            {pos && showLang && <span className="wb-meta-dot" />}
            {showLang && <span>{wordLangLabel(language, lang)}</span>}
          </div>
        )}
        <div className="wb-word-title-row">
          <h1 className="wb-word-title">{word}</h1>
          <TTSButton
            text={word}
            audioLang={audioLang}
            ariaLabel={v2(lang, "listenToWord")}
            className="wb-word-listen-btn"
          />
          {showNiqqud && onToggleNiqqud && (
            <button
              type="button"
              className="wb-niqqud-btn"
              onClick={onToggleNiqqud}
              aria-pressed={niqqudOn}
              title={isArabicHeadword ? "التشكيل لمن يقرأ بمساعدة" : miscUi(lang).niqqudTitle}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 13px",
                borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700,
                border: niqqudOn ? "1.5px solid #0EA5A5" : "1px solid var(--rule, #E4EAE8)",
                background: niqqudOn ? "color-mix(in srgb, #0EA5A5 12%, transparent)" : "var(--surface, #fff)",
                color: niqqudOn ? "#0B8A8A" : "var(--ink-soft, #3F4856)",
              }}
            >
              {niqqudOn && <span aria-hidden="true" style={{ fontSize: 15 }}>✓</span>}
              {isArabicHeadword ? "تشكيل" : miscUi(lang).niqqud}
            </button>
          )}
        </div>
        {cleanTranslation && (
          <div className="wb-word-translation">
            <span className="wb-word-translation-lang">
              {LANGUAGES.find((l) => l.code === lang)?.label ?? lang}
            </span>
            <span className="wb-word-translation-value"><TappableText text={cleanTranslation} /></span>
          </div>
        )}
      </div>
      {onShare && (
        <div className="wb-word-actions">
          <button
            type="button"
            className="wb-word-act-icon"
            aria-label={v2(lang, "shareLabel")}
            onClick={onShare}
          >
            <ShareIcon size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Per-meaning TabRow + inline content panel ─────────────────
// New architecture (post-launch direction): each meaning carries its
// own set of features as tabs underneath it. Click a tab → expand
// inline content below for image/kids; fire modal/route for the
// interactive flows (compose, compare, quiz).

/** A feature the upgrade prompt can name ("compose" comes from MeaningPractice). */
type TabId = "image" | "kids" | "compose" | "compare" | "quiz";
/** The tabs the per-meaning row renders. */
type RowTabId = Exclude<TabId, "compose">;

interface MeaningEntryProps {
  n: number;
  meaning: Meaning;
  plan: Plan;
  /** When true (set from /word page when the visitor came from
   *  /c/<CODE> during the school's active hours), unlock the
   *  classroom-mode subset of features even though the visitor isn't
   *  signed in to a paid account. See tabUnlocked() for the exact
   *  per-tab rules. */
  classroomInSession?: boolean;
  word: string;
  imageUrl?: string;
  imageGenerating?: boolean;
  onGenerate?: () => void;
  onUpgrade?: (tab?: TabId, tier?: "clear" | "deep") => void;
  onAction?: (id: ActionId) => void;
  /** Fires when the user taps the small flag icon next to the share /
      listen controls on a meaning card. The section id (e.g.
      "meaning-1") is passed through so the parent can pre-fill the
      report modal with the correct category. */
  onReport?: (section: string) => void;
  /** Kids Mode only: a picture generated for THIS specific meaning,
   *  shown inline under the definition with no tab/click. Empty in the
   *  adult UI, which keeps its per-meaning image tab unchanged. */
  kidsImageUrl?: string;
  /** Kids Mode only: the picture for this meaning is still being
   *  generated. Drives a skeleton placeholder so it never looks like
   *  nothing is happening (which used to make a parent tap the manual
   *  image action and get a second, duplicate picture). */
  kidsImageLoading?: boolean;
  /** True while the SSE stream is still filling this result. In Kids Mode we
   *  use it to withhold the ADULT definition text until the kids version has
   *  streamed in, so a child never sees the grown-up text typed out and then
   *  swapped (Gadi/Romi 2026-09-15). */
  streaming?: boolean;
}

function tierForTab(tab: TabId): "basic" | "clear" | "deep" {
  // Image, kids, compose are Clear+ features.
  // Compare (word games) and quiz are Deep features.
  // Nothing is Basic-only (Basic users see definitions + idioms only).
  if (tab === "compare" || tab === "quiz") return "deep";
  return "clear";
}
function tabUnlocked(tab: TabId, plan: Plan, classroomInSession = false): boolean {
  const need = tierForTab(tab);
  // Classroom-in-session override: a kid on /c/<CODE> during the
  // school's active hours gets the same subset of features that any
  // Clear customer gets, PLUS the games tab specifically (so the
  // school gets at least one game in class — Letter Scramble inside
  // the Word Games modal). We deliberately do NOT unlock compose,
  // which needs a real per-user account to be meaningful. Gadi
  // 2026-06-29 product decision.
  if (classroomInSession) {
    if (tab === "image" || tab === "kids") return true;
    if (tab === "compare") return true; // "compare" maps to word games
    if (tab === "compose") return false;
    if (tab === "quiz") return false; // personalised quizzes need account
  }
  if (need === "clear") return plan === "clear" || plan === "deep";
  if (need === "deep") return plan === "deep";
  return true;
}

// Compact icon variants for the tab row — explicit 16×16 with no
// inner detail clutter. Stroke uses currentColor so the active-tab
// state can flip them white via CSS.
function TabIcon({ name }: { name: RowTabId }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "image":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <circle cx="8" cy="10" r="1.4" />
          <path d="M3 16.5l4-3.5 4 3 4-4 6 4" />
        </svg>
      );
    case "kids":
      // Child silhouette — three strokes only, because the icon renders
      // at 16px and any face details (eyes, smile) collapse into noise
      // at that size. The 'child' read comes from two proportions: a
      // large head relative to the body, and a single hair tuft on top.
      // Avoids gender-coded markers (no pigtails / bows).
      return (
        <svg {...common}>
          {/* Larger head than the adult silhouette — child proportion */}
          <circle cx="12" cy="9" r="3.8" />
          {/* Single curved hair tuft on top — universal 'kid' cue */}
          <path d="M11.5 5.5 c0.4 -1.4 1.4 -1.4 1.8 0" />
          {/* Compact rounded body */}
          <path d="M6.5 21 v-3 a5.5 5.5 0 0 1 11 0 v3" />
        </svg>
      );
    case "compare":
      // Repurposed as Word Games — 3×3 puzzle grid icon
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
      );
    case "quiz":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5a2.5 2.5 0 1 1 4 2c-1 .8-1.5 1.4-1.5 2.5" />
          <circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

// 'compare' tab repurposed as 'games' — the compare-words angle had
// limited surface (most words don't have meaningful comparisons),
// so the slot is now a word-games panel. The TabId stays 'compare'
// for now to avoid a wide rename across the result/i18n/unlock
// tables; only the visible label and the panel body change.
const TAB_LABELS: Record<string, Record<RowTabId, string>> = {
  he: { image: "תמונה",       kids: "הסבר לילדים",      quiz: "חידון",        compare: "משחקי מילים" },
  en: { image: "Image",   kids: "Kids' explanation", quiz: "Quiz",         compare: "Word games" },
  ar: { image: "صورة",        kids: "شرح للأطفال",       quiz: "اختبار",       compare: "ألعاب كلمات" },
  ru: { image: "Картинка",     kids: "Для детей",         quiz: "Викторина",    compare: "Игры со словами" },
  es: { image: "Imagen",       kids: "Explicación niños", quiz: "Quiz",         compare: "Juegos de palabras" },
  pt: { image: "Imagem",       kids: "Para crianças",     quiz: "Quiz",         compare: "Jogos com palavras" },
  fr: { image: "Image",        kids: "Pour enfants",      quiz: "Quiz",         compare: "Jeux de mots" },
  de: { image: "Bild",          kids: "Für Kinder",        quiz: "Quiz",         compare: "Wortspiele" },
  cs: { image: "Obrázek",       kids: "Pro děti",          quiz: "Kvíz",         compare: "Slovní hry" },
  sk: { image: "Obrázok",       kids: "Pre deti",          quiz: "Kvíz",         compare: "Slovné hry" },
  it: { image: "Immagine",      kids: "Per bambini",        quiz: "Quiz",         compare: "Giochi di parole" },
  ja: { image: "画像",          kids: "子ども向け説明",      quiz: "クイズ",       compare: "単語ゲーム" },
  hi: { image: "तस्वीर",       kids: "बच्चों के लिए समझ", quiz: "क्विज़",        compare: "शब्द खेल" },
  am: { image: "ምስል",      kids: "ለልጆች ማብራሪያ",      quiz: "ኩዊዝ",         compare: "የቃላት ጨዋታዎች" },
  uk: { image: "Зображення", kids: "Для дітей", quiz: "Вікторина", compare: "Ігри зі словами" },
  tr: { image: "Görsel", kids: "Çocuklar için", quiz: "Test", compare: "Kelime oyunları" },
  pl: { image: "Obrazek", kids: "Dla dzieci", quiz: "Quiz", compare: "Gry słowne" },
  fa: { image: "تصویر", kids: "توضیح برای کودکان", quiz: "آزمونک", compare: "بازی با کلمات" },
  id: { image: "Gambar", kids: "Untuk anak", quiz: "Kuis", compare: "Permainan kata" },
  nl: { image: "Afbeelding", kids: "Voor kinderen", quiz: "Quiz", compare: "Woordspellen" },
  el: { image: "Εικόνα", kids: "Για παιδιά", quiz: "Κουίζ", compare: "Παιχνίδια λέξεων" },
  zu: { image: "Isithombe", kids: "Incazelo yezingane", quiz: "Imibuzo", compare: "Imidlalo yamagama" },
  xh: { image: "Umfanekiso",   kids: "Inkcazelo yabantwana", quiz: "Imibuzo",         compare: "Imidlalo yamagama" },
  nso: { image: "Seswantšho",   kids: "Tlhalošo ya bana", quiz: "Tlhahlobo",         compare: "Dipapadi tša mantšu" },
  tn: { image: "Setshwantsho",   kids: "Tlhaloso ya bana", quiz: "Tlhatlhobo",         compare: "Metshameko ya mafoko" },
  st: { image: "Setshwantsho",   kids: "Tlhaloso ya bana", quiz: "Kwisi",         compare: "Dipapadi tsa mantswe" },
  ts: { image: "Xifaniso",   kids: "Nhlamuselo ya vana", quiz: "Mavutiso",         compare: "Mintlangu ya marito" },
  ss: { image: "Sitfombe",   kids: "Inchazelo yebantfwana", quiz: "Imibuto",         compare: "Imidlalo yemagama" },
  ve: { image: "Tshifanyiso",   kids: "Ṱhalutshedzo ya vhana", quiz: "Mbudziso",         compare: "Mitambo ya maipfi" },
  nr: { image: "Isithombe",   kids: "Ihlathululo yabantwana", quiz: "Ikhwizi",         compare: "Imidlalo yamezwi" },
  vi: { image: "Hình ảnh", kids: "Giải thích cho bé", quiz: "Câu đố", compare: "Trò chơi chữ" },
  fil: { image: "Larawan", kids: "Para sa bata", quiz: "Pagsusulit", compare: "Laro ng salita" },
  af: { image: "Prent", kids: "Vir kinders", quiz: "Vasvra", compare: "Woordspeletjies" },
  sw: { image: "Picha", kids: "Maelezo kwa watoto", quiz: "Chemsha bongo", compare: "Michezo ya maneno" },
  "zh-CN": { image: "图片", kids: "儿童讲解", quiz: "小测验", compare: "单词游戏" },
  "zh-TW": { image: "圖片", kids: "兒童講解", quiz: "小測驗", compare: "單字遊戲" },
  ko: { image: "이미지", kids: "어린이 설명", quiz: "퀴즈", compare: "단어 게임" },
  th: { image: "รูปภาพ", kids: "คำอธิบายสำหรับเด็ก", quiz: "แบบทดสอบ", compare: "เกมคำศัพท์" },
  bn: { image: "ছবি", kids: "শিশুদের জন্য ব্যাখ্যা", quiz: "কুইজ", compare: "শব্দের খেলা" },
  da: { image: "Billede", kids: "Til børn", quiz: "Quiz", compare: "Ordspil" },
  hu: { image: "Kép", kids: "Gyerekeknek", quiz: "Kvíz", compare: "Szójátékok" },
};
// The row's tabs, by the plan that opens them (Clear+ first, then Deep).
// Save and offline are automatic now and compose is the text link under the
// examples (MeaningPractice), so the row keeps image + kids (Gadi 2026-10-24).
const CLEAR_TAB_IDS: RowTabId[] = ["image", "kids"];
const DEEP_TAB_IDS:  RowTabId[] = ["quiz", "compare"];

function MeaningEntry({
  n,
  meaning,
  plan,
  classroomInSession = false,
  word,
  imageUrl,
  imageGenerating,
  onGenerate,
  onUpgrade,
  onAction,
  onReport,
  kidsImageUrl,
  kidsImageLoading,
  streaming = false,
}: MeaningEntryProps) {
  const { lang } = useLang();
  const tabLabels = TAB_LABELS[lang] ?? TAB_LABELS.en;
  // image + kids render inline; compose + quiz + compare fire route/modal.
  const [openTab, setOpenTab] = useState<"image" | "kids" | null>(null);

  // Kids Mode swap: when the parent has the global toggle on AND this
  // meaning has a kidsExplanation (always true for Clear/Deep), promote
  // the kid-friendly text + examples to the main definition slot. The
  // adult "meaning" + "examples" stay in the data so toggling back off
  // is a free re-render, no re-fetch. Same cached server response
  // carries both versions — see route.ts for the rationale.
  const [kidsOn] = useKidsMode();
  // Kids text for THIS sense, if it has streamed in yet.
  const kidsText = meaning.kidsExplanation?.explanation?.trim() || "";
  const showKids = kidsOn && !!kidsText;
  // In Kids Mode, while the kids text has NOT arrived yet AND we're still
  // streaming, WITHHOLD the adult definition instead of showing it and then
  // swapping — a child should never watch the grown-up text get typed out.
  // Once the stream is done with still no kids version (rare: old cache), we
  // fall back to the adult text so the card is never empty.
  const awaitingKids = kidsOn && !kidsText && streaming;
  // POS badge — shown on EVERY meaning that has a pos value (the LLM
  // Council 2026-06-20 ruled: it's not a configuration, it's part of
  // what a dictionary entry IS). Translated into the UI language by
  // formatPos so a Hebrew reader sees "שם עצם" not "noun".
  //
  // Hidden only in Kids Mode — Gadi 2026-06-20: "במצב ילדים זה לא
  // אמור להופיע כדי לא לסבך את הילדים". A 7-year-old doesn't need to
  // read "noun" before they read what the word means.
  //
  // The single-meaning suppression (totalMeanings > 1) was removed on
  // 2026-07-05 after a paying subscriber reported the part of speech
  // as missing: for a learner, "what kind of word is this" is exactly
  // the information they came for, even when there's only one sense.
  // POS badge is hidden throughout Kids Mode (not just once kids text lands),
  // so it doesn't flash during streaming either.
  const posLabel =
    !kidsOn && meaning.pos ? formatPos(meaning.pos, lang) : "";
  const effectiveMeaning = showKids
    ? kidsText
    : awaitingKids
    ? ""
    : meaning.meaning;
  const effectiveExamples = showKids
    ? meaning.kidsExplanation!.examples
    : awaitingKids
    ? []
    : meaning.examples;
  // Lightbox state — opens when the user taps the generated image
  // inside this meaning's image tab.
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // "More example sentences" (MeaningPractice) append here, per mode.
  const [extraExamples, setExtraExamples] = useState<{ kids: boolean; list: string[] }>({ kids: false, list: [] });
  const shownExtra = extraExamples.kids === showKids ? extraExamples.list : [];
  const allExamples = [...(effectiveExamples ?? []), ...shownExtra];

  // Local renderer so the two tier-grouped tab rows (Clear + Deep)
  // can share the same chip JSX without duplicating it.
  function renderTab(id: RowTabId) {
    const unlocked = tabUnlocked(id, plan, classroomInSession);
    const isOpen = openTab === id;
    const classes = [
      "wb-mtab",
      isOpen ? "is-open" : "",
      unlocked ? "" : "is-locked",
    ].filter(Boolean).join(" ");
    const label = tabLabels[id];
    return (
      <button
        key={id}
        type="button"
        className={classes}
        data-tier="clear"
        onClick={() => handleTabClick(id)}
        aria-pressed={isOpen}
        title={label}
        aria-label={label}
      >
        <span className="wb-mtab-icon"><TabIcon name={id} /></span>
        <span className="wb-mtab-label">{label}</span>
        {!unlocked && (
          <span className="wb-mtab-lock"><LockIcon size={10} /></span>
        )}
      </button>
    );
  }

  function handleTabClick(tab: RowTabId) {
    const unlocked = tabUnlocked(tab, plan);
    if (!unlocked) {
      onUpgrade?.(tab, tierForTab(tab) as "clear" | "deep");
      return;
    }
    if (tab === "image") {
      setOpenTab(openTab === "image" ? null : "image");
      if (openTab !== "image" && !imageUrl && !imageGenerating) {
        onGenerate?.();
      }
      return;
    }
    if (tab === "kids") {
      setOpenTab(openTab === "kids" ? null : "kids");
      return;
    }
    if (tab === "compare") { onAction?.("compare"); return; }
    if (tab === "quiz") { onAction?.("practice"); return; }
  }

  // Share THIS specific meaning. Tries native share, falls back to
  // copying a URL with a #m{n} anchor so the recipient lands on the
  // right card. We don't have anchor scroll yet — that's Phase 2.
  function handleShareMeaning() {
    if (typeof navigator === "undefined" || typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}#m${n}`;
    const text = meaning.meaning ?? "";
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
    };
    if (nav.share) {
      nav.share({ title: `Gadit, ${word}`, text, url }).catch(() => undefined);
    } else if (!nativeShareFallback(url, text)) {
      nav.clipboard?.writeText(url).catch(() => undefined);
    }
  }

  // Per-meaning TTS — natural AI voice for Clear/Deep, free Web Speech
  // for everyone else. Reads the meaning text + the first example so
  // the user hears the definition in context, not just a bare phrase.
  // Uses the effective (mode-swapped) fields so TTS in Kids Mode reads
  // the kids text aloud, not the adult one.
  // The example joins the read-aloud only when it is in the same script as
  // the meaning: an English word under a Hebrew UI has English examples,
  // and one voice reading Hebrew then English sounded like the explanation
  // was "in English" (Gadi 2026-10-10).
  const firstExample = (effectiveExamples ?? [])[0];
  const ttsText = [
    effectiveMeaning ?? "",
    ...(firstExample && sameScript(firstExample, effectiveMeaning ?? "") ? [firstExample] : []),
  ]
    .filter(Boolean)
    .join(". ");
  const ttsUseAI = plan === "clear" || plan === "deep";

  return (
    <div className="wb-mcard">
      <div className="wb-mcard-head">
        {ttsText && (
          <TTSButton
            text={ttsText}
            audioLang={lang}
            useOpenAI={ttsUseAI}
            ariaLabel={v2(lang, "listenToWord")}
            className="wb-mcard-listen"
          />
        )}
        <button
          type="button"
          className="wb-mcard-share"
          aria-label={v2(lang, "shareDefinitionAria")}
          onClick={handleShareMeaning}
        >
          <ShareIcon size={14} />
        </button>
        {/* Small flag icon for per-meaning error reporting. Same
            visual weight as share / TTS so it reads as another quiet
            chrome control, not a primary action. Tapping bubbles up
            to the parent's onReport with this meaning's section id;
            WordClient catches that, pre-selects the "definition"
            category, and opens ReportModalV2. */}
        {onReport && (
          <button
            type="button"
            className="wb-mcard-flag wb-flag-tip"
            aria-label={v2(lang, "reportLabel")}
            data-tip={v2(lang, "reportLabel")}
            onClick={() => onReport(`meaning-${n}`)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="22" x2="4" y2="15" />
              <path d="M4 15c4-4 8 4 16 0V3c-8 4-12-4-16 0z" />
            </svg>
          </button>
        )}
      </div>

      {effectiveMeaning && (
        <div className="wb-mdef-row">
          <span className="wb-mnum">{n}</span>
          <span className="wb-mdef">
            {posLabel && <span className="wb-mpos" aria-label={posLabel}>{posLabel}</span>}
            <TappableText text={effectiveMeaning} skipWord={word} />
          </span>
        </div>
      )}

      {/* Kids Mode, still streaming: the kids text hasn't arrived yet. Show a
          quiet shimmer in place of the definition rather than the adult text,
          so a child never sees the grown-up version get typed then swapped. */}
      {awaitingKids && (
        <div className="wb-mdef-row" aria-busy="true">
          <span className="wb-mnum">{n}</span>
          <span className="wb-mdef" style={{ flex: 1 }}>
            <span
              className="wb-mkids-skeleton"
              style={{ display: "block", height: 15, width: "82%", borderRadius: 6 }}
            />
          </span>
        </div>
      )}

      {/* Kids Mode: a picture for THIS meaning, always visible, no tap.
          Adult UI never sets kidsImageUrl, so this is inert there. */}
      {showKids && kidsImageUrl && (
        <div className="wb-mkids-image">
          <img src={kidsImageUrl} alt={effectiveMeaning || word} loading="lazy" />
        </div>
      )}
      {showKids && !kidsImageUrl && kidsImageLoading && (
        <div className="wb-mkids-image wb-mkids-image-loading" aria-hidden="true">
          <div className="wb-mkids-skeleton gd-wait-center"><WaitDots className="gd-wait-big" /></div>
        </div>
      )}

      {allExamples.length > 0 && (
        <div className="wb-mexamples">
          {allExamples.map((ex, j) => (
            <div className="wb-mexample" key={j}>
              {/* The example row is a flex container with a 10px gap so
                  the leading bullet pseudo-element sits cleanly against
                  the text. Wrapping TappableText inside ONE <span> means
                  all its per-word spans collapse to a single flex child,
                  so the gap fires once (between bullet and text) instead
                  of once between every word. */}
              <span><TappableText text={ex} skipWord={word} /></span>
            </div>
          ))}
        </div>
      )}

      {!streaming && !classroomInSession && (
        <MeaningPractice
          word={word}
          meaning={effectiveMeaning}
          examples={allExamples}
          paid={plan === "clear" || plan === "deep"}
          kids={showKids}
          onMoreExamples={(more) => setExtraExamples((cur) => ({ kids: showKids, list: [...(cur.kids === showKids ? cur.list : []), ...more] }))}
          onUpgrade={() => onUpgrade?.("compose", "clear")}
        />
      )}

      {/* Opposite moved OUT of the meaning card (Gadi 2026-09-14) — it was
          stuck in the middle of the definition. Antonyms now render as chips
          in the WordQuestions block below all meanings, collected across every
          sense. See ResultView → WordQuestions opposites prop. */}

      {/* Idioms have moved OUT of the meaning card. They render as
          a standalone section after all meanings, before Word Origin
          (Gadi product decision — keeps the card focused on the
          definition itself, gives idioms their own breathing room). */}

      {/* Tab row, in Kids Mode the "Kids' explanation" tab is hidden
          since the kids-friendly content IS now the main definition
          shown above. Showing the tab would be redundant and confusing
          ("explain like a kid" → already done). */}
      {/* One row, one colour (Gadi 2026-10-24): image, kids, quiz and games
          sit together in teal. The tabs still lock by plan (tabUnlocked):
          image and kids need Clear or Deep, quiz and games need Deep; a
          locked tab opens the upgrade prompt. */}
      <div className="wb-mtabs wb-mtabs-tier">
        {[...CLEAR_TAB_IDS, ...DEEP_TAB_IDS]
          .filter((id) => !(showKids && (id === "kids" || id === "image")))
          .map((id) => renderTab(id))}
      </div>

      {/* Inline content panel */}
      {openTab === "image" && (
        <div className="wb-mpanel">
          {imageUrl ? (
            <div className="wb-mpanel-image">
              <button
                type="button"
                className="wb-mpanel-image-btn"
                onClick={() => setLightboxOpen(true)}
                aria-label={v2(lang, "imageOpenFullAria")}
                title={v2(lang, "imageOpenFullAria")}
              >
                <img src={imageUrl} alt={word} />
                <span
                  className="wb-mpanel-image-zoom-hint"
                  aria-hidden="true"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6" />
                    <path d="M9 21H3v-6" />
                    <path d="M21 3l-7 7" />
                    <path d="M3 21l7-7" />
                  </svg>
                </span>
              </button>
              {lightboxOpen && (
                <ImageLightbox
                  src={imageUrl}
                  alt={word}
                  closeLabel={v2(lang, "backLabel")}
                  shareLabel={v2(lang, "shareLabel")}
                  word={word}
                  pageUrl={typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : undefined}
                  onClose={() => setLightboxOpen(false)}
                />
              )}
            </div>
          ) : imageGenerating ? (
            // ACTIVE generating state — distinct from the static empty
            // state below so the user can tell something is actually
            // happening. Pulsing skeleton + spinner + time-hint label.
            <div className="wb-mpanel-loading" aria-busy="true" aria-live="polite">
              <div className="wb-image-skeleton">
                <svg className="wb-image-spinner" width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="3" />
                  <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="28 84" />
                </svg>
              </div>
              <div className="wb-image-loading-label"><WaitText text={v2(lang, "imageGeneratingLabel")} /></div>
              <div className="wb-image-loading-hint">{v2(lang, "imageGeneratingHint")}</div>
            </div>
          ) : (
            // Truly empty — no image and not currently generating. This
            // is the state after a failed attempt (the error banner at
            // the top tells the user why). Showing the 'generating' UI
            // here would lie to them.
            <div className="wb-mpanel-empty">
              <div className="wb-visual-art"><CrosshairIcon size={28} /></div>
              <div className="wb-visual-label">{v2(lang, "imageGeneratingLabel")}</div>
            </div>
          )}
        </div>
      )}

      {openTab === "kids" && meaning.kidsExplanation && (
        <div className="wb-mpanel">
          {meaning.kidsExplanation.intro && (
            <div className="wb-kids-intro"><TappableText text={meaning.kidsExplanation.intro} skipWord={word} /></div>
          )}
          <div className="wb-kids-body"><TappableText text={meaning.kidsExplanation.explanation} skipWord={word} /></div>
          {(meaning.kidsExplanation.examples ?? []).length > 0 && (
            <div className="wb-kids-ex">
              {(meaning.kidsExplanation.examples ?? []).map((ex, j) => (
                <div className="wb-kids-ex-item" key={j}><span><TappableText text={ex} skipWord={word} /></span></div>
              ))}
            </div>
          )}
        </div>
      )}
      {openTab === "kids" && !meaning.kidsExplanation && (
        <div className="wb-mpanel">
          <div className="wb-kids-body">{v2(lang, "kidsComingSoon")}</div>
        </div>
      )}

    </div>
  );
}

// ─── MeaningsBlock — vertical stack of MeaningEntry cards ──────
export function MeaningsBlock({
  meanings,
  word = "",
  plan = "basic",
  classroomInSession = false,
  imageUrl,
  imageGenerating,
  onGenerate,
  onUpgrade,
  onAction,
  onReport,
  kidsImages,
  kidsImagesLoading,
  streaming = false,
}: {
  meanings: Meaning[];
  word?: string;
  plan?: Plan;
  streaming?: boolean;
  classroomInSession?: boolean;
  imageUrl?: string;
  imageGenerating?: boolean;
  onGenerate?: () => void;
  /** Kids Mode: per-meaning pictures keyed by meaning index. */
  kidsImages?: Record<number, string>;
  /** Kids Mode: which meaning indexes are still generating a picture. */
  kidsImagesLoading?: Record<number, boolean>;
  onUpgrade?: (tab?: TabId, tier?: "clear" | "deep") => void;
  onAction?: (id: ActionId) => void;
  onReport?: (section: string) => void;
}) {
  const { lang } = useLang();
  if (!meanings || meanings.length === 0) return null;
  return (
    <div className="wb-meanings">
      <div className="wb-eyebrow">
        <span className="wb-eyebrow-icon"><BookIcon /></span>
        <span>
          {v2(lang, "meaningsEyebrow")}
          {meanings.length > 1 && (
            <span className="wb-eyebrow-count"> ({meanings.length})</span>
          )}
        </span>
      </div>
      <div className="wb-meanings-stack">
        {meanings.map((m, i) => (
          <MeaningEntry
            key={i}
            n={i + 1}
            meaning={m}
            word={word}
            plan={plan}
            classroomInSession={classroomInSession}
            imageUrl={imageUrl}
            imageGenerating={imageGenerating}
            onGenerate={onGenerate}
            kidsImageUrl={kidsImages?.[i]}
            kidsImageLoading={kidsImagesLoading?.[i]}
            streaming={streaming}
            onUpgrade={onUpgrade}
            onAction={onAction}
            onReport={onReport}
          />
        ))}
      </div>
    </div>
  );
}

// ─── IdiomsSection — collects per-meaning + general idioms ──────
// Renders as a standalone section between Meanings and Origin, mirroring
// the Meanings/Origin pattern (eyebrow OUTSIDE the card).
export function IdiomsSection({
  meanings,
  generalIdioms,
  word = "",
  wordLang,
  onReport,
  plan = "basic",
  streaming = false,
}: {
  meanings: Meaning[];
  generalIdioms?: Idiom[];
  /** While the definition still streams in, `word` is half written ("kom"
   *  before "kompromiss"), so the idiom fetch waits for the full word. */
  streaming?: boolean;
  /** The headword + its language, so the dedicated idiom endpoint can enrich
   *  the sparse define idioms with a reliable, complete set. */
  word?: string;
  wordLang?: string;
  onReport?: (section: string) => void;
  plan?: Plan;
}) {
  const { lang } = useLang();
  const [kidsOn] = useKidsMode();
  const { user } = useAuth();

  // Idioms embedded in the define result — instant, but the big-prompt model
  // returns them unreliably (often sparse or empty). De-duped by phrase.
  const defineIdioms: Idiom[] = useMemo(() => {
    const seen = new Set<string>();
    const out: Idiom[] = [];
    for (const m of meanings ?? []) for (const i of m.idioms ?? []) {
      const key = i.phrase?.trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(i);
    }
    for (const i of generalIdioms ?? []) {
      const key = i.phrase?.trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(i);
    }
    return out;
  }, [meanings, generalIdioms]);

  // The dedicated /api/word-idioms set — reliable and complete (loads a moment
  // after the page). Replaces the sparse define set once it arrives; a failed
  // or empty fetch leaves the define idioms in place. Signed-in only.
  const [fetched, setFetched] = useState<Idiom[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!user || !word || streaming) return;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/word-idioms", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ word, uiLang: lang, wordLang }),
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { idioms?: Idiom[] };
        if (!cancelled && Array.isArray(data.idioms)) setFetched(data.idioms);
      } catch { /* keep the define idioms */ }
    })();
    return () => { cancelled = true; };
  }, [user, word, lang, wordLang, streaming]);

  // Prefer the dedicated set when it arrives non-empty; otherwise define's.
  const all = fetched && fetched.length > 0 ? fetched : defineIdioms;
  if (all.length === 0) return null;

  // A speaker PER idiom (Gadi 2026-08-12: not one button that reads them
  // all). OpenAI voice for paying users handles the mixed phrase-language
  // + UI-language meaning.
  const ttsUseAI = plan === "clear" || plan === "deep";

  return (
    <div className="wb-idioms-section">
      <div className="wb-eyebrow wb-eyebrow-with-flag">
        <span>{v2(lang, "idiomsEyebrow")}</span>
        {onReport && (
          <button
            type="button"
            className="wb-section-flag wb-flag-tip"
            aria-label={v2(lang, "reportLabel")}
            data-tip={v2(lang, "reportLabel")}
            onClick={() => onReport("idioms")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="22" x2="4" y2="15" />
              <path d="M4 15c4-4 8 4 16 0V3c-8 4-12-4-16 0z" />
            </svg>
          </button>
        )}
      </div>
      <div className="wb-card wb-idioms-card">
        {all.map((id, j) => {
          // Kids Mode: use the child-friendly meaning when we have one (Romi
          // 2026-09-18 hit hard words like "personification"/"illegible" inside
          // idiom explanations). Falls back to the adult meaning otherwise.
          const effMeaning =
            kidsOn && id.kidsMeaning?.trim() ? id.kidsMeaning.trim() : id.meaning;
          const rowTts = [id.phrase?.trim(), effMeaning?.trim()].filter(Boolean).join(", ");
          return (
            <div className="wb-midiom" key={j}>
              <div className="wb-midiom-text">
                <span className="wb-midiom-phrase"><TappableText text={id.phrase} skipWord={word || undefined} /></span>
                <span className="wb-midiom-sep">, </span>
                {/* Words inside the meaning are tappable — a child stuck on a
                    hard word in the explanation can tap it for a quick look
                    (Kids Mode passes kids=1 to the popover). */}
                <span className="wb-midiom-meaning"><TappableText text={effMeaning} skipWord={word || undefined} /></span>
              </div>
              {rowTts && (
                <TTSButton
                  text={rowTts}
                  audioLang={lang}
                  useOpenAI={ttsUseAI}
                  ariaLabel={v2(lang, "listenToWord")}
                  className="wb-midiom-listen"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── OriginCard (renamed from EtymologyCard) ───────────────────
export function OriginCard({ etymology, onReport, plan = "basic" }: { etymology: Etymology | string | undefined; onReport?: (section: string) => void; plan?: Plan }) {
  const { lang } = useLang();
  const [kidsOn] = useKidsMode();
  const ttsUseAI = plan === "clear" || plan === "deep";
  if (!etymology) return null;

  // Legacy: etymology was sometimes a free-text string. Render it as the
  // story paragraph below an empty fields block.
  const isStructured = typeof etymology === "object";
  // Kids Mode keeps the SAME structured origin fields as adults — source
  // language, original word, breakdown, originally-meant (Romi 2026-09-15:
  // she wanted to see all of that too, not just a story). ONLY the background
  // STORY switches to the child-friendly, simpler-language version. See
  // storyText below.
  const kidsStory = isStructured ? etymology.kidsExplanation?.trim() : "";
  const sourceLanguage = isStructured ? etymology.sourceLanguage?.trim() : "";
  const originalWord = isStructured ? etymology.originalWord?.trim() : "";
  const breakdown = isStructured ? etymology.breakdown?.trim() : "";
  const originalMeaning = isStructured ? etymology.originalMeaning?.trim() : "";
  const historyNote = isStructured
    ? etymology.historyNote?.trim()
    : (etymology as string).trim();
  // In Kids Mode the background paragraph uses the simpler kids story when we
  // have a clean one; otherwise (or in adult mode) the normal historyNote.
  const useKidsStory =
    kidsOn && !!kidsStory && !isEtymologyFieldGarbled("historyNote", kidsStory);
  const storyText = useKidsStory ? kidsStory : historyNote;

  // Final render-time guard. The server rejects garbled generations and
  // the SSR preload sanitises the cache, but this is the last line before
  // pixels: whatever reaches the browser — a stale cache entry, an edge
  // path, a novel corruption in any of the 30+ languages, a field that
  // looks like mojibake is never shown. If that empties every field the
  // whole card disappears, exactly as Gadi asked ("if it has this bug,
  // don't show it at all").
  const hasLang = !!sourceLanguage && !isEtymologyFieldGarbled("sourceLanguage", sourceLanguage);
  const hasOriginal = !!originalWord && !isEtymologyFieldGarbled("originalWord", originalWord);
  const hasBreakdown = !!breakdown && !isEtymologyFieldGarbled("breakdown", breakdown);
  const hasMeant = !!originalMeaning && !isEtymologyFieldGarbled("originalMeaning", originalMeaning);
  const hasStory = !!storyText && !isEtymologyFieldGarbled("historyNote", storyText);
  if (!hasLang && !hasOriginal && !hasBreakdown && !hasMeant && !hasStory) return null;

  // Read the origin aloud: each visible field with its label, then the story.
  const originTts = [
    hasLang && `${v2(lang, "wordOriginLanguage")}: ${sourceLanguage}`,
    hasOriginal && `${v2(lang, "wordOriginOriginalWord")}: ${originalWord}`,
    hasBreakdown && `${v2(lang, "wordOriginBreakdown")}: ${breakdown}`,
    hasMeant && `${v2(lang, "wordOriginOriginallyMeant")}: ${originalMeaning}`,
    hasStory && storyText,
  ].filter(Boolean).join(". ");

  return (
    <div className="wb-origin-section">
      <div className="wb-eyebrow wb-eyebrow-with-flag">
        <span>
          <span className="wb-eyebrow-icon"><ScrollIcon /></span>
          {v2(lang, "wordOriginEyebrow")}
        </span>
        <div className="wb-section-controls">
          {originTts && (
            <TTSButton
              text={originTts}
              audioLang={lang}
              useOpenAI={ttsUseAI}
              ariaLabel={v2(lang, "listenToWord")}
              className="wb-section-listen"
            />
          )}
          {onReport && (
            <button
              type="button"
              className="wb-section-flag wb-flag-tip"
              aria-label={v2(lang, "reportLabel")}
              data-tip={v2(lang, "reportLabel")}
              onClick={() => onReport("etymology")}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="4" y1="22" x2="4" y2="15" />
                <path d="M4 15c4-4 8 4 16 0V3c-8 4-12-4-16 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="wb-card wb-origin">
        <div className="wb-origin-fields">
          {hasLang && (
            <div className="wb-origin-row">
              <div className="wb-origin-label">{v2(lang, "wordOriginLanguage")}</div>
              <div className="wb-origin-value">{sourceLanguage}</div>
            </div>
          )}
          {hasOriginal && (
            <div className="wb-origin-row">
              <div className="wb-origin-label">{v2(lang, "wordOriginOriginalWord")}</div>
              <div className="wb-origin-value">{originalWord}</div>
            </div>
          )}
          {hasBreakdown && (
            <div className="wb-origin-row">
              <div className="wb-origin-label">{v2(lang, "wordOriginBreakdown")}</div>
              <div className="wb-origin-value">{breakdown}</div>
            </div>
          )}
          {hasMeant && (
            <div className="wb-origin-row">
              <div className="wb-origin-label">{v2(lang, "wordOriginOriginallyMeant")}</div>
              <div className="wb-origin-value"><TappableText text={originalMeaning || ""} /></div>
            </div>
          )}
          {hasStory && (
            <div className="wb-origin-row wb-origin-row-story">
              <div className="wb-origin-label">{v2(lang, "wordOriginBackgroundLabel")}</div>
              <div className="wb-origin-value"><TappableText text={storyText || ""} /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ResultView (page composition) ─────────────────────────────
// "Gad it" (Gadi 2026-10-24): at the END of the page, after the word origin.
// No question any more: the tap itself says "I understood" and marks the word
// as understood in the notebook. A plan without a notebook gets the
// login/upgrade path through onLocked.
function GadItButton({ lang, word, language, paid, onLocked }: { lang: string; word: string; language: string; paid: boolean; onLocked: () => void }) {
  const c = gadCopy(lang);
  const { user } = useAuth();
  const [state, setState] = useState<"idle" | "busy" | "done" | "already">("idle");
  const label = c.button;
  async function tap() {
    if (!user || !paid) { onLocked(); return; }
    if (state !== "idle") return;
    setState("busy");
    const send = async () => {
      const r = await fetch("/api/notebook/understood", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ word, language, source: "self" }),
      });
      return (await r.json().catch(() => ({}))) as { understood?: boolean; alreadyUnderstood?: boolean; skipped?: string };
    };
    try {
      let j = await send();
      // The automatic notebook save may still be on its way: one retry.
      if (j.skipped) { await new Promise((ok) => setTimeout(ok, 1500)); j = await send(); }
      setState(j.alreadyUnderstood ? "already" : j.understood ? "done" : "idle");
      try { sessionStorage.removeItem("gadit-kid-rankindex"); } catch { /* ignore */ }
    } catch { setState("idle"); }
  }
  const done = state === "done" || state === "already";
  return (
    <div style={{ margin: "22px 20px 8px" }}>
      <button
        type="button"
        onClick={tap}
        disabled={state === "busy"}
        aria-label={`${label} ${GAD_TAP_HINT[lang] ?? GAD_TAP_HINT.en}`}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", minHeight: 56, borderRadius: 16, border: "none", background: done ? "#0F9E6E" : "#0B7F7F", color: "#fff", fontSize: 19, fontWeight: 800, cursor: done ? "default" : "pointer", fontFamily: "inherit", boxShadow: "0 2px 6px rgba(11,127,127,.25)", opacity: state === "busy" ? 0.75 : 1 }}
      >
        <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{done ? c.success : label}</span>
        <span aria-hidden="true">✓</span>
      </button>
      <div style={{ textAlign: "center", fontSize: 12.5, color: "var(--ink-muted, #6B7280)", marginTop: 6 }}>
        {state === "done" ? c.doneSub : state === "already" ? c.alreadySub : (GAD_TAP_HINT[lang] ?? GAD_TAP_HINT.en)}
      </div>
    </div>
  );
}

export function ResultView({
  result,
  plan,
  classroomInSession = false,
  imageUrl,
  imageGenerating = false,
  isSaved = false,
  notebookFull = false,
  savedAgo,
  onShare,
  onGenerate,
  onUpgrade,
  onAction,
  onReport,
  kidsImages,
  kidsImagesLoading,
  showNiqqud = false,
  niqqudOn = false,
  onToggleNiqqud,
  streaming = false,
}: {
  result: WordResult;
  plan: Plan;
  /** True while the SSE stream is still filling this result — threaded to the
   *  meanings so Kids Mode can withhold adult text until kids text lands. */
  streaming?: boolean;
  /** True when this result is being rendered as part of an active
   *  /c/<CODE> classroom session (school hours window open). Unlocks
   *  image / kids' explanation / word games for an anonymous kid the
   *  same way Clear+ would unlock them for a paying customer. */
  classroomInSession?: boolean;
  imageUrl?: string;
  imageGenerating?: boolean;
  isSaved?: boolean;
  /** A free notebook already holds FREE_NOTEBOOK_MAX words, so this one was not saved. */
  notebookFull?: boolean;
  savedAgo?: string;
  onShare?: () => void;
  onGenerate?: () => void;
  onUpgrade?: (tab?: TabId, tier?: "clear" | "deep") => void;
  onAction?: (id: ActionId) => void;
  onReport?: (section: string) => void;
  /** Kids Mode: per-meaning pictures keyed by meaning index. */
  kidsImages?: Record<number, string>;
  /** Kids Mode: which meaning indexes are still generating a picture. */
  kidsImagesLoading?: Record<number, boolean>;
  /** Niqqud toggle beside the word's speaker (Hebrew word + signed-in). */
  showNiqqud?: boolean;
  niqqudOn?: boolean;
  onToggleNiqqud?: () => void;
}) {
  const { dir, lang } = useLang();
  const href = useHref();

  return (
    <div className="wordbook wb-page" dir={dir}>
      {isSaved && savedAgo && <ProgressSignal savedAgo={savedAgo} />}

      {/* Saving and offline are automatic (no buttons), so the header
          keeps only share. */}
      <WordHeader
        word={result.word}
        language={result.language}
        translation={result.translation}
        ipa={result.ipa}
        onShare={onShare}
        showNiqqud={showNiqqud}
        niqqudOn={niqqudOn}
        onToggleNiqqud={onToggleNiqqud}
      />

      {/* Saving is automatic now (no buttons), so say it once it happened
          (Gadi 2026-10-24): notebook for everyone signed in, offline too
          for paying plans (their words are kept on the device). */}
      {isSaved && !streaming && (
        <p className="wb-saved-note" dir={dir}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          <span>{plan === "clear" || plan === "deep" ? meaningPracticeCopy(lang).saved : meaningPracticeCopy(lang).savedFree}</span>
        </p>
      )}

      {/* A full free notebook stopped saving: say so instead of saving
          silently nothing (Gadi 2026-10-25). Inside the store apps only the
          count, no plan name or link (.gd-buy / .gd-play-only). */}
      {notebookFull && !isSaved && !streaming && (
        <p className="wb-saved-note" dir={dir}>
          <span className="gd-buy">
            {planCopy(lang, "nbFreeFull", { max: FREE_NOTEBOOK_MAX })}{" "}
            <Link href={href("/pricing")} style={{ color: "inherit", fontWeight: 700 }}>{planCopy(lang, "nbFreeCta")}</Link>
          </span>
          <span className="gd-play-only">{planCopy(lang, "nbFreeCount", { n: FREE_NOTEBOOK_MAX, max: FREE_NOTEBOOK_MAX })}</span>
        </p>
      )}

      {/* Spelling correction — when the model auto-corrected a typo, show the
          learner what they typed vs the correct spelling (the headword above).
          Important for a kids' spelling app (Gadi 2026-09-19). */}
      {result.correctedFrom &&
        result.correctedFrom.trim().toLowerCase() !== (result.word || "").trim().toLowerCase() && (
        <div
          dir={dir}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap",
            margin: "2px 0 4px", padding: "7px 13px", borderRadius: 999,
            background: "#FEF6E7", border: "1px solid #F6D8A0", fontSize: 13.5,
          }}
        >
          <span style={{ color: "var(--ink-muted,#8a6d3b)" }}>
            {SPELLING_FIX_COPY[lang] ?? SPELLING_FIX_COPY.en}
          </span>
          <span dir="auto" style={{ textDecoration: "line-through", color: "#B45309" }}>{result.correctedFrom}</span>
          <span aria-hidden="true" style={{ color: "var(--ink-muted,#9CA3AF)" }}>→</span>
          <span dir="auto" style={{ fontWeight: 800, color: "var(--ink,#0B1220)" }}>{result.word}</span>
        </div>
      )}

      {/* "Did you mean" — RULE 1b suggestion rendered as a clickable chip
          that searches the corrected word. The localized "did you mean X?"
          sentence still appears in the meaning text below, so the chip needs
          no translated label of its own. */}
      {result.suggestedWord && (
        <a href={href(wordPath(result.suggestedWord))} className="wb-dym-chip" dir={dir} lang={detectWordLang(result.language)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className="wb-dym-word">{result.suggestedWord}</span>
        </a>
      )}

      <MeaningsBlock
        meanings={result.meanings ?? []}
        word={result.word}
        plan={plan}
        streaming={streaming}
        classroomInSession={classroomInSession}
        imageUrl={imageUrl}
        imageGenerating={imageGenerating}
        onGenerate={onGenerate}
        onUpgrade={onUpgrade}
        onAction={onAction}
        onReport={onReport}
        kidsImages={kidsImages}
        kidsImagesLoading={kidsImagesLoading}
      />

      <IdiomsSection
        meanings={result.meanings ?? []}
        generalIdioms={result.generalIdioms}
        word={result.word}
        wordLang={result.language}
        onReport={onReport}
        plan={plan}
        streaming={streaming}
      />

      <OriginCard etymology={result.etymology} onReport={onReport} plan={plan} />

      {onAction && !streaming && !classroomInSession && (result.meanings?.length ?? 0) > 0 && (
        <GadItButton
          lang={lang}
          word={result.word}
          language={result.language}
          paid={plan === "clear" || plan === "deep"}
          onLocked={() => onAction("gadit")}
        />
      )}

      <WordQuestions
        word={result.word}
        wordLang={result.language}
        plan={plan}
        opposites={Array.from(
          new Set(
            (result.meanings ?? [])
              .map((m) => (typeof m.opposite === "string" ? m.opposite.trim() : ""))
              .filter((o) => o.length > 0)
          )
        )}
      />
    </div>
  );
}

/** True when two texts are written in the same script (Hebrew, Arabic,
 *  Cyrillic or Latin letters), by their first letter. */
function sameScript(a: string, b: string): boolean {
  const sc = (t: string) => { for (const ch of t) { const c = ch.codePointAt(0) ?? 0; if (c >= 0x0590 && c <= 0x05ff) return "he"; if (c >= 0x0600 && c <= 0x06ff) return "ar"; if (c >= 0x0400 && c <= 0x04ff) return "cy"; if ((c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a) || (c >= 0xc0 && c <= 0x24f)) return "la"; } return ""; };
  return sc(a) === sc(b);
}

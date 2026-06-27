"use client";

/**
 * Word Result page — "Wordbook" redesign (locked April 2026).
 *
 * Source of truth: web/public/gadit-final.html
 *
 * Composition (top → bottom on cream paper):
 *   <ProgressSignal />    "Saved · 2 days ago" chip — only when isSaved
 *   <WordHeader />        meta line + word title (54px mobile / 96px desktop)
 *   <MeaningsBlock />     Meanings — NO card, sit directly on paper
 *   <OriginCard />        rust card: Language + Originally meant + optional story
 *   <VisualCard />        mint card: empty state with Generate, or filled image
 *   <TakeItFurther />     lavender card: 4 tiles (Compose / Quiz / Compare / Kids)
 *   <ActionBar />         mobile sticky bottom: Save to Word Book + share
 *
 * Legacy exports kept for backward compatibility with consumers:
 *   - MeaningCard (renders a single row; ResultView itself uses MeaningsBlock)
 *   - KidsCard, IdiomsCard (no-op exports; not rendered by ResultView)
 *   - EtymologyCard → now renders as OriginCard
 *   - ImageSlot → now renders as VisualCard
 *
 * Defensive against missing API fields:
 *   - pos / ipa aren't currently returned by /api/define; WordHeader accepts
 *     them as props but does NOT render them (per redesign — no IPA, pos
 *     only shown in the meta line if present).
 *   - Etymology can arrive as a string (legacy) or a structured object.
 *     OriginCard handles both shapes.
 *   - kidsExplanation lives per-meaning in the schema. In the new design,
 *     "Kids' explanation" is a tile inside Take it further (note 1 from
 *     gadit-final.html). The legacy KidsCard export is preserved but no
 *     longer rendered by ResultView.
 *   - generalIdioms is dropped from the page entirely (not in the new
 *     design). IdiomsCard export is kept as a no-op for legacy callers.
 */

import { useState, type ReactNode } from "react";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import type { Lang } from "@/lib/i18n";
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
}

export interface Meaning {
  meaning: string;
  examples: string[];
  pos?: string;
  kidsExplanation?: KidsExplanation;
  idioms?: Idiom[];
}

export interface Etymology {
  sourceLanguage: string;
  originalWord: string;
  breakdown: string;
  originalMeaning: string;
  historyNote?: string;
}

export interface WordResult {
  word: string;
  language: string;
  meanings: Meaning[];
  etymology: Etymology | string;
  generalIdioms?: Idiom[];
  ipa?: string;
}

// ActionDef — IDs surfaced by the Take it further tiles. WordClient
// receives the id via onAction and dispatches to the right behavior.
// "kids" and "compare" are new for the wordbook redesign.
export type ActionId = "save" | "image" | "compose" | "practice" | "compare" | "kids";

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
};

function langMatchesUi(language: string, lang: Lang): boolean {
  const langName = (language || "").toLowerCase().trim();
  if (!langName) return true;
  return (LANG_NAMES[lang] ?? []).some((n) => langName.includes(n));
}

// Reverse: take the language label /api/define returns ("English",
// "German", "Čeština", "العربية") and return our 2-letter Lang code.
// Used to pick the right TTS voice locale for the speaker button.
function detectWordLang(language: string): string {
  const langName = (language || "").toLowerCase().trim();
  for (const [code, names] of Object.entries(LANG_NAMES)) {
    if (names.some((n) => langName.includes(n))) return code;
  }
  return "en";
}

// ─── CrispTech icons — 1.5px line family, currentColor only ─────
// Single visual family. The eyebrow icons are HIDDEN by CSS (we
// don't want big icons next to section labels anymore); they stay
// in code only for backward export compatibility.

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
function VisualEyebrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <circle cx="8" cy="10" r="1.5" />
      <path d="M3 16.5l4-3.5 4 3 4-4 6 4" />
    </svg>
  );
}
function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="m9.5 14.5 1.5-5 5-1.5-1.5 5z" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Crosshair — used in the visual empty state
function CrosshairIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
    </svg>
  );
}

// Lock — used in DEEP tier badge
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
function BookmarkFillIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function PinIcon({ size = 18, filled = false }: { size?: number; filled?: boolean }) {
  // Cloud-down arrow — the visual metaphor users recognise from
  // streaming services for 'download for offline'. Filled state =
  // already downloaded; outline state = tap to download.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9" />
      <path d="M12 12v9" fill="none" />
      <path d="m16 17-4 4-4-4" fill="none" />
    </svg>
  );
}
function PlusIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

// CrispTech tile icons — uniform 1.5px line family, currentColor.
// The teal-soft 36×36 square around the icon is provided by CSS
// (.wb-tile-icon). Icon itself is just the glyph.

function TileComposeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h4l10-10-4-4L4 16z" />
      <path d="M14 6l4 4" />
    </svg>
  );
}
function TileQuizIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 4 2c-1 .8-1.5 1.4-1.5 2.5" />
      <circle cx="12" cy="17.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
function TileCompareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="8" height="14" rx="1" />
      <rect x="13" y="5" width="8" height="14" rx="1" />
      <path d="M7 9v6M17 9v6" />
    </svg>
  );
}
function TileKidsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="3.5" />
      <path d="M5 21c0-3.5 3-6 7-6s7 2.5 7 6" />
      <circle cx="10" cy="9" r="0.4" fill="currentColor" stroke="none" />
      <circle cx="14" cy="9" r="0.4" fill="currentColor" stroke="none" />
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
  pos,
  isSaved = false,
  onSave,
  onShare,
  isPinned = false,
  onPin,
  // ipa accepted for API stability — not rendered in this design.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipa: _ipa,
}: {
  word: string;
  language: string;
  pos?: string;
  ipa?: string;
  isSaved?: boolean;
  onSave?: () => void;
  onShare?: () => void;
  /** Pinned = explicitly downloaded for offline study. Visual chip
   *  changes label/icon based on state. Hidden entirely when onPin
   *  isn't passed (Basic users + signed-out visitors). */
  isPinned?: boolean;
  onPin?: () => void;
}) {
  const { lang } = useLang();
  const showLang = !langMatchesUi(language, lang);
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
            {showLang && <span>{language}</span>}
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
        </div>
      </div>
      {(onSave || onShare || onPin) && (
        <div className="wb-word-actions">
          {onSave && (
            <button
              type="button"
              className={`wb-word-act ${isSaved ? "is-saved" : ""}`}
              onClick={onSave}
              title={isSaved ? v2(lang, "savedToWordBook") : v2(lang, "saveToWordBook")}
              aria-label={isSaved ? v2(lang, "savedToWordBook") : v2(lang, "saveToWordBook")}
            >
              <BookmarkFillIcon size={13} />
              <span className="wb-word-act-label">
                {isSaved ? v2(lang, "savedToWordBook") : v2(lang, "saveToWordBook")}
              </span>
            </button>
          )}
          {/* Offline pin moved into the per-meaning Clear-tier row
              of tabs 2026-06-20 (Gadi). Old WordHeader pin button
              JSX intentionally removed; isPinned still threads
              through to result.tsx for the new pin chip below. */}
          {onShare && (
            <button
              type="button"
              className="wb-word-act-icon"
              aria-label={v2(lang, "shareLabel")}
              onClick={onShare}
            >
              <ShareIcon size={14} />
            </button>
          )}
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

type TabId = "save" | "pin" | "image" | "kids" | "compose" | "compare" | "quiz";

interface MeaningEntryProps {
  n: number;
  meaning: Meaning;
  /** Total number of meanings in this word, used by the POS badge
      logic so we suppress the badge when there is only ONE meaning
      (the Outsider's caveat from the 2026-06-20 LLM Council: for
      "apple", "tree", "car" the small 'noun' chip just reads as
      noise next to a definition the reader already understands). */
  totalMeanings: number;
  plan: Plan;
  word: string;
  /** Whether this word is in the user's notebook. Drives the
      "save" tab's saved-vs-unsaved visual (filled bookmark, label
      flip to "Saved" / "נשמר"). The save tab itself only renders
      when onSave is defined, mirroring the optional pattern of the
      other action handlers. */
  isSaved?: boolean;
  onSave?: () => void;
  /** Whether the word is pinned for offline use (cached in
      IndexedDB). Drives the "pin" tab's pinned-vs-unpinned visual.
      The pin tab only renders when onPin is defined. */
  isPinned?: boolean;
  onPin?: () => void;
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
}

function tierForTab(tab: TabId): "basic" | "clear" | "deep" {
  // Save, pin, image, kids, compose are Clear+ features.
  // Compare and quiz are Deep features.
  // Nothing is Basic-only (Basic users see definitions + idioms only).
  if (tab === "compare" || tab === "quiz") return "deep";
  return "clear";
}
function tabUnlocked(tab: TabId, plan: Plan): boolean {
  const need = tierForTab(tab);
  if (need === "clear") return plan === "clear" || plan === "deep";
  if (need === "deep") return plan === "deep";
  return true;
}

// Compact icon variants for the tab row — explicit 16×16 with no
// inner detail clutter. Stroke uses currentColor so the active-tab
// state can flip them white via CSS.
function TabIcon({ name }: { name: TabId }) {
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
    case "save":
      // Notebook — bookmark icon was too abstract on mobile (Gadi
      // 2026-06-20: "אחריות לא מבינים מה זה האייקון הזה"). A small
      // lined notebook reads as "your notebook" instantly.
      return (
        <svg {...common}>
          <rect x="5" y="3" width="14" height="18" rx="1.5" />
          <line x1="8" y1="8" x2="16" y2="8" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="16" x2="13" y2="16" />
        </svg>
      );
    case "pin":
      // Download-to-device glyph — the offline pin used to live in
      // the WordHeader's action row as a download-arrow chip; moved
      // here 2026-06-20 to keep all Clear-tier features (image,
      // kids, compose, save, pin) on the same row.
      return (
        <svg {...common}>
          <path d="M12 3v12" />
          <path d="M7 10l5 5 5-5" />
          <path d="M5 19h14" />
        </svg>
      );
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
    case "compose":
      return (
        <svg {...common}>
          <path d="M4 20h4l10-10-4-4L4 16z" />
          <path d="M14 6l4 4" />
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
const TAB_LABELS: Record<string, Record<TabId, string>> = {
  he: { save: "שמירה במחברת",  pin: "שמירה אופליין",  image: "תמונה",       kids: "הסבר לילדים",      compose: "חברו משפט",          quiz: "חידון",        compare: "משחקי מילים" },
  en: { save: "Save to Notebook", pin: "Save offline", image: "Image",   kids: "Kids' explanation", compose: "Compose a sentence", quiz: "Quiz",         compare: "Word games" },
  ar: { save: "حفظ في الدفتر",  pin: "حفظ بدون اتصال", image: "صورة",        kids: "شرح للأطفال",       compose: "اكتب جملة",          quiz: "اختبار",       compare: "ألعاب كلمات" },
  ru: { save: "В блокнот",      pin: "Офлайн",         image: "Картинка",     kids: "Для детей",         compose: "Составить фразу",    quiz: "Викторина",    compare: "Игры со словами" },
  es: { save: "A mi cuaderno",  pin: "Sin conexión",   image: "Imagen",       kids: "Explicación niños", compose: "Componer frase",     quiz: "Quiz",         compare: "Juegos de palabras" },
  pt: { save: "Salvar no caderno", pin: "Offline",     image: "Imagem",       kids: "Para crianças",     compose: "Compor frase",       quiz: "Quiz",         compare: "Jogos com palavras" },
  fr: { save: "Carnet",         pin: "Hors-ligne",     image: "Image",        kids: "Pour enfants",      compose: "Composer phrase",    quiz: "Quiz",         compare: "Jeux de mots" },
  de: { save: "Ins Heft",       pin: "Offline",        image: "Bild",          kids: "Für Kinder",        compose: "Satz schreiben",      quiz: "Quiz",         compare: "Wortspiele" },
  cs: { save: "Do sešitu",      pin: "Offline",        image: "Obrázek",       kids: "Pro děti",          compose: "Napsat větu",         quiz: "Kvíz",         compare: "Slovní hry" },
  sk: { save: "Do zošita",      pin: "Offline",        image: "Obrázok",       kids: "Pre deti",          compose: "Napísať vetu",        quiz: "Kvíz",         compare: "Slovné hry" },
  it: { save: "Quaderno",       pin: "Offline",        image: "Immagine",      kids: "Per bambini",        compose: "Scrivi una frase",    quiz: "Quiz",         compare: "Giochi di parole" },
  ja: { save: "ノートに保存",    pin: "オフライン保存",  image: "画像",          kids: "子ども向け説明",      compose: "文を書く",            quiz: "クイズ",       compare: "単語ゲーム" },
  hi: { save: "नोटबुक में सहेजें", pin: "ऑफ़लाइन सहेजें",  image: "तस्वीर",       kids: "बच्चों के लिए समझ", compose: "वाक्य लिखें",         quiz: "क्विज़",        compare: "शब्द खेल" },
};
// Split by tier 2026-06-20 (Gadi): on mobile the wb-mtabs container
// renders one row per tier so the Clear-tier features (teal) stay
// together and the Deep-tier features (purple) stay together. Read
// CLEAR_TAB_IDS + DEEP_TAB_IDS instead of a single flat list.
const CLEAR_TAB_IDS: TabId[] = ["image", "kids", "compose", "save", "pin"];
const DEEP_TAB_IDS:  TabId[] = ["quiz", "compare"];
const TAB_IDS: TabId[] = [...CLEAR_TAB_IDS, ...DEEP_TAB_IDS];

function MeaningEntry({
  n,
  meaning,
  totalMeanings,
  plan,
  word,
  isSaved = false,
  onSave,
  isPinned = false,
  onPin,
  imageUrl,
  imageGenerating,
  onGenerate,
  onUpgrade,
  onAction,
  onReport,
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
  const showKids = kidsOn && meaning.kidsExplanation;
  // POS badge — shown by default on every meaning that has a pos value
  // (the LLM Council 2026-06-20 ruled: it's not a configuration, it's
  // part of what a dictionary entry IS, so the opt-in toggle was a
  // category error). Translated into the UI language by formatPos so
  // a Hebrew reader sees "שם עצם" not "noun".
  //
  // Hidden in:
  //   1. Kids Mode — Gadi 2026-06-20: "במצב ילדים זה לא אמור להופיע
  //      כדי לא לסבך את הילדים". A 7-year-old doesn't need to read
  //      "noun" before they read what the word means.
  //   2. Single-meaning words — "apple" with one obvious noun reads
  //      as noise next to the meaning text. The moment a word has 2+
  //      senses the badge becomes load-bearing again because it tells
  //      the reader which sense they're scanning.
  const posLabel =
    !showKids && meaning.pos && totalMeanings > 1
      ? formatPos(meaning.pos, lang)
      : "";
  const effectiveMeaning = showKids
    ? meaning.kidsExplanation!.explanation
    : meaning.meaning;
  const effectiveExamples = showKids
    ? meaning.kidsExplanation!.examples
    : meaning.examples;
  // Lightbox state — opens when the user taps the generated image
  // inside this meaning's image tab.
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Local renderer so the two tier-grouped tab rows (Clear + Deep)
  // can share the same chip JSX without duplicating it.
  function renderTab(id: TabId) {
    const unlocked = tabUnlocked(id, plan);
    const isOpen = openTab === id;
    const showSavedState = id === "save" && isSaved;
    const showPinnedState = id === "pin" && isPinned;
    const classes = [
      "wb-mtab",
      isOpen ? "is-open" : "",
      unlocked ? "" : "is-locked",
      showSavedState || showPinnedState ? "is-saved" : "",
    ].filter(Boolean).join(" ");
    let label = tabLabels[id];
    if (showSavedState) label = v2(lang, "savedToWordBook");
    else if (showPinnedState) label = v2(lang, "offlinePinned");
    return (
      <button
        key={id}
        type="button"
        className={classes}
        data-tier={tierForTab(id)}
        onClick={() => handleTabClick(id)}
        aria-pressed={isOpen || showSavedState || showPinnedState}
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

  function handleTabClick(tab: TabId) {
    const unlocked = tabUnlocked(tab, plan);
    if (!unlocked) {
      onUpgrade?.(tab, tierForTab(tab) as "clear" | "deep");
      return;
    }
    if (tab === "save") { onSave?.(); return; }
    if (tab === "pin") { onPin?.(); return; }
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
    if (tab === "compose") { onAction?.("compose"); return; }
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
    } else {
      nav.clipboard?.writeText(url).catch(() => undefined);
    }
  }

  // Per-meaning TTS — natural AI voice for Clear/Deep, free Web Speech
  // for everyone else. Reads the meaning text + the first example so
  // the user hears the definition in context, not just a bare phrase.
  // Uses the effective (mode-swapped) fields so TTS in Kids Mode reads
  // the kids text aloud, not the adult one.
  const ttsText = [
    effectiveMeaning ?? "",
    ...(effectiveExamples ?? []).slice(0, 1),
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

      {(effectiveExamples ?? []).length > 0 && (
        <div className="wb-mexamples">
          {(effectiveExamples ?? []).map((ex, j) => (
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

      {/* Idioms have moved OUT of the meaning card. They render as
          a standalone section after all meanings, before Word Origin
          (Gadi product decision — keeps the card focused on the
          definition itself, gives idioms their own breathing room). */}

      {/* Tab row, in Kids Mode the "Kids' explanation" tab is hidden
          since the kids-friendly content IS now the main definition
          shown above. Showing the tab would be redundant and confusing
          ("explain like a kid" → already done). */}
      {/* Tabs split by tier (Gadi 2026-06-20), Clear features render
          on row 1 (teal), Deep features on row 2 (purple). On a wide
          desktop the two rows sit on one line because each row is
          inline-flex; on mobile they stack into two distinct rows so
          a parent can read the tier at a glance from the colour of
          the row, not just the chip. */}
      <div className="wb-mtabs wb-mtabs-tier">
        {CLEAR_TAB_IDS
          .filter((id) => !(showKids && id === "kids"))
          .filter((id) => !(id === "save" && !onSave))
          .filter((id) => !(id === "pin" && !onPin))
          .map((id) => renderTab(id))}
      </div>
      <div className="wb-mtabs wb-mtabs-tier">
        {DEEP_TAB_IDS.map((id) => renderTab(id))}
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
              <div className="wb-image-loading-label">{v2(lang, "imageGeneratingLabel")}</div>
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
            <div className="wb-kids-intro">{meaning.kidsExplanation.intro}</div>
          )}
          <div className="wb-kids-body">{meaning.kidsExplanation.explanation}</div>
          {(meaning.kidsExplanation.examples ?? []).length > 0 && (
            <div className="wb-kids-ex">
              {(meaning.kidsExplanation.examples ?? []).map((ex, j) => (
                <div className="wb-kids-ex-item" key={j}>{ex}</div>
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
  isSaved = false,
  onSave,
  isPinned = false,
  onPin,
  imageUrl,
  imageGenerating,
  onGenerate,
  onUpgrade,
  onAction,
  onReport,
}: {
  meanings: Meaning[];
  word?: string;
  plan?: Plan;
  isSaved?: boolean;
  onSave?: () => void;
  isPinned?: boolean;
  onPin?: () => void;
  imageUrl?: string;
  imageGenerating?: boolean;
  onGenerate?: () => void;
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
            totalMeanings={meanings.length}
            word={word}
            plan={plan}
            isSaved={isSaved}
            onSave={onSave}
            isPinned={isPinned}
            onPin={onPin}
            imageUrl={imageUrl}
            imageGenerating={imageGenerating}
            onGenerate={onGenerate}
            onUpgrade={onUpgrade}
            onAction={onAction}
            onReport={onReport}
          />
        ))}
      </div>
    </div>
  );
}

// Legacy single-row export (kept for backward compatibility).
export function MeaningCard({ n, meaning }: { n: number; meaning: Meaning; onReport?: () => void }) {
  return (
    <div className="wordbook">
      <div className="wb-meanings">
        <div className="wb-meaning-row">
          <div className="wb-meaning-num">{n}</div>
          <div className="wb-meaning-body">
            {meaning.meaning && <div className="wb-meaning-def">{meaning.meaning}</div>}
            {(meaning.examples ?? []).map((ex, j) => (
              <div className="wb-meaning-ex" key={j}>{ex}</div>
            ))}
          </div>
        </div>
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
  onReport,
}: {
  meanings: Meaning[];
  generalIdioms?: Idiom[];
  onReport?: (section: string) => void;
}) {
  const { lang } = useLang();
  // Combine all idioms — per-meaning first (preserving order), then
  // any general ones at the end. De-dupe by phrase so we don't show
  // the same idiom twice if the model surfaced it in both places.
  const seen = new Set<string>();
  const all: Idiom[] = [];
  for (const m of meanings ?? []) {
    for (const i of m.idioms ?? []) {
      const key = i.phrase?.trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      all.push(i);
    }
  }
  for (const i of generalIdioms ?? []) {
    const key = i.phrase?.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    all.push(i);
  }
  if (all.length === 0) return null;

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
        {all.map((id, j) => (
          <div className="wb-midiom" key={j}>
            <span className="wb-midiom-phrase">{id.phrase}</span>
            <span className="wb-midiom-sep">, </span>
            <span className="wb-midiom-meaning">{id.meaning}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── OriginCard (renamed from EtymologyCard) ───────────────────
export function OriginCard({ etymology, onReport }: { etymology: Etymology | string | undefined; onReport?: (section: string) => void }) {
  const { lang } = useLang();
  if (!etymology) return null;

  // Legacy: etymology was sometimes a free-text string. Render it as the
  // story paragraph below an empty fields block.
  const isStructured = typeof etymology === "object";
  const sourceLanguage = isStructured ? etymology.sourceLanguage?.trim() : "";
  const originalWord = isStructured ? etymology.originalWord?.trim() : "";
  const breakdown = isStructured ? etymology.breakdown?.trim() : "";
  const originalMeaning = isStructured ? etymology.originalMeaning?.trim() : "";
  const historyNote = isStructured
    ? etymology.historyNote?.trim()
    : (etymology as string).trim();

  const hasLang = !!sourceLanguage;
  const hasOriginal = !!originalWord;
  const hasBreakdown = !!breakdown;
  const hasMeant = !!originalMeaning;
  const hasStory = !!historyNote;
  if (!hasLang && !hasOriginal && !hasBreakdown && !hasMeant && !hasStory) return null;

  return (
    <div className="wb-origin-section">
      <div className="wb-eyebrow wb-eyebrow-with-flag">
        <span>
          <span className="wb-eyebrow-icon"><ScrollIcon /></span>
          {v2(lang, "wordOriginEyebrow")}
        </span>
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
              <div className="wb-origin-value">{originalMeaning}</div>
            </div>
          )}
          {hasStory && (
            <div className="wb-origin-row wb-origin-row-story">
              <div className="wb-origin-label">{v2(lang, "wordOriginBackgroundLabel")}</div>
              <div className="wb-origin-value">{historyNote}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Legacy alias for code that still imports EtymologyCard.
export function EtymologyCard({ etymology }: { etymology: Etymology | string; onReport?: () => void }) {
  return <OriginCard etymology={etymology} />;
}

// ─── VisualCard (renamed from ImageSlot) ──────────────────────
export function VisualCard({
  state,
  word,
  imageUrl,
  generating,
  onGenerate,
  onUpgrade,
  onRegenerate,
}: {
  state: "empty-clear" | "empty-locked" | "filled";
  word: string;
  imageUrl?: string;
  generating?: boolean;
  onGenerate?: () => void;
  onUpgrade?: (tab?: TabId, tier?: "clear" | "deep") => void;
  onRegenerate?: () => void;
}) {
  const { lang } = useLang();

  if (state === "filled" && imageUrl) {
    return (
      <div className="wb-card wb-visual">
        <div className="wb-eyebrow">
          <span className="wb-eyebrow-icon"><VisualEyebrowIcon /></span>
          {v2(lang, "visualEyebrow")}
        </div>
        <div className="wb-visual-filled">
          <img src={imageUrl} alt={word} />
          {onRegenerate && (
            <div className="wb-visual-overlay">
              <button type="button" onClick={onRegenerate} aria-label="Regenerate">
                <PlusIcon size={11} /> {v2(lang, "generateLabel")}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const isLocked = state === "empty-locked";
  return (
    <div className="wb-card wb-visual">
      <div className="wb-eyebrow">
        <span className="wb-eyebrow-icon"><VisualEyebrowIcon /></span>
        {v2(lang, "visualEyebrow")}
      </div>
      <div className="wb-visual-empty">
        <div className="wb-visual-art"><CrosshairIcon size={28} /></div>
        <div className="wb-visual-label">VISUAL · 1600×900</div>
        <button
          type="button"
          className="wb-visual-cta"
          onClick={isLocked ? () => onUpgrade?.("image", "clear") : onGenerate}
          disabled={generating}
        >
          <PlusIcon /> {generating ? "…" : v2(lang, "generateLabel")}
        </button>
      </div>
    </div>
  );
}

// Legacy alias.
export function ImageSlot(props: {
  state: "empty-clear" | "empty-locked" | "filled";
  word: string;
  imageUrl?: string;
  generating?: boolean;
  onGenerate?: () => void;
  onUpgrade?: (tab?: TabId, tier?: "clear" | "deep") => void;
  onRegenerate?: () => void;
  onSaveImage?: () => void;
}) {
  return <VisualCard {...props} />;
}

// ─── TakeItFurther — 4 tiles ──────────────────────────────────
export function TakeItFurther({
  onAction,
}: {
  word?: string;
  plan?: Plan;
  onAction?: (id: ActionId) => void;
}) {
  const { lang } = useLang();
  // Tier mapping matches WordClient.handleAction:
  //   compose, kids → require Clear+
  //   practice (Quiz) → requires Deep
  //   compare → free, no badge
  const tiles: {
    id: ActionId;
    title: string;
    icon: ReactNode;
    tier?: "clear" | "deep";
  }[] = [
    // Tier-ordered: Clear tiles first (rightmost in RTL / leftmost in
    // LTR), Deep tiles last. Visually groups the row by tier so the
    // user reads "what Clear gives me" → "what Deep gives me".
    { id: "kids",     title: v2(lang, "actionKidsExplanation"), icon: <TileKidsIcon />,    tier: "clear" },
    { id: "compose",  title: v2(lang, "actionCompose"),         icon: <TileComposeIcon />, tier: "clear" },
    { id: "compare",  title: v2(lang, "actionCompare"),         icon: <TileCompareIcon />, tier: "deep"  },
    { id: "practice", title: v2(lang, "actionQuiz"),            icon: <TileQuizIcon />,    tier: "deep"  },
  ];
  return (
    <div className="wb-card wb-further">
      <div className="wb-eyebrow">
        <span className="wb-eyebrow-icon"><CompassIcon /></span>
        {v2(lang, "takeItFurtherEyebrow")}
      </div>
      <div className="wb-further-grid">
        {tiles.map((t) => (
          <button
            key={t.id}
            type="button"
            className="wb-tile"
            data-action={t.id}
            onClick={() => onAction?.(t.id)}
          >
            <span className="wb-tile-icon">{t.icon}</span>
            <div className="wb-tile-title">{t.title}</div>
            {t.tier && (
              <span className="wb-tile-tier" data-tier={t.tier}>
                {t.tier === "deep" && <LockIcon size={10} />}
                {t.tier === "clear" ? "CLEAR" : "DEEP"}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Legacy no-op exports kept for import stability ───────────
export function KidsCard(_props: { kids: KidsExplanation; locked?: boolean; onUpgrade?: () => void }) {
  return null;
}
export function IdiomsCard(_props: { idioms: Idiom[]; onReport?: () => void }) {
  return null;
}

// ─── ActionBar (mobile sticky) ─────────────────────────────────
function ActionBar({
  isSaved,
  onSave,
  onShare,
}: {
  isSaved: boolean;
  onSave?: () => void;
  onShare?: () => void;
}) {
  const { lang } = useLang();
  return (
    <div className="wb-action-bar">
      <button
        type="button"
        className={`wb-save-btn ${isSaved ? "is-saved" : ""}`}
        onClick={onSave}
      >
        <BookmarkFillIcon />
        {isSaved ? v2(lang, "savedToWordBook") : v2(lang, "saveToWordBook")}
      </button>
      <button
        type="button"
        className="wb-secondary-btn"
        aria-label={v2(lang, "shareLabel")}
        onClick={onShare}
      >
        <ShareIcon />
      </button>
    </div>
  );
}

// TopbarSave used to render a Save pill + Share icon above the word.
// Removed in favor of folding Save/Share into the global wordbook
// masthead in WordClient — the floating pill above the title felt
// detached and visually noisy on cream paper.

// ─── ResultView (page composition) ─────────────────────────────
export function ResultView({
  result,
  plan,
  imageUrl,
  imageGenerating = false,
  isSaved = false,
  savedAgo,
  onSave,
  onShare,
  isPinned = false,
  onPin,
  onGenerate,
  onUpgrade,
  onRegenerate,
  onAction,
  onReport,
}: {
  result: WordResult;
  plan: Plan;
  imageUrl?: string;
  imageGenerating?: boolean;
  isSaved?: boolean;
  savedAgo?: string;
  onSave?: () => void;
  onShare?: () => void;
  isPinned?: boolean;
  onPin?: () => void;
  onGenerate?: () => void;
  onUpgrade?: (tab?: TabId, tier?: "clear" | "deep") => void;
  onRegenerate?: () => void;
  onSaveImage?: () => void;
  onAction?: (id: ActionId) => void;
  onReport?: (section: string) => void;
}) {
  const { dir } = useLang();
  // imageState retained for the legacy <VisualCard /> export; no
  // longer rendered in this ResultView since image lives inside each
  // MeaningEntry tab now. The state derivation also feeds onAction
  // for the inline image generation flow.
  void imageUrl; void plan; // silence unused warnings on the branches
  void onRegenerate;

  return (
    <div className="wordbook wb-page" dir={dir}>
      {isSaved && savedAgo && <ProgressSignal savedAgo={savedAgo} />}

      {/* WordHeader no longer renders the Save button, Gadi 2026-06-20
          moved Save to Notebook into the per-meaning action row so it
          carries Clear-tier teal colouring and reads as a feature of
          each definition. WordHeader keeps offline-pin + share. */}
      <WordHeader
        word={result.word}
        language={result.language}
        ipa={result.ipa}
        isSaved={isSaved}
        onShare={onShare}
        isPinned={isPinned}
        onPin={onPin}
      />

      <MeaningsBlock
        meanings={result.meanings ?? []}
        word={result.word}
        plan={plan}
        isSaved={isSaved}
        onSave={onSave}
        isPinned={isPinned}
        onPin={onPin}
        imageUrl={imageUrl}
        imageGenerating={imageGenerating}
        onGenerate={onGenerate}
        onUpgrade={onUpgrade}
        onAction={onAction}
        onReport={onReport}
      />

      <IdiomsSection
        meanings={result.meanings ?? []}
        generalIdioms={result.generalIdioms}
        onReport={onReport}
      />

      <OriginCard etymology={result.etymology} onReport={onReport} />
    </div>
  );
}

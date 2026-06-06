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
          {onPin && (
            <button
              type="button"
              className={`wb-word-act ${isPinned ? "is-pinned" : ""}`}
              onClick={onPin}
              title={isPinned ? v2(lang, "offlinePinnedTitle") : v2(lang, "offlinePinTitle")}
              aria-label={isPinned ? v2(lang, "offlinePinnedTitle") : v2(lang, "offlinePinTitle")}
            >
              <PinIcon size={13} filled={isPinned} />
              <span className="wb-word-act-label">
                {isPinned ? v2(lang, "offlinePinned") : v2(lang, "offlinePin")}
              </span>
            </button>
          )}
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

type TabId = "image" | "kids" | "compose" | "compare" | "quiz";

interface MeaningEntryProps {
  n: number;
  meaning: Meaning;
  plan: Plan;
  word: string;
  imageUrl?: string;
  imageGenerating?: boolean;
  onGenerate?: () => void;
  onUpgrade?: (tab?: TabId, tier?: "clear" | "deep") => void;
  onAction?: (id: ActionId) => void;
}

function tierForTab(tab: TabId): "basic" | "clear" | "deep" {
  // Image, kids, compose are Clear+ features.
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
    case "image":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <circle cx="8" cy="10" r="1.4" />
          <path d="M3 16.5l4-3.5 4 3 4-4 6 4" />
        </svg>
      );
    case "kids":
      // Child silhouette — big head (relative to body) + a small hair
      // tuft is the most universal 'kid' icon. Smiley face inside reads
      // as the warmth of the kids-explanation tone we want users to
      // associate with this tab. Avoids gender-coded markers (no
      // pigtails / bows).
      return (
        <svg {...common}>
          {/* Head — larger than the previous icon and pulled higher so
              the child-vs-adult proportion is unambiguous. */}
          <circle cx="12" cy="8" r="4" />
          {/* Hair tuft / cowlick — universal "this is a kid" cue. */}
          <path d="M11.6 4 c0.4 -1 1.2 -1 1.6 0" />
          {/* Eyes — tiny dots filled so they read at 16px without
              becoming pure noise. */}
          <circle cx="10.6" cy="7.8" r="0.55" fill="currentColor" stroke="none" />
          <circle cx="13.4" cy="7.8" r="0.55" fill="currentColor" stroke="none" />
          {/* Smile */}
          <path d="M10.8 9.5 q1.2 1.0 2.4 0" />
          {/* Compact, rounded body — short next to the big head so the
              child proportions stay legible at small sizes. */}
          <path d="M6.5 21 v-3.5 a5.5 5.5 0 0 1 11 0 v3.5" />
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
  he: { image: "תמונה",       kids: "הסבר לילדים",      compose: "חברו משפט",          quiz: "חידון",        compare: "משחקי מילים" },
  en: { image: "Image",       kids: "Kids' explanation", compose: "Compose a sentence", quiz: "Quiz",         compare: "Word games" },
  ar: { image: "صورة",        kids: "شرح للأطفال",       compose: "اكتب جملة",          quiz: "اختبار",       compare: "ألعاب كلمات" },
  ru: { image: "Картинка",     kids: "Для детей",         compose: "Составить фразу",    quiz: "Викторина",    compare: "Игры со словами" },
  es: { image: "Imagen",       kids: "Explicación niños", compose: "Componer frase",     quiz: "Quiz",         compare: "Juegos de palabras" },
  pt: { image: "Imagem",       kids: "Para crianças",     compose: "Compor frase",       quiz: "Quiz",         compare: "Jogos com palavras" },
  fr: { image: "Image",        kids: "Pour enfants",      compose: "Composer phrase",    quiz: "Quiz",         compare: "Jeux de mots" },
  de: { image: "Bild",          kids: "Für Kinder",        compose: "Satz schreiben",      quiz: "Quiz",         compare: "Wortspiele" },
  cs: { image: "Obrázek",       kids: "Pro děti",          compose: "Napsat větu",         quiz: "Kvíz",         compare: "Slovní hry" },
};
const TAB_IDS: TabId[] = ["image", "kids", "compose", "quiz", "compare"];

function MeaningEntry({
  n,
  meaning,
  plan,
  word,
  imageUrl,
  imageGenerating,
  onGenerate,
  onUpgrade,
  onAction,
}: MeaningEntryProps) {
  const { lang } = useLang();
  const tabLabels = TAB_LABELS[lang] ?? TAB_LABELS.en;
  // image + kids + compare render inline; compose + quiz fire modals.
  const [openTab, setOpenTab] = useState<"image" | "kids" | "compare" | null>(null);

  function handleTabClick(tab: TabId) {
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
    if (tab === "compare") {
      setOpenTab(openTab === "compare" ? null : "compare");
      return;
    }
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
      nav.share({ title: `Gadit — ${word}`, text, url }).catch(() => undefined);
    } else {
      nav.clipboard?.writeText(url).catch(() => undefined);
    }
  }

  return (
    <div className="wb-mcard">
      <div className="wb-mcard-head">
        <button
          type="button"
          className="wb-mcard-share"
          aria-label={v2(lang, "shareDefinitionAria")}
          onClick={handleShareMeaning}
        >
          <ShareIcon size={14} />
        </button>
      </div>

      {meaning.meaning && (
        <div className="wb-mdef-row">
          <span className="wb-mnum">{n}</span>
          <span className="wb-mdef">{meaning.meaning}</span>
        </div>
      )}

      {(meaning.examples ?? []).length > 0 && (
        <div className="wb-mexamples">
          {(meaning.examples ?? []).map((ex, j) => (
            <div className="wb-mexample" key={j}>{ex}</div>
          ))}
        </div>
      )}

      {/* Idioms have moved OUT of the meaning card. They render as
          a standalone section after all meanings, before Word Origin
          (Gadi product decision — keeps the card focused on the
          definition itself, gives idioms their own breathing room). */}

      {/* Tab row */}
      <div className="wb-mtabs">
        {TAB_IDS.map((id) => {
          const unlocked = tabUnlocked(id, plan);
          const isOpen = openTab === id;
          return (
            <button
              key={id}
              type="button"
              className={`wb-mtab${isOpen ? " is-open" : ""}${unlocked ? "" : " is-locked"}`}
              data-tier={tierForTab(id)}
              onClick={() => handleTabClick(id)}
              aria-pressed={isOpen}
              title={tabLabels[id]}
              aria-label={tabLabels[id]}
            >
              <span className="wb-mtab-icon"><TabIcon name={id} /></span>
              <span className="wb-mtab-label">{tabLabels[id]}</span>
              {!unlocked && (
                <span className="wb-mtab-lock"><LockIcon size={10} /></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Inline content panel */}
      {openTab === "image" && (
        <div className="wb-mpanel">
          {imageUrl ? (
            <div className="wb-mpanel-image">
              <img src={imageUrl} alt="" />
            </div>
          ) : (
            <div className="wb-mpanel-empty">
              <div className="wb-visual-art"><CrosshairIcon size={28} /></div>
              <div className="wb-visual-label">{v2(lang, "imageGeneratingLabel")}</div>
              <div className="wb-loader-dots" aria-hidden="true">
                <span /><span /><span />
              </div>
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

      {openTab === "compare" && (
        <div className="wb-mpanel">
          <div className="wb-kids-body">
            {v2(lang, "compareComingSoon")}
          </div>
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
  imageUrl,
  imageGenerating,
  onGenerate,
  onUpgrade,
  onAction,
}: {
  meanings: Meaning[];
  word?: string;
  plan?: Plan;
  imageUrl?: string;
  imageGenerating?: boolean;
  onGenerate?: () => void;
  onUpgrade?: (tab?: TabId, tier?: "clear" | "deep") => void;
  onAction?: (id: ActionId) => void;
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
            imageUrl={imageUrl}
            imageGenerating={imageGenerating}
            onGenerate={onGenerate}
            onUpgrade={onUpgrade}
            onAction={onAction}
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
}: {
  meanings: Meaning[];
  generalIdioms?: Idiom[];
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
      <div className="wb-eyebrow">
        <span>{v2(lang, "idiomsEyebrow")}</span>
      </div>
      <div className="wb-card wb-idioms-card">
        {all.map((id, j) => (
          <div className="wb-midiom" key={j}>
            <span className="wb-midiom-phrase">{id.phrase}</span>
            <span className="wb-midiom-sep"> — </span>
            <span className="wb-midiom-meaning">{id.meaning}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── OriginCard (renamed from EtymologyCard) ───────────────────
export function OriginCard({ etymology }: { etymology: Etymology | string | undefined }) {
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
      <div className="wb-eyebrow">
        <span className="wb-eyebrow-icon"><ScrollIcon /></span>
        {v2(lang, "wordOriginEyebrow")}
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

      <WordHeader
        word={result.word}
        language={result.language}
        ipa={result.ipa}
        isSaved={isSaved}
        onSave={onSave}
        onShare={onShare}
        isPinned={isPinned}
        onPin={onPin}
      />

      <MeaningsBlock
        meanings={result.meanings ?? []}
        word={result.word}
        plan={plan}
        imageUrl={imageUrl}
        imageGenerating={imageGenerating}
        onGenerate={onGenerate}
        onUpgrade={onUpgrade}
        onAction={onAction}
      />

      <IdiomsSection
        meanings={result.meanings ?? []}
        generalIdioms={result.generalIdioms}
      />

      <OriginCard etymology={result.etymology} />
    </div>
  );
}

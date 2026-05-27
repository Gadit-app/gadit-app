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
function langMatchesUi(language: string, lang: Lang): boolean {
  const names: Record<string, string[]> = {
    en: ["english"],
    he: ["hebrew", "עברית"],
    ar: ["arabic", "العربية"],
    ru: ["russian", "русский"],
    es: ["spanish", "español"],
    pt: ["portuguese", "português"],
    fr: ["french", "français"],
  };
  const langName = (language || "").toLowerCase().trim();
  if (!langName) return true;
  return (names[lang] ?? []).some((n) => langName.includes(n));
}

// ─── Multi-coloured illustration icons ─────────────────────────
// Each icon is a self-contained mini-illustration with 2-4 explicit
// colours — designed to read as a drawing, not an outline.
// Per-section colour identity is carried by these colours (they're
// hardcoded inside each SVG); the surrounding eyebrow-icon `color:`
// rule no longer controls them. Gives a richer, more "alive" feel.

// Definitions — open book with bookmark + sparkle
function BookIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none">
      <path
        d="M4 7c0-.8 2.5-1.5 10-.3C21.5 5.5 24 6.2 24 7v14c0 .8-2.5 1.5-10 .3-7.5 1.2-10 .5-10-.3V7z"
        fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5" strokeLinejoin="round"
      />
      <path d="M14 6.7v15" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 11h4M7 13h4M7 15h3" stroke="#60A5FA" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M17 11h4M17 13h4M17 15h3" stroke="#60A5FA" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M19 5v6l1.5-1.5L22 11V5z" fill="#F59E0B" stroke="#B45309" strokeWidth="0.9" strokeLinejoin="round" />
      <path d="M6 3.5l.5 1.2 1.2.5-1.2.5L6 7l-.5-1.3L4.3 5.2l1.2-.5z" fill="#FBBF24" />
    </svg>
  );
}

// Word Origin — ancient scroll with wax seal + quill
function ScrollIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none">
      <path d="M5 6.5C5 5 7 4.5 9 5h12c-1 .5-1 1.5-1 2.5v13c0 1-.5 1.5-1.5 1.5H8c-2 0-3-1-3-2.5V6.5z"
        fill="#FED7AA" stroke="#C2410C" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5 6.5c0 1.5 1 2.5 2 2.5h11c1 0 1.5-.5 1.5-1.5V6c0-1 .5-1.5 1.5-1.5"
        stroke="#9A3412" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M9 12h7M9 15h6M9 18h5" stroke="#C2410C" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
      <circle cx="20" cy="20" r="2.6" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1" />
      <path d="M18.7 18.7l2.6 2.6M21.3 18.7l-2.6 2.6" stroke="#FCA5A5" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

// Visual — photo frame with mountain scene + sun
function VisualEyebrowIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none">
      <rect x="3.5" y="5" width="21" height="17" rx="2.5" fill="#FCE7F3" stroke="#EC4899" strokeWidth="1.5" />
      <rect x="5.5" y="7" width="17" height="13" rx="1.2" fill="#FFFFFF" />
      <path d="M5.5 17l4-4.5 3.5 3 3-2.5 6.5 6.5v.5H5.5z" fill="#10B981" />
      <path d="M5.5 17l4-4.5 3.5 3 3-2.5 6.5 6.5"
        stroke="#047857" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
      <circle cx="17" cy="11" r="2" fill="#FBBF24" stroke="#D97706" strokeWidth="0.9" />
      <path d="M17 7.5v1.5M17 13v1.5M20.5 11h-1.5M15 11h-1.5"
        stroke="#FBBF24" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

// Take it further — compass with red/white needle + golden ring
function CompassIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="10" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.5" />
      <circle cx="14" cy="14" r="7.5" fill="#FFFFFF" stroke="#A78BFA" strokeWidth="1" />
      {/* North needle (red) */}
      <path d="M14 7.5L15.6 14L14 14.5L12.4 14z" fill="#EF4444" />
      {/* South needle (white) */}
      <path d="M14 20.5L15.6 14L14 13.5L12.4 14z" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="0.6" />
      <circle cx="14" cy="14" r="1.3" fill="#7C3AED" />
      {/* N marker */}
      <text x="14" y="6.5" fill="#7C3AED" fontSize="3.2" fontWeight="700" textAnchor="middle">N</text>
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
function PlusIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

// Tile icons — full-colour mini illustrations, each with its own
// 3-4 colour palette so they read as little drawings on the white tile.

// Compose — yellow notepad with blue lines + a real pencil
function TileComposeIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none">
      {/* notepad */}
      <rect x="4" y="5" width="16" height="22" rx="2.5" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.5" />
      {/* spiral binding */}
      <path d="M6 5v-1.5M9 5v-1.5M12 5v-1.5M15 5v-1.5M18 5v-1.5"
        stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
      {/* lines */}
      <path d="M7 11h10M7 14h10M7 17h7"
        stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" />
      {/* pencil body */}
      <path d="M21 12l5 5-3 3-5-5z" fill="#FBBF24" stroke="#92400E" strokeWidth="1.2" strokeLinejoin="round" />
      {/* eraser */}
      <path d="M19.5 13.5l-1.5 1.5-1-1 1.5-1.5z" fill="#FB7185" stroke="#9F1239" strokeWidth="1" />
      {/* tip */}
      <path d="M26 17l2 2-1.5 1.5-2-2z" fill="#1F2937" stroke="#000" strokeWidth="0.8" />
    </svg>
  );
}

// Quiz — yellow speech bubble with a colourful question mark
function TileQuizIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none">
      {/* bubble */}
      <path
        d="M5 9a3 3 0 0 1 3-3h16a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-7l-4 5v-5H8a3 3 0 0 1-3-3V9z"
        fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* question mark stroke */}
      <path d="M12 12a4 4 0 1 1 5 3.8c-.6.2-1 .7-1 1.3v.4"
        fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" />
      {/* question dot */}
      <circle cx="16" cy="20" r="1.3" fill="#DC2626" />
      {/* sparkle */}
      <path d="M25 6l.5 1.2 1.2.5-1.2.5L25 9.5l-.5-1.3-1.2-.5 1.2-.5z" fill="#FBBF24" />
    </svg>
  );
}

// Compare — two cards side by side with arrows between them
function TileCompareIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none">
      {/* left card */}
      <rect x="3" y="5" width="10" height="22" rx="2" fill="#D1FAE5" stroke="#047857" strokeWidth="1.5" />
      <path d="M5.5 10h5M5.5 13h5M5.5 16h3" stroke="#047857" strokeWidth="1.2" strokeLinecap="round" />
      {/* right card */}
      <rect x="19" y="5" width="10" height="22" rx="2" fill="#FEE2E2" stroke="#B91C1C" strokeWidth="1.5" />
      <path d="M21.5 10h5M21.5 13h5M21.5 16h3" stroke="#B91C1C" strokeWidth="1.2" strokeLinecap="round" />
      {/* arrows */}
      <path d="M14 13l2 1.5-2 1.5M18 13l-2 1.5 2 1.5M14 19l2 1.5-2 1.5M18 19l-2 1.5 2 1.5"
        stroke="#0F766E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// Kids — friendly smiling sun face
function TileKidsIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none">
      {/* sun rays */}
      <g stroke="#FBBF24" strokeWidth="2" strokeLinecap="round">
        <path d="M16 2v3M16 27v3M2 16h3M27 16h3M6 6l2 2M24 24l2 2M6 26l2-2M24 8l2-2" />
      </g>
      {/* face circle */}
      <circle cx="16" cy="16" r="8" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" />
      {/* cheeks */}
      <circle cx="11" cy="17" r="1.4" fill="#F9A8D4" opacity="0.85" />
      <circle cx="21" cy="17" r="1.4" fill="#F9A8D4" opacity="0.85" />
      {/* eyes */}
      <circle cx="13" cy="14.5" r="1" fill="#1F2937" />
      <circle cx="19" cy="14.5" r="1" fill="#1F2937" />
      {/* tiny eye highlights */}
      <circle cx="13.3" cy="14.2" r="0.35" fill="#FFFFFF" />
      <circle cx="19.3" cy="14.2" r="0.35" fill="#FFFFFF" />
      {/* smile */}
      <path d="M12 18.5c1 1.6 2.4 2.5 4 2.5s3-.9 4-2.5"
        fill="none" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
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
}) {
  const { lang } = useLang();
  const showLang = !langMatchesUi(language, lang);
  // word-meta: "pos · language" — both italicized in Latin, plain in HE/AR.
  // Hide entire row if neither is shown.
  const showMeta = !!pos || showLang;
  return (
    <div className="wb-word-head">
      {showMeta && (
        <div className="wb-word-meta">
          {pos && <em>{pos}</em>}
          {pos && showLang && <span className="wb-meta-dot" />}
          {showLang && <span>{language}</span>}
        </div>
      )}
      <h1 className="wb-word-title">{word}</h1>
      {(onSave || onShare) && (
        <div className="wb-word-actions">
          {onSave && (
            <button
              type="button"
              className={`wb-word-act ${isSaved ? "is-saved" : ""}`}
              onClick={onSave}
            >
              <BookmarkFillIcon size={13} />
              {isSaved ? v2(lang, "savedToWordBook") : v2(lang, "saveToWordBook")}
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

// ─── MeaningsBlock ─────────────────────────────────────────────
export function MeaningsBlock({ meanings }: { meanings: Meaning[] }) {
  const { lang } = useLang();
  if (!meanings || meanings.length === 0) return null;
  return (
    <div className="wb-meanings">
      <div className="wb-eyebrow">
        <span className="wb-eyebrow-icon"><BookIcon /></span>
        {v2(lang, "meaningsEyebrow")}
        <span className="wb-eyebrow-count">{meanings.length}</span>
      </div>
      {meanings.map((m, i) => (
        <div className="wb-meaning-row" key={i}>
          <div className="wb-meaning-num">{i + 1}</div>
          <div className="wb-meaning-body">
            {m.meaning && <div className="wb-meaning-def">{m.meaning}</div>}
            {(m.examples ?? []).map((ex, j) => (
              <div className="wb-meaning-ex" key={j}>{ex}</div>
            ))}
          </div>
        </div>
      ))}
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

// ─── OriginCard (renamed from EtymologyCard) ───────────────────
export function OriginCard({ etymology }: { etymology: Etymology | string | undefined }) {
  const { lang } = useLang();
  if (!etymology) return null;

  // Legacy: etymology was sometimes a free-text string. Render it as the
  // story paragraph below an empty fields block.
  const isStructured = typeof etymology === "object";
  const sourceLanguage = isStructured ? etymology.sourceLanguage?.trim() : "";
  const originalMeaning = isStructured ? etymology.originalMeaning?.trim() : "";
  const historyNote = isStructured
    ? etymology.historyNote?.trim()
    : (etymology as string).trim();

  const hasLang = !!sourceLanguage;
  const hasMeant = !!originalMeaning;
  const hasStory = !!historyNote;
  if (!hasLang && !hasMeant && !hasStory) return null;

  return (
    <div className="wb-card wb-origin">
      <div className="wb-eyebrow">
        <span className="wb-eyebrow-icon"><ScrollIcon /></span>
        {v2(lang, "wordOriginEyebrow")}
      </div>
      {(hasLang || hasMeant) && (
        <div className="wb-origin-fields">
          {hasLang && (
            <div className="wb-origin-row">
              <div className="wb-origin-label">{v2(lang, "wordOriginLanguage")}</div>
              <div className="wb-origin-value">{sourceLanguage}</div>
            </div>
          )}
          {hasMeant && (
            <div className="wb-origin-row">
              <div className="wb-origin-label">{v2(lang, "wordOriginOriginallyMeant")}</div>
              <div className="wb-origin-value">{originalMeaning}</div>
            </div>
          )}
        </div>
      )}
      {hasStory && <p className="wb-origin-story">{historyNote}</p>}
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
  onUpgrade?: () => void;
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
        <button
          type="button"
          className="wb-visual-cta"
          onClick={isLocked ? onUpgrade : onGenerate}
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
  onUpgrade?: () => void;
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
                {t.tier === "clear" ? "Clear" : "Deep"}
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
  onGenerate?: () => void;
  onUpgrade?: () => void;
  onRegenerate?: () => void;
  onSaveImage?: () => void;
  onAction?: (id: ActionId) => void;
  onReport?: (section: string) => void;
}) {
  const { dir } = useLang();
  const imageState: "empty-clear" | "empty-locked" | "filled" = imageUrl
    ? "filled"
    : plan === "basic"
      ? "empty-locked"
      : "empty-clear";

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
      />

      <MeaningsBlock meanings={result.meanings ?? []} />

      <OriginCard etymology={result.etymology} />

      <VisualCard
        state={imageState}
        word={result.word}
        imageUrl={imageUrl}
        generating={imageGenerating}
        onGenerate={onGenerate}
        onUpgrade={onUpgrade}
        onRegenerate={onRegenerate}
      />

      <TakeItFurther onAction={onAction} />

      <ActionBar isSaved={isSaved} onSave={onSave} onShare={onShare} />
    </div>
  );
}

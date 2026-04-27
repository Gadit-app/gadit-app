"use client";

/**
 * NotebookV2 — Screen 8 from the redesign pass.
 *
 * The personal vocabulary library and the brand differentiator. Two
 * views share the same data:
 *   • List — practical, default, 3-column grid of word cards.
 *   • Galaxy — atmospheric. Each saved word is a star, scattered
 *     deterministically by hash so the same word always lands in the
 *     same place. Click a star → opens the word at /word/[word].
 *
 * Schema: /api/notebook returns { items: [{ id, word, language,
 * meaning, addedAt, nextReviewAt, intervalDays?, timesReviewed?,
 * timesCorrect? }] }. We derive:
 *   - mastery (0..3) from timesCorrect: 0 → 0, 1-2 → 1, 3-4 → 2, 5+ → 3
 *   - recent (≤24h) from addedAt
 *   - faded (>30d since addedAt) for stale entries
 *   - reviewQueue count = items where nextReviewAt <= now
 *
 * Tier gating: Notebook is Deep-only. Page wrapper handles the gate
 * (redirects to /pricing if not Deep). This component assumes
 * the user is authorized.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { Eyebrow } from "./primitives";

type Script = "latin" | "he" | "ar";
function scriptFor(lang: string): Script {
  if (lang === "he") return "he";
  if (lang === "ar") return "ar";
  return "latin";
}
function fontDisplay(s: Script) {
  return s === "he"
    ? "gd-font-he"
    : s === "ar"
      ? "gd-font-ar"
      : "gd-font-display";
}
function fontBody(s: Script) {
  return s === "he"
    ? "gd-font-he gd-rtl-body"
    : s === "ar"
      ? "gd-font-ar gd-rtl-body"
      : "gd-font-display";
}

interface NotebookItem {
  id: string;
  word: string;
  language: string;
  meaning: string;
  addedAt: string;
  nextReviewAt?: string;
  timesReviewed?: number;
  timesCorrect?: number;
}

interface DerivedItem extends NotebookItem {
  mastery: 0 | 1 | 2 | 3;
  recent: boolean; // saved < 24h ago
  faded: boolean; // > 30d since addedAt with no recent review
  due: boolean;
  savedDisplay: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function deriveItem(it: NotebookItem, lang: string): DerivedItem {
  const correct = it.timesCorrect ?? 0;
  const mastery: 0 | 1 | 2 | 3 =
    correct === 0 ? 0 : correct < 3 ? 1 : correct < 5 ? 2 : 3;

  const addedAt = new Date(it.addedAt);
  const ageMs = Date.now() - addedAt.getTime();
  const recent = ageMs < MS_PER_DAY;
  const faded = ageMs > 30 * MS_PER_DAY && (it.timesReviewed ?? 0) === 0;

  const now = new Date();
  const due = it.nextReviewAt ? new Date(it.nextReviewAt) <= now : false;

  // Locale-aware short date ("Apr 22", "22 באפריל", "22 أبريل").
  // Intl handles the formatting; we just pick the right locale string.
  const localeId = lang === "he" ? "he-IL" : lang === "ar" ? "ar" : "en-US";
  let savedDisplay: string;
  try {
    savedDisplay = new Intl.DateTimeFormat(localeId, {
      month: "short",
      day: "numeric",
    }).format(addedAt);
  } catch {
    savedDisplay = it.addedAt.slice(0, 10);
  }

  return { ...it, mastery, recent, faded, due, savedDisplay };
}

// ─── Deterministic hash → 0..1 (for star scatter) ────────────
function hash01(str: string, salt = 0): number {
  let h = 5381 ^ salt;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return ((h >>> 0) % 10000) / 10000;
}

// ─── View toggle pill ──────────────────────────────────────
function ViewToggle({
  view,
  onChange,
}: {
  view: "list" | "galaxy";
  onChange: (v: "list" | "galaxy") => void;
}) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";

  const items = [
    {
      id: "list" as const,
      label: v2(lang, "notebookListView"),
      icon: (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 3.5h7M2.5 6h7M2.5 8.5h7"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: "galaxy" as const,
      label: v2(lang, "notebookGalaxyView"),
      icon: (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="1.2" fill="currentColor" />
          <circle cx="2" cy="3" r="0.7" fill="currentColor" opacity="0.6" />
          <circle cx="10" cy="4" r="0.7" fill="currentColor" opacity="0.6" />
          <circle cx="3" cy="9" r="0.7" fill="currentColor" opacity="0.6" />
          <circle cx="9.5" cy="9" r="0.7" fill="currentColor" opacity="0.6" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={`inline-flex items-center gap-1 `}
      style={{
        padding: 4,
        borderRadius: 12,
        background: "oklch(1 0 0 / 0.05)",
        boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.08)",
      }}
    >
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={() => onChange(it.id)}
          className="gd-font-sans-ui font-medium transition-colors"
          style={{
            fontSize: 13,
            padding: "7px 16px",
            borderRadius: 9,
            color: view === it.id ? "oklch(0.18 0.04 265)" : "oklch(0.85 0.02 265)",
            background: view === it.id ? "oklch(0.97 0.01 265)" : "transparent",
            boxShadow:
              view === it.id ? "0 2px 6px oklch(0 0 0 / 0.2)" : "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
          }}
          aria-pressed={view === it.id}
        >
          {it.icon}
          {it.label}
        </button>
      ))}
    </div>
  );
}

// ─── Word card (List view) ─────────────────────────────────
function WordCard({
  entry,
  onClick,
  onRemove,
}: {
  entry: DerivedItem;
  onClick: () => void;
  onRemove: () => void;
}) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);

  const langLabel =
    entry.language || (script === "he" ? "עברית" : script === "ar" ? "العربية" : "English");

  return (
    <div
      onClick={onClick}
      className="gd-card relative cursor-pointer transition-transform hover:translate-y-[-2px]"
      style={{
        padding: "clamp(20px, 2.4vw, 24px) clamp(22px, 2.6vw, 26px)",
        textAlign: isRtl ? "right" : "left",
        opacity: entry.faded ? 0.7 : 1,
      }}
    >
      <div
        className={`flex items-baseline  justify-between`}
      >
        <h3
          className={fontDisplay(script)}
          style={{
            fontSize: "clamp(28px, 3.2vw, 32px)",
            color: "oklch(0.5 0.18 250)",
            lineHeight: 1.1,
            ...(script === "latin"
              ? {
                  fontVariationSettings: '"opsz" 60',
                  fontWeight: 400,
                  fontStyle: "italic",
                  letterSpacing: "-0.015em",
                }
              : {}),
          }}
        >
          {entry.word}
        </h3>
      </div>
      <div
        className={`mt-2 flex items-center gap-2 `}
      >
        <span
          className="gd-font-sans-ui"
          style={{
            fontSize: 10.5,
            color: "var(--gd-ink-500)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 600,
            padding: "2px 7px",
            borderRadius: 4,
            background: "oklch(0.92 0.01 80)",
          }}
        >
          {langLabel}
        </span>
        <span
          className="gd-font-sans-ui"
          style={{ fontSize: 11, color: "var(--gd-ink-300)" }}
        >
          ·
        </span>
        <span
          className="gd-font-sans-ui"
          style={{
            fontSize: 11,
            color: "var(--gd-ink-500)",
            fontStyle: "italic",
          }}
        >
          {entry.savedDisplay}
        </span>
      </div>
      <p
        className={`mt-3 ${fontBody(script)}`}
        style={{
          fontSize: "clamp(14px, 1.4vw, 14.5px)",
          lineHeight: 1.45,
          color: "var(--gd-ink-700)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          ...(script === "latin"
            ? { fontVariationSettings: '"opsz" 22' }
            : {}),
        }}
      >
        {entry.meaning}
      </p>
      {/* mastery dots */}
      <div
        className={`mt-4 flex items-center gap-1.5 `}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: 999,
              background:
                i < entry.mastery
                  ? "oklch(0.5 0.18 250)"
                  : "oklch(0 0 0 / 0.1)",
            }}
          />
        ))}
        {entry.mastery >= 3 && (
          <span
            className="gd-font-sans-ui"
            style={{
              fontSize: 9.5,
              color: "oklch(0.5 0.18 250)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 600,
              marginInlineStart: 4,
            }}
          >
            {v2(lang, "notebookMasteredLabel")}
          </span>
        )}
      </div>
      {/* remove */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label={v2(lang, "notebookRemoveAria")}
        style={{
          position: "absolute",
          insetBlockStart: 6,
          insetInlineEnd: 6,
          // 36×36 hit area — visible icon stays small (10×10 SVG) but
          // the tap target meets thumb-friendliness on mobile.
          width: 36,
          height: 36,
          borderRadius: 999,
          color: "var(--gd-ink-500)",
          background: "oklch(0 0 0 / 0.04)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.5,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path
            d="M3 3l6 6M9 3l-6 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────
function EmptyState() {
  const { lang } = useLang();
  const router = useRouter();
  const script = scriptFor(lang);

  return (
    <div
      style={{
        paddingBlock: "clamp(60px, 10vw, 100px)",
        textAlign: "center",
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        style={{
          color: "oklch(0.45 0.05 265)",
          margin: "0 auto",
          opacity: 0.6,
        }}
      >
        <rect
          x="9"
          y="6"
          width="30"
          height="36"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M14 14h20M14 20h20M14 26h13"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <h2
        className={fontDisplay(script)}
        style={{
          marginTop: 24,
          fontSize: "clamp(26px, 3.4vw, 36px)",
          color: "oklch(0.92 0.01 265)",
          ...(script === "latin"
            ? {
                fontVariationSettings: '"opsz" 60',
                fontStyle: "italic",
              }
            : {}),
        }}
      >
        {v2(lang, "notebookEmptyTitle")}
      </h2>
      <button
        type="button"
        onClick={() => router.push("/")}
        className="mt-6 gd-font-sans-ui font-medium"
        style={{
          fontSize: 14,
          padding: "12px 22px",
          borderRadius: 12,
          color: "white",
          background:
            "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
          boxShadow:
            "0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)",
        }}
      >
        {v2(lang, "notebookEmptyCta")}
      </button>
    </div>
  );
}

// ─── Galaxy view ────────────────────────────────────────────
function GalaxyView({
  entries,
  onWordClick,
}: {
  entries: DerivedItem[];
  onWordClick: (entry: DerivedItem) => void;
}) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);

  // Stage dimensions — fixed viewBox, scales with width via SVG
  const W = 1080;
  const H = 540;

  const ambient = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        x: hash01("ambient" + i, 1) * W,
        y: hash01("ambient" + i, 2) * H,
        r: 0.4 + hash01("ambient" + i, 3) * 0.9,
        op: 0.18 + hash01("ambient" + i, 4) * 0.4,
      })),
    []
  );

  const padX = 90;
  const padY = 60;
  const stars = useMemo(
    () =>
      entries.map((entry) => {
        const x = padX + hash01(entry.word, 7) * (W - padX * 2);
        const y = padY + hash01(entry.word, 11) * (H - padY * 2);
        return { ...entry, x, y };
      }),
    [entries]
  );

  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const tooltipStar = stars.find((s) => s.word === hoveredWord);

  return (
    <div
      className="relative"
      style={{
        width: "100%",
        aspectRatio: `${W} / ${H}`,
        borderRadius: 18,
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at 50% 30%, oklch(0.22 0.07 260 / 0.9), oklch(0.14 0.04 265 / 0.95) 70%)",
        boxShadow:
          "inset 0 0 0 1px oklch(1 0 0 / 0.08), inset 0 0 80px oklch(0 0 0 / 0.5)",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <radialGradient id="gd-star-glow" cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              stopColor="oklch(0.95 0.05 245)"
              stopOpacity="1"
            />
            <stop
              offset="40%"
              stopColor="oklch(0.72 0.19 245)"
              stopOpacity="0.5"
            />
            <stop
              offset="100%"
              stopColor="oklch(0.5 0.2 250)"
              stopOpacity="0"
            />
          </radialGradient>
          <radialGradient id="gd-star-dim" cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              stopColor="oklch(0.85 0.02 265)"
              stopOpacity="0.7"
            />
            <stop
              offset="100%"
              stopColor="oklch(0.5 0.05 265)"
              stopOpacity="0"
            />
          </radialGradient>
        </defs>
        {ambient.map((s, i) => (
          <circle
            key={"a" + i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="white"
            opacity={s.op}
          />
        ))}
        {stars.map((s) => {
          const isMastered = s.mastery >= 3;
          const isFaded = s.faded;
          const baseR = isMastered ? 4 : 3;
          const glowR = isMastered ? 22 : s.recent ? 18 : 14;
          const opacity = isFaded ? 0.4 : 1;
          return (
            <g
              key={s.id}
              opacity={opacity}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredWord(s.word)}
              onMouseLeave={() => setHoveredWord(null)}
              onClick={() => onWordClick(s)}
            >
              <circle
                cx={s.x}
                cy={s.y}
                r={glowR}
                fill={isFaded ? "url(#gd-star-dim)" : "url(#gd-star-glow)"}
              />
              <circle
                cx={s.x}
                cy={s.y}
                r={baseR}
                fill={isFaded ? "oklch(0.7 0.02 265)" : "oklch(0.97 0.02 245)"}
              />
              {s.recent && (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={baseR + 4}
                  fill="none"
                  stroke="oklch(0.82 0.1 245)"
                  strokeWidth="1"
                  opacity="0.45"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip — positioned in % so it scales with the responsive SVG.
          Flips horizontally based on which half the star sits in, so the
          tooltip never extends past the parent's overflow:hidden edge. */}
      {tooltipStar && (() => {
        const isRightHalf = tooltipStar.x > W / 2;
        // In LTR: right-half stars get tooltip to the LEFT of the star
        //         (translate -100% - 14px). Left-half: 14px right.
        // In RTL: mirror the logic.
        const tx = isRtl
          ? isRightHalf
            ? "14px"
            : "calc(-100% - 14px)"
          : isRightHalf
            ? "calc(-100% - 14px)"
            : "14px";
        return (
        <div
          style={{
            position: "absolute",
            left: `${(tooltipStar.x / W) * 100}%`,
            top: `${(tooltipStar.y / H) * 100}%`,
            transform: `translate(${tx}, -56px)`,
            width: 200,
            maxWidth: "calc(100vw - 32px)",
            padding: "12px 14px",
            borderRadius: 10,
            background: "oklch(0.97 0.01 265 / 0.97)",
            boxShadow:
              "0 12px 30px oklch(0 0 0 / 0.5), inset 0 0 0 1px oklch(0 0 0 / 0.08)",
            backdropFilter: "blur(8px)",
            textAlign: isRtl ? "right" : "left",
            zIndex: 3,
            pointerEvents: "none",
          }}
          dir={dir}
        >
          <div
            className={fontDisplay(script)}
            style={{
              fontSize: 22,
              color: "oklch(0.5 0.18 250)",
              lineHeight: 1.1,
              ...(script === "latin"
                ? {
                    fontVariationSettings: '"opsz" 32',
                    fontStyle: "italic",
                    fontWeight: 400,
                  }
                : {}),
            }}
          >
            {tooltipStar.word}
          </div>
          <div
            className="gd-font-sans-ui mt-1"
            style={{
              fontSize: 11,
              color: "var(--gd-ink-500)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {v2(lang, "notebookSavedOnTemplate", tooltipStar.savedDisplay)}
          </div>
        </div>
        );
      })()}

      {/* Legend — hidden below 480px since the chips push past the
          galaxy boundary on narrow screens; the dot sizes are small
          enough that most users intuit the recency mapping anyway. */}
      <div
        className={`absolute gd-font-sans-ui hidden sm:flex `}
        style={{
          insetBlockEnd: 16,
          insetInlineStart: 16,
          alignItems: "center",
          gap: 16,
          fontSize: 11,
          color: "oklch(0.65 0.03 265)",
          padding: "8px 14px",
          borderRadius: 999,
          background: "oklch(0.1 0.04 265 / 0.6)",
          boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.06)",
          flexWrap: "wrap",
        }}
      >
        <span className="inline-flex items-center gap-2">
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "oklch(0.97 0.02 245)",
              boxShadow: "0 0 6px oklch(0.72 0.19 245 / 0.6)",
            }}
          />
          {v2(lang, "notebookLegendRecent")}
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: "oklch(0.97 0.02 245)",
              boxShadow: "0 0 12px oklch(0.72 0.19 245 / 0.9)",
            }}
          />
          {v2(lang, "notebookLegendMastered")}
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "oklch(0.7 0.02 265 / 0.5)",
            }}
          />
          {v2(lang, "notebookLegendNeedsReview")}
        </span>
      </div>
    </div>
  );
}

// ─── Main NotebookV2 ────────────────────────────────────────
export function NotebookV2() {
  const { user } = useAuth();
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);
  const router = useRouter();

  const [items, setItems] = useState<NotebookItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "galaxy">("list");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/notebook", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) {
          if (res.status === 402) {
            router.push("/pricing");
            return;
          }
          if (cancelled) return;
          setItems([]);
          return;
        }
        const data = (await res.json()) as { items: NotebookItem[] };
        if (!cancelled) setItems(data.items ?? []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [user, router]);

  const derived = useMemo(
    () => (items ? items.map((it) => deriveItem(it, lang)) : []),
    [items, lang]
  );
  const total = derived.length;
  const reviewQueue = derived.filter((d) => d.due).length;
  const isEmpty = !loading && total === 0;

  async function handleRemove(id: string) {
    if (!user) return;
    setItems((prev) => (prev ?? []).filter((it) => it.id !== id));
    try {
      const idToken = await user.getIdToken();
      await fetch(`/api/notebook?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
    } catch {
      // optimistic update already applied; if delete fails server-side
      // the item will reappear next page load.
    }
  }

  function handleWordClick(entry: DerivedItem) {
    router.push(`/word/${encodeURIComponent(entry.word)}`);
  }

  return (
    <div
      style={{
        paddingInline: "clamp(16px, 3vw, 28px)",
        paddingBlockEnd: 60,
      }}
    >
      {/* Hero */}
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          paddingBlockStart: "clamp(32px, 5vw, 56px)",
          textAlign: isRtl ? "right" : "left",
        }}
      >
        <Eyebrow style={{ color: "oklch(0.82 0.1 245)" }}>
          {v2(lang, "notebookEyebrow")}
        </Eyebrow>
        <h1
          className={fontDisplay(script)}
          style={{
            marginTop: 8,
            fontSize: "clamp(36px, 5.5vw, 56px)",
            lineHeight: 1.05,
            color: "oklch(0.97 0.008 265)",
            ...(script === "latin"
              ? {
                  fontVariationSettings: '"opsz" 144, "SOFT" 80',
                  fontWeight: 400,
                  letterSpacing: "-0.025em",
                }
              : {}),
          }}
        >
          {v2(lang, "notebookTitle")}
        </h1>
        <p
          className="mt-3 gd-font-sans-ui"
          style={{
            fontSize: "clamp(15px, 1.6vw, 17px)",
            lineHeight: 1.55,
            color: "oklch(0.72 0.02 265)",
            maxWidth: 640,
          }}
        >
          {v2(lang, "notebookSubtitle")}
        </p>

        {/* Counter + practice CTA.
            The counter splits into two layers: a giant numeral (display
            font, ~96px) and a regular-sized label below it. This reads
            cleanly in every script — Latin display fonts handle big
            digits beautifully, but rendering an entire Hebrew/Arabic
            sentence at 96px (as the previous version did) made the line
            blow past the hero's width and look visually unbalanced. */}
        {!isEmpty && !loading && (
          // The flex row inherits direction from <html dir>, so in RTL
          // the children naturally flow right-to-left without
          // `flex-row-reverse` (which on top of dir="rtl" would
          // double-flip and push the whole group to the visual left
          // edge — opposite of what we want).
          <div className="mt-8 flex items-end gap-6 flex-wrap">
            <div style={{ textAlign: isRtl ? "right" : "left" }}>
              <div
                className="gd-font-display"
                style={{
                  fontSize: "clamp(64px, 9vw, 96px)",
                  lineHeight: 1,
                  color: "oklch(0.97 0.008 265)",
                  fontVariationSettings: '"opsz" 144',
                  fontWeight: 400,
                  letterSpacing: "-0.04em",
                }}
              >
                {total}
              </div>
              <div
                className="gd-font-sans-ui mt-2"
                style={{
                  fontSize: 14,
                  color: "oklch(0.72 0.02 265)",
                  letterSpacing: script === "latin" ? "0.02em" : 0,
                }}
              >
                {v2(lang, "notebookWordsExplored")}
              </div>
            </div>
            {reviewQueue > 0 && (
              <button
                type="button"
                onClick={() => router.push("/practice")}
                className="gd-font-sans-ui font-medium inline-flex items-center gap-2.5"
                style={{
                  fontSize: 14,
                  padding: "12px 18px",
                  borderRadius: 12,
                  color: "white",
                  background:
                    "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
                  boxShadow:
                    "0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)",
                  marginBottom: 12,
                }}
              >
                {v2(lang, "notebookPracticeNow")}
                <span
                  dir="ltr"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: "oklch(1 0 0 / 0.22)",
                    boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.3)",
                  }}
                >
                  {reviewQueue}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Toggle */}
      {!isEmpty && !loading && (
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            marginBlockStart: "clamp(24px, 3vw, 36px)",
            display: "flex",
            // flex-start respects document direction:
            // start = right in RTL, left in LTR — exactly what we want.
            justifyContent: "flex-start",
          }}
        >
          <ViewToggle view={view} onChange={setView} />
        </div>
      )}

      {/* Body */}
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          marginBlockStart: isEmpty ? "clamp(12px, 2vw, 30px)" : "clamp(18px, 2vw, 24px)",
        }}
      >
        {loading && (
          <div
            style={{
              paddingBlock: "clamp(60px, 10vw, 100px)",
              textAlign: "center",
              opacity: 0.5,
            }}
          >
            <div
              className="gd-font-sans-ui"
              style={{ fontSize: 14, color: "oklch(0.65 0.03 265)" }}
            >
              {v2(lang, "homeBadgeLaunching")
                ? ""
                : ""}{" "}
              {/* placeholder — keeps layout stable while loading */}
            </div>
          </div>
        )}
        {!loading && isEmpty && <EmptyState />}
        {!loading && !isEmpty && view === "list" && (
          <div
            className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          >
            {derived.map((e) => (
              <WordCard
                key={e.id}
                entry={e}
                onClick={() => handleWordClick(e)}
                onRemove={() => handleRemove(e.id)}
              />
            ))}
          </div>
        )}
        {!loading && !isEmpty && view === "galaxy" && (
          <GalaxyView entries={derived} onWordClick={handleWordClick} />
        )}
      </div>
    </div>
  );
}

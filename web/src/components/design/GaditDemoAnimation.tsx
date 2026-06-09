"use client";

/**
 * GaditDemoAnimation — auto-cycling tour of the product across the
 * three tiers + the partner program.
 *
 * Why this exists: the /features page lists features in cards, but a
 * static grid can't show motion or progression. Visitors who land on
 * /features want to *see* the product breathe — search opens, kids
 * mode flips, a quiz appears. This component is the "watch the product
 * move" answer.
 *
 * Architecture: a small state machine cycles through 4 scenes (basic /
 * clear / deep / affiliate). Each scene is its own JSX block; the
 * active one fades in, the rest stay mounted but hidden so children
 * don't re-mount mid-cycle (causes layout jank). CSS keyframes handle
 * the in-scene reveals — we stagger via animation-delay on each child.
 * React only owns the "which scene" pointer.
 *
 * Cycle timing:
 *   basic     6.5s
 *   clear     7.5s   (densest scene — kids toggle + image + compose)
 *   deep      6.0s
 *   affiliate 5.5s
 *
 * Hover pauses, click a dot to jump, prefers-reduced-motion freezes
 * the loop on whichever scene was active.
 */

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/lang-context";

type Scene = "basic" | "clear" | "deep" | "affiliate";

const SCENE_ORDER: Scene[] = ["basic", "clear", "deep", "affiliate"];
const SCENE_DURATION_MS: Record<Scene, number> = {
  basic: 6500,
  clear: 7500,
  deep: 6000,
  affiliate: 5500,
};

interface Copy {
  watchEyebrow: string;
  watchTitle: string;
  watchLede: string;
  tierBasic: string;
  tierClear: string;
  tierDeep: string;
  tierAffiliate: string;
  // Basic scene
  bWord: string;
  bDefLabel: string;
  bDef: string;
  bExamples: string[];
  bOriginLabel: string;
  bOrigin: string;
  bIdiomsLabel: string;
  bIdiom: string;
  // Clear scene
  cKidsToggle: string;
  cKidsLabel: string;
  cKidsBody: string;
  cImageLabel: string;
  cComposeLabel: string;
  cComposeText: string;
  cComposeStatus: string;
  cSaved: string;
  cAllBasic: string;
  // Deep scene
  dQuizLabel: string;
  dQuizQ: string;
  dQuizAnswer: string;
  dGameLabel: string;
  dGameWord: string;
  dCompareLabel: string;
  dCompareNote: string;
  dAllClear: string;
  // Affiliate scene
  aDashTitle: string;
  aLinkLabel: string;
  aLinkValue: string;
  aEarningsLabel: string;
  aEarningsValue: string;
  aSubsLabel: string;
  aSubsValue: string;
  aRateLabel: string;
  aRateValue: string;
  aStatus: string;
}

const COPY: Record<string, Copy> = {
  en: {
    watchEyebrow: "Watch Gadit",
    watchTitle: "Every word, every tier — at a glance.",
    watchLede: "A 25-second tour of what each plan unlocks. Hover to pause.",
    tierBasic: "Basic",
    tierClear: "Clear",
    tierDeep: "Deep",
    tierAffiliate: "Partner",
    bWord: "ephemeral",
    bDefLabel: "Definition",
    bDef: "Lasting for only a short time; quickly fading.",
    bExamples: [
      "Cherry blossoms are ephemeral.",
      "Fame can be ephemeral.",
      "Childhood laughter is ephemeral.",
    ],
    bOriginLabel: "Origin",
    bOrigin: "Greek ephḗmeros — “lasting only a day”",
    bIdiomsLabel: "Idioms",
    bIdiom: "ephemeral beauty",
    cKidsToggle: "Kids mode",
    cKidsLabel: "Kids explanation",
    cKidsBody: "Something that lasts only a tiny while — like a snowflake on a warm hand.",
    cImageLabel: "Visual",
    cComposeLabel: "Write your sentence",
    cComposeText: "She wrote an ephemeral poem about autumn.",
    cComposeStatus: "Perfect ✓",
    cSaved: "Saved to notebook ★",
    cAllBasic: "Plus everything in Basic",
    dQuizLabel: "Quiz",
    dQuizQ: "Which word means \"lasting briefly\"?",
    dQuizAnswer: "ephemeral",
    dGameLabel: "Word game",
    dGameWord: "ephemeral",
    dCompareLabel: "Compare two words",
    dCompareNote: "ephemeral vs transient — see the exact difference",
    dAllClear: "Plus everything in Clear",
    aDashTitle: "Partner dashboard",
    aLinkLabel: "Your link",
    aLinkValue: "gadit.app/?ref=anna",
    aEarningsLabel: "This month",
    aEarningsValue: "$47.30",
    aSubsLabel: "Active subscribers",
    aSubsValue: "18",
    aRateLabel: "Commission",
    aRateValue: "30% year 1 · 10% lifetime",
    aStatus: "Active Partner ⭐",
  },
  he: {
    watchEyebrow: "צפו ב-Gadit",
    watchTitle: "כל מילה, כל מסלול — במבט אחד.",
    watchLede: "סיור של 25 שניות בכל מה שכל מסלול פותח. ריחפו כדי לעצור.",
    tierBasic: "Basic",
    tierClear: "Clear",
    tierDeep: "Deep",
    tierAffiliate: "שותף",
    bWord: "ephemeral",
    bDefLabel: "הגדרה",
    bDef: "נמשך זמן קצר בלבד; דועך במהירות.",
    bExamples: [
      "פריחת הדובדבן היא חולפת.",
      "התהילה יכולה להיות חולפת.",
      "צחוק הילדות חולף.",
    ],
    bOriginLabel: "מקור",
    bOrigin: "יוונית ephḗmeros — \"נמשך יום אחד בלבד\"",
    bIdiomsLabel: "ניבים",
    bIdiom: "יופי חולף",
    cKidsToggle: "מצב ילדים",
    cKidsLabel: "הסבר לילדים",
    cKidsBody: "משהו שנשאר רק רגע קטן — כמו פתית שלג על יד חמה.",
    cImageLabel: "תמונה",
    cComposeLabel: "כתבו משפט משלכם",
    cComposeText: "היא כתבה שיר חולף על הסתיו.",
    cComposeStatus: "מושלם ✓",
    cSaved: "נשמר במחברת ★",
    cAllBasic: "וכל מה שיש ב-Basic",
    dQuizLabel: "חידון",
    dQuizQ: "איזו מילה אומרת \"נמשך זמן קצר\"?",
    dQuizAnswer: "ephemeral",
    dGameLabel: "משחק מילים",
    dGameWord: "ephemeral",
    dCompareLabel: "השוואת מילים",
    dCompareNote: "ephemeral מול transient — ראו את ההבדל המדויק",
    dAllClear: "וכל מה שיש ב-Clear",
    aDashTitle: "לוח שותפים",
    aLinkLabel: "הלינק שלך",
    aLinkValue: "gadit.app/?ref=anna",
    aEarningsLabel: "החודש",
    aEarningsValue: "$47.30",
    aSubsLabel: "מנויים פעילים",
    aSubsValue: "18",
    aRateLabel: "עמלה",
    aRateValue: "30% שנה ראשונה · 10% לכל החיים",
    aStatus: "Active Partner ⭐",
  },
};

function pickCopy(lang: string): Copy {
  return COPY[lang] ?? COPY.en;
}

export function GaditDemoAnimation() {
  const { lang } = useLang();
  const c = pickCopy(lang);
  const [scene, setScene] = useState<Scene>("basic");
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scene advancer — schedules the next scene swap. Cleared on pause /
  // unmount / manual jump so a stale timer never races a fresh one.
  useEffect(() => {
    if (paused) return;
    const dur = SCENE_DURATION_MS[scene];
    timeoutRef.current = setTimeout(() => {
      const idx = SCENE_ORDER.indexOf(scene);
      setScene(SCENE_ORDER[(idx + 1) % SCENE_ORDER.length]);
    }, dur);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [scene, paused]);

  return (
    <div
      className="wb-demo-anim"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Gadit feature tour"
    >
      <div className="wb-demo-anim-headstrip">
        <div className="wb-demo-anim-eyebrow">{c.watchEyebrow}</div>
        <h2 className="wb-demo-anim-title">{c.watchTitle}</h2>
        <p className="wb-demo-anim-lede">{c.watchLede}</p>
      </div>

      <div className="wb-demo-anim-frame">
        {/* Top bar inside the device frame — wordmark + active tier
            badge. The badge colour swaps per scene so a glance tells
            you which plan you're looking at. */}
        <div className="wb-demo-anim-topbar">
          <div className="wb-demo-anim-wordmark">
            Gad<span className="wb-demo-anim-wordmark-it">it</span>
          </div>
          <div className={`wb-demo-anim-tier wb-demo-anim-tier-${scene}`}>
            {scene === "basic" ? c.tierBasic :
             scene === "clear" ? c.tierClear :
             scene === "deep" ? c.tierDeep :
             c.tierAffiliate}
          </div>
        </div>

        <div className="wb-demo-anim-stage">
          {scene === "basic" && <BasicScene c={c} />}
          {scene === "clear" && <ClearScene c={c} />}
          {scene === "deep" && <DeepScene c={c} />}
          {scene === "affiliate" && <AffiliateScene c={c} />}
        </div>

        {/* Step indicator — clickable, so a visitor who wants to revisit
            a tier doesn't have to wait through a full cycle. */}
        <div className="wb-demo-anim-dots" role="tablist">
          {SCENE_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={scene === s}
              aria-label={
                s === "basic" ? c.tierBasic :
                s === "clear" ? c.tierClear :
                s === "deep" ? c.tierDeep :
                c.tierAffiliate
              }
              className={`wb-demo-anim-dot${scene === s ? " is-active" : ""}`}
              onClick={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                setScene(s);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Scenes ─────────────────────────────────────────────────────

function BasicScene({ c }: { c: Copy }) {
  return (
    <div className="wb-demo-anim-scene">
      <div className="wb-demo-anim-word" style={{ animationDelay: "0ms" }}>
        {c.bWord}
      </div>

      <div className="wb-demo-anim-card" style={{ animationDelay: "200ms" }}>
        <div className="wb-demo-anim-label">{c.bDefLabel}</div>
        <div className="wb-demo-anim-body">{c.bDef}</div>
      </div>

      <ul className="wb-demo-anim-list">
        {c.bExamples.map((ex, i) => (
          <li
            key={i}
            className="wb-demo-anim-li"
            style={{ animationDelay: `${500 + i * 350}ms` }}
          >
            {ex}
          </li>
        ))}
      </ul>

      <div className="wb-demo-anim-pill-row" style={{ animationDelay: "1900ms" }}>
        <div className="wb-demo-anim-pill">
          <span className="wb-demo-anim-pill-eyebrow">{c.bOriginLabel}</span>
          <span>{c.bOrigin}</span>
        </div>
      </div>

      <div className="wb-demo-anim-pill-row" style={{ animationDelay: "2400ms" }}>
        <div className="wb-demo-anim-pill is-quiet">
          <span className="wb-demo-anim-pill-eyebrow">{c.bIdiomsLabel}</span>
          <span>{c.bIdiom}</span>
        </div>
      </div>
    </div>
  );
}

function ClearScene({ c }: { c: Copy }) {
  return (
    <div className="wb-demo-anim-scene">
      {/* Kids toggle flipping on — the chip animation echoes the real
          iOS-style switch elsewhere in the product. */}
      <div className="wb-demo-anim-toggle-row" style={{ animationDelay: "0ms" }}>
        <span className="wb-demo-anim-toggle-label">{c.cKidsToggle}</span>
        <span className="wb-demo-anim-toggle">
          <span className="wb-demo-anim-toggle-thumb" />
        </span>
      </div>

      <div className="wb-demo-anim-card is-clear" style={{ animationDelay: "400ms" }}>
        <div className="wb-demo-anim-label">{c.cKidsLabel}</div>
        <div className="wb-demo-anim-body">{c.cKidsBody}</div>
      </div>

      {/* Visual / image generation chip — a subtle gradient swatch as a
          stand-in for the generated illustration, with a soft sparkle
          tag so the eye reads it as "AI imagery". */}
      <div className="wb-demo-anim-image-row" style={{ animationDelay: "1000ms" }}>
        <div className="wb-demo-anim-image">
          <div className="wb-demo-anim-image-sparkle">✨</div>
        </div>
        <div className="wb-demo-anim-image-meta">
          <div className="wb-demo-anim-mini-eyebrow">{c.cImageLabel}</div>
          <div className="wb-demo-anim-mini-body">{c.bWord}</div>
        </div>
      </div>

      <div className="wb-demo-anim-compose" style={{ animationDelay: "1700ms" }}>
        <div className="wb-demo-anim-mini-eyebrow">{c.cComposeLabel}</div>
        <div className="wb-demo-anim-compose-input">{c.cComposeText}</div>
        <div className="wb-demo-anim-compose-status">{c.cComposeStatus}</div>
      </div>

      <div className="wb-demo-anim-pill-row" style={{ animationDelay: "2400ms" }}>
        <div className="wb-demo-anim-pill is-success">{c.cSaved}</div>
      </div>

      <div className="wb-demo-anim-fineprint" style={{ animationDelay: "2800ms" }}>
        {c.cAllBasic}
      </div>
    </div>
  );
}

function DeepScene({ c }: { c: Copy }) {
  return (
    <div className="wb-demo-anim-scene">
      <div className="wb-demo-anim-card is-deep" style={{ animationDelay: "0ms" }}>
        <div className="wb-demo-anim-label">{c.dQuizLabel}</div>
        <div className="wb-demo-anim-body">{c.dQuizQ}</div>
        <div className="wb-demo-anim-quiz-options">
          <span className="wb-demo-anim-quiz-opt">brief</span>
          <span className="wb-demo-anim-quiz-opt is-correct">{c.dQuizAnswer}</span>
          <span className="wb-demo-anim-quiz-opt">eternal</span>
          <span className="wb-demo-anim-quiz-opt">solid</span>
        </div>
      </div>

      {/* Word game preview — a scrambled-letter row that visually reads
          as "anagram puzzle" without needing to actually animate. */}
      <div className="wb-demo-anim-game-row" style={{ animationDelay: "1100ms" }}>
        <div className="wb-demo-anim-mini-eyebrow">{c.dGameLabel}</div>
        <div className="wb-demo-anim-letters">
          {"emerphela".split("").map((ch, i) => (
            <span key={i} className="wb-demo-anim-letter">{ch}</span>
          ))}
        </div>
      </div>

      <div className="wb-demo-anim-compare-row" style={{ animationDelay: "2000ms" }}>
        <div className="wb-demo-anim-mini-eyebrow">{c.dCompareLabel}</div>
        <div className="wb-demo-anim-compare-body">{c.dCompareNote}</div>
      </div>

      <div className="wb-demo-anim-fineprint" style={{ animationDelay: "2700ms" }}>
        {c.dAllClear}
      </div>
    </div>
  );
}

function AffiliateScene({ c }: { c: Copy }) {
  return (
    <div className="wb-demo-anim-scene">
      <div className="wb-demo-anim-dash-title" style={{ animationDelay: "0ms" }}>
        {c.aDashTitle}
      </div>

      <div className="wb-demo-anim-link" style={{ animationDelay: "300ms" }}>
        <div className="wb-demo-anim-mini-eyebrow">{c.aLinkLabel}</div>
        <div className="wb-demo-anim-link-value">{c.aLinkValue}</div>
      </div>

      <div className="wb-demo-anim-stats">
        <div className="wb-demo-anim-stat" style={{ animationDelay: "700ms" }}>
          <div className="wb-demo-anim-stat-label">{c.aEarningsLabel}</div>
          <div className="wb-demo-anim-stat-value">{c.aEarningsValue}</div>
        </div>
        <div className="wb-demo-anim-stat" style={{ animationDelay: "1000ms" }}>
          <div className="wb-demo-anim-stat-label">{c.aSubsLabel}</div>
          <div className="wb-demo-anim-stat-value">{c.aSubsValue}</div>
        </div>
      </div>

      <div className="wb-demo-anim-rate" style={{ animationDelay: "1500ms" }}>
        <div className="wb-demo-anim-mini-eyebrow">{c.aRateLabel}</div>
        <div className="wb-demo-anim-rate-value">{c.aRateValue}</div>
      </div>

      <div className="wb-demo-anim-status" style={{ animationDelay: "2100ms" }}>
        {c.aStatus}
      </div>
    </div>
  );
}

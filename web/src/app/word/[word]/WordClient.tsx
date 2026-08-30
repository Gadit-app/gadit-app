"use client";

/**
 * WordClient — the result page.
 *
 * Streams from /api/define and renders with ResultView on the dark
 * navy stage. Handles:
 *   - 401 → opens login modal (search requires sign-in)
 *   - 429 → quota card with Upgrade CTA
 *   - SSE delta events → progressive partial render (skeleton-friendly)
 *   - SSE done event → final result + cache flag
 *
 * Image generation, save-to-notebook, share, action tile clicks all
 * wire to existing API endpoints. Compose / Quiz / Report each open a
 * modal layered above the result.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { parse as parsePartialJson, Allow } from "partial-json";
import Link from "next/link";

import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { detectWrongKeyboard } from "@/lib/keyboard-layout";
import { v2 } from "@/lib/i18n-v2";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { LangSwitchMobile } from "@/components/LangSwitchMobile";
import { WbShellNav, WbShellBurger } from "@/components/design/WbShellChrome";
import { StartFreeCTA } from "@/components/StartFreeCTA";
import { GadVerbStamp } from "@/components/GadVerbStamp";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { getWordSet, curatedDef } from "@/lib/word-sets";
import { KidsModeToggle } from "@/components/KidsModeToggle";
import { AppearancePicker } from "@/components/AppearancePicker";
import VoiceInput from "@/components/VoiceInput";
import { useHref, wordPath } from "@/lib/href";
import { getCachedWord, setCachedWord, setPinned as setPinnedDb } from "@/lib/offline-db";
import { UpgradeModal, type UpgradeTrigger } from "@/components/UpgradeModal";
import { LANGUAGES, type Lang } from "@/lib/i18n";
import { track } from "@/lib/track";
import { useKidsMode } from "@/lib/use-kids-mode";

import { MarketingHeader } from "@/components/design/MarketingHeader";
import { ClassroomTopbar } from "@/components/design/ClassroomTopbar";
import { skinStyleVars, readStashedSkin } from "@/lib/school-skin";
import { HomeFooter } from "@/components/design/home";
import { ComposeModalV2 } from "@/components/design/ComposeModalV2";
import { QuizModalV2 } from "@/components/design/QuizModalV2";
import { WordGameModal } from "@/components/design/WordGameModal";
import {
  ReportModalV2,
  type ReportContext,
} from "@/components/design/ReportModalV2";
import {
  ResultView,
  type WordResult,
  type Plan,
} from "@/components/design/result";

// ─── Anonymous search counter ──────────────────────────────────
// Local-only mirror of the server-side IP quota. Pure UX hint —
// drives the "X searches left today" banner. The server is the
// source of truth (it'll 429 when the IP cap is hit regardless of
// what localStorage says); this counter just tells us when to
// surface the heads-up before that happens.
//
// localStorage layout: { date: "2026-04-26", count: 3 }
// On a UTC date change we reset to 0. Cleared cookies = reset; that's
// fine, the server still enforces.
const ANON_COUNTER_KEY = "gadit-anon-searches";
// Mirrors ANON_DAILY_LIMIT in /api/define (5 → 2 on 2026-07-08).
const ANON_DAILY_LIMIT_CLIENT = 2;

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function readAnonCounter(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(ANON_COUNTER_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { date?: string; count?: number };
    if (parsed.date !== todayUTC()) return 0;
    return Number(parsed.count) || 0;
  } catch {
    return 0;
  }
}

function bumpAnonCounter(): number {
  if (typeof window === "undefined") return 0;
  const next = readAnonCounter() + 1;
  try {
    window.localStorage.setItem(
      ANON_COUNTER_KEY,
      JSON.stringify({ date: todayUTC(), count: next })
    );
  } catch {
    /* localStorage full / blocked, silent */
  }
  return next;
}

// SoftWall — friendly "you've used your free searches" page that
// replaces the result card when the server returns 429. Variants:
//   nextStep="signup"  → anonymous visitor; CTA is sign-up (5/day → 20/day)
//   nextStep="upgrade" → signed-in basic user; CTA is upgrade to Clear
// Both variants use the same warm-paper card layout + electric-blue
// CTA so the visual signature stays consistent with the rest of the
// product — this is intentional: a stranger-feeling page would
// trigger "wait, is this a paywall trick?" doubt.
function SoftWall({
  nextStep,
  lang,
  onSignUp,
}: {
  nextStep: "signup" | "upgrade";
  lang: import("@/lib/i18n").Lang;
  onSignUp: () => void;
}) {
  const href = useHref();
  const isSignup = nextStep === "signup";
  // Funnel event (council verdict 2026-07-08): every wall impression
  // is counted so "how many see the wall / how many sign up from it"
  // is measurable before and after the 5→2 quota change.
  useEffect(() => {
    track("softwall_shown", { variant: nextStep, lang });
  }, [nextStep, lang]);
  return (
    <div
      className="wb-softwall"
      style={{
        padding: "clamp(32px, 4vw, 48px) clamp(28px, 4vw, 44px)",
        marginBottom: 24,
        textAlign: "center",
        background: "#FFFFFF",
        border: "1px solid var(--rule, #E5E7EB)",
        borderRadius: 16,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        fontFamily: "var(--wb-sans)",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--wb-sans)",
          fontSize: "clamp(24px, 3vw, 30px)",
          fontWeight: 700,
          color: "var(--ink, #111827)",
          marginBottom: 12,
          letterSpacing: "-0.01em",
          lineHeight: 1.25,
        }}
      >
        {v2(lang, isSignup ? "softWallAnonTitle" : "softWallBasicTitle")}
      </h2>
      <p
        style={{
          fontFamily: "var(--wb-sans)",
          fontSize: 15,
          color: "var(--ink-muted, #4B5563)",
          maxWidth: "44ch",
          margin: "0 auto 24px",
          lineHeight: 1.55,
        }}
      >
        {v2(lang, isSignup ? "softWallAnonBody" : "softWallBasicBody")}
      </p>
      {isSignup ? (
        <button
          type="button"
          onClick={onSignUp}
          style={{
            fontFamily: "var(--wb-sans)",
            padding: "12px 28px",
            borderRadius: 999,
            fontSize: 14.5,
            fontWeight: 600,
            color: "white",
            background: "rgb(14, 165, 165)",
            border: "none",
            cursor: "pointer",
            transition: "background 160ms",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgb(13, 148, 148)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgb(14, 165, 165)"; }}
        >
          {v2(lang, "softWallSignupCta")}
        </button>
      ) : (
        <Link
          href={href("/pricing")}
          style={{
            fontFamily: "var(--wb-sans)",
            display: "inline-block",
            padding: "12px 28px",
            borderRadius: 999,
            fontSize: 14.5,
            fontWeight: 600,
            color: "white",
            textDecoration: "none",
            background: "rgb(14, 165, 165)",
          }}
        >
          {v2(lang, "upgradeToClear")}
        </Link>
      )}
    </div>
  );
}

// Cream-friendly inline language switcher for the wordbook topbar.
// LangSwitcher in design/ assumes a dark surface; this one is sized
// and colored for cream paper. Pure local state, closes on outside click.
function WordbookLangSwitch() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div ref={wrapRef} className="wb-lang-wrap">
      <button
        type="button"
        className="wb-lang-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M1.5 7h11M7 1.5c1.7 2 1.7 9 0 11M7 1.5c-1.7 2-1.7 9 0 11"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        <span>{active.label}</span>
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="wb-lang-panel" role="listbox">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="option"
              aria-selected={l.code === lang}
              className={l.code === lang ? "is-active" : ""}
              onClick={() => {
                setLang(l.code as Lang);
                setOpen(false);
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Skeleton card — shown while the SSE stream is still bringing in data
// before any meaning has parsed cleanly.
function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <div
      className="gd-card"
      style={{
        padding: "32px",
        opacity: 0.5,
        minHeight: height,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, oklch(0.95 0.01 85 / 0.6) 50%, transparent 100%)",
          animation: "gd-drift 1.6s ease-in-out infinite",
        }}
      />
    </div>
  );
}

interface SSEDelta {
  type: "delta";
  partial: string;
}
interface SSEDone {
  type: "done";
  result: WordResult & { fromCache?: boolean };
}
interface SSEError {
  type: "error";
  message: string;
}
type SSEEvent = SSEDelta | SSEDone | SSEError;

export function WordClient({
  initialWord,
  initialResult = null,
  preloadLang = "en",
}: {
  initialWord: string;
  /** Server-preloaded definition from the Firestore cache (anonymous
   *  "base" tier, preloadLang UI language). When present and the
   *  client context matches (anonymous, same lang, no context
   *  sentence), the API fetch is skipped entirely — crawlers get full
   *  HTML, anonymous users get an instant render that doesn't touch
   *  their daily quota. Launch SEO fix 2026-07-04. */
  initialResult?: WordResult | null;
  preloadLang?: string;
}) {
  const { user, plan: authPlan, promptLogin, familyRole, schoolId } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();
  const href = useHref();
  const searchParams = useSearchParams();
  const contextSentence = searchParams?.get("sentence")?.trim() || "";
  // Kids Mode subscription: when the user flips the toggle in the
  // masthead, the effect below picks up the new value and re-fetches
  // the entry under the new prompt + cache key.
  const [kidsMode] = useKidsMode();
  // Persistent search bar sitting between the masthead and the result.
  // Lives in WordClient (not chrome) so the input doesn't reset every
  // time the masthead re-renders for share/lang/menu toggles.
  const [headerQuery, setHeaderQuery] = useState("");
  // When wrong-keyboard auto-correct fires, the original mis-typed
  // word is preserved in ?from=… so we can show a banner that lets
  // the user override and search the original anyway. ?stay=1 is
  // set by that override link to skip the redirect on re-entry.
  const typedOriginal = searchParams?.get("from")?.trim() || "";
  const stayOnInput = searchParams?.get("stay") === "1";
  // ?back=<word> set by the WordPopover when the user opens a tapped
  // word's full definition. Surfaces a 'back to <word>' chip at the
  // top of the result so the user can return to the original
  // definition they were reading without losing their place.
  const backWord = searchParams?.get("back")?.trim() || "";
  // ?cls=<CODE> set by the /c/<CODE> kid landing page. When present,
  // this search came from a classroom — fire-and-forget log it to the
  // classroom's search log so the teacher can see what their class
  // looked up today. No personal data is logged, only the word + lang
  // (+ first name only when the roster picker was used).
  const classroomCode = searchParams?.get("cls")?.trim() || "";
  // The school's skin colour, stashed by the /c/<CODE> landing so the word
  // page themes to it without another lookup. Read after mount (sessionStorage
  // is client-only) to avoid a hydration mismatch.
  const [classroomSkin, setClassroomSkin] = useState<string | null>(null);
  useEffect(() => {
    if (classroomCode) setClassroomSkin(readStashedSkin(classroomCode));
  }, [classroomCode]);
  // Present / projector mode (Gadi 2026-08-05, schools council): the SAME
  // clean Gadit word view with the top chrome hidden, for a teacher
  // explaining a word to the whole class on the classroom screen. Same
  // format as always, just without the top menu. Initialised from
  // ?present=1 (shareable link) and toggled live by the corner button.
  const [present, setPresent] = useState(searchParams?.get("present") === "1");
  // In present mode the search bar is hidden (we are showing words, not
  // searching). A small "open dictionary" button reveals it on demand.
  const [showSearch, setShowSearch] = useState(false);
  // Word-set stepping (schools council 2026-08-05). ?set=<id> means this
  // word is part of a curated themed set the teacher is walking through;
  // show a prev/next stepper (and arrow-key paging) that keeps present +
  // set params so the whole lesson stays clean on the projector.
  const setId = searchParams?.get("set")?.trim() || "";
  const wordSet = setId ? getWordSet(setId) : undefined;
  const setIdx = wordSet
    ? wordSet.words.findIndex((w) => w.trim().toLowerCase() === initialWord.trim().toLowerCase())
    : -1;
  const goToSetWord = (w: string) =>
    router.push(href(`/word/${encodeURIComponent(w)}?present=1&set=${encodeURIComponent(setId)}`));
  // Classroom mode: a set word shown on the projector. Show ONE relevant
  // definition (Gadi's curated one when we have it, else the first
  // meaning) plus an auto-generated picture, never the full multi-meaning
  // result, so students see the subject-relevant sense only.
  const classroomMode = present && !!wordSet && setIdx >= 0;
  useEffect(() => {
    if (!wordSet || setIdx < 0) return;
    function onKey(e: KeyboardEvent) {
      if (!wordSet) return;
      if (e.key === "ArrowRight" && setIdx < wordSet.words.length - 1) goToSetWord(wordSet.words[setIdx + 1]);
      else if (e.key === "ArrowLeft" && setIdx > 0) goToSetWord(wordSet.words[setIdx - 1]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId, setIdx]);
  // ?sn=<first-name> set by the /c/<CODE> roster picker. Carries
  // forward through the persistent search bar so a kid who chains
  // multiple lookups stays attributed. Empty string == anonymous.
  const classroomStudentName = searchParams?.get("sn")?.trim() || "";
  // ?in=1 set by /c/<CODE> only when the school's classroom window is
  // currently active (default Sun-Thu 7:30-15:00 Asia/Jerusalem). When
  // true, the word page unlocks the extended classroom features
  // (image, kids' explanation, classroom game) on top of the always-
  // on basic dictionary. Outside the window the kid keeps the search
  // but those extras go dark — the kid view shows a soft "Want full
  // Gadit at home? Family" hint instead.
  const classroomInSession = searchParams?.get("in") === "1";

  // Seed from the server preload so the first paint (and the crawler's
  // HTML snapshot) already contains the definition. The fetch effect
  // below decides whether the preload is authoritative or needs a
  // refetch (signed-in user, lang mismatch, context sentence).
  const [result, setResult] = useState<WordResult | null>(initialResult);
  const [loading, setLoading] = useState(!initialResult);
  const [isSaved, setIsSaved] = useState(false);

  // Parent alert: when the searcher is a child in a family, tell the
  // server so the parent gets notified (push + email) that their kid
  // looked up this word. Best-effort and fire-and-forget; the endpoint
  // is a silent no-op for anyone who isn't a kid. Fires once per word.
  const notifiedWordRef = useRef<string>("");
  useEffect(() => {
    const w = result?.word;
    // Only on a COMPLETE result. During SSE streaming result.word is built
    // up letter by letter (ח → חפ → חפץ), so firing on every change sent
    // the parent 3 alerts for prefixes. loading stays true until the final
    // result lands, so gate on it.
    if (loading || !w || familyRole !== "kid" || !user) return;
    if (notifiedWordRef.current === w) return;
    notifiedWordRef.current = w;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        await fetch("/api/family/notify-search", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ word: w, language: result?.language ?? "", uiLang: lang }),
          keepalive: true,
        });
      } catch {
        /* best effort — never disturb the search flow */
      }
    })();
  }, [result?.word, result?.language, familyRole, user, loading, lang]);
  // Offline pin state: true means the user has explicitly downloaded
  // this word for offline study (vs the implicit auto-cache that all
  // Clear/Deep users get on view). Loaded from IDB once the result
  // lands; toggled by the Pin button in WordHeader.
  const [isPinned, setIsPinned] = useState(false);
  // Upgrade modal — open with the feature + tier the user just tried.
  // Null = no modal showing.
  const [upgradeTrigger, setUpgradeTrigger] = useState<UpgradeTrigger | null>(null);

  // Cross-language is a flagship feature (Gadi 2026-08-03): a student on a
  // Russian/Hebrew UI can type a word in ANY language and get the meaning
  // explained in their interface language. The old wrong-keyboard rescue
  // auto-redirected any Latin input on a Hebrew UI to its keyboard-mapped
  // Hebrew (e.g. "dream" -> "גרקשץ"), because it only checked that the
  // mapping produced Hebrew LETTERS, not a real WORD. That hijacked every
  // legitimate foreign-word lookup. We no longer redirect — the word is
  // defined exactly as typed, in the UI language. Genuine wrong-keyboard
  // typos still get the model's own "did you mean" suggestion in the
  // result. `detectWrongKeyboard` is intentionally left unused here.
  void detectWrongKeyboard;
  // Brief toast above the topbar confirming a save worked. The button
  // label also flips to "Saved" but the toast gives an explicit ack.
  const [saveFlash, setSaveFlash] = useState(false);
  // The 429 case carries a "nextStep" hint from the server — anon
  // visitors see "sign up to keep searching", basic users see
  // "upgrade to Clear for unlimited". Captures the difference so we
  // render the right CTA on the soft wall.
  const [quotaState, setQuotaState] = useState<{
    reached: boolean;
    nextStep: "signup" | "upgrade" | null;
  }>({ reached: false, nextStep: null });
  const [errorMsg, setErrorMsg] = useState<string>("");
  // Anonymous-only soft banner: when an unsigned visitor has done
  // their 4th or 5th search of the day (out of a 5/day cap), we
  // show a small "X free searches left — sign up to keep going"
  // line above the result. State lives on the client; the actual
  // counter is in localStorage.
  const [anonSearchesLeft, setAnonSearchesLeft] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [imageGenerating, setImageGenerating] = useState(false);
  // Kids Mode: a picture per meaning, keyed by meaning index, shown inline
  // under each definition. Adult mode never fills this.
  const [kidsImages, setKidsImages] = useState<Record<number, string>>({});
  // Which meaning indexes are still generating their kids picture, so the
  // card can show a skeleton instead of blank space (blank space made a
  // parent think it failed and tap the manual action, creating a duplicate).
  const [kidsImgLoading, setKidsImgLoading] = useState<Record<number, boolean>>({});
  // Surface image-gen failures to the user — previously the handler
  // swallowed any non-402 error and the user saw 'loading → nothing',
  // with no signal that anything had gone wrong. A Czech beta tester
  // hit a quota error and could not tell why the button did nothing.
  const [imageError, setImageError] = useState<string | null>(null);
  // Classroom present mode: subject-appropriate example sentences pinned
  // to the word's curated (subject-relevant) meaning, fetched from
  // /api/classroom-examples. A polysemous curriculum word like "אות"
  // (a letter of the alphabet, in the language set) then shows letter
  // examples, not a musical-signal or medal example. Falls back to the
  // general /api/define examples until these land (or if none exist).
  const [classroomExamples, setClassroomExamples] = useState<string[]>([]);
  const [composeOpen, setComposeOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [wordGameOpen, setWordGameOpen] = useState(false);

  // Niqqud (מנוקד) — optional Hebrew vowel points for young readers (grades
  // 1-2). The toggle persists per device; when on for a Hebrew word we fetch a
  // vowelized copy of the word/meanings/examples (Dicta, via /api/niqqud) and
  // render THAT, while every logic path keeps the original un-vowelized text.
  // Gadi 2026-08-22.
  const [niqqud, setNiqqud] = useState(false);
  const [niqResult, setNiqResult] = useState<WordResult | null>(null);
  const isHebrewWord = !!result && /[֐-׿]/.test(result.word || "");
  const isArabicWord = !!result && /[؀-ۿ]/.test(result.word || "");
  useEffect(() => {
    try { setNiqqud(localStorage.getItem("gadit-niqqud") === "1"); } catch { /* ignore */ }
  }, []);
  function toggleNiqqud() {
    setNiqqud((v) => {
      const next = !v;
      try { localStorage.setItem("gadit-niqqud", next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  }
  useEffect(() => {
    if (!niqqud || !(isHebrewWord || isArabicWord) || !result || !user) { setNiqResult(null); return; }
    let cancelled = false;
    (async () => {
      try {
        // Vowelizable = Hebrew (Dicta niqqud) or Arabic (LLM tashkeel).
        const isHeb = (s?: string) => !!s && /[֐-׿؀-ۿ]/.test(s);
        // Collect only the text that's actually SHOWN in the current mode:
        // in Kids Mode the kids explanation replaces the standard meaning.
        const texts: string[] = [];
        const add = (s?: string) => { if (isHeb(s)) texts.push(s as string); };
        add(result.word);
        for (const m of result.meanings ?? []) {
          if (kidsMode && m.kidsExplanation) {
            add(m.kidsExplanation.intro);
            add(m.kidsExplanation.explanation);
            for (const ex of m.kidsExplanation.examples ?? []) add(ex);
          } else {
            add(m.meaning);
            for (const ex of m.examples ?? []) add(ex);
          }
        }
        const unique = Array.from(new Set(texts));
        if (unique.length === 0) { setNiqResult(null); return; }
        const idToken = await user.getIdToken();
        const res = await fetch("/api/niqqud", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ texts: unique }),
        });
        if (!res.ok) throw new Error("niqqud");
        const data = (await res.json()) as { niqqud?: string[] };
        const niq = data.niqqud ?? [];
        if (cancelled || niq.length !== unique.length) return;
        const map = new Map<string, string>();
        unique.forEach((tx, i) => map.set(tx, niq[i] ?? tx));
        const v = (s?: string) => (s && map.has(s) ? (map.get(s) as string) : s);
        const vMeanings = (result.meanings ?? []).map((m) => ({
          ...m,
          meaning: v(m.meaning) ?? m.meaning,
          examples: (m.examples ?? []).map((e) => v(e) ?? e),
          kidsExplanation: m.kidsExplanation
            ? {
                ...m.kidsExplanation,
                intro: v(m.kidsExplanation.intro),
                explanation: v(m.kidsExplanation.explanation) ?? m.kidsExplanation.explanation,
                examples: (m.kidsExplanation.examples ?? []).map((e) => v(e) ?? e),
              }
            : m.kidsExplanation,
        }));
        setNiqResult({ ...result, word: v(result.word) ?? result.word, meanings: vMeanings });
      } catch {
        if (!cancelled) setNiqResult(null); // Dicta down → plain Hebrew, no break
      }
    })();
    return () => { cancelled = true; };
  }, [niqqud, isHebrewWord, isArabicWord, result, user, kidsMode]);
  const displayResult = niqqud && niqResult ? niqResult : result;
  const [reportContext, setReportContext] = useState<ReportContext | null>(
    null
  );

  // Plan as the API gates it: anonymous → "basic", auth-context → server.
  const plan: Plan = authPlan ?? "basic";

  // Guard against double-firing in dev StrictMode AND against
  // re-fetches caused by unstable deps. Key embeds user.uid so an
  // anonymous → signed-in transition re-runs the fetch (otherwise
  // a visitor who signs in mid-skeleton would never see the result).
  const fetchedFor = useRef<string | null>(null);

  // promptLogin is recreated every AuthProvider render, which used to
  // re-fire the effect each time React's auth state updated. Stash a
  // ref so the effect's deps stay minimal and the guard actually
  // works (see effect below).
  const promptLoginRef = useRef(promptLogin);
  useEffect(() => {
    promptLoginRef.current = promptLogin;
  }, [promptLogin]);

  // Classroom search logging. Fires once per (code, word) combo when
  // the user arrived from /c/<CODE>. Server-side this writes an entry
  // to schools/{schoolId}/classrooms/{classroomId}/searches/ + bumps
  // the running classroom searchCount. Fire-and-forget — a failed log
  // is silent because the user has nothing to do about it.
  useEffect(() => {
    if (!classroomCode || !initialWord) return;
    fetch("/api/classroom/log-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: classroomCode,
        word: initialWord,
        lang,
        ...(classroomStudentName && { studentName: classroomStudentName }),
      }),
    }).catch(() => {
      // Silent. Logging is best-effort, never blocks the result.
    });
  }, [classroomCode, classroomStudentName, initialWord, lang]);

  useEffect(() => {
    if (!initialWord) return;
    const key = `${initialWord}::${user?.uid ?? "anon"}`;
    if (fetchedFor.current === key) return;

    // Server preload short-circuit: the page arrived with the cached
    // definition already rendered. Keep it — no API call — as long as
    // the client context matches what the server preloaded for:
    // anonymous visitor, same UI language, no context sentence. Any
    // mismatch (user signs in, lang switch, ?sentence=) falls through
    // to the normal fetch. Crawlers always match this branch, which is
    // what turns the GSC Soft 404s into indexable pages.
    if (initialResult && !user && !contextSentence && lang === preloadLang) {
      fetchedFor.current = key;
      setResult(initialResult);
      setLoading(false);
      setErrorMsg("");
      // Cleanup must reset the fetch guard: the guard key doesn't
      // include lang, so without this a lang switch would hit the
      // key-match early-return above and keep stale-language content.
      return () => {
        fetchedFor.current = null;
      };
    }

    fetchedFor.current = key;

    let cancelled = false;
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setQuotaState({ reached: false, nextStep: null });
      setErrorMsg("");
      setResult(null);
      setImageUrl(undefined);
      setKidsImages({});
      setAnonSearchesLeft(null);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (user) {
        try {
          const idToken = await user.getIdToken();
          headers.Authorization = `Bearer ${idToken}`;
        } catch {
          // anonymous fallback
        }
      }

      let res: Response;
      try {
        res = await fetch("/api/define", {
          method: "POST",
          headers,
          body: JSON.stringify({
            word: initialWord,
            uiLang: lang,
            ...(contextSentence ? { contextSentence } : {}),
          }),
          signal: controller.signal,
        });
      } catch (e) {
        // AbortError fires when strict-mode cleanup aborts the
        // duplicate fetch; that's expected and quiet. Anything else
        // surfaces as a real error.
        if (cancelled || (e instanceof DOMException && e.name === "AbortError")) {
          return;
        }
        // Network failure (offline, DNS, etc.). Before surfacing an
        // error, look the word up in the offline IDB cache — if the
        // user is a Clear/Deep subscriber and has previously viewed
        // this word, we can still render it without any network.
        if (plan === "clear" || plan === "deep") {
          try {
            const cached = await getCachedWord(lang, initialWord);
            if (cached && !cancelled) {
              setResult(cached.result as WordResult);
              setLoading(false);
              return;
            }
          } catch {
            // IDB miss / unsupported — fall through to the error path.
          }
        }
        setErrorMsg(String(e));
        setLoading(false);
        return;
      }

      if (cancelled) return;

      // 401 used to be the "anonymous wall" — that wall is gone, so a
      // 401 now would only mean a corrupt token or an expired session
      // for a previously-signed-in user. Treat as a generic auth
      // failure: open sign-in, no special handling.
      if (res.status === 401) {
        promptLoginRef.current();
        setLoading(false);
        return;
      }
      if (res.status === 429) {
        // Parse the hint so the soft-wall component can show the
        // right CTA (Sign up vs Upgrade to Clear).
        const body = (await res.json().catch(() => ({}))) as {
          nextStep?: "signup" | "upgrade";
        };
        setQuotaState({
          reached: true,
          nextStep: body.nextStep ?? (user ? "upgrade" : "signup"),
        });
        setLoading(false);
        return;
      }
      if (res.status === 400) {
        // Server rejected the input as not a plausible word. Surface
        // the human-readable message instead of a raw HTTP code.
        const body = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        setErrorMsg(
          body.message ??
            "That doesn't look like a word we can define. Try a single word or a short phrase."
        );
        setLoading(false);
        return;
      }
      if (res.status === 503) {
        // Upstream (OpenAI) is unavailable — quota, outage, transient
        // 5xx. Show a calm "try again shortly" instead of "HTTP 503"
        // so users don't think the app itself is broken. Gadi
        // 2026-06-22 incident: OpenAI quota ran out and a subscriber
        // saw a raw "HTTP 500".
        const body = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        setErrorMsg(
          body.message ??
            "Our definition engine is temporarily unavailable. Please try again in a few minutes."
        );
        setLoading(false);
        return;
      }
      if (!res.ok || !res.body) {
        // Generic last-resort fallback for any unexpected non-2xx —
        // still less scary than "HTTP 500".
        setErrorMsg("Something went wrong. Please try again in a moment.");
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalResult: (WordResult & { fromCache?: boolean }) | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (cancelled) {
          reader.cancel().catch(() => undefined);
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload) continue;

          let event: SSEEvent;
          try {
            event = JSON.parse(payload) as SSEEvent;
          } catch {
            continue;
          }

          if (event.type === "delta") {
            try {
              const partial = parsePartialJson(
                event.partial,
                Allow.ALL
              ) as Partial<WordResult>;
              if (partial && typeof partial === "object") {
                // Only render meanings that are at least minimally
                // shaped — partial-json hands us mid-stream rows like
                // { meaning: "חלום ז" } before examples have arrived,
                // and the renderer used to crash when examples was
                // undefined. Defensive rendering inside MeaningCard
                // catches the rest, but filtering here avoids a flash
                // of empty cards on screen during the stream.
                const partialMeanings = Array.isArray(partial.meanings)
                  ? partial.meanings.filter(
                      (m): m is NonNullable<typeof m> =>
                        !!m && typeof m === "object" && typeof m.meaning === "string"
                    )
                  : [];
                // Spread the whole partial so no field is dropped mid-stream
                // (this used to hand-pick fields and silently lost the
                // cross-language `translation` gloss + `ipa` — 2026-08-13).
                // Only the rendered-shape fields are overridden for safety.
                setResult({
                  ...(partial as WordResult),
                  word: partial.word ?? initialWord,
                  language: partial.language ?? "",
                  meanings: partialMeanings,
                  etymology: partial.etymology ?? "",
                  generalIdioms: partial.generalIdioms,
                });
              }
            } catch {
              // partial JSON not yet parseable — keep accumulating
            }
          } else if (event.type === "done") {
            finalResult = event.result;
          } else if (event.type === "error") {
            setErrorMsg(event.message);
          }
        }
      }

      if (cancelled) return;

      if (finalResult) {
        setResult(finalResult);
        // Mark first-successful-search so the PWA install prompt can
        // wake up. Idempotent; safe to set on every successful result.
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("gadit_first_search_done", "1");
          }
        } catch { /* private mode etc., silently ignore */ }
        // Offline cache write — Clear/Deep only. Every successful
        // result gets persisted to IndexedDB so the same lookup works
        // from any device the user has installed the PWA on, even
        // with no network later (school WiFi blocked, plane, etc.).
        // Fire-and-forget; failure here must never break the render.
        if (plan === "clear" || plan === "deep") {
          void setCachedWord(lang, initialWord, finalResult);
        }
        track("search", {
          word: initialWord.slice(0, 40),
          uiLang: lang,
          plan,
          fromCache: Boolean(finalResult.fromCache),
          meaningsCount: finalResult.meanings?.length ?? 0,
          surface: "v2",
        });

        // For anonymous visitors only, bump the local counter and,
        // if they're at search 4 or 5 (i.e. 1-2 left), surface the
        // soft banner above the result. Cache hits AND misses count
        // toward the visible UX counter — beta testers found it
        // weird that the limit "didn't decrement" on popular words
        // (the server bypasses cache hits for billing, but UX-wise
        // the user just made a search either way).
        if (!user) {
          const used = bumpAnonCounter();
          const left = Math.max(0, ANON_DAILY_LIMIT_CLIENT - used);
          if (left > 0 && left <= 2) {
            setAnonSearchesLeft(left);
          }
        }
      } else if (!cancelled) {
        setErrorMsg("Stream ended without final result");
      }
      setLoading(false);
    }

    run();

    return () => {
      cancelled = true;
      // Actually abort the in-flight HTTP request — without this the
      // first fetch from Strict Mode's double-mount keeps running on
      // the OpenAI backend for ~30-100s, blocking the second fetch
      // behind it via per-key rate limiting and leaving the user on
      // a stuck skeleton. abort() rejects the fetch with AbortError
      // which the catch block above quietly swallows.
      controller.abort();
      // Reset the guard so the second (real) mount is allowed to
      // start a fresh fetch — without this the second mount sees the
      // key match and skips, and since the first fetch was aborted
      // nothing ever sets result.
      fetchedFor.current = null;
    };
    // Deps intentionally minimal: only the inputs that should
    // *trigger* a re-fetch. plan + promptLogin used to be here and
    // caused the fetch to re-fire on every auth-context render —
    // which combined with StrictMode produced 2 in-flight fetches
    // and a skeleton that never settled (the second fetch's setState
    // races the first's). plan is read inside run() via the
    // surrounding closure; promptLogin via promptLoginRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialWord, lang, user, contextSentence, initialResult, preloadLang]);

  // Classroom mode: auto-generate the picture so the word shows WITH its
  // image by default on the projector, no click. Prompts with the curated
  // definition so the picture matches the subject-relevant sense.
  useEffect(() => {
    if (!classroomMode || !result || imageUrl || imageGenerating || !user) return;
    const def = curatedDef(initialWord) ?? result.meanings[0]?.meaning ?? "";
    void handleGenerate({ meaning: def, example: result.meanings[0]?.examples?.[0] ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomMode, result, imageUrl, imageGenerating, user]);

  // Kids Mode: generate a picture for EACH meaning, shown inline under its
  // definition with no "Generate" click. Sequential + silent: the first kid
  // to view a (word, meaning, lang) pays; it lands in the img_kids_* cache
  // so every kid after gets it free (generate-image serves the cache before
  // the quota check). Stops early if a call fails (e.g. the monthly image
  // quota) so we never hammer the API. Non-basic only (a Family kid is on
  // "deep"). Classroom has its own single-image effect above.
  const kidsGenWordRef = useRef<string>("");
  useEffect(() => {
    // Complete result only — mid-stream result.word is a partial prefix,
    // so without this we'd generate images for ח, חפ, חפץ.
    if (loading || !kidsMode || classroomMode || !result?.word || !user || plan === "basic") return;
    if (kidsGenWordRef.current === result.word) return;
    kidsGenWordRef.current = result.word;
    const meanings = result.meanings ?? [];
    const w = result.word;
    let cancelled = false;
    // Fresh word: clear any stale pictures and mark every meaning as
    // "generating" so each card shows a skeleton until its image lands.
    setKidsImages({});
    setKidsImgLoading(() => {
      const m: Record<number, boolean> = {};
      for (let i = 0; i < meanings.length; i++) m[i] = true;
      return m;
    });
    const clearLoading = (from: number) =>
      setKidsImgLoading((prev) => {
        const next = { ...prev };
        for (let i = from; i < meanings.length; i++) next[i] = false;
        return next;
      });
    (async () => {
      for (let i = 0; i < meanings.length; i++) {
        if (cancelled) return;
        try {
          const idToken = await user.getIdToken();
          const res = await fetch("/api/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
            body: JSON.stringify({
              word: w,
              meaning: meanings[i]?.meaning ?? "",
              example: meanings[i]?.examples?.[0] ?? "",
              uiLang: lang,
              kidsMode: true,
            }),
          });
          if (!res.ok) { if (!cancelled) clearLoading(i); return; } // quota / error — stop, drop remaining skeletons
          const data = (await res.json()) as { url?: string };
          if (cancelled) return;
          if (data.url) {
            const url = data.url;
            setKidsImages((prev) => ({ ...prev, [i]: url }));
          }
          setKidsImgLoading((prev) => ({ ...prev, [i]: false }));
        } catch {
          if (!cancelled) clearLoading(i);
          return; // network — stop the loop, never disturb the reader
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kidsMode, classroomMode, result?.word, user, plan, loading]);

  // Auto-save every looked-up word to the notebook, silently, once per word.
  // Kids never have to tap "Save" (and the parent dashboard captures what
  // they explored); paying adults (Clear / Deep / Family) also get every
  // word saved the moment they look it up (Gadi 2026-08-17). Non-basic only
  // — the notebook is a paid feature.
  const autoSavedRef = useRef<string>("");
  useEffect(() => {
    // Complete result only — mid-stream result.word is a partial prefix.
    if (loading || !result?.word || !user || plan === "basic") return;
    if (autoSavedRef.current === result.word) return;
    autoSavedRef.current = result.word;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/notebook", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({
            word: result.word,
            language: result.language,
            meaning: result.meanings[0]?.meaning ?? "",
          }),
        });
        if (res.ok) setIsSaved(true);
      } catch {
        /* best effort — auto-save must never disturb the reading flow */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kidsMode, result?.word, user, plan, loading]);

  // Voice assistant arrival (?speak=1): read the definition aloud once, so a
  // hands-free "Gadit, what is X" gets a spoken answer (Gadi 2026-08-17).
  const spokeRef = useRef(false);
  useEffect(() => {
    if (searchParams?.get("speak") !== "1") return;
    if (spokeRef.current || loading || !result?.word || !user) return;
    if (plan !== "clear" && plan !== "deep") return;
    spokeRef.current = true;
    (async () => {
      try {
        const meaning = result.meanings?.[0]?.meaning ?? "";
        const text = `${result.word}. ${meaning}`.slice(0, 600);
        const idToken = await user.getIdToken();
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ text, lang }),
        });
        if (!res.ok) return;
        const url = URL.createObjectURL(await res.blob());
        const audio = new Audio(url);
        audio.onended = () => URL.revokeObjectURL(url);
        void audio.play();
      } catch {
        /* best effort — a missing spoken answer must never break the page */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, result?.word, user, plan]);

  // Classroom present mode: fetch subject-appropriate examples for the
  // curated meaning. Uses the SET's language (the curated defs are
  // Hebrew) so examples match the definition, and passes the resolved
  // meaning so the cache key lines up with the admin warm-set. Best
  // effort: on empty/failure we keep the general define examples.
  useEffect(() => {
    if (!classroomMode || !result) {
      setClassroomExamples([]);
      return;
    }
    let cancelled = false;
    const meaning = curatedDef(initialWord) ?? result.meanings[0]?.meaning ?? "";
    const exLang = wordSet?.lang ?? lang;
    const params = new URLSearchParams({ word: initialWord, uiLang: exLang });
    if (setId) params.set("set", setId);
    if (meaning) params.set("meaning", meaning);
    fetch(`/api/classroom-examples?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { examples?: string[] } | null) => {
        if (!cancelled && Array.isArray(d?.examples) && d.examples.length > 0) {
          setClassroomExamples(d.examples);
        }
      })
      .catch(() => {
        /* keep define examples */
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomMode, initialWord, setId, result]);

  // ── Action handlers ───────────────────────────────────────────
  async function handleGenerate(opts?: { meaning?: string; example?: string; silent?: boolean }) {
    if (!result || !user) {
      if (!opts?.silent) promptLogin(v2(lang, "generateImage"));
      return;
    }
    if (imageGenerating) return; // guard against double-click
    setImageGenerating(true);
    setImageError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          word: result.word,
          // Classroom mode passes the curated (subject-relevant) definition
          // so the picture depicts the right sense of the word.
          meaning: opts?.meaning ?? result.meanings[0]?.meaning ?? "",
          // First example sentence anchors the image prompt to a real
          // scene — biggest win for abstract words ("חוויה", "תקווה")
          // that have no everyday object to photograph. See
          // buildDallePrompt comment for the why.
          example: opts?.example ?? result.meanings[0]?.examples?.[0] ?? "",
          uiLang: lang,
          // Kids Mode → server swaps to the modern-flat illustration
          // prompt (Style B, locked 2026-06-19) and stores the result
          // in a separate img_kids_<lang>_* cache namespace so adult
          // and kid users of the same word each get the right look.
          kidsMode,
        }),
      });
      if (!res.ok) {
        if (res.status === 402) {
          // Auto (kids) generation must never yank the reader to /pricing.
          if (!opts?.silent) router.push(href("/pricing"));
          return;
        }
        // Silent (auto) mode fails quietly — no error card on the page.
        if (opts?.silent) return;
        // Parse the body for a known error code and surface a
        // language-appropriate message instead of failing silently.
        let bodyJson: { error?: string; used?: number; limit?: number } = {};
        try { bodyJson = await res.json(); } catch { /* not json */ }
        const code = bodyJson.error ?? `http_${res.status}`;
        const localised =
          code === "monthly_limit_reached"
            ? (lang === "he" ? `הגעת למגבלת התמונות החודשית (${bodyJson.used}/${bodyJson.limit}). מתאפס בתחילת החודש הבא.`
              : lang === "ar" ? `وصلت إلى حد الصور الشهري (${bodyJson.used}/${bodyJson.limit}). يُعاد ضبطه في بداية الشهر القادم.`
              : lang === "ru" ? `Месячный лимит изображений исчерпан (${bodyJson.used}/${bodyJson.limit}). Сбрасывается в начале следующего месяца.`
              : lang === "es" ? `Has alcanzado el límite mensual de imágenes (${bodyJson.used}/${bodyJson.limit}). Se reinicia el próximo mes.`
              : lang === "pt" ? `Você atingiu o limite mensal de imagens (${bodyJson.used}/${bodyJson.limit}). Reinicia no próximo mês.`
              : lang === "fr" ? `Vous avez atteint la limite mensuelle d'images (${bodyJson.used}/${bodyJson.limit}). Réinitialisation au mois prochain.`
              : lang === "de" ? `Du hast das monatliche Bildlimit erreicht (${bodyJson.used}/${bodyJson.limit}). Wird zum Monatsanfang zurückgesetzt.`
              : lang === "cs" ? `Dosáhl jsi měsíčního limitu obrázků (${bodyJson.used}/${bodyJson.limit}). Resetuje se začátkem dalšího měsíce.`
              : lang === "sk" ? `Dosiahol si mesačný limit obrázkov (${bodyJson.used}/${bodyJson.limit}). Resetuje sa začiatkom ďalšieho mesiaca.`
              : lang === "it" ? `Hai raggiunto il limite mensile di immagini (${bodyJson.used}/${bodyJson.limit}). Si resetta all'inizio del prossimo mese.`
              : lang === "ja" ? `今月の画像枚数の上限に達しました (${bodyJson.used}/${bodyJson.limit})。来月初めにリセットされます。`
              : lang === "hi" ? `आप इस महीने की तस्वीर सीमा तक पहुँच गए (${bodyJson.used}/${bodyJson.limit})। अगले महीने की शुरुआत में रीसेट होगी।`
              : `You've used your monthly image quota (${bodyJson.used}/${bodyJson.limit}). Resets at the start of next month.`)
            : code === "image_generation_failed" || code === "no_image_returned"
            ? (lang === "he" ? "התמונה נכשלה ביצירה. נסו שוב בעוד רגע."
              : lang === "ar" ? "فشل إنشاء الصورة. حاول مرة أخرى بعد قليل."
              : lang === "ru" ? "Не удалось создать изображение. Попробуйте ещё раз."
              : lang === "es" ? "No se pudo crear la imagen. Inténtalo de nuevo."
              : lang === "pt" ? "Não foi possível gerar a imagem. Tente novamente."
              : lang === "fr" ? "L'image n'a pas pu être créée. Réessayez."
              : lang === "de" ? "Bild konnte nicht erstellt werden. Versuche es noch einmal."
              : lang === "cs" ? "Obrázek se nepodařilo vytvořit. Zkus to znovu."
              : lang === "sk" ? "Obrázok sa nepodarilo vytvoriť. Skús to znova."
              : lang === "it" ? "Impossibile creare l'immagine. Riprova tra un momento."
              : lang === "ja" ? "画像を生成できませんでした。少し待ってもう一度お試しください。"
              : lang === "hi" ? "तस्वीर नहीं बन पाई। कुछ देर में फिर कोशिश करें।"
              : "Could not create the image. Try again in a moment.")
            : (lang === "he" ? "משהו השתבש. נסו שוב."
              : lang === "ar" ? "حدث خطأ ما. حاول مرة أخرى."
              : lang === "ru" ? "Что-то пошло не так. Попробуйте ещё раз."
              : lang === "es" ? "Algo salió mal. Inténtalo de nuevo."
              : lang === "pt" ? "Algo deu errado. Tente novamente."
              : lang === "fr" ? "Une erreur s'est produite. Réessayez."
              : lang === "de" ? "Etwas ist schiefgelaufen. Versuche es erneut."
              : lang === "cs" ? "Něco se pokazilo. Zkus to znovu."
              : lang === "sk" ? "Niečo sa pokazilo. Skús to znova."
              : lang === "it" ? "Qualcosa è andato storto. Riprova."
              : lang === "ja" ? "問題が発生しました。もう一度お試しください。"
              : lang === "hi" ? "कुछ ग़लत हुआ। फिर से कोशिश करें।"
              : "Something went wrong. Try again.");
        setImageError(localised);
        console.error("[generate-image] failed:", res.status, bodyJson);
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) setImageUrl(data.url);
    } catch (e) {
      console.error("generate-image:", e);
      if (opts?.silent) return;
      setImageError(
        lang === "he" ? "החיבור לאינטרנט אבד. בדקו את הרשת ונסו שוב."
        : lang === "cs" ? "Ztratilo se připojení k internetu. Zkontroluj síť a zkus to znovu."
        : lang === "sk" ? "Stratilo sa pripojenie k internetu. Skontroluj sieť a skús to znova."
        : lang === "it" ? "Connessione internet persa. Controlla la rete e riprova."
        : lang === "ja" ? "インターネット接続が切れました。ネットワークを確認してやり直してください。"
        : lang === "hi" ? "इंटरनेट कनेक्शन टूट गया। नेटवर्क जाँचें और फिर कोशिश करें।"
        : "Lost network connection. Check your internet and try again."
      );
    } finally {
      setImageGenerating(false);
    }
  }

  function handleUpgrade(tab?: string, tier?: "clear" | "deep") {
    // If we know the feature + tier (locked-tab click flow), show the
    // contextual modal. Otherwise (e.g. SoftWall upgrade button, quota
    // wall) fall through to the pricing page directly.
    if (tab && tier && (tab === "image" || tab === "kids" || tab === "compose" || tab === "quiz" || tab === "compare")) {
      setUpgradeTrigger({ feature: tab, tier });
      return;
    }
    router.push(href("/pricing"));
  }

  // Tracks why save failed so we can show the right toast/text.
  // null = either succeeded or hasn't been attempted this turn.
  const [saveError, setSaveError] = useState<string>("");

  async function handleSave() {
    if (!user) {
      promptLogin(v2(lang, "saveToNotebook"));
      return;
    }
    if (!result) return;
    // Notebook is a Clear-tier feature. Basic users get the contextual
    // upgrade modal instead of a silent /pricing redirect — exactly
    // the same UX as locked tabs (image/kids/quiz/etc).
    if (plan === "basic") {
      setUpgradeTrigger({ feature: "notebook", tier: "clear" });
      return;
    }
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          // /api/notebook expects { word, language, meaning } — the
          // earlier 'uiLang' typo here matched no field on the server
          // and silently 400'd, which is why every save looked like
          // a no-op until the red error toast was added.
          word: result.word,
          language: result.language,
          meaning: result.meanings[0]?.meaning ?? "",
        }),
      });
      if (res.ok) {
        setIsSaved(true);
        setSaveError("");
        setSaveFlash(true);
        window.setTimeout(() => setSaveFlash(false), 2400);
      } else {
        // Server rejected — surface an error toast so the click feels
        // acknowledged even on failure.
        console.error("notebook POST failed:", res.status, await res.text());
        setSaveError(`HTTP ${res.status}`);
        setSaveFlash(true);
        window.setTimeout(() => { setSaveFlash(false); setSaveError(""); }, 3000);
      }
    } catch (e) {
      console.error("notebook:", e);
      setSaveError(String(e));
      setSaveFlash(true);
      window.setTimeout(() => { setSaveFlash(false); setSaveError(""); }, 3000);
    }
  }

  function handleShare() {
    if (typeof navigator === "undefined") return;
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
    };
    const url = window.location.href;
    if (nav.share) {
      nav
        .share({ title: `Gadit, ${result?.word ?? ""}`, url })
        .catch(() => undefined);
    } else {
      nav.clipboard?.writeText(url).catch(() => undefined);
    }
  }

  // Toggle the IDB pinned flag for the current word. Pin = user has
  // explicitly downloaded this entry for offline study, so it's
  // protected from any future auto-prune logic. The underlying
  // record is the one setCachedWord already wrote on render; we
  // only flip the pinned boolean here, not the result body.
  async function handlePin() {
    if (!result) return;
    const next = !isPinned;
    setIsPinned(next);
    try {
      await setPinnedDb(lang, initialWord, next);
    } catch (e) {
      console.warn("[pin] failed:", e);
      // Revert UI on failure so the user doesn't get a false-positive
      // 'saved' state when the underlying store rejected the write.
      setIsPinned(!next);
    }
  }

  // Whenever a fresh result lands AND the user is on Clear/Deep, read
  // back the IDB record to surface the existing pinned state on the
  // button. (Auto-cache write fires from inside run(); we only need
  // to read after it settles.)
  useEffect(() => {
    if (!result) return;
    if (plan !== "clear" && plan !== "deep") return;
    let cancelled = false;
    (async () => {
      const entry = await getCachedWord(lang, initialWord);
      if (!cancelled) setIsPinned(Boolean(entry?.pinned));
    })();
    return () => { cancelled = true; };
  }, [result, plan, lang, initialWord]);

  function handleAction(id: "save" | "image" | "compose" | "practice" | "compare" | "kids") {
    if (id === "save") return handleSave();
    if (id === "image") return handleGenerate();
    if (id === "compose") {
      if (!user) {
        promptLogin(v2(lang, "composeSubmit"));
        return;
      }
      if (plan === "basic") {
        router.push(href("/pricing"));
        return;
      }
      setComposeOpen(true);
      return;
    }
    if (id === "practice") {
      if (!user) {
        promptLogin(v2(lang, "quizEyebrow"));
        return;
      }
      if (plan !== "deep") {
        router.push(href("/pricing"));
        return;
      }
      setQuizOpen(true);
      return;
    }
    if (id === "compare") {
      // "Word games" entry point — Deep-tier feature. Opens the
      // WordGameModal which runs a mini-session anchored to THIS word
      // (anagram + fill-blank). The hub at /play stays as the broad
      // multi-word session. Anonymous → signup; basic/clear → pricing;
      // deep → modal.
      if (!user) {
        promptLogin(v2(lang, "actionCompare"));
        return;
      }
      if (plan !== "deep") {
        router.push(href("/pricing"));
        return;
      }
      setWordGameOpen(true);
      return;
    }
    if (id === "kids") {
      // Kids' explanation gates on Clear+ tier (per existing KidsCard
      // locked logic). For now, route anonymous → signup, basic → pricing,
      // clear/deep → no-op (will surface inline kids modal in next iter).
      if (!user) {
        promptLogin(v2(lang, "forKids"));
        return;
      }
      if (plan === "basic") {
        router.push(href("/pricing"));
        return;
      }
      // TODO: open a kids-explanation modal. For now this is a soft
      // landing — the data exists in result.meanings[i].kidsExplanation
      // and a dedicated modal will be wired in the next iter.
      return;
    }
  }

  // ── Render ─────────────────────────────────────────────────────
  // Wordbook redesign — the entire /word/[word] page lives on cream
  // paper, no navy stage, no starfield. The V2 MarketingHeader is
  // intentionally NOT rendered here: it's dark navy chrome that
  // clashes with the cream surface and adds noise above the word.
  // A minimal wordmark + home link in `.wb-shell-topbar` takes its
  // place; Save / Share live inside ResultView's own topbar.
  return (
    <div
      className={`wordbook wb-shell-page${familyRole === "kid" ? " wb-kid-bg" : ""}`}
      dir={dir}
      style={classroomCode ? skinStyleVars(classroomSkin) : undefined}
    >
      {saveFlash && (
        <div
          className={`wb-save-toast ${saveError ? "is-error" : ""}`}
          role="status"
        >
          {saveError
            ? (lang === "he" ? "השמירה נכשלה, נסו שוב" :
               lang === "ar" ? "فشل الحفظ, حاول مرة أخرى" :
               lang === "ru" ? "Не удалось сохранить, попробуйте снова" :
               lang === "es" ? "Error al guardar, inténtalo de nuevo" :
               lang === "pt" ? "Falha ao salvar, tente novamente" :
               lang === "fr" ? "Échec de l'enregistrement, réessayez" :
               lang === "de" ? "Speichern fehlgeschlagen, erneut versuchen" :
               lang === "cs" ? "Uložení selhalo, zkuste to znovu" :
               lang === "sk" ? "Uloženie zlyhalo, skús to znova" :
               lang === "it" ? "Salvataggio fallito, riprova" :
               lang === "ja" ? "保存に失敗しました。もう一度お試しください" :
               lang === "hi" ? "सहेजना असफल, फिर से कोशिश करें" :
               "Save failed, try again")
            : v2(lang, "savedToWordBook")}
        </div>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Classroom mode hides the full Gadit chrome entirely (logo,
            nav, plan badge, lang switch, share, account menu). Gadi
            (2026-06-28) also removed the minimal mustard "back to
            classroom" strip after the persistent search bar below
            turned out to do the same job — typing a new word in the
            persistent bar now preserves the ?cls= param so the kid
            stays in classroom mode and the search keeps logging.

            2026-08-25 (Gadi): the fully-stripped word page left kids with
            no way back to Class Notebook / Word Games / Say it. Restore the
            classroom topbar (the search itself stays in the persistent bar
            below). */}
        {classroomCode && <ClassroomTopbar code={classroomCode} lang={lang} />}
        {!classroomCode && !present && (
        <header className="wb-shell-topbar">
          <Link href={href("/")} className="wb-wordmark" dir="ltr" aria-label="Gadit home">
            Gad<span className="wb-wordmark-it">it</span>
          </Link>
          <WbShellNav />
          <div className="wb-shell-actions">
            {/* Kid skin picker, so a kid can change their look from the word
                page too (it was on home/notebook/play but missing here, where
                the skin is most visible). Gadi 2026-08-21. */}
            {familyRole === "kid" && <AppearancePicker scope="kid" />}
            <KidsModeToggle
              plan={plan}
              onBasicGate={() => {
                if (!user) {
                  promptLogin(v2(lang, "kidsModeBasicGate"));
                  return;
                }
                setUpgradeTrigger({ feature: "kids", tier: "clear" });
              }}
            />
            {user && (
              <ShareButton
                url="https://www.gadit.app/"
                title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
                text=""
                shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
                copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
              />
            )}
            <WordbookLangSwitch />
            {user ? (
              <WbUserMenu />
            ) : (
              <>
                <StartFreeCTA />
                <button
                  type="button"
                  className="wb-shell-link"
                  onClick={() => promptLogin({ mode: "signin" })}
                >
                  {v2(lang, "signIn")}
                </button>
              </>
            )}
          </div>
        <div className="wb-shell-mobile-cta">
          <StartFreeCTA />
        </div>
        {/* Mobile identity cluster, Share + Avatar live inline next to
            the wordmark so the corner reads as "you, signed in" the way
            Google's mobile chrome does. Pulled out of the old
            wb-shell-share-mobile-wrap (which now holds only the Kids
            toggle). 2026-06-19 Gadi feedback. */}
        {user && (
          <div className="wb-shell-mobile-identity">
            {/* Kid skin picker on mobile (desktop one is in the hidden
                .wb-shell-actions), mirroring notebook/play. Gadi 2026-08-21. */}
            {familyRole === "kid" && <AppearancePicker scope="kid" />}
            <ShareButton
              url="https://www.gadit.app/"
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
            <WbUserMenu />
          </div>
        )}
        <div className="wb-shell-share-mobile-wrap">
          {/* Mobile mirror of the Kids toggle. The desktop toggle lives
              inside .wb-shell-actions (hidden under 767px), so without
              this mirror a parent on a phone could not flip the mode
              mid-read. */}
          <KidsModeToggle
            plan={plan}
            onBasicGate={() => {
              if (!user) {
                promptLogin(v2(lang, "kidsModeBasicGate"));
                return;
              }
              setUpgradeTrigger({ feature: "kids", tier: "clear" });
            }}
          />
        </div>
        <div className="wb-shell-mobile-menu-cluster">
          <LangSwitchMobile />
          <WbShellBurger />
        </div>

        </header>
        )}

        {/* Present-mode toggle (schools council 2026-08-05). A subtle
            corner button that hides/shows the top chrome so a teacher can
            project a clean word view to the whole class. SCHOOLS ONLY
            (Gadi 2026-08-13): it was showing for every signed-in user,
            where in RTL it sat top-left, covered the hamburger, and a
            family parent couldn't find her way back — pure confusion for
            anyone who isn't a teacher. Hidden inside the /c/ classroom kid
            view too. */}
        {user && !!schoolId && !classroomCode && (
          <button
            type="button"
            onClick={() => setPresent((p) => !p)}
            aria-label={present ? "Exit present mode" : "Present mode"}
            title={present ? "Exit present mode" : "Present mode, a clean view for the classroom screen"}
            style={{
              position: "fixed",
              top: 12,
              insetInlineEnd: 12,
              zIndex: 50,
              width: 40,
              height: 40,
              borderRadius: 10,
              border: "1px solid rgba(31,41,55,0.12)",
              background: "rgba(255,255,255,0.72)",
              color: "#6b7280",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              boxShadow: "0 1px 4px rgba(31,41,55,0.08)",
            }}
          >
            {present ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3" />
              </svg>
            )}
          </button>
        )}

        {/* "Open dictionary" button, present mode only. We are showing
            words on the board, not searching, so the search field is
            hidden until the teacher taps this (schools, Gadi 2026-08-09). */}
        {present && user && !classroomCode && (
          <button
            type="button"
            onClick={() => setShowSearch((s) => !s)}
            style={{
              position: "fixed",
              top: 12,
              insetInlineStart: 12,
              zIndex: 50,
              height: 40,
              borderRadius: 999,
              border: "1px solid rgba(31,41,55,0.12)",
              background: showSearch ? "#0EA5A5" : "rgba(255,255,255,0.85)",
              color: showSearch ? "#fff" : "#0b7d7d",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "0 14px",
              fontWeight: 700,
              fontSize: 13.5,
              fontFamily: "inherit",
              boxShadow: "0 1px 4px rgba(31,41,55,0.08)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            {lang === "he" ? "חיפוש במילון" : "Search dictionary"}
          </button>
        )}

        {/* Word-set stepper: prev / position / next, fixed at the bottom
            so a teacher can walk a themed set on the projector. Arrow keys
            page too. */}
        {wordSet && setIdx >= 0 && (
          <div style={{ position: "fixed", insetInlineStart: 0, insetInlineEnd: 0, bottom: 16, display: "flex", justifyContent: "center", zIndex: 50, pointerEvents: "none" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.94)", border: "1px solid rgba(31,41,55,0.12)", borderRadius: 999, padding: "8px 12px", boxShadow: "0 4px 16px rgba(31,41,55,0.14)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", pointerEvents: "auto", maxWidth: "92vw" }}>
              <button
                type="button"
                aria-label="Previous word"
                disabled={setIdx <= 0}
                onClick={() => goToSetWord(wordSet.words[setIdx - 1])}
                style={{ width: 34, height: 34, borderRadius: 999, border: "none", background: setIdx <= 0 ? "#F3F4F6" : "#0EA5A5", color: setIdx <= 0 ? "#9CA3AF" : "#fff", cursor: setIdx <= 0 ? "default" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {wordSet.title} · {setIdx + 1}/{wordSet.words.length}
              </span>
              <button
                type="button"
                aria-label="Next word"
                disabled={setIdx >= wordSet.words.length - 1}
                onClick={() => goToSetWord(wordSet.words[setIdx + 1])}
                style={{ width: 34, height: 34, borderRadius: 999, border: "none", background: setIdx >= wordSet.words.length - 1 ? "#F3F4F6" : "#0EA5A5", color: setIdx >= wordSet.words.length - 1 ? "#9CA3AF" : "#fff", cursor: setIdx >= wordSet.words.length - 1 ? "default" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* Persistent search bar, Eyal (June 2026) flagged that
            — in classroom mode this bar fully replaces the regular
            topbar's search functionality (the bar's onSubmit
            preserves the ?cls= param so subsequent searches still
            log to the classroom). */}
        {/* (placeholder anchor — same comment block continues below) */}
        {/* Persistent search bar, Eyal (June 2026) flagged that
            launching a second search from a result page meant hunting
            for the magnifying-glass icon in the masthead. Many real
            dictionaries surface a full input bar above the word so a
            reader can chain lookups without breaking flow. We do the
            same: a single text field + submit that reuses the
            existing /word/[word] route. The input lives BETWEEN the
            chrome and the result body so the word title still anchors
            the page. */}
        {/* The searchbar wrap is wrapped in a sticky stage so the input
            stays in view as the reader scrolls past long etymology +
            idiom sections. Gadi 2026-06-26 audit fix M1. */}
        <div className="wb-word-searchbar-stage" style={present ? (showSearch ? { marginTop: 64, marginBottom: 20 } : { display: "none" }) : undefined}>
        <div className="wb-word-searchbar-wrap">
          <form
            className="wb-word-searchbar"
            onSubmit={(e) => {
              e.preventDefault();
              const q = headerQuery.trim();
              if (!q) return;
              setHeaderQuery("");
              // Preserve the classroom context when the persistent
              // search bar is used inside a classroom session — the
              // kid stays in classroom mode AND the new word gets
              // logged to the class search log via the existing
              // ?cls= side-effect. Without this, a kid who types a
              // second word into the persistent bar loses the
              // classroom branding and the log entry.
              const clsParam = classroomCode
                ? `?cls=${encodeURIComponent(classroomCode)}${classroomStudentName ? `&sn=${encodeURIComponent(classroomStudentName)}` : ""}`
                : "";
              router.push(href(wordPath(q, clsParam)));
            }}
          >
            {/* Convention layout, same recipe the homepage pill follows
                (LLM Council R3 2026-06-20): input at the START edge,
                action cluster (mic + magnifier-submit) at the END.
                Dropped the leading decorative magnifier and the labelled
                "Search" button; the trailing magnifier IS the submit
                now. Enter still submits. RTL auto-mirrors via the
                wordbook[dir] cascade. */}
            <input
              type="text"
              className="wb-word-searchbar-input"
              value={headerQuery}
              onChange={(e) => setHeaderQuery(e.target.value)}
              placeholder={v2(lang, "searchPlaceholderHome")}
              aria-label={v2(lang, "navSearch")}
              autoComplete="off"
              spellCheck={false}
            />
            <div className="wb-word-searchbar-mic">
              <VoiceInput
                uiLang={lang}
                getIdToken={async () => {
                  if (!user) return null;
                  try { return await user.getIdToken(); } catch { return null; }
                }}
                onResult={(text) => {
                  setHeaderQuery(text);
                  const clsParam = classroomCode
                ? `?cls=${encodeURIComponent(classroomCode)}${classroomStudentName ? `&sn=${encodeURIComponent(classroomStudentName)}` : ""}`
                : "";
                  router.push(href(wordPath(text.trim(), clsParam)));
                }}
                enabled={true}
                title={v2(lang, "voiceInputTitle")}
                size="sm"
              />
            </div>
            <button
              type="submit"
              className="wb-word-searchbar-submit"
              aria-label={v2(lang, "navSearch")}
              title={v2(lang, "navSearch")}
              disabled={!headerQuery.trim()}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m20 20-4-4" />
              </svg>
            </button>
          </form>
        </div>
        </div>

        {/* V2 main, holds quota walls, error messages, and the
            loading skeleton. Once the Wordbook result is loaded, this
            entire block is unmounted so the cream ResultView below
            sits flush against the MarketingHeader instead of being
            pushed offscreen by an empty 60px main wrapper. */}
        {!result && (
        <main
          style={{
            maxWidth: 880,
            margin: "0 auto",
            padding: "24px 24px 36px",
          }}
        >
          {quotaState.reached && (
            <SoftWall
              nextStep={quotaState.nextStep ?? "signup"}
              lang={lang}
              onSignUp={() => {
                promptLogin({
                  mode: "signup",
                  onSuccess: () => {
                    // Once they're signed in, retry the original word —
                    // they've now got the 20/day quota.
                    setQuotaState({ reached: false, nextStep: null });
                    fetchedFor.current = null;
                    setLoading(true);
                  },
                });
              }}
            />
          )}

          {errorMsg && !quotaState.reached && (
            <div
              className="gd-card"
              style={{ padding: "24px", marginBottom: 24 }}
            >
              <p
                className="gd-font-sans-ui"
                style={{ fontSize: 14, color: "var(--gd-ink-700)" }}
              >
                {errorMsg}
              </p>
            </div>
          )}

          {loading && !result && (
            <div style={{ paddingTop: 24 }}>
              <div className="wb-skeleton" style={{ height: 120 }} />
              <div className="wb-skeleton" style={{ height: 220 }} />
              <div className="wb-skeleton" style={{ height: 160 }} />
            </div>
          )}

        </main>
        )}

        {/* Wordbook redesign: ResultView renders full-width on its own
            cream paper, breaking out of the V2 navy `main` constraint
            above. Loading/error/soft-wall states still render inside
            the V2 main; once the result is loaded, the cream Wordbook
            page takes over.  See web/public/gadit-final.html. */}
        {result && typedOriginal && typedOriginal !== result.word && (
          <div className="wb-typo-banner" role="status">
            {lang === "he" ? (
              <>
                מציג תוצאות עבור <strong>{result.word}</strong>
                {" · "}
                <Link href={`/word/${encodeURIComponent(typedOriginal)}?stay=1`}>
                  חפש בכל זאת את &ldquo;{typedOriginal}&rdquo;
                </Link>
              </>
            ) : lang === "ar" ? (
              <>
                عرض نتائج لـ <strong>{result.word}</strong>
                {" · "}
                <Link href={`/word/${encodeURIComponent(typedOriginal)}?stay=1`}>
                  ابحث بدلاً من ذلك عن &ldquo;{typedOriginal}&rdquo;
                </Link>
              </>
            ) : lang === "ru" ? (
              <>
                Результаты для <strong>{result.word}</strong>
                {" · "}
                <Link href={`/word/${encodeURIComponent(typedOriginal)}?stay=1`}>
                  Искать вместо этого &ldquo;{typedOriginal}&rdquo;
                </Link>
              </>
            ) : lang === "hi" ? (
              <>
                <strong>{result.word}</strong> के परिणाम दिखा रहे हैं
                {" · "}
                <Link href={`/word/${encodeURIComponent(typedOriginal)}?stay=1`}>
                  इसके बजाय &ldquo;{typedOriginal}&rdquo; खोजें
                </Link>
              </>
            ) : (
              <>
                Showing results for <strong>{result.word}</strong>
                {" · "}
                <Link href={`/word/${encodeURIComponent(typedOriginal)}?stay=1`}>
                  Search instead for &ldquo;{typedOriginal}&rdquo;
                </Link>
              </>
            )}
          </div>
        )}
        {/* 'Back to <previous word>' chip, appears whenever the user
            landed on this page via the WordPopover's 'Open full
            definition' button (which appends ?back=<originalWord> so
            the destination knows where the reader came from). Clicking
            returns to the original word's page. Hidden in the normal
            search flow when there's no back context. */}
        {result && backWord && backWord.toLowerCase() !== result.word.toLowerCase() && (
          <div className="wb-back-chip-wrap">
            <Link href={href(`/word/${encodeURIComponent(backWord)}`)} className="wb-back-chip">
              <span aria-hidden="true">{dir === "rtl" ? "→" : "←"}</span>
              <span>
                {lang === "he" ? "חזרה אל " :
                 lang === "ar" ? "العودة إلى " :
                 lang === "ru" ? "Назад к " :
                 lang === "es" ? "Volver a " :
                 lang === "pt" ? "Voltar a " :
                 lang === "fr" ? "Retour à " :
                 lang === "de" ? "Zurück zu " :
                 lang === "cs" ? "Zpět na " :
                 lang === "sk" ? "Späť na " :
                 lang === "it" ? "Torna a " :
                 lang === "ja" ? " に戻る "  :
                 lang === "hi" ? " पर वापस " :
                 "Back to "}
                <strong>{backWord}</strong>
              </span>
            </Link>
          </div>
        )}
        {/* Inline image-gen error, surfaces the quota / failure /
            network error the silent path used to swallow. Self-
            dismissing close button so users can clear it once they've
            seen it. */}
        {result && imageError && (
          <div className="wb-image-error-banner" role="alert">
            <span>{imageError}</span>
            <button
              type="button"
              onClick={() => setImageError(null)}
              aria-label={lang === "he" ? "סגור" : lang === "cs" ? "Zavřít" : lang === "sk" ? "Zavrieť" : lang === "hi" ? "बंद करें" : lang === "ja" ? "閉じる" : "Close"}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        {result && (classroomMode ? (
          <div
            className="wb-classroom-card"
            style={{ maxWidth: 760, margin: "0 auto", paddingTop: 72, textAlign: dir === "rtl" ? "right" : "left" }}
          >
            {/* The word itself, big — this is what the class is looking at. */}
            <div style={{ fontSize: 46, lineHeight: 1.1, fontWeight: 800, color: "#0b7d7d", marginBottom: 16 }}>
              {result.word}
            </div>
            <p style={{ fontSize: 24, lineHeight: 1.65, fontWeight: 600, color: "#1f2937", margin: "0 0 20px" }}>
              {curatedDef(initialWord) ?? result.meanings[0]?.meaning ?? ""}
            </p>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={result.word}
                style={{ display: "block", maxWidth: 380, width: "100%", borderRadius: 14, margin: "0 auto 22px", boxShadow: "0 4px 18px rgba(31,41,55,0.10)" }}
              />
            ) : imageGenerating ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "20px 0", color: "#9CA3AF" }} aria-busy="true">
                <svg className="wb-image-spinner" width="40" height="40" viewBox="0 0 44 44" aria-hidden="true">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="3" />
                  <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="28 84" />
                </svg>
                <span style={{ fontSize: 14 }}>{lang === "he" ? "מכינים תמונה..." : "Preparing a picture..."}</span>
              </div>
            ) : null}
            {(() => {
              // Prefer the subject-appropriate curated examples; fall back
              // to the general define examples until (or unless) those land.
              const shownExamples = classroomExamples.length
                ? classroomExamples
                : result.meanings[0]?.examples ?? [];
              return shownExamples.length ? (
                <div style={{ marginTop: 6, display: "grid", gap: 10 }}>
                  {shownExamples.slice(0, 3).map((ex, i) => (
                    <div key={i} style={{ fontSize: 19, lineHeight: 1.6, color: "#374151" }}>
                      <span style={{ color: "#0EA5A5", fontWeight: 800, marginInlineEnd: 8 }}>{i + 1}</span>{ex}
                    </div>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        ) : (
          <ResultView
            result={displayResult ?? result}
            showNiqqud={(isHebrewWord || isArabicWord) && !!user}
            niqqudOn={niqqud}
            onToggleNiqqud={toggleNiqqud}
            plan={plan}
            classroomInSession={classroomInSession}
            imageUrl={imageUrl}
            imageGenerating={imageGenerating}
            kidsImages={kidsImages}
            kidsImagesLoading={kidsImgLoading}
            isSaved={isSaved}
            onSave={handleSave}
            onShare={handleShare}
            isPinned={isPinned}
            onPin={plan === "clear" || plan === "deep" ? handlePin : undefined}
            onGenerate={handleGenerate}
            onUpgrade={handleUpgrade}
            onRegenerate={handleGenerate}
            onSaveImage={handleSave}
            onAction={handleAction}
            onReport={(section) => {
              const presetMap: Record<string, string> = {
                etymology: "etymology",
                idioms: "idioms",
              };
              const preset = section.startsWith("meaning-")
                ? "definition"
                : presetMap[section] ?? "";
              setReportContext({
                word: result.word,
                contextSnapshot: { section, result },
                defaultCategories: preset ? [preset] : [],
              });
            }}
          />
        ))}

        {/* HomeFooter intentionally omitted on /word pages, the V2
            navy footer clashes with the cream Wordbook surface. A
            cream-friendly footer (or no footer at all, matching the
            mockup) will be addressed in the homepage port. */}

        {!present && <GadVerbStamp />}
      </div>

      {result && (
        <ComposeModalV2
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          word={result.word}
          meanings={result.meanings.map((m) => m.meaning)}
        />
      )}

      <ReportModalV2
        open={reportContext !== null}
        onClose={() => setReportContext(null)}
        context={reportContext ?? undefined}
      />

      {result && (
        <QuizModalV2
          open={quizOpen}
          onClose={() => setQuizOpen(false)}
          word={result.word}
          meaning={result.meanings[0]?.meaning ?? ""}
          language={result.language}
        />
      )}

      {result && (
        <WordGameModal
          open={wordGameOpen}
          onClose={() => setWordGameOpen(false)}
          word={result.word}
          language={result.language}
          meaning={result.meanings[0]?.meaning ?? ""}
          examples={result.meanings.flatMap((m) => m.examples ?? []).filter((s) => typeof s === "string" && s.trim().length > 4)}
        />
      )}

      <UpgradeModal
        trigger={upgradeTrigger}
        lang={lang as "he" | "en" | "ar" | "ru" | "es" | "pt" | "fr"}
        dir={dir}
        onClose={() => setUpgradeTrigger(null)}
      />
    </div>
  );
}

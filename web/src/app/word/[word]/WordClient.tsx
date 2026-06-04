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
import { LANGUAGES, type Lang } from "@/lib/i18n";
import { track } from "@/lib/track";

import { MarketingHeader } from "@/components/design/MarketingHeader";
import { HomeFooter } from "@/components/design/home";
import { ComposeModalV2 } from "@/components/design/ComposeModalV2";
import { QuizModalV2 } from "@/components/design/QuizModalV2";
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
const ANON_DAILY_LIMIT_CLIENT = 5;

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
    /* localStorage full / blocked — silent */
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
  const isSignup = nextStep === "signup";
  return (
    <div
      className="gd-card"
      style={{
        padding: "clamp(32px, 4vw, 48px) clamp(28px, 4vw, 44px)",
        marginBottom: 24,
        textAlign: "center",
      }}
    >
      <h2
        className="gd-font-display"
        style={{
          fontSize: "clamp(28px, 3.4vw, 36px)",
          color: "var(--gd-ink-900)",
          marginBottom: 12,
          fontVariationSettings: '"opsz" 60',
          letterSpacing: "-0.015em",
        }}
      >
        {v2(lang, isSignup ? "softWallAnonTitle" : "softWallBasicTitle")}
      </h2>
      <p
        className="gd-font-sans-ui"
        style={{
          fontSize: 15,
          color: "var(--gd-ink-700)",
          maxWidth: "44ch",
          margin: "0 auto 24px",
          lineHeight: 1.5,
        }}
      >
        {v2(lang, isSignup ? "softWallAnonBody" : "softWallBasicBody")}
      </p>
      {isSignup ? (
        <button
          type="button"
          onClick={onSignUp}
          className="gd-font-sans-ui font-medium"
          style={{
            padding: "13px 26px",
            borderRadius: 12,
            fontSize: 14.5,
            color: "white",
            background:
              "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
            boxShadow:
              "0 0 0 1px oklch(0.5 0.2 250 / 0.55), 0 8px 22px oklch(0.5 0.2 250 / 0.4)",
          }}
        >
          {v2(lang, "softWallSignupCta")}
        </button>
      ) : (
        <Link
          href="/pricing"
          className="gd-font-sans-ui font-medium"
          style={{
            display: "inline-block",
            padding: "13px 26px",
            borderRadius: 12,
            fontSize: 14.5,
            color: "white",
            background:
              "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
            boxShadow:
              "0 0 0 1px oklch(0.5 0.2 250 / 0.55), 0 8px 22px oklch(0.5 0.2 250 / 0.4)",
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

export function WordClient({ initialWord }: { initialWord: string }) {
  const { user, plan: authPlan, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const contextSentence = searchParams?.get("sentence")?.trim() || "";
  // When wrong-keyboard auto-correct fires, the original mis-typed
  // word is preserved in ?from=… so we can show a banner that lets
  // the user override and search the original anyway. ?stay=1 is
  // set by that override link to skip the redirect on re-entry.
  const typedOriginal = searchParams?.get("from")?.trim() || "";
  const stayOnInput = searchParams?.get("stay") === "1";

  const [result, setResult] = useState<WordResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Wrong-keyboard rescue: if a Hebrew user types 'nxnr' (the physical
  // keys for מסמר with English keyboard on), or vice-versa, silently
  // redirect to the corrected word. The replaced URL keeps the typo
  // in ?from= so the result page can offer a "search instead for…"
  // override link. ?stay=1 short-circuits the detection on re-entry.
  useEffect(() => {
    if (stayOnInput) return;
    const corrected = detectWrongKeyboard(initialWord, lang);
    if (corrected && corrected !== initialWord) {
      router.replace(
        `/word/${encodeURIComponent(corrected)}?from=${encodeURIComponent(initialWord)}`,
      );
    }
  }, [initialWord, lang, router, stayOnInput]);
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
  const [composeOpen, setComposeOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
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

  useEffect(() => {
    if (!initialWord) return;
    const key = `${initialWord}::${user?.uid ?? "anon"}`;
    if (fetchedFor.current === key) return;
    fetchedFor.current = key;

    let cancelled = false;
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setQuotaState({ reached: false, nextStep: null });
      setErrorMsg("");
      setResult(null);
      setImageUrl(undefined);
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
      if (!res.ok || !res.body) {
        setErrorMsg(`HTTP ${res.status}`);
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
                setResult({
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
  }, [initialWord, lang, user, contextSentence]);

  // ── Action handlers ───────────────────────────────────────────
  async function handleGenerate() {
    if (!result || !user) {
      promptLogin(v2(lang, "generateImage"));
      return;
    }
    if (imageGenerating) return; // guard against double-click
    setImageGenerating(true);
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
          meaning: result.meanings[0]?.meaning ?? "",
          uiLang: lang,
        }),
      });
      if (!res.ok) {
        if (res.status === 402) {
          router.push("/pricing");
          return;
        }
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) setImageUrl(data.url);
    } catch (e) {
      console.error("generate-image:", e);
    } finally {
      setImageGenerating(false);
    }
  }

  function handleUpgrade() {
    router.push("/pricing");
  }

  async function handleSave() {
    if (!user) {
      promptLogin(v2(lang, "saveToNotebook"));
      return;
    }
    if (!result) return;
    // Notebook is a Clear-tier feature (Basic free plan does not
    // include it). Anything below Clear gets routed to /pricing.
    if (plan === "basic") {
      router.push("/pricing");
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
          word: result.word,
          uiLang: lang,
          meaning: result.meanings[0]?.meaning ?? "",
        }),
      });
      if (res.ok) {
        setIsSaved(true);
        setSaveFlash(true);
        window.setTimeout(() => setSaveFlash(false), 2400);
      }
    } catch (e) {
      console.error("notebook:", e);
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
        .share({ title: `Gadit — ${result?.word ?? ""}`, url })
        .catch(() => undefined);
    } else {
      nav.clipboard?.writeText(url).catch(() => undefined);
    }
  }

  function handleAction(id: "save" | "image" | "compose" | "practice" | "compare" | "kids") {
    if (id === "save") return handleSave();
    if (id === "image") return handleGenerate();
    if (id === "compose") {
      if (!user) {
        promptLogin(v2(lang, "composeSubmit"));
        return;
      }
      if (plan === "basic") {
        router.push("/pricing");
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
        router.push("/pricing");
        return;
      }
      setQuizOpen(true);
      return;
    }
    if (id === "compare") {
      // Compare is a Deep-tier feature (product call — pairs with
      // quiz/practice as the advanced learning surface, Clear stays
      // focused on understanding a single word). Anonymous → signup;
      // basic/clear → pricing; deep → /compare with the word prefilled.
      if (!user) {
        promptLogin(v2(lang, "actionCompare"));
        return;
      }
      if (plan !== "deep") {
        router.push("/pricing");
        return;
      }
      if (result?.word) {
        router.push(`/compare?w=${encodeURIComponent(result.word)}`);
      } else {
        router.push("/compare");
      }
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
        router.push("/pricing");
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
    <div className="wordbook wb-shell-page" dir={dir}>
      {saveFlash && (
        <div className="wb-save-toast" role="status">
          {v2(lang, "savedToWordBook")}
        </div>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <header className="wb-shell-topbar">
          <Link href="/" className="wb-wordmark" dir="ltr" aria-label="Gadit home">
            Gad<span className="wb-wordmark-it">it</span>
          </Link>
          <nav className="wb-shell-nav" aria-label="Primary">
            <Link href="/">{v2(lang, "navSearch")}</Link>
            {user && (
              <Link href="/notebook">{v2(lang, "navNotebook")}</Link>
            )}
            <Link href="/pricing">{v2(lang, "navPricing")}</Link>
          </nav>
          <div className="wb-shell-actions">
            {/* Save + Share moved OUT of the masthead — they're "this
                entry" actions belonging to the definition, not site
                navigation. They render alongside the word title inside
                WordHeader. The masthead stays a calm chrome strip for
                nav + language + auth. */}
            <ShareButton
              url="https://www.gadit.app/"
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).text}
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
            <WordbookLangSwitch />
            {user ? (
              <Link href="/account" className="wb-avatar" aria-label="Account">
                {user.photoURL ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={user.photoURL} alt="" />
                ) : (
                  <span>{(user.email?.[0] || "G").toUpperCase()}</span>
                )}
              </Link>
            ) : (
              <button
                type="button"
                className="wb-shell-link"
                onClick={() => promptLogin({ mode: "signin" })}
              >
                {v2(lang, "signIn")}
              </button>
            )}
          </div>
        <div className="wb-shell-share-mobile-wrap">
          <ShareButton
            url="https://www.gadit.app/"
            title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
            text={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).text}
            shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
            copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
          />
        </div>

        </header>

        {/* V2 main — holds quota walls, error messages, and the
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
        {result && (
          <ResultView
            result={result}
            plan={plan}
            imageUrl={imageUrl}
            imageGenerating={imageGenerating}
            isSaved={isSaved}
            onSave={handleSave}
            onShare={handleShare}
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
        )}

        {/* HomeFooter intentionally omitted on /word pages — the V2
            navy footer clashes with the cream Wordbook surface. A
            cream-friendly footer (or no footer at all, matching the
            mockup) will be addressed in the homepage port. */}
      </div>

      {result && (
        <ComposeModalV2
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          word={result.word}
          meaning={result.meanings[0]?.meaning ?? ""}
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
        />
      )}
    </div>
  );
}

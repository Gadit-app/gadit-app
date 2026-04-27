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
import { useRouter } from "next/navigation";
import { parse as parsePartialJson, Allow } from "partial-json";
import Link from "next/link";

import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
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

  const [result, setResult] = useState<WordResult | null>(null);
  const [loading, setLoading] = useState(true);
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
          body: JSON.stringify({ word: initialWord, uiLang: lang }),
        });
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(String(e));
          setLoading(false);
        }
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
                setResult({
                  word: partial.word ?? initialWord,
                  language: partial.language ?? "",
                  meanings: partial.meanings ?? [],
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
    };
    // Deps intentionally minimal: only the inputs that should
    // *trigger* a re-fetch. plan + promptLogin used to be here and
    // caused the fetch to re-fire on every auth-context render —
    // which combined with StrictMode produced 2 in-flight fetches
    // and a skeleton that never settled (the second fetch's setState
    // races the first's). plan is read inside run() via the
    // surrounding closure; promptLogin via promptLoginRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialWord, lang, user]);

  // ── Action handlers ───────────────────────────────────────────
  async function handleGenerate() {
    if (!result || !user) {
      promptLogin(v2(lang, "generateImage"));
      return;
    }
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
      const data = (await res.json()) as { imageUrl?: string };
      if (data.imageUrl) setImageUrl(data.imageUrl);
    } catch (e) {
      console.error("generate-image:", e);
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
    if (plan !== "deep") {
      router.push("/pricing");
      return;
    }
    try {
      const idToken = await user.getIdToken();
      await fetch("/api/notebook", {
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

  function handleAction(id: "save" | "image" | "compose" | "practice") {
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
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="gd-stage" style={{ minHeight: "100vh" }} dir={dir}>
      <div className="gd-stars" />
      <div style={{ position: "relative", zIndex: 1 }}>
        <MarketingHeader />

        <main
          style={{
            // Tightened from 920/32-48 to 880/24-36 so meanings fall
            // higher on the page — beta tester wanted less scroll
            // before getting to the actual definitions.
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
            <div className="flex flex-col gap-6">
              <SkeletonCard height={180} />
              <SkeletonCard height={360} />
              <SkeletonCard height={220} />
            </div>
          )}

          {/* Soft heads-up for anonymous visitors approaching their
              5/day cap. Shows above the result on search 4 (2 left)
              and search 5 (1 left). Click → opens signup modal in
              context. Doesn't block reading the current result. */}
          {result && anonSearchesLeft !== null && !user && (
            <button
              type="button"
              onClick={() => promptLogin({ mode: "signup" })}
              className="w-full text-start mb-4 transition-colors hover:bg-white/10"
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: "oklch(0.72 0.19 245 / 0.12)",
                boxShadow: "inset 0 0 0 1px oklch(0.72 0.19 245 / 0.35)",
                color: "oklch(0.92 0.05 245)",
                fontSize: 13,
              }}
            >
              {v2(lang, "softBannerSearchesLeft", anonSearchesLeft)}
            </button>
          )}

          {result && (
            <ResultView
              result={result}
              plan={plan}
              imageUrl={imageUrl}
              onSave={handleSave}
              onShare={handleShare}
              onGenerate={handleGenerate}
              onUpgrade={handleUpgrade}
              onRegenerate={handleGenerate}
              onSaveImage={handleSave}
              onAction={handleAction}
              onReport={(section) => {
                // Map ResultView's section ids to Report Modal default
                // categories so the user starts with the most-likely
                // category pre-ticked.
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
        </main>

        <HomeFooter />
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

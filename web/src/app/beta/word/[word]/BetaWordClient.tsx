"use client";

/**
 * BetaWordClient — V2 result page.
 *
 * Streams from /api/define exactly like the legacy page.tsx, but renders
 * with ResultView V2 on the dark navy stage. Handles:
 *   - 401 → opens login modal (V2 path requires sign-in like the legacy one)
 *   - 429 → quota card with Upgrade CTA
 *   - SSE delta events → progressive partial render (skeleton-friendly)
 *   - SSE done event → final result + cache flag
 *
 * Image generation, save-to-notebook, share, action tile clicks are wired
 * to the existing legacy endpoints — no new backend work needed.
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
import {
  ResultView,
  type WordResult,
  type Plan,
} from "@/components/design/result";

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

export function BetaWordClient({ initialWord }: { initialWord: string }) {
  const { user, plan: authPlan, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();

  const [result, setResult] = useState<WordResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotaReached, setQuotaReached] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  // Plan as the API gates it: anonymous → "basic", auth-context → server.
  const plan: Plan = authPlan ?? "basic";

  // Guard against double-firing in dev StrictMode
  const fetchedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!initialWord) return;
    if (fetchedFor.current === initialWord) return;
    fetchedFor.current = initialWord;

    let cancelled = false;

    async function run() {
      setLoading(true);
      setQuotaReached(false);
      setErrorMsg("");
      setResult(null);
      setImageUrl(undefined);

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

      if (res.status === 401) {
        promptLogin(v2(lang, "signIn"));
        setLoading(false);
        return;
      }
      if (res.status === 429) {
        setQuotaReached(true);
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
          surface: "beta",
        });
      } else if (!cancelled) {
        setErrorMsg("Stream ended without final result");
      }
      setLoading(false);
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [initialWord, lang, user, plan, promptLogin]);

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
          router.push("/beta/pricing");
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
    router.push("/beta/pricing");
  }

  async function handleSave() {
    if (!user) {
      promptLogin(v2(lang, "saveToNotebook"));
      return;
    }
    if (!result) return;
    if (plan !== "deep") {
      router.push("/beta/pricing");
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
      // Compose lives at the legacy /word/[w]?compose=1 — port post-launch.
      router.push(`/word/${encodeURIComponent(result?.word ?? initialWord)}`);
      return;
    }
    if (id === "practice") {
      router.push("/notebook");
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
            maxWidth: 920,
            margin: "0 auto",
            padding: "32px 24px 48px",
          }}
        >
          {quotaReached && (
            <div
              className="gd-card"
              style={{
                padding: "32px",
                marginBottom: 24,
                background:
                  "linear-gradient(180deg, oklch(0.985 0.008 85), oklch(0.97 0.01 85))",
              }}
            >
              <h2
                className="gd-font-display"
                style={{
                  fontSize: 26,
                  color: "var(--gd-ink-900)",
                  marginBottom: 8,
                }}
              >
                {/* Reuse legacy quota strings from the V2 i18n one day; for
                    now lift from page.tsx via a literal so we don't block. */}
                Daily limit reached
              </h2>
              <p
                className="gd-font-sans-ui"
                style={{
                  fontSize: 14,
                  color: "var(--gd-ink-700)",
                  marginBottom: 16,
                }}
              >
                Free accounts can search 20 words per day. The limit
                resets tomorrow — or upgrade to Clear for unlimited
                searches.
              </p>
              <Link
                href="/beta/pricing"
                className="gd-font-sans-ui font-medium"
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  borderRadius: 12,
                  fontSize: 13.5,
                  color: "white",
                  background:
                    "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
                  boxShadow:
                    "0 0 0 1px oklch(0.5 0.2 250 / 0.55), 0 8px 22px oklch(0.5 0.2 250 / 0.4)",
                }}
              >
                {v2(lang, "upgradeToClear")}
              </Link>
            </div>
          )}

          {errorMsg && !quotaReached && (
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
            />
          )}
        </main>

        <HomeFooter />
      </div>
    </div>
  );
}

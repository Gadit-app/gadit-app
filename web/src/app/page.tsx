"use client";
import { useState, useEffect, useRef } from "react";
import { useLang } from "@/lib/lang-context";
import { useAuth } from "@/lib/auth-context";
import { useKidsMode } from "@/lib/kids-mode";
import { track } from "@/lib/track";
import VoiceInput from "@/components/VoiceInput";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import ReportButton from "@/components/ReportButton";
import Link from "next/link";
import { parse as parsePartialJson, Allow } from "partial-json";

interface HistoryItem {
  word: string;
  uiLang: string;
  timestamp: string;
}

interface KidsExplanation {
  // intro is deprecated — the UI now uses a fixed i18n label (t.kidsLabel).
  // Kept optional for backward compatibility with older cached entries.
  intro?: string;
  explanation: string;
  examples: string[];
}

interface Idiom {
  phrase: string;
  meaning: string;
}

interface Meaning {
  meaning: string;
  examples: string[];
  kidsExplanation?: KidsExplanation;
  idioms?: Idiom[];
}

interface Etymology {
  sourceLanguage: string;
  originalWord: string;
  breakdown: string;
  originalMeaning: string;
  historyNote?: string;
}

interface WordResult {
  word: string;
  language: string;
  multiplemeanings: boolean;
  meanings: Meaning[];
  etymology: Etymology | string;
  generalIdioms?: Idiom[];
  contextNote?: string;
  suggestedWord?: string;
  fromCache?: boolean;
}

type SearchPhase =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; result: WordResult };

const isRTLLanguage = (lang?: string) =>
  ["Hebrew", "Arabic", "Urdu", "Persian"].includes(lang ?? "");

function useSectionObserver() {
  useEffect(() => {
    const els = document.querySelectorAll(".observe-section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("section-visible");
            e.target.classList.remove("section-hidden");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
}

export default function Home() {
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<SearchPhase>({ kind: "idle" });
  const [contextInput, setContextInput] = useState("");
  const [error, setError] = useState("");

  const { t, dir: uiDir, lang } = useLang();
  const { user, plan } = useAuth();
  const [kidsMode, setKidsMode] = useKidsMode();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  // Hide example chips after the first search of the session — first-time
  // visitors get the hint, returning ones don't need it eating screen space.
  const [hasSearchedThisSession, setHasSearchedThisSession] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem("gadit_searched") === "1";
  });
  const isPaidPlan = plan === "clear" || plan === "deep";
  const resultRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useSectionObserver();

  // Load search history when a paid user lands on the page
  useEffect(() => {
    if (!user || !isPaidPlan) {
      setHistory([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/history", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) return;
        const data = (await res.json()) as { items?: HistoryItem[] };
        if (!cancelled) setHistory(data.items ?? []);
      } catch (e) {
        console.error("history load:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isPaidPlan]);

  const isIdle = phase.kind === "idle";
  const isLoading = phase.kind === "loading";
  const result = phase.kind === "result" ? phase.result : null;

  function scrollToResult() {
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  async function fetchWord(word: string, contextSentence?: string) {
    setPhase({ kind: "loading" });
    setError("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) {
        try {
          const idToken = await user.getIdToken();
          headers.Authorization = `Bearer ${idToken}`;
        } catch {
          // token failed — proceed anonymously, backend will fall back to basic
        }
      }
      const res = await fetch("/api/define", {
        method: "POST",
        headers,
        body: JSON.stringify({ word, contextSentence, uiLang: lang }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalResult: WordResult | null = null;
      let startedStreaming = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload) continue;

          try {
            const event = JSON.parse(payload) as
              | { type: "delta"; partial: string }
              | { type: "done"; result: WordResult }
              | { type: "error"; message: string };

            if (event.type === "delta") {
              try {
                const partial = parsePartialJson(event.partial, Allow.ALL) as Partial<WordResult>;
                if (partial && typeof partial === "object") {
                  const streamingResult: WordResult = {
                    word: partial.word ?? word,
                    language: partial.language ?? "",
                    multiplemeanings: partial.multiplemeanings ?? false,
                    meanings: partial.meanings ?? [],
                    etymology: partial.etymology ?? { sourceLanguage: "", originalWord: "", breakdown: "", originalMeaning: "" },
                    contextNote: partial.contextNote,
                  };
                  if (!startedStreaming) {
                    startedStreaming = true;
                    scrollToResult();
                  }
                  setPhase({ kind: "result", result: streamingResult });
                }
              } catch {
                // partial JSON not yet parseable — keep accumulating
              }
            } else if (event.type === "done") {
              finalResult = event.result;
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          } catch (e) {
            console.error("SSE parse error:", e);
          }
        }
      }

      if (!finalResult) throw new Error("Stream ended without final result");
      setPhase({ kind: "result", result: finalResult });
      if (!startedStreaming) scrollToResult();

      // Track the search event
      track("search", {
        word: word.trim().slice(0, 40),
        uiLang: lang,
        plan,
        withContext: Boolean(contextSentence),
        fromCache: Boolean(finalResult.fromCache),
        meaningsCount: finalResult.meanings?.length ?? 0,
      });

      // Save to history (paid users only) — fire and forget, optimistic local update
      if (user && isPaidPlan) {
        const newItem: HistoryItem = {
          word: word.trim(),
          uiLang: lang,
          timestamp: new Date().toISOString(),
        };
        setHistory((prev) => {
          const filtered = prev.filter(
            (h) => !(h.word === newItem.word && h.uiLang === newItem.uiLang)
          );
          return [newItem, ...filtered].slice(0, 10);
        });
        (async () => {
          try {
            const idToken = await user.getIdToken();
            await fetch("/api/history", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({ word: newItem.word, uiLang: lang }),
            });
          } catch (e) {
            console.error("history save:", e);
          }
        })();
      }
    } catch (e) {
      console.error("fetchWord error:", e);
      setError("Something went wrong. Please try again.");
      setPhase({ kind: "idle" });
    }
  }

  async function clearHistory() {
    if (!user || !isPaidPlan) return;
    setHistory([]);
    try {
      const idToken = await user.getIdToken();
      await fetch("/api/history", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
    } catch (e) {
      console.error("history clear:", e);
    }
  }

  async function handleSearch(wordOverride?: string) {
    const query = (wordOverride ?? input).trim();
    if (!query) return;
    if (wordOverride) setInput(wordOverride);
    // Mark that the user has searched at least once → chips hide from now on
    if (!hasSearchedThisSession) {
      setHasSearchedThisSession(true);
      try {
        window.sessionStorage.setItem("gadit_searched", "1");
      } catch {
        /* sessionStorage may be unavailable in private mode */
      }
    }
    const sentence = contextInput.trim();
    await fetchWord(query, sentence || undefined);
  }

  async function showAllMeanings() {
    // Re-run the search without context to get all meanings
    const query = input.trim();
    if (!query) return;
    await fetchWord(query);
  }

  async function searchSuggested(suggested: string) {
    setInput(suggested);
    setContextInput("");
    await fetchWord(suggested);
  }

  function reset() {
    setPhase({ kind: "idle" });
    setInput("");
    setContextInput("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const FEATURES = [t.feat1, t.feat2, t.feat3, t.feat4, t.feat5, t.feat6, t.feat7, t.feat8];
  const FEATURE_ICONS = ["📖", "💬", "🧒", "🔍", "🔗", "🌱", "✍️", "📅"];
  const WHO = [t.who1, t.who2, t.who3, t.who4, t.who5];
  const WHO_ICONS = ["🎓", "👨‍👩‍👧", "🏫", "🌍", "💡"];

  const isPaidUser = plan === "clear" || plan === "deep";
  // Hide marketing landing sections for paid users at all times.
  // For Basic/anonymous — show them only when idle (no search in progress).
  const showSections = !isPaidUser && isIdle && !isLoading;

  return (
    <main className="min-h-screen bg-[#F8FAFC]" dir={uiDir} data-lang={lang}>

      {/* ── HERO ── */}
      <section id="hero" className="relative pt-28 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 55% at 50% -10%, rgb(37 99 235 / 0.07) 0%, transparent 65%)",
        }} />

        <div className="relative max-w-2xl mx-auto">

          {/* Headline — only when idle */}
          {isIdle && (
            <div className="text-center mb-12 animate-fade-in-up">
              <h1 className="font-bold mb-4" style={{ color: "#0F172A", letterSpacing: uiDir === "rtl" ? "0.3px" : "-1.5px", lineHeight: uiDir === "rtl" ? "1.35" : "1.2", fontSize: "clamp(36px, 6vw, 52px)" }}>
                <span style={{ color: "#2563EB" }}>Gad</span>it
              </h1>
              <p className="font-semibold mb-3" style={{ color: "#0F172A", letterSpacing: uiDir === "rtl" ? "0.2px" : "-0.5px", lineHeight: uiDir === "rtl" ? "1.35" : "1.25", fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 600 }}>
                {t.heroHeadline}
              </p>
              {!isPaidUser && (
                <p className="text-slate-400 leading-relaxed max-w-md mx-auto" style={{ fontSize: "1.05rem", lineHeight: uiDir === "rtl" ? "1.7" : "1.6" }}>
                  {t.heroSubline}
                </p>
              )}
            </div>
          )}

          {/* Search */}
          <div ref={searchRef} className={isIdle ? "animate-fade-in-up delay-200 relative" : "relative mb-8"}>
            {isIdle && (
              <div className="absolute inset-0 pointer-events-none -z-10" style={{
                background: "radial-gradient(ellipse 90% 120% at 50% 50%, rgb(37 99 235 / 0.05) 0%, transparent 70%)",
                transform: "scale(1.5)",
              }} />
            )}
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} dir={uiDir}>
              <div className="search-container flex gap-0 p-2 items-center w-full">
                <div className="relative flex-1 min-w-0 flex items-center gap-2 px-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.placeholder[0]}
                    className="flex-1 min-w-0 py-3.5 bg-transparent text-slate-800 text-lg focus:outline-none placeholder-slate-300 transition-all"
                    dir={uiDir}
                    style={{ textAlign: uiDir === "rtl" ? "right" : "left" }}
                    autoFocus={false}
                  />
                  <VoiceInput
                    enabled={plan === "clear" || plan === "deep"}
                    uiLang={lang}
                    getIdToken={async () => (user ? await user.getIdToken() : null)}
                    onResult={(text) => setInput(text)}
                    size="md"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary px-5 sm:px-7 py-3.5 rounded-xl font-semibold text-base shrink-0 disabled:opacity-60"
                >
                  {isLoading ? "…" : t.explainBtn}
                </button>
              </div>
            </form>

            {/* Context sentence — optional, always visible */}
            <div className="mt-4" dir={uiDir}>
              <p className="text-xs text-slate-400 mb-1.5 px-1">{t.contextHint}</p>
              <div className="w-full bg-white border border-slate-200 rounded-xl flex items-center gap-2 px-3 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <input
                  type="text"
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }}
                  placeholder={t.contextPlaceholder}
                  className="flex-1 py-3 bg-transparent text-slate-700 text-sm focus:outline-none"
                  dir={uiDir}
                  style={{ textAlign: uiDir === "rtl" ? "right" : "left" }}
                />
                <VoiceInput
                  enabled={plan === "clear" || plan === "deep"}
                  uiLang={lang}
                  getIdToken={async () => (user ? await user.getIdToken() : null)}
                  onResult={(text) => setContextInput(text)}
                  size="sm"
                />
              </div>
            </div>

            {/* Kids mode toggle — paid users only */}
            {(plan === "clear" || plan === "deep") && (
              <div className="flex items-center gap-2 mt-3 px-1" style={{ justifyContent: uiDir === "rtl" ? "flex-start" : "flex-end" }} dir={uiDir}>
                <button
                  type="button"
                  onClick={() => setKidsMode(!kidsMode)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: kidsMode ? "rgb(254 243 199)" : "rgb(248 250 252)",
                    border: `1px solid ${kidsMode ? "rgb(253 224 71)" : "rgb(226 232 240)"}`,
                    color: kidsMode ? "rgb(146 64 14)" : "rgb(100 116 139)",
                  }}
                  aria-pressed={kidsMode}
                >
                  <span>🧒</span>
                  <span>{t.kidsModeToggle}</span>
                  <span
                    className="inline-block w-7 h-4 rounded-full relative transition-all"
                    style={{
                      background: kidsMode ? "rgb(245 158 11)" : "rgb(203 213 225)",
                    }}
                  >
                    <span
                      className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                      style={{
                        left: kidsMode ? "14px" : "2px",
                      }}
                    />
                  </span>
                </button>
              </div>
            )}

            {/* Recent searches — paid users only, idle only */}
            {isIdle && isPaidPlan && history.length > 0 && (
              <div className="mt-6" dir={uiDir}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.historyTitle}</p>
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {t.historyClear}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((h) => (
                    <button
                      key={`${h.uiLang}|${h.word}|${h.timestamp}`}
                      type="button"
                      onClick={() => handleSearch(h.word)}
                      className="px-3 py-1.5 rounded-full text-sm bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all"
                      style={{ boxShadow: "var(--shadow-xs)" }}
                    >
                      {h.word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chips — first-time visitors only (until they search once),
                hidden for paid users entirely. RTL-aware. */}
            {isIdle && !isPaidUser && !hasSearchedThisSession && (
              <div
                className="flex flex-wrap gap-2 mt-6"
                style={{ justifyContent: uiDir === "rtl" ? "flex-end" : "flex-start" }}
                dir={uiDir}
              >
                <span className="text-slate-400 text-sm self-center">{t.tryLabel}</span>
                {t.chips.map((ex) => (
                  <button key={ex} onClick={() => handleSearch(ex)} className="gadit-chip">{ex}</button>
                ))}
              </div>
            )}

            {/* Support line — non-paid only */}
            {isIdle && !isPaidUser && (
              <p className="text-center text-slate-400 text-sm mt-6 italic animate-fade-in delay-400"
                dangerouslySetInnerHTML={{ __html: t.heroSupport }} />
            )}
          </div>

          {error && (
            <div className="mt-4 px-5 py-4 rounded-2xl text-sm animate-fade-in" style={{ background: "rgb(254 226 226)", color: "#DC2626" }}>
              {error}
            </div>
          )}

          {/* ── RESULT AREA ── */}
          <div ref={resultRef}>
            {/* Full result */}
            {result && (
              <ResultView
                result={result}
                uiDir={uiDir}
                t={t}
                onReset={reset}
                onShowAll={showAllMeanings}
                onSuggest={searchSuggested}
                plan={plan}
                uiLang={lang}
                kidsMode={kidsMode}
                getIdToken={async () => (user ? await user.getIdToken() : null)}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── DEMO + HOW IT WORKS ── */}
      {showSections && (
        <section id="how-it-works" className="py-24 px-4 bg-white">
          <div className="max-w-2xl mx-auto">
            <div className="observe-section section-hidden mb-20">
              <h2 className="text-3xl font-bold text-center mb-2" style={{ color: "#0F172A", letterSpacing: uiDir === "rtl" ? "0.2px" : "-0.5px" }}>
                {t.demoSectionTitle}
              </h2>
              <p className="text-center text-slate-400 mb-10 text-base italic" dangerouslySetInnerHTML={{ __html: t.heroSupport }} />
              <div className="gadit-card overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
                <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2" style={{ background: "rgb(248 250 252)" }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
                  <div className="flex-1 mx-3 px-3 py-1 rounded-md text-xs text-slate-400 border border-slate-200 bg-white text-center">gadit.app</div>
                </div>
                <div className="px-8 py-5 border-b border-slate-100 flex items-baseline justify-between">
                  <span className="text-2xl font-bold" style={{ color: "#0F172A" }}>{t.demoWord}</span>
                  <span className="text-sm text-slate-400 font-medium">{t.demoLang}</span>
                </div>
                <div className="px-8 py-6 space-y-4">
                  <p className="text-slate-700 text-base font-medium leading-relaxed">{t.demoDefinition}</p>
                  <ul className="space-y-2">
                    {t.demoExamples.map((ex, i) => (
                      <li key={i} className="flex gap-2 text-slate-500 text-sm">
                        <span style={{ color: "#2563EB" }}>•</span>
                        <span className="italic">{ex}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t border-slate-100">
                    <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#2563EB" }}>
                      {t.etymologyLabel}
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">{t.demoInsight}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="observe-section section-hidden">
              <h2 className="text-3xl font-bold text-center mb-14" style={{ color: "#0F172A", letterSpacing: uiDir === "rtl" ? "0.2px" : "-0.5px" }}>
                {t.howItWorksTitle}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { num: "1", title: t.howStep1Title, desc: t.howStep1Desc },
                  { num: "2", title: t.howStep2Title, desc: t.howStep2Desc },
                  { num: "3", title: t.howStep3Title, desc: t.howStep3Desc },
                ].map((step) => (
                  <div key={step.num} className="text-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4"
                      style={{ background: "#2563EB", boxShadow: "var(--shadow-blue)" }}>
                      {step.num}
                    </div>
                    <h3 className="font-semibold mb-2 text-base" style={{ color: "#0F172A" }}>{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <button onClick={() => searchRef.current?.scrollIntoView({ behavior: "smooth" })} className="btn-primary px-8 py-3.5 text-sm">
                  {t.howCta}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {showSections && (
        <section id="features" className="py-24 px-4 bg-[#F8FAFC]">
          <div className="max-w-2xl mx-auto observe-section section-hidden">
            <h2 className="text-3xl font-bold text-center mb-14" style={{ color: "#0F172A", letterSpacing: uiDir === "rtl" ? "0.2px" : "-0.5px" }}>
              {t.featuresTitle}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FEATURES.map((feat, i) => (
                <div key={i} className="gadit-card-interactive px-5 py-5 text-center">
                  <div className="text-2xl mb-3">{FEATURE_ICONS[i]}</div>
                  <p className="text-sm font-medium text-slate-700 leading-snug">{feat}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {showSections && (
        <section className="py-24 px-4 bg-white">
          <div className="max-w-2xl mx-auto observe-section section-hidden">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "#0F172A", letterSpacing: uiDir === "rtl" ? "0.2px" : "-0.5px" }}>
              {t.whoTitle}
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {WHO.map((who, i) => (
                <div key={i} className="gadit-card flex items-center gap-3 px-6 py-4">
                  <span className="text-2xl">{WHO_ICONS[i]}</span>
                  <span className="font-medium text-slate-700">{who}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {showSections && (
        <section className="py-24 px-4 bg-[#F8FAFC]">
          <div className="max-w-xl mx-auto text-center observe-section section-hidden">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#0F172A", letterSpacing: uiDir === "rtl" ? "0.2px" : "-0.5px" }}>{t.whyTitle}</h2>
            <p className="text-slate-500 text-lg mb-10 leading-relaxed">{t.whyCopy}</p>
            <div className="flex flex-col gap-3 items-center">
              {[t.whyBullet1, t.whyBullet2, t.whyBullet3].map((b, i) => (
                <div key={i} className="gadit-card flex items-center gap-3 px-6 py-3.5 w-full max-w-xs">
                  <span className="font-bold text-lg" style={{ color: "#2563EB" }}>✓</span>
                  <span className="text-slate-700 font-medium">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {showSections && (
        <section id="pricing-teaser" className="py-24 px-4 bg-white">
          <div className="max-w-xl mx-auto text-center observe-section section-hidden">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#0F172A", letterSpacing: uiDir === "rtl" ? "0.2px" : "-0.5px" }}>{t.pricingTeaserTitle}</h2>
            <p className="text-slate-400 text-base mb-10 leading-relaxed max-w-sm mx-auto">{t.pricingTeaserText}</p>
            <Link href="/pricing" className="btn-secondary inline-block px-8 py-3.5 text-sm font-semibold">{t.viewPricing}</Link>
          </div>
        </section>
      )}

      {showSections && <FAQSection />}

      {showSections && <ContactSection />}

      {showSections && (
        <section className="py-28 px-4 relative overflow-hidden" style={{ background: "#2563EB" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgb(255 255 255 / 0.06) 0%, transparent 70%)" }} />
          <div className="relative max-w-xl mx-auto text-center observe-section section-hidden">
            <h2 className="text-3xl font-bold text-white mb-3" style={{ letterSpacing: uiDir === "rtl" ? "0.2px" : "-0.5px" }}>{t.finalCtaTitle}</h2>
            <p className="text-blue-200 text-base mb-10 leading-relaxed">{t.finalCtaText}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => searchRef.current?.scrollIntoView({ behavior: "smooth" })} className="px-8 py-3.5 rounded-xl font-semibold text-sm bg-white hover:bg-blue-50 transition-all" style={{ color: "#2563EB", boxShadow: "0 4px 16px rgb(0 0 0 / 0.12)" }}>
                {t.startUnderstandingFree}
              </button>
              <Link href="/pricing" className="px-8 py-3.5 rounded-xl font-semibold text-sm border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all">
                {t.viewPricing}
              </Link>
            </div>
          </div>
        </section>
      )}

      {showSections && (
        <footer className="py-12 px-4 bg-[#F8FAFC] border-t border-slate-100">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <span className="text-base font-bold" style={{ color: "#0F172A" }}>
                <span style={{ color: "#2563EB" }}>Gad</span>it
              </span>
              <div className="flex flex-wrap gap-6 text-sm text-slate-400">
                <Link href="/pricing" className="hover:text-blue-600 transition-colors">{t.pricing}</Link>
                <a href="#contact" className="hover:text-blue-600 transition-colors">{t.footerContact}</a>
                <Link href="/privacy" className="hover:text-blue-600 transition-colors">{t.footerPrivacy}</Link>
                <Link href="/terms" className="hover:text-blue-600 transition-colors">{t.footerTerms}</Link>
              </div>
            </div>
            <p className="text-center text-slate-300 text-xs mt-8">{t.footerTagline}</p>
          </div>
        </footer>
      )}

    </main>
  );
}

// ── RESULT VIEW ──
function ResultView({ result, uiDir, t, onReset, onShowAll, onSuggest, plan, getIdToken, uiLang, kidsMode }: {
  result: WordResult;
  uiDir: "ltr" | "rtl";
  t: ReturnType<typeof useLang>["t"];
  onReset: () => void;
  onShowAll: () => void;
  onSuggest: (suggestion: string) => void;
  plan: "basic" | "clear" | "deep";
  getIdToken: () => Promise<string | null>;
  uiLang: string;
  kidsMode: boolean;
}) {
  const resultLangDir = isRTLLanguage(result.language) ? "rtl" : "ltr";
  const rDir = resultLangDir;
  const lineH = rDir === "rtl" ? "1.7" : "1.6";

  // Word-not-found with a suggestion: show clean focused screen
  if (result.suggestedWord) {
    return (
      <div className="space-y-4 animate-fade-in" dir={rDir}>
        <div className="gadit-card px-5 sm:px-8 py-6 sm:py-8 text-center space-y-5">
          <div className="text-4xl">🔍</div>
          <p className="text-slate-500 text-base" style={{ lineHeight: lineH }}>
            {t.wordNotFound.replace("{word}", result.word)}
          </p>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">{t.didYouMean}</p>
            <button
              type="button"
              onClick={() => onSuggest(result.suggestedWord!)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-lg transition-all hover:scale-105"
              style={{
                background: "rgb(239 246 255)",
                color: "#2563EB",
                border: "1.5px solid rgb(147 197 253)",
              }}
            >
              <span>{result.suggestedWord}</span>
              <span className="text-base">{rDir === "rtl" ? "←" : "→"}</span>
            </button>
          </div>
        </div>
        <button onClick={onReset} className="w-full py-3 rounded-2xl text-slate-400 text-sm hover:text-blue-500 transition-colors">
          {t.searchAnother}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in" dir={rDir}>

      {/* Word header */}
      <div className="gadit-card px-5 sm:px-8 py-5 sm:py-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-bold" style={{ color: "#0F172A", fontSize: "clamp(24px, 4vw, 32px)", letterSpacing: rDir === "rtl" ? "0.3px" : "-0.5px" }}>
            {result.word}
          </h2>
          <div className="flex items-center gap-3 shrink-0">
            {plan === "deep" && (
              <SaveToNotebookButton
                word={result.word}
                language={result.language}
                meaning={result.meanings?.[0]?.meaning ?? ""}
                getIdToken={getIdToken}
                t={t}
              />
            )}
            <ShareButton word={result.word} t={t} />
            <span className="text-sm text-slate-400 font-medium">{result.language}</span>
          </div>
        </div>
        {/* Report a problem — small, unobtrusive, but always available */}
        <div className="mt-3 flex justify-end" dir="ltr">
          <ReportButton
            word={result.word}
            contextSnapshot={result}
          />
        </div>
      </div>

      {/* Context note */}
      {result.contextNote && (
        <div className="px-5 sm:px-8 py-4 sm:py-5 rounded-3xl" style={{ background: "rgb(239 246 255)", border: "1px solid rgb(147 197 253 / 0.4)" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#2563EB" }}>{t.contextNote}</p>
          <p className="text-slate-600 text-sm leading-relaxed">{result.contextNote}</p>
        </div>
      )}

      {/* Meanings — each with its own examples and (for paid users) kids explanation */}
      {result.meanings?.map((m, i) => (
        <div key={i} className="space-y-3">
          <div className="gadit-card px-5 sm:px-8 py-5 sm:py-6 space-y-4">
            {/* Meaning header */}
            <div className="flex items-start gap-3">
              {result.meanings.length > 1 && (
                <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                  style={{ background: "#2563EB", minWidth: "1.5rem" }}>
                  {i + 1}
                </span>
              )}
              <p className="text-slate-800 font-medium leading-relaxed" style={{ fontSize: "1.05rem", lineHeight: lineH }}>
                {m.meaning}
              </p>
            </div>

            {/* Examples for this meaning */}
            {m.examples?.length > 0 && (
              <ul className="space-y-2 pt-1 border-t border-slate-100">
                {m.examples.map((ex, j) => (
                  <li key={j} className="flex gap-2.5 text-slate-500 text-sm" style={{ lineHeight: lineH }}>
                    <span className="shrink-0 font-semibold mt-0.5" style={{ color: "#2563EB" }}>•</span>
                    <span className="italic">{ex}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Meaning-specific idioms — paid users only */}
            {(plan === "clear" || plan === "deep") && m.idioms && m.idioms.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t.idiomsLabel}</p>
                <ul className="space-y-2">
                  {m.idioms.map((idiom, j) => (
                    <li key={j} className="flex gap-2 text-sm" style={{ lineHeight: lineH }}>
                      <span className="text-slate-700 font-medium">&ldquo;{idiom.phrase}&rdquo;</span>
                      <span className="text-slate-400">—</span>
                      <span className="text-slate-500">{idiom.meaning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Kids explanation for this meaning — only when Kids Mode toggle is ON */}
          {kidsMode && m.kidsExplanation && (
            <div className="rounded-3xl px-5 sm:px-8 py-5 sm:py-6 space-y-3" style={{ background: "linear-gradient(135deg, rgb(254 249 231) 0%, rgb(254 240 210) 100%)", border: "1px solid rgb(254 215 170)" }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl shrink-0">🧒</span>
                <p className="text-base font-semibold text-amber-900">{t.kidsLabel}</p>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed" style={{ lineHeight: lineH }}>
                {m.kidsExplanation.explanation}
              </p>
              {m.kidsExplanation.examples?.length > 0 && (
                <ul className="space-y-2 pt-2 border-t border-amber-200">
                  {m.kidsExplanation.examples.map((ex, j) => (
                    <li key={j} className="flex gap-2.5 text-slate-600 text-sm" style={{ lineHeight: lineH }}>
                      <span className="shrink-0 font-semibold mt-0.5 text-amber-600">•</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Action triggers (Clear+ for compose/image; Deep adds quiz; basic
              gets a single upgrade CTA). Stacked on mobile, two-up on desktop
              so the user doesn't have to scroll past three full sections to
              reach the next meaning. */}
          {(plan === "clear" || plan === "deep") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MeaningImage
                word={result.word}
                meaning={m.meaning}
                uiLang={uiLang}
                getIdToken={getIdToken}
                t={t}
                lineH={lineH}
              />
              <MeaningCompose
                word={result.word}
                meaning={m.meaning}
                uiLang={uiLang}
                getIdToken={getIdToken}
                t={t}
                lineH={lineH}
              />
              {plan === "deep" && (
                <div className="sm:col-span-2">
                  <MeaningQuiz
                    word={result.word}
                    meaning={m.meaning}
                    uiLang={uiLang}
                    getIdToken={getIdToken}
                    t={t}
                    lineH={lineH}
                  />
                </div>
              )}
            </div>
          )}

          {/* Basic users — single upgrade CTA hinting at the Clear features */}
          {plan === "basic" && <BasicUpgradeHint word={result.word} t={t} />}
        </div>
      ))}

      {/* Etymology */}
      {result.etymology && (
        <div className="gadit-card px-5 sm:px-8 py-5 sm:py-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{t.etymologyLabel}</p>
          {typeof result.etymology === "string" ? (
            <p className="text-slate-600 text-sm leading-relaxed" style={{ lineHeight: lineH }}>
              {result.etymology}
            </p>
          ) : (
            <div className="space-y-3 text-sm" style={{ lineHeight: lineH }}>
              {result.etymology.sourceLanguage && (
                <div className="flex gap-3 items-baseline">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider shrink-0 min-w-[80px]">{t.etySourceLanguage}</span>
                  <span className="text-slate-700 font-medium">{result.etymology.sourceLanguage}</span>
                </div>
              )}
              {result.etymology.breakdown ? (
                <div className="flex gap-3 items-baseline">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider shrink-0 min-w-[80px]">{t.etyBreakdown}</span>
                  <span className="text-slate-700 italic">{result.etymology.breakdown}</span>
                </div>
              ) : (
                result.etymology.originalWord && (
                  <div className="flex gap-3 items-baseline">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider shrink-0 min-w-[80px]">{t.etyOriginalWord}</span>
                    <span className="text-slate-700 italic">{result.etymology.originalWord}</span>
                  </div>
                )
              )}
              {result.etymology.originalMeaning && (
                <div className="flex gap-3 items-baseline">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider shrink-0 min-w-[80px]">{t.etyOriginalMeaning}</span>
                  <span className="text-slate-600">{result.etymology.originalMeaning}</span>
                </div>
              )}
              {result.etymology.historyNote && (
                <div className="flex gap-3 items-baseline pt-2 border-t border-slate-100">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider shrink-0 min-w-[80px]">{t.etyHistoryNote}</span>
                  <span className="text-slate-600 leading-relaxed">{result.etymology.historyNote}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* General idioms — paid users only */}
      {(plan === "clear" || plan === "deep") && result.generalIdioms && result.generalIdioms.length > 0 && (
        <div className="gadit-card px-5 sm:px-8 py-5 sm:py-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{t.generalIdiomsLabel}</p>
          <ul className="space-y-2.5">
            {result.generalIdioms.map((idiom, j) => (
              <li key={j} className="flex gap-2 text-sm" style={{ lineHeight: lineH }}>
                <span className="text-slate-700 font-medium">&ldquo;{idiom.phrase}&rdquo;</span>
                <span className="text-slate-400">—</span>
                <span className="text-slate-500">{idiom.meaning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upsell — Basic users only (paid users get kids + images inline) */}
      {plan === "basic" && (
        <div className="rounded-3xl px-5 sm:px-8 py-5 sm:py-7 space-y-3" style={{ background: "rgb(248 250 252)", border: "1px solid rgb(226 232 240)" }}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.upsellBtn}</p>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100" style={{ boxShadow: "var(--shadow-xs)" }}>
            <span className="text-xl shrink-0">🧒</span>
            <p className="font-medium text-slate-700 text-sm">{t.upsellKids}</p>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100" style={{ boxShadow: "var(--shadow-xs)" }}>
            <span className="text-xl shrink-0">🖼️</span>
            <p className="font-medium text-slate-700 text-sm">{t.upsellVisual}</p>
          </div>
          <Link href="/pricing" className="btn-primary w-full py-3 text-sm text-center block mt-1">
            {t.upsellBtn}
          </Link>
        </div>
      )}

      {/* "Show all meanings" — only when a context sentence was used (result has contextNote or single meaning came from context) */}
      {result.contextNote && (
        <button
          onClick={onShowAll}
          className="w-full py-3 rounded-2xl text-sm font-medium transition-all"
          style={{
            background: "rgb(239 246 255)",
            color: "#2563EB",
            border: "1px solid rgb(147 197 253)",
          }}
        >
          {t.showAllMeaningsBtn}
        </button>
      )}

      {/* Back */}
      <button onClick={onReset} className="w-full py-3 rounded-2xl text-slate-400 text-sm hover:text-blue-500 transition-colors">
        {t.searchAnother}
      </button>
    </div>
  );
}

function MeaningImage({ word, meaning, uiLang, getIdToken, t, lineH }: {
  word: string;
  meaning: string;
  uiLang: string;
  getIdToken: () => Promise<string | null>;
  t: ReturnType<typeof useLang>["t"];
  lineH: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const idToken = await getIdToken();
      if (!idToken) {
        setError(t.imageFailed);
        return;
      }
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ word, meaning, uiLang }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429) {
          setError(t.imageLimitReached);
        } else {
          setError(t.imageFailed);
        }
        console.error("image gen failed:", res.status, data);
        return;
      }
      const data = await res.json();
      if (data.url) {
        setUrl(data.url);
        track("image_generated", {
          word: word.slice(0, 40),
          uiLang,
          cached: Boolean(data.cached),
        });
      } else setError(t.imageFailed);
    } catch (e) {
      console.error("image gen error:", e);
      setError(t.imageFailed);
    } finally {
      setLoading(false);
    }
  }

  if (url) {
    return (
      <div className="rounded-3xl overflow-hidden" style={{ border: "1px solid rgb(226 232 240)" }}>
        <img src={url} alt={meaning} className="w-full h-auto block" loading="lazy" />
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="rounded-3xl relative overflow-hidden"
        style={{
          border: "1px solid rgb(226 232 240)",
          aspectRatio: "1 / 1",
          background: "linear-gradient(135deg, rgb(241 245 249) 0%, rgb(226 232 240) 50%, rgb(241 245 249) 100%)",
          backgroundSize: "200% 200%",
          animation: "gadit-skeleton 2.5s ease-in-out infinite",
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
          <span className="text-5xl" style={{ animation: "gadit-pulse 1.6s ease-in-out infinite" }}>🎨</span>
          <p className="text-sm font-medium" style={{ lineHeight: lineH }}>
            {t.generatingImage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGenerate}
        className="flex items-center gap-3 p-4 w-full text-start rounded-2xl bg-white border border-slate-100 cursor-pointer hover:border-blue-200 transition-all"
        style={{ boxShadow: "var(--shadow-xs)" }}
      >
        <span className="text-xl shrink-0">🎨</span>
        <p className="font-medium text-slate-700 text-sm">{t.generateImage}</p>
      </button>
      {error && (
        <p className="text-sm text-amber-700 px-1 mt-2" style={{ lineHeight: lineH }}>{error}</p>
      )}
    </div>
  );
}

function SaveToNotebookButton({
  word,
  language,
  meaning,
  getIdToken,
  t,
}: {
  word: string;
  language: string;
  meaning: string;
  getIdToken: () => Promise<string | null>;
  t: ReturnType<typeof useLang>["t"];
}) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    if (saved || busy) return;
    setBusy(true);
    try {
      const idToken = await getIdToken();
      if (!idToken) return;
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ word, language, meaning }),
      });
      if (res.ok) {
        setSaved(true);
        track("notebook_saved", { word: word.slice(0, 40), language });
      }
    } catch (e) {
      console.error("save notebook:", e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={busy || saved}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all disabled:cursor-default"
      style={{
        background: saved ? "rgb(219 234 254)" : "transparent",
        color: saved ? "rgb(29 78 216)" : "rgb(100 116 139)",
        border: `1px solid ${saved ? "rgb(147 197 253)" : "rgb(226 232 240)"}`,
      }}
      title={saved ? t.notebookSaved : t.notebookSaveBtn}
      aria-label={saved ? t.notebookSaved : t.notebookSaveBtn}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      <span>{saved ? t.notebookSaved : t.notebookSaveBtn}</span>
    </button>
  );
}

function ShareButton({ word, t }: { word: string; t: ReturnType<typeof useLang>["t"] }) {
  const [justCopied, setJustCopied] = useState(false);

  async function handleShare() {
    const url = `https://www.gadit.app/word/${encodeURIComponent(word)}`;
    track("share_word", { word: word.slice(0, 40) });

    // Native share if available (mobile)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${word} — Gadit`, url });
        return;
      } catch {
        // User canceled — fall through to clipboard
      }
    }

    // Fallback: copy link
    try {
      await navigator.clipboard.writeText(url);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1800);
    } catch {
      console.warn("clipboard failed");
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all"
      style={{
        background: justCopied ? "rgb(220 252 231)" : "transparent",
        color: justCopied ? "rgb(22 101 52)" : "rgb(100 116 139)",
        border: `1px solid ${justCopied ? "rgb(134 239 172)" : "rgb(226 232 240)"}`,
      }}
      title={t.shareWord}
      aria-label={t.shareWord}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      <span>{justCopied ? t.shareCopied : t.shareWord}</span>
    </button>
  );
}

/**
 * For Basic users: a single soft CTA shown beneath each meaning, pointing
 * to the Clear features (illustration, sentence practice) without yelling.
 * Replaces the per-meaning silence Basic users would otherwise see.
 */
function BasicUpgradeHint({ word, t }: { word: string; t: ReturnType<typeof useLang>["t"] }) {
  return (
    <Link
      href="/pricing"
      className="block rounded-2xl px-5 py-4 transition-all hover:shadow-md group"
      style={{
        background: "linear-gradient(135deg, rgb(239 246 255) 0%, rgb(219 234 254) 100%)",
        border: "1px dashed rgb(147 197 253)",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl shrink-0" aria-hidden="true">✨</span>
          <p className="text-sm text-blue-800 leading-snug">
            {t.basicUpgradeHint.replace("{word}", word)}
          </p>
        </div>
        <span
          className="text-xs font-semibold text-blue-700 group-hover:text-blue-900 transition-colors shrink-0"
          aria-hidden="true"
        >
          {t.basicUpgradeCta} →
        </span>
      </div>
    </Link>
  );
}

type ComposeStatus = "perfect" | "almost" | "incorrect";
interface ComposeFeedback {
  status: ComposeStatus;
  message: string;
  suggestion: string;
}

function MeaningCompose({ word, meaning, uiLang, getIdToken, t, lineH }: {
  word: string;
  meaning: string;
  uiLang: string;
  getIdToken: () => Promise<string | null>;
  t: ReturnType<typeof useLang>["t"];
  lineH: string;
}) {
  const [open, setOpen] = useState(false);
  const [sentence, setSentence] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<ComposeFeedback | null>(null);
  const [error, setError] = useState("");

  async function handleCheck() {
    if (!sentence.trim()) return;
    setLoading(true);
    setError("");
    setFeedback(null);
    try {
      const idToken = await getIdToken();
      if (!idToken) {
        setError(t.imageFailed);
        return;
      }
      const res = await fetch("/api/check-sentence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ word, meaning, sentence, uiLang }),
      });
      if (!res.ok) {
        setError(t.imageFailed);
        return;
      }
      const data = (await res.json()) as ComposeFeedback;
      setFeedback(data);
      track("compose_sentence", {
        word: word.slice(0, 40),
        uiLang,
        status: data.status,
      });
    } catch (e) {
      console.error("check-sentence error:", e);
      setError(t.imageFailed);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSentence("");
    setFeedback(null);
    setError("");
  }

  // Style per status
  const statusStyle = (s: ComposeStatus) => {
    if (s === "perfect") return { bg: "rgb(220 252 231)", border: "rgb(134 239 172)", text: "rgb(22 101 52)", icon: "✅", label: t.composeStatusPerfect };
    if (s === "almost") return { bg: "rgb(254 249 195)", border: "rgb(253 224 71)", text: "rgb(133 77 14)", icon: "⚠️", label: t.composeStatusAlmost };
    return { bg: "rgb(254 226 226)", border: "rgb(252 165 165)", text: "rgb(153 27 27)", icon: "🔴", label: t.composeStatusIncorrect };
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 p-4 w-full text-start rounded-2xl bg-white border border-slate-100 cursor-pointer hover:border-blue-200 transition-all"
        style={{ boxShadow: "var(--shadow-xs)" }}
      >
        <span className="text-xl shrink-0">✍️</span>
        <p className="font-medium text-slate-700 text-sm">{t.composeSentence}</p>
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3" style={{ boxShadow: "var(--shadow-xs)" }}>
      <div className="flex items-center gap-2">
        <span className="text-lg shrink-0">✍️</span>
        <p className="font-medium text-slate-700 text-sm">{t.composeSentence}</p>
      </div>
      <div className="relative">
        <textarea
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          placeholder={t.composeSentencePlaceholder}
          rows={2}
          disabled={loading || feedback !== null}
          className="w-full px-3 py-2.5 pe-12 rounded-xl border border-slate-200 text-slate-700 text-sm focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all resize-none disabled:bg-slate-50"
          style={{ lineHeight: lineH }}
        />
        <div className="absolute bottom-2 end-2">
          <VoiceInput
            enabled={true /* this whole component only renders for Clear+ */}
            uiLang={uiLang}
            getIdToken={getIdToken}
            onResult={(text) => setSentence(text)}
            size="sm"
          />
        </div>
      </div>

      {!feedback && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCheck}
            disabled={loading || !sentence.trim()}
            className="btn-primary px-5 py-2 text-sm rounded-xl disabled:opacity-50"
          >
            {loading ? t.composeSentenceChecking : t.composeSentenceCheckBtn}
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-amber-700">{error}</p>
      )}

      {feedback && (() => {
        const s = statusStyle(feedback.status);
        return (
          <div className="rounded-xl p-3 space-y-2" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <div className="flex items-center gap-2">
              <span>{s.icon}</span>
              <span className="font-semibold text-sm" style={{ color: s.text }}>{s.label}</span>
            </div>
            {feedback.message && (
              <p className="text-sm" style={{ color: s.text, lineHeight: lineH }}>{feedback.message}</p>
            )}
            {feedback.suggestion && (
              <div className="pt-2 border-t" style={{ borderColor: s.border }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: s.text, opacity: 0.7 }}>{t.composeSuggestionLabel}</p>
                <p className="text-sm italic" style={{ color: s.text, lineHeight: lineH }}>{feedback.suggestion}</p>
              </div>
            )}
            <button
              type="button"
              onClick={reset}
              className="text-xs font-medium underline hover:no-underline mt-1"
              style={{ color: s.text }}
            >
              {t.composeTryAgain}
            </button>
          </div>
        );
      })()}
    </div>
  );
}

interface QuizQuestion {
  type: "A" | "B" | "C" | "D";
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

function MeaningQuiz({ word, meaning, uiLang, getIdToken, t, lineH }: {
  word: string;
  meaning: string;
  uiLang: string;
  getIdToken: () => Promise<string | null>;
  t: ReturnType<typeof useLang>["t"];
  lineH: string;
}) {
  const [phase, setPhase] = useState<"closed" | "loading" | "playing" | "done" | "error">("closed");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  async function start() {
    setPhase("loading");
    setQuestions([]);
    setCurrent(0);
    setPicked(null);
    setScore(0);
    try {
      const idToken = await getIdToken();
      if (!idToken) {
        setPhase("error");
        return;
      }
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ word, meaning, uiLang }),
      });
      if (!res.ok) {
        setPhase("error");
        return;
      }
      const data = (await res.json()) as { questions?: QuizQuestion[] };
      const qs = (data.questions || []).filter(
        (q) => q && Array.isArray(q.options) && q.options.length === 4 && typeof q.correctIndex === "number"
      );
      if (qs.length === 0) {
        setPhase("error");
        return;
      }
      setQuestions(qs);
      setPhase("playing");
      track("quiz_started", { word: word.slice(0, 40), uiLang, count: qs.length });
    } catch (e) {
      console.error("quiz fetch:", e);
      setPhase("error");
    }
  }

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === questions[current].correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function next() {
    if (current + 1 >= questions.length) {
      setPhase("done");
      track("quiz_finished", {
        word: word.slice(0, 40),
        uiLang,
        score,
        total: questions.length,
      });
      return;
    }
    setCurrent((c) => c + 1);
    setPicked(null);
  }

  function close() {
    setPhase("closed");
  }

  if (phase === "closed") {
    return (
      <button
        type="button"
        onClick={start}
        className="flex items-center gap-3 p-4 w-full text-start rounded-2xl bg-white border border-slate-100 cursor-pointer hover:border-blue-200 transition-all"
        style={{ boxShadow: "var(--shadow-xs)" }}
      >
        <span className="text-xl shrink-0">🎯</span>
        <p className="font-medium text-slate-700 text-sm">{t.quizStart}</p>
      </button>
    );
  }

  if (phase === "loading") {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center gap-3" style={{ boxShadow: "var(--shadow-xs)" }}>
        <span className="text-xl">🎯</span>
        <p className="text-slate-500 text-sm">{t.quizLoading}</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-center justify-between gap-3">
        <p className="text-amber-700 text-sm">{t.quizError}</p>
        <button type="button" onClick={start} className="text-amber-700 text-sm font-medium underline">
          {t.quizTryAgain}
        </button>
      </div>
    );
  }

  if (phase === "done") {
    const pct = Math.round((score / questions.length) * 100);
    const isWin = pct >= 75;
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 text-center" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="text-4xl">{isWin ? "🎉" : "💪"}</div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.quizScore}</p>
          <p className="text-3xl font-bold" style={{ color: "#0F172A" }}>
            {score}/{questions.length}
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          <button type="button" onClick={start} className="btn-primary px-5 py-2 text-sm rounded-xl">
            {t.quizTryAgain}
          </button>
          <button
            type="button"
            onClick={close}
            className="px-5 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
          >
            {t.quizClose}
          </button>
        </div>
      </div>
    );
  }

  // playing
  const q = questions[current];
  const isLast = current + 1 >= questions.length;
  const showFeedback = picked !== null;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4" style={{ boxShadow: "var(--shadow-xs)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {t.quizQuestionOf.replace("{n}", String(current + 1)).replace("{total}", String(questions.length))}
        </span>
        <button type="button" onClick={close} className="text-slate-400 hover:text-slate-600 text-xs">
          ✕
        </button>
      </div>

      <p className="text-slate-800 font-medium text-sm" style={{ lineHeight: lineH }}>
        {q.prompt}
      </p>

      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex;
          const isPicked = i === picked;
          let bg = "white";
          let border = "rgb(226 232 240)";
          let textColor = "rgb(51 65 85)";
          if (showFeedback) {
            if (isCorrect) {
              bg = "rgb(220 252 231)";
              border = "rgb(134 239 172)";
              textColor = "rgb(22 101 52)";
            } else if (isPicked) {
              bg = "rgb(254 226 226)";
              border = "rgb(252 165 165)";
              textColor = "rgb(153 27 27)";
            } else {
              bg = "rgb(248 250 252)";
              border = "rgb(226 232 240)";
              textColor = "rgb(148 163 184)";
            }
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              disabled={showFeedback}
              className="w-full text-start px-4 py-3 rounded-xl text-sm transition-all disabled:cursor-default"
              style={{
                background: bg,
                border: `1.5px solid ${border}`,
                color: textColor,
                lineHeight: lineH,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div
          className="rounded-xl p-3 text-sm"
          style={{
            background: picked === q.correctIndex ? "rgb(220 252 231)" : "rgb(254 226 226)",
            color: picked === q.correctIndex ? "rgb(22 101 52)" : "rgb(153 27 27)",
            lineHeight: lineH,
          }}
        >
          <p className="font-semibold mb-1">
            {picked === q.correctIndex ? `✅ ${t.quizCorrect}` : `🔴 ${t.quizWrong}`}
          </p>
          <p>{q.explanation}</p>
        </div>
      )}

      {showFeedback && (
        <button type="button" onClick={next} className="btn-primary w-full py-2.5 text-sm rounded-xl">
          {isLast ? t.quizFinish : t.quizNext}
        </button>
      )}
    </div>
  );
}

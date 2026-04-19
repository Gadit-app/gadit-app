"use client";
import { useState, useEffect, useRef } from "react";
import { useLang } from "@/lib/lang-context";
import Link from "next/link";

interface Meaning {
  meaning: string;
  examples: string[];
}

interface WordResult {
  word: string;
  language: string;
  multiplemeanings: boolean;
  meanings: Meaning[];
  etymology: string;
  contextNote?: string;
  fromCache?: boolean;
}

type SearchPhase =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "chooseMeaning"; word: string; result: WordResult }
  | { kind: "contextInput"; word: string }
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
  const resultRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useSectionObserver();

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
      const res = await fetch("/api/define", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, contextSentence }),
      });
      const data: WordResult = await res.json();
      if ((data as { error?: string }).error) throw new Error((data as { error?: string }).error);

      // If multiple meanings and no context provided — let user choose
      if (data.multiplemeanings && !contextSentence) {
        setPhase({ kind: "chooseMeaning", word, result: data });
        scrollToResult();
      } else {
        setPhase({ kind: "result", result: data });
        scrollToResult();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setPhase({ kind: "idle" });
    }
  }

  async function handleSearch(wordOverride?: string) {
    const query = (wordOverride ?? input).trim();
    if (!query) return;
    if (wordOverride) setInput(wordOverride);
    await fetchWord(query);
  }

  async function handleContextSubmit() {
    if (phase.kind !== "contextInput") return;
    const sentence = contextInput.trim();
    if (!sentence) return;
    await fetchWord(phase.word, sentence);
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

  const showSections = isIdle && !isLoading;

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
              <p className="text-slate-400 leading-relaxed max-w-md mx-auto" style={{ fontSize: "1.05rem", lineHeight: uiDir === "rtl" ? "1.7" : "1.6" }}>
                {t.heroSubline}
              </p>
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
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              <div className="search-container flex gap-0 p-2" style={{ flexDirection: uiDir === "rtl" ? "row-reverse" : "row" }}>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.placeholder[0]}
                    className="w-full px-5 py-3.5 rounded-xl bg-transparent text-slate-800 text-lg focus:outline-none placeholder-slate-300 transition-all"
                    dir={uiDir}
                    style={{ textAlign: uiDir === "rtl" ? "right" : "left" }}
                    autoFocus={false}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary px-7 py-3.5 rounded-xl font-semibold text-base shrink-0 disabled:opacity-60"
                >
                  {isLoading ? "…" : t.explainBtn}
                </button>
              </div>
            </form>

            {/* Chips — idle only */}
            {isIdle && (
              <div className="flex flex-wrap gap-2 mt-6" style={{ justifyContent: uiDir === "rtl" ? "flex-end" : "flex-start" }}>
                <span className="text-slate-400 text-sm self-center">{t.tryLabel}</span>
                {t.chips.map((ex) => (
                  <button key={ex} onClick={() => handleSearch(ex)} className="gadit-chip">{ex}</button>
                ))}
              </div>
            )}

            {/* Support line */}
            {isIdle && (
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

            {/* Multi-meaning chooser */}
            {phase.kind === "chooseMeaning" && (
              <div className="gadit-card px-8 py-8 space-y-5 animate-fade-in">
                <p className="font-semibold text-slate-700" style={{ fontSize: "1.05rem", lineHeight: uiDir === "rtl" ? "1.6" : "1.5" }}>
                  {t.multiMeaningPrompt.replace("{word}", phase.word)}
                </p>
                <div className="space-y-3">
                  {/* Option 1: show all */}
                  <button
                    onClick={() => setPhase({ kind: "result", result: phase.result })}
                    className="w-full text-start px-5 py-4 rounded-2xl border-2 font-medium transition-all hover:border-blue-300 hover:bg-blue-50"
                    style={{ borderColor: "rgb(226 232 240)", color: "#0F172A" }}
                  >
                    <span className="text-blue-500 me-2">①</span>
                    {t.multiMeaningOptionAll}
                  </button>
                  {/* Option 2: context */}
                  <button
                    onClick={() => setPhase({ kind: "contextInput", word: phase.word })}
                    className="w-full text-start px-5 py-4 rounded-2xl border-2 font-medium transition-all hover:border-blue-300 hover:bg-blue-50"
                    style={{ borderColor: "rgb(226 232 240)", color: "#0F172A" }}
                  >
                    <span className="text-blue-500 me-2">②</span>
                    {t.multiMeaningOptionContext}
                  </button>
                </div>
              </div>
            )}

            {/* Context input */}
            {phase.kind === "contextInput" && (
              <div className="gadit-card px-8 py-8 space-y-4 animate-fade-in">
                <p className="font-semibold text-slate-700">{t.multiMeaningContextPlaceholder.replace("{word}", phase.word)}</p>
                <textarea
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  placeholder={t.multiMeaningContextPlaceholder.replace("{word}", phase.word)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-base focus:outline-none focus:ring-2 focus:border-blue-300 resize-none transition-all"
                  dir={uiDir}
                  style={{ textAlign: uiDir === "rtl" ? "right" : "left" }}
                  autoFocus
                />
                <div className="flex gap-3 flex-wrap">
                  <button onClick={handleContextSubmit} disabled={!contextInput.trim()} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50">
                    {t.multiMeaningContextBtn}
                  </button>
                  <button onClick={() => setPhase({ kind: "chooseMeaning", word: phase.word, result: { word: phase.word, language: "", multiplemeanings: true, meanings: [], etymology: "" } })} className="btn-secondary px-5 py-2.5 text-sm">
                    {t.showAllMeanings}
                  </button>
                </div>
              </div>
            )}

            {/* Full result */}
            {result && (
              <ResultView
                result={result}
                uiDir={uiDir}
                t={t}
                onReset={reset}
                onShowAll={() => {/* already showing all */}}
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
                  <span className="text-sm text-slate-400 font-medium">English</span>
                </div>
                <div className="px-8 py-6 space-y-4">
                  <p className="text-slate-700 text-lg leading-relaxed">{t.demoDefinition}</p>
                  <div className="flex gap-2 text-slate-500">
                    <span style={{ color: "#2563EB" }}>•</span>
                    <span className="italic text-base">{t.demoExample}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                      style={{ background: "rgb(37 99 235 / 0.07)", color: "#2563EB" }}>
                      ↓ {t.demoInsightLabel}
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
                <a href="mailto:hello@gadit.app" className="hover:text-blue-600 transition-colors">{t.footerContact}</a>
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
function ResultView({ result, uiDir, t, onReset }: {
  result: WordResult;
  uiDir: "ltr" | "rtl";
  t: ReturnType<typeof useLang>["t"];
  onReset: () => void;
  onShowAll: () => void;
}) {
  const resultLangDir = isRTLLanguage(result.language) ? "rtl" : "ltr";
  const rDir = resultLangDir;
  const lineH = rDir === "rtl" ? "1.7" : "1.6";

  return (
    <div className="space-y-4 animate-fade-in" dir={rDir}>

      {/* Word header */}
      <div className="gadit-card px-8 py-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-bold" style={{ color: "#0F172A", fontSize: "clamp(24px, 4vw, 32px)", letterSpacing: rDir === "rtl" ? "0.3px" : "-0.5px" }}>
            {result.word}
          </h2>
          <span className="text-sm text-slate-400 font-medium shrink-0">{result.language}</span>
        </div>
      </div>

      {/* Context note */}
      {result.contextNote && (
        <div className="px-8 py-5 rounded-3xl" style={{ background: "rgb(239 246 255)", border: "1px solid rgb(147 197 253 / 0.4)" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#2563EB" }}>{t.contextNote}</p>
          <p className="text-slate-600 text-sm leading-relaxed">{result.contextNote}</p>
        </div>
      )}

      {/* Meanings — each with its own examples */}
      {result.meanings?.map((m, i) => (
        <div key={i} className="gadit-card px-8 py-6 space-y-4">
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
        </div>
      ))}

      {/* Etymology */}
      {result.etymology && (
        <div className="gadit-card px-8 py-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t.etymologyLabel}</p>
          <p className="text-slate-600 text-sm leading-relaxed" style={{ lineHeight: lineH }}>
            {result.etymology}
          </p>
        </div>
      )}

      {/* Upsell */}
      <div className="rounded-3xl px-8 py-7 space-y-3" style={{ background: "rgb(248 250 252)", border: "1px solid rgb(226 232 240)" }}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.upsellBtn}</p>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 cursor-pointer hover:border-blue-200 transition-all" style={{ boxShadow: "var(--shadow-xs)" }}>
          <span className="text-xl shrink-0">🧒</span>
          <p className="font-medium text-slate-700 text-sm">{t.upsellKids}</p>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 cursor-pointer hover:border-blue-200 transition-all" style={{ boxShadow: "var(--shadow-xs)" }}>
          <span className="text-xl shrink-0">🖼️</span>
          <p className="font-medium text-slate-700 text-sm">{t.upsellVisual}</p>
        </div>
        <Link href="/pricing" className="btn-primary w-full py-3 text-sm text-center block mt-1">
          {t.upsellBtn}
        </Link>
      </div>

      {/* Back */}
      <button onClick={onReset} className="w-full py-3 rounded-2xl text-slate-400 text-sm hover:text-blue-500 transition-colors">
        {t.searchAnother}
      </button>
    </div>
  );
}

"use client";
import { useState, useEffect, useRef } from "react";
import { useLang } from "@/lib/lang-context";
import Link from "next/link";

interface WordResult {
  word: string;
  language: string;
  definition: string;
  examples: string[];
  etymology: string;
  forKids: string;
  multiplemeanings: boolean;
  opposite?: string;
  confusable?: string;
  register?: string;
  frequency?: string;
  wordFamily?: string[];
  fromCache?: boolean;
}

const EXAMPLES = ["set", "banco", "שלום", "любовь", "ephemeral", "مرحبا"];

const isRTLLanguage = (lang?: string) =>
  ["Hebrew", "Arabic", "Urdu", "Persian"].includes(lang ?? "");

const UI_STRINGS: Record<string, {
  useThisWord: string; makeItYours: string; placeholder: string;
  checkBtn: string; checking: string; understandMore: string;
  goDeeper: string; moreExamples: string; forKids: string;
  opposite: string; confusable: string; register: string;
  frequency: string; wordFamily: string; searchAnother: string;
  origin: string;
}> = {
  Hebrew: {
    useThisWord: "✍️ השתמש במילה",
    makeItYours: "תעשה את זה שלך",
    placeholder: 'השתמש ב"{word}" במשפט משלך',
    checkBtn: "בדוק את המשפט שלי",
    checking: "בודק…",
    understandMore: "הבן יותר ↓",
    goDeeper: "העמק ↓",
    moreExamples: "עוד דוגמאות",
    forKids: "הסבר לילדים",
    opposite: "הפך",
    confusable: "לא להתבלבל עם",
    register: "רישום",
    frequency: "תדירות",
    wordFamily: "משפחת המילה",
    searchAnother: "← חפש מילה אחרת",
    origin: "מקור המילה",
  },
  Arabic: {
    useThisWord: "✍️ استخدم هذه الكلمة",
    makeItYours: "اجعلها لك",
    placeholder: 'استخدم "{word}" في جملتك الخاصة',
    checkBtn: "تحقق من جملتي",
    checking: "جارٍ التحقق…",
    understandMore: "فهم أكثر ↓",
    goDeeper: "تعمق أكثر ↓",
    moreExamples: "مزيد من الأمثلة",
    forKids: "شرح للأطفال",
    opposite: "المعاكس",
    confusable: "لا تخلط مع",
    register: "المستوى اللغوي",
    frequency: "التكرار",
    wordFamily: "عائلة الكلمة",
    searchAnother: "← ابحث عن كلمة أخرى",
    origin: "أصل الكلمة",
  },
};

function getUI(language?: string) {
  return UI_STRINGS[language ?? ""] ?? {
    useThisWord: "✍️ Use this word",
    makeItYours: "Make it yours",
    placeholder: 'Use "{word}" in your own sentence',
    checkBtn: "Check my sentence",
    checking: "Checking…",
    understandMore: "Understand more ↓",
    goDeeper: "Go deeper ↓",
    moreExamples: "More examples",
    forKids: "Explain like I'm 10",
    opposite: "Opposite",
    confusable: "Don't confuse with",
    register: "Register",
    frequency: "Frequency",
    wordFamily: "Word family",
    searchAnother: "← Search another word",
    origin: "Origin",
  };
}

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
  const [result, setResult] = useState<WordResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [layer, setLayer] = useState(1);
  const [useThisWordOpen, setUseThisWordOpen] = useState(false);
  const [userSentence, setUserSentence] = useState("");
  const [sentenceFeedback, setSentenceFeedback] = useState<{status: string; message: string} | null>(null);
  const [checkingsentence, setCheckingsentence] = useState(false);

  const { t, dir: uiDir } = useLang();
  const resultRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useSectionObserver();

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % t.placeholder.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [t]);

  const isRTL = isRTLLanguage(result?.language);
  const resultDir = isRTL ? "rtl" : "ltr";
  const rui = getUI(result?.language);

  function detectInputLanguage(text: string): string | null {
    if (!text.trim()) return null;
    if (/[\u0590-\u05FF]/.test(text)) return "Hebrew";
    if (/[\u0600-\u06FF]/.test(text)) return "Arabic";
    if (/[\u0400-\u04FF]/.test(text)) return "Russian";
    if (/[\u3040-\u30FF\u4E00-\u9FFF]/.test(text)) return "Japanese";
    if (/[\u0900-\u097F]/.test(text)) return "Hindi";
    return null;
  }

  const detectedLang = detectInputLanguage(input);

  async function handleSearch(wordOrSentence?: string) {
    const query = (wordOrSentence ?? input).trim();
    if (!query) return;
    setLoading(true);
    setError("");
    setResult(null);
    setLayer(1);
    setUseThisWordOpen(false);
    setUserSentence("");
    setSentenceFeedback(null);
    if (wordOrSentence) setInput(wordOrSentence);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    try {
      const res = await fetch("/api/define", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: query }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckSentence() {
    if (!userSentence.trim() || !result) return;
    setCheckingsentence(true);
    setSentenceFeedback(null);
    try {
      const res = await fetch("/api/check-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: result.word, sentence: userSentence, definition: result.definition }),
      });
      const data = await res.json();
      setSentenceFeedback(data);
    } catch {
      setSentenceFeedback({ status: "error", message: "Could not check. Try again." });
    } finally {
      setCheckingsentence(false);
    }
  }

  const FEATURES = [t.feat1, t.feat2, t.feat3, t.feat4, t.feat5, t.feat6, t.feat7, t.feat8];
  const FEATURE_ICONS = ["📖", "💬", "🧒", "🔍", "🔗", "🌱", "✍️", "📅"];
  const WHO = [t.who1, t.who2, t.who3, t.who4, t.who5];
  const WHO_ICONS = ["🎓", "👨‍👩‍👧", "🏫", "🌍", "💡"];

  return (
    <main className="min-h-screen bg-[#F8FAFC]" dir={uiDir}>

      {/* ── HERO ── */}
      <section id="hero" className="relative pt-28 pb-20 px-4 overflow-hidden">
        {/* Subtle background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgb(37 99 235 / 0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-2xl mx-auto">
          {/* Brand + headline */}
          <div className="text-center mb-10 animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight" style={{ color: "#0F172A", letterSpacing: "-1.5px" }}>
              <span style={{ color: "#2563EB" }}>Gad</span>it
            </h1>
            <p className="text-2xl font-semibold mb-3" style={{ color: "#0F172A", letterSpacing: "-0.5px" }}>
              {t.heroHeadline}
            </p>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md mx-auto">
              {t.heroSubline}
            </p>
          </div>

          {/* Search */}
          <div ref={searchRef} className="animate-fade-in-up delay-200">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              <div className="search-container flex gap-0 p-2" style={{ flexDirection: uiDir === "rtl" ? "row-reverse" : "row" }}>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.placeholder[placeholderIdx]}
                    className="w-full px-5 py-3.5 rounded-xl bg-transparent text-slate-800 text-lg focus:outline-none placeholder-slate-300 transition-all"
                    dir={uiDir}
                    style={{ fontSize: "1.05rem", textAlign: uiDir === "rtl" ? "right" : "left" }}
                  />
                  {detectedLang && (
                    <span
                      className="absolute -bottom-6 text-xs text-slate-400 pointer-events-none"
                      style={{ [uiDir === "rtl" ? "left" : "right"]: "0.5rem" }}
                    >
                      {detectedLang} detected
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-7 py-3.5 rounded-xl font-semibold text-base shrink-0 disabled:opacity-50"
                >
                  {loading ? "…" : t.explainBtn}
                </button>
              </div>
            </form>

            {/* Chips */}
            <div
              className="flex flex-wrap gap-2 mt-8"
              style={{ justifyContent: uiDir === "rtl" ? "flex-end" : "flex-start", direction: uiDir }}
            >
              <span className="text-slate-400 text-sm self-center">{t.tryLabel}</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => handleSearch(ex)}
                  className="gadit-chip"
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* Support line */}
            {!result && !loading && (
              <p className="text-center text-slate-400 text-sm mt-6 animate-fade-in delay-400 italic"
                dangerouslySetInnerHTML={{ __html: t.heroSupport }} />
            )}
          </div>

          {error && (
            <div className="mt-6 px-5 py-4 rounded-2xl text-sm animate-fade-in"
              style={{ background: "rgb(254 226 226)", color: "#DC2626" }}>
              {error}
            </div>
          )}

          {/* ── RESULT ── */}
          <div ref={resultRef} className="mt-10">
            {result && (
              <div dir={resultDir} className="space-y-3 animate-fade-in">

                {/* Word header */}
                <div className="gadit-card px-8 py-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-3xl font-bold" style={{ color: "#0F172A" }}>{result.word}</h2>
                    <span className="text-sm text-slate-400 font-medium">{result.language}</span>
                  </div>
                </div>

                {/* Layer 1 */}
                <div className="gadit-card px-8 py-6 space-y-5">
                  <p className="text-slate-700 text-lg leading-relaxed">{result.definition}</p>

                  {result.examples?.[0] && (
                    <div className="flex gap-2 text-slate-500 text-base">
                      <span style={{ color: "#2563EB" }}>•</span>
                      <span className="italic">{result.examples[0]}</span>
                    </div>
                  )}

                  <div>
                    <button
                      onClick={() => setUseThisWordOpen((v) => !v)}
                      className="btn-secondary px-4 py-2 text-sm"
                    >
                      {rui.useThisWord}
                    </button>

                    {useThisWordOpen && (
                      <div className="mt-4 space-y-3 animate-fade-in">
                        <p className="text-sm font-semibold text-slate-500">{rui.makeItYours}</p>
                        <textarea
                          value={userSentence}
                          onChange={(e) => setUserSentence(e.target.value)}
                          placeholder={rui.placeholder.replace("{word}", result.word)}
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 resize-none transition-all"
                          style={{ boxShadow: "var(--shadow-xs)" }}
                          dir={isRTL ? "rtl" : "ltr"}
                        />
                        <button
                          onClick={handleCheckSentence}
                          disabled={checkingsentence || !userSentence.trim()}
                          className="btn-primary px-5 py-2 text-sm disabled:opacity-50"
                        >
                          {checkingsentence ? rui.checking : rui.checkBtn}
                        </button>

                        {sentenceFeedback && (
                          <div className={`px-4 py-3 rounded-xl text-sm animate-fade-in ${
                            sentenceFeedback.status === "perfect"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : sentenceFeedback.status === "almost"
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-red-50 text-red-600 border border-red-100"
                          }`}>
                            <span className="font-semibold capitalize">{sentenceFeedback.status}. </span>
                            {sentenceFeedback.message}
                            {sentenceFeedback.status === "perfect" && (
                              <div className="mt-1 font-semibold" style={{ color: "#10B981" }}>
                                Word mastered ✓
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Layer 2 toggle */}
                {layer < 2 ? (
                  <button
                    onClick={() => setLayer(2)}
                    className="btn-secondary w-full py-3 text-sm font-medium"
                  >
                    {rui.understandMore}
                  </button>
                ) : (
                  <div className="gadit-card px-8 py-6 space-y-5 animate-fade-in">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {rui.understandMore.replace(" ↓","").replace("↓ ","")}
                    </p>

                    {result.examples?.length > 1 && (
                      <section>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{rui.moreExamples}</p>
                        <ul className="space-y-2">
                          {result.examples.slice(1).map((ex, i) => (
                            <li key={i} className="flex gap-2 text-slate-600 text-sm">
                              <span style={{ color: "#2563EB" }}>•</span>
                              <span className="italic">{ex}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {result.forKids && (
                      <section className="rounded-2xl p-4" style={{ background: "rgb(255 251 235)", border: "1px solid rgb(253 230 138 / 0.5)" }}>
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">{rui.forKids}</p>
                        <p className="text-slate-700 text-sm">{result.forKids}</p>
                      </section>
                    )}

                    {result.opposite && (
                      <section>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{rui.opposite}</p>
                        <p className="text-slate-600 text-sm">{result.opposite}</p>
                      </section>
                    )}

                    {result.confusable && (
                      <section>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{rui.confusable}</p>
                        <p className="text-slate-600 text-sm">{result.confusable}</p>
                      </section>
                    )}
                  </div>
                )}

                {/* Layer 3 toggle */}
                {layer === 2 && (
                  <button
                    onClick={() => setLayer(3)}
                    className="btn-secondary w-full py-3 text-sm font-medium"
                  >
                    {rui.goDeeper}
                  </button>
                )}

                {layer >= 3 && (
                  <div className="gadit-card px-8 py-6 space-y-5 animate-fade-in">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {rui.goDeeper.replace(" ↓","").replace("↓ ","")}
                    </p>

                    {result.etymology && (
                      <section>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{rui.origin}</p>
                        <p className="text-slate-600 text-sm leading-relaxed">{result.etymology}</p>
                      </section>
                    )}

                    {result.register && (
                      <section>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{rui.register}</p>
                        <p className="text-slate-600 text-sm">{result.register}</p>
                      </section>
                    )}

                    {result.frequency && (
                      <section>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{rui.frequency}</p>
                        <p className="text-slate-600 text-sm">{result.frequency}</p>
                      </section>
                    )}

                    {result.wordFamily && result.wordFamily.length > 0 && (
                      <section>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{rui.wordFamily}</p>
                        <div className="flex flex-wrap gap-2">
                          {result.wordFamily.map((w, i) => (
                            <span key={i} className="px-3 py-1 rounded-full text-sm font-medium"
                              style={{ background: "rgb(241 245 249)", color: "#475569" }}>
                              {w}
                            </span>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {/* New search */}
                <button
                  onClick={() => {
                    setResult(null); setInput(""); setLayer(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full py-3 rounded-2xl text-slate-400 text-sm hover:text-blue-500 transition-colors"
                >
                  {rui.searchAnother}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── DEMO + HOW IT WORKS ── */}
      {!result && (
        <section id="how-it-works" className="py-24 px-4 bg-white">
          <div className="max-w-2xl mx-auto">

            {/* Demo card */}
            <div className="observe-section section-hidden mb-20">
              <h2 className="text-3xl font-bold text-center mb-2" style={{ color: "#0F172A", letterSpacing: "-0.5px" }}>
                {t.demoSectionTitle}
              </h2>
              <p className="text-center text-slate-400 mb-10 text-base italic" dangerouslySetInnerHTML={{ __html: t.heroSupport }} />

              <div className="gadit-card overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
                {/* Fake browser bar */}
                <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2"
                  style={{ background: "rgb(248 250 252)" }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
                  <div className="flex-1 mx-3 px-3 py-1 rounded-md text-xs text-slate-400 border border-slate-200 bg-white text-center">
                    gadit.app
                  </div>
                </div>

                {/* Word header */}
                <div className="px-8 py-5 border-b border-slate-100 flex items-baseline justify-between">
                  <span className="text-2xl font-bold" style={{ color: "#0F172A" }}>{t.demoWord}</span>
                  <span className="text-sm text-slate-400 font-medium">English</span>
                </div>

                {/* Content */}
                <div className="px-8 py-6 space-y-4">
                  <p className="text-slate-700 text-lg leading-relaxed">{t.demoDefinition}</p>
                  <div className="flex gap-2 text-slate-500">
                    <span style={{ color: "#2563EB" }}>•</span>
                    <span className="italic text-base">{t.demoExample}</span>
                  </div>

                  {/* Deeper insight chip */}
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

            {/* How it works */}
            <div className="observe-section section-hidden">
              <h2 className="text-3xl font-bold text-center mb-14" style={{ color: "#0F172A", letterSpacing: "-0.5px" }}>
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
                <button
                  onClick={() => searchRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="btn-primary px-8 py-3.5 text-sm"
                >
                  {t.howCta}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES ── */}
      {!result && (
        <section id="features" className="py-24 px-4 bg-[#F8FAFC]">
          <div className="max-w-2xl mx-auto observe-section section-hidden">
            <h2 className="text-3xl font-bold text-center mb-14" style={{ color: "#0F172A", letterSpacing: "-0.5px" }}>
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

      {/* ── WHO IT'S FOR ── */}
      {!result && (
        <section className="py-24 px-4 bg-white">
          <div className="max-w-2xl mx-auto observe-section section-hidden">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "#0F172A", letterSpacing: "-0.5px" }}>
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

      {/* ── WHY DIFFERENT ── */}
      {!result && (
        <section className="py-24 px-4 bg-[#F8FAFC]">
          <div className="max-w-xl mx-auto text-center observe-section section-hidden">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#0F172A", letterSpacing: "-0.5px" }}>
              {t.whyTitle}
            </h2>
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

      {/* ── PRICING TEASER ── */}
      {!result && (
        <section id="pricing-teaser" className="py-24 px-4 bg-white">
          <div className="max-w-xl mx-auto text-center observe-section section-hidden">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#0F172A", letterSpacing: "-0.5px" }}>
              {t.pricingTeaserTitle}
            </h2>
            <p className="text-slate-400 text-base mb-10 leading-relaxed max-w-sm mx-auto">
              {t.pricingTeaserText}
            </p>
            <Link
              href="/pricing"
              className="btn-secondary inline-block px-8 py-3.5 text-sm font-semibold"
            >
              {t.viewPricing}
            </Link>
          </div>
        </section>
      )}

      {/* ── FINAL CTA ── */}
      {!result && (
        <section className="py-28 px-4 relative overflow-hidden" style={{ background: "#2563EB" }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgb(255 255 255 / 0.06) 0%, transparent 70%)" }}
          />
          <div className="relative max-w-xl mx-auto text-center observe-section section-hidden">
            <h2 className="text-3xl font-bold text-white mb-3" style={{ letterSpacing: "-0.5px" }}>
              {t.finalCtaTitle}
            </h2>
            <p className="text-blue-200 text-base mb-10 leading-relaxed">{t.finalCtaText}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => searchRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-3.5 rounded-xl font-semibold text-sm bg-white hover:bg-blue-50 transition-all"
                style={{ color: "#2563EB", boxShadow: "0 4px 16px rgb(0 0 0 / 0.12)" }}
              >
                {t.startUnderstandingFree}
              </button>
              <Link
                href="/pricing"
                className="px-8 py-3.5 rounded-xl font-semibold text-sm border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all"
              >
                {t.viewPricing}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      {!result && (
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

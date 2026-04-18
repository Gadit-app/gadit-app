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
    // scroll to result area
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
      <section id="hero" className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Brand */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-3" style={{ color: "#0F172A", letterSpacing: "-1px" }}>
              <span style={{ color: "#2563EB" }}>Gad</span>it
            </h1>
            <p className="text-xl font-medium mb-1" style={{ color: "#0F172A" }}>{t.heroHeadline}</p>
            <p className="text-slate-400 text-base">{t.heroSubline}</p>
          </div>

          {/* Search */}
          <div ref={searchRef}>
            <form
              onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
              className="mb-4"
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.placeholder[placeholderIdx]}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white shadow-sm text-slate-800 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    dir="auto"
                  />
                  {detectedLang && (
                    <span className="absolute -bottom-6 right-1 text-xs text-slate-400 pointer-events-none">
                      {detectedLang} detected
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-7 py-4 rounded-2xl font-semibold text-lg text-white disabled:opacity-50 transition-all hover:opacity-90"
                  style={{ background: "#2563EB" }}
                >
                  {loading ? "…" : t.explainBtn}
                </button>
              </div>
            </form>

            {/* Example chips */}
            <div className="flex flex-wrap gap-2 justify-center mt-8 mb-4">
              <span className="text-slate-400 text-sm self-center">{t.tryLabel}</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => handleSearch(ex)}
                  className="px-3 py-1.5 rounded-full text-sm border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all"
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* Support line */}
            {!result && !loading && (
              <div className="text-center space-y-1 mt-4">
                <p className="text-slate-400 text-sm">{t.heroSupport}</p>
                <p className="text-slate-300 text-xs">{t.heroLangs}</p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 px-5 py-4 rounded-2xl mt-6 text-sm">
              {error}
            </div>
          )}

          {/* ── RESULT ── */}
          <div ref={resultRef}>
            {result && (
              <div dir={resultDir} className="mt-8 space-y-3">

                {/* Word header */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-8 py-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-3xl font-bold" style={{ color: "#0F172A" }}>{result.word}</h2>
                    <span className="text-sm text-slate-400">{result.language}</span>
                  </div>
                </div>

                {/* Layer 1 */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-8 py-6 space-y-5">
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
                      className="mt-1 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all"
                    >
                      {rui.useThisWord}
                    </button>

                    {useThisWordOpen && (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm font-semibold text-slate-500">{rui.makeItYours}</p>
                        <textarea
                          value={userSentence}
                          onChange={(e) => setUserSentence(e.target.value)}
                          placeholder={rui.placeholder.replace("{word}", result.word)}
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                          dir={isRTL ? "rtl" : "ltr"}
                        />
                        <button
                          onClick={handleCheckSentence}
                          disabled={checkingsentence || !userSentence.trim()}
                          className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
                          style={{ background: "#2563EB" }}
                        >
                          {checkingsentence ? rui.checking : rui.checkBtn}
                        </button>

                        {sentenceFeedback && (
                          <div className={`px-4 py-3 rounded-xl text-sm ${
                            sentenceFeedback.status === "perfect"
                              ? "bg-emerald-50 text-emerald-700"
                              : sentenceFeedback.status === "almost"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-600"
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

                {/* Layer 2 */}
                {layer < 2 ? (
                  <button
                    onClick={() => setLayer(2)}
                    className="w-full py-3 rounded-2xl border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:border-blue-300 hover:text-blue-600 transition-all"
                  >
                    {rui.understandMore}
                  </button>
                ) : (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-8 py-6 space-y-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{rui.understandMore.replace(" ↓","").replace("↓ ","")}</p>

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
                      <section className="bg-amber-50 rounded-2xl p-4">
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

                {/* Layer 3 */}
                {layer === 2 && (
                  <button
                    onClick={() => setLayer(3)}
                    className="w-full py-3 rounded-2xl border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:border-blue-300 hover:text-blue-600 transition-all"
                  >
                    {rui.goDeeper}
                  </button>
                )}

                {layer >= 3 && (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-8 py-6 space-y-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{rui.goDeeper.replace(" ↓","").replace("↓ ","")}</p>

                    {result.etymology && (
                      <section>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{rui.origin}</p>
                        <p className="text-slate-600 text-sm">{result.etymology}</p>
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
                            <span key={i} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm">{w}</span>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {/* New search */}
                <button
                  onClick={() => { setResult(null); setInput(""); setLayer(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="w-full py-3 rounded-2xl text-slate-400 text-sm hover:text-blue-500 transition-all"
                >
                  {rui.searchAnother}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── DEMO ── */}
      {!result && (
        <section id="how-it-works" className="py-20 px-4 bg-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-3" style={{ color: "#0F172A" }}>{t.demoSectionTitle}</h2>
            <p className="text-center text-slate-400 mb-10">{t.heroSupport}</p>

            <div className="bg-[#F8FAFC] rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Word bar */}
              <div className="px-8 py-5 border-b border-slate-100 flex items-baseline justify-between">
                <span className="text-2xl font-bold" style={{ color: "#0F172A" }}>{t.demoWord}</span>
                <span className="text-sm text-slate-400">English</span>
              </div>
              {/* Definition */}
              <div className="px-8 py-6 space-y-4">
                <p className="text-slate-700 text-lg leading-relaxed">{t.demoDefinition}</p>
                <div className="flex gap-2 text-slate-500 text-base">
                  <span style={{ color: "#2563EB" }}>•</span>
                  <span className="italic">{t.demoExample}</span>
                </div>
                {/* Deeper insight */}
                <div className="mt-2 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t.demoInsightLabel}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{t.demoInsight}</p>
                </div>
              </div>
            </div>

            {/* How it works steps */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "#0F172A" }}>{t.howItWorksTitle}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { num: "1", title: t.howStep1Title, desc: t.howStep1Desc },
                  { num: "2", title: t.howStep2Title, desc: t.howStep2Desc },
                  { num: "3", title: t.howStep3Title, desc: t.howStep3Desc },
                ].map((step) => (
                  <div key={step.num} className="text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4" style={{ background: "#2563EB" }}>
                      {step.num}
                    </div>
                    <h3 className="font-semibold mb-2" style={{ color: "#0F172A" }}>{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-10">
                <button
                  onClick={() => { searchRef.current?.scrollIntoView({ behavior: "smooth" }); }}
                  className="px-8 py-3 rounded-2xl font-semibold text-white text-sm hover:opacity-90 transition-all"
                  style={{ background: "#2563EB" }}
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
        <section id="features" className="py-20 px-4 bg-[#F8FAFC]">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "#0F172A" }}>{t.featuresTitle}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FEATURES.map((feat, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-5 text-center hover:border-blue-200 transition-all">
                  <div className="text-2xl mb-2">{FEATURE_ICONS[i]}</div>
                  <p className="text-sm font-medium text-slate-700">{feat}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WHO IT'S FOR ── */}
      {!result && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "#0F172A" }}>{t.whoTitle}</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {WHO.map((who, i) => (
                <div key={i} className="flex items-center gap-3 bg-[#F8FAFC] rounded-2xl border border-slate-100 px-6 py-4">
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
        <section className="py-20 px-4 bg-[#F8FAFC]">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#0F172A" }}>{t.whyTitle}</h2>
            <p className="text-slate-500 text-lg mb-8">{t.whyCopy}</p>
            <div className="flex flex-col gap-3 items-center">
              {[t.whyBullet1, t.whyBullet2, t.whyBullet3].map((b, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-6 py-3 shadow-sm">
                  <span style={{ color: "#2563EB" }} className="font-bold text-lg">✓</span>
                  <span className="text-slate-700 font-medium">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PRICING TEASER ── */}
      {!result && (
        <section id="pricing-teaser" className="py-20 px-4 bg-white">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#0F172A" }}>{t.pricingTeaserTitle}</h2>
            <p className="text-slate-400 text-base mb-8">{t.pricingTeaserText}</p>
            <Link
              href="/pricing"
              className="inline-block px-8 py-3 rounded-2xl font-semibold text-sm border-2 border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-all"
            >
              {t.viewPricing}
            </Link>
          </div>
        </section>
      )}

      {/* ── FINAL CTA ── */}
      {!result && (
        <section className="py-24 px-4" style={{ background: "#2563EB" }}>
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-3">{t.finalCtaTitle}</h2>
            <p className="text-blue-200 text-base mb-8">{t.finalCtaText}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => { searchRef.current?.scrollIntoView({ behavior: "smooth" }); }}
                className="px-8 py-3 rounded-2xl font-semibold text-sm bg-white hover:bg-blue-50 transition-all"
                style={{ color: "#2563EB" }}
              >
                {t.startUnderstandingFree}
              </button>
              <Link
                href="/pricing"
                className="px-8 py-3 rounded-2xl font-semibold text-sm border-2 border-white text-white hover:bg-white/10 transition-all"
              >
                {t.viewPricing}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      {!result && (
        <footer className="py-10 px-4 bg-[#F8FAFC] border-t border-slate-100">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <span className="text-sm font-medium" style={{ color: "#0F172A" }}>
                <span style={{ color: "#2563EB" }}>Gad</span>it
              </span>
              <div className="flex flex-wrap gap-5 text-sm text-slate-400">
                <Link href="/" className="hover:text-blue-600 transition-all">{t.heroHeadline.split(" ").slice(0,1).join("")}</Link>
                <Link href="/pricing" className="hover:text-blue-600 transition-all">{t.pricing}</Link>
                <a href="mailto:hello@gadit.app" className="hover:text-blue-600 transition-all">{t.footerContact}</a>
                <Link href="/privacy" className="hover:text-blue-600 transition-all">{t.footerPrivacy}</Link>
                <Link href="/terms" className="hover:text-blue-600 transition-all">{t.footerTerms}</Link>
              </div>
            </div>
            <p className="text-center text-slate-300 text-xs mt-6">{t.footerTagline}</p>
          </div>
        </footer>
      )}

    </main>
  );
}

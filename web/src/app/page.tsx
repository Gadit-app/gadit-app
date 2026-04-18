"use client";
import { useState, useEffect } from "react";

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

const PLACEHOLDERS = [
  'Type a word or sentence…',
  'Try "שלום"',
  'Try "banco"',
  'Try "amor"',
  'Try "bank"',
  'Try "مرحبا"',
];

const EXAMPLES = ["set", "banco", "שלום", "любовь", "ephemeral", "مرحبا"];

const isRTLLanguage = (lang?: string) =>
  ["Hebrew", "Arabic", "Urdu", "Persian"].includes(lang ?? "");

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

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const isRTL = isRTLLanguage(result?.language);

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
    try {
      const res = await fetch("/api/define", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: query }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      if (wordOrSentence) setInput(wordOrSentence);
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

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-14">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-2" style={{ color: "#0F172A", letterSpacing: "-1px" }}>
            <span style={{ color: "#2563EB" }}>Gad</span>it
          </h1>
          <p className="text-slate-400 text-base">Every word, understood.</p>
        </div>

        {/* Search */}
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
                placeholder={PLACEHOLDERS[placeholderIdx]}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white shadow-sm text-slate-800 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                dir="auto"
              />
              {detectedLang && (
                <span className="absolute -bottom-5 right-1 text-xs text-slate-400 pointer-events-none">
                  {detectedLang} detected
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-4 rounded-2xl font-semibold text-lg text-white disabled:opacity-50 transition-all"
              style={{ background: "#2563EB" }}
            >
              {loading ? "…" : "Explain"}
            </button>
          </div>
        </form>

        {/* Quick examples */}
        {!result && (
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <span className="text-slate-400 text-sm mr-1 self-center">Try:</span>
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
        )}

        {/* Tagline + language support */}
        {!result && !loading && (
          <div className="text-center space-y-2">
            <p className="text-slate-400 text-sm">Not <em>just</em> a dictionary. A way to understand.</p>
            <p className="text-slate-300 text-xs">
              English · Hebrew · Arabic · Spanish · French · Russian · German · Hindi · Portuguese · Japanese
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-500 px-5 py-4 rounded-2xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div dir={isRTL ? "rtl" : "ltr"} className="mt-6 space-y-3">

            {/* Word header */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-8 py-6">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-3xl font-bold" style={{ color: "#0F172A" }}>{result.word}</h2>
                <span className="text-sm text-slate-400">{result.language}</span>
              </div>
            </div>

            {/* Layer 1 — Immediate clarity */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-8 py-6 space-y-5">
              <p className="text-slate-700 text-lg leading-relaxed">{result.definition}</p>

              {result.examples?.[0] && (
                <div className="flex gap-2 text-slate-500 text-base">
                  <span style={{ color: "#2563EB" }}>•</span>
                  <span className="italic">{result.examples[0]}</span>
                </div>
              )}

              {/* Use this word */}
              <div>
                <button
                  onClick={() => setUseThisWordOpen((v) => !v)}
                  className="mt-1 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all"
                >
                  ✍️ Use this word
                </button>

                {useThisWordOpen && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-semibold text-slate-500">Make it yours</p>
                    <textarea
                      value={userSentence}
                      onChange={(e) => setUserSentence(e.target.value)}
                      placeholder={`Use "${result.word}" in your own sentence`}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                      dir="auto"
                    />
                    <button
                      onClick={handleCheckSentence}
                      disabled={checkingsentence || !userSentence.trim()}
                      className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
                      style={{ background: "#2563EB" }}
                    >
                      {checkingsentence ? "Checking…" : "Check my sentence"}
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

            {/* Layer 2 — Understand more */}
            {layer < 2 ? (
              <button
                onClick={() => setLayer(2)}
                className="w-full py-3 rounded-2xl border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:border-blue-300 hover:text-blue-600 transition-all"
              >
                Understand more ↓
              </button>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-8 py-6 space-y-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Understand more</p>

                {result.examples?.length > 1 && (
                  <section>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">More examples</p>
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
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Explain like I&apos;m 10</p>
                    <p className="text-slate-700 text-sm">{result.forKids}</p>
                  </section>
                )}

                {result.opposite && (
                  <section>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Opposite</p>
                    <p className="text-slate-600 text-sm">{result.opposite}</p>
                  </section>
                )}

                {result.confusable && (
                  <section>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Don&apos;t confuse with</p>
                    <p className="text-slate-600 text-sm">{result.confusable}</p>
                  </section>
                )}
              </div>
            )}

            {/* Layer 3 — Go deeper */}
            {layer === 2 && (
              <button
                onClick={() => setLayer(3)}
                className="w-full py-3 rounded-2xl border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:border-blue-300 hover:text-blue-600 transition-all"
              >
                Go deeper ↓
              </button>
            )}

            {layer >= 3 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-8 py-6 space-y-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Go deeper</p>

                {result.etymology && (
                  <section>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Origin</p>
                    <p className="text-slate-600 text-sm">{result.etymology}</p>
                  </section>
                )}

                {result.register && (
                  <section>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Register</p>
                    <p className="text-slate-600 text-sm">{result.register}</p>
                  </section>
                )}

                {result.frequency && (
                  <section>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Frequency</p>
                    <p className="text-slate-600 text-sm">{result.frequency}</p>
                  </section>
                )}

                {result.wordFamily && result.wordFamily.length > 0 && (
                  <section>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Word family</p>
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
              onClick={() => { setResult(null); setInput(""); setLayer(1); }}
              className="w-full py-3 rounded-2xl text-slate-400 text-sm hover:text-blue-500 transition-all"
            >
              ← Search another word
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

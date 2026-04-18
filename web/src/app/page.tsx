"use client";
import { useState } from "react";

interface WordResult {
  word: string;
  language: string;
  definition: string;
  examples: string[];
  etymology: string;
  forKids: string;
  multiplemeanings: boolean;
  fromCache?: boolean;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<WordResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isRTL = result?.language &&
    ["Hebrew", "Arabic", "Urdu", "Persian"].includes(result.language);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/define", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: input.trim() }),
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-800 mb-3">Gadit</h1>
          <p className="text-slate-500 text-lg">Every word, understood.</p>
        </div>

        <form onSubmit={handleSearch} className="mb-10">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type any word in any language..."
              className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 bg-white shadow-sm text-slate-800 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              dir="auto"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "..." : "→"}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 text-red-600 px-5 py-4 rounded-2xl mb-6">
            {error}
          </div>
        )}

        {result && (
          <div
            dir={isRTL ? "rtl" : "ltr"}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="bg-blue-600 px-8 py-6">
              <h2 className="text-3xl font-bold text-white">{result.word}</h2>
              <span className="text-blue-200 text-sm mt-1 block">{result.language}</span>
            </div>

            <div className="p-8 space-y-7">
              <section>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">🧠 Definition</h3>
                <p className="text-slate-700 text-lg leading-relaxed">{result.definition}</p>
              </section>

              {result.examples?.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">📄 Examples</h3>
                  <ul className="space-y-2">
                    {result.examples.map((ex, i) => (
                      <li key={i} className="flex gap-2 text-slate-600">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {result.etymology && (
                <section>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">🔍 Origin</h3>
                  <p className="text-slate-600">{result.etymology}</p>
                </section>
              )}

              {result.forKids && (
                <section className="bg-amber-50 rounded-2xl p-5">
                  <h3 className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">👧 For Kids</h3>
                  <p className="text-slate-700">{result.forKids}</p>
                </section>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-slate-400 text-sm mt-10">
          Hebrew · English · Arabic · Russian · Spanish · French · German · Hindi · Portuguese · Japanese
        </p>
      </div>
    </main>
  );
}

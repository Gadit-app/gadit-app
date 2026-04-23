"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { track } from "@/lib/track";
import ReportButton from "@/components/ReportButton";

interface CompareResult {
  language?: string;
  wordA?: string;
  wordB?: string;
  summaryA?: string;
  summaryB?: string;
  keyDifference?: string;
  exampleA?: string;
  exampleB?: string;
  commonMistake?: string;
  error?: string;
  invalidWord?: string;
}

type AccessState =
  | { kind: "loading" }
  | { kind: "anonymous" } // not signed in
  | { kind: "non_deep" } // signed in but not Deep — show upgrade gate
  | { kind: "deep" }; // signed in as Deep — full access

export default function CompareClient() {
  const { user, loading: authLoading, promptLogin } = useAuth();
  const { t, lang, dir } = useLang();
  const [access, setAccess] = useState<AccessState>({ kind: "loading" });
  const [wordA, setWordA] = useState("");
  const [wordB, setWordB] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Determine access on mount: hit /api/account to learn the user's plan.
  // This way we can show the upgrade gate UPFRONT instead of after they
  // type two words and submit.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setAccess({ kind: "anonymous" });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/account", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = (await res.json()) as { plan: "basic" | "clear" | "deep" };
        if (cancelled) return;
        setAccess(json.plan === "deep" ? { kind: "deep" } : { kind: "non_deep" });
      } catch (e) {
        console.error("compare access check:", e);
        // On error, fail closed — show the upgrade gate so we don't accidentally
        // expose the form to a non-Deep user.
        if (!cancelled) setAccess({ kind: "non_deep" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setResult(null);

    const a = wordA.trim();
    const b = wordB.trim();
    if (!a || !b || !user) return;

    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/compare-words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ wordA: a, wordB: b, uiLang: lang }),
      });

      // If access changed since mount (e.g. plan downgraded mid-session),
      // re-show the upgrade gate.
      if (res.status === 402) {
        setAccess({ kind: "non_deep" });
        return;
      }
      if (res.status === 401) {
        setAccess({ kind: "anonymous" });
        return;
      }
      if (!res.ok) throw new Error("HTTP " + res.status);

      const data: CompareResult = await res.json();
      setResult(data);
      track("compare_words", { wordA: a, wordB: b, uiLang: lang });
    } catch (err) {
      console.error("compare error:", err);
      setErrorMsg(t.compareErrorGeneric);
    } finally {
      setLoading(false);
    }
  }

  function renderResultError(res: CompareResult) {
    if (res.error === "not_a_real_word") {
      return (
        <p className="text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          {t.compareNotRealWord.replace("{word}", res.invalidWord || "?")}
        </p>
      );
    }
    if (res.error === "different_languages") {
      return (
        <p className="text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          {t.compareDifferentLanguages}
        </p>
      );
    }
    if (res.error === "same_word") {
      return (
        <p className="text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          {t.compareSameWord}
        </p>
      );
    }
    return null;
  }

  // ── Render guards ──

  if (access.kind === "loading") {
    return (
      <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4" dir={dir}>
        <div className="max-w-2xl mx-auto text-center text-slate-400 text-sm">
          {t.accountLoading}
        </div>
      </main>
    );
  }

  if (access.kind === "anonymous" || access.kind === "non_deep") {
    return (
      <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4" dir={dir}>
        <div className="max-w-2xl mx-auto">
          {/* Page header — same as the Deep version, so the user understands what they're upgrading for */}
          <div className="text-center mb-8">
            <h1
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ color: "#0F172A", letterSpacing: "-0.5px" }}
            >
              {t.compareTitle}
            </h1>
            <p className="text-slate-500 text-base leading-relaxed max-w-lg mx-auto">
              {t.compareSubtitle}
            </p>
          </div>

          {/* Upgrade card */}
          <div
            className="p-6 sm:p-8 rounded-3xl text-center"
            style={{
              background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              boxShadow: "0 8px 32px 0 rgb(37 99 235 / 0.25)",
            }}
          >
            <p className="text-white text-base mb-5 leading-relaxed">{t.compareDeepOnly}</p>
            {access.kind === "anonymous" ? (
              <button
                onClick={() => promptLogin("Sign in to compare words")}
                className="inline-block px-7 py-3 rounded-xl bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-all"
              >
                {t.login}
              </button>
            ) : (
              <Link
                href="/pricing"
                className="inline-block px-7 py-3 rounded-xl bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-all"
              >
                {t.accountUpgrade}
              </Link>
            )}
          </div>

          <Link
            href="/"
            className="block text-center mt-10 text-sm text-slate-500 hover:text-blue-600 transition-colors"
          >
            ← {t.searchAnother}
          </Link>
        </div>
      </main>
    );
  }

  // ── Deep tier — full UI ──

  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4" dir={dir}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: "#0F172A", letterSpacing: "-0.5px" }}
          >
            {t.compareTitle}
          </h1>
          <p className="text-slate-500 text-base leading-relaxed max-w-lg mx-auto">
            {t.compareSubtitle}
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={handleCompare} className="mb-8">
          <div
            className="bg-white rounded-3xl p-5 sm:p-6"
            style={{
              border: "1px solid rgb(226 232 240 / 0.9)",
              boxShadow: "0 2px 8px 0 rgb(0 0 0 / 0.04)",
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <input
                type="text"
                value={wordA}
                onChange={(e) => setWordA(e.target.value)}
                placeholder={t.compareWordAPlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                disabled={loading}
                dir="auto"
              />
              <input
                type="text"
                value={wordB}
                onChange={(e) => setWordB(e.target.value)}
                placeholder={t.compareWordBPlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                disabled={loading}
                dir="auto"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !wordA.trim() || !wordB.trim()}
              className="btn-primary w-full py-3 text-sm font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.compareLoading : t.compareBtn}
            </button>
          </div>
        </form>

        {/* Error */}
        {errorMsg && (
          <div className="mb-6 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4 animate-fade-in-up">
            {result.error ? (
              renderResultError(result)
            ) : (
              <>
                {/* Two cards side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    className="bg-white rounded-3xl p-5"
                    style={{
                      border: "1.5px solid rgb(147 197 253 / 0.6)",
                      boxShadow: "0 2px 8px 0 rgb(0 0 0 / 0.04)",
                    }}
                  >
                    <h2
                      className="text-2xl font-bold mb-2"
                      style={{ color: "#2563EB" }}
                      dir="auto"
                    >
                      {result.wordA}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">{result.summaryA}</p>
                  </div>
                  <div
                    className="bg-white rounded-3xl p-5"
                    style={{
                      border: "1.5px solid rgb(147 197 253 / 0.6)",
                      boxShadow: "0 2px 8px 0 rgb(0 0 0 / 0.04)",
                    }}
                  >
                    <h2
                      className="text-2xl font-bold mb-2"
                      style={{ color: "#2563EB" }}
                      dir="auto"
                    >
                      {result.wordB}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">{result.summaryB}</p>
                  </div>
                </div>

                {/* Key difference */}
                {result.keyDifference && (
                  <div
                    className="bg-white rounded-3xl p-6"
                    style={{
                      border: "1px solid rgb(226 232 240 / 0.9)",
                      boxShadow: "0 2px 8px 0 rgb(0 0 0 / 0.04)",
                    }}
                  >
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      {t.compareKeyDifference}
                    </h3>
                    <p className="text-base text-slate-700 leading-relaxed">
                      {result.keyDifference}
                    </p>
                  </div>
                )}

                {/* Examples */}
                {(result.exampleA || result.exampleB) && (
                  <div
                    className="bg-white rounded-3xl p-6"
                    style={{
                      border: "1px solid rgb(226 232 240 / 0.9)",
                      boxShadow: "0 2px 8px 0 rgb(0 0 0 / 0.04)",
                    }}
                  >
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                      {t.compareExamples}
                    </h3>
                    <div className="space-y-3">
                      {result.exampleA && (
                        <div>
                          <span className="text-xs font-semibold text-blue-600 mr-2" dir="auto">
                            {result.wordA}:
                          </span>
                          <span className="text-sm text-slate-700" dir="auto">
                            {result.exampleA}
                          </span>
                        </div>
                      )}
                      {result.exampleB && (
                        <div>
                          <span className="text-xs font-semibold text-blue-600 mr-2" dir="auto">
                            {result.wordB}:
                          </span>
                          <span className="text-sm text-slate-700" dir="auto">
                            {result.exampleB}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Common mistake */}
                {result.commonMistake && (
                  <div
                    className="rounded-3xl p-6"
                    style={{
                      background: "rgb(254 249 195 / 0.5)",
                      border: "1px solid rgb(253 224 71 / 0.6)",
                    }}
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgb(133 77 14)" }}>
                      ⚠ {t.compareCommonMistake}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgb(133 77 14)" }}>
                      {result.commonMistake}
                    </p>
                  </div>
                )}

                {/* Report a problem */}
                <div className="flex justify-end pt-2" dir="ltr">
                  <ReportButton
                    word={`${result.wordA ?? ""} / ${result.wordB ?? ""}`}
                    contextSnapshot={result}
                    defaultCategories={["compare_words"]}
                  />
                </div>
              </>
            )}
          </div>
        )}

        <Link
          href="/"
          className="block text-center mt-10 text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          ← {t.searchAnother}
        </Link>
      </div>
    </main>
  );
}

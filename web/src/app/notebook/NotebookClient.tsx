"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { track } from "@/lib/track";

interface NotebookItem {
  id: string;
  word: string;
  language: string;
  meaning: string;
  addedAt: string;
  nextReviewAt: string;
  intervalDays: number;
  timesReviewed: number;
  timesCorrect: number;
}

type ReviewState =
  | { kind: "list" }
  | { kind: "review"; queue: NotebookItem[]; index: number; revealed: boolean }
  | { kind: "done"; reviewed: number };

export default function NotebookClient() {
  const { user, loading: authLoading, promptLogin } = useAuth();
  const { t, dir, lang } = useLang();
  const [items, setItems] = useState<NotebookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [reviewState, setReviewState] = useState<ReviewState>({ kind: "list" });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      promptLogin("Sign in to view your notebook");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/notebook", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (res.status === 402) {
          if (!cancelled) setNeedsUpgrade(true);
          return;
        }
        if (res.status === 401) {
          promptLogin("Sign in to view your notebook");
          return;
        }
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        if (!cancelled) setItems(json.items as NotebookItem[]);
      } catch (e) {
        console.error("notebook load:", e);
        if (!cancelled) setErrorMsg(t.compareErrorGeneric);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, promptLogin, t.compareErrorGeneric]);

  async function startReview() {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/notebook/review", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      const queue = json.items as NotebookItem[];
      if (queue.length === 0) {
        // No words due yet — show empty review state via "done" with 0 count
        setReviewState({ kind: "done", reviewed: 0 });
        return;
      }
      setReviewState({ kind: "review", queue, index: 0, revealed: false });
      track("review_started", { count: queue.length, uiLang: lang });
    } catch (e) {
      console.error("start review:", e);
      setErrorMsg(t.compareErrorGeneric);
    }
  }

  async function answerReview(result: "correct" | "incorrect") {
    if (reviewState.kind !== "review" || !user) return;
    const current = reviewState.queue[reviewState.index];
    try {
      const idToken = await user.getIdToken();
      await fetch("/api/notebook/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ id: current.id, result }),
      });
    } catch (e) {
      console.error("answer review:", e);
    }

    const nextIndex = reviewState.index + 1;
    if (nextIndex >= reviewState.queue.length) {
      track("review_finished", { count: reviewState.queue.length, uiLang: lang });
      setReviewState({ kind: "done", reviewed: reviewState.queue.length });
    } else {
      setReviewState({
        kind: "review",
        queue: reviewState.queue,
        index: nextIndex,
        revealed: false,
      });
    }
  }

  async function removeWord(id: string) {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      await fetch(`/api/notebook?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (e) {
      console.error("remove word:", e);
    }
  }

  // ── Render guards ──

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4" dir={dir}>
        <div className="max-w-2xl mx-auto text-center text-slate-400 text-sm">
          {t.accountLoading}
        </div>
      </main>
    );
  }

  if (needsUpgrade) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4" dir={dir}>
        <div className="max-w-xl mx-auto">
          <div
            className="p-8 rounded-3xl text-center"
            style={{
              background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              boxShadow: "0 8px 32px 0 rgb(37 99 235 / 0.25)",
            }}
          >
            <h1 className="text-2xl font-bold text-white mb-3">{t.notebookTitle}</h1>
            <p className="text-blue-100 text-base mb-6 leading-relaxed">{t.notebookDeepOnly}</p>
            <Link
              href="/pricing"
              className="inline-block px-6 py-3 rounded-xl bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-all"
            >
              {t.accountUpgrade}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4" dir={dir}>
        <div className="max-w-2xl mx-auto text-center text-amber-700 text-sm">{errorMsg}</div>
      </main>
    );
  }

  // ── Review mode ──

  if (reviewState.kind === "review") {
    const current = reviewState.queue[reviewState.index];
    return (
      <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4" dir={dir}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2" style={{ color: "#0F172A" }}>
              {t.reviewTitle}
            </h1>
            <p className="text-xs text-slate-400">
              {t.reviewProgress
                .replace("{current}", String(reviewState.index + 1))
                .replace("{total}", String(reviewState.queue.length))}
            </p>
          </div>

          <div
            className="bg-white rounded-3xl p-8 sm:p-10 mb-6 text-center"
            style={{
              border: "1px solid rgb(226 232 240 / 0.9)",
              boxShadow: "0 4px 16px 0 rgb(0 0 0 / 0.06)",
            }}
          >
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">
              {current.language}
            </p>
            <h2
              className="text-4xl sm:text-5xl font-bold mb-8"
              style={{ color: "#0F172A" }}
              dir="auto"
            >
              {current.word}
            </h2>

            {!reviewState.revealed ? (
              <button
                onClick={() =>
                  setReviewState({ ...reviewState, revealed: true })
                }
                className="btn-secondary px-6 py-3 text-sm font-semibold rounded-xl"
              >
                {t.reviewShowMeaning}
              </button>
            ) : (
              <>
                <p
                  className="text-base text-slate-700 leading-relaxed mb-8 mx-auto max-w-md"
                  dir="auto"
                >
                  {current.meaning}
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <button
                    onClick={() => answerReview("incorrect")}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    {t.reviewDidntKnow}
                  </button>
                  <button
                    onClick={() => answerReview("correct")}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{
                      background: "#10B981",
                      boxShadow: "0 4px 14px rgb(16 185 129 / 0.25)",
                    }}
                  >
                    {t.reviewKnewIt}
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setReviewState({ kind: "list" })}
            className="block mx-auto text-sm text-slate-500 hover:text-blue-600 transition-colors"
          >
            ← {t.reviewBack}
          </button>
        </div>
      </main>
    );
  }

  if (reviewState.kind === "done") {
    return (
      <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4" dir={dir}>
        <div className="max-w-xl mx-auto text-center">
          <div
            className="p-10 rounded-3xl"
            style={{
              background: "white",
              border: "1px solid rgb(226 232 240 / 0.9)",
              boxShadow: "0 2px 8px 0 rgb(0 0 0 / 0.04)",
            }}
          >
            {reviewState.reviewed === 0 ? (
              <>
                <p className="text-base text-slate-600 leading-relaxed mb-6">
                  {t.reviewNoneToday}
                </p>
              </>
            ) : (
              <>
                <h1
                  className="text-2xl font-bold mb-3"
                  style={{ color: "#10B981" }}
                >
                  {t.reviewDone}
                </h1>
                <p className="text-base text-slate-600 leading-relaxed mb-6">
                  {t.reviewDoneText.replace("{count}", String(reviewState.reviewed))}
                </p>
              </>
            )}
            <button
              onClick={() => setReviewState({ kind: "list" })}
              className="btn-secondary px-5 py-2.5 text-sm font-semibold rounded-xl"
            >
              {t.reviewBack}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── List mode (default) ──

  const dueCount = items.filter(
    (it) => new Date(it.nextReviewAt) <= new Date()
  ).length;

  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4" dir={dir}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "#0F172A", letterSpacing: "-0.5px" }}
          >
            {t.notebookTitle}
          </h1>
          {items.length > 0 && (
            <p className="text-slate-500 text-sm">
              {items.length} {items.length === 1 ? "word" : "words"}
              {dueCount > 0 && (
                <>
                  {" · "}
                  <span style={{ color: "#2563EB" }}>
                    {t.reviewBadgeDue.replace("{count}", String(dueCount))}
                  </span>
                </>
              )}
            </p>
          )}
        </div>

        {/* Practice CTA */}
        {dueCount > 0 && (
          <button
            onClick={startReview}
            className="btn-primary w-full py-3.5 mb-6 text-sm font-semibold rounded-xl"
          >
            {t.reviewBtn}
          </button>
        )}

        {/* Empty state */}
        {items.length === 0 ? (
          <div
            className="bg-white rounded-3xl p-8 text-center"
            style={{
              border: "1px solid rgb(226 232 240 / 0.9)",
              boxShadow: "0 2px 8px 0 rgb(0 0 0 / 0.04)",
            }}
          >
            <p className="text-base text-slate-600 mb-2">{t.notebookEmpty}</p>
            <p className="text-sm text-slate-400 leading-relaxed">{t.notebookEmptyHint}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const isDue = new Date(item.nextReviewAt) <= new Date();
              return (
                <li
                  key={item.id}
                  className="bg-white rounded-2xl p-5 flex items-start justify-between gap-4"
                  style={{
                    border: isDue
                      ? "1.5px solid rgb(147 197 253 / 0.6)"
                      : "1px solid rgb(226 232 240 / 0.9)",
                    boxShadow: "0 2px 8px 0 rgb(0 0 0 / 0.04)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-lg font-bold mb-1"
                      style={{ color: "#0F172A" }}
                      dir="auto"
                    >
                      {item.word}
                    </h3>
                    <p
                      className="text-sm text-slate-600 leading-relaxed line-clamp-2"
                      dir="auto"
                    >
                      {item.meaning}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {item.timesReviewed > 0 &&
                        `${item.timesCorrect}/${item.timesReviewed} · `}
                      {t.notebookSavedAt} {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => removeWord(item.id)}
                    className="text-xs text-slate-400 hover:text-red-600 transition-colors shrink-0"
                    title={t.notebookRemoveBtn}
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
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

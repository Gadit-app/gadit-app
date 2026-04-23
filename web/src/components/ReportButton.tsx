"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

type Category =
  | "definition"
  | "etymology"
  | "example"
  | "kids_explanation"
  | "idioms"
  | "image"
  | "quiz_wrong_answer"
  | "compose_feedback"
  | "compare_words"
  | "other";

export default function ReportButton({
  word,
  contextSnapshot,
  defaultCategories = [],
  size = "sm",
  label,
}: {
  word: string;
  contextSnapshot?: unknown;
  defaultCategories?: Category[];
  size?: "xs" | "sm";
  label?: string;
}) {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selected, setSelected] = useState<Set<Category>>(
    new Set(defaultCategories)
  );
  const [details, setDetails] = useState("");

  // Reset on open
  useEffect(() => {
    if (open) {
      setSelected(new Set(defaultCategories));
      setDetails("");
      setSubmitted(false);
      setErrorMsg("");
    }
  }, [open, defaultCategories]);

  function toggle(cat: Category) {
    const next = new Set(selected);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setSelected(next);
  }

  async function submit() {
    if (selected.size === 0) {
      setErrorMsg(t.reportPickAtLeastOne);
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) {
        try {
          const idToken = await user.getIdToken();
          headers.Authorization = `Bearer ${idToken}`;
        } catch {
          /* not fatal — anonymous report */
        }
      }
      const res = await fetch("/api/report-error", {
        method: "POST",
        headers,
        body: JSON.stringify({
          categories: Array.from(selected),
          details,
          word,
          uiLang: lang,
          contextSnapshot,
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
        }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      setSubmitted(true);
      // Auto-close after 1.5s
      setTimeout(() => setOpen(false), 1800);
    } catch (e) {
      console.error("report submit:", e);
      setErrorMsg(t.compareErrorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  const triggerClass =
    size === "xs"
      ? "inline-flex items-center gap-1 text-xs text-slate-300 hover:text-slate-500 transition-colors"
      : "inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors";

  const ALL_CATEGORIES: { key: Category; labelKey: keyof typeof t }[] = [
    { key: "definition", labelKey: "reportCatDefinition" },
    { key: "etymology", labelKey: "reportCatEtymology" },
    { key: "example", labelKey: "reportCatExample" },
    { key: "kids_explanation", labelKey: "reportCatKids" },
    { key: "idioms", labelKey: "reportCatIdioms" },
    { key: "image", labelKey: "reportCatImage" },
    { key: "quiz_wrong_answer", labelKey: "reportCatQuiz" },
    { key: "compose_feedback", labelKey: "reportCatCompose" },
    { key: "compare_words", labelKey: "reportCatCompare" },
    { key: "other", labelKey: "reportCatOther" },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClass}
        title={t.reportButton}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="22" x2="4" y2="15" />
          <path d="M4 15c4-4 8 4 16 0V3c-8 4-12-4-16 0z" />
        </svg>
        {label !== "" && <span>{label ?? t.reportButton}</span>}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "rgb(15 23 42 / 0.5)" }}
          onClick={() => !submitting && setOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 max-h-[85vh] overflow-y-auto"
            style={{ boxShadow: "0 20px 50px rgb(0 0 0 / 0.20)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✓</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#0F172A" }}>
                  {t.reportThankYou}
                </h3>
                <p className="text-sm text-slate-500">{t.reportThankYouText}</p>
              </div>
            ) : (
              <>
                <h3
                  className="text-lg font-bold mb-1"
                  style={{ color: "#0F172A" }}
                >
                  {t.reportTitle}
                </h3>
                <p className="text-xs text-slate-500 mb-5">{t.reportSubtitle}</p>

                {/* Categories */}
                <div className="space-y-2 mb-5">
                  {ALL_CATEGORIES.map(({ key, labelKey }) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(key)}
                        onChange={() => toggle(key)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm text-slate-700">
                        {t[labelKey] as string}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Optional details */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-slate-500 mb-2">
                    {t.reportDetailsLabel}
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder={t.reportDetailsPlaceholder}
                    rows={3}
                    maxLength={2000}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                  />
                </div>

                {errorMsg && (
                  <p className="text-sm text-red-600 mb-3">{errorMsg}</p>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    {t.reportCancel}
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting || selected.size === 0}
                    className="btn-primary flex-1 py-2.5 text-sm rounded-xl disabled:opacity-50"
                  >
                    {submitting ? t.reportSubmitting : t.reportSubmit}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

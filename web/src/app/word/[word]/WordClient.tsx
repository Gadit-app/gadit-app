"use client";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";

interface Meaning {
  meaning: string;
  examples: string[];
}
interface Etymology {
  sourceLanguage?: string;
  originalWord?: string;
  breakdown?: string;
  originalMeaning?: string;
  historyNote?: string;
}
interface WordResult {
  word: string;
  language: string;
  multiplemeanings: boolean;
  meanings: Meaning[];
  etymology?: Etymology | string;
}

const isRTLLanguage = (lang?: string) =>
  ["Hebrew", "Arabic", "Urdu", "Persian"].includes(lang ?? "");

export default function WordClient({
  word,
  initialResult,
}: {
  word: string;
  initialResult: WordResult;
}) {
  const { t } = useLang();
  const result = initialResult;
  const rDir = isRTLLanguage(result.language) ? "rtl" : "ltr";
  const lineH = rDir === "rtl" ? "1.7" : "1.6";
  const ety = typeof result.etymology === "object" ? result.etymology : null;

  return (
    <div className="space-y-4 animate-fade-in" dir={rDir}>
      {/* Word header */}
      <div className="gadit-card px-5 sm:px-8 py-5 sm:py-6">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-bold" style={{ color: "#0F172A", fontSize: "clamp(24px, 4vw, 32px)" }}>
            {word}
          </h1>
          <span className="text-sm text-slate-400 font-medium shrink-0">{result.language}</span>
        </div>
      </div>

      {/* Meanings */}
      {result.meanings?.map((m, i) => (
        <div key={i} className="gadit-card px-5 sm:px-8 py-5 sm:py-6 space-y-4">
          <div className="flex items-start gap-3">
            {result.meanings.length > 1 && (
              <span
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ background: "#2563EB", minWidth: "1.5rem" }}
              >
                {i + 1}
              </span>
            )}
            <p className="text-slate-800 font-medium leading-relaxed" style={{ fontSize: "1.05rem", lineHeight: lineH }}>
              {m.meaning}
            </p>
          </div>
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
      {ety && (ety.sourceLanguage || ety.originalMeaning || ety.historyNote) && (
        <div className="gadit-card px-5 sm:px-8 py-5 sm:py-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{t.etymologyLabel}</p>
          <div className="space-y-3 text-sm" style={{ lineHeight: lineH }}>
            {ety.sourceLanguage && (
              <div className="flex gap-3 items-baseline">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider shrink-0 min-w-[80px]">{t.etySourceLanguage}</span>
                <span className="text-slate-700 font-medium">{ety.sourceLanguage}</span>
              </div>
            )}
            {ety.breakdown ? (
              <div className="flex gap-3 items-baseline">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider shrink-0 min-w-[80px]">{t.etyBreakdown}</span>
                <span className="text-slate-700 italic">{ety.breakdown}</span>
              </div>
            ) : (
              ety.originalWord && (
                <div className="flex gap-3 items-baseline">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider shrink-0 min-w-[80px]">{t.etyOriginalWord}</span>
                  <span className="text-slate-700 italic">{ety.originalWord}</span>
                </div>
              )
            )}
            {ety.originalMeaning && (
              <div className="flex gap-3 items-baseline">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider shrink-0 min-w-[80px]">{t.etyOriginalMeaning}</span>
                <span className="text-slate-600">{ety.originalMeaning}</span>
              </div>
            )}
            {ety.historyNote && (
              <div className="flex gap-3 items-baseline pt-2 border-t border-slate-100">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider shrink-0 min-w-[80px]">{t.etyHistoryNote}</span>
                <span className="text-slate-600 leading-relaxed">{ety.historyNote}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA — back to live search */}
      <Link
        href={`/?q=${encodeURIComponent(word)}`}
        className="block w-full py-3 rounded-2xl text-sm font-medium text-center transition-all"
        style={{
          background: "rgb(239 246 255)",
          color: "#2563EB",
          border: "1px solid rgb(147 197 253)",
        }}
      >
        {t.searchAnother} ←
      </Link>
    </div>
  );
}

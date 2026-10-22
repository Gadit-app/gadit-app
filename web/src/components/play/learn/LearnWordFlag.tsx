"use client";

/**
 * "Wrong translation?" on a word card of a Hebrew-as-a-second-language
 * lesson (2026-10-22): the Hebrew bank and its translations were written by
 * hand, so a child or a parent who sees a wrong translation or meaning flags
 * it with one tap. Sent to /api/learn-report with the user's sign-in (stored
 * server-side in learnReports, listed in /admin/learn-reports); a small
 * thanks replaces the button. Same look as the games' "Found a mistake?".
 */
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { learnExtraCopy } from "./learn-extra-i18n";

export function LearnWordFlag({ item, learnLang, lang, lessonId, topic }: {
  item: { w: string; t: string; nq?: string; en?: string };
  learnLang: string;
  lang: string;
  lessonId?: string;
  topic?: string;
}) {
  const { user } = useAuth();
  const xc = learnExtraCopy(lang);
  const [sent, setSent] = useState(false);
  if (!user) return null;

  async function send() {
    if (sent || !user) return;
    setSent(true);
    try {
      await fetch("/api/learn-report", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ lang: learnLang, w: item.w, t: item.t, nq: item.nq, en: item.en, ui: lang, lessonId, topic, pageUrl: window.location.pathname + window.location.search }),
      });
    } catch { /* best-effort: the thanks stays */ }
  }

  return (
    <span className="wb-report-q">
      {sent ? (
        <span className="wb-report-q-thanks" role="status" style={{ position: "static", display: "inline-block" }}>{xc.flagThanks}</span>
      ) : (
        <button type="button" className="wb-report-q-btn" onClick={() => void send()} aria-label={xc.flagAria} title={xc.flagAria}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 22V4" /><path d="M4 4h12l-2 4 2 4H4" />
          </svg>
          <span className="wb-report-q-label">{xc.flag}</span>
        </button>
      )}
    </span>
  );
}

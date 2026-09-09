"use client";

/**
 * PassageKeyWords — the Reader's "key words" panel.
 *
 * A parent pastes a child's homework and wants help fast, without tapping word
 * by word. This serves that moment the on-brand way (Sept 2026 positioning
 * council): it does the VOCABULARY job on the whole passage, not translation.
 *
 * WORDS are primary — the handful most worth learning from the text, each a tap
 * away from its full Gadit page (opens in a new tab so the reader keeps its
 * place, like the word popover). The GIST is secondary — one short orientation
 * line saying what the text is about, deliberately not long enough to do the
 * homework from. The words do the work; the gist only orients.
 *
 * Calls POST /api/passage-words (gpt-4o-mini, cached). Copy: he + en now, en
 * fallback for the rest until a batch translation lands. Gadi 2026-09-09.
 */

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";
import { stripLookupDiacritics } from "@/lib/tokenize-words";
import type { Lang } from "@/lib/i18n";

type KeyWord = { word: string; meaning: string };
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; gist: string; words: KeyWord[] }
  | { status: "error" }
  | { status: "login" };

type Copy = { cta: string; loading: string; gistLabel: string; wordsLabel: string; tapHint: string; error: string; empty: string };

const COPY: Record<string, Copy> = {
  en: {
    cta: "Key words in this text",
    loading: "Finding the key words…",
    gistLabel: "What this is about",
    wordsLabel: "Words worth learning",
    tapHint: "Tap a word to learn it in full.",
    error: "That didn't work. Try again.",
    empty: "No stand-out words here. Tap any word in the text to learn it.",
  },
  he: {
    cta: "המילים החשובות בקטע",
    loading: "מאתרים את המילים החשובות…",
    gistLabel: "על מה הקטע",
    wordsLabel: "מילים שכדאי ללמוד",
    tapHint: "לחצו על מילה כדי ללמוד אותה במלואה.",
    error: "לא הצלחנו. אפשר לנסות שוב.",
    empty: "אין כאן מילים בולטות. אפשר ללחוץ על כל מילה בטקסט כדי ללמוד אותה.",
  },
};

function copy(lang: string): Copy {
  return COPY[lang] ?? COPY.en;
}

export function PassageKeyWords({ text, lang }: { text: string; lang: Lang }) {
  const { user } = useAuth();
  const href = useHref();
  const t = copy(lang);
  const [state, setState] = useState<State>({ status: "idle" });

  async function run() {
    if (state.status === "loading") return;
    setState({ status: "loading" });
    try {
      if (!user) { setState({ status: "login" }); return; }
      const idToken = await user.getIdToken();
      const res = await fetch("/api/passage-words", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ text, lang }),
      });
      if (res.status === 401) { setState({ status: "login" }); return; }
      if (!res.ok) { setState({ status: "error" }); return; }
      const json = (await res.json()) as { gist?: string; words?: KeyWord[] };
      const words = Array.isArray(json.words) ? json.words : [];
      setState({ status: "ready", gist: json.gist ?? "", words });
    } catch {
      setState({ status: "error" });
    }
  }

  // Collapsed: a single, clearly-labelled action.
  if (state.status === "idle" || state.status === "login" || state.status === "error") {
    return (
      <div style={{ marginBottom: 18 }}>
        <button type="button" onClick={run} style={ctaBtn}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5L13 3z" />
          </svg>
          <span>{t.cta}</span>
        </button>
        {state.status === "error" && <p style={{ margin: "8px 2px 0", fontSize: 13, color: "#B91C1C" }}>{t.error}</p>}
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div style={{ ...panel, marginBottom: 18, color: "var(--ink-muted,#6B7280)", fontSize: 14 }}>
        {t.loading}
      </div>
    );
  }

  // Ready.
  const { gist, words } = state;
  return (
    <div style={{ ...panel, marginBottom: 18 }}>
      {words.length > 0 ? (
        <>
          <div style={labelRow}>{t.wordsLabel}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: gist ? 16 : 4 }}>
            {words.map((w, i) => (
              <Link
                key={i}
                href={href(`/word/${encodeURIComponent(stripLookupDiacritics(w.word))}`)}
                target="_blank"
                rel="noopener noreferrer"
                style={chip}
              >
                <span style={{ fontWeight: 700, color: "var(--ink,#20272E)" }}>{w.word}</span>
                {w.meaning && <span style={{ color: "var(--ink-muted,#6B7280)", fontWeight: 500 }}>· {w.meaning}</span>}
              </Link>
            ))}
          </div>
          <p style={{ margin: "0 0 2px", fontSize: 12.5, color: "var(--ink-muted,#9CA3AF)" }}>{t.tapHint}</p>
        </>
      ) : (
        <p style={{ margin: 0, fontSize: 14, color: "var(--ink-muted,#6B7280)" }}>{t.empty}</p>
      )}

      {gist && (
        <div style={{ marginTop: words.length > 0 ? 14 : 0, paddingTop: 14, borderTop: "1px solid var(--hairline,#EEF1F3)" }}>
          <div style={labelRow}>{t.gistLabel}</div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "var(--ink,#20272E)" }}>{gist}</p>
        </div>
      )}
    </div>
  );
}

const ctaBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8,
  background: "var(--card,#fff)", color: "var(--teal-deep,#0E7490)",
  border: "1px solid rgba(14,165,165,0.4)", borderRadius: 12,
  padding: "10px 16px", fontSize: 14.5, fontWeight: 700, cursor: "pointer",
  fontFamily: "inherit", transition: "background 0.16s ease, transform 0.16s ease",
};

const panel: React.CSSProperties = {
  background: "var(--card,#fff)", border: "1px solid var(--hairline,#E5E7EB)",
  borderRadius: 16, padding: "16px 18px",
  boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
};

const labelRow: React.CSSProperties = {
  fontSize: 11.5, letterSpacing: "0.12em", textTransform: "uppercase",
  fontWeight: 700, color: "var(--teal-deep,#0E7490)", marginBottom: 9,
};

const chip: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5,
  background: "var(--paper,#F7FAFA)", border: "1px solid var(--hairline,#E5E7EB)",
  borderRadius: 999, padding: "7px 13px", fontSize: 14, textDecoration: "none",
  lineHeight: 1.2, transition: "border-color 0.16s ease, background 0.16s ease",
};

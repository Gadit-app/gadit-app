"use client";

/**
 * ReadingCheck: the Reader's "done reading, let's check" step (Gadi
 * 2026-10-20). Three parts, one at a time:
 *   1. WORDS: each word the child tapped (max 8) plus up to 3 hard words they
 *      did not, as "what does the word mean HERE?" with the sentence from the
 *      text and 4 options. Right/wrong feedback with a one-line explanation.
 *      Every tapped word, and every word answered wrong, goes to the notebook.
 *   2. COMPREHENSION: 3 to 5 questions on the content of the text.
 *   3. SUMMARY: words and questions scores, "read again" and, from Homework,
 *      the way back (which tells the parent, via notifyActivity).
 * One call to /api/reading-check builds the whole check (cached server side).
 */

import { WaitText } from "@/components/WaitText";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useKidsMode } from "@/lib/use-kids-mode";
import { notifyActivity } from "@/lib/notify-activity-client";
import { readingCheckCopy, fillRc } from "@/lib/reading-check-i18n";
import { stripLookupDiacritics, tokenizeWords, wordKey } from "@/lib/tokenize-words";

type CheckWord = { word: string; sentence: string; options: string[]; answer: number; explain: string };
type CheckQuestion = { q: string; options: string[]; answer: number };
type CheckData = { language: string; words: CheckWord[]; questions: CheckQuestion[] };

type Props = {
  text: string;
  lang: string;
  dir: "rtl" | "ltr";
  /** Words the child tapped, as they appear in the text (max 8). */
  tapped: string[];
  /** Hard words from the passage the child did not tap (max 3). */
  hard: string[];
  /** Opened from Homework: the summary offers the way back. */
  fromHw: boolean;
  homeHref: string;
  homeLabel: string;
  /** Back to the same text. */
  onReadAgain: () => void;
};

const GREEN = "#15803D";
const RED = "#B91C1C";

const primaryBtn: CSSProperties = {
  background: "var(--teal,#0EA5A5)", color: "#fff", border: "none", borderRadius: 12,
  padding: "12px 24px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
};
const ghostBtn: CSSProperties = {
  background: "transparent", color: "var(--ink,#20272E)", border: "1px solid var(--hairline,#E5E7EB)",
  borderRadius: 12, padding: "12px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
};
const sheet: CSSProperties = {
  background: "var(--card,#fff)", border: "1px solid var(--hairline,#E5E7EB)", borderRadius: 18,
  padding: "20px 18px 22px", boxShadow: "0 1px 2px rgba(16,24,40,0.04), 0 10px 30px rgba(16,24,40,0.04)",
  boxSizing: "border-box", width: "100%", minWidth: 0,
};

/** The sentence with the asked word marked. */
function Sentence({ sentence, word }: { sentence: string; word: string }) {
  const k = wordKey(word);
  const toks = tokenizeWords(sentence);
  return (
    <p dir="auto" style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: "var(--ink,#20272E)", textAlign: "start", overflowWrap: "anywhere" }}>
      {toks.map((t, i) =>
        t.type === "word" && wordKey(t.value) === k ? (
          <mark key={i} style={{ background: "rgba(14,165,165,0.22)", color: "inherit", fontWeight: 800, borderRadius: 6, padding: "0 3px", boxShadow: "inset 0 -2px 0 var(--teal,#0EA5A5)" }}>{t.value}</mark>
        ) : (
          <span key={i}>{t.value}</span>
        ),
      )}
    </p>
  );
}

export function ReadingCheck({ text, lang, dir, tapped, hard, fromHw, homeHref, homeLabel, onReadAgain }: Props) {
  const { user } = useAuth();
  const [kids] = useKidsMode();
  const c = readingCheckCopy(lang);

  const [phase, setPhase] = useState<"loading" | "error" | "limit" | "short" | "run" | "summary">("loading");
  const [data, setData] = useState<CheckData | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wordsRight, setWordsRight] = useState(0);
  const [qRight, setQRight] = useState(0);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const tappedKeys = useMemo(() => new Set(tapped.map(wordKey)), [tapped]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a new attempt starts from the loading line
    setPhase("loading");
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const headers: Record<string, string> = { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` };
        // Emulator builds only (local UI tests): ask for the fixed sample.
        if (process.env.NEXT_PUBLIC_GADIT_EMULATORS === "1") headers["x-test-fixture"] = "1";
        const res = await fetch("/api/reading-check", {
          method: "POST",
          headers,
          body: JSON.stringify({ text, lang, kids, tapped, hard }),
        });
        const j = (await res.json().catch(() => ({}))) as Partial<CheckData> & { error?: string };
        if (cancelled) return;
        if (res.status === 429) { setPhase("limit"); return; }
        if (j.error === "too_short") { setPhase("short"); return; }
        if (!res.ok || !Array.isArray(j.questions) || !Array.isArray(j.words) || j.questions.length === 0) { setPhase("error"); return; }
        setData({ language: j.language || "English", words: j.words, questions: j.questions });
        setStep(0); setPicked(null); setWordsRight(0); setQRight(0); setSaved(new Set());
        setPhase("run");
      } catch {
        if (!cancelled) setPhase("error");
      }
    })();
    return () => { cancelled = true; };
    // The check is built once per opening (and per retry); kids/tapped/hard are fixed for it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, attempt]);

  async function saveToNotebook(w: CheckWord, language: string) {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ word: stripLookupDiacritics(w.word), language, meaning: w.options[w.answer] }),
      });
      if (res.ok) setSaved((prev) => new Set(prev).add(wordKey(w.word)));
    } catch { /* best-effort */ }
  }

  if (phase === "loading") {
    return (
      <div style={sheet} aria-live="polite">
        <p style={{ margin: 0, fontSize: 16, color: "var(--ink-muted,#6B7280)" }}><WaitText text={c.preparing} /></p>
      </div>
    );
  }
  if (phase === "error" || phase === "limit" || phase === "short") {
    const msg = phase === "limit" ? c.limit : phase === "short" ? c.tooShort : c.failed;
    return (
      <div style={sheet}>
        <p style={{ margin: "0 0 16px", fontSize: 16, color: "var(--ink,#20272E)" }}>{msg}</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {phase === "error" && <button type="button" style={primaryBtn} onClick={() => setAttempt((n) => n + 1)}>{c.retry}</button>}
          <button type="button" style={ghostBtn} onClick={onReadAgain}>{c.backToText}</button>
        </div>
      </div>
    );
  }
  if (!data) return null;

  const nWords = data.words.length;
  const total = nWords + data.questions.length;

  if (phase === "summary") {
    const score = wordsRight + qRight;
    const label = text.trim().split(/\s+/).slice(0, 6).join(" ");
    return (
      <div style={sheet}>
        <h2 style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 800, color: "var(--ink,#20272E)", lineHeight: 1.2 }}>{c.summaryHead}</h2>
        <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
          {nWords > 0 && (
            <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--paper,#F9FAFB)", border: "1px solid var(--hairline,#E5E7EB)", fontSize: 17, fontWeight: 700, color: "var(--ink,#20272E)" }}>
              {fillRc(c.wordsScore, { a: wordsRight, b: nWords })}
            </div>
          )}
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--paper,#F9FAFB)", border: "1px solid var(--hairline,#E5E7EB)", fontSize: 17, fontWeight: 700, color: "var(--ink,#20272E)" }}>
            {fillRc(c.qScore, { a: qRight, b: data.questions.length })}
          </div>
        </div>
        {saved.size > 0 && (
          <p style={{ margin: "0 0 16px", fontSize: 14.5, color: "var(--ink-muted,#6B7280)" }}>{fillRc(c.savedN, { n: saved.size })}</p>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
          <button type="button" style={fromHw ? ghostBtn : primaryBtn} onClick={onReadAgain}>{c.readAgain}</button>
        </div>
        {fromHw && (
          <Link href={homeHref} className="wb-hw-done"
            onClick={() => void notifyActivity(user, { kind: "read", label, score, total })}>{homeLabel}</Link>
        )}
      </div>
    );
  }

  // run
  const isWord = step < nWords;
  const item = isWord ? data.words[step] : data.questions[step - nWords];
  const answered = picked !== null;
  const correct = answered && picked === item.answer;

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const ok = i === item.answer;
    if (isWord) {
      const w = item as CheckWord;
      if (ok) setWordsRight((n) => n + 1);
      if (!ok || tappedKeys.has(wordKey(w.word))) void saveToNotebook(w, data!.language);
    } else if (ok) {
      setQRight((n) => n + 1);
    }
  }

  function next() {
    setPicked(null);
    if (step + 1 >= total) setPhase("summary");
    else setStep(step + 1);
  }

  const head = isWord ? c.wordsHead : c.qHead;
  const local = isWord ? step + 1 : step - nWords + 1;
  const localTotal = isWord ? nWords : data.questions.length;
  const [qBefore, qAfter] = c.wordQ.split("{w}");

  return (
    <div style={sheet}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--teal-deep,#0E7490)" }}>{head}</span>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-muted,#6B7280)" }}>{fillRc(c.step, { a: local, b: localTotal })}</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: "var(--hairline,#E5E7EB)", overflow: "hidden", marginBottom: 18 }}>
        <div style={{ height: "100%", width: `${Math.round((step / total) * 100)}%`, background: "var(--teal,#0EA5A5)", borderRadius: 999, transition: "width 0.25s" }} />
      </div>

      {isWord ? (
        <>
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--paper,#F9FAFB)", border: "1px solid var(--hairline,#E5E7EB)", marginBottom: 14 }}>
            <Sentence sentence={(item as CheckWord).sentence} word={(item as CheckWord).word} />
          </div>
          <p style={{ margin: "0 0 14px", fontSize: kids ? 19 : 18, fontWeight: 800, color: "var(--ink,#20272E)", lineHeight: 1.35 }}>
            {qBefore}<bdi>{(item as CheckWord).word}</bdi>{qAfter ?? ""}
          </p>
        </>
      ) : (
        <p style={{ margin: "0 0 14px", fontSize: kids ? 19 : 18, fontWeight: 800, color: "var(--ink,#20272E)", lineHeight: 1.35 }}>{(item as CheckQuestion).q}</p>
      )}

      <div role="group" style={{ display: "grid", gap: 10 }}>
        {item.options.map((o, i) => {
          const isRight = answered && i === item.answer;
          const isWrongPick = answered && i === picked && !isRight;
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              disabled={answered}
              dir={dir}
              aria-pressed={picked === i}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", boxSizing: "border-box", minHeight: 50,
                padding: "11px 14px", borderRadius: 12, textAlign: "start", fontFamily: "inherit",
                fontSize: kids ? 17.5 : 16, fontWeight: 600, lineHeight: 1.4, overflowWrap: "anywhere",
                cursor: answered ? "default" : "pointer",
                color: "var(--ink,#20272E)",
                background: isRight ? "rgba(22,163,74,0.14)" : isWrongPick ? "rgba(220,38,38,0.12)" : "var(--card,#fff)",
                border: `2px solid ${isRight ? "#16A34A" : isWrongPick ? "#DC2626" : "var(--hairline,#E5E7EB)"}`,
                opacity: answered && !isRight && !isWrongPick ? 0.6 : 1,
              }}
            >
              <span aria-hidden="true" style={{ flex: "none", width: 22, textAlign: "center", fontWeight: 800, color: isRight ? "#16A34A" : isWrongPick ? "#DC2626" : "var(--ink-muted,#9CA3AF)" }}>
                {isRight ? "✓" : isWrongPick ? "✗" : "•"}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>{o}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div aria-live="polite" style={{ marginTop: 16 }}>
          {/* A tinted pill with ink text: readable on every kid skin, light or dark. */}
          <p style={{ margin: "0 0 8px", display: "inline-block", padding: "6px 12px", borderRadius: 10, fontSize: 16, fontWeight: 800, color: "var(--ink,#20272E)", background: correct ? "rgba(22,163,74,0.16)" : "rgba(220,38,38,0.13)", borderInlineStart: `4px solid ${correct ? GREEN : RED}` }}>
            {correct ? c.right : c.wrong}
          </p>
          {isWord && (
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.55, color: "var(--ink,#20272E)" }}>{(item as CheckWord).explain}</p>
          )}
          {isWord && saved.has(wordKey((item as CheckWord).word)) && (
            <p style={{ margin: "8px 0 0", fontSize: 13.5, fontWeight: 600, color: "var(--teal-deep,#0E7490)" }}>✓ {c.saved}</p>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button type="button" style={primaryBtn} onClick={next}>{step + 1 >= total ? c.finish : c.next}</button>
          </div>
        </div>
      )}
    </div>
  );
}

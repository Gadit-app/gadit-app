"use client";

/**
 * Under each meaning's examples (Gadi 2026-10-24), two text links:
 *   "More example sentences": three new examples for THIS meaning, up to
 *     twice (paying plans only, hidden for free accounts);
 *   "Write a sentence of your own and check you understood": opens the
 *     sentence box right here, no page change, with a microphone, and the
 *     check is against THIS meaning. It replaces the pencil icon.
 */

import { useRef, useState } from "react";
import VoiceInput from "@/components/VoiceInput";
import { WaitDots } from "@/components/WaitText";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { meaningPracticeCopy } from "@/lib/meaning-practice-i18n";
import { FeedbackIndicator } from "./ComposeModalV2";

type Status = "perfect" | "almost" | "incorrect";
const MAX_ROUNDS = 2;

export function MeaningPractice({
  word,
  meaning,
  examples,
  paid,
  kids,
  onMoreExamples,
  onUpgrade,
}: {
  word: string;
  /** The meaning shown on the card (the kids text in Kids Mode). */
  meaning: string;
  /** Every example now on the card, so new ones never repeat them. */
  examples: string[];
  paid: boolean;
  kids: boolean;
  onMoreExamples: (more: string[]) => void;
  onUpgrade: () => void;
}) {
  const { lang, dir } = useLang();
  const { user } = useAuth();
  const copy = meaningPracticeCopy(lang);
  const [round, setRound] = useState(0);
  const [moreBusy, setMoreBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<{ status: Status; message: string; suggestion?: string } | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  if (!meaning) return null;

  async function loadMore() {
    if (!user || moreBusy || round >= MAX_ROUNDS) return;
    setMoreBusy(true);
    try {
      const res = await fetch("/api/more-examples", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ word, meaning, examples, uiLang: lang, kids, round: round + 1 }),
      });
      if (res.ok) {
        const j = (await res.json()) as { examples?: string[] };
        if (j.examples?.length) { onMoreExamples(j.examples); setRound((r) => r + 1); }
      }
    } catch { /* the link stays, the reader can tap again */ }
    setMoreBusy(false);
  }

  function toggleCompose() {
    if (!paid) { onUpgrade(); return; }
    setOpen((o) => !o);
    setTimeout(() => taRef.current?.focus(), 50);
  }

  async function check() {
    const s = draft.trim();
    if (!s) { setErr(v2(lang, "composeErrorEmpty")); return; }
    if (s.split(/\s+/).length < 3 && !/[぀-ヿ㐀-鿿฀-๿]/.test(s)) { setErr(v2(lang, "composeErrorTooShort")); return; }
    if (!user) { onUpgrade(); return; }
    setBusy(true); setErr(""); setResult(null);
    try {
      const res = await fetch("/api/check-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ word, meaning, sentence: s, uiLang: lang }),
      });
      if (res.status === 402) { onUpgrade(); return; }
      if (!res.ok) { setErr(v2(lang, "composeErrorEmpty")); return; }
      setResult(await res.json());
    } catch { setErr(v2(lang, "composeErrorEmpty")); }
    finally { setBusy(false); }
  }

  return (
    <div className="wb-mpractice" dir={dir}>
      <div className="wb-mpractice-links">
        {paid && round < MAX_ROUNDS && (
          <button type="button" className="wb-mlink" onClick={loadMore} disabled={moreBusy}>
            {moreBusy ? <WaitDots /> : <span aria-hidden="true">+</span>}
            <span>{copy.more}</span>
          </button>
        )}
        <button type="button" className={`wb-mlink${open ? " is-open" : ""}`} onClick={toggleCompose} aria-expanded={open}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 20h4l10-10-4-4L4 16z" /><path d="M14 6l4 4" />
          </svg>
          <span>{copy.compose}</span>
        </button>
      </div>

      {open && paid && (
        <div className="wb-mcompose">
          <button type="button" className="wb-mcompose-close" onClick={() => setOpen(false)} aria-label={v2(lang, "loginCloseAria")}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
          {/* The microphone sits INSIDE the field, at its end (left in RTL). */}
          <div className="wb-mcompose-field">
            <textarea
              ref={taRef}
              value={draft}
              dir={dir}
              rows={2}
              placeholder={copy.placeholder}
              onChange={(e) => { setDraft(e.target.value); setErr(""); }}
              disabled={busy}
            />
            <span className="wb-mcompose-mic">
              <VoiceInput
                uiLang={lang}
                enabled
                size="sm"
                getIdToken={async () => (user ? user.getIdToken() : null)}
                onResult={(t) => { setDraft((d) => (d.trim() ? `${d.trim()} ${t}` : t)); setErr(""); setResult(null); }}
              />
            </span>
          </div>
          <div className="wb-mcompose-actions">
            <button type="button" className="wb-mcompose-check" onClick={check} disabled={busy}>
              {busy ? v2(lang, "composeChecking") : v2(lang, "composeSubmit")}
            </button>
            {result && (
              <button type="button" className="wb-mlink" onClick={() => { setResult(null); setDraft(""); taRef.current?.focus(); }}>
                {v2(lang, "composeTryAnother")}
              </button>
            )}
          </div>
          {err && <p className="wb-mcompose-err">{err}</p>}
          {result && (
            <div className="wb-mcompose-result">
              <FeedbackIndicator status={result.status} message={result.message} />
              {result.suggestion && (
                <div className="wb-mcompose-suggest">
                  <span>{v2(lang, "composeSuggestionEyebrow")}</span>
                  <p>{result.suggestion}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

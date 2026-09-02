"use client";

/**
 * ReaderText — renders a whole passage as tappable words for the Reader
 * (/read), with two comprehension layers:
 *   - WORD level: tap any word for its meaning in context (WordPopover), which
 *     now also SPEAKS the word in the passage's own language (TTS).
 *   - SENTENCE level: a small "understand this sentence" control after each
 *     sentence opens a plain-language explanation in the reader's language
 *     (SentencePopover). Mental model: tap smaller = word, tap bigger = sentence.
 * Plus a GREEN CHECK on every word already opened, and reviewed state lifted to
 * the page for the progress bar. Gadi 2026-09-03.
 */

import { useMemo, useState } from "react";
import { useLang } from "@/lib/lang-context";
import { WordPopover } from "./WordPopover";
import { SentencePopover } from "./SentencePopover";
import { tokenizeWords, wordKey } from "@/lib/tokenize-words";

type Props = {
  text: string;
  /** Normalized keys (wordKey) of words already reviewed. */
  reviewed: Set<string>;
  /** Called with the raw word when its popover opens. */
  onReview: (word: string) => void;
};

/** Detect the passage's dominant script so TTS speaks each word in the text's
 *  OWN language (e.g. Hebrew for a Russian-UI reader), not the UI language.
 *  Script-based: exact for Hebrew/Arabic/Cyrillic/Greek/CJK/etc.; Latin scripts
 *  fall back to English (the common case), which Web Speech reads acceptably. */
function detectTextLang(text: string): string {
  const c: Record<string, number> = {};
  const bump = (k: string) => { c[k] = (c[k] ?? 0) + 1; };
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp >= 0x0590 && cp <= 0x05ff) bump("he");
    else if ((cp >= 0x0600 && cp <= 0x06ff) || (cp >= 0x0750 && cp <= 0x077f)) bump("ar");
    else if (cp >= 0x0400 && cp <= 0x04ff) bump("ru");
    else if (cp >= 0x0370 && cp <= 0x03ff) bump("el");
    else if (cp >= 0x0900 && cp <= 0x097f) bump("hi");
    else if (cp >= 0x0e00 && cp <= 0x0e7f) bump("th");
    else if ((cp >= 0x3040 && cp <= 0x309f) || (cp >= 0x30a0 && cp <= 0x30ff)) bump("ja");
    else if (cp >= 0xac00 && cp <= 0xd7a3) bump("ko");
    else if (cp >= 0x4e00 && cp <= 0x9fff) bump("zh-CN");
    else if ((cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a)) bump("en");
  }
  let best = "en", bestN = 0;
  for (const [k, n] of Object.entries(c)) if (n > bestN) { best = k; bestN = n; }
  return best;
}

const SENTENCE_END = /[.!?؟।。！？]/;

type Tok = ReturnType<typeof tokenizeWords>[number];
type Sentence = { toks: Array<{ tok: Tok; gi: number }>; words: number; text: string };

/** Group the flat token stream into sentences, preserving each token's global
 *  index (for the word-context window). A sentence closes on terminal
 *  punctuation or a line break; the trailing chunk flushes as a final one. */
function toSentences(tokens: Tok[]): Sentence[] {
  const out: Sentence[] = [];
  let cur: Array<{ tok: Tok; gi: number }> = [];
  let words = 0;
  const flush = () => {
    if (cur.length === 0) return;
    out.push({ toks: cur, words, text: cur.map((x) => x.tok.value).join("").trim() });
    cur = []; words = 0;
  };
  tokens.forEach((tok, gi) => {
    cur.push({ tok, gi });
    if (tok.type === "word") words += 1;
    else if (SENTENCE_END.test(tok.value) || tok.value.includes("\n")) flush();
  });
  flush();
  return out;
}

export function ReaderText({ text, reviewed, onReview }: Props) {
  const { lang } = useLang();
  const tokens = useMemo(() => tokenizeWords(text), [text]);
  const textLang = useMemo(() => detectTextLang(text), [text]);
  const sentences = useMemo(() => toSentences(tokens), [tokens]);

  const [popover, setPopover] = useState<{ word: string; anchor: HTMLElement; context: string } | null>(null);
  const [sentPop, setSentPop] = useState<{ sentence: string; anchor: HTMLElement } | null>(null);

  // The phrase around a tapped word, so the definition is the sense that fits
  // THIS passage (Gadit's promise), not the word's generic first meaning.
  function contextAround(i: number): string {
    return tokens.slice(Math.max(0, i - 25), i + 26).map((t) => t.value).join("").trim();
  }
  function openWord(word: string, i: number, anchor: HTMLElement) {
    onReview(word);
    setPopover({ word, anchor, context: contextAround(i) });
  }

  return (
    <>
      <div className="wb-reader-body">
        {sentences.map((s, si) => (
          <span key={si}>
            {s.toks.map(({ tok, gi }) => {
              if (tok.type === "other") return <span key={gi}>{tok.value}</span>;
              const done = reviewed.has(wordKey(tok.value));
              return (
                <span
                  key={gi}
                  className={"wb-tappable-word" + (done ? " wb-reader-done" : "")}
                  tabIndex={0}
                  role="button"
                  aria-haspopup="dialog"
                  onClick={(e) => { e.stopPropagation(); openWord(tok.value, gi, e.currentTarget); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openWord(tok.value, gi, e.currentTarget); }
                  }}
                >
                  {tok.value}
                </span>
              );
            })}
            {/* Sentence-level understanding: only for a real sentence (>= 4
                words), so single words / stray punctuation don't get a control. */}
            {s.words >= 4 && s.text && (
              <button
                type="button"
                className="wb-sentence-understand"
                aria-haspopup="dialog"
                aria-label="Understand this sentence"
                title="Understand this sentence"
                onClick={(e) => { e.stopPropagation(); setSentPop({ sentence: s.text, anchor: e.currentTarget }); }}
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 19, height: 19, marginInline: "3px 1px", verticalAlign: "middle",
                  padding: 0, border: "1px solid rgba(14,165,165,0.35)", borderRadius: "50%",
                  background: "rgba(14,165,165,0.10)", color: "var(--teal-deep,#0E7490)",
                  cursor: "pointer", opacity: 0.6, lineHeight: 0,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            )}
          </span>
        ))}
      </div>
      {popover && (
        <WordPopover
          word={popover.word}
          anchor={popover.anchor}
          lang={lang}
          context={popover.context}
          wordLang={textLang}
          fullInNewTab
          onClose={() => setPopover(null)}
        />
      )}
      {sentPop && (
        <SentencePopover
          sentence={sentPop.sentence}
          anchor={sentPop.anchor}
          lang={lang}
          onClose={() => setSentPop(null)}
        />
      )}
    </>
  );
}

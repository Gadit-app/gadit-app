"use client";

/**
 * ReaderText — renders a whole passage as tappable words for the Reader
 * (/read). Same word-splitting and WordPopover look-up as TappableText, plus:
 *   - a GREEN CHECK on every word the reader has already opened, so a kid can
 *     literally go word by word and watch the page fill in;
 *   - reviewed state is lifted to the page (for a progress bar + persistence),
 *     so this component just reads `reviewed` and reports `onReview`.
 * All occurrences of the same word share one reviewed state (learn the word
 * once, it's checked everywhere).
 */

import { useMemo, useState } from "react";
import { useLang } from "@/lib/lang-context";
import { WordPopover } from "./WordPopover";
import { tokenizeWords, wordKey } from "@/lib/tokenize-words";

type Props = {
  text: string;
  /** Normalized keys (wordKey) of words already reviewed. */
  reviewed: Set<string>;
  /** Called with the raw word when its popover opens. */
  onReview: (word: string) => void;
};

export function ReaderText({ text, reviewed, onReview }: Props) {
  const { lang } = useLang();
  const tokens = useMemo(() => tokenizeWords(text), [text]);
  const [popover, setPopover] = useState<{ word: string; anchor: HTMLElement; context: string } | null>(null);

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
        {tokens.map((tok, i) => {
          if (tok.type === "other") return <span key={i}>{tok.value}</span>;
          const done = reviewed.has(wordKey(tok.value));
          return (
            <span
              key={i}
              className={"wb-tappable-word" + (done ? " wb-reader-done" : "")}
              tabIndex={0}
              role="button"
              aria-haspopup="dialog"
              onClick={(e) => {
                e.stopPropagation();
                openWord(tok.value, i, e.currentTarget);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openWord(tok.value, i, e.currentTarget);
                }
              }}
            >
              {tok.value}
            </span>
          );
        })}
      </div>
      {popover && (
        <WordPopover
          word={popover.word}
          anchor={popover.anchor}
          lang={lang}
          context={popover.context}
          fullInNewTab
          onClose={() => setPopover(null)}
        />
      )}
    </>
  );
}

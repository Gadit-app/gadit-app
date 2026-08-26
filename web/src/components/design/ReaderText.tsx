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
  const [popover, setPopover] = useState<{ word: string; anchor: HTMLElement } | null>(null);

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
                onReview(tok.value);
                setPopover({ word: tok.value, anchor: e.currentTarget });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onReview(tok.value);
                  setPopover({ word: tok.value, anchor: e.currentTarget });
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
          onClose={() => setPopover(null)}
        />
      )}
    </>
  );
}

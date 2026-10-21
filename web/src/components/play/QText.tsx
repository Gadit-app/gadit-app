"use client";

/**
 * QText: the text of a game question with every word tappable (Gadi
 * 2026-10-11, a Gadit standard: a child who doesn't understand a word in
 * the question can't answer it). Tapping opens the quick definition in the
 * sense the question uses (the question is sent as context). Words that
 * would give the answer away stay plain: the answer itself, and its forms
 * with a Hebrew prefix letter or an English ending.
 */

import { useMemo, useState, type SyntheticEvent } from "react";
import { useLang } from "@/lib/lang-context";
import { WordPopover } from "@/components/design/WordPopover";
import { stripLookupDiacritics, tokenizeWords } from "@/lib/tokenize-words";

/** Keeps a click inside a word's popover (a portal) from reaching whatever
 *  holds the text, e.g. an answer option button. */
export const stopBubble = (e: SyntheticEvent) => e.stopPropagation();

const norm = (s: string) => stripLookupDiacritics(s).toLowerCase().normalize("NFC");

/** True when `tok` is the answer word or an obvious form of it. */
function givesAway(tok: string, skips: string[]): boolean {
  const t = norm(tok);
  return skips.some((s) => {
    if (!s) return false;
    if (t === s) return true;
    // English endings (garden -> gardens, gardening); Hebrew/Arabic prefix
    // letters (גינה -> בגינה, والحديقة).
    if (s.length >= 3 && t.startsWith(s) && t.length - s.length <= 3) return true;
    if (s.length >= 2 && t.endsWith(s) && t.length - s.length <= 2) return true;
    return false;
  });
}

export function QText({ text, skip = [], wordLang, context }: {
  text: string;
  /** The whole sentence, when `text` is only a piece of it (a blank splits it). */
  context?: string;
  /** Words that are the answer (or part of it): shown, never tappable. */
  skip?: string[];
  /** The language of the question text, so the speaker reads it right. */
  wordLang?: string;
}) {
  const { lang } = useLang();
  const tokens = useMemo(() => tokenizeWords(text), [text]);
  const skips = useMemo(() => skip.flatMap((s) => s.split(/\s+/)).map(norm).filter(Boolean), [skip]);
  const [open, setOpen] = useState<{ word: string; anchor: HTMLElement } | null>(null);

  return (
    <>
      {tokens.map((tok, i) =>
        tok.type === "other" || givesAway(tok.value, skips) ? (
          <span key={i}>{tok.value}</span>
        ) : (
          <span
            key={i}
            className="wb-tappable-word wb-q-word"
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            onClick={(e) => { e.stopPropagation(); setOpen({ word: tok.value, anchor: e.currentTarget }); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setOpen({ word: tok.value, anchor: e.currentTarget }); }
            }}
          >
            {tok.value}
          </span>
        ),
      )}
      {open && (
        // The popover and its full-definition sheet are portals, but React
        // still bubbles their events up THIS tree: without the stop, a tap on
        // the popover's close or speaker reached a parent option button and
        // selected the answer (2026-10-21).
        <span style={{ display: "contents" }} onClick={stopBubble} onPointerDown={stopBubble} onMouseDown={stopBubble}>
          <WordPopover
            word={open.word}
            anchor={open.anchor}
            lang={lang}
            context={context ?? text}
            wordLang={wordLang}
            fullInNewTab
            onClose={() => setOpen(null)}
          />
        </span>
      )}
    </>
  );
}

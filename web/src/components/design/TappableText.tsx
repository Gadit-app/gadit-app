"use client";

/**
 * TappableText — renders a string with every word individually tappable,
 * opening a WordPopover with a quick definition.
 *
 * Use this in place of plain text wherever you want users to be able to
 * 'look up' an unfamiliar word inside a longer paragraph — e.g. the
 * meaning line on a definition card, or the kids-explanation body.
 *
 * Visual: tappable words pick up a dotted underline on hover so the
 * affordance is discoverable without being noisy. Spaces and punctuation
 * stay as plain text so the surrounding paragraph still reads naturally.
 */

import { useMemo, useState } from "react";
import { useLang } from "@/lib/lang-context";
import { WordPopover } from "./WordPopover";
import { tokenizeWords } from "@/lib/tokenize-words";
import type { Lang } from "@/lib/i18n";

type Props = {
  /** The string to render. */
  text: string;
  /** The headword being defined on this card, we skip it from being
   *  tappable because tapping the same word that's already the entry
   *  would just navigate to where you already are. */
  skipWord?: string;
};

export function TappableText({ text, skipWord }: Props) {
  const { lang } = useLang();
  // Shared, script-aware, RTL-safe splitter. Keeps combining marks (Hebrew
  // niqqud, Arabic tashkeel) attached to their word so a vowelized word stays
  // one tappable token instead of fragmenting.
  const tokens = useMemo(() => tokenizeWords(text), [text]);
  const [popover, setPopover] = useState<{ word: string; anchor: HTMLElement } | null>(null);
  const skip = skipWord?.toLowerCase();

  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.type === "other") {
          return <span key={i}>{tok.value}</span>;
        }
        const isHeadword = skip && tok.value.toLowerCase() === skip;
        if (isHeadword) {
          // The headword itself stays plain. Tapping the same word that's
          // already being defined would feel circular.
          return <span key={i}>{tok.value}</span>;
        }
        return (
          <TappableWord
            key={i}
            word={tok.value}
            lang={lang}
            onOpen={(anchor) => setPopover({ word: tok.value, anchor })}
          />
        );
      })}
      {popover && (
        <WordPopover
          word={popover.word}
          anchor={popover.anchor}
          lang={lang}
          fromWord={skipWord}
          onClose={() => setPopover(null)}
        />
      )}
    </>
  );
}

function TappableWord({
  word,
  lang,
  onOpen,
}: {
  word: string;
  lang: Lang;
  onOpen: (anchor: HTMLElement) => void;
}) {
  void lang;
  return (
    <span
      className="wb-tappable-word"
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      // Click on desktop = open. Tap on touch also produces a click,
      // so this single handler covers both inputs. (The earlier
      // long-press-only path was unintuitive — users hovered, saw the
      // underline affordance, clicked, and nothing happened.)
      onClick={(e) => {
        e.stopPropagation();
        onOpen(e.currentTarget);
      }}
      onContextMenu={(e) => {
        // Right-click also opens the popover, suppressing the native
        // browser context menu so 'look up word' replaces it cleanly.
        e.preventDefault();
        onOpen(e.currentTarget);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(e.currentTarget);
        }
      }}
    >
      {word}
    </span>
  );
}

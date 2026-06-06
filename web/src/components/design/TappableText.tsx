"use client";

/**
 * TappableText — renders a string with every word individually long-
 * pressable, opening a WordPopover with a quick definition.
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
import { useLongPress } from "@/lib/use-long-press";
import { WordPopover } from "./WordPopover";
import type { Lang } from "@/lib/i18n";

type Props = {
  /** The string to render. */
  text: string;
  /** The headword being defined on this card — we skip it from being
   *  tappable because tapping the same word that's already the entry
   *  would just navigate to where you already are. */
  skipWord?: string;
};

type Token =
  | { type: "word"; value: string }
  | { type: "other"; value: string };

/**
 * Split a string into word vs non-word tokens.
 *
 * \p{L} = any letter from any script (Latin, Hebrew, Arabic, Cyrillic, …).
 * \p{N} = any number.
 *
 * Anything else (whitespace, punctuation, dashes, parentheses) goes into
 * 'other' tokens so they render as plain text but preserve their layout
 * role (spaces stay spaces, line-breaks within text are kept by CSS).
 *
 * One-character runs and pure-digit runs are demoted to 'other' so we
 * don't make every 'a', '1' or 'I' tappable.
 */
function tokenize(text: string): Token[] {
  const out: Token[] = [];
  const re = /([\p{L}][\p{L}\p{N}'’\-]*)|([\s]+)|([^\p{L}\p{N}\s]+)/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const word = m[1];
    if (word) {
      // Skip single-character "words" (Hebrew prefix letters like ה ,ו
      // a, I, etc.) — looking them up is mostly noise.
      if (word.length >= 2) {
        out.push({ type: "word", value: word });
      } else {
        out.push({ type: "other", value: word });
      }
      continue;
    }
    out.push({ type: "other", value: m[2] ?? m[3] ?? "" });
  }
  return out;
}

export function TappableText({ text, skipWord }: Props) {
  const { lang } = useLang();
  const tokens = useMemo(() => tokenize(text), [text]);
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
  const handlers = useLongPress<HTMLSpanElement>((anchor) => onOpen(anchor));
  return (
    <span
      {...handlers}
      className="wb-tappable-word"
      tabIndex={0}
      role="button"
      // The aria-haspopup hint lets screen readers tell the user this
      // word is interactive (not just text).
      aria-haspopup="dialog"
      onKeyDown={(e) => {
        // Keyboard parity: Shift+Enter on a focused word opens the popover.
        if (e.key === "Enter" && e.shiftKey) {
          e.preventDefault();
          onOpen(e.currentTarget);
        }
      }}
    >
      {word}
    </span>
  );
}

"use client";

import { QText } from "../QText";
import { caseOpt } from "@/lib/play-engine";

/**
 * A duel question, its words tappable (Gadi 2026-10-11, the games
 * standard). A one-word prompt is the word being asked, so it stays plain;
 * in a two-line prompt (word, then a meaning) the first line stays plain.
 * The options' words never open, so a tap can't hand over the answer.
 */
export function DuelPrompt({ prompt, options }: { prompt: string; options: string[] }) {
  const cls = `duel-prompt${prompt.length > 40 ? " is-long" : ""}`;
  if (!/\s/.test(prompt.trim())) return <div className={cls} dir="auto">{prompt}</div>;
  const nl = prompt.indexOf("\n");
  const head = nl >= 0 ? prompt.slice(0, nl + 1) : "";
  const body = nl >= 0 ? prompt.slice(nl + 1) : prompt;
  return (
    <div className={cls} dir="auto">
      {head}
      <QText text={body} skip={options} context={prompt} />
    </div>
  );
}

/** The options of a duel question, in one casing. */
export const duelOpt = (o: string) => caseOpt(o);

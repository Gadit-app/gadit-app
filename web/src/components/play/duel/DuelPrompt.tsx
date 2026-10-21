"use client";

import { QText } from "../QText";
import { caseOpt } from "@/lib/play-engine";

/**
 * A duel question, its words tappable (Gadi 2026-10-11, the games
 * standard). A one-word prompt is the word being asked, so it stays plain;
 * in a two-line prompt (word, then a meaning) the first line stays plain.
 * The options' words never open, so a tap can't hand over the answer.
 * Once the answer is shown (`revealed`) every word opens.
 */
export function DuelPrompt({ prompt, options, revealed = false }: { prompt: string; options: string[]; revealed?: boolean }) {
  const cls = `duel-prompt${prompt.length > 40 ? " is-long" : ""}`;
  if (!/\s/.test(prompt.trim())) return <div className={cls} dir="auto">{revealed ? <QText text={prompt} /> : prompt}</div>;
  const nl = prompt.indexOf("\n");
  const head = nl >= 0 ? prompt.slice(0, nl + 1) : "";
  const body = nl >= 0 ? prompt.slice(nl + 1) : prompt;
  return (
    <div className={cls} dir="auto">
      {revealed && head ? <QText text={head} context={prompt} /> : head}
      <QText text={body} skip={revealed ? [] : options} context={prompt} />
    </div>
  );
}

/**
 * One option's text. A one-word prompt is a word, so its options are
 * meanings: their words open (the asked word stays plain). A meaning
 * prompt has words as options: they open only once the answer is shown,
 * since a tapped word would give its meaning away.
 */
export function DuelOptText({ prompt, option, revealed = false }: { prompt: string; option: string; revealed?: boolean }) {
  const text = duelOpt(option);
  const wordPrompt = !/\s/.test(prompt.trim());
  if (!revealed && !wordPrompt) return <>{text}</>;
  return <QText text={text} skip={revealed ? [] : [prompt.trim()]} />;
}

/** The options of a duel question, in one casing. */
export const duelOpt = (o: string) => caseOpt(o);

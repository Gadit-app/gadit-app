"use client";

/**
 * "Build a sentence" (Gadi 2026-10-11, from Ziv's English workbook: "my
 * grandmother / is / She"). The words of a sentence from the child's own
 * workbook come shuffled; tapping puts them in order. One try per sentence,
 * then the right sentence is shown and read aloud.
 *
 * The full stop (or ? / !) is not on a tile, it gave the last word away: it
 * waits at the end of the line. A lesson may list other right word orders
 * (`alt`), since Hebrew allows several (2026-11-12).
 */
import { useMemo, useState } from "react";
import { sfx } from "@/lib/game-sfx";
import { useNiqqud } from "@/lib/niqqud-display";
import { shuffle } from "@/lib/play-engine";
import { PlayHeader, type PlayT } from "../GameQuiz";
import { GameResult } from "../GameResult";
import { TTSButton } from "@/components/design/TTSButton";
import { lessonCopy } from "./lesson-i18n";
import { QText } from "@/components/play/QText";

type Round = { sentence: string; end: string; tiles: Array<{ id: number; w: string }> };

/** One spacing for comparing a built sentence with the written ones. */
const norm = (s: string) => s.trim().split(/\s+/).join(" ");

function makeRounds(sentences: string[]): Round[] {
  // One sentence per round: a workbook line with two sentences is split,
  // and very short or very long ones are left out.
  const single = [...new Set(sentences.flatMap((x) => x.split(/(?<=[.!?])\s+/)))]
    .map((x) => x.trim())
    .filter((x) => { const n = x.split(/\s+/).length; return n >= 3 && n <= 8; });
  return shuffle(single.length >= 4 ? single : sentences).slice(0, 8).map((sentence) => {
    // The closing punctuation leaves the last tile and is shown on its own.
    const end = sentence.match(/[.!?…]+$/)?.[0] ?? "";
    const words = sentence.slice(0, sentence.length - end.length).split(/\s+/).filter(Boolean);
    const tiles = words.map((w, id) => ({ id, w }));
    let mixed = shuffle(tiles);
    for (let k = 0; k < 5 && mixed.every((t, i) => t.id === i); k++) mixed = shuffle(tiles);
    return { sentence, end, tiles: mixed };
  });
}

export function GameSentenceBuilder({ sentences, alt, onExit, lang, t, audioLang }: {
  sentences: string[];
  /** Other word orders that are also right, as whole sentences. */
  alt?: string[];
  onExit: () => void;
  lang: string;
  t: PlayT;
  /** The language of the sentences, for the read-aloud. */
  audioLang: string;
}) {
  const c = lessonCopy(lang);
  const { nq } = useNiqqud();
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => makeRounds(sentences), [sentences, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const [idx, setIdx] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<"right" | "wrong" | null>(null);
  const accepted = useMemo(() => new Set((alt ?? []).map(norm)), [alt]);
  // What the child built, when it was right in another order than the workbook's.
  const [builtRight, setBuiltRight] = useState<string | null>(null);
  // Hebrew is built right to left (Gadi's son, 2026-10-17: the sentence came out reversed).
  const textDir = audioLang.startsWith("he") ? "rtl" : "ltr";
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);

  if (idx >= rounds.length) {
    return (
      <GameResult
        data={{ title: c.buildTitle, score, total: rounds.length, missed: missed.map((m) => ({ word: m, meaning: "" })) }}
        onExit={onExit}
        onReplay={() => { setSeed((x) => x + 1); setIdx(0); setPlaced([]); setVerdict(null); setBuiltRight(null); setScore(0); setMissed([]); }}
        lang={lang}
        t={t}
      />
    );
  }

  const r = rounds[idx];
  const byId = new Map(r.tiles.map((x) => [x.id, x.w]));
  const tap = (id: number) => {
    if (verdict) return;
    const next = [...placed, id];
    sfx.letter(placed.length);
    setPlaced(next);
    if (next.length === r.tiles.length) {
      const built = next.map((i) => byId.get(i)).join(" ") + r.end;
      const ok = built === norm(r.sentence) || accepted.has(built);
      setVerdict(ok ? "right" : "wrong");
      setBuiltRight(ok ? built : null);
      setTimeout(() => (ok ? sfx.correct() : sfx.wrong()), 200);
      if (ok) setScore((s) => s + 1);
      else setMissed((m) => [...m, r.sentence]);
    }
  };
  const unplace = (pos: number) => {
    if (verdict) return;
    setPlaced(placed.filter((_, i) => i !== pos));
  };
  const next = () => { setIdx((i) => i + 1); setPlaced([]); setVerdict(null); setBuiltRight(null); };
  const shown = builtRight ?? r.sentence;

  return (
    <div className="wb-play-stage">
      <style>{SB_CSS}</style>
      <PlayHeader title={c.buildTitle} progress={`${idx + 1}/${rounds.length}`} score={score} onExit={onExit} t={t} />
      <div className="wb-play-question">
        <div className="wb-play-question-eyebrow">{c.buildPrompt}</div>
        <div className={`wb-sb-line${verdict ? ` is-${verdict}` : ""}`} dir={textDir} lang={audioLang}>
          {placed.length === 0 && <span className="wb-sb-hint">…</span>}
          {placed.map((id, pos) => (
            <button key={id} type="button" className={`wb-sb-tile is-placed${verdict ? ` is-${verdict}` : ""}`} onClick={() => unplace(pos)} disabled={!!verdict}>{nq(byId.get(id) ?? "")}</button>
          ))}
          {r.end && <span className="wb-sb-end" aria-hidden="true">{r.end}</span>}
        </div>
      </div>
      {!verdict && (
        <div className="wb-sb-pool" dir={textDir} lang={audioLang}>
          {r.tiles.filter((x) => !placed.includes(x.id)).map((x) => (
            <button key={x.id} type="button" className="wb-sb-tile" onClick={() => tap(x.id)}>{nq(x.w)}</button>
          ))}
        </div>
      )}
      {verdict && (
        <div className="wb-sb-reveal">
          <div className={verdict === "right" ? "wb-sb-right" : "wb-sb-wrong"}>{verdict === "right" ? c.buildRight : c.buildWrong}</div>
          <div className="wb-sb-answer" dir={textDir} lang={audioLang}>
            <span><QText text={nq(shown)} wordLang={audioLang} /></span>
            <TTSButton text={shown} audioLang={audioLang} useOpenAI ariaLabel={shown} className="wb-word-act-icon wb-play-speak" />
          </div>
          <button type="button" className="wb-play-next" onClick={next}>{c.nextBtn}</button>
        </div>
      )}
    </div>
  );
}

const SB_CSS = `
.wb-sb-line { min-height: 64px; margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; padding: 10px; border-radius: 14px; border: 2px dashed var(--wb-border, #D1D5DB); }
.wb-sb-line.is-right { border-style: solid; border-color: #10B981; }
.wb-sb-line.is-wrong { border-style: solid; border-color: #F43F5E; }
.wb-sb-hint { color: var(--wb-ink-soft, #6B7280); font-size: 20px; }
.wb-sb-end { font-size: 24px; font-weight: 800; color: var(--wb-ink, #0f172a); }
.wb-sb-pool { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 18px; }
.wb-sb-tile { font: inherit; font-size: 19px; font-weight: 700; min-height: 48px; padding: 0 16px; border-radius: 12px; border: 1px solid var(--wb-border, #D1D5DB); background: var(--surface, #fff); color: var(--wb-ink, #0f172a); cursor: pointer; box-shadow: 0 2px 0 rgba(15,23,42,0.08); }
/* Placed tiles: a calm blue that no kid skin turns pink (pink and red read as a mistake); green when right, red when wrong. */
.wb-sb-tile.is-placed { background: #EFF6FF; border-color: #60A5FA; color: #0f172a; }
.wb-sb-tile.is-placed.is-right { background: #D1FAE5; border-color: #10B981; color: #065F46; }
.wb-sb-tile.is-placed.is-wrong { background: #FFE4E6; border-color: #F43F5E; color: #9F1239; }
.wb-sb-tile:disabled { cursor: default; }
.wb-sb-reveal { display: grid; justify-items: center; gap: 10px; margin-top: 18px; text-align: center; }
.wb-sb-right { font-weight: 800; font-size: 18px; color: #047857; }
.wb-sb-wrong { font-weight: 800; font-size: 16px; color: #BE123C; }
html[data-theme="dark"] .wb-sb-right, html:is([data-theme="space"],[data-theme="ocean"],[data-theme="jungle"],[data-theme="neon"],[data-theme="sunset"],[data-theme="aurora"],[data-theme="cosmos"],[data-theme="lava"],[data-theme="royal"]) .wb-kid-area .wb-sb-right { color: #6EE7B7; }
html[data-theme="dark"] .wb-sb-wrong, html:is([data-theme="space"],[data-theme="ocean"],[data-theme="jungle"],[data-theme="neon"],[data-theme="sunset"],[data-theme="aurora"],[data-theme="cosmos"],[data-theme="lava"],[data-theme="royal"]) .wb-kid-area .wb-sb-wrong { color: #FDA4AF; }
.wb-sb-answer { font-size: 20px; font-weight: 700; color: var(--wb-ink, #0f172a); display: inline-flex; align-items: center; gap: 8px; }
`;

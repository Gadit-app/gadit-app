"use client";

/**
 * Flash cards (Gadi 2026-10-09, asked for by a subscriber's daughters).
 * Two games on one card mechanic:
 *
 *  - mode "words" (כרטיסיות מילים): the front shows a word, you say it in
 *    the other language (English for a Hebrew word, Hebrew for an English
 *    one), then flip to check. A swap button turns the direction around.
 *    Pairs come from /api/play/pairs (the define cache's translation first,
 *    so nearly always free).
 *  - mode "meanings" (כרטיסיות הגדרות): the front shows a word, the back its
 *    meaning and an example.
 *
 * After the flip: "ידעתי" or "עוד לא". A card you didn't know comes back
 * once at the end of the deck. Score = cards known the first time.
 * `focusWord` (the notebook's "practice this word") puts that word first.
 */

import { useEffect, useMemo, useState } from "react";
import type { PlayWord } from "@/lib/play-engine";
import { shuffle, SESSION_SIZE } from "@/lib/play-engine";
import { GameResult } from "./GameResult";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { useNiqqud } from "@/lib/niqqud-display";
import { useAuth } from "@/lib/auth-context";

export type FlashMode = "words" | "meanings";

type FlashCopy = {
  wordsTitle: string; wordsDesc: string; defsTitle: string; defsDesc: string;
  tapToFlip: string; tapBack: string; sayIn: (l: string) => string; knew: string; notYet: string; again: string;
  swap: string; loading: string; none: string; result: (k: number, n: number) => string;
};

export const FLASH_COPY: Record<string, FlashCopy> = {
  he: { wordsTitle: "כרטיסיות מילים", wordsDesc: "רואים מילה, אומרים אותה בשפה השנייה, והופכים את הכרטיס לבדוק.", defsTitle: "כרטיסיות הגדרות", defsDesc: "רואים מילה, נזכרים מה היא אומרת, והופכים את הכרטיס לבדוק.", tapToFlip: "לחצו על הכרטיס כדי להפוך אותו", tapBack: "לחצו כדי לחזור למילה", sayIn: (l) => `איך אומרים את זה ב${l}?`, knew: "ידעתי", notYet: "עוד לא", again: "שוב", swap: "להחליף כיוון", loading: "מכינים את הכרטיסים...", none: "עוד אין מילים לכרטיסים. חפשו מילה באנגלית או בעברית, והיא תופיע כאן.", result: (k, n) => `ידעתם ${k} מתוך ${n} כבר בפעם הראשונה` },
  en: { wordsTitle: "Word cards", wordsDesc: "See a word, say it in the other language, then flip the card to check.", defsTitle: "Definition cards", defsDesc: "See a word, recall what it means, then flip the card to check.", tapToFlip: "Tap the card to flip it", tapBack: "Tap to go back to the word", sayIn: (l) => `How do you say it in ${l}?`, knew: "I knew it", notYet: "Not yet", again: "Again", swap: "Swap direction", loading: "Getting your cards ready...", none: "No words for cards yet. Look up a word in another language and it will show up here.", result: (k, n) => `You knew ${k} of ${n} the first time` },
  ar: { wordsTitle: "بطاقات الكلمات", wordsDesc: "ترى كلمة، تقولها باللغة الأخرى، ثم تقلب البطاقة لتتحقق.", defsTitle: "بطاقات التعريفات", defsDesc: "ترى كلمة، تتذكّر معناها، ثم تقلب البطاقة لتتحقق.", tapToFlip: "اضغط على البطاقة لقلبها", tapBack: "اضغط للعودة إلى الكلمة", sayIn: (l) => `كيف تقولها بـ${l}؟`, knew: "عرفتها", notYet: "ليس بعد", again: "مرة أخرى", swap: "عكس الاتجاه", loading: "نجهّز البطاقات...", none: "لا توجد كلمات للبطاقات بعد. ابحث عن كلمة بلغة أخرى وستظهر هنا.", result: (k, n) => `عرفت ${k} من ${n} من المرة الأولى` },
  ru: { wordsTitle: "Карточки слов", wordsDesc: "Видите слово, говорите его на другом языке и переворачиваете карточку.", defsTitle: "Карточки значений", defsDesc: "Видите слово, вспоминаете значение и переворачиваете карточку.", tapToFlip: "Нажмите на карточку, чтобы перевернуть", tapBack: "Нажмите, чтобы вернуться к слову", sayIn: (l) => `Как это сказать (${l})?`, knew: "Знал(а)", notYet: "Ещё нет", again: "Ещё раз", swap: "Поменять направление", loading: "Готовим карточки...", none: "Пока нет слов для карточек. Найдите слово на другом языке, и оно появится здесь.", result: (k, n) => `Вы знали ${k} из ${n} с первого раза` },
  es: { wordsTitle: "Tarjetas de palabras", wordsDesc: "Ves una palabra, la dices en el otro idioma y das la vuelta para comprobar.", defsTitle: "Tarjetas de definiciones", defsDesc: "Ves una palabra, recuerdas su significado y das la vuelta para comprobar.", tapToFlip: "Toca la tarjeta para darle la vuelta", tapBack: "Toca para volver a la palabra", sayIn: (l) => `¿Cómo se dice en ${l}?`, knew: "La sabía", notYet: "Todavía no", again: "Otra vez", swap: "Cambiar dirección", loading: "Preparando tus tarjetas...", none: "Aún no hay palabras para tarjetas. Busca una palabra en otro idioma y aparecerá aquí.", result: (k, n) => `Sabías ${k} de ${n} a la primera` },
};

export function flashCopy(lang: string): FlashCopy {
  return FLASH_COPY[lang] ?? FLASH_COPY.en;
}

const LANG_CODE: Record<string, string> = {
  Hebrew: "he", English: "en", Arabic: "ar", Russian: "ru", Spanish: "es", Portuguese: "pt", French: "fr", German: "de",
  Italian: "it", Ukrainian: "uk", Turkish: "tr", Polish: "pl", Persian: "fa", Amharic: "am", Hindi: "hi", Japanese: "ja",
  Czech: "cs", Slovak: "sk", Dutch: "nl", Greek: "el", Korean: "ko", Thai: "th", Vietnamese: "vi", Indonesian: "id",
};

function langLabel(name: string, ui: string): string {
  const code = LANG_CODE[name];
  if (!code) return name;
  try {
    return new Intl.DisplayNames([ui], { type: "language" }).of(code) ?? name;
  } catch {
    return name;
  }
}

type Card = { key: string; word: PlayWord; pair?: { pair: string; pairLang: string }; repeat: boolean };

export function GameFlashcards({
  pool,
  onExit,
  lang,
  t,
  focusWord,
  mode = "words",
}: {
  pool: PlayWord[];
  onExit: () => void;
  lang: string;
  t: PlayT;
  focusWord?: string;
  mode?: FlashMode;
}) {
  const f = flashCopy(lang);
  const title = mode === "words" ? f.wordsTitle : f.defsTitle;
  const { nq } = useNiqqud(); // display-only vowel points
  const { user } = useAuth();
  // Freeze the words at mount: the page tops the pool up with examples a
  // moment later, and that must not reshuffle a deck mid-game.
  const [startPool] = useState(pool);

  // The candidate words: unique, with a meaning, the focus word first.
  const candidates = useMemo<PlayWord[]>(() => {
    const seen = new Set<string>();
    const usable = startPool.filter((w) => {
      const k = w.word.trim().toLowerCase();
      if (!w.meaning || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    const focus = focusWord ? usable.find((w) => w.word.trim().toLowerCase() === focusWord.trim().toLowerCase()) : undefined;
    const rest = shuffle(usable.filter((w) => w !== focus));
    return (focus ? [focus, ...rest] : rest).slice(0, mode === "words" ? 20 : SESSION_SIZE.flashcards);
  }, [startPool, focusWord, mode]);

  // Word cards need the other-language word for each card.
  const [pairs, setPairs] = useState<Record<string, { pair: string; pairLang: string }> | null>(mode === "words" ? null : {});
  useEffect(() => {
    if (mode !== "words") return;
    let cancelled = false;
    (async () => {
      try {
        const token = user ? await user.getIdToken() : "";
        const res = await fetch("/api/play/pairs", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ uiLang: lang, items: candidates.map((w) => ({ word: w.word, language: w.language })) }),
        });
        const data = res.ok ? ((await res.json()) as { pairs?: Record<string, { pair: string; pairLang: string }> }) : {};
        if (!cancelled) setPairs(data.pairs ?? {});
      } catch {
        if (!cancelled) setPairs({});
      }
    })();
    return () => { cancelled = true; };
  }, [mode, candidates, lang, user]);

  const first = useMemo<Card[]>(() => {
    if (!pairs) return [];
    const list = mode === "words" ? candidates.filter((w) => pairs[w.word]?.pair) : candidates;
    return list.slice(0, SESSION_SIZE.flashcards).map((w, i) => ({ key: `c${i}`, word: w, pair: pairs[w.word], repeat: false }));
  }, [pairs, candidates, mode]);

  const [deck, setDeck] = useState<Card[] | null>(null);
  useEffect(() => { if (pairs) setDeck(first); }, [first, pairs]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [known, setKnown] = useState(0);
  const [missed, setMissed] = useState<Card[]>([]);

  if (!deck) {
    return (
      <div className="wb-play-stage">
        <PlayHeader title={title} progress="" score={0} onExit={onExit} t={t} />
        <div className="wb-play-question"><div className="wb-play-question-eyebrow">{f.loading}</div></div>
      </div>
    );
  }

  const total = first.length;
  if (total === 0) {
    return (
      <div className="wb-play-stage">
        <PlayHeader title={title} progress="" score={0} onExit={onExit} t={t} />
        <div className="wb-play-question"><div className="wb-play-question-eyebrow">{f.none}</div></div>
      </div>
    );
  }

  const card = deck[i];
  if (!card) {
    return (
      <GameResult
        data={{
          title,
          score: known,
          total,
          headline: f.result(known, total),
          missed: missed.map((c) => ({ word: c.word.word, meaning: mode === "words" && c.pair ? c.pair.pair : c.word.meaning })),
        }}
        onExit={onExit}
        onReplay={() => location.reload()}
        lang={lang}
        t={t}
      />
    );
  }

  function answer(knew: boolean) {
    if (!card || !deck) return;
    if (!card.repeat) {
      if (knew) setKnown((k) => k + 1);
      else setMissed((m) => [...m, card]);
    }
    // A card you didn't know comes back once at the end of the deck.
    if (!knew && !card.repeat) setDeck([...deck, { ...card, key: `${card.key}r`, repeat: true }]);
    setFlipped(false);
    setI((x) => x + 1);
  }

  // Front / back text for the current card.
  const wordLangName = card.word.language;
  const pair = card.pair;
  const frontText = mode === "words" && pair && reverse ? pair.pair : card.word.word;
  const backText = mode === "words" && pair ? (reverse ? card.word.word : pair.pair) : card.word.meaning;
  const askLang = mode === "words" && pair ? langLabel(reverse ? wordLangName : pair.pairLang, lang) : "";
  const example = mode === "meanings" ? card.word.examples?.[0] : undefined;

  return (
    <div className="wb-play-stage">
      <style>{FLASH_CSS}</style>
      <PlayHeader title={title} progress={`${Math.min(i + 1, deck.length)}/${deck.length}`} score={known} onExit={onExit} t={t} />
      <div className="wb-play-question">
        <div className="wb-play-question-eyebrow">{flipped ? f.tapBack : mode === "words" && askLang ? f.sayIn(askLang) : f.tapToFlip}</div>
        {mode === "words" && !flipped && (
          <button type="button" className="wb-flash-swap" onClick={() => setReverse((r) => !r)}>{f.swap}</button>
        )}
      </div>
      <button
        type="button"
        className={`wb-flash-card${flipped ? " is-flipped" : ""}`}
        onClick={() => setFlipped((x) => !x)}
        aria-pressed={flipped}
      >
        <span className="wb-flash-inner">
          <span className="wb-flash-face wb-flash-front" aria-hidden={flipped}>
            {card.repeat && <span className="wb-flash-again">{f.again}</span>}
            <span className="wb-flash-word" dir="auto">{nq(frontText)}</span>
          </span>
          <span className="wb-flash-face wb-flash-back" aria-hidden={!flipped}>
            <span className="wb-flash-backword" dir="auto">{nq(frontText)}</span>
            <span className={mode === "words" ? "wb-flash-word" : "wb-flash-meaning"} dir="auto">{nq(backText)}</span>
            {example && <span className="wb-flash-example" dir="auto">{nq(example)}</span>}
          </span>
        </span>
      </button>
      {flipped && (
        <div className="wb-flash-actions">
          <button type="button" className="wb-flash-btn wb-flash-no" onClick={() => answer(false)}>{f.notYet}</button>
          <button type="button" className="wb-flash-btn wb-flash-yes" onClick={() => answer(true)}>{f.knew}</button>
        </div>
      )}
    </div>
  );
}

const FLASH_CSS = `
.wb-flash-card { display: block; width: min(100%, 440px); margin: 18px auto 0; aspect-ratio: 4 / 3; padding: 0; border: 0; background: none; cursor: pointer; perspective: 1200px; font: inherit; }
.wb-flash-inner { position: relative; display: block; width: 100%; height: 100%; transition: transform 420ms cubic-bezier(.2,.7,.2,1); transform-style: preserve-3d; }
.wb-flash-card.is-flipped .wb-flash-inner { transform: rotateY(180deg); }
.wb-flash-face { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 24px; border-radius: 24px; backface-visibility: hidden; -webkit-backface-visibility: hidden; box-shadow: 0 18px 40px -18px rgba(16,40,60,0.35), 0 0 0 1px rgba(15,72,68,0.08); text-align: center; overflow: auto; }
.wb-flash-front { background: linear-gradient(160deg, #E8F6F6 0%, #FFFFFF 70%); }
.wb-flash-back { background: linear-gradient(160deg, #F5F1FF 0%, #FFFFFF 70%); transform: rotateY(180deg); }
.wb-flash-word { font-size: clamp(30px, 8vw, 46px); font-weight: 800; color: #0f172a; line-height: 1.15; word-break: break-word; }
.wb-flash-backword { font-size: 16px; font-weight: 700; color: #6D28D9; }
.wb-flash-meaning { font-size: clamp(17px, 4.4vw, 21px); font-weight: 600; color: #1f2937; line-height: 1.55; }
.wb-flash-example { font-size: 15px; color: #6b7280; line-height: 1.5; font-style: italic; }
.wb-flash-again { position: absolute; top: 14px; inset-inline-start: 14px; font-size: 12px; font-weight: 700; color: #b45309; background: #FEF3C7; border-radius: 999px; padding: 3px 10px; }
.wb-flash-swap { display: inline-block; margin-top: 10px; font: inherit; font-size: 13px; font-weight: 700; color: #0b7d7d; background: rgba(14,165,165,0.10); border: 0; border-radius: 999px; padding: 6px 14px; cursor: pointer; }
.wb-flash-actions { display: flex; gap: 12px; justify-content: center; margin-top: 18px; }
.wb-flash-btn { min-width: 130px; padding: 12px 20px; border-radius: 999px; font: inherit; font-size: 16px; font-weight: 700; cursor: pointer; border: 0; }
.wb-flash-yes { background: #0EA5A5; color: #fff; box-shadow: 0 10px 22px -10px rgba(14,165,165,0.6); }
.wb-flash-no { background: #fff; color: #374151; box-shadow: 0 0 0 1.5px #D1D5DB inset; }
@media (prefers-reduced-motion: reduce) { .wb-flash-inner { transition: none; } }
`;

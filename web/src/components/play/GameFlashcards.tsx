"use client";

/**
 * GameFlashcards (Gadi 2026-10-09, asked for by a subscriber's daughters):
 * the classic flash card. The front shows a word; tap to flip and see its
 * meaning and an example. Then "ידעתי" (knew it) or "עוד לא" (not yet):
 * a card you didn't know goes back to the end of the deck once, so you meet
 * it again before the round ends. Score = cards known the first time.
 *
 * `focusWord` (from the notebook's "practice this word") puts that word on
 * the first card.
 */

import { useMemo, useState } from "react";
import type { PlayWord } from "@/lib/play-engine";
import { shuffle, SESSION_SIZE } from "@/lib/play-engine";
import { GameResult } from "./GameResult";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { useNiqqud } from "@/lib/niqqud-display";

type FlashCopy = { title: string; desc: string; tapToFlip: string; tapBack: string; knew: string; notYet: string; again: string; result: (k: number, n: number) => string };

export const FLASH_COPY: Record<string, FlashCopy> = {
  he: { title: "כרטיסיות", desc: "רואים מילה, נזכרים במשמעות, והופכים את הכרטיס לבדוק.", tapToFlip: "לחצו על הכרטיס כדי להפוך אותו", tapBack: "לחצו כדי לחזור למילה", knew: "ידעתי", notYet: "עוד לא", again: "שוב", result: (k, n) => `ידעתם ${k} מתוך ${n} כבר בפעם הראשונה` },
  en: { title: "Flash cards", desc: "See a word, recall its meaning, then flip the card to check.", tapToFlip: "Tap the card to flip it", tapBack: "Tap to go back to the word", knew: "I knew it", notYet: "Not yet", again: "Again", result: (k, n) => `You knew ${k} of ${n} the first time` },
  ar: { title: "بطاقات", desc: "ترى كلمة، تتذكّر معناها، ثم تقلب البطاقة لتتحقق.", tapToFlip: "اضغط على البطاقة لقلبها", tapBack: "اضغط للعودة إلى الكلمة", knew: "عرفتها", notYet: "ليس بعد", again: "مرة أخرى", result: (k, n) => `عرفت ${k} من ${n} من المرة الأولى` },
  ru: { title: "Карточки", desc: "Видите слово, вспоминаете значение и переворачиваете карточку, чтобы проверить.", tapToFlip: "Нажмите на карточку, чтобы перевернуть", tapBack: "Нажмите, чтобы вернуться к слову", knew: "Знал(а)", notYet: "Ещё нет", again: "Ещё раз", result: (k, n) => `Вы знали ${k} из ${n} с первого раза` },
  es: { title: "Tarjetas", desc: "Ves una palabra, recuerdas su significado y das la vuelta a la tarjeta para comprobarlo.", tapToFlip: "Toca la tarjeta para darle la vuelta", tapBack: "Toca para volver a la palabra", knew: "La sabía", notYet: "Todavía no", again: "Otra vez", result: (k, n) => `Sabías ${k} de ${n} a la primera` },
  pt: { title: "Cartões", desc: "Vê uma palavra, lembra o significado e vira o cartão para conferir.", tapToFlip: "Toque no cartão para virá-lo", tapBack: "Toque para voltar à palavra", knew: "Eu sabia", notYet: "Ainda não", again: "De novo", result: (k, n) => `Você sabia ${k} de ${n} na primeira vez` },
  fr: { title: "Cartes mémoire", desc: "Voyez un mot, rappelez-vous son sens, puis retournez la carte pour vérifier.", tapToFlip: "Touchez la carte pour la retourner", tapBack: "Touchez pour revenir au mot", knew: "Je savais", notYet: "Pas encore", again: "Encore", result: (k, n) => `Vous en connaissiez ${k} sur ${n} du premier coup` },
  de: { title: "Karteikarten", desc: "Wort sehen, Bedeutung erinnern, dann die Karte umdrehen und prüfen.", tapToFlip: "Tippe auf die Karte, um sie umzudrehen", tapBack: "Tippe, um zum Wort zurückzukehren", knew: "Gewusst", notYet: "Noch nicht", again: "Nochmal", result: (k, n) => `Du wusstest ${k} von ${n} beim ersten Mal` },
  it: { title: "Flashcard", desc: "Vedi una parola, ricordi il significato e giri la carta per controllare.", tapToFlip: "Tocca la carta per girarla", tapBack: "Tocca per tornare alla parola", knew: "La sapevo", notYet: "Non ancora", again: "Ancora", result: (k, n) => `Ne sapevi ${k} su ${n} al primo colpo` },
  uk: { title: "Картки", desc: "Бачите слово, згадуєте значення й перевертаєте картку, щоб перевірити.", tapToFlip: "Натисніть на картку, щоб перевернути", tapBack: "Натисніть, щоб повернутися до слова", knew: "Знав(ла)", notYet: "Ще ні", again: "Ще раз", result: (k, n) => `Ви знали ${k} з ${n} з першого разу` },
};

export function flashCopy(lang: string): FlashCopy {
  return FLASH_COPY[lang] ?? FLASH_COPY.en;
}

type Card = { key: string; word: PlayWord; repeat: boolean };

export function GameFlashcards({
  pool,
  onExit,
  lang,
  t,
  focusWord,
}: {
  pool: PlayWord[];
  onExit: () => void;
  lang: string;
  t: PlayT;
  focusWord?: string;
}) {
  const f = flashCopy(lang);
  const { nq } = useNiqqud(); // display-only vowel points
  const first = useMemo<Card[]>(() => {
    const seen = new Set<string>();
    const usable = pool.filter((w) => {
      const k = w.word.trim().toLowerCase();
      if (!w.meaning || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    const focus = focusWord ? usable.find((w) => w.word.trim().toLowerCase() === focusWord.trim().toLowerCase()) : undefined;
    const rest = shuffle(usable.filter((w) => w !== focus));
    const picked = (focus ? [focus, ...rest] : rest).slice(0, SESSION_SIZE.flashcards);
    return picked.map((w, i) => ({ key: `c${i}`, word: w, repeat: false }));
  }, [pool, focusWord]);

  const [deck, setDeck] = useState<Card[]>(first);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [missed, setMissed] = useState<PlayWord[]>([]);

  const total = first.length;
  const card = deck[i];

  function answer(knew: boolean) {
    if (!card) return;
    if (!card.repeat) {
      if (knew) setKnown((k) => k + 1);
      else setMissed((m) => [...m, card.word]);
    }
    // A card you didn't know comes back once at the end of the deck.
    const next = !knew && !card.repeat ? [...deck, { key: `${card.key}r`, word: card.word, repeat: true }] : deck;
    setDeck(next);
    setFlipped(false);
    setI((x) => x + 1);
  }

  if (total === 0 || i >= deck.length) {
    return (
      <GameResult
        data={{
          title: f.title,
          score: known,
          total,
          headline: f.result(known, total),
          missed: missed.map((w) => ({ word: w.word, meaning: w.meaning })),
        }}
        onExit={onExit}
        onReplay={() => location.reload()}
        lang={lang}
        t={t}
      />
    );
  }

  const example = card.word.examples?.[0];
  return (
    <div className="wb-play-stage">
      <style>{FLASH_CSS}</style>
      <PlayHeader title={f.title} progress={`${Math.min(i + 1, deck.length)}/${deck.length}`} score={known} onExit={onExit} t={t} />
      <div className="wb-play-question">
        <div className="wb-play-question-eyebrow">{flipped ? f.tapBack : f.tapToFlip}</div>
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
            <span className="wb-flash-word" dir="auto">{nq(card.word.word)}</span>
          </span>
          <span className="wb-flash-face wb-flash-back" aria-hidden={!flipped}>
            <span className="wb-flash-backword" dir="auto">{nq(card.word.word)}</span>
            <span className="wb-flash-meaning" dir="auto">{nq(card.word.meaning)}</span>
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
.wb-flash-actions { display: flex; gap: 12px; justify-content: center; margin-top: 18px; }
.wb-flash-btn { min-width: 130px; padding: 12px 20px; border-radius: 999px; font: inherit; font-size: 16px; font-weight: 700; cursor: pointer; border: 0; }
.wb-flash-yes { background: #0EA5A5; color: #fff; box-shadow: 0 10px 22px -10px rgba(14,165,165,0.6); }
.wb-flash-no { background: #fff; color: #374151; box-shadow: 0 0 0 1.5px #D1D5DB inset; }
@media (prefers-reduced-motion: reduce) { .wb-flash-inner { transition: none; } }
`;

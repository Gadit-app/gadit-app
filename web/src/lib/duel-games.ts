/**
 * Word Duel inside the games (Gadi 2026-10-11): every multiple-choice game
 * on /play can be played against someone. This turns a game's own rounds
 * into duel questions (a prompt and 2 to 4 options), so the duel engine
 * runs them unchanged on one device, by invite or against Word Bot.
 *
 * Games that need another mechanic (memory, anagram, build-a-word, root
 * rush, shade slider) and the self-checked flashcards are not here.
 */
import { buildFillBlankQuestions, buildQuizQuestions, buildTrueFalseRounds, type GameId, type PlayWord } from "@/lib/play-engine";
import { DUEL_ROUNDS, shuffleDuel, type DuelQuestion } from "@/lib/duel";
import { pickTwinTrapRounds } from "@/lib/play-content/twin-trap";
import { pickTimeTravelerRounds } from "@/lib/play-content/time-traveler";
import { getLangLabel, pickWordPassportRounds } from "@/lib/play-content/word-passport";
import { pickFalseFriendsRounds } from "@/lib/play-content/false-friends";
import { pickIdiomDecoderRounds } from "@/lib/play-content/idiom-decoder";
import { pickMeaningLensRounds } from "@/lib/play-content/meaning-lens";
import { pickEtymologyArtistRounds } from "@/lib/play-content/etymology-artist";

export const DUEL_GAMES: ReadonlySet<GameId> = new Set<GameId>([
  "quiz", "truefalse", "fillblank", "speed",
  "twin", "time", "passport", "friends", "idiom", "lens", "artist",
]);

/** Shuffle the options of a question and keep the right answer right. */
function mix(prompt: string, options: readonly string[], correctIdx: number): DuelQuestion {
  const right = options[correctIdx];
  const opts = shuffleDuel([...options]);
  return { prompt, options: opts, correctIdx: opts.indexOf(right) };
}

export function duelQuestionsFor(
  game: GameId,
  ctx: { pool: PlayWord[]; lang: string; kids: boolean; yes: string; no: string; real: string; trap: string },
): DuelQuestion[] | null {
  const n = DUEL_ROUNDS;
  const { pool, lang, kids } = ctx;
  let qs: DuelQuestion[] = [];
  switch (game) {
    case "quiz":
    case "speed":
      qs = buildQuizQuestions(pool, n).map((q) => ({ prompt: q.prompt, options: q.options, correctIdx: q.correctIdx }));
      break;
    case "truefalse":
      // Yes / no keep their order: "true" is always the first button.
      qs = buildTrueFalseRounds(pool, n).map((r) => ({ prompt: `${r.word.word}\n${r.shown}`, options: [ctx.yes, ctx.no], correctIdx: r.isTrue ? 0 : 1 }));
      break;
    case "fillblank":
      qs = buildFillBlankQuestions(pool, n).map((q) => ({ prompt: q.sentence, options: q.options, correctIdx: q.correctIdx }));
      break;
    case "twin":
      qs = pickTwinTrapRounds(n, lang, kids).rounds.map((r) => mix(r.sentence, r.options, r.correctIdx));
      break;
    case "time":
      qs = pickTimeTravelerRounds(n, lang).rounds.map((r) => mix(r.oldMeaning, r.options, r.correctIdx));
      break;
    case "passport": {
      const { rounds, contentLang } = pickWordPassportRounds(n, lang);
      qs = rounds.map((r) => mix(r.word, r.options.map((c) => getLangLabel(c, contentLang)), r.correctIdx));
      break;
    }
    case "friends":
      qs = pickFalseFriendsRounds(n, lang).rounds.map((r) => ({
        prompt: `${r.foreignWord} (${r.foreignLang})\n= ${r.englishTwin}?`,
        options: [ctx.real, ctx.trap],
        correctIdx: r.isReal ? 0 : 1,
      }));
      break;
    case "idiom":
      qs = pickIdiomDecoderRounds(n, lang, kids).rounds.map((r) => mix(r.literal, r.options, r.correctIdx));
      break;
    case "lens":
      qs = pickMeaningLensRounds(n, lang, kids).rounds.map((r) => mix(`${r.word}\n${r.sentence}`, r.options, r.correctIdx));
      break;
    case "artist":
      qs = pickEtymologyArtistRounds(n, lang, kids).rounds.map((r) => mix(`${r.literal}\n(${r.origin})`, r.options, r.correctIdx));
      break;
    default:
      return null;
  }
  qs = qs.filter((q) => q.prompt && q.options.length >= 2 && q.correctIdx >= 0).slice(0, n);
  return qs.length >= 3 ? qs : null;
}

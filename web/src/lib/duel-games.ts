/**
 * Word Duel inside the games (Gadi 2026-10-11): every multiple-choice game
 * on /play can be played against someone. This turns a game's own rounds
 * into duel questions (a prompt and 2 to 4 options), so the duel engine
 * runs them unchanged on one device, by invite or against Word Bot.
 *
 * Games that need another mechanic (memory, anagram, build-a-word, root
 * rush, shade slider) and the self-checked flashcards are not here.
 */
import { buildAnagramRounds, buildFillBlankQuestions, buildQuizQuestions, buildTrueFalseRounds, sample, type GameId, type PlayWord } from "@/lib/play-engine";
import { pickBuildAWordRounds } from "@/lib/play-content/build-a-word";
import { pickRootRushRounds } from "@/lib/play-content/root-rush";
import { pickShadeSliderRounds } from "@/lib/play-content/shade-slider";
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
  // Every game (Gadi 2026-10-12): the other six as one question with options.
  "flashcards", "memory", "anagram", "build", "root", "shade",
]);

/** The question line for root rush and shade slider in a duel (Gadi 2026-10-12). */
const DUEL_Q: Record<string, [string, string]> = {
  en: ["Which word comes from this root?", "Which one is the strongest?"],
  he: ["איזו מילה באה מהשורש הזה?", "איזו מילה הכי חזקה?"],
  ar: ["أي كلمة تأتي من هذا الجذر؟", "أي كلمة هي الأقوى؟"],
  ru: ["Какое слово от этого корня?", "Какое слово самое сильное?"],
  es: ["¿Qué palabra viene de esta raíz?", "¿Cuál es la más fuerte?"],
  pt: ["Qual palavra vem desta raiz?", "Qual é a mais forte?"],
  fr: ["Quel mot vient de cette racine ?", "Lequel est le plus fort ?"],
  de: ["Welches Wort kommt von dieser Wurzel?", "Welches ist das stärkste?"],
  cs: ["Které slovo pochází z tohoto kořene?", "Které je nejsilnější?"],
  sk: ["Ktoré slovo pochádza z tohto koreňa?", "Ktoré je najsilnejšie?"],
  it: ["Quale parola viene da questa radice?", "Qual è la più forte?"],
  ja: ["この語根から来たことばはどれ？", "いちばん強いのはどれ？"],
  hi: ["कौन-सा शब्द इस मूल से बना है?", "सबसे तेज़ कौन-सा है?"],
  am: ["ከዚህ ሥር የመጣው የትኛው ቃል ነው?", "በጣም ጠንካራው የትኛው ነው?"],
  uk: ["Яке слово від цього кореня?", "Яке слово найсильніше?"],
  tr: ["Hangi kelime bu kökten geliyor?", "En güçlüsü hangisi?"],
  pl: ["Które słowo pochodzi od tego rdzenia?", "Które jest najmocniejsze?"],
  fa: ["کدام کلمه از این ریشه است؟", "کدام از همه قوی‌تر است؟"],
  id: ["Kata mana yang berasal dari akar ini?", "Mana yang paling kuat?"],
  nl: ["Welk woord komt van deze stam?", "Welke is het sterkst?"],
  el: ["Ποια λέξη βγαίνει από αυτή τη ρίζα;", "Ποια είναι η πιο δυνατή;"],
  zu: ["Yiliphi igama elivela kulo mpande?", "Yiliphi elinamandla kakhulu?"],
  vi: ["Từ nào đến từ gốc này?", "Từ nào mạnh nhất?"],
  fil: ["Aling salita ang galing sa ugat na ito?", "Alin ang pinakamatindi?"],
  af: ["Watter woord kom van hierdie stam?", "Watter een is die sterkste?"],
  sw: ["Neno lipi linatokana na mzizi huu?", "Lipi lina nguvu zaidi?"],
  "zh-CN": ["哪个词来自这个词根？", "哪个最强烈？"],
  "zh-TW": ["哪個詞來自這個詞根？", "哪個最強烈？"],
  ko: ["이 어근에서 온 단어는?", "가장 강한 것은?"],
  th: ["คำไหนมาจากรากคำนี้?", "คำไหนแรงที่สุด?"],
  bn: ["কোন শব্দটি এই মূল থেকে এসেছে?", "কোনটি সবচেয়ে জোরালো?"],
  da: ["Hvilket ord kommer fra denne rod?", "Hvilket er det stærkeste?"],
  hu: ["Melyik szó ebből a tőből jön?", "Melyik a legerősebb?"],
};


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
    case "flashcards":
    case "memory":
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
    case "anagram": {
      // The scrambled letters; pick the word they make.
      const rounds = buildAnagramRounds(pool, n);
      const words = pool.map((p) => p.word);
      qs = rounds.flatMap((r) => {
        const right = r.word.word;
        const others = sample(words.filter((w) => w !== right), 3);
        return others.length < 1 ? [] : [mix(r.scrambled.join(" "), [right, ...others], 0)];
      });
      break;
    }
    case "build": {
      // The clue; pick the word it describes.
      const { rounds } = pickBuildAWordRounds(n + 3, lang);
      const targets = rounds.map((r) => r.target);
      qs = rounds.slice(0, n).map((r) => mix(r.clue, [r.target, ...sample(targets.filter((x) => x !== r.target), 3)], 0));
      break;
    }
    case "root": {
      // The root and its meaning; pick the one word that comes from it.
      const q = (DUEL_Q[lang] ?? DUEL_Q.en)[0];
      qs = pickRootRushRounds(n, lang).rounds.map((r) => mix(`${r.root} (${r.meaning})\n${q}`, [r.correct[0], ...r.distractors], 0));
      break;
    }
    case "shade": {
      // Four words from the same ladder; pick the strongest.
      const q = (DUEL_Q[lang] ?? DUEL_Q.en)[1];
      qs = pickShadeSliderRounds(n, lang).rounds.map((r) => {
        const lower = sample(r.ladder.slice(0, 4), 3);
        return mix(`${r.axis}\n${q}`, [r.ladder[4], ...lower], 0);
      });
      break;
    }
    default:
      return null;
  }
  qs = qs.filter((q) => q.prompt && q.options.length >= 2 && q.correctIdx >= 0).slice(0, n);
  return qs.length >= 3 ? qs : null;
}

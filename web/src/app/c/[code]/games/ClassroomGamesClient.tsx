"use client";

/**
 * Classroom Games — anonymous (no auth) games hub for the kid view.
 *
 * Renders the curated games that ship with their own content and don't
 * depend on a notebook. The notebook-driven games (Quiz, FillBlank,
 * Memory, Anagram, Speed) require Deep auth + a vocabulary pool of
 * 4+ words — irrelevant here.
 *
 * The eight curated games show up directly. Picking one swaps out the
 * hub for the game component. The components are the same ones used
 * by /play so we get all the per-language Hebrew/Arabic/Russian
 * content for free.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import type { PlayT } from "@/components/play/GameQuiz";
import { GameTwinTrap } from "@/components/play/GameTwinTrap";
import { GameTimeTraveler } from "@/components/play/GameTimeTraveler";
import { GameWordPassport } from "@/components/play/GameWordPassport";
import { GameFalseFriends } from "@/components/play/GameFalseFriends";
import { GameRootRush } from "@/components/play/GameRootRush";
import { GameShadeSlider } from "@/components/play/GameShadeSlider";
import { GameBuildAWord } from "@/components/play/GameBuildAWord";
import { GameIdiomDecoder } from "@/components/play/GameIdiomDecoder";
import { GameMeaningLens } from "@/components/play/GameMeaningLens";
import { GameEtymologyArtist } from "@/components/play/GameEtymologyArtist";

type GameId =
  | "twin" | "time" | "passport" | "friends" | "root"
  | "shade" | "build" | "idiom" | "lens" | "artist";

/** Localized chrome. Game-internal strings come from the same PlayT
 *  the regular /play page uses — we just pass it through. Defined
 *  inline so the file is self-contained for the kid-view route. */
const COPY: Record<string, {
  hubTitle: string;
  hubLede: string;
  backToClassroom: string;
}> = {
  he: {
    hubTitle: "משחקי מילים",
    hubLede: "בחרו משחק להתאמן עליו",
    backToClassroom: "← חזרה לכיתה",
  },
  en: {
    hubTitle: "Word Games",
    hubLede: "Pick a game to sharpen your vocabulary",
    backToClassroom: "← Back to classroom",
  },
  zu: {
    hubTitle: "Imidlalo Yamagama",
    hubLede: "Khetha umdlalo ukuze ulole isilulumagama sakho",
    backToClassroom: "← Buyela ekilasini",
  },
  el: {
    hubTitle: "Παιχνίδια λέξεων",
    hubLede: "Διάλεξε ένα παιχνίδι για να βελτιώσεις το λεξιλόγιό σου",
    backToClassroom: "← Πίσω στην τάξη",
  },
  ar: {
    hubTitle: "ألعاب الكلمات",
    hubLede: "اختر لعبة لتقوية مفرداتك",
    backToClassroom: "← العودة إلى الصف",
  },
  ru: {
    hubTitle: "Игры со словами",
    hubLede: "Выбери игру, чтобы отточить словарный запас",
    backToClassroom: "← Вернуться в класс",
  },
  hi: {
    hubTitle: "शब्द खेल",
    hubLede: "शब्दावली निखारने के लिए खेल चुनें",
    backToClassroom: "← कक्षा में वापस",
  },
  am: {
    hubTitle: "የቃላት ጨዋታዎች",
    hubLede: "ቃላታችሁን ለማጠንከር ጨዋታ ምረጡ",
    backToClassroom: "← ወደ ክፍል ተመለሱ",
  },
};

/** Minimal PlayT factory. We only need the fields the 10 curated games
 *  reference (their own title/prompt). The notebook-game and
 *  menu/streak fields go unused here — they belong to the auth-gated
 *  /play surface, not to the classroom hub. */
function classroomPlayT(lang: string): PlayT {
  // Hebrew strings — used as the authoritative example below. Default
  // fallback when a key isn't in the requested lang.
  const he = {
    menuTitle: "משחקי מילים", menuLede: "", streakOne: "", streakMany: (n: number) => `${n}`, bestEver: (n: number) => `${n}`,
    notEnoughWords: "", notEnoughHint: "", goNotebook: "", comingSoon: "",
    quizTitle: "חידון הגדרות", quizDesc: "", fillblankTitle: "השלמת משפט", fillblankDesc: "",
    memoryTitle: "זיכרון", memoryDesc: "", anagramTitle: "ערבול אותיות", anagramDesc: "",
    speedTitle: "חידון מהיר", speedDesc: "",
    twinTitle: "מלכודת תאומים", twinDesc: "", twinPrompt: "בחר את המילה המתאימה",
    timeTitle: "מסע בזמן", timeDesc: "", timePrompt: "פעם זו הייתה המשמעות:",
    passportTitle: "דרכון מילים", passportDesc: "", passportPrompt: "מאיפה המילה הזו במקור?",
    friendsTitle: "חברים מזויפים", friendsDesc: "", friendsPrompt: "האם המילים האלה אומרות אותו דבר?",
    friendsTrue: "אמיתי", friendsFalse: "מלכודת",
    rootTitle: "ציד שורשים", rootDesc: "", rootPrompt: "השורש הזה ילד שלוש מילים מודרניות",
    rootProgress: (n: number) => (n === 0 ? "מצא 3 מילים" : n === 3 ? "כל השלוש נמצאו!" : `${n}/3 נמצאו`),
    shadeTitle: "סולם עוצמה", shadeDesc: "", shadePrompt: "מהמתון לחזק ביותר",
    shadeMild: "מתון", shadeStrong: "חזק", shadeReveal: "הסדר הנכון",
    buildTitle: "בנה מילה", buildDesc: "", buildPrompt: "בנה את המילה שמתאימה לרמז",
    idiomTitle: "מפענח ניבים", idiomDesc: "", idiomPrompt: "אם נקח את הניב מילולית, מה הוא באמת אומר?",
    lensTitle: "עדשת משמעות", lensDesc: "", lensPrompt: "באיזו משמעות המילה משמשת כאן?",
    artistTitle: "אמן אטימולוגיה", artistDesc: "", artistPrompt: "השורש העתיק הזה נתן לנו איזו מילה מודרנית?",
    catNotebook: "", catOrigin: "", catPrecision: "", catStructure: "",
    exit: "סגירה",
    quizPromptWord: "מה המשמעות?", quizPromptMeaning: "איזו מילה?",
    fillblankPrompt: "השלם את המילה",
    anagramPrompt: "סדר את האותיות", anagramHint: "רמז:", anagramSubmit: "בדיקה", anagramReset: "איפוס",
    speedReady: "מוכן?", speedGo: "צא!", speedSeconds: (n: number) => `${n}`,
    memoryFlipPrompt: "התאם זוגות", memoryMoves: (n: number) => `${n}`,
    resultGreat: "נהדר!", resultGood: "יפה.",
    resultKeepGoing: "ממשיכים להתאמן.", resultYouMissed: "מילים לחזרה",
    resultPlayAgain: "שחק שוב", resultBackToGames: "חזרה למשחקים",
    resultFinalScore: (s: number) => `${s} נקודות`,
  } as PlayT;
  const en = {
    ...he,
    menuTitle: "Word Games",
    twinTitle: "Twin Trap", twinPrompt: "Pick the right word",
    timeTitle: "Time Traveler", timePrompt: "Centuries ago, this word meant:",
    passportTitle: "Word Passport", passportPrompt: "Which language did this word come from?",
    friendsTitle: "False Friends", friendsPrompt: "Do these two words mean the same thing?",
    friendsTrue: "Real twin", friendsFalse: "Trap",
    rootTitle: "Root Rush", rootPrompt: "This root grew into three modern words. Find them.",
    rootProgress: (n: number) => (n === 0 ? "Find 3 words" : n === 3 ? "All three found!" : `${n}/3 found`),
    shadeTitle: "Shade Slider", shadePrompt: "Tap the cards in order, mildest first.",
    shadeMild: "Mild", shadeStrong: "Intense", shadeReveal: "Correct order",
    buildTitle: "Build-a-Word", buildPrompt: "Build the word that matches the clue",
    idiomTitle: "Idiom Decoder", idiomPrompt: "If we took this idiom at face value, what does it actually mean?",
    lensTitle: "Meaning Lens", lensPrompt: "Which sense of this word does the sentence use?",
    artistTitle: "Etymology Artist", artistPrompt: "Which modern word grew from this ancient root?",
    quizTitle: "Definition Quiz", fillblankTitle: "Fill the Blank", memoryTitle: "Memory Match",
    anagramTitle: "Letter Scramble", speedTitle: "Speed Round",
    exit: "Close",
    quizPromptWord: "What does this word mean?", quizPromptMeaning: "Which word fits?",
    fillblankPrompt: "Pick the missing word",
    anagramPrompt: "Unscramble the letters", anagramHint: "Hint:", anagramSubmit: "Check", anagramReset: "Reset",
    speedReady: "Get ready", speedGo: "Go!", speedSeconds: (n: number) => (n === 1 ? "1 word!" : `${n} words!`),
    memoryFlipPrompt: "Match each word with its meaning", memoryMoves: (n: number) => (n === 1 ? "1 move" : `${n} moves`),
    resultGreat: "Great job!", resultGood: "Nice work.",
    resultKeepGoing: "Keep practicing.", resultYouMissed: "Words to review",
    resultPlayAgain: "Play again", resultBackToGames: "Back to games",
    resultFinalScore: (s: number) => `${s} points`,
  } as PlayT;
  if (lang === "he") return he;
  return en;
}

const GAMES: Array<{
  id: GameId;
  titleHe: string;
  titleEn: string;
  desc: string;
  accent: string;
  icon: React.ReactNode;
}> = [
  { id: "twin", titleHe: "מלכודת תאומים", titleEn: "Twin Trap", desc: "", accent: "sky",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="12" r="4" /><circle cx="16" cy="12" r="4" /></svg>) },
  { id: "time", titleHe: "מסע בזמן", titleEn: "Time Traveler", desc: "", accent: "emerald",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>) },
  { id: "passport", titleHe: "דרכון מילים", titleEn: "Word Passport", desc: "", accent: "violet",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" /></svg>) },
  { id: "friends", titleHe: "חברים מזויפים", titleEn: "False Friends", desc: "", accent: "coral",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12c2.2 0 4-2 4-4.5S11.2 3 9 3 5 5 5 7.5 6.8 12 9 12Z" /><path d="M15 21c2.2 0 4-2 4-4.5S17.2 12 15 12s-4 2-4 4.5S12.8 21 15 21Z" /></svg>) },
  { id: "root", titleHe: "ציד שורשים", titleEn: "Root Rush", desc: "", accent: "lime",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18" /><path d="M12 13c-3-2-6-2-9 0" /><path d="M12 13c3-2 6-2 9 0" /></svg>) },
  { id: "shade", titleHe: "סולם עוצמה", titleEn: "Shade Slider", desc: "", accent: "amber",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18h18" /><path d="M5 14l3-4 4 6 4-9 3 7" /></svg>) },
  { id: "build", titleHe: "בנה מילה", titleEn: "Build-a-Word", desc: "", accent: "indigo",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="9" width="5" height="6" rx="1.5" /><rect x="9.5" y="9" width="5" height="6" rx="1.5" /><rect x="16" y="9" width="5" height="6" rx="1.5" /></svg>) },
  { id: "idiom", titleHe: "מפענח ניבים", titleEn: "Idiom Decoder", desc: "", accent: "fuchsia",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>) },
  { id: "lens", titleHe: "עדשת משמעות", titleEn: "Meaning Lens", desc: "", accent: "cyan",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>) },
  { id: "artist", titleHe: "אמן אטימולוגיה", titleEn: "Etymology Artist", desc: "", accent: "pink",
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6m0 0 3-3m-3 3-3-3" /><path d="M5 14a7 7 0 0 0 14 0" /><path d="M12 21v-7" /></svg>) },
];

export function ClassroomGamesClient({ code }: { code: string }) {
  const { lang, dir } = useLang();
  const href = useHref();
  const c = COPY[lang] ?? COPY.en;
  const [active, setActive] = useState<GameId | null>(null);
  const t = classroomPlayT(lang);

  // When the player exits a game, return to the games hub. Same UX as
  // /play but without the streak update side-effect.
  const exit = () => setActive(null);
  const props = { onExit: exit, lang, t };

  // Active game stage — renders the same game components as /play.
  if (active) {
    return (
      <div className="wordbook wb-play-page" dir={dir}>
        {active === "twin"     && <GameTwinTrap {...props} />}
        {active === "time"     && <GameTimeTraveler {...props} />}
        {active === "passport" && <GameWordPassport {...props} />}
        {active === "friends"  && <GameFalseFriends {...props} />}
        {active === "root"     && <GameRootRush {...props} />}
        {active === "shade"    && <GameShadeSlider {...props} />}
        {active === "build"    && <GameBuildAWord {...props} />}
        {active === "idiom"    && <GameIdiomDecoder {...props} />}
        {active === "lens"     && <GameMeaningLens {...props} />}
        {active === "artist"   && <GameEtymologyArtist {...props} />}
      </div>
    );
  }

  // Hub
  return (
    <div className="wordbook wb-school-page" dir={dir}>
      <header className="wb-classroom-topbar">
        <Link href={href("/")} aria-label="Gadit" dir="ltr" className="wb-classroom-wordmark">
          Gad<span className="wb-classroom-wordmark-it">it</span>
        </Link>
        <nav className="wb-classroom-nav">
          <Link href={href(`/c/${code}`)} className="wb-classroom-nav-link">
            {c.backToClassroom}
          </Link>
        </nav>
      </header>

      <main className="wb-school-main" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <h1 style={{
          fontFamily: "var(--wb-serif)",
          fontSize: "clamp(28px, 5vw, 40px)",
          fontWeight: 700,
          color: "var(--ink)",
          margin: "0 0 8px",
          textAlign: "center",
        }}>
          {c.hubTitle}
        </h1>
        <p style={{
          fontFamily: "var(--wb-sans)",
          fontSize: 15,
          color: "var(--ink-soft)",
          margin: "0 0 28px",
          textAlign: "center",
        }}>
          {c.hubLede}
        </p>

        <ul className="wb-classroom-games-grid">
          {GAMES.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => setActive(g.id)}
                className={`wb-play-card wb-play-card-${g.accent}`}
              >
                <span className="wb-play-card-icon">{g.icon}</span>
                <span className="wb-play-card-text">
                  <span className="wb-play-card-title">
                    {lang === "he" ? g.titleHe : g.titleEn}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

"use client";

/**
 * /play — Word Games hub.
 *
 * Page states:
 *   1. "loading"   — fetching notebook + hydrating cache
 *   2. "menu"      — 5 game tiles; insufficient-words games are disabled
 *   3. "playing"   — one of the five game components owns the screen
 *
 * Game finish is handled by each game component itself (renders
 * GameResult, which calls back to onExit → returns here to "menu").
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { useHref } from "@/lib/href";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import {
  loadPlayWords,
  hydrateExamples,
  MIN_WORDS_FOR_GAME,
  type GameId,
  type PlayWord,
} from "@/lib/play-engine";
import { getStreak } from "@/lib/play-streak";
import { GameQuiz, type PlayT } from "@/components/play/GameQuiz";
import { GameFillBlank } from "@/components/play/GameFillBlank";
import { GameMemory } from "@/components/play/GameMemory";
import { GameAnagram } from "@/components/play/GameAnagram";
import { GameSpeed } from "@/components/play/GameSpeed";

const LANGS = [
  { code: "he", label: "עברית" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "ru", label: "Русский" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "cs", label: "Čeština" },
] as const;

// Localized strings — kept inline rather than added to i18n-v2 to keep
// the games self-contained and easy to ship. Will be migrated into
// V2Strings if anything else needs them.
const COPY: Record<string, PlayT> = {
  he: {
    menuTitle: "משחקי מילים",
    menuLede: "חיזוק האוצר שלך בכיף · בלי קליקים מיותרים",
    streakOne: "יום אחד ברצף",
    streakMany: (n) => `${n} ימים ברצף`,
    bestEver: (n) => `שיא אישי: ${n}`,
    notEnoughWords: "צריך עוד קצת מילים כדי להתחיל",
    notEnoughHint: "שמור 4 מילים במחברת ונחזור הנה.",
    goNotebook: "פתיחת המחברת",
    comingSoon: "בקרוב",
    quizTitle: "חידון הגדרות",
    quizDesc: "מילה והגדרה — מצא את ההתאמה הנכונה",
    fillblankTitle: "השלם את המשפט",
    fillblankDesc: "המילה החסרה במשפט — מי היא?",
    memoryTitle: "משחק זיכרון",
    memoryDesc: "התאם זוגות של מילה והגדרה",
    anagramTitle: "ערבול אותיות",
    anagramDesc: "סדר את האותיות לפי הרמז",
    speedTitle: "חידון מהיר",
    speedDesc: "כמה מילים תזהה ב-60 שניות?",
    exit: "סגירה",
    quizPromptWord: "מה המשמעות של המילה",
    quizPromptMeaning: "איזו מילה מתאימה להגדרה",
    fillblankPrompt: "השלם את המילה החסרה",
    anagramPrompt: "סדר את האותיות",
    anagramHint: "רמז:",
    anagramSubmit: "בדיקה",
    anagramReset: "איפוס",
    speedReady: "מוכן?",
    speedGo: "צא!",
    speedSeconds: (n) => n === 1 ? "מילה אחת!" : `${n} מילים!`,
    memoryFlipPrompt: "התאם כל מילה עם ההגדרה שלה — הפוך 2 קלפים בכל פעם",
    memoryMoves: (n) => n === 1 ? "מהלך אחד" : `${n} מהלכים`,
    resultPerfect: "מושלם!",
    resultGreat: "נהדר!",
    resultGood: "יפה.",
    resultKeepGoing: "ממשיכים להתאמן.",
    resultYouMissed: "מילים לחזרה",
    resultPlayAgain: "שחק שוב",
    resultBackToGames: "חזרה למשחקים",
    resultFinalScore: (s) => `${s} נקודות`,
  },
  en: {
    menuTitle: "Word Games",
    menuLede: "Sharpen your vocabulary · five quick modes",
    streakOne: "1-day streak",
    streakMany: (n) => `${n}-day streak`,
    bestEver: (n) => `Best: ${n}`,
    notEnoughWords: "You need a few more words first",
    notEnoughHint: "Save 4 words to your notebook and come back.",
    goNotebook: "Open my notebook",
    comingSoon: "Soon",
    quizTitle: "Definition Quiz",
    quizDesc: "Match the word to its meaning",
    fillblankTitle: "Fill the Blank",
    fillblankDesc: "Find the missing word in the sentence",
    memoryTitle: "Memory Match",
    memoryDesc: "Pair every word with its meaning",
    anagramTitle: "Letter Scramble",
    anagramDesc: "Unscramble the word from the hint",
    speedTitle: "Speed Round",
    speedDesc: "How many words can you nail in 60 seconds?",
    exit: "Close",
    quizPromptWord: "What does this word mean?",
    quizPromptMeaning: "Which word fits this meaning?",
    fillblankPrompt: "Pick the missing word",
    anagramPrompt: "Unscramble the letters",
    anagramHint: "Hint:",
    anagramSubmit: "Check",
    anagramReset: "Reset",
    speedReady: "Get ready",
    speedGo: "Go!",
    speedSeconds: (n) => n === 1 ? "1 word!" : `${n} words!`,
    memoryFlipPrompt: "Match each word with its meaning — flip 2 cards at a time",
    memoryMoves: (n) => n === 1 ? "1 move" : `${n} moves`,
    resultPerfect: "Perfect!",
    resultGreat: "Great job!",
    resultGood: "Nice work.",
    resultKeepGoing: "Keep practicing.",
    resultYouMissed: "Words to review",
    resultPlayAgain: "Play again",
    resultBackToGames: "Back to games",
    resultFinalScore: (s) => `${s} points`,
  },
  ar: {
    menuTitle: "ألعاب الكلمات",
    menuLede: "اشحذ مفرداتك · خمسة أوضاع سريعة",
    streakOne: "يوم واحد متواصل",
    streakMany: (n) => `${n} أيام متواصلة`,
    bestEver: (n) => `الأفضل: ${n}`,
    notEnoughWords: "أنت بحاجة لمزيد من الكلمات أولاً",
    notEnoughHint: "احفظ 4 كلمات في دفترك ثم عُد.",
    goNotebook: "افتح دفتري",
    comingSoon: "قريباً",
    quizTitle: "اختبار التعريفات",
    quizDesc: "اختر المعنى الصحيح للكلمة",
    fillblankTitle: "املأ الفراغ",
    fillblankDesc: "اعثر على الكلمة المفقودة في الجملة",
    memoryTitle: "لعبة الذاكرة",
    memoryDesc: "اقرن كل كلمة بمعناها",
    anagramTitle: "ترتيب الحروف",
    anagramDesc: "رتب الحروف من خلال التلميح",
    speedTitle: "الجولة السريعة",
    speedDesc: "كم كلمة تعرف خلال 60 ثانية؟",
    exit: "إغلاق",
    quizPromptWord: "ما معنى هذه الكلمة؟",
    quizPromptMeaning: "أي كلمة تطابق هذا المعنى؟",
    fillblankPrompt: "اختر الكلمة المفقودة",
    anagramPrompt: "رتب الحروف",
    anagramHint: "تلميح:",
    anagramSubmit: "تحقق",
    anagramReset: "إعادة",
    speedReady: "استعد",
    speedGo: "هيا!",
    speedSeconds: (n) => `${n} كلمة!`,
    memoryFlipPrompt: "اربط كل كلمة بمعناها — اقلب بطاقتين في كل مرة",
    memoryMoves: (n) => `${n} حركة`,
    resultPerfect: "مثالي!",
    resultGreat: "أحسنت!",
    resultGood: "عمل جيد.",
    resultKeepGoing: "استمر بالتمرين.",
    resultYouMissed: "كلمات للمراجعة",
    resultPlayAgain: "العب مرة أخرى",
    resultBackToGames: "العودة للألعاب",
    resultFinalScore: (s) => `${s} نقطة`,
  },
  ru: {
    menuTitle: "Игры со словами",
    menuLede: "Отточи словарный запас · пять быстрых режимов",
    streakOne: "1 день подряд",
    streakMany: (n) => `${n} дней подряд`,
    bestEver: (n) => `Рекорд: ${n}`,
    notEnoughWords: "Сначала нужно больше слов",
    notEnoughHint: "Сохрани 4 слова в тетрадь и возвращайся.",
    goNotebook: "Открыть тетрадь",
    comingSoon: "Скоро",
    quizTitle: "Викторина определений",
    quizDesc: "Подбери слово к значению",
    fillblankTitle: "Заполни пропуск",
    fillblankDesc: "Найди пропущенное слово в предложении",
    memoryTitle: "Игра памяти",
    memoryDesc: "Сопоставь каждое слово с значением",
    anagramTitle: "Анаграмма",
    anagramDesc: "Собери слово по подсказке",
    speedTitle: "Спринт",
    speedDesc: "Сколько слов узнаешь за 60 секунд?",
    exit: "Закрыть",
    quizPromptWord: "Что означает это слово?",
    quizPromptMeaning: "Какое слово подходит?",
    fillblankPrompt: "Выбери пропущенное слово",
    anagramPrompt: "Собери буквы",
    anagramHint: "Подсказка:",
    anagramSubmit: "Проверить",
    anagramReset: "Сброс",
    speedReady: "Готов?",
    speedGo: "Старт!",
    speedSeconds: (n) => `${n} слов!`,
    memoryFlipPrompt: "Сопоставь слово с значением — переворачивай по 2 карты",
    memoryMoves: (n) => `${n} ходов`,
    resultPerfect: "Идеально!",
    resultGreat: "Отлично!",
    resultGood: "Хорошо.",
    resultKeepGoing: "Продолжаем тренировку.",
    resultYouMissed: "Слова для повторения",
    resultPlayAgain: "Ещё раз",
    resultBackToGames: "К играм",
    resultFinalScore: (s) => `${s} очков`,
  },
  es: {
    menuTitle: "Juegos de Palabras",
    menuLede: "Afila tu vocabulario · cinco modos rápidos",
    streakOne: "1 día seguido",
    streakMany: (n) => `${n} días seguidos`,
    bestEver: (n) => `Récord: ${n}`,
    notEnoughWords: "Necesitas más palabras primero",
    notEnoughHint: "Guarda 4 palabras en tu cuaderno y vuelve.",
    goNotebook: "Abrir mi cuaderno",
    comingSoon: "Próximamente",
    quizTitle: "Quiz de Definiciones",
    quizDesc: "Empareja la palabra con su significado",
    fillblankTitle: "Completa la Frase",
    fillblankDesc: "Encuentra la palabra que falta",
    memoryTitle: "Memoria",
    memoryDesc: "Empareja cada palabra con su significado",
    anagramTitle: "Anagramas",
    anagramDesc: "Ordena las letras con la pista",
    speedTitle: "Ronda Rápida",
    speedDesc: "¿Cuántas palabras en 60 segundos?",
    exit: "Cerrar",
    quizPromptWord: "¿Qué significa esta palabra?",
    quizPromptMeaning: "¿Qué palabra encaja?",
    fillblankPrompt: "Elige la palabra que falta",
    anagramPrompt: "Ordena las letras",
    anagramHint: "Pista:",
    anagramSubmit: "Comprobar",
    anagramReset: "Reiniciar",
    speedReady: "Prepárate",
    speedGo: "¡Ya!",
    speedSeconds: (n) => `¡${n} palabras!`,
    memoryFlipPrompt: "Empareja cada palabra con su significado — voltea 2 cartas",
    memoryMoves: (n) => `${n} movimientos`,
    resultPerfect: "¡Perfecto!",
    resultGreat: "¡Muy bien!",
    resultGood: "Buen trabajo.",
    resultKeepGoing: "Sigue practicando.",
    resultYouMissed: "Palabras para repasar",
    resultPlayAgain: "Jugar de nuevo",
    resultBackToGames: "Volver a juegos",
    resultFinalScore: (s) => `${s} puntos`,
  },
  pt: {
    menuTitle: "Jogos de Palavras",
    menuLede: "Afie seu vocabulário · cinco modos rápidos",
    streakOne: "1 dia seguido",
    streakMany: (n) => `${n} dias seguidos`,
    bestEver: (n) => `Recorde: ${n}`,
    notEnoughWords: "Você precisa de mais palavras primeiro",
    notEnoughHint: "Salve 4 palavras no caderno e volte.",
    goNotebook: "Abrir caderno",
    comingSoon: "Em breve",
    quizTitle: "Quiz de Definições",
    quizDesc: "Combine a palavra ao significado",
    fillblankTitle: "Complete a Frase",
    fillblankDesc: "Encontre a palavra que falta",
    memoryTitle: "Memória",
    memoryDesc: "Combine cada palavra ao significado",
    anagramTitle: "Anagramas",
    anagramDesc: "Ordene as letras com a dica",
    speedTitle: "Rodada Rápida",
    speedDesc: "Quantas palavras em 60 segundos?",
    exit: "Fechar",
    quizPromptWord: "O que esta palavra significa?",
    quizPromptMeaning: "Qual palavra encaixa?",
    fillblankPrompt: "Escolha a palavra que falta",
    anagramPrompt: "Ordene as letras",
    anagramHint: "Dica:",
    anagramSubmit: "Conferir",
    anagramReset: "Reiniciar",
    speedReady: "Prepare-se",
    speedGo: "Vai!",
    speedSeconds: (n) => `${n} palavras!`,
    memoryFlipPrompt: "Combine cada palavra ao significado — vire 2 cartas",
    memoryMoves: (n) => `${n} jogadas`,
    resultPerfect: "Perfeito!",
    resultGreat: "Ótimo!",
    resultGood: "Bom trabalho.",
    resultKeepGoing: "Continue praticando.",
    resultYouMissed: "Palavras para revisar",
    resultPlayAgain: "Jogar de novo",
    resultBackToGames: "Voltar aos jogos",
    resultFinalScore: (s) => `${s} pontos`,
  },
  fr: {
    menuTitle: "Jeux de Mots",
    menuLede: "Affûtez votre vocabulaire · cinq modes rapides",
    streakOne: "1 jour d'affilée",
    streakMany: (n) => `${n} jours d'affilée`,
    bestEver: (n) => `Record : ${n}`,
    notEnoughWords: "Il vous faut d'abord plus de mots",
    notEnoughHint: "Enregistrez 4 mots dans votre carnet et revenez.",
    goNotebook: "Ouvrir mon carnet",
    comingSoon: "Bientôt",
    quizTitle: "Quiz de Définitions",
    quizDesc: "Associez le mot à son sens",
    fillblankTitle: "Complétez la Phrase",
    fillblankDesc: "Trouvez le mot manquant",
    memoryTitle: "Mémoire",
    memoryDesc: "Associez chaque mot à son sens",
    anagramTitle: "Anagrammes",
    anagramDesc: "Remettez les lettres dans l'ordre",
    speedTitle: "Manche Éclair",
    speedDesc: "Combien de mots en 60 secondes ?",
    exit: "Fermer",
    quizPromptWord: "Que signifie ce mot ?",
    quizPromptMeaning: "Quel mot convient ?",
    fillblankPrompt: "Choisissez le mot manquant",
    anagramPrompt: "Remettez les lettres",
    anagramHint: "Indice :",
    anagramSubmit: "Vérifier",
    anagramReset: "Réinitialiser",
    speedReady: "Prêt ?",
    speedGo: "Go !",
    speedSeconds: (n) => `${n} mots !`,
    memoryFlipPrompt: "Associez chaque mot à son sens — retournez 2 cartes",
    memoryMoves: (n) => `${n} coups`,
    resultPerfect: "Parfait !",
    resultGreat: "Excellent !",
    resultGood: "Bien joué.",
    resultKeepGoing: "Continuez à pratiquer.",
    resultYouMissed: "Mots à revoir",
    resultPlayAgain: "Rejouer",
    resultBackToGames: "Retour aux jeux",
    resultFinalScore: (s) => `${s} points`,
  },
  de: {
    menuTitle: "Wortspiele",
    menuLede: "Schärfe deinen Wortschatz · fünf schnelle Modi",
    streakOne: "1 Tag in Folge",
    streakMany: (n) => `${n} Tage in Folge`,
    bestEver: (n) => `Bestwert: ${n}`,
    notEnoughWords: "Du brauchst erst ein paar Wörter mehr",
    notEnoughHint: "Speichere 4 Wörter im Notizbuch und komm zurück.",
    goNotebook: "Notizbuch öffnen",
    comingSoon: "Bald",
    quizTitle: "Definitions-Quiz",
    quizDesc: "Verbinde Wort mit Bedeutung",
    fillblankTitle: "Lücke füllen",
    fillblankDesc: "Finde das fehlende Wort",
    memoryTitle: "Memory",
    memoryDesc: "Verbinde jedes Wort mit seiner Bedeutung",
    anagramTitle: "Buchstaben-Scramble",
    anagramDesc: "Ordne die Buchstaben mit dem Hinweis",
    speedTitle: "Speed-Runde",
    speedDesc: "Wie viele Wörter in 60 Sekunden?",
    exit: "Schließen",
    quizPromptWord: "Was bedeutet dieses Wort?",
    quizPromptMeaning: "Welches Wort passt?",
    fillblankPrompt: "Wähle das fehlende Wort",
    anagramPrompt: "Ordne die Buchstaben",
    anagramHint: "Hinweis:",
    anagramSubmit: "Prüfen",
    anagramReset: "Zurücksetzen",
    speedReady: "Bereit?",
    speedGo: "Los!",
    speedSeconds: (n) => `${n} Wörter!`,
    memoryFlipPrompt: "Verbinde Wort mit Bedeutung — dreh 2 Karten",
    memoryMoves: (n) => `${n} Züge`,
    resultPerfect: "Perfekt!",
    resultGreat: "Klasse!",
    resultGood: "Gut gemacht.",
    resultKeepGoing: "Weiter üben.",
    resultYouMissed: "Wörter zum Wiederholen",
    resultPlayAgain: "Nochmal spielen",
    resultBackToGames: "Zurück zu den Spielen",
    resultFinalScore: (s) => `${s} Punkte`,
  },
  cs: {
    menuTitle: "Slovní hry",
    menuLede: "Vybrus si slovní zásobu · pět rychlých módů",
    streakOne: "1 den v řadě",
    streakMany: (n) => `${n} dní v řadě`,
    bestEver: (n) => `Rekord: ${n}`,
    notEnoughWords: "Nejdřív budeš potřebovat víc slov",
    notEnoughHint: "Ulož si 4 slova do sešitu a vrať se.",
    goNotebook: "Otevřít sešit",
    comingSoon: "Brzy",
    quizTitle: "Kvíz definic",
    quizDesc: "Spoj slovo s jeho významem",
    fillblankTitle: "Doplň větu",
    fillblankDesc: "Najdi chybějící slovo",
    memoryTitle: "Pexeso",
    memoryDesc: "Spáruj každé slovo s významem",
    anagramTitle: "Přesmyčky",
    anagramDesc: "Sestav slovo podle nápovědy",
    speedTitle: "Rychlé kolo",
    speedDesc: "Kolik slov za 60 sekund?",
    exit: "Zavřít",
    quizPromptWord: "Co znamená toto slovo?",
    quizPromptMeaning: "Které slovo sedí?",
    fillblankPrompt: "Vyber chybějící slovo",
    anagramPrompt: "Seřaď písmena",
    anagramHint: "Nápověda:",
    anagramSubmit: "Zkontrolovat",
    anagramReset: "Reset",
    speedReady: "Připraven?",
    speedGo: "Start!",
    speedSeconds: (n) => `${n} slov!`,
    memoryFlipPrompt: "Spáruj slovo s významem — otoč 2 karty",
    memoryMoves: (n) => `${n} tahů`,
    resultPerfect: "Dokonalé!",
    resultGreat: "Skvělé!",
    resultGood: "Hezky.",
    resultKeepGoing: "Trénuj dál.",
    resultYouMissed: "Slova k opakování",
    resultPlayAgain: "Hrát znovu",
    resultBackToGames: "Zpět ke hrám",
    resultFinalScore: (s) => `${s} bodů`,
  },
};

function LangSwitch() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);
  const active = LANGS.find((l) => l.code === lang) ?? LANGS[1];
  return (
    <div ref={wrapRef} className="wb-lang-chip-wrap">
      <button type="button" className="wb-lang-chip" onClick={() => setOpen((v) => !v)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
        </svg>
        {active.label}
      </button>
      {open && (
        <ul className="wb-lang-menu" role="listbox">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                className={l.code === lang ? "is-active" : ""}
                onClick={() => { setLang(l.code); setOpen(false); }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PlayPage() {
  const { user, plan, loading, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();
  const href = useHref();
  const t = COPY[lang] ?? COPY.en;

  type Stage = { kind: "menu" } | { kind: "playing"; game: GameId };
  const [stage, setStage] = useState<Stage>({ kind: "menu" });
  const [pool, setPool] = useState<PlayWord[] | null>(null);
  const [fetchError, setFetchError] = useState<string>("");
  const [streak, setStreak] = useState(() => getStreak());

  // Auth + tier gate — Deep only.
  //
  // The redirect uses explicit "basic" / "clear" checks (not `plan !== "deep"`)
  // because plan can be undefined for a tick after route navigation while
  // the auth context is rehydrating — `!== "deep"` would bounce a Deep
  // user straight to /pricing in that window. Match Notebook's pattern.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      promptLogin(t.menuTitle);
      return;
    }
    if (plan === "basic" || plan === "clear") {
      router.replace(href("/pricing"));
    }
  }, [loading, user, plan, t.menuTitle, promptLogin, router, href]);

  // Load notebook + hydrate from IDB.
  //
  // Two-stage hydration: (1) sync from IDB so the menu can paint with
  // whatever the user has cached locally; (2) async top-up from the
  // Firestore popular-words cache via /api/quick-define so the Fill-blank
  // game eventually unlocks for users whose notebook came from the
  // popular pack. Stage 2 mutates pool when it returns — fill-blank
  // disabled state in the menu flips to enabled with no user action.
  useEffect(() => {
    if (loading || !user) return;
    if (plan === "basic" || plan === "clear") return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const words = await loadPlayWords(idToken, lang);
        if (cancelled) return;
        setPool(words);
        // Stage 2: fill in missing examples from Firestore cache.
        // Read-only, no OpenAI calls. Runs after first paint.
        const hydrated = await hydrateExamples(words);
        if (!cancelled) setPool(hydrated);
      } catch (e) {
        if (!cancelled) setFetchError(String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [loading, user, plan, lang]);

  // Refresh streak when returning to menu (after a game finishes).
  useEffect(() => {
    if (stage.kind === "menu") setStreak(getStreak());
  }, [stage.kind]);

  const poolWithExamples = useMemo(
    () => (pool ?? []).filter((p) => p.examples.length > 0).length,
    [pool],
  );

  const games: Array<{
    id: GameId;
    title: string;
    desc: string;
    enabled: boolean;
    icon: React.ReactNode;
    accent: string;
  }> = [
    {
      id: "quiz",
      title: t.quizTitle,
      desc: t.quizDesc,
      enabled: (pool?.length ?? 0) >= MIN_WORDS_FOR_GAME.quiz,
      accent: "teal",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" />
          <path d="M12 17v.01" />
        </svg>
      ),
    },
    {
      id: "fillblank",
      title: t.fillblankTitle,
      desc: t.fillblankDesc,
      enabled: poolWithExamples >= MIN_WORDS_FOR_GAME.fillblank,
      accent: "indigo",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h7" />
          <path d="M4 12h16" />
          <path d="M4 17h11" />
        </svg>
      ),
    },
    {
      id: "memory",
      title: t.memoryTitle,
      desc: t.memoryDesc,
      enabled: (pool?.length ?? 0) >= MIN_WORDS_FOR_GAME.memory,
      accent: "purple",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" />
        </svg>
      ),
    },
    {
      id: "anagram",
      title: t.anagramTitle,
      desc: t.anagramDesc,
      enabled: (pool?.length ?? 0) >= MIN_WORDS_FOR_GAME.anagram,
      accent: "amber",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16" />
          <path d="M4 12h10" />
          <path d="M4 18h6" />
          <path d="m17 14 4 4-4 4" />
        </svg>
      ),
    },
    {
      id: "speed",
      title: t.speedTitle,
      desc: t.speedDesc,
      enabled: (pool?.length ?? 0) >= MIN_WORDS_FOR_GAME.speed,
      accent: "rose",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
        </svg>
      ),
    },
  ];

  // ─── Active game stage ─────────────────────────────────────────
  if (stage.kind === "playing" && pool) {
    const exit = () => setStage({ kind: "menu" });
    const props = { pool, onExit: exit, lang, t };
    return (
      <div className="wordbook wb-play-page" dir={dir}>
        {stage.game === "quiz" && <GameQuiz {...props} />}
        {stage.game === "fillblank" && <GameFillBlank {...props} />}
        {stage.game === "memory" && <GameMemory {...props} />}
        {stage.game === "anagram" && <GameAnagram {...props} />}
        {stage.game === "speed" && <GameSpeed {...props} />}
      </div>
    );
  }

  // ─── Menu stage ────────────────────────────────────────────────
  return (
    <div className="wordbook wb-shell-page wb-play-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <nav className="wb-shell-nav">
          <Link
            href={href("/")}
            className="wb-shell-navlink wb-shell-navlink-icon"
            aria-label={v2(lang, "navSearch")}
            title={v2(lang, "navSearch")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4-4" />
            </svg>
          </Link>
          <Link href={href("/notebook")} className="wb-shell-navlink">
            {v2(lang, "navNotebook")}
          </Link>
          <Link href={href("/play")} className="wb-shell-navlink is-active">
            {t.menuTitle}
          </Link>
          <Link href={href("/pricing")} className="wb-shell-navlink">
            {v2(lang, "navPricing")}
          </Link>
        </nav>
        <div className="wb-shell-actions">
          <ShareButton
            url="https://www.gadit.app/"
            title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
            text=""
            shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
            copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
          />
          <LangSwitch />
          {user ? <WbUserMenu /> : null}
        </div>
      </header>

      <main className="wb-play-main">
        <div className="wb-play-hero">
          <h1 className="wb-play-title">{t.menuTitle}</h1>
          <p className="wb-play-lede">{t.menuLede}</p>
          {streak.current > 0 && (
            <div className="wb-play-streak">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13 2c1 3-1 4-1 6 0 2 2 3 2 5 0 3-2 4-2 7 0 1 1 2 1 2s-7-1-7-7c0-2 1-3 1-5 0-3-2-4-2-6 0 0 4 1 5 4 1-2 2-4 3-6Z" />
              </svg>
              <span>
                {streak.current === 1 ? t.streakOne : t.streakMany(streak.current)}
              </span>
              {streak.best > streak.current && (
                <span className="wb-play-streak-best">{t.bestEver(streak.best)}</span>
              )}
            </div>
          )}
        </div>

        {pool === null && !fetchError && (
          <div className="wb-play-loading">…</div>
        )}

        {fetchError && (
          <div className="wb-play-error">{fetchError}</div>
        )}

        {pool && pool.length < 4 && (
          <div className="wb-play-empty">
            <div className="wb-play-empty-title">{t.notEnoughWords}</div>
            <p className="wb-play-empty-hint">{t.notEnoughHint}</p>
            <Link href={href("/notebook")} className="wb-play-empty-cta">
              {t.goNotebook}
            </Link>
          </div>
        )}

        {pool && pool.length >= 4 && (
          <ul className="wb-play-grid">
            {games.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  className={`wb-play-card wb-play-card-${g.accent} ${g.enabled ? "" : "is-disabled"}`}
                  onClick={() => g.enabled && setStage({ kind: "playing", game: g.id })}
                  disabled={!g.enabled}
                >
                  <span className="wb-play-card-icon">{g.icon}</span>
                  <span className="wb-play-card-text">
                    <span className="wb-play-card-title">{g.title}</span>
                    <span className="wb-play-card-desc">{g.desc}</span>
                  </span>
                  {!g.enabled && (
                    <span className="wb-play-card-locked">{t.comingSoon}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href={href("/pricing")}>{v2(lang, "navPricing")}</Link>
        <span>·</span>
        <Link href={href("/privacy")}>Privacy</Link>
        <span>·</span>
        <Link href={href("/terms")}>Terms</Link>
      </footer>
    </div>
  );
}

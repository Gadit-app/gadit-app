"use client";

/**
 * WordGameModal — per-word mini Word-Games session.
 *
 * Opens as a fullscreen overlay from the "משחקי מילים" / "Word games"
 * button on a meaning card. Unlike /play (which runs sessions across
 * the notebook), this modal stays ANCHORED to the current word — every
 * round uses THIS word. Closing returns to the same /word/{X} view.
 *
 * Session shape (2 rounds when both work, fewer otherwise):
 *   Round 1 — Anagram     unscramble THIS word, hint = the meaning
 *   Round 2 — Fill blank  one of THIS word's example sentences, the
 *                         word blanked, 3 distractors from the user's
 *                         notebook in the same language
 *
 * Tier: Deep only — gated at the call site (WordClient handleAction).
 *
 * Distractor source: /api/notebook (which the user already has, no
 * extra OpenAI). If the notebook has fewer than 3 matching-language
 * entries, fill-blank is skipped and the session is anagram-only.
 *
 * Anagram skipped when word length < 3 or > 9 (matches the global
 * /play engine's rule that long words don't anagram well).
 */

import { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

type Lang = "he" | "en" | "ar" | "ru" | "es" | "pt" | "fr" | "de" | "cs" | "sk" | "it" | "ja" | "hi" | "am" | "uk" | "tr" | "pl" | "fa" | "id" | "nl" | "el" | "zu" | "vi" | "fil" | "af" | "sw" | "zh-CN" | "zh-TW" | "ko" | "th" | "bn";

interface NotebookItem {
  word: string;
  language: string;
  meaning: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  word: string;
  language: string;
  meaning: string;
  examples: string[];
}

// ─── Localized strings (inline, 9 langs) ────────────────────────
const COPY: Record<string, {
  title: string;
  loading: string;
  anagramEyebrow: string;
  anagramHintLabel: string;
  anagramReset: string;
  fillblankEyebrow: string;
  fillblankPrompt: string;
  next: string;
  finish: string;
  close: string;
  correct: string;
  wrong: string;
  resultGreat: string;
  resultGood: string;
  resultTryAgain: string;
  scoreLine: (s: number, t: number) => string;
  playAgain: string;
  backToWord: string;
  notEnough: string;
  notEnoughHint: string;
}> = {
  he: {
    title: "משחקים עם המילה",
    loading: "טוען…",
    anagramEyebrow: "סדר את האותיות",
    anagramHintLabel: "רמז:",
    anagramReset: "איפוס",
    fillblankEyebrow: "השלם את המשפט",
    fillblankPrompt: "איזו מילה משלימה את המשפט?",
    next: "הלאה",
    finish: "סיום",
    close: "סגירה",
    correct: "נכון!",
    wrong: "לא בדיוק",
    resultGreat: "כל הכבוד!",
    resultGood: "יפה.",
    resultTryAgain: "אפשר עוד סבב.",
    scoreLine: (s, t) => `${s} מתוך ${t}`,
    playAgain: "שחק שוב",
    backToWord: "חזרה למילה",
    notEnough: "צריך עוד מילים במחברת כדי לפתוח את כל הסבבים",
    notEnoughHint: "פתח עוד 2-3 מילים מהמחברת והסבב ייפתח.",
  },
  en: {
    title: "Games with this word",
    loading: "Loading…",
    anagramEyebrow: "Unscramble the letters",
    anagramHintLabel: "Hint:",
    anagramReset: "Reset",
    fillblankEyebrow: "Fill the blank",
    fillblankPrompt: "Which word completes the sentence?",
    next: "Next",
    finish: "Finish",
    close: "Close",
    correct: "Correct!",
    wrong: "Not quite",
    resultGreat: "Great job!",
    resultGood: "Nice work.",
    resultTryAgain: "Try another round.",
    scoreLine: (s, t) => `${s} out of ${t}`,
    playAgain: "Play again",
    backToWord: "Back to word",
    notEnough: "Save a few more words to your notebook to unlock all rounds",
    notEnoughHint: "Open 2-3 more notebook words and this round will unlock.",
  },
  zu: {
    title: "Imidlalo ngaleli gama",
    loading: "Iyalayisha…",
    anagramEyebrow: "Hlela izinhlamvu kabusha",
    anagramHintLabel: "Ithiphu:",
    anagramReset: "Qala kabusha",
    fillblankEyebrow: "Gcwalisa isikhala",
    fillblankPrompt: "Yiliphi igama eliphelelisa umusho?",
    next: "Okulandelayo",
    finish: "Qeda",
    close: "Vala",
    correct: "Kulungile!",
    wrong: "Cishe wakuthola",
    resultGreat: "Wenze kahle kakhulu!",
    resultGood: "Umsebenzi omuhle.",
    resultTryAgain: "Zama omunye umzuliswano.",
    scoreLine: (s, t) => `${s} kokungu-${t}`,
    playAgain: "Dlala futhi",
    backToWord: "Buyela egameni",
    notEnough: "Gcina amanye amagama ambalwa ebhukwini lakho ukuze uvule yonke imizuliswano",
    notEnoughHint: "Vula amagama angama-2-3 engeziwe ebhukwini bese lo mzuliswano uzovuleka.",
  },
  el: {
    title: "Παιχνίδια με αυτή τη λέξη",
    loading: "Φόρτωση…",
    anagramEyebrow: "Ξεμπέρδεψε τα γράμματα",
    anagramHintLabel: "Υπόδειξη:",
    anagramReset: "Επαναφορά",
    fillblankEyebrow: "Συμπλήρωσε το κενό",
    fillblankPrompt: "Ποια λέξη συμπληρώνει την πρόταση;",
    next: "Επόμενο",
    finish: "Τέλος",
    close: "Κλείσιμο",
    correct: "Σωστό!",
    wrong: "Όχι ακριβώς",
    resultGreat: "Μπράβο!",
    resultGood: "Ωραία δουλειά.",
    resultTryAgain: "Δοκίμασε άλλον έναν γύρο.",
    scoreLine: (s, t) => `${s} από ${t}`,
    playAgain: "Παίξε ξανά",
    backToWord: "Πίσω στη λέξη",
    notEnough: "Αποθήκευσε μερικές λέξεις ακόμη στο τετράδιό σου για να ξεκλειδώσεις όλους τους γύρους",
    notEnoughHint: "Άνοιξε 2-3 λέξεις ακόμη από το τετράδιο και αυτός ο γύρος θα ξεκλειδωθεί.",
  },
  ar: {
    title: "ألعاب مع هذه الكلمة",
    loading: "جارٍ التحميل…",
    anagramEyebrow: "رتب الحروف",
    anagramHintLabel: "تلميح:",
    anagramReset: "إعادة",
    fillblankEyebrow: "املأ الفراغ",
    fillblankPrompt: "أي كلمة تكمل الجملة؟",
    next: "التالي",
    finish: "إنهاء",
    close: "إغلاق",
    correct: "صحيح!",
    wrong: "ليس تمامًا",
    resultGreat: "عمل رائع!",
    resultGood: "جيد.",
    resultTryAgain: "جرب جولة أخرى.",
    scoreLine: (s, t) => `${s} من ${t}`,
    playAgain: "العب مرة أخرى",
    backToWord: "العودة للكلمة",
    notEnough: "احفظ كلمات أخرى في الدفتر لفتح كل الجولات",
    notEnoughHint: "افتح 2-3 كلمات أخرى في الدفتر وستفتح هذه الجولة.",
  },
  ru: {
    title: "Игры с этим словом",
    loading: "Загрузка…",
    anagramEyebrow: "Собери буквы",
    anagramHintLabel: "Подсказка:",
    anagramReset: "Сброс",
    fillblankEyebrow: "Заполни пропуск",
    fillblankPrompt: "Какое слово подходит?",
    next: "Дальше",
    finish: "Готово",
    close: "Закрыть",
    correct: "Верно!",
    wrong: "Мимо",
    resultGreat: "Отлично!",
    resultGood: "Хорошо.",
    resultTryAgain: "Ещё раунд?",
    scoreLine: (s, t) => `${s} из ${t}`,
    playAgain: "Ещё раз",
    backToWord: "К слову",
    notEnough: "Сохрани ещё пару слов, чтобы открыть все раунды",
    notEnoughHint: "Открой 2-3 слова в тетради, этот раунд откроется.",
  },
  es: {
    title: "Juegos con esta palabra",
    loading: "Cargando…",
    anagramEyebrow: "Ordena las letras",
    anagramHintLabel: "Pista:",
    anagramReset: "Reiniciar",
    fillblankEyebrow: "Completa la frase",
    fillblankPrompt: "¿Qué palabra completa la frase?",
    next: "Siguiente",
    finish: "Terminar",
    close: "Cerrar",
    correct: "¡Correcto!",
    wrong: "Casi",
    resultGreat: "¡Muy bien!",
    resultGood: "Buen trabajo.",
    resultTryAgain: "Otra ronda.",
    scoreLine: (s, t) => `${s} de ${t}`,
    playAgain: "Jugar de nuevo",
    backToWord: "Volver a la palabra",
    notEnough: "Guarda más palabras en el cuaderno para desbloquear las rondas",
    notEnoughHint: "Abre 2-3 palabras más del cuaderno y esta ronda se desbloqueará.",
  },
  pt: {
    title: "Jogos com esta palavra",
    loading: "Carregando…",
    anagramEyebrow: "Ordene as letras",
    anagramHintLabel: "Dica:",
    anagramReset: "Reiniciar",
    fillblankEyebrow: "Complete a frase",
    fillblankPrompt: "Qual palavra completa a frase?",
    next: "Próximo",
    finish: "Concluir",
    close: "Fechar",
    correct: "Correto!",
    wrong: "Quase",
    resultGreat: "Ótimo trabalho!",
    resultGood: "Bom trabalho.",
    resultTryAgain: "Outra rodada.",
    scoreLine: (s, t) => `${s} de ${t}`,
    playAgain: "Jogar de novo",
    backToWord: "Voltar à palavra",
    notEnough: "Salve mais palavras no caderno para abrir as rodadas",
    notEnoughHint: "Abra 2-3 palavras do caderno e esta rodada será liberada.",
  },
  fr: {
    title: "Jeux avec ce mot",
    loading: "Chargement…",
    anagramEyebrow: "Remettez les lettres",
    anagramHintLabel: "Indice :",
    anagramReset: "Réinitialiser",
    fillblankEyebrow: "Complétez la phrase",
    fillblankPrompt: "Quel mot complète la phrase ?",
    next: "Suivant",
    finish: "Terminer",
    close: "Fermer",
    correct: "Correct !",
    wrong: "Presque",
    resultGreat: "Bravo !",
    resultGood: "Bien joué.",
    resultTryAgain: "Une autre manche.",
    scoreLine: (s, t) => `${s} sur ${t}`,
    playAgain: "Rejouer",
    backToWord: "Retour au mot",
    notEnough: "Enregistrez plus de mots pour débloquer toutes les manches",
    notEnoughHint: "Ouvrez 2-3 mots de plus dans le carnet pour débloquer.",
  },
  de: {
    title: "Spiele mit diesem Wort",
    loading: "Laden…",
    anagramEyebrow: "Ordne die Buchstaben",
    anagramHintLabel: "Hinweis:",
    anagramReset: "Zurücksetzen",
    fillblankEyebrow: "Lücke füllen",
    fillblankPrompt: "Welches Wort passt?",
    next: "Weiter",
    finish: "Fertig",
    close: "Schließen",
    correct: "Richtig!",
    wrong: "Nicht ganz",
    resultGreat: "Klasse!",
    resultGood: "Gut gemacht.",
    resultTryAgain: "Noch eine Runde.",
    scoreLine: (s, t) => `${s} von ${t}`,
    playAgain: "Nochmal",
    backToWord: "Zum Wort zurück",
    notEnough: "Speichere mehr Wörter im Notizbuch, um alle Runden zu öffnen",
    notEnoughHint: "Öffne 2-3 weitere Wörter im Notizbuch, dann öffnet sich diese Runde.",
  },
  cs: {
    title: "Hry s tímto slovem",
    loading: "Načítám…",
    anagramEyebrow: "Seřaď písmena",
    anagramHintLabel: "Nápověda:",
    anagramReset: "Reset",
    fillblankEyebrow: "Doplň větu",
    fillblankPrompt: "Které slovo doplňuje větu?",
    next: "Dál",
    finish: "Hotovo",
    close: "Zavřít",
    correct: "Správně!",
    wrong: "Skoro",
    resultGreat: "Skvělé!",
    resultGood: "Hezky.",
    resultTryAgain: "Další kolo.",
    scoreLine: (s, t) => `${s} z ${t}`,
    playAgain: "Hrát znovu",
    backToWord: "Zpět ke slovu",
    notEnough: "Ulož víc slov do sešitu, ať se otevřou všechna kola",
    notEnoughHint: "Otevři 2-3 další slova v sešitu a kolo se odemkne.",
  },
  sk: {
    title: "Hry s týmto slovom",
    loading: "Načítavam…",
    anagramEyebrow: "Usporiadaj písmená",
    anagramHintLabel: "Pomôcka:",
    anagramReset: "Reset",
    fillblankEyebrow: "Doplň vetu",
    fillblankPrompt: "Ktoré slovo doplňuje vetu?",
    next: "Ďalej",
    finish: "Hotovo",
    close: "Zavrieť",
    correct: "Správne!",
    wrong: "Takmer",
    resultGreat: "Skvelé!",
    resultGood: "Pekne.",
    resultTryAgain: "Ďalšie kolo.",
    scoreLine: (s, t) => `${s} z ${t}`,
    playAgain: "Hrať znova",
    backToWord: "Späť k slovu",
    notEnough: "Ulož viac slov do zošita, nech sa otvoria všetky kolá",
    notEnoughHint: "Otvor 2-3 ďalšie slová v zošite a kolo sa odomkne.",
  },
  it: {
    title: "Giochi con questa parola",
    loading: "Caricamento…",
    anagramEyebrow: "Riordina le lettere",
    anagramHintLabel: "Indizio:",
    anagramReset: "Reset",
    fillblankEyebrow: "Completa la frase",
    fillblankPrompt: "Quale parola completa la frase?",
    next: "Avanti",
    finish: "Finito",
    close: "Chiudi",
    correct: "Corretto!",
    wrong: "Quasi",
    resultGreat: "Ottimo!",
    resultGood: "Ben fatto.",
    resultTryAgain: "Un altro giro.",
    scoreLine: (s, t) => `${s} su ${t}`,
    playAgain: "Gioca ancora",
    backToWord: "Torna alla parola",
    notEnough: "Salva più parole nel quaderno per sbloccare tutti i giochi",
    notEnoughHint: "Apri 2-3 altre parole nel quaderno e questo gioco si sblocca.",
  },
  ja: {
    title: "この単語のゲーム",
    loading: "読み込み中…",
    anagramEyebrow: "文字を並べ替える",
    anagramHintLabel: "ヒント:",
    anagramReset: "リセット",
    fillblankEyebrow: "文を完成させる",
    fillblankPrompt: "どの単語が文を完成させますか？",
    next: "次へ",
    finish: "終了",
    close: "閉じる",
    correct: "正解！",
    wrong: "おしい",
    resultGreat: "素晴らしい！",
    resultGood: "よくできました。",
    resultTryAgain: "もう一度挑戦。",
    scoreLine: (s, t) => `${t} 中 ${s}`,
    playAgain: "もう一度",
    backToWord: "単語に戻る",
    notEnough: "ノートにもっと単語を保存して、すべてのゲームを解放しましょう",
    notEnoughHint: "ノートにあと2〜3語追加するとこのゲームが解放されます。",
  },
  hi: {
    title: "इस शब्द के लिए खेल",
    loading: "लोड हो रहा है…",
    anagramEyebrow: "अक्षर पुनः क्रमित करें",
    anagramHintLabel: "संकेत:",
    anagramReset: "रीसेट",
    fillblankEyebrow: "वाक्य पूरा करें",
    fillblankPrompt: "वाक्य को कौन सा शब्द पूरा करता है?",
    next: "अगला",
    finish: "ख़त्म",
    close: "बंद करें",
    correct: "सही!",
    wrong: "थोड़ा सा चूक गए",
    resultGreat: "शानदार!",
    resultGood: "बढ़िया।",
    resultTryAgain: "फिर से कोशिश करें।",
    scoreLine: (s, t) => `${t} में से ${s}`,
    playAgain: "फिर से खेलें",
    backToWord: "शब्द पर वापस",
    notEnough: "सभी खेल खोलने के लिए अपनी नोटबुक में और शब्द सहेजें",
    notEnoughHint: "अपनी नोटबुक में 2-3 शब्द और जोड़ें और यह खेल खुल जाएगा।",
  },
  am: {
    title: "ለዚህ ቃል የተዘጋጁ ጨዋታዎች",
    loading: "በመጫን ላይ…",
    anagramEyebrow: "ፊደላቱን መልሰው ደርድሩ",
    anagramHintLabel: "ፍንጭ:",
    anagramReset: "ዳግም አስጀምር",
    fillblankEyebrow: "ዓረፍተ ነገሩን አሟሉ",
    fillblankPrompt: "ዓረፍተ ነገሩን የሚያሟላው የትኛው ቃል ነው?",
    next: "ቀጣይ",
    finish: "ጨርስ",
    close: "ዝጋ",
    correct: "ትክክል!",
    wrong: "ተቃርበዋል",
    resultGreat: "ድንቅ!",
    resultGood: "ጥሩ ሥራ።",
    resultTryAgain: "አንድ ዙር ደግመው ይሞክሩ።",
    scoreLine: (s, t) => `ከ${t} ውስጥ ${s}`,
    playAgain: "እንደገና ተጫወት",
    backToWord: "ወደ ቃሉ ተመለስ",
    notEnough: "ሁሉንም ጨዋታዎች ለመክፈት በማስታወሻ ደብተርዎ ውስጥ ተጨማሪ ቃላት ያስቀምጡ",
    notEnoughHint: "በማስታወሻ ደብተርዎ ላይ 2-3 ተጨማሪ ቃላት ይጨምሩ እና ይህ ጨዋታ ይከፈታል።",
  },
};

// ─── Helpers ────────────────────────────────────────────────────
function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function sample<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}
function splitLetters(word: string): string[] {
  return Array.from(word.trim());
}
// Hebrew/Arabic inseparable prefixes. A word like תום often appears in its
// example only as בתום / לתום / ותום etc.; the bare word-boundary match then
// fails and the old code appended a stray "____" at the end while leaving the
// answer fully visible inside "בתום" (Gadi 2026-08-15, word "תום"). We now
// blank the base word even when it carries a one/two-letter prefix, KEEPING
// the prefix so the sentence stays grammatical ("...פעל ב____ לב"). Returns
// null when the word cannot be cleanly blanked in this sentence.
const BLANK_PREFIX = "בכלמהושאלوبكتفﺍ"; // Hebrew + common Arabic prefixes/article
function blankOne(sentence: string, word: string): string | null {
  if (!word) return null;
  const esc = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const bare = new RegExp(`(?<![\\p{L}\\p{N}])${esc}(?![\\p{L}\\p{N}])`, "iu");
  if (bare.test(sentence)) return sentence.replace(bare, "____");
  const prefixed = new RegExp(
    `(?<![\\p{L}\\p{N}])([${BLANK_PREFIX}]{1,2})${esc}(?![\\p{L}\\p{N}])`,
    "iu",
  );
  if (prefixed.test(sentence)) return sentence.replace(prefixed, "$1____");
  return null;
}
/** First example where the word can be cleanly blanked, already blanked;
 *  null when none of the examples is usable (fill-blank is then skipped). */
function pickBlankSentence(examples: string[], word: string): string | null {
  for (const ex of examples) {
    const b = blankOne(ex, word);
    if (b) return b;
  }
  return null;
}

type TileState = { letter: string; slot: number; id: string };
type Stage = "loading" | "anagram" | "anagram-done" | "fillblank" | "fillblank-done" | "result";

export function WordGameModal({ open, onClose, word, language, meaning, examples }: Props) {
  const { user } = useAuth();
  const { lang, dir } = useLang();
  const c = COPY[lang as Lang] ?? COPY.en;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Distractor pool for fill-blank
  const [distractors, setDistractors] = useState<string[] | null>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [score, setScore] = useState(0);
  const totalRounds = useRef(0);

  // Anagram state
  const letters = useMemo(() => splitLetters(word), [word]);
  const anagramEligible = letters.length >= 3 && letters.length <= 9;
  const [tiles, setTiles] = useState<TileState[]>([]);
  const [anagramResult, setAnagramResult] = useState<"none" | "correct" | "wrong">("none");

  // Fill-blank state. Only eligible when at least one example actually
  // yields a clean blank (word present, prefix-aware) — otherwise the round
  // is skipped rather than rendered broken.
  const [fbOptions, setFbOptions] = useState<string[]>([]);
  const [fbCorrectIdx, setFbCorrectIdx] = useState(0);
  const [fbPicked, setFbPicked] = useState<number | null>(null);
  const fbSentence = useMemo(
    () => pickBlankSentence(examples, word) ?? "",
    [examples, word],
  );
  const fillblankEligible = fbSentence.length > 0;

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Initialize the session on open
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setScore(0);
    setAnagramResult("none");
    setFbPicked(null);

    (async () => {
      // Reset anagram tiles
      if (anagramEligible) {
        const scrambled = shuffleUntilDifferent(letters);
        setTiles(scrambled.map((l, i) => ({ letter: l, slot: -1, id: `t-${i}-${Date.now()}` })));
      }

      // Fetch distractors from notebook (Deep is required by route)
      try {
        if (!user) {
          if (!cancelled) setDistractors([]);
        } else {
          const idToken = await user.getIdToken();
          const res = await fetch("/api/notebook", {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (res.ok) {
            const data = (await res.json()) as { items: NotebookItem[] };
            // Same-language candidates first; fall back to any if too few.
            const same = (data.items ?? [])
              .filter((it) => it.word.toLowerCase() !== word.toLowerCase())
              .filter((it) => normalize(it.language) === normalize(language));
            const any = (data.items ?? [])
              .filter((it) => it.word.toLowerCase() !== word.toLowerCase());
            const pool = same.length >= 3 ? same : any;
            const picks = sample(pool, 3).map((it) => it.word);
            if (!cancelled) setDistractors(picks);
          } else {
            if (!cancelled) setDistractors([]);
          }
        }
      } catch {
        if (!cancelled) setDistractors([]);
      }

      // Decide opening stage
      if (anagramEligible) {
        if (!cancelled) setStage("anagram");
      } else if (fillblankEligible) {
        if (!cancelled) setStage("fillblank");
      } else {
        if (!cancelled) setStage("result");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Build the fill-blank options once distractors arrive AND we're entering that stage
  useEffect(() => {
    if (stage !== "fillblank") return;
    if (!fillblankEligible) return;
    const pool = distractors ?? [];
    // Need at least 3 distractors — pad with placeholder if necessary
    // (rare; user with empty notebook can still see at least 1 option).
    const padded = [...pool];
    while (padded.length < 3) padded.push(""); // empty options just won't be selectable for win
    const filtered = padded.slice(0, 3).filter((w) => w.length > 0);
    const opts = shuffle([word, ...filtered]);
    setFbOptions(opts);
    setFbCorrectIdx(opts.indexOf(word));
    setFbPicked(null);
  }, [stage, distractors, word, fillblankEligible]);

  // Count total rounds for scoring denominator
  useEffect(() => {
    if (stage === "loading") return;
    let n = 0;
    if (anagramEligible) n++;
    if (fillblankEligible && (distractors?.length ?? 0) >= 3) n++;
    totalRounds.current = Math.max(n, 1);
  }, [stage, anagramEligible, fillblankEligible, distractors]);

  // ─── Anagram handlers ─────────────────────────────────────────
  function placeTile(tile: TileState) {
    if (anagramResult !== "none") return;
    if (tile.slot >= 0) return;
    const usedSlots = new Set(tiles.filter((t) => t.slot >= 0).map((t) => t.slot));
    let nextSlot = -1;
    for (let i = 0; i < letters.length; i++) {
      if (!usedSlots.has(i)) { nextSlot = i; break; }
    }
    if (nextSlot < 0) return;
    setTiles((prev) =>
      prev.map((t) => (t.id === tile.id ? { ...t, slot: nextSlot } : t)),
    );
  }
  function unplaceTile(tile: TileState) {
    if (anagramResult !== "none") return;
    setTiles((prev) =>
      prev.map((t) => (t.id === tile.id ? { ...t, slot: -1 } : t)),
    );
  }
  function resetAnagram() {
    if (anagramResult !== "none") return;
    setTiles((prev) => prev.map((t) => ({ ...t, slot: -1 })));
  }

  // Auto-check anagram when slot is full
  useEffect(() => {
    if (stage !== "anagram") return;
    if (anagramResult !== "none") return;
    const placed = tiles.filter((t) => t.slot >= 0).sort((a, b) => a.slot - b.slot);
    if (placed.length !== letters.length) return;
    const guess = placed.map((t) => t.letter).join("");
    if (guess.toLowerCase() === word.toLowerCase()) {
      setAnagramResult("correct");
      setScore((s) => s + 1);
    } else {
      setAnagramResult("wrong");
    }
    // Move to next stage after a reveal pause
    setTimeout(() => {
      if (fillblankEligible && (distractors?.length ?? 0) >= 3) setStage("fillblank");
      else setStage("result");
    }, 1200);
  }, [tiles, stage, anagramResult, letters, word, fillblankEligible, distractors]);

  // ─── Fill-blank handlers ──────────────────────────────────────
  function pickFb(i: number) {
    if (fbPicked !== null) return;
    setFbPicked(i);
    if (i === fbCorrectIdx) setScore((s) => s + 1);
    setTimeout(() => setStage("result"), 1100);
  }

  // ─── Reset for "play again" ───────────────────────────────────
  function replay() {
    setScore(0);
    setAnagramResult("none");
    setFbPicked(null);
    if (anagramEligible) {
      const scrambled = shuffleUntilDifferent(letters);
      setTiles(scrambled.map((l, i) => ({ letter: l, slot: -1, id: `t-${i}-${Date.now()}` })));
      setStage("anagram");
    } else if (fillblankEligible) {
      setStage("fillblank");
    } else {
      setStage("result");
    }
  }

  if (!open || !mounted) return null;

  // Slots row data
  const slotsRow = anagramEligible
    ? Array.from({ length: letters.length }, (_, i) => {
        const tile = tiles.find((t) => t.slot === i);
        return { i, tile };
      })
    : [];
  const tray = tiles.filter((t) => t.slot < 0);

  return createPortal(
    <div className="wordbook wb-wgm-overlay" dir={dir} role="dialog" aria-modal="true" aria-label={c.title}>
      <div className="wb-wgm-sheet">
        <header className="wb-wgm-header">
          <button type="button" className="wb-wgm-close" onClick={onClose} aria-label={c.close}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="wb-wgm-header-title">
            {c.title}
            <span className="wb-wgm-header-word" lang={detectLangCode(language)}>· {word}</span>
          </div>
          <div className="wb-wgm-header-spacer" />
        </header>

        <main className="wb-wgm-body">
          {stage === "loading" && (
            <div className="wb-wgm-loading">{c.loading}</div>
          )}

          {stage === "anagram" && anagramEligible && (
            <>
              <div className="wb-wgm-eyebrow">{c.anagramEyebrow}</div>
              <div className="wb-wgm-hint">
                <span className="wb-wgm-hint-label">{c.anagramHintLabel}</span>
                <span className="wb-wgm-hint-text">{meaning}</span>
              </div>
              <div className={`wb-wgm-slots is-${anagramResult}`}>
                {slotsRow.map(({ i, tile }) => (
                  <button
                    key={i}
                    type="button"
                    className={`wb-wgm-slot ${tile ? "is-filled" : ""}`}
                    onClick={() => tile && unplaceTile(tile)}
                    disabled={!tile || anagramResult !== "none"}
                  >
                    {tile?.letter ?? ""}
                  </button>
                ))}
              </div>
              <div className="wb-wgm-tray">
                {tray.map((tile) => (
                  <button
                    key={tile.id}
                    type="button"
                    className="wb-wgm-tile"
                    onClick={() => placeTile(tile)}
                    disabled={anagramResult !== "none"}
                  >
                    {tile.letter}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="wb-wgm-reset"
                onClick={resetAnagram}
                disabled={anagramResult !== "none"}
              >
                {c.anagramReset}
              </button>
            </>
          )}

          {stage === "fillblank" && fillblankEligible && fbOptions.length > 0 && (
            <>
              <div className="wb-wgm-eyebrow">{c.fillblankEyebrow}</div>
              <div className="wb-wgm-prompt">{c.fillblankPrompt}</div>
              <div className="wb-wgm-sentence">
                {fbSentence.split("____").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className={`wb-wgm-blank ${fbPicked !== null ? "is-revealed" : ""}`}>
                        {fbPicked !== null ? word : ""}
                      </span>
                    )}
                  </span>
                ))}
              </div>
              <div className="wb-wgm-options">
                {fbOptions.map((opt, i) => {
                  let cls = "wb-wgm-option";
                  if (fbPicked !== null) {
                    if (i === fbCorrectIdx) cls += " is-correct";
                    else if (i === fbPicked) cls += " is-wrong";
                    else cls += " is-dimmed";
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      className={cls}
                      onClick={() => pickFb(i)}
                      disabled={fbPicked !== null}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {stage === "result" && (
            <div className="wb-wgm-result">
              <div className="wb-wgm-result-headline">
                {score === totalRounds.current ? c.resultGreat
                  : score > 0 ? c.resultGood
                  : c.resultTryAgain}
              </div>
              <div className="wb-wgm-result-score">
                <span className="wb-wgm-result-num">{score}</span>
                <span className="wb-wgm-result-denom">/{totalRounds.current}</span>
              </div>
              <div className="wb-wgm-result-line">{c.scoreLine(score, totalRounds.current)}</div>
              {!(anagramEligible && fillblankEligible) && (
                <div className="wb-wgm-result-notice">
                  <div className="wb-wgm-result-notice-title">{c.notEnough}</div>
                  <div className="wb-wgm-result-notice-hint">{c.notEnoughHint}</div>
                </div>
              )}
              <div className="wb-wgm-result-actions">
                <button type="button" className="wb-wgm-cta-primary" onClick={replay}>
                  {c.playAgain}
                </button>
                <button type="button" className="wb-wgm-cta-ghost" onClick={onClose}>
                  {c.backToWord}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>,
    document.body,
  );
}

function shuffleUntilDifferent(letters: string[]): string[] {
  // Try a few shuffles so a 3-letter word doesn't sometimes start in
  // its correct order (which would feel anticlimactic).
  let attempts = 0;
  let scrambled = shuffle(letters);
  while (scrambled.join("") === letters.join("") && attempts < 5) {
    scrambled = shuffle(letters);
    attempts++;
  }
  return scrambled;
}

function normalize(s: string): string {
  return (s ?? "").toLowerCase().trim();
}

function detectLangCode(language: string): string | undefined {
  const n = normalize(language);
  if (n.includes("hebrew") || n.includes("עברית")) return "he";
  if (n.includes("english")) return "en";
  if (n.includes("arabic") || n.includes("العربية")) return "ar";
  if (n.includes("russian") || n.includes("русский")) return "ru";
  if (n.includes("spanish") || n.includes("español")) return "es";
  if (n.includes("portuguese") || n.includes("português")) return "pt";
  if (n.includes("french") || n.includes("français")) return "fr";
  if (n.includes("german") || n.includes("deutsch")) return "de";
  if (n.includes("czech") || n.includes("čeština") || n.includes("cestina")) return "cs";
  return undefined;
}

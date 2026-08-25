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

type Lang = "he" | "en" | "ar" | "ru" | "es" | "pt" | "fr" | "de" | "cs" | "sk" | "it" | "ja" | "hi" | "am" | "uk" | "tr" | "pl" | "fa" | "id" | "nl" | "el" | "zu" | "vi" | "fil" | "af" | "sw" | "zh-CN" | "zh-TW" | "ko" | "th" | "bn" | "da" | "hu";

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
  uk: { title: "Ігри з цим словом", loading: "Завантаження…", anagramEyebrow: "Склади літери", anagramHintLabel: "Підказка:", anagramReset: "Скинути", fillblankEyebrow: "Заповни пропуск", fillblankPrompt: "Яке слово завершує речення?", next: "Далі", finish: "Завершити", close: "Закрити", correct: "Правильно!", wrong: "Не зовсім", resultGreat: "Чудова робота!", resultGood: "Гарно.", resultTryAgain: "Спробуй ще раунд.", playAgain: "Грати знову", backToWord: "Назад до слова", notEnough: "Збережи ще кілька слів у зошит, щоб відкрити всі раунди", notEnoughHint: "Відкрий ще 2-3 слова із зошита, і цей раунд відкриється.", scoreLine: (s, t) => `${s} з ${t}` },
  tr: { title: "Bu kelimeyle oyunlar", loading: "Yükleniyor…", anagramEyebrow: "Harfleri sırala", anagramHintLabel: "İpucu:", anagramReset: "Sıfırla", fillblankEyebrow: "Boşluğu doldur", fillblankPrompt: "Cümleyi hangi kelime tamamlıyor?", next: "İleri", finish: "Bitir", close: "Kapat", correct: "Doğru!", wrong: "Tam değil", resultGreat: "Harika iş!", resultGood: "Güzel.", resultTryAgain: "Bir tur daha dene.", playAgain: "Tekrar oyna", backToWord: "Kelimeye dön", notEnough: "Tüm turların açılması için deftere birkaç kelime daha kaydet", notEnoughHint: "Defterden 2-3 kelime daha aç, bu tur açılacak.", scoreLine: (s, t) => `${t} üzerinden ${s}` },
  pl: { title: "Gry z tym słowem", loading: "Ładowanie…", anagramEyebrow: "Ułóż litery", anagramHintLabel: "Podpowiedź:", anagramReset: "Zresetuj", fillblankEyebrow: "Uzupełnij lukę", fillblankPrompt: "Które słowo uzupełnia zdanie?", next: "Dalej", finish: "Zakończ", close: "Zamknij", correct: "Dobrze!", wrong: "Nie do końca", resultGreat: "Świetna robota!", resultGood: "Ładnie.", resultTryAgain: "Spróbuj kolejną rundę.", playAgain: "Zagraj ponownie", backToWord: "Wróć do słowa", notEnough: "Zapisz jeszcze kilka słów w zeszycie, aby odblokować wszystkie rundy", notEnoughHint: "Otwórz jeszcze 2-3 słowa z zeszytu, a ta runda się odblokuje.", scoreLine: (s, t) => `${s} z ${t}` },
  fa: { title: "بازی با این کلمه", loading: "در حال بارگذاری…", anagramEyebrow: "حروف را مرتب کن", anagramHintLabel: "راهنمایی:", anagramReset: "بازنشانی", fillblankEyebrow: "جای خالی را پر کن", fillblankPrompt: "کدام کلمه جمله را کامل می‌کند؟", next: "بعدی", finish: "پایان", close: "بستن", correct: "درست است!", wrong: "نه دقیقاً", resultGreat: "آفرین!", resultGood: "خوب بود.", resultTryAgain: "یک دور دیگر امتحان کن.", playAgain: "دوباره بازی کن", backToWord: "بازگشت به کلمه", notEnough: "چند کلمهٔ دیگر در دفترچه ذخیره کن تا همهٔ دورها باز شوند", notEnoughHint: "2-3 کلمهٔ دیگر از دفترچه باز کن تا این دور باز شود.", scoreLine: (s, t) => `${s} از ${t}` },
  id: { title: "Permainan dengan kata ini", loading: "Memuat…", anagramEyebrow: "Susun hurufnya", anagramHintLabel: "Petunjuk:", anagramReset: "Atur ulang", fillblankEyebrow: "Isi bagian kosong", fillblankPrompt: "Kata mana yang melengkapi kalimat?", next: "Lanjut", finish: "Selesai", close: "Tutup", correct: "Benar!", wrong: "Belum tepat", resultGreat: "Kerja bagus!", resultGood: "Bagus.", resultTryAgain: "Coba ronde lagi.", playAgain: "Main lagi", backToWord: "Kembali ke kata", notEnough: "Simpan beberapa kata lagi ke buku catatan untuk membuka semua ronde", notEnoughHint: "Buka 2-3 kata lagi dari buku catatan dan ronde ini akan terbuka.", scoreLine: (s, t) => `${s} dari ${t}` },
  nl: { title: "Spelletjes met dit woord", loading: "Laden…", anagramEyebrow: "Zet de letters op volgorde", anagramHintLabel: "Tip:", anagramReset: "Opnieuw", fillblankEyebrow: "Vul in", fillblankPrompt: "Welk woord maakt de zin af?", next: "Volgende", finish: "Klaar", close: "Sluiten", correct: "Goed!", wrong: "Net niet", resultGreat: "Goed gedaan!", resultGood: "Netjes.", resultTryAgain: "Probeer nog een ronde.", playAgain: "Speel opnieuw", backToWord: "Terug naar het woord", notEnough: "Bewaar nog een paar woorden in je schrift om alle rondes te openen", notEnoughHint: "Open nog 2-3 woorden uit je schrift en deze ronde gaat open.", scoreLine: (s, t) => `${s} van ${t}` },
  vi: { title: "Trò chơi với từ này", loading: "Đang tải…", anagramEyebrow: "Sắp xếp các chữ cái", anagramHintLabel: "Gợi ý:", anagramReset: "Đặt lại", fillblankEyebrow: "Điền vào chỗ trống", fillblankPrompt: "Từ nào hoàn thành câu?", next: "Tiếp", finish: "Kết thúc", close: "Đóng", correct: "Đúng rồi!", wrong: "Chưa đúng", resultGreat: "Làm tốt lắm!", resultGood: "Tốt lắm.", resultTryAgain: "Thử một vòng nữa nhé.", playAgain: "Chơi lại", backToWord: "Quay lại từ", notEnough: "Lưu thêm vài từ vào sổ tay để mở khóa tất cả các vòng", notEnoughHint: "Mở thêm 2-3 từ trong sổ tay và vòng này sẽ mở khóa.", scoreLine: (s, t) => `${s} trên ${t}` },
  fil: { title: "Mga laro sa salitang ito", loading: "Naglo-load…", anagramEyebrow: "Ayusin ang mga letra", anagramHintLabel: "Pahiwatig:", anagramReset: "I-reset", fillblankEyebrow: "Punan ang patlang", fillblankPrompt: "Aling salita ang bumubuo sa pangungusap?", next: "Susunod", finish: "Tapusin", close: "Isara", correct: "Tama!", wrong: "Hindi masyado", resultGreat: "Magaling!", resultGood: "Ang galing.", resultTryAgain: "Subukan ang isa pang round.", playAgain: "Maglaro ulit", backToWord: "Balik sa salita", notEnough: "Mag-save pa ng ilang salita sa iyong notebook para ma-unlock ang lahat ng round", notEnoughHint: "Magbukas pa ng 2-3 salita sa notebook at mabubuksan ang round na ito.", scoreLine: (s, t) => `${s} sa ${t}` },
  af: { title: "Speletjies met hierdie woord", loading: "Laai tans…", anagramEyebrow: "Rangskik die letters", anagramHintLabel: "Wenk:", anagramReset: "Herstel", fillblankEyebrow: "Vul die leemte in", fillblankPrompt: "Watter woord voltooi die sin?", next: "Volgende", finish: "Klaar", close: "Maak toe", correct: "Korrek!", wrong: "Amper", resultGreat: "Goed gedaan!", resultGood: "Mooi.", resultTryAgain: "Probeer nog 'n rondte.", playAgain: "Speel weer", backToWord: "Terug na woord", notEnough: "Stoor nog 'n paar woorde in jou boekie om al die rondtes oop te sluit", notEnoughHint: "Maak nog 2-3 woorde uit jou boekie oop en hierdie rondte sluit oop.", scoreLine: (s, t) => `${s} uit ${t}` },
  sw: { title: "Michezo na neno hili", loading: "Inapakia…", anagramEyebrow: "Panga herufi", anagramHintLabel: "Kidokezo:", anagramReset: "Weka upya", fillblankEyebrow: "Jaza pengo", fillblankPrompt: "Neno gani linakamilisha sentensi?", next: "Endelea", finish: "Maliza", close: "Funga", correct: "Sahihi!", wrong: "Si sawa kabisa", resultGreat: "Kazi nzuri!", resultGood: "Vizuri.", resultTryAgain: "Jaribu raundi nyingine.", playAgain: "Cheza tena", backToWord: "Rudi kwenye neno", notEnough: "Hifadhi maneno machache zaidi kwenye daftari lako ili kufungua raundi zote", notEnoughHint: "Fungua maneno 2-3 zaidi kutoka daftarini na raundi hii itafunguka.", scoreLine: (s, t) => `${s} kati ya ${t}` },
  "zh-CN": { title: "用这个词玩游戏", loading: "加载中…", anagramEyebrow: "把字母排好", anagramHintLabel: "提示：", anagramReset: "重置", fillblankEyebrow: "填空", fillblankPrompt: "哪个词能补全句子？", next: "下一个", finish: "完成", close: "关闭", correct: "正确！", wrong: "还差一点", resultGreat: "太棒了！", resultGood: "做得不错。", resultTryAgain: "再来一轮吧。", playAgain: "再玩一次", backToWord: "返回单词", notEnough: "在笔记本里再存几个词，就能解锁所有回合", notEnoughHint: "再从笔记本打开 2-3 个词，这一回合就会解锁。", scoreLine: (s, t) => `${t} 中答对 ${s}` },
  "zh-TW": { title: "用這個詞玩遊戲", loading: "載入中…", anagramEyebrow: "把字母排好", anagramHintLabel: "提示：", anagramReset: "重設", fillblankEyebrow: "填空", fillblankPrompt: "哪個詞能補全句子？", next: "下一個", finish: "完成", close: "關閉", correct: "正確！", wrong: "還差一點", resultGreat: "太棒了！", resultGood: "做得很好。", resultTryAgain: "再來一輪吧。", playAgain: "再玩一次", backToWord: "返回單字", notEnough: "在筆記本裡再存幾個詞，就能解鎖所有回合", notEnoughHint: "再從筆記本打開 2-3 個詞，這一回合就會解鎖。", scoreLine: (s, t) => `${t} 中答對 ${s}` },
  ko: { title: "이 단어로 하는 게임", loading: "불러오는 중…", anagramEyebrow: "글자를 순서대로 맞춰요", anagramHintLabel: "힌트:", anagramReset: "초기화", fillblankEyebrow: "빈칸 채우기", fillblankPrompt: "어떤 단어가 문장을 완성할까요?", next: "다음", finish: "끝내기", close: "닫기", correct: "정답!", wrong: "아쉬워요", resultGreat: "잘했어요!", resultGood: "좋아요.", resultTryAgain: "한 판 더 해봐요.", playAgain: "다시 하기", backToWord: "단어로 돌아가기", notEnough: "모든 판을 열려면 단어장에 단어를 몇 개 더 저장하세요", notEnoughHint: "단어장에서 2-3개를 더 열면 이 판이 열려요.", scoreLine: (s, t) => `${t}개 중 ${s}개` },
  th: { title: "เกมกับคำนี้", loading: "กำลังโหลด…", anagramEyebrow: "เรียงตัวอักษร", anagramHintLabel: "คำใบ้:", anagramReset: "รีเซ็ต", fillblankEyebrow: "เติมคำในช่องว่าง", fillblankPrompt: "คำไหนเติมประโยคให้สมบูรณ์?", next: "ถัดไป", finish: "เสร็จ", close: "ปิด", correct: "ถูกต้อง!", wrong: "ยังไม่ใช่", resultGreat: "เก่งมาก!", resultGood: "ดีมาก", resultTryAgain: "ลองอีกรอบนะ", playAgain: "เล่นอีกครั้ง", backToWord: "กลับไปที่คำ", notEnough: "บันทึกคำเพิ่มอีกสองสามคำในสมุดเพื่อปลดล็อกทุกรอบ", notEnoughHint: "เปิดคำในสมุดอีก 2-3 คำ แล้วรอบนี้จะปลดล็อก", scoreLine: (s, t) => `${s} จาก ${t}` },
  bn: { title: "এই শব্দ নিয়ে খেলা", loading: "লোড হচ্ছে…", anagramEyebrow: "অক্ষরগুলো সাজাও", anagramHintLabel: "ইঙ্গিত:", anagramReset: "রিসেট", fillblankEyebrow: "শূন্যস্থান পূরণ করো", fillblankPrompt: "কোন শব্দটি বাক্যটি সম্পূর্ণ করে?", next: "পরবর্তী", finish: "শেষ", close: "বন্ধ করো", correct: "ঠিক!", wrong: "একদম নয়", resultGreat: "দারুণ হয়েছে!", resultGood: "বেশ ভালো।", resultTryAgain: "আরেক দফা চেষ্টা করো।", playAgain: "আবার খেলো", backToWord: "শব্দে ফিরে যাও", notEnough: "সব দফা খুলতে খাতায় আরও কয়েকটি শব্দ সংরক্ষণ করো", notEnoughHint: "খাতা থেকে আরও 2-3টি শব্দ খোলো, এই দফাটি খুলে যাবে।", scoreLine: (s, t) => `${t}-এর মধ্যে ${s}` },
  da: { title: "Spil med dette ord", loading: "Indlæser…", anagramEyebrow: "Sæt bogstaverne i rækkefølge", anagramHintLabel: "Tip:", anagramReset: "Nulstil", fillblankEyebrow: "Udfyld det tomme felt", fillblankPrompt: "Hvilket ord gør sætningen færdig?", next: "Næste", finish: "Afslut", close: "Luk", correct: "Rigtigt!", wrong: "Ikke helt", resultGreat: "Godt gået!", resultGood: "Flot.", resultTryAgain: "Prøv en runde til.", playAgain: "Spil igen", backToWord: "Tilbage til ordet", notEnough: "Gem et par ord mere i din notesbog for at låse alle runder op", notEnoughHint: "Åbn 2-3 ord mere fra notesbogen, så låses denne runde op.", scoreLine: (s, t) => `${s} ud af ${t}` },
  hu: { title: "Játékok ezzel a szóval", loading: "Betöltés…", anagramEyebrow: "Rakd sorba a betűket", anagramHintLabel: "Tipp:", anagramReset: "Visszaállítás", fillblankEyebrow: "Töltsd ki a hiányzó részt", fillblankPrompt: "Melyik szó egészíti ki a mondatot?", next: "Tovább", finish: "Befejezés", close: "Bezárás", correct: "Helyes!", wrong: "Nem egészen", resultGreat: "Szép munka!", resultGood: "Ügyes.", resultTryAgain: "Próbálj még egy kört.", playAgain: "Új játék", backToWord: "Vissza a szóhoz", notEnough: "Ments el még néhány szót a füzetbe, hogy minden kör feloldódjon", notEnoughHint: "Nyiss meg még 2-3 szót a füzetből, és ez a kör feloldódik.", scoreLine: (s, t) => `${t}-ből ${s}` },
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

  // Kids gamification v2: reaching "result" having done well on THIS word's
  // games proves comprehension, so mark it understood + award points (same
  // multiplier as a passed quiz). Best effort + non-blocking; the endpoint is
  // idempotent per word, and a 60% bar keeps a single lucky round from
  // counting. See /api/notebook/understood.
  useEffect(() => {
    if (stage !== "result" || !user || !word || !language) return;
    const total = totalRounds.current || 1;
    if (score / total < 0.6) return;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        await fetch("/api/notebook/understood", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ word, language, source: "game" }),
        });
        // Points may have crossed a rank threshold that unlocks a new skin;
        // drop the picker's cached rank so it refetches fresh next mount.
        try { sessionStorage.removeItem("gadit-kid-rankindex"); } catch { /* ignore */ }
      } catch { /* comprehension credit is best-effort */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

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

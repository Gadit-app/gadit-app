"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { KidsCelebration } from "@/components/design/KidsCelebration";
import { TTSButton } from "@/components/design/TTSButton";
import { ClassProgressChip, type ClassProgress } from "@/components/design/ClassMilestone";
import type { WordSet, SetItem, SetDiagram } from "@/lib/word-sets";
import { NiqqudProvider, NiqqudToggle, useNiqqud } from "@/lib/niqqud-display";
import { useAuth } from "@/lib/auth-context";
import { isPilotTopicId } from "@/lib/pilot-topics";
import { isSchoolSetId } from "@/lib/school-set-ids";

/**
 * The teacher's projector screen for a word-set word (Gadi 2026-10-03:
 * "the highest, most premium level"). Full screen, readable from the back
 * row: the word, its curriculum definition and its picture are always on
 * screen, and three big buttons open whole-class activities:
 *   - Examples: sentences revealed one at a time, the word highlighted;
 *   - Class quiz: 3 questions, 4 big answer tiles the teacher taps for
 *     the class;
 *   - Class game: "true or false" statements against a 10-second ring.
 * The teacher plays with the whole class until the word is understood;
 * a full score ends in fireworks. Activities come from /api/class-activity
 * (generated once per curriculum word, cached).
 */

type QuizItem = { q: string; options: string[]; answer: number; explain: string };
type GameItem = { s: string; t: boolean; explain: string };
type Activity = { quiz: QuizItem[]; game: GameItem[] };
/** The class activity handed in directly (content review preview). */
export type ClassroomActivity = Activity;
type Panel = null | "examples" | "quiz" | "game" | "diagram";
/** A Gemara quote approved by the expert, stored with its meaning (phase B). */
export type ClassroomQuote = { text: string; tractate: string; daf: string; amud: string };

const COPY = {
  he: {
    wordOf: (i: number, n: number) => `מילה ${i} מתוך ${n}`,
    examples: "דוגמאות", quiz: "חידון לכיתה", game: "משחק לכיתה",
    nextExample: "הדוגמה הבאה",
    learnEx: "דוגמה ללימוד", fromGemara: "מן הגמרא",
    diagram: "תרשים", diagramTag: "תרשים ללימוד",
    source: (q: ClassroomQuote) => `מסכת ${q.tractate} דף ${q.daf} עמוד ${q.amud}`,
    question: (i: number, n: number) => `שאלה ${i} מתוך ${n}`,
    statement: (i: number, n: number) => `משפט ${i} מתוך ${n}`,
    nextQ: "השאלה הבאה", nextS: "המשפט הבא", toSummary: "לסיכום",
    tf: "נכון או לא נכון?", yes: "נכון", no: "לא נכון",
    timeUp: "הזמן נגמר. מה אתם אומרים?",
    correct: "נכון!", wrong: "לא בדיוק",
    score: (s: number, t: number) => `עניתם נכון על ${s} מתוך ${t}`,
    great: "כל הכבוד! הבנתם את המילה",
    almost: "כמעט! בואו נעבור על המילה שוב",
    again: "שוב", nextWord: "למילה הבאה", done: "סיום", close: "סגירה",
    preparing: "מכינים את הפעילות...",
    failed: "לא הצלחנו להכין את הפעילות.", retry: "לנסות שוב",
    preparingPic: "מכינים תמונה...",
    search: "חיפוש במילון", searchPh: "מילה לפירוש מול הכיתה",
    exit: "יציאה ממצב הצגה", prev: "המילה הקודמת", next: "המילה הבאה", listen: "השמעה",
    letters: ["א", "ב", "ג", "ד"],
  },
  en: {
    wordOf: (i: number, n: number) => `Word ${i} of ${n}`,
    examples: "Examples", quiz: "Class quiz", game: "Class game",
    nextExample: "Next example",
    learnEx: "Learning example", fromGemara: "From the Gemara",
    diagram: "Diagram", diagramTag: "Learning diagram",
    source: (q: ClassroomQuote) => `Tractate ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Question ${i} of ${n}`,
    statement: (i: number, n: number) => `Statement ${i} of ${n}`,
    nextQ: "Next question", nextS: "Next statement", toSummary: "See results",
    tf: "True or false?", yes: "True", no: "False",
    timeUp: "Time's up. What do you say?",
    correct: "Correct!", wrong: "Not quite",
    score: (s: number, t: number) => `You got ${s} of ${t} right`,
    great: "Well done! You understood the word",
    almost: "Almost! Let's go over the word again",
    again: "Again", nextWord: "Next word", done: "Done", close: "Close",
    preparing: "Preparing the activity...",
    failed: "We couldn't prepare the activity.", retry: "Try again",
    preparingPic: "Preparing a picture...",
    search: "Dictionary", searchPh: "A word to explain to the class",
    exit: "Exit present mode", prev: "Previous word", next: "Next word", listen: "Listen",
    letters: ["A", "B", "C", "D"],
  },
  ar: {
    wordOf: (i: number, n: number) => `كلمة ${i} من ${n}`,
    examples: "أمثلة", quiz: "اختبار للصف", game: "لعبة للصف",
    nextExample: "المثال التالي",
    learnEx: "مثال تعليمي", fromGemara: "من الغمارا",
    diagram: "مخطط", diagramTag: "مخطط تعليمي",
    source: (q: ClassroomQuote) => `مسيخت ${q.tractate}، ورقة ${q.daf}، صفحة ${q.amud}`,
    question: (i: number, n: number) => `سؤال ${i} من ${n}`,
    statement: (i: number, n: number) => `جملة ${i} من ${n}`,
    nextQ: "السؤال التالي", nextS: "الجملة التالية", toSummary: "إلى النتيجة",
    tf: "صحيح أم خطأ؟", yes: "صحيح", no: "خطأ",
    timeUp: "انتهى الوقت. ما رأيكم؟",
    correct: "صحيح!", wrong: "ليس تمامًا",
    score: (s: number, t: number) => `أجبتم إجابة صحيحة عن ${s} من ${t}`,
    great: "أحسنتم! فهمتم الكلمة",
    almost: "اقتربتم! لنراجع الكلمة مرة أخرى",
    again: "مرة أخرى", nextWord: "الكلمة التالية", done: "إنهاء", close: "إغلاق",
    preparing: "نحضّر النشاط...",
    failed: "لم نتمكن من تحضير النشاط.", retry: "حاول مرة أخرى",
    preparingPic: "نحضّر صورة...",
    search: "بحث في القاموس", searchPh: "كلمة لشرحها أمام الصف",
    exit: "الخروج من وضع العرض", prev: "الكلمة السابقة", next: "الكلمة التالية", listen: "استماع",
    letters: ["أ", "ب", "ج", "د"],
  },
};

/** The other UI languages (2026-10-18): a set in one of them is projected
 *  with its own copy. Spoken to the whole class, in the plural. */
const COPY_MORE: Record<string, C> = {
  ru: {
    wordOf: (i: number, n: number) => `Слово ${i} из ${n}`,
    examples: "Примеры", quiz: "Викторина для класса", game: "Игра для класса",
    nextExample: "Следующий пример",
    learnEx: "Учебный пример", fromGemara: "Из Гемары",
    diagram: "Схема", diagramTag: "Учебная схема",
    source: (q: ClassroomQuote) => `Трактат ${q.tractate}, даф ${q.daf}, амуд ${q.amud}`,
    question: (i: number, n: number) => `Вопрос ${i} из ${n}`,
    statement: (i: number, n: number) => `Утверждение ${i} из ${n}`,
    nextQ: "Следующий вопрос", nextS: "Следующее утверждение", toSummary: "К итогам",
    tf: "Верно или неверно?", yes: "Верно", no: "Неверно",
    timeUp: "Время вышло. Что скажете?",
    correct: "Верно!", wrong: "Не совсем",
    score: (s: number, t: number) => `Вы правильно ответили на ${s} из ${t}`,
    great: "Молодцы! Вы поняли слово",
    almost: "Почти! Давайте ещё раз разберём слово",
    again: "Ещё раз", nextWord: "Следующее слово", done: "Готово", close: "Закрыть",
    preparing: "Готовим задание...",
    failed: "Не удалось подготовить задание.", retry: "Попробовать снова",
    preparingPic: "Готовим картинку...",
    search: "Словарь", searchPh: "Слово, которое нужно объяснить классу",
    exit: "Выйти из режима показа", prev: "Предыдущее слово", next: "Следующее слово", listen: "Слушать",
    letters: ["А", "Б", "В", "Г"],
  },
  es: {
    wordOf: (i: number, n: number) => `Palabra ${i} de ${n}`,
    examples: "Ejemplos", quiz: "Quiz de la clase", game: "Juego de la clase",
    nextExample: "Siguiente ejemplo",
    learnEx: "Ejemplo para aprender", fromGemara: "De la Guemará",
    diagram: "Diagrama", diagramTag: "Diagrama para aprender",
    source: (q: ClassroomQuote) => `Tratado ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Pregunta ${i} de ${n}`,
    statement: (i: number, n: number) => `Afirmación ${i} de ${n}`,
    nextQ: "Siguiente pregunta", nextS: "Siguiente afirmación", toSummary: "Ver resultados",
    tf: "¿Verdadero o falso?", yes: "Verdadero", no: "Falso",
    timeUp: "Se acabó el tiempo. ¿Qué dicen?",
    correct: "¡Correcto!", wrong: "No exactamente",
    score: (s: number, t: number) => `Respondieron bien ${s} de ${t}`,
    great: "¡Muy bien! Entendieron la palabra",
    almost: "¡Casi! Repasemos la palabra otra vez",
    again: "Otra vez", nextWord: "Siguiente palabra", done: "Terminar", close: "Cerrar",
    preparing: "Preparando la actividad...",
    failed: "No pudimos preparar la actividad.", retry: "Intentar de nuevo",
    preparingPic: "Preparando una imagen...",
    search: "Diccionario", searchPh: "Una palabra para explicar a la clase",
    exit: "Salir del modo presentación", prev: "Palabra anterior", next: "Palabra siguiente", listen: "Escuchar",
    letters: ["A", "B", "C", "D"],
  },
  pt: {
    wordOf: (i: number, n: number) => `Palavra ${i} de ${n}`,
    examples: "Exemplos", quiz: "Quiz da turma", game: "Jogo da turma",
    nextExample: "Próximo exemplo",
    learnEx: "Exemplo para aprender", fromGemara: "Da Guemará",
    diagram: "Diagrama", diagramTag: "Diagrama para aprender",
    source: (q: ClassroomQuote) => `Tratado ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Pergunta ${i} de ${n}`,
    statement: (i: number, n: number) => `Afirmação ${i} de ${n}`,
    nextQ: "Próxima pergunta", nextS: "Próxima afirmação", toSummary: "Ver resultados",
    tf: "Verdadeiro ou falso?", yes: "Verdadeiro", no: "Falso",
    timeUp: "O tempo acabou. O que vocês acham?",
    correct: "Correto!", wrong: "Não exatamente",
    score: (s: number, t: number) => `Vocês acertaram ${s} de ${t}`,
    great: "Muito bem! Vocês entenderam a palavra",
    almost: "Quase! Vamos rever a palavra mais uma vez",
    again: "De novo", nextWord: "Próxima palavra", done: "Concluir", close: "Fechar",
    preparing: "Preparando a atividade...",
    failed: "Não conseguimos preparar a atividade.", retry: "Tentar de novo",
    preparingPic: "Preparando uma imagem...",
    search: "Dicionário", searchPh: "Uma palavra para explicar à turma",
    exit: "Sair do modo apresentação", prev: "Palavra anterior", next: "Próxima palavra", listen: "Ouvir",
    letters: ["A", "B", "C", "D"],
  },
  fr: {
    wordOf: (i: number, n: number) => `Mot ${i} sur ${n}`,
    examples: "Exemples", quiz: "Quiz de la classe", game: "Jeu de la classe",
    nextExample: "Exemple suivant",
    learnEx: "Exemple d'apprentissage", fromGemara: "Tiré de la Guemara",
    diagram: "Schéma", diagramTag: "Schéma d'apprentissage",
    source: (q: ClassroomQuote) => `Traité ${q.tractate}, daf ${q.daf}, amoud ${q.amud}`,
    question: (i: number, n: number) => `Question ${i} sur ${n}`,
    statement: (i: number, n: number) => `Affirmation ${i} sur ${n}`,
    nextQ: "Question suivante", nextS: "Affirmation suivante", toSummary: "Voir les résultats",
    tf: "Vrai ou faux ?", yes: "Vrai", no: "Faux",
    timeUp: "Le temps est écoulé. Qu'en dites-vous ?",
    correct: "Bonne réponse !", wrong: "Pas tout à fait",
    score: (s: number, t: number) => `Vous avez trouvé ${s} sur ${t}`,
    great: "Bravo ! Vous avez compris le mot",
    almost: "Presque ! Revoyons le mot encore une fois",
    again: "Encore", nextWord: "Mot suivant", done: "Terminer", close: "Fermer",
    preparing: "Préparation de l'activité...",
    failed: "Nous n'avons pas pu préparer l'activité.", retry: "Réessayer",
    preparingPic: "Préparation d'une image...",
    search: "Dictionnaire", searchPh: "Un mot à expliquer à la classe",
    exit: "Quitter le mode présentation", prev: "Mot précédent", next: "Mot suivant", listen: "Écouter",
    letters: ["A", "B", "C", "D"],
  },
  de: {
    wordOf: (i: number, n: number) => `Wort ${i} von ${n}`,
    examples: "Beispiele", quiz: "Klassenquiz", game: "Klassenspiel",
    nextExample: "Nächstes Beispiel",
    learnEx: "Lernbeispiel", fromGemara: "Aus der Gemara",
    diagram: "Schaubild", diagramTag: "Lernschaubild",
    source: (q: ClassroomQuote) => `Traktat ${q.tractate}, Daf ${q.daf}, Amud ${q.amud}`,
    question: (i: number, n: number) => `Frage ${i} von ${n}`,
    statement: (i: number, n: number) => `Aussage ${i} von ${n}`,
    nextQ: "Nächste Frage", nextS: "Nächste Aussage", toSummary: "Zum Ergebnis",
    tf: "Richtig oder falsch?", yes: "Richtig", no: "Falsch",
    timeUp: "Die Zeit ist um. Was sagt ihr?",
    correct: "Richtig!", wrong: "Nicht ganz",
    score: (s: number, t: number) => `Ihr habt ${s} von ${t} richtig`,
    great: "Super! Ihr habt das Wort verstanden",
    almost: "Fast! Gehen wir das Wort noch einmal durch",
    again: "Noch mal", nextWord: "Nächstes Wort", done: "Fertig", close: "Schließen",
    preparing: "Die Aktivität wird vorbereitet...",
    failed: "Wir konnten die Aktivität nicht vorbereiten.", retry: "Erneut versuchen",
    preparingPic: "Ein Bild wird vorbereitet...",
    search: "Wörterbuch", searchPh: "Ein Wort, das der Klasse erklärt wird",
    exit: "Präsentationsmodus beenden", prev: "Vorheriges Wort", next: "Nächstes Wort", listen: "Anhören",
    letters: ["A", "B", "C", "D"],
  },
  cs: {
    wordOf: (i: number, n: number) => `Slovo ${i} z ${n}`,
    examples: "Příklady", quiz: "Kvíz pro třídu", game: "Hra pro třídu",
    nextExample: "Další příklad",
    learnEx: "Příklad k učení", fromGemara: "Z Gemary",
    diagram: "Schéma", diagramTag: "Schéma k učení",
    source: (q: ClassroomQuote) => `Traktát ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Otázka ${i} z ${n}`,
    statement: (i: number, n: number) => `Tvrzení ${i} z ${n}`,
    nextQ: "Další otázka", nextS: "Další tvrzení", toSummary: "Na výsledky",
    tf: "Pravda, nebo ne?", yes: "Pravda", no: "Nepravda",
    timeUp: "Čas vypršel. Co říkáte?",
    correct: "Správně!", wrong: "Ne tak úplně",
    score: (s: number, t: number) => `Správně jste odpověděli na ${s} z ${t}`,
    great: "Výborně! Slovu jste porozuměli",
    almost: "Skoro! Projděme si to slovo ještě jednou",
    again: "Znovu", nextWord: "Další slovo", done: "Hotovo", close: "Zavřít",
    preparing: "Připravujeme aktivitu...",
    failed: "Aktivitu se nepodařilo připravit.", retry: "Zkusit znovu",
    preparingPic: "Připravujeme obrázek...",
    search: "Slovník", searchPh: "Slovo, které třídě vysvětlíte",
    exit: "Ukončit režim prezentace", prev: "Předchozí slovo", next: "Další slovo", listen: "Poslechnout",
    letters: ["A", "B", "C", "D"],
  },
  sk: {
    wordOf: (i: number, n: number) => `Slovo ${i} z ${n}`,
    examples: "Príklady", quiz: "Kvíz pre triedu", game: "Hra pre triedu",
    nextExample: "Ďalší príklad",
    learnEx: "Príklad na učenie", fromGemara: "Z Gemary",
    diagram: "Schéma", diagramTag: "Schéma na učenie",
    source: (q: ClassroomQuote) => `Traktát ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Otázka ${i} z ${n}`,
    statement: (i: number, n: number) => `Tvrdenie ${i} z ${n}`,
    nextQ: "Ďalšia otázka", nextS: "Ďalšie tvrdenie", toSummary: "Na výsledky",
    tf: "Pravda, alebo nie?", yes: "Pravda", no: "Nepravda",
    timeUp: "Čas vypršal. Čo poviete?",
    correct: "Správne!", wrong: "Nie celkom",
    score: (s: number, t: number) => `Správne ste odpovedali na ${s} z ${t}`,
    great: "Výborne! Slovu ste porozumeli",
    almost: "Takmer! Prejdime si to slovo ešte raz",
    again: "Znova", nextWord: "Ďalšie slovo", done: "Hotovo", close: "Zavrieť",
    preparing: "Pripravujeme aktivitu...",
    failed: "Aktivitu sa nepodarilo pripraviť.", retry: "Skúsiť znova",
    preparingPic: "Pripravujeme obrázok...",
    search: "Slovník", searchPh: "Slovo, ktoré vysvetlíte triede",
    exit: "Ukončiť režim prezentácie", prev: "Predchádzajúce slovo", next: "Ďalšie slovo", listen: "Vypočuť si",
    letters: ["A", "B", "C", "D"],
  },
  it: {
    wordOf: (i: number, n: number) => `Parola ${i} di ${n}`,
    examples: "Esempi", quiz: "Quiz di classe", game: "Gioco di classe",
    nextExample: "Prossimo esempio",
    learnEx: "Esempio per imparare", fromGemara: "Dalla Ghemarà",
    diagram: "Schema", diagramTag: "Schema per imparare",
    source: (q: ClassroomQuote) => `Trattato ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Domanda ${i} di ${n}`,
    statement: (i: number, n: number) => `Affermazione ${i} di ${n}`,
    nextQ: "Prossima domanda", nextS: "Prossima affermazione", toSummary: "Vedi i risultati",
    tf: "Vero o falso?", yes: "Vero", no: "Falso",
    timeUp: "Tempo scaduto. Voi che dite?",
    correct: "Esatto!", wrong: "Non proprio",
    score: (s: number, t: number) => `Avete risposto bene a ${s} su ${t}`,
    great: "Bravissimi! Avete capito la parola",
    almost: "Quasi! Ripassiamo la parola ancora una volta",
    again: "Ancora", nextWord: "Parola successiva", done: "Fine", close: "Chiudi",
    preparing: "Prepariamo l'attività...",
    failed: "Non siamo riusciti a preparare l'attività.", retry: "Riprova",
    preparingPic: "Prepariamo un'immagine...",
    search: "Dizionario", searchPh: "Una parola da spiegare alla classe",
    exit: "Esci dalla modalità presentazione", prev: "Parola precedente", next: "Parola successiva", listen: "Ascolta",
    letters: ["A", "B", "C", "D"],
  },
  ja: {
    wordOf: (i: number, n: number) => `${n}語中 ${i}語目`,
    examples: "例文", quiz: "クラスクイズ", game: "クラスゲーム",
    nextExample: "次の例文",
    learnEx: "学習用の例文", fromGemara: "ゲマラより",
    diagram: "図解", diagramTag: "学習用の図解",
    source: (q: ClassroomQuote) => `${q.tractate}篇 ダフ${q.daf} アムード${q.amud}`,
    question: (i: number, n: number) => `${n}問中 第${i}問`,
    statement: (i: number, n: number) => `${n}文中 ${i}文目`,
    nextQ: "次の問題", nextS: "次の文", toSummary: "結果を見る",
    tf: "○か×か？", yes: "○ 正しい", no: "× ちがう",
    timeUp: "時間切れです。みなさんの答えは？",
    correct: "正解！", wrong: "おしい",
    score: (s: number, t: number) => `みなさんは${t}問中${s}問正解しました`,
    great: "よくできました！みなさん、ことばがわかりましたね",
    almost: "あと少し！もう一度ことばを見直しましょう",
    again: "もう一度", nextWord: "次のことば", done: "終了", close: "閉じる",
    preparing: "アクティビティを準備しています...",
    failed: "アクティビティを準備できませんでした。", retry: "もう一度試す",
    preparingPic: "画像を準備しています...",
    search: "辞書", searchPh: "クラスに説明することば",
    exit: "発表モードを終了", prev: "前のことば", next: "次のことば", listen: "聞く",
    letters: ["ア", "イ", "ウ", "エ"],
  },
  hi: {
    wordOf: (i: number, n: number) => `${n} में से शब्द ${i}`,
    examples: "उदाहरण", quiz: "कक्षा क्विज़", game: "कक्षा खेल",
    nextExample: "अगला उदाहरण",
    learnEx: "सीखने का उदाहरण", fromGemara: "गेमारा से",
    diagram: "आरेख", diagramTag: "सीखने का आरेख",
    source: (q: ClassroomQuote) => `ग्रंथ ${q.tractate}, दफ़ ${q.daf}, अमूद ${q.amud}`,
    question: (i: number, n: number) => `${n} में से प्रश्न ${i}`,
    statement: (i: number, n: number) => `${n} में से कथन ${i}`,
    nextQ: "अगला प्रश्न", nextS: "अगला कथन", toSummary: "नतीजे देखें",
    tf: "सही या ग़लत?", yes: "सही", no: "ग़लत",
    timeUp: "समय ख़त्म। आप सब क्या कहते हैं?",
    correct: "सही!", wrong: "पूरी तरह नहीं",
    score: (s: number, t: number) => `आप सबने ${t} में से ${s} के सही जवाब दिए`,
    great: "शाबाश! आप सबने शब्द समझ लिया",
    almost: "लगभग! चलिए शब्द को एक बार फिर देखते हैं",
    again: "फिर से", nextWord: "अगला शब्द", done: "समाप्त", close: "बंद करें",
    preparing: "गतिविधि तैयार हो रही है...",
    failed: "हम गतिविधि तैयार नहीं कर पाए।", retry: "फिर कोशिश करें",
    preparingPic: "चित्र तैयार हो रहा है...",
    search: "शब्दकोश", searchPh: "कक्षा को समझाने के लिए एक शब्द",
    exit: "प्रस्तुति मोड से बाहर निकलें", prev: "पिछला शब्द", next: "अगला शब्द", listen: "सुनें",
    letters: ["क", "ख", "ग", "घ"],
  },
  am: {
    wordOf: (i: number, n: number) => `ቃል ${i} ከ${n}`,
    examples: "ምሳሌዎች", quiz: "የክፍል ጥያቄዎች", game: "የክፍል ጨዋታ",
    nextExample: "ቀጣይ ምሳሌ",
    learnEx: "የመማሪያ ምሳሌ", fromGemara: "ከገማራ",
    diagram: "ሥዕላዊ መግለጫ", diagramTag: "የመማሪያ ሥዕላዊ መግለጫ",
    source: (q: ClassroomQuote) => `መጽሐፍ ${q.tractate}፣ ዳፍ ${q.daf}፣ አሙድ ${q.amud}`,
    question: (i: number, n: number) => `ጥያቄ ${i} ከ${n}`,
    statement: (i: number, n: number) => `ዓረፍተ ነገር ${i} ከ${n}`,
    nextQ: "ቀጣይ ጥያቄ", nextS: "ቀጣይ ዓረፍተ ነገር", toSummary: "ወደ ውጤቱ",
    tf: "እውነት ወይስ ሐሰት?", yes: "እውነት", no: "ሐሰት",
    timeUp: "ሰዓቱ አለቀ። ምን ትላላችሁ?",
    correct: "ትክክል!", wrong: "ሙሉ በሙሉ አይደለም",
    score: (s: number, t: number) => `ከ${t} ውስጥ ${s} በትክክል መለሳችሁ`,
    great: "በጣም ጥሩ! ቃሉን ተረዳችሁት",
    almost: "ተቃርባችኋል! ቃሉን እንደገና እንከልሰው",
    again: "እንደገና", nextWord: "ቀጣይ ቃል", done: "ጨርስ", close: "ዝጋ",
    preparing: "እንቅስቃሴውን እያዘጋጀን ነው...",
    failed: "እንቅስቃሴውን ማዘጋጀት አልቻልንም።", retry: "እንደገና ሞክር",
    preparingPic: "ሥዕል እያዘጋጀን ነው...",
    search: "መዝገበ ቃላት", searchPh: "ለክፍሉ የሚብራራ ቃል",
    exit: "ከማቅረቢያ ሁነታ ውጣ", prev: "ያለፈው ቃል", next: "ቀጣይ ቃል", listen: "አዳምጥ",
    letters: ["ሀ", "ለ", "ሐ", "መ"],
  },
  uk: {
    wordOf: (i: number, n: number) => `Слово ${i} з ${n}`,
    examples: "Приклади", quiz: "Вікторина для класу", game: "Гра для класу",
    nextExample: "Наступний приклад",
    learnEx: "Навчальний приклад", fromGemara: "З Гемари",
    diagram: "Схема", diagramTag: "Навчальна схема",
    source: (q: ClassroomQuote) => `Трактат ${q.tractate}, даф ${q.daf}, амуд ${q.amud}`,
    question: (i: number, n: number) => `Питання ${i} з ${n}`,
    statement: (i: number, n: number) => `Твердження ${i} з ${n}`,
    nextQ: "Наступне питання", nextS: "Наступне твердження", toSummary: "До підсумків",
    tf: "Правда чи ні?", yes: "Правда", no: "Неправда",
    timeUp: "Час вийшов. Що скажете?",
    correct: "Правильно!", wrong: "Не зовсім",
    score: (s: number, t: number) => `Ви правильно відповіли на ${s} з ${t}`,
    great: "Молодці! Ви зрозуміли слово",
    almost: "Майже! Давайте ще раз розберемо слово",
    again: "Ще раз", nextWord: "Наступне слово", done: "Готово", close: "Закрити",
    preparing: "Готуємо завдання...",
    failed: "Не вдалося підготувати завдання.", retry: "Спробувати ще раз",
    preparingPic: "Готуємо картинку...",
    search: "Словник", searchPh: "Слово, яке треба пояснити класу",
    exit: "Вийти з режиму показу", prev: "Попереднє слово", next: "Наступне слово", listen: "Слухати",
    letters: ["А", "Б", "В", "Г"],
  },
  tr: {
    wordOf: (i: number, n: number) => `Kelime ${i}/${n}`,
    examples: "Örnekler", quiz: "Sınıf testi", game: "Sınıf oyunu",
    nextExample: "Sonraki örnek",
    learnEx: "Öğrenme örneği", fromGemara: "Gemara'dan",
    diagram: "Şema", diagramTag: "Öğrenme şeması",
    source: (q: ClassroomQuote) => `Traktat ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Soru ${i}/${n}`,
    statement: (i: number, n: number) => `İfade ${i}/${n}`,
    nextQ: "Sonraki soru", nextS: "Sonraki ifade", toSummary: "Sonuçlara geç",
    tf: "Doğru mu, yanlış mı?", yes: "Doğru", no: "Yanlış",
    timeUp: "Süre doldu. Ne diyorsunuz?",
    correct: "Doğru!", wrong: "Tam değil",
    score: (s: number, t: number) => `Doğru cevaplarınız: ${s}/${t}`,
    great: "Aferin! Kelimeyi anladınız",
    almost: "Az kaldı! Kelimenin üzerinden bir kez daha geçelim",
    again: "Tekrar", nextWord: "Sonraki kelime", done: "Bitir", close: "Kapat",
    preparing: "Etkinlik hazırlanıyor...",
    failed: "Etkinliği hazırlayamadık.", retry: "Tekrar dene",
    preparingPic: "Resim hazırlanıyor...",
    search: "Sözlük", searchPh: "Sınıfa açıklanacak bir kelime",
    exit: "Sunum modundan çık", prev: "Önceki kelime", next: "Sonraki kelime", listen: "Dinle",
    letters: ["A", "B", "C", "D"],
  },
  pl: {
    wordOf: (i: number, n: number) => `Słowo ${i} z ${n}`,
    examples: "Przykłady", quiz: "Quiz dla klasy", game: "Gra dla klasy",
    nextExample: "Następny przykład",
    learnEx: "Przykład do nauki", fromGemara: "Z Gemary",
    diagram: "Schemat", diagramTag: "Schemat do nauki",
    source: (q: ClassroomQuote) => `Traktat ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Pytanie ${i} z ${n}`,
    statement: (i: number, n: number) => `Zdanie ${i} z ${n}`,
    nextQ: "Następne pytanie", nextS: "Następne zdanie", toSummary: "Do wyników",
    tf: "Prawda czy fałsz?", yes: "Prawda", no: "Fałsz",
    timeUp: "Czas minął. Co wy na to?",
    correct: "Dobrze!", wrong: "Nie do końca",
    score: (s: number, t: number) => `Odpowiedzieliście dobrze na ${s} z ${t}`,
    great: "Brawo! Zrozumieliście to słowo",
    almost: "Prawie! Przejdźmy przez to słowo jeszcze raz",
    again: "Jeszcze raz", nextWord: "Następne słowo", done: "Koniec", close: "Zamknij",
    preparing: "Przygotowujemy zadanie...",
    failed: "Nie udało się przygotować zadania.", retry: "Spróbuj ponownie",
    preparingPic: "Przygotowujemy obrazek...",
    search: "Słownik", searchPh: "Słowo do wyjaśnienia klasie",
    exit: "Wyjdź z trybu prezentacji", prev: "Poprzednie słowo", next: "Następne słowo", listen: "Odsłuchaj",
    letters: ["A", "B", "C", "D"],
  },
  fa: {
    wordOf: (i: number, n: number) => `واژه‌ی ${i} از ${n}`,
    examples: "مثال‌ها", quiz: "مسابقه‌ی کلاسی", game: "بازی کلاسی",
    nextExample: "مثال بعدی",
    learnEx: "مثال آموزشی", fromGemara: "از گمارا",
    diagram: "نمودار", diagramTag: "نمودار آموزشی",
    source: (q: ClassroomQuote) => `رساله‌ی ${q.tractate}، دف ${q.daf}، عمود ${q.amud}`,
    question: (i: number, n: number) => `پرسش ${i} از ${n}`,
    statement: (i: number, n: number) => `جمله‌ی ${i} از ${n}`,
    nextQ: "پرسش بعدی", nextS: "جمله‌ی بعدی", toSummary: "دیدن نتیجه",
    tf: "درست یا نادرست؟", yes: "درست", no: "نادرست",
    timeUp: "وقت تمام شد. شما چه می‌گویید؟",
    correct: "درست است!", wrong: "نه کاملاً",
    score: (s: number, t: number) => `به ${s} از ${t} پرسش درست جواب دادید`,
    great: "آفرین! واژه را فهمیدید",
    almost: "نزدیک بود! بیایید یک بار دیگر واژه را مرور کنیم",
    again: "دوباره", nextWord: "واژه‌ی بعدی", done: "پایان", close: "بستن",
    preparing: "در حال آماده کردن فعالیت...",
    failed: "نتوانستیم فعالیت را آماده کنیم.", retry: "تلاش دوباره",
    preparingPic: "در حال آماده کردن تصویر...",
    search: "فرهنگ لغت", searchPh: "واژه‌ای برای توضیح به کلاس",
    exit: "خروج از حالت نمایش", prev: "واژه‌ی قبلی", next: "واژه‌ی بعدی", listen: "شنیدن",
    letters: ["الف", "ب", "ج", "د"],
  },
  id: {
    wordOf: (i: number, n: number) => `Kata ${i} dari ${n}`,
    examples: "Contoh", quiz: "Kuis kelas", game: "Permainan kelas",
    nextExample: "Contoh berikutnya",
    learnEx: "Contoh belajar", fromGemara: "Dari Gemara",
    diagram: "Diagram", diagramTag: "Diagram belajar",
    source: (q: ClassroomQuote) => `Traktat ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Pertanyaan ${i} dari ${n}`,
    statement: (i: number, n: number) => `Pernyataan ${i} dari ${n}`,
    nextQ: "Pertanyaan berikutnya", nextS: "Pernyataan berikutnya", toSummary: "Lihat hasil",
    tf: "Benar atau salah?", yes: "Benar", no: "Salah",
    timeUp: "Waktu habis. Bagaimana menurut kalian?",
    correct: "Benar!", wrong: "Belum tepat",
    score: (s: number, t: number) => `Kalian menjawab benar ${s} dari ${t}`,
    great: "Hebat! Kalian sudah paham kata ini",
    almost: "Hampir! Ayo kita bahas kata ini sekali lagi",
    again: "Lagi", nextWord: "Kata berikutnya", done: "Selesai", close: "Tutup",
    preparing: "Menyiapkan aktivitas...",
    failed: "Kami belum bisa menyiapkan aktivitas.", retry: "Coba lagi",
    preparingPic: "Menyiapkan gambar...",
    search: "Kamus", searchPh: "Kata untuk dijelaskan ke kelas",
    exit: "Keluar dari mode presentasi", prev: "Kata sebelumnya", next: "Kata berikutnya", listen: "Dengarkan",
    letters: ["A", "B", "C", "D"],
  },
  nl: {
    wordOf: (i: number, n: number) => `Woord ${i} van ${n}`,
    examples: "Voorbeelden", quiz: "Klassenquiz", game: "Klassenspel",
    nextExample: "Volgend voorbeeld",
    learnEx: "Leervoorbeeld", fromGemara: "Uit de Gemara",
    diagram: "Schema", diagramTag: "Leerschema",
    source: (q: ClassroomQuote) => `Traktaat ${q.tractate}, daf ${q.daf}, amoed ${q.amud}`,
    question: (i: number, n: number) => `Vraag ${i} van ${n}`,
    statement: (i: number, n: number) => `Stelling ${i} van ${n}`,
    nextQ: "Volgende vraag", nextS: "Volgende stelling", toSummary: "Naar de uitslag",
    tf: "Waar of niet waar?", yes: "Waar", no: "Niet waar",
    timeUp: "De tijd is om. Wat zeggen jullie?",
    correct: "Goed!", wrong: "Niet helemaal",
    score: (s: number, t: number) => `Jullie hadden er ${s} van de ${t} goed`,
    great: "Goed gedaan! Jullie hebben het woord begrepen",
    almost: "Bijna! Laten we het woord nog een keer doornemen",
    again: "Nog een keer", nextWord: "Volgend woord", done: "Klaar", close: "Sluiten",
    preparing: "De activiteit wordt voorbereid...",
    failed: "We konden de activiteit niet voorbereiden.", retry: "Opnieuw proberen",
    preparingPic: "Een afbeelding wordt voorbereid...",
    search: "Woordenboek", searchPh: "Een woord om aan de klas uit te leggen",
    exit: "Presentatiemodus verlaten", prev: "Vorig woord", next: "Volgend woord", listen: "Luisteren",
    letters: ["A", "B", "C", "D"],
  },
  el: {
    wordOf: (i: number, n: number) => `Λέξη ${i} από ${n}`,
    examples: "Παραδείγματα", quiz: "Κουίζ τάξης", game: "Παιχνίδι τάξης",
    nextExample: "Επόμενο παράδειγμα",
    learnEx: "Παράδειγμα για μάθηση", fromGemara: "Από τη Γκεμαρά",
    diagram: "Διάγραμμα", diagramTag: "Διάγραμμα για μάθηση",
    source: (q: ClassroomQuote) => `Πραγματεία ${q.tractate}, νταφ ${q.daf}, αμούντ ${q.amud}`,
    question: (i: number, n: number) => `Ερώτηση ${i} από ${n}`,
    statement: (i: number, n: number) => `Πρόταση ${i} από ${n}`,
    nextQ: "Επόμενη ερώτηση", nextS: "Επόμενη πρόταση", toSummary: "Στα αποτελέσματα",
    tf: "Σωστό ή λάθος;", yes: "Σωστό", no: "Λάθος",
    timeUp: "Ο χρόνος τελείωσε. Τι λέτε;",
    correct: "Σωστά!", wrong: "Όχι ακριβώς",
    score: (s: number, t: number) => `Απαντήσατε σωστά σε ${s} από ${t}`,
    great: "Μπράβο! Καταλάβατε τη λέξη",
    almost: "Σχεδόν! Ας δούμε ξανά τη λέξη",
    again: "Ξανά", nextWord: "Επόμενη λέξη", done: "Τέλος", close: "Κλείσιμο",
    preparing: "Ετοιμάζουμε τη δραστηριότητα...",
    failed: "Δεν καταφέραμε να ετοιμάσουμε τη δραστηριότητα.", retry: "Δοκιμάστε ξανά",
    preparingPic: "Ετοιμάζουμε μια εικόνα...",
    search: "Λεξικό", searchPh: "Μια λέξη για εξήγηση στην τάξη",
    exit: "Έξοδος από την παρουσίαση", prev: "Προηγούμενη λέξη", next: "Επόμενη λέξη", listen: "Ακρόαση",
    letters: ["Α", "Β", "Γ", "Δ"],
  },
  zu: {
    wordOf: (i: number, n: number) => `Igama ${i} ku-${n}`,
    examples: "Izibonelo", quiz: "Imibuzo yekilasi", game: "Umdlalo wekilasi",
    nextExample: "Isibonelo esilandelayo",
    learnEx: "Isibonelo sokufunda", fromGemara: "KuGemara",
    diagram: "Umdwebo", diagramTag: "Umdwebo wokufunda",
    source: (q: ClassroomQuote) => `Ithrakthethi ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Umbuzo ${i} ku-${n}`,
    statement: (i: number, n: number) => `Umusho ${i} ku-${n}`,
    nextQ: "Umbuzo olandelayo", nextS: "Umusho olandelayo", toSummary: "Bona imiphumela",
    tf: "Kuyiqiniso noma akulona?", yes: "Iqiniso", no: "Akulona iqiniso",
    timeUp: "Isikhathi siphelile. Nithini?",
    correct: "Kulungile!", wrong: "Hhayi impela",
    score: (s: number, t: number) => `Niphendule kahle: ${s} ku-${t}`,
    great: "Nenze kahle! Nilizwile igama",
    almost: "Cishe! Ake siphinde sibheke igama",
    again: "Futhi", nextWord: "Igama elilandelayo", done: "Qeda", close: "Vala",
    preparing: "Silungisa umsebenzi...",
    failed: "Asikwazanga ukulungisa umsebenzi.", retry: "Zama futhi",
    preparingPic: "Silungisa isithombe...",
    search: "Isichazamazwi", searchPh: "Igama lokuchazela ikilasi",
    exit: "Phuma ekwethuleni", prev: "Igama elidlule", next: "Igama elilandelayo", listen: "Lalela",
    letters: ["A", "B", "C", "D"],
  },
  xh: {
    wordOf: (i: number, n: number) => `Igama ${i} ku-${n}`,
    examples: "Imizekelo", quiz: "Imibuzo yeklasi", game: "Umdlalo weklasi",
    nextExample: "Umzekelo olandelayo",
    learnEx: "Umzekelo wokufunda", fromGemara: "Kwi-Gemara",
    diagram: "Umzobo", diagramTag: "Umzobo wokufunda",
    source: (q: ClassroomQuote) => `Itrakthethi ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Umbuzo ${i} ku-${n}`,
    statement: (i: number, n: number) => `Isivakalisi ${i} ku-${n}`,
    nextQ: "Umbuzo olandelayo", nextS: "Isivakalisi esilandelayo", toSummary: "Bona iziphumo",
    tf: "Yinyani okanye bubuxoki?", yes: "Yinyani", no: "Bubuxoki",
    timeUp: "Ixesha liphelile. Nithini?",
    correct: "Kuchanekile!", wrong: "Akukabi njalo",
    score: (s: number, t: number) => `Niphendule kakuhle: ${s} ku-${t}`,
    great: "Nenze kakuhle! Niliqondile igama",
    almost: "Phantse! Masiphinde silijonge igama",
    again: "Kwakhona", nextWord: "Igama elilandelayo", done: "Gqiba", close: "Vala",
    preparing: "Silungiselela umsebenzi...",
    failed: "Asikwazanga ukulungiselela umsebenzi.", retry: "Zama kwakhona",
    preparingPic: "Silungiselela umfanekiso...",
    search: "Isichazi-magama", searchPh: "Igama lokucacisela iklasi",
    exit: "Phuma ekuboniseni", prev: "Igama elidlulileyo", next: "Igama elilandelayo", listen: "Mamela",
    letters: ["A", "B", "C", "D"],
  },
  nso: {
    wordOf: (i: number, n: number) => `Lentšu ${i} go ${n}`,
    examples: "Mehlala", quiz: "Dipotšišo tša phapoši", game: "Papadi ya phapoši",
    nextExample: "Mohlala wo o latelago",
    learnEx: "Mohlala wa go ithuta", fromGemara: "Go tšwa go Gemara",
    diagram: "Seswantšho", diagramTag: "Seswantšho sa go ithuta",
    source: (q: ClassroomQuote) => `Trakthete ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Potšišo ${i} go ${n}`,
    statement: (i: number, n: number) => `Lefoko ${i} go ${n}`,
    nextQ: "Potšišo ye e latelago", nextS: "Lefoko le le latelago", toSummary: "Bona dipoelo",
    tf: "Ke nnete goba aowa?", yes: "Nnete", no: "Ga se nnete",
    timeUp: "Nako e fedile. Le reng?",
    correct: "Go nepile!", wrong: "Ga se ka botlalo",
    score: (s: number, t: number) => `Le arabile gabotse: ${s} go ${t}`,
    great: "Le dirile gabotse! Le kwešišitše lentšu",
    almost: "Kgauswi! A re boeleng lentšu gape",
    again: "Gape", nextWord: "Lentšu le le latelago", done: "Fetša", close: "Tswalela",
    preparing: "Re lokišetša mošomo...",
    failed: "Ga re a kgona go lokišetša mošomo.", retry: "Leka gape",
    preparingPic: "Re lokišetša seswantšho...",
    search: "Pukuntšu", searchPh: "Lentšu leo le tla hlalošetšwago phapoši",
    exit: "Tšwa go bontšheng", prev: "Lentšu le le fetilego", next: "Lentšu le le latelago", listen: "Theeletša",
    letters: ["A", "B", "C", "D"],
  },
  tn: {
    wordOf: (i: number, n: number) => `Lefoko ${i} go ${n}`,
    examples: "Dikai", quiz: "Dipotso tsa phaposi", game: "Motshameko wa phaposi",
    nextExample: "Sekai se se latelang",
    learnEx: "Sekai sa go ithuta", fromGemara: "Go tswa mo Gemara",
    diagram: "Setshwantsho", diagramTag: "Setshwantsho sa go ithuta",
    source: (q: ClassroomQuote) => `Terakthete ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Potso ${i} go ${n}`,
    statement: (i: number, n: number) => `Polelo ${i} go ${n}`,
    nextQ: "Potso e e latelang", nextS: "Polelo e e latelang", toSummary: "Bona dipholo",
    tf: "Boammaaruri kgotsa maaka?", yes: "Boammaaruri", no: "Maaka",
    timeUp: "Nako e fedile. Lo reng?",
    correct: "Go siame!", wrong: "Ga se ka botlalo",
    score: (s: number, t: number) => `Lo arabile sentle: ${s} go ${t}`,
    great: "Lo dirile sentle! Lo tlhalogantse lefoko",
    almost: "Go gaufi! A re boeleng lefoko gape",
    again: "Gape", nextWord: "Lefoko le le latelang", done: "Fetsa", close: "Tswala",
    preparing: "Re baakanya tiro...",
    failed: "Ga re a kgona go baakanya tiro.", retry: "Leka gape",
    preparingPic: "Re baakanya setshwantsho...",
    search: "Thanodi", searchPh: "Lefoko le le tla tlhalosetswang phaposi",
    exit: "Tswa mo go bontsheng", prev: "Lefoko le le fetileng", next: "Lefoko le le latelang", listen: "Reetsa",
    letters: ["A", "B", "C", "D"],
  },
  st: {
    wordOf: (i: number, n: number) => `Lentswe ${i} ho ${n}`,
    examples: "Mehlala", quiz: "Dipotso tsa tlelase", game: "Papadi ya tlelase",
    nextExample: "Mohlala o latelang",
    learnEx: "Mohlala wa ho ithuta", fromGemara: "Ho tswa ho Gemara",
    diagram: "Setshwantsho", diagramTag: "Setshwantsho sa ho ithuta",
    source: (q: ClassroomQuote) => `Terakthete ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Potso ${i} ho ${n}`,
    statement: (i: number, n: number) => `Polelo ${i} ho ${n}`,
    nextQ: "Potso e latelang", nextS: "Polelo e latelang", toSummary: "Bona diphetho",
    tf: "Nnete kapa leshano?", yes: "Nnete", no: "Leshano",
    timeUp: "Nako e fedile. Le reng?",
    correct: "Ho nepahetse!", wrong: "Eseng hantle",
    score: (s: number, t: number) => `Le arabile hantle: ${s} ho ${t}`,
    great: "Le entse hantle! Le utlwisisitse lentswe",
    almost: "Haufi! Ha re boeleng lentswe hape",
    again: "Hape", nextWord: "Lentswe le latelang", done: "Qetela", close: "Kwala",
    preparing: "Re lokisa mosebetsi...",
    failed: "Ha re a kgona ho lokisa mosebetsi.", retry: "Leka hape",
    preparingPic: "Re lokisa setshwantsho...",
    search: "Bukantswe", searchPh: "Lentswe le tla hlaloswa tlelaseng",
    exit: "Tswa ho bontsheng", prev: "Lentswe le fetileng", next: "Lentswe le latelang", listen: "Mamela",
    letters: ["A", "B", "C", "D"],
  },
  ts: {
    wordOf: (i: number, n: number) => `Rito ${i} eka ${n}`,
    examples: "Swikombiso", quiz: "Mavutiso ya tlilasi", game: "Ntlangu wa tlilasi",
    nextExample: "Xikombiso lexi landzelaka",
    learnEx: "Xikombiso xo dyondza", fromGemara: "Ku suka eka Gemara",
    diagram: "Xifaniso", diagramTag: "Xifaniso xo dyondza",
    source: (q: ClassroomQuote) => `Trakthete ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Xivutiso ${i} eka ${n}`,
    statement: (i: number, n: number) => `Xivulwa ${i} eka ${n}`,
    nextQ: "Xivutiso lexi landzelaka", nextS: "Xivulwa lexi landzelaka", toSummary: "Vona mbuyelo",
    tf: "Ntiyiso kumbe mavunwa?", yes: "Ntiyiso", no: "Mavunwa",
    timeUp: "Nkarhi wu herile. Mi ri yini?",
    correct: "Swi lulamile!", wrong: "A swi si lulama hinkwaswo",
    score: (s: number, t: number) => `Mi hlamule kahle: ${s} eka ${t}`,
    great: "Mi endle kahle! Mi twisisile rito",
    almost: "Ku kusuhi! A hi vuyeleni rito nakambe",
    again: "Nakambe", nextWord: "Rito leri landzelaka", done: "Heta", close: "Pfala",
    preparing: "Hi lunghiselela ntirho...",
    failed: "A hi swi kotanga ku lunghiselela ntirho.", retry: "Ringeta nakambe",
    preparingPic: "Hi lunghiselela xifaniso...",
    search: "Xihlamuselamarito", searchPh: "Rito ro hlamusela tlilasi",
    exit: "Huma eku kombiseni", prev: "Rito leri hundzeke", next: "Rito leri landzelaka", listen: "Yingisa",
    letters: ["A", "B", "C", "D"],
  },
  ss: {
    wordOf: (i: number, n: number) => `Ligama ${i} ku-${n}`,
    examples: "Tibonelo", quiz: "Imibuto yeklasi", game: "Umdlalo weklasi",
    nextExample: "Sibonelo lesilandzelako",
    learnEx: "Sibonelo sekufundza", fromGemara: "KuGemara",
    diagram: "Umdvwebo", diagramTag: "Umdvwebo wekufundza",
    source: (q: ClassroomQuote) => `Ithrakthethi ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Umbuto ${i} ku-${n}`,
    statement: (i: number, n: number) => `Umusho ${i} ku-${n}`,
    nextQ: "Umbuto lolandzelako", nextS: "Umusho lolandzelako", toSummary: "Bona imiphumela",
    tf: "Liciniso nobe akusilo?", yes: "Liciniso", no: "Akusilo liciniso",
    timeUp: "Sikhatsi siphelile. Nitsini?",
    correct: "Kulungile!", wrong: "Hhayi ncamashi",
    score: (s: number, t: number) => `Niphendvule kahle: ${s} ku-${t}`,
    great: "Nente kahle! Nilivisisile ligama",
    almost: "Cishe! Asiphindze silibuke ligama",
    again: "Futsi", nextWord: "Ligama lelilandzelako", done: "Qedza", close: "Vala",
    preparing: "Silungiselela umsebenti...",
    failed: "Asikhonanga kulungiselela umsebenti.", retry: "Zama futsi",
    preparingPic: "Silungiselela sitfombe...",
    search: "Sichazamagama", searchPh: "Ligama lekuchazela likilasi",
    exit: "Phuma ekwetfuleni", prev: "Ligama leledlulile", next: "Ligama lelilandzelako", listen: "Lalela",
    letters: ["A", "B", "C", "D"],
  },
  ve: {
    wordOf: (i: number, n: number) => `Ipfi ${i} kha ${n}`,
    examples: "Tsumbo", quiz: "Mbudziso dza kilasi", game: "Mutambo wa kilasi",
    nextExample: "Tsumbo i tevhelaho",
    learnEx: "Tsumbo ya u guda", fromGemara: "U bva kha Gemara",
    diagram: "Tshifanyiso", diagramTag: "Tshifanyiso tsha u guda",
    source: (q: ClassroomQuote) => `Thirakhethe ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Mbudziso ${i} kha ${n}`,
    statement: (i: number, n: number) => `Mutaladzi ${i} kha ${n}`,
    nextQ: "Mbudziso i tevhelaho", nextS: "Mutaladzi u tevhelaho", toSummary: "Vhonani mvelelo",
    tf: "Ngoho kana mazwifhi?", yes: "Ngoho", no: "Mazwifhi",
    timeUp: "Tshifhinga tsho fhela. Ni ri mini?",
    correct: "Ndi zwone!", wrong: "A si zwone tshoṱhe",
    score: (s: number, t: number) => `No fhindula zwavhuḓi: ${s} kha ${t}`,
    great: "No ita zwavhuḓi! No pfesesa ipfi",
    almost: "Ho no tsini! Kha ri dovhe ri sedze ipfi",
    again: "Hafhu", nextWord: "Ipfi ḽi tevhelaho", done: "Fhedzani", close: "Valani",
    preparing: "Ri khou lugisela mushumo...",
    failed: "A ro ngo kona u lugisela mushumo.", retry: "Lingedzani hafhu",
    preparingPic: "Ri khou lugisela tshifanyiso...",
    search: "Ḓikishinari", searchPh: "Ipfi ḽa u ṱalutshedza kilasi",
    exit: "Bvani kha u sumbedza", prev: "Ipfi ḽo fhiraho", next: "Ipfi ḽi tevhelaho", listen: "Thetshelesani",
    letters: ["A", "B", "C", "D"],
  },
  nr: {
    wordOf: (i: number, n: number) => `Ilizwi ${i} ku-${n}`,
    examples: "Iimbonelo", quiz: "Imibuzo yetlasi", game: "Umdlalo wetlasi",
    nextExample: "Isibonelo esilandelako",
    learnEx: "Isibonelo sokufunda", fromGemara: "KuGemara",
    diagram: "Umdwebo", diagramTag: "Umdwebo wokufunda",
    source: (q: ClassroomQuote) => `Ithrakthethi ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Umbuzo ${i} ku-${n}`,
    statement: (i: number, n: number) => `Umutjho ${i} ku-${n}`,
    nextQ: "Umbuzo olandelako", nextS: "Umutjho olandelako", toSummary: "Bona imiphumela",
    tf: "Kuliqiniso namkha akusilo?", yes: "Kuliqiniso", no: "Akusilo iqiniso",
    timeUp: "Isikhathi siphelile. Nithini?",
    correct: "Kulungile!", wrong: "Ingasi ncamashi",
    score: (s: number, t: number) => `Niphendule kuhle: ${s} ku-${t}`,
    great: "Nenze kuhle! Nilizwisisile ilizwi",
    almost: "Cishe! Asibuyelele ilizwi godu",
    again: "Godu", nextWord: "Ilizwi elilandelako", done: "Qeda", close: "Vala",
    preparing: "Silungiselela umsebenzi...",
    failed: "Asikghonanga ukulungiselela umsebenzi.", retry: "Linga godu",
    preparingPic: "Silungiselela isithombe...",
    search: "Isichazimezwi", searchPh: "Ilizwi lokuhlathululela itlasi",
    exit: "Phuma ekwethuleni", prev: "Ilizwi elidlulileko", next: "Ilizwi elilandelako", listen: "Lalela",
    letters: ["A", "B", "C", "D"],
  },
  vi: {
    wordOf: (i: number, n: number) => `Từ ${i}/${n}`,
    examples: "Ví dụ", quiz: "Đố vui cả lớp", game: "Trò chơi cả lớp",
    nextExample: "Ví dụ tiếp theo",
    learnEx: "Ví dụ để học", fromGemara: "Trích từ Gemara",
    diagram: "Sơ đồ", diagramTag: "Sơ đồ để học",
    source: (q: ClassroomQuote) => `Luận thư ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Câu hỏi ${i}/${n}`,
    statement: (i: number, n: number) => `Nhận định ${i}/${n}`,
    nextQ: "Câu hỏi tiếp theo", nextS: "Nhận định tiếp theo", toSummary: "Xem kết quả",
    tf: "Đúng hay sai?", yes: "Đúng", no: "Sai",
    timeUp: "Hết giờ rồi. Các em nghĩ sao?",
    correct: "Chính xác!", wrong: "Chưa đúng lắm",
    score: (s: number, t: number) => `Các em đã trả lời đúng ${s}/${t} câu`,
    great: "Giỏi lắm! Các em đã hiểu từ này",
    almost: "Gần đúng rồi! Cùng ôn lại từ này nhé",
    again: "Làm lại", nextWord: "Từ tiếp theo", done: "Hoàn thành", close: "Đóng",
    preparing: "Đang chuẩn bị hoạt động...",
    failed: "Chúng tôi chưa chuẩn bị được hoạt động.", retry: "Thử lại",
    preparingPic: "Đang chuẩn bị hình ảnh...",
    search: "Từ điển", searchPh: "Một từ cần giải thích cho cả lớp",
    exit: "Thoát chế độ trình chiếu", prev: "Từ trước", next: "Từ tiếp theo", listen: "Nghe",
    letters: ["A", "B", "C", "D"],
  },
  fil: {
    wordOf: (i: number, n: number) => `Salita ${i} sa ${n}`,
    examples: "Mga halimbawa", quiz: "Quiz ng klase", game: "Laro ng klase",
    nextExample: "Susunod na halimbawa",
    learnEx: "Halimbawang pag-aaralan", fromGemara: "Mula sa Gemara",
    diagram: "Diagram", diagramTag: "Diagram na pag-aaralan",
    source: (q: ClassroomQuote) => `Tractate ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Tanong ${i} sa ${n}`,
    statement: (i: number, n: number) => `Pahayag ${i} sa ${n}`,
    nextQ: "Susunod na tanong", nextS: "Susunod na pahayag", toSummary: "Tingnan ang resulta",
    tf: "Tama o mali?", yes: "Tama", no: "Mali",
    timeUp: "Ubos na ang oras. Ano sa tingin ninyo?",
    correct: "Tama!", wrong: "Hindi pa tama",
    score: (s: number, t: number) => `Nasagot ninyo nang tama ang ${s} sa ${t}`,
    great: "Magaling! Naintindihan ninyo ang salita",
    almost: "Malapit na! Balikan natin ulit ang salita",
    again: "Ulit", nextWord: "Susunod na salita", done: "Tapos na", close: "Isara",
    preparing: "Inihahanda ang gawain...",
    failed: "Hindi namin naihanda ang gawain.", retry: "Subukan ulit",
    preparingPic: "Inihahanda ang larawan...",
    search: "Diksiyonaryo", searchPh: "Salitang ipapaliwanag sa klase",
    exit: "Lumabas sa pagtatanghal", prev: "Nakaraang salita", next: "Susunod na salita", listen: "Pakinggan",
    letters: ["A", "B", "C", "D"],
  },
  af: {
    wordOf: (i: number, n: number) => `Woord ${i} van ${n}`,
    examples: "Voorbeelde", quiz: "Klasvasvra", game: "Klasspeletjie",
    nextExample: "Volgende voorbeeld",
    learnEx: "Leervoorbeeld", fromGemara: "Uit die Gemara",
    diagram: "Diagram", diagramTag: "Leerdiagram",
    source: (q: ClassroomQuote) => `Traktaat ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Vraag ${i} van ${n}`,
    statement: (i: number, n: number) => `Stelling ${i} van ${n}`,
    nextQ: "Volgende vraag", nextS: "Volgende stelling", toSummary: "Na die uitslae",
    tf: "Waar of vals?", yes: "Waar", no: "Vals",
    timeUp: "Die tyd is verby. Wat sê julle?",
    correct: "Reg!", wrong: "Nie heeltemal nie",
    score: (s: number, t: number) => `Julle het ${s} uit ${t} reg`,
    great: "Mooi so! Julle het die woord verstaan",
    almost: "Amper! Kom ons gaan weer oor die woord",
    again: "Weer", nextWord: "Volgende woord", done: "Klaar", close: "Maak toe",
    preparing: "Ons berei die aktiwiteit voor...",
    failed: "Ons kon nie die aktiwiteit voorberei nie.", retry: "Probeer weer",
    preparingPic: "Ons berei 'n prent voor...",
    search: "Woordeboek", searchPh: "'n Woord om aan die klas te verduidelik",
    exit: "Verlaat aanbiedingsmodus", prev: "Vorige woord", next: "Volgende woord", listen: "Luister",
    letters: ["A", "B", "C", "D"],
  },
  sw: {
    wordOf: (i: number, n: number) => `Neno ${i} kati ya ${n}`,
    examples: "Mifano", quiz: "Chemsha bongo ya darasa", game: "Mchezo wa darasa",
    nextExample: "Mfano unaofuata",
    learnEx: "Mfano wa kujifunza", fromGemara: "Kutoka Gemara",
    diagram: "Mchoro", diagramTag: "Mchoro wa kujifunza",
    source: (q: ClassroomQuote) => `Trakti ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Swali ${i} kati ya ${n}`,
    statement: (i: number, n: number) => `Kauli ${i} kati ya ${n}`,
    nextQ: "Swali linalofuata", nextS: "Kauli inayofuata", toSummary: "Ona matokeo",
    tf: "Kweli au si kweli?", yes: "Kweli", no: "Si kweli",
    timeUp: "Muda umekwisha. Mnasemaje?",
    correct: "Sahihi!", wrong: "Si sawasawa",
    score: (s: number, t: number) => `Mmepata sahihi ${s} kati ya ${t}`,
    great: "Hongereni! Mmelielewa neno",
    almost: "Karibu! Tulipitie neno tena",
    again: "Tena", nextWord: "Neno linalofuata", done: "Maliza", close: "Funga",
    preparing: "Tunaandaa shughuli...",
    failed: "Hatukuweza kuandaa shughuli.", retry: "Jaribu tena",
    preparingPic: "Tunaandaa picha...",
    search: "Kamusi", searchPh: "Neno la kueleza darasa",
    exit: "Toka kwenye uwasilishaji", prev: "Neno lililotangulia", next: "Neno linalofuata", listen: "Sikiliza",
    letters: ["A", "B", "C", "D"],
  },
  "zh-CN": {
    wordOf: (i: number, n: number) => `第 ${i} 个词，共 ${n} 个`,
    examples: "例句", quiz: "全班小测验", game: "全班游戏",
    nextExample: "下一个例句",
    learnEx: "学习例句", fromGemara: "出自《革马拉》",
    diagram: "图示", diagramTag: "学习图示",
    source: (q: ClassroomQuote) => `${q.tractate} 篇，第 ${q.daf} 页，${q.amud} 面`,
    question: (i: number, n: number) => `第 ${i} 题，共 ${n} 题`,
    statement: (i: number, n: number) => `第 ${i} 句，共 ${n} 句`,
    nextQ: "下一题", nextS: "下一句", toSummary: "看结果",
    tf: "对还是错？", yes: "对", no: "错",
    timeUp: "时间到！大家怎么看？",
    correct: "答对了！", wrong: "不太对",
    score: (s: number, t: number) => `你们答对了 ${t} 题中的 ${s} 题`,
    great: "太棒了！你们理解了这个词",
    almost: "差一点！我们再复习一遍这个词",
    again: "再来一次", nextWord: "下一个词", done: "完成", close: "关闭",
    preparing: "正在准备活动...",
    failed: "活动没能准备好。", retry: "重试",
    preparingPic: "正在准备图片...",
    search: "词典", searchPh: "要向全班讲解的词",
    exit: "退出演示模式", prev: "上一个词", next: "下一个词", listen: "朗读",
    letters: ["A", "B", "C", "D"],
  },
  "zh-TW": {
    wordOf: (i: number, n: number) => `第 ${i} 個詞，共 ${n} 個`,
    examples: "例句", quiz: "全班小測驗", game: "全班遊戲",
    nextExample: "下一個例句",
    learnEx: "學習例句", fromGemara: "出自《革馬拉》",
    diagram: "圖示", diagramTag: "學習圖示",
    source: (q: ClassroomQuote) => `${q.tractate} 篇，第 ${q.daf} 頁，${q.amud} 面`,
    question: (i: number, n: number) => `第 ${i} 題，共 ${n} 題`,
    statement: (i: number, n: number) => `第 ${i} 句，共 ${n} 句`,
    nextQ: "下一題", nextS: "下一句", toSummary: "看結果",
    tf: "對還是錯？", yes: "對", no: "錯",
    timeUp: "時間到！大家怎麼看？",
    correct: "答對了！", wrong: "不太對",
    score: (s: number, t: number) => `你們答對了 ${t} 題中的 ${s} 題`,
    great: "太棒了！你們理解了這個詞",
    almost: "差一點！我們再複習一遍這個詞",
    again: "再來一次", nextWord: "下一個詞", done: "完成", close: "關閉",
    preparing: "正在準備活動...",
    failed: "活動沒能準備好。", retry: "重試",
    preparingPic: "正在準備圖片...",
    search: "辭典", searchPh: "要向全班講解的詞",
    exit: "退出簡報模式", prev: "上一個詞", next: "下一個詞", listen: "朗讀",
    letters: ["A", "B", "C", "D"],
  },
  ko: {
    wordOf: (i: number, n: number) => `${n}개 중 ${i}번째 단어`,
    examples: "예문", quiz: "학급 퀴즈", game: "학급 게임",
    nextExample: "다음 예문",
    learnEx: "학습 예문", fromGemara: "게마라에서",
    diagram: "도표", diagramTag: "학습 도표",
    source: (q: ClassroomQuote) => `${q.tractate} 편, 다프 ${q.daf}, 아무드 ${q.amud}`,
    question: (i: number, n: number) => `${n}문제 중 ${i}번`,
    statement: (i: number, n: number) => `${n}문장 중 ${i}번`,
    nextQ: "다음 문제", nextS: "다음 문장", toSummary: "결과 보기",
    tf: "참일까, 거짓일까?", yes: "참", no: "거짓",
    timeUp: "시간이 끝났어요. 여러분 생각은 어때요?",
    correct: "정답!", wrong: "아쉬워요",
    score: (s: number, t: number) => `여러분은 ${t}문제 중 ${s}문제를 맞혔어요`,
    great: "잘했어요! 여러분이 단어를 이해했어요",
    almost: "거의 다 왔어요! 단어를 한 번 더 살펴봐요",
    again: "다시", nextWord: "다음 단어", done: "끝내기", close: "닫기",
    preparing: "활동을 준비하고 있어요...",
    failed: "활동을 준비하지 못했어요.", retry: "다시 시도",
    preparingPic: "그림을 준비하고 있어요...",
    search: "사전", searchPh: "학급에 설명할 단어",
    exit: "발표 모드 끝내기", prev: "이전 단어", next: "다음 단어", listen: "듣기",
    letters: ["가", "나", "다", "라"],
  },
  th: {
    wordOf: (i: number, n: number) => `คำที่ ${i} จาก ${n}`,
    examples: "ตัวอย่าง", quiz: "ควิซทั้งห้อง", game: "เกมทั้งห้อง",
    nextExample: "ตัวอย่างถัดไป",
    learnEx: "ตัวอย่างเพื่อการเรียนรู้", fromGemara: "จากเกมารา",
    diagram: "แผนภาพ", diagramTag: "แผนภาพเพื่อการเรียนรู้",
    source: (q: ClassroomQuote) => `ตำรา ${q.tractate} ดัฟ ${q.daf} อามุด ${q.amud}`,
    question: (i: number, n: number) => `คำถามที่ ${i} จาก ${n}`,
    statement: (i: number, n: number) => `ข้อความที่ ${i} จาก ${n}`,
    nextQ: "คำถามถัดไป", nextS: "ข้อความถัดไป", toSummary: "ดูผลลัพธ์",
    tf: "จริงหรือไม่จริง?", yes: "จริง", no: "ไม่จริง",
    timeUp: "หมดเวลาแล้ว ทุกคนคิดว่าอย่างไร?",
    correct: "ถูกต้อง!", wrong: "ยังไม่ใช่",
    score: (s: number, t: number) => `ทุกคนตอบถูก ${s} จาก ${t} ข้อ`,
    great: "เก่งมาก! ทุกคนเข้าใจคำนี้แล้ว",
    almost: "เกือบแล้ว! มาทบทวนคำนี้อีกครั้งกัน",
    again: "อีกครั้ง", nextWord: "คำถัดไป", done: "เสร็จสิ้น", close: "ปิด",
    preparing: "กำลังเตรียมกิจกรรม...",
    failed: "เราเตรียมกิจกรรมไม่สำเร็จ", retry: "ลองอีกครั้ง",
    preparingPic: "กำลังเตรียมรูปภาพ...",
    search: "พจนานุกรม", searchPh: "คำที่จะอธิบายให้ทั้งห้องฟัง",
    exit: "ออกจากโหมดนำเสนอ", prev: "คำก่อนหน้า", next: "คำถัดไป", listen: "ฟัง",
    letters: ["ก", "ข", "ค", "ง"],
  },
  bn: {
    wordOf: (i: number, n: number) => `${n}টির মধ্যে শব্দ ${i}`,
    examples: "উদাহরণ", quiz: "ক্লাস কুইজ", game: "ক্লাসের খেলা",
    nextExample: "পরের উদাহরণ",
    learnEx: "শেখার উদাহরণ", fromGemara: "গেমারা থেকে",
    diagram: "চিত্র", diagramTag: "শেখার চিত্র",
    source: (q: ClassroomQuote) => `গ্রন্থ ${q.tractate}, দাফ ${q.daf}, আমুদ ${q.amud}`,
    question: (i: number, n: number) => `${n}টির মধ্যে প্রশ্ন ${i}`,
    statement: (i: number, n: number) => `${n}টির মধ্যে বাক্য ${i}`,
    nextQ: "পরের প্রশ্ন", nextS: "পরের বাক্য", toSummary: "ফলাফল দেখুন",
    tf: "সত্য না মিথ্যা?", yes: "সত্য", no: "মিথ্যা",
    timeUp: "সময় শেষ। তোমরা কী বলো?",
    correct: "ঠিক!", wrong: "পুরোপুরি নয়",
    score: (s: number, t: number) => `তোমরা ${t}টির মধ্যে ${s}টির ঠিক উত্তর দিয়েছ`,
    great: "দারুণ! তোমরা শব্দটা বুঝেছ",
    almost: "প্রায় হয়ে গেছে! চলো শব্দটা আরেকবার দেখি",
    again: "আবার", nextWord: "পরের শব্দ", done: "শেষ", close: "বন্ধ করুন",
    preparing: "কার্যক্রম তৈরি হচ্ছে...",
    failed: "আমরা কার্যক্রমটি তৈরি করতে পারিনি।", retry: "আবার চেষ্টা করুন",
    preparingPic: "ছবি তৈরি হচ্ছে...",
    search: "অভিধান", searchPh: "ক্লাসকে বোঝানোর জন্য একটি শব্দ",
    exit: "উপস্থাপনা মোড থেকে বের হোন", prev: "আগের শব্দ", next: "পরের শব্দ", listen: "শুনুন",
    letters: ["ক", "খ", "গ", "ঘ"],
  },
  da: {
    wordOf: (i: number, n: number) => `Ord ${i} af ${n}`,
    examples: "Eksempler", quiz: "Klassequiz", game: "Klassespil",
    nextExample: "Næste eksempel",
    learnEx: "Læringseksempel", fromGemara: "Fra Gemaraen",
    diagram: "Diagram", diagramTag: "Læringsdiagram",
    source: (q: ClassroomQuote) => `Traktat ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Spørgsmål ${i} af ${n}`,
    statement: (i: number, n: number) => `Påstand ${i} af ${n}`,
    nextQ: "Næste spørgsmål", nextS: "Næste påstand", toSummary: "Se resultatet",
    tf: "Sandt eller falsk?", yes: "Sandt", no: "Falsk",
    timeUp: "Tiden er gået. Hvad siger I?",
    correct: "Rigtigt!", wrong: "Ikke helt",
    score: (s: number, t: number) => `I fik ${s} ud af ${t} rigtige`,
    great: "Flot! I har forstået ordet",
    almost: "Næsten! Lad os gennemgå ordet igen",
    again: "Igen", nextWord: "Næste ord", done: "Færdig", close: "Luk",
    preparing: "Aktiviteten gøres klar...",
    failed: "Vi kunne ikke gøre aktiviteten klar.", retry: "Prøv igen",
    preparingPic: "Et billede gøres klar...",
    search: "Ordbog", searchPh: "Et ord, der skal forklares for klassen",
    exit: "Afslut præsentationstilstand", prev: "Forrige ord", next: "Næste ord", listen: "Lyt",
    letters: ["A", "B", "C", "D"],
  },
  hu: {
    wordOf: (i: number, n: number) => `Szó: ${i} / ${n}`,
    examples: "Példák", quiz: "Osztálykvíz", game: "Osztályjáték",
    nextExample: "Következő példa",
    learnEx: "Tanulópélda", fromGemara: "A Gemárából",
    diagram: "Ábra", diagramTag: "Szemléltető ábra",
    source: (q: ClassroomQuote) => `${q.tractate} traktátus, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Kérdés: ${i} / ${n}`,
    statement: (i: number, n: number) => `Állítás: ${i} / ${n}`,
    nextQ: "Következő kérdés", nextS: "Következő állítás", toSummary: "Az eredményhez",
    tf: "Igaz vagy hamis?", yes: "Igaz", no: "Hamis",
    timeUp: "Lejárt az idő. Mit mondtok?",
    correct: "Helyes!", wrong: "Nem egészen",
    score: (s: number, t: number) => `Helyes válaszaitok: ${s} / ${t}`,
    great: "Szép munka! Megértettétek a szót",
    almost: "Majdnem! Nézzük át még egyszer a szót",
    again: "Újra", nextWord: "Következő szó", done: "Kész", close: "Bezárás",
    preparing: "Készül a feladat...",
    failed: "Nem sikerült elkészíteni a feladatot.", retry: "Újrapróbálás",
    preparingPic: "Készül a kép...",
    search: "Szótár", searchPh: "Az osztálynak elmagyarázandó szó",
    exit: "Kilépés a bemutató módból", prev: "Előző szó", next: "Következő szó", listen: "Meghallgatás",
    letters: ["A", "B", "C", "D"],
  },
};

// Niqqud and tashkeel marks, so the word is still found in a voweled example.
const MARKS = "\u0591-\u05C7\u064B-\u065F\u0670";
function Highlight({ text, word }: { text: string; word: string }) {
  const w = word.trim().replace(new RegExp(`[${MARKS}]`, "g"), "");
  if (!w) return <>{text}</>;
  const pat = [...w].map((ch) => ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(`[${MARKS}]*`);
  const parts = text.split(new RegExp(`(${pat}[${MARKS}]*)`));
  if (parts.length < 2) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <mark key={i} className="cs-mark">{p}</mark> : <span key={i}>{p}</span>))}
    </>
  );
}

type StageProps = {
  word: string;
  definition: string;
  imageUrl: string | null;
  imageGenerating: boolean;
  examples: string[];
  /** An approved Gemara quote of this meaning, shown apart from our examples. */
  quote?: ClassroomQuote | null;
  set: WordSet;
  idx: number;
  /** A unit that lists meanings (Gemara phase A): position and links by meaning id. */
  items?: SetItem[];
  m?: string;
  lang: string;
  onNavigate: (w: string, m?: string) => void;
  onExit: () => void;
  onSearch: (q: string) => void;
  progress?: ClassProgress | null;
  /** Content review (2026-10-15): the activity comes in with the props; the
   *  stage asks the server for nothing and reports no projection. */
  preview?: Activity;
};

/** A managed Gemara unit (2026-10-18): the pilot unit, or a Gemara unit that
 *  lists approved meanings. Students see only what passed its approval, so
 *  nothing machine-made is added on top: no automatic niqqud, no synthetic
 *  voice. Every other unit and subject is unchanged. */
export const isManagedGemara = (set: Pick<WordSet, "id" | "subject">, items?: SetItem[]): boolean =>
  set.subject === "gemara" && (isPilotTopicId(set.id) || !!items?.some((i) => i.k !== "word"));

/** Hebrew and Arabic sets get a niqqud / tashkeel switch the teacher
 *  turns on or off for the class (Gadi 2026-10-04). Display only. Not in a
 *  managed Gemara unit (automatic niqqud is not approved content). */
export function ClassroomStage(props: StageProps) {
  const l = props.set.lang || props.lang;
  return (
    <NiqqudProvider available={(l === "he" || l === "ar") && !isManagedGemara(props.set, props.items)} lang={l === "ar" ? "ar" : "he"}>
      <StageInner {...props} />
    </NiqqudProvider>
  );
}

function StageInner({
  word, definition, imageUrl, imageGenerating, examples, quote, set, idx, items, m, lang, onNavigate, onExit, onSearch, progress, preview,
}: {
  word: string;
  definition: string;
  imageUrl: string | null;
  imageGenerating: boolean;
  examples: string[];
  quote?: ClassroomQuote | null;
  set: WordSet;
  idx: number;
  items?: SetItem[];
  m?: string;
  lang: string;
  onNavigate: (w: string, m?: string) => void;
  onExit: () => void;
  onSearch: (q: string) => void;
  progress?: ClassProgress | null;
  preview?: Activity;
}) {
  const L = set.lang || lang;
  const he = L === "he";
  const c: C = L === "he" || L === "en" || L === "ar" ? COPY[L] : COPY_MORE[L] ?? COPY.en;
  const dir = L === "he" || L === "ar" || L === "fa" ? "rtl" : "ltr";
  const { nq } = useNiqqud();
  const total = set.words.length;
  const hasPrev = idx > 0, hasNext = idx < total - 1;

  const [panel, setPanel] = useState<Panel>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [actState, setActState] = useState<"loading" | "ready" | "error">("loading");
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  // A pilot unit (Gemara phase B) asks with the teacher's token; every other
  // unit asks exactly as before, without one.
  const pilot = isPilotTopicId(set.id);
  // A real meaning of the unit (not an older word of a mixed unit).
  const isMeaning = !!m && !!items?.some((i) => i.m === m && i.k !== "word");
  const { user: authUser } = useAuth();
  // A school's own set asks with the token too (only its school may open it),
  // and its quiz and game are generated like any unit's.
  const withToken = pilot || isSchoolSetId(set.id);
  // A managed Gemara unit: no synthetic voice, and the quiz and game buttons
  // open only once their approved content is known to be there.
  const managed = isManagedGemara(set, items);
  const pilotUser = withToken ? authUser : null;
  const loadActivity = useCallback(async () => {
    if (preview) { setActivity(preview); setActState("ready"); return; }
    setActState("loading");
    try {
      const p = new URLSearchParams({ set: set.id, word, meaning: definition });
      if (m) p.set("m", m);
      const headers: Record<string, string> = {};
      if (pilotUser) headers.Authorization = `Bearer ${await pilotUser.getIdToken()}`;
      const r = await fetch(`/api/class-activity?${p.toString()}`, withToken ? { headers } : undefined);
      // A meaning (or a pilot word) whose quiz and game are not approved yet:
      // nothing to run, the buttons stay off (phase C: in every unit).
      if ((pilot || isMeaning) && r.status === 404) { setActivity({ quiz: [], game: [] }); setActState("ready"); return; }
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as Activity;
      setActivity(d);
      setActState("ready");
    } catch {
      setActState("error");
    }
  }, [set.id, word, definition, m, pilot, withToken, pilotUser, preview, isMeaning]);

  // Prepare the activities as soon as the word is on screen, so the
  // buttons open instantly when the teacher taps them.
  useEffect(() => {
    let alive = true;
    void (async () => { if (alive) await loadActivity(); })();
    return () => { alive = false; };
  }, [loadActivity]);

  // While a panel is open, the arrow keys must not page the word set.
  useEffect(() => {
    document.body.dataset.classPanel = panel ? "open" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && panel) setPanel(null); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.dataset.classPanel = ""; };
  }, [panel]);

  // An approved teaching diagram of this meaning (Gemara pilot): one more
  // button, a full-width 16:9 panel. Meanings without one are unchanged.
  const diagram = m ? items?.find((i) => i.m === m)?.dg : undefined;
  // A short line on this meaning in this unit's tractate (phase C, optional).
  const ctx = isMeaning ? items?.find((i) => i.m === m)?.ctx : undefined;

  // Step by position: by meaning when the unit lists meanings, else by word.
  const goTo = (i: number) => {
    const it = items?.[i];
    setPanel(null);
    if (it) onNavigate(it.w, it.m);
    else if (set.words[i] !== undefined) onNavigate(set.words[i]);
  };

  // What the teacher projects feeds the principal dashboard (Gadi
  // 2026-10-10): each word shown, and each class quiz or game opened. The
  // server counts one per school, day, kind, set and word, and the first
  // quiz or game also ticks the dashboard checklist.
  const { user } = useAuth();
  const report = useCallback((kind: "word" | "quiz" | "game") => {
    if (!user || preview) return;
    void user.getIdToken().then((t) => fetch("/api/schools/projection", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
      body: JSON.stringify({ kind, word, setId: set.id, subject: set.subject, title: set.title, grade: set.grade ?? "", ...(m && isMeaning ? { m } : {}) }),
    })).catch(() => {});
  }, [user, word, set.id, set.subject, set.title, set.grade, m, preview, isMeaning]);
  useEffect(() => { report("word"); }, [word, set.id, user, m]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (panel === "quiz" || panel === "game") report(panel);
  }, [panel]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="cs-root" dir={dir} lang={L}>
      <style>{CSS}</style>
      <div className="cs-glow" aria-hidden="true" />

      {/* Top bar: set + position + tools */}
      <header className="cs-top">
        <div className="cs-set">
          <span className="cs-set-title">{set.title}</span>
          {set.grade && <span className="cs-chip">{set.grade}</span>}
        </div>
        <nav className="cs-dots" aria-label={c.wordOf(idx + 1, total)}>
          {set.words.map((w, i) => (
            <button
              key={w + i}
              type="button"
              className={`cs-dot${i === idx ? " is-on" : ""}${i < idx ? " is-past" : ""}`}
              aria-label={w}
              aria-current={i === idx ? "step" : undefined}
              title={w}
              onClick={() => i !== idx && goTo(i)}
            />
          ))}
          <span className="cs-pos">{c.wordOf(idx + 1, total)}</span>
        </nav>
        <div className="cs-tools">
          <NiqqudToggle />
          {searchOpen ? (
            <form
              className="cs-search"
              onSubmit={(e) => { e.preventDefault(); const v = q.trim(); if (v) onSearch(v); }}
            >
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.searchPh} aria-label={c.search} dir="auto" />
              <button type="submit" aria-label={c.search}><SearchIcon /></button>
            </form>
          ) : (
            <button type="button" className="cs-tool" onClick={() => setSearchOpen(true)}><SearchIcon /> {c.search}</button>
          )}
          <button type="button" className="cs-tool cs-icon" onClick={onExit} aria-label={c.exit} title={c.exit}><XIcon /></button>
        </div>
      </header>

      {progress && <div className="cs-progress"><ClassProgressChip progress={progress} lang={L} /></div>}

      {/* The word */}
      <main className={`cs-main${!imageUrl && !imageGenerating ? " no-pic" : ""}`}>
        <section className="cs-text">
          <div className="cs-word-row">
            <h1 className="cs-word">{nq(word)}</h1>
            {!managed && <TTSButton text={word} audioLang={L} useOpenAI ariaLabel={c.listen} className="cs-tts" />}
          </div>
          <p className="cs-def">{nq(definition)}</p>
          {ctx && <p className="cs-ctx">{nq(ctx)}</p>}
        </section>
        {(imageUrl || imageGenerating) && (
          <figure className="cs-pic">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={word} />
            ) : (
              <div className="cs-pic-wait" aria-busy="true"><span className="cs-spin" />{c.preparingPic}</div>
            )}
          </figure>
        )}
      </main>

      {/* Actions */}
      <div className="cs-actions">
        <button type="button" className="cs-act cs-act-ex" onClick={() => setPanel("examples")} disabled={!examples.length && !quote}>
          <ListIcon /> {c.examples}
        </button>
        {diagram && (
          <button type="button" className="cs-act cs-act-ex" onClick={() => setPanel("diagram")}>
            <DiagramIcon /> {c.diagram}
          </button>
        )}
        <button type="button" className="cs-act cs-act-quiz" onClick={() => setPanel("quiz")} disabled={managed ? !(actState === "ready" && !!activity?.quiz.length) : actState === "ready" && !!activity && !activity.quiz.length}>
          <QuizIcon /> {c.quiz}
        </button>
        <button type="button" className="cs-act cs-act-game" onClick={() => setPanel("game")} disabled={managed ? !(actState === "ready" && !!activity?.game.length) : actState === "ready" && !!activity && !activity.game.length}>
          <GameIcon /> {c.game}
        </button>
      </div>

      {/* Word-set navigation */}
      <button type="button" className="cs-nav cs-nav-prev" onClick={() => hasPrev && goTo(idx - 1)} disabled={!hasPrev} aria-label={c.prev}><Chevron back /></button>
      <button type="button" className="cs-nav cs-nav-next" onClick={() => hasNext && goTo(idx + 1)} disabled={!hasNext} aria-label={c.next}><Chevron /></button>

      {panel && (
        <div className={`cs-overlay${panel === "diagram" ? " is-wide" : ""}`} role="dialog" aria-modal="true">
          <button type="button" className="cs-close" onClick={() => setPanel(null)} aria-label={c.close}><XIcon /></button>
          {panel === "diagram" && diagram && <DiagramPanel dg={diagram} c={c} />}
          {panel === "examples" && <ExamplesPanel examples={examples} quote={quote ?? null} labeled={isMeaning} word={word} c={c} />}
          {(panel === "quiz" || panel === "game") && actState !== "ready" && (
            <div className="cs-card cs-center">
              {actState === "loading" ? (
                <><span className="cs-spin big" /><div className="cs-muted">{c.preparing}</div></>
              ) : (
                <><div className="cs-muted">{c.failed}</div><button type="button" className="cs-btn" onClick={() => void loadActivity()}>{c.retry}</button></>
              )}
            </div>
          )}
          {panel === "quiz" && actState === "ready" && activity && (
            <QuizPanel key={`q-${word}${m ?? ""}`} items={activity.quiz} c={c} onNextWord={hasNext ? () => goTo(idx + 1) : undefined} onDone={() => setPanel(null)} />
          )}
          {panel === "game" && actState === "ready" && activity && (
            <GamePanel key={`g-${word}${m ?? ""}`} items={activity.game} c={c} onNextWord={hasNext ? () => goTo(idx + 1) : undefined} onDone={() => setPanel(null)} />
          )}
        </div>
      )}
    </div>
  );
}

type C = typeof COPY.he;

/** Our examples, and (a unit that lists meanings, Gemara) a label on each of them
 *  plus the approved Gemara quote as its own card with its source. A unit
 *  without meanings renders exactly as before. */
function ExamplesPanel({ examples, quote, labeled, word, c }: { examples: string[]; quote: ClassroomQuote | null; labeled: boolean; word: string; c: C }) {
  const { nq } = useNiqqud();
  const list = examples.slice(0, 3);
  const steps = list.length + (quote ? 1 : 0);
  const [shown, setShown] = useState(1);
  return (
    <div className="cs-card cs-ex">
      <div className="cs-eyebrow">{c.examples}</div>
      <ol className="cs-ex-list">
        {list.slice(0, shown).map((ex, i) => (
          <li key={i} className="cs-ex-item"><span className="cs-ex-n">{i + 1}</span><span>{labeled && <span className="cs-ex-tag">{c.learnEx}</span>}<Highlight text={nq(ex)} word={word} /></span></li>
        ))}
      </ol>
      {quote && shown > list.length && (
        <figure className="cs-quote">
          <span className="cs-quote-tag">{c.fromGemara}</span>
          <blockquote className="cs-quote-text"><Highlight text={nq(quote.text)} word={word} /></blockquote>
          <figcaption className="cs-quote-src">{c.source(quote)}</figcaption>
        </figure>
      )}
      {shown < steps && (
        <button type="button" className="cs-btn" onClick={() => setShown((n) => n + 1)}>{c.nextExample}</button>
      )}
    </div>
  );
}

/** A teaching diagram on a 16:9 board that fills the projector (Gemara pilot,
 *  ורמינהו). Sizes follow the board's width, so it reads the same from the
 *  back row on any screen. Our own wording, tagged as a learning diagram:
 *  no quote and no source line ever appear on it. In RTL the first source
 *  sits on the right. */
function DiagramPanel({ dg, c }: { dg: SetDiagram; c: C }) {
  const { nq } = useNiqqud();
  return (
    <div className="cs-dg" data-layout={dg.layout}>
      <span className="cs-dg-tag">{c.diagramTag}</span>
      <h2 className="cs-dg-title">{nq(dg.title)}</h2>
      <p className="cs-dg-sub">{nq(dg.sub)}</p>
      <div className="cs-dg-row">
        <div className="cs-dg-card" data-side="a">
          <span className="cs-dg-pill">{nq(dg.a.label)}</span>
          {dg.a.small && <span className="cs-dg-small">{nq(dg.a.small)}</span>}
          <span className="cs-dg-body">{nq(dg.a.text)}</span>
        </div>
        <div className="cs-dg-clash">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" /></svg>
          <span>{nq(dg.clash)}</span>
        </div>
        <div className="cs-dg-card" data-side="b">
          <span className="cs-dg-pill">{nq(dg.b.label)}</span>
          {dg.b.small && <span className="cs-dg-small">{nq(dg.b.small)}</span>}
          <span className="cs-dg-body">{nq(dg.b.text)}</span>
        </div>
      </div>
      <DownArrow />
      <div className="cs-dg-q"><b>{nq(dg.question.label)}:</b> {nq(dg.question.text)}</div>
      <DownArrow />
      <div className="cs-dg-next"><b>{nq(dg.next.label)}:</b> {nq(dg.next.text)}</div>
      {dg.note && <div className="cs-dg-note">{nq(dg.note)}</div>}
    </div>
  );
}
function DownArrow() {
  return <svg className="cs-dg-arrow" viewBox="0 0 24 24" {...S} strokeWidth={2.6} aria-hidden="true"><path d="M12 4v16M5 13l7 7 7-7" /></svg>;
}

function Summary({ score, total, c, onAgain, onNextWord, onDone }: {
  score: number; total: number; c: C; onAgain: () => void; onNextWord?: () => void; onDone: () => void;
}) {
  const great = score >= total - (total >= 5 ? 1 : 0);
  return (
    <div className="cs-card cs-center cs-summary">
      {great && <KidsCelebration runId={1} />}
      <div className={`cs-ring${great ? " is-great" : ""}`} style={{ ["--p" as string]: `${total ? Math.round((score / total) * 100) : 0}%` }}><span>{score}/{total}</span></div>
      <div className="cs-sum-title">{great ? c.great : c.almost}</div>
      <div className="cs-muted">{c.score(score, total)}</div>
      <div className="cs-row">
        <button type="button" className="cs-btn ghost" onClick={onAgain}>{c.again}</button>
        {onNextWord ? (
          <button type="button" className="cs-btn" onClick={onNextWord}>{c.nextWord}</button>
        ) : (
          <button type="button" className="cs-btn" onClick={onDone}>{c.done}</button>
        )}
      </div>
    </div>
  );
}

function QuizPanel({ items, c, onNextWord, onDone }: { items: QuizItem[]; c: C; onNextWord?: () => void; onDone: () => void }) {
  const { nq } = useNiqqud();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const it = items[i];
  if (over || !it) {
    return <Summary score={score} total={items.length} c={c} onAgain={() => { setI(0); setPicked(null); setScore(0); setOver(false); }} onNextWord={onNextWord} onDone={onDone} />;
  }
  const pick = (k: number) => { if (picked !== null) return; setPicked(k); if (k === it.answer) setScore((s) => s + 1); };
  const last = i === items.length - 1;
  return (
    <div className="cs-card cs-quiz">
      <div className="cs-eyebrow">{c.quiz} · {c.question(i + 1, items.length)}</div>
      <div className="cs-q">{nq(it.q)}</div>
      <div className="cs-tiles">
        {it.options.map((o, k) => {
          const state = picked === null ? "" : k === it.answer ? " is-right" : k === picked ? " is-wrong" : " is-dim";
          return (
            <button key={k} type="button" className={`cs-tile t${k}${state}`} onClick={() => pick(k)} disabled={picked !== null}>
              <span className="cs-letter">{c.letters[k]}</span><span className="cs-tile-text">{nq(o)}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="cs-reveal">
          <span className={`cs-verdict${picked === it.answer ? " ok" : " no"}`}>{picked === it.answer ? c.correct : c.wrong}</span>
          <span className="cs-explain">{nq(it.explain)}</span>
          <button type="button" className="cs-btn" onClick={() => { if (last) setOver(true); else { setI(i + 1); setPicked(null); } }}>{last ? c.toSummary : c.nextQ}</button>
        </div>
      )}
    </div>
  );
}

const GAME_SECONDS = 10;

function GamePanel({ items, c, onNextWord, onDone }: { items: GameItem[]; c: C; onNextWord?: () => void; onDone: () => void }) {
  const { nq } = useNiqqud();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [left, setLeft] = useState(GAME_SECONDS);
  useEffect(() => {
    if (picked !== null || over) return;
    const id = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [i, picked, over]);
  const it = items[i];
  const pct = useMemo(() => (left / GAME_SECONDS) * 100, [left]);
  if (over || !it) {
    return <Summary score={score} total={items.length} c={c} onAgain={() => { setI(0); setPicked(null); setScore(0); setOver(false); setLeft(GAME_SECONDS); }} onNextWord={onNextWord} onDone={onDone} />;
  }
  const pick = (v: boolean) => { if (picked !== null) return; setPicked(v); if (v === it.t) setScore((s) => s + 1); };
  const last = i === items.length - 1;
  return (
    <div className="cs-card cs-game">
      <div className="cs-game-head">
        <div className="cs-eyebrow">{c.tf} · {c.statement(i + 1, items.length)}</div>
        <div className="cs-timer" style={{ ["--p" as string]: `${pct}%` }} aria-label={`${left}`}><span>{left}</span></div>
      </div>
      <div className="cs-q cs-statement">{nq(it.s)}</div>
      {picked === null && left === 0 && <div className="cs-muted cs-timeup">{c.timeUp}</div>}
      <div className="cs-tf">
        <button type="button" className={`cs-tf-btn yes${picked === null ? "" : it.t ? " is-right" : picked ? " is-wrong" : " is-dim"}`} onClick={() => pick(true)} disabled={picked !== null}>
          <CheckIcon /> {c.yes}
        </button>
        <button type="button" className={`cs-tf-btn no${picked === null ? "" : !it.t ? " is-right" : !picked ? " is-wrong" : " is-dim"}`} onClick={() => pick(false)} disabled={picked !== null}>
          <XIcon /> {c.no}
        </button>
      </div>
      {picked !== null && (
        <div className="cs-reveal">
          <span className={`cs-verdict${picked === it.t ? " ok" : " no"}`}>{picked === it.t ? c.correct : c.wrong}</span>
          <span className="cs-explain">{nq(it.explain)}</span>
          <button type="button" className="cs-btn" onClick={() => { if (last) setOver(true); else { setI(i + 1); setPicked(null); setLeft(GAME_SECONDS); } }}>{last ? c.toSummary : c.nextS}</button>
        </div>
      )}
    </div>
  );
}

/* ── icons ─────────────────────────────────────────────── */
const S = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
function SearchIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" {...S}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>; }
function XIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" {...S}><path d="M18 6 6 18M6 6l12 12" /></svg>; }
function CheckIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" {...S} strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>; }
function ListIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" {...S}><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1" /><circle cx="3.5" cy="12" r="1" /><circle cx="3.5" cy="18" r="1" /></svg>; }
function QuizIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="9.5" /><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.8-2.7 2.4-2.7 4" /><path d="M12 17.6v.01" /></svg>; }
function DiagramIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" {...S}><rect x="2.5" y="3.5" width="7" height="6" rx="1.5" /><rect x="14.5" y="3.5" width="7" height="6" rx="1.5" /><rect x="6.5" y="15" width="11" height="5.5" rx="1.5" /><path d="M6 9.5v2.5h12V9.5M12 12v3" /></svg>; }
function GameIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" {...S}><rect x="2.5" y="7" width="19" height="11" rx="5.5" /><path d="M7.5 10.5v4M5.5 12.5h4" /><path d="M15.5 12h.01M18 14h.01" /></svg>; }
function Chevron({ back }: { back?: boolean }) {
  // In RTL the "next" arrow points left; the button sits on the left edge.
  return <svg width="34" height="34" viewBox="0 0 24 24" {...S} strokeWidth={2.4}><path d={back ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} /></svg>;
}

/* ── styles (projector: light, big, calm) ─────────────── */
const CSS = `
.cs-root{--ink:#0B1220;--soft:#475569;--teal:#0EA5A5;--deep:#0B6E6E;--line:#E2EAE8;--paper:#FFFFFF;
  position:fixed;inset:0;z-index:60;overflow:hidden;background:linear-gradient(180deg,#F5FAF9 0%,#FFFFFF 70%);color:var(--ink);
  display:grid;grid-template-rows:auto auto 1fr auto;padding:clamp(14px,2.2vh,26px) clamp(18px,3vw,48px) clamp(16px,3vh,34px);}
.cs-glow{position:absolute;inset:-20% -10% auto auto;width:60vw;height:60vw;border-radius:50%;
  background:radial-gradient(circle,rgba(14,165,165,.13),rgba(14,165,165,0) 62%);pointer-events:none}
.cs-top{grid-row:1;position:relative;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px}
.cs-set{display:flex;align-items:center;gap:10px;min-width:0}
.cs-set-title{font-weight:700;font-size:clamp(15px,1.25vw,20px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cs-chip{font-size:13px;font-weight:600;color:var(--deep);background:#E3F4F2;border-radius:999px;padding:3px 10px;white-space:nowrap}
.cs-dots{display:flex;align-items:center;gap:7px}
.cs-dot{width:11px;height:11px;border-radius:99px;border:0;padding:0;background:#D5E1DE;cursor:pointer;transition:width .25s ease,background .25s ease}
.cs-dot.is-past{background:#8FD3CE}
.cs-dot.is-on{width:30px;background:var(--teal)}
.cs-dot:focus-visible,.cs-tool:focus-visible,.cs-act:focus-visible,.cs-btn:focus-visible,.cs-tile:focus-visible,.cs-tf-btn:focus-visible,.cs-nav:focus-visible,.cs-close:focus-visible{outline:3px solid #0EA5A5;outline-offset:3px}
.cs-pos{margin-inline-start:8px;font-size:14px;font-weight:600;color:var(--soft);white-space:nowrap}
.cs-tools{display:flex;justify-content:flex-end;align-items:center;gap:10px}
.cs-tool{display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 16px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.85);
  color:var(--deep);font:inherit;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 2px 10px -6px rgba(15,40,50,.3)}
.cs-tool.cs-icon{width:44px;padding:0;justify-content:center;color:#64748B}
.cs-search{display:flex;align-items:center;height:44px;border:1.5px solid var(--teal);border-radius:999px;background:#fff;overflow:hidden;box-shadow:0 6px 18px -10px rgba(14,165,165,.6)}
.cs-search input{border:0;outline:0;font:inherit;font-size:16px;padding:0 16px;width:min(300px,30vw);background:transparent;color:var(--ink)}
.cs-search button{border:0;background:var(--teal);color:#fff;height:100%;width:48px;display:grid;place-items:center;cursor:pointer}
.cs-progress{grid-row:2;display:flex;justify-content:center;margin-top:10px;position:relative}
.cs-main{grid-row:3;position:relative;display:grid;grid-template-columns:minmax(0,auto) auto;justify-content:center;align-items:center;gap:clamp(28px,4.5vw,80px);
  padding:clamp(10px,2vh,24px) clamp(48px,6vw,110px);min-height:0}
.cs-main.no-pic{grid-template-columns:minmax(0,1fr);text-align:center;justify-items:center}
.cs-text{min-width:0}
.cs-word-row{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.cs-main.no-pic .cs-word-row{justify-content:center}
.cs-word{margin:0;font-size:clamp(52px,min(8.2vw,14vh),140px);line-height:1.02;font-weight:800;letter-spacing:-.01em;color:var(--deep);text-wrap:balance}
.cs-tts{width:56px;height:56px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--teal);display:inline-grid;place-items:center;cursor:pointer;
  box-shadow:0 6px 18px -10px rgba(14,165,165,.55);flex-shrink:0}
.cs-tts svg{width:26px;height:26px}
.cs-def{margin:clamp(14px,2.6vh,28px) 0 0;font-size:clamp(22px,min(2.5vw,4.4vh),42px);line-height:1.45;font-weight:600;color:#1E293B;max-width:30ch;text-wrap:pretty}
.cs-main.no-pic .cs-def{max-width:36ch}
.cs-ctx{margin:clamp(8px,1.4vh,14px) 0 0;font-size:clamp(16px,min(1.6vw,2.8vh),26px);line-height:1.45;font-weight:600;color:#0E7490;max-width:36ch}
.cs-pic{margin:0;justify-self:center;width:min(42vw,52vh,560px);aspect-ratio:1/1;border-radius:32px;overflow:hidden;background:#fff;
  box-shadow:0 30px 60px -28px rgba(15,50,60,.38),0 0 0 10px #fff,0 0 0 11px var(--line)}
.cs-pic img{width:100%;height:100%;object-fit:cover;display:block}
.cs-pic-wait{height:100%;display:grid;place-items:center;align-content:center;gap:14px;color:#94A3B8;font-size:16px;
  background:linear-gradient(110deg,#F1F5F4 30%,#FAFCFB 50%,#F1F5F4 70%);background-size:200% 100%;animation:cs-sheen 1.6s linear infinite}
@keyframes cs-sheen{to{background-position:-200% 0}}
.cs-actions{grid-row:4;position:relative;display:flex;justify-content:center;gap:clamp(12px,1.6vw,22px);flex-wrap:wrap}
.cs-act{display:inline-flex;align-items:center;gap:12px;height:clamp(58px,8vh,76px);padding:0 clamp(22px,2.4vw,38px);border-radius:999px;border:0;cursor:pointer;
  font:inherit;font-size:clamp(18px,1.7vw,25px);font-weight:700;color:#fff;transition:transform .15s ease,box-shadow .2s ease}
.cs-act:hover{transform:translateY(-2px)}
.cs-act:active{transform:translateY(0) scale(.98)}
.cs-act:disabled{opacity:.45;cursor:default;transform:none}
.cs-act-ex{background:#fff;color:var(--deep);border:2px solid #BFE5E1;box-shadow:0 14px 30px -18px rgba(14,165,165,.6)}
.cs-act-quiz{background:linear-gradient(135deg,#14B8B0,#0B7F84);box-shadow:0 16px 34px -16px rgba(14,140,150,.85)}
.cs-act-game{background:linear-gradient(135deg,#8B5CF6,#6D28D9);box-shadow:0 16px 34px -16px rgba(109,40,217,.8)}
.cs-nav{position:absolute;top:50%;transform:translateY(-50%);width:clamp(52px,4.4vw,68px);height:clamp(52px,4.4vw,68px);border-radius:999px;border:1px solid var(--line);
  background:rgba(255,255,255,.92);color:var(--deep);display:grid;place-items:center;cursor:pointer;box-shadow:0 10px 26px -14px rgba(15,50,60,.45);z-index:2}
.cs-nav:disabled{opacity:.3;cursor:default}
.cs-root[dir="rtl"] .cs-nav-prev{right:clamp(10px,1.4vw,24px)} .cs-root[dir="rtl"] .cs-nav-next{left:clamp(10px,1.4vw,24px)}
.cs-root[dir="ltr"] .cs-nav-prev{left:clamp(10px,1.4vw,24px)} .cs-root[dir="ltr"] .cs-nav-next{right:clamp(10px,1.4vw,24px)}
.cs-root[dir="ltr"] .cs-nav svg{transform:scaleX(-1)}
.cs-overlay{position:absolute;inset:0;z-index:5;display:grid;place-items:center;padding:clamp(16px,4vh,48px) clamp(16px,5vw,80px);
  background:rgba(240,247,246,.86);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);animation:cs-in .22s ease}
@keyframes cs-in{from{opacity:0}to{opacity:1}}
.cs-close{position:absolute;top:clamp(14px,2.2vh,26px);inset-inline-end:clamp(18px,3vw,48px);width:52px;height:52px;border-radius:999px;border:1px solid var(--line);
  background:#fff;color:#64748B;display:grid;place-items:center;cursor:pointer;box-shadow:0 6px 18px -10px rgba(15,40,50,.4)}
.cs-card{width:min(1100px,100%);max-height:100%;overflow:auto;background:var(--paper);border-radius:36px;border:1px solid var(--line);
  box-shadow:0 40px 90px -40px rgba(15,50,60,.45);padding:clamp(26px,4.4vh,52px) clamp(26px,3.6vw,60px);animation:cs-pop .28s cubic-bezier(.2,.9,.3,1.2)}
@keyframes cs-pop{from{transform:translateY(14px) scale(.98);opacity:0}to{transform:none;opacity:1}}
.cs-center{display:flex;flex-direction:column;align-items:center;text-align:center;gap:18px}
.cs-eyebrow{font-size:clamp(14px,1.2vw,18px);font-weight:700;letter-spacing:.02em;color:var(--teal);margin-bottom:clamp(12px,2vh,22px)}
.cs-muted{color:var(--soft);font-size:clamp(16px,1.4vw,22px)}
.cs-ex-list{list-style:none;margin:0 0 26px;padding:0;display:grid;gap:clamp(14px,2.4vh,26px)}
.cs-ex-item{display:flex;gap:18px;align-items:baseline;font-size:clamp(24px,2.6vw,42px);line-height:1.45;font-weight:500;animation:cs-pop .3s ease}
.cs-ex-tag{display:block;width:max-content;font-size:clamp(12px,1vw,15px);font-weight:700;color:#0E7490;background:#E3F4F2;border-radius:999px;padding:2px 12px;margin-bottom:6px}
.cs-quote{margin:0 0 26px;padding:clamp(18px,2.6vh,28px) clamp(20px,2.4vw,34px);border-radius:24px;background:#FFF7E6;border-inline-start:6px solid #F3B544;animation:cs-pop .3s ease}
.cs-quote-tag{display:inline-block;font-size:clamp(12px,1vw,15px);font-weight:800;color:#92400E;background:#FDE7B5;border-radius:999px;padding:2px 12px;margin-bottom:10px}
.cs-quote-text{margin:0;font-family:"Frank Ruhl Libre","David Libre",Georgia,serif;font-size:clamp(26px,2.8vw,44px);line-height:1.5;font-weight:600;color:var(--deep)}
.cs-quote-src{margin-top:10px;font-size:clamp(14px,1.3vw,19px);font-weight:700;color:#92400E}
.cs-ex-n{flex-shrink:0;width:1.5em;height:1.5em;border-radius:999px;background:#E3F4F2;color:var(--deep);font-weight:800;font-size:.7em;display:grid;place-items:center;transform:translateY(-.12em)}
.cs-mark{background:linear-gradient(transparent 58%,#B9EDE7 58%);color:var(--deep);font-weight:800;padding:0 .08em}
.cs-q{font-size:clamp(26px,2.8vw,46px);line-height:1.3;font-weight:700;margin-bottom:clamp(18px,3.4vh,36px);text-wrap:balance}
.cs-tiles{display:grid;grid-template-columns:1fr 1fr;gap:clamp(12px,1.6vw,20px)}
.cs-tile{display:flex;align-items:center;gap:16px;min-height:clamp(78px,11vh,112px);padding:14px 20px;border-radius:22px;border:2px solid transparent;cursor:pointer;
  font:inherit;font-size:clamp(20px,1.9vw,30px);font-weight:600;text-align:start;color:var(--ink);transition:transform .15s ease,opacity .2s ease,background .2s ease}
.cs-tile:hover:not(:disabled){transform:translateY(-2px)}
.cs-tile.t0{background:#E6F7F5;border-color:#B5E6E0} .cs-tile.t1{background:#F1ECFE;border-color:#D8CBFB}
.cs-tile.t2{background:#FEF3E2;border-color:#F8D9A8} .cs-tile.t3{background:#E7F0FD;border-color:#BCD3F7}
.cs-letter{flex-shrink:0;width:48px;height:48px;border-radius:14px;background:#fff;display:grid;place-items:center;font-weight:800;font-size:22px;color:var(--deep);box-shadow:0 2px 8px -4px rgba(0,0,0,.2)}
.cs-tile.is-right{background:#DCFCE7;border-color:#22C55E;transform:scale(1.02)}
.cs-tile.is-right .cs-letter{background:#16A34A;color:#fff}
.cs-tile.is-wrong{background:#FEE2E2;border-color:#EF4444}
.cs-tile.is-wrong .cs-letter{background:#DC2626;color:#fff}
.cs-tile.is-dim{opacity:.45}
.cs-reveal{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-top:clamp(18px,3vh,30px);padding-top:clamp(16px,2.6vh,24px);border-top:1px solid var(--line)}
.cs-verdict{font-weight:800;font-size:clamp(22px,2vw,30px)} .cs-verdict.ok{color:#15803D} .cs-verdict.no{color:#B91C1C}
.cs-explain{flex:1 1 320px;font-size:clamp(18px,1.6vw,24px);color:#334155;line-height:1.45}
.cs-btn{height:clamp(54px,7vh,66px);padding:0 clamp(24px,2.4vw,36px);border-radius:999px;border:0;background:var(--teal);color:#fff;font:inherit;
  font-size:clamp(18px,1.6vw,23px);font-weight:700;cursor:pointer;box-shadow:0 12px 26px -14px rgba(14,140,150,.9)}
.cs-btn.ghost{background:#fff;color:var(--deep);border:2px solid #BFE5E1;box-shadow:none}
.cs-row{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-top:8px}
.cs-game-head{display:flex;align-items:center;justify-content:space-between;gap:16px}
.cs-game-head .cs-eyebrow{margin:0}
.cs-timer{--p:100%;width:76px;height:76px;border-radius:999px;display:grid;place-items:center;flex-shrink:0;
  background:conic-gradient(var(--teal) var(--p),#E2EAE8 0);transition:background .9s linear}
.cs-timer span{width:62px;height:62px;border-radius:999px;background:#fff;display:grid;place-items:center;font-size:28px;font-weight:800;color:var(--deep)}
.cs-statement{margin-top:clamp(14px,2.4vh,26px)}
.cs-timeup{margin:-8px 0 18px}
.cs-tf{display:grid;grid-template-columns:1fr 1fr;gap:clamp(14px,2vw,26px)}
.cs-tf-btn{display:inline-flex;align-items:center;justify-content:center;gap:14px;height:clamp(96px,15vh,150px);border-radius:28px;border:0;cursor:pointer;
  font:inherit;font-size:clamp(28px,3vw,48px);font-weight:800;color:#fff;transition:transform .15s ease,opacity .2s ease,box-shadow .2s ease}
.cs-tf-btn svg{width:clamp(30px,3vw,46px);height:clamp(30px,3vw,46px)}
.cs-tf-btn.yes{background:linear-gradient(135deg,#22C55E,#15803D);box-shadow:0 18px 36px -18px rgba(21,128,61,.9)}
.cs-tf-btn.no{background:linear-gradient(135deg,#F87171,#DC2626);box-shadow:0 18px 36px -18px rgba(220,38,38,.9)}
.cs-tf-btn:hover:not(:disabled){transform:translateY(-3px)}
.cs-tf-btn.is-right{outline:6px solid #FDE047;outline-offset:4px}
.cs-tf-btn.is-wrong{opacity:.6}
.cs-tf-btn.is-dim{opacity:.35}
.cs-summary{gap:14px}
.cs-ring{--p:100%;width:clamp(130px,16vh,180px);height:clamp(130px,16vh,180px);border-radius:999px;display:grid;place-items:center;background:conic-gradient(#F59E0B var(--p),#E2EAE8 0)}
.cs-ring.is-great{background:conic-gradient(#0EA5A5 var(--p),#E2EAE8 0)}
.cs-ring span{width:82%;height:82%;border-radius:999px;background:#fff;display:grid;place-items:center;font-size:clamp(34px,4vw,54px);font-weight:800;color:var(--deep)}
.cs-sum-title{font-size:clamp(28px,3vw,46px);font-weight:800;text-wrap:balance}
.cs-spin{width:26px;height:26px;border-radius:999px;border:3px solid #D5E1DE;border-top-color:var(--teal);animation:cs-rot .9s linear infinite;display:inline-block}
.cs-spin.big{width:54px;height:54px;border-width:5px}
@keyframes cs-rot{to{transform:rotate(360deg)}}
.cs-overlay.is-wide{padding:clamp(10px,2.4vh,28px) clamp(10px,1.6vw,28px)}
.cs-overlay.is-wide .cs-close{z-index:2}
.cs-dg{container-type:inline-size;position:relative;width:min(100%,calc((100vh - 2 * clamp(10px,2.4vh,28px)) * 16 / 9));aspect-ratio:16/9;max-height:100%;
  background:#FBFAF7;border-radius:clamp(18px,1.6vw,32px);border:1px solid var(--line);box-shadow:0 40px 90px -40px rgba(15,50,60,.45);
  padding:2.4cqw 5cqw 2.2cqw;display:flex;flex-direction:column;align-items:stretch;justify-content:center;gap:1.05cqw;color:#0F3D3E;overflow:hidden;animation:cs-pop .28s cubic-bezier(.2,.9,.3,1.2)}
.cs-dg-tag{position:absolute;top:1.6cqw;inset-inline-start:2cqw;font-size:1.4cqw;font-weight:700;color:#0E7490;background:#E3F4F2;border-radius:999px;padding:.3cqw 1.1cqw}
.cs-dg-title{margin:0;text-align:center;font-size:5.2cqw;line-height:1.05;font-weight:800;color:var(--teal)}
.cs-dg-sub{margin:0 auto;text-align:center;font-size:2.05cqw;line-height:1.35;font-weight:500;max-width:70cqw;text-wrap:balance}
.cs-dg-row{display:grid;grid-template-columns:1fr 13cqw 1fr;align-items:center;gap:1.6cqw;margin-top:.6cqw}
.cs-dg-card{background:#fff;border-radius:1.6cqw;padding:1.5cqw 2cqw;border:.14cqw solid #E3F4F2;box-shadow:0 1cqw 2.4cqw -1.3cqw rgba(15,61,62,.45);display:flex;flex-direction:column;align-items:flex-start;gap:.5cqw}
.cs-dg-pill{background:var(--teal);color:#fff;font-weight:800;font-size:1.6cqw;padding:.35cqw 1.3cqw;border-radius:999px}
.cs-dg-small{color:#5B6472;font-size:1.5cqw;font-weight:500}
.cs-dg-body{font-size:3cqw;font-weight:700;line-height:1.25}
.cs-dg-clash{display:flex;flex-direction:column;align-items:center;gap:.4cqw;color:#E0705F;font-weight:800;font-size:1.6cqw;text-align:center;line-height:1.2}
.cs-dg-clash svg{width:5.4cqw;height:5.4cqw;filter:drop-shadow(0 .4cqw .7cqw rgba(240,138,126,.45))}
.cs-dg-arrow{width:2.6cqw;height:2.6cqw;color:var(--teal);margin:-.3cqw auto}
.cs-dg-q{background:#CDEFE8;border-radius:1.5cqw;padding:1.15cqw 2cqw;text-align:center;font-size:2.4cqw;font-weight:700;line-height:1.3}
.cs-dg-q b{color:#0B6E6E}
.cs-dg-next{border:.2cqw dashed #F3B544;background:#FFF8EA;border-radius:1.5cqw;padding:1cqw 2cqw;text-align:center;font-size:2.1cqw;font-weight:600;line-height:1.3}
.cs-dg-next b{color:#B45309}
.cs-dg-note{text-align:center;color:#5B6472;font-size:1.5cqw;font-weight:500;margin-top:.3cqw}
@media (max-width:820px){.cs-main{grid-template-columns:1fr;text-align:center;justify-items:center;padding:0 56px}.cs-word-row{justify-content:center}.cs-pic{width:min(70vw,34vh)}
  .cs-top{grid-template-columns:1fr auto}.cs-dots{display:none}.cs-tiles,.cs-tf{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.cs-root *{animation:none!important;transition:none!important}}
`;

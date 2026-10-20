"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHref } from "@/lib/href";
import { canStepBack } from "@/lib/back-nav";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { SCHOOL_TYPES, CURRICULA, type Curriculum } from "@/lib/school-levels";
import { SCHOOL_TYPE_NAMES } from "@/lib/school-types-i18n";
import { WORD_SETS, getWordSet, registerWordSet, setItems, type WordSet, type SetExtras } from "@/lib/word-sets";
import {
  CATALOG_IDS, catalogView, readySetsOf, subjectIcon, categoryIcon,
  type CatalogId, type CatalogView, type ViewSubject, type ViewTopic,
} from "@/lib/curriculum-catalog";
import { BAND_COPY, BAND_TOPIC_ICON, bandSetOf, bandSetName, bandSetTitle, isBandSetId, type BandSet } from "@/lib/band-sets";
import OurSets from "./OurSets";

/**
 * /sets: the national curriculum of the school (Gadi 2026-10-03/04). The
 * Israeli catalog (גן to תיכון, Hebrew, RTL) or South Africa's CAPS (Grades
 * 4 to 9, English, LTR) or Israel's Arab state education (Arabic, RTL),
 * every subject with its own soft-3D icon. Level
 * tabs, subjects grouped by field, then the subject's units; opening a unit
 * loads its key words, and "Present to class" walks the class through them
 * on the projector. A school picks its curriculum and type once
 * (/api/school/levels). State lives in the URL (?l=&s=&t=).
 */

// One soft accent per field, so the sections read as separate worlds.
const CAT_COLOR: Record<string, string> = {
  language: "#2F6FB0", math: "#0E8A7E", sciences: "#1F8FA8", "foreign-languages": "#6D55B8",
  "jewish-studies": "#B0573F", "history-civics": "#9A6B1F", "geography-environment": "#3B8A4E",
  "social-sciences": "#A0487A", computers: "#3E5BB0", "arts-media": "#C0522F",
  "body-health": "#C2414B", engineering: "#4A6378", vocational: "#7A6A3A", "early-childhood": "#C27A1F",
  religion: "#8A5A2B",
};

const STR = {
  he: {
    title: "קבוצות מילים לכל מקצועות הלימוד",
    sub1: "בוחרים שכבה ומקצוע, פותחים נושא ומקרינים לכיתה.",
    sub2: "לכל מילה יש הגדרה, תמונה, דוגמאות, חידון ומשחק.",
    search: "חיפוש מקצוע או נושא, למשל שברים",
    searchAria: "חיפוש מקצוע או נושא",
    levelsAria: "שכבת גיל",
    subjectsUnit: "מקצועות",
    topicsUnit: "נושאים",
    fields: "תחומים",
    all: "הכל",
    empty: "לא מצאנו מקצוע או נושא כזה. כדאי לנסות מילה אחרת או קצרה יותר.",
    subjectsH: "מקצועות",
    topicsH: "נושאים",
    back: "כל המקצועות",
    readyH: "קבוצות מוכנות",
    topicsIn: (lv: string) => `נושאי הלימוד ב${lv}`,
    topicSearch: "חיפוש נושא",
    dati: "ממ״ד",
    datiLong: "חינוך ממלכתי דתי",
    present: "הצגה בכיתה",
    words: "מילים",
    loading: "מכינים את מילות המפתח של הנושא...",
    fail: "לא הצלחנו להכין את מילות המפתח כרגע. אפשר לנסות שוב בעוד רגע.",
    term: (n: number) => `תקופה ${n}`,
    curH: "איזו תוכנית לימודים?",
    typeH: "מה סוג בית הספר?",
    pick1: "קבוצות המילים נפתחות לפי תוכנית הלימודים והשכבות של בית הספר.",
    pick2: "בוחרים פעם אחת, ולשינוי אפשר לפנות אלינו.",
    notOwnerH: "קבוצות המילים עוד לא נפתחו",
    notOwnerP: "קודם צריך לבחור את סוג בית הספר בחשבון של בית הספר, ואז ייפתחו הקבוצות של השכבות המתאימות.",
    err: "משהו השתבש. אפשר לנסות שוב.",
    catalog: "תוכנית לימודים",
  },
  en: {
    title: "Word sets for every subject",
    sub1: "Pick a phase and a subject, open a topic, and project it to the class.",
    sub2: "Every word comes with a definition, a picture, examples, a quiz and a game.",
    search: "Search a subject or topic, e.g. fractions",
    searchAria: "Search a subject or topic",
    levelsAria: "Phase",
    subjectsUnit: "subjects",
    topicsUnit: "topics",
    fields: "Learning areas",
    all: "All",
    empty: "No subject or topic found. Try another or a shorter word.",
    subjectsH: "Subjects",
    topicsH: "Topics",
    back: "All subjects",
    readyH: "Ready-made sets",
    topicsIn: (lv: string) => `Topics: ${lv}`,
    topicSearch: "Search topics",
    dati: "",
    datiLong: "",
    present: "Present to class",
    words: "words",
    loading: "Preparing the topic's key words...",
    fail: "We couldn't load the key words right now. Please try again in a moment.",
    term: (n: number) => `Term ${n}`,
    curH: "Which curriculum does your school follow?",
    typeH: "What kind of school is it?",
    pick1: "The word sets open by your school's curriculum and grades.",
    pick2: "You choose once; to change it later, contact us.",
    notOwnerH: "The word sets aren't open yet",
    notOwnerP: "The school account first chooses the school type, and then the sets for its grades open.",
    err: "Something went wrong. Please try again.",
    catalog: "Curriculum",
  },
  // Arabic UI for the Arab state education catalog: verbal nouns and
  // impersonal wording, so it fits a man and a woman alike.
  ar: {
    title: "مجموعات كلمات لكلّ المواضيع الدراسيّة",
    sub1: "اختيار المرحلة والموضوع، فتح الوحدة وعرضها على الصفّ.",
    sub2: "لكلّ كلمة تعريف وصورة وأمثلة واختبار ولعبة.",
    search: "بحث عن موضوع أو وحدة، مثلًا الكسور",
    searchAria: "بحث عن موضوع أو وحدة",
    levelsAria: "المرحلة",
    subjectsUnit: "مواضيع",
    topicsUnit: "وحدات",
    fields: "المجالات",
    all: "الكلّ",
    empty: "لم نجد موضوعًا أو وحدة كهذه. يمكن تجربة كلمة أخرى أو أقصر.",
    subjectsH: "المواضيع",
    topicsH: "الوحدات",
    back: "كلّ المواضيع",
    readyH: "مجموعات جاهزة",
    topicsIn: (lv: string) => `وحدات التعلّم في المرحلة ${lv}`,
    topicSearch: "بحث عن وحدة",
    dati: "",
    datiLong: "",
    present: "عرض على الصفّ",
    words: "كلمات",
    loading: "نحضّر الكلمات المفتاحيّة للوحدة...",
    fail: "لم نتمكّن من تحضير الكلمات المفتاحيّة الآن. يمكن المحاولة مرّة أخرى بعد قليل.",
    term: (n: number) => `الفصل ${n}`,
    curH: "أيّ منهاج تعليميّ؟",
    typeH: "ما نوع المدرسة؟",
    pick1: "تُفتح مجموعات الكلمات حسب المنهاج والصفوف في المدرسة.",
    pick2: "الاختيار مرّة واحدة، وللتغيير يمكن التواصل معنا.",
    notOwnerH: "مجموعات الكلمات لم تُفتح بعد",
    notOwnerP: "يجب أوّلًا اختيار نوع المدرسة في حساب المدرسة، وبعدها تُفتح مجموعات الصفوف المناسبة.",
    err: "حدث خطأ ما. يمكن المحاولة مرّة أخرى.",
    catalog: "المنهاج",
  },
};
type Ui = keyof typeof STR;
type Kind = "subjects" | "topics" | "words";
// Arabic counted nouns: 1 and 2 have their own forms, 3 to 10 take the
// plural, 11 to 99 the singular accusative, round hundreds the singular.
const AR_COUNT: Record<Kind, [string, string, string, string, string]> = {
  subjects: ["موضوع واحد", "موضوعان", "مواضيع", "موضوعًا", "موضوع"],
  topics: ["وحدة واحدة", "وحدتان", "وحدات", "وحدةً", "وحدة"],
  words: ["كلمة واحدة", "كلمتان", "كلمات", "كلمةً", "كلمة"],
};
function count(T: T, n: number, kind: Kind): string {
  if (T.count) return T.count(n, kind);
  if (T !== STR.ar) return `${n} ${kind === "words" ? T.words : kind === "subjects" ? T.subjectsUnit : T.topicsUnit}`;
  const f = AR_COUNT[kind];
  if (n === 1) return f[0];
  if (n === 2) return f[1];
  const r = n % 100;
  return `${n} ${r >= 3 && r <= 10 ? f[2] : r >= 11 ? f[3] : f[4]}`;
}
const uiOf = (lang: string): Ui => (lang === "he" ? "he" : lang === "ar" ? "ar" : "en");
type T = (typeof STR)["en"] & {
  /** The curriculum names in this UI language. */
  curNames?: Partial<Record<string, string>>;
  /** A counted noun, where the noun changes with the number. */
  count?: (n: number, kind: Kind) => string;
};

// The other UI languages (2026-10-18), laid over the English: the copy of
// the English catalog (CAPS) and of the school type picker. Spoken to the
// teacher. Languages whose nouns change with the number count them here.
type Forms = [one: string, few: string, many: string];
const eastSlavic = (n: number, f: Forms) => {
  const a = n % 10, b = n % 100;
  return `${n} ${a === 1 && b !== 11 ? f[0] : a >= 2 && a <= 4 && (b < 12 || b > 14) ? f[1] : f[2]}`;
};
const polish = (n: number, f: Forms) => {
  const a = n % 10, b = n % 100;
  return `${n} ${n === 1 ? f[0] : a >= 2 && a <= 4 && (b < 12 || b > 14) ? f[1] : f[2]}`;
};
const czechSlovak = (n: number, f: Forms) => `${n} ${n === 1 ? f[0] : n >= 2 && n <= 4 ? f[1] : f[2]}`;
const STR_MORE: Record<string, Partial<T>> = {
  ru: {
    title: "Наборы слов по всем предметам",
    sub1: "Выберите ступень и предмет, откройте тему и покажите её классу.",
    sub2: "У каждого слова есть определение, картинка, примеры, викторина и игра.",
    search: "Поиск предмета или темы, например дроби",
    searchAria: "Поиск предмета или темы",
    levelsAria: "Ступень",
    subjectsUnit: "предметов",
    topicsUnit: "тем",
    fields: "Образовательные области",
    all: "Все",
    empty: "Такого предмета или темы не нашлось. Попробуйте другое или более короткое слово.",
    subjectsH: "Предметы",
    topicsH: "Темы",
    back: "Все предметы",
    readyH: "Готовые наборы",
    topicsIn: (lv: string) => `Темы: ${lv}`,
    topicSearch: "Поиск темы",
    dati: "",
    datiLong: "",
    present: "Показать классу",
    words: "слов",
    loading: "Готовим ключевые слова темы...",
    fail: "Сейчас не удалось загрузить ключевые слова. Попробуйте ещё раз чуть позже.",
    term: (n: number) => `Четверть ${n}`,
    curH: "По какой программе учится ваша школа?",
    typeH: "Какой это тип школы?",
    pick1: "Наборы слов открываются по программе и классам вашей школы.",
    pick2: "Выбор делается один раз. Чтобы изменить его, напишите нам.",
    notOwnerH: "Наборы слов пока не открыты",
    notOwnerP: "Сначала в аккаунте школы выбирают тип школы, и тогда открываются наборы для её классов.",
    err: "Что-то пошло не так. Попробуйте ещё раз.",
    catalog: "Учебная программа",
    curNames: { "il-he": "Израиль, программа на иврите", "il-ar": "Израиль, арабское государственное образование", "za-caps": "ЮАР, CAPS" },
    count: (n, k) => eastSlavic(n, k === "subjects" ? ["предмет", "предмета", "предметов"] : k === "topics" ? ["тема", "темы", "тем"] : ["слово", "слова", "слов"]),
  },
  uk: {
    title: "Набори слів з усіх предметів",
    sub1: "Оберіть ступінь і предмет, відкрийте тему й покажіть її класу.",
    sub2: "До кожного слова є визначення, малюнок, приклади, вікторина і гра.",
    search: "Пошук предмета або теми, наприклад дроби",
    searchAria: "Пошук предмета або теми",
    levelsAria: "Ступінь",
    subjectsUnit: "предметів",
    topicsUnit: "тем",
    fields: "Освітні галузі",
    all: "Усі",
    empty: "Такого предмета чи теми не знайшлося. Спробуйте інше або коротше слово.",
    subjectsH: "Предмети",
    topicsH: "Теми",
    back: "Усі предмети",
    readyH: "Готові набори",
    topicsIn: (lv: string) => `Теми: ${lv}`,
    topicSearch: "Пошук теми",
    dati: "",
    datiLong: "",
    present: "Показати класу",
    words: "слів",
    loading: "Готуємо ключові слова теми...",
    fail: "Зараз не вдалося завантажити ключові слова. Спробуйте ще раз трохи згодом.",
    term: (n: number) => `Чверть ${n}`,
    curH: "За якою програмою навчається ваша школа?",
    typeH: "Який це тип школи?",
    pick1: "Набори слів відкриваються за програмою і класами вашої школи.",
    pick2: "Вибір робиться один раз. Щоб змінити його, напишіть нам.",
    notOwnerH: "Набори слів ще не відкриті",
    notOwnerP: "Спочатку в акаунті школи обирають тип школи, і тоді відкриваються набори для її класів.",
    err: "Щось пішло не так. Спробуйте ще раз.",
    catalog: "Навчальна програма",
    curNames: { "il-he": "Ізраїль, програма івритом", "il-ar": "Ізраїль, арабська державна освіта", "za-caps": "ПАР, CAPS" },
    count: (n, k) => eastSlavic(n, k === "subjects" ? ["предмет", "предмети", "предметів"] : k === "topics" ? ["тема", "теми", "тем"] : ["слово", "слова", "слів"]),
  },
  pl: {
    title: "Zestawy słów do każdego przedmiotu",
    sub1: "Wybierz etap i przedmiot, otwórz temat i pokaż go klasie.",
    sub2: "Każde słowo ma definicję, obrazek, przykłady, quiz i grę.",
    search: "Szukaj przedmiotu lub tematu, np. ułamki",
    searchAria: "Szukaj przedmiotu lub tematu",
    levelsAria: "Etap",
    subjectsUnit: "przedmiotów",
    topicsUnit: "tematów",
    fields: "Obszary nauki",
    all: "Wszystkie",
    empty: "Nie znaleźliśmy takiego przedmiotu ani tematu. Spróbuj innego lub krótszego słowa.",
    subjectsH: "Przedmioty",
    topicsH: "Tematy",
    back: "Wszystkie przedmioty",
    readyH: "Gotowe zestawy",
    topicsIn: (lv: string) => `Tematy: ${lv}`,
    topicSearch: "Szukaj tematu",
    dati: "",
    datiLong: "",
    present: "Pokaż klasie",
    words: "słów",
    loading: "Przygotowujemy kluczowe słowa tematu...",
    fail: "Nie udało się teraz wczytać kluczowych słów. Spróbuj ponownie za chwilę.",
    term: (n: number) => `Okres ${n}`,
    curH: "Według jakiego programu uczy Twoja szkoła?",
    typeH: "Jaki to rodzaj szkoły?",
    pick1: "Zestawy słów otwierają się według programu i klas Twojej szkoły.",
    pick2: "Wybiera się raz. Aby to później zmienić, napisz do nas.",
    notOwnerH: "Zestawy słów nie są jeszcze otwarte",
    notOwnerP: "Najpierw na koncie szkoły wybiera się rodzaj szkoły, a potem otwierają się zestawy dla jej klas.",
    err: "Coś poszło nie tak. Spróbuj ponownie.",
    catalog: "Program nauczania",
    curNames: { "il-he": "Izrael, program w języku hebrajskim", "il-ar": "Izrael, państwowa edukacja arabska", "za-caps": "RPA, CAPS" },
    count: (n, k) => polish(n, k === "subjects" ? ["przedmiot", "przedmioty", "przedmiotów"] : k === "topics" ? ["temat", "tematy", "tematów"] : ["słowo", "słowa", "słów"]),
  },
  cs: {
    title: "Sady slov pro všechny předměty",
    sub1: "Vyberte stupeň a předmět, otevřete téma a promítněte ho třídě.",
    sub2: "Každé slovo má definici, obrázek, příklady, kvíz a hru.",
    search: "Hledat předmět nebo téma, např. zlomky",
    searchAria: "Hledat předmět nebo téma",
    levelsAria: "Stupeň",
    subjectsUnit: "předmětů",
    topicsUnit: "témat",
    fields: "Vzdělávací oblasti",
    all: "Vše",
    empty: "Takový předmět ani téma jsme nenašli. Zkuste jiné nebo kratší slovo.",
    subjectsH: "Předměty",
    topicsH: "Témata",
    back: "Všechny předměty",
    readyH: "Hotové sady",
    topicsIn: (lv: string) => `Témata: ${lv}`,
    topicSearch: "Hledat téma",
    dati: "",
    datiLong: "",
    present: "Promítnout třídě",
    words: "slov",
    loading: "Připravujeme klíčová slova tématu...",
    fail: "Klíčová slova se teď nepodařilo načíst. Zkuste to prosím za chvíli znovu.",
    term: (n: number) => `Čtvrtletí ${n}`,
    curH: "Podle jakého kurikula vaše škola učí?",
    typeH: "Jaký je to typ školy?",
    pick1: "Sady slov se otevírají podle kurikula a ročníků vaší školy.",
    pick2: "Volí se jednou. Pro pozdější změnu nám napište.",
    notOwnerH: "Sady slov ještě nejsou otevřené",
    notOwnerP: "Nejdřív se v účtu školy zvolí typ školy a pak se otevřou sady pro její ročníky.",
    err: "Něco se pokazilo. Zkuste to znovu.",
    catalog: "Kurikulum",
    curNames: { "il-he": "Izrael, kurikulum v hebrejštině", "il-ar": "Izrael, arabské státní školství", "za-caps": "Jihoafrická republika, CAPS" },
    count: (n, k) => czechSlovak(n, k === "subjects" ? ["předmět", "předměty", "předmětů"] : k === "topics" ? ["téma", "témata", "témat"] : ["slovo", "slova", "slov"]),
  },
  sk: {
    title: "Sady slov pre všetky predmety",
    sub1: "Vyberte stupeň a predmet, otvorte tému a premietnite ju triede.",
    sub2: "Každé slovo má definíciu, obrázok, príklady, kvíz a hru.",
    search: "Hľadať predmet alebo tému, napr. zlomky",
    searchAria: "Hľadať predmet alebo tému",
    levelsAria: "Stupeň",
    subjectsUnit: "predmetov",
    topicsUnit: "tém",
    fields: "Vzdelávacie oblasti",
    all: "Všetko",
    empty: "Taký predmet ani tému sme nenašli. Skúste iné alebo kratšie slovo.",
    subjectsH: "Predmety",
    topicsH: "Témy",
    back: "Všetky predmety",
    readyH: "Hotové sady",
    topicsIn: (lv: string) => `Témy: ${lv}`,
    topicSearch: "Hľadať tému",
    dati: "",
    datiLong: "",
    present: "Premietnuť triede",
    words: "slov",
    loading: "Pripravujeme kľúčové slová témy...",
    fail: "Kľúčové slová sa teraz nepodarilo načítať. Skúste to o chvíľu znova.",
    term: (n: number) => `Štvrťrok ${n}`,
    curH: "Podľa akého kurikula vaša škola učí?",
    typeH: "Aký je to typ školy?",
    pick1: "Sady slov sa otvárajú podľa kurikula a ročníkov vašej školy.",
    pick2: "Volí sa raz. Ak to budete chcieť zmeniť, napíšte nám.",
    notOwnerH: "Sady slov ešte nie sú otvorené",
    notOwnerP: "Najprv sa v účte školy zvolí typ školy a potom sa otvoria sady pre jej ročníky.",
    err: "Niečo sa pokazilo. Skúste to znova.",
    catalog: "Kurikulum",
    curNames: { "il-he": "Izrael, kurikulum v hebrejčine", "il-ar": "Izrael, arabské štátne školstvo", "za-caps": "Juhoafrická republika, CAPS" },
    count: (n, k) => czechSlovak(n, k === "subjects" ? ["predmet", "predmety", "predmetov"] : k === "topics" ? ["téma", "témy", "tém"] : ["slovo", "slová", "slov"]),
  },
  es: {
    title: "Grupos de palabras para cada materia",
    sub1: "Elija un ciclo y una materia, abra un tema y proyéctelo a la clase.",
    sub2: "Cada palabra trae definición, imagen, ejemplos, un quiz y un juego.",
    search: "Buscar una materia o un tema, p. ej. fracciones",
    searchAria: "Buscar una materia o un tema",
    levelsAria: "Ciclo",
    subjectsUnit: "materias",
    topicsUnit: "temas",
    fields: "Áreas de aprendizaje",
    all: "Todas",
    empty: "No encontramos esa materia ni ese tema. Pruebe con otra palabra o una más corta.",
    subjectsH: "Materias",
    topicsH: "Temas",
    back: "Todas las materias",
    readyH: "Grupos listos",
    topicsIn: (lv: string) => `Temas: ${lv}`,
    topicSearch: "Buscar temas",
    dati: "",
    datiLong: "",
    present: "Presentar a la clase",
    words: "palabras",
    loading: "Preparando las palabras clave del tema...",
    fail: "No pudimos cargar las palabras clave ahora. Inténtelo de nuevo en un momento.",
    term: (n: number) => `Trimestre ${n}`,
    curH: "¿Qué plan de estudios sigue su escuela?",
    typeH: "¿Qué tipo de escuela es?",
    pick1: "Los grupos de palabras se abren según el plan de estudios y los grados de su escuela.",
    pick2: "Se elige una sola vez. Para cambiarlo después, escríbanos.",
    notOwnerH: "Los grupos de palabras todavía no están abiertos",
    notOwnerP: "Primero la cuenta de la escuela elige el tipo de escuela, y luego se abren los grupos de sus grados.",
    err: "Algo salió mal. Inténtelo de nuevo.",
    catalog: "Plan de estudios",
    curNames: { "il-he": "Israel, plan de estudios en hebreo", "il-ar": "Israel, educación pública árabe", "za-caps": "Sudáfrica, CAPS" },
  },
  pt: {
    title: "Conjuntos de palavras para cada disciplina",
    sub1: "Escolha uma etapa e uma disciplina, abra um tema e projete para a turma.",
    sub2: "Cada palavra vem com definição, imagem, exemplos, quiz e jogo.",
    search: "Buscar uma disciplina ou um tema, ex.: frações",
    searchAria: "Buscar uma disciplina ou um tema",
    levelsAria: "Etapa",
    subjectsUnit: "disciplinas",
    topicsUnit: "temas",
    fields: "Áreas do conhecimento",
    all: "Todas",
    empty: "Não encontramos essa disciplina nem esse tema. Tente outra palavra ou uma mais curta.",
    subjectsH: "Disciplinas",
    topicsH: "Temas",
    back: "Todas as disciplinas",
    readyH: "Conjuntos prontos",
    topicsIn: (lv: string) => `Temas: ${lv}`,
    topicSearch: "Buscar temas",
    dati: "",
    datiLong: "",
    present: "Apresentar à turma",
    words: "palavras",
    loading: "Preparando as palavras-chave do tema...",
    fail: "Não conseguimos carregar as palavras-chave agora. Tente de novo em instantes.",
    term: (n: number) => `Bimestre ${n}`,
    curH: "Qual currículo a sua escola segue?",
    typeH: "Que tipo de escola é?",
    pick1: "Os conjuntos de palavras abrem de acordo com o currículo e as séries da sua escola.",
    pick2: "A escolha é feita uma vez. Para mudar depois, fale com a gente.",
    notOwnerH: "Os conjuntos de palavras ainda não estão abertos",
    notOwnerP: "Primeiro a conta da escola escolhe o tipo de escola, e então abrem os conjuntos das suas séries.",
    err: "Algo deu errado. Tente de novo.",
    catalog: "Currículo",
    curNames: { "il-he": "Israel, currículo em hebraico", "il-ar": "Israel, ensino público árabe", "za-caps": "África do Sul, CAPS" },
  },
  fr: {
    title: "Des listes de mots pour chaque matière",
    sub1: "Choisissez un cycle et une matière, ouvrez un thème et projetez-le à la classe.",
    sub2: "Chaque mot a sa définition, une image, des exemples, un quiz et un jeu.",
    search: "Chercher une matière ou un thème, p. ex. fractions",
    searchAria: "Chercher une matière ou un thème",
    levelsAria: "Cycle",
    subjectsUnit: "matières",
    topicsUnit: "thèmes",
    fields: "Domaines d'apprentissage",
    all: "Tout",
    empty: "Aucune matière ni aucun thème trouvé. Essayez un autre mot ou un mot plus court.",
    subjectsH: "Matières",
    topicsH: "Thèmes",
    back: "Toutes les matières",
    readyH: "Listes prêtes",
    topicsIn: (lv: string) => `Thèmes : ${lv}`,
    topicSearch: "Chercher un thème",
    dati: "",
    datiLong: "",
    present: "Présenter à la classe",
    words: "mots",
    loading: "Préparation des mots clés du thème...",
    fail: "Impossible de charger les mots clés pour le moment. Réessayez dans un instant.",
    term: (n: number) => `Trimestre ${n}`,
    curH: "Quel programme votre école suit-elle ?",
    typeH: "De quel type d'école s'agit-il ?",
    pick1: "Les listes de mots s'ouvrent selon le programme et les niveaux de votre école.",
    pick2: "Ce choix se fait une seule fois. Pour le modifier, contactez-nous.",
    notOwnerH: "Les listes de mots ne sont pas encore ouvertes",
    notOwnerP: "Le compte de l'école choisit d'abord le type d'école, puis les listes de ses niveaux s'ouvrent.",
    err: "Un problème est survenu. Réessayez.",
    catalog: "Programme",
    curNames: { "il-he": "Israël, programme en hébreu", "il-ar": "Israël, enseignement public arabe", "za-caps": "Afrique du Sud, CAPS" },
  },
  de: {
    title: "Wortsets für jedes Fach",
    sub1: "Stufe und Fach wählen, ein Thema öffnen und der Klasse zeigen.",
    sub2: "Zu jedem Wort gibt es eine Definition, ein Bild, Beispiele, ein Quiz und ein Spiel.",
    search: "Fach oder Thema suchen, z. B. Brüche",
    searchAria: "Fach oder Thema suchen",
    levelsAria: "Stufe",
    subjectsUnit: "Fächer",
    topicsUnit: "Themen",
    fields: "Lernbereiche",
    all: "Alle",
    empty: "Kein passendes Fach oder Thema gefunden. Bitte ein anderes oder kürzeres Wort versuchen.",
    subjectsH: "Fächer",
    topicsH: "Themen",
    back: "Alle Fächer",
    readyH: "Fertige Sets",
    topicsIn: (lv: string) => `Themen: ${lv}`,
    topicSearch: "Themen suchen",
    dati: "",
    datiLong: "",
    present: "Der Klasse zeigen",
    words: "Wörter",
    loading: "Die Schlüsselwörter des Themas werden vorbereitet...",
    fail: "Die Schlüsselwörter ließen sich gerade nicht laden. Bitte gleich noch einmal versuchen.",
    term: (n: number) => `Quartal ${n}`,
    curH: "Nach welchem Lehrplan unterrichtet Ihre Schule?",
    typeH: "Welche Schulart ist es?",
    pick1: "Die Wortsets öffnen sich nach dem Lehrplan und den Klassenstufen Ihrer Schule.",
    pick2: "Die Wahl erfolgt einmal. Für eine spätere Änderung schreiben Sie uns.",
    notOwnerH: "Die Wortsets sind noch nicht geöffnet",
    notOwnerP: "Zuerst wählt das Schulkonto die Schulart, dann öffnen sich die Sets für ihre Klassenstufen.",
    err: "Etwas ist schiefgelaufen. Bitte noch einmal versuchen.",
    catalog: "Lehrplan",
    curNames: { "il-he": "Israel, Lehrplan auf Hebräisch", "il-ar": "Israel, staatliche arabische Bildung", "za-caps": "Südafrika, CAPS" },
  },
  it: {
    title: "Gruppi di parole per ogni materia",
    sub1: "Scegli un ciclo e una materia, apri un argomento e proiettalo alla classe.",
    sub2: "Ogni parola ha definizione, immagine, esempi, quiz e gioco.",
    search: "Cerca una materia o un argomento, es. frazioni",
    searchAria: "Cerca una materia o un argomento",
    levelsAria: "Ciclo",
    subjectsUnit: "materie",
    topicsUnit: "argomenti",
    fields: "Aree di apprendimento",
    all: "Tutte",
    empty: "Nessuna materia o argomento trovato. Prova con un'altra parola o una più corta.",
    subjectsH: "Materie",
    topicsH: "Argomenti",
    back: "Tutte le materie",
    readyH: "Gruppi pronti",
    topicsIn: (lv: string) => `Argomenti: ${lv}`,
    topicSearch: "Cerca argomenti",
    dati: "",
    datiLong: "",
    present: "Presenta alla classe",
    words: "parole",
    loading: "Prepariamo le parole chiave dell'argomento...",
    fail: "Non siamo riusciti a caricare le parole chiave. Riprova tra un momento.",
    term: (n: number) => `Trimestre ${n}`,
    curH: "Quale programma segue la tua scuola?",
    typeH: "Che tipo di scuola è?",
    pick1: "I gruppi di parole si aprono in base al programma e alle classi della scuola.",
    pick2: "Si sceglie una volta sola. Per cambiarlo in seguito, scrivici.",
    notOwnerH: "I gruppi di parole non sono ancora aperti",
    notOwnerP: "Prima l'account della scuola sceglie il tipo di scuola, poi si aprono i gruppi delle sue classi.",
    err: "Qualcosa è andato storto. Riprova.",
    catalog: "Programma",
    curNames: { "il-he": "Israele, programma in ebraico", "il-ar": "Israele, istruzione statale araba", "za-caps": "Sudafrica, CAPS" },
  },
  nl: {
    title: "Woordensets voor elk vak",
    sub1: "Kies een fase en een vak, open een onderwerp en toon het aan de klas.",
    sub2: "Bij elk woord horen een definitie, een afbeelding, voorbeelden, een quiz en een spel.",
    search: "Zoek een vak of onderwerp, bijv. breuken",
    searchAria: "Zoek een vak of onderwerp",
    levelsAria: "Fase",
    subjectsUnit: "vakken",
    topicsUnit: "onderwerpen",
    fields: "Leergebieden",
    all: "Alle",
    empty: "Geen vak of onderwerp gevonden. Probeer een ander of korter woord.",
    subjectsH: "Vakken",
    topicsH: "Onderwerpen",
    back: "Alle vakken",
    readyH: "Kant-en-klare sets",
    topicsIn: (lv: string) => `Onderwerpen: ${lv}`,
    topicSearch: "Zoek onderwerpen",
    dati: "",
    datiLong: "",
    present: "Toon aan de klas",
    words: "woorden",
    loading: "De kernwoorden van het onderwerp worden voorbereid...",
    fail: "We konden de kernwoorden nu niet laden. Probeer het zo meteen opnieuw.",
    term: (n: number) => `Periode ${n}`,
    curH: "Welk curriculum volgt uw school?",
    typeH: "Wat voor school is het?",
    pick1: "De woordensets gaan open volgens het curriculum en de leerjaren van uw school.",
    pick2: "U kiest één keer. Wilt u het later wijzigen, neem dan contact met ons op.",
    notOwnerH: "De woordensets zijn nog niet open",
    notOwnerP: "Eerst kiest het schoolaccount het type school, daarna gaan de sets voor de leerjaren open.",
    err: "Er ging iets mis. Probeer het opnieuw.",
    catalog: "Curriculum",
    curNames: { "il-he": "Israël, Hebreeuws curriculum", "il-ar": "Israël, Arabisch staatsonderwijs", "za-caps": "Zuid-Afrika, CAPS" },
  },
  da: {
    title: "Ordsæt til alle fag",
    sub1: "Vælg et trin og et fag, åbn et emne, og vis det for klassen.",
    sub2: "Hvert ord har en definition, et billede, eksempler, en quiz og et spil.",
    search: "Søg efter et fag eller emne, f.eks. brøker",
    searchAria: "Søg efter et fag eller emne",
    levelsAria: "Trin",
    subjectsUnit: "fag",
    topicsUnit: "emner",
    fields: "Læringsområder",
    all: "Alle",
    empty: "Intet fag eller emne fundet. Prøv et andet eller kortere ord.",
    subjectsH: "Fag",
    topicsH: "Emner",
    back: "Alle fag",
    readyH: "Færdige sæt",
    topicsIn: (lv: string) => `Emner: ${lv}`,
    topicSearch: "Søg i emner",
    dati: "",
    datiLong: "",
    present: "Vis for klassen",
    words: "ord",
    loading: "Emnets nøgleord gøres klar...",
    fail: "Vi kunne ikke hente nøgleordene lige nu. Prøv igen om lidt.",
    term: (n: number) => `Periode ${n}`,
    curH: "Hvilken læseplan følger jeres skole?",
    typeH: "Hvilken slags skole er det?",
    pick1: "Ordsættene åbnes efter skolens læseplan og klassetrin.",
    pick2: "Valget træffes én gang. Skriv til os, hvis det skal ændres senere.",
    notOwnerH: "Ordsættene er ikke åbnet endnu",
    notOwnerP: "Først vælger skolens konto skoletypen, og så åbnes sættene for dens klassetrin.",
    err: "Noget gik galt. Prøv igen.",
    catalog: "Læseplan",
    curNames: { "il-he": "Israel, hebraisk læseplan", "il-ar": "Israel, arabisk statsskole", "za-caps": "Sydafrika, CAPS" },
  },
  af: {
    title: "Woordstelle vir elke vak",
    sub1: "Kies 'n fase en 'n vak, maak 'n onderwerp oop en projekteer dit vir die klas.",
    sub2: "Elke woord kom met 'n definisie, 'n prent, voorbeelde, 'n vasvra en 'n speletjie.",
    search: "Soek 'n vak of onderwerp, bv. breuke",
    searchAria: "Soek 'n vak of onderwerp",
    levelsAria: "Fase",
    subjectsUnit: "vakke",
    topicsUnit: "onderwerpe",
    fields: "Leerareas",
    all: "Alles",
    empty: "Geen vak of onderwerp gevind nie. Probeer 'n ander of korter woord.",
    subjectsH: "Vakke",
    topicsH: "Onderwerpe",
    back: "Alle vakke",
    readyH: "Klaargemaakte stelle",
    topicsIn: (lv: string) => `Onderwerpe: ${lv}`,
    topicSearch: "Soek onderwerpe",
    dati: "",
    datiLong: "",
    present: "Wys vir die klas",
    words: "woorde",
    loading: "Ons berei die onderwerp se sleutelwoorde voor...",
    fail: "Ons kon nie nou die sleutelwoorde laai nie. Probeer asseblief oor 'n oomblik weer.",
    term: (n: number) => `Kwartaal ${n}`,
    curH: "Watter kurrikulum volg jou skool?",
    typeH: "Watter soort skool is dit?",
    pick1: "Die woordstelle gaan oop volgens jou skool se kurrikulum en grade.",
    pick2: "Jy kies een keer. Kontak ons as jy dit later wil verander.",
    notOwnerH: "Die woordstelle is nog nie oop nie",
    notOwnerP: "Die skool se rekening kies eers die soort skool, en dan gaan die stelle vir sy grade oop.",
    err: "Iets het verkeerd geloop. Probeer asseblief weer.",
    catalog: "Kurrikulum",
    curNames: { "il-he": "Israel, Hebreeuse kurrikulum", "il-ar": "Israel, Arabiese staatsonderwys", "za-caps": "Suid-Afrika, CAPS" },
  },
  el: {
    title: "Σύνολα λέξεων για κάθε μάθημα",
    sub1: "Επιλέξτε βαθμίδα και μάθημα, ανοίξτε μια ενότητα και προβάλετέ τη στην τάξη.",
    sub2: "Κάθε λέξη έχει ορισμό, εικόνα, παραδείγματα, κουίζ και παιχνίδι.",
    search: "Αναζήτηση μαθήματος ή ενότητας, π.χ. κλάσματα",
    searchAria: "Αναζήτηση μαθήματος ή ενότητας",
    levelsAria: "Βαθμίδα",
    subjectsUnit: "μαθήματα",
    topicsUnit: "ενότητες",
    fields: "Γνωστικά πεδία",
    all: "Όλα",
    empty: "Δεν βρέθηκε μάθημα ή ενότητα. Δοκιμάστε άλλη ή πιο σύντομη λέξη.",
    subjectsH: "Μαθήματα",
    topicsH: "Ενότητες",
    back: "Όλα τα μαθήματα",
    readyH: "Έτοιμα σύνολα",
    topicsIn: (lv: string) => `Ενότητες: ${lv}`,
    topicSearch: "Αναζήτηση ενότητας",
    dati: "",
    datiLong: "",
    present: "Προβολή στην τάξη",
    words: "λέξεις",
    loading: "Ετοιμάζουμε τις λέξεις κλειδιά της ενότητας...",
    fail: "Δεν μπορέσαμε να φορτώσουμε τις λέξεις κλειδιά τώρα. Δοκιμάστε ξανά σε λίγο.",
    term: (n: number) => `Τρίμηνο ${n}`,
    curH: "Ποιο πρόγραμμα σπουδών ακολουθεί το σχολείο σας;",
    typeH: "Τι είδους σχολείο είναι;",
    pick1: "Τα σύνολα λέξεων ανοίγουν σύμφωνα με το πρόγραμμα σπουδών και τις τάξεις του σχολείου σας.",
    pick2: "Η επιλογή γίνεται μία φορά. Για αλλαγή αργότερα, επικοινωνήστε μαζί μας.",
    notOwnerH: "Τα σύνολα λέξεων δεν έχουν ανοίξει ακόμα",
    notOwnerP: "Πρώτα ο λογαριασμός του σχολείου επιλέγει τον τύπο σχολείου και μετά ανοίγουν τα σύνολα για τις τάξεις του.",
    err: "Κάτι πήγε στραβά. Δοκιμάστε ξανά.",
    catalog: "Πρόγραμμα σπουδών",
    curNames: { "il-he": "Ισραήλ, πρόγραμμα στα εβραϊκά", "il-ar": "Ισραήλ, αραβική δημόσια εκπαίδευση", "za-caps": "Νότια Αφρική, CAPS" },
  },
  tr: {
    title: "Her ders için kelime setleri",
    sub1: "Bir kademe ve ders seçin, bir konu açın ve sınıfa yansıtın.",
    sub2: "Her kelimenin tanımı, resmi, örnekleri, testi ve oyunu var.",
    search: "Ders ya da konu arayın, ör. kesirler",
    searchAria: "Ders ya da konu arayın",
    levelsAria: "Kademe",
    subjectsUnit: "ders",
    topicsUnit: "konu",
    fields: "Öğrenme alanları",
    all: "Tümü",
    empty: "Böyle bir ders ya da konu bulamadık. Başka ya da daha kısa bir kelime deneyin.",
    subjectsH: "Dersler",
    topicsH: "Konular",
    back: "Tüm dersler",
    readyH: "Hazır setler",
    topicsIn: (lv: string) => `Konular: ${lv}`,
    topicSearch: "Konu arayın",
    dati: "",
    datiLong: "",
    present: "Sınıfa göster",
    words: "kelime",
    loading: "Konunun anahtar kelimeleri hazırlanıyor...",
    fail: "Anahtar kelimeleri şu an yükleyemedik. Lütfen birazdan tekrar deneyin.",
    term: (n: number) => `${n}. dönem`,
    curH: "Okulunuz hangi öğretim programını izliyor?",
    typeH: "Okulunuz ne tür bir okul?",
    pick1: "Kelime setleri okulunuzun öğretim programına ve sınıflarına göre açılır.",
    pick2: "Seçim bir kez yapılır. Daha sonra değiştirmek için bize yazın.",
    notOwnerH: "Kelime setleri henüz açılmadı",
    notOwnerP: "Önce okul hesabında okul türü seçilir, ardından o sınıfların setleri açılır.",
    err: "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
    catalog: "Öğretim programı",
    curNames: { "il-he": "İsrail, İbranice öğretim programı", "il-ar": "İsrail, Arap devlet eğitimi", "za-caps": "Güney Afrika, CAPS" },
  },
  hu: {
    title: "Szókészletek minden tantárgyhoz",
    sub1: "Válasszon szakaszt és tantárgyat, nyisson meg egy témát, és vetítse ki az osztálynak.",
    sub2: "Minden szóhoz tartozik meghatározás, kép, példák, kvíz és játék.",
    search: "Tantárgy vagy téma keresése, pl. törtek",
    searchAria: "Tantárgy vagy téma keresése",
    levelsAria: "Szakasz",
    subjectsUnit: "tantárgy",
    topicsUnit: "téma",
    fields: "Műveltségi területek",
    all: "Mind",
    empty: "Nem találtunk ilyen tantárgyat vagy témát. Próbáljon másik vagy rövidebb szót.",
    subjectsH: "Tantárgyak",
    topicsH: "Témák",
    back: "Minden tantárgy",
    readyH: "Kész készletek",
    topicsIn: (lv: string) => `Témák: ${lv}`,
    topicSearch: "Téma keresése",
    dati: "",
    datiLong: "",
    present: "Kivetítés az osztálynak",
    words: "szó",
    loading: "Készülnek a téma kulcsszavai...",
    fail: "Most nem sikerült betölteni a kulcsszavakat. Kérjük, próbálja újra egy kis idő múlva.",
    term: (n: number) => `${n}. negyedév`,
    curH: "Melyik tanterv szerint tanít az iskolájuk?",
    typeH: "Milyen típusú az iskola?",
    pick1: "A szókészletek az iskola tanterve és évfolyamai szerint nyílnak meg.",
    pick2: "Egyszer kell választani. Későbbi módosításhoz írjon nekünk.",
    notOwnerH: "A szókészletek még nem nyíltak meg",
    notOwnerP: "Először az iskola fiókjában kell kiválasztani az iskola típusát, és utána nyílnak meg az évfolyamok készletei.",
    err: "Valami hiba történt. Próbálja újra.",
    catalog: "Tanterv",
    curNames: { "il-he": "Izrael, héber nyelvű tanterv", "il-ar": "Izrael, arab állami oktatás", "za-caps": "Dél-Afrika, CAPS" },
  },
  id: {
    title: "Kumpulan kata untuk setiap mata pelajaran",
    sub1: "Pilih jenjang dan mata pelajaran, buka topik, lalu tampilkan ke kelas.",
    sub2: "Setiap kata dilengkapi definisi, gambar, contoh, kuis, dan permainan.",
    search: "Cari mata pelajaran atau topik, mis. pecahan",
    searchAria: "Cari mata pelajaran atau topik",
    levelsAria: "Jenjang",
    subjectsUnit: "mata pelajaran",
    topicsUnit: "topik",
    fields: "Bidang pembelajaran",
    all: "Semua",
    empty: "Mata pelajaran atau topik itu tidak ditemukan. Coba kata lain atau yang lebih pendek.",
    subjectsH: "Mata pelajaran",
    topicsH: "Topik",
    back: "Semua mata pelajaran",
    readyH: "Kumpulan siap pakai",
    topicsIn: (lv: string) => `Topik: ${lv}`,
    topicSearch: "Cari topik",
    dati: "",
    datiLong: "",
    present: "Tampilkan ke kelas",
    words: "kata",
    loading: "Menyiapkan kata kunci topik...",
    fail: "Kata kunci belum bisa dimuat sekarang. Silakan coba lagi sebentar lagi.",
    term: (n: number) => `Semester ${n}`,
    curH: "Kurikulum apa yang diikuti sekolah Anda?",
    typeH: "Sekolah jenis apa ini?",
    pick1: "Kumpulan kata dibuka sesuai kurikulum dan kelas di sekolah Anda.",
    pick2: "Pilihan dibuat sekali. Untuk mengubahnya nanti, hubungi kami.",
    notOwnerH: "Kumpulan kata belum dibuka",
    notOwnerP: "Akun sekolah memilih jenis sekolah terlebih dulu, lalu kumpulan untuk kelas-kelasnya terbuka.",
    err: "Terjadi kesalahan. Silakan coba lagi.",
    catalog: "Kurikulum",
    curNames: { "il-he": "Israel, kurikulum berbahasa Ibrani", "il-ar": "Israel, pendidikan negeri Arab", "za-caps": "Afrika Selatan, CAPS" },
  },
  fil: {
    title: "Mga set ng salita para sa bawat asignatura",
    sub1: "Pumili ng antas at asignatura, magbukas ng paksa, at ipakita ito sa klase.",
    sub2: "Bawat salita ay may kahulugan, larawan, mga halimbawa, quiz, at laro.",
    search: "Maghanap ng asignatura o paksa, hal. fraction",
    searchAria: "Maghanap ng asignatura o paksa",
    levelsAria: "Antas",
    subjectsUnit: "asignatura",
    topicsUnit: "paksa",
    fields: "Mga larangan ng pag-aaral",
    all: "Lahat",
    empty: "Walang nakitang asignatura o paksa. Subukan ang ibang salita o mas maikli.",
    subjectsH: "Mga asignatura",
    topicsH: "Mga paksa",
    back: "Lahat ng asignatura",
    readyH: "Mga handang set",
    topicsIn: (lv: string) => `Mga paksa: ${lv}`,
    topicSearch: "Maghanap ng paksa",
    dati: "",
    datiLong: "",
    present: "Ipakita sa klase",
    words: "salita",
    loading: "Inihahanda ang mga susing salita ng paksa...",
    fail: "Hindi namin ma-load ang mga susing salita ngayon. Pakisubukan ulit mamaya.",
    term: (n: number) => `Markahan ${n}`,
    curH: "Anong kurikulum ang sinusunod ng inyong paaralan?",
    typeH: "Anong uri ng paaralan ito?",
    pick1: "Nabubuksan ang mga set ng salita ayon sa kurikulum at mga baitang ng inyong paaralan.",
    pick2: "Isang beses lang pipili. Para baguhin ito sa susunod, sumulat sa amin.",
    notOwnerH: "Hindi pa bukas ang mga set ng salita",
    notOwnerP: "Pipiliin muna ng account ng paaralan ang uri ng paaralan, saka bubukas ang mga set para sa mga baitang nito.",
    err: "May nangyaring mali. Pakisubukan ulit.",
    catalog: "Kurikulum",
    curNames: { "il-he": "Israel, kurikulum sa Hebreo", "il-ar": "Israel, pampublikong edukasyong Arabe", "za-caps": "South Africa, CAPS" },
  },
  vi: {
    title: "Bộ từ cho mọi môn học",
    sub1: "Chọn cấp học và môn học, mở một chủ đề rồi chiếu cho cả lớp.",
    sub2: "Mỗi từ đều có định nghĩa, hình ảnh, ví dụ, câu đố và trò chơi.",
    search: "Tìm môn học hoặc chủ đề, ví dụ phân số",
    searchAria: "Tìm môn học hoặc chủ đề",
    levelsAria: "Cấp học",
    subjectsUnit: "môn",
    topicsUnit: "chủ đề",
    fields: "Lĩnh vực học tập",
    all: "Tất cả",
    empty: "Không tìm thấy môn học hoặc chủ đề nào. Hãy thử từ khác hoặc ngắn hơn.",
    subjectsH: "Môn học",
    topicsH: "Chủ đề",
    back: "Tất cả môn học",
    readyH: "Bộ từ có sẵn",
    topicsIn: (lv: string) => `Chủ đề: ${lv}`,
    topicSearch: "Tìm chủ đề",
    dati: "",
    datiLong: "",
    present: "Chiếu cho cả lớp",
    words: "từ",
    loading: "Đang chuẩn bị các từ khóa của chủ đề...",
    fail: "Hiện chưa tải được các từ khóa. Vui lòng thử lại sau ít phút.",
    term: (n: number) => `Học kỳ ${n}`,
    curH: "Trường của bạn theo chương trình học nào?",
    typeH: "Đây là loại trường nào?",
    pick1: "Các bộ từ được mở theo chương trình học và các khối lớp của trường.",
    pick2: "Chỉ chọn một lần. Nếu muốn đổi sau này, hãy liên hệ với chúng tôi.",
    notOwnerH: "Các bộ từ chưa được mở",
    notOwnerP: "Trước tiên tài khoản của trường chọn loại trường, sau đó các bộ từ cho các khối lớp sẽ mở.",
    err: "Đã xảy ra lỗi. Vui lòng thử lại.",
    catalog: "Chương trình học",
    curNames: { "il-he": "Israel, chương trình bằng tiếng Do Thái", "il-ar": "Israel, giáo dục công lập Ả Rập", "za-caps": "Nam Phi, CAPS" },
  },
  sw: {
    title: "Seti za maneno kwa kila somo",
    sub1: "Chagua hatua na somo, fungua mada, kisha ionyeshe darasa.",
    sub2: "Kila neno lina maana, picha, mifano, chemsha bongo na mchezo.",
    search: "Tafuta somo au mada, k.m. sehemu",
    searchAria: "Tafuta somo au mada",
    levelsAria: "Hatua",
    subjectsUnit: "masomo",
    topicsUnit: "mada",
    fields: "Maeneo ya kujifunza",
    all: "Yote",
    empty: "Hatukupata somo wala mada hiyo. Jaribu neno jingine au fupi zaidi.",
    subjectsH: "Masomo",
    topicsH: "Mada",
    back: "Masomo yote",
    readyH: "Seti zilizo tayari",
    topicsIn: (lv: string) => `Mada: ${lv}`,
    topicSearch: "Tafuta mada",
    dati: "",
    datiLong: "",
    present: "Onyesha darasa",
    words: "maneno",
    loading: "Tunaandaa maneno muhimu ya mada...",
    fail: "Hatukuweza kupakia maneno muhimu sasa hivi. Tafadhali jaribu tena baada ya muda mfupi.",
    term: (n: number) => `Muhula ${n}`,
    curH: "Shule yako inafuata mtaala gani?",
    typeH: "Ni shule ya aina gani?",
    pick1: "Seti za maneno hufunguliwa kulingana na mtaala na madarasa ya shule yako.",
    pick2: "Unachagua mara moja tu. Ili kubadilisha baadaye, wasiliana nasi.",
    notOwnerH: "Seti za maneno bado hazijafunguliwa",
    notOwnerP: "Kwanza akaunti ya shule huchagua aina ya shule, kisha seti za madarasa yake hufunguliwa.",
    err: "Kuna hitilafu. Tafadhali jaribu tena.",
    catalog: "Mtaala",
    curNames: { "il-he": "Israeli, mtaala wa Kiebrania", "il-ar": "Israeli, elimu ya umma ya Kiarabu", "za-caps": "Afrika Kusini, CAPS" },
  },
  zu: {
    title: "Amaqoqo amagama ezifundo zonke",
    sub1: "Khetha isigaba nesifundo, uvule isihloko bese usibonisa ikilasi.",
    sub2: "Igama ngalinye linencazelo, isithombe, izibonelo, imibuzo nomdlalo.",
    search: "Sesha isifundo noma isihloko, isib. amafrakshini",
    searchAria: "Sesha isifundo noma isihloko",
    levelsAria: "Isigaba",
    subjectsUnit: "izifundo",
    topicsUnit: "izihloko",
    fields: "Izindawo zokufunda",
    all: "Konke",
    empty: "Asitholanga isifundo noma isihloko esinjalo. Zama elinye igama noma elifushane.",
    subjectsH: "Izifundo",
    topicsH: "Izihloko",
    back: "Zonke izifundo",
    readyH: "Amaqoqo asevele elungile",
    topicsIn: (lv: string) => `Izihloko: ${lv}`,
    topicSearch: "Sesha izihloko",
    dati: "",
    datiLong: "",
    present: "Bonisa ikilasi",
    words: "amagama",
    loading: "Silungisa amagama abalulekile esihloko...",
    fail: "Asikwazanga ukulayisha amagama abalulekile manje. Sicela uzame futhi emva kwesikhashana.",
    term: (n: number) => `Ithemu ${n}`,
    curH: "Isikole sakho silandela iyiphi ikharikhulamu?",
    typeH: "Yisikole sohlobo luni?",
    pick1: "Amaqoqo amagama avuleka ngokwekharikhulamu namabanga esikole sakho.",
    pick2: "Ukhetha kanye kuphela. Ukuze ukushintshe kamuva, xhumana nathi.",
    notOwnerH: "Amaqoqo amagama awakavulwa",
    notOwnerP: "I-akhawunti yesikole iqala ngokukhetha uhlobo lwesikole, bese kuvuleka amaqoqo amabanga aso.",
    err: "Kukhona okungahambanga kahle. Sicela uzame futhi.",
    catalog: "Ikharikhulamu",
    curNames: { "il-he": "Israel, ikharikhulamu yesiHeberu", "il-ar": "Israel, imfundo kahulumeni yama-Arabhu", "za-caps": "iNingizimu Afrika, CAPS" },
  },
  xh: {
    title: "Iiseti zamagama zazo zonke izifundo",
    sub1: "Khetha isigaba nesifundo, uvule isihloko uze usibonise iklasi.",
    sub2: "Igama ngalinye linentsingiselo, umfanekiso, imizekelo, imibuzo nomdlalo.",
    search: "Khangela isifundo okanye isihloko, umz. amaqhezu",
    searchAria: "Khangela isifundo okanye isihloko",
    levelsAria: "Isigaba",
    subjectsUnit: "izifundo",
    topicsUnit: "izihloko",
    fields: "Imimandla yokufunda",
    all: "Zonke",
    empty: "Asisifumananga isifundo okanye isihloko esinjalo. Zama elinye igama okanye elifutshane.",
    subjectsH: "Izifundo",
    topicsH: "Izihloko",
    back: "Zonke izifundo",
    readyH: "Iiseti esele zilungile",
    topicsIn: (lv: string) => `Izihloko: ${lv}`,
    topicSearch: "Khangela izihloko",
    dati: "",
    datiLong: "",
    present: "Bonisa iklasi",
    words: "amagama",
    loading: "Silungiselela amagama aphambili esihloko...",
    fail: "Asikwazanga ukulayisha amagama aphambili ngoku. Nceda uzame kwakhona emva kwexeshana.",
    term: (n: number) => `Ikota ${n}`,
    curH: "Isikolo sakho silandela eyiphi ikharityhulam?",
    typeH: "Luhlobo luni lwesikolo?",
    pick1: "Iiseti zamagama zivuleka ngokwekharityhulam namabanga esikolo sakho.",
    pick2: "Ukhetha kanye kuphela. Ukuze ukutshintshe kamva, qhagamshelana nathi.",
    notOwnerH: "Iiseti zamagama azikavulwa",
    notOwnerP: "I-akhawunti yesikolo iqala ikhethe uhlobo lwesikolo, emva koko zivuleke iiseti zamabanga aso.",
    err: "Kukho into engahambanga kakuhle. Nceda uzame kwakhona.",
    catalog: "Ikharityhulam",
    curNames: { "il-he": "Israel, ikharityhulam yesiHebhere", "il-ar": "Israel, imfundo karhulumente yama-Arabhu", "za-caps": "uMzantsi Afrika, CAPS" },
  },
  nso: {
    title: "Dihlopha tša mantšu tša dithuto ka moka",
    sub1: "Kgetha legato le thuto, bula hlogo gomme o e bontšhe phapoši.",
    sub2: "Lentšu le lengwe le le lengwe le na le tlhalošo, seswantšho, mehlala, dipotšišo le papadi.",
    search: "Nyaka thuto goba hlogo, mohl. dikarolwana",
    searchAria: "Nyaka thuto goba hlogo",
    levelsAria: "Legato",
    subjectsUnit: "dithuto",
    topicsUnit: "dihlogo",
    fields: "Mafapha a go ithuta",
    all: "Ka moka",
    empty: "Ga re a hwetša thuto goba hlogo ye bjalo. Leka lentšu le lengwe goba le lekopana.",
    subjectsH: "Dithuto",
    topicsH: "Dihlogo",
    back: "Dithuto ka moka",
    readyH: "Dihlopha tše di šetšego di lokile",
    topicsIn: (lv: string) => `Dihlogo: ${lv}`,
    topicSearch: "Nyaka dihlogo",
    dati: "",
    datiLong: "",
    present: "Bontšha phapoši",
    words: "mantšu",
    loading: "Re lokišetša mantšu a bohlokwa a hlogo...",
    fail: "Ga re a kgona go laiša mantšu a bohlokwa bjale. Hle leka gape ka morago ga nakwana.",
    term: (n: number) => `Kotara ${n}`,
    curH: "Sekolo sa gago se latela kharikhulamo efe?",
    typeH: "Ke sekolo sa mohuta ofe?",
    pick1: "Dihlopha tša mantšu di bulega go ya ka kharikhulamo le dikreiti tša sekolo sa gago.",
    pick2: "O kgetha gatee fela. Go fetola ka morago, ikgokaganye le rena.",
    notOwnerH: "Dihlopha tša mantšu ga se tša bulwa",
    notOwnerP: "Akhaonto ya sekolo e thoma ka go kgetha mohuta wa sekolo, ke moka dihlopha tša dikreiti tša sona di a bulega.",
    err: "Go na le se se sa sepelago gabotse. Hle leka gape.",
    catalog: "Kharikhulamo",
    curNames: { "il-he": "Isiraele, kharikhulamo ya Seheberu", "il-ar": "Isiraele, thuto ya mmušo ya Ma-Arabia", "za-caps": "Afrika Borwa, CAPS" },
  },
  tn: {
    title: "Ditlhopha tsa mafoko tsa dithuto tsotlhe",
    sub1: "Tlhopha kgato le thuto, bula setlhogo mme o se bontshe phaposi.",
    sub2: "Lefoko lengwe le lengwe le na le tlhaloso, setshwantsho, dikai, dipotso le motshameko.",
    search: "Batla thuto kgotsa setlhogo, sk. dikarolwana",
    searchAria: "Batla thuto kgotsa setlhogo",
    levelsAria: "Kgato",
    subjectsUnit: "dithuto",
    topicsUnit: "ditlhogo",
    fields: "Mafapha a go ithuta",
    all: "Tsotlhe",
    empty: "Ga re a bona thuto kgotsa setlhogo se se jalo. Leka lefoko le lengwe kgotsa le le khutshwane.",
    subjectsH: "Dithuto",
    topicsH: "Ditlhogo",
    back: "Dithuto tsotlhe",
    readyH: "Ditlhopha tse di setseng di siametse",
    topicsIn: (lv: string) => `Ditlhogo: ${lv}`,
    topicSearch: "Batla ditlhogo",
    dati: "",
    datiLong: "",
    present: "Bontsha phaposi",
    words: "mafoko",
    loading: "Re baakanya mafoko a botlhokwa a setlhogo...",
    fail: "Ga re a kgona go laolela mafoko a botlhokwa jaanong. Tsweetswee leka gape morago ga nakwana.",
    term: (n: number) => `Kotara ${n}`,
    curH: "Sekolo sa gago se latela kharikhulamo efe?",
    typeH: "Ke sekolo sa mofuta ofe?",
    pick1: "Ditlhopha tsa mafoko di bulega go ya ka kharikhulamo le dikereiti tsa sekolo sa gago.",
    pick2: "O tlhopha gangwe fela. Go fetola moragonyana, ikgolaganye le rona.",
    notOwnerH: "Ditlhopha tsa mafoko ga di ise di bulwe",
    notOwnerP: "Akhaonto ya sekolo e simolola ka go tlhopha mofuta wa sekolo, morago ditlhopha tsa dikereiti tsa sone di a bulega.",
    err: "Sengwe se ile sa se tsamaye sentle. Tsweetswee leka gape.",
    catalog: "Kharikhulamo",
    curNames: { "il-he": "Iseraele, kharikhulamo ya Seheberu", "il-ar": "Iseraele, thuto ya puso ya Ma-Arabia", "za-caps": "Aforika Borwa, CAPS" },
  },
  st: {
    title: "Dihlopha tsa mantswe tsa dithuto tsohle",
    sub1: "Kgetha mohato le thuto, bula sehlooho mme o se bontshe tlelase.",
    sub2: "Lentswe ka leng le na le tlhaloso, setshwantsho, mehlala, dipotso le papadi.",
    search: "Batla thuto kapa sehlooho, mohl. dikarolwana",
    searchAria: "Batla thuto kapa sehlooho",
    levelsAria: "Mohato",
    subjectsUnit: "dithuto",
    topicsUnit: "dihlooho",
    fields: "Makala a ho ithuta",
    all: "Tsohle",
    empty: "Ha re a fumana thuto kapa sehlooho se joalo. Leka lentswe le leng kapa le lekgutshwane.",
    subjectsH: "Dithuto",
    topicsH: "Dihlooho",
    back: "Dithuto tsohle",
    readyH: "Dihlopha tse seng di loketse",
    topicsIn: (lv: string) => `Dihlooho: ${lv}`,
    topicSearch: "Batla dihlooho",
    dati: "",
    datiLong: "",
    present: "Bontsha tlelase",
    words: "mantswe",
    loading: "Re lokisa mantswe a bohlokwa a sehlooho...",
    fail: "Ha re a kgona ho kenya mantswe a bohlokwa hona jwale. Ka kopo leka hape kamora nakwana.",
    term: (n: number) => `Kotara ${n}`,
    curH: "Sekolo sa hao se latela kharikhulamo efe?",
    typeH: "Ke sekolo sa mofuta ofe?",
    pick1: "Dihlopha tsa mantswe di buleha ho ya ka kharikhulamo le dikreiti tsa sekolo sa hao.",
    pick2: "O kgetha hang feela. Ho fetola hamorao, ikopanye le rona.",
    notOwnerH: "Dihlopha tsa mantswe ha di eso bulwe",
    notOwnerP: "Akhaonto ya sekolo e qala ka ho kgetha mofuta wa sekolo, ebe dihlopha tsa dikreiti tsa sona di a buleha.",
    err: "Ho na le ntho e sa tsamaileng hantle. Ka kopo leka hape.",
    catalog: "Kharikhulamo",
    curNames: { "il-he": "Iseraele, kharikhulamo ya Seheberu", "il-ar": "Iseraele, thuto ya mmuso ya Maarabia", "za-caps": "Afrika Borwa, CAPS" },
  },
  ts: {
    title: "Mintlawa ya marito ya tidyondzo hinkwato",
    sub1: "Hlawula xiyimo na dyondzo, pfula nhlokomhaka kutani u yi komba tlilasi.",
    sub2: "Rito rin'wana na rin'wana ri na nhlamuselo, xifaniso, swikombiso, mavutiso na ntlangu.",
    search: "Lava dyondzo kumbe nhlokomhaka, xik. tiphexe",
    searchAria: "Lava dyondzo kumbe nhlokomhaka",
    levelsAria: "Xiyimo",
    subjectsUnit: "tidyondzo",
    topicsUnit: "tinhlokomhaka",
    fields: "Swiphemu swa ku dyondza",
    all: "Hinkwaswo",
    empty: "A hi kumanga dyondzo kumbe nhlokomhaka yo tano. Ringeta rito rin'wana kumbe ro koma.",
    subjectsH: "Tidyondzo",
    topicsH: "Tinhlokomhaka",
    back: "Tidyondzo hinkwato",
    readyH: "Mintlawa leyi lunghekeke",
    topicsIn: (lv: string) => `Tinhlokomhaka: ${lv}`,
    topicSearch: "Lava tinhlokomhaka",
    dati: "",
    datiLong: "",
    present: "Komba tlilasi",
    words: "marito",
    loading: "Hi lunghiselela marito ya nkoka ya nhlokomhaka...",
    fail: "A hi swi kotanga ku layicha marito ya nkoka sweswi. Hi kombela u ringeta nakambe endzhaku ka xinkarhana.",
    term: (n: number) => `Kotara ${n}`,
    curH: "Xikolo xa wena xi landzela kharikhulamu yihi?",
    typeH: "I xikolo xa muxaka muni?",
    pick1: "Mintlawa ya marito yi pfuleka hi ku ya hi kharikhulamu na tigiredi ta xikolo xa wena.",
    pick2: "U hlawula kan'we ntsena. Ku swi cinca endzhaku, tihlanganise na hina.",
    notOwnerH: "Mintlawa ya marito a yi si pfuriwa",
    notOwnerP: "Akhawunti ya xikolo yi sungula hi ku hlawula muxaka wa xikolo, kutani mintlawa ya tigiredi ta xona yi pfuleka.",
    err: "Ku na leswi nga fambangiki kahle. Hi kombela u ringeta nakambe.",
    catalog: "Kharikhulamu",
    curNames: { "il-he": "Israyele, kharikhulamu ya Xiheveru", "il-ar": "Israyele, dyondzo ya mfumo ya Maarabu", "za-caps": "Afrika Dzonga, CAPS" },
  },
  ss: {
    title: "Emacoco emagama etifundvo tonkhe",
    sub1: "Khetsa sigaba nesifundvo, uvule sihloko bese usikhombisa likilasi.",
    sub2: "Ligama ngalinye linenchazelo, sitfombe, tibonelo, imibuto nemdlalo.",
    search: "Sesha sifundvo nobe sihloko, sib. tingcenye",
    searchAria: "Sesha sifundvo nobe sihloko",
    levelsAria: "Sigaba",
    subjectsUnit: "tifundvo",
    topicsUnit: "tihloko",
    fields: "Tindzawo tekufundza",
    all: "Konkhe",
    empty: "Asitfolanga sifundvo nobe sihloko lesinjalo. Zama lelinye ligama nobe lelifisha.",
    subjectsH: "Tifundvo",
    topicsH: "Tihloko",
    back: "Tonkhe tifundvo",
    readyH: "Emacoco lasavele alungile",
    topicsIn: (lv: string) => `Tihloko: ${lv}`,
    topicSearch: "Sesha tihloko",
    dati: "",
    datiLong: "",
    present: "Khombisa likilasi",
    words: "emagama",
    loading: "Silungiselela emagama lamcoka esihloko...",
    fail: "Asikhonanga kulayisha emagama lamcoka nyalo. Sicela uphindze uzame ngemuva kwesikhashana.",
    term: (n: number) => `Ithemu ${n}`,
    curH: "Sikolwa sakho silandzela yiphi ikharikhulamu?",
    typeH: "Sikolwa saluhlobo luni?",
    pick1: "Emacoco emagama avuleka ngekwekharikhulamu nemabanga esikolwa sakho.",
    pick2: "Ukhetsa kanye kuphela. Kute ukushintje ngemuva, tsintsana natsi.",
    notOwnerH: "Emacoco emagama akakavulwa",
    notOwnerP: "I-akhawunti yesikolwa icala ngekukhetsa luhlobo lwesikolwa, bese kuvuleka emacoco emabanga aso.",
    err: "Kukhona lokungahambanga kahle. Sicela uphindze uzame.",
    catalog: "Ikharikhulamu",
    curNames: { "il-he": "Israyeli, ikharikhulamu yesiHebheru", "il-ar": "Israyeli, imfundvo yahulumende yema-Arabhu", "za-caps": "iNingizimu Afrika, CAPS" },
  },
  ve: {
    title: "Zwigwada zwa maipfi zwa ngudo dzoṱhe",
    sub1: "Khethani vhuimo na ngudo, vulani thoho, ni i sumbedze kilasi.",
    sub2: "Ipfi ḽiṅwe na ḽiṅwe ḽi na ṱhalutshedzo, tshifanyiso, tsumbo, mbudziso na mutambo.",
    search: "Ṱoḓani ngudo kana thoho, tsumbo, khethekanyo",
    searchAria: "Ṱoḓani ngudo kana thoho",
    levelsAria: "Vhuimo",
    subjectsUnit: "ngudo",
    topicsUnit: "dziṱhoho",
    fields: "Masia a u guda",
    all: "Zwoṱhe",
    empty: "A ro ngo wana ngudo kana thoho yo raliho. Lingedzani ḽiṅwe ipfi kana ḽipfufhi.",
    subjectsH: "Ngudo",
    topicsH: "Dziṱhoho",
    back: "Ngudo dzoṱhe",
    readyH: "Zwigwada zwo no lugaho",
    topicsIn: (lv: string) => `Dziṱhoho: ${lv}`,
    topicSearch: "Ṱoḓani dziṱhoho",
    dati: "",
    datiLong: "",
    present: "Sumbedzani kilasi",
    words: "maipfi",
    loading: "Ri khou lugisela maipfi a ndeme a thoho...",
    fail: "A ro ngo kona u dzhenisa maipfi a ndeme zwino. Ri humbela ni lingedze hafhu nga murahu ha tshifhinganyana.",
    term: (n: number) => `Kotara ${n}`,
    curH: "Tshikolo tshaṋu tshi tevhela kharikhulamu ifhio?",
    typeH: "Ndi tshikolo tsha lushaka lufhio?",
    pick1: "Zwigwada zwa maipfi zwi vulea u ya nga kharikhulamu na gireidi dza tshikolo tshaṋu.",
    pick2: "Ni khetha luthihi fhedzi. U shandukisa nga murahu, kwamani riṋe.",
    notOwnerH: "Zwigwada zwa maipfi a zwi athu u vulwa",
    notOwnerP: "Akhaunthu ya tshikolo i thoma nga u khetha lushaka lwa tshikolo, nga murahu zwigwada zwa gireidi dzatsho zwa vulea.",
    err: "Hu na zwi songo tshimbila zwavhuḓi. Ri humbela ni lingedze hafhu.",
    catalog: "Kharikhulamu",
    curNames: { "il-he": "Isiraele, kharikhulamu ya Luheberu", "il-ar": "Isiraele, pfunzo ya muvhuso ya Maarabu", "za-caps": "Afurika Tshipembe, CAPS" },
  },
  nr: {
    title: "Amaqoqo wamezwi wazo zoke iimfundo",
    sub1: "Khetha isigaba nesifundo, uvule isihloko bese usitjengisa itlasi.",
    sub2: "Ilizwi ngalinye linehlathululo, isithombe, iimbonelo, imibuzo nomdlalo.",
    search: "Funa isifundo namkha isihloko, isib. iingcenye",
    searchAria: "Funa isifundo namkha isihloko",
    levelsAria: "Isigaba",
    subjectsUnit: "iimfundo",
    topicsUnit: "iinhloko",
    fields: "Iindawo zokufunda",
    all: "Koke",
    empty: "Asikafumani isifundo namkha isihloko esinjalo. Linga elinye ilizwi namkha elifitjhani.",
    subjectsH: "Iimfundo",
    topicsH: "Iinhloko",
    back: "Zoke iimfundo",
    readyH: "Amaqoqo asele alungile",
    topicsIn: (lv: string) => `Iinhloko: ${lv}`,
    topicSearch: "Funa iinhloko",
    dati: "",
    datiLong: "",
    present: "Tjengisa itlasi",
    words: "amezwi",
    loading: "Silungiselela amezwi aqakathekileko wesihloko...",
    fail: "Asikghonanga ukulayitha amezwi aqakathekileko nje. Sibawa ulinge godu ngemva kwesikhatjhana.",
    term: (n: number) => `Ikotara ${n}`,
    curH: "Isikolwakho silandela iyiphi ikharikhyulamu?",
    typeH: "Sisikolo sehlobo elinjani?",
    pick1: "Amaqoqo wamezwi avuleka ngokwekharikhyulamu namabanga wesikolwakho.",
    pick2: "Ukhetha kanye kwaphela. Bona utjhugulule ngemva, thintana nathi.",
    notOwnerH: "Amaqoqo wamezwi akhenge avulwe",
    notOwnerP: "I-akhawunti yesikolo ithoma ngokukhetha ihlobo lesikolo, bese kuvuleka amaqoqo wamabanga waso.",
    err: "Kukhona okungakhambanga kuhle. Sibawa ulinge godu.",
    catalog: "Ikharikhyulamu",
    curNames: { "il-he": "Israyeli, ikharikhyulamu yesiHebheru", "il-ar": "Israyeli, ifundo karhulumende yama-Arabhu", "za-caps": "iSewula Afrika, CAPS" },
  },
  ja: {
    title: "すべての教科の単語セット",
    sub1: "段階と教科を選び、単元を開いてクラスに映します。",
    sub2: "どの単語にも定義、画像、例文、クイズ、ゲームがあります。",
    search: "教科や単元を検索（例：分数）",
    searchAria: "教科や単元を検索",
    levelsAria: "段階",
    subjectsUnit: "教科",
    topicsUnit: "単元",
    fields: "学習分野",
    all: "すべて",
    empty: "該当する教科や単元が見つかりませんでした。別の言葉か、もっと短い言葉でお試しください。",
    subjectsH: "教科",
    topicsH: "単元",
    back: "すべての教科",
    readyH: "用意済みのセット",
    topicsIn: (lv: string) => `単元：${lv}`,
    topicSearch: "単元を検索",
    dati: "",
    datiLong: "",
    present: "クラスに映す",
    words: "語",
    loading: "単元のキーワードを準備しています...",
    fail: "キーワードを読み込めませんでした。少し待ってからもう一度お試しください。",
    term: (n: number) => `第${n}学期`,
    curH: "学校はどのカリキュラムに沿っていますか？",
    typeH: "学校の種類は？",
    pick1: "単語セットは、学校のカリキュラムと学年に合わせて開きます。",
    pick2: "選ぶのは一度だけです。あとで変更するときはご連絡ください。",
    notOwnerH: "単語セットはまだ開いていません",
    notOwnerP: "まず学校のアカウントで学校の種類を選ぶと、その学年のセットが開きます。",
    err: "問題が発生しました。もう一度お試しください。",
    catalog: "カリキュラム",
    curNames: { "il-he": "イスラエル、ヘブライ語のカリキュラム", "il-ar": "イスラエル、アラブ公立教育", "za-caps": "南アフリカ、CAPS" },
  },
  "zh-CN": {
    title: "各科词汇组",
    sub1: "选择学段和科目，打开单元，投屏给全班。",
    sub2: "每个词都有释义、图片、例句、小测验和游戏。",
    search: "搜索科目或单元，例如分数",
    searchAria: "搜索科目或单元",
    levelsAria: "学段",
    subjectsUnit: "个科目",
    topicsUnit: "个单元",
    fields: "学习领域",
    all: "全部",
    empty: "没有找到这样的科目或单元。请换一个词或更短的词试试。",
    subjectsH: "科目",
    topicsH: "单元",
    back: "全部科目",
    readyH: "现成的词汇组",
    topicsIn: (lv: string) => `单元：${lv}`,
    topicSearch: "搜索单元",
    dati: "",
    datiLong: "",
    present: "投屏给全班",
    words: "个词",
    loading: "正在准备单元关键词...",
    fail: "暂时无法加载关键词。请稍后再试。",
    term: (n: number) => `第 ${n} 学期`,
    curH: "贵校采用哪套课程？",
    typeH: "这是哪一类学校？",
    pick1: "词汇组会按照学校的课程和年级开放。",
    pick2: "只需选择一次。之后如需更改，请联系我们。",
    notOwnerH: "词汇组尚未开放",
    notOwnerP: "学校账户先选择学校类型，之后相应年级的词汇组就会开放。",
    err: "出了点问题。请再试一次。",
    catalog: "课程",
    curNames: { "il-he": "以色列，希伯来语课程", "il-ar": "以色列，阿拉伯公立教育", "za-caps": "南非，CAPS" },
  },
  "zh-TW": {
    title: "各科詞彙組",
    sub1: "選擇學習階段和科目，打開單元，投影給全班。",
    sub2: "每個詞都有釋義、圖片、例句、小測驗和遊戲。",
    search: "搜尋科目或單元，例如分數",
    searchAria: "搜尋科目或單元",
    levelsAria: "學習階段",
    subjectsUnit: "個科目",
    topicsUnit: "個單元",
    fields: "學習領域",
    all: "全部",
    empty: "找不到這樣的科目或單元。請換一個詞或更短的詞試試。",
    subjectsH: "科目",
    topicsH: "單元",
    back: "全部科目",
    readyH: "現成的詞彙組",
    topicsIn: (lv: string) => `單元：${lv}`,
    topicSearch: "搜尋單元",
    dati: "",
    datiLong: "",
    present: "投影給全班",
    words: "個詞",
    loading: "正在準備單元關鍵詞...",
    fail: "暫時無法載入關鍵詞。請稍後再試。",
    term: (n: number) => `第 ${n} 學期`,
    curH: "貴校採用哪一套課程？",
    typeH: "這是哪一類學校？",
    pick1: "詞彙組會依照學校的課程和年級開放。",
    pick2: "只需選擇一次。之後若要更改，請聯絡我們。",
    notOwnerH: "詞彙組尚未開放",
    notOwnerP: "學校帳戶先選擇學校類型，之後相應年級的詞彙組就會開放。",
    err: "發生問題。請再試一次。",
    catalog: "課程",
    curNames: { "il-he": "以色列，希伯來語課程", "il-ar": "以色列，阿拉伯公立教育", "za-caps": "南非，CAPS" },
  },
  ko: {
    title: "모든 과목의 단어 세트",
    sub1: "학교급과 과목을 고르고, 단원을 열어 학급에 띄워 보세요.",
    sub2: "단어마다 정의, 그림, 예문, 퀴즈, 게임이 있어요.",
    search: "과목이나 단원 검색, 예: 분수",
    searchAria: "과목이나 단원 검색",
    levelsAria: "학교급",
    subjectsUnit: "과목",
    topicsUnit: "단원",
    fields: "학습 영역",
    all: "전체",
    empty: "해당하는 과목이나 단원이 없어요. 다른 단어나 더 짧은 단어로 찾아보세요.",
    subjectsH: "과목",
    topicsH: "단원",
    back: "모든 과목",
    readyH: "준비된 세트",
    topicsIn: (lv: string) => `단원: ${lv}`,
    topicSearch: "단원 검색",
    dati: "",
    datiLong: "",
    present: "학급에 띄우기",
    words: "단어",
    loading: "단원의 핵심 단어를 준비하고 있어요...",
    fail: "지금은 핵심 단어를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
    term: (n: number) => `${n}학기`,
    curH: "학교에서 어떤 교육과정을 따르나요?",
    typeH: "어떤 종류의 학교인가요?",
    pick1: "단어 세트는 학교의 교육과정과 학년에 따라 열려요.",
    pick2: "한 번만 고르면 돼요. 나중에 바꾸려면 저희에게 연락해 주세요.",
    notOwnerH: "단어 세트가 아직 열리지 않았어요",
    notOwnerP: "먼저 학교 계정에서 학교 종류를 고르면, 해당 학년의 세트가 열려요.",
    err: "문제가 생겼어요. 다시 시도해 주세요.",
    catalog: "교육과정",
    curNames: { "il-he": "이스라엘, 히브리어 교육과정", "il-ar": "이스라엘, 아랍 공립 교육", "za-caps": "남아프리카공화국, CAPS" },
  },
  th: {
    title: "ชุดคำศัพท์สำหรับทุกวิชา",
    sub1: "เลือกช่วงชั้นและวิชา เปิดหัวข้อ แล้วฉายให้ทั้งห้องดู",
    sub2: "ทุกคำมีความหมาย รูปภาพ ตัวอย่าง แบบทดสอบ และเกม",
    search: "ค้นหาวิชาหรือหัวข้อ เช่น เศษส่วน",
    searchAria: "ค้นหาวิชาหรือหัวข้อ",
    levelsAria: "ช่วงชั้น",
    subjectsUnit: "วิชา",
    topicsUnit: "หัวข้อ",
    fields: "กลุ่มสาระการเรียนรู้",
    all: "ทั้งหมด",
    empty: "ไม่พบวิชาหรือหัวข้อนี้ ลองใช้คำอื่นหรือคำที่สั้นกว่า",
    subjectsH: "วิชา",
    topicsH: "หัวข้อ",
    back: "ทุกวิชา",
    readyH: "ชุดคำที่พร้อมใช้",
    topicsIn: (lv: string) => `หัวข้อ: ${lv}`,
    topicSearch: "ค้นหาหัวข้อ",
    dati: "",
    datiLong: "",
    present: "ฉายให้ทั้งห้อง",
    words: "คำ",
    loading: "กำลังเตรียมคำสำคัญของหัวข้อ...",
    fail: "ยังโหลดคำสำคัญไม่ได้ในตอนนี้ โปรดลองอีกครั้งในอีกสักครู่",
    term: (n: number) => `ภาคเรียนที่ ${n}`,
    curH: "โรงเรียนของคุณใช้หลักสูตรใด?",
    typeH: "เป็นโรงเรียนประเภทใด?",
    pick1: "ชุดคำศัพท์จะเปิดตามหลักสูตรและระดับชั้นของโรงเรียน",
    pick2: "เลือกเพียงครั้งเดียว หากต้องการเปลี่ยนภายหลัง โปรดติดต่อเรา",
    notOwnerH: "ชุดคำศัพท์ยังไม่เปิด",
    notOwnerP: "บัญชีของโรงเรียนต้องเลือกประเภทโรงเรียนก่อน จากนั้นชุดคำของระดับชั้นที่ตรงกันจะเปิด",
    err: "เกิดข้อผิดพลาด โปรดลองอีกครั้ง",
    catalog: "หลักสูตร",
    curNames: { "il-he": "อิสราเอล หลักสูตรภาษาฮีบรู", "il-ar": "อิสราเอล การศึกษาของรัฐสำหรับชาวอาหรับ", "za-caps": "แอฟริกาใต้ CAPS" },
  },
  hi: {
    title: "हर विषय के लिए शब्द-समूह",
    sub1: "चरण और विषय चुनें, कोई पाठ खोलें और कक्षा को दिखाएँ।",
    sub2: "हर शब्द के साथ परिभाषा, चित्र, उदाहरण, क्विज़ और खेल है।",
    search: "विषय या पाठ खोजें, जैसे भिन्न",
    searchAria: "विषय या पाठ खोजें",
    levelsAria: "चरण",
    subjectsUnit: "विषय",
    topicsUnit: "पाठ",
    fields: "अधिगम क्षेत्र",
    all: "सभी",
    empty: "ऐसा कोई विषय या पाठ नहीं मिला। कोई दूसरा या छोटा शब्द आज़माएँ।",
    subjectsH: "विषय",
    topicsH: "पाठ",
    back: "सभी विषय",
    readyH: "तैयार शब्द-समूह",
    topicsIn: (lv: string) => `पाठ: ${lv}`,
    topicSearch: "पाठ खोजें",
    dati: "",
    datiLong: "",
    present: "कक्षा को दिखाएँ",
    words: "शब्द",
    loading: "पाठ के मुख्य शब्द तैयार हो रहे हैं...",
    fail: "अभी मुख्य शब्द लोड नहीं हो पाए। कृपया थोड़ी देर बाद फिर कोशिश करें।",
    term: (n: number) => `सत्र ${n}`,
    curH: "आपका स्कूल कौन-सा पाठ्यक्रम अपनाता है?",
    typeH: "यह किस तरह का स्कूल है?",
    pick1: "शब्द-समूह आपके स्कूल के पाठ्यक्रम और कक्षाओं के अनुसार खुलते हैं।",
    pick2: "चुनाव एक बार होता है। बाद में बदलने के लिए हमसे संपर्क करें।",
    notOwnerH: "शब्द-समूह अभी नहीं खुले हैं",
    notOwnerP: "पहले स्कूल के खाते में स्कूल का प्रकार चुना जाता है, फिर उसकी कक्षाओं के शब्द-समूह खुलते हैं।",
    err: "कुछ गड़बड़ हो गई। कृपया फिर कोशिश करें।",
    catalog: "पाठ्यक्रम",
    curNames: { "il-he": "इज़राइल, हिब्रू पाठ्यक्रम", "il-ar": "इज़राइल, अरब सरकारी शिक्षा", "za-caps": "दक्षिण अफ़्रीका, CAPS" },
  },
  bn: {
    title: "প্রতিটি বিষয়ের জন্য শব্দের সেট",
    sub1: "স্তর ও বিষয় বেছে নিন, একটি অধ্যায় খুলুন এবং ক্লাসকে দেখান।",
    sub2: "প্রতিটি শব্দের সঙ্গে আছে সংজ্ঞা, ছবি, উদাহরণ, কুইজ আর খেলা।",
    search: "বিষয় বা অধ্যায় খুঁজুন, যেমন ভগ্নাংশ",
    searchAria: "বিষয় বা অধ্যায় খুঁজুন",
    levelsAria: "স্তর",
    subjectsUnit: "বিষয়",
    topicsUnit: "অধ্যায়",
    fields: "শিখনের ক্ষেত্র",
    all: "সব",
    empty: "এমন কোনো বিষয় বা অধ্যায় পাওয়া যায়নি। অন্য বা ছোট কোনো শব্দ দিয়ে চেষ্টা করুন।",
    subjectsH: "বিষয়",
    topicsH: "অধ্যায়",
    back: "সব বিষয়",
    readyH: "তৈরি সেট",
    topicsIn: (lv: string) => `অধ্যায়: ${lv}`,
    topicSearch: "অধ্যায় খুঁজুন",
    dati: "",
    datiLong: "",
    present: "ক্লাসকে দেখান",
    words: "শব্দ",
    loading: "অধ্যায়ের মূল শব্দগুলো তৈরি হচ্ছে...",
    fail: "এখন মূল শব্দগুলো লোড করা গেল না। একটু পরে আবার চেষ্টা করুন।",
    term: (n: number) => `টার্ম ${n}`,
    curH: "আপনার স্কুল কোন পাঠ্যক্রম অনুসরণ করে?",
    typeH: "এটি কোন ধরনের স্কুল?",
    pick1: "শব্দের সেটগুলো আপনার স্কুলের পাঠ্যক্রম ও শ্রেণি অনুযায়ী খোলে।",
    pick2: "একবারই বেছে নিতে হয়। পরে বদলাতে চাইলে আমাদের সঙ্গে যোগাযোগ করুন।",
    notOwnerH: "শব্দের সেটগুলো এখনো খোলেনি",
    notOwnerP: "প্রথমে স্কুলের অ্যাকাউন্ট থেকে স্কুলের ধরন বেছে নেওয়া হয়, তারপর সেই শ্রেণিগুলোর সেট খোলে।",
    err: "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    catalog: "পাঠ্যক্রম",
    curNames: { "il-he": "ইসরায়েল, হিব্রু পাঠ্যক্রম", "il-ar": "ইসরায়েল, আরব সরকারি শিক্ষা", "za-caps": "দক্ষিণ আফ্রিকা, CAPS" },
  },
  am: {
    title: "ለሁሉም የትምህርት ዓይነቶች የቃላት ስብስቦች",
    sub1: "ደረጃና የትምህርት ዓይነት ይምረጡ፣ ርዕስ ይክፈቱና ለክፍሉ ያሳዩ።",
    sub2: "እያንዳንዱ ቃል ትርጉም፣ ሥዕል፣ ምሳሌዎች፣ ጥያቄዎችና ጨዋታ አለው።",
    search: "የትምህርት ዓይነት ወይም ርዕስ ይፈልጉ፣ ለምሳሌ ክፍልፋዮች",
    searchAria: "የትምህርት ዓይነት ወይም ርዕስ ይፈልጉ",
    levelsAria: "ደረጃ",
    subjectsUnit: "የትምህርት ዓይነቶች",
    topicsUnit: "ርዕሶች",
    fields: "የትምህርት መስኮች",
    all: "ሁሉም",
    empty: "እንዲህ ያለ የትምህርት ዓይነት ወይም ርዕስ አልተገኘም። ሌላ ወይም አጭር ቃል ይሞክሩ።",
    subjectsH: "የትምህርት ዓይነቶች",
    topicsH: "ርዕሶች",
    back: "ሁሉም የትምህርት ዓይነቶች",
    readyH: "ዝግጁ ስብስቦች",
    topicsIn: (lv: string) => `ርዕሶች፦ ${lv}`,
    topicSearch: "ርዕስ ይፈልጉ",
    dati: "",
    datiLong: "",
    present: "ለክፍሉ አሳይ",
    words: "ቃላት",
    loading: "የርዕሱን ቁልፍ ቃላት እያዘጋጀን ነው...",
    fail: "ቁልፍ ቃላቱን አሁን መጫን አልቻልንም። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።",
    term: (n: number) => `ሩብ ዓመት ${n}`,
    curH: "ትምህርት ቤትዎ የትኛውን ሥርዓተ ትምህርት ይከተላል?",
    typeH: "ምን ዓይነት ትምህርት ቤት ነው?",
    pick1: "የቃላት ስብስቦቹ በትምህርት ቤትዎ ሥርዓተ ትምህርትና ክፍሎች መሠረት ይከፈታሉ።",
    pick2: "ምርጫው አንድ ጊዜ ብቻ ነው። በኋላ ለመቀየር ያግኙን።",
    notOwnerH: "የቃላት ስብስቦቹ ገና አልተከፈቱም",
    notOwnerP: "በመጀመሪያ የትምህርት ቤቱ መለያ የትምህርት ቤቱን ዓይነት ይመርጣል፣ ከዚያ የክፍሎቹ ስብስቦች ይከፈታሉ።",
    err: "የሆነ ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
    catalog: "ሥርዓተ ትምህርት",
    curNames: { "il-he": "እስራኤል፣ የዕብራይስጥ ሥርዓተ ትምህርት", "il-ar": "እስራኤል፣ የዓረብ መንግሥት ትምህርት", "za-caps": "ደቡብ አፍሪካ፣ CAPS" },
  },
  fa: {
    title: "مجموعه‌های واژه برای همه‌ی درس‌ها",
    sub1: "مقطع و درس را انتخاب کنید، یک مبحث را باز کنید و برای کلاس نمایش دهید.",
    sub2: "هر واژه تعریف، تصویر، مثال، آزمونک و بازی دارد.",
    search: "جست‌وجوی درس یا مبحث، مثلاً کسرها",
    searchAria: "جست‌وجوی درس یا مبحث",
    levelsAria: "مقطع",
    subjectsUnit: "درس",
    topicsUnit: "مبحث",
    fields: "حوزه‌های یادگیری",
    all: "همه",
    empty: "چنین درس یا مبحثی پیدا نشد. واژه‌ی دیگر یا کوتاه‌تری را امتحان کنید.",
    subjectsH: "درس‌ها",
    topicsH: "مبحث‌ها",
    back: "همه‌ی درس‌ها",
    readyH: "مجموعه‌های آماده",
    topicsIn: (lv: string) => `مبحث‌ها: ${lv}`,
    topicSearch: "جست‌وجوی مبحث",
    dati: "",
    datiLong: "",
    present: "نمایش برای کلاس",
    words: "واژه",
    loading: "در حال آماده کردن واژه‌های کلیدی مبحث...",
    fail: "فعلاً نتوانستیم واژه‌های کلیدی را بارگذاری کنیم. لطفاً کمی بعد دوباره امتحان کنید.",
    term: (n: number) => `نوبت ${n}`,
    curH: "مدرسه‌ی شما از کدام برنامه‌ی درسی پیروی می‌کند؟",
    typeH: "مدرسه از چه نوعی است؟",
    pick1: "مجموعه‌های واژه بر اساس برنامه‌ی درسی و پایه‌های مدرسه‌ی شما باز می‌شوند.",
    pick2: "انتخاب فقط یک بار انجام می‌شود. برای تغییر آن بعداً با ما تماس بگیرید.",
    notOwnerH: "مجموعه‌های واژه هنوز باز نشده‌اند",
    notOwnerP: "اول حساب مدرسه نوع مدرسه را انتخاب می‌کند و بعد مجموعه‌های پایه‌های آن باز می‌شوند.",
    err: "مشکلی پیش آمد. لطفاً دوباره امتحان کنید.",
    catalog: "برنامه‌ی درسی",
    curNames: { "il-he": "اسرائیل، برنامه‌ی درسی به زبان عبری", "il-ar": "اسرائیل، آموزش دولتی عربی", "za-caps": "آفریقای جنوبی، CAPS" },
  },
};
const RTL_UI = new Set(["he", "ar", "fa"]);
/** The copy in a UI language, English for a language not listed. */
const strOf = (lang: string): T => (lang === "he" ? STR.he : lang === "ar" ? STR.ar : STR_MORE[lang] ? { ...STR.en, ...STR_MORE[lang] } : STR.en);

type Ctx = { view: CatalogView; T: T; allowed: string[] };
const CatCtx = createContext<Ctx | null>(null);
const useCat = () => useContext(CatCtx)!;
const inAllowed = (allowed: string[], t: ViewTopic) => allowed.includes(t.l);

function norm(s: string) {
  return s.replace(/[֑-ׇً-ٰٟـ"״׳']/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/\s+/g, " ").trim().toLowerCase();
}
/** Query matches at the start of a word, or after one Hebrew prefix letter
 *  (ו ה ב ל כ), so "שברים" finds "בשברים" but not "משברים". */
function matches(text: string, q: string) {
  if (!q) return true;
  const t = norm(text);
  if (q.includes(" ")) return t.includes(q);
  const qa = q.replace(/^ال/, "");
  return t.split(/[\s,:.()،-]+/).some((w) => w.startsWith(q) || (/^[והבלכ]/.test(w) && w.slice(1).startsWith(q))
    // Arabic: also after و ف ب ل ك and the article ال.
    || w.replace(/^[وفبلك]?(ال|ل)?/, "").startsWith(qa));
}
const topicsOf = (view: CatalogView, subject: string, level?: string) =>
  view.topics.filter((t) => t.s === subject && (!level || t.l === level));

export default function CurriculumBrowser({ legacy }: { legacy?: ReactNode }) {
  const href = useHref();
  const router = useRouter();
  const sp = useSearchParams();
  const { lang } = useLang();
  const { user } = useAuth();
  const [school, setSchool] = useState<{ levels: string[]; curriculum: Curriculum | ""; owner: boolean; gemaraOff?: boolean } | null>(null);
  useEffect(() => {
    if (!user) return;
    let alive = true;
    user.getIdToken()
      .then((tk) => fetch("/api/school/levels", { headers: { Authorization: `Bearer ${tk}` } }))
      .then((r) => (r.ok ? r.json() : { levels: [], curriculum: "", owner: false }))
      .then((j: { levels: string[]; curriculum: Curriculum | ""; owner: boolean; gemaraCatalogOff?: boolean }) => {
        if (alive) setSchool({ levels: j.levels ?? [], curriculum: j.curriculum ?? "", owner: !!j.owner, gemaraOff: j.gemaraCatalogOff === true });
      })
      .catch(() => { if (alive) setSchool({ levels: [], curriculum: "", owner: false }); });
    return () => { alive = false; };
  }, [user]);

  // "all" schools (Gadi's own) can switch catalogs; everyone else sees theirs.
  const [viewPick, setViewPick] = useState<CatalogId>(() => {
    const c = sp?.get("c") as CatalogId | null;
    return c && CATALOG_IDS.includes(c) ? c : lang === "he" ? "il-he" : lang === "ar" ? "il-ar" : "za-caps";
  });
  const sc = school?.curriculum;
  const viewId: CatalogId = sc === "il-he" || sc === "il-ar" || sc === "za-caps" ? sc : viewPick;
  // The older Gemara catalog units, closed for this school by the server
  // (2026-10-18, off unless Gadi picks the school): left out of the list too.
  const baseView = catalogView(viewId);
  const gemaraOff = school?.gemaraOff === true;
  const view = useMemo(() => (gemaraOff ? { ...baseView, topics: baseView.topics.filter((t) => t.s !== "gemara") } : baseView), [baseView, gemaraOff]);
  // The English catalog speaks the teacher's own UI language (2026-10-18);
  // the Hebrew and Arabic catalogs keep their own.
  const T: T = view.ui === "en" && !RTL_UI.has(lang) ? strOf(lang) : STR[view.ui];
  const storeKey = `gadit-sets-level-${viewId}`;
  const [levelState, setLevelState] = useState<string>(() => {
    const fromUrl = sp?.get("l");
    if (fromUrl) return fromUrl;
    try {
      return (typeof window !== "undefined" ? localStorage.getItem(storeKey) : null) || "";
    } catch { return ""; }
  });
  const allowed = view.levels.map((l) => l.key).filter((k) => school?.levels.includes(k));
  const lvl = allowed.includes(levelState) ? levelState : allowed.includes(view.defaultLevel) ? view.defaultLevel : allowed[0] ?? view.defaultLevel;
  const subjectKey = sp?.get("s") ?? "";
  const subject = subjectKey ? view.subjects.find((s) => s.key === subjectKey) : undefined;

  const go = (params: Record<string, string | undefined>, push = true) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    // A school with every catalog keeps the one it is looking at in the URL,
    // so coming back from the projector lands on the same catalog.
    if (school?.curriculum === "all" && !q.has("c")) q.set("c", viewId);
    const url = href(`/sets${q.toString() ? `?${q}` : ""}`);
    if (push) router.push(url, { scroll: true });
    else router.replace(url, { scroll: false });
  };
  const setLevel = (l: string) => {
    setLevelState(l);
    try { localStorage.setItem(storeKey, l); } catch { /* storage blocked */ }
    if (subject) go({ s: subject.key, l }, false);
  };

  if (school?.curriculum === "legacy" && legacy) return <>{legacy}</>;
  const pickUi = school && !allowed.length ? strOf(lang) : T;
  const dir = school && !allowed.length ? (RTL_UI.has(lang) ? "rtl" : "ltr") : view.dir;

  return (
    <div className="wordbook cb" dir={dir}>
      <style>{CSS}</style>
      <header className="cb-top">
        <Link href={href("/")} className="cb-wordmark" dir="ltr" aria-label="Gadit home">
          Gad<span>it</span>
        </Link>
        {school?.curriculum === "all" && (
          <div className="cb-switch" role="group" aria-label={T.catalog}>
            {CATALOG_IDS.map((id) => (
              <button key={id} type="button" className={id === viewId ? "on" : ""} onClick={() => { setViewPick(id); go({ c: id }, false); }}>
                {T.curNames?.[id] ?? CURRICULA.find((c) => c.key === id)?.[view.ui] ?? id}
              </button>
            ))}
          </div>
        )}
      </header>
      <main className="cb-main">
        <CatCtx.Provider value={{ view, T, allowed }}>
          {!school ? null : !allowed.length ? (
            <>
              {/* A teacher's own sets don't wait for the school type (2026-10-17). */}
              <OurSets />
              <SchoolTypePicker T={pickUi} uiLang={uiOf(lang)} owner={school.owner} onSet={(levels, curriculum) => setSchool({ ...school, levels, curriculum })} />
            </>
          ) : subject ? (
            <SubjectView
              subject={subject}
              level={lvl}
              setLevel={setLevel}
              openTopic={sp?.get("t") ?? ""}
              // Step back when the catalog home is the previous page, so the
              // browser Back afterwards does not reopen this subject.
              onBack={() => (canStepBack(undefined, (u) => /\/sets\/?$/.test(u.pathname) && !u.searchParams.has("s")) ? router.back() : go({ l: lvl }))}
              onTopic={(t) => go({ s: subject.key, l: lvl, t: t || undefined }, false)}
            />
          ) : (
            <HomeView
              level={lvl}
              setLevel={setLevel}
              openSubject={(s, l) => go({ s, l: l ?? lvl })}
              openTopic={(t) => go({ s: t.s, l: t.l, t: t.id })}
            />
          )}
        </CatCtx.Provider>
      </main>
    </div>
  );
}

/* ── Home: level tabs, fields, subject cards, search ─────────────────── */

function HomeView(props: {
  level: string;
  setLevel: (l: string) => void;
  openSubject: (s: string, l?: string) => void;
  openTopic: (t: ViewTopic) => void;
}) {
  const { level, setLevel, openSubject, openTopic } = props;
  const { view, T, allowed } = useCat();
  const [query, setQuery] = useState("");
  const counts = useMemo(() => {
    const c: Record<string, Record<string, number>> = {};
    for (const t of view.topics) ((c[t.l] ||= {})[t.s] = (c[t.l]?.[t.s] ?? 0) + 1);
    return c;
  }, [view]);
  const q = norm(query);
  const sections = view.categories.map((cat) => ({
    cat,
    subjects: view.subjects.filter((s) => s.cat === cat.key && counts[level]?.[s.key]),
  })).filter((x) => x.subjects.length > 0);
  // Field filter (Gadi 2026-10-04): "All" shows every field, a field chip
  // shows only that field.
  const [catState, setCat] = useState("all");
  const cat = sections.some((x) => x.cat.key === catState) ? catState : "all";
  const shownSections = cat === "all" ? sections : sections.filter((x) => x.cat.key === cat);

  return (
    <>
      <h1 className="cb-h1">{T.title}</h1>
      <p className="cb-sub">
        {T.sub1}
        <br />
        {T.sub2}
      </p>

      {/* The school's own sets first (Gadi 2026-10-17). */}
      <OurSets />

      <div className="cb-search">
        <SearchIcon />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={T.search} aria-label={T.searchAria} />
      </div>

      {q ? (
        <SearchResults q={q} openSubject={openSubject} openTopic={openTopic} />
      ) : (
        <>
          {allowed.length > 1 && (
            <LevelTabs level={level} setLevel={setLevel} counts={(l) => Object.keys(counts[l] ?? {}).length} kind="subjects" only={allowed} />
          )}
          <nav className="cb-cats" aria-label={T.fields}>
            <button type="button" className={"cb-cat-chip" + (cat === "all" ? " on" : "")} aria-pressed={cat === "all"} onClick={() => setCat("all")} style={{ ["--c" as string]: "#0E8A8A" }}>
              <AllIcon />
              {T.all}
            </button>
            {sections.map(({ cat: c }) => (
              <button type="button" key={c.key} className={"cb-cat-chip" + (cat === c.key ? " on" : "")} aria-pressed={cat === c.key} onClick={() => setCat(c.key)} style={{ ["--c" as string]: CAT_COLOR[c.key] }}>
                <img src={categoryIcon(c.key)} alt="" width={22} height={22} loading="lazy" />
                {c.name}
              </button>
            ))}
          </nav>
          <div className={"cb-board" + (cat === "all" ? "" : " solo")}>
            {shownSections.map(({ cat, subjects }) => (
              <section key={cat.key} id={`cat-${cat.key}`} className="cb-panel" style={{ ["--c" as string]: CAT_COLOR[cat.key] }}>
                <h2 className="cb-h2">
                  <img src={categoryIcon(cat.key)} alt="" width={32} height={32} loading="lazy" />
                  {cat.name}
                </h2>
                <div className="cb-tiles">
                  {subjects.map((s) => (
                    <SubjectCard key={s.key} s={s} n={counts[level][s.key]} onClick={() => openSubject(s.key)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function LevelTabs({ level, setLevel, counts, kind, only }: {
  level: string; setLevel: (l: string) => void; counts: (l: string) => number; kind: Kind; only?: string[];
}) {
  const { view, T } = useCat();
  const tabs = view.levels.filter((l) => !only || only.includes(l.key));
  const idx = Math.max(0, tabs.findIndex((l) => l.key === level));
  const n = tabs.length;
  const sign = view.dir === "rtl" ? -1 : 1;
  // A white pill slides under the chosen tab; the others keep a thin frame
  // so they read as clickable (Gadi 2026-10-04).
  return (
    <div className="cb-levels" role="tablist" aria-label={T.levelsAria} style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      <span
        className="cb-level-pill"
        aria-hidden
        style={{ width: `calc((100% - 10px - ${(n - 1) * 6}px) / ${n})`, transform: `translateX(calc(${sign * idx} * (100% + 6px)))` }}
      />
      {tabs.map((l) => (
        <button key={l.key} type="button" role="tab" aria-selected={l.key === level} className={"cb-level" + (l.key === level ? " on" : "")} onClick={() => setLevel(l.key)}>
          <b className="full">{l.name}</b>
          <b className="short">{l.short}</b>
          <span>{count(T, counts(l.key), kind)}</span>
        </button>
      ))}
    </div>
  );
}

function SubjectCard({ s, n, onClick, big }: { s: ViewSubject; n: number; onClick: () => void; big?: boolean }) {
  const { T } = useCat();
  return (
    <button type="button" className={"cb-card" + (big ? " big" : "")} onClick={onClick} style={big ? { ["--c" as string]: CAT_COLOR[s.cat] } : undefined}>
      <span className="cb-card-img">
        <img src={subjectIcon(s.key)} alt="" width={72} height={72} loading="lazy" />
      </span>
      <span className="cb-card-name">{s.name}</span>
      <span className="cb-card-meta">
        {count(T, n, "topics")}
        {s.dati && T.dati ? <span className="cb-dati">{T.dati}</span> : null}
      </span>
    </button>
  );
}

function topicMeta(view: CatalogView, T: T, t: ViewTopic) {
  return [t.g ? view.gradeLabel(t.g) : "", t.term ? T.term(t.term) : ""].filter(Boolean).join(" · ");
}

function SearchResults({ q, openSubject, openTopic }: {
  q: string; openSubject: (s: string, l?: string) => void; openTopic: (t: ViewTopic) => void;
}) {
  const { view, T, allowed } = useCat();
  const mine = (key: string) => topicsOf(view, key).filter((t) => inAllowed(allowed, t));
  const subjects = view.subjects.filter((s) => matches(s.name, q) && mine(s.key).length > 0).slice(0, 12);
  const topics = view.topics.filter((t) => inAllowed(allowed, t) && matches(t.t, q)).slice(0, 60);
  if (!subjects.length && !topics.length) return <p className="cb-empty">{T.empty}</p>;
  return (
    <>
      {subjects.length > 0 && (
        <section className="cb-section">
          <h2 className="cb-h2 plain">{T.subjectsH}</h2>
          <div className="cb-grid">
            {subjects.map((s) => (
              <SubjectCard big key={s.key} s={s} n={mine(s.key).length} onClick={() => openSubject(s.key, mine(s.key)[0]?.l)} />
            ))}
          </div>
        </section>
      )}
      {topics.length > 0 && (
        <section className="cb-section">
          <h2 className="cb-h2 plain">{T.topicsH}</h2>
          <ul className="cb-results">
            {topics.map((t) => {
              const s = view.subjects.find((x) => x.key === t.s)!;
              const lv = view.levels.find((l) => l.key === t.l)?.name ?? "";
              return (
                <li key={t.id}>
                  <button type="button" className="cb-result" onClick={() => openTopic(t)} style={{ ["--c" as string]: CAT_COLOR[s.cat] }}>
                    <img src={subjectIcon(s.key)} alt="" width={40} height={40} loading="lazy" />
                    <span className="cb-result-text">
                      <span className="cb-result-title">{t.t}</span>
                      <span className="cb-result-meta">{[s.name, lv, topicMeta(view, T, t)].filter(Boolean).join(" · ")}</span>
                    </span>
                    <Chevron />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}

/* ── Subject: its levels, ready sets, and units ──────────────────────── */

function SubjectView({ subject, level, setLevel, openTopic, onBack, onTopic }: {
  subject: ViewSubject; level: string; setLevel: (l: string) => void; openTopic: string;
  onBack: () => void; onTopic: (id: string) => void;
}) {
  const { view, T, allowed } = useCat();
  const levels = view.levels.map((l) => l.key).filter((l) => allowed.includes(l) && topicsOf(view, subject.key, l).length > 0);
  const lv = levels.includes(level) ? level : levels[0];
  const topics = topicsOf(view, subject.key, lv);
  // The hand-made English sets stay available to English (CAPS) schools as
  // ready-made sets under English (Gadi 2026-10-05, Greenwarth's move to CAPS).
  const readyAll = view.id === "il-he" || view.id === "il-ar"
    ? readySetsOf(subject.key, lv)
    : view.id === "za-caps" && subject.key === "english-home-language" && lv === "intermediate"
      ? WORD_SETS.filter((w) => w.lang === "en")
      : [];
  // The Ministry's English Band lists get their own block, by topic (Israeli
  // catalogs only); the Arabic catalog shows no Hebrew hand-made sets.
  const ready = view.id === "il-ar" ? [] : readyAll.filter((s) => !isBandSetId(s.id));
  const band = readyAll.filter((s) => isBandSetId(s.id));
  const cat = view.categories.find((c) => c.key === subject.cat);
  const [filter, setFilter] = useState("");
  const f = norm(filter);
  const shown = f ? topics.filter((t) => matches(t.t, f)) : topics;
  const lvName = view.levels.find((l) => l.key === lv)?.name ?? "";

  return (
    <div style={{ ["--c" as string]: CAT_COLOR[subject.cat] }}>
      <button type="button" className="cb-back" onClick={onBack}>
        <Chevron flip /> {T.back}
      </button>
      <div className="cb-hero">
        <span className="cb-hero-img">
          <img src={subjectIcon(subject.key)} alt="" width={120} height={120} />
        </span>
        <div>
          {cat && cat.name !== subject.name && <div className="cb-hero-cat">{cat.name}</div>}
          <h1 className="cb-h1 tight">{subject.name}</h1>
          <div className="cb-hero-meta">
            {count(T, topicsOf(view, subject.key).filter((t) => inAllowed(allowed, t)).length, "topics")}
            {subject.dati && T.datiLong ? <span className="cb-dati">{T.datiLong}</span> : null}
          </div>
        </div>
      </div>

      {levels.length > 1 && (
        <LevelTabs level={lv} setLevel={setLevel} counts={(l) => topicsOf(view, subject.key, l).length} kind="topics" only={levels} />
      )}

      {ready.length > 0 && (
        <section className="cb-section">
          <h2 className="cb-h2 plain">{T.readyH}</h2>
          <ul className="cb-topics">
            {ready.map((set) => (
              <ReadyRow key={set.id} set={set} open={openTopic === set.id} onToggle={() => onTopic(openTopic === set.id ? "" : set.id)} />
            ))}
          </ul>
        </section>
      )}

      {band.length > 0 && BAND_COPY[view.ui] && (
        <BandBlock sets={band} level={lv} openTopic={openTopic} onTopic={onTopic} />
      )}

      <section className="cb-section">
        <h2 className="cb-h2 plain">
          {T.topicsIn(lvName)}
          <span className="cb-h2-count">{topics.length}</span>
        </h2>
        {topics.length > 12 && (
          <div className="cb-search small">
            <SearchIcon />
            <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={T.topicSearch} aria-label={T.topicSearch} />
          </div>
        )}
        <ul className="cb-topics">
          {shown.map((t) => (
            <TopicRow key={t.id} t={t} open={openTopic === t.id} onToggle={() => onTopic(openTopic === t.id ? "" : t.id)} />
          ))}
        </ul>
      </section>
    </div>
  );
}

/** One-time choice of the curriculum and school type; later changes only via Gadi. */
function SchoolTypePicker({ T, uiLang, owner, onSet }: {
  T: T; uiLang: Ui; owner: boolean; onSet: (levels: string[], curriculum: Curriculum) => void;
}) {
  const { user } = useAuth();
  const [cur, setCur] = useState<string>(uiLang === "ar" ? "il-ar" : uiLang === "en" ? "za-caps" : "");
  // A type's name in the picker's language (South African types stay English).
  const typeName = (x: (typeof SCHOOL_TYPES)[number]) =>
    uiLang === "he" && x.curriculum !== "za-caps" ? x.he : uiLang === "ar" && x.ar ? x.ar : SCHOOL_TYPE_NAMES[uiLang]?.[x.key] ?? x.en;
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState(false);
  const pick = async (type: string) => {
    if (!user) return;
    setBusy(type);
    setErr(false);
    try {
      const tk = await user.getIdToken();
      const r = await fetch("/api/school/levels", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tk}` }, body: JSON.stringify({ type }) });
      const j = await r.json();
      if (!r.ok && !j.levels) throw new Error(j.error);
      onSet(j.levels, j.curriculum ?? cur);
    } catch {
      setErr(true);
    } finally {
      setBusy("");
    }
  };
  if (!owner) {
    return (
      <div className="cb-pick">
        <h1 className="cb-h1">{T.notOwnerH}</h1>
        <p className="cb-sub">{T.notOwnerP}</p>
      </div>
    );
  }
  return (
    <div className="cb-pick">
      <h1 className="cb-h1">{cur ? T.typeH : T.curH}</h1>
      <p className="cb-sub">
        {T.pick1}
        <br />
        {T.pick2}
      </p>
      <div className="cb-pick-grid">
        {!cur
          ? CURRICULA.map((c) => (
              <button key={c.key} type="button" className="cb-pick-btn" onClick={() => setCur(c.key)}>
                {T.curNames?.[c.key] ?? c[uiLang]}
              </button>
            ))
          : SCHOOL_TYPES.filter((x) => x.curriculum === cur).map((x) => (
              <button key={x.key} type="button" className="cb-pick-btn" disabled={!!busy} onClick={() => pick(x.key)}>
                {busy === x.key ? <span className="cb-spin" aria-hidden /> : null}
                {typeName(x)}
              </button>
            ))}
      </div>
      {cur && (
        <button type="button" className="cb-back" style={{ marginTop: 14 }} onClick={() => setCur("")}>
          <Chevron flip /> {T.curH}
        </button>
      )}
      {err && <p className="cb-note" style={{ marginTop: 14, justifyContent: "center" }}>{T.err}</p>}
    </div>
  );
}

function ReadyRow({ set, open, onToggle }: { set: WordSet; open: boolean; onToggle: () => void }) {
  const href = useHref();
  const { view } = useCat();
  return (
    <li className={"cb-topic" + (open ? " open" : "")}>
      <button type="button" className="cb-topic-head" onClick={onToggle} aria-expanded={open}>
        <span className="cb-topic-title">{set.title}</span>
        {set.grade && view.id === "il-he" && <span className="cb-grade">{set.grade.startsWith("כית") ? set.grade : view.gradeLabel(set.grade)}</span>}
        <Chevron down={open} />
      </button>
      {open && (
        <div className="cb-topic-body">
          <WordChips set={set} />
          <PresentButton href={href(`/word/${encodeURIComponent(set.words[0])}?present=1&set=${encodeURIComponent(set.id)}`)} n={set.words.length} setId={set.id} />
        </div>
      )}
    </li>
  );
}

/** The Ministry of Education's English Band lists (approved 2026-10-12): one
 *  row per topic, opening to the topic's sets, each with its words and
 *  "Present to class". Band I in elementary, Band II in middle school.
 *  Nothing is prepared up front: the projector makes each word's
 *  definition and picture on the first Present, like every other set. */
function BandBlock({ sets, level, openTopic, onTopic }: {
  sets: WordSet[]; level: string; openTopic: string; onTopic: (id: string) => void;
}) {
  const { view, T } = useCat();
  const copy = BAND_COPY[view.ui];
  const bandKey = level === "middle" ? "band2" : "band1";
  const groups: { key: string; topic: string; parts: { set: WordSet; band: BandSet }[] }[] = [];
  for (const set of sets) {
    const band = bandSetOf(set.id);
    if (!band) continue;
    const key = `moe-${band.band}-${band.topic.replace(/\s+/g, "-")}`;
    const g = groups.find((x) => x.key === key);
    if (g) g.parts.push({ set, band });
    else groups.push({ key, topic: band.topic, parts: [{ set, band }] });
  }
  return (
    <section className="cb-section">
      <h2 className="cb-h2 plain">{copy.teacher}</h2>
      <p className="cb-band-sub">
        {copy[bandKey]} · <bdi dir="ltr">{bandKey === "band1" ? "Band I" : "Band II"}</bdi>
      </p>
      <ul className="cb-topics">
        {groups.map((g) => (
          <BandTopicRow key={g.key} name={bandSetTitle({ ...g.parts[0].band, part: 0 }, view.ui)} icon={BAND_TOPIC_ICON[g.topic] ?? "📘"}
            n={g.parts.reduce((a, p) => a + p.set.words.length, 0)} parts={g.parts} T={T} ui={view.ui}
            open={openTopic === g.key} onToggle={() => onTopic(openTopic === g.key ? "" : g.key)} />
        ))}
      </ul>
    </section>
  );
}

function BandTopicRow({ name, icon, n, parts, T, ui, open, onToggle }: {
  name: string; icon: string; n: number; parts: { set: WordSet; band: BandSet }[]; T: T; ui: string; open: boolean; onToggle: () => void;
}) {
  const href = useHref();
  // Back from the projector the topic is already open: bring it into view.
  const li = useRef<HTMLLIElement>(null);
  const openAtMount = useRef(open);
  useEffect(() => {
    if (openAtMount.current) li.current?.scrollIntoView({ block: "center" });
  }, []);
  return (
    <li ref={li} className={"cb-topic" + (open ? " open" : "")}>
      <button type="button" className="cb-topic-head" onClick={onToggle} aria-expanded={open}>
        <span className="cb-band-ico" aria-hidden>{icon}</span>
        <span className="cb-topic-title">{name}</span>
        <span className="cb-grade">{count(T, n, "words")}</span>
        <Chevron down={open} />
      </button>
      {open && (
        <div className="cb-topic-body">
          {parts.map(({ set, band }) => (
            <div key={set.id} className="cb-band-part">
              {parts.length > 1 && <div className="cb-band-part-title">{bandSetName(band, ui)}</div>}
              <WordChips set={set} />
              <PresentButton href={href(`/word/${encodeURIComponent(set.words[0])}?present=1&set=${encodeURIComponent(set.id)}`)} n={set.words.length} setId={set.id} />
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

function TopicRow({ t, open, onToggle }: { t: ViewTopic; open: boolean; onToggle: () => void }) {
  const href = useHref();
  const { user } = useAuth();
  const { view, T } = useCat();
  const [set, setSet] = useState<WordSet | undefined>(() => getWordSet(t.id));
  const [failed, setFailed] = useState(false);
  // Back from the projector the unit is already open: bring it into view.
  const li = useRef<HTMLLIElement>(null);
  const openAtMount = useRef(open);
  useEffect(() => {
    if (openAtMount.current) li.current?.scrollIntoView({ block: "center" });
  }, []);

  useEffect(() => {
    if (!open || set || !user) return;
    let alive = true;
    user.getIdToken()
      .then((tk) => fetch(`/api/curriculum-set?id=${encodeURIComponent(t.id)}`, { headers: { Authorization: `Bearer ${tk}` } }))
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: { set: WordSet; defs: Record<string, string> } & SetExtras) => {
        if (!alive) return;
        registerWordSet(d.set, d.defs, { items: d.items, visuals: d.visuals, locked: d.locked });
        setSet(d.set);
      })
      .catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, [open, set, t.id, user]);

  const meta = topicMeta(view, T, t);
  return (
    <li ref={li} className={"cb-topic" + (open ? " open" : "")}>
      <button type="button" className="cb-topic-head" onClick={onToggle} aria-expanded={open}>
        <span className="cb-topic-title">{t.t}</span>
        {meta && <span className="cb-grade">{meta}</span>}
        <Chevron down={open} />
      </button>
      {open && (
        <div className="cb-topic-body">
          {set ? (
            <>
              <WordChips set={set} />
              <PresentButton href={href(`/word/${encodeURIComponent(set.words[0])}?present=1&set=${encodeURIComponent(set.id)}`)} n={set.words.length} setId={set.id} />
            </>
          ) : failed ? (
            <p className="cb-note">{T.fail}</p>
          ) : (
            <p className="cb-note"><span className="cb-spin" aria-hidden /> {T.loading}</p>
          )}
        </div>
      )}
    </li>
  );
}

function WordChips({ set }: { set: WordSet }) {
  const href = useHref();
  const items = setItems(set.id);
  return (
    <div className="cb-chips" dir={set.lang === "he" || set.lang === "ar" || set.lang === "fa" ? "rtl" : "ltr"}>
      {items
        ? items.map((it) => (
            // A unit that lists meanings: one chip per meaning (Gemara phase A).
            <Link key={it.m} href={href(`/word/${encodeURIComponent(it.w)}?present=1&set=${encodeURIComponent(set.id)}&m=${encodeURIComponent(it.m)}`)} className="cb-chip" onClick={() => rememberReturn(set.id)}>
              {it.w}
            </Link>
          ))
        : set.words.map((w) => (
        <Link key={w} href={href(`/word/${encodeURIComponent(w)}?present=1&set=${encodeURIComponent(set.id)}`)} className="cb-chip" onClick={() => rememberReturn(set.id)}>
          {w}
        </Link>
      ))}
    </div>
  );
}

/** Where the projector's close button returns: this page, with the unit open
 *  (Gadi 2026-10-04). Read by the word page in present mode. */
export const SETS_RETURN_KEY = "gadit-sets-return";
function rememberReturn(setId: string) {
  try {
    sessionStorage.setItem(SETS_RETURN_KEY, JSON.stringify({ setId, url: window.location.pathname + window.location.search }));
  } catch { /* storage blocked */ }
}

function PresentButton({ href, n, setId }: { href: string; n: number; setId: string }) {
  const { T } = useCat();
  return (
    <Link href={href} className="cb-present" onClick={() => rememberReturn(setId)}>
      <ScreenIcon /> {T.present} <span>· {count(T, n, "words")}</span>
    </Link>
  );
}

/* ── Icons (inline, no icon font) ─────────────────────────────────────── */

function AllIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.6" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function Chevron({ flip, down }: { flip?: boolean; down?: boolean }) {
  // "Forward" points left in RTL and right in LTR; flip = back.
  const ltr = useContext(CatCtx)?.view.dir === "ltr";
  const rot = down ? -90 : (!!flip !== ltr) ? 180 : 0;
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: `rotate(${rot}deg)`, transition: "transform .2s", flexShrink: 0 }}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
function ScreenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" />
    </svg>
  );
}

const CSS = `
.cb{min-height:100dvh;background:var(--paper);color:var(--ink)}
.cb-top{padding:18px 24px;border-bottom:1px solid var(--rule);background:var(--surface)}
.cb-wordmark{font-weight:800;font-size:20px;color:var(--ink);text-decoration:none;letter-spacing:-.02em}
.cb-wordmark span{font-style:italic;color:#0EA5A5}
.cb-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.cb-switch{display:inline-flex;gap:4px;background:var(--paper-deep);padding:4px;border-radius:999px}
.cb-switch button{border:none;background:transparent;font:inherit;font-size:13.5px;font-weight:700;color:var(--ink-soft);padding:6px 12px;border-radius:999px;cursor:pointer}
.cb-switch button.on{background:var(--surface);color:var(--ink);box-shadow:0 1px 3px rgba(11,18,32,.1)}
.cb-main{max-width:1120px;margin:0 auto;padding:28px 20px 72px}
.cb-h1{font-size:clamp(24px,3.4vw,32px);font-weight:800;margin:0 0 8px;letter-spacing:-.01em;text-wrap:balance}
.cb-h1.tight{margin:2px 0 4px}
.cb-sub{color:var(--ink-muted);font-size:16px;line-height:1.6;margin:0 0 22px}
.cb-search{display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--rule);border-radius:14px;padding:0 14px;margin-bottom:22px;color:var(--ink-faint);box-shadow:0 1px 2px rgba(11,18,32,.04)}
.cb-search:focus-within{border-color:#0EA5A5;box-shadow:0 0 0 3px rgba(14,165,165,.15)}
.cb-search input{flex:1;min-width:0;border:none;outline:none;background:transparent;font:inherit;font-size:16px;color:var(--ink);padding:14px 0}
.cb-search.small{max-width:420px;margin-bottom:14px}
.cb-search.small input{padding:10px 0;font-size:15px}
.cb-levels{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;background:var(--paper-deep);padding:5px;border-radius:16px;margin-bottom:18px}
.cb-level-pill{position:absolute;top:5px;bottom:5px;inset-inline-start:5px;background:var(--surface);border-radius:12px;box-shadow:0 2px 6px rgba(11,18,32,.12);transition:transform .32s cubic-bezier(.3,.9,.3,1);pointer-events:none}
.cb-level{position:relative;z-index:1;border:1px solid #CBD8D2;background:rgba(255,255,255,.35);border-radius:12px;padding:10px 6px;font:inherit;font-weight:700;font-size:16px;color:var(--ink-soft);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;transition:background .15s,color .15s,border-color .15s}
.cb-level b{font-weight:700}
.cb-level .short{display:none}
.cb-level span{font-size:12.5px;font-weight:600;color:var(--ink-faint)}
.cb-level:hover{color:var(--ink);border-color:#0EA5A5;background:rgba(255,255,255,.6)}
.cb-level.on{background:transparent;border-color:transparent;color:var(--ink)}
.cb-level.on span{color:#0E8A8A}
.cb-cats{display:flex;flex-wrap:wrap;gap:8px;padding:2px 0 10px;margin-bottom:12px}
.cb-cat-chip{flex-shrink:0;display:inline-flex;align-items:center;gap:7px;padding:6px 12px 6px 10px;border-radius:999px;background:var(--surface);border:1px solid var(--rule);color:var(--ink-soft);font:inherit;font-weight:600;font-size:14px;text-decoration:none;white-space:nowrap;cursor:pointer;transition:background .15s,border-color .15s,color .15s}
.cb-cat-chip:hover{border-color:var(--c);color:var(--c)}
.cb-cat-chip.on{background:color-mix(in srgb,var(--c) 10%,#fff);border-color:var(--c);color:var(--c);font-weight:700}
.cb-board.solo{columns:auto}
.cb-board.solo .cb-tiles{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}
.cb-cat-chip img{border-radius:6px}
.cb-section{margin-bottom:34px;scroll-margin-top:16px}
.cb-h2{display:flex;align-items:center;gap:10px;font-size:20px;font-weight:800;margin:0 0 14px;color:var(--c,var(--ink))}
.cb-h2.plain{color:var(--ink);font-size:18px}
.cb-h2 img{border-radius:9px}
.cb-h2-count{font-size:13px;font-weight:700;color:var(--ink-faint);background:var(--surface);border:1px solid var(--rule);border-radius:999px;padding:1px 9px}
.cb-board{columns:3 320px;column-gap:14px}
.cb-panel{break-inside:avoid;margin-bottom:14px;background:var(--surface);border:1px solid var(--rule);border-radius:20px;padding:14px 12px 8px;scroll-margin-top:16px}
.cb-panel .cb-h2{font-size:17px;margin:0 2px 6px}
.cb-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:2px}
.cb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:12px}
.cb-card{display:flex;flex-direction:column;align-items:center;text-align:center;gap:5px;padding:10px 4px 9px;background:transparent;border:1px solid transparent;border-radius:16px;cursor:pointer;font:inherit;color:var(--ink);transition:background .15s}
.cb-card:hover{background:color-mix(in srgb,var(--c) 7%,#fff)}
.cb-card:hover .cb-card-img{transform:translateY(-2px)}
.cb-card.big{background:var(--surface);border-color:var(--rule);padding:14px 8px 12px}
.cb-card-img{width:72px;height:72px;border-radius:18px;overflow:hidden;background:color-mix(in srgb,var(--c) 8%,#FBFAF7);transition:transform .15s}
.cb-card-img img{width:100%;height:100%;object-fit:cover;display:block}
.cb-card-name{font-weight:700;font-size:14.5px;line-height:1.3;text-wrap:balance}
.cb-card-meta{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:4px 6px;white-space:nowrap;font-size:12.5px;font-weight:600;color:var(--ink-faint)}
.cb-dati{font-size:11.5px;font-weight:700;color:#8A4B2F;background:#FBEFE7;border-radius:6px;padding:1px 6px}
.cb-empty{color:var(--ink-muted);font-size:16px;padding:20px 0}
.cb-results{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.cb-result{width:100%;display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--surface);border:1px solid var(--rule);border-radius:14px;cursor:pointer;font:inherit;color:var(--ink);text-align:start}
.cb-result:hover{border-color:var(--c)}
.cb-result img{border-radius:10px;flex-shrink:0}
.cb-result-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.cb-result-title{font-weight:700;font-size:15.5px}
.cb-result-meta{font-size:13px;color:var(--ink-muted)}
.cb-back{display:inline-flex;align-items:center;gap:4px;border:none;background:none;font:inherit;font-weight:700;font-size:15px;color:var(--ink-muted);cursor:pointer;padding:4px 0;margin-bottom:12px}
.cb-back:hover{color:var(--ink)}
.cb-hero{display:flex;align-items:center;gap:18px;margin-bottom:22px}
.cb-hero-img{width:120px;height:120px;flex-shrink:0;border-radius:28px;overflow:hidden;background:color-mix(in srgb,var(--c) 8%,#FBFAF7);box-shadow:0 6px 18px rgba(11,18,32,.08)}
.cb-hero-img img{width:100%;height:100%;object-fit:cover;display:block}
.cb-hero-cat{font-size:14px;font-weight:700;color:var(--c)}
.cb-hero-meta{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--ink-muted);font-weight:600}
.cb-ready{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
.cb-ready-card{display:flex;flex-direction:column;gap:12px;background:var(--surface);border:1px solid var(--rule);border-top:3px solid var(--c);border-radius:16px;padding:14px}
.cb-ready-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.cb-ready-title{font-weight:700;font-size:16px}
.cb-grade{flex-shrink:0;font-size:12.5px;font-weight:700;color:var(--ink-faint);background:var(--paper);border-radius:7px;padding:2px 8px}
.cb-topics{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.cb-topic{background:var(--surface);border:1px solid var(--rule);border-radius:14px;overflow:hidden;transition:border-color .15s}
.cb-topic.open{border-color:color-mix(in srgb,var(--c) 45%,var(--rule))}
.cb-topic-head{width:100%;display:flex;align-items:center;gap:10px;padding:13px 14px;border:none;background:none;font:inherit;color:var(--ink);cursor:pointer;text-align:start}
.cb-topic-head:hover .cb-topic-title{color:var(--c)}
.cb-topic-title{flex:1;min-width:0;font-weight:700;font-size:15.5px;line-height:1.4}
.cb-topic-body{padding:0 14px 14px;display:flex;flex-direction:column;gap:12px}
.cb-band-sub{margin:-8px 0 12px;font-size:14px;font-weight:600;color:var(--ink-muted)}
.cb-band-ico{width:32px;height:32px;flex-shrink:0;display:grid;place-items:center;font-size:17px;border-radius:10px;background:color-mix(in srgb,var(--c) 9%,#fff)}
.cb-band-part{display:flex;flex-direction:column;gap:10px}
.cb-band-part+.cb-band-part{border-top:1px solid var(--rule);padding-top:12px}
.cb-band-part-title{font-weight:700;font-size:14.5px;color:var(--ink-soft)}
.cb-chips{display:flex;flex-wrap:wrap;gap:6px}
.cb-chip{font-size:14px;font-weight:600;color:var(--c);background:color-mix(in srgb,var(--c) 7%,#fff);border:1px solid color-mix(in srgb,var(--c) 18%,#fff);border-radius:9px;padding:5px 10px;text-decoration:none}
.cb-chip:hover{background:color-mix(in srgb,var(--c) 13%,#fff)}
.cb-present{align-self:flex-start;display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;background:var(--c);color:#fff;font-weight:800;font-size:15px;text-decoration:none}
.cb-present span{font-size:12.5px;font-weight:600;opacity:.85}
.cb-present:hover{filter:brightness(1.07)}
.cb-ready-card .cb-present{margin-top:auto;align-self:stretch;justify-content:center}
.cb-pick{max-width:640px;margin:24px auto 0;text-align:center}
.cb-pick .cb-sub{margin-inline:auto}
.cb-pick-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-top:8px;--c:#0E8A8A}
.cb-pick-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:16px 14px;border-radius:14px;border:1px solid var(--rule);background:var(--surface);font:inherit;font-weight:700;font-size:16px;color:var(--ink);cursor:pointer;transition:border-color .15s,background .15s}
.cb-pick-btn:hover{border-color:#0EA5A5;background:color-mix(in srgb,#0EA5A5 6%,#fff)}
.cb-pick-btn:disabled{opacity:.6;cursor:default}
.cb-note{display:flex;align-items:center;gap:10px;margin:0;color:var(--ink-muted);font-size:14.5px}
.cb-spin{width:16px;height:16px;border-radius:50%;border:2px solid color-mix(in srgb,var(--c) 25%,#fff);border-top-color:var(--c);animation:cbspin .8s linear infinite}
@keyframes cbspin{to{transform:rotate(360deg)}}
@media (max-width:560px){
  .cb-main{padding:20px 16px 60px}
  .cb-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .cb-tiles{grid-template-columns:repeat(3,minmax(0,1fr))}
  .cb-card-img{width:64px;height:64px}
  .cb-cats{flex-wrap:nowrap;overflow-x:auto;margin-inline:-16px;padding-inline:16px}
  .cb-level{font-size:14px;padding:9px 2px}
  .cb-level .full{display:none}
  .cb-level .short{display:inline}
  .cb-level span{font-size:11px}
  .cb-hero-img{width:88px;height:88px;border-radius:22px}
}
@media (prefers-reduced-motion:reduce){.cb-level-pill,.cb-card,.cb-spin{transition:none;animation:none}}
`;

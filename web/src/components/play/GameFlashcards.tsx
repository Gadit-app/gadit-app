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
 *
 * Where the words come from is always on screen (Gadi 2026-10-09: "לפי מה
 * בחרת את המילים"). Word cards open on a picker, the same choices as the
 * dictation trainer (/spell): the notebook, the sets saved there, a built-in
 * topic (colors, animals, family...), a topic of your own, or a pasted list
 * from school. Topic and list pairs come from /api/spell-set (topics cached
 * per language); a set you made is saved with your dictation sets, so the
 * school list is there next time in both games.
 */

import { WaitText } from "@/components/WaitText";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { PlayWord } from "@/lib/play-engine";
import { shuffle, SESSION_SIZE } from "@/lib/play-engine";
import { GameResult } from "./GameResult";
import { TTSButton } from "@/components/design/TTSButton";
import { wordLangOf } from "@/lib/play-engine";
import { reportAnswer } from "@/lib/learn/report";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { useNiqqud } from "@/lib/niqqud-display";
import { useAuth } from "@/lib/auth-context";
import { DICTATION_SETS, getCatTitle, type DictationSet, type WordPair } from "@/lib/dictation-sets";
import { FLASH_MORE, DIR_MORE, PICK_MORE } from "./play-games-i18n";
import { SPELL_T_EXTRA } from "@/lib/spell-i18n";
import { QText } from "./QText";
import { ocrForm } from "@/lib/ocr-upload";

export type FlashMode = "words" | "meanings";

/** Picture on the card or not (Gadi 2026-10-17, asked by two families): a child
 *  who wants to work the word out alone hides it. [shown, hidden], remembered. */
const PIC_TOGGLE: Record<string, [string, string]> = {
  en: ["Picture: on", "Picture: off"],
  he: ["עם תמונה", "בלי תמונה"],
  ar: ["مع صورة", "بدون صورة"],
  ru: ["С картинкой", "Без картинки"],
  es: ["Con imagen", "Sin imagen"],
  pt: ["Com imagem", "Sem imagem"],
  fr: ["Avec image", "Sans image"],
  de: ["Mit Bild", "Ohne Bild"],
  cs: ["S obrázkem", "Bez obrázku"],
  sk: ["S obrázkom", "Bez obrázka"],
  it: ["Con immagine", "Senza immagine"],
  ja: ["絵あり", "絵なし"],
  hi: ["चित्र के साथ", "बिना चित्र"],
  am: ["ከስዕል ጋር", "ያለ ስዕል"],
  uk: ["З малюнком", "Без малюнка"],
  tr: ["Resimli", "Resimsiz"],
  pl: ["Z obrazkiem", "Bez obrazka"],
  fa: ["با تصویر", "بدون تصویر"],
  id: ["Dengan gambar", "Tanpa gambar"],
  nl: ["Met plaatje", "Zonder plaatje"],
  el: ["Με εικόνα", "Χωρίς εικόνα"],
  zu: ["Nesithombe", "Ngaphandle kwesithombe"],
  xh: ["Nomfanekiso", "Ngaphandle komfanekiso"],
  nso: ["Le seswantšho", "Ntle le seswantšho"],
  tn: ["Le setshwantsho", "Kwantle ga setshwantsho"],
  st: ["Le setshwantsho", "Ntle le setshwantsho"],
  ts: ["Na xifaniso", "Handle ka xifaniso"],
  ss: ["Nesitfombe", "Ngaphandle kwesitfombe"],
  ve: ["Na tshifanyiso", "Hu si na tshifanyiso"],
  nr: ["Nesithombe", "Ngaphandle kwesithombe"],
  vi: ["Có hình", "Không hình"],
  fil: ["May larawan", "Walang larawan"],
  af: ["Met prent", "Sonder prent"],
  sw: ["Na picha", "Bila picha"],
  "zh-CN": ["有图片", "无图片"],
  "zh-TW": ["有圖片", "無圖片"],
  ko: ["그림 있음", "그림 없음"],
  th: ["มีรูปภาพ", "ไม่มีรูปภาพ"],
  bn: ["ছবিসহ", "ছবি ছাড়া"],
  da: ["Med billede", "Uden billede"],
  hu: ["Képpel", "Kép nélkül"],
};

type FlashCopy = {
  wordsTitle: string; wordsDesc: string; defsTitle: string; defsDesc: string;
  tapToFlip: string; tapBack: string; sayIn: (l: string) => string; knew: string; notYet: string; again: string;
  swap: string; loading: string; none: string; result: (k: number, n: number) => string;
  pick: string; mine: string; mineCount: (n: number) => string; topics: string; srcMine: string; srcTopic: (t: string) => string;
};

/** Definition cards go both ways (Gadi 2026-10-09): see the word and say
 *  the definition, or see the definition and say the word. "Mixed" (the
 *  default) picks a direction per card, like the definitions quiz. */
type DefDir = "mix" | "word" | "meaning";
type DirCopy = { mix: string; word: string; meaning: string; askMeaning: string; askWord: string };
const DIR_COPY: Record<string, DirCopy> = {
  he: { mix: "מעורב", word: "מילה ← הגדרה", meaning: "הגדרה ← מילה", askMeaning: "מה המילה אומרת?", askWord: "איזו מילה מתאימה להגדרה?" },
  en: { mix: "Mixed", word: "Word → meaning", meaning: "Meaning → word", askMeaning: "What does the word mean?", askWord: "Which word fits this meaning?" },
  ar: { mix: "مختلط", word: "كلمة ← معنى", meaning: "معنى ← كلمة", askMeaning: "ماذا تعني الكلمة؟", askWord: "أي كلمة تناسب هذا المعنى؟" },
  ru: { mix: "Вперемешку", word: "Слово → значение", meaning: "Значение → слово", askMeaning: "Что значит это слово?", askWord: "Какое слово подходит к значению?" },
  es: { mix: "Mezclado", word: "Palabra → significado", meaning: "Significado → palabra", askMeaning: "¿Qué significa la palabra?", askWord: "¿Qué palabra encaja con el significado?" },
};

export const FLASH_COPY: Record<string, FlashCopy> = {
  he: { wordsTitle: "כרטיסיות מילים", wordsDesc: "רואים מילה, אומרים אותה בשפה השנייה, והופכים את הכרטיס לבדוק.", defsTitle: "כרטיסיות הגדרות", defsDesc: "רואים מילה, נזכרים מה היא אומרת, והופכים את הכרטיס לבדוק.", tapToFlip: "לחצו על הכרטיס כדי להפוך אותו", tapBack: "לחצו כדי לחזור למילה", sayIn: (l) => `איך אומרים את זה ב${l}?`, knew: "ידעתי", notYet: "עוד לא", again: "שוב", swap: "להחליף כיוון", loading: "מכינים את הכרטיסים...", none: "עוד אין מילים לכרטיסים. חפשו מילה באנגלית או בעברית, והיא תופיע כאן.", result: (k, n) => `ידעתם ${k} מתוך ${n} כבר בפעם הראשונה`, pick: "מאיפה המילים?", mine: "המילים שלכם מהמחברת", mineCount: (n) => (n === 1 ? "מילה אחת" : `${n} מילים, בסדר אקראי`), topics: "או בחרו נושא", srcMine: "מילים מהמחברת שלכם, בסדר אקראי", srcTopic: (t) => `נושא: ${t}` },
  en: { wordsTitle: "Word cards", wordsDesc: "See a word, say it in the other language, then flip the card to check.", defsTitle: "Definition cards", defsDesc: "See a word, recall what it means, then flip the card to check.", tapToFlip: "Tap the card to flip it", tapBack: "Tap to go back to the word", sayIn: (l) => `How do you say it in ${l}?`, knew: "I knew it", notYet: "Not yet", again: "Again", swap: "Swap direction", loading: "Getting your cards ready...", none: "No words for cards yet. Look up a word in another language and it will show up here.", result: (k, n) => `You knew ${k} of ${n} the first time`, pick: "Where should the words come from?", mine: "Your notebook words", mineCount: (n) => `${n} words, in random order`, topics: "Or pick a topic", srcMine: "Words from your notebook, in random order", srcTopic: (t) => `Topic: ${t}` },
  ar: { wordsTitle: "بطاقات الكلمات", wordsDesc: "ترى كلمة، تقولها باللغة الأخرى، ثم تقلب البطاقة لتتحقق.", defsTitle: "بطاقات التعريفات", defsDesc: "ترى كلمة، تتذكّر معناها، ثم تقلب البطاقة لتتحقق.", tapToFlip: "اضغط على البطاقة لقلبها", tapBack: "اضغط للعودة إلى الكلمة", sayIn: (l) => `كيف تقولها بـ${l}؟`, knew: "عرفتها", notYet: "ليس بعد", again: "مرة أخرى", swap: "عكس الاتجاه", loading: "نجهّز البطاقات...", none: "لا توجد كلمات للبطاقات بعد. ابحث عن كلمة بلغة أخرى وستظهر هنا.", result: (k, n) => `عرفت ${k} من ${n} من المرة الأولى`, pick: "من أين الكلمات؟", mine: "كلماتك من الدفتر", mineCount: (n) => `${n} كلمة، بترتيب عشوائي`, topics: "أو اختر موضوعًا", srcMine: "كلمات من دفترك، بترتيب عشوائي", srcTopic: (t) => `الموضوع: ${t}` },
  ru: { wordsTitle: "Карточки слов", wordsDesc: "Видите слово, говорите его на другом языке и переворачиваете карточку.", defsTitle: "Карточки значений", defsDesc: "Видите слово, вспоминаете значение и переворачиваете карточку.", tapToFlip: "Нажмите на карточку, чтобы перевернуть", tapBack: "Нажмите, чтобы вернуться к слову", sayIn: (l) => `Как это сказать (${l})?`, knew: "Знал(а)", notYet: "Ещё нет", again: "Ещё раз", swap: "Поменять направление", loading: "Готовим карточки...", none: "Пока нет слов для карточек. Найдите слово на другом языке, и оно появится здесь.", result: (k, n) => `Вы знали ${k} из ${n} с первого раза`, pick: "Откуда взять слова?", mine: "Слова из вашей тетради", mineCount: (n) => `${n} слов, в случайном порядке`, topics: "Или выберите тему", srcMine: "Слова из вашей тетради, в случайном порядке", srcTopic: (t) => `Тема: ${t}` },
  es: { wordsTitle: "Tarjetas de palabras", wordsDesc: "Ves una palabra, la dices en el otro idioma y das la vuelta para comprobar.", defsTitle: "Tarjetas de definiciones", defsDesc: "Ves una palabra, recuerdas su significado y das la vuelta para comprobar.", tapToFlip: "Toca la tarjeta para darle la vuelta", tapBack: "Toca para volver a la palabra", sayIn: (l) => `¿Cómo se dice en ${l}?`, knew: "La sabía", notYet: "Todavía no", again: "Otra vez", swap: "Cambiar dirección", loading: "Preparando tus tarjetas...", none: "Aún no hay palabras para tarjetas. Busca una palabra en otro idioma y aparecerá aquí.", result: (k, n) => `Sabías ${k} de ${n} a la primera`, pick: "¿De dónde salen las palabras?", mine: "Las palabras de tu cuaderno", mineCount: (n) => `${n} palabras, en orden aleatorio`, topics: "O elige un tema", srcMine: "Palabras de tu cuaderno, en orden aleatorio", srcTopic: (t) => `Tema: ${t}` },
};

// The other 28 UI languages (2026-10-10).
Object.assign(FLASH_COPY, FLASH_MORE);
Object.assign(DIR_COPY, DIR_MORE);

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

type PairInfo = { pair: string; pairLang: string; wordLang?: string };
type Card = { key: string; word: PlayWord; pair?: PairInfo; repeat: boolean; alt?: boolean };

/** A word set picked on the start screen: the native-language word (the
 *  "he" slot, see WordPair) and its English. `save` = keep it with the
 *  user's dictation sets at the end (sets they made or reopened). */
type Picked = { id: string; title: string; icon: string; words: WordPair[]; save: boolean };
type SavedSet = { setId: string; title: string; icon: string };

const NL = String.fromCharCode(10);

type PickCopy = {
  mySets: string; ownTopic: string; ownTopicPh: string; make: string;
  pasteTitle: string; pasteSub: string; pastePh: string; pasteBtn: string;
  creating: string; unsafe: string; createErr: string;
};
const PICK_COPY: Record<string, PickCopy> = {
  he: { mySets: "הסטים ששמרתם", ownTopic: "נושא משלכם", ownTopicPh: "למשל: חלל, דינוזאורים, ים", make: "יצירה", pasteTitle: "רשימה מבית הספר", pasteSub: "הדביקו את המילים שקיבלתם, מילה בכל שורה. אפשר גם מילה ותרגום.", pastePh: ["צהוב", "כלב", "מורה"].join(NL), pasteBtn: "יצירת כרטיסיות", creating: "יוצרים...", unsafe: "בואו נבחר נושא אחר.", createErr: "לא הצלחנו ליצור את זה. נסו שוב או נושא אחר." },
  en: { mySets: "Your saved sets", ownTopic: "Your own topic", ownTopicPh: "e.g. space, dinosaurs, the sea", make: "Create", pasteTitle: "A list from school", pasteSub: "Paste the words you got, one per line. A word and its translation works too.", pastePh: ["yellow", "dog", "teacher"].join(NL), pasteBtn: "Make cards", creating: "Creating...", unsafe: "Let's pick a different topic.", createErr: "We couldn't create that. Try again or another topic." },
  ar: { mySets: "مجموعاتك المحفوظة", ownTopic: "موضوع من اختيارك", ownTopicPh: "مثلًا: الفضاء، الديناصورات، البحر", make: "إنشاء", pasteTitle: "قائمة من المدرسة", pasteSub: "الصق الكلمات التي حصلت عليها، كلمة في كل سطر. يمكن أيضًا كلمة وترجمتها.", pastePh: ["أصفر", "كلب", "معلم"].join(NL), pasteBtn: "إنشاء البطاقات", creating: "جارٍ الإنشاء...", unsafe: "لنختر موضوعًا آخر.", createErr: "لم نتمكن من إنشاء ذلك. حاول مرة أخرى أو اختر موضوعًا آخر." },
  ru: { mySets: "Ваши сохранённые наборы", ownTopic: "Своя тема", ownTopicPh: "например: космос, динозавры, море", make: "Создать", pasteTitle: "Список из школы", pasteSub: "Вставьте слова, по одному в строке. Можно слово и перевод.", pastePh: ["жёлтый", "собака", "учитель"].join(NL), pasteBtn: "Создать карточки", creating: "Создаём...", unsafe: "Давайте выберем другую тему.", createErr: "Не получилось. Попробуйте ещё раз или другую тему." },
  es: { mySets: "Tus conjuntos guardados", ownTopic: "Tu propio tema", ownTopicPh: "p. ej.: espacio, dinosaurios, el mar", make: "Crear", pasteTitle: "Una lista de la escuela", pasteSub: "Pega las palabras que te dieron, una por línea. También palabra y traducción.", pastePh: ["amarillo", "perro", "maestro"].join(NL), pasteBtn: "Crear tarjetas", creating: "Creando...", unsafe: "Elijamos otro tema.", createErr: "No pudimos crearlo. Inténtalo de nuevo u otro tema." },
};

Object.assign(PICK_COPY, PICK_MORE);

/** Topics, own topics and pasted lists pair a word with its English, so
 *  they are offered whenever the UI language isn't English itself. */
/** "Photo from the workbook" on the school list, the same words as /spell. */
const PHOTO_INLINE: Record<string, Record<"photoBtn" | "photoReading" | "photoFail", string>> = {
  en: { photoBtn: "Photo from the workbook", photoReading: "Reading the page…", photoFail: "We couldn't read the photo. Try a sharper one, or type the words." },
  he: { photoBtn: "צילום מהחוברת", photoReading: "קוראים את הדף…", photoFail: "לא הצלחנו לקרוא את התמונה. נסו צילום חד יותר, או הקלידו את המילים." },
};
const photoT = (k: "photoBtn" | "photoReading" | "photoFail", lang: string) =>
  PHOTO_INLINE[lang]?.[k] ?? SPELL_T_EXTRA[lang]?.[k] ?? PHOTO_INLINE.en[k];

const codeLabel = (code: string, ui: string) => {
  try { return new Intl.DisplayNames([ui], { type: "language" }).of(code) ?? code; } catch { return code; }
};

/** Stable id for a set someone made, the same as /spell's, so one school
 *  list is one saved set in both games. */
function hashWords(words: WordPair[]): string {
  const s = words.map((w) => w.en.toLowerCase()).join("|");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return "custom_" + h.toString(36);
}

export function GameFlashcards({
  pool,
  onExit,
  lang,
  t,
  focusWord,
  mode = "words",
  skipPicker = false,
  preReader = false,
  wordFlag,
}: {
  pool: PlayWord[];
  onExit: () => void;
  lang: string;
  t: PlayT;
  focusWord?: string;
  mode?: FlashMode;
  /** Learning mode: play the given words straight away (no source picker). */
  skipPicker?: boolean;
  /** A lesson for a child who doesn't read the language yet (2026-10-22):
   *  the front is the picture and the sound, not the written word (a word
   *  with no picture yet still shows the word). Always word first. */
  preReader?: boolean;
  /** Something to show under a flipped card for its word, e.g. "wrong
   *  translation?" on a Hebrew-as-a-second-language lesson. */
  wordFlag?: (word: PlayWord) => ReactNode;
}) {
  const f = flashCopy(lang);
  const title = mode === "words" ? f.wordsTitle : f.defsTitle;
  const { nq } = useNiqqud(); // display-only vowel points
  const { user } = useAuth();
  // Freeze the words at mount: the page tops the pool up with examples a
  // moment later, and that must not reshuffle a deck mid-game.
  const [startPool] = useState(pool);
  const pc = PICK_COPY[lang] ?? PICK_COPY.en;
  // Text fields follow the UI direction, so in Hebrew the examples and the
  // typing start on the right (Gadi 2026-10-09), whatever gets pasted.
  const fieldDir = ["he", "ar", "fa"].includes(lang) ? "rtl" : "ltr";
  // Where the words come from: the notebook, or a set picked on the start screen.
  const offerPick = mode === "words" && !focusWord && !skipPicker;
  const offerSets = offerPick && lang !== "en";
  const [source, setSource] = useState<"mine" | Picked | null>(offerPick ? null : "mine");
  const picked = source && source !== "mine" ? source : null;
  const [saved, setSaved] = useState<SavedSet[]>([]);
  const [ownTopic, setOwnTopic] = useState("");
  const [listText, setListText] = useState("");
  const [busy, setBusy] = useState("");
  const [pickErr, setPickErr] = useState("");
  const mineTotal = useMemo(() => new Set(startPool.filter((w) => w.meaning).map((w) => w.word.trim().toLowerCase())).size, [startPool]);

  // The sets saved with the dictation trainer (and by this game).
  useEffect(() => {
    if (!offerPick || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dictation-sets", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        const data = res.ok ? ((await res.json()) as { sets?: SavedSet[] }) : {};
        if (!cancelled && Array.isArray(data.sets)) setSaved(data.sets.filter((s) => s.setId).slice(0, 8));
      } catch { /* the picker works without them */ }
    })();
    return () => { cancelled = true; };
  }, [offerPick, user]);

  // Ask /api/spell-set for pairs: a topic (cached per language) or a list.
  async function makeSet(body: { topic?: string; list?: string; fromPhoto?: boolean }, key: string, icon: string, fallbackTitle: string, save: boolean, keepId?: string) {
    if (!user || busy) return;
    setBusy(key);
    setPickErr("");
    try {
      const res = await fetch("/api/spell-set", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ ...body, uiLang: lang, nativeLang: lang }),
      });
      const data = (await res.json().catch(() => ({}))) as { safe?: boolean; title?: string; words?: WordPair[] };
      if (!res.ok || !data.safe || !Array.isArray(data.words) || data.words.length < 2) {
        setPickErr(data.safe === false ? pc.unsafe : pc.createErr);
        return;
      }
      setSource({ id: keepId ?? hashWords(data.words), title: data.title || fallbackTitle, icon, words: data.words, save });
    } catch {
      setPickErr(pc.createErr);
    } finally {
      setBusy("");
    }
  }

  // Photograph or upload a workbook page (Gadi 2026-10-11): the page is
  // read and its words become the cards, as in /spell. No `capture`, so a
  // phone offers both the camera and the gallery.
  const photoRef = useRef<HTMLInputElement>(null);
  const [photoMsg, setPhotoMsg] = useState("");
  async function fromPhoto(file: File) {
    if (!user || busy) return;
    setBusy("photo");
    setPickErr("");
    setPhotoMsg(photoT("photoReading", lang));
    let text = "";
    try {
      const fd = await ocrForm(file);
      const r = await fetch("/api/ocr", { method: "POST", headers: { Authorization: `Bearer ${await user.getIdToken()}` }, body: fd });
      const j = (await r.json().catch(() => ({}))) as { text?: string };
      text = r.ok ? (j.text ?? "").trim() : "";
    } catch { /* handled below */ }
    setBusy("");
    setPhotoMsg("");
    if (text.length < 2) { setPickErr(photoT("photoFail", lang)); return; }
    await makeSet({ list: text.slice(0, 800), fromPhoto: true }, "list", "📷", pc.pasteTitle, true);
  }

  function pickTopic(s: DictationSet) {
    // The built-in sets are Hebrew/English; other languages get the same
    // topic generated in their language (as /spell does).
    if (lang === "he") setSource({ id: s.id, title: getCatTitle(s.id, lang), icon: s.icon, words: s.words, save: false });
    else void makeSet({ topic: s.titleEn }, s.id, s.icon, getCatTitle(s.id, lang), false, s.id);
  }

  async function openSaved(setId: string) {
    if (!user || busy) return;
    setBusy(setId);
    try {
      const res = await fetch("/api/dictation-sets?id=" + encodeURIComponent(setId), { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
      const data = res.ok ? ((await res.json()) as { set?: { setId?: string; title?: string; icon?: string; words?: WordPair[] } }) : {};
      const sv = data.set;
      if (sv && Array.isArray(sv.words) && sv.words.length >= 2) setSource({ id: sv.setId || setId, title: sv.title || "", icon: sv.icon || "📝", words: sv.words, save: true });
      else setPickErr(pc.createErr);
    } catch {
      setPickErr(pc.createErr);
    } finally {
      setBusy("");
    }
  }

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
  const [pairs, setPairs] = useState<Record<string, PairInfo> | null>(mode === "words" ? null : {});
  useEffect(() => {
    if (mode !== "words" || source !== "mine") return;
    let cancelled = false;
    (async () => {
      try {
        const token = user ? await user.getIdToken() : "";
        const res = await fetch("/api/play/pairs", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ uiLang: lang, items: candidates.map((w) => ({ word: w.word, language: w.language })) }),
        });
        const data = res.ok ? ((await res.json()) as { pairs?: Record<string, PairInfo> }) : {};
        if (!cancelled) setPairs(data.pairs ?? {});
      } catch {
        if (!cancelled) setPairs({});
      }
    })();
    return () => { cancelled = true; };
  }, [mode, source, candidates, lang, user]);

  const first = useMemo<Card[]>(() => {
    if (picked) {
      // A picked set brings its own pairs: the word in your language and its
      // English. All of it is used: a school list is practiced whole.
      const own = codeLabel(lang, lang);
      return shuffle(picked.words).map((p, i) => ({
        key: `t${i}`,
        word: { word: p.he, language: own, meaning: "", examples: [], uiLang: lang },
        pair: { pair: p.en, pairLang: "English", wordLang: own },
        repeat: false,
      }));
    }
    if (!pairs) return [];
    const list = mode === "words" ? candidates.filter((w) => pairs[w.word]?.pair) : candidates;
    // `alt`: in mixed definition cards, this card shows the meaning first.
    return list.slice(0, SESSION_SIZE.flashcards).map((w, i) => ({ key: `c${i}`, word: w, pair: pairs[w.word], repeat: false, alt: Math.random() < 0.5 }));
  }, [pairs, candidates, mode, picked, lang]);

  const [deck, setDeck] = useState<Card[] | null>(null);
  useEffect(() => { if (picked || pairs) setDeck(first); }, [first, pairs, picked]);

  // Each card shows its picture with the word, before the flip (Gadi
  // 2026-10-10). Only pictures already in the shared cache: free, and a
  // word without one simply shows the word.
  const [pics, setPics] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!user || first.length === 0) return;
    const words = first.flatMap((c) => [c.word.word, ...(c.pair ? [c.pair.pair] : []), ...(c.word.picWord ? [c.word.picWord] : [])]);
    // The other side of each card tells the drawing which sense is meant.
    const hints: Record<string, string> = {};
    for (const c of first) {
      if (c.pair && c.pair.pairLang === "English") hints[c.pair.pair] = c.word.word;
      else if (/^english$/i.test(c.word.language) && (c.pair?.pair || c.word.meaning)) hints[c.word.word] = c.pair?.pair || c.word.meaning;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/play/images", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
          // Missing English pictures are drawn on the server meanwhile.
          body: JSON.stringify({ words, generate: true, hints }),
        });
        const data = res.ok ? ((await res.json()) as { images?: Record<string, string> }) : {};
        if (!cancelled && data.images) {
          // Load every picture up front, so the next card never waits on its
          // picture (and never shows the previous one while it loads).
          for (const u of Object.values(data.images)) { const im = new Image(); im.src = u; }
          setPics(data.images);
        }
        // Pictures drawn just now show up later in the same deck.
        if (!cancelled && Object.keys(data.images ?? {}).length < words.length) {
          await new Promise((r) => setTimeout(r, 30_000));
          if (cancelled) return;
          const again = await fetch("/api/play/images", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
            body: JSON.stringify({ words }),
          });
          const more = again.ok ? ((await again.json()) as { images?: Record<string, string> }) : {};
          if (!cancelled && more.images) {
            for (const u of Object.values(more.images)) { const im = new Image(); im.src = u; }
            setPics((prev) => ({ ...more.images, ...prev }));
          }
        }
      } catch { /* cards work without pictures */ }
    })();
    return () => { cancelled = true; };
  }, [first, user]);
  // The picture follows the English side when there is one (Gadi 2026-10-11:
  // חום the colour showed a picture of heat). The picture cache is keyed by
  // the word only, and English is far less ambiguous than Hebrew.
  const picOf = (c: Card) => {
    const en = c.word.picWord || (c.pair?.pairLang === "English" ? c.pair.pair : /^english$/i.test(c.word.language) ? c.word.word : undefined);
    return (en && pics[en]) || pics[c.word.word] || (c.pair ? pics[c.pair.pair] : undefined);
  };
  const [showPics, setShowPics] = useState(() => { try { return localStorage.getItem("gadit-flash-pics") !== "0"; } catch { return true; } });
  const togglePics = () => setShowPics((v) => { try { localStorage.setItem("gadit-flash-pics", v ? "0" : "1"); } catch { /* private mode */ } return !v; });
  const anyPics = first.some((c) => !!picOf(c));
  const deckHasPics = (showPics || preReader) && anyPics;
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [defDir, setDefDir] = useState<DefDir>("mix");
  const dc = DIR_COPY[lang] ?? DIR_COPY.en;
  const [known, setKnown] = useState(0);
  const [missed, setMissed] = useState<Card[]>([]);
  // A child who doesn't read yet hears each new card by itself.
  const sayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!preReader || !deck || i >= deck.length) return;
    const tm = setTimeout(() => sayRef.current?.querySelector("button")?.click(), 450);
    return () => clearTimeout(tm);
  }, [preReader, deck, i]);

  // A set someone made (or reopened) is saved with their dictation sets at
  // the end, so it's waiting next time here and in /spell.
  const finished = !!deck && deck.length > 0 && i >= deck.length;
  const savedRef = useRef(false);
  useEffect(() => {
    if (!finished || savedRef.current || !picked?.save || !user) return;
    savedRef.current = true;
    void (async () => {
      try {
        await fetch("/api/dictation-sets", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
          body: JSON.stringify({ setId: picked.id, title: picked.title, icon: picked.icon, direction: "he2en", words: picked.words, score: known, total: first.length }),
        });
      } catch { /* best-effort */ }
    })();
  }, [finished, picked, user, known, first.length]);

  if (!source) {
    return (
      <div className="wb-play-stage">
        <style>{FLASH_CSS}</style>
        <PlayHeader title={title} progress="" score={0} onExit={onExit} t={t} />
        {/* The title of this screen: pick which words the cards use (Gadi
            2026-10-11: as a big empty card it read like a broken box). */}
        <h2 className="wb-flash-pick-h">{f.pick}</h2>
        <div className="wb-flash-pick">
          <button type="button" className="wb-flash-src wb-flash-src-mine" onClick={() => setSource("mine")} disabled={mineTotal === 0}>
            <span className="wb-flash-src-title">{f.mine}</span>
            <span className="wb-flash-src-sub">{f.mineCount(mineTotal)}</span>
          </button>
          {saved.length > 0 && (
            <>
              <div className="wb-flash-topics-label">{pc.mySets}</div>
              <div className="wb-flash-topics">
                {saved.map((s) => (
                  <button key={s.setId} type="button" className="wb-flash-src" onClick={() => void openSaved(s.setId)} disabled={!!busy}>
                    <span className="wb-flash-src-icon" aria-hidden>{s.icon || "📝"}</span>
                    <span className="wb-flash-src-title" dir="auto">{busy === s.setId ? <WaitText text={pc.creating} /> : s.title || "📝"}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {offerSets && (
            <>
              <div className="wb-flash-topics-label">{f.topics}</div>
              <div className="wb-flash-topics">
                {DICTATION_SETS.map((s) => (
                  <button key={s.id} type="button" className="wb-flash-src" onClick={() => pickTopic(s)} disabled={!!busy}>
                    <span className="wb-flash-src-icon" aria-hidden>{s.icon}</span>
                    <span className="wb-flash-src-title">{busy === s.id ? <WaitText text={pc.creating} /> : getCatTitle(s.id, lang)}</span>
                  </button>
                ))}
              </div>
              <form
                className="wb-flash-make"
                onSubmit={(e) => { e.preventDefault(); const tp = ownTopic.trim(); if (tp.length >= 2) void makeSet({ topic: tp }, "topic", "✨", tp, true); }}
              >
                <label className="wb-flash-make-title" htmlFor="wb-flash-topic">{pc.ownTopic}</label>
                <div className="wb-flash-make-row">
                  <input id="wb-flash-topic" className="wb-flash-input" value={ownTopic} onChange={(e) => setOwnTopic(e.target.value)} placeholder={pc.ownTopicPh} maxLength={40} dir={fieldDir} />
                  <button type="submit" className="wb-flash-make-btn" disabled={ownTopic.trim().length < 2 || !!busy}>{busy === "topic" ? <WaitText text={pc.creating} /> : pc.make}</button>
                </div>
              </form>
              <form
                className="wb-flash-make"
                onSubmit={(e) => { e.preventDefault(); const lt = listText.trim(); if (lt.length >= 2) void makeSet({ list: lt }, "list", "📝", pc.pasteTitle, true); }}
              >
                <label className="wb-flash-make-title" htmlFor="wb-flash-list">{pc.pasteTitle}</label>
                <div className="wb-flash-make-sub">{pc.pasteSub}</div>
                <textarea id="wb-flash-list" className="wb-flash-input wb-flash-textarea" value={listText} onChange={(e) => setListText(e.target.value)} placeholder={pc.pastePh} maxLength={800} rows={5} dir={fieldDir} />
                <div className="wb-flash-make-row">
                  <button type="submit" className="wb-flash-make-btn" disabled={listText.trim().length < 2 || !!busy}>{busy === "list" ? <WaitText text={pc.creating} /> : pc.pasteBtn}</button>
                  <button type="button" className="wb-flash-make-btn is-ghost" onClick={() => photoRef.current?.click()} disabled={!!busy}>
                    <span aria-hidden>📷</span> {busy === "photo" ? <WaitText text={photoMsg} /> : photoT("photoBtn", lang)}
                  </button>
                  <input ref={photoRef} type="file" accept="image/*" hidden
                    onChange={(e) => { const fl = e.target.files?.[0]; if (fl) void fromPhoto(fl); e.target.value = ""; }} />
                </div>
              </form>
            </>
          )}
          {pickErr && <div className="wb-flash-err" role="alert">{pickErr}</div>}
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="wb-play-stage">
        <PlayHeader title={title} progress="" score={0} onExit={onExit} t={t} />
        <div className="wb-play-question"><div className="wb-play-question-eyebrow"><WaitText text={f.loading} live /></div></div>
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
      reportAnswer(card.word.word, knew);
      if (knew) setKnown((k) => k + 1);
      else setMissed((m) => [...m, card]);
    }
    // A card you didn't know comes back once at the end of the deck.
    if (!knew && !card.repeat) setDeck([...deck, { ...card, key: `${card.key}r`, repeat: true }]);
    setFlipped(false);
    setI((x) => x + 1);
  }

  // Front / back text for the current card.
  const wordLangName = card.pair?.wordLang || card.word.language;
  // A learning session or a lesson brings its own words, not the notebook.
  const sourceLabel = picked ? f.srcTopic(picked.title) : skipPicker ? "" : f.srcMine;
  const pair = card.pair;
  const meaningFirst = !preReader && mode === "meanings" && (defDir === "meaning" || (defDir === "mix" && !!card.alt));
  const frontText = meaningFirst ? card.word.meaning : mode === "words" && pair && reverse ? pair.pair : card.word.word;
  const backText = meaningFirst ? card.word.word : mode === "words" && pair ? (reverse ? card.word.word : pair.pair) : card.word.meaning;
  const askLang = mode === "words" && pair ? langLabel(reverse ? wordLangName : pair.pairLang, lang) : "";
  const example = mode === "meanings" && !meaningFirst ? card.word.examples?.[0] : undefined;
  const pic = showPics || preReader ? picOf(card) : undefined;
  // The speaker reads the side on screen, in its own language (Gat's mother,
  // 2026-10-22: an English card was read out in Hebrew).
  const shownIsPair = mode === "words" && !!pair && (flipped ? !reverse : reverse);
  const sayText = shownIsPair && pair ? pair.pair : card.word.word;
  const sayLang = shownIsPair && pair ? wordLangOf({ word: pair.pair, language: pair.pairLang } as Parameters<typeof wordLangOf>[0]) : wordLangOf(card.word);
  const ask = flipped ? f.tapBack : mode === "words" ? (askLang ? f.sayIn(askLang) : f.tapToFlip) : meaningFirst ? dc.askWord : dc.askMeaning;

  return (
    <div className="wb-play-stage">
      <style>{FLASH_CSS}</style>
      <PlayHeader title={title} progress={`${Math.min(i + 1, deck.length)}/${deck.length}`} score={known} onExit={onExit} t={t} />
      <div className="wb-play-question">
        {sourceLabel && <div className="wb-flash-source">{sourceLabel}</div>}
        <div className="wb-play-question-eyebrow"><QText text={ask} /></div>
        {mode === "words" && !flipped && (
          <button type="button" className="wb-flash-swap" onClick={() => setReverse((r) => !r)}>{f.swap}</button>
        )}
        {mode === "meanings" && !flipped && !preReader && (
          <div className="wb-flash-dirs" role="radiogroup">
            {(["mix", "word", "meaning"] as DefDir[]).map((d) => (
              <button key={d} type="button" role="radio" aria-checked={defDir === d} className={`wb-flash-dir${defDir === d ? " is-on" : ""}`} onClick={() => setDefDir(d)}>
                {dc[d]}
              </button>
            ))}
          </div>
        )}
        {anyPics && !preReader && (
          <button type="button" className={`wb-flash-pictoggle${showPics ? " is-on" : ""}`} aria-pressed={showPics} onClick={togglePics}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" />
              {!showPics && <path d="M3 3l18 18" />}
            </svg>
            {(PIC_TOGGLE[lang] ?? PIC_TOGGLE.en)[showPics ? 0 : 1]}
          </button>
        )}
      </div>
      <button
        type="button"
        className={`wb-flash-card${flipped ? " is-flipped" : ""}${deckHasPics ? " has-pics" : ""}`}
        onClick={() => setFlipped((x) => !x)}
        aria-pressed={flipped}
      >
        <span className="wb-flash-inner">
          <span className={`wb-flash-face wb-flash-front${pic ? " has-pic" : ""}${preReader && pic ? " is-pre" : ""}`} aria-hidden={flipped}>
            {card.repeat && <span className="wb-flash-again">{f.again}</span>}
            {pic && (
              // key: a fresh element per card, so the previous card's picture is
              // never left on screen under the new word (Gadi 2026-10-10).
              // eslint-disable-next-line @next/next/no-img-element
              <img key={card.key} className="wb-flash-pic" src={pic} alt="" />
            )}
            {/* Pre-reader: the picture is the word (the sound plays with it). */}
            {!(preReader && pic) && <span className={meaningFirst ? "wb-flash-meaning" : "wb-flash-word"} dir="auto">{meaningFirst ? <QText text={nq(frontText)} skip={[card.word.word]} /> : nq(frontText)}</span>}
          </span>
          <span className="wb-flash-face wb-flash-back" aria-hidden={!flipped}>
            <span className={meaningFirst ? "wb-flash-example" : "wb-flash-backword"} dir="auto">{meaningFirst ? <QText text={nq(frontText)} /> : nq(frontText)}</span>
            <span className={mode === "words" || meaningFirst ? "wb-flash-word" : "wb-flash-meaning"} dir="auto">{mode === "words" || meaningFirst ? nq(backText) : <QText text={nq(backText)} />}</span>
            {example && <span className="wb-flash-example" dir="auto"><QText text={nq(example)} wordLang={wordLangOf(card.word)} /></span>}
          </span>
        </span>
      </button>
      {/* Hear the word, outside the card so a tap never flips it (Gadi 2026-10-11). */}
      {/* Not before the flip when the word is the answer: hearing it would give it away (Gadi 2026-10-17). */}
      {!(meaningFirst && !flipped) && <div ref={sayRef} className="wb-flash-say"><TTSButton key={sayText} text={sayText} audioLang={sayLang} useOpenAI ariaLabel={sayText} className="wb-word-act-icon wb-play-speak" /></div>}
      {flipped && (
        <div className="wb-flash-actions">
          <button type="button" className="wb-flash-btn wb-flash-no" onClick={() => answer(false)}>{f.notYet}</button>
          <button type="button" className="wb-flash-btn wb-flash-yes" onClick={() => answer(true)}>{f.knew}</button>
        </div>
      )}
      {flipped && wordFlag && <div key={card.key} className="wb-flash-flag">{wordFlag(card.word)}</div>}
    </div>
  );
}

export const FLASH_CSS = `
.wb-flash-card { display: block; width: min(100%, 440px); margin: 18px auto 0; aspect-ratio: 4 / 3; padding: 0; border: 0; background: none; cursor: pointer; perspective: 1200px; font: inherit; }
.wb-flash-inner { position: relative; display: block; width: 100%; height: 100%; transition: transform 420ms cubic-bezier(.2,.7,.2,1); transform-style: preserve-3d; }
.wb-flash-card.is-flipped .wb-flash-inner { transform: rotateY(180deg); }
.wb-flash-face { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 24px; border-radius: 24px; backface-visibility: hidden; -webkit-backface-visibility: hidden; box-shadow: 0 18px 40px -18px rgba(16,40,60,0.35), 0 0 0 1px rgba(15,72,68,0.08); text-align: center; overflow: auto; }
.wb-flash-front { background: linear-gradient(160deg, #E8F6F6 0%, #FFFFFF 70%); }
.wb-flash-back { background: linear-gradient(160deg, #F5F1FF 0%, #FFFFFF 70%); transform: rotateY(180deg); }
.wb-flash-word { font-size: clamp(30px, 8vw, 46px); font-weight: 800; color: #0f172a; line-height: 1.15; word-break: break-word; }
.wb-flash-backword { font-size: 16px; font-weight: 700; color: #6D28D9; }
.wb-flash-meaning { font-size: clamp(17px, 4.4vw, 21px); font-weight: 600; color: #1f2937; line-height: 1.55; }
.wb-flash-example { font-size: 15px; color: #4B5563; line-height: 1.5; font-style: italic; }
.wb-flash-again { position: absolute; top: 14px; inset-inline-start: 14px; font-size: 12px; font-weight: 700; color: #b45309; background: #FEF3C7; border-radius: 999px; padding: 3px 10px; }
.wb-flash-swap { display: inline-block; margin-top: 10px; font: inherit; font-size: 13px; font-weight: 700; color: #086868; background: rgba(14,165,165,0.10); border: 0; border-radius: 999px; padding: 6px 14px; cursor: pointer; }
.wb-flash-actions { display: flex; gap: 12px; justify-content: center; margin-top: 18px; }
.wb-flash-btn { min-width: 130px; padding: 12px 20px; border-radius: 999px; font: inherit; font-size: 16px; font-weight: 700; cursor: pointer; border: 0; }
.wb-flash-yes { background: #0EA5A5; color: #fff; box-shadow: 0 10px 22px -10px rgba(14,165,165,0.6); }
.wb-flash-no { background: #fff; color: #374151; box-shadow: 0 0 0 1.5px #D1D5DB inset; }
.wb-flash-card.has-pics { aspect-ratio: 4 / 5; }
.wb-flash-front.has-pic { justify-content: flex-start; padding: 0 0 6px; gap: 0; }
/* The pictures are square: a square frame shows all of it (Gadi 2026-10-11:
   on a tablet the 70% strip cut the top and bottom off). */
.wb-flash-pic { display: block; width: 100%; height: auto; aspect-ratio: 1 / 1; object-fit: cover; background: #F6FAF9; flex: none; }
.wb-flash-front.has-pic .wb-flash-word { font-size: clamp(28px, 7vw, 40px); margin-block: auto; }
.wb-flash-front.has-pic .wb-flash-meaning { margin-block: auto; }
.wb-flash-front.has-pic .wb-flash-meaning { padding-inline: 20px; font-size: clamp(15px, 4vw, 18px); }
.wb-flash-front.has-pic .wb-flash-again { z-index: 1; }
.wb-flash-flag { display: flex; justify-content: center; margin-top: 14px; }
.wb-flash-front.has-pic.is-pre { justify-content: center; padding: 0; }
.wb-flash-pictoggle { display: inline-flex; align-items: center; gap: 6px; margin: 10px auto 0; font: inherit; font-size: 13px; font-weight: 700; color: #475569; background: rgba(15,23,42,0.06); border: 0; border-radius: 999px; padding: 6px 14px; cursor: pointer; }
.wb-flash-pictoggle.is-on { color: #086868; background: rgba(14,165,165,0.10); }
.wb-flash-pictoggle:focus-visible { outline: 2px solid #0EA5A5; outline-offset: 2px; }
.wb-flash-dirs { display: inline-flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 10px; }
.wb-flash-dir { font: inherit; font-size: 13px; font-weight: 700; color: #086868; background: rgba(14,165,165,0.10); border: 0; border-radius: 999px; padding: 6px 12px; cursor: pointer; }
.wb-flash-dir.is-on { background: #0B7F7F; color: #fff; }
.wb-flash-source { font-size: 13px; font-weight: 700; color: #6D28D9; margin-bottom: 6px; }
.wb-flash-pick-h { margin: 22px 0 0; text-align: center; font-size: 20px; font-weight: 800; color: var(--ink, #0f172a); text-wrap: balance; }
.wb-flash-make-btn.is-ghost { background: transparent; color: #0b7d7d; box-shadow: 0 0 0 1.5px #0EA5A5 inset; }
.wb-flash-pick { display: grid; gap: 12px; width: min(100%, 560px); margin: 18px auto 0; }
.wb-flash-src { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 14px 12px; border-radius: 16px; border: 0; background: #fff; box-shadow: 0 0 0 1px rgba(15,72,68,0.12), 0 8px 18px -12px rgba(16,40,60,0.3); font: inherit; cursor: pointer; color: #0f172a; }
.wb-flash-src:hover:not(:disabled) { box-shadow: 0 0 0 2px #0EA5A5, 0 8px 18px -12px rgba(16,40,60,0.3); }
.wb-flash-src:disabled { opacity: 0.5; cursor: default; }
.wb-flash-src-mine { padding: 18px 16px; background: linear-gradient(160deg, #E8F6F6 0%, #FFFFFF 75%); }
.wb-flash-src-title { font-size: 16px; font-weight: 700; }
.wb-flash-src-sub { font-size: 13px; color: #4B5563; }
.wb-flash-src-icon { font-size: 26px; line-height: 1; }
.wb-flash-topics-label { font-size: 13px; font-weight: 700; color: var(--ink-soft, #4B5563); text-align: center; margin-top: 6px; }
.wb-flash-topics { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; }
.wb-flash-make { display: grid; gap: 8px; padding: 14px 16px; border-radius: 16px; background: #fff; box-shadow: 0 0 0 1px rgba(15,72,68,0.12); margin-top: 6px; }
.wb-flash-make-title { font-size: 15px; font-weight: 700; color: #0f172a; }
.wb-flash-make-sub { font-size: 13px; color: #6b7280; line-height: 1.5; }
.wb-flash-make-row { display: flex; gap: 8px; flex-wrap: wrap; }
.wb-flash-input { flex: 1 1 180px; min-width: 0; font: inherit; font-size: 16px; padding: 10px 12px; border-radius: 12px; border: 1.5px solid #D1D5DB; background: #fff; color: #0f172a; }
.wb-flash-input:focus { outline: none; border-color: #0EA5A5; }
.wb-flash-textarea { resize: vertical; line-height: 1.5; }
.wb-flash-make-btn { font: inherit; font-size: 15px; font-weight: 700; padding: 10px 18px; border-radius: 999px; border: 0; background: #0EA5A5; color: #fff; cursor: pointer; justify-self: start; }
.wb-flash-make-btn:disabled { opacity: 0.5; cursor: default; }
.wb-flash-err { font-size: 14px; font-weight: 600; color: #b45309; text-align: center; }
@media (prefers-reduced-motion: reduce) { .wb-flash-inner { transition: none; } }
`;

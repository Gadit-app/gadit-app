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

import { useEffect, useMemo, useRef, useState } from "react";
import type { PlayWord } from "@/lib/play-engine";
import { shuffle, SESSION_SIZE } from "@/lib/play-engine";
import { GameResult } from "./GameResult";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { useNiqqud } from "@/lib/niqqud-display";
import { useAuth } from "@/lib/auth-context";
import { DICTATION_SETS, getCatTitle, type DictationSet, type WordPair } from "@/lib/dictation-sets";

export type FlashMode = "words" | "meanings";

type FlashCopy = {
  wordsTitle: string; wordsDesc: string; defsTitle: string; defsDesc: string;
  tapToFlip: string; tapBack: string; sayIn: (l: string) => string; knew: string; notYet: string; again: string;
  swap: string; loading: string; none: string; result: (k: number, n: number) => string;
  pick: string; mine: string; mineCount: (n: number) => string; topics: string; srcMine: string; srcTopic: (t: string) => string;
};

export const FLASH_COPY: Record<string, FlashCopy> = {
  he: { wordsTitle: "כרטיסיות מילים", wordsDesc: "רואים מילה, אומרים אותה בשפה השנייה, והופכים את הכרטיס לבדוק.", defsTitle: "כרטיסיות הגדרות", defsDesc: "רואים מילה, נזכרים מה היא אומרת, והופכים את הכרטיס לבדוק.", tapToFlip: "לחצו על הכרטיס כדי להפוך אותו", tapBack: "לחצו כדי לחזור למילה", sayIn: (l) => `איך אומרים את זה ב${l}?`, knew: "ידעתי", notYet: "עוד לא", again: "שוב", swap: "להחליף כיוון", loading: "מכינים את הכרטיסים...", none: "עוד אין מילים לכרטיסים. חפשו מילה באנגלית או בעברית, והיא תופיע כאן.", result: (k, n) => `ידעתם ${k} מתוך ${n} כבר בפעם הראשונה`, pick: "מאיפה המילים?", mine: "המילים שלכם מהמחברת", mineCount: (n) => `${n} מילים, בסדר אקראי`, topics: "או בחרו נושא", srcMine: "מילים מהמחברת שלכם, בסדר אקראי", srcTopic: (t) => `נושא: ${t}` },
  en: { wordsTitle: "Word cards", wordsDesc: "See a word, say it in the other language, then flip the card to check.", defsTitle: "Definition cards", defsDesc: "See a word, recall what it means, then flip the card to check.", tapToFlip: "Tap the card to flip it", tapBack: "Tap to go back to the word", sayIn: (l) => `How do you say it in ${l}?`, knew: "I knew it", notYet: "Not yet", again: "Again", swap: "Swap direction", loading: "Getting your cards ready...", none: "No words for cards yet. Look up a word in another language and it will show up here.", result: (k, n) => `You knew ${k} of ${n} the first time`, pick: "Where should the words come from?", mine: "Your notebook words", mineCount: (n) => `${n} words, in random order`, topics: "Or pick a topic", srcMine: "Words from your notebook, in random order", srcTopic: (t) => `Topic: ${t}` },
  ar: { wordsTitle: "بطاقات الكلمات", wordsDesc: "ترى كلمة، تقولها باللغة الأخرى، ثم تقلب البطاقة لتتحقق.", defsTitle: "بطاقات التعريفات", defsDesc: "ترى كلمة، تتذكّر معناها، ثم تقلب البطاقة لتتحقق.", tapToFlip: "اضغط على البطاقة لقلبها", tapBack: "اضغط للعودة إلى الكلمة", sayIn: (l) => `كيف تقولها بـ${l}؟`, knew: "عرفتها", notYet: "ليس بعد", again: "مرة أخرى", swap: "عكس الاتجاه", loading: "نجهّز البطاقات...", none: "لا توجد كلمات للبطاقات بعد. ابحث عن كلمة بلغة أخرى وستظهر هنا.", result: (k, n) => `عرفت ${k} من ${n} من المرة الأولى`, pick: "من أين الكلمات؟", mine: "كلماتك من الدفتر", mineCount: (n) => `${n} كلمة، بترتيب عشوائي`, topics: "أو اختر موضوعًا", srcMine: "كلمات من دفترك، بترتيب عشوائي", srcTopic: (t) => `الموضوع: ${t}` },
  ru: { wordsTitle: "Карточки слов", wordsDesc: "Видите слово, говорите его на другом языке и переворачиваете карточку.", defsTitle: "Карточки значений", defsDesc: "Видите слово, вспоминаете значение и переворачиваете карточку.", tapToFlip: "Нажмите на карточку, чтобы перевернуть", tapBack: "Нажмите, чтобы вернуться к слову", sayIn: (l) => `Как это сказать (${l})?`, knew: "Знал(а)", notYet: "Ещё нет", again: "Ещё раз", swap: "Поменять направление", loading: "Готовим карточки...", none: "Пока нет слов для карточек. Найдите слово на другом языке, и оно появится здесь.", result: (k, n) => `Вы знали ${k} из ${n} с первого раза`, pick: "Откуда взять слова?", mine: "Слова из вашей тетради", mineCount: (n) => `${n} слов, в случайном порядке`, topics: "Или выберите тему", srcMine: "Слова из вашей тетради, в случайном порядке", srcTopic: (t) => `Тема: ${t}` },
  es: { wordsTitle: "Tarjetas de palabras", wordsDesc: "Ves una palabra, la dices en el otro idioma y das la vuelta para comprobar.", defsTitle: "Tarjetas de definiciones", defsDesc: "Ves una palabra, recuerdas su significado y das la vuelta para comprobar.", tapToFlip: "Toca la tarjeta para darle la vuelta", tapBack: "Toca para volver a la palabra", sayIn: (l) => `¿Cómo se dice en ${l}?`, knew: "La sabía", notYet: "Todavía no", again: "Otra vez", swap: "Cambiar dirección", loading: "Preparando tus tarjetas...", none: "Aún no hay palabras para tarjetas. Busca una palabra en otro idioma y aparecerá aquí.", result: (k, n) => `Sabías ${k} de ${n} a la primera`, pick: "¿De dónde salen las palabras?", mine: "Las palabras de tu cuaderno", mineCount: (n) => `${n} palabras, en orden aleatorio`, topics: "O elige un tema", srcMine: "Palabras de tu cuaderno, en orden aleatorio", srcTopic: (t) => `Tema: ${t}` },
};

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
type Card = { key: string; word: PlayWord; pair?: PairInfo; repeat: boolean };

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

/** Topics, own topics and pasted lists pair a word with its English, so
 *  they are offered whenever the UI language isn't English itself. */
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
}: {
  pool: PlayWord[];
  onExit: () => void;
  lang: string;
  t: PlayT;
  focusWord?: string;
  mode?: FlashMode;
}) {
  const f = flashCopy(lang);
  const title = mode === "words" ? f.wordsTitle : f.defsTitle;
  const { nq } = useNiqqud(); // display-only vowel points
  const { user } = useAuth();
  // Freeze the words at mount: the page tops the pool up with examples a
  // moment later, and that must not reshuffle a deck mid-game.
  const [startPool] = useState(pool);
  const pc = PICK_COPY[lang] ?? PICK_COPY.en;
  // Where the words come from: the notebook, or a set picked on the start screen.
  const offerPick = mode === "words" && !focusWord;
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
  async function makeSet(body: { topic?: string; list?: string }, key: string, icon: string, fallbackTitle: string, save: boolean, keepId?: string) {
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
    return list.slice(0, SESSION_SIZE.flashcards).map((w, i) => ({ key: `c${i}`, word: w, pair: pairs[w.word], repeat: false }));
  }, [pairs, candidates, mode, picked, lang]);

  const [deck, setDeck] = useState<Card[] | null>(null);
  useEffect(() => { if (picked || pairs) setDeck(first); }, [first, pairs, picked]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [known, setKnown] = useState(0);
  const [missed, setMissed] = useState<Card[]>([]);

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
        <div className="wb-play-question"><div className="wb-play-question-eyebrow">{f.pick}</div></div>
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
                    <span className="wb-flash-src-title" dir="auto">{busy === s.setId ? pc.creating : s.title || "📝"}</span>
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
                    <span className="wb-flash-src-title">{busy === s.id ? pc.creating : getCatTitle(s.id, lang)}</span>
                  </button>
                ))}
              </div>
              <form
                className="wb-flash-make"
                onSubmit={(e) => { e.preventDefault(); const tp = ownTopic.trim(); if (tp.length >= 2) void makeSet({ topic: tp }, "topic", "✨", tp, true); }}
              >
                <label className="wb-flash-make-title" htmlFor="wb-flash-topic">{pc.ownTopic}</label>
                <div className="wb-flash-make-row">
                  <input id="wb-flash-topic" className="wb-flash-input" value={ownTopic} onChange={(e) => setOwnTopic(e.target.value)} placeholder={pc.ownTopicPh} maxLength={40} dir="auto" />
                  <button type="submit" className="wb-flash-make-btn" disabled={ownTopic.trim().length < 2 || !!busy}>{busy === "topic" ? pc.creating : pc.make}</button>
                </div>
              </form>
              <form
                className="wb-flash-make"
                onSubmit={(e) => { e.preventDefault(); const lt = listText.trim(); if (lt.length >= 2) void makeSet({ list: lt }, "list", "📝", pc.pasteTitle, true); }}
              >
                <label className="wb-flash-make-title" htmlFor="wb-flash-list">{pc.pasteTitle}</label>
                <div className="wb-flash-make-sub">{pc.pasteSub}</div>
                <textarea id="wb-flash-list" className="wb-flash-input wb-flash-textarea" value={listText} onChange={(e) => setListText(e.target.value)} placeholder={pc.pastePh} maxLength={800} rows={5} dir="auto" />
                <button type="submit" className="wb-flash-make-btn" disabled={listText.trim().length < 2 || !!busy}>{busy === "list" ? pc.creating : pc.pasteBtn}</button>
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
        <div className="wb-play-question"><div className="wb-play-question-eyebrow">{f.loading}</div></div>
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
  const sourceLabel = picked ? f.srcTopic(picked.title) : f.srcMine;
  const pair = card.pair;
  const frontText = mode === "words" && pair && reverse ? pair.pair : card.word.word;
  const backText = mode === "words" && pair ? (reverse ? card.word.word : pair.pair) : card.word.meaning;
  const askLang = mode === "words" && pair ? langLabel(reverse ? wordLangName : pair.pairLang, lang) : "";
  const example = mode === "meanings" ? card.word.examples?.[0] : undefined;

  return (
    <div className="wb-play-stage">
      <style>{FLASH_CSS}</style>
      <PlayHeader title={title} progress={`${Math.min(i + 1, deck.length)}/${deck.length}`} score={known} onExit={onExit} t={t} />
      <div className="wb-play-question">
        <div className="wb-flash-source">{sourceLabel}</div>
        <div className="wb-play-question-eyebrow">{flipped ? f.tapBack : mode === "words" && askLang ? f.sayIn(askLang) : f.tapToFlip}</div>
        {mode === "words" && !flipped && (
          <button type="button" className="wb-flash-swap" onClick={() => setReverse((r) => !r)}>{f.swap}</button>
        )}
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
            <span className="wb-flash-word" dir="auto">{nq(frontText)}</span>
          </span>
          <span className="wb-flash-face wb-flash-back" aria-hidden={!flipped}>
            <span className="wb-flash-backword" dir="auto">{nq(frontText)}</span>
            <span className={mode === "words" ? "wb-flash-word" : "wb-flash-meaning"} dir="auto">{nq(backText)}</span>
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
.wb-flash-swap { display: inline-block; margin-top: 10px; font: inherit; font-size: 13px; font-weight: 700; color: #0b7d7d; background: rgba(14,165,165,0.10); border: 0; border-radius: 999px; padding: 6px 14px; cursor: pointer; }
.wb-flash-actions { display: flex; gap: 12px; justify-content: center; margin-top: 18px; }
.wb-flash-btn { min-width: 130px; padding: 12px 20px; border-radius: 999px; font: inherit; font-size: 16px; font-weight: 700; cursor: pointer; border: 0; }
.wb-flash-yes { background: #0EA5A5; color: #fff; box-shadow: 0 10px 22px -10px rgba(14,165,165,0.6); }
.wb-flash-no { background: #fff; color: #374151; box-shadow: 0 0 0 1.5px #D1D5DB inset; }
.wb-flash-source { font-size: 13px; font-weight: 700; color: #6D28D9; margin-bottom: 6px; }
.wb-flash-pick { display: grid; gap: 12px; width: min(100%, 560px); margin: 18px auto 0; }
.wb-flash-src { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 14px 12px; border-radius: 16px; border: 0; background: #fff; box-shadow: 0 0 0 1px rgba(15,72,68,0.12), 0 8px 18px -12px rgba(16,40,60,0.3); font: inherit; cursor: pointer; color: #0f172a; }
.wb-flash-src:hover:not(:disabled) { box-shadow: 0 0 0 2px #0EA5A5, 0 8px 18px -12px rgba(16,40,60,0.3); }
.wb-flash-src:disabled { opacity: 0.5; cursor: default; }
.wb-flash-src-mine { padding: 18px 16px; background: linear-gradient(160deg, #E8F6F6 0%, #FFFFFF 75%); }
.wb-flash-src-title { font-size: 16px; font-weight: 700; }
.wb-flash-src-sub { font-size: 13px; color: #6b7280; }
.wb-flash-src-icon { font-size: 26px; line-height: 1; }
.wb-flash-topics-label { font-size: 13px; font-weight: 700; color: #6b7280; text-align: center; margin-top: 6px; }
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

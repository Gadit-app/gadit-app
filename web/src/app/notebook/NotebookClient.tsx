"use client";

/**
 * NotebookPage — Clear/Deep tier. Lists every word the user has saved.
 *
 * CrispTech aesthetic — white page, teal accent. Replaces the V2 navy
 * starscape design that this route had inherited. Each saved word is a
 * compact white card with the word in teal, language tag, and short
 * meaning summary; the card whole-area links to /word/<word>.
 */

import { useEffect, useRef, useState } from "react";
import { LANGUAGES } from "@/lib/i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { AppearancePicker } from "@/components/AppearancePicker";
import { LangSwitchMobile } from "@/components/LangSwitchMobile";
import { WbShellNav, WbShellBurger } from "@/components/design/WbShellChrome";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { KidsGameHeader } from "@/components/design/KidsGameHeader";
import { useHref } from "@/lib/href";
import { listRecentCached } from "@/lib/offline-db";

// Single source of truth: shared LANGUAGES registry (never drifts behind new langs).
const LANGS = LANGUAGES;

type NotebookItem = {
  id: string;
  word: string;
  language: string;
  meaning: string;
  addedAt: string;
  /** Set once the child proves comprehension (passed quiz/game). Drives the
   *  explorer rank via earned points. Absent on older docs = not yet understood. */
  understood?: boolean;
};

// Group notebook entries by the word's language (Gadi 2026-08-17) so a user
// who looks up words in several languages sees them tidied into per-language
// sections. Groups are ordered by most recent activity (the language you
// used last floats to the top); within a group the API's addedAt-desc order
// is preserved.
function groupByLanguage(items: NotebookItem[]): Array<[string, NotebookItem[]]> {
  const map = new Map<string, NotebookItem[]>();
  for (const it of items) {
    const key = (it.language || "").trim() || "—";
    const arr = map.get(key);
    if (arr) arr.push(it);
    else map.set(key, [it]);
  }
  const recency = (list: NotebookItem[]) =>
    Math.max(...list.map((i) => Date.parse(i.addedAt) || 0));
  return [...map.entries()].sort((a, b) => recency(b[1]) - recency(a[1]));
}

// Kids' reframe of the notebook title/subtitle. The Hebrew "אוצר המילים"
// literally means "vocabulary" — so it reads playful to a young child AND
// mature to a teen, one term that bridges the whole 7-16 range (LLM council
// + Gadi 2026-08-12; replaced the too-young "treasure box"). English uses
// the age-neutral "My words". he/en/ar/ru, English fallback. Never
// translates the brand "Gadit".
const TREASURE_COPY: Record<string, { title: string; subtitle: string }> = {
  en: { title: "My words", subtitle: "Every word you've discovered, in one place. Your collection keeps growing." },
  he: { title: "אוצר המילים שלי", subtitle: "כל מילה שגילית, במקום אחד. אוצר המילים שלך גדל." },
  ar: { title: "كلماتي", subtitle: "كل كلمة اكتشفتها، في مكان واحد. مجموعتك تكبر." },
  ru: { title: "Мои слова", subtitle: "Все твои слова — в одном месте. Твоя коллекция растёт." },
  es: { title: "Mis palabras", subtitle: "Cada palabra que has descubierto, en un solo lugar. Tu colección sigue creciendo." },
  pt: { title: "Minhas palavras", subtitle: "Cada palavra que você descobriu, num só lugar. Sua coleção continua crescendo." },
  fr: { title: "Mes mots", subtitle: "Chaque mot que tu as découvert, au même endroit. Ta collection ne cesse de grandir." },
  de: { title: "Meine Wörter", subtitle: "Jedes Wort, das du entdeckt hast, an einem Ort. Deine Sammlung wächst weiter." },
  cs: { title: "Moje slova", subtitle: "Všechna tvoje slova na jednom místě. Tvoje sbírka stále roste." },
  sk: { title: "Moje slová", subtitle: "Všetky tvoje slová na jednom mieste. Tvoja zbierka stále rastie." },
  it: { title: "Le mie parole", subtitle: "Ogni parola che hai scoperto, in un unico posto. La tua raccolta continua a crescere." },
  ja: { title: "わたしのことば", subtitle: "見つけたことばが、ぜんぶここに。あなたのコレクションが増えていきます。" },
  hi: { title: "मेरे शब्द", subtitle: "आपने जो भी शब्द खोजे, सब एक जगह। आपका संग्रह बढ़ता रहता है।" },
  am: { title: "የእኔ ቃላት", subtitle: "ሁሉም ቃላት በአንድ ቦታ። ስብስቡ እያደገ ነው።" },
  uk: { title: "Мої слова", subtitle: "Усі твої слова — в одному місці. Твоя колекція росте." },
  tr: { title: "Kelimelerim", subtitle: "Keşfettiğin her kelime tek bir yerde. Koleksiyonun büyümeye devam ediyor." },
  pl: { title: "Moje słowa", subtitle: "Wszystkie twoje słowa w jednym miejscu. Twoja kolekcja wciąż rośnie." },
  fa: { title: "کلمات من", subtitle: "هر واژه‌ای که کشف کرده‌ای، در یک جا. مجموعه‌ات رو به رشد است." },
  id: { title: "Kata-kataku", subtitle: "Setiap kata yang kamu temukan, dalam satu tempat. Koleksimu terus bertambah." },
  nl: { title: "Mijn woorden", subtitle: "Elk woord dat je hebt ontdekt, op één plek. Je verzameling blijft groeien." },
  el: { title: "Οι λέξεις μου", subtitle: "Κάθε λέξη που ανακάλυψες, σε ένα μέρος. Η συλλογή σου μεγαλώνει." },
  zu: { title: "Amagama ami", subtitle: "Wonke amagama owatholile, endaweni eyodwa. Iqoqo lakho liyakhula." },
  vi: { title: "Từ của tôi", subtitle: "Mọi từ đã khám phá, gom về một nơi. Bộ sưu tập cứ lớn dần lên." },
  fil: { title: "Mga salita ko", subtitle: "Bawat salitang natuklasan, nasa iisang lugar. Patuloy na lumalago ang koleksyon." },
  af: { title: "My woorde", subtitle: "Elke woord wat ontdek is, op een plek. Die versameling bly groei." },
  sw: { title: "Maneno yangu", subtitle: "Kila neno lililogunduliwa, mahali pamoja. Mkusanyiko unaendelea kukua." },
  "zh-CN": { title: "我的词语", subtitle: "每一个发现的词语，都汇聚在一处。收藏还在不断增长。" },
  "zh-TW": { title: "我的詞語", subtitle: "每一個發現的詞語，都匯聚在一處。收藏還在不斷增加。" },
  ko: { title: "내 단어", subtitle: "발견한 모든 단어를 한곳에. 컬렉션이 계속 늘어납니다." },
  th: { title: "คำของฉัน", subtitle: "ทุกคำที่ค้นพบ รวมไว้ในที่เดียว คลังคำเติบโตขึ้นเรื่อยๆ" },
  bn: { title: "আমার শব্দ", subtitle: "আবিষ্কার করা প্রতিটি শব্দ, এক জায়গায়। সংগ্রহ ক্রমশ বেড়েই চলেছে।" },
  da: { title: "Mine ord", subtitle: "Hvert ord, du har opdaget, samlet ét sted. Samlingen bliver ved med at vokse." },
  hu: { title: "Szavaim", subtitle: "Minden felfedezett szó egy helyen. A gyűjtemény egyre bővül." },
};

const COPY: Record<string, {
  title: string;
  subtitle: string;
  empty: string;
  emptyHint: string;
  goSearch: string;
}> = {
  it: {
    title: "Il mio quaderno",
    subtitle: "Ogni parola che hai raccolto, salvato e organizzato.",
    empty: "Il tuo quaderno è vuoto.",
    emptyHint: "Trova una parola e tocca 'Salva nel quaderno'.",
    goSearch: "Torna alla ricerca",
  },
  ja: {
    title: "マイノート",
    subtitle: "あなたが集めて、保存して、整理したすべての単語。",
    empty: "ノートはまだ空です。",
    emptyHint: "単語を見つけて「ノートに保存」をタップしてください。",
    goSearch: "検索に戻る",
  },
  uk: {
    title: "Мій зошит",
    subtitle: "Кожне слово, яке ти зібрав, зберіг та впорядкував.",
    empty: "Твій зошит порожній.",
    emptyHint: "Знайди слово й натисни «Зберегти в зошит».",
    goSearch: "Назад до пошуку",
  },
  tr: {
    title: "Defterim",
    subtitle: "Topladığın, kaydettiğin ve düzenlediğin her kelime.",
    empty: "Defterin boş.",
    emptyHint: "Bir kelime bul ve 'Deftere kaydet'e dokun.",
    goSearch: "Aramaya dön",
  },
  pl: {
    title: "Mój zeszyt",
    subtitle: "Każde słowo, które zebrałeś, zapisałeś i uporządkowałeś.",
    empty: "Twój zeszyt jest pusty.",
    emptyHint: "Znajdź słowo i dotknij „Zapisz w zeszycie”.",
    goSearch: "Powrót do wyszukiwania",
  },
  fa: {
    title: "دفترچه من",
    subtitle: "هر واژه‌ای که جمع کرده‌ای، ذخیره کرده‌ای و مرتب کرده‌ای.",
    empty: "دفترچه‌ات خالی است.",
    emptyHint: "یک واژه پیدا کن و روی «ذخیره در دفترچه» بزن.",
    goSearch: "بازگشت به جستجو",
  },
  id: {
    title: "Buku Catatanku",
    subtitle: "Setiap kata yang kamu kumpulkan, simpan, dan atur.",
    empty: "Buku catatanmu kosong.",
    emptyHint: "Temukan sebuah kata dan ketuk 'Simpan ke Buku Catatan'.",
    goSearch: "Kembali ke pencarian",
  },
  nl: {
    title: "Mijn notitieboek",
    subtitle: "Elk woord dat je hebt verzameld, opgeslagen en geordend.",
    empty: "Je notitieboek is leeg.",
    emptyHint: "Zoek een woord en tik op 'Opslaan in notitieboek'.",
    goSearch: "Terug naar zoeken",
  },
  he: {
    title: "המחברת שלי",
    subtitle: "כל המילים שאספת, שמורות ומסודרות.",
    empty: "המחברת שלך עדיין ריקה.",
    emptyHint: "מצא מילה וחפש את הכפתור 'שמירה במחברת'.",
    goSearch: "חזרה לחיפוש",
  },
  en: {
    title: "My Notebook",
    subtitle: "Every word you've collected, saved and organized.",
    empty: "Your notebook is empty.",
    emptyHint: "Find a word and tap 'Save to Notebook'.",
    goSearch: "Back to search",
  },
  zu: {
    title: "Ibhuku Lami Lamanothi",
    subtitle: "Wonke amagama owaqoqile, owawagcina nowawahlela.",
    empty: "Ibhuku lakho lamanothi alinalutho.",
    emptyHint: "Thola igama bese uthepha ku-'Gcina Ebhukwini'.",
    goSearch: "Buyela ekusesheni",
  },
  el: {
    title: "Το τετράδιό μου",
    subtitle: "Κάθε λέξη που έχεις συλλέξει, αποθηκευμένη και οργανωμένη.",
    empty: "Το τετράδιό σου είναι άδειο.",
    emptyHint: "Βρες μια λέξη και πάτησε «Αποθήκευση στο τετράδιο».",
    goSearch: "Πίσω στην αναζήτηση",
  },
  ar: {
    title: "دفتر كلماتي",
    subtitle: "كل الكلمات التي جمعتها, محفوظة ومنظمة.",
    empty: "دفترك فارغ.",
    emptyHint: "ابحث عن كلمة واضغط على 'احفظ في الدفتر'.",
    goSearch: "العودة إلى البحث",
  },
  ru: {
    title: "Моя тетрадь",
    subtitle: "Все слова, которые вы собрали, сохранены и упорядочены.",
    empty: "Ваша тетрадь пуста.",
    emptyHint: "Найдите слово и нажмите 'В мою тетрадь'.",
    goSearch: "Вернуться к поиску",
  },
  es: {
    title: "Mi cuaderno",
    subtitle: "Todas las palabras que has recopilado, guardadas y organizadas.",
    empty: "Tu cuaderno está vacío.",
    emptyHint: "Busca una palabra y pulsa 'Guardar en el cuaderno'.",
    goSearch: "Volver a buscar",
  },
  pt: {
    title: "Meu caderno",
    subtitle: "Todas as palavras que você coletou, salvas e organizadas.",
    empty: "Seu caderno está vazio.",
    emptyHint: "Encontre uma palavra e toque em 'Salvar no caderno'.",
    goSearch: "Voltar à busca",
  },
  fr: {
    title: "Mon carnet",
    subtitle: "Tous les mots que vous avez collectés, enregistrés et organisés.",
    empty: "Votre carnet est vide.",
    emptyHint: "Trouvez un mot et touchez 'Enregistrer dans le carnet'.",
    goSearch: "Retour à la recherche",
  },
  de: {
    title: "Mein Notizbuch",
    subtitle: "Alle Wörter, die du gesammelt hast, gespeichert und geordnet.",
    empty: "Dein Notizbuch ist leer.",
    emptyHint: "Such ein Wort und tippe auf 'Im Notizbuch speichern'.",
    goSearch: "Zurück zur Suche",
  },
  cs: {
    title: "Můj sešit",
    subtitle: "Všechna slova, která jsi nasbíral, uložená a uspořádaná.",
    empty: "Tvůj sešit je prázdný.",
    emptyHint: "Najdi slovo a klepni na 'Uložit do sešitu'.",
    goSearch: "Zpět na vyhledávání",
  },
  sk: {
    title: "Môj zošit",
    subtitle: "Všetky slová, ktoré si nazbieral, uložené a usporiadané.",
    empty: "Tvoj zošit je prázdny.",
    emptyHint: "Nájdi slovo a klikni na 'Uložiť do zošita'.",
    goSearch: "Späť na vyhľadávanie",
  },
  hi: {
    title: "मेरी नोटबुक",
    subtitle: "हर शब्द जो आपने सहेजा, संगठित और तैयार।",
    empty: "आपकी नोटबुक ख़ाली है।",
    emptyHint: "कोई शब्द ढूँढें और 'नोटबुक में सहेजें' दबाएँ।",
    goSearch: "खोज पर वापस",
  },
  am: {
    title: "የእኔ ማስታወሻ ደብተር",
    subtitle: "የሰበሰቧቸው ቃላት በሙሉ፣ ተቀምጠው እና ተደራጅተው።",
    empty: "ማስታወሻ ደብተርዎ ባዶ ነው።",
    emptyHint: "ቃል ፈልገው 'ወደ ማስታወሻ ደብተር አስቀምጥ' የሚለውን ይንኩ።",
    goSearch: "ወደ ፍለጋ ተመለስ",
  },
  vi: {
    title: "Sổ tay của tôi",
    subtitle: "Mọi từ đã thu thập, được lưu và sắp xếp gọn gàng.",
    empty: "Sổ tay còn trống.",
    emptyHint: "Tìm một từ rồi nhấn 'Lưu vào Sổ tay'.",
    goSearch: "Quay lại tìm kiếm",
  },
  fil: {
    title: "Aking Kuwaderno",
    subtitle: "Bawat salitang naipon, naka-save at naka-ayos.",
    empty: "Walang laman ang kuwaderno.",
    emptyHint: "Maghanap ng salita at pindutin ang 'I-save sa Kuwaderno'.",
    goSearch: "Bumalik sa paghahanap",
  },
  af: {
    title: "My Notaboek",
    subtitle: "Elke woord wat versamel is, gestoor en georden.",
    empty: "Jou notaboek is leeg.",
    emptyHint: "Vind 'n woord en tik 'Stoor in Notaboek'.",
    goSearch: "Terug na soek",
  },
  sw: {
    title: "Daftari Langu",
    subtitle: "Kila neno lililokusanywa, limehifadhiwa na kupangwa.",
    empty: "Daftari lako ni tupu.",
    emptyHint: "Tafuta neno kisha gusa 'Hifadhi kwenye Daftari'.",
    goSearch: "Rudi kwenye utafutaji",
  },
  "zh-CN": {
    title: "我的笔记本",
    subtitle: "每一个收集的词语，已保存并整理妥当。",
    empty: "笔记本还是空的。",
    emptyHint: "找一个词语，然后点按“保存到笔记本”。",
    goSearch: "返回搜索",
  },
  "zh-TW": {
    title: "我的筆記本",
    subtitle: "每一個收集的詞語，都已儲存並整理妥當。",
    empty: "筆記本還是空的。",
    emptyHint: "找一個詞語，然後點按「儲存至筆記本」。",
    goSearch: "返回搜尋",
  },
  ko: {
    title: "내 단어장",
    subtitle: "모아 둔 모든 단어를 저장하고 정리해 두었습니다.",
    empty: "단어장이 비어 있습니다.",
    emptyHint: "단어를 찾아 '단어장에 저장'을 누르세요.",
    goSearch: "검색으로 돌아가기",
  },
  th: {
    title: "สมุดคำของฉัน",
    subtitle: "ทุกคำที่เก็บรวบรวม บันทึกและจัดเรียงไว้อย่างเป็นระเบียบ",
    empty: "สมุดคำยังว่างอยู่",
    emptyHint: "ค้นหาคำแล้วแตะ 'บันทึกลงสมุดคำ'",
    goSearch: "กลับไปค้นหา",
  },
  bn: {
    title: "আমার নোটবই",
    subtitle: "সংগ্রহ করা প্রতিটি শব্দ, সংরক্ষিত ও সাজানো।",
    empty: "আপনার নোটবই খালি।",
    emptyHint: "একটি শব্দ খুঁজে 'নোটবইয়ে সংরক্ষণ করুন' চাপুন।",
    goSearch: "অনুসন্ধানে ফিরে যান",
  },
  da: {
    title: "Min notesbog",
    subtitle: "Hvert ord, du har samlet, gemt og ordnet.",
    empty: "Din notesbog er tom.",
    emptyHint: "Find et ord, og tryk på 'Gem i notesbog'.",
    goSearch: "Tilbage til søgning",
  },
  hu: {
    title: "Jegyzetfüzetem",
    subtitle: "Minden összegyűjtött szó elmentve és rendszerezve.",
    empty: "A jegyzetfüzet üres.",
    emptyHint: "Keress egy szót, és koppints a 'Mentés a jegyzetfüzetbe' gombra.",
    goSearch: "Vissza a kereséshez",
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
                <img className="wb-lang-flag" src={`https://flagcdn.com/40x30/${l.flag}.png`} srcSet={`https://flagcdn.com/80x60/${l.flag}.png 2x`} width="20" height="15" alt="" loading="lazy" />{l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function NotebookPage() {
  const { user, plan, loading, promptLogin, familyRole } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();
  const href = useHref();
  const c = COPY[lang] ?? COPY.en;
  // In the kids' area the notebook is reframed as a "treasure box" (Gadi
  // 2026-08-12, from the moms' feedback) — same page, warmer name for a kid.
  const isKid = familyRole === "kid";
  const tc = TREASURE_COPY[lang] ?? TREASURE_COPY.en;
  const pageTitle = isKid ? tc.title : c.title;
  const pageSubtitle = isKid ? tc.subtitle : c.subtitle;

  const [items, setItems] = useState<NotebookItem[] | null>(null);
  // Lowercase set of every word the user has cached locally — drives
  // the per-card 'available offline' badge below. Recomputed on mount;
  // V3 doesn't auto-refresh after new caches (next mount is enough).
  const [offlineWords, setOfflineWords] = useState<Set<string>>(new Set());
  // Network status — drives the 'you're offline' banner at the top.
  // Initialised from navigator.onLine and kept fresh via the online /
  // offline events the browser fires.
  const [online, setOnline] = useState<boolean>(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cached = await listRecentCached(2000);
        if (cancelled) return;
        setOfflineWords(new Set(cached.map((c) => c.word.toLowerCase())));
      } catch { /* ignore, best-effort badge */ }
    })();
    return () => { cancelled = true; };
  }, []);
  const [fetchError, setFetchError] = useState<string>("");

  // Auth + tier gate
  useEffect(() => {
    if (loading) return;
    if (!user) {
      promptLogin(c.title);
      return;
    }
    if (plan === "basic") {
      router.replace(href("/pricing"));
    }
  }, [loading, user, plan, c.title, promptLogin, router]);

  // Load notebook contents once authorized
  useEffect(() => {
    if (loading || !user) return;
    if (plan === "basic") return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/notebook", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) {
          setFetchError(`HTTP ${res.status}`);
          return;
        }
        const data = (await res.json()) as { items: NotebookItem[] };
        if (!cancelled) setItems(data.items ?? []);
      } catch (e) {
        if (!cancelled) setFetchError(String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [loading, user, plan]);

  return (
    <div className={`wordbook wb-shell-page${isKid ? " wb-kid-area" : ""}`} dir={dir}>
      {/* Offline banner, top-of-page strip that appears whenever the
          browser thinks the network is down. Tells the user how many
          words they have available locally so 'offline' doesn't feel
          like 'broken'. Hidden the moment we're back online. */}
      {!online && (
        <div className="wb-offline-banner" role="status" aria-live="polite">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 16h.01" />
            <path d="M8.5 16.5a5 5 0 0 1 7 0" />
            <path d="M5 13a10 10 0 0 1 14 0" />
            <path d="M1.5 9.5a15 15 0 0 1 21 0" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
          {lang === "he" ? `אין חיבור לאינטרנט · ${offlineWords.size} מילים זמינות`
            : lang === "ar" ? `لا يوجد اتصال · ${offlineWords.size} كلمات متاحة بدون إنترنت`
            : lang === "ru" ? `Нет интернета · ${offlineWords.size} слов доступны офлайн`
            : lang === "es" ? `Sin conexión · ${offlineWords.size} palabras disponibles offline`
            : lang === "pt" ? `Sem conexão · ${offlineWords.size} palavras disponíveis offline`
            : lang === "fr" ? `Hors ligne · ${offlineWords.size} mots disponibles`
            : lang === "de" ? `Offline · ${offlineWords.size} Wörter verfügbar`
            : lang === "cs" ? `Bez připojení · ${offlineWords.size} slov dostupných offline`
            : lang === "sk" ? `Bez pripojenia · ${offlineWords.size} slov dostupných offline`
            : lang === "it" ? `Offline · ${offlineWords.size} parole disponibili`
            : lang === "ja" ? `オフライン · ${offlineWords.size} 語が利用可能`
            : lang === "hi" ? `ऑफ़लाइन · ${offlineWords.size} शब्द उपलब्ध`
            : `You're offline · ${offlineWords.size} words available`}
        </div>
      )}
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <WbShellNav active="notebook" />
        <div className="wb-shell-actions">
          {isKid && <AppearancePicker scope="kid" />}
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
        {/* Mobile identity cluster, 2026-06-19 redesign. Notebook is
            an authenticated-only surface so user is always defined. */}
        {user && (
          <div className="wb-shell-mobile-identity">
            {/* Kid skin picker on mobile (desktop one is in the hidden
                .wb-shell-actions), Gadi 2026-08-19. */}
            {isKid && <AppearancePicker scope="kid" />}
            <ShareButton
              url="https://www.gadit.app/"
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
            <WbUserMenu />
          </div>
        )}
        <div className="wb-shell-mobile-menu-cluster">
          <LangSwitchMobile />
          <WbShellBurger active="notebook" />
        </div>

      </header>

      <main className="wb-notebook-main">
        <div className="wb-notebook-hero">
          <h1 className="wb-notebook-title">{pageTitle}</h1>
          <p className="wb-notebook-sub">{pageSubtitle}</p>
        </div>

        {items === null && !fetchError && (
          <div className="wb-notebook-loading">…</div>
        )}

        {fetchError && (
          <div className="wb-notebook-error">{fetchError}</div>
        )}

        {items && items.length === 0 && (
          <div className="wb-notebook-empty">
            <p>{c.empty}</p>
            <p className="wb-notebook-empty-hint">{c.emptyHint}</p>
            <Link href={href("/")} className="wb-notebook-cta">
              {c.goSearch}
            </Link>
          </div>
        )}

        {/* Kids gamification header — Family-plan kids only. Streak, weekly
            goal and explorer rank, all from the notebook's own addedAt dates. */}
        {items && items.length > 0 && familyRole === "kid" && (
          <KidsGameHeader
            addedAtDates={items.map((i) => i.addedAt).filter(Boolean)}
            understoodCount={items.filter((i) => i.understood).length}
            lang={lang}
            dir={dir}
          />
        )}

        {items && items.length > 0 && (
          groupByLanguage(items).map(([language, group]) => (
            <section key={language} className="wb-notebook-langsec">
              <h2 className="wb-notebook-langhead">
                <span className="wb-notebook-langname">{language}</span>
                <span className="wb-notebook-langcount">{group.length}</span>
              </h2>
              <ul className="wb-notebook-grid">
                {group.map((item) => {
              const offline = offlineWords.has(item.word.toLowerCase());
              return (
                <li key={item.id} className="wb-notebook-card">
                  <Link
                    href={href(`/word/${encodeURIComponent(item.word)}`)}
                    className="wb-notebook-card-link"
                  >
                    <div className="wb-notebook-card-head">
                      <span className="wb-notebook-card-word">{item.word}</span>
                      <span className="wb-notebook-card-lang">{item.language}</span>
                    </div>
                    {item.meaning && (
                      <p className="wb-notebook-card-meaning">{item.meaning}</p>
                    )}
                    {offline && (
                      <div className="wb-notebook-card-offline" aria-label="Available offline">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {lang === "he" ? "זמין אופליין"
                          : lang === "ar" ? "متاح بدون إنترنت"
                          : lang === "ru" ? "Доступно офлайн"
                          : lang === "es" ? "Sin conexión"
                          : lang === "pt" ? "Offline"
                          : lang === "fr" ? "Hors ligne"
                          : lang === "de" ? "Offline"
                          : lang === "cs" ? "Offline"
                          : lang === "sk" ? "Offline"
                          : lang === "it" ? "Offline"
                          : lang === "ja" ? "オフライン"
                          : lang === "hi" ? "ऑफ़लाइन"
                          : "Offline"}
                      </div>
                    )}
                  </Link>
                </li>
              );
                })}
              </ul>
            </section>
          ))
        )}
      </main>

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href={href("/pricing")}>{v2(lang, "navPricing")}</Link>
        <span>·</span>
        <Link href={href("/privacy")}>{v2(lang, "footerPrivacy")}</Link>
        <span>·</span>
        <Link href={href("/terms")}>{v2(lang, "footerTerms")}</Link>
      </footer>
    </div>
  );
}

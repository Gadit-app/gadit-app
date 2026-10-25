"use client";

/**
 * NotebookPage — Clear/Deep tier. Lists every word the user has saved.
 *
 * CrispTech aesthetic — white page, teal accent. Replaces the V2 navy
 * starscape design that this route had inherited. Each saved word is a
 * compact white card with the word in teal, language tag, and short
 * meaning summary; the card whole-area links to /word/<word>.
 */

import { WaitDots } from "@/components/WaitText";
import { GaditIcon } from "@/components/design/GaditIcon";
import { ToolKidsToggle } from "@/components/design/ToolKidsToggle";
import { wordLangLabel } from "@/components/design/result";
import { planCopy, FREE_NOTEBOOK_MAX } from "@/lib/plan-copy";
import { useEffect, useRef, useState } from "react";
import { LANGUAGES } from "@/lib/i18n";
import { useLangRows, toggleLangGroup } from "@/lib/lang-groups";
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
import { KidsGameHeader, AdultRankLine } from "@/components/design/KidsGameHeader";
import { FamilyLeaderboard } from "@/components/design/FamilyLeaderboard";
import { useHref } from "@/lib/href";
import { listRecentCached } from "@/lib/offline-db";
import { SPELL_T_EXTRA } from "@/lib/spell-i18n";
import { misc } from "@/lib/misc-i18n";
import { ml } from "@/lib/my-lists-i18n";
import { QText } from "@/components/play/QText";

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
  xh: { title: "Amagama am", subtitle: "Lonke igama olifumeneyo, kwindawo enye. Ingqokelela yakho iyaqhubeka ikhula." },
  nso: { title: "Mantšu a ka", subtitle: "Lentšu le lengwe le le lengwe leo o le utollotšego, lefelong le tee. Kgoboketšo ya gago e tšwela pele e gola." },
  tn: { title: "Mafoko a me", subtitle: "Lefoko lengwe le lengwe le o le fitlhetseng, mo lefelong le le lengwe. Kokoanyo ya gago e nna e gola." },
  st: { title: "Mantswe a ka", subtitle: "Lentswe le leng le le leng leo o le fumaneng, sebakeng se le seng. Pokello ya hao e ntse e hola." },
  ts: { title: "Marito ya mina", subtitle: "Rito rin'wana na rin'wana leri u ri kumeke, endhawini yin'we. Nhlengeleto wa wena wu ya emahlweni wu kula." },
  ss: { title: "Emagama ami", subtitle: "Onkhe emagama lowatfolile, endzaweni yinye. Licoco lakho lichubeka likhula." },
  ve: { title: "Maipfi anga", subtitle: "Ipfi ḽiṅwe na ḽiṅwe ḽe na ḽi wana, fhethu huthihi. Tshigwada tshaṋu tshi bvela phanḓa tshi tshi aluwa." },
  nr: { title: "Amezwi wami", subtitle: "Ilizwi ngalinye olifumeneko, endaweni yinye. Iqoqo lakho liragela phambili likhula." },
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
    emptyHint: "Ogni parola che cerchi viene salvata qui automaticamente.",
    goSearch: "Torna alla ricerca",
  },
  ja: {
    title: "マイノート",
    subtitle: "あなたが集めて、保存して、整理したすべての単語。",
    empty: "ノートはまだ空です。",
    emptyHint: "しらべたことばは、すべてここに自動で保存されるよ。",
    goSearch: "検索に戻る",
  },
  uk: {
    title: "Мій зошит",
    subtitle: "Кожне слово, яке ти зібрав, зберіг та впорядкував.",
    empty: "Твій зошит порожній.",
    emptyHint: "Кожне слово, яке ти шукаєш, автоматично зберігається тут.",
    goSearch: "Назад до пошуку",
  },
  tr: {
    title: "Defterim",
    subtitle: "Topladığın, kaydettiğin ve düzenlediğin her kelime.",
    empty: "Defterin boş.",
    emptyHint: "Aradığın her kelime buraya otomatik olarak kaydedilir.",
    goSearch: "Aramaya dön",
  },
  pl: {
    title: "Mój zeszyt",
    subtitle: "Każde słowo, które zebrałeś, zapisałeś i uporządkowałeś.",
    empty: "Twój zeszyt jest pusty.",
    emptyHint: "Każde słowo, którego szukasz, zapisuje się tutaj automatycznie.",
    goSearch: "Powrót do wyszukiwania",
  },
  fa: {
    title: "دفترچه من",
    subtitle: "هر واژه‌ای که جمع کرده‌ای، ذخیره کرده‌ای و مرتب کرده‌ای.",
    empty: "دفترچه‌ات خالی است.",
    emptyHint: "هر واژه‌ای که جستجو می‌کنی، خودکار اینجا ذخیره می‌شود.",
    goSearch: "بازگشت به جستجو",
  },
  id: {
    title: "Buku Catatanku",
    subtitle: "Setiap kata yang kamu kumpulkan, simpan, dan atur.",
    empty: "Buku catatanmu kosong.",
    emptyHint: "Setiap kata yang kamu cari otomatis disimpan di sini.",
    goSearch: "Kembali ke pencarian",
  },
  nl: {
    title: "Mijn notitieboek",
    subtitle: "Elk woord dat je hebt verzameld, opgeslagen en geordend.",
    empty: "Je notitieboek is leeg.",
    emptyHint: "Elk woord dat je opzoekt, wordt hier automatisch opgeslagen.",
    goSearch: "Terug naar zoeken",
  },
  he: {
    title: "המחברת שלי",
    subtitle: "כל המילים שאספתם, שמורות ומסודרות.",
    empty: "המחברת שלכם עדיין ריקה.",
    emptyHint: "כל מילה שתחפשו נשמרת כאן לבד.",
    goSearch: "חזרה לחיפוש",
  },
  en: {
    title: "My Notebook",
    subtitle: "Every word you've collected, saved and organized.",
    empty: "Your notebook is empty.",
    emptyHint: "Every word you look up is saved here automatically.",
    goSearch: "Back to search",
  },
  zu: {
    title: "Ibhuku Lami Lamanothi",
    subtitle: "Wonke amagama owaqoqile, owawagcina nowawahlela.",
    empty: "Ibhuku lakho lamanothi alinalutho.",
    emptyHint: "Wonke amagama owabhekayo agcinwa lapha ngokuzenzakalela.",
    goSearch: "Buyela ekusesheni",
  },
  xh: {
    title: "Incwadi yam",
    subtitle: "Lonke igama oliqokeleleyo, ligciniwe kwaye licwangcisiwe.",
    empty: "Incwadi yakho ayinanto.",
    emptyHint: "Onke amagama owakhangelayo agcinwa apha ngokuzenzekelayo.",
    goSearch: "Buyela ekukhangeleni",
  },
  nso: {
    title: "Puku ya ka ya mantšu",
    subtitle: "Lentšu le lengwe le le lengwe leo o le kgobokeditšego, le bolokilwe, le rulagantšwe.",
    empty: "Puku ya gago ga e na selo.",
    emptyHint: "Lentšu le lengwe le le lengwe leo o le nyakago le bolokwa mo ka go iketla.",
    goSearch: "Boela go nyakeng",
  },
  tn: {
    title: "Bukana ya me",
    subtitle: "Lefoko lengwe le lengwe le o le kokoantseng, le bolokilwe, le rulagantswe.",
    empty: "Bukana ya gago ga e na sepe.",
    emptyHint: "Lefoko lengwe le lengwe le o le batlang le bolokwa fano ka bolona.",
    goSearch: "Boela kwa patlong",
  },
  st: {
    title: "Bukana ya Ka",
    subtitle: "Lentswe le leng le le leng leo o le bokeletseng, le bolokilwe le hlophisitswe.",
    empty: "Bukana ya hao ha e na letho.",
    emptyHint: "Lentsoe le leng le le leng leo o le shebang le bolokoa mona ka bohona.",
    goSearch: "Kgutlela patlong",
  },
  ts: {
    title: "Buku ya mina ya marito",
    subtitle: "Rito rin'wana na rin'wana leri u ri hlengeleteke, ri hlayisiwile naswona ri hleriwile.",
    empty: "Buku ya wena ya marito a yi na nchumu.",
    emptyHint: "Rito rin'wana ni rin'wana leri u ri lavaka ri hlayisiwa laha hi ku tisungulela.",
    goSearch: "Tlhelela eka ku lava",
  },
  ss: {
    title: "Incwadzi Yami",
    subtitle: "Onkhe emagama lowabutsile, agciniwe futsi ahlelekile.",
    empty: "Incwadzi yakho ayinalutfo.",
    emptyHint: "Onkhe emagama lowawabhekako agcinwa lapha ngokuzenzakalela.",
    goSearch: "Buyela ekuseshweni",
  },
  ve: {
    title: "Bugu yanga",
    subtitle: "Ipfi ḽiṅwe na ḽiṅwe ḽe na ḽi kuvhanganya, ḽo vhulungwa nahone ḽo dzudzanywa.",
    empty: "Bugu yaṋu a i na tshithu.",
    emptyHint: "Ipfi linwe na linwe line wa li ṱoḓa li vhulungwa hafha nga u tou ḓiita.",
    goSearch: "Humelani kha u ṱoḓa",
  },
  nr: {
    title: "Ibhuku Lami Lamezwi",
    subtitle: "Ilizwi ngalinye olibuthileko, libulungiwe begodu lihlelekile.",
    empty: "Ibhuku lakho alinalitho.",
    emptyHint: "Woke amagama owawadingayo agcinwa lapha ngokuzenzakalela.",
    goSearch: "Buyela ekufuneni",
  },
  el: {
    title: "Το τετράδιό μου",
    subtitle: "Κάθε λέξη που έχεις συλλέξει, αποθηκευμένη και οργανωμένη.",
    empty: "Το τετράδιό σου είναι άδειο.",
    emptyHint: "Κάθε λέξη που ψάχνεις αποθηκεύεται εδώ αυτόματα.",
    goSearch: "Πίσω στην αναζήτηση",
  },
  ar: {
    title: "دفتر كلماتي",
    subtitle: "كل الكلمات التي جمعتها, محفوظة ومنظمة.",
    empty: "دفترك فارغ.",
    emptyHint: "كل كلمة تبحث عنها تُحفَظ هنا تلقائيًا.",
    goSearch: "العودة إلى البحث",
  },
  ru: {
    title: "Моя тетрадь",
    subtitle: "Все слова, которые вы собрали, сохранены и упорядочены.",
    empty: "Ваша тетрадь пуста.",
    emptyHint: "Каждое слово, которое ты ищешь, автоматически сохраняется здесь.",
    goSearch: "Вернуться к поиску",
  },
  es: {
    title: "Mi cuaderno",
    subtitle: "Todas las palabras que has recopilado, guardadas y organizadas.",
    empty: "Tu cuaderno está vacío.",
    emptyHint: "Cada palabra que buscas se guarda aquí automáticamente.",
    goSearch: "Volver a buscar",
  },
  pt: {
    title: "Meu caderno",
    subtitle: "Todas as palavras que você coletou, salvas e organizadas.",
    empty: "Seu caderno está vazio.",
    emptyHint: "Cada palavra que procuras é guardada aqui automaticamente.",
    goSearch: "Voltar à busca",
  },
  fr: {
    title: "Mon carnet",
    subtitle: "Tous les mots que vous avez collectés, enregistrés et organisés.",
    empty: "Votre carnet est vide.",
    emptyHint: "Chaque mot que tu cherches est enregistré ici automatiquement.",
    goSearch: "Retour à la recherche",
  },
  de: {
    title: "Mein Notizbuch",
    subtitle: "Alle Wörter, die du gesammelt hast, gespeichert und geordnet.",
    empty: "Dein Notizbuch ist leer.",
    emptyHint: "Jedes Wort, das du nachschlägst, wird hier automatisch gespeichert.",
    goSearch: "Zurück zur Suche",
  },
  cs: {
    title: "Můj sešit",
    subtitle: "Všechna slova, která jsi nasbíral, uložená a uspořádaná.",
    empty: "Tvůj sešit je prázdný.",
    emptyHint: "Každé slovo, které vyhledáš, se sem automaticky uloží.",
    goSearch: "Zpět na vyhledávání",
  },
  sk: {
    title: "Môj zošit",
    subtitle: "Všetky slová, ktoré si nazbieral, uložené a usporiadané.",
    empty: "Tvoj zošit je prázdny.",
    emptyHint: "Každé slovo, ktoré vyhľadáš, sa sem automaticky uloží.",
    goSearch: "Späť na vyhľadávanie",
  },
  hi: {
    title: "मेरी नोटबुक",
    subtitle: "हर शब्द जो आपने सहेजा, संगठित और तैयार।",
    empty: "आपकी नोटबुक ख़ाली है।",
    emptyHint: "तुम जो भी शब्द खोजते हो, वह अपने आप यहाँ सेव हो जाता है।",
    goSearch: "खोज पर वापस",
  },
  am: {
    title: "የእኔ ማስታወሻ ደብተር",
    subtitle: "የሰበሰቧቸው ቃላት በሙሉ፣ ተቀምጠው እና ተደራጅተው።",
    empty: "ማስታወሻ ደብተርዎ ባዶ ነው።",
    emptyHint: "የምትፈልገው እያንዳንዱ ቃል እዚህ በራሱ ይቀመጣል።",
    goSearch: "ወደ ፍለጋ ተመለስ",
  },
  vi: {
    title: "Sổ tay của tôi",
    subtitle: "Mọi từ đã thu thập, được lưu và sắp xếp gọn gàng.",
    empty: "Sổ tay còn trống.",
    emptyHint: "Mỗi từ bạn tra đều được tự động lưu ở đây.",
    goSearch: "Quay lại tìm kiếm",
  },
  fil: {
    title: "Aking Kuwaderno",
    subtitle: "Bawat salitang naipon, naka-save at naka-ayos.",
    empty: "Walang laman ang kuwaderno.",
    emptyHint: "Awtomatikong nase-save rito ang bawat salitang hinahanap mo.",
    goSearch: "Bumalik sa paghahanap",
  },
  af: {
    title: "My Notaboek",
    subtitle: "Elke woord wat versamel is, gestoor en georden.",
    empty: "Jou notaboek is leeg.",
    emptyHint: "Elke woord wat jy opsoek, word outomaties hier gestoor.",
    goSearch: "Terug na soek",
  },
  sw: {
    title: "Daftari Langu",
    subtitle: "Kila neno lililokusanywa, limehifadhiwa na kupangwa.",
    empty: "Daftari lako ni tupu.",
    emptyHint: "Kila neno unalotafuta huhifadhiwa hapa moja kwa moja.",
    goSearch: "Rudi kwenye utafutaji",
  },
  "zh-CN": {
    title: "我的笔记本",
    subtitle: "每一个收集的词语，已保存并整理妥当。",
    empty: "笔记本还是空的。",
    emptyHint: "你查过的每个词都会自动保存在这里。",
    goSearch: "返回搜索",
  },
  "zh-TW": {
    title: "我的筆記本",
    subtitle: "每一個收集的詞語，都已儲存並整理妥當。",
    empty: "筆記本還是空的。",
    emptyHint: "你查過的每個詞都會自動保存在這裡。",
    goSearch: "返回搜尋",
  },
  ko: {
    title: "내 단어장",
    subtitle: "모아 둔 모든 단어를 저장하고 정리해 두었습니다.",
    empty: "단어장이 비어 있습니다.",
    emptyHint: "네가 찾아본 모든 단어는 여기에 자동으로 저장돼.",
    goSearch: "검색으로 돌아가기",
  },
  th: {
    title: "สมุดคำของฉัน",
    subtitle: "ทุกคำที่เก็บรวบรวม บันทึกและจัดเรียงไว้อย่างเป็นระเบียบ",
    empty: "สมุดคำยังว่างอยู่",
    emptyHint: "ทุกคำที่คุณค้นหาจะถูกบันทึกที่นี่โดยอัตโนมัติ",
    goSearch: "กลับไปค้นหา",
  },
  bn: {
    title: "আমার নোটবই",
    subtitle: "সংগ্রহ করা প্রতিটি শব্দ, সংরক্ষিত ও সাজানো।",
    empty: "আপনার নোটবই খালি।",
    emptyHint: "তুমি যে শব্দই খোঁজো, তা এখানে নিজে থেকেই সেভ হয়ে যায়।",
    goSearch: "অনুসন্ধানে ফিরে যান",
  },
  da: {
    title: "Min notesbog",
    subtitle: "Hvert ord, du har samlet, gemt og ordnet.",
    empty: "Din notesbog er tom.",
    emptyHint: "Hvert ord, du slår op, bliver automatisk gemt her.",
    goSearch: "Tilbage til søgning",
  },
  hu: {
    title: "Jegyzetfüzetem",
    subtitle: "Minden összegyűjtött szó elmentve és rendszerezve.",
    empty: "A jegyzetfüzet üres.",
    emptyHint: "Minden szó, amire rákeresel, automatikusan ide lesz mentve.",
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
  const langRows = useLangRows(lang);
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
          {langRows.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                className={l.code === lang ? "is-active" : ""}
                onClick={() => { if (toggleLangGroup(l.code)) return; setLang(l.code); setOpen(false); }}
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

// "הכתבות" (Dictations) section — a kid's saved spelling-practice series, kept
// SEPARATE from "My words" so they can re-practice a whole set (especially the
// words they missed). Gadi 2026-09-19. Small he/en dict, English fallback.
type DictSet = {
  setId: string;
  title: string;
  icon: string;
  direction?: string;
  words?: Array<{ en: string; he: string }>;
  timesPracticed?: number;
  lastScore?: number;
  lastTotal?: number;
};

/** Games that open on one notebook word (see FOCUS_GAMES in /play). */
const PRACTICE_GAMES = ["flashcards", "flashdefs", "quiz", "memory", "anagram"] as const;
type PracticeCopy = { practice: string; flashcards: string; flashdefs: string; quiz: string; memory: string; anagram: string };
const PRACTICE_COPY: Record<string, PracticeCopy> = {
  he: { practice: "תרגול", flashcards: "כרטיסיות מילים", flashdefs: "כרטיסיות הגדרות", quiz: "חידון הגדרות", memory: "משחק זיכרון", anagram: "ערבול אותיות" },
  en: { practice: "Practice", flashcards: "Word cards", flashdefs: "Definition cards", quiz: "Definition quiz", memory: "Memory game", anagram: "Letter scramble" },
  ar: { practice: "تدريب", flashcards: "بطاقات الكلمات", flashdefs: "بطاقات التعريفات", quiz: "اختبار التعريفات", memory: "لعبة الذاكرة", anagram: "خلط الحروف" },
  ru: { practice: "Тренировка", flashcards: "Карточки слов", flashdefs: "Карточки значений", quiz: "Викторина", memory: "Игра на память", anagram: "Анаграмма" },
  es: { practice: "Practicar", flashcards: "Tarjetas de palabras", flashdefs: "Tarjetas de definiciones", quiz: "Quiz de definiciones", memory: "Memoria", anagram: "Letras revueltas" },
  pt: { practice: "Praticar", flashcards: "Cartões de palavras", flashdefs: "Cartões de definições", quiz: "Quiz de definições", memory: "Jogo da memória", anagram: "Letras embaralhadas" },
  fr: { practice: "S’entraîner", flashcards: "Cartes de mots", flashdefs: "Cartes de définitions", quiz: "Quiz des définitions", memory: "Memory", anagram: "Lettres mélangées" },
  de: { practice: "Üben", flashcards: "Wortkarten", flashdefs: "Definitionskarten", quiz: "Definitionsquiz", memory: "Memory", anagram: "Buchstabensalat" },
  cs: { practice: "Procvičit", flashcards: "Kartičky slov", flashdefs: "Kartičky významů", quiz: "Kvíz definic", memory: "Pexeso", anagram: "Přesmyčky" },
  sk: { practice: "Precvičiť", flashcards: "Kartičky slov", flashdefs: "Kartičky významov", quiz: "Kvíz definícií", memory: "Pexeso", anagram: "Presmyčky" },
  it: { practice: "Esercitati", flashcards: "Carte delle parole", flashdefs: "Carte delle definizioni", quiz: "Quiz delle definizioni", memory: "Memory", anagram: "Lettere mescolate" },
  ja: { practice: "練習", flashcards: "単語カード", flashdefs: "意味カード", quiz: "意味クイズ", memory: "神経衰弱", anagram: "文字ならべかえ" },
  hi: { practice: "अभ्यास", flashcards: "शब्द कार्ड", flashdefs: "अर्थ कार्ड", quiz: "परिभाषा क्विज़", memory: "मेमोरी मैच", anagram: "अक्षर पहेली" },
  am: { practice: "ልምምድ", flashcards: "የቃል ካርዶች", flashdefs: "የትርጉም ካርዶች", quiz: "የትርጓሜ ኩዊዝ", memory: "የማስታወስ ጨዋታ", anagram: "የፊደላት እንቆቅልሽ" },
  uk: { practice: "Тренування", flashcards: "Картки слів", flashdefs: "Картки значень", quiz: "Вікторина значень", memory: "Гра на пам'ять", anagram: "Переплутані літери" },
  tr: { practice: "Pratik", flashcards: "Kelime kartları", flashdefs: "Anlam kartları", quiz: "Anlam testi", memory: "Hafıza oyunu", anagram: "Harf karmaşası" },
  pl: { practice: "Ćwicz", flashcards: "Karty słów", flashdefs: "Karty znaczeń", quiz: "Quiz znaczeń", memory: "Memory", anagram: "Pomieszane litery" },
  fa: { practice: "تمرین", flashcards: "کارت‌های واژه", flashdefs: "کارت‌های معنا", quiz: "مسابقه‌ی معنی", memory: "بازی حافظه", anagram: "حروف درهم" },
  id: { practice: "Latihan", flashcards: "Kartu kata", flashdefs: "Kartu definisi", quiz: "Kuis arti", memory: "Pasangan memori", anagram: "Acak huruf" },
  nl: { practice: "Oefenen", flashcards: "Woordkaarten", flashdefs: "Betekeniskaarten", quiz: "Betekenisquiz", memory: "Memory", anagram: "Letterhusselaar" },
  el: { practice: "Εξάσκηση", flashcards: "Κάρτες λέξεων", flashdefs: "Κάρτες σημασιών", quiz: "Κουίζ ορισμών", memory: "Παιχνίδι μνήμης", anagram: "Ανακάτεμα γραμμάτων" },
  zu: { practice: "Zijwayeze", flashcards: "Amakhadi amagama", flashdefs: "Amakhadi ezincazelo", quiz: "Uvivinyo lwezincazelo", memory: "Umdlalo wenkumbulo", anagram: "Ukuxutshwa kwezinhlamvu" },
  xh: { practice: "Ziqhelise", flashcards: "Amakhadi amagama", flashdefs: "Amakhadi eentsingiselo", quiz: "Imibuzo yeentsingiselo", memory: "Umdlalo wenkumbulo", anagram: "Hlengahlengisa oonobumba" },
  nso: { practice: "Tlwaetšo", flashcards: "Dikarata tša mantšu", flashdefs: "Dikarata tša ditlhalošo", quiz: "Tlhahlobo ya ditlhalošo", memory: "Papadi ya go gopola", anagram: "Hlakantšha ditlhaka" },
  tn: { practice: "Ikatise", flashcards: "Dikarata tsa mafoko", flashdefs: "Dikarata tsa ditlhaloso", quiz: "Tlhatlhobo ya ditlhaloso", memory: "Motshameko wa go gopola", anagram: "Ditlhaka tse di tlhakantsweng" },
  st: { practice: "Boikwetliso", flashcards: "Dikarete tsa mantswe", flashdefs: "Dikarete tsa ditlhaloso", quiz: "Kwisi ya ditlhaloso", memory: "Papadi ya mohopolo", anagram: "Ho kopanya ditlhaku" },
  ts: { practice: "Ntoloveto", flashcards: "Makhadi ya marito", flashdefs: "Makhadi ya tinhlamuselo", quiz: "Mavutiso ya tinhlamuselo", memory: "Ntlangu wa ku tsundzuka", anagram: "Hlela maletere" },
  ss: { practice: "Ticecesha", flashcards: "Emakhadi emagama", flashdefs: "Emakhadi etinchazelo", quiz: "Imibuto yetinchazelo", memory: "Umdlalo wenkhumbulo", anagram: "Hlela tinhlamvu" },
  ve: { practice: "Nḓowelo", flashcards: "Garaṱa dza maipfi", flashdefs: "Garaṱa dza ṱhalutshedzo", quiz: "Mbudziso dza ṱhalutshedzo", memory: "Mutambo wa u humbula", anagram: "Ḽeḓere dzo ṱanganyiswaho" },
  nr: { practice: "Zilolonge", flashcards: "Amakarada wamezwi", flashdefs: "Amakarada weenhlathululo", quiz: "Ikhwizi yeenhlathululo", memory: "Umdlalo wokukhumbula", anagram: "Hlela amalembu" },
  vi: { practice: "Luyện tập", flashcards: "Thẻ từ", flashdefs: "Thẻ nghĩa", quiz: "Đố nghĩa của từ", memory: "Lật thẻ ghi nhớ", anagram: "Xáo trộn chữ cái" },
  fil: { practice: "Magsanay", flashcards: "Mga card ng salita", flashdefs: "Mga card ng kahulugan", quiz: "Quiz ng kahulugan", memory: "Memory match", anagram: "Gulong letra" },
  af: { practice: "Oefen", flashcards: "Woordkaarte", flashdefs: "Betekeniskaarte", quiz: "Betekenisvasvra", memory: "Geheuespel", anagram: "Letterdeurmekaar" },
  sw: { practice: "Fanya mazoezi", flashcards: "Kadi za maneno", flashdefs: "Kadi za maana", quiz: "Chemsha bongo ya maana", memory: "Mchezo wa kumbukumbu", anagram: "Herufi zilizochanganyika" },
  "zh-CN": { practice: "练习", flashcards: "单词卡", flashdefs: "释义卡", quiz: "词义问答", memory: "记忆配对", anagram: "字母大乱斗" },
  "zh-TW": { practice: "練習", flashcards: "單字卡", flashdefs: "釋義卡", quiz: "詞義問答", memory: "記憶配對", anagram: "字母大亂鬥" },
  ko: { practice: "연습", flashcards: "단어 카드", flashdefs: "뜻 카드", quiz: "뜻 맞히기 퀴즈", memory: "기억력 짝 맞추기", anagram: "글자 뒤섞기" },
  th: { practice: "ฝึก", flashcards: "การ์ดคำศัพท์", flashdefs: "การ์ดความหมาย", quiz: "ทายความหมาย", memory: "จับคู่ความจำ", anagram: "สลับตัวอักษร" },
  bn: { practice: "অনুশীলন", flashcards: "শব্দ কার্ড", flashdefs: "অর্থ কার্ড", quiz: "অর্থের কুইজ", memory: "স্মৃতির জোড়া", anagram: "অক্ষরের গোলমাল" },
  da: { practice: "Øv", flashcards: "Ordkort", flashdefs: "Betydningskort", quiz: "Betydningsquiz", memory: "Vendespil", anagram: "Bogstavrod" },
  hu: { practice: "Gyakorlás", flashcards: "Szókártyák", flashdefs: "Jelentéskártyák", quiz: "Jelentéskvíz", memory: "Memóriajáték", anagram: "Betűkavaró" },
};

export function NotebookPage() {
  const { user, plan, planReady, loading, promptLogin, familyRole, familyId } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();
  const href = useHref();
  const c = COPY[lang] ?? COPY.en;
  // "Practice this word" (Gadi 2026-10-09): games open on one word. The
  // games page needs a paid plan, so the button shows only there.
  const pc = PRACTICE_COPY[lang] ?? PRACTICE_COPY.en;
  const canPlay = plan === "deep";
  const [practiceOpen, setPracticeOpen] = useState<string | null>(null);
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
  // Starts true on BOTH server and client: Node has a global navigator with
  // no onLine, so the server rendered the offline banner and every notebook
  // load threw a hydration error (React #418, QA 2026-10-07). The real value
  // is read after mount.
  const [online, setOnline] = useState<boolean>(true);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the browser's real status once after mount
    if (navigator.onLine === false) setOnline(false);
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
    // Wait for the plan to actually resolve. `loading` only covers Firebase
    // auth; `plan` defaults to "basic" until the Firestore snapshot lands, so
    // without this a paying subscriber gets bounced to /pricing for a beat.
    // Free accounts have a notebook too, up to FREE_NOTEBOOK_MAX words
    // (Gadi 2026-10-06), so nobody is sent away from here any more.
  }, [loading, planReady, user, plan, c.title, promptLogin, router, href]);

  // Load notebook contents once authorized
  useEffect(() => {
    if (loading || !user) return;
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

  // Saved dictation sets (spelling-practice series) — shown under "הכתבות",
  // separate from the words grid. Best-effort; empty on any failure.
  const [dictSets, setDictSets] = useState<DictSet[]>([]);
  // Deleting a word from the notebook, with a one-tap confirmation.
  const [confirmDelWord, setConfirmDelWord] = useState("");
  async function deleteWord(id: string) {
    setConfirmDelWord("");
    if (!user) return;
    setItems((cur) => (cur ? cur.filter((i) => i.id !== id) : cur));
    try {
      await fetch("/api/notebook?id=" + encodeURIComponent(id), { method: "DELETE", headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
    } catch { /* removed on this screen */ }
  }
  useEffect(() => {
    if (loading || !user) return;
    if (plan === "basic") return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/dictation-sets", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { sets?: DictSet[] };
        if (!cancelled && Array.isArray(data.sets)) setDictSets(data.sets);
      } catch { /* best-effort */ }
    })();
    return () => { cancelled = true; };
  }, [loading, user, plan]);
  const allLabel = SPELL_T_EXTRA[lang]?.allFilter
    ?? (lang === "he" ? "הכול" : lang === "ar" ? "الكل" : lang === "ru" ? "Все" : "All");

  // Language filter (Gadi 2026-09-19): when a kid has words in several
  // languages, let them narrow to one. "" = show all.
  const [langFilter, setLangFilter] = useState<string>("");
  const groups = items && items.length > 0 ? groupByLanguage(items) : [];
  const availableLangs = groups.map(([language]) => language);
  const visibleGroups = langFilter ? groups.filter(([language]) => language === langFilter) : groups;

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
          {misc("offlineBanner", lang, offlineWords.size)}
        </div>
      )}
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <ToolKidsToggle />
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
        {/* Burger FIRST so the RTL language switcher never pushes it off the
            left edge (same fix as the word page, Gadi 2026-09-19). */}
        <div className="wb-shell-mobile-menu-cluster">
          <WbShellBurger active="notebook" />
          <LangSwitchMobile />
        </div>

      </header>

      <main className="wb-notebook-main">
        <div className="wb-notebook-hero">
          <h1 className="wb-notebook-title"><GaditIcon name="notebook" size={48} className="wb-title-icon is-3d" />{pageTitle}</h1>
          <p className="wb-notebook-sub">{pageSubtitle}</p>
          {/* Smart practice (spaced repetition) lives at /practice; it had no
              way in from the notebook (Gadi 2026-10-06). Full plans only. */}
          {plan === "deep" && items && items.length > 0 && (
            <Link href={href("/practice")} className="wb-notebook-practice">{v2(lang, "notebookPracticeNow")}</Link>
          )}
        </div>

        {/* Free notebook (Gadi 2026-10-06): how full it is, and the plan
            that saves every word. */}
        {plan === "basic" && planReady && items && (
          <div className="wb-notebook-free" role="note">
            {/* Inside the Play / iOS app: only the count, no plan name or link
                (store rules; .gd-buy / .gd-play-only). */}
            {items.length >= FREE_NOTEBOOK_MAX ? (
              <>
                <span className="gd-buy">{planCopy(lang, "nbFreeFull", { max: FREE_NOTEBOOK_MAX })}</span>
                <span className="gd-play-only">{planCopy(lang, "nbFreeCount", { n: items.length, max: FREE_NOTEBOOK_MAX })}</span>
              </>
            ) : (
              <span>{planCopy(lang, "nbFreeCount", { n: items.length, max: FREE_NOTEBOOK_MAX })}</span>
            )}
            <Link href={href("/pricing")} className="wb-notebook-free-cta gd-buy">{planCopy(lang, "nbFreeCta")}</Link>
          </div>
        )}

        {items === null && !fetchError && (
          <div className="wb-notebook-loading"><WaitDots className="gd-wait-big" /></div>
        )}

        {fetchError && (
          <div className="wb-notebook-error">{fetchError}</div>
        )}

        {items && items.length === 0 && dictSets.length === 0 && (
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
            lang={lang}
            dir={dir}
          />
        )}

        {/* The rank for grown ups (Gadi 2026-10-18, a full card 2026-10-19):
            parents and Individual subscribers see their rank and the ladder here. */}
        {items && items.length > 0 && user && familyRole !== "kid" && (
          <AdultRankLine
            addedAtDates={items.map((i) => i.addedAt).filter(Boolean)}
            lang={lang}
            dir={dir}
          />
        )}

        {/* Family leaderboard (Gadi 2026-10-17): a kid (or a paired second
            parent) sees their whole family's board here; the owner sees it
            on /family. Hides itself outside a family. */}
        {familyId && user && familyId !== user.uid && (
          <FamilyLeaderboard lang={lang} dir={dir} />
        )}

        {/* הכתבות — saved spelling-practice series, ABOVE the words grid so a
            kid can jump straight back into a set (especially the missed words).
            Kept separate from "My words" by design (Gadi 2026-09-19). */}
        {dictSets.length > 0 && (
          // "My practice" lives in Homework (Gadi 2026-10-15: the notebook is
          // a place of its own); a short way there.
          <Link href={href("/homework?v=dict")} className="wb-dict-again" style={{ display: "inline-flex", alignItems: "center", gap: 6, margin: "4px 0 14px", fontWeight: 700 }}>
            {ml("myPractices", lang)} ({dictSets.length}) →
          </Link>
        )}

        {/* Language filter — only when there's more than one language to pick. */}
        {availableLangs.length > 1 && (
          <div className="wb-nb-filter" role="group">
            <button
              type="button"
              className="wb-nb-filter-chip"
              aria-pressed={langFilter === ""}
              onClick={() => setLangFilter("")}
            >
              {allLabel}
            </button>
            {availableLangs.map((language) => (
              <button
                key={language}
                type="button"
                className="wb-nb-filter-chip"
                aria-pressed={langFilter === language}
                onClick={() => setLangFilter(language)}
              >
                {wordLangLabel(language, lang)}
              </button>
            ))}
          </div>
        )}

        {items && items.length > 0 && (
          visibleGroups.map(([language, group]) => (
            <section key={language} className="wb-notebook-langsec">
              <h2 className="wb-notebook-langhead">
                <span className="wb-notebook-langname">{wordLangLabel(language, lang)}</span>
                <span className="wb-notebook-langcount">{group.length}</span>
              </h2>
              <ul className="wb-notebook-grid">
                {group.map((item) => {
              const offline = offlineWords.has(item.word.toLowerCase());
              return (
                <li key={item.id} className="wb-notebook-card" style={{ position: "relative" }}>
                  <Link
                    href={href(`/word/${encodeURIComponent(item.word)}?from=${encodeURIComponent(href("/notebook"))}`)}
                    className="wb-notebook-card-link"
                  >
                    <div className="wb-notebook-card-head">
                      <span className="wb-notebook-card-word">{item.word}</span>
                      <span className="wb-notebook-card-lang">{wordLangLabel(item.language, lang)}</span>
                    </div>
                    {item.meaning && (
                      <p className="wb-notebook-card-meaning">
                        {/* Every word of the meaning is tappable; the rest of the
                            card still opens the word page. A tapped word must not
                            follow the card's <a>, so its default is prevented. */}
                        <span onClickCapture={(e) => { if ((e.target as Element).closest?.(".wb-q-word")) e.preventDefault(); }}>
                          <QText text={item.meaning} />
                        </span>
                      </p>
                    )}
                    {offline && (
                      <div className="wb-notebook-card-offline" aria-label="Available offline">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {misc("offlineBadge", lang)}
                      </div>
                    )}
                  </Link>
                  <button
                    type="button"
                    className="wb-nb-del"
                    aria-label={ml("delWord", lang)}
                    title={ml("delWord", lang)}
                    onClick={() => setConfirmDelWord(confirmDelWord === item.id ? "" : item.id)}
                    style={{ position: "absolute", top: 8, insetInlineEnd: 8, width: 30, height: 30, borderRadius: 9, border: "1px solid var(--hairline,#E5E7EB)", background: "var(--surface,#fff)", color: "#B91C1C", cursor: "pointer", display: "grid", placeItems: "center", zIndex: 2 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></svg>
                  </button>
                  {confirmDelWord === item.id && (
                    <div role="alert" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, margin: "0 12px 10px", padding: "8px 10px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FCD4D4", color: "#7F1D1D", fontSize: 13.5 }}>
                      <span style={{ flex: 1, minWidth: 120 }}>{ml("confirmDelWord", lang, { w: item.word })}</span>
                      <button type="button" onClick={() => void deleteWord(item.id)} style={{ padding: "7px 12px", borderRadius: 9, border: "none", background: "#B91C1C", color: "#fff", fontWeight: 700, cursor: "pointer" }}>{ml("yesDel", lang)}</button>
                      <button type="button" onClick={() => setConfirmDelWord("")} style={{ padding: "7px 10px", borderRadius: 9, border: "1px solid #FCD4D4", background: "transparent", color: "#7F1D1D", cursor: "pointer" }}>{ml("cancel", lang)}</button>
                    </div>
                  )}
                  {canPlay && (
                    <div className="wb-nb-practice">
                      <button
                        type="button"
                        className="wb-nb-practice-btn"
                        aria-expanded={practiceOpen === item.id}
                        onClick={() => setPracticeOpen((cur) => (cur === item.id ? null : item.id))}
                      >
                        {pc.practice}
                      </button>
                      {practiceOpen === item.id && (
                        <div className="wb-nb-practice-games">
                          {PRACTICE_GAMES.filter((g) => g !== "anagram" || !item.word.trim().includes(" ")).map((g) => (
                            <Link
                              key={g}
                              className="wb-nb-practice-game"
                              href={href(`/play?game=${g}&word=${encodeURIComponent(item.word)}`)}
                            >
                              {pc[g]}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
        <span className="gd-buy">·</span>
        <Link href={href("/pricing")} className="gd-buy">{v2(lang, "navPricing")}</Link>
        <span>·</span>
        <Link href={href("/privacy")}>{v2(lang, "footerPrivacy")}</Link>
        <span>·</span>
        <Link href={href("/terms")}>{v2(lang, "footerTerms")}</Link>
      </footer>
    </div>
  );
}

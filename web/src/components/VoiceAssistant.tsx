"use client";

/**
 * Hands-free voice assistant (Gadi 2026-08-17). Once turned on (one tap to
 * grant the mic), it listens continuously while Gadit is open and in the
 * foreground. A kid or parent can just say, from across the room:
 *   "Gadit, what is nuance?"  ·  "גדית, מה זה תום?"
 * and Gadit opens that word and reads the definition aloud, then keeps
 * listening for the next question. No per-question tapping, like a home
 * assistant, for as long as the tab stays open.
 *
 * Uses the browser's Web Speech API (continuous SpeechRecognition) — free,
 * real-time, no server round-trip for the listening. The spoken answer reuses
 * the word page's /api/tts. A true always-on "Hey Gadit" with the tab in the
 * background needs the native app; a browser can't listen in the background.
 *
 * Gated to paying users (Clear / Deep / Family) and to browsers that support
 * SpeechRecognition (Chrome / Edge / Safari). Hidden otherwise.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";

// Minimal Web Speech API typings (absent from the DOM lib).
interface SRAlt { transcript: string }
interface SRResult { 0: SRAlt; isFinal: boolean }
interface SRResultList { length: number; [i: number]: SRResult }
interface SREvent { resultIndex: number; results: SRResultList }
interface SRErrorEvent { error: string }
interface SpeechRec {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: SRErrorEvent) => void) | null;
  onend: (() => void) | null;
}
type SRCtor = new () => SpeechRec;

function getSRCtor(): SRCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

// iOS / iPadOS Safari technically exposes webkitSpeechRecognition, but it
// does NOT honour `continuous`: it stops after a single phrase and won't
// reliably auto-restart without a fresh user gesture. So on those devices
// (the tablet Gadi tested, 2026-08-18) we switch to a tap-to-ask model —
// one tap = one question — which works every time. Everywhere else
// (Android Chrome, desktop Chromium) we keep the hands-free continuous
// mode. iPadOS 13+ reports as "MacIntel", so we also check touch points.
function isIOSPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as unknown as { userAgent: string; platform?: string; maxTouchPoints?: number };
  if (/iPad|iPhone|iPod/.test(nav.userAgent)) return true;
  return nav.platform === "MacIntel" && (nav.maxTouchPoints ?? 0) > 1;
}

// UI language → BCP-47 recognition locale (accuracy hint).
function recLocale(lang: string): string {
  const map: Record<string, string> = {
    he: "he-IL", en: "en-US", ar: "ar-SA", ru: "ru-RU", es: "es-ES", pt: "pt-BR",
    fr: "fr-FR", de: "de-DE", it: "it-IT", nl: "nl-NL", cs: "cs-CZ", sk: "sk-SK",
    uk: "uk-UA", tr: "tr-TR", pl: "pl-PL", fa: "fa-IR", id: "id-ID", el: "el-GR",
    hi: "hi-IN", ja: "ja-JP", am: "am-ET", zu: "zu-ZA",
  };
  return map[lang] ?? "en-US";
}

// Forgiving wake-word matching — speech recognition mis-transcribes "Gadit"
// in several ways, especially in Hebrew. No \b (doesn't work across scripts).
const WAKE = /(gad+it|gaddit|gadeet|gadi[ts]|hey gadit|היי גדית|גדית|גדיט|גדעת|גד' ?ית)/i;

// Extract the target word from a transcript. If the wake word was said, any
// phrasing works ("Gadit, nuance"). Without a wake word, only an explicit
// question pattern triggers (so ambient speech is ignored). Returns null when
// there's nothing to look up.
function extractQuery(raw: string): string | null {
  let t = raw.trim();
  let hasWake = false;
  const m = t.match(WAKE);
  if (m && m.index !== undefined) {
    t = t.slice(m.index + m[0].length).trim().replace(/^[,\s.]+/, "");
    hasWake = true;
  }
  if (!t) return null;
  const lower = t.toLowerCase();

  let q =
    // "what does X mean" / "what is X" (capture before "mean")
    lower.match(/what (?:does|is|are) (?:the word |the meaning of |a )?(.+?)(?: mean| means)?$/)?.[1] ||
    // "define X" / "definition of X" / "meaning of X"
    lower.match(/(?:define|definition of|meaning of|what's)\s+(?:the word )?(.+)$/)?.[1] ||
    // Hebrew: "מה זה X" / "מה הפירוש של X" / "פירוש X" / "הגדרה של X"
    t.match(/(?:מה\s+(?:זה|זאת אומרת)|מה\s+(?:ה)?(?:פירוש|משמעות|הגדרה)(?:\s+של)?(?:\s+המילה)?|פירוש|הגדרה\s+של)\s+(.+)$/)?.[1] ||
    null;

  if (!q) {
    // No explicit pattern. With a wake word, treat the rest as the word;
    // without one, ignore (don't fire on random speech / TV).
    if (!hasWake) return null;
    q = t;
  }

  q = q.trim().replace(/[?.!,;]+$/g, "").replace(/^(the word|a|an)\s+/i, "").trim();
  const parts = q.split(/\s+/);
  if (parts.length > 4) q = parts.slice(-2).join(" ");
  return q || null;
}

type Status = "off" | "armed" | "listening" | "heard" | "error";

const PREF_KEY = "gadit-voice-on";

// Status-bubble copy, all 33 UI languages (English fallback). Only en/he
// have spoken "what is" patterns in extractQuery, so the other languages
// are told to say the wake word and then the word itself.
type VaCopy = { denied: string; sayWord: string; sayWake: string; armed: string; tapAsk: string; mode: string };
const VA_COPY: Record<string, VaCopy> = {
  en: {
    denied: "Allow the microphone in your browser (lock icon in the address bar)",
    sayWord: "Listening… say a word now",
    sayWake: "Listening… say “Gadit, what is…”",
    armed: "Listening on · tap anywhere to resume",
    tapAsk: "Tap and ask",
    mode: "Listening mode",
  },
  he: {
    denied: "צריך לאשר מיקרופון בדפדפן (סמל המנעול בשורת הכתובת)",
    sayWord: "מאזינים… אפשר לומר מילה עכשיו",
    sayWake: "מאזינים… אפשר לומר: “Gadit, מה זה…”",
    armed: "האזנה מופעלת · נגיעה במסך מחדשת אותה",
    tapAsk: "לגעת ולשאול",
    mode: "מצב האזנה",
  },
  ar: {
    denied: "اسمح باستخدام الميكروفون في المتصفح (رمز القفل في شريط العنوان)",
    sayWord: "جارٍ الاستماع… قل كلمة الآن",
    sayWake: "جارٍ الاستماع… قل “Gadit” ثم الكلمة",
    armed: "الاستماع مفعّل · المس الشاشة للمتابعة",
    tapAsk: "انقر واسأل",
    mode: "وضع الاستماع",
  },
  ru: {
    denied: "Разрешите доступ к микрофону в браузере (значок замка в адресной строке)",
    sayWord: "Слушаем… скажите слово",
    sayWake: "Слушаем… скажите “Gadit” и слово",
    armed: "Прослушивание включено · коснитесь экрана, чтобы продолжить",
    tapAsk: "Нажмите и спросите",
    mode: "Режим прослушивания",
  },
  es: {
    denied: "Permite el micrófono en tu navegador (icono del candado en la barra de direcciones)",
    sayWord: "Escuchando… di una palabra ahora",
    sayWake: "Escuchando… di “Gadit” y una palabra",
    armed: "Escucha activada · toca la pantalla para seguir",
    tapAsk: "Toca y pregunta",
    mode: "Modo escucha",
  },
  pt: {
    denied: "Permita o microfone no navegador (ícone de cadeado na barra de endereço)",
    sayWord: "Ouvindo… diga uma palavra agora",
    sayWake: "Ouvindo… diga “Gadit” e uma palavra",
    armed: "Escuta ativada · toque na tela para continuar",
    tapAsk: "Toque e pergunte",
    mode: "Modo de escuta",
  },
  fr: {
    denied: "Autorisez le micro dans votre navigateur (icône du cadenas dans la barre d'adresse)",
    sayWord: "À l'écoute… dites un mot maintenant",
    sayWake: "À l'écoute… dites “Gadit” puis un mot",
    armed: "Écoute activée · touchez l'écran pour reprendre",
    tapAsk: "Touchez et demandez",
    mode: "Mode écoute",
  },
  de: {
    denied: "Erlaube das Mikrofon im Browser (Schloss-Symbol in der Adressleiste)",
    sayWord: "Wir hören zu… sag jetzt ein Wort",
    sayWake: "Wir hören zu… sag “Gadit” und dann ein Wort",
    armed: "Zuhören aktiv · tippe irgendwo, um fortzufahren",
    tapAsk: "Tippen und fragen",
    mode: "Zuhörmodus",
  },
  cs: {
    denied: "Povol mikrofon v prohlížeči (ikona zámku v adresním řádku)",
    sayWord: "Posloucháme… řekni teď slovo",
    sayWake: "Posloucháme… řekni “Gadit” a slovo",
    armed: "Poslech zapnutý · klepni kamkoli pro pokračování",
    tapAsk: "Klepni a zeptej se",
    mode: "Režim poslechu",
  },
  sk: {
    denied: "Povoľ mikrofón v prehliadači (ikona zámky v paneli s adresou)",
    sayWord: "Počúvame… povedz teraz slovo",
    sayWake: "Počúvame… povedz “Gadit” a slovo",
    armed: "Počúvanie zapnuté · ťukni kamkoľvek a pokračuj",
    tapAsk: "Ťukni a opýtaj sa",
    mode: "Režim počúvania",
  },
  it: {
    denied: "Consenti il microfono nel browser (icona del lucchetto nella barra degli indirizzi)",
    sayWord: "In ascolto… di' una parola adesso",
    sayWake: "In ascolto… di' “Gadit” e una parola",
    armed: "Ascolto attivo · tocca lo schermo per riprendere",
    tapAsk: "Tocca e chiedi",
    mode: "Modalità ascolto",
  },
  ja: {
    denied: "ブラウザでマイクを許可してください (アドレスバーの鍵アイコン)",
    sayWord: "聞いています… 単語を話してください",
    sayWake: "聞いています… 「Gadit」と言ってから単語を話してください",
    armed: "聞き取りオン · 画面をタップして再開",
    tapAsk: "タップして質問",
    mode: "聞き取りモード",
  },
  hi: {
    denied: "ब्राउज़र में माइक्रोफ़ोन की अनुमति दें (एड्रेस बार में ताले का आइकन)",
    sayWord: "सुन रहे हैं… अब कोई शब्द बोलें",
    sayWake: "सुन रहे हैं… “Gadit” कहें, फिर शब्द",
    armed: "सुनना चालू है · फिर शुरू करने के लिए स्क्रीन पर टैप करें",
    tapAsk: "टैप करें और पूछें",
    mode: "सुनने का मोड",
  },
  am: {
    denied: "በአሳሹ ውስጥ ማይክሮፎኑን ይፍቀዱ (በአድራሻ አሞሌው ላይ ያለው የቁልፍ ምልክት)",
    sayWord: "እያዳመጥን ነው… አሁን አንድ ቃል ይናገሩ",
    sayWake: "እያዳመጥን ነው… “Gadit” ብለው ቃሉን ይናገሩ",
    armed: "ማዳመጥ በርቷል · ለመቀጠል ማያውን ይንኩ",
    tapAsk: "ይንኩና ይጠይቁ",
    mode: "የማዳመጥ ሁነታ",
  },
  uk: {
    denied: "Дозвольте мікрофон у браузері (значок замка в адресному рядку)",
    sayWord: "Слухаємо… скажіть слово",
    sayWake: "Слухаємо… скажіть “Gadit” і слово",
    armed: "Прослуховування ввімкнено · торкніться екрана, щоб продовжити",
    tapAsk: "Торкніться й запитайте",
    mode: "Режим прослуховування",
  },
  tr: {
    denied: "Tarayıcında mikrofona izin ver (adres çubuğundaki kilit simgesi)",
    sayWord: "Dinliyoruz… şimdi bir kelime söyle",
    sayWake: "Dinliyoruz… “Gadit” de, ardından kelimeyi söyle",
    armed: "Dinleme açık · devam etmek için ekrana dokun",
    tapAsk: "Dokun ve sor",
    mode: "Dinleme modu",
  },
  pl: {
    denied: "Zezwól na mikrofon w przeglądarce (ikona kłódki na pasku adresu)",
    sayWord: "Słuchamy… powiedz teraz słowo",
    sayWake: "Słuchamy… powiedz “Gadit” i słowo",
    armed: "Słuchanie włączone · dotknij ekranu, aby wznowić",
    tapAsk: "Dotknij i zapytaj",
    mode: "Tryb słuchania",
  },
  fa: {
    denied: "اجازهٔ میکروفون را در مرورگر بدهید (نماد قفل در نوار آدرس)",
    sayWord: "در حال گوش دادن… حالا یک کلمه بگویید",
    sayWake: "در حال گوش دادن… بگویید “Gadit” و بعد کلمه را",
    armed: "گوش دادن روشن است · برای ادامه صفحه را لمس کنید",
    tapAsk: "لمس کنید و بپرسید",
    mode: "حالت گوش دادن",
  },
  id: {
    denied: "Izinkan mikrofon di browser (ikon gembok di bilah alamat)",
    sayWord: "Mendengarkan… ucapkan satu kata sekarang",
    sayWake: "Mendengarkan… ucapkan “Gadit” lalu katanya",
    armed: "Mendengarkan aktif · ketuk layar untuk melanjutkan",
    tapAsk: "Ketuk dan tanya",
    mode: "Mode mendengarkan",
  },
  nl: {
    denied: "Sta de microfoon toe in je browser (slotje in de adresbalk)",
    sayWord: "We luisteren… zeg nu een woord",
    sayWake: "We luisteren… zeg “Gadit” en dan een woord",
    armed: "Luisteren staat aan · tik ergens om verder te gaan",
    tapAsk: "Tik en vraag",
    mode: "Luistermodus",
  },
  el: {
    denied: "Επίτρεψε το μικρόφωνο στον browser (εικονίδιο κλειδαριάς στη γραμμή διευθύνσεων)",
    sayWord: "Ακούμε… πες μια λέξη τώρα",
    sayWake: "Ακούμε… πες “Gadit” και μετά μια λέξη",
    armed: "Η ακρόαση είναι ενεργή · πάτησε οπουδήποτε για συνέχεια",
    tapAsk: "Πάτησε και ρώτα",
    mode: "Λειτουργία ακρόασης",
  },
  zu: {
    denied: "Vumela imakrofoni kusiphequluli sakho (uphawu lwengidi kubha yekheli)",
    sayWord: "Siyalalela… sho igama manje",
    sayWake: "Siyalalela… sho “Gadit” bese usho igama",
    armed: "Ukulalela kuvuliwe · thinta noma kuphi ukuze uqhubeke",
    tapAsk: "Thinta ubuze",
    mode: "Imodi yokulalela",
  },
  vi: {
    denied: "Hãy cho phép micrô trong trình duyệt (biểu tượng ổ khóa trên thanh địa chỉ)",
    sayWord: "Đang nghe… hãy nói một từ",
    sayWake: "Đang nghe… hãy nói “Gadit” rồi nói từ",
    armed: "Đang bật nghe · chạm vào màn hình để tiếp tục",
    tapAsk: "Chạm và hỏi",
    mode: "Chế độ nghe",
  },
  fil: {
    denied: "Payagan ang mikropono sa browser (icon ng kandado sa address bar)",
    sayWord: "Nakikinig… magsabi ng isang salita ngayon",
    sayWake: "Nakikinig… sabihin ang “Gadit” at ang salita",
    armed: "Naka-on ang pakikinig · i-tap kahit saan para magpatuloy",
    tapAsk: "I-tap at magtanong",
    mode: "Mode ng pakikinig",
  },
  af: {
    denied: "Laat die mikrofoon in jou blaaier toe (slot-ikoon in die adresbalk)",
    sayWord: "Ons luister… sê nou 'n woord",
    sayWake: "Ons luister… sê “Gadit” en dan 'n woord",
    armed: "Luister is aan · tik enige plek om voort te gaan",
    tapAsk: "Tik en vra",
    mode: "Luistermodus",
  },
  sw: {
    denied: "Ruhusu maikrofoni kwenye kivinjari (alama ya kufuli kwenye upau wa anwani)",
    sayWord: "Tunasikiliza… sema neno sasa",
    sayWake: "Tunasikiliza… sema “Gadit” kisha neno",
    armed: "Kusikiliza kumewashwa · gusa popote ili kuendelea",
    tapAsk: "Gusa na uulize",
    mode: "Hali ya kusikiliza",
  },
  "zh-CN": {
    denied: "请在浏览器中允许使用麦克风（地址栏里的锁形图标）",
    sayWord: "正在听… 请说一个词",
    sayWake: "正在听… 先说 “Gadit”，再说一个词",
    armed: "聆听已开启 · 点按屏幕任意位置继续",
    tapAsk: "点按提问",
    mode: "聆听模式",
  },
  "zh-TW": {
    denied: "請在瀏覽器中允許使用麥克風（網址列上的鎖頭圖示）",
    sayWord: "正在聽… 請說一個詞",
    sayWake: "正在聽… 先說 “Gadit”，再說一個詞",
    armed: "聆聽已開啟 · 點一下螢幕任意位置繼續",
    tapAsk: "點一下提問",
    mode: "聆聽模式",
  },
  ko: {
    denied: "브라우저에서 마이크를 허용해 주세요 (주소창의 자물쇠 아이콘)",
    sayWord: "듣고 있어요… 지금 단어를 말해 주세요",
    sayWake: "듣고 있어요… “Gadit”라고 말한 뒤 단어를 말해 주세요",
    armed: "듣기 켜짐 · 화면을 탭하면 다시 시작돼요",
    tapAsk: "탭하고 물어보기",
    mode: "듣기 모드",
  },
  th: {
    denied: "อนุญาตไมโครโฟนในเบราว์เซอร์ (ไอคอนแม่กุญแจในแถบที่อยู่)",
    sayWord: "กำลังฟัง… พูดคำศัพท์ได้เลย",
    sayWake: "กำลังฟัง… พูดว่า “Gadit” แล้วตามด้วยคำศัพท์",
    armed: "เปิดการฟังอยู่ · แตะที่ใดก็ได้เพื่อฟังต่อ",
    tapAsk: "แตะแล้วถาม",
    mode: "โหมดการฟัง",
  },
  bn: {
    denied: "ব্রাউজারে মাইক্রোফোনের অনুমতি দিন (ঠিকানা বারে তালার আইকন)",
    sayWord: "শুনছি… এখন একটি শব্দ বলুন",
    sayWake: "শুনছি… “Gadit” বলুন, তারপর শব্দটি",
    armed: "শোনা চালু আছে · আবার শুরু করতে স্ক্রিনে ট্যাপ করুন",
    tapAsk: "ট্যাপ করে জিজ্ঞেস করুন",
    mode: "শোনার মোড",
  },
  da: {
    denied: "Tillad mikrofonen i din browser (hængelåsikonet i adresselinjen)",
    sayWord: "Vi lytter… sig et ord nu",
    sayWake: "Vi lytter… sig “Gadit” og så et ord",
    armed: "Lytning er slået til · tryk hvor som helst for at fortsætte",
    tapAsk: "Tryk og spørg",
    mode: "Lyttetilstand",
  },
  hu: {
    denied: "Engedélyezd a mikrofont a böngészőben (lakat ikon a címsorban)",
    sayWord: "Figyelünk… mondj most egy szót",
    sayWake: "Figyelünk… mondd, hogy “Gadit”, aztán a szót",
    armed: "Hallgatás bekapcsolva · koppints bárhová a folytatáshoz",
    tapAsk: "Koppints és kérdezz",
    mode: "Hallgatás mód",
  },
};
function vaCopy(lang: string): VaCopy {
  return VA_COPY[lang] ?? VA_COPY.en;
}

export function VoiceAssistant() {
  const { user, plan } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();
  const href = useHref();

  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<Status>("off");
  const [heard, setHeard] = useState("");
  const [denied, setDenied] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);
  const listeningRef = useRef(false);
  const cooldownRef = useRef(0);

  useEffect(() => { setSupported(getSRCtor() !== null); }, []);

  // Mobile: the floating mic is removed entirely (Gadi 2026-09-19). It was
  // built for a desktop / living-room family computer where the mic can stay
  // open; on a phone it's redundant and gets confused with the search-bar voice
  // input. Hidden and inactive under 1024px.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const stop = useCallback(() => {
    listeningRef.current = false;
    setStatus("off");
    try { recRef.current?.abort(); } catch { /* ignore */ }
    recRef.current = null;
    try { localStorage.setItem(PREF_KEY, "0"); } catch { /* ignore */ }
  }, []);

  const handleTranscript = useCallback((text: string, direct = false) => {
    setHeard(text);
    // `direct` = tap-to-ask (iOS): the user deliberately tapped and spoke,
    // so treat the whole utterance as the word even without a wake word.
    let word = extractQuery(text);
    if (!word && direct) {
      word = text.trim().replace(/[?.!,;]+$/g, "").split(/\s+/).slice(-2).join(" ") || null;
    }
    if (!word) return;
    // Debounce: ignore repeats within 4s (recognition can echo).
    const now = Date.now();
    if (now - cooldownRef.current < 4000) return;
    cooldownRef.current = now;
    setStatus("heard");
    router.push(`${href(`/word/${encodeURIComponent(word)}`)}?speak=1`);
  }, [router, href]);

  const start = useCallback(() => {
    if (listeningRef.current) return; // already listening — idempotent
    const Ctor = getSRCtor();
    if (!Ctor) { setStatus("error"); return; }
    const singleShot = isIOSPlatform(); // iOS: one tap = one question
    // Only remember "keep listening" on platforms that can actually stay
    // hands-free; on iOS every question is an explicit tap, so we don't
    // auto-resume (which would fail silently and look broken).
    try { localStorage.setItem(PREF_KEY, singleShot ? "0" : "1"); } catch { /* ignore */ }
    const rec = new Ctor();
    rec.lang = recLocale(lang);
    rec.continuous = !singleShot;
    rec.interimResults = true; // live feedback so you can SEE it's hearing you
    rec.maxAlternatives = 1;
    setDenied(false);
    setHeard("");
    rec.onresult = (e: SREvent) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      const shown = (final || interim).trim();
      if (shown) setHeard(shown); // shows the running transcript in the pill
      if (final.trim()) handleTranscript(final, singleShot);
    };
    rec.onerror = (e: SRErrorEvent) => {
      // Transient errors (silence, aborted) — the onend handler restarts.
      if (e.error === "not-allowed" || e.error === "service-not-allowed") { setDenied(true); stop(); }
    };
    rec.onend = () => {
      if (singleShot) {
        // iOS: the single utterance is done. Return to a ready state so the
        // next tap asks again — no auto-restart (iOS blocks it).
        listeningRef.current = false;
        setStatus("off");
        return;
      }
      // Continuous platforms stop after a silence; restart to stay hands-free.
      if (listeningRef.current) { try { rec.start(); } catch { /* ignore */ } }
    };
    recRef.current = rec;
    listeningRef.current = true;
    setStatus("listening");
    try { rec.start(); } catch { setStatus("error"); }
  }, [lang, handleTranscript, stop]);

  // Clean up on unmount.
  useEffect(() => () => { try { recRef.current?.abort(); } catch { /* ignore */ } }, []);

  // Persistent mode: if the user turned listening on before, remember it and
  // resume automatically — but a browser needs one user gesture to (re)start
  // the mic after a page load, so we resume on the very first interaction
  // anywhere on the page (no need to hunt for the mic button).
  useEffect(() => {
    // iOS is tap-to-ask only (no reliable hands-free), so never auto-resume.
    const elig = !!user && (plan === "clear" || plan === "deep") && supported && !isMobile && !isIOSPlatform();
    if (!elig || listeningRef.current) return;
    let saved = false;
    try { saved = localStorage.getItem(PREF_KEY) === "1"; } catch { /* ignore */ }
    if (!saved) return;
    setStatus("armed");
    const resume = () => {
      document.removeEventListener("pointerdown", resume);
      document.removeEventListener("keydown", resume);
      if (!listeningRef.current) start();
    };
    document.addEventListener("pointerdown", resume);
    document.addEventListener("keydown", resume);
    return () => {
      document.removeEventListener("pointerdown", resume);
      document.removeEventListener("keydown", resume);
    };
  }, [user, plan, supported, start, isMobile]);

  // Gate: paying, logged-in users on a supporting browser only.
  const eligible = !!user && (plan === "clear" || plan === "deep") && supported && !isMobile;
  if (!eligible) return null;

  const active = status === "listening" || status === "heard";
  const armed = status === "armed";
  const ios = isIOSPlatform(); // tap-to-ask model, no wake word needed
  const label =
    denied ? vaCopy(lang).denied
    : heard ? heard
    : status === "listening"
      ? ios
        ? vaCopy(lang).sayWord
        : vaCopy(lang).sayWake
    : armed ? vaCopy(lang).armed
    : ios ? vaCopy(lang).tapAsk
    : vaCopy(lang).mode;

  return (
    <div dir={dir} style={{ position: "fixed", insetInlineEnd: 16, bottom: 16, zIndex: 60, display: "flex", alignItems: "center", gap: 10, flexDirection: dir === "rtl" ? "row-reverse" : "row" }}>
      {(active || armed || denied) && (
        <div style={{ maxWidth: 320, background: "#111827", color: "#fff", fontSize: 13, fontWeight: 500, padding: "9px 15px", borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.18)", lineHeight: 1.4 }}>
          {label}
        </div>
      )}
      <button
        type="button"
        onClick={() => (active ? stop() : start())}
        aria-label={label}
        title={label}
        style={{
          width: 52, height: 52, borderRadius: "50%", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: active ? "#DC2626" : armed ? "#F59E0B" : "#0EA5A5", color: "#fff",
          boxShadow: "0 6px 20px rgba(0,0,0,0.22)", transition: "background 0.2s",
          animation: status === "listening" ? "vaPulse 1.6s ease-in-out infinite" : "none",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
          <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.93V20H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A7 7 0 0 0 19 11z" />
        </svg>
      </button>
      <style>{`@keyframes vaPulse { 0%,100% { box-shadow: 0 6px 20px rgba(220,38,38,0.3), 0 0 0 0 rgba(220,38,38,0.4); } 50% { box-shadow: 0 6px 20px rgba(220,38,38,0.3), 0 0 0 10px rgba(220,38,38,0); } }`}</style>
    </div>
  );
}

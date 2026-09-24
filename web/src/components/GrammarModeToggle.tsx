"use client";

/**
 * GrammarModeToggle — iOS-style switch that turns on POS labels
 * (noun / verb / adjective …) next to each meaning. Same visual
 * grammar as KidsModeToggle so the two read as a pair when they
 * sit side-by-side on the homepage / word page.
 *
 * Not paywalled. The POS data is already in the cached /api/define
 * response; this toggle only flips its display.
 *
 * Christopher (2026-06-19 WhatsApp) asked for POS info; Gadi kept
 * the default clean and exposed the data behind this opt-in switch.
 */

import { useLang } from "@/lib/lang-context";
import { useGrammarMode } from "@/lib/use-grammar-mode";

const LABEL: Record<string, string> = {
  he: "מצב דקדוק",
  en: "Grammar",
  ar: "وضع النحو",
  ru: "Грамматика",
  es: "Gramática",
  pt: "Gramática",
  fr: "Grammaire",
  de: "Grammatik",
  cs: "Gramatika",
  sk: "Gramatika",
  it: "Grammatica",
  ja: "文法モード",
  hi: "व्याकरण",
  am: "ሰዋስው",
  uk: "Граматика",
  tr: "Dil bilgisi",
  pl: "Gramatyka",
  fa: "دستور زبان",
  id: "Tata bahasa",
  nl: "Grammatica",
  el: "Γραμματική",
  zu: "Uhlelo lolimi",
  vi: "Ngữ pháp",
  fil: "Gramatika",
  af: "Grammatika",
  sw: "Sarufi",
  "zh-CN": "语法",
  "zh-TW": "文法",
  ko: "문법",
  th: "ไวยากรณ์",
  bn: "ব্যাকরণ",
  da: "Grammatik",
  hu: "Nyelvtan",
};

const TOOLTIP_ON: Record<string, string> = {
  he: "כיבוי תוויות הדקדוק",
  en: "Hide grammar labels",
  ar: "إخفاء تسميات النحو",
  ru: "Скрыть грамматику",
  es: "Ocultar etiquetas de gramática",
  pt: "Ocultar etiquetas de gramática",
  fr: "Masquer les étiquettes de grammaire",
  de: "Grammatik-Tags ausblenden",
  cs: "Skrýt gramatické značky",
  sk: "Skryť gramatické značky",
  it: "Nascondi etichette grammaticali",
  ja: "文法ラベルを非表示",
  hi: "व्याकरण लेबल छिपाएँ",
  am: "የሰዋስው መለያዎችን ደብቅ",
  uk: "Сховати граматичні позначки",
  tr: "Dil bilgisi etiketlerini gizle",
  pl: "Ukryj etykiety gramatyczne",
  fa: "پنهان کردن برچسب‌های دستوری",
  id: "Sembunyikan label tata bahasa",
  nl: "Grammaticalabels verbergen",
  el: "Απόκρυψη γραμματικών ετικετών",
  zu: "Fihla amalebula ohlelo lolimi",
  vi: "Ẩn nhãn ngữ pháp",
  fil: "Itago ang mga label ng gramatika",
  af: "Versteek grammatika-etikette",
  sw: "Ficha lebo za sarufi",
  "zh-CN": "隐藏语法标签",
  "zh-TW": "隱藏文法標籤",
  ko: "문법 표시 숨기기",
  th: "ซ่อนป้ายไวยากรณ์",
  bn: "ব্যাকরণ লেবেল লুকান",
  da: "Skjul grammatikmærker",
  hu: "Nyelvtani címkék elrejtése",
};

const TOOLTIP_OFF: Record<string, string> = {
  he: "הצגת תוויות דקדוק (שם עצם / פועל / תואר)",
  en: "Show grammar labels (noun / verb / adjective)",
  ar: "إظهار تسميات النحو (اسم / فعل / صفة)",
  ru: "Показать грамматику (сущ. / глагол / прил.)",
  es: "Mostrar etiquetas de gramática (sustantivo / verbo / adjetivo)",
  pt: "Mostrar etiquetas de gramática (substantivo / verbo / adjetivo)",
  fr: "Afficher les étiquettes de grammaire (nom / verbe / adjectif)",
  de: "Grammatik-Tags anzeigen (Substantiv / Verb / Adjektiv)",
  cs: "Zobrazit gramatické značky (podst. jm. / sloveso / příd. jm.)",
  sk: "Zobraziť gramatické značky (podst. m. / sloveso / príd. m.)",
  it: "Mostra etichette grammaticali (sostantivo / verbo / aggettivo)",
  ja: "文法ラベルを表示（名詞 / 動詞 / 形容詞）",
  hi: "व्याकरण लेबल दिखाएँ (संज्ञा / क्रिया / विशेषण)",
  am: "የሰዋስው መለያዎችን አሳይ (ስም / ግስ / ቅጽል)",
  uk: "Показати граматичні позначки (іменник / дієслово / прикметник)",
  tr: "Dil bilgisi etiketlerini göster (isim / fiil / sıfat)",
  pl: "Pokaż etykiety gramatyczne (rzeczownik / czasownik / przymiotnik)",
  fa: "نمایش برچسب‌های دستوری (اسم / فعل / صفت)",
  id: "Tampilkan label tata bahasa (kata benda / kata kerja / kata sifat)",
  nl: "Grammaticalabels tonen (zelfstandig naamwoord / werkwoord / bijvoeglijk naamwoord)",
  el: "Εμφάνιση γραμματικών ετικετών (ουσιαστικό / ρήμα / επίθετο)",
  zu: "Bonisa amalebula ohlelo lolimi (ibizo / isenzo / isiphawulo)",
  vi: "Hiện nhãn ngữ pháp (danh từ / động từ / tính từ)",
  fil: "Ipakita ang mga label ng gramatika (pangngalan / pandiwa / pang-uri)",
  af: "Wys grammatika-etikette (selfstandige naamwoord / werkwoord / byvoeglike naamwoord)",
  sw: "Onyesha lebo za sarufi (nomino / kitenzi / kivumishi)",
  "zh-CN": "显示语法标签（名词 / 动词 / 形容词）",
  "zh-TW": "顯示文法標籤（名詞 / 動詞 / 形容詞）",
  ko: "문법 표시 보기 (명사 / 동사 / 형용사)",
  th: "แสดงป้ายไวยากรณ์ (คำนาม / คำกริยา / คำคุณศัพท์)",
  bn: "ব্যাকরণ লেবেল দেখান (বিশেষ্য / ক্রিয়া / বিশেষণ)",
  da: "Vis grammatikmærker (navneord / udsagnsord / tillægsord)",
  hu: "Nyelvtani címkék megjelenítése (főnév / ige / melléknév)",
};

export function GrammarModeToggle() {
  const { lang } = useLang();
  const [on, setOn] = useGrammarMode();

  const tooltip = on
    ? (TOOLTIP_ON[lang] ?? TOOLTIP_ON.en)
    : (TOOLTIP_OFF[lang] ?? TOOLTIP_OFF.en);

  return (
    <button
      type="button"
      onClick={() => setOn(!on)}
      title={tooltip}
      aria-label={tooltip}
      aria-pressed={on}
      role="switch"
      className={`wb-grammar-toggle${on ? " is-on" : ""}`}
    >
      <span className="wb-grammar-toggle-label">
        {LABEL[lang] ?? LABEL.en}
      </span>
      <span className="wb-grammar-toggle-track" aria-hidden="true">
        <span className="wb-grammar-toggle-thumb" />
      </span>
    </button>
  );
}

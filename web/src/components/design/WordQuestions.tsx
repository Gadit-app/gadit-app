"use client";

/**
 * WordQuestions — the "ask a question about this word" block on the word page.
 *
 * Built to the Sept 2026 council verdict: a FIXED, CURATED set of questions shown
 * as chips, never a free-text box (a free-text box on a child-facing page breaks the
 * closed/safe moat and invites abuse). Each chip asks one bounded question via
 * /api/word-question (cached, cheap). Anything genuinely missing routes to the
 * existing report flow (ReportButton) rather than a chat.
 *
 * PAID ONLY (Gadi 2026-09-14): the whole block — questions AND opposites — shows
 * only to Clear/Deep subscribers. The opposite is rendered as a single "Opposites"
 * chip that reveals the antonym(s) on tap; the answer is already in the data, so no
 * API call is made for it.
 */

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref, wordPath } from "@/lib/href";
import ReportButton from "@/components/ReportButton";

type Plan = "basic" | "clear" | "deep" | "anonymous" | string;

// Keep in sync with QUESTIONS in /api/word-question/route.ts
const QUESTION_IDS = ["synonyms", "word_family", "common_mistakes", "memory_tip"] as const;
type QuestionId = (typeof QUESTION_IDS)[number];
type OpenId = QuestionId | "opposites";

type Dict = Record<string, string>;
function pick(d: Dict, lang: string): string {
  return d[lang] ?? d.en;
}

const HEADING: Dict = {
  en: "Have a question about this word?",
  he: "יש לך שאלה על המילה הזאת?",
  ar: "هل لديك سؤال عن هذه الكلمة؟",
  ru: "Есть вопрос об этом слове?",
  es: "¿Tienes una pregunta sobre esta palabra?",
  fr: "Une question sur ce mot ?",
  pt: "Tem uma pergunta sobre esta palavra?",
  de: "Hast du eine Frage zu diesem Wort?",
  cs: "Máte otázku k tomuto slovu?",
  sk: "Máte otázku k tomuto slovu?",
  it: "Hai una domanda su questa parola?",
  ja: "この単語について質問がありますか？",
  hi: "इस शब्द के बारे में कोई सवाल है?",
  am: "ስለዚህ ቃል ጥያቄ አለዎት?",
  uk: "Є питання про це слово?",
  tr: "Bu kelime hakkında bir sorunuz mu var?",
  pl: "Masz pytanie o to słowo?",
  fa: "درباره این کلمه سؤالی دارید؟",
  id: "Ada pertanyaan tentang kata ini?",
  nl: "Heb je een vraag over dit woord?",
  el: "Έχεις μια ερώτηση για αυτή τη λέξη;",
  zu: "Unombuzo ngaleli gama?",
  vi: "Bạn có câu hỏi về từ này không?",
  fil: "May tanong ka ba tungkol sa salitang ito?",
  af: "Het jy 'n vraag oor hierdie woord?",
  sw: "Una swali kuhusu neno hili?",
  "zh-CN": "对这个词有疑问吗？",
  "zh-TW": "對這個詞有疑問嗎？",
  ko: "이 단어에 대해 궁금한 점이 있나요?",
  th: "มีคำถามเกี่ยวกับคำนี้ไหม",
  bn: "এই শব্দটি নিয়ে কোনো প্রশ্ন আছে?",
  da: "Har du et spørgsmål om dette ord?",
  hu: "Kérdésed van erről a szóról?",
};

const OPPOSITES_LABEL: Dict = {
  en: "Opposites", he: "הפכים", ar: "الأضداد", ru: "Противоположности",
  es: "Opuestos", pt: "Opostos", fr: "Contraires", de: "Gegenteile", it: "Contrari",
  cs: "Opaky",
  sk: "Opaky",
  ja: "反対語",
  hi: "विलोम",
  am: "ተቃራኒዎች",
  uk: "Протилежності",
  tr: "Zıt anlamlılar",
  pl: "Przeciwieństwa",
  fa: "متضادها",
  id: "Lawan kata",
  nl: "Tegenstellingen",
  el: "Αντίθετα",
  zu: "Okuphambene",
  vi: "Từ trái nghĩa",
  fil: "Kasalungat",
  af: "Teenoorgesteldes",
  sw: "Vinyume",
  "zh-CN": "反义词",
  "zh-TW": "反義詞",
  ko: "반대말",
  th: "คำตรงข้าม",
  bn: "বিপরীত শব্দ",
  da: "Modsætninger",
  hu: "Ellentétek",
};

const CHIP: Record<QuestionId, Dict> = {
  synonyms: {
    en: "Similar words", he: "מילים דומות במשמעות", ar: "كلمات مشابهة",
    ru: "Похожие слова", es: "Palabras similares", fr: "Mots similaires",
  },
  word_family: {
    en: "Word family", he: "מילים מאותו שורש", ar: "من نفس الجذر",
    ru: "Однокоренные слова", es: "Familia de palabras", fr: "Famille de mots",
  },
  common_mistakes: {
    en: "Common mistakes", he: "טעויות נפוצות", ar: "أخطاء شائعة",
    ru: "Частые ошибки", es: "Errores comunes", fr: "Erreurs fréquentes",
  },
  memory_tip: {
    en: "How to remember it", he: "איך לזכור את המילה", ar: "كيف تتذكرها",
    ru: "Как запомнить", es: "Cómo recordarla", fr: "Comment la retenir",
  },
};

const LOADING: Dict = { en: "One moment…", he: "רגע אחד…", ar: "لحظة…", ru: "Секунду…", es: "Un momento…", fr: "Un instant…" };
const ERR: Dict = {
  en: "Could not load that. Please try again.",
  he: "לא הצלחנו לטעון כרגע. נסה/י שוב.",
  ar: "تعذّر التحميل. حاول مرة أخرى.",
  ru: "Не удалось загрузить. Попробуйте ещё раз.",
  es: "No se pudo cargar. Inténtalo de nuevo.",
  fr: "Impossible de charger. Réessayez.",
  pt: "Não foi possível carregar. Tente novamente.",
  de: "Konnte nicht geladen werden. Bitte versuche es noch einmal.",
  cs: "Nepodařilo se načíst. Zkuste to prosím znovu.",
  sk: "Nepodarilo sa načítať. Skúste to prosím znova.",
  it: "Impossibile caricare. Riprova.",
  ja: "読み込めませんでした。もう一度お試しください。",
  hi: "लोड नहीं हो सका। कृपया फिर से कोशिश करें।",
  am: "መጫን አልተቻለም። እባክዎ እንደገና ይሞክሩ።",
  uk: "Не вдалося завантажити. Спробуйте ще раз.",
  tr: "Yüklenemedi. Lütfen tekrar deneyin.",
  pl: "Nie udało się wczytać. Spróbuj ponownie.",
  fa: "بارگذاری نشد. لطفاً دوباره تلاش کنید.",
  id: "Gagal memuat. Silakan coba lagi.",
  nl: "Laden is niet gelukt. Probeer het opnieuw.",
  el: "Δεν ήταν δυνατή η φόρτωση. Δοκίμασε ξανά.",
  zu: "Asikwazanga ukulayisha. Sicela uzame futhi.",
  vi: "Không tải được. Vui lòng thử lại.",
  fil: "Hindi ito ma-load. Pakisubukang muli.",
  af: "Kon nie laai nie. Probeer asseblief weer.",
  sw: "Imeshindwa kupakia. Tafadhali jaribu tena.",
  "zh-CN": "无法加载，请重试。",
  "zh-TW": "無法載入，請再試一次。",
  ko: "불러오지 못했어요. 다시 시도해 주세요.",
  th: "โหลดไม่สำเร็จ โปรดลองอีกครั้ง",
  bn: "লোড করা যায়নি। আবার চেষ্টা করুন।",
  da: "Kunne ikke indlæses. Prøv igen.",
  hu: "Nem sikerült betölteni. Próbáld újra.",
};
const REPORT: Dict = {
  en: "Something missing or wrong? Tell us",
  he: "משהו חסר או לא מדויק? ספר/י לנו",
  ar: "هل هناك شيء ناقص أو غير دقيق؟ أخبرنا",
  ru: "Чего-то не хватает или ошибка? Сообщите нам",
  es: "¿Falta algo o hay un error? Cuéntanos",
  fr: "Quelque chose manque ou est faux ? Dites-le nous",
  pt: "Falta algo ou há um erro? Conte para nós",
  de: "Fehlt etwas oder stimmt etwas nicht? Sag es uns",
  cs: "Něco chybí nebo nesedí? Dejte nám vědět",
  sk: "Niečo chýba alebo nesedí? Dajte nám vedieť",
  it: "Manca qualcosa o c'è un errore? Diccelo",
  ja: "足りない点や間違いがありますか？お知らせください",
  hi: "कुछ छूटा है या गलत है? हमें बताएँ",
  am: "የጎደለ ወይም የተሳሳተ ነገር አለ? ይንገሩን",
  uk: "Чогось бракує або є помилка? Повідомте нам",
  tr: "Eksik ya da yanlış bir şey mi var? Bize bildirin",
  pl: "Czegoś brakuje lub jest błąd? Daj nam znać",
  fa: "چیزی کم است یا اشتباه است؟ به ما بگویید",
  id: "Ada yang kurang atau salah? Beri tahu kami",
  nl: "Mist er iets of klopt er iets niet? Laat het ons weten",
  el: "Λείπει κάτι ή είναι λάθος; Πες μας",
  zu: "Kukhona okushodayo noma okungalungile? Sitshele",
  vi: "Thiếu hoặc sai điều gì? Hãy cho chúng tôi biết",
  fil: "May kulang o mali? Sabihin sa amin",
  af: "Is iets weg of verkeerd? Laat weet ons",
  sw: "Kuna kitu kinakosekana au si sahihi? Tuambie",
  "zh-CN": "有遗漏或错误？告诉我们",
  "zh-TW": "有遺漏或錯誤？告訴我們",
  ko: "빠진 내용이나 오류가 있나요? 알려 주세요",
  th: "มีอะไรขาดหายหรือผิดพลาดไหม บอกเราได้เลย",
  bn: "কিছু বাদ পড়েছে বা ভুল আছে? আমাদের জানান",
  da: "Mangler der noget, eller er noget forkert? Fortæl os det",
  hu: "Hiányzik valami, vagy hibás? Szólj nekünk",
};

type CellState = { loading: boolean; answer?: string; error?: boolean };

const chipStyle = (active: boolean): CSSProperties => ({
  fontSize: 13.5,
  fontWeight: 600,
  padding: "8px 14px",
  borderRadius: 999,
  cursor: "pointer",
  border: "1px solid",
  transition: "background .15s, border-color .15s, color .15s",
  borderColor: active ? "var(--brand,#0EA5A5)" : "var(--line,#E2E8E9)",
  background: active ? "var(--brand,#0EA5A5)" : "var(--card,#fff)",
  color: active ? "#fff" : "var(--ink,#16242B)",
});

export default function WordQuestions({
  word,
  wordLang,
  opposites = [],
  plan = "basic",
}: {
  word: string;
  wordLang?: string;
  /** Distinct antonyms collected across all meanings, revealed on tap. */
  opposites?: string[];
  plan?: Plan;
}) {
  const { user } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const [open, setOpen] = useState<OpenId | null>(null);
  const [cells, setCells] = useState<Record<string, CellState>>({});

  // Paid only (Clear/Deep). Hides the whole block — questions AND opposites —
  // for free/anonymous users, per Gadi 2026-09-14.
  const isPaid = plan === "clear" || plan === "deep";
  if (!isPaid || !user) return null;

  function toggle(id: OpenId) {
    setOpen((cur) => (cur === id ? null : id));
  }

  async function ask(qid: QuestionId) {
    if (open === qid) { setOpen(null); return; }
    setOpen(qid);
    if (cells[qid]?.answer || cells[qid]?.loading) return;

    setCells((c) => ({ ...c, [qid]: { loading: true } }));
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      try {
        const idToken = await user!.getIdToken();
        headers.Authorization = `Bearer ${idToken}`;
      } catch { /* will 401 below */ }
      const res = await fetch("/api/word-question", {
        method: "POST",
        headers,
        body: JSON.stringify({ word, uiLang: lang, wordLang, questionId: qid }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = (await res.json()) as { answer?: string };
      const answer = (data.answer || "").trim();
      if (!answer) throw new Error("empty");
      setCells((c) => ({ ...c, [qid]: { loading: false, answer } }));
    } catch {
      setCells((c) => ({ ...c, [qid]: { loading: false, error: true } }));
    }
  }

  const hasOpposites = opposites.length > 0;

  return (
    <div className="wb-origin-section" dir={dir}>
      <div className="wb-eyebrow">
        <span>
          <span className="wb-eyebrow-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </span>
          {pick(HEADING, lang)}
        </span>
      </div>

      <div className="wb-card" style={{ padding: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {/* Opposites — a single chip that reveals the antonym(s) on tap.
              The answer already lives in the data, so no API call. */}
          {hasOpposites && (
            <button
              type="button"
              onClick={() => toggle("opposites")}
              aria-expanded={open === "opposites"}
              style={chipStyle(open === "opposites")}
            >
              {pick(OPPOSITES_LABEL, lang)}
            </button>
          )}

          {QUESTION_IDS.map((qid) => (
            <button
              key={qid}
              type="button"
              onClick={() => ask(qid)}
              aria-expanded={open === qid}
              style={chipStyle(open === qid)}
            >
              {pick(CHIP[qid], lang)}
            </button>
          ))}
        </div>

        {open && (
          <div
            style={{
              marginTop: 12,
              fontSize: 14.5,
              lineHeight: 1.7,
              color: "var(--ink,#16242B)",
              whiteSpace: "pre-wrap",
            }}
          >
            {open === "opposites" ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {opposites.map((opp) => (
                  <Link
                    key={"opp-" + opp}
                    href={href(wordPath(opp))}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      fontSize: 14, fontWeight: 700, padding: "7px 13px", borderRadius: 999,
                      border: "1px solid var(--line,#E2E8E9)", background: "var(--paper,#F7FAFA)",
                      textDecoration: "none", color: "var(--ink,#16242B)", lineHeight: 1.25,
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--teal-deep,#0E7490)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M8 3L4 7l4 4" /><path d="M4 7h16" /><path d="M16 21l4-4-4-4" /><path d="M20 17H4" />
                    </svg>
                    {opp}
                  </Link>
                ))}
              </div>
            ) : (
              <>
                {cells[open]?.loading && (
                  <span style={{ color: "var(--ink-muted,#6B7280)" }}>{pick(LOADING, lang)}</span>
                )}
                {cells[open]?.error && (
                  <span style={{ color: "#B91C1C" }}>{pick(ERR, lang)}</span>
                )}
                {cells[open]?.answer && <span dir="auto">{cells[open]!.answer}</span>}
              </>
            )}
          </div>
        )}

        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--line,#E2E8E9)" }}>
          <ReportButton word={word} defaultCategories={["definition"]} label={pick(REPORT, lang)} />
        </div>
      </div>
    </div>
  );
}

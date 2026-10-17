"use client";

/**
 * One tap to flag a wrong question or word (Gadi 2026-10-12, for the pilot
 * users checking the new content in 29 languages). Sends what is on screen
 * to /api/report-error (category "play_question"); the reports show up in
 * /admin/reports. In the shared game header it snapshots the game's visible
 * text, so every game and lesson step gets it without its own wiring; the
 * duel and the homework quiz pass their own snapshot.
 * 2026-10-17: a labeled pill ("Found a mistake?"), not a bare grey flag a child would skip.
 */
import { useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

/** [full label for screen readers, thanks, the short label shown next to the flag]. */
const COPY: Record<string, [string, string, string]> = {
  en: ["Report a mistake in this question", "Thanks! We'll check it.", "Found a mistake?"],
  he: ["דיווח על טעות בשאלה", "תודה! נבדוק את זה.", "מצאתם טעות?"],
  ar: ["الإبلاغ عن خطأ في هذا السؤال", "شكرًا! سنتحقق من ذلك.", "وجدتم خطأ؟"],
  ru: ["Сообщить об ошибке в вопросе", "Спасибо! Мы проверим.", "Нашли ошибку?"],
  es: ["Informar de un error en esta pregunta", "¡Gracias! Lo revisaremos.", "¿Encontraste un error?"],
  pt: ["Avisar sobre um erro nesta pergunta", "Obrigado! Vamos verificar.", "Achou um erro?"],
  fr: ["Signaler une erreur dans cette question", "Merci ! Nous allons vérifier.", "Une erreur ?"],
  de: ["Fehler in dieser Frage melden", "Danke! Wir sehen es uns an.", "Fehler gefunden?"],
  cs: ["Nahlásit chybu v otázce", "Díky! Podíváme se na to.", "Našli jste chybu?"],
  sk: ["Nahlásiť chybu v otázke", "Ďakujeme! Pozrieme sa na to.", "Našli ste chybu?"],
  it: ["Segnala un errore in questa domanda", "Grazie! Lo controlleremo.", "Hai trovato un errore?"],
  ja: ["この問題のまちがいを報告", "ありがとう！確認します。", "まちがいを見つけた？"],
  hi: ["इस सवाल में गलती बताएँ", "धन्यवाद! हम इसे देखेंगे।", "गलती मिली?"],
  am: ["በዚህ ጥያቄ ውስጥ ስህተት ሪፖርት አድርጉ", "እናመሰግናለን! እንፈትሸዋለን።", "ስህተት አገኛችሁ?"],
  uk: ["Повідомити про помилку в питанні", "Дякуємо! Ми перевіримо.", "Знайшли помилку?"],
  tr: ["Bu sorudaki bir hatayı bildir", "Teşekkürler! Kontrol edeceğiz.", "Hata mı buldun?"],
  pl: ["Zgłoś błąd w tym pytaniu", "Dzięki! Sprawdzimy to.", "Znalazłeś błąd?"],
  fa: ["گزارش اشتباه در این سؤال", "ممنون! بررسی می‌کنیم.", "اشتباهی پیدا کردید؟"],
  id: ["Laporkan kesalahan di soal ini", "Terima kasih! Kami akan memeriksanya.", "Ada kesalahan?"],
  nl: ["Meld een fout in deze vraag", "Bedankt! We kijken ernaar.", "Fout gevonden?"],
  el: ["Αναφορά λάθους σε αυτή την ερώτηση", "Ευχαριστούμε! Θα το ελέγξουμε.", "Βρήκατε λάθος;"],
  zu: ["Bika iphutha kulo mbuzo", "Siyabonga! Sizokuhlola.", "Uthole iphutha?"],
  xh: ["Xela impazamo kulo mbuzo", "Enkosi! Siza kuyijonga.", "Ufumene impazamo?"],
  nso: ["Bega phošo potšišong ye", "Re a leboga! Re tla e lekola.", "O hweditše phošo?"],
  tn: ["Bega phoso mo potsong e", "Re a leboga! Re tla e tlhola.", "O bone phoso?"],
  st: ["Tlaleha phoso potsong ena", "Re a leboha! Re tla e hlahloba.", "O fumane phoso?"],
  ts: ["Vika xihoxo eka xivutiso lexi", "Hi khensa! Hi ta swi kambela.", "U kume xihoxo?"],
  ss: ["Bika liphutsa kulombuto", "Siyabonga! Sitawuwuhlola.", "Utfole liphutsa?"],
  ve: ["Vhigani vhukhakhi kha mbudziso iyi", "Ri a livhuwa! Ri ḓo zwi ṱola.", "No wana vhukhakhi?"],
  nr: ["Bika iphutha embuzweni lo", "Ngiyathokoza! Sizakulihlola.", "Ufumene iphutha?"],
  vi: ["Báo lỗi trong câu hỏi này", "Cảm ơn! Chúng tôi sẽ kiểm tra.", "Thấy lỗi sai?"],
  fil: ["I-report ang mali sa tanong na ito", "Salamat! Titingnan namin ito.", "May nakitang mali?"],
  af: ["Meld 'n fout in hierdie vraag", "Dankie! Ons sal dit nagaan.", "Fout gevind?"],
  sw: ["Ripoti kosa katika swali hili", "Asante! Tutaliangalia.", "Umepata kosa?"],
  "zh-CN": ["报告这道题的错误", "谢谢！我们会检查。", "发现错误了？"],
  "zh-TW": ["回報這題的錯誤", "謝謝！我們會檢查。", "發現錯誤了？"],
  ko: ["이 문제의 오류 신고", "고마워요! 확인할게요.", "틀린 곳을 찾았나요?"],
  th: ["แจ้งข้อผิดพลาดในคำถามนี้", "ขอบคุณ! เราจะตรวจสอบ", "เจอข้อผิดพลาดไหม"],
  bn: ["এই প্রশ্নে ভুল জানান", "ধন্যবাদ! আমরা দেখে নেব।", "ভুল পেয়েছ?"],
  da: ["Meld en fejl i dette spørgsmål", "Tak! Vi kigger på det.", "Fundet en fejl?"],
  hu: ["Hiba jelentése ebben a kérdésben", "Köszönjük! Megnézzük.", "Hibát találtál?"],
};

export function ReportQuestionButton({ where, snapshot }: { where: string; snapshot?: () => unknown }) {
  const { user } = useAuth();
  const { lang } = useLang();
  const ref = useRef<HTMLButtonElement>(null);
  const [state, setState] = useState<"idle" | "sent">("idle");
  const [label, thanks, short] = COPY[lang] ?? COPY.en;

  async function send() {
    if (state !== "idle") return;
    setState("sent");
    window.setTimeout(() => setState("idle"), 3500);
    let ctx: unknown = snapshot?.();
    if (ctx === undefined) {
      // The game's own box: the header's parent holds the question and options.
      const box = ref.current?.closest(".wb-play-header")?.parentElement;
      ctx = { text: (box?.innerText || "").replace(/\s+\n/g, "\n").slice(0, 3000) };
    }
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) headers.Authorization = `Bearer ${await user.getIdToken()}`;
      await fetch("/api/report-error", {
        method: "POST",
        headers,
        body: JSON.stringify({
          categories: ["play_question"],
          word: where.slice(0, 200),
          uiLang: lang,
          pageUrl: window.location.href,
          contextSnapshot: { where, ...((ctx && typeof ctx === "object") ? ctx : { value: ctx }) },
        }),
      });
    } catch { /* best-effort */ }
  }

  return (
    <span className="wb-report-q">
      <button ref={ref} type="button" className="wb-report-q-btn" onClick={() => void send()} aria-label={label} title={label} disabled={state === "sent"}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 22V4" /><path d="M4 4h12l-2 4 2 4H4" />
        </svg>
        {/* A word next to the flag, so a child knows what it is for (Gadi's son, 2026-10-17). */}
        <span className="wb-report-q-label">{short}</span>
      </button>
      {state === "sent" && <span className="wb-report-q-thanks" role="status">{thanks}</span>}
    </span>
  );
}

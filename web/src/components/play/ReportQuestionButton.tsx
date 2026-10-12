"use client";

/**
 * One tap to flag a wrong question or word (Gadi 2026-10-12, for the pilot
 * users checking the new content in 29 languages). Sends what is on screen
 * to /api/report-error (category "play_question"); the reports show up in
 * /admin/reports. In the shared game header it snapshots the game's visible
 * text, so every game and lesson step gets it without its own wiring; the
 * duel and the homework quiz pass their own snapshot.
 */
import { useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

const COPY: Record<string, [string, string]> = {
  en: ["Report a mistake in this question", "Thanks! We'll check it."],
  he: ["דיווח על טעות בשאלה", "תודה! נבדוק את זה."],
  ar: ["الإبلاغ عن خطأ في هذا السؤال", "شكرًا! سنتحقق من ذلك."],
  ru: ["Сообщить об ошибке в вопросе", "Спасибо! Мы проверим."],
  es: ["Informar de un error en esta pregunta", "¡Gracias! Lo revisaremos."],
  pt: ["Avisar sobre um erro nesta pergunta", "Obrigado! Vamos verificar."],
  fr: ["Signaler une erreur dans cette question", "Merci ! Nous allons vérifier."],
  de: ["Fehler in dieser Frage melden", "Danke! Wir sehen es uns an."],
  cs: ["Nahlásit chybu v otázce", "Díky! Podíváme se na to."],
  sk: ["Nahlásiť chybu v otázke", "Ďakujeme! Pozrieme sa na to."],
  it: ["Segnala un errore in questa domanda", "Grazie! Lo controlleremo."],
  ja: ["この問題のまちがいを報告", "ありがとう！確認します。"],
  hi: ["इस सवाल में गलती बताएँ", "धन्यवाद! हम इसे देखेंगे।"],
  am: ["በዚህ ጥያቄ ውስጥ ስህተት ሪፖርት አድርጉ", "እናመሰግናለን! እንፈትሸዋለን።"],
  uk: ["Повідомити про помилку в питанні", "Дякуємо! Ми перевіримо."],
  tr: ["Bu sorudaki bir hatayı bildir", "Teşekkürler! Kontrol edeceğiz."],
  pl: ["Zgłoś błąd w tym pytaniu", "Dzięki! Sprawdzimy to."],
  fa: ["گزارش اشتباه در این سؤال", "ممنون! بررسی می‌کنیم."],
  id: ["Laporkan kesalahan di soal ini", "Terima kasih! Kami akan memeriksanya."],
  nl: ["Meld een fout in deze vraag", "Bedankt! We kijken ernaar."],
  el: ["Αναφορά λάθους σε αυτή την ερώτηση", "Ευχαριστούμε! Θα το ελέγξουμε."],
  zu: ["Bika iphutha kulo mbuzo", "Siyabonga! Sizokuhlola."],
  vi: ["Báo lỗi trong câu hỏi này", "Cảm ơn! Chúng tôi sẽ kiểm tra."],
  fil: ["I-report ang mali sa tanong na ito", "Salamat! Titingnan namin ito."],
  af: ["Meld 'n fout in hierdie vraag", "Dankie! Ons sal dit nagaan."],
  sw: ["Ripoti kosa katika swali hili", "Asante! Tutaliangalia."],
  "zh-CN": ["报告这道题的错误", "谢谢！我们会检查。"],
  "zh-TW": ["回報這題的錯誤", "謝謝！我們會檢查。"],
  ko: ["이 문제의 오류 신고", "고마워요! 확인할게요."],
  th: ["แจ้งข้อผิดพลาดในคำถามนี้", "ขอบคุณ! เราจะตรวจสอบ"],
  bn: ["এই প্রশ্নে ভুল জানান", "ধন্যবাদ! আমরা দেখে নেব।"],
  da: ["Meld en fejl i dette spørgsmål", "Tak! Vi kigger på det."],
  hu: ["Hiba jelentése ebben a kérdésben", "Köszönjük! Megnézzük."],
};

export function ReportQuestionButton({ where, snapshot }: { where: string; snapshot?: () => unknown }) {
  const { user } = useAuth();
  const { lang } = useLang();
  const ref = useRef<HTMLButtonElement>(null);
  const [state, setState] = useState<"idle" | "sent">("idle");
  const [label, thanks] = COPY[lang] ?? COPY.en;

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
      </button>
      {state === "sent" && <span className="wb-report-q-thanks" role="status">{thanks}</span>}
    </span>
  );
}

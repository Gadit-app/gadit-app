"use client";

/**
 * Error boundary for /word/[word] route.
 *
 * Beta tester reported a "This page couldn't load" Edge error on
 * /word/הילה — likely a transient JS bundle fetch failure (Edge
 * shows that screen when the document or a critical resource fails
 * mid-load). Without an error boundary, the user is stranded on the
 * browser's generic error page with no path back into the app.
 *
 * This component is the Next 16 standard error boundary: it gets
 * the thrown error + a `reset` function that re-runs the segment.
 * We render a friendly "something went wrong" card with a retry
 * button and a homepage escape hatch — same dark stage + warm
 * paper card as the rest of the product so the user feels like
 * they're still inside Gadit, not on a foreign error page.
 */

import { useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { track } from "@/lib/track";

const COPY: Record<
  string,
  { title: string; body: string; retry: string; home: string }
> = {
  en: {
    title: "Something went wrong",
    body: "We couldn't load this word. It might be a temporary glitch, please try again.",
    retry: "Try again",
    home: "Back home",
  },
  zu: {
    title: "Kukhona okungahambanga kahle",
    body: "Asikwazanga ukulayisha leli gama. Kungenzeka kube yinkinga yesikhashana, sicela uzame futhi.",
    retry: "Zama futhi",
    home: "Buyela ekhaya",
  },
  el: {
    title: "Κάτι πήγε στραβά",
    body: "Δεν μπορέσαμε να φορτώσουμε αυτή τη λέξη. Ίσως είναι μια προσωρινή δυσλειτουργία, δοκίμασε ξανά.",
    retry: "Δοκίμασε ξανά",
    home: "Πίσω στην αρχική",
  },
  he: {
    title: "משהו השתבש",
    body: "לא הצלחנו לטעון את המילה הזאת. ייתכן שזו תקלה זמנית, אנא נסו שוב.",
    retry: "נסו שוב",
    home: "חזרה לדף הבית",
  },
  ar: {
    title: "حدث خطأ ما",
    body: "تعذر تحميل هذه الكلمة. قد يكون خللًا مؤقتًا, حاول مرة أخرى من فضلك.",
    retry: "حاول مرة أخرى",
    home: "العودة إلى الصفحة الرئيسية",
  },
  ru: {
    title: "Что-то пошло не так",
    body: "Не удалось загрузить это слово. Возможно, это временный сбой, попробуйте ещё раз.",
    retry: "Попробовать снова",
    home: "Вернуться на главную",
  },
  es: {
    title: "Algo salió mal",
    body: "No pudimos cargar esta palabra. Puede ser un problema temporal, por favor inténtalo de nuevo.",
    retry: "Intentar de nuevo",
    home: "Volver al inicio",
  },
  pt: {
    title: "Algo deu errado",
    body: "Não conseguimos carregar essa palavra. Pode ser uma falha temporária, tente novamente.",
    retry: "Tentar de novo",
    home: "Voltar ao início",
  },
  fr: {
    title: "Une erreur s'est produite",
    body: "Nous n'avons pas pu charger ce mot. Il s'agit peut-être d'un problème temporaire, veuillez réessayer.",
    retry: "Réessayer",
    home: "Retour à l'accueil",
  },
  hi: {
    title: "कुछ ग़लत हुआ",
    body: "हम यह शब्द लोड नहीं कर पाए। शायद कोई अस्थायी गड़बड़ी है, कृपया फिर से कोशिश करें।",
    retry: "फिर से कोशिश करें",
    home: "होम पर वापस",
  },
  am: {
    title: "የሆነ ስህተት ተፈጥሯል",
    body: "ይህን ቃል መጫን አልቻልንም። ጊዜያዊ ችግር ሊሆን ይችላል፣ እባክዎ እንደገና ይሞክሩ።",
    retry: "እንደገና ይሞክሩ",
    home: "ወደ መነሻ ገጽ",
  },
  de: {
    title: "Da ist etwas schiefgelaufen",
    body: "Wir konnten dieses Wort nicht laden. Vielleicht ist es nur ein kurzer Fehler, bitte versuch es noch einmal.",
    retry: "Nochmal versuchen",
    home: "Zur Startseite",
  },
  cs: {
    title: "Něco se pokazilo",
    body: "Toto slovo se nám nepodařilo načíst. Možná jde jen o chvilkovou chybu, zkuste to prosím znovu.",
    retry: "Zkusit znovu",
    home: "Zpět na úvod",
  },
  sk: {
    title: "Niečo sa pokazilo",
    body: "Toto slovo sa nám nepodarilo načítať. Možno ide len o chvíľkovú chybu, skúste to prosím znova.",
    retry: "Skúsiť znova",
    home: "Späť na úvod",
  },
  it: {
    title: "Qualcosa è andato storto",
    body: "Non siamo riusciti a caricare questa parola. Forse è un problema temporaneo, riprova.",
    retry: "Riprova",
    home: "Torna alla home",
  },
  ja: {
    title: "問題が発生しました",
    body: "このことばを読み込めませんでした。一時的な不具合かもしれません。もう一度お試しください。",
    retry: "もう一度試す",
    home: "ホームにもどる",
  },
  uk: {
    title: "Щось пішло не так",
    body: "Нам не вдалося завантажити це слово. Можливо, це тимчасовий збій, спробуйте ще раз.",
    retry: "Спробувати ще раз",
    home: "На головну",
  },
  tr: {
    title: "Bir şeyler ters gitti",
    body: "Bu kelimeyi yükleyemedik. Geçici bir sorun olabilir, lütfen tekrar dene.",
    retry: "Tekrar dene",
    home: "Ana sayfaya dön",
  },
  pl: {
    title: "Coś poszło nie tak",
    body: "Nie udało nam się wczytać tego słowa. To może być chwilowy problem, spróbuj jeszcze raz.",
    retry: "Spróbuj ponownie",
    home: "Wróć na stronę główną",
  },
  fa: {
    title: "مشکلی پیش آمد",
    body: "نتوانستیم این کلمه را بارگذاری کنیم. شاید یک مشکل موقت باشد، لطفاً دوباره امتحان کن.",
    retry: "دوباره امتحان کن",
    home: "بازگشت به صفحه اصلی",
  },
  id: {
    title: "Ada yang salah",
    body: "Kami tidak bisa memuat kata ini. Mungkin hanya gangguan sementara, silakan coba lagi.",
    retry: "Coba lagi",
    home: "Kembali ke beranda",
  },
  nl: {
    title: "Er ging iets mis",
    body: "We konden dit woord niet laden. Misschien is het een tijdelijke storing, probeer het nog eens.",
    retry: "Opnieuw proberen",
    home: "Terug naar home",
  },
  vi: {
    title: "Có lỗi xảy ra",
    body: "Chúng tôi chưa tải được từ này. Có thể chỉ là lỗi tạm thời, bạn hãy thử lại nhé.",
    retry: "Thử lại",
    home: "Về trang chủ",
  },
  fil: {
    title: "May nangyaring mali",
    body: "Hindi namin na-load ang salitang ito. Baka pansamantalang aberya lang, pakisubukan ulit.",
    retry: "Subukan ulit",
    home: "Bumalik sa home",
  },
  af: {
    title: "Iets het verkeerd geloop",
    body: "Ons kon nie hierdie woord laai nie. Dit is dalk net 'n tydelike fout, probeer asseblief weer.",
    retry: "Probeer weer",
    home: "Terug na tuis",
  },
  sw: {
    title: "Kuna tatizo limetokea",
    body: "Hatukuweza kupakia neno hili. Huenda ni hitilafu ya muda tu, tafadhali jaribu tena.",
    retry: "Jaribu tena",
    home: "Rudi mwanzo",
  },
  "zh-CN": {
    title: "出了点问题",
    body: "我们没能加载这个词。可能只是暂时的小故障，请再试一次。",
    retry: "再试一次",
    home: "返回首页",
  },
  "zh-TW": {
    title: "出了點問題",
    body: "我們沒能載入這個詞。可能只是暫時的小故障，請再試一次。",
    retry: "再試一次",
    home: "返回首頁",
  },
  ko: {
    title: "문제가 생겼어요",
    body: "이 단어를 불러오지 못했어요. 잠깐의 오류일 수 있으니 다시 시도해 주세요.",
    retry: "다시 시도",
    home: "홈으로",
  },
  th: {
    title: "มีบางอย่างผิดพลาด",
    body: "เราโหลดคำนี้ไม่ได้ อาจเป็นแค่ปัญหาชั่วคราว ลองอีกครั้งนะ",
    retry: "ลองอีกครั้ง",
    home: "กลับหน้าแรก",
  },
  bn: {
    title: "কিছু একটা গোলমাল হয়েছে",
    body: "আমরা এই শব্দটা লোড করতে পারিনি। হয়তো সাময়িক সমস্যা, আবার চেষ্টা করে দেখুন।",
    retry: "আবার চেষ্টা করুন",
    home: "হোমে ফিরে যান",
  },
  da: {
    title: "Noget gik galt",
    body: "Vi kunne ikke indlæse dette ord. Det er måske bare en midlertidig fejl, prøv igen.",
    retry: "Prøv igen",
    home: "Tilbage til forsiden",
  },
  hu: {
    title: "Valami hiba történt",
    body: "Nem sikerült betöltenünk ezt a szót. Lehet, hogy csak átmeneti hiba, próbáld újra.",
    retry: "Újra",
    home: "Vissza a főoldalra",
  },
};

export default function WordError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang, dir } = useLang();
  const c = COPY[lang] ?? COPY.en;
  const rtlFont =
    lang === "he" ? "var(--wb-he)" : lang === "ar" || lang === "fa" ? "var(--wb-ar)" : null;
  const titleFont = rtlFont ?? "var(--wb-serif)";
  const bodyFont = rtlFont ?? "var(--wb-sans)";

  useEffect(() => {
    // Surface to the browser console for triage; in production this
    // also reaches Vercel logs through the runtime error pipe.
    console.error("/word/[word] error boundary tripped:", error);
    // Telemetry: each trip is a real failed user interaction. The
    // message + digest land in Vercel Analytics so spikes are visible.
    track("word_error_boundary", {
      message: error.message?.slice(0, 200) ?? "",
      digest: error.digest ?? null,
    });
  }, [error]);

  return (
    <div
      className="wordbook"
      dir={dir}
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--paper, #F4F5F8)",
      }}
    >
      <div
        style={{
          maxWidth: 460,
          width: "100%",
          background: "var(--surface, #fff)",
          border: "1px solid var(--rule, #E2E5EA)",
          borderRadius: 20,
          padding: "clamp(32px, 5vw, 44px) clamp(24px, 4vw, 36px)",
          textAlign: "center",
          boxShadow: "0 10px 34px -14px rgba(16, 24, 40, 0.18)",
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 999,
            background: "#FEF3E2",
            color: "#D97706",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
        </div>
        <h1
          style={{
            fontFamily: titleFont,
            fontSize: "clamp(22px, 3vw, 28px)",
            fontWeight: 700,
            color: "var(--ink, #0B1220)",
            margin: "0 0 8px",
          }}
        >
          {c.title}
        </h1>
        <p
          style={{
            fontFamily: bodyFont,
            fontSize: 14.5,
            lineHeight: 1.6,
            color: "var(--ink-soft, #3F4856)",
            margin: "0 0 24px",
          }}
        >
          {c.body}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              fontFamily: bodyFont,
              fontSize: 14,
              fontWeight: 700,
              padding: "11px 22px",
              borderRadius: 12,
              border: "none",
              color: "#fff",
              background: "#0EA5A5",
              cursor: "pointer",
            }}
          >
            {c.retry}
          </button>
          <Link
            href="/"
            style={{
              fontFamily: bodyFont,
              fontSize: 14,
              fontWeight: 600,
              padding: "11px 22px",
              borderRadius: 12,
              color: "var(--ink, #0B1220)",
              background: "transparent",
              border: "1px solid var(--rule, #E2E5EA)",
              textDecoration: "none",
            }}
          >
            {c.home}
          </Link>
        </div>
      </div>
    </div>
  );
}

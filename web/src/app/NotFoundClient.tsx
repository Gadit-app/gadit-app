"use client";

/**
 * The 404 page in the visitor's language (QA 2026-10-18: an unknown address
 * showed Next's default English page, with no Gadit header and no RTL).
 */
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";

/** [title, body, button] */
const COPY: Record<string, [string, string, string]> = {
  en: ["This page doesn't exist", "The link may be old or mistyped. You can look up any word from the home page.", "To the home page"],
  he: ["הדף הזה לא קיים", "אולי הקישור ישן או שיש בו טעות. אפשר לחפש כל מילה מדף הבית.", "לדף הבית"],
  ar: ["هذه الصفحة غير موجودة", "ربما الرابط قديم أو فيه خطأ. يمكنك البحث عن أي كلمة من الصفحة الرئيسية.", "إلى الصفحة الرئيسية"],
  ru: ["Такой страницы нет", "Возможно, ссылка устарела или в ней ошибка. Любое слово можно найти на главной странице.", "На главную"],
  es: ["Esta página no existe", "Puede que el enlace sea antiguo o tenga un error. Puedes buscar cualquier palabra desde la página de inicio.", "Ir al inicio"],
  pt: ["Esta página não existe", "Talvez o link seja antigo ou tenha um erro. Você pode procurar qualquer palavra na página inicial.", "Ir para o início"],
  fr: ["Cette page n'existe pas", "Le lien est peut-être ancien ou mal saisi. Tu peux chercher n'importe quel mot depuis l'accueil.", "Retour à l'accueil"],
  de: ["Diese Seite gibt es nicht", "Vielleicht ist der Link alt oder falsch geschrieben. Auf der Startseite kannst du jedes Wort nachschlagen.", "Zur Startseite"],
  cs: ["Tato stránka neexistuje", "Odkaz je možná starý nebo chybný. Jakékoli slovo najdeš na úvodní stránce.", "Na úvodní stránku"],
  sk: ["Táto stránka neexistuje", "Odkaz je možno starý alebo chybný. Akékoľvek slovo nájdeš na úvodnej stránke.", "Na úvodnú stránku"],
  it: ["Questa pagina non esiste", "Forse il link è vecchio o contiene un errore. Puoi cercare qualsiasi parola dalla home.", "Vai alla home"],
  ja: ["このページは見つかりません", "リンクが古いか、まちがっているかもしれません。ホームからどんな言葉でも調べられます。", "ホームへ"],
  hi: ["यह पेज मौजूद नहीं है", "शायद लिंक पुराना है या उसमें गलती है। होम पेज से आप कोई भी शब्द खोज सकते हैं।", "होम पेज पर जाएँ"],
  am: ["ይህ ገጽ የለም", "ሊንኩ የቆየ ወይም የተሳሳተ ሊሆን ይችላል። ከመነሻ ገጹ ማንኛውንም ቃል መፈለግ ትችላላችሁ።", "ወደ መነሻ ገጽ"],
  uk: ["Такої сторінки немає", "Можливо, посилання застаріле або з помилкою. Будь-яке слово можна знайти на головній сторінці.", "На головну"],
  tr: ["Bu sayfa yok", "Bağlantı eski ya da hatalı olabilir. Ana sayfadan istediğin kelimeyi arayabilirsin.", "Ana sayfaya dön"],
  pl: ["Ta strona nie istnieje", "Link może być stary albo błędny. Każde słowo znajdziesz na stronie głównej.", "Na stronę główną"],
  fa: ["این صفحه وجود ندارد", "شاید پیوند قدیمی است یا اشتباه دارد. از صفحه اصلی می‌توانید هر کلمه‌ای را جستجو کنید.", "به صفحه اصلی"],
  id: ["Halaman ini tidak ada", "Mungkin tautannya sudah lama atau salah ketik. Kamu bisa mencari kata apa saja dari beranda.", "Ke beranda"],
  nl: ["Deze pagina bestaat niet", "Misschien is de link oud of verkeerd getypt. Op de startpagina kun je elk woord opzoeken.", "Naar de startpagina"],
  el: ["Αυτή η σελίδα δεν υπάρχει", "Ίσως ο σύνδεσμος είναι παλιός ή έχει λάθος. Μπορείς να ψάξεις οποιαδήποτε λέξη από την αρχική σελίδα.", "Στην αρχική σελίδα"],
  zu: ["Leli khasi alikho", "Mhlawumbe isixhumanisi sidala noma sinephutha. Ungasesha noma yiliphi igama ekhasini lasekhaya.", "Ekhasini lasekhaya"],
  xh: ["Eli phepha alikho", "Mhlawumbi ikhonkco lidala okanye linempazamo. Ungakhangela naliphi na igama kwiphepha lasekhaya.", "Kwiphepha lasekhaya"],
  nso: ["Letlakala le ga le gona", "Mohlomongwe kgokagano ke ya kgale goba e na le phošo. O ka nyaka lentšu lefe goba lefe letlakaleng la gae.", "Go letlakala la gae"],
  tn: ["Tsebe e ga e yo", "Gongwe kgolagano ke ya bogologolo kgotsa e na le phoso. O ka batla lefoko lepe fela mo tsebeng ya gae.", "Kwa tsebeng ya gae"],
  st: ["Leqephe lena ha le eo", "Mohlomong sehokelo ke sa kgale kapa se na le phoso. O ka batla lentswe lefe kapa lefe leqepheng la lapeng.", "Leqepheng la lapeng"],
  ts: ["Pheji leyi a yi kona", "Kumbexana xihlanganisi i xa khale kumbe xi ni xihoxo. U nga lava rito rin'wana na rin'wana eka pheji ya le kaya.", "Eka pheji ya le kaya"],
  ss: ["Lelikhasi alikho", "Mhlawumbe lesihlanganisi sidzala nobe sinephutsa. Ungasesha nobe ngabe ngumuphi ligama ekhasini lasekhaya.", "Ekhasini lasekhaya"],
  ve: ["Siaṱari iyi a si hone", "Zwiṅwe vhukwamani ndi ha kale kana vhu na vhukhakhi. Ni nga ṱoḓa ipfi ḽiṅwe na ḽiṅwe kha siaṱari ḽa hayani.", "Kha siaṱari ḽa hayani"],
  nr: ["Ikhasi leli alikho", "Mhlamunye isihlanganisi sidala namkha sinephoso. Ungafuna nanyana ngiliphi ilimi ekhasini lekhaya.", "Ekhasini lekhaya"],
  vi: ["Trang này không tồn tại", "Có thể liên kết đã cũ hoặc bị gõ sai. Bạn có thể tra bất kỳ từ nào từ trang chủ.", "Về trang chủ"],
  fil: ["Wala ang pahinang ito", "Maaaring luma o mali ang link. Puwede kang maghanap ng kahit anong salita mula sa home page.", "Sa home page"],
  af: ["Hierdie bladsy bestaan nie", "Dalk is die skakel oud of verkeerd getik. Jy kan enige woord op die tuisblad opsoek.", "Na die tuisblad"],
  sw: ["Ukurasa huu haupo", "Huenda kiungo ni cha zamani au kina kosa. Unaweza kutafuta neno lolote kutoka ukurasa wa mwanzo.", "Kwenye ukurasa wa mwanzo"],
  "zh-CN": ["这个页面不存在", "链接可能已过时或有错误。你可以在首页查任何一个词。", "回到首页"],
  "zh-TW": ["這個頁面不存在", "連結可能已過時或有錯誤。你可以在首頁查任何一個詞。", "回到首頁"],
  ko: ["이 페이지는 없어요", "링크가 오래됐거나 잘못 입력됐을 수 있어요. 홈에서 어떤 단어든 찾아볼 수 있어요.", "홈으로"],
  th: ["ไม่มีหน้านี้", "ลิงก์อาจเก่าหรือพิมพ์ผิด คุณค้นหาคำใดก็ได้จากหน้าแรก", "ไปหน้าแรก"],
  bn: ["এই পেজটি নেই", "হয়তো লিংকটি পুরোনো বা ভুল। হোম পেজ থেকে যেকোনো শব্দ খুঁজতে পারো।", "হোম পেজে যাও"],
  da: ["Denne side findes ikke", "Måske er linket gammelt eller stavet forkert. Du kan slå et hvilket som helst ord op fra forsiden.", "Til forsiden"],
  hu: ["Ez az oldal nem létezik", "Lehet, hogy a link régi vagy elírták. A kezdőlapon bármilyen szót kikereshetsz.", "Vissza a kezdőlapra"],
};

export function NotFoundClient() {
  const { lang, dir } = useLang();
  const href = useHref();
  const [title, body, cta] = COPY[lang] ?? COPY.en;
  return (
    <div className="wordbook" dir={dir} style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px" }}>
      <div style={{ maxWidth: 520, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <Link href={href("/")} dir="ltr" aria-label="Gadit" style={{ fontFamily: "var(--wb-sans)", fontWeight: 700, fontSize: 30, color: "var(--ink, #111827)", textDecoration: "none" }}>
          Gad<span style={{ fontStyle: "italic", fontWeight: 400, color: "#0EA5A5" }}>it</span>
        </Link>
        <div style={{ fontSize: 56, fontWeight: 800, color: "var(--teal, #0EA5A5)", lineHeight: 1 }}>404</div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "var(--ink, #111827)", textWrap: "balance" }}>{title}</h1>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--ink-muted, #6B7280)" }}>{body}</p>
        <Link href={href("/")} style={{ marginTop: 6, background: "var(--teal, #0EA5A5)", color: "#fff", borderRadius: 999, padding: "12px 26px", fontWeight: 700, textDecoration: "none" }}>{cta}</Link>
      </div>
    </div>
  );
}

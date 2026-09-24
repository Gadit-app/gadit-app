"use client";

/**
 * /join?code=XXXXXX — landing for paired devices.
 *
 * If `?code=` is present, auto-submits via POST /api/family/pair/redeem,
 * then calls `signInWithCustomToken` on the returned token. Persisted
 * via Firebase Auth's IndexedDB (the SDK does this by default), so the
 * device stays signed in across refreshes and reboots.
 *
 * If no code is in the URL, shows an input box. After successful pair,
 * navigates to / (the main Gadit app) — the user can now search words
 * with their own notebook + history.
 */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";

const COPY: Record<string, {
  title: string;
  sub: string;
  inputLabel: string;
  submit: string;
  joining: string;
  success: string;
  errInvalid: string;
  errExpired: string;
  errNotFound: string;
  errGeneric: string;
}> = {
  he: {
    title: "כניסה למשפחה",
    sub: "הקלידו את הקוד בן 6 הספרות שההורה ייצר",
    inputLabel: "קוד 6 ספרות",
    submit: "המשך",
    joining: "מתחבר...",
    success: "מחובר! מעביר אתכם ל-Gadit...",
    errInvalid: "הקוד חייב להיות 6 ספרות",
    errExpired: "הקוד פג. בקשו מההורה לייצר חדש.",
    errNotFound: "הקוד לא קיים",
    errGeneric: "משהו השתבש. נסו שוב.",
  },
  en: {
    title: "Join a family",
    sub: "Type the 6-digit code your parent generated",
    inputLabel: "6-digit code",
    submit: "Continue",
    joining: "Joining...",
    success: "Joined! Taking you to Gadit...",
    errInvalid: "Code must be 6 digits",
    errExpired: "Code expired. Ask your parent to generate a new one.",
    errNotFound: "Code not found",
    errGeneric: "Something went wrong. Please try again.",
  },
  zu: {
    title: "Joyina umndeni",
    sub: "Bhala ikhodi enezinombolo ezingu-6 eyenziwe umzali wakho",
    inputLabel: "Ikhodi enezinombolo ezingu-6",
    submit: "Qhubeka",
    joining: "Iyajoyina...",
    success: "Ujoyinile! Sikuyisa ku-Gadit...",
    errInvalid: "Ikhodi kumele ibe nezinombolo ezingu-6",
    errExpired: "Ikhodi iphelelwe yisikhathi. Cela umzali wakho enze entsha.",
    errNotFound: "Ikhodi ayitholakalanga",
    errGeneric: "Kukhona okungahambanga kahle. Sicela uzame futhi.",
  },
  el: {
    title: "Μπες σε μια οικογένεια",
    sub: "Πληκτρολόγησε τον 6ψήφιο κωδικό που δημιούργησε ο γονιός σου",
    inputLabel: "6ψήφιος κωδικός",
    submit: "Συνέχεια",
    joining: "Σύνδεση...",
    success: "Μπήκες! Σε πάμε στο Gadit...",
    errInvalid: "Ο κωδικός πρέπει να έχει 6 ψηφία",
    errExpired: "Ο κωδικός έληξε. Ζήτησε από τον γονιό σου να δημιουργήσει νέο.",
    errNotFound: "Ο κωδικός δεν βρέθηκε",
    errGeneric: "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
  },
  hi: {
    title: "परिवार में जुड़ें",
    sub: "अपने माता-पिता का बनाया 6-अंकों का कोड डालें",
    inputLabel: "6-अंकों का कोड",
    submit: "आगे बढ़ें",
    joining: "जुड़ रहे हैं...",
    success: "जुड़ गए! Gadit पर ले जा रहे हैं...",
    errInvalid: "कोड में 6 अंक होने चाहिए",
    errExpired: "कोड समाप्त। अपने माता-पिता से नया कोड बनवाएँ।",
    errNotFound: "कोड नहीं मिला",
    errGeneric: "कुछ ग़लत हुआ। फिर से कोशिश करें।",
  },
  am: {
    title: "ቤተሰብ ጋር ተቀላቀሉ",
    sub: "ወላጃችሁ ያዘጋጀውን ባለ 6 አሃዝ ኮድ አስገቡ",
    inputLabel: "ባለ 6 አሃዝ ኮድ",
    submit: "ቀጥሉ",
    joining: "እየተቀላቀላችሁ ነው...",
    success: "ተቀላቅላችኋል! ወደ Gadit እየወሰድናችሁ ነው...",
    errInvalid: "ኮዱ 6 አሃዝ መሆን አለበት",
    errExpired: "ኮዱ ጊዜው አልፎበታል። ወላጃችሁ አዲስ ኮድ እንዲያዘጋጅ ጠይቁ።",
    errNotFound: "ኮዱ አልተገኘም",
    errGeneric: "የሆነ ስህተት ተፈጥሯል። እንደገና ሞክሩ።",
  },
  ar: {
    title: "الانضمام إلى عائلة",
    sub: "اكتب الرمز المكوّن من 6 أرقام الذي أنشأه أحد والديك",
    inputLabel: "رمز من 6 أرقام",
    submit: "متابعة",
    joining: "جارٍ الانضمام...",
    success: "تم الانضمام! ننقلك إلى Gadit...",
    errInvalid: "يجب أن يتكون الرمز من 6 أرقام",
    errExpired: "انتهت صلاحية الرمز. اطلب من أحد والديك إنشاء رمز جديد.",
    errNotFound: "الرمز غير موجود",
    errGeneric: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
  },
  ru: {
    title: "Присоединиться к семье",
    sub: "Введи 6-значный код, который создал твой родитель",
    inputLabel: "6-значный код",
    submit: "Продолжить",
    joining: "Подключаемся...",
    success: "Готово! Переходим в Gadit...",
    errInvalid: "Код должен состоять из 6 цифр",
    errExpired: "Срок действия кода истёк. Попроси родителя создать новый.",
    errNotFound: "Код не найден",
    errGeneric: "Что-то пошло не так. Попробуй ещё раз.",
  },
  es: {
    title: "Únete a una familia",
    sub: "Escribe el código de 6 dígitos que creó tu papá o tu mamá",
    inputLabel: "Código de 6 dígitos",
    submit: "Continuar",
    joining: "Uniéndote...",
    success: "¡Listo! Te llevamos a Gadit...",
    errInvalid: "El código debe tener 6 dígitos",
    errExpired: "El código caducó. Pide a tu papá o tu mamá que cree uno nuevo.",
    errNotFound: "Código no encontrado",
    errGeneric: "Algo salió mal. Inténtalo de nuevo.",
  },
  pt: {
    title: "Entrar em uma família",
    sub: "Digite o código de 6 dígitos que seu pai ou sua mãe gerou",
    inputLabel: "Código de 6 dígitos",
    submit: "Continuar",
    joining: "Entrando...",
    success: "Pronto! Levando você ao Gadit...",
    errInvalid: "O código deve ter 6 dígitos",
    errExpired: "O código expirou. Peça ao seu pai ou à sua mãe para gerar um novo.",
    errNotFound: "Código não encontrado",
    errGeneric: "Algo deu errado. Tente novamente.",
  },
  fr: {
    title: "Rejoindre une famille",
    sub: "Saisis le code à 6 chiffres créé par ton parent",
    inputLabel: "Code à 6 chiffres",
    submit: "Continuer",
    joining: "Connexion...",
    success: "C'est fait ! On t'emmène sur Gadit...",
    errInvalid: "Le code doit comporter 6 chiffres",
    errExpired: "Le code a expiré. Demande à ton parent d'en créer un nouveau.",
    errNotFound: "Code introuvable",
    errGeneric: "Une erreur s'est produite. Réessaie.",
  },
  de: {
    title: "Einer Familie beitreten",
    sub: "Gib den 6-stelligen Code ein, den deine Eltern erstellt haben",
    inputLabel: "6-stelliger Code",
    submit: "Weiter",
    joining: "Wird verbunden...",
    success: "Geschafft! Wir bringen dich zu Gadit...",
    errInvalid: "Der Code muss 6 Ziffern haben",
    errExpired: "Der Code ist abgelaufen. Bitte deine Eltern, einen neuen zu erstellen.",
    errNotFound: "Code nicht gefunden",
    errGeneric: "Etwas ist schiefgelaufen. Bitte versuche es noch einmal.",
  },
  cs: {
    title: "Připojit se k rodině",
    sub: "Zadej šestimístný kód, který vytvořil tvůj rodič",
    inputLabel: "Šestimístný kód",
    submit: "Pokračovat",
    joining: "Připojování...",
    success: "Hotovo! Přesouváme tě do Gadit...",
    errInvalid: "Kód musí mít 6 číslic",
    errExpired: "Platnost kódu vypršela. Požádej rodiče, ať vytvoří nový.",
    errNotFound: "Kód nebyl nalezen",
    errGeneric: "Něco se pokazilo. Zkus to znovu.",
  },
  sk: {
    title: "Pripojiť sa k rodine",
    sub: "Zadaj šesťmiestny kód, ktorý vytvoril tvoj rodič",
    inputLabel: "Šesťmiestny kód",
    submit: "Pokračovať",
    joining: "Pripája sa...",
    success: "Hotovo! Presúvame ťa do Gadit...",
    errInvalid: "Kód musí mať 6 číslic",
    errExpired: "Platnosť kódu vypršala. Požiadaj rodiča, nech vytvorí nový.",
    errNotFound: "Kód sa nenašiel",
    errGeneric: "Niečo sa pokazilo. Skús to znova.",
  },
  it: {
    title: "Unisciti a una famiglia",
    sub: "Scrivi il codice di 6 cifre creato dal tuo genitore",
    inputLabel: "Codice di 6 cifre",
    submit: "Continua",
    joining: "Accesso in corso...",
    success: "Fatto! Ti portiamo su Gadit...",
    errInvalid: "Il codice deve avere 6 cifre",
    errExpired: "Il codice è scaduto. Chiedi al tuo genitore di crearne uno nuovo.",
    errNotFound: "Codice non trovato",
    errGeneric: "Qualcosa è andato storto. Riprova.",
  },
  ja: {
    title: "家族に参加する",
    sub: "保護者が発行した6桁のコードを入力してください",
    inputLabel: "6桁のコード",
    submit: "続ける",
    joining: "参加中...",
    success: "参加しました！Gadit に移動しています...",
    errInvalid: "コードは6桁の数字で入力してください",
    errExpired: "コードの有効期限が切れました。保護者に新しいコードを発行してもらってください。",
    errNotFound: "コードが見つかりません",
    errGeneric: "問題が発生しました。もう一度お試しください。",
  },
  uk: {
    title: "Приєднатися до родини",
    sub: "Введи 6-значний код, який створили твої батьки",
    inputLabel: "6-значний код",
    submit: "Продовжити",
    joining: "Приєднуємося...",
    success: "Готово! Переходимо до Gadit...",
    errInvalid: "Код має складатися з 6 цифр",
    errExpired: "Термін дії коду минув. Попроси батьків створити новий.",
    errNotFound: "Код не знайдено",
    errGeneric: "Щось пішло не так. Спробуй ще раз.",
  },
  tr: {
    title: "Bir aileye katıl",
    sub: "Ebeveyninin oluşturduğu 6 haneli kodu yaz",
    inputLabel: "6 haneli kod",
    submit: "Devam et",
    joining: "Katılınıyor...",
    success: "Katıldın! Seni Gadit'e götürüyoruz...",
    errInvalid: "Kod 6 haneli olmalı",
    errExpired: "Kodun süresi doldu. Ebeveyninden yeni bir kod oluşturmasını iste.",
    errNotFound: "Kod bulunamadı",
    errGeneric: "Bir şeyler ters gitti. Lütfen tekrar dene.",
  },
  pl: {
    title: "Dołącz do rodziny",
    sub: "Wpisz 6-cyfrowy kod wygenerowany przez rodzica",
    inputLabel: "6-cyfrowy kod",
    submit: "Dalej",
    joining: "Dołączanie...",
    success: "Gotowe! Przenosimy cię do Gadit...",
    errInvalid: "Kod musi mieć 6 cyfr",
    errExpired: "Kod wygasł. Poproś rodzica o wygenerowanie nowego.",
    errNotFound: "Nie znaleziono kodu",
    errGeneric: "Coś poszło nie tak. Spróbuj ponownie.",
  },
  fa: {
    title: "پیوستن به خانواده",
    sub: "کد 6 رقمی‌ای را که والدینت ساخته‌اند وارد کن",
    inputLabel: "کد 6 رقمی",
    submit: "ادامه",
    joining: "در حال پیوستن...",
    success: "انجام شد! در حال انتقال به Gadit...",
    errInvalid: "کد باید 6 رقم باشد",
    errExpired: "کد منقضی شده است. از والدینت بخواه یک کد جدید بسازند.",
    errNotFound: "کد پیدا نشد",
    errGeneric: "مشکلی پیش آمد. لطفاً دوباره امتحان کن.",
  },
  id: {
    title: "Bergabung dengan keluarga",
    sub: "Ketik kode 6 digit yang dibuat oleh orang tuamu",
    inputLabel: "Kode 6 digit",
    submit: "Lanjutkan",
    joining: "Sedang bergabung...",
    success: "Berhasil! Mengantarmu ke Gadit...",
    errInvalid: "Kode harus 6 digit",
    errExpired: "Kode sudah kedaluwarsa. Minta orang tuamu membuat kode baru.",
    errNotFound: "Kode tidak ditemukan",
    errGeneric: "Terjadi kesalahan. Silakan coba lagi.",
  },
  nl: {
    title: "Word lid van een gezin",
    sub: "Typ de 6-cijferige code die je ouder heeft aangemaakt",
    inputLabel: "6-cijferige code",
    submit: "Doorgaan",
    joining: "Bezig met aansluiten...",
    success: "Gelukt! We brengen je naar Gadit...",
    errInvalid: "De code moet 6 cijfers hebben",
    errExpired: "De code is verlopen. Vraag je ouder om een nieuwe te maken.",
    errNotFound: "Code niet gevonden",
    errGeneric: "Er ging iets mis. Probeer het opnieuw.",
  },
  vi: {
    title: "Tham gia gia đình",
    sub: "Nhập mã 6 chữ số mà bố mẹ bạn đã tạo",
    inputLabel: "Mã 6 chữ số",
    submit: "Tiếp tục",
    joining: "Đang tham gia...",
    success: "Đã tham gia! Đang đưa bạn đến Gadit...",
    errInvalid: "Mã phải có 6 chữ số",
    errExpired: "Mã đã hết hạn. Hãy nhờ bố mẹ tạo mã mới.",
    errNotFound: "Không tìm thấy mã",
    errGeneric: "Đã có lỗi xảy ra. Vui lòng thử lại.",
  },
  fil: {
    title: "Sumali sa isang pamilya",
    sub: "I-type ang 6-digit na code na ginawa ng magulang mo",
    inputLabel: "6-digit na code",
    submit: "Magpatuloy",
    joining: "Sumasali...",
    success: "Nakasali ka na! Dinadala ka namin sa Gadit...",
    errInvalid: "Dapat 6 na digit ang code",
    errExpired: "Nag-expire na ang code. Hilingin sa magulang mo na gumawa ng bago.",
    errNotFound: "Hindi nahanap ang code",
    errGeneric: "May nangyaring mali. Pakisubukan ulit.",
  },
  af: {
    title: "Sluit by 'n gesin aan",
    sub: "Tik die 6-syfer-kode in wat jou ouer geskep het",
    inputLabel: "6-syfer-kode",
    submit: "Gaan voort",
    joining: "Sluit aan...",
    success: "Klaar! Ons neem jou na Gadit...",
    errInvalid: "Die kode moet 6 syfers hê",
    errExpired: "Die kode het verval. Vra jou ouer om 'n nuwe een te skep.",
    errNotFound: "Kode nie gevind nie",
    errGeneric: "Iets het verkeerd geloop. Probeer asseblief weer.",
  },
  sw: {
    title: "Jiunge na familia",
    sub: "Andika msimbo wa tarakimu 6 ambao mzazi wako ameunda",
    inputLabel: "Msimbo wa tarakimu 6",
    submit: "Endelea",
    joining: "Inajiunga...",
    success: "Umejiunga! Tunakupeleka kwenye Gadit...",
    errInvalid: "Msimbo lazima uwe na tarakimu 6",
    errExpired: "Muda wa msimbo umeisha. Mwombe mzazi wako aunde mpya.",
    errNotFound: "Msimbo haukupatikana",
    errGeneric: "Hitilafu imetokea. Tafadhali jaribu tena.",
  },
  "zh-CN": {
    title: "加入家庭",
    sub: "输入家长生成的 6 位数代码",
    inputLabel: "6 位数代码",
    submit: "继续",
    joining: "正在加入...",
    success: "加入成功！正在带你前往 Gadit...",
    errInvalid: "代码必须是 6 位数字",
    errExpired: "代码已过期。请让家长生成一个新代码。",
    errNotFound: "找不到该代码",
    errGeneric: "出了点问题，请重试。",
  },
  "zh-TW": {
    title: "加入家庭",
    sub: "輸入家長產生的 6 位數代碼",
    inputLabel: "6 位數代碼",
    submit: "繼續",
    joining: "正在加入...",
    success: "加入成功！正在帶你前往 Gadit...",
    errInvalid: "代碼必須是 6 位數字",
    errExpired: "代碼已過期。請家長產生一組新代碼。",
    errNotFound: "找不到此代碼",
    errGeneric: "發生了一點問題，請再試一次。",
  },
  ko: {
    title: "가족에 참여하기",
    sub: "부모님이 만든 6자리 코드를 입력하세요",
    inputLabel: "6자리 코드",
    submit: "계속",
    joining: "참여하는 중...",
    success: "참여 완료! Gadit로 이동하고 있어요...",
    errInvalid: "코드는 6자리 숫자여야 해요",
    errExpired: "코드가 만료되었어요. 부모님께 새 코드를 만들어 달라고 하세요.",
    errNotFound: "코드를 찾을 수 없어요",
    errGeneric: "문제가 발생했어요. 다시 시도해 주세요.",
  },
  th: {
    title: "เข้าร่วมครอบครัว",
    sub: "พิมพ์รหัส 6 หลักที่ผู้ปกครองของคุณสร้างไว้",
    inputLabel: "รหัส 6 หลัก",
    submit: "ดำเนินการต่อ",
    joining: "กำลังเข้าร่วม...",
    success: "เข้าร่วมแล้ว! กำลังพาคุณไปที่ Gadit...",
    errInvalid: "รหัสต้องมี 6 หลัก",
    errExpired: "รหัสหมดอายุแล้ว ขอให้ผู้ปกครองสร้างรหัสใหม่",
    errNotFound: "ไม่พบรหัสนี้",
    errGeneric: "เกิดข้อผิดพลาด โปรดลองอีกครั้ง",
  },
  bn: {
    title: "পরিবারে যোগ দাও",
    sub: "তোমার মা-বাবার তৈরি করা 6-সংখ্যার কোডটি লেখো",
    inputLabel: "6-সংখ্যার কোড",
    submit: "চালিয়ে যাও",
    joining: "যোগ দেওয়া হচ্ছে...",
    success: "যোগ দেওয়া হয়েছে! তোমাকে Gadit-এ নিয়ে যাচ্ছি...",
    errInvalid: "কোডটি অবশ্যই 6 সংখ্যার হতে হবে",
    errExpired: "কোডের মেয়াদ শেষ। মা-বাবাকে নতুন কোড তৈরি করতে বলো।",
    errNotFound: "কোড পাওয়া যায়নি",
    errGeneric: "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করো।",
  },
  da: {
    title: "Bliv en del af en familie",
    sub: "Skriv den 6-cifrede kode, som din forælder har lavet",
    inputLabel: "6-cifret kode",
    submit: "Fortsæt",
    joining: "Forbinder...",
    success: "Du er med! Vi sender dig videre til Gadit...",
    errInvalid: "Koden skal være på 6 cifre",
    errExpired: "Koden er udløbet. Bed din forælder om at lave en ny.",
    errNotFound: "Koden blev ikke fundet",
    errGeneric: "Noget gik galt. Prøv igen.",
  },
  hu: {
    title: "Csatlakozás egy családhoz",
    sub: "Írd be a 6 jegyű kódot, amelyet a szülőd hozott létre",
    inputLabel: "6 jegyű kód",
    submit: "Tovább",
    joining: "Csatlakozás...",
    success: "Sikerült! Megnyitjuk neked a Gadit alkalmazást...",
    errInvalid: "A kódnak 6 számjegyből kell állnia",
    errExpired: "A kód lejárt. Kérd meg a szülődet, hogy hozzon létre újat.",
    errNotFound: "A kód nem található",
    errGeneric: "Valami hiba történt. Próbáld újra.",
  },
};

export function JoinClient() {
  const router = useRouter();
  const search = useSearchParams();
  const { lang, dir } = useLang();
  const href = useHref();
  const c = COPY[lang] ?? COPY.en;

  const [code, setCode] = useState<string>(search.get("code") ?? "");
  const [status, setStatus] = useState<"idle" | "joining" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-submit if a code came in via the QR link.
  useEffect(() => {
    const initial = search.get("code");
    if (initial && /^\d{6}$/.test(initial)) {
      void submit(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(c6: string) {
    if (!/^\d{6}$/.test(c6)) {
      setErrorMsg(c.errInvalid);
      setStatus("error");
      return;
    }
    setStatus("joining");
    setErrorMsg("");
    try {
      const res = await fetch("/api/family/pair/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c6 }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "code_expired") setErrorMsg(c.errExpired);
        else if (data.error === "code_not_found") setErrorMsg(c.errNotFound);
        else setErrorMsg(c.errGeneric);
        setStatus("error");
        return;
      }
      // Sign in with the custom token. Firebase persists via IndexedDB.
      await signInWithCustomToken(firebaseAuth, data.token);
      setStatus("success");
      // Land on the main app — kids/parents both use the dictionary
      // search as their primary surface for v1.
      setTimeout(() => router.push(href("/")), 600);
    } catch (e) {
      console.error("redeem failed:", e);
      setErrorMsg(c.errGeneric);
      setStatus("error");
    }
  }

  return (
    <div className="wordbook wb-family-page" dir={dir}>
      <main className="wb-family-main">
        <header className="wb-family-header">
          <h1 className="wb-family-title">{c.title}</h1>
          <p className="wb-family-sub">{c.sub}</p>
        </header>

        <div className="wb-family-pair-card">
          {status === "success" ? (
            <div className="wb-family-join-success">{c.success}</div>
          ) : (
            <>
              <label className="wb-family-field" style={{ width: "100%" }}>
                <span className="wb-family-field-label">{c.inputLabel}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="wb-family-code-input"
                  autoFocus
                  dir="ltr"
                />
              </label>
              {errorMsg && <div className="wb-family-error">{errorMsg}</div>}
              <button
                type="button"
                className="wb-family-cta"
                onClick={() => submit(code)}
                disabled={status === "joining" || code.length !== 6}
              >
                {status === "joining" ? c.joining : c.submit}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

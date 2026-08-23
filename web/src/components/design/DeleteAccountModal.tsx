"use client";

import { useState } from "react";
import type { User } from "firebase/auth";

/**
 * Delete-account exit survey (Gadi 2026-08-13). Before deleting, the user
 * picks a reason (optional) + can leave a note, then types their email to
 * confirm (the accidental-delete guard). Reason + note are stored in the
 * deletionLog and emailed to Gadi, so every departure gives churn feedback.
 */

type Lang = string;

const COPY: Record<string, {
  title: string; sub: string; why: string; notePlaceholder: string;
  confirmLabel: string; cancel: string; del: string; deleting: string;
  failed: string;
}> = {
  es: { title: "Antes de irte", sub: "Eliminar tu cuenta cancela cualquier suscripción y borra tus palabras guardadas. Esto no se puede deshacer.", why: "¿Por qué te vas? (opcional)", notePlaceholder: "¿Algo que quieras contarnos? (opcional)", confirmLabel: "Escribe tu correo para confirmar:", cancel: "Conservar mi cuenta", del: "Eliminar mi cuenta", deleting: "Eliminando…", failed: "No se pudo eliminar. Inténtalo de nuevo o escríbenos a support@gadit.app." },
  pt: { title: "Antes de você ir", sub: "Excluir sua conta cancela qualquer assinatura e apaga suas palavras salvas. Isso não pode ser desfeito.", why: "Por que você está saindo? (opcional)", notePlaceholder: "Algo que você gostaria de nos dizer? (opcional)", confirmLabel: "Digite seu e-mail para confirmar:", cancel: "Manter minha conta", del: "Excluir minha conta", deleting: "Excluindo…", failed: "Falha na exclusão. Tente novamente ou escreva para support@gadit.app." },
  fr: { title: "Avant de partir", sub: "Supprimer votre compte annule tout abonnement et efface vos mots enregistrés. Cette action est irréversible.", why: "Pourquoi partez-vous ? (facultatif)", notePlaceholder: "Quelque chose à nous dire ? (facultatif)", confirmLabel: "Saisissez votre e-mail pour confirmer :", cancel: "Garder mon compte", del: "Supprimer mon compte", deleting: "Suppression…", failed: "La suppression a échoué. Veuillez réessayer ou nous écrire à support@gadit.app." },
  de: { title: "Bevor du gehst", sub: "Wenn du dein Konto löschst, werden alle Abos gekündigt und deine gespeicherten Wörter entfernt. Das lässt sich nicht rückgängig machen.", why: "Warum gehst du? (optional)", notePlaceholder: "Möchtest du uns etwas mitteilen? (optional)", confirmLabel: "Gib zur Bestätigung deine E-Mail ein:", cancel: "Konto behalten", del: "Konto löschen", deleting: "Wird gelöscht…", failed: "Löschen fehlgeschlagen. Bitte versuche es erneut oder schreibe an support@gadit.app." },
  cs: { title: "Než odejdete", sub: "Smazání účtu zruší jakékoli předplatné a vymaže vaše uložená slova. Tuto akci nelze vrátit zpět.", why: "Proč odcházíte? (nepovinné)", notePlaceholder: "Chcete nám něco sdělit? (nepovinné)", confirmLabel: "Pro potvrzení zadejte svůj e-mail:", cancel: "Ponechat účet", del: "Smazat účet", deleting: "Mazání…", failed: "Smazání se nezdařilo. Zkuste to prosím znovu nebo napište na support@gadit.app." },
  sk: { title: "Než odídete", sub: "Zmazanie účtu zruší akékoľvek predplatné a vymaže vaše uložené slová. Túto akciu nemožno vrátiť späť.", why: "Prečo odchádzate? (nepovinné)", notePlaceholder: "Chcete nám niečo povedať? (nepovinné)", confirmLabel: "Na potvrdenie zadajte svoj e-mail:", cancel: "Ponechať účet", del: "Zmazať účet", deleting: "Maže sa…", failed: "Zmazanie sa nepodarilo. Skúste to prosím znova alebo napíšte na support@gadit.app." },
  it: { title: "Prima di andare", sub: "Eliminare il tuo account annulla ogni abbonamento e cancella le parole salvate. Questa azione non può essere annullata.", why: "Perché stai andando via? (facoltativo)", notePlaceholder: "C'è qualcosa che vuoi dirci? (facoltativo)", confirmLabel: "Scrivi la tua email per confermare:", cancel: "Mantieni il mio account", del: "Elimina il mio account", deleting: "Eliminazione…", failed: "Eliminazione non riuscita. Riprova o scrivici a support@gadit.app." },
  ja: { title: "その前に", sub: "アカウントを削除すると、すべてのサブスクリプションが解約され、保存した言葉も消去されます。この操作は取り消せません。", why: "退会の理由を教えてください（任意）", notePlaceholder: "何かお伝えいただけますか？（任意）", confirmLabel: "確認のためメールアドレスを入力してください:", cancel: "アカウントを残す", del: "アカウントを削除する", deleting: "削除中…", failed: "削除できませんでした。もう一度お試しいただくか、support@gadit.app までご連絡ください。" },
  hi: { title: "जाने से पहले", sub: "अपना खाता हटाने से कोई भी सदस्यता रद्द हो जाती है और आपके सहेजे गए शब्द मिट जाते हैं। इसे वापस नहीं किया जा सकता।", why: "आप क्यों जा रहे हैं? (वैकल्पिक)", notePlaceholder: "क्या आप हमें कुछ बताना चाहेंगे? (वैकल्पिक)", confirmLabel: "पुष्टि के लिए अपना ईमेल लिखें:", cancel: "मेरा खाता रखें", del: "मेरा खाता हटाएं", deleting: "हटाया जा रहा है…", failed: "हटाना विफल रहा। कृपया फिर से कोशिश करें या support@gadit.app पर ईमेल करें।" },
  am: { title: "ከመሄድዎ በፊት", sub: "መለያዎን መሰረዝ ማንኛውንም ምዝገባ ይሰርዛል እና የተቀመጡ ቃላትዎን ያጠፋል። ይህ መልሶ ማድረግ አይቻልም።", why: "ለምን እየሄዱ ነው? (አማራጭ)", notePlaceholder: "ልትነግሩን የምትፈልጉት ነገር አለ? (አማራጭ)", confirmLabel: "ለማረጋገጥ ኢሜይልዎን ይተይቡ፦", cancel: "መለያዬን አቆይ", del: "መለያዬን ሰርዝ", deleting: "በመሰረዝ ላይ…", failed: "መሰረዝ አልተሳካም። እባክዎ እንደገና ይሞክሩ ወይም support@gadit.app ኢሜይል ያድርጉ።" },
  uk: { title: "Перш ніж піти", sub: "Видалення облікового запису скасує будь-яку підписку та зітре збережені слова. Це неможливо скасувати.", why: "Чому ви йдете? (необов'язково)", notePlaceholder: "Хочете щось нам розповісти? (необов'язково)", confirmLabel: "Введіть свою електронну пошту для підтвердження:", cancel: "Залишити мій обліковий запис", del: "Видалити мій обліковий запис", deleting: "Видалення…", failed: "Не вдалося видалити. Будь ласка, спробуйте ще раз або напишіть на support@gadit.app." },
  tr: { title: "Gitmeden önce", sub: "Hesabınızı silmek tüm abonelikleri iptal eder ve kaydettiğiniz kelimeleri siler. Bu geri alınamaz.", why: "Neden ayrılıyorsunuz? (isteğe bağlı)", notePlaceholder: "Bize söylemek istediğiniz bir şey var mı? (isteğe bağlı)", confirmLabel: "Onaylamak için e-postanızı yazın:", cancel: "Hesabımı koru", del: "Hesabımı sil", deleting: "Siliniyor…", failed: "Silme başarısız oldu. Lütfen tekrar deneyin veya support@gadit.app adresine e-posta gönderin." },
  pl: { title: "Zanim odejdziesz", sub: "Usunięcie konta anuluje wszelkie subskrypcje i wymaże zapisane słowa. Tego nie można cofnąć.", why: "Dlaczego odchodzisz? (opcjonalnie)", notePlaceholder: "Chcesz nam coś powiedzieć? (opcjonalnie)", confirmLabel: "Wpisz swój adres e-mail, aby potwierdzić:", cancel: "Zachowaj moje konto", del: "Usuń moje konto", deleting: "Usuwanie…", failed: "Usuwanie nie powiodło się. Spróbuj ponownie lub napisz na support@gadit.app." },
  fa: { title: "پیش از رفتن", sub: "حذف حساب شما هر اشتراکی را لغو می‌کند و کلمات ذخیره‌شده‌تان را پاک می‌کند. این کار قابل بازگشت نیست.", why: "چرا می‌روید؟ (اختیاری)", notePlaceholder: "چیزی هست که بخواهید به ما بگویید؟ (اختیاری)", confirmLabel: "برای تأیید، ایمیل خود را وارد کنید:", cancel: "حساب من را نگه دار", del: "حساب من را حذف کن", deleting: "در حال حذف…", failed: "حذف ناموفق بود. لطفاً دوباره تلاش کنید یا به support@gadit.app ایمیل بزنید." },
  id: { title: "Sebelum Anda pergi", sub: "Menghapus akun Anda akan membatalkan langganan apa pun dan menghapus kata-kata yang Anda simpan. Ini tidak bisa dibatalkan.", why: "Mengapa Anda pergi? (opsional)", notePlaceholder: "Ada yang ingin Anda sampaikan kepada kami? (opsional)", confirmLabel: "Ketik email Anda untuk mengonfirmasi:", cancel: "Pertahankan akun saya", del: "Hapus akun saya", deleting: "Menghapus…", failed: "Penghapusan gagal. Silakan coba lagi atau kirim email ke support@gadit.app." },
  nl: { title: "Voordat je gaat", sub: "Als je je account verwijdert, wordt elk abonnement opgezegd en worden je opgeslagen woorden gewist. Dit kan niet ongedaan worden gemaakt.", why: "Waarom vertrek je? (optioneel)", notePlaceholder: "Wil je ons iets vertellen? (optioneel)", confirmLabel: "Typ je e-mailadres ter bevestiging:", cancel: "Mijn account behouden", del: "Mijn account verwijderen", deleting: "Verwijderen…", failed: "Verwijderen mislukt. Probeer het opnieuw of mail naar support@gadit.app." },
  el: { title: "Πριν φύγετε", sub: "Η διαγραφή του λογαριασμού σας ακυρώνει κάθε συνδρομή και σβήνει τις αποθηκευμένες λέξεις σας. Αυτό δεν μπορεί να αναιρεθεί.", why: "Γιατί φεύγετε; (προαιρετικό)", notePlaceholder: "Θέλετε να μας πείτε κάτι; (προαιρετικό)", confirmLabel: "Πληκτρολογήστε το email σας για επιβεβαίωση:", cancel: "Διατήρηση του λογαριασμού μου", del: "Διαγραφή του λογαριασμού μου", deleting: "Διαγραφή…", failed: "Η διαγραφή απέτυχε. Δοκιμάστε ξανά ή στείλτε email στο support@gadit.app." },
  zu: { title: "Ngaphambi kokuba uhambe", sub: "Ukususa i-akhawunti yakho kukhansela noma yikuphi ukubhalisa futhi kususa amagama akho alondoloziwe. Lokhu ngeke kubuyiselwe emuva.", why: "Kungani uhamba? (okuzikhethelayo)", notePlaceholder: "Kukhona ongathanda ukusitshela khona? (okuzikhethelayo)", confirmLabel: "Bhala i-imeyili yakho ukuze uqinisekise:", cancel: "Gcina i-akhawunti yami", del: "Susa i-akhawunti yami", deleting: "Iyasusa…", failed: "Ukususa kuhlulekile. Sicela uzame futhi noma uthumele i-imeyili ku-support@gadit.app." },
  vi: { title: "Trước khi bạn rời đi", sub: "Xóa tài khoản sẽ hủy mọi gói đăng ký và xóa các từ đã lưu của bạn. Việc này không thể hoàn tác.", why: "Vì sao bạn rời đi? (không bắt buộc)", notePlaceholder: "Bạn muốn chia sẻ điều gì với chúng tôi không? (không bắt buộc)", confirmLabel: "Nhập email của bạn để xác nhận:", cancel: "Giữ tài khoản của tôi", del: "Xóa tài khoản của tôi", deleting: "Đang xóa…", failed: "Xóa không thành công. Vui lòng thử lại hoặc gửi email đến support@gadit.app." },
  fil: { title: "Bago ka umalis", sub: "Ang pagbura ng iyong account ay magkakansela ng anumang subscription at magbubura ng mga naka-save mong salita. Hindi na ito maibabalik.", why: "Bakit ka umaalis? (opsyonal)", notePlaceholder: "May gusto ka bang sabihin sa amin? (opsyonal)", confirmLabel: "I-type ang iyong email para kumpirmahin:", cancel: "Panatilihin ang aking account", del: "Burahin ang aking account", deleting: "Binubura…", failed: "Hindi natuloy ang pagbura. Pakisubukang muli o mag-email sa support@gadit.app." },
  af: { title: "Voordat jy gaan", sub: "Om jou rekening te skrap, kanselleer enige intekening en vee jou gestoorde woorde uit. Dit kan nie ongedaan gemaak word nie.", why: "Hoekom gaan jy weg? (opsioneel)", notePlaceholder: "Is daar iets wat jy ons wil vertel? (opsioneel)", confirmLabel: "Tik jou e-pos om te bevestig:", cancel: "Hou my rekening", del: "Skrap my rekening", deleting: "Besig om te skrap…", failed: "Skrapping het misluk. Probeer asseblief weer of e-pos support@gadit.app." },
  sw: { title: "Kabla ya kuondoka", sub: "Kufuta akaunti yako kutasitisha usajili wowote na kufuta maneno yako uliyohifadhi. Hili haliwezi kutenduliwa.", why: "Kwa nini unaondoka? (hiari)", notePlaceholder: "Kuna chochote ungependa kutuambia? (hiari)", confirmLabel: "Andika barua pepe yako ili kuthibitisha:", cancel: "Baki na akaunti yangu", del: "Futa akaunti yangu", deleting: "Inafuta…", failed: "Kufuta kumeshindikana. Tafadhali jaribu tena au tuma barua pepe kwa support@gadit.app." },
  "zh-CN": { title: "在你离开之前", sub: "删除账户会取消所有订阅并清除你保存的单词。此操作无法撤销。", why: "你为什么要离开？（可选）", notePlaceholder: "有什么想告诉我们的吗？（可选）", confirmLabel: "输入你的邮箱以确认：", cancel: "保留我的账户", del: "删除我的账户", deleting: "正在删除…", failed: "删除失败。请重试或发送邮件至 support@gadit.app。" },
  "zh-TW": { title: "在你離開之前", sub: "刪除帳戶會取消所有訂閱並清除你儲存的單字。此操作無法復原。", why: "你為什麼要離開？（選填）", notePlaceholder: "有什麼想告訴我們的嗎？（選填）", confirmLabel: "輸入你的電子郵件以確認：", cancel: "保留我的帳戶", del: "刪除我的帳戶", deleting: "正在刪除…", failed: "刪除失敗。請重試或寄送電子郵件至 support@gadit.app。" },
  ko: { title: "떠나기 전에", sub: "계정을 삭제하면 모든 구독이 취소되고 저장한 단어가 지워집니다. 이 작업은 되돌릴 수 없어요.", why: "왜 떠나시나요? (선택)", notePlaceholder: "저희에게 하고 싶은 말이 있나요? (선택)", confirmLabel: "확인을 위해 이메일을 입력하세요:", cancel: "계정 유지하기", del: "계정 삭제하기", deleting: "삭제 중…", failed: "삭제에 실패했어요. 다시 시도하거나 support@gadit.app으로 이메일을 보내주세요." },
  th: { title: "ก่อนที่คุณจะไป", sub: "การลบบัญชีของคุณจะยกเลิกการสมัครสมาชิกทั้งหมดและลบคำศัพท์ที่คุณบันทึกไว้ การดำเนินการนี้ไม่สามารถย้อนกลับได้", why: "ทำไมคุณถึงจะไป? (ไม่บังคับ)", notePlaceholder: "มีอะไรอยากบอกเราไหม? (ไม่บังคับ)", confirmLabel: "พิมพ์อีเมลของคุณเพื่อยืนยัน:", cancel: "เก็บบัญชีของฉันไว้", del: "ลบบัญชีของฉัน", deleting: "กำลังลบ…", failed: "การลบล้มเหลว โปรดลองอีกครั้งหรือส่งอีเมลถึง support@gadit.app" },
  bn: { title: "যাওয়ার আগে", sub: "আপনার অ্যাকাউন্ট মুছে ফেললে যেকোনো সাবস্ক্রিপশন বাতিল হবে এবং আপনার সংরক্ষিত শব্দগুলো মুছে যাবে। এটি আর ফেরানো যাবে না।", why: "আপনি কেন চলে যাচ্ছেন? (ঐচ্ছিক)", notePlaceholder: "আমাদের কিছু বলতে চান? (ঐচ্ছিক)", confirmLabel: "নিশ্চিত করতে আপনার ইমেল টাইপ করুন:", cancel: "আমার অ্যাকাউন্ট রাখুন", del: "আমার অ্যাকাউন্ট মুছুন", deleting: "মুছে ফেলা হচ্ছে…", failed: "মুছে ফেলা ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন অথবা support@gadit.app-এ ইমেল করুন।" },
  da: { title: "Før du går", sub: "Når du sletter din konto, annulleres ethvert abonnement, og dine gemte ord slettes. Det kan ikke fortrydes.", why: "Hvorfor forlader du os? (valgfrit)", notePlaceholder: "Er der noget, du gerne vil fortælle os? (valgfrit)", confirmLabel: "Skriv din e-mail for at bekræfte:", cancel: "Behold min konto", del: "Slet min konto", deleting: "Sletter…", failed: "Sletningen mislykkedes. Prøv venligst igen, eller skriv til support@gadit.app." },
  hu: { title: "Mielőtt elmész", sub: "A fiókod törlése lemond minden előfizetést, és törli a mentett szavaidat. Ez nem vonható vissza.", why: "Miért lépsz ki? (nem kötelező)", notePlaceholder: "Szeretnél valamit elmondani nekünk? (nem kötelező)", confirmLabel: "Írd be az e-mail-címedet a megerősítéshez:", cancel: "A fiókom megtartása", del: "A fiókom törlése", deleting: "Törlés…", failed: "A törlés nem sikerült. Kérjük, próbáld újra, vagy írj a support@gadit.app címre." },
  en: {
    title: "Before you go",
    sub: "Deleting your account cancels any subscription and erases your saved words. This can't be undone.",
    why: "Why are you leaving? (optional)",
    notePlaceholder: "Anything you'd like to tell us? (optional)",
    confirmLabel: "Type your email to confirm:",
    cancel: "Keep my account",
    del: "Delete my account",
    deleting: "Deleting…",
    failed: "Deletion failed. Please try again or email support@gadit.app.",
  },
  he: {
    title: "לפני שעוזבים",
    sub: "מחיקת החשבון מבטלת כל מנוי ומוחקת את המילים ששמרת. אי אפשר לשחזר.",
    why: "למה בחרת לעזוב? (לא חובה)",
    notePlaceholder: "משהו שתרצה לספר לנו? (לא חובה)",
    confirmLabel: "כדי לאשר, הקלד/י את המייל שלך:",
    cancel: "להשאיר את החשבון",
    del: "למחוק את החשבון",
    deleting: "מוחק…",
    failed: "המחיקה נכשלה. נסו שוב או פנו ל-support@gadit.app.",
  },
  ar: {
    title: "قبل أن تغادر",
    sub: "حذف الحساب يُلغي أي اشتراك ويمحو كلماتك المحفوظة. لا يمكن التراجع.",
    why: "لماذا تغادر؟ (اختياري)",
    notePlaceholder: "هل تودّ إخبارنا بشيء؟ (اختياري)",
    confirmLabel: "للتأكيد، اكتب بريدك الإلكتروني:",
    cancel: "الإبقاء على حسابي",
    del: "حذف حسابي",
    deleting: "جارٍ الحذف…",
    failed: "فشل الحذف. حاول مجددًا أو راسل support@gadit.app.",
  },
  ru: {
    title: "Перед уходом",
    sub: "Удаление аккаунта отменяет подписку и стирает сохранённые слова. Отменить нельзя.",
    why: "Почему вы уходите? (необязательно)",
    notePlaceholder: "Хотите что-то нам сказать? (необязательно)",
    confirmLabel: "Для подтверждения введите свой email:",
    cancel: "Оставить аккаунт",
    del: "Удалить аккаунт",
    deleting: "Удаление…",
    failed: "Не удалось удалить. Попробуйте снова или напишите на support@gadit.app.",
  },
};

// Reason value stored (English, canonical) + localized labels for display.
const REASONS: Array<Record<string, string>> = [
  { en: "I don't need it right now", he: "אני לא צריך/ה את זה כרגע", ar: "لا أحتاجه الآن", ru: "Сейчас мне это не нужно" },
  { en: "I didn't use it enough", he: "לא השתמשתי בזה מספיק", ar: "لم أستخدمه بما يكفي", ru: "Мало пользовался(лась)" },
  { en: "Too expensive for me", he: "יקר מדי בשבילי", ar: "غالٍ جدًا بالنسبة لي", ru: "Слишком дорого" },
  { en: "It was confusing / hard to use", he: "היה מבלבל / קשה להשתמש", ar: "كان مربكًا / صعب الاستخدام", ru: "Запутанно / сложно" },
  { en: "I found another solution", he: "מצאתי פתרון אחר", ar: "وجدت حلاً آخر", ru: "Нашёл(ла) другое решение" },
];

export function DeleteAccountModal({
  user,
  lang,
  dir,
  onClose,
  onDeleted,
}: {
  user: User;
  lang: Lang;
  dir: "rtl" | "ltr";
  onClose: () => void;
  onDeleted: () => void;
}) {
  const c = COPY[lang] ?? COPY.en;
  const label = (r: Record<string, string>) => r[lang] ?? r.en;
  const acctEmail = (user.email ?? "").trim();
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const emailOk = !!acctEmail && typed.trim().toLowerCase() === acctEmail.toLowerCase();

  async function doDelete() {
    if (!emailOk || busy) return;
    setBusy(true);
    setErr("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail: acctEmail, reason: reason || null, comment: comment.trim() || null }),
      });
      if (!res.ok) {
        setErr(c.failed);
        setBusy(false);
        return;
      }
      onDeleted();
    } catch {
      setErr(c.failed);
      setBusy(false);
    }
  }

  const radioRow: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 10, padding: "9px 11px",
    borderRadius: 10, border: "1px solid rgba(17,24,39,0.12)", cursor: "pointer",
    fontSize: 14, color: "#374151", fontFamily: "inherit",
  };

  return (
    <div
      onClick={() => !busy && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        dir={dir}
        style={{ background: "#fff", borderRadius: 18, padding: "24px 22px", width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 70px rgba(17,24,39,0.3)", textAlign: dir === "rtl" ? "right" : "left" }}
      >
        <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "#111827" }}>{c.title}</h3>
        <p style={{ margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.5, color: "#6b7280" }}>{c.sub}</p>

        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>{c.why}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {REASONS.map((r) => {
            const val = r.en;
            const active = reason === val;
            return (
              <label key={val} style={{ ...radioRow, borderColor: active ? "#0EA5A5" : "rgba(17,24,39,0.12)", background: active ? "rgba(14,165,165,0.06)" : "#fff" }}>
                <input type="radio" name="del-reason" checked={active} onChange={() => setReason(val)} style={{ accentColor: "#0EA5A5", width: 16, height: 16, flexShrink: 0 }} />
                <span>{label(r)}</span>
              </label>
            );
          })}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={c.notePlaceholder}
          rows={3}
          maxLength={1000}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(17,24,39,0.18)", fontSize: 14, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", marginBottom: 18 }}
        />

        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>{c.confirmLabel}</div>
        <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 6, direction: "ltr", textAlign: dir === "rtl" ? "right" : "left" }}>{acctEmail}</div>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={acctEmail}
          dir="ltr"
          autoComplete="off"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${typed && !emailOk ? "#EF4444" : "rgba(17,24,39,0.18)"}`, fontSize: 15, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 18 }}
        />

        {err && <div style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{err}</div>}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{ flex: 1, padding: "12px", borderRadius: 11, border: "1px solid rgba(17,24,39,0.18)", background: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#111827" }}
          >
            {c.cancel}
          </button>
          <button
            type="button"
            onClick={doDelete}
            disabled={!emailOk || busy}
            style={{ flex: 1, padding: "12px", borderRadius: 11, border: "none", background: emailOk && !busy ? "#DC2626" : "#FCA5A5", color: "#fff", fontWeight: 800, fontSize: 14, cursor: emailOk && !busy ? "pointer" : "default", fontFamily: "inherit" }}
          >
            {busy ? c.deleting : c.del}
          </button>
        </div>
      </div>
    </div>
  );
}

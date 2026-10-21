"use client";

import { WaitText } from "@/components/WaitText";
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
  xh: {
    title: "Ngaphambi kokuba uhambe",
    sub: "Ukucima iakhawunti yakho kurhoxisa nawuphi na umrhumo kwaye kucima amagama akho agciniweyo. Oku akunakubuyiselwa.",
    why: "Kutheni uhamba? (akunyanzelekanga)",
    notePlaceholder: "Ingaba ikhona into ofuna ukusixelela yona? (akunyanzelekanga)",
    confirmLabel: "Chwetheza i-imeyile yakho ukuze uqinisekise:",
    cancel: "Gcina iakhawunti yam",
    del: "Cima iakhawunti yam",
    deleting: "Siyacima…",
    failed: "Ukucima akuphumelelanga. Nceda uzame kwakhona okanye uthumele i-imeyile ku-support@gadit.app.",
  },
  nso: {
    title: "Pele o tloga",
    sub: "Go phumola akhaonto ya gago go khansela peeletšo efe goba efe gomme go phumola mantšu ao o a bolokilego. Se se ka se bušetšwe morago.",
    why: "O tlogela ka lebaka la eng? (ga go gapeletšwe)",
    notePlaceholder: "Na go na le se o ratago go re botša sona? (ga go gapeletšwe)",
    confirmLabel: "Tlanya imeile ya gago go kgonthiša:",
    cancel: "Boloka akhaonto ya ka",
    del: "Phumola akhaonto ya ka",
    deleting: "Re a phumola…",
    failed: "Go phumola go paletšwe. Hle leka gape goba o romele imeile go support@gadit.app.",
  },
  tn: {
    title: "Pele o tsamaya",
    sub: "Go phimola akhaonto ya gago go khansela ikwadiso epe mme go phimola mafoko a o a bolokileng. Se ga se kgone go busediwa morago.",
    why: "Goreng o tsamaya? (ga go patelediwe)",
    notePlaceholder: "A go na le sengwe se o batlang go re bolelela sone? (ga go patelediwe)",
    confirmLabel: "Kwala imeile ya gago go tlhomamisa:",
    cancel: "Boloka akhaonto ya me",
    del: "Phimola akhaonto ya me",
    deleting: "Re a phimola…",
    failed: "Go phimola go padile. Tsweetswee leka gape kgotsa romela imeile kwa support@gadit.app.",
  },
  st: {
    title: "Pele o tsamaya",
    sub: "Ho hlakola akhaonte ya hao ho emisa ngodiso efe kapa efe mme ho hlakola mantswe ao o a bolokileng. Sena se ke ke sa kgutliswa.",
    why: "Hobaneng o tsamaya? (ha ho qobellwe)",
    notePlaceholder: "Ho na le ho hong hoo o ka ratang ho re bolella hona? (ha ho qobellwe)",
    confirmLabel: "Ngola imeile ya hao ho netefatsa:",
    cancel: "Boloka akhaonte ya ka",
    del: "Hlakola akhaonte ya ka",
    deleting: "Re a hlakola…",
    failed: "Ho hlakola ho hlolehile. Ka kopo leka hape kapa o romele imeile ho support@gadit.app.",
  },
  ts: {
    title: "Emahlweni ka loko mi famba",
    sub: "Ku susa akhawunti ya n'wina swi khansela mbhaliso wun'wana na wun'wana naswona swi sula marito lawa mi ma hlayiseke. Leswi a swi nge tlheriseleki endzhaku.",
    why: "Hikokwalaho ka yini mi famba? (a swi boheki)",
    notePlaceholder: "Ku na leswi mi lavaka ku hi byela swona? (a swi boheki)",
    confirmLabel: "Tsalani imeyili ya n'wina leswaku mi tiyisisa:",
    cancel: "Hlayisa akhawunti ya mina",
    del: "Susa akhawunti ya mina",
    deleting: "Ku susa…",
    failed: "Ku susa a swi tirhanga. Hi kombela mi ringeta nakambe kumbe mi rhumela imeyili eka support@gadit.app.",
  },
  ss: {
    title: "Ngaphambi kwekutsi uhambe",
    sub: "Kucisha i-akhawunti yakho kukhansela kubhalisa kwakho futsi kusula emagama lowagcinile. Loku ngeke kubuyiswe.",
    why: "Kungani uhamba? (uma utsandza)",
    notePlaceholder: "Kukhona lofuna kusitjela kona? (uma utsandza)",
    confirmLabel: "Bhala i-imeyili yakho kute ucinisekise:",
    cancel: "Gcina i-akhawunti yami",
    del: "Cisha i-akhawunti yami",
    deleting: "Kuyacishwa…",
    failed: "Kucisha kwehlulekile. Sicela uphindze uzame nobe utfumele i-imeyili ku-support@gadit.app.",
  },
  ve: {
    title: "Phanḓa ha musi ni tshi ṱuwa",
    sub: "U phumula akhaunthu yaṋu zwi khansela ṅwaliso muṅwe na muṅwe nahone zwi phumula maipfi aṋu o vhulungwaho. Hezwi a zwi humiselwi murahu.",
    why: "Ni khou ṱuwa ngani? (a zwi kombetshedzwi)",
    notePlaceholder: "Hu na zwine na ṱoḓa u ri vhudza? (a zwi kombetshedzwi)",
    confirmLabel: "Ṅwalani imeiḽi yaṋu uri ni khwaṱhise:",
    cancel: "Dzulani na akhaunthu yanga",
    del: "Phumulani akhaunthu yanga",
    deleting: "Ri khou phumula…",
    failed: "A zwo ngo phumulwa. Ri humbela ni lingedze hafhu kana ni rumele imeiḽi kha support@gadit.app.",
  },
  nr: {
    title: "Ngaphambi kobana ukhambe",
    sub: "Ukusula i-akhawunti yakho kukhansela nanyana ngikuphi ukubhalisela begodu kusula amezwi owabulungileko. Lokhu angeze kwabuyiselwa emuva.",
    why: "Kubayini ukhamba? (akukateleleki)",
    notePlaceholder: "Kukhona ofuna ukusitjela khona? (akukateleleki)",
    confirmLabel: "Tlola i-imeyili yakho bona uqinisekise:",
    cancel: "Gcina i-akhawunti yami",
    del: "Sula i-akhawunti yami",
    deleting: "Kuyasulwa…",
    failed: "Ukusula kwehlulekile. Sibawa ulinge godu namkha uthumele i-imeyili ku-support@gadit.app.",
  },
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
export const REASONS: Array<Record<string, string>> = [
  { en: "I don't need it right now", he: "אני לא צריך/ה את זה כרגע", ar: "لا أحتاجه الآن", ru: "Сейчас мне это не нужно", es: "No lo necesito ahora mismo", pt: "Não preciso disso agora", fr: "Je n'en ai pas besoin pour l'instant", de: "Ich brauche es gerade nicht", cs: "Teď to nepotřebuji", sk: "Teraz to nepotrebujem", it: "Al momento non mi serve", ja: "今は必要ない", hi: "अभी मुझे इसकी ज़रूरत नहीं है", am: "አሁን አያስፈልገኝም", uk: "Зараз мені це не потрібно", tr: "Şu an ihtiyacım yok", pl: "Teraz tego nie potrzebuję", fa: "فعلاً به آن نیازی ندارم", id: "Saya sedang tidak membutuhkannya", nl: "Ik heb het nu niet nodig", el: "Δεν το χρειάζομαι αυτή τη στιγμή", zu: "Angikudingi okwamanje", xh: "Andiyidingi okwangoku", nso: "Ga ke e nyake bjale", tn: "Ga ke e tlhoke ga jaana", st: "Ha ke e hloke hona jwale", ts: "A ndzi yi lavi sweswi", ss: "Angiyidzingi nyalo", ve: "A thi i ṱoḓi zwino", nr: "Angiyitlhogi nje", vi: "Hiện tôi chưa cần", fil: "Hindi ko ito kailangan ngayon", af: "Ek het dit nie nou nodig nie", sw: "Siuhitaji kwa sasa", "zh-CN": "我现在不需要", "zh-TW": "我現在不需要", ko: "지금은 필요하지 않아요", th: "ตอนนี้ยังไม่จำเป็นต้องใช้", bn: "এখন আমার এটা দরকার নেই", da: "Jeg har ikke brug for det lige nu", hu: "Most nincs rá szükségem" },
  { en: "I didn't use it enough", he: "לא השתמשתי בזה מספיק", ar: "لم أستخدمه بما يكفي", ru: "Мало пользовался(лась)", es: "No lo usé lo suficiente", pt: "Não usei o suficiente", fr: "Je ne l'ai pas assez utilisé", de: "Ich habe es zu wenig genutzt", cs: "Málo jsem to používal(a)", sk: "Málo som to používal(a)", it: "Non l'ho usato abbastanza", ja: "あまり使わなかった", hi: "मैंने इसका ज़्यादा इस्तेमाल नहीं किया", am: "በበቂ ሁኔታ አልተጠቀምኩበትም", uk: "Мало користувався(лася)", tr: "Yeterince kullanmadım", pl: "Za mało z tego korzystałem(-am)", fa: "به اندازه‌ی کافی از آن استفاده نکردم", id: "Saya jarang memakainya", nl: "Ik heb het te weinig gebruikt", el: "Δεν το χρησιμοποίησα αρκετά", zu: "Angizange ngikusebenzise ngokwanele", xh: "Andiyisebenzisanga ngokwaneleyo", nso: "Ga ke a e šomiša ka mo go lekanego", tn: "Ga ke a e dirisa go lekana", st: "Ha ke a e sebedisa ka ho lekana", ts: "A ndzi yi tirhisanga ku ringanela", ss: "Angizange ngiyisebentise lokwenele", ve: "A tho ngo i shumisa nga u lingana", nr: "Angikhenge ngiyisebenzise ngokwaneleko", vi: "Tôi dùng chưa đủ nhiều", fil: "Hindi ko ito masyadong nagamit", af: "Ek het dit nie genoeg gebruik nie", sw: "Sikuutumia vya kutosha", "zh-CN": "我用得不够多", "zh-TW": "我用得不夠多", ko: "충분히 사용하지 않았어요", th: "ไม่ค่อยได้ใช้", bn: "আমি যথেষ্ট ব্যবহার করিনি", da: "Jeg brugte det ikke nok", hu: "Nem használtam eleget" },
  { en: "Too expensive for me", he: "יקר מדי בשבילי", ar: "غالٍ جدًا بالنسبة لي", ru: "Слишком дорого", es: "Demasiado caro para mí", pt: "Caro demais para mim", fr: "Trop cher pour moi", de: "Zu teuer für mich", cs: "Je to pro mě příliš drahé", sk: "Je to pre mňa príliš drahé", it: "Troppo caro per me", ja: "自分には高すぎる", hi: "मेरे लिए बहुत महँगा है", am: "ለእኔ በጣም ውድ ነው", uk: "Надто дорого для мене", tr: "Benim için çok pahalı", pl: "Za drogo jak dla mnie", fa: "برایم خیلی گران است", id: "Terlalu mahal bagi saya", nl: "Te duur voor mij", el: "Πολύ ακριβό για μένα", zu: "Kubiza kakhulu kimi", xh: "Iyabiza kakhulu kum", nso: "E a tura kudu go nna", tn: "E tura thata mo go nna", st: "E a ntura haholo", ts: "Yi durha ngopfu eka mina", ss: "Iyabita kakhulu kimi", ve: "I a ḓura kha nṋe", nr: "Idulu khulu kimi", vi: "Quá đắt với tôi", fil: "Masyadong mahal para sa akin", af: "Te duur vir my", sw: "Ni ghali mno kwangu", "zh-CN": "对我来说太贵了", "zh-TW": "對我來說太貴了", ko: "저에게는 너무 비싸요", th: "แพงเกินไปสำหรับฉัน", bn: "আমার জন্য খুব দামি", da: "For dyrt for mig", hu: "Túl drága nekem" },
  { en: "It was confusing / hard to use", he: "היה מבלבל / קשה להשתמש", ar: "كان مربكًا / صعب الاستخدام", ru: "Запутанно / сложно", es: "Era confuso / difícil de usar", pt: "Era confuso / difícil de usar", fr: "C'était déroutant / difficile à utiliser", de: "Es war verwirrend / schwer zu bedienen", cs: "Bylo to matoucí / složité na používání", sk: "Bolo to mätúce / ťažké na používanie", it: "Era confuso / difficile da usare", ja: "わかりにくい / 使いにくい", hi: "यह उलझाने वाला / इस्तेमाल में मुश्किल था", am: "ግራ የሚያጋባ / ለመጠቀም አስቸጋሪ ነበር", uk: "Заплутано / складно користуватися", tr: "Kafa karıştırıcıydı / kullanması zordu", pl: "Było zagmatwane / trudne w obsłudze", fa: "گیج‌کننده بود / استفاده از آن سخت بود", id: "Membingungkan / sulit dipakai", nl: "Het was verwarrend / lastig in gebruik", el: "Ήταν μπερδεμένο / δύσκολο στη χρήση", zu: "Bekudida / kunzima ukukusebenzisa", xh: "Ibibhidekisa / inzima ukuyisebenzisa", nso: "E be e gakantšha / e le thata go e šomiša", tn: "E ne e tlhakatlhakanya / e le thata go e dirisa", st: "E ne e ferekanya / e thata ho e sebedisa", ts: "A yi pfilunganya, yi tika ku tirhisiwa", ss: "Beyididayo / ilukhuni kuyisebentisa", ve: "Yo vha i tshi vhilaedza / i tshi konḓa u shumisa", nr: "Bekudida / kubudisi ukuyisebenzisa", vi: "Khó hiểu / khó sử dụng", fil: "Nakakalito / mahirap gamitin", af: "Dit was verwarrend / moeilik om te gebruik", sw: "Ulikuwa unachanganya / mgumu kutumia", "zh-CN": "让人困惑 / 不好用", "zh-TW": "讓人困惑 / 不好用", ko: "헷갈렸어요 / 사용하기 어려웠어요", th: "สับสน / ใช้งานยาก", bn: "বিভ্রান্তিকর / ব্যবহার করা কঠিন ছিল", da: "Det var forvirrende / svært at bruge", hu: "Zavaros volt / nehéz volt használni" },
  { en: "I found another solution", he: "מצאתי פתרון אחר", ar: "وجدت حلاً آخر", ru: "Нашёл(ла) другое решение", es: "Encontré otra solución", pt: "Encontrei outra solução", fr: "J'ai trouvé une autre solution", de: "Ich habe eine andere Lösung gefunden", cs: "Našel(a) jsem jiné řešení", sk: "Našiel(a) som iné riešenie", it: "Ho trovato un'altra soluzione", ja: "別の方法を見つけた", hi: "मुझे कोई और समाधान मिल गया", am: "ሌላ መፍትሄ አገኘሁ", uk: "Знайшов(ла) інше рішення", tr: "Başka bir çözüm buldum", pl: "Znalazłem(-am) inne rozwiązanie", fa: "راه‌حل دیگری پیدا کردم", id: "Saya menemukan solusi lain", nl: "Ik heb een andere oplossing gevonden", el: "Βρήκα άλλη λύση", zu: "Ngithole esinye isixazululo", xh: "Ndifumene esinye isisombululo", nso: "Ke hweditše tharollo ye nngwe", tn: "Ke bone tharabololo e nngwe", st: "Ke fumane tharollo e nngwe", ts: "Ndzi kumile ndlela yin'wana", ss: "Ngitfole lesinye sisombululo", ve: "Ndo wana iṅwe nḓila", nr: "Ngithole enye indlela", vi: "Tôi đã tìm được giải pháp khác", fil: "May nahanap akong ibang solusyon", af: "Ek het 'n ander oplossing gekry", sw: "Nimepata suluhisho jingine", "zh-CN": "我找到了其他办法", "zh-TW": "我找到了其他辦法", ko: "다른 방법을 찾았어요", th: "เจอทางเลือกอื่นแล้ว", bn: "আমি অন্য সমাধান পেয়েছি", da: "Jeg fandt en anden løsning", hu: "Találtam más megoldást" },
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
            {busy ? <WaitText text={c.deleting} /> : c.del}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { WaitText } from "@/components/WaitText";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { getLangDir } from "@/lib/i18n";

/**
 * /renew — a stable link for a customer whose subscription ended after
 * failed charges (or whose card needs updating). Signed-in: POST /api/renew
 * and follow its redirect (open invoice, or a no-trial Checkout for the same
 * plan on the same account). Signed-out: ask to sign in first, so the payment
 * lands on the EXISTING account instead of a new one. Gadi 2026-09-28.
 */

type Copy = {
  title: string;
  working: string;
  signIn: string;
  signInBody: string;
  active: string;
  toHome: string;
  none: string;
  seePlans: string;
  error: string;
  retry: string;
};

const COPY: Record<string, Copy> = {
  en: {
    title: "Renew your Gadit subscription",
    working: "Taking you to secure payment…",
    signIn: "Sign in",
    signInBody: "Sign in with the account you used before, so everything you saved stays in one place.",
    active: "Your subscription is active. Nothing to update.",
    toHome: "Back to Gadit",
    none: "We could not find a previous subscription on this account.",
    seePlans: "See plans",
    error: "Something went wrong. Please try again in a moment.",
    retry: "Try again",
  },
  he: {
    title: "חידוש המנוי ל-Gadit",
    working: "מעבירים אותך לתשלום מאובטח…",
    signIn: "כניסה לחשבון",
    signInBody: "כדאי להיכנס עם החשבון הקיים, כדי שכל מה ששמרת יישאר במקום אחד.",
    active: "המנוי שלך פעיל. אין מה לעדכן.",
    toHome: "חזרה ל-Gadit",
    none: "לא מצאנו מנוי קודם בחשבון הזה.",
    seePlans: "לתוכניות",
    error: "משהו השתבש. אפשר לנסות שוב בעוד רגע.",
    retry: "לנסות שוב",
  },
  ar: {
    title: "تجديد اشتراكك في Gadit",
    working: "ننقلك إلى الدفع الآمن…",
    signIn: "تسجيل الدخول",
    signInBody: "سجّل الدخول بالحساب الذي استخدمته من قبل، ليبقى كل ما حفظته في مكان واحد.",
    active: "اشتراكك فعّال. لا حاجة لأي تحديث.",
    toHome: "العودة إلى Gadit",
    none: "لم نجد اشتراكًا سابقًا في هذا الحساب.",
    seePlans: "عرض الخطط",
    error: "حدث خطأ ما. حاول مرة أخرى بعد لحظة.",
    retry: "حاول مرة أخرى",
  },
  ru: {
    title: "Продление подписки Gadit",
    working: "Переходим к безопасной оплате…",
    signIn: "Войти",
    signInBody: "Войдите в аккаунт, которым пользовались раньше, чтобы всё сохранённое осталось в одном месте.",
    active: "Ваша подписка активна. Обновлять ничего не нужно.",
    toHome: "Вернуться в Gadit",
    none: "Мы не нашли прежней подписки в этом аккаунте.",
    seePlans: "Посмотреть тарифы",
    error: "Что-то пошло не так. Попробуйте ещё раз через минуту.",
    retry: "Попробовать снова",
  },
  es: {
    title: "Renueva tu suscripción a Gadit",
    working: "Te llevamos al pago seguro…",
    signIn: "Iniciar sesión",
    signInBody: "Inicia sesión con la cuenta que usaste antes, para que todo lo que guardaste quede en un solo lugar.",
    active: "Tu suscripción está activa. No hay nada que actualizar.",
    toHome: "Volver a Gadit",
    none: "No encontramos una suscripción anterior en esta cuenta.",
    seePlans: "Ver planes",
    error: "Algo salió mal. Inténtalo de nuevo en un momento.",
    retry: "Intentar de nuevo",
  },
  pt: {
    title: "Renove sua assinatura do Gadit",
    working: "Levando você ao pagamento seguro…",
    signIn: "Entrar",
    signInBody: "Entre com a conta que você usou antes, para que tudo o que salvou fique em um só lugar.",
    active: "Sua assinatura está ativa. Não há nada para atualizar.",
    toHome: "Voltar ao Gadit",
    none: "Não encontramos uma assinatura anterior nesta conta.",
    seePlans: "Ver planos",
    error: "Algo deu errado. Tente novamente em instantes.",
    retry: "Tentar novamente",
  },
  fr: {
    title: "Renouveler votre abonnement Gadit",
    working: "Redirection vers le paiement sécurisé…",
    signIn: "Se connecter",
    signInBody: "Connectez-vous avec le compte utilisé auparavant, pour que tout ce que vous avez enregistré reste au même endroit.",
    active: "Votre abonnement est actif. Rien à mettre à jour.",
    toHome: "Retour à Gadit",
    none: "Nous n'avons trouvé aucun abonnement précédent sur ce compte.",
    seePlans: "Voir les formules",
    error: "Une erreur s'est produite. Veuillez réessayer dans un instant.",
    retry: "Réessayer",
  },
  de: {
    title: "Dein Gadit-Abo verlängern",
    working: "Wir leiten dich zur sicheren Zahlung weiter…",
    signIn: "Anmelden",
    signInBody: "Melde dich mit dem Konto an, das du vorher genutzt hast, damit alles Gespeicherte an einem Ort bleibt.",
    active: "Dein Abo ist aktiv. Es gibt nichts zu aktualisieren.",
    toHome: "Zurück zu Gadit",
    none: "Wir haben in diesem Konto kein früheres Abo gefunden.",
    seePlans: "Tarife ansehen",
    error: "Etwas ist schiefgelaufen. Versuche es gleich noch einmal.",
    retry: "Erneut versuchen",
  },
  cs: {
    title: "Obnovení předplatného Gadit",
    working: "Přesměrováváme vás na zabezpečenou platbu…",
    signIn: "Přihlásit se",
    signInBody: "Přihlaste se účtem, který jste používali dříve, aby vše, co jste uložili, zůstalo na jednom místě.",
    active: "Vaše předplatné je aktivní. Není co aktualizovat.",
    toHome: "Zpět na Gadit",
    none: "U tohoto účtu jsme nenašli žádné předchozí předplatné.",
    seePlans: "Zobrazit tarify",
    error: "Něco se pokazilo. Zkuste to prosím za chvíli znovu.",
    retry: "Zkusit znovu",
  },
  sk: {
    title: "Obnovenie predplatného Gadit",
    working: "Presmerúvame vás na zabezpečenú platbu…",
    signIn: "Prihlásiť sa",
    signInBody: "Prihláste sa účtom, ktorý ste používali predtým, aby všetko, čo ste si uložili, zostalo na jednom mieste.",
    active: "Vaše predplatné je aktívne. Nie je čo aktualizovať.",
    toHome: "Späť na Gadit",
    none: "V tomto účte sme nenašli žiadne predchádzajúce predplatné.",
    seePlans: "Zobraziť plány",
    error: "Niečo sa pokazilo. Skúste to prosím o chvíľu znova.",
    retry: "Skúsiť znova",
  },
  it: {
    title: "Rinnova il tuo abbonamento Gadit",
    working: "Ti stiamo portando al pagamento sicuro…",
    signIn: "Accedi",
    signInBody: "Accedi con l'account che hai usato prima, così tutto ciò che hai salvato resta in un unico posto.",
    active: "Il tuo abbonamento è attivo. Non c'è nulla da aggiornare.",
    toHome: "Torna a Gadit",
    none: "Non abbiamo trovato un abbonamento precedente su questo account.",
    seePlans: "Vedi i piani",
    error: "Qualcosa è andato storto. Riprova tra un momento.",
    retry: "Riprova",
  },
  ja: {
    title: "Gadit のサブスクリプションを更新",
    working: "安全なお支払いページへ移動しています…",
    signIn: "ログイン",
    signInBody: "以前ご利用のアカウントでログインしてください。保存した内容がすべて1か所にまとまります。",
    active: "サブスクリプションは有効です。更新の必要はありません。",
    toHome: "Gadit に戻る",
    none: "このアカウントには以前のサブスクリプションが見つかりませんでした。",
    seePlans: "プランを見る",
    error: "問題が発生しました。しばらくしてからもう一度お試しください。",
    retry: "もう一度試す",
  },
  hi: {
    title: "अपनी Gadit सदस्यता नवीनीकृत करें",
    working: "आपको सुरक्षित भुगतान पर ले जा रहे हैं…",
    signIn: "साइन इन करें",
    signInBody: "उसी खाते से साइन इन करें जिसका आपने पहले उपयोग किया था, ताकि आपकी सहेजी गई हर चीज़ एक ही जगह रहे।",
    active: "आपकी सदस्यता सक्रिय है। कुछ भी अपडेट करने की ज़रूरत नहीं है।",
    toHome: "Gadit पर वापस जाएँ",
    none: "हमें इस खाते में कोई पिछली सदस्यता नहीं मिली।",
    seePlans: "प्लान देखें",
    error: "कुछ गड़बड़ हो गई। कृपया थोड़ी देर में फिर से कोशिश करें।",
    retry: "फिर से कोशिश करें",
  },
  am: {
    title: "የGadit ምዝገባዎን ያድሱ",
    working: "ወደ ደህንነቱ የተጠበቀ ክፍያ እየወሰድንዎ ነው…",
    signIn: "ይግቡ",
    signInBody: "ቀደም ብለው በተጠቀሙበት መለያ ይግቡ፣ ያስቀመጡት ሁሉ በአንድ ቦታ እንዲቆይ።",
    active: "ምዝገባዎ ንቁ ነው። የሚዘመን ነገር የለም።",
    toHome: "ወደ Gadit ይመለሱ",
    none: "በዚህ መለያ ላይ ቀዳሚ ምዝገባ አላገኘንም።",
    seePlans: "ዕቅዶችን ይመልከቱ",
    error: "የሆነ ችግር ተፈጥሯል። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።",
    retry: "እንደገና ይሞክሩ",
  },
  uk: {
    title: "Поновлення підписки Gadit",
    working: "Переходимо до безпечної оплати…",
    signIn: "Увійти",
    signInBody: "Увійдіть в акаунт, яким користувалися раніше, щоб усе збережене залишилося в одному місці.",
    active: "Ваша підписка активна. Нічого оновлювати не потрібно.",
    toHome: "Повернутися до Gadit",
    none: "Ми не знайшли попередньої підписки в цьому акаунті.",
    seePlans: "Переглянути тарифи",
    error: "Щось пішло не так. Спробуйте ще раз за хвилину.",
    retry: "Спробувати знову",
  },
  tr: {
    title: "Gadit aboneliğini yenile",
    working: "Seni güvenli ödemeye yönlendiriyoruz…",
    signIn: "Giriş yap",
    signInBody: "Daha önce kullandığın hesapla giriş yap, böylece kaydettiğin her şey tek bir yerde kalsın.",
    active: "Aboneliğin aktif. Güncellenecek bir şey yok.",
    toHome: "Gadit'e dön",
    none: "Bu hesapta önceki bir abonelik bulamadık.",
    seePlans: "Planları gör",
    error: "Bir şeyler ters gitti. Birazdan tekrar dene.",
    retry: "Tekrar dene",
  },
  pl: {
    title: "Odnów subskrypcję Gadit",
    working: "Przekierowujemy Cię do bezpiecznej płatności…",
    signIn: "Zaloguj się",
    signInBody: "Zaloguj się na to samo konto co wcześniej, aby wszystkie zapisane rzeczy zostały w jednym miejscu.",
    active: "Twoja subskrypcja jest aktywna. Nie ma nic do zaktualizowania.",
    toHome: "Wróć do Gadit",
    none: "Nie znaleźliśmy wcześniejszej subskrypcji na tym koncie.",
    seePlans: "Zobacz plany",
    error: "Coś poszło nie tak. Spróbuj ponownie za chwilę.",
    retry: "Spróbuj ponownie",
  },
  fa: {
    title: "تمدید اشتراک Gadit",
    working: "در حال انتقال شما به پرداخت امن…",
    signIn: "ورود",
    signInBody: "با همان حسابی که قبلاً استفاده کرده‌اید وارد شوید تا هر چه ذخیره کرده‌اید در یک جا بماند.",
    active: "اشتراک شما فعال است. نیازی به به‌روزرسانی نیست.",
    toHome: "بازگشت به Gadit",
    none: "اشتراک قبلی در این حساب پیدا نکردیم.",
    seePlans: "مشاهده طرح‌ها",
    error: "مشکلی پیش آمد. لطفاً چند لحظه دیگر دوباره امتحان کنید.",
    retry: "دوباره امتحان کنید",
  },
  id: {
    title: "Perpanjang langganan Gadit kamu",
    working: "Mengarahkan kamu ke pembayaran aman…",
    signIn: "Masuk",
    signInBody: "Masuk dengan akun yang kamu pakai sebelumnya, agar semua yang kamu simpan tetap di satu tempat.",
    active: "Langganan kamu aktif. Tidak ada yang perlu diperbarui.",
    toHome: "Kembali ke Gadit",
    none: "Kami tidak menemukan langganan sebelumnya di akun ini.",
    seePlans: "Lihat paket",
    error: "Terjadi kesalahan. Coba lagi sebentar lagi.",
    retry: "Coba lagi",
  },
  nl: {
    title: "Verleng je Gadit-abonnement",
    working: "We sturen je door naar de beveiligde betaling…",
    signIn: "Inloggen",
    signInBody: "Log in met het account dat je eerder gebruikte, zodat alles wat je hebt bewaard op één plek blijft.",
    active: "Je abonnement is actief. Er hoeft niets bijgewerkt te worden.",
    toHome: "Terug naar Gadit",
    none: "We hebben geen eerder abonnement op dit account gevonden.",
    seePlans: "Bekijk abonnementen",
    error: "Er ging iets mis. Probeer het zo opnieuw.",
    retry: "Probeer opnieuw",
  },
  el: {
    title: "Ανανέωσε τη συνδρομή σου στο Gadit",
    working: "Σε μεταφέρουμε στην ασφαλή πληρωμή…",
    signIn: "Σύνδεση",
    signInBody: "Συνδέσου με τον λογαριασμό που χρησιμοποιούσες πριν, ώστε ό,τι έχεις αποθηκεύσει να μείνει σε ένα σημείο.",
    active: "Η συνδρομή σου είναι ενεργή. Δεν χρειάζεται καμία ενημέρωση.",
    toHome: "Επιστροφή στο Gadit",
    none: "Δεν βρήκαμε προηγούμενη συνδρομή σε αυτόν τον λογαριασμό.",
    seePlans: "Δες τα πακέτα",
    error: "Κάτι πήγε στραβά. Δοκίμασε ξανά σε λίγο.",
    retry: "Δοκίμασε ξανά",
  },
  zu: {
    title: "Vuselela ukubhalisa kwakho ku-Gadit",
    working: "Sikuyisa enkokhelweni evikelekile…",
    signIn: "Ngena",
    signInBody: "Ngena nge-akhawunti obuyisebenzisa ngaphambili, ukuze konke okulondolozile kuhlale endaweni eyodwa.",
    active: "Ukubhalisa kwakho kuyasebenza. Akukho okudinga ukubuyekezwa.",
    toHome: "Buyela ku-Gadit",
    none: "Asitholanga ukubhalisa kwangaphambili kule akhawunti.",
    seePlans: "Bheka amapulani",
    error: "Kukhona okungahambanga kahle. Zama futhi ngemuva kwesikhashana.",
    retry: "Zama futhi",
  },
  xh: {
    title: "Hlaziya umrhumo wakho we-Gadit",
    working: "Sikusa kwintlawulo ekhuselekileyo…",
    signIn: "Ngena",
    signInBody: "Ngena ngeakhawunti obuyisebenzisa ngaphambili, ukuze yonke into oyigcinileyo ihlale kwindawo enye.",
    active: "Umrhumo wakho uyasebenza. Akukho nto ifuna ukuhlaziywa.",
    toHome: "Buyela kwi-Gadit",
    none: "Asikwazanga ukufumana umrhumo wangaphambili kule akhawunti.",
    seePlans: "Jonga izicwangciso",
    error: "Kukho into engahambanga kakuhle. Nceda uzame kwakhona kamva kancinci.",
    retry: "Zama kwakhona",
  },
  nso: {
    title: "Mpshafatša peeletšo ya gago ya Gadit",
    working: "Re go iša tefong ye e šireletšegilego…",
    signIn: "Tsena",
    signInBody: "Tsena ka akhaonto ye o e šomišitšego pele, gore tšohle tšeo o di bolokilego di dule lefelong le tee.",
    active: "Peeletšo ya gago e a šoma. Ga go se se swanetšego go mpshafatšwa.",
    toHome: "Boela go Gadit",
    none: "Ga re a hwetša peeletšo ya pele akhaontong ye.",
    seePlans: "Bona maano",
    error: "Go na le se se senyegilego. Hle leka gape ka morago ga nakwana.",
    retry: "Leka gape",
  },
  tn: {
    title: "Ntšhafatsa ikwadiso ya gago ya Gadit",
    working: "Re go isa kwa tefong e e sireletsegileng…",
    signIn: "Tsena",
    signInBody: "Tsena ka akhaonto e o neng o e dirisa pele, gore sengwe le sengwe se o se bolokileng se nne mo lefelong le le lengwe.",
    active: "Ikwadiso ya gago e a dira. Ga go na sepe sa go ntšhafatsa.",
    toHome: "Boela kwa Gadit",
    none: "Ga re a bona ikwadiso ya pele mo akhaontong e.",
    seePlans: "Bona maano",
    error: "Go na le sengwe se se sa tsamaeng sentle. Tsweetswee leka gape go se go ye kae.",
    retry: "Leka gape",
  },
  st: {
    title: "Ntjhafatsa ngodiso ya hao ya Gadit",
    working: "Re o isa tefong e sireletsehileng…",
    signIn: "Kena",
    signInBody: "Kena ka akhaonte eo o neng o e sebedisa pele, hore tsohle tseo o di bolokileng di dule sebakeng se le seng.",
    active: "Ngodiso ya hao e a sebetsa. Ha ho letho la ho ntjhafatswa.",
    toHome: "Kgutlela ho Gadit",
    none: "Ha re a fumana ngodiso ya pele akhaonteng ena.",
    seePlans: "Sheba merero",
    error: "Ho na le se sa tsamayang hantle. Ka kopo leka hape kamora nakwana.",
    retry: "Leka hape",
  },
  ts: {
    title: "Pfuxetani mbhaliso wa n'wina wa Gadit",
    working: "Hi mi yisa eka ku hakela loku sirhelelekeke…",
    signIn: "Nghena",
    signInBody: "Nghenani hi akhawunti leyi mi yi tirhiseke khale, leswaku hinkwaswo leswi mi swi hlayiseke swi tshama endhawini yin'we.",
    active: "Mbhaliso wa n'wina wa tirha. A ku na nchumu wo pfuxeta.",
    toHome: "Tlhelela eka Gadit",
    none: "A hi swi kotanga ku kuma mbhaliso wa khale eka akhawunti leyi.",
    seePlans: "Vona tipulani",
    error: "Ku na leswi hoxekeke. Hi kombela mi ringeta nakambe endzhaku ka xinkarhana.",
    retry: "Ringeta nakambe",
  },
  ss: {
    title: "Vuselela kubhalisa kwakho kwe-Gadit",
    working: "Sikuyisa enkhokhelweni lephephile…",
    signIn: "Ngena",
    signInBody: "Ngena nge-akhawunti lobewuyisebentisa ngaphambilini, kute konkhe lokugcinile kuhlale endzaweni yinye.",
    active: "Kubhalisa kwakho kuyasebenta. Kute lokufanele kuvuselelwe.",
    toHome: "Buyela ku-Gadit",
    none: "Asikhonanga kutfola kubhalisa kwangaphambilini kule-akhawunti.",
    seePlans: "Buka emahlelo",
    error: "Kukhona lokungakahambi kahle. Sicela uphindze uzame kancane.",
    retry: "Phindza uzame",
  },
  ve: {
    title: "Vusuluseni ṅwaliso waṋu wa Gadit",
    working: "Ri khou ni isa kha mbadelo yo tsireledzeaho…",
    signIn: "Dzhenani",
    signInBody: "Dzhenani nga akhaunthu ye na i shumisa kale, uri zwoṱhe zwe na zwi vhulunga zwi dzule fhethu huthihi.",
    active: "Ṅwaliso waṋu u khou shuma. A hu na zwa u vusulusa.",
    toHome: "Humelani kha Gadit",
    none: "A ro ngo wana ṅwaliso wa kale kha akhaunthu iyi.",
    seePlans: "Vhonani pulane",
    error: "Ho khakhea zwiṅwe. Ri humbela ni lingedze hafhu nga murahu ha tshifhinganyana.",
    retry: "Lingedzani hafhu",
  },
  nr: {
    title: "Vuselela ukubhalisela kwakho kwe-Gadit",
    working: "Sikuyisa ekubhadeleni okuphephileko…",
    signIn: "Ngena",
    signInBody: "Ngena nge-akhawunti obusebenzisa yona ngaphambilini, bona koke okubulungileko kuhlale endaweni yinye.",
    active: "Ukubhalisela kwakho kuyasebenza. Akukho okufuze kuvuselelwe.",
    toHome: "Buyela ku-Gadit",
    none: "Asikghonanga ukuthola ukubhalisela kwangaphambili ku-akhawunti le.",
    seePlans: "Bona amahlelo",
    error: "Kukhona okungakahambi kuhle. Sibawa ulinge godu ngemva kwesikhatjhana.",
    retry: "Linga godu",
  },
  vi: {
    title: "Gia hạn gói Gadit của bạn",
    working: "Đang chuyển bạn đến trang thanh toán an toàn…",
    signIn: "Đăng nhập",
    signInBody: "Hãy đăng nhập bằng tài khoản bạn đã dùng trước đây, để mọi thứ bạn đã lưu ở cùng một nơi.",
    active: "Gói của bạn đang hoạt động. Không cần cập nhật gì.",
    toHome: "Quay lại Gadit",
    none: "Chúng tôi không tìm thấy gói đăng ký trước đây trong tài khoản này.",
    seePlans: "Xem các gói",
    error: "Đã có lỗi xảy ra. Vui lòng thử lại sau giây lát.",
    retry: "Thử lại",
  },
  fil: {
    title: "I-renew ang iyong Gadit subscription",
    working: "Dinadala ka namin sa secure na pagbabayad…",
    signIn: "Mag-sign in",
    signInBody: "Mag-sign in gamit ang account na ginamit mo dati, para manatili sa iisang lugar ang lahat ng na-save mo.",
    active: "Aktibo ang iyong subscription. Walang kailangang i-update.",
    toHome: "Bumalik sa Gadit",
    none: "Wala kaming nakitang dating subscription sa account na ito.",
    seePlans: "Tingnan ang mga plano",
    error: "May nangyaring mali. Subukan ulit maya-maya.",
    retry: "Subukan ulit",
  },
  af: {
    title: "Hernu jou Gadit-intekening",
    working: "Ons neem jou na veilige betaling…",
    signIn: "Meld aan",
    signInBody: "Meld aan met die rekening wat jy voorheen gebruik het, sodat alles wat jy gestoor het op een plek bly.",
    active: "Jou intekening is aktief. Niks hoef opgedateer te word nie.",
    toHome: "Terug na Gadit",
    none: "Ons kon nie 'n vorige intekening op hierdie rekening vind nie.",
    seePlans: "Sien planne",
    error: "Iets het skeefgeloop. Probeer weer oor 'n oomblik.",
    retry: "Probeer weer",
  },
  sw: {
    title: "Huisha usajili wako wa Gadit",
    working: "Tunakupeleka kwenye malipo salama…",
    signIn: "Ingia",
    signInBody: "Ingia kwa akaunti uliyotumia awali, ili kila ulichohifadhi kibaki mahali pamoja.",
    active: "Usajili wako uko hai. Hakuna cha kusasisha.",
    toHome: "Rudi kwa Gadit",
    none: "Hatukupata usajili wa awali kwenye akaunti hii.",
    seePlans: "Tazama mipango",
    error: "Hitilafu imetokea. Tafadhali jaribu tena baada ya muda mfupi.",
    retry: "Jaribu tena",
  },
  "zh-CN": {
    title: "续订你的 Gadit 订阅",
    working: "正在前往安全支付页面…",
    signIn: "登录",
    signInBody: "请使用你之前的账户登录，这样你保存的所有内容都会留在同一个地方。",
    active: "你的订阅仍然有效，无需更新。",
    toHome: "返回 Gadit",
    none: "我们在此账户中没有找到以前的订阅。",
    seePlans: "查看方案",
    error: "出了点问题，请稍后再试。",
    retry: "重试",
  },
  "zh-TW": {
    title: "續訂你的 Gadit 訂閱",
    working: "正在前往安全付款頁面…",
    signIn: "登入",
    signInBody: "請使用你之前的帳戶登入，這樣你儲存的所有內容都會留在同一個地方。",
    active: "你的訂閱仍然有效，無需更新。",
    toHome: "返回 Gadit",
    none: "我們在此帳戶中找不到先前的訂閱。",
    seePlans: "查看方案",
    error: "發生錯誤，請稍後再試。",
    retry: "重試",
  },
  ko: {
    title: "Gadit 구독 갱신하기",
    working: "안전한 결제 페이지로 이동하는 중…",
    signIn: "로그인",
    signInBody: "이전에 사용하던 계정으로 로그인하세요. 저장한 모든 내용이 한곳에 유지됩니다.",
    active: "구독이 활성 상태입니다. 업데이트할 내용이 없습니다.",
    toHome: "Gadit으로 돌아가기",
    none: "이 계정에서 이전 구독을 찾지 못했습니다.",
    seePlans: "요금제 보기",
    error: "문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    retry: "다시 시도",
  },
  th: {
    title: "ต่ออายุการสมัครสมาชิก Gadit",
    working: "กำลังพาคุณไปยังหน้าชำระเงินที่ปลอดภัย…",
    signIn: "เข้าสู่ระบบ",
    signInBody: "เข้าสู่ระบบด้วยบัญชีที่คุณเคยใช้ เพื่อให้ทุกอย่างที่คุณบันทึกไว้อยู่ในที่เดียว",
    active: "การสมัครสมาชิกของคุณยังใช้งานอยู่ ไม่ต้องอัปเดตอะไร",
    toHome: "กลับไปที่ Gadit",
    none: "เราไม่พบการสมัครสมาชิกก่อนหน้าในบัญชีนี้",
    seePlans: "ดูแพ็กเกจ",
    error: "เกิดข้อผิดพลาด โปรดลองอีกครั้งในอีกสักครู่",
    retry: "ลองอีกครั้ง",
  },
  bn: {
    title: "আপনার Gadit সাবস্ক্রিপশন নবায়ন করুন",
    working: "আপনাকে নিরাপদ পেমেন্টে নিয়ে যাচ্ছি…",
    signIn: "সাইন ইন করুন",
    signInBody: "আগে যে অ্যাকাউন্ট ব্যবহার করেছিলেন সেটি দিয়ে সাইন ইন করুন, যাতে আপনার সংরক্ষিত সবকিছু এক জায়গায় থাকে।",
    active: "আপনার সাবস্ক্রিপশন সক্রিয় আছে। কিছু আপডেট করার দরকার নেই।",
    toHome: "Gadit-এ ফিরে যান",
    none: "এই অ্যাকাউন্টে আমরা আগের কোনো সাবস্ক্রিপশন খুঁজে পাইনি।",
    seePlans: "প্ল্যান দেখুন",
    error: "কিছু একটা ভুল হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
    retry: "আবার চেষ্টা করুন",
  },
  da: {
    title: "Forny dit Gadit-abonnement",
    working: "Vi sender dig videre til sikker betaling…",
    signIn: "Log ind",
    signInBody: "Log ind med den konto, du brugte før, så alt, hvad du har gemt, bliver samlet ét sted.",
    active: "Dit abonnement er aktivt. Der er intet at opdatere.",
    toHome: "Tilbage til Gadit",
    none: "Vi kunne ikke finde et tidligere abonnement på denne konto.",
    seePlans: "Se abonnementer",
    error: "Noget gik galt. Prøv igen om et øjeblik.",
    retry: "Prøv igen",
  },
  hu: {
    title: "Gadit-előfizetés megújítása",
    working: "Átirányítunk a biztonságos fizetéshez…",
    signIn: "Bejelentkezés",
    signInBody: "Jelentkezz be azzal a fiókkal, amelyet korábban használtál, hogy minden, amit elmentettél, egy helyen maradjon.",
    active: "Az előfizetésed aktív. Nincs mit frissíteni.",
    toHome: "Vissza a Gadithoz",
    none: "Ezen a fiókon nem találtunk korábbi előfizetést.",
    seePlans: "Csomagok megtekintése",
    error: "Valami hiba történt. Próbáld újra egy pillanat múlva.",
    retry: "Próbáld újra",
  },
};

type Phase = "loading" | "need-auth" | "working" | "active" | "none" | "error";

export function RenewClient() {
  const { user, loading, promptLogin } = useAuth();
  const { lang } = useLang();
  const href = useHref();
  const t = COPY[lang] ?? COPY.en;
  const [phase, setPhase] = useState<Phase>("loading");
  const startedRef = useRef(false);

  const run = async () => {
    if (!user) return;
    setPhase("working");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ lang }),
      });
      const j = (await res.json().catch(() => ({}))) as { status?: string; url?: string };
      if (res.ok && j.status === "redirect" && j.url) {
        window.location.href = j.url;
        return;
      }
      if (res.ok && j.status === "active") return setPhase("active");
      if (res.ok && j.status === "none") return setPhase("none");
      setPhase("error");
    } catch {
      setPhase("error");
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setPhase("need-auth");
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  const btn: React.CSSProperties = {
    display: "inline-block", background: "#0EA5A5", color: "#fff", border: 0, borderRadius: 999,
    padding: "12px 28px", fontSize: 16, fontWeight: 600, cursor: "pointer", textDecoration: "none",
  };

  return (
    <main dir={getLangDir(lang)} style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "40px 16px" }}>
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
        <h1 style={{ fontSize: 26, margin: 0 }}>{t.title}</h1>
        {(phase === "loading" || phase === "working") && <p style={{ margin: 0, color: "#5C6270" }}><WaitText text={t.working} live /></p>}
        {phase === "need-auth" && (
          <>
            <p style={{ margin: 0, color: "#5C6270", lineHeight: 1.6 }}>{t.signInBody}</p>
            <button type="button" style={btn} onClick={() => promptLogin({ mode: "signin", reason: "renew" })}>{t.signIn}</button>
          </>
        )}
        {phase === "active" && (
          <>
            <p style={{ margin: 0 }}>{t.active}</p>
            <Link href={href("/")} style={btn}>{t.toHome}</Link>
          </>
        )}
        {phase === "none" && (
          <>
            <p style={{ margin: 0 }}>{t.none}</p>
            <Link href={href("/families")} style={btn}>{t.seePlans}</Link>
          </>
        )}
        {phase === "error" && (
          <>
            <p style={{ margin: 0 }}>{t.error}</p>
            <button type="button" style={btn} onClick={() => void run()}>{t.retry}</button>
          </>
        )}
      </div>
    </main>
  );
}

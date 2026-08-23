"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { track } from "@/lib/track";
import { isNewSchoolsPrice } from "@/lib/schools-prices";

/**
 * Return page for the Payment Element flow. Stripe appends
 * redirect_status (+ setup_intent / payment_intent ids) to the
 * return_url after confirmSetup/confirmPayment.
 *
 * succeeded / processing → celebrate and route by tier. The webhook
 * provisions the plan asynchronously, usually within seconds, so the
 * copy promises "a moment", not instant features.
 * anything else → send back to /checkout to retry (the abandoned
 * subscription is reused there, no duplicates).
 */

const COPY = {
  ar: { okTitle: "أنت الآن معنا", okBody: "بدأت فترتك التجريبية لمدة 14 يومًا. يُحدَّث حسابك خلال لحظات. إذا لم يُفتح شيء على الفور، حدّث الصفحة.", ctaGeneral: "ابدأ بالبحث عن الكلمات", ctaFamily: "انتقل إلى مساحة عائلتك", ctaSchools: "أدر مدرستك", failTitle: "لم تكتمل عملية الدفع", failBody: "لم يُخصم منك أي مبلغ. يمكنك المحاولة من جديد، لن يستغرق الأمر أكثر من دقيقة.", retry: "حاول مرة أخرى", toPricing: "انتقل إلى الأسعار" },
  ru: { okTitle: "Вы с нами", okBody: "Ваш 14 дневный пробный период начался. Аккаунт обновится через несколько мгновений. Если что то не откроется сразу, обновите страницу.", ctaGeneral: "Начать искать слова", ctaFamily: "Перейти в семейное пространство", ctaSchools: "Управлять школой", failTitle: "Платёж не завершён", failBody: "Деньги не списаны. Можно попробовать снова, это займёт меньше минуты.", retry: "Попробовать снова", toPricing: "Перейти к тарифам" },
  es: { okTitle: "Ya estás dentro", okBody: "Tu prueba de 14 días ha comenzado. Tu cuenta se actualiza en unos instantes. Si algo no se abre de inmediato, actualiza la página.", ctaGeneral: "Empieza a buscar palabras", ctaFamily: "Ir a tu espacio familiar", ctaSchools: "Gestiona tu escuela", failTitle: "El pago no se completó", failBody: "No se te cobró nada. Puedes intentarlo de nuevo, tardas menos de un minuto.", retry: "Intentar de nuevo", toPricing: "Ir a los precios" },
  pt: { okTitle: "Você está dentro", okBody: "Seu teste de 14 dias começou. Sua conta é atualizada em instantes. Se algo não abrir na hora, atualize a página.", ctaGeneral: "Comece a buscar palavras", ctaFamily: "Ir para o seu espaço da família", ctaSchools: "Gerencie sua escola", failTitle: "O pagamento não foi concluído", failBody: "Nada foi cobrado. Você pode tentar de novo, leva menos de um minuto.", retry: "Tentar de novo", toPricing: "Ir para os preços" },
  fr: { okTitle: "Vous y êtes", okBody: "Votre essai de 14 jours a commencé. Votre compte se met à jour dans un instant. Si quelque chose ne s'ouvre pas tout de suite, actualisez la page.", ctaGeneral: "Commencer à chercher des mots", ctaFamily: "Accéder à votre espace famille", ctaSchools: "Gérer votre école", failTitle: "Le paiement n'a pas abouti", failBody: "Vous n'avez pas été débité. Vous pouvez réessayer, cela prend moins d'une minute.", retry: "Réessayer", toPricing: "Voir les tarifs" },
  de: { okTitle: "Du bist dabei", okBody: "Deine 14 Tage Testphase hat begonnen. Dein Konto wird in wenigen Augenblicken aktualisiert. Falls etwas nicht sofort öffnet, lade die Seite neu.", ctaGeneral: "Wörter nachschlagen", ctaFamily: "Zu deinem Familienbereich", ctaSchools: "Deine Schule verwalten", failTitle: "Zahlung nicht abgeschlossen", failBody: "Dir wurde nichts berechnet. Du kannst es erneut versuchen, es dauert weniger als eine Minute.", retry: "Erneut versuchen", toPricing: "Zu den Preisen" },
  cs: { okTitle: "Jste v tom", okBody: "Vaše 14 denní zkušební verze začala. Váš účet se během chvilky aktualizuje. Pokud se něco hned neotevře, obnovte stránku.", ctaGeneral: "Začít vyhledávat slova", ctaFamily: "Přejít do rodinného prostoru", ctaSchools: "Spravovat školu", failTitle: "Platba nebyla dokončena", failBody: "Nic vám nebylo naúčtováno. Můžete to zkusit znovu, zabere to méně než minutu.", retry: "Zkusit znovu", toPricing: "Přejít na ceny" },
  sk: { okTitle: "Ste v tom", okBody: "Vaša 14 dňová skúšobná verzia sa začala. Váš účet sa o chvíľu aktualizuje. Ak sa niečo hneď neotvorí, obnovte stránku.", ctaGeneral: "Začať vyhľadávať slová", ctaFamily: "Prejsť do rodinného priestoru", ctaSchools: "Spravovať školu", failTitle: "Platba nebola dokončená", failBody: "Nič vám nebolo účtované. Môžete to skúsiť znova, zaberie to menej než minútu.", retry: "Skúsiť znova", toPricing: "Prejsť na ceny" },
  it: { okTitle: "Ci sei", okBody: "La tua prova di 14 giorni è iniziata. Il tuo account si aggiorna in pochi istanti. Se qualcosa non si apre subito, ricarica la pagina.", ctaGeneral: "Inizia a cercare parole", ctaFamily: "Vai al tuo spazio famiglia", ctaSchools: "Gestisci la tua scuola", failTitle: "Il pagamento non è andato a buon fine", failBody: "Non ti è stato addebitato nulla. Puoi riprovare, ci vuole meno di un minuto.", retry: "Riprova", toPricing: "Vai ai prezzi" },
  ja: { okTitle: "準備ができました", okBody: "14日間の無料トライアルが始まりました。アカウントはまもなく更新されます。すぐに開かない場合は、ページを再読み込みしてください。", ctaGeneral: "言葉を調べ始める", ctaFamily: "ファミリースペースへ", ctaSchools: "学校を管理する", failTitle: "お支払いが完了しませんでした", failBody: "料金は請求されていません。もう一度お試しいただけます。1分もかかりません。", retry: "もう一度試す", toPricing: "料金ページへ" },
  hi: { okTitle: "आप जुड़ गए", okBody: "आपका 14 दिन का ट्रायल शुरू हो गया है। आपका खाता कुछ ही पलों में अपडेट हो जाएगा। अगर कुछ तुरंत न खुले, तो पेज को रिफ्रेश करें।", ctaGeneral: "शब्द खोजना शुरू करें", ctaFamily: "अपने परिवार के स्थान पर जाएं", ctaSchools: "अपने स्कूल का प्रबंधन करें", failTitle: "भुगतान पूरा नहीं हुआ", failBody: "आपसे कोई शुल्क नहीं लिया गया। आप फिर से कोशिश कर सकते हैं, इसमें एक मिनट से भी कम लगता है।", retry: "फिर से कोशिश करें", toPricing: "मूल्य पर जाएं" },
  am: { okTitle: "ገብተዋል", okBody: "የ14 ቀን ሙከራዎ ተጀምሯል። መለያዎ በቅፅበታት ውስጥ ይዘምናል። ወዲያውኑ ካልተከፈተ ገጹን እንደገና ያድሱ።", ctaGeneral: "ቃላትን መፈለግ ይጀምሩ", ctaFamily: "ወደ የቤተሰብ ቦታዎ ይሂዱ", ctaSchools: "ትምህርት ቤትዎን ያስተዳድሩ", failTitle: "ክፍያው አልተጠናቀቀም", failBody: "ክፍያ አልተከፈለብዎትም። እንደገና መሞከር ይችላሉ፣ ከአንድ ደቂቃ ያነሰ ጊዜ ይወስዳል።", retry: "እንደገና ይሞክሩ", toPricing: "ወደ ዋጋ አሰጣጥ ይሂዱ" },
  uk: { okTitle: "Ви в системі", okBody: "Ваш 14-денний пробний період розпочався. Обліковий запис оновиться за кілька миттєвостей. Якщо щось не відкриється одразу, оновіть сторінку.", ctaGeneral: "Почати шукати слова", ctaFamily: "Перейти до сімейного простору", ctaSchools: "Керувати вашою школою", failTitle: "Оплату не завершено", failBody: "Кошти не списано. Ви можете спробувати ще раз, це займе менше хвилини.", retry: "Спробувати ще раз", toPricing: "Перейти до цін" },
  tr: { okTitle: "Giriş yaptınız", okBody: "14 günlük deneme süreniz başladı. Hesabınız birkaç dakika içinde güncellenir. Bir şey hemen açılmazsa sayfayı yenileyin.", ctaGeneral: "Kelime aramaya başlayın", ctaFamily: "Aile alanınıza gidin", ctaSchools: "Okulunuzu yönetin", failTitle: "Ödeme tamamlanmadı", failBody: "Sizden ücret alınmadı. Tekrar deneyebilirsiniz, bir dakikadan az sürer.", retry: "Tekrar deneyin", toPricing: "Fiyatlandırmaya gidin" },
  pl: { okTitle: "Jesteś w środku", okBody: "Twój 14-dniowy okres próbny się rozpoczął. Konto zaktualizuje się w ciągu chwili. Jeśli coś nie otworzy się od razu, odśwież stronę.", ctaGeneral: "Zacznij wyszukiwać słowa", ctaFamily: "Przejdź do przestrzeni rodzinnej", ctaSchools: "Zarządzaj swoją szkołą", failTitle: "Płatność nie została zakończona", failBody: "Nie pobrano żadnej opłaty. Możesz spróbować ponownie, zajmie to mniej niż minutę.", retry: "Spróbuj ponownie", toPricing: "Przejdź do cennika" },
  fa: { okTitle: "وارد شدید", okBody: "دوره آزمایشی ۱۴ روزه شما آغاز شد. حساب شما در چند لحظه به‌روزرسانی می‌شود. اگر چیزی بلافاصله باز نشد، صفحه را تازه کنید.", ctaGeneral: "جستجوی کلمات را شروع کنید", ctaFamily: "به فضای خانواده خود بروید", ctaSchools: "مدرسه خود را مدیریت کنید", failTitle: "پرداخت کامل نشد", failBody: "مبلغی از شما کسر نشد. می‌توانید دوباره تلاش کنید، کمتر از یک دقیقه طول می‌کشد.", retry: "دوباره تلاش کنید", toPricing: "به صفحه قیمت‌ها بروید" },
  id: { okTitle: "Anda sudah masuk", okBody: "Masa uji coba 14 hari Anda telah dimulai. Akun Anda diperbarui dalam beberapa saat. Jika sesuatu tidak langsung terbuka, muat ulang halaman.", ctaGeneral: "Mulai mencari kata", ctaFamily: "Buka ruang keluarga Anda", ctaSchools: "Kelola sekolah Anda", failTitle: "Pembayaran tidak selesai", failBody: "Anda tidak dikenai biaya. Anda bisa mencoba lagi, hanya butuh kurang dari satu menit.", retry: "Coba lagi", toPricing: "Buka halaman harga" },
  nl: { okTitle: "Je bent binnen", okBody: "Je proefperiode van 14 dagen is gestart. Je account wordt binnen enkele ogenblikken bijgewerkt. Als iets niet meteen opent, ververs dan de pagina.", ctaGeneral: "Begin met woorden opzoeken", ctaFamily: "Ga naar je gezinsruimte", ctaSchools: "Beheer je school", failTitle: "Betaling is niet voltooid", failBody: "Er is niets in rekening gebracht. Je kunt het opnieuw proberen, het duurt minder dan een minuut.", retry: "Probeer opnieuw", toPricing: "Ga naar prijzen" },
  vi: { okTitle: "Bạn đã vào", okBody: "Bản dùng thử 14 ngày của bạn đã bắt đầu. Tài khoản của bạn sẽ được cập nhật trong giây lát. Nếu có gì đó không mở ngay, hãy tải lại trang.", ctaGeneral: "Bắt đầu tra cứu từ", ctaFamily: "Đến không gian gia đình của bạn", ctaSchools: "Quản lý trường của bạn", failTitle: "Thanh toán chưa hoàn tất", failBody: "Bạn chưa bị tính phí. Bạn có thể thử lại, chỉ mất chưa đến một phút.", retry: "Thử lại", toPricing: "Đến trang giá" },
  fil: { okTitle: "Nakapasok ka na", okBody: "Nagsimula na ang iyong 14 araw na trial. Mag-a-update ang iyong account sa loob ng ilang sandali. Kung may hindi agad bumukas, i-refresh lang ang page.", ctaGeneral: "Simulang maghanap ng mga salita", ctaFamily: "Pumunta sa inyong family space", ctaSchools: "Pamahalaan ang iyong paaralan", failTitle: "Hindi natapos ang bayad", failBody: "Wala kang siningil. Puwede mong subukan ulit, wala pang isang minuto.", retry: "Subukang muli", toPricing: "Pumunta sa pricing" },
  af: { okTitle: "Jy is in", okBody: "Jou 14 dae proeftydperk het begin. Jou rekening werk binne oomblikke by. As iets nie dadelik oopmaak nie, herlaai die bladsy.", ctaGeneral: "Begin woorde opsoek", ctaFamily: "Gaan na jou gesinspasie", ctaSchools: "Bestuur jou skool", failTitle: "Betaling is nie voltooi nie", failBody: "Jy is nie gehef nie. Jy kan weer probeer, dit neem minder as 'n minuut.", retry: "Probeer weer", toPricing: "Gaan na pryse" },
  sw: { okTitle: "Umeingia", okBody: "Kipindi chako cha majaribio cha siku 14 kimeanza. Akaunti yako itasasishwa ndani ya muda mfupi. Kama kitu hakifunguki mara moja, onyesha upya ukurasa.", ctaGeneral: "Anza kutafuta maneno", ctaFamily: "Nenda kwenye nafasi ya familia yako", ctaSchools: "Simamia shule yako", failTitle: "Malipo hayakukamilika", failBody: "Hukutozwa. Unaweza kujaribu tena, inachukua chini ya dakika moja.", retry: "Jaribu tena", toPricing: "Nenda kwenye bei" },
  "zh-CN": { okTitle: "你已加入", okBody: "你的 14 天试用已开始。你的账户会在片刻内更新。如果有内容没有立即打开，请刷新页面。", ctaGeneral: "开始查词", ctaFamily: "前往你的家庭空间", ctaSchools: "管理你的学校", failTitle: "付款未完成", failBody: "我们没有向你收费。你可以再试一次，用时不到一分钟。", retry: "重试", toPricing: "前往价格页面" },
  "zh-TW": { okTitle: "你已加入", okBody: "你的 14 天試用已開始。你的帳戶會在片刻內更新。如果有內容沒有立即開啟，請重新整理頁面。", ctaGeneral: "開始查詞", ctaFamily: "前往你的家庭空間", ctaSchools: "管理你的學校", failTitle: "付款未完成", failBody: "我們沒有向你收費。你可以再試一次，花不到一分鐘。", retry: "重試", toPricing: "前往價格頁面" },
  ko: { okTitle: "가입되었어요", okBody: "14일 무료 체험이 시작되었어요. 계정은 잠시 후에 업데이트됩니다. 바로 열리지 않는 것이 있으면 페이지를 새로고침해 주세요.", ctaGeneral: "단어 찾아보기 시작하기", ctaFamily: "가족 공간으로 이동", ctaSchools: "학교 관리하기", failTitle: "결제가 완료되지 않았어요", failBody: "요금이 청구되지 않았어요. 다시 시도할 수 있고, 1분도 걸리지 않아요.", retry: "다시 시도", toPricing: "요금제로 이동" },
  th: { okTitle: "คุณเข้าใช้งานแล้ว", okBody: "ช่วงทดลองใช้ 14 วันของคุณเริ่มแล้ว บัญชีของคุณจะอัปเดตภายในไม่กี่อึดใจ หากมีบางอย่างไม่เปิดขึ้นมาทันที ให้รีเฟรชหน้านี้", ctaGeneral: "เริ่มค้นหาคำศัพท์", ctaFamily: "ไปที่พื้นที่ครอบครัวของคุณ", ctaSchools: "จัดการโรงเรียนของคุณ", failTitle: "การชำระเงินยังไม่เสร็จสมบูรณ์", failBody: "เรายังไม่ได้เรียกเก็บเงินจากคุณ คุณลองใหม่ได้ ใช้เวลาไม่ถึงหนึ่งนาที", retry: "ลองอีกครั้ง", toPricing: "ไปที่หน้าราคา" },
  bn: { okTitle: "আপনি যুক্ত হয়েছেন", okBody: "আপনার 14 দিনের ট্রায়াল শুরু হয়েছে। আপনার অ্যাকাউন্ট কয়েক মুহূর্তের মধ্যে আপডেট হবে। যদি কিছু সঙ্গে সঙ্গে না খোলে, পেজটি রিফ্রেশ করুন।", ctaGeneral: "শব্দ খোঁজা শুরু করুন", ctaFamily: "আপনার পরিবারের স্পেসে যান", ctaSchools: "আপনার স্কুল পরিচালনা করুন", failTitle: "পেমেন্ট সম্পন্ন হয়নি", failBody: "আপনার কাছ থেকে কোনো টাকা নেওয়া হয়নি। আপনি আবার চেষ্টা করতে পারেন, এতে এক মিনিটেরও কম সময় লাগে।", retry: "আবার চেষ্টা করুন", toPricing: "মূল্য পেজে যান" },
  da: { okTitle: "Du er med", okBody: "Din 14 dages prøveperiode er startet. Din konto opdateres om et øjeblik. Hvis noget ikke åbner med det samme, så genindlæs siden.", ctaGeneral: "Begynd at slå ord op", ctaFamily: "Gå til jeres familierum", ctaSchools: "Administrer din skole", failTitle: "Betalingen blev ikke gennemført", failBody: "Du blev ikke opkrævet. Du kan prøve igen, det tager under et minut.", retry: "Prøv igen", toPricing: "Gå til priser" },
  hu: { okTitle: "Beléptél", okBody: "A 14 napos próbaidőszakod elindult. A fiókod pillanatokon belül frissül. Ha valami nem nyílik meg azonnal, frissítsd az oldalt.", ctaGeneral: "Kezdj el szavakat keresni", ctaFamily: "Ugrás a családi felületedre", ctaSchools: "Az iskolád kezelése", failTitle: "A fizetés nem fejeződött be", failBody: "Nem terheltünk meg. Megpróbálhatod újra, kevesebb mint egy percet vesz igénybe.", retry: "Próbáld újra", toPricing: "Ugrás az árakhoz" },
  he: {
    okTitle: "זהו, אתם בפנים",
    okBody: "14 ימי הניסיון התחילו. החשבון מתעדכן ממש בדקות הקרובות, ואם משהו לא נפתח מיד, רעננו את הדף.",
    ctaGeneral: "להתחיל לחפש מילים",
    ctaFamily: "לאזור המשפחה",
    ctaSchools: "לניהול בית הספר",
    failTitle: "התשלום לא הושלם",
    failBody: "לא בוצע חיוב. אפשר לנסות שוב, זה לוקח פחות מדקה.",
    retry: "לנסות שוב",
    toPricing: "לדף התמחור",
  },
  en: {
    okTitle: "You are in",
    okBody: "Your 14 day trial has started. Your account updates within moments. If something does not open right away, refresh the page.",
    ctaGeneral: "Start looking up words",
    ctaFamily: "Go to your family space",
    ctaSchools: "Manage your school",
    failTitle: "Payment was not completed",
    failBody: "You were not charged. You can try again, it takes less than a minute.",
    retry: "Try again",
    toPricing: "Go to pricing",
  },
  zu: {
    okTitle: "Usungenile",
    okBody: "Ukulinga kwakho kwezinsuku ezingu-14 kuqalile. I-akhawunti yakho ivuselelwa emizuzwaneni. Uma okuthile kungavuleki ngokushesha, vuselela ikhasi.",
    ctaGeneral: "Qala ukubheka amagama",
    ctaFamily: "Iya endaweni yomndeni wakho",
    ctaSchools: "Phatha isikole sakho",
    failTitle: "Inkokhelo ayiqedwanga",
    failBody: "Awukhokhiswanga. Ungazama futhi, kuthatha ngaphansi komzuzu.",
    retry: "Zama futhi",
    toPricing: "Iya emananini",
  },
  el: {
    okTitle: "Είσαι μέσα",
    okBody: "Η δοκιμή σου των 14 ημερών ξεκίνησε. Ο λογαριασμός σου ενημερώνεται μέσα σε λίγες στιγμές. Αν κάτι δεν ανοίξει αμέσως, ανανέωσε τη σελίδα.",
    ctaGeneral: "Ξεκίνα να ψάχνεις λέξεις",
    ctaFamily: "Στον χώρο της οικογένειάς σου",
    ctaSchools: "Διαχείριση του σχολείου σου",
    failTitle: "Η πληρωμή δεν ολοκληρώθηκε",
    failBody: "Δεν χρεώθηκες. Μπορείς να δοκιμάσεις ξανά, παίρνει λιγότερο από ένα λεπτό.",
    retry: "Δοκίμασε ξανά",
    toPricing: "Στη σελίδα τιμών",
  },
};

function isFamilyPrice(priceId: string): boolean {
  return (
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_MONTHLY ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_YEARLY
  );
}

function isSchoolsPrice(priceId: string): boolean {
  return (
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_MONTHLY ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_YEARLY ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_LARGE_MONTHLY ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_LARGE_YEARLY ||
    isNewSchoolsPrice(priceId)
  );
}

export default function DoneClient() {
  const params = useSearchParams();
  const { lang, dir } = useLang();
  const href = useHref();
  const c = (COPY as Record<string, typeof COPY.en>)[lang] ?? COPY.en;

  const priceId = params.get("price") ?? "";
  // confirmSetup appends redirect_status; treat "processing" as success
  // (bank confirmation in flight, Stripe will settle it and the webhook
  // handles the outcome either way).
  const status = params.get("redirect_status") ?? "";
  const ok = status === "succeeded" || status === "processing";

  const trackedRef = useRef(false);
  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    track(ok ? "checkout_completed" : "checkout_failed", {
      priceId,
      surface: "payment_element",
      status,
    });
  }, [ok, priceId, status]);

  const successHref = isSchoolsPrice(priceId)
    ? href("/schools/manage")
    : isFamilyPrice(priceId)
      ? `${href("/family")}?welcome=1`
      : `${href("/")}?success=1`;
  const successCta = isSchoolsPrice(priceId)
    ? c.ctaSchools
    : isFamilyPrice(priceId)
      ? c.ctaFamily
      : c.ctaGeneral;

  const retryHref = priceId
    ? `${href("/checkout")}?price=${encodeURIComponent(priceId)}&retry=1`
    : href("/pricing");

  return (
    <div dir={dir} style={styles.page}>
      <header style={styles.header}>
        <Link href={href("/")} style={styles.wordmark}>
          Gadit
        </Link>
      </header>
      <main style={styles.main}>
        <div style={styles.card}>
          {ok ? (
            <>
              <div style={styles.badgeOk} aria-hidden>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h1 style={styles.title}>{c.okTitle}</h1>
              <p style={styles.body}>{c.okBody}</p>
              <Link href={successHref} style={styles.primaryLink}>
                {successCta}
              </Link>
            </>
          ) : (
            <>
              <div style={styles.badgeFail} aria-hidden>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </div>
              <h1 style={styles.title}>{c.failTitle}</h1>
              <p style={styles.body}>{c.failBody}</p>
              <Link href={retryHref} style={styles.primaryLink}>
                {priceId ? c.retry : c.toPricing}
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "#f6f4ee",
    display: "flex",
    flexDirection: "column",
  },
  header: { padding: "18px 24px" },
  wordmark: {
    fontWeight: 800,
    fontSize: 20,
    color: "#1f2937",
    textDecoration: "none",
    letterSpacing: "-0.02em",
  },
  main: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    padding: "8px 16px 48px",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    background: "#ffffff",
    borderRadius: 20,
    border: "1px solid rgba(31,41,55,0.08)",
    boxShadow: "0 10px 30px rgba(31,41,55,0.07)",
    padding: "32px 24px",
    height: "fit-content",
    textAlign: "center" as const,
  },
  badgeOk: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "rgba(14,165,165,0.12)",
    color: "#0EA5A5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
  },
  badgeFail: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "rgba(185,28,28,0.1)",
    color: "#b91c1c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: "#1f2937",
    margin: "0 0 10px",
  },
  body: {
    color: "#6b7280",
    fontSize: 14.5,
    lineHeight: 1.6,
    margin: "0 0 20px",
  },
  primaryLink: {
    display: "inline-block",
    padding: "13px 22px",
    borderRadius: 14,
    background: "#0EA5A5",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 15,
    textDecoration: "none",
  },
};

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { LANGUAGES } from "@/lib/i18n";

/**
 * Native partner dashboard. Reads the `t` token from the URL (set in the
 * welcome email), fetches /api/partner/stats, and shows the referral
 * link, live counters, and an earnings breakdown by currency.
 *
 * Self-contained inline styling (no shared shell) so a partner who isn't
 * a Gadit user still gets a clean, on-brand page.
 */

type Bucket = { pending: number; released: number; paid: number };
type Referral = { maskedId: string; joinedAt: string; totalMinor: number; currency: string; status: "pending" | "available" | "paid"; availableAt: string | null };
type Payout = { minimumMinor: number; currency: string; availableMinor: number; nextPayoutDate: string };
type Stats = {
  name: string;
  code: string;
  tier: "standard" | "founder";
  rateYearOne: number;
  rateLifetime: number;
  status: string;
  link: string;
  clicks: number;
  signups: number;
  payingCustomers: number;
  commissionCount: number;
  earnings: Record<string, Bucket>;
  referrals?: Referral[];
  payout?: Payout;
};

// Section-10 additions (account status, conversion, payout, referrals
// table). Kept in a small side-dict with an EN fallback so we don't have to
// re-translate them into all 14 COPY blocks tonight — the long-tail EN
// fallback pattern used elsewhere in the app.
const MORE: Record<string, {
  statusActive: string; statusPending: string; statusSuspended: string;
  ofClicks: string; ofSignups: string;
  payoutTitle: string; payoutOf: string; nextPayout: string; payoutReady: string;
  refTitle: string; refCustomer: string; refJoined: string; refCommission: string;
  stPending: string; stAvailable: string; stPaid: string; refEmpty: string;
  greetMorning: string; greetNoon: string; greetEvening: string; greetNight: string;
  linkIndividuals: string;
}> = {
  en: {
    statusActive: "Active", statusPending: "Pending", statusSuspended: "Paused",
    ofClicks: "of clicks", ofSignups: "of signups",
    payoutTitle: "Payout", payoutOf: "of", nextPayout: "Next payout", payoutReady: "Ready to pay out",
    refTitle: "Who signed up through you", refCustomer: "Customer", refJoined: "Joined", refCommission: "Commission",
    stPending: "Pending", stAvailable: "Available", stPaid: "Paid", refEmpty: "No paying referrals yet. Share your link to get your first.",
    greetMorning: "Good morning", greetNoon: "Good afternoon", greetEvening: "Good evening", greetNight: "Good night",
    linkIndividuals: "Individuals",
  },
  he: {
    statusActive: "פעיל", statusPending: "ממתין", statusSuspended: "מושהה",
    ofClicks: "מהקליקים", ofSignups: "מההרשמות",
    payoutTitle: "תשלום", payoutOf: "מתוך", nextPayout: "תשלום הבא", payoutReady: "מוכן לתשלום",
    refTitle: "מי נרשם דרכך", refCustomer: "לקוח", refJoined: "הצטרף", refCommission: "עמלה",
    stPending: "בהמתנה", stAvailable: "זמין", stPaid: "שולם", refEmpty: "עדיין אין הפניות משלמות. אפשר לשתף את הקישור כדי לקבל את הראשונה.",
    greetMorning: "בוקר טוב", greetNoon: "צהריים טובים", greetEvening: "ערב טוב", greetNight: "לילה טוב",
    linkIndividuals: "יחידים",
  },
};

function partnerGreeting(m: (typeof MORE)["en"], hour: number): string {
  if (hour < 5) return m.greetNight;
  if (hour < 12) return m.greetMorning;
  if (hour < 17) return m.greetNoon;
  if (hour < 22) return m.greetEvening;
  return m.greetNight;
}
function greetEmoji(hour: number): string {
  if (hour < 5 || hour >= 22) return "🌙";
  if (hour < 12) return "☀️";
  if (hour < 17) return "🌤️";
  return "🌆";
}

const COPY = {
  uk: {
    dir: "ltr" as const,
    loading: "Завантаження вашої панелі…",
    notFound: "Не вдалося знайти це посилання. Переконайтеся, що ви скопіювали повну адресу з email, або зв'яжіться з нами.",
    hi: "Вітаємо",
    yourLink: "Ваші особисті посилання",
    linksHint: "Одне посилання на продукт. Кожен, хто перейде через нього й зареєструється, закріплюється за вами, будь-якою мовою.",
    linkGeneral: "Gadit (загальне)",
    linkFamilies: "Сім'ї",
    linkSchools: "Школи",
    copy: "Скопіювати посилання",
    copied: "Скопійовано ✓",
    linkLangLabel: "Мова посилання",
    clicks: "Кліки",
    signups: "Реєстрації",
    paying: "Платні клієнти",
    earnings: "Ваш заробіток",
    pending: "В очікуванні",
    available: "Доступно",
    paid: "Виплачено",
    pendingNote: "Стає доступним через 30 днів після кожного платежу",
    tierStandard: "Партнер",
    tierFounder: "Партнер-засновник",
    rateStandard: "25% перший рік · 10% довічно",
    rateFounder: "30% перший рік · 10% довічно",
    howTitle: "Як це працює",
    how1: "Поділіться своїм особистим посиланням.",
    how2: "Кожен, хто зареєструється й заплатить через нього, закріплюється за вами на 60 днів, навіть якщо зареєструється пізніше.",
    how3: "Ви заробляєте за кожен місяць, коли клієнт справді платить. Заробіток стає доступним через 30 днів і виплачується щомісяця.",
    back: "Головна Gadit",
    empty: "Поки немає заробітку. Поділіться посиланням, щоб почати.",
  },
  tr: {
    dir: "ltr" as const,
    loading: "Paneliniz yükleniyor…",
    notFound: "Bu bağlantıyı bulamadık. E-postanızdaki tam adresi kopyaladığınızdan emin olun ya da bizimle iletişime geçin.",
    hi: "Merhaba",
    yourLink: "Kişisel bağlantılarınız",
    linksHint: "Her ürün için bir bağlantı. Bunun üzerinden gelip kaydolan herkes, hangi dilde olursa olsun size işlenir.",
    linkGeneral: "Gadit (genel)",
    linkFamilies: "Aileler",
    linkSchools: "Okullar",
    copy: "Bağlantıyı kopyala",
    copied: "Kopyalandı ✓",
    linkLangLabel: "Bağlantı dili",
    clicks: "Tıklama",
    signups: "Kayıt",
    paying: "Ödeme yapan müşteriler",
    earnings: "Kazançlarınız",
    pending: "Beklemede",
    available: "Kullanılabilir",
    paid: "Ödendi",
    pendingNote: "Her ödemeden 30 gün sonra serbest kalır",
    tierStandard: "Partner",
    tierFounder: "Kurucu Partner",
    rateStandard: "İlk yıl %25 · Ömür boyu %10",
    rateFounder: "İlk yıl %30 · Ömür boyu %10",
    howTitle: "Nasıl çalışır",
    how1: "Kişisel bağlantınızı paylaşın.",
    how2: "Bunun üzerinden kaydolup ödeme yapan herkes, daha sonra kaydolsa bile 60 gün boyunca size işlenir.",
    how3: "Müşterinin gerçekten ödediği her ay için kazanırsınız. Kazançlar 30 gün sonra serbest kalır ve aylık ödenir.",
    back: "Gadit ana sayfası",
    empty: "Henüz kazanç yok. Başlamak için bağlantınızı paylaşın.",
  },
  pl: {
    dir: "ltr" as const,
    loading: "Ładowanie Twojego panelu…",
    notFound: "Nie udało nam się znaleźć tego linku. Upewnij się, że skopiowałeś pełny adres z e-maila, lub skontaktuj się z nami.",
    hi: "Cześć",
    yourLink: "Twoje osobiste linki",
    linksHint: "Jeden link na produkt. Każdy, kto wejdzie przez niego i się zapisze, jest przypisany do Ciebie, w dowolnym języku.",
    linkGeneral: "Gadit (ogólny)",
    linkFamilies: "Rodziny",
    linkSchools: "Szkoły",
    copy: "Kopiuj link",
    copied: "Skopiowano ✓",
    linkLangLabel: "Język linku",
    clicks: "Kliknięcia",
    signups: "Rejestracje",
    paying: "Płacący klienci",
    earnings: "Twoje zarobki",
    pending: "Oczekujące",
    available: "Dostępne",
    paid: "Wypłacone",
    pendingNote: "Uwalnia się 30 dni po każdej płatności",
    tierStandard: "Partner",
    tierFounder: "Partner Założyciel",
    rateStandard: "25% w pierwszym roku · 10% dożywotnio",
    rateFounder: "30% w pierwszym roku · 10% dożywotnio",
    howTitle: "Jak to działa",
    how1: "Udostępnij swój osobisty link.",
    how2: "Każdy, kto zapisze się i zapłaci przez niego, jest przypisany do Ciebie na 60 dni, nawet jeśli zapisze się później.",
    how3: "Zarabiasz za każdy miesiąc, w którym klient rzeczywiście płaci. Zarobki uwalniają się po 30 dniach i są wypłacane co miesiąc.",
    back: "Strona główna Gadit",
    empty: "Jeszcze bez zarobków. Udostępnij swój link, aby zacząć.",
  },
  fa: {
    dir: "rtl" as const,
    loading: "در حال بارگذاری داشبوردت…",
    notFound: "این لینک را پیدا نکردیم. مطمئن شو نشانی کامل را از ایمیلت کپی کرده‌ای، یا با ما تماس بگیر.",
    hi: "سلام",
    yourLink: "لینک‌های شخصی تو",
    linksHint: "یک لینک برای هر محصول. هرکس از راه آن وارد شود و ثبت‌نام کند به نام تو ثبت می‌شود، به هر زبانی.",
    linkGeneral: "Gadit (عمومی)",
    linkFamilies: "خانواده‌ها",
    linkSchools: "مدرسه‌ها",
    copy: "کپی لینک",
    copied: "کپی شد ✓",
    linkLangLabel: "زبان لینک",
    clicks: "کلیک‌ها",
    signups: "ثبت‌نام‌ها",
    paying: "مشتریان پرداخت‌کننده",
    earnings: "درآمد تو",
    pending: "در انتظار",
    available: "در دسترس",
    paid: "پرداخت‌شده",
    pendingNote: "30 روز پس از هر پرداخت آزاد می‌شود",
    tierStandard: "شریک",
    tierFounder: "شریک بنیان‌گذار",
    rateStandard: "25% سال اول · 10% برای همیشه",
    rateFounder: "30% سال اول · 10% برای همیشه",
    howTitle: "چطور کار می‌کند",
    how1: "لینک شخصی‌ات را به اشتراک بگذار.",
    how2: "هرکس از راه آن ثبت‌نام و پرداخت کند تا 60 روز به نام تو ثبت می‌شود، حتی اگر بعداً ثبت‌نام کند.",
    how3: "روی هر ماهی که مشتری واقعاً می‌پردازد کسب می‌کنی. درآمد پس از 30 روز آزاد می‌شود و ماهانه پرداخت می‌گردد.",
    back: "خانه‌ی Gadit",
    empty: "هنوز درآمدی نیست. برای شروع لینکت را به اشتراک بگذار.",
  },
  id: {
    dir: "ltr" as const,
    loading: "Memuat dasbor Anda…",
    notFound: "Kami tidak dapat menemukan tautan ini. Pastikan Anda menyalin alamat lengkap dari email Anda, atau hubungi kami.",
    hi: "Hai",
    yourLink: "Tautan pribadi Anda",
    linksHint: "Satu tautan per produk. Siapa pun yang masuk melaluinya dan mendaftar dikreditkan kepada Anda, dalam bahasa apa pun.",
    linkGeneral: "Gadit (umum)",
    linkFamilies: "Keluarga",
    linkSchools: "Sekolah",
    copy: "Salin tautan",
    copied: "Tersalin ✓",
    linkLangLabel: "Bahasa tautan",
    clicks: "Klik",
    signups: "Pendaftaran",
    paying: "Pelanggan berbayar",
    earnings: "Penghasilan Anda",
    pending: "Tertunda",
    available: "Tersedia",
    paid: "Dibayar",
    pendingNote: "Cair 30 hari setelah setiap pembayaran",
    tierStandard: "Partner",
    tierFounder: "Founder Partner",
    rateStandard: "25% tahun pertama · 10% seumur hidup",
    rateFounder: "30% tahun pertama · 10% seumur hidup",
    howTitle: "Cara kerjanya",
    how1: "Bagikan tautan pribadi Anda.",
    how2: "Siapa pun yang mendaftar dan membayar melaluinya dikreditkan kepada Anda selama 60 hari, meski mereka mendaftar belakangan.",
    how3: "Anda mendapat pada setiap bulan pelanggan benar-benar membayar. Penghasilan cair setelah 30 hari dan dibayarkan bulanan.",
    back: "Beranda Gadit",
    empty: "Belum ada penghasilan. Bagikan tautan Anda untuk memulai.",
  },
  he: {
    dir: "rtl" as const,
    loading: "טוען את האזור שלך…",
    notFound: "לא מצאנו את הקישור הזה. כדאי לוודא שכל הכתובת הועתקה מהמייל, או לפנות אלינו.",
    hi: "היי",
    yourLink: "הקישורים האישיים שלך",
    linksHint: "קישור לכל מוצר. כל מי שנכנס דרכו ונרשם נזקף לך, בכל שפה.",
    linkGeneral: "Gadit (כללי)",
    linkFamilies: "למשפחות",
    linkSchools: "לבתי ספר",
    copy: "העתקת קישור",
    copied: "הועתק ✓",
    linkLangLabel: "שפת הקישור",
    clicks: "קליקים",
    signups: "נרשמו",
    paying: "לקוחות משלמים",
    earnings: "הרווחים שלך",
    pending: "בהמתנה",
    available: "זמין לתשלום",
    paid: "שולם",
    pendingNote: "משתחרר 30 יום אחרי כל תשלום",
    tierStandard: "שותף",
    tierFounder: "שותף מייסד",
    rateStandard: "25% שנה ראשונה · 10% לכל החיים",
    rateFounder: "30% שנה ראשונה · 10% לכל החיים",
    howTitle: "איך זה עובד",
    how1: "כדאי לשתף את הקישור האישי שלך.",
    how2: "כל מי שנרשם ומשלם דרכו משויך אליך ל-60 יום, גם אם נרשם מאוחר יותר.",
    how3: "על כל חודש שהלקוח משלם בפועל נכנסת עמלה. הרווח משתחרר אחרי 30 יום ומשולם פעם בחודש.",
    back: "לאתר Gadit",
    empty: "עדיין אין רווחים. אפשר לשתף את הקישור ולהתחיל.",
  },
  en: {
    dir: "ltr" as const,
    loading: "Loading your dashboard…",
    notFound: "We couldn't find this link. Make sure you copied the full address from your email, or contact us.",
    hi: "Hi",
    yourLink: "Your personal links",
    linksHint: "One link per product. Anyone who lands through it and signs up is credited to you, in any language.",
    linkGeneral: "Gadit (general)",
    linkFamilies: "Families",
    linkSchools: "Schools",
    copy: "Copy link",
    copied: "Copied ✓",
    linkLangLabel: "Link language",
    clicks: "Clicks",
    signups: "Signups",
    paying: "Paying customers",
    earnings: "Your earnings",
    pending: "Pending",
    available: "Available",
    paid: "Paid",
    pendingNote: "Releases 30 days after each payment",
    tierStandard: "Partner",
    tierFounder: "Founder Partner",
    rateStandard: "25% year one · 10% for life",
    rateFounder: "30% year one · 10% for life",
    howTitle: "How it works",
    how1: "Share your personal link.",
    how2: "Anyone who signs up and pays through it is credited to you for 60 days, even if they sign up later.",
    how3: "You earn on every month the customer actually pays. Earnings release after 30 days and pay out monthly.",
    back: "Gadit home",
    empty: "No earnings yet. Share your link to get started.",
  },
  nl: {
    dir: "ltr" as const,
    loading: "Je dashboard wordt geladen…",
    notFound: "We konden deze link niet vinden. Controleer of je het volledige adres uit je e-mail hebt gekopieerd, of neem contact met ons op.",
    hi: "Hoi",
    yourLink: "Je persoonlijke links",
    linksHint: "Eén link per product. Iedereen die via jouw link binnenkomt en zich aanmeldt, wordt aan jou toegeschreven, in elke taal.",
    linkGeneral: "Gadit (algemeen)",
    linkFamilies: "Gezinnen",
    linkSchools: "Scholen",
    copy: "Link kopiëren",
    copied: "Gekopieerd ✓",
    linkLangLabel: "Taal van de link",
    clicks: "Klikken",
    signups: "Aanmeldingen",
    paying: "Betalende klanten",
    earnings: "Je verdiensten",
    pending: "In behandeling",
    available: "Beschikbaar",
    paid: "Uitbetaald",
    pendingNote: "Vrijgegeven 30 dagen na elke betaling",
    tierStandard: "Partner",
    tierFounder: "Founding Partner",
    rateStandard: "25% in jaar één · 10% levenslang",
    rateFounder: "30% in jaar één · 10% levenslang",
    howTitle: "Hoe het werkt",
    how1: "Deel je persoonlijke link.",
    how2: "Iedereen die zich aanmeldt en via jouw link betaalt, wordt 60 dagen lang aan jou toegeschreven, ook als ze zich later aanmelden.",
    how3: "Je verdient aan elke maand dat de klant daadwerkelijk betaalt. Verdiensten worden na 30 dagen vrijgegeven en maandelijks uitbetaald.",
    back: "Gadit home",
    empty: "Nog geen verdiensten. Deel je link om te beginnen.",
  },
  ar: {
    dir: "rtl" as const,
    loading: "جارٍ تحميل لوحة التحكم الخاصة بك…",
    notFound: "لم نتمكن من العثور على هذا الرابط. تأكد من أنك نسخت العنوان كاملاً من بريدك الإلكتروني، أو تواصل معنا.",
    hi: "مرحباً",
    yourLink: "روابطك الشخصية",
    linksHint: "رابط واحد لكل منتج. كل من يصل عبره ويسجّل يُنسب إليك، بأي لغة.",
    linkGeneral: "Gadit (عام)",
    linkFamilies: "العائلات",
    linkSchools: "المدارس",
    copy: "انسخ الرابط",
    copied: "تم النسخ ✓",
    linkLangLabel: "لغة الرابط",
    clicks: "النقرات",
    signups: "التسجيلات",
    paying: "العملاء المدفوعون",
    earnings: "أرباحك",
    pending: "قيد الانتظار",
    available: "متاح",
    paid: "مدفوع",
    pendingNote: "تُحرَّر بعد 30 يوماً من كل دفعة",
    tierStandard: "شريك",
    tierFounder: "شريك مؤسِّس",
    rateStandard: "25% في السنة الأولى · 10% مدى الحياة",
    rateFounder: "30% في السنة الأولى · 10% مدى الحياة",
    howTitle: "كيف يعمل",
    how1: "شارك رابطك الشخصي.",
    how2: "كل من يسجّل ويدفع عبره يُنسب إليك لمدة 60 يوماً، حتى لو سجّل لاحقاً.",
    how3: "تكسب عن كل شهر يدفع فيه العميل فعلاً. تُحرَّر الأرباح بعد 30 يوماً وتُدفع شهرياً.",
    back: "الصفحة الرئيسية لـ Gadit",
    empty: "لا أرباح بعد. شارك رابطك لتبدأ.",
  },
  ru: {
    dir: "ltr" as const,
    loading: "Загружаем вашу панель…",
    notFound: "Мы не смогли найти эту ссылку. Убедитесь, что скопировали полный адрес из письма, или свяжитесь с нами.",
    hi: "Привет",
    yourLink: "Ваши персональные ссылки",
    linksHint: "Одна ссылка на каждый продукт. Любой, кто перейдёт по ней и зарегистрируется, закрепляется за вами, на любом языке.",
    linkGeneral: "Gadit (общая)",
    linkFamilies: "Семьи",
    linkSchools: "Школы",
    copy: "Копировать ссылку",
    copied: "Скопировано ✓",
    linkLangLabel: "Язык ссылки",
    clicks: "Клики",
    signups: "Регистрации",
    paying: "Платящие клиенты",
    earnings: "Ваш доход",
    pending: "Ожидается",
    available: "Доступно",
    paid: "Выплачено",
    pendingNote: "Открывается через 30 дней после каждой оплаты",
    tierStandard: "Партнёр",
    tierFounder: "Партнёр-основатель",
    rateStandard: "25% в первый год · 10% пожизненно",
    rateFounder: "30% в первый год · 10% пожизненно",
    howTitle: "Как это работает",
    how1: "Поделитесь своей персональной ссылкой.",
    how2: "Любой, кто зарегистрируется и оплатит по ней, закрепляется за вами на 60 дней, даже если зарегистрируется позже.",
    how3: "Вы зарабатываете за каждый месяц, который клиент реально оплачивает. Доход открывается через 30 дней и выплачивается ежемесячно.",
    back: "Главная Gadit",
    empty: "Пока нет дохода. Поделитесь своей ссылкой, чтобы начать.",
  },
  es: {
    dir: "ltr" as const,
    loading: "Cargando tu panel…",
    notFound: "No pudimos encontrar este enlace. Asegúrate de haber copiado la dirección completa de tu correo, o contáctanos.",
    hi: "Hola",
    yourLink: "Tus enlaces personales",
    linksHint: "Un enlace por producto. Cualquiera que llegue a través de él y se registre queda asociado a ti, en cualquier idioma.",
    linkGeneral: "Gadit (general)",
    linkFamilies: "Familias",
    linkSchools: "Colegios",
    copy: "Copiar enlace",
    copied: "Copiado ✓",
    linkLangLabel: "Idioma del enlace",
    clicks: "Clics",
    signups: "Registros",
    paying: "Clientes de pago",
    earnings: "Tus ganancias",
    pending: "Pendiente",
    available: "Disponible",
    paid: "Pagado",
    pendingNote: "Se libera 30 días después de cada pago",
    tierStandard: "Socio",
    tierFounder: "Socio Fundador",
    rateStandard: "25% el primer año · 10% de por vida",
    rateFounder: "30% el primer año · 10% de por vida",
    howTitle: "Cómo funciona",
    how1: "Comparte tu enlace personal.",
    how2: "Cualquiera que se registre y pague a través de él queda asociado a ti durante 60 días, aunque se registre más tarde.",
    how3: "Ganas por cada mes que el cliente paga de verdad. Las ganancias se liberan tras 30 días y se pagan mensualmente.",
    back: "Inicio de Gadit",
    empty: "Aún no hay ganancias. Comparte tu enlace para empezar.",
  },
  pt: {
    dir: "ltr" as const,
    loading: "Carregando seu painel…",
    notFound: "Não encontramos este link. Confira se você copiou o endereço completo do seu e-mail, ou fale com a gente.",
    hi: "Olá",
    yourLink: "Seus links pessoais",
    linksHint: "Um link por produto. Qualquer pessoa que chegar por ele e se cadastrar fica creditada a você, em qualquer idioma.",
    linkGeneral: "Gadit (geral)",
    linkFamilies: "Famílias",
    linkSchools: "Escolas",
    copy: "Copiar link",
    copied: "Copiado ✓",
    linkLangLabel: "Idioma do link",
    clicks: "Cliques",
    signups: "Cadastros",
    paying: "Clientes pagantes",
    earnings: "Seus ganhos",
    pending: "Pendente",
    available: "Disponível",
    paid: "Pago",
    pendingNote: "Libera 30 dias após cada pagamento",
    tierStandard: "Parceiro",
    tierFounder: "Parceiro Fundador",
    rateStandard: "25% no primeiro ano · 10% para sempre",
    rateFounder: "30% no primeiro ano · 10% para sempre",
    howTitle: "Como funciona",
    how1: "Compartilhe seu link pessoal.",
    how2: "Qualquer pessoa que se cadastrar e pagar por ele fica creditada a você por 60 dias, mesmo que se cadastre depois.",
    how3: "Você ganha em cada mês que o cliente realmente paga. Os ganhos liberam após 30 dias e são pagos todo mês.",
    back: "Início do Gadit",
    empty: "Nenhum ganho ainda. Compartilhe seu link para começar.",
  },
  fr: {
    dir: "ltr" as const,
    loading: "Chargement de votre tableau de bord…",
    notFound: "Nous n'avons pas trouvé ce lien. Assurez-vous d'avoir copié l'adresse complète depuis votre e-mail, ou contactez-nous.",
    hi: "Bonjour",
    yourLink: "Vos liens personnels",
    linksHint: "Un lien par produit. Toute personne qui arrive via ce lien et s'inscrit vous est attribuée, dans n'importe quelle langue.",
    linkGeneral: "Gadit (général)",
    linkFamilies: "Familles",
    linkSchools: "Écoles",
    copy: "Copier le lien",
    copied: "Copié ✓",
    linkLangLabel: "Langue du lien",
    clicks: "Clics",
    signups: "Inscriptions",
    paying: "Clients payants",
    earnings: "Vos gains",
    pending: "En attente",
    available: "Disponible",
    paid: "Payé",
    pendingNote: "Débloqué 30 jours après chaque paiement",
    tierStandard: "Partenaire",
    tierFounder: "Partenaire fondateur",
    rateStandard: "25% la première année · 10% à vie",
    rateFounder: "30% la première année · 10% à vie",
    howTitle: "Comment ça marche",
    how1: "Partagez votre lien personnel.",
    how2: "Toute personne qui s'inscrit et paie via ce lien vous est attribuée pendant 60 jours, même si elle s'inscrit plus tard.",
    how3: "Vous gagnez sur chaque mois réellement payé par le client. Les gains sont débloqués après 30 jours et versés chaque mois.",
    back: "Accueil Gadit",
    empty: "Aucun gain pour le moment. Partagez votre lien pour commencer.",
  },
  de: {
    dir: "ltr" as const,
    loading: "Dein Dashboard wird geladen…",
    notFound: "Wir konnten diesen Link nicht finden. Stelle sicher, dass du die vollständige Adresse aus deiner E-Mail kopiert hast, oder kontaktiere uns.",
    hi: "Hallo",
    yourLink: "Deine persönlichen Links",
    linksHint: "Ein Link pro Produkt. Jeder, der darüber landet und sich anmeldet, wird dir zugerechnet, in jeder Sprache.",
    linkGeneral: "Gadit (allgemein)",
    linkFamilies: "Familien",
    linkSchools: "Schulen",
    copy: "Link kopieren",
    copied: "Kopiert ✓",
    linkLangLabel: "Sprache des Links",
    clicks: "Klicks",
    signups: "Anmeldungen",
    paying: "Zahlende Kunden",
    earnings: "Deine Einnahmen",
    pending: "Ausstehend",
    available: "Verfügbar",
    paid: "Ausgezahlt",
    pendingNote: "Freigabe 30 Tage nach jeder Zahlung",
    tierStandard: "Partner",
    tierFounder: "Gründungspartner",
    rateStandard: "25% im ersten Jahr · 10% ein Leben lang",
    rateFounder: "30% im ersten Jahr · 10% ein Leben lang",
    howTitle: "So funktioniert es",
    how1: "Teile deinen persönlichen Link.",
    how2: "Jeder, der sich darüber anmeldet und zahlt, wird dir 60 Tage lang zugerechnet, auch wenn er sich erst später anmeldet.",
    how3: "Du verdienst in jedem Monat, in dem der Kunde tatsächlich zahlt. Die Einnahmen werden nach 30 Tagen freigegeben und monatlich ausgezahlt.",
    back: "Zur Gadit-Startseite",
    empty: "Noch keine Einnahmen. Teile deinen Link, um loszulegen.",
  },
  cs: {
    dir: "ltr" as const,
    loading: "Načítání vaší nástěnky…",
    notFound: "Tento odkaz se nám nepodařilo najít. Zkontrolujte, že jste zkopírovali celou adresu z e-mailu, nebo nás kontaktujte.",
    hi: "Ahoj",
    yourLink: "Vaše osobní odkazy",
    linksHint: "Jeden odkaz na produkt. Každý, kdo přes něj přijde a zaregistruje se, je vám připsán, v jakémkoli jazyce.",
    linkGeneral: "Gadit (obecně)",
    linkFamilies: "Rodiny",
    linkSchools: "Školy",
    copy: "Kopírovat odkaz",
    copied: "Zkopírováno ✓",
    linkLangLabel: "Jazyk odkazu",
    clicks: "Kliknutí",
    signups: "Registrace",
    paying: "Platící zákazníci",
    earnings: "Vaše výdělky",
    pending: "Nevyřízeno",
    available: "K dispozici",
    paid: "Vyplaceno",
    pendingNote: "Uvolňuje se 30 dní po každé platbě",
    tierStandard: "Partner",
    tierFounder: "Zakládající partner",
    rateStandard: "25% první rok · 10% napořád",
    rateFounder: "30% první rok · 10% napořád",
    howTitle: "Jak to funguje",
    how1: "Sdílejte svůj osobní odkaz.",
    how2: "Každý, kdo se přes něj zaregistruje a zaplatí, je vám připsán na 60 dní, i když se zaregistruje později.",
    how3: "Vyděláváte za každý měsíc, kdy zákazník skutečně zaplatí. Výdělky se uvolní po 30 dnech a vyplácejí se měsíčně.",
    back: "Domů Gadit",
    empty: "Zatím žádné výdělky. Začněte sdílením svého odkazu.",
  },
  sk: {
    dir: "ltr" as const,
    loading: "Načítavam tvoju nástenku…",
    notFound: "Tento odkaz sa nám nepodarilo nájsť. Skontroluj, či si skopíroval celú adresu z e-mailu, alebo nás kontaktuj.",
    hi: "Ahoj",
    yourLink: "Tvoje osobné odkazy",
    linksHint: "Jeden odkaz na produkt. Každý, kto cezeň príde a zaregistruje sa, je pripísaný tebe, v akomkoľvek jazyku.",
    linkGeneral: "Gadit (všeobecný)",
    linkFamilies: "Rodiny",
    linkSchools: "Školy",
    copy: "Kopírovať odkaz",
    copied: "Skopírované ✓",
    linkLangLabel: "Jazyk odkazu",
    clicks: "Kliknutia",
    signups: "Registrácie",
    paying: "Platiaci zákazníci",
    earnings: "Tvoje zárobky",
    pending: "Čakajúce",
    available: "Dostupné",
    paid: "Vyplatené",
    pendingNote: "Uvoľňuje sa 30 dní po každej platbe",
    tierStandard: "Partner",
    tierFounder: "Zakladajúci partner",
    rateStandard: "25% prvý rok · 10% navždy",
    rateFounder: "30% prvý rok · 10% navždy",
    howTitle: "Ako to funguje",
    how1: "Zdieľaj svoj osobný odkaz.",
    how2: "Každý, kto sa cezeň zaregistruje a zaplatí, je pripísaný tebe na 60 dní, aj keď sa zaregistruje neskôr.",
    how3: "Zarábaš za každý mesiac, keď zákazník skutočne platí. Zárobky sa uvoľňujú po 30 dňoch a vyplácajú sa mesačne.",
    back: "Domov Gadit",
    empty: "Zatiaľ žiadne zárobky. Zdieľaj svoj odkaz a začni.",
  },
  it: {
    dir: "ltr" as const,
    loading: "Caricamento della tua dashboard…",
    notFound: "Non siamo riusciti a trovare questo link. Assicurati di aver copiato l'indirizzo completo dalla tua email, oppure contattaci.",
    hi: "Ciao",
    yourLink: "I tuoi link personali",
    linksHint: "Un link per prodotto. Chiunque arrivi tramite esso e si iscriva viene attribuito a te, in qualsiasi lingua.",
    linkGeneral: "Gadit (generale)",
    linkFamilies: "Families",
    linkSchools: "Schools",
    copy: "Copia link",
    copied: "Copiato ✓",
    linkLangLabel: "Lingua del link",
    clicks: "Clic",
    signups: "Iscrizioni",
    paying: "Clienti paganti",
    earnings: "I tuoi guadagni",
    pending: "In sospeso",
    available: "Disponibile",
    paid: "Pagato",
    pendingNote: "Si sblocca 30 giorni dopo ogni pagamento",
    tierStandard: "Partner",
    tierFounder: "Partner Founder",
    rateStandard: "25% il primo anno · 10% a vita",
    rateFounder: "30% il primo anno · 10% a vita",
    howTitle: "Come funziona",
    how1: "Condividi il tuo link personale.",
    how2: "Chiunque si iscriva e paghi tramite esso viene attribuito a te per 60 giorni, anche se si iscrive più tardi.",
    how3: "Guadagni per ogni mese in cui il cliente paga davvero. I guadagni si sbloccano dopo 30 giorni e vengono versati mensilmente.",
    back: "Home di Gadit",
    empty: "Ancora nessun guadagno. Condividi il tuo link per iniziare.",
  },
  ja: {
    dir: "ltr" as const,
    loading: "ダッシュボードを読み込んでいます…",
    notFound: "このリンクが見つかりませんでした。メールに記載された完全なアドレスをコピーしたかご確認いただくか、お問い合わせください。",
    hi: "こんにちは",
    yourLink: "あなた専用のリンク",
    linksHint: "製品ごとに1つのリンクがあります。そこから訪れて登録した方は、どの言語でもあなたの成果として記録されます。",
    linkGeneral: "Gadit（総合）",
    linkFamilies: "ファミリー",
    linkSchools: "スクール",
    copy: "リンクをコピー",
    copied: "コピーしました ✓",
    linkLangLabel: "リンクの言語",
    clicks: "クリック数",
    signups: "登録数",
    paying: "有料のお客様",
    earnings: "あなたの報酬",
    pending: "保留中",
    available: "受け取り可能",
    paid: "支払い済み",
    pendingNote: "各支払いから30日後に確定します",
    tierStandard: "パートナー",
    tierFounder: "ファウンダーパートナー",
    rateStandard: "初年度25% · 生涯10%",
    rateFounder: "初年度30% · 生涯10%",
    howTitle: "仕組み",
    how1: "あなた専用のリンクをシェアしましょう。",
    how2: "そこから登録して支払った方は、60日間あなたの成果として記録され、後から登録しても対象になります。",
    how3: "お客様が実際に支払った毎月ごとに報酬が発生します。報酬は30日後に確定し、毎月お支払いします。",
    back: "Gadit ホーム",
    empty: "まだ報酬はありません。リンクをシェアして始めましょう。",
  },
  hi: {
    dir: "ltr" as const,
    loading: "आपका डैशबोर्ड लोड हो रहा है…",
    notFound: "हमें यह लिंक नहीं मिला। पक्का करें कि आपने अपने ईमेल से पूरा पता कॉपी किया है, या हमसे संपर्क करें।",
    hi: "नमस्ते",
    yourLink: "आपके निजी लिंक",
    linksHint: "हर प्रोडक्ट के लिए एक लिंक। जो भी इसके ज़रिए आता है और साइन अप करता है वह आपके नाम जुड़ जाता है, किसी भी भाषा में।",
    linkGeneral: "Gadit (सामान्य)",
    linkFamilies: "Families",
    linkSchools: "Schools",
    copy: "लिंक कॉपी करें",
    copied: "कॉपी हो गया ✓",
    linkLangLabel: "लिंक की भाषा",
    clicks: "क्लिक",
    signups: "साइन अप",
    paying: "भुगतान करने वाले ग्राहक",
    earnings: "आपकी कमाई",
    pending: "लंबित",
    available: "उपलब्ध",
    paid: "भुगतान किया गया",
    pendingNote: "हर भुगतान के 30 दिन बाद रिलीज होता है",
    tierStandard: "पार्टनर",
    tierFounder: "फाउंडर पार्टनर",
    rateStandard: "पहले साल 25% · जीवन भर 10%",
    rateFounder: "पहले साल 30% · जीवन भर 10%",
    howTitle: "यह कैसे काम करता है",
    how1: "अपना निजी लिंक शेयर करें।",
    how2: "जो भी इसके ज़रिए साइन अप करके भुगतान करता है वह 60 दिनों तक आपके नाम जुड़ जाता है, भले ही वे बाद में साइन अप करें।",
    how3: "जिस भी महीने ग्राहक सचमुच भुगतान करता है, आप कमाते हैं। कमाई 30 दिनों के बाद रिलीज होती है और हर महीने भुगतान मिलता है।",
    back: "Gadit होम",
    empty: "अभी तक कोई कमाई नहीं। शुरू करने के लिए अपना लिंक शेयर करें।",
  },
  am: {
    dir: "ltr" as const,
    loading: "ዳሽቦርድዎ እየተጫነ ነው…",
    notFound: "ይህን አገናኝ ማግኘት አልቻልንም። ሙሉ አድራሻውን ከኢሜይልዎ በትክክል መቅዳትዎን ያረጋግጡ፣ ወይም ያግኙን።",
    hi: "ሰላም",
    yourLink: "የግል አገናኞችዎ",
    linksHint: "ለእያንዳንዱ ምርት አንድ አገናኝ። በእሱ በኩል ገብቶ የሚመዘገብ ማንኛውም ሰው በማንኛውም ቋንቋ ለእርስዎ ይመዘገባል።",
    linkGeneral: "Gadit (አጠቃላይ)",
    linkFamilies: "ቤተሰቦች",
    linkSchools: "ትምህርት ቤቶች",
    copy: "አገናኝ ቅዳ",
    copied: "ተቀድቷል ✓",
    linkLangLabel: "የአገናኝ ቋንቋ",
    clicks: "ጠቅታዎች",
    signups: "ምዝገባዎች",
    paying: "የሚከፍሉ ደንበኞች",
    earnings: "ገቢዎ",
    pending: "በመጠባበቅ ላይ",
    available: "ዝግጁ",
    paid: "ተከፍሏል",
    pendingNote: "ከእያንዳንዱ ክፍያ 30 ቀናት በኋላ ይለቀቃል",
    tierStandard: "አጋር",
    tierFounder: "መስራች አጋር",
    rateStandard: "25% በመጀመሪያው ዓመት · 10% ለዘላለም",
    rateFounder: "30% በመጀመሪያው ዓመት · 10% ለዘላለም",
    howTitle: "እንዴት እንደሚሰራ",
    how1: "የግል አገናኝዎን ያካፍሉ።",
    how2: "በእሱ በኩል ተመዝግቦ የሚከፍል ማንኛውም ሰው ኋላ ላይ ቢመዘገብም እንኳ ለ60 ቀናት ለእርስዎ ይመዘገባል።",
    how3: "ደንበኛው በእውነት በከፈለ በእያንዳንዱ ወር ያገኛሉ። ገቢው ከ30 ቀናት በኋላ ይለቀቃል በየወሩም ይከፈላል።",
    back: "የ Gadit መነሻ",
    empty: "እስካሁን ምንም ገቢ የለም። ለመጀመር አገናኝዎን ያካፍሉ።",
  },
};

const CUR_SYMBOL: Record<string, string> = { ils: "₪", usd: "$", eur: "€", gbp: "£" };

function money(minor: number, currency: string): string {
  const sym = CUR_SYMBOL[currency] ?? currency.toUpperCase() + " ";
  return `${sym}${(minor / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// The 30+ UI languages, with native names, for the link-language picker.
// A partner shares gadit.app/<lang>/?ref=<code>; the middleware sets the
// language from the prefix and the ?ref= is preserved through the rewrite,
// so the audience lands in that language AND the click is attributed.
// Derived from the shared LANGUAGES registry so a partner can always build
// a referral link in every UI language we support (never drifts behind).
const LINK_LANGS: Array<{ code: string; native: string }> =
  LANGUAGES.map((l) => ({ code: l.code, native: l.label }));
// A partner link = a landing path + ?ref=<code>, in the chosen language.
// RefCapture (mounted in the root layout) reads ?ref on EVERY page, so the
// referral is attributed no matter which product page they land on.
const PRODUCT_PATHS = {
  individuals: "/pricing",
  families: "/families/landing",
  schools: "/schools/landing",
} as const;
type ProductKey = keyof typeof PRODUCT_PATHS;

function buildRefLink(code: string, lang: string, path = ""): string {
  const base = "https://www.gadit.app";
  const prefix = lang === "en" ? "" : `/${lang}`;
  return path
    ? `${base}${prefix}${path}?ref=${code}`
    : `${base}${prefix}/?ref=${code}`;
}

export function PartnerDashboardClient() {
  const { lang } = useLang();
  const href = useHref();
  const t = COPY[(lang in COPY ? lang : "en") as keyof typeof COPY];
  const m = MORE[lang] ?? MORE.en;
  const dir = t.dir;

  const [stats, setStats] = useState<Stats | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [linkLang, setLinkLang] = useState<string>(lang); // language for the shared links

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("t");
    if (!token) {
      setState("error");
      return;
    }
    fetch(`/api/partner/stats?t=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Stats) => {
        setStats(d);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  async function copyLink(product: ProductKey) {
    if (!stats) return;
    try {
      await navigator.clipboard.writeText(buildRefLink(stats.code, linkLang, PRODUCT_PATHS[product]));
      setCopiedKey(product);
      setTimeout(() => setCopiedKey((k) => (k === product ? null : k)), 1800);
    } catch { /* clipboard blocked — ignore */ }
  }

  const currencies = stats ? Object.keys(stats.earnings) : [];
  const hasEarnings = currencies.length > 0;
  const hour = new Date().getHours();

  return (
    <div dir={dir} style={S.page}>
      <style>{RESPONSIVE_CSS}</style>

      {/* Top bar — like a real affiliate portal, brand left, exit right. */}
      <div style={S.topbar}>
        <div style={S.topbarInner}>
          <Link href={href("/")} style={S.wordmark} translate="no">
            Gad<span style={{ color: "#0EA5A5", fontStyle: "italic", fontWeight: 600 }}>it</span>
          </Link>
          <Link href={href("/")} style={S.topBack}>{t.back} →</Link>
        </div>
      </div>

      <div style={S.shell}>
        {state === "loading" && <div style={S.muted}>{t.loading}</div>}
        {state === "error" && <div style={S.errorBox}>{t.notFound}</div>}

        {state === "ready" && stats && (
          <>
            {/* Identity — centered, badge on top, dynamic greeting with the
                partner's FIRST name only (Yooniz style, Gadi 2026-08-17). */}
            <div style={S.headCenter}>
              <span style={{ ...S.tierBadge, ...(stats.tier === "founder" ? S.tierFounder : S.tierStandard) }}>
                {stats.tier === "founder" ? t.tierFounder : t.tierStandard}
              </span>
              <h1 style={S.h1}>
                <span style={{ marginInlineEnd: 8 }}>{greetEmoji(hour)}</span>
                {partnerGreeting(m, hour)}{stats.name ? ` ${stats.name.trim().split(/\s+/)[0]}` : ""}
              </h1>
              <div style={S.rateLine}>
                {`${Math.round(stats.rateYearOne * 100)}% ${lang === "he" ? "שנה ראשונה" : "year one"} · ${Math.round(stats.rateLifetime * 100)}% ${lang === "he" ? "לכל החיים" : "for life"}`}
              </div>
              {(() => {
                const st = stats.status === "suspended"
                  ? { bg: "rgba(220,38,38,0.10)", fg: "#B91C1C", label: m.statusSuspended }
                  : stats.status === "active"
                  ? { bg: "rgba(22,163,74,0.12)", fg: "#15803D", label: m.statusActive }
                  : { bg: "rgba(180,83,9,0.12)", fg: "#B45309", label: m.statusPending };
                return (
                  <span style={{ ...S.statusBadge, background: st.bg, color: st.fg, marginTop: 4 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: st.fg, display: "inline-block" }} />
                    {st.label}
                  </span>
                );
              })()}
            </div>

            {/* KPI row — with conversion % beneath signups and paying. */}
            <div className="pd-kpi" style={S.kpiGrid}>
              <Kpi label={t.clicks} value={stats.clicks.toLocaleString()} accent="#0EA5A5" />
              <Kpi label={t.signups} value={stats.signups.toLocaleString()} accent="#7C3AED"
                   sub={stats.clicks > 0 ? `${Math.round((stats.signups / stats.clicks) * 100)}% ${m.ofClicks}` : undefined} />
              <Kpi label={t.paying} value={stats.payingCustomers.toLocaleString()} accent="#0891B2"
                   sub={stats.signups > 0 ? `${Math.round((stats.payingCustomers / stats.signups) * 100)}% ${m.ofSignups}` : undefined} />
              <Kpi label={t.available} value={hasEarnings ? money(stats.earnings[currencies[0]].released, currencies[0]) : "—"} accent="#16A34A" />
            </div>

            {/* Body: links + how (main) · earnings (sidebar) */}
            <div className="pd-body" style={S.body}>
              <div style={S.col}>
                {/* Referral links — one per product, RefCapture attributes
                    ?ref on any of them. Shared language picker. */}
                <div style={S.card}>
                  <div style={S.cardLabel}>{t.yourLink}</div>
                  <div style={S.subtle}>{t.linksHint}</div>
                  {/* Families + Schools only (Gadi 2026-08-13): these are the
                      products we want partners to sell. The general Gadit link
                      was dropped from the portal and the welcome email. */}
                  {(["individuals", "families", "schools"] as ProductKey[]).map((product) => {
                    const label = product === "individuals" ? m.linkIndividuals : product === "families" ? t.linkFamilies : t.linkSchools;
                    return (
                      <div key={product} style={{ marginBottom: 12 }}>
                        <div style={S.linkProductLabel}>{label}</div>
                        <div style={S.linkRow}>
                          <div style={S.linkText} dir="ltr">{buildRefLink(stats.code, linkLang, PRODUCT_PATHS[product])}</div>
                          <button type="button" onClick={() => copyLink(product)} style={S.copyBtn}>
                            {copiedKey === product ? t.copied : t.copy}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div style={S.linkLangRow}>
                    <span style={S.linkLangLabel}>{t.linkLangLabel}</span>
                    <select value={linkLang} onChange={(e) => setLinkLang(e.target.value)} style={S.linkLangSelect}>
                      {LINK_LANGS.map((l) => (<option key={l.code} value={l.code}>{l.native}</option>))}
                    </select>
                  </div>
                </div>

                {/* Who signed up through you (masked, privacy-safe §10.6) */}
                <div style={S.card}>
                  <div style={S.cardLabel}>{m.refTitle}</div>
                  {!stats.referrals || stats.referrals.length === 0 ? (
                    <div style={S.muted}>{m.refEmpty}</div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={S.table}>
                        <thead>
                          <tr>
                            <th style={S.th}>{m.refCustomer}</th>
                            <th style={S.th}>{m.refJoined}</th>
                            <th style={{ ...S.th, textAlign: "end" }}>{m.refCommission}</th>
                            <th style={{ ...S.th, textAlign: "end" }}>{t.pending}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.referrals.map((r, i) => {
                            const chip = r.status === "paid"
                              ? { bg: "#F3F4F6", fg: "#4B5563", label: m.stPaid }
                              : r.status === "available"
                              ? { bg: "rgba(22,163,74,0.12)", fg: "#15803D", label: m.stAvailable }
                              : { bg: "rgba(180,83,9,0.12)", fg: "#B45309", label: m.stPending };
                            return (
                              <tr key={i}>
                                <td style={S.td} dir="ltr">{r.maskedId}</td>
                                <td style={S.td}>{new Date(r.joinedAt).toLocaleDateString(lang === "he" ? "he-IL" : undefined, { day: "2-digit", month: "short" })}</td>
                                <td style={{ ...S.td, textAlign: "end", fontWeight: 700 }} dir="ltr">{money(r.totalMinor, r.currency)}</td>
                                <td style={{ ...S.td, textAlign: "end" }}>
                                  <span style={{ ...S.chip, background: chip.bg, color: chip.fg }}>{chip.label}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* How it works */}
                <div style={S.card}>
                  <div style={S.cardLabel}>{t.howTitle}</div>
                  <ol style={S.ol}>
                    <li style={S.li}>{t.how1}</li>
                    <li style={S.li}>{t.how2}</li>
                    <li style={S.li}>{t.how3}</li>
                  </ol>
                </div>
              </div>

              {/* Earnings sidebar */}
              <div style={S.col}>
                <div style={S.card}>
                  <div style={S.cardLabel}>{t.earnings}</div>
                  {!hasEarnings && <div style={S.muted}>{t.empty}</div>}
                  {currencies.map((cur) => {
                    const b = stats.earnings[cur];
                    return (
                      <div key={cur} style={S.earnBlock}>
                        <div style={S.earnBig} dir="ltr">{money(b.released, cur)}</div>
                        <div style={S.earnBigLabel}>{t.available}</div>
                        <div style={S.earnSplit}>
                          <EarnCell label={t.pending} value={money(b.pending, cur)} />
                          <EarnCell label={t.paid} value={money(b.paid, cur)} />
                        </div>
                      </div>
                    );
                  })}
                  {hasEarnings && <div style={S.pendingNote}>{t.pendingNote}</div>}
                </div>

                {/* Payout threshold + next payout (§10.4) */}
                {stats.payout && (() => {
                  const p = stats.payout;
                  const pct = p.minimumMinor > 0 ? Math.min(100, (p.availableMinor / p.minimumMinor) * 100) : 0;
                  const ready = p.availableMinor >= p.minimumMinor && p.availableMinor > 0;
                  return (
                    <div style={S.card}>
                      <div style={S.cardLabel}>{m.payoutTitle}</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: ready ? "#16A34A" : "#111827" }} dir="ltr">{money(p.availableMinor, p.currency)}</span>
                        <span style={{ fontSize: 13, color: "#6B7280" }} dir="ltr">{m.payoutOf} {money(p.minimumMinor, p.currency)}</span>
                      </div>
                      <div style={S.payoutBar}><div style={{ ...S.payoutFill, width: `${pct}%`, background: ready ? "#16A34A" : "#0EA5A5" }} /></div>
                      <div style={S.payoutNext}>
                        {ready ? m.payoutReady : `${m.nextPayout}: ${new Date(p.nextPayoutDate).toLocaleDateString(lang === "he" ? "he-IL" : undefined, { day: "2-digit", month: "short" })}`}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, accent, sub }: { label: string; value: string; accent: string; sub?: string }) {
  return (
    <div style={S.kpiCard}>
      <div style={{ ...S.kpiValue, color: accent }} dir="ltr">{value}</div>
      <div style={S.kpiLabel}>{label}</div>
      <div style={S.kpiSub}>{sub ?? " "}</div>
    </div>
  );
}

function EarnCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={S.earnCell}>
      <div style={S.earnValue} dir="ltr">{value}</div>
      <div style={S.earnLabel}>{label}</div>
    </div>
  );
}

// Inline styles can't media-query; a tiny stylesheet widens the KPI row to
// 4-across and the body to a 2-column (main + earnings) layout on desktop.
const RESPONSIVE_CSS = `
@media (min-width: 720px) { .pd-kpi { grid-template-columns: repeat(4, 1fr) !important; } }
@media (min-width: 900px) { .pd-body { grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr) !important; } }
`;

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "#F4F6F8",
    fontFamily: "var(--font-rubik, -apple-system, Segoe UI, Roboto, sans-serif)",
    color: "#111827",
    paddingBottom: 64,
  },
  topbar: { background: "#fff", borderBottom: "1px solid #E9ECEF" },
  topbarInner: { maxWidth: 1120, margin: "0 auto", padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  wordmark: { fontSize: 22, fontWeight: 800, color: "#111827", textDecoration: "none", letterSpacing: "-0.02em" },
  topBack: { color: "#6B7280", textDecoration: "none", fontSize: 13.5, fontWeight: 600 },
  shell: { maxWidth: 1120, margin: "0 auto", padding: "28px 22px 0" },
  muted: { color: "#6B7280", fontSize: 15, padding: "12px 0" },
  errorBox: { background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", borderRadius: 12, padding: 20, fontSize: 15, lineHeight: 1.6 },
  headRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 22 },
  headCenter: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8, marginBottom: 24 },
  h1: { fontSize: 26, fontWeight: 800, margin: 0 },
  rateLine: { color: "#6B7280", fontSize: 14, marginTop: 2 },
  tierBadge: { fontSize: 12.5, fontWeight: 700, padding: "6px 14px", borderRadius: 999, whiteSpace: "nowrap" },
  tierStandard: { background: "rgba(14,165,165,0.12)", color: "#0b7d7d" },
  tierFounder: { background: "rgba(124,58,237,0.12)", color: "#6D28D9" },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 18 },
  kpiCard: { background: "#fff", border: "1px solid #E9ECEF", borderRadius: 16, padding: "20px 18px", boxShadow: "0 1px 2px rgba(16,24,40,0.04)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" },
  kpiValue: { fontSize: 32, fontWeight: 800, lineHeight: 1.1, textAlign: "center" },
  kpiLabel: { fontSize: 13, color: "#6B7280", marginTop: 6, fontWeight: 500, textAlign: "center" },
  kpiSub: { fontSize: 11.5, color: "#9CA3AF", marginTop: 3, textAlign: "center", height: 15, lineHeight: "15px" },
  statusBadge: { fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 },
  payoutBar: { background: "#F0F2F4", borderRadius: 999, height: 8, overflow: "hidden" },
  payoutFill: { height: "100%", borderRadius: 999, transition: "width 0.3s" },
  payoutNext: { fontSize: 12.5, color: "#6B7280", marginTop: 10, fontWeight: 600 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13.5 },
  th: { textAlign: "start", fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.3, padding: "0 8px 8px", borderBottom: "1px solid #F0F2F4", whiteSpace: "nowrap" },
  td: { padding: "10px 8px", borderBottom: "1px solid #F6F7F8", color: "#374151", whiteSpace: "nowrap" },
  chip: { fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap" },
  body: { display: "grid", gridTemplateColumns: "1fr", gap: 18 },
  col: { display: "flex", flexDirection: "column", gap: 18, minWidth: 0 },
  card: { background: "#fff", border: "1px solid #E9ECEF", borderRadius: 16, padding: 22, boxShadow: "0 1px 2px rgba(16,24,40,0.04)" },
  cardLabel: { fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 6, letterSpacing: 0.4, textTransform: "uppercase" },
  subtle: { fontSize: 12.5, color: "#6B7280", marginBottom: 14, lineHeight: 1.5 },
  linkProductLabel: { fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 },
  linkRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  linkText: { flex: 1, minWidth: 180, fontSize: 14, fontWeight: 600, color: "#0E7C74", wordBreak: "break-all", background: "#F4F6F8", borderRadius: 8, padding: "9px 12px" },
  copyBtn: { background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 9, padding: "9px 16px", fontWeight: 700, fontSize: 13.5, cursor: "pointer", whiteSpace: "nowrap" },
  linkLangRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 8 },
  linkLangLabel: { fontSize: 13, color: "#6B7280" },
  linkLangSelect: { fontSize: 14, padding: "6px 10px", borderRadius: 8, border: "1px solid #D1D5DB", background: "#fff", cursor: "pointer", fontFamily: "inherit" },
  earnBlock: { marginBottom: 10 },
  earnBig: { fontSize: 30, fontWeight: 800, color: "#16A34A", lineHeight: 1.1 },
  earnBigLabel: { fontSize: 12.5, color: "#6B7280", marginTop: 2, marginBottom: 14 },
  earnSplit: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, borderTop: "1px solid #F0F2F4", paddingTop: 12 },
  earnCell: { textAlign: "start" },
  earnValue: { fontSize: 17, fontWeight: 700, color: "#374151" },
  earnLabel: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  pendingNote: { fontSize: 12, color: "#9CA3AF", marginTop: 14 },
  ol: { margin: 0, paddingInlineStart: 20 },
  li: { fontSize: 14.5, lineHeight: 1.7, color: "#374151", marginBottom: 6 },
};

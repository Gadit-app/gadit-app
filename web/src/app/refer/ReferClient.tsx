"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { ShareButton } from "@/components/ShareButton";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import type { Lang } from "@/lib/i18n";

/**
 * /refer — the member-gets-member invite page. Shows the user's personal
 * invite link, a copy + native-share button, and their running stats
 * (invited / subscribed / free months earned). Reward payout is admin-granted
 * in v1, so the copy promises a free month (which we honor) without exposing
 * any billing mechanism.
 */

type ReferData = { code: string; link: string; invited: number; joinedPaid: number; rewardsOwed: number };

function fontBody(lang: Lang): string {
  if (lang === "he") return "var(--wb-he)";
  if (lang === "ar") return "var(--wb-ar)";
  if (lang === "ja") return "var(--wb-jp)";
  if (lang === "hi") return "var(--wb-hi)";
  return "var(--wb-sans)";
}

function copy(lang: Lang) {
  const en = {
    eyebrow: "Invite friends",
    title: "A free month for every friend who joins",
    sub: "Share your personal link. When a friend subscribes to Gadit through it, you get a free month.",
    yourLink: "Your invite link",
    copy: "Copy",
    copied: "Copied ✓",
    share: "Share",
    invited: "Invited",
    joined: "Subscribed",
    months: "Free months earned",
    note: "Earned months are credited to your account. We'll let you know when they're applied.",
    loginTitle: "Sign in to get your invite link",
    loginBtn: "Sign in",
    loading: "Loading…",
  };
  const he: typeof en = {
    eyebrow: "הזמנת חברים",
    title: "חודש חינם על כל חבר שמצטרף",
    sub: "לשתף את הקישור האישי. על כל חבר שנרשם למנוי בגדית דרכו, מקבלים חודש חינם.",
    yourLink: "קישור ההזמנה שלך",
    copy: "העתקה",
    copied: "הועתק ✓",
    share: "שיתוף",
    invited: "הוזמנו",
    joined: "נרשמו למנוי",
    months: "חודשים שהרווחת",
    note: "החודשים שנצברו נזקפים לחשבונך. נעדכן אותך כשהם מיושמים.",
    loginTitle: "צריך להתחבר כדי לקבל קישור הזמנה אישי",
    loginBtn: "התחברות",
    loading: "טוען…",
  };
  const c_ar: typeof en = {
    eyebrow: "ادعُ أصدقاءك",
    title: "شهر مجاني عن كل صديق ينضم",
    sub: "شارك رابطك الشخصي. عندما يشترك صديق في Gadit من خلاله، تحصل على شهر مجاني.",
    yourLink: "رابط الدعوة الخاص بك",
    copy: "نسخ",
    copied: "تم النسخ ✓",
    share: "مشاركة",
    invited: "المدعوون",
    joined: "المشتركون",
    months: "الأشهر المجانية المكتسبة",
    note: "تُضاف الأشهر المكتسبة إلى حسابك. سنخبرك عند تفعيلها.",
    loginTitle: "سجّل الدخول للحصول على رابط الدعوة",
    loginBtn: "تسجيل الدخول",
    loading: "جارٍ التحميل…",
  };
  const c_ru: typeof en = {
    eyebrow: "Пригласите друзей",
    title: "Бесплатный месяц за каждого друга, который присоединится",
    sub: "Поделитесь личной ссылкой. Когда друг оформит подписку на Gadit по ней, вы получите бесплатный месяц.",
    yourLink: "Ваша ссылка-приглашение",
    copy: "Копировать",
    copied: "Скопировано ✓",
    share: "Поделиться",
    invited: "Приглашено",
    joined: "Оформили подписку",
    months: "Бесплатных месяцев получено",
    note: "Полученные месяцы зачисляются на ваш аккаунт. Мы сообщим, когда они будут применены.",
    loginTitle: "Войдите, чтобы получить ссылку-приглашение",
    loginBtn: "Войти",
    loading: "Загрузка…",
  };
  const c_es: typeof en = {
    eyebrow: "Invita a tus amigos",
    title: "Un mes gratis por cada amigo que se una",
    sub: "Comparte tu enlace personal. Cuando un amigo se suscriba a Gadit con él, recibes un mes gratis.",
    yourLink: "Tu enlace de invitación",
    copy: "Copiar",
    copied: "Copiado ✓",
    share: "Compartir",
    invited: "Invitados",
    joined: "Suscritos",
    months: "Meses gratis ganados",
    note: "Los meses ganados se acreditan en tu cuenta. Te avisaremos cuando se apliquen.",
    loginTitle: "Inicia sesión para obtener tu enlace de invitación",
    loginBtn: "Iniciar sesión",
    loading: "Cargando…",
  };
  const c_pt: typeof en = {
    eyebrow: "Convide amigos",
    title: "Um mês grátis para cada amigo que entrar",
    sub: "Compartilhe seu link pessoal. Quando um amigo assinar o Gadit por ele, você ganha um mês grátis.",
    yourLink: "Seu link de convite",
    copy: "Copiar",
    copied: "Copiado ✓",
    share: "Compartilhar",
    invited: "Convidados",
    joined: "Assinantes",
    months: "Meses grátis ganhos",
    note: "Os meses ganhos são creditados na sua conta. Avisaremos quando forem aplicados.",
    loginTitle: "Entre para receber seu link de convite",
    loginBtn: "Entrar",
    loading: "Carregando…",
  };
  const c_fr: typeof en = {
    eyebrow: "Invitez vos amis",
    title: "Un mois offert pour chaque ami qui nous rejoint",
    sub: "Partagez votre lien personnel. Quand un ami s'abonne à Gadit grâce à lui, vous recevez un mois offert.",
    yourLink: "Votre lien d'invitation",
    copy: "Copier",
    copied: "Copié ✓",
    share: "Partager",
    invited: "Invités",
    joined: "Abonnés",
    months: "Mois offerts gagnés",
    note: "Les mois gagnés sont crédités sur votre compte. Nous vous préviendrons dès qu'ils seront appliqués.",
    loginTitle: "Connectez-vous pour obtenir votre lien d'invitation",
    loginBtn: "Se connecter",
    loading: "Chargement…",
  };
  const c_de: typeof en = {
    eyebrow: "Freunde einladen",
    title: "Ein Gratismonat für jeden Freund, der mitmacht",
    sub: "Teilen Sie Ihren persönlichen Link. Wenn ein Freund darüber Gadit abonniert, erhalten Sie einen Gratismonat.",
    yourLink: "Ihr Einladungslink",
    copy: "Kopieren",
    copied: "Kopiert ✓",
    share: "Teilen",
    invited: "Eingeladen",
    joined: "Abonniert",
    months: "Verdiente Gratismonate",
    note: "Verdiente Monate werden Ihrem Konto gutgeschrieben. Wir sagen Ihnen Bescheid, sobald sie angewendet werden.",
    loginTitle: "Melden Sie sich an, um Ihren Einladungslink zu erhalten",
    loginBtn: "Anmelden",
    loading: "Wird geladen…",
  };
  const c_cs: typeof en = {
    eyebrow: "Pozvěte přátele",
    title: "Měsíc zdarma za každého přítele, který se přidá",
    sub: "Sdílejte svůj osobní odkaz. Když si přes něj přítel předplatí Gadit, získáte měsíc zdarma.",
    yourLink: "Váš odkaz s pozvánkou",
    copy: "Kopírovat",
    copied: "Zkopírováno ✓",
    share: "Sdílet",
    invited: "Pozváno",
    joined: "Předplatili si",
    months: "Získané měsíce zdarma",
    note: "Získané měsíce připíšeme k vašemu účtu. Dáme vám vědět, až budou uplatněny.",
    loginTitle: "Přihlaste se a získejte odkaz s pozvánkou",
    loginBtn: "Přihlásit se",
    loading: "Načítání…",
  };
  const c_sk: typeof en = {
    eyebrow: "Pozvite priateľov",
    title: "Mesiac zadarmo za každého priateľa, ktorý sa pridá",
    sub: "Zdieľajte svoj osobný odkaz. Keď si cez neho priateľ predplatí Gadit, získate mesiac zadarmo.",
    yourLink: "Váš odkaz s pozvánkou",
    copy: "Kopírovať",
    copied: "Skopírované ✓",
    share: "Zdieľať",
    invited: "Pozvaní",
    joined: "Predplatili si",
    months: "Získané mesiace zadarmo",
    note: "Získané mesiace pripíšeme k vášmu účtu. Dáme vám vedieť, keď budú uplatnené.",
    loginTitle: "Prihláste sa a získajte odkaz s pozvánkou",
    loginBtn: "Prihlásiť sa",
    loading: "Načítava sa…",
  };
  const c_it: typeof en = {
    eyebrow: "Invita gli amici",
    title: "Un mese gratis per ogni amico che si unisce",
    sub: "Condividi il tuo link personale. Quando un amico si abbona a Gadit tramite il link, ricevi un mese gratis.",
    yourLink: "Il tuo link di invito",
    copy: "Copia",
    copied: "Copiato ✓",
    share: "Condividi",
    invited: "Invitati",
    joined: "Abbonati",
    months: "Mesi gratis guadagnati",
    note: "I mesi guadagnati vengono accreditati sul tuo account. Ti avviseremo quando saranno applicati.",
    loginTitle: "Accedi per ottenere il tuo link di invito",
    loginBtn: "Accedi",
    loading: "Caricamento…",
  };
  const c_ja: typeof en = {
    eyebrow: "友だちを招待",
    title: "友だちが1人参加するごとに1か月無料",
    sub: "あなた専用のリンクをシェアしてください。友だちがそのリンクからGaditを購読すると、1か月無料になります。",
    yourLink: "あなたの招待リンク",
    copy: "コピー",
    copied: "コピーしました ✓",
    share: "シェア",
    invited: "招待した人数",
    joined: "購読した人数",
    months: "獲得した無料月数",
    note: "獲得した月数はアカウントに付与されます。適用されたらお知らせします。",
    loginTitle: "ログインして招待リンクを受け取る",
    loginBtn: "ログイン",
    loading: "読み込み中…",
  };
  const c_hi: typeof en = {
    eyebrow: "दोस्तों को आमंत्रित करें",
    title: "जुड़ने वाले हर दोस्त पर एक महीना मुफ़्त",
    sub: "अपना निजी लिंक शेयर करें। जब कोई दोस्त इसके ज़रिए Gadit की सदस्यता लेता है, तो आपको एक महीना मुफ़्त मिलता है।",
    yourLink: "आपका आमंत्रण लिंक",
    copy: "कॉपी करें",
    copied: "कॉपी हो गया ✓",
    share: "शेयर करें",
    invited: "आमंत्रित",
    joined: "सदस्यता ली",
    months: "कमाए गए मुफ़्त महीने",
    note: "कमाए गए महीने आपके खाते में जोड़ दिए जाते हैं। लागू होने पर हम आपको बताएंगे।",
    loginTitle: "अपना आमंत्रण लिंक पाने के लिए साइन इन करें",
    loginBtn: "साइन इन करें",
    loading: "लोड हो रहा है…",
  };
  const c_am: typeof en = {
    eyebrow: "ጓደኞችን ይጋብዙ",
    title: "ለሚቀላቀል እያንዳንዱ ጓደኛ አንድ ወር ነጻ",
    sub: "የግል ሊንክዎን ያጋሩ። ጓደኛ በእሱ በኩል ለGadit ሲመዘገብ አንድ ወር ነጻ ያገኛሉ።",
    yourLink: "የግብዣ ሊንክዎ",
    copy: "ቅዳ",
    copied: "ተቀድቷል ✓",
    share: "አጋራ",
    invited: "የተጋበዙ",
    joined: "የተመዘገቡ",
    months: "ያገኟቸው ነጻ ወራት",
    note: "ያገኟቸው ወራት ወደ መለያዎ ይታከላሉ። ሲተገበሩ እናሳውቅዎታለን።",
    loginTitle: "የግብዣ ሊንክዎን ለማግኘት ይግቡ",
    loginBtn: "ግባ",
    loading: "በመጫን ላይ…",
  };
  const c_uk: typeof en = {
    eyebrow: "Запросіть друзів",
    title: "Безкоштовний місяць за кожного друга, який приєднається",
    sub: "Поділіться особистим посиланням. Коли друг оформить підписку на Gadit за ним, ви отримаєте безкоштовний місяць.",
    yourLink: "Ваше посилання-запрошення",
    copy: "Копіювати",
    copied: "Скопійовано ✓",
    share: "Поділитися",
    invited: "Запрошено",
    joined: "Оформили підписку",
    months: "Отримано безкоштовних місяців",
    note: "Отримані місяці зараховуються на ваш акаунт. Ми повідомимо, коли їх буде застосовано.",
    loginTitle: "Увійдіть, щоб отримати посилання-запрошення",
    loginBtn: "Увійти",
    loading: "Завантаження…",
  };
  const c_tr: typeof en = {
    eyebrow: "Arkadaşlarını davet et",
    title: "Katılan her arkadaş için bir ay ücretsiz",
    sub: "Kişisel bağlantını paylaş. Bir arkadaşın bu bağlantıyla Gadit'e abone olduğunda bir ay ücretsiz kazanırsın.",
    yourLink: "Davet bağlantın",
    copy: "Kopyala",
    copied: "Kopyalandı ✓",
    share: "Paylaş",
    invited: "Davet edilen",
    joined: "Abone olan",
    months: "Kazanılan ücretsiz ay",
    note: "Kazandığın aylar hesabına eklenir. Uygulandığında sana haber vereceğiz.",
    loginTitle: "Davet bağlantını almak için giriş yap",
    loginBtn: "Giriş yap",
    loading: "Yükleniyor…",
  };
  const c_pl: typeof en = {
    eyebrow: "Zaproś znajomych",
    title: "Darmowy miesiąc za każdego znajomego, który dołączy",
    sub: "Udostępnij swój osobisty link. Gdy znajomy wykupi przez niego subskrypcję Gadit, otrzymasz darmowy miesiąc.",
    yourLink: "Twój link z zaproszeniem",
    copy: "Kopiuj",
    copied: "Skopiowano ✓",
    share: "Udostępnij",
    invited: "Zaproszeni",
    joined: "Subskrybenci",
    months: "Zdobyte darmowe miesiące",
    note: "Zdobyte miesiące są dopisywane do Twojego konta. Damy znać, gdy zostaną naliczone.",
    loginTitle: "Zaloguj się, aby otrzymać link z zaproszeniem",
    loginBtn: "Zaloguj się",
    loading: "Ładowanie…",
  };
  const c_fa: typeof en = {
    eyebrow: "دعوت از دوستان",
    title: "یک ماه رایگان برای هر دوستی که بپیوندد",
    sub: "لینک شخصی‌ات را به اشتراک بگذار. وقتی دوستی از طریق آن مشترک Gadit شود، یک ماه رایگان می‌گیری.",
    yourLink: "لینک دعوت تو",
    copy: "کپی",
    copied: "کپی شد ✓",
    share: "اشتراک‌گذاری",
    invited: "دعوت‌شده",
    joined: "مشترک‌شده",
    months: "ماه‌های رایگان به‌دست‌آمده",
    note: "ماه‌های به‌دست‌آمده به حسابت اضافه می‌شوند. وقتی اعمال شدند خبرت می‌کنیم.",
    loginTitle: "برای گرفتن لینک دعوت وارد شو",
    loginBtn: "ورود",
    loading: "در حال بارگذاری…",
  };
  const c_id: typeof en = {
    eyebrow: "Undang teman",
    title: "Gratis satu bulan untuk setiap teman yang bergabung",
    sub: "Bagikan tautan pribadimu. Saat teman berlangganan Gadit lewat tautan itu, kamu mendapat satu bulan gratis.",
    yourLink: "Tautan undanganmu",
    copy: "Salin",
    copied: "Tersalin ✓",
    share: "Bagikan",
    invited: "Diundang",
    joined: "Berlangganan",
    months: "Bulan gratis yang didapat",
    note: "Bulan yang didapat akan ditambahkan ke akunmu. Kami akan memberi tahu saat sudah diterapkan.",
    loginTitle: "Masuk untuk mendapatkan tautan undanganmu",
    loginBtn: "Masuk",
    loading: "Memuat…",
  };
  const c_nl: typeof en = {
    eyebrow: "Nodig vrienden uit",
    title: "Een gratis maand voor elke vriend die meedoet",
    sub: "Deel je persoonlijke link. Als een vriend via die link een abonnement op Gadit neemt, krijg jij een gratis maand.",
    yourLink: "Je uitnodigingslink",
    copy: "Kopiëren",
    copied: "Gekopieerd ✓",
    share: "Delen",
    invited: "Uitgenodigd",
    joined: "Geabonneerd",
    months: "Verdiende gratis maanden",
    note: "Verdiende maanden worden op je account bijgeschreven. We laten het je weten zodra ze zijn verwerkt.",
    loginTitle: "Log in om je uitnodigingslink te krijgen",
    loginBtn: "Inloggen",
    loading: "Laden…",
  };
  const c_el: typeof en = {
    eyebrow: "Προσκαλέστε φίλους",
    title: "Ένας δωρεάν μήνας για κάθε φίλο που εγγράφεται",
    sub: "Μοιραστείτε τον προσωπικό σας σύνδεσμο. Όταν ένας φίλος γίνει συνδρομητής στο Gadit μέσω αυτού, κερδίζετε έναν δωρεάν μήνα.",
    yourLink: "Ο σύνδεσμος πρόσκλησής σας",
    copy: "Αντιγραφή",
    copied: "Αντιγράφηκε ✓",
    share: "Κοινοποίηση",
    invited: "Προσκλήθηκαν",
    joined: "Έγιναν συνδρομητές",
    months: "Δωρεάν μήνες που κερδίσατε",
    note: "Οι μήνες που κερδίζετε πιστώνονται στον λογαριασμό σας. Θα σας ενημερώσουμε όταν εφαρμοστούν.",
    loginTitle: "Συνδεθείτε για να πάρετε τον σύνδεσμο πρόσκλησης",
    loginBtn: "Σύνδεση",
    loading: "Φόρτωση…",
  };
  const c_zu: typeof en = {
    eyebrow: "Mema abangani",
    title: "Inyanga yamahhala ngomngane ngamunye ojoyinayo",
    sub: "Yabelana ngesixhumanisi sakho somuntu siqu. Uma umngane ebhalisela i-Gadit ngaso, uthola inyanga yamahhala.",
    yourLink: "Isixhumanisi sakho sesimemo",
    copy: "Kopisha",
    copied: "Kukopishiwe ✓",
    share: "Yabelana",
    invited: "Abamenyiwe",
    joined: "Ababhalisile",
    months: "Izinyanga zamahhala ozitholile",
    note: "Izinyanga ozitholile zifakwa ku-akhawunti yakho. Sizokwazisa uma sezisebenza.",
    loginTitle: "Ngena ukuze uthole isixhumanisi sakho sesimemo",
    loginBtn: "Ngena",
    loading: "Iyalayisha…",
  };
  const c_vi: typeof en = {
    eyebrow: "Mời bạn bè",
    title: "Một tháng miễn phí cho mỗi người bạn tham gia",
    sub: "Chia sẻ đường liên kết riêng của bạn. Khi một người bạn đăng ký Gadit qua liên kết đó, bạn nhận được một tháng miễn phí.",
    yourLink: "Liên kết mời của bạn",
    copy: "Sao chép",
    copied: "Đã sao chép ✓",
    share: "Chia sẻ",
    invited: "Đã mời",
    joined: "Đã đăng ký",
    months: "Số tháng miễn phí đã nhận",
    note: "Số tháng đã nhận sẽ được cộng vào tài khoản của bạn. Chúng tôi sẽ báo khi được áp dụng.",
    loginTitle: "Đăng nhập để nhận liên kết mời",
    loginBtn: "Đăng nhập",
    loading: "Đang tải…",
  };
  const c_fil: typeof en = {
    eyebrow: "Mag-imbita ng mga kaibigan",
    title: "Isang libreng buwan sa bawat kaibigang sumali",
    sub: "Ibahagi ang iyong personal na link. Kapag nag-subscribe sa Gadit ang isang kaibigan gamit ito, makakakuha ka ng isang libreng buwan.",
    yourLink: "Ang iyong invite link",
    copy: "Kopyahin",
    copied: "Nakopya ✓",
    share: "Ibahagi",
    invited: "Inimbitahan",
    joined: "Nag-subscribe",
    months: "Mga libreng buwang nakuha",
    note: "Idinadagdag sa iyong account ang mga buwang nakuha. Sasabihan ka namin kapag nailapat na ang mga ito.",
    loginTitle: "Mag-sign in para makuha ang iyong invite link",
    loginBtn: "Mag-sign in",
    loading: "Naglo-load…",
  };
  const c_af: typeof en = {
    eyebrow: "Nooi vriende",
    title: "'n Gratis maand vir elke vriend wat aansluit",
    sub: "Deel jou persoonlike skakel. Wanneer 'n vriend daardeur op Gadit inteken, kry jy 'n gratis maand.",
    yourLink: "Jou uitnodigingskakel",
    copy: "Kopieer",
    copied: "Gekopieer ✓",
    share: "Deel",
    invited: "Genooi",
    joined: "Ingeteken",
    months: "Gratis maande verdien",
    note: "Verdiende maande word by jou rekening gevoeg. Ons laat weet jou wanneer dit toegepas is.",
    loginTitle: "Meld aan om jou uitnodigingskakel te kry",
    loginBtn: "Meld aan",
    loading: "Laai tans…",
  };
  const c_sw: typeof en = {
    eyebrow: "Alika marafiki",
    title: "Mwezi mmoja bure kwa kila rafiki anayejiunga",
    sub: "Shiriki kiungo chako binafsi. Rafiki akijisajili kwa Gadit kupitia kiungo hicho, unapata mwezi mmoja bure.",
    yourLink: "Kiungo chako cha mwaliko",
    copy: "Nakili",
    copied: "Imenakiliwa ✓",
    share: "Shiriki",
    invited: "Walioalikwa",
    joined: "Waliojisajili",
    months: "Miezi ya bure uliyopata",
    note: "Miezi uliyopata huongezwa kwenye akaunti yako. Tutakujulisha itakapotumika.",
    loginTitle: "Ingia ili upate kiungo chako cha mwaliko",
    loginBtn: "Ingia",
    loading: "Inapakia…",
  };
  const c_zh_CN: typeof en = {
    eyebrow: "邀请好友",
    title: "每邀请一位好友加入，就送一个月免费",
    sub: "分享你的专属链接。好友通过它订阅 Gadit 后，你就能获得一个月免费。",
    yourLink: "你的邀请链接",
    copy: "复制",
    copied: "已复制 ✓",
    share: "分享",
    invited: "已邀请",
    joined: "已订阅",
    months: "已获得的免费月数",
    note: "获得的月数会计入你的账户。生效时我们会通知你。",
    loginTitle: "登录以获取你的邀请链接",
    loginBtn: "登录",
    loading: "加载中…",
  };
  const c_zh_TW: typeof en = {
    eyebrow: "邀請好友",
    title: "每邀請一位好友加入，就送一個月免費",
    sub: "分享你的專屬連結。好友透過它訂閱 Gadit 後，你就能獲得一個月免費。",
    yourLink: "你的邀請連結",
    copy: "複製",
    copied: "已複製 ✓",
    share: "分享",
    invited: "已邀請",
    joined: "已訂閱",
    months: "已獲得的免費月數",
    note: "獲得的月數會計入你的帳戶。生效時我們會通知你。",
    loginTitle: "登入以取得你的邀請連結",
    loginBtn: "登入",
    loading: "載入中…",
  };
  const c_ko: typeof en = {
    eyebrow: "친구 초대하기",
    title: "친구가 가입할 때마다 한 달 무료",
    sub: "나만의 링크를 공유하세요. 친구가 이 링크로 Gadit을 구독하면 한 달 무료 혜택을 받아요.",
    yourLink: "내 초대 링크",
    copy: "복사",
    copied: "복사됨 ✓",
    share: "공유",
    invited: "초대한 친구",
    joined: "구독한 친구",
    months: "받은 무료 개월 수",
    note: "받은 개월 수는 계정에 적립돼요. 적용되면 알려드릴게요.",
    loginTitle: "로그인하고 초대 링크 받기",
    loginBtn: "로그인",
    loading: "불러오는 중…",
  };
  const c_th: typeof en = {
    eyebrow: "ชวนเพื่อน",
    title: "รับฟรี 1 เดือนต่อเพื่อนทุกคนที่เข้าร่วม",
    sub: "แชร์ลิงก์ส่วนตัวของคุณ เมื่อเพื่อนสมัครสมาชิก Gadit ผ่านลิงก์นี้ คุณจะได้รับฟรี 1 เดือน",
    yourLink: "ลิงก์เชิญของคุณ",
    copy: "คัดลอก",
    copied: "คัดลอกแล้ว ✓",
    share: "แชร์",
    invited: "เชิญแล้ว",
    joined: "สมัครสมาชิกแล้ว",
    months: "จำนวนเดือนฟรีที่ได้รับ",
    note: "เดือนที่ได้รับจะถูกเพิ่มเข้าบัญชีของคุณ เราจะแจ้งให้ทราบเมื่อมีผล",
    loginTitle: "เข้าสู่ระบบเพื่อรับลิงก์เชิญ",
    loginBtn: "เข้าสู่ระบบ",
    loading: "กำลังโหลด…",
  };
  const c_bn: typeof en = {
    eyebrow: "বন্ধুদের আমন্ত্রণ জানান",
    title: "যোগ দেওয়া প্রতিটি বন্ধুর জন্য এক মাস ফ্রি",
    sub: "আপনার ব্যক্তিগত লিংক শেয়ার করুন। কোনো বন্ধু এর মাধ্যমে Gadit-এ সাবস্ক্রাইব করলে আপনি এক মাস ফ্রি পাবেন।",
    yourLink: "আপনার আমন্ত্রণ লিংক",
    copy: "কপি",
    copied: "কপি হয়েছে ✓",
    share: "শেয়ার",
    invited: "আমন্ত্রিত",
    joined: "সাবস্ক্রাইব করেছেন",
    months: "অর্জিত ফ্রি মাস",
    note: "অর্জিত মাসগুলো আপনার অ্যাকাউন্টে যোগ করা হয়। কার্যকর হলে আমরা আপনাকে জানাব।",
    loginTitle: "আমন্ত্রণ লিংক পেতে সাইন ইন করুন",
    loginBtn: "সাইন ইন",
    loading: "লোড হচ্ছে…",
  };
  const c_da: typeof en = {
    eyebrow: "Inviter venner",
    title: "En gratis måned for hver ven, der kommer med",
    sub: "Del dit personlige link. Når en ven abonnerer på Gadit via linket, får du en gratis måned.",
    yourLink: "Dit invitationslink",
    copy: "Kopiér",
    copied: "Kopieret ✓",
    share: "Del",
    invited: "Inviteret",
    joined: "Abonnerer",
    months: "Optjente gratis måneder",
    note: "Optjente måneder krediteres din konto. Vi giver dig besked, når de er trådt i kraft.",
    loginTitle: "Log ind for at få dit invitationslink",
    loginBtn: "Log ind",
    loading: "Indlæser…",
  };
  const c_hu: typeof en = {
    eyebrow: "Hívd meg a barátaidat",
    title: "Egy ingyenes hónap minden csatlakozó barátért",
    sub: "Oszd meg a személyes linkedet. Ha egy barátod ezen keresztül fizet elő a Gaditra, kapsz egy ingyenes hónapot.",
    yourLink: "A meghívó linked",
    copy: "Másolás",
    copied: "Kimásolva ✓",
    share: "Megosztás",
    invited: "Meghívva",
    joined: "Előfizetett",
    months: "Szerzett ingyenes hónapok",
    note: "A megszerzett hónapokat jóváírjuk a fiókodban. Szólunk, amikor érvényesítettük őket.",
    loginTitle: "Jelentkezz be a meghívó linkedért",
    loginBtn: "Bejelentkezés",
    loading: "Betöltés…",
  };
  const all: Record<Lang, typeof en> = {
    en,
    he,
    ar: c_ar,
    ru: c_ru,
    es: c_es,
    pt: c_pt,
    fr: c_fr,
    de: c_de,
    cs: c_cs,
    sk: c_sk,
    it: c_it,
    ja: c_ja,
    hi: c_hi,
    am: c_am,
    uk: c_uk,
    tr: c_tr,
    pl: c_pl,
    fa: c_fa,
    id: c_id,
    nl: c_nl,
    el: c_el,
    zu: c_zu,
    vi: c_vi,
    fil: c_fil,
    af: c_af,
    sw: c_sw,
    "zh-CN": c_zh_CN,
    "zh-TW": c_zh_TW,
    ko: c_ko,
    th: c_th,
    bn: c_bn,
    da: c_da,
    hu: c_hu,
  };
  return all[lang] ?? en;
}

export function ReferClient() {
  const { user, loading: authLoading, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const t = copy(lang);

  const [data, setData] = useState<ReferData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/referral", { headers: { Authorization: `Bearer ${idToken}` } });
        if (res.ok && !cancelled) setData(await res.json());
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [user]);

  async function onCopy() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* ignore */ }
  }

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <div className="wb-shell-actions">
          {user ? <WbUserMenu /> : null}
        </div>
      </header>

      <main style={{ maxWidth: 620, margin: "0 auto", padding: "48px 22px 96px", fontFamily: fontBody(lang) }}>
        <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--teal-deep, #0E7490)" }}>
          {t.eyebrow}
        </p>
        <h1 style={{ margin: "0 0 12px", fontSize: "clamp(28px,5vw,40px)", fontWeight: 800, lineHeight: 1.15, color: "var(--ink, #20272E)" }}>
          {t.title}
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 17, lineHeight: 1.55, color: "var(--ink-muted, #6B7280)", maxWidth: "52ch" }}>
          {t.sub}
        </p>

        {authLoading ? (
          <div style={{ color: "var(--ink-muted, #6B7280)" }}>{t.loading}</div>
        ) : !user ? (
          <div style={{ background: "var(--card, #fff)", border: "1px solid var(--hairline, #E5E7EB)", borderRadius: 16, padding: 24 }}>
            <p style={{ margin: "0 0 16px", fontSize: 16, color: "var(--ink, #20272E)" }}>{t.loginTitle}</p>
            <button
              type="button"
              onClick={() => promptLogin?.()}
              style={{ background: "var(--teal, #0EA5A5)", color: "#fff", border: "none", borderRadius: 12, padding: "11px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              {t.loginBtn}
            </button>
          </div>
        ) : (
          <>
            {/* Invite link + actions */}
            <div style={{ background: "var(--card, #fff)", border: "1px solid var(--hairline, #E5E7EB)", borderRadius: 16, padding: 20, marginBottom: 22 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-muted, #9CA3AF)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                {t.yourLink}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div dir="ltr" style={{ flex: "1 1 260px", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "ui-monospace, monospace", fontSize: 15, background: "var(--paper, #F9FAFB)", border: "1px solid var(--hairline, #E5E7EB)", borderRadius: 10, padding: "11px 14px", color: "var(--ink, #20272E)" }}>
                  {data ? data.link : "…"}
                </div>
                <button
                  type="button"
                  onClick={onCopy}
                  disabled={!data}
                  style={{ background: "var(--teal, #0EA5A5)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 14, fontWeight: 700, cursor: data ? "pointer" : "default", fontFamily: "inherit", flex: "none" }}
                >
                  {copied ? t.copied : t.copy}
                </button>
                {data && (
                  <ShareButton url={data.link} title="Gadit" text={t.sub} shareLabel={t.share} copiedLabel={t.copied} />
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <Stat label={t.invited} value={data?.invited ?? 0} />
              <Stat label={t.joined} value={data?.joinedPaid ?? 0} />
              <Stat label={t.months} value={data?.rewardsOwed ?? 0} strong />
            </div>

            <p style={{ marginTop: 18, fontSize: 13, color: "var(--ink-muted, #9CA3AF)", lineHeight: 1.5 }}>
              {t.note}
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div style={{ background: "var(--card, #fff)", border: "1px solid var(--hairline, #E5E7EB)", borderRadius: 14, padding: "16px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: strong ? "var(--teal, #0EA5A5)" : "var(--ink, #20272E)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--ink-muted, #6B7280)", marginTop: 6 }}>{label}</div>
    </div>
  );
}

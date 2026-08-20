import "server-only";
import { Resend } from "resend";
import { getAdminDb } from "./firebase-admin";
import { Partner } from "./partners";

/**
 * Partner-facing "opening" (welcome) email — a full 14-field template
 * modelled on the one Gadi runs on Yooniz, adapted to Gadit's product
 * (a multilingual child-safe dictionary, not a screen-time app) and to
 * Gadit's multi-currency reality. Server-only (Resend + firebase-admin),
 * so it lives apart from lib/partners.ts (safe for client imports).
 *
 * Editable from /admin/partners, stored per language in Firestore at
 * partnerConfig/welcomeEmail. The functional blocks — referral link,
 * code, dashboard button — are always injected and can't be removed, so
 * a bad edit can never produce a useless email.
 *
 * Tokens in the text fields: {name} {pctY1} {pctAfter} {year1} {code} {link}
 *  - {pctY1} / {pctAfter} come from the partner's own rates.
 *  - {year1} comes from the editable `year1Est` field (per language), so
 *    Gadi sets the currency-appropriate figure himself (₪ / $).
 */

const SITE = "https://www.gadit.app";

export type WelcomeLangConfig = {
  subject: string;
  greeting: string;
  opening: string;
  noteUnderLink: string;
  commissionLine: string;
  commissionExplain: string;
  year1Est: string;            // fills the {year1} token, per-language / per-currency
  dashboardNote: string;
  tipsHeader: string;
  tip1: string;
  tip2: string;
  tip3: string;
  closing: string;
  signatureName: string;
  signatureRole: string;
};
export type WelcomeConfig = Record<string, WelcomeLangConfig>;

export const WELCOME_FIELDS: (keyof WelcomeLangConfig)[] = [
  "subject", "greeting", "opening", "noteUnderLink", "commissionLine",
  "commissionExplain", "year1Est", "dashboardNote", "tipsHeader",
  "tip1", "tip2", "tip3", "closing", "signatureName", "signatureRole",
];

export const DEFAULT_WELCOME_CONFIG: WelcomeConfig = {
  he: {
    subject: "הצטרפת לתוכנית השותפים של Gadit. הנה הקישור שלך 🤝",
    greeting: "טוב שהצטרפת לתוכנית השותפים של Gadit 🤝",
    opening: "הנה כל מה שצריך כדי להתחיל. Gadit הוא מילון חכם ובטוח לילדים ב-22 שפות, עם דוגמאות, תמונות ומחברת אישית שעוזרת לילד באמת להבין מילים.",
    noteUnderLink: "כל מי שנרשם ומשלם דרכו נזקף אליך אוטומטית. הקישור לא חושף את השם שלך.",
    commissionLine: "העמלה שלך: {pctY1}% מכל תשלום בשנה הראשונה, {pctAfter}% אחריה לכל זמן שהמשפחה נשארת.",
    commissionExplain: "לדוגמה: משפחה אחת שנרשמת למנוי המשפחתי ונשארת שנה שווה לך מעל {year1}. וכל עוד המשפחה נשארת מנויה, אנחנו ב-Gadit ממשיכים לשלם לך עמלה על המנוי שלה, חודש אחרי חודש. זו לא עמלה חד-פעמית, זו הכנסה שממשיכה.",
    year1Est: "₪240",
    dashboardNote: "אפשר לראות שם קליקים, הרשמות ורווחים בזמן אמת. בלי צורך להתחבר, הלוח פרטי לך בלבד.",
    tipsHeader: "3 דברים שעוזרים להפיץ",
    tip1: "לספר על זה איפה שההורים מקשיבים לך. קבוצת וואטסאפ, פוסט, שיחה אישית.",
    tip2: "הכאב שכל הורה מכיר: ילד שנתקל במילה שהוא לא מבין ומוותר. Gadit נותן לו להבין לבד, בשפה שלו.",
    tip3: "אפשר להתחיל בחינם, אז קל להמליץ בלי מחסום.",
    closing: "כל שאלה, אפשר פשוט להשיב למייל הזה. הצוות ואני כאן.",
    signatureName: "גדי בן לביא",
    signatureRole: "מייסד Gadit",
  },
  en: {
    subject: "You're in. Here's your Gadit partner link 🤝",
    greeting: "Great to have you in the Gadit Partner Program 🤝",
    opening: "Here's everything you need to start. Gadit is a smart, child-safe dictionary in 22 languages, with examples, pictures and a personal notebook that helps a child truly understand words.",
    noteUnderLink: "Everyone who signs up and pays through it is credited to you automatically. The link never shows your name.",
    commissionLine: "Your commission: {pctY1}% of every payment in year one, {pctAfter}% after that for as long as the family stays.",
    commissionExplain: "For example, one family that joins the Family plan and stays a year is worth over {year1} to you. And for as long as that family stays subscribed, we at Gadit keep paying you a commission on their subscription, month after month. Not a one-time payout, income that continues.",
    year1Est: "$60",
    dashboardNote: "You can see clicks, signups and earnings there in real time. No login needed, the dashboard is private to you.",
    tipsHeader: "3 things that help you spread the word",
    tip1: "Mention it where parents already listen to you. A WhatsApp group, a post, a personal chat.",
    tip2: "The pain every parent knows: a child hits a word they don't understand and gives up. Gadit lets them understand on their own, in their language.",
    tip3: "There's a free way to start, so it's easy to recommend with no barrier.",
    closing: "Any question, just reply to this email. The team and I are here.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "Founder, Gadit",
  },
  nl: {
    subject: "Je bent erbij. Hier is je Gadit-partnerlink 🤝",
    greeting: "Fijn dat je meedoet aan het Gadit Partnerprogramma 🤝",
    opening: "Hier is alles wat je nodig hebt om te beginnen. Gadit is een slim, kindveilig woordenboek in 22 talen, met voorbeelden, plaatjes en een persoonlijk notitieboek dat een kind helpt woorden echt te begrijpen.",
    noteUnderLink: "Iedereen die zich via de link aanmeldt en betaalt, wordt automatisch aan jou toegeschreven. De link toont nooit je naam.",
    commissionLine: "Jouw commissie: {pctY1}% van elke betaling in het eerste jaar, daarna {pctAfter}% zolang het gezin blijft.",
    commissionExplain: "Een gezin dat bijvoorbeeld op het Family-abonnement instapt en een jaar blijft, is meer dan {year1} voor je waard. En zolang dat gezin geabonneerd blijft, blijven wij bij Gadit je commissie over hun abonnement betalen, maand na maand. Geen eenmalige uitbetaling, maar inkomen dat doorloopt.",
    year1Est: "$60",
    dashboardNote: "Daar zie je in realtime je kliks, aanmeldingen en verdiensten. Geen login nodig, het dashboard is alleen voor jou.",
    tipsHeader: "3 dingen die je helpen het woord te verspreiden",
    tip1: "Noem het waar ouders al naar je luisteren. Een WhatsApp-groep, een bericht, een persoonlijk gesprek.",
    tip2: "De pijn die elke ouder kent: een kind komt een woord tegen dat het niet begrijpt en geeft op. Met Gadit begrijpen ze het zelf, in hun eigen taal.",
    tip3: "Er is een gratis manier om te beginnen, dus je kunt het zonder drempel aanraden.",
    closing: "Bij elke vraag: reageer gewoon op deze e-mail. Het team en ik staan voor je klaar.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "Oprichter, Gadit",
  },
  ar: {
    subject: "تم قبولك. هذا هو رابط شريك Gadit الخاص بك 🤝",
    greeting: "يسعدنا انضمامك إلى برنامج شركاء Gadit 🤝",
    opening: "هذا كل ما تحتاجه للبدء. Gadit قاموس ذكي وآمن للأطفال بـ22 لغة، مع أمثلة وصور ودفتر شخصي يساعد الطفل على فهم الكلمات فهماً حقيقياً.",
    noteUnderLink: "كل من يسجّل ويدفع من خلاله يُحتسب لك تلقائياً. الرابط لا يُظهر اسمك أبداً.",
    commissionLine: "عمولتك: {pctY1}% من كل دفعة في السنة الأولى، و{pctAfter}% بعد ذلك طوال بقاء العائلة معنا.",
    commissionExplain: "على سبيل المثال، عائلة واحدة تنضم إلى خطة العائلة وتبقى سنة كاملة تساوي لك أكثر من {year1}. وطالما بقيت تلك العائلة مشتركة، نستمر نحن في Gadit بدفع عمولتك على اشتراكها شهراً بعد شهر. ليست دفعة لمرة واحدة، بل دخل يستمر.",
    year1Est: "60 دولاراً",
    dashboardNote: "يمكنك متابعة النقرات والتسجيلات والأرباح هناك في الوقت الفعلي. لا حاجة لتسجيل الدخول، فلوحة التحكم خاصة بك وحدك.",
    tipsHeader: "3 أمور تساعدك على نشر الخبر",
    tip1: "اذكره حيث يستمع إليك الآباء بالفعل. مجموعة واتساب، منشور، أو محادثة شخصية.",
    tip2: "الألم الذي يعرفه كل والد: الطفل يصادف كلمة لا يفهمها فيستسلم. Gadit يتيح له أن يفهم بنفسه، وبلغته.",
    tip3: "هناك طريقة مجانية للبدء، لذا يسهل التوصية به دون أي حاجز.",
    closing: "لأي سؤال، فقط ردّ على هذه الرسالة. أنا والفريق هنا من أجلك.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "المؤسّس، Gadit",
  },
  ru: {
    subject: "Вы в деле. Вот ваша партнёрская ссылка Gadit 🤝",
    greeting: "Рады видеть вас в Партнёрской программе Gadit 🤝",
    opening: "Здесь всё, что нужно для старта. Gadit это умный, безопасный для детей словарь на 22 языках, с примерами, картинками и личной тетрадью, которая помогает ребёнку по-настоящему понять слова.",
    noteUnderLink: "Каждый, кто регистрируется и оплачивает по ней, автоматически засчитывается вам. Ссылка никогда не показывает ваше имя.",
    commissionLine: "Ваша комиссия: {pctY1}% с каждого платежа в первый год и {pctAfter}% после этого всё время, пока семья остаётся с нами.",
    commissionExplain: "Например, одна семья, которая подключает план Family и остаётся на год, приносит вам больше {year1}. И пока эта семья сохраняет подписку, мы в Gadit продолжаем платить вам комиссию с её подписки, месяц за месяцем. Это не разовая выплата, а доход, который продолжается.",
    year1Est: "$60",
    dashboardNote: "Там вы в реальном времени видите клики, регистрации и заработок. Вход не нужен, панель доступна только вам.",
    tipsHeader: "3 вещи, которые помогут рассказать о Gadit",
    tip1: "Упомяните там, где родители уже вас слушают. В группе WhatsApp, в посте, в личной беседе.",
    tip2: "Боль, знакомая каждому родителю: ребёнок встречает слово, которого не понимает, и сдаётся. Gadit позволяет ему понять самому, на своём языке.",
    tip3: "Есть бесплатный способ начать, поэтому рекомендовать легко, без всякого барьера.",
    closing: "Любой вопрос просто ответьте на это письмо. Я и вся команда здесь.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "Основатель, Gadit",
  },
  es: {
    subject: "Ya estás dentro. Aquí tienes tu enlace de socio de Gadit 🤝",
    greeting: "Nos alegra tenerte en el Programa de Socios de Gadit 🤝",
    opening: "Aquí tienes todo lo que necesitas para empezar. Gadit es un diccionario inteligente y seguro para niños en 22 idiomas, con ejemplos, imágenes y un cuaderno personal que ayuda a cada niño a entender de verdad las palabras.",
    noteUnderLink: "Toda persona que se registre y pague a través de él queda acreditada a tu nombre automáticamente. El enlace nunca muestra tu nombre.",
    commissionLine: "Tu comisión: {pctY1}% de cada pago durante el primer año, y {pctAfter}% después mientras la familia siga con nosotros.",
    commissionExplain: "Por ejemplo, una familia que se une al plan Familias y se queda un año vale para ti más de {year1}. Y mientras esa familia siga suscrita, en Gadit seguimos pagándote una comisión sobre su suscripción, mes tras mes. No es un pago único, es un ingreso que continúa.",
    year1Est: "$60",
    dashboardNote: "Allí puedes ver los clics, los registros y las ganancias en tiempo real. No hace falta iniciar sesión, el panel es privado y solo para ti.",
    tipsHeader: "3 cosas que te ayudan a correr la voz",
    tip1: "Menciónalo donde los padres ya te escuchan. Un grupo de WhatsApp, una publicación, una conversación personal.",
    tip2: "El problema que todo padre conoce: un niño se topa con una palabra que no entiende y se rinde. Gadit le permite entenderla por su cuenta, en su idioma.",
    tip3: "Hay una forma gratuita de empezar, así que es fácil de recomendar sin ninguna barrera.",
    closing: "Cualquier pregunta, solo responde a este correo. El equipo y yo estamos aquí.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "Fundador, Gadit",
  },
  pt: {
    subject: "Você entrou. Aqui está o seu link de parceiro Gadit 🤝",
    greeting: "Que bom ter você no Programa de Parceiros da Gadit 🤝",
    opening: "Aqui está tudo o que você precisa para começar. A Gadit é um dicionário inteligente e seguro para crianças em 22 idiomas, com exemplos, imagens e um caderno pessoal que ajuda a criança a entender de verdade as palavras.",
    noteUnderLink: "Todo mundo que se cadastra e paga por ele é creditado a você automaticamente. O link nunca mostra o seu nome.",
    commissionLine: "Sua comissão: {pctY1}% de cada pagamento no primeiro ano, {pctAfter}% depois disso por todo o tempo que a família continuar.",
    commissionExplain: "Por exemplo, uma família que entra no plano Família e fica um ano vale mais de {year1} para você. E por todo o tempo que essa família continuar assinando, nós da Gadit seguimos pagando a você uma comissão sobre a assinatura dela, mês após mês. Não é um pagamento único, é uma renda que continua.",
    year1Est: "$60",
    dashboardNote: "Você acompanha cliques, cadastros e ganhos ali em tempo real. Sem precisar de login, o painel é privado só seu.",
    tipsHeader: "3 coisas que ajudam você a espalhar a palavra",
    tip1: "Fale sobre isso onde os pais já ouvem você. Um grupo de WhatsApp, uma publicação, uma conversa pessoal.",
    tip2: "A dor que todo pai e toda mãe conhece: a criança esbarra numa palavra que não entende e desiste. A Gadit deixa ela entender sozinha, no idioma dela.",
    tip3: "Há uma forma gratuita de começar, então é fácil recomendar sem nenhuma barreira.",
    closing: "Qualquer dúvida, é só responder a este e-mail. Eu e a equipe estamos aqui.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "Fundador, Gadit",
  },
  fr: {
    subject: "C'est validé. Voici votre lien partenaire Gadit 🤝",
    greeting: "Ravis de vous compter dans le Programme Partenaires de Gadit 🤝",
    opening: "Voici tout ce qu'il vous faut pour commencer. Gadit est un dictionnaire intelligent et sûr pour les enfants, en 22 langues, avec des exemples, des images et un carnet personnel qui aide l'enfant à vraiment comprendre les mots.",
    noteUnderLink: "Toute personne qui s'inscrit et paie via ce lien vous est attribuée automatiquement. Le lien n'affiche jamais votre nom.",
    commissionLine: "Votre commission : {pctY1} % de chaque paiement la première année, puis {pctAfter} % ensuite, aussi longtemps que la famille reste.",
    commissionExplain: "Par exemple, une famille qui souscrit au plan Familles et reste un an vous rapporte plus de {year1}. Et tant que cette famille reste abonnée, nous, chez Gadit, continuons à vous verser une commission sur son abonnement, mois après mois. Pas un paiement unique, un revenu qui continue.",
    year1Est: "55 €",
    dashboardNote: "Vous y voyez les clics, les inscriptions et les gains en temps réel. Aucune connexion requise, le tableau de bord n'est visible que par vous.",
    tipsHeader: "3 choses qui vous aident à faire passer le mot",
    tip1: "Parlez-en là où les parents vous écoutent déjà. Un groupe WhatsApp, une publication, une conversation personnelle.",
    tip2: "La difficulté que tout parent connaît : un enfant tombe sur un mot qu'il ne comprend pas et abandonne. Gadit lui permet de comprendre par lui-même, dans sa langue.",
    tip3: "Il existe une façon gratuite de commencer, c'est donc facile à recommander, sans aucune barrière.",
    closing: "Pour toute question, répondez simplement à cet e-mail. L'équipe et moi sommes là.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "Fondateur, Gadit",
  },
  de: {
    subject: "Du bist dabei. Hier ist dein Gadit Partner-Link 🤝",
    greeting: "Schön, dass du im Gadit Partnerprogramm bist 🤝",
    opening: "Hier ist alles, was du für den Start brauchst. Gadit ist ein smartes, kindersicheres Wörterbuch in 22 Sprachen, mit Beispielen, Bildern und einem persönlichen Notizbuch, das einem Kind hilft, Wörter wirklich zu verstehen.",
    noteUnderLink: "Jeder, der sich darüber anmeldet und bezahlt, wird dir automatisch gutgeschrieben. Der Link zeigt niemals deinen Namen.",
    commissionLine: "Deine Provision: {pctY1}% von jeder Zahlung im ersten Jahr, danach {pctAfter}%, solange die Familie bleibt.",
    commissionExplain: "Ein Beispiel: Eine Familie, die den Family-Plan abschließt und ein Jahr bleibt, ist für dich über {year1} wert. Und solange diese Familie ihr Abo behält, zahlen wir von Gadit dir weiterhin eine Provision auf ihr Abo, Monat für Monat. Keine einmalige Auszahlung, sondern Einkommen, das weiterläuft.",
    year1Est: "$60",
    dashboardNote: "Dort siehst du Klicks, Anmeldungen und Einnahmen in Echtzeit. Keine Anmeldung nötig, das Dashboard ist nur für dich sichtbar.",
    tipsHeader: "3 Dinge, die dir helfen, es weiterzuempfehlen",
    tip1: "Erwähne es dort, wo Eltern dir ohnehin zuhören. In einer WhatsApp-Gruppe, einem Beitrag, einem persönlichen Gespräch.",
    tip2: "Der Schmerz, den jedes Elternteil kennt: Ein Kind stößt auf ein Wort, das es nicht versteht, und gibt auf. Mit Gadit versteht es allein, in seiner Sprache.",
    tip3: "Es gibt einen kostenlosen Einstieg, deshalb lässt es sich ohne Hürde empfehlen.",
    closing: "Bei jeder Frage antworte einfach auf diese E-Mail. Das Team und ich sind für dich da.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "Gründer, Gadit",
  },
  cs: {
    subject: "Jste v tom. Tady je váš partnerský odkaz Gadit 🤝",
    greeting: "Jsme rádi, že jste součástí Partnerského programu Gadit 🤝",
    opening: "Tady je všechno, co potřebujete k rozjezdu. Gadit je chytrý slovník bezpečný pro děti ve 22 jazycích, s příklady, obrázky a osobním sešitem, který dítěti pomáhá slovům opravdu porozumět.",
    noteUnderLink: "Každý, kdo se přes něj zaregistruje a zaplatí, se automaticky připíše vám. Odkaz nikdy neukazuje vaše jméno.",
    commissionLine: "Vaše provize: {pctY1} % z každé platby v prvním roce a {pctAfter} % poté po celou dobu, kdy rodina zůstane.",
    commissionExplain: "Například jedna rodina, která se připojí k plánu Family a zůstane rok, má pro vás hodnotu přes {year1}. A po celou dobu, kdy má tato rodina předplatné, vám my v Gaditu dál platíme provizi z jejího předplatného, měsíc po měsíci. Ne jednorázová výplata, ale příjem, který pokračuje.",
    year1Est: "$60",
    dashboardNote: "Uvidíte tam kliknutí, registrace a výdělky v reálném čase. Není potřeba se přihlašovat, přehled je soukromý jen pro vás.",
    tipsHeader: "3 věci, které vám pomohou šířit povědomí",
    tip1: "Zmiňte se tam, kde vás rodiče už poslouchají. Ve skupině na WhatsAppu, v příspěvku, v osobním rozhovoru.",
    tip2: "Bolest, kterou zná každý rodič: dítě narazí na slovo, kterému nerozumí, a vzdá to. Gadit mu umožní porozumět samostatně, v jeho jazyce.",
    tip3: "Existuje bezplatný způsob, jak začít, takže se dá snadno doporučit bez jakékoli překážky.",
    closing: "S jakýmkoli dotazem stačí odpovědět na tento e-mail. Já i tým jsme tu pro vás.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "Zakladatel, Gadit",
  },
  sk: {
    subject: "Ste súčasťou. Tu je váš partnerský odkaz Gadit 🤝",
    greeting: "Sme radi, že ste v Partnerskom programe Gadit 🤝",
    opening: "Tu je všetko, čo potrebujete na začiatok. Gadit je inteligentný slovník bezpečný pre deti v 22 jazykoch, s príkladmi, obrázkami a osobným zošitom, ktorý pomáha dieťaťu naozaj porozumieť slovám.",
    noteUnderLink: "Každý, kto sa cezeň zaregistruje a zaplatí, sa automaticky pripíše vám. Odkaz nikdy nezobrazuje vaše meno.",
    commissionLine: "Vaša provízia: {pctY1}% z každej platby v prvom roku a {pctAfter}% potom, kým rodina zostáva.",
    commissionExplain: "Napríklad jedna rodina, ktorá si predplatí plán Families a zostane rok, má pre vás hodnotu viac ako {year1}. A kým táto rodina zostáva predplatená, my v Gadit vám naďalej vyplácame províziu z jej predplatného, mesiac čo mesiac. Nie jednorazová výplata, ale príjem, ktorý pokračuje.",
    year1Est: "$60",
    dashboardNote: "Kliknutia, registrácie a zárobky tam vidíte v reálnom čase. Netreba sa prihlasovať, nástenka je súkromná len pre vás.",
    tipsHeader: "3 veci, ktoré vám pomôžu šíriť správu",
    tip1: "Spomeňte to tam, kde vás rodičia už počúvajú. WhatsAppová skupina, príspevok, osobný rozhovor.",
    tip2: "Bolesť, ktorú pozná každý rodič: dieťa narazí na slovo, ktorému nerozumie, a vzdá to. Gadit mu umožní porozumieť samostatne, vo vlastnom jazyku.",
    tip3: "Začať sa dá zadarmo, takže sa to dá ľahko odporučiť bez akejkoľvek prekážky.",
    closing: "S akoukoľvek otázkou stačí odpovedať na tento e-mail. Tím aj ja sme tu pre vás.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "Zakladateľ, Gadit",
  },
  it: {
    subject: "Ci sei. Ecco il tuo link partner Gadit 🤝",
    greeting: "Che bello averti nel Programma Partner di Gadit 🤝",
    opening: "Ecco tutto ciò che ti serve per iniziare. Gadit è un dizionario intelligente e sicuro per i bambini in 22 lingue, con esempi, immagini e un quaderno personale che aiuta il bambino a capire davvero le parole.",
    noteUnderLink: "Chiunque si iscriva e paghi tramite questo link viene attribuito a te in automatico. Il link non mostra mai il tuo nome.",
    commissionLine: "La tua commissione: {pctY1}% di ogni pagamento nel primo anno, {pctAfter}% in seguito per tutto il tempo in cui la famiglia resta.",
    commissionExplain: "Per esempio, una famiglia che sceglie il piano Family e resta un anno vale per te oltre {year1}. E finché quella famiglia mantiene l'abbonamento, noi di Gadit continuiamo a pagarti una commissione sul suo abbonamento, mese dopo mese. Non un pagamento una tantum, ma un reddito che continua.",
    year1Est: "$60",
    dashboardNote: "Lì puoi vedere clic, iscrizioni e guadagni in tempo reale. Non serve alcun accesso, la dashboard è privata e solo tua.",
    tipsHeader: "3 cose che ti aiutano a far girare la voce",
    tip1: "Parlane dove i genitori ti ascoltano già. Un gruppo WhatsApp, un post, una chiacchierata personale.",
    tip2: "Il problema che ogni genitore conosce: un bambino incontra una parola che non capisce e si arrende. Gadit gli permette di capirla da solo, nella sua lingua.",
    tip3: "C'è un modo gratuito per iniziare, quindi è facile da consigliare senza alcuna barriera.",
    closing: "Per qualsiasi domanda, rispondi pure a questa email. Io e il team siamo qui.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "Fondatore, Gadit",
  },
  ja: {
    subject: "ご登録が完了しました。Gadit パートナーリンクはこちらです 🤝",
    greeting: "Gadit パートナープログラムへのご参加、誠にありがとうございます 🤝",
    opening: "始めるために必要なものをすべてご用意しました。Gadit は 22 言語に対応した、子どもにも安心してお使いいただける賢い辞書です。例文や画像、そして子どもが言葉を本当に理解できるように手助けする専用ノートが備わっています。",
    noteUnderLink: "このリンクを通じて登録し、お支払いされた方は、自動的にあなたの成果として記録されます。リンクにあなたの名前が表示されることはありません。",
    commissionLine: "あなたのコミッション、初年度は毎回のお支払いの {pctY1}%、それ以降はご家族が継続される限り {pctAfter}% です。",
    commissionExplain: "たとえば、Family プランに加入して 1 年間継続されたご家族 1 組は、あなたにとって {year1} 以上の価値があります。そしてそのご家族が購読を続けてくださる限り、私たち Gadit はそのサブスクリプションに対するコミッションを毎月お支払いし続けます。一度きりの支払いではなく、継続する収入です。",
    year1Est: "$60",
    dashboardNote: "そこではクリック数、登録数、収益をリアルタイムでご確認いただけます。ログインは不要で、ダッシュボードはあなただけの非公開のものです。",
    tipsHeader: "広めるのに役立つ 3 つのこと",
    tip1: "保護者の方がすでにあなたの声に耳を傾けている場所で紹介してください。WhatsApp グループ、投稿、個人的な会話など。",
    tip2: "どの保護者もよく知っている悩み、子どもが理解できない言葉にぶつかって、あきらめてしまうことです。Gadit なら、子どもが自分の言葉で、自分自身で理解できるようになります。",
    tip3: "無料で始められる方法があるので、ハードルなく気軽におすすめいただけます。",
    closing: "ご質問があれば、このメールにご返信ください。私とチームがお手伝いいたします。",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "創業者、Gadit",
  },
  hi: {
    subject: "आप शामिल हो गए। यह रहा आपका Gadit पार्टनर link 🤝",
    greeting: "Gadit Partner Program में आपका स्वागत है 🤝",
    opening: "शुरू करने के लिए जो कुछ आपको चाहिए, वह सब यहाँ है। Gadit 22 भाषाओं में एक स्मार्ट, बच्चों के लिए सुरक्षित डिक्शनरी है, जिसमें उदाहरण, तस्वीरें और एक निजी नोटबुक है, जो बच्चे को शब्दों को सचमुच समझने में मदद करती है।",
    noteUnderLink: "जो भी इसके ज़रिए sign up करके भुगतान करता है, उसका श्रेय अपने आप आपको मिलता है। link में आपका नाम कभी नहीं दिखता।",
    commissionLine: "आपका कमीशन, पहले साल हर भुगतान का {pctY1}%, और उसके बाद {pctAfter}%, जब तक परिवार जुड़ा रहता है।",
    commissionExplain: "उदाहरण के लिए, एक परिवार जो Family plan लेता है और एक साल तक जुड़ा रहता है, वह आपके लिए {year1} से अधिक मूल्य का है। और जब तक वह परिवार सदस्यता में बना रहता है, हम Gadit में उनकी सदस्यता पर आपको महीने दर महीने कमीशन देते रहते हैं। यह एक बार का भुगतान नहीं, बल्कि ऐसी आय है जो चलती रहती है।",
    year1Est: "$60",
    dashboardNote: "वहाँ आप clicks, sign up और कमाई को real time में देख सकते हैं। किसी login की ज़रूरत नहीं, dashboard सिर्फ़ आपके लिए निजी है।",
    tipsHeader: "3 बातें जो प्रचार फैलाने में आपकी मदद करती हैं",
    tip1: "इसका ज़िक्र वहाँ करें जहाँ माता-पिता पहले से आपको सुनते हैं। कोई WhatsApp group, कोई पोस्ट, या कोई निजी बातचीत।",
    tip2: "वह तकलीफ़ जिसे हर माता-पिता जानते हैं, बच्चा किसी शब्द पर अटक जाता है जिसे वह समझ नहीं पाता और हार मान लेता है। Gadit उन्हें अपनी भाषा में, खुद से समझने देता है।",
    tip3: "शुरू करने का एक मुफ़्त तरीका है, इसलिए बिना किसी रुकावट के इसे सुझाना आसान है।",
    closing: "कोई भी सवाल हो, तो बस इस ईमेल का जवाब दें। मैं और पूरी टीम यहीं हैं।",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "संस्थापक, Gadit",
  },
  am: {
    subject: "ገብተሃል። ይኸውልህ የGadit አጋርነት ሊንክህ 🤝",
    greeting: "በGadit የአጋሮች መርሃ ግብር ውስጥ በመኖርህ ደስ ብሎናል 🤝",
    opening: "ለመጀመር የሚያስፈልግህ ሁሉ ይኸውልህ። Gadit በ22 ቋንቋዎች ብልህና ለልጆች ደህንነቱ የተጠበቀ መዝገበ ቃላት ነው, ከምሳሌዎች, ስዕሎችና ልጅ ቃላትን በእውነት እንዲረዳ ከሚያግዝ የግል ማስታወሻ ደብተር ጋር።",
    noteUnderLink: "በእሱ በኩል የሚመዘገብና የሚከፍል ሁሉ በራስ ሰር ለአንተ ይመዘገባል። ሊንኩ ስምህን በጭራሽ አያሳይም።",
    commissionLine: "ኮሚሽንህ, በመጀመሪያው ዓመት ከእያንዳንዱ ክፍያ {pctY1}%, ከዚያ በኋላ ቤተሰቡ እስከቆየ ድረስ {pctAfter}%።",
    commissionExplain: "ለምሳሌ, የFamily እቅድን የተቀላቀለና አንድ ዓመት የሚቆይ አንድ ቤተሰብ ለአንተ ከ{year1} በላይ ዋጋ አለው። እናም ያ ቤተሰብ ተመዝግቦ እስከቆየ ድረስ, እኛ በGadit በደንበኝነት ምዝገባቸው ላይ ኮሚሽን መክፈላችንን እንቀጥላለን, ወር በወር። አንድ ጊዜ የሚከፈል ሳይሆን, የሚቀጥል ገቢ ነው።",
    year1Est: "$60",
    dashboardNote: "ጠቅታዎችን, ምዝገባዎችንና ገቢዎችን እዚያ በቅጽበት ማየት ትችላለህ። መግቢያ አያስፈልግም, ዳሽቦርዱ ለአንተ ብቻ የግል ነው።",
    tipsHeader: "ቃሉን ለማሰራጨት የሚያግዙህ 3 ነገሮች",
    tip1: "ወላጆች አስቀድመው በሚያዳምጡህበት ቦታ ጥቀሰው። የWhatsApp ቡድን, ልጥፍ, የግል ጭውውት።",
    tip2: "እያንዳንዱ ወላጅ የሚያውቀው ስቃይ, ልጅ የማይረዳውን ቃል ሲያገኝ ተስፋ ይቆርጣል። Gadit በራሳቸው, በቋንቋቸው እንዲረዱ ያስችላቸዋል።",
    tip3: "ለመጀመር ነጻ መንገድ አለ, ስለዚህ ያለ ምንም እንቅፋት ለመምከር ቀላል ነው።",
    closing: "ማንኛውም ጥያቄ ካለህ, ለዚህ ኢሜይል መልስ ስጥ ብቻ። እኔና ቡድኑ እዚህ ነን።",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "መስራች, Gadit",
  },
  uk: {
    subject: "Ви в команді. Ось ваше партнерське посилання Gadit 🤝",
    greeting: "Раді бачити вас у Партнерській програмі Gadit 🤝",
    opening: "Ось усе, що потрібно для старту. Gadit це розумний, безпечний для дітей словник 22 мовами, з прикладами, зображеннями та особистим зошитом, який допомагає дитині по-справжньому зрозуміти слова.",
    noteUnderLink: "Кожен, хто реєструється й оплачує через нього, автоматично зараховується вам. Посилання ніколи не показує ваше ім'я.",
    commissionLine: "Ваша комісія: {pctY1}% з кожного платежу в перший рік, {pctAfter}% після цього, поки родина залишається з нами.",
    commissionExplain: "Наприклад, одна родина, яка підключає план Family і залишається на рік, коштує вам понад {year1}. І поки ця родина зберігає підписку, ми в Gadit продовжуємо платити вам комісію з її підписки, місяць за місяцем. Це не разова виплата, а дохід, який триває.",
    year1Est: "$60",
    dashboardNote: "Там ви в реальному часі бачите кліки, реєстрації та заробіток. Вхід не потрібен, панель доступна лише вам.",
    tipsHeader: "3 речі, які допоможуть розповісти про Gadit",
    tip1: "Згадайте там, де батьки вже вас слухають. Група WhatsApp, допис, особиста розмова.",
    tip2: "Біль, знайомий кожному з батьків: дитина натрапляє на слово, якого не розуміє, і здається. Gadit дає їй зрозуміти самостійно, її мовою.",
    tip3: "Є безкоштовний спосіб почати, тому рекомендувати легко, без жодного бар'єра.",
    closing: "Будь-яке питання просто дайте відповідь на цей лист. Я і вся команда тут.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "Засновник, Gadit",
  },
  tr: {
    subject: "Aramızdasın. İşte Gadit ortak bağlantın 🤝",
    greeting: "Gadit Ortak Programı'nda olman harika 🤝",
    opening: "Başlamak için ihtiyacın olan her şey burada. Gadit, örnekler, görseller ve bir çocuğun kelimeleri gerçekten anlamasına yardımcı olan kişisel bir defterle, 22 dilde akıllı ve çocuklar için güvenli bir sözlüktür.",
    noteUnderLink: "Bunun üzerinden kaydolup ödeme yapan herkes otomatik olarak sana yazılır. Bağlantı adını asla göstermez.",
    commissionLine: "Komisyonun: ilk yıl her ödemenin {pctY1}%'i, ardından aile kaldığı sürece {pctAfter}%.",
    commissionExplain: "Örneğin, Family planına katılıp bir yıl kalan bir aile senin için {year1} değerinden fazladır. Ve o aile aboneliğini sürdürdüğü sürece, biz Gadit olarak onun aboneliği üzerinden sana ay be ay komisyon ödemeye devam ederiz. Tek seferlik bir ödeme değil, süren bir gelir.",
    year1Est: "$60",
    dashboardNote: "Tıklamaları, kayıtları ve kazançları orada gerçek zamanlı görürsün. Giriş gerekmez, pano yalnızca sana özeldir.",
    tipsHeader: "Haberi yaymana yardımcı olan 3 şey",
    tip1: "Ebeveynlerin seni zaten dinlediği yerde bahset. Bir WhatsApp grubu, bir gönderi, kişisel bir sohbet.",
    tip2: "Her ebeveynin bildiği sıkıntı: çocuk anlamadığı bir kelimeye takılır ve vazgeçer. Gadit, kendi dilinde, kendi başına anlamasını sağlar.",
    tip3: "Başlamanın ücretsiz bir yolu var, bu yüzden hiçbir engel olmadan önermesi kolay.",
    closing: "Herhangi bir soru için bu e-postayı yanıtlaman yeterli. Ekip ve ben buradayız.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "Kurucu, Gadit",
  },
  pl: {
    subject: "Jesteś z nami. Oto Twój link partnerski Gadit 🤝",
    greeting: "Cieszymy się, że jesteś w Programie Partnerskim Gadit 🤝",
    opening: "Oto wszystko, czego potrzebujesz na start. Gadit to inteligentny, bezpieczny dla dzieci słownik w 22 językach, z przykładami, obrazkami i osobistym zeszytem, który pomaga dziecku naprawdę zrozumieć słowa.",
    noteUnderLink: "Każdy, kto zarejestruje się i zapłaci przez niego, jest automatycznie przypisywany Tobie. Link nigdy nie pokazuje Twojego imienia.",
    commissionLine: "Twoja prowizja: {pctY1}% z każdej płatności w pierwszym roku, a potem {pctAfter}% tak długo, jak rodzina zostaje.",
    commissionExplain: "Na przykład jedna rodzina, która dołącza do planu Family i zostaje rok, jest dla Ciebie warta ponad {year1}. I dopóki ta rodzina utrzymuje subskrypcję, my w Gadit nadal płacimy Ci prowizję od jej subskrypcji, miesiąc po miesiącu. To nie jednorazowa wypłata, lecz dochód, który trwa.",
    year1Est: "$60",
    dashboardNote: "Widzisz tam kliknięcia, rejestracje i zarobki w czasie rzeczywistym. Bez logowania, panel jest prywatny tylko dla Ciebie.",
    tipsHeader: "3 rzeczy, które pomogą Ci rozpowszechnić Gadit",
    tip1: "Wspomnij o tym tam, gdzie rodzice już Cię słuchają. Grupa na WhatsAppie, post, osobista rozmowa.",
    tip2: "Ból, który zna każdy rodzic: dziecko natrafia na słowo, którego nie rozumie, i się poddaje. Gadit pozwala mu zrozumieć samodzielnie, w jego języku.",
    tip3: "Jest darmowy sposób, by zacząć, więc łatwo polecić bez żadnej bariery.",
    closing: "W razie pytań po prostu odpowiedz na tego e-maila. Zespół i ja jesteśmy tutaj.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "Założyciel, Gadit",
  },
  fa: {
    subject: "به جمع ما پیوستید. این هم لینک همکاری Gadit شما 🤝",
    greeting: "خوشحالیم که در برنامه همکاری Gadit هستید 🤝",
    opening: "هر آنچه برای شروع لازم دارید اینجاست. Gadit یک فرهنگ لغت هوشمند و امن برای کودکان به ۲۲ زبان است، همراه با مثال‌ها، تصاویر و یک دفترچه شخصی که به کودک کمک می‌کند واژه‌ها را واقعاً بفهمد.",
    noteUnderLink: "هر کسی که از طریق آن ثبت‌نام کند و پرداخت کند، به‌طور خودکار به نام شما ثبت می‌شود. این لینک هرگز نام شما را نشان نمی‌دهد.",
    commissionLine: "کمیسیون شما: {pctY1}% از هر پرداخت در سال اول، و پس از آن {pctAfter}% تا زمانی که خانواده با ما بماند.",
    commissionExplain: "برای مثال، یک خانواده که به طرح Family می‌پیوندد و یک سال می‌ماند، برای شما بیش از {year1} ارزش دارد. و تا زمانی که آن خانواده اشتراک خود را حفظ کند، ما در Gadit ماه به ماه کمیسیون اشتراکش را به شما پرداخت می‌کنیم. این یک پرداخت یک‌باره نیست، بلکه درآمدی است که ادامه دارد.",
    year1Est: "$60",
    dashboardNote: "آنجا می‌توانید کلیک‌ها، ثبت‌نام‌ها و درآمدها را به‌صورت زنده ببینید. نیازی به ورود نیست، داشبورد فقط برای خود شماست.",
    tipsHeader: "۳ کاری که به گسترش Gadit کمک می‌کند",
    tip1: "جایی که والدین از قبل به شما گوش می‌دهند از آن بگویید. یک گروه واتساپ، یک پست، یک گفت‌وگوی شخصی.",
    tip2: "دردی که هر پدر و مادری می‌شناسد: کودک به واژه‌ای برمی‌خورد که نمی‌فهمد و تسلیم می‌شود. Gadit به او اجازه می‌دهد خودش، به زبان خودش بفهمد.",
    tip3: "راهی رایگان برای شروع هست، پس پیشنهاد دادنش بدون هیچ مانعی آسان است.",
    closing: "هر سؤالی داشتید، کافی است به همین ایمیل پاسخ دهید. من و تیم اینجاییم.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "بنیان‌گذار، Gadit",
  },
  id: {
    subject: "Kamu bergabung. Ini link partner Gadit-mu 🤝",
    greeting: "Senang kamu ada di Program Partner Gadit 🤝",
    opening: "Inilah semua yang kamu butuhkan untuk mulai. Gadit adalah kamus cerdas dan aman untuk anak dalam 22 bahasa, dengan contoh, gambar, dan buku catatan pribadi yang membantu anak benar-benar memahami kata.",
    noteUnderLink: "Setiap orang yang mendaftar dan membayar melalui link ini otomatis dikreditkan untukmu. Link tidak pernah menampilkan namamu.",
    commissionLine: "Komisimu: {pctY1}% dari setiap pembayaran pada tahun pertama, {pctAfter}% setelahnya selama keluarga itu bertahan.",
    commissionExplain: "Sebagai contoh, satu keluarga yang bergabung ke paket Family dan bertahan setahun bernilai lebih dari {year1} untukmu. Dan selama keluarga itu tetap berlangganan, kami di Gadit terus membayarmu komisi atas langganannya, bulan demi bulan. Bukan pembayaran sekali, melainkan penghasilan yang terus berlanjut.",
    year1Est: "$60",
    dashboardNote: "Di sana kamu bisa melihat klik, pendaftaran, dan penghasilan secara real time. Tanpa perlu login, dasbor itu privat hanya untukmu.",
    tipsHeader: "3 hal yang membantumu menyebarkan Gadit",
    tip1: "Sebutkan di tempat orang tua sudah mendengarkanmu. Grup WhatsApp, sebuah unggahan, obrolan pribadi.",
    tip2: "Kesulitan yang dikenal setiap orang tua: anak menemui kata yang tidak dipahaminya lalu menyerah. Gadit membuat mereka memahaminya sendiri, dalam bahasa mereka.",
    tip3: "Ada cara gratis untuk mulai, jadi mudah direkomendasikan tanpa hambatan.",
    closing: "Ada pertanyaan, cukup balas email ini. Saya dan tim ada di sini.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "Pendiri, Gadit",
  },
  el: {
    subject: "Είσαι μέσα. Να ο σύνδεσμος συνεργάτη σου για το Gadit 🤝",
    greeting: "Χαιρόμαστε που είσαι στο Πρόγραμμα Συνεργατών του Gadit 🤝",
    opening: "Εδώ είναι όλα όσα χρειάζεσαι για να ξεκινήσεις. Το Gadit είναι ένα έξυπνο, ασφαλές για παιδιά λεξικό σε 22 γλώσσες, με παραδείγματα, εικόνες και ένα προσωπικό σημειωματάριο που βοηθά το παιδί να καταλάβει πραγματικά τις λέξεις.",
    noteUnderLink: "Όποιος εγγράφεται και πληρώνει μέσω αυτού πιστώνεται αυτόματα σε εσένα. Ο σύνδεσμος δεν δείχνει ποτέ το όνομά σου.",
    commissionLine: "Η προμήθειά σου: {pctY1}% από κάθε πληρωμή τον πρώτο χρόνο, {pctAfter}% έπειτα για όσο η οικογένεια παραμένει.",
    commissionExplain: "Για παράδειγμα, μια οικογένεια που εγγράφεται στο πλάνο Family και μένει έναν χρόνο αξίζει για εσένα πάνω από {year1}. Και για όσο αυτή η οικογένεια διατηρεί τη συνδρομή της, εμείς στο Gadit συνεχίζουμε να σου πληρώνουμε προμήθεια από τη συνδρομή της, μήνα με τον μήνα. Δεν είναι εφάπαξ πληρωμή, αλλά εισόδημα που συνεχίζεται.",
    year1Est: "$60",
    dashboardNote: "Εκεί βλέπεις κλικ, εγγραφές και κέρδη σε πραγματικό χρόνο. Δεν χρειάζεται σύνδεση, ο πίνακας είναι ιδιωτικός μόνο για εσένα.",
    tipsHeader: "3 πράγματα που σε βοηθούν να το διαδώσεις",
    tip1: "Ανάφερέ το εκεί όπου οι γονείς ήδη σε ακούν. Μια ομάδα WhatsApp, μια ανάρτηση, μια προσωπική κουβέντα.",
    tip2: "Ο πόνος που ξέρει κάθε γονιός: το παιδί συναντά μια λέξη που δεν καταλαβαίνει και τα παρατάει. Το Gadit το αφήνει να καταλάβει μόνο του, στη γλώσσα του.",
    tip3: "Υπάρχει δωρεάν τρόπος να ξεκινήσεις, οπότε είναι εύκολο να το προτείνεις χωρίς κανένα εμπόδιο.",
    closing: "Για οποιαδήποτε ερώτηση, απλώς απάντησε σε αυτό το email. Η ομάδα κι εγώ είμαστε εδώ.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "Ιδρυτής, Gadit",
  },
  zu: {
    subject: "Ungenile. Nawu isixhumanisi sakho sozakwethu se-Gadit 🤝",
    greeting: "Siyajabula ukukubona Ohlelweni Lozakwethu lwe-Gadit 🤝",
    opening: "Nakho konke okudingayo ukuze uqale. I-Gadit iyisichazamazwi esihlakaniphile, esiphephile ezinganeni ngezilimi ezingu-22, esinezibonelo, izithombe, kanye nencwadi yokubhalela eyakho eyodwa esiza ingane ukuthi iqonde amagama ngempela.",
    noteUnderLink: "Wonke umuntu obhalisayo futhi akhokhe ngaso ubalelwa kuwe ngokuzenzakalelayo. Isixhumanisi asilokothi sibonise igama lakho.",
    commissionLine: "Ikhomishani yakho: {pctY1}% yakho konke okukhokhwayo onyakeni wokuqala, {pctAfter}% ngemva kwalokho uma nje umndeni usalele.",
    commissionExplain: "Isibonelo, umndeni owodwa ojoyina uhlelo lwe-Family futhi uhlale unyaka ubiza ngaphezu kuka-{year1} kuwe. Futhi uma nje lowo mndeni uqhubeka nokubhalisa, thina e-Gadit siqhubeka nokukukhokhela ikhomishani ngokubhalisa kwawo, inyanga nenyanga. Akukhona ukukhokha kwakanye, kodwa imali engena eqhubekayo.",
    year1Est: "$60",
    dashboardNote: "Lapho ungabona ukuchofoza, ukubhalisa, kanye nenzuzo ngesikhathi sangempela. Akudingeki ukungena, ideshibhodi iyimfihlo yakho wedwa.",
    tipsHeader: "Izinto ezi-3 ezikusiza usabalalise izwi",
    tip1: "Khuluma ngayo lapho abazali sebekulalela khona. Iqembu le-WhatsApp, okuthunyelwe, ingxoxo yomuntu siqu.",
    tip2: "Ubuhlungu obaziwa yiwo wonke umzali: ingane ihlangana negama engaliqondi bese iyayeka. I-Gadit iyivumela ukuthi iqonde ngokwayo, ngolimi lwayo.",
    tip3: "Kunendlela yamahhala yokuqala, ngakho kulula ukuyincoma ngaphandle kwesithiyo.",
    closing: "Noma yimuphi umbuzo, phendula nje le-imeyili. Mina neqembu sikhona.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "Umsunguli, Gadit",
  },
};

/** Short UI labels rendered around the injected blocks (links, code,
 *  dashboard button), per language. Kept separate from the editable
 *  WelcomeLangConfig so the admin editor stays focused on the message. */
type WelcomeLabels = {
  linkLabel: string; codeLabel: string; ctaLabel: string; linksHint: string;
  productGeneral: string; productFamilies: string; productSchools: string;
};
const WELCOME_LABELS: Record<string, WelcomeLabels> = {
  he: { linkLabel: "הקישורים שלך", codeLabel: "קוד השותף שלך", ctaLabel: "פתיחת האזור האישי", linksHint: "קישור לכל מוצר. אפשר לשתף כל אחד בנפרד, בכל שפה מהאזור האישי.", productGeneral: "Gadit (כללי)", productFamilies: "למשפחות", productSchools: "לבתי ספר" },
  en: { linkLabel: "Your links", codeLabel: "Your partner code", ctaLabel: "Open your dashboard", linksHint: "One link per product. Share whichever fits, in any language from your dashboard.", productGeneral: "Gadit (general)", productFamilies: "Families", productSchools: "Schools" },
  nl: {
    linkLabel: "Jouw links",
    codeLabel: "Jouw partnercode",
    ctaLabel: "Open je dashboard",
    linksHint: "Eén link per product. Deel wat past, in elke taal vanuit je dashboard.",
    productGeneral: "Gadit (algemeen)",
    productFamilies: "Families",
    productSchools: "Scholen",
  },
  ar: {
    linkLabel: "روابطك",
    codeLabel: "رمز الشريك الخاص بك",
    ctaLabel: "افتح لوحة التحكم الخاصة بك",
    linksHint: "رابط واحد لكل منتج. شارك ما يناسبك، بأي لغة من لوحة التحكم الخاصة بك.",
    productGeneral: "Gadit (عام)",
    productFamilies: "العائلات",
    productSchools: "المدارس",
  },
  ru: {
    linkLabel: "Ваши ссылки",
    codeLabel: "Ваш партнёрский код",
    ctaLabel: "Открыть панель",
    linksHint: "Одна ссылка на продукт. Делитесь той, что подходит, на любом языке из вашей панели.",
    productGeneral: "Gadit (общий)",
    productFamilies: "Families",
    productSchools: "Schools",
  },
  es: {
    linkLabel: "Tus enlaces",
    codeLabel: "Tu código de socio",
    ctaLabel: "Abre tu panel",
    linksHint: "Un enlace por producto. Comparte el que mejor encaje, en cualquier idioma desde tu panel.",
    productGeneral: "Gadit (general)",
    productFamilies: "Familias",
    productSchools: "Colegios",
  },
  pt: {
    linkLabel: "Seus links",
    codeLabel: "Seu código de parceiro",
    ctaLabel: "Abrir seu painel",
    linksHint: "Um link por produto. Compartilhe o que fizer mais sentido, em qualquer idioma, direto do seu painel.",
    productGeneral: "Gadit (geral)",
    productFamilies: "Famílias",
    productSchools: "Escolas",
  },
  fr: {
    linkLabel: "Vos liens",
    codeLabel: "Votre code partenaire",
    ctaLabel: "Ouvrir votre tableau de bord",
    linksHint: "Un lien par produit. Partagez celui qui convient, dans n'importe quelle langue depuis votre tableau de bord.",
    productGeneral: "Gadit (général)",
    productFamilies: "Familles",
    productSchools: "Écoles",
  },
  de: {
    linkLabel: "Deine Links",
    codeLabel: "Dein Partner-Code",
    ctaLabel: "Dein Dashboard öffnen",
    linksHint: "Ein Link pro Produkt. Teile den passenden, in jeder Sprache aus deinem Dashboard.",
    productGeneral: "Gadit (allgemein)",
    productFamilies: "Families",
    productSchools: "Schools",
  },
  cs: {
    linkLabel: "Vaše odkazy",
    codeLabel: "Váš partnerský kód",
    ctaLabel: "Otevřít přehled",
    linksHint: "Jeden odkaz na produkt. Sdílejte ten, který se hodí, v jakémkoli jazyce ze svého přehledu.",
    productGeneral: "Gadit (obecně)",
    productFamilies: "Families",
    productSchools: "Schools",
  },
  sk: {
    linkLabel: "Vaše odkazy",
    codeLabel: "Váš partnerský kód",
    ctaLabel: "Otvoriť nástenku",
    linksHint: "Jeden odkaz na produkt. Zdieľajte ten, ktorý sa hodí, v ktoromkoľvek jazyku zo svojej nástenky.",
    productGeneral: "Gadit (všeobecné)",
    productFamilies: "Rodiny",
    productSchools: "Školy",
  },
  it: {
    linkLabel: "I tuoi link",
    codeLabel: "Il tuo codice partner",
    ctaLabel: "Apri la tua dashboard",
    linksHint: "Un link per ogni prodotto. Condividi quello che preferisci, in qualsiasi lingua, dalla tua dashboard.",
    productGeneral: "Gadit (generale)",
    productFamilies: "Families",
    productSchools: "Schools",
  },
  ja: {
    linkLabel: "あなたのリンク",
    codeLabel: "あなたのパートナーコード",
    ctaLabel: "ダッシュボードを開く",
    linksHint: "商品ごとに 1 つのリンクがあります。ダッシュボードから、合うものをどの言語でも共有してください。",
    productGeneral: "Gadit (一般)",
    productFamilies: "Families",
    productSchools: "Schools",
  },
  hi: {
    linkLabel: "आपके links",
    codeLabel: "आपका पार्टनर code",
    ctaLabel: "अपना dashboard खोलें",
    linksHint: "हर product के लिए एक link। जो भी सही लगे उसे साझा करें, अपने dashboard से किसी भी भाषा में।",
    productGeneral: "Gadit (सामान्य)",
    productFamilies: "Families",
    productSchools: "Schools",
  },
  am: {
    linkLabel: "ሊንኮችህ",
    codeLabel: "የአጋርነት ኮድህ",
    ctaLabel: "ዳሽቦርድህን ክፈት",
    linksHint: "ለእያንዳንዱ ምርት አንድ ሊንክ። የሚስማማህን, ከዳሽቦርድህ በማንኛውም ቋንቋ አጋራ።",
    productGeneral: "Gadit (አጠቃላይ)",
    productFamilies: "Families",
    productSchools: "Schools",
  },
  uk: {
    linkLabel: "Ваші посилання",
    codeLabel: "Ваш партнерський код",
    ctaLabel: "Відкрити панель",
    linksHint: "Одне посилання на продукт. Діліться тим, що підходить, будь-якою мовою з вашої панелі.",
    productGeneral: "Gadit (загальний)",
    productFamilies: "Сім'ї",
    productSchools: "Школи",
  },
  tr: {
    linkLabel: "Bağlantıların",
    codeLabel: "Ortak kodun",
    ctaLabel: "Panonu aç",
    linksHint: "Her ürün için bir bağlantı. Uygun olanı, panondan istediğin dilde paylaş.",
    productGeneral: "Gadit (genel)",
    productFamilies: "Aileler",
    productSchools: "Okullar",
  },
  pl: {
    linkLabel: "Twoje linki",
    codeLabel: "Twój kod partnerski",
    ctaLabel: "Otwórz panel",
    linksHint: "Jeden link na produkt. Udostępnij ten, który pasuje, w dowolnym języku z panelu.",
    productGeneral: "Gadit (ogólny)",
    productFamilies: "Rodziny",
    productSchools: "Szkoły",
  },
  fa: {
    linkLabel: "لینک‌های شما",
    codeLabel: "کد همکاری شما",
    ctaLabel: "باز کردن داشبورد",
    linksHint: "برای هر محصول یک لینک. هرکدام مناسب بود، به هر زبانی از داشبورد خود به اشتراک بگذارید.",
    productGeneral: "Gadit (عمومی)",
    productFamilies: "خانواده‌ها",
    productSchools: "مدارس",
  },
  id: {
    linkLabel: "Link kamu",
    codeLabel: "Kode partnermu",
    ctaLabel: "Buka dasbormu",
    linksHint: "Satu link per produk. Bagikan yang cocok, dalam bahasa apa pun dari dasbormu.",
    productGeneral: "Gadit (umum)",
    productFamilies: "Keluarga",
    productSchools: "Sekolah",
  },
  el: {
    linkLabel: "Οι σύνδεσμοί σου",
    codeLabel: "Ο κωδικός συνεργάτη σου",
    ctaLabel: "Άνοιξε τον πίνακά σου",
    linksHint: "Ένας σύνδεσμος ανά προϊόν. Μοιράσου όποιον ταιριάζει, σε οποιαδήποτε γλώσσα από τον πίνακά σου.",
    productGeneral: "Gadit (γενικό)",
    productFamilies: "Οικογένειες",
    productSchools: "Σχολεία",
  },
  zu: {
    linkLabel: "Izixhumanisi zakho",
    codeLabel: "Ikhodi yakho yozakwethu",
    ctaLabel: "Vula ideshibhodi yakho",
    linksHint: "Isixhumanisi esisodwa ngomkhiqizo ngamunye. Yabelana ngesifanele, nganoma yiluphi ulimi kusukela kudeshibhodi yakho.",
    productGeneral: "Gadit (jikelele)",
    productFamilies: "Imindeni",
    productSchools: "Izikole",
  },
};

function esc(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Wrap runs of Latin letters / digits / currency / percent in a Unicode
// First-Strong Isolate (U+2068 … U+2069 PDI) so the RTL bidi algorithm
// doesn't scramble "72 ₪", "$60", "30%", "Gadit", or the colon before them
// when they sit inside Hebrew/Arabic text (Gadi 2026-08-16: partner emails
// read out of order for RTL readers). Run on RAW text BEFORE escaping, so
// the isolate marks never land inside an HTML entity. ":" is deliberately
// left out of the run so it stays anchored in the RTL flow.
function isolateLtr(s: string): string {
  return s.replace(
    /[A-Za-z0-9$₪€£][A-Za-z0-9$₪€£%@/._\- ]*[A-Za-z0-9$₪€£%]|[A-Za-z0-9$₪€£%]/g,
    (m) => `⁨${m}⁩`,
  );
}

type Vars = { name: string; pctY1: number; pctAfter: number; year1: string; code: string; link: string };

function applyVars(s: string, v: Vars, rtl = false): string {
  // Inject raw values first, isolate LTR runs (for RTL), THEN escape — so
  // isolation sees clean text and escaping never splits an isolate.
  const injected = s
    .replace(/\{name\}/g, v.name || "")
    .replace(/\{pctY1\}/g, String(v.pctY1))
    .replace(/\{pctAfter\}/g, String(v.pctAfter))
    .replace(/\{year1\}/g, v.year1 || "")
    .replace(/\{code\}/g, v.code)
    .replace(/\{link\}/g, v.link);
  return esc(rtl ? isolateLtr(injected) : injected);
}

function applyVarsHtml(s: string, v: Vars, rtl = false): string {
  return applyVars(s, v, rtl).replace(/\r\n/g, "\n").replace(/\n/g, "<br>");
}

type WelcomePartner = Pick<Partner, "code" | "name" | "email" | "dashboardToken" | "rateYearOne" | "rateLifetime">;

/** Pure builder — used both to send and to preview. */
export function buildWelcomeEmail(
  partner: WelcomePartner,
  lang: string,
  cfg: WelcomeConfig,
): { subject: string; html: string } {
  const rtl = lang === "he" || lang === "ar" || lang === "fa";
  const c = cfg[lang] ?? cfg.en;
  const L = WELCOME_LABELS[lang] ?? WELCOME_LABELS.en;
  const pctY1 = Math.round((partner.rateYearOne ?? 0.25) * 100);
  const pctAfter = Math.round((partner.rateLifetime ?? 0.1) * 100);
  // The primary {link} token in the body points to the FAMILIES landing,
  // not the general homepage (Gadi 2026-08-13: partners sell Families +
  // Schools, so no general Gadit link anywhere).
  const link = `${SITE}${lang === "en" ? "" : `/${lang}`}/families/landing?ref=${partner.code}`;
  // Per-product referral links (general Gadit, Families landing, Schools
  // landing). RefCapture attributes ?ref on any page, so a partner who
  // wants to sell Family shares the Families link directly (Gadi
  // 2026-08-05). Links match the email language; other languages are in
  // the dashboard.
  const linkPrefix = lang === "en" ? "" : `/${lang}`;
  // Families + Schools only (Gadi 2026-08-13): these are the products we
  // want partners to sell, so the general Gadit link was dropped from the
  // welcome email (and the portal).
  const productLinks = [
    { label: L.productFamilies, url: `${SITE}${linkPrefix}/families/landing?ref=${partner.code}` },
    { label: L.productSchools, url: `${SITE}${linkPrefix}/schools/landing?ref=${partner.code}` },
  ];
  const linksHint = L.linksHint;
  const dash = `${SITE}/partner/dashboard?t=${partner.dashboardToken}`;
  // {year1} = the PARTNER's first-year commission from one Family-plan
  // customer, NOT the customer's spend (Gadi 2026-08-02: the text says
  // "worth to YOU"). Basis: Family monthly annualized (₪19.90×12 ≈ 240,
  // $5.99×12 ≈ 72) × the partner's own year-one rate. So 25% → ₪60, a
  // founder's 30% → ₪72. Always correct per partner, per currency.
  const ils = lang === "he" || lang === "ru";
  const annualSpend = ils ? 240 : 72;
  const y1Amount = Math.round((partner.rateYearOne ?? 0.25) * annualSpend);
  const year1 = ils ? `${y1Amount} ₪` : `$${y1Amount}`;
  const vars: Vars = { name: partner.name, pctY1, pctAfter, year1, code: partner.code, link };

  const linkLabel = L.linkLabel;
  const codeLabel = L.codeLabel;
  const cta = L.ctaLabel;
  // Body + signature isolate LTR runs for RTL; the subject line does not
  // (mail clients bidi-order subjects themselves, and stray isolate marks
  // can show as boxes in some subject renderers).
  const t = (s: string) => applyVars(s, vars, rtl);
  const tb = (s: string) => applyVarsHtml(s, vars, rtl);
  const dir = rtl ? "rtl" : "ltr";
  const align = rtl ? "right" : "left";

  const subject = applyVars(c.subject, vars, false).replace(/&amp;/g, "&").replace(/\s*\n\s*/g, " ");

  const tips = [c.tip1, c.tip2, c.tip3].filter((x) => x && x.trim());
  const tipsHtml = tips.length
    ? `<div style="margin:22px 0 4px;font-weight:700;font-size:15px;">${t(c.tipsHeader)}</div>
       <ol style="margin:8px 0 0;padding-inline-start:20px;">${tips.map((tp) => `<li style="margin:0 0 8px;font-size:14.5px;line-height:1.6;">${tb(tp)}</li>`).join("")}</ol>`
    : "";

  const html = `<!DOCTYPE html><html dir="${dir}"><body style="margin:0;padding:24px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#F6F8FA;color:#111827;">
  <div dir="${dir}" style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #EAECEF;overflow:hidden;">
    <div dir="${dir}" style="background:linear-gradient(135deg,#0EA5A5,#0E7490);padding:24px;color:#fff;text-align:${align};">
      <div style="font-size:13px;font-weight:600;letter-spacing:1px;opacity:.85;">GADIT</div>
      <div style="font-size:22px;font-weight:800;margin-top:4px;">${t(c.greeting)}</div>
    </div>
    <div dir="${dir}" style="padding:24px;font-size:15px;line-height:1.6;text-align:${align};">
      <p style="margin:0 0 18px;">${tb(c.opening)}</p>

      <div style="font-size:13px;color:#6B7280;margin:0 0 4px;">${linkLabel}</div>
      <div style="font-size:12.5px;color:#9CA3AF;margin:0 0 12px;">${linksHint}</div>
      ${productLinks.map((p) => `
      <div style="margin:0 0 12px;">
        <div style="font-size:12px;font-weight:700;color:#374151;margin:0 0 3px;">${p.label}</div>
        <a href="${p.url}" style="font-size:14px;font-weight:600;color:#0EA5A5;word-break:break-all;">${p.url}</a>
      </div>`).join("")}
      <div style="font-size:12.5px;color:#9CA3AF;margin:0 0 18px;">${tb(c.noteUnderLink)}</div>

      <div style="font-size:13px;color:#6B7280;margin:0 0 6px;">${codeLabel}</div>
      <div style="font-size:22px;font-weight:800;letter-spacing:2px;margin:0 0 20px;">${esc(partner.code)}</div>

      <div style="background:rgba(14,165,165,0.08);border-radius:12px;padding:16px;margin:0 0 18px;">
        <div style="font-weight:700;margin:0 0 6px;">${tb(c.commissionLine)}</div>
        <div style="font-size:14px;color:#374151;">${tb(c.commissionExplain)}</div>
      </div>

      <div style="text-align:center;margin:20px 0 8px;">
        <a href="${dash}" style="display:inline-block;background:#0EA5A5;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">${cta}</a>
      </div>
      <div style="font-size:12.5px;color:#9CA3AF;margin:0 0 4px;text-align:center;">${tb(c.dashboardNote)}</div>

      ${tipsHtml}

      <p style="margin:24px 0 0;font-size:14.5px;">${tb(c.closing)}</p>
      <p style="margin:16px 0 0;font-size:14.5px;font-weight:700;">${t(c.signatureName)}</p>
      <p style="margin:2px 0 0;font-size:13px;color:#6B7280;">${t(c.signatureRole)}</p>
    </div>
  </div>
</body></html>`;

  return { subject, html };
}

/** Load the (merged-with-defaults) welcome-email config from Firestore. */
export async function loadWelcomeConfig(): Promise<WelcomeConfig> {
  try {
    const snap = await getAdminDb().collection("partnerConfig").doc("welcomeEmail").get();
    const d = snap.data();
    if (!d) return DEFAULT_WELCOME_CONFIG;
    const merged: WelcomeConfig = {};
    for (const lng of Object.keys(DEFAULT_WELCOME_CONFIG)) {
      merged[lng] = { ...DEFAULT_WELCOME_CONFIG[lng], ...((d[lng] as Partial<WelcomeLangConfig>) ?? {}) };
    }
    return merged;
  } catch {
    return DEFAULT_WELCOME_CONFIG;
  }
}

/** The welcome / "here's your link" email. Reads the editable config, sends. */
export async function sendPartnerWelcome(partner: WelcomePartner, lang: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;
  try {
    const cfg = await loadWelcomeConfig();
    const { subject, html } = buildWelcomeEmail(partner, lang, cfg);
    await new Resend(resendKey).emails.send({ from: "Gadit <notify@gadit.app>", to: partner.email, subject, html });
  } catch (e) {
    console.warn("[partner-email] welcome send failed (non-blocking):", e);
  }
}

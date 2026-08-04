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
    opening: "הנה כל מה שצריך כדי להתחיל. Gadit הוא מילון חכם ובטוח לילדים ב-14 שפות, עם דוגמאות, תמונות ומחברת אישית שעוזרת לילד באמת להבין מילים.",
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
    opening: "Here's everything you need to start. Gadit is a smart, child-safe dictionary in 14 languages, with examples, pictures and a personal notebook that helps a child truly understand words.",
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
  ar: {
    subject: "تم قبولك. هذا هو رابط شريك Gadit الخاص بك 🤝",
    greeting: "يسعدنا انضمامك إلى برنامج شركاء Gadit 🤝",
    opening: "هذا كل ما تحتاجه للبدء. Gadit قاموس ذكي وآمن للأطفال بأربع عشرة لغة، مع أمثلة وصور ودفتر شخصي يساعد الطفل على فهم الكلمات فهماً حقيقياً.",
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
    opening: "Здесь всё, что нужно для старта. Gadit это умный, безопасный для детей словарь на 14 языках, с примерами, картинками и личной тетрадью, которая помогает ребёнку по-настоящему понять слова.",
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
    opening: "Aquí tienes todo lo que necesitas para empezar. Gadit es un diccionario inteligente y seguro para niños en 14 idiomas, con ejemplos, imágenes y un cuaderno personal que ayuda a cada niño a entender de verdad las palabras.",
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
    opening: "Aqui está tudo o que você precisa para começar. A Gadit é um dicionário inteligente e seguro para crianças em 14 idiomas, com exemplos, imagens e um caderno pessoal que ajuda a criança a entender de verdade as palavras.",
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
    opening: "Voici tout ce qu'il vous faut pour commencer. Gadit est un dictionnaire intelligent et sûr pour les enfants, en 14 langues, avec des exemples, des images et un carnet personnel qui aide l'enfant à vraiment comprendre les mots.",
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
    opening: "Hier ist alles, was du für den Start brauchst. Gadit ist ein smartes, kindersicheres Wörterbuch in 14 Sprachen, mit Beispielen, Bildern und einem persönlichen Notizbuch, das einem Kind hilft, Wörter wirklich zu verstehen.",
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
    opening: "Tady je všechno, co potřebujete k rozjezdu. Gadit je chytrý slovník bezpečný pro děti ve 14 jazycích, s příklady, obrázky a osobním sešitem, který dítěti pomáhá slovům opravdu porozumět.",
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
    opening: "Tu je všetko, čo potrebujete na začiatok. Gadit je inteligentný slovník bezpečný pre deti v 14 jazykoch, s príkladmi, obrázkami a osobným zošitom, ktorý pomáha dieťaťu naozaj porozumieť slovám.",
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
    opening: "Ecco tutto ciò che ti serve per iniziare. Gadit è un dizionario intelligente e sicuro per i bambini in 14 lingue, con esempi, immagini e un quaderno personale che aiuta il bambino a capire davvero le parole.",
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
    opening: "始めるために必要なものをすべてご用意しました。Gadit は 14 言語に対応した、子どもにも安心してお使いいただける賢い辞書です。例文や画像、そして子どもが言葉を本当に理解できるように手助けする専用ノートが備わっています。",
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
    opening: "शुरू करने के लिए जो कुछ आपको चाहिए, वह सब यहाँ है। Gadit 14 भाषाओं में एक स्मार्ट, बच्चों के लिए सुरक्षित डिक्शनरी है, जिसमें उदाहरण, तस्वीरें और एक निजी नोटबुक है, जो बच्चे को शब्दों को सचमुच समझने में मदद करती है।",
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
    opening: "ለመጀመር የሚያስፈልግህ ሁሉ ይኸውልህ። Gadit በ14 ቋንቋዎች ብልህና ለልጆች ደህንነቱ የተጠበቀ መዝገበ ቃላት ነው, ከምሳሌዎች, ስዕሎችና ልጅ ቃላትን በእውነት እንዲረዳ ከሚያግዝ የግል ማስታወሻ ደብተር ጋር።",
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
};

function esc(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

type Vars = { name: string; pctY1: number; pctAfter: number; year1: string; code: string; link: string };

function applyVars(s: string, v: Vars): string {
  return esc(s)
    .replace(/\{name\}/g, esc(v.name || ""))
    .replace(/\{pctY1\}/g, String(v.pctY1))
    .replace(/\{pctAfter\}/g, String(v.pctAfter))
    .replace(/\{year1\}/g, esc(v.year1 || ""))
    .replace(/\{code\}/g, esc(v.code))
    .replace(/\{link\}/g, esc(v.link));
}

function applyVarsHtml(s: string, v: Vars): string {
  return applyVars(s, v).replace(/\r\n/g, "\n").replace(/\n/g, "<br>");
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
  const link = `${SITE}/?ref=${partner.code}`;
  // Per-product referral links (general Gadit, Families landing, Schools
  // landing). RefCapture attributes ?ref on any page, so a partner who
  // wants to sell Family shares the Families link directly (Gadi
  // 2026-08-05). Links match the email language; other languages are in
  // the dashboard.
  const linkPrefix = lang === "en" ? "" : `/${lang}`;
  const productLinks = [
    { label: L.productGeneral, url: `${SITE}${linkPrefix}/?ref=${partner.code}` },
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
  const t = (s: string) => applyVars(s, vars);
  const tb = (s: string) => applyVarsHtml(s, vars);
  const dir = rtl ? "rtl" : "ltr";
  const align = rtl ? "right" : "left";

  const subject = t(c.subject).replace(/&amp;/g, "&").replace(/\s*\n\s*/g, " ");

  const tips = [c.tip1, c.tip2, c.tip3].filter((x) => x && x.trim());
  const tipsHtml = tips.length
    ? `<div style="margin:22px 0 4px;font-weight:700;font-size:15px;">${t(c.tipsHeader)}</div>
       <ol style="margin:8px 0 0;padding-inline-start:20px;">${tips.map((tp) => `<li style="margin:0 0 8px;font-size:14.5px;line-height:1.6;">${tb(tp)}</li>`).join("")}</ol>`
    : "";

  const html = `<!DOCTYPE html><html dir="${dir}"><body style="margin:0;padding:24px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#F6F8FA;color:#111827;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #EAECEF;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#0EA5A5,#0E7490);padding:24px;color:#fff;text-align:${align};">
      <div style="font-size:13px;font-weight:600;letter-spacing:1px;opacity:.85;">GADIT</div>
      <div style="font-size:22px;font-weight:800;margin-top:4px;">${t(c.greeting)}</div>
    </div>
    <div style="padding:24px;font-size:15px;line-height:1.6;text-align:${align};">
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

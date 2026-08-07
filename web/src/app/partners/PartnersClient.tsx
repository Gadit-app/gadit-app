"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";

/**
 * Partner program landing + instant signup. Mirrors the Yooniz partners
 * page: recommend Gadit, earn 25% recurring in year one and 10% for life;
 * founder partners earn 30% in year one. Signup is instant — the form
 * posts to /api/partner/signup, which emails the code + dashboard link
 * and shows them inline on success.
 */

const COPY = {
  he: {
    dir: "rtl" as const,
    curSym: "₪",
    monthlyPrice: 19.9, // Deep monthly, ILS
    nav: "לאתר",
    heroTitle: "להמליץ על Gadit, לקבל הכנסה חוזרת.",
    heroSub: "כל מי שנרשם ומשלם דרך הקישור האישי שלך מזכה אותך ב-25% עמלה חוזרת בשנה הראשונה, ו-10% לכל החיים.",
    heroCta: "הצטרפות בחינם",
    proofA: "25% שנה ראשונה",
    proofB: "10% לכל החיים",
    proofC: "תשלום פעם בחודש",
    whyTitle: "למה להמליץ על Gadit",
    why: [
      { t: "מוצר שהורים אוהבים", d: "מילון בטוח לילדים ב-14 שפות, עם דוגמאות, תמונות ומחברת אישית. קל להמליץ על משהו שבאמת עוזר." },
      { t: "הכנסה חוזרת אמיתית", d: "לא תגמול חד-פעמי. על כל חודש שהלקוח משלם נכנסת עמלה. לקוח שנשאר שנה שווה שנה שלמה." },
      { t: "אפס סיכון", d: "ההצטרפות חינם, אין יעדים ואין מינימום. מספיק לשתף קישור כדי להרוויח." },
    ],
    howTitle: "איך זה עובד",
    how: [
      { t: "הרשמה", d: "שם ומייל, ותוך שניות מגיעים קוד וקישור אישי." },
      { t: "שיתוף", d: "הקישור נשלח לקהל שלך. כל מי שלוחץ משויך אליך ל-60 יום, גם אם נרשם מאוחר יותר." },
      { t: "רווח", d: "על כל חודש שהלקוח משלם בפועל נכנסת עמלה. משתחררת אחרי 30 יום ומשולמת פעם בחודש." },
    ],
    ratesTitle: "כמה אפשר להרוויח",
    standardName: "שותף",
    standardRate: "25%",
    standardSub: "עמלה חוזרת בשנה הראשונה, ואז 10% לכל החיים על כל לקוח.",
    founderName: "שותף מייסד",
    founderRate: "30%",
    founderSub: "בשנה הראשונה, ואז 10% לכל החיים. מספר מקומות מוגבל למי שיכול להביא נפח אמיתי.",
    calcTitle: "מחשבון רווחים",
    calcLead: "כמה לקוחות פעילים אפשר להביא?",
    calcMonthly: "בחודש",
    calcYearly: "בשנה הראשונה",
    calcNote: "הערכה על בסיס מנוי Deep ועמלת 25%. לקוחות שנתיים ומנויי משפחה או בית ספר מגדילים את הסכום.",
    formTitle: "הצטרפות לתוכנית",
    formName: "שם מלא",
    formEmail: "אימייל",
    formAudience: "איפה הקהל שלך? (רשות)",
    formCta: "קבלת קוד שותף",
    formSending: "רגע…",
    successTitle: "מעכשיו זה רשמי 🎉",
    successBody: "הקוד והקישור נשלחו אליך למייל. הנה גם כאן:",
    successLinkLabel: "הקישור האישי שלך",
    successDash: "פתיחת האזור האישי",
    errEmail: "נא להזין אימייל תקין.",
    errGeneric: "משהו השתבש. אפשר לנסות שוב.",
    faqTitle: "שאלות נפוצות",
    faq: [
      { q: "צריך להיות מנוי משלם כדי להצטרף?", a: "לא. ההצטרפות פתוחה לכולם, בחינם." },
      { q: "מתי מגיע הכסף?", a: "כל עמלה משתחררת 30 יום אחרי התשלום, והתשלום מתבצע פעם בחודש." },
      { q: "מה קורה אם לקוח מבטל?", a: "העמלה מגיעה על כל חודש ששולם בפועל. אם הלקוח ביטל אחרי 4 חודשים, קיבלת 4 חודשים. הוגן לשני הצדדים." },
      { q: "יש תקרה?", a: "אין תקרה. אפשר להביא כמה לקוחות שרק אפשר." },
    ],
  },
  en: {
    dir: "ltr" as const,
    curSym: "$",
    monthlyPrice: 4.99, // Deep monthly, USD
    nav: "Home",
    heroTitle: "Recommend Gadit. Earn recurring income.",
    heroSub: "Everyone who signs up and pays through your personal link earns you 25% recurring commission in year one, and 10% for life.",
    heroCta: "Join free",
    proofA: "25% year one",
    proofB: "10% for life",
    proofC: "Paid monthly",
    whyTitle: "Why recommend Gadit",
    why: [
      { t: "A product parents love", d: "A child-safe dictionary in 14 languages, with examples, pictures and a personal notebook. Easy to recommend something that genuinely helps." },
      { t: "Real recurring income", d: "Not a one-time payout. Every month a customer pays, you earn. A customer who stays a year is worth a full year to you." },
      { t: "Zero risk", d: "Joining is free, no targets, no minimums. Share a link, earn." },
    ],
    howTitle: "How it works",
    how: [
      { t: "Sign up", d: "Enter a name and email, and get a code + personal link within seconds." },
      { t: "Share", d: "Send your link to your audience. Everyone who clicks is credited to you for 60 days, even if they sign up later." },
      { t: "Earn", d: "You earn on every month the customer actually pays. Releases after 30 days, paid out monthly." },
    ],
    ratesTitle: "How much you earn",
    standardName: "Partner",
    standardRate: "25%",
    standardSub: "recurring in year one, then 10% for life on every customer.",
    founderName: "Founder Partner",
    founderRate: "30%",
    founderSub: "in year one, then 10% for life. Limited spots for partners who can move real volume.",
    calcTitle: "Earnings calculator",
    calcLead: "How many active customers will you bring?",
    calcMonthly: "per month",
    calcYearly: "in year one",
    calcNote: "Estimate based on a Deep plan and a 25% rate. Annual, Family and School customers push it higher.",
    formTitle: "Join the program",
    formName: "Full name",
    formEmail: "Email",
    formAudience: "Where's your audience? (optional)",
    formCta: "Get my partner code",
    formSending: "One sec…",
    successTitle: "You're in 🎉",
    successBody: "We emailed your code and link. Here they are too:",
    successLinkLabel: "Your personal link",
    successDash: "Open your dashboard",
    errEmail: "Please enter a valid email.",
    errGeneric: "Something went wrong. Please try again.",
    faqTitle: "FAQ",
    faq: [
      { q: "Do I need to be a paying customer?", a: "No. Joining is open to everyone, free." },
      { q: "When do I get paid?", a: "Each commission releases 30 days after the payment, and payouts run once a month." },
      { q: "What if a customer cancels?", a: "You earned on every month actually paid. Cancel after 4 months, you kept 4 months. Fair both ways." },
      { q: "Is there a cap?", a: "None. Bring as many customers as you like." },
    ],
  },
  ar: {
    dir: "rtl" as const,
    curSym: "$",
    monthlyPrice: 4.99, // Deep monthly, USD
    nav: "الرئيسية",
    heroTitle: "أوصِ بـ Gadit. واكسب دخلاً متكرراً.",
    heroSub: "كل من يسجّل ويدفع عبر رابطك الشخصي يكسب لك عمولة متكررة بنسبة 25% في السنة الأولى، و10% مدى الحياة.",
    heroCta: "انضم مجاناً",
    proofA: "25% في السنة الأولى",
    proofB: "10% مدى الحياة",
    proofC: "يُدفع شهرياً",
    whyTitle: "لماذا توصي بـ Gadit",
    why: [
      { t: "منتج يحبّه الآباء", d: "قاموس آمن للأطفال بـ 14 لغة، مع أمثلة وصور ودفتر شخصي. من السهل أن توصي بشيء يساعد فعلاً." },
      { t: "دخل متكرر حقيقي", d: "ليست دفعة لمرة واحدة. في كل شهر يدفع فيه العميل، تكسب أنت. العميل الذي يبقى سنة كاملة يساوي لك سنة كاملة." },
      { t: "بلا أي مخاطرة", d: "الانضمام مجاني، بلا أهداف ولا حدود دنيا. شارك رابطاً، واكسب." },
    ],
    howTitle: "كيف يعمل",
    how: [
      { t: "سجّل", d: "أدخل اسماً وبريداً إلكترونياً، واحصل على رمز ورابط شخصي خلال ثوانٍ." },
      { t: "شارك", d: "أرسل رابطك إلى جمهورك. كل من ينقر يُنسب إليك لمدة 60 يوماً، حتى لو سجّل لاحقاً." },
      { t: "اكسب", d: "تكسب عن كل شهر يدفع فيه العميل فعلاً. تُحرَّر العمولة بعد 30 يوماً، وتُدفع شهرياً." },
    ],
    ratesTitle: "كم تكسب",
    standardName: "شريك",
    standardRate: "25%",
    standardSub: "متكررة في السنة الأولى، ثم 10% مدى الحياة عن كل عميل.",
    founderName: "شريك مؤسِّس",
    founderRate: "30%",
    founderSub: "في السنة الأولى، ثم 10% مدى الحياة. أماكن محدودة للشركاء القادرين على تحقيق حجم حقيقي.",
    calcTitle: "حاسبة الأرباح",
    calcLead: "كم عميلاً نشطاً ستجلب؟",
    calcMonthly: "في الشهر",
    calcYearly: "في السنة الأولى",
    calcNote: "تقدير مبني على خطة Deep ونسبة 25%. عملاء الاشتراك السنوي والعائلة والمدارس يرفعونه أكثر.",
    formTitle: "انضم إلى البرنامج",
    formName: "الاسم الكامل",
    formEmail: "البريد الإلكتروني",
    formAudience: "أين جمهورك؟ (اختياري)",
    formCta: "احصل على رمز الشريك الخاص بي",
    formSending: "لحظة واحدة…",
    successTitle: "أصبحت معنا 🎉",
    successBody: "أرسلنا رمزك ورابطك عبر البريد الإلكتروني. وها هما أيضاً:",
    successLinkLabel: "رابطك الشخصي",
    successDash: "افتح لوحة التحكم الخاصة بك",
    errEmail: "يُرجى إدخال بريد إلكتروني صالح.",
    errGeneric: "حدث خطأ ما. يُرجى المحاولة مرة أخرى.",
    faqTitle: "الأسئلة الشائعة",
    faq: [
      { q: "هل يجب أن أكون عميلاً مدفوعاً؟", a: "لا. الانضمام متاح للجميع، مجاناً." },
      { q: "متى أتقاضى أرباحي؟", a: "تُحرَّر كل عمولة بعد 30 يوماً من الدفعة، وتُصرف المدفوعات مرة واحدة في الشهر." },
      { q: "ماذا لو ألغى العميل اشتراكه؟", a: "لقد كسبت عن كل شهر دُفع فعلاً. إذا ألغى بعد 4 أشهر، فقد احتفظت بأربعة أشهر. عادل للطرفين." },
      { q: "هل هناك حد أقصى؟", a: "لا يوجد. اجلب أي عدد تريده من العملاء." },
    ],
  },
  ru: {
    dir: "ltr" as const,
    curSym: "$",
    monthlyPrice: 4.99, // Deep monthly, USD
    nav: "Главная",
    heroTitle: "Рекомендуйте Gadit. Получайте регулярный доход.",
    heroSub: "Каждый, кто зарегистрируется и оплатит по вашей персональной ссылке, приносит вам 25% регулярной комиссии в первый год и 10% пожизненно.",
    heroCta: "Присоединиться бесплатно",
    proofA: "25% в первый год",
    proofB: "10% пожизненно",
    proofC: "Выплаты ежемесячно",
    whyTitle: "Почему стоит рекомендовать Gadit",
    why: [
      { t: "Продукт, который любят родители", d: "Безопасный для детей словарь на 14 языках, с примерами, картинками и личной тетрадью. Легко рекомендовать то, что действительно помогает." },
      { t: "Настоящий регулярный доход", d: "Не разовая выплата. Каждый месяц, когда клиент платит, вы зарабатываете. Клиент, который остаётся на год, приносит вам целый год дохода." },
      { t: "Никаких рисков", d: "Присоединение бесплатное, без планов и минимумов. Поделитесь ссылкой и зарабатывайте." },
    ],
    howTitle: "Как это работает",
    how: [
      { t: "Зарегистрируйтесь", d: "Укажите имя и email и получите код и персональную ссылку за считаные секунды." },
      { t: "Поделитесь", d: "Отправьте свою ссылку своей аудитории. Каждый, кто перейдёт по ней, закрепляется за вами на 60 дней, даже если зарегистрируется позже." },
      { t: "Зарабатывайте", d: "Вы зарабатываете за каждый месяц, который клиент реально оплачивает. Средства открываются через 30 дней, выплаты ежемесячные." },
    ],
    ratesTitle: "Сколько вы зарабатываете",
    standardName: "Партнёр",
    standardRate: "25%",
    standardSub: "регулярно в первый год, затем 10% пожизненно с каждого клиента.",
    founderName: "Партнёр-основатель",
    founderRate: "30%",
    founderSub: "в первый год, затем 10% пожизненно. Ограниченное число мест для партнёров, способных приводить реальные объёмы.",
    calcTitle: "Калькулятор дохода",
    calcLead: "Сколько активных клиентов вы приведёте?",
    calcMonthly: "в месяц",
    calcYearly: "в первый год",
    calcNote: "Оценка на основе плана Deep и ставки 25%. Годовые, семейные и школьные клиенты повышают эту сумму.",
    formTitle: "Присоединиться к программе",
    formName: "Полное имя",
    formEmail: "Email",
    formAudience: "Где ваша аудитория? (необязательно)",
    formCta: "Получить мой партнёрский код",
    formSending: "Секунду…",
    successTitle: "Вы в программе 🎉",
    successBody: "Мы отправили ваш код и ссылку на почту. Вот они и здесь:",
    successLinkLabel: "Ваша персональная ссылка",
    successDash: "Открыть панель",
    errEmail: "Пожалуйста, введите корректный email.",
    errGeneric: "Что-то пошло не так. Пожалуйста, попробуйте снова.",
    faqTitle: "Частые вопросы",
    faq: [
      { q: "Нужно ли быть платящим клиентом?", a: "Нет. Присоединиться может каждый, бесплатно." },
      { q: "Когда я получу выплату?", a: "Каждая комиссия открывается через 30 дней после оплаты, а выплаты проходят раз в месяц." },
      { q: "Что если клиент отменит подписку?", a: "Вы заработали за каждый реально оплаченный месяц. Отмена после 4 месяцев означает, что 4 месяца остаются вашими. Честно для обеих сторон." },
      { q: "Есть ли предел?", a: "Нет. Приводите столько клиентов, сколько захотите." },
    ],
  },
  es: {
    dir: "ltr" as const,
    curSym: "$",
    monthlyPrice: 4.99, // Deep monthly, USD
    nav: "Inicio",
    heroTitle: "Recomienda Gadit. Gana ingresos recurrentes.",
    heroSub: "Cada persona que se registra y paga a través de tu enlace personal te genera un 25% de comisión recurrente el primer año, y un 10% de por vida.",
    heroCta: "Únete gratis",
    proofA: "25% el primer año",
    proofB: "10% de por vida",
    proofC: "Pago mensual",
    whyTitle: "Por qué recomendar Gadit",
    why: [
      { t: "Un producto que las familias adoran", d: "Un diccionario seguro para niños en 14 idiomas, con ejemplos, imágenes y un cuaderno personal. Es fácil recomendar algo que de verdad ayuda." },
      { t: "Ingresos recurrentes reales", d: "No es un pago único. Cada mes que un cliente paga, tú ganas. Un cliente que se queda un año vale un año entero para ti." },
      { t: "Cero riesgo", d: "Unirse es gratis, sin objetivos ni mínimos. Comparte un enlace y gana." },
    ],
    howTitle: "Cómo funciona",
    how: [
      { t: "Regístrate", d: "Introduce un nombre y un correo, y recibe un código y un enlace personal en segundos." },
      { t: "Comparte", d: "Envía tu enlace a tu audiencia. Todo el que haga clic queda asociado a ti durante 60 días, aunque se registre más tarde." },
      { t: "Gana", d: "Ganas por cada mes que el cliente paga de verdad. Se libera tras 30 días y se paga mensualmente." },
    ],
    ratesTitle: "Cuánto ganas",
    standardName: "Socio",
    standardRate: "25%",
    standardSub: "recurrente el primer año, y luego un 10% de por vida por cada cliente.",
    founderName: "Socio Fundador",
    founderRate: "30%",
    founderSub: "el primer año, y luego un 10% de por vida. Plazas limitadas para socios que puedan mover volumen real.",
    calcTitle: "Calculadora de ganancias",
    calcLead: "¿Cuántos clientes activos vas a traer?",
    calcMonthly: "al mes",
    calcYearly: "el primer año",
    calcNote: "Estimación basada en un plan Deep y una tasa del 25%. Los clientes anuales, Family y School la elevan aún más.",
    formTitle: "Únete al programa",
    formName: "Nombre completo",
    formEmail: "Correo electrónico",
    formAudience: "¿Dónde está tu audiencia? (opcional)",
    formCta: "Consigue mi código de socio",
    formSending: "Un momento…",
    successTitle: "Ya estás dentro 🎉",
    successBody: "Te enviamos tu código y enlace por correo. Aquí los tienes también:",
    successLinkLabel: "Tu enlace personal",
    successDash: "Abre tu panel",
    errEmail: "Introduce un correo electrónico válido.",
    errGeneric: "Algo salió mal. Inténtalo de nuevo.",
    faqTitle: "Preguntas frecuentes",
    faq: [
      { q: "¿Tengo que ser cliente de pago?", a: "No. Unirse está abierto a todo el mundo, gratis." },
      { q: "¿Cuándo cobro?", a: "Cada comisión se libera 30 días después del pago, y los pagos se realizan una vez al mes." },
      { q: "¿Qué pasa si un cliente cancela?", a: "Ganaste por cada mes realmente pagado. Si cancela tras 4 meses, conservas 4 meses. Justo para ambas partes." },
      { q: "¿Hay un límite?", a: "Ninguno. Trae tantos clientes como quieras." },
    ],
  },
  pt: {
    dir: "ltr" as const,
    curSym: "$",
    monthlyPrice: 4.99, // Deep monthly, USD
    nav: "Início",
    heroTitle: "Recomende o Gadit. Ganhe renda recorrente.",
    heroSub: "Cada pessoa que se cadastra e paga pelo seu link pessoal gera para você 25% de comissão recorrente no primeiro ano, e 10% para sempre.",
    heroCta: "Participar grátis",
    proofA: "25% no primeiro ano",
    proofB: "10% para sempre",
    proofC: "Pago todo mês",
    whyTitle: "Por que recomendar o Gadit",
    why: [
      { t: "Um produto que os pais amam", d: "Um dicionário seguro para crianças em 14 idiomas, com exemplos, imagens e um caderno pessoal. É fácil recomendar algo que realmente ajuda." },
      { t: "Renda recorrente de verdade", d: "Não é um pagamento único. A cada mês que o cliente paga, você ganha. Um cliente que fica um ano vale um ano inteiro para você." },
      { t: "Zero risco", d: "Participar é grátis, sem metas, sem mínimos. Compartilhe um link e ganhe." },
    ],
    howTitle: "Como funciona",
    how: [
      { t: "Cadastre-se", d: "Informe seu nome e e-mail, e receba um código + link pessoal em segundos." },
      { t: "Compartilhe", d: "Envie seu link para o seu público. Todo mundo que clica fica creditado a você por 60 dias, mesmo que se cadastre depois." },
      { t: "Ganhe", d: "Você ganha em cada mês que o cliente realmente paga. Libera após 30 dias e é pago todo mês." },
    ],
    ratesTitle: "Quanto você ganha",
    standardName: "Parceiro",
    standardRate: "25%",
    standardSub: "recorrente no primeiro ano, depois 10% para sempre em cada cliente.",
    founderName: "Parceiro Fundador",
    founderRate: "30%",
    founderSub: "no primeiro ano, depois 10% para sempre. Vagas limitadas para parceiros capazes de gerar volume de verdade.",
    calcTitle: "Calculadora de ganhos",
    calcLead: "Quantos clientes ativos você vai trazer?",
    calcMonthly: "por mês",
    calcYearly: "no primeiro ano",
    calcNote: "Estimativa baseada em um plano Deep e uma taxa de 25%. Clientes Anuais, Família e Escola elevam o valor.",
    formTitle: "Entre no programa",
    formName: "Nome completo",
    formEmail: "E-mail",
    formAudience: "Onde está o seu público? (opcional)",
    formCta: "Quero meu código de parceiro",
    formSending: "Um instante…",
    successTitle: "Você está dentro 🎉",
    successBody: "Enviamos seu código e link por e-mail. Aqui estão eles também:",
    successLinkLabel: "Seu link pessoal",
    successDash: "Abrir meu painel",
    errEmail: "Digite um e-mail válido.",
    errGeneric: "Algo deu errado. Tente novamente.",
    faqTitle: "Perguntas frequentes",
    faq: [
      { q: "Preciso ser um cliente pagante?", a: "Não. A participação é aberta a todos, de graça." },
      { q: "Quando eu recebo?", a: "Cada comissão libera 30 dias após o pagamento, e os repasses acontecem uma vez por mês." },
      { q: "E se um cliente cancelar?", a: "Você ganhou em cada mês que foi realmente pago. Se cancelar após 4 meses, você fica com 4 meses. Justo para os dois lados." },
      { q: "Existe um limite?", a: "Nenhum. Traga quantos clientes quiser." },
    ],
  },
  fr: {
    dir: "ltr" as const,
    curSym: "$",
    monthlyPrice: 4.99, // Deep monthly, USD
    nav: "Accueil",
    heroTitle: "Recommandez Gadit. Gagnez un revenu récurrent.",
    heroSub: "Toute personne qui s'inscrit et paie via votre lien personnel vous rapporte une commission récurrente de 25% la première année, et 10% à vie.",
    heroCta: "Rejoindre gratuitement",
    proofA: "25% la première année",
    proofB: "10% à vie",
    proofC: "Versé chaque mois",
    whyTitle: "Pourquoi recommander Gadit",
    why: [
      { t: "Un produit que les parents adorent", d: "Un dictionnaire sûr pour les enfants en 14 langues, avec des exemples, des images et un carnet personnel. Facile de recommander quelque chose qui aide vraiment." },
      { t: "Un revenu récurrent réel", d: "Pas un paiement unique. Chaque mois où un client paie, vous gagnez. Un client qui reste un an vous rapporte une année entière." },
      { t: "Aucun risque", d: "L'inscription est gratuite, sans objectifs, sans minimums. Partagez un lien, gagnez." },
    ],
    howTitle: "Comment ça marche",
    how: [
      { t: "Inscrivez-vous", d: "Saisissez un nom et un e-mail, et recevez un code et un lien personnel en quelques secondes." },
      { t: "Partagez", d: "Envoyez votre lien à votre audience. Toute personne qui clique vous est attribuée pendant 60 jours, même si elle s'inscrit plus tard." },
      { t: "Gagnez", d: "Vous gagnez sur chaque mois réellement payé par le client. Débloqué après 30 jours, versé chaque mois." },
    ],
    ratesTitle: "Combien vous gagnez",
    standardName: "Partenaire",
    standardRate: "25%",
    standardSub: "récurrent la première année, puis 10% à vie sur chaque client.",
    founderName: "Partenaire fondateur",
    founderRate: "30%",
    founderSub: "la première année, puis 10% à vie. Places limitées pour les partenaires capables de générer un vrai volume.",
    calcTitle: "Calculateur de gains",
    calcLead: "Combien de clients actifs allez-vous apporter ?",
    calcMonthly: "par mois",
    calcYearly: "la première année",
    calcNote: "Estimation basée sur un forfait Deep et un taux de 25%. Les clients annuels, Familles et Écoles font grimper le montant.",
    formTitle: "Rejoindre le programme",
    formName: "Nom complet",
    formEmail: "E-mail",
    formAudience: "Où se trouve votre audience ? (facultatif)",
    formCta: "Obtenir mon code partenaire",
    formSending: "Un instant…",
    successTitle: "C'est fait 🎉",
    successBody: "Nous vous avons envoyé votre code et votre lien par e-mail. Les voici également :",
    successLinkLabel: "Votre lien personnel",
    successDash: "Ouvrir mon tableau de bord",
    errEmail: "Veuillez saisir une adresse e-mail valide.",
    errGeneric: "Une erreur s'est produite. Veuillez réessayer.",
    faqTitle: "FAQ",
    faq: [
      { q: "Dois-je être un client payant ?", a: "Non. L'inscription est ouverte à tous, gratuitement." },
      { q: "Quand suis-je payé ?", a: "Chaque commission est débloquée 30 jours après le paiement, et les versements ont lieu une fois par mois." },
      { q: "Que se passe-t-il si un client annule ?", a: "Vous avez gagné sur chaque mois réellement payé. Une annulation après 4 mois, vous conservez 4 mois. Équitable des deux côtés." },
      { q: "Y a-t-il un plafond ?", a: "Aucun. Apportez autant de clients que vous le souhaitez." },
    ],
  },
  de: {
    dir: "ltr" as const,
    curSym: "$",
    monthlyPrice: 4.99, // Deep monthly, USD
    nav: "Startseite",
    heroTitle: "Empfiehl Gadit. Verdiene laufend mit.",
    heroSub: "Für jede Person, die sich über deinen persönlichen Link anmeldet und zahlt, erhältst du im ersten Jahr 25% wiederkehrende Provision und danach 10% ein Leben lang.",
    heroCta: "Kostenlos beitreten",
    proofA: "25% im ersten Jahr",
    proofB: "10% ein Leben lang",
    proofC: "Monatlich ausgezahlt",
    whyTitle: "Warum du Gadit empfehlen solltest",
    why: [
      { t: "Ein Produkt, das Eltern lieben", d: "Ein kindersicheres Wörterbuch in 14 Sprachen, mit Beispielen, Bildern und einem persönlichen Notizbuch. Etwas, das wirklich hilft, empfiehlt sich leicht." },
      { t: "Echtes wiederkehrendes Einkommen", d: "Keine einmalige Zahlung. In jedem Monat, in dem ein Kunde zahlt, verdienst du mit. Ein Kunde, der ein Jahr bleibt, ist für dich ein ganzes Jahr wert." },
      { t: "Null Risiko", d: "Der Beitritt ist kostenlos, ohne Ziele, ohne Mindestbeträge. Teile einen Link und verdiene." },
    ],
    howTitle: "So funktioniert es",
    how: [
      { t: "Anmelden", d: "Gib einen Namen und eine E-Mail-Adresse ein und erhalte innerhalb von Sekunden einen Code und einen persönlichen Link." },
      { t: "Teilen", d: "Schicke deinen Link an dein Publikum. Jeder, der klickt, wird dir 60 Tage lang zugerechnet, auch wenn er sich erst später anmeldet." },
      { t: "Verdienen", d: "Du verdienst in jedem Monat, in dem der Kunde tatsächlich zahlt. Die Freigabe erfolgt nach 30 Tagen, ausgezahlt wird monatlich." },
    ],
    ratesTitle: "So viel verdienst du",
    standardName: "Partner",
    standardRate: "25%",
    standardSub: "wiederkehrend im ersten Jahr, danach 10% ein Leben lang bei jedem Kunden.",
    founderName: "Gründungspartner",
    founderRate: "30%",
    founderSub: "im ersten Jahr, danach 10% ein Leben lang. Begrenzte Plätze für Partner, die echtes Volumen bewegen können.",
    calcTitle: "Verdienstrechner",
    calcLead: "Wie viele aktive Kunden wirst du bringen?",
    calcMonthly: "pro Monat",
    calcYearly: "im ersten Jahr",
    calcNote: "Schätzung auf Basis eines Deep-Tarifs und einer Rate von 25%. Jahres-, Familien- und Schulkunden erhöhen den Betrag.",
    formTitle: "Dem Programm beitreten",
    formName: "Vollständiger Name",
    formEmail: "E-Mail",
    formAudience: "Wo ist dein Publikum? (optional)",
    formCta: "Meinen Partner-Code erhalten",
    formSending: "Einen Moment…",
    successTitle: "Du bist dabei 🎉",
    successBody: "Wir haben dir deinen Code und Link per E-Mail geschickt. Hier sind sie auch:",
    successLinkLabel: "Dein persönlicher Link",
    successDash: "Dein Dashboard öffnen",
    errEmail: "Bitte gib eine gültige E-Mail-Adresse ein.",
    errGeneric: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
    faqTitle: "Häufige Fragen",
    faq: [
      { q: "Muss ich zahlender Kunde sein?", a: "Nein. Der Beitritt steht allen offen, kostenlos." },
      { q: "Wann werde ich bezahlt?", a: "Jede Provision wird 30 Tage nach der Zahlung freigegeben, und die Auszahlungen erfolgen einmal im Monat." },
      { q: "Was, wenn ein Kunde kündigt?", a: "Du hast in jedem tatsächlich gezahlten Monat verdient. Kündigt jemand nach 4 Monaten, behältst du 4 Monate. Fair für beide Seiten." },
      { q: "Gibt es eine Obergrenze?", a: "Keine. Bring so viele Kunden, wie du möchtest." },
    ],
  },
  cs: {
    dir: "ltr" as const,
    curSym: "$",
    monthlyPrice: 4.99, // Deep monthly, USD
    nav: "Domů",
    heroTitle: "Doporučte Gadit. Vydělávejte opakovaný příjem.",
    heroSub: "Každý, kdo se zaregistruje a zaplatí přes váš osobní odkaz, vám vynese 25% opakovanou provizi v prvním roce a 10% napořád.",
    heroCta: "Připojit se zdarma",
    proofA: "25% první rok",
    proofB: "10% napořád",
    proofC: "Vypláceno měsíčně",
    whyTitle: "Proč doporučovat Gadit",
    why: [
      { t: "Produkt, který rodiče milují", d: "Bezpečný dětský slovník ve 14 jazycích, s příklady, obrázky a osobním sešitem. Snadno se doporučuje něco, co opravdu pomáhá." },
      { t: "Skutečný opakovaný příjem", d: "Není to jednorázová výplata. Každý měsíc, kdy zákazník platí, vyděláváte. Zákazník, který zůstane rok, vám má hodnotu celého roku." },
      { t: "Nulové riziko", d: "Připojení je zdarma, žádné cíle, žádná minima. Sdílejte odkaz a vydělávejte." },
    ],
    howTitle: "Jak to funguje",
    how: [
      { t: "Zaregistrujte se", d: "Zadejte jméno a e-mail a během několika vteřin získáte kód a osobní odkaz." },
      { t: "Sdílejte", d: "Pošlete svůj odkaz svému publiku. Každý, kdo na něj klikne, je vám připsán na 60 dní, i když se zaregistruje později." },
      { t: "Vydělávejte", d: "Vyděláváte za každý měsíc, kdy zákazník skutečně zaplatí. Uvolňuje se po 30 dnech, vypláceno měsíčně." },
    ],
    ratesTitle: "Kolik vyděláte",
    standardName: "Partner",
    standardRate: "25%",
    standardSub: "opakovaně v prvním roce, poté 10% napořád u každého zákazníka.",
    founderName: "Zakládající partner",
    founderRate: "30%",
    founderSub: "v prvním roce, poté 10% napořád. Omezený počet míst pro partnery, kteří dokážou přinést skutečný objem.",
    calcTitle: "Kalkulačka výdělku",
    calcLead: "Kolik aktivních zákazníků přivedete?",
    calcMonthly: "za měsíc",
    calcYearly: "v prvním roce",
    calcNote: "Odhad vychází z plánu Deep a sazby 25%. Roční, rodinní a školní zákazníci ho posunou výše.",
    formTitle: "Připojte se k programu",
    formName: "Celé jméno",
    formEmail: "E-mail",
    formAudience: "Kde je vaše publikum? (nepovinné)",
    formCta: "Získat můj partnerský kód",
    formSending: "Momentík…",
    successTitle: "Jste v programu 🎉",
    successBody: "Poslali jsme vám e-mailem kód a odkaz. Zde jsou také:",
    successLinkLabel: "Váš osobní odkaz",
    successDash: "Otevřít nástěnku",
    errEmail: "Zadejte prosím platný e-mail.",
    errGeneric: "Něco se pokazilo. Zkuste to prosím znovu.",
    faqTitle: "Časté dotazy",
    faq: [
      { q: "Musím být platícím zákazníkem?", a: "Ne. Připojit se může každý, zdarma." },
      { q: "Kdy dostanu zaplaceno?", a: "Každá provize se uvolní 30 dní po platbě a výplaty probíhají jednou měsíčně." },
      { q: "Co když zákazník zruší předplatné?", a: "Vydělali jste za každý skutečně zaplacený měsíc. Zruší po 4 měsících, ponecháte si 4 měsíce. Férové pro obě strany." },
      { q: "Existuje strop?", a: "Žádný. Přiveďte tolik zákazníků, kolik chcete." },
    ],
  },
  sk: {
    dir: "ltr" as const,
    curSym: "$",
    monthlyPrice: 4.99, // Deep monthly, USD
    nav: "Domov",
    heroTitle: "Odporúčaj Gadit. Zarábaj opakovaný príjem.",
    heroSub: "Každý, kto sa cez tvoj osobný odkaz zaregistruje a zaplatí, ti prinesie 25% opakovanú províziu v prvom roku a 10% navždy.",
    heroCta: "Pridaj sa zadarmo",
    proofA: "25% prvý rok",
    proofB: "10% navždy",
    proofC: "Vyplácané mesačne",
    whyTitle: "Prečo odporúčať Gadit",
    why: [
      { t: "Produkt, ktorý rodičia milujú", d: "Bezpečný slovník pre deti v 14 jazykoch, s príkladmi, obrázkami a osobným zošitom. Ľahko sa odporúča niečo, čo naozaj pomáha." },
      { t: "Skutočný opakovaný príjem", d: "Nie jednorazová výplata. Každý mesiac, keď zákazník platí, zarábaš. Zákazník, ktorý ostane rok, má pre teba hodnotu celého roka." },
      { t: "Nulové riziko", d: "Pridanie je zadarmo, žiadne ciele, žiadne minimá. Zdieľaj odkaz, zarábaj." },
    ],
    howTitle: "Ako to funguje",
    how: [
      { t: "Zaregistruj sa", d: "Zadaj meno a e-mail a v priebehu sekúnd dostaneš kód a osobný odkaz." },
      { t: "Zdieľaj", d: "Pošli svoj odkaz svojmu publiku. Každý, kto naň klikne, je pripísaný tebe na 60 dní, aj keď sa zaregistruje neskôr." },
      { t: "Zarábaj", d: "Zarábaš za každý mesiac, keď zákazník skutočne platí. Uvoľňuje sa po 30 dňoch, vyplácané mesačne." },
    ],
    ratesTitle: "Koľko zarobíš",
    standardName: "Partner",
    standardRate: "25%",
    standardSub: "opakovane v prvom roku, potom 10% navždy z každého zákazníka.",
    founderName: "Zakladajúci partner",
    founderRate: "30%",
    founderSub: "v prvom roku, potom 10% navždy. Obmedzený počet miest pre partnerov, ktorí dokážu priniesť skutočný objem.",
    calcTitle: "Kalkulačka zárobkov",
    calcLead: "Koľko aktívnych zákazníkov privedieš?",
    calcMonthly: "za mesiac",
    calcYearly: "v prvom roku",
    calcNote: "Odhad na základe plánu Deep a sadzby 25%. Ročné, rodinné a školské plány to posúvajú vyššie.",
    formTitle: "Pridaj sa do programu",
    formName: "Celé meno",
    formEmail: "E-mail",
    formAudience: "Kde máš svoje publikum? (voliteľné)",
    formCta: "Získať môj partnerský kód",
    formSending: "Moment…",
    successTitle: "Si vnútri 🎉",
    successBody: "Poslali sme ti kód a odkaz e-mailom. Tu ich máš tiež:",
    successLinkLabel: "Tvoj osobný odkaz",
    successDash: "Otvoriť nástenku",
    errEmail: "Zadaj platný e-mail.",
    errGeneric: "Niečo sa pokazilo. Skús to znova.",
    faqTitle: "Časté otázky",
    faq: [
      { q: "Musím byť platiaci zákazník?", a: "Nie. Pridať sa môže každý, zadarmo." },
      { q: "Kedy dostanem zaplatené?", a: "Každá provízia sa uvoľní 30 dní po platbe a výplaty prebiehajú raz mesačne." },
      { q: "Čo ak zákazník zruší predplatné?", a: "Zarobil si za každý skutočne zaplatený mesiac. Ak zruší po 4 mesiacoch, ostali ti 4 mesiace. Férové pre obe strany." },
      { q: "Existuje strop?", a: "Žiadny. Priveď toľko zákazníkov, koľko chceš." },
    ],
  },
  it: {
    dir: "ltr" as const,
    curSym: "$",
    monthlyPrice: 4.99, // Deep monthly, USD
    nav: "Home",
    heroTitle: "Consiglia Gadit. Guadagna un reddito ricorrente.",
    heroSub: "Ogni persona che si iscrive e paga tramite il tuo link personale ti fa guadagnare il 25% di commissione ricorrente il primo anno, e il 10% a vita.",
    heroCta: "Iscriviti gratis",
    proofA: "25% il primo anno",
    proofB: "10% a vita",
    proofC: "Pagamento mensile",
    whyTitle: "Perché consigliare Gadit",
    why: [
      { t: "Un prodotto che i genitori amano", d: "Un dizionario sicuro per i bambini in 14 lingue, con esempi, immagini e un quaderno personale. È facile consigliare qualcosa che aiuta davvero." },
      { t: "Un vero reddito ricorrente", d: "Non un pagamento una tantum. Ogni mese in cui un cliente paga, tu guadagni. Un cliente che resta un anno vale per te un anno intero." },
      { t: "Zero rischi", d: "Iscriversi è gratis, senza obiettivi né minimi. Condividi un link e guadagna." },
    ],
    howTitle: "Come funziona",
    how: [
      { t: "Iscriviti", d: "Inserisci nome ed email, e ricevi un codice e un link personale in pochi secondi." },
      { t: "Condividi", d: "Invia il tuo link al tuo pubblico. Chiunque ci clicca viene attribuito a te per 60 giorni, anche se si iscrive più tardi." },
      { t: "Guadagna", d: "Guadagni per ogni mese in cui il cliente paga davvero. Si sblocca dopo 30 giorni, con pagamento mensile." },
    ],
    ratesTitle: "Quanto guadagni",
    standardName: "Partner",
    standardRate: "25%",
    standardSub: "ricorrente il primo anno, poi il 10% a vita su ogni cliente.",
    founderName: "Partner Founder",
    founderRate: "30%",
    founderSub: "il primo anno, poi il 10% a vita. Posti limitati per partner in grado di generare volumi reali.",
    calcTitle: "Calcolatore dei guadagni",
    calcLead: "Quanti clienti attivi porterai?",
    calcMonthly: "al mese",
    calcYearly: "il primo anno",
    calcNote: "Stima basata su un piano Deep e una commissione del 25%. I clienti annuali, Family e School la fanno salire.",
    formTitle: "Unisciti al programma",
    formName: "Nome completo",
    formEmail: "Email",
    formAudience: "Dov'è il tuo pubblico? (facoltativo)",
    formCta: "Ottieni il mio codice partner",
    formSending: "Un attimo…",
    successTitle: "Ci sei 🎉",
    successBody: "Ti abbiamo inviato via email il codice e il link. Eccoli anche qui:",
    successLinkLabel: "Il tuo link personale",
    successDash: "Apri la tua dashboard",
    errEmail: "Inserisci un'email valida.",
    errGeneric: "Qualcosa è andato storto. Riprova.",
    faqTitle: "Domande frequenti",
    faq: [
      { q: "Devo essere un cliente pagante?", a: "No. L'iscrizione è aperta a tutti, gratis." },
      { q: "Quando vengo pagato?", a: "Ogni commissione si sblocca 30 giorni dopo il pagamento, e i versamenti avvengono una volta al mese." },
      { q: "E se un cliente disdice?", a: "Hai guadagnato su ogni mese effettivamente pagato. Se disdice dopo 4 mesi, hai comunque tenuto 4 mesi. Equo per entrambi." },
      { q: "C'è un tetto massimo?", a: "Nessuno. Porta tutti i clienti che vuoi." },
    ],
  },
  ja: {
    dir: "ltr" as const,
    curSym: "$",
    monthlyPrice: 4.99, // Deep monthly, USD
    nav: "ホーム",
    heroTitle: "Gadit をおすすめして、継続収入を得ましょう。",
    heroSub: "あなた専用のリンクから登録して支払ったすべての方から、初年度は25%、その後は生涯10%の継続報酬が得られます。",
    heroCta: "無料で参加",
    proofA: "初年度25%",
    proofB: "生涯10%",
    proofC: "毎月お支払い",
    whyTitle: "Gadit をおすすめする理由",
    why: [
      { t: "保護者に愛される製品", d: "14言語対応の子どもに安全な辞書。例文、画像、そして自分だけのノートブック付き。本当に役立つものだから、自信を持っておすすめできます。" },
      { t: "本物の継続収入", d: "一度きりの報酬ではありません。お客様が支払う毎月、あなたに報酬が入ります。1年間続けてくれるお客様は、あなたにとって丸1年分の価値になります。" },
      { t: "リスクはゼロ", d: "参加は無料。ノルマも最低条件もありません。リンクをシェアして、報酬を得ましょう。" },
    ],
    howTitle: "仕組み",
    how: [
      { t: "登録する", d: "名前とメールアドレスを入力すれば、数秒でコードと専用リンクが手に入ります。" },
      { t: "シェアする", d: "リンクをあなたのフォロワーに送りましょう。クリックした方は60日間あなたの成果として記録され、後から登録しても対象になります。" },
      { t: "報酬を得る", d: "お客様が実際に支払った毎月ごとに報酬が発生します。30日後に確定し、毎月お支払いします。" },
    ],
    ratesTitle: "報酬の仕組み",
    standardName: "パートナー",
    standardRate: "25%",
    standardSub: "初年度は継続報酬、その後はすべてのお客様につき生涯10%。",
    founderName: "ファウンダーパートナー",
    founderRate: "30%",
    founderSub: "初年度、その後は生涯10%。大きな成果を上げられるパートナー向けの限定枠です。",
    calcTitle: "収益シミュレーター",
    calcLead: "何人のアクティブなお客様を紹介できますか？",
    calcMonthly: "毎月",
    calcYearly: "初年度",
    calcNote: "Deep プランと25%の報酬率に基づく概算です。年間、ファミリー、スクールのお客様なら、さらに高くなります。",
    formTitle: "プログラムに参加",
    formName: "氏名",
    formEmail: "メールアドレス",
    formAudience: "フォロワーはどこにいますか？（任意）",
    formCta: "パートナーコードを取得",
    formSending: "少々お待ちください…",
    successTitle: "参加完了 🎉",
    successBody: "コードとリンクをメールでお送りしました。こちらにも表示します。",
    successLinkLabel: "あなた専用のリンク",
    successDash: "ダッシュボードを開く",
    errEmail: "有効なメールアドレスを入力してください。",
    errGeneric: "問題が発生しました。もう一度お試しください。",
    faqTitle: "よくある質問",
    faq: [
      { q: "有料のお客様である必要はありますか？", a: "いいえ。参加は誰でも無料でできます。" },
      { q: "報酬はいつ支払われますか？", a: "各報酬は支払いから30日後に確定し、お支払いは月に一度行われます。" },
      { q: "お客様が解約したらどうなりますか？", a: "実際に支払われた毎月ごとに報酬を得ています。4か月後に解約されても、4か月分はあなたのものです。双方にとって公平です。" },
      { q: "上限はありますか？", a: "ありません。好きなだけお客様を紹介してください。" },
    ],
  },
  hi: {
    dir: "ltr" as const,
    curSym: "$",
    monthlyPrice: 4.99, // Deep monthly, USD
    nav: "होम",
    heroTitle: "Gadit की सिफारिश करें। हर महीने कमाई पाएं।",
    heroSub: "जो भी आपके निजी लिंक से साइन अप करके भुगतान करता है, उससे आपको पहले साल में 25% रेकरिंग कमीशन मिलता है, और जीवन भर 10%।",
    heroCta: "मुफ्त में जुड़ें",
    proofA: "पहले साल 25%",
    proofB: "जीवन भर 10%",
    proofC: "हर महीने भुगतान",
    whyTitle: "Gadit की सिफारिश क्यों करें",
    why: [
      { t: "एक प्रोडक्ट जो माता-पिता को पसंद है", d: "14 भाषाओं में एक बच्चों के लिए सुरक्षित शब्दकोश, जिसमें उदाहरण, तस्वीरें और एक निजी नोटबुक है। जो सचमुच मदद करता है उसकी सिफारिश करना आसान है।" },
      { t: "असली रेकरिंग कमाई", d: "एक बार का भुगतान नहीं। हर महीने जब ग्राहक भुगतान करता है, आप कमाते हैं। जो ग्राहक एक साल रुकता है वह आपके लिए पूरे साल के बराबर है।" },
      { t: "शून्य जोखिम", d: "जुड़ना मुफ्त है, कोई टारगेट नहीं, कोई न्यूनतम नहीं। एक लिंक शेयर करें, कमाएं।" },
    ],
    howTitle: "यह कैसे काम करता है",
    how: [
      { t: "साइन अप करें", d: "एक नाम और ईमेल दर्ज करें, और सेकंडों में एक कोड और निजी लिंक पाएं।" },
      { t: "शेयर करें", d: "अपना लिंक अपने दर्शकों को भेजें। जो भी क्लिक करता है वह 60 दिनों तक आपके नाम जुड़ जाता है, भले ही वे बाद में साइन अप करें।" },
      { t: "कमाएं", d: "जिस भी महीने ग्राहक सचमुच भुगतान करता है, आप कमाते हैं। 30 दिनों के बाद रिलीज होता है, हर महीने भुगतान मिलता है।" },
    ],
    ratesTitle: "आप कितना कमाते हैं",
    standardName: "पार्टनर",
    standardRate: "25%",
    standardSub: "पहले साल में रेकरिंग, फिर हर ग्राहक पर जीवन भर 10%।",
    founderName: "फाउंडर पार्टनर",
    founderRate: "30%",
    founderSub: "पहले साल में, फिर जीवन भर 10%। उन पार्टनर्स के लिए सीमित जगहें जो असली वॉल्यूम ला सकते हैं।",
    calcTitle: "कमाई कैलकुलेटर",
    calcLead: "आप कितने सक्रिय ग्राहक लाएंगे?",
    calcMonthly: "प्रति माह",
    calcYearly: "पहले साल में",
    calcNote: "यह अनुमान एक Deep प्लान और 25% रेट पर आधारित है। सालाना, Family और School ग्राहक इसे और ऊपर ले जाते हैं।",
    formTitle: "प्रोग्राम में जुड़ें",
    formName: "पूरा नाम",
    formEmail: "ईमेल",
    formAudience: "आपके दर्शक कहां हैं? (वैकल्पिक)",
    formCta: "मेरा पार्टनर कोड पाएं",
    formSending: "एक पल…",
    successTitle: "आप जुड़ गए 🎉",
    successBody: "हमने आपका कोड और लिंक ईमेल कर दिया। वे यहां भी हैं:",
    successLinkLabel: "आपका निजी लिंक",
    successDash: "अपना डैशबोर्ड खोलें",
    errEmail: "कृपया एक मान्य ईमेल दर्ज करें।",
    errGeneric: "कुछ गड़बड़ हो गई। कृपया फिर से कोशिश करें।",
    faqTitle: "अक्सर पूछे जाने वाले सवाल",
    faq: [
      { q: "क्या मुझे भुगतान करने वाला ग्राहक होना जरूरी है?", a: "नहीं। जुड़ना सभी के लिए खुला है, मुफ्त।" },
      { q: "मुझे भुगतान कब मिलता है?", a: "हर कमीशन भुगतान के 30 दिन बाद रिलीज होता है, और भुगतान महीने में एक बार होता है।" },
      { q: "अगर कोई ग्राहक रद्द कर दे तो?", a: "आपने हर उस महीने पर कमाया जो सचमुच भुगतान किया गया। 4 महीने बाद रद्द करें, तो आपने 4 महीने रखे। दोनों तरफ न्यायसंगत।" },
      { q: "क्या कोई सीमा है?", a: "कोई नहीं। जितने चाहें उतने ग्राहक लाएं।" },
    ],
  },
  am: {
    dir: "ltr" as const,
    curSym: "$",
    monthlyPrice: 4.99, // Deep monthly, USD
    nav: "መነሻ",
    heroTitle: "Gadit ን ይምከሩ። ተደጋጋሚ ገቢ ያግኙ።",
    heroSub: "በግል አገናኝዎ በኩል ተመዝግቦ የሚከፍል እያንዳንዱ ሰው በመጀመሪያው ዓመት 25% ተደጋጋሚ ኮሚሽን፣ ለዘላለም ደግሞ 10% ያስገኝልዎታል።",
    heroCta: "በነጻ ይቀላቀሉ",
    proofA: "25% በመጀመሪያው ዓመት",
    proofB: "10% ለዘላለም",
    proofC: "በየወሩ ይከፈላል",
    whyTitle: "Gadit ን ለምን ይመክራሉ",
    why: [
      { t: "ወላጆች የሚወዱት ምርት", d: "በ14 ቋንቋዎች የቀረበ ለልጆች ደኅንነቱ የተጠበቀ መዝገበ ቃላት፣ ከምሳሌዎች፣ ስዕሎች እና ከግል ማስታወሻ ደብተር ጋር። በእውነት የሚጠቅም ነገር መምከር ቀላል ነው።" },
      { t: "እውነተኛ ተደጋጋሚ ገቢ", d: "የአንድ ጊዜ ክፍያ አይደለም። ደንበኛው በከፈለ ቁጥር በየወሩ ያገኛሉ። አንድ ዓመት የሚቆይ ደንበኛ ለእርስዎ ሙሉ ዓመት ዋጋ አለው።" },
      { t: "ምንም ስጋት የለም", d: "መቀላቀል ነጻ ነው፣ ምንም ኮታ የለም፣ ምንም ዝቅተኛ መጠን የለም። አገናኝ ያካፍሉ፣ ያግኙ።" },
    ],
    howTitle: "እንዴት እንደሚሰራ",
    how: [
      { t: "ይመዝገቡ", d: "ስም እና ኢሜይል ያስገቡ፣ በሰከንዶች ውስጥ ኮድ እና የግል አገናኝ ያግኙ።" },
      { t: "ያካፍሉ", d: "አገናኝዎን ለተከታዮችዎ ይላኩ። የሚጫን እያንዳንዱ ሰው ኋላ ላይ ቢመዘገብም እንኳ ለ60 ቀናት ለእርስዎ ይመዘገባል።" },
      { t: "ያግኙ", d: "ደንበኛው በእውነት በከፈለ በእያንዳንዱ ወር ያገኛሉ። ከ30 ቀናት በኋላ ይለቀቃል፣ በየወሩ ይከፈላል።" },
    ],
    ratesTitle: "ምን ያህል ያገኛሉ",
    standardName: "አጋር",
    standardRate: "25%",
    standardSub: "በመጀመሪያው ዓመት ተደጋጋሚ፣ ከዚያም በእያንዳንዱ ደንበኛ ላይ ለዘላለም 10%።",
    founderName: "መስራች አጋር",
    founderRate: "30%",
    founderSub: "በመጀመሪያው ዓመት፣ ከዚያም ለዘላለም 10%። እውነተኛ መጠን ማንቀሳቀስ ለሚችሉ አጋሮች የተወሰኑ ቦታዎች።",
    calcTitle: "የገቢ ማስያ",
    calcLead: "ስንት ንቁ ደንበኞችን ያመጣሉ?",
    calcMonthly: "በየወሩ",
    calcYearly: "በመጀመሪያው ዓመት",
    calcNote: "ግምቱ በ Deep እቅድ እና በ25% ተመን ላይ የተመሠረተ ነው። ዓመታዊ፣ የቤተሰብ እና የትምህርት ቤት ደንበኞች ከዚህ ከፍ ያደርጉታል።",
    formTitle: "ፕሮግራሙን ይቀላቀሉ",
    formName: "ሙሉ ስም",
    formEmail: "ኢሜይል",
    formAudience: "ተከታዮችዎ የት ናቸው? (አማራጭ)",
    formCta: "የአጋር ኮዴን ያግኙ",
    formSending: "አንድ ሰከንድ…",
    successTitle: "ገብተዋል 🎉",
    successBody: "ኮድዎን እና አገናኝዎን በኢሜይል ልከንልዎታል። እነሆ እዚህም አሉ:",
    successLinkLabel: "የግል አገናኝዎ",
    successDash: "ዳሽቦርድዎን ይክፈቱ",
    errEmail: "እባክዎ ትክክለኛ ኢሜይል ያስገቡ።",
    errGeneric: "የሆነ ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
    faqTitle: "በተደጋጋሚ የሚጠየቁ ጥያቄዎች",
    faq: [
      { q: "የሚከፍል ደንበኛ መሆን አለብኝ?", a: "አይ። መቀላቀል ለሁሉም ክፍት ነው፣ በነጻ።" },
      { q: "መቼ ነው የምከፈለው?", a: "እያንዳንዱ ኮሚሽን ከክፍያው 30 ቀናት በኋላ ይለቀቃል፣ ክፍያዎችም በወር አንድ ጊዜ ይካሄዳሉ።" },
      { q: "ደንበኛ ቢሰርዝ ምን ይሆናል?", a: "በእውነት በተከፈለ በእያንዳንዱ ወር አግኝተዋል። ከ4 ወራት በኋላ ቢሰርዝ፣ 4 ወራትን አስቀርተዋል። በሁለቱም በኩል ፍትሃዊ ነው።" },
      { q: "ገደብ አለ?", a: "የለም። የፈለጉትን ያህል ደንበኞች ያምጡ።" },
    ],
  },
};

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function PartnersClient() {
  const { lang } = useLang();
  const href = useHref();
  const t = COPY[(lang in COPY ? lang : "en") as keyof typeof COPY];
  const dir = t.dir;

  const [count, setCount] = useState(20);
  const monthly = useMemo(() => count * t.monthlyPrice * 0.25, [count, t.monthlyPrice]);
  const yearly = monthly * 12;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [audience, setAudience] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [result, setResult] = useState<{ code: string; dashboardUrl: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEmail(email)) {
      setErrMsg(t.errEmail);
      setState("error");
      return;
    }
    setState("sending");
    setErrMsg("");
    try {
      const res = await fetch("/api/partner/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, audience, lang }),
      });
      const d = await res.json();
      if (!res.ok || !d.code) {
        setErrMsg(t.errGeneric);
        setState("error");
        return;
      }
      setResult({ code: d.code, dashboardUrl: d.dashboardUrl });
      setState("done");
    } catch {
      setErrMsg(t.errGeneric);
      setState("error");
    }
  }

  const money = (n: number) => `${t.curSym}${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const link = result ? `https://www.gadit.app/?ref=${result.code}` : "";

  return (
    <div dir={dir} style={S.page}>
      {/* Top bar */}
      <header style={S.topbar}>
        <Link href={href("/")} style={S.wordmark} translate="no">Gadit</Link>
        <Link href={href("/")} style={S.navLink}>{t.nav}</Link>
      </header>

      {/* Hero */}
      <section style={S.hero}>
        <h1 style={S.heroTitle}>{t.heroTitle}</h1>
        <p style={S.heroSub}>{t.heroSub}</p>
        <a href="#join" style={S.heroCta}>{t.heroCta}</a>
        <div style={S.proofRow}>
          <span style={S.proof}>{t.proofA}</span>
          <span style={S.proofDot}>·</span>
          <span style={S.proof}>{t.proofB}</span>
          <span style={S.proofDot}>·</span>
          <span style={S.proof}>{t.proofC}</span>
        </div>
      </section>

      {/* Why */}
      <section style={S.section}>
        <h2 style={S.h2}>{t.whyTitle}</h2>
        <div style={S.grid3}>
          {t.why.map((w, i) => (
            <div key={i} style={S.featCard}>
              <div style={S.featTitle}>{w.t}</div>
              <div style={S.featBody}>{w.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How */}
      <section style={S.section}>
        <h2 style={S.h2}>{t.howTitle}</h2>
        <div style={S.grid3}>
          {t.how.map((h, i) => (
            <div key={i} style={S.stepCard}>
              <div style={S.stepNum}>{i + 1}</div>
              <div style={S.featTitle}>{h.t}</div>
              <div style={S.featBody}>{h.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Rates */}
      <section style={S.section}>
        <h2 style={S.h2}>{t.ratesTitle}</h2>
        <div style={S.rateGrid}>
          <div style={S.rateCard}>
            <div style={S.rateName}>{t.standardName}</div>
            <div style={S.rateBig}>{t.standardRate}</div>
            <div style={S.rateSub}>{t.standardSub}</div>
          </div>
          <div style={{ ...S.rateCard, ...S.rateCardFounder }}>
            <div style={{ ...S.rateName, color: "#6D28D9" }}>{t.founderName}</div>
            <div style={{ ...S.rateBig, color: "#6D28D9" }}>{t.founderRate}</div>
            <div style={S.rateSub}>{t.founderSub}</div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section style={S.section}>
        <h2 style={S.h2}>{t.calcTitle}</h2>
        <div style={S.calcCard}>
          <label style={S.calcLead}>{t.calcLead}</label>
          <input
            type="range" min={1} max={200} value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={S.slider}
          />
          <div style={S.calcCount}>{count}</div>
          <div style={S.calcResults}>
            <div style={S.calcCell}>
              <div style={S.calcVal} dir="ltr">{money(monthly)}</div>
              <div style={S.calcLabel}>{t.calcMonthly}</div>
            </div>
            <div style={S.calcCell}>
              <div style={{ ...S.calcVal, color: "#0EA5A5" }} dir="ltr">{money(yearly)}</div>
              <div style={S.calcLabel}>{t.calcYearly}</div>
            </div>
          </div>
          <div style={S.calcNote}>{t.calcNote}</div>
        </div>
      </section>

      {/* Signup */}
      <section id="join" style={S.section}>
        <h2 style={S.h2}>{t.formTitle}</h2>
        <div style={S.formCard}>
          {state === "done" && result ? (
            <div style={{ textAlign: "center" }}>
              <div style={S.successTitle}>{t.successTitle}</div>
              <p style={S.successBody}>{t.successBody}</p>
              <div style={S.successLinkLabel}>{t.successLinkLabel}</div>
              <div style={S.successLink} dir="ltr">{link}</div>
              <a href={result.dashboardUrl} style={S.heroCta}>{t.successDash}</a>
            </div>
          ) : (
            <form onSubmit={submit}>
              <input style={S.input} placeholder={t.formName} value={name} onChange={(e) => setName(e.target.value)} />
              <input style={S.input} type="email" placeholder={t.formEmail} value={email} onChange={(e) => setEmail(e.target.value)} />
              <textarea style={{ ...S.input, minHeight: 72, resize: "vertical" as const }} placeholder={t.formAudience} value={audience} onChange={(e) => setAudience(e.target.value)} />
              {state === "error" && <div style={S.formErr}>{errMsg}</div>}
              <button type="submit" style={S.formCta} disabled={state === "sending"}>
                {state === "sending" ? t.formSending : t.formCta}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section style={S.section}>
        <h2 style={S.h2}>{t.faqTitle}</h2>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {t.faq.map((f, i) => (
            <div key={i} style={S.faqItem}>
              <div style={S.faqQ}>{f.q}</div>
              <div style={S.faqA}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      <footer style={S.footer}>
        <Link href={href("/")} style={S.navLink} translate="no">Gadit</Link>
      </footer>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { background: "#F6F8FA", color: "#111827", fontFamily: "var(--font-rubik, -apple-system, Segoe UI, Roboto, sans-serif)", minHeight: "100dvh" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", maxWidth: 960, margin: "0 auto" },
  wordmark: { fontSize: 22, fontWeight: 800, color: "#0EA5A5", textDecoration: "none" },
  navLink: { color: "#6B7280", textDecoration: "none", fontSize: 14, fontWeight: 600 },
  hero: { textAlign: "center", padding: "48px 20px 40px", maxWidth: 760, margin: "0 auto" },
  heroTitle: { fontSize: 40, lineHeight: 1.15, fontWeight: 800, margin: "0 0 16px" },
  heroSub: { fontSize: 18, lineHeight: 1.6, color: "#4B5563", margin: "0 auto 28px", maxWidth: 620 },
  heroCta: { display: "inline-block", background: "#0EA5A5", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 16, padding: "14px 32px", borderRadius: 12, boxShadow: "0 6px 20px rgba(14,165,165,0.28)" },
  proofRow: { display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 22, flexWrap: "wrap" },
  proof: { fontSize: 14, fontWeight: 700, color: "#0b7d7d" },
  proofDot: { color: "#CBD5E1" },
  section: { maxWidth: 960, margin: "0 auto", padding: "36px 20px" },
  h2: { fontSize: 26, fontWeight: 800, textAlign: "center", margin: "0 0 28px" },
  grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 },
  featCard: { background: "#fff", border: "1px solid #EAECEF", borderRadius: 16, padding: 22 },
  stepCard: { background: "#fff", border: "1px solid #EAECEF", borderRadius: 16, padding: 22, position: "relative" },
  stepNum: { width: 34, height: 34, borderRadius: 999, background: "rgba(14,165,165,0.12)", color: "#0b7d7d", fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  featTitle: { fontSize: 17, fontWeight: 700, marginBottom: 8 },
  featBody: { fontSize: 14.5, lineHeight: 1.65, color: "#4B5563" },
  rateGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, maxWidth: 720, margin: "0 auto" },
  rateCard: { background: "#fff", border: "1px solid #EAECEF", borderRadius: 18, padding: 28, textAlign: "center" },
  rateCardFounder: { border: "1.5px solid rgba(124,58,237,0.35)", background: "rgba(124,58,237,0.03)" },
  rateName: { fontSize: 15, fontWeight: 700, color: "#0b7d7d", marginBottom: 6 },
  rateBig: { fontSize: 46, fontWeight: 800, color: "#0EA5A5", lineHeight: 1 },
  rateSub: { fontSize: 14.5, lineHeight: 1.6, color: "#4B5563", marginTop: 12 },
  calcCard: { background: "#fff", border: "1px solid #EAECEF", borderRadius: 18, padding: 28, maxWidth: 560, margin: "0 auto", textAlign: "center" },
  calcLead: { display: "block", fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 16 },
  slider: { width: "100%", accentColor: "#0EA5A5" },
  calcCount: { fontSize: 32, fontWeight: 800, color: "#111827", margin: "8px 0 20px" },
  calcResults: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  calcCell: { background: "#F6F8FA", borderRadius: 12, padding: "16px 8px" },
  calcVal: { fontSize: 26, fontWeight: 800 },
  calcLabel: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  calcNote: { fontSize: 12.5, color: "#9CA3AF", marginTop: 16, lineHeight: 1.5 },
  formCard: { background: "#fff", border: "1px solid #EAECEF", borderRadius: 18, padding: 28, maxWidth: 480, margin: "0 auto" },
  input: { width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 15, marginBottom: 12, fontFamily: "inherit", outline: "none" },
  formErr: { color: "#991B1B", fontSize: 13.5, marginBottom: 12 },
  formCta: { width: "100%", background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer" },
  successTitle: { fontSize: 24, fontWeight: 800, marginBottom: 8 },
  successBody: { fontSize: 15, color: "#4B5563", marginBottom: 18 },
  successLinkLabel: { fontSize: 13, color: "#6B7280", marginBottom: 6 },
  successLink: { fontSize: 17, fontWeight: 700, color: "#0EA5A5", wordBreak: "break-all", marginBottom: 20 },
  faqItem: { borderBottom: "1px solid #EAECEF", padding: "16px 0" },
  faqQ: { fontSize: 16, fontWeight: 700, marginBottom: 6 },
  faqA: { fontSize: 14.5, lineHeight: 1.6, color: "#4B5563" },
  footer: { textAlign: "center", padding: "40px 20px 56px" },
};

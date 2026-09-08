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
  payoutEmail?: string | null;
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
  tabHome: string; tabMarketing: string; tabPayments: string;
  howEarnTitle: string;
  mktMsgTitle: string; mktMsgHint: string; tmpl1: string; tmpl2: string; tmpl3: string;
  copyMsg: string; copiedMsg: string;
  creativesTitle: string; creativesHint: string; download: string;
  payoutEmailTitle: string; payoutEmailHint: string; payoutEmailPh: string;
  saveBtn: string; savedBtn: string; emailInvalid: string;
}> = {
  en: {
    statusActive: "Active", statusPending: "Pending", statusSuspended: "Paused",
    ofClicks: "of clicks", ofSignups: "of signups",
    payoutTitle: "Payout", payoutOf: "of", nextPayout: "Next payout", payoutReady: "Ready to pay out",
    refTitle: "Who signed up through you", refCustomer: "Customer", refJoined: "Joined", refCommission: "Commission",
    stPending: "Pending", stAvailable: "Available", stPaid: "Paid", refEmpty: "No paying referrals yet. Share your link to get your first.",
    greetMorning: "Good morning", greetNoon: "Good afternoon", greetEvening: "Good evening", greetNight: "Good night",
    linkIndividuals: "Individuals",
    tabHome: "Home", tabMarketing: "Marketing", tabPayments: "Payouts",
    howEarnTitle: "How you earn",
    mktMsgTitle: "Ready-to-send messages", mktMsgHint: "Copy, paste and share. Your personal link is already inside.",
    tmpl1: "I found a tool that explains every word to kids in a language they understand and helps them keep up with schoolwork. Worth a look: {link}",
    tmpl2: "For a child who struggles to understand words while reading: Gadit explains every word all the way through, with examples and a picture. Link: {link}",
    tmpl3: "Gadit is a dictionary that explains every word in a child's own language and builds their vocabulary. 14 days free: {link}",
    copyMsg: "Copy message", copiedMsg: "Copied ✓",
    creativesTitle: "Images to share", creativesHint: "Download and post on social, or send to your group.",
    download: "Download",
    payoutEmailTitle: "PayPal for payouts", payoutEmailHint: "Where we send your commission. You can change it anytime.",
    payoutEmailPh: "you@example.com", saveBtn: "Save", savedBtn: "Saved ✓", emailInvalid: "That doesn't look like a valid email.",
  },
  he: {
    statusActive: "פעיל", statusPending: "ממתין", statusSuspended: "מושהה",
    ofClicks: "מהקליקים", ofSignups: "מההרשמות",
    payoutTitle: "תשלום", payoutOf: "מתוך", nextPayout: "תשלום הבא", payoutReady: "מוכן לתשלום",
    refTitle: "מי נרשם דרכך", refCustomer: "לקוח", refJoined: "הצטרף", refCommission: "עמלה",
    stPending: "בהמתנה", stAvailable: "זמין", stPaid: "שולם", refEmpty: "עדיין אין הפניות משלמות. אפשר לשתף את הקישור כדי לקבל את הראשונה.",
    greetMorning: "בוקר טוב", greetNoon: "צהריים טובים", greetEvening: "ערב טוב", greetNight: "לילה טוב",
    linkIndividuals: "ליחידים",
    tabHome: "לוח בית", tabMarketing: "חומרים שיווקיים", tabPayments: "תשלומים",
    howEarnTitle: "איך מרוויחים",
    mktMsgTitle: "הודעות מוכנות לשליחה", mktMsgHint: "להעתיק, להדביק ולשתף. הקישור האישי שלך כבר בפנים.",
    tmpl1: "מצאתי כלי שמסביר כל מילה לילדים בשפה שהם מבינים ועוזר להם עם הלימודים. שווה להיכנס: {link}",
    tmpl2: "לילד שמתקשה להבין מילים בקריאה: Gadit מסביר כל מילה עד הסוף, עם דוגמאות ותמונה. קישור: {link}",
    tmpl3: "Gadit הוא מילון שמסביר כל מילה בשפה של הילד ובונה אוצר מילים. יש 14 ימי ניסיון חינם: {link}",
    copyMsg: "העתקת ההודעה", copiedMsg: "הועתק ✓",
    creativesTitle: "תמונות לשיתוף", creativesHint: "אפשר להוריד ולפרסם ברשתות, או לשלוח לקבוצה.",
    download: "הורדה",
    payoutEmailTitle: "PayPal לתשלום", payoutEmailHint: "לכאן נשלח את העמלה שלך. אפשר לשנות בכל רגע.",
    payoutEmailPh: "you@example.com", saveBtn: "שמירה", savedBtn: "נשמר ✓", emailInvalid: "זה לא נראה כמו אימייל תקין.",
  },
  ar: { statusActive: "نشط", statusPending: "قيد الانتظار", statusSuspended: "متوقف مؤقتاً", ofClicks: "من النقرات", ofSignups: "من التسجيلات", payoutTitle: "الدفعة", payoutOf: "من", nextPayout: "الدفعة القادمة", payoutReady: "جاهزة للدفع", refTitle: "من سجّل عن طريقك", refCustomer: "العميل", refJoined: "انضم", refCommission: "العمولة", stPending: "قيد الانتظار", stAvailable: "متاح", stPaid: "مدفوع", refEmpty: "لا توجد إحالات مدفوعة بعد. شارك رابطك لتحصل على أول إحالة.", greetMorning: "صباح الخير", greetNoon: "طاب يومك", greetEvening: "مساء الخير", greetNight: "طابت ليلتك", linkIndividuals: "الأفراد", tabHome: "الرئيسية", tabMarketing: "التسويق", tabPayments: "الدفعات", howEarnTitle: "كيف تربح", mktMsgTitle: "رسائل جاهزة للإرسال", mktMsgHint: "انسخ، الصق، وشارك. رابطك الشخصي موجود بالفعل بداخلها.", tmpl1: "وجدت أداة تشرح كل كلمة للأطفال بلغة يفهمونها وتساعدهم على مواكبة دروسهم. تستحق النظر: {link}", tmpl2: "لطفل يجد صعوبة في فهم الكلمات أثناء القراءة: Gadit يشرح كل كلمة حتى النهاية، مع أمثلة وصورة. الرابط: {link}", tmpl3: "Gadit قاموس يشرح كل كلمة بلغة الطفل نفسها ويبني حصيلته اللغوية. 14 يوماً مجاناً: {link}", copyMsg: "نسخ الرسالة", copiedMsg: "تم النسخ ✓", creativesTitle: "صور للمشاركة", creativesHint: "نزّلها وانشرها على وسائل التواصل، أو أرسلها إلى مجموعتك.", download: "تنزيل", payoutEmailTitle: "PayPal للدفعات", payoutEmailHint: "المكان الذي نرسل إليه عمولتك. يمكنك تغييره في أي وقت.", payoutEmailPh: "you@example.com", saveBtn: "حفظ", savedBtn: "تم الحفظ ✓", emailInvalid: "هذا لا يبدو بريداً إلكترونياً صالحاً." },
  ru: { statusActive: "Активен", statusPending: "В ожидании", statusSuspended: "Приостановлено", ofClicks: "от кликов", ofSignups: "от регистраций", payoutTitle: "Выплата", payoutOf: "из", nextPayout: "Следующая выплата", payoutReady: "Готово к выплате", refTitle: "Кто зарегистрировался по вашей ссылке", refCustomer: "Клиент", refJoined: "Присоединился", refCommission: "Комиссия", stPending: "В ожидании", stAvailable: "Доступно", stPaid: "Выплачено", refEmpty: "Пока нет платных рефералов. Поделитесь ссылкой, чтобы получить первого.", greetMorning: "Доброе утро", greetNoon: "Добрый день", greetEvening: "Добрый вечер", greetNight: "Доброй ночи", linkIndividuals: "Частные лица", tabHome: "Главная", tabMarketing: "Маркетинг", tabPayments: "Выплаты", howEarnTitle: "Как вы зарабатываете", mktMsgTitle: "Готовые сообщения", mktMsgHint: "Скопируйте, вставьте и поделитесь. Ваша личная ссылка уже внутри.", tmpl1: "Я нашёл инструмент, который объясняет детям каждое слово на понятном им языке и помогает не отставать в учёбе. Стоит взглянуть: {link}", tmpl2: "Для ребёнка, которому трудно понимать слова при чтении: Gadit объясняет каждое слово до конца, с примерами и картинкой. Ссылка: {link}", tmpl3: "Gadit это словарь, который объясняет каждое слово на родном языке ребёнка и расширяет его словарный запас. 14 дней бесплатно: {link}", copyMsg: "Копировать сообщение", copiedMsg: "Скопировано ✓", creativesTitle: "Изображения для публикации", creativesHint: "Скачайте и опубликуйте в соцсетях или отправьте в свою группу.", download: "Скачать", payoutEmailTitle: "PayPal для выплат", payoutEmailHint: "Куда мы отправляем вашу комиссию. Вы можете изменить это в любое время.", payoutEmailPh: "you@example.com", saveBtn: "Сохранить", savedBtn: "Сохранено ✓", emailInvalid: "Это не похоже на действующий адрес электронной почты." },
  es: { statusActive: "Activo", statusPending: "Pendiente", statusSuspended: "Pausado", ofClicks: "de los clics", ofSignups: "de los registros", payoutTitle: "Pago", payoutOf: "de", nextPayout: "Próximo pago", payoutReady: "Listo para pagar", refTitle: "Quién se registró a través de ti", refCustomer: "Cliente", refJoined: "Se unió", refCommission: "Comisión", stPending: "Pendiente", stAvailable: "Disponible", stPaid: "Pagado", refEmpty: "Aún no tienes referidos de pago. Comparte tu enlace para conseguir el primero.", greetMorning: "Buenos días", greetNoon: "Buenas tardes", greetEvening: "Buenas noches", greetNight: "Buenas noches", linkIndividuals: "Particulares", tabHome: "Inicio", tabMarketing: "Marketing", tabPayments: "Pagos", howEarnTitle: "Cómo ganas", mktMsgTitle: "Mensajes listos para enviar", mktMsgHint: "Copia, pega y comparte. Tu enlace personal ya está dentro.", tmpl1: "Encontré una herramienta que explica cada palabra a los niños en un idioma que entienden y les ayuda a seguir el ritmo del colegio. Vale la pena echarle un vistazo: {link}", tmpl2: "Para un niño al que le cuesta entender las palabras mientras lee: Gadit explica cada palabra hasta el final, con ejemplos y una imagen. Enlace: {link}", tmpl3: "Gadit es un diccionario que explica cada palabra en el idioma del propio niño y amplía su vocabulario. 14 días gratis: {link}", copyMsg: "Copiar mensaje", copiedMsg: "Copiado ✓", creativesTitle: "Imágenes para compartir", creativesHint: "Descárgalas y publícalas en redes, o envíalas a tu grupo.", download: "Descargar", payoutEmailTitle: "PayPal para los pagos", payoutEmailHint: "Adónde enviamos tu comisión. Puedes cambiarlo cuando quieras.", payoutEmailPh: "you@example.com", saveBtn: "Guardar", savedBtn: "Guardado ✓", emailInvalid: "Esto no parece un correo electrónico válido." },
  pt: { statusActive: "Ativo", statusPending: "Pendente", statusSuspended: "Pausado", ofClicks: "dos cliques", ofSignups: "das inscrições", payoutTitle: "Pagamento", payoutOf: "de", nextPayout: "Próximo pagamento", payoutReady: "Pronto para pagar", refTitle: "Quem se inscreveu pelo seu link", refCustomer: "Cliente", refJoined: "Entrou", refCommission: "Comissão", stPending: "Pendente", stAvailable: "Disponível", stPaid: "Pago", refEmpty: "Ainda não há indicações pagas. Compartilhe seu link para conseguir a primeira.", greetMorning: "Bom dia", greetNoon: "Boa tarde", greetEvening: "Boa noite", greetNight: "Boa noite", linkIndividuals: "Individuais", tabHome: "Início", tabMarketing: "Marketing", tabPayments: "Pagamentos", howEarnTitle: "Como você ganha", mktMsgTitle: "Mensagens prontas para enviar", mktMsgHint: "Copie, cole e compartilhe. Seu link pessoal já está incluído.", tmpl1: "Encontrei uma ferramenta que explica cada palavra para as crianças numa linguagem que elas entendem e ajuda a acompanhar as aulas. Vale a pena conferir: {link}", tmpl2: "Para uma criança que tem dificuldade em entender as palavras ao ler: o Gadit explica cada palavra até o fim, com exemplos e uma imagem. Link: {link}", tmpl3: "O Gadit é um dicionário que explica cada palavra na língua da própria criança e amplia seu vocabulário. 14 dias grátis: {link}", copyMsg: "Copiar mensagem", copiedMsg: "Copiado ✓", creativesTitle: "Imagens para compartilhar", creativesHint: "Baixe e publique nas redes sociais, ou envie para o seu grupo.", download: "Baixar", payoutEmailTitle: "PayPal para pagamentos", payoutEmailHint: "Para onde enviamos sua comissão. Você pode alterar quando quiser.", payoutEmailPh: "you@example.com", saveBtn: "Salvar", savedBtn: "Salvo ✓", emailInvalid: "Isso não parece um e-mail válido." },
  fr: { statusActive: "Actif", statusPending: "En attente", statusSuspended: "En pause", ofClicks: "des clics", ofSignups: "des inscriptions", payoutTitle: "Paiement", payoutOf: "sur", nextPayout: "Prochain paiement", payoutReady: "Prêt à être versé", refTitle: "Qui s'est inscrit grâce à vous", refCustomer: "Client", refJoined: "Inscription", refCommission: "Commission", stPending: "En attente", stAvailable: "Disponible", stPaid: "Payé", refEmpty: "Aucun filleul payant pour l'instant. Partagez votre lien pour obtenir le premier.", greetMorning: "Bonjour", greetNoon: "Bon après-midi", greetEvening: "Bonsoir", greetNight: "Bonne nuit", linkIndividuals: "Particuliers", tabHome: "Accueil", tabMarketing: "Marketing", tabPayments: "Paiements", howEarnTitle: "Comment vous gagnez", mktMsgTitle: "Messages prêts à envoyer", mktMsgHint: "Copiez, collez et partagez. Votre lien personnel est déjà à l'intérieur.", tmpl1: "J'ai trouvé un outil qui explique chaque mot aux enfants dans une langue qu'ils comprennent et les aide à suivre à l'école. Ça vaut le coup d'œil : {link}", tmpl2: "Pour un enfant qui a du mal à comprendre les mots en lisant : Gadit explique chaque mot jusqu'au bout, avec des exemples et une image. Lien : {link}", tmpl3: "Gadit est un dictionnaire qui explique chaque mot dans la langue de l'enfant et enrichit son vocabulaire. 14 jours gratuits : {link}", copyMsg: "Copier le message", copiedMsg: "Copié ✓", creativesTitle: "Images à partager", creativesHint: "Téléchargez-les et publiez-les sur les réseaux, ou envoyez-les à votre groupe.", download: "Télécharger", payoutEmailTitle: "PayPal pour les paiements", payoutEmailHint: "Où nous envoyons votre commission. Vous pouvez le modifier à tout moment.", payoutEmailPh: "you@example.com", saveBtn: "Enregistrer", savedBtn: "Enregistré ✓", emailInvalid: "Cela ne ressemble pas à une adresse e-mail valide." },
  de: { statusActive: "Aktiv", statusPending: "Ausstehend", statusSuspended: "Pausiert", ofClicks: "der Klicks", ofSignups: "der Anmeldungen", payoutTitle: "Auszahlung", payoutOf: "von", nextPayout: "Nächste Auszahlung", payoutReady: "Bereit zur Auszahlung", refTitle: "Wer sich über dich angemeldet hat", refCustomer: "Kunde", refJoined: "Beigetreten", refCommission: "Provision", stPending: "Ausstehend", stAvailable: "Verfügbar", stPaid: "Ausgezahlt", refEmpty: "Noch keine zahlenden Empfehlungen. Teile deinen Link, um die erste zu bekommen.", greetMorning: "Guten Morgen", greetNoon: "Guten Tag", greetEvening: "Guten Abend", greetNight: "Gute Nacht", linkIndividuals: "Einzelpersonen", tabHome: "Start", tabMarketing: "Marketing", tabPayments: "Auszahlungen", howEarnTitle: "So verdienst du", mktMsgTitle: "Fertige Nachrichten zum Senden", mktMsgHint: "Kopieren, einfügen und teilen. Dein persönlicher Link ist schon enthalten.", tmpl1: "Ich habe ein Tool gefunden, das Kindern jedes Wort in einer Sprache erklärt, die sie verstehen, und ihnen hilft, in der Schule mitzuhalten. Einen Blick wert: {link}", tmpl2: "Für ein Kind, das beim Lesen Mühe hat, Wörter zu verstehen: Gadit erklärt jedes Wort bis zum Ende, mit Beispielen und einem Bild. Link: {link}", tmpl3: "Gadit ist ein Wörterbuch, das jedes Wort in der eigenen Sprache des Kindes erklärt und seinen Wortschatz aufbaut. 14 Tage kostenlos: {link}", copyMsg: "Nachricht kopieren", copiedMsg: "Kopiert ✓", creativesTitle: "Bilder zum Teilen", creativesHint: "Lade sie herunter und poste sie in sozialen Netzwerken, oder sende sie an deine Gruppe.", download: "Herunterladen", payoutEmailTitle: "PayPal für Auszahlungen", payoutEmailHint: "Wohin wir deine Provision senden. Du kannst es jederzeit ändern.", payoutEmailPh: "you@example.com", saveBtn: "Speichern", savedBtn: "Gespeichert ✓", emailInvalid: "Das sieht nicht nach einer gültigen E-Mail-Adresse aus." },
  cs: { statusActive: "Aktivní", statusPending: "Čeká se", statusSuspended: "Pozastaveno", ofClicks: "z kliknutí", ofSignups: "z registrací", payoutTitle: "Výplata", payoutOf: "z", nextPayout: "Další výplata", payoutReady: "Připraveno k výplatě", refTitle: "Kdo se zaregistroval přes vás", refCustomer: "Zákazník", refJoined: "Připojil se", refCommission: "Provize", stPending: "Čeká se", stAvailable: "K dispozici", stPaid: "Vyplaceno", refEmpty: "Zatím žádná placená doporučení. Sdílejte svůj odkaz a získejte první.", greetMorning: "Dobré ráno", greetNoon: "Dobré odpoledne", greetEvening: "Dobrý večer", greetNight: "Dobrou noc", linkIndividuals: "Jednotlivci", tabHome: "Domů", tabMarketing: "Marketing", tabPayments: "Výplaty", howEarnTitle: "Jak vyděláváte", mktMsgTitle: "Připravené zprávy k odeslání", mktMsgHint: "Zkopírujte, vložte a sdílejte. Váš osobní odkaz už je uvnitř.", tmpl1: "Našel jsem nástroj, který dětem vysvětlí každé slovo v jazyce, kterému rozumí, a pomůže jim stíhat školu. Stojí za podívání: {link}", tmpl2: "Pro dítě, které má potíže s porozuměním slovům při čtení: Gadit vysvětlí každé slovo až do konce, s příklady a obrázkem. Odkaz: {link}", tmpl3: "Gadit je slovník, který vysvětlí každé slovo ve vlastním jazyce dítěte a rozšiřuje jeho slovní zásobu. 14 dní zdarma: {link}", copyMsg: "Kopírovat zprávu", copiedMsg: "Zkopírováno ✓", creativesTitle: "Obrázky ke sdílení", creativesHint: "Stáhněte je a zveřejněte na sociálních sítích, nebo pošlete do své skupiny.", download: "Stáhnout", payoutEmailTitle: "PayPal pro výplaty", payoutEmailHint: "Kam posíláme vaši provizi. Můžete to kdykoli změnit.", payoutEmailPh: "you@example.com", saveBtn: "Uložit", savedBtn: "Uloženo ✓", emailInvalid: "Tohle nevypadá jako platný e-mail." },
  sk: { statusActive: "Aktívny", statusPending: "Čaká sa", statusSuspended: "Pozastavené", ofClicks: "z kliknutí", ofSignups: "z registrácií", payoutTitle: "Výplata", payoutOf: "z", nextPayout: "Ďalšia výplata", payoutReady: "Pripravené na výplatu", refTitle: "Kto sa zaregistroval cez vás", refCustomer: "Zákazník", refJoined: "Pripojil sa", refCommission: "Provízia", stPending: "Čaká sa", stAvailable: "K dispozícii", stPaid: "Vyplatené", refEmpty: "Zatiaľ žiadne platené odporúčania. Zdieľajte svoj odkaz a získajte prvé.", greetMorning: "Dobré ráno", greetNoon: "Dobré popoludnie", greetEvening: "Dobrý večer", greetNight: "Dobrú noc", linkIndividuals: "Jednotlivci", tabHome: "Domov", tabMarketing: "Marketing", tabPayments: "Výplaty", howEarnTitle: "Ako zarábate", mktMsgTitle: "Pripravené správy na odoslanie", mktMsgHint: "Skopírujte, vložte a zdieľajte. Váš osobný odkaz je už vnútri.", tmpl1: "Našiel som nástroj, ktorý deťom vysvetlí každé slovo v jazyku, ktorému rozumejú, a pomôže im stíhať školu. Stojí za pozretie: {link}", tmpl2: "Pre dieťa, ktoré má problém porozumieť slovám pri čítaní: Gadit vysvetlí každé slovo až do konca, s príkladmi a obrázkom. Odkaz: {link}", tmpl3: "Gadit je slovník, ktorý vysvetlí každé slovo vo vlastnom jazyku dieťaťa a rozširuje jeho slovnú zásobu. 14 dní zadarmo: {link}", copyMsg: "Kopírovať správu", copiedMsg: "Skopírované ✓", creativesTitle: "Obrázky na zdieľanie", creativesHint: "Stiahnite ich a zverejnite na sociálnych sieťach, alebo pošlite do svojej skupiny.", download: "Stiahnuť", payoutEmailTitle: "PayPal pre výplaty", payoutEmailHint: "Kam posielame vašu províziu. Môžete to kedykoľvek zmeniť.", payoutEmailPh: "you@example.com", saveBtn: "Uložiť", savedBtn: "Uložené ✓", emailInvalid: "Toto nevyzerá ako platný e-mail." },
  it: { statusActive: "Attivo", statusPending: "In attesa", statusSuspended: "In pausa", ofClicks: "di clic", ofSignups: "di iscrizioni", payoutTitle: "Pagamento", payoutOf: "di", nextPayout: "Prossimo pagamento", payoutReady: "Pronto per il pagamento", refTitle: "Chi si è iscritto tramite te", refCustomer: "Cliente", refJoined: "Iscritto il", refCommission: "Commissione", stPending: "In attesa", stAvailable: "Disponibile", stPaid: "Pagato", refEmpty: "Ancora nessun referral a pagamento. Condividi il tuo link per ottenere il primo.", greetMorning: "Buongiorno", greetNoon: "Buon pomeriggio", greetEvening: "Buonasera", greetNight: "Buonanotte", linkIndividuals: "Privati", tabHome: "Home", tabMarketing: "Marketing", tabPayments: "Pagamenti", howEarnTitle: "Come guadagni", mktMsgTitle: "Messaggi pronti da inviare", mktMsgHint: "Copia, incolla e condividi. Il tuo link personale è già incluso.", tmpl1: "Ho trovato uno strumento che spiega ogni parola ai bambini in una lingua che capiscono e li aiuta a stare al passo con i compiti. Vale la pena dare un'occhiata: {link}", tmpl2: "Per un bambino che fatica a capire le parole mentre legge: Gadit spiega ogni parola fino in fondo, con esempi e un'immagine. Link: {link}", tmpl3: "Gadit è un dizionario che spiega ogni parola nella lingua del bambino e ne arricchisce il vocabolario. 14 giorni gratis: {link}", copyMsg: "Copia messaggio", copiedMsg: "Copiato ✓", creativesTitle: "Immagini da condividere", creativesHint: "Scaricale e pubblicale sui social, oppure inviale al tuo gruppo.", download: "Scarica", payoutEmailTitle: "PayPal per i pagamenti", payoutEmailHint: "Dove inviamo la tua commissione. Puoi cambiarlo in qualsiasi momento.", payoutEmailPh: "you@example.com", saveBtn: "Salva", savedBtn: "Salvato ✓", emailInvalid: "Questo non sembra un indirizzo email valido." },
  ja: { statusActive: "有効", statusPending: "保留中", statusSuspended: "一時停止中", ofClicks: "クリック中", ofSignups: "登録中", payoutTitle: "支払い", payoutOf: "／", nextPayout: "次回の支払い", payoutReady: "支払い準備完了", refTitle: "あなた経由で登録した人", refCustomer: "顧客", refJoined: "登録日", refCommission: "報酬", stPending: "保留中", stAvailable: "利用可能", stPaid: "支払い済み", refEmpty: "まだ有料の紹介はありません。リンクを共有して最初の紹介を獲得しましょう。", greetMorning: "おはようございます", greetNoon: "こんにちは", greetEvening: "こんばんは", greetNight: "おやすみなさい", linkIndividuals: "個人向け", tabHome: "ホーム", tabMarketing: "マーケティング", tabPayments: "支払い", howEarnTitle: "報酬の仕組み", mktMsgTitle: "そのまま送れるメッセージ", mktMsgHint: "コピーして貼り付けて共有するだけ。あなた専用のリンクはすでに含まれています。", tmpl1: "子どもがわかる言葉であらゆる単語を説明してくれて、学校の勉強にもついていけるようにしてくれるツールを見つけました。一見の価値ありです：{link}", tmpl2: "読んでいて言葉の意味がわかりにくいお子さんへ。Gadit はあらゆる単語を、例文と画像つきで最後までしっかり説明します。リンク：{link}", tmpl3: "Gadit は、あらゆる単語を子ども自身の言葉で説明し、語彙を育てる辞書です。14日間無料：{link}", copyMsg: "メッセージをコピー", copiedMsg: "コピーしました ✓", creativesTitle: "共有できる画像", creativesHint: "ダウンロードして SNS に投稿したり、グループに送ったりできます。", download: "ダウンロード", payoutEmailTitle: "支払い用の PayPal", payoutEmailHint: "報酬の送金先です。いつでも変更できます。", payoutEmailPh: "you@example.com", saveBtn: "保存", savedBtn: "保存しました ✓", emailInvalid: "有効なメールアドレスではないようです。" },
  hi: { statusActive: "सक्रिय", statusPending: "लंबित", statusSuspended: "रुका हुआ", ofClicks: "क्लिक में से", ofSignups: "साइन-अप में से", payoutTitle: "भुगतान", payoutOf: "में से", nextPayout: "अगला भुगतान", payoutReady: "भुगतान के लिए तैयार", refTitle: "आपके ज़रिए किसने साइन अप किया", refCustomer: "ग्राहक", refJoined: "शामिल हुए", refCommission: "कमीशन", stPending: "लंबित", stAvailable: "उपलब्ध", stPaid: "भुगतान किया गया", refEmpty: "अभी तक कोई भुगतान करने वाला रेफ़रल नहीं। अपना पहला पाने के लिए अपनी लिंक शेयर करें।", greetMorning: "सुप्रभात", greetNoon: "नमस्कार", greetEvening: "शुभ संध्या", greetNight: "शुभ रात्रि", linkIndividuals: "व्यक्तिगत", tabHome: "होम", tabMarketing: "मार्केटिंग", tabPayments: "भुगतान", howEarnTitle: "आप कैसे कमाते हैं", mktMsgTitle: "भेजने के लिए तैयार संदेश", mktMsgHint: "कॉपी करें, पेस्ट करें और शेयर करें। आपकी निजी लिंक पहले से ही अंदर है।", tmpl1: "मुझे एक टूल मिला जो बच्चों को हर शब्द उनकी समझ की भाषा में समझाता है और उन्हें स्कूल के काम में साथ बनाए रखने में मदद करता है। एक बार देखने लायक है: {link}", tmpl2: "उस बच्चे के लिए जिसे पढ़ते समय शब्द समझने में मुश्किल होती है: Gadit हर शब्द को उदाहरणों और एक तस्वीर के साथ पूरी तरह समझाता है। लिंक: {link}", tmpl3: "Gadit एक ऐसा शब्दकोश है जो हर शब्द को बच्चे की अपनी भाषा में समझाता है और उसकी शब्दावली बढ़ाता है। 14 दिन मुफ़्त: {link}", copyMsg: "संदेश कॉपी करें", copiedMsg: "कॉपी हो गया ✓", creativesTitle: "शेयर करने के लिए तस्वीरें", creativesHint: "डाउनलोड करें और सोशल पर पोस्ट करें, या अपने ग्रुप में भेजें।", download: "डाउनलोड करें", payoutEmailTitle: "भुगतान के लिए PayPal", payoutEmailHint: "जहाँ हम आपका कमीशन भेजते हैं। आप इसे कभी भी बदल सकते हैं।", payoutEmailPh: "you@example.com", saveBtn: "सहेजें", savedBtn: "सहेज लिया ✓", emailInvalid: "यह एक मान्य ईमेल पता नहीं लगता।" },
  am: { statusActive: "ንቁ", statusPending: "በመጠባበቅ ላይ", statusSuspended: "ተቆሟል", ofClicks: "ከጠቅታዎች", ofSignups: "ከምዝገባዎች", payoutTitle: "ክፍያ", payoutOf: "ከ", nextPayout: "ቀጣይ ክፍያ", payoutReady: "ለክፍያ ዝግጁ", refTitle: "በእርስዎ በኩል የተመዘገቡ", refCustomer: "ደንበኛ", refJoined: "የተቀላቀለበት", refCommission: "ኮሚሽን", stPending: "በመጠባበቅ ላይ", stAvailable: "ይገኛል", stPaid: "ተከፍሏል", refEmpty: "እስካሁን የከፈለ ሪፈራል የለም። የመጀመሪያዎን ለማግኘት አገናኝዎን ያጋሩ።", greetMorning: "እንደምን አደሩ", greetNoon: "እንደምን ዋሉ", greetEvening: "እንደምን አመሹ", greetNight: "መልካም ሌሊት", linkIndividuals: "ግለሰቦች", tabHome: "መነሻ", tabMarketing: "ግብይት", tabPayments: "ክፍያዎች", howEarnTitle: "እንዴት እንደሚያገኙ", mktMsgTitle: "ለመላክ ዝግጁ የሆኑ መልዕክቶች", mktMsgHint: "ይቅዱ፣ ይለጥፉ እና ያጋሩ። የግል አገናኝዎ አስቀድሞ ውስጡ አለ።", tmpl1: "ልጆች ለሚረዱት ቋንቋ እያንዳንዱን ቃል የሚያብራራ እና በትምህርት ቤት ስራ ወደኋላ እንዳይቀሩ የሚረዳ መሳሪያ አገኘሁ። ማየት ተገቢ ነው፦ {link}", tmpl2: "እያነበበ ቃላትን ለመረዳት ለሚቸገር ልጅ፦ Gadit እያንዳንዱን ቃል በምሳሌዎችና በስዕል እስከ መጨረሻው ያብራራል። አገናኝ፦ {link}", tmpl3: "Gadit እያንዳንዱን ቃል በልጁ ራሱ ቋንቋ የሚያብራራ እና የቃላት ክምችቱን የሚያሳድግ መዝገበ ቃላት ነው። 14 ቀናት ነጻ፦ {link}", copyMsg: "መልዕክት ቅዳ", copiedMsg: "ተቀድቷል ✓", creativesTitle: "ለማጋራት ስዕሎች", creativesHint: "ያውርዱ እና በማህበራዊ ሚዲያ ይለጥፉ፣ ወይም ወደ ቡድንዎ ይላኩ።", download: "አውርድ", payoutEmailTitle: "ለክፍያ PayPal", payoutEmailHint: "ኮሚሽንዎን የምንልክበት። በማንኛውም ጊዜ መቀየር ይችላሉ።", payoutEmailPh: "you@example.com", saveBtn: "አስቀምጥ", savedBtn: "ተቀምጧል ✓", emailInvalid: "ይህ ትክክለኛ የኢሜይል አድራሻ አይመስልም።" },
  uk: { statusActive: "Активний", statusPending: "Очікує", statusSuspended: "Призупинено", ofClicks: "з кліків", ofSignups: "з реєстрацій", payoutTitle: "Виплата", payoutOf: "з", nextPayout: "Наступна виплата", payoutReady: "Готово до виплати", refTitle: "Хто зареєструвався через вас", refCustomer: "Клієнт", refJoined: "Приєднався", refCommission: "Комісія", stPending: "Очікує", stAvailable: "Доступно", stPaid: "Виплачено", refEmpty: "Поки що немає платних рефералів. Поділіться своїм посиланням, щоб отримати перший.", greetMorning: "Доброго ранку", greetNoon: "Доброго дня", greetEvening: "Доброго вечора", greetNight: "На добраніч", linkIndividuals: "Приватні особи", tabHome: "Головна", tabMarketing: "Маркетинг", tabPayments: "Виплати", howEarnTitle: "Як ви заробляєте", mktMsgTitle: "Готові повідомлення для надсилання", mktMsgHint: "Скопіюйте, вставте та поділіться. Ваше особисте посилання вже всередині.", tmpl1: "Я знайшов інструмент, який пояснює дітям кожне слово зрозумілою їм мовою й допомагає встигати зі шкільними завданнями. Варто глянути: {link}", tmpl2: "Для дитини, якій важко розуміти слова під час читання: Gadit пояснює кожне слово до кінця, з прикладами та зображенням. Посилання: {link}", tmpl3: "Gadit це словник, який пояснює кожне слово рідною мовою дитини й розширює її словниковий запас. 14 днів безкоштовно: {link}", copyMsg: "Копіювати повідомлення", copiedMsg: "Скопійовано ✓", creativesTitle: "Зображення для поширення", creativesHint: "Завантажте й опублікуйте в соцмережах або надішліть у свою групу.", download: "Завантажити", payoutEmailTitle: "PayPal для виплат", payoutEmailHint: "Куди ми надсилаємо вашу комісію. Ви можете змінити це будь-коли.", payoutEmailPh: "you@example.com", saveBtn: "Зберегти", savedBtn: "Збережено ✓", emailInvalid: "Це не схоже на дійсну електронну адресу." },
  tr: { statusActive: "Etkin", statusPending: "Beklemede", statusSuspended: "Duraklatıldı", ofClicks: "tıklamadan", ofSignups: "kayıttan", payoutTitle: "Ödeme", payoutOf: "/", nextPayout: "Sonraki ödeme", payoutReady: "Ödemeye hazır", refTitle: "Senin aracılığınla kim kaydoldu", refCustomer: "Müşteri", refJoined: "Katıldı", refCommission: "Komisyon", stPending: "Beklemede", stAvailable: "Kullanılabilir", stPaid: "Ödendi", refEmpty: "Henüz ücretli bir yönlendirme yok. İlkini almak için bağlantını paylaş.", greetMorning: "Günaydın", greetNoon: "İyi günler", greetEvening: "İyi akşamlar", greetNight: "İyi geceler", linkIndividuals: "Bireyler", tabHome: "Ana sayfa", tabMarketing: "Pazarlama", tabPayments: "Ödemeler", howEarnTitle: "Nasıl kazanırsın", mktMsgTitle: "Göndermeye hazır mesajlar", mktMsgHint: "Kopyala, yapıştır ve paylaş. Sana özel bağlantı zaten içinde.", tmpl1: "Çocuklara her kelimeyi anladıkları bir dilde açıklayan ve okul ödevlerine ayak uydurmalarına yardımcı olan bir araç buldum. Bakmaya değer: {link}", tmpl2: "Okurken kelimeleri anlamakta zorlanan bir çocuk için: Gadit her kelimeyi örneklerle ve bir görselle sonuna kadar açıklıyor. Bağlantı: {link}", tmpl3: "Gadit, her kelimeyi çocuğun kendi dilinde açıklayan ve kelime dağarcığını geliştiren bir sözlüktür. 14 gün ücretsiz: {link}", copyMsg: "Mesajı kopyala", copiedMsg: "Kopyalandı ✓", creativesTitle: "Paylaşılacak görseller", creativesHint: "İndir ve sosyal medyada paylaş ya da grubuna gönder.", download: "İndir", payoutEmailTitle: "Ödemeler için PayPal", payoutEmailHint: "Komisyonunu gönderdiğimiz yer. Bunu istediğin zaman değiştirebilirsin.", payoutEmailPh: "you@example.com", saveBtn: "Kaydet", savedBtn: "Kaydedildi ✓", emailInvalid: "Bu geçerli bir e-posta adresi gibi görünmüyor." },
  pl: { statusActive: "Aktywny", statusPending: "Oczekujące", statusSuspended: "Wstrzymane", ofClicks: "z kliknięć", ofSignups: "z rejestracji", payoutTitle: "Wypłata", payoutOf: "z", nextPayout: "Następna wypłata", payoutReady: "Gotowe do wypłaty", refTitle: "Kto zarejestrował się dzięki tobie", refCustomer: "Klient", refJoined: "Dołączył", refCommission: "Prowizja", stPending: "Oczekująca", stAvailable: "Dostępna", stPaid: "Wypłacona", refEmpty: "Brak płatnych poleceń. Udostępnij swój link, aby zdobyć pierwsze.", greetMorning: "Dzień dobry", greetNoon: "Dzień dobry", greetEvening: "Dobry wieczór", greetNight: "Dobranoc", linkIndividuals: "Osoby prywatne", tabHome: "Start", tabMarketing: "Marketing", tabPayments: "Wypłaty", howEarnTitle: "Jak zarabiasz", mktMsgTitle: "Gotowe wiadomości do wysłania", mktMsgHint: "Skopiuj, wklej i udostępnij. Twój osobisty link jest już w środku.", tmpl1: "Znalazłem narzędzie, które tłumaczy dzieciom każde słowo w zrozumiałym dla nich języku i pomaga nadążać za nauką w szkole. Warto zobaczyć: {link}", tmpl2: "Dla dziecka, które ma trudności ze zrozumieniem słów podczas czytania: Gadit wyjaśnia każde słowo do końca, z przykładami i obrazkiem. Link: {link}", tmpl3: "Gadit to słownik, który tłumaczy każde słowo w języku dziecka i rozwija jego słownictwo. 14 dni za darmo: {link}", copyMsg: "Kopiuj wiadomość", copiedMsg: "Skopiowano ✓", creativesTitle: "Obrazy do udostępnienia", creativesHint: "Pobierz i opublikuj w mediach społecznościowych lub wyślij do swojej grupy.", download: "Pobierz", payoutEmailTitle: "PayPal do wypłat", payoutEmailHint: "Tam wysyłamy twoją prowizję. Możesz to zmienić w każdej chwili.", payoutEmailPh: "you@example.com", saveBtn: "Zapisz", savedBtn: "Zapisano ✓", emailInvalid: "To nie wygląda na prawidłowy adres e-mail." },
  fa: { statusActive: "فعال", statusPending: "در انتظار", statusSuspended: "متوقف‌شده", ofClicks: "از کلیک‌ها", ofSignups: "از ثبت‌نام‌ها", payoutTitle: "پرداخت", payoutOf: "از", nextPayout: "پرداخت بعدی", payoutReady: "آماده برای پرداخت", refTitle: "چه کسانی از طریق شما ثبت‌نام کردند", refCustomer: "مشتری", refJoined: "پیوست", refCommission: "کمیسیون", stPending: "در انتظار", stAvailable: "در دسترس", stPaid: "پرداخت‌شده", refEmpty: "هنوز هیچ معرفی پولی ندارید. برای گرفتن اولین مورد، لینک خود را به اشتراک بگذارید.", greetMorning: "صبح بخیر", greetNoon: "ظهر بخیر", greetEvening: "عصر بخیر", greetNight: "شب بخیر", linkIndividuals: "افراد", tabHome: "خانه", tabMarketing: "بازاریابی", tabPayments: "پرداخت‌ها", howEarnTitle: "چگونه درآمد کسب می‌کنید", mktMsgTitle: "پیام‌های آماده ارسال", mktMsgHint: "کپی کنید، بچسبانید و به اشتراک بگذارید. لینک شخصی شما همین حالا داخل آن است.", tmpl1: "ابزاری پیدا کردم که هر واژه را به زبانی که کودکان می‌فهمند برایشان توضیح می‌دهد و کمک می‌کند از درس‌های مدرسه عقب نمانند. ارزش دیدن دارد: {link}", tmpl2: "برای کودکی که هنگام خواندن در فهم واژه‌ها دشواری دارد: Gadit هر واژه را تا انتها، همراه با مثال و یک تصویر توضیح می‌دهد. لینک: {link}", tmpl3: "Gadit فرهنگ لغتی است که هر واژه را به زبان خودِ کودک توضیح می‌دهد و دایره واژگان او را می‌سازد. ۱۴ روز رایگان: {link}", copyMsg: "کپی پیام", copiedMsg: "کپی شد ✓", creativesTitle: "تصاویر برای اشتراک‌گذاری", creativesHint: "دانلود کنید و در شبکه‌های اجتماعی منتشر کنید، یا به گروه خود بفرستید.", download: "دانلود", payoutEmailTitle: "PayPal برای پرداخت‌ها", payoutEmailHint: "جایی که کمیسیون شما را می‌فرستیم. هر زمان می‌توانید آن را تغییر دهید.", payoutEmailPh: "you@example.com", saveBtn: "ذخیره", savedBtn: "ذخیره شد ✓", emailInvalid: "این یک نشانی ایمیل معتبر به نظر نمی‌رسد." },
  id: { statusActive: "Aktif", statusPending: "Menunggu", statusSuspended: "Dijeda", ofClicks: "dari klik", ofSignups: "dari pendaftaran", payoutTitle: "Pembayaran", payoutOf: "dari", nextPayout: "Pembayaran berikutnya", payoutReady: "Siap dibayarkan", refTitle: "Siapa yang mendaftar lewat kamu", refCustomer: "Pelanggan", refJoined: "Bergabung", refCommission: "Komisi", stPending: "Menunggu", stAvailable: "Tersedia", stPaid: "Dibayar", refEmpty: "Belum ada referral berbayar. Bagikan tautanmu untuk mendapatkan yang pertama.", greetMorning: "Selamat pagi", greetNoon: "Selamat siang", greetEvening: "Selamat sore", greetNight: "Selamat malam", linkIndividuals: "Perorangan", tabHome: "Beranda", tabMarketing: "Pemasaran", tabPayments: "Pembayaran", howEarnTitle: "Cara kamu mendapatkan penghasilan", mktMsgTitle: "Pesan siap kirim", mktMsgHint: "Salin, tempel, dan bagikan. Tautan pribadimu sudah ada di dalamnya.", tmpl1: "Saya menemukan alat yang menjelaskan setiap kata kepada anak dalam bahasa yang mereka pahami dan membantu mereka mengikuti pelajaran sekolah. Layak dilihat: {link}", tmpl2: "Untuk anak yang kesulitan memahami kata saat membaca: Gadit menjelaskan setiap kata sampai tuntas, dengan contoh dan gambar. Tautan: {link}", tmpl3: "Gadit adalah kamus yang menjelaskan setiap kata dalam bahasa anak sendiri dan membangun kosakata mereka. Gratis 14 hari: {link}", copyMsg: "Salin pesan", copiedMsg: "Tersalin ✓", creativesTitle: "Gambar untuk dibagikan", creativesHint: "Unduh dan posting di media sosial, atau kirim ke grupmu.", download: "Unduh", payoutEmailTitle: "PayPal untuk pembayaran", payoutEmailHint: "Ke mana kami mengirim komisimu. Kamu bisa mengubahnya kapan saja.", payoutEmailPh: "you@example.com", saveBtn: "Simpan", savedBtn: "Tersimpan ✓", emailInvalid: "Itu sepertinya bukan email yang valid." },
  nl: { statusActive: "Actief", statusPending: "In behandeling", statusSuspended: "Gepauzeerd", ofClicks: "van kliks", ofSignups: "van aanmeldingen", payoutTitle: "Uitbetaling", payoutOf: "van", nextPayout: "Volgende uitbetaling", payoutReady: "Klaar om uit te betalen", refTitle: "Wie zich via jou heeft aangemeld", refCustomer: "Klant", refJoined: "Aangesloten", refCommission: "Commissie", stPending: "In behandeling", stAvailable: "Beschikbaar", stPaid: "Betaald", refEmpty: "Nog geen betalende verwijzingen. Deel je link om je eerste te krijgen.", greetMorning: "Goedemorgen", greetNoon: "Goedemiddag", greetEvening: "Goedenavond", greetNight: "Goedenacht", linkIndividuals: "Particulieren", tabHome: "Home", tabMarketing: "Marketing", tabPayments: "Uitbetalingen", howEarnTitle: "Hoe je verdient", mktMsgTitle: "Kant-en-klare berichten", mktMsgHint: "Kopiëren, plakken en delen. Je persoonlijke link zit er al in.", tmpl1: "Ik vond een hulpmiddel dat elk woord aan kinderen uitlegt in een taal die ze begrijpen en dat hen helpt om bij te blijven op school. De moeite waard: {link}", tmpl2: "Voor een kind dat moeite heeft om woorden te begrijpen tijdens het lezen: Gadit legt elk woord volledig uit, met voorbeelden en een afbeelding. Link: {link}", tmpl3: "Gadit is een woordenboek dat elk woord in de eigen taal van een kind uitlegt en hun woordenschat opbouwt. 14 dagen gratis: {link}", copyMsg: "Bericht kopiëren", copiedMsg: "Gekopieerd ✓", creativesTitle: "Afbeeldingen om te delen", creativesHint: "Download en plaats op social media, of stuur naar je groep.", download: "Downloaden", payoutEmailTitle: "PayPal voor uitbetalingen", payoutEmailHint: "Waar we je commissie naartoe sturen. Je kunt dit altijd wijzigen.", payoutEmailPh: "you@example.com", saveBtn: "Opslaan", savedBtn: "Opgeslagen ✓", emailInvalid: "Dat lijkt geen geldig e-mailadres." },
  el: { statusActive: "Ενεργό", statusPending: "Σε εκκρεμότητα", statusSuspended: "Σε παύση", ofClicks: "από κλικ", ofSignups: "από εγγραφές", payoutTitle: "Πληρωμή", payoutOf: "από", nextPayout: "Επόμενη πληρωμή", payoutReady: "Έτοιμο για πληρωμή", refTitle: "Ποιοι εγγράφηκαν μέσω εσένα", refCustomer: "Πελάτης", refJoined: "Εγγράφηκε", refCommission: "Προμήθεια", stPending: "Σε εκκρεμότητα", stAvailable: "Διαθέσιμο", stPaid: "Πληρώθηκε", refEmpty: "Δεν υπάρχουν ακόμη πληρωμένες συστάσεις. Μοιράσου τον σύνδεσμό σου για να αποκτήσεις την πρώτη.", greetMorning: "Καλημέρα", greetNoon: "Καλό απόγευμα", greetEvening: "Καλησπέρα", greetNight: "Καληνύχτα", linkIndividuals: "Ιδιώτες", tabHome: "Αρχική", tabMarketing: "Μάρκετινγκ", tabPayments: "Πληρωμές", howEarnTitle: "Πώς κερδίζεις", mktMsgTitle: "Έτοιμα μηνύματα για αποστολή", mktMsgHint: "Αντίγραψε, επικόλλησε και μοιράσου. Ο προσωπικός σου σύνδεσμος είναι ήδη μέσα.", tmpl1: "Βρήκα ένα εργαλείο που εξηγεί κάθε λέξη στα παιδιά σε μια γλώσσα που καταλαβαίνουν και τα βοηθά να συμβαδίζουν με τα μαθήματα. Αξίζει μια ματιά: {link}", tmpl2: "Για ένα παιδί που δυσκολεύεται να καταλάβει λέξεις όταν διαβάζει: το Gadit εξηγεί κάθε λέξη μέχρι το τέλος, με παραδείγματα και μια εικόνα. Σύνδεσμος: {link}", tmpl3: "Το Gadit είναι ένα λεξικό που εξηγεί κάθε λέξη στη γλώσσα του ίδιου του παιδιού και χτίζει το λεξιλόγιό του. 14 ημέρες δωρεάν: {link}", copyMsg: "Αντιγραφή μηνύματος", copiedMsg: "Αντιγράφηκε ✓", creativesTitle: "Εικόνες για κοινοποίηση", creativesHint: "Κατέβασέ τες και δημοσίευσέ τες στα κοινωνικά δίκτυα, ή στείλ' τες στην ομάδα σου.", download: "Λήψη", payoutEmailTitle: "PayPal για πληρωμές", payoutEmailHint: "Πού στέλνουμε την προμήθειά σου. Μπορείς να το αλλάξεις όποτε θέλεις.", payoutEmailPh: "you@example.com", saveBtn: "Αποθήκευση", savedBtn: "Αποθηκεύτηκε ✓", emailInvalid: "Αυτό δεν μοιάζει με έγκυρο email." },
  zu: { statusActive: "Iyasebenza", statusPending: "Ilindile", statusSuspended: "Imisiwe", ofClicks: "kokuchofoza", ofSignups: "kokubhalisa", payoutTitle: "Inkokhelo", payoutOf: "kokungu", nextPayout: "Inkokhelo elandelayo", payoutReady: "Isilungele ukukhokhwa", refTitle: "Obhalise ngawe", refCustomer: "Ikhasimende", refJoined: "Ujoyine", refCommission: "Ikhomishani", stPending: "Ilindile", stAvailable: "Iyatholakala", stPaid: "Ikhokhiwe", refEmpty: "Ayikho imibhaliso ekhokhelwayo okwamanje. Yabelana ngesixhumanisi sakho ukuze uthole owokuqala.", greetMorning: "Sawubona ekuseni", greetNoon: "Sawubona emini", greetEvening: "Sawubona kusihlwa", greetNight: "Ulale kahle", linkIndividuals: "Abantu ngabanye", tabHome: "Ikhaya", tabMarketing: "Ukumaketha", tabPayments: "Izinkokhelo", howEarnTitle: "Indlela ohola ngayo", mktMsgTitle: "Imilayezo esilungele ukuthunyelwa", mktMsgHint: "Kopisha, unamathisele, wabelane. Isixhumanisi sakho somuntu siphakathi kakade.", tmpl1: "Ngithole ithuluzi elichaza wonke amagama ezinganeni ngolimi eziluqondayo futhi elizisiza zihambisane nomsebenzi wesikole. Kufanele ukubukwe: {link}", tmpl2: "Enganeni ehluleka ukuqonda amagama ngenkathi ifunda: iGadit ichaza wonke amagama kuze kuphele, ngezibonelo nesithombe. Isixhumanisi: {link}", tmpl3: "IGadit yisichazamazwi esichaza wonke amagama ngolimi lwengane futhi esakha isamba samagama ayaziyo. Amahhala izinsuku ezingu-14: {link}", copyMsg: "Kopisha umlayezo", copiedMsg: "Kukopishiwe ✓", creativesTitle: "Izithombe zokwabelana", creativesHint: "Landa bese uthumela kwimidiya yezokuxhumana, noma uthumele eqenjini lakho.", download: "Landa", payoutEmailTitle: "I-PayPal yezinkokhelo", payoutEmailHint: "Lapho sithumela khona ikhomishani yakho. Ungakushintsha noma nini.", payoutEmailPh: "you@example.com", saveBtn: "Londoloza", savedBtn: "Kulondoloziwe ✓", emailInvalid: "Lokho akubukeki njenge-imeyili evumelekile." },
  vi: { statusActive: "Đang hoạt động", statusPending: "Đang chờ", statusSuspended: "Tạm dừng", ofClicks: "lượt nhấp", ofSignups: "lượt đăng ký", payoutTitle: "Chi trả", payoutOf: "trên", nextPayout: "Lần chi trả tiếp theo", payoutReady: "Sẵn sàng chi trả", refTitle: "Những người đăng ký qua bạn", refCustomer: "Khách hàng", refJoined: "Đã tham gia", refCommission: "Hoa hồng", stPending: "Đang chờ", stAvailable: "Khả dụng", stPaid: "Đã trả", refEmpty: "Chưa có giới thiệu trả phí nào. Hãy chia sẻ liên kết của bạn để có người đầu tiên.", greetMorning: "Chào buổi sáng", greetNoon: "Chào buổi chiều", greetEvening: "Chào buổi tối", greetNight: "Chúc ngủ ngon", linkIndividuals: "Cá nhân", tabHome: "Trang chủ", tabMarketing: "Tiếp thị", tabPayments: "Chi trả", howEarnTitle: "Cách bạn kiếm tiền", mktMsgTitle: "Tin nhắn sẵn sàng gửi", mktMsgHint: "Sao chép, dán và chia sẻ. Liên kết cá nhân của bạn đã có sẵn bên trong.", tmpl1: "Tôi tìm được một công cụ giải thích mọi từ cho trẻ bằng ngôn ngữ mà các em hiểu và giúp các em theo kịp bài vở ở trường. Đáng để xem: {link}", tmpl2: "Dành cho trẻ gặp khó khăn khi hiểu từ ngữ lúc đọc: Gadit giải thích mọi từ đến tận cùng, kèm ví dụ và hình ảnh. Liên kết: {link}", tmpl3: "Gadit là một cuốn từ điển giải thích mọi từ bằng chính ngôn ngữ của trẻ và xây dựng vốn từ vựng cho các em. Miễn phí 14 ngày: {link}", copyMsg: "Sao chép tin nhắn", copiedMsg: "Đã sao chép ✓", creativesTitle: "Hình ảnh để chia sẻ", creativesHint: "Tải xuống và đăng lên mạng xã hội, hoặc gửi cho nhóm của bạn.", download: "Tải xuống", payoutEmailTitle: "PayPal để chi trả", payoutEmailHint: "Nơi chúng tôi gửi hoa hồng của bạn. Bạn có thể thay đổi bất cứ lúc nào.", payoutEmailPh: "you@example.com", saveBtn: "Lưu", savedBtn: "Đã lưu ✓", emailInvalid: "Địa chỉ email này có vẻ không hợp lệ." },
  fil: { statusActive: "Aktibo", statusPending: "Nakabinbin", statusSuspended: "Naka-pause", ofClicks: "ng mga pag-click", ofSignups: "ng mga pag-sign up", payoutTitle: "Bayad", payoutOf: "sa", nextPayout: "Susunod na bayad", payoutReady: "Handa nang ibayad", refTitle: "Sino ang nag-sign up sa pamamagitan mo", refCustomer: "Customer", refJoined: "Sumali", refCommission: "Komisyon", stPending: "Nakabinbin", stAvailable: "Available", stPaid: "Bayad na", refEmpty: "Wala pang bayad na referral. Ibahagi ang iyong link para makuha ang una mo.", greetMorning: "Magandang umaga", greetNoon: "Magandang hapon", greetEvening: "Magandang gabi", greetNight: "Magandang gabi at matulog nang mahimbing", linkIndividuals: "Mga Indibidwal", tabHome: "Home", tabMarketing: "Marketing", tabPayments: "Mga Bayad", howEarnTitle: "Paano ka kumikita", mktMsgTitle: "Mga mensaheng handa nang ipadala", mktMsgHint: "Kopyahin, i-paste at ibahagi. Nasa loob na ang iyong personal na link.", tmpl1: "May nakita akong tool na nagpapaliwanag ng bawat salita sa mga bata sa wikang nauunawaan nila at tumutulong sa kanilang makasabay sa gawaing pampaaralan. Sulit tingnan: {link}", tmpl2: "Para sa batang nahihirapang umunawa ng mga salita habang nagbabasa: ipinapaliwanag ng Gadit ang bawat salita nang buong-buo, may mga halimbawa at larawan. Link: {link}", tmpl3: "Ang Gadit ay diksyunaryo na nagpapaliwanag ng bawat salita sa sariling wika ng bata at nagpapalawak ng kanilang bokabularyo. Libre nang 14 na araw: {link}", copyMsg: "Kopyahin ang mensahe", copiedMsg: "Nakopya ✓", creativesTitle: "Mga larawang maibabahagi", creativesHint: "I-download at i-post sa social media, o ipadala sa iyong grupo.", download: "I-download", payoutEmailTitle: "PayPal para sa mga bayad", payoutEmailHint: "Kung saan namin ipinapadala ang iyong komisyon. Puwede mo itong baguhin anumang oras.", payoutEmailPh: "you@example.com", saveBtn: "I-save", savedBtn: "Na-save ✓", emailInvalid: "Mukhang hindi ito wastong email." },
  af: { statusActive: "Aktief", statusPending: "Hangende", statusSuspended: "Gepouseer", ofClicks: "van klieks", ofSignups: "van aanmeldings", payoutTitle: "Uitbetaling", payoutOf: "van", nextPayout: "Volgende uitbetaling", payoutReady: "Gereed om uit te betaal", refTitle: "Wie deur jou aangemeld het", refCustomer: "Kliënt", refJoined: "Aangesluit", refCommission: "Kommissie", stPending: "Hangende", stAvailable: "Beskikbaar", stPaid: "Betaal", refEmpty: "Nog geen betalende verwysings nie. Deel jou skakel om jou eerste een te kry.", greetMorning: "Goeiemôre", greetNoon: "Goeiemiddag", greetEvening: "Goeienaand", greetNight: "Goeienag", linkIndividuals: "Individue", tabHome: "Tuis", tabMarketing: "Bemarking", tabPayments: "Uitbetalings", howEarnTitle: "Hoe jy verdien", mktMsgTitle: "Klaargemaakte boodskappe", mktMsgHint: "Kopieer, plak en deel. Jou persoonlike skakel is reeds binne-in.", tmpl1: "Ek het 'n hulpmiddel gekry wat elke woord vir kinders verduidelik in 'n taal wat hulle verstaan en hulle help om by te bly met skoolwerk. Die moeite werd: {link}", tmpl2: "Vir 'n kind wat sukkel om woorde te verstaan terwyl hulle lees: Gadit verduidelik elke woord heeltemal deur, met voorbeelde en 'n prent. Skakel: {link}", tmpl3: "Gadit is 'n woordeboek wat elke woord in 'n kind se eie taal verduidelik en hul woordeskat bou. 14 dae gratis: {link}", copyMsg: "Kopieer boodskap", copiedMsg: "Gekopieer ✓", creativesTitle: "Prente om te deel", creativesHint: "Laai af en plaas op sosiale media, of stuur na jou groep.", download: "Laai af", payoutEmailTitle: "PayPal vir uitbetalings", payoutEmailHint: "Waarheen ons jou kommissie stuur. Jy kan dit enige tyd verander.", payoutEmailPh: "you@example.com", saveBtn: "Stoor", savedBtn: "Gestoor ✓", emailInvalid: "Dit lyk nie soos 'n geldige e-pos nie." },
  sw: { statusActive: "Inatumika", statusPending: "Inasubiri", statusSuspended: "Imesitishwa", ofClicks: "ya mibofyo", ofSignups: "ya usajili", payoutTitle: "Malipo", payoutOf: "kati ya", nextPayout: "Malipo yajayo", payoutReady: "Tayari kulipwa", refTitle: "Waliojisajili kupitia wewe", refCustomer: "Mteja", refJoined: "Alijiunga", refCommission: "Komisheni", stPending: "Inasubiri", stAvailable: "Inapatikana", stPaid: "Imelipwa", refEmpty: "Bado hakuna rufaa zinazolipa. Shiriki kiungo chako ili upate wa kwanza.", greetMorning: "Habari za asubuhi", greetNoon: "Habari za mchana", greetEvening: "Habari za jioni", greetNight: "Usiku mwema", linkIndividuals: "Watu binafsi", tabHome: "Nyumbani", tabMarketing: "Uuzaji", tabPayments: "Malipo", howEarnTitle: "Jinsi unavyopata", mktMsgTitle: "Ujumbe tayari kutumwa", mktMsgHint: "Nakili, bandika na ushiriki. Kiungo chako binafsi tayari kimo ndani.", tmpl1: "Nimepata zana inayoeleza kila neno kwa watoto kwa lugha wanayoielewa na kuwasaidia kuendana na kazi za shule. Inafaa kuangaliwa: {link}", tmpl2: "Kwa mtoto anayehangaika kuelewa maneno wakati wa kusoma: Gadit hueleza kila neno hadi mwisho, kwa mifano na picha. Kiungo: {link}", tmpl3: "Gadit ni kamusi inayoeleza kila neno kwa lugha ya mtoto mwenyewe na kujenga msamiati wake. Bila malipo kwa siku 14: {link}", copyMsg: "Nakili ujumbe", copiedMsg: "Imenakiliwa ✓", creativesTitle: "Picha za kushiriki", creativesHint: "Pakua na uchapishe kwenye mitandao ya kijamii, au tuma kwa kikundi chako.", download: "Pakua", payoutEmailTitle: "PayPal kwa malipo", payoutEmailHint: "Mahali tunapotuma komisheni yako. Unaweza kubadilisha wakati wowote.", payoutEmailPh: "you@example.com", saveBtn: "Hifadhi", savedBtn: "Imehifadhiwa ✓", emailInvalid: "Hiyo haionekani kama barua pepe halali." },
  "zh-CN": { statusActive: "已激活", statusPending: "待处理", statusSuspended: "已暂停", ofClicks: "点击量", ofSignups: "注册量", payoutTitle: "结算", payoutOf: "共", nextPayout: "下次结算", payoutReady: "可以结算", refTitle: "通过你注册的用户", refCustomer: "客户", refJoined: "加入时间", refCommission: "佣金", stPending: "待结算", stAvailable: "可提取", stPaid: "已支付", refEmpty: "还没有付费推荐。分享你的链接，获得第一位。", greetMorning: "早上好", greetNoon: "下午好", greetEvening: "晚上好", greetNight: "晚安", linkIndividuals: "个人用户", tabHome: "主页", tabMarketing: "营销", tabPayments: "结算", howEarnTitle: "你如何赚取佣金", mktMsgTitle: "现成的分享文案", mktMsgHint: "复制、粘贴并分享。你的专属链接已经包含在内。", tmpl1: "我发现了一个工具，能用孩子听得懂的语言解释每个词，帮助他们跟上学业。值得一看：{link}", tmpl2: "如果孩子在阅读时难以理解词语：Gadit 会把每个词彻底讲清楚，配有例句和图片。链接：{link}", tmpl3: "Gadit 是一款用孩子的母语解释每个词、帮助他们积累词汇的词典。免费试用 14 天：{link}", copyMsg: "复制文案", copiedMsg: "已复制 ✓", creativesTitle: "可分享的图片", creativesHint: "下载后发布到社交平台，或发送到你的群组。", download: "下载", payoutEmailTitle: "用于结算的 PayPal", payoutEmailHint: "我们把佣金发送到这里。你随时可以更改。", payoutEmailPh: "you@example.com", saveBtn: "保存", savedBtn: "已保存 ✓", emailInvalid: "这看起来不是有效的邮箱地址。" },
  "zh-TW": { statusActive: "已啟用", statusPending: "待處理", statusSuspended: "已暫停", ofClicks: "點擊次數", ofSignups: "註冊人數", payoutTitle: "結算", payoutOf: "共", nextPayout: "下次結算", payoutReady: "可以結算", refTitle: "透過你註冊的用戶", refCustomer: "客戶", refJoined: "加入時間", refCommission: "佣金", stPending: "待結算", stAvailable: "可提取", stPaid: "已支付", refEmpty: "還沒有付費推薦。分享你的連結，獲得第一位。", greetMorning: "早安", greetNoon: "午安", greetEvening: "晚上好", greetNight: "晚安", linkIndividuals: "個人用戶", tabHome: "首頁", tabMarketing: "行銷", tabPayments: "結算", howEarnTitle: "你如何賺取佣金", mktMsgTitle: "現成的分享文案", mktMsgHint: "複製、貼上並分享。你的專屬連結已經包含在內。", tmpl1: "我發現了一個工具，能用孩子聽得懂的語言解釋每個詞，幫助他們跟上課業。值得一看：{link}", tmpl2: "如果孩子在閱讀時難以理解詞語：Gadit 會把每個詞徹底講清楚，附有例句和圖片。連結：{link}", tmpl3: "Gadit 是一款用孩子的母語解釋每個詞、幫助他們累積詞彙的詞典。免費試用 14 天：{link}", copyMsg: "複製文案", copiedMsg: "已複製 ✓", creativesTitle: "可分享的圖片", creativesHint: "下載後發布到社群平台，或傳送到你的群組。", download: "下載", payoutEmailTitle: "用於結算的 PayPal", payoutEmailHint: "我們把佣金發送到這裡。你隨時可以更改。", payoutEmailPh: "you@example.com", saveBtn: "儲存", savedBtn: "已儲存 ✓", emailInvalid: "這看起來不是有效的電子郵件地址。" },
  ko: { statusActive: "활성", statusPending: "대기 중", statusSuspended: "일시중지", ofClicks: "클릭 수", ofSignups: "가입 수", payoutTitle: "정산", payoutOf: "중", nextPayout: "다음 정산", payoutReady: "정산 준비 완료", refTitle: "나를 통해 가입한 사람", refCustomer: "고객", refJoined: "가입일", refCommission: "수수료", stPending: "대기 중", stAvailable: "출금 가능", stPaid: "지급 완료", refEmpty: "아직 유료 추천이 없습니다. 링크를 공유해 첫 추천을 받아보세요.", greetMorning: "좋은 아침이에요", greetNoon: "좋은 오후예요", greetEvening: "좋은 저녁이에요", greetNight: "안녕히 주무세요", linkIndividuals: "개인", tabHome: "홈", tabMarketing: "마케팅", tabPayments: "정산", howEarnTitle: "수익을 얻는 방법", mktMsgTitle: "바로 보낼 수 있는 메시지", mktMsgHint: "복사해서 붙여넣고 공유하세요. 개인 링크가 이미 포함되어 있습니다.", tmpl1: "아이가 이해할 수 있는 언어로 모든 단어를 설명해 학업을 따라가도록 도와주는 도구를 찾았어요. 한번 보세요: {link}", tmpl2: "책을 읽으며 단어를 이해하기 어려워하는 아이에게: Gadit은 모든 단어를 예문과 그림과 함께 끝까지 설명해 줍니다. 링크: {link}", tmpl3: "Gadit은 아이의 모국어로 모든 단어를 설명하고 어휘력을 키워주는 사전입니다. 14일 무료: {link}", copyMsg: "메시지 복사", copiedMsg: "복사됨 ✓", creativesTitle: "공유할 이미지", creativesHint: "내려받아 소셜 미디어에 올리거나 그룹에 보내세요.", download: "다운로드", payoutEmailTitle: "정산용 PayPal", payoutEmailHint: "수수료를 보내드릴 곳입니다. 언제든지 변경할 수 있습니다.", payoutEmailPh: "you@example.com", saveBtn: "저장", savedBtn: "저장됨 ✓", emailInvalid: "유효한 이메일 주소가 아닌 것 같습니다." },
  th: { statusActive: "ใช้งานอยู่", statusPending: "รอดำเนินการ", statusSuspended: "หยุดชั่วคราว", ofClicks: "การคลิก", ofSignups: "การสมัคร", payoutTitle: "การจ่ายเงิน", payoutOf: "จาก", nextPayout: "การจ่ายเงินครั้งถัดไป", payoutReady: "พร้อมจ่ายแล้ว", refTitle: "ผู้ที่สมัครผ่านคุณ", refCustomer: "ลูกค้า", refJoined: "เข้าร่วมเมื่อ", refCommission: "ค่าคอมมิชชั่น", stPending: "รอดำเนินการ", stAvailable: "พร้อมถอน", stPaid: "จ่ายแล้ว", refEmpty: "ยังไม่มีการแนะนำที่ชำระเงิน แชร์ลิงก์ของคุณเพื่อรับคนแรก", greetMorning: "อรุณสวัสดิ์", greetNoon: "สวัสดีตอนบ่าย", greetEvening: "สวัสดีตอนเย็น", greetNight: "ราตรีสวัสดิ์", linkIndividuals: "บุคคลทั่วไป", tabHome: "หน้าแรก", tabMarketing: "การตลาด", tabPayments: "การจ่ายเงิน", howEarnTitle: "วิธีที่คุณได้รับรายได้", mktMsgTitle: "ข้อความพร้อมส่ง", mktMsgHint: "คัดลอก วาง แล้วแชร์ ลิงก์ส่วนตัวของคุณอยู่ในนั้นแล้ว", tmpl1: "ฉันเจอเครื่องมือที่อธิบายทุกคำด้วยภาษาที่เด็กเข้าใจ และช่วยให้พวกเขาตามบทเรียนได้ทัน ลองดูสิ: {link}", tmpl2: "สำหรับเด็กที่เข้าใจคำศัพท์ขณะอ่านได้ยาก: Gadit อธิบายทุกคำอย่างละเอียดจนหมด พร้อมตัวอย่างและรูปภาพ ลิงก์: {link}", tmpl3: "Gadit คือพจนานุกรมที่อธิบายทุกคำด้วยภาษาของเด็กเอง และช่วยสร้างคลังคำศัพท์ ทดลองใช้ฟรี 14 วัน: {link}", copyMsg: "คัดลอกข้อความ", copiedMsg: "คัดลอกแล้ว ✓", creativesTitle: "รูปภาพสำหรับแชร์", creativesHint: "ดาวน์โหลดแล้วโพสต์บนโซเชียล หรือส่งไปยังกลุ่มของคุณ", download: "ดาวน์โหลด", payoutEmailTitle: "PayPal สำหรับรับเงิน", payoutEmailHint: "ที่ที่เราจะส่งค่าคอมมิชชั่นให้คุณ คุณเปลี่ยนได้ทุกเมื่อ", payoutEmailPh: "you@example.com", saveBtn: "บันทึก", savedBtn: "บันทึกแล้ว ✓", emailInvalid: "ดูเหมือนว่านี่ไม่ใช่อีเมลที่ถูกต้อง" },
  bn: { statusActive: "সক্রিয়", statusPending: "অপেক্ষমাণ", statusSuspended: "স্থগিত", ofClicks: "ক্লিকের", ofSignups: "সাইনআপের", payoutTitle: "পেআউট", payoutOf: "এর মধ্যে", nextPayout: "পরবর্তী পেআউট", payoutReady: "পেআউটের জন্য প্রস্তুত", refTitle: "যারা আপনার মাধ্যমে সাইন আপ করেছেন", refCustomer: "গ্রাহক", refJoined: "যোগ দিয়েছেন", refCommission: "কমিশন", stPending: "অপেক্ষমাণ", stAvailable: "উপলব্ধ", stPaid: "পরিশোধিত", refEmpty: "এখনও কোনও পেইড রেফারেল নেই। প্রথমটি পেতে আপনার লিঙ্ক শেয়ার করুন।", greetMorning: "সুপ্রভাত", greetNoon: "শুভ অপরাহ্ন", greetEvening: "শুভ সন্ধ্যা", greetNight: "শুভ রাত্রি", linkIndividuals: "ব্যক্তি", tabHome: "হোম", tabMarketing: "মার্কেটিং", tabPayments: "পেআউট", howEarnTitle: "আপনি কীভাবে আয় করবেন", mktMsgTitle: "পাঠানোর জন্য প্রস্তুত বার্তা", mktMsgHint: "কপি করুন, পেস্ট করুন এবং শেয়ার করুন। আপনার ব্যক্তিগত লিঙ্ক এর মধ্যেই আছে।", tmpl1: "আমি এমন একটি টুল খুঁজে পেয়েছি যা শিশুদের বোধগম্য ভাষায় প্রতিটি শব্দ ব্যাখ্যা করে এবং পড়াশোনায় এগিয়ে থাকতে সাহায্য করে। একবার দেখুন: {link}", tmpl2: "যে শিশু পড়ার সময় শব্দ বুঝতে কষ্ট পায় তার জন্য: Gadit প্রতিটি শব্দ উদাহরণ ও ছবিসহ সম্পূর্ণভাবে ব্যাখ্যা করে। লিঙ্ক: {link}", tmpl3: "Gadit এমন একটি অভিধান যা শিশুর নিজের ভাষায় প্রতিটি শব্দ ব্যাখ্যা করে এবং তার শব্দভাণ্ডার গড়ে তোলে। ১৪ দিন বিনামূল্যে: {link}", copyMsg: "বার্তা কপি করুন", copiedMsg: "কপি হয়েছে ✓", creativesTitle: "শেয়ার করার জন্য ছবি", creativesHint: "ডাউনলোড করে সোশ্যাল মিডিয়ায় পোস্ট করুন, বা আপনার গ্রুপে পাঠান।", download: "ডাউনলোড", payoutEmailTitle: "পেআউটের জন্য PayPal", payoutEmailHint: "আমরা যেখানে আপনার কমিশন পাঠাব। আপনি যেকোনো সময় এটি পরিবর্তন করতে পারেন।", payoutEmailPh: "you@example.com", saveBtn: "সংরক্ষণ করুন", savedBtn: "সংরক্ষিত হয়েছে ✓", emailInvalid: "এটি একটি বৈধ ইমেল বলে মনে হচ্ছে না।" },
  da: { statusActive: "Aktiv", statusPending: "Afventer", statusSuspended: "Sat på pause", ofClicks: "af klik", ofSignups: "af tilmeldinger", payoutTitle: "Udbetaling", payoutOf: "af", nextPayout: "Næste udbetaling", payoutReady: "Klar til udbetaling", refTitle: "Hvem har tilmeldt sig gennem dig", refCustomer: "Kunde", refJoined: "Tilmeldt", refCommission: "Provision", stPending: "Afventer", stAvailable: "Tilgængelig", stPaid: "Betalt", refEmpty: "Ingen betalende henvisninger endnu. Del dit link for at få den første.", greetMorning: "Godmorgen", greetNoon: "God eftermiddag", greetEvening: "God aften", greetNight: "Godnat", linkIndividuals: "Privatpersoner", tabHome: "Hjem", tabMarketing: "Markedsføring", tabPayments: "Udbetalinger", howEarnTitle: "Sådan tjener du", mktMsgTitle: "Beskeder klar til at sende", mktMsgHint: "Kopier, indsæt og del. Dit personlige link er allerede med.", tmpl1: "Jeg har fundet et værktøj, der forklarer hvert ord for børn på et sprog, de forstår, og hjælper dem med at følge med i skolen. Værd at kigge på: {link}", tmpl2: "Til et barn, der har svært ved at forstå ord under læsning: Gadit forklarer hvert ord hele vejen igennem, med eksempler og et billede. Link: {link}", tmpl3: "Gadit er en ordbog, der forklarer hvert ord på barnets eget sprog og opbygger deres ordforråd. 14 dage gratis: {link}", copyMsg: "Kopier besked", copiedMsg: "Kopieret ✓", creativesTitle: "Billeder til at dele", creativesHint: "Download og del på sociale medier, eller send til din gruppe.", download: "Download", payoutEmailTitle: "PayPal til udbetalinger", payoutEmailHint: "Her sender vi din provision. Du kan ændre det når som helst.", payoutEmailPh: "you@example.com", saveBtn: "Gem", savedBtn: "Gemt ✓", emailInvalid: "Det ligner ikke en gyldig e-mail." },
  hu: { statusActive: "Aktív", statusPending: "Függőben", statusSuspended: "Szüneteltetve", ofClicks: "kattintásból", ofSignups: "regisztrációból", payoutTitle: "Kifizetés", payoutOf: "ebből", nextPayout: "Következő kifizetés", payoutReady: "Kifizetésre kész", refTitle: "Akik rajtad keresztül regisztráltak", refCustomer: "Ügyfél", refJoined: "Csatlakozott", refCommission: "Jutalék", stPending: "Függőben", stAvailable: "Elérhető", stPaid: "Kifizetve", refEmpty: "Még nincs fizető ajánlás. Oszd meg a linkedet, hogy megszerezd az elsőt.", greetMorning: "Jó reggelt", greetNoon: "Jó napot", greetEvening: "Jó estét", greetNight: "Jó éjszakát", linkIndividuals: "Magánszemélyek", tabHome: "Kezdőlap", tabMarketing: "Marketing", tabPayments: "Kifizetések", howEarnTitle: "Így keresel", mktMsgTitle: "Küldésre kész üzenetek", mktMsgHint: "Másold, illeszd be és oszd meg. A személyes linked már benne van.", tmpl1: "Találtam egy eszközt, amely a gyerekek számára érthető nyelven magyaráz el minden szót, és segít nekik lépést tartani a tananyaggal. Érdemes megnézni: {link}", tmpl2: "Olyan gyereknek, aki nehezen érti a szavakat olvasás közben: a Gadit minden szót alaposan elmagyaráz, példákkal és képpel. Link: {link}", tmpl3: "A Gadit egy szótár, amely a gyermek saját nyelvén magyaráz el minden szót, és bővíti a szókincsét. 14 nap ingyen: {link}", copyMsg: "Üzenet másolása", copiedMsg: "Másolva ✓", creativesTitle: "Megosztható képek", creativesHint: "Töltsd le és oszd meg a közösségi médiában, vagy küldd el a csoportodnak.", download: "Letöltés", payoutEmailTitle: "PayPal a kifizetésekhez", payoutEmailHint: "Ide küldjük a jutalékodat. Bármikor megváltoztathatod.", payoutEmailPh: "you@example.com", saveBtn: "Mentés", savedBtn: "Mentve ✓", emailInvalid: "Ez nem tűnik érvényes e-mail-címnek." },
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
  const [tab, setTab] = useState<"home" | "marketing" | "payments">("home");
  const [msgCopied, setMsgCopied] = useState<number | null>(null);
  const [token, setToken] = useState<string>("");
  const [payoutEmail, setPayoutEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [emailState, setEmailState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    const tk = new URLSearchParams(window.location.search).get("t");
    if (!tk) {
      setState("error");
      return;
    }
    setToken(tk);
    fetch(`/api/partner/stats?t=${encodeURIComponent(tk)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Stats) => {
        setStats(d);
        setPayoutEmail(d.payoutEmail || "");
        setSavedEmail(d.payoutEmail || "");
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

  async function copyMessage(idx: number, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsgCopied(idx);
      setTimeout(() => setMsgCopied((k) => (k === idx ? null : k)), 1800);
    } catch { /* clipboard blocked — ignore */ }
  }

  async function savePayoutEmail() {
    if (!token) return;
    const val = payoutEmail.trim();
    if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailState("error");
      return;
    }
    setEmailState("saving");
    try {
      const r = await fetch(`/api/partner/stats?t=${encodeURIComponent(token)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutEmail: val }),
      });
      if (!r.ok) throw new Error();
      setSavedEmail(val);
      setEmailState("saved");
      setTimeout(() => setEmailState((s) => (s === "saved" ? "idle" : s)), 2000);
    } catch {
      setEmailState("error");
    }
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

            {/* Tab bar — compact + centered, RTL-safe (spec §3). */}
            <div className="pd-tabs" style={S.tabs}>
              {([["home", m.tabHome], ["marketing", m.tabMarketing], ["payments", m.tabPayments]] as const).map(([k, label]) => (
                <button key={k} type="button" onClick={() => setTab(k)}
                  style={{ ...S.tab, ...(tab === k ? S.tabActive : {}) }}>{label}</button>
              ))}
            </div>

            {/* ================= HOME ================= */}
            {tab === "home" && (
              <>
                <div className="pd-kpi" style={S.kpiGrid}>
                  <Kpi label={t.clicks} value={stats.clicks.toLocaleString()} accent="#0EA5A5" />
                  <Kpi label={t.signups} value={stats.signups.toLocaleString()} accent="#7C3AED"
                       sub={stats.clicks > 0 ? `${Math.round((stats.signups / stats.clicks) * 100)}% ${m.ofClicks}` : undefined} />
                  <Kpi label={t.paying} value={stats.payingCustomers.toLocaleString()} accent="#0891B2"
                       sub={stats.signups > 0 ? `${Math.round((stats.payingCustomers / stats.signups) * 100)}% ${m.ofSignups}` : undefined} />
                  <Kpi label={t.available} value={hasEarnings ? money(stats.earnings[currencies[0]].released, currencies[0]) : "—"} accent="#16A34A" />
                </div>

                {/* Referral links — one per product, RefCapture attributes ?ref
                    on any of them. Shared language picker (used by templates too). */}
                <div style={S.card}>
                  <div style={S.cardLabel}>{t.yourLink}</div>
                  <div style={S.subtle}>{t.linksHint}</div>
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
              </>
            )}

            {/* ================= MARKETING ================= */}
            {tab === "marketing" && (
              <div style={S.col}>
                {/* How you earn */}
                <div style={S.card}>
                  <div style={S.cardLabel}>{m.howEarnTitle}</div>
                  <ol style={S.ol}>
                    <li style={S.li}>{t.how1}</li>
                    <li style={S.li}>{t.how2}</li>
                    <li style={S.li}>{t.how3}</li>
                  </ol>
                </div>

                {/* Ready-to-send messages — the partner's personal link baked in. */}
                <div style={S.card}>
                  <div style={S.cardLabel}>{m.mktMsgTitle}</div>
                  <div style={S.subtle}>{m.mktMsgHint}</div>
                  {[m.tmpl1, m.tmpl2, m.tmpl3].map((tpl, i) => {
                    const text = tpl.replace("{link}", buildRefLink(stats.code, linkLang, PRODUCT_PATHS.families));
                    return (
                      <div key={i} style={S.tmplCard}>
                        <div style={S.tmplText} dir={dir}>{text}</div>
                        <button type="button" onClick={() => copyMessage(i, text)} style={S.copyBtn}>
                          {msgCopied === i ? m.copiedMsg : m.copyMsg}
                        </button>
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

                {/* Images to share — real product shots, downloadable. */}
                <div style={S.card}>
                  <div style={S.cardLabel}>{m.creativesTitle}</div>
                  <div style={S.subtle}>{m.creativesHint}</div>
                  <div style={S.creativeGrid}>
                    {["/fam/hero.webp", "/fam/meanings.webp", "/fam/kids-mode.webp"].map((src) => (
                      <div key={src} style={S.creativeItem}>
                        <img src={src} alt="" style={S.creativeImg} loading="lazy" />
                        <a href={src} download style={S.downloadBtn}>{m.download}</a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= PAYMENTS ================= */}
            {tab === "payments" && (
              <div style={S.col}>
                {/* Earnings */}
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

                {/* PayPal payout email — partner-editable (PATCH). */}
                <div style={S.card}>
                  <div style={S.cardLabel}>{m.payoutEmailTitle}</div>
                  <div style={S.subtle}>{m.payoutEmailHint}</div>
                  <div style={S.emailRow}>
                    <input
                      type="email"
                      value={payoutEmail}
                      placeholder={m.payoutEmailPh}
                      onChange={(e) => { setPayoutEmail(e.target.value); if (emailState !== "idle") setEmailState("idle"); }}
                      style={S.emailInput}
                      dir="ltr"
                    />
                    <button type="button" onClick={savePayoutEmail}
                      disabled={emailState === "saving" || payoutEmail.trim() === savedEmail}
                      style={{ ...S.copyBtn, opacity: (emailState === "saving" || payoutEmail.trim() === savedEmail) ? 0.5 : 1 }}>
                      {emailState === "saved" ? m.savedBtn : m.saveBtn}
                    </button>
                  </div>
                  {emailState === "error" && <div style={{ fontSize: 12.5, color: "#B91C1C", marginTop: 8 }}>{m.emailInvalid}</div>}
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
              </div>
            )}
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
@media (max-width: 520px) { .pd-tabs button { padding: 7px 12px !important; font-size: 12.5px !important; } }
`;

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "#F4F6F8",
    fontFamily: "var(--font-rubik, -apple-system, Segoe UI, Roboto, sans-serif)",
    color: "#111827",
    paddingBottom: 64,
    overflowX: "hidden",
  },
  tabs: { display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", maxWidth: "100%", margin: "0 auto 24px" },
  tab: { border: "none", background: "#fff", color: "#6B7280", fontFamily: "inherit", fontSize: 14, fontWeight: 700, padding: "9px 20px", borderRadius: 10, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 1px 3px rgba(16,24,40,0.10)" },
  tabActive: { background: "#0EA5A5", color: "#fff", boxShadow: "0 2px 6px rgba(14,165,165,0.28)" },
  tmplCard: { background: "#F4F6F8", border: "1px solid #E9ECEF", borderRadius: 12, padding: 14, marginBottom: 12 },
  tmplText: { fontSize: 14, lineHeight: 1.65, color: "#374151", marginBottom: 10, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  creativeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginTop: 6 },
  creativeItem: { display: "flex", flexDirection: "column", gap: 8, alignItems: "stretch" },
  creativeImg: { width: "100%", height: 100, objectFit: "cover", borderRadius: 10, border: "1px solid #E9ECEF", background: "#fff" },
  downloadBtn: { display: "inline-block", textAlign: "center", background: "#0EA5A5", color: "#fff", textDecoration: "none", borderRadius: 8, padding: "7px 10px", fontWeight: 700, fontSize: 13 },
  emailRow: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 4 },
  emailInput: { flex: 1, minWidth: 200, fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1px solid #D1D5DB", fontFamily: "inherit", background: "#fff" },
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

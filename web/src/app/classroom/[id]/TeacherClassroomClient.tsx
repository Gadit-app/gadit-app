"use client";

/**
 * Teacher view of a single classroom.
 *
 * The school owner lands here from /schools by clicking "Open" on a
 * classroom row. We:
 *   - Read the classroom doc + classroom searches in real time.
 *   - Surface the 6-character code in a big mustard chip so the teacher
 *     can read it out loud or post it.
 *   - Surface a copyable link `https://gadit.app/c/<CODE>` for sharing
 *     into a teachers WhatsApp / printing on a worksheet.
 *   - Show the last 50 words the class searched, newest first, with
 *     the time they were searched.
 *
 * No PII. The search log has only word + lang + timestamp; we don't
 * know which child searched which word, only that "this classroom" did.
 * That's the whole privacy story of the Schools SKU and the reason
 * this page is safe to ship without a DPDP/COPPA compliance review.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { db } from "@/lib/firebase";
import type { Classroom } from "@/lib/school";
import { computeClassroomInsights, classroomLangLabel } from "@/lib/classroom-insights";

// Relative-time "now" label for the teacher activity feed.
const JUST_NOW_COPY: Record<string, string> = {
  en: "now",
  he: "עכשיו",
  ar: "الآن",
  ru: "сейчас",
  es: "ahora",
  pt: "agora",
  fr: "maintenant",
  de: "jetzt",
  cs: "teď",
  sk: "teraz",
  it: "ora",
  ja: "たった今",
  hi: "अभी",
  am: "አሁን",
  uk: "зараз",
  tr: "şimdi",
  pl: "teraz",
  fa: "اکنون",
  id: "baru saja",
  nl: "nu",
  el: "τώρα",
  zu: "manje",
  vi: "vừa xong",
  fil: "ngayon",
  af: "nou",
  sw: "sasa",
  "zh-CN": "刚刚",
  "zh-TW": "剛剛",
  ko: "방금",
  th: "เมื่อสักครู่",
  bn: "এখনই",
  da: "nu",
  hu: "most",
};

interface SearchEntry {
  id: string;
  word: string;
  lang: string;
  at: string;
  studentName?: string;
}

const COPY: Record<string, {
  title: string;
  classroomCodeLabel: string;
  shareLinkLabel: string;
  copyLinkBtn: string;
  copied: string;
  recentSearches: string;
  empty: string;
  back: string;
  loading: string;
  notFound: string;
  studentsLabel: string;
  studentsHint: string;
  addStudentPh: string;
  addStudentBtn: string;
  removeStudentAria: string;
  anonymousLabel: string;
  insightsTitle: string;
  totalLabel: string;
  totalAllTime: string;
  langMapTitle: string;
  langMapSub: string;
  notEnough: string;
  stuckTitle: string;
  stuckSub: string;
  supportTitle: string;
  supportSub: string;
  supportRosterHint: string;
  lookupsLabel: string;
  basedOn: (n: number) => string;
}> = {
  he: {
    title: "כיתה",
    classroomCodeLabel: "קוד הכיתה",
    shareLinkLabel: "לינק לילדים",
    copyLinkBtn: "העתק לינק",
    copied: "הועתק",
    recentSearches: "מילים שחיפשו לאחרונה",
    empty: "עדיין לא חיפשו מילים. הילדים יכולים להיכנס דרך הקוד למעלה.",
    back: "→ חזרה לבית הספר",
    loading: "טוען...",
    notFound: "כיתה לא נמצאה.",
    studentsLabel: "תלמידי הכיתה",
    studentsHint: "הוסיפו את שמות התלמידים והם יבחרו את עצמם כשייכנסו לקוד.",
    addStudentPh: "שם פרטי, או רשימה: מאיה, יוסי, רותם",
    addStudentBtn: "+ הוסף",
    removeStudentAria: "הסר תלמיד",
    anonymousLabel: "אנונימי",
    insightsTitle: "תובנות הכיתה",
    totalLabel: "סה\"כ חיפושים",
    totalAllTime: "מתחילת הדרך",
    langMapTitle: "השפות שהכיתה לומדת בהן",
    langMapSub: "כל חיפוש נענה בשפה של התלמיד. זו מפת השפות האמיתית של הכיתה.",
    notEnough: "עדיין אין מספיק נתונים.",
    stuckTitle: "מילים שהכיתה נתקעת עליהן",
    stuckSub: "כדאי ללמד אותן מראש לפני השיעור הבא.",
    supportTitle: "אולי צריכים תשומת לב נוספת",
    supportSub: "פרטי, רק בשבילך. ריבוי חיפושים יכול להעיד על קושי או פשוט על סקרנות.",
    supportRosterHint: "כשמוסיפים שמות תלמידים לרשימה למעלה, יופיע כאן איתות תמיכה פרטי.",
    lookupsLabel: "חיפושים",
    basedOn: (n) => `מבוסס על ${n} החיפושים האחרונים`,
  },
  en: {
    title: "Classroom",
    classroomCodeLabel: "Classroom code",
    shareLinkLabel: "Kids link",
    copyLinkBtn: "Copy link",
    copied: "Copied",
    recentSearches: "Recent searches",
    empty: "No searches yet. Kids can join with the code above.",
    back: "← Back to school",
    loading: "Loading…",
    notFound: "Classroom not found.",
    studentsLabel: "Class roster",
    studentsHint: "Add your students' names and they'll pick themselves when they open the code.",
    addStudentPh: "First name, or a list: Maya, Yossi, Rotem",
    addStudentBtn: "+ Add",
    removeStudentAria: "Remove student",
    anonymousLabel: "Anonymous",
    insightsTitle: "Class insights",
    totalLabel: "Total lookups",
    totalAllTime: "all time",
    langMapTitle: "Languages your class learns in",
    langMapSub: "Every lookup is answered in the student's own language. This is your class's real language map.",
    notEnough: "Not enough data yet.",
    stuckTitle: "Words your class gets stuck on",
    stuckSub: "Worth pre-teaching before the next lesson.",
    supportTitle: "May need extra attention",
    supportSub: "Private, just for you. Lots of lookups can mean a struggle or simply curiosity.",
    supportRosterHint: "Add student names to the roster above to see a private support signal here.",
    lookupsLabel: "lookups",
    basedOn: (n) => `Based on the last ${n} lookups`,
  },
  zu: {
    title: "Igumbi lokufunda",
    classroomCodeLabel: "Ikhodi yegumbi lokufunda",
    shareLinkLabel: "Isixhumanisi sezingane",
    copyLinkBtn: "Kopisha isixhumanisi",
    copied: "Kukopishiwe",
    recentSearches: "Ukusesha kwakamuva",
    empty: "Akukho kusesha okwamanje. Izingane zingajoyina ngekhodi engenhla.",
    back: "← Buyela esikoleni",
    loading: "Iyalayisha…",
    notFound: "Igumbi lokufunda alitholakalanga.",
    studentsLabel: "Uhlu lwabafundi bekilasi",
    studentsHint: "Faka amagama abafundi bakho, bazozikhetha uma bevula ikhodi.",
    addStudentPh: "Igama, noma uhlu: Maya, Yossi, Rotem",
    addStudentBtn: "+ Engeza",
    removeStudentAria: "Susa umfundi",
    anonymousLabel: "Ongaziwa",
    insightsTitle: "Imininingwane yekilasi",
    totalLabel: "Isamba sokubheka",
    totalAllTime: "sonke isikhathi",
    langMapTitle: "Izilimi ikilasi lakho elifunda ngazo",
    langMapSub: "Konke ukubheka kuphendulwa ngolimi lomfundi uqobo. Le yimephu yezilimi yangempela yekilasi lakho.",
    notEnough: "Ayikho idatha eyanele okwamanje.",
    stuckTitle: "Amagama ikilasi lakho elibhajwa kuwo",
    stuckSub: "Kufanele uwafundise kuqala ngaphambi kwesifundo esilandelayo.",
    supportTitle: "Kungenzeka badinga ukunakwa okwengeziwe",
    supportSub: "Kuyimfihlo, kungokwakho kuphela. Ukubheka okuningi kungasho ubunzima noma nje ukufuna ukwazi.",
    supportRosterHint: "Faka amagama abafundi ohlwini olungenhla ukuze ubone isignali yosekelo eyimfihlo lapha.",
    lookupsLabel: "ukubheka",
    basedOn: (n) => `Kusekelwe ekubhekeni kwakamuva okungu-${n}`,
  },
  el: {
    title: "Τάξη",
    classroomCodeLabel: "Κωδικός τάξης",
    shareLinkLabel: "Σύνδεσμος για παιδιά",
    copyLinkBtn: "Αντιγραφή συνδέσμου",
    copied: "Αντιγράφηκε",
    recentSearches: "Πρόσφατες αναζητήσεις",
    empty: "Δεν υπάρχουν αναζητήσεις ακόμη. Τα παιδιά μπορούν να συνδεθούν με τον κωδικό παραπάνω.",
    back: "← Πίσω στο σχολείο",
    loading: "Φόρτωση…",
    notFound: "Η τάξη δεν βρέθηκε.",
    studentsLabel: "Κατάλογος τάξης",
    studentsHint: "Πρόσθεσε τα ονόματα των μαθητών σου και θα επιλέγουν τον εαυτό τους όταν ανοίγουν τον κωδικό.",
    addStudentPh: "Όνομα, ή λίστα: Μαρία, Γιώργος, Ελένη",
    addStudentBtn: "+ Προσθήκη",
    removeStudentAria: "Αφαίρεση μαθητή",
    anonymousLabel: "Ανώνυμος",
    insightsTitle: "Στατιστικά τάξης",
    totalLabel: "Σύνολο αναζητήσεων",
    totalAllTime: "από την αρχή",
    langMapTitle: "Γλώσσες στις οποίες μαθαίνει η τάξη σου",
    langMapSub: "Κάθε αναζήτηση απαντάται στη γλώσσα του μαθητή. Αυτός είναι ο πραγματικός γλωσσικός χάρτης της τάξης σου.",
    notEnough: "Δεν υπάρχουν αρκετά δεδομένα ακόμη.",
    stuckTitle: "Λέξεις που δυσκολεύουν την τάξη σου",
    stuckSub: "Αξίζει να τις διδάξεις πριν το επόμενο μάθημα.",
    supportTitle: "Ίσως χρειάζονται επιπλέον προσοχή",
    supportSub: "Ιδιωτικό, μόνο για σένα. Πολλές αναζητήσεις μπορεί να σημαίνουν δυσκολία ή απλώς περιέργεια.",
    supportRosterHint: "Πρόσθεσε ονόματα μαθητών στον κατάλογο παραπάνω για να δεις εδώ ένα ιδιωτικό σήμα υποστήριξης.",
    lookupsLabel: "αναζητήσεις",
    basedOn: (n) => `Βασίζεται στις τελευταίες ${n} αναζητήσεις`,
  },
  hi: {
    title: "कक्षा",
    classroomCodeLabel: "कक्षा का कोड",
    shareLinkLabel: "बच्चों का लिंक",
    copyLinkBtn: "लिंक कॉपी करें",
    copied: "कॉपी हो गया",
    recentSearches: "हाल की खोज",
    empty: "अभी कोई खोज नहीं। बच्चे ऊपर के कोड से जुड़ सकते हैं।",
    back: "← स्कूल पर वापस",
    loading: "लोड हो रहा है…",
    notFound: "कक्षा नहीं मिली।",
    studentsLabel: "कक्षा की सूची",
    studentsHint: "अपने छात्रों के नाम जोड़ें, वे कोड खोलने पर अपना नाम चुनेंगे।",
    addStudentPh: "पहला नाम, या सूची: आर्या, राहुल, माया",
    addStudentBtn: "+ जोड़ें",
    removeStudentAria: "छात्र हटाएँ",
    anonymousLabel: "अनाम",
    insightsTitle: "कक्षा की जानकारी",
    totalLabel: "कुल खोजें",
    totalAllTime: "अब तक",
    langMapTitle: "आपकी कक्षा जिन भाषाओं में सीखती है",
    langMapSub: "हर खोज छात्र की अपनी भाषा में उत्तर देती है। यह आपकी कक्षा का असली भाषा-नक्शा है।",
    notEnough: "अभी पर्याप्त डेटा नहीं है।",
    stuckTitle: "जिन शब्दों पर कक्षा अटकती है",
    stuckSub: "अगले पाठ से पहले इन्हें पढ़ाना अच्छा रहेगा।",
    supportTitle: "शायद अतिरिक्त ध्यान चाहिए",
    supportSub: "निजी, सिर्फ़ आपके लिए। ज़्यादा खोजें कठिनाई या केवल जिज्ञासा दिखा सकती हैं।",
    supportRosterHint: "ऊपर सूची में छात्रों के नाम जोड़ें ताकि यहाँ निजी सहायता संकेत दिखे।",
    lookupsLabel: "खोजें",
    basedOn: (n) => `पिछली ${n} खोजों पर आधारित`,
  },
  am: {
    title: "ክፍል",
    classroomCodeLabel: "የክፍሉ ኮድ",
    shareLinkLabel: "የልጆች ሊንክ",
    copyLinkBtn: "ሊንኩን ኮፒ ያድርጉ",
    copied: "ተቀድቷል",
    recentSearches: "በቅርቡ የተፈለጉ ቃላት",
    empty: "እስካሁን ምንም ፍለጋ የለም። ልጆች ከላይ ባለው ኮድ መግባት ይችላሉ።",
    back: "← ወደ ትምህርት ቤቱ ተመለሱ",
    loading: "እየተጫነ ነው…",
    notFound: "ክፍሉ አልተገኘም።",
    studentsLabel: "የክፍሉ ተማሪዎች",
    studentsHint: "የተማሪዎችዎን ስሞች ይጨምሩ፣ ኮዱን ሲከፍቱ ራሳቸውን ይመርጣሉ።",
    addStudentPh: "የመጀመሪያ ስም፣ ወይም ዝርዝር፡ ሰላም፣ ዳዊት፣ ሃና",
    addStudentBtn: "+ ጨምር",
    removeStudentAria: "ተማሪ አስወግድ",
    anonymousLabel: "ስም አልባ",
    insightsTitle: "የክፍሉ ግንዛቤዎች",
    totalLabel: "ጠቅላላ ፍለጋዎች",
    totalAllTime: "ከጅምሩ",
    langMapTitle: "ክፍሉ የሚማርባቸው ቋንቋዎች",
    langMapSub: "እያንዳንዱ ፍለጋ በተማሪው ቋንቋ ይመለሳል። ይህ የክፍሉ እውነተኛ የቋንቋ ካርታ ነው።",
    notEnough: "እስካሁን በቂ መረጃ የለም።",
    stuckTitle: "ክፍሉ የሚቸገርባቸው ቃላት",
    stuckSub: "ከቀጣዩ ትምህርት በፊት እነሱን ማስተማር ጥሩ ነው።",
    supportTitle: "ተጨማሪ ትኩረት ሊፈልጉ ይችላሉ",
    supportSub: "የግል፣ ለእርስዎ ብቻ። ብዙ ፍለጋ ችግርን ወይም ጉጉትን ሊያሳይ ይችላል።",
    supportRosterHint: "ከላይ ባለው ዝርዝር የተማሪ ስሞችን ሲጨምሩ እዚህ የግል የድጋፍ ምልክት ይታያል።",
    lookupsLabel: "ፍለጋዎች",
    basedOn: (n) => `በመጨረሻዎቹ ${n} ፍለጋዎች ላይ የተመሠረተ`,
  },
  ar: {
    title: "الصف",
    classroomCodeLabel: "رمز الصف",
    shareLinkLabel: "رابط الأطفال",
    copyLinkBtn: "نسخ الرابط",
    copied: "تم النسخ",
    recentSearches: "عمليات البحث الأخيرة",
    empty: "لا توجد عمليات بحث بعد. يمكن للأطفال الانضمام بالرمز أعلاه.",
    back: "→ العودة إلى المدرسة",
    loading: "جارٍ التحميل…",
    notFound: "لم يتم العثور على الصف.",
    studentsLabel: "قائمة طلاب الصف",
    studentsHint: "أضف أسماء طلابك، وسيختار كل منهم اسمه عند فتح الرمز.",
    addStudentPh: "الاسم الأول، أو قائمة: مايا، يوسي، روتم",
    addStudentBtn: "+ إضافة",
    removeStudentAria: "إزالة الطالب",
    anonymousLabel: "مجهول",
    insightsTitle: "رؤى الصف",
    totalLabel: "إجمالي عمليات البحث",
    totalAllTime: "منذ البداية",
    langMapTitle: "اللغات التي يتعلم بها صفك",
    langMapSub: "كل بحث يُجاب عنه بلغة الطالب نفسه. هذه هي خريطة اللغات الحقيقية لصفك.",
    notEnough: "لا توجد بيانات كافية بعد.",
    stuckTitle: "الكلمات التي يتعثر فيها صفك",
    stuckSub: "من المفيد تدريسها مسبقًا قبل الدرس القادم.",
    supportTitle: "قد يحتاجون إلى اهتمام إضافي",
    supportSub: "خاص بك وحدك. كثرة عمليات البحث قد تعني صعوبة أو مجرد فضول.",
    supportRosterHint: "أضف أسماء الطلاب إلى القائمة أعلاه لترى هنا إشارة دعم خاصة.",
    lookupsLabel: "عمليات بحث",
    basedOn: (n) => `بناءً على آخر ${n} عمليات بحث`,
  },
  ru: {
    title: "Класс",
    classroomCodeLabel: "Код класса",
    shareLinkLabel: "Ссылка для детей",
    copyLinkBtn: "Скопировать ссылку",
    copied: "Скопировано",
    recentSearches: "Недавние поиски",
    empty: "Поисков пока нет. Дети могут присоединиться по коду выше.",
    back: "← Назад к школе",
    loading: "Загрузка…",
    notFound: "Класс не найден.",
    studentsLabel: "Список класса",
    studentsHint: "Добавьте имена учеников, и они выберут себя, когда откроют код.",
    addStudentPh: "Имя или список: Майя, Йоси, Ротем",
    addStudentBtn: "+ Добавить",
    removeStudentAria: "Удалить ученика",
    anonymousLabel: "Аноним",
    insightsTitle: "Аналитика класса",
    totalLabel: "Всего поисков",
    totalAllTime: "за всё время",
    langMapTitle: "Языки, на которых учится ваш класс",
    langMapSub: "Каждый поиск получает ответ на родном языке ученика. Это настоящая языковая карта вашего класса.",
    notEnough: "Пока недостаточно данных.",
    stuckTitle: "Слова, на которых класс спотыкается",
    stuckSub: "Стоит разобрать их заранее, до следующего урока.",
    supportTitle: "Может понадобиться дополнительное внимание",
    supportSub: "Видно только вам. Много поисков может означать трудности или просто любопытство.",
    supportRosterHint: "Добавьте имена учеников в список выше, чтобы видеть здесь личный сигнал поддержки.",
    lookupsLabel: "поисков",
    basedOn: (n) => `По последним ${n} поискам`,
  },
  es: {
    title: "Clase",
    classroomCodeLabel: "Código de la clase",
    shareLinkLabel: "Enlace para los niños",
    copyLinkBtn: "Copiar enlace",
    copied: "Copiado",
    recentSearches: "Búsquedas recientes",
    empty: "Todavía no hay búsquedas. Los niños pueden unirse con el código de arriba.",
    back: "← Volver a la escuela",
    loading: "Cargando…",
    notFound: "No se encontró la clase.",
    studentsLabel: "Lista de la clase",
    studentsHint: "Añade los nombres de tus alumnos y cada uno elegirá el suyo al abrir el código.",
    addStudentPh: "Nombre, o una lista: Maya, Yossi, Rotem",
    addStudentBtn: "+ Añadir",
    removeStudentAria: "Quitar alumno",
    anonymousLabel: "Anónimo",
    insightsTitle: "Datos de la clase",
    totalLabel: "Búsquedas totales",
    totalAllTime: "desde el inicio",
    langMapTitle: "Idiomas en los que aprende tu clase",
    langMapSub: "Cada búsqueda se responde en el idioma del propio alumno. Este es el mapa real de idiomas de tu clase.",
    notEnough: "Aún no hay suficientes datos.",
    stuckTitle: "Palabras en las que se atasca tu clase",
    stuckSub: "Conviene enseñarlas antes de la próxima clase.",
    supportTitle: "Podrían necesitar más atención",
    supportSub: "Privado, solo para ti. Muchas búsquedas pueden indicar dificultad o simple curiosidad.",
    supportRosterHint: "Añade nombres de alumnos a la lista de arriba para ver aquí una señal de apoyo privada.",
    lookupsLabel: "búsquedas",
    basedOn: (n) => `Según las últimas ${n} búsquedas`,
  },
  pt: {
    title: "Turma",
    classroomCodeLabel: "Código da turma",
    shareLinkLabel: "Link para as crianças",
    copyLinkBtn: "Copiar link",
    copied: "Copiado",
    recentSearches: "Pesquisas recentes",
    empty: "Ainda não há pesquisas. As crianças podem entrar com o código acima.",
    back: "← Voltar para a escola",
    loading: "Carregando…",
    notFound: "Turma não encontrada.",
    studentsLabel: "Lista da turma",
    studentsHint: "Adicione os nomes dos alunos e cada um escolhe o seu ao abrir o código.",
    addStudentPh: "Primeiro nome, ou uma lista: Maya, Yossi, Rotem",
    addStudentBtn: "+ Adicionar",
    removeStudentAria: "Remover aluno",
    anonymousLabel: "Anônimo",
    insightsTitle: "Dados da turma",
    totalLabel: "Total de pesquisas",
    totalAllTime: "desde o início",
    langMapTitle: "Idiomas em que sua turma aprende",
    langMapSub: "Cada pesquisa é respondida no idioma do próprio aluno. Este é o mapa real de idiomas da sua turma.",
    notEnough: "Ainda não há dados suficientes.",
    stuckTitle: "Palavras em que sua turma trava",
    stuckSub: "Vale a pena ensiná-las antes da próxima aula.",
    supportTitle: "Talvez precisem de mais atenção",
    supportSub: "Privado, só para você. Muitas pesquisas podem indicar dificuldade ou simples curiosidade.",
    supportRosterHint: "Adicione nomes de alunos à lista acima para ver aqui um sinal de apoio privado.",
    lookupsLabel: "pesquisas",
    basedOn: (n) => `Com base nas últimas ${n} pesquisas`,
  },
  fr: {
    title: "Classe",
    classroomCodeLabel: "Code de la classe",
    shareLinkLabel: "Lien pour les enfants",
    copyLinkBtn: "Copier le lien",
    copied: "Copié",
    recentSearches: "Recherches récentes",
    empty: "Aucune recherche pour l'instant. Les enfants peuvent rejoindre la classe avec le code ci-dessus.",
    back: "← Retour à l'école",
    loading: "Chargement…",
    notFound: "Classe introuvable.",
    studentsLabel: "Liste de la classe",
    studentsHint: "Ajoutez les prénoms de vos élèves, chacun choisira le sien en ouvrant le code.",
    addStudentPh: "Prénom, ou une liste : Maya, Yossi, Rotem",
    addStudentBtn: "+ Ajouter",
    removeStudentAria: "Retirer l'élève",
    anonymousLabel: "Anonyme",
    insightsTitle: "Aperçu de la classe",
    totalLabel: "Recherches au total",
    totalAllTime: "depuis le début",
    langMapTitle: "Les langues dans lesquelles votre classe apprend",
    langMapSub: "Chaque recherche reçoit une réponse dans la langue de l'élève. Voici la vraie carte des langues de votre classe.",
    notEnough: "Pas encore assez de données.",
    stuckTitle: "Les mots qui bloquent votre classe",
    stuckSub: "À présenter avant le prochain cours.",
    supportTitle: "Pourraient avoir besoin d'une attention particulière",
    supportSub: "Privé, visible par vous seul. Beaucoup de recherches peuvent signaler une difficulté ou simplement de la curiosité.",
    supportRosterHint: "Ajoutez les prénoms des élèves à la liste ci-dessus pour voir ici un signal de soutien privé.",
    lookupsLabel: "recherches",
    basedOn: (n) => `Sur la base des ${n} dernières recherches`,
  },
  de: {
    title: "Klasse",
    classroomCodeLabel: "Klassencode",
    shareLinkLabel: "Link für die Kinder",
    copyLinkBtn: "Link kopieren",
    copied: "Kopiert",
    recentSearches: "Letzte Suchen",
    empty: "Noch keine Suchen. Die Kinder können mit dem Code oben beitreten.",
    back: "← Zurück zur Schule",
    loading: "Wird geladen…",
    notFound: "Klasse nicht gefunden.",
    studentsLabel: "Klassenliste",
    studentsHint: "Füge die Namen deiner Schüler hinzu. Beim Öffnen des Codes wählen sie sich selbst aus.",
    addStudentPh: "Vorname, oder eine Liste: Maya, Yossi, Rotem",
    addStudentBtn: "+ Hinzufügen",
    removeStudentAria: "Schüler entfernen",
    anonymousLabel: "Anonym",
    insightsTitle: "Einblicke in die Klasse",
    totalLabel: "Suchen insgesamt",
    totalAllTime: "seit Beginn",
    langMapTitle: "Sprachen, in denen deine Klasse lernt",
    langMapSub: "Jede Suche wird in der eigenen Sprache des Schülers beantwortet. Das ist die echte Sprachkarte deiner Klasse.",
    notEnough: "Noch nicht genug Daten.",
    stuckTitle: "Wörter, an denen deine Klasse hängen bleibt",
    stuckSub: "Lohnt sich, sie vor der nächsten Stunde einzuführen.",
    supportTitle: "Brauchen vielleicht mehr Aufmerksamkeit",
    supportSub: "Privat, nur für dich. Viele Suchen können auf Schwierigkeiten hindeuten oder einfach auf Neugier.",
    supportRosterHint: "Füge oben Schülernamen zur Liste hinzu, um hier ein privates Unterstützungssignal zu sehen.",
    lookupsLabel: "Suchen",
    basedOn: (n) => `Basierend auf den letzten ${n} Suchen`,
  },
  cs: {
    title: "Třída",
    classroomCodeLabel: "Kód třídy",
    shareLinkLabel: "Odkaz pro děti",
    copyLinkBtn: "Kopírovat odkaz",
    copied: "Zkopírováno",
    recentSearches: "Nedávná hledání",
    empty: "Zatím žádná hledání. Děti se mohou připojit pomocí kódu výše.",
    back: "← Zpět na školu",
    loading: "Načítání…",
    notFound: "Třída nebyla nalezena.",
    studentsLabel: "Seznam třídy",
    studentsHint: "Přidejte jména svých žáků a po otevření kódu si každý vybere sám sebe.",
    addStudentPh: "Křestní jméno, nebo seznam: Maya, Yossi, Rotem",
    addStudentBtn: "+ Přidat",
    removeStudentAria: "Odebrat žáka",
    anonymousLabel: "Anonym",
    insightsTitle: "Přehled třídy",
    totalLabel: "Celkem hledání",
    totalAllTime: "od začátku",
    langMapTitle: "Jazyky, ve kterých se vaše třída učí",
    langMapSub: "Každé hledání je zodpovězeno v jazyce daného žáka. Toto je skutečná jazyková mapa vaší třídy.",
    notEnough: "Zatím nedostatek dat.",
    stuckTitle: "Slova, u kterých se třída zasekává",
    stuckSub: "Vyplatí se je probrat před další hodinou.",
    supportTitle: "Možná potřebují více pozornosti",
    supportSub: "Soukromé, jen pro vás. Hodně hledání může znamenat potíže, nebo jen zvědavost.",
    supportRosterHint: "Přidejte jména žáků do seznamu výše a uvidíte zde soukromý signál podpory.",
    lookupsLabel: "hledání",
    basedOn: (n) => `Na základě posledních ${n} hledání`,
  },
  sk: {
    title: "Trieda",
    classroomCodeLabel: "Kód triedy",
    shareLinkLabel: "Odkaz pre deti",
    copyLinkBtn: "Kopírovať odkaz",
    copied: "Skopírované",
    recentSearches: "Nedávne hľadania",
    empty: "Zatiaľ žiadne hľadania. Deti sa môžu pripojiť pomocou kódu vyššie.",
    back: "← Späť na školu",
    loading: "Načítava sa…",
    notFound: "Trieda sa nenašla.",
    studentsLabel: "Zoznam triedy",
    studentsHint: "Pridajte mená svojich žiakov a po otvorení kódu si každý vyberie sám seba.",
    addStudentPh: "Krstné meno, alebo zoznam: Maya, Yossi, Rotem",
    addStudentBtn: "+ Pridať",
    removeStudentAria: "Odstrániť žiaka",
    anonymousLabel: "Anonym",
    insightsTitle: "Prehľad triedy",
    totalLabel: "Hľadaní spolu",
    totalAllTime: "od začiatku",
    langMapTitle: "Jazyky, v ktorých sa vaša trieda učí",
    langMapSub: "Každé hľadanie je zodpovedané v jazyku daného žiaka. Toto je skutočná jazyková mapa vašej triedy.",
    notEnough: "Zatiaľ nedostatok údajov.",
    stuckTitle: "Slová, pri ktorých sa trieda zasekáva",
    stuckSub: "Oplatí sa ich prebrať pred ďalšou hodinou.",
    supportTitle: "Možno potrebujú viac pozornosti",
    supportSub: "Súkromné, len pre vás. Veľa hľadaní môže znamenať ťažkosti, alebo len zvedavosť.",
    supportRosterHint: "Pridajte mená žiakov do zoznamu vyššie a uvidíte tu súkromný signál podpory.",
    lookupsLabel: "hľadaní",
    basedOn: (n) => `Na základe posledných ${n} hľadaní`,
  },
  it: {
    title: "Classe",
    classroomCodeLabel: "Codice della classe",
    shareLinkLabel: "Link per i bambini",
    copyLinkBtn: "Copia link",
    copied: "Copiato",
    recentSearches: "Ricerche recenti",
    empty: "Ancora nessuna ricerca. I bambini possono entrare con il codice qui sopra.",
    back: "← Torna alla scuola",
    loading: "Caricamento…",
    notFound: "Classe non trovata.",
    studentsLabel: "Elenco della classe",
    studentsHint: "Aggiungi i nomi dei tuoi studenti: quando apriranno il codice, ognuno sceglierà il proprio.",
    addStudentPh: "Nome, o un elenco: Maya, Yossi, Rotem",
    addStudentBtn: "+ Aggiungi",
    removeStudentAria: "Rimuovi studente",
    anonymousLabel: "Anonimo",
    insightsTitle: "Panoramica della classe",
    totalLabel: "Ricerche totali",
    totalAllTime: "dall'inizio",
    langMapTitle: "Le lingue in cui impara la tua classe",
    langMapSub: "Ogni ricerca riceve risposta nella lingua dello studente. Questa è la vera mappa linguistica della tua classe.",
    notEnough: "Non ci sono ancora abbastanza dati.",
    stuckTitle: "Le parole su cui la classe si blocca",
    stuckSub: "Vale la pena anticiparle prima della prossima lezione.",
    supportTitle: "Potrebbero aver bisogno di più attenzione",
    supportSub: "Privato, solo per te. Molte ricerche possono indicare una difficoltà o semplice curiosità.",
    supportRosterHint: "Aggiungi i nomi degli studenti all'elenco qui sopra per vedere qui un segnale di supporto privato.",
    lookupsLabel: "ricerche",
    basedOn: (n) => `In base alle ultime ${n} ricerche`,
  },
  ja: {
    title: "クラス",
    classroomCodeLabel: "クラスコード",
    shareLinkLabel: "子ども用リンク",
    copyLinkBtn: "リンクをコピー",
    copied: "コピーしました",
    recentSearches: "最近の検索",
    empty: "まだ検索はありません。子どもたちは上のコードで参加できます。",
    back: "← 学校にもどる",
    loading: "読み込み中…",
    notFound: "クラスが見つかりません。",
    studentsLabel: "クラス名簿",
    studentsHint: "生徒の名前を追加すると、コードを開いたときに各自が自分の名前を選べます。",
    addStudentPh: "名前、または一覧: Maya, Yossi, Rotem",
    addStudentBtn: "+ 追加",
    removeStudentAria: "生徒を削除",
    anonymousLabel: "匿名",
    insightsTitle: "クラスの分析",
    totalLabel: "検索の合計",
    totalAllTime: "これまでの累計",
    langMapTitle: "クラスが学んでいる言語",
    langMapSub: "どの検索も、生徒自身の言語で答えが返ります。これがクラスの本当の言語マップです。",
    notEnough: "まだデータが足りません。",
    stuckTitle: "クラスがつまずいている言葉",
    stuckSub: "次の授業の前に教えておくのがおすすめです。",
    supportTitle: "もう少しサポートが必要かもしれません",
    supportSub: "あなただけに表示されます。検索が多いのは、困っているサインのことも、単なる好奇心のこともあります。",
    supportRosterHint: "上の名簿に生徒の名前を追加すると、ここに個別のサポートのサインが表示されます。",
    lookupsLabel: "回の検索",
    basedOn: (n) => `直近${n}件の検索に基づく`,
  },
  uk: {
    title: "Клас",
    classroomCodeLabel: "Код класу",
    shareLinkLabel: "Посилання для дітей",
    copyLinkBtn: "Скопіювати посилання",
    copied: "Скопійовано",
    recentSearches: "Нещодавні пошуки",
    empty: "Пошуків поки немає. Діти можуть приєднатися за кодом вище.",
    back: "← Назад до школи",
    loading: "Завантаження…",
    notFound: "Клас не знайдено.",
    studentsLabel: "Список класу",
    studentsHint: "Додайте імена учнів, і вони оберуть себе, коли відкриють код.",
    addStudentPh: "Ім'я або список: Майя, Йосі, Ротем",
    addStudentBtn: "+ Додати",
    removeStudentAria: "Видалити учня",
    anonymousLabel: "Анонім",
    insightsTitle: "Аналітика класу",
    totalLabel: "Усього пошуків",
    totalAllTime: "за весь час",
    langMapTitle: "Мови, якими навчається ваш клас",
    langMapSub: "Кожен пошук отримує відповідь рідною мовою учня. Це справжня мовна карта вашого класу.",
    notEnough: "Поки що недостатньо даних.",
    stuckTitle: "Слова, на яких клас спотикається",
    stuckSub: "Варто пояснити їх заздалегідь, до наступного уроку.",
    supportTitle: "Може знадобитися додаткова увага",
    supportSub: "Бачите лише ви. Багато пошуків може означати труднощі або просто цікавість.",
    supportRosterHint: "Додайте імена учнів до списку вище, щоб бачити тут особистий сигнал підтримки.",
    lookupsLabel: "пошуків",
    basedOn: (n) => `За останніми ${n} пошуками`,
  },
  tr: {
    title: "Sınıf",
    classroomCodeLabel: "Sınıf kodu",
    shareLinkLabel: "Çocuklar için bağlantı",
    copyLinkBtn: "Bağlantıyı kopyala",
    copied: "Kopyalandı",
    recentSearches: "Son aramalar",
    empty: "Henüz arama yok. Çocuklar yukarıdaki kodla katılabilir.",
    back: "← Okula dön",
    loading: "Yükleniyor…",
    notFound: "Sınıf bulunamadı.",
    studentsLabel: "Sınıf listesi",
    studentsHint: "Öğrencilerinizin adlarını ekleyin, kodu açtıklarında kendi adlarını seçecekler.",
    addStudentPh: "Ad veya liste: Maya, Yossi, Rotem",
    addStudentBtn: "+ Ekle",
    removeStudentAria: "Öğrenciyi kaldır",
    anonymousLabel: "Anonim",
    insightsTitle: "Sınıf içgörüleri",
    totalLabel: "Toplam arama",
    totalAllTime: "başından beri",
    langMapTitle: "Sınıfınızın öğrendiği diller",
    langMapSub: "Her arama öğrencinin kendi dilinde yanıtlanır. Bu, sınıfınızın gerçek dil haritasıdır.",
    notEnough: "Henüz yeterli veri yok.",
    stuckTitle: "Sınıfınızın takıldığı kelimeler",
    stuckSub: "Bir sonraki dersten önce öğretmeye değer.",
    supportTitle: "Ek ilgiye ihtiyaç duyabilir",
    supportSub: "Gizli, yalnızca sizin için. Çok sayıda arama zorlanmaya ya da sadece merağa işaret edebilir.",
    supportRosterHint: "Burada gizli bir destek sinyali görmek için yukarıdaki listeye öğrenci adları ekleyin.",
    lookupsLabel: "arama",
    basedOn: (n) => `Son ${n} aramaya göre`,
  },
  pl: {
    title: "Klasa",
    classroomCodeLabel: "Kod klasy",
    shareLinkLabel: "Link dla dzieci",
    copyLinkBtn: "Kopiuj link",
    copied: "Skopiowano",
    recentSearches: "Ostatnie wyszukiwania",
    empty: "Na razie brak wyszukiwań. Dzieci mogą dołączyć za pomocą kodu powyżej.",
    back: "← Wróć do szkoły",
    loading: "Ładowanie…",
    notFound: "Nie znaleziono klasy.",
    studentsLabel: "Lista klasy",
    studentsHint: "Dodaj imiona uczniów, a po otwarciu kodu każdy wybierze siebie.",
    addStudentPh: "Imię lub lista: Maya, Yossi, Rotem",
    addStudentBtn: "+ Dodaj",
    removeStudentAria: "Usuń ucznia",
    anonymousLabel: "Anonimowo",
    insightsTitle: "Statystyki klasy",
    totalLabel: "Wyszukiwania łącznie",
    totalAllTime: "od początku",
    langMapTitle: "Języki, w których uczy się Twoja klasa",
    langMapSub: "Każde wyszukiwanie otrzymuje odpowiedź w języku danego ucznia. To prawdziwa mapa językowa Twojej klasy.",
    notEnough: "Na razie za mało danych.",
    stuckTitle: "Słowa, na których klasa się zatrzymuje",
    stuckSub: "Warto je omówić przed następną lekcją.",
    supportTitle: "Mogą potrzebować więcej uwagi",
    supportSub: "Prywatne, tylko dla Ciebie. Wiele wyszukiwań może oznaczać trudności albo po prostu ciekawość.",
    supportRosterHint: "Dodaj imiona uczniów do listy powyżej, aby zobaczyć tutaj prywatny sygnał wsparcia.",
    lookupsLabel: "wyszukiwań",
    basedOn: (n) => `Na podstawie ostatnich ${n} wyszukiwań`,
  },
  fa: {
    title: "کلاس",
    classroomCodeLabel: "کد کلاس",
    shareLinkLabel: "پیوند برای بچه‌ها",
    copyLinkBtn: "کپی پیوند",
    copied: "کپی شد",
    recentSearches: "جست‌وجوهای اخیر",
    empty: "هنوز جست‌وجویی انجام نشده. بچه‌ها می‌توانند با کد بالا وارد شوند.",
    back: "→ بازگشت به مدرسه",
    loading: "در حال بارگذاری…",
    notFound: "کلاس پیدا نشد.",
    studentsLabel: "فهرست کلاس",
    studentsHint: "نام دانش‌آموزان را اضافه کنید تا هنگام باز کردن کد، هر کدام نام خود را انتخاب کنند.",
    addStudentPh: "نام کوچک، یا فهرست: مایا، یوسی، روتم",
    addStudentBtn: "+ افزودن",
    removeStudentAria: "حذف دانش‌آموز",
    anonymousLabel: "ناشناس",
    insightsTitle: "بینش‌های کلاس",
    totalLabel: "مجموع جست‌وجوها",
    totalAllTime: "از ابتدا",
    langMapTitle: "زبان‌هایی که کلاس شما با آن‌ها یاد می‌گیرد",
    langMapSub: "هر جست‌وجو به زبان خود دانش‌آموز پاسخ داده می‌شود. این نقشه واقعی زبان‌های کلاس شماست.",
    notEnough: "هنوز داده کافی وجود ندارد.",
    stuckTitle: "کلمه‌هایی که کلاس روی آن‌ها گیر می‌کند",
    stuckSub: "بهتر است پیش از درس بعدی آن‌ها را آموزش دهید.",
    supportTitle: "شاید به توجه بیشتری نیاز داشته باشند",
    supportSub: "خصوصی، فقط برای شما. جست‌وجوی زیاد می‌تواند نشانه دشواری یا فقط کنجکاوی باشد.",
    supportRosterHint: "نام دانش‌آموزان را به فهرست بالا اضافه کنید تا اینجا یک نشانه پشتیبانی خصوصی ببینید.",
    lookupsLabel: "جست‌وجو",
    basedOn: (n) => `بر اساس ${n} جست‌وجوی اخیر`,
  },
  id: {
    title: "Kelas",
    classroomCodeLabel: "Kode kelas",
    shareLinkLabel: "Tautan untuk anak-anak",
    copyLinkBtn: "Salin tautan",
    copied: "Disalin",
    recentSearches: "Pencarian terbaru",
    empty: "Belum ada pencarian. Anak-anak bisa bergabung dengan kode di atas.",
    back: "← Kembali ke sekolah",
    loading: "Memuat…",
    notFound: "Kelas tidak ditemukan.",
    studentsLabel: "Daftar kelas",
    studentsHint: "Tambahkan nama murid Anda, dan mereka akan memilih nama sendiri saat membuka kode.",
    addStudentPh: "Nama depan, atau daftar: Maya, Yossi, Rotem",
    addStudentBtn: "+ Tambah",
    removeStudentAria: "Hapus murid",
    anonymousLabel: "Anonim",
    insightsTitle: "Wawasan kelas",
    totalLabel: "Total pencarian",
    totalAllTime: "sejak awal",
    langMapTitle: "Bahasa yang dipakai kelas Anda untuk belajar",
    langMapSub: "Setiap pencarian dijawab dalam bahasa murid itu sendiri. Inilah peta bahasa kelas Anda yang sebenarnya.",
    notEnough: "Data belum cukup.",
    stuckTitle: "Kata yang sering membuat kelas Anda tersendat",
    stuckSub: "Sebaiknya diajarkan lebih dulu sebelum pelajaran berikutnya.",
    supportTitle: "Mungkin perlu perhatian lebih",
    supportSub: "Pribadi, hanya untuk Anda. Banyak pencarian bisa berarti kesulitan atau sekadar rasa ingin tahu.",
    supportRosterHint: "Tambahkan nama murid ke daftar di atas untuk melihat sinyal dukungan pribadi di sini.",
    lookupsLabel: "pencarian",
    basedOn: (n) => `Berdasarkan ${n} pencarian terakhir`,
  },
  nl: {
    title: "Klas",
    classroomCodeLabel: "Klascode",
    shareLinkLabel: "Link voor de kinderen",
    copyLinkBtn: "Link kopiëren",
    copied: "Gekopieerd",
    recentSearches: "Recente zoekopdrachten",
    empty: "Nog geen zoekopdrachten. Kinderen kunnen meedoen met de code hierboven.",
    back: "← Terug naar school",
    loading: "Laden…",
    notFound: "Klas niet gevonden.",
    studentsLabel: "Klassenlijst",
    studentsHint: "Voeg de namen van je leerlingen toe, dan kiezen ze zichzelf wanneer ze de code openen.",
    addStudentPh: "Voornaam, of een lijst: Maya, Yossi, Rotem",
    addStudentBtn: "+ Toevoegen",
    removeStudentAria: "Leerling verwijderen",
    anonymousLabel: "Anoniem",
    insightsTitle: "Inzichten in de klas",
    totalLabel: "Totaal zoekopdrachten",
    totalAllTime: "sinds het begin",
    langMapTitle: "Talen waarin je klas leert",
    langMapSub: "Elke zoekopdracht wordt beantwoord in de eigen taal van de leerling. Dit is de echte taalkaart van je klas.",
    notEnough: "Nog niet genoeg gegevens.",
    stuckTitle: "Woorden waar je klas op vastloopt",
    stuckSub: "De moeite waard om vóór de volgende les te behandelen.",
    supportTitle: "Hebben misschien extra aandacht nodig",
    supportSub: "Privé, alleen voor jou. Veel zoekopdrachten kunnen wijzen op moeite of gewoon op nieuwsgierigheid.",
    supportRosterHint: "Voeg leerlingnamen toe aan de lijst hierboven om hier een privé ondersteuningssignaal te zien.",
    lookupsLabel: "zoekopdrachten",
    basedOn: (n) => `Op basis van de laatste ${n} zoekopdrachten`,
  },
  vi: {
    title: "Lớp học",
    classroomCodeLabel: "Mã lớp",
    shareLinkLabel: "Liên kết cho học sinh",
    copyLinkBtn: "Sao chép liên kết",
    copied: "Đã sao chép",
    recentSearches: "Tra cứu gần đây",
    empty: "Chưa có lượt tra cứu nào. Học sinh có thể tham gia bằng mã ở trên.",
    back: "← Quay lại trường",
    loading: "Đang tải…",
    notFound: "Không tìm thấy lớp học.",
    studentsLabel: "Danh sách lớp",
    studentsHint: "Thêm tên học sinh, các em sẽ tự chọn tên mình khi mở mã.",
    addStudentPh: "Tên, hoặc danh sách: Maya, Yossi, Rotem",
    addStudentBtn: "+ Thêm",
    removeStudentAria: "Xóa học sinh",
    anonymousLabel: "Ẩn danh",
    insightsTitle: "Thông tin về lớp",
    totalLabel: "Tổng lượt tra cứu",
    totalAllTime: "từ trước đến nay",
    langMapTitle: "Các ngôn ngữ lớp bạn dùng để học",
    langMapSub: "Mỗi lượt tra cứu được trả lời bằng chính ngôn ngữ của học sinh. Đây là bản đồ ngôn ngữ thực sự của lớp bạn.",
    notEnough: "Chưa đủ dữ liệu.",
    stuckTitle: "Những từ lớp bạn hay gặp khó",
    stuckSub: "Nên dạy trước trước buổi học tới.",
    supportTitle: "Có thể cần quan tâm thêm",
    supportSub: "Riêng tư, chỉ bạn thấy. Tra cứu nhiều có thể là dấu hiệu gặp khó khăn hoặc đơn giản là tò mò.",
    supportRosterHint: "Thêm tên học sinh vào danh sách ở trên để thấy tín hiệu hỗ trợ riêng tư tại đây.",
    lookupsLabel: "lượt tra cứu",
    basedOn: (n) => `Dựa trên ${n} lượt tra cứu gần nhất`,
  },
  fil: {
    title: "Klase",
    classroomCodeLabel: "Code ng klase",
    shareLinkLabel: "Link para sa mga bata",
    copyLinkBtn: "Kopyahin ang link",
    copied: "Nakopya",
    recentSearches: "Mga kamakailang paghahanap",
    empty: "Wala pang paghahanap. Puwedeng sumali ang mga bata gamit ang code sa itaas.",
    back: "← Bumalik sa paaralan",
    loading: "Naglo-load…",
    notFound: "Hindi nahanap ang klase.",
    studentsLabel: "Listahan ng klase",
    studentsHint: "Idagdag ang mga pangalan ng iyong mga estudyante at pipiliin nila ang sarili nila pagbukas ng code.",
    addStudentPh: "Pangalan, o listahan: Maya, Yossi, Rotem",
    addStudentBtn: "+ Idagdag",
    removeStudentAria: "Alisin ang estudyante",
    anonymousLabel: "Anonymous",
    insightsTitle: "Mga insight ng klase",
    totalLabel: "Kabuuang paghahanap",
    totalAllTime: "mula sa simula",
    langMapTitle: "Mga wikang ginagamit ng klase mo sa pag-aaral",
    langMapSub: "Bawat paghahanap ay sinasagot sa sariling wika ng estudyante. Ito ang tunay na mapa ng mga wika ng klase mo.",
    notEnough: "Kulang pa ang datos.",
    stuckTitle: "Mga salitang nagpapahirap sa klase mo",
    stuckSub: "Sulit ituro na bago ang susunod na leksiyon.",
    supportTitle: "Baka kailangan ng dagdag na pansin",
    supportSub: "Pribado, para sa iyo lang. Ang maraming paghahanap ay puwedeng mangahulugan ng hirap o simpleng pagkamausisa.",
    supportRosterHint: "Magdagdag ng mga pangalan ng estudyante sa listahan sa itaas para makita rito ang pribadong senyales ng suporta.",
    lookupsLabel: "paghahanap",
    basedOn: (n) => `Batay sa huling ${n} paghahanap`,
  },
  af: {
    title: "Klas",
    classroomCodeLabel: "Klaskode",
    shareLinkLabel: "Skakel vir die kinders",
    copyLinkBtn: "Kopieer skakel",
    copied: "Gekopieer",
    recentSearches: "Onlangse soektogte",
    empty: "Nog geen soektogte nie. Kinders kan aansluit met die kode hierbo.",
    back: "← Terug na die skool",
    loading: "Laai tans…",
    notFound: "Klas nie gevind nie.",
    studentsLabel: "Klaslys",
    studentsHint: "Voeg jou leerders se name by, dan kies hulle hulself wanneer hulle die kode oopmaak.",
    addStudentPh: "Voornaam, of 'n lys: Maya, Yossi, Rotem",
    addStudentBtn: "+ Voeg by",
    removeStudentAria: "Verwyder leerder",
    anonymousLabel: "Anoniem",
    insightsTitle: "Klasinsigte",
    totalLabel: "Totale soektogte",
    totalAllTime: "van die begin af",
    langMapTitle: "Tale waarin jou klas leer",
    langMapSub: "Elke soektog word in die leerder se eie taal beantwoord. Dit is jou klas se ware taalkaart.",
    notEnough: "Nog nie genoeg data nie.",
    stuckTitle: "Woorde waaroor jou klas struikel",
    stuckSub: "Die moeite werd om voor die volgende les te onderrig.",
    supportTitle: "Het dalk ekstra aandag nodig",
    supportSub: "Privaat, net vir jou. Baie soektogte kan op 'n sukkel dui, of net op nuuskierigheid.",
    supportRosterHint: "Voeg leerders se name by die lys hierbo om hier 'n privaat ondersteuningsein te sien.",
    lookupsLabel: "soektogte",
    basedOn: (n) => `Gebaseer op die laaste ${n} soektogte`,
  },
  sw: {
    title: "Darasa",
    classroomCodeLabel: "Msimbo wa darasa",
    shareLinkLabel: "Kiungo cha watoto",
    copyLinkBtn: "Nakili kiungo",
    copied: "Imenakiliwa",
    recentSearches: "Utafutaji wa hivi karibuni",
    empty: "Bado hakuna utafutaji. Watoto wanaweza kujiunga kwa msimbo ulio hapo juu.",
    back: "← Rudi shuleni",
    loading: "Inapakia…",
    notFound: "Darasa halikupatikana.",
    studentsLabel: "Orodha ya darasa",
    studentsHint: "Ongeza majina ya wanafunzi wako, nao watajichagua watakapofungua msimbo.",
    addStudentPh: "Jina la kwanza, au orodha: Maya, Yossi, Rotem",
    addStudentBtn: "+ Ongeza",
    removeStudentAria: "Ondoa mwanafunzi",
    anonymousLabel: "Asiyejulikana",
    insightsTitle: "Maarifa ya darasa",
    totalLabel: "Jumla ya utafutaji",
    totalAllTime: "tangu mwanzo",
    langMapTitle: "Lugha ambazo darasa lako hujifunzia",
    langMapSub: "Kila utafutaji hujibiwa kwa lugha ya mwanafunzi mwenyewe. Hii ndiyo ramani halisi ya lugha za darasa lako.",
    notEnough: "Bado hakuna data ya kutosha.",
    stuckTitle: "Maneno yanayolikwamisha darasa lako",
    stuckSub: "Inafaa kuyafundisha kabla ya somo lijalo.",
    supportTitle: "Huenda wakahitaji uangalizi zaidi",
    supportSub: "Faragha, kwa ajili yako tu. Utafutaji mwingi unaweza kuashiria ugumu au udadisi tu.",
    supportRosterHint: "Ongeza majina ya wanafunzi kwenye orodha iliyo juu ili kuona hapa ishara ya faragha ya usaidizi.",
    lookupsLabel: "utafutaji",
    basedOn: (n) => `Kulingana na utafutaji ${n} wa mwisho`,
  },
  "zh-CN": {
    title: "班级",
    classroomCodeLabel: "班级代码",
    shareLinkLabel: "学生链接",
    copyLinkBtn: "复制链接",
    copied: "已复制",
    recentSearches: "最近查询",
    empty: "还没有查询。孩子们可以用上面的代码加入。",
    back: "← 返回学校",
    loading: "加载中…",
    notFound: "找不到这个班级。",
    studentsLabel: "班级名单",
    studentsHint: "添加学生的名字，他们打开代码时就能选择自己。",
    addStudentPh: "名字，或一个名单：Maya, Yossi, Rotem",
    addStudentBtn: "+ 添加",
    removeStudentAria: "移除学生",
    anonymousLabel: "匿名",
    insightsTitle: "班级洞察",
    totalLabel: "查询总数",
    totalAllTime: "累计",
    langMapTitle: "你的班级用哪些语言学习",
    langMapSub: "每次查询都会用学生自己的语言解答。这就是你班级真实的语言地图。",
    notEnough: "数据还不够。",
    stuckTitle: "班级容易卡住的词",
    stuckSub: "值得在下节课前先讲一讲。",
    supportTitle: "可能需要更多关注",
    supportSub: "仅你可见。查询多可能意味着有困难，也可能只是好奇。",
    supportRosterHint: "在上方名单中添加学生名字，这里就会显示私密的支持提示。",
    lookupsLabel: "次查询",
    basedOn: (n) => `基于最近 ${n} 次查询`,
  },
  "zh-TW": {
    title: "班級",
    classroomCodeLabel: "班級代碼",
    shareLinkLabel: "學生連結",
    copyLinkBtn: "複製連結",
    copied: "已複製",
    recentSearches: "最近查詢",
    empty: "還沒有查詢。孩子們可以用上面的代碼加入。",
    back: "← 返回學校",
    loading: "載入中…",
    notFound: "找不到這個班級。",
    studentsLabel: "班級名單",
    studentsHint: "新增學生的名字，他們打開代碼時就能選擇自己。",
    addStudentPh: "名字，或一份名單：Maya, Yossi, Rotem",
    addStudentBtn: "+ 新增",
    removeStudentAria: "移除學生",
    anonymousLabel: "匿名",
    insightsTitle: "班級洞察",
    totalLabel: "查詢總數",
    totalAllTime: "累計",
    langMapTitle: "你的班級用哪些語言學習",
    langMapSub: "每次查詢都會用學生自己的語言解答。這就是你班級真實的語言地圖。",
    notEnough: "資料還不夠。",
    stuckTitle: "班級容易卡住的詞",
    stuckSub: "值得在下堂課前先講一講。",
    supportTitle: "可能需要更多關注",
    supportSub: "僅你可見。查詢多可能代表遇到困難，也可能只是好奇。",
    supportRosterHint: "在上方名單中新增學生名字，這裡就會顯示私密的支援提示。",
    lookupsLabel: "次查詢",
    basedOn: (n) => `根據最近 ${n} 次查詢`,
  },
  ko: {
    title: "학급",
    classroomCodeLabel: "학급 코드",
    shareLinkLabel: "학생용 링크",
    copyLinkBtn: "링크 복사",
    copied: "복사됨",
    recentSearches: "최근 검색",
    empty: "아직 검색이 없어요. 아이들은 위의 코드로 참여할 수 있어요.",
    back: "← 학교로 돌아가기",
    loading: "불러오는 중…",
    notFound: "학급을 찾을 수 없어요.",
    studentsLabel: "학급 명단",
    studentsHint: "학생 이름을 추가하면 코드를 열 때 각자 자기 이름을 고를 수 있어요.",
    addStudentPh: "이름, 또는 목록: Maya, Yossi, Rotem",
    addStudentBtn: "+ 추가",
    removeStudentAria: "학생 삭제",
    anonymousLabel: "익명",
    insightsTitle: "학급 인사이트",
    totalLabel: "전체 검색 수",
    totalAllTime: "누적",
    langMapTitle: "우리 학급이 배우는 언어",
    langMapSub: "모든 검색은 학생 자신의 언어로 답변돼요. 이것이 학급의 실제 언어 지도예요.",
    notEnough: "아직 데이터가 충분하지 않아요.",
    stuckTitle: "학급이 자주 막히는 단어",
    stuckSub: "다음 수업 전에 미리 가르쳐 두면 좋아요.",
    supportTitle: "추가 관심이 필요할 수 있어요",
    supportSub: "나만 볼 수 있어요. 검색이 많다는 건 어려움일 수도, 단순한 호기심일 수도 있어요.",
    supportRosterHint: "위 명단에 학생 이름을 추가하면 여기에 비공개 지원 신호가 표시돼요.",
    lookupsLabel: "회 검색",
    basedOn: (n) => `최근 ${n}회 검색 기준`,
  },
  th: {
    title: "ห้องเรียน",
    classroomCodeLabel: "รหัสห้องเรียน",
    shareLinkLabel: "ลิงก์สำหรับเด็ก",
    copyLinkBtn: "คัดลอกลิงก์",
    copied: "คัดลอกแล้ว",
    recentSearches: "การค้นหาล่าสุด",
    empty: "ยังไม่มีการค้นหา เด็ก ๆ เข้าร่วมได้ด้วยรหัสด้านบน",
    back: "← กลับไปที่โรงเรียน",
    loading: "กำลังโหลด…",
    notFound: "ไม่พบห้องเรียน",
    studentsLabel: "รายชื่อนักเรียน",
    studentsHint: "เพิ่มชื่อนักเรียน แล้วเมื่อเปิดรหัส แต่ละคนจะเลือกชื่อของตัวเอง",
    addStudentPh: "ชื่อ หรือรายชื่อ: Maya, Yossi, Rotem",
    addStudentBtn: "+ เพิ่ม",
    removeStudentAria: "ลบนักเรียน",
    anonymousLabel: "ไม่ระบุชื่อ",
    insightsTitle: "ข้อมูลเชิงลึกของห้องเรียน",
    totalLabel: "การค้นหาทั้งหมด",
    totalAllTime: "ตั้งแต่เริ่มต้น",
    langMapTitle: "ภาษาที่ห้องเรียนของคุณใช้เรียนรู้",
    langMapSub: "ทุกการค้นหาได้รับคำตอบเป็นภาษาของนักเรียนเอง นี่คือแผนที่ภาษาที่แท้จริงของห้องเรียนคุณ",
    notEnough: "ยังมีข้อมูลไม่เพียงพอ",
    stuckTitle: "คำที่ห้องเรียนของคุณมักติดขัด",
    stuckSub: "ควรสอนล่วงหน้าก่อนบทเรียนถัดไป",
    supportTitle: "อาจต้องการความใส่ใจเพิ่มเติม",
    supportSub: "เป็นส่วนตัว เห็นได้เฉพาะคุณ การค้นหาบ่อยอาจหมายถึงความยากลำบาก หรือแค่ความอยากรู้",
    supportRosterHint: "เพิ่มชื่อนักเรียนในรายชื่อด้านบน เพื่อดูสัญญาณการช่วยเหลือแบบส่วนตัวที่นี่",
    lookupsLabel: "การค้นหา",
    basedOn: (n) => `จากการค้นหาล่าสุด ${n} ครั้ง`,
  },
  bn: {
    title: "ক্লাস",
    classroomCodeLabel: "ক্লাসের কোড",
    shareLinkLabel: "শিশুদের লিংক",
    copyLinkBtn: "লিংক কপি করুন",
    copied: "কপি হয়েছে",
    recentSearches: "সাম্প্রতিক খোঁজ",
    empty: "এখনো কোনো খোঁজ নেই। শিশুরা ওপরের কোড দিয়ে যোগ দিতে পারে।",
    back: "← স্কুলে ফিরে যান",
    loading: "লোড হচ্ছে…",
    notFound: "ক্লাস পাওয়া যায়নি।",
    studentsLabel: "ক্লাসের তালিকা",
    studentsHint: "শিক্ষার্থীদের নাম যোগ করুন, কোড খুললে তারা নিজের নাম বেছে নেবে।",
    addStudentPh: "প্রথম নাম, বা তালিকা: Maya, Yossi, Rotem",
    addStudentBtn: "+ যোগ করুন",
    removeStudentAria: "শিক্ষার্থী সরান",
    anonymousLabel: "বেনামি",
    insightsTitle: "ক্লাসের বিশ্লেষণ",
    totalLabel: "মোট খোঁজ",
    totalAllTime: "শুরু থেকে",
    langMapTitle: "আপনার ক্লাস যে ভাষাগুলোতে শেখে",
    langMapSub: "প্রতিটি খোঁজের উত্তর আসে শিক্ষার্থীর নিজের ভাষায়। এটাই আপনার ক্লাসের আসল ভাষা-মানচিত্র।",
    notEnough: "এখনো যথেষ্ট তথ্য নেই।",
    stuckTitle: "যে শব্দগুলোতে ক্লাস আটকে যায়",
    stuckSub: "পরের পাঠের আগে এগুলো শিখিয়ে রাখা ভালো।",
    supportTitle: "হয়তো বাড়তি মনোযোগ দরকার",
    supportSub: "ব্যক্তিগত, শুধু আপনার জন্য। বেশি খোঁজ মানে অসুবিধা হতে পারে, আবার নিছক কৌতূহলও হতে পারে।",
    supportRosterHint: "ওপরের তালিকায় শিক্ষার্থীদের নাম যোগ করলে এখানে একটি ব্যক্তিগত সহায়তা সংকেত দেখা যাবে।",
    lookupsLabel: "খোঁজ",
    basedOn: (n) => `সর্বশেষ ${n}টি খোঁজের ভিত্তিতে`,
  },
  da: {
    title: "Klasse",
    classroomCodeLabel: "Klassekode",
    shareLinkLabel: "Link til børnene",
    copyLinkBtn: "Kopiér link",
    copied: "Kopieret",
    recentSearches: "Seneste søgninger",
    empty: "Ingen søgninger endnu. Børnene kan deltage med koden ovenfor.",
    back: "← Tilbage til skolen",
    loading: "Indlæser…",
    notFound: "Klassen blev ikke fundet.",
    studentsLabel: "Klasseliste",
    studentsHint: "Tilføj dine elevers navne, så vælger de sig selv, når de åbner koden.",
    addStudentPh: "Fornavn, eller en liste: Maya, Yossi, Rotem",
    addStudentBtn: "+ Tilføj",
    removeStudentAria: "Fjern elev",
    anonymousLabel: "Anonym",
    insightsTitle: "Indsigt i klassen",
    totalLabel: "Søgninger i alt",
    totalAllTime: "siden start",
    langMapTitle: "Sprog, din klasse lærer på",
    langMapSub: "Hver søgning besvares på elevens eget sprog. Dette er din klasses virkelige sprogkort.",
    notEnough: "Ikke nok data endnu.",
    stuckTitle: "Ord, din klasse går i stå ved",
    stuckSub: "Værd at gennemgå før næste time.",
    supportTitle: "Har måske brug for ekstra opmærksomhed",
    supportSub: "Privat, kun for dig. Mange søgninger kan betyde, at det er svært, eller blot nysgerrighed.",
    supportRosterHint: "Tilføj elevnavne til listen ovenfor for at se et privat støttesignal her.",
    lookupsLabel: "søgninger",
    basedOn: (n) => `Baseret på de seneste ${n} søgninger`,
  },
  hu: {
    title: "Osztály",
    classroomCodeLabel: "Osztálykód",
    shareLinkLabel: "Link a gyerekeknek",
    copyLinkBtn: "Link másolása",
    copied: "Kimásolva",
    recentSearches: "Legutóbbi keresések",
    empty: "Még nincs keresés. A gyerekek a fenti kóddal csatlakozhatnak.",
    back: "← Vissza az iskolához",
    loading: "Betöltés…",
    notFound: "Az osztály nem található.",
    studentsLabel: "Osztálynévsor",
    studentsHint: "Add hozzá a diákjaid nevét, és a kód megnyitásakor mindenki kiválasztja magát.",
    addStudentPh: "Keresztnév, vagy egy lista: Maya, Yossi, Rotem",
    addStudentBtn: "+ Hozzáadás",
    removeStudentAria: "Diák eltávolítása",
    anonymousLabel: "Névtelen",
    insightsTitle: "Osztálystatisztika",
    totalLabel: "Összes keresés",
    totalAllTime: "a kezdetektől",
    langMapTitle: "Nyelvek, amelyeken az osztályod tanul",
    langMapSub: "Minden keresésre a diák saját nyelvén érkezik a válasz. Ez az osztályod valódi nyelvi térképe.",
    notEnough: "Még nincs elég adat.",
    stuckTitle: "Szavak, amelyeknél az osztály elakad",
    stuckSub: "Érdemes előre átvenni őket a következő óra előtt.",
    supportTitle: "Talán több figyelmet igényelnek",
    supportSub: "Privát, csak neked. A sok keresés jelenthet nehézséget, vagy egyszerűen kíváncsiságot.",
    supportRosterHint: "Adj diákneveket a fenti névsorhoz, hogy itt privát támogatási jelzést láss.",
    lookupsLabel: "keresés",
    basedOn: (n) => `Az utolsó ${n} keresés alapján`,
  },
};

export function TeacherClassroomClient({ classroomId }: { classroomId: string }) {
  const { user, schoolId, loading } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const c = COPY[lang] ?? COPY.en;

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [classroomChecked, setClassroomChecked] = useState(false);
  const [searches, setSearches] = useState<SearchEntry[]>([]);
  const [copied, setCopied] = useState(false);
  // New-student-name draft + busy flag. The teacher types a first
  // name and hits Enter or "+ Add" to append to the classroom roster.
  // Server-side dedupes so adding the same name twice is a no-op.
  const [newStudentName, setNewStudentName] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);

  async function addStudent() {
    if (!user || addingStudent) return;
    // Bulk add: split the input on commas, semicolons, or newlines so
    // the teacher can paste a whole class list ("רותם, מאיה, יוסי, ...")
    // in one go. Gadi (2026-06-29): "if a teacher wants to add 20
    // students at once and separate by comma, can we do that?"
    // Dedupe case-insensitively and cap at 50 per submission so a paste
    // accident doesn't blow past the 60-per-classroom roster limit.
    const parts = newStudentName
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length <= 40);
    const seen = new Set<string>();
    const names: string[] = [];
    for (const p of parts) {
      const key = p.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      names.push(p);
      if (names.length >= 50) break;
    }
    if (names.length === 0) return;
    setAddingStudent(true);
    try {
      const idToken = await user.getIdToken();
      // Fire all in parallel — the server-side endpoint is idempotent
      // and uses FieldValue.arrayUnion, so concurrent calls are safe.
      // For 20 names this completes in under a second on a normal
      // network; well below any UI tolerance.
      await Promise.all(
        names.map((name) =>
          fetch("/api/schools/students", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
            body: JSON.stringify({ classroomId, name }),
          }).then(async (res) => {
            if (!res.ok) console.error("add student failed:", name, await res.text());
          }).catch((err) => console.error("add student failed:", name, err)),
        ),
      );
      setNewStudentName("");
    } finally {
      setAddingStudent(false);
    }
  }

  async function removeStudent(name: string) {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      await fetch(`/api/schools/students?classroomId=${encodeURIComponent(classroomId)}&name=${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
    } catch (err) {
      console.error("remove student failed:", err);
    }
  }

  useEffect(() => {
    if (!user || !schoolId) return;
    const ref = doc(db, "schools", schoolId, "classrooms", classroomId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setClassroom({ id: snap.id, ...(snap.data() as Omit<Classroom, "id">) });
        } else {
          setClassroom(null);
        }
        setClassroomChecked(true);
      },
      () => setClassroomChecked(true)
    );
    // Pull a wider window than the 50-row list needs so the insight
    // aggregation (language map, stuck words, support signal) has a
    // meaningful sample. 300 realtime docs is cheap for a page a teacher
    // opens occasionally.
    const searchesQ = query(
      collection(db, "schools", schoolId, "classrooms", classroomId, "searches"),
      orderBy("at", "desc"),
      limit(300),
    );
    const unsubSearches = onSnapshot(
      searchesQ,
      (snap) => {
        setSearches(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SearchEntry, "id">) })),
        );
      },
      () => {},
    );
    return () => {
      unsub();
      unsubSearches();
    };
  }, [user, schoolId, classroomId]);

  const kidsLink = useMemo(() => {
    if (!classroom) return "";
    if (typeof window === "undefined") return `https://gadit.app/c/${classroom.code}`;
    return `${window.location.origin}/c/${classroom.code}`;
  }, [classroom]);

  // Class-level insights (council-approved unit of measurement): language
  // map + stuck words + private support signal. Computed from the loaded
  // window; total-ever comes from the classroom doc's searchCount.
  const insights = useMemo(() => computeClassroomInsights(searches), [searches]);
  const recentToShow = useMemo(() => searches.slice(0, 50), [searches]);

  if (loading) {
    return <div className="wordbook wb-school-page" dir={dir}>&nbsp;</div>;
  }
  if (!user) {
    router.replace(href("/pricing"));
    return null;
  }
  if (!schoolId || schoolId !== user.uid) {
    router.replace(href("/pricing"));
    return null;
  }
  if (!classroomChecked) {
    return <div className="wordbook wb-school-page" dir={dir}>&nbsp;</div>;
  }
  if (!classroom) {
    return (
      <div className="wordbook wb-school-page" dir={dir}>
        <main className="wb-school-main">
          <Link href={href("/schools")} className="wb-family-back">{c.back}</Link>
          <p style={{ marginTop: 16 }}>{c.notFound}</p>
        </main>
      </div>
    );
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(kidsLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Some browsers without secure context. The link is visible so
      // the user can copy manually.
    }
  }

  return (
    <div className="wordbook wb-school-page school-admin-mustard" dir={dir}>
      {/* Match the mustard Schools SKU accent used across the /schools
          dashboard (Gadi 2026-08-03, full coherence). Scoped to this admin
          view; the kid /c/<CODE> surface keeps the core teal. */}
      <style>{`
        .school-admin-mustard .wb-school-cta {
          background: #CA8A04 !important;
          box-shadow: 0 1px 2px rgba(202,138,4,0.28), 0 8px 22px -8px rgba(202,138,4,0.42) !important;
        }
        .school-admin-mustard .wb-school-cta:hover { background: #A16207 !important; }
        .school-admin-mustard .wb-school-cta:focus-visible { outline: 2px solid #CA8A04 !important; }
      `}</style>
      <main className="wb-school-main">
        <Link href={href("/schools")} className="wb-family-back">{c.back}</Link>

        <h1 className="wb-school-title" style={{ marginBottom: 32 }}>
          {classroom.name || c.title}
        </h1>
        {/* "X מילים נחפשו" subtitle removed 2026-06-28: redundant
            with the count surfaced inside the "מילים שחיפשו לאחרונה"
            heading below, AND was grammatically awkward in Hebrew
            (singular "1 מילה" vs plural "X מילים" needed branching). */}

        {/* Code chip + kids-link section removed 2026-06-28. Both
            now live on /schools (the code as a mustard pill in each
            row, the kids link as a copy button next to the action
            icons). The teacher view is now focused on the search log
            and the class roster. */}

        {/* Class roster. Teacher pre-loads first names; when set,
            the kid view at /c/<CODE> shows a "pick your name"
            picker on first visit so each search log gets tagged.
            Empty roster = anonymous mode (no picker, no name tag). */}
        <section style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: "var(--wb-serif)",
              fontWeight: 700,
              fontSize: 20,
              color: "var(--ink)",
              margin: "0 0 6px",
            }}
          >
            {c.studentsLabel}
          </h2>
          <p
            style={{
              fontFamily: "var(--wb-sans)",
              fontSize: 13,
              color: "var(--ink-soft, #6B7280)",
              margin: "0 0 14px",
            }}
          >
            {c.studentsHint}
          </p>
          {(classroom.students ?? []).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {(classroom.students ?? []).map((sn) => (
                <span
                  key={sn}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    background: "#FEF3C7",
                    border: "1px solid #FCD34D",
                    borderRadius: 999,
                    fontFamily: "var(--wb-sans)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#A16207",
                  }}
                >
                  {sn}
                  <button
                    type="button"
                    onClick={() => removeStudent(sn)}
                    aria-label={c.removeStudentAria}
                    title={c.removeStudentAria}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#A16207",
                      padding: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: 14,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
            <textarea
              value={newStudentName}
              placeholder={c.addStudentPh}
              onChange={(e) => setNewStudentName(e.target.value)}
              onKeyDown={(e) => {
                // Ctrl/Cmd+Enter submits; bare Enter inserts a newline so
                // teachers can paste/type multi-line lists.
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  addStudent();
                }
              }}
              disabled={addingStudent}
              rows={2}
              style={{
                flex: 1,
                padding: "10px 14px",
                border: "1.5px solid #D6D3D1",
                borderRadius: 10,
                background: "#FFFFFF",
                fontFamily: "var(--wb-sans)",
                fontSize: 15,
                color: "var(--ink)",
                outline: "none",
                resize: "vertical",
                minHeight: 44,
                lineHeight: 1.4,
              }}
            />
            <button
              type="button"
              className="wb-school-cta"
              onClick={addStudent}
              disabled={addingStudent || !newStudentName.trim()}
              style={{
                width: "auto",
                padding: "10px 18px",
                opacity: !newStudentName.trim() ? 0.5 : 1,
              }}
            >
              {c.addStudentBtn}
            </button>
          </div>
        </section>

        {/* Class insights — the council-approved value: comprehension
            made visible at the CLASS level. Language map (which languages
            the class learns in), stuck words (pre-teach these), a total
            (proof of use), and a PRIVATE support signal (never a public
            ranking). Only shown once the class has looked something up. */}
        {searches.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: "var(--wb-serif)", fontWeight: 700, fontSize: 20, color: "var(--ink)", margin: "0 0 4px" }}>
              {c.insightsTitle}
            </h2>
            <p style={{ fontFamily: "var(--wb-sans)", fontSize: 12.5, color: "var(--ink-soft, #6B7280)", margin: "0 0 16px" }}>
              {c.basedOn(insights.sampleSize)}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              {/* Total lookups — proof of use, all-time from the counter. */}
              <div style={insightCardStyle}>
                <div style={insightLabelStyle}>{c.totalLabel}</div>
                <div style={{ fontFamily: "var(--wb-serif)", fontWeight: 700, fontSize: 40, color: "#CA8A04", lineHeight: 1.05 }}>
                  {(classroom.searchCount ?? 0).toLocaleString()}
                </div>
                <div style={{ fontFamily: "var(--wb-sans)", fontSize: 12, color: "var(--ink-soft, #9CA3AF)" }}>
                  {c.totalAllTime}
                </div>
              </div>

              {/* Language map — the un-fakeable home-language signal. */}
              <div style={insightCardStyle}>
                <div style={insightLabelStyle}>{c.langMapTitle}</div>
                <p style={insightSubStyle}>{c.langMapSub}</p>
                {insights.languages.length === 0 ? (
                  <p style={{ fontFamily: "var(--wb-sans)", fontSize: 13, color: "var(--ink-soft, #9CA3AF)", margin: 0 }}>{c.notEnough}</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                    {insights.languages.map((l) => (
                      <div key={l.lang} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: "var(--wb-sans)", fontSize: 13, fontWeight: 600, color: "var(--ink)", minWidth: 78 }}>
                          {classroomLangLabel(l.lang)}
                        </span>
                        <span style={{ flex: 1, height: 8, background: "#F3F4F6", borderRadius: 999, overflow: "hidden" }}>
                          <span style={{ display: "block", height: "100%", width: `${Math.max(l.pct, 3)}%`, background: "#CA8A04", borderRadius: 999 }} />
                        </span>
                        <span style={{ fontFamily: "var(--wb-sans)", fontSize: 12, fontWeight: 600, color: "var(--ink-soft, #6B7280)", minWidth: 34, textAlign: "end" }}>
                          {l.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stuck words — the pre-teach list. */}
            <div style={{ ...insightCardStyle, marginTop: 14 }}>
              <div style={insightLabelStyle}>{c.stuckTitle}</div>
              <p style={insightSubStyle}>{c.stuckSub}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {insights.topWords.map((w) => (
                  <Link
                    key={w.word}
                    href={href(`/word/${encodeURIComponent(w.word)}`)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "6px 12px", background: "#FFFBEB", border: "1px solid #FDE68A",
                      borderRadius: 999, textDecoration: "none",
                      fontFamily: "var(--wb-sans)", fontSize: 14, fontWeight: 600, color: "#92400E",
                    }}
                  >
                    <span>{w.word}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#CA8A04", background: "#FEF3C7", borderRadius: 999, padding: "1px 7px" }}>
                      {w.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Private support signal — teacher-only, never a public
                leaderboard. Shows only when the roster has named students. */}
            <div style={{ ...insightCardStyle, marginTop: 14 }}>
              <div style={insightLabelStyle}>{c.supportTitle}</div>
              <p style={insightSubStyle}>{c.supportSub}</p>
              {insights.students.length === 0 ? (
                <p style={{ fontFamily: "var(--wb-sans)", fontSize: 13, color: "var(--ink-soft, #9CA3AF)", margin: 0 }}>
                  {c.supportRosterHint}
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                  {insights.students.map((st) => (
                    <div key={st.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontFamily: "var(--wb-sans)", fontSize: 14, fontWeight: 600, color: "var(--ink)", flex: 1 }}>
                        {st.name}
                      </span>
                      <span style={{ fontFamily: "var(--wb-sans)", fontSize: 12.5, color: "var(--ink-soft, #6B7280)" }}>
                        {st.count} {c.lookupsLabel}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Recent searches list. Newest first. Each row carries the
            student name (when the roster picker was used) so the
            teacher can see who searched what. */}
        <section>
          <h2 style={{
            fontFamily: "var(--wb-serif)",
            fontWeight: 700,
            fontSize: 20,
            color: "var(--ink)",
            margin: "0 0 14px",
          }}>
            {c.recentSearches}
          </h2>
          {searches.length === 0 ? (
            <p className="wb-school-sub">{c.empty}</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {recentToShow.map((s) => (
                <li
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "12px 14px",
                    background: "var(--surface)",
                    border: "1px solid var(--hairline)",
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                >
                  <Link
                    href={href(`/word/${encodeURIComponent(s.word)}`)}
                    style={{
                      fontFamily: "var(--wb-serif)",
                      fontWeight: 700,
                      fontSize: 18,
                      color: "var(--ink)",
                      textDecoration: "none",
                      flex: 1,
                    }}
                  >
                    {s.word}
                  </Link>
                  <span
                    style={{
                      fontFamily: "var(--wb-sans)",
                      fontSize: 13,
                      fontWeight: 600,
                      color: s.studentName ? "#A16207" : "var(--ink-faint, #9CA3AF)",
                      fontStyle: s.studentName ? "normal" : "italic",
                    }}
                  >
                    {s.studentName || c.anonymousLabel}
                  </span>
                  <span style={{
                    fontFamily: "var(--wb-sans)",
                    fontSize: 12,
                    color: "var(--ink-soft)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}>
                    {s.lang}
                  </span>
                  <span style={{
                    fontFamily: "var(--wb-sans)",
                    fontSize: 13,
                    color: "var(--ink-soft)",
                  }}>
                    {formatRelativeTime(s.at, lang)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

// Shared styles for the insight cards (mustard-accented, matching the
// Schools SKU brand).
const insightCardStyle: React.CSSProperties = {
  background: "var(--surface, #fff)",
  border: "1px solid var(--hairline, #E5E7EB)",
  borderRadius: 14,
  padding: "16px 18px",
};
const insightLabelStyle: React.CSSProperties = {
  fontFamily: "var(--wb-sans)",
  fontSize: 13,
  fontWeight: 700,
  color: "var(--ink)",
  marginBottom: 4,
};
const insightSubStyle: React.CSSProperties = {
  fontFamily: "var(--wb-sans)",
  fontSize: 12.5,
  color: "var(--ink-soft, #6B7280)",
  lineHeight: 1.45,
  margin: "0 0 12px",
};

// Tiny relative-time formatter. Enough granularity for a teacher
// scanning today's class activity ("now / 5m / 1h / yesterday").
// For older searches we fall back to the locale date string.
function formatRelativeTime(iso: string, lang: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";
  const ms = Date.now() - then;
  const min = Math.floor(ms / 60_000);
  const hr = Math.floor(ms / 3_600_000);
  const day = Math.floor(ms / 86_400_000);
  if (min < 1) return JUST_NOW_COPY[lang] ?? JUST_NOW_COPY.en;
  if (min < 60) return `${min}m`;
  if (hr < 24) return `${hr}h`;
  if (day < 7) return `${day}d`;
  return new Date(then).toLocaleDateString();
}

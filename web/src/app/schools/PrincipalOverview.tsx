"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";
import { classroomLangLabel, type LangCount, type WordCount } from "@/lib/classroom-insights";
import { classroomColorFor } from "@/lib/school";

/**
 * Principal's school-wide roll-up (the "Overview" tab of /schools).
 *
 * Rolls the class-level signal the council settled on up to the whole
 * building: total lookups, a school-wide language map + stuck words, and
 * a per-classroom list ranked by activity, each linking to the full
 * classroom view and offering the teacher's by-code link to hand off.
 * Data comes from /api/schools/insights (owner-authed aggregation).
 */

type ClassroomRow = {
  id: string;
  name: string;
  code: string;
  colorIndex: number;
  totalAllTime: number;
  sampleSize: number;
  topLanguage: string;
};

type ApiResponse = {
  totalAllTime: number;
  classroomCount: number;
  languages: LangCount[];
  topWords: WordCount[];
  sampleSize: number;
  classrooms: ClassroomRow[];
};

type Copy = {
  loading: string;
  error: string;
  empty: string;
  emptyNoActivity: string;
  totalLabel: string;
  classroomsLabel: string;
  langMapTitle: string;
  langMapSub: string;
  stuckTitle: string;
  stuckSub: string;
  notEnough: string;
  classroomsTitle: string;
  open: string;
  teacherLink: string;
  teacherLinkCopied: string;
  lookups: string;
  basedOn: (n: number) => string;
};

const COPY: Record<string, Copy> = {
  he: {
    loading: "טוען...",
    error: "לא הצלחנו לטעון את התובנות. אפשר לנסות שוב.",
    empty: "עדיין אין כיתות. הוסיפו כיתה ראשונה כדי לקבל קוד לילדים.",
    emptyNoActivity: "עדיין אין חיפושים. שתפו את קוד הכיתה עם התלמידים והחיפושים שלהם יופיעו כאן.",
    totalLabel: "סה\"כ חיפושים בבית הספר",
    classroomsLabel: "כיתות",
    langMapTitle: "השפות שבית הספר לומד בהן",
    langMapSub: "כל חיפוש נענה בשפה של התלמיד. זו מפת השפות של בית הספר.",
    stuckTitle: "מילים שבית הספר נתקע עליהן",
    stuckSub: "המילים שהכי הרבה תלמידים חיפשו, בכל הכיתות.",
    notEnough: "עדיין אין מספיק נתונים.",
    classroomsTitle: "כיתות לפי פעילות",
    open: "פתיחה",
    teacherLink: "לינק למורה",
    teacherLinkCopied: "הועתק",
    lookups: "חיפושים",
    basedOn: (n) => `מפות מבוססות על ${n} החיפושים האחרונים`,
  },
  en: {
    loading: "Loading…",
    error: "Couldn't load insights. Please try again.",
    empty: "No classrooms yet. Add your first classroom to get a code for the kids.",
    emptyNoActivity: "No lookups yet. Share the classroom code with your students and their searches will appear here.",
    totalLabel: "Total lookups across the school",
    classroomsLabel: "classrooms",
    langMapTitle: "Languages your school learns in",
    langMapSub: "Every lookup is answered in the student's own language. This is your school's language map.",
    stuckTitle: "Words your school gets stuck on",
    stuckSub: "The words the most students looked up, across all classes.",
    notEnough: "Not enough data yet.",
    classroomsTitle: "Classrooms by activity",
    open: "Open",
    teacherLink: "Teacher link",
    teacherLinkCopied: "Copied",
    lookups: "lookups",
    basedOn: (n) => `Maps based on the last ${n} lookups`,
  },
  zu: {
    loading: "Iyalayisha…",
    error: "Asikwazanga ukulayisha imininingwane. Sicela uzame futhi.",
    empty: "Awukho amakilasi okwamanje. Engeza ikilasi lakho lokuqala ukuze uthole ikhodi yezingane.",
    emptyNoActivity: "Awukho amagama afuniwe okwamanje. Yabelana ngekhodi yekilasi nabafundi bakho, ukusesha kwabo kuzovela lapha.",
    totalLabel: "Isamba sokubheka kuso sonke isikole",
    classroomsLabel: "amakilasi",
    langMapTitle: "Izilimi isikole sakho esifunda ngazo",
    langMapSub: "Konke ukubheka kuphendulwa ngolimi lomfundi uqobo. Leli yibalazwe lezilimi zesikole sakho.",
    stuckTitle: "Amagama isikole sakho esibambeka kuwo",
    stuckSub: "Amagama abhekwe abafundi abaningi, kuwo wonke amakilasi.",
    notEnough: "Ayikho idatha eyanele okwamanje.",
    classroomsTitle: "Amakilasi ngokomsebenzi",
    open: "Vula",
    teacherLink: "Isixhumanisi sikathisha",
    teacherLinkCopied: "Kukopishiwe",
    lookups: "ukubheka",
    basedOn: (n) => `Amabalazwe asekelwe ekubhekeni kokugcina okungu-${n}`,
  },
  el: {
    loading: "Φόρτωση…",
    error: "Δεν ήταν δυνατή η φόρτωση των στατιστικών. Δοκιμάστε ξανά.",
    empty: "Δεν υπάρχουν τάξεις ακόμη. Πρόσθεσε την πρώτη σου τάξη για να πάρεις κωδικό για τα παιδιά.",
    emptyNoActivity: "Δεν υπάρχουν αναζητήσεις ακόμη. Μοιράσου τον κωδικό της τάξης με τους μαθητές σου και οι αναζητήσεις τους θα εμφανιστούν εδώ.",
    totalLabel: "Συνολικές αναζητήσεις σε όλο το σχολείο",
    classroomsLabel: "τάξεις",
    langMapTitle: "Οι γλώσσες στις οποίες μαθαίνει το σχολείο σας",
    langMapSub: "Κάθε αναζήτηση απαντάται στη γλώσσα του μαθητή. Αυτός είναι ο γλωσσικός χάρτης του σχολείου σας.",
    stuckTitle: "Λέξεις που δυσκολεύουν το σχολείο σας",
    stuckSub: "Οι λέξεις που αναζήτησαν οι περισσότεροι μαθητές, σε όλες τις τάξεις.",
    notEnough: "Δεν υπάρχουν αρκετά δεδομένα ακόμη.",
    classroomsTitle: "Τάξεις κατά δραστηριότητα",
    open: "Άνοιγμα",
    teacherLink: "Σύνδεσμος εκπαιδευτικού",
    teacherLinkCopied: "Αντιγράφηκε",
    lookups: "αναζητήσεις",
    basedOn: (n) => `Χάρτες βάσει των τελευταίων ${n} αναζητήσεων`,
  },
  hi: {
    loading: "लोड हो रहा है…",
    error: "जानकारी लोड नहीं हो सकी। फिर से कोशिश करें।",
    empty: "अभी कोई कक्षा नहीं। बच्चों के लिए कोड पाने हेतु अपनी पहली कक्षा जोड़ें।",
    emptyNoActivity: "अभी कोई खोज नहीं। कक्षा कोड अपने छात्रों के साथ साझा करें, उनकी खोजें यहाँ दिखेंगी।",
    totalLabel: "स्कूल भर में कुल खोजें",
    classroomsLabel: "कक्षाएँ",
    langMapTitle: "आपका स्कूल जिन भाषाओं में सीखता है",
    langMapSub: "हर खोज छात्र की अपनी भाषा में उत्तर देती है। यह आपके स्कूल का भाषा-नक्शा है।",
    stuckTitle: "जिन शब्दों पर स्कूल अटकता है",
    stuckSub: "सभी कक्षाओं में सबसे ज़्यादा खोजे गए शब्द।",
    notEnough: "अभी पर्याप्त डेटा नहीं है।",
    classroomsTitle: "गतिविधि के अनुसार कक्षाएँ",
    open: "खोलें",
    teacherLink: "शिक्षक लिंक",
    teacherLinkCopied: "कॉपी हो गया",
    lookups: "खोजें",
    basedOn: (n) => `पिछली ${n} खोजों पर आधारित नक्शे`,
  },
  am: {
    loading: "እየተጫነ ነው…",
    error: "ግንዛቤዎቹን መጫን አልተቻለም። እንደገና ይሞክሩ።",
    empty: "እስካሁን ክፍሎች የሉም። ለልጆች ኮድ ለማግኘት የመጀመሪያ ክፍልዎን ይጨምሩ።",
    emptyNoActivity: "እስካሁን ፍለጋዎች የሉም። የክፍል ኮዱን ከተማሪዎችዎ ጋር ያጋሩ፣ ፍለጋዎቻቸው እዚህ ይታያሉ።",
    totalLabel: "በትምህርት ቤቱ ጠቅላላ ፍለጋዎች",
    classroomsLabel: "ክፍሎች",
    langMapTitle: "ትምህርት ቤቱ የሚማርባቸው ቋንቋዎች",
    langMapSub: "እያንዳንዱ ፍለጋ በተማሪው ቋንቋ ይመለሳል። ይህ የትምህርት ቤቱ የቋንቋ ካርታ ነው።",
    stuckTitle: "ትምህርት ቤቱ የሚቸገርባቸው ቃላት",
    stuckSub: "በሁሉም ክፍሎች ብዙ ተማሪዎች የፈለጓቸው ቃላት።",
    notEnough: "እስካሁን በቂ መረጃ የለም።",
    classroomsTitle: "ክፍሎች በእንቅስቃሴ",
    open: "ክፈት",
    teacherLink: "የመምህር ሊንክ",
    teacherLinkCopied: "ተቀድቷል",
    lookups: "ፍለጋዎች",
    basedOn: (n) => `ካርታዎች በመጨረሻዎቹ ${n} ፍለጋዎች ላይ የተመሠረቱ`,
  },
  ar: {
    loading: "جارٍ التحميل…",
    error: "تعذّر تحميل الرؤى. يُرجى المحاولة مرة أخرى.",
    empty: "لا توجد صفوف بعد. أضف أول صف للحصول على رمز للأطفال.",
    emptyNoActivity: "لا توجد عمليات بحث بعد. شارك رمز الصف مع طلابك وستظهر عمليات بحثهم هنا.",
    totalLabel: "إجمالي عمليات البحث في المدرسة",
    classroomsLabel: "صفوف",
    langMapTitle: "اللغات التي تتعلم بها مدرستك",
    langMapSub: "كل بحث يُجاب عليه بلغة الطالب نفسه. هذه خريطة اللغات في مدرستك.",
    stuckTitle: "كلمات تتعثر فيها مدرستك",
    stuckSub: "الكلمات التي بحث عنها أكبر عدد من الطلاب في جميع الصفوف.",
    notEnough: "لا توجد بيانات كافية بعد.",
    classroomsTitle: "الصفوف حسب النشاط",
    open: "فتح",
    teacherLink: "رابط المعلم",
    teacherLinkCopied: "تم النسخ",
    lookups: "عمليات بحث",
    basedOn: (n) => `الخرائط مبنية على آخر ${n} عملية بحث`,
  },
  ru: {
    loading: "Загрузка…",
    error: "Не удалось загрузить аналитику. Попробуйте ещё раз.",
    empty: "Классов пока нет. Добавьте первый класс, чтобы получить код для детей.",
    emptyNoActivity: "Запросов пока нет. Поделитесь кодом класса с учениками, и их запросы появятся здесь.",
    totalLabel: "Всего запросов по школе",
    classroomsLabel: "классов",
    langMapTitle: "Языки, на которых учится ваша школа",
    langMapSub: "Каждый запрос получает ответ на родном языке ученика. Это языковая карта вашей школы.",
    stuckTitle: "Слова, на которых застревает школа",
    stuckSub: "Слова, которые искали больше всего учеников, во всех классах.",
    notEnough: "Пока недостаточно данных.",
    classroomsTitle: "Классы по активности",
    open: "Открыть",
    teacherLink: "Ссылка для учителя",
    teacherLinkCopied: "Скопировано",
    lookups: "запросов",
    basedOn: (n) => `Карты по последним ${n} запросам`,
  },
  es: {
    loading: "Cargando…",
    error: "No pudimos cargar los datos. Inténtalo de nuevo.",
    empty: "Aún no hay aulas. Añade la primera para obtener un código para los niños.",
    emptyNoActivity: "Aún no hay búsquedas. Comparte el código del aula con tus alumnos y sus búsquedas aparecerán aquí.",
    totalLabel: "Búsquedas totales en la escuela",
    classroomsLabel: "aulas",
    langMapTitle: "Idiomas en los que aprende tu escuela",
    langMapSub: "Cada búsqueda se responde en el idioma del propio alumno. Este es el mapa de idiomas de tu escuela.",
    stuckTitle: "Palabras en las que se atasca tu escuela",
    stuckSub: "Las palabras que más alumnos buscaron, en todas las clases.",
    notEnough: "Aún no hay suficientes datos.",
    classroomsTitle: "Aulas por actividad",
    open: "Abrir",
    teacherLink: "Enlace del docente",
    teacherLinkCopied: "Copiado",
    lookups: "búsquedas",
    basedOn: (n) => `Mapas basados en las últimas ${n} búsquedas`,
  },
  pt: {
    loading: "Carregando…",
    error: "Não foi possível carregar os dados. Tente novamente.",
    empty: "Ainda não há turmas. Adicione a primeira turma para receber um código para as crianças.",
    emptyNoActivity: "Ainda não há pesquisas. Compartilhe o código da turma com seus alunos e as pesquisas deles aparecerão aqui.",
    totalLabel: "Total de pesquisas na escola",
    classroomsLabel: "turmas",
    langMapTitle: "Idiomas em que sua escola aprende",
    langMapSub: "Cada pesquisa é respondida no idioma do próprio aluno. Este é o mapa de idiomas da sua escola.",
    stuckTitle: "Palavras em que sua escola trava",
    stuckSub: "As palavras que mais alunos pesquisaram, em todas as turmas.",
    notEnough: "Ainda não há dados suficientes.",
    classroomsTitle: "Turmas por atividade",
    open: "Abrir",
    teacherLink: "Link do professor",
    teacherLinkCopied: "Copiado",
    lookups: "pesquisas",
    basedOn: (n) => `Mapas baseados nas últimas ${n} pesquisas`,
  },
  fr: {
    loading: "Chargement…",
    error: "Impossible de charger les données. Veuillez réessayer.",
    empty: "Aucune classe pour l'instant. Ajoutez votre première classe pour obtenir un code pour les enfants.",
    emptyNoActivity: "Aucune recherche pour l'instant. Partagez le code de la classe avec vos élèves et leurs recherches apparaîtront ici.",
    totalLabel: "Recherches totales dans l'école",
    classroomsLabel: "classes",
    langMapTitle: "Les langues dans lesquelles votre école apprend",
    langMapSub: "Chaque recherche reçoit une réponse dans la langue de l'élève. Voici la carte des langues de votre école.",
    stuckTitle: "Les mots qui bloquent votre école",
    stuckSub: "Les mots recherchés par le plus grand nombre d'élèves, toutes classes confondues.",
    notEnough: "Pas encore assez de données.",
    classroomsTitle: "Classes par activité",
    open: "Ouvrir",
    teacherLink: "Lien enseignant",
    teacherLinkCopied: "Copié",
    lookups: "recherches",
    basedOn: (n) => `Cartes basées sur les ${n} dernières recherches`,
  },
  de: {
    loading: "Wird geladen…",
    error: "Die Auswertung konnte nicht geladen werden. Bitte versuchen Sie es erneut.",
    empty: "Noch keine Klassen. Legen Sie Ihre erste Klasse an, um einen Code für die Kinder zu erhalten.",
    emptyNoActivity: "Noch keine Suchen. Teilen Sie den Klassencode mit Ihren Schülerinnen und Schülern, dann erscheinen ihre Suchen hier.",
    totalLabel: "Suchen insgesamt an der Schule",
    classroomsLabel: "Klassen",
    langMapTitle: "Sprachen, in denen Ihre Schule lernt",
    langMapSub: "Jede Suche wird in der eigenen Sprache des Kindes beantwortet. Das ist die Sprachkarte Ihrer Schule.",
    stuckTitle: "Wörter, an denen Ihre Schule hängen bleibt",
    stuckSub: "Die Wörter, die die meisten Schülerinnen und Schüler nachgeschlagen haben, über alle Klassen hinweg.",
    notEnough: "Noch nicht genug Daten.",
    classroomsTitle: "Klassen nach Aktivität",
    open: "Öffnen",
    teacherLink: "Link für Lehrkräfte",
    teacherLinkCopied: "Kopiert",
    lookups: "Suchen",
    basedOn: (n) => `Karten basieren auf den letzten ${n} Suchen`,
  },
  cs: {
    loading: "Načítání…",
    error: "Přehled se nepodařilo načíst. Zkuste to prosím znovu.",
    empty: "Zatím žádné třídy. Přidejte první třídu a získáte kód pro děti.",
    emptyNoActivity: "Zatím žádná vyhledávání. Sdílejte kód třídy se žáky a jejich vyhledávání se zobrazí zde.",
    totalLabel: "Celkem vyhledávání ve škole",
    classroomsLabel: "tříd",
    langMapTitle: "Jazyky, ve kterých se vaše škola učí",
    langMapSub: "Každé vyhledávání je zodpovězeno v jazyce žáka. Toto je jazyková mapa vaší školy.",
    stuckTitle: "Slova, u kterých se škola zasekává",
    stuckSub: "Slova, která vyhledalo nejvíce žáků, napříč všemi třídami.",
    notEnough: "Zatím nedostatek dat.",
    classroomsTitle: "Třídy podle aktivity",
    open: "Otevřít",
    teacherLink: "Odkaz pro učitele",
    teacherLinkCopied: "Zkopírováno",
    lookups: "vyhledávání",
    basedOn: (n) => `Mapy vychází z posledních ${n} vyhledávání`,
  },
  sk: {
    loading: "Načítava sa…",
    error: "Prehľad sa nepodarilo načítať. Skúste to znova.",
    empty: "Zatiaľ žiadne triedy. Pridajte prvú triedu a získate kód pre deti.",
    emptyNoActivity: "Zatiaľ žiadne vyhľadávania. Zdieľajte kód triedy so žiakmi a ich vyhľadávania sa zobrazia tu.",
    totalLabel: "Spolu vyhľadávaní v škole",
    classroomsLabel: "tried",
    langMapTitle: "Jazyky, v ktorých sa vaša škola učí",
    langMapSub: "Každé vyhľadávanie je zodpovedané v jazyku žiaka. Toto je jazyková mapa vašej školy.",
    stuckTitle: "Slová, pri ktorých sa škola zasekáva",
    stuckSub: "Slová, ktoré vyhľadalo najviac žiakov, vo všetkých triedach.",
    notEnough: "Zatiaľ nedostatok údajov.",
    classroomsTitle: "Triedy podľa aktivity",
    open: "Otvoriť",
    teacherLink: "Odkaz pre učiteľa",
    teacherLinkCopied: "Skopírované",
    lookups: "vyhľadávaní",
    basedOn: (n) => `Mapy vychádzajú z posledných ${n} vyhľadávaní`,
  },
  it: {
    loading: "Caricamento…",
    error: "Impossibile caricare i dati. Riprova.",
    empty: "Ancora nessuna classe. Aggiungi la prima classe per ottenere un codice per i bambini.",
    emptyNoActivity: "Ancora nessuna ricerca. Condividi il codice della classe con i tuoi studenti e le loro ricerche appariranno qui.",
    totalLabel: "Ricerche totali nella scuola",
    classroomsLabel: "classi",
    langMapTitle: "Le lingue in cui impara la tua scuola",
    langMapSub: "Ogni ricerca riceve risposta nella lingua dello studente. Questa è la mappa linguistica della tua scuola.",
    stuckTitle: "Parole su cui la tua scuola si blocca",
    stuckSub: "Le parole cercate dal maggior numero di studenti, in tutte le classi.",
    notEnough: "Dati ancora insufficienti.",
    classroomsTitle: "Classi per attività",
    open: "Apri",
    teacherLink: "Link per l'insegnante",
    teacherLinkCopied: "Copiato",
    lookups: "ricerche",
    basedOn: (n) => `Mappe basate sulle ultime ${n} ricerche`,
  },
  ja: {
    loading: "読み込み中…",
    error: "データを読み込めませんでした。もう一度お試しください。",
    empty: "まだクラスがありません。最初のクラスを追加すると、子ども用のコードが発行されます。",
    emptyNoActivity: "まだ検索がありません。クラスコードを生徒に共有すると、検索がここに表示されます。",
    totalLabel: "学校全体の検索数",
    classroomsLabel: "クラス",
    langMapTitle: "学校で使われている学習言語",
    langMapSub: "どの検索も生徒自身の言語で答えます。これが学校の言語マップです。",
    stuckTitle: "学校全体でつまずいている単語",
    stuckSub: "全クラスを通じて、最も多くの生徒が調べた単語です。",
    notEnough: "まだ十分なデータがありません。",
    classroomsTitle: "アクティビティ順のクラス",
    open: "開く",
    teacherLink: "先生用リンク",
    teacherLinkCopied: "コピーしました",
    lookups: "件の検索",
    basedOn: (n) => `直近 ${n} 件の検索に基づくマップ`,
  },
  uk: {
    loading: "Завантаження…",
    error: "Не вдалося завантажити аналітику. Спробуйте ще раз.",
    empty: "Класів поки немає. Додайте перший клас, щоб отримати код для дітей.",
    emptyNoActivity: "Запитів поки немає. Поділіться кодом класу з учнями, і їхні запити з'являться тут.",
    totalLabel: "Усього запитів у школі",
    classroomsLabel: "класів",
    langMapTitle: "Мови, якими навчається ваша школа",
    langMapSub: "Кожен запит отримує відповідь рідною мовою учня. Це мовна карта вашої школи.",
    stuckTitle: "Слова, на яких застрягає школа",
    stuckSub: "Слова, які шукало найбільше учнів, у всіх класах.",
    notEnough: "Поки недостатньо даних.",
    classroomsTitle: "Класи за активністю",
    open: "Відкрити",
    teacherLink: "Посилання для вчителя",
    teacherLinkCopied: "Скопійовано",
    lookups: "запитів",
    basedOn: (n) => `Карти за останніми ${n} запитами`,
  },
  tr: {
    loading: "Yükleniyor…",
    error: "Veriler yüklenemedi. Lütfen tekrar deneyin.",
    empty: "Henüz sınıf yok. Çocuklar için bir kod almak üzere ilk sınıfınızı ekleyin.",
    emptyNoActivity: "Henüz arama yok. Sınıf kodunu öğrencilerinizle paylaşın, aramaları burada görünecek.",
    totalLabel: "Okul genelinde toplam arama",
    classroomsLabel: "sınıf",
    langMapTitle: "Okulunuzun öğrendiği diller",
    langMapSub: "Her arama öğrencinin kendi dilinde yanıtlanır. Bu, okulunuzun dil haritasıdır.",
    stuckTitle: "Okulunuzun takıldığı kelimeler",
    stuckSub: "Tüm sınıflarda en çok öğrencinin aradığı kelimeler.",
    notEnough: "Henüz yeterli veri yok.",
    classroomsTitle: "Etkinliğe göre sınıflar",
    open: "Aç",
    teacherLink: "Öğretmen bağlantısı",
    teacherLinkCopied: "Kopyalandı",
    lookups: "arama",
    basedOn: (n) => `Haritalar son ${n} aramaya dayanır`,
  },
  pl: {
    loading: "Ładowanie…",
    error: "Nie udało się wczytać danych. Spróbuj ponownie.",
    empty: "Nie ma jeszcze klas. Dodaj pierwszą klasę, aby otrzymać kod dla dzieci.",
    emptyNoActivity: "Nie ma jeszcze wyszukiwań. Udostępnij kod klasy uczniom, a ich wyszukiwania pojawią się tutaj.",
    totalLabel: "Łączna liczba wyszukiwań w szkole",
    classroomsLabel: "klas",
    langMapTitle: "Języki, w których uczy się Twoja szkoła",
    langMapSub: "Każde wyszukiwanie otrzymuje odpowiedź w języku ucznia. To mapa języków Twojej szkoły.",
    stuckTitle: "Słowa, na których zatrzymuje się szkoła",
    stuckSub: "Słowa, które sprawdzało najwięcej uczniów, we wszystkich klasach.",
    notEnough: "Za mało danych.",
    classroomsTitle: "Klasy według aktywności",
    open: "Otwórz",
    teacherLink: "Link dla nauczyciela",
    teacherLinkCopied: "Skopiowano",
    lookups: "wyszukiwań",
    basedOn: (n) => `Mapy na podstawie ostatnich ${n} wyszukiwań`,
  },
  fa: {
    loading: "در حال بارگذاری…",
    error: "بارگذاری داده‌ها ممکن نشد. لطفاً دوباره تلاش کنید.",
    empty: "هنوز کلاسی وجود ندارد. اولین کلاس را اضافه کنید تا برای بچه‌ها کد دریافت کنید.",
    emptyNoActivity: "هنوز جست‌وجویی نشده است. کد کلاس را با دانش‌آموزان به اشتراک بگذارید تا جست‌وجوهایشان اینجا نمایش داده شود.",
    totalLabel: "کل جست‌وجوها در مدرسه",
    classroomsLabel: "کلاس",
    langMapTitle: "زبان‌هایی که مدرسه شما با آن‌ها یاد می‌گیرد",
    langMapSub: "هر جست‌وجو به زبان خود دانش‌آموز پاسخ داده می‌شود. این نقشه زبانی مدرسه شماست.",
    stuckTitle: "واژه‌هایی که مدرسه شما در آن‌ها گیر می‌کند",
    stuckSub: "واژه‌هایی که بیشترین تعداد دانش‌آموزان در همه کلاس‌ها جست‌وجو کرده‌اند.",
    notEnough: "هنوز داده کافی وجود ندارد.",
    classroomsTitle: "کلاس‌ها بر اساس فعالیت",
    open: "باز کردن",
    teacherLink: "لینک معلم",
    teacherLinkCopied: "کپی شد",
    lookups: "جست‌وجو",
    basedOn: (n) => `نقشه‌ها بر اساس ${n} جست‌وجوی اخیر`,
  },
  id: {
    loading: "Memuat…",
    error: "Data tidak dapat dimuat. Silakan coba lagi.",
    empty: "Belum ada kelas. Tambahkan kelas pertama untuk mendapatkan kode bagi anak-anak.",
    emptyNoActivity: "Belum ada pencarian. Bagikan kode kelas kepada murid, dan pencarian mereka akan muncul di sini.",
    totalLabel: "Total pencarian di seluruh sekolah",
    classroomsLabel: "kelas",
    langMapTitle: "Bahasa yang digunakan sekolah Anda untuk belajar",
    langMapSub: "Setiap pencarian dijawab dalam bahasa murid itu sendiri. Inilah peta bahasa sekolah Anda.",
    stuckTitle: "Kata yang membuat sekolah Anda tersendat",
    stuckSub: "Kata yang paling banyak dicari murid, di semua kelas.",
    notEnough: "Data belum cukup.",
    classroomsTitle: "Kelas berdasarkan aktivitas",
    open: "Buka",
    teacherLink: "Tautan guru",
    teacherLinkCopied: "Tersalin",
    lookups: "pencarian",
    basedOn: (n) => `Peta berdasarkan ${n} pencarian terakhir`,
  },
  nl: {
    loading: "Laden…",
    error: "De gegevens konden niet worden geladen. Probeer het opnieuw.",
    empty: "Nog geen klassen. Voeg je eerste klas toe om een code voor de kinderen te krijgen.",
    emptyNoActivity: "Nog geen zoekopdrachten. Deel de klascode met je leerlingen en hun zoekopdrachten verschijnen hier.",
    totalLabel: "Totaal aantal zoekopdrachten in de school",
    classroomsLabel: "klassen",
    langMapTitle: "Talen waarin je school leert",
    langMapSub: "Elke zoekopdracht wordt beantwoord in de eigen taal van de leerling. Dit is de taalkaart van je school.",
    stuckTitle: "Woorden waar je school op vastloopt",
    stuckSub: "De woorden die de meeste leerlingen opzochten, in alle klassen.",
    notEnough: "Nog niet genoeg gegevens.",
    classroomsTitle: "Klassen op activiteit",
    open: "Openen",
    teacherLink: "Link voor leerkracht",
    teacherLinkCopied: "Gekopieerd",
    lookups: "zoekopdrachten",
    basedOn: (n) => `Kaarten op basis van de laatste ${n} zoekopdrachten`,
  },
  vi: {
    loading: "Đang tải…",
    error: "Không tải được dữ liệu. Vui lòng thử lại.",
    empty: "Chưa có lớp nào. Hãy thêm lớp đầu tiên để nhận mã cho các em.",
    emptyNoActivity: "Chưa có lượt tra nào. Hãy chia sẻ mã lớp với học sinh, các lượt tra của các em sẽ hiện ở đây.",
    totalLabel: "Tổng lượt tra của cả trường",
    classroomsLabel: "lớp",
    langMapTitle: "Các ngôn ngữ trường bạn dùng để học",
    langMapSub: "Mỗi lượt tra đều được trả lời bằng ngôn ngữ của chính học sinh. Đây là bản đồ ngôn ngữ của trường bạn.",
    stuckTitle: "Những từ trường bạn hay vướng",
    stuckSub: "Những từ được nhiều học sinh tra nhất, trên tất cả các lớp.",
    notEnough: "Chưa đủ dữ liệu.",
    classroomsTitle: "Các lớp theo mức hoạt động",
    open: "Mở",
    teacherLink: "Link cho giáo viên",
    teacherLinkCopied: "Đã sao chép",
    lookups: "lượt tra",
    basedOn: (n) => `Bản đồ dựa trên ${n} lượt tra gần nhất`,
  },
  fil: {
    loading: "Naglo-load…",
    error: "Hindi ma-load ang datos. Pakisubukang muli.",
    empty: "Wala pang klase. Magdagdag ng unang klase para makakuha ng code para sa mga bata.",
    emptyNoActivity: "Wala pang paghahanap. Ibahagi ang code ng klase sa iyong mga estudyante at lalabas dito ang kanilang mga hinanap.",
    totalLabel: "Kabuuang paghahanap sa buong paaralan",
    classroomsLabel: "klase",
    langMapTitle: "Mga wikang ginagamit ng paaralan sa pag-aaral",
    langMapSub: "Sinasagot ang bawat paghahanap sa sariling wika ng estudyante. Ito ang mapa ng mga wika ng iyong paaralan.",
    stuckTitle: "Mga salitang pinagkakahirapan ng paaralan",
    stuckSub: "Ang mga salitang hinanap ng pinakamaraming estudyante, sa lahat ng klase.",
    notEnough: "Kulang pa ang datos.",
    classroomsTitle: "Mga klase ayon sa aktibidad",
    open: "Buksan",
    teacherLink: "Link para sa guro",
    teacherLinkCopied: "Nakopya",
    lookups: "paghahanap",
    basedOn: (n) => `Mga mapang batay sa huling ${n} paghahanap`,
  },
  af: {
    loading: "Laai tans…",
    error: "Kon nie die data laai nie. Probeer asseblief weer.",
    empty: "Nog geen klasse nie. Voeg jou eerste klas by om 'n kode vir die kinders te kry.",
    emptyNoActivity: "Nog geen soektogte nie. Deel die klaskode met jou leerders en hulle soektogte sal hier verskyn.",
    totalLabel: "Totale soektogte in die skool",
    classroomsLabel: "klasse",
    langMapTitle: "Tale waarin jou skool leer",
    langMapSub: "Elke soektog word in die leerder se eie taal beantwoord. Dit is jou skool se taalkaart.",
    stuckTitle: "Woorde waaroor jou skool struikel",
    stuckSub: "Die woorde wat die meeste leerders opgesoek het, oor alle klasse heen.",
    notEnough: "Nog nie genoeg data nie.",
    classroomsTitle: "Klasse volgens aktiwiteit",
    open: "Maak oop",
    teacherLink: "Onderwyserskakel",
    teacherLinkCopied: "Gekopieer",
    lookups: "soektogte",
    basedOn: (n) => `Kaarte gebaseer op die laaste ${n} soektogte`,
  },
  sw: {
    loading: "Inapakia…",
    error: "Imeshindwa kupakia data. Tafadhali jaribu tena.",
    empty: "Bado hakuna madarasa. Ongeza darasa lako la kwanza ili upate msimbo kwa ajili ya watoto.",
    emptyNoActivity: "Bado hakuna utafutaji. Shiriki msimbo wa darasa na wanafunzi wako na utafutaji wao utaonekana hapa.",
    totalLabel: "Jumla ya utafutaji shuleni",
    classroomsLabel: "madarasa",
    langMapTitle: "Lugha ambazo shule yako hujifunzia",
    langMapSub: "Kila utafutaji hujibiwa kwa lugha ya mwanafunzi mwenyewe. Hii ndiyo ramani ya lugha ya shule yako.",
    stuckTitle: "Maneno yanayoikwamisha shule yako",
    stuckSub: "Maneno yaliyotafutwa na wanafunzi wengi zaidi, katika madarasa yote.",
    notEnough: "Bado hakuna data ya kutosha.",
    classroomsTitle: "Madarasa kwa shughuli",
    open: "Fungua",
    teacherLink: "Kiungo cha mwalimu",
    teacherLinkCopied: "Imenakiliwa",
    lookups: "utafutaji",
    basedOn: (n) => `Ramani zinatokana na utafutaji ${n} wa mwisho`,
  },
  "zh-CN": {
    loading: "加载中…",
    error: "无法加载数据，请重试。",
    empty: "还没有班级。添加第一个班级，即可获得给孩子们使用的代码。",
    emptyNoActivity: "还没有查询。把班级代码分享给学生，他们的查询就会显示在这里。",
    totalLabel: "全校查询总数",
    classroomsLabel: "个班级",
    langMapTitle: "学校使用的学习语言",
    langMapSub: "每次查询都会用学生自己的语言作答。这是学校的语言地图。",
    stuckTitle: "全校卡住的单词",
    stuckSub: "所有班级中被最多学生查询的单词。",
    notEnough: "数据还不够。",
    classroomsTitle: "按活跃度排列的班级",
    open: "打开",
    teacherLink: "教师链接",
    teacherLinkCopied: "已复制",
    lookups: "次查询",
    basedOn: (n) => `地图基于最近 ${n} 次查询`,
  },
  "zh-TW": {
    loading: "載入中…",
    error: "無法載入資料，請再試一次。",
    empty: "還沒有班級。新增第一個班級，即可取得給孩子們使用的代碼。",
    emptyNoActivity: "還沒有查詢。把班級代碼分享給學生，他們的查詢就會顯示在這裡。",
    totalLabel: "全校查詢總數",
    classroomsLabel: "個班級",
    langMapTitle: "學校使用的學習語言",
    langMapSub: "每次查詢都會用學生自己的語言回答。這是學校的語言地圖。",
    stuckTitle: "全校卡關的單字",
    stuckSub: "所有班級中被最多學生查詢的單字。",
    notEnough: "資料還不夠。",
    classroomsTitle: "依活躍度排列的班級",
    open: "開啟",
    teacherLink: "教師連結",
    teacherLinkCopied: "已複製",
    lookups: "次查詢",
    basedOn: (n) => `地圖依據最近 ${n} 次查詢`,
  },
  ko: {
    loading: "불러오는 중…",
    error: "데이터를 불러오지 못했습니다. 다시 시도해 주세요.",
    empty: "아직 학급이 없습니다. 첫 학급을 추가하면 아이들용 코드를 받을 수 있습니다.",
    emptyNoActivity: "아직 검색이 없습니다. 학생들에게 학급 코드를 공유하면 검색 내용이 여기에 표시됩니다.",
    totalLabel: "학교 전체 검색 수",
    classroomsLabel: "개 학급",
    langMapTitle: "우리 학교의 학습 언어",
    langMapSub: "모든 검색은 학생 자신의 언어로 답변됩니다. 이것이 우리 학교의 언어 지도입니다.",
    stuckTitle: "학교 전체가 막히는 단어",
    stuckSub: "모든 학급에서 가장 많은 학생이 찾아본 단어입니다.",
    notEnough: "아직 데이터가 충분하지 않습니다.",
    classroomsTitle: "활동순 학급",
    open: "열기",
    teacherLink: "교사용 링크",
    teacherLinkCopied: "복사됨",
    lookups: "회 검색",
    basedOn: (n) => `최근 ${n}회 검색 기준 지도`,
  },
  th: {
    loading: "กำลังโหลด…",
    error: "โหลดข้อมูลไม่สำเร็จ โปรดลองอีกครั้ง",
    empty: "ยังไม่มีห้องเรียน เพิ่มห้องเรียนแรกเพื่อรับรหัสสำหรับเด็ก ๆ",
    emptyNoActivity: "ยังไม่มีการค้นหา แชร์รหัสห้องเรียนให้นักเรียน แล้วการค้นหาของพวกเขาจะแสดงที่นี่",
    totalLabel: "จำนวนการค้นหาทั้งโรงเรียน",
    classroomsLabel: "ห้องเรียน",
    langMapTitle: "ภาษาที่โรงเรียนของคุณใช้เรียนรู้",
    langMapSub: "ทุกการค้นหาจะได้คำตอบเป็นภาษาของนักเรียนเอง นี่คือแผนที่ภาษาของโรงเรียนคุณ",
    stuckTitle: "คำที่โรงเรียนของคุณติดขัด",
    stuckSub: "คำที่นักเรียนค้นหามากที่สุด จากทุกห้องเรียน",
    notEnough: "ข้อมูลยังไม่เพียงพอ",
    classroomsTitle: "ห้องเรียนตามกิจกรรม",
    open: "เปิด",
    teacherLink: "ลิงก์สำหรับครู",
    teacherLinkCopied: "คัดลอกแล้ว",
    lookups: "การค้นหา",
    basedOn: (n) => `แผนที่อ้างอิงจากการค้นหาล่าสุด ${n} ครั้ง`,
  },
  bn: {
    loading: "লোড হচ্ছে…",
    error: "তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।",
    empty: "এখনও কোনো ক্লাস নেই। বাচ্চাদের জন্য কোড পেতে প্রথম ক্লাসটি যোগ করুন।",
    emptyNoActivity: "এখনও কোনো খোঁজ নেই। শিক্ষার্থীদের সঙ্গে ক্লাস কোড শেয়ার করুন, তাদের খোঁজ এখানে দেখা যাবে।",
    totalLabel: "পুরো স্কুলে মোট খোঁজ",
    classroomsLabel: "ক্লাস",
    langMapTitle: "আপনার স্কুল যেসব ভাষায় শেখে",
    langMapSub: "প্রতিটি খোঁজের উত্তর শিক্ষার্থীর নিজের ভাষায় দেওয়া হয়। এটি আপনার স্কুলের ভাষা-মানচিত্র।",
    stuckTitle: "যেসব শব্দে স্কুল আটকে যায়",
    stuckSub: "সব ক্লাস মিলিয়ে সবচেয়ে বেশি শিক্ষার্থী যেসব শব্দ খুঁজেছে।",
    notEnough: "এখনও যথেষ্ট তথ্য নেই।",
    classroomsTitle: "কার্যকলাপ অনুযায়ী ক্লাস",
    open: "খুলুন",
    teacherLink: "শিক্ষকের লিংক",
    teacherLinkCopied: "কপি হয়েছে",
    lookups: "খোঁজ",
    basedOn: (n) => `সর্বশেষ ${n}টি খোঁজের ভিত্তিতে মানচিত্র`,
  },
  da: {
    loading: "Indlæser…",
    error: "Vi kunne ikke indlæse dataene. Prøv igen.",
    empty: "Ingen klasser endnu. Tilføj din første klasse for at få en kode til børnene.",
    emptyNoActivity: "Ingen opslag endnu. Del klassekoden med dine elever, så vises deres opslag her.",
    totalLabel: "Opslag i alt på skolen",
    classroomsLabel: "klasser",
    langMapTitle: "Sprog, din skole lærer på",
    langMapSub: "Hvert opslag besvares på elevens eget sprog. Dette er din skoles sprogkort.",
    stuckTitle: "Ord, din skole går i stå ved",
    stuckSub: "De ord, flest elever slog op, på tværs af alle klasser.",
    notEnough: "Ikke nok data endnu.",
    classroomsTitle: "Klasser efter aktivitet",
    open: "Åbn",
    teacherLink: "Lærerlink",
    teacherLinkCopied: "Kopieret",
    lookups: "opslag",
    basedOn: (n) => `Kort baseret på de seneste ${n} opslag`,
  },
  hu: {
    loading: "Betöltés…",
    error: "Nem sikerült betölteni az adatokat. Próbálja újra.",
    empty: "Még nincs osztály. Adja hozzá az első osztályt, hogy kódot kapjon a gyerekeknek.",
    emptyNoActivity: "Még nincs keresés. Ossza meg az osztálykódot a tanulókkal, és a kereséseik itt jelennek meg.",
    totalLabel: "Összes keresés az iskolában",
    classroomsLabel: "osztály",
    langMapTitle: "Nyelvek, amelyeken az iskola tanul",
    langMapSub: "Minden keresésre a tanuló saját nyelvén érkezik válasz. Ez az iskola nyelvi térképe.",
    stuckTitle: "Szavak, amelyeknél az iskola elakad",
    stuckSub: "A legtöbb tanuló által keresett szavak, az összes osztályban.",
    notEnough: "Még nincs elég adat.",
    classroomsTitle: "Osztályok aktivitás szerint",
    open: "Megnyitás",
    teacherLink: "Tanári link",
    teacherLinkCopied: "Másolva",
    lookups: "keresés",
    basedOn: (n) => `A térképek az utolsó ${n} keresésen alapulnak`,
  },
};

export function PrincipalOverview({ lang }: { lang: string }) {
  const { user } = useAuth();
  const href = useHref();
  const t = COPY[lang] ?? COPY.en;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/schools/insights", { headers: { Authorization: `Bearer ${idToken}` } });
        if (!res.ok) { if (!cancelled) setError(true); return; }
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const teacherLinkFor = useMemo(
    () => (code: string) =>
      typeof window === "undefined" ? `https://gadit.app/t/${code}` : `${window.location.origin}/t/${code}`,
    [],
  );

  async function copyTeacherLink(code: string) {
    try {
      await navigator.clipboard.writeText(teacherLinkFor(code));
      setCopiedCode(code);
      setTimeout(() => setCopiedCode((cur) => (cur === code ? null : cur)), 1600);
    } catch { /* clipboard blocked; no-op */ }
  }

  if (loading) return <p style={{ color: "#78716C", fontSize: 15 }}>{t.loading}</p>;
  if (error || !data) return <p style={{ color: "#B45309", fontSize: 15 }}>{t.error}</p>;

  if (data.classroomCount === 0) {
    return <p style={{ color: "#78716C", fontSize: 15 }}>{t.empty}</p>;
  }
  if (data.totalAllTime === 0 && data.sampleSize === 0) {
    // Classrooms exist but no lookups yet — don't tell them to add a classroom.
    return <p style={{ color: "#78716C", fontSize: 15 }}>{t.emptyNoActivity}</p>;
  }

  return (
    <div>
      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 14 }}>
        <div style={statMustard}>
          <span aria-hidden="true" style={{ position: "absolute", insetInlineEnd: -18, top: -18, width: 84, height: 84, borderRadius: "50%", background: "rgba(14,165,165,0.06)" }} />
          <div style={{ ...statLabel, position: "relative" }}>{t.totalLabel}</div>
          <div style={{ ...statNum, position: "relative" }}>{data.totalAllTime.toLocaleString()}</div>
        </div>
        <div style={statTeal}>
          <span aria-hidden="true" style={{ position: "absolute", insetInlineEnd: -18, top: -18, width: 84, height: 84, borderRadius: "50%", background: "rgba(14,165,165,0.06)" }} />
          <div style={{ ...statLabel, position: "relative" }}>{t.classroomsLabel}</div>
          <div style={{ ...statNum, position: "relative" }}>{data.classroomCount}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {/* School-wide language map */}
        <div style={card}>
          <div style={label}>{t.langMapTitle}</div>
          <p style={sub}>{t.langMapSub}</p>
          {data.languages.length === 0 ? (
            <p style={{ fontSize: 13, color: "#A8A29E", margin: 0 }}>{t.notEnough}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
              {data.languages.map((l) => (
                <div key={l.lang} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1C1917", minWidth: 78 }}>{classroomLangLabel(l.lang)}</span>
                  <span style={{ flex: 1, height: 8, background: "#F0EEEB", borderRadius: 999, overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: `${Math.max(l.pct, 3)}%`, background: "#0EA5A5", borderRadius: 999 }} />
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#78716C", minWidth: 34, textAlign: "end" }}>{l.pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* School-wide stuck words */}
        <div style={card}>
          <div style={label}>{t.stuckTitle}</div>
          <p style={sub}>{t.stuckSub}</p>
          {data.topWords.length === 0 ? (
            <p style={{ fontSize: 13, color: "#A8A29E", margin: 0 }}>{t.notEnough}</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {data.topWords.map((w) => (
                <Link key={w.word} href={href(`/word/${encodeURIComponent(w.word)}`)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "#ECFEFF", border: "1px solid #A5F3F0", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 600, color: "#0E7490" }}>
                  <span>{w.word}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "#0EA5A5", borderRadius: 999, padding: "1px 7px" }}>{w.count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <p style={{ fontSize: 12, color: "#A8A29E", margin: "10px 2px 0" }}>{t.basedOn(data.sampleSize)}</p>

      {/* Classrooms by activity */}
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1C1917", margin: "28px 0 12px" }}>{t.classroomsTitle}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.classrooms.map((cls) => (
          <div key={cls.id} style={{ ...card, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ width: 12, height: 12, borderRadius: 999, flexShrink: 0, background: classroomColorFor({ colorIndex: cls.colorIndex }) }} />
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1C1917" }}>{cls.name || cls.code}</div>
              <div style={{ fontSize: 12.5, color: "#78716C" }}>
                <span dir="ltr" style={{ fontFamily: "ui-monospace, monospace", letterSpacing: "0.06em" }}>{cls.code}</span>
                {cls.topLanguage ? ` · ${classroomLangLabel(cls.topLanguage)}` : ""}
              </div>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0EA5A5", minWidth: 90, textAlign: "center" }}>
              {cls.totalAllTime.toLocaleString()} {t.lookups}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href={href(`/classroom/${cls.id}`)} style={btnPrimary}>{t.open}</Link>
              <button type="button" onClick={() => copyTeacherLink(cls.code)} style={btnGhost}>
                {copiedCode === cls.code ? t.teacherLinkCopied : t.teacherLink}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const card: React.CSSProperties = { background: "#fff", border: "1px solid #EAE7E3", borderRadius: 16, padding: "18px 20px" };
const label: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#1C1917", marginBottom: 4 };
const sub: React.CSSProperties = { fontSize: 12.5, color: "#78716C", lineHeight: 1.45, margin: "0 0 12px" };
// Vibrant KPI cards (modern school dashboard, Gadi 2026-08-23).
// Clean Gadit-brand KPI cards: light surface, teal number, quiet border — the
// same restrained look as the rest of Gadit (Gadi 2026-08-25: drop the loud
// mustard/teal gradients, keep it clean and on-brand).
const statBase: React.CSSProperties = { borderRadius: 16, padding: "18px 20px", border: "1px solid var(--rule, #E7E5E4)", background: "var(--surface, #fff)", color: "var(--ink, #1C1917)", display: "flex", flexDirection: "column", gap: 4, position: "relative", overflow: "hidden", boxShadow: "0 1px 2px rgba(16,24,40,0.04)" };
const statMustard: React.CSSProperties = { ...statBase };
const statTeal: React.CSSProperties = { ...statBase };
const statNum: React.CSSProperties = { fontSize: 38, fontWeight: 800, color: "#0EA5A5", lineHeight: 1.05, fontVariantNumeric: "tabular-nums" };
const statLabel: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--ink-soft, #78716C)" };
const btnPrimary: React.CSSProperties = { background: "#0EA5A5", color: "#fff", borderRadius: 9, padding: "7px 14px", fontSize: 13, fontWeight: 700, textDecoration: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" };
const btnGhost: React.CSSProperties = { background: "#fff", color: "#0E7490", borderRadius: 9, padding: "7px 14px", fontSize: 13, fontWeight: 700, border: "1px solid #A5F3F0", cursor: "pointer", whiteSpace: "nowrap" };

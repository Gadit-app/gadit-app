"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";
import { classroomLangLabel } from "@/lib/classroom-insights";
import { classroomColorFor } from "@/lib/school";
import { getLangDir, type Lang } from "@/lib/i18n";

/**
 * Students tab of the /schools shell. Lists every named student across the
 * whole school with per-student stats (lookup count, classroom, top
 * language), sortable by activity, name, or classroom. A student is a
 * (classroom, name) pair since first names aren't unique across classes.
 * Data from /api/schools/insights (owner-authed).
 */

type StudentRow = {
  name: string;
  classroomId: string;
  classroomName: string;
  code: string;
  colorIndex: number;
  count: number;
  topLanguage: string;
  words?: { word: string; count: number }[];
};

type Sort = "activity" | "name" | "classroom";

type Copy = {
  loading: string;
  error: string;
  empty: string;
  hint: string;
  sortBy: string;
  sortActivity: string;
  sortName: string;
  sortClassroom: string;
  colName: string;
  colClassroom: string;
  colLang: string;
  colLookups: string;
  filterPh: string;
  countLabel: (n: number) => string;
  wordsHeading?: string;
  noWords?: string;
  closeLabel?: string;
};

const COPY: Record<string, Copy> = {
  he: {
    loading: "טוען...",
    error: "לא הצלחנו לטעון את התלמידים. אפשר לנסות שוב.",
    empty: "עדיין אין תלמידים עם פעילות. כדי לראות תלמידים בשמם, צריך להוסיף רשימת תלמידים לכיתה. אז כל ילד יבחר את שמו לפני החיפוש.",
    hint: "מבוסס על הפעילות האחרונה. ריבוי חיפושים יכול להעיד על קושי או על סקרנות.",
    sortBy: "מיון לפי",
    sortActivity: "פעילות",
    sortName: "שם",
    sortClassroom: "כיתה",
    colName: "תלמיד",
    colClassroom: "כיתה",
    colLang: "שפה",
    colLookups: "חיפושים",
    filterPh: "סינון לפי שם...",
    countLabel: (n) => `${n} תלמידים`,
    wordsHeading: "מילים שחיפש",
    noWords: "אין עדיין חיפושים בחלון האחרון.",
    closeLabel: "סגור",
  },
  en: {
    loading: "Loading…",
    error: "Couldn't load students. Please try again.",
    empty: "No students with activity yet. To see students by name, add a class roster so each child picks their name before searching.",
    hint: "Based on recent activity. Lots of lookups can mean a struggle or curiosity.",
    sortBy: "Sort by",
    sortActivity: "Activity",
    sortName: "Name",
    sortClassroom: "Classroom",
    colName: "Student",
    colClassroom: "Classroom",
    colLang: "Language",
    colLookups: "Lookups",
    filterPh: "Filter by name…",
    countLabel: (n) => `${n} students`,
    wordsHeading: "Words looked up",
    noWords: "No searches in the recent window yet.",
    closeLabel: "Close",
  },
  zu: {
    loading: "Iyalayisha…",
    error: "Asikwazanga ukulayisha abafundi. Sicela uzame futhi.",
    empty: "Abekho abafundi abanomsebenzi okwamanje. Ukuze ubone abafundi ngegama, engeza uhlu lwekilasi ukuze ingane ngayinye ikhethe igama layo ngaphambi kokusesha.",
    hint: "Kusekelwe emsebenzini wakamuva. Ukubheka okuningi kungasho ukuzabalaza noma ukufuna ukwazi.",
    sortBy: "Hlela nge",
    sortActivity: "Umsebenzi",
    sortName: "Igama",
    sortClassroom: "Ikilasi",
    colName: "Umfundi",
    colClassroom: "Ikilasi",
    colLang: "Ulimi",
    colLookups: "Ukubheka",
    filterPh: "Hlunga ngegama…",
    countLabel: (n) => `Abafundi abangu-${n}`,
  },
  el: {
    loading: "Φόρτωση…",
    error: "Δεν ήταν δυνατή η φόρτωση των μαθητών. Δοκιμάστε ξανά.",
    empty: "Δεν υπάρχουν μαθητές με δραστηριότητα ακόμη. Για να βλέπετε μαθητές με το όνομά τους, προσθέστε κατάλογο τάξης ώστε κάθε παιδί να επιλέγει το όνομά του πριν την αναζήτηση.",
    hint: "Βάσει πρόσφατης δραστηριότητας. Πολλές αναζητήσεις μπορεί να σημαίνουν δυσκολία ή περιέργεια.",
    sortBy: "Ταξινόμηση κατά",
    sortActivity: "Δραστηριότητα",
    sortName: "Όνομα",
    sortClassroom: "Τάξη",
    colName: "Μαθητής",
    colClassroom: "Τάξη",
    colLang: "Γλώσσα",
    colLookups: "Αναζητήσεις",
    filterPh: "Φιλτράρισμα κατά όνομα…",
    countLabel: (n) => `${n} μαθητές`,
  },
  hi: {
    loading: "लोड हो रहा है…",
    error: "छात्र लोड नहीं हो सके। फिर से कोशिश करें।",
    empty: "अभी कोई सक्रिय छात्र नहीं। नाम से छात्र देखने के लिए कक्षा की सूची जोड़ें ताकि हर बच्चा खोज से पहले अपना नाम चुने।",
    hint: "हाल की गतिविधि पर आधारित। ज़्यादा खोजें कठिनाई या जिज्ञासा दिखा सकती हैं।",
    sortBy: "क्रमबद्ध करें",
    sortActivity: "गतिविधि",
    sortName: "नाम",
    sortClassroom: "कक्षा",
    colName: "छात्र",
    colClassroom: "कक्षा",
    colLang: "भाषा",
    colLookups: "खोजें",
    filterPh: "नाम से छानें…",
    countLabel: (n) => `${n} छात्र`,
  },
  am: {
    loading: "እየተጫነ ነው…",
    error: "ተማሪዎችን መጫን አልተቻለም። እንደገና ይሞክሩ።",
    empty: "እስካሁን በእንቅስቃሴ ያለ ተማሪ የለም። ተማሪዎችን በስም ለማየት የክፍል ዝርዝር ይጨምሩ፣ እያንዳንዱ ልጅ ከፍለጋ በፊት ስሙን ይመርጣል።",
    hint: "በቅርብ እንቅስቃሴ ላይ የተመሠረተ። ብዙ ፍለጋ ችግርን ወይም ጉጉትን ሊያሳይ ይችላል።",
    sortBy: "ደርድር በ",
    sortActivity: "እንቅስቃሴ",
    sortName: "ስም",
    sortClassroom: "ክፍል",
    colName: "ተማሪ",
    colClassroom: "ክፍል",
    colLang: "ቋንቋ",
    colLookups: "ፍለጋዎች",
    filterPh: "በስም አጣራ…",
    countLabel: (n) => `${n} ተማሪዎች`,
  },
  ar: {
    loading: "جارٍ التحميل…",
    error: "تعذّر تحميل الطلاب. يُرجى المحاولة مرة أخرى.",
    empty: "لا يوجد طلاب لديهم نشاط بعد. لعرض الطلاب بأسمائهم، أضف قائمة أسماء للصف ليختار كل طفل اسمه قبل البحث.",
    hint: "بناءً على النشاط الأخير. كثرة البحث قد تعني صعوبة أو فضولًا.",
    sortBy: "ترتيب حسب",
    sortActivity: "النشاط",
    sortName: "الاسم",
    sortClassroom: "الصف",
    colName: "الطالب",
    colClassroom: "الصف",
    colLang: "اللغة",
    colLookups: "عمليات البحث",
    filterPh: "تصفية حسب الاسم…",
    countLabel: (n) => `${n} طالب`,
    wordsHeading: "الكلمات التي بحث عنها",
    noWords: "لا توجد عمليات بحث في الفترة الأخيرة بعد.",
    closeLabel: "إغلاق",
  },
  ru: {
    loading: "Загрузка…",
    error: "Не удалось загрузить учеников. Попробуйте ещё раз.",
    empty: "Пока нет активных учеников. Чтобы видеть учеников по имени, добавьте список класса: тогда каждый ребёнок выберет своё имя перед поиском.",
    hint: "По недавней активности. Много запросов может означать трудность или любопытство.",
    sortBy: "Сортировать по",
    sortActivity: "Активности",
    sortName: "Имени",
    sortClassroom: "Классу",
    colName: "Ученик",
    colClassroom: "Класс",
    colLang: "Язык",
    colLookups: "Запросы",
    filterPh: "Фильтр по имени…",
    countLabel: (n) => `Учеников: ${n}`,
    wordsHeading: "Найденные слова",
    noWords: "За последнее время запросов пока нет.",
    closeLabel: "Закрыть",
  },
  es: {
    loading: "Cargando…",
    error: "No pudimos cargar los alumnos. Inténtalo de nuevo.",
    empty: "Aún no hay alumnos con actividad. Para ver a los alumnos por nombre, añade una lista de clase y así cada niño elegirá su nombre antes de buscar.",
    hint: "Según la actividad reciente. Muchas búsquedas pueden indicar dificultad o curiosidad.",
    sortBy: "Ordenar por",
    sortActivity: "Actividad",
    sortName: "Nombre",
    sortClassroom: "Aula",
    colName: "Alumno",
    colClassroom: "Aula",
    colLang: "Idioma",
    colLookups: "Búsquedas",
    filterPh: "Filtrar por nombre…",
    countLabel: (n) => `${n} alumnos`,
    wordsHeading: "Palabras buscadas",
    noWords: "Aún no hay búsquedas en el periodo reciente.",
    closeLabel: "Cerrar",
  },
  pt: {
    loading: "Carregando…",
    error: "Não foi possível carregar os alunos. Tente novamente.",
    empty: "Ainda não há alunos com atividade. Para ver os alunos pelo nome, adicione uma lista da turma para que cada criança escolha o próprio nome antes de pesquisar.",
    hint: "Com base na atividade recente. Muitas pesquisas podem indicar dificuldade ou curiosidade.",
    sortBy: "Ordenar por",
    sortActivity: "Atividade",
    sortName: "Nome",
    sortClassroom: "Turma",
    colName: "Aluno",
    colClassroom: "Turma",
    colLang: "Idioma",
    colLookups: "Pesquisas",
    filterPh: "Filtrar por nome…",
    countLabel: (n) => `${n} alunos`,
    wordsHeading: "Palavras pesquisadas",
    noWords: "Ainda não há pesquisas no período recente.",
    closeLabel: "Fechar",
  },
  fr: {
    loading: "Chargement…",
    error: "Impossible de charger les élèves. Veuillez réessayer.",
    empty: "Aucun élève actif pour l'instant. Pour voir les élèves par leur nom, ajoutez une liste de classe afin que chaque enfant choisisse son nom avant de chercher.",
    hint: "D'après l'activité récente. Beaucoup de recherches peuvent signaler une difficulté ou de la curiosité.",
    sortBy: "Trier par",
    sortActivity: "Activité",
    sortName: "Nom",
    sortClassroom: "Classe",
    colName: "Élève",
    colClassroom: "Classe",
    colLang: "Langue",
    colLookups: "Recherches",
    filterPh: "Filtrer par nom…",
    countLabel: (n) => `${n} élèves`,
    wordsHeading: "Mots recherchés",
    noWords: "Aucune recherche sur la période récente.",
    closeLabel: "Fermer",
  },
  de: {
    loading: "Wird geladen…",
    error: "Die Schülerliste konnte nicht geladen werden. Bitte versuchen Sie es erneut.",
    empty: "Noch keine aktiven Schülerinnen und Schüler. Um sie namentlich zu sehen, fügen Sie eine Klassenliste hinzu, damit jedes Kind vor der Suche seinen Namen auswählt.",
    hint: "Basierend auf der jüngsten Aktivität. Viele Suchen können auf Schwierigkeiten oder Neugier hindeuten.",
    sortBy: "Sortieren nach",
    sortActivity: "Aktivität",
    sortName: "Name",
    sortClassroom: "Klasse",
    colName: "Schüler/in",
    colClassroom: "Klasse",
    colLang: "Sprache",
    colLookups: "Suchen",
    filterPh: "Nach Name filtern…",
    countLabel: (n) => `${n} Schülerinnen und Schüler`,
    wordsHeading: "Nachgeschlagene Wörter",
    noWords: "Im letzten Zeitraum noch keine Suchen.",
    closeLabel: "Schließen",
  },
  cs: {
    loading: "Načítání…",
    error: "Žáky se nepodařilo načíst. Zkuste to prosím znovu.",
    empty: "Zatím žádní aktivní žáci. Chcete-li vidět žáky podle jména, přidejte seznam třídy, aby si každé dítě před hledáním vybralo své jméno.",
    hint: "Podle nedávné aktivity. Hodně vyhledávání může znamenat potíže nebo zvědavost.",
    sortBy: "Řadit podle",
    sortActivity: "Aktivita",
    sortName: "Jméno",
    sortClassroom: "Třída",
    colName: "Žák",
    colClassroom: "Třída",
    colLang: "Jazyk",
    colLookups: "Vyhledávání",
    filterPh: "Filtrovat podle jména…",
    countLabel: (n) => `Žáků: ${n}`,
    wordsHeading: "Vyhledaná slova",
    noWords: "V poslední době zatím žádná vyhledávání.",
    closeLabel: "Zavřít",
  },
  sk: {
    loading: "Načítava sa…",
    error: "Žiakov sa nepodarilo načítať. Skúste to znova.",
    empty: "Zatiaľ žiadni aktívni žiaci. Ak chcete vidieť žiakov podľa mena, pridajte zoznam triedy, aby si každé dieťa pred hľadaním vybralo svoje meno.",
    hint: "Podľa nedávnej aktivity. Veľa vyhľadávaní môže znamenať ťažkosti alebo zvedavosť.",
    sortBy: "Zoradiť podľa",
    sortActivity: "Aktivita",
    sortName: "Meno",
    sortClassroom: "Trieda",
    colName: "Žiak",
    colClassroom: "Trieda",
    colLang: "Jazyk",
    colLookups: "Vyhľadávania",
    filterPh: "Filtrovať podľa mena…",
    countLabel: (n) => `Žiakov: ${n}`,
    wordsHeading: "Vyhľadané slová",
    noWords: "V poslednom období zatiaľ žiadne vyhľadávania.",
    closeLabel: "Zavrieť",
  },
  it: {
    loading: "Caricamento…",
    error: "Impossibile caricare gli studenti. Riprova.",
    empty: "Ancora nessuno studente attivo. Per vedere gli studenti per nome, aggiungi l'elenco della classe così ogni bambino sceglie il proprio nome prima di cercare.",
    hint: "In base all'attività recente. Molte ricerche possono indicare una difficoltà o curiosità.",
    sortBy: "Ordina per",
    sortActivity: "Attività",
    sortName: "Nome",
    sortClassroom: "Classe",
    colName: "Studente",
    colClassroom: "Classe",
    colLang: "Lingua",
    colLookups: "Ricerche",
    filterPh: "Filtra per nome…",
    countLabel: (n) => `${n} studenti`,
    wordsHeading: "Parole cercate",
    noWords: "Ancora nessuna ricerca nel periodo recente.",
    closeLabel: "Chiudi",
  },
  ja: {
    loading: "読み込み中…",
    error: "生徒を読み込めませんでした。もう一度お試しください。",
    empty: "まだ利用中の生徒がいません。生徒を名前で確認するには、クラスの名簿を追加してください。検索前に各自が自分の名前を選べるようになります。",
    hint: "最近の利用状況に基づいています。検索が多いのは、つまずきのサインのことも、好奇心のあらわれのこともあります。",
    sortBy: "並べ替え",
    sortActivity: "利用状況",
    sortName: "名前",
    sortClassroom: "クラス",
    colName: "生徒",
    colClassroom: "クラス",
    colLang: "言語",
    colLookups: "検索数",
    filterPh: "名前で絞り込む…",
    countLabel: (n) => `${n} 人の生徒`,
    wordsHeading: "調べた単語",
    noWords: "最近の期間にはまだ検索がありません。",
    closeLabel: "閉じる",
  },
  uk: {
    loading: "Завантаження…",
    error: "Не вдалося завантажити учнів. Спробуйте ще раз.",
    empty: "Поки немає активних учнів. Щоб бачити учнів за іменем, додайте список класу: тоді кожна дитина обиратиме своє ім'я перед пошуком.",
    hint: "За нещодавньою активністю. Багато запитів може означати труднощі або цікавість.",
    sortBy: "Сортувати за",
    sortActivity: "Активністю",
    sortName: "Іменем",
    sortClassroom: "Класом",
    colName: "Учень",
    colClassroom: "Клас",
    colLang: "Мова",
    colLookups: "Запити",
    filterPh: "Фільтр за іменем…",
    countLabel: (n) => `Учнів: ${n}`,
    wordsHeading: "Знайдені слова",
    noWords: "За останній час запитів ще немає.",
    closeLabel: "Закрити",
  },
  tr: {
    loading: "Yükleniyor…",
    error: "Öğrenciler yüklenemedi. Lütfen tekrar deneyin.",
    empty: "Henüz etkin öğrenci yok. Öğrencileri adlarıyla görmek için bir sınıf listesi ekleyin; böylece her çocuk aramadan önce adını seçer.",
    hint: "Son etkinliğe göre. Çok sayıda arama zorlanmaya ya da merağa işaret edebilir.",
    sortBy: "Sırala",
    sortActivity: "Etkinlik",
    sortName: "Ad",
    sortClassroom: "Sınıf",
    colName: "Öğrenci",
    colClassroom: "Sınıf",
    colLang: "Dil",
    colLookups: "Aramalar",
    filterPh: "Ada göre filtrele…",
    countLabel: (n) => `${n} öğrenci`,
    wordsHeading: "Aranan kelimeler",
    noWords: "Son dönemde henüz arama yok.",
    closeLabel: "Kapat",
  },
  pl: {
    loading: "Ładowanie…",
    error: "Nie udało się wczytać uczniów. Spróbuj ponownie.",
    empty: "Nie ma jeszcze aktywnych uczniów. Aby widzieć uczniów po imieniu, dodaj listę klasy, dzięki czemu każde dziecko wybierze swoje imię przed wyszukiwaniem.",
    hint: "Na podstawie ostatniej aktywności. Dużo wyszukiwań może oznaczać trudność lub ciekawość.",
    sortBy: "Sortuj według",
    sortActivity: "Aktywność",
    sortName: "Imię",
    sortClassroom: "Klasa",
    colName: "Uczeń",
    colClassroom: "Klasa",
    colLang: "Język",
    colLookups: "Wyszukiwania",
    filterPh: "Filtruj po imieniu…",
    countLabel: (n) => `Uczniowie: ${n}`,
    wordsHeading: "Sprawdzane słowa",
    noWords: "Brak wyszukiwań w ostatnim okresie.",
    closeLabel: "Zamknij",
  },
  fa: {
    loading: "در حال بارگذاری…",
    error: "بارگذاری دانش‌آموزان ممکن نشد. لطفاً دوباره تلاش کنید.",
    empty: "هنوز دانش‌آموز فعالی وجود ندارد. برای دیدن دانش‌آموزان با نامشان، فهرست کلاس را اضافه کنید تا هر کودک پیش از جست‌وجو نام خود را انتخاب کند.",
    hint: "بر اساس فعالیت اخیر. جست‌وجوی زیاد می‌تواند نشانه دشواری یا کنجکاوی باشد.",
    sortBy: "مرتب‌سازی بر اساس",
    sortActivity: "فعالیت",
    sortName: "نام",
    sortClassroom: "کلاس",
    colName: "دانش‌آموز",
    colClassroom: "کلاس",
    colLang: "زبان",
    colLookups: "جست‌وجوها",
    filterPh: "فیلتر بر اساس نام…",
    countLabel: (n) => `${n} دانش‌آموز`,
    wordsHeading: "واژه‌های جست‌وجوشده",
    noWords: "هنوز در بازه اخیر جست‌وجویی نشده است.",
    closeLabel: "بستن",
  },
  id: {
    loading: "Memuat…",
    error: "Data murid tidak dapat dimuat. Silakan coba lagi.",
    empty: "Belum ada murid yang aktif. Untuk melihat murid berdasarkan nama, tambahkan daftar kelas agar setiap anak memilih namanya sebelum mencari.",
    hint: "Berdasarkan aktivitas terbaru. Banyak pencarian bisa berarti kesulitan atau rasa ingin tahu.",
    sortBy: "Urutkan menurut",
    sortActivity: "Aktivitas",
    sortName: "Nama",
    sortClassroom: "Kelas",
    colName: "Murid",
    colClassroom: "Kelas",
    colLang: "Bahasa",
    colLookups: "Pencarian",
    filterPh: "Saring menurut nama…",
    countLabel: (n) => `${n} murid`,
    wordsHeading: "Kata yang dicari",
    noWords: "Belum ada pencarian dalam periode terakhir.",
    closeLabel: "Tutup",
  },
  nl: {
    loading: "Laden…",
    error: "De leerlingen konden niet worden geladen. Probeer het opnieuw.",
    empty: "Nog geen actieve leerlingen. Voeg een klassenlijst toe om leerlingen op naam te zien, dan kiest elk kind eerst zijn naam voordat het zoekt.",
    hint: "Op basis van recente activiteit. Veel zoekopdrachten kunnen wijzen op moeite of nieuwsgierigheid.",
    sortBy: "Sorteren op",
    sortActivity: "Activiteit",
    sortName: "Naam",
    sortClassroom: "Klas",
    colName: "Leerling",
    colClassroom: "Klas",
    colLang: "Taal",
    colLookups: "Zoekopdrachten",
    filterPh: "Filteren op naam…",
    countLabel: (n) => `${n} leerlingen`,
    wordsHeading: "Opgezochte woorden",
    noWords: "Nog geen zoekopdrachten in de recente periode.",
    closeLabel: "Sluiten",
  },
  vi: {
    loading: "Đang tải…",
    error: "Không tải được danh sách học sinh. Vui lòng thử lại.",
    empty: "Chưa có học sinh nào hoạt động. Để xem học sinh theo tên, hãy thêm danh sách lớp để mỗi em chọn tên mình trước khi tra.",
    hint: "Dựa trên hoạt động gần đây. Tra nhiều có thể là dấu hiệu gặp khó hoặc tò mò.",
    sortBy: "Sắp xếp theo",
    sortActivity: "Hoạt động",
    sortName: "Tên",
    sortClassroom: "Lớp",
    colName: "Học sinh",
    colClassroom: "Lớp",
    colLang: "Ngôn ngữ",
    colLookups: "Lượt tra",
    filterPh: "Lọc theo tên…",
    countLabel: (n) => `${n} học sinh`,
    wordsHeading: "Các từ đã tra",
    noWords: "Chưa có lượt tra nào trong thời gian gần đây.",
    closeLabel: "Đóng",
  },
  fil: {
    loading: "Naglo-load…",
    error: "Hindi ma-load ang mga estudyante. Pakisubukang muli.",
    empty: "Wala pang aktibong estudyante. Para makita ang mga estudyante ayon sa pangalan, magdagdag ng listahan ng klase para pipiliin ng bawat bata ang kanyang pangalan bago maghanap.",
    hint: "Batay sa kamakailang aktibidad. Ang maraming paghahanap ay puwedeng mangahulugan ng hirap o pagkamausisa.",
    sortBy: "Ayusin ayon sa",
    sortActivity: "Aktibidad",
    sortName: "Pangalan",
    sortClassroom: "Klase",
    colName: "Estudyante",
    colClassroom: "Klase",
    colLang: "Wika",
    colLookups: "Paghahanap",
    filterPh: "I-filter ayon sa pangalan…",
    countLabel: (n) => `${n} estudyante`,
    wordsHeading: "Mga salitang hinanap",
    noWords: "Wala pang paghahanap sa kamakailang panahon.",
    closeLabel: "Isara",
  },
  af: {
    loading: "Laai tans…",
    error: "Kon nie die leerders laai nie. Probeer asseblief weer.",
    empty: "Nog geen aktiewe leerders nie. Om leerders op naam te sien, voeg 'n klaslys by sodat elke kind sy of haar naam kies voordat daar gesoek word.",
    hint: "Gebaseer op onlangse aktiwiteit. Baie soektogte kan op 'n sukkel of nuuskierigheid dui.",
    sortBy: "Sorteer volgens",
    sortActivity: "Aktiwiteit",
    sortName: "Naam",
    sortClassroom: "Klas",
    colName: "Leerder",
    colClassroom: "Klas",
    colLang: "Taal",
    colLookups: "Soektogte",
    filterPh: "Filtreer volgens naam…",
    countLabel: (n) => `${n} leerders`,
    wordsHeading: "Woorde opgesoek",
    noWords: "Nog geen soektogte in die onlangse tydperk nie.",
    closeLabel: "Maak toe",
  },
  sw: {
    loading: "Inapakia…",
    error: "Imeshindwa kupakia wanafunzi. Tafadhali jaribu tena.",
    empty: "Bado hakuna wanafunzi wenye shughuli. Ili kuona wanafunzi kwa majina, ongeza orodha ya darasa ili kila mtoto achague jina lake kabla ya kutafuta.",
    hint: "Kulingana na shughuli za hivi karibuni. Utafutaji mwingi unaweza kuashiria ugumu au udadisi.",
    sortBy: "Panga kwa",
    sortActivity: "Shughuli",
    sortName: "Jina",
    sortClassroom: "Darasa",
    colName: "Mwanafunzi",
    colClassroom: "Darasa",
    colLang: "Lugha",
    colLookups: "Utafutaji",
    filterPh: "Chuja kwa jina…",
    countLabel: (n) => `Wanafunzi ${n}`,
    wordsHeading: "Maneno yaliyotafutwa",
    noWords: "Bado hakuna utafutaji katika kipindi cha karibuni.",
    closeLabel: "Funga",
  },
  "zh-CN": {
    loading: "加载中…",
    error: "无法加载学生，请重试。",
    empty: "还没有活跃的学生。如需按姓名查看学生，请添加班级名单，这样每个孩子在查询前都会先选择自己的名字。",
    hint: "基于近期活动。查询次数多可能意味着遇到困难，也可能是出于好奇。",
    sortBy: "排序方式",
    sortActivity: "活跃度",
    sortName: "姓名",
    sortClassroom: "班级",
    colName: "学生",
    colClassroom: "班级",
    colLang: "语言",
    colLookups: "查询次数",
    filterPh: "按姓名筛选…",
    countLabel: (n) => `${n} 名学生`,
    wordsHeading: "查询过的单词",
    noWords: "近期还没有查询。",
    closeLabel: "关闭",
  },
  "zh-TW": {
    loading: "載入中…",
    error: "無法載入學生，請再試一次。",
    empty: "還沒有活躍的學生。如需依姓名查看學生，請新增班級名單，這樣每個孩子在查詢前都會先選擇自己的名字。",
    hint: "依據近期活動。查詢次數多可能代表遇到困難，也可能是出於好奇。",
    sortBy: "排序方式",
    sortActivity: "活躍度",
    sortName: "姓名",
    sortClassroom: "班級",
    colName: "學生",
    colClassroom: "班級",
    colLang: "語言",
    colLookups: "查詢次數",
    filterPh: "依姓名篩選…",
    countLabel: (n) => `${n} 名學生`,
    wordsHeading: "查詢過的單字",
    noWords: "近期還沒有查詢。",
    closeLabel: "關閉",
  },
  ko: {
    loading: "불러오는 중…",
    error: "학생 목록을 불러오지 못했습니다. 다시 시도해 주세요.",
    empty: "아직 활동한 학생이 없습니다. 학생을 이름으로 보려면 학급 명단을 추가하세요. 그러면 아이마다 검색 전에 자기 이름을 고릅니다.",
    hint: "최근 활동 기준입니다. 검색이 많다는 것은 어려움일 수도, 호기심일 수도 있습니다.",
    sortBy: "정렬 기준",
    sortActivity: "활동",
    sortName: "이름",
    sortClassroom: "학급",
    colName: "학생",
    colClassroom: "학급",
    colLang: "언어",
    colLookups: "검색 수",
    filterPh: "이름으로 찾기…",
    countLabel: (n) => `학생 ${n}명`,
    wordsHeading: "찾아본 단어",
    noWords: "최근 기간에는 아직 검색이 없습니다.",
    closeLabel: "닫기",
  },
  th: {
    loading: "กำลังโหลด…",
    error: "โหลดรายชื่อนักเรียนไม่สำเร็จ โปรดลองอีกครั้ง",
    empty: "ยังไม่มีนักเรียนที่มีกิจกรรม หากต้องการเห็นนักเรียนตามชื่อ ให้เพิ่มรายชื่อห้องเรียน เพื่อให้เด็กแต่ละคนเลือกชื่อตัวเองก่อนค้นหา",
    hint: "อ้างอิงจากกิจกรรมล่าสุด การค้นหาบ่อยอาจหมายถึงความยากลำบากหรือความอยากรู้",
    sortBy: "เรียงตาม",
    sortActivity: "กิจกรรม",
    sortName: "ชื่อ",
    sortClassroom: "ห้องเรียน",
    colName: "นักเรียน",
    colClassroom: "ห้องเรียน",
    colLang: "ภาษา",
    colLookups: "การค้นหา",
    filterPh: "กรองตามชื่อ…",
    countLabel: (n) => `นักเรียน ${n} คน`,
    wordsHeading: "คำที่ค้นหา",
    noWords: "ยังไม่มีการค้นหาในช่วงล่าสุด",
    closeLabel: "ปิด",
  },
  bn: {
    loading: "লোড হচ্ছে…",
    error: "শিক্ষার্থীদের তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।",
    empty: "এখনও কোনো সক্রিয় শিক্ষার্থী নেই। নাম দিয়ে শিক্ষার্থীদের দেখতে ক্লাসের তালিকা যোগ করুন, তাহলে প্রতিটি শিশু খোঁজার আগে নিজের নাম বেছে নেবে।",
    hint: "সাম্প্রতিক কার্যকলাপের ভিত্তিতে। বেশি খোঁজ মানে অসুবিধা বা কৌতূহল হতে পারে।",
    sortBy: "সাজান",
    sortActivity: "কার্যকলাপ",
    sortName: "নাম",
    sortClassroom: "ক্লাস",
    colName: "শিক্ষার্থী",
    colClassroom: "ক্লাস",
    colLang: "ভাষা",
    colLookups: "খোঁজ",
    filterPh: "নাম দিয়ে ছাঁকুন…",
    countLabel: (n) => `${n} জন শিক্ষার্থী`,
    wordsHeading: "খোঁজা শব্দ",
    noWords: "সাম্প্রতিক সময়ে এখনও কোনো খোঁজ নেই।",
    closeLabel: "বন্ধ করুন",
  },
  da: {
    loading: "Indlæser…",
    error: "Vi kunne ikke indlæse eleverne. Prøv igen.",
    empty: "Ingen aktive elever endnu. For at se eleverne ved navn skal du tilføje en klasseliste, så hvert barn vælger sit navn, før der søges.",
    hint: "Baseret på nylig aktivitet. Mange opslag kan betyde, at eleven kæmper, eller at eleven er nysgerrig.",
    sortBy: "Sortér efter",
    sortActivity: "Aktivitet",
    sortName: "Navn",
    sortClassroom: "Klasse",
    colName: "Elev",
    colClassroom: "Klasse",
    colLang: "Sprog",
    colLookups: "Opslag",
    filterPh: "Filtrér efter navn…",
    countLabel: (n) => `${n} elever`,
    wordsHeading: "Ord slået op",
    noWords: "Ingen opslag i den seneste periode endnu.",
    closeLabel: "Luk",
  },
  hu: {
    loading: "Betöltés…",
    error: "Nem sikerült betölteni a tanulókat. Próbálja újra.",
    empty: "Még nincs aktív tanuló. Ha név szerint szeretné látni a tanulókat, adjon hozzá osztálynévsort, így minden gyerek keresés előtt kiválasztja a nevét.",
    hint: "A legutóbbi aktivitás alapján. A sok keresés nehézséget vagy kíváncsiságot is jelenthet.",
    sortBy: "Rendezés",
    sortActivity: "Aktivitás",
    sortName: "Név",
    sortClassroom: "Osztály",
    colName: "Tanuló",
    colClassroom: "Osztály",
    colLang: "Nyelv",
    colLookups: "Keresések",
    filterPh: "Szűrés név szerint…",
    countLabel: (n) => `${n} tanuló`,
    wordsHeading: "Keresett szavak",
    noWords: "A legutóbbi időszakban még nem volt keresés.",
    closeLabel: "Bezárás",
  },
};

export function SchoolStudentsPanel({ lang }: { lang: string }) {
  const { user } = useAuth();
  const href = useHref();
  const t = COPY[lang] ?? COPY.en;
  const dir = getLangDir(lang as Lang);
  const wordsHeading = t.wordsHeading ?? COPY.en.wordsHeading!;
  const noWords = t.noWords ?? COPY.en.noWords!;
  const closeLabel = t.closeLabel ?? COPY.en.closeLabel!;
  const [selected, setSelected] = useState<StudentRow | null>(null);

  const [rows, setRows] = useState<StudentRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState<Sort>("activity");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/schools/insights", { headers: { Authorization: `Bearer ${idToken}` } });
        if (!res.ok) { if (!cancelled) setError(true); return; }
        const json = (await res.json()) as { students?: StudentRow[] };
        if (!cancelled) setRows(json.students ?? []);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const view = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const filtered = (rows ?? []).filter((r) => !q || r.name.toLowerCase().includes(q));
    const sorted = [...filtered];
    if (sort === "activity") sorted.sort((a, b) => b.count - a.count);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else sorted.sort((a, b) => a.classroomName.localeCompare(b.classroomName) || b.count - a.count);
    return sorted;
  }, [rows, sort, filter]);

  if (loading) return <p style={{ color: "#78716C", fontSize: 15 }}>{t.loading}</p>;
  if (error || !rows) return <p style={{ color: "#B45309", fontSize: 15 }}>{t.error}</p>;
  if (rows.length === 0) {
    return (
      <div style={{ background: "#fff", border: "1px dashed #E5E0D8", borderRadius: 16, padding: "32px 24px", textAlign: "center" }}>
        <p style={{ color: "#78716C", fontSize: 15, margin: 0, lineHeight: 1.6 }}>{t.empty}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Controls: filter + sort */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t.filterPh}
          style={{ flex: "1 1 200px", maxWidth: 300, padding: "9px 14px", border: "1.5px solid #E5E0D8", borderRadius: 10, background: "#fff", fontSize: 14, outline: "none", color: "#1C1917" }}
        />
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12.5, color: "#78716C", fontWeight: 600 }}>{t.sortBy}</span>
          {(["activity", "name", "classroom"] as Sort[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSort(s)}
              style={{
                padding: "6px 12px", borderRadius: 999,
                border: sort === s ? "1.5px solid #CA8A04" : "1px solid #E5E0D8",
                background: sort === s ? "#FEF3C7" : "#fff",
                color: sort === s ? "#92400E" : "#78716C",
                fontSize: 12.5, fontWeight: sort === s ? 700 : 600, cursor: "pointer",
              }}
            >
              {s === "activity" ? t.sortActivity : s === "name" ? t.sortName : t.sortClassroom}
            </button>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 12, color: "#A8A29E", margin: "0 2px 14px" }}>{t.countLabel(view.length)} · {t.hint}</p>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {view.map((r) => (
          <div key={`${r.classroomId}:${r.name}`} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #EAE7E3", borderRadius: 12, padding: "12px 16px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setSelected(r)}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, flex: "1 1 120px", minWidth: 100, background: "transparent", border: "none", padding: 0, cursor: "pointer", font: "inherit", textAlign: "start", fontSize: 15, fontWeight: 700, color: "#1C1917" }}
            >
              {r.name}
              <span aria-hidden="true" style={{ color: "#CA8A04", fontSize: 15 }}>{dir === "rtl" ? "‹" : "›"}</span>
            </button>
            <Link href={href(`/classroom/${r.classroomId}`)} style={{ display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none", fontSize: 13, color: "#78716C", minWidth: 90 }}>
              <span style={{ width: 10, height: 10, borderRadius: 999, flexShrink: 0, background: classroomColorFor({ colorIndex: r.colorIndex }) }} />
              <span style={{ fontWeight: 600 }}>{r.classroomName || r.code}</span>
            </Link>
            <span style={{ fontSize: 12.5, color: "#78716C", minWidth: 64 }}>{r.topLanguage ? classroomLangLabel(r.topLanguage) : "—"}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#CA8A04", minWidth: 48, textAlign: "end" }}>{r.count}</span>
          </div>
        ))}
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(28,25,23,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            dir={dir}
            style={{ position: "relative", width: "100%", maxWidth: 460, maxHeight: "82vh", overflowY: "auto", background: "#fff", borderRadius: 18, padding: "22px 22px 24px", boxShadow: "0 24px 60px -20px rgba(28,25,23,0.5)" }}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label={closeLabel}
              style={{ position: "absolute", insetInlineEnd: 12, top: 12, width: 32, height: 32, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", fontSize: 22, lineHeight: 1, color: "#78716C" }}
            >
              ×
            </button>
            <div style={{ fontSize: 21, fontWeight: 800, color: "#1C1917", paddingInlineEnd: 28 }}>{selected.name}</div>
            <div style={{ fontSize: 13, color: "#78716C", marginTop: 3 }}>
              {selected.classroomName || selected.code} · {selected.count} {t.colLookups}
              {selected.topLanguage ? ` · ${classroomLangLabel(selected.topLanguage)}` : ""}
            </div>
            <div style={{ marginTop: 18, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#CA8A04" }}>{wordsHeading}</div>
            {!selected.words || selected.words.length === 0 ? (
              <div style={{ marginTop: 8, fontSize: 14, color: "#A8A29E" }}>{noWords}</div>
            ) : (
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {selected.words.map((w) => (
                  <Link
                    key={w.word}
                    href={href(`/word/${encodeURIComponent(w.word)}`)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 999, padding: "6px 12px", fontSize: 14, fontWeight: 600, color: "#92400E", textDecoration: "none" }}
                  >
                    {w.word}
                    {w.count > 1 && <span style={{ fontSize: 12, fontWeight: 800, color: "#CA8A04", background: "#FEF3C7", borderRadius: 999, padding: "1px 7px" }}>{w.count}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

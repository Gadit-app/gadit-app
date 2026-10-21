"use client";

import { WaitText } from "@/components/WaitText";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

/**
 * The principal dashboard for schools without student codes (all Israeli
 * schools), built from what the teachers project in class (Gadi
 * 2026-10-10): words in the class dictionary, lessons, class quizzes and
 * games, an 8-week timeline, subjects, the words classes came back to, and
 * the recent lessons. Data: /api/schools/teacher-activity.
 */

type Data = {
  totals: { dictionary: number; wordsShown: number; lessons: number; lessonsThisWeek: number; activities: number };
  weeks: { week: string; words: number; lessons: number; activities: number }[];
  subjects: { subject: string; lessons: number; words: number }[];
  repeated: { word: string; days: number }[];
  recent: { day: string; title: string; subject: string; grade: string; words: number; quizzes: number }[];
};

type ActivityCopy = Record<
  | "loading" | "empty" | "dictionary" | "lessons" | "thisWeek" | "activities"
  | "weeks" | "weekOf" | "wordsLbl" | "lessonsLbl" | "subjects" | "repeated"
  | "repeatedSub" | "daysLbl" | "recent" | "quizLbl" | "noRepeat",
  string
>;

const COPY: Record<string, ActivityCopy> = {
  he: {
    loading: "טוען את נתוני בית הספר...",
    empty: "עוד לא הוקרן שיעור. כשהמורים יקרינו מילים מקבוצות המילים, כאן תראו מה נלמד, באילו מקצועות ומתי.",
    dictionary: "מילים במילון בית הספר", lessons: "שיעורים עם Gadit", thisWeek: "שיעורים השבוע", activities: "חידונים ומשחקים לכיתה",
    weeks: "פעילות ב-8 השבועות האחרונים", weekOf: "שבוע", wordsLbl: "מילים", lessonsLbl: "שיעורים",
    subjects: "לפי מקצוע", repeated: "מילים שהכיתות חזרו אליהן", repeatedSub: "הוקרנו ביותר מיום אחד", daysLbl: "ימים",
    recent: "שיעורים אחרונים", quizLbl: "חידונים ומשחקים", noRepeat: "עוד אין מילים שהוקרנו ביותר מיום אחד.",
  },
  en: {
    loading: "Loading your school's numbers...",
    empty: "No lesson projected yet. When teachers project words from the word sets, you'll see here what was taught, in which subjects and when.",
    dictionary: "Words in the school dictionary", lessons: "Lessons with Gadit", thisWeek: "Lessons this week", activities: "Class quizzes and games",
    weeks: "Activity over the last 8 weeks", weekOf: "Week of", wordsLbl: "words", lessonsLbl: "lessons",
    subjects: "By subject", repeated: "Words classes came back to", repeatedSub: "projected on more than one day", daysLbl: "days",
    recent: "Recent lessons", quizLbl: "quizzes and games", noRepeat: "No word has been projected on more than one day yet.",
  },
  ar: {
    loading: "جارٍ تحميل بيانات المدرسة...",
    empty: "لم يُعرض أي درس بعد. عندما يعرض المعلمون كلمات من مجموعات الكلمات، سترون هنا ما تم تعلّمه، وفي أي مواد، ومتى.",
    dictionary: "كلمات في قاموس المدرسة", lessons: "دروس مع Gadit", thisWeek: "دروس هذا الأسبوع", activities: "اختبارات وألعاب للصف",
    weeks: "النشاط في آخر 8 أسابيع", weekOf: "أسبوع", wordsLbl: "كلمات", lessonsLbl: "دروس",
    subjects: "حسب المادة", repeated: "كلمات عادت إليها الصفوف", repeatedSub: "عُرضت في أكثر من يوم واحد", daysLbl: "أيام",
    recent: "آخر الدروس", quizLbl: "اختبارات وألعاب", noRepeat: "لا توجد بعد كلمات عُرضت في أكثر من يوم واحد.",
  },
  ru: {
    loading: "Загружаем данные школы...",
    empty: "Пока ни одного урока на экране. Когда учителя покажут слова из наборов слов, здесь будет видно, что изучали, по каким предметам и когда.",
    dictionary: "Слова в школьном словаре", lessons: "Уроки с Gadit", thisWeek: "Уроки на этой неделе", activities: "Викторины и игры в классе",
    weeks: "Активность за последние 8 недель", weekOf: "Неделя с", wordsLbl: "слов", lessonsLbl: "уроков",
    subjects: "По предметам", repeated: "Слова, к которым классы возвращались", repeatedSub: "показаны больше чем в один день", daysLbl: "дн.",
    recent: "Последние уроки", quizLbl: "викторин и игр", noRepeat: "Пока нет слов, показанных больше чем в один день.",
  },
  es: {
    loading: "Cargando los datos de su escuela...",
    empty: "Todavía no se ha proyectado ninguna lección. Cuando los docentes proyecten palabras de los grupos de palabras, aquí verá qué se enseñó, en qué asignaturas y cuándo.",
    dictionary: "Palabras en el diccionario de la escuela", lessons: "Lecciones con Gadit", thisWeek: "Lecciones esta semana", activities: "Cuestionarios y juegos en clase",
    weeks: "Actividad en las últimas 8 semanas", weekOf: "Semana del", wordsLbl: "palabras", lessonsLbl: "lecciones",
    subjects: "Por asignatura", repeated: "Palabras a las que volvieron las clases", repeatedSub: "proyectadas en más de un día", daysLbl: "días",
    recent: "Lecciones recientes", quizLbl: "cuestionarios y juegos", noRepeat: "Todavía ninguna palabra se ha proyectado en más de un día.",
  },
  pt: {
    loading: "Carregando os dados da sua escola...",
    empty: "Nenhuma aula projetada ainda. Quando os professores projetarem palavras dos conjuntos de palavras, você verá aqui o que foi ensinado, em quais disciplinas e quando.",
    dictionary: "Palavras no dicionário da escola", lessons: "Aulas com o Gadit", thisWeek: "Aulas nesta semana", activities: "Quizzes e jogos em sala",
    weeks: "Atividade nas últimas 8 semanas", weekOf: "Semana de", wordsLbl: "palavras", lessonsLbl: "aulas",
    subjects: "Por disciplina", repeated: "Palavras às quais as turmas voltaram", repeatedSub: "projetadas em mais de um dia", daysLbl: "dias",
    recent: "Aulas recentes", quizLbl: "quizzes e jogos", noRepeat: "Ainda nenhuma palavra foi projetada em mais de um dia.",
  },
  fr: {
    loading: "Chargement des données de votre établissement...",
    empty: "Aucune leçon projetée pour l'instant. Quand les enseignants projetteront des mots des listes de mots, vous verrez ici ce qui a été appris, dans quelles matières et quand.",
    dictionary: "Mots dans le dictionnaire de l'école", lessons: "Leçons avec Gadit", thisWeek: "Leçons cette semaine", activities: "Quiz et jeux en classe",
    weeks: "Activité sur les 8 dernières semaines", weekOf: "Semaine du", wordsLbl: "mots", lessonsLbl: "leçons",
    subjects: "Par matière", repeated: "Mots que les classes ont revus", repeatedSub: "projetés sur plus d'une journée", daysLbl: "jours",
    recent: "Leçons récentes", quizLbl: "quiz et jeux", noRepeat: "Aucun mot n'a encore été projeté sur plus d'une journée.",
  },
  de: {
    loading: "Die Daten Ihrer Schule werden geladen...",
    empty: "Noch keine Stunde projiziert. Sobald Lehrkräfte Wörter aus den Wortlisten projizieren, sehen Sie hier, was gelernt wurde, in welchen Fächern und wann.",
    dictionary: "Wörter im Schulwörterbuch", lessons: "Unterrichtsstunden mit Gadit", thisWeek: "Stunden diese Woche", activities: "Quizze und Spiele in der Klasse",
    weeks: "Aktivität der letzten 8 Wochen", weekOf: "Woche vom", wordsLbl: "Wörter", lessonsLbl: "Stunden",
    subjects: "Nach Fach", repeated: "Wörter, zu denen Klassen zurückkehrten", repeatedSub: "an mehr als einem Tag projiziert", daysLbl: "Tage",
    recent: "Letzte Stunden", quizLbl: "Quizze und Spiele", noRepeat: "Noch kein Wort wurde an mehr als einem Tag projiziert.",
  },
  cs: {
    loading: "Načítáme údaje vaší školy...",
    empty: "Zatím nebyla promítnuta žádná hodina. Až učitelé promítnou slova ze sad slov, uvidíte tu, co se učilo, v jakých předmětech a kdy.",
    dictionary: "Slova ve školním slovníku", lessons: "Hodiny s Gadit", thisWeek: "Hodiny tento týden", activities: "Kvízy a hry pro třídu",
    weeks: "Aktivita za posledních 8 týdnů", weekOf: "Týden od", wordsLbl: "slov", lessonsLbl: "hodin",
    subjects: "Podle předmětu", repeated: "Slova, ke kterým se třídy vracely", repeatedSub: "promítnutá ve více než jednom dni", daysLbl: "dní",
    recent: "Poslední hodiny", quizLbl: "kvízů a her", noRepeat: "Zatím žádné slovo nebylo promítnuto ve více než jednom dni.",
  },
  sk: {
    loading: "Načítavame údaje vašej školy...",
    empty: "Zatiaľ nebola premietnutá žiadna hodina. Keď učitelia premietnu slová zo sád slov, uvidíte tu, čo sa učilo, v akých predmetoch a kedy.",
    dictionary: "Slová v školskom slovníku", lessons: "Hodiny s Gadit", thisWeek: "Hodiny tento týždeň", activities: "Kvízy a hry pre triedu",
    weeks: "Aktivita za posledných 8 týždňov", weekOf: "Týždeň od", wordsLbl: "slov", lessonsLbl: "hodín",
    subjects: "Podľa predmetu", repeated: "Slová, ku ktorým sa triedy vracali", repeatedSub: "premietnuté vo viac ako jednom dni", daysLbl: "dní",
    recent: "Posledné hodiny", quizLbl: "kvízov a hier", noRepeat: "Zatiaľ žiadne slovo nebolo premietnuté vo viac ako jednom dni.",
  },
  it: {
    loading: "Caricamento dei dati della scuola...",
    empty: "Nessuna lezione proiettata finora. Quando gli insegnanti proietteranno parole dai gruppi di parole, qui vedrà cosa è stato insegnato, in quali materie e quando.",
    dictionary: "Parole nel dizionario della scuola", lessons: "Lezioni con Gadit", thisWeek: "Lezioni questa settimana", activities: "Quiz e giochi in classe",
    weeks: "Attività nelle ultime 8 settimane", weekOf: "Settimana del", wordsLbl: "parole", lessonsLbl: "lezioni",
    subjects: "Per materia", repeated: "Parole su cui le classi sono tornate", repeatedSub: "proiettate in più di un giorno", daysLbl: "giorni",
    recent: "Lezioni recenti", quizLbl: "quiz e giochi", noRepeat: "Nessuna parola è ancora stata proiettata in più di un giorno.",
  },
  ja: {
    loading: "学校のデータを読み込んでいます...",
    empty: "まだ投影された授業はありません。先生が単語セットから単語を投影すると、何をどの教科でいつ学んだかがここに表示されます。",
    dictionary: "学校の辞書にある単語", lessons: "Gadit を使った授業", thisWeek: "今週の授業", activities: "クラスのクイズとゲーム",
    weeks: "過去8週間のアクティビティ", weekOf: "週の開始日", wordsLbl: "語", lessonsLbl: "授業",
    subjects: "教科別", repeated: "クラスが繰り返し学んだ単語", repeatedSub: "2日以上投影された単語", daysLbl: "日",
    recent: "最近の授業", quizLbl: "クイズ・ゲーム", noRepeat: "2日以上投影された単語はまだありません。",
  },
  hi: {
    loading: "आपके स्कूल का डेटा लोड हो रहा है...",
    empty: "अभी तक कोई पाठ प्रोजेक्ट नहीं हुआ है। जब शिक्षक शब्द समूहों से शब्द प्रोजेक्ट करेंगे, तो यहाँ आप देखेंगे कि क्या पढ़ाया गया, किन विषयों में और कब।",
    dictionary: "स्कूल शब्दकोश में शब्द", lessons: "Gadit के साथ पाठ", thisWeek: "इस सप्ताह के पाठ", activities: "कक्षा क्विज़ और खेल",
    weeks: "पिछले 8 सप्ताहों की गतिविधि", weekOf: "सप्ताह", wordsLbl: "शब्द", lessonsLbl: "पाठ",
    subjects: "विषय के अनुसार", repeated: "शब्द जिन पर कक्षाएँ लौटीं", repeatedSub: "एक से अधिक दिन प्रोजेक्ट किए गए", daysLbl: "दिन",
    recent: "हाल के पाठ", quizLbl: "क्विज़ और खेल", noRepeat: "अभी तक कोई शब्द एक से अधिक दिन प्रोजेक्ट नहीं हुआ है।",
  },
  am: {
    loading: "የትምህርት ቤትዎ መረጃ እየተጫነ ነው...",
    empty: "እስካሁን ምንም ትምህርት በስክሪን አልታየም። መምህራን ከቃላት ስብስቦች ቃላትን በስክሪን ሲያሳዩ፣ ምን እንደተማሩ፣ በየትኛው የትምህርት ዓይነት እና መቼ እዚህ ያያሉ።",
    dictionary: "በትምህርት ቤቱ መዝገበ ቃላት ውስጥ ያሉ ቃላት", lessons: "ከGadit ጋር የተሰጡ ትምህርቶች", thisWeek: "በዚህ ሳምንት የተሰጡ ትምህርቶች", activities: "የክፍል ጥያቄዎችና ጨዋታዎች",
    weeks: "ባለፉት 8 ሳምንታት የነበረው እንቅስቃሴ", weekOf: "ሳምንት", wordsLbl: "ቃላት", lessonsLbl: "ትምህርቶች",
    subjects: "በትምህርት ዓይነት", repeated: "ክፍሎች የተመለሱባቸው ቃላት", repeatedSub: "ከአንድ ቀን በላይ የታዩ", daysLbl: "ቀናት",
    recent: "የቅርብ ጊዜ ትምህርቶች", quizLbl: "ጥያቄዎችና ጨዋታዎች", noRepeat: "እስካሁን ከአንድ ቀን በላይ የታየ ቃል የለም።",
  },
  uk: {
    loading: "Завантажуємо дані школи...",
    empty: "Ще жоден урок не показано на екрані. Коли вчителі покажуть слова з наборів слів, тут буде видно, що вивчали, з яких предметів і коли.",
    dictionary: "Слова в шкільному словнику", lessons: "Уроки з Gadit", thisWeek: "Уроки цього тижня", activities: "Вікторини та ігри в класі",
    weeks: "Активність за останні 8 тижнів", weekOf: "Тиждень з", wordsLbl: "слів", lessonsLbl: "уроків",
    subjects: "За предметами", repeated: "Слова, до яких класи поверталися", repeatedSub: "показані більш ніж в один день", daysLbl: "дн.",
    recent: "Останні уроки", quizLbl: "вікторин та ігор", noRepeat: "Поки немає слів, показаних більш ніж в один день.",
  },
  tr: {
    loading: "Okulunuzun verileri yükleniyor...",
    empty: "Henüz yansıtılan bir ders yok. Öğretmenler kelime setlerinden kelimeleri yansıttığında, burada neyin, hangi derslerde ve ne zaman öğretildiğini göreceksiniz.",
    dictionary: "Okul sözlüğündeki kelimeler", lessons: "Gadit ile dersler", thisWeek: "Bu haftaki dersler", activities: "Sınıf testleri ve oyunları",
    weeks: "Son 8 haftadaki etkinlik", weekOf: "Hafta", wordsLbl: "kelime", lessonsLbl: "ders",
    subjects: "Derse göre", repeated: "Sınıfların geri döndüğü kelimeler", repeatedSub: "birden fazla günde yansıtıldı", daysLbl: "gün",
    recent: "Son dersler", quizLbl: "test ve oyun", noRepeat: "Henüz birden fazla günde yansıtılan bir kelime yok.",
  },
  pl: {
    loading: "Wczytujemy dane szkoły...",
    empty: "Nie wyświetlono jeszcze żadnej lekcji. Gdy nauczyciele wyświetlą słowa z zestawów słów, tutaj będzie widać, czego uczono, na jakich przedmiotach i kiedy.",
    dictionary: "Słowa w szkolnym słowniku", lessons: "Lekcje z Gadit", thisWeek: "Lekcje w tym tygodniu", activities: "Quizy i gry w klasie",
    weeks: "Aktywność w ostatnich 8 tygodniach", weekOf: "Tydzień od", wordsLbl: "słów", lessonsLbl: "lekcji",
    subjects: "Według przedmiotu", repeated: "Słowa, do których klasy wracały", repeatedSub: "wyświetlane w więcej niż jeden dzień", daysLbl: "dni",
    recent: "Ostatnie lekcje", quizLbl: "quizów i gier", noRepeat: "Żadne słowo nie było jeszcze wyświetlane w więcej niż jeden dzień.",
  },
  fa: {
    loading: "در حال بارگذاری داده‌های مدرسه...",
    empty: "هنوز درسی روی پرده نمایش داده نشده است. وقتی معلمان واژه‌هایی از مجموعه‌های واژه را نمایش دهند، اینجا می‌بینید چه چیزی، در کدام درس‌ها و چه زمانی آموزش داده شده است.",
    dictionary: "واژه‌های فرهنگ لغت مدرسه", lessons: "درس‌ها با Gadit", thisWeek: "درس‌های این هفته", activities: "آزمونک‌ها و بازی‌های کلاسی",
    weeks: "فعالیت در 8 هفته گذشته", weekOf: "هفته", wordsLbl: "واژه", lessonsLbl: "درس",
    subjects: "بر اساس موضوع درسی", repeated: "واژه‌هایی که کلاس‌ها به آن‌ها برگشتند", repeatedSub: "در بیش از یک روز نمایش داده شده", daysLbl: "روز",
    recent: "درس‌های اخیر", quizLbl: "آزمونک و بازی", noRepeat: "هنوز هیچ واژه‌ای در بیش از یک روز نمایش داده نشده است.",
  },
  id: {
    loading: "Memuat data sekolah Anda...",
    empty: "Belum ada pelajaran yang ditayangkan. Saat guru menayangkan kata dari kumpulan kata, di sini Anda akan melihat apa yang diajarkan, di mata pelajaran apa, dan kapan.",
    dictionary: "Kata di kamus sekolah", lessons: "Pelajaran dengan Gadit", thisWeek: "Pelajaran minggu ini", activities: "Kuis dan permainan kelas",
    weeks: "Aktivitas 8 minggu terakhir", weekOf: "Minggu", wordsLbl: "kata", lessonsLbl: "pelajaran",
    subjects: "Per mata pelajaran", repeated: "Kata yang diulang kelas", repeatedSub: "ditayangkan lebih dari satu hari", daysLbl: "hari",
    recent: "Pelajaran terbaru", quizLbl: "kuis dan permainan", noRepeat: "Belum ada kata yang ditayangkan lebih dari satu hari.",
  },
  nl: {
    loading: "De gegevens van uw school worden geladen...",
    empty: "Nog geen les geprojecteerd. Zodra leerkrachten woorden uit de woordensets projecteren, ziet u hier wat er is geleerd, in welke vakken en wanneer.",
    dictionary: "Woorden in het schoolwoordenboek", lessons: "Lessen met Gadit", thisWeek: "Lessen deze week", activities: "Quizzen en spellen in de klas",
    weeks: "Activiteit in de afgelopen 8 weken", weekOf: "Week van", wordsLbl: "woorden", lessonsLbl: "lessen",
    subjects: "Per vak", repeated: "Woorden waar klassen op terugkwamen", repeatedSub: "op meer dan één dag geprojecteerd", daysLbl: "dagen",
    recent: "Recente lessen", quizLbl: "quizzen en spellen", noRepeat: "Nog geen woord is op meer dan één dag geprojecteerd.",
  },
  el: {
    loading: "Φόρτωση των στοιχείων του σχολείου σας...",
    empty: "Δεν έχει προβληθεί ακόμη κανένα μάθημα. Όταν οι εκπαιδευτικοί προβάλλουν λέξεις από τα σύνολα λέξεων, εδώ θα βλέπετε τι διδάχτηκε, σε ποια μαθήματα και πότε.",
    dictionary: "Λέξεις στο λεξικό του σχολείου", lessons: "Μαθήματα με το Gadit", thisWeek: "Μαθήματα αυτή την εβδομάδα", activities: "Κουίζ και παιχνίδια στην τάξη",
    weeks: "Δραστηριότητα τις τελευταίες 8 εβδομάδες", weekOf: "Εβδομάδα", wordsLbl: "λέξεις", lessonsLbl: "μαθήματα",
    subjects: "Ανά μάθημα", repeated: "Λέξεις στις οποίες επέστρεψαν οι τάξεις", repeatedSub: "προβλήθηκαν σε περισσότερες από μία ημέρες", daysLbl: "ημέρες",
    recent: "Πρόσφατα μαθήματα", quizLbl: "κουίζ και παιχνίδια", noRepeat: "Καμία λέξη δεν έχει προβληθεί ακόμη σε περισσότερες από μία ημέρες.",
  },
  zu: {
    loading: "Silayisha imininingwane yesikole sakho...",
    empty: "Asikho isifundo esesiboniswe esikrinini. Uma othisha bebonisa amagama asemaqoqweni amagama, lapha uzobona ukuthi kufundwe ini, kuziphi izifundo nokuthi nini.",
    dictionary: "Amagama asesichazamazwini sesikole", lessons: "Izifundo nge-Gadit", thisWeek: "Izifundo zaleli sonto", activities: "Imibuzo nemidlalo yekilasi",
    weeks: "Umsebenzi wamasonto angu-8 adlule", weekOf: "Isonto", wordsLbl: "amagama", lessonsLbl: "izifundo",
    subjects: "Ngesifundo", repeated: "Amagama amakilasi abuyela kuwo", repeatedSub: "aboniswe ezinsukwini ezingaphezu kolulodwa", daysLbl: "izinsuku",
    recent: "Izifundo zakamuva", quizLbl: "imibuzo nemidlalo", noRepeat: "Alikho igama eseliboniswe ezinsukwini ezingaphezu kolulodwa.",
  },
  xh: {
    loading: "Silayisha amanani esikolo sakho...",
    empty: "Akukabikho sifundo siboniswe kwisikrini. Xa ootitshala bebonisa amagama avela kumaqela amagama, uza kubona apha into efundisiweyo, kwezifundo ezithile kunye nexesha.",
    dictionary: "Amagama asesichazi-magama sesikolo", lessons: "Izifundo nge-Gadit", thisWeek: "Izifundo kule veki", activities: "Imibuzo nemidlalo yeklasi",
    weeks: "Umsebenzi kwiiveki ezi-8 zokugqibela", weekOf: "Iveki ka", wordsLbl: "amagama", lessonsLbl: "izifundo",
    subjects: "Ngesifundo", repeated: "Amagama iiklasi ezibuyele kuwo", repeatedSub: "aboniswe ngaphezu kosuku olunye", daysLbl: "iintsuku",
    recent: "Izifundo zakutshanje", quizLbl: "imibuzo nemidlalo", noRepeat: "Akukabikho gama liboniswe ngaphezu kosuku olunye.",
  },
  nso: {
    loading: "Re laiša dipalo tša sekolo sa gago...",
    empty: "Ga go eso be le thuto ye e bontšhitšwego. Ge barutiši ba bontšha mantšu go tšwa dihlopheng tša mantšu, o tla bona mo seo se rutilwego, dithutong dife le neng.",
    dictionary: "Mantšu pukuntšung ya sekolo", lessons: "Dithuto ka Gadit", thisWeek: "Dithuto beke ye", activities: "Ditlhahlobo le dipapadi tša phapoši",
    weeks: "Mošomo dibekeng tše 8 tša mafelelo", weekOf: "Beke ya", wordsLbl: "mantšu", lessonsLbl: "dithuto",
    subjects: "Go ya ka thuto", repeated: "Mantšu ao diphapoši di boetšego go ona", repeatedSub: "a bontšhitšwe ka matšatši a go feta le tee", daysLbl: "matšatši",
    recent: "Dithuto tša morago bjale", quizLbl: "ditlhahlobo le dipapadi", noRepeat: "Ga go eso be le lentšu leo le bontšhitšwego ka matšatši a go feta le tee.",
  },
  tn: {
    loading: "Re laisa dipalo tsa sekolo sa gago...",
    empty: "Ga go ise go bontshiwe thuto. Fa barutabana ba bontsha mafoko go tswa mo disete tsa mafoko, o tla bona fa se se rutilweng, mo dithutong dife le leng.",
    dictionary: "Mafoko mo thanoding ya sekolo", lessons: "Dithuto ka Gadit", thisWeek: "Dithuto mo bekeng e", activities: "Ditlhatlhobo le metshameko ya phaposi",
    weeks: "Tiro mo dibekeng di le 8 tsa bofelo", weekOf: "Beke ya", wordsLbl: "mafoko", lessonsLbl: "dithuto",
    subjects: "Go ya ka serutwa", repeated: "Mafoko a diphaposi di boetseng kwa go one", repeatedSub: "a bontshitswe mo malatsing a a fetang le le lengwe", daysLbl: "malatsi",
    recent: "Dithuto tsa bosheng", quizLbl: "ditlhatlhobo le metshameko", noRepeat: "Ga go ise go nne le lefoko le le bontshitsweng mo malatsing a a fetang le le lengwe.",
  },
  st: {
    loading: "Re laela dipalo tsa sekolo sa hao...",
    empty: "Ha ho thuto e bontshitsweng hajwale. Ha matitjhere a bontsha mantswe ho tswa dihlopheng tsa mantswe, o tla bona mona se rutilweng, dithutong dife le neng.",
    dictionary: "Mantswe a bukantswe ya sekolo", lessons: "Dithuto ka Gadit", thisWeek: "Dithuto bekeng ena", activities: "Dikwisi le dipapadi tsa tlelase",
    weeks: "Mosebetsi dibekeng tse 8 tse fetileng", weekOf: "Beke ya", wordsLbl: "mantswe", lessonsLbl: "dithuto",
    subjects: "Ho ya ka thuto", repeated: "Mantswe ao ditlelase di kgutletseng ho ona", repeatedSub: "a bontshitswe ka matsatsi a fetang le le leng", daysLbl: "matsatsi",
    recent: "Dithuto tsa morao tjena", quizLbl: "dikwisi le dipapadi", noRepeat: "Ha ho lentswe le bontshitsweng ka matsatsi a fetang le le leng hajwale.",
  },
  ts: {
    loading: "Hi layicha tinomboro ta xikolo xa n'wina...",
    empty: "A ku si kombisiwa dyondzo. Loko vadyondzisi va kombisa marito ku suka eka mintlawa ya marito, mi ta vona laha leswi dyondzisiweke, eka tidyondzo tihi na rini.",
    dictionary: "Marito eka dikixinari ya xikolo", lessons: "Tidyondzo hi Gadit", thisWeek: "Tidyondzo vhiki leri", activities: "Mavutiso na mintlangu ya tlilasi",
    weeks: "Ntirho eka mavhiki ya 8 lama hundzeke", weekOf: "Vhiki ra", wordsLbl: "marito", lessonsLbl: "tidyondzo",
    subjects: "Hi ku ya hi dyondzo", repeated: "Marito lawa titlilasi ti ma vuyeleleke", repeatedSub: "ma kombisiwile eka masiku yo tlula rin'we", daysLbl: "masiku",
    recent: "Tidyondzo ta sweswinyana", quizLbl: "mavutiso na mintlangu", noRepeat: "A ku si va na rito leri kombisiweke eka masiku yo tlula rin'we.",
  },
  ss: {
    loading: "Kulayishwa tinombolo tesikolwa sakho...",
    empty: "Akukakhonjiswa sifundvo okwamanje. Nangabe bothishela bakhombisa emagama lasemacebeni emagama, utawubona lapha loko lokufundzisiwe, kutiphi tifundvo futsi nini.",
    dictionary: "Emagama lasesichazamagameni sesikolwa", lessons: "Tifundvo nge-Gadit", thisWeek: "Tifundvo kuleliviki", activities: "Imibuto nemidlalo yelikilasi",
    weeks: "Kusebenta emavikini la-8 lagcine", weekOf: "Liviki la", wordsLbl: "emagama", lessonsLbl: "tifundvo",
    subjects: "Ngesifundvo", repeated: "Emagama emakilasi labuyele kuwo", repeatedSub: "akhonjiswe emalangeni langetulu kwalinye", daysLbl: "emalanga",
    recent: "Tifundvo letisandza kwentiwa", quizLbl: "imibuto nemidlalo", noRepeat: "Kute ligama lelikhonjiswe emalangeni langetulu kwalinye okwamanje.",
  },
  ve: {
    loading: "Ri khou ḓisa nomboro dza tshikolo tshaṋu...",
    empty: "A hu athu u vha na ngudo yo sumbedzwaho. Musi vhadededzi vha tshi sumbedza maipfi u bva kha zwigwada zwa maipfi, ni ḓo vhona fhano zwe zwa funzwa, kha zwifhinga zwifhio na lini.",
    dictionary: "Maipfi kha bugu ya maipfi ya tshikolo", lessons: "Ngudo dzi re na Gadit", thisWeek: "Ngudo vhege iyi", activities: "Mbudziso na mitambo ya kilasi",
    weeks: "Mishumo kha vhege dza 8 dzo fhiraho", weekOf: "Vhege ya", wordsLbl: "maipfi", lessonsLbl: "ngudo",
    subjects: "Nga thero", repeated: "Maipfi e kilasi dza vhuyelela khao", repeatedSub: "o sumbedzwaho nga maḓuvha a fhiraho ḽithihi", daysLbl: "maḓuvha",
    recent: "Ngudo dza zwenezwino", quizLbl: "mbudziso na mitambo", noRepeat: "A hu athu u vha na ipfi ḽo sumbedzwaho nga maḓuvha a fhiraho ḽithihi.",
  },
  nr: {
    loading: "Kulayitha iinomboro zesikolo sakho...",
    empty: "Akukabikhona isifundo esitjengisiweko. Lokha abotitjhere nabatjengisa amezwi emaqoqweni wamezwi, uzakubona lapha bona kufundiswe ini, ngiziphi izifundo begodu nini.",
    dictionary: "Amezwi asesihlathululimezwini sesikolo", lessons: "Izifundo nge-Gadit", thisWeek: "Izifundo zeveke le", activities: "Iinkhwizi nemidlalo yekilasi",
    weeks: "Ukusebenza eemvekeni ezi-8 zokugcina", weekOf: "Iveke ka", wordsLbl: "amezwi", lessonsLbl: "izifundo",
    subjects: "Ngokwesifundo", repeated: "Amezwi amakilasi abuyela kiwo", repeatedSub: "atjengiswe emalangeni angaphezu kwelilodwa", daysLbl: "amalanga",
    recent: "Izifundo zakutjhanje", quizLbl: "iinkhwizi nemidlalo", noRepeat: "Akukabikhona ilizwi elitjengiswe emalangeni angaphezu kwelilodwa.",
  },
  vi: {
    loading: "Đang tải dữ liệu của trường...",
    empty: "Chưa có bài học nào được trình chiếu. Khi giáo viên trình chiếu từ trong các bộ từ vựng, bạn sẽ thấy ở đây những gì đã được dạy, ở môn nào và khi nào.",
    dictionary: "Từ trong từ điển của trường", lessons: "Bài học với Gadit", thisWeek: "Bài học tuần này", activities: "Câu đố và trò chơi trên lớp",
    weeks: "Hoạt động trong 8 tuần qua", weekOf: "Tuần từ", wordsLbl: "từ", lessonsLbl: "bài học",
    subjects: "Theo môn học", repeated: "Những từ các lớp quay lại học", repeatedSub: "được trình chiếu vào nhiều hơn một ngày", daysLbl: "ngày",
    recent: "Bài học gần đây", quizLbl: "câu đố và trò chơi", noRepeat: "Chưa có từ nào được trình chiếu vào nhiều hơn một ngày.",
  },
  fil: {
    loading: "Nilo-load ang datos ng inyong paaralan...",
    empty: "Wala pang aralin na na-project. Kapag nag-project ang mga guro ng mga salita mula sa mga set ng salita, makikita ninyo rito kung ano ang itinuro, sa aling mga asignatura at kailan.",
    dictionary: "Mga salita sa diksyunaryo ng paaralan", lessons: "Mga aralin gamit ang Gadit", thisWeek: "Mga aralin ngayong linggo", activities: "Mga quiz at laro ng klase",
    weeks: "Aktibidad sa nakaraang 8 linggo", weekOf: "Linggo ng", wordsLbl: "salita", lessonsLbl: "aralin",
    subjects: "Ayon sa asignatura", repeated: "Mga salitang binalikan ng mga klase", repeatedSub: "na-project sa higit sa isang araw", daysLbl: "araw",
    recent: "Mga kamakailang aralin", quizLbl: "quiz at laro", noRepeat: "Wala pang salitang na-project sa higit sa isang araw.",
  },
  af: {
    loading: "Laai tans jou skool se syfers...",
    empty: "Nog geen les is geprojekteer nie. Wanneer onderwysers woorde uit die woordstelle projekteer, sien jy hier wat geleer is, in watter vakke en wanneer.",
    dictionary: "Woorde in die skoolwoordeboek", lessons: "Lesse met Gadit", thisWeek: "Lesse hierdie week", activities: "Klasvasvrae en speletjies",
    weeks: "Aktiwiteit oor die afgelope 8 weke", weekOf: "Week van", wordsLbl: "woorde", lessonsLbl: "lesse",
    subjects: "Volgens vak", repeated: "Woorde waarna klasse teruggekeer het", repeatedSub: "op meer as een dag geprojekteer", daysLbl: "dae",
    recent: "Onlangse lesse", quizLbl: "vasvrae en speletjies", noRepeat: "Nog geen woord is op meer as een dag geprojekteer nie.",
  },
  sw: {
    loading: "Inapakia takwimu za shule yako...",
    empty: "Bado hakuna somo lililoonyeshwa kwenye skrini. Walimu wakionyesha maneno kutoka seti za maneno, hapa utaona kilichofundishwa, katika masomo gani na lini.",
    dictionary: "Maneno katika kamusi ya shule", lessons: "Masomo na Gadit", thisWeek: "Masomo wiki hii", activities: "Majaribio na michezo ya darasa",
    weeks: "Shughuli katika wiki 8 zilizopita", weekOf: "Wiki ya", wordsLbl: "maneno", lessonsLbl: "masomo",
    subjects: "Kwa somo", repeated: "Maneno ambayo madarasa yalirudia", repeatedSub: "yalionyeshwa zaidi ya siku moja", daysLbl: "siku",
    recent: "Masomo ya hivi karibuni", quizLbl: "majaribio na michezo", noRepeat: "Bado hakuna neno lililoonyeshwa zaidi ya siku moja.",
  },
  "zh-CN": {
    loading: "正在加载学校数据...",
    empty: "还没有投屏过任何课。老师从词汇组投屏单词后，您可以在这里看到教了什么、在哪些科目、在什么时候。",
    dictionary: "学校词典中的单词", lessons: "使用 Gadit 的课", thisWeek: "本周的课", activities: "课堂测验和游戏",
    weeks: "最近 8 周的活动", weekOf: "周", wordsLbl: "个单词", lessonsLbl: "节课",
    subjects: "按科目", repeated: "班级反复学习的单词", repeatedSub: "在不止一天投屏过", daysLbl: "天",
    recent: "最近的课", quizLbl: "次测验和游戏", noRepeat: "还没有在不止一天投屏过的单词。",
  },
  "zh-TW": {
    loading: "正在載入學校資料...",
    empty: "還沒有投影過任何課。老師從詞彙組投影單字後，您可以在這裡看到教了什麼、在哪些科目、在什麼時候。",
    dictionary: "學校字典中的單字", lessons: "使用 Gadit 的課", thisWeek: "本週的課", activities: "課堂測驗和遊戲",
    weeks: "最近 8 週的活動", weekOf: "週", wordsLbl: "個單字", lessonsLbl: "堂課",
    subjects: "依科目", repeated: "班級反覆學習的單字", repeatedSub: "在不只一天投影過", daysLbl: "天",
    recent: "最近的課", quizLbl: "次測驗和遊戲", noRepeat: "還沒有在不只一天投影過的單字。",
  },
  ko: {
    loading: "학교 데이터를 불러오는 중...",
    empty: "아직 화면에 띄운 수업이 없습니다. 교사가 단어 세트의 단어를 화면에 띄우면, 무엇을 어떤 과목에서 언제 배웠는지 여기에서 볼 수 있습니다.",
    dictionary: "학교 사전의 단어", lessons: "Gadit 수업", thisWeek: "이번 주 수업", activities: "학급 퀴즈와 게임",
    weeks: "최근 8주 활동", weekOf: "주 시작일", wordsLbl: "단어", lessonsLbl: "수업",
    subjects: "과목별", repeated: "학급이 다시 돌아본 단어", repeatedSub: "이틀 이상 화면에 띄운 단어", daysLbl: "일",
    recent: "최근 수업", quizLbl: "퀴즈와 게임", noRepeat: "아직 이틀 이상 화면에 띄운 단어가 없습니다.",
  },
  th: {
    loading: "กำลังโหลดข้อมูลของโรงเรียน...",
    empty: "ยังไม่มีบทเรียนที่ฉายขึ้นจอ เมื่อครูฉายคำจากชุดคำศัพท์ คุณจะเห็นที่นี่ว่าเรียนอะไร ในวิชาใด และเมื่อไร",
    dictionary: "คำในพจนานุกรมของโรงเรียน", lessons: "บทเรียนกับ Gadit", thisWeek: "บทเรียนสัปดาห์นี้", activities: "แบบทดสอบและเกมในห้องเรียน",
    weeks: "กิจกรรมใน 8 สัปดาห์ที่ผ่านมา", weekOf: "สัปดาห์", wordsLbl: "คำ", lessonsLbl: "บทเรียน",
    subjects: "ตามวิชา", repeated: "คำที่ห้องเรียนกลับมาทบทวน", repeatedSub: "ฉายมากกว่าหนึ่งวัน", daysLbl: "วัน",
    recent: "บทเรียนล่าสุด", quizLbl: "แบบทดสอบและเกม", noRepeat: "ยังไม่มีคำที่ฉายมากกว่าหนึ่งวัน",
  },
  bn: {
    loading: "আপনার স্কুলের তথ্য লোড হচ্ছে...",
    empty: "এখনো কোনো পাঠ প্রজেক্ট করা হয়নি। শিক্ষকরা শব্দের সেট থেকে শব্দ প্রজেক্ট করলে, এখানে দেখবেন কী শেখানো হয়েছে, কোন বিষয়ে এবং কখন।",
    dictionary: "স্কুলের অভিধানে শব্দ", lessons: "Gadit দিয়ে পাঠ", thisWeek: "এই সপ্তাহের পাঠ", activities: "ক্লাসের কুইজ ও খেলা",
    weeks: "গত 8 সপ্তাহের কার্যকলাপ", weekOf: "সপ্তাহ", wordsLbl: "শব্দ", lessonsLbl: "পাঠ",
    subjects: "বিষয় অনুযায়ী", repeated: "যে শব্দগুলোতে ক্লাসগুলো ফিরে এসেছে", repeatedSub: "একাধিক দিনে প্রজেক্ট করা হয়েছে", daysLbl: "দিন",
    recent: "সাম্প্রতিক পাঠ", quizLbl: "কুইজ ও খেলা", noRepeat: "এখনো কোনো শব্দ একাধিক দিনে প্রজেক্ট করা হয়নি।",
  },
  da: {
    loading: "Indlæser skolens tal...",
    empty: "Der er endnu ikke vist nogen lektion på skærmen. Når lærerne viser ord fra ordsættene, kan du her se, hvad der er undervist i, i hvilke fag og hvornår.",
    dictionary: "Ord i skolens ordbog", lessons: "Lektioner med Gadit", thisWeek: "Lektioner i denne uge", activities: "Quizzer og spil i klassen",
    weeks: "Aktivitet de seneste 8 uger", weekOf: "Uge fra", wordsLbl: "ord", lessonsLbl: "lektioner",
    subjects: "Efter fag", repeated: "Ord, klasserne vendte tilbage til", repeatedSub: "vist på mere end én dag", daysLbl: "dage",
    recent: "Seneste lektioner", quizLbl: "quizzer og spil", noRepeat: "Endnu er intet ord vist på mere end én dag.",
  },
  hu: {
    loading: "Az iskola adatainak betöltése...",
    empty: "Még nem vetítettek ki órát. Amikor a tanárok szavakat vetítenek ki a szócsomagokból, itt láthatja, mit tanultak, milyen tantárgyakban és mikor.",
    dictionary: "Szavak az iskolai szótárban", lessons: "Órák Gadit használatával", thisWeek: "Órák ezen a héten", activities: "Osztálykvízek és játékok",
    weeks: "Aktivitás az elmúlt 8 hétben", weekOf: "Hét kezdete", wordsLbl: "szó", lessonsLbl: "óra",
    subjects: "Tantárgyanként", repeated: "Szavak, amelyekhez az osztályok visszatértek", repeatedSub: "több mint egy napon kivetítve", daysLbl: "nap",
    recent: "Legutóbbi órák", quizLbl: "kvíz és játék", noRepeat: "Még egyetlen szót sem vetítettek ki több mint egy napon.",
  },
};

const fmtDay = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

export function TeacherActivity({ lang }: { lang: string }) {
  const { user } = useAuth();
  const c = COPY[lang] ?? COPY.en;
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/schools/teacher-activity", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        if (!r.ok) throw new Error(String(r.status));
        const j = (await r.json()) as Data;
        if (!cancelled) setData(j);
      } catch {
        if (!cancelled) setErr(true);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (err) return null;
  if (!data) return <p className="ta-muted"><WaitText text={c.loading} live /></p>;
  const t = data.totals;
  const maxW = Math.max(1, ...data.weeks.map((w) => w.words));

  return (
    <section className="ta">
      <style>{CSS}</style>
      <div className="ta-stats">
        {[[c.dictionary, t.dictionary], [c.lessons, t.lessons], [c.thisWeek, t.lessonsThisWeek], [c.activities, t.activities]].map(([l, v]) => (
          <div key={String(l)} className="ta-stat"><div className="ta-num">{Number(v).toLocaleString()}</div><div className="ta-lbl">{l}</div></div>
        ))}
      </div>

      {t.lessons === 0 ? (
        <div className="ta-empty">{c.empty}</div>
      ) : (
        <>
          <div className="ta-card">
            <h3 className="ta-h">{c.weeks}</h3>
            <div className="ta-bars" role="img" aria-label={c.weeks}>
              {data.weeks.map((w) => (
                <div key={w.week} className="ta-bar-col" title={`${c.weekOf} ${fmtDay(w.week)}: ${w.words} ${c.wordsLbl}, ${w.lessons} ${c.lessonsLbl}`}>
                  <span className="ta-bar-val">{w.words || ""}</span>
                  <div className="ta-bar" style={{ height: `${Math.round((w.words / maxW) * 100)}%` }} />
                  <span className="ta-bar-day">{fmtDay(w.week)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ta-grid">
            <div className="ta-card">
              <h3 className="ta-h">{c.subjects}</h3>
              <ul className="ta-list">
                {data.subjects.map((s) => (
                  <li key={s.subject}><span>{s.subject}</span><span className="ta-muted">{s.lessons} {c.lessonsLbl} · {s.words} {c.wordsLbl}</span></li>
                ))}
              </ul>
            </div>
            <div className="ta-card">
              <h3 className="ta-h">{c.repeated}</h3>
              <p className="ta-muted ta-sub">{c.repeatedSub}</p>
              {data.repeated.length === 0 ? (
                <p className="ta-muted">{c.noRepeat}</p>
              ) : (
                <div className="ta-chips">
                  {data.repeated.map((r) => <span key={r.word} className="ta-chip">{r.word} <b>{r.days}</b></span>)}
                </div>
              )}
            </div>
          </div>

          <div className="ta-card">
            <h3 className="ta-h">{c.recent}</h3>
            <ul className="ta-list">
              {data.recent.map((l) => (
                <li key={l.day + l.title}>
                  <span><b>{fmtDay(l.day)}</b> · {l.subject}{l.title ? ` · ${l.title}` : ""}{l.grade ? ` · ${l.grade}` : ""}</span>
                  <span className="ta-muted">{l.words} {c.wordsLbl}{l.quizzes ? ` · ${l.quizzes} ${c.quizLbl}` : ""}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}

const CSS = `
.ta { display: grid; gap: 16px; }
.ta-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.ta-stat, .ta-card { background: var(--surface, #fff); border: 1px solid var(--hairline, rgba(15,23,42,0.1)); border-radius: 14px; padding: 16px 18px; min-width: 0; }
.ta-num { font-size: 28px; font-weight: 800; color: var(--ink, #111827); font-variant-numeric: tabular-nums; }
.ta-lbl { font-size: 13px; color: var(--ink-muted, #6B7280); margin-top: 2px; }
.ta-empty { background: rgba(14,165,165,0.08); border: 1px solid rgba(14,165,165,0.25); border-radius: 14px; padding: 16px 18px; color: #0E7490; font-size: 14.5px; line-height: 1.6; }
.ta-h { margin: 0 0 12px; font-size: 16px; font-weight: 700; color: var(--ink, #111827); }
.ta-sub { margin: -8px 0 12px; font-size: 12.5px; }
.ta-muted { color: var(--ink-muted, #6B7280); font-size: 13px; }
.ta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.ta-bars { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 8px; align-items: end; height: 170px; }
.ta-bar-col { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; gap: 4px; min-width: 0; }
.ta-bar { width: 70%; min-height: 3px; background: #0F6F6C; border-radius: 6px 6px 2px 2px; }
.ta-bar-val { font-size: 11.5px; font-weight: 700; color: var(--ink, #111827); font-variant-numeric: tabular-nums; }
.ta-bar-day { font-size: 11px; color: var(--ink-muted, #6B7280); font-variant-numeric: tabular-nums; }
.ta-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.ta-list li { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; font-size: 14px; color: var(--ink, #111827); border-bottom: 1px solid var(--hairline, rgba(15,23,42,0.06)); padding-bottom: 8px; }
.ta-list li:last-child { border-bottom: 0; padding-bottom: 0; }
.ta-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.ta-chip { font-size: 13px; padding: 4px 10px; border-radius: 999px; background: rgba(14,165,165,0.10); color: #0F6F6C; }
.ta-chip b { margin-inline-start: 4px; }
`;

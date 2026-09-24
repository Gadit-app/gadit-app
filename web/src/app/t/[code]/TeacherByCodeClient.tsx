"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import {
  computeClassroomInsights,
  classroomLangLabel,
  type RawSearch,
} from "@/lib/classroom-insights";

/**
 * Read-only, no-login teacher view for one classroom, reached by the
 * class code. Reuses the shared computeClassroomInsights helper so it
 * shows exactly what the principal-authed /classroom/[id] view shows for
 * that class: language map, stuck words, total, private support signal.
 */

type ApiResponse = {
  name?: string;
  searchCount?: number;
  searches?: Array<{ word: string; language?: string; studentName?: string }>;
};

type Copy = {
  title: string;
  loading: string;
  notFound: string;
  basedOn: (n: number) => string;
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
  empty: string;
};

const COPY: Record<string, Copy> = {
  he: {
    title: "תובנות הכיתה",
    loading: "טוען...",
    notFound: "כיתה לא נמצאה. כדאי לבדוק את הקוד.",
    basedOn: (n) => `מבוסס על ${n} החיפושים האחרונים`,
    totalLabel: "סה\"כ חיפושים",
    totalAllTime: "מתחילת הדרך",
    langMapTitle: "השפות שהכיתה לומדת בהן",
    langMapSub: "כל חיפוש נענה בשפה של התלמיד. זו מפת השפות האמיתית של הכיתה.",
    notEnough: "עדיין אין מספיק נתונים.",
    stuckTitle: "מילים שהכיתה נתקעת עליהן",
    stuckSub: "כדאי ללמד אותן מראש לפני השיעור הבא.",
    supportTitle: "אולי צריכים תשומת לב נוספת",
    supportSub: "פרטי. ריבוי חיפושים יכול להעיד על קושי או פשוט על סקרנות.",
    supportRosterHint: "כשמוסיפים שמות תלמידים לרשימת הכיתה, יופיע כאן איתות תמיכה פרטי.",
    lookupsLabel: "חיפושים",
    empty: "עדיין לא חיפשו מילים בכיתה הזאת.",
  },
  en: {
    title: "Class insights",
    loading: "Loading…",
    notFound: "Classroom not found. Please check the code.",
    basedOn: (n) => `Based on the last ${n} lookups`,
    totalLabel: "Total lookups",
    totalAllTime: "all time",
    langMapTitle: "Languages your class learns in",
    langMapSub: "Every lookup is answered in the student's own language. This is your class's real language map.",
    notEnough: "Not enough data yet.",
    stuckTitle: "Words your class gets stuck on",
    stuckSub: "Worth pre-teaching before the next lesson.",
    supportTitle: "May need extra attention",
    supportSub: "Private. Lots of lookups can mean a struggle or simply curiosity.",
    supportRosterHint: "Add student names to the class roster to see a private support signal here.",
    lookupsLabel: "lookups",
    empty: "This class hasn't looked anything up yet.",
  },
  zu: {
    title: "Imininingwane yekilasi",
    loading: "Iyalayisha…",
    notFound: "Igumbi lokufunda alitholakalanga. Sicela uhlole ikhodi.",
    basedOn: (n) => `Kusekelwe ekubhekeni kwakamuva okungu-${n}`,
    totalLabel: "Isamba sokubheka",
    totalAllTime: "sonke isikhathi",
    langMapTitle: "Izilimi ikilasi lakho elifunda ngazo",
    langMapSub: "Konke ukubheka kuphendulwa ngolimi lomfundi uqobo. Le yimephu yezilimi yangempela yekilasi lakho.",
    notEnough: "Ayikho idatha eyanele okwamanje.",
    stuckTitle: "Amagama ikilasi lakho elibhajwa kuwo",
    stuckSub: "Kufanele uwafundise kuqala ngaphambi kwesifundo esilandelayo.",
    supportTitle: "Kungenzeka badinga ukunakwa okwengeziwe",
    supportSub: "Kuyimfihlo. Ukubheka okuningi kungasho ubunzima noma nje ukufuna ukwazi.",
    supportRosterHint: "Faka amagama abafundi ohlwini lwekilasi ukuze ubone isignali yosekelo eyimfihlo lapha.",
    lookupsLabel: "ukubheka",
    empty: "Leli kilasi alikabheki lutho okwamanje.",
  },
  el: {
    title: "Στατιστικά τάξης",
    loading: "Φόρτωση…",
    notFound: "Η τάξη δεν βρέθηκε. Έλεγξε τον κωδικό.",
    basedOn: (n) => `Βασίζεται στις τελευταίες ${n} αναζητήσεις`,
    totalLabel: "Σύνολο αναζητήσεων",
    totalAllTime: "από την αρχή",
    langMapTitle: "Γλώσσες στις οποίες μαθαίνει η τάξη σου",
    langMapSub: "Κάθε αναζήτηση απαντάται στη γλώσσα του μαθητή. Αυτός είναι ο πραγματικός γλωσσικός χάρτης της τάξης σου.",
    notEnough: "Δεν υπάρχουν αρκετά δεδομένα ακόμη.",
    stuckTitle: "Λέξεις που δυσκολεύουν την τάξη σου",
    stuckSub: "Αξίζει να τις διδάξεις πριν το επόμενο μάθημα.",
    supportTitle: "Ίσως χρειάζονται επιπλέον προσοχή",
    supportSub: "Ιδιωτικό. Πολλές αναζητήσεις μπορεί να σημαίνουν δυσκολία ή απλώς περιέργεια.",
    supportRosterHint: "Πρόσθεσε ονόματα μαθητών στον κατάλογο της τάξης για να δεις εδώ ένα ιδιωτικό σήμα υποστήριξης.",
    lookupsLabel: "αναζητήσεις",
    empty: "Αυτή η τάξη δεν έχει αναζητήσει τίποτα ακόμη.",
  },
  ar: {
    title: "رؤى الصف",
    loading: "جارٍ التحميل…",
    notFound: "لم يتم العثور على الصف. تحقق من الرمز.",
    basedOn: (n) => `استنادًا إلى آخر ${n} عملية بحث`,
    totalLabel: "إجمالي عمليات البحث",
    totalAllTime: "منذ البداية",
    langMapTitle: "اللغات التي يتعلم بها صفك",
    langMapSub: "كل بحث يُجاب عليه بلغة الطالب. هذه خريطة اللغات الحقيقية لصفك.",
    notEnough: "لا توجد بيانات كافية بعد.",
    stuckTitle: "كلمات يتعثر فيها الصف",
    stuckSub: "يُستحسن تعليمها مسبقًا قبل الدرس القادم.",
    supportTitle: "قد يحتاجون إلى اهتمام إضافي",
    supportSub: "خاص. كثرة البحث قد تعني صعوبة أو مجرد فضول.",
    supportRosterHint: "أضف أسماء الطلاب إلى قائمة الصف لعرض إشارة دعم خاصة هنا.",
    lookupsLabel: "عمليات بحث",
    empty: "لم يبحث هذا الصف عن أي شيء بعد.",
  },
  ru: {
    title: "Аналитика класса",
    loading: "Загрузка…",
    notFound: "Класс не найден. Проверьте код.",
    basedOn: (n) => `На основе последних ${n} запросов`,
    totalLabel: "Всего запросов",
    totalAllTime: "за всё время",
    langMapTitle: "Языки, на которых учится класс",
    langMapSub: "Каждый запрос отвечается на языке ученика. Это настоящая языковая карта класса.",
    notEnough: "Пока недостаточно данных.",
    stuckTitle: "Слова, на которых класс застревает",
    stuckSub: "Стоит разобрать их заранее перед следующим уроком.",
    supportTitle: "Возможно, нужно больше внимания",
    supportSub: "Приватно. Много запросов может означать трудность или просто любопытство.",
    supportRosterHint: "Добавьте имена учеников в список класса, чтобы увидеть здесь приватный сигнал поддержки.",
    lookupsLabel: "запросов",
    empty: "Этот класс пока ничего не искал.",
  },
  es: {
    title: "Datos de la clase",
    loading: "Cargando…",
    notFound: "No encontramos el aula. Revisa el código.",
    basedOn: (n) => `Según las últimas ${n} búsquedas`,
    totalLabel: "Búsquedas totales",
    totalAllTime: "desde el inicio",
    langMapTitle: "Idiomas en los que aprende tu clase",
    langMapSub: "Cada búsqueda se responde en el idioma del propio alumno. Este es el mapa real de idiomas de tu clase.",
    notEnough: "Aún no hay suficientes datos.",
    stuckTitle: "Palabras en las que se atasca tu clase",
    stuckSub: "Conviene enseñarlas antes de la próxima clase.",
    supportTitle: "Podrían necesitar más atención",
    supportSub: "Privado. Muchas búsquedas pueden indicar dificultad o simple curiosidad.",
    supportRosterHint: "Añade los nombres de los alumnos a la lista de clase para ver aquí una señal de apoyo privada.",
    lookupsLabel: "búsquedas",
    empty: "Esta clase todavía no ha buscado nada.",
  },
  pt: {
    title: "Dados da turma",
    loading: "Carregando…",
    notFound: "Turma não encontrada. Confira o código.",
    basedOn: (n) => `Com base nas últimas ${n} pesquisas`,
    totalLabel: "Total de pesquisas",
    totalAllTime: "desde o início",
    langMapTitle: "Idiomas em que sua turma aprende",
    langMapSub: "Cada pesquisa é respondida no idioma do próprio aluno. Este é o mapa real de idiomas da sua turma.",
    notEnough: "Ainda não há dados suficientes.",
    stuckTitle: "Palavras em que sua turma trava",
    stuckSub: "Vale a pena ensiná-las antes da próxima aula.",
    supportTitle: "Podem precisar de mais atenção",
    supportSub: "Privado. Muitas pesquisas podem indicar dificuldade ou simples curiosidade.",
    supportRosterHint: "Adicione os nomes dos alunos à lista da turma para ver aqui um sinal de apoio privado.",
    lookupsLabel: "pesquisas",
    empty: "Esta turma ainda não pesquisou nada.",
  },
  fr: {
    title: "Aperçu de la classe",
    loading: "Chargement…",
    notFound: "Classe introuvable. Vérifiez le code.",
    basedOn: (n) => `D'après les ${n} dernières recherches`,
    totalLabel: "Recherches totales",
    totalAllTime: "depuis le début",
    langMapTitle: "Les langues dans lesquelles votre classe apprend",
    langMapSub: "Chaque recherche reçoit une réponse dans la langue de l'élève. Voici la vraie carte des langues de votre classe.",
    notEnough: "Pas encore assez de données.",
    stuckTitle: "Les mots qui bloquent votre classe",
    stuckSub: "À enseigner en amont avant le prochain cours.",
    supportTitle: "Pourraient avoir besoin d'une attention particulière",
    supportSub: "Privé. Beaucoup de recherches peuvent signaler une difficulté ou simplement de la curiosité.",
    supportRosterHint: "Ajoutez les noms des élèves à la liste de classe pour voir ici un signal de soutien privé.",
    lookupsLabel: "recherches",
    empty: "Cette classe n'a encore rien recherché.",
  },
  de: {
    title: "Klassenauswertung",
    loading: "Wird geladen…",
    notFound: "Klasse nicht gefunden. Bitte prüfen Sie den Code.",
    basedOn: (n) => `Basierend auf den letzten ${n} Suchen`,
    totalLabel: "Suchen insgesamt",
    totalAllTime: "seit Beginn",
    langMapTitle: "Sprachen, in denen Ihre Klasse lernt",
    langMapSub: "Jede Suche wird in der eigenen Sprache des Kindes beantwortet. Das ist die echte Sprachkarte Ihrer Klasse.",
    notEnough: "Noch nicht genug Daten.",
    stuckTitle: "Wörter, an denen Ihre Klasse hängen bleibt",
    stuckSub: "Lohnt sich, sie vor der nächsten Stunde einzuführen.",
    supportTitle: "Brauchen vielleicht mehr Aufmerksamkeit",
    supportSub: "Privat. Viele Suchen können auf Schwierigkeiten oder einfach Neugier hindeuten.",
    supportRosterHint: "Fügen Sie der Klassenliste die Namen der Kinder hinzu, um hier ein privates Unterstützungssignal zu sehen.",
    lookupsLabel: "Suchen",
    empty: "Diese Klasse hat noch nichts nachgeschlagen.",
  },
  cs: {
    title: "Přehled třídy",
    loading: "Načítání…",
    notFound: "Třída nebyla nalezena. Zkontrolujte prosím kód.",
    basedOn: (n) => `Podle posledních ${n} vyhledávání`,
    totalLabel: "Celkem vyhledávání",
    totalAllTime: "od začátku",
    langMapTitle: "Jazyky, ve kterých se vaše třída učí",
    langMapSub: "Každé vyhledávání je zodpovězeno v jazyce žáka. Toto je skutečná jazyková mapa vaší třídy.",
    notEnough: "Zatím nedostatek dat.",
    stuckTitle: "Slova, u kterých se třída zasekává",
    stuckSub: "Vyplatí se je probrat předem, před další hodinou.",
    supportTitle: "Možná potřebují více pozornosti",
    supportSub: "Soukromé. Hodně vyhledávání může znamenat potíže nebo prostě zvědavost.",
    supportRosterHint: "Přidejte jména žáků do seznamu třídy a uvidíte zde soukromý signál podpory.",
    lookupsLabel: "vyhledávání",
    empty: "Tato třída zatím nic nevyhledala.",
  },
  sk: {
    title: "Prehľad triedy",
    loading: "Načítava sa…",
    notFound: "Trieda sa nenašla. Skontrolujte kód.",
    basedOn: (n) => `Podľa posledných ${n} vyhľadávaní`,
    totalLabel: "Spolu vyhľadávaní",
    totalAllTime: "od začiatku",
    langMapTitle: "Jazyky, v ktorých sa vaša trieda učí",
    langMapSub: "Každé vyhľadávanie je zodpovedané v jazyku žiaka. Toto je skutočná jazyková mapa vašej triedy.",
    notEnough: "Zatiaľ nedostatok údajov.",
    stuckTitle: "Slová, pri ktorých sa trieda zasekáva",
    stuckSub: "Oplatí sa ich prebrať vopred, pred ďalšou hodinou.",
    supportTitle: "Možno potrebujú viac pozornosti",
    supportSub: "Súkromné. Veľa vyhľadávaní môže znamenať ťažkosti alebo jednoducho zvedavosť.",
    supportRosterHint: "Pridajte mená žiakov do zoznamu triedy a uvidíte tu súkromný signál podpory.",
    lookupsLabel: "vyhľadávaní",
    empty: "Táto trieda zatiaľ nič nevyhľadala.",
  },
  it: {
    title: "Dati della classe",
    loading: "Caricamento…",
    notFound: "Classe non trovata. Controlla il codice.",
    basedOn: (n) => `In base alle ultime ${n} ricerche`,
    totalLabel: "Ricerche totali",
    totalAllTime: "dall'inizio",
    langMapTitle: "Le lingue in cui impara la tua classe",
    langMapSub: "Ogni ricerca riceve risposta nella lingua dello studente. Questa è la vera mappa linguistica della tua classe.",
    notEnough: "Dati ancora insufficienti.",
    stuckTitle: "Parole su cui la tua classe si blocca",
    stuckSub: "Vale la pena introdurle prima della prossima lezione.",
    supportTitle: "Potrebbero aver bisogno di più attenzione",
    supportSub: "Privato. Molte ricerche possono indicare una difficoltà o semplice curiosità.",
    supportRosterHint: "Aggiungi i nomi degli studenti all'elenco della classe per vedere qui un segnale di supporto privato.",
    lookupsLabel: "ricerche",
    empty: "Questa classe non ha ancora cercato nulla.",
  },
  ja: {
    title: "クラスの分析",
    loading: "読み込み中…",
    notFound: "クラスが見つかりません。コードをご確認ください。",
    basedOn: (n) => `直近 ${n} 件の検索に基づく`,
    totalLabel: "検索数の合計",
    totalAllTime: "これまでの累計",
    langMapTitle: "クラスで使われている学習言語",
    langMapSub: "どの検索も生徒自身の言語で答えます。これがクラスの実際の言語マップです。",
    notEnough: "まだ十分なデータがありません。",
    stuckTitle: "クラスがつまずいている単語",
    stuckSub: "次の授業の前に予習しておくのがおすすめです。",
    supportTitle: "もう少しサポートが必要かもしれない生徒",
    supportSub: "非公開。検索が多いのは、つまずきのサインのことも、単なる好奇心のこともあります。",
    supportRosterHint: "クラス名簿に生徒の名前を追加すると、ここに非公開のサポートサインが表示されます。",
    lookupsLabel: "件の検索",
    empty: "このクラスはまだ何も調べていません。",
  },
  hi: {
    title: "कक्षा की जानकारी",
    loading: "लोड हो रहा है…",
    notFound: "कक्षा नहीं मिली। कृपया कोड जाँचें।",
    basedOn: (n) => `पिछली ${n} खोजों पर आधारित`,
    totalLabel: "कुल खोजें",
    totalAllTime: "शुरुआत से",
    langMapTitle: "आपकी कक्षा जिन भाषाओं में सीखती है",
    langMapSub: "हर खोज का जवाब छात्र की अपनी भाषा में दिया जाता है। यह आपकी कक्षा का असली भाषा-नक्शा है।",
    notEnough: "अभी पर्याप्त डेटा नहीं है।",
    stuckTitle: "जिन शब्दों पर आपकी कक्षा अटकती है",
    stuckSub: "अगले पाठ से पहले इन्हें पढ़ा देना अच्छा रहेगा।",
    supportTitle: "शायद ज़्यादा ध्यान की ज़रूरत है",
    supportSub: "निजी। ज़्यादा खोजें कठिनाई या बस जिज्ञासा दिखा सकती हैं।",
    supportRosterHint: "यहाँ निजी सहायता संकेत देखने के लिए कक्षा की सूची में छात्रों के नाम जोड़ें।",
    lookupsLabel: "खोजें",
    empty: "इस कक्षा ने अभी तक कुछ नहीं खोजा है।",
  },
  am: {
    title: "የክፍል ግንዛቤዎች",
    loading: "እየተጫነ ነው…",
    notFound: "ክፍሉ አልተገኘም። እባክዎ ኮዱን ያረጋግጡ።",
    basedOn: (n) => `በመጨረሻዎቹ ${n} ፍለጋዎች ላይ የተመሠረተ`,
    totalLabel: "ጠቅላላ ፍለጋዎች",
    totalAllTime: "ከመጀመሪያው ጀምሮ",
    langMapTitle: "ክፍልዎ የሚማርባቸው ቋንቋዎች",
    langMapSub: "እያንዳንዱ ፍለጋ በተማሪው ቋንቋ ይመለሳል። ይህ የክፍልዎ እውነተኛ የቋንቋ ካርታ ነው።",
    notEnough: "እስካሁን በቂ መረጃ የለም።",
    stuckTitle: "ክፍልዎ የሚቸገርባቸው ቃላት",
    stuckSub: "ከሚቀጥለው ትምህርት በፊት አስቀድሞ ማስተማር ይጠቅማል።",
    supportTitle: "ተጨማሪ ትኩረት ሊያስፈልጋቸው ይችላል",
    supportSub: "የግል። ብዙ ፍለጋ ችግርን ወይም ጉጉትን ብቻ ሊያሳይ ይችላል።",
    supportRosterHint: "እዚህ የግል የድጋፍ ምልክት ለማየት የተማሪዎችን ስም በክፍል ዝርዝር ውስጥ ይጨምሩ።",
    lookupsLabel: "ፍለጋዎች",
    empty: "ይህ ክፍል እስካሁን ምንም አልፈለገም።",
  },
  uk: {
    title: "Аналітика класу",
    loading: "Завантаження…",
    notFound: "Клас не знайдено. Перевірте код.",
    basedOn: (n) => `За останніми ${n} запитами`,
    totalLabel: "Усього запитів",
    totalAllTime: "за весь час",
    langMapTitle: "Мови, якими навчається ваш клас",
    langMapSub: "Кожен запит отримує відповідь рідною мовою учня. Це справжня мовна карта вашого класу.",
    notEnough: "Поки недостатньо даних.",
    stuckTitle: "Слова, на яких застрягає клас",
    stuckSub: "Варто пояснити їх заздалегідь, перед наступним уроком.",
    supportTitle: "Можливо, потрібно більше уваги",
    supportSub: "Приватно. Багато запитів може означати труднощі або просто цікавість.",
    supportRosterHint: "Додайте імена учнів до списку класу, щоб бачити тут приватний сигнал підтримки.",
    lookupsLabel: "запитів",
    empty: "Цей клас поки нічого не шукав.",
  },
  tr: {
    title: "Sınıf analizi",
    loading: "Yükleniyor…",
    notFound: "Sınıf bulunamadı. Lütfen kodu kontrol edin.",
    basedOn: (n) => `Son ${n} aramaya göre`,
    totalLabel: "Toplam arama",
    totalAllTime: "başından beri",
    langMapTitle: "Sınıfınızın öğrendiği diller",
    langMapSub: "Her arama öğrencinin kendi dilinde yanıtlanır. Bu, sınıfınızın gerçek dil haritasıdır.",
    notEnough: "Henüz yeterli veri yok.",
    stuckTitle: "Sınıfınızın takıldığı kelimeler",
    stuckSub: "Bir sonraki dersten önce öğretmekte fayda var.",
    supportTitle: "Daha fazla ilgiye ihtiyaç duyabilir",
    supportSub: "Gizli. Çok sayıda arama zorlanmaya ya da sadece merağa işaret edebilir.",
    supportRosterHint: "Burada gizli bir destek sinyali görmek için sınıf listesine öğrenci adlarını ekleyin.",
    lookupsLabel: "arama",
    empty: "Bu sınıf henüz hiçbir şey aramadı.",
  },
  pl: {
    title: "Analiza klasy",
    loading: "Ładowanie…",
    notFound: "Nie znaleziono klasy. Sprawdź kod.",
    basedOn: (n) => `Na podstawie ostatnich ${n} wyszukiwań`,
    totalLabel: "Łącznie wyszukiwań",
    totalAllTime: "od początku",
    langMapTitle: "Języki, w których uczy się Twoja klasa",
    langMapSub: "Każde wyszukiwanie otrzymuje odpowiedź w języku ucznia. To prawdziwa mapa języków Twojej klasy.",
    notEnough: "Za mało danych.",
    stuckTitle: "Słowa, na których zatrzymuje się klasa",
    stuckSub: "Warto je omówić przed następną lekcją.",
    supportTitle: "Mogą potrzebować więcej uwagi",
    supportSub: "Prywatne. Dużo wyszukiwań może oznaczać trudność lub po prostu ciekawość.",
    supportRosterHint: "Dodaj imiona uczniów do listy klasy, aby zobaczyć tutaj prywatny sygnał wsparcia.",
    lookupsLabel: "wyszukiwań",
    empty: "Ta klasa jeszcze niczego nie szukała.",
  },
  fa: {
    title: "بینش‌های کلاس",
    loading: "در حال بارگذاری…",
    notFound: "کلاس پیدا نشد. لطفاً کد را بررسی کنید.",
    basedOn: (n) => `بر اساس ${n} جست‌وجوی اخیر`,
    totalLabel: "کل جست‌وجوها",
    totalAllTime: "از ابتدا",
    langMapTitle: "زبان‌هایی که کلاس شما با آن‌ها یاد می‌گیرد",
    langMapSub: "هر جست‌وجو به زبان خود دانش‌آموز پاسخ داده می‌شود. این نقشه واقعی زبان‌های کلاس شماست.",
    notEnough: "هنوز داده کافی وجود ندارد.",
    stuckTitle: "واژه‌هایی که کلاس شما در آن‌ها گیر می‌کند",
    stuckSub: "بهتر است پیش از درس بعدی آن‌ها را آموزش دهید.",
    supportTitle: "شاید به توجه بیشتری نیاز داشته باشند",
    supportSub: "خصوصی. جست‌وجوی زیاد می‌تواند نشانه دشواری یا فقط کنجکاوی باشد.",
    supportRosterHint: "نام دانش‌آموزان را به فهرست کلاس اضافه کنید تا اینجا یک نشانه حمایتی خصوصی ببینید.",
    lookupsLabel: "جست‌وجو",
    empty: "این کلاس هنوز چیزی جست‌وجو نکرده است.",
  },
  id: {
    title: "Wawasan kelas",
    loading: "Memuat…",
    notFound: "Kelas tidak ditemukan. Silakan periksa kodenya.",
    basedOn: (n) => `Berdasarkan ${n} pencarian terakhir`,
    totalLabel: "Total pencarian",
    totalAllTime: "sejak awal",
    langMapTitle: "Bahasa yang digunakan kelas Anda untuk belajar",
    langMapSub: "Setiap pencarian dijawab dalam bahasa murid itu sendiri. Inilah peta bahasa kelas Anda yang sebenarnya.",
    notEnough: "Data belum cukup.",
    stuckTitle: "Kata yang membuat kelas Anda tersendat",
    stuckSub: "Sebaiknya diajarkan lebih dulu sebelum pelajaran berikutnya.",
    supportTitle: "Mungkin perlu perhatian lebih",
    supportSub: "Pribadi. Banyak pencarian bisa berarti kesulitan atau sekadar rasa ingin tahu.",
    supportRosterHint: "Tambahkan nama murid ke daftar kelas untuk melihat sinyal dukungan pribadi di sini.",
    lookupsLabel: "pencarian",
    empty: "Kelas ini belum mencari apa pun.",
  },
  nl: {
    title: "Klasinzichten",
    loading: "Laden…",
    notFound: "Klas niet gevonden. Controleer de code.",
    basedOn: (n) => `Op basis van de laatste ${n} zoekopdrachten`,
    totalLabel: "Totaal aantal zoekopdrachten",
    totalAllTime: "sinds het begin",
    langMapTitle: "Talen waarin je klas leert",
    langMapSub: "Elke zoekopdracht wordt beantwoord in de eigen taal van de leerling. Dit is de echte taalkaart van je klas.",
    notEnough: "Nog niet genoeg gegevens.",
    stuckTitle: "Woorden waar je klas op vastloopt",
    stuckSub: "Handig om vooraf te behandelen, vóór de volgende les.",
    supportTitle: "Hebben misschien extra aandacht nodig",
    supportSub: "Privé. Veel zoekopdrachten kunnen wijzen op moeite of gewoon nieuwsgierigheid.",
    supportRosterHint: "Voeg namen van leerlingen toe aan de klassenlijst om hier een privé-ondersteuningssignaal te zien.",
    lookupsLabel: "zoekopdrachten",
    empty: "Deze klas heeft nog niets opgezocht.",
  },
  vi: {
    title: "Phân tích lớp học",
    loading: "Đang tải…",
    notFound: "Không tìm thấy lớp. Vui lòng kiểm tra lại mã.",
    basedOn: (n) => `Dựa trên ${n} lượt tra gần nhất`,
    totalLabel: "Tổng lượt tra",
    totalAllTime: "từ trước đến nay",
    langMapTitle: "Các ngôn ngữ lớp bạn dùng để học",
    langMapSub: "Mỗi lượt tra đều được trả lời bằng ngôn ngữ của chính học sinh. Đây là bản đồ ngôn ngữ thực sự của lớp bạn.",
    notEnough: "Chưa đủ dữ liệu.",
    stuckTitle: "Những từ lớp bạn hay vướng",
    stuckSub: "Nên dạy trước trước buổi học tới.",
    supportTitle: "Có thể cần quan tâm thêm",
    supportSub: "Riêng tư. Tra nhiều có thể là dấu hiệu gặp khó hoặc đơn giản là tò mò.",
    supportRosterHint: "Thêm tên học sinh vào danh sách lớp để xem tín hiệu hỗ trợ riêng tư tại đây.",
    lookupsLabel: "lượt tra",
    empty: "Lớp này chưa tra từ nào.",
  },
  fil: {
    title: "Mga insight ng klase",
    loading: "Naglo-load…",
    notFound: "Hindi nahanap ang klase. Pakisuri ang code.",
    basedOn: (n) => `Batay sa huling ${n} paghahanap`,
    totalLabel: "Kabuuang paghahanap",
    totalAllTime: "mula sa simula",
    langMapTitle: "Mga wikang ginagamit ng iyong klase sa pag-aaral",
    langMapSub: "Sinasagot ang bawat paghahanap sa sariling wika ng estudyante. Ito ang totoong mapa ng mga wika ng iyong klase.",
    notEnough: "Kulang pa ang datos.",
    stuckTitle: "Mga salitang pinagkakahirapan ng iyong klase",
    stuckSub: "Mainam na ituro muna bago ang susunod na aralin.",
    supportTitle: "Maaaring kailangan ng dagdag na atensyon",
    supportSub: "Pribado. Ang maraming paghahanap ay puwedeng mangahulugan ng hirap o simpleng pagkamausisa.",
    supportRosterHint: "Idagdag ang mga pangalan ng estudyante sa listahan ng klase para makita rito ang pribadong senyales ng suporta.",
    lookupsLabel: "paghahanap",
    empty: "Wala pang hinahanap ang klaseng ito.",
  },
  af: {
    title: "Klasinsigte",
    loading: "Laai tans…",
    notFound: "Klas nie gevind nie. Kontroleer asseblief die kode.",
    basedOn: (n) => `Gebaseer op die laaste ${n} soektogte`,
    totalLabel: "Totale soektogte",
    totalAllTime: "van die begin af",
    langMapTitle: "Tale waarin jou klas leer",
    langMapSub: "Elke soektog word in die leerder se eie taal beantwoord. Dit is jou klas se ware taalkaart.",
    notEnough: "Nog nie genoeg data nie.",
    stuckTitle: "Woorde waaroor jou klas struikel",
    stuckSub: "Die moeite werd om vooraf te leer voor die volgende les.",
    supportTitle: "Het dalk ekstra aandag nodig",
    supportSub: "Privaat. Baie soektogte kan op 'n sukkel of bloot nuuskierigheid dui.",
    supportRosterHint: "Voeg leerders se name by die klaslys om hier 'n privaat ondersteuningsein te sien.",
    lookupsLabel: "soektogte",
    empty: "Hierdie klas het nog niks opgesoek nie.",
  },
  sw: {
    title: "Maarifa ya darasa",
    loading: "Inapakia…",
    notFound: "Darasa halikupatikana. Tafadhali hakiki msimbo.",
    basedOn: (n) => `Kulingana na utafutaji ${n} wa mwisho`,
    totalLabel: "Jumla ya utafutaji",
    totalAllTime: "tangu mwanzo",
    langMapTitle: "Lugha ambazo darasa lako hujifunzia",
    langMapSub: "Kila utafutaji hujibiwa kwa lugha ya mwanafunzi mwenyewe. Hii ndiyo ramani halisi ya lugha ya darasa lako.",
    notEnough: "Bado hakuna data ya kutosha.",
    stuckTitle: "Maneno yanayolikwamisha darasa lako",
    stuckSub: "Inafaa kuyafundisha mapema kabla ya somo lijalo.",
    supportTitle: "Huenda wanahitaji uangalizi zaidi",
    supportSub: "Faragha. Utafutaji mwingi unaweza kuashiria ugumu au udadisi tu.",
    supportRosterHint: "Ongeza majina ya wanafunzi kwenye orodha ya darasa ili uone ishara ya msaada ya faragha hapa.",
    lookupsLabel: "utafutaji",
    empty: "Darasa hili bado halijatafuta chochote.",
  },
  "zh-CN": {
    title: "班级洞察",
    loading: "加载中…",
    notFound: "找不到该班级，请检查代码。",
    basedOn: (n) => `基于最近 ${n} 次查询`,
    totalLabel: "查询总数",
    totalAllTime: "累计",
    langMapTitle: "班级使用的学习语言",
    langMapSub: "每次查询都会用学生自己的语言作答。这是班级真实的语言地图。",
    notEnough: "数据还不够。",
    stuckTitle: "班级卡住的单词",
    stuckSub: "建议在下节课前提前讲解。",
    supportTitle: "可能需要更多关注",
    supportSub: "仅你可见。查询多可能意味着遇到困难，也可能只是出于好奇。",
    supportRosterHint: "在班级名单中添加学生姓名，即可在这里看到仅你可见的支持提示。",
    lookupsLabel: "次查询",
    empty: "这个班级还没有查过任何单词。",
  },
  "zh-TW": {
    title: "班級洞察",
    loading: "載入中…",
    notFound: "找不到這個班級，請檢查代碼。",
    basedOn: (n) => `依據最近 ${n} 次查詢`,
    totalLabel: "查詢總數",
    totalAllTime: "累計",
    langMapTitle: "班級使用的學習語言",
    langMapSub: "每次查詢都會用學生自己的語言回答。這是班級真實的語言地圖。",
    notEnough: "資料還不夠。",
    stuckTitle: "班級卡關的單字",
    stuckSub: "建議在下堂課前先行講解。",
    supportTitle: "可能需要更多關注",
    supportSub: "僅你可見。查詢多可能代表遇到困難，也可能只是出於好奇。",
    supportRosterHint: "在班級名單中加入學生姓名，即可在這裡看到僅你可見的支援提示。",
    lookupsLabel: "次查詢",
    empty: "這個班級還沒有查過任何單字。",
  },
  ko: {
    title: "학급 인사이트",
    loading: "불러오는 중…",
    notFound: "학급을 찾을 수 없습니다. 코드를 확인해 주세요.",
    basedOn: (n) => `최근 ${n}회 검색 기준`,
    totalLabel: "총 검색 수",
    totalAllTime: "전체 기간",
    langMapTitle: "우리 반의 학습 언어",
    langMapSub: "모든 검색은 학생 자신의 언어로 답변됩니다. 이것이 우리 반의 실제 언어 지도입니다.",
    notEnough: "아직 데이터가 충분하지 않습니다.",
    stuckTitle: "우리 반이 막히는 단어",
    stuckSub: "다음 수업 전에 미리 가르쳐 두면 좋습니다.",
    supportTitle: "더 관심이 필요할 수 있는 학생",
    supportSub: "비공개. 검색이 많다는 것은 어려움일 수도, 단순한 호기심일 수도 있습니다.",
    supportRosterHint: "학급 명단에 학생 이름을 추가하면 여기에서 비공개 지원 신호를 볼 수 있습니다.",
    lookupsLabel: "회 검색",
    empty: "이 학급은 아직 아무것도 검색하지 않았습니다.",
  },
  th: {
    title: "ข้อมูลเชิงลึกของห้องเรียน",
    loading: "กำลังโหลด…",
    notFound: "ไม่พบห้องเรียน โปรดตรวจสอบรหัส",
    basedOn: (n) => `อ้างอิงจากการค้นหาล่าสุด ${n} ครั้ง`,
    totalLabel: "จำนวนการค้นหาทั้งหมด",
    totalAllTime: "ตั้งแต่เริ่มต้น",
    langMapTitle: "ภาษาที่ห้องเรียนของคุณใช้เรียนรู้",
    langMapSub: "ทุกการค้นหาจะได้คำตอบเป็นภาษาของนักเรียนเอง นี่คือแผนที่ภาษาที่แท้จริงของห้องเรียนคุณ",
    notEnough: "ข้อมูลยังไม่เพียงพอ",
    stuckTitle: "คำที่ห้องเรียนของคุณติดขัด",
    stuckSub: "ควรสอนล่วงหน้าก่อนคาบเรียนถัดไป",
    supportTitle: "อาจต้องการความใส่ใจเพิ่มเติม",
    supportSub: "ส่วนตัว การค้นหาบ่อยอาจหมายถึงความยากลำบากหรือแค่ความอยากรู้",
    supportRosterHint: "เพิ่มชื่อนักเรียนในรายชื่อห้องเรียนเพื่อดูสัญญาณการช่วยเหลือแบบส่วนตัวที่นี่",
    lookupsLabel: "การค้นหา",
    empty: "ห้องเรียนนี้ยังไม่ได้ค้นหาอะไรเลย",
  },
  bn: {
    title: "ক্লাসের অন্তর্দৃষ্টি",
    loading: "লোড হচ্ছে…",
    notFound: "ক্লাস পাওয়া যায়নি। অনুগ্রহ করে কোডটি যাচাই করুন।",
    basedOn: (n) => `সর্বশেষ ${n}টি খোঁজের ভিত্তিতে`,
    totalLabel: "মোট খোঁজ",
    totalAllTime: "শুরু থেকে",
    langMapTitle: "আপনার ক্লাস যেসব ভাষায় শেখে",
    langMapSub: "প্রতিটি খোঁজের উত্তর শিক্ষার্থীর নিজের ভাষায় দেওয়া হয়। এটি আপনার ক্লাসের আসল ভাষা-মানচিত্র।",
    notEnough: "এখনও যথেষ্ট তথ্য নেই।",
    stuckTitle: "যেসব শব্দে আপনার ক্লাস আটকে যায়",
    stuckSub: "পরের পাঠের আগে এগুলো আগেভাগে শিখিয়ে দেওয়া ভালো।",
    supportTitle: "হয়তো বাড়তি মনোযোগ দরকার",
    supportSub: "ব্যক্তিগত। বেশি খোঁজ মানে অসুবিধা বা নিছক কৌতূহল হতে পারে।",
    supportRosterHint: "এখানে ব্যক্তিগত সহায়তা-সংকেত দেখতে ক্লাসের তালিকায় শিক্ষার্থীদের নাম যোগ করুন।",
    lookupsLabel: "খোঁজ",
    empty: "এই ক্লাস এখনও কিছু খোঁজেনি।",
  },
  da: {
    title: "Klasseindsigt",
    loading: "Indlæser…",
    notFound: "Klassen blev ikke fundet. Tjek koden.",
    basedOn: (n) => `Baseret på de seneste ${n} opslag`,
    totalLabel: "Opslag i alt",
    totalAllTime: "fra start",
    langMapTitle: "Sprog, din klasse lærer på",
    langMapSub: "Hvert opslag besvares på elevens eget sprog. Dette er din klasses virkelige sprogkort.",
    notEnough: "Ikke nok data endnu.",
    stuckTitle: "Ord, din klasse går i stå ved",
    stuckSub: "Værd at gennemgå, før næste lektion.",
    supportTitle: "Har måske brug for ekstra opmærksomhed",
    supportSub: "Privat. Mange opslag kan betyde, at eleven kæmper, eller blot er nysgerrig.",
    supportRosterHint: "Tilføj elevernes navne til klasselisten for at se et privat støttesignal her.",
    lookupsLabel: "opslag",
    empty: "Denne klasse har ikke slået noget op endnu.",
  },
  hu: {
    title: "Osztályelemzés",
    loading: "Betöltés…",
    notFound: "Az osztály nem található. Ellenőrizze a kódot.",
    basedOn: (n) => `Az utolsó ${n} keresés alapján`,
    totalLabel: "Összes keresés",
    totalAllTime: "a kezdetek óta",
    langMapTitle: "Nyelvek, amelyeken az osztály tanul",
    langMapSub: "Minden keresésre a tanuló saját nyelvén érkezik válasz. Ez az osztály valódi nyelvi térképe.",
    notEnough: "Még nincs elég adat.",
    stuckTitle: "Szavak, amelyeknél az osztály elakad",
    stuckSub: "Érdemes előre átvenni őket a következő óra előtt.",
    supportTitle: "Talán több figyelmet igényelnek",
    supportSub: "Privát. A sok keresés nehézséget vagy egyszerűen kíváncsiságot is jelenthet.",
    supportRosterHint: "Adja hozzá a tanulók nevét az osztálynévsorhoz, hogy itt privát támogatási jelzést lásson.",
    lookupsLabel: "keresés",
    empty: "Ez az osztály még semmit sem keresett.",
  },
};

export function TeacherByCodeClient({ code }: { code: string }) {
  const { lang, dir } = useLang();
  const href = useHref();
  const t = COPY[lang] ?? COPY.en;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/classroom/searches?code=${encodeURIComponent(code)}`);
        if (!res.ok) {
          if (!cancelled) setError(true);
          return;
        }
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  const raw: RawSearch[] = useMemo(
    () => (data?.searches ?? []).map((s) => ({ word: s.word, lang: s.language, studentName: s.studentName })),
    [data],
  );
  const insights = useMemo(() => computeClassroomInsights(raw), [raw]);

  return (
    <div dir={dir} style={{ minHeight: "100vh", background: "#FAFAF9", padding: "40px 20px", fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href={href("/")} translate="no" dir="ltr" style={{ display: "inline-block", fontSize: 22, fontWeight: 800, color: "#1C1917", textDecoration: "none", marginBottom: 20 }}>
          Gad<span style={{ color: "#0EA5A5", fontStyle: "italic" }}>it</span>
        </Link>

        {loading ? (
          <p style={{ color: "#78716C", fontSize: 15 }}>{t.loading}</p>
        ) : error || !data ? (
          <p style={{ color: "#B45309", fontSize: 15 }}>{t.notFound}</p>
        ) : (
          <>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1C1917", margin: "0 0 4px" }}>
              {data.name || t.title}
            </h1>
            <p style={{ fontSize: 12.5, color: "#A8A29E", margin: "0 0 24px" }}>
              {t.basedOn(insights.sampleSize)}
            </p>

            {insights.sampleSize === 0 ? (
              <p style={{ color: "#78716C", fontSize: 15 }}>{t.empty}</p>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                  {/* Total */}
                  <div style={card}>
                    <div style={label}>{t.totalLabel}</div>
                    <div style={{ fontSize: 40, fontWeight: 800, color: "#CA8A04", lineHeight: 1.05 }}>
                      {(data.searchCount ?? 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: "#A8A29E" }}>{t.totalAllTime}</div>
                  </div>

                  {/* Language map */}
                  <div style={card}>
                    <div style={label}>{t.langMapTitle}</div>
                    <p style={sub}>{t.langMapSub}</p>
                    {insights.languages.length === 0 ? (
                      <p style={{ fontSize: 13, color: "#A8A29E", margin: 0 }}>{t.notEnough}</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                        {insights.languages.map((l) => (
                          <div key={l.lang} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#1C1917", minWidth: 78 }}>{classroomLangLabel(l.lang)}</span>
                            <span style={{ flex: 1, height: 8, background: "#F0EEEB", borderRadius: 999, overflow: "hidden" }}>
                              <span style={{ display: "block", height: "100%", width: `${Math.max(l.pct, 3)}%`, background: "#CA8A04", borderRadius: 999 }} />
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#78716C", minWidth: 34, textAlign: "end" }}>{l.pct}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stuck words */}
                <div style={{ ...card, marginTop: 14 }}>
                  <div style={label}>{t.stuckTitle}</div>
                  <p style={sub}>{t.stuckSub}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                    {insights.topWords.map((w) => (
                      <Link key={w.word} href={href(`/word/${encodeURIComponent(w.word)}`)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 600, color: "#92400E" }}>
                        <span>{w.word}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#CA8A04", background: "#FEF3C7", borderRadius: 999, padding: "1px 7px" }}>{w.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Private support signal */}
                <div style={{ ...card, marginTop: 14 }}>
                  <div style={label}>{t.supportTitle}</div>
                  <p style={sub}>{t.supportSub}</p>
                  {insights.students.length === 0 ? (
                    <p style={{ fontSize: 13, color: "#A8A29E", margin: 0 }}>{t.supportRosterHint}</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                      {insights.students.map((st) => (
                        <div key={st.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#1C1917", flex: 1 }}>{st.name}</span>
                          <span style={{ fontSize: 12.5, color: "#78716C" }}>{st.count} {t.lookupsLabel}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #EAE7E3",
  borderRadius: 14,
  padding: "16px 18px",
};
const label: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#1C1917", marginBottom: 4 };
const sub: React.CSSProperties = { fontSize: 12.5, color: "#78716C", lineHeight: 1.45, margin: "0 0 12px" };

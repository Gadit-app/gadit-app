"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";

/**
 * "First steps" card at the top of the school dashboard (Gadi 2026-10-10),
 * the same steps as the pilot onboarding emails. Each step ticks itself when
 * it happens; only "teachers have the login" is ticked by hand. Gone once
 * every step is done.
 */

type Props = {
  lang: string;
  curriculum?: string;
  classrooms: number;
  words: number;
  logo: boolean;
  checklist?: { activity?: string; teachers?: string };
};

type StepKey = "curriculum" | "classroom" | "lesson" | "activity" | "teachers" | "logo";
type ChecklistCopy = {
  title: string;
  sub: (d: number, n: number) => string;
  steps: Record<StepKey, readonly [string, string]>;
};

const COPY: Record<string, ChecklistCopy> = {
  he: {
    title: "הצעדים הראשונים",
    sub: (d: number, n: number) => `${d} מתוך ${n} הושלמו`,
    steps: {
      curriculum: ["בחירת תוכנית הלימודים וסוג בית הספר", "לקבוצות המילים"],
      classroom: ["הוספת הכיתות שבפיילוט, עם שם המורה של כל כיתה", "לכיתות"],
      lesson: ["הקרנת שיעור ראשון בכיתה", "לקבוצות המילים"],
      activity: ["חידון או משחק לכיתה", "לקבוצות המילים"],
      teachers: ["מסירת פרטי הכניסה למורים בשכבות המשתתפות", "סיימתי"],
      logo: ["העלאת הלוגו של בית הספר", "להגדרות"],
    },
  },
  en: {
    title: "First steps",
    sub: (d: number, n: number) => `${d} of ${n} done`,
    steps: {
      curriculum: ["Choose your curriculum and school type", "Word sets"],
      classroom: ["Add the pilot classes, each with its teacher", "Classes"],
      lesson: ["Project your first lesson in class", "Word sets"],
      activity: ["Run a class quiz or game", "Word sets"],
      teachers: ["Give the login to teachers in the participating grades", "Done"],
      logo: ["Upload the school logo", "Settings"],
    },
  },
  ar: {
    title: "الخطوات الأولى",
    sub: (d: number, n: number) => `${d} من ${n} مكتملة`,
    steps: {
      curriculum: ["اختيار المنهج الدراسي ونوع المدرسة", "مجموعات كلمات"],
      classroom: ["إضافة الصفوف المشاركة في التجربة، مع معلم كل صف", "الصفوف"],
      lesson: ["عرض أول درس على الشاشة في الصف", "مجموعات كلمات"],
      activity: ["تشغيل اختبار أو لعبة للصف", "مجموعات كلمات"],
      teachers: ["تسليم بيانات الدخول للمعلمين في المراحل المشاركة", "تم"],
      logo: ["رفع شعار المدرسة", "الإعدادات"],
    },
  },
  ru: {
    title: "Первые шаги",
    sub: (d: number, n: number) => `Выполнено ${d} из ${n}`,
    steps: {
      curriculum: ["Выберите учебную программу и тип школы", "Наборы слов"],
      classroom: ["Добавьте классы пилота, каждый со своим учителем", "Классы"],
      lesson: ["Покажите первый урок в классе на экране", "Наборы слов"],
      activity: ["Проведите викторину или игру для класса", "Наборы слов"],
      teachers: ["Передайте данные для входа учителям участвующих параллелей", "Готово"],
      logo: ["Загрузите логотип школы", "Настройки"],
    },
  },
  es: {
    title: "Primeros pasos",
    sub: (d: number, n: number) => `${d} de ${n} completados`,
    steps: {
      curriculum: ["Elegir el plan de estudios y el tipo de escuela", "Grupos de palabras"],
      classroom: ["Añadir las clases del piloto, cada una con su docente", "Clases"],
      lesson: ["Proyectar la primera lección en clase", "Grupos de palabras"],
      activity: ["Hacer un cuestionario o juego con la clase", "Grupos de palabras"],
      teachers: ["Entregar los datos de acceso a los docentes de los cursos participantes", "Hecho"],
      logo: ["Subir el logo de la escuela", "Ajustes"],
    },
  },
  pt: {
    title: "Primeiros passos",
    sub: (d: number, n: number) => `${d} de ${n} concluídos`,
    steps: {
      curriculum: ["Escolher o currículo e o tipo de escola", "Conjuntos de palavras"],
      classroom: ["Adicionar as turmas do piloto, cada uma com o seu professor", "Turmas"],
      lesson: ["Projetar a primeira aula em sala", "Conjuntos de palavras"],
      activity: ["Fazer um quiz ou jogo com a turma", "Conjuntos de palavras"],
      teachers: ["Entregar o acesso aos professores das séries participantes", "Concluído"],
      logo: ["Enviar o logotipo da escola", "Configurações"],
    },
  },
  fr: {
    title: "Premières étapes",
    sub: (d: number, n: number) => `${d} sur ${n} terminées`,
    steps: {
      curriculum: ["Choisir le programme et le type d'établissement", "Listes de mots"],
      classroom: ["Ajouter les classes du pilote, chacune avec son enseignant", "Classes"],
      lesson: ["Projeter une première leçon en classe", "Listes de mots"],
      activity: ["Lancer un quiz ou un jeu en classe", "Listes de mots"],
      teachers: ["Remettre les identifiants aux enseignants des niveaux participants", "C'est fait"],
      logo: ["Importer le logo de l'établissement", "Paramètres"],
    },
  },
  de: {
    title: "Erste Schritte",
    sub: (d: number, n: number) => `${d} von ${n} erledigt`,
    steps: {
      curriculum: ["Lehrplan und Schulform auswählen", "Wortlisten"],
      classroom: ["Die Pilotklassen hinzufügen, jeweils mit der Lehrkraft", "Klassen"],
      lesson: ["Die erste Unterrichtsstunde in der Klasse projizieren", "Wortlisten"],
      activity: ["Ein Quiz oder Spiel mit der Klasse durchführen", "Wortlisten"],
      teachers: ["Den Lehrkräften der teilnehmenden Jahrgangsstufen die Zugangsdaten geben", "Erledigt"],
      logo: ["Das Schullogo hochladen", "Einstellungen"],
    },
  },
  cs: {
    title: "První kroky",
    sub: (d: number, n: number) => `Hotovo ${d} z ${n}`,
    steps: {
      curriculum: ["Vybrat učební plán a typ školy", "Sady slov"],
      classroom: ["Přidat třídy pilotního projektu, každou s jejím učitelem", "Třídy"],
      lesson: ["Promítnout první hodinu ve třídě", "Sady slov"],
      activity: ["Spustit kvíz nebo hru pro třídu", "Sady slov"],
      teachers: ["Předat přihlašovací údaje učitelům zapojených ročníků", "Hotovo"],
      logo: ["Nahrát logo školy", "Nastavení"],
    },
  },
  sk: {
    title: "Prvé kroky",
    sub: (d: number, n: number) => `Hotovo ${d} z ${n}`,
    steps: {
      curriculum: ["Vybrať učebný plán a typ školy", "Sady slov"],
      classroom: ["Pridať triedy pilotného projektu, každú s jej učiteľom", "Triedy"],
      lesson: ["Premietnuť prvú hodinu v triede", "Sady slov"],
      activity: ["Spustiť kvíz alebo hru pre triedu", "Sady slov"],
      teachers: ["Odovzdať prihlasovacie údaje učiteľom zapojených ročníkov", "Hotovo"],
      logo: ["Nahrať logo školy", "Nastavenia"],
    },
  },
  it: {
    title: "Primi passi",
    sub: (d: number, n: number) => `${d} di ${n} completati`,
    steps: {
      curriculum: ["Scegliere il programma e il tipo di scuola", "Gruppi di parole"],
      classroom: ["Aggiungere le classi del progetto pilota, ognuna con il suo insegnante", "Classi"],
      lesson: ["Proiettare la prima lezione in classe", "Gruppi di parole"],
      activity: ["Fare un quiz o un gioco con la classe", "Gruppi di parole"],
      teachers: ["Consegnare l'accesso agli insegnanti dei livelli partecipanti", "Fatto"],
      logo: ["Caricare il logo della scuola", "Impostazioni"],
    },
  },
  ja: {
    title: "最初のステップ",
    sub: (d: number, n: number) => `${n}件中${d}件完了`,
    steps: {
      curriculum: ["カリキュラムと学校の種類を選ぶ", "単語セット"],
      classroom: ["パイロットのクラスを、それぞれの担当の先生とあわせて追加する", "クラス"],
      lesson: ["最初の授業を教室で投影する", "単語セット"],
      activity: ["クラスでクイズやゲームを行う", "単語セット"],
      teachers: ["参加学年の先生にログイン情報を渡す", "完了"],
      logo: ["学校のロゴをアップロードする", "設定"],
    },
  },
  hi: {
    title: "पहले कदम",
    sub: (d: number, n: number) => `${n} में से ${d} पूरे`,
    steps: {
      curriculum: ["पाठ्यक्रम और स्कूल का प्रकार चुनें", "शब्द समूह"],
      classroom: ["पायलट की कक्षाएँ जोड़ें, हर कक्षा के शिक्षक के साथ", "कक्षाएँ"],
      lesson: ["कक्षा में पहला पाठ प्रोजेक्ट करें", "शब्द समूह"],
      activity: ["कक्षा के लिए क्विज़ या खेल चलाएँ", "शब्द समूह"],
      teachers: ["भाग लेने वाले कक्षा-स्तरों के शिक्षकों को लॉगिन विवरण दें", "हो गया"],
      logo: ["स्कूल का लोगो अपलोड करें", "सेटिंग्स"],
    },
  },
  am: {
    title: "የመጀመሪያ እርምጃዎች",
    sub: (d: number, n: number) => `ከ${n} ${d} ተጠናቀዋል`,
    steps: {
      curriculum: ["ሥርዓተ ትምህርቱንና የትምህርት ቤቱን ዓይነት ይምረጡ", "የቃላት ስብስቦች"],
      classroom: ["የሙከራ ክፍሎችን ከእያንዳንዱ ክፍል መምህር ጋር ያክሉ", "ክፍሎች"],
      lesson: ["የመጀመሪያውን ትምህርት በክፍል ውስጥ በስክሪን ያሳዩ", "የቃላት ስብስቦች"],
      activity: ["ለክፍሉ ጥያቄ ወይም ጨዋታ ያካሂዱ", "የቃላት ስብስቦች"],
      teachers: ["ለተሳታፊ የክፍል ደረጃዎች መምህራን የመግቢያ መረጃ ይስጡ", "ተጠናቋል"],
      logo: ["የትምህርት ቤቱን አርማ ይስቀሉ", "ቅንብሮች"],
    },
  },
  uk: {
    title: "Перші кроки",
    sub: (d: number, n: number) => `Виконано ${d} з ${n}`,
    steps: {
      curriculum: ["Оберіть навчальну програму і тип школи", "Набори слів"],
      classroom: ["Додайте класи пілоту, кожен зі своїм учителем", "Класи"],
      lesson: ["Покажіть перший урок у класі на екрані", "Набори слів"],
      activity: ["Проведіть вікторину або гру для класу", "Набори слів"],
      teachers: ["Передайте дані для входу вчителям паралелей, що беруть участь", "Готово"],
      logo: ["Завантажте логотип школи", "Налаштування"],
    },
  },
  tr: {
    title: "İlk adımlar",
    sub: (d: number, n: number) => `${n} adımdan ${d} tanesi tamamlandı`,
    steps: {
      curriculum: ["Müfredatı ve okul türünü seçin", "Kelime setleri"],
      classroom: ["Pilot sınıfları her birinin öğretmeniyle birlikte ekleyin", "Sınıflar"],
      lesson: ["İlk dersi sınıfta yansıtın", "Kelime setleri"],
      activity: ["Sınıfla bir test ya da oyun yapın", "Kelime setleri"],
      teachers: ["Katılan sınıf seviyelerindeki öğretmenlere giriş bilgilerini verin", "Tamamlandı"],
      logo: ["Okul logosunu yükleyin", "Ayarlar"],
    },
  },
  pl: {
    title: "Pierwsze kroki",
    sub: (d: number, n: number) => `Ukończono ${d} z ${n}`,
    steps: {
      curriculum: ["Wybór podstawy programowej i typu szkoły", "Zestawy słów"],
      classroom: ["Dodanie klas pilotażowych, każdej z jej nauczycielem", "Klasy"],
      lesson: ["Wyświetlenie pierwszej lekcji w klasie", "Zestawy słów"],
      activity: ["Quiz lub gra z klasą", "Zestawy słów"],
      teachers: ["Przekazanie danych logowania nauczycielom uczestniczących roczników", "Gotowe"],
      logo: ["Przesłanie logo szkoły", "Ustawienia"],
    },
  },
  fa: {
    title: "گام‌های نخست",
    sub: (d: number, n: number) => `${d} از ${n} انجام شد`,
    steps: {
      curriculum: ["انتخاب برنامه درسی و نوع مدرسه", "مجموعه‌های واژه"],
      classroom: ["افزودن کلاس‌های آزمایشی، هر کدام با معلم خودش", "کلاس‌ها"],
      lesson: ["نمایش نخستین درس در کلاس روی پرده", "مجموعه‌های واژه"],
      activity: ["برگزاری آزمونک یا بازی برای کلاس", "مجموعه‌های واژه"],
      teachers: ["دادن اطلاعات ورود به معلمان پایه‌های شرکت‌کننده", "انجام دادم"],
      logo: ["بارگذاری لوگوی مدرسه", "تنظیمات"],
    },
  },
  id: {
    title: "Langkah pertama",
    sub: (d: number, n: number) => `${d} dari ${n} selesai`,
    steps: {
      curriculum: ["Pilih kurikulum dan jenis sekolah", "Kumpulan kata"],
      classroom: ["Tambahkan kelas uji coba, masing-masing dengan gurunya", "Kelas"],
      lesson: ["Tayangkan pelajaran pertama di kelas", "Kumpulan kata"],
      activity: ["Adakan kuis atau permainan untuk kelas", "Kumpulan kata"],
      teachers: ["Berikan info login kepada guru di jenjang yang ikut serta", "Selesai"],
      logo: ["Unggah logo sekolah", "Pengaturan"],
    },
  },
  nl: {
    title: "Eerste stappen",
    sub: (d: number, n: number) => `${d} van ${n} gedaan`,
    steps: {
      curriculum: ["Leerplan en schooltype kiezen", "Woordensets"],
      classroom: ["De pilotklassen toevoegen, elk met de eigen leerkracht", "Klassen"],
      lesson: ["De eerste les in de klas projecteren", "Woordensets"],
      activity: ["Een quiz of spel met de klas doen", "Woordensets"],
      teachers: ["De inloggegevens geven aan leerkrachten van de deelnemende leerjaren", "Klaar"],
      logo: ["Het schoollogo uploaden", "Instellingen"],
    },
  },
  el: {
    title: "Πρώτα βήματα",
    sub: (d: number, n: number) => `${d} από ${n} ολοκληρώθηκαν`,
    steps: {
      curriculum: ["Επιλογή αναλυτικού προγράμματος και τύπου σχολείου", "Σύνολα λέξεων"],
      classroom: ["Προσθήκη των τάξεων του πιλοτικού, η καθεμία με τον εκπαιδευτικό της", "Τάξεις"],
      lesson: ["Προβολή του πρώτου μαθήματος στην τάξη", "Σύνολα λέξεων"],
      activity: ["Κουίζ ή παιχνίδι για την τάξη", "Σύνολα λέξεων"],
      teachers: ["Παράδοση των στοιχείων σύνδεσης στους εκπαιδευτικούς των τάξεων που συμμετέχουν", "Έγινε"],
      logo: ["Ανέβασμα του λογότυπου του σχολείου", "Ρυθμίσεις"],
    },
  },
  zu: {
    title: "Izinyathelo zokuqala",
    sub: (d: number, n: number) => `${d} kokungu-${n} kuqediwe`,
    steps: {
      curriculum: ["Khetha ikharikhulamu nohlobo lwesikole", "Amaqoqo amagama"],
      classroom: ["Engeza amakilasi okulinga, ngalinye nothisha walo", "Amakilasi"],
      lesson: ["Bonisa isifundo sokuqala ekilasini esikrinini", "Amaqoqo amagama"],
      activity: ["Yenza imibuzo noma umdlalo wekilasi", "Amaqoqo amagama"],
      teachers: ["Nikeza othisha bamabanga abambe iqhaza imininingwane yokungena", "Kwenziwe"],
      logo: ["Layisha uphawu lwesikole", "Izilungiselelo"],
    },
  },
  xh: {
    title: "Amanyathelo okuqala",
    sub: (d: number, n: number) => `${d} kwe-${n} agqityiwe`,
    steps: {
      curriculum: ["Khetha ikharikhulam yakho nohlobo lwesikolo", "Amaqela amagama"],
      classroom: ["Yongeza iiklasi zovavanyo, nganye notitshala wayo", "Iiklasi"],
      lesson: ["Bonisa isifundo sakho sokuqala eklasini", "Amaqela amagama"],
      activity: ["Yenza imibuzo okanye umdlalo weklasi", "Amaqela amagama"],
      teachers: ["Nika ootitshala bamabanga athathayo inxaxheba iinkcukacha zokungena", "Kugqityiwe"],
      logo: ["Layisha ilogo yesikolo", "Iisetingi"],
    },
  },
  nso: {
    title: "Dikgato tša mathomo",
    sub: (d: number, n: number) => `Tše ${d} go tše ${n} di dirilwe`,
    steps: {
      curriculum: ["Kgetha kharikhulamo ya gago le mohuta wa sekolo", "Dihlopha tša mantšu"],
      classroom: ["Oketša diphapoši tša teko, e nngwe le e nngwe le morutiši wa yona", "Diphapoši"],
      lesson: ["Bontšha thuto ya gago ya mathomo phapošing ka purotšekthara", "Dihlopha tša mantšu"],
      activity: ["Dira tlhahlobo goba papadi ya phapoši", "Dihlopha tša mantšu"],
      teachers: ["Fa barutiši ba mephato ye e tšeago karolo dintlha tša go tsena", "E dirilwe"],
      logo: ["Laiša lokotlolo ya sekolo", "Dipeakanyo"],
    },
  },
  tn: {
    title: "Dikgato tsa ntlha",
    sub: (d: number, n: number) => `${d} mo go ${n} di dirilwe`,
    steps: {
      curriculum: ["Tlhopha kharikhulamo ya gago le mofuta wa sekolo", "Disete tsa mafoko"],
      classroom: ["Tsenya diphaposi tsa teko, nngwe le nngwe le morutabana wa yone", "Diphaposi"],
      lesson: ["Bontsha thuto ya gago ya ntlha mo phaposing", "Disete tsa mafoko"],
      activity: ["Dira tlhatlhobo kgotsa motshameko wa phaposi", "Disete tsa mafoko"],
      teachers: ["Naya barutabana ba mephato e e tsayang karolo dintlha tsa go tsena", "Go dirilwe"],
      logo: ["Tsenya logo ya sekolo", "Dithulaganyo"],
    },
  },
  st: {
    title: "Mehato ya pele",
    sub: (d: number, n: number) => `${d} ho ${n} e entswe`,
    steps: {
      curriculum: ["Kgetha kharikhulamo ya hao le mofuta wa sekolo", "Dihlopha tsa mantswe"],
      classroom: ["Kenya ditlelase tsa teko, e nngwe le e nngwe le titjhere ya yona", "Ditlelase"],
      lesson: ["Bontsha thuto ya hao ya pele ka projeketara tlelaseng", "Dihlopha tsa mantswe"],
      activity: ["Tsamaisa kwisi kapa papadi ya tlelase", "Dihlopha tsa mantswe"],
      teachers: ["Fa matitjhere a dikereiti tse kenang letsoho dintlha tsa ho kena", "E entswe"],
      logo: ["Kenya logo ya sekolo", "Disetting"],
    },
  },
  ts: {
    title: "Magoza yo sungula",
    sub: (d: number, n: number) => `${d} eka ${n} swi endliwile`,
    steps: {
      curriculum: ["Hlawulani kharikhulamu na muxaka wa xikolo xa n'wina", "Mintlawa ya marito"],
      classroom: ["Engetelani titlilasi ta ndzingo, yin'wana na yin'wana na mudyondzisi wa yona", "Titlilasi"],
      lesson: ["Kombisani dyondzo ya n'wina yo sungula etlilasini", "Mintlawa ya marito"],
      activity: ["Endlani mavutiso kumbe ntlangu wa tlilasi", "Mintlawa ya marito"],
      teachers: ["Nyikani vadyondzisi va magiredi lama nghenelaka vuxokoxoko byo nghena", "Swi endliwile"],
      logo: ["Khandziyisani logo ya xikolo", "Swiyimiso"],
    },
  },
  ss: {
    title: "Tinyatselo tekucala",
    sub: (d: number, n: number) => `${d} kwa-${n} kuphelile`,
    steps: {
      curriculum: ["Khetsa likharikhulamu lakho neluhlobo lwesikolwa", "Emaceba emagama"],
      classroom: ["Engeta emakilasi ekulinga, ngalinye nathishela walo", "Emakilasi"],
      lesson: ["Khombisa sifundvo sakho sekucala ekilasini", "Emaceba emagama"],
      activity: ["Yenta imibuto nobe umdlalo welikilasi", "Emaceba emagama"],
      teachers: ["Nika bothishela bemabanga lahlanganyelako imininingwane yekungena", "Kuphelile"],
      logo: ["Layisha luphawu lwesikolwa", "Tilungiselelo"],
    },
  },
  ve: {
    title: "Zwiṱepe zwa u thoma",
    sub: (d: number, n: number) => `${d} kha ${n} zwo itwa`,
    steps: {
      curriculum: ["Khethani kharikhuḽamu yaṋu na lushaka lwa tshikolo", "Zwigwada zwa maipfi"],
      classroom: ["Engedzani kilasi dza ndingo, iṅwe na iṅwe na mudededzi wayo", "Kilasi"],
      lesson: ["Sumbedzani ngudo yaṋu ya u thoma kilasini", "Zwigwada zwa maipfi"],
      activity: ["Itani mbudziso kana mutambo wa kilasi", "Zwigwada zwa maipfi"],
      teachers: ["Ṋeani vhadededzi vha gireidi dzi re kha ndingo nḓila ya u dzhena", "Zwo itwa"],
      logo: ["Rumelani logo ya tshikolo", "Mavhekanyele"],
    },
  },
  nr: {
    title: "Amagadango wokuthoma",
    sub: (d: number, n: number) => `${d} kwa-${n} kwenziwe`,
    steps: {
      curriculum: ["Khetha ikharikhyulamu yakho nohlobo lwesikolo", "Amaqoqo wamezwi"],
      classroom: ["Faka amakilasi wokulinga, ngalinye notitjhere walo", "Amakilasi"],
      lesson: ["Tjengisa isifundo sakho sokuthoma ekilasini", "Amaqoqo wamezwi"],
      activity: ["Enza ikhwizi namkha umdlalo wekilasi", "Amaqoqo wamezwi"],
      teachers: ["Nikela abotitjhere bamabanga ahlanganyelako indlela yokungena", "Kwenziwe"],
      logo: ["Layisha ilogo yesikolo", "Iinlungiselelo"],
    },
  },
  vi: {
    title: "Những bước đầu tiên",
    sub: (d: number, n: number) => `Đã xong ${d}/${n}`,
    steps: {
      curriculum: ["Chọn chương trình học và loại trường", "Bộ từ vựng"],
      classroom: ["Thêm các lớp thí điểm, mỗi lớp kèm giáo viên của lớp", "Lớp học"],
      lesson: ["Trình chiếu bài học đầu tiên trên lớp", "Bộ từ vựng"],
      activity: ["Tổ chức câu đố hoặc trò chơi cho cả lớp", "Bộ từ vựng"],
      teachers: ["Gửi thông tin đăng nhập cho giáo viên các khối tham gia", "Xong"],
      logo: ["Tải lên logo của trường", "Cài đặt"],
    },
  },
  fil: {
    title: "Mga unang hakbang",
    sub: (d: number, n: number) => `${d} sa ${n} ang tapos`,
    steps: {
      curriculum: ["Piliin ang curriculum at uri ng paaralan", "Mga set ng salita"],
      classroom: ["Idagdag ang mga klase sa pilot, bawat isa kasama ang guro nito", "Mga klase"],
      lesson: ["I-project ang unang aralin sa klase", "Mga set ng salita"],
      activity: ["Magpatakbo ng quiz o laro para sa klase", "Mga set ng salita"],
      teachers: ["Ibigay ang login sa mga guro ng mga kalahok na baitang", "Tapos na"],
      logo: ["I-upload ang logo ng paaralan", "Mga setting"],
    },
  },
  af: {
    title: "Eerste stappe",
    sub: (d: number, n: number) => `${d} van ${n} klaar`,
    steps: {
      curriculum: ["Kies jou kurrikulum en skooltipe", "Woordstelle"],
      classroom: ["Voeg die loodsklasse by, elk met sy onderwyser", "Klasse"],
      lesson: ["Projekteer die eerste les in die klas", "Woordstelle"],
      activity: ["Hou 'n vasvra of speletjie met die klas", "Woordstelle"],
      teachers: ["Gee die aanmeldbesonderhede aan onderwysers in die deelnemende grade", "Klaar"],
      logo: ["Laai die skoollogo op", "Instellings"],
    },
  },
  sw: {
    title: "Hatua za kwanza",
    sub: (d: number, n: number) => `${d} kati ya ${n} zimekamilika`,
    steps: {
      curriculum: ["Chagua mtaala na aina ya shule", "Seti za maneno"],
      classroom: ["Ongeza madarasa ya majaribio, kila moja na mwalimu wake", "Madarasa"],
      lesson: ["Onyesha somo la kwanza darasani kwenye skrini", "Seti za maneno"],
      activity: ["Endesha jaribio fupi au mchezo kwa darasa", "Seti za maneno"],
      teachers: ["Wape walimu wa madarasa yanayoshiriki taarifa za kuingia", "Imekamilika"],
      logo: ["Pakia nembo ya shule", "Mipangilio"],
    },
  },
  "zh-CN": {
    title: "入门步骤",
    sub: (d: number, n: number) => `已完成 ${d}/${n}`,
    steps: {
      curriculum: ["选择课程标准和学校类型", "词汇组"],
      classroom: ["添加试点班级，并填写每个班的老师", "班级"],
      lesson: ["在课堂上投屏第一节课", "词汇组"],
      activity: ["在班上进行一次测验或游戏", "词汇组"],
      teachers: ["把登录信息交给参与年级的老师", "已完成"],
      logo: ["上传学校标志", "设置"],
    },
  },
  "zh-TW": {
    title: "入門步驟",
    sub: (d: number, n: number) => `已完成 ${d}/${n}`,
    steps: {
      curriculum: ["選擇課綱和學校類型", "詞彙組"],
      classroom: ["新增試辦班級，並填寫每班的老師", "班級"],
      lesson: ["在課堂上投影第一堂課", "詞彙組"],
      activity: ["在班上進行一次測驗或遊戲", "詞彙組"],
      teachers: ["將登入資訊交給參與年級的老師", "已完成"],
      logo: ["上傳學校標誌", "設定"],
    },
  },
  ko: {
    title: "첫 단계",
    sub: (d: number, n: number) => `${n}개 중 ${d}개 완료`,
    steps: {
      curriculum: ["교육과정과 학교 유형 선택", "단어 세트"],
      classroom: ["시범 학급과 각 학급 담당 교사 추가", "학급"],
      lesson: ["교실에서 첫 수업 화면에 띄우기", "단어 세트"],
      activity: ["학급 퀴즈나 게임 진행", "단어 세트"],
      teachers: ["참여 학년 교사에게 로그인 정보 전달", "완료"],
      logo: ["학교 로고 업로드", "설정"],
    },
  },
  th: {
    title: "ขั้นตอนแรก",
    sub: (d: number, n: number) => `เสร็จแล้ว ${d} จาก ${n}`,
    steps: {
      curriculum: ["เลือกหลักสูตรและประเภทโรงเรียน", "ชุดคำศัพท์"],
      classroom: ["เพิ่มห้องเรียนที่ร่วมโครงการนำร่อง พร้อมครูของแต่ละห้อง", "ห้องเรียน"],
      lesson: ["ฉายบทเรียนแรกในห้องเรียน", "ชุดคำศัพท์"],
      activity: ["จัดแบบทดสอบหรือเกมให้ทั้งห้อง", "ชุดคำศัพท์"],
      teachers: ["มอบข้อมูลเข้าสู่ระบบให้ครูในระดับชั้นที่เข้าร่วม", "เสร็จแล้ว"],
      logo: ["อัปโหลดโลโก้โรงเรียน", "การตั้งค่า"],
    },
  },
  bn: {
    title: "প্রথম ধাপগুলো",
    sub: (d: number, n: number) => `${n}টির মধ্যে ${d}টি সম্পন্ন`,
    steps: {
      curriculum: ["পাঠ্যক্রম ও স্কুলের ধরন বেছে নিন", "শব্দের সেট"],
      classroom: ["পাইলটের ক্লাসগুলো যোগ করুন, প্রতিটির শিক্ষকসহ", "ক্লাস"],
      lesson: ["ক্লাসে প্রথম পাঠটি প্রজেক্ট করুন", "শব্দের সেট"],
      activity: ["ক্লাসের জন্য কুইজ বা খেলা চালান", "শব্দের সেট"],
      teachers: ["অংশগ্রহণকারী শ্রেণির শিক্ষকদের লগইন তথ্য দিন", "সম্পন্ন"],
      logo: ["স্কুলের লোগো আপলোড করুন", "সেটিংস"],
    },
  },
  da: {
    title: "Første skridt",
    sub: (d: number, n: number) => `${d} af ${n} klaret`,
    steps: {
      curriculum: ["Vælg læseplan og skoletype", "Ordsæt"],
      classroom: ["Tilføj pilotklasserne, hver med sin lærer", "Klasser"],
      lesson: ["Vis den første lektion på skærmen i klassen", "Ordsæt"],
      activity: ["Kør en quiz eller et spil med klassen", "Ordsæt"],
      teachers: ["Giv login til lærerne på de deltagende årgange", "Udført"],
      logo: ["Upload skolens logo", "Indstillinger"],
    },
  },
  hu: {
    title: "Első lépések",
    sub: (d: number, n: number) => `${n} lépésből ${d} kész`,
    steps: {
      curriculum: ["Tanterv és iskolatípus kiválasztása", "Szócsomagok"],
      classroom: ["A kísérleti osztályok hozzáadása, mindegyik a saját tanárával", "Osztályok"],
      lesson: ["Az első óra kivetítése az osztályban", "Szócsomagok"],
      activity: ["Kvíz vagy játék az osztállyal", "Szócsomagok"],
      teachers: ["A belépési adatok átadása a részt vevő évfolyamok tanárainak", "Kész"],
      logo: ["Az iskola logójának feltöltése", "Beállítások"],
    },
  },
};

export function SchoolChecklist({ lang, curriculum, classrooms, words, logo, checklist, onTab }: Props & { onTab: (t: "classrooms" | "settings") => void }) {
  const { user } = useAuth();
  const href = useHref();
  const c = COPY[lang] ?? COPY.en;
  const [teachersLocal, setTeachersLocal] = useState(false);
  // Tell the server this school's timezone once, for its school hours and
  // digest hour (2026-10-17). The server keeps the first one it gets.
  useEffect(() => {
    if (!user) return;
    let tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { /* old browser */ }
    if (!tz) return;
    void (async () => {
      try {
        await fetch("/api/schools/checklist", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
          body: JSON.stringify({ step: "timezone", tz }),
        });
      } catch { /* best-effort */ }
    })();
  }, [user]);

  const done = {
    curriculum: !!curriculum,
    classroom: classrooms > 0,
    lesson: words > 0,
    activity: !!checklist?.activity,
    teachers: !!checklist?.teachers || teachersLocal,
    logo,
  };
  const keys = Object.keys(done) as Array<keyof typeof done>;
  const count = keys.filter((k) => done[k]).length;
  if (count === keys.length) return null;

  async function markTeachers() {
    setTeachersLocal(true);
    try {
      await fetch("/api/schools/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user?.getIdToken()}` },
        body: JSON.stringify({ step: "teachers" }),
      });
    } catch { /* stays ticked on this screen */ }
  }

  const action = (k: keyof typeof done) => {
    const label = c.steps[k][1];
    if (k === "teachers") return <button type="button" className="sc-act" onClick={() => void markTeachers()}>{label}</button>;
    if (k === "classroom") return <button type="button" className="sc-act" onClick={() => onTab("classrooms")}>{label}</button>;
    if (k === "logo") return <button type="button" className="sc-act" onClick={() => onTab("settings")}>{label}</button>;
    return <Link className="sc-act" href={href("/sets")}>{label}</Link>;
  };

  return (
    <section className="sc-card" aria-label={c.title}>
      <style>{CSS}</style>
      <div className="sc-head">
        <h2 className="sc-title">{c.title}</h2>
        <span className="sc-sub">{c.sub(count, keys.length)}</span>
      </div>
      <div className="sc-bar"><span style={{ width: `${Math.round((count / keys.length) * 100)}%` }} /></div>
      <ol className="sc-list">
        {keys.map((k) => (
          <li key={k} className={done[k] ? "is-done" : ""}>
            <span className="sc-dot" aria-hidden="true">{done[k] ? "✓" : ""}</span>
            <span className="sc-text">{c.steps[k][0]}</span>
            {!done[k] && action(k)}
          </li>
        ))}
      </ol>
    </section>
  );
}

const CSS = `
.sc-card { background: var(--surface, #fff); border: 1px solid rgba(14,165,165,0.28); border-radius: 16px; padding: 18px 20px; margin-bottom: 24px; display: grid; gap: 12px; }
.sc-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.sc-title { margin: 0; font-size: 18px; font-weight: 700; color: var(--ink, #111827); }
.sc-sub { font-size: 13px; color: var(--ink-muted, #6B7280); font-variant-numeric: tabular-nums; }
.sc-bar { height: 6px; border-radius: 999px; background: rgba(14,165,165,0.12); overflow: hidden; }
.sc-bar span { display: block; height: 100%; background: #0F6F6C; border-radius: 999px; transition: width 300ms ease; }
.sc-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.sc-list li { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 14.5px; color: var(--ink, #111827); }
.sc-list li.is-done .sc-text { color: var(--ink-muted, #6B7280); text-decoration: line-through; text-decoration-color: rgba(107,114,128,0.5); }
.sc-dot { width: 22px; height: 22px; border-radius: 50%; flex: none; display: grid; place-items: center; font-size: 13px; font-weight: 800; color: #fff; background: transparent; box-shadow: inset 0 0 0 2px rgba(14,165,165,0.45); }
.sc-list li.is-done .sc-dot { background: #0F6F6C; box-shadow: none; }
.sc-text { flex: 1 1 200px; min-width: 0; }
.sc-act { font: inherit; font-size: 13px; font-weight: 700; color: #0F6F6C; background: rgba(14,165,165,0.10); border: 0; border-radius: 999px; padding: 5px 12px; cursor: pointer; text-decoration: none; }
`;

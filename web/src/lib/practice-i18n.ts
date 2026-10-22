/**
 * "Practice" (תרגולים), the grown-up's place for the tools a child finds in
 * Homework (Gadi 2026-10-22): reading with a comprehension check, getting
 * ready for a test, dictation and learning a language. Same flows as
 * Homework (app/homework/SpellClient.tsx with area="practice"), with copy for
 * an adult: no homework, no teacher, no school. Shown in the top menu where a
 * child sees Homework (WbShellChrome.tsx), at /exercises (/practice is the
 * notebook's spaced-repetition review).
 *
 * The language card names the languages /api/learn offers for that UI
 * language (lib/learn/engine.ts learnTargets: ar and ru learn English or
 * Hebrew, en learns Hebrew, every other language learns English), and the
 * dictation card names the two languages it writes in (the UI language and
 * English; Hebrew for the English UI). No dashes; Hebrew in the plural.
 */
export type PracticeCopy = {
  /** Nav label and page title. */
  nav: string;
  sub: string;
  read: string; readD: string;
  test: string; testD: string;
  dict: string; dictD: string;
  lang: string; langD: string;
  /** Back from a section to the four cards. */
  back: string;
  /** Back from the reader (opened from Practice) to the four cards. */
  home: string;
  /** A signed-in account without the plan (only reachable by address). */
  gate: string;
};

export const PRACTICE_COPY: Record<string, PracticeCopy> = {
  en: {
    nav: "Practice", sub: "Pick what to practise today.",
    read: "Reading comprehension", readD: "Photograph or paste a text, tap unclear words, then check you understood.",
    test: "Getting ready for a test", testD: "An exam, a course or work? Paste the words and practise until the day.",
    dict: "Dictation", dictD: "Hear a word and write it, in English or Hebrew.",
    lang: "Learning a language", langD: "Hebrew, word by word, with a picture, sound and a translation.",
    back: "All practice", home: "Back to practice", gate: "Practice comes with Gadit Individual and Family.",
  },
  he: {
    nav: "תרגולים", sub: "בחרו מה מתרגלים היום.",
    read: "קריאה עם בדיקת הבנה", readD: "צלמו או הדביקו טקסט, לחצו על מילים לא ברורות ובסוף בדקו שהבנתם.",
    test: "מתכוננים למבחן", testD: "פסיכומטרי, מבחן באנגלית או עבודה? הדביקו את המילים ותרגלו עד היום עצמו.",
    dict: "הכתבה", dictD: "שומעים מילה וכותבים אותה, בעברית או באנגלית.",
    lang: "לומדים שפה", langD: "אנגלית, מילה אחר מילה, עם תמונה, קול ותרגום.",
    back: "כל התרגולים", home: "חזרה לתרגולים", gate: "התרגולים זמינים במנויים Individual ו-Family.",
  },
  ar: {
    nav: "تمارين", sub: "اختاروا ما تتدربون عليه اليوم.",
    read: "فهم المقروء", readD: "صوّروا نصًا أو الصقوه، اضغطوا على الكلمات غير الواضحة ثم تحققوا من فهمكم.",
    test: "الاستعداد للامتحان", testD: "بسيكومتري، امتحان إنجليزي أو عمل؟ الصقوا الكلمات وتدربوا حتى اليوم نفسه.",
    dict: "الإملاء", dictD: "نسمع كلمة ونكتبها، بالعربية أو بالإنجليزية.",
    lang: "تعلّم لغة", langD: "الإنجليزية أو العبرية، كلمة بكلمة، مع صورة وصوت وترجمة.",
    back: "كل التمارين", home: "العودة إلى التمارين", gate: "التمارين متاحة في اشتراكَي Individual وFamily.",
  },
  ru: {
    nav: "Упражнения", sub: "Выберите, что тренируем сегодня.",
    read: "Чтение с пониманием", readD: "Сфотографируйте или вставьте текст, нажмите на непонятные слова и проверьте себя.",
    test: "Готовимся к экзамену", testD: "Психометрия, экзамен или работа? Вставьте слова и тренируйтесь до самого дня.",
    dict: "Диктант", dictD: "Слушаем слово и пишем его, по-русски или по-английски.",
    lang: "Учим язык", langD: "Английский или иврит, слово за словом, с картинкой, звуком и переводом.",
    back: "Все упражнения", home: "Назад к упражнениям", gate: "Упражнения входят в подписки Individual и Family.",
  },
  es: {
    nav: "Ejercicios", sub: "Elige qué practicar hoy.",
    read: "Comprensión lectora", readD: "Fotografía o pega un texto, toca las palabras dudosas y comprueba que lo entendiste.",
    test: "Preparar un examen", testD: "¿Un examen, un curso o el trabajo? Pega las palabras y practica hasta el día.",
    dict: "Dictado", dictD: "Escucha una palabra y escríbela, en español o en inglés.",
    lang: "Aprender un idioma", langD: "Inglés, palabra por palabra, con imagen, sonido y traducción.",
    back: "Todos los ejercicios", home: "Volver a los ejercicios", gate: "Los ejercicios están incluidos en Gadit Individual y Family.",
  },
  pt: {
    nav: "Exercícios", sub: "Escolha o que praticar hoje.",
    read: "Compreensão de leitura", readD: "Fotografe ou cole um texto, toque nas palavras difíceis e confira se entendeu.",
    test: "Preparar para a prova", testD: "Uma prova, um curso ou o trabalho? Cole as palavras e pratique até o dia.",
    dict: "Ditado", dictD: "Ouça uma palavra e escreva, em português ou em inglês.",
    lang: "Aprender um idioma", langD: "Inglês, palavra por palavra, com imagem, som e tradução.",
    back: "Todos os exercícios", home: "Voltar aos exercícios", gate: "Os exercícios fazem parte do Gadit Individual e Family.",
  },
  fr: {
    nav: "Exercices", sub: "Choisissez ce que vous travaillez aujourd'hui.",
    read: "Lecture et compréhension", readD: "Photographiez ou collez un texte, touchez les mots flous, puis vérifiez que vous avez compris.",
    test: "Préparer un examen", testD: "Un examen, une formation ou le travail ? Collez les mots et entraînez-vous jusqu'au jour J.",
    dict: "Dictée", dictD: "Écoutez un mot et écrivez-le, en français ou en anglais.",
    lang: "Apprendre une langue", langD: "L'anglais, mot après mot, avec une image, le son et la traduction.",
    back: "Tous les exercices", home: "Retour aux exercices", gate: "Les exercices sont inclus dans Gadit Individual et Family.",
  },
  de: {
    nav: "Übungen", sub: "Wählen Sie, was Sie heute üben.",
    read: "Leseverstehen", readD: "Text fotografieren oder einfügen, unklare Wörter antippen, dann das Verständnis prüfen.",
    test: "Für eine Prüfung lernen", testD: "Prüfung, Kurs oder Beruf? Wörter einfügen und bis zum Tag üben.",
    dict: "Diktat", dictD: "Ein Wort hören und aufschreiben, auf Deutsch oder Englisch.",
    lang: "Eine Sprache lernen", langD: "Englisch, Wort für Wort, mit Bild, Ton und Übersetzung.",
    back: "Alle Übungen", home: "Zurück zu den Übungen", gate: "Die Übungen gehören zu Gadit Individual und Family.",
  },
  cs: {
    nav: "Cvičení", sub: "Vyberte, co dnes procvičíte.",
    read: "Čtení s porozuměním", readD: "Vyfoťte nebo vložte text, klepněte na nejasná slova a ověřte si, že rozumíte.",
    test: "Příprava na zkoušku", testD: "Zkouška, kurz nebo práce? Vložte slova a procvičujte až do toho dne.",
    dict: "Diktát", dictD: "Uslyšíte slovo a napíšete ho, česky nebo anglicky.",
    lang: "Učíme se jazyk", langD: "Angličtina slovo po slově, s obrázkem, zvukem a překladem.",
    back: "Všechna cvičení", home: "Zpět na cvičení", gate: "Cvičení jsou součástí Gadit Individual a Family.",
  },
  sk: {
    nav: "Cvičenia", sub: "Vyberte, čo dnes precvičíte.",
    read: "Čítanie s porozumením", readD: "Odfoťte alebo vložte text, ťuknite na nejasné slová a overte si, že rozumiete.",
    test: "Príprava na skúšku", testD: "Skúška, kurz alebo práca? Vložte slová a precvičujte až do toho dňa.",
    dict: "Diktát", dictD: "Počujete slovo a napíšete ho, po slovensky alebo po anglicky.",
    lang: "Učíme sa jazyk", langD: "Angličtina slovo po slove, s obrázkom, zvukom a prekladom.",
    back: "Všetky cvičenia", home: "Späť na cvičenia", gate: "Cvičenia sú súčasťou Gadit Individual a Family.",
  },
  it: {
    nav: "Esercizi", sub: "Scegliete cosa esercitare oggi.",
    read: "Comprensione del testo", readD: "Fotografate o incollate un testo, toccate le parole poco chiare e verificate di aver capito.",
    test: "Prepararsi a un esame", testD: "Un esame, un corso o il lavoro? Incollate le parole ed esercitatevi fino al giorno.",
    dict: "Dettato", dictD: "Ascoltate una parola e scrivetela, in italiano o in inglese.",
    lang: "Imparare una lingua", langD: "Inglese, parola per parola, con immagine, suono e traduzione.",
    back: "Tutti gli esercizi", home: "Torna agli esercizi", gate: "Gli esercizi sono inclusi in Gadit Individual e Family.",
  },
  ja: {
    nav: "練習メニュー", sub: "今日練習するものを選びましょう。",
    read: "読解", readD: "文章を撮影するか貼り付けて、わからない単語をタップし、理解できたか確かめます。",
    test: "試験対策", testD: "試験、講座、仕事？単語を貼り付けて、当日まで練習しましょう。",
    dict: "書き取り", dictD: "単語を聞いて書きます。日本語でも英語でも。",
    lang: "言語を学ぶ", langD: "英語を一語ずつ、画像と音声と訳つきで。",
    back: "練習メニューの一覧", home: "練習メニューにもどる", gate: "練習メニューは Gadit Individual と Family で使えます。",
  },
  hi: {
    nav: "अभ्यास", sub: "चुनिए कि आज क्या अभ्यास करना है।",
    read: "पढ़कर समझना", readD: "पाठ की फ़ोटो लीजिए या चिपकाइए, अस्पष्ट शब्दों पर टैप कीजिए, फिर अपनी समझ जाँचिए।",
    test: "परीक्षा की तैयारी", testD: "परीक्षा, कोर्स या काम? शब्द चिपकाइए और उसी दिन तक अभ्यास कीजिए।",
    dict: "श्रुतलेख", dictD: "शब्द सुनिए और लिखिए, हिंदी या अंग्रेज़ी में।",
    lang: "भाषा सीखना", langD: "अंग्रेज़ी, शब्द दर शब्द, चित्र, आवाज़ और अनुवाद के साथ।",
    back: "सारे अभ्यास", home: "अभ्यास पर लौटें", gate: "अभ्यास Gadit Individual और Family में शामिल है।",
  },
  am: {
    nav: "ልምምዶች", sub: "ዛሬ ምን እንደምትለማመዱ ምረጡ።",
    read: "ንባብና መረዳት", readD: "ጽሑፍ ፎቶ አንሱ ወይም ለጥፉ፣ ያልገቡአችሁን ቃላት ንኩ፣ ከዚያ መረዳታችሁን አረጋግጡ።",
    test: "ለፈተና መዘጋጀት", testD: "ፈተና፣ ኮርስ ወይስ ሥራ? ቃላቱን ለጥፉና እስከ ቀኑ ተለማመዱ።",
    dict: "ቃላት መጻፍ", dictD: "ቃል ሰምቶ መጻፍ፣ በአማርኛ ወይም በእንግሊዝኛ።",
    lang: "ቋንቋ መማር", langD: "እንግሊዝኛ፣ ቃል በቃል፣ ከምስል፣ ከድምፅና ከትርጉም ጋር።",
    back: "ሁሉም ልምምዶች", home: "ወደ ልምምዶች ተመለሱ", gate: "ልምምዶቹ በGadit Individual እና Family ውስጥ ይገኛሉ።",
  },
  uk: {
    nav: "Вправи", sub: "Оберіть, що тренуємо сьогодні.",
    read: "Читання з розумінням", readD: "Сфотографуйте або вставте текст, натисніть на незрозумілі слова й перевірте себе.",
    test: "Готуємося до іспиту", testD: "Іспит, курс чи робота? Вставте слова й тренуйтеся до самого дня.",
    dict: "Диктант", dictD: "Слухаємо слово й пишемо його, українською або англійською.",
    lang: "Вчимо мову", langD: "Англійська, слово за словом, з картинкою, звуком і перекладом.",
    back: "Усі вправи", home: "Назад до вправ", gate: "Вправи входять до підписок Individual і Family.",
  },
  tr: {
    nav: "Alıştırmalar", sub: "Bugün ne çalışacağınızı seçin.",
    read: "Okuduğunu anlama", readD: "Bir metni çekin ya da yapıştırın, anlaşılmayan kelimelere dokunun, sonra anladığınızı kontrol edin.",
    test: "Sınava hazırlanmak", testD: "Sınav, kurs ya da iş mi? Kelimeleri yapıştırın ve o güne kadar çalışın.",
    dict: "Dikte", dictD: "Bir kelimeyi dinleyin ve yazın, Türkçe ya da İngilizce.",
    lang: "Dil öğrenmek", langD: "İngilizce, kelime kelime, resim, ses ve çeviriyle.",
    back: "Tüm alıştırmalar", home: "Alıştırmalara dön", gate: "Alıştırmalar Gadit Individual ve Family'ye dahildir.",
  },
  pl: {
    nav: "Ćwiczenia", sub: "Wybierzcie, co dziś ćwiczymy.",
    read: "Czytanie ze zrozumieniem", readD: "Zróbcie zdjęcie tekstu albo go wklejcie, dotknijcie niejasnych słów i sprawdźcie się.",
    test: "Przygotowanie do egzaminu", testD: "Egzamin, kurs czy praca? Wklejcie słowa i ćwiczcie aż do tego dnia.",
    dict: "Dyktando", dictD: "Słuchamy słowa i je zapisujemy, po polsku albo po angielsku.",
    lang: "Nauka języka", langD: "Angielski, słowo po słowie, z obrazkiem, dźwiękiem i tłumaczeniem.",
    back: "Wszystkie ćwiczenia", home: "Wróć do ćwiczeń", gate: "Ćwiczenia są częścią Gadit Individual i Family.",
  },
  fa: {
    nav: "تمرین‌ها", sub: "انتخاب کنید امروز چه چیزی را تمرین می‌کنید.",
    read: "درک مطلب", readD: "از متن عکس بگیرید یا آن را بچسبانید، روی واژه‌های نامفهوم بزنید و فهم خود را بسنجید.",
    test: "آمادگی برای آزمون", testD: "آزمون، دوره یا کار؟ واژه‌ها را بچسبانید و تا همان روز تمرین کنید.",
    dict: "دیکته", dictD: "واژه را بشنوید و بنویسید، به فارسی یا به انگلیسی.",
    lang: "یادگیری زبان", langD: "انگلیسی، واژه به واژه، با تصویر، صدا و ترجمه.",
    back: "همه تمرین‌ها", home: "بازگشت به تمرین‌ها", gate: "تمرین‌ها در اشتراک‌های Individual و Family هستند.",
  },
  id: {
    nav: "Latihan", sub: "Pilih apa yang mau dilatih hari ini.",
    read: "Membaca dan memahami", readD: "Foto atau tempel teks, ketuk kata yang belum jelas, lalu cek pemahamanmu.",
    test: "Bersiap untuk ujian", testD: "Ujian, kursus, atau pekerjaan? Tempel katanya dan berlatih sampai harinya.",
    dict: "Dikte", dictD: "Dengar sebuah kata lalu tulis, dalam bahasa Indonesia atau Inggris.",
    lang: "Belajar bahasa", langD: "Bahasa Inggris, kata demi kata, dengan gambar, suara, dan terjemahan.",
    back: "Semua latihan", home: "Kembali ke latihan", gate: "Latihan termasuk dalam Gadit Individual dan Family.",
  },
  nl: {
    nav: "Oefeningen", sub: "Kies wat je vandaag oefent.",
    read: "Begrijpend lezen", readD: "Fotografeer of plak een tekst, tik op onduidelijke woorden en check of je het begrijpt.",
    test: "Voorbereiden op een examen", testD: "Een examen, een cursus of je werk? Plak de woorden en oefen tot de dag zelf.",
    dict: "Dictee", dictD: "Hoor een woord en schrijf het op, in het Nederlands of het Engels.",
    lang: "Een taal leren", langD: "Engels, woord voor woord, met een plaatje, geluid en een vertaling.",
    back: "Alle oefeningen", home: "Terug naar de oefeningen", gate: "De oefeningen horen bij Gadit Individual en Family.",
  },
  el: {
    nav: "Ασκήσεις", sub: "Διαλέξτε τι θα εξασκήσετε σήμερα.",
    read: "Κατανόηση κειμένου", readD: "Φωτογραφίστε ή επικολλήστε ένα κείμενο, πατήστε τις άγνωστες λέξεις και ελέγξτε ότι καταλάβατε.",
    test: "Προετοιμασία για εξετάσεις", testD: "Εξετάσεις, σεμινάριο ή δουλειά; Επικολλήστε τις λέξεις και εξασκηθείτε μέχρι τη μέρα.",
    dict: "Υπαγόρευση", dictD: "Ακούτε μια λέξη και τη γράφετε, στα ελληνικά ή στα αγγλικά.",
    lang: "Μαθαίνουμε μια γλώσσα", langD: "Αγγλικά, λέξη προς λέξη, με εικόνα, ήχο και μετάφραση.",
    back: "Όλες οι ασκήσεις", home: "Πίσω στις ασκήσεις", gate: "Οι ασκήσεις περιλαμβάνονται στο Gadit Individual και στο Family.",
  },
  zu: {
    nav: "Ukuzijwayeza", sub: "Khethani enizozijwayeza khona namuhla.",
    read: "Ukufunda nokuqonda", readD: "Thwebulani noma nifake umbhalo, nithinte amagama angacacile, bese nihlola ukuqonda.",
    test: "Ukulungiselela ukuhlolwa", testD: "Ukuhlolwa, isifundo noma umsebenzi? Fakani amagama nizijwayeze kuze kube usuku.",
    dict: "Ukubhala okushiwoyo", dictD: "Lalelani igama bese nilibhala, ngesiZulu noma ngesiNgisi.",
    lang: "Ukufunda ulimi", langD: "IsiNgisi, igama ngegama, nesithombe, umsindo nokuhunyushwa.",
    back: "Konke ukuzijwayeza", home: "Buyela ekuzijwayezeni", gate: "Ukuzijwayeza kuyingxenye ye-Gadit Individual ne-Family.",
  },
  xh: {
    nav: "Ukuziqhelisa", sub: "Khethani eniza kuziqhelisa ngayo namhlanje.",
    read: "Ukufunda nokuqonda", readD: "Fotani okanye nincamathisele umbhalo, nichukumise amagama angacacanga, nize nijonge ukuqonda.",
    test: "Ukulungiselela uviwo", testD: "Uviwo, ikhosi okanye umsebenzi? Ncamathiselani amagama niziqhelise de kufike usuku.",
    dict: "Ukubhala okuthethwayo", dictD: "Mamelani igama nize nilibhale, ngesiXhosa okanye ngesiNgesi.",
    lang: "Ukufunda ulwimi", langD: "IsiNgesi, igama ngegama, nomfanekiso, isandi nenguqulelo.",
    back: "Konke ukuziqhelisa", home: "Buyela ekuziqheliseni", gate: "Ukuziqhelisa kuyinxalenye ye-Gadit Individual ne-Family.",
  },
  nso: {
    nav: "Ditlwaetšo", sub: "Kgethang seo le tlago go se itlwaetša lehono.",
    read: "Go bala le go kwešiša", readD: "Tšeang seswantšho goba le kgomaretše sengwalwa, le kgome mantšu a sa kwagalego, ke moka le lekole kwešišo.",
    test: "Go itokišetša tlhahlobo", testD: "Tlhahlobo, thuto goba mošomo? Kgomaretšang mantšu gomme le itlwaetše go fihla ka letšatši leo.",
    dict: "Go ngwala seo se bolelwago", dictD: "Theeletšang lentšu gomme le le ngwale, ka Sepedi goba ka Seisemane.",
    lang: "Go ithuta polelo", langD: "Seisemane, lentšu ka lentšu, ka seswantšho, modumo le phetolelo.",
    back: "Ditlwaetšo ka moka", home: "Boela ditlwaetšong", gate: "Ditlwaetšo ke karolo ya Gadit Individual le Family.",
  },
  tn: {
    nav: "Boikatiso", sub: "Tlhophang se lo tla se ikatisang gompieno.",
    read: "Go bala le go tlhaloganya", readD: "Tsayang setshwantsho kgotsa lo kgomaretse mokwalo, lo ame mafoko a a sa tlhaloganyesegeng, morago lo tlhole.",
    test: "Go ipaakanyetsa tlhatlhobo", testD: "Tlhatlhobo, thuto kgotsa tiro? Kgomaretsang mafoko mme lo ikatise go fitlha ka letsatsi leo.",
    dict: "Go kwala se se buiwang", dictD: "Reetsang lefoko mme lo le kwale, ka Setswana kgotsa ka Sekgoa.",
    lang: "Go ithuta puo", langD: "Sekgoa, lefoko ka lefoko, ka setshwantsho, modumo le thanolo.",
    back: "Boikatiso jotlhe", home: "Boela kwa boikatisong", gate: "Boikatiso ke karolo ya Gadit Individual le Family.",
  },
  st: {
    nav: "Boikwetliso", sub: "Kgethang seo le tla se ikwetlisa kajeno.",
    read: "Ho bala le ho utlwisisa", readD: "Nkang setshwantsho kapa le kgomarele mongolo, le tobetse mantswe a sa hlakang, ebe le hlahloba kutlwisiso.",
    test: "Ho itokisetsa tlhahlobo", testD: "Tlhahlobo, thupelo kapa mosebetsi? Kgomarelang mantswe mme le ikwetlise ho fihlela ka letsatsi leo.",
    dict: "Ho ngola se buuwang", dictD: "Mamelang lentswe mme le le ngole, ka Sesotho kapa ka Senyesemane.",
    lang: "Ho ithuta puo", langD: "Senyesemane, lentswe ka lentswe, ka setshwantsho, modumo le phetolelo.",
    back: "Boikwetliso bohle", home: "Kgutlela boikwetlisong", gate: "Boikwetliso ke karolo ya Gadit Individual le Family.",
  },
  ts: {
    nav: "Ntoloveto", sub: "Hlawulani leswi mi nga ta titoloveta swona namuntlha.",
    read: "Ku hlaya ni ku twisisa", readD: "Tekani xifaniso kumbe mi namarheta tsalwa, mi khumba marito lama nga twisisekiki, kutani mi kambela.",
    test: "Ku tilunghiselela xikambelo", testD: "Xikambelo, khoso kumbe ntirho? Namarhetani marito mi titoloveta ku fikela siku rero.",
    dict: "Ku tsala leswi vuriwaka", dictD: "Yingisani rito mi ri tsala, hi Xitsonga kumbe hi Xinghezi.",
    lang: "Ku dyondza ririmi", langD: "Xinghezi, rito hi rito, hi xifaniso, mpfumawulo ni vuhundzuluxi.",
    back: "Ntoloveto hinkwayo", home: "Tlhelela eka ntoloveto", gate: "Ntoloveto i xiphemu xa Gadit Individual na Family.",
  },
  ss: {
    nav: "Kuticecesha", sub: "Khetsani lenitawuticecesha kona lamuhla.",
    read: "Kufundza nekucondza", readD: "Tsatsani sitfombe nome ninamatsisele umbhalo, nitsintse emagama langacaci, bese nihlola kucondza.",
    test: "Kulungiselela kuhlolwa", testD: "Kuhlolwa, sifundvo nome umsebenti? Namatsiselani emagama niticecesha kuze kube lilanga lelo.",
    dict: "Kubhala lokushiwoko", dictD: "Lalelani ligama nilibhale, ngesiSwati nome ngesiNgisi.",
    lang: "Kufundza lulwimi", langD: "SiNgisi, ligama ngeligama, nesitfombe, umsindvo nekuhumusha.",
    back: "Konkhe kuticecesha", home: "Buyela ekuticecesheni", gate: "Kuticecesha kuyincenye ye-Gadit Individual ne-Family.",
  },
  ve: {
    nav: "Nḓowelo", sub: "Khethani zwine na ḓo ḓiḓowedza zwone ṋamusi.",
    read: "U vhala na u pfesesa", readD: "Dzhiani tshifanyiso kana ni nambatedze maṅwalwa, ni kwame maipfi a sa pfesesei, nga murahu ni ṱole.",
    test: "U ḓilugisela ndingo", testD: "Ndingo, khoso kana mushumo? Nambatedzani maipfi ni ḓiḓowedze u swika ḓuvha ḽeneḽo.",
    dict: "U ṅwala zwine zwa ambiwa", dictD: "Pfani ipfi ni ḽi ṅwale, nga Tshivenḓa kana nga Luisimane.",
    lang: "U guda luambo", langD: "Luisimane, ipfi nga ipfi, na tshifanyiso, mubvumo na ṱhalutshedzo.",
    back: "Nḓowelo dzoṱhe", home: "Humelani kha nḓowelo", gate: "Nḓowelo ndi tshipiḓa tsha Gadit Individual na Family.",
  },
  nr: {
    nav: "Ukuzilolonga", sub: "Khethani enizokuzilolonga ngakho namhlanje.",
    read: "Ukufunda nokuzwisisa", readD: "Thathani isithombe namkha ninamathisele umtlolo, nithinte amagama angakacaci, bese nihlola ukuzwisisa.",
    test: "Ukulungiselela ukuhlolwa", testD: "Ukuhlolwa, isifundo namkha umsebenzi? Namathiselani amagama nizilolonge bekube lilanga lelo.",
    dict: "Ukutlola okutjhiwoko", dictD: "Lalelani ilizwi nilitlole, ngesiNdebele namkha ngesiNgisi.",
    lang: "Ukufunda ilimi", langD: "IsiNgisi, ilizwi ngelizwi, nesithombe, umsindo nokutjhugululwa.",
    back: "Koke ukuzilolonga", home: "Buyelani ekuzilolongeni", gate: "Ukuzilolonga kuyingcenye ye-Gadit Individual ne-Family.",
  },
  vi: {
    nav: "Luyện tập", sub: "Chọn nội dung luyện tập hôm nay.",
    read: "Đọc hiểu", readD: "Chụp hoặc dán đoạn văn, chạm vào từ chưa rõ, rồi kiểm tra xem mình đã hiểu chưa.",
    test: "Ôn thi", testD: "Kỳ thi, khóa học hay công việc? Dán các từ và luyện tập đến đúng ngày.",
    dict: "Chính tả", dictD: "Nghe một từ và viết lại, bằng tiếng Việt hoặc tiếng Anh.",
    lang: "Học ngoại ngữ", langD: "Tiếng Anh, từng từ một, có hình ảnh, âm thanh và bản dịch.",
    back: "Tất cả bài luyện tập", home: "Quay lại luyện tập", gate: "Phần luyện tập có trong Gadit Individual và Family.",
  },
  fil: {
    nav: "Pagsasanay", sub: "Piliin kung ano ang sasanayin ngayon.",
    read: "Pag-unawa sa binasa", readD: "Kunan ng litrato o i-paste ang teksto, i-tap ang mga salitang hindi malinaw, saka tingnan kung naintindihan mo.",
    test: "Paghahanda para sa pagsusulit", testD: "Pagsusulit, kurso o trabaho? I-paste ang mga salita at magsanay hanggang sa araw na iyon.",
    dict: "Dikta", dictD: "Pakinggan ang salita at isulat ito, sa Filipino o sa Ingles.",
    lang: "Pag-aaral ng wika", langD: "Ingles, salita por salita, may larawan, tunog at salin.",
    back: "Lahat ng pagsasanay", home: "Bumalik sa pagsasanay", gate: "Kasama ang pagsasanay sa Gadit Individual at Family.",
  },
  af: {
    nav: "Oefeninge", sub: "Kies wat julle vandag oefen.",
    read: "Leesbegrip", readD: "Neem 'n foto van 'n teks of plak dit, tik op onduidelike woorde en kyk of julle dit verstaan.",
    test: "Voorberei vir 'n toets", testD: "'n Eksamen, 'n kursus of die werk? Plak die woorde en oefen tot die dag self.",
    dict: "Diktee", dictD: "Hoor 'n woord en skryf dit, in Afrikaans of Engels.",
    lang: "Leer 'n taal", langD: "Engels, woord vir woord, met 'n prentjie, klank en 'n vertaling.",
    back: "Alle oefeninge", home: "Terug na die oefeninge", gate: "Die oefeninge is deel van Gadit Individual en Family.",
  },
  sw: {
    nav: "Mazoezi", sub: "Chagueni mtakachofanyia mazoezi leo.",
    read: "Ufahamu wa kusoma", readD: "Pigeni picha au bandikeni maandishi, gusani maneno yasiyo wazi, kisha pimeni uelewa wenu.",
    test: "Kujiandaa kwa mtihani", testD: "Mtihani, kozi au kazi? Bandikeni maneno na fanyeni mazoezi hadi siku hiyo.",
    dict: "Imla", dictD: "Sikilizeni neno na kuliandika, kwa Kiswahili au kwa Kiingereza.",
    lang: "Kujifunza lugha", langD: "Kiingereza, neno kwa neno, pamoja na picha, sauti na tafsiri.",
    back: "Mazoezi yote", home: "Rudi kwenye mazoezi", gate: "Mazoezi ni sehemu ya Gadit Individual na Family.",
  },
  "zh-CN": {
    nav: "练习", sub: "选择今天要练习的内容。",
    read: "阅读理解", readD: "拍下或粘贴一段文字，点击不明白的词，最后检查自己是否读懂。",
    test: "备考", testD: "考试、课程还是工作？粘贴单词，一直练到那一天。",
    dict: "听写", dictD: "听一个词并写下来，用中文或英文。",
    lang: "学一门语言", langD: "英语，一词一词地学，配有图片、发音和翻译。",
    back: "全部练习", home: "返回练习", gate: "练习包含在 Gadit Individual 和 Family 中。",
  },
  "zh-TW": {
    nav: "練習", sub: "選擇今天要練習的內容。",
    read: "閱讀理解", readD: "拍下或貼上一段文字，點選不懂的詞，最後檢查自己是否讀懂。",
    test: "準備考試", testD: "考試、課程還是工作？貼上單字，一直練到那一天。",
    dict: "聽寫", dictD: "聽一個詞並寫下來，用中文或英文。",
    lang: "學一種語言", langD: "英文，一詞一詞地學，附有圖片、發音和翻譯。",
    back: "全部練習", home: "返回練習", gate: "練習包含在 Gadit Individual 和 Family 中。",
  },
  ko: {
    nav: "연습", sub: "오늘 연습할 것을 고르세요.",
    read: "독해", readD: "글을 찍거나 붙여 넣고, 모르는 단어를 누른 뒤 이해했는지 확인하세요.",
    test: "시험 준비", testD: "시험, 강좌, 업무? 단어를 붙여 넣고 그날까지 연습하세요.",
    dict: "받아쓰기", dictD: "단어를 듣고 써 보세요. 한국어나 영어로.",
    lang: "언어 배우기", langD: "영어를 한 단어씩, 그림과 소리, 번역과 함께.",
    back: "모든 연습", home: "연습으로 돌아가기", gate: "연습은 Gadit Individual과 Family에 포함되어 있어요.",
  },
  th: {
    nav: "แบบฝึกหัด", sub: "เลือกสิ่งที่จะฝึกวันนี้",
    read: "อ่านจับใจความ", readD: "ถ่ายรูปหรือวางข้อความ แตะคำที่ไม่เข้าใจ แล้วตรวจว่าเข้าใจแล้ว",
    test: "เตรียมสอบ", testD: "สอบ คอร์สเรียน หรืองาน? วางคำศัพท์แล้วฝึกไปจนถึงวันนั้น",
    dict: "เขียนตามคำบอก", dictD: "ฟังคำแล้วเขียน เป็นภาษาไทยหรือภาษาอังกฤษ",
    lang: "เรียนภาษา", langD: "ภาษาอังกฤษ ทีละคำ พร้อมภาพ เสียง และคำแปล",
    back: "แบบฝึกหัดทั้งหมด", home: "กลับไปที่แบบฝึกหัด", gate: "แบบฝึกหัดมีให้ใน Gadit Individual และ Family",
  },
  bn: {
    nav: "অনুশীলন", sub: "আজ কী অনুশীলন করবেন বেছে নিন।",
    read: "পড়ে বোঝা", readD: "লেখার ছবি তুলুন বা পেস্ট করুন, অস্পষ্ট শব্দে ট্যাপ করুন, তারপর বোঝা যাচাই করুন।",
    test: "পরীক্ষার প্রস্তুতি", testD: "পরীক্ষা, কোর্স নাকি কাজ? শব্দগুলো পেস্ট করুন আর সেই দিন পর্যন্ত অনুশীলন করুন।",
    dict: "শ্রুতলিপি", dictD: "একটি শব্দ শুনে লিখুন, বাংলায় বা ইংরেজিতে।",
    lang: "ভাষা শেখা", langD: "ইংরেজি, শব্দে শব্দে, ছবি, উচ্চারণ আর অনুবাদসহ।",
    back: "সব অনুশীলন", home: "অনুশীলনে ফিরুন", gate: "অনুশীলন Gadit Individual ও Family-তে আছে।",
  },
  da: {
    nav: "Øvelser", sub: "Vælg, hvad I vil øve i dag.",
    read: "Læseforståelse", readD: "Tag et billede af en tekst eller indsæt den, tryk på uklare ord, og tjek så, at I har forstået den.",
    test: "Forberedelse til en prøve", testD: "En eksamen, et kursus eller arbejdet? Indsæt ordene, og øv jer frem til dagen.",
    dict: "Diktat", dictD: "Hør et ord, og skriv det, på dansk eller engelsk.",
    lang: "Lær et sprog", langD: "Engelsk, ord for ord, med billede, lyd og oversættelse.",
    back: "Alle øvelser", home: "Tilbage til øvelserne", gate: "Øvelserne er en del af Gadit Individual og Family.",
  },
  hu: {
    nav: "Gyakorlatok", sub: "Válaszd ki, mit gyakorolsz ma.",
    read: "Szövegértés", readD: "Fotózz le vagy illessz be egy szöveget, koppints a nem világos szavakra, aztán ellenőrizd magad.",
    test: "Felkészülés egy vizsgára", testD: "Vizsga, tanfolyam vagy munka? Illeszd be a szavakat, és gyakorolj a vizsga napjáig.",
    dict: "Tollbamondás", dictD: "Hallgass meg egy szót, és írd le, magyarul vagy angolul.",
    lang: "Nyelvtanulás", langD: "Angol, szóról szóra, képpel, hanggal és fordítással.",
    back: "Összes gyakorlat", home: "Vissza a gyakorlatokhoz", gate: "A gyakorlatok a Gadit Individual és Family része.",
  },
};

export function practiceCopy(lang: string): PracticeCopy {
  return PRACTICE_COPY[lang] ?? PRACTICE_COPY.en;
}

/** The top-menu label, every UI language (same word as the page title). */
export function practiceNav(lang: string): string {
  return practiceCopy(lang).nav;
}

/**
 * Dictation and test prep are Family tools (individual-prices.ts: "the
 * child-facing tools ... dictation practice ... belong to Family"), so an
 * Individual subscriber's Practice shows reading and language learning only.
 * Flip this to give Individual all four cards (the APIs behind them check
 * only that the person is signed in).
 */
export const PRACTICE_DICTATION_FOR_INDIVIDUAL = true;

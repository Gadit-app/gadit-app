"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useHref } from "@/lib/href";
import { isParentRole, type FamilyMember } from "@/lib/family";

/**
 * First-steps checklist for a brand-new Family owner. Gadi 2026-08-03: on
 * signup a parent should see a short, unmistakable list of the first things
 * to do — (1) connect the second parent, (2) connect the kids, (3) save
 * Gadit to the home screen. The Family welcome email links straight here.
 *
 * Completion is auto-detected from the roster (a second parent exists, a
 * child exists) and, for the home-screen step, from display-mode +
 * localStorage. The card hides itself once all three are done or the owner
 * dismisses it, so it never nags a set-up family.
 */

const DISMISS_KEY = "gadit_family_checklist_dismissed_v1";
const HOMESCREEN_KEY = "gadit_family_homescreen_done_v1";

type Copy = {
  title: string;
  subtitle: string;
  step1: string;
  step1sub: string;
  step2: string;
  step2sub: string;
  step3: string;
  step3sub: string;
  cta: string;
  add: string;
  homeHelp: string;
  markDone: string;
  dismiss: string;
  done: string;
};

const COPY: Record<string, Copy> = {
  he: {
    title: "צעדים ראשונים",
    subtitle: "שלושה דברים קטנים כדי שכל המשפחה תהיה מוכנה.",
    step1: "לחבר את ההורה השני",
    step1sub: "כדי שגם ההורה השני יראה את ההתקדמות של הילדים.",
    step2: "לחבר את הילדים",
    step2sub: "לכל ילד מכשיר משלו, בלי סיסמה, עם קוד חיבור פשוט.",
    step3: "לשמור את Gadit בהישג יד",
    step3sub: "בטלפון על מסך הבית, במחשב במועדפים, כדי שזה תמיד יהיה קרוב.",
    cta: "איך",
    add: "הוספה",
    homeHelp: "בטלפון: בתפריט הדפדפן בוחרים \"הוספה למסך הבית\". במחשב: מוסיפים למועדפים (סימן הכוכב בשורת הכתובת), או מתקינים דרך סמל ההתקנה שמופיע בשורת הכתובת.",
    markDone: "סימון כבוצע",
    dismiss: "אפשר להסתיר",
    done: "בוצע",
  },
  en: {
    title: "First steps",
    subtitle: "Three small things to get the whole family set up.",
    step1: "Connect the second parent",
    step1sub: "So both parents can follow the kids' progress.",
    step2: "Connect the kids",
    step2sub: "Each child gets their own device, no password, just a short pairing code.",
    step3: "Keep Gadit within reach",
    step3sub: "On a phone, on the home screen. On a computer, in your bookmarks. So it's always close.",
    cta: "How",
    add: "Add",
    homeHelp: "On a phone: in the browser menu choose \"Add to Home Screen\". On a computer: add it to your bookmarks (the star in the address bar), or install it via the install icon in the address bar.",
    markDone: "Mark as done",
    dismiss: "Hide this",
    done: "Done",
  },
  zu: {
    title: "Izinyathelo zokuqala",
    subtitle: "Izinto ezintathu ezincane zokulungiselela wonke umndeni.",
    step1: "Xhuma umzali wesibili",
    step1sub: "Ukuze bobabili abazali balandele inqubekela phambili yezingane.",
    step2: "Xhuma izingane",
    step2sub: "Ingane ngayinye ithola idivayisi yayo, ngaphandle kwephasiwedi, ikhodi yokuxhuma emfushane nje.",
    step3: "Gcina i-Gadit iseduze kwakho",
    step3sub: "Efonini, esikrinini sasekhaya. Ekhompyutheni, kumabhukhimakhi akho. Ukuze ihlale iseduze.",
    cta: "Kanjani",
    add: "Engeza",
    homeHelp: "Efonini: kumenyu yesiphequluli khetha \"Engeza Esikrinini Sasekhaya\". Ekhompyutheni: yengeze kumabhukhimakhi akho (inkanyezi emgqeni wekheli), noma uyifake ngesithonjana sokufaka esisemgqeni wekheli.",
    markDone: "Maka njengokuqediwe",
    dismiss: "Fihla lokhu",
    done: "Kwenziwe",
  },
  el: {
    title: "Πρώτα βήματα",
    subtitle: "Τρία μικρά πράγματα για να ετοιμαστεί όλη η οικογένεια.",
    step1: "Σύνδεσε τον δεύτερο γονέα",
    step1sub: "Ώστε και οι δύο γονείς να παρακολουθούν την πρόοδο των παιδιών.",
    step2: "Σύνδεσε τα παιδιά",
    step2sub: "Κάθε παιδί έχει τη δική του συσκευή, χωρίς κωδικό πρόσβασης, μόνο έναν σύντομο κωδικό σύνδεσης.",
    step3: "Κράτησε το Gadit κοντά σου",
    step3sub: "Σε κινητό, στην αρχική οθόνη. Σε υπολογιστή, στους σελιδοδείκτες σου. Ώστε να είναι πάντα κοντά.",
    cta: "Πώς",
    add: "Προσθήκη",
    homeHelp: "Σε κινητό: από το μενού του προγράμματος περιήγησης επίλεξε \"Προσθήκη στην αρχική οθόνη\". Σε υπολογιστή: πρόσθεσέ το στους σελιδοδείκτες σου (το αστέρι στη γραμμή διευθύνσεων), ή εγκατέστησέ το μέσω του εικονιδίου εγκατάστασης στη γραμμή διευθύνσεων.",
    markDone: "Σήμανση ως ολοκληρωμένο",
    dismiss: "Απόκρυψη",
    done: "Έγινε",
  },
  ar: {
    title: "الخطوات الأولى",
    subtitle: "ثلاثة أمور صغيرة لتجهيز العائلة بالكامل.",
    step1: "ربط الوالد الثاني",
    step1sub: "ليتابع كلا الوالدين تقدم الأطفال.",
    step2: "ربط الأطفال",
    step2sub: "لكل طفل جهازه الخاص، بدون كلمة مرور، فقط رمز ربط قصير.",
    step3: "احتفظ بـ Gadit في متناول يدك",
    step3sub: "على الهاتف، على الشاشة الرئيسية. على الحاسوب، في المفضلة. ليكون دائمًا قريبًا.",
    cta: "كيف",
    add: "إضافة",
    homeHelp: "على الهاتف: من قائمة المتصفح اختر \"إضافة إلى الشاشة الرئيسية\". على الحاسوب: أضفه إلى المفضلة (رمز النجمة في شريط العنوان)، أو ثبّته عبر أيقونة التثبيت في شريط العنوان.",
    markDone: "تحديد كمكتمل",
    dismiss: "إخفاء",
    done: "تم",
  },
  ru: {
    title: "Первые шаги",
    subtitle: "Три небольших действия, чтобы настроить всю семью.",
    step1: "Подключить второго родителя",
    step1sub: "Чтобы оба родителя видели прогресс детей.",
    step2: "Подключить детей",
    step2sub: "У каждого ребёнка своё устройство, без пароля, только короткий код.",
    step3: "Держите Gadit под рукой",
    step3sub: "На телефоне, на главном экране. На компьютере, в закладках. Чтобы всегда был рядом.",
    cta: "Как",
    add: "Добавить",
    homeHelp: "На телефоне: в меню браузера выберите «На главный экран». На компьютере: добавьте в закладки (звёздочка в адресной строке) или установите через значок установки в адресной строке.",
    markDone: "Отметить как выполненное",
    dismiss: "Скрыть",
    done: "Готово",
  },
  es: {
    title: "Primeros pasos",
    subtitle: "Tres pequeñas cosas para dejar lista a toda la familia.",
    step1: "Conecta al segundo progenitor",
    step1sub: "Para que ambos padres puedan seguir el progreso de los niños.",
    step2: "Conecta a los niños",
    step2sub: "Cada niño tiene su propio dispositivo, sin contraseña, solo un código de vinculación corto.",
    step3: "Ten Gadit siempre a mano",
    step3sub: "En el móvil, en la pantalla de inicio. En el ordenador, en tus marcadores. Para que siempre esté cerca.",
    cta: "Cómo",
    add: "Añadir",
    homeHelp: "En el móvil: en el menú del navegador elige \"Añadir a la pantalla de inicio\". En el ordenador: añádelo a tus marcadores (la estrella en la barra de direcciones), o instálalo mediante el icono de instalación en la barra de direcciones.",
    markDone: "Marcar como hecho",
    dismiss: "Ocultar",
    done: "Hecho",
  },
  pt: {
    title: "Primeiros passos",
    subtitle: "Três pequenas coisas para deixar toda a família pronta.",
    step1: "Conecte o segundo responsável",
    step1sub: "Para que ambos os pais possam acompanhar o progresso das crianças.",
    step2: "Conecte as crianças",
    step2sub: "Cada criança tem o seu próprio dispositivo, sem senha, apenas um código de conexão curto.",
    step3: "Mantenha o Gadit sempre por perto",
    step3sub: "No telefone, na tela inicial. No computador, nos seus favoritos. Para estar sempre por perto.",
    cta: "Como",
    add: "Adicionar",
    homeHelp: "No telefone: no menu do navegador escolha \"Adicionar à tela inicial\". No computador: adicione aos seus favoritos (a estrela na barra de endereço), ou instale pelo ícone de instalação na barra de endereço.",
    markDone: "Marcar como concluído",
    dismiss: "Ocultar",
    done: "Concluído",
  },
  fr: {
    title: "Premiers pas",
    subtitle: "Trois petites choses pour que toute la famille soit prête.",
    step1: "Connecter le second parent",
    step1sub: "Pour que les deux parents suivent les progrès des enfants.",
    step2: "Connecter les enfants",
    step2sub: "Chaque enfant a son propre appareil, sans mot de passe, juste un court code de connexion.",
    step3: "Gardez Gadit à portée de main",
    step3sub: "Sur un téléphone, sur l'écran d'accueil. Sur un ordinateur, dans vos favoris. Pour qu'il soit toujours proche.",
    cta: "Comment",
    add: "Ajouter",
    homeHelp: "Sur un téléphone : dans le menu du navigateur, choisissez \"Ajouter à l'écran d'accueil\". Sur un ordinateur : ajoutez-le à vos favoris (l'étoile dans la barre d'adresse), ou installez-le via l'icône d'installation dans la barre d'adresse.",
    markDone: "Marquer comme fait",
    dismiss: "Masquer",
    done: "Fait",
  },
  de: {
    title: "Erste Schritte",
    subtitle: "Drei kleine Dinge, damit die ganze Familie startklar ist.",
    step1: "Zweiten Elternteil verbinden",
    step1sub: "Damit beide Eltern den Fortschritt der Kinder verfolgen können.",
    step2: "Die Kinder verbinden",
    step2sub: "Jedes Kind bekommt sein eigenes Gerät, ohne Passwort, nur einen kurzen Verbindungscode.",
    step3: "Halte Gadit griffbereit",
    step3sub: "Auf dem Handy, auf dem Startbildschirm. Auf dem Computer, in deinen Lesezeichen. Damit es immer nah ist.",
    cta: "Wie",
    add: "Hinzufügen",
    homeHelp: "Auf dem Handy: Wähle im Browsermenü \"Zum Startbildschirm hinzufügen\". Auf dem Computer: Füge es zu deinen Lesezeichen hinzu (der Stern in der Adressleiste), oder installiere es über das Installationssymbol in der Adressleiste.",
    markDone: "Als erledigt markieren",
    dismiss: "Ausblenden",
    done: "Erledigt",
  },
  cs: {
    title: "První kroky",
    subtitle: "Tři malé věci, aby byla celá rodina připravená.",
    step1: "Připojte druhého rodiče",
    step1sub: "Aby oba rodiče mohli sledovat pokrok dětí.",
    step2: "Připojte děti",
    step2sub: "Každé dítě má vlastní zařízení, bez hesla, jen s krátkým propojovacím kódem.",
    step3: "Mějte Gadit po ruce",
    step3sub: "V telefonu na domovské obrazovce. V počítači v záložkách. Aby byl vždy nablízku.",
    cta: "Jak",
    add: "Přidat",
    homeHelp: "V telefonu: v nabídce prohlížeče zvolte \"Přidat na domovskou obrazovku\". V počítači: přidejte jej do záložek (hvězdička v adresním řádku), nebo jej nainstalujte přes ikonu instalace v adresním řádku.",
    markDone: "Označit jako hotové",
    dismiss: "Skrýt",
    done: "Hotovo",
  },
  sk: {
    title: "Prvé kroky",
    subtitle: "Tri malé veci, aby bola celá rodina pripravená.",
    step1: "Pripojte druhého rodiča",
    step1sub: "Aby obaja rodičia mohli sledovať pokrok detí.",
    step2: "Pripojte deti",
    step2sub: "Každé dieťa má vlastné zariadenie, bez hesla, len s krátkym prepojovacím kódom.",
    step3: "Majte Gadit poruke",
    step3sub: "V telefóne na domovskej obrazovke. V počítači v záložkách. Aby bol vždy nablízku.",
    cta: "Ako",
    add: "Pridať",
    homeHelp: "V telefóne: v ponuke prehliadača vyberte \"Pridať na domovskú obrazovku\". V počítači: pridajte ho do záložiek (hviezdička v paneli s adresou), alebo ho nainštalujte cez ikonu inštalácie v paneli s adresou.",
    markDone: "Označiť ako hotové",
    dismiss: "Skryť",
    done: "Hotovo",
  },
  it: {
    title: "Primi passi",
    subtitle: "Tre piccole cose per preparare tutta la famiglia.",
    step1: "Collega il secondo genitore",
    step1sub: "Così entrambi i genitori possono seguire i progressi dei bambini.",
    step2: "Collega i bambini",
    step2sub: "Ogni bambino ha il proprio dispositivo, senza password, solo un breve codice di collegamento.",
    step3: "Tieni Gadit a portata di mano",
    step3sub: "Sul telefono, nella schermata iniziale. Sul computer, nei tuoi preferiti. Così è sempre vicino.",
    cta: "Come",
    add: "Aggiungi",
    homeHelp: "Sul telefono: nel menu del browser scegli \"Aggiungi alla schermata Home\". Sul computer: aggiungilo ai tuoi preferiti (la stella nella barra degli indirizzi), oppure installalo tramite l'icona di installazione nella barra degli indirizzi.",
    markDone: "Segna come completato",
    dismiss: "Nascondi",
    done: "Fatto",
  },
  ja: {
    title: "はじめの一歩",
    subtitle: "家族全員の準備を整えるための3つの小さなステップ。",
    step1: "2人目の保護者をつなげる",
    step1sub: "両親がお子さんの学習の進み具合を見られるように。",
    step2: "お子さんをつなげる",
    step2sub: "お子さんそれぞれが自分の端末を持てます。パスワードは不要で、短い連携コードだけです。",
    step3: "Gadit をいつも手元に",
    step3sub: "スマホではホーム画面に、パソコンではブックマークに。いつでもすぐ開けるように。",
    cta: "方法",
    add: "追加",
    homeHelp: "スマホの場合: ブラウザのメニューで「ホーム画面に追加」を選びます。パソコンの場合: ブックマークに追加するか（アドレスバーの星マーク）、アドレスバーのインストールアイコンからインストールします。",
    markDone: "完了にする",
    dismiss: "非表示にする",
    done: "完了",
  },
  hi: {
    title: "पहले कदम",
    subtitle: "पूरे परिवार को तैयार करने के लिए तीन छोटी चीज़ें।",
    step1: "दूसरे अभिभावक को जोड़ें",
    step1sub: "ताकि दोनों माता-पिता बच्चों की प्रगति देख सकें।",
    step2: "बच्चों को जोड़ें",
    step2sub: "हर बच्चे के पास अपना डिवाइस होता है, बिना पासवर्ड के, बस एक छोटा जोड़ने वाला कोड।",
    step3: "Gadit को हमेशा पास रखें",
    step3sub: "फ़ोन पर, होम स्क्रीन पर। कंप्यूटर पर, अपने बुकमार्क में। ताकि वह हमेशा पास रहे।",
    cta: "कैसे",
    add: "जोड़ें",
    homeHelp: "फ़ोन पर: ब्राउज़र मेन्यू में \"होम स्क्रीन पर जोड़ें\" चुनें। कंप्यूटर पर: इसे अपने बुकमार्क में जोड़ें (पता बार में तारे का निशान), या पता बार में इंस्टॉल आइकन से इसे इंस्टॉल करें।",
    markDone: "पूर्ण के रूप में चिह्नित करें",
    dismiss: "छिपाएं",
    done: "हो गया",
  },
  am: {
    title: "የመጀመሪያ እርምጃዎች",
    subtitle: "ሙሉ ቤተሰብን ለማዘጋጀት ሦስት ትንንሽ ነገሮች።",
    step1: "ሁለተኛውን ወላጅ አገናኝ",
    step1sub: "ሁለቱም ወላጆች የልጆቹን እድገት እንዲከታተሉ።",
    step2: "ልጆቹን አገናኝ",
    step2sub: "እያንዳንዱ ልጅ የራሱ መሣሪያ አለው፣ ያለ የይለፍ ቃል፣ አጭር የማገናኛ ኮድ ብቻ።",
    step3: "Gadit ን ሁልጊዜ በአቅራቢያ አኑር",
    step3sub: "በስልክ ላይ በመነሻ ማያ ገጽ ላይ። በኮምፒውተር ላይ በዕልባቶችህ ውስጥ። ሁልጊዜ ቅርብ እንዲሆን።",
    cta: "እንዴት",
    add: "አክል",
    homeHelp: "በስልክ ላይ: ከአሳሽ ምናሌ ውስጥ \"ወደ መነሻ ማያ ገጽ አክል\" ን ምረጥ። በኮምፒውተር ላይ: ወደ ዕልባቶችህ አክለው (በአድራሻ አሞሌ ውስጥ ያለው ኮከብ)፣ ወይም በአድራሻ አሞሌ ውስጥ ባለው የመጫኛ አዶ በኩል ጫነው።",
    markDone: "እንደተጠናቀቀ ምልክት አድርግ",
    dismiss: "ደብቅ",
    done: "ተጠናቋል",
  },
  uk: {
    title: "Перші кроки",
    subtitle: "Три невеликі дії, щоб налаштувати всю родину.",
    step1: "Підключіть другого з батьків",
    step1sub: "Щоб обоє батьків бачили прогрес дітей.",
    step2: "Підключіть дітей",
    step2sub: "У кожної дитини свій пристрій, без пароля, лише короткий код підключення.",
    step3: "Тримайте Gadit під рукою",
    step3sub: "На телефоні, на головному екрані. На комп'ютері, у закладках. Щоб він завжди був поруч.",
    cta: "Як",
    add: "Додати",
    homeHelp: "На телефоні: у меню браузера виберіть \"Додати на головний екран\". На комп'ютері: додайте його в закладки (зірочка в адресному рядку), або встановіть через значок встановлення в адресному рядку.",
    markDone: "Позначити як виконане",
    dismiss: "Сховати",
    done: "Готово",
  },
  tr: {
    title: "İlk adımlar",
    subtitle: "Tüm ailenin hazır olması için üç küçük şey.",
    step1: "İkinci ebeveyni bağla",
    step1sub: "Böylece her iki ebeveyn de çocukların ilerlemesini takip edebilir.",
    step2: "Çocukları bağla",
    step2sub: "Her çocuğun kendi cihazı olur, parola olmadan, yalnızca kısa bir bağlantı kodu ile.",
    step3: "Gadit'i her zaman elinin altında tut",
    step3sub: "Telefonda, ana ekranda. Bilgisayarda, yer imlerinde. Böylece her zaman yakında olur.",
    cta: "Nasıl",
    add: "Ekle",
    homeHelp: "Telefonda: tarayıcı menüsünden \"Ana ekrana ekle\" seçeneğini seç. Bilgisayarda: yer imlerine ekle (adres çubuğundaki yıldız) veya adres çubuğundaki yükleme simgesinden yükle.",
    markDone: "Tamamlandı olarak işaretle",
    dismiss: "Gizle",
    done: "Tamamlandı",
  },
  pl: {
    title: "Pierwsze kroki",
    subtitle: "Trzy małe rzeczy, aby przygotować całą rodzinę.",
    step1: "Połącz drugiego rodzica",
    step1sub: "Aby oboje rodzice mogli śledzić postępy dzieci.",
    step2: "Połącz dzieci",
    step2sub: "Każde dziecko ma własne urządzenie, bez hasła, tylko krótki kod połączenia.",
    step3: "Miej Gadit pod ręką",
    step3sub: "W telefonie na ekranie głównym. Na komputerze w zakładkach. Aby zawsze był blisko.",
    cta: "Jak",
    add: "Dodaj",
    homeHelp: "W telefonie: w menu przeglądarki wybierz \"Dodaj do ekranu głównego\". Na komputerze: dodaj go do zakładek (gwiazdka w pasku adresu) lub zainstaluj za pomocą ikony instalacji w pasku adresu.",
    markDone: "Oznacz jako zrobione",
    dismiss: "Ukryj",
    done: "Gotowe",
  },
  fa: {
    title: "گام‌های اول",
    subtitle: "سه کار کوچک تا کل خانواده آماده شود.",
    step1: "والد دوم را متصل کنید",
    step1sub: "تا هر دو والد بتوانند پیشرفت بچه‌ها را دنبال کنند.",
    step2: "بچه‌ها را متصل کنید",
    step2sub: "هر کودک دستگاه خودش را دارد، بدون رمز عبور، فقط با یک کد اتصال کوتاه.",
    step3: "Gadit را همیشه در دسترس نگه دارید",
    step3sub: "روی گوشی، در صفحه اصلی. روی رایانه، در نشانک‌هایتان. تا همیشه نزدیک باشد.",
    cta: "چگونه",
    add: "افزودن",
    homeHelp: "روی گوشی: در منوی مرورگر گزینه \"افزودن به صفحه اصلی\" را انتخاب کنید. روی رایانه: آن را به نشانک‌هایتان اضافه کنید (ستاره در نوار آدرس)، یا از طریق نماد نصب در نوار آدرس آن را نصب کنید.",
    markDone: "علامت‌گذاری به‌عنوان انجام‌شده",
    dismiss: "پنهان کردن",
    done: "انجام شد",
  },
  id: {
    title: "Langkah pertama",
    subtitle: "Tiga hal kecil untuk menyiapkan seluruh keluarga.",
    step1: "Hubungkan orang tua kedua",
    step1sub: "Agar kedua orang tua dapat mengikuti perkembangan anak-anak.",
    step2: "Hubungkan anak-anak",
    step2sub: "Setiap anak punya perangkatnya sendiri, tanpa kata sandi, hanya kode penghubung singkat.",
    step3: "Simpan Gadit selalu dalam jangkauan",
    step3sub: "Di ponsel, di layar beranda. Di komputer, di bookmark Anda. Agar selalu dekat.",
    cta: "Caranya",
    add: "Tambah",
    homeHelp: "Di ponsel: di menu browser pilih \"Tambahkan ke Layar Utama\". Di komputer: tambahkan ke bookmark Anda (bintang di bilah alamat), atau instal melalui ikon instal di bilah alamat.",
    markDone: "Tandai selesai",
    dismiss: "Sembunyikan",
    done: "Selesai",
  },
  nl: {
    title: "Eerste stappen",
    subtitle: "Drie kleine dingen om het hele gezin klaar te zetten.",
    step1: "Verbind de tweede ouder",
    step1sub: "Zodat beide ouders de voortgang van de kinderen kunnen volgen.",
    step2: "Verbind de kinderen",
    step2sub: "Elk kind krijgt een eigen apparaat, zonder wachtwoord, alleen een korte koppelcode.",
    step3: "Houd Gadit binnen handbereik",
    step3sub: "Op een telefoon, op het startscherm. Op een computer, in je bladwijzers. Zodat het altijd dichtbij is.",
    cta: "Hoe",
    add: "Toevoegen",
    homeHelp: "Op een telefoon: kies in het browsermenu \"Toevoegen aan startscherm\". Op een computer: voeg het toe aan je bladwijzers (de ster in de adresbalk), of installeer het via het installatiepictogram in de adresbalk.",
    markDone: "Markeren als voltooid",
    dismiss: "Verbergen",
    done: "Klaar",
  },
};

function CheckCircle({ done, n }: { done: boolean; n: number }) {
  if (done) {
    return (
      <span className="fam-chk-circle is-done" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  return <span className="fam-chk-circle" aria-hidden>{n}</span>;
}

export function FamilySetupChecklist({
  members,
  lang,
}: {
  members: FamilyMember[];
  lang: string;
}) {
  const href = useHref();
  const t = COPY[lang] ?? COPY.en;

  const [dismissed, setDismissed] = useState(false);
  const [homeDone, setHomeDone] = useState(false);
  const [showHomeHelp, setShowHomeHelp] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
    // Installed-as-app counts as "saved to home screen" automatically.
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone || localStorage.getItem(HOMESCREEN_KEY) === "1") setHomeDone(true);
  }, []);

  const parents = members.filter((m) => isParentRole(m.role));
  const children = members.filter((m) => !isParentRole(m.role));

  const step1done = parents.length > 1; // owner + a second parent
  const step2done = children.length > 0;
  const step3done = homeDone;
  const allDone = step1done && step2done && step3done;

  // Avoid a hydration flash: render nothing until we've read localStorage.
  if (!hydrated || dismissed || allDone) return null;

  const markHomeDone = () => {
    setHomeDone(true);
    setShowHomeHelp(false);
    if (typeof window !== "undefined") localStorage.setItem(HOMESCREEN_KEY, "1");
  };
  const dismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") localStorage.setItem(DISMISS_KEY, "1");
  };

  return (
    <div className="fam-chk">
      <style>{CHK_CSS}</style>
      <div className="fam-chk-head">
        <div>
          <h2 className="fam-chk-title">{t.title}</h2>
          <p className="fam-chk-sub">{t.subtitle}</p>
        </div>
        <button type="button" className="fam-chk-dismiss" onClick={dismiss}>{t.dismiss}</button>
      </div>

      <ul className="fam-chk-list">
        {/* Step 1 — second parent */}
        <li className={`fam-chk-item ${step1done ? "is-done" : ""}`}>
          <CheckCircle done={step1done} n={1} />
          <div className="fam-chk-body">
            <span className="fam-chk-label">{t.step1}</span>
            <span className="fam-chk-itemsub">{step1done ? t.done : t.step1sub}</span>
          </div>
          {!step1done && (
            <Link href={href("/family/add")} className="fam-chk-cta">{t.add}</Link>
          )}
        </li>

        {/* Step 2 — kids */}
        <li className={`fam-chk-item ${step2done ? "is-done" : ""}`}>
          <CheckCircle done={step2done} n={2} />
          <div className="fam-chk-body">
            <span className="fam-chk-label">{t.step2}</span>
            <span className="fam-chk-itemsub">{step2done ? t.done : t.step2sub}</span>
          </div>
          {!step2done && (
            <Link href={href("/family/add")} className="fam-chk-cta">{t.add}</Link>
          )}
        </li>

        {/* Step 3 — home screen */}
        <li className={`fam-chk-item ${step3done ? "is-done" : ""}`}>
          <CheckCircle done={step3done} n={3} />
          <div className="fam-chk-body">
            <span className="fam-chk-label">{t.step3}</span>
            <span className="fam-chk-itemsub">{step3done ? t.done : t.step3sub}</span>
            {showHomeHelp && !step3done && (
              <span className="fam-chk-help">{t.homeHelp}</span>
            )}
          </div>
          {!step3done && (
            showHomeHelp ? (
              <button type="button" className="fam-chk-cta" onClick={markHomeDone}>{t.markDone}</button>
            ) : (
              <button type="button" className="fam-chk-cta fam-chk-cta-ghost" onClick={() => setShowHomeHelp(true)}>{t.cta}</button>
            )
          )}
        </li>
      </ul>
    </div>
  );
}

const CHK_CSS = `
.fam-chk {
  background: #fff;
  border: 1px solid #E6E9EC;
  border-radius: 18px;
  padding: 20px 22px;
  margin-bottom: 22px;
  box-shadow: 0 1px 2px rgba(16,24,40,.04);
}
.fam-chk-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:14px; }
.fam-chk-title { margin:0; font-size:17px; font-weight:700; color:#0F172A; }
.fam-chk-sub { margin:3px 0 0; font-size:13.5px; color:#64748B; line-height:1.4; }
.fam-chk-dismiss { flex-shrink:0; background:none; border:none; color:#94A3B8; font-size:12.5px; font-weight:600; cursor:pointer; padding:2px 4px; }
.fam-chk-dismiss:hover { color:#64748B; }
.fam-chk-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px; }
.fam-chk-item { display:flex; align-items:center; gap:13px; padding:12px 14px; border:1px solid #EEF1F4; border-radius:13px; background:#FBFCFD; transition:background .15s, border-color .15s; }
.fam-chk-item.is-done { background:#F0FDFA; border-color:#CCF3EF; }
.fam-chk-circle { flex-shrink:0; width:26px; height:26px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:#0EA5A5; background:#E6FBF8; box-shadow: inset 0 0 0 1.5px #B7EEE8; }
.fam-chk-circle.is-done { color:#fff; background:#0EA5A5; box-shadow:none; }
.fam-chk-body { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
.fam-chk-label { font-size:14.5px; font-weight:650; color:#0F172A; }
.fam-chk-item.is-done .fam-chk-label { color:#0E7C74; }
.fam-chk-itemsub { font-size:12.5px; color:#64748B; line-height:1.4; }
.fam-chk-help { font-size:12.5px; color:#475569; line-height:1.45; margin-top:6px; background:#F1F5F9; border-radius:9px; padding:8px 10px; }
.fam-chk-cta { flex-shrink:0; background:#0EA5A5; color:#fff; border:none; border-radius:9px; padding:8px 15px; font-size:13px; font-weight:650; cursor:pointer; text-decoration:none; white-space:nowrap; }
.fam-chk-cta:hover { background:#0C9088; }
.fam-chk-cta-ghost { background:#fff; color:#0E7C74; box-shadow: inset 0 0 0 1.5px #B7EEE8; }
.fam-chk-cta-ghost:hover { background:#F0FDFA; }
`;

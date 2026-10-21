"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { useHref } from "@/lib/href";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useKidsMode } from "@/lib/use-kids-mode";
import { useIsIosApp } from "@/lib/use-native-app";
import { isTwa } from "@/lib/twa";
import { QText } from "@/components/play/QText";
import { isParentRole, type FamilyMember } from "@/lib/family";

/**
 * First-steps checklist for a new Family owner. Started 2026-08-03 on the
 * /family page (second parent, kids, home screen); since 2026-10-21 it also
 * sits on the search home and pushes real use (first word, first game). See
 * the component below for who sees it and when.
 */

// v2: the list changed (usage steps added), so an old dismissal of the
// three-step setup list does not hide the new one. Stored per account.
const DISMISS_KEY = "gadit_first_steps_dismissed_v2";
const HOMESCREEN_KEY = "gadit_family_homescreen_done_v1";

type Copy = {
  title: string;
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
  xh: {
    title: "Amanyathelo okuqala",
    step1: "Dibanisa umzali wesibini",
    step1sub: "Ukuze bobabini abazali balandele inkqubela yabantwana.",
    step2: "Dibanisa abantwana",
    step2sub: "Umntwana ngamnye ufumana isixhobo sakhe, akukho phasiwedi, yikhowudi emfutshane yokudibanisa nje.",
    step3: "Gcina i-Gadit ikufutshane",
    step3sub: "Kwifowuni, kwisikrini sasekhaya. Kwikhompyutha, kwiibhukhmakhi zakho. Ukuze isoloko ikufutshane.",
    cta: "Njani",
    add: "Yongeza",
    homeHelp: "Kwifowuni: kwimenyu yebhrawuza khetha \"Add to Home Screen\". Kwikhompyutha: yongeze kwiibhukhmakhi zakho (inkwenkwezi ekwibha yedilesi), okanye uyifake ngomqondiso wokufaka okwibha yedilesi.",
    markDone: "Phawula njengegqityiweyo",
    dismiss: "Fihla oku",
    done: "Kugqityiwe",
  },
  nso: {
    title: "Dikgato tša mathomo",
    step1: "Kopanya motswadi wa bobedi",
    step1sub: "Gore batswadi ka bobedi ba kgone go latela tšwelopele ya bana.",
    step2: "Kopanya bana",
    step2sub: "Ngwana yo mongwe le yo mongwe o hwetša sedirišwa sa gagwe, ga go phasewete, ke khoutu ye kopana ya go kopanya fela.",
    step3: "Dula o na le Gadit kgauswi",
    step3sub: "Mogaleng, sekirining sa gae. Khomphutheng, mo o bolokago dilinki. Gore e dule e le kgauswi ka mehla.",
    cta: "Bjang",
    add: "Oketša",
    homeHelp: "Mogaleng: lenaneong la sefetleki kgetha \"Add to Home Screen\". Khomphutheng: e oketše mo o bolokago dilinki (naledi ya bareng ya aterese), goba o e tsenye ka leswao la go tsenya bareng ya aterese.",
    markDone: "Swaya e dirilwe",
    dismiss: "Uta se",
    done: "E dirilwe",
  },
  tn: {
    title: "Dikgato tsa ntlha",
    step1: "Golaganya motsadi wa bobedi",
    step1sub: "Gore batsadi ka bobedi ba kgone go latela kgatelopele ya bana.",
    step2: "Golaganya bana",
    step2sub: "Ngwana mongwe le mongwe o bona sedirisiwa sa gagwe, kwa ntle ga lefoko la sephiri, ka khoutu e khutshwane ya kgolagano fela.",
    step3: "Nna o na le Gadit gaufi",
    step3sub: "Mo mogaleng, mo sekirining sa gae. Mo khomputareng, mo ditshwaong tsa gago. Gore e nne gaufi ka metlha.",
    cta: "Jang",
    add: "Tsenya",
    homeHelp: "Mo mogaleng: mo lenaaneng la sebatli tlhopha \"Add to Home Screen\". Mo khomputareng: e tsenye mo ditshwaong tsa gago (naledi mo moleng wa aterese), kgotsa e tsenye ka setshwantshwana sa go tsenya mo moleng wa aterese.",
    markDone: "Tshwaya e le e e dirilweng",
    dismiss: "Fitlha se",
    done: "Go dirilwe",
  },
  st: {
    title: "Mehato ya pele",
    step1: "Hokela motswadi wa bobedi",
    step1sub: "Hore batswadi ka bobedi ba latele tswelopele ya bana.",
    step2: "Hokela bana",
    step2sub: "Ngwana e mong le e mong o fumana sesebediswa sa hae, ha ho phasewete, ke khoutu e kgutshwane ya ho hokela feela.",
    step3: "Boloka Gadit haufi",
    step3sub: "Fonong, skrineng sa lapeng. Khomphutheng, ho dibukhimaka tsa hao. Hore e dule e le haufi.",
    cta: "Jwang",
    add: "Kenya",
    homeHelp: "Fonong: lenaneng la sebadi sa inthanete kgetha \"Add to Home Screen\". Khomphutheng: e kenye ho dibukhimaka tsa hao (naledi e bareng ya aterese), kapa o e kenye ka letshwao la ho kenya le bareng ya aterese.",
    markDone: "Tshwaya e entswe",
    dismiss: "Pata sena",
    done: "E entswe",
  },
  ts: {
    title: "Magoza yo sungula",
    step1: "Hlanganisa mutswari wa vumbirhi",
    step1sub: "Leswaku vatswari havambirhi va kota ku landzelela ku ya emahlweni ka vana.",
    step2: "Hlanganisa vana",
    step2sub: "N'wana un'wana na un'wana u kuma xitirhisiwa xa yena, a ku na phasiwedi, i khodi yo koma yo hlanganisa ntsena.",
    step3: "Hlayisa Gadit kusuhi",
    step3sub: "Eka riqingho, eka xikirini xa le kaya. Eka khompyuta, eka tibukimaka ta n'wina. Leswaku yi tshama yi ri kusuhi.",
    cta: "Njhani",
    add: "Engetela",
    homeHelp: "Eka riqingho: eka menyu ya bulawuza hlawulani \"Add to Home Screen\". Eka khompyuta: yi engeteleni eka tibukimaka ta n'wina (nyeleti leyi nga eka bara ya adirese), kumbe mi yi nghenisa hi aykhoni yo nghenisa leyi nga eka bara ya adirese.",
    markDone: "Funga leswaku swi endliwile",
    dismiss: "Fihla leswi",
    done: "Swi endliwile",
  },
  ss: {
    title: "Tinyatselo tekucala",
    step1: "Xhuma umtali wesibili",
    step1sub: "Kute bobabili batali balandzele inchubekelembili yebantfwana.",
    step2: "Xhuma bantfwana",
    step2sub: "Umntfwana ngamunye utfola lithuluzi lakhe, kute liphasiwedi, yikhodi lefishane yekuxhuma nje.",
    step3: "Gcina Gadit iseduze",
    step3sub: "Efonini, esikrinini sasekhaya. Ekhompyutheni, kuma-bookmark akho. Kute ihlale iseduze.",
    cta: "Kanjani",
    add: "Engeta",
    homeHelp: "Efonini: kumenyu ye-browser khetsa \"Add to Home Screen\". Ekhompyutheni: yengete kuma-bookmark akho (inkhanyeti lesemugceni wekheli), nobe uyifake ngelithonjana lekufaka lelisemugceni wekheli.",
    markDone: "Phawula njengalokuphelile",
    dismiss: "Fihla loku",
    done: "Kuphelile",
  },
  ve: {
    title: "Zwiṱepe zwa u thoma",
    step1: "Ṱumanyani mubebi wa vhuvhili",
    step1sub: "Uri vhabebi vhoṱhe vha kone u tevhela mvelaphanḓa ya vhana.",
    step2: "Ṱumanyani vhana",
    step2sub: "Ṅwana muṅwe na muṅwe u wana tshishumiswa tshawe, a hu na phasiwedi, ndi khoudu pfufhi ya u ṱumanya fhedzi.",
    step3: "Dzulani ni na Gadit tsini",
    step3sub: "Kha founu, kha tshikirini tsha hayani. Kha khomphyutha, kha zwiswayo zwaṋu. Uri i dzule i tsini tshifhinga tshoṱhe.",
    cta: "Hani",
    add: "Engedzani",
    homeHelp: "Kha founu: kha menyu ya burausa khethani \"Add to Home Screen\". Kha khomphyutha: i engedzeni kha zwiswayo zwaṋu (naledzi i re kha bara ya adiresi), kana ni i dzhenise nga aikhoni ya u dzhenisa i re kha bara ya adiresi.",
    markDone: "Swayani sa zwo itwa",
    dismiss: "Dzumbani hezwi",
    done: "Zwo itwa",
  },
  nr: {
    title: "Amagadango wokuthoma",
    step1: "Hlanganisa umbelethi wesibili",
    step1sub: "Bona ababelethi boke bobabili balandele ukuthuthuka kwabantwana.",
    step2: "Hlanganisa abantwana",
    step2sub: "Umntwana ngamunye uthola idivayisi yakhe, ngaphandle kwephasiwedi, ngekhowudi efitjhani yokuhlanganisa kwaphela.",
    step3: "Gcina i-Gadit iseduze",
    step3sub: "Efowunini, esikrinini sekhaya. Ekhomphyutheni, kumabhukhimaki wakho. Bona ihlale iseduze.",
    cta: "Njani",
    add: "Faka",
    homeHelp: "Efowunini: kumenyu yebhrawuza khetha \"Faka esikrinini sekhaya\". Ekhomphyutheni: yifake kumabhukhimaki wakho (inkanyezi ebhaweni lekheli), namkha uyifake ngetjhwayo lokufaka ebhaweni lekheli.",
    markDone: "Tjho bona kwenziwe",
    dismiss: "Fihla lokhu",
    done: "Kwenziwe",
  },
  el: {
    title: "Πρώτα βήματα",
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
  vi: {
    title: "Những bước đầu tiên",
    step1: "Kết nối phụ huynh thứ hai",
    step1sub: "Để cả hai phụ huynh cùng theo dõi sự tiến bộ của các con.",
    step2: "Kết nối các con",
    step2sub: "Mỗi con có thiết bị riêng, không cần mật khẩu, chỉ cần một mã ghép nối ngắn.",
    step3: "Giữ Gadit luôn trong tầm tay",
    step3sub: "Trên điện thoại, ở màn hình chính. Trên máy tính, trong dấu trang. Để Gadit luôn ở gần.",
    cta: "Cách làm",
    add: "Thêm",
    homeHelp: "Trên điện thoại: trong menu trình duyệt, chọn \"Thêm vào màn hình chính\". Trên máy tính: thêm vào dấu trang (biểu tượng ngôi sao trên thanh địa chỉ), hoặc cài đặt qua biểu tượng cài đặt trên thanh địa chỉ.",
    markDone: "Đánh dấu đã xong",
    dismiss: "Ẩn mục này",
    done: "Xong",
  },
  fil: {
    title: "Mga unang hakbang",
    step1: "Ikonekta ang pangalawang magulang",
    step1sub: "Para masubaybayan ng dalawang magulang ang pag-unlad ng mga bata.",
    step2: "Ikonekta ang mga bata",
    step2sub: "May sariling device ang bawat bata, walang password, isang maikling pairing code lang.",
    step3: "Panatilihing malapit ang Gadit",
    step3sub: "Sa phone, sa home screen. Sa computer, sa iyong mga bookmark. Para laging malapit.",
    cta: "Paano",
    add: "Idagdag",
    homeHelp: "Sa phone: sa menu ng browser, piliin ang \"Add to Home Screen\". Sa computer: idagdag ito sa iyong mga bookmark (ang bituin sa address bar), o i-install gamit ang install icon sa address bar.",
    markDone: "Markahan bilang tapos",
    dismiss: "Itago ito",
    done: "Tapos na",
  },
  af: {
    title: "Eerste stappe",
    step1: "Koppel die tweede ouer",
    step1sub: "Sodat albei ouers die kinders se vordering kan volg.",
    step2: "Koppel die kinders",
    step2sub: "Elke kind kry 'n eie toestel, sonder wagwoord, net 'n kort koppelkode.",
    step3: "Hou Gadit binne bereik",
    step3sub: "Op 'n foon, op die tuisskerm. Op 'n rekenaar, in jou boekmerke. Sodat dit altyd naby is.",
    cta: "Hoe",
    add: "Voeg by",
    homeHelp: "Op 'n foon: kies \"Voeg by tuisskerm\" in die blaaierkieslys. Op 'n rekenaar: voeg dit by jou boekmerke (die ster in die adresbalk), of installeer dit via die installeer-ikoon in die adresbalk.",
    markDone: "Merk as klaar",
    dismiss: "Versteek dit",
    done: "Klaar",
  },
  sw: {
    title: "Hatua za kwanza",
    step1: "Unganisha mzazi wa pili",
    step1sub: "Ili wazazi wote wawili wafuatilie maendeleo ya watoto.",
    step2: "Unganisha watoto",
    step2sub: "Kila mtoto anapata kifaa chake, bila nenosiri, msimbo mfupi wa kuunganisha tu.",
    step3: "Weka Gadit karibu",
    step3sub: "Kwenye simu, kwenye skrini ya mwanzo. Kwenye kompyuta, kwenye alamisho zako. Ili iwe karibu kila wakati.",
    cta: "Vipi",
    add: "Ongeza",
    homeHelp: "Kwenye simu: kwenye menyu ya kivinjari chagua \"Ongeza kwenye Skrini ya Mwanzo\". Kwenye kompyuta: iongeze kwenye alamisho zako (nyota kwenye upau wa anwani), au isakinishe kupitia aikoni ya kusakinisha kwenye upau wa anwani.",
    markDone: "Weka alama kuwa imekamilika",
    dismiss: "Ficha hii",
    done: "Imekamilika",
  },
  "zh-CN": {
    title: "入门步骤",
    step1: "连接另一位家长",
    step1sub: "让两位家长都能关注孩子的进步。",
    step2: "连接孩子",
    step2sub: "每个孩子用自己的设备，无需密码，只要一个简短的配对码。",
    step3: "让 Gadit 随手可用",
    step3sub: "在手机上，添加到主屏幕。在电脑上，加入书签。让它随时就在身边。",
    cta: "怎么做",
    add: "添加",
    homeHelp: "手机上：在浏览器菜单中选择“添加到主屏幕”。电脑上：加入书签（地址栏中的星形图标），或通过地址栏中的安装图标进行安装。",
    markDone: "标记为已完成",
    dismiss: "隐藏",
    done: "已完成",
  },
  "zh-TW": {
    title: "入門步驟",
    step1: "連結另一位家長",
    step1sub: "讓兩位家長都能關注孩子的進步。",
    step2: "連結孩子",
    step2sub: "每個孩子使用自己的裝置，不需要密碼，只要一組簡短的配對碼。",
    step3: "讓 Gadit 隨手可用",
    step3sub: "在手機上，加到主畫面。在電腦上，加入書籤。讓它隨時就在身邊。",
    cta: "怎麼做",
    add: "新增",
    homeHelp: "手機上：在瀏覽器選單中選擇「加到主畫面」。電腦上：加入書籤（網址列中的星形圖示），或透過網址列中的安裝圖示進行安裝。",
    markDone: "標示為已完成",
    dismiss: "隱藏",
    done: "已完成",
  },
  ko: {
    title: "첫 단계",
    step1: "다른 부모 연결하기",
    step1sub: "두 부모 모두 아이들의 성장을 함께 볼 수 있어요.",
    step2: "아이들 연결하기",
    step2sub: "아이마다 자기 기기를 써요. 비밀번호 없이 짧은 연결 코드만 있으면 돼요.",
    step3: "Gadit을 가까이 두기",
    step3sub: "휴대폰에서는 홈 화면에, 컴퓨터에서는 북마크에. 언제나 가까이 있도록요.",
    cta: "방법",
    add: "추가",
    homeHelp: "휴대폰: 브라우저 메뉴에서 \"홈 화면에 추가\"를 선택하세요. 컴퓨터: 북마크에 추가하거나(주소창의 별 아이콘), 주소창의 설치 아이콘으로 설치하세요.",
    markDone: "완료로 표시",
    dismiss: "숨기기",
    done: "완료",
  },
  th: {
    title: "ขั้นตอนแรก",
    step1: "เชื่อมต่อผู้ปกครองคนที่สอง",
    step1sub: "เพื่อให้ผู้ปกครองทั้งสองคนติดตามพัฒนาการของลูก ๆ ได้",
    step2: "เชื่อมต่อลูก ๆ",
    step2sub: "เด็กแต่ละคนใช้อุปกรณ์ของตัวเอง ไม่ต้องมีรหัสผ่าน ใช้แค่รหัสจับคู่สั้น ๆ",
    step3: "เก็บ Gadit ไว้ใกล้มือ",
    step3sub: "บนโทรศัพท์ ไว้ที่หน้าจอหลัก บนคอมพิวเตอร์ ไว้ในบุ๊กมาร์ก เพื่อให้อยู่ใกล้เสมอ",
    cta: "ทำอย่างไร",
    add: "เพิ่ม",
    homeHelp: "บนโทรศัพท์: ในเมนูของเบราว์เซอร์ เลือก \"เพิ่มไปยังหน้าจอหลัก\" บนคอมพิวเตอร์: เพิ่มในบุ๊กมาร์ก (รูปดาวในแถบที่อยู่) หรือติดตั้งผ่านไอคอนติดตั้งในแถบที่อยู่",
    markDone: "ทำเครื่องหมายว่าเสร็จแล้ว",
    dismiss: "ซ่อน",
    done: "เสร็จแล้ว",
  },
  bn: {
    title: "প্রথম ধাপ",
    step1: "দ্বিতীয় অভিভাবককে যুক্ত করা",
    step1sub: "যাতে দুই অভিভাবকই সন্তানদের অগ্রগতি দেখতে পারেন।",
    step2: "সন্তানদের যুক্ত করা",
    step2sub: "প্রতিটি শিশু নিজের ডিভাইস পায়, কোনো পাসওয়ার্ড লাগে না, শুধু একটি ছোট সংযোগ কোড।",
    step3: "Gadit হাতের কাছে রাখা",
    step3sub: "ফোনে, হোম স্ক্রিনে। কম্পিউটারে, বুকমার্কে। যাতে সবসময় কাছে থাকে।",
    cta: "কীভাবে",
    add: "যোগ করুন",
    homeHelp: "ফোনে: ব্রাউজারের মেনু থেকে \"হোম স্ক্রিনে যোগ করুন\" বেছে নিন। কম্পিউটারে: বুকমার্কে যোগ করুন (ঠিকানা বারের তারকা চিহ্ন), অথবা ঠিকানা বারের ইনস্টল আইকন দিয়ে ইনস্টল করুন।",
    markDone: "সম্পন্ন হিসেবে চিহ্নিত করুন",
    dismiss: "লুকিয়ে রাখুন",
    done: "সম্পন্ন",
  },
  da: {
    title: "Første skridt",
    step1: "Forbind den anden forælder",
    step1sub: "Så begge forældre kan følge børnenes fremskridt.",
    step2: "Forbind børnene",
    step2sub: "Hvert barn får sin egen enhed, ingen adgangskode, bare en kort parringskode.",
    step3: "Hav Gadit lige ved hånden",
    step3sub: "På en telefon, på startskærmen. På en computer, i dine bogmærker. Så den altid er tæt på.",
    cta: "Hvordan",
    add: "Tilføj",
    homeHelp: "På en telefon: vælg \"Føj til hjemmeskærm\" i browsermenuen. På en computer: føj den til dine bogmærker (stjernen i adresselinjen), eller installer den via installationsikonet i adresselinjen.",
    markDone: "Markér som udført",
    dismiss: "Skjul dette",
    done: "Udført",
  },
  hu: {
    title: "Első lépések",
    step1: "A második szülő csatlakoztatása",
    step1sub: "Hogy mindkét szülő követhesse a gyerekek fejlődését.",
    step2: "A gyerekek csatlakoztatása",
    step2sub: "Minden gyerek a saját eszközét használja, jelszó nélkül, csak egy rövid párosítókóddal.",
    step3: "A Gadit legyen mindig kéznél",
    step3sub: "Telefonon a kezdőképernyőn, számítógépen a könyvjelzők között. Így mindig kéznél van.",
    cta: "Hogyan",
    add: "Hozzáadás",
    homeHelp: "Telefonon: a böngésző menüjében válaszd a \"Hozzáadás a kezdőképernyőhöz\" lehetőséget. Számítógépen: add hozzá a könyvjelzőkhöz (a csillag a címsorban), vagy telepítsd a címsorban megjelenő telepítés ikonnal.",
    markDone: "Megjelölés készként",
    dismiss: "Elrejtés",
    done: "Kész",
  },
};

/** Copy for the usage steps added 2026-10-21 (first word, first game), the
 *  new subtitle, the "optional" tag and the progress line. Every UI
 *  language; `{n}` and `{total}` are filled in. */
type More = {
  sub: string;
  word: string;
  wordSub: string;
  wordCta: string;
  game: string;
  gameSub: string;
  gameCta: string;
  optional: string;
  progress: string;
};

const MORE: Record<string, More> = {
  he: { sub: "כמה צעדים קטנים, וכל המשפחה מתחילה ללמוד מילים חדשות.", word: "לחפש מילה ראשונה", wordSub: "הקלידו מילה כלשהי, בכל שפה, ותראו את כל המשמעויות שלה.", wordCta: "חיפוש", game: "לשחק משחק ראשון", gameSub: "משחק מילים קצר, לילדים או לכם.", gameCta: "לשחק", optional: "לא חובה", progress: "{n} מתוך {total}" },
  en: { sub: "A few small steps and the whole family starts learning new words.", word: "Look up a first word", wordSub: "Type any word, in any language, and see all its meanings.", wordCta: "Search", game: "Play a first game", gameSub: "A short word game, for the kids or for you.", gameCta: "Play", optional: "Optional", progress: "{n} of {total}" },
  ar: { sub: "بضع خطوات صغيرة، وتبدأ العائلة كلها بتعلّم كلمات جديدة.", word: "البحث عن أول كلمة", wordSub: "اكتبوا أي كلمة، بأي لغة، وشاهدوا كل معانيها.", wordCta: "بحث", game: "لعب أول لعبة", gameSub: "لعبة كلمات قصيرة، للأطفال أو لكم.", gameCta: "لعب", optional: "اختياري", progress: "{n} من {total}" },
  ru: { sub: "Несколько небольших шагов, и вся семья начинает учить новые слова.", word: "Найти первое слово", wordSub: "Введите любое слово на любом языке и посмотрите все его значения.", wordCta: "Искать", game: "Сыграть в первую игру", gameSub: "Короткая игра со словами, для детей или для вас.", gameCta: "Играть", optional: "Необязательно", progress: "{n} из {total}" },
  es: { sub: "Unos pocos pasos pequeños y toda la familia empieza a aprender palabras nuevas.", word: "Busca una primera palabra", wordSub: "Escribe cualquier palabra, en cualquier idioma, y mira todos sus significados.", wordCta: "Buscar", game: "Juega un primer juego", gameSub: "Un juego corto de palabras, para los niños o para ti.", gameCta: "Jugar", optional: "Opcional", progress: "{n} de {total}" },
  pt: { sub: "Alguns pequenos passos e toda a família começa a aprender palavras novas.", word: "Pesquise a primeira palavra", wordSub: "Digite qualquer palavra, em qualquer idioma, e veja todos os seus significados.", wordCta: "Pesquisar", game: "Jogue o primeiro jogo", gameSub: "Um jogo curto de palavras, para as crianças ou para você.", gameCta: "Jogar", optional: "Opcional", progress: "{n} de {total}" },
  fr: { sub: "Quelques petites étapes et toute la famille commence à apprendre de nouveaux mots.", word: "Chercher un premier mot", wordSub: "Tapez n'importe quel mot, dans n'importe quelle langue, et voyez tous ses sens.", wordCta: "Chercher", game: "Jouer à un premier jeu", gameSub: "Un petit jeu de mots, pour les enfants ou pour vous.", gameCta: "Jouer", optional: "Facultatif", progress: "{n} sur {total}" },
  de: { sub: "Ein paar kleine Schritte, und die ganze Familie lernt neue Wörter.", word: "Ein erstes Wort nachschlagen", wordSub: "Gib ein beliebiges Wort in einer beliebigen Sprache ein und sieh alle seine Bedeutungen.", wordCta: "Suchen", game: "Ein erstes Spiel spielen", gameSub: "Ein kurzes Wortspiel, für die Kinder oder für dich.", gameCta: "Spielen", optional: "Optional", progress: "{n} von {total}" },
  cs: { sub: "Pár malých kroků a celá rodina se začne učit nová slova.", word: "Vyhledejte první slovo", wordSub: "Napište jakékoli slovo v jakémkoli jazyce a uvidíte všechny jeho významy.", wordCta: "Hledat", game: "Zahrajte si první hru", gameSub: "Krátká slovní hra pro děti nebo pro vás.", gameCta: "Hrát", optional: "Nepovinné", progress: "{n} z {total}" },
  sk: { sub: "Pár malých krokov a celá rodina sa začne učiť nové slová.", word: "Vyhľadajte prvé slovo", wordSub: "Napíšte akékoľvek slovo v akomkoľvek jazyku a uvidíte všetky jeho významy.", wordCta: "Hľadať", game: "Zahrajte si prvú hru", gameSub: "Krátka slovná hra pre deti alebo pre vás.", gameCta: "Hrať", optional: "Nepovinné", progress: "{n} z {total}" },
  it: { sub: "Pochi piccoli passi e tutta la famiglia inizia a imparare parole nuove.", word: "Cerca una prima parola", wordSub: "Scrivi una parola qualsiasi, in qualsiasi lingua, e vedi tutti i suoi significati.", wordCta: "Cerca", game: "Gioca a un primo gioco", gameSub: "Un breve gioco di parole, per i bambini o per te.", gameCta: "Gioca", optional: "Facoltativo", progress: "{n} di {total}" },
  ja: { sub: "いくつかの小さなステップで、家族みんなが新しい言葉を学び始めます。", word: "最初の言葉を調べる", wordSub: "どんな言語のどんな言葉でも入力して、すべての意味を見てみましょう。", wordCta: "検索", game: "最初のゲームで遊ぶ", gameSub: "短い言葉のゲーム。お子さんとでも、ご自身でも。", gameCta: "遊ぶ", optional: "任意", progress: "{n} / {total}" },
  hi: { sub: "कुछ छोटे कदम, और पूरा परिवार नए शब्द सीखना शुरू कर देता है।", word: "पहला शब्द खोजें", wordSub: "किसी भी भाषा में कोई भी शब्द लिखें और उसके सभी अर्थ देखें।", wordCta: "खोजें", game: "पहला खेल खेलें", gameSub: "शब्दों का एक छोटा खेल, बच्चों के लिए या आपके लिए।", gameCta: "खेलें", optional: "वैकल्पिक", progress: "{total} में से {n}" },
  am: { sub: "ጥቂት ትንንሽ እርምጃዎች፣ እና መላው ቤተሰብ አዳዲስ ቃላትን መማር ይጀምራል።", word: "የመጀመሪያ ቃል ፈልግ", wordSub: "በማንኛውም ቋንቋ ማንኛውንም ቃል ጻፍ እና ሁሉንም ትርጉሞቹን እይ።", wordCta: "ፈልግ", game: "የመጀመሪያ ጨዋታ ተጫወት", gameSub: "አጭር የቃላት ጨዋታ፣ ለልጆች ወይም ለአንተ።", gameCta: "ተጫወት", optional: "አማራጭ", progress: "{n} / {total}" },
  uk: { sub: "Кілька невеликих кроків, і вся родина починає вчити нові слова.", word: "Знайдіть перше слово", wordSub: "Введіть будь-яке слово будь-якою мовою і перегляньте всі його значення.", wordCta: "Шукати", game: "Зіграйте в першу гру", gameSub: "Коротка гра зі словами, для дітей або для вас.", gameCta: "Грати", optional: "Необов'язково", progress: "{n} з {total}" },
  tr: { sub: "Birkaç küçük adım ve tüm aile yeni kelimeler öğrenmeye başlar.", word: "İlk kelimeni ara", wordSub: "Herhangi bir dilde herhangi bir kelime yaz ve tüm anlamlarını gör.", wordCta: "Ara", game: "İlk oyununu oyna", gameSub: "Kısa bir kelime oyunu, çocuklar ya da senin için.", gameCta: "Oyna", optional: "İsteğe bağlı", progress: "{n} / {total}" },
  pl: { sub: "Kilka małych kroków i cała rodzina zaczyna uczyć się nowych słów.", word: "Wyszukaj pierwsze słowo", wordSub: "Wpisz dowolne słowo w dowolnym języku i zobacz wszystkie jego znaczenia.", wordCta: "Szukaj", game: "Zagraj w pierwszą grę", gameSub: "Krótka gra słowna, dla dzieci albo dla Ciebie.", gameCta: "Graj", optional: "Opcjonalnie", progress: "{n} z {total}" },
  fa: { sub: "چند گام کوچک، و کل خانواده یادگیری واژه‌های تازه را شروع می‌کند.", word: "اولین واژه را جستجو کنید", wordSub: "هر واژه‌ای را به هر زبانی بنویسید و همه معناهایش را ببینید.", wordCta: "جستجو", game: "اولین بازی را انجام دهید", gameSub: "یک بازی کوتاه با واژه‌ها، برای بچه‌ها یا برای خودتان.", gameCta: "بازی", optional: "اختیاری", progress: "{n} از {total}" },
  id: { sub: "Beberapa langkah kecil, dan seluruh keluarga mulai belajar kata-kata baru.", word: "Cari kata pertama", wordSub: "Ketik kata apa saja, dalam bahasa apa saja, dan lihat semua artinya.", wordCta: "Cari", game: "Mainkan permainan pertama", gameSub: "Permainan kata yang singkat, untuk anak-anak atau untuk Anda.", gameCta: "Main", optional: "Opsional", progress: "{n} dari {total}" },
  nl: { sub: "Een paar kleine stappen en het hele gezin leert nieuwe woorden.", word: "Zoek een eerste woord op", wordSub: "Typ een woord, in welke taal dan ook, en zie al zijn betekenissen.", wordCta: "Zoeken", game: "Speel een eerste spel", gameSub: "Een kort woordspel, voor de kinderen of voor jou.", gameCta: "Spelen", optional: "Optioneel", progress: "{n} van {total}" },
  el: { sub: "Λίγα μικρά βήματα και όλη η οικογένεια αρχίζει να μαθαίνει νέες λέξεις.", word: "Αναζήτησε μια πρώτη λέξη", wordSub: "Γράψε οποιαδήποτε λέξη, σε οποιαδήποτε γλώσσα, και δες όλες τις σημασίες της.", wordCta: "Αναζήτηση", game: "Παίξε ένα πρώτο παιχνίδι", gameSub: "Ένα σύντομο παιχνίδι λέξεων, για τα παιδιά ή για σένα.", gameCta: "Παίξε", optional: "Προαιρετικό", progress: "{n} από {total}" },
  zu: { sub: "Izinyathelo ezimbalwa ezincane, bese wonke umndeni uqala ukufunda amagama amasha.", word: "Sesha igama lokuqala", wordSub: "Bhala noma yiliphi igama, nganoma yiluphi ulimi, ubone zonke izincazelo zalo.", wordCta: "Sesha", game: "Dlala umdlalo wokuqala", gameSub: "Umdlalo omfushane wamagama, wezingane noma wakho.", gameCta: "Dlala", optional: "Akuphoqelekile", progress: "{n} / {total}" },
  xh: { sub: "Amanyathelo ambalwa amancinci, kwaye usapho lonke luqala ukufunda amagama amatsha.", word: "Khangela igama lokuqala", wordSub: "Bhala nalo naliphi na igama, ngalo naluphi na ulwimi, ubone zonke iintsingiselo zalo.", wordCta: "Khangela", game: "Dlala umdlalo wokuqala", gameSub: "Umdlalo omfutshane wamagama, wabantwana okanye wakho.", gameCta: "Dlala", optional: "Ayinyanzelekanga", progress: "{n} / {total}" },
  nso: { sub: "Dikgato tše mmalwa tše nnyane, gomme lapa ka moka le thoma go ithuta mantšu a mafsa.", word: "Nyaka lentšu la mathomo", wordSub: "Ngwala lentšu lefe goba lefe, ka polelo efe goba efe, o bone ditlhalošo tša lona ka moka.", wordCta: "Nyaka", game: "Bapala papadi ya mathomo", gameSub: "Papadi ye kopana ya mantšu, ya bana goba ya gago.", gameCta: "Bapala", optional: "Ga se gapeletšo", progress: "{n} / {total}" },
  tn: { sub: "Dikgato di le mmalwa tse dinnye, mme lelapa lotlhe le simolola go ithuta mafoko a masha.", word: "Batla lefoko la ntlha", wordSub: "Kwala lefoko lefe kana lefe, ka puo efe kana efe, o bone dikaelo tsotlhe tsa lone.", wordCta: "Batla", game: "Tshameka motshameko wa ntlha", gameSub: "Motshameko o mokhutshwane wa mafoko, wa bana kgotsa wa gago.", gameCta: "Tshameka", optional: "Ga go a patelediwa", progress: "{n} / {total}" },
  st: { sub: "Mehato e mmalwa e menyenyane, mme lelapa lohle le qala ho ithuta mantswe a matjha.", word: "Batla lentswe la pele", wordSub: "Ngola lentswe lefe kapa lefe, ka puo efe kapa efe, o bone meelelo yohle ya lona.", wordCta: "Batla", game: "Bapala papadi ya pele", gameSub: "Papadi e kgutshwane ya mantswe, ya bana kapa ya hao.", gameCta: "Bapala", optional: "Ha se qobello", progress: "{n} / {total}" },
  ts: { sub: "Magoza ma nga ri mangani yo tsongo, kutani ndyangu hinkwawo wu sungula ku dyondza marito lamantshwa.", word: "Lavisisa rito ro sungula", wordSub: "Tsala rito rin'wana na rin'wana, hi ririmi rin'wana na rin'wana, mi vona tinhlamuselo ta rona hinkwato.", wordCta: "Lavisisa", game: "Tlanga ntlangu wo sungula", gameSub: "Ntlangu wo koma wa marito, wa vana kumbe wa n'wina.", gameCta: "Tlanga", optional: "A swi bohi", progress: "{n} / {total}" },
  ss: { sub: "Tinyatselo letimbalwa letincane, bese umndeni wonkhe ucala kufundza emagama lamasha.", word: "Funa ligama lekucala", wordSub: "Bhala nome nguliphi ligama, nganoma nguluphi lulwimi, ubone tonkhe tinchazelo talo.", wordCta: "Funa", game: "Dlala umdlalo wekucala", gameSub: "Umdlalo lomfisha wemagama, webantfwana nome wakho.", gameCta: "Dlala", optional: "Akuphoco", progress: "{n} / {total}" },
  ve: { sub: "Zwiṱepe zwiṱuku zwi si gathi, nahone muṱa woṱhe u thoma u guda maipfi maswa.", word: "Ṱoḓani ipfi ḽa u thoma", wordSub: "Ṅwalani ipfi ḽiṅwe na ḽiṅwe, nga luambo luṅwe na luṅwe, ni vhone ṱhalutshedzo dzaḽo dzoṱhe.", wordCta: "Ṱoḓani", game: "Tambani mutambo wa u thoma", gameSub: "Mutambo mupfufhi wa maipfi, wa vhana kana waṋu.", gameCta: "Tambani", optional: "A zwi kombetshedzwi", progress: "{n} / {total}" },
  nr: { sub: "Amagadango amambalwa amancani, begodu umndeni woke uthoma ukufunda amagama amatjha.", word: "Funa igama lokuthoma", wordSub: "Tlola nanyana ngiliphi igama, ngelimi nanyana ngiliphi, ubone zoke iinhlathululo zalo.", wordCta: "Funa", game: "Dlala umdlalo wokuthoma", gameSub: "Umdlalo omfitjhani wamagama, wabantwana namkha wakho.", gameCta: "Dlala", optional: "Akukateleleki", progress: "{n} / {total}" },
  vi: { sub: "Vài bước nhỏ, và cả gia đình bắt đầu học từ mới.", word: "Tra từ đầu tiên", wordSub: "Gõ bất kỳ từ nào, bằng bất kỳ ngôn ngữ nào, và xem tất cả nghĩa của nó.", wordCta: "Tra từ", game: "Chơi trò chơi đầu tiên", gameSub: "Một trò chơi chữ ngắn, cho các con hoặc cho bạn.", gameCta: "Chơi", optional: "Không bắt buộc", progress: "{n}/{total}" },
  fil: { sub: "Ilang maliliit na hakbang at ang buong pamilya ay magsisimulang matuto ng mga bagong salita.", word: "Maghanap ng unang salita", wordSub: "Mag-type ng kahit anong salita, sa kahit anong wika, at tingnan ang lahat ng kahulugan nito.", wordCta: "Hanapin", game: "Maglaro ng unang laro", gameSub: "Isang maikling laro ng mga salita, para sa mga bata o para sa iyo.", gameCta: "Maglaro", optional: "Opsyonal", progress: "{n} sa {total}" },
  af: { sub: "'n Paar klein stappies en die hele gesin begin nuwe woorde leer.", word: "Soek 'n eerste woord", wordSub: "Tik enige woord, in enige taal, en sien al sy betekenisse.", wordCta: "Soek", game: "Speel 'n eerste speletjie", gameSub: "'n Kort woordspeletjie, vir die kinders of vir jou.", gameCta: "Speel", optional: "Opsioneel", progress: "{n} van {total}" },
  sw: { sub: "Hatua chache ndogo, na familia nzima inaanza kujifunza maneno mapya.", word: "Tafuta neno la kwanza", wordSub: "Andika neno lolote, kwa lugha yoyote, uone maana zake zote.", wordCta: "Tafuta", game: "Cheza mchezo wa kwanza", gameSub: "Mchezo mfupi wa maneno, kwa watoto au kwako.", gameCta: "Cheza", optional: "Si lazima", progress: "{n} kati ya {total}" },
  "zh-CN": { sub: "几个小步骤，全家就开始学习新词。", word: "查第一个词", wordSub: "输入任意语言的任意一个词，看看它的所有意思。", wordCta: "搜索", game: "玩第一个游戏", gameSub: "一个简短的单词游戏，孩子或您都可以玩。", gameCta: "开始玩", optional: "可选", progress: "{n} / {total}" },
  "zh-TW": { sub: "幾個小步驟，全家就開始學習新詞。", word: "查第一個詞", wordSub: "輸入任何語言的任何一個詞，看看它的所有意思。", wordCta: "搜尋", game: "玩第一個遊戲", gameSub: "一個簡短的單字遊戲，孩子或您都可以玩。", gameCta: "開始玩", optional: "可選", progress: "{n} / {total}" },
  ko: { sub: "몇 가지 작은 단계로 온 가족이 새 단어를 배우기 시작해요.", word: "첫 단어 찾아보기", wordSub: "어떤 언어로든 단어를 입력하면 모든 뜻을 볼 수 있어요.", wordCta: "검색", game: "첫 게임 해보기", gameSub: "아이들도, 부모님도 할 수 있는 짧은 단어 게임이에요.", gameCta: "게임하기", optional: "선택", progress: "{n} / {total}" },
  th: { sub: "เพียงไม่กี่ขั้นตอนเล็ก ๆ ทั้งครอบครัวก็เริ่มเรียนรู้คำใหม่ ๆ", word: "ค้นหาคำแรก", wordSub: "พิมพ์คำใดก็ได้ ในภาษาใดก็ได้ แล้วดูความหมายทั้งหมดของคำนั้น", wordCta: "ค้นหา", game: "เล่นเกมแรก", gameSub: "เกมคำศัพท์สั้น ๆ สำหรับลูก ๆ หรือสำหรับคุณ", gameCta: "เล่น", optional: "ไม่บังคับ", progress: "{n} จาก {total}" },
  bn: { sub: "কয়েকটি ছোট ধাপ, আর পুরো পরিবার নতুন শব্দ শিখতে শুরু করে।", word: "প্রথম শব্দ খোঁজা", wordSub: "যেকোনো ভাষায় যেকোনো শব্দ লিখুন এবং তার সব অর্থ দেখুন।", wordCta: "খুঁজুন", game: "প্রথম খেলা খেলা", gameSub: "শব্দের একটি ছোট খেলা, সন্তানদের জন্য বা আপনার জন্য।", gameCta: "খেলুন", optional: "ঐচ্ছিক", progress: "{total}টির মধ্যে {n}টি" },
  da: { sub: "Et par små skridt, og hele familien begynder at lære nye ord.", word: "Slå et første ord op", wordSub: "Skriv et hvilket som helst ord, på et hvilket som helst sprog, og se alle dets betydninger.", wordCta: "Søg", game: "Spil et første spil", gameSub: "Et kort ordspil, for børnene eller for dig.", gameCta: "Spil", optional: "Valgfrit", progress: "{n} af {total}" },
  hu: { sub: "Néhány apró lépés, és az egész család új szavakat kezd tanulni.", word: "Az első szó megkeresése", wordSub: "Írj be bármilyen szót, bármilyen nyelven, és nézd meg az összes jelentését.", wordCta: "Keresés", game: "Az első játék kipróbálása", gameSub: "Egy rövid szójáték, a gyerekeknek vagy neked.", gameCta: "Játék", optional: "Nem kötelező", progress: "{n} / {total}" },
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

type FirstStepsData =
  | { eligible: false }
  | {
      eligible: true;
      inWindow: boolean;
      startMs: number | null;
      steps: { child: boolean; word: boolean; game: boolean; secondParent: boolean };
    };

const isChildRole = (r: string) => r === "boy" || r === "girl";

/** Shared-device Kids Mode session (the /kids switcher). */
function kidsSessionOn(): boolean {
  try {
    return sessionStorage.getItem("gadit-kids-mode") === "1";
  } catch {
    return false;
  }
}

const noopSubscribe = () => () => {};

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

/** Installed as an app (home-screen PWA or the Android app), or marked done
 *  on this device earlier. The iOS app is checked with its own hook. */
function homeScreenSaved(): boolean {
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return standalone || isTwa() || readFlag(HOMESCREEN_KEY);
}

/**
 * FIRST STEPS card for a new Family owner (Gadi 2026-08-03, rebuilt
 * 2026-10-21 to push real use: 20 of 63 paying families had never added a
 * child, 18 subscribers had never looked up a word).
 *
 * Shown ONLY to the Family owner on a paid plan: never to a kid, a paired
 * parent, a coach, Kids Mode, a school or an individual. The server
 * (/api/family/first-steps) re-checks the owner and reads the steps from
 * real data. Steps, in order: add a child, look up a first word, play a
 * first game, keep Gadit on the home screen (device-local, as before), and
 * last, optional, the second parent. "2 of 4" counts the required four.
 *
 *   placement "home":   the search home, during the first 14 days of the
 *                       plan; "first word" focuses the search box.
 *   placement "family": the /family dashboard, while steps remain; the
 *                       roster comes live from the page (`members`).
 *
 * Hides itself once the four required steps are done, or when dismissed
 * (per account, on this device). Never mentions prices or the plan.
 */
export function FamilySetupChecklist({
  placement,
  members,
  lang: langProp,
  onFirstWord,
}: {
  placement: "home" | "family";
  /** Live roster from the /family page; the server's answer is used otherwise. */
  members?: FamilyMember[];
  lang?: string;
  /** Home page: focus the search box. Without it the step links home. */
  onFirstWord?: () => void;
}) {
  const href = useHref();
  const { lang: ctxLang } = useLang();
  const lang = langProp ?? ctxLang;
  const t = COPY[lang] ?? COPY.en;
  const m = MORE[lang] ?? MORE.en;
  const { user, planReady, plan, familyId, familyRole, schoolId } = useAuth();
  const [kidsToggleOn] = useKidsMode();
  const isIosApp = useIsIosApp();

  const uid = user?.uid ?? "";
  const ownerOnClient =
    !!user && planReady && familyId === uid && familyRole === null && !schoolId && (plan === "clear" || plan === "deep");

  // The server's answer, kept with the uid it belongs to, so a switch of
  // account on this device never shows the previous account's steps.
  const [loaded, setLoaded] = useState<{ uid: string; data: FirstStepsData } | null>(null);
  const [dismissedNow, setDismissedNow] = useState(false);
  const [homeMarked, setHomeMarked] = useState(false);
  const [showHomeHelp, setShowHomeHelp] = useState(false);
  // Browser-only facts, read without an effect (server render: false).
  const kidsSession = useSyncExternalStore(noopSubscribe, kidsSessionOn, () => false);
  const homeFromDevice = useSyncExternalStore(noopSubscribe, homeScreenSaved, () => false);
  const dismissedStored = useSyncExternalStore(noopSubscribe, () => readFlag(`${DISMISS_KEY}:${uid}`), () => false);

  useEffect(() => {
    if (!ownerOnClient || !user) return;
    let cancelled = false;
    const load = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/family/first-steps", { headers: { Authorization: `Bearer ${idToken}` }, cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as FirstStepsData;
        if (!cancelled) setLoaded({ uid: user.uid, data: json });
      } catch { /* the card is a nudge; stay silent */ }
    };
    void load();
    // Back from a word page or a game in another tab: tick the step.
    const onVisible = () => { if (document.visibilityState === "visible") void load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { cancelled = true; document.removeEventListener("visibilitychange", onVisible); };
  }, [ownerOnClient, user]);

  const data = loaded && loaded.uid === uid ? loaded.data : null;
  if (!ownerOnClient || dismissedNow || dismissedStored || kidsToggleOn || kidsSession) return null;
  if (!data || !data.eligible) return null;
  if (placement === "home" && !data.inWindow) return null;

  const child = members ? members.some((x) => isChildRole(x.role)) : data.steps.child;
  const secondParent = members ? members.filter((x) => isParentRole(x.role)).length > 1 : data.steps.secondParent;
  const word = data.steps.word;
  const game = data.steps.game;
  const home = homeMarked || homeFromDevice || isIosApp;

  const required = [child, word, game, home];
  const doneCount = required.filter(Boolean).length;
  if (doneCount === required.length) return null;

  const markHomeDone = () => {
    setHomeMarked(true);
    setShowHomeHelp(false);
    try { localStorage.setItem(HOMESCREEN_KEY, "1"); } catch { /* blocked */ }
  };
  const dismiss = () => {
    setDismissedNow(true);
    try { localStorage.setItem(`${DISMISS_KEY}:${uid}`, "1"); } catch { /* blocked */ }
  };
  const progress = m.progress.replace("{n}", String(doneCount)).replace("{total}", String(required.length));

  return (
    <section className={`fam-chk fam-chk--${placement}`} aria-label={t.title}>
      <style>{CHK_CSS}</style>
      <div className="fam-chk-head">
        <div className="fam-chk-headtext">
          <h2 className="fam-chk-title">{t.title}</h2>
          <p className="fam-chk-sub"><QText text={m.sub} wordLang={lang} /></p>
        </div>
        <button type="button" className="fam-chk-dismiss" onClick={dismiss}>{t.dismiss}</button>
      </div>
      <div className="fam-chk-progress">
        <span className="fam-chk-progress-text">{progress}</span>
        <span className="fam-chk-bar" aria-hidden>
          <span style={{ width: `${(doneCount / required.length) * 100}%` }} />
        </span>
      </div>

      <ul className="fam-chk-list">
        <Step n={1} done={child} label={t.step2} sub={t.step2sub} doneText={t.done} lang={lang}
          cta={<Link href={href("/family/add")} className="fam-chk-cta">{t.add}</Link>} />

        <Step n={2} done={word} label={m.word} sub={m.wordSub} doneText={t.done} lang={lang}
          cta={onFirstWord
            ? <button type="button" className="fam-chk-cta" onClick={onFirstWord}>{m.wordCta}</button>
            : <Link href={href("/")} className="fam-chk-cta">{m.wordCta}</Link>} />

        <Step n={3} done={game} label={m.game} sub={m.gameSub} doneText={t.done} lang={lang}
          cta={<Link href={href("/play")} className="fam-chk-cta">{m.gameCta}</Link>} />

        <Step n={4} done={home} label={t.step3} sub={t.step3sub} doneText={t.done} lang={lang}
          help={showHomeHelp && !home ? t.homeHelp : null}
          cta={showHomeHelp
            ? <button type="button" className="fam-chk-cta" onClick={markHomeDone}>{t.markDone}</button>
            : <button type="button" className="fam-chk-cta fam-chk-cta-ghost" onClick={() => setShowHomeHelp(true)}>{t.cta}</button>} />

        <Step n={5} done={secondParent} label={t.step1} sub={t.step1sub} doneText={t.done} lang={lang} optional={m.optional}
          cta={<Link href={href("/family/add")} className="fam-chk-cta fam-chk-cta-ghost">{t.add}</Link>} />
      </ul>
    </section>
  );
}

function Step({ n, done, label, sub, doneText, lang, cta, help, optional }: {
  n: number;
  done: boolean;
  label: string;
  sub: string;
  doneText: string;
  lang: string;
  cta: ReactNode;
  help?: string | null;
  optional?: string;
}) {
  return (
    <li className={`fam-chk-item ${done ? "is-done" : ""}${optional ? " is-optional" : ""}`}>
      <CheckCircle done={done} n={n} />
      <div className="fam-chk-body">
        <span className="fam-chk-label">
          {label}
          {optional && <span className="fam-chk-opt">{optional}</span>}
        </span>
        <span className="fam-chk-itemsub">{done ? doneText : <QText text={sub} wordLang={lang} />}</span>
        {help && <span className="fam-chk-help"><QText text={help} wordLang={lang} /></span>}
      </div>
      {!done && cta}
    </li>
  );
}

const CHK_CSS = `
.fam-chk {
  background: var(--card, #fff);
  border: 1px solid var(--hairline, #E6E9EC);
  border-radius: 18px;
  padding: 20px 22px;
  margin-bottom: 22px;
  box-shadow: 0 1px 2px rgba(16,24,40,.04);
  text-align: start;
  width: 100%;
  box-sizing: border-box;
}
.fam-chk--home { margin: 26px 0 0; }
.fam-chk-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:10px; }
.fam-chk-headtext { min-width:0; }
.fam-chk-title { margin:0; font-size:17px; font-weight:700; color:var(--ink, #0F172A); line-height:1.25; }
.fam-chk-sub { margin:3px 0 0; font-size:13.5px; color:#64748B; line-height:1.45; }
.fam-chk-dismiss { flex-shrink:0; background:none; border:none; color:#94A3B8; font-size:12.5px; font-weight:600; cursor:pointer; padding:2px 4px; }
.fam-chk-dismiss:hover { color:#64748B; }
.fam-chk-progress { display:flex; align-items:center; gap:10px; margin:0 0 14px; }
.fam-chk-progress-text { flex-shrink:0; font-size:12.5px; font-weight:650; color:#0E7C74; font-variant-numeric: tabular-nums; }
.fam-chk-bar { flex:1; height:6px; border-radius:999px; background:#E6FBF8; overflow:hidden; }
.fam-chk-bar > span { display:block; height:100%; border-radius:999px; background:#0EA5A5; transition: width .3s ease; }
.fam-chk-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px; }
.fam-chk-item { display:flex; align-items:center; gap:13px; padding:12px 14px; border:1px solid #EEF1F4; border-radius:13px; background:#FBFCFD; transition:background .15s, border-color .15s; }
.fam-chk-item.is-done { background:#F0FDFA; border-color:#CCF3EF; }
.fam-chk-circle { flex-shrink:0; width:26px; height:26px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:#0EA5A5; background:#E6FBF8; box-shadow: inset 0 0 0 1.5px #B7EEE8; }
.fam-chk-circle.is-done { color:#fff; background:#0EA5A5; box-shadow:none; }
.fam-chk-item.is-optional:not(.is-done) .fam-chk-circle { color:#94A3B8; background:#F1F5F9; box-shadow: inset 0 0 0 1.5px #E2E8F0; }
.fam-chk-body { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
.fam-chk-label { display:flex; flex-wrap:wrap; align-items:center; column-gap:7px; row-gap:3px; font-size:14.5px; font-weight:650; color:var(--ink, #0F172A); line-height:1.3; }
.fam-chk-opt { display:inline-block; padding:1px 7px; border-radius:999px; background:#F1F5F9; color:#64748B; font-size:11px; font-weight:600; vertical-align:2px; }
.fam-chk-item.is-done .fam-chk-label { color:#0E7C74; }
.fam-chk-itemsub { font-size:12.5px; color:#64748B; line-height:1.4; }
.fam-chk-help { font-size:12.5px; color:#475569; line-height:1.45; margin-top:6px; background:#F1F5F9; border-radius:9px; padding:8px 10px; }
.fam-chk-cta { flex-shrink:0; background:#0EA5A5; color:#fff; border:none; border-radius:9px; padding:8px 15px; font-size:13px; font-weight:650; cursor:pointer; text-decoration:none; white-space:nowrap; font-family:inherit; }
.fam-chk-cta:hover { background:#0C9088; }
.fam-chk-cta-ghost { background:var(--card, #fff); color:#0E7C74; box-shadow: inset 0 0 0 1.5px #B7EEE8; }
.fam-chk-cta-ghost:hover { background:#F0FDFA; }
@media (max-width: 480px) {
  .fam-chk { padding:16px 14px; border-radius:16px; }
  .fam-chk-item { gap:10px; padding:11px 11px; }
  .fam-chk-cta { padding:8px 12px; }
}
html[data-theme="dark"] .fam-chk-item { background:rgba(255,255,255,.03); border-color:rgba(255,255,255,.08); }
html[data-theme="dark"] .fam-chk-item.is-done { background:rgba(14,165,165,.10); border-color:rgba(14,165,165,.28); }
html[data-theme="dark"] .fam-chk-sub, html[data-theme="dark"] .fam-chk-itemsub { color:#94A3B8; }
html[data-theme="dark"] .fam-chk-help, html[data-theme="dark"] .fam-chk-opt { background:rgba(255,255,255,.06); color:#CBD5E1; }
html[data-theme="dark"] .fam-chk-item.is-done .fam-chk-label, html[data-theme="dark"] .fam-chk-progress-text { color:#5EEAD4; }
`;

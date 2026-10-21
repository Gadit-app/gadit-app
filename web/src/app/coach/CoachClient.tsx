"use client";

import { WaitText, WaitDots } from "@/components/WaitText";
import { payUrl } from "@/lib/pay-url";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { memberColorFor, avatarUrl } from "@/lib/family";
import { playNotActive } from "@/lib/play-copy";

type Student = {
  grantId: string;
  familyId: string;
  memberId: string;
  memberName: string;
  avatarPhotoUrl: string;
  avatarId: string;
  colorIndex: number;
  /** The family stopped paying: access is paused. */
  inactive?: boolean;
};

const T: Record<string, {
  title: string; lede: string; signin: string; enter: string; entering: string;
  emptyTitle: string; emptyBody: (email: string) => string; err: string; signedInAs: string;
}> = {
  en: {
    title: "Your students",
    lede: "Enter a student's profile to look up and save words together during a lesson.",
    signin: "Sign in to see your students",
    enter: "Enter",
    entering: "Entering...",
    emptyTitle: "No students yet",
    emptyBody: (email) => `Ask a parent to add you as a coach with this email: ${email}. Once they do, the child appears here.`,
    err: "Something went wrong. Try again.",
    signedInAs: "Signed in as",
  },
  he: {
    title: "התלמידים שלך",
    lede: "היכנס לפרופיל של תלמיד כדי לחפש ולשמור מילים יחד במהלך השיעור.",
    signin: "התחבר כדי לראות את התלמידים שלך",
    enter: "כניסה",
    entering: "נכנס...",
    emptyTitle: "אין עדיין תלמידים",
    emptyBody: (email) => `בקשו מההורה להוסיף אתכם כמאמנים עם האימייל הזה: ${email}. ברגע שזה יקרה, הילד יופיע כאן.`,
    err: "משהו השתבש. נסה שוב.",
    signedInAs: "מחובר בתור",
  },
  ar: {
    title: "طلابك",
    lede: "ادخل إلى ملف الطالب للبحث عن الكلمات وحفظها معًا أثناء الدرس.",
    signin: "سجّل الدخول لرؤية طلابك",
    enter: "دخول",
    entering: "جارٍ الدخول...",
    emptyTitle: "لا يوجد طلاب بعد",
    emptyBody: (email) => `اطلب من أحد الوالدين إضافتك كمدرّب باستخدام هذا البريد الإلكتروني: ${email}. بعد ذلك سيظهر الطفل هنا.`,
    err: "حدث خطأ ما. حاول مرة أخرى.",
    signedInAs: "مسجّل الدخول باسم",
  },
  ru: {
    title: "Ваши ученики",
    lede: "Откройте профиль ученика, чтобы вместе искать и сохранять слова во время занятия.",
    signin: "Войдите, чтобы увидеть своих учеников",
    enter: "Войти",
    entering: "Вход...",
    emptyTitle: "Учеников пока нет",
    emptyBody: (email) => `Попросите родителя добавить вас как наставника по этому адресу: ${email}. После этого ребёнок появится здесь.`,
    err: "Что-то пошло не так. Попробуйте ещё раз.",
    signedInAs: "Вы вошли как",
  },
  es: {
    title: "Tus alumnos",
    lede: "Entra en el perfil de un alumno para buscar y guardar palabras juntos durante la clase.",
    signin: "Inicia sesión para ver a tus alumnos",
    enter: "Entrar",
    entering: "Entrando...",
    emptyTitle: "Aún no hay alumnos",
    emptyBody: (email) => `Pide a un padre o madre que te añada como tutor con este correo: ${email}. En cuanto lo haga, el niño aparecerá aquí.`,
    err: "Algo salió mal. Inténtalo de nuevo.",
    signedInAs: "Sesión iniciada como",
  },
  pt: {
    title: "Seus alunos",
    lede: "Entre no perfil de um aluno para pesquisar e salvar palavras juntos durante a aula.",
    signin: "Entre para ver seus alunos",
    enter: "Entrar",
    entering: "Entrando...",
    emptyTitle: "Ainda não há alunos",
    emptyBody: (email) => `Peça a um responsável que adicione você como tutor com este e-mail: ${email}. Assim que isso for feito, a criança aparece aqui.`,
    err: "Algo deu errado. Tente novamente.",
    signedInAs: "Conectado como",
  },
  fr: {
    title: "Vos élèves",
    lede: "Ouvrez le profil d'un élève pour chercher et enregistrer des mots ensemble pendant la séance.",
    signin: "Connectez-vous pour voir vos élèves",
    enter: "Entrer",
    entering: "Connexion...",
    emptyTitle: "Aucun élève pour l'instant",
    emptyBody: (email) => `Demandez à un parent de vous ajouter comme accompagnateur avec cette adresse e-mail : ${email}. Dès que c'est fait, l'enfant apparaît ici.`,
    err: "Une erreur s'est produite. Réessayez.",
    signedInAs: "Connecté en tant que",
  },
  de: {
    title: "Deine Schüler",
    lede: "Öffne das Profil eines Schülers, um während der Stunde gemeinsam Wörter nachzuschlagen und zu speichern.",
    signin: "Melde dich an, um deine Schüler zu sehen",
    enter: "Öffnen",
    entering: "Wird geöffnet...",
    emptyTitle: "Noch keine Schüler",
    emptyBody: (email) => `Bitte ein Elternteil, dich mit dieser E-Mail-Adresse als Coach hinzuzufügen: ${email}. Danach erscheint das Kind hier.`,
    err: "Etwas ist schiefgelaufen. Bitte versuch es noch einmal.",
    signedInAs: "Angemeldet als",
  },
  cs: {
    title: "Vaši žáci",
    lede: "Otevřete profil žáka a během lekce společně vyhledávejte a ukládejte slova.",
    signin: "Přihlaste se a uvidíte své žáky",
    enter: "Vstoupit",
    entering: "Vstupuji...",
    emptyTitle: "Zatím žádní žáci",
    emptyBody: (email) => `Požádejte rodiče, aby vás přidal jako lektora s tímto e-mailem: ${email}. Jakmile to udělá, dítě se zobrazí zde.`,
    err: "Něco se pokazilo. Zkuste to znovu.",
    signedInAs: "Přihlášeno jako",
  },
  sk: {
    title: "Vaši žiaci",
    lede: "Otvorte profil žiaka a počas hodiny spoločne vyhľadávajte a ukladajte slová.",
    signin: "Prihláste sa a uvidíte svojich žiakov",
    enter: "Vstúpiť",
    entering: "Vstupujem...",
    emptyTitle: "Zatiaľ žiadni žiaci",
    emptyBody: (email) => `Požiadajte rodiča, aby vás pridal ako lektora s týmto e-mailom: ${email}. Keď to urobí, dieťa sa zobrazí tu.`,
    err: "Niečo sa pokazilo. Skúste to znova.",
    signedInAs: "Prihlásené ako",
  },
  it: {
    title: "I tuoi studenti",
    lede: "Entra nel profilo di uno studente per cercare e salvare parole insieme durante la lezione.",
    signin: "Accedi per vedere i tuoi studenti",
    enter: "Entra",
    entering: "Accesso in corso...",
    emptyTitle: "Ancora nessuno studente",
    emptyBody: (email) => `Chiedi a un genitore di aggiungerti come tutor con questa email: ${email}. Appena lo fa, il bambino compare qui.`,
    err: "Qualcosa è andato storto. Riprova.",
    signedInAs: "Accesso effettuato come",
  },
  ja: {
    title: "担当の生徒",
    lede: "生徒のプロフィールに入って、レッスン中に一緒に言葉を調べて保存しましょう。",
    signin: "ログインすると担当の生徒が表示されます",
    enter: "入る",
    entering: "入室中...",
    emptyTitle: "まだ生徒がいません",
    emptyBody: (email) => `保護者に、このメールアドレスでコーチとして追加してもらってください: ${email}。追加されると、ここにお子さんが表示されます。`,
    err: "問題が発生しました。もう一度お試しください。",
    signedInAs: "ログイン中のアカウント",
  },
  hi: {
    title: "आपके छात्र",
    lede: "पाठ के दौरान साथ मिलकर शब्द खोजने और सहेजने के लिए किसी छात्र की प्रोफ़ाइल में जाएँ।",
    signin: "अपने छात्रों को देखने के लिए साइन इन करें",
    enter: "प्रवेश करें",
    entering: "प्रवेश हो रहा है...",
    emptyTitle: "अभी कोई छात्र नहीं",
    emptyBody: (email) => `किसी अभिभावक से कहें कि वे आपको इस ईमेल से कोच के रूप में जोड़ें: ${email}. जोड़ते ही बच्चा यहाँ दिखाई देगा।`,
    err: "कुछ गलत हो गया। फिर से कोशिश करें।",
    signedInAs: "इस रूप में साइन इन",
  },
  am: {
    title: "ተማሪዎችዎ",
    lede: "በትምህርቱ ወቅት አብራችሁ ቃላትን ለመፈለግና ለማስቀመጥ ወደ ተማሪው መገለጫ ይግቡ።",
    signin: "ተማሪዎችዎን ለማየት ይግቡ",
    enter: "ግባ",
    entering: "በመግባት ላይ...",
    emptyTitle: "እስካሁን ተማሪዎች የሉም",
    emptyBody: (email) => `ወላጅ በዚህ ኢሜይል እንደ አሰልጣኝ እንዲጨምርዎ ይጠይቁ፡ ${email}። ልክ እንደጨመሩዎ ልጁ እዚህ ይታያል።`,
    err: "የሆነ ስህተት ተፈጥሯል። እንደገና ይሞክሩ።",
    signedInAs: "የገቡት እንደ",
  },
  uk: {
    title: "Ваші учні",
    lede: "Відкрийте профіль учня, щоб разом шукати й зберігати слова під час заняття.",
    signin: "Увійдіть, щоб побачити своїх учнів",
    enter: "Увійти",
    entering: "Вхід...",
    emptyTitle: "Учнів поки немає",
    emptyBody: (email) => `Попросіть когось із батьків додати вас як наставника з цією адресою: ${email}. Щойно це буде зроблено, дитина з'явиться тут.`,
    err: "Щось пішло не так. Спробуйте ще раз.",
    signedInAs: "Ви увійшли як",
  },
  tr: {
    title: "Öğrencileriniz",
    lede: "Ders sırasında birlikte kelime arayıp kaydetmek için bir öğrencinin profiline girin.",
    signin: "Öğrencilerinizi görmek için giriş yapın",
    enter: "Gir",
    entering: "Giriliyor...",
    emptyTitle: "Henüz öğrenci yok",
    emptyBody: (email) => `Bir ebeveynden sizi bu e-posta ile koç olarak eklemesini isteyin: ${email}. Eklendiğinde çocuk burada görünür.`,
    err: "Bir şeyler ters gitti. Tekrar deneyin.",
    signedInAs: "Giriş yapılan hesap",
  },
  pl: {
    title: "Twoi uczniowie",
    lede: "Wejdź w profil ucznia, aby podczas lekcji wspólnie wyszukiwać i zapisywać słowa.",
    signin: "Zaloguj się, aby zobaczyć swoich uczniów",
    enter: "Wejdź",
    entering: "Wchodzenie...",
    emptyTitle: "Na razie brak uczniów",
    emptyBody: (email) => `Poproś rodzica, aby dodał Cię jako korepetytora, podając ten adres e-mail: ${email}. Gdy to zrobi, dziecko pojawi się tutaj.`,
    err: "Coś poszło nie tak. Spróbuj ponownie.",
    signedInAs: "Zalogowano jako",
  },
  fa: {
    title: "دانش‌آموزان شما",
    lede: "وارد پروفایل یک دانش‌آموز شوید تا در طول جلسه با هم کلمه‌ها را جست‌وجو و ذخیره کنید.",
    signin: "برای دیدن دانش‌آموزان خود وارد شوید",
    enter: "ورود",
    entering: "در حال ورود...",
    emptyTitle: "هنوز دانش‌آموزی ندارید",
    emptyBody: (email) => `از یکی از والدین بخواهید شما را با این ایمیل به‌عنوان مربی اضافه کند: ${email}. پس از آن، کودک اینجا نمایش داده می‌شود.`,
    err: "مشکلی پیش آمد. دوباره امتحان کنید.",
    signedInAs: "وارد شده با",
  },
  id: {
    title: "Murid Anda",
    lede: "Masuk ke profil murid untuk mencari dan menyimpan kata bersama selama pelajaran.",
    signin: "Masuk untuk melihat murid Anda",
    enter: "Masuk",
    entering: "Sedang masuk...",
    emptyTitle: "Belum ada murid",
    emptyBody: (email) => `Minta orang tua menambahkan Anda sebagai pendamping dengan email ini: ${email}. Setelah itu, anak akan muncul di sini.`,
    err: "Terjadi kesalahan. Coba lagi.",
    signedInAs: "Masuk sebagai",
  },
  nl: {
    title: "Je leerlingen",
    lede: "Open het profiel van een leerling om tijdens de les samen woorden op te zoeken en op te slaan.",
    signin: "Log in om je leerlingen te zien",
    enter: "Openen",
    entering: "Bezig met openen...",
    emptyTitle: "Nog geen leerlingen",
    emptyBody: (email) => `Vraag een ouder om je als coach toe te voegen met dit e-mailadres: ${email}. Zodra dat gebeurd is, verschijnt het kind hier.`,
    err: "Er ging iets mis. Probeer het opnieuw.",
    signedInAs: "Ingelogd als",
  },
  el: {
    title: "Οι μαθητές σου",
    lede: "Μπες στο προφίλ ενός μαθητή για να αναζητάτε και να αποθηκεύετε λέξεις μαζί κατά τη διάρκεια του μαθήματος.",
    signin: "Συνδέσου για να δεις τους μαθητές σου",
    enter: "Είσοδος",
    entering: "Γίνεται είσοδος...",
    emptyTitle: "Δεν υπάρχουν μαθητές ακόμη",
    emptyBody: (email) => `Ζήτησε από έναν γονέα να σε προσθέσει ως προπονητή με αυτό το email: ${email}. Μόλις το κάνει, το παιδί θα εμφανιστεί εδώ.`,
    err: "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
    signedInAs: "Σύνδεση ως",
  },
  zu: {
    title: "Abafundi bakho",
    lede: "Ngena kuphrofayela yomfundi ukuze nibheke futhi nigcine amagama ndawonye phakathi nesifundo.",
    signin: "Ngena ukuze ubone abafundi bakho",
    enter: "Ngena",
    entering: "Iyangena...",
    emptyTitle: "Akukho bafundi okwamanje",
    emptyBody: (email) => `Cela umzali akwengeze njengomqeqeshi ngale imeyili: ${email}. Uma esekwenzile, ingane izovela lapha.`,
    err: "Kukhona okungahambanga kahle. Zama futhi.",
    signedInAs: "Ungene njengo",
  },
  xh: {
    title: "Abafundi bakho",
    lede: "Ngena kwiprofayile yomfundi ukuze nikhangele kwaye nigcine amagama kunye ngexesha lesifundo.",
    signin: "Ngena ukuze ubone abafundi bakho",
    enter: "Ngena",
    entering: "Siyangena...",
    emptyTitle: "Akukabikho bafundi",
    emptyBody: (email) => `Cela umzali akongeze njengomqeqeshi esebenzisa le imeyile: ${email}. Xa enjenjalo, umntwana uza kuvela apha.`,
    err: "Kukho into engahambanga kakuhle. Zama kwakhona.",
    signedInAs: "Ungene njengo",
  },
  nso: {
    title: "Baithuti ba gago",
    lede: "Tsena profaeleng ya moithuti gore le nyake le go boloka mantšu mmogo nakong ya thuto.",
    signin: "Tsena gore o bone baithuti ba gago",
    enter: "Tsena",
    entering: "Re a tsena...",
    emptyTitle: "Ga go eso be le baithuti",
    emptyBody: (email) => `Kgopela motswadi go go oketša bjalo ka mokhoutšhi ka imeile ye: ${email}. Ge a feditše, ngwana o tla bonagala mo.`,
    err: "Go na le se se senyegilego. Leka gape.",
    signedInAs: "O tsene bjalo ka",
  },
  tn: {
    title: "Baithuti ba gago",
    lede: "Tsena mo porofaeleng ya moithuti go batla le go boloka mafoko mmogo ka nako ya thuto.",
    signin: "Tsena go bona baithuti ba gago",
    enter: "Tsena",
    entering: "Re a tsena...",
    emptyTitle: "Ga go ise go nne le baithuti",
    emptyBody: (email) => `Kopa motsadi go go tsenya jaaka mokatisi ka imeile e: ${email}. Fa a sena go dira jalo, ngwana o tla bonala fa.`,
    err: "Go na le sengwe se se sa tsamaeng sentle. Leka gape.",
    signedInAs: "O tsene jaaka",
  },
  st: {
    title: "Baithuti ba hao",
    lede: "Kena profaeleng ya moithuti hore le batle le ho boloka mantswe mmoho nakong ya thuto.",
    signin: "Kena hore o bone baithuti ba hao",
    enter: "Kena",
    entering: "Re a kena...",
    emptyTitle: "Ha ho baithuti hajwale",
    emptyBody: (email) => `Kopa motswadi hore a o kenye jwalo ka mokwetlisi ka imeile ena: ${email}. Ha a qeta, ngwana o tla hlaha mona.`,
    err: "Ho na le se sa tsamayang hantle. Leka hape.",
    signedInAs: "O kene jwalo ka",
  },
  ts: {
    title: "Vadyondzi va n'wina",
    lede: "Nghenani eka phrofayili ya mudyondzi leswaku mi lava no hlayisa marito swin'we hi nkarhi wa dyondzo.",
    signin: "Nghenani leswaku mi vona vadyondzi va n'wina",
    enter: "Nghena",
    entering: "Ku nghena...",
    emptyTitle: "A ku si va na vadyondzi",
    emptyBody: (email) => `Kombelani mutswari a mi engetela tanihi mutoloveti hi imeyili leyi: ${email}. Loko a endlile tano, n'wana u ta humelela laha.`,
    err: "Ku na leswi hoxekeke. Ringetani nakambe.",
    signedInAs: "Mi nghene tanihi",
  },
  ss: {
    title: "Bafundzi bakho",
    lede: "Ngena ephrofayilini yemfundzi kute nisesha futsi nigcine emagama ndzawonye ngesikhatsi sesifundvo.",
    signin: "Ngena kute ubone bafundzi bakho",
    enter: "Ngena",
    entering: "Kuyangenwa...",
    emptyTitle: "Kute bafundzi okwamanje",
    emptyBody: (email) => `Cela umtali akwengete njengemcecesheli ngalemeyili: ${email}. Nasakwentile, umntfwana utawuvela lapha.`,
    err: "Kukhona lokungakahambi kahle. Phindza uzame.",
    signedInAs: "Ungene njenga",
  },
  ve: {
    title: "Vhagudi vhaṋu",
    lede: "Dzhenani kha phrofaiḽi ya mugudi uri ni ṱoḓe na u vhulunga maipfi noṱhe nga tshifhinga tsha ngudo.",
    signin: "Dzhenani uri ni vhone vhagudi vhaṋu",
    enter: "Dzhenani",
    entering: "Ri khou dzhena...",
    emptyTitle: "A hu athu u vha na vhagudi",
    emptyBody: (email) => `Humbelani mubebi uri a ni engedze sa mugudisi nga imeiḽi iyi: ${email}. Musi vho no zwi ita, ṅwana u ḓo vhonala fhano.`,
    err: "Ho khakhea zwiṅwe. Lingedzani hafhu.",
    signedInAs: "No dzhena sa",
  },
  nr: {
    title: "Abafundi bakho",
    lede: "Ngena kuphrofayili yomfundi bona nifune begodu nibulunge amezwi ndawonye ngesikhathi sesifundo.",
    signin: "Ngena bona ubone abafundi bakho",
    enter: "Ngena",
    entering: "Kuyangenwa...",
    emptyTitle: "Akukabikhona abafundi",
    emptyBody: (email) => `Bawa umbelethi bona akufake njengomeluleki nge-imeyili le: ${email}. Nasele enzile, umntwana uzakuvela lapha.`,
    err: "Kukhona okungakahambi kuhle. Linga godu.",
    signedInAs: "Ungene njengo",
  },
  vi: {
    title: "Học viên của bạn",
    lede: "Vào hồ sơ của học viên để cùng tra và lưu từ trong buổi học.",
    signin: "Đăng nhập để xem học viên của bạn",
    enter: "Vào",
    entering: "Đang vào...",
    emptyTitle: "Chưa có học viên nào",
    emptyBody: (email) => `Hãy nhờ phụ huynh thêm bạn làm người kèm học bằng email này: ${email}. Khi họ thêm xong, bé sẽ hiện ở đây.`,
    err: "Có lỗi xảy ra. Hãy thử lại.",
    signedInAs: "Đã đăng nhập với",
  },
  fil: {
    title: "Ang iyong mga estudyante",
    lede: "Pumasok sa profile ng estudyante para sabay kayong maghanap at mag-save ng mga salita habang may leksiyon.",
    signin: "Mag-sign in para makita ang iyong mga estudyante",
    enter: "Pumasok",
    entering: "Pumapasok...",
    emptyTitle: "Wala pang estudyante",
    emptyBody: (email) => `Hilingin sa isang magulang na idagdag ka bilang coach gamit ang email na ito: ${email}. Kapag nagawa na nila, lalabas dito ang bata.`,
    err: "May nangyaring mali. Subukan ulit.",
    signedInAs: "Naka-sign in bilang",
  },
  af: {
    title: "Jou leerders",
    lede: "Gaan in by 'n leerder se profiel om saam woorde op te soek en te stoor tydens die les.",
    signin: "Meld aan om jou leerders te sien",
    enter: "Gaan in",
    entering: "Besig om in te gaan...",
    emptyTitle: "Nog geen leerders nie",
    emptyBody: (email) => `Vra 'n ouer om jou as afrigter by te voeg met hierdie e-posadres: ${email}. Sodra dit gedoen is, verskyn die kind hier.`,
    err: "Iets het verkeerd geloop. Probeer weer.",
    signedInAs: "Aangemeld as",
  },
  sw: {
    title: "Wanafunzi wako",
    lede: "Ingia kwenye wasifu wa mwanafunzi ili mtafute na kuhifadhi maneno pamoja wakati wa somo.",
    signin: "Ingia ili kuona wanafunzi wako",
    enter: "Ingia",
    entering: "Inaingia...",
    emptyTitle: "Bado hakuna wanafunzi",
    emptyBody: (email) => `Mwombe mzazi akuongeze kama mkufunzi kwa barua pepe hii: ${email}. Akishafanya hivyo, mtoto ataonekana hapa.`,
    err: "Kuna tatizo limetokea. Jaribu tena.",
    signedInAs: "Umeingia kama",
  },
  "zh-CN": {
    title: "你的学生",
    lede: "进入学生的个人资料，在课上一起查词、存词。",
    signin: "登录后查看你的学生",
    enter: "进入",
    entering: "正在进入...",
    emptyTitle: "还没有学生",
    emptyBody: (email) => `请家长用这个邮箱把你添加为辅导老师：${email}。添加后，孩子就会出现在这里。`,
    err: "出了点问题，请重试。",
    signedInAs: "当前登录账号",
  },
  "zh-TW": {
    title: "你的學生",
    lede: "進入學生的個人檔案，在課堂上一起查詢、儲存單字。",
    signin: "登入後查看你的學生",
    enter: "進入",
    entering: "正在進入...",
    emptyTitle: "還沒有學生",
    emptyBody: (email) => `請家長用這個電子郵件把你新增為輔導老師：${email}。新增後，孩子就會出現在這裡。`,
    err: "出了點問題，請再試一次。",
    signedInAs: "目前登入帳號",
  },
  ko: {
    title: "내 학생",
    lede: "학생 프로필에 들어가 수업 중에 함께 단어를 찾고 저장하세요.",
    signin: "로그인하면 학생을 볼 수 있어요",
    enter: "입장",
    entering: "입장 중...",
    emptyTitle: "아직 학생이 없어요",
    emptyBody: (email) => `보호자에게 이 이메일로 코치로 추가해 달라고 요청하세요: ${email}. 추가되면 아이가 여기에 표시돼요.`,
    err: "문제가 생겼어요. 다시 시도해 주세요.",
    signedInAs: "로그인 계정",
  },
  th: {
    title: "นักเรียนของคุณ",
    lede: "เข้าโปรไฟล์ของนักเรียนเพื่อค้นหาและบันทึกคำศัพท์ไปด้วยกันระหว่างบทเรียน",
    signin: "เข้าสู่ระบบเพื่อดูนักเรียนของคุณ",
    enter: "เข้า",
    entering: "กำลังเข้า...",
    emptyTitle: "ยังไม่มีนักเรียน",
    emptyBody: (email) => `ขอให้ผู้ปกครองเพิ่มคุณเป็นโค้ชด้วยอีเมลนี้: ${email} เมื่อเพิ่มแล้ว เด็กจะปรากฏที่นี่`,
    err: "มีบางอย่างผิดพลาด ลองอีกครั้ง",
    signedInAs: "เข้าสู่ระบบในชื่อ",
  },
  bn: {
    title: "আপনার শিক্ষার্থীরা",
    lede: "পাঠের সময় একসাথে শব্দ খুঁজতে ও সংরক্ষণ করতে কোনো শিক্ষার্থীর প্রোফাইলে প্রবেশ করুন।",
    signin: "আপনার শিক্ষার্থীদের দেখতে সাইন ইন করুন",
    enter: "প্রবেশ",
    entering: "প্রবেশ করা হচ্ছে...",
    emptyTitle: "এখনো কোনো শিক্ষার্থী নেই",
    emptyBody: (email) => `কোনো অভিভাবককে এই ইমেইল দিয়ে আপনাকে কোচ হিসেবে যোগ করতে বলুন: ${email}। যোগ করলেই শিশুটি এখানে দেখা যাবে।`,
    err: "কিছু একটা গোলমাল হয়েছে। আবার চেষ্টা করুন।",
    signedInAs: "সাইন ইন করা আছে",
  },
  da: {
    title: "Dine elever",
    lede: "Gå ind på en elevs profil for at slå ord op og gemme dem sammen i løbet af timen.",
    signin: "Log ind for at se dine elever",
    enter: "Gå ind",
    entering: "Går ind...",
    emptyTitle: "Ingen elever endnu",
    emptyBody: (email) => `Bed en forælder om at tilføje dig som coach med denne e-mail: ${email}. Så snart det er gjort, vises barnet her.`,
    err: "Noget gik galt. Prøv igen.",
    signedInAs: "Logget ind som",
  },
  hu: {
    title: "Tanítványaid",
    lede: "Lépj be egy tanítvány profiljába, hogy az óra alatt közösen keressetek és mentsetek szavakat.",
    signin: "Jelentkezz be, hogy lásd a tanítványaidat",
    enter: "Belépés",
    entering: "Belépés...",
    emptyTitle: "Még nincsenek tanítványok",
    emptyBody: (email) => `Kérj meg egy szülőt, hogy adjon hozzá coachként ezzel az e-mail-címmel: ${email}. Amint megteszi, a gyermek itt megjelenik.`,
    err: "Valami hiba történt. Próbáld újra.",
    signedInAs: "Bejelentkezve mint",
  },
};
/** The family stopped paying, so coach access is paused (Gadi 2026-10-12). */
const FAMILY_INACTIVE: Record<string, string> = {
  en: "The family's plan isn't active right now, so access is paused.",
  he: "המנוי של המשפחה לא פעיל כרגע, ולכן הגישה מושהית.",
  ar: "اشتراك العائلة غير نشط حاليًا، لذلك الوصول متوقف مؤقتًا.",
  ru: "Подписка семьи сейчас не активна, поэтому доступ приостановлен.",
  es: "El plan de la familia no está activo ahora, así que el acceso está en pausa.",
  pt: "O plano da família não está ativo agora, por isso o acesso está pausado.",
  fr: "L'abonnement de la famille n'est pas actif pour le moment, l'accès est donc suspendu.",
  de: "Das Abo der Familie ist gerade nicht aktiv, daher ist der Zugang pausiert.",
  cs: "Předplatné rodiny teď není aktivní, proto je přístup pozastaven.",
  sk: "Predplatné rodiny teraz nie je aktívne, preto je prístup pozastavený.",
  it: "L'abbonamento della famiglia ora non è attivo, quindi l'accesso è in pausa.",
  ja: "ご家族のプランが現在有効ではないため、アクセスは一時停止中です。",
  hi: "परिवार का प्लान अभी सक्रिय नहीं है, इसलिए पहुँच रुकी हुई है।",
  am: "የቤተሰቡ ምዝገባ አሁን ንቁ ስላልሆነ መዳረሻው ለጊዜው ቆሟል።",
  uk: "Підписка родини зараз не активна, тому доступ призупинено.",
  tr: "Ailenin planı şu anda etkin değil, bu yüzden erişim duraklatıldı.",
  pl: "Plan rodziny nie jest teraz aktywny, więc dostęp jest wstrzymany.",
  fa: "اشتراک خانواده در حال حاضر فعال نیست، به همین دلیل دسترسی متوقف شده است.",
  id: "Paket keluarga sedang tidak aktif, jadi akses dijeda.",
  nl: "Het abonnement van het gezin is nu niet actief, dus de toegang is gepauzeerd.",
  el: "Η συνδρομή της οικογένειας δεν είναι ενεργή αυτή τη στιγμή, γι' αυτό η πρόσβαση έχει παυθεί.",
  zu: "Uhlelo lomndeni alusebenzi manje, ngakho ukufinyelela kumisiwe okwesikhashana.",
  xh: "Isicwangciso sosapho asisebenzi okwangoku, ngoko ukufikelela kumisiwe okwexeshana.",
  nso: "Leano la lapa ga le šome bjale, ka fao phihlelelo e emišitšwe nakwana.",
  tn: "Leano la lelapa ga le dire ga jaana, ka jalo phitlhelelo e emisitswe.",
  st: "Moralo wa lelapa ha o sebetse hona jwale, kahoo ho kena ho emisitswe nakwana.",
  ts: "Pulani ya ndyangu a yi tirhi sweswi, hikwalaho ku nghena ku yimisiwile.",
  ss: "Lihlelo lemndeni alisebenti nyalo, ngako kungena kumisiwe okwesikhashana.",
  ve: "Pulane ya muṱa a i khou shuma zwino, ngauralo u dzhena ho imiswa.",
  nr: "Ihlelo lomndeni alisebenzi nje, ngalokho ukungena kumisiwe.",
  vi: "Gói của gia đình hiện không hoạt động, nên quyền truy cập tạm dừng.",
  fil: "Hindi aktibo ngayon ang plano ng pamilya, kaya naka-pause ang access.",
  af: "Die gesin se plan is nou nie aktief nie, daarom is toegang tydelik gestaak.",
  sw: "Mpango wa familia haufanyi kazi sasa, kwa hiyo ufikiaji umesitishwa.",
  "zh-CN": "这个家庭的订阅目前未生效，因此访问已暂停。",
  "zh-TW": "這個家庭的訂閱目前未生效，因此存取已暫停。",
  ko: "가족 요금제가 지금 활성 상태가 아니어서 접근이 일시 중지되었어요.",
  th: "แพ็กเกจของครอบครัวยังไม่ได้ใช้งานอยู่ตอนนี้ จึงหยุดการเข้าถึงไว้ชั่วคราว",
  bn: "পরিবারের প্ল্যান এখন সক্রিয় নয়, তাই অ্যাক্সেস সাময়িকভাবে বন্ধ।",
  da: "Familiens abonnement er ikke aktivt lige nu, så adgangen er sat på pause.",
  hu: "A család előfizetése most nem aktív, ezért a hozzáférés szünetel.",
};

/** A coach needs a paid plan (Gadi 2026-10-12). [message, button] */
const NEEDS_PLAN: Record<string, [string, string]> = {
  en: ["To coach students on Gadit you need an Individual or Family plan.", "Choose a plan"],
  he: ["כדי לאמן תלמידים ב-Gadit צריך מנוי Individual או Family.", "לבחירת מנוי"],
  ar: ["لتدريب الطلاب على Gadit تحتاجون اشتراك Individual أو Family.", "اختيار اشتراك"],
  ru: ["Чтобы заниматься с учениками в Gadit, нужен тариф Individual или Family.", "Выбрать тариф"],
  es: ["Para entrenar alumnos en Gadit necesitas un plan Individual o Family.", "Elegir un plan"],
  pt: ["Para treinar alunos no Gadit você precisa de um plano Individual ou Family.", "Escolher um plano"],
  fr: ["Pour accompagner des élèves sur Gadit, il faut un abonnement Individual ou Family.", "Choisir un abonnement"],
  de: ["Um Schüler in Gadit zu betreuen, braucht ihr ein Individual- oder Family-Abo.", "Abo wählen"],
  cs: ["Pro práci s žáky v Gadit potřebujete předplatné Individual nebo Family.", "Vybrat předplatné"],
  sk: ["Na prácu so žiakmi v Gadit potrebujete predplatné Individual alebo Family.", "Vybrať predplatné"],
  it: ["Per seguire studenti su Gadit serve un abbonamento Individual o Family.", "Scegli un abbonamento"],
  ja: ["Gaditで生徒を指導するには、IndividualまたはFamilyプランが必要です。", "プランを選ぶ"],
  hi: ["Gadit पर छात्रों को सिखाने के लिए Individual या Family प्लान चाहिए।", "प्लान चुनें"],
  am: ["በGadit ተማሪዎችን ለማሰልጠን Individual ወይም Family ምዝገባ ያስፈልጋል።", "ምዝገባ ምረጡ"],
  uk: ["Щоб займатися з учнями в Gadit, потрібен тариф Individual або Family.", "Обрати тариф"],
  tr: ["Gadit'te öğrenci çalıştırmak için Individual veya Family planı gerekir.", "Plan seç"],
  pl: ["Aby uczyć uczniów w Gadit, potrzebny jest plan Individual lub Family.", "Wybierz plan"],
  fa: ["برای آموزش شاگردان در Gadit به اشتراک Individual یا Family نیاز دارید.", "انتخاب اشتراک"],
  id: ["Untuk melatih murid di Gadit, Anda perlu paket Individual atau Family.", "Pilih paket"],
  nl: ["Om leerlingen te begeleiden in Gadit heb je een Individual- of Family-abonnement nodig.", "Kies een abonnement"],
  el: ["Για να εκπαιδεύετε μαθητές στο Gadit χρειάζεστε συνδρομή Individual ή Family.", "Επιλογή συνδρομής"],
  zu: ["Ukuze uqeqeshe abafundi ku-Gadit udinga uhlelo lwe-Individual noma lwe-Family.", "Khetha uhlelo"],
  xh: ["Ukuze uqeqeshe abafundi kwi-Gadit ufuna isicwangciso se-Individual okanye se-Family.", "Khetha isicwangciso"],
  nso: ["Gore o thuše baithuti go Gadit bjalo ka mokhoutšhi o nyaka leano la Individual goba la Family.", "Kgetha leano"],
  tn: ["Go katisa baithuti mo Gadit o tlhoka leano la Individual kgotsa Family.", "Tlhopha leano"],
  st: ["Ho kwetlisa baithuti ho Gadit o hloka moralo wa Individual kapa Family.", "Kgetha moralo"],
  ts: ["Leswaku mi toloveta vadyondzi eka Gadit mi lava pulani ya Individual kumbe ya Family.", "Hlawula pulani"],
  ss: ["Kute ucecesha bafundzi ku-Gadit udzinga lihlelo le-Individual nobe le-Family.", "Khetsa lihlelo"],
  ve: ["Uri ni gudise vhagudi kha Gadit ni ṱoḓa pulane ya Individual kana ya Family.", "Khethani pulane"],
  nr: ["Bona weluleke abafundi ku-Gadit utlhoga ihlelo le-Individual namkha le-Family.", "Khetha ihlelo"],
  vi: ["Để kèm học sinh trên Gadit, bạn cần gói Individual hoặc Family.", "Chọn gói"],
  fil: ["Para mag-coach ng mga estudyante sa Gadit, kailangan mo ng Individual o Family na plano.", "Pumili ng plano"],
  af: ["Om leerders op Gadit af te rig, het julle 'n Individual- of Family-plan nodig.", "Kies 'n plan"],
  sw: ["Kufundisha wanafunzi kwenye Gadit unahitaji mpango wa Individual au Family.", "Chagua mpango"],
  "zh-CN": ["要在 Gadit 上辅导学生，需要 Individual 或 Family 订阅。", "选择订阅"],
  "zh-TW": ["要在 Gadit 上輔導學生，需要 Individual 或 Family 訂閱。", "選擇訂閱"],
  ko: ["Gadit에서 학생을 지도하려면 Individual 또는 Family 요금제가 필요해요.", "요금제 선택"],
  th: ["หากต้องการสอนนักเรียนใน Gadit ต้องมีแพ็กเกจ Individual หรือ Family", "เลือกแพ็กเกจ"],
  bn: ["Gadit-এ শিক্ষার্থীদের শেখাতে Individual বা Family প্ল্যান লাগবে।", "প্ল্যান বেছে নিন"],
  da: ["For at undervise elever i Gadit skal I have et Individual- eller Family-abonnement.", "Vælg abonnement"],
  hu: ["Ahhoz, hogy a Gaditban tanítványokkal foglalkozzatok, Individual vagy Family előfizetés kell.", "Előfizetés választása"],
};

function t(lang: string) { return T[lang] ?? T.en; }

export function CoachClient() {
  const { user, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const c = t(lang);

  const [students, setStudents] = useState<Student[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [needsPlan, setNeedsPlan] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/coach/students", { headers: { Authorization: `Bearer ${idToken}` } });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { students?: Student[]; needsPlan?: boolean };
      setStudents(data.students ?? []);
      setNeedsPlan(!!data.needsPlan);
    } catch {
      setError(c.err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [user, c.err]);

  useEffect(() => { load(); }, [load]);

  async function enter(s: Student) {
    if (!user || entering) return;
    setEntering(s.grantId);
    setError("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/coach/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ grantId: s.grantId }),
      });
      const json = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !json.token) throw new Error(json.error || String(res.status));
      const { signInWithCustomToken, getAuth } = await import("firebase/auth");
      await signInWithCustomToken(getAuth(), json.token);
      // We are now signed in as the child. Land on their home to work together.
      router.push(href("/"));
    } catch {
      setError(c.err);
      setEntering(null);
    }
  }

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr" aria-label="Gadit home">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
      </header>

      <main style={{ maxWidth: 620, margin: "0 auto", padding: "32px 20px 80px", width: "100%" }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)", marginBottom: 8 }}>{c.title}</h1>
        <p style={{ fontSize: 16, color: "var(--ink-soft)", marginBottom: 8, maxWidth: 520 }}>{c.lede}</p>
        {user?.email && (
          <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 24 }}>{c.signedInAs} {user.email}</p>
        )}

        {!user ? (
          <button
            type="button"
            onClick={() => promptLogin({ mode: "signin" })}
            style={{ marginTop: 12, background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 999, padding: "13px 22px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            {c.signin}
          </button>
        ) : loading ? (
          <div style={{ color: "var(--ink-muted)", padding: "24px 0" }}><WaitDots className="gd-wait-big" /></div>
        ) : needsPlan && students && students.length > 0 ? (
          <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--rule)", borderRadius: 16, padding: "20px 20px 18px", display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
            {/* Inside the Play / iOS app: no plan names (store rules). */}
            <div className="gd-buy" style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", lineHeight: 1.6 }}>{(NEEDS_PLAN[lang] ?? NEEDS_PLAN.en)[0]}</div>
            <div className="gd-play-only" style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", lineHeight: 1.6 }}>{playNotActive(lang)}</div>
            <div style={{ fontSize: 14, color: "var(--ink-muted)" }}>{students.map((s) => s.memberName).join(", ")}</div>
            <a className="gd-buy" href={payUrl(lang === "en" ? "/pricing" : `/${lang}/pricing`)} style={{ background: "#0EA5A5", color: "#fff", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 800, textDecoration: "none" }}>{(NEEDS_PLAN[lang] ?? NEEDS_PLAN.en)[1]}</a>
          </div>
        ) : students && students.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            {students.map((s) => {
              const photo = s.avatarPhotoUrl || avatarUrl(s.avatarId);
              return (
                <div key={s.grantId} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, border: "1px solid var(--rule)", background: "var(--surface)" }}>
                  <span style={{ width: 48, height: 48, flexShrink: 0, borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: memberColorFor({ colorIndex: s.colorIndex }), color: "#fff", fontSize: 20, fontWeight: 800 }}>
                    {photo ? <img src={photo} alt="" width={48} height={48} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (s.memberName || "?").charAt(0).toUpperCase()}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>{s.memberName || "?"}</span>
                    {s.inactive && <span style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>{FAMILY_INACTIVE[lang] ?? FAMILY_INACTIVE.en}</span>}
                  </span>
                  {!s.inactive && <button
                    type="button"
                    onClick={() => enter(s)}
                    disabled={!!entering}
                    style={{ background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 999, padding: "10px 20px", fontSize: 15, fontWeight: 700, cursor: entering ? "default" : "pointer", opacity: entering && entering !== s.grantId ? 0.5 : 1, fontFamily: "inherit", flexShrink: 0 }}
                  >
                    {entering === s.grantId ? <WaitText text={c.entering} /> : c.enter}
                  </button>}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ marginTop: 16, padding: "22px 20px", borderRadius: 16, border: "1px dashed var(--rule)", background: "var(--surface)" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>{c.emptyTitle}</div>
            <div style={{ fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>{c.emptyBody(user.email || "")}</div>
          </div>
        )}

        {error && <div style={{ marginTop: 16, color: "#DC2626", fontSize: 14 }}>{error}</div>}
      </main>
    </div>
  );
}

"use client";

/**
 * Coaches section for the /family owner dashboard (Gadi 2026-08-22). The
 * parent grants a coach access to a specific child by email, sees active
 * grants, and can revoke any of them. Self-contained: fetches the family's
 * children (via switch-member) and the grants (via /api/family/coach).
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

type Member = { id: string; name: string; isOwner: boolean };
type Grant = { id: string; coachEmail: string; memberId: string; memberName: string };

const T: Record<string, {
  title: string; lede: string; emailPh: string; childPh: string; add: string; adding: string;
  none: string; revoke: string; forChild: string; invalidEmail: string; pickChild: string; err: string;
}> = {
  ar: { title: "مدرّب أو معلّم خصوصي", lede: "إذا كان لدى طفلك معلّم خاص أو مدرّب لمهارات التعلّم لديه حساب Gadit خاص به، فامنحه صلاحية الوصول إلى ملف الطفل لإضافة كلمات أثناء الدروس. يمكنك إلغاء الصلاحية في أي وقت.", emailPh: "البريد الإلكتروني للمدرّب", childPh: "أي طفل؟", add: "منح الصلاحية", adding: "جارٍ المنح...", none: "لا يوجد مدرّبون بعد.", revoke: "إلغاء", forChild: "لـ", invalidEmail: "أدخل بريدًا إلكترونيًا صحيحًا.", pickChild: "اختر طفلًا.", err: "حدث خطأ ما. حاول مرة أخرى." },
  ru: { title: "Наставник или репетитор", lede: "Если у вашего ребёнка есть репетитор или наставник по учебным навыкам, у которого есть собственный аккаунт Gadit, дайте ему доступ к профилю ребёнка, чтобы добавлять слова во время занятий. Доступ можно отозвать в любой момент.", emailPh: "Эл. почта наставника", childPh: "Какой ребёнок?", add: "Предоставить доступ", adding: "Предоставляем...", none: "Наставников пока нет.", revoke: "Отозвать", forChild: "для", invalidEmail: "Введите корректный адрес эл. почты.", pickChild: "Выберите ребёнка.", err: "Что-то пошло не так. Попробуйте ещё раз." },
  es: { title: "Tutor o profesor particular", lede: "Si tu hijo tiene un profesor particular o un coach de aprendizaje que ya cuenta con su propia cuenta de Gadit, dale acceso al perfil del niño para añadir palabras durante las clases. Puedes revocarlo cuando quieras.", emailPh: "Correo del tutor", childPh: "¿Qué niño?", add: "Dar acceso", adding: "Dando acceso...", none: "Aún no hay tutores.", revoke: "Revocar", forChild: "para", invalidEmail: "Introduce un correo válido.", pickChild: "Elige un niño.", err: "Algo salió mal. Inténtalo de nuevo." },
  pt: { title: "Tutor ou professor particular", lede: "Se o seu filho tem um professor particular ou um coach de aprendizagem que já tem a própria conta Gadit, dê a ele acesso ao perfil da criança para adicionar palavras durante as aulas. Você pode revogar quando quiser.", emailPh: "E-mail do tutor", childPh: "Qual criança?", add: "Conceder acesso", adding: "Concedendo...", none: "Ainda não há tutores.", revoke: "Revogar", forChild: "para", invalidEmail: "Digite um e-mail válido.", pickChild: "Escolha uma criança.", err: "Algo deu errado. Tente de novo." },
  fr: { title: "Tuteur ou professeur particulier", lede: "Si votre enfant a un professeur particulier ou un coach en méthodes d'apprentissage qui possède déjà son propre compte Gadit, donnez-lui accès au profil de l'enfant pour ajouter des mots pendant les cours. Vous pouvez retirer l'accès à tout moment.", emailPh: "E-mail du tuteur", childPh: "Quel enfant ?", add: "Accorder l'accès", adding: "Attribution...", none: "Aucun tuteur pour l'instant.", revoke: "Révoquer", forChild: "pour", invalidEmail: "Saisissez une adresse e-mail valide.", pickChild: "Choisissez un enfant.", err: "Une erreur s'est produite. Réessayez." },
  de: { title: "Lernbegleiter oder Nachhilfelehrer", lede: "Wenn Ihr Kind eine Nachhilfelehrerin oder einen Lerncoach hat, der bereits ein eigenes Gadit-Konto besitzt, geben Sie ihm Zugang zum Profil des Kindes, um während der Stunden Wörter hinzuzufügen. Sie können den Zugang jederzeit widerrufen.", emailPh: "E-Mail des Lernbegleiters", childPh: "Welches Kind?", add: "Zugriff gewähren", adding: "Wird gewährt...", none: "Noch keine Lernbegleiter.", revoke: "Entziehen", forChild: "für", invalidEmail: "Gib eine gültige E-Mail-Adresse ein.", pickChild: "Wähle ein Kind.", err: "Etwas ist schiefgelaufen. Versuch es nochmal." },
  cs: { title: "Lektor nebo doučovatel", lede: "Pokud má vaše dítě soukromého učitele nebo kouče studijních dovedností, který má vlastní účet Gadit, dejte mu přístup k profilu dítěte, aby mohl během lekcí přidávat slova. Přístup můžete kdykoli zrušit.", emailPh: "E-mail lektora", childPh: "Které dítě?", add: "Udělit přístup", adding: "Uděluji...", none: "Zatím žádní lektoři.", revoke: "Zrušit", forChild: "pro", invalidEmail: "Zadejte platný e-mail.", pickChild: "Vyberte dítě.", err: "Něco se pokazilo. Zkuste to znovu." },
  sk: { title: "Lektor alebo doučovateľ", lede: "Ak má vaše dieťa súkromného učiteľa alebo kouča študijných zručností, ktorý má vlastný účet Gadit, dajte mu prístup k profilu dieťaťa, aby mohol počas hodín pridávať slová. Prístup môžete kedykoľvek zrušiť.", emailPh: "E-mail lektora", childPh: "Ktoré dieťa?", add: "Udeliť prístup", adding: "Udeľujem...", none: "Zatiaľ žiadni lektori.", revoke: "Zrušiť", forChild: "pre", invalidEmail: "Zadajte platný e-mail.", pickChild: "Vyberte dieťa.", err: "Niečo sa pokazilo. Skúste to znova." },
  it: { title: "Tutor o insegnante privato", lede: "Se tuo figlio ha un insegnante privato o un coach dell'apprendimento che ha già un proprio account Gadit, dagli accesso al profilo del bambino per aggiungere parole durante le lezioni. Puoi revocarlo in qualsiasi momento.", emailPh: "Email del tutor", childPh: "Quale bambino?", add: "Concedi l'accesso", adding: "Concessione in corso...", none: "Ancora nessun tutor.", revoke: "Revoca", forChild: "per", invalidEmail: "Inserisci un'email valida.", pickChild: "Scegli un bambino.", err: "Qualcosa è andato storto. Riprova." },
  ja: { title: "コーチまたは家庭教師", lede: "お子さまに、自分のGaditアカウントを持っている家庭教師や学習コーチがいる場合は、その人にお子さまのプロフィールへのアクセスを許可して、レッスン中に単語を追加してもらえます。アクセスはいつでも取り消せます。", emailPh: "コーチのメールアドレス", childPh: "どの子ども？", add: "アクセスを許可", adding: "許可しています...", none: "まだコーチがいません。", revoke: "取り消す", forChild: "対象", invalidEmail: "有効なメールアドレスを入力してください。", pickChild: "子どもを選んでください。", err: "問題が発生しました。もう一度お試しください。" },
  hi: { title: "कोच या निजी शिक्षक", lede: "अगर आपके बच्चे के पास कोई निजी शिक्षक या पढ़ाई के कौशल सिखाने वाला कोच है जिसका अपना Gadit खाता है, तो उसे बच्चे की प्रोफ़ाइल तक पहुँच दें ताकि वह कक्षाओं के दौरान शब्द जोड़ सके। आप इसे कभी भी हटा सकते हैं।", emailPh: "कोच का ईमेल", childPh: "कौन सा बच्चा?", add: "पहुँच दें", adding: "दी जा रही है...", none: "अभी तक कोई कोच नहीं.", revoke: "रद्द करें", forChild: "के लिए", invalidEmail: "एक मान्य ईमेल दर्ज करें.", pickChild: "एक बच्चा चुनें.", err: "कुछ गलत हो गया. फिर से कोशिश करें." },
  am: { title: "አሰልጣኝ ወይም የግል መምህር", lede: "ልጅዎ የራሱ Gadit መለያ ያለው የግል መምህር ወይም የመማር ክህሎት አሰልጣኝ ካለው፣ በትምህርት ጊዜ ቃላት እንዲጨምር የልጁን መገለጫ እንዲያገኝ ፍቀዱለት። በማንኛውም ጊዜ መሰረዝ ይችላሉ።", emailPh: "የአሰልጣኝ ኢሜይል", childPh: "የትኛው ልጅ?", add: "መዳረሻ ስጥ", adding: "በመስጠት ላይ...", none: "እስካሁን አሰልጣኞች የሉም።", revoke: "ሻር", forChild: "ለ", invalidEmail: "ትክክለኛ ኢሜይል ያስገቡ።", pickChild: "ልጅ ይምረጡ።", err: "የሆነ ችግር ተፈጥሯል። እንደገና ሞክር።" },
  uk: { title: "Наставник або репетитор", lede: "Якщо у вашої дитини є приватний учитель або наставник з навичок навчання, який має власний обліковий запис Gadit, надайте йому доступ до профілю дитини, щоб додавати слова під час занять. Доступ можна скасувати будь-коли.", emailPh: "Email наставника", childPh: "Яка дитина?", add: "Надати доступ", adding: "Надаємо...", none: "Наставників поки немає.", revoke: "Скасувати", forChild: "для", invalidEmail: "Введіть дійсний email.", pickChild: "Виберіть дитину.", err: "Щось пішло не так. Спробуйте ще раз." },
  tr: { title: "Koç veya özel öğretmen", lede: "Çocuğunuzun kendi Gadit hesabı olan özel bir öğretmeni ya da öğrenme becerileri koçu varsa, ders sırasında kelime ekleyebilmesi için çocuğun profiline erişim verin. İstediğiniz zaman geri alabilirsiniz.", emailPh: "Koçun e-postası", childPh: "Hangi çocuk?", add: "Erişim ver", adding: "Veriliyor...", none: "Henüz koç yok.", revoke: "İptal et", forChild: "için", invalidEmail: "Geçerli bir e-posta girin.", pickChild: "Bir çocuk seç.", err: "Bir şeyler ters gitti. Tekrar deneyin." },
  pl: { title: "Korepetytor lub nauczyciel", lede: "Jeśli Twoje dziecko ma korepetytora lub trenera umiejętności uczenia się, który ma własne konto Gadit, daj mu dostęp do profilu dziecka, aby mógł dodawać słowa podczas lekcji. Dostęp możesz cofnąć w każdej chwili.", emailPh: "E-mail korepetytora", childPh: "Które dziecko?", add: "Przyznaj dostęp", adding: "Przyznawanie...", none: "Brak korepetytorów.", revoke: "Cofnij", forChild: "dla", invalidEmail: "Podaj prawidłowy e-mail.", pickChild: "Wybierz dziecko.", err: "Coś poszło nie tak. Spróbuj ponownie." },
  fa: { title: "مربی یا معلم خصوصی", lede: "اگر فرزند شما معلم خصوصی یا مربی مهارت‌های یادگیری دارد که خودش حساب Gadit دارد، به او اجازه دسترسی به نمایه کودک را بدهید تا در طول کلاس‌ها کلمه اضافه کند. هر زمان بخواهید می‌توانید این دسترسی را لغو کنید.", emailPh: "ایمیل مربی", childPh: "کدام کودک؟", add: "اعطای دسترسی", adding: "در حال اعطا...", none: "هنوز مربی‌ای وجود ندارد.", revoke: "لغو", forChild: "برای", invalidEmail: "یک ایمیل معتبر وارد کنید.", pickChild: "یک کودک انتخاب کنید.", err: "مشکلی پیش آمد. دوباره امتحان کنید." },
  id: { title: "Pelatih atau guru privat", lede: "Jika anak Anda memiliki guru privat atau pelatih keterampilan belajar yang sudah punya akun Gadit sendiri, beri dia akses ke profil anak untuk menambahkan kata selama pelajaran. Anda bisa mencabutnya kapan saja.", emailPh: "Email pengajar", childPh: "Anak yang mana?", add: "Beri akses", adding: "Memberi akses...", none: "Belum ada pengajar.", revoke: "Cabut", forChild: "untuk", invalidEmail: "Masukkan email yang valid.", pickChild: "Pilih anak.", err: "Terjadi kesalahan. Coba lagi." },
  nl: { title: "Begeleider of bijlesdocent", lede: "Als uw kind een privéleraar of een leercoach heeft die al een eigen Gadit-account heeft, geef hem of haar dan toegang tot het profiel van het kind om tijdens de lessen woorden toe te voegen. U kunt de toegang altijd intrekken.", emailPh: "E-mail van begeleider", childPh: "Welk kind?", add: "Toegang geven", adding: "Bezig met geven...", none: "Nog geen begeleiders.", revoke: "Intrekken", forChild: "voor", invalidEmail: "Voer een geldig e-mailadres in.", pickChild: "Kies een kind.", err: "Er ging iets mis. Probeer opnieuw." },
  el: { title: "Προπονητής ή ιδιαίτερος δάσκαλος", lede: "Αν το παιδί σας έχει ιδιαίτερο δάσκαλο ή προπονητή δεξιοτήτων μάθησης που διαθέτει δικό του λογαριασμό Gadit, δώστε του πρόσβαση στο προφίλ του παιδιού για να προσθέτει λέξεις κατά τη διάρκεια των μαθημάτων. Μπορείτε να την ανακαλέσετε όποτε θέλετε.", emailPh: "Email εκπαιδευτή", childPh: "Ποιο παιδί;", add: "Παραχώρηση πρόσβασης", adding: "Παραχώρηση...", none: "Δεν υπάρχουν ακόμη εκπαιδευτές.", revoke: "Ανάκληση", forChild: "για", invalidEmail: "Εισάγετε έγκυρο email.", pickChild: "Επιλέξτε ένα παιδί.", err: "Κάτι πήγε στραβά. Δοκιμάστε ξανά." },
  zu: { title: "Umqeqeshi noma uthisha wangasese", lede: "Uma ingane yakho inothisha wangasese noma umqeqeshi wamakhono okufunda onayo i-akhawunti yakhe ye-Gadit, mnike ithuba lokufinyelela kuphrofayela yengane ukuze angeze amagama ngesikhathi sezifundo. Ungakususa noma nini.", emailPh: "I-imeyili yomqeqeshi", childPh: "Iyiphi ingane?", add: "Nikeza ukufinyelela", adding: "Iyanikezwa...", none: "Abekho abaqeqeshi okwamanje.", revoke: "Susa", forChild: "ku", invalidEmail: "Faka i-imeyili evumelekile.", pickChild: "Khetha ingane.", err: "Kukhona okungahambanga kahle. Zama futhi." },
  vi: { title: "Huấn luyện viên hoặc gia sư", lede: "Nếu con bạn có một giáo viên riêng hoặc một huấn luyện viên kỹ năng học tập đã có tài khoản Gadit riêng, hãy cấp cho họ quyền truy cập hồ sơ của con để thêm từ trong các buổi học. Bạn có thể thu hồi bất cứ lúc nào.", emailPh: "Email của gia sư", childPh: "Bé nào?", add: "Cấp quyền", adding: "Đang cấp quyền...", none: "Chưa có gia sư nào.", revoke: "Thu hồi", forChild: "cho", invalidEmail: "Nhập email hợp lệ.", pickChild: "Chọn một bé.", err: "Đã xảy ra lỗi. Vui lòng thử lại." },
  fil: { title: "Coach o pribadong guro", lede: "Kung ang anak mo ay may pribadong guro o coach sa mga kasanayan sa pag-aaral na may sariling Gadit account, bigyan siya ng access sa profile ng bata para makapagdagdag ng mga salita habang may aral. Puwede mong bawiin anumang oras.", emailPh: "Email ng coach", childPh: "Aling bata?", add: "Bigyan ng access", adding: "Binibigyan...", none: "Wala pang coach.", revoke: "Bawiin", forChild: "para kay", invalidEmail: "Maglagay ng wastong email.", pickChild: "Pumili ng bata.", err: "May nagkamali. Subukan ulit." },
  af: { title: "Afrigter of privaatonderwyser", lede: "As jou kind 'n privaat onderwyser of 'n leervaardigheidsafrigter het wat reeds sy eie Gadit-rekening het, gee hom toegang tot die kind se profiel om woorde tydens lesse by te voeg. Jy kan dit enige tyd herroep.", emailPh: "Afrigter se e-pos", childPh: "Watter kind?", add: "Gee toegang", adding: "Besig om toegang te gee...", none: "Nog geen afrigters nie.", revoke: "Herroep", forChild: "vir", invalidEmail: "Voer 'n geldige e-pos in.", pickChild: "Kies 'n kind.", err: "Iets het verkeerd geloop. Probeer weer." },
  sw: { title: "Kocha au mwalimu wa faragha", lede: "Ikiwa mtoto wako ana mwalimu wa faragha au kocha wa stadi za kujifunza mwenye akaunti yake mwenyewe ya Gadit, mpe ruhusa ya kufikia wasifu wa mtoto ili aweze kuongeza maneno wakati wa masomo. Unaweza kuiondoa wakati wowote.", emailPh: "Barua pepe ya kocha", childPh: "Mtoto yupi?", add: "Toa ruhusa", adding: "Inatoa ruhusa...", none: "Bado hakuna makocha.", revoke: "Ondoa ruhusa", forChild: "kwa", invalidEmail: "Weka barua pepe sahihi.", pickChild: "Chagua mtoto.", err: "Kuna hitilafu. Jaribu tena." },
  "zh-CN": { title: "辅导老师或私教", lede: "如果您的孩子有一位私人老师或学习技能辅导员，而且对方拥有自己的 Gadit 账户，您可以授权他访问孩子的档案，在课上添加单词。您可以随时撤销权限。", emailPh: "辅导老师的邮箱", childPh: "哪个孩子？", add: "授予权限", adding: "正在授予...", none: "还没有辅导老师。", revoke: "撤销", forChild: "给", invalidEmail: "请输入有效的邮箱。", pickChild: "请选择一个孩子。", err: "出错了，请再试一次。" },
  "zh-TW": { title: "輔導老師或家教", lede: "如果您的孩子有一位私人老師或學習技能輔導員，而且對方擁有自己的 Gadit 帳戶，您可以授權他存取孩子的檔案，在課堂上新增單字。您可以隨時撤銷權限。", emailPh: "輔導老師的電子郵件", childPh: "哪個孩子？", add: "授予權限", adding: "正在授予...", none: "還沒有輔導老師。", revoke: "撤銷", forChild: "給", invalidEmail: "請輸入有效的電子郵件。", pickChild: "請選擇一個孩子。", err: "出錯了，請再試一次。" },
  ko: { title: "코치 또는 과외 선생님", lede: "자녀에게 개인 교사나 학습 기술 코치가 있고 그분이 본인의 Gadit 계정을 가지고 있다면, 자녀의 프로필에 접근할 수 있게 해서 수업 중에 단어를 추가하도록 할 수 있습니다. 접근 권한은 언제든지 해제할 수 있습니다.", emailPh: "코치 이메일", childPh: "어떤 아이인가요?", add: "권한 주기", adding: "부여하는 중...", none: "아직 코치가 없어요.", revoke: "해제", forChild: "대상", invalidEmail: "올바른 이메일을 입력하세요.", pickChild: "아이를 선택하세요.", err: "문제가 발생했어요. 다시 시도하세요." },
  th: { title: "โค้ชหรือติวเตอร์", lede: "หากลูกของคุณมีครูสอนพิเศษหรือโค้ชด้านทักษะการเรียนรู้ที่มีบัญชี Gadit ของตัวเอง คุณสามารถให้เขาเข้าถึงโปรไฟล์ของลูกเพื่อเพิ่มคำศัพท์ระหว่างเรียนได้ และยกเลิกเมื่อใดก็ได้", emailPh: "อีเมลของโค้ช", childPh: "เด็กคนไหน?", add: "ให้สิทธิ์", adding: "กำลังให้สิทธิ์...", none: "ยังไม่มีโค้ช", revoke: "ยกเลิกสิทธิ์", forChild: "สำหรับ", invalidEmail: "กรอกอีเมลที่ถูกต้อง", pickChild: "เลือกเด็กหนึ่งคน", err: "เกิดข้อผิดพลาด ลองอีกครั้ง" },
  bn: { title: "কোচ বা প্রাইভেট শিক্ষক", lede: "আপনার সন্তানের যদি এমন কোনো ব্যক্তিগত শিক্ষক বা শেখার দক্ষতার কোচ থাকে যাঁর নিজের একটি Gadit অ্যাকাউন্ট আছে, তাহলে তাঁকে সন্তানের প্রোফাইলে প্রবেশের অনুমতি দিন যাতে ক্লাস চলাকালীন শব্দ যোগ করতে পারেন। যেকোনো সময় এই অনুমতি বাতিল করতে পারেন।", emailPh: "কোচের ইমেইল", childPh: "কোন সন্তান?", add: "প্রবেশাধিকার দিন", adding: "দেওয়া হচ্ছে...", none: "এখনও কোনো কোচ নেই।", revoke: "বাতিল করুন", forChild: "জন্য", invalidEmail: "একটি সঠিক ইমেইল দিন।", pickChild: "একটি সন্তান বেছে নিন।", err: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।" },
  da: { title: "Vejleder eller privatlærer", lede: "Hvis dit barn har en privatlærer eller en indlæringscoach, der allerede har sin egen Gadit-konto, kan du give vedkommende adgang til barnets profil, så der kan tilføjes ord i løbet af timerne. Du kan når som helst trække adgangen tilbage.", emailPh: "Vejlederens e-mail", childPh: "Hvilket barn?", add: "Giv adgang", adding: "Giver adgang...", none: "Ingen vejledere endnu.", revoke: "Tilbagekald", forChild: "til", invalidEmail: "Indtast en gyldig e-mail.", pickChild: "Vælg et barn.", err: "Noget gik galt. Prøv igen." },
  hu: { title: "Oktató vagy korrepetáló", lede: "Ha gyermekének van magántanára vagy tanulási készségeket fejlesztő coacha, akinek saját Gadit-fiókja van, adjon neki hozzáférést a gyermek profiljához, hogy az órák során szavakat vehessen fel. Bármikor visszavonhatja.", emailPh: "Oktató e-mail-címe", childPh: "Melyik gyerek?", add: "Hozzáférés adása", adding: "Hozzáférés adása...", none: "Még nincs oktató.", revoke: "Visszavonás", forChild: "számára", invalidEmail: "Adj meg egy érvényes e-mail-címet.", pickChild: "Válassz egy gyereket.", err: "Valami hiba történt. Próbáld újra." },
  en: {
    title: "Coach or private teacher",
    lede: "If a child has a private teacher or a learning-skills coach who has their own Gadit account, give them access to the child's profile to add words during lessons. Revoke anytime.",
    emailPh: "Coach's email",
    childPh: "Which child?",
    add: "Grant access",
    adding: "Granting...",
    none: "No coaches yet.",
    revoke: "Revoke",
    forChild: "for",
    invalidEmail: "Enter a valid email.",
    pickChild: "Pick a child.",
    err: "Something went wrong. Try again.",
  },
  he: {
    title: "מאמן או מורה פרטי",
    lede: "אם יש לילד מורה פרטי או מאמן לשיפור מיומנויות למידה שיש לו חשבון Gadit משלו, אפשר לתת לו גישה לפרופיל של הילד כדי להוסיף מילים במהלך השיעורים. אפשר לבטל בכל רגע.",
    emailPh: "האימייל של המאמן",
    childPh: "איזה ילד?",
    add: "הענקת גישה",
    adding: "מעניק...",
    none: "אין עדיין מאמנים.",
    revoke: "ביטול",
    forChild: "עבור",
    invalidEmail: "הזן אימייל תקין.",
    pickChild: "בחר ילד.",
    err: "משהו השתבש. נסה שוב.",
  },
};
function t(lang: string) { return T[lang] ?? T.en; }

export function CoachesSection() {
  const { user } = useAuth();
  const { lang, dir } = useLang();
  const c = t(lang);

  const [kids, setKids] = useState<Member[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [email, setEmail] = useState("");
  const [memberId, setMemberId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const [mRes, gRes] = await Promise.all([
        fetch("/api/family/switch-member", { headers: { Authorization: `Bearer ${idToken}` } }),
        fetch("/api/family/coach", { headers: { Authorization: `Bearer ${idToken}` } }),
      ]);
      if (mRes.ok) {
        const d = (await mRes.json()) as { members?: Member[] };
        setKids((d.members ?? []).filter((m) => !m.isOwner));
      }
      if (gRes.ok) {
        const d = (await gRes.json()) as { grants?: Grant[] };
        setGrants(d.grants ?? []);
      }
    } catch { /* leave as-is */ }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!user || busy) return;
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setError(c.invalidEmail); return; }
    if (!memberId) { setError(c.pickChild); return; }
    setBusy(true); setError("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/family/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ coachEmail: e, memberId }),
      });
      if (!res.ok) throw new Error();
      setEmail(""); setMemberId("");
      await load();
    } catch {
      setError(c.err);
    } finally {
      setBusy(false);
    }
  }

  async function revoke(grantId: string) {
    if (!user) return;
    setError("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/family/coach/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ grantId }),
      });
      if (!res.ok) throw new Error();
      setGrants((g) => g.filter((x) => x.id !== grantId));
    } catch {
      setError(c.err);
    }
  }

  const inputStyle: React.CSSProperties = {
    flex: 1, minWidth: 0, padding: "11px 13px", borderRadius: 12, border: "1px solid var(--rule)",
    background: "var(--surface)", color: "var(--ink)", fontSize: 15, fontFamily: "inherit",
  };

  return (
    <section
      dir={dir}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--rule)",
        borderRadius: 14,
        padding: "16px 18px",
        marginBottom: 14,
      }}
    >
      <h2 style={{ fontSize: 15, fontWeight: 800, color: "#1C1917", marginBottom: 3 }}>{c.title}</h2>
      <p style={{ fontSize: 13, color: "#78716C", marginTop: 0, marginBottom: 16, lineHeight: 1.6, maxWidth: 560 }}>{c.lede}</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder={c.emailPh} style={{ ...inputStyle, flexBasis: 220 }} dir="ltr"
        />
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} style={{ ...inputStyle, flexBasis: 150 }}>
          <option value="">{c.childPh}</option>
          {kids.map((k) => <option key={k.id} value={k.id}>{k.name || "—"}</option>)}
        </select>
        <button
          type="button" onClick={add} disabled={busy}
          style={{ background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 12, padding: "11px 20px", fontSize: 15, fontWeight: 700, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, fontFamily: "inherit" }}
        >
          {busy ? c.adding : c.add}
        </button>
      </div>
      {error && <div style={{ color: "#DC2626", fontSize: 13, marginBottom: 8 }}>{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {grants.length === 0 ? (
          <div style={{ fontSize: 14, color: "var(--ink-muted)" }}>{c.none}</div>
        ) : (
          grants.map((g) => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, border: "1px solid var(--rule)", background: "var(--surface)" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis" }} dir="ltr">{g.coachEmail}</div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{c.forChild} {g.memberName || "—"}</div>
              </div>
              <button
                type="button" onClick={() => revoke(g.id)}
                style={{ background: "transparent", color: "#DC2626", border: "1px solid color-mix(in srgb, #DC2626 40%, transparent)", borderRadius: 999, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
              >
                {c.revoke}
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

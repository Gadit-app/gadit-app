import { renderEmailHtmlV2, mdLiteToHtml } from "./render";
import { EMAIL_BASE } from "./family-content";
import { makeLoginToken } from "@/lib/login-token";

/**
 * One email to someone who signed up and never came back (Gadi 2026-10-10,
 * approved copy; a subscriber had been locked out by a forgotten password
 * for a month). The button signs them straight in for a week, no password.
 * Sent from the drip cron and takes that user's drip slot for the day.
 */

const DAY = 86_400_000;

/** Due once: signed up 3 to 21 days ago and never active again after the
 *  first day. (Older accounts are left alone, so the first run is small.) */
export function loginReminderDue(
  meta: { creationTime?: string; lastSignInTime?: string; lastRefreshTime?: string | null },
  d: FirebaseFirestore.DocumentData,
  now: number,
): boolean {
  // Not for a school owner: schools get their own onboarding (2026-10-10).
  if (d.loginReminderSentAt || d.familyRole === "kid" || d.schoolId) return false;
  const created = Date.parse(meta.creationTime ?? "");
  if (!Number.isFinite(created)) return false;
  const age = now - created;
  if (age < 3 * DAY || age > 21 * DAY) return false;
  const last = Math.max(Date.parse(meta.lastSignInTime ?? "") || 0, Date.parse(meta.lastRefreshTime ?? "") || 0);
  return last - created < DAY;
}

type Copy = { subject: string; body: string; cta: string };
const COPY: Record<string, Copy> = {
  he: { subject: "כך נכנסים לחשבון שלכם ב-Gadit", body: "שלום,\n\nנרשמתם ל-Gadit לפני כמה ימים, ושמנו לב שעוד לא חזרתם.\n\nכדי שלא תצטרכו לזכור סיסמה, הנה כפתור שמכניס אתכם ישר לחשבון.\n\nהמחברת שלכם מחכה שם, עם כל מילה שתחפשו.", cta: "כניסה ל-Gadit" },
  en: { subject: "How to get back into your Gadit account", body: "Hi,\n\nYou signed up for Gadit a few days ago, and we noticed you haven't been back yet.\n\nSo you don't have to remember a password, here's a button that takes you straight into your account.\n\nYour notebook is waiting there, with every word you look up.", cta: "Sign in to Gadit" },
  ar: { subject: "هكذا تدخل إلى حسابك في Gadit", body: "مرحبًا،\n\nسجّلت في Gadit قبل بضعة أيام، ولاحظنا أنك لم تعد بعد.\n\nحتى لا تحتاج إلى تذكّر كلمة مرور، هذا زر يُدخلك مباشرة إلى حسابك.\n\nدفترك ينتظرك هناك، مع كل كلمة تبحث عنها.", cta: "الدخول إلى Gadit" },
  ru: { subject: "Как вернуться в свой аккаунт Gadit", body: "Здравствуйте,\n\nВы зарегистрировались в Gadit несколько дней назад, и мы заметили, что вы ещё не возвращались.\n\nЧтобы не нужно было помнить пароль, вот кнопка, которая сразу открывает ваш аккаунт.\n\nВаша тетрадь ждёт там, со всеми словами, которые вы найдёте.", cta: "Войти в Gadit" },
  es: { subject: "Así vuelves a tu cuenta de Gadit", body: "Hola,\n\nTe registraste en Gadit hace unos días y notamos que aún no has vuelto.\n\nPara que no tengas que recordar una contraseña, aquí tienes un botón que te lleva directo a tu cuenta.\n\nTu cuaderno te espera allí, con cada palabra que busques.", cta: "Entrar a Gadit" },
  pt: { subject: "Como voltar à sua conta do Gadit", body: "Olá,\n\nVocê se cadastrou no Gadit há alguns dias e percebemos que ainda não voltou.\n\nPara você não precisar lembrar de uma senha, aqui está um botão que leva direto à sua conta.\n\nSeu caderno está esperando lá, com cada palavra que você procurar.", cta: "Entrar no Gadit" },
  fr: { subject: "Comment revenir dans votre compte Gadit", body: "Bonjour,\n\nVous vous êtes inscrit à Gadit il y a quelques jours, et nous avons remarqué que vous n'êtes pas encore revenu.\n\nPour ne pas avoir à retenir de mot de passe, voici un bouton qui vous mène directement à votre compte.\n\nVotre carnet vous y attend, avec chaque mot que vous chercherez.", cta: "Se connecter à Gadit" },
  de: { subject: "So kommst du zurück in dein Gadit-Konto", body: "Hallo,\n\ndu hast dich vor ein paar Tagen bei Gadit angemeldet, und uns ist aufgefallen, dass du noch nicht zurückgekommen bist.\n\nDamit du dir kein Passwort merken musst, bringt dich dieser Button direkt in dein Konto.\n\nDein Heft wartet dort, mit jedem Wort, das du nachschlägst.", cta: "Bei Gadit anmelden" },
  af: {"subject":"Só kom jy terug in jou Gadit-rekening","body":"Hallo,\n\nJy het 'n paar dae gelede by Gadit ingeteken, en ons het opgemerk dat jy nog nie teruggekom het nie.\n\nSodat jy nie 'n wagwoord hoef te onthou nie, is hier 'n knoppie wat jou reguit na jou rekening neem.\n\nJou notaboek wag daar vir jou, met elke woord wat jy opsoek.","cta":"Meld aan by Gadit"},
  am: {"subject":"ወደ Gadit መለያዎ እንዲህ ይመለሱ","body":"ሰላም፣\n\nከጥቂት ቀናት በፊት በ Gadit ተመዝግበዋል፣ እስካሁን እንዳልተመለሱ አስተውለናል።\n\nየይለፍ ቃል ማስታወስ እንዳያስፈልግዎ፣ በቀጥታ ወደ መለያዎ የሚያስገባዎት ቁልፍ ይኸውልዎ።\n\nደብተርዎ እዚያ ይጠብቅዎታል፣ ከሚፈልጉት እያንዳንዱ ቃል ጋር።","cta":"ወደ Gadit ይግቡ"},
  bn: {"subject":"আপনার Gadit অ্যাকাউন্টে এভাবে ফিরে আসুন","body":"হ্যালো,\n\nকয়েক দিন আগে আপনি Gadit-এ সাইন আপ করেছিলেন, আর আমরা দেখলাম আপনি এখনো ফিরে আসেননি।\n\nযাতে পাসওয়ার্ড মনে রাখতে না হয়, এই রইল একটি বোতাম যা আপনাকে সরাসরি আপনার অ্যাকাউন্টে নিয়ে যায়।\n\nআপনার নোটবুক সেখানে অপেক্ষা করছে, আপনার খোঁজা প্রতিটি শব্দসহ।","cta":"Gadit-এ সাইন ইন করুন"},
  cs: {"subject":"Takhle se vrátíte do svého účtu Gadit","body":"Dobrý den,\n\npřed pár dny jste se zaregistrovali do Gadit a všimli jsme si, že jste se zatím nevrátili.\n\nAbyste si nemuseli pamatovat heslo, tady je tlačítko, které vás pustí rovnou do vašeho účtu.\n\nVáš sešit tam na vás čeká, s každým slovem, které vyhledáte.","cta":"Přihlásit se do Gadit"},
  da: {"subject":"Sådan kommer du tilbage til din Gadit-konto","body":"Hej,\n\nDu oprettede dig på Gadit for et par dage siden, og vi har lagt mærke til, at du ikke har været tilbage endnu.\n\nSå du ikke skal huske en adgangskode, er her en knap, der tager dig direkte ind på din konto.\n\nDin notesbog venter på dig der, med hvert ord, du slår op.","cta":"Log ind på Gadit"},
  el: {"subject":"Έτσι μπαίνεις ξανά στον λογαριασμό σου στο Gadit","body":"Γεια σου,\n\nΈκανες εγγραφή στο Gadit πριν από λίγες μέρες, και είδαμε ότι δεν έχεις επιστρέψει ακόμα.\n\nΓια να μη χρειάζεται να θυμάσαι κωδικό, ορίστε ένα κουμπί που σε βάζει κατευθείαν στον λογαριασμό σου.\n\nΤο τετράδιό σου σε περιμένει εκεί, με κάθε λέξη που θα αναζητήσεις.","cta":"Σύνδεση στο Gadit"},
  fa: {"subject":"این‌طور به حساب Gadit خود برگردید","body":"سلام،\n\nچند روز پیش در Gadit ثبت‌نام کردید، و متوجه شدیم که هنوز برنگشته‌اید.\n\nبرای اینکه لازم نباشد رمز عبوری را به خاطر بسپارید، این دکمه شما را مستقیم به حسابتان می‌برد.\n\nدفترچه‌تان آنجا منتظرتان است، با هر واژه‌ای که جستجو کنید.","cta":"ورود به Gadit"},
  fil: {"subject":"Ganito bumalik sa Gadit account mo","body":"Kumusta,\n\nNag-sign up ka sa Gadit ilang araw na ang nakalipas, at napansin naming hindi ka pa bumabalik.\n\nPara hindi mo na kailangang tandaan ang password, narito ang isang button na direktang magdadala sa iyo sa account mo.\n\nNaghihintay doon ang kwaderno mo, kasama ang bawat salitang hahanapin mo.","cta":"Mag-sign in sa Gadit"},
  hi: {"subject":"अपने Gadit खाते में वापस ऐसे आएँ","body":"नमस्ते,\n\nआपने कुछ दिन पहले Gadit पर साइन अप किया था, और हमने देखा कि आप अभी तक वापस नहीं आए।\n\nताकि आपको पासवर्ड याद न रखना पड़े, यह रहा एक बटन जो आपको सीधे आपके खाते में ले जाता है।\n\nआपकी नोटबुक वहाँ आपका इंतज़ार कर रही है, आपके खोजे हर शब्द के साथ।","cta":"Gadit में साइन इन करें"},
  hu: {"subject":"Így léphetsz vissza a Gadit-fiókodba","body":"Szia,\n\nPár napja regisztráltál a Gaditra, és észrevettük, hogy még nem tértél vissza.\n\nHogy ne kelljen jelszót megjegyezned, itt egy gomb, amely egyenesen a fiókodba visz.\n\nOtt vár a füzeted, minden szóval, amit keresni fogsz.","cta":"Belépés a Gaditba"},
  id: {"subject":"Cara kembali ke akun Gadit-mu","body":"Hai,\n\nKamu mendaftar di Gadit beberapa hari lalu, dan kami lihat kamu belum kembali.\n\nSupaya kamu tidak perlu mengingat kata sandi, ini tombol yang langsung membawamu masuk ke akunmu.\n\nBuku catatanmu menunggu di sana, dengan setiap kata yang kamu cari.","cta":"Masuk ke Gadit"},
  it: {"subject":"Ecco come rientrare nel tuo account Gadit","body":"Ciao,\n\nti sei registrato su Gadit qualche giorno fa, e abbiamo notato che non sei ancora tornato.\n\nPer non doverti ricordare una password, ecco un pulsante che ti porta direttamente nel tuo account.\n\nIl tuo quaderno ti aspetta lì, con ogni parola che cercherai.","cta":"Accedi a Gadit"},
  ja: {"subject":"Gaditのアカウントに戻る方法","body":"こんにちは。\n\n数日前にGaditに登録されましたが、まだ戻ってきていないようです。\n\nパスワードを覚えておかなくてもいいように、アカウントに直接入れるボタンをご用意しました。\n\nあなたのノートが待っています。調べた単語はすべてそこに入ります。","cta":"Gaditにログイン"},
  ko: {"subject":"Gadit 계정으로 다시 들어오는 방법","body":"안녕하세요,\n\n며칠 전 Gadit에 가입하셨는데, 아직 다시 들어오지 않으신 것 같아요.\n\n비밀번호를 기억하지 않아도 되도록, 계정으로 바로 들어갈 수 있는 버튼을 준비했어요.\n\n단어장이 그곳에서 기다리고 있어요. 찾아보는 모든 단어가 담겨요.","cta":"Gadit에 로그인"},
  nl: {"subject":"Zo kom je terug in je Gadit-account","body":"Hoi,\n\nJe hebt je een paar dagen geleden aangemeld bij Gadit, en we zagen dat je nog niet bent teruggekomen.\n\nDan hoef je geen wachtwoord te onthouden: met deze knop kom je meteen in je account.\n\nJe notitieboek wacht daar op je, met elk woord dat je opzoekt.","cta":"Inloggen bij Gadit"},
  nr: {"subject":"Indlela yokubuyela ku-akhawunti yakho ye-Gadit","body":"Lotjha,\n\nUbhalise ku-Gadit emalangeni ambalwa adlulileko, begodu sibonile bona awukabuyi.\n\nBona ungatlhogi ukukhumbula iphasiwedi, nansi ikunupu ekungenisa ngqo ku-akhawunti yakho.\n\nIbhuku lakho lamezwi likulindile lapho, nelizwi ngalinye olifunako.","cta":"Ngena ku-Gadit"},
  nso: {"subject":"Ka moo o ka boelago akhaontong ya gago ya Gadit","body":"Dumela,\n\nO ingwadišitše go Gadit matšatši a mmalwa a go feta, gomme re lemogile gore ga o sešo wa boa.\n\nGore o se swanele go gopola phasewete, konopo ye e go tsenya thwii akhaontong ya gago.\n\nPuku ya gago ya mantšu e go letile moo, le lentšu le lengwe le le lengwe leo o tla le nyakago.","cta":"Tsena go Gadit"},
  pl: {"subject":"Tak wrócisz do swojego konta Gadit","body":"Cześć!\n\nTwoje konto w Gadit powstało kilka dni temu i zauważyliśmy, że od tamtej pory jeszcze cię u nas nie było.\n\nŻeby nie trzeba było pamiętać hasła, oto przycisk, który od razu przeniesie cię do twojego konta.\n\nTwój notatnik tam na ciebie czeka, z każdym słowem, które wyszukasz.","cta":"Zaloguj się do Gadit"},
  sk: {"subject":"Takto sa vrátite do svojho účtu Gadit","body":"Dobrý deň,\n\npred pár dňami ste sa zaregistrovali do Gadit a všimli sme si, že ste sa zatiaľ nevrátili.\n\nAby ste si nemuseli pamätať heslo, tu je tlačidlo, ktoré vás pustí rovno do vášho účtu.\n\nVáš zošit tam na vás čaká, s každým slovom, ktoré vyhľadáte.","cta":"Prihlásiť sa do Gadit"},
  ss: {"subject":"Indlela yekubuyela ku-akhawunti yakho ye-Gadit","body":"Sawubona,\n\nUbhalise ku-Gadit emalangeni lambalwa langendlulile, futsi sibonile kutsi awukabuyi.\n\nKute ungadzingi kukhumbula iphasiwedi, nansi inkinobho lekungenisa ngco ku-akhawunti yakho.\n\nIncwadzi yakho ikulindzile lapho, nalo lonkhe ligama loliseshako.","cta":"Ngena ku-Gadit"},
  st: {"subject":"Kamoo o ka kgutlelang akhaontong ya hao ya Gadit","body":"Dumela,\n\nO ingodisitse ho Gadit matsatsi a mmalwa a fetileng, mme re hlokometse hore ha o eso kgutle.\n\nE le hore o se ke wa tlameha ho hopola phasewete, konopo ena e o kenya ka kotloloho akhaontong ya hao.\n\nBukana ya hao e o emetse moo, le lentswe le leng le le leng leo o tla le batla.","cta":"Kena ho Gadit"},
  sw: {"subject":"Hivi ndivyo unavyorudi kwenye akaunti yako ya Gadit","body":"Habari,\n\nUlijisajili kwenye Gadit siku chache zilizopita, na tumeona kwamba bado hujarudi.\n\nIli usihitaji kukumbuka nenosiri, hiki hapa ni kitufe kinachokupeleka moja kwa moja kwenye akaunti yako.\n\nDaftari lako linakusubiri hapo, pamoja na kila neno utakalotafuta.","cta":"Ingia kwenye Gadit"},
  th: {"subject":"วิธีกลับเข้าบัญชี Gadit ของคุณ","body":"สวัสดี\n\nคุณสมัคร Gadit เมื่อไม่กี่วันก่อน และเราสังเกตว่าคุณยังไม่ได้กลับมาอีกเลย\n\nเพื่อที่คุณจะได้ไม่ต้องจำรหัสผ่าน นี่คือปุ่มที่พาคุณเข้าบัญชีได้ทันที\n\nสมุดของคุณรออยู่ที่นั่น พร้อมทุกคำที่คุณจะค้นหา","cta":"เข้าสู่ระบบ Gadit"},
  tn: {"subject":"Kafa o ka boelang mo akhaontong ya gago ya Gadit ka teng","body":"Dumela,\n\nO ikwadisitse mo Gadit malatsi a le mmalwa a a fetileng, mme re lemogile gore ga o ise o boe.\n\nGore o se ka wa tlhoka go gopola phasewete, fa ke konopo e e go tsenyang ka tlhamalalo mo akhaontong ya gago.\n\nBukana ya gago e go emetse koo, le lefoko lengwe le lengwe le o tla le batlang.","cta":"Tsena mo Gadit"},
  tr: {"subject":"Gadit hesabına böyle geri dönersin","body":"Merhaba,\n\nBirkaç gün önce Gadit'e kaydoldun ve henüz geri dönmediğini fark ettik.\n\nŞifre hatırlamak zorunda kalmaman için, seni doğrudan hesabına götüren bir düğme hazırladık.\n\nDefterin seni orada bekliyor, arayacağın her kelimeyle birlikte.","cta":"Gadit'e giriş yap"},
  ts: {"subject":"Ndlela yo tlhelela eka akhawunti ya n'wina ya Gadit","body":"Xewani,\n\nMi tsarisile eka Gadit masiku ma nga ri mangani lama hundzeke, naswona hi vone leswaku a mi si tlhelela.\n\nLeswaku mi nga boheki ku tsundzuka phasiwedi, hi leyi buteni leyi mi nghenisaka hi ku kongoma eka akhawunti ya n'wina.\n\nBuku ya n'wina ya marito yi mi rindzile kona, yi ri na rito rin'wana na rin'wana leri mi ri lavaka.","cta":"Nghenani eka Gadit"},
  uk: {"subject":"Як повернутися до свого облікового запису Gadit","body":"Вітаємо!\n\nВи зареєструвалися в Gadit кілька днів тому, і ми помітили, що ви ще не поверталися.\n\nЩоб не треба було пам'ятати пароль, ось кнопка, яка одразу відкриває ваш обліковий запис.\n\nВаш зошит чекає там, з усіма словами, які ви знайдете.","cta":"Увійти в Gadit"},
  ve: {"subject":"Nḓila ya u humela kha akhaunthu yaṋu ya Gadit","body":"Ri a ni lumelisa,\n\nNo ḓiṅwalisa kha Gadit maḓuvha a si gathi o fhiraho, nahone ro vhona uri a ni athu humela.\n\nUri ni sa tee u humbula phasiwede, heyi ndi bathoni ine ya ni dzhenisa thwii kha akhaunthu yaṋu.\n\nBugu yaṋu i khou ni lindela henefho, i na ipfi ḽiṅwe na ḽiṅwe ḽine na ḽi ṱoḓa.","cta":"Dzhenani kha Gadit"},
  vi: {"subject":"Cách quay lại tài khoản Gadit của bạn","body":"Chào bạn,\n\nBạn đã đăng ký Gadit vài ngày trước, và chúng tôi để ý thấy bạn chưa quay lại.\n\nĐể bạn không phải nhớ mật khẩu, đây là một nút đưa bạn thẳng vào tài khoản của mình.\n\nSổ tay của bạn đang chờ ở đó, cùng với mọi từ bạn tra.","cta":"Đăng nhập vào Gadit"},
  xh: {"subject":"Indlela yokubuyela kwiakhawunti yakho ye-Gadit","body":"Molo,\n\nUbhalise kwi-Gadit kwiintsuku ezimbalwa ezidlulileyo, kwaye siqaphele ukuba awukabuyi.\n\nUkuze ungadingi ukukhumbula iphasiwedi, nali iqhosha elikungenisa ngqo kwiakhawunti yakho.\n\nIncwadi yakho ikulindile apho, nalo lonke igama oza kulikhangela.","cta":"Ngena kwi-Gadit"},
  "zh-CN": {"subject":"这样回到你的 Gadit 账号","body":"你好，\n\n几天前你注册了 Gadit，我们注意到你还没有回来过。\n\n为了让你不用记密码，这里有一个按钮，可以直接带你进入你的账号。\n\n你的生词本在那里等着你，里面会有你查的每个词。","cta":"登录 Gadit"},
  "zh-TW": {"subject":"這樣回到你的 Gadit 帳號","body":"你好，\n\n幾天前你註冊了 Gadit，我們注意到你還沒有回來過。\n\n為了讓你不用記密碼，這裡有一個按鈕，可以直接帶你進入你的帳號。\n\n你的生詞本在那裡等著你，裡面會有你查的每個詞。","cta":"登入 Gadit"},
  zu: {"subject":"Indlela yokubuyela ku-akhawunti yakho ye-Gadit","body":"Sawubona,\n\nUbhalise ku-Gadit ezinsukwini ezimbalwa ezedlule, futhi siqaphele ukuthi awukabuyi.\n\nUkuze ungadingi ukukhumbula iphasiwedi, nansi inkinobho ekungenisa ngqo ku-akhawunti yakho.\n\nIncwadi yakho yamanothi ikulindile lapho, nawo wonke amagama ozowabheka.","cta":"Ngena ku-Gadit"},
};

export function buildLoginReminder(uid: string, lang: string, unsubscribeUrl: string): { subject: string; html: string } {
  const c = COPY[lang] ?? COPY.en;
  const l = COPY[lang] ? lang : "en";
  const base = l === "en" ? EMAIL_BASE : `${EMAIL_BASE}/${l}`;
  const link = `https://www.gadit.app/api/auth/remind?t=${encodeURIComponent(makeLoginToken(uid, 7))}&l=${encodeURIComponent(l)}`;
  return {
    subject: c.subject,
    html: renderEmailHtmlV2({
      he: l === "he",
      lang: l,
      bodyHtml: mdLiteToHtml(l, c.body),
      ctaText: c.cta,
      ctaUrl: link,
      next: "",
      helpUrl: `${base}/help`,
      unsubscribeUrl,
    }),
  };
}

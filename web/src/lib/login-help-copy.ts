/**
 * Copy for signing in without a password and for recovering from a wrong
 * password (Gadi 2026-10-10, after a subscriber was locked out by a
 * forgotten password). The login window strings cover all 33 UI languages;
 * the finish page and the email are authored for the main languages and
 * fall back to English.
 */

type LoginHelp = {
  /** Button in the login window. */
  magicLink: string;
  /** After sending; {email} is replaced. */
  magicSent: string;
  /** Shown instead of a bare error when the password does not match. */
  wrongHelp: string;
  /** Second action in the wrong-password box. */
  resetNow: string;
};

export const LOGIN_HELP: Record<string, LoginHelp> = {
  he: { magicLink: "שלחו לי קישור כניסה למייל", magicSent: "שלחנו קישור כניסה ל-{email}. פתחו אותו ותיכנסו בלי סיסמה.", wrongHelp: "המייל או הסיסמה לא מתאימים. אפשר להיכנס עם קישור למייל, בלי סיסמה, או לבחור סיסמה חדשה.", resetNow: "בחירת סיסמה חדשה" },
  en: { magicLink: "Email me a sign-in link", magicSent: "We sent a sign-in link to {email}. Open it to sign in without a password.", wrongHelp: "That email and password don't match. You can sign in with a link sent to your email, no password needed, or choose a new password.", resetNow: "Choose a new password" },
  ar: { magicLink: "أرسلوا لي رابط دخول بالبريد", magicSent: "أرسلنا رابط دخول إلى {email}. افتحه لتدخل بدون كلمة مرور.", wrongHelp: "البريد أو كلمة المرور غير متطابقين. يمكنك الدخول برابط يُرسل إلى بريدك بدون كلمة مرور، أو اختيار كلمة مرور جديدة.", resetNow: "اختيار كلمة مرور جديدة" },
  ru: { magicLink: "Прислать ссылку для входа на почту", magicSent: "Мы отправили ссылку для входа на {email}. Откройте её, чтобы войти без пароля.", wrongHelp: "Почта или пароль не совпадают. Можно войти по ссылке из письма, без пароля, или выбрать новый пароль.", resetNow: "Выбрать новый пароль" },
  es: { magicLink: "Envíame un enlace de acceso", magicSent: "Enviamos un enlace de acceso a {email}. Ábrelo para entrar sin contraseña.", wrongHelp: "El correo y la contraseña no coinciden. Puedes entrar con un enlace enviado a tu correo, sin contraseña, o elegir una contraseña nueva.", resetNow: "Elegir una contraseña nueva" },
  pt: { magicLink: "Enviar um link de acesso por e-mail", magicSent: "Enviamos um link de acesso para {email}. Abra-o para entrar sem senha.", wrongHelp: "O e-mail e a senha não conferem. Você pode entrar com um link enviado ao seu e-mail, sem senha, ou escolher uma nova senha.", resetNow: "Escolher uma nova senha" },
  fr: { magicLink: "M'envoyer un lien de connexion", magicSent: "Nous avons envoyé un lien de connexion à {email}. Ouvrez-le pour vous connecter sans mot de passe.", wrongHelp: "L'e-mail et le mot de passe ne correspondent pas. Vous pouvez vous connecter avec un lien envoyé par e-mail, sans mot de passe, ou choisir un nouveau mot de passe.", resetNow: "Choisir un nouveau mot de passe" },
  de: { magicLink: "Anmeldelink per E-Mail senden", magicSent: "Wir haben einen Anmeldelink an {email} geschickt. Öffne ihn, um dich ohne Passwort anzumelden.", wrongHelp: "E-Mail und Passwort passen nicht zusammen. Du kannst dich mit einem Link per E-Mail anmelden, ohne Passwort, oder ein neues Passwort wählen.", resetNow: "Neues Passwort wählen" },
  cs: { magicLink: "Poslat přihlašovací odkaz e-mailem", magicSent: "Poslali jsme přihlašovací odkaz na {email}. Otevřete ho a přihlaste se bez hesla.", wrongHelp: "E-mail a heslo nesouhlasí. Můžete se přihlásit odkazem z e-mailu, bez hesla, nebo si zvolit nové heslo.", resetNow: "Zvolit nové heslo" },
  sk: { magicLink: "Poslať prihlasovací odkaz e-mailom", magicSent: "Poslali sme prihlasovací odkaz na {email}. Otvorte ho a prihláste sa bez hesla.", wrongHelp: "E-mail a heslo nesedia. Môžete sa prihlásiť odkazom z e-mailu, bez hesla, alebo si zvoliť nové heslo.", resetNow: "Zvoliť nové heslo" },
  it: { magicLink: "Inviami un link di accesso", magicSent: "Abbiamo inviato un link di accesso a {email}. Aprilo per entrare senza password.", wrongHelp: "Email e password non corrispondono. Puoi entrare con un link inviato alla tua email, senza password, oppure scegliere una nuova password.", resetNow: "Scegli una nuova password" },
  ja: { magicLink: "ログイン用リンクをメールで送る", magicSent: "{email} にログイン用リンクを送りました。開くとパスワードなしでログインできます。", wrongHelp: "メールアドレスとパスワードが一致しません。メールで届くリンクでパスワードなしでログインするか、新しいパスワードを設定できます。", resetNow: "新しいパスワードを設定" },
  hi: { magicLink: "मुझे ईमेल पर लॉगिन लिंक भेजें", magicSent: "हमने {email} पर लॉगिन लिंक भेजा है। उसे खोलें और बिना पासवर्ड के लॉगिन करें।", wrongHelp: "ईमेल और पासवर्ड मेल नहीं खाते। आप ईमेल पर भेजे गए लिंक से बिना पासवर्ड लॉगिन कर सकते हैं, या नया पासवर्ड चुन सकते हैं।", resetNow: "नया पासवर्ड चुनें" },
  am: { magicLink: "የመግቢያ ሊንክ በኢሜይል ላኩልኝ", magicSent: "የመግቢያ ሊንክ ወደ {email} ልከናል። ይክፈቱት እና ያለ የይለፍ ቃል ይግቡ።", wrongHelp: "ኢሜይሉ እና የይለፍ ቃሉ አይዛመዱም። በኢሜይል በሚላክ ሊንክ ያለ የይለፍ ቃል መግባት ወይም አዲስ የይለፍ ቃል መምረጥ ይችላሉ።", resetNow: "አዲስ የይለፍ ቃል ይምረጡ" },
  uk: { magicLink: "Надіслати посилання для входу на пошту", magicSent: "Ми надіслали посилання для входу на {email}. Відкрийте його, щоб увійти без пароля.", wrongHelp: "Пошта або пароль не збігаються. Можна увійти за посиланням з листа, без пароля, або вибрати новий пароль.", resetNow: "Вибрати новий пароль" },
  tr: { magicLink: "Bana e-postayla giriş bağlantısı gönder", magicSent: "{email} adresine bir giriş bağlantısı gönderdik. Şifresiz giriş yapmak için açın.", wrongHelp: "E-posta ve şifre eşleşmiyor. E-postanıza gelen bir bağlantıyla şifresiz giriş yapabilir ya da yeni bir şifre belirleyebilirsiniz.", resetNow: "Yeni şifre belirle" },
  pl: { magicLink: "Wyślij mi link do logowania", magicSent: "Wysłaliśmy link do logowania na {email}. Otwórz go, aby zalogować się bez hasła.", wrongHelp: "E-mail i hasło nie pasują do siebie. Możesz zalogować się linkiem z e-maila, bez hasła, albo ustawić nowe hasło.", resetNow: "Ustaw nowe hasło" },
  fa: { magicLink: "لینک ورود را به ایمیلم بفرستید", magicSent: "یک لینک ورود به {email} فرستادیم. آن را باز کنید تا بدون رمز وارد شوید.", wrongHelp: "ایمیل و رمز با هم نمی‌خوانند. می‌توانید با لینکی که به ایمیلتان فرستاده می‌شود بدون رمز وارد شوید، یا رمز تازه‌ای انتخاب کنید.", resetNow: "انتخاب رمز تازه" },
  id: { magicLink: "Kirimi saya tautan masuk lewat email", magicSent: "Kami mengirim tautan masuk ke {email}. Buka untuk masuk tanpa kata sandi.", wrongHelp: "Email dan kata sandi tidak cocok. Kamu bisa masuk dengan tautan yang dikirim ke email, tanpa kata sandi, atau memilih kata sandi baru.", resetNow: "Pilih kata sandi baru" },
  nl: { magicLink: "Stuur me een inloglink per e-mail", magicSent: "We hebben een inloglink naar {email} gestuurd. Open hem om zonder wachtwoord in te loggen.", wrongHelp: "E-mail en wachtwoord komen niet overeen. Je kunt inloggen met een link per e-mail, zonder wachtwoord, of een nieuw wachtwoord kiezen.", resetNow: "Nieuw wachtwoord kiezen" },
  el: { magicLink: "Στείλτε μου σύνδεσμο σύνδεσης", magicSent: "Στείλαμε σύνδεσμο σύνδεσης στο {email}. Ανοίξτε τον για να μπείτε χωρίς κωδικό.", wrongHelp: "Το email και ο κωδικός δεν ταιριάζουν. Μπορείτε να μπείτε με σύνδεσμο στο email σας, χωρίς κωδικό, ή να ορίσετε νέο κωδικό.", resetNow: "Ορισμός νέου κωδικού" },
  zu: { magicLink: "Ngithumelele isixhumanisi sokungena nge-imeyili", magicSent: "Sithumele isixhumanisi sokungena ku-{email}. Sivule ukuze ungene ngaphandle kwephasiwedi.", wrongHelp: "I-imeyili nephasiwedi azihambisani. Ungangena ngesixhumanisi esithunyelwa ku-imeyili yakho, ngaphandle kwephasiwedi, noma ukhethe iphasiwedi entsha.", resetNow: "Khetha iphasiwedi entsha" },
  vi: { magicLink: "Gửi cho tôi liên kết đăng nhập qua email", magicSent: "Chúng tôi đã gửi liên kết đăng nhập tới {email}. Mở nó để đăng nhập không cần mật khẩu.", wrongHelp: "Email và mật khẩu không khớp. Bạn có thể đăng nhập bằng liên kết gửi qua email, không cần mật khẩu, hoặc chọn mật khẩu mới.", resetNow: "Chọn mật khẩu mới" },
  fil: { magicLink: "Padalhan ako ng link para mag-sign in", magicSent: "Nagpadala kami ng sign-in link sa {email}. Buksan ito para makapasok nang walang password.", wrongHelp: "Hindi tugma ang email at password. Puwede kang pumasok gamit ang link na ipapadala sa email mo, walang password, o pumili ng bagong password.", resetNow: "Pumili ng bagong password" },
  af: { magicLink: "Stuur vir my 'n aanmeldskakel per e-pos", magicSent: "Ons het 'n aanmeldskakel na {email} gestuur. Maak dit oop om sonder 'n wagwoord aan te meld.", wrongHelp: "Die e-pos en wagwoord pas nie. Jy kan aanmeld met 'n skakel per e-pos, sonder 'n wagwoord, of 'n nuwe wagwoord kies.", resetNow: "Kies 'n nuwe wagwoord" },
  sw: { magicLink: "Nitumie kiungo cha kuingia kwa barua pepe", magicSent: "Tumetuma kiungo cha kuingia kwa {email}. Kifungue uingie bila nenosiri.", wrongHelp: "Barua pepe na nenosiri havilingani. Unaweza kuingia kwa kiungo kinachotumwa kwa barua pepe yako, bila nenosiri, au kuchagua nenosiri jipya.", resetNow: "Chagua nenosiri jipya" },
  "zh-CN": { magicLink: "通过邮件发送登录链接", magicSent: "我们已向 {email} 发送登录链接。打开它即可免密码登录。", wrongHelp: "邮箱和密码不匹配。你可以用发到邮箱的链接免密码登录，或设置新密码。", resetNow: "设置新密码" },
  "zh-TW": { magicLink: "透過郵件寄送登入連結", magicSent: "我們已寄送登入連結到 {email}。開啟即可免密碼登入。", wrongHelp: "電子郵件和密碼不符。你可以用寄到信箱的連結免密碼登入，或設定新密碼。", resetNow: "設定新密碼" },
  ko: { magicLink: "이메일로 로그인 링크 받기", magicSent: "{email}(으)로 로그인 링크를 보냈어요. 열면 비밀번호 없이 로그인돼요.", wrongHelp: "이메일과 비밀번호가 맞지 않아요. 이메일로 받은 링크로 비밀번호 없이 로그인하거나, 새 비밀번호를 정할 수 있어요.", resetNow: "새 비밀번호 정하기" },
  th: { magicLink: "ส่งลิงก์เข้าสู่ระบบทางอีเมล", magicSent: "เราส่งลิงก์เข้าสู่ระบบไปที่ {email} แล้ว เปิดลิงก์เพื่อเข้าสู่ระบบโดยไม่ต้องใช้รหัสผ่าน", wrongHelp: "อีเมลและรหัสผ่านไม่ตรงกัน คุณสามารถเข้าสู่ระบบด้วยลิงก์ที่ส่งไปทางอีเมลโดยไม่ต้องใช้รหัสผ่าน หรือตั้งรหัสผ่านใหม่", resetNow: "ตั้งรหัสผ่านใหม่" },
  bn: { magicLink: "ইমেলে লগইন লিংক পাঠান", magicSent: "{email}-এ একটি লগইন লিংক পাঠিয়েছি। খুলে পাসওয়ার্ড ছাড়াই লগইন করুন।", wrongHelp: "ইমেল আর পাসওয়ার্ড মিলছে না। ইমেলে পাঠানো লিংক দিয়ে পাসওয়ার্ড ছাড়া লগইন করতে পারেন, বা নতুন পাসওয়ার্ড বেছে নিতে পারেন।", resetNow: "নতুন পাসওয়ার্ড বেছে নিন" },
  da: { magicLink: "Send mig et login-link på mail", magicSent: "Vi har sendt et login-link til {email}. Åbn det for at logge ind uden adgangskode.", wrongHelp: "Mail og adgangskode passer ikke sammen. Du kan logge ind med et link på mail, uden adgangskode, eller vælge en ny adgangskode.", resetNow: "Vælg ny adgangskode" },
  hu: { magicLink: "Küldjenek belépési linket e-mailben", magicSent: "Belépési linket küldtünk ide: {email}. Nyisd meg, és jelszó nélkül belépsz.", wrongHelp: "Az e-mail és a jelszó nem egyezik. Beléphetsz az e-mailben kapott linkkel, jelszó nélkül, vagy választhatsz új jelszót.", resetNow: "Új jelszó választása" },
};

export function loginHelp(lang: string): LoginHelp {
  return LOGIN_HELP[lang] ?? LOGIN_HELP.en;
}

type FinishCopy = { signingIn: string; askEmail: string; cont: string; expired: string; home: string };
const FINISH: Record<string, FinishCopy> = {
  he: { signingIn: "מתחברים...", askEmail: "כדי לסיים, הקלידו את המייל שאליו נשלח הקישור.", cont: "המשך", expired: "הקישור כבר נוצל או שפג תוקפו. אפשר לבקש קישור חדש מחלון ההתחברות.", home: "חזרה ל-Gadit" },
  en: { signingIn: "Signing you in...", askEmail: "To finish, type the email address the link was sent to.", cont: "Continue", expired: "This link was already used or has expired. You can ask for a new one from the sign-in window.", home: "Back to Gadit" },
  ar: { signingIn: "جارٍ تسجيل الدخول...", askEmail: "للإنهاء، اكتب البريد الذي أُرسل إليه الرابط.", cont: "متابعة", expired: "هذا الرابط استُخدم أو انتهت صلاحيته. يمكنك طلب رابط جديد من نافذة الدخول.", home: "العودة إلى Gadit" },
  ru: { signingIn: "Входим...", askEmail: "Чтобы завершить, введите адрес почты, на который пришла ссылка.", cont: "Продолжить", expired: "Эта ссылка уже использована или устарела. Новую можно запросить в окне входа.", home: "Вернуться в Gadit" },
  es: { signingIn: "Entrando...", askEmail: "Para terminar, escribe el correo al que se envió el enlace.", cont: "Continuar", expired: "Este enlace ya se usó o caducó. Puedes pedir uno nuevo en la ventana de acceso.", home: "Volver a Gadit" },
  pt: { signingIn: "Entrando...", askEmail: "Para terminar, digite o e-mail para o qual o link foi enviado.", cont: "Continuar", expired: "Este link já foi usado ou expirou. Você pode pedir um novo na janela de acesso.", home: "Voltar ao Gadit" },
  fr: { signingIn: "Connexion en cours...", askEmail: "Pour terminer, saisissez l'adresse e-mail à laquelle le lien a été envoyé.", cont: "Continuer", expired: "Ce lien a déjà servi ou a expiré. Vous pouvez en demander un nouveau depuis la fenêtre de connexion.", home: "Retour à Gadit" },
  de: { signingIn: "Anmeldung läuft...", askEmail: "Gib zum Abschluss die E-Mail-Adresse ein, an die der Link ging.", cont: "Weiter", expired: "Dieser Link wurde schon benutzt oder ist abgelaufen. Einen neuen kannst du im Anmeldefenster anfordern.", home: "Zurück zu Gadit" },
};
export function finishCopy(lang: string): FinishCopy {
  return FINISH[lang] ?? FINISH.en;
}

type MailCopy = { subject: string; hi: string; body: string; button: string; foot: string };
const MAIL: Record<string, MailCopy> = {
  he: { subject: "קישור הכניסה שלכם ל-Gadit", hi: "שלום,", body: "ביקשתם להיכנס ל-Gadit בלי סיסמה. לחצו על הכפתור, ותיכנסו מיד.", button: "כניסה ל-Gadit", foot: "הקישור תקף לזמן קצר ולשימוש אחד. אם לא ביקשתם אותו, אפשר להתעלם מהמייל." },
  en: { subject: "Your Gadit sign-in link", hi: "Hi,", body: "You asked to sign in to Gadit without a password. Tap the button and you're in.", button: "Sign in to Gadit", foot: "The link works once, for a short time. If you didn't ask for it, you can ignore this email." },
  ar: { subject: "رابط الدخول إلى Gadit", hi: "مرحبًا،", body: "طلبت الدخول إلى Gadit بدون كلمة مرور. اضغط الزر وستدخل فورًا.", button: "الدخول إلى Gadit", foot: "الرابط صالح لمرة واحدة ولوقت قصير. إن لم تطلبه، يمكنك تجاهل هذه الرسالة." },
  ru: { subject: "Ссылка для входа в Gadit", hi: "Здравствуйте,", body: "Вы попросили войти в Gadit без пароля. Нажмите кнопку, и вы внутри.", button: "Войти в Gadit", foot: "Ссылка действует один раз и недолго. Если вы её не запрашивали, просто проигнорируйте письмо." },
  es: { subject: "Tu enlace para entrar a Gadit", hi: "Hola,", body: "Pediste entrar a Gadit sin contraseña. Toca el botón y listo.", button: "Entrar a Gadit", foot: "El enlace sirve una vez y por poco tiempo. Si no lo pediste, puedes ignorar este correo." },
  pt: { subject: "Seu link para entrar no Gadit", hi: "Olá,", body: "Você pediu para entrar no Gadit sem senha. Toque no botão e pronto.", button: "Entrar no Gadit", foot: "O link vale uma vez, por pouco tempo. Se você não pediu, pode ignorar este e-mail." },
  fr: { subject: "Votre lien de connexion à Gadit", hi: "Bonjour,", body: "Vous avez demandé à vous connecter à Gadit sans mot de passe. Touchez le bouton et c'est fait.", button: "Se connecter à Gadit", foot: "Le lien ne sert qu'une fois, pendant peu de temps. Si vous ne l'avez pas demandé, ignorez cet e-mail." },
  de: { subject: "Dein Anmeldelink für Gadit", hi: "Hallo,", body: "Du wolltest dich ohne Passwort bei Gadit anmelden. Tippe auf den Button und du bist drin.", button: "Bei Gadit anmelden", foot: "Der Link gilt einmal und nur kurz. Wenn du ihn nicht angefordert hast, kannst du diese E-Mail ignorieren." },
};
export function mailCopy(lang: string): MailCopy {
  return MAIL[lang] ?? MAIL.en;
}

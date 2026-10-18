import type { Metadata } from "next";
import type { ReactNode } from "react";
import LegalPage from "@/components/LegalPage";
import type { Lang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Delete your account, Gadit",
  description: "How to delete your Gadit account and what data is removed.",
};

const LAST_UPDATED = "August 19, 2026";

const EnglishBody = () => (
  <>
    <p>
      This page explains how to delete your <strong>Gadit</strong> account and the data associated with it.
      Gadit is operated by <strong>Lavi Learning and Training Technologies LLC</strong>.
    </p>

    <h2>Delete your account from inside the app</h2>
    <ol>
      <li>Open Gadit and sign in.</li>
      <li>
        Go to <strong>Account</strong> (tap your profile, then <strong>Account</strong>).
      </li>
      <li>
        Scroll to <strong>Delete account</strong>.
      </li>
      <li>
        Confirm by typing your email address, then tap <strong>Delete account</strong>.
      </li>
    </ol>
    <p>
      The deletion is immediate and permanent. It removes your account and you will be signed out on every device.
    </p>

    <h2>If you cannot sign in</h2>
    <p>
      Email <a href="mailto:support@gadit.app">support@gadit.app</a> from the address on your account and ask us to
      delete it. We will verify your request and delete the account within 30 days.
    </p>

    <h2>What is deleted</h2>
    <ul>
      <li>Your account and login credentials (email / Google sign-in).</li>
      <li>Your profile and any family member profiles you created.</li>
      <li>Your saved words (notebook) and recent search history.</li>
      <li>Images generated for your account and your in-app preferences.</li>
    </ul>

    <h2>What is kept, and for how long</h2>
    <ul>
      <li>
        Billing and tax records required by law (typically up to 7 years). Payments are handled by Stripe; we do not
        store your card number.
      </li>
      <li>
        Anonymized, aggregate analytics that are no longer linked to you (retained by our analytics provider, typically
        up to 13 months).
      </li>
    </ul>
    <p>
      For more detail on what we collect and why, see our{" "}
      <a href="/privacy">Privacy Policy</a>.
    </p>
  </>
);

const HebrewBody = () => (
  <>
    <p>
      דף זה מסביר איך למחוק את חשבון <strong>Gadit</strong> שלך ואת הנתונים המשויכים אליו.
      Gadit מופעל על ידי <strong>Lavi Learning and Training Technologies LLC</strong>.
    </p>

    <h2>מחיקת החשבון מתוך האפליקציה</h2>
    <ol>
      <li>פותחים את Gadit ומתחברים.</li>
      <li>
        נכנסים ל<strong>חשבון</strong> (לוחצים על הפרופיל ואז על <strong>חשבון</strong>).
      </li>
      <li>
        גוללים אל <strong>מחיקת חשבון</strong>.
      </li>
      <li>
        מאשרים על ידי הקלדת כתובת האימייל, ואז לוחצים <strong>מחיקת חשבון</strong>.
      </li>
    </ol>
    <p>
      המחיקה מיידית וסופית. היא מסירה את החשבון ומנתקת אותך מכל המכשירים.
    </p>

    <h2>אם אי אפשר להתחבר</h2>
    <p>
      כותבים ל-<a href="mailto:support@gadit.app">support@gadit.app</a> מהכתובת שרשומה בחשבון ומבקשים למחוק אותו.
      נאמת את הבקשה ונמחק את החשבון תוך 30 יום.
    </p>

    <h2>מה נמחק</h2>
    <ul>
      <li>החשבון ופרטי ההתחברות (אימייל / התחברות Google).</li>
      <li>הפרופיל שלך וכל פרופיל של בן משפחה שיצרת.</li>
      <li>המילים השמורות (המחברת) והיסטוריית החיפושים האחרונה.</li>
      <li>תמונות שנוצרו עבור החשבון וההעדפות באפליקציה.</li>
    </ul>

    <h2>מה נשמר, ולכמה זמן</h2>
    <ul>
      <li>
        רשומות חיוב ומיסים הנדרשות בחוק (בדרך כלל עד 7 שנים). התשלומים מטופלים על ידי Stripe; איננו שומרים את מספר
        הכרטיס.
      </li>
      <li>
        נתוני אנליטיקה מצטברים ואנונימיים שאינם מקושרים אליך יותר (נשמרים אצל ספק האנליטיקה, בדרך כלל עד 13 חודשים).
      </li>
    </ul>
    <p>
      לפירוט נוסף על מה שאנחנו אוספים ולמה, ראו את <a href="/privacy">מדיניות הפרטיות</a>.
    </p>
  </>
);

// The other 39 UI languages (QA 2026-10-18; the page is linked from Google
// Play). Same content as EnglishBody, as data. Markers inside a string:
// **bold**, {email} = the support mailto link, [[text]] = link to /privacy.
// UI labels in bold match the app's own labels (WbUserMenu "account",
// v2 accountDeleteAccount, v2 navNotebook) in each language.
type DeleteCopy = {
  title: string;
  intro: string;
  inAppH: string;
  steps: string[];
  immediate: string;
  cantH: string;
  cantP: string;
  deletedH: string;
  deleted: string[];
  keptH: string;
  kept: string[];
  more: string;
};

const DELETE_COPY: Partial<Record<Lang, DeleteCopy>> = {
  ar: {
    title: "حذف حسابك",
    intro: "توضّح هذه الصفحة كيفية حذف حسابك في **Gadit** والبيانات المرتبطة به. تدير Gadit شركة **Lavi Learning and Training Technologies LLC**.",
    inAppH: "حذف الحساب من داخل التطبيق",
    steps: [
      "افتح Gadit وسجّل الدخول.",
      "انتقل إلى **حسابي** (انقر على ملفك الشخصي، ثم على **حسابي**).",
      "مرّر إلى **حذف الحساب**.",
      "أكّد بكتابة عنوان بريدك الإلكتروني، ثم انقر على **حذف الحساب**.",
    ],
    immediate: "الحذف فوري ونهائي. يُزال حسابك ويتم تسجيل خروجك من جميع الأجهزة.",
    cantH: "إذا لم تتمكن من تسجيل الدخول",
    cantP: "راسلنا على {email} من العنوان المسجّل في حسابك واطلب منا حذفه. سنتحقق من طلبك ونحذف الحساب خلال 30 يومًا.",
    deletedH: "ما الذي يُحذف",
    deleted: [
      "حسابك وبيانات تسجيل الدخول (البريد الإلكتروني / تسجيل الدخول عبر Google).",
      "ملفك الشخصي وأي ملفات تعريف لأفراد العائلة أنشأتها.",
      "كلماتك المحفوظة (الدفتر) وسجل البحث الأخير.",
      "الصور التي أُنشئت لحسابك وتفضيلاتك داخل التطبيق.",
    ],
    keptH: "ما الذي يُحتفظ به، ولأي مدة",
    kept: [
      "سجلات الفوترة والضرائب التي يفرضها القانون (عادةً حتى 7 سنوات). تتولى Stripe معالجة المدفوعات، ولا نحتفظ برقم بطاقتك.",
      "تحليلات إجمالية مجهولة الهوية لم تعد مرتبطة بك (يحتفظ بها مزوّد خدمة التحليلات لدينا، عادةً حتى 13 شهرًا).",
    ],
    more: "لمزيد من التفاصيل حول ما نجمعه ولماذا، راجع [[سياسة الخصوصية]].",
  },
  ru: {
    title: "Удаление аккаунта",
    intro: "На этой странице рассказано, как удалить аккаунт **Gadit** и связанные с ним данные. Gadit управляет компания **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Удаление аккаунта в приложении",
    steps: [
      "Откройте Gadit и войдите в аккаунт.",
      "Перейдите в раздел **Аккаунт** (нажмите на свой профиль, затем на **Аккаунт**).",
      "Прокрутите до пункта **Удалить аккаунт**.",
      "Подтвердите, введя свой адрес электронной почты, затем нажмите **Удалить аккаунт**.",
    ],
    immediate: "Удаление происходит сразу и навсегда. Аккаунт удаляется, и вы выходите из него на всех устройствах.",
    cantH: "Если вы не можете войти",
    cantP: "Напишите на {email} с адреса, указанного в аккаунте, и попросите удалить его. Мы проверим запрос и удалим аккаунт в течение 30 дней.",
    deletedH: "Что удаляется",
    deleted: [
      "Ваш аккаунт и данные для входа (электронная почта / вход через Google).",
      "Ваш профиль и все созданные вами профили членов семьи.",
      "Сохранённые слова (тетрадь) и недавняя история поиска.",
      "Изображения, созданные для вашего аккаунта, и ваши настройки в приложении.",
    ],
    keptH: "Что сохраняется и как долго",
    kept: [
      "Платёжные и налоговые записи, которые требует закон (обычно до 7 лет). Платежи обрабатывает Stripe; мы не храним номер вашей карты.",
      "Обезличенная сводная аналитика, которая больше не связана с вами (хранится у нашего поставщика аналитики, обычно до 13 месяцев).",
    ],
    more: "Подробнее о том, какие данные мы собираем и зачем, читайте в [[Политике конфиденциальности]].",
  },
  es: {
    title: "Eliminar tu cuenta",
    intro: "Esta página explica cómo eliminar tu cuenta de **Gadit** y los datos asociados a ella. Gadit es operada por **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Eliminar tu cuenta desde la app",
    steps: [
      "Abre Gadit e inicia sesión.",
      "Ve a **Cuenta** (toca tu perfil y luego **Cuenta**).",
      "Desplázate hasta **Eliminar cuenta**.",
      "Confirma escribiendo tu dirección de correo electrónico y luego toca **Eliminar cuenta**.",
    ],
    immediate: "La eliminación es inmediata y permanente. Se borra tu cuenta y se cerrará tu sesión en todos los dispositivos.",
    cantH: "Si no puedes iniciar sesión",
    cantP: "Escribe a {email} desde la dirección de tu cuenta y pídenos que la eliminemos. Verificaremos tu solicitud y eliminaremos la cuenta en un plazo de 30 días.",
    deletedH: "Qué se elimina",
    deleted: [
      "Tu cuenta y tus datos de acceso (correo electrónico / inicio de sesión con Google).",
      "Tu perfil y los perfiles de familiares que hayas creado.",
      "Tus palabras guardadas (cuaderno) y tu historial de búsqueda reciente.",
      "Las imágenes generadas para tu cuenta y tus preferencias en la app.",
    ],
    keptH: "Qué se conserva y durante cuánto tiempo",
    kept: [
      "Los registros de facturación e impuestos que exige la ley (normalmente hasta 7 años). Los pagos los gestiona Stripe; no guardamos el número de tu tarjeta.",
      "Analíticas agregadas y anonimizadas que ya no están vinculadas a ti (las conserva nuestro proveedor de analítica, normalmente hasta 13 meses).",
    ],
    more: "Para más detalles sobre qué datos recopilamos y por qué, consulta nuestra [[Política de privacidad]].",
  },
  pt: {
    title: "Excluir sua conta",
    intro: "Esta página explica como excluir sua conta do **Gadit** e os dados associados a ela. O Gadit é operado pela **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Excluir a conta pelo app",
    steps: [
      "Abra o Gadit e entre na sua conta.",
      "Vá em **Conta** (toque no seu perfil e depois em **Conta**).",
      "Role até **Excluir conta**.",
      "Confirme digitando seu endereço de e-mail e toque em **Excluir conta**.",
    ],
    immediate: "A exclusão é imediata e permanente. Ela remove sua conta, e você será desconectado em todos os dispositivos.",
    cantH: "Se você não consegue entrar",
    cantP: "Envie um e-mail para {email} a partir do endereço da sua conta e peça a exclusão. Vamos verificar sua solicitação e excluir a conta em até 30 dias.",
    deletedH: "O que é excluído",
    deleted: [
      "Sua conta e suas credenciais de acesso (e-mail / login com o Google).",
      "Seu perfil e os perfis de familiares que você criou.",
      "Suas palavras salvas (caderno) e o histórico de buscas recente.",
      "As imagens geradas para sua conta e suas preferências no app.",
    ],
    keptH: "O que é mantido, e por quanto tempo",
    kept: [
      "Registros de cobrança e fiscais exigidos por lei (normalmente por até 7 anos). Os pagamentos são processados pela Stripe; não armazenamos o número do seu cartão.",
      "Dados analíticos agregados e anonimizados que não estão mais ligados a você (mantidos pelo nosso provedor de análise, normalmente por até 13 meses).",
    ],
    more: "Para mais detalhes sobre o que coletamos e por quê, veja nossa [[Política de privacidade]].",
  },
  fr: {
    title: "Supprimer votre compte",
    intro: "Cette page explique comment supprimer votre compte **Gadit** et les données qui y sont associées. Gadit est exploité par **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Supprimer votre compte depuis l'application",
    steps: [
      "Ouvrez Gadit et connectez-vous.",
      "Allez dans **Compte** (touchez votre profil, puis **Compte**).",
      "Faites défiler jusqu'à **Supprimer le compte**.",
      "Confirmez en saisissant votre adresse e-mail, puis touchez **Supprimer le compte**.",
    ],
    immediate: "La suppression est immédiate et définitive. Elle supprime votre compte et vous serez déconnecté sur tous vos appareils.",
    cantH: "Si vous ne pouvez pas vous connecter",
    cantP: "Écrivez à {email} depuis l'adresse liée à votre compte et demandez-nous de le supprimer. Nous vérifierons votre demande et supprimerons le compte sous 30 jours.",
    deletedH: "Ce qui est supprimé",
    deleted: [
      "Votre compte et vos identifiants de connexion (e-mail / connexion Google).",
      "Votre profil et tous les profils de membres de la famille que vous avez créés.",
      "Vos mots enregistrés (carnet) et votre historique de recherche récent.",
      "Les images générées pour votre compte et vos préférences dans l'application.",
    ],
    keptH: "Ce qui est conservé, et pendant combien de temps",
    kept: [
      "Les données de facturation et fiscales exigées par la loi (en général jusqu'à 7 ans). Les paiements sont gérés par Stripe ; nous ne conservons pas votre numéro de carte.",
      "Des statistiques agrégées et anonymisées qui ne sont plus liées à vous (conservées par notre prestataire d'analyse, en général jusqu'à 13 mois).",
    ],
    more: "Pour en savoir plus sur ce que nous collectons et pourquoi, consultez notre [[Politique de confidentialité]].",
  },
  de: {
    title: "Konto löschen",
    intro: "Auf dieser Seite erfährst du, wie du dein **Gadit**-Konto und die damit verbundenen Daten löschst. Gadit wird betrieben von **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Konto direkt in der App löschen",
    steps: [
      "Öffne Gadit und melde dich an.",
      "Gehe zu **Konto** (tippe auf dein Profil und dann auf **Konto**).",
      "Scrolle zu **Konto löschen**.",
      "Bestätige, indem du deine E-Mail-Adresse eingibst, und tippe dann auf **Konto löschen**.",
    ],
    immediate: "Die Löschung erfolgt sofort und endgültig. Dein Konto wird entfernt und du wirst auf allen Geräten abgemeldet.",
    cantH: "Wenn du dich nicht anmelden kannst",
    cantP: "Schreib an {email} von der Adresse, die mit deinem Konto verknüpft ist, und bitte uns, es zu löschen. Wir prüfen deine Anfrage und löschen das Konto innerhalb von 30 Tagen.",
    deletedH: "Was gelöscht wird",
    deleted: [
      "Dein Konto und deine Anmeldedaten (E-Mail / Google-Anmeldung).",
      "Dein Profil und alle Profile von Familienmitgliedern, die du angelegt hast.",
      "Deine gespeicherten Wörter (Notizbuch) und dein letzter Suchverlauf.",
      "Für dein Konto erstellte Bilder und deine Einstellungen in der App.",
    ],
    keptH: "Was aufbewahrt wird, und wie lange",
    kept: [
      "Gesetzlich vorgeschriebene Abrechnungs- und Steuerunterlagen (in der Regel bis zu 7 Jahre). Zahlungen wickelt Stripe ab; wir speichern deine Kartennummer nicht.",
      "Anonymisierte, zusammengefasste Statistiken, die nicht mehr mit dir verknüpft sind (bei unserem Analyseanbieter gespeichert, in der Regel bis zu 13 Monate).",
    ],
    more: "Mehr dazu, welche Daten wir erheben und warum, findest du in unserer [[Datenschutzerklärung]].",
  },
  cs: {
    title: "Smazání účtu",
    intro: "Tato stránka vysvětluje, jak smazat váš účet **Gadit** a data, která s ním souvisejí. Gadit provozuje společnost **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Smazání účtu přímo v aplikaci",
    steps: [
      "Otevřete Gadit a přihlaste se.",
      "Přejděte do sekce **Účet** (klepněte na svůj profil a potom na **Účet**).",
      "Sjeďte dolů k položce **Smazat účet**.",
      "Potvrďte zadáním své e-mailové adresy a klepněte na **Smazat účet**.",
    ],
    immediate: "Smazání je okamžité a trvalé. Účet se odstraní a budete odhlášeni na všech zařízeních.",
    cantH: "Pokud se nemůžete přihlásit",
    cantP: "Napište na {email} z adresy, kterou máte u účtu, a požádejte nás o jeho smazání. Žádost ověříme a účet smažeme do 30 dnů.",
    deletedH: "Co se smaže",
    deleted: [
      "Váš účet a přihlašovací údaje (e-mail / přihlášení přes Google).",
      "Váš profil a všechny profily členů rodiny, které jste vytvořili.",
      "Uložená slova (sešit) a nedávná historie vyhledávání.",
      "Obrázky vytvořené pro váš účet a vaše nastavení v aplikaci.",
    ],
    keptH: "Co se uchovává a jak dlouho",
    kept: [
      "Záznamy o platbách a daních, které vyžaduje zákon (obvykle až 7 let). Platby zpracovává Stripe; číslo vaší karty neukládáme.",
      "Anonymizované souhrnné statistiky, které už s vámi nejsou spojené (uchovává je náš poskytovatel analytiky, obvykle až 13 měsíců).",
    ],
    more: "Podrobnosti o tom, co shromažďujeme a proč, najdete v našich [[Zásadách ochrany osobních údajů]].",
  },
  sk: {
    title: "Zmazanie účtu",
    intro: "Táto stránka vysvetľuje, ako zmazať váš účet **Gadit** a údaje, ktoré s ním súvisia. Gadit prevádzkuje spoločnosť **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Zmazanie účtu priamo v aplikácii",
    steps: [
      "Otvorte Gadit a prihláste sa.",
      "Prejdite do sekcie **Účet** (ťuknite na svoj profil a potom na **Účet**).",
      "Posuňte sa nadol k položke **Zmazať účet**.",
      "Potvrďte zadaním svojej e-mailovej adresy a ťuknite na **Zmazať účet**.",
    ],
    immediate: "Zmazanie je okamžité a trvalé. Účet sa odstráni a budete odhlásení na všetkých zariadeniach.",
    cantH: "Ak sa nemôžete prihlásiť",
    cantP: "Napíšte na {email} z adresy, ktorú máte pri účte, a požiadajte nás o jeho zmazanie. Žiadosť overíme a účet zmažeme do 30 dní.",
    deletedH: "Čo sa zmaže",
    deleted: [
      "Váš účet a prihlasovacie údaje (e-mail / prihlásenie cez Google).",
      "Váš profil a všetky profily členov rodiny, ktoré ste vytvorili.",
      "Uložené slová (zošit) a nedávna história vyhľadávania.",
      "Obrázky vytvorené pre váš účet a vaše nastavenia v aplikácii.",
    ],
    keptH: "Čo sa uchováva a ako dlho",
    kept: [
      "Záznamy o platbách a daniach, ktoré vyžaduje zákon (zvyčajne až 7 rokov). Platby spracúva Stripe; číslo vašej karty neukladáme.",
      "Anonymizované súhrnné štatistiky, ktoré už s vami nie sú prepojené (uchováva ich náš poskytovateľ analytiky, zvyčajne až 13 mesiacov).",
    ],
    more: "Podrobnosti o tom, čo zhromažďujeme a prečo, nájdete v našich [[Zásadách ochrany osobných údajov]].",
  },
  it: {
    title: "Elimina il tuo account",
    intro: "Questa pagina spiega come eliminare il tuo account **Gadit** e i dati collegati. Gadit è gestito da **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Elimina l'account dall'app",
    steps: [
      "Apri Gadit e accedi.",
      "Vai su **Account** (tocca il tuo profilo, poi **Account**).",
      "Scorri fino a **Elimina account**.",
      "Conferma digitando il tuo indirizzo email, poi tocca **Elimina account**.",
    ],
    immediate: "L'eliminazione è immediata e definitiva. Il tuo account viene rimosso e verrai disconnesso da tutti i dispositivi.",
    cantH: "Se non riesci ad accedere",
    cantP: "Scrivi a {email} dall'indirizzo collegato al tuo account e chiedici di eliminarlo. Verificheremo la richiesta ed elimineremo l'account entro 30 giorni.",
    deletedH: "Cosa viene eliminato",
    deleted: [
      "Il tuo account e le credenziali di accesso (email / accesso con Google).",
      "Il tuo profilo e tutti i profili dei familiari che hai creato.",
      "Le parole salvate (quaderno) e la cronologia delle ricerche recenti.",
      "Le immagini generate per il tuo account e le tue preferenze nell'app.",
    ],
    keptH: "Cosa viene conservato, e per quanto tempo",
    kept: [
      "I dati di fatturazione e fiscali richiesti dalla legge (di solito fino a 7 anni). I pagamenti sono gestiti da Stripe; non conserviamo il numero della tua carta.",
      "Statistiche aggregate e anonime che non sono più collegate a te (conservate dal nostro fornitore di analisi, di solito fino a 13 mesi).",
    ],
    more: "Per maggiori dettagli su cosa raccogliamo e perché, consulta la nostra [[Informativa sulla privacy]].",
  },
  ja: {
    title: "アカウントの削除",
    intro: "このページでは、**Gadit** のアカウントと、それに関連するデータを削除する方法を説明します。Gadit は **Lavi Learning and Training Technologies LLC** が運営しています。",
    inAppH: "アプリ内でアカウントを削除する",
    steps: [
      "Gadit を開いてサインインします。",
      "**アカウント** に移動します (プロフィールをタップし、**アカウント** をタップ)。",
      "**アカウントを削除** までスクロールします。",
      "メールアドレスを入力して確認し、**アカウントを削除** をタップします。",
    ],
    immediate: "削除はすぐに行われ、元に戻せません。アカウントが削除され、すべての端末からサインアウトされます。",
    cantH: "サインインできない場合",
    cantP: "アカウントに登録しているメールアドレスから {email} 宛てにメールを送り、削除をご依頼ください。ご本人確認のうえ、30 日以内にアカウントを削除します。",
    deletedH: "削除されるもの",
    deleted: [
      "アカウントとログイン情報 (メール / Google サインイン)。",
      "あなたのプロフィールと、作成した家族メンバーのプロフィール。",
      "保存した単語 (ノート) と最近の検索履歴。",
      "アカウント用に生成された画像と、アプリ内の設定。",
    ],
    keptH: "保持されるものとその期間",
    kept: [
      "法律で義務付けられている請求・税務記録 (通常は最長 7 年)。お支払いは Stripe が処理しており、カード番号は当社では保存しません。",
      "あなたとは結び付かなくなった、匿名化された集計分析データ (分析サービス提供会社が保持し、通常は最長 13 か月)。",
    ],
    more: "収集する情報とその理由について詳しくは、[[プライバシーポリシー]]をご覧ください。",
  },
  hi: {
    title: "अपना खाता हटाएँ",
    intro: "यह पेज बताता है कि अपना **Gadit** खाता और उससे जुड़ा डेटा कैसे हटाएँ। Gadit का संचालन **Lavi Learning and Training Technologies LLC** करती है।",
    inAppH: "ऐप के अंदर से खाता हटाएँ",
    steps: [
      "Gadit खोलें और साइन इन करें।",
      "**खाता** पर जाएँ (अपनी प्रोफ़ाइल पर टैप करें, फिर **खाता** पर)।",
      "नीचे **खाता हटाएँ** तक स्क्रॉल करें।",
      "अपना ईमेल पता टाइप करके पुष्टि करें, फिर **खाता हटाएँ** पर टैप करें।",
    ],
    immediate: "खाता तुरंत और हमेशा के लिए हट जाता है। आपका खाता मिटा दिया जाता है और आप हर डिवाइस से साइन आउट हो जाते हैं।",
    cantH: "अगर आप साइन इन नहीं कर पा रहे हैं",
    cantP: "अपने खाते वाले ईमेल पते से {email} पर ईमेल भेजें और खाता हटाने का अनुरोध करें। हम आपके अनुरोध की पुष्टि करेंगे और 30 दिनों के भीतर खाता हटा देंगे।",
    deletedH: "क्या हटाया जाता है",
    deleted: [
      "आपका खाता और लॉगिन जानकारी (ईमेल / Google साइन-इन)।",
      "आपकी प्रोफ़ाइल और आपके बनाए परिवार के सदस्यों की सभी प्रोफ़ाइलें।",
      "आपके सहेजे गए शब्द (नोटबुक) और हाल का खोज इतिहास।",
      "आपके खाते के लिए बनाई गई तस्वीरें और ऐप में आपकी पसंद की सेटिंग्स।",
    ],
    keptH: "क्या रखा जाता है, और कितने समय तक",
    kept: [
      "कानून के अनुसार ज़रूरी बिलिंग और टैक्स रिकॉर्ड (आमतौर पर 7 साल तक)। भुगतान Stripe संभालता है; हम आपका कार्ड नंबर नहीं रखते।",
      "गुमनाम, समेकित एनालिटिक्स जो अब आपसे जुड़े नहीं हैं (हमारे एनालिटिक्स प्रदाता के पास, आमतौर पर 13 महीने तक)।",
    ],
    more: "हम क्या इकट्ठा करते हैं और क्यों, इसकी पूरी जानकारी के लिए हमारी [[गोपनीयता नीति]] देखें।",
  },
  am: {
    title: "መለያዎን ይሰርዙ",
    intro: "ይህ ገጽ የ**Gadit** መለያዎን እና ከእሱ ጋር የተያያዘውን መረጃ እንዴት እንደሚሰርዙ ያብራራል። Gadit የሚተዳደረው በ**Lavi Learning and Training Technologies LLC** ነው።",
    inAppH: "መለያውን ከመተግበሪያው ውስጥ ይሰርዙ",
    steps: [
      "Gadit ን ይክፈቱ እና ይግቡ።",
      "ወደ **መለያ** ይሂዱ (መገለጫዎን ይንኩ፣ ከዚያ **መለያ** ን ይንኩ)።",
      "ወደ **መለያ ይሰርዙ** ይሸብልሉ።",
      "የኢሜይል አድራሻዎን በመተየብ ያረጋግጡ፣ ከዚያ **መለያ ይሰርዙ** ን ይንኩ።",
    ],
    immediate: "ስረዛው ወዲያውኑ የሚፈጸም እና ቋሚ ነው። መለያዎ ይወገዳል፣ ከሁሉም መሳሪያዎችም ይወጣሉ።",
    cantH: "መግባት ካልቻሉ",
    cantP: "በመለያዎ ላይ ካለው አድራሻ ወደ {email} ኢሜይል ይላኩ እና መለያውን እንድንሰርዝ ይጠይቁ። ጥያቄዎን አረጋግጠን መለያውን በ30 ቀናት ውስጥ እንሰርዛለን።",
    deletedH: "ምን ይሰረዛል",
    deleted: [
      "መለያዎ እና የመግቢያ መረጃዎ (ኢሜይል / በGoogle መግቢያ)።",
      "መገለጫዎ እና የፈጠሯቸው የቤተሰብ አባላት መገለጫዎች በሙሉ።",
      "ያስቀመጧቸው ቃላት (ደብተር) እና የቅርብ ጊዜ የፍለጋ ታሪክ።",
      "ለመለያዎ የተፈጠሩ ምስሎች እና በመተግበሪያው ውስጥ ያሉ ምርጫዎችዎ።",
    ],
    keptH: "ምን ይቀመጣል፣ ለምን ያህል ጊዜ",
    kept: [
      "በሕግ የሚጠየቁ የክፍያ እና የግብር መዝገቦች (በአብዛኛው እስከ 7 ዓመት)። ክፍያዎችን የሚያስተናግደው Stripe ነው፤ የካርድዎን ቁጥር አናስቀምጥም።",
      "ከእርስዎ ጋር የማይያያዙ፣ ማንነትን የማይገልጹ አጠቃላይ የትንታኔ መረጃዎች (በትንታኔ አገልግሎት አቅራቢያችን ዘንድ ይቀመጣሉ፣ በአብዛኛው እስከ 13 ወር)።",
    ],
    more: "ምን እንደምንሰበስብ እና ለምን እንደሆነ በዝርዝር ለማወቅ [[የግላዊነት መመሪያችንን]] ይመልከቱ።",
  },
  uk: {
    title: "Видалення акаунта",
    intro: "На цій сторінці пояснено, як видалити акаунт **Gadit** і пов'язані з ним дані. Gadit керує компанія **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Видалення акаунта в застосунку",
    steps: [
      "Відкрийте Gadit і увійдіть.",
      "Перейдіть до розділу **Акаунт** (торкніться свого профілю, а потім **Акаунт**).",
      "Прокрутіть до пункту **Видалити акаунт**.",
      "Підтвердьте, ввівши свою електронну адресу, а потім торкніться **Видалити акаунт**.",
    ],
    immediate: "Видалення відбувається одразу й назавжди. Акаунт буде видалено, і ви вийдете з нього на всіх пристроях.",
    cantH: "Якщо ви не можете увійти",
    cantP: "Напишіть на {email} з адреси, указаної в акаунті, і попросіть його видалити. Ми перевіримо запит і видалимо акаунт протягом 30 днів.",
    deletedH: "Що видаляється",
    deleted: [
      "Ваш акаунт і дані для входу (електронна пошта / вхід через Google).",
      "Ваш профіль і всі створені вами профілі членів родини.",
      "Збережені слова (зошит) і нещодавня історія пошуку.",
      "Зображення, створені для вашого акаунта, і ваші налаштування в застосунку.",
    ],
    keptH: "Що зберігається і як довго",
    kept: [
      "Платіжні та податкові записи, яких вимагає закон (зазвичай до 7 років). Платежі обробляє Stripe; ми не зберігаємо номер вашої картки.",
      "Знеособлена зведена аналітика, яка більше не пов'язана з вами (зберігається в нашого постачальника аналітики, зазвичай до 13 місяців).",
    ],
    more: "Докладніше про те, що ми збираємо і навіщо, читайте в нашій [[Політиці конфіденційності]].",
  },
  tr: {
    title: "Hesabınızı silin",
    intro: "Bu sayfa, **Gadit** hesabınızı ve hesabınızla ilişkili verileri nasıl sileceğinizi açıklar. Gadit, **Lavi Learning and Training Technologies LLC** tarafından işletilmektedir.",
    inAppH: "Hesabınızı uygulamanın içinden silin",
    steps: [
      "Gadit'i açın ve giriş yapın.",
      "**Hesap** bölümüne gidin (profilinize, ardından **Hesap** seçeneğine dokunun).",
      "**Hesabı sil** seçeneğine kadar kaydırın.",
      "E-posta adresinizi yazarak onaylayın, ardından **Hesabı sil** seçeneğine dokunun.",
    ],
    immediate: "Silme işlemi anında gerçekleşir ve kalıcıdır. Hesabınız kaldırılır ve tüm cihazlarda oturumunuz kapatılır.",
    cantH: "Giriş yapamıyorsanız",
    cantP: "Hesabınızdaki adresten {email} adresine e-posta gönderin ve hesabınızın silinmesini isteyin. Talebinizi doğrulayıp hesabı 30 gün içinde sileceğiz.",
    deletedH: "Neler silinir",
    deleted: [
      "Hesabınız ve giriş bilgileriniz (e-posta / Google ile giriş).",
      "Profiliniz ve oluşturduğunuz tüm aile üyesi profilleri.",
      "Kaydettiğiniz kelimeler (defter) ve son arama geçmişiniz.",
      "Hesabınız için oluşturulan görseller ve uygulama içi tercihleriniz.",
    ],
    keptH: "Neler saklanır ve ne kadar süreyle",
    kept: [
      "Yasaların gerektirdiği fatura ve vergi kayıtları (genellikle 7 yıla kadar). Ödemeler Stripe tarafından işlenir; kart numaranızı saklamayız.",
      "Artık sizinle ilişkilendirilmeyen, anonimleştirilmiş toplu analiz verileri (analiz hizmeti sağlayıcımız tarafından genellikle 13 aya kadar saklanır).",
    ],
    more: "Hangi verileri neden topladığımızla ilgili ayrıntılar için [[Gizlilik Politikamıza]] bakın.",
  },
  pl: {
    title: "Usuń konto",
    intro: "Na tej stronie wyjaśniamy, jak usunąć konto **Gadit** i powiązane z nim dane. Operatorem Gadit jest **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Usuwanie konta w aplikacji",
    steps: [
      "Otwórz Gadit i zaloguj się.",
      "Przejdź do sekcji **Konto** (dotknij swojego profilu, a potem **Konto**).",
      "Przewiń do opcji **Usuń konto**.",
      "Potwierdź, wpisując swój adres e-mail, a następnie dotknij **Usuń konto**.",
    ],
    immediate: "Usunięcie następuje natychmiast i jest trwałe. Konto zostaje usunięte, a Ty zostaniesz wylogowany na wszystkich urządzeniach.",
    cantH: "Jeśli nie możesz się zalogować",
    cantP: "Napisz na {email} z adresu przypisanego do konta i poproś o jego usunięcie. Zweryfikujemy prośbę i usuniemy konto w ciągu 30 dni.",
    deletedH: "Co zostaje usunięte",
    deleted: [
      "Twoje konto i dane logowania (e-mail / logowanie przez Google).",
      "Twój profil i wszystkie utworzone przez Ciebie profile członków rodziny.",
      "Zapisane słowa (notatnik) i ostatnia historia wyszukiwania.",
      "Obrazy wygenerowane dla Twojego konta i Twoje ustawienia w aplikacji.",
    ],
    keptH: "Co jest przechowywane i jak długo",
    kept: [
      "Dokumenty rozliczeniowe i podatkowe wymagane przez prawo (zwykle do 7 lat). Płatności obsługuje Stripe; nie przechowujemy numeru Twojej karty.",
      "Zanonimizowane, zbiorcze dane analityczne, które nie są już z Tobą powiązane (przechowuje je nasz dostawca analityki, zwykle do 13 miesięcy).",
    ],
    more: "Więcej o tym, jakie dane zbieramy i dlaczego, przeczytasz w naszej [[Polityce prywatności]].",
  },
  fa: {
    title: "حذف حساب کاربری",
    intro: "این صفحه توضیح می‌دهد که چطور حساب **Gadit** خود و داده‌های مرتبط با آن را حذف کنید. Gadit توسط **Lavi Learning and Training Technologies LLC** اداره می‌شود.",
    inAppH: "حذف حساب از داخل برنامه",
    steps: [
      "Gadit را باز کنید و وارد شوید.",
      "به **حساب** بروید (روی نمایه خود و سپس روی **حساب** بزنید).",
      "به پایین تا **حذف حساب** بروید.",
      "با نوشتن نشانی ایمیل خود تأیید کنید و سپس روی **حذف حساب** بزنید.",
    ],
    immediate: "حذف فوری و دائمی است. حساب شما پاک می‌شود و از همه دستگاه‌ها خارج می‌شوید.",
    cantH: "اگر نمی‌توانید وارد شوید",
    cantP: "از نشانی ثبت‌شده در حساب خود به {email} ایمیل بزنید و درخواست حذف آن را بدهید. درخواست شما را بررسی می‌کنیم و حساب را ظرف 30 روز حذف می‌کنیم.",
    deletedH: "چه چیزهایی حذف می‌شود",
    deleted: [
      "حساب شما و اطلاعات ورود (ایمیل / ورود با Google).",
      "نمایه شما و همه نمایه‌های اعضای خانواده که ساخته‌اید.",
      "واژه‌های ذخیره‌شده (دفترچه) و سابقه جست‌وجوی اخیر.",
      "تصاویری که برای حساب شما ساخته شده و تنظیمات شما در برنامه.",
    ],
    keptH: "چه چیزهایی نگه داشته می‌شود و تا چه مدت",
    kept: [
      "سوابق صورت‌حساب و مالیات که قانون الزام می‌کند (معمولاً تا 7 سال). پرداخت‌ها را Stripe انجام می‌دهد؛ ما شماره کارت شما را نگه نمی‌داریم.",
      "آمار تجمیعی و بی‌نام که دیگر به شما مرتبط نیست (نزد ارائه‌دهنده خدمات تحلیل ما نگه داشته می‌شود، معمولاً تا 13 ماه).",
    ],
    more: "برای جزئیات بیشتر درباره اینکه چه چیزهایی را جمع‌آوری می‌کنیم و چرا، [[سیاست حفظ حریم خصوصی]] ما را ببینید.",
  },
  id: {
    title: "Hapus akunmu",
    intro: "Halaman ini menjelaskan cara menghapus akun **Gadit** milikmu beserta data yang terkait dengannya. Gadit dioperasikan oleh **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Hapus akun dari dalam aplikasi",
    steps: [
      "Buka Gadit dan masuk.",
      "Buka **Akun** (ketuk profilmu, lalu **Akun**).",
      "Gulir ke **Hapus akun**.",
      "Konfirmasi dengan mengetik alamat emailmu, lalu ketuk **Hapus akun**.",
    ],
    immediate: "Penghapusan berlaku seketika dan permanen. Akunmu dihapus dan kamu akan keluar dari semua perangkat.",
    cantH: "Jika kamu tidak bisa masuk",
    cantP: "Kirim email ke {email} dari alamat yang terdaftar di akunmu dan minta kami menghapusnya. Kami akan memverifikasi permintaanmu dan menghapus akun dalam 30 hari.",
    deletedH: "Apa yang dihapus",
    deleted: [
      "Akunmu dan data masuk (email / masuk dengan Google).",
      "Profilmu dan semua profil anggota keluarga yang kamu buat.",
      "Kata yang kamu simpan (buku catatan) dan riwayat pencarian terbaru.",
      "Gambar yang dibuat untuk akunmu dan preferensimu di aplikasi.",
    ],
    keptH: "Apa yang disimpan, dan berapa lama",
    kept: [
      "Catatan tagihan dan pajak yang diwajibkan hukum (biasanya hingga 7 tahun). Pembayaran diproses oleh Stripe; kami tidak menyimpan nomor kartumu.",
      "Data analitik gabungan yang dianonimkan dan tidak lagi terkait denganmu (disimpan oleh penyedia analitik kami, biasanya hingga 13 bulan).",
    ],
    more: "Untuk detail lebih lanjut tentang data yang kami kumpulkan dan alasannya, lihat [[Kebijakan Privasi]] kami.",
  },
  nl: {
    title: "Je account verwijderen",
    intro: "Op deze pagina lees je hoe je je **Gadit**-account en de bijbehorende gegevens verwijdert. Gadit wordt beheerd door **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Je account verwijderen in de app",
    steps: [
      "Open Gadit en log in.",
      "Ga naar **Account** (tik op je profiel en daarna op **Account**).",
      "Scrol naar **Account verwijderen**.",
      "Bevestig door je e-mailadres te typen en tik daarna op **Account verwijderen**.",
    ],
    immediate: "Het verwijderen gebeurt direct en is definitief. Je account wordt verwijderd en je wordt op elk apparaat uitgelogd.",
    cantH: "Als je niet kunt inloggen",
    cantP: "Mail naar {email} vanaf het adres van je account en vraag ons het te verwijderen. We controleren je verzoek en verwijderen het account binnen 30 dagen.",
    deletedH: "Wat wordt verwijderd",
    deleted: [
      "Je account en inloggegevens (e-mail / inloggen met Google).",
      "Je profiel en alle profielen van gezinsleden die je hebt aangemaakt.",
      "Je opgeslagen woorden (notitieboek) en je recente zoekgeschiedenis.",
      "Afbeeldingen die voor je account zijn gemaakt en je voorkeuren in de app.",
    ],
    keptH: "Wat wordt bewaard, en hoe lang",
    kept: [
      "Wettelijk verplichte facturatie- en belastinggegevens (meestal tot 7 jaar). Betalingen worden verwerkt door Stripe; we slaan je kaartnummer niet op.",
      "Geanonimiseerde, samengevoegde statistieken die niet meer aan jou gekoppeld zijn (bewaard door onze analyseprovider, meestal tot 13 maanden).",
    ],
    more: "Meer over welke gegevens we verzamelen en waarom lees je in ons [[Privacybeleid]].",
  },
  el: {
    title: "Διαγραφή λογαριασμού",
    intro: "Αυτή η σελίδα εξηγεί πώς να διαγράψεις τον λογαριασμό σου στο **Gadit** και τα δεδομένα που σχετίζονται με αυτόν. Το Gadit λειτουργεί από την **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Διαγραφή λογαριασμού μέσα από την εφαρμογή",
    steps: [
      "Άνοιξε το Gadit και συνδέσου.",
      "Πήγαινε στο **Λογαριασμός** (πάτησε το προφίλ σου και μετά **Λογαριασμός**).",
      "Κύλισε μέχρι το **Διαγραφή λογαριασμού**.",
      "Επιβεβαίωσε πληκτρολογώντας τη διεύθυνση email σου και μετά πάτησε **Διαγραφή λογαριασμού**.",
    ],
    immediate: "Η διαγραφή γίνεται αμέσως και είναι οριστική. Ο λογαριασμός σου αφαιρείται και αποσυνδέεσαι από όλες τις συσκευές.",
    cantH: "Αν δεν μπορείς να συνδεθείς",
    cantP: "Στείλε email στο {email} από τη διεύθυνση του λογαριασμού σου και ζήτησε να τον διαγράψουμε. Θα επαληθεύσουμε το αίτημά σου και θα διαγράψουμε τον λογαριασμό μέσα σε 30 ημέρες.",
    deletedH: "Τι διαγράφεται",
    deleted: [
      "Ο λογαριασμός σου και τα στοιχεία σύνδεσης (email / σύνδεση με Google).",
      "Το προφίλ σου και όλα τα προφίλ μελών της οικογένειας που δημιούργησες.",
      "Οι αποθηκευμένες λέξεις σου (τετράδιο) και το πρόσφατο ιστορικό αναζητήσεων.",
      "Οι εικόνες που δημιουργήθηκαν για τον λογαριασμό σου και οι προτιμήσεις σου στην εφαρμογή.",
    ],
    keptH: "Τι διατηρείται, και για πόσο",
    kept: [
      "Αρχεία χρεώσεων και φορολογικά αρχεία που απαιτεί ο νόμος (συνήθως έως 7 χρόνια). Τις πληρωμές τις διαχειρίζεται η Stripe· δεν αποθηκεύουμε τον αριθμό της κάρτας σου.",
      "Ανωνυμοποιημένα, συγκεντρωτικά στατιστικά που δεν συνδέονται πια με εσένα (τα διατηρεί ο πάροχος στατιστικών μας, συνήθως έως 13 μήνες).",
    ],
    more: "Για περισσότερες λεπτομέρειες σχετικά με το τι συλλέγουμε και γιατί, δες την [[Πολιτική απορρήτου]] μας.",
  },
  zu: {
    title: "Susa i-akhawunti yakho",
    intro: "Leli khasi lichaza indlela yokususa i-akhawunti yakho ye-**Gadit** kanye nedatha ehlobene nayo. I-Gadit iphethwe yi-**Lavi Learning and Training Technologies LLC**.",
    inAppH: "Susa i-akhawunti yakho ngaphakathi kohlelo lokusebenza",
    steps: [
      "Vula i-Gadit bese ungena.",
      "Iya ku-**I-akhawunti** (thepha iphrofayela yakho, bese uthepha **I-akhawunti**).",
      "Skrolela ku-**Susa i-akhawunti**.",
      "Qinisekisa ngokuthayipha ikheli lakho le-imeyili, bese uthepha **Susa i-akhawunti**.",
    ],
    immediate: "Ukususwa kwenzeka ngokushesha futhi kungunaphakade. I-akhawunti yakho iyasuswa futhi uzokhishwa kuwo wonke amadivayisi.",
    cantH: "Uma ungakwazi ukungena",
    cantP: "Thumela i-imeyili ku-{email} usebenzisa ikheli elikwi-akhawunti yakho futhi ucele ukuthi siyisuse. Sizoqinisekisa isicelo sakho bese sisusa i-akhawunti zingakapheli izinsuku ezingu-30.",
    deletedH: "Okususwayo",
    deleted: [
      "I-akhawunti yakho nemininingwane yokungena (i-imeyili / ukungena nge-Google).",
      "Iphrofayela yakho nanoma yimaphi amaphrofayela amalungu omndeni owadalile.",
      "Amagama owalondolozile (incwadi yamanothi) nomlando wakamuva wokusesha.",
      "Izithombe ezenzelwe i-akhawunti yakho nokuncamelayo ohlelweni lokusebenza.",
    ],
    keptH: "Okugcinwayo, nesikhathi esingakanani",
    kept: [
      "Amarekhodi okukhokha nentela adingwa ngumthetho (ngokuvamile kuze kube yiminyaka engu-7). Izinkokhelo ziphathwa yi-Stripe; asiyigcini inombolo yekhadi lakho.",
      "Izibalo ezihlanganisiwe ezingenagama ezingasaxhunyiwe kuwe (zigcinwa ngumhlinzeki wethu wezibalo, ngokuvamile kuze kube yizinyanga ezingu-13).",
    ],
    more: "Ukuze uthole imininingwane eyengeziwe mayelana nalokho esikuqoqayo nokuthi kungani, bheka [[Inqubomgomo Yobumfihlo]] yethu.",
  },
  xh: {
    title: "Cima iakhawunti yakho",
    intro: "Eli phepha lichaza indlela yokucima iakhawunti yakho ye-**Gadit** kunye nedatha enxulumene nayo. I-Gadit iqhutywa yi-**Lavi Learning and Training Technologies LLC**.",
    inAppH: "Cima iakhawunti yakho ngaphakathi kwi-app",
    steps: [
      "Vula i-Gadit uze ungene.",
      "Yiya kwi-**Iakhawunti** (cofa iprofayile yakho, uze ucofe **Iakhawunti**).",
      "Skrolela ezantsi ku-**Cima iakhawunti**.",
      "Qinisekisa ngokuchwetheza idilesi yakho ye-imeyile, uze ucofe **Cima iakhawunti**.",
    ],
    immediate: "Ukucima kwenzeka kwangoko kwaye kusisigxina. Iakhawunti yakho iyasuswa kwaye uya kuphuma kuzo zonke izixhobo.",
    cantH: "Ukuba awukwazi ukungena",
    cantP: "Thumela i-imeyile ku-{email} usebenzisa idilesi ekwiakhawunti yakho kwaye ucele ukuba siyicime. Siza kusiqinisekisa isicelo sakho size siyicime iakhawunti kwiintsuku ezingama-30.",
    deletedH: "Into ecinywayo",
    deleted: [
      "Iakhawunti yakho neenkcukacha zokungena (i-imeyile / ukungena nge-Google).",
      "Iprofayile yakho nayo nayiphi na iprofayile yelungu losapho oyenzileyo.",
      "Amagama owagcinileyo (incwadi) kunye nembali yokukhangela yakutshanje.",
      "Imifanekiso eyenzelwe iakhawunti yakho kunye nezinto ozikhethayo kwi-app.",
    ],
    keptH: "Into egcinwayo, nangexesha elingakanani",
    kept: [
      "Iirekhodi zokuhlawula nezerhafu ezifunwa ngumthetho (ngokuqhelekileyo ukuya kwiminyaka esi-7). Iintlawulo ziphathwa yi-Stripe; asiyigcini inombolo yekhadi lakho.",
      "Amanani adityanisiweyo angenagama angasanxulumananga nawe (agcinwa ngumboneleli wethu wohlalutyo, ngokuqhelekileyo ukuya kwiinyanga ezili-13).",
    ],
    more: "Ukufumana iinkcukacha ezithe kratya malunga noko sikuqokelelayo nesizathu, jonga [[uMgaqo-nkqubo wabucala]] wethu.",
  },
  nso: {
    title: "Phumola akhaonto ya gago",
    intro: "Letlakala le le hlaloša ka moo o ka phumolago akhaonto ya gago ya **Gadit** le tshedimošo ye e amanago le yona. Gadit e sepetšwa ke **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Phumola akhaonto ya gago ka gare ga app",
    steps: [
      "Bula Gadit gomme o tsene.",
      "Eya go **Akhaonto** (kgotla profaele ya gago, ke moka o kgotle **Akhaonto**).",
      "Skrolela go **Phumola akhaonto**.",
      "Netefatša ka go ngwala aterese ya gago ya imeile, ke moka o kgotle **Phumola akhaonto**.",
    ],
    immediate: "Go phumola go direga gateetee e bile ke ga ka mehla. Akhaonto ya gago e a tlošwa gomme o tla tšwa go didirišwa ka moka.",
    cantH: "Ge o sa kgone go tsena",
    cantP: "Romela imeile go {email} go tšwa atereseng ye e lego akhaontong ya gago gomme o re kgopele go e phumola. Re tla netefatša kgopelo ya gago gomme re phumole akhaonto mo matšatšing a 30.",
    deletedH: "Se se phumolwago",
    deleted: [
      "Akhaonto ya gago le dintlha tša go tsena (imeile / go tsena ka Google).",
      "Profaele ya gago le diprofaele dife goba dife tša maloko a lapa tšeo o di hlamilego.",
      "Mantšu ao o a bolokilego (puku ya mantšu) le histori ya go nyaka ya bjale.",
      "Diswantšho tšeo di dirilwego bakeng sa akhaonto ya gago le dikgetho tša gago ka gare ga app.",
    ],
    keptH: "Se se bolokwago, le gore ke nako ye kae",
    kept: [
      "Direkhoto tša tefelo le tša motšhelo tšeo di nyakwago ke molao (gantši go fihla go mengwaga ye 7). Ditefelo di swarwa ke Stripe; ga re boloke nomoro ya karata ya gago.",
      "Dipalopalo tše di kopantšwego tše di sa tsebagatšego motho, tšeo di sa sa amanego le wena (di bolokwa ke mofani wa rena wa dipalopalo, gantši go fihla go dikgwedi tše 13).",
    ],
    more: "Go hwetša dintlha tše dingwe mabapi le seo re se kgobokanyago le lebaka, bona [[Pholisi ya rena ya Sephiri]].",
  },
  tn: {
    title: "Phimola akhaonto ya gago",
    intro: "Tsebe e e tlhalosa ka moo o ka phimolang akhaonto ya gago ya **Gadit** le tshedimosetso e e amanang le yone. Gadit e tsamaisiwa ke **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Phimola akhaonto ya gago mo teng ga app",
    steps: [
      "Bula Gadit mme o tsene.",
      "Ya kwa go **Akhaonto** (tobetsa profaele ya gago, morago o tobetse **Akhaonto**).",
      "Sutela kwa go **Phimola akhaonto**.",
      "Netefatsa ka go kwala aterese ya gago ya imeile, morago o tobetse **Phimola akhaonto**.",
    ],
    immediate: "Go phimola go diragala ka bonako e bile ke ga bosakhutleng. Akhaonto ya gago e a tlosiwa mme o tla tswa mo didirisiweng tsotlhe.",
    cantH: "Fa o sa kgone go tsena",
    cantP: "Romela imeile kwa {email} go tswa mo atereseng e e mo akhaontong ya gago mme o re kope go e phimola. Re tla netefatsa kopo ya gago mme re phimole akhaonto mo malatsing a le 30.",
    deletedH: "Se se phimolwang",
    deleted: [
      "Akhaonto ya gago le dintlha tsa go tsena (imeile / go tsena ka Google).",
      "Profaele ya gago le diprofaele dipe fela tsa maloko a lelapa tse o di dirileng.",
      "Mafoko a o a bolokileng (bukana) le hisitori ya go batla ya bosheng.",
      "Ditshwantsho tse di diretsweng akhaonto ya gago le ditlhopho tsa gago mo app.",
    ],
    keptH: "Se se bolokwang, le gore ke lobaka lo lo kae",
    kept: [
      "Direkoto tsa go duela le tsa lekgetho tse di tlhokwang ke molao (gantsi go fitlha go dingwaga di le 7). Dituelo di tshwarwa ke Stripe; ga re boloke nomore ya karata ya gago.",
      "Dipalopalo tse di kopantsweng, tse di sa supeng motho, tse di sa tlhole di amana le wena (di bolokwa ke motlamedi wa rona wa dipalopalo, gantsi go fitlha go dikgwedi di le 13).",
    ],
    more: "Go bona dintlha tse dingwe ka se re se kokoanyang le lebaka, bona [[Pholisi ya rona ya Sephiri]].",
  },
  st: {
    title: "Hlakola akhaonte ya hao",
    intro: "Leqephe lena le hlalosa hore na o ka hlakola jwang akhaonte ya hao ya **Gadit** le dintlha tse amanang le yona. Gadit e tsamaiswa ke **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Hlakola akhaonte ya hao ka hare ho app",
    steps: [
      "Bula Gadit mme o kene.",
      "Eya ho **Akhaonte** (tobetsa profaele ya hao, ebe o tobetsa **Akhaonte**).",
      "Theohela ho **Hlakola akhaonte**.",
      "Netefatsa ka ho ngola aterese ya hao ya imeile, ebe o tobetsa **Hlakola akhaonte**.",
    ],
    immediate: "Ho hlakola ho etsahala hang hang mme ke ha ka ho sa feleng. Akhaonte ya hao e a tloswa mme o tla tswa ho disebediswa tsohle.",
    cantH: "Haeba o sa kgone ho kena",
    cantP: "Romela imeile ho {email} o sebedisa aterese e ho akhaonte ya hao mme o re kope ho e hlakola. Re tla netefatsa kopo ya hao mme re hlakole akhaonte nakong ya matsatsi a 30.",
    deletedH: "Se hlakolwang",
    deleted: [
      "Akhaonte ya hao le dintlha tsa ho kena (imeile / ho kena ka Google).",
      "Profaele ya hao le diprofaele dife kapa dife tsa ditho tsa lelapa tseo o di entseng.",
      "Mantswe ao o a bolokileng (bukana) le histori ya ho batla ya morao tjena.",
      "Ditshwantsho tse entsweng bakeng sa akhaonte ya hao le dikgetho tsa hao ka hare ho app.",
    ],
    keptH: "Se bolokwang, le hore ke nako e kae",
    kept: [
      "Direkoto tsa tefo le tsa lekgetho tse hlokwang ke molao (hangata ho fihlela dilemo tse 7). Ditefo di tshwarwa ke Stripe; ha re boloke nomoro ya karete ya hao.",
      "Dipalopalo tse kopantsweng, tse sa tsebahatseng motho, tse sa amaneng le wena hape (di bolokwa ke mofani wa rona wa dipalopalo, hangata ho fihlela dikgwedi tse 13).",
    ],
    more: "Ho fumana dintlha tse ding ka seo re se bokellang le lebaka, bona [[Leano la rona la Lekunutu]].",
  },
  ts: {
    title: "Susa akhawunti ya n'wina",
    intro: "Tluka leri ri hlamusela ndlela yo susa akhawunti ya n'wina ya **Gadit** ni vuxokoxoko lebyi fambelanaka na yona. Gadit yi fambisiwa hi **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Susani akhawunti endzeni ka app",
    steps: [
      "Pfulani Gadit kutani mi nghena.",
      "Yanani eka **Akhawunti** (thintani phurofayili ya n'wina, kutani mi thinta **Akhawunti**).",
      "Rhurhelani ehansi ku ya eka **Susa akhawunti**.",
      "Tiyisekisani hi ku tsala adirese ya n'wina ya imeyili, kutani mi thinta **Susa akhawunti**.",
    ],
    immediate: "Ku susa swi endleka hi ku hatlisa naswona i ka masiku hinkwawo. Akhawunti ya n'wina ya susiwa naswona mi ta humesiwa eka switirhisiwa hinkwaswo.",
    cantH: "Loko mi nga koti ku nghena",
    cantP: "Rhumelani imeyili eka {email} hi adirese leyi nga eka akhawunti ya n'wina kutani mi hi kombela ku yi susa. Hi ta tiyisekisa xikombelo xa n'wina kutani hi susa akhawunti endzeni ka masiku ya 30.",
    deletedH: "Leswi susiwaka",
    deleted: [
      "Akhawunti ya n'wina ni vuxokoxoko byo nghena (imeyili / ku nghena hi Google).",
      "Phurofayili ya n'wina ni tiphurofayili tin'wana ta swirho swa ndyangu leti mi ti endleke.",
      "Marito lawa mi ma hlayiseke (buku ya marito) ni matimu ya ku lavisisa ya sweswinyana.",
      "Swifaniso leswi endleriweke akhawunti ya n'wina ni leswi mi swi hlawuleke eka app.",
    ],
    keptH: "Leswi hlayisiwaka, ni nkarhi wo tani hi kwihi",
    kept: [
      "Rhekhodo ya ku hakela ni ya xibalo leyi laviwaka hi nawu (hi ntolovelo ku fika eka malembe ya 7). Ku hakela ku khomiwa hi Stripe; a hi hlayisi nomboro ya khadi ra n'wina.",
      "Tinhlayo leti hlanganisiweke, leti nga kombiki munhu, leti nga ha fambelaniki na n'wina (ti hlayisiwa hi muphakeri wa hina wa tinhlayo, hi ntolovelo ku fika eka tin'hweti ta 13).",
    ],
    more: "Ku kuma vuxokoxoko byo engetela hi leswi hi swi hlengeletaka ni xivangelo, langutani [[Pholisi ya hina ya Vusirheleri bya Vuxokoxoko]].",
  },
  ss: {
    title: "Cisha i-akhawunti yakho",
    intro: "Lelikhasi lichaza kutsi ungayicisha njani i-akhawunti yakho ye-**Gadit** kanye nemniningwane lohlobene nayo. I-Gadit iphetfwe ngu-**Lavi Learning and Training Technologies LLC**.",
    inAppH: "Cisha i-akhawunti yakho ngekhatsi ku-app",
    steps: [
      "Vula i-Gadit bese uyangena.",
      "Ya ku-**I-akhawunti** (cindzetela iphrofayili yakho, bese ucindzetela **I-akhawunti**).",
      "Skrolela ku-**Cisha i-akhawunti**.",
      "Cinisekisa ngekubhala likheli lakho le-imeyili, bese ucindzetela **Cisha i-akhawunti**.",
    ],
    immediate: "Kucisha kwenteka khona manjalo futsi kungumphela. I-akhawunti yakho iyasuswa futsi utawuphuma kuwo onkhe emathuluzi.",
    cantH: "Nangabe ungakhoni kungena",
    cantP: "Tfumela i-imeyili ku-{email} usebentisa likheli lelise-akhawuntini yakho bese ucela kutsi siyicishe. Sitawucinisekisa sicelo sakho bese siyicisha i-akhawunti ingakapheli emalanga langu-30.",
    deletedH: "Lokucishwako",
    deleted: [
      "I-akhawunti yakho nemininingwane yekungena (i-imeyili / kungena nge-Google).",
      "Iphrofayili yakho nanobe ngutiphi tiphrofayili temalunga emndeni lotentile.",
      "Emagama lowagcinile (incwadzi) nemlandvo wakamuva wekusesha.",
      "Titfombe letentelwe i-akhawunti yakho kanye nalokukhetsako ku-app.",
    ],
    keptH: "Lokugcinwako, nekutsi kungakanani sikhatsi",
    kept: [
      "Emarekhodi ekukhokha nentsela ladzingwa ngumtsetfo (kavamise kufika eminyakeni lesi-7). Tinkhokhelo tiphatfwa ngu-Stripe; asiyigcini inombolo yelikhadi lakho.",
      "Tibalo letihlanganisiwe letingavezi muntfu, letingasahlobani nawe (tigcinwa ngumhlinzeki wetfu wetibalo, kavamise kufika etinyangeni leti-13).",
    ],
    more: "Kute utfole imininingwane leyengetiwe mayelana nalesikucoca nekutsi kungani, buka [[Inchubomgomo yetfu Yemfihlo]].",
  },
  ve: {
    title: "Phumulani akhaunthu yaṋu",
    intro: "Siaṱari iḽi ḽi ṱalutshedza nḓila ya u phumula akhaunthu yaṋu ya **Gadit** na data i elanaho nayo. Gadit i tshimbidzwa nga **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Phumulani akhaunthu yaṋu ngomu ha app",
    steps: [
      "Vulani Gadit nahone ni dzhene.",
      "Iyani kha **Akhaunthu** (kwamani phurofaiḽi yaṋu, nga murahu ni kwame **Akhaunthu**).",
      "Tsitselani fhasi u swika kha **Phumulani akhaunthu**.",
      "Khwaṱhisedzani nga u ṅwala aḓirese yaṋu ya imeiḽi, nga murahu ni kwame **Phumulani akhaunthu**.",
    ],
    immediate: "U phumula zwi itea nga u ṱavhanya nahone ndi zwa tshoṱhe. Akhaunthu yaṋu i a bviswa nahone ni ḓo bviswa kha zwishumiswa zwoṱhe.",
    cantH: "Arali ni sa koni u dzhena",
    cantP: "Rumelani imeiḽi kha {email} ni tshi shumisa aḓirese i re kha akhaunthu yaṋu nahone ni ri humbele u i phumula. Ri ḓo khwaṱhisedza khumbelo yaṋu nahone ra phumula akhaunthu hu saathu u fhela maḓuvha a 30.",
    deletedH: "Zwine zwa phumulwa",
    deleted: [
      "Akhaunthu yaṋu na zwidodombedzwa zwa u dzhena (imeiḽi / u dzhena nga Google).",
      "Phurofaiḽi yaṋu na phurofaiḽi dziṅwe dza miraḓo ya muṱa dze na dzi sika.",
      "Maipfi e na a vhulunga (bugu) na ḓivhazwakale ya u ṱoḓa ya zwenezwino.",
      "Zwifanyiso zwo itelwaho akhaunthu yaṋu na zwine na zwi khetha kha app.",
    ],
    keptH: "Zwine zwa vhulungwa, na uri ndi tshifhinga tshingafhani",
    kept: [
      "Rekhodo dza mbadelo na dza muthelo dzine dza ṱoḓwa nga mulayo (kanzhi u swika miṅwaha ya 7). Mbadelo dzi farwa nga Stripe; a ri vhulungi nomboro ya garaṱa yaṋu.",
      "Mbalo dzo ṱanganyiswaho, dzi sa sumbedzi muthu, dzi sa tsha elana naṋi (dzi vhulungwa nga muṋetshedzi washu wa mbalo, kanzhi u swika miṅwedzi ya 13).",
    ],
    more: "U wana zwidodombedzwa zwinzhi nga ha zwine ra zwi kuvhanganya na uri ndi ngani, sedzani [[Mulayo washu wa Tshiphiri]].",
  },
  nr: {
    title: "Sula i-akhawunti yakho",
    intro: "Ikhasi leli lihlathulula indlela yokusula i-akhawunti yakho ye-**Gadit** kanye nedatha ehlobene nayo. I-Gadit iphathwa yi-**Lavi Learning and Training Technologies LLC**.",
    inAppH: "Sula i-akhawunti yakho ngaphakathi kwe-app",
    steps: [
      "Vula i-Gadit bese uyangena.",
      "Iya ku-**I-akhawunti** (thinta iphrofayili yakho, bese uthinta **I-akhawunti**).",
      "Skrolela ku-**Sula i-akhawunti**.",
      "Qinisekisa ngokutlola ikheli lakho le-imeyili, bese uthinta **Sula i-akhawunti**.",
    ],
    immediate: "Ukusula kwenzeka khonokho begodu kungunaphakade. I-akhawunti yakho iyasuswa begodu uzokuphuma kiwo woke amadivayisi.",
    cantH: "Nawungakghoni ukungena",
    cantP: "Thumela i-imeyili ku-{email} usebenzisa ikheli elise-akhawuntini yakho bese ubawa bona siyisule. Sizokuqinisekisa isibawo sakho bese sisula i-akhawunti ngaphakathi kwamalanga ama-30.",
    deletedH: "Okusulwako",
    deleted: [
      "I-akhawunti yakho nemininingwana yokungena (i-imeyili / ukungena nge-Google).",
      "Iphrofayili yakho nanyana ngimaphi amaphrofayili wamalunga womndeni owawenzileko.",
      "Amezwi owabulungileko (ibhuku lamezwi) nomlando wakutjhanje wokufuna.",
      "Iinthombe ezenzelwe i-akhawunti yakho nalokho okukhethako ku-app.",
    ],
    keptH: "Okugcinwako, nesikhathi esingangani",
    kept: [
      "Amarekhodi wokubhadela newerhelo atlhogwa mthetho (kanengi bekube miminyaka eli-7). Iimbhadelo ziphathwa yi-Stripe; asiyigcini inomboro yekarada yakho.",
      "Iimbalo ezihlanganisiweko ezingatjengisi umuntu, ezingasahlobani nawe (zigcinwa mhlinzeki wethu weembalo, kanengi bekube ziinyanga ezili-13).",
    ],
    more: "Bona uthole imininingwana eminengi ngalokho esikubuthelelako nokobana kubayini, qala [[Umthethomgomo wethu Wefihlo]].",
  },
  vi: {
    title: "Xóa tài khoản của bạn",
    intro: "Trang này hướng dẫn cách xóa tài khoản **Gadit** của bạn và dữ liệu liên quan. Gadit được vận hành bởi **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Xóa tài khoản ngay trong ứng dụng",
    steps: [
      "Mở Gadit và đăng nhập.",
      "Vào **Tài khoản** (chạm vào hồ sơ của bạn, rồi chạm **Tài khoản**).",
      "Cuộn xuống **Xóa tài khoản**.",
      "Xác nhận bằng cách nhập địa chỉ email của bạn, rồi chạm **Xóa tài khoản**.",
    ],
    immediate: "Việc xóa diễn ra ngay lập tức và vĩnh viễn. Tài khoản của bạn bị xóa và bạn sẽ bị đăng xuất trên mọi thiết bị.",
    cantH: "Nếu bạn không đăng nhập được",
    cantP: "Gửi email đến {email} từ địa chỉ email của tài khoản và yêu cầu chúng tôi xóa tài khoản. Chúng tôi sẽ xác minh yêu cầu và xóa tài khoản trong vòng 30 ngày.",
    deletedH: "Những gì bị xóa",
    deleted: [
      "Tài khoản và thông tin đăng nhập của bạn (email / đăng nhập bằng Google).",
      "Hồ sơ của bạn và mọi hồ sơ thành viên gia đình bạn đã tạo.",
      "Các từ bạn đã lưu (sổ tay) và lịch sử tìm kiếm gần đây.",
      "Hình ảnh được tạo cho tài khoản của bạn và các tùy chọn trong ứng dụng.",
    ],
    keptH: "Những gì được giữ lại, và trong bao lâu",
    kept: [
      "Hồ sơ thanh toán và thuế theo yêu cầu của pháp luật (thường tối đa 7 năm). Việc thanh toán do Stripe xử lý; chúng tôi không lưu số thẻ của bạn.",
      "Số liệu phân tích tổng hợp đã ẩn danh và không còn gắn với bạn (do nhà cung cấp dịch vụ phân tích của chúng tôi lưu giữ, thường tối đa 13 tháng).",
    ],
    more: "Để biết thêm chi tiết về dữ liệu chúng tôi thu thập và lý do, hãy xem [[Chính sách quyền riêng tư]] của chúng tôi.",
  },
  fil: {
    title: "Burahin ang iyong account",
    intro: "Ipinapaliwanag ng pahinang ito kung paano burahin ang iyong **Gadit** account at ang datos na kaugnay nito. Ang Gadit ay pinapatakbo ng **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Burahin ang account mula sa loob ng app",
    steps: [
      "Buksan ang Gadit at mag-sign in.",
      "Pumunta sa **Account** (i-tap ang iyong profile, saka ang **Account**).",
      "Mag-scroll papunta sa **Burahin ang account**.",
      "Kumpirmahin sa pag-type ng iyong email address, saka i-tap ang **Burahin ang account**.",
    ],
    immediate: "Agad at permanente ang pagbura. Matatanggal ang iyong account at masa-sign out ka sa lahat ng device.",
    cantH: "Kung hindi ka makapag-sign in",
    cantP: "Mag-email sa {email} mula sa address na nakarehistro sa iyong account at hilingin na burahin namin ito. Beberipikahin namin ang iyong kahilingan at buburahin ang account sa loob ng 30 araw.",
    deletedH: "Ano ang binubura",
    deleted: [
      "Ang iyong account at mga detalye sa pag-login (email / pag-sign in gamit ang Google).",
      "Ang iyong profile at lahat ng profile ng miyembro ng pamilya na ginawa mo.",
      "Ang mga salitang na-save mo (kwaderno) at ang kamakailang kasaysayan ng paghahanap.",
      "Ang mga larawang ginawa para sa iyong account at ang iyong mga kagustuhan sa app.",
    ],
    keptH: "Ano ang itinatago, at gaano katagal",
    kept: [
      "Mga rekord ng billing at buwis na hinihingi ng batas (karaniwang hanggang 7 taon). Ang Stripe ang humahawak sa mga bayad; hindi namin itinatago ang numero ng iyong card.",
      "Pinagsama-sama at anonimong analytics na hindi na naka-ugnay sa iyo (itinatago ng aming analytics provider, karaniwang hanggang 13 buwan).",
    ],
    more: "Para sa higit pang detalye tungkol sa kung ano ang kinokolekta namin at bakit, tingnan ang aming [[Patakaran sa Privacy]].",
  },
  af: {
    title: "Skrap jou rekening",
    intro: "Hierdie bladsy verduidelik hoe om jou **Gadit**-rekening en die data wat daaraan gekoppel is, te skrap. Gadit word bedryf deur **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Skrap jou rekening in die app",
    steps: [
      "Maak Gadit oop en meld aan.",
      "Gaan na **Rekening** (tik op jou profiel en dan op **Rekening**).",
      "Rol af na **Skrap rekening**.",
      "Bevestig deur jou e-posadres in te tik en tik dan op **Skrap rekening**.",
    ],
    immediate: "Die skrapping is onmiddellik en permanent. Jou rekening word verwyder en jy word op elke toestel afgemeld.",
    cantH: "As jy nie kan aanmeld nie",
    cantP: "Stuur 'n e-pos na {email} vanaf die adres op jou rekening en vra ons om dit te skrap. Ons sal jou versoek bevestig en die rekening binne 30 dae skrap.",
    deletedH: "Wat geskrap word",
    deleted: [
      "Jou rekening en aanmeldbesonderhede (e-pos / aanmelding met Google).",
      "Jou profiel en enige gesinslidprofiele wat jy geskep het.",
      "Jou gestoorde woorde (boekie) en onlangse soekgeskiedenis.",
      "Prente wat vir jou rekening geskep is en jou voorkeure in die app.",
    ],
    keptH: "Wat bewaar word, en vir hoe lank",
    kept: [
      "Faktuur- en belastingrekords wat die wet vereis (gewoonlik tot 7 jaar). Betalings word deur Stripe hanteer; ons stoor nie jou kaartnommer nie.",
      "Geanonimiseerde, saamgevoegde ontledings wat nie meer aan jou gekoppel is nie (bewaar deur ons ontledingsverskaffer, gewoonlik tot 13 maande).",
    ],
    more: "Vir meer besonderhede oor wat ons insamel en hoekom, sien ons [[Privaatheidsbeleid]].",
  },
  sw: {
    title: "Futa akaunti yako",
    intro: "Ukurasa huu unaeleza jinsi ya kufuta akaunti yako ya **Gadit** na data inayohusiana nayo. Gadit inaendeshwa na **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Futa akaunti yako ukiwa ndani ya programu",
    steps: [
      "Fungua Gadit na uingie.",
      "Nenda kwenye **Akaunti** (gusa wasifu wako, kisha **Akaunti**).",
      "Sogeza chini hadi **Futa akaunti**.",
      "Thibitisha kwa kuandika anwani yako ya barua pepe, kisha gusa **Futa akaunti**.",
    ],
    immediate: "Ufutaji hufanyika mara moja na ni wa kudumu. Akaunti yako huondolewa na utaondolewa kwenye kila kifaa.",
    cantH: "Ikiwa huwezi kuingia",
    cantP: "Tuma barua pepe kwa {email} kutoka kwenye anwani iliyo kwenye akaunti yako na utuombe tuifute. Tutathibitisha ombi lako na kufuta akaunti ndani ya siku 30.",
    deletedH: "Kinachofutwa",
    deleted: [
      "Akaunti yako na taarifa za kuingia (barua pepe / kuingia kwa Google).",
      "Wasifu wako na wasifu wowote wa wanafamilia uliouunda.",
      "Maneno uliyohifadhi (daftari) na historia ya utafutaji ya hivi karibuni.",
      "Picha zilizotengenezwa kwa ajili ya akaunti yako na mapendeleo yako ndani ya programu.",
    ],
    keptH: "Kinachohifadhiwa, na kwa muda gani",
    kept: [
      "Rekodi za malipo na kodi zinazotakiwa na sheria (kwa kawaida hadi miaka 7). Malipo hushughulikiwa na Stripe; hatuhifadhi namba ya kadi yako.",
      "Takwimu za jumla zisizo na utambulisho ambazo hazihusishwi nawe tena (huhifadhiwa na mtoa huduma wetu wa takwimu, kwa kawaida hadi miezi 13).",
    ],
    more: "Kwa maelezo zaidi kuhusu tunachokusanya na kwa nini, angalia [[Sera yetu ya Faragha]].",
  },
  "zh-CN": {
    title: "删除你的账户",
    intro: "本页说明如何删除你的 **Gadit** 账户及相关数据。Gadit 由 **Lavi Learning and Training Technologies LLC** 运营。",
    inAppH: "在应用内删除账户",
    steps: [
      "打开 Gadit 并登录。",
      "进入 **账户** (点按你的个人资料，再点按 **账户**)。",
      "向下滚动到 **删除账户**。",
      "输入你的电子邮件地址进行确认，然后点按 **删除账户**。",
    ],
    immediate: "删除会立即生效且无法恢复。你的账户将被移除，所有设备都会退出登录。",
    cantH: "如果你无法登录",
    cantP: "请用账户绑定的邮箱发送邮件至 {email}，申请删除账户。我们核实请求后，会在 30 天内删除该账户。",
    deletedH: "会删除哪些内容",
    deleted: [
      "你的账户和登录凭据 (电子邮件 / Google 登录)。",
      "你的个人资料以及你创建的所有家庭成员资料。",
      "你保存的词语 (生词本) 和最近的搜索记录。",
      "为你的账户生成的图片以及你在应用内的偏好设置。",
    ],
    keptH: "会保留哪些内容，保留多久",
    kept: [
      "法律要求保留的账单和税务记录 (通常最长 7 年)。付款由 Stripe 处理，我们不会存储你的卡号。",
      "已匿名化、不再与你关联的汇总分析数据 (由我们的分析服务商保留，通常最长 13 个月)。",
    ],
    more: "想进一步了解我们收集哪些信息及原因，请查看我们的[[隐私政策]]。",
  },
  "zh-TW": {
    title: "刪除你的帳戶",
    intro: "本頁說明如何刪除你的 **Gadit** 帳戶及相關資料。Gadit 由 **Lavi Learning and Training Technologies LLC** 營運。",
    inAppH: "在應用程式內刪除帳戶",
    steps: [
      "開啟 Gadit 並登入。",
      "前往 **帳戶** (點按你的個人檔案，再點按 **帳戶**)。",
      "向下捲動到 **刪除帳戶**。",
      "輸入你的電子郵件地址進行確認，然後點按 **刪除帳戶**。",
    ],
    immediate: "刪除會立即生效且無法復原。你的帳戶將被移除，所有裝置都會登出。",
    cantH: "如果你無法登入",
    cantP: "請用帳戶綁定的電子郵件地址寄信至 {email}，申請刪除帳戶。我們確認申請後，會在 30 天內刪除該帳戶。",
    deletedH: "會刪除哪些內容",
    deleted: [
      "你的帳戶和登入憑證 (電子郵件 / Google 登入)。",
      "你的個人檔案以及你建立的所有家庭成員檔案。",
      "你儲存的詞語 (生詞本) 和最近的搜尋紀錄。",
      "為你的帳戶產生的圖片以及你在應用程式內的偏好設定。",
    ],
    keptH: "會保留哪些內容，保留多久",
    kept: [
      "法律要求保留的帳單和稅務紀錄 (通常最長 7 年)。付款由 Stripe 處理，我們不會儲存你的卡號。",
      "已匿名化、不再與你連結的彙總分析資料 (由我們的分析服務供應商保留，通常最長 13 個月)。",
    ],
    more: "想進一步了解我們蒐集哪些資訊及原因，請參閱我們的[[隱私權政策]]。",
  },
  ko: {
    title: "계정 삭제",
    intro: "이 페이지에서는 **Gadit** 계정과 관련 데이터를 삭제하는 방법을 안내합니다. Gadit은 **Lavi Learning and Training Technologies LLC**가 운영합니다.",
    inAppH: "앱에서 계정 삭제하기",
    steps: [
      "Gadit을 열고 로그인하세요.",
      "**계정**으로 이동하세요 (프로필을 탭한 다음 **계정**을 탭).",
      "**계정 삭제**까지 스크롤하세요.",
      "이메일 주소를 입력해 확인한 다음 **계정 삭제**를 탭하세요.",
    ],
    immediate: "삭제는 즉시 이루어지며 되돌릴 수 없습니다. 계정이 삭제되고 모든 기기에서 로그아웃됩니다.",
    cantH: "로그인할 수 없는 경우",
    cantP: "계정에 등록된 이메일 주소로 {email}에 메일을 보내 삭제를 요청하세요. 요청을 확인한 뒤 30일 이내에 계정을 삭제합니다.",
    deletedH: "삭제되는 항목",
    deleted: [
      "계정과 로그인 정보 (이메일 / Google 로그인).",
      "내 프로필과 직접 만든 모든 가족 구성원 프로필.",
      "저장한 단어 (단어장)와 최근 검색 기록.",
      "계정용으로 생성된 이미지와 앱 내 설정.",
    ],
    keptH: "보관되는 항목과 보관 기간",
    kept: [
      "법에 따라 보관해야 하는 결제 및 세금 기록 (보통 최대 7년). 결제는 Stripe가 처리하며, 저희는 카드 번호를 저장하지 않습니다.",
      "더 이상 사용자와 연결되지 않는 익명화된 통계 데이터 (분석 서비스 제공업체가 보관하며, 보통 최대 13개월).",
    ],
    more: "어떤 정보를 왜 수집하는지 자세히 알아보려면 [[개인정보 처리방침]]을 확인하세요.",
  },
  th: {
    title: "ลบบัญชีของคุณ",
    intro: "หน้านี้อธิบายวิธีลบบัญชี **Gadit** ของคุณและข้อมูลที่เกี่ยวข้อง Gadit ดำเนินการโดย **Lavi Learning and Training Technologies LLC**",
    inAppH: "ลบบัญชีจากในแอป",
    steps: [
      "เปิด Gadit แล้วลงชื่อเข้าใช้",
      "ไปที่ **บัญชี** (แตะโปรไฟล์ของคุณ แล้วแตะ **บัญชี**)",
      "เลื่อนลงไปที่ **ลบบัญชี**",
      "ยืนยันโดยพิมพ์อีเมลของคุณ แล้วแตะ **ลบบัญชี**",
    ],
    immediate: "การลบจะมีผลทันทีและถาวร บัญชีของคุณจะถูกลบ และคุณจะออกจากระบบในทุกอุปกรณ์",
    cantH: "หากคุณลงชื่อเข้าใช้ไม่ได้",
    cantP: "ส่งอีเมลถึง {email} จากอีเมลที่ใช้กับบัญชีของคุณ และขอให้เราลบบัญชี เราจะตรวจสอบคำขอและลบบัญชีภายใน 30 วัน",
    deletedH: "ข้อมูลที่ถูกลบ",
    deleted: [
      "บัญชีและข้อมูลสำหรับเข้าสู่ระบบของคุณ (อีเมล / การลงชื่อเข้าใช้ด้วย Google)",
      "โปรไฟล์ของคุณและโปรไฟล์สมาชิกครอบครัวทั้งหมดที่คุณสร้าง",
      "คำที่คุณบันทึกไว้ (สมุด) และประวัติการค้นหาล่าสุด",
      "รูปภาพที่สร้างขึ้นสำหรับบัญชีของคุณและการตั้งค่าในแอป",
    ],
    keptH: "ข้อมูลที่เก็บไว้ และนานเท่าใด",
    kept: [
      "บันทึกการเรียกเก็บเงินและภาษีที่กฎหมายกำหนด (โดยทั่วไปไม่เกิน 7 ปี) การชำระเงินดำเนินการโดย Stripe เราไม่เก็บหมายเลขบัตรของคุณ",
      "ข้อมูลสถิติรวมแบบไม่ระบุตัวตนที่ไม่เชื่อมโยงกับคุณอีกต่อไป (เก็บไว้โดยผู้ให้บริการวิเคราะห์ของเรา โดยทั่วไปไม่เกิน 13 เดือน)",
    ],
    more: "ดูรายละเอียดเพิ่มเติมว่าเราเก็บข้อมูลอะไรและเพราะอะไร ได้ที่[[นโยบายความเป็นส่วนตัว]]ของเรา",
  },
  bn: {
    title: "আপনার অ্যাকাউন্ট মুছুন",
    intro: "এই পাতায় বলা আছে কীভাবে আপনার **Gadit** অ্যাকাউন্ট এবং এর সঙ্গে যুক্ত ডেটা মুছবেন। Gadit পরিচালনা করে **Lavi Learning and Training Technologies LLC**।",
    inAppH: "অ্যাপের ভেতর থেকে অ্যাকাউন্ট মুছুন",
    steps: [
      "Gadit খুলুন এবং সাইন ইন করুন।",
      "**অ্যাকাউন্ট**-এ যান (আপনার প্রোফাইলে ট্যাপ করুন, তারপর **অ্যাকাউন্ট**-এ)।",
      "স্ক্রল করে **অ্যাকাউন্ট মুছুন**-এ যান।",
      "আপনার ইমেল ঠিকানা লিখে নিশ্চিত করুন, তারপর **অ্যাকাউন্ট মুছুন**-এ ট্যাপ করুন।",
    ],
    immediate: "মুছে ফেলা সঙ্গে সঙ্গে হয় এবং স্থায়ী। আপনার অ্যাকাউন্ট সরিয়ে দেওয়া হয় এবং সব ডিভাইস থেকে আপনি সাইন আউট হয়ে যাবেন।",
    cantH: "যদি সাইন ইন করতে না পারেন",
    cantP: "আপনার অ্যাকাউন্টের ইমেল ঠিকানা থেকে {email}-এ ইমেল করে অ্যাকাউন্টটি মুছে দিতে বলুন। আমরা আপনার অনুরোধ যাচাই করে 30 দিনের মধ্যে অ্যাকাউন্টটি মুছে দেব।",
    deletedH: "কী মুছে ফেলা হয়",
    deleted: [
      "আপনার অ্যাকাউন্ট এবং লগইনের তথ্য (ইমেল / Google দিয়ে সাইন ইন)।",
      "আপনার প্রোফাইল এবং আপনার তৈরি পরিবারের সদস্যদের সব প্রোফাইল।",
      "আপনার সংরক্ষিত শব্দ (নোটবুক) এবং সাম্প্রতিক খোঁজার ইতিহাস।",
      "আপনার অ্যাকাউন্টের জন্য তৈরি ছবি এবং অ্যাপে আপনার পছন্দের সেটিংস।",
    ],
    keptH: "কী রাখা হয়, এবং কতদিন",
    kept: [
      "আইন অনুযায়ী প্রয়োজনীয় বিলিং ও কর সংক্রান্ত রেকর্ড (সাধারণত 7 বছর পর্যন্ত)। পেমেন্ট পরিচালনা করে Stripe; আমরা আপনার কার্ড নম্বর রাখি না।",
      "বেনামি, সমষ্টিগত বিশ্লেষণ ডেটা যা আর আপনার সঙ্গে যুক্ত নয় (আমাদের অ্যানালিটিক্স প্রদানকারী রাখে, সাধারণত 13 মাস পর্যন্ত)।",
    ],
    more: "আমরা কী সংগ্রহ করি এবং কেন, তা বিস্তারিত জানতে আমাদের [[গোপনীয়তা নীতি]] দেখুন।",
  },
  da: {
    title: "Slet din konto",
    intro: "Denne side forklarer, hvordan du sletter din **Gadit**-konto og de data, der hører til den. Gadit drives af **Lavi Learning and Training Technologies LLC**.",
    inAppH: "Slet din konto inde i appen",
    steps: [
      "Åbn Gadit, og log ind.",
      "Gå til **Konto** (tryk på din profil og derefter på **Konto**).",
      "Rul ned til **Slet konto**.",
      "Bekræft ved at skrive din e-mailadresse, og tryk derefter på **Slet konto**.",
    ],
    immediate: "Sletningen sker med det samme og er permanent. Din konto fjernes, og du bliver logget ud på alle enheder.",
    cantH: "Hvis du ikke kan logge ind",
    cantP: "Skriv til {email} fra den adresse, der står på din konto, og bed os om at slette den. Vi bekræfter din anmodning og sletter kontoen inden for 30 dage.",
    deletedH: "Hvad der slettes",
    deleted: [
      "Din konto og dine loginoplysninger (e-mail / login med Google).",
      "Din profil og alle profiler for familiemedlemmer, som du har oprettet.",
      "Dine gemte ord (notesbog) og din seneste søgehistorik.",
      "Billeder, der er lavet til din konto, og dine indstillinger i appen.",
    ],
    keptH: "Hvad der gemmes, og hvor længe",
    kept: [
      "Fakturerings- og skatteoplysninger, som loven kræver (typisk op til 7 år). Betalinger håndteres af Stripe; vi gemmer ikke dit kortnummer.",
      "Anonymiserede, samlede statistikker, som ikke længere er knyttet til dig (opbevares af vores analyseudbyder, typisk op til 13 måneder).",
    ],
    more: "Du kan læse mere om, hvad vi indsamler og hvorfor, i vores [[privatlivspolitik]].",
  },
  hu: {
    title: "Fiók törlése",
    intro: "Ezen az oldalon megtudhatod, hogyan törölheted a **Gadit**-fiókodat és a hozzá tartozó adatokat. A Gaditet a **Lavi Learning and Training Technologies LLC** üzemelteti.",
    inAppH: "Fiók törlése az alkalmazásban",
    steps: [
      "Nyisd meg a Gaditet, és jelentkezz be.",
      "Lépj a **Fiók** részre (koppints a profilodra, majd a **Fiók** lehetőségre).",
      "Görgess le a **Fiók törlése** pontig.",
      "Erősítsd meg az e-mail-címed beírásával, majd koppints a **Fiók törlése** gombra.",
    ],
    immediate: "A törlés azonnali és végleges. A fiókod megszűnik, és minden eszközön kijelentkezel.",
    cantH: "Ha nem tudsz bejelentkezni",
    cantP: "Írj a {email} címre a fiókodhoz tartozó e-mail-címről, és kérd a fiók törlését. Ellenőrizzük a kérést, és 30 napon belül töröljük a fiókot.",
    deletedH: "Mi törlődik",
    deleted: [
      "A fiókod és a bejelentkezési adataid (e-mail / Google-bejelentkezés).",
      "A profilod és az általad létrehozott összes családtagprofil.",
      "A mentett szavaid (füzet) és a legutóbbi keresési előzményeid.",
      "A fiókodhoz készített képek és az alkalmazáson belüli beállításaid.",
    ],
    keptH: "Mi marad meg, és meddig",
    kept: [
      "A törvény által előírt számlázási és adózási nyilvántartások (általában legfeljebb 7 évig). A fizetéseket a Stripe kezeli; a kártyaszámodat nem tároljuk.",
      "Anonimizált, összesített statisztikák, amelyek már nem kapcsolódnak hozzád (az elemzési szolgáltatónk őrzi őket, általában legfeljebb 13 hónapig).",
    ],
    more: "Arról, hogy mit és miért gyűjtünk, az [[Adatvédelmi irányelveinkben]] olvashatsz bővebben.",
  },
};

/** Renders the inline markers of a DELETE_COPY string. */
function rich(s: string): ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*|\{email\}|\[\[[^\]]+\]\])/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part === "{email}") return <a key={i} href="mailto:support@gadit.app">support@gadit.app</a>;
    if (part.startsWith("[[") && part.endsWith("]]")) return <a key={i} href="/privacy">{part.slice(2, -2)}</a>;
    return part;
  });
}

const TranslatedBody = ({ c }: { c: DeleteCopy }) => (
  <>
    <p>{rich(c.intro)}</p>
    <h2>{c.inAppH}</h2>
    <ol>
      {c.steps.map((s, i) => <li key={i}>{rich(s)}</li>)}
    </ol>
    <p>{rich(c.immediate)}</p>
    <h2>{c.cantH}</h2>
    <p>{rich(c.cantP)}</p>
    <h2>{c.deletedH}</h2>
    <ul>
      {c.deleted.map((s, i) => <li key={i}>{rich(s)}</li>)}
    </ul>
    <h2>{c.keptH}</h2>
    <ul>
      {c.kept.map((s, i) => <li key={i}>{rich(s)}</li>)}
    </ul>
    <p>{rich(c.more)}</p>
  </>
);

export default function DeleteAccountPage() {
  const locales: Partial<Record<Lang, { title: string; body: ReactNode }>> = {
    en: { title: "Delete your account", body: <EnglishBody /> },
    he: { title: "מחיקת החשבון", body: <HebrewBody /> },
  };
  for (const [code, c] of Object.entries(DELETE_COPY) as Array<[Lang, DeleteCopy]>) {
    locales[code] = { title: c.title, body: <TranslatedBody c={c} /> };
  }
  return <LegalPage lastUpdated={LAST_UPDATED} locales={locales} />;
}

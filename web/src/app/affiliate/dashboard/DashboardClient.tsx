"use client";

/**
 * /affiliate/dashboard — embedded Affonso partner dashboard.
 *
 * The page exists so signed-in Gadit users never have to leave the
 * domain to see their referral stats. We fetch a short-lived embed
 * token from /api/affiliate/embed-token (server-side, using the
 * private AFFONSO_API_KEY), then drop the token into the Affonso
 * iframe. The iframe handles everything else — referral link, QR
 * code, stats, payouts, settings.
 *
 * Language mapping: Affonso supports 16 UI languages including Hebrew
 * and Czech (added 2026-06-13). Slovak is still missing; sk users
 * fall back to English so the iframe still renders something sane.
 *
 * Auth gate: anonymous → prompt login. Plan gate: only Clear / Deep
 * subscribers can be partners. The trust rule is that you can't
 * credibly recommend a product you didn't pay for yourself, so Basic
 * users see an upgrade card instead of the embedded dashboard. The
 * server enforces this too — /api/affiliate/embed-token returns 403
 * with error="requires_subscription" for Basic users so the gate
 * can't be bypassed by hitting the API directly.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { useHref } from "@/lib/href";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { WbUserMenu } from "@/components/design/WbUserMenu";

// Languages Affonso's embedded dashboard supports. Hebrew and Czech
// went live 2026-06-13. Slovak is still missing — falls back to English.
const AFFONSO_LANGS = new Set([
  "en", "de", "fr", "es", "it", "pt", "nl", "pl", "tr", "ja", "zh", "ko", "ru", "ar",
  "he", "cs",
]);

// Localized strings — inline so this single page doesn't add 9 entries
// to i18n-v2 for what amounts to a loading state and an error message.
type Lang = "he" | "en" | "ar" | "ru" | "es" | "pt" | "fr" | "de" | "cs" | "sk" | "it" | "ja";
const COPY: Record<Lang, {
  title: string;
  loadingTitle: string;
  loadingHint: string;
  notConfiguredTitle: string;
  notConfiguredBody: string;
  errorTitle: string;
  errorBody: string;
  signInTitle: string;
  signInBody: string;
  marketingLink: string;
  upgradeTitle: string;
  upgradeBody: string;
  upgradeCta: string;
  // Guided message above the embedded dashboard, framing the
  // one-time external-feeling step (Affonso's payout-method banner) as
  // a final native-feeling onboarding step. Dismissible.
  payoutGuideTitle: string;
  payoutGuideBody: string;
  payoutGuideDismiss: string;
}> = {
  he: {
    title: "הדשבורד שלי",
    loadingTitle: "טוען את הדשבורד שלך…",
    loadingHint: "זה לוקח כמה שניות בפעם הראשונה.",
    notConfiguredTitle: "הדשבורד עוד לא הופעל",
    notConfiguredBody:
      "אנחנו עדיין מסיימים להגדיר את האינטגרציה. בינתיים תוכל לגשת לדשבורד שלך ישירות בפורטל החיצוני.",
    errorTitle: "משהו השתבש",
    errorBody:
      "לא הצלחנו לטעון את הדשבורד שלך. נסה לרענן את הדף, ואם הבעיה ממשיכה — תיכנס לפורטל החיצוני.",
    signInTitle: "הדשבורד שמור לשותפים מחוברים",
    signInBody: "תתחבר עם החשבון שלך כדי לראות את הקישור האישי, הסטטיסטיקות והעמלות שלך.",
    marketingLink: "מה זאת התוכנית?",
    upgradeTitle: "תוכנית השותפים שמורה למנויי Clear ו-Deep",
    upgradeBody:
      "מי שממליץ על Gadit צריך להכיר אותו מבפנים. שדרג ל-Clear או Deep, ותקבל גם מילון מלא בלי הגבלה, וגם גישה לתוכנית השותפים עם 30% עמלה לכל לקוח.",
    upgradeCta: "שדרוג למסלול בתשלום",
    payoutGuideTitle: "צעד אחרון: איך תרצו לקבל תשלום",
    payoutGuideBody: "כדי שנוכל להעביר לכם את העמלות שלכם, יש להגדיר פעם אחת איך תרצו לקבל תשלום. סמנו את האפשרות בבאנר הצהוב למטה. זה לוקח דקה.",
    payoutGuideDismiss: "הבנתי, סגרו",
  },
  en: {
    title: "My Dashboard",
    loadingTitle: "Loading your dashboard…",
    loadingHint: "This takes a few seconds the first time.",
    notConfiguredTitle: "Dashboard not configured yet",
    notConfiguredBody:
      "We're still finishing the integration. In the meantime you can access your dashboard directly in the external portal.",
    errorTitle: "Something went wrong",
    errorBody:
      "We couldn't load your dashboard. Try refreshing the page, or if the problem persists, sign in to the external portal.",
    signInTitle: "Sign in to see your dashboard",
    signInBody:
      "Sign in to your Gadit account to see your personal link, statistics, and commissions.",
    marketingLink: "What is the program?",
    upgradeTitle: "The partner program is for Clear and Deep members",
    upgradeBody:
      "The best recommendations come from real use. Upgrade to Clear or Deep, get the full Gadit experience, and unlock the partner program with 30% commission on every customer you refer.",
    upgradeCta: "Upgrade to a paid plan",
    payoutGuideTitle: "One last step: how you'd like to be paid",
    payoutGuideBody: "Before we can send you your commissions, choose your payout method once. You'll see the option in the yellow banner inside your dashboard below. Takes about a minute.",
    payoutGuideDismiss: "Got it",
  },
  ar: {
    title: "لوحة التحكم الخاصة بي",
    loadingTitle: "جارٍ تحميل لوحة التحكم…",
    loadingHint: "تستغرق بضع ثوانٍ في المرة الأولى.",
    notConfiguredTitle: "لوحة التحكم غير مهيأة بعد",
    notConfiguredBody:
      "ما زلنا ننهي إعداد التكامل. يمكنك في هذه الأثناء الوصول إلى لوحة التحكم من البوابة الخارجية.",
    errorTitle: "حدث خطأ",
    errorBody:
      "لم نتمكن من تحميل لوحة التحكم. حاول تحديث الصفحة، وإذا استمرت المشكلة، سجّل الدخول إلى البوابة الخارجية.",
    signInTitle: "سجّل الدخول لرؤية لوحة التحكم",
    signInBody: "سجّل الدخول إلى حساب Gadit لرؤية الرابط الشخصي والإحصاءات والعمولات.",
    marketingLink: "ما هو البرنامج؟",
    upgradeTitle: "برنامج الشركاء متاح فقط لأعضاء Clear و Deep",
    upgradeBody:
      "لا يمكنك التوصية بمنتج لا تستخدمه فعلاً. ارتقِ إلى Clear أو Deep — ستحصل على القاموس الكامل بدون قيود وعلى الوصول إلى برنامج الشركاء بعمولة 30% لكل عميل تجلبه.",
    upgradeCta: "الترقية إلى خطة مدفوعة",
    payoutGuideTitle: "خطوة أخيرة: كيف تودّ تلقّي مدفوعاتك",
    payoutGuideBody: "قبل أن نتمكّن من إرسال عمولاتك، اختر طريقة الدفع مرة واحدة. ستراها في الشريط الأصفر داخل لوحتك أدناه. تستغرق دقيقة.",
    payoutGuideDismiss: "فهمت",
  },
  ru: {
    title: "Моя панель",
    loadingTitle: "Загрузка панели…",
    loadingHint: "В первый раз это занимает несколько секунд.",
    notConfiguredTitle: "Панель ещё не настроена",
    notConfiguredBody:
      "Мы дорабатываем интеграцию. А пока вы можете открыть панель в внешнем портале.",
    errorTitle: "Что-то пошло не так",
    errorBody:
      "Не удалось загрузить панель. Обновите страницу, а если проблема не уйдёт, войдите во внешний портал.",
    signInTitle: "Войдите, чтобы увидеть панель",
    signInBody:
      "Войдите в аккаунт Gadit, чтобы увидеть свою ссылку, статистику и комиссии.",
    marketingLink: "Что за программа?",
    upgradeTitle: "Партнёрская программа доступна только участникам Clear и Deep",
    upgradeBody:
      "Нельзя честно рекомендовать продукт, которым сам не пользуешься. Перейдите на Clear или Deep — вы получите полный словарь Gadit без ограничений и доступ к партнёрской программе с 30% комиссии с каждого приведённого клиента.",
    upgradeCta: "Перейти на платный тариф",
    payoutGuideTitle: "Последний шаг: как вы хотите получать оплату",
    payoutGuideBody: "Чтобы мы могли отправлять вам комиссии, выберите способ выплаты — один раз. Вы увидите его в жёлтой полоске внутри панели ниже. Это займёт минуту.",
    payoutGuideDismiss: "Понял",
  },
  es: {
    title: "Mi panel",
    loadingTitle: "Cargando tu panel…",
    loadingHint: "Tarda unos segundos la primera vez.",
    notConfiguredTitle: "Panel aún no configurado",
    notConfiguredBody:
      "Estamos terminando la integración. Mientras tanto puedes acceder al panel en el portal externo.",
    errorTitle: "Algo salió mal",
    errorBody:
      "No pudimos cargar tu panel. Intenta recargar la página, y si el problema persiste, ingresa al portal externo.",
    signInTitle: "Inicia sesión para ver tu panel",
    signInBody: "Inicia sesión en tu cuenta de Gadit para ver tu enlace, estadísticas y comisiones.",
    marketingLink: "¿Qué es el programa?",
    upgradeTitle: "El programa de socios es solo para miembros Clear y Deep",
    upgradeBody:
      "Solo puedes recomendar un producto que realmente uses. Pásate a Clear o Deep — tendrás el diccionario completo sin límites y acceso al programa de socios con 30% de comisión por cada cliente que traigas.",
    upgradeCta: "Pasar a un plan de pago",
    payoutGuideTitle: "Un último paso: cómo quieres recibir el pago",
    payoutGuideBody: "Para poder enviarte tus comisiones, elige tu método de cobro una vez. Lo verás en la barra amarilla dentro de tu panel abajo. Toma un minuto.",
    payoutGuideDismiss: "Entendido",
  },
  pt: {
    title: "Meu painel",
    loadingTitle: "Carregando seu painel…",
    loadingHint: "Leva alguns segundos na primeira vez.",
    notConfiguredTitle: "Painel ainda não configurado",
    notConfiguredBody:
      "Estamos terminando a integração. Enquanto isso, você pode acessar o painel no portal externo.",
    errorTitle: "Algo deu errado",
    errorBody:
      "Não conseguimos carregar seu painel. Tente recarregar a página, e se o problema continuar, acesse o portal externo.",
    signInTitle: "Entre para ver seu painel",
    signInBody: "Entre na sua conta Gadit para ver seu link, estatísticas e comissões.",
    marketingLink: "O que é o programa?",
    upgradeTitle: "O programa de parceiros é só para membros Clear e Deep",
    upgradeBody:
      "Você só pode recomendar um produto que realmente usa. Faça upgrade para Clear ou Deep — você ganha o dicionário completo sem limites e acesso ao programa de parceiros com 30% de comissão por cada cliente que indicar.",
    upgradeCta: "Fazer upgrade para um plano pago",
    payoutGuideTitle: "Um último passo: como você quer receber",
    payoutGuideBody: "Para podermos enviar suas comissões, escolha seu método de pagamento uma vez. Você verá no aviso amarelo dentro do seu painel abaixo. Leva um minuto.",
    payoutGuideDismiss: "Entendi",
  },
  fr: {
    title: "Mon tableau de bord",
    loadingTitle: "Chargement de votre tableau de bord…",
    loadingHint: "Cela prend quelques secondes la première fois.",
    notConfiguredTitle: "Tableau de bord pas encore configuré",
    notConfiguredBody:
      "Nous terminons l'intégration. En attendant, vous pouvez accéder au tableau de bord depuis le portail externe.",
    errorTitle: "Une erreur s'est produite",
    errorBody:
      "Nous n'avons pas pu charger votre tableau de bord. Essayez d'actualiser la page, et si le problème persiste, connectez-vous au portail externe.",
    signInTitle: "Connectez-vous pour voir votre tableau de bord",
    signInBody: "Connectez-vous à votre compte Gadit pour voir votre lien, vos statistiques et vos commissions.",
    marketingLink: "C'est quoi le programme ?",
    upgradeTitle: "Le programme partenaires est réservé aux membres Clear et Deep",
    upgradeBody:
      "On ne peut recommander qu'un produit qu'on utilise vraiment. Passez à Clear ou Deep — vous obtenez le dictionnaire Gadit complet sans limite et l'accès au programme partenaires avec 30% de commission sur chaque client recommandé.",
    upgradeCta: "Passer à une formule payante",
    payoutGuideTitle: "Une dernière étape : comment être payé",
    payoutGuideBody: "Pour que nous puissions vous envoyer vos commissions, choisissez votre méthode de paiement une seule fois. Vous la verrez dans la barre jaune à l'intérieur de votre tableau de bord ci-dessous. Ça prend une minute.",
    payoutGuideDismiss: "Compris",
  },
  de: {
    title: "Mein Dashboard",
    loadingTitle: "Dashboard wird geladen…",
    loadingHint: "Beim ersten Mal dauert es ein paar Sekunden.",
    notConfiguredTitle: "Dashboard noch nicht konfiguriert",
    notConfiguredBody:
      "Wir schließen die Integration noch ab. Du kannst dein Dashboard inzwischen im externen Portal aufrufen.",
    errorTitle: "Etwas ist schiefgelaufen",
    errorBody:
      "Wir konnten dein Dashboard nicht laden. Versuche die Seite neu zu laden — wenn das Problem bleibt, melde dich im externen Portal an.",
    signInTitle: "Melde dich an, um dein Dashboard zu sehen",
    signInBody: "Melde dich bei deinem Gadit-Konto an, um deinen Link, deine Statistiken und Provisionen zu sehen.",
    marketingLink: "Was ist das Programm?",
    upgradeTitle: "Das Partnerprogramm ist nur für Clear- und Deep-Mitglieder",
    upgradeBody:
      "Du kannst nur ein Produkt empfehlen, das du selbst benutzt. Upgrade auf Clear oder Deep — du bekommst das vollständige Gadit-Wörterbuch ohne Limit plus Zugang zum Partnerprogramm mit 30% Provision pro geworbenem Kunden.",
    upgradeCta: "Auf einen kostenpflichtigen Plan upgraden",
    payoutGuideTitle: "Letzter Schritt: Wie du bezahlt werden möchtest",
    payoutGuideBody: "Damit wir deine Provisionen senden können, wähle einmalig deine Zahlungsmethode. Du siehst sie im gelben Banner in deinem Dashboard unten. Dauert eine Minute.",
    payoutGuideDismiss: "Verstanden",
  },
  cs: {
    title: "Můj přehled",
    loadingTitle: "Načítání přehledu…",
    loadingHint: "Poprvé to trvá pár vteřin.",
    notConfiguredTitle: "Přehled zatím není nastaven",
    notConfiguredBody:
      "Dokončujeme integraci. Mezitím si přehled můžete otevřít v externím portálu.",
    errorTitle: "Něco se pokazilo",
    errorBody:
      "Přehled se nepodařilo načíst. Zkuste stránku obnovit, a pokud problém přetrvá, přihlaste se v externím portálu.",
    signInTitle: "Přihlaste se, abyste viděli přehled",
    signInBody: "Přihlaste se ke svému účtu Gadit a uvidíte svůj odkaz, statistiky a provize.",
    marketingLink: "Co je to za program?",
    upgradeTitle: "Partnerský program je jen pro členy Clear a Deep",
    upgradeBody:
      "Můžete doporučovat jen produkt, který sami používáte. Přejděte na Clear nebo Deep — získáte celý slovník Gadit bez omezení a přístup k partnerskému programu s 30% provizí za každého přivedeného zákazníka.",
    upgradeCta: "Přejít na placený plán",
    payoutGuideTitle: "Poslední krok: jak chceš dostávat platby",
    payoutGuideBody: "Než ti budeme moci posílat provize, vyber si jednou způsob výplaty. Najdeš ho ve žlutém pruhu uvnitř svého přehledu níže. Trvá to minutu.",
    payoutGuideDismiss: "Rozumím",
  },
  sk: {
    title: "Môj prehľad",
    loadingTitle: "Načítavam prehľad…",
    loadingHint: "Prvýkrát to trvá pár sekúnd.",
    notConfiguredTitle: "Prehľad ešte nie je nastavený",
    notConfiguredBody:
      "Dokončujeme integráciu. Medzitým si prehľad môžete otvoriť v externom portáli.",
    errorTitle: "Niečo sa pokazilo",
    errorBody:
      "Prehľad sa nepodarilo načítať. Skúste stránku obnoviť, a ak problém pretrváva, prihláste sa v externom portáli.",
    signInTitle: "Prihláste sa, aby ste videli prehľad",
    signInBody: "Prihláste sa k svojmu účtu Gadit a uvidíte svoj odkaz, štatistiky a provízie.",
    marketingLink: "Čo je to za program?",
    upgradeTitle: "Partnerský program je len pre členov Clear a Deep",
    upgradeBody:
      "Môžete odporúčať len produkt, ktorý sami používate. Prejdite na Clear alebo Deep — získate celý slovník Gadit bez obmedzení a prístup k partnerskému programu s 30% províziou za každého privedeného zákazníka.",
    upgradeCta: "Prejsť na platený plán",
    payoutGuideTitle: "Posledný krok: ako chceš dostávať platby",
    payoutGuideBody: "Skôr ako ti budeme môcť posielať provízie, vyber si jedenkrát spôsob výplaty. Nájdeš ho v žltom pruhu vnútri svojho prehľadu nižšie. Trvá to minútu.",
    payoutGuideDismiss: "Rozumiem",
  },
  it: {
    title: "La mia dashboard",
    loadingTitle: "Caricamento della dashboard…",
    loadingHint: "La prima volta richiede qualche secondo.",
    notConfiguredTitle: "Dashboard non ancora configurata",
    notConfiguredBody:
      "Stiamo finendo l'integrazione. Nel frattempo puoi accedere alla tua dashboard direttamente sul portale esterno.",
    errorTitle: "Qualcosa è andato storto",
    errorBody:
      "Non siamo riusciti a caricare la tua dashboard. Prova a ricaricare la pagina; se il problema persiste, accedi al portale esterno.",
    signInTitle: "Accedi per vedere la tua dashboard",
    signInBody: "Accedi al tuo account Gadit per vedere il tuo link, le statistiche e le commissioni.",
    marketingLink: "Cos'è il programma?",
    upgradeTitle: "Il programma partner è riservato ai membri Clear e Deep",
    upgradeBody:
      "Puoi consigliare solo un prodotto che usi davvero. Passa a Clear o Deep — avrai il dizionario Gadit completo senza limiti e l'accesso al programma partner con il 30% di commissione su ogni cliente che porti.",
    upgradeCta: "Passa a un piano a pagamento",
    payoutGuideTitle: "Un ultimo passo: come vuoi essere pagato",
    payoutGuideBody: "Per poterti inviare le commissioni, scegli una volta il tuo metodo di pagamento. Lo trovi nella barra gialla all'interno della tua dashboard qui sotto. Ci vuole un minuto.",
    payoutGuideDismiss: "Capito",
  },
  ja: {
    title: "マイダッシュボード",
    loadingTitle: "ダッシュボードを読み込んでいます…",
    loadingHint: "初回は数秒かかります。",
    notConfiguredTitle: "ダッシュボードはまだ設定されていません",
    notConfiguredBody:
      "統合作業を仕上げているところです。それまでは外部ポータルから直接ダッシュボードにアクセスできます。",
    errorTitle: "問題が発生しました",
    errorBody:
      "ダッシュボードを読み込めませんでした。ページを更新してみてください。問題が続く場合は外部ポータルからログインしてください。",
    signInTitle: "ダッシュボードを見るにはログインしてください",
    signInBody: "Gaditアカウントにログインして、自分のリンク・統計・コミッションを確認しましょう。",
    marketingLink: "プログラムとは？",
    upgradeTitle: "パートナープログラムはClearとDeepのメンバー限定です",
    upgradeBody:
      "自分が使っていない商品を本気で勧めることはできません。ClearまたはDeepにアップグレードすると、Gaditの完全な辞書が制限なく使えるうえ、紹介した顧客ごとに30%のコミッションが得られるパートナープログラムにも参加できます。",
    upgradeCta: "有料プランにアップグレード",
    payoutGuideTitle: "最後のひとつ：受け取り方の設定",
    payoutGuideBody: "コミッションをお送りするために、お支払い方法を一度だけ選んでください。下のダッシュボード内、黄色いバナーから設定できます。1分ほどで完了します。",
    payoutGuideDismiss: "わかりました",
  },
};

export function DashboardPage() {
  const { user, loading, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const c = COPY[lang as Lang] ?? COPY.en;

  type Stage =
    | { kind: "init" }
    | { kind: "fetching" }
    | { kind: "ready"; token: string }
    | { kind: "not_configured" }
    | { kind: "requires_subscription" }
    | { kind: "error"; message: string };
  const [stage, setStage] = useState<Stage>({ kind: "init" });

  // Affonso lang param. Slovak still falls back to English because
  // Affonso hasn't shipped it yet (Hebrew and Czech went live 2026-06-13).
  const affonsoLang = useMemo(
    () => (AFFONSO_LANGS.has(lang) ? lang : "en"),
    [lang],
  );

  // RTL hint for the embedded iframe. Affonso doesn't document a `dir`
  // URL param yet, but most embeddable widgets honour one when present,
  // and it costs nothing if they don't. Hebrew and Arabic are the only
  // RTL languages we ship. If Affonso ignores this, the proper fix is
  // server-side on their end (set `<html dir="rtl">` when lang=he|ar);
  // tracked in the email thread with Silvestro.
  const affonsoDir = lang === "he" || lang === "ar" ? "rtl" : "ltr";

  // Auth gate — auto-prompt the login modal exactly once per visit
  // when the page loads without a signed-in user. If the visitor
  // dismisses the modal (X / Escape / backdrop click), we DON'T re-open
  // it; instead the page falls through to the "Sign in to see your
  // dashboard" copy below, which gives them a marketing link back to
  // /affiliates and a "Sign in" button they can use whenever they're
  // ready. Without the ref guard, dismissing the modal triggered a
  // re-render that re-ran this effect and reopened it immediately —
  // the dialog looked uncloseable.
  const autoPromptedRef = useRef(false);
  useEffect(() => {
    if (loading) return;
    if (!user && !autoPromptedRef.current) {
      autoPromptedRef.current = true;
      promptLogin(c.title);
    }
  }, [loading, user, c.title, promptLogin]);

  // Token fetch — runs exactly once after auth resolves, never re-runs
  // when stage changes. The previous version had stage.kind in the dep
  // array, which meant React re-ran the effect the moment we flipped
  // from "init" → "fetching", which fired the cleanup from the first
  // run, which set cancelled=true on the original async closure, which
  // made the resolved fetch silently early-out instead of moving stage
  // to "ready" — so the spinner spun forever even though the API had
  // returned a token in <1s. The ref guard replaces the kind-based
  // guard so the effect can safely depend on only loading + user.
  const fetchStartedRef = useRef(false);
  useEffect(() => {
    if (loading || !user) return;
    if (fetchStartedRef.current) return;
    fetchStartedRef.current = true;
    setStage({ kind: "fetching" });
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/affiliate/embed-token", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (res.status === 503) {
          setStage({ kind: "not_configured" });
          return;
        }
        if (res.status === 403) {
          // Basic users hit this — they need to upgrade to Clear or
          // Deep to access the partner program.
          setStage({ kind: "requires_subscription" });
          return;
        }
        if (!res.ok) {
          setStage({ kind: "error", message: `HTTP ${res.status}` });
          return;
        }
        const data = (await res.json()) as { token?: string; error?: string };
        if (!data.token) {
          setStage({ kind: "error", message: data.error ?? "no_token" });
          return;
        }
        setStage({ kind: "ready", token: data.token });
      } catch (err) {
        setStage({ kind: "error", message: String(err) });
      }
    })();
  }, [loading, user]);

  // Payout-method guide above the embed. Affonso ships an in-iframe
  // yellow banner asking partners to set their payout method before we
  // can wire them money; we frame that banner with a branded card in
  // our own chrome so the step feels like part of the Gadit onboarding
  // rather than a foreign call-out. Dismissed state persists in
  // localStorage so it doesn't nag returning visitors. Long-term plan:
  // ask Affonso for a payouts-scoped embed token (or write API), then
  // build a native payout form inside /account and drop this card.
  // Payout guide state removed 2026-06-13 along with the banner render.
  // See the comment in the JSX render for full context. To re-enable,
  // restore both blocks; localStorage key "gadit-affiliate-payout-guide-
  // dismissed" was the dismiss flag.

  // Mobile burger menu mirrors the pattern used in /play, /affiliates,
  // /features. Without it the topbar has zero interactive elements
  // below 720px and the user is stuck.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const { setLang } = useLang();
  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (burgerRef.current?.contains(target)) return;
      setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setMenuOpen(false); }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="wordbook wb-shell-page wb-affdash-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <nav className="wb-shell-nav">
          <Link
            href={href("/")}
            className="wb-shell-navlink wb-shell-navlink-icon"
            aria-label={v2(lang, "navSearch")}
            title={v2(lang, "navSearch")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4-4" />
            </svg>
          </Link>
          <Link href={href("/features")} className="wb-shell-navlink">
            {v2(lang, "navFeatures")}
          </Link>
          <Link href={href("/notebook")} className="wb-shell-navlink">
            {v2(lang, "navNotebook")}
          </Link>
          <Link href={href("/play")} className="wb-shell-navlink">
            {v2(lang, "navPlay")}
          </Link>
          <Link href={href("/pricing")} className="wb-shell-navlink">
            {v2(lang, "navPricing")}
          </Link>
          <Link href={href("/affiliates")} className="wb-shell-navlink">
            {v2(lang, "navAffiliates")}
          </Link>
        </nav>
        <div className="wb-shell-actions">
          <ShareButton
            url="https://www.gadit.app/"
            title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
            text=""
            shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
            copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
          />
          {user ? <WbUserMenu /> : null}
        </div>
        <button
          ref={burgerRef}
          type="button"
          className="wb-shell-burger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
        {menuOpen && (
          <div ref={menuRef} className="wb-shell-mobile-menu" role="menu">
            <Link href={href("/")} className="wb-shell-mobile-link" onClick={() => setMenuOpen(false)}>
              {v2(lang, "navSearch")}
            </Link>
            <Link href={href("/features")} className="wb-shell-mobile-link" onClick={() => setMenuOpen(false)}>
              {v2(lang, "navFeatures")}
            </Link>
            <Link href={href("/pricing")} className="wb-shell-mobile-link" onClick={() => setMenuOpen(false)}>
              {v2(lang, "navPricing")}
            </Link>
            <Link href={href("/affiliates")} className="wb-shell-mobile-link" onClick={() => setMenuOpen(false)}>
              {v2(lang, "navAffiliates")}
            </Link>
          </div>
        )}
      </header>

      <main className="wb-affdash-main">
        {!user && !loading && (
          <div className="wb-affdash-state">
            <h1 className="wb-affdash-state-title">{c.signInTitle}</h1>
            <p className="wb-affdash-state-body">{c.signInBody}</p>
            <button
              type="button"
              onClick={() => promptLogin(c.title)}
              className="wb-affdash-state-cta"
            >
              {v2(lang, "signIn")}
            </button>
            <Link href={href("/affiliates")} className="wb-affdash-state-link">
              {c.marketingLink}
            </Link>
          </div>
        )}

        {user && (stage.kind === "init" || stage.kind === "fetching") && (
          <div className="wb-affdash-state">
            <div className="wb-affdash-spinner" aria-hidden="true" />
            <h1 className="wb-affdash-state-title">{c.loadingTitle}</h1>
            <p className="wb-affdash-state-body">{c.loadingHint}</p>
          </div>
        )}

        {user && stage.kind === "not_configured" && (
          <div className="wb-affdash-state">
            <h1 className="wb-affdash-state-title">{c.notConfiguredTitle}</h1>
            <p className="wb-affdash-state-body">{c.notConfiguredBody}</p>
            <a
              href="https://gaditapp.affonso.io"
              target="_blank"
              rel="noopener noreferrer"
              className="wb-affdash-state-link"
            >
              gaditapp.affonso.io →
            </a>
          </div>
        )}

        {user && stage.kind === "requires_subscription" && (
          <div className="wb-affdash-state">
            <h1 className="wb-affdash-state-title">{c.upgradeTitle}</h1>
            <p className="wb-affdash-state-body">{c.upgradeBody}</p>
            <Link href={href("/pricing")} className="wb-affdash-state-link">
              {c.upgradeCta} →
            </Link>
          </div>
        )}

        {user && stage.kind === "error" && (
          <div className="wb-affdash-state">
            <h1 className="wb-affdash-state-title">{c.errorTitle}</h1>
            <p className="wb-affdash-state-body">{c.errorBody}</p>
            <a
              href="https://gaditapp.affonso.io"
              target="_blank"
              rel="noopener noreferrer"
              className="wb-affdash-state-link"
            >
              gaditapp.affonso.io →
            </a>
          </div>
        )}

        {user && stage.kind === "ready" && (
          <>
            {/* Payout-method guide banner removed 2026-06-13. The copy
                referenced "the yellow banner inside your dashboard
                below", but Affonso doesn't actually render a payout
                banner today — Silvestro confirmed by email the payout-
                method onboarding is still on the roadmap with no ship
                date. Pointing at a banner that doesn't exist confuses
                affiliates more than it helps. The i18n strings
                (payoutGuideTitle/Body/Dismiss) and state hooks are
                intentionally kept so we can re-render this block once
                Affonso ships the feature; copy may need to be revised
                to match whatever they ship. */}
            <iframe
              // padding=false because the wb-affdash-main container
              // already handles spacing; the Affonso embed would
              // double-pad otherwise.
              //
              // First-party delivery: /r/embed/* is proxied to
              // affonso.io/embed/* via next.config.ts rewrites so the
              // iframe loads from a same-origin path that ad blockers
              // and privacy guards don't touch. See layout.tsx pixel
              // tag for the broader rationale.
              src={`/r/embed/referrals?token=${encodeURIComponent(stage.token)}&theme=light&lang=${affonsoLang}&dir=${affonsoDir}&padding=false`}
              className="wb-affdash-iframe"
              allow="clipboard-write"
              title="Affiliate Dashboard"
            />
          </>
        )}
      </main>
    </div>
  );
}

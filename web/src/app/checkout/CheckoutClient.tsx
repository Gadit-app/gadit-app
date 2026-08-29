"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  loadStripe,
  type Stripe as StripeJs,
  type StripeElements,
  type StripeElementLocale,
} from "@stripe/stripe-js";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { isTwa, openInBrowser } from "@/lib/twa";
import { useHref } from "@/lib/href";
import { track } from "@/lib/track";
import {
  SCHOOLS_TIERS,
  schoolsTierForPrice,
  type SchoolsTierKey,
} from "@/lib/schools-prices";

/**
 * In-app checkout with the Stripe Payment Element (Yooniz playbook,
 * ported 2026-07-12). Built for Hebrew (hosted Checkout has no "he"
 * locale) but works in any UI language — the Element itself follows
 * the user's lang.
 *
 * Flow: auth guard → POST /api/subscribe (creates a trialing
 * subscription with default_incomplete) → mount Payment Element with
 * the returned client secret → confirmSetup (trial: first invoice is
 * $0, the card is saved via SetupIntent) or confirmPayment when an
 * amount is due → Stripe redirects to /checkout/done → the webhook's
 * subscription-metadata path provisions the account.
 */

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

// Locales the Payment Element actually supports; anything else falls
// back to Stripe's auto-detection (hi is the only Gadit lang missing).
const STRIPE_ELEMENT_LOCALES = new Set([
  "he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja",
]);

type TierInfo = {
  name: string;
  cycle: "monthly" | "yearly";
  amount: string; // display string, USD
  amountIls: string; // display string, ILS — Hebrew users are billed in shekels
  kind: "clear" | "deep" | "family" | "schools";
  // Set for the new 3-tier Schools prices so counterpartPrice can flip
  // monthly<->yearly within the same student tier (the by-name map can't,
  // since all three tiers display as "Schools").
  schoolsTier?: SchoolsTierKey;
};

// ILS display for the new Schools tiers (Israeli schools normally use the
// ₪ order form on /schools, but keep a shekel figure here so the summary
// never shows a blank if a Hebrew user does reach /checkout). USD is the
// billed currency for these prices.
const SCHOOLS_ILS: Record<SchoolsTierKey, { monthly: string; yearly: string }> = {
  s: { monthly: "₪349", yearly: "₪3,490" },
  m: { monthly: "₪649", yearly: "₪6,490" },
  l: { monthly: "₪949", yearly: "₪9,490" },
};

// Mirrors the display prices in PricingClient — the Payment Element
// shows no order summary of its own, so this card is the only place
// the user sees what they are agreeing to. ILS amounts must match the
// currency_options set on the Stripe prices (2026-07-16); the API
// bills lang==="he" in shekels.
function tierForPrice(priceId: string): TierInfo | null {
  // New 3-tier Schools prices (hardcoded IDs, one source of truth).
  const st = schoolsTierForPrice(priceId);
  if (st) {
    const cycle: "monthly" | "yearly" = priceId === st.yearly ? "yearly" : "monthly";
    return {
      name: "Schools",
      cycle,
      amount: cycle === "yearly" ? st.usdYearly : st.usdMonthly,
      amountIls: cycle === "yearly" ? SCHOOLS_ILS[st.key].yearly : SCHOOLS_ILS[st.key].monthly,
      kind: "schools",
      schoolsTier: st.key,
    };
  }
  const map: Array<[string | undefined, TierInfo]> = [
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_MONTHLY, { name: "Clear", cycle: "monthly", amount: "$2.99", amountIls: "₪9.90", kind: "clear" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_YEARLY, { name: "Clear", cycle: "yearly", amount: "$29.99", amountIls: "₪99", kind: "clear" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_MONTHLY, { name: "Deep", cycle: "monthly", amount: "$4.99", amountIls: "₪16.90", kind: "deep" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_YEARLY, { name: "Deep", cycle: "yearly", amount: "$49.99", amountIls: "₪169", kind: "deep" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_MONTHLY, { name: "Family", cycle: "monthly", amount: "$5.99", amountIls: "₪19.90", kind: "family" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_YEARLY, { name: "Family", cycle: "yearly", amount: "$59", amountIls: "₪199", kind: "family" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_MONTHLY, { name: "Schools", cycle: "monthly", amount: "$69", amountIls: "₪239", kind: "schools" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_YEARLY, { name: "Schools", cycle: "yearly", amount: "$690", amountIls: "₪2,390", kind: "schools" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_LARGE_MONTHLY, { name: "Schools Large", cycle: "monthly", amount: "$149", amountIls: "₪499", kind: "schools" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_LARGE_YEARLY, { name: "Schools Large", cycle: "yearly", amount: "$1,490", amountIls: "₪4,990", kind: "schools" }],
  ];
  for (const [id, info] of map) if (id && id === priceId) return info;
  return null;
}

/** The opposite-cycle price of the same plan (Family monthly <-> Family
 *  yearly), so the checkout can offer a monthly/yearly choice. Matched by
 *  plan NAME so "Schools" and "Schools Large" don't cross. */
function counterpartPrice(current: TierInfo): string | null {
  const target: "monthly" | "yearly" = current.cycle === "monthly" ? "yearly" : "monthly";
  // New Schools tiers flip within their own tier via the shared registry.
  if (current.schoolsTier) {
    const t = SCHOOLS_TIERS[current.schoolsTier];
    return target === "yearly" ? t.yearly : t.monthly;
  }
  const byName: Record<string, { monthly?: string; yearly?: string }> = {
    Clear: { monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_MONTHLY, yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_YEARLY },
    Deep: { monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_MONTHLY, yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_YEARLY },
    Family: { monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_MONTHLY, yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_YEARLY },
    Schools: { monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_MONTHLY, yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_YEARLY },
    "Schools Large": { monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_LARGE_MONTHLY, yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_LARGE_YEARLY },
  };
  return byName[current.name]?.[target] || null;
}

// Local copy, Hebrew first (the page's raison d'être) + English
// fallback for every other lang. Startup voice, no dashes.
const COPY = {
  ar: { title: "خطوة واحدة تفصلك", planLabel: "خطتك", perMonth: "شهريًا", perYear: "سنويًا", monthlyLabel: "شهري", yearlyLabel: "سنوي", cycleQ: "كيف نحاسبك بعد الفترة التجريبية؟", yearlyRibbon: "شهران مجانًا", trialToday: "المستحق اليوم: $0", trialLine: "فترة تجريبية مجانية لمدة 14 يومًا. لا يتم أول خصم إلا عند انتهاء الفترة التجريبية.", afterTrial: "بعد الفترة التجريبية:", cancelNote: "يمكنك الإلغاء في أي وقت من صفحة حسابك بنقرة واحدة.", couponApplied: (code: string) => `تم تطبيق الرمز ${code}. سيُطبّق على أول عملية دفع.`, payButton: "التأكيد وبدء الفترة التجريبية", processing: "لحظة واحدة...", secureNote: "الدفع مؤمّن بواسطة Stripe. نحن لا نحفظ تفاصيل بطاقتك أبدًا.", needAuthTitle: "تحتاج إلى حساب Gadit للمتابعة", needAuthBody: "التسجيل يستغرق نصف دقيقة، ويُحفظ اشتراكك في حسابك.", needAuthCta: "سجّل أو ادخل إلى حسابك", invalidPrice: "لم يتم العثور على الخطة. اختر خطة من صفحة الأسعار.", toPricing: "الذهاب إلى الأسعار", genericError: "حدث خطأ ما. يرجى المحاولة مرة أخرى.", invalidCode: "رمز القسيمة هذا غير صالح. تابع بدونه أو تحقق من طريقة كتابته.", loading: "جارٍ تجهيز النموذج...", promoQ: "هل لديك رمز ترويجي؟", promoPlaceholder: "رمز ترويجي", promoApply: "تطبيق" },
  ru: { title: "Остался один шаг", planLabel: "Ваш план", perMonth: "в месяц", perYear: "в год", monthlyLabel: "Помесячно", yearlyLabel: "Ежегодно", cycleQ: "Как списывать оплату после пробного периода?", yearlyRibbon: "2 месяца бесплатно", trialToday: "К оплате сегодня: $0", trialLine: "14 дней бесплатного пробного периода. Первое списание произойдёт только по его окончании.", afterTrial: "После пробного периода:", cancelNote: "Отмените в любой момент на странице аккаунта, в один клик.", couponApplied: (code: string) => `Код ${code} применён. Он будет учтён при первом списании.`, payButton: "Подтвердить и начать пробный период", processing: "Одну минуту...", secureNote: "Платёж защищён Stripe. Мы никогда не храним данные вашей карты.", needAuthTitle: "Для продолжения нужен аккаунт Gadit", needAuthBody: "Регистрация занимает полминуты, и ваша подписка сохраняется в аккаунте.", needAuthCta: "Зарегистрироваться или войти", invalidPrice: "План не найден. Выберите план на странице тарифов.", toPricing: "Перейти к тарифам", genericError: "Что-то пошло не так. Пожалуйста, попробуйте ещё раз.", invalidCode: "Этот промокод недействителен. Продолжите без него или проверьте написание.", loading: "Готовим форму...", promoQ: "Есть промокод?", promoPlaceholder: "Промокод", promoApply: "Применить" },
  es: { title: "A un paso de empezar", planLabel: "Tu plan", perMonth: "al mes", perYear: "al año", monthlyLabel: "Mensual", yearlyLabel: "Anual", cycleQ: "¿Cómo cobrar después de la prueba?", yearlyRibbon: "2 meses gratis", trialToday: "A pagar hoy: $0", trialLine: "14 días de prueba gratis. El primer cobro llega solo cuando termina la prueba.", afterTrial: "Después de la prueba:", cancelNote: "Cancela cuando quieras desde tu página de cuenta, con un clic.", couponApplied: (code: string) => `Código ${code} aplicado. Se aplicará a tu primer cobro.`, payButton: "Confirmar y empezar la prueba", processing: "Un momento...", secureNote: "Pago protegido por Stripe. Nunca guardamos los datos de tu tarjeta.", needAuthTitle: "Necesitas una cuenta de Gadit para continuar", needAuthBody: "Registrarte lleva medio minuto y tu suscripción queda guardada en tu cuenta.", needAuthCta: "Regístrate o inicia sesión", invalidPrice: "Plan no encontrado. Elige un plan en la página de precios.", toPricing: "Ir a precios", genericError: "Algo salió mal. Inténtalo de nuevo.", invalidCode: "Ese código de cupón no es válido. Continúa sin él o revisa cómo lo escribiste.", loading: "Preparando el formulario...", promoQ: "¿Tienes un código promocional?", promoPlaceholder: "Código promocional", promoApply: "Aplicar" },
  pt: { title: "Falta só um passo", planLabel: "Seu plano", perMonth: "por mês", perYear: "por ano", monthlyLabel: "Mensal", yearlyLabel: "Anual", cycleQ: "Como cobrar após o teste?", yearlyRibbon: "2 meses grátis", trialToday: "A pagar hoje: $0", trialLine: "14 dias de teste grátis. A primeira cobrança acontece só quando o teste termina.", afterTrial: "Após o teste:", cancelNote: "Cancele quando quiser na página da sua conta, com um clique.", couponApplied: (code: string) => `Código ${code} aplicado. Ele valerá na sua primeira cobrança.`, payButton: "Confirmar e começar o teste", processing: "Um momento...", secureNote: "Pagamento protegido pela Stripe. Nunca guardamos os dados do seu cartão.", needAuthTitle: "Você precisa de uma conta Gadit para continuar", needAuthBody: "O cadastro leva meio minuto, e sua assinatura fica salva na sua conta.", needAuthCta: "Cadastre-se ou entre", invalidPrice: "Plano não encontrado. Escolha um plano na página de preços.", toPricing: "Ir para preços", genericError: "Algo deu errado. Tente novamente.", invalidCode: "Esse código de cupom não é válido. Continue sem ele ou confira como escreveu.", loading: "Preparando o formulário...", promoQ: "Tem um código promocional?", promoPlaceholder: "Código promocional", promoApply: "Aplicar" },
  fr: { title: "Plus qu'une étape", planLabel: "Votre offre", perMonth: "par mois", perYear: "par an", monthlyLabel: "Mensuel", yearlyLabel: "Annuel", cycleQ: "Comment facturer après l'essai ?", yearlyRibbon: "2 mois offerts", trialToday: "À payer aujourd'hui : $0", trialLine: "14 jours d'essai gratuit. Le premier paiement n'intervient qu'à la fin de l'essai.", afterTrial: "Après l'essai :", cancelNote: "Annulez à tout moment depuis votre page de compte, en un clic.", couponApplied: (code: string) => `Code ${code} appliqué. Il s'appliquera à votre premier paiement.`, payButton: "Confirmer et démarrer l'essai", processing: "Un instant...", secureNote: "Paiement sécurisé par Stripe. Nous ne conservons jamais les données de votre carte.", needAuthTitle: "Il vous faut un compte Gadit pour continuer", needAuthBody: "L'inscription prend une demi-minute, et votre abonnement est enregistré sur votre compte.", needAuthCta: "Créer un compte ou se connecter", invalidPrice: "Offre introuvable. Choisissez une offre sur la page des tarifs.", toPricing: "Voir les tarifs", genericError: "Une erreur est survenue. Veuillez réessayer.", invalidCode: "Ce code promo n'est pas valide. Continuez sans lui ou vérifiez l'orthographe.", loading: "Préparation du formulaire...", promoQ: "Vous avez un code promo ?", promoPlaceholder: "Code promo", promoApply: "Appliquer" },
  de: { title: "Nur noch ein Schritt", planLabel: "Dein Tarif", perMonth: "pro Monat", perYear: "pro Jahr", monthlyLabel: "Monatlich", yearlyLabel: "Jährlich", cycleQ: "Wie soll nach der Testphase abgerechnet werden?", yearlyRibbon: "2 Monate gratis", trialToday: "Heute fällig: $0", trialLine: "14 Tage kostenlos testen. Die erste Abbuchung erfolgt erst, wenn die Testphase endet.", afterTrial: "Nach der Testphase:", cancelNote: "Jederzeit auf deiner Kontoseite kündbar, mit einem Klick.", couponApplied: (code: string) => `Code ${code} angewendet. Er gilt für deine erste Abbuchung.`, payButton: "Bestätigen und Testphase starten", processing: "Einen Moment...", secureNote: "Zahlung abgesichert durch Stripe. Wir speichern deine Kartendaten niemals.", needAuthTitle: "Für den nächsten Schritt brauchst du ein Gadit-Konto", needAuthBody: "Die Registrierung dauert eine halbe Minute, und dein Abo wird in deinem Konto gespeichert.", needAuthCta: "Registrieren oder anmelden", invalidPrice: "Tarif nicht gefunden. Wähle einen Tarif auf der Preisseite.", toPricing: "Zu den Preisen", genericError: "Etwas ist schiefgelaufen. Bitte versuche es erneut.", invalidCode: "Dieser Gutscheincode ist ungültig. Fahre ohne ihn fort oder prüfe die Schreibweise.", loading: "Formular wird vorbereitet...", promoQ: "Hast du einen Aktionscode?", promoPlaceholder: "Aktionscode", promoApply: "Anwenden" },
  cs: { title: "Zbývá jediný krok", planLabel: "Váš plán", perMonth: "měsíčně", perYear: "ročně", monthlyLabel: "Měsíčně", yearlyLabel: "Ročně", cycleQ: "Jak účtovat po zkušební době?", yearlyRibbon: "2 měsíce zdarma", trialToday: "K úhradě dnes: $0", trialLine: "14 dní zkušební verze zdarma. První platba proběhne až po skončení zkušební doby.", afterTrial: "Po zkušební době:", cancelNote: "Zrušte kdykoli na stránce svého účtu, jedním kliknutím.", couponApplied: (code: string) => `Kód ${code} použit. Uplatní se u vaší první platby.`, payButton: "Potvrdit a spustit zkušební verzi", processing: "Okamžik...", secureNote: "Platba zabezpečená přes Stripe. Údaje o vaší kartě nikdy neukládáme.", needAuthTitle: "K pokračování potřebujete účet Gadit", needAuthBody: "Registrace zabere půl minuty a vaše předplatné se uloží k vašemu účtu.", needAuthCta: "Zaregistrovat se nebo přihlásit", invalidPrice: "Plán nenalezen. Vyberte plán na stránce s cenami.", toPricing: "Přejít na ceny", genericError: "Něco se pokazilo. Zkuste to prosím znovu.", invalidCode: "Tento slevový kód není platný. Pokračujte bez něj nebo zkontrolujte pravopis.", loading: "Připravujeme formulář...", promoQ: "Máte promo kód?", promoPlaceholder: "Promo kód", promoApply: "Použít" },
  sk: { title: "Zostáva jediný krok", planLabel: "Váš plán", perMonth: "mesačne", perYear: "ročne", monthlyLabel: "Mesačne", yearlyLabel: "Ročne", cycleQ: "Ako účtovať po skúšobnej dobe?", yearlyRibbon: "2 mesiace zadarmo", trialToday: "Na úhradu dnes: $0", trialLine: "14 dní skúšobnej verzie zadarmo. Prvá platba prebehne až po skončení skúšobnej doby.", afterTrial: "Po skúšobnej dobe:", cancelNote: "Zrušte kedykoľvek na stránke svojho účtu, jedným kliknutím.", couponApplied: (code: string) => `Kód ${code} použitý. Uplatní sa pri vašej prvej platbe.`, payButton: "Potvrdiť a spustiť skúšobnú verziu", processing: "Moment...", secureNote: "Platba zabezpečená cez Stripe. Údaje o vašej karte nikdy neukladáme.", needAuthTitle: "Na pokračovanie potrebujete účet Gadit", needAuthBody: "Registrácia zaberie pol minúty a vaše predplatné sa uloží k vášmu účtu.", needAuthCta: "Zaregistrovať sa alebo prihlásiť", invalidPrice: "Plán sa nenašiel. Vyberte plán na stránke s cenami.", toPricing: "Prejsť na ceny", genericError: "Niečo sa pokazilo. Skúste to znova.", invalidCode: "Tento zľavový kód nie je platný. Pokračujte bez neho alebo skontrolujte pravopis.", loading: "Pripravujeme formulár...", promoQ: "Máte promo kód?", promoPlaceholder: "Promo kód", promoApply: "Použiť" },
  it: { title: "Manca solo un passo", planLabel: "Il tuo piano", perMonth: "al mese", perYear: "all'anno", monthlyLabel: "Mensile", yearlyLabel: "Annuale", cycleQ: "Come addebitare dopo la prova?", yearlyRibbon: "2 mesi gratis", trialToday: "Da pagare oggi: $0", trialLine: "14 giorni di prova gratuita. Il primo addebito arriva solo alla fine della prova.", afterTrial: "Dopo la prova:", cancelNote: "Disdici quando vuoi dalla pagina del tuo account, con un clic.", couponApplied: (code: string) => `Codice ${code} applicato. Verrà applicato al tuo primo addebito.`, payButton: "Conferma e inizia la prova", processing: "Un momento...", secureNote: "Pagamento protetto da Stripe. Non conserviamo mai i dati della tua carta.", needAuthTitle: "Ti serve un account Gadit per continuare", needAuthBody: "La registrazione richiede mezzo minuto e il tuo abbonamento resta salvato nel tuo account.", needAuthCta: "Registrati o accedi", invalidPrice: "Piano non trovato. Scegli un piano nella pagina dei prezzi.", toPricing: "Vai ai prezzi", genericError: "Qualcosa è andato storto. Riprova.", invalidCode: "Questo codice coupon non è valido. Continua senza oppure controlla come l'hai scritto.", loading: "Preparazione del modulo...", promoQ: "Hai un codice promozionale?", promoPlaceholder: "Codice promozionale", promoApply: "Applica" },
  ja: { title: "あと一歩です", planLabel: "選択中のプラン", perMonth: "月あたり", perYear: "年あたり", monthlyLabel: "月額", yearlyLabel: "年額", cycleQ: "無料期間の終了後、どのように請求しますか？", yearlyRibbon: "2か月分無料", trialToday: "本日のお支払い: $0", trialLine: "14日間の無料トライアル。最初の請求はトライアル終了時にのみ発生します。", afterTrial: "トライアル終了後:", cancelNote: "アカウントページからいつでもワンクリックで解約できます。", couponApplied: (code: string) => `コード ${code} を適用しました。最初の請求に適用されます。`, payButton: "確定してトライアルを開始", processing: "少々お待ちください...", secureNote: "お支払いは Stripe で保護されています。カード情報を保存することは一切ありません。", needAuthTitle: "続けるには Gadit アカウントが必要です", needAuthBody: "登録は30秒ほどで完了し、ご登録内容はアカウントに保存されます。", needAuthCta: "新規登録またはログイン", invalidPrice: "プランが見つかりません。料金ページでプランをお選びください。", toPricing: "料金ページへ", genericError: "問題が発生しました。もう一度お試しください。", invalidCode: "このクーポンコードは無効です。使わずに進むか、入力をご確認ください。", loading: "フォームを準備しています...", promoQ: "プロモコードをお持ちですか？", promoPlaceholder: "プロモコード", promoApply: "適用" },
  hi: { title: "बस एक कदम बाकी", planLabel: "आपका प्लान", perMonth: "प्रति माह", perYear: "प्रति वर्ष", monthlyLabel: "मासिक", yearlyLabel: "वार्षिक", cycleQ: "ट्रायल के बाद बिलिंग कैसे हो?", yearlyRibbon: "2 महीने मुफ्त", trialToday: "आज देय: $0", trialLine: "14 दिन का मुफ्त ट्रायल. पहला शुल्क तभी लगेगा जब ट्रायल खत्म होगा.", afterTrial: "ट्रायल के बाद:", cancelNote: "अपने अकाउंट पेज से कभी भी रद्द करें, एक क्लिक में.", couponApplied: (code: string) => `कोड ${code} लागू हो गया. यह आपके पहले शुल्क पर लागू होगा.`, payButton: "पुष्टि करें और ट्रायल शुरू करें", processing: "एक पल...", secureNote: "भुगतान Stripe द्वारा सुरक्षित है. हम आपके कार्ड की जानकारी कभी संग्रहीत नहीं करते.", needAuthTitle: "जारी रखने के लिए आपको एक Gadit अकाउंट चाहिए", needAuthBody: "साइन अप करने में आधा मिनट लगता है, और आपकी सदस्यता आपके अकाउंट में सहेज ली जाती है.", needAuthCta: "साइन अप करें या साइन इन करें", invalidPrice: "प्लान नहीं मिला. प्राइसिंग पेज पर एक प्लान चुनें.", toPricing: "प्राइसिंग पर जाएं", genericError: "कुछ गड़बड़ हो गई. कृपया फिर से कोशिश करें.", invalidCode: "यह कूपन कोड मान्य नहीं है. इसके बिना जारी रखें या स्पेलिंग जांचें.", loading: "फॉर्म तैयार हो रहा है...", promoQ: "क्या आपके पास प्रोमो कोड है?", promoPlaceholder: "प्रोमो कोड", promoApply: "लागू करें" },
  am: { title: "አንድ እርምጃ ብቻ ቀርቷል", planLabel: "የእርስዎ እቅድ", perMonth: "በወር", perYear: "በዓመት", monthlyLabel: "ወርሃዊ", yearlyLabel: "ዓመታዊ", cycleQ: "ከሙከራው በኋላ እንዴት ይከፈል?", yearlyRibbon: "2 ወር ነጻ", trialToday: "ዛሬ የሚከፈል: $0", trialLine: "የ14 ቀን ነጻ ሙከራ. የመጀመሪያው ክፍያ የሚሆነው ሙከራው ሲያበቃ ብቻ ነው.", afterTrial: "ከሙከራው በኋላ:", cancelNote: "ከመለያ ገጽዎ በማንኛውም ጊዜ በአንድ ጠቅታ ይሰርዙ.", couponApplied: (code: string) => `ኮድ ${code} ተተግብሯል. ይህ በመጀመሪያ ክፍያዎ ላይ ይተገበራል.`, payButton: "ያረጋግጡ እና ሙከራ ይጀምሩ", processing: "አንድ አፍታ...", secureNote: "ክፍያ በStripe የተጠበቀ ነው. የካርድዎን ዝርዝሮች ፈጽሞ አናከማችም.", needAuthTitle: "ለመቀጠል የGadit መለያ ያስፈልግዎታል", needAuthBody: "መመዝገብ ግማሽ ደቂቃ ይወስዳል፣ እና የደንበኝነት ምዝገባዎ ወደ መለያዎ ይቀመጣል.", needAuthCta: "ይመዝገቡ ወይም ይግቡ", invalidPrice: "እቅድ አልተገኘም. በዋጋ ገጹ ላይ እቅድ ይምረጡ.", toPricing: "ወደ ዋጋ ይሂዱ", genericError: "የሆነ ችግር ተከስቷል. እባክዎ እንደገና ይሞክሩ.", invalidCode: "ይህ የኩፖን ኮድ ትክክለኛ አይደለም. ያለሱ ይቀጥሉ ወይም አጻጻፉን ያረጋግጡ.", loading: "ቅጹ እየተዘጋጀ ነው...", promoQ: "የማስተዋወቂያ ኮድ አለዎት?", promoPlaceholder: "የማስተዋወቂያ ኮድ", promoApply: "ተግብር" },
  uk: { title: "Залишився один крок", planLabel: "Ваш план", perMonth: "на місяць", perYear: "на рік", monthlyLabel: "Щомісяця", yearlyLabel: "Щороку", cycleQ: "Як виставляти рахунок після пробного періоду?", yearlyRibbon: "2 місяці безкоштовно", trialToday: "До сплати сьогодні: $0", trialLine: "14 днів безкоштовного пробного періоду. Перше списання відбудеться лише після завершення пробного періоду.", afterTrial: "Після пробного періоду:", cancelNote: "Скасуйте будь-коли на сторінці свого акаунта, в один клік.", couponApplied: (code: string) => `Код ${code} застосовано. Він застосується до вашого першого списання.`, payButton: "Підтвердити та розпочати пробний період", processing: "Одну хвилину...", secureNote: "Платіж захищено Stripe. Ми ніколи не зберігаємо дані вашої картки.", needAuthTitle: "Щоб продовжити, потрібен акаунт Gadit", needAuthBody: "Реєстрація займає півхвилини, а ваша підписка зберігається у вашому акаунті.", needAuthCta: "Зареєструватися або увійти", invalidPrice: "План не знайдено. Оберіть план на сторінці цін.", toPricing: "Перейти до цін", genericError: "Щось пішло не так. Будь ласка, спробуйте ще раз.", invalidCode: "Цей купон недійсний. Продовжте без нього або перевірте написання.", loading: "Готуємо форму...", promoQ: "Маєте промокод?", promoPlaceholder: "Промокод", promoApply: "Застосувати" },
  tr: { title: "Tek adım kaldı", planLabel: "Planınız", perMonth: "aylık", perYear: "yıllık", monthlyLabel: "Aylık", yearlyLabel: "Yıllık", cycleQ: "Deneme sonrası nasıl faturalandırılsın?", yearlyRibbon: "2 ay ücretsiz", trialToday: "Bugün ödenecek: $0", trialLine: "14 günlük ücretsiz deneme. İlk ücret yalnızca deneme süresi bittiğinde alınır.", afterTrial: "Deneme sonrası:", cancelNote: "Hesap sayfanızdan istediğiniz zaman tek tıkla iptal edin.", couponApplied: (code: string) => `${code} kodu uygulandı. İlk ödemenize uygulanacak.`, payButton: "Onayla ve denemeyi başlat", processing: "Bir saniye...", secureNote: "Ödeme Stripe ile güvence altında. Kart bilgilerinizi asla saklamayız.", needAuthTitle: "Devam etmek için bir Gadit hesabına ihtiyacınız var", needAuthBody: "Kaydolmak yarım dakika sürer ve aboneliğiniz hesabınıza kaydedilir.", needAuthCta: "Kaydol veya giriş yap", invalidPrice: "Plan bulunamadı. Fiyatlandırma sayfasından bir plan seçin.", toPricing: "Fiyatlandırmaya git", genericError: "Bir şeyler ters gitti. Lütfen tekrar deneyin.", invalidCode: "Bu kupon kodu geçerli değil. Kod olmadan devam edin veya yazımını kontrol edin.", loading: "Form hazırlanıyor...", promoQ: "Promosyon kodunuz var mı?", promoPlaceholder: "Promosyon kodu", promoApply: "Uygula" },
  pl: { title: "Jeszcze jeden krok", planLabel: "Twój plan", perMonth: "miesięcznie", perYear: "rocznie", monthlyLabel: "Miesięcznie", yearlyLabel: "Rocznie", cycleQ: "Jak rozliczać po okresie próbnym?", yearlyRibbon: "2 miesiące gratis", trialToday: "Do zapłaty dziś: $0", trialLine: "14 dni bezpłatnego okresu próbnego. Pierwsza opłata pojawi się dopiero po jego zakończeniu.", afterTrial: "Po okresie próbnym:", cancelNote: "Anuluj w dowolnej chwili na stronie swojego konta, jednym kliknięciem.", couponApplied: (code: string) => `Kod ${code} został zastosowany. Obejmie on Twoją pierwszą opłatę.`, payButton: "Potwierdź i rozpocznij okres próbny", processing: "Chwileczkę...", secureNote: "Płatność zabezpieczona przez Stripe. Nigdy nie przechowujemy danych Twojej karty.", needAuthTitle: "Aby kontynuować, potrzebujesz konta Gadit", needAuthBody: "Rejestracja zajmuje pół minuty, a Twoja subskrypcja jest zapisywana na koncie.", needAuthCta: "Zarejestruj się lub zaloguj", invalidPrice: "Nie znaleziono planu. Wybierz plan na stronie z cennikiem.", toPricing: "Przejdź do cennika", genericError: "Coś poszło nie tak. Spróbuj ponownie.", invalidCode: "Ten kod rabatowy jest nieprawidłowy. Kontynuuj bez niego lub sprawdź pisownię.", loading: "Przygotowujemy formularz...", promoQ: "Masz kod promocyjny?", promoPlaceholder: "Kod promocyjny", promoApply: "Zastosuj" },
  fa: { title: "فقط یک قدم مانده", planLabel: "پلن شما", perMonth: "در ماه", perYear: "در سال", monthlyLabel: "ماهانه", yearlyLabel: "سالانه", cycleQ: "پس از دوره آزمایشی چگونه صورتحساب شود؟", yearlyRibbon: "۲ ماه رایگان", trialToday: "پرداختی امروز: $0", trialLine: "14 روز آزمایش رایگان. اولین هزینه فقط زمانی که دوره آزمایشی به پایان برسد دریافت می‌شود.", afterTrial: "پس از دوره آزمایشی:", cancelNote: "هر زمان که خواستید از صفحه حساب خود با یک کلیک لغو کنید.", couponApplied: (code: string) => `کد ${code} اعمال شد. این کد روی اولین پرداخت شما اعمال می‌شود.`, payButton: "تأیید و شروع دوره آزمایشی", processing: "یک لحظه...", secureNote: "پرداخت توسط Stripe ایمن شده است. ما هرگز اطلاعات کارت شما را ذخیره نمی‌کنیم.", needAuthTitle: "برای ادامه به یک حساب Gadit نیاز دارید", needAuthBody: "ثبت‌نام نیم دقیقه طول می‌کشد و اشتراک شما در حسابتان ذخیره می‌شود.", needAuthCta: "ثبت‌نام یا ورود", invalidPrice: "پلن یافت نشد. در صفحه قیمت‌گذاری یک پلن انتخاب کنید.", toPricing: "رفتن به قیمت‌گذاری", genericError: "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.", invalidCode: "این کد تخفیف معتبر نیست. بدون آن ادامه دهید یا املای آن را بررسی کنید.", loading: "در حال آماده‌سازی فرم...", promoQ: "کد تخفیف دارید؟", promoPlaceholder: "کد تخفیف", promoApply: "اعمال" },
  id: { title: "Tinggal satu langkah lagi", planLabel: "Paket Anda", perMonth: "per bulan", perYear: "per tahun", monthlyLabel: "Bulanan", yearlyLabel: "Tahunan", cycleQ: "Bagaimana penagihan setelah masa uji coba?", yearlyRibbon: "2 bulan gratis", trialToday: "Jatuh tempo hari ini: $0", trialLine: "Uji coba gratis 14 hari. Tagihan pertama baru muncul saat masa uji coba berakhir.", afterTrial: "Setelah uji coba:", cancelNote: "Batalkan kapan saja dari halaman akun Anda, cukup satu klik.", couponApplied: (code: string) => `Kode ${code} diterapkan. Kode ini akan berlaku untuk tagihan pertama Anda.`, payButton: "Konfirmasi dan mulai uji coba", processing: "Sebentar...", secureNote: "Pembayaran diamankan oleh Stripe. Kami tidak pernah menyimpan detail kartu Anda.", needAuthTitle: "Anda memerlukan akun Gadit untuk melanjutkan", needAuthBody: "Mendaftar hanya butuh setengah menit, dan langganan Anda tersimpan di akun Anda.", needAuthCta: "Daftar atau masuk", invalidPrice: "Paket tidak ditemukan. Pilih paket di halaman harga.", toPricing: "Buka halaman harga", genericError: "Terjadi kesalahan. Silakan coba lagi.", invalidCode: "Kode kupon itu tidak valid. Lanjutkan tanpa kode atau periksa ejaannya.", loading: "Menyiapkan formulir...", promoQ: "Punya kode promo?", promoPlaceholder: "Kode promo", promoApply: "Terapkan" },
  nl: { title: "Nog één stap", planLabel: "Jouw abonnement", perMonth: "per maand", perYear: "per jaar", monthlyLabel: "Maandelijks", yearlyLabel: "Jaarlijks", cycleQ: "Hoe factureren na de proefperiode?", yearlyRibbon: "2 maanden gratis", trialToday: "Vandaag te betalen: $0", trialLine: "14 dagen gratis proberen. De eerste afschrijving vindt pas plaats als de proefperiode afloopt.", afterTrial: "Na de proefperiode:", cancelNote: "Zeg op elk moment op via je accountpagina, met één klik.", couponApplied: (code: string) => `Code ${code} toegepast. Deze geldt voor je eerste afschrijving.`, payButton: "Bevestig en start de proefperiode", processing: "Een moment...", secureNote: "Betaling beveiligd door Stripe. We slaan je kaartgegevens nooit op.", needAuthTitle: "Je hebt een Gadit-account nodig om verder te gaan", needAuthBody: "Aanmelden duurt een halve minuut, en je abonnement wordt opgeslagen in je account.", needAuthCta: "Aanmelden of inloggen", invalidPrice: "Abonnement niet gevonden. Kies een abonnement op de prijzenpagina.", toPricing: "Naar de prijzen", genericError: "Er ging iets mis. Probeer het opnieuw.", invalidCode: "Deze kortingscode is niet geldig. Ga verder zonder code of controleer de spelling.", loading: "Formulier wordt voorbereid...", promoQ: "Heb je een promocode?", promoPlaceholder: "Promocode", promoApply: "Toepassen" },
  vi: { title: "Chỉ còn một bước nữa", planLabel: "Gói của bạn", perMonth: "mỗi tháng", perYear: "mỗi năm", monthlyLabel: "Hàng tháng", yearlyLabel: "Hàng năm", cycleQ: "Tính phí thế nào sau khi dùng thử?", yearlyRibbon: "Miễn phí 2 tháng", trialToday: "Phải trả hôm nay: $0", trialLine: "Dùng thử miễn phí 14 ngày. Lần tính phí đầu tiên chỉ diễn ra khi hết thời gian dùng thử.", afterTrial: "Sau khi dùng thử:", cancelNote: "Hủy bất cứ lúc nào trên trang tài khoản của bạn, chỉ một cú nhấp.", couponApplied: (code: string) => `Đã áp dụng mã ${code}. Mã này sẽ áp dụng cho lần tính phí đầu tiên của bạn.`, payButton: "Xác nhận và bắt đầu dùng thử", processing: "Chờ một chút...", secureNote: "Thanh toán được bảo mật bởi Stripe. Chúng tôi không bao giờ lưu thông tin thẻ của bạn.", needAuthTitle: "Bạn cần một tài khoản Gadit để tiếp tục", needAuthBody: "Đăng ký chỉ mất nửa phút, và gói đăng ký của bạn được lưu vào tài khoản.", needAuthCta: "Đăng ký hoặc đăng nhập", invalidPrice: "Không tìm thấy gói. Hãy chọn một gói trên trang bảng giá.", toPricing: "Đến bảng giá", genericError: "Đã xảy ra sự cố. Vui lòng thử lại.", invalidCode: "Mã giảm giá này không hợp lệ. Hãy tiếp tục mà không dùng mã hoặc kiểm tra lại chính tả.", loading: "Đang chuẩn bị biểu mẫu...", promoQ: "Bạn có mã khuyến mãi?", promoPlaceholder: "Mã khuyến mãi", promoApply: "Áp dụng" },
  fil: { title: "Isang hakbang na lang", planLabel: "Ang iyong plano", perMonth: "kada buwan", perYear: "kada taon", monthlyLabel: "Buwanan", yearlyLabel: "Taunan", cycleQ: "Paano sisingilin pagkatapos ng trial?", yearlyRibbon: "2 buwang libre", trialToday: "Babayaran ngayon: $0", trialLine: "14 na araw na libreng trial. Ang unang singil ay darating lamang kapag natapos na ang trial.", afterTrial: "Pagkatapos ng trial:", cancelNote: "Kanselahin anumang oras mula sa iyong account page, isang click lang.", couponApplied: (code: string) => `Na-apply ang code na ${code}. Ilalapat ito sa iyong unang singil.`, payButton: "Kumpirmahin at simulan ang trial", processing: "Sandali lang...", secureNote: "Ang bayad ay secured ng Stripe. Hindi namin kailanman iniimbak ang detalye ng iyong card.", needAuthTitle: "Kailangan mo ng Gadit account para magpatuloy", needAuthBody: "Kalahating minuto lang ang pag-sign up, at nase-save ang iyong subscription sa iyong account.", needAuthCta: "Mag-sign up o mag-sign in", invalidPrice: "Hindi nahanap ang plano. Pumili ng plano sa pricing page.", toPricing: "Pumunta sa pricing", genericError: "May nangyaring mali. Pakisubukan muli.", invalidCode: "Hindi valid ang coupon code na iyon. Magpatuloy nang wala ito o suriin ang spelling.", loading: "Inihahanda ang form...", promoQ: "May promo code ka ba?", promoPlaceholder: "Promo code", promoApply: "I-apply" },
  af: { title: "Een tree hiervandaan", planLabel: "Jou plan", perMonth: "per maand", perYear: "per jaar", monthlyLabel: "Maandeliks", yearlyLabel: "Jaarliks", cycleQ: "Hoe wil jy betaal na die proeftydperk?", yearlyRibbon: "2 maande gratis", trialToday: "Vandag betaalbaar: $0", trialLine: "14 dae gratis proeftydperk. Die eerste heffing kom eers wanneer die proeftydperk eindig.", afterTrial: "Na die proeftydperk:", cancelNote: "Kanselleer enige tyd vanaf jou rekeningbladsy, met een klik.", couponApplied: (code: string) => `Kode ${code} toegepas. Dit sal op jou eerste heffing geld.`, payButton: "Bevestig en begin proeftydperk", processing: "Net 'n oomblik...", secureNote: "Betaling beveilig deur Stripe. Ons stoor nooit jou kaartbesonderhede nie.", needAuthTitle: "Jy het 'n Gadit-rekening nodig om voort te gaan", needAuthBody: "Om te registreer neem 'n halwe minuut, en jou intekening word by jou rekening gestoor.", needAuthCta: "Registreer of meld aan", invalidPrice: "Plan nie gevind nie. Kies 'n plan op die pryse-bladsy.", toPricing: "Gaan na pryse", genericError: "Iets het verkeerd geloop. Probeer asseblief weer.", invalidCode: "Daardie koeponkode is nie geldig nie. Gaan voort daarsonder of kyk na die spelling.", loading: "Berei die vorm voor...", promoQ: "Het jy 'n promosiekode?", promoPlaceholder: "Promosiekode", promoApply: "Pas toe" },
  sw: { title: "Hatua moja tu kabla", planLabel: "Mpango wako", perMonth: "kwa mwezi", perYear: "kwa mwaka", monthlyLabel: "Kila mwezi", yearlyLabel: "Kila mwaka", cycleQ: "Utalipaje baada ya kipindi cha majaribio?", yearlyRibbon: "Miezi 2 bila malipo", trialToday: "Inayolipwa leo: $0", trialLine: "Kipindi cha majaribio cha siku 14 bila malipo. Malipo ya kwanza huja tu kipindi cha majaribio kinapoisha.", afterTrial: "Baada ya majaribio:", cancelNote: "Ghairi wakati wowote kutoka ukurasa wa akaunti yako, kwa mbofyo mmoja.", couponApplied: (code: string) => `Msimbo ${code} umetumika. Utatumika kwenye malipo yako ya kwanza.`, payButton: "Thibitisha na anza majaribio", processing: "Subiri kidogo...", secureNote: "Malipo yanalindwa na Stripe. Hatuhifadhi kamwe maelezo ya kadi yako.", needAuthTitle: "Unahitaji akaunti ya Gadit ili kuendelea", needAuthBody: "Kujisajili huchukua nusu dakika, na usajili wako huhifadhiwa kwenye akaunti yako.", needAuthCta: "Jisajili au ingia", invalidPrice: "Mpango haukupatikana. Chagua mpango kwenye ukurasa wa bei.", toPricing: "Nenda kwenye bei", genericError: "Hitilafu imetokea. Tafadhali jaribu tena.", invalidCode: "Msimbo huo wa kuponi si sahihi. Endelea bila huo au angalia tahajia.", loading: "Inaandaa fomu...", promoQ: "Una msimbo wa ofa?", promoPlaceholder: "Msimbo wa ofa", promoApply: "Tumia" },
  "zh-CN": { title: "只差一步", planLabel: "您的方案", perMonth: "每月", perYear: "每年", monthlyLabel: "按月", yearlyLabel: "按年", cycleQ: "试用结束后如何扣费？", yearlyRibbon: "免费畅享2个月", trialToday: "今日应付：$0", trialLine: "14天免费试用。首次扣费仅在试用结束时进行。", afterTrial: "试用结束后：", cancelNote: "随时在账户页面一键取消。", couponApplied: (code: string) => `代码 ${code} 已应用，将用于您的首次扣费。`, payButton: "确认并开始试用", processing: "请稍候……", secureNote: "支付由 Stripe 保护。我们绝不存储您的银行卡信息。", needAuthTitle: "您需要 Gadit 账户才能继续", needAuthBody: "注册只需半分钟，您的订阅会保存到您的账户中。", needAuthCta: "注册或登录", invalidPrice: "未找到方案。请在价格页面选择一个方案。", toPricing: "前往价格页面", genericError: "出了点问题，请重试。", invalidCode: "该优惠码无效。您可以不使用它继续，或检查拼写。", loading: "正在准备表单……", promoQ: "有优惠码吗？", promoPlaceholder: "优惠码", promoApply: "应用" },
  "zh-TW": { title: "只差一步", planLabel: "您的方案", perMonth: "每月", perYear: "每年", monthlyLabel: "按月", yearlyLabel: "按年", cycleQ: "試用結束後如何扣款？", yearlyRibbon: "免費暢享2個月", trialToday: "今日應付：$0", trialLine: "14天免費試用。首次扣款僅在試用結束時進行。", afterTrial: "試用結束後：", cancelNote: "隨時在帳戶頁面一鍵取消。", couponApplied: (code: string) => `代碼 ${code} 已套用，將用於您的首次扣款。`, payButton: "確認並開始試用", processing: "請稍候……", secureNote: "付款由 Stripe 保護。我們絕不儲存您的信用卡資訊。", needAuthTitle: "您需要 Gadit 帳戶才能繼續", needAuthBody: "註冊只需半分鐘，您的訂閱會儲存到您的帳戶中。", needAuthCta: "註冊或登入", invalidPrice: "找不到方案。請在價格頁面選擇一個方案。", toPricing: "前往價格頁面", genericError: "出了點問題，請重試。", invalidCode: "該優惠碼無效。您可以不使用它繼續，或檢查拼字。", loading: "正在準備表單……", promoQ: "有優惠碼嗎？", promoPlaceholder: "優惠碼", promoApply: "套用" },
  ko: { title: "한 걸음만 남았어요", planLabel: "선택한 플랜", perMonth: "월", perYear: "연", monthlyLabel: "월간", yearlyLabel: "연간", cycleQ: "체험 후 결제 주기를 어떻게 할까요?", yearlyRibbon: "2개월 무료", trialToday: "오늘 결제 금액: $0", trialLine: "14일 무료 체험. 첫 결제는 체험이 끝날 때만 이루어집니다.", afterTrial: "체험 종료 후:", cancelNote: "계정 페이지에서 언제든 클릭 한 번으로 해지할 수 있어요.", couponApplied: (code: string) => `코드 ${code}가 적용되었습니다. 첫 결제에 반영됩니다.`, payButton: "확인하고 체험 시작", processing: "잠시만요...", secureNote: "결제는 Stripe로 안전하게 보호됩니다. 카드 정보는 절대 저장하지 않아요.", needAuthTitle: "계속하려면 Gadit 계정이 필요해요", needAuthBody: "가입은 30초면 되고, 구독은 계정에 저장됩니다.", needAuthCta: "가입 또는 로그인", invalidPrice: "플랜을 찾을 수 없어요. 가격 페이지에서 플랜을 선택해 주세요.", toPricing: "가격 페이지로 이동", genericError: "문제가 발생했어요. 다시 시도해 주세요.", invalidCode: "해당 쿠폰 코드는 유효하지 않아요. 없이 계속하거나 철자를 확인해 주세요.", loading: "양식을 준비하는 중...", promoQ: "프로모션 코드가 있나요?", promoPlaceholder: "프로모션 코드", promoApply: "적용" },
  th: { title: "อีกเพียงขั้นตอนเดียว", planLabel: "แพ็กเกจของคุณ", perMonth: "ต่อเดือน", perYear: "ต่อปี", monthlyLabel: "รายเดือน", yearlyLabel: "รายปี", cycleQ: "จะเรียกเก็บเงินอย่างไรหลังช่วงทดลองใช้?", yearlyRibbon: "ฟรี 2 เดือน", trialToday: "ยอดชำระวันนี้: $0", trialLine: "ทดลองใช้ฟรี 14 วัน การเรียกเก็บเงินครั้งแรกจะเกิดขึ้นเมื่อช่วงทดลองใช้สิ้นสุดลงเท่านั้น", afterTrial: "หลังช่วงทดลองใช้:", cancelNote: "ยกเลิกได้ทุกเมื่อจากหน้าบัญชีของคุณ เพียงคลิกเดียว", couponApplied: (code: string) => `ใช้โค้ด ${code} แล้ว จะนำไปใช้กับการเรียกเก็บเงินครั้งแรกของคุณ`, payButton: "ยืนยันและเริ่มทดลองใช้", processing: "สักครู่นะ...", secureNote: "การชำระเงินปลอดภัยด้วย Stripe เราไม่เก็บข้อมูลบัตรของคุณเลย", needAuthTitle: "คุณต้องมีบัญชี Gadit เพื่อดำเนินการต่อ", needAuthBody: "การสมัครใช้เวลาเพียงครึ่งนาที และการสมัครสมาชิกของคุณจะถูกบันทึกไว้ในบัญชีของคุณ", needAuthCta: "สมัครหรือเข้าสู่ระบบ", invalidPrice: "ไม่พบแพ็กเกจ กรุณาเลือกแพ็กเกจในหน้าราคา", toPricing: "ไปที่หน้าราคา", genericError: "เกิดข้อผิดพลาดบางอย่าง กรุณาลองอีกครั้ง", invalidCode: "โค้ดคูปองนี้ไม่ถูกต้อง ดำเนินการต่อโดยไม่ใช้โค้ด หรือตรวจสอบการสะกด", loading: "กำลังเตรียมแบบฟอร์ม...", promoQ: "มีโค้ดโปรโมชันไหม?", promoPlaceholder: "โค้ดโปรโมชัน", promoApply: "ใช้" },
  bn: { title: "মাত্র এক ধাপ বাকি", planLabel: "আপনার প্ল্যান", perMonth: "প্রতি মাসে", perYear: "প্রতি বছরে", monthlyLabel: "মাসিক", yearlyLabel: "বার্ষিক", cycleQ: "ট্রায়ালের পরে কীভাবে বিল করা হবে?", yearlyRibbon: "২ মাস ফ্রি", trialToday: "আজ প্রদেয়: $0", trialLine: "১৪ দিনের ফ্রি ট্রায়াল। প্রথম চার্জ শুধু ট্রায়াল শেষ হলেই আসবে।", afterTrial: "ট্রায়ালের পরে:", cancelNote: "আপনার অ্যাকাউন্ট পেজ থেকে যেকোনো সময় এক ক্লিকে বাতিল করুন।", couponApplied: (code: string) => `কোড ${code} প্রয়োগ হয়েছে। এটি আপনার প্রথম চার্জে প্রযোজ্য হবে।`, payButton: "নিশ্চিত করুন ও ট্রায়াল শুরু করুন", processing: "একটু অপেক্ষা করুন...", secureNote: "পেমেন্ট Stripe দ্বারা সুরক্ষিত। আমরা আপনার কার্ডের তথ্য কখনো সংরক্ষণ করি না।", needAuthTitle: "চালিয়ে যেতে আপনার একটি Gadit অ্যাকাউন্ট প্রয়োজন", needAuthBody: "সাইন আপ করতে আধ মিনিট লাগে, আর আপনার সাবস্ক্রিপশন আপনার অ্যাকাউন্টে সংরক্ষিত থাকে।", needAuthCta: "সাইন আপ বা সাইন ইন করুন", invalidPrice: "প্ল্যান পাওয়া যায়নি। প্রাইসিং পেজে একটি প্ল্যান বেছে নিন।", toPricing: "প্রাইসিংয়ে যান", genericError: "কিছু একটা সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।", invalidCode: "সেই কুপন কোডটি বৈধ নয়। এটি ছাড়া চালিয়ে যান বা বানান যাচাই করুন।", loading: "ফর্ম প্রস্তুত করা হচ্ছে...", promoQ: "কোনো প্রোমো কোড আছে?", promoPlaceholder: "প্রোমো কোড", promoApply: "প্রয়োগ করুন" },
  da: { title: "Kun ét skridt væk", planLabel: "Din plan", perMonth: "pr. måned", perYear: "pr. år", monthlyLabel: "Månedligt", yearlyLabel: "Årligt", cycleQ: "Hvordan vil du betale efter prøveperioden?", yearlyRibbon: "2 måneder gratis", trialToday: "Skal betales i dag: $0", trialLine: "14 dages gratis prøveperiode. Den første betaling sker først, når prøveperioden slutter.", afterTrial: "Efter prøveperioden:", cancelNote: "Opsig når som helst fra din kontoside med ét klik.", couponApplied: (code: string) => `Koden ${code} er anvendt. Den gælder for din første betaling.`, payButton: "Bekræft og start prøveperiode", processing: "Et øjeblik...", secureNote: "Betaling sikret af Stripe. Vi gemmer aldrig dine kortoplysninger.", needAuthTitle: "Du skal bruge en Gadit-konto for at fortsætte", needAuthBody: "Tilmelding tager et halvt minut, og dit abonnement gemmes på din konto.", needAuthCta: "Tilmeld dig eller log ind", invalidPrice: "Planen blev ikke fundet. Vælg en plan på prissiden.", toPricing: "Gå til priser", genericError: "Noget gik galt. Prøv venligst igen.", invalidCode: "Den rabatkode er ikke gyldig. Fortsæt uden den, eller tjek stavningen.", loading: "Forbereder formularen...", promoQ: "Har du en rabatkode?", promoPlaceholder: "Rabatkode", promoApply: "Anvend" },
  hu: { title: "Már csak egy lépés", planLabel: "A csomagod", perMonth: "havonta", perYear: "évente", monthlyLabel: "Havi", yearlyLabel: "Éves", cycleQ: "Hogyan szeretnél fizetni a próbaidőszak után?", yearlyRibbon: "2 hónap ingyen", trialToday: "Ma fizetendő: $0", trialLine: "14 napos ingyenes próbaidőszak. Az első terhelés csak a próbaidőszak végén történik.", afterTrial: "A próbaidőszak után:", cancelNote: "Bármikor lemondhatod a fiókod oldaláról, egyetlen kattintással.", couponApplied: (code: string) => `A(z) ${code} kód alkalmazva. Az első terhelésnél lesz érvényes.`, payButton: "Megerősítés és próbaidőszak indítása", processing: "Egy pillanat...", secureNote: "A fizetést a Stripe védi. A kártyaadataidat soha nem tároljuk.", needAuthTitle: "A folytatáshoz Gadit-fiókra van szükséged", needAuthBody: "A regisztráció fél percet vesz igénybe, és az előfizetésed a fiókodhoz mentjük.", needAuthCta: "Regisztrálj vagy jelentkezz be", invalidPrice: "A csomag nem található. Válassz csomagot az árak oldalon.", toPricing: "Ugrás az árakhoz", genericError: "Valami hiba történt. Kérjük, próbáld újra.", invalidCode: "Ez a kuponkód érvénytelen. Folytasd nélküle, vagy ellenőrizd a helyesírást.", loading: "Az űrlap előkészítése...", promoQ: "Van promóciós kódod?", promoPlaceholder: "Promóciós kód", promoApply: "Alkalmaz" },
  he: {
    title: "עוד צעד אחד וזה שלכם",
    planLabel: "המסלול שבחרתם",
    perMonth: "לחודש",
    perYear: "לשנה",
    monthlyLabel: "חודשי",
    yearlyLabel: "שנתי",
    cycleQ: "איך לחייב אחרי הניסיון?",
    yearlyRibbon: "חודשיים חינם",
    trialToday: "היום תשלמו: 0 ₪",
    trialLine: "14 ימי ניסיון חינם. החיוב הראשון רק בסוף הניסיון.",
    afterTrial: "לאחר הניסיון:",
    cancelNote: "אפשר לבטל בכל רגע לפני תום הניסיון, מדף החשבון בלחיצה אחת, ולא תחויב.",
    couponApplied: (code: string) => `קוד ${code} הופעל ויחול על החיוב הראשון.`,
    payButton: "אישור והתחלת הניסיון",
    processing: "רק רגע...",
    secureNote: "התשלום מאובטח על ידי Stripe. פרטי הכרטיס לא נשמרים אצלנו.",
    needAuthTitle: "כדי להמשיך צריך חשבון Gadit",
    needAuthBody: "ההרשמה לוקחת חצי דקה, והמנוי נשמר על החשבון שלכם.",
    needAuthCta: "הרשמה או התחברות",
    invalidPrice: "המסלול לא נמצא. אפשר לבחור מסלול בדף התמחור.",
    toPricing: "לדף התמחור",
    genericError: "משהו השתבש. נסו שוב.",
    invalidCode: "קוד הקופון לא תקף. אפשר להמשיך בלי קוד או לבדוק את האיות.",
    loading: "מכינים את הטופס...",
    promoQ: "יש לך קוד קופון?",
    promoPlaceholder: "קוד קופון",
    promoApply: "החלה",
  },
  en: {
    title: "One step away",
    planLabel: "Your plan",
    perMonth: "per month",
    perYear: "per year",
    monthlyLabel: "Monthly",
    yearlyLabel: "Yearly",
    cycleQ: "How to bill after the trial?",
    yearlyRibbon: "2 months free",
    trialToday: "Due today: $0",
    trialLine: "14 day free trial. The first charge comes only when the trial ends.",
    afterTrial: "After the trial:",
    cancelNote: "Cancel anytime before the trial ends, from your account in one click, and you won't be charged.",
    couponApplied: (code: string) => `Code ${code} applied. It will apply to your first charge.`,
    payButton: "Confirm and start trial",
    processing: "One moment...",
    secureNote: "Payment secured by Stripe. We never store your card details.",
    needAuthTitle: "You need a Gadit account to continue",
    needAuthBody: "Signing up takes half a minute, and your subscription is saved to your account.",
    needAuthCta: "Sign up or sign in",
    invalidPrice: "Plan not found. Pick a plan on the pricing page.",
    toPricing: "Go to pricing",
    genericError: "Something went wrong. Please try again.",
    invalidCode: "That coupon code is not valid. Continue without it or check the spelling.",
    loading: "Preparing the form...",
    promoQ: "Have a promo code?",
    promoPlaceholder: "Promo code",
    promoApply: "Apply",
  },
  zu: {
    title: "Usale isinyathelo esisodwa",
    planLabel: "Uhlelo lwakho",
    perMonth: "ngenyanga",
    perYear: "ngonyaka",
    monthlyLabel: "Ngenyanga",
    yearlyLabel: "Ngonyaka",
    cycleQ: "Sikukhokhise kanjani ngemva kokulinga?",
    yearlyRibbon: "izinyanga ezi-2 mahhala",
    trialToday: "Okukhokhwayo namuhla: $0",
    trialLine: "Ukulinga kwezinsuku ezingu-14 mahhala. Ukukhokhiswa kokuqala kufika kuphela lapho ukulinga kuphela.",
    afterTrial: "Ngemva kokulinga:",
    cancelNote: "Khansela nganoma yisiphi isikhathi ekhasini le-akhawunti yakho, ngokuchofoza okukodwa.",
    couponApplied: (code: string) => `Ikhodi ${code} isebenzile. Izosebenza ekukhokhisweni kwakho kokuqala.`,
    payButton: "Qinisekisa uqale ukulinga",
    processing: "Umzuzwana...",
    secureNote: "Inkokhelo ivikelwe yi-Stripe. Asiwagcini neze imininingwane yekhadi lakho.",
    needAuthTitle: "Udinga i-akhawunti ye-Gadit ukuze uqhubeke",
    needAuthBody: "Ukubhalisa kuthatha ingxenye yomzuzu, futhi ukubhalisa kwakho kugcinwa ku-akhawunti yakho.",
    needAuthCta: "Bhalisa noma ngena",
    invalidPrice: "Uhlelo alutholakalanga. Khetha uhlelo ekhasini lamanani.",
    toPricing: "Iya emananini",
    genericError: "Kukhona okungahambanga kahle. Sicela uzame futhi.",
    invalidCode: "Leyo khodi yekhuphoni ayisebenzi. Qhubeka ngaphandle kwayo noma uhlole ukupela.",
    loading: "Silungiselela ifomu...",
    promoQ: "Unayo ikhodi yesipesheli?",
    promoPlaceholder: "Ikhodi yesipesheli",
    promoApply: "Faka",
  },
  el: {
    title: "Μένει ένα βήμα",
    planLabel: "Το πακέτο σου",
    perMonth: "τον μήνα",
    perYear: "τον χρόνο",
    monthlyLabel: "Μηνιαία",
    yearlyLabel: "Ετήσια",
    cycleQ: "Πώς να χρεώνουμε μετά τη δοκιμή;",
    yearlyRibbon: "2 μήνες δωρεάν",
    trialToday: "Πληρώνεις σήμερα: $0",
    trialLine: "14 ημέρες δωρεάν δοκιμή. Η πρώτη χρέωση γίνεται μόνο όταν τελειώσει η δοκιμή.",
    afterTrial: "Μετά τη δοκιμή:",
    cancelNote: "Ακύρωσε όποτε θες από τη σελίδα του λογαριασμού σου, με ένα κλικ.",
    couponApplied: (code: string) => `Ο κωδικός ${code} ενεργοποιήθηκε. Θα εφαρμοστεί στην πρώτη σου χρέωση.`,
    payButton: "Επιβεβαίωση και έναρξη δοκιμής",
    processing: "Μια στιγμή...",
    secureNote: "Η πληρωμή είναι ασφαλής μέσω Stripe. Δεν αποθηκεύουμε ποτέ τα στοιχεία της κάρτας σου.",
    needAuthTitle: "Χρειάζεσαι λογαριασμό Gadit για να συνεχίσεις",
    needAuthBody: "Η εγγραφή παίρνει μισό λεπτό, και η συνδρομή σου αποθηκεύεται στον λογαριασμό σου.",
    needAuthCta: "Εγγραφή ή σύνδεση",
    invalidPrice: "Το πακέτο δεν βρέθηκε. Διάλεξε ένα πακέτο στη σελίδα τιμών.",
    toPricing: "Στη σελίδα τιμών",
    genericError: "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
    invalidCode: "Αυτός ο κωδικός κουπονιού δεν ισχύει. Συνέχισε χωρίς αυτόν ή έλεγξε την ορθογραφία.",
    loading: "Ετοιμάζουμε τη φόρμα...",
    promoQ: "Έχεις κωδικό προσφοράς;",
    promoPlaceholder: "Κωδικός προσφοράς",
    promoApply: "Εφαρμογή",
  },
};

type Phase = "boot" | "need-auth" | "form" | "bad-price" | "error";

export default function CheckoutClient() {
  const params = useSearchParams();
  const priceId = params.get("price") ?? "";
  const code = params.get("code") ?? "";
  const { user, loading, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const c = (COPY as Record<string, typeof COPY.en>)[lang] ?? COPY.en;
  const tier = tierForPrice(priceId);
  const otherId = tier ? counterpartPrice(tier) : null;
  const otherTier = otherId ? tierForPrice(otherId) : null;

  const [phase, setPhase] = useState<Phase>("boot");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [elementReady, setElementReady] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoVal, setPromoVal] = useState(code);
  // Set after mount (reads localStorage) so SSR and first client render match.
  const [inTwa, setInTwa] = useState(false);
  useEffect(() => { setInTwa(isTwa()); }, []);
  // TWA-only: state for the "open payment in browser" handoff.
  const [twaBusy, setTwaBusy] = useState(false);
  const [twaErr, setTwaErr] = useState<string | null>(null);
  // Which price the TWA hand-off will use. Hosted Checkout is a single
  // price, so the monthly/yearly choice has to be made here, in the app,
  // before we open the browser (the web Payment Element shows the toggle
  // inline, but the hosted page can't).
  const [twaPriceId, setTwaPriceId] = useState(priceId);

  // Inside the TWA, payment must open in an EXTERNAL browser to stay on
  // the reader-app model. We can't just open www.gadit.app/checkout: the
  // TWA verifies that exact host with full scope, so Android recaptures
  // the link straight back into the app (the Custom Tab flashes and
  // vanishes), and the shared localStorage would loop this interstitial
  // anyway. Instead we mint a Stripe-HOSTED Checkout Session and open
  // checkout.stripe.com — a different origin the TWA never captures, so
  // it opens externally and stays. Same webhook (checkout.session.completed)
  // provisions the account. Hosted Checkout also carries its own promo
  // field, so no coupon plumbing is needed here.
  async function openExternalCheckout() {
    setTwaErr(null);
    if (!user) {
      promptLogin({ mode: "signup", reason: "checkout" });
      return;
    }
    setTwaBusy(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ priceId: twaPriceId, lang }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string };
      if (!res.ok || !data.url) {
        setTwaErr(c.genericError);
        setTwaBusy(false);
        return;
      }
      openInBrowser(data.url);
      // Leave the button in its "opening" state — the user is now in the
      // external browser; returning to the app re-shows this screen.
      setTwaBusy(false);
    } catch {
      setTwaErr(c.genericError);
      setTwaBusy(false);
    }
  }

  // Applying a promo code just reloads the page with ?code=CODE and lets
  // the existing (tested) URL-param path attach the discount via
  // /api/subscribe. Simpler and safer than re-mounting the Element.
  // Switch billing cycle: reload /checkout with the other-cycle price so
  // the whole init flow re-runs cleanly for the new plan (same pattern as
  // applying a promo, no risky live Element re-mount).
  function switchCycle(toId: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("price", toId);
    window.location.href = url.toString();
  }

  function applyPromo() {
    const v = promoVal.trim();
    if (!v) return;
    const url = new URL(window.location.href);
    url.searchParams.set("code", v);
    window.location.href = url.toString();
  }

  const stripeRef = useRef<StripeJs | null>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const modeRef = useRef<"setup" | "payment">("setup");
  const mountRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  // Auth gate. promptLogin no-ops into onSuccess for signed-in users,
  // and the auth state change re-runs the subscribe effect below.
  useEffect(() => {
    if (loading) return;
    if (!tier) {
      setPhase("bad-price");
      return;
    }
    if (!user) {
      setPhase("need-auth");
      return;
    }
  }, [loading, user, tier]);

  // Create the subscription + mount the Payment Element once we have
  // a signed-in user. startedRef guards double-run (Strict Mode) and
  // re-renders — /api/subscribe reuses abandoned subs anyway, this
  // just avoids pointless requests.
  useEffect(() => {
    if (loading || !user || !tier || startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();

        // Schools must put a card down up front (no card-less trial record), so
        // they go through the hosted Checkout Session (which always collects a
        // card) instead of the inline Payment Element. Israeli schools pay by
        // bank transfer via Invoice4U, a separate flow that never reaches here.
        if (schoolsTierForPrice(priceId)) {
          const hosted = await fetch("/api/create-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
            body: JSON.stringify({ priceId, lang }),
          });
          const hd = (await hosted.json().catch(() => ({}))) as { url?: string };
          if (cancelled) return;
          if (hosted.ok && hd.url) { window.location.href = hd.url; return; }
          setErrMsg(c.genericError);
          setPhase("error");
          startedRef.current = false;
          return;
        }

        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ priceId, ...(code && { code }), lang }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          clientSecret?: string;
          mode?: "setup" | "payment";
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || !data.clientSecret || !data.mode) {
          setErrMsg(data.error === "invalid_code" ? c.invalidCode : c.genericError);
          setPhase("error");
          startedRef.current = false;
          return;
        }

        const stripe = await stripePromise;
        if (cancelled) return;
        if (!stripe) {
          setErrMsg(c.genericError);
          setPhase("error");
          return;
        }
        stripeRef.current = stripe;
        modeRef.current = data.mode;

        const locale = (STRIPE_ELEMENT_LOCALES.has(lang) ? lang : "auto") as StripeElementLocale;
        const elements = stripe.elements({
          clientSecret: data.clientSecret,
          locale,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#0EA5A5",
              colorText: "#1f2937",
              borderRadius: "12px",
              fontSizeBase: "16px",
            },
          },
        });
        elementsRef.current = elements;
        setPhase("form");
        track("checkout_started", { priceId, surface: "payment_element", lang });
      } catch (err) {
        console.error("[checkout] init failed:", err);
        if (!cancelled) {
          setErrMsg(c.genericError);
          setPhase("error");
          startedRef.current = false;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, priceId, code, lang]);

  // Mount the element once its container exists (phase === "form").
  useEffect(() => {
    if (phase !== "form" || !elementsRef.current || !mountRef.current) return;
    const el = elementsRef.current.create("payment", { layout: "tabs" });
    el.on("ready", () => setElementReady(true));
    el.mount(mountRef.current);
    return () => {
      el.destroy();
      setElementReady(false);
    };
  }, [phase]);

  async function onPay() {
    const stripe = stripeRef.current;
    const elements = elementsRef.current;
    if (!stripe || !elements || submitting) return;
    setSubmitting(true);
    setErrMsg(null);
    track("checkout_pay_clicked", { priceId, surface: "payment_element" });

    const returnUrl =
      `${window.location.origin}${href("/checkout/done")}?price=${encodeURIComponent(priceId)}`;
    const confirmParams = { return_url: returnUrl };
    const { error } =
      modeRef.current === "setup"
        ? await stripe.confirmSetup({ elements, confirmParams })
        : await stripe.confirmPayment({ elements, confirmParams });

    // Only reached when confirmation failed synchronously (validation,
    // card declined without redirect). Success navigates away.
    if (error) {
      setErrMsg(error.message ?? c.genericError);
      setSubmitting(false);
    }
  }

  const cycleLabel = tier?.cycle === "yearly" ? c.perYear : c.perMonth;

  // Inside the Android app (TWA): payment must happen in a browser, not
  // in-app, so the purchase stays a web/reader-app one (no Google Play
  // Billing, no 15-30% cut, all on Stripe). Show a "continue in the
  // browser" screen instead of the in-app Stripe form.
  if (inTwa) {
    const twaTier = tierForPrice(twaPriceId);
    const twaOtherId = twaTier ? counterpartPrice(twaTier) : null;
    const twaOtherTier = twaOtherId ? tierForPrice(twaOtherId) : null;
    const amt = (t: TierInfo) => (lang === "he" ? t.amountIls : t.amount);
    const cycleOpt = (label: string, sub: string, active: boolean, ribbon: string | null, onClick: () => void) => (
      <button type="button" onClick={onClick} style={{ position: "relative", flex: 1, padding: ribbon ? "18px 8px 10px" : "10px 8px", borderRadius: 10, border: active ? "2px solid #0EA5A5" : "1px solid #D1D5DB", background: active ? "rgba(14,165,165,0.06)" : "#fff", cursor: active ? "default" : "pointer", fontFamily: "inherit" }}>
        {ribbon && (
          <span style={{ position: "absolute", top: -11, insetInlineStart: "50%", transform: "translateX(-50%)", background: "#CA8A04", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}>{ribbon}</span>
        )}
        <div style={{ fontSize: 13.5, fontWeight: 700, color: active ? "#0b7d7d" : "#374151" }}>{label}</div>
        <div style={{ fontSize: 12.5, color: "#6b7280", marginTop: 2 }}>{sub}</div>
      </button>
    );
    return (
      <div dir={dir} style={styles.page}>
        <header style={styles.header}>
          <span style={styles.wordmark} dir="ltr" translate="no" aria-label="Gadit">
            Gad<span style={{ fontStyle: "italic", color: "#0EA5A5" }}>it</span>
          </span>
        </header>
        <main style={styles.main}>
          <div style={{ ...styles.card, textAlign: "center" }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 10px", color: "#1C1917" }}>
              {lang === "he" ? "ממשיכים לתשלום בדפדפן" : "Continue to payment in the browser"}
            </h1>
            <p style={{ fontSize: 14.5, color: "#57534E", lineHeight: 1.7, margin: "0 0 18px" }}>
              {lang === "he"
                ? "התשלום מתבצע בדפדפן, בצורה מאובטחת. לחיצה על הכפתור תפתח את עמוד התשלום."
                : "Payment is completed securely in your browser. Tap the button to open the payment page."}
            </p>

            {twaTier && (
              <div style={{ ...styles.summary, textAlign: "start", marginBottom: 18 }}>
                <div style={styles.summaryRow}>
                  <span style={styles.muted}>{c.planLabel}</span>
                  <span style={styles.planName}>Gadit {twaTier.name}</span>
                </div>
                <div style={styles.trialBox}>
                  <div style={styles.trialToday}>{c.trialToday}</div>
                  <div style={styles.trialLine}>{c.trialLine}</div>
                </div>
                {twaOtherTier && twaOtherId && (() => {
                  const monthlyT = twaTier.cycle === "monthly" ? twaTier : twaOtherTier;
                  const yearlyT = twaTier.cycle === "yearly" ? twaTier : twaOtherTier;
                  const monthlyId = twaTier.cycle === "monthly" ? twaPriceId : twaOtherId;
                  const yearlyId = twaTier.cycle === "yearly" ? twaPriceId : twaOtherId;
                  return (
                    <div style={{ margin: "14px 0 2px" }}>
                      <div style={{ ...styles.muted, marginBottom: 8 }}>{c.cycleQ}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {cycleOpt(c.monthlyLabel, `${amt(monthlyT)} ${c.perMonth}`, twaTier.cycle === "monthly", null, () => setTwaPriceId(monthlyId))}
                        {cycleOpt(c.yearlyLabel, `${amt(yearlyT)} ${c.perYear}`, twaTier.cycle === "yearly", c.yearlyRibbon, () => setTwaPriceId(yearlyId))}
                      </div>
                    </div>
                  );
                })()}
                <div style={styles.summaryRow}>
                  <span style={styles.muted}>{c.afterTrial}</span>
                  <span style={styles.amount}>
                    {amt(twaTier)} {twaTier.cycle === "yearly" ? c.perYear : c.perMonth}
                  </span>
                </div>
                {/* Cancel terms inside the offer card too — Google Play requires
                    the trial length, the price after, AND how to cancel to be
                    clear in the offer itself, not only the payment cart. */}
                <p style={{ ...styles.cancelNote, marginTop: 12, marginBottom: 0 }}>{c.cancelNote}</p>
              </div>
            )}

            <button
              type="button"
              disabled={twaBusy}
              onClick={openExternalCheckout}
              style={{ display: "block", width: "100%", background: "#0EA5A5", color: "#fff", padding: "14px 30px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 15.5, fontFamily: "inherit", cursor: twaBusy ? "default" : "pointer", opacity: twaBusy ? 0.6 : 1 }}
            >
              {twaBusy
                ? c.processing
                : lang === "he" ? "פתח את עמוד התשלום" : "Open the payment page"}
            </button>
            {twaErr && (
              <p role="alert" style={{ color: "#b91c1c", fontSize: 14, margin: "14px 0 0" }}>{twaErr}</p>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div dir={dir} style={styles.page}>
      <header style={styles.header}>
        <Link href={href("/")} style={styles.wordmark} dir="ltr" translate="no" aria-label="Gadit">
          Gad<span style={{ fontStyle: "italic", color: "#0EA5A5" }}>it</span>
        </Link>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          {phase === "bad-price" && (
            <>
              <h1 style={styles.title}>{c.invalidPrice}</h1>
              <Link href={href("/pricing")} style={styles.primaryLink}>
                {c.toPricing}
              </Link>
            </>
          )}

          {phase === "need-auth" && (
            <>
              <h1 style={styles.title}>{c.needAuthTitle}</h1>
              <p style={styles.muted}>{c.needAuthBody}</p>
              <button
                type="button"
                style={styles.payButton}
                onClick={() => promptLogin({ mode: "signup", reason: "checkout" })}
              >
                {c.needAuthCta}
              </button>
            </>
          )}

          {(phase === "boot" || phase === "error" || phase === "form") && tier && (
            <>
              <h1 style={styles.title}>{c.title}</h1>

              <div style={styles.summary}>
                <div style={styles.summaryRow}>
                  <span style={styles.muted}>{c.planLabel}</span>
                  <span style={styles.planName}>
                    Gadit {tier.name}
                  </span>
                </div>
                <div style={styles.trialBox}>
                  <div style={styles.trialToday}>{c.trialToday}</div>
                  <div style={styles.trialLine}>{c.trialLine}</div>
                </div>
                {otherTier && otherId && (() => {
                  const monthlyT = tier.cycle === "monthly" ? tier : otherTier;
                  const yearlyT = tier.cycle === "yearly" ? tier : otherTier;
                  const monthlyId = tier.cycle === "monthly" ? priceId : otherId;
                  const yearlyId = tier.cycle === "yearly" ? priceId : otherId;
                  const amt = (t: TierInfo) => (lang === "he" ? t.amountIls : t.amount);
                  const opt = (label: string, sub: string, active: boolean, ribbon: string | null, onClick: () => void) => (
                    <button type="button" onClick={onClick} style={{ position: "relative", flex: 1, padding: ribbon ? "18px 8px 10px" : "10px 8px", borderRadius: 10, border: active ? "2px solid #0EA5A5" : "1px solid #D1D5DB", background: active ? "rgba(14,165,165,0.06)" : "#fff", cursor: active ? "default" : "pointer", fontFamily: "inherit" }}>
                      {ribbon && (
                        <span style={{ position: "absolute", top: -11, insetInlineStart: "50%", transform: "translateX(-50%)", background: "#CA8A04", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}>{ribbon}</span>
                      )}
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: active ? "#0b7d7d" : "#374151" }}>{label}</div>
                      <div style={{ fontSize: 12.5, color: "#6b7280", marginTop: 2 }}>{sub}</div>
                    </button>
                  );
                  return (
                    <div style={{ margin: "14px 0 2px" }}>
                      <div style={{ ...styles.muted, marginBottom: 8 }}>{c.cycleQ}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {opt(c.monthlyLabel, `${amt(monthlyT)} ${c.perMonth}`, tier.cycle === "monthly", null, () => { if (tier.cycle !== "monthly") switchCycle(monthlyId); })}
                        {opt(c.yearlyLabel, `${amt(yearlyT)} ${c.perYear}`, tier.cycle === "yearly", c.yearlyRibbon, () => { if (tier.cycle !== "yearly") switchCycle(yearlyId); })}
                      </div>
                    </div>
                  );
                })()}
                <div style={styles.summaryRow}>
                  <span style={styles.muted}>{c.afterTrial}</span>
                  <span style={styles.amount}>
                    {lang === "he" ? tier.amountIls : tier.amount} {cycleLabel}
                  </span>
                </div>
                {code && phase === "form" ? (
                  <div style={styles.coupon}>{c.couponApplied(code.toUpperCase())}</div>
                ) : (phase === "form" || phase === "error") ? (
                  <div style={styles.promoWrap}>
                    {!promoOpen ? (
                      <button type="button" style={styles.promoToggle} onClick={() => setPromoOpen(true)}>
                        {c.promoQ}
                      </button>
                    ) : (
                      <div style={styles.promoRow}>
                        <input
                          value={promoVal}
                          onChange={(e) => setPromoVal(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") applyPromo(); }}
                          placeholder={c.promoPlaceholder}
                          autoCapitalize="characters"
                          autoCorrect="off"
                          spellCheck={false}
                          style={styles.promoInput}
                        />
                        <button type="button" style={styles.promoApply} onClick={applyPromo}>
                          {c.promoApply}
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {phase !== "form" && !errMsg && <p style={styles.muted}>{c.loading}</p>}

              <div ref={mountRef} style={{ minHeight: phase === "form" ? 200 : 0 }} />

              {errMsg && (
                <p role="alert" style={styles.error}>
                  {errMsg}
                </p>
              )}

              {phase === "form" && (
                <button
                  type="button"
                  style={{
                    ...styles.payButton,
                    opacity: elementReady && !submitting ? 1 : 0.6,
                    cursor: elementReady && !submitting ? "pointer" : "default",
                  }}
                  disabled={!elementReady || submitting}
                  onClick={onPay}
                >
                  {submitting ? c.processing : c.payButton}
                </button>
              )}

              <p style={styles.secure}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                <span>{c.secureNote}</span>
              </p>
              <p style={styles.cancelNote}>{c.cancelNote}</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "#f6f4ee",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "26px 24px 8px",
    display: "flex",
    justifyContent: "center",
  },
  wordmark: {
    fontWeight: 800,
    fontSize: 30,
    color: "#1f2937",
    textDecoration: "none",
    letterSpacing: "-0.02em",
    display: "inline-block",
  },
  main: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    padding: "8px 16px 48px",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    background: "#ffffff",
    borderRadius: 20,
    border: "1px solid rgba(31,41,55,0.08)",
    boxShadow: "0 10px 30px rgba(31,41,55,0.07)",
    padding: "28px 24px",
    height: "fit-content",
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: "#1f2937",
    margin: "0 0 18px",
    letterSpacing: "-0.01em",
  },
  summary: {
    marginBottom: 20,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 12,
    padding: "6px 0",
  },
  planName: {
    fontWeight: 700,
    color: "#1f2937",
    fontSize: 16,
  },
  amount: {
    fontWeight: 700,
    color: "#1f2937",
    fontSize: 16,
    direction: "ltr" as const,
  },
  trialBox: {
    marginTop: 10,
    background: "rgba(14,165,165,0.08)",
    border: "1px solid rgba(14,165,165,0.25)",
    borderRadius: 12,
    padding: "10px 14px",
  },
  trialToday: {
    fontWeight: 800,
    color: "#0b7d7d",
    fontSize: 15,
  },
  trialLine: {
    color: "#0b7d7d",
    fontSize: 13.5,
    marginTop: 2,
  },
  coupon: {
    marginTop: 10,
    fontSize: 13.5,
    color: "#7C3AED",
    fontWeight: 600,
  },
  promoWrap: {
    marginTop: 10,
  },
  promoToggle: {
    background: "none",
    border: "none",
    padding: 0,
    color: "#0b7d7d",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    textDecoration: "underline",
  },
  promoRow: {
    display: "flex",
    gap: 8,
    alignItems: "stretch",
  },
  promoInput: {
    flex: 1,
    minWidth: 0,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(31,41,55,0.18)",
    fontSize: 16, // 16px avoids iOS Safari zoom-on-focus
    fontFamily: "inherit",
    textTransform: "uppercase",
  },
  promoApply: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    background: "#1f2937",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    flexShrink: 0,
  },
  muted: {
    color: "#6b7280",
    fontSize: 14,
    margin: 0,
  },
  error: {
    color: "#b91c1c",
    fontSize: 14,
    margin: "12px 0 0",
  },
  payButton: {
    width: "100%",
    marginTop: 18,
    padding: "14px 16px",
    borderRadius: 14,
    border: "none",
    background: "#0EA5A5",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer",
  },
  primaryLink: {
    display: "inline-block",
    marginTop: 8,
    padding: "12px 18px",
    borderRadius: 14,
    background: "#0EA5A5",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 15,
    textDecoration: "none",
  },
  secure: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#6b7280",
    fontSize: 12.5,
    margin: "14px 0 0",
  },
  cancelNote: {
    color: "#6b7280",
    fontSize: 12.5,
    margin: "6px 0 0",
  },
};

import { INDIVIDUAL_PRICE_IDS } from "@/lib/individual-prices";
import { tiktokContextFromRequest, tiktokEventsEnabled } from "@/lib/tiktok-events";
import { NextRequest, NextResponse } from "next/server";
import { isIosAppUA } from "@/lib/native-app";
import Stripe from "stripe";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { utmMetaFromClient, utmMetaFromUserDoc, type UtmMeta } from "@/lib/utm-meta";
import { isNewSchoolsPrice, NEW_SCHOOLS_PRICE_IDS } from "@/lib/schools-prices";
import { chargeCurrency } from "@/lib/pricing-currency";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Every MONTHLY paid tier (Clear, Deep, Family) grants a 14-day trial.
// Yearly plans never get a trial — they're committing 12 months up
// front and the savings already incentivise the buy. The CTA text on
// /pricing for all three monthly tiers reads "Try 14 days free" so
// the checkout behaviour has to honour that promise.
const TRIAL_DAYS = 14;
const CLEAR_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_CLEAR_MONTHLY ?? "";
const CLEAR_YEARLY_PRICE_ID = process.env.STRIPE_PRICE_CLEAR_YEARLY ?? "";
const DEEP_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_DEEP_MONTHLY ?? "";
const DEEP_YEARLY_PRICE_ID = process.env.STRIPE_PRICE_DEEP_YEARLY ?? "";
const FAMILY_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_FAMILY_MONTHLY ?? "";
const FAMILY_YEARLY_PRICE_ID = process.env.STRIPE_PRICE_FAMILY_YEARLY ?? "";
const SCHOOLS_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_SCHOOLS_MONTHLY ?? "";
const SCHOOLS_YEARLY_PRICE_ID = process.env.STRIPE_PRICE_SCHOOLS_YEARLY ?? "";
const SCHOOLS_MEDIUM_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_SCHOOLS_MEDIUM_MONTHLY ?? "";
const SCHOOLS_MEDIUM_YEARLY_PRICE_ID = process.env.STRIPE_PRICE_SCHOOLS_MEDIUM_YEARLY ?? "";
const SCHOOLS_LARGE_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_SCHOOLS_LARGE_MONTHLY ?? "";
const SCHOOLS_LARGE_YEARLY_PRICE_ID = process.env.STRIPE_PRICE_SCHOOLS_LARGE_YEARLY ?? "";

function isFamilyPriceId(priceId: string): boolean {
  return (
    (!!FAMILY_MONTHLY_PRICE_ID && priceId === FAMILY_MONTHLY_PRICE_ID) ||
    (!!FAMILY_YEARLY_PRICE_ID && priceId === FAMILY_YEARLY_PRICE_ID)
  );
}

function isSchoolsPriceId(priceId: string): boolean {
  return (
    (!!SCHOOLS_MONTHLY_PRICE_ID && priceId === SCHOOLS_MONTHLY_PRICE_ID) ||
    (!!SCHOOLS_YEARLY_PRICE_ID && priceId === SCHOOLS_YEARLY_PRICE_ID) ||
    (!!SCHOOLS_MEDIUM_MONTHLY_PRICE_ID && priceId === SCHOOLS_MEDIUM_MONTHLY_PRICE_ID) ||
    (!!SCHOOLS_MEDIUM_YEARLY_PRICE_ID && priceId === SCHOOLS_MEDIUM_YEARLY_PRICE_ID) ||
    (!!SCHOOLS_LARGE_MONTHLY_PRICE_ID && priceId === SCHOOLS_LARGE_MONTHLY_PRICE_ID) ||
    (!!SCHOOLS_LARGE_YEARLY_PRICE_ID && priceId === SCHOOLS_LARGE_YEARLY_PRICE_ID) ||
    isNewSchoolsPrice(priceId)
  );
}

// Every paid price (monthly OR yearly) grants the 14-day trial.
// Gadi 2026-06-28 audit (pricing council) flagged the previous
// monthly-only trial as backwards: yearly plans are higher commitment
// and need MORE trust, not less. Yearly buyers now get the same 14
// days to bail before the card charges, which removes the friction
// of "should I risk $89 now or take the safer $8.99/mo." path.
const ALL_PAID_PRICE_IDS = new Set(
  [
    CLEAR_MONTHLY_PRICE_ID,
    CLEAR_YEARLY_PRICE_ID,
    DEEP_MONTHLY_PRICE_ID,
    DEEP_YEARLY_PRICE_ID,
    FAMILY_MONTHLY_PRICE_ID,
    FAMILY_YEARLY_PRICE_ID,
    SCHOOLS_MONTHLY_PRICE_ID,
    SCHOOLS_YEARLY_PRICE_ID,
    SCHOOLS_LARGE_MONTHLY_PRICE_ID,
    SCHOOLS_LARGE_YEARLY_PRICE_ID,
    ...NEW_SCHOOLS_PRICE_IDS,
    ...INDIVIDUAL_PRICE_IDS,
  ].filter(Boolean),
);

// Stripe HOSTED Checkout supports only a fixed locale list — and Hebrew
// is NOT on it (that omission is the whole reason the in-app Payment
// Element exists for /checkout). Anything Stripe doesn't support must
// fall back to "auto" or the API throws "Invalid locale" and no session
// is created. This set is the intersection of Gadit's UI languages with
// Stripe's supported locales; the rest (he, ar, hi, am, uk, fa, zu) go
// to "auto" (browser Accept-Language). Do NOT add "he" back here.
const STRIPE_LOCALES = new Set([
  "en", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja",
  "tr", "pl", "id", "nl", "el",
]);

/** Lang prefix for return URLs — mirrors buildHref: English is the
 *  canonical unprefixed surface, every other lang gets /<lang>. */
function langPrefix(lang: string): string {
  if (!lang || lang === "en") return "";
  return `/${lang}`;
}

export async function POST(req: NextRequest) {
  try {
    // Google Play consumption-only: no purchase may be initiated from inside
    // the Play app. Middleware skips /api, so guard here too. The iOS app
    // (App Review 3.1.1) is recognised by its user agent.
    if (req.cookies.get("gadit_play")?.value === "1" || isIosAppUA(req.headers.get("user-agent"))) {
      return NextResponse.json({ error: "not_available_in_app" }, { status: 403 });
    }
    const { priceId, lang: rawLang, utm } = await req.json();
    if (!priceId) return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    const lang = typeof rawLang === "string" && /^[a-z]{2,3}(-[A-Z]{2})?$/.test(rawLang) ? rawLang : "en";

    // Resolve user from the verified Firebase ID token, NOT from a client-supplied
    // userId. Otherwise a malicious user could start a checkout that credits a
    // different account on webhook completion.
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }
    let decoded;
    try {
      decoded = await getAdminAuth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }
    const userId = decoded.uid;
    const userEmail = decoded.email ?? undefined;

    // Campaign attribution (2026-10-19): the visitor's last tagged visit,
    // else the first-touch fields saved at signup. Copied onto the session
    // AND the subscription metadata. Best-effort, never blocks checkout.
    let utmMeta: UtmMeta | null = utmMetaFromClient(utm);
    if (!utmMeta) {
      try {
        const snap = await getAdminDb().collection("users").doc(userId).get();
        utmMeta = utmMetaFromUserDoc(snap.data());
      } catch (e) {
        console.warn("[create-checkout] utm lookup failed (non-blocking):", e);
      }
    }

    // (Removed) Email-verification gate that was blocking checkout.
    // Firebase's default verification email goes through their generic
    // sender and is reliably classified as spam by Gmail / Outlook /
    // Seznam (Czech), so non-Google sign-ups got stuck behind a wall
    // they couldn't get past — multiple beta testers, including a
    // user in the Czech Republic trying the Clear trial, hit this and
    // never received the email. Stripe Checkout itself requires a real
    // payment instrument (card + billing address + cardholder name),
    // which is a substantially stronger 'this is a real human who can
    // be billed' check than email round-trip. The verification email
    // is still sent on signup — verified emails are still nicer for
    // password resets and receipts — but it's no longer load-bearing
    // for purchase.

    // Every paid price (Clear / Deep / Family / Schools, monthly or
    // yearly, Small or Large) grants the 14-day trial. The earlier
    // "monthly only" rule was reversed in the 2026-06-28 pricing
    // audit — see ALL_PAID_PRICE_IDS comment above.
    const grantsTrial = ALL_PAID_PRICE_IDS.has(priceId);

    const isFamily = isFamilyPriceId(priceId);
    const isSchools = isSchoolsPriceId(priceId);

    // Success URL routes the buyer to the right post-checkout home:
    //   Family   → /family?welcome=1     (parent sees the "add your kids" state)
    //   Schools  → /schools?welcome=1    (principal sees the "add your classes" state)
    //   Other    → /?success=1           (single-user checkout, lands on home)
    // Both URLs carry the user's language prefix so a Hebrew buyer
    // returns to /he/... and not the English site. Launch QA 2026-07-03.
    // Google Play Subscriptions policy wants the trial/renewal terms called out
    // in the payment cart itself, not only on the offer page. Stripe surfaces
    // this via custom_text.submit.message. All 33 UI languages (en is the fallback).
    const cartTerms: Record<string, string> = {
      he: "14 יום ניסיון חינם. במהלך הניסיון לא מחייבים אותך. בסיום, הכרטיס מחויב בסכום המוצג למעלה, והמנוי מתחדש בכל תקופה עד שמבטלים. אפשר לבטל בכל רגע לפני תום הניסיון, מהחשבון שלך ב-Gadit, בלי חיוב.",
      en: "14-day free trial. You are not charged during the trial. When it ends, your card is charged the amount shown above and the subscription renews each period until you cancel. Cancel anytime before the trial ends, from your Gadit account, and you won't be charged.",
      ar: "تجربة مجانية لمدة 14 يوماً. لا يتم خصم أي مبلغ خلال التجربة. عند انتهائها يُخصم من بطاقتك المبلغ المعروض أعلاه، ويتجدد الاشتراك في كل فترة حتى تلغيه. يمكنك الإلغاء في أي وقت قبل انتهاء التجربة، من حسابك في Gadit، ولن يتم خصم أي مبلغ.",
      ru: "14 дней бесплатно. Во время пробного периода деньги не списываются. Когда он закончится, с карты спишется сумма, указанная выше, и подписка будет продлеваться каждый период, пока вы её не отмените. Отменить можно в любой момент до конца пробного периода в аккаунте Gadit, и списания не будет.",
      es: "14 días de prueba gratis. No se te cobra nada durante la prueba. Cuando termina, se cobra en tu tarjeta el importe indicado arriba y la suscripción se renueva cada periodo hasta que canceles. Cancela cuando quieras antes de que termine la prueba, desde tu cuenta de Gadit, y no se te cobrará.",
      pt: "14 dias de teste grátis. Não é cobrado nada durante o teste. Quando termina, o seu cartão é cobrado pelo valor indicado acima e a assinatura renova-se a cada período até cancelar. Cancele quando quiser antes do fim do teste, na sua conta Gadit, e não será cobrado.",
      fr: "14 jours d'essai gratuit. Vous n'êtes pas débité pendant l'essai. À la fin, votre carte est débitée du montant indiqué ci-dessus et l'abonnement se renouvelle à chaque période jusqu'à ce que vous annuliez. Annulez à tout moment avant la fin de l'essai, depuis votre compte Gadit, et vous ne serez pas débité.",
      de: "14 Tage kostenlos testen. Während der Testphase wird nichts berechnet. Danach wird Ihre Karte mit dem oben angezeigten Betrag belastet, und das Abo verlängert sich jeden Zeitraum, bis Sie kündigen. Kündigen Sie jederzeit vor Ende der Testphase in Ihrem Gadit-Konto, dann wird nichts berechnet.",
      cs: "14 dní zdarma. Během zkušební doby vám nic neúčtujeme. Po jejím skončení vám z karty strhneme částku uvedenou výše a předplatné se každé období obnovuje, dokud ho nezrušíte. Zrušit můžete kdykoli před koncem zkušební doby ve svém účtu Gadit, a nic vám nebude účtováno.",
      sk: "14 dní zadarmo. Počas skúšobnej doby vám nič neúčtujeme. Po jej skončení vám z karty strhneme sumu uvedenú vyššie a predplatné sa každé obdobie obnovuje, kým ho nezrušíte. Zrušiť môžete kedykoľvek pred koncom skúšobnej doby vo svojom účte Gadit, a nič vám nebude účtované.",
      it: "14 giorni di prova gratuita. Durante la prova non ti viene addebitato nulla. Alla fine, sulla tua carta viene addebitato l'importo indicato sopra e l'abbonamento si rinnova a ogni periodo finché non annulli. Annulla quando vuoi prima della fine della prova, dal tuo account Gadit, e non ti verrà addebitato nulla.",
      ja: "14日間の無料トライアルです。トライアル中は料金はかかりません。終了後、上に表示された金額がカードに請求され、解約するまで期間ごとに自動更新されます。トライアル終了前ならいつでもGaditのアカウントから解約でき、料金はかかりません。",
      hi: "14 दिन का मुफ़्त ट्रायल। ट्रायल के दौरान कोई शुल्क नहीं लिया जाता। ट्रायल ख़त्म होने पर ऊपर दिखाई गई राशि आपके कार्ड से ली जाती है, और रद्द करने तक हर अवधि में नवीनीकरण होता है। ट्रायल ख़त्म होने से पहले कभी भी अपने Gadit खाते से रद्द करें, कोई शुल्क नहीं लगेगा।",
      am: "የ14 ቀን ነጻ ሙከራ። በሙከራው ወቅት ምንም ክፍያ አይጠየቁም። ሲያበቃ ከላይ የሚታየው መጠን ከካርድዎ ይቆረጣል፣ እስኪሰርዙም ድረስ በየጊዜው ይታደሳል። ሙከራው ከማብቃቱ በፊት በማንኛውም ጊዜ ከGadit መለያዎ መሰረዝ ይችላሉ፣ ክፍያም አይጠየቁም።",
      uk: "14 днів безкоштовно. Під час пробного періоду кошти не списуються. Коли він завершиться, з картки спишеться сума, вказана вище, і підписка подовжуватиметься щоперіоду, доки ви її не скасуєте. Скасувати можна будь-коли до кінця пробного періоду в акаунті Gadit, і списання не буде.",
      tr: "14 gün ücretsiz deneme. Deneme süresince ücret alınmaz. Deneme bittiğinde yukarıda gösterilen tutar kartından tahsil edilir ve abonelik iptal edene kadar her dönem yenilenir. Deneme bitmeden önce istediğin zaman Gadit hesabından iptal edebilirsin, ücret alınmaz.",
      pl: "14 dni za darmo. W okresie próbnym nic nie pobieramy. Po jego zakończeniu z Twojej karty zostanie pobrana kwota podana powyżej, a subskrypcja odnawia się co okres, dopóki jej nie anulujesz. Możesz anulować w dowolnym momencie przed końcem okresu próbnego, na swoim koncie Gadit, i nic nie zapłacisz.",
      fa: "14 روز آزمایش رایگان. در دوره آزمایشی هزینه‌ای کسر نمی‌شود. پس از پایان آن، مبلغ نمایش‌داده‌شده در بالا از کارت شما کسر می‌شود و اشتراک در هر دوره تمدید می‌شود تا زمانی که لغوش کنید. هر زمان پیش از پایان دوره آزمایشی می‌توانید از حساب Gadit خود لغو کنید، و هزینه‌ای کسر نمی‌شود.",
      id: "Uji coba gratis 14 hari. Anda tidak ditagih selama uji coba. Setelah berakhir, kartu Anda ditagih sebesar jumlah di atas dan langganan diperpanjang setiap periode sampai Anda membatalkannya. Batalkan kapan saja sebelum uji coba berakhir, dari akun Gadit Anda, dan Anda tidak akan ditagih.",
      nl: "14 dagen gratis proberen. Tijdens de proefperiode betaal je niets. Daarna wordt het bedrag hierboven van je kaart afgeschreven en wordt het abonnement elke periode verlengd tot je opzegt. Zeg op elk moment op voor het einde van de proefperiode, in je Gadit-account, en je betaalt niets.",
      el: "14 ημέρες δωρεάν δοκιμή. Κατά τη δοκιμή δεν χρεώνεσαι. Όταν λήξει, η κάρτα σου χρεώνεται το ποσό που εμφανίζεται παραπάνω και η συνδρομή ανανεώνεται κάθε περίοδο μέχρι να την ακυρώσεις. Ακύρωσε οποιαδήποτε στιγμή πριν λήξει η δοκιμή, από τον λογαριασμό σου στο Gadit, και δεν θα χρεωθείς.",
      zu: "Izinsuku ezingu-14 zokuzama mahhala. Awukhokhiswa lutho ngesikhathi sokuzama. Uma kuphela, ikhadi lakho likhokhiswa inani elikhonjiswe ngenhla, futhi okubhaliselwe kuvuseleleka isikhathi ngasinye uze ukhansele. Khansela noma nini ngaphambi kokuthi isikhathi sokuzama siphele, ku-akhawunti yakho ye-Gadit, futhi ngeke ukhokhiswe.",
  xh: "Uvavanyo lwasimahla lweentsuku ezili-14. Awuhlawuliswa ngexesha lovavanyo. Xa luphela, ikhadi lakho lihlawuliswa imali eboniswe ngentla kwaye umrhumo uyahlaziywa kwixesha ngalinye de urhoxise. Rhoxisa nanini na ngaphambi kokuba uvavanyo luphele, kwiakhawunti yakho ye-Gadit, kwaye akuyi kuhlawuliswa.",
  nso: "Teko ya mahala ya matšatši a 14. Ga o lefišwe nakong ya teko. Ge e fela, karata ya gago e lefišwa tšhelete ye e bontšhitšwego ka godimo gomme peeletšo e mpshafala nako ye nngwe le ye nngwe go fihlela o e khansela. Khansela nako efe goba efe pele teko e fela, go tšwa akhaontong ya gago ya Gadit, gomme o ka se lefišwe.",
  tn: "Teko ya mahala ya malatsi a le 14. Ga o duedisiwe ka nako ya teko. Fa e fela, karata ya gago e duedisiwa tlhwatlhwa e e bontshitsweng fa godimo mme ikwadiso e ntšhafadiwa nako nngwe le nngwe go fitlha o e khansela. Khansela nako nngwe le nngwe pele teko e fela, mo akhaontong ya gago ya Gadit, mme ga o kitla o duedisiwa.",
  st: "Nako ya teko ya mahala ya matsatsi a 14. Ha o lefiswe nakong ya teko. Ha e fela, karete ya hao e lefiswa tjhelete e bontshitsweng ka hodimo mme ngodiso e ntjhafatswa nako le nako ho fihlela o e emisa. Emisa nako efe kapa efe pele nako ya teko e fela, akhaonteng ya hao ya Gadit, mme o ke ke wa lefiswa.",
  ts: "Ndzingo wa mahala wa masiku ya 14. A mi hakerisiwi hi nkarhi wa ndzingo. Loko wu hela, khadi ra n'wina ri hakerisiwa mali leyi kombisiweke laha henhla naswona mbhaliso wu pfuxetiwa nkarhi wun'wana na wun'wana ku fikela loko mi khansela. Khanselani nkarhi wun'wana na wun'wana emahlweni ka loko ndzingo wu hela, eka akhawunti ya n'wina ya Gadit, kutani a mi nge hakerisiwi.",
  ss: "Kulinga kwamahhala kwemalanga langu-14. Awukhokhiswa ngesikhatsi sekulinga. Nakuphela, likhadi lakho likhokhiswa lemali lekhonjiswe ngetulu, futsi kubhalisa kuchubeka sikhatsi ngasinye kuze ukhansele. Khansela nobe nini ngaphambi kwekutsi kuphele kulinga, ku-akhawunti yakho ye-Gadit, futsi ngeke ukhokhiswe.",
  ve: "Tshilingo tsha mahala tsha maḓuvha a 14. A ni badelisi nga tshifhinga tsha tshilingo. Musi tshi tshi fhela, garaṱa yaṋu i ḓo badeliswa mutengo wo sumbedzwaho afho nṱha nahone ṅwaliso u ḓo vusuluswa nga tshifhinga tshiṅwe na tshiṅwe tsha mbadelo u swika ni tshi khansela. Khanselani tshifhinga tshiṅwe na tshiṅwe phanḓa ha musi tshilingo tshi tshi fhela, kha akhaunthu yaṋu ya Gadit, nahone a ni nga badelisi.",
  nr: "Ukulinga kwamahala kwamalanga ali-14. Awubhadeliswa litho ngesikhathi sokulinga. Nakuphela, ikarada yakho ibhadeliswa inani elitjengiswe ngaphezulu begodu ukubhalisela kuyavuseleleka isikhathi ngasinye bekube ukhansela. Khansela nanyana kunini ngaphambi kobana ukulinga kuphele, ku-akhawunti yakho ye-Gadit, begodu angeze wabhadeliswa.",
      vi: "Dùng thử miễn phí 14 ngày. Bạn không bị tính phí trong thời gian dùng thử. Khi kết thúc, thẻ của bạn sẽ bị trừ số tiền hiển thị ở trên và gói đăng ký tự gia hạn mỗi kỳ cho đến khi bạn hủy. Hủy bất cứ lúc nào trước khi hết thời gian dùng thử, trong tài khoản Gadit của bạn, và bạn sẽ không bị tính phí.",
      fil: "14 na araw na libreng trial. Hindi ka sisingilin habang trial. Pagkatapos nito, sisingilin sa card mo ang halagang nakikita sa itaas at magre-renew ang subscription bawat panahon hanggang mag-cancel ka. Mag-cancel anumang oras bago matapos ang trial, mula sa Gadit account mo, at hindi ka sisingilin.",
      af: "14 dae gratis proeftydperk. Jy word nie tydens die proeftydperk gehef nie. Wanneer dit eindig, word die bedrag hierbo van jou kaart gehef en die intekening hernu elke tydperk totdat jy kanselleer. Kanselleer enige tyd voor die proeftydperk eindig, in jou Gadit-rekening, en jy word niks gehef nie.",
      sw: "Jaribio la bure la siku 14. Hutozwi chochote wakati wa jaribio. Likiisha, kadi yako inatozwa kiasi kilichoonyeshwa hapo juu na usajili unajirudia kila kipindi hadi utakapoughairi. Ghairi wakati wowote kabla jaribio halijaisha, kutoka kwenye akaunti yako ya Gadit, na hutatozwa.",
      "zh-CN": "14 天免费试用。试用期间不会扣费。试用结束后，将按上方显示的金额从你的卡中扣款，订阅会在每个周期自动续订，直到你取消。在试用结束前随时可以在你的 Gadit 账户中取消，不会产生任何费用。",
      "zh-TW": "14 天免費試用。試用期間不會收費。試用結束後，將依上方顯示的金額從你的卡片扣款，訂閱會在每個週期自動續訂，直到你取消。在試用結束前隨時可以在你的 Gadit 帳戶中取消，不會產生任何費用。",
      ko: "14일 무료 체험입니다. 체험 기간에는 요금이 청구되지 않습니다. 체험이 끝나면 위에 표시된 금액이 카드로 청구되며, 해지할 때까지 기간마다 자동 갱신됩니다. 체험이 끝나기 전에 언제든 Gadit 계정에서 해지하면 요금이 청구되지 않습니다.",
      th: "ทดลองใช้ฟรี 14 วัน ระหว่างทดลองใช้จะไม่มีการเรียกเก็บเงิน เมื่อสิ้นสุด บัตรของคุณจะถูกเรียกเก็บตามจำนวนที่แสดงด้านบน และการสมัครสมาชิกจะต่ออายุทุกรอบจนกว่าคุณจะยกเลิก ยกเลิกได้ทุกเมื่อก่อนสิ้นสุดการทดลองใช้ จากบัญชี Gadit ของคุณ และจะไม่มีการเรียกเก็บเงิน",
      bn: "14 দিনের বিনামূল্যে ট্রায়াল। ট্রায়ালের সময় কোনো টাকা কাটা হয় না। ট্রায়াল শেষ হলে ওপরে দেখানো পরিমাণ আপনার কার্ড থেকে কাটা হয়, আর বাতিল না করা পর্যন্ত প্রতি মেয়াদে সাবস্ক্রিপশন নবায়ন হয়। ট্রায়াল শেষ হওয়ার আগে যেকোনো সময় আপনার Gadit অ্যাকাউন্ট থেকে বাতিল করুন, কোনো টাকা কাটা হবে না।",
      da: "14 dages gratis prøveperiode. Du bliver ikke opkrævet i prøveperioden. Når den slutter, trækkes beløbet ovenfor fra dit kort, og abonnementet fornyes hver periode, indtil du opsiger det. Opsig når som helst inden prøveperioden slutter, fra din Gadit-konto, så bliver du ikke opkrævet.",
      hu: "14 napos ingyenes próbaidő. A próbaidő alatt nem terhelünk semmit. Amikor lejár, a fent látható összeget terheljük a kártyádra, és az előfizetés minden időszakban megújul, amíg le nem mondod. A próbaidő vége előtt bármikor lemondhatod a Gadit-fiókodban, és nem terhelünk semmit.",
    };
    const trialMessage = grantsTrial ? (cartTerms[lang] ?? cartTerms.en) : null;

    const prefix = langPrefix(lang);
    const successPath = isSchools
      ? `${prefix}/schools?welcome=1`
      : isFamily
        ? `${prefix}/family?welcome=1`
        : `${prefix}/?success=1`;
    const cancelPath = `${prefix}/?canceled=1`;

    // Pin the charge currency to the caller's country (currency engine). Only
    // ever a currency that has a Stripe currency_option; usd-only today, so
    // this is usd for everyone and no `currency` is set (Stripe uses the
    // price's default USD). Adding a market makes page and cart localize from
    // one source. See lib/pricing-currency.ts.
    // Only on a localized price (Individual/Family); a school in South Africa
    // keeps the USD-only Schools price (pinning zar there would be a 400).
    const cur = chargeCurrency(req.headers.get("x-vercel-ip-country"), priceId) ?? "usd";

    // TikTok: the browser facts at checkout, read back by the Stripe webhook
    // for StartTrial / Purchase (lib/tiktok-events.ts). Best-effort.
    if (tiktokEventsEnabled()) {
      const ttCtx = tiktokContextFromRequest(req);
      if (Object.keys(ttCtx).length) await getAdminDb().collection("users").doc(userId).set({ tiktokCtx: ttCtx }, { merge: true }).catch(() => {});
    }
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      // Google Play Subscriptions policy requires the currency on the offer
      // page and in the payment cart to match. Stripe Adaptive Pricing (on by
      // default) auto-converts the cart to the buyer's local currency (e.g. a
      // reviewer in the Philippines saw PHP while our pricing shows USD), which
      // triggered a rejection. Pin the cart to a currency we control.
      adaptive_pricing: { enabled: false },
      ...(cur !== "usd" && { currency: cur }),
      payment_method_types: ["card"],
      // Always collect a card, even with a trial — this is the card-required
      // flow (schools go through here so they can't create a card-less trial).
      payment_method_collection: "always",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      client_reference_id: userId,
      // Enable promotion codes so Gadi can ship one-off "first month free"
      // coupons to specific people (school principals, family/friend gifts,
      // launch partners) without having to manually provision their
      // accounts. Coupon codes are created in the Stripe dashboard.
      allow_promotion_codes: true,
      ...(trialMessage && { custom_text: { submit: { message: trialMessage } } }),
      // Checkout page language follows the app UI language when Stripe
      // supports it; otherwise Stripe auto-detects from the browser.
      locale: (STRIPE_LOCALES.has(lang) ? lang : "auto") as NonNullable<Stripe.Checkout.Session["locale"]>,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://gadit.app"}${successPath}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://gadit.app"}${cancelPath}`,
      metadata: {
        userId,
        ...(isFamily && { isFamily: "1" }),
        ...(isSchools && { isSchools: "1" }),
        ...(utmMeta ?? {}),
      },
      // Without a trial the subscription still carries the campaign tag.
      ...(!grantsTrial && utmMeta && { subscription_data: { metadata: utmMeta } }),
      ...(grantsTrial && {
        subscription_data: {
          ...(utmMeta && { metadata: utmMeta }),
          trial_period_days: TRIAL_DAYS,
          // If user cancels during trial → keep access until trial end (Stripe handles this).
          // If trial ends without payment method (shouldn't happen — Checkout collects card) → cancel.
          trial_settings: {
            end_behavior: { missing_payment_method: "cancel" },
          },
        },
      }),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}

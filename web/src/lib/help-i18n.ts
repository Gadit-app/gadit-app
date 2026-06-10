/**
 * Help Center content — categorised troubleshooting Q&A rendered on
 * /contact. Each category becomes a section; each item renders as a
 * native <details> accordion so we get free open/close + a11y without
 * shipping client-side state.
 *
 * Why centralise this:
 * - Same content surfaces from /account ("Need help with billing?"
 *   deep-link to /contact#billing) and the top-bar "Contact" link.
 * - Same i18n shape used by every other text block in the project,
 *   so a future translation pass for sk/it/ja can drop in here with
 *   the same `Object.assign(HELP, {...})` pattern we use elsewhere.
 *
 * Coverage philosophy:
 * - Lead with billing — that's where real users (Ziv) actually get
 *   stuck and pull Gadi onto WhatsApp. Cover every billing surface
 *   the Stripe Customer Portal exposes so the user solves it themself.
 * - Account & sign-in next — Firebase auth gotchas, verification
 *   email spam-folder issue, etc.
 * - Product/usage third — kids mode, voice, offline, reporting
 *   wrong content.
 * - Partner program fourth — Affonso embed + 30%/10% lifetime
 *   model + payout question.
 * - General last — what Gadit is, languages, kids safety, data.
 *
 * Tone: direct, plain, "I" voice. No corporate "we appreciate your
 * patience" filler. Every answer ends with a concrete next step.
 */

import type { Lang } from "./i18n";

export interface HelpItem {
  /** Stable id so we can deep-link via #q-<id>. */
  id: string;
  q: string;
  /** Multi-paragraph answer. Each entry becomes a <p>. Keep paragraphs
      short — readers skim. Use plain text only; if a step list is
      needed, prefix with "1. " / "2. " inside a single paragraph. */
  a: string[];
}

export interface HelpCategory {
  /** Stable id so /account can deep-link via #billing, #account, etc. */
  id: string;
  /** Single-character emoji or short svg-friendly label; rendered as
      a small leading chip on each category header. */
  icon: string;
  title: string;
  items: HelpItem[];
}

export interface HelpContent {
  eyebrow: string;
  heading: string;
  lede: string;
  stillNeedHelpHeading: string;
  stillNeedHelpBody: string;
  emailCta: string;
  responseTime: string;
  categories: HelpCategory[];
}

export const HELP = {} as Record<Lang, HelpContent>;

Object.assign(HELP, {
  en: {
    eyebrow: "Help Center",
    heading: "Find an answer — fast.",
    lede: "Common questions and step-by-step fixes, organised by area. If you don't see your issue, write me directly at the bottom.",
    stillNeedHelpHeading: "Still stuck?",
    stillNeedHelpBody: "Write me directly — I read every message myself and reply within a day or two.",
    emailCta: "Email me",
    responseTime: "Typical reply: within 24–48 hours.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Billing & subscription",
        items: [
          {
            id: "change-card",
            q: "I want to change the credit card on my subscription — how?",
            a: [
              "You can switch to a new card in under a minute without cancelling. Your current subscription keeps running, just on the new card.",
              "1. Sign in at gadit.app and open your Account page (top right). 2. Click \"Manage billing\". 3. A secure Stripe page opens. Click \"Add payment method\", enter the new card, and mark it as Default. 4. Optionally remove the old card.",
              "From the next billing cycle on, everything goes to the new card. The previous charge (already collected) stays on the old card — no refund needed unless you want one specifically.",
            ],
          },
          {
            id: "cancel",
            q: "How do I cancel my subscription?",
            a: [
              "Self-serve, any time. Sign in → Account → Manage billing → Cancel subscription.",
              "Your access continues until the end of the period you already paid for. After that the account drops back to Basic (free) — your saved words, history, and notebook stay safe and accessible.",
              "If you cancel by mistake or change your mind, you can resume the subscription from the same page before the period ends.",
            ],
          },
          {
            id: "switch-plan",
            q: "How do I switch from Clear to Deep (or the other way)?",
            a: [
              "Account → Manage billing → Update subscription → pick the new plan.",
              "Stripe calculates the price difference automatically (pro-rated to the day). If you're upgrading, you'll be charged just the difference for the rest of the current period. If you're downgrading, the credit applies to your next bill.",
            ],
          },
          {
            id: "invoice",
            q: "How do I download an invoice or receipt?",
            a: [
              "Account → Manage billing → Invoice history. Every charge has a downloadable PDF receipt with the billing details you saved.",
              "If you need a different name, address, or tax ID on the invoice (e.g. company name for tax purposes), update your billing details on the same page before downloading — the next receipt will use the new details.",
            ],
          },
          {
            id: "portal-error",
            q: "I clicked \"Manage billing\" but got an error — what now?",
            a: [
              "Two common causes: (a) your account doesn't have an active Stripe subscription, or (b) your subscription is on a card that was never confirmed in your Stripe customer record.",
              "Easy first check: sign out, sign back in with the email you used at checkout, and try again. If it still fails, write me with your account email and I'll fix it from my side in a minute.",
            ],
          },
          {
            id: "autorenew",
            q: "Will my subscription auto-renew?",
            a: [
              "Yes — monthly plans renew every month, annual plans renew every year on the same date. You can see the next billing date in your account and on Stripe's portal.",
              "If you don't want auto-renew, cancel any time before the renewal date. Cancellation isn't immediate — you keep access through the period you already paid for.",
            ],
          },
          {
            id: "refund",
            q: "Can I get a refund?",
            a: [
              "Yes — if you bought less than 14 days ago and you didn't use the service much, write me with your account email and a short note about why. I refund those without a fight.",
              "If it's been more than 14 days, I'll handle it case by case. Cancel the subscription so it doesn't keep renewing, and email me.",
            ],
          },
          {
            id: "unknown-charge",
            q: "I see a charge I don't recognise.",
            a: [
              "Charges appear as \"GADIT\" or \"GADIT.APP\" with $2.99 (Clear monthly), $4.99 (Deep monthly), $29.99 (Clear yearly), or $49.99 (Deep yearly). If it doesn't match — it might be from a different service.",
              "If you're certain it's not yours, don't dispute through your bank yet — write me directly first with the date and amount. I'll find it, explain what it is, and refund if needed. A bank dispute permanently flags your email so resolving it through me is faster and safer.",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Account & sign-in",
        items: [
          {
            id: "no-verification-email",
            q: "I didn't receive my verification email.",
            a: [
              "Check spam/promotions folder first — Gmail and Outlook sometimes route account emails there until you mark one as \"Not spam\".",
              "If it's not there, the email might have been mistyped at signup. Try signing up again and double-check the address. If you used Google sign-up, no verification email is needed.",
            ],
          },
          {
            id: "forgot-password",
            q: "I forgot my password.",
            a: [
              "Open the sign-in dialog and click \"Forgot password?\" — enter the email you use for Gadit and you'll get a reset link within a minute or two.",
              "If the email doesn't arrive, check spam. If it still doesn't arrive, you might have signed up with Google instead of email/password — try the \"Continue with Google\" button.",
            ],
          },
          {
            id: "wrong-credentials",
            q: "I'm sure my password is right but it says \"Wrong email or password\".",
            a: [
              "Three things to check: (1) capslock, (2) trailing space when copy-pasting, (3) you signed up with Google rather than a password (use \"Continue with Google\" instead).",
              "Still stuck? Reset the password from the same dialog — sets you up clean.",
            ],
          },
          {
            id: "google-fails",
            q: "Google sign-in doesn't work.",
            a: [
              "Most common cause: your browser is blocking third-party cookies or pop-ups for gadit.app. Allow them in the address-bar permissions and try again.",
              "If you're in incognito mode, Google sign-in is restricted on purpose. Switch to a normal browser window.",
            ],
          },
          {
            id: "change-email",
            q: "How do I change the email on my account?",
            a: [
              "Account → click your email → Change email. You'll need to confirm the new address before it sticks. Your subscription, history, and notebook all carry over.",
              "If the email is tied to a Stripe customer, update it on the Stripe billing portal too so future receipts go to the new address.",
            ],
          },
          {
            id: "delete-account",
            q: "How do I delete my account?",
            a: [
              "Account → bottom of the page → Delete account. This is permanent: your subscription is cancelled, your notebook + history are erased, and the email is freed up for a fresh signup.",
              "Stripe records of past charges remain (we're legally required to keep them for accounting). Nothing else stays.",
            ],
          },
          {
            id: "share-account",
            q: "Can my partner / child share my account?",
            a: [
              "One signed-in user per account at a time. Kids mode lets a single Clear/Deep account serve a parent + child — flip the toggle and definitions render kid-friendly without separate logins.",
              "For two adults who both want separate notebooks and progress, take two accounts. (Clear is $2.99/mo each — still cheap.)",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Using Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "I think the definition is wrong — what do I do?",
            a: [
              "Every result page has a small \"Report\" button at the bottom — tap it, pick a category (definition, etymology, example, idiom, kids explanation, etc.) and write a short note. It comes straight to me and I review every report.",
              "Don't worry about being too picky — the dictionary improves from this feedback faster than from anything else.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Kids mode isn't changing the explanation.",
            a: [
              "Kids mode only flips text where the word already has a kid-friendly explanation generated. For brand-new words you've just looked up, give it 10–15 seconds — the kid-friendly version is generated on the fly the first time.",
              "Also: kids mode requires Clear or Deep. If you're on Basic, the toggle will prompt you to upgrade. Anonymous users get prompted to sign up.",
            ],
          },
          {
            id: "voice-fails",
            q: "Voice search doesn't work.",
            a: [
              "Voice search needs microphone permission. Most browsers ask once per site — if you accidentally said \"Block\", you'll need to flip it back manually: click the lock/info icon next to gadit.app in the address bar → Site settings → Microphone → Allow.",
              "On Safari iOS, microphone access requires a Settings → Safari → Microphone toggle as well. Voice is currently a Clear/Deep feature; Basic users see the mic but get a sign-in prompt.",
            ],
          },
          {
            id: "no-image",
            q: "I can't generate an image for the word.",
            a: [
              "Image generation is a Clear/Deep feature with a monthly quota: Clear gets 30 images/month, Deep gets 100. If you've used up the quota, you'll see a wall — it resets on the 1st of every month.",
              "If you're under the quota and still seeing failures, it's usually transient — try again in 30 seconds. Persistent failures are a bug; please report from the word page.",
            ],
          },
          {
            id: "save-word",
            q: "How do I save a word to my notebook?",
            a: [
              "On any word result page, tap \"Save to notebook\" near the title. The notebook is a Clear/Deep feature where you can review saved words later, see them on a galaxy view, and run smart-practice sessions (Deep).",
              "Anything you save is available offline once you've opened the word once — the offline pack also caches the most-popular words in your language.",
            ],
          },
          {
            id: "offline",
            q: "How does offline mode work?",
            a: [
              "Words you've already viewed are cached locally — open them again without internet and they load instantly. The full offline pack (top words in your language) downloads on demand from the notebook page.",
              "Searching for a brand-new word still requires connectivity (we have to ask the AI to define it). Offline cache is for words you've already explored.",
            ],
          },
          {
            id: "slow",
            q: "The app feels slow.",
            a: [
              "First lookup of a word is the slowest because we generate the full result fresh from AI — usually 4–8 seconds. Subsequent lookups of the same word are instant (served from cache).",
              "If everything feels slow, try refreshing the page (cmd/ctrl + shift + R for a hard refresh). Persistent slowness across pages — please email me with your country and browser so I can check the route to our servers from there.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Partner program",
        items: [
          {
            id: "join-partner",
            q: "How do I become a Gadit partner?",
            a: [
              "Open /affiliates from any page and click \"Get your link\". You'll be signed in automatically (or prompted to sign up). The dashboard mints your unique link instantly — no waiting for approval.",
              "The partner program is for Clear/Deep subscribers only — to recommend Gadit credibly, we ask that you use it yourself first. Upgrade from Pricing if you're on Basic.",
            ],
          },
          {
            id: "commission-model",
            q: "How are commissions calculated?",
            a: [
              "30% of every subscription paid via your link, every month, for the first 12 months. After 12 months the rate drops to 0% for everyone — unless you've hit Active Partner status (10 paying subscribers active), in which case you keep 10% lifetime on all of your subscribers.",
              "Annual subscriptions get a one-time 15% bonus on the first payment, instead of 30% monthly.",
            ],
          },
          {
            id: "payout",
            q: "When do I get paid?",
            a: [
              "Monthly, once your balance crosses $50. We use the payout method you set in the dashboard (bank transfer, PayPal, etc.). $50 is the minimum threshold, not a cap — you can earn far more, you just receive when you cross.",
              "Earnings clear 30 days after the subscription payment to allow for refund windows. So a January subscription pays you in early February (cleared) and shows up in your next $50-or-more cycle.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "I joined but my dashboard is empty.",
            a: [
              "Stats show after the first click on your link. Empty just means nobody's clicked yet — go share the link. The dashboard updates in near-real-time once activity starts.",
              "If you've shared and someone's signed up but the dashboard isn't reflecting it, write me with the rough time of signup and I'll check the attribution.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "General",
        items: [
          {
            id: "what-is-gadit",
            q: "What is Gadit?",
            a: [
              "A multilingual dictionary built to make a word click — not just give a one-line definition. Every word opens with all its meanings, real examples per meaning, idioms, etymology, an optional AI image, and (with Clear/Deep) a kid-friendly explanation, compose-your-own-sentence with feedback, and quizzes.",
              "Currently 12 UI languages. The verb \"to GAD a word\" = to understand it all the way through.",
            ],
          },
          {
            id: "languages",
            q: "Which languages do you support?",
            a: [
              "Interface: English, Hebrew, Arabic, Russian, Spanish, Portuguese, French, German, Czech, Slovak, Italian, Japanese.",
              "You can look up a word in any of those languages and get the definition + examples + everything else in your chosen UI language. Hebrew/Arabic are fully RTL and use their native fonts.",
            ],
          },
          {
            id: "kid-safety",
            q: "Is Gadit safe for kids?",
            a: [
              "Yes — Kids mode runs every definition and example through the same AI we use for adult content, with explicit instructions to keep the explanation simple, concrete, and age-appropriate (5–10 year-old level). No user-generated content is ever shown to kids.",
              "Account ownership is 13+ by COPPA/GDPR-K compliance. The standard model is a parent's account that the parent uses with their kid — which is exactly what Kids mode is built for.",
            ],
          },
          {
            id: "data",
            q: "Where is my data stored? Do you sell it?",
            a: [
              "Account, history, notebook, and generated images are stored securely (Firebase, encrypted at rest). We don't sell or share your data with anyone — full details in the Privacy Policy.",
              "You can export your notebook or delete your account at any time from the Account page.",
            ],
          },
          {
            id: "contact-direct",
            q: "How do I reach you directly?",
            a: [
              "Email support@gadit.app — comes straight to my inbox. I read every message myself and reply within 24–48 hours (often faster).",
              "I prefer email over chat because it gives me a chance to read carefully and reply thoughtfully. Phone support I don't offer yet.",
            ],
          },
        ],
      },
    ],
  },
  he: {
    eyebrow: "מרכז עזרה",
    heading: "מצאו תשובה — מהר.",
    lede: "שאלות נפוצות ופתרונות צעד-אחר-צעד, מסודרים לפי תחום. לא רואים את הבעיה שלכם? תכתבו לי ישירות למטה.",
    stillNeedHelpHeading: "עדיין תקועים?",
    stillNeedHelpBody: "תכתבו לי ישירות — אני קורא כל הודעה בעצמי ועונה תוך יום-יומיים.",
    emailCta: "שלחו לי מייל",
    responseTime: "זמן תגובה אופייני: 24–48 שעות.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "חיוב ומנוי",
        items: [
          {
            id: "change-card",
            q: "אני רוצה להחליף כרטיס אשראי לחיוב המנוי שלי — איך?",
            a: [
              "אפשר להחליף לכרטיס חדש בפחות מדקה, בלי לבטל. המנוי הנוכחי שלכם ממשיך, פשוט עם הכרטיס החדש.",
              "1. היכנסו ל-gadit.app ופתחו את עמוד החשבון (פינה ימנית-עליונה). 2. לחצו על \"ניהול חיוב\". 3. ייפתח מסך מאובטח של Stripe. לחצו \"Add payment method\", הכניסו את הכרטיס החדש, וסמנו אותו כברירת מחדל. 4. אופציונלי — מחקו את הכרטיס הישן.",
              "מהחיוב הבא והלאה הכל ילך לכרטיס החדש. החיוב הקודם (שכבר נגבה) נשאר על הכרטיס הישן — אין צורך בהחזר אלא אם תרצו אחד באופן ספציפי.",
            ],
          },
          {
            id: "cancel",
            q: "איך מבטלים מנוי?",
            a: [
              "אתם יכולים לבטל לבד, בכל רגע. היכנסו → חשבון → ניהול חיוב → Cancel subscription.",
              "הגישה ממשיכה עד סוף התקופה ששילמתם עליה. אחר כך החשבון יורד ל-Basic (חינמי) — המילים השמורות, היסטוריה והמחברת נשמרים ונשארים נגישים.",
              "אם ביטלתם בטעות או שינתם דעתכם, אפשר לחדש את המנוי מאותו עמוד לפני שהתקופה מסתיימת.",
            ],
          },
          {
            id: "switch-plan",
            q: "איך עוברים מ-Clear ל-Deep (או הפוך)?",
            a: [
              "חשבון → ניהול חיוב → Update subscription → בחרו את המסלול החדש.",
              "Stripe מחשב את ההפרש אוטומטית (pro-rata לפי הימים שנותרו). אם משדרגים — תחויבו רק על ההפרש לתקופה הנוכחית. אם משנמכים — הקרדיט יחול על החיוב הבא.",
            ],
          },
          {
            id: "invoice",
            q: "איך מורידים חשבונית או קבלה?",
            a: [
              "חשבון → ניהול חיוב → Invoice history. לכל חיוב יש קבלת PDF להורדה עם פרטי החיוב ששמרתם.",
              "אם צריך שם, כתובת או מספר עוסק שונים על החשבונית (למשל שם חברה לצרכי מס) — עדכנו את פרטי החיוב באותו עמוד לפני ההורדה. הקבלה הבאה תשתמש בפרטים החדשים.",
            ],
          },
          {
            id: "portal-error",
            q: "לחצתי על \"ניהול חיוב\" וקיבלתי שגיאה — מה לעשות?",
            a: [
              "שתי סיבות נפוצות: (א) לחשבון שלכם אין מנוי Stripe פעיל, או (ב) המנוי שלכם על כרטיס שלא אומת ברשומת ה-customer ב-Stripe.",
              "בדיקה ראשונה פשוטה: צאו, היכנסו שוב עם האימייל שבו רכשתם, ונסו שוב. אם זה עדיין לא עובד — תכתבו לי עם האימייל של החשבון ואני אסדר את זה מהצד שלי בדקה.",
            ],
          },
          {
            id: "autorenew",
            q: "המנוי יתחדש אוטומטית?",
            a: [
              "כן — מנויים חודשיים מתחדשים כל חודש, מנויים שנתיים מתחדשים כל שנה באותו תאריך. אפשר לראות את תאריך החיוב הבא בעמוד החשבון וב-Stripe portal.",
              "אם אתם לא רוצים חידוש אוטומטי, בטלו בכל רגע לפני תאריך החידוש. הביטול אינו מיידי — אתם שומרים על הגישה עד סוף התקופה ששילמתם.",
            ],
          },
          {
            id: "refund",
            q: "אפשר לקבל החזר כספי?",
            a: [
              "כן — אם רכשתם לפני פחות מ-14 ימים ולא השתמשתם בשירות הרבה, תכתבו לי עם האימייל של החשבון והסבר קצר. אני מאשר אותם בלי להתעקש.",
              "אם עבר יותר מ-14 ימים, אטפל מקרה-מקרה. בטלו את המנוי כדי שלא יתחדש, ושלחו לי מייל.",
            ],
          },
          {
            id: "unknown-charge",
            q: "אני רואה חיוב שאני לא מזהה.",
            a: [
              "חיובים מופיעים כ-\"GADIT\" או \"GADIT.APP\" עם $2.99 (Clear חודשי), $4.99 (Deep חודשי), $29.99 (Clear שנתי), או $49.99 (Deep שנתי). אם זה לא תואם — זה כנראה משירות אחר.",
              "אם אתם בטוחים שזה לא שלכם, אל תפנו לבנק עם מחלוקת עדיין — תכתבו לי קודם עם התאריך והסכום. אני אמצא, אסביר מה זה, ואחזיר אם צריך. מחלוקת בבנק מסמנת את האימייל שלכם לתמיד, אז דרכי זה מהיר ובטוח יותר.",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "חשבון וכניסה",
        items: [
          {
            id: "no-verification-email",
            q: "לא קיבלתי מייל אימות.",
            a: [
              "בדקו קודם את תיקיית הספאם/קידומים — Gmail ו-Outlook לפעמים מפנים מיילי חשבון לשם עד שמסמנים אחד כ\"לא ספאם\".",
              "אם זה לא שם, אולי הייתה טעות באימייל בהרשמה. נסו להירשם שוב ובדקו את הכתובת. אם נרשמתם דרך Google, לא נדרש מייל אימות.",
            ],
          },
          {
            id: "forgot-password",
            q: "שכחתי סיסמה.",
            a: [
              "פתחו את דיאלוג ההתחברות ולחצו \"שכחת סיסמה?\" — הכניסו את האימייל שאתם משתמשים בו ב-Gadit ותקבלו לינק לאיפוס תוך דקה או שתיים.",
              "אם המייל לא מגיע, בדקו ספאם. אם הוא עדיין לא מגיע, אולי נרשמתם עם Google ולא עם אימייל/סיסמה — נסו את הכפתור \"Continue with Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "אני בטוח שהסיסמה נכונה אבל מקבל \"אימייל או סיסמה שגויים\".",
            a: [
              "שלושה דברים לבדוק: (1) Caps Lock, (2) רווח מיותר אחרי העתקה, (3) נרשמתם עם Google ולא עם סיסמה (השתמשו ב-\"Continue with Google\").",
              "עדיין תקועים? אפסו את הסיסמה מאותו דיאלוג — זה מסדר אתכם נקי.",
            ],
          },
          {
            id: "google-fails",
            q: "התחברות עם Google לא עובדת.",
            a: [
              "הסיבה הנפוצה ביותר: הדפדפן חוסם cookies של צד שלישי או pop-ups עבור gadit.app. אפשרו אותם בהרשאות שורת הכתובת ונסו שוב.",
              "אם אתם במצב גלישה בסתר, התחברות Google מוגבלת בכוונה. עברו לחלון רגיל.",
            ],
          },
          {
            id: "change-email",
            q: "איך משנים את האימייל של החשבון?",
            a: [
              "חשבון → לחיצה על האימייל שלכם → Change email. תצטרכו לאשר את הכתובת החדשה לפני שזה תופס. המנוי, היסטוריה והמחברת — הכל עובר אוטומטית.",
              "אם האימייל קשור ל-customer ב-Stripe, עדכנו אותו גם בפורטל החיוב של Stripe כדי שקבלות עתידיות ילכו לכתובת החדשה.",
            ],
          },
          {
            id: "delete-account",
            q: "איך מוחקים חשבון?",
            a: [
              "חשבון → תחתית העמוד → Delete account. זה לצמיתות: המנוי מבוטל, המחברת + ההיסטוריה נמחקות, והאימייל מתפנה להרשמה חדשה.",
              "רשומות Stripe של חיובים עבר נשארות (חייבים לפי חוק לשמור לצרכי הנהלת חשבונות). שום דבר אחר לא נשאר.",
            ],
          },
          {
            id: "share-account",
            q: "בן הזוג / הילד שלי יכולים לחלוק את החשבון שלי?",
            a: [
              "משתמש מחובר אחד לחשבון בכל רגע. מצב ילדים מאפשר לחשבון Clear/Deep אחד לשרת הורה + ילד — לוחצים על הטוגל וההגדרות מוצגות באופן ידידותי-לילד בלי לוגין נפרד.",
              "לשני מבוגרים שרוצים מחברות ופרוגרס נפרדים, קחו שני חשבונות. (Clear עולה $2.99/חודש לכל אחד — עדיין זול.)",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "שימוש ב-Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "ההגדרה לא נכונה — מה לעשות?",
            a: [
              "בכל עמוד תוצאה יש כפתור \"דיווח\" קטן בתחתית — לחצו עליו, בחרו קטגוריה (הגדרה, אטימולוגיה, דוגמה, ניב, הסבר לילדים וכו') וכתבו הערה קצרה. זה מגיע ישירות אליי ואני בודק כל דיווח.",
              "אל תדאגו להיות יותר מדי קפדנים — המילון משתפר מהפידבק הזה מהר יותר מכל דבר אחר.",
            ],
          },
          {
            id: "kids-not-working",
            q: "מצב ילדים לא מחליף את ההסבר.",
            a: [
              "מצב ילדים מחליף טקסט רק היכן שלמילה כבר יש הסבר ידידותי-לילד שנוצר. למילים חדשות שזה עתה חיפשתם, תנו לזה 10-15 שניות — הגרסה לילדים נוצרת on-the-fly בפעם הראשונה.",
              "כמו כן: מצב ילדים דורש Clear או Deep. אם אתם ב-Basic, הטוגל יזמין אתכם לשדרג. למשתמשים אנונימיים יוצע להירשם.",
            ],
          },
          {
            id: "voice-fails",
            q: "חיפוש קולי לא עובד.",
            a: [
              "חיפוש קולי דורש הרשאת מיקרופון. רוב הדפדפנים שואלים פעם אחת לאתר — אם בטעות אמרתם \"חסום\", צריך להחזיר ידנית: לחצו על אייקון המנעול/מידע ליד gadit.app בשורת הכתובת → Site settings → Microphone → Allow.",
              "ב-Safari iOS, גישה למיקרופון דורשת גם הגדרה ב-Settings → Safari → Microphone. חיפוש קולי הוא כרגע פיצ'ר של Clear/Deep; משתמשי Basic רואים את המיקרופון אבל מקבלים בקשה להירשם.",
            ],
          },
          {
            id: "no-image",
            q: "אני לא מצליח לייצר תמונה למילה.",
            a: [
              "יצירת תמונות היא פיצ'ר של Clear/Deep עם מכסה חודשית: Clear מקבל 30 תמונות/חודש, Deep מקבל 100. אם נגמרה המכסה, תראו חסימה — היא מתאפסת ב-1 לכל חודש.",
              "אם אתם מתחת למכסה ועדיין רואים כשלים, זה בדרך כלל זמני — נסו שוב בעוד 30 שניות. כשלים מתמשכים זה באג; אנא דווחו מעמוד המילה.",
            ],
          },
          {
            id: "save-word",
            q: "איך שומרים מילה במחברת?",
            a: [
              "בכל עמוד תוצאת מילה, לחצו על \"שמור במחברת\" ליד הכותרת. המחברת היא פיצ'ר של Clear/Deep שבו תוכלו לסקור מילים שמורות מאוחר יותר, לראות אותן בתצוגת גלקסיה, ולהריץ אימוני חזרה חכמה (Deep).",
              "כל מה שאתם שומרים זמין offline אחרי שפתחתם את המילה פעם אחת — הופליין pack גם שומר במטמון את המילים הפופולריות בשפה שלכם.",
            ],
          },
          {
            id: "offline",
            q: "איך עובד מצב offline?",
            a: [
              "מילים שראיתם כבר נשמרות במטמון מקומי — פתחו אותן שוב בלי אינטרנט והן יטענו מיידית. הופליין-pack המלא (מילים מובילות בשפה שלכם) מוריד on-demand מעמוד המחברת.",
              "חיפוש מילה חדשה לחלוטין עדיין דורש חיבור (חייבים לבקש מה-AI להגדיר). המטמון offline הוא למילים שכבר חקרתם.",
            ],
          },
          {
            id: "slow",
            q: "האפליקציה מרגישה אטית.",
            a: [
              "החיפוש הראשון של מילה הוא האטי ביותר כי אנחנו מייצרים את התוצאה המלאה מ-AI — בדרך כלל 4-8 שניות. חיפושים חוזרים של אותה המילה מיידיים (מגיעים מהמטמון).",
              "אם הכל מרגיש אטי, נסו לרענן את הדף (cmd/ctrl + shift + R לרענון קשה). איטיות מתמשכת בכל העמודים — אנא שלחו לי מייל עם המדינה והדפדפן שלכם כדי שאוכל לבדוק את הראוט לשרתים מהצד שלכם.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "תוכנית שותפים",
        items: [
          {
            id: "join-partner",
            q: "איך אני נהיה שותף של Gadit?",
            a: [
              "פתחו את /affiliates מכל עמוד ולחצו \"קבלו את הלינק שלכם\". תיכנסו אוטומטית (או יתבקש מכם להירשם). הדאשבורד מייצר את הלינק הייחודי שלכם מיידית — אין המתנה לאישור.",
              "תוכנית השותפים היא רק למנויי Clear/Deep — כדי להמליץ על Gadit בצורה אמינה, אנחנו מבקשים שתשתמשו בעצמכם קודם. שדרגו מ-Pricing אם אתם ב-Basic.",
            ],
          },
          {
            id: "commission-model",
            q: "איך מחושבות העמלות?",
            a: [
              "30% מכל מנוי ששולם דרך הלינק שלכם, כל חודש, ב-12 החודשים הראשונים. אחרי 12 חודשים הריבית יורדת ל-0% לכולם — אלא אם הגעתם לסטטוס Active Partner (10 מנויים פעילים), אז אתם שומרים על 10% לכל החיים מכל המנויים שלכם.",
              "מנויים שנתיים מקבלים בונוס חד-פעמי של 15% על התשלום הראשון, במקום 30% חודשי.",
            ],
          },
          {
            id: "payout",
            q: "מתי אני מקבל את הכסף?",
            a: [
              "חודשית, ברגע שהיתרה עוברת $50. אנחנו משתמשים בשיטת התשלום שהגדרתם בדאשבורד (העברה בנקאית, PayPal וכו'). $50 הוא הסף המינימלי, לא תקרה — אתם יכולים להרוויח הרבה יותר, פשוט מקבלים כשעוברים את הסף.",
              "ההכנסות מנוקות 30 ימים אחרי תשלום המנוי כדי לאפשר חלון להחזרים. אז מנוי מינואר משלם לכם בתחילת פברואר (מנוקה) ומופיע במחזור $50+ הבא שלכם.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "נרשמתי אבל הדאשבורד שלי ריק.",
            a: [
              "הסטטיסטיקות מופיעות אחרי הקליק הראשון על הלינק שלכם. ריק פירושו פשוט שאף אחד לא לחץ עדיין — צאו ושתפו את הלינק. הדאשבורד מתעדכן כמעט בזמן אמת ברגע שמתחילה פעילות.",
              "אם שיתפתם ומישהו נרשם אבל הדאשבורד לא משקף את זה, תכתבו לי עם הזמן המשוער של ההרשמה ואני אבדוק את ההצטרפות.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "כללי",
        items: [
          {
            id: "what-is-gadit",
            q: "מה זה Gadit?",
            a: [
              "מילון רב-לשוני שבנוי כדי לגרום למילה להיתפס — לא רק לתת הגדרה של שורה אחת. כל מילה נפתחת עם כל המשמעויות שלה, דוגמאות אמיתיות לכל משמעות, ניבים, אטימולוגיה, תמונת AI אופציונלית, ו(עם Clear/Deep) הסבר ידידותי-לילד, חיבור-משפט-משלכם עם פידבק, וחידונים.",
              "כרגע 12 שפות ממשק. הפועל \"לעשות לי GAD למילה\" = להבין אותה עד הסוף.",
            ],
          },
          {
            id: "languages",
            q: "אילו שפות אתם תומכים?",
            a: [
              "ממשק: אנגלית, עברית, ערבית, רוסית, ספרדית, פורטוגזית, צרפתית, גרמנית, צ'כית, סלובקית, איטלקית, יפנית.",
              "אפשר לחפש מילה בכל אחת מהשפות הללו ולקבל הגדרה + דוגמאות + הכל ברירת מחדל בשפת הממשק שבחרתם. עברית/ערבית הן RTL מלא ומשתמשות בפונטים הילידיים שלהן.",
            ],
          },
          {
            id: "kid-safety",
            q: "Gadit בטוח לילדים?",
            a: [
              "כן — מצב ילדים מעביר כל הגדרה ודוגמה דרך אותו AI שאנחנו משתמשים בו לתוכן מבוגרים, עם הוראות מפורשות לשמור על ההסבר פשוט, קונקרטי ומתאים לגיל (רמת 5-10 שנים). אף תוכן שמשתמשים יוצרים לא מוצג לילדים.",
              "בעלות על חשבון היא 13+ לפי תאימות COPPA/GDPR-K. המודל הסטנדרטי הוא חשבון של ההורה שההורה משתמש בו עם הילד — וזה בדיוק מה שמצב ילדים בנוי לזה.",
            ],
          },
          {
            id: "data",
            q: "איפה הנתונים שלי שמורים? אתם מוכרים אותם?",
            a: [
              "חשבון, היסטוריה, מחברת ותמונות שנוצרו נשמרים באופן מאובטח (Firebase, מוצפן במנוחה). אנחנו לא מוכרים או חולקים את הנתונים שלכם עם אף אחד — פרטים מלאים במדיניות הפרטיות.",
              "אפשר לייצא את המחברת או למחוק חשבון בכל רגע מעמוד החשבון.",
            ],
          },
          {
            id: "contact-direct",
            q: "איך אני יכול להגיע אליכם ישירות?",
            a: [
              "מייל ל-support@gadit.app — מגיע ישירות אליי. אני קורא כל הודעה בעצמי ועונה תוך 24-48 שעות (לרוב מהר יותר).",
              "אני מעדיף מייל על פני צ'אט כי זה נותן לי הזדמנות לקרוא בעיון ולענות בעיון. תמיכה טלפונית אני עדיין לא מציע.",
            ],
          },
        ],
      },
    ],
  },
} satisfies Partial<Record<Lang, HelpContent>>);

// Other 10 languages fall back to English until a translation pass.
// Slovak (Andrea's market) is the next-priority translate target —
// add it to the Object.assign block above when the strings are ready.
const fallback = HELP.en;
for (const code of ["ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja"] as Lang[]) {
  HELP[code] = fallback;
}

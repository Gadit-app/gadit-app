"use client";

/**
 * AffiliatesPage — public marketing page for the Gadit Partner Program.
 *
 * Structure (synthesised from 5 independent AI reviews — Gemini, Claude,
 * GPT, Manus, Perplexity — that all converged on the same gaps):
 *
 *   1. Hero               mission + reward + ONE dominant CTA
 *   2. Why recommend      product value BEFORE the money (audience-first)
 *   3. Who it's for       3 audience pillars with identity language
 *   4. How it works       3 steps + mid-page CTA #1
 *   5. What you get       marketing kit, dashboard, personal link, support
 *   6. Earnings           interactive slider + scenario table + mid CTA #2
 *   7. Why trust          founder note + product stats (no fake testimonials)
 *   8. FAQ                10 questions including "do I need to be a marketer?"
 *   9. Final CTA          strong closing
 *
 * Reviewer consensus the structure encodes:
 *   - audience is NOT pro affiliate marketers — language stays plain
 *     ("share", "recommend", "your link") and avoids jargon (cookie,
 *     conversion, payout, portal)
 *   - money is framed as a bonus, not the hook — value section comes first
 *   - one dominant CTA per surface (hero secondary lives in topbar as
 *     a small text link, not a button)
 *   - $50 reads as MINIMUM payout threshold, never a ceiling — wording
 *     spells this out everywhere it appears
 *   - testimonials would be fake right now, so trust is built via
 *     founder note + product stats instead
 *
 * 9 UI languages, COPY inline so the strings stay close to the markup.
 * Same pattern as /play hub. CTAs route to the Affonso-hosted portal
 * — the actual signup, dashboard, coupons and payouts live there.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { useHref } from "@/lib/href";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { WbUserMenu } from "@/components/design/WbUserMenu";

const AFFONSO_PORTAL = "https://gaditapp.affonso.io";

// Commission math driving the calculator and the example table. Kept
// in one place so a future tweak (e.g. raising Deep to $5.99) updates
// every dollar figure on this page without copy drift.
const COMMISSION_RATE = 0.30;
const DEEP_PRICE = 4.99;

type Lang = "he" | "en" | "ar" | "ru" | "es" | "pt" | "fr" | "de" | "cs";

type Copy = {
  navAffiliates: string;
  topbarSignIn: string;

  // Hero
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaPrimary: string;
  heroProofA: string;
  heroProofB: string;
  heroProofC: string;
  heroProofD: string;

  // Why recommend Gadit
  whyEyebrow: string;
  whyTitle: string;
  whySubtitle: string;
  why1Title: string;
  why1Desc: string;
  why2Title: string;
  why2Desc: string;
  why3Title: string;
  why3Desc: string;

  // Who it's for
  whoEyebrow: string;
  whoTitle: string;
  who1Title: string;
  who1Desc: string;
  who2Title: string;
  who2Desc: string;
  who3Title: string;
  who3Desc: string;

  // How it works
  howEyebrow: string;
  howTitle: string;
  how1Title: string;
  how1Desc: string;
  how2Title: string;
  how2Desc: string;
  how3Title: string;
  how3Desc: string;
  midCta1: string;

  // What you get
  getEyebrow: string;
  getTitle: string;
  getSubtitle: string;
  get1Title: string;
  get1Desc: string;
  get2Title: string;
  get2Desc: string;
  get3Title: string;
  get3Desc: string;
  get4Title: string;
  get4Desc: string;

  // Earnings calculator + table
  earnEyebrow: string;
  earnTitle: string;
  earnSubtitle: string;
  calcSubsLabel: string;
  calcMonthly: string;
  calcYearly: string;
  calcUnitSuffix: string;
  tableHeaderSubs: string;
  tableHeaderMonthly: string;
  tableHeaderYearly: string;
  earnNote: string;
  midCta2: string;

  // Why trust us
  trustEyebrow: string;
  trustTitle: string;
  founderHeading: string;
  founderBody: string;
  founderSign: string;
  stat1Num: string;
  stat1Label: string;
  stat2Num: string;
  stat2Label: string;
  stat3Num: string;
  stat3Label: string;

  // FAQ
  faqEyebrow: string;
  faqTitle: string;
  faq1Q: string;
  faq1A: string;
  faq2Q: string;
  faq2A: string;
  faq3Q: string;
  faq3A: string;
  faq4Q: string;
  faq4A: string;
  faq5Q: string;
  faq5A: string;
  faq6Q: string;
  faq6A: string;
  faq7Q: string;
  faq7A: string;
  faq8Q: string;
  faq8A: string;
  faq9Q: string;
  faq9A: string;
  faq10Q: string;
  faq10A: string;
  faq11Q: string;
  faq11A: string;

  // Final CTA
  finalTitle: string;
  finalSubtitle: string;
  finalCta: string;

  // Footer
  termsLink: string;
};

const COPY: Record<Lang, Copy> = {
  he: {
    navAffiliates: "שותפים",
    topbarSignIn: "כבר שותפים? כניסה",

    heroEyebrow: "תוכנית השותפים של Gadit",
    heroTitle: "הפכו את ההמלצה שלכם להכנסה חודשית",
    heroSubtitle:
      "אתם משתפים את הקישור האישי שלכם, ואנחנו מתגמלים אתכם 30% עמלה חוזרת בשנה הראשונה — ו-10% לכל החיים כשתהפכו ל-Active Partner.",
    heroCtaPrimary: "קבלו את הקישור האישי שלכם — בחינם",
    heroProofA: "30% בשנה הראשונה",
    heroProofB: "10% לכל החיים (Active Partner)",
    heroProofC: "קישור מיידי",
    heroProofD: "פתוח לכולם",

    whyEyebrow: "לפני הכסף",
    whyTitle: "למה Gadit שווה המלצה",
    whySubtitle:
      "אתם תמליצו רק על משהו שאתם מאמינים בו. אז הנה מה שהקהל שלכם יקבל — ולמה הוא יודה לכם.",
    why1Title: "מילון אמיתי, לא תרגום יבש",
    why1Desc:
      "כל המשמעויות של מילה, דוגמאות אמיתיות לכל אחת, ניבים, מקור היסטורי ותמונה. Gadit מסביר מילה כמו שצריך, לא כמו שכל מילון רגיל עושה.",
    why2Title: "ב-9 שפות, כולל עברית RTL מלאה",
    why2Desc:
      "עברית, אנגלית, ערבית, רוסית, ספרדית, פורטוגזית, צרפתית, גרמנית וצ'כית. מתאים גם לדוברי עברית וגם להורים של ילדים שלומדים שפה זרה.",
    why3Title: "תוכנן עבור הורים, מורים ולומדים",
    why3Desc:
      "הסבר לילדים, חידונים, משחקי מילים ומחברת אישית. Gadit לא בנוי לאקדמאים — הוא בנוי לבית, לכיתה ולקבוצת הוואטסאפ.",

    whoEyebrow: "למי זה מתאים",
    whoTitle: "אנשים שיש להם קהילה שסומכת עליהם",
    who1Title: "יוצרי תוכן ובלוגרי חינוך",
    who1Desc:
      "אם אתם כותבים, מצלמים או משתפים תוכן על שפה, למידה או חינוך — לקהל שלכם כבר יש אמון בהמלצות שלכם.",
    who2Title: "מורים, מטפלות ואנשי חינוך",
    who2Desc:
      "אם אתם עובדים עם תלמידים והורים — ההמלצה שלכם על כלי חינוכי מגיעה ממקום של אמון מקצועי.",
    who3Title: "הורים פעילים בקהילות",
    who3Desc:
      "קבוצות הורים, צ'אטים של כיתה, רשימות תפוצה — בכל מקום שבו הורים שואלים זה את זה על כלים שעוזרים לילדים שלהם.",

    howEyebrow: "איך זה עובד",
    howTitle: "שלושה צעדים, בלי שום ידע טכני",
    how1Title: "1. הרשמה לתוכנית",
    how1Desc:
      "טופס קצר. תוך דקה אתם מקבלים אישור אוטומטי, קישור אישי, וגישה לאזור האישי.",
    how2Title: "2. שיתוף הקישור",
    how2Desc:
      "בוואטסאפ של ההורים, במייל לרשימה, בסטורי באינסטגרם, בבלוג, או באישית — בכל מקום שמתאים לקהל שלכם.",
    how3Title: "3. תגמול שגדל איתכם",
    how3Desc:
      "30% עמלה חוזרת ל-12 חודש על כל לקוח שמצטרף דרך הקישור. כשתביאו 10 לקוחות פעילים תהפכו ל-Active Partner ותפתחו תוספת של 10% עמלה חוזרת לכל החיים — על כל הלקוחות שלכם, מהחודש ה-13 והלאה.",
    midCta1: "התחילו עכשיו — לוקח דקה",

    getEyebrow: "מה תקבלו",
    getTitle: "אנחנו לא משאירים אתכם לבד",
    getSubtitle:
      "אם מעולם לא שיווקתם משהו בחיים — זה בסדר. הכל מוכן עבורכם.",
    get1Title: "קישור אישי משלכם",
    get1Desc:
      "קישור קצר וייחודי שאפשר לשתף בכל מקום. אפילו אם מישהו לחץ עליו וחזר רק בעוד 60 יום — ההרשמה שלכם.",
    get2Title: "טקסטים מוכנים לשיתוף",
    get2Desc:
      "פוסטים מוכנים לוואטסאפ ולפייסבוק, מייל מוכן להורים, ורעיונות לסטורי באינסטגרם. רק להעתיק ולשתף.",
    get3Title: "אזור אישי מסודר",
    get3Desc:
      "רואים בזמן אמת: כמה לחצו על הקישור, כמה נרשמו, כמה משדרגים, וכמה אתם מקבלים. הכל שקוף.",
    get4Title: "תמיכה אישית",
    get4Desc:
      "שאלה על תוכנית? בעיה עם הקישור? יש למי לפנות. אנחנו עונים תוך יום עסקים.",

    earnEyebrow: "כמה אפשר להרוויח",
    earnTitle: "תזיזו את הסליידר ותראו",
    earnSubtitle:
      "המספרים תלויים בקהל שלכם ובמה שאתם משתפים. הנה איך זה מצטבר — אנחנו לא מבטיחים סכום, אבל הנה הסדר גודל.",
    calcSubsLabel: "מנויי Deep פעילים בחודש",
    calcMonthly: "תגמול חודשי",
    calcYearly: "ב-12 חודש",
    calcUnitSuffix: "מנויים",
    tableHeaderSubs: "כמות מנויים",
    tableHeaderMonthly: "תגמול חודשי",
    tableHeaderYearly: "סך הכל ב-12 חודש",
    earnNote:
      "החישוב מבוסס על מנוי Deep ($4.99/חודש) ועל 30% עמלה בשנה הראשונה. מהחודש ה-13, Active Partners מקבלים תוספת של 10% עמלה לכל החיים על אותם לקוחות. תגמולים משתחררים אחרי תקופת המתנה של 30 יום, ותשלום מתבצע כשהצטברו $50 (סף תשלום מינימלי — לא תקרה).",
    midCta2: "מוכנים להתחיל? קבלו את הקישור שלכם",

    trustEyebrow: "למה לסמוך",
    trustTitle: "תוכנית מייסדים בשלביה הראשונים",
    founderHeading: "פסקה ממני, גדי",
    founderBody:
      "בניתי את Gadit כי לקח לי שנים להבין שמילה היא לא רק תרגום — היא סיפור שלם. רציתי לתת לכל אדם בעולם את הכלי שאני הייתי רוצה כשלמדתי. תוכנית השותפים פתוחה עכשיו לקבוצה ראשונה של אנשים שמתחברים לרעיון הזה. אם זה אתם — אשמח אם תצטרפו.",
    founderSign: "— גדי בן לביא, מייסד Gadit",
    stat1Num: "9",
    stat1Label: "שפות ממשק נתמכות",
    stat2Num: "30%",
    stat2Label: "עמלה חוזרת ל-12 חודש",
    stat3Num: "60",
    stat3Label: "ימים — חלון זיכרון של הקישור",

    faqEyebrow: "שאלות נפוצות",
    faqTitle: "מה כדאי לדעת",
    faq1Q: "האם אני צריך להיות משווק?",
    faq1A:
      "לא. רוב השותפים שלנו הם הורים, מורים ובלוגרים שמעולם לא שיווקו דבר. כל מה שצריך זה לשתף את הקישור עם אנשים שיכולים להפיק מ-Gadit.",
    faq2Q: "האם מותר לשתף בקבוצות וואטסאפ או פייסבוק?",
    faq2A:
      "כן — וזה אחד הערוצים הטובים ביותר לקהל שלנו. הורים שואלים זה את זה על כלים בקבוצות, ושם ההמלצה שלכם הכי משפיעה.",
    faq3Q: "מתי אני מקבל את התשלום?",
    faq3A:
      "תשלום חודשי בסוף כל חודש, אחרי שהצטברו $50. סף התשלום הוא $50 כסכום מינימלי — לא תקרה. תוכלו להרוויח הרבה יותר ממנו, פשוט מקבלים בפועל ברגע שעוברים אותו.",
    faq4Q: "מה קורה אם הלקוח שלי מבטל?",
    faq4A:
      "תקבלו עמלה רק על החודשים שהלקוח שילם בפועל. אם הוא ביטל אחרי 4 חודשים — קיבלתם 4 חודשים של תגמול. הוגן לשני הצדדים.",
    faq5Q: "האם יש מגבלה על כמות לקוחות?",
    faq5A:
      "בכלל לא. תוכלו להביא כמה לקוחות שתרצו, מכל מקום בעולם, בכל אחת מ-9 השפות ש-Gadit תומך בהן.",
    faq6Q: "מה הקישור עושה אם מישהו לא נרשם מיד?",
    faq6A:
      "הקישור זוכר אתכם ל-60 יום. אם מישהו לחץ עליו, התלבט שבועיים, וחזר לרכוש מנוי — ההרשמה עדיין נחשבת שלכם.",
    faq7Q: "מה לגבי מנוי שנתי?",
    faq7A:
      "על מנוי שנתי אתם מקבלים תגמול חד-פעמי של 15% מהתשלום הראשון (במקום 30% חודשי לאורך השנה). זה איזון נכון בגלל ההנחה שאנחנו נותנים על תשלום שנתי.",
    faq8Q: "האם אקבל חומרי שיווק מוכנים?",
    faq8A:
      "כן. תוכלו להעתיק טקסטים מוכנים לוואטסאפ, מייל להורים, פוסטים לפייסבוק וטיוטות לסטורי. אם תרצו משהו ספציפי — תפנו ואנחנו נכין.",
    faq9Q: "האם מותר לפרסם מודעות ממומנות בגוגל או פייסבוק?",
    faq9A:
      "מודעות אורגניות לקהל שלכם — כן. אבל אסור לקנות מודעות ממומנות על המילה 'Gadit' עצמה (זה נקרא brand bidding ומגן עלינו ועליכם). הכללים המלאים מופיעים באזור האישי.",
    faq10Q: "האם אני חייב לקנות מנוי כדי להיות שותף?",
    faq10A:
      "לא. אתם יכולים להיות שותפים בלי לרכוש דבר. ההצטרפות חינמית לחלוטין.",
    faq11Q: "מה זה Active Partner ואיך מגיעים לזה?",
    faq11A:
      "כשהבאתם 10 לקוחות משלמים פעילים, אתם הופכים אוטומטית ל-Active Partner — סטטוס שפותח לכם תוספת של 10% עמלה חוזרת לכל החיים, על כל הלקוחות שלכם (גם הקיימים, מהחודש ה-13 והלאה). זה אומר שגם אחרי שנתיים, שלוש או חמש שנים — אם הלקוחות שלכם עדיין מנויים, אתם עדיין מקבלים תגמול.",

    finalTitle: "מוכנים להתחיל?",
    finalSubtitle:
      "ההרשמה לוקחת דקה. האישור תוך 24 שעות. הקישור מוכן באותו יום.",
    finalCta: "קבלו את הקישור האישי שלכם — בחינם",
    termsLink: "תנאי תוכנית השותפים",
  },

  en: {
    navAffiliates: "Affiliates",
    topbarSignIn: "Already a partner? Sign in",

    heroEyebrow: "The Gadit Partner Program",
    heroTitle: "Turn your recommendation into monthly income",
    heroSubtitle:
      "You share your personal link, and we reward you 30% recurring commission in year one — and 10% for life once you become an Active Partner.",
    heroCtaPrimary: "Get your personal link — free",
    heroProofA: "30% in year one",
    heroProofB: "10% lifetime (Active Partner)",
    heroProofC: "Instant link",
    heroProofD: "Open to everyone",

    whyEyebrow: "Before the money",
    whyTitle: "Why Gadit is worth recommending",
    whySubtitle:
      "You'll only recommend something you believe in. Here's what your audience actually gets — and why they'll thank you.",
    why1Title: "A real dictionary, not just translation",
    why1Desc:
      "Every meaning of a word, real examples for each, idioms, historical origin, and an image. Gadit explains a word properly — not like a regular dictionary.",
    why2Title: "9 languages, full RTL support",
    why2Desc:
      "Hebrew, English, Arabic, Russian, Spanish, Portuguese, French, German and Czech. Works for native speakers and for parents of kids learning a second language.",
    why3Title: "Designed for parents, teachers and learners",
    why3Desc:
      "Kid-friendly explanations, quizzes, word games and a personal notebook. Gadit isn't for academics — it's for the home, the classroom and the WhatsApp group.",

    whoEyebrow: "Who it's for",
    whoTitle: "People whose community trusts them",
    who1Title: "Content creators & education bloggers",
    who1Desc:
      "If you write, film, or share content about language, learning, or education, your audience already trusts your recommendations.",
    who2Title: "Teachers, tutors and speech therapists",
    who2Desc:
      "If you work with students and parents — your recommendation of an educational tool carries professional weight.",
    who3Title: "Active community parents",
    who3Desc:
      "Parent groups, class chats, mailing lists — anywhere parents ask each other about tools that help their kids.",

    howEyebrow: "How it works",
    howTitle: "Three steps, no technical skills",
    how1Title: "1. Sign up to the program",
    how1Desc:
      "Short form. Within a minute you're approved automatically with a personal link and a dashboard.",
    how2Title: "2. Share your link",
    how2Desc:
      "In a parent WhatsApp, in a mailing list, in an Instagram story, on a blog, or in person — wherever fits your audience.",
    how3Title: "3. Rewards that grow with you",
    how3Desc:
      "30% recurring commission for 12 months on every customer who signs up through your link. Bring 10 active customers and you become an Active Partner — unlocking an additional 10% lifetime commission on all your customers, from month 13 onward.",
    midCta1: "Start now — takes a minute",

    getEyebrow: "What you get",
    getTitle: "We don't leave you on your own",
    getSubtitle:
      "If you've never marketed anything in your life — that's fine. Everything is ready for you.",
    get1Title: "Your personal link",
    get1Desc:
      "A short, unique link you can share anywhere. Even if someone clicks it and comes back 60 days later — the signup still credits to you.",
    get2Title: "Ready-to-use copy",
    get2Desc:
      "Pre-written posts for WhatsApp and Facebook, a parent email, Instagram story ideas. Just copy and share.",
    get3Title: "Clean dashboard",
    get3Desc:
      "Real-time view: how many people clicked, signed up, upgraded, and how much you've earned. Fully transparent.",
    get4Title: "Personal support",
    get4Desc:
      "Question about the program? Problem with the link? Someone to ask. We reply within one business day.",

    earnEyebrow: "What you can earn",
    earnTitle: "Move the slider and see",
    earnSubtitle:
      "Numbers depend on your audience and what you share. Here's how it adds up — we don't promise a specific amount, but the order of magnitude is real.",
    calcSubsLabel: "Active Deep subscribers per month",
    calcMonthly: "Monthly reward",
    calcYearly: "Over 12 months",
    calcUnitSuffix: "subscribers",
    tableHeaderSubs: "Subscribers",
    tableHeaderMonthly: "Monthly reward",
    tableHeaderYearly: "Total over 12 months",
    earnNote:
      "Calculation based on Deep subscription ($4.99/month) and 30% commission in year one. From month 13, Active Partners earn an additional 10% lifetime commission on those same customers. Rewards release after a 30-day hold, and payouts happen once $50 has accumulated ($50 is the minimum payout threshold — not a ceiling).",
    midCta2: "Ready to start? Get your link",

    trustEyebrow: "Why trust us",
    trustTitle: "A founding partners program in its early days",
    founderHeading: "A note from me, Gadi",
    founderBody:
      "I built Gadit because it took me years to realise a word isn't just a translation — it's a whole story. I wanted to give every person in the world the tool I wished I'd had while learning. The partner program is now open to a first group of people who connect with this idea. If that's you — I'd be glad to have you.",
    founderSign: "— Gadi Ben Lavi, founder of Gadit",
    stat1Num: "9",
    stat1Label: "UI languages supported",
    stat2Num: "30%",
    stat2Label: "Recurring commission for 12 months",
    stat3Num: "60",
    stat3Label: "Day memory window for your link",

    faqEyebrow: "FAQ",
    faqTitle: "What to know first",
    faq1Q: "Do I need to be a marketer?",
    faq1A:
      "No. Most of our partners are parents, teachers and bloggers who have never marketed anything. All you need is to share the link with people who'd benefit from Gadit.",
    faq2Q: "Can I share in WhatsApp or Facebook groups?",
    faq2A:
      "Yes — and that's one of the best channels for our audience. Parents ask each other about tools in groups, and that's where your recommendation carries the most weight.",
    faq3Q: "When do I get paid?",
    faq3A:
      "Monthly payouts at the end of each month, once $50 has accumulated. The $50 is a minimum payout threshold — not a ceiling. You can earn much more than that; you just receive the actual payout once you cross the threshold.",
    faq4Q: "What if my referred customer cancels?",
    faq4A:
      "You earn only for the months the customer actually paid. If they cancel after 4 months, you've earned 4 months of reward. Fair to both sides.",
    faq5Q: "Is there a limit on how many customers I can refer?",
    faq5A:
      "No limit. You can refer as many customers as you like, from anywhere in the world, in any of the 9 languages Gadit supports.",
    faq6Q: "What does the link do if someone doesn't sign up right away?",
    faq6A:
      "The link remembers you for 60 days. If someone clicks it, hesitates for two weeks, then comes back and subscribes — the signup still credits to you.",
    faq7Q: "What about yearly subscriptions?",
    faq7A:
      "Yearly plans pay a 15% one-time reward on the first payment (instead of 30% monthly for 12 months). This balances the discount we offer on the yearly price.",
    faq8Q: "Will I get ready-made marketing materials?",
    faq8A:
      "Yes. You can copy ready-to-use texts for WhatsApp, a parent email, Facebook posts and Instagram story drafts. If you need something specific — ask, and we'll prepare it.",
    faq9Q: "Can I run paid ads on Google or Facebook?",
    faq9A:
      "Organic posts to your own audience — yes. But you can't buy paid ads on the word 'Gadit' itself (this is called brand bidding and protects both us and you). The full rules are in your dashboard.",
    faq10Q: "Do I have to buy a subscription to be a partner?",
    faq10A:
      "No. You can be a partner without buying anything. Joining is completely free.",
    faq11Q: "What is an Active Partner and how do I become one?",
    faq11A:
      "Once you've referred 10 active paying customers, you automatically become an Active Partner — a status that unlocks an additional 10% recurring lifetime commission on all your customers (including existing ones, from month 13 onward). That means even two, three, or five years later — as long as your customers stay subscribed, you keep earning.",

    finalTitle: "Ready to start?",
    finalSubtitle:
      "Signup takes a minute. Approval is within 24 hours. Your link is ready the same day.",
    finalCta: "Get your personal link — free",
    termsLink: "Partner program terms",
  },

  // Seven non-primary languages temporarily fall back to English copy
  // with only the nav label localized. Better than shipping machine
  // translations in all 9. The spread reads COPY.en — which is fully
  // initialized by the time these property initializers run because
  // object literal properties evaluate in source order, top-down.
  ar: undefined as unknown as Copy,
  ru: undefined as unknown as Copy,
  es: undefined as unknown as Copy,
  pt: undefined as unknown as Copy,
  fr: undefined as unknown as Copy,
  de: undefined as unknown as Copy,
  cs: undefined as unknown as Copy,
};

const NAV_FALLBACKS: Record<Exclude<Lang, "he" | "en">, { navAffiliates: string; topbarSignIn: string }> = {
  ar: { navAffiliates: "الشركاء", topbarSignIn: "شريك بالفعل؟ تسجيل دخول" },
  ru: { navAffiliates: "Партнёры", topbarSignIn: "Уже партнёр? Войти" },
  es: { navAffiliates: "Afiliados", topbarSignIn: "¿Ya eres socio? Acceder" },
  pt: { navAffiliates: "Afiliados", topbarSignIn: "Já é parceiro? Acessar" },
  fr: { navAffiliates: "Affiliés", topbarSignIn: "Déjà partenaire ? Se connecter" },
  de: { navAffiliates: "Affiliates", topbarSignIn: "Schon Partner? Anmelden" },
  cs: { navAffiliates: "Partneři", topbarSignIn: "Už jste partner? Přihlášení" },
};
(Object.keys(NAV_FALLBACKS) as Array<Exclude<Lang, "he" | "en">>).forEach((l) => {
  COPY[l] = { ...COPY.en, ...NAV_FALLBACKS[l] };
});

const LANGS = [
  { code: "he", label: "עברית" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "ru", label: "Русский" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "cs", label: "Čeština" },
] as const;

function LangSwitch() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);
  const active = LANGS.find((l) => l.code === lang) ?? LANGS[1];
  return (
    <div ref={wrapRef} className="wb-lang-chip-wrap">
      <button type="button" className="wb-lang-chip" onClick={() => setOpen((v) => !v)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
        </svg>
        {active.label}
      </button>
      {open && (
        <ul className="wb-lang-menu" role="listbox">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                className={l.code === lang ? "is-active" : ""}
                onClick={() => { setLang(l.code); setOpen(false); }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Interactive earnings calculator ────────────────────────────
function EarningsCalculator({ c, lang }: { c: Copy; lang: Lang }) {
  const [subs, setSubs] = useState(10);
  // Derived numbers stay close to the slider so reading the component
  // matches reading the result.
  const monthly = +(subs * DEEP_PRICE * COMMISSION_RATE).toFixed(2);
  const yearly = +(monthly * 12).toFixed(2);

  // Currency formatter — keep $ everywhere; we charge in USD and
  // payouts arrive in USD via PayPal/Wise. Locale-aware grouping for
  // visual polish.
  const fmt = useMemo(
    () =>
      new Intl.NumberFormat(lang === "en" ? "en-US" : lang, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }),
    [lang],
  );

  return (
    <div className="wb-aff-calc">
      <div className="wb-aff-calc-row">
        <label className="wb-aff-calc-label" htmlFor="aff-slider">
          {c.calcSubsLabel}
        </label>
        <div className="wb-aff-calc-value">
          <span className="wb-aff-calc-num">{subs}</span>
          <span className="wb-aff-calc-unit">{c.calcUnitSuffix}</span>
        </div>
      </div>
      <input
        id="aff-slider"
        className="wb-aff-calc-slider"
        type="range"
        min={1}
        max={50}
        step={1}
        value={subs}
        onChange={(e) => setSubs(Number(e.target.value))}
        aria-valuemin={1}
        aria-valuemax={50}
        aria-valuenow={subs}
        // CSS uses var(--val) to colour the filled portion of the
        // track. Without this style prop the gradient is frozen at
        // 10 (the default) regardless of the slider position.
        style={{ ["--val" as string]: subs } as React.CSSProperties}
      />
      <div className="wb-aff-calc-outputs">
        <div className="wb-aff-calc-output">
          <div className="wb-aff-calc-output-label">{c.calcMonthly}</div>
          <div className="wb-aff-calc-output-value">{fmt.format(monthly)}</div>
        </div>
        <div className="wb-aff-calc-output">
          <div className="wb-aff-calc-output-label">{c.calcYearly}</div>
          <div className="wb-aff-calc-output-value is-emphasis">{fmt.format(yearly)}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Scenario table — concrete examples around the slider ───────
function EarningsTable({ c, lang }: { c: Copy; lang: Lang }) {
  const fmt = useMemo(
    () =>
      new Intl.NumberFormat(lang === "en" ? "en-US" : lang, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }),
    [lang],
  );
  const rows = [5, 10, 25, 50];
  return (
    <table className="wb-aff-earn-table">
      <thead>
        <tr>
          <th>{c.tableHeaderSubs}</th>
          <th>{c.tableHeaderMonthly}</th>
          <th>{c.tableHeaderYearly}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((n) => {
          const m = +(n * DEEP_PRICE * COMMISSION_RATE).toFixed(2);
          const y = +(m * 12).toFixed(2);
          return (
            <tr key={n}>
              <td>{n}</td>
              <td>{fmt.format(m)}</td>
              <td>{fmt.format(y)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function AffiliatesPage() {
  const { user, plan, promptLogin } = useAuth();
  const { lang, dir, setLang } = useLang();
  const href = useHref();
  const c = COPY[lang as Lang] ?? COPY.en;

  // Mobile burger menu — mirrors the pattern used by every other shell
  // (HomeClient, FeaturesClient, ...). On screens below 720px the
  // desktop .wb-shell-nav + .wb-shell-actions are hidden by globals.css;
  // without this menu the topbar would have zero interactive elements
  // on mobile and a visitor would be stuck on the page.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

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
    <div className="wordbook wb-shell-page wb-aff-page" dir={dir}>
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
          {user && (plan === "clear" || plan === "deep") && (
            <Link href={href("/notebook")} className="wb-shell-navlink">
              {v2(lang, "navNotebook")}
            </Link>
          )}
          {user && plan === "deep" && (
            <Link href={href("/play")} className="wb-shell-navlink">
              {v2(lang, "navPlay")}
            </Link>
          )}
          <Link href={href("/pricing")} className="wb-shell-navlink">
            {v2(lang, "navPricing")}
          </Link>
          <Link href={href("/affiliates")} className="wb-shell-navlink is-active">
            {c.navAffiliates}
          </Link>
        </nav>
        <div className="wb-shell-actions">
          <a
            href={AFFONSO_PORTAL}
            target="_blank"
            rel="noopener noreferrer"
            className="wb-aff-topbar-signin"
          >
            {c.topbarSignIn}
          </a>
          <ShareButton
            url="https://www.gadit.app/"
            title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
            text=""
            shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
            copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
          />
          <LangSwitch />
          {user ? <WbUserMenu /> : null}
        </div>

        {/* Mobile-only — share button + burger. Both hidden on desktop
            via globals.css. */}
        <div className="wb-shell-share-mobile-wrap">
          <ShareButton
            url="https://www.gadit.app/"
            title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
            text=""
            shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
            copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
          />
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
            {user && (plan === "clear" || plan === "deep") && (
              <Link href={href("/notebook")} className="wb-shell-mobile-link" onClick={() => setMenuOpen(false)}>
                {v2(lang, "navNotebook")}
              </Link>
            )}
            {user && plan === "deep" && (
              <Link href={href("/play")} className="wb-shell-mobile-link" onClick={() => setMenuOpen(false)}>
                {v2(lang, "navPlay")}
              </Link>
            )}
            <Link href={href("/pricing")} className="wb-shell-mobile-link" onClick={() => setMenuOpen(false)}>
              {v2(lang, "navPricing")}
            </Link>
            <Link href={href("/affiliates")} className="wb-shell-mobile-link is-active" onClick={() => setMenuOpen(false)}>
              {c.navAffiliates}
            </Link>
            <div className="wb-shell-mobile-menu-sep" />
            <a
              href={AFFONSO_PORTAL}
              target="_blank"
              rel="noopener noreferrer"
              className="wb-shell-mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              {c.topbarSignIn}
            </a>
            <div className="wb-shell-mobile-menu-sep" />
            <div className="wb-shell-mobile-langs">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={l.code === lang ? "is-active" : ""}
                  onClick={() => { setLang(l.code); setMenuOpen(false); }}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <div className="wb-shell-mobile-menu-sep" />
            {user ? (
              <Link href={href("/account")} className="wb-shell-mobile-link" onClick={() => setMenuOpen(false)}>
                {(user.email?.[0] || "G").toUpperCase()} · {user.email ?? "Account"}
              </Link>
            ) : (
              <button
                type="button"
                className="wb-shell-mobile-link"
                onClick={() => { setMenuOpen(false); promptLogin({ mode: "signin" }); }}
              >
                {v2(lang, "signIn")}
              </button>
            )}
          </div>
        )}
      </header>

      <main className="wb-aff-main">
        {/* 1. Hero */}
        <section className="wb-aff-hero">
          <div className="wb-aff-eyebrow">{c.heroEyebrow}</div>
          <h1 className="wb-aff-title">{c.heroTitle}</h1>
          <p className="wb-aff-lede">{c.heroSubtitle}</p>
          <a
            href={AFFONSO_PORTAL}
            target="_blank"
            rel="noopener noreferrer"
            className="wb-aff-cta-primary"
          >
            {c.heroCtaPrimary}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
          <ul className="wb-aff-proofs" aria-label={c.heroEyebrow}>
            <li><ProofIcon variant="commission" /><span>{c.heroProofA}</span></li>
            <li><ProofIcon variant="calendar" /><span>{c.heroProofB}</span></li>
            <li><ProofIcon variant="clock" /><span>{c.heroProofC}</span></li>
            <li><ProofIcon variant="badge" /><span>{c.heroProofD}</span></li>
          </ul>
        </section>

        {/* 2. Why recommend */}
        <section className="wb-aff-section">
          <div className="wb-aff-section-head">
            <div className="wb-aff-eyebrow">{c.whyEyebrow}</div>
            <h2 className="wb-aff-section-title">{c.whyTitle}</h2>
            <p className="wb-aff-section-sub">{c.whySubtitle}</p>
          </div>
          <ul className="wb-aff-grid-3">
            <li className="wb-aff-feature-card">
              <span className="wb-aff-feature-icon"><WhyIcon variant="dictionary" /></span>
              <h3 className="wb-aff-feature-title">{c.why1Title}</h3>
              <p className="wb-aff-feature-desc">{c.why1Desc}</p>
            </li>
            <li className="wb-aff-feature-card">
              <span className="wb-aff-feature-icon"><WhyIcon variant="globe" /></span>
              <h3 className="wb-aff-feature-title">{c.why2Title}</h3>
              <p className="wb-aff-feature-desc">{c.why2Desc}</p>
            </li>
            <li className="wb-aff-feature-card">
              <span className="wb-aff-feature-icon"><WhyIcon variant="family" /></span>
              <h3 className="wb-aff-feature-title">{c.why3Title}</h3>
              <p className="wb-aff-feature-desc">{c.why3Desc}</p>
            </li>
          </ul>
        </section>

        {/* 3. Who it's for */}
        <section className="wb-aff-section">
          <div className="wb-aff-section-head">
            <div className="wb-aff-eyebrow">{c.whoEyebrow}</div>
            <h2 className="wb-aff-section-title">{c.whoTitle}</h2>
          </div>
          <ul className="wb-aff-grid-3">
            <li className="wb-aff-feature-card">
              <span className="wb-aff-feature-icon"><WhoIcon variant="blogger" /></span>
              <h3 className="wb-aff-feature-title">{c.who1Title}</h3>
              <p className="wb-aff-feature-desc">{c.who1Desc}</p>
            </li>
            <li className="wb-aff-feature-card">
              <span className="wb-aff-feature-icon"><WhoIcon variant="teacher" /></span>
              <h3 className="wb-aff-feature-title">{c.who2Title}</h3>
              <p className="wb-aff-feature-desc">{c.who2Desc}</p>
            </li>
            <li className="wb-aff-feature-card">
              <span className="wb-aff-feature-icon"><WhoIcon variant="parent" /></span>
              <h3 className="wb-aff-feature-title">{c.who3Title}</h3>
              <p className="wb-aff-feature-desc">{c.who3Desc}</p>
            </li>
          </ul>
        </section>

        {/* 4. How it works */}
        <section className="wb-aff-section">
          <div className="wb-aff-section-head">
            <div className="wb-aff-eyebrow">{c.howEyebrow}</div>
            <h2 className="wb-aff-section-title">{c.howTitle}</h2>
          </div>
          <ol className="wb-aff-how-grid">
            <li className="wb-aff-how-step">
              <span className="wb-aff-how-num">1</span>
              <h3 className="wb-aff-how-title">{c.how1Title}</h3>
              <p className="wb-aff-how-desc">{c.how1Desc}</p>
            </li>
            <li className="wb-aff-how-step">
              <span className="wb-aff-how-num">2</span>
              <h3 className="wb-aff-how-title">{c.how2Title}</h3>
              <p className="wb-aff-how-desc">{c.how2Desc}</p>
            </li>
            <li className="wb-aff-how-step">
              <span className="wb-aff-how-num">3</span>
              <h3 className="wb-aff-how-title">{c.how3Title}</h3>
              <p className="wb-aff-how-desc">{c.how3Desc}</p>
            </li>
          </ol>
          <div className="wb-aff-mid-cta">
            <a
              href={AFFONSO_PORTAL}
              target="_blank"
              rel="noopener noreferrer"
              className="wb-aff-cta-primary wb-aff-cta-primary-compact"
            >
              {c.midCta1}
            </a>
          </div>
        </section>

        {/* 5. What you get */}
        <section className="wb-aff-section">
          <div className="wb-aff-section-head">
            <div className="wb-aff-eyebrow">{c.getEyebrow}</div>
            <h2 className="wb-aff-section-title">{c.getTitle}</h2>
            <p className="wb-aff-section-sub">{c.getSubtitle}</p>
          </div>
          <ul className="wb-aff-get-grid">
            <li className="wb-aff-get-card">
              <span className="wb-aff-get-icon"><GetIcon variant="link" /></span>
              <h3 className="wb-aff-get-title">{c.get1Title}</h3>
              <p className="wb-aff-get-desc">{c.get1Desc}</p>
            </li>
            <li className="wb-aff-get-card">
              <span className="wb-aff-get-icon"><GetIcon variant="copy" /></span>
              <h3 className="wb-aff-get-title">{c.get2Title}</h3>
              <p className="wb-aff-get-desc">{c.get2Desc}</p>
            </li>
            <li className="wb-aff-get-card">
              <span className="wb-aff-get-icon"><GetIcon variant="dashboard" /></span>
              <h3 className="wb-aff-get-title">{c.get3Title}</h3>
              <p className="wb-aff-get-desc">{c.get3Desc}</p>
            </li>
            <li className="wb-aff-get-card">
              <span className="wb-aff-get-icon"><GetIcon variant="support" /></span>
              <h3 className="wb-aff-get-title">{c.get4Title}</h3>
              <p className="wb-aff-get-desc">{c.get4Desc}</p>
            </li>
          </ul>
        </section>

        {/* 6. Earnings (calculator + table) */}
        <section className="wb-aff-section">
          <div className="wb-aff-section-head">
            <div className="wb-aff-eyebrow">{c.earnEyebrow}</div>
            <h2 className="wb-aff-section-title">{c.earnTitle}</h2>
            <p className="wb-aff-section-sub">{c.earnSubtitle}</p>
          </div>
          <EarningsCalculator c={c} lang={lang as Lang} />
          <EarningsTable c={c} lang={lang as Lang} />
          <p className="wb-aff-earn-note">{c.earnNote}</p>
          <div className="wb-aff-mid-cta">
            <a
              href={AFFONSO_PORTAL}
              target="_blank"
              rel="noopener noreferrer"
              className="wb-aff-cta-primary wb-aff-cta-primary-compact"
            >
              {c.midCta2}
            </a>
          </div>
        </section>

        {/* 7. Why trust us */}
        <section className="wb-aff-section">
          <div className="wb-aff-section-head">
            <div className="wb-aff-eyebrow">{c.trustEyebrow}</div>
            <h2 className="wb-aff-section-title">{c.trustTitle}</h2>
          </div>
          <div className="wb-aff-trust-grid">
            <article className="wb-aff-founder">
              <h3 className="wb-aff-founder-heading">{c.founderHeading}</h3>
              <p className="wb-aff-founder-body">{c.founderBody}</p>
              <div className="wb-aff-founder-sign">{c.founderSign}</div>
            </article>
            <ul className="wb-aff-stats">
              <li>
                <span className="wb-aff-stat-num">{c.stat1Num}</span>
                <span className="wb-aff-stat-label">{c.stat1Label}</span>
              </li>
              <li>
                <span className="wb-aff-stat-num">{c.stat2Num}</span>
                <span className="wb-aff-stat-label">{c.stat2Label}</span>
              </li>
              <li>
                <span className="wb-aff-stat-num">{c.stat3Num}</span>
                <span className="wb-aff-stat-label">{c.stat3Label}</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 8. FAQ */}
        <section className="wb-aff-section">
          <div className="wb-aff-section-head">
            <div className="wb-aff-eyebrow">{c.faqEyebrow}</div>
            <h2 className="wb-aff-section-title">{c.faqTitle}</h2>
          </div>
          <ul className="wb-aff-faq-list">
            {[
              [c.faq1Q, c.faq1A],
              [c.faq2Q, c.faq2A],
              [c.faq3Q, c.faq3A],
              [c.faq4Q, c.faq4A],
              [c.faq5Q, c.faq5A],
              [c.faq6Q, c.faq6A],
              [c.faq7Q, c.faq7A],
              [c.faq8Q, c.faq8A],
              [c.faq9Q, c.faq9A],
              [c.faq10Q, c.faq10A],
              [c.faq11Q, c.faq11A],
            ].map(([q, a], i) => (
              <li key={i} className="wb-aff-faq-item">
                <h3 className="wb-aff-faq-q">{q}</h3>
                <p className="wb-aff-faq-a">{a}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 9. Final CTA */}
        <section className="wb-aff-final">
          <h2 className="wb-aff-final-title">{c.finalTitle}</h2>
          <p className="wb-aff-final-sub">{c.finalSubtitle}</p>
          <a
            href={AFFONSO_PORTAL}
            target="_blank"
            rel="noopener noreferrer"
            className="wb-aff-cta-primary"
          >
            {c.finalCta}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
        </section>
      </main>

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href={href("/pricing")}>{v2(lang, "navPricing")}</Link>
        <span>·</span>
        <Link href={href("/affiliates")}>{c.navAffiliates}</Link>
        <span>·</span>
        <a href={`${AFFONSO_PORTAL}/legal`} target="_blank" rel="noopener noreferrer">
          {c.termsLink}
        </a>
        <span>·</span>
        <Link href={href("/privacy")}>Privacy</Link>
        <span>·</span>
        <Link href={href("/terms")}>Terms</Link>
      </footer>
    </div>
  );
}

// ─── Icons (no emojis — SVG only, per design rules) ────────────
function ProofIcon({ variant }: { variant: "commission" | "calendar" | "clock" | "badge" }) {
  const props = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (variant === "commission") {
    return (
      <svg {...props}>
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  }
  if (variant === "calendar") {
    return (
      <svg {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    );
  }
  if (variant === "clock") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function WhyIcon({ variant }: { variant: "dictionary" | "globe" | "family" }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (variant === "dictionary") {
    return (
      <svg {...props}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M9 7h7M9 11h5" />
      </svg>
    );
  }
  if (variant === "globe") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2c2.5 3 2.5 17 0 20M12 2c-2.5 3-2.5 17 0 20" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M3 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
      <circle cx="10" cy="8" r="3.5" />
      <path d="M17 11a3 3 0 1 0-2.5-5.5" />
      <path d="M21 21v-1.5a3 3 0 0 0-3-3h-1" />
    </svg>
  );
}

function WhoIcon({ variant }: { variant: "blogger" | "teacher" | "parent" }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (variant === "blogger") {
    return (
      <svg {...props}>
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <path d="M14 3v6h6M8 13h8M8 17h6" />
      </svg>
    );
  }
  if (variant === "teacher") {
    return (
      <svg {...props}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M15 21v-1.5a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3V21" />
    </svg>
  );
}

function GetIcon({ variant }: { variant: "link" | "copy" | "dashboard" | "support" }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (variant === "link") {
    return (
      <svg {...props}>
        <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 1 0-7.1-7.1L11.7 5" />
        <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 1 0 7.1 7.1L12.3 19" />
      </svg>
    );
  }
  if (variant === "copy") {
    return (
      <svg {...props}>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    );
  }
  if (variant === "dashboard") {
    return (
      <svg {...props}>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

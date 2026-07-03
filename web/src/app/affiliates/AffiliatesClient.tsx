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
import { LangSwitchMobile } from "@/components/LangSwitchMobile";
import { StartFreeCTA } from "@/components/StartFreeCTA";
import { GadVerbStamp } from "@/components/GadVerbStamp";
import { WbUserMenu } from "@/components/design/WbUserMenu";

const AFFONSO_PORTAL = "https://gaditapp.affonso.io";

// Commission math driving the calculator and the example table. Kept
// in one place so a future tweak (e.g. raising Deep to $5.99) updates
// every dollar figure on this page without copy drift.
const COMMISSION_RATE = 0.30;
const DEEP_PRICE = 4.99;

type Lang = "he" | "en" | "ar" | "ru" | "es" | "pt" | "fr" | "de" | "cs" | "sk" | "it" | "ja" | "hi";

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

    heroEyebrow: "תוכנית השותפים",
    heroTitle: "המליצו על Gadit.\nקבלו הכנסה חודשית.",
    heroSubtitle:
      "אתם משתפים את הקישור האישי שלכם, ואנחנו מתגמלים אתכם 30% עמלה חוזרת בשנה הראשונה. הביאו 10 לקוחות פעילים, הפכו ל-Active Partner וקבלו 10% לכל החיים.",
    heroCtaPrimary: "קבלו את הקישור האישי שלכם, בחינם",
    heroProofA: "30% בשנה הראשונה",
    heroProofB: "10% לכל החיים (Active Partner)",
    heroProofC: "קישור מיידי",
    heroProofD: "למנויי Clear ו-Deep",

    whyEyebrow: "קודם כול המוצר",
    whyTitle: "למה Gadit שווה המלצה",
    whySubtitle:
      "אתם תמליצו רק על משהו שאתם מאמינים בו. אז הנה מה שהקהל שלכם יקבל, ולמה הוא יודה לכם.",
    why1Title: "מילון אמיתי, לא תרגום יבש",
    why1Desc:
      "כל המשמעויות של מילה, דוגמאות אמיתיות לכל אחת, ניבים, מקור היסטורי ותמונה. Gadit מסביר מילה כמו שצריך, לא כמו שכל מילון רגיל עושה.",
    why2Title: "עובד ב-11 שפות, כולל עברית מלאה",
    why2Desc:
      "עברית, אנגלית, ערבית, רוסית, ספרדית, פורטוגזית, צרפתית, גרמנית, צ'כית, איטלקית ויפנית. מתאים גם לדוברי עברית וגם להורים של ילדים שלומדים שפה זרה.",
    why3Title: "תוכנן עבור הורים, מורים ולומדים",
    why3Desc:
      "הסבר לילדים, חידונים, משחקי מילים ומחברת אישית. Gadit לא בנוי לאקדמאים. הוא בנוי לבית, לכיתה ולקבוצת הוואטסאפ.",

    whoEyebrow: "למי זה מתאים",
    whoTitle: "אנשים שיש להם קהילה שסומכת עליהם",
    who1Title: "יוצרי תוכן ובלוגרי חינוך",
    who1Desc:
      "אם אתם כותבים, מצלמים או משתפים תוכן על שפה, למידה או חינוך, לקהל שלכם כבר יש אמון בהמלצות שלכם.",
    who2Title: "מורים, מטפלות ואנשי חינוך",
    who2Desc:
      "אם אתם עובדים עם תלמידים והורים, ההמלצה שלכם על כלי חינוכי מגיעה ממקום של אמון מקצועי.",
    who3Title: "הורים פעילים בקהילות",
    who3Desc:
      "קבוצות הורים, צ'אטים של כיתה, רשימות תפוצה: בכל מקום שבו הורים שואלים זה את זה על כלים שעוזרים לילדים שלהם.",

    howEyebrow: "איך זה עובד",
    howTitle: "שלושה צעדים, בלי שום ידע טכני",
    how1Title: "הרשמה לתוכנית",
    how1Desc:
      "טופס קצר. תוך דקה אתם מקבלים אישור אוטומטי, קישור אישי, וגישה לאזור האישי.",
    how2Title: "שיתוף הקישור",
    how2Desc:
      "בוואטסאפ של ההורים, במייל לרשימה, בסטורי באינסטגרם, בבלוג, או באישית. בכל מקום שמתאים לקהל שלכם.",
    how3Title: "תגמול שגדל איתכם",
    how3Desc:
      "30% עמלה חוזרת ל-12 חודש על כל לקוח שמצטרף דרך הקישור. כשתביאו 10 לקוחות פעילים תהפכו ל-Active Partner ותפתחו תוספת של 10% עמלה חוזרת לכל החיים, על כל הלקוחות שלכם, מהחודש ה-13 והלאה.",
    midCta1: "התחילו עכשיו. לוקח דקה.",

    getEyebrow: "מה תקבלו",
    getTitle: "אנחנו לא משאירים אתכם לבד",
    getSubtitle:
      "אם מעולם לא שיווקתם משהו בחיים, זה בסדר. הכל מוכן עבורכם.",
    get1Title: "קישור אישי משלכם",
    get1Desc:
      "קישור קצר וייחודי שאפשר לשתף בכל מקום. אפילו אם מישהו לחץ עליו וחזר רק בעוד 60 יום, ההרשמה עדיין משויכת אליכם.",
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
      "המספרים תלויים בקהל שלכם ובמה שאתם משתפים. הנה איך זה מצטבר. אנחנו לא מבטיחים סכום, אבל זה סדר הגודל.",
    calcSubsLabel: "מנויי Deep פעילים בחודש",
    calcMonthly: "תגמול חודשי",
    calcYearly: "ב-12 חודש",
    calcUnitSuffix: "מנויים",
    tableHeaderSubs: "כמות מנויים",
    tableHeaderMonthly: "תגמול חודשי",
    tableHeaderYearly: "ב-12 חודש",
    earnNote:
      "החישוב מבוסס על מנוי Deep ($4.99/חודש) ועל 30% עמלה בשנה הראשונה. מהחודש ה-13, Active Partners מקבלים תוספת של 10% עמלה לכל החיים על אותם לקוחות. תגמולים משתחררים אחרי תקופת המתנה של 30 יום, ותשלום מתבצע כשהצטברו $50 (סף תשלום מינימלי, לא תקרה).",
    midCta2: "מוכנים להתחיל? קבלו את הקישור שלכם",

    trustEyebrow: "למה לסמוך",
    trustTitle: "תוכנית מייסדים בשלביה הראשונים",
    founderHeading: "למה יצרתי את Gadit?",
    founderBody:
      "השליחות שלי תמיד הייתה אחת: לעזור לאנשים להבין דברים עד הסוף. כי כשמבינים באמת, אפשר ליישם. וכשאפשר ליישם, אפשר להשיג כל מה שרוצים.\n\nבמהלך השנים ראיתי אנשים חכמים, מוכשרים, שרצו להבין משהו ולא הצליחו. הם חשבו שהם פשוט \"לא מבינים בזה\". אבל זה לא היה הם. זאת הייתה מילה אחת בדרך.\n\nבניתי את Gadit כדי להסיר את המחסום הזה. לא עוד מילון. לא סתם תרגום. כלי שמסביר כל מילה עד הסוף, בפשטות, עם דוגמאות, עם הקשר ועם תמונה שמחיה אותה. אנחנו קוראים לזה לעשות GAD למילה.\n\nתוכנית השותפים פתוחה עכשיו לאנשים שמתחברים לרעיון הזה ורוצים להפיץ אותו הלאה. אם זה אתם, אשמח אם תצטרפו.",
    founderSign: "גדי בן לביא, מייסד Gadit",
    stat1Num: "9",
    stat1Label: "שפות ממשק נתמכות",
    stat2Num: "30%",
    stat2Label: "עמלה חוזרת ל-12 חודש",
    stat3Num: "60",
    stat3Label: "ימים: חלון זיכרון של הקישור",

    faqEyebrow: "שאלות נפוצות",
    faqTitle: "מה כדאי לדעת",
    faq1Q: "האם אני צריך להיות משווק?",
    faq1A:
      "לא. רוב השותפים שלנו הם הורים, מורים ובלוגרים שמעולם לא שיווקו דבר. כל מה שצריך זה לשתף את הקישור עם אנשים שיכולים להפיק מ-Gadit.",
    faq2Q: "האם מותר לשתף בקבוצות וואטסאפ או פייסבוק?",
    faq2A:
      "כן, וזה אחד הערוצים הטובים ביותר לקהל שלנו. הורים שואלים זה את זה על כלים בקבוצות, ושם ההמלצה שלכם הכי משפיעה.",
    faq3Q: "מתי אני מקבל את התשלום?",
    faq3A:
      "תשלום חודשי בסוף כל חודש, אחרי שהצטברו $50. סף התשלום הוא $50 כסכום מינימלי, לא תקרה. תוכלו להרוויח הרבה יותר ממנו, פשוט מקבלים בפועל ברגע שעוברים אותו.",
    faq4Q: "מה קורה אם הלקוח שלי מבטל?",
    faq4A:
      "תקבלו עמלה רק על החודשים שהלקוח שילם בפועל. אם הוא ביטל אחרי 4 חודשים, קיבלתם 4 חודשים של תגמול. הוגן לשני הצדדים.",
    faq5Q: "האם יש מגבלה על כמות לקוחות?",
    faq5A:
      "בכלל לא. תוכלו להביא כמה לקוחות שתרצו, מכל מקום בעולם, בכל אחת מ-9 השפות ש-Gadit תומך בהן.",
    faq6Q: "מה הקישור עושה אם מישהו לא נרשם מיד?",
    faq6A:
      "הקישור זוכר אתכם ל-60 יום. אם מישהו לחץ עליו, התלבט שבועיים, וחזר לרכוש מנוי, ההרשמה עדיין נחשבת שלכם.",
    faq7Q: "מה לגבי מנוי שנתי?",
    faq7A:
      "על מנוי שנתי אתם מקבלים תגמול חד-פעמי של 15% מהתשלום הראשון (במקום 30% חודשי לאורך השנה). זה איזון נכון בגלל ההנחה שאנחנו נותנים על תשלום שנתי.",
    faq8Q: "האם אקבל חומרי שיווק מוכנים?",
    faq8A:
      "כן. תוכלו להעתיק טקסטים מוכנים לוואטסאפ, מייל להורים, פוסטים לפייסבוק וטיוטות לסטורי. אם תרצו משהו ספציפי, תפנו ואנחנו נכין.",
    faq9Q: "האם מותר לפרסם מודעות ממומנות בגוגל או פייסבוק?",
    faq9A:
      "מודעות אורגניות לקהל שלכם: כן. אבל אסור לקנות מודעות בגוגל או פייסבוק על המילה 'Gadit' עצמה. אנחנו לא רוצים שתתחרו באתר הראשי על אותה תנועה. כללים מלאים באזור האישי.",
    faq10Q: "האם אני חייב להיות מנוי בתשלום כדי להיות שותף?",
    faq10A:
      "כן. תוכנית השותפים פתוחה רק למנויי Clear ו-Deep. המלצה טובה מתחילה ממוצר שאתם מכירים בעצמכם. אם אתם עוד במסלול Basic, שדרגו ל-Clear או Deep מתוך המסך 'מחירים', ותקבלו גם את המילון המלא וגם גישה לתוכנית.",
    faq11Q: "מה זה Active Partner ואיך מגיעים לזה?",
    faq11A:
      "כשהבאתם 10 לקוחות משלמים פעילים, אתם הופכים אוטומטית ל-Active Partner. הסטטוס פותח לכם תוספת של 10% עמלה חוזרת לכל החיים, על כל הלקוחות שלכם (גם הקיימים, מהחודש ה-13 והלאה). זה אומר שגם אחרי שנתיים, שלוש או חמש שנים, אם הלקוחות שלכם עדיין מנויים, אתם עדיין מקבלים תגמול.",

    finalTitle: "מוכנים להתחיל?",
    finalSubtitle:
      "ההרשמה לוקחת דקה. אישור אוטומטי. הקישור מוכן מיד.",
    finalCta: "קבלו את הקישור האישי שלכם, בחינם",
    termsLink: "תנאי תוכנית השותפים",
  },

  en: {
    navAffiliates: "Affiliates",
    topbarSignIn: "Already a partner? Sign in",

    heroEyebrow: "Partner Program",
    heroTitle: "Recommend Gadit.\nEarn monthly.",
    heroSubtitle:
      "You share your personal link, and we reward you with 30% recurring commission in year one. Bring 10 active customers, become an Active Partner, and earn 10% for life.",
    heroCtaPrimary: "Get your personal link, free",
    heroProofA: "30% in year one",
    heroProofB: "10% lifetime (Active Partner)",
    heroProofC: "Instant link",
    heroProofD: "Clear & Deep subscribers",

    whyEyebrow: "Before the money",
    whyTitle: "Why Gadit is worth recommending",
    whySubtitle:
      "You'll only recommend something you believe in. Here's what your audience actually gets, and why they'll thank you.",
    why1Title: "A real dictionary, not just translation",
    why1Desc:
      "Every meaning of a word, real examples for each, idioms, historical origin, and an image. Gadit explains a word properly, not like a regular dictionary.",
    why2Title: "Works in 11 languages",
    why2Desc:
      "Hebrew, English, Arabic, Russian, Spanish, Portuguese, French, German, Czech, Italian and Japanese, including full right-to-left support for Hebrew and Arabic. Works for native speakers and for parents of kids learning a second language.",
    why3Title: "Designed for parents, teachers and learners",
    why3Desc:
      "Kid-friendly explanations, quizzes, word games and a personal notebook. Gadit isn't for academics, it's for the home, the classroom and the WhatsApp group.",

    whoEyebrow: "Who it's for",
    whoTitle: "People whose community trusts them",
    who1Title: "Content creators & education bloggers",
    who1Desc:
      "If you write, film, or share content about language, learning, or education, your audience already trusts your recommendations.",
    who2Title: "Teachers, tutors and speech therapists",
    who2Desc:
      "If you work with students and parents, your recommendation of an educational tool carries professional weight.",
    who3Title: "Active community parents",
    who3Desc:
      "Parent groups, class chats, mailing lists, anywhere parents ask each other about tools that help their kids.",

    howEyebrow: "How it works",
    howTitle: "Three steps, no technical skills",
    how1Title: "Sign up to the program",
    how1Desc:
      "Short form. Within a minute you're approved automatically with a personal link and a dashboard.",
    how2Title: "Share your link",
    how2Desc:
      "In a parent WhatsApp, in a mailing list, in an Instagram story, on a blog, or in person, wherever fits your audience.",
    how3Title: "Rewards that grow with you",
    how3Desc:
      "30% recurring commission for 12 months on every customer who signs up through your link. Bring 10 active customers and you become an Active Partner, unlocking an additional 10% lifetime commission on all your customers, from month 13 onward.",
    midCta1: "Start now, takes a minute",

    getEyebrow: "What you get",
    getTitle: "We don't leave you on your own",
    getSubtitle:
      "If you've never marketed anything in your life, that's fine. Everything is ready for you.",
    get1Title: "Your personal link",
    get1Desc:
      "A short, unique link you can share anywhere. Even if someone clicks it and comes back 60 days later, the signup still credits to you.",
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
      "Numbers depend on your audience and what you share. Here's how it adds up, we don't promise a specific amount, but the order of magnitude is real.",
    calcSubsLabel: "Active Deep subscribers per month",
    calcMonthly: "Monthly reward",
    calcYearly: "Over 12 months",
    calcUnitSuffix: "subscribers",
    tableHeaderSubs: "Subscribers",
    tableHeaderMonthly: "Monthly reward",
    tableHeaderYearly: "Over 12 months",
    earnNote:
      "Calculation based on Deep subscription ($4.99/month) and 30% commission in year one. From month 13, Active Partners earn an additional 10% lifetime commission on those same customers. Rewards release after a 30-day hold, and payouts happen once $50 has accumulated ($50 is the minimum payout threshold, not a ceiling).",
    midCta2: "Ready to start? Get your link",

    trustEyebrow: "Why trust us",
    trustTitle: "A founding partners program in its early days",
    founderHeading: "Why I created Gadit?",
    founderBody:
      "My mission has always been one thing: to help people understand things all the way through. Because when you really understand, you can apply. And when you can apply, you can achieve anything you want.\n\nOver the years I've seen smart, talented people who wanted to understand something and couldn't. They thought they just \"weren't built for it.\" But it wasn't them. It was one word along the way.\n\nI built Gadit to remove that barrier. Not another dictionary. Not just a translation. A tool that explains every word all the way through, simply, with examples, with context, and with an image that brings it to life. We call it GAD-ing a word.\n\nThe partner program is now open to people who connect with this idea and want to help spread it further. If that's you, I'd be glad to have you join.",
    founderSign: "Gadi Ben Lavi, founder of Gadit",
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
      "Yes, and that's one of the best channels for our audience. Parents ask each other about tools in groups, and that's where your recommendation carries the most weight.",
    faq3Q: "When do I get paid?",
    faq3A:
      "Monthly payouts at the end of each month, once $50 has accumulated. The $50 is a minimum payout threshold, not a ceiling. You can earn much more than that; you just receive the actual payout once you cross the threshold.",
    faq4Q: "What if my referred customer cancels?",
    faq4A:
      "You earn only for the months the customer actually paid. If they cancel after 4 months, you've earned 4 months of reward. Fair to both sides.",
    faq5Q: "Is there a limit on how many customers I can refer?",
    faq5A:
      "No limit. You can refer as many customers as you like, from anywhere in the world, in any of the 11 languages Gadit supports.",
    faq6Q: "What does the link do if someone doesn't sign up right away?",
    faq6A:
      "The link remembers you for 60 days. If someone clicks it, hesitates for two weeks, then comes back and subscribes, the signup still credits to you.",
    faq7Q: "What about yearly subscriptions?",
    faq7A:
      "Yearly plans pay a 15% one-time reward on the first payment (instead of 30% monthly for 12 months). This balances the discount we offer on the yearly price.",
    faq8Q: "Will I get ready-made marketing materials?",
    faq8A:
      "Yes. You can copy ready-to-use texts for WhatsApp, a parent email, Facebook posts and Instagram story drafts. If you need something specific, ask, and we'll prepare it.",
    faq9Q: "Can I run paid ads on Google or Facebook?",
    faq9A:
      "Organic posts to your own audience, yes. But you can't buy paid ads on Google or Facebook for the word 'Gadit' itself, we don't want you competing with the main site for the same traffic. The full rules are in your dashboard.",
    faq10Q: "Do I need to be a paying subscriber to be a partner?",
    faq10A:
      "Yes. The partner program is open to Clear and Deep subscribers only. The reason is simple, you can't credibly recommend a product you don't use yourself. If you're on Basic, upgrade to Clear or Deep from the Pricing page and you'll get both the full dictionary and access to the partner program.",
    faq11Q: "What is an Active Partner and how do I become one?",
    faq11A:
      "Once you've referred 10 active paying customers, you automatically become an Active Partner, a status that unlocks an additional 10% recurring lifetime commission on all your customers (including existing ones, from month 13 onward). That means even two, three, or five years later, as long as your customers stay subscribed, you keep earning.",

    finalTitle: "Ready to start?",
    finalSubtitle:
      "Signup takes a minute. Auto-approval. Your link is ready instantly.",
    finalCta: "Get your personal link, free",
    termsLink: "Partner program terms",
  },

  // Seven non-primary languages temporarily fall back to English copy
  // with only the nav label localized. Better than shipping machine
  // translations in all 9. The spread reads COPY.en — which is fully
  // initialized by the time these property initializers run because
  // object literal properties evaluate in source order, top-down.
  ar: {
    navAffiliates: "الشركاء",
    topbarSignIn: "شريك بالفعل؟ تسجيل دخول",

    heroEyebrow: "برنامج الشركاء",
    heroTitle: "ارشد إلى Gadit.\nاكسب شهرياً.",
    heroSubtitle:
      "تشارك رابطك الشخصي، ونكافئك بعمولة 30% متكررة في السنة الأولى. اجلب 10 عملاء نشطين، وكن Active Partner، واكسب 10% مدى الحياة.",
    heroCtaPrimary: "احصل على رابطك الشخصي، مجاناً",
    heroProofA: "30% في السنة الأولى",
    heroProofB: "10% مدى الحياة (Active Partner)",
    heroProofC: "رابط فوري",
    heroProofD: "لمشتركي Clear و Deep",

    whyEyebrow: "المنتج أولاً",
    whyTitle: "لماذا يستحق Gadit التوصية",
    whySubtitle:
      "أنت تنصح فقط بما تؤمن به. هذا ما سيحصل عليه جمهورك، ولماذا سيشكرك.",
    why1Title: "قاموس حقيقي، لا ترجمة جافة",
    why1Desc:
      "كل معاني الكلمة، أمثلة حقيقية لكل معنى، تعابير اصطلاحية، أصل تاريخي وصورة. Gadit يشرح الكلمة كما ينبغي، لا كما يفعل أي قاموس عادي.",
    why2Title: "يعمل بـ 11 لغة",
    why2Desc:
      "العبرية، الإنجليزية، العربية، الروسية، الإسبانية، البرتغالية، الفرنسية، الألمانية، التشيكية، الإيطالية واليابانية. مناسب للناطقين الأصليين وللآباء الذين يتعلم أطفالهم لغة ثانية.",
    why3Title: "مصمم للآباء والمعلمين والمتعلمين",
    why3Desc:
      "شرح للأطفال، اختبارات، ألعاب كلمات ودفتر شخصي. Gadit ليس للأكاديميين. هو للبيت، للفصل ولمجموعة الواتساب.",

    whoEyebrow: "لمن هذا البرنامج",
    whoTitle: "أناس لديهم مجتمع يثق بهم",
    who1Title: "صانعو المحتوى ومدوّنو التعليم",
    who1Desc:
      "إذا كنت تكتب أو تصوّر أو تشارك محتوى عن اللغة والتعلم والتعليم، فجمهورك يثق بالفعل في توصياتك.",
    who2Title: "المعلمون والمعالجون والمربون",
    who2Desc:
      "إذا كنت تعمل مع الطلاب وأولياء الأمور، فإن توصيتك بأداة تعليمية تأتي من مكان ثقة مهنية.",
    who3Title: "آباء ناشطون في المجتمعات",
    who3Desc:
      "مجموعات الآباء، محادثات الصف، القوائم البريدية: أينما يسأل الآباء بعضهم البعض عن أدوات تساعد أطفالهم.",

    howEyebrow: "كيف يعمل",
    howTitle: "ثلاث خطوات، بلا أي معرفة تقنية",
    how1Title: "الانضمام إلى البرنامج",
    how1Desc:
      "نموذج قصير. خلال دقيقة تحصل على موافقة تلقائية، رابط شخصي وصلاحية الوصول إلى لوحتك.",
    how2Title: "مشاركة الرابط",
    how2Desc:
      "في واتساب الأهل، في بريد إلى قائمتك، في ستوري إنستغرام، في مدونتك أو شخصياً. أينما يناسب جمهورك.",
    how3Title: "مكافأة تكبر معك",
    how3Desc:
      "30% عمولة متكررة لمدة 12 شهراً عن كل عميل ينضم عبر رابطك. عند جلبك 10 عملاء نشطين تصبح Active Partner، وتفتح زيادة 10% عمولة متكررة مدى الحياة على جميع عملائك من الشهر الـ 13 فصاعداً.",
    midCta1: "ابدأ الآن. تستغرق دقيقة.",

    getEyebrow: "ما ستحصل عليه",
    getTitle: "لن نتركك وحدك",
    getSubtitle:
      "إذا لم تسوّق شيئاً في حياتك من قبل، فلا بأس. كل شيء جاهز لك.",
    get1Title: "رابطك الشخصي",
    get1Desc:
      "رابط قصير وفريد يمكنك مشاركته في أي مكان. حتى لو ضغط أحدهم عليه ثم عاد بعد 60 يوماً، فالتسجيل لا يزال محسوباً لك.",
    get2Title: "نصوص جاهزة للمشاركة",
    get2Desc:
      "منشورات جاهزة لواتساب وفيسبوك، رسالة بريدية للأهل وأفكار لستوريات إنستغرام. فقط انسخ وشارك.",
    get3Title: "لوحة شخصية منظمة",
    get3Desc:
      "ترى في الوقت الحقيقي: كم ضغطوا على الرابط، كم سجّلوا، كم ترقّوا، وكم تستلم. كل شيء شفاف.",
    get4Title: "دعم شخصي",
    get4Desc:
      "سؤال عن البرنامج؟ مشكلة في الرابط؟ هناك من تتواصل معه. نرد خلال يوم عمل.",

    earnEyebrow: "كم يمكن أن تكسب",
    earnTitle: "حرّك الشريط لترى",
    earnSubtitle:
      "الأرقام تعتمد على جمهورك وما تشاركه. هكذا يتراكم. لا نَعِد بمبلغ، لكن هذا حجم الأرقام.",
    calcSubsLabel: "مشتركو Deep النشطون شهرياً",
    calcMonthly: "المكافأة الشهرية",
    calcYearly: "خلال 12 شهراً",
    calcUnitSuffix: "مشترك",
    tableHeaderSubs: "عدد المشتركين",
    tableHeaderMonthly: "المكافأة الشهرية",
    tableHeaderYearly: "خلال 12 شهراً",
    earnNote:
      "الحساب مبني على اشتراك Deep ($4.99/شهر) و30% عمولة في السنة الأولى. من الشهر الـ 13، يحصل Active Partners على 10% إضافية مدى الحياة على نفس العملاء. تصدر المكافآت بعد فترة انتظار 30 يوماً، ويتم الدفع عند تراكم $50 (حد أدنى للدفع، وليس سقفاً).",
    midCta2: "جاهز للبدء؟ احصل على رابطك",

    trustEyebrow: "لماذا الثقة",
    trustTitle: "برنامج مؤسس في مراحله الأولى",
    founderHeading: "لماذا أنشأت Gadit؟",
    founderBody:
      "مهمتي كانت دائماً واحدة: مساعدة الناس على فهم الأشياء حتى النهاية. لأنه عندما تفهم حقاً، يمكنك التطبيق. وعندما يمكنك التطبيق، يمكنك تحقيق كل ما تريد.\n\nخلال السنوات رأيت أناساً أذكياء وموهوبين أرادوا فهم شيء ولم يستطيعوا. ظنوا أنهم ببساطة \"لا يفهمون هذا\". لكن لم تكن المشكلة فيهم. كانت كلمة واحدة في الطريق.\n\nبنيت Gadit لإزالة هذه العقبة. ليس قاموساً آخر. ليس مجرد ترجمة. أداة تشرح كل كلمة حتى النهاية، ببساطة، بأمثلة، بسياق وبصورة تنبضها بالحياة. نحن نسمي ذلك القيام بـ GAD لكلمة.\n\nبرنامج الشركاء مفتوح الآن لأناس يتصلون بهذه الفكرة ويريدون نشرها أكثر. إذا كان هذا أنت، يسعدني أن تنضم.",
    founderSign: "غادي بن لافي، مؤسس Gadit",
    stat1Num: "9",
    stat1Label: "لغات واجهة مدعومة",
    stat2Num: "30%",
    stat2Label: "عمولة متكررة لمدة 12 شهراً",
    stat3Num: "60",
    stat3Label: "يوم: نافذة تذكّر الرابط",

    faqEyebrow: "الأسئلة الشائعة",
    faqTitle: "ما يحسن معرفته",
    faq1Q: "هل يجب أن أكون مسوّقاً؟",
    faq1A:
      "لا. معظم شركائنا آباء ومعلمون ومدوّنون لم يسوّقوا شيئاً من قبل. كل ما تحتاجه هو مشاركة الرابط مع أناس يمكن أن يستفيدوا من Gadit.",
    faq2Q: "هل يمكن المشاركة في مجموعات واتساب أو فيسبوك؟",
    faq2A:
      "نعم، وهي من أفضل القنوات لجمهورنا. الآباء يسألون بعضهم عن أدوات في المجموعات، وهناك توصيتك تترك أكبر أثر.",
    faq3Q: "متى أتلقى الدفع؟",
    faq3A:
      "دفع شهري في نهاية كل شهر بعد تراكم $50. حد الـ $50 هو حد أدنى للدفع، ليس سقفاً. يمكنك أن تربح أكثر بكثير، فقط تستلم فعلياً عندما تتجاوزه.",
    faq4Q: "ماذا يحدث إذا ألغى عميلي اشتراكه؟",
    faq4A:
      "ستحصل على عمولة فقط عن الأشهر التي دفع فيها العميل فعلاً. إذا ألغى بعد 4 أشهر، استلمت 4 أشهر من المكافأة. عادل للطرفين.",
    faq5Q: "هل هناك حد لعدد العملاء؟",
    faq5A:
      "إطلاقاً. يمكنك جلب أي عدد من العملاء، من أي مكان في العالم، بأي من اللغات الـ 11 التي يدعمها Gadit.",
    faq6Q: "ماذا يفعل الرابط إذا لم يسجّل أحدهم فوراً؟",
    faq6A:
      "الرابط يتذكرك لمدة 60 يوماً. إذا ضغط أحدهم عليه، فكّر أسبوعين، ثم عاد لشراء اشتراك، فإن التسجيل لا يزال محسوباً لك.",
    faq7Q: "ماذا عن الاشتراك السنوي؟",
    faq7A:
      "على اشتراك سنوي تحصل على مكافأة لمرة واحدة بنسبة 15% من الدفعة الأولى (بدلاً من 30% شهرياً على مدار السنة). هذا توازن عادل بسبب الخصم الذي نقدّمه على الدفع السنوي.",
    faq8Q: "هل سأحصل على مواد تسويقية جاهزة؟",
    faq8A:
      "نعم. يمكنك نسخ نصوص جاهزة لواتساب، رسالة بريدية للأهل، منشورات لفيسبوك ومسوّدات ستوريات. إذا أردت شيئاً محدداً، تواصل معنا وسنُجهّزه.",
    faq9Q: "هل يمكن نشر إعلانات مدفوعة في غوغل أو فيسبوك؟",
    faq9A:
      "إعلانات عضوية لجمهورك: نعم. لكن لا يجوز شراء إعلانات في غوغل أو فيسبوك على كلمة 'Gadit' نفسها. لا نريد أن تتنافس مع الموقع الرئيسي على نفس الزيارات. القواعد الكاملة في لوحتك.",
    faq10Q: "هل يجب أن أكون مشتركاً مدفوعاً لأكون شريكاً؟",
    faq10A:
      "نعم. برنامج الشركاء مفتوح فقط لمشتركي Clear و Deep. التوصية الجيدة تبدأ بمنتج تعرفه بنفسك. إذا كنت لا تزال في Basic، ارفع خطّتك إلى Clear أو Deep من شاشة 'الأسعار'، وستحصل على القاموس الكامل وعلى الوصول إلى البرنامج.",
    faq11Q: "ما هو Active Partner وكيف نصل إليه؟",
    faq11A:
      "عندما تجلب 10 عملاء نشطين يدفعون، تصبح تلقائياً Active Partner. هذا الوضع يفتح لك 10% عمولة متكررة إضافية مدى الحياة على جميع عملائك (بمن فيهم الحاليون، من الشهر الـ 13 فصاعداً). يعني ذلك أنه حتى بعد سنتين أو ثلاث أو خمس سنوات، إذا ظل عملاؤك مشتركين، تظل تتقاضى مكافأة.",

    finalTitle: "جاهز للبدء؟",
    finalSubtitle: "التسجيل يأخذ دقيقة. موافقة تلقائية. الرابط جاهز فوراً.",
    finalCta: "احصل على رابطك الشخصي، مجاناً",
    termsLink: "شروط برنامج الشركاء",
  },
  ru: {
    navAffiliates: "Партнёры",
    topbarSignIn: "Уже партнёр? Войти",

    heroEyebrow: "Партнёрская программа",
    heroTitle: "Рекомендуй Gadit.\nЗарабатывай ежемесячно.",
    heroSubtitle:
      "Ты делишься своей персональной ссылкой, а мы выплачиваем тебе 30% повторяющейся комиссии в первый год. Приведи 10 активных клиентов, стань Active Partner и получай 10% пожизненно.",
    heroCtaPrimary: "Получи свою персональную ссылку, бесплатно",
    heroProofA: "30% в первый год",
    heroProofB: "10% пожизненно (Active Partner)",
    heroProofC: "Мгновенная ссылка",
    heroProofD: "Для подписчиков Clear и Deep",

    whyEyebrow: "Сначала продукт",
    whyTitle: "Почему Gadit стоит рекомендовать",
    whySubtitle:
      "Ты рекомендуешь только то, во что веришь сам. Вот что получит твоя аудитория и за что скажет тебе спасибо.",
    why1Title: "Настоящий словарь, а не сухой перевод",
    why1Desc:
      "Все значения слова, реальные примеры для каждого, идиомы, историческое происхождение и изображение. Gadit объясняет слово так, как и должен, не как обычный словарь.",
    why2Title: "Работает на 11 языках",
    why2Desc:
      "Иврит, английский, арабский, русский, испанский, португальский, французский, немецкий, чешский, итальянский и японский. Подходит и носителям языка, и родителям детей, изучающих второй язык.",
    why3Title: "Создан для родителей, учителей и учащихся",
    why3Desc:
      "Объяснение для детей, тесты, словесные игры и личный блокнот. Gadit не для академиков. Он для дома, класса и группы в WhatsApp.",

    whoEyebrow: "Кому подойдёт",
    whoTitle: "Люди, у которых есть сообщество, доверяющее им",
    who1Title: "Авторы контента и блогеры об образовании",
    who1Desc:
      "Если ты пишешь, снимаешь или делишься контентом о языке, обучении или образовании, твоя аудитория уже доверяет твоим рекомендациям.",
    who2Title: "Учителя, терапевты и педагоги",
    who2Desc:
      "Если ты работаешь с учениками и родителями, твоя рекомендация образовательного инструмента приходит из места профессионального доверия.",
    who3Title: "Активные родители в сообществах",
    who3Desc:
      "Группы родителей, классные чаты, рассылки: везде, где родители спрашивают друг друга об инструментах, которые помогают их детям.",

    howEyebrow: "Как это работает",
    howTitle: "Три шага, без всяких технических знаний",
    how1Title: "Регистрация в программе",
    how1Desc:
      "Короткая форма. В течение минуты ты получаешь автоматическое одобрение, персональную ссылку и доступ к личному кабинету.",
    how2Title: "Делишься ссылкой",
    how2Desc:
      "В родительском WhatsApp, в письме к своему списку, в Stories Instagram, в блоге или лично. Везде, где это подходит твоей аудитории.",
    how3Title: "Награда, которая растёт вместе с тобой",
    how3Desc:
      "30% повторяющейся комиссии в течение 12 месяцев за каждого клиента, оформившего подписку по твоей ссылке. Когда приведёшь 10 активных клиентов, ты становишься Active Partner и открываешь дополнительные 10% повторяющейся комиссии пожизненно, на всех своих клиентов, начиная с 13-го месяца.",
    midCta1: "Начни сейчас. Это занимает минуту.",

    getEyebrow: "Что ты получаешь",
    getTitle: "Мы не оставляем тебя одного",
    getSubtitle:
      "Если ты никогда в жизни ничего не продвигал, это нормально. Всё уже подготовлено для тебя.",
    get1Title: "Твоя собственная персональная ссылка",
    get1Desc:
      "Короткая, уникальная ссылка, которую можно делиться где угодно. Даже если кто-то перешёл по ней и вернулся только через 60 дней, регистрация всё ещё считается твоей.",
    get2Title: "Готовые тексты для шеринга",
    get2Desc:
      "Готовые посты для WhatsApp и Facebook, письмо для родителей и идеи для Stories в Instagram. Только копируй и делись.",
    get3Title: "Аккуратный личный кабинет",
    get3Desc:
      "Видишь в реальном времени: сколько перешли по ссылке, сколько зарегистрировались, сколько перешли на платный план и сколько ты получаешь. Всё прозрачно.",
    get4Title: "Личная поддержка",
    get4Desc:
      "Вопрос по программе? Проблема со ссылкой? Есть к кому обратиться. Мы отвечаем в течение рабочего дня.",

    earnEyebrow: "Сколько можно заработать",
    earnTitle: "Двигай ползунок и смотри",
    earnSubtitle:
      "Цифры зависят от твоей аудитории и того, чем делишься. Вот как это накапливается. Мы не обещаем сумму, но это порядок величины.",
    calcSubsLabel: "Активных подписчиков Deep в месяц",
    calcMonthly: "Ежемесячная награда",
    calcYearly: "За 12 месяцев",
    calcUnitSuffix: "подписчиков",
    tableHeaderSubs: "Подписчики",
    tableHeaderMonthly: "Ежемесячная награда",
    tableHeaderYearly: "За 12 месяцев",
    earnNote:
      "Расчёт основан на подписке Deep ($4.99/мес) и 30% комиссии в первый год. С 13-го месяца Active Partners получают дополнительные 10% пожизненно по тем же клиентам. Награды освобождаются после 30-дневного периода ожидания, выплата производится при накоплении $50 (минимальный порог выплаты, не потолок).",
    midCta2: "Готов начать? Получи свою ссылку",

    trustEyebrow: "Почему стоит доверять",
    trustTitle: "Основательская программа на ранней стадии",
    founderHeading: "Почему я создал Gadit?",
    founderBody:
      "Моя миссия всегда была одна: помогать людям понимать вещи до конца. Потому что когда понимаешь по-настоящему, можно применить. А когда можно применить, можно достичь всего, чего хочешь.\n\nЗа годы я видел умных, талантливых людей, которые хотели что-то понять и не могли. Они думали, что просто «не врубаются». Но дело было не в них. Дело было в одном слове на пути.\n\nЯ построил Gadit, чтобы убрать этот барьер. Не ещё один словарь. Не просто перевод. Инструмент, который объясняет каждое слово до конца, просто, с примерами, с контекстом и с картинкой, которая оживляет его. Мы называем это сделать GAD слову.\n\nПартнёрская программа открыта сейчас для людей, которые откликаются на эту идею и хотят нести её дальше. Если это ты, я буду рад, если ты присоединишься.",
    founderSign: "Гади Бен Лави, основатель Gadit",
    stat1Num: "9",
    stat1Label: "поддерживаемых языков интерфейса",
    stat2Num: "30%",
    stat2Label: "повторяющаяся комиссия за 12 месяцев",
    stat3Num: "60",
    stat3Label: "дней: окно памяти ссылки",

    faqEyebrow: "Частые вопросы",
    faqTitle: "Что стоит знать",
    faq1Q: "Нужно ли быть маркетологом?",
    faq1A:
      "Нет. Большинство наших партнёров, это родители, учителя и блогеры, которые никогда ничего не продвигали. Всё, что нужно,, поделиться ссылкой с людьми, которым может быть полезен Gadit.",
    faq2Q: "Можно ли делиться в группах WhatsApp или Facebook?",
    faq2A:
      "Да, и это один из лучших каналов для нашей аудитории. Родители спрашивают друг друга об инструментах в группах, и именно там твоя рекомендация имеет самый сильный эффект.",
    faq3Q: "Когда я получаю выплату?",
    faq3A:
      "Ежемесячная выплата в конце каждого месяца, после накопления $50. Порог $50, это минимум для выплаты, не потолок. Можно заработать гораздо больше, просто фактически получаешь деньги в тот момент, когда переходишь этот порог.",
    faq4Q: "Что если мой клиент отменит подписку?",
    faq4A:
      "Ты получишь комиссию только за месяцы, которые клиент фактически оплатил. Если он отменил после 4 месяцев, ты получил 4 месяца награды. Честно для обеих сторон.",
    faq5Q: "Есть ли ограничение по количеству клиентов?",
    faq5A:
      "Совсем нет. Можешь привести сколько угодно клиентов, из любой точки мира, на любом из 11 языков, которые поддерживает Gadit.",
    faq6Q: "Что делает ссылка, если кто-то не регистрируется сразу?",
    faq6A:
      "Ссылка помнит тебя 60 дней. Если кто-то нажал, подумал две недели и вернулся оформить подписку, регистрация всё ещё считается твоей.",
    faq7Q: "А как с годовой подпиской?",
    faq7A:
      "За годовую подписку ты получаешь разовую награду 15% от первого платежа (вместо 30% ежемесячно в течение года). Это справедливый баланс с учётом скидки, которую мы даём на годовой платёж.",
    faq8Q: "Получу ли я готовые маркетинговые материалы?",
    faq8A:
      "Да. Можно скопировать готовые тексты для WhatsApp, письмо для родителей, посты для Facebook и черновики Stories. Если нужно что-то конкретное, напиши, и мы подготовим.",
    faq9Q: "Можно ли делать платную рекламу в Google или Facebook?",
    faq9A:
      "Органические посты для своей аудитории, да. Но нельзя покупать рекламу в Google или Facebook по слову «Gadit». Мы не хотим, чтобы ты конкурировал с основным сайтом за тот же трафик. Полные правила, в личном кабинете.",
    faq10Q: "Нужно ли быть платным подписчиком, чтобы быть партнёром?",
    faq10A:
      "Да. Партнёрская программа открыта только для подписчиков Clear и Deep. Хорошая рекомендация начинается с продукта, который знаешь сам. Если ты ещё на Basic, перейди на Clear или Deep с экрана «Цены», и ты получишь и полный словарь, и доступ к программе.",
    faq11Q: "Что такое Active Partner и как им стать?",
    faq11A:
      "Когда ты приведёшь 10 активных платящих клиентов, ты автоматически становишься Active Partner. Этот статус открывает дополнительные 10% повторяющейся комиссии пожизненно, на всех твоих клиентов (включая существующих, начиная с 13-го месяца). Это значит, что даже через два, три или пять лет, если твои клиенты всё ещё подписаны, ты всё ещё получаешь награду.",

    finalTitle: "Готов начать?",
    finalSubtitle:
      "Регистрация занимает минуту. Автоматическое одобрение. Ссылка готова мгновенно.",
    finalCta: "Получи свою персональную ссылку, бесплатно",
    termsLink: "Условия партнёрской программы",
  },
  es: {
    navAffiliates: "Afiliados",
    topbarSignIn: "¿Ya eres socio? Acceder",

    heroEyebrow: "Programa de afiliados",
    heroTitle: "Recomienda Gadit.\nGana cada mes.",
    heroSubtitle:
      "Compartes tu enlace personal y te recompensamos con 30% de comisión recurrente durante el primer año. Trae 10 clientes activos, conviértete en Active Partner y gana 10% de por vida.",
    heroCtaPrimary: "Consigue tu enlace personal, gratis",
    heroProofA: "30% el primer año",
    heroProofB: "10% de por vida (Active Partner)",
    heroProofC: "Enlace inmediato",
    heroProofD: "Para suscriptores Clear y Deep",

    whyEyebrow: "Primero el producto",
    whyTitle: "Por qué vale la pena recomendar Gadit",
    whySubtitle:
      "Solo recomendarás algo en lo que crees. Esto es lo que tu audiencia va a recibir, y por qué te lo agradecerá.",
    why1Title: "Un diccionario de verdad, no una traducción seca",
    why1Desc:
      "Todos los significados de una palabra, ejemplos reales para cada uno, expresiones, origen histórico y una imagen. Gadit explica una palabra como debería, no como cualquier diccionario común.",
    why2Title: "Funciona en 11 idiomas",
    why2Desc:
      "Hebreo, inglés, árabe, ruso, español, portugués, francés, alemán, checo, italiano y japonés. Sirve tanto a hablantes nativos como a padres de niños que aprenden una segunda lengua.",
    why3Title: "Diseñado para padres, maestros y estudiantes",
    why3Desc:
      "Explicación para niños, cuestionarios, juegos de palabras y un cuaderno personal. Gadit no está hecho para académicos. Está hecho para la casa, el aula y el grupo de WhatsApp.",

    whoEyebrow: "Para quién es",
    whoTitle: "Personas con una comunidad que confía en ellas",
    who1Title: "Creadores de contenido y blogueros de educación",
    who1Desc:
      "Si escribes, grabas o compartes contenido sobre idiomas, aprendizaje o educación, tu audiencia ya confía en tus recomendaciones.",
    who2Title: "Maestros, terapeutas y educadores",
    who2Desc:
      "Si trabajas con estudiantes y padres, tu recomendación de una herramienta educativa viene de un lugar de confianza profesional.",
    who3Title: "Padres activos en comunidades",
    who3Desc:
      "Grupos de padres, chats de clase, listas de correo: dondequiera que los padres se pregunten unos a otros sobre herramientas que ayudan a sus hijos.",

    howEyebrow: "Cómo funciona",
    howTitle: "Tres pasos, sin conocimientos técnicos",
    how1Title: "Únete al programa",
    how1Desc:
      "Un formulario corto. En un minuto recibes aprobación automática, tu enlace personal y acceso a tu panel.",
    how2Title: "Comparte tu enlace",
    how2Desc:
      "En el WhatsApp de padres, en un correo a tu lista, en una historia de Instagram, en tu blog o en persona. Donde encaje con tu audiencia.",
    how3Title: "Recompensa que crece contigo",
    how3Desc:
      "30% de comisión recurrente durante 12 meses por cada cliente que se registre a través de tu enlace. Cuando traigas 10 clientes activos, te conviertes en Active Partner y desbloqueas un 10% adicional de comisión recurrente de por vida sobre todos tus clientes, desde el mes 13 en adelante.",
    midCta1: "Empieza ahora. Toma un minuto.",

    getEyebrow: "Lo que recibes",
    getTitle: "No te dejamos solo",
    getSubtitle:
      "Si nunca has vendido nada en tu vida, no pasa nada. Todo está preparado para ti.",
    get1Title: "Tu propio enlace personal",
    get1Desc:
      "Un enlace corto y único que puedes compartir donde quieras. Incluso si alguien hace clic y vuelve solo 60 días después, el registro sigue siendo tuyo.",
    get2Title: "Textos listos para compartir",
    get2Desc:
      "Publicaciones listas para WhatsApp y Facebook, un correo para padres e ideas para historias de Instagram. Solo copia y comparte.",
    get3Title: "Un panel personal ordenado",
    get3Desc:
      "Mira en tiempo real: cuántos hicieron clic en el enlace, cuántos se registraron, cuántos mejoraron de plan y cuánto recibes. Todo transparente.",
    get4Title: "Soporte personal",
    get4Desc:
      "¿Preguntas sobre el programa? ¿Problemas con el enlace? Hay alguien a quien recurrir. Respondemos en un día laborable.",

    earnEyebrow: "Cuánto puedes ganar",
    earnTitle: "Mueve el control deslizante y verás",
    earnSubtitle:
      "Los números dependen de tu audiencia y de lo que compartes. Así se acumula. No prometemos una cantidad, pero este es el orden de magnitud.",
    calcSubsLabel: "Suscriptores Deep activos al mes",
    calcMonthly: "Recompensa mensual",
    calcYearly: "En 12 meses",
    calcUnitSuffix: "suscriptores",
    tableHeaderSubs: "Suscriptores",
    tableHeaderMonthly: "Recompensa mensual",
    tableHeaderYearly: "En 12 meses",
    earnNote:
      "Cálculo basado en una suscripción Deep ($4.99/mes) y 30% de comisión durante el primer año. Desde el mes 13, los Active Partners reciben un 10% adicional de por vida sobre esos mismos clientes. Las recompensas se liberan tras un período de espera de 30 días y el pago se realiza al acumular $50 (umbral mínimo de pago, no un tope).",
    midCta2: "¿Listo para empezar? Consigue tu enlace",

    trustEyebrow: "Por qué confiar",
    trustTitle: "Programa fundacional en sus primeras etapas",
    founderHeading: "¿Por qué creé Gadit?",
    founderBody:
      "Mi misión siempre fue una: ayudar a las personas a entender las cosas hasta el final. Porque cuando entiendes de verdad, puedes aplicar. Y cuando puedes aplicar, puedes conseguir lo que te propongas.\n\nDurante años vi a personas inteligentes y talentosas que querían entender algo y no podían. Pensaban que simplemente \"no se les daba\". Pero no eran ellas. Era una palabra en el camino.\n\nConstruí Gadit para eliminar esa barrera. No un diccionario más. No solo una traducción. Una herramienta que explica cada palabra hasta el final, con sencillez, con ejemplos, con contexto y con una imagen que la trae a la vida. A esto lo llamamos hacer GAD a una palabra.\n\nEl programa de afiliados está abierto ahora a personas que conectan con esta idea y quieren ayudar a llevarla más lejos. Si eres tú, me encantaría tenerte dentro.",
    founderSign: "Gadi Ben Lavi, fundador de Gadit",
    stat1Num: "9",
    stat1Label: "idiomas de interfaz soportados",
    stat2Num: "30%",
    stat2Label: "comisión recurrente durante 12 meses",
    stat3Num: "60",
    stat3Label: "días: ventana de memoria del enlace",

    faqEyebrow: "Preguntas frecuentes",
    faqTitle: "Lo que conviene saber",
    faq1Q: "¿Tengo que ser profesional del marketing?",
    faq1A:
      "No. La mayoría de nuestros socios son padres, maestros y blogueros que nunca han vendido nada. Lo único que se necesita es compartir el enlace con personas que puedan beneficiarse de Gadit.",
    faq2Q: "¿Puedo compartir en grupos de WhatsApp o Facebook?",
    faq2A:
      "Sí, y es uno de los mejores canales para nuestra audiencia. Los padres se preguntan unos a otros sobre herramientas en los grupos, y ahí es donde tu recomendación tiene el mayor impacto.",
    faq3Q: "¿Cuándo recibo el pago?",
    faq3A:
      "Pago mensual al final de cada mes, una vez acumulados $50. El umbral de $50 es un mínimo de pago, no un tope. Puedes ganar mucho más, simplemente recibes el dinero en el momento en que lo superas.",
    faq4Q: "¿Qué pasa si mi cliente cancela?",
    faq4A:
      "Recibirás comisión solo por los meses que el cliente pagó. Si cancela tras 4 meses, recibiste 4 meses de recompensa. Justo para ambos lados.",
    faq5Q: "¿Hay un límite de clientes?",
    faq5A:
      "Para nada. Puedes traer todos los clientes que quieras, desde cualquier parte del mundo, en cualquiera de los 11 idiomas que Gadit soporta.",
    faq6Q: "¿Qué hace el enlace si alguien no se registra de inmediato?",
    faq6A:
      "El enlace te recuerda durante 60 días. Si alguien hace clic, lo piensa dos semanas y vuelve a comprar una suscripción, el registro sigue contando como tuyo.",
    faq7Q: "¿Y sobre la suscripción anual?",
    faq7A:
      "Por una suscripción anual recibes una recompensa única del 15% del primer pago (en lugar del 30% mensual durante el año). Es un balance justo por el descuento que damos en el pago anual.",
    faq8Q: "¿Recibiré materiales de marketing listos?",
    faq8A:
      "Sí. Puedes copiar textos listos para WhatsApp, un correo para padres, publicaciones para Facebook y borradores de historias. Si quieres algo específico, escríbenos y lo preparamos.",
    faq9Q: "¿Puedo hacer anuncios pagados en Google o Facebook?",
    faq9A:
      "Anuncios orgánicos para tu audiencia: sí. Pero no puedes comprar anuncios en Google o Facebook sobre la palabra 'Gadit' misma. No queremos que compitas con el sitio principal por el mismo tráfico. Reglas completas en tu panel.",
    faq10Q: "¿Debo ser suscriptor de pago para ser afiliado?",
    faq10A:
      "Sí. El programa de afiliados está abierto solo a suscriptores Clear y Deep. Una buena recomendación empieza por un producto que conoces de verdad. Si todavía estás en Basic, mejora a Clear o Deep desde la pantalla de Precios y obtendrás tanto el diccionario completo como el acceso al programa.",
    faq11Q: "¿Qué es un Active Partner y cómo se llega?",
    faq11A:
      "Cuando traes 10 clientes activos que pagan, automáticamente te conviertes en Active Partner. Ese estatus desbloquea un 10% adicional de comisión recurrente de por vida sobre todos tus clientes (incluso los actuales, desde el mes 13 en adelante). Esto significa que incluso después de dos, tres o cinco años, si tus clientes siguen suscritos, tú sigues recibiendo recompensa.",

    finalTitle: "¿Listo para empezar?",
    finalSubtitle:
      "El registro toma un minuto. Aprobación automática. El enlace está listo al instante.",
    finalCta: "Consigue tu enlace personal, gratis",
    termsLink: "Términos del programa de afiliados",
  },
  pt: {
    navAffiliates: "Afiliados",
    topbarSignIn: "Já é parceiro? Acessar",

    heroEyebrow: "Programa de afiliados",
    heroTitle: "Indique o Gadit.\nGanhe todo mês.",
    heroSubtitle:
      "Você compartilha seu link pessoal e nós te recompensamos com 30% de comissão recorrente no primeiro ano. Traga 10 clientes ativos, torne-se Active Partner e ganhe 10% para sempre.",
    heroCtaPrimary: "Pegue seu link pessoal, grátis",
    heroProofA: "30% no primeiro ano",
    heroProofB: "10% para sempre (Active Partner)",
    heroProofC: "Link imediato",
    heroProofD: "Para assinantes Clear e Deep",

    whyEyebrow: "Primeiro o produto",
    whyTitle: "Por que vale a pena indicar o Gadit",
    whySubtitle:
      "Você só vai indicar algo em que acredita. Aqui está o que seu público vai receber, e por que vai te agradecer.",
    why1Title: "Um dicionário de verdade, não uma tradução seca",
    why1Desc:
      "Todos os significados de uma palavra, exemplos reais para cada um, expressões, origem histórica e uma imagem. O Gadit explica uma palavra como deveria, não como qualquer dicionário comum.",
    why2Title: "Funciona em 11 idiomas",
    why2Desc:
      "Hebraico, inglês, árabe, russo, espanhol, português, francês, alemão, tcheco, italiano e japonês. Serve tanto a falantes nativos quanto a pais de crianças aprendendo uma segunda língua.",
    why3Title: "Pensado para pais, professores e estudantes",
    why3Desc:
      "Explicação para crianças, quizzes, jogos de palavras e um caderno pessoal. O Gadit não foi feito para acadêmicos. Foi feito para a casa, a sala de aula e o grupo de WhatsApp.",

    whoEyebrow: "Para quem é",
    whoTitle: "Pessoas com uma comunidade que confia nelas",
    who1Title: "Criadores de conteúdo e blogueiros de educação",
    who1Desc:
      "Se você escreve, grava ou compartilha conteúdo sobre idioma, aprendizado ou educação, seu público já confia nas suas indicações.",
    who2Title: "Professores, terapeutas e educadores",
    who2Desc:
      "Se você trabalha com alunos e pais, sua indicação de uma ferramenta educacional vem de um lugar de confiança profissional.",
    who3Title: "Pais ativos em comunidades",
    who3Desc:
      "Grupos de pais, chats da turma, listas de e-mail: onde quer que pais perguntem uns aos outros sobre ferramentas que ajudam seus filhos.",

    howEyebrow: "Como funciona",
    howTitle: "Três passos, sem nenhum conhecimento técnico",
    how1Title: "Cadastro no programa",
    how1Desc:
      "Um formulário curto. Em um minuto você recebe aprovação automática, link pessoal e acesso ao seu painel.",
    how2Title: "Compartilhe o link",
    how2Desc:
      "No WhatsApp dos pais, num e-mail para sua lista, num story do Instagram, no seu blog ou pessoalmente. Onde fizer sentido para seu público.",
    how3Title: "Recompensa que cresce com você",
    how3Desc:
      "30% de comissão recorrente por 12 meses para cada cliente que assina pelo seu link. Quando você trouxer 10 clientes ativos, vira Active Partner e desbloqueia mais 10% de comissão recorrente para sempre, sobre todos os seus clientes, a partir do mês 13.",
    midCta1: "Comece agora. Leva um minuto.",

    getEyebrow: "O que você recebe",
    getTitle: "A gente não te deixa sozinho",
    getSubtitle:
      "Se você nunca vendeu nada na vida, tudo bem. Está tudo pronto para você.",
    get1Title: "Seu próprio link pessoal",
    get1Desc:
      "Um link curto e único que dá para compartilhar em qualquer lugar. Mesmo que alguém clique e só volte 60 dias depois, o cadastro continua sendo seu.",
    get2Title: "Textos prontos para compartilhar",
    get2Desc:
      "Posts prontos para WhatsApp e Facebook, um e-mail para pais e ideias para stories. É só copiar e compartilhar.",
    get3Title: "Um painel pessoal organizado",
    get3Desc:
      "Você vê em tempo real: quantos clicaram no link, quantos se cadastraram, quantos fizeram upgrade e quanto você recebe. Tudo transparente.",
    get4Title: "Suporte pessoal",
    get4Desc:
      "Dúvida sobre o programa? Problema com o link? Tem com quem falar. Respondemos em um dia útil.",

    earnEyebrow: "Quanto dá para ganhar",
    earnTitle: "Mexa o controle e veja",
    earnSubtitle:
      "Os números dependem do seu público e do que você compartilha. Veja como acumula. Não prometemos um valor, mas essa é a ordem de grandeza.",
    calcSubsLabel: "Assinantes Deep ativos por mês",
    calcMonthly: "Recompensa mensal",
    calcYearly: "Em 12 meses",
    calcUnitSuffix: "assinantes",
    tableHeaderSubs: "Assinantes",
    tableHeaderMonthly: "Recompensa mensal",
    tableHeaderYearly: "Em 12 meses",
    earnNote:
      "Cálculo baseado em assinatura Deep ($4.99/mês) e 30% de comissão no primeiro ano. A partir do mês 13, Active Partners recebem mais 10% para sempre sobre os mesmos clientes. As recompensas são liberadas após um período de espera de 30 dias, e o pagamento é feito quando acumula $50 (limite mínimo de pagamento, não um teto).",
    midCta2: "Pronto para começar? Pegue seu link",

    trustEyebrow: "Por que confiar",
    trustTitle: "Programa fundador em seus primeiros estágios",
    founderHeading: "Por que criei o Gadit?",
    founderBody:
      "Minha missão sempre foi uma: ajudar pessoas a entender as coisas até o fim. Porque quando você entende de verdade, dá para aplicar. E quando dá para aplicar, dá para alcançar qualquer coisa.\n\nAo longo dos anos vi pessoas inteligentes, talentosas, que queriam entender algo e não conseguiam. Achavam que simplesmente \"não eram boas nisso\". Mas não era isso. Era uma palavra no caminho.\n\nConstruí o Gadit para tirar essa barreira. Não mais um dicionário. Não só uma tradução. Uma ferramenta que explica cada palavra até o fim, com simplicidade, com exemplos, com contexto e com uma imagem que dá vida a ela. A gente chama isso de fazer GAD numa palavra.\n\nO programa de afiliados está aberto agora para pessoas que se conectam com essa ideia e querem levá-la adiante. Se for você, vou adorar te ter dentro.",
    founderSign: "Gadi Ben Lavi, fundador do Gadit",
    stat1Num: "9",
    stat1Label: "idiomas de interface suportados",
    stat2Num: "30%",
    stat2Label: "comissão recorrente por 12 meses",
    stat3Num: "60",
    stat3Label: "dias: janela de memória do link",

    faqEyebrow: "Perguntas frequentes",
    faqTitle: "O que vale a pena saber",
    faq1Q: "Preciso ser profissional de marketing?",
    faq1A:
      "Não. A maioria dos nossos parceiros são pais, professores e blogueiros que nunca venderam nada. Tudo o que precisa é compartilhar o link com pessoas que podem se beneficiar do Gadit.",
    faq2Q: "Posso compartilhar em grupos de WhatsApp ou Facebook?",
    faq2A:
      "Sim, e é um dos melhores canais para nosso público. Pais se perguntam sobre ferramentas em grupos, e é ali que sua indicação tem mais impacto.",
    faq3Q: "Quando recebo o pagamento?",
    faq3A:
      "Pagamento mensal no fim de cada mês, depois que acumular $50. O limite de $50 é um mínimo de pagamento, não um teto. Você pode ganhar muito mais, é só receber de fato no momento em que ultrapassa esse valor.",
    faq4Q: "O que acontece se meu cliente cancelar?",
    faq4A:
      "Você recebe comissão só pelos meses que o cliente efetivamente pagou. Se ele cancelar depois de 4 meses, você recebeu 4 meses de recompensa. Justo para os dois lados.",
    faq5Q: "Há limite no número de clientes?",
    faq5A:
      "Nenhum. Você pode trazer quantos clientes quiser, de qualquer lugar do mundo, em qualquer um dos 11 idiomas que o Gadit suporta.",
    faq6Q: "O que o link faz se alguém não se cadastrar na hora?",
    faq6A:
      "O link te lembra por 60 dias. Se alguém clicou, hesitou duas semanas e voltou para assinar, o cadastro ainda conta como seu.",
    faq7Q: "E sobre a assinatura anual?",
    faq7A:
      "Numa assinatura anual você recebe uma recompensa única de 15% do primeiro pagamento (em vez de 30% mensal ao longo do ano). É um equilíbrio justo pelo desconto que damos no pagamento anual.",
    faq8Q: "Vou receber materiais de marketing prontos?",
    faq8A:
      "Sim. Você pode copiar textos prontos para WhatsApp, um e-mail para pais, posts para Facebook e rascunhos de stories. Se quiser algo específico, fale com a gente e a gente prepara.",
    faq9Q: "Posso fazer anúncios pagos no Google ou Facebook?",
    faq9A:
      "Anúncios orgânicos para seu público: sim. Mas você não pode comprar anúncios no Google ou Facebook na palavra 'Gadit'. A gente não quer que você concorra com o site principal pelo mesmo tráfego. As regras completas estão no seu painel.",
    faq10Q: "Preciso ser assinante pagante para ser parceiro?",
    faq10A:
      "Sim. O programa de afiliados está aberto só para assinantes Clear e Deep. Uma boa indicação começa com um produto que você conhece de verdade. Se você ainda está no Basic, faça upgrade para Clear ou Deep na tela de Preços, e você vai ter tanto o dicionário completo quanto acesso ao programa.",
    faq11Q: "O que é um Active Partner e como se chega lá?",
    faq11A:
      "Quando você traz 10 clientes ativos pagando, automaticamente vira Active Partner. Esse status desbloqueia mais 10% de comissão recorrente para sempre sobre todos os seus clientes (incluindo os atuais, a partir do mês 13). Isso quer dizer que mesmo depois de dois, três ou cinco anos, se seus clientes ainda estiverem assinando, você ainda recebe recompensa.",

    finalTitle: "Pronto para começar?",
    finalSubtitle: "O cadastro leva um minuto. Aprovação automática. Link pronto na hora.",
    finalCta: "Pegue seu link pessoal, grátis",
    termsLink: "Termos do programa de afiliados",
  },
  fr: {
    navAffiliates: "Affiliés",
    topbarSignIn: "Déjà partenaire ? Se connecter",

    heroEyebrow: "Programme partenaires",
    heroTitle: "Recommandez Gadit.\nGagnez chaque mois.",
    heroSubtitle:
      "Vous partagez votre lien personnel, et nous vous récompensons avec 30% de commission récurrente la première année. Amenez 10 clients actifs, devenez Active Partner et gagnez 10% à vie.",
    heroCtaPrimary: "Obtenez votre lien personnel, gratuit",
    heroProofA: "30% la première année",
    heroProofB: "10% à vie (Active Partner)",
    heroProofC: "Lien instantané",
    heroProofD: "Pour les abonnés Clear et Deep",

    whyEyebrow: "Le produit d'abord",
    whyTitle: "Pourquoi Gadit vaut la peine d'être recommandé",
    whySubtitle:
      "Vous ne recommanderez que ce en quoi vous croyez. Voici ce que votre audience va recevoir, et pourquoi elle vous remerciera.",
    why1Title: "Un vrai dictionnaire, pas une traduction sèche",
    why1Desc:
      "Tous les sens d'un mot, des exemples réels pour chacun, des expressions, l'origine historique et une image. Gadit explique un mot comme il faut, pas comme n'importe quel dictionnaire ordinaire.",
    why2Title: "Fonctionne en 11 langues",
    why2Desc:
      "Hébreu, anglais, arabe, russe, espagnol, portugais, français, allemand, tchèque, italien et japonais. Convient autant aux locuteurs natifs qu'aux parents d'enfants qui apprennent une seconde langue.",
    why3Title: "Conçu pour les parents, enseignants et apprenants",
    why3Desc:
      "Explication pour enfants, quiz, jeux de mots et carnet personnel. Gadit n'est pas fait pour les académiciens. Il est fait pour la maison, la classe et le groupe WhatsApp.",

    whoEyebrow: "À qui ça s'adresse",
    whoTitle: "Des personnes avec une communauté qui leur fait confiance",
    who1Title: "Créateurs de contenu et blogueurs éducation",
    who1Desc:
      "Si vous écrivez, filmez ou partagez du contenu sur la langue, l'apprentissage ou l'éducation, votre audience fait déjà confiance à vos recommandations.",
    who2Title: "Enseignants, thérapeutes et éducateurs",
    who2Desc:
      "Si vous travaillez avec des élèves et des parents, votre recommandation d'un outil éducatif vient d'un endroit de confiance professionnelle.",
    who3Title: "Parents actifs dans des communautés",
    who3Desc:
      "Groupes de parents, discussions de classe, listes de diffusion : partout où les parents se demandent entre eux quels outils aident leurs enfants.",

    howEyebrow: "Comment ça marche",
    howTitle: "Trois étapes, sans aucune connaissance technique",
    how1Title: "Inscription au programme",
    how1Desc:
      "Un formulaire court. En une minute, vous recevez une approbation automatique, votre lien personnel et l'accès à votre tableau de bord.",
    how2Title: "Partagez votre lien",
    how2Desc:
      "Sur le WhatsApp des parents, dans un e-mail à votre liste, dans une story Instagram, sur votre blog ou en personne. Là où ça correspond à votre audience.",
    how3Title: "Une récompense qui grandit avec vous",
    how3Desc:
      "30% de commission récurrente pendant 12 mois pour chaque client qui s'abonne via votre lien. Quand vous amenez 10 clients actifs, vous devenez Active Partner et déverrouillez 10% supplémentaires de commission récurrente à vie, sur tous vos clients, à partir du mois 13.",
    midCta1: "Commencez maintenant. Ça prend une minute.",

    getEyebrow: "Ce que vous recevez",
    getTitle: "On ne vous laisse pas seul",
    getSubtitle:
      "Si vous n'avez jamais vendu quoi que ce soit dans votre vie, ce n'est pas grave. Tout est prêt pour vous.",
    get1Title: "Votre propre lien personnel",
    get1Desc:
      "Un lien court et unique que vous pouvez partager n'importe où. Même si quelqu'un clique et ne revient que 60 jours plus tard, l'inscription reste la vôtre.",
    get2Title: "Des textes prêts à partager",
    get2Desc:
      "Posts prêts pour WhatsApp et Facebook, un e-mail pour les parents et des idées pour des stories Instagram. Il suffit de copier et partager.",
    get3Title: "Un tableau de bord clair",
    get3Desc:
      "Vous voyez en temps réel : combien ont cliqué sur le lien, combien se sont inscrits, combien ont upgradé et combien vous recevez. Tout est transparent.",
    get4Title: "Un support personnel",
    get4Desc:
      "Une question sur le programme ? Un problème avec le lien ? Il y a quelqu'un à qui s'adresser. On répond sous un jour ouvré.",

    earnEyebrow: "Combien on peut gagner",
    earnTitle: "Bougez le curseur pour voir",
    earnSubtitle:
      "Les chiffres dépendent de votre audience et de ce que vous partagez. Voici comment ça s'accumule. On ne promet pas un montant, mais c'est l'ordre de grandeur.",
    calcSubsLabel: "Abonnés Deep actifs par mois",
    calcMonthly: "Récompense mensuelle",
    calcYearly: "Sur 12 mois",
    calcUnitSuffix: "abonnés",
    tableHeaderSubs: "Abonnés",
    tableHeaderMonthly: "Récompense mensuelle",
    tableHeaderYearly: "Sur 12 mois",
    earnNote:
      "Calcul basé sur un abonnement Deep ($4.99/mois) et 30% de commission la première année. À partir du mois 13, les Active Partners reçoivent 10% supplémentaires à vie sur ces mêmes clients. Les récompenses sont libérées après une période d'attente de 30 jours, et le paiement se fait quand $50 sont accumulés (seuil de paiement minimum, pas un plafond).",
    midCta2: "Prêt à commencer ? Obtenez votre lien",

    trustEyebrow: "Pourquoi faire confiance",
    trustTitle: "Programme fondateur à ses débuts",
    founderHeading: "Pourquoi j’ai créé Gadit ?",
    founderBody:
      "Ma mission a toujours été la même : aider les gens à comprendre les choses jusqu'au bout. Parce que quand on comprend vraiment, on peut appliquer. Et quand on peut appliquer, on peut atteindre tout ce qu'on veut.\n\nAu fil des années, j'ai vu des personnes intelligentes, talentueuses, qui voulaient comprendre quelque chose et qui n'y arrivaient pas. Elles pensaient qu'elles « n'étaient pas faites pour ça ». Mais ce n'était pas elles. C'était un mot sur le chemin.\n\nJ'ai construit Gadit pour enlever cette barrière. Pas un dictionnaire de plus. Pas juste une traduction. Un outil qui explique chaque mot jusqu'au bout, simplement, avec des exemples, avec du contexte et avec une image qui le fait vivre. On appelle ça faire GAD à un mot.\n\nLe programme partenaires est ouvert maintenant à des personnes qui se reconnaissent dans cette idée et veulent la porter plus loin. Si c'est vous, je serais ravi de vous compter parmi nous.",
    founderSign: "Gadi Ben Lavi, fondateur de Gadit",
    stat1Num: "9",
    stat1Label: "langues d'interface prises en charge",
    stat2Num: "30%",
    stat2Label: "commission récurrente pendant 12 mois",
    stat3Num: "60",
    stat3Label: "jours : fenêtre de mémoire du lien",

    faqEyebrow: "Questions fréquentes",
    faqTitle: "Ce qu'il faut savoir",
    faq1Q: "Faut-il être professionnel du marketing ?",
    faq1A:
      "Non. La plupart de nos partenaires sont des parents, enseignants et blogueurs qui n'ont jamais vendu quoi que ce soit. Tout ce qu'il faut, c'est partager le lien avec des personnes qui peuvent bénéficier de Gadit.",
    faq2Q: "Puis-je partager dans des groupes WhatsApp ou Facebook ?",
    faq2A:
      "Oui, et c'est l'un des meilleurs canaux pour notre audience. Les parents se demandent entre eux quels outils utiliser dans les groupes, et c'est là que votre recommandation a le plus d'impact.",
    faq3Q: "Quand est-ce que je reçois le paiement ?",
    faq3A:
      "Paiement mensuel à la fin de chaque mois, une fois $50 accumulés. Le seuil de $50 est un minimum de paiement, pas un plafond. Vous pouvez gagner bien plus, vous recevez juste l'argent au moment où vous passez ce seuil.",
    faq4Q: "Que se passe-t-il si mon client annule ?",
    faq4A:
      "Vous ne recevez de commission que pour les mois où le client a effectivement payé. S'il annule après 4 mois, vous avez reçu 4 mois de récompense. Équitable des deux côtés.",
    faq5Q: "Y a-t-il une limite au nombre de clients ?",
    faq5A:
      "Aucune. Vous pouvez amener autant de clients que vous voulez, depuis n'importe où dans le monde, dans n'importe laquelle des 11 langues que Gadit prend en charge.",
    faq6Q: "Que fait le lien si quelqu'un ne s'inscrit pas tout de suite ?",
    faq6A:
      "Le lien vous garde en mémoire pendant 60 jours. Si quelqu'un clique, hésite deux semaines et revient s'abonner, l'inscription compte toujours pour vous.",
    faq7Q: "Et pour l'abonnement annuel ?",
    faq7A:
      "Sur un abonnement annuel, vous recevez une récompense unique de 15% du premier paiement (au lieu de 30% mensuel sur l'année). C'est un équilibre juste compte tenu de la remise que nous offrons sur le paiement annuel.",
    faq8Q: "Vais-je recevoir des supports marketing prêts ?",
    faq8A:
      "Oui. Vous pouvez copier des textes prêts pour WhatsApp, un e-mail pour les parents, des posts Facebook et des brouillons de stories. Si vous voulez quelque chose de spécifique, écrivez-nous et nous le préparerons.",
    faq9Q: "Puis-je faire de la publicité payante sur Google ou Facebook ?",
    faq9A:
      "Des posts organiques pour votre audience : oui. Mais vous ne pouvez pas acheter de pub sur Google ou Facebook sur le mot 'Gadit' lui-même. Nous ne voulons pas que vous concurrenciez le site principal sur le même trafic. Les règles complètes sont dans votre tableau de bord.",
    faq10Q: "Dois-je être abonné payant pour être partenaire ?",
    faq10A:
      "Oui. Le programme partenaires est ouvert uniquement aux abonnés Clear et Deep. Une bonne recommandation commence par un produit qu'on connaît soi-même. Si vous êtes encore sur Basic, passez à Clear ou Deep depuis l'écran 'Tarifs', et vous obtiendrez à la fois le dictionnaire complet et l'accès au programme.",
    faq11Q: "Qu'est-ce qu'un Active Partner et comment y arriver ?",
    faq11A:
      "Quand vous amenez 10 clients actifs payants, vous devenez automatiquement Active Partner. Ce statut déverrouille 10% supplémentaires de commission récurrente à vie sur tous vos clients (y compris les existants, à partir du mois 13). Ça veut dire que même après deux, trois ou cinq ans, si vos clients sont toujours abonnés, vous continuez à recevoir une récompense.",

    finalTitle: "Prêt à commencer ?",
    finalSubtitle: "L'inscription prend une minute. Approbation automatique. Lien prêt instantanément.",
    finalCta: "Obtenez votre lien personnel, gratuit",
    termsLink: "Conditions du programme partenaires",
  },
  de: {
    navAffiliates: "Affiliates",
    topbarSignIn: "Schon Partner? Anmelden",

    heroEyebrow: "Partnerprogramm",
    heroTitle: "Empfiehl Gadit.\nVerdiene monatlich.",
    heroSubtitle:
      "Du teilst deinen persönlichen Link, und wir belohnen dich mit 30% wiederkehrender Provision im ersten Jahr. Bring 10 aktive Kunden, werde Active Partner und verdiene 10% lebenslang.",
    heroCtaPrimary: "Hol dir deinen persönlichen Link, kostenlos",
    heroProofA: "30% im ersten Jahr",
    heroProofB: "10% lebenslang (Active Partner)",
    heroProofC: "Sofortiger Link",
    heroProofD: "Für Clear- und Deep-Abonnenten",

    whyEyebrow: "Erst das Produkt",
    whyTitle: "Warum Gadit eine Empfehlung wert ist",
    whySubtitle:
      "Du empfiehlst nur, woran du selbst glaubst. Hier ist, was dein Publikum bekommt und warum es dir danken wird.",
    why1Title: "Ein echtes Wörterbuch, keine trockene Übersetzung",
    why1Desc:
      "Alle Bedeutungen eines Wortes, echte Beispiele für jede, Redewendungen, historische Herkunft und ein Bild. Gadit erklärt ein Wort so, wie es sein sollte, nicht wie ein gewöhnliches Wörterbuch.",
    why2Title: "Funktioniert in 11 Sprachen",
    why2Desc:
      "Hebräisch, Englisch, Arabisch, Russisch, Spanisch, Portugiesisch, Französisch, Deutsch, Tschechisch, Italienisch und Japanisch. Geeignet für Muttersprachler ebenso wie für Eltern von Kindern, die eine zweite Sprache lernen.",
    why3Title: "Entwickelt für Eltern, Lehrer und Lernende",
    why3Desc:
      "Kindererklärung, Quizze, Wortspiele und ein persönliches Notizbuch. Gadit ist nicht für Akademiker gebaut. Es ist für zu Hause, das Klassenzimmer und die WhatsApp-Gruppe.",

    whoEyebrow: "Für wen ist das",
    whoTitle: "Menschen mit einer Community, die ihnen vertraut",
    who1Title: "Content-Creator und Bildungs-Blogger",
    who1Desc:
      "Wenn du Inhalte über Sprache, Lernen oder Bildung schreibst, filmst oder teilst, vertraut dein Publikum bereits deinen Empfehlungen.",
    who2Title: "Lehrer, Therapeuten und Pädagogen",
    who2Desc:
      "Wenn du mit Schülern und Eltern arbeitest, kommt deine Empfehlung eines Bildungstools aus einem Ort professionellen Vertrauens.",
    who3Title: "Aktive Eltern in Communities",
    who3Desc:
      "Elterngruppen, Klassen-Chats, Mailinglisten: überall dort, wo Eltern sich gegenseitig nach Tools fragen, die ihren Kindern helfen.",

    howEyebrow: "Wie es funktioniert",
    howTitle: "Drei Schritte, ohne technisches Vorwissen",
    how1Title: "Anmeldung zum Programm",
    how1Desc:
      "Ein kurzes Formular. Innerhalb einer Minute bekommst du automatische Freigabe, deinen persönlichen Link und Zugang zu deinem Dashboard.",
    how2Title: "Teile den Link",
    how2Desc:
      "Im Eltern-WhatsApp, in einer E-Mail an deine Liste, in einer Instagram-Story, in deinem Blog oder persönlich. Überall, wo es zu deinem Publikum passt.",
    how3Title: "Belohnung, die mit dir wächst",
    how3Desc:
      "30% wiederkehrende Provision für 12 Monate pro Kunde, der sich über deinen Link anmeldet. Wenn du 10 aktive Kunden bringst, wirst du Active Partner und schaltest zusätzliche 10% wiederkehrende Provision lebenslang frei, auf alle deine Kunden, ab Monat 13.",
    midCta1: "Starte jetzt. Dauert eine Minute.",

    getEyebrow: "Was du bekommst",
    getTitle: "Wir lassen dich nicht allein",
    getSubtitle:
      "Wenn du noch nie etwas in deinem Leben verkauft hast, ist das in Ordnung. Alles ist für dich vorbereitet.",
    get1Title: "Dein eigener persönlicher Link",
    get1Desc:
      "Ein kurzer, einzigartiger Link, den du überall teilen kannst. Selbst wenn jemand klickt und erst 60 Tage später zurückkommt, bleibt die Anmeldung deine.",
    get2Title: "Fertige Texte zum Teilen",
    get2Desc:
      "Vorbereitete Posts für WhatsApp und Facebook, eine E-Mail für Eltern und Ideen für Instagram-Stories. Nur kopieren und teilen.",
    get3Title: "Ein aufgeräumtes Dashboard",
    get3Desc:
      "Du siehst in Echtzeit: wie viele auf den Link geklickt haben, wie viele sich angemeldet haben, wie viele upgegradet sind und wie viel du bekommst. Alles transparent.",
    get4Title: "Persönlicher Support",
    get4Desc:
      "Fragen zum Programm? Problem mit dem Link? Es gibt jemanden, an den du dich wenden kannst. Wir antworten innerhalb eines Werktags.",

    earnEyebrow: "Wie viel man verdienen kann",
    earnTitle: "Bewege den Slider und sieh selbst",
    earnSubtitle:
      "Die Zahlen hängen von deinem Publikum und davon ab, was du teilst. So summiert es sich. Wir versprechen keinen Betrag, aber das ist die Größenordnung.",
    calcSubsLabel: "Aktive Deep-Abonnenten pro Monat",
    calcMonthly: "Monatliche Belohnung",
    calcYearly: "In 12 Monaten",
    calcUnitSuffix: "Abonnenten",
    tableHeaderSubs: "Abonnenten",
    tableHeaderMonthly: "Monatliche Belohnung",
    tableHeaderYearly: "In 12 Monaten",
    earnNote:
      "Berechnung basiert auf einem Deep-Abo ($4.99/Monat) und 30% Provision im ersten Jahr. Ab Monat 13 bekommen Active Partners zusätzliche 10% lebenslang auf dieselben Kunden. Belohnungen werden nach einer Wartezeit von 30 Tagen freigegeben, die Auszahlung erfolgt, wenn $50 zusammengekommen sind (Mindestauszahlung, keine Obergrenze).",
    midCta2: "Bereit anzufangen? Hol dir deinen Link",

    trustEyebrow: "Warum vertrauen",
    trustTitle: "Gründerprogramm in den ersten Phasen",
    founderHeading: "Warum habe ich Gadit erstellt?",
    founderBody:
      "Meine Mission war immer eine: Menschen zu helfen, Dinge bis zum Ende zu verstehen. Denn wenn man wirklich versteht, kann man umsetzen. Und wenn man umsetzen kann, kann man alles erreichen, was man will.\n\nÜber die Jahre habe ich kluge, talentierte Menschen gesehen, die etwas verstehen wollten und es nicht konnten. Sie dachten, sie wären einfach \"nicht dafür gemacht\". Aber sie waren es nicht. Es war ein Wort auf dem Weg.\n\nIch habe Gadit gebaut, um diese Hürde zu beseitigen. Nicht noch ein Wörterbuch. Nicht nur eine Übersetzung. Ein Werkzeug, das jedes Wort bis zum Ende erklärt, einfach, mit Beispielen, mit Kontext und mit einem Bild, das es lebendig macht. Wir nennen das ein Wort GADen.\n\nDas Partnerprogramm ist jetzt offen für Menschen, die sich mit dieser Idee verbinden und sie weitertragen möchten. Wenn das du bist, freue ich mich, wenn du dabei bist.",
    founderSign: "Gadi Ben Lavi, Gründer von Gadit",
    stat1Num: "9",
    stat1Label: "unterstützte Oberflächensprachen",
    stat2Num: "30%",
    stat2Label: "wiederkehrende Provision für 12 Monate",
    stat3Num: "60",
    stat3Label: "Tage: Erinnerungsfenster des Links",

    faqEyebrow: "Häufige Fragen",
    faqTitle: "Was du wissen solltest",
    faq1Q: "Muss ich Marketing-Profi sein?",
    faq1A:
      "Nein. Die meisten unserer Partner sind Eltern, Lehrer und Blogger, die noch nie etwas verkauft haben. Alles, was du brauchst, ist den Link mit Menschen zu teilen, die von Gadit profitieren können.",
    faq2Q: "Darf ich in WhatsApp- oder Facebook-Gruppen teilen?",
    faq2A:
      "Ja, und das ist einer der besten Kanäle für unser Publikum. Eltern fragen sich gegenseitig nach Tools in Gruppen, und genau dort hat deine Empfehlung den größten Effekt.",
    faq3Q: "Wann bekomme ich die Auszahlung?",
    faq3A:
      "Monatliche Auszahlung am Ende jedes Monats, nachdem $50 zusammengekommen sind. Die $50-Schwelle ist ein Mindestbetrag für die Auszahlung, keine Obergrenze. Du kannst weit mehr verdienen, du bekommst das Geld einfach in dem Moment, in dem du die Schwelle überschreitest.",
    faq4Q: "Was passiert, wenn mein Kunde kündigt?",
    faq4A:
      "Du bekommst Provision nur für die Monate, die der Kunde tatsächlich gezahlt hat. Kündigt er nach 4 Monaten, hast du 4 Monate Belohnung bekommen. Fair für beide Seiten.",
    faq5Q: "Gibt es eine Grenze für die Anzahl der Kunden?",
    faq5A:
      "Gar keine. Du kannst so viele Kunden bringen, wie du willst, von überall auf der Welt, in jeder der 11 Sprachen, die Gadit unterstützt.",
    faq6Q: "Was macht der Link, wenn sich jemand nicht sofort anmeldet?",
    faq6A:
      "Der Link erinnert sich 60 Tage an dich. Wenn jemand klickt, zwei Wochen zögert und dann zurückkommt, um ein Abo abzuschließen, gilt die Anmeldung weiterhin für dich.",
    faq7Q: "Und beim Jahresabo?",
    faq7A:
      "Beim Jahresabo bekommst du eine einmalige Belohnung von 15% der ersten Zahlung (statt 30% monatlich übers Jahr). Das ist eine faire Balance angesichts des Rabatts, den wir bei der Jahreszahlung geben.",
    faq8Q: "Bekomme ich fertige Marketing-Materialien?",
    faq8A:
      "Ja. Du kannst fertige Texte für WhatsApp, eine E-Mail für Eltern, Facebook-Posts und Story-Entwürfe kopieren. Wenn du etwas Spezielles brauchst, schreib uns, und wir bereiten es vor.",
    faq9Q: "Darf ich bezahlte Anzeigen bei Google oder Facebook schalten?",
    faq9A:
      "Organische Posts für dein Publikum: ja. Aber du darfst keine Anzeigen bei Google oder Facebook auf das Wort 'Gadit' selbst kaufen. Wir möchten nicht, dass du mit der Hauptseite um denselben Traffic konkurrierst. Die vollständigen Regeln findest du in deinem Dashboard.",
    faq10Q: "Muss ich zahlender Abonnent sein, um Partner zu werden?",
    faq10A:
      "Ja. Das Partnerprogramm ist nur für Clear- und Deep-Abonnenten offen. Eine gute Empfehlung beginnt mit einem Produkt, das man selbst kennt. Wenn du noch bei Basic bist, upgrade über den 'Preise'-Bildschirm auf Clear oder Deep, und du bekommst sowohl das vollständige Wörterbuch als auch Zugang zum Programm.",
    faq11Q: "Was ist ein Active Partner und wie wird man einer?",
    faq11A:
      "Wenn du 10 aktive zahlende Kunden bringst, wirst du automatisch Active Partner. Dieser Status schaltet zusätzliche 10% wiederkehrende Provision lebenslang frei, auf alle deine Kunden (auch bestehende, ab Monat 13). Das heißt: Selbst nach zwei, drei oder fünf Jahren bekommst du weiter Belohnung, solange deine Kunden noch abonniert sind.",

    finalTitle: "Bereit anzufangen?",
    finalSubtitle:
      "Die Anmeldung dauert eine Minute. Automatische Freigabe. Link sofort bereit.",
    finalCta: "Hol dir deinen persönlichen Link, kostenlos",
    termsLink: "Bedingungen des Partnerprogramms",
  },
  cs: {
    navAffiliates: "Partneři",
    topbarSignIn: "Už jste partner? Přihlášení",

    heroEyebrow: "Partnerský program",
    heroTitle: "Doporuč Gadit.\nVydělávej každý měsíc.",
    heroSubtitle:
      "Sdílíš svůj osobní odkaz a my tě odměňujeme 30% opakovanou provizí v prvním roce. Přiveď 10 aktivních zákazníků, staň se Active Partner a vydělávej 10% navždy.",
    heroCtaPrimary: "Získej svůj osobní odkaz, zdarma",
    heroProofA: "30% v prvním roce",
    heroProofB: "10% navždy (Active Partner)",
    heroProofC: "Okamžitý odkaz",
    heroProofD: "Pro předplatitele Clear a Deep",

    whyEyebrow: "Nejprve produkt",
    whyTitle: "Proč stojí za to Gadit doporučit",
    whySubtitle:
      "Doporučíš jen to, čemu věříš. Tady je, co tvé publikum dostane, a proč ti poděkuje.",
    why1Title: "Skutečný slovník, ne suchý překlad",
    why1Desc:
      "Všechny významy slova, skutečné příklady ke každému, idiomy, historický původ a obrázek. Gadit vysvětluje slovo tak, jak má, ne jako kterýkoliv běžný slovník.",
    why2Title: "Funguje v 11 jazycích",
    why2Desc:
      "Hebrejsky, anglicky, arabsky, rusky, španělsky, portugalsky, francouzsky, německy, česky, italsky a japonsky. Vhodné pro rodilé mluvčí i pro rodiče dětí, které se učí druhý jazyk.",
    why3Title: "Navržen pro rodiče, učitele a studenty",
    why3Desc:
      "Vysvětlení pro děti, kvízy, slovní hry a osobní sešit. Gadit není stavěn pro akademiky. Je stavěn pro domov, třídu a WhatsApp skupinu.",

    whoEyebrow: "Pro koho to je",
    whoTitle: "Lidé s komunitou, která jim věří",
    who1Title: "Tvůrci obsahu a blogeři o vzdělávání",
    who1Desc:
      "Pokud píšeš, natáčíš nebo sdílíš obsah o jazyce, učení nebo vzdělávání, tvé publikum tvým doporučením už věří.",
    who2Title: "Učitelé, terapeuti a pedagogové",
    who2Desc:
      "Pokud pracuješ se studenty a rodiči, tvé doporučení vzdělávacího nástroje přichází z místa profesionální důvěry.",
    who3Title: "Aktivní rodiče v komunitách",
    who3Desc:
      "Rodičovské skupiny, třídní chaty, mailing listy: všude tam, kde se rodiče ptají jeden druhého na nástroje, které pomáhají jejich dětem.",

    howEyebrow: "Jak to funguje",
    howTitle: "Tři kroky, bez žádných technických znalostí",
    how1Title: "Registrace do programu",
    how1Desc:
      "Krátký formulář. Během minuty dostaneš automatické schválení, osobní odkaz a přístup do svého přehledu.",
    how2Title: "Sdílení odkazu",
    how2Desc:
      "Na rodičovském WhatsApp, v e-mailu pro svůj seznam, ve story na Instagramu, na blogu nebo osobně. Tam, kde to sedí tvému publiku.",
    how3Title: "Odměna, která roste s tebou",
    how3Desc:
      "30% opakovaná provize po dobu 12 měsíců za každého zákazníka, který se přihlásí přes tvůj odkaz. Když přivedeš 10 aktivních zákazníků, staneš se Active Partner a odemkneš dalších 10% opakované provize navždy na všechny tvé zákazníky, od 13. měsíce dál.",
    midCta1: "Začni teď. Trvá to minutu.",

    getEyebrow: "Co dostaneš",
    getTitle: "Nenecháme tě v tom samotného",
    getSubtitle:
      "Pokud jsi v životě nikdy nic neprodával, nevadí. Všechno máme připraveno.",
    get1Title: "Tvůj vlastní osobní odkaz",
    get1Desc:
      "Krátký, jedinečný odkaz, který můžeš sdílet kdekoliv. I když na něj někdo klikne a vrátí se až za 60 dní, registrace je stále tvoje.",
    get2Title: "Hotové texty ke sdílení",
    get2Desc:
      "Připravené příspěvky pro WhatsApp a Facebook, e-mail pro rodiče a nápady na Instagram stories. Jen zkopíruj a sdílej.",
    get3Title: "Přehledný osobní prostor",
    get3Desc:
      "Vidíš v reálném čase: kolik lidí kliklo na odkaz, kolik se zaregistrovalo, kolik si zaplatilo vyšší plán a kolik dostáváš. Vše transparentní.",
    get4Title: "Osobní podpora",
    get4Desc:
      "Otázka k programu? Problém s odkazem? Je tu někdo, na koho se můžeš obrátit. Odpovídáme do jednoho pracovního dne.",

    earnEyebrow: "Kolik se dá vydělat",
    earnTitle: "Posuň posuvník a uvidíš",
    earnSubtitle:
      "Čísla závisí na tvém publiku a tom, co sdílíš. Takto se to sčítá. Nic nepřislibujeme, ale tohle je řád velikosti.",
    calcSubsLabel: "Aktivní Deep předplatitelé měsíčně",
    calcMonthly: "Měsíční odměna",
    calcYearly: "Za 12 měsíců",
    calcUnitSuffix: "předplatitelů",
    tableHeaderSubs: "Předplatitelé",
    tableHeaderMonthly: "Měsíční odměna",
    tableHeaderYearly: "Za 12 měsíců",
    earnNote:
      "Výpočet je založen na předplatném Deep ($4.99/měsíc) a 30% provizi v prvním roce. Od 13. měsíce dostávají Active Partners dalších 10% navždy na stejné zákazníky. Odměny se uvolňují po čekací době 30 dnů, výplata probíhá při dosažení $50 (minimální práh výplaty, ne strop).",
    midCta2: "Připraven začít? Získej svůj odkaz",

    trustEyebrow: "Proč důvěřovat",
    trustTitle: "Zakladatelský program ve svých počátcích",
    founderHeading: "Proč jsem vytvořil Gadit?",
    founderBody:
      "Moje poslání bylo vždy jedno: pomáhat lidem rozumět věcem až do konce. Protože když opravdu rozumíš, můžeš to uplatnit. A když to můžeš uplatnit, můžeš dosáhnout všeho, co chceš.\n\nBěhem let jsem viděl chytré, talentované lidi, kteří chtěli něčemu porozumět a nedařilo se jim to. Mysleli si, že na to prostě \"nemají\". Ale nebyli to oni. Bylo to jedno slovo v cestě.\n\nPostavil jsem Gadit, abych tuhle překážku odstranil. Ne další slovník. Ne jen překlad. Nástroj, který vysvětlí každé slovo až do konce, jednoduše, s příklady, s kontextem a s obrázkem, který ho oživí. Říkáme tomu udělat slovu GAD.\n\nPartnerský program je teď otevřený lidem, kteří se s touto myšlenkou ztotožňují a chtějí ji nést dál. Pokud jsi to ty, budu rád, když se přidáš.",
    founderSign: "Gadi Ben Lavi, zakladatel Gaditu",
    stat1Num: "9",
    stat1Label: "podporovaných jazyků rozhraní",
    stat2Num: "30%",
    stat2Label: "opakovaná provize po 12 měsíců",
    stat3Num: "60",
    stat3Label: "dní: okno paměti odkazu",

    faqEyebrow: "Časté otázky",
    faqTitle: "Co je dobré vědět",
    faq1Q: "Musím být profesionální marketér?",
    faq1A:
      "Ne. Většina našich partnerů jsou rodiče, učitelé a blogeři, kteří nikdy nic neprodávali. Vše, co potřebuješ, je sdílet odkaz s lidmi, kteří mohou z Gaditu těžit.",
    faq2Q: "Mohu sdílet ve WhatsApp nebo Facebook skupinách?",
    faq2A:
      "Ano, a je to jeden z nejlepších kanálů pro naše publikum. Rodiče se ve skupinách ptají jeden druhého na nástroje, a právě tam má tvé doporučení největší dopad.",
    faq3Q: "Kdy dostanu výplatu?",
    faq3A:
      "Měsíční výplata na konci každého měsíce, jakmile se nasčítá $50. Práh $50 je minimum pro výplatu, ne strop. Můžeš vydělat mnohem víc, jen peníze fakticky dostáváš ve chvíli, kdy ten práh překročíš.",
    faq4Q: "Co se stane, když můj zákazník zruší?",
    faq4A:
      "Provizi dostaneš jen za měsíce, které zákazník skutečně zaplatil. Pokud zruší po 4 měsících, dostal jsi 4 měsíce odměny. Spravedlivé pro obě strany.",
    faq5Q: "Existuje limit na počet zákazníků?",
    faq5A:
      "Vůbec ne. Můžeš přivést kolik chceš zákazníků, odkudkoliv na světě, v jakémkoliv z 11 jazyků, které Gadit podporuje.",
    faq6Q: "Co dělá odkaz, když se někdo nepřihlásí hned?",
    faq6A:
      "Odkaz si tě pamatuje 60 dní. Pokud někdo klikne, dva týdny váhá a vrátí se koupit předplatné, registrace stále patří tobě.",
    faq7Q: "A co roční předplatné?",
    faq7A:
      "Za roční předplatné dostaneš jednorázovou odměnu 15% z první platby (místo 30% měsíčně po celý rok). Je to spravedlivá rovnováha vzhledem ke slevě, kterou na roční platbě dáváme.",
    faq8Q: "Dostanu hotové marketingové materiály?",
    faq8A:
      "Ano. Můžeš zkopírovat hotové texty pro WhatsApp, e-mail pro rodiče, příspěvky pro Facebook a koncepty stories. Pokud chceš něco konkrétního, napiš nám a my to připravíme.",
    faq9Q: "Mohu dělat placenou reklamu na Googlu nebo Facebooku?",
    faq9A:
      "Organické příspěvky pro tvé publikum: ano. Ale nesmíš kupovat reklamy na Googlu nebo Facebooku na samotné slovo 'Gadit'. Nechceme, abys konkuroval hlavní stránce o stejný provoz. Celá pravidla jsou ve tvém přehledu.",
    faq10Q: "Musím být platící předplatitel, abych mohl být partner?",
    faq10A:
      "Ano. Partnerský program je otevřen pouze předplatitelům Clear a Deep. Dobré doporučení začíná u produktu, který sám znáš. Pokud jsi ještě v Basic, přejdi na Clear nebo Deep z obrazovky 'Ceník', a získáš jak kompletní slovník, tak přístup k programu.",
    faq11Q: "Co je Active Partner a jak se k tomu dostat?",
    faq11A:
      "Když přivedeš 10 aktivních platících zákazníků, staneš se automaticky Active Partner. Tento status odemkne dalších 10% opakované provize navždy na všechny tvé zákazníky (i stávající, od 13. měsíce). Znamená to, že i po dvou, třech nebo pěti letech, pokud jsou tví zákazníci stále předplaceni, ty stále dostáváš odměnu.",

    finalTitle: "Připraven začít?",
    finalSubtitle:
      "Registrace trvá minutu. Automatické schválení. Odkaz je hned hotový.",
    finalCta: "Získej svůj osobní odkaz, zdarma",
    termsLink: "Podmínky partnerského programu",
  },
  sk: {
    navAffiliates: "Partneri",
    topbarSignIn: "Už ste partner? Prihlásenie",

    heroEyebrow: "Partnerský program",
    heroTitle: "Odporúč Gadit.\nZarábaj každý mesiac.",
    heroSubtitle:
      "Zdieľaš svoj osobný odkaz a my ťa odmeňujeme 30% opakovanou províziou v prvom roku. Priveď 10 aktívnych zákazníkov, staň sa Active Partner a zarábaj 10% navždy.",
    heroCtaPrimary: "Získaj svoj osobný odkaz, zadarmo",
    heroProofA: "30% v prvom roku",
    heroProofB: "10% navždy (Active Partner)",
    heroProofC: "Okamžitý odkaz",
    heroProofD: "Pre predplatiteľov Clear a Deep",

    whyEyebrow: "Najprv produkt",
    whyTitle: "Prečo stojí za to Gadit odporúčať",
    whySubtitle:
      "Odporučíš len to, čomu veríš. Tu je, čo tvoje publikum dostane, a prečo ti poďakuje.",
    why1Title: "Skutočný slovník, nie suchý preklad",
    why1Desc:
      "Všetky významy slova, skutočné príklady ku každému, idiómy, historický pôvod a obrázok. Gadit vysvetľuje slovo tak, ako má, nie ako bežný slovník.",
    why2Title: "Funguje v 11 jazykoch",
    why2Desc:
      "Hebrejsky, anglicky, arabsky, rusky, španielsky, portugalsky, francúzsky, nemecky, česky, slovensky, taliansky a japonsky. Vhodné pre rodených hovoriacich aj pre rodičov detí, ktoré sa učia druhý jazyk.",
    why3Title: "Navrhnutý pre rodičov, učiteľov a študentov",
    why3Desc:
      "Vysvetlenia pre deti, kvízy, slovné hry a osobný zošit. Gadit nie je stavaný pre akademikov. Je stavaný pre domov, triedu a WhatsApp skupinu.",

    whoEyebrow: "Pre koho to je",
    whoTitle: "Ľudia s komunitou, ktorá im verí",
    who1Title: "Tvorcovia obsahu a blogeri o vzdelávaní",
    who1Desc:
      "Ak píšeš, natáčaš alebo zdieľaš obsah o jazyku, učení alebo vzdelávaní, tvoje publikum tvojím odporúčaniam už verí.",
    who2Title: "Učitelia, terapeuti a pedagógovia",
    who2Desc:
      "Ak pracuješ so študentmi a rodičmi, tvoje odporúčanie vzdelávacieho nástroja prichádza z miesta profesionálnej dôvery.",
    who3Title: "Aktívni rodičia v komunitách",
    who3Desc:
      "Rodičovské skupiny, triedne chaty, mailing listy: všade tam, kde sa rodičia pýtajú jeden druhého na nástroje, ktoré pomáhajú ich deťom.",

    howEyebrow: "Ako to funguje",
    howTitle: "Tri kroky, bez žiadnych technických znalostí",
    how1Title: "Registrácia do programu",
    how1Desc:
      "Krátky formulár. Počas minúty dostaneš automatické schválenie, osobný odkaz a prístup do svojho prehľadu.",
    how2Title: "Zdieľanie odkazu",
    how2Desc:
      "Na rodičovskom WhatsApp, v e-maile pre svoj zoznam, v story na Instagrame, na blogu alebo osobne. Tam, kde to sedí tvojmu publiku.",
    how3Title: "Odmena, ktorá rastie s tebou",
    how3Desc:
      "30% opakovaná provízia po dobu 12 mesiacov za každého zákazníka, ktorý sa prihlási cez tvoj odkaz. Keď privedieš 10 aktívnych zákazníkov, staneš sa Active Partner a odomkneš ďalších 10% opakovanej provízie navždy na všetkých tvojich zákazníkov, od 13. mesiaca ďalej.",
    midCta1: "Začni teraz. Trvá to minútu.",

    getEyebrow: "Čo dostaneš",
    getTitle: "Nenecháme ťa v tom samého",
    getSubtitle:
      "Ak si v živote nikdy nič nepredával, nevadí. Všetko máme pripravené.",
    get1Title: "Tvoj vlastný osobný odkaz",
    get1Desc:
      "Krátky, jedinečný odkaz, ktorý môžeš zdieľať kdekoľvek. Aj keď naň niekto klikne a vráti sa až za 60 dní, registrácia je stále tvoja.",
    get2Title: "Hotové texty na zdieľanie",
    get2Desc:
      "Pripravené príspevky pre WhatsApp a Facebook, e-mail pre rodičov a nápady na Instagram stories. Len skopíruj a zdieľaj.",
    get3Title: "Prehľadný osobný priestor",
    get3Desc:
      "Vidíš v reálnom čase: koľko ľudí kliklo na odkaz, koľko sa zaregistrovalo, koľko si zaplatilo vyšší plán a koľko dostávaš. Všetko transparentné.",
    get4Title: "Osobná podpora",
    get4Desc:
      "Otázka k programu? Problém s odkazom? Je tu niekto, na koho sa môžeš obrátiť. Odpovedáme do jedného pracovného dňa.",

    earnEyebrow: "Koľko sa dá zarobiť",
    earnTitle: "Posuň posuvník a uvidíš",
    earnSubtitle:
      "Čísla závisia od tvojho publika a toho, čo zdieľaš. Takto sa to sčíta. Nič nesľubujeme, ale toto je rád veľkosti.",
    calcSubsLabel: "Aktívni Deep predplatitelia mesačne",
    calcMonthly: "Mesačná odmena",
    calcYearly: "Za 12 mesiacov",
    calcUnitSuffix: "predplatiteľov",
    tableHeaderSubs: "Predplatitelia",
    tableHeaderMonthly: "Mesačná odmena",
    tableHeaderYearly: "Za 12 mesiacov",
    earnNote:
      "Výpočet je založený na predplatnom Deep ($4.99/mesiac) a 30% provízii v prvom roku. Od 13. mesiaca dostávajú Active Partners ďalších 10% navždy na rovnakých zákazníkov. Odmeny sa uvoľňujú po čakacej dobe 30 dní, výplata prebieha pri dosiahnutí $50 (minimálny prah výplaty, nie strop).",
    midCta2: "Pripravený začať? Získaj svoj odkaz",

    trustEyebrow: "Prečo dôverovať",
    trustTitle: "Zakladateľský program v svojich začiatkoch",
    founderHeading: "Prečo som vytvoril Gadit?",
    founderBody:
      "Moje poslanie bolo vždy jedno: pomáhať ľuďom rozumieť veciam až do konca. Pretože keď naozaj rozumieš, môžeš to uplatniť. A keď to môžeš uplatniť, môžeš dosiahnuť všetko, čo chceš.\n\nPočas rokov som videl bystrých, talentovaných ľudí, ktorí chceli niečomu porozumieť a nedarilo sa im to. Mysleli si, že na to jednoducho \"nemajú\". Ale neboli to oni. Bolo to jedno slovo v ceste.\n\nPostavil som Gadit, aby som túto prekážku odstránil. Nie ďalší slovník. Nie len preklad. Nástroj, ktorý vysvetlí každé slovo až do konca, jednoducho, s príkladmi, s kontextom a s obrázkom, ktorý ho oživí. Hovoríme tomu urobiť slovu GAD.\n\nPartnerský program je teraz otvorený ľuďom, ktorí sa s touto myšlienkou stotožňujú a chcú ju niesť ďalej. Ak si to ty, budem rád, keď sa pridáš.",
    founderSign: "Gadi Ben Lavi, zakladateľ Gaditu",
    stat1Num: "9",
    stat1Label: "podporovaných jazykov rozhrania",
    stat2Num: "30%",
    stat2Label: "opakovaná provízia po 12 mesiacov",
    stat3Num: "60",
    stat3Label: "dní: okno pamäte odkazu",

    faqEyebrow: "Časté otázky",
    faqTitle: "Čo je dobré vedieť",
    faq1Q: "Musím byť profesionálny marketér?",
    faq1A:
      "Nie. Väčšina našich partnerov sú rodičia, učitelia a blogeri, ktorí nikdy nič nepredávali. Všetko, čo potrebuješ, je zdieľať odkaz s ľuďmi, ktorí môžu z Gaditu ťažiť.",
    faq2Q: "Môžem zdieľať vo WhatsApp alebo Facebook skupinách?",
    faq2A:
      "Áno, a je to jeden z najlepších kanálov pre naše publikum. Rodičia sa v skupinách pýtajú jeden druhého na nástroje, a práve tam má tvoje odporúčanie najväčší dopad.",
    faq3Q: "Kedy dostanem výplatu?",
    faq3A:
      "Mesačná výplata na konci každého mesiaca, akonáhle sa nasčíta $50. Prah $50 je minimum pre výplatu, nie strop. Môžeš zarobiť oveľa viac, len peniaze fakticky dostávaš v momente, keď ten prah prekročíš.",
    faq4Q: "Čo sa stane, keď môj zákazník zruší?",
    faq4A:
      "Províziu dostaneš len za mesiace, ktoré zákazník skutočne zaplatil. Ak zruší po 4 mesiacoch, dostal si 4 mesiace odmeny. Spravodlivé pre obe strany.",
    faq5Q: "Existuje limit na počet zákazníkov?",
    faq5A:
      "Vôbec nie. Môžeš priviesť koľko chceš zákazníkov, odkiaľkoľvek na svete, v akomkoľvek z 11 jazykov, ktoré Gadit podporuje.",
    faq6Q: "Čo robí odkaz, keď sa niekto neprihlási hneď?",
    faq6A:
      "Odkaz si ťa pamätá 60 dní. Ak niekto klikne, dva týždne váha a vráti sa kúpiť predplatné, registrácia stále patrí tebe.",
    faq7Q: "A čo ročné predplatné?",
    faq7A:
      "Za ročné predplatné dostaneš jednorazovú odmenu 15% z prvej platby (namiesto 30% mesačne celý rok). Je to spravodlivá rovnováha vzhľadom na zľavu, ktorú na ročnej platbe dávame.",
    faq8Q: "Dostanem hotové marketingové materiály?",
    faq8A:
      "Áno. Môžeš skopírovať hotové texty pre WhatsApp, e-mail pre rodičov, príspevky pre Facebook a koncepty stories. Ak chceš niečo konkrétne, napíš nám a my to pripravíme.",
    faq9Q: "Môžem robiť platenú reklamu na Googli alebo Facebooku?",
    faq9A:
      "Organické príspevky pre tvoje publikum: áno. Ale nesmieš kupovať reklamy na Googli alebo Facebooku na samotné slovo 'Gadit'. Nechceme, aby si konkuroval hlavnej stránke o rovnakú prevádzku. Celé pravidlá sú v tvojom prehľade.",
    faq10Q: "Musím byť platiaci predplatiteľ, aby som mohol byť partner?",
    faq10A:
      "Áno. Partnerský program je otvorený len pre predplatiteľov Clear a Deep. Dobré odporúčanie začína pri produkte, ktorý sám poznáš. Ak si ešte v Basic, prejdi na Clear alebo Deep z obrazovky 'Cenník', a získaš ako kompletný slovník, tak prístup k programu.",
    faq11Q: "Čo je Active Partner a ako sa k tomu dostať?",
    faq11A:
      "Keď privedieš 10 aktívnych platiacich zákazníkov, staneš sa automaticky Active Partner. Tento status odomkne ďalších 10% opakovanej provízie navždy na všetkých tvojich zákazníkov (aj existujúcich, od 13. mesiaca). Znamená to, že aj po dvoch, troch alebo piatich rokoch, ak sú tvoji zákazníci stále predplatení, ty stále dostávaš odmenu.",

    finalTitle: "Pripravený začať?",
    finalSubtitle:
      "Registrácia trvá minútu. Automatické schválenie. Odkaz je hneď hotový.",
    finalCta: "Získaj svoj osobný odkaz, zadarmo",
    termsLink: "Podmienky partnerského programu",
  },
  it: {
    navAffiliates: "Affiliati",
    topbarSignIn: "Già partner? Accedi",

    heroEyebrow: "Programma partner",
    heroTitle: "Consiglia Gadit.\nGuadagna ogni mese.",
    heroSubtitle:
      "Condividi il tuo link personale e noi ti premiamo con il 30% di commissione ricorrente nel primo anno. Porta 10 clienti attivi, diventa Active Partner e guadagna il 10% a vita.",
    heroCtaPrimary: "Ottieni il tuo link personale, gratis",
    heroProofA: "30% il primo anno",
    heroProofB: "10% a vita (Active Partner)",
    heroProofC: "Link immediato",
    heroProofD: "Per abbonati Clear e Deep",

    whyEyebrow: "Prima il prodotto",
    whyTitle: "Perché vale la pena consigliare Gadit",
    whySubtitle:
      "Consiglierai solo ciò in cui credi. Ecco cosa riceverà il tuo pubblico, e perché ti ringrazierà.",
    why1Title: "Un dizionario vero, non una traduzione asciutta",
    why1Desc:
      "Tutti i significati di una parola, esempi reali per ciascuno, modi di dire, origine storica e un'immagine. Gadit spiega una parola come si deve, non come fa un dizionario qualsiasi.",
    why2Title: "Funziona in 11 lingue",
    why2Desc:
      "Ebraico, inglese, arabo, russo, spagnolo, portoghese, francese, tedesco, ceco, italiano e giapponese. Adatto a madrelingua e a genitori di bambini che imparano una seconda lingua.",
    why3Title: "Pensato per genitori, insegnanti e studenti",
    why3Desc:
      "Spiegazione per bambini, quiz, giochi di parole e un quaderno personale. Gadit non è costruito per accademici. È costruito per la casa, l'aula e il gruppo WhatsApp.",

    whoEyebrow: "Per chi è",
    whoTitle: "Persone con una community che si fida di loro",
    who1Title: "Creator e blogger di educazione",
    who1Desc:
      "Se scrivi, filmi o condividi contenuti su lingua, apprendimento o educazione, il tuo pubblico si fida già dei tuoi consigli.",
    who2Title: "Insegnanti, terapisti ed educatori",
    who2Desc:
      "Se lavori con studenti e genitori, il tuo consiglio su uno strumento educativo arriva da un luogo di fiducia professionale.",
    who3Title: "Genitori attivi nelle community",
    who3Desc:
      "Gruppi di genitori, chat di classe, mailing list: ovunque i genitori si chiedano a vicenda quali strumenti aiutano i loro figli.",

    howEyebrow: "Come funziona",
    howTitle: "Tre passi, senza nessuna conoscenza tecnica",
    how1Title: "Iscriviti al programma",
    how1Desc:
      "Un modulo breve. In un minuto ricevi approvazione automatica, link personale e accesso alla tua dashboard.",
    how2Title: "Condividi il link",
    how2Desc:
      "Nel WhatsApp dei genitori, in un'email alla tua lista, in una storia Instagram, sul tuo blog o di persona. Dove ha senso per il tuo pubblico.",
    how3Title: "Ricompensa che cresce con te",
    how3Desc:
      "30% di commissione ricorrente per 12 mesi per ogni cliente che si iscrive tramite il tuo link. Quando porti 10 clienti attivi diventi Active Partner e sblocchi un ulteriore 10% di commissione ricorrente a vita, su tutti i tuoi clienti, dal mese 13 in avanti.",
    midCta1: "Inizia ora. Ci vuole un minuto.",

    getEyebrow: "Cosa ricevi",
    getTitle: "Non ti lasciamo da solo",
    getSubtitle:
      "Se non hai mai venduto niente in vita tua, va bene. Abbiamo preparato tutto per te.",
    get1Title: "Il tuo link personale",
    get1Desc:
      "Un link breve e unico che puoi condividere ovunque. Anche se qualcuno clicca e torna solo dopo 60 giorni, l'iscrizione resta tua.",
    get2Title: "Testi pronti da condividere",
    get2Desc:
      "Post pronti per WhatsApp e Facebook, un'email per i genitori e idee per storie Instagram. Solo copia e condividi.",
    get3Title: "Una dashboard chiara",
    get3Desc:
      "Vedi in tempo reale: quanti hanno cliccato sul link, quanti si sono iscritti, quanti hanno fatto upgrade e quanto ricevi. Tutto trasparente.",
    get4Title: "Supporto personale",
    get4Desc:
      "Domande sul programma? Problemi con il link? C'è qualcuno a cui rivolgerti. Rispondiamo entro un giorno lavorativo.",

    earnEyebrow: "Quanto si può guadagnare",
    earnTitle: "Sposta lo slider e vedrai",
    earnSubtitle:
      "I numeri dipendono dal tuo pubblico e da cosa condividi. Ecco come si accumula. Non promettiamo una cifra, ma questo è l'ordine di grandezza.",
    calcSubsLabel: "Abbonati Deep attivi al mese",
    calcMonthly: "Ricompensa mensile",
    calcYearly: "In 12 mesi",
    calcUnitSuffix: "abbonati",
    tableHeaderSubs: "Abbonati",
    tableHeaderMonthly: "Ricompensa mensile",
    tableHeaderYearly: "In 12 mesi",
    earnNote:
      "Calcolo basato su un abbonamento Deep ($4.99/mese) e 30% di commissione nel primo anno. Dal mese 13, gli Active Partners ricevono un ulteriore 10% a vita sugli stessi clienti. Le ricompense vengono rilasciate dopo un periodo di attesa di 30 giorni, e il pagamento avviene al raggiungimento di $50 (soglia minima di pagamento, non un tetto).",
    midCta2: "Pronto a iniziare? Ottieni il tuo link",

    trustEyebrow: "Perché fidarsi",
    trustTitle: "Programma fondatore alle sue prime fasi",
    founderHeading: "Perché ho creato Gadit?",
    founderBody:
      "La mia missione è sempre stata una: aiutare le persone a capire le cose fino in fondo. Perché quando capisci davvero, puoi applicare. E quando puoi applicare, puoi raggiungere qualsiasi cosa tu voglia.\n\nNel corso degli anni ho visto persone intelligenti, talentuose, che volevano capire qualcosa e non ci riuscivano. Pensavano di essere semplicemente \"non portate per quello\". Ma non erano loro. Era una parola sulla strada.\n\nHo costruito Gadit per togliere quella barriera. Non un altro dizionario. Non solo una traduzione. Uno strumento che spiega ogni parola fino in fondo, con semplicità, con esempi, con contesto e con un'immagine che la fa vivere. Lo chiamiamo fare GAD a una parola.\n\nIl programma partner è ora aperto a persone che si riconoscono in questa idea e vogliono portarla avanti. Se sei tu, sarò felice di averti dentro.",
    founderSign: "Gadi Ben Lavi, fondatore di Gadit",
    stat1Num: "9",
    stat1Label: "lingue dell'interfaccia supportate",
    stat2Num: "30%",
    stat2Label: "commissione ricorrente per 12 mesi",
    stat3Num: "60",
    stat3Label: "giorni: finestra di memoria del link",

    faqEyebrow: "Domande frequenti",
    faqTitle: "Cosa vale la pena sapere",
    faq1Q: "Devo essere un professionista del marketing?",
    faq1A:
      "No. La maggior parte dei nostri partner sono genitori, insegnanti e blogger che non hanno mai venduto niente. Tutto ciò che serve è condividere il link con persone che possono beneficiare di Gadit.",
    faq2Q: "Posso condividere in gruppi WhatsApp o Facebook?",
    faq2A:
      "Sì, ed è uno dei migliori canali per il nostro pubblico. I genitori si chiedono a vicenda quali strumenti usare nei gruppi, e lì il tuo consiglio ha l'impatto più forte.",
    faq3Q: "Quando ricevo il pagamento?",
    faq3A:
      "Pagamento mensile alla fine di ogni mese, dopo aver accumulato $50. La soglia di $50 è un minimo di pagamento, non un tetto. Puoi guadagnare molto di più, semplicemente ricevi il denaro nel momento in cui la superi.",
    faq4Q: "Cosa succede se il mio cliente annulla?",
    faq4A:
      "Riceverai commissione solo per i mesi in cui il cliente ha effettivamente pagato. Se annulla dopo 4 mesi, hai ricevuto 4 mesi di ricompensa. Giusto per entrambe le parti.",
    faq5Q: "C'è un limite al numero di clienti?",
    faq5A:
      "Per niente. Puoi portare quanti clienti vuoi, da qualsiasi parte del mondo, in una qualsiasi delle 11 lingue supportate da Gadit.",
    faq6Q: "Cosa fa il link se qualcuno non si iscrive subito?",
    faq6A:
      "Il link ti ricorda per 60 giorni. Se qualcuno clicca, esita due settimane e torna a comprare un abbonamento, l'iscrizione conta ancora come tua.",
    faq7Q: "E sull'abbonamento annuale?",
    faq7A:
      "Sull'abbonamento annuale ricevi una ricompensa una tantum del 15% sul primo pagamento (invece del 30% mensile durante l'anno). È un equilibrio giusto, considerando lo sconto che diamo sul pagamento annuale.",
    faq8Q: "Riceverò materiali di marketing pronti?",
    faq8A:
      "Sì. Puoi copiare testi pronti per WhatsApp, un'email per i genitori, post per Facebook e bozze di storie. Se vuoi qualcosa di specifico, scrivici e lo prepariamo.",
    faq9Q: "Posso fare annunci a pagamento su Google o Facebook?",
    faq9A:
      "Post organici per il tuo pubblico: sì. Ma non puoi comprare annunci su Google o Facebook sulla parola 'Gadit' stessa. Non vogliamo che competi con il sito principale per lo stesso traffico. Le regole complete sono nella tua dashboard.",
    faq10Q: "Devo essere abbonato a pagamento per essere partner?",
    faq10A:
      "Sì. Il programma partner è aperto solo agli abbonati Clear e Deep. Un buon consiglio inizia da un prodotto che conosci tu stesso. Se sei ancora su Basic, passa a Clear o Deep dalla schermata 'Prezzi', e otterrai sia il dizionario completo che l'accesso al programma.",
    faq11Q: "Cos'è un Active Partner e come ci si arriva?",
    faq11A:
      "Quando porti 10 clienti attivi paganti, diventi automaticamente Active Partner. Quello status sblocca un ulteriore 10% di commissione ricorrente a vita su tutti i tuoi clienti (anche quelli esistenti, dal mese 13). Significa che anche dopo due, tre o cinque anni, se i tuoi clienti sono ancora abbonati, tu continui a ricevere ricompensa.",

    finalTitle: "Pronto a iniziare?",
    finalSubtitle:
      "L'iscrizione richiede un minuto. Approvazione automatica. Link pronto subito.",
    finalCta: "Ottieni il tuo link personale, gratis",
    termsLink: "Condizioni del programma partner",
  },
  ja: {
    navAffiliates: "パートナー",
    topbarSignIn: "すでにパートナーですか？ ログイン",

    heroEyebrow: "パートナープログラム",
    heroTitle: "Gadit をすすめよう。\n毎月の収入に。",
    heroSubtitle:
      "あなたの個人リンクをシェアしていただくと、初年度は30%の継続コミッションをお支払いします。10人のアクティブな顧客を紹介して Active Partner になると、生涯にわたって10%を獲得できます。",
    heroCtaPrimary: "あなたの個人リンクを無料で取得",
    heroProofA: "初年度30%",
    heroProofB: "生涯10%（Active Partner）",
    heroProofC: "即時リンク",
    heroProofD: "Clear と Deep の購読者向け",

    whyEyebrow: "まずは製品",
    whyTitle: "なぜ Gadit をすすめる価値があるのか",
    whySubtitle:
      "信じているものだけをおすすめします。あなたのオーディエンスが受け取るものと、彼らがあなたに感謝する理由をご紹介します。",
    why1Title: "本物の辞書、味気ない翻訳ではない",
    why1Desc:
      "単語のすべての意味、それぞれの実例、イディオム、歴史的な語源、そして画像。Gadit は普通の辞書のようにではなく、本来あるべき形で単語を説明します。",
    why2Title: "11言語に対応",
    why2Desc:
      "ヘブライ語、英語、アラビア語、ロシア語、スペイン語、ポルトガル語、フランス語、ドイツ語、チェコ語、イタリア語、日本語。ネイティブの方にも、第二言語を学ぶ子どもの保護者の方にも合います。",
    why3Title: "保護者・教師・学習者のために設計",
    why3Desc:
      "子ども向けの説明、クイズ、ワードゲーム、個人ノート。Gadit は学者向けではありません。家庭、教室、保護者の WhatsApp グループのために作られています。",

    whoEyebrow: "どんな方に",
    whoTitle: "あなたを信頼するコミュニティを持つ方々",
    who1Title: "コンテンツクリエイター・教育系ブロガー",
    who1Desc:
      "言語・学習・教育について書く、撮る、共有しているなら、あなたのオーディエンスはすでにあなたのおすすめを信頼しています。",
    who2Title: "教師・セラピスト・教育者",
    who2Desc:
      "生徒さんや保護者の方と関わっているなら、教育ツールに関するあなたのおすすめは専門的な信頼の場所から届きます。",
    who3Title: "コミュニティで活躍する保護者",
    who3Desc:
      "保護者グループ、クラスのチャット、メーリングリスト：保護者同士が、子どもに役立つツールについて教え合うあらゆる場所。",

    howEyebrow: "仕組み",
    howTitle: "3ステップ、技術的な知識はいりません",
    how1Title: "プログラムに登録",
    how1Desc:
      "短いフォームに記入。1分で自動承認、個人リンク、ダッシュボードへのアクセスが手に入ります。",
    how2Title: "リンクをシェア",
    how2Desc:
      "保護者の WhatsApp、リストへのメール、Instagram ストーリー、ブログ、対面など。あなたのオーディエンスに合う場所で。",
    how3Title: "あなたとともに成長する報酬",
    how3Desc:
      "リンク経由でサインアップした各顧客につき、12か月間は30%の継続コミッション。アクティブな顧客を10人連れてくると Active Partner になり、13か月目以降、すべての顧客に対し生涯10%の継続コミッションがさらに開放されます。",
    midCta1: "今すぐ始めましょう。1分で完了。",

    getEyebrow: "受け取れるもの",
    getTitle: "ひとりにはしません",
    getSubtitle:
      "これまで何も売ったことがなくても大丈夫です。すべて準備されています。",
    get1Title: "あなた専用の個人リンク",
    get1Desc:
      "どこにでもシェアできる、短くてユニークなリンク。誰かがクリックして60日後に戻ってきても、登録はあなたのものです。",
    get2Title: "シェア用のテキスト",
    get2Desc:
      "WhatsApp と Facebook 用の投稿、保護者向けのメール、Instagram ストーリーのアイデア。コピーしてシェアするだけ。",
    get3Title: "整理された個人ダッシュボード",
    get3Desc:
      "リアルタイムで確認できます：何人がリンクをクリックしたか、何人が登録したか、何人がアップグレードしたか、いくら受け取っているか。すべて透明です。",
    get4Title: "個別サポート",
    get4Desc:
      "プログラムの質問？リンクの不具合？問い合わせ先があります。営業日1日以内にお返事します。",

    earnEyebrow: "どれくらい稼げるか",
    earnTitle: "スライダーを動かしてご覧ください",
    earnSubtitle:
      "金額はあなたのオーディエンスと、何をシェアするかによって変わります。これがどう積み上がるかです。金額を保証するものではありませんが、これがおおよその規模です。",
    calcSubsLabel: "月あたりのアクティブな Deep 購読者",
    calcMonthly: "月次の報酬",
    calcYearly: "12か月で",
    calcUnitSuffix: "人",
    tableHeaderSubs: "購読者数",
    tableHeaderMonthly: "月次の報酬",
    tableHeaderYearly: "12か月で",
    earnNote:
      "計算は Deep プラン（$4.99/月）と初年度の30%コミッションに基づいています。13か月目以降、Active Partners はその同じ顧客から生涯10%を追加で受け取ります。報酬は30日間の保留期間後にリリースされ、$50に達した時点で支払われます（最低支払い額であり、上限ではありません）。",
    midCta2: "始める準備はできましたか？ あなたのリンクを取得",

    trustEyebrow: "信頼できる理由",
    trustTitle: "創業初期のファウンダープログラム",
    founderHeading: "なぜ Gadit を作ったのか？",
    founderBody:
      "私のミッションはずっと一つでした：人々が物事を最後まで理解できるよう手伝うこと。本当に理解できれば、応用できる。応用できれば、望むものすべてを達成できる。\n\n長年にわたり、何かを理解したいのに理解できない、賢く才能ある人たちを見てきました。彼らは自分たちが「これが向いていない」だけだと思っていました。でもそれは彼らの問題ではありませんでした。途中にあった一つの言葉のせいでした。\n\nその障壁を取り除くために Gadit を作りました。もう一つの辞書ではありません。ただの翻訳でもありません。すべての単語を最後まで説明するツールです。シンプルに、例とともに、文脈とともに、そして単語を生き生きと見せる画像とともに。私たちはこれを単語に GAD する、と呼んでいます。\n\nパートナープログラムは今、この考えに共鳴し、それをさらに広めたい方々に開かれています。あなたがそうなら、参加していただけるとうれしいです。",
    founderSign: "ガディ・ベン・ラビ、Gadit 創業者",
    stat1Num: "9",
    stat1Label: "対応インターフェース言語",
    stat2Num: "30%",
    stat2Label: "12か月の継続コミッション",
    stat3Num: "60",
    stat3Label: "日：リンクのクッキー記憶期間",

    faqEyebrow: "よくある質問",
    faqTitle: "知っておきたいこと",
    faq1Q: "マーケティングのプロでなければいけませんか？",
    faq1A:
      "いいえ。私たちのパートナーのほとんどは、これまで何も売ったことのない保護者、教師、ブロガーです。Gadit から恩恵を受けられそうな人にリンクを共有するだけで十分です。",
    faq2Q: "WhatsApp や Facebook グループでシェアしてもよいですか？",
    faq2A:
      "はい、そして私たちのオーディエンスにとって最良のチャネルの一つです。保護者の方たちはグループの中で、どんなツールがよいかをお互いに尋ね合います。そこであなたのおすすめが最も影響を持ちます。",
    faq3Q: "いつ支払いを受け取れますか？",
    faq3A:
      "毎月の月末に、$50に達した時点で支払われます。$50の閾値は最低支払額であり、上限ではありません。それ以上稼ぐことも可能で、超えた瞬間に実際に受け取れます。",
    faq4Q: "顧客がキャンセルしたらどうなりますか？",
    faq4A:
      "顧客が実際に支払った月の分だけコミッションを受け取ります。4か月でキャンセルした場合、4か月分の報酬を受け取ったことになります。両者にとって公正です。",
    faq5Q: "顧客数に上限はありますか？",
    faq5A:
      "ありません。Gadit が対応する11言語のいずれかで、世界のどこからでも、好きなだけ顧客を連れてこられます。",
    faq6Q: "すぐにサインアップしなかった場合、リンクはどうなりますか？",
    faq6A:
      "リンクはあなたを60日間記憶します。誰かがクリックして2週間迷い、それから戻ってサブスクを購入しても、登録はあなたのものとカウントされます。",
    faq7Q: "年間プランについては？",
    faq7A:
      "年間プランの場合、初回支払いの15%を一回限りの報酬として受け取ります（月次30%×1年の代わりに）。年間支払いの割引を考慮した公正なバランスです。",
    faq8Q: "すぐ使えるマーケティング素材はもらえますか？",
    faq8A:
      "はい。WhatsApp 用のテキスト、保護者向けのメール、Facebook 用の投稿、ストーリーの下書きをそのままコピーできます。特定のものが必要なら、お問い合わせいただければ用意します。",
    faq9Q: "Google や Facebook で有料広告を出してもよいですか？",
    faq9A:
      "あなたのオーディエンスへのオーガニックな投稿：はい。ただし、「Gadit」という単語そのものをターゲットとした Google や Facebook の広告を購入することはできません。メインサイトと同じトラフィックを取り合ってほしくないからです。詳しいルールはダッシュボードに記載されています。",
    faq10Q: "パートナーになるには有料購読者である必要がありますか？",
    faq10A:
      "はい。パートナープログラムは Clear と Deep の購読者のみに開かれています。良いおすすめは、自分が知っている製品から始まります。まだ Basic の場合は、料金画面から Clear または Deep にアップグレードしてください。完全な辞書とプログラムへのアクセスの両方が手に入ります。",
    faq11Q: "Active Partner とは何で、どうすればなれますか？",
    faq11A:
      "アクティブで支払いをしている顧客を10人連れてくると、自動的に Active Partner になります。このステータスは、すべての顧客（既存の顧客も、13か月目以降）に対して、生涯にわたって10%の追加継続コミッションを開放します。つまり2年、3年、5年経っても、顧客が引き続き購読していれば、報酬を受け取り続けられます。",

    finalTitle: "始める準備はできましたか？",
    finalSubtitle: "登録は1分で完了。自動承認。リンクはすぐに使えます。",
    finalCta: "あなたの個人リンクを無料で取得",
    termsLink: "パートナープログラム規約",
  },
  hi: {
    navAffiliates: "पार्टनर",
    topbarSignIn: "पहले से पार्टनर हैं? साइन इन",

    heroEyebrow: "पार्टनर प्रोग्राम",
    heroTitle: "Gadit की सिफ़ारिश करें।\nमासिक आय कमाएँ।",
    heroSubtitle:
      "अपना निजी लिंक साझा करें, पहले 12 महीनों में हर ग्राहक पर 30% आजीवन कमीशन। 10 सक्रिय ग्राहक लाएँ और Active Partner बनें, सभी ग्राहकों पर आजीवन अतिरिक्त 10%।",
    heroCtaPrimary: "अपना निजी लिंक मुफ्त पाएँ",
    heroProofA: "पहला साल 30%",
    heroProofB: "आजीवन 10% (Active Partner)",
    heroProofC: "तुरंत लिंक",
    heroProofD: "Clear और Deep सब्सक्राइबरों के लिए",

    whyEyebrow: "पहले उत्पाद",
    whyTitle: "Gadit की सिफ़ारिश करना क्यों मूल्यवान है",
    whySubtitle:
      "हम सिर्फ़ उन्हीं चीज़ों की सिफ़ारिश करते हैं जिन पर हम विश्वास करते हैं। यहाँ बताया है आपके दर्शक क्या पाएँगे, और क्यों वे आपको धन्यवाद देंगे।",
    why1Title: "असली शब्दकोश, सिर्फ़ अनुवाद नहीं",
    why1Desc:
      "हर शब्द के सभी अर्थ, हर अर्थ के असली उदाहरण, मुहावरे, ऐतिहासिक उत्पत्ति और तस्वीरें। Gadit शब्दों को वैसे समझाता है जैसे शब्दकोश को असल में समझाना चाहिए।",
    why2Title: "13 भाषाएँ समर्थित",
    why2Desc:
      "हिब्रू, अंग्रेज़ी, अरबी, रूसी, स्पैनिश, पुर्तगाली, फ़्रेंच, जर्मन, चेक, स्लोवाक, इतालवी, जापानी और हिन्दी। नेटिव बोलने वाले, या दूसरी भाषा सीखते बच्चों के माता-पिता, दोनों के लिए।",
    why3Title: "माता-पिता, शिक्षकों और सीखने वालों के लिए बना",
    why3Desc:
      "बच्चों के लिए समझ, क्विज़, शब्द-खेल, व्यक्तिगत नोटबुक। Gadit अकादमिकों के लिए नहीं है। घरों, क्लासरूम और माता-पिता के WhatsApp ग्रुप के लिए बना है।",

    whoEyebrow: "किसके लिए",
    whoTitle: "ऐसे लोग जिनके पास भरोसा करने वाला समुदाय है",
    who1Title: "कंटेंट क्रिएटर और शिक्षा-ब्लॉगर",
    who1Desc:
      "अगर आप भाषा, सीखने या शिक्षा के बारे में लिखते, फ़िल्माते या साझा करते हैं, तो आपके दर्शक पहले से आपकी सिफ़ारिशों पर भरोसा करते हैं।",
    who2Title: "शिक्षक, थेरेपिस्ट और शिक्षाविद",
    who2Desc:
      "अगर आप छात्रों या माता-पिता के साथ काम करते हैं, तो शैक्षिक टूल पर आपकी सिफ़ारिश पेशेवर विश्वास की जगह से आती है।",
    who3Title: "समुदाय में सक्रिय माता-पिता",
    who3Desc:
      "पैरेंट ग्रुप, क्लास चैट, मेलिंग सूचियाँ: हर जगह जहाँ माता-पिता एक दूसरे को बच्चों के लिए काम करने वाले टूल बताते हैं।",

    howEyebrow: "कैसे काम करता है",
    howTitle: "3 चरण, कोई तकनीकी ज्ञान नहीं चाहिए",
    how1Title: "प्रोग्राम में रजिस्टर करें",
    how1Desc:
      "एक छोटा फ़ॉर्म भरें। एक मिनट में स्वतः मंज़ूरी, निजी लिंक और डैशबोर्ड एक्सेस मिलेगा।",
    how2Title: "लिंक साझा करें",
    how2Desc:
      "पैरेंट WhatsApp, सूची को ईमेल, Instagram स्टोरीज़, ब्लॉग, आमने-सामने। जहाँ आपके दर्शक हैं।",
    how3Title: "रिवॉर्ड जो आपके साथ बढ़ता है",
    how3Desc:
      "हर ग्राहक जो आपके लिंक से साइन अप करता है, 12 महीने तक 30% आजीवन कमीशन। 10 सक्रिय ग्राहक लाते ही आप Active Partner बन जाते हैं, 13वें महीने से, सभी ग्राहकों पर अतिरिक्त 10% आजीवन कमीशन अनलॉक।",
    midCta1: "अभी शुरू करें। एक मिनट लगता है।",

    getEyebrow: "आपको क्या मिलता है",
    getTitle: "हम आपको अकेला नहीं छोड़ते",
    getSubtitle:
      "अगर आपने पहले कभी कुछ नहीं बेचा, चिंता न करें। सब तैयार है।",
    get1Title: "आपके लिए निजी लिंक",
    get1Desc:
      "एक छोटा, अनोखा लिंक जिसे आप कहीं भी साझा कर सकते हैं। कोई क्लिक करके 60 दिन बाद भी लौटे, तो वह साइनअप आपका।",
    get2Title: "साझा करने के लिए तैयार टेक्स्ट",
    get2Desc:
      "WhatsApp और Facebook पोस्ट, माता-पिता के लिए ईमेल, Instagram स्टोरी आइडिया। कॉपी करें, साझा करें।",
    get3Title: "व्यवस्थित निजी डैशबोर्ड",
    get3Desc:
      "रियल-टाइम में देखें: कितने लोगों ने लिंक क्लिक किया, कितने रजिस्टर हुए, कितने अपग्रेड हुए, कितना मिल रहा है। पूरी पारदर्शिता।",
    get4Title: "व्यक्तिगत समर्थन",
    get4Desc:
      "प्रोग्राम के बारे में सवाल? लिंक में दिक़्क़त? पूछने की जगह है। एक कार्य-दिवस के अंदर जवाब मिलेगा।",

    earnEyebrow: "आप कितना कमा सकते हैं",
    earnTitle: "स्लाइडर हिलाएँ और देखें",
    earnSubtitle:
      "रक़म आपके दर्शकों और जो आप साझा करते हैं उस पर निर्भर करती है। यह कैसे जुड़ता है, यह दिखाते हैं। हम रक़म की गारंटी नहीं देते, सिर्फ़ अंदाज़ा देते हैं।",
    calcSubsLabel: "सक्रिय Deep सब्सक्राइबर/महीना",
    calcMonthly: "मासिक कमाई",
    calcYearly: "12 महीनों में",
    calcUnitSuffix: "लोग",
    tableHeaderSubs: "सब्सक्राइबर",
    tableHeaderMonthly: "मासिक कमाई",
    tableHeaderYearly: "12 महीनों में",
    earnNote:
      "गणना Deep प्लान ($4.99/महीना) और पहले साल के 30% कमीशन पर आधारित है। 13वें महीने से, Active Partners उन्हीं ग्राहकों से अतिरिक्त 10% आजीवन कमाते हैं। कमीशन 30-दिन की होल्ड अवधि के बाद और $50 की सीमा पर भुगतान होता है (न्यूनतम भुगतान, अधिकतम नहीं)।",
    midCta2: "शुरू करने को तैयार? अपना लिंक पाएँ",

    trustEyebrow: "क्यों भरोसा करें",
    trustTitle: "एक संस्थापक का प्रोग्राम, शुरुआती समय में",
    founderHeading: "Gadit क्यों बनाया?",
    founderBody:
      "मेरा मिशन हमेशा एक रहा है: लोगों को चीज़ें पूरी तरह समझने में मदद करना। जब आप सच में समझते हैं, तो आप लागू कर सकते हैं। जब आप लागू कर सकते हैं, तो आप अपनी मनचाही चीज़ें हासिल कर सकते हैं।\n\nसालों से मैंने ऐसे होशियार, प्रतिभाशाली लोग देखे जो कुछ समझना चाहते थे और नहीं समझ पाते थे। उन्होंने सोचा कि वे \"इसके लिए नहीं बने\"। पर समस्या उनकी नहीं थी। समस्या उनके रास्ते में एक शब्द की थी।\n\nइसी रुकावट को हटाने के लिए मैंने Gadit बनाया। यह कोई और शब्दकोश नहीं है। यह सिर्फ़ अनुवाद नहीं है। यह एक ऐसा टूल है जो हर शब्द को पूरी तरह समझाता है। सरलता से, उदाहरणों के साथ, संदर्भ में और एक तस्वीर के साथ जो शब्द को ज़िंदा करती है। हम इसे शब्द को GAD करना कहते हैं।\n\nपार्टनर प्रोग्राम अब उन लोगों के लिए खुला है जो इस विचार से जुड़ते हैं और इसे और आगे फैलाना चाहते हैं। अगर आप ऐसे हैं, तो हमें आपको शामिल करने में ख़ुशी होगी।",
    founderSign: "गादी बेन लावी, Gadit के संस्थापक",
    stat1Num: "13",
    stat1Label: "समर्थित इंटरफ़ेस भाषाएँ",
    stat2Num: "30%",
    stat2Label: "12 महीने आजीवन कमीशन",
    stat3Num: "60",
    stat3Label: "दिन, लिंक कुकी अवधि",

    faqEyebrow: "अक्सर पूछे जाने वाले प्रश्न",
    faqTitle: "जानना चाहेंगे",
    faq1Q: "क्या मार्केटिंग प्रोफ़ेशनल होना ज़रूरी है?",
    faq1A:
      "नहीं। हमारे अधिकांश पार्टनर माता-पिता, शिक्षक और ब्लॉगर हैं जिन्होंने पहले कुछ नहीं बेचा। अपना लिंक उन लोगों के साथ साझा करना काफ़ी है जिन्हें Gadit से फ़ायदा हो सकता है।",
    faq2Q: "क्या WhatsApp या Facebook ग्रुप में साझा कर सकते हैं?",
    faq2A:
      "हाँ, और यह हमारे दर्शकों के लिए सबसे अच्छे चैनलों में से एक है। माता-पिता अपने ग्रुप में पूछते हैं कि कौन से टूल काम के हैं। वहाँ आपकी सिफ़ारिश का सबसे ज़्यादा असर है।",
    faq3Q: "कब भुगतान मिलेगा?",
    faq3A:
      "हर महीने के अंत में, $50 की सीमा तक पहुँचने पर भुगतान होगा। $50 न्यूनतम भुगतान है, अधिकतम नहीं। इससे अधिक कमाना ठीक है, सीमा पार होते ही असली भुगतान मिलेगा।",
    faq4Q: "ग्राहक रद्द कर दे तो क्या होगा?",
    faq4A:
      "आप ग्राहक के असल भुगतान के महीनों पर ही कमीशन कमाते हैं। 4 महीनों के बाद रद्द किया, 4 महीनों का रिवॉर्ड। दोनों के लिए न्यायसंगत।",
    faq5Q: "क्या ग्राहक संख्या की सीमा है?",
    faq5A:
      "नहीं। आप दुनिया में कहीं से, Gadit की 13 भाषाओं में से किसी में भी जितने चाहें ग्राहक ला सकते हैं।",
    faq6Q: "अगर ग्राहक तुरंत साइन अप नहीं करे, तो लिंक का क्या?",
    faq6A:
      "लिंक आपको 60 दिनों तक याद रखता है। कोई क्लिक करके 2 हफ़्ते सोचे, फिर लौटे और सब्सक्राइब करे, वह साइनअप आपका गिना जाएगा।",
    faq7Q: "सालाना सब्सक्रिप्शन का क्या?",
    faq7A:
      "सालाना प्लान पर, आप पहले भुगतान का 15% एक बार के रिवॉर्ड के रूप में पाते हैं (मासिक 30% × 12 महीनों की जगह)। सालाना छूट को देखते हुए, यह न्यायसंगत संतुलन है।",
    faq8Q: "क्या मार्केटिंग सामग्री तुरंत मिल सकती है?",
    faq8A:
      "हाँ। WhatsApp टेक्स्ट, माता-पिता के लिए ईमेल, Facebook पोस्ट, स्टोरी ड्राफ़्ट, सीधे कॉपी करने के लिए तैयार। अगर कुछ विशेष चाहिए, संपर्क करें, हम बना देंगे।",
    faq9Q: "क्या Google या Facebook पर पेड विज्ञापन चलाने की अनुमति है?",
    faq9A:
      "आपके दर्शकों के लिए ऑर्गेनिक पोस्ट: हाँ। पर आप विशेष रूप से \"Gadit\" शब्द को टार्गेट करने वाले Google या Facebook विज्ञापन नहीं ख़रीद सकते। हम नहीं चाहते कि आप मुख्य साइट के साथ उसी ट्रैफ़िक के लिए लड़ें। पूरे नियम डैशबोर्ड में हैं।",
    faq10Q: "क्या पार्टनर बनने के लिए पेड सब्सक्राइबर होना ज़रूरी है?",
    faq10A:
      "हाँ। पार्टनर प्रोग्राम सिर्फ़ Clear और Deep सब्सक्राइबरों के लिए खुला है। अच्छी सिफ़ारिश तभी होती है जब आप उत्पाद को जानते हैं। अगर अभी Basic पर हैं, तो प्राइसिंग स्क्रीन से Clear या Deep पर अपग्रेड करें। पूरा शब्दकोश और प्रोग्राम एक्सेस, दोनों मिलेंगे।",
    faq11Q: "Active Partner क्या है और कैसे बनते हैं?",
    faq11A:
      "जब आप 10 सक्रिय भुगतान करते ग्राहक लाते हैं, तब आप अपने आप Active Partner बन जाते हैं। यह स्थिति सभी ग्राहकों (मौजूदा भी, 13वें महीने से) पर अतिरिक्त 10% आजीवन कमीशन अनलॉक करती है। मतलब 2, 3, 5 साल बाद भी, अगर ग्राहक सब्सक्रिप्शन जारी रखें, तो आप कमाते रहेंगे।",

    finalTitle: "शुरू करने को तैयार?",
    finalSubtitle: "रजिस्टर करने में एक मिनट। स्वतः मंज़ूरी। लिंक तुरंत तैयार।",
    finalCta: "अपना निजी लिंक मुफ्त पाएँ",
    termsLink: "पार्टनर प्रोग्राम की शर्तें",
  },
};

const NAV_FALLBACKS: Record<Exclude<Lang, "he" | "en">, { navAffiliates: string; topbarSignIn: string }> = {
  ar: { navAffiliates: "الشركاء", topbarSignIn: "شريك بالفعل؟ تسجيل دخول" },
  ru: { navAffiliates: "Партнёры", topbarSignIn: "Уже партнёр? Войти" },
  es: { navAffiliates: "Afiliados", topbarSignIn: "¿Ya eres socio? Acceder" },
  pt: { navAffiliates: "Afiliados", topbarSignIn: "Já é parceiro? Acessar" },
  fr: { navAffiliates: "Affiliés", topbarSignIn: "Déjà partenaire ? Se connecter" },
  de: { navAffiliates: "Affiliates", topbarSignIn: "Schon Partner? Anmelden" },
  cs: { navAffiliates: "Partneři", topbarSignIn: "Už jste partner? Přihlášení" },
  sk: { navAffiliates: "Partneri", topbarSignIn: "Už ste partner? Prihlásenie" },
  it: { navAffiliates: "Affiliati", topbarSignIn: "Già partner? Accedi" },
  ja: { navAffiliates: "パートナー", topbarSignIn: "すでにパートナーですか？ ログイン" },
  hi: { navAffiliates: "पार्टनर", topbarSignIn: "पहले से पार्टनर हैं? साइन इन" },
};
// Note: the NAV_FALLBACKS spread loop that used to live here is gone.
// Every language in COPY now ships its own fully-translated entry, so
// blanket-overwriting them with COPY.en (with only the nav strings
// localised) would silently erase the rest of the translation. The
// NAV_FALLBACKS object is kept above as a record of the canonical nav
// strings each language ships with, in case the topbar ever wants to
// pull them independently of the rest of the page COPY.

const LANGS = [
  { code: "he", label: "עברית", flag: "il" },
  { code: "en", label: "English", flag: "gb" },
  { code: "ar", label: "العربية", flag: "sa" },
  { code: "ru", label: "Русский", flag: "ru" },
  { code: "es", label: "Español", flag: "es" },
  { code: "pt", label: "Português", flag: "pt" },
  { code: "fr", label: "Français", flag: "fr" },
  { code: "de", label: "Deutsch", flag: "de" },
  { code: "cs", label: "Čeština", flag: "cz" },
  { code: "sk", label: "Slovenčina", flag: "sk" },
  { code: "it", label: "Italiano", flag: "it" },
  { code: "ja", label: "日本語", flag: "jp" },
  { code: "hi", label: "हिन्दी", flag: "in" },
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
                <img className="wb-lang-flag" src={`https://flagcdn.com/40x30/${l.flag}.png`} srcSet={`https://flagcdn.com/80x60/${l.flag}.png 2x`} width="20" height="15" alt="" loading="lazy" />{l.label}
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
          {/* Share button only shown to signed-in users, non-members
              probably aren't going to share before they've tried the
              product themselves. */}
          {user && (
            <ShareButton
              url="https://www.gadit.app/"
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
          )}
          <LangSwitch />
          {user ? (
            <WbUserMenu />
          ) : (
            <>
              <StartFreeCTA />
              <button
                type="button"
                className="wb-shell-link"
                onClick={() => promptLogin({ mode: "signin" })}
              >
                {v2(lang, "signIn")}
              </button>
            </>
          )}
        </div>

        <div className="wb-shell-mobile-cta">
          <StartFreeCTA />
        </div>
        {/* Mobile identity cluster, Share + Avatar inline next to the
            wordmark. Mirrors Home + Word; 2026-06-19 redesign. */}
        {user && (
          <div className="wb-shell-mobile-identity">
            <ShareButton
              url="https://www.gadit.app/"
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
            <WbUserMenu />
          </div>
        )}
        <div className="wb-shell-mobile-menu-cluster">
        <LangSwitchMobile />
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
        </div>
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
          <Link
            href={href("/affiliate/dashboard")}
            className="wb-aff-cta-primary"
          >
            {c.heroCtaPrimary}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
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
            <Link
              href={href("/affiliate/dashboard")}
              className="wb-aff-cta-primary wb-aff-cta-primary-compact"
            >
              {c.midCta1}
            </Link>
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
            <Link
              href={href("/affiliate/dashboard")}
              className="wb-aff-cta-primary wb-aff-cta-primary-compact"
            >
              {c.midCta2}
            </Link>
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
              <div className="wb-aff-founder-body">
                {c.founderBody.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
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
          <Link
            href={href("/affiliate/dashboard")}
            className="wb-aff-cta-primary"
          >
            {c.finalCta}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </section>
      </main>

      <GadVerbStamp />

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
        <Link href={href("/privacy")}>{v2(lang, "footerPrivacy")}</Link>
        <span>·</span>
        <Link href={href("/terms")}>{v2(lang, "footerTerms")}</Link>
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

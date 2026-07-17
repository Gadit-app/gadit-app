"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { track } from "@/lib/track";

/**
 * Family-plan campaign landing page, v2 (2026-07-16).
 *
 * v1 was a lean single-column pitch; Gadi reviewed it against his
 * academy sales page and asked for a full direct-response build:
 * promise hero, live demo, ONE SECTION PER FEATURE each with its own
 * product visual, alternating color blocks, comparison table, value
 * stack, guarantee, shekel pricing for Hebrew visitors (real ILS
 * billing via Stripe currency_options), repeated CTAs.
 *
 * ?v=relief|anxiety|safe still swaps the hero angle so email/ad
 * variants share one page; the angle rides on every analytics event.
 *
 * Product visuals are CSS/JSX mockups of real product surfaces (no
 * fabricated screenshots, no fake testimonials): meanings card, kids
 * mode, context picker, notebook + quiz, profiles, games, English
 * helper. The hero embeds the real GaditDemoAnimation.
 */

const PRICE_FAMILY_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_YEARLY ?? "";
const PRICE_FAMILY_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_MONTHLY ?? "";
const PRICE_DEEP_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_MONTHLY ?? "";

type Angle = "vocab" | "relief" | "anxiety" | "safe";
const ANGLES: Angle[] = ["vocab", "relief", "anxiety", "safe"];

/* ────────────────────────── copy ────────────────────────── */

type FeatureCopy = { kicker: string; title: string; body: string };

type Copy = {
  heroBadge: string;
  whatIs: string;
  angles: Record<Angle, { h1: string; sub: string }>;
  heroCta: string;
  heroTrust: string;
  ownerCta: string;
  stats: string[];
  demoKicker: string;
  demoTitle: string;
  painKicker: string;
  painTitle: string;
  painBody1: string;
  painBody2: string;
  reframe: string;
  featuresKicker: string;
  features: FeatureCopy[];
  midCtaTitle: string;
  midCta: string;
  compareKicker: string;
  compareTitle: string;
  compareGadit: string;
  compareOther: string;
  compareRows: Array<{ label: string; gadit: boolean; other: boolean }>;
  safeTitle: string;
  safeBody: string;
  safeLine: string;
  stackTitle: string;
  stackItems: string[];
  priceKicker: string;
  priceTitle: string;
  trialBadge: string;
  yearly: string;
  yearlyNote: string;
  monthly: string;
  billedYearly: string;
  billedMonthly: string;
  priceCta: string;
  cancelNote: string;
  singleChild: string;
  guaranteeTitle: string;
  guaranteeBody: string;
  faqTitle: string;
  faq: Array<{ q: string; a: string }>;
  finalTitle: string;
  finalSub: string;
  finalCta: string;
  footerTerms: string;
  footerPrivacy: string;
};

const COPY: Record<"he" | "en", Copy> = {
  he: {
    heroBadge: "מילון חכם לילדים ולכל המשפחה",
    whatIs: "Gadit הוא מילון חכם לילדים: מקלידים כל מילה ומקבלים את המשמעות בגובה של ילד, עם תמונה ושלוש דוגמאות. כל מילה נשמרת במחברת האישית של הילד ובונה לו אוצר מילים.",
    angles: {
      vocab: {
        h1: "אוצר מילים גדול זה לא כישרון. זה הרגל.",
        sub: "כל מילה שהילד שואל עליה נכנסת למחברת המילים האישית שלו ב-Gadit: עם תמונה, הסבר בגובה של ילד, ותרגול קצר שמחזיר אותה עד שהיא שלו. פותחים את המחברת בסוף החודש ורואים את אוצר המילים גדל, מילה אחרי מילה.",
      },
      relief: {
        h1: "די להיות המילון הפרטי של הבית",
        sub: "מהיום, כשהילד שואל \"מה זה אומר?\", יש לו מקום אחד שבו הוא מוצא את התשובה לבד: כל המשמעויות, תמונה לכל משמעות, והסבר בגובה של ילד. בלי צ'אט פתוח ובלי פרסומות.",
      },
      anxiety: {
        h1: "ילד שמדלג על מילים, מאבד את הסיפור",
        sub: "מילה אחת לא מובנת מספיקה כדי לאבד את החוט בקריאה ובשיעורים. Gadit נותן לכל ילד דרך פשוטה לעצור, להבין באמת, ולחזור לספר בביטחון.",
      },
      safe: {
        h1: "המסך היחיד שנותנים לילד בלי לפחד",
        sub: "לא צ'אט פתוח. לא פיד אינסופי. לא פרסומות. מקום אחד נקי שבו ילד מקליד מילה, מבין אותה עד הסוף, וחוזר לשיעורים.",
      },
    },
    heroCta: "מתחילים 14 ימי ניסיון חינם",
    heroTrust: "בלי צ'אט פתוח · בלי פרסומות · ביטול בלחיצה אחת",
    ownerCta: "לאזור המשפחה שלכם",
    stats: ["14 שפות ממשק", "תמונה לכל משמעות", "עד 5 ילדים", "ביטול בלחיצה אחת"],
    demoKicker: "התוצאה",
    demoTitle: "הילד לומד לפתור מילים לבד, ואתם נהנים מהשקט",
    painKicker: "מכירים את זה?",
    painTitle: "רגע שכל הורה מכיר",
    painBody1: "שמונה בערב. שיעורי בית. \"אבא, מה זה נחוש?\" שתי דקות אחר כך: \"מה זה להסס?\" ובפעם השלישית הילד כבר מבקש את הטלפון \"רק לבדוק מילה\", ונעלם בתוך טיקטוק.",
    painBody2: "הבעיה היא לא הסקרנות של הילד.",
    reframe: "הבעיה היא שאין לו מקום בטוח לקבל בו תשובה לבד. עד עכשיו.",
    featuresKicker: "מה יש בפנים",
    features: [
      {
        kicker: "כל המשמעויות",
        title: "מילה אחת. כל הפירושים. תמונה לכל אחד.",
        body: "מילון רגיל נותן הגדרה אחת יבשה. Gadit מציג את כל המשמעויות של המילה, עם שלוש דוגמאות אמיתיות ותמונה לכל משמעות, כי מוח של ילד זוכר תמונות הרבה יותר טוב ממילים.",
      },
      {
        kicker: "מצב ילדים",
        title: "הסבר בגובה העיניים של הילד",
        body: "מתג אחד, וכל ההסברים עוברים לשפה שילד בן 8 באמת מבין. בלי מילים קשות שמסבירות מילים קשות, בלי הגדרות מעגליות. פשוט להבין.",
      },
      {
        kicker: "הבנת הקשר",
        title: "מדביקים משפט, מקבלים את הפירוש הנכון",
        body: "לרוב המילים יש יותר מפירוש אחד, ושם ילדים הולכים לאיבוד. מדביקים את המשפט מהספר או מדף העבודה, ו-Gadit מסמן בדיוק איזו משמעות מתאימה להקשר הזה.",
      },
      {
        kicker: "מחברת אישית",
        title: "המילים לא בורחות",
        body: "כל מילה שהילד חיפש נשמרת במחברת האישית שלו, ותרגול קצר וחכם מחזיר אותה בדיוק כשהיא עומדת להישכח. ככה אוצר מילים באמת נבנה, מילה אחרי מילה.",
      },
      {
        kicker: "פרופיל לכל ילד",
        title: "בת ה-7 ובן ה-14 לא צריכים את אותו הסבר",
        body: "לכל ילד במשפחה פרופיל משלו: המחברת שלו, התרגול שלו, והרמה שלו. ההסברים, הדוגמאות והמשחקים מותאמים לגיל, ואף אחד לא דורך לאף אחד על המילים.",
      },
      {
        kicker: "משחקי מילים",
        title: "לומדים גם כשמשחקים",
        body: "חידונים ומשחקי מילים שבנויים על המילים שהילד עצמו חיפש. חמש דקות של משחק במקום עוד חצי שעה של מסך ריק, ואוצר המילים גדל בלי שמרגישים.",
      },
      {
        kicker: "אנגלית",
        title: "העוזר הכי טוב לשיעורי אנגלית",
        body: "הילד מקליד מילה באנגלית ומקבל הסבר פשוט בעברית, עם תמונה ודוגמאות. בלי לנדוד בין מילון, גוגל טרנסלייט ויוטיוב. שיעורי אנגלית מפסיקים להיות מלחמה.",
      },
    ],
    midCtaTitle: "כל זה, במנוי משפחתי אחד",
    midCta: "מתחילים 14 ימי ניסיון חינם",
    compareKicker: "ההבדל",
    compareTitle: "למה לא פשוט לחפש בגוגל או לשאול צ'אט?",
    compareGadit: "Gadit",
    compareOther: "האינטרנט הפתוח",
    compareRows: [
      { label: "עמוד אחד נקי לכל מילה", gadit: true, other: false },
      { label: "הסבר בגובה של ילד", gadit: true, other: false },
      { label: "תמונה לכל משמעות", gadit: true, other: false },
      { label: "מחברת ותרגול שנשארים", gadit: true, other: false },
      { label: "פרסומות וקישורים לכל כיוון", gadit: false, other: true },
      { label: "צ'אט פתוח בלי גבולות", gadit: false, other: true },
    ],
    safeTitle: "בנוי כך שאפשר להשאיר אותם לבד איתו",
    safeBody: "אין צ'אט פתוח ואין שיחה חופשית. אין פרסומות ואין קישורים החוצה. אין פיד, אין המלצות, אין חורי ארנב. עמוד אחד נקי לכל מילה, וזהו.",
    safeLine: "ילד נכנס, מבין את המילה, וחוזר למה שהוא עשה.",
    stackTitle: "מה מקבלים במסלול המשפחתי",
    stackItems: [
      "חיפושים בלי הגבלה לכל המשפחה",
      "כל המשמעויות, עם תמונה לכל משמעות",
      "מצב ילדים לכל הגילאים",
      "בדיקת משפטים עם משוב מיידי",
      "מחברת אישית ותרגול חכם לכל ילד",
      "משחקי מילים וחידונים",
      "עד 5 ילדים בפרופילים נפרדים",
      "14 שפות, כולל עברית מלאה ואנגלית",
    ],
    priceKicker: "התמחור",
    priceTitle: "מסלול המשפחה",
    trialBadge: "14 ימי ניסיון חינם",
    yearly: "₪199 לשנה",
    yearlyNote: "יוצא פחות מ-17 ₪ לחודש, לכל המשפחה",
    monthly: "₪19.90 לחודש",
    billedYearly: "שנתי",
    billedMonthly: "חודשי",
    priceCta: "מתחילים את הניסיון",
    cancelNote: "החיוב בשקלים, רק בתום 14 הימים. מבטלים בלחיצה אחת מדף החשבון, מתי שרוצים.",
    singleChild: "יש בבית תלמיד אחד? מסלול Deep ב-₪16.90 לחודש",
    guaranteeTitle: "מבחן שיעורי הבית",
    guaranteeBody: "מתחילים הערב ובודקים את זה על שיעורי הבית האמיתיים, שבועיים שלמים, בחינם. אם לא ראיתם את הילד מחפש מילים לבד, מבטלים בלחיצה אחת ולא שילמתם שקל.",
    faqTitle: "שאלות של הורים",
    faq: [
      {
        q: "למה לא פשוט לשאול צ'אט או גוגל?",
        a: "כי אלה כלים למבוגרים. חיפוש בגוגל מחזיר פרסומות וקישורים לכל כיוון, וצ'אט פתוח הוא שיחה בלי גבולות שאף הורה לא משאיר בה ילד לבד. Gadit בנוי הפוך: עמוד אחד סגור ונקי לכל מילה, בגובה של ילד, בלי שום דרך ללכת לאיבוד.",
      },
      {
        q: "לאילו גילאים זה מתאים?",
        a: "הלב של Gadit הוא ילדים בגיל בית ספר, מכיתה א ועד תיכון. מצב ילדים מסביר לקטנים, וההסברים המלאים משרתים גם בני נוער והורים. את החשבון פותח ההורה.",
      },
      {
        q: "המחיר באמת בשקלים?",
        a: "כן. החיוב בשקלים, בכרטיס ישראלי רגיל, בלי עמלות המרה ובלי הפתעות: ₪199 לשנה או ₪19.90 לחודש, אחרי 14 ימי הניסיון.",
      },
      {
        q: "זה עוזר גם באנגלית?",
        a: "מאוד. אפשר לחפש מילה באנגלית ולקבל הסבר בעברית פשוטה, עם תמונה ודוגמאות. בשביל שיעורי אנגלית זה בדיוק הכלי שחסר בבית. ובסך הכל Gadit עובד ב-14 שפות.",
      },
      {
        q: "כמה ילדים אפשר לחבר?",
        a: "עד 5 ילדים במנוי משפחתי אחד, לכל ילד פרופיל, מחברת ותרגול משלו.",
      },
      {
        q: "אפשר לנסות בלי להתחייב?",
        a: "כן. מתחילים 14 ימי ניסיון עם כרטיס, אבל החיוב הראשון יורד רק בתום הניסיון. מבטלים בכל רגע קודם, בלחיצה אחת, ולא תחויבו בכלום.",
      },
    ],
    finalTitle: "נסו את זה הערב, בשיעורי הבית הבאים",
    finalSub: "שבועיים חינם. ביטול בלחיצה. והילד לומד לפתור מילים לבד.",
    finalCta: "מתחילים 14 ימי ניסיון חינם",
    footerTerms: "תנאים",
    footerPrivacy: "פרטיות",
  },
  en: {
    heroBadge: "A smart dictionary for kids and the whole family",
    whatIs: "Gadit is a smart dictionary for kids: type any word and get its meaning at a child's level, with a picture and three examples. Every word is saved to your child's personal notebook and builds their vocabulary.",
    angles: {
      vocab: {
        h1: "A big vocabulary is not a talent. It is a habit.",
        sub: "Every word your child asks about lands in their personal word notebook in Gadit: with a picture, a kid-level explanation, and short practice that brings it back until it is theirs. Open the notebook at the end of the month and watch the vocabulary grow, word by word.",
      },
      relief: {
        h1: "Stop being the family dictionary",
        sub: "From today, when your kid asks \"what does this mean?\", they have one place to find the answer alone: every meaning, a picture for each one, and an explanation at kid level. No open chat, no ads.",
      },
      anxiety: {
        h1: "A kid who skips words loses the story",
        sub: "One misunderstood word is enough to lose the thread in reading and homework. Gadit gives every child a simple way to stop, truly understand, and get back to the book with confidence.",
      },
      safe: {
        h1: "The one screen you can hand a child without worry",
        sub: "No open chat. No endless feed. No ads. One clean place where a kid types a word, understands it fully, and goes back to homework.",
      },
    },
    heroCta: "Start your 14-day free trial",
    heroTrust: "No open chat · No ads · Cancel in one click",
    ownerCta: "Go to your family space",
    stats: ["14 languages", "A picture per meaning", "Up to 5 kids", "Cancel in one click"],
    demoKicker: "The result",
    demoTitle: "Your kid learns to solve words alone, and you get the quiet",
    painKicker: "Sound familiar?",
    painTitle: "A moment every parent knows",
    painBody1: "8 PM. Homework. \"Dad, what does reluctant mean?\" Two minutes later: \"What's hesitate?\" And the third time, they ask for your phone \"just to check a word\" and vanish into TikTok.",
    painBody2: "The problem is not your kid's curiosity.",
    reframe: "The problem is that they have no safe place to get the answer alone. Until now.",
    featuresKicker: "What's inside",
    features: [
      {
        kicker: "Every meaning",
        title: "One word. Every meaning. A picture for each.",
        body: "A regular dictionary gives one dry definition. Gadit shows every meaning of the word, with three real examples and a picture per meaning, because a child's brain remembers images far better than words.",
      },
      {
        kicker: "Kids Mode",
        title: "Explanations at your child's eye level",
        body: "One switch, and every explanation turns into language an 8-year-old actually understands. No hard words explaining hard words, no circular definitions. Just understanding.",
      },
      {
        kicker: "Context",
        title: "Paste a sentence, get the right meaning",
        body: "Most words have more than one meaning, and that is where kids get lost. Paste the sentence from the book or worksheet, and Gadit marks exactly which meaning fits.",
      },
      {
        kicker: "Personal notebook",
        title: "The words don't run away",
        body: "Every word your child looks up lands in their personal notebook, and short smart practice brings it back right before it slips away. That is how vocabulary is really built, one word at a time.",
      },
      {
        kicker: "A profile per child",
        title: "Your 7-year-old and your 14-year-old need different explanations",
        body: "Each child gets their own profile: their notebook, their practice, their level. Explanations, examples and games match the age, and nobody steps on anybody's words.",
      },
      {
        kicker: "Word games",
        title: "Learning that feels like playing",
        body: "Quizzes and word games built from the words your child actually looked up. Five minutes of play instead of another half hour of blank screen, and the vocabulary grows without anyone noticing.",
      },
      {
        kicker: "Second language",
        title: "The best homework helper for a second language",
        body: "Your child types a word in English and gets a simple explanation in their own language, with a picture and examples. No wandering between a dictionary, a translator and YouTube.",
      },
    ],
    midCtaTitle: "All of it, on one family plan",
    midCta: "Start your 14-day free trial",
    compareKicker: "The difference",
    compareTitle: "Why not just Google it or ask a chatbot?",
    compareGadit: "Gadit",
    compareOther: "The open internet",
    compareRows: [
      { label: "One clean page per word", gadit: true, other: false },
      { label: "Explanations at kid level", gadit: true, other: false },
      { label: "A picture for every meaning", gadit: true, other: false },
      { label: "A notebook and practice that stick", gadit: true, other: false },
      { label: "Ads and links in every direction", gadit: false, other: true },
      { label: "Open-ended chat with no bounds", gadit: false, other: true },
    ],
    safeTitle: "Built so you can leave them alone with it",
    safeBody: "No open chat and no free-form conversation. No ads and no outbound links. No feed, no recommendations, no rabbit holes. One clean page per word, and that is it.",
    safeLine: "A kid comes in, understands the word, and goes back to what they were doing.",
    stackTitle: "What the Family plan includes",
    stackItems: [
      "Unlimited searches for the whole family",
      "Every meaning, with a picture for each",
      "Kids Mode for every age",
      "Sentence checking with instant feedback",
      "A personal notebook and smart practice per child",
      "Word games and quizzes",
      "Up to 5 kids with separate profiles",
      "14 languages with full support",
    ],
    priceKicker: "Pricing",
    priceTitle: "The Family plan",
    trialBadge: "14-day free trial",
    yearly: "$59 / year",
    yearlyNote: "that is $4.92 a month, for the whole family",
    monthly: "$5.99 / month",
    billedYearly: "Yearly",
    billedMonthly: "Monthly",
    priceCta: "Start the trial",
    cancelNote: "First charge only after the 14 days. Cancel anytime from your account page, one click.",
    singleChild: "Just one student at home? Deep is $4.99/month",
    guaranteeTitle: "The homework test",
    guaranteeBody: "Start tonight and test it on real homework, two full weeks, free. If you did not watch your kid look up words on their own, cancel in one click and you paid nothing.",
    faqTitle: "Questions parents ask",
    faq: [
      {
        q: "Why not just ask a chatbot or Google?",
        a: "Because those are tools for adults. Google returns ads and links in every direction, and an open chatbot is a boundless conversation no parent leaves a child alone in. Gadit is built the other way around: one closed, clean page per word, at kid level, with no way to get lost.",
      },
      {
        q: "What ages is it for?",
        a: "The heart of Gadit is school-age kids, from first grade through high school. Kids Mode explains for the young ones, and the full explanations serve teens and parents too. The parent opens the account.",
      },
      {
        q: "Does it help with a second language?",
        a: "Very much. A child can look up a word in English and get a simple explanation in their own language, with a picture and examples. Gadit works in 14 languages.",
      },
      {
        q: "How many kids can I add?",
        a: "Up to 5 kids on one Family plan, each with their own profile, notebook and practice.",
      },
      {
        q: "Can we try it without committing?",
        a: "Yes. The trial starts with a card, but the first charge happens only when the 14 days end. Cancel anytime before that, one click, and you pay nothing.",
      },
    ],
    finalTitle: "Try it tonight, on the next homework",
    finalSub: "Two weeks free. One-click cancel. And a kid who solves words alone.",
    finalCta: "Start your 14-day free trial",
    footerTerms: "Terms",
    footerPrivacy: "Privacy",
  },
};

/* ─────────────────── product mockups (per feature) ─────────────────── */

function MockMeanings({ he }: { he: boolean }) {
  const word = he ? "עלה" : "bat";
  const m1 = he
    ? { t: "צמח: החלק הירוק של העץ", ex: "\"עלה אדום נפל מהעץ בסתיו.\"" }
    : { t: "The animal that flies at night", ex: "\"A bat flew out of the cave.\"" };
  const m2 = he
    ? { t: "פועל: טיפס למעלה, התרומם", ex: "\"המחיר עלה בחודש האחרון.\"" }
    : { t: "The stick used in baseball", ex: "\"She swung the bat and hit the ball.\"" };
  return (
    <div className="fam-mock">
      <div className="fam-mock-search">
        <SearchIcon /> <span>{word}</span>
      </div>
      {[m1, m2].map((m, i) => (
        <div key={i} className="fam-mock-meaning">
          <div className={`fam-mock-thumb fam-mock-thumb-${i}`}>
            {i === 0 ? <LeafIcon /> : <ArrowUpIcon />}
          </div>
          <div>
            <div className="fam-mock-meaning-t">{i + 1}. {m.t}</div>
            <div className="fam-mock-meaning-ex">{m.ex}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MockKids({ he }: { he: boolean }) {
  return (
    <div className="fam-mock">
      <div className="fam-mock-toggle">
        <span className="fam-mock-toggle-pill">{he ? "מצב ילדים" : "Kids Mode"}</span>
        <span className="fam-mock-toggle-on" />
      </div>
      <div className="fam-mock-bubble">
        {he
          ? "\"נחוש\" זה כשמחליטים משהו חזק חזק בלב, וממשיכים גם כשקשה. כמו כשאתם מתאמנים על אופניים ולא מוותרים עד שמצליחים."
          : "\"Reluctant\" is when you don't really want to do something, and your feet go slow. Like walking to the dentist."}
      </div>
      <Image
        src="/gad-it-character.png"
        alt=""
        width={72}
        height={72}
        className="fam-mock-char"
      />
    </div>
  );
}

function MockContext({ he }: { he: boolean }) {
  return (
    <div className="fam-mock">
      <div className="fam-mock-sentence">
        {he ? (
          <>הוא קשר <mark>קשר</mark> חזק בחבל</>
        ) : (
          <>The <mark>bank</mark> of the river was steep</>
        )}
      </div>
      <div className="fam-mock-arrow">↓</div>
      <div className="fam-mock-picked">
        <CheckIcon color="#0EA5A5" />
        <span>
          {he ? "המשמעות כאן: לולאה שמהדקת חבל" : "The meaning here: the side of a river"}
        </span>
      </div>
    </div>
  );
}

function MockNotebook({ he }: { he: boolean }) {
  const words = he ? ["נחוש", "להסס", "מרהיב"] : ["reluctant", "hesitate", "vivid"];
  return (
    <div className="fam-mock">
      <div className="fam-mock-nb-title">{he ? "המחברת של נועה" : "Noa's notebook"}</div>
      {words.map((w, i) => (
        <div key={i} className="fam-mock-nb-row">
          <CheckIcon color={i < 2 ? "#0EA5A5" : "#d1d5db"} />
          <span>{w}</span>
          {i === 2 && <span className="fam-mock-nb-due">{he ? "לתרגול היום" : "practice today"}</span>}
        </div>
      ))}
      <div className="fam-mock-quiz">
        <div className="fam-mock-quiz-q">{he ? "מה פירוש \"נחוש\"?" : "What does \"vivid\" mean?"}</div>
        <div className="fam-mock-quiz-opt is-right">{he ? "החלטי, שלא מוותר" : "Bright and lifelike"}</div>
        <div className="fam-mock-quiz-opt">{he ? "עצוב מאוד" : "Very quiet"}</div>
      </div>
    </div>
  );
}

function MockProfiles({ he }: { he: boolean }) {
  const kids = he
    ? [
        { n: "נועה", g: "כיתה ב׳", c: "#0EA5A5" },
        { n: "עידו", g: "כיתה ו׳", c: "#7C3AED" },
        { n: "מאיה", g: "כיתה ט׳", c: "#D97706" },
      ]
    : [
        { n: "Noa", g: "2nd grade", c: "#0EA5A5" },
        { n: "Ido", g: "6th grade", c: "#7C3AED" },
        { n: "Maya", g: "9th grade", c: "#D97706" },
      ];
  return (
    <div className="fam-mock fam-mock-profiles">
      {kids.map((k) => (
        <div key={k.n} className="fam-mock-profile">
          <div className="fam-mock-avatar" style={{ background: k.c }}>
            {k.n[0]}
          </div>
          <div className="fam-mock-profile-n">{k.n}</div>
          <div className="fam-mock-profile-g">{k.g}</div>
        </div>
      ))}
    </div>
  );
}

function MockGames({ he }: { he: boolean }) {
  return (
    <div className="fam-mock fam-mock-games">
      <div className="fam-mock-game" style={{ background: "rgba(14,165,165,0.1)" }}>
        <PuzzleIcon />
        <span>{he ? "תאומות במלכודת" : "Twin Trap"}</span>
      </div>
      <div className="fam-mock-game" style={{ background: "rgba(124,58,237,0.1)" }}>
        <ClockIcon />
        <span>{he ? "מסע בזמן" : "Time Traveler"}</span>
      </div>
      <div className="fam-mock-score">{he ? "רצף של 6 ימים 🔥" : "6-day streak 🔥"}</div>
    </div>
  );
}

function MockEnglish({ he }: { he: boolean }) {
  return (
    <div className="fam-mock">
      <div className="fam-mock-search">
        <SearchIcon /> <span>reluctant</span>
      </div>
      <div className="fam-mock-meaning">
        <div className="fam-mock-thumb fam-mock-thumb-1">
          <PersonIcon />
        </div>
        <div>
          <div className="fam-mock-meaning-t">{he ? "מהסס, לא ממש רוצה" : "Not really wanting to"}</div>
          <div className="fam-mock-meaning-ex">
            {he ? "\"הוא ניגש לשיעורים בחוסר רצון.\"" : "\"He was reluctant to start his homework.\""}
          </div>
        </div>
      </div>
    </div>
  );
}

/** A faithful mockup of the real Gadit word screen inside a phone
 *  shell. Gadi's feedback (2026-07-17): the page showed warm family
 *  scenes but never the PRODUCT as an app on a device. This is the
 *  actual UI (teal search pill, big word title, part-of-speech chip,
 *  a meaning card with its picture, Kids Mode toggle, example) so a
 *  parent sees exactly what they are buying. */
function PhoneMock({ he }: { he: boolean }) {
  const word = he ? "חלום" : "dream";
  const pos = he ? "שם עצם" : "noun";
  const meaning = he
    ? "תמונות ומחשבות שעוברות בראש בזמן השינה"
    : "images and thoughts that pass through the mind during sleep";
  const example = he
    ? "\"בלילה חלמתי חלום על מסע רחוק.\""
    : "\"Last night I had a dream about a far journey.\"";
  const kids = he ? "מצב ילדים" : "Kids Mode";
  const searchHint = he ? "הקלידו מילה" : "Type a word";
  return (
    <div className="fam-phone" aria-hidden>
      <div className="fam-phone-notch" />
      <div className="fam-phone-screen">
        <div className="fam-ph-top">
          <span className="fam-ph-brand">Gad<span className="fam-ph-it">it</span></span>
          <span className="fam-ph-kids">
            <span className="fam-ph-kids-label">{kids}</span>
            <span className="fam-ph-toggle" />
          </span>
        </div>
        <div className="fam-ph-search">
          <SearchIcon />
          <span className="fam-ph-word-typed">{word}</span>
          <span className="fam-ph-hint">{searchHint}</span>
        </div>
        <div className="fam-ph-title-row">
          <span className="fam-ph-title">{word}</span>
          <span className="fam-ph-pos">{pos}</span>
        </div>
        <div className="fam-ph-card">
          <div className="fam-ph-pic">
            <MoonIcon />
            <span className="fam-ph-star fam-ph-star-1" />
            <span className="fam-ph-star fam-ph-star-2" />
            <span className="fam-ph-star fam-ph-star-3" />
          </div>
          <div className="fam-ph-meaning-row">
            <span className="fam-ph-num">1</span>
            <div>
              <div className="fam-ph-def">{meaning}</div>
              <div className="fam-ph-ex">{example}</div>
            </div>
          </div>
        </div>
        <div className="fam-ph-tabs">
          <span className="is-active">{he ? "משמעויות" : "Meanings"}</span>
          <span>{he ? "תמונה" : "Picture"}</span>
          <span>{he ? "מחברת" : "Notebook"}</span>
        </div>
      </div>
    </div>
  );
}

const MOCKUPS = [MockMeanings, MockKids, MockContext, MockNotebook, MockProfiles, MockGames, MockEnglish];

// Real illustrations (GPT, 2026-07-17, teal paper-cutout style, in
// /public/fam as compressed WebP). One per feature; the 7th (English
// homework) has no clean illustration yet (every generation leaked
// text), so it falls back to the CSS mockup. Alt text is intentionally
// empty: these are decorative, the copy carries the meaning.
const FEATURE_IMG: Array<string | null> = [
  "meanings",
  "kids-mode",
  "context",
  "notebook",
  "profiles",
  "games",
  "english",
];

/* ────────────────────────── page ────────────────────────── */

export default function FamiliesLandingClient() {
  const params = useSearchParams();
  const { user, familyId, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const he = lang === "he";
  const c = he ? COPY.he : COPY.en;

  // Default angle: vocab (Gadi 2026-07-17 + council: the master promise
  // is visible vocabulary growth; the pain angles stay as variants).
  const rawAngle = params.get("v");
  const angle: Angle = ANGLES.includes(rawAngle as Angle) ? (rawAngle as Angle) : "vocab";
  const hero = c.angles[angle];

  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");
  const isOwner = !!user && familyId === user.uid;

  const viewedRef = useRef(false);
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    track("families_lp_view", { angle, lang });
  }, [angle, lang]);

  function startTrial(source: string) {
    track("families_lp_cta", { angle, billing, source });
    if (isOwner) {
      window.location.href = href("/family");
      return;
    }
    const priceId = billing === "yearly" ? PRICE_FAMILY_YEARLY : PRICE_FAMILY_MONTHLY;
    if (!priceId) {
      console.error("Missing Stripe priceId");
      window.alert("Pricing is misconfigured. Please contact support.");
      return;
    }
    promptLogin({
      mode: "signup",
      onSuccess: () => {
        window.location.href = `${href("/checkout")}?price=${encodeURIComponent(priceId)}`;
      },
    });
  }

  function startDeep() {
    track("families_lp_cta", { angle, billing: "deep_monthly", source: "single_child" });
    if (!PRICE_DEEP_MONTHLY) return;
    promptLogin({
      mode: "signup",
      onSuccess: () => {
        window.location.href = `${href("/checkout")}?price=${encodeURIComponent(PRICE_DEEP_MONTHLY)}`;
      },
    });
  }

  const ctaLabel = isOwner ? c.ownerCta : c.heroCta;

  return (
    <div dir={dir} className="fam-page">
      <style>{FAM_CSS}</style>

      <header className="fam-header">
        <Link href={href("/")} className="fam-wordmark">
          Gad<span className="fam-wordmark-it">it</span>
        </Link>
        <span className="fam-header-tagline">{c.heroBadge}</span>
        <button type="button" className="fam-header-cta" onClick={() => startTrial("header")}>
          {isOwner ? c.ownerCta : c.trialBadge}
        </button>
      </header>

      <main>
        {/* 1 · Hero — for a COLD visitor: category first (badge),
             then the promise (h1), then a plain what-it-is line, then
             the product itself on a phone so it is instantly clear
             this is a word app, not an abstract idea. */}
        <section className="fam-hero">
          <div className="fam-hero-grid">
            <div className="fam-hero-text">
              <div className="fam-badge fam-badge-mobile">{c.heroBadge}</div>
              <h1 className="fam-h1">
                {hero.h1.split(". ").map((line, i, arr) => (
                  <span key={i} className="fam-h1-line">
                    {line}
                    {i < arr.length - 1 ? "." : ""}
                  </span>
                ))}
              </h1>
              <p className="fam-whatis">{c.whatIs}</p>
              <button type="button" className="fam-cta" onClick={() => startTrial("hero")}>
                {ctaLabel}
              </button>
              <div className="fam-trust">{c.heroTrust}</div>
            </div>
            <div className="fam-hero-visual">
              <PhoneMock he={he} />
            </div>
          </div>
          <div className="fam-stats">
            {c.stats.map((s, i) => (
              <div key={i} className="fam-stat">{s}</div>
            ))}
          </div>
        </section>

        {/* 2 · The calm payoff (warm illustration) */}
        <section className="fam-band fam-band-white">
          <div className="fam-section fam-center">
            <div className="fam-kicker">{c.demoKicker}</div>
            <h2 className="fam-h2">{c.demoTitle}</h2>
            <div className="fam-inline-img">
              <Image src="/fam/hero.webp" alt="" width={1200} height={800} sizes="(max-width: 760px) 92vw, 620px" />
            </div>
          </div>
        </section>

        {/* 3 · Pain + reframe */}
        <section className="fam-band fam-band-ink">
          <div className="fam-section">
            <div className="fam-kicker fam-kicker-light">{c.painKicker}</div>
            <h2 className="fam-h2">{c.painTitle}</h2>
            <div className="fam-inline-img">
              <Image src="/fam/pain.webp" alt="" width={1200} height={900} sizes="(max-width: 760px) 92vw, 620px" />
            </div>
            <p className="fam-body">{c.painBody1}</p>
            <p className="fam-body fam-body-strong">{c.painBody2}</p>
            <p className="fam-reframe">{c.reframe}</p>
          </div>
        </section>

        {/* 4 · Features — one section per feature, alternating */}
        {c.features.map((f, i) => {
          const Mock = MOCKUPS[i];
          const flip = i % 2 === 1;
          return (
            <section key={i} className={`fam-band ${i % 2 === 0 ? "fam-band-cream" : "fam-band-white"}`}>
              <div className={`fam-feature ${flip ? "is-flipped" : ""}`}>
                <div className="fam-feature-text">
                  <div className="fam-kicker">{f.kicker}</div>
                  <h2 className="fam-h2 fam-h2-start">{f.title}</h2>
                  <p className="fam-body">{f.body}</p>
                </div>
                <div className="fam-feature-visual">
                  {FEATURE_IMG[i] ? (
                    <Image
                      src={`/fam/${FEATURE_IMG[i]}.webp`}
                      alt=""
                      width={1200}
                      height={900}
                      className="fam-feature-illus"
                      sizes="(max-width: 760px) 92vw, 440px"
                    />
                  ) : (
                    <Mock he={he} />
                  )}
                </div>
              </div>
            </section>
          );
        })}

        {/* 5 · Mid CTA */}
        <section className="fam-band fam-band-teal">
          <div className="fam-section fam-center">
            <h2 className="fam-h2 fam-h2-onteal">{c.midCtaTitle}</h2>
            <button type="button" className="fam-cta fam-cta-inverse" onClick={() => startTrial("mid")}>
              {isOwner ? c.ownerCta : c.midCta}
            </button>
          </div>
        </section>

        {/* 6 · Comparison */}
        <section className="fam-band fam-band-white">
          <div className="fam-section">
            <div className="fam-kicker">{c.compareKicker}</div>
            <h2 className="fam-h2">{c.compareTitle}</h2>
            <div className="fam-compare">
              <div className="fam-compare-head">
                <span />
                <span className="fam-compare-brand">{c.compareGadit}</span>
                <span>{c.compareOther}</span>
              </div>
              {c.compareRows.map((r, i) => (
                <div key={i} className="fam-compare-row">
                  <span>{r.label}</span>
                  <span>{r.gadit ? <CheckIcon color="#0EA5A5" /> : <XIcon />}</span>
                  <span>{r.other ? <CheckIcon color="#b91c1c" /> : <XIcon />}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7 · Safety */}
        <section className="fam-band fam-band-purple">
          <div className="fam-section fam-center">
            <ShieldBigIcon />
            <h2 className="fam-h2">{c.safeTitle}</h2>
            <div className="fam-inline-img">
              <Image src="/fam/safe.webp" alt="" width={1200} height={900} sizes="(max-width: 760px) 92vw, 560px" />
            </div>
            <p className="fam-body fam-body-center">{c.safeBody}</p>
            <p className="fam-safe-line">{c.safeLine}</p>
          </div>
        </section>

        {/* 8 · Value stack */}
        <section className="fam-band fam-band-cream">
          <div className="fam-section">
            <h2 className="fam-h2">{c.stackTitle}</h2>
            <ul className="fam-list fam-stack">
              {c.stackItems.map((item, i) => (
                <li key={i}>
                  <CheckIcon color="#0EA5A5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 9 · Pricing */}
        <section className="fam-band fam-band-white" id="fam-pricing">
          <div className="fam-section">
            <div className="fam-kicker">{c.priceKicker}</div>
            <div className="fam-price-card">
              <div className="fam-price-badge">{c.trialBadge}</div>
              <h2 className="fam-price-title">{c.priceTitle}</h2>

              <div className="fam-billing-toggle" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={billing === "yearly"}
                  className={billing === "yearly" ? "is-active" : ""}
                  onClick={() => setBilling("yearly")}
                >
                  {c.billedYearly}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={billing === "monthly"}
                  className={billing === "monthly" ? "is-active" : ""}
                  onClick={() => setBilling("monthly")}
                >
                  {c.billedMonthly}
                </button>
              </div>

              <div className="fam-price-amount">{billing === "yearly" ? c.yearly : c.monthly}</div>
              {billing === "yearly" && <div className="fam-price-note">{c.yearlyNote}</div>}

              <button type="button" className="fam-cta fam-cta-wide" onClick={() => startTrial("pricing")}>
                {isOwner ? c.ownerCta : c.priceCta}
              </button>
              <p className="fam-cancel-note">{c.cancelNote}</p>
            </div>

            {!isOwner && (
              <button type="button" className="fam-single-link" onClick={startDeep}>
                {c.singleChild}
              </button>
            )}

            {/* Guarantee */}
            <div className="fam-guarantee">
              <ShieldIcon />
              <div>
                <div className="fam-guarantee-t">{c.guaranteeTitle}</div>
                <div className="fam-guarantee-b">{c.guaranteeBody}</div>
              </div>
            </div>
          </div>
        </section>

        {/* 10 · FAQ */}
        <section className="fam-band fam-band-cream">
          <div className="fam-section">
            <h2 className="fam-h2">{c.faqTitle}</h2>
            <div className="fam-faq">
              {c.faq.map((f, i) => (
                <details key={i} className="fam-faq-item">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 11 · Final CTA */}
        <section className="fam-band fam-band-teal">
          <div className="fam-section fam-center fam-final">
            <div className="fam-final-img">
              <Image src="/fam/routine.webp" alt="" width={1200} height={800} sizes="(max-width: 760px) 92vw, 560px" />
            </div>
            <h2 className="fam-h2 fam-h2-onteal">{c.finalTitle}</h2>
            <p className="fam-final-sub">{c.finalSub}</p>
            <button type="button" className="fam-cta fam-cta-inverse" onClick={() => startTrial("final")}>
              {isOwner ? c.ownerCta : c.finalCta}
            </button>
          </div>
        </section>
      </main>

      <footer className="fam-footer">
        <span>© Gadit {new Date().getFullYear()}</span>
        <Link href={href("/terms")}>{c.footerTerms}</Link>
        <Link href={href("/privacy")}>{c.footerPrivacy}</Link>
      </footer>
    </div>
  );
}

/* ────────────────────────── icons ────────────────────────── */

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.4" strokeLinecap="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function ShieldBigIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ margin: "0 auto 10px", display: "block" }}>
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4-4" />
    </svg>
  );
}
function LeafIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0b7d7d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 21c0-9 4-15 14-17-1 10-6 15-14 17z" />
      <path d="M6 21c3-6 7-10 11-12" />
    </svg>
  );
}
function ArrowUpIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0b7d7d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}
function PuzzleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0b7d7d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="#fff" aria-hidden style={{ opacity: 0.95 }}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

/* ────────────────────────── styles ────────────────────────── */

const FAM_CSS = `
.fam-page {
  min-height: 100dvh;
  background: #f6f4ee;
  color: #1f2937;
  display: flex;
  flex-direction: column;
}
.fam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 22px;
  max-width: 1040px;
  width: 100%;
  margin: 0 auto;
}
.fam-wordmark {
  font-weight: 800;
  font-size: 22px;
  color: #1f2937;
  text-decoration: none;
  letter-spacing: -0.02em;
}
.fam-wordmark-it { color: #0EA5A5; font-style: italic; }
.fam-header-cta {
  border: 1.5px solid #0EA5A5;
  background: transparent;
  color: #0b7d7d;
  font-weight: 700;
  font-size: 13.5px;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
}
.fam-header-tagline { display: none; }
@media (min-width: 880px) {
  .fam-header-tagline {
    display: inline-block;
    font-weight: 700;
    font-size: 13.5px;
    color: #0b7d7d;
    background: rgba(14,165,165,0.09);
    border: 1px solid rgba(14,165,165,0.22);
    border-radius: 999px;
    padding: 6px 16px;
  }
}
.fam-hero {
  padding: 26px 20px 30px;
  max-width: 1000px;
  margin: 0 auto;
}
.fam-hero-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 26px;
  align-items: center;
  text-align: center;
}
.fam-hero-visual { display: flex; justify-content: center; }
@media (min-width: 880px) {
  .fam-hero-grid {
    grid-template-columns: 1.05fr 0.95fr;
    gap: 44px;
    text-align: start;
  }
  .fam-hero-text { order: 1; }
  .fam-hero-visual { order: 2; }
  .fam-badge-mobile { display: none; }
  .fam-hero-text .fam-cta { align-self: start; }
}
.fam-badge {
  display: inline-block;
  background: rgba(14,165,165,0.1);
  color: #0b7d7d;
  border: 1px solid rgba(14,165,165,0.25);
  font-weight: 700;
  font-size: 13px;
  padding: 5px 14px;
  border-radius: 999px;
  margin-bottom: 18px;
}
.fam-h1 {
  font-size: clamp(30px, 5.6vw, 46px);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -0.02em;
  margin: 0 0 14px;
}
.fam-h1-line { display: block; }
.fam-whatis {
  font-size: clamp(14.5px, 2.1vw, 16.5px);
  line-height: 1.6;
  color: #4b5563;
  font-weight: 400;
  margin: 0 0 20px;
  max-width: 520px;
}
.fam-hero-text .fam-whatis { margin-inline: auto; }
@media (min-width: 880px) {
  .fam-hero-text .fam-whatis { margin-inline: 0; }
}
.fam-sub {
  font-size: clamp(15px, 2.3vw, 17px);
  line-height: 1.65;
  color: #6b7280;
  margin: 0 auto 24px;
  max-width: 620px;
}
.fam-cta {
  background: #0EA5A5;
  color: #fff;
  border: none;
  font-weight: 800;
  font-size: 17px;
  padding: 16px 32px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(14,165,165,0.35);
  transition: transform 160ms ease-out;
}
.fam-cta:active { transform: scale(0.97); }
.fam-cta-wide { width: 100%; }
.fam-cta-inverse {
  background: #fff;
  color: #0b7d7d;
  box-shadow: 0 6px 18px rgba(0,0,0,0.18);
}
.fam-trust { margin-top: 14px; font-size: 13.5px; color: #6b7280; }
.fam-hero-img {
  margin: 28px auto 0;
  max-width: 680px;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(31,41,55,0.14);
  line-height: 0;
}
.fam-hero-img img { width: 100%; height: auto; display: block; }
.fam-inline-img {
  margin: 4px auto 20px;
  max-width: 560px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 14px 36px rgba(31,41,55,0.12);
  line-height: 0;
}
.fam-inline-img img { width: 100%; height: auto; display: block; }
.fam-feature-illus {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 18px;
  box-shadow: 0 14px 34px rgba(31,41,55,0.12);
}
.fam-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 26px;
}
.fam-stat {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.08);
  border-radius: 999px;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 13.5px;
  color: #374151;
}
.fam-band { padding: 44px 0; }
.fam-band-cream { background: #f6f4ee; }
.fam-band-white { background: #ffffff; }
.fam-band-teal { background: #0EA5A5; }
.fam-band-purple { background: rgba(124,58,237,0.07); }
.fam-band-ink { background: #fdf6ec; }
.fam-section { max-width: 760px; margin: 0 auto; padding: 0 20px; }
.fam-center { text-align: center; }
.fam-kicker {
  text-align: center;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0b7d7d;
  margin-bottom: 8px;
}
.fam-kicker-light { color: #b45309; }
.fam-h2 {
  font-size: clamp(24px, 4.4vw, 32px);
  font-weight: 800;
  letter-spacing: -0.01em;
  margin: 0 0 16px;
  text-align: center;
}
.fam-h2-start { text-align: start; }
.fam-h2-onteal { color: #fff; }
.fam-body { font-size: 16.5px; line-height: 1.7; color: #374151; margin: 0 0 12px; }
.fam-body-strong { font-weight: 700; color: #1f2937; }
.fam-body-center { text-align: center; max-width: 560px; margin-inline: auto; }
.fam-reframe {
  font-size: clamp(19px, 3vw, 23px);
  font-weight: 800;
  color: #0b7d7d;
  text-align: center;
  margin: 22px 0 0;
}
/* Phone-frame product mockup */
.fam-phone-wrap { display: flex; justify-content: center; margin-top: 8px; }
.fam-phone {
  width: 300px;
  max-width: 84vw;
  background: #1f2937;
  border-radius: 40px;
  padding: 12px;
  box-shadow: 0 26px 60px rgba(31,41,55,0.32);
  position: relative;
  direction: rtl;
}
.fam-phone-notch {
  position: absolute;
  top: 12px; left: 50%;
  transform: translateX(-50%);
  width: 120px; height: 24px;
  background: #1f2937;
  border-radius: 0 0 16px 16px;
  z-index: 2;
}
.fam-phone-screen {
  background: #f6f4ee;
  border-radius: 30px;
  padding: 34px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.fam-ph-top { display: flex; align-items: center; justify-content: space-between; }
.fam-ph-brand { font-weight: 800; font-size: 17px; color: #1f2937; letter-spacing: -0.02em; }
.fam-ph-it { color: #0EA5A5; font-style: italic; }
.fam-ph-kids { display: flex; align-items: center; gap: 6px; }
.fam-ph-kids-label { font-size: 11px; font-weight: 700; color: #0b7d7d; }
.fam-ph-toggle {
  width: 30px; height: 18px;
  background: #0EA5A5;
  border-radius: 999px;
  position: relative;
}
.fam-ph-toggle::after {
  content: ""; position: absolute; top: 2.5px; inset-inline-end: 2.5px;
  width: 13px; height: 13px; background: #fff; border-radius: 50%;
}
.fam-ph-search {
  display: flex; align-items: center; gap: 8px;
  background: #fff;
  border: 1.5px solid rgba(14,165,165,0.4);
  border-radius: 999px;
  padding: 10px 14px;
}
.fam-ph-word-typed { font-weight: 700; font-size: 15px; color: #1f2937; }
.fam-ph-hint { margin-inline-start: auto; font-size: 12px; color: #b8bcc4; }
.fam-ph-title-row { display: flex; align-items: baseline; gap: 10px; padding-top: 2px; }
.fam-ph-title { font-size: 30px; font-weight: 800; color: #1f2937; letter-spacing: -0.02em; }
.fam-ph-pos {
  font-size: 11.5px; font-weight: 700; color: #7C3AED;
  background: rgba(124,58,237,0.1); border-radius: 999px; padding: 3px 10px;
}
.fam-ph-card {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.08);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(31,41,55,0.06);
}
.fam-ph-pic {
  height: 92px;
  background: linear-gradient(140deg, #1e3a8a, #4c1d95);
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.fam-ph-star {
  position: absolute; width: 4px; height: 4px; background: #fff; border-radius: 50%; opacity: 0.9;
}
.fam-ph-star-1 { top: 20px; inset-inline-start: 40px; }
.fam-ph-star-2 { top: 54px; inset-inline-end: 44px; width: 3px; height: 3px; }
.fam-ph-star-3 { top: 30px; inset-inline-end: 70px; width: 5px; height: 5px; }
.fam-ph-meaning-row { display: flex; gap: 10px; padding: 12px 14px; }
.fam-ph-num {
  width: 22px; height: 22px; flex-shrink: 0;
  background: rgba(14,165,165,0.12); color: #0b7d7d;
  border-radius: 50%; font-weight: 800; font-size: 12px;
  display: flex; align-items: center; justify-content: center;
}
.fam-ph-def { font-size: 13.5px; font-weight: 600; color: #1f2937; line-height: 1.45; }
.fam-ph-ex { font-size: 12px; color: #6b7280; margin-top: 4px; line-height: 1.4; }
.fam-ph-tabs { display: flex; gap: 8px; justify-content: center; padding-top: 2px; }
.fam-ph-tabs span {
  font-size: 11.5px; font-weight: 700; color: #9ca3af;
  padding: 5px 12px; border-radius: 999px;
}
.fam-ph-tabs span.is-active { background: #0EA5A5; color: #fff; }
.fam-final-img {
  margin: 0 auto 22px;
  max-width: 560px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0,0,0,0.22);
  line-height: 0;
}
.fam-final-img img { width: 100%; height: auto; display: block; }
.fam-feature {
  max-width: 940px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  align-items: center;
}
.fam-feature.is-flipped .fam-feature-text { order: 2; }
.fam-feature.is-flipped .fam-feature-visual { order: 1; }
.fam-feature-text .fam-kicker { text-align: start; }
@media (max-width: 760px) {
  .fam-feature { grid-template-columns: 1fr; gap: 20px; }
  .fam-feature.is-flipped .fam-feature-text { order: 1; }
  .fam-feature.is-flipped .fam-feature-visual { order: 2; }
}
.fam-mock {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.1);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 12px 32px rgba(31,41,55,0.09);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}
.fam-mock-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 9px 14px;
  font-weight: 700;
  font-size: 15px;
}
.fam-mock-meaning { display: flex; gap: 12px; align-items: flex-start; }
.fam-mock-thumb {
  width: 46px; height: 46px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.fam-mock-thumb-0 { background: linear-gradient(135deg, rgba(14,165,165,0.18), rgba(14,165,165,0.06)); }
.fam-mock-thumb-1 { background: linear-gradient(135deg, rgba(124,58,237,0.16), rgba(124,58,237,0.05)); }
.fam-mock-meaning-t { font-weight: 700; font-size: 14.5px; }
.fam-mock-meaning-ex { color: #6b7280; font-size: 13px; margin-top: 2px; }
.fam-mock-toggle { display: flex; align-items: center; gap: 10px; }
.fam-mock-toggle-pill {
  background: rgba(14,165,165,0.12);
  color: #0b7d7d;
  font-weight: 800;
  font-size: 13px;
  border-radius: 999px;
  padding: 5px 12px;
}
.fam-mock-toggle-on {
  width: 38px; height: 22px;
  background: #0EA5A5;
  border-radius: 999px;
  position: relative;
}
.fam-mock-toggle-on::after {
  content: "";
  position: absolute;
  top: 3px; inset-inline-end: 3px;
  width: 16px; height: 16px;
  background: #fff;
  border-radius: 50%;
}
.fam-mock-bubble {
  background: #f0fdfa;
  border: 1px solid rgba(14,165,165,0.25);
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.65;
}
.fam-mock-char { position: absolute; bottom: -14px; inset-inline-end: -10px; }
.fam-mock-sentence {
  font-size: 15.5px;
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px 14px;
  line-height: 1.6;
}
.fam-mock-sentence mark {
  background: rgba(14,165,165,0.2);
  border-radius: 5px;
  padding: 1px 5px;
  font-weight: 800;
}
.fam-mock-arrow { text-align: center; color: #0EA5A5; font-weight: 800; }
.fam-mock-picked {
  display: flex; gap: 8px; align-items: center;
  font-weight: 700; font-size: 14px;
  background: rgba(14,165,165,0.08);
  border-radius: 12px;
  padding: 10px 12px;
}
.fam-mock-nb-title { font-weight: 800; font-size: 14.5px; }
.fam-mock-nb-row { display: flex; align-items: center; gap: 8px; font-size: 14.5px; }
.fam-mock-nb-due {
  margin-inline-start: auto;
  background: rgba(217,119,6,0.12);
  color: #b45309;
  font-weight: 700;
  font-size: 11.5px;
  border-radius: 999px;
  padding: 3px 9px;
}
.fam-mock-quiz {
  border-top: 1px dashed rgba(31,41,55,0.15);
  padding-top: 12px;
  display: flex; flex-direction: column; gap: 7px;
}
.fam-mock-quiz-q { font-weight: 700; font-size: 13.5px; }
.fam-mock-quiz-opt {
  border: 1.5px solid rgba(31,41,55,0.12);
  border-radius: 10px;
  padding: 7px 11px;
  font-size: 13px;
}
.fam-mock-quiz-opt.is-right { border-color: #0EA5A5; background: rgba(14,165,165,0.07); font-weight: 700; }
.fam-mock-profiles { flex-direction: row; justify-content: space-around; }
.fam-mock-profile { text-align: center; }
.fam-mock-avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  color: #fff;
  font-weight: 800;
  font-size: 20px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 6px;
}
.fam-mock-profile-n { font-weight: 700; font-size: 14px; }
.fam-mock-profile-g { color: #6b7280; font-size: 12px; }
.fam-mock-games { flex-direction: row; flex-wrap: wrap; }
.fam-mock-game {
  flex: 1;
  min-width: 120px;
  border-radius: 14px;
  padding: 16px 12px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  font-weight: 700; font-size: 13.5px;
}
.fam-mock-score {
  width: 100%;
  text-align: center;
  font-weight: 700;
  font-size: 13px;
  color: #b45309;
}
.fam-compare {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.1);
  border-radius: 18px;
  overflow: hidden;
  max-width: 560px;
  margin: 0 auto;
  box-shadow: 0 10px 28px rgba(31,41,55,0.07);
}
.fam-compare-head, .fam-compare-row {
  display: grid;
  grid-template-columns: 1fr 84px 84px;
  align-items: center;
  padding: 11px 16px;
  font-size: 14px;
}
.fam-compare-head {
  background: #f9fafb;
  font-weight: 800;
  font-size: 13px;
}
.fam-compare-head span:nth-child(2), .fam-compare-head span:nth-child(3),
.fam-compare-row span:nth-child(2), .fam-compare-row span:nth-child(3) {
  text-align: center;
  display: flex; justify-content: center;
}
.fam-compare-brand { color: #0b7d7d; }
.fam-compare-row { border-top: 1px solid rgba(31,41,55,0.06); }
.fam-safe-line {
  text-align: center;
  font-weight: 800;
  color: #7C3AED;
  margin: 16px 0 0;
  font-size: 16px;
}
.fam-list {
  list-style: none;
  padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 12px;
  max-width: 520px;
  margin-inline: auto;
}
.fam-list li { display: flex; gap: 10px; align-items: flex-start; font-size: 15.5px; line-height: 1.55; }
.fam-stack {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.08);
  border-radius: 18px;
  padding: 22px 24px;
}
.fam-price-card {
  background: #fff;
  border: 2px solid #0EA5A5;
  border-radius: 22px;
  padding: 26px 24px;
  max-width: 460px;
  margin: 0 auto;
  text-align: center;
  box-shadow: 0 14px 40px rgba(14,165,165,0.12);
}
.fam-price-badge {
  display: inline-block;
  background: #0EA5A5;
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  padding: 5px 14px;
  border-radius: 999px;
  margin-bottom: 10px;
}
.fam-price-title { font-size: 24px; font-weight: 800; margin: 0 0 14px; }
.fam-billing-toggle {
  display: inline-flex;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 4px;
  margin-bottom: 14px;
}
.fam-billing-toggle button {
  border: none;
  background: transparent;
  font-weight: 700;
  font-size: 13.5px;
  color: #6b7280;
  padding: 7px 16px;
  border-radius: 999px;
  cursor: pointer;
}
.fam-billing-toggle button.is-active { background: #fff; color: #0b7d7d; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
.fam-price-amount { font-size: 36px; font-weight: 800; direction: ltr; }
.fam-price-note { color: #0b7d7d; font-weight: 700; font-size: 14.5px; margin-top: 2px; margin-bottom: 16px; }
.fam-cancel-note { color: #6b7280; font-size: 12.5px; margin: 12px 0 0; line-height: 1.55; }
.fam-single-link {
  display: block;
  margin: 18px auto 0;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
}
.fam-guarantee {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: rgba(124,58,237,0.06);
  border: 1px solid rgba(124,58,237,0.2);
  border-radius: 18px;
  padding: 18px 20px;
  max-width: 560px;
  margin: 26px auto 0;
}
.fam-guarantee-t { font-weight: 800; font-size: 16px; margin-bottom: 4px; }
.fam-guarantee-b { color: #4b5563; font-size: 14.5px; line-height: 1.65; }
.fam-faq { display: flex; flex-direction: column; gap: 10px; }
.fam-faq-item {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.08);
  border-radius: 14px;
  padding: 14px 18px;
}
.fam-faq-item summary { font-weight: 700; font-size: 15.5px; cursor: pointer; list-style: none; }
.fam-faq-item summary::-webkit-details-marker { display: none; }
.fam-faq-item p { margin: 10px 0 0; color: #4b5563; font-size: 14.5px; line-height: 1.65; }
.fam-final { padding: 10px 20px; }
.fam-final-sub { color: rgba(255,255,255,0.9); font-size: 16px; margin: 0 0 20px; }
.fam-footer {
  display: flex;
  gap: 18px;
  justify-content: center;
  padding: 22px;
  color: #9ca3af;
  font-size: 13px;
  border-top: 1px solid rgba(31,41,55,0.06);
}
.fam-footer a { color: #9ca3af; text-decoration: none; }
`;

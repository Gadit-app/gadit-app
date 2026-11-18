import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { translatedLegalLocales } from "@/components/legal/registry";
import { legalMetadata } from "@/lib/page-titles";

const BASE_METADATA: Metadata = {
  title: "Terms of Use, Gadit",
  description: "The rules for using Gadit, subscriptions, acceptable use, and disclaimers.",
};

/** Title and description in the visitor's UI language (Gadi 2026-11-17). */
export function generateMetadata(): Promise<Metadata> {
  return legalMetadata("terms", BASE_METADATA);
}

/** ISO day; LegalPage writes it in the document's language. */
const LAST_UPDATED = "2026-11-18";

const EnglishBody = () => (
  <>
    <p>
      Welcome to Gadit. These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of the Gadit website,
      applications, and services (together, the &ldquo;Service&rdquo;), operated by{" "}
      <strong>Lavi Learning and Training Technologies LLC</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
      By using the Service you agree to be bound by these Terms. If you do not agree, do not use the Service.
    </p>

    <h2>1. Who may use Gadit</h2>
    <p>
      {"You must be 18 or older to open a Gadit account. Children and teenagers under 18 use Gadit only through an adult: a parent or guardian can add them as profiles on the Family plan, and a school can give its students a class link. The parent, guardian or school that gives this access is responsible for it. By opening an account, you confirm that you are 18 or older."}
    </p>

    <h2>2. Your account</h2>
    <p>
      You are responsible for maintaining the confidentiality of your login credentials and for all activity that
      occurs under your account. Notify us promptly at{" "}
      <a href="mailto:support@gadit.app">support@gadit.app</a> if you believe your
      account has been compromised.
    </p>

    <h2>3. Subscriptions and billing</h2>
    <h3>Plans and fees</h3>
    <p>
      {"Gadit offers a free Basic plan and paid plans with the features and prices listed on the pricing page. Prices are stated in the currency shown on the pricing page and at checkout for your location (in Israel, new Israeli shekels including VAT) and may be changed with at least 30 days' notice for existing subscribers."}
    </p>
    <h3>Auto-renewal</h3>
    <p>
      Paid subscriptions automatically renew at the end of each billing period (monthly or yearly, as selected) at
      the then-current price, unless cancelled before the renewal date.
    </p>
    <h3>Cancellation</h3>
    <p>
      {"You may cancel at any time from your account page. Cancellation stops future renewals. You retain access to the paid features until the end of the current billing period. Apart from the refunds described below, we do not refund unused time, except where the law requires otherwise."}
    </p>
    <h3>Refunds</h3>
    <p>
      {"If you ask within 14 days of the first payment on your account, or within 14 days of a yearly renewal, we refund that payment in full. You do not need to give a reason. Write to "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" from your account's email address. A refund also ends the subscription. Other payments are non-refundable, except where the law requires a refund. If you believe you were charged in error, write to us within 30 days of the charge. Purchases made in the iOS app are billed by Apple, and only Apple can refund them, at reportaproblem.apple.com."}
    </p>

    <h2>4. Acceptable use</h2>
    <p>You agree not to:</p>
    <ul>
      <li>use the Service for any illegal purpose or in violation of any law;</li>
      <li>attempt to reverse-engineer, decompile, or extract the source code of the Service;</li>
      <li>abuse, harass, or harm other users, or submit content that is hateful, threatening, or obscene;</li>
      <li>automate access to the Service beyond reasonable personal use (for example, scraping definitions at scale);</li>
      <li>circumvent rate limits or plan restrictions, or use multiple accounts to avoid quotas;</li>
      <li>use the Service to train or fine-tune any competing AI model or dictionary product;</li>
      <li>upload or submit content that you do not have the right to submit.</li>
    </ul>
    <p>
      We reserve the right to suspend or terminate accounts that violate these Terms.
    </p>

    <h2>5. AI-generated content</h2>
    <p>
      {"Gadit uses artificial-intelligence models (including models from OpenAI and Google) to generate definitions, examples, etymologies, feedback, quizzes, images, speech, and transcriptions. You understand and agree that:"}
    </p>
    <ul>
      <li>
        AI output can be <strong>inaccurate, incomplete, or inappropriate</strong>. Gadit is intended as a learning
        aid and should not be relied upon for legal, medical, professional, or academic decisions.
      </li>
      <li>
        AI-generated definitions may differ from official dictionaries. We do not guarantee that every definition
        is linguistically authoritative.
      </li>
      <li>
        Images are generated algorithmically and may occasionally be unexpected or imprecise. They are illustrations,
        not literal depictions.
      </li>
      <li>
        You are solely responsible for how you interpret and use AI-generated content.
      </li>
    </ul>

    <h2>6. Your content</h2>
    <p>
      When you submit words, sentences, or audio to Gadit (for example when using &ldquo;Compose your own sentence&rdquo;
      or voice input), you grant us a worldwide, non-exclusive, royalty-free license to process that content for the
      purpose of delivering the Service and improving it. We do not claim ownership of your submissions.
    </p>

    <h2>7. Intellectual property</h2>
    <p>
      The Gadit name, logo, website, and underlying software are our property or the property of our licensors. You
      are granted a personal, revocable, non-exclusive license to use the Service as permitted by these Terms.
    </p>
    <p>
      Content generated by Gadit in response to your input (definitions, images, etc.) may be used by you for
      personal, educational, or non-commercial purposes. For commercial use (for example in a paid product), please
      contact us.
    </p>

    <h2>8. Availability and changes</h2>
    <p>
      We strive to keep the Service available but we do not guarantee uninterrupted or error-free operation. We may
      modify, suspend, or discontinue any part of the Service at any time, including features, pricing, or
      availability in specific regions.
    </p>

    <h2>9. Third-party services</h2>
    <p>
      The Service relies on third-party providers (including OpenAI, Google Firebase, Stripe, and Vercel). Their
      availability or behavior may affect your experience. Our liability is limited by Section 11 regardless of
      issues caused by these providers.
    </p>

    <h2>10. Disclaimer</h2>
    <p>
      THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo;, WITHOUT WARRANTIES OF ANY KIND,
      EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
      PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
    </p>

    <h2>11. Limitation of liability</h2>
    <p>
      TO THE MAXIMUM EXTENT PERMITTED BY LAW, LAVI LEARNING AND TRAINING TECHNOLOGIES LLC AND ITS OFFICERS,
      EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
      DAMAGES, OR FOR ANY LOSS OF PROFITS OR REVENUES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE
      SERVICE.
    </p>
    <p>
      OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE SERVICE SHALL NOT EXCEED THE GREATER OF
      (A) THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR (B) USD $100.
    </p>

    <h2>12. Termination</h2>
    <p>
      You may stop using the Service at any time. We may suspend or terminate your access if you violate these Terms
      or if required by law. Upon termination, the provisions that by their nature should survive (including
      Sections 7, 10, 11, and 14) will remain in effect.
    </p>

    <h2>13. Changes to these Terms</h2>
    <p>
      We may revise these Terms from time to time. Material changes will be posted on this page with a revised
      &ldquo;Last updated&rdquo; date. Your continued use of the Service after changes become effective constitutes
      acceptance of the updated Terms.
    </p>

    <h2>14. Governing law and disputes</h2>
    <p>
      These Terms are governed by the laws of the State of Delaware, United States, without regard to its
      conflict-of-law rules. Any dispute arising out of or relating to these Terms or the Service shall be resolved
      exclusively in the state or federal courts located in Delaware, United States, and you consent to the personal
      jurisdiction of those courts.
    </p>

    <h2>15. Contact</h2>
    <p>
      Lavi Learning and Training Technologies LLC<br />
      Email: <a href="mailto:support@gadit.app">support@gadit.app</a>
    </p>
  </>
);

const HebrewBody = () => (
  <>
    <p>
      ברוכים הבאים ל-Gadit. תנאי שימוש אלה (להלן &ldquo;התנאים&rdquo;) מסדירים את הגישה והשימוש שלכם באתר Gadit,
      באפליקציות ובשירותים (יחד, &ldquo;השירות&rdquo;), המופעלים על ידי{" "}
      <strong>Lavi Learning and Training Technologies LLC</strong> (להלן &ldquo;אנחנו&rdquo;, &ldquo;שלנו&rdquo;).
      השימוש בשירות מהווה את הסכמתכם לתנאים אלה. אם אינכם מסכימים, אל תשתמשו בשירות.
    </p>

    <h2>1. מי רשאי להשתמש ב-Gadit</h2>
    <p>
      {"כדי לפתוח חשבון ב-Gadit, גילכם צריך להיות 18 ומעלה. ילדים ובני נוער מתחת לגיל 18 משתמשים ב-Gadit רק דרך מבוגר: הורה או אפוטרופוס יכולים להוסיף אותם כפרופילים בתוכנית Family, ובית ספר יכול לתת לתלמידים שלו קישור כיתה. ההורה, האפוטרופוס או בית הספר שנותנים את הגישה הזאת אחראים לה. בפתיחת חשבון אתם מאשרים שגילכם 18 ומעלה."}
    </p>

    <h2>2. החשבון שלכם</h2>
    <p>
      אתם אחראים לשמור על סודיות פרטי ההתחברות שלכם ולכל פעילות שתתבצע תחת חשבונכם. הודיעו לנו מיד לכתובת{" "}
      <a href="mailto:support@gadit.app">support@gadit.app</a> אם אתם סבורים שהחשבון
      שלכם נפרץ.
    </p>

    <h2>3. מנויים וחיוב</h2>
    <h3>תוכניות ותעריפים</h3>
    <p>
      {"Gadit מציע תוכנית Basic חינמית ותוכניות בתשלום, עם הפיצ'רים והמחירים המפורטים בדף התמחור. המחירים נקובים במטבע המוצג בדף התמחור ובעמוד התשלום לפי המיקום שלכם (בישראל, בשקלים חדשים כולל מע״מ) ועשויים להשתנות בהודעה של לפחות 30 ימים מראש למנויים קיימים."}
    </p>
    <h3>חידוש אוטומטי</h3>
    <p>
      מנויים בתשלום מתחדשים אוטומטית בסוף כל תקופת חיוב (חודשית או שנתית, כפי שנבחרה) במחיר העדכני, אלא אם בוטלו
      לפני מועד החידוש.
    </p>
    <h3>ביטול</h3>
    <p>
      {"אתם יכולים לבטל בכל עת מדף החשבון. הביטול עוצר חידושים עתידיים. הגישה לפיצ'רים בתשלום נשמרת עד סוף תקופת החיוב הנוכחית. מלבד ההחזרים המתוארים בהמשך, איננו מחזירים כסף על זמן שלא נוצל, אלא אם החוק מחייב אחרת."}
    </p>
    <h3>החזרים</h3>
    <p>
      {"אם תבקשו תוך 14 יום מהתשלום הראשון בחשבון, או תוך 14 יום מחידוש שנתי, נחזיר לכם את התשלום הזה במלואו. אין צורך לנמק. כתבו ל-"}<a href="mailto:support@gadit.app">support@gadit.app</a>{" מכתובת הדוא״ל של החשבון. ההחזר מסיים גם את המנוי. שאר התשלומים אינם ניתנים להחזרה, למעט במקרים שבהם החוק מחייב החזר. אם אתם סבורים שחויבתם בטעות, כתבו לנו תוך 30 יום מהחיוב. רכישות באפליקציה ל-iOS מחויבות על ידי Apple, ורק Apple יכולה להחזיר אותן, בכתובת reportaproblem.apple.com."}
    </p>

    <h2>4. שימוש מותר</h2>
    <p>אתם מסכימים שלא:</p>
    <ul>
      <li>להשתמש בשירות למטרה בלתי חוקית או בניגוד לכל חוק;</li>
      <li>לנסות לבצע הנדסה לאחור, לפרק, או לחלץ את קוד המקור של השירות;</li>
      <li>להתעלל, להטריד, או לפגוע במשתמשים אחרים, או להגיש תוכן שונא, מאיים או מגונה;</li>
      <li>לבצע אוטומציה של הגישה לשירות מעבר לשימוש אישי סביר (למשל שאיבה המונית של הגדרות);</li>
      <li>לעקוף הגבלות קצב או הגבלות תוכנית, או להשתמש בחשבונות מרובים כדי לחמוק ממכסות;</li>
      <li>להשתמש בשירות כדי לאמן או לכוונן מודל AI או מוצר מילון מתחרה;</li>
      <li>להעלות או להגיש תוכן שאין לכם זכות להגיש.</li>
    </ul>
    <p>
      אנו שומרים לעצמנו את הזכות להשעות או לסגור חשבונות המפרים תנאים אלה.
    </p>

    <h2>5. תוכן שנוצר על ידי AI</h2>
    <p>
      {"Gadit משתמש במודלים של בינה מלאכותית (כולל מודלים של OpenAI ושל Google) כדי ליצור הגדרות, דוגמאות, אטימולוגיות, פידבק, חידונים, תמונות, הקראה קולית ותמלולים. אתם מבינים ומסכימים כי:"}
    </p>
    <ul>
      <li>
        פלט של AI עשוי להיות <strong>לא מדויק, חלקי, או לא הולם</strong>. Gadit נועד ככלי עזר ללמידה, ואין להסתמך
        עליו לצורך החלטות משפטיות, רפואיות, מקצועיות או אקדמיות.
      </li>
      <li>
        הגדרות שנוצרו על ידי AI עשויות להיות שונות ממילונים רשמיים. איננו מבטיחים שכל הגדרה מהימנה מבחינה לשונית.
      </li>
      <li>
        תמונות נוצרות באופן אלגוריתמי ולעיתים עשויות להיות לא צפויות או לא מדויקות. הן איורים, לא ייצוגים מילוליים.
      </li>
      <li>
        אתם נושאים באחריות הבלעדית לאופן שבו אתם מפרשים ומשתמשים בתוכן שנוצר על ידי AI.
      </li>
    </ul>

    <h2>6. התוכן שלכם</h2>
    <p>
      כאשר אתם מגישים מילים, משפטים או אודיו ל-Gadit (למשל בעת שימוש ב-&ldquo;חבר משפט משלך&rdquo; או בקלט קולי),
      אתם מעניקים לנו רישיון עולמי, לא-בלעדי ופטור מתמלוגים לעבד את התוכן הזה לצורך מתן השירות ושיפורו. איננו
      טוענים לבעלות על ההגשות שלכם.
    </p>

    <h2>7. קניין רוחני</h2>
    <p>
      השם Gadit, הלוגו, האתר והתוכנה הבסיסית הם רכושנו או רכוש מעניקי הרישיון שלנו. מוענק לכם רישיון אישי, הניתן
      לביטול, לא-בלעדי, להשתמש בשירות כפי שמתיר התנאים האלה.
    </p>
    <p>
      תוכן שנוצר על ידי Gadit בתגובה לקלט שלכם (הגדרות, תמונות וכו&rsquo;) עשוי לשמש אתכם למטרות אישיות, חינוכיות
      או לא-מסחריות. לשימוש מסחרי (למשל במוצר בתשלום), אנא צרו קשר.
    </p>

    <h2>8. זמינות ושינויים</h2>
    <p>
      אנחנו משתדלים לשמור על זמינות השירות, אך איננו מבטיחים פעולה רציפה או נטולת שגיאות. אנו רשאים לשנות, להשעות
      או להפסיק כל חלק מהשירות בכל עת, כולל פיצ&rsquo;רים, תמחור, או זמינות באזורים מסוימים.
    </p>

    <h2>9. שירותי צד שלישי</h2>
    <p>
      השירות מסתמך על ספקי צד שלישי (כולל OpenAI, Google Firebase, Stripe ו-Vercel). זמינותם או התנהגותם עשויים
      להשפיע על החוויה שלכם. האחריות שלנו מוגבלת על פי סעיף 11 ללא קשר לתקלות שנגרמו על ידי ספקים אלה.
    </p>

    <h2>10. הצהרת פטור</h2>
    <p>
      השירות ניתן &ldquo;כפי שהוא&rdquo; (&ldquo;AS IS&rdquo;) ו-&ldquo;כפי שהוא זמין&rdquo; (&ldquo;AS
      AVAILABLE&rdquo;), ללא אחריות מכל סוג שהוא, מפורשת או משתמעת, לרבות אחריות לסחירות, התאמה למטרה מסוימת, או
      אי-הפרה.
    </p>

    <h2>11. הגבלת אחריות</h2>
    <p>
      במידה המרבית המותרת בחוק, Lavi Learning and Training Technologies LLC ונושאי המשרה, העובדים והסוכנים שלה
      לא יהיו אחראים לכל נזק עקיף, מקרי, מיוחד, תוצאתי או עונשי, או לכל אובדן רווחים או הכנסות, הנובע או הקשור
      לשימוש שלכם בשירות.
    </p>
    <p>
      סך האחריות שלנו לכל תביעה הנובעת מהשירות או קשורה אליו לא יעלה על הסכום הגבוה מבין (א) הסכום ששילמתם לנו
      בשנים-עשר החודשים שקדמו לתביעה, או (ב) 100 דולר ארה&rdquo;ב.
    </p>

    <h2>12. סיום</h2>
    <p>
      אתם יכולים להפסיק להשתמש בשירות בכל עת. אנו רשאים להשעות או לסיים את הגישה שלכם אם הפרתם תנאים אלה או אם
      החוק דורש זאת. עם הסיום, הוראות שמטבען אמורות לשרוד (כולל סעיפים 7, 10, 11 ו-14) יישארו בתוקף.
    </p>

    <h2>13. שינויים בתנאים</h2>
    <p>
      אנחנו רשאים לעדכן את התנאים מעת לעת. שינויים מהותיים יפורסמו בדף זה עם תאריך &ldquo;עודכן לאחרונה&rdquo;
      מחודש. המשך השימוש בשירות לאחר כניסת השינויים לתוקף מהווה הסכמה לתנאים המעודכנים.
    </p>

    <h2>14. חוק החל וסמכות שיפוט</h2>
    <p>
      תנאים אלה כפופים לחוקי מדינת דלאוור, ארצות הברית, ללא התחשבות בכללי ברירת הדין שלה. כל מחלוקת הנובעת או
      הקשורה לתנאים אלה או לשירות תוכרע באופן בלעדי בבתי המשפט המדינתיים או הפדרליים הנמצאים בדלאוור, ארצות הברית,
      ואתם מסכימים לסמכות השיפוט האישית של בתי משפט אלה.
    </p>

    <h2>15. יצירת קשר</h2>
    <p>
      Lavi Learning and Training Technologies LLC<br />
      דוא&rdquo;ל: <a href="mailto:support@gadit.app">support@gadit.app</a>
    </p>
  </>
);

export default function TermsPage() {
  return (
    <LegalPage
      lastUpdated={LAST_UPDATED}
      locales={{
        en: { title: "Terms of Use", body: <EnglishBody /> },
        he: { title: "תנאי שימוש", body: <HebrewBody /> },
        ...translatedLegalLocales("terms"),
      }}
    />
  );
}

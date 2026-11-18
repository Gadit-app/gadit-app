import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { translatedLegalLocales } from "@/components/legal/registry";
import { legalMetadata } from "@/lib/page-titles";

const BASE_METADATA: Metadata = {
  title: "Privacy Policy, Gadit",
  description: "How Gadit collects, uses, and protects your information.",
};

/** Title and description in the visitor's UI language (Gadi 2026-11-17). */
export function generateMetadata(): Promise<Metadata> {
  return legalMetadata("privacy", BASE_METADATA);
}

/** ISO day; LegalPage writes it in the document's language. */
const LAST_UPDATED = "2026-11-18";

const EnglishBody = () => (
  <>
    <p>
      Gadit (&ldquo;Gadit&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is a service operated
      by <strong>Lavi Learning and Training Technologies LLC</strong>, a company registered in the United States.
      This Privacy Policy explains what information we collect, how we use it, and the choices you have.
    </p>
    <p>
      If you have any question, contact us at{" "}
      <a href="mailto:support@gadit.app">support@gadit.app</a>.
    </p>

    <h2>1. Information we collect</h2>
    <h3>Account information</h3>
    <p>
      When you create an account, we collect your email address and, if you sign in with Google, the basic profile
      information Google provides (display name, profile picture). We do not receive your Google password.
    </p>
    <p>
      {"In the iOS app you can also sign in with Apple. Apple then gives us the name and the email address you choose to share, which can be a private relay address that forwards our emails to you. We do not receive your Apple password."}
    </p>
    <h3>Usage information</h3>
    <p>
      When you use Gadit, we process:
    </p>
    <ul>
      <li>the words and optional sentences you look up;</li>
      <li>images generated at your request;</li>
      <li>your subscription plan and billing status;</li>
      <li>a recent search history (for paid users, up to the last 10 words), stored so you can access it again later;</li>
      <li>
        if you use the Gadit assistant in the help center: the questions you ask, its answers and whether you marked an
        answer as helpful, together with your account ID (and family ID, if you have one), email address, plan,
        interface language, and whether you used the website or the app;
      </li>
      <li>monthly quotas (for example, the number of images you have generated this billing cycle).</li>
    </ul>
    <p>
      The Gadit assistant is not offered on children&rsquo;s profiles, in Kids Mode or to visitors who are not signed in.
      Please do not type passwords or card numbers into it.
    </p>
    <h3>Technical and analytics data</h3>
    <p>
      We automatically collect basic technical information such as IP address, browser type, device type, referring
      URL, and pages viewed. This is used for security, performance monitoring, and aggregate analytics. Analytics
      are provided by Vercel and are anonymized at the collection point (no personal identifiers are stored). On our
      marketing, sign-up and payment pages we also use advertising and analytics tools, described in section 3.
    </p>
    <h3>Payment information</h3>
    <p>
      If you subscribe, payment is processed by <strong>Stripe, Inc.</strong> We do not see or store your full
      card number; we only receive a customer token and metadata needed to identify the subscription.
    </p>

    <h2>2. How we use your information</h2>
    <ul>
      <li>to provide and improve the Gadit service (generating definitions, images, sentence feedback, quizzes);</li>
      <li>to maintain your account and personalize your experience (search history, preferred language, Kids Mode toggle);</li>
      <li>to process subscriptions and send transactional emails (receipts, subscription changes);</li>
      <li>
        to answer your questions in the Gadit assistant and improve our help answers, and, when the assistant passes a
        question to our team, to email the team the recent conversation with your name, email address, plan, interface
        language, and whether you used the website or the app, so the team can reply to you by email;
      </li>
      <li>to measure and improve product performance and prevent abuse;</li>
      <li>to comply with legal obligations.</li>
    </ul>
    <p>
      We <strong>do not sell</strong> your personal information, and we do not use your content to advertise to you.
    </p>

    <h2>3. Third-party services we use</h2>
    <p>
      Gadit relies on the following processors. Each one receives only the minimum information needed to provide
      the relevant service:
    </p>
    <ul>
      <li>
        <strong>OpenAI</strong>{", processes the words and sentences you submit to generate definitions, sentence feedback and quizzes, turns text into speech, transcribes voice input, reads the text in photos and PDF files you upload (for example homework pages), and generates images. It also writes the Gadit assistant’s answers: we send it your question, the earlier messages of the same conversation, your interface language, your plan, and whether you are on the website or the app, and we do not attach your name or email address. Data sent to OpenAI is governed by OpenAI’s API data usage policy."}
      </li>
      <li>
        <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage), stores your account, profile,
        subscription status, search history, and generated images.
      </li>
      <li>
        <strong>Google</strong>{" (Gemini, through Google Cloud), turns text into speech. We send it only the text to be read aloud, such as words, sentences and stories, and the audio is kept in our Firebase storage so it can be played again. In one reading game it also hears the sound a child says aloud, to check it, and that recording is not stored. Google Fonts serves the fonts of the Chinese, Japanese and Korean interface and sees your IP address."}
      </li>
      <li>
        <strong>Dicta</strong>{", an Israeli non-profit, adds vowel marks (niqqud) to Hebrew text for young readers. We send it only the Hebrew text."}
      </li>
      <li>
        <strong>Stripe</strong>, handles payments, subscriptions, and billing portal.
      </li>
      <li>
        <strong>Apple</strong>{", provides Sign in with Apple in the iOS app (see section 1), and sells and bills the subscriptions bought in the iOS app. For those, Apple handles the payment, and we receive only a confirmation of the purchase and its status (such as a renewal or a refund)."}
      </li>
      <li>
        <strong>PayPal</strong>{", pays our partners (affiliates). We give it the partner’s PayPal email address and the amount."}
      </li>
      <li>
        <strong>Resend</strong>, sends our emails (such as sign-in links and notifications), and delivers to our team the
        questions the Gadit assistant passes on, with your email address as the reply address.
      </li>
      <li>
        <strong>Expo</strong>{", delivers the notifications of the iOS app, such as the alerts a parent can turn on, which include a child’s name and the word the child looked up."}
      </li>
      <li>
        <strong>Vercel</strong>, hosts and serves the website, and provides anonymized analytics and performance
        measurement.
      </li>
      <li>
        <strong>Yooniz</strong>{", a separate family learning service from the same founder. Yooniz can ask us whether a parent’s email address has an active Gadit Family plan, and we answer only yes or no. If it does, the family can open Gadit from Yooniz without a password: Yooniz sends us the parent’s email address, the family members’ display names, and whether each one is a parent, a boy or a girl. When a child who opened Gadit from Yooniz understands a word, we send Yooniz the parent’s email address, the child’s Yooniz ID and the number of learning points earned, never the word itself."}
      </li>
      <li>
        <strong>flagcdn.com</strong>{", serves the small flag images shown on our pages, and so sees your IP address and browser details."}
      </li>
      <li>
        <strong>Advertising and analytics</strong>{": Meta (Meta Pixel), Google Analytics and TikTok (TikTok Pixel and Events API) measure visits and the results of our ads. They use cookies and similar technologies on our marketing, sign-up and payment pages. When you sign up or pay, we may send these services a hashed (one-way encrypted) email address and account ID, together with your IP address and browser details, only to measure our ads. Affonso, a service for affiliate links, loads on the same pages and on any page a visitor reaches through a partner link, and keeps a cookie for up to 60 days. If you sign up after arriving through an Affonso affiliate link, we send Affonso your email address, name and account ID, so the affiliate who referred you is credited. We never send any of these services information about children, and these tools do not run on a child’s profile, in Kids Mode or on class link pages."}
      </li>
    </ul>

    <h2>4. How long we keep your information</h2>
    <ul>
      <li>Account information: while your account exists.</li>
      <li>Search history: the last 10 searches per user, updated on each new search.</li>
      <li>
        Gadit assistant conversations: 180 days, then deleted automatically, or sooner if you delete your account. A daily
        count of your questions, used for the daily limit, is deleted after 3 days.
      </li>
      <li>Questions the Gadit assistant passes to our team: kept in our team&rsquo;s mailbox, like any email you send us.</li>
      <li>Generated images: kept so the same word+meaning can reuse the cached image. May be retained indefinitely as long as your account is active.</li>
      <li>Billing and tax records: as required by applicable law (typically 7 years).</li>
      <li>
        Deleted accounts: a short record that the account was deleted (its email address, plan, and the reason and note
        you gave, if any), kept so we can answer questions about the deletion.
      </li>
      <li>Analytics data: aggregated, typically retained by the analytics provider for 13 months.</li>
    </ul>

    <h2>5. Your rights</h2>
    <p>Depending on where you live, you may have the right to:</p>
    <ul>
      <li>request access to the personal information we hold about you;</li>
      <li>request correction of inaccurate information;</li>
      <li>request deletion of your account and associated data;</li>
      <li>export your data in a portable format;</li>
      <li>object to or restrict certain uses of your information;</li>
      <li>opt out of certain data sharing (where applicable under CCPA or similar laws).</li>
    </ul>
    <p>
      To exercise any of these rights, email{" "}
      <a href="mailto:support@gadit.app">support@gadit.app</a>. We will respond within
      30 days.
    </p>

    <h2>6. Security</h2>
    <p>
      We use industry-standard safeguards, encrypted connections (HTTPS), authenticated APIs, and access controls , 
      to protect your information. No method of transmission or storage on the internet is 100% secure, so we cannot
      guarantee absolute security, but we work continuously to reduce risk.
    </p>

    <h2>7. Children</h2>
    <p>
      {"A Gadit account is for adults, 18 and older. Children and teenagers use Gadit only through an adult, in one of two ways."}
    </p>
    <p>
      {"Family profiles: a parent adds each child as a profile inside the parent's Family account, with a name and whether the child is a boy or a girl, and, if the parent adds them, an age, a school grade and a photo. Children have no email address or password with us. The words a child looks up, and the child's notebook, games and progress, are saved in the family's account. The parents in the family, and anyone they give access to (for example a tutor), can see them, and a parent can choose to get alerts, by notification or email, with the words a child looks up. A parent can remove a child's profile in the app at any time."}
    </p>
    <p>
      {"Class links: a student opens the link or code a teacher gives, without an account and without an email address. If the teacher entered a list of names, the student picks their name from it, and the words the student looks up are saved for the class under that name, so the teacher can see them. The school decides to use Gadit and is responsible for informing parents where the law requires it."}
    </p>
    <p>
      {"We never use children's information for advertising, and the tools listed under Advertising and analytics in section 3 never load on a child's profile, in Kids Mode or on class link pages. To have a child's profile and its data deleted, a parent can write to "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" and we will delete it. If you believe a child opened an account of their own, write to us and we will delete the account and its data."}
    </p>

    <h2>8. International users</h2>
    <p>
      Gadit is operated from the United States. If you access the service from outside the United States, your
      information will be transferred to, stored, and processed in the United States and in the data-center regions
      used by our service providers.
    </p>

    <h2>9. Changes to this policy</h2>
    <p>
      We may update this Privacy Policy from time to time. Material changes will be posted on this page with a
      revised &ldquo;Last updated&rdquo; date. Your continued use of Gadit after changes become effective constitutes
      acceptance of the updated policy.
    </p>

    <h2>10. Contact</h2>
    <p>
      Lavi Learning and Training Technologies LLC<br />
      Email: <a href="mailto:support@gadit.app">support@gadit.app</a>
    </p>
  </>
);

const HebrewBody = () => (
  <>
    <p>
      Gadit (להלן &ldquo;Gadit&rdquo;, &ldquo;אנחנו&rdquo;, &ldquo;שלנו&rdquo;) הוא שירות המופעל על ידי{" "}
      <strong>Lavi Learning and Training Technologies LLC</strong>, חברה הרשומה בארצות הברית. מדיניות פרטיות זו
      מסבירה איזה מידע אנחנו אוספים, איך אנחנו משתמשים בו, ואילו אפשרויות יש לכם.
    </p>
    <p>
      לכל שאלה, אפשר לכתוב אלינו ב-{" "}
      <a href="mailto:support@gadit.app">support@gadit.app</a>.
    </p>

    <h2>1. מידע שאנחנו אוספים</h2>
    <h3>מידע על החשבון</h3>
    <p>
      כשאתם יוצרים חשבון, אנחנו אוספים את כתובת הדוא&rdquo;ל שלכם, ואם אתם מתחברים דרך Google, את פרטי הפרופיל
      הבסיסיים ש-Google מספקת (שם תצוגה, תמונת פרופיל). אנחנו <strong>לא</strong> מקבלים את סיסמת ה-Google שלכם.
    </p>
    <p>
      {"באפליקציה ל-iOS אפשר להתחבר גם עם Apple. במקרה כזה Apple מעבירה לנו את השם ואת כתובת הדוא״ל שבחרתם לשתף, שיכולה להיות כתובת ממסר פרטית שמעבירה אליכם את המיילים שלנו. אנחנו לא מקבלים את סיסמת ה-Apple שלכם."}
    </p>
    <h3>מידע על השימוש</h3>
    <p>כשאתם משתמשים ב-Gadit, אנחנו מעבדים:</p>
    <ul>
      <li>את המילים והמשפטים (אופציונליים) שאתם מחפשים;</li>
      <li>תמונות שנוצרו לבקשתכם;</li>
      <li>מצב המנוי שלכם וסטטוס התשלום;</li>
      <li>היסטוריית חיפושים אחרונה (למשתמשים בתשלום, עד 10 מילים אחרונות), נשמרת כדי שתוכלו לחזור אליה;</li>
      <li>
        אם אתם משתמשים בעוזר של Gadit במרכז העזרה: השאלות שאתם שואלים, התשובות שלו, והאם סימנתם שתשובה עזרה, יחד עם
        מזהה החשבון (ומזהה המשפחה, אם יש), כתובת הדוא״ל, המסלול, שפת הממשק, והאם השתמשתם באתר או באפליקציה;
      </li>
      <li>מכסות חודשיות (למשל, כמה תמונות יצרתם בתקופת החיוב הנוכחית).</li>
    </ul>
    <p>
      העוזר של Gadit לא מוצע בפרופילים של ילדים, במצב ילדים ולמי שלא מחוברים לחשבון. אנא אל תכתבו בו סיסמאות או מספרי
      כרטיס אשראי.
    </p>
    <h3>מידע טכני ואנליטי</h3>
    <p>
      אנחנו אוספים אוטומטית מידע טכני בסיסי כמו כתובת IP, סוג דפדפן, סוג מכשיר, כתובת מפנה, ודפים שנצפו. המידע
      משמש לאבטחה, ניטור ביצועים, ואנליטיקה מצטברת. שירותי האנליטיקה ניתנים על ידי Vercel והם אנונימיים בנקודת
      האיסוף (לא נשמרים מזהים אישיים). בדפי השיווק, ההרשמה והתשלום שלנו אנחנו משתמשים גם בכלי פרסום ומדידה, שמתוארים
      בסעיף 3.
    </p>
    <h3>מידע על תשלומים</h3>
    <p>
      אם תירשמו למנוי, התשלום מעובד על ידי <strong>Stripe, Inc.</strong> אנחנו לא רואים ולא שומרים את מספר הכרטיס
      המלא שלכם; אנחנו מקבלים רק טוקן לקוח ומטא-דאטה הנדרשים לזיהוי המנוי.
    </p>

    <h2>2. איך אנחנו משתמשים במידע</h2>
    <ul>
      <li>כדי לספק ולשפר את שירות Gadit (יצירת הגדרות, תמונות, פידבק על משפטים, חידונים);</li>
      <li>כדי לתחזק את החשבון שלכם ולהתאים לכם את החוויה (היסטוריית חיפוש, שפה מועדפת, מצב ילדים);</li>
      <li>כדי לעבד מנויים ולשלוח מיילים עסקיים (קבלות, שינויים במנוי);</li>
      <li>
        כדי לענות על השאלות שלכם בעוזר של Gadit ולשפר את תשובות העזרה שלנו, וכשהעוזר מעביר שאלה לצוות, כדי לשלוח לצוות
        במייל את השיחה האחרונה יחד עם השם, כתובת הדוא״ל, המסלול, שפת הממשק, והאם השתמשתם באתר או באפליקציה, כדי שהצוות
        יוכל לענות לכם במייל;
      </li>
      <li>כדי למדוד ולשפר את ביצועי המוצר ולמנוע שימוש לרעה;</li>
      <li>כדי לעמוד בחובות משפטיות.</li>
    </ul>
    <p>
      אנחנו <strong>לא מוכרים</strong> את המידע האישי שלכם, ואיננו משתמשים בתוכן שלכם כדי לפרסם לכם.
    </p>

    <h2>3. שירותי צד שלישי שאנחנו משתמשים בהם</h2>
    <p>
      Gadit מסתמך על ספקי השירות הבאים. כל אחד מהם מקבל רק את המידע המינימלי הנדרש לצורך מתן השירות הרלוונטי:
    </p>
    <ul>
      <li>
        <strong>OpenAI</strong>{", מעבד את המילים והמשפטים שאתם שולחים כדי ליצור הגדרות, פידבק על משפטים וחידונים, הופך טקסט לדיבור, מתמלל קלט קולי, קורא את הטקסט בתמונות ובקובצי PDF שאתם מעלים (למשל דפי שיעורי בית), ויוצר תמונות. הוא גם מנסח את התשובות של העוזר של Gadit: אנחנו שולחים אליו את השאלה, את ההודעות הקודמות באותה שיחה, את שפת הממשק, את המסלול, והאם אתם באתר או באפליקציה, ולא מצרפים את השם או את כתובת הדוא״ל שלכם. המידע שנשלח ל-OpenAI כפוף למדיניות השימוש של OpenAI ב-API."}
      </li>
      <li>
        <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage), שומר את החשבון, הפרופיל,
        סטטוס המנוי, היסטוריית החיפוש, והתמונות שנוצרו.
      </li>
      <li>
        <strong>Google</strong>{" (Gemini, דרך Google Cloud), הופך טקסט לדיבור. אנחנו שולחים אליו רק את הטקסט שיש להקריא, כמו מילים, משפטים וסיפורים, והשמע נשמר באחסון ה-Firebase שלנו כדי שאפשר יהיה להשמיע אותו שוב. במשחק קריאה אחד הוא גם שומע את הצליל שילד אומר בקול, כדי לבדוק אותו, וההקלטה הזאת לא נשמרת. Google Fonts מגיש את הגופנים של הממשק בסינית, ביפנית ובקוריאנית, ורואה את כתובת ה-IP שלכם."}
      </li>
      <li>
        <strong>Dicta</strong>{", עמותה ישראלית, מוסיפה ניקוד לטקסט בעברית עבור קוראים צעירים. אנחנו שולחים אליה רק את הטקסט בעברית."}
      </li>
      <li>
        <strong>Stripe</strong>, מטפל בתשלומים, מנויים, ופורטל החיוב.
      </li>
      <li>
        <strong>Apple</strong>{", מספקת את ההתחברות עם Apple באפליקציה ל-iOS (ראו סעיף 1), ומוכרת ומחייבת את המנויים שנקנים באפליקציה ל-iOS. ברכישות האלה Apple מטפלת בתשלום, ואנחנו מקבלים רק אישור על הרכישה ועל מצבה (למשל חידוש או החזר)."}
      </li>
      <li>
        <strong>PayPal</strong>{", משלם לשותפים שלנו. אנחנו מעבירים אליו את כתובת ה-PayPal של השותף ואת הסכום."}
      </li>
      <li>
        <strong>Resend</strong>, שולח את המיילים שלנו (למשל קישורי כניסה והתראות), ומעביר לצוות שלנו את השאלות שהעוזר של
        Gadit מעביר הלאה, עם כתובת הדוא״ל שלכם ככתובת לתשובה.
      </li>
      <li>
        <strong>Expo</strong>{", מעביר את ההתראות של האפליקציה ל-iOS, למשל התראות שהורה יכול להפעיל, שכוללות את שם הילד ואת המילה שהילד חיפש."}
      </li>
      <li>
        <strong>Vercel</strong>, מארח את האתר ומספק אנליטיקה ומדידת ביצועים אנונימית.
      </li>
      <li>
        <strong>Yooniz</strong>{", שירות למידה משפחתי נפרד של אותו מייסד. Yooniz יכול לשאול אותנו אם לכתובת דוא״ל של הורה יש מסלול Family פעיל ב-Gadit, ואנחנו עונים רק כן או לא. אם יש, המשפחה יכולה להיכנס ל-Gadit מתוך Yooniz בלי סיסמה: Yooniz שולח אלינו את כתובת הדוא״ל של ההורה, את שמות התצוגה של בני המשפחה, והאם כל אחד מהם הוא הורה, בן או בת. כשילד שנכנס ל-Gadit מתוך Yooniz מבין מילה, אנחנו שולחים ל-Yooniz את כתובת הדוא״ל של ההורה, את המזהה של הילד ב-Yooniz ואת מספר נקודות הלמידה שנצברו, אף פעם לא את המילה עצמה."}
      </li>
      <li>
        <strong>flagcdn.com</strong>{", מגיש את תמונות הדגלים הקטנות שמוצגות בדפים שלנו, ולכן רואה את כתובת ה-IP ואת פרטי הדפדפן שלכם."}
      </li>
      <li>
        <strong>פרסום ומדידה</strong>{": Meta (Meta Pixel), Google Analytics ו-TikTok (TikTok Pixel ו-Events API) מודדים ביקורים ואת התוצאות של הפרסומות שלנו. הם משתמשים בעוגיות (cookies) ובטכנולוגיות דומות בדפי השיווק, ההרשמה והתשלום שלנו. כשאתם נרשמים או משלמים, ייתכן שנשלח לשירותים האלה כתובת דוא״ל ומזהה חשבון מוצפנים בהצפנה חד-כיוונית (hash), יחד עם כתובת ה-IP ופרטי הדפדפן, רק כדי למדוד את הפרסומות שלנו. Affonso, שירות לקישורי שותפים, נטען באותם דפים ובכל דף שמגיעים אליו דרך קישור של שותף, ושומר עוגייה עד 60 יום. אם נרשמתם אחרי שהגעתם דרך קישור שותף של Affonso, אנחנו שולחים ל-Affonso את כתובת הדוא״ל, השם ומזהה החשבון שלכם, כדי שהשותף שהפנה אתכם יקבל את הקרדיט. אנחנו אף פעם לא שולחים לאף אחד מהשירותים האלה מידע על ילדים, והכלים האלה לא פועלים בפרופיל של ילד, במצב ילדים או בדפים של קישור כיתה."}
      </li>
    </ul>

    <h2>4. כמה זמן אנחנו שומרים את המידע</h2>
    <ul>
      <li>מידע על החשבון: כל עוד החשבון שלכם קיים.</li>
      <li>היסטוריית חיפוש: 10 החיפושים האחרונים למשתמש, מתעדכן עם כל חיפוש חדש.</li>
      <li>
        שיחות עם העוזר של Gadit: 180 יום, ואז הן נמחקות אוטומטית, או מוקדם יותר אם תמחקו את החשבון. ספירה יומית של
        השאלות שלכם, שמשמשת למגבלה היומית, נמחקת אחרי 3 ימים.
      </li>
      <li>שאלות שהעוזר של Gadit מעביר לצוות: נשמרות בתיבת הדואר של הצוות, כמו כל מייל אחר שאתם שולחים לנו.</li>
      <li>תמונות שנוצרו: נשמרות כך שלאותה מילה+משמעות אפשר להשתמש בתמונה מהמטמון. עשויות להישמר ללא הגבלה כל עוד החשבון פעיל.</li>
      <li>רשומות חיוב ומיסים: כפי שנדרש בחוק (בדרך כלל 7 שנים).</li>
      <li>
        חשבונות שנמחקו: רשומה קצרה על המחיקה (כתובת הדוא״ל, המסלול, והסיבה וההערה שכתבתם, אם כתבתם), שנשמרת כדי שנוכל
        לענות על שאלות לגבי המחיקה.
      </li>
      <li>נתוני אנליטיקה: מצטברים, נשמרים בדרך כלל 13 חודשים על ידי ספק האנליטיקה.</li>
    </ul>

    <h2>5. הזכויות שלכם</h2>
    <p>בהתאם למקום מגוריכם, ייתכן שיש לכם הזכות:</p>
    <ul>
      <li>לבקש גישה למידע האישי שאנחנו מחזיקים עליכם;</li>
      <li>לבקש תיקון של מידע לא מדויק;</li>
      <li>לבקש מחיקה של החשבון והמידע הנלווה;</li>
      <li>לייצא את המידע שלכם בפורמט נייד;</li>
      <li>להתנגד או להגביל שימושים מסוימים במידע שלכם;</li>
      <li>לסרב לשיתוף מידע (ככל שהדבר חל לפי CCPA או חוקים דומים).</li>
    </ul>
    <p>
      כדי לממש את אחת הזכויות הללו, כתבו ל-{" "}
      <a href="mailto:support@gadit.app">support@gadit.app</a>. נחזור אליכם תוך 30 יום.
    </p>

    <h2>6. אבטחה</h2>
    <p>
      אנחנו משתמשים בשיטות אבטחה מקובלות בתעשייה, חיבורים מוצפנים (HTTPS), APIs מאומתים, ובקרות גישה, כדי להגן
      על המידע שלכם. אף שיטה של העברה או אחסון באינטרנט אינה 100% מאובטחת, ולכן איננו יכולים להבטיח אבטחה מוחלטת,
      אך אנחנו פועלים באופן רציף להפחתת סיכונים.
    </p>

    <h2>7. ילדים</h2>
    <p>
      {"חשבון ב-Gadit מיועד למבוגרים, מגיל 18 ומעלה. ילדים ובני נוער משתמשים ב-Gadit רק דרך מבוגר, באחת משתי דרכים."}
    </p>
    <p>
      {"פרופילים במשפחה: הורה מוסיף כל ילד כפרופיל בתוך חשבון ה-Family שלו, עם שם והאם זה בן או בת, ואם ההורה מוסיף אותם, גם גיל, כיתה ותמונה. לילדים אין אצלנו כתובת דוא״ל או סיסמה. המילים שילד מחפש, והמחברת, המשחקים וההתקדמות שלו, נשמרים בחשבון המשפחה. ההורים במשפחה, וכל מי שהם נותנים לו גישה (למשל מורה פרטי), יכולים לראות אותם, והורה יכול לבחור לקבל התראות, בהודעה או במייל, עם המילים שילד מחפש. הורה יכול להסיר את הפרופיל של ילד באפליקציה בכל עת."}
    </p>
    <p>
      {"קישורי כיתה: תלמיד פותח את הקישור או הקוד שהמורה נותן, בלי חשבון ובלי כתובת דוא״ל. אם המורה הזין רשימת שמות, התלמיד בוחר בה את השם שלו, והמילים שהוא מחפש נשמרות בכיתה תחת השם הזה, כדי שהמורה יוכל לראות אותן. בית הספר מחליט להשתמש ב-Gadit, והוא אחראי ליידע את ההורים כשהחוק מחייב זאת."}
    </p>
    <p>
      {"אנחנו אף פעם לא משתמשים במידע על ילדים לפרסום, והכלים שמפורטים תחת 'פרסום ומדידה' בסעיף 3 לא נטענים אף פעם בפרופיל של ילד, במצב ילדים או בדפים של קישור כיתה. כדי למחוק את הפרופיל של ילד ואת המידע שלו, הורה יכול לכתוב ל-"}<a href="mailto:support@gadit.app">support@gadit.app</a>{" ואנחנו נמחק אותו. אם אתם סבורים שילד פתח חשבון משלו, כתבו לנו ואנחנו נמחק את החשבון ואת המידע שלו."}
    </p>

    <h2>8. משתמשים בינלאומיים</h2>
    <p>
      Gadit מופעל מארצות הברית. אם אתם ניגשים לשירות מחוץ לארצות הברית, המידע שלכם יועבר, יאוחסן ויעובד בארצות
      הברית ובאזורי מרכזי הנתונים של ספקי השירות שלנו.
    </p>

    <h2>9. שינויים במדיניות זו</h2>
    <p>
      אנחנו עשויים לעדכן את מדיניות הפרטיות מעת לעת. שינויים מהותיים יפורסמו בדף זה עם תאריך &ldquo;עודכן
      לאחרונה&rdquo; מחודש. המשך השימוש שלכם ב-Gadit לאחר כניסת השינויים לתוקף מהווה הסכמה למדיניות המעודכנת.
    </p>

    <h2>10. יצירת קשר</h2>
    <p>
      Lavi Learning and Training Technologies LLC<br />
      דוא&rdquo;ל: <a href="mailto:support@gadit.app">support@gadit.app</a>
    </p>
  </>
);

export default function PrivacyPage() {
  return (
    <LegalPage
      lastUpdated={LAST_UPDATED}
      locales={{
        en: { title: "Privacy Policy", body: <EnglishBody /> },
        he: { title: "מדיניות פרטיות", body: <HebrewBody /> },
        ...translatedLegalLocales("privacy"),
      }}
    />
  );
}

import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Gadit",
  description: "How Gadit collects, uses, and protects your information.",
};

const LAST_UPDATED = "April 23, 2026";

const EnglishBody = () => (
  <>
    <p>
      Gadit (&ldquo;Gadit&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is a service operated
      by <strong>Lavi Learning and Training Technologies LLC</strong>, a company registered in the United States.
      This Privacy Policy explains what information we collect, how we use it, and the choices you have.
    </p>
    <p>
      If you have any question, contact us at{" "}
      <a href="mailto:support@neweducationacademy.com">support@neweducationacademy.com</a>.
    </p>

    <h2>1. Information we collect</h2>
    <h3>Account information</h3>
    <p>
      When you create an account, we collect your email address and, if you sign in with Google, the basic profile
      information Google provides (display name, profile picture). We do not receive your Google password.
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
      <li>monthly quotas (for example, the number of images you have generated this billing cycle).</li>
    </ul>
    <h3>Technical and analytics data</h3>
    <p>
      We automatically collect basic technical information such as IP address, browser type, device type, referring
      URL, and pages viewed. This is used for security, performance monitoring, and aggregate analytics. Analytics
      are provided by Vercel and are anonymized at the collection point (no personal identifiers are stored).
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
        <strong>OpenAI</strong> — processes the words and sentences you submit to generate definitions, sentence
        feedback, quizzes, and voice transcription (Whisper), and generates images (DALL·E 3). Data sent to OpenAI
        is governed by OpenAI&rsquo;s API data usage policy.
      </li>
      <li>
        <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage) — stores your account, profile,
        subscription status, search history, and generated images.
      </li>
      <li>
        <strong>Stripe</strong> — handles payments, subscriptions, and billing portal.
      </li>
      <li>
        <strong>Vercel</strong> — hosts and serves the website, and provides anonymized analytics and performance
        measurement.
      </li>
    </ul>

    <h2>4. How long we keep your information</h2>
    <ul>
      <li>Account information: while your account exists.</li>
      <li>Search history: the last 10 searches per user, updated on each new search.</li>
      <li>Generated images: kept so the same word+meaning can reuse the cached image. May be retained indefinitely as long as your account is active.</li>
      <li>Billing and tax records: as required by applicable law (typically 7 years).</li>
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
      <a href="mailto:support@neweducationacademy.com">support@neweducationacademy.com</a>. We will respond within
      30 days.
    </p>

    <h2>6. Security</h2>
    <p>
      We use industry-standard safeguards — encrypted connections (HTTPS), authenticated APIs, and access controls —
      to protect your information. No method of transmission or storage on the internet is 100% secure, so we cannot
      guarantee absolute security, but we work continuously to reduce risk.
    </p>

    <h2>7. Children</h2>
    <p>
      Gadit is not directed to children under 13. If you believe a child under 13 has created an account, email us
      and we will delete the account and associated data.
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
      Email: <a href="mailto:support@neweducationacademy.com">support@neweducationacademy.com</a>
    </p>
  </>
);

const HebrewBody = () => (
  <>
    <p>
      Gadit (להלן &ldquo;Gadit&rdquo;, &ldquo;אנחנו&rdquo;, &ldquo;שלנו&rdquo;) הוא שירות המופעל על ידי{" "}
      <strong>Lavi Learning and Training Technologies LLC</strong>, חברה הרשומה בארצות הברית. מדיניות פרטיות זו
      מסבירה איזה מידע אנחנו אוספים, איך אנחנו משתמשים בו, ואילו אפשרויות יש לך.
    </p>
    <p>
      לכל שאלה, אפשר לכתוב אלינו ב-{" "}
      <a href="mailto:support@neweducationacademy.com">support@neweducationacademy.com</a>.
    </p>

    <h2>1. מידע שאנחנו אוספים</h2>
    <h3>מידע על החשבון</h3>
    <p>
      כשאתם יוצרים חשבון, אנחנו אוספים את כתובת הדוא&rdquo;ל שלכם, ואם אתם מתחברים דרך Google — את פרטי הפרופיל
      הבסיסיים ש-Google מספקת (שם תצוגה, תמונת פרופיל). אנחנו <strong>לא</strong> מקבלים את סיסמת ה-Google שלכם.
    </p>
    <h3>מידע על השימוש</h3>
    <p>כשאתם משתמשים ב-Gadit, אנחנו מעבדים:</p>
    <ul>
      <li>את המילים והמשפטים (אופציונליים) שאתם מחפשים;</li>
      <li>תמונות שנוצרו לבקשתכם;</li>
      <li>מצב המנוי שלכם וסטטוס התשלום;</li>
      <li>היסטוריית חיפושים אחרונה (למשתמשים בתשלום — עד 10 מילים אחרונות), נשמרת כדי שתוכלו לחזור אליה;</li>
      <li>מכסות חודשיות (למשל, כמה תמונות יצרתם בתקופת החיוב הנוכחית).</li>
    </ul>
    <h3>מידע טכני ואנליטי</h3>
    <p>
      אנחנו אוספים אוטומטית מידע טכני בסיסי כמו כתובת IP, סוג דפדפן, סוג מכשיר, כתובת מפנה, ודפים שנצפו. המידע
      משמש לאבטחה, ניטור ביצועים, ואנליטיקה מצטברת. שירותי האנליטיקה ניתנים על ידי Vercel והם אנונימיים בנקודת
      האיסוף (לא נשמרים מזהים אישיים).
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
        <strong>OpenAI</strong> — מעבד את המילים והמשפטים שאתם שולחים, כדי ליצור הגדרות, פידבק על משפטים, חידונים,
        ותמלול קולי (Whisper), וכן יוצר תמונות (DALL·E 3). המידע שנשלח ל-OpenAI כפוף למדיניות השימוש של OpenAI ב-API.
      </li>
      <li>
        <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage) — שומר את החשבון, הפרופיל,
        סטטוס המנוי, היסטוריית החיפוש, והתמונות שנוצרו.
      </li>
      <li>
        <strong>Stripe</strong> — מטפל בתשלומים, מנויים, ופורטל החיוב.
      </li>
      <li>
        <strong>Vercel</strong> — מארח את האתר ומספק אנליטיקה ומדידת ביצועים אנונימית.
      </li>
    </ul>

    <h2>4. כמה זמן אנחנו שומרים את המידע</h2>
    <ul>
      <li>מידע על החשבון: כל עוד החשבון שלכם קיים.</li>
      <li>היסטוריית חיפוש: 10 החיפושים האחרונים למשתמש, מתעדכן עם כל חיפוש חדש.</li>
      <li>תמונות שנוצרו: נשמרות כך שלאותה מילה+משמעות אפשר להשתמש בתמונה מהמטמון. עשויות להישמר ללא הגבלה כל עוד החשבון פעיל.</li>
      <li>רשומות חיוב ומיסים: כפי שנדרש בחוק (בדרך כלל 7 שנים).</li>
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
      <a href="mailto:support@neweducationacademy.com">support@neweducationacademy.com</a>. נחזור אליכם תוך 30 יום.
    </p>

    <h2>6. אבטחה</h2>
    <p>
      אנחנו משתמשים בשיטות אבטחה מקובלות בתעשייה — חיבורים מוצפנים (HTTPS), APIs מאומתים, ובקרות גישה — כדי להגן
      על המידע שלכם. אף שיטה של העברה או אחסון באינטרנט אינה 100% מאובטחת, ולכן איננו יכולים להבטיח אבטחה מוחלטת,
      אך אנחנו פועלים באופן רציף להפחתת סיכונים.
    </p>

    <h2>7. ילדים</h2>
    <p>
      Gadit אינו מיועד לילדים מתחת לגיל 13. אם אתם סבורים שילד מתחת לגיל 13 פתח חשבון, כתבו לנו ואנחנו נמחק את
      החשבון ואת המידע הנלווה.
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
      דוא&rdquo;ל: <a href="mailto:support@neweducationacademy.com">support@neweducationacademy.com</a>
    </p>
  </>
);

export default function PrivacyPage() {
  return (
    <LegalPage
      lastUpdated={LAST_UPDATED}
      en={{ title: "Privacy Policy", body: <EnglishBody /> }}
      he={{ title: "מדיניות פרטיות", body: <HebrewBody /> }}
    />
  );
}

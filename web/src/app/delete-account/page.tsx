import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Delete your account, Gadit",
  description: "How to delete your Gadit account and what data is removed.",
};

const LAST_UPDATED = "August 19, 2026";

const EnglishBody = () => (
  <>
    <p>
      This page explains how to delete your <strong>Gadit</strong> account and the data associated with it.
      Gadit is operated by <strong>Lavi Learning and Training Technologies LLC</strong>.
    </p>

    <h2>Delete your account from inside the app</h2>
    <ol>
      <li>Open Gadit and sign in.</li>
      <li>
        Go to <strong>Account</strong> (tap your profile, then <strong>Account</strong>).
      </li>
      <li>
        Scroll to <strong>Delete account</strong>.
      </li>
      <li>
        Confirm by typing your email address, then tap <strong>Delete account</strong>.
      </li>
    </ol>
    <p>
      The deletion is immediate and permanent. It removes your account and you will be signed out on every device.
    </p>

    <h2>If you cannot sign in</h2>
    <p>
      Email <a href="mailto:support@gadit.app">support@gadit.app</a> from the address on your account and ask us to
      delete it. We will verify your request and delete the account within 30 days.
    </p>

    <h2>What is deleted</h2>
    <ul>
      <li>Your account and login credentials (email / Google sign-in).</li>
      <li>Your profile and any family member profiles you created.</li>
      <li>Your saved words (notebook) and recent search history.</li>
      <li>Images generated for your account and your in-app preferences.</li>
    </ul>

    <h2>What is kept, and for how long</h2>
    <ul>
      <li>
        Billing and tax records required by law (typically up to 7 years). Payments are handled by Stripe; we do not
        store your card number.
      </li>
      <li>
        Anonymized, aggregate analytics that are no longer linked to you (retained by our analytics provider, typically
        up to 13 months).
      </li>
    </ul>
    <p>
      For more detail on what we collect and why, see our{" "}
      <a href="/privacy">Privacy Policy</a>.
    </p>
  </>
);

const HebrewBody = () => (
  <>
    <p>
      דף זה מסביר איך למחוק את חשבון <strong>Gadit</strong> שלך ואת הנתונים המשויכים אליו.
      Gadit מופעל על ידי <strong>Lavi Learning and Training Technologies LLC</strong>.
    </p>

    <h2>מחיקת החשבון מתוך האפליקציה</h2>
    <ol>
      <li>פותחים את Gadit ומתחברים.</li>
      <li>
        נכנסים ל<strong>חשבון</strong> (לוחצים על הפרופיל ואז על <strong>חשבון</strong>).
      </li>
      <li>
        גוללים אל <strong>מחיקת חשבון</strong>.
      </li>
      <li>
        מאשרים על ידי הקלדת כתובת האימייל, ואז לוחצים <strong>מחיקת חשבון</strong>.
      </li>
    </ol>
    <p>
      המחיקה מיידית וסופית. היא מסירה את החשבון ומנתקת אותך מכל המכשירים.
    </p>

    <h2>אם אי אפשר להתחבר</h2>
    <p>
      כותבים ל-<a href="mailto:support@gadit.app">support@gadit.app</a> מהכתובת שרשומה בחשבון ומבקשים למחוק אותו.
      נאמת את הבקשה ונמחק את החשבון תוך 30 יום.
    </p>

    <h2>מה נמחק</h2>
    <ul>
      <li>החשבון ופרטי ההתחברות (אימייל / התחברות Google).</li>
      <li>הפרופיל שלך וכל פרופיל של בן משפחה שיצרת.</li>
      <li>המילים השמורות (המחברת) והיסטוריית החיפושים האחרונה.</li>
      <li>תמונות שנוצרו עבור החשבון וההעדפות באפליקציה.</li>
    </ul>

    <h2>מה נשמר, ולכמה זמן</h2>
    <ul>
      <li>
        רשומות חיוב ומיסים הנדרשות בחוק (בדרך כלל עד 7 שנים). התשלומים מטופלים על ידי Stripe; איננו שומרים את מספר
        הכרטיס.
      </li>
      <li>
        נתוני אנליטיקה מצטברים ואנונימיים שאינם מקושרים אליך יותר (נשמרים אצל ספק האנליטיקה, בדרך כלל עד 13 חודשים).
      </li>
    </ul>
    <p>
      לפירוט נוסף על מה שאנחנו אוספים ולמה, ראו את <a href="/privacy">מדיניות הפרטיות</a>.
    </p>
  </>
);

export default function DeleteAccountPage() {
  return (
    <LegalPage
      lastUpdated={LAST_UPDATED}
      locales={{
        en: { title: "Delete your account", body: <EnglishBody /> },
        he: { title: "מחיקת החשבון", body: <HebrewBody /> },
      }}
    />
  );
}

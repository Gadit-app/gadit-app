/**
 * Copy of the App Store subscribe screen in the iOS app (/subscribe,
 * Gadi 2026-10-27). Plan bullets come from plan-copy (every language);
 * these lines are English and Hebrew first, other languages fall back to
 * English until they are translated. Hebrew speaks to the reader in plural.
 */
type Copy = {
  title: string;
  sub: string;
  individual: string;
  family: string;
  trialThen: string;      // {price}
  perMonth: string;       // {price}
  trialThenYear: string;  // {price}
  perYear: string;        // {price}
  monthly: string;
  yearly: string;
  startTrial: string;
  subscribe: string;
  restore: string;
  legal: string;
  terms: string;
  privacy: string;
  loading: string;
  unavailable: string;
  signIn: string;
  done: string;
  doneFamily: string;
  cancelled: string;
  failed: string;
  otherAccount: string;
  restoredNone: string;
  have: string;           // {plan}
  manage: string;
  seePlans: string;
  deleteNote: string;
};

const EN: Copy = {
  title: "Choose your plan",
  sub: "Every word, fully understood. Start with 14 days free.",
  individual: "Individual",
  family: "Family",
  trialThen: "14 days free, then {price} a month",
  perMonth: "{price} a month",
  trialThenYear: "14 days free, then {price} a year",
  perYear: "{price} a year",
  monthly: "Monthly",
  yearly: "Yearly",
  startTrial: "Start 14 days free",
  subscribe: "Subscribe",
  restore: "Restore purchases",
  legal: "Payment is charged to your Apple ID when the free trial ends. The subscription renews every month or year, according to the plan chosen, unless it is cancelled at least 24 hours before the end of the period. You can manage or cancel it any time in your App Store account settings.",
  terms: "Terms of Use",
  privacy: "Privacy Policy",
  loading: "Loading the plans…",
  unavailable: "The plans could not be loaded right now. Please try again in a moment.",
  signIn: "Sign in first, so the plan is added to your account.",
  done: "Done! Your plan is active.",
  doneFamily: "Done! Your family plan is active. Next, add your children.",
  cancelled: "The purchase was cancelled.",
  failed: "The purchase did not go through. Please try again.",
  otherAccount: "This App Store purchase belongs to a different Gadit account. Sign in with that account to use it.",
  restoredNone: "No purchases were found to restore.",
  have: "You have Gadit {plan}.",
  manage: "Manage subscription",
  seePlans: "See plans",
  deleteNote: "Your subscription is through the App Store, so deleting the account does not cancel it. Cancel it in your App Store subscriptions so you are not charged again.",
};

const HE: Copy = {
  title: "בחירת מנוי",
  sub: "להבין כל מילה עד הסוף. מתחילים ב-14 יום חינם.",
  individual: "Individual",
  family: "Family",
  trialThen: "14 יום חינם, ואחר כך {price} לחודש",
  perMonth: "{price} לחודש",
  trialThenYear: "14 יום חינם, ואחר כך {price} לשנה",
  perYear: "{price} לשנה",
  monthly: "חודשי",
  yearly: "שנתי",
  startTrial: "14 יום ניסיון חינם",
  subscribe: "להצטרפות",
  restore: "שחזור רכישות",
  legal: "התשלום נגבה מחשבון ה-Apple ID שלכם בסוף תקופת הניסיון. המנוי מתחדש בכל חודש או בכל שנה, לפי המסלול שנבחר, אלא אם מבטלים אותו לפחות 24 שעות לפני סוף התקופה. אפשר לנהל ולבטל אותו בכל רגע בהגדרות החשבון ב-App Store.",
  terms: "תנאי שימוש",
  privacy: "מדיניות פרטיות",
  loading: "טוענים את המנויים…",
  unavailable: "לא הצלחנו לטעון את המנויים כרגע. נסו שוב בעוד רגע.",
  signIn: "קודם מתחברים, כדי שהמנוי יתווסף לחשבון שלכם.",
  done: "זהו! המנוי פעיל.",
  doneFamily: "זהו! מנוי המשפחה פעיל. עכשיו מוסיפים את הילדים.",
  cancelled: "הרכישה בוטלה.",
  failed: "הרכישה לא הושלמה. נסו שוב.",
  otherAccount: "הרכישה הזאת ב-App Store שייכת לחשבון Gadit אחר. התחברו לחשבון ההוא כדי להשתמש בה.",
  restoredNone: "לא נמצאו רכישות לשחזור.",
  have: "יש לכם Gadit {plan}.",
  manage: "ניהול המנוי",
  seePlans: "לבחירת מנוי",
  deleteNote: "המנוי שלכם הוא דרך ה-App Store, ולכן מחיקת החשבון לא מבטלת אותו. בטלו אותו במנויים של ה-App Store כדי שלא תחויבו שוב.",
};

const COPY: Record<string, Copy> = { en: EN, he: HE };

export function subscribeCopy(lang: string): Copy {
  return COPY[lang] ?? EN;
}

export function fill(s: string, vars: Record<string, string>): string {
  return s.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
}

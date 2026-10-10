import { renderEmailHtmlV2, mdLiteToHtml } from "./render";
import { EMAIL_BASE } from "./family-content";
import { makeLoginToken } from "@/lib/login-token";

/**
 * One email to someone who signed up and never came back (Gadi 2026-10-10,
 * approved copy; a subscriber had been locked out by a forgotten password
 * for a month). The button signs them straight in for a week, no password.
 * Sent from the drip cron and takes that user's drip slot for the day.
 */

const DAY = 86_400_000;

/** Due once: signed up 3 to 21 days ago and never active again after the
 *  first day. (Older accounts are left alone, so the first run is small.) */
export function loginReminderDue(
  meta: { creationTime?: string; lastSignInTime?: string; lastRefreshTime?: string | null },
  d: FirebaseFirestore.DocumentData,
  now: number,
): boolean {
  // Not for a school owner: schools get their own onboarding (2026-10-10).
  if (d.loginReminderSentAt || d.familyRole === "kid" || d.schoolId) return false;
  const created = Date.parse(meta.creationTime ?? "");
  if (!Number.isFinite(created)) return false;
  const age = now - created;
  if (age < 3 * DAY || age > 21 * DAY) return false;
  const last = Math.max(Date.parse(meta.lastSignInTime ?? "") || 0, Date.parse(meta.lastRefreshTime ?? "") || 0);
  return last - created < DAY;
}

type Copy = { subject: string; body: string; cta: string };
const COPY: Record<string, Copy> = {
  he: { subject: "כך נכנסים לחשבון שלכם ב-Gadit", body: "שלום,\n\nנרשמתם ל-Gadit לפני כמה ימים, ושמנו לב שעוד לא חזרתם.\n\nכדי שלא תצטרכו לזכור סיסמה, הנה כפתור שמכניס אתכם ישר לחשבון.\n\nהמחברת שלכם מחכה שם, עם כל מילה שתחפשו.", cta: "כניסה ל-Gadit" },
  en: { subject: "How to get back into your Gadit account", body: "Hi,\n\nYou signed up for Gadit a few days ago, and we noticed you haven't been back yet.\n\nSo you don't have to remember a password, here's a button that takes you straight into your account.\n\nYour notebook is waiting there, with every word you look up.", cta: "Sign in to Gadit" },
  ar: { subject: "هكذا تدخل إلى حسابك في Gadit", body: "مرحبًا،\n\nسجّلت في Gadit قبل بضعة أيام، ولاحظنا أنك لم تعد بعد.\n\nحتى لا تحتاج إلى تذكّر كلمة مرور، هذا زر يُدخلك مباشرة إلى حسابك.\n\nدفترك ينتظرك هناك، مع كل كلمة تبحث عنها.", cta: "الدخول إلى Gadit" },
  ru: { subject: "Как вернуться в свой аккаунт Gadit", body: "Здравствуйте,\n\nВы зарегистрировались в Gadit несколько дней назад, и мы заметили, что вы ещё не возвращались.\n\nЧтобы не нужно было помнить пароль, вот кнопка, которая сразу открывает ваш аккаунт.\n\nВаша тетрадь ждёт там, со всеми словами, которые вы найдёте.", cta: "Войти в Gadit" },
  es: { subject: "Así vuelves a tu cuenta de Gadit", body: "Hola,\n\nTe registraste en Gadit hace unos días y notamos que aún no has vuelto.\n\nPara que no tengas que recordar una contraseña, aquí tienes un botón que te lleva directo a tu cuenta.\n\nTu cuaderno te espera allí, con cada palabra que busques.", cta: "Entrar a Gadit" },
  pt: { subject: "Como voltar à sua conta do Gadit", body: "Olá,\n\nVocê se cadastrou no Gadit há alguns dias e percebemos que ainda não voltou.\n\nPara você não precisar lembrar de uma senha, aqui está um botão que leva direto à sua conta.\n\nSeu caderno está esperando lá, com cada palavra que você procurar.", cta: "Entrar no Gadit" },
  fr: { subject: "Comment revenir dans votre compte Gadit", body: "Bonjour,\n\nVous vous êtes inscrit à Gadit il y a quelques jours, et nous avons remarqué que vous n'êtes pas encore revenu.\n\nPour ne pas avoir à retenir de mot de passe, voici un bouton qui vous mène directement à votre compte.\n\nVotre carnet vous y attend, avec chaque mot que vous chercherez.", cta: "Se connecter à Gadit" },
  de: { subject: "So kommst du zurück in dein Gadit-Konto", body: "Hallo,\n\ndu hast dich vor ein paar Tagen bei Gadit angemeldet, und uns ist aufgefallen, dass du noch nicht zurückgekommen bist.\n\nDamit du dir kein Passwort merken musst, bringt dich dieser Button direkt in dein Konto.\n\nDein Heft wartet dort, mit jedem Wort, das du nachschlägst.", cta: "Bei Gadit anmelden" },
};

export function buildLoginReminder(uid: string, lang: string, unsubscribeUrl: string): { subject: string; html: string } {
  const c = COPY[lang] ?? COPY.en;
  const l = COPY[lang] ? lang : "en";
  const base = l === "en" ? EMAIL_BASE : `${EMAIL_BASE}/${l}`;
  const link = `https://www.gadit.app/api/auth/remind?t=${encodeURIComponent(makeLoginToken(uid, 7))}&l=${encodeURIComponent(l)}`;
  return {
    subject: c.subject,
    html: renderEmailHtmlV2({
      he: l === "he",
      lang: l,
      bodyHtml: mdLiteToHtml(l, c.body),
      ctaText: c.cta,
      ctaUrl: link,
      next: "",
      helpUrl: `${base}/help`,
      unsubscribeUrl,
    }),
  };
}

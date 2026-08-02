"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";

/**
 * Partner program landing + instant signup. Mirrors the Yooniz partners
 * page: recommend Gadit, earn 25% recurring in year one and 10% for life;
 * founder partners earn 30% in year one. Signup is instant — the form
 * posts to /api/partner/signup, which emails the code + dashboard link
 * and shows them inline on success.
 */

const COPY = {
  he: {
    dir: "rtl" as const,
    curSym: "₪",
    monthlyPrice: 19.9, // Deep monthly, ILS
    nav: "לאתר",
    heroTitle: "להמליץ על Gadit, לקבל הכנסה חוזרת.",
    heroSub: "כל מי שנרשם ומשלם דרך הקישור האישי שלך מזכה אותך ב-25% עמלה חוזרת בשנה הראשונה, ו-10% לכל החיים.",
    heroCta: "הצטרפות בחינם",
    proofA: "25% שנה ראשונה",
    proofB: "10% לכל החיים",
    proofC: "תשלום פעם בחודש",
    whyTitle: "למה להמליץ על Gadit",
    why: [
      { t: "מוצר שהורים אוהבים", d: "מילון בטוח לילדים ב-14 שפות, עם דוגמאות, תמונות ומחברת אישית. קל להמליץ על משהו שבאמת עוזר." },
      { t: "הכנסה חוזרת אמיתית", d: "לא תגמול חד-פעמי. על כל חודש שהלקוח משלם נכנסת עמלה. לקוח שנשאר שנה שווה שנה שלמה." },
      { t: "אפס סיכון", d: "ההצטרפות חינם, אין יעדים ואין מינימום. מספיק לשתף קישור כדי להרוויח." },
    ],
    howTitle: "איך זה עובד",
    how: [
      { t: "הרשמה", d: "שם ומייל, ותוך שניות מגיעים קוד וקישור אישי." },
      { t: "שיתוף", d: "הקישור נשלח לקהל שלך. כל מי שלוחץ משויך אליך ל-60 יום, גם אם נרשם מאוחר יותר." },
      { t: "רווח", d: "על כל חודש שהלקוח משלם בפועל נכנסת עמלה. משתחררת אחרי 30 יום ומשולמת פעם בחודש." },
    ],
    ratesTitle: "כמה אפשר להרוויח",
    standardName: "שותף",
    standardRate: "25%",
    standardSub: "עמלה חוזרת בשנה הראשונה, ואז 10% לכל החיים על כל לקוח.",
    founderName: "שותף מייסד",
    founderRate: "30%",
    founderSub: "בשנה הראשונה, ואז 10% לכל החיים. מספר מקומות מוגבל למי שיכול להביא נפח אמיתי.",
    calcTitle: "מחשבון רווחים",
    calcLead: "כמה לקוחות פעילים אפשר להביא?",
    calcMonthly: "בחודש",
    calcYearly: "בשנה הראשונה",
    calcNote: "הערכה על בסיס מנוי Deep ועמלת 25%. לקוחות שנתיים ומנויי משפחה או בית ספר מגדילים את הסכום.",
    formTitle: "הצטרפות לתוכנית",
    formName: "שם מלא",
    formEmail: "אימייל",
    formAudience: "איפה הקהל שלך? (רשות)",
    formCta: "קבלת קוד שותף",
    formSending: "רגע…",
    successTitle: "מעכשיו זה רשמי 🎉",
    successBody: "הקוד והקישור נשלחו אליך למייל. הנה גם כאן:",
    successLinkLabel: "הקישור האישי שלך",
    successDash: "פתיחת האזור האישי",
    errEmail: "נא להזין אימייל תקין.",
    errGeneric: "משהו השתבש. אפשר לנסות שוב.",
    faqTitle: "שאלות נפוצות",
    faq: [
      { q: "צריך להיות מנוי משלם כדי להצטרף?", a: "לא. ההצטרפות פתוחה לכולם, בחינם." },
      { q: "מתי מגיע הכסף?", a: "כל עמלה משתחררת 30 יום אחרי התשלום, והתשלום מתבצע פעם בחודש." },
      { q: "מה קורה אם לקוח מבטל?", a: "העמלה מגיעה על כל חודש ששולם בפועל. אם הלקוח ביטל אחרי 4 חודשים, קיבלת 4 חודשים. הוגן לשני הצדדים." },
      { q: "יש תקרה?", a: "אין תקרה. אפשר להביא כמה לקוחות שרק אפשר." },
    ],
  },
  en: {
    dir: "ltr" as const,
    curSym: "$",
    monthlyPrice: 4.99, // Deep monthly, USD
    nav: "Home",
    heroTitle: "Recommend Gadit. Earn recurring income.",
    heroSub: "Everyone who signs up and pays through your personal link earns you 25% recurring commission in year one, and 10% for life.",
    heroCta: "Join free",
    proofA: "25% year one",
    proofB: "10% for life",
    proofC: "Paid monthly",
    whyTitle: "Why recommend Gadit",
    why: [
      { t: "A product parents love", d: "A child-safe dictionary in 14 languages, with examples, pictures and a personal notebook. Easy to recommend something that genuinely helps." },
      { t: "Real recurring income", d: "Not a one-time payout. Every month a customer pays, you earn. A customer who stays a year is worth a full year to you." },
      { t: "Zero risk", d: "Joining is free, no targets, no minimums. Share a link, earn." },
    ],
    howTitle: "How it works",
    how: [
      { t: "Sign up", d: "Enter a name and email, and get a code + personal link within seconds." },
      { t: "Share", d: "Send your link to your audience. Everyone who clicks is credited to you for 60 days, even if they sign up later." },
      { t: "Earn", d: "You earn on every month the customer actually pays. Releases after 30 days, paid out monthly." },
    ],
    ratesTitle: "How much you earn",
    standardName: "Partner",
    standardRate: "25%",
    standardSub: "recurring in year one, then 10% for life on every customer.",
    founderName: "Founder Partner",
    founderRate: "30%",
    founderSub: "in year one, then 10% for life. Limited spots for partners who can move real volume.",
    calcTitle: "Earnings calculator",
    calcLead: "How many active customers will you bring?",
    calcMonthly: "per month",
    calcYearly: "in year one",
    calcNote: "Estimate based on a Deep plan and a 25% rate. Annual, Family and School customers push it higher.",
    formTitle: "Join the program",
    formName: "Full name",
    formEmail: "Email",
    formAudience: "Where's your audience? (optional)",
    formCta: "Get my partner code",
    formSending: "One sec…",
    successTitle: "You're in 🎉",
    successBody: "We emailed your code and link. Here they are too:",
    successLinkLabel: "Your personal link",
    successDash: "Open your dashboard",
    errEmail: "Please enter a valid email.",
    errGeneric: "Something went wrong. Please try again.",
    faqTitle: "FAQ",
    faq: [
      { q: "Do I need to be a paying customer?", a: "No. Joining is open to everyone, free." },
      { q: "When do I get paid?", a: "Each commission releases 30 days after the payment, and payouts run once a month." },
      { q: "What if a customer cancels?", a: "You earned on every month actually paid. Cancel after 4 months, you kept 4 months. Fair both ways." },
      { q: "Is there a cap?", a: "None. Bring as many customers as you like." },
    ],
  },
};

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function PartnersClient() {
  const { lang } = useLang();
  const href = useHref();
  const t = COPY[lang === "he" ? "he" : "en"];
  const dir = t.dir;

  const [count, setCount] = useState(20);
  const monthly = useMemo(() => count * t.monthlyPrice * 0.25, [count, t.monthlyPrice]);
  const yearly = monthly * 12;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [audience, setAudience] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [result, setResult] = useState<{ code: string; dashboardUrl: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEmail(email)) {
      setErrMsg(t.errEmail);
      setState("error");
      return;
    }
    setState("sending");
    setErrMsg("");
    try {
      const res = await fetch("/api/partner/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, audience, lang }),
      });
      const d = await res.json();
      if (!res.ok || !d.code) {
        setErrMsg(t.errGeneric);
        setState("error");
        return;
      }
      setResult({ code: d.code, dashboardUrl: d.dashboardUrl });
      setState("done");
    } catch {
      setErrMsg(t.errGeneric);
      setState("error");
    }
  }

  const money = (n: number) => `${t.curSym}${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const link = result ? `https://www.gadit.app/?ref=${result.code}` : "";

  return (
    <div dir={dir} style={S.page}>
      {/* Top bar */}
      <header style={S.topbar}>
        <Link href={href("/")} style={S.wordmark} translate="no">Gadit</Link>
        <Link href={href("/")} style={S.navLink}>{t.nav}</Link>
      </header>

      {/* Hero */}
      <section style={S.hero}>
        <h1 style={S.heroTitle}>{t.heroTitle}</h1>
        <p style={S.heroSub}>{t.heroSub}</p>
        <a href="#join" style={S.heroCta}>{t.heroCta}</a>
        <div style={S.proofRow}>
          <span style={S.proof}>{t.proofA}</span>
          <span style={S.proofDot}>·</span>
          <span style={S.proof}>{t.proofB}</span>
          <span style={S.proofDot}>·</span>
          <span style={S.proof}>{t.proofC}</span>
        </div>
      </section>

      {/* Why */}
      <section style={S.section}>
        <h2 style={S.h2}>{t.whyTitle}</h2>
        <div style={S.grid3}>
          {t.why.map((w, i) => (
            <div key={i} style={S.featCard}>
              <div style={S.featTitle}>{w.t}</div>
              <div style={S.featBody}>{w.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How */}
      <section style={S.section}>
        <h2 style={S.h2}>{t.howTitle}</h2>
        <div style={S.grid3}>
          {t.how.map((h, i) => (
            <div key={i} style={S.stepCard}>
              <div style={S.stepNum}>{i + 1}</div>
              <div style={S.featTitle}>{h.t}</div>
              <div style={S.featBody}>{h.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Rates */}
      <section style={S.section}>
        <h2 style={S.h2}>{t.ratesTitle}</h2>
        <div style={S.rateGrid}>
          <div style={S.rateCard}>
            <div style={S.rateName}>{t.standardName}</div>
            <div style={S.rateBig}>{t.standardRate}</div>
            <div style={S.rateSub}>{t.standardSub}</div>
          </div>
          <div style={{ ...S.rateCard, ...S.rateCardFounder }}>
            <div style={{ ...S.rateName, color: "#6D28D9" }}>{t.founderName}</div>
            <div style={{ ...S.rateBig, color: "#6D28D9" }}>{t.founderRate}</div>
            <div style={S.rateSub}>{t.founderSub}</div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section style={S.section}>
        <h2 style={S.h2}>{t.calcTitle}</h2>
        <div style={S.calcCard}>
          <label style={S.calcLead}>{t.calcLead}</label>
          <input
            type="range" min={1} max={200} value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={S.slider}
          />
          <div style={S.calcCount}>{count}</div>
          <div style={S.calcResults}>
            <div style={S.calcCell}>
              <div style={S.calcVal} dir="ltr">{money(monthly)}</div>
              <div style={S.calcLabel}>{t.calcMonthly}</div>
            </div>
            <div style={S.calcCell}>
              <div style={{ ...S.calcVal, color: "#0EA5A5" }} dir="ltr">{money(yearly)}</div>
              <div style={S.calcLabel}>{t.calcYearly}</div>
            </div>
          </div>
          <div style={S.calcNote}>{t.calcNote}</div>
        </div>
      </section>

      {/* Signup */}
      <section id="join" style={S.section}>
        <h2 style={S.h2}>{t.formTitle}</h2>
        <div style={S.formCard}>
          {state === "done" && result ? (
            <div style={{ textAlign: "center" }}>
              <div style={S.successTitle}>{t.successTitle}</div>
              <p style={S.successBody}>{t.successBody}</p>
              <div style={S.successLinkLabel}>{t.successLinkLabel}</div>
              <div style={S.successLink} dir="ltr">{link}</div>
              <a href={result.dashboardUrl} style={S.heroCta}>{t.successDash}</a>
            </div>
          ) : (
            <form onSubmit={submit}>
              <input style={S.input} placeholder={t.formName} value={name} onChange={(e) => setName(e.target.value)} />
              <input style={S.input} type="email" placeholder={t.formEmail} value={email} onChange={(e) => setEmail(e.target.value)} />
              <textarea style={{ ...S.input, minHeight: 72, resize: "vertical" as const }} placeholder={t.formAudience} value={audience} onChange={(e) => setAudience(e.target.value)} />
              {state === "error" && <div style={S.formErr}>{errMsg}</div>}
              <button type="submit" style={S.formCta} disabled={state === "sending"}>
                {state === "sending" ? t.formSending : t.formCta}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section style={S.section}>
        <h2 style={S.h2}>{t.faqTitle}</h2>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {t.faq.map((f, i) => (
            <div key={i} style={S.faqItem}>
              <div style={S.faqQ}>{f.q}</div>
              <div style={S.faqA}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      <footer style={S.footer}>
        <Link href={href("/")} style={S.navLink} translate="no">Gadit</Link>
      </footer>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { background: "#F6F8FA", color: "#111827", fontFamily: "var(--font-rubik, -apple-system, Segoe UI, Roboto, sans-serif)", minHeight: "100dvh" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", maxWidth: 960, margin: "0 auto" },
  wordmark: { fontSize: 22, fontWeight: 800, color: "#0EA5A5", textDecoration: "none" },
  navLink: { color: "#6B7280", textDecoration: "none", fontSize: 14, fontWeight: 600 },
  hero: { textAlign: "center", padding: "48px 20px 40px", maxWidth: 760, margin: "0 auto" },
  heroTitle: { fontSize: 40, lineHeight: 1.15, fontWeight: 800, margin: "0 0 16px" },
  heroSub: { fontSize: 18, lineHeight: 1.6, color: "#4B5563", margin: "0 auto 28px", maxWidth: 620 },
  heroCta: { display: "inline-block", background: "#0EA5A5", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 16, padding: "14px 32px", borderRadius: 12, boxShadow: "0 6px 20px rgba(14,165,165,0.28)" },
  proofRow: { display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 22, flexWrap: "wrap" },
  proof: { fontSize: 14, fontWeight: 700, color: "#0b7d7d" },
  proofDot: { color: "#CBD5E1" },
  section: { maxWidth: 960, margin: "0 auto", padding: "36px 20px" },
  h2: { fontSize: 26, fontWeight: 800, textAlign: "center", margin: "0 0 28px" },
  grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 },
  featCard: { background: "#fff", border: "1px solid #EAECEF", borderRadius: 16, padding: 22 },
  stepCard: { background: "#fff", border: "1px solid #EAECEF", borderRadius: 16, padding: 22, position: "relative" },
  stepNum: { width: 34, height: 34, borderRadius: 999, background: "rgba(14,165,165,0.12)", color: "#0b7d7d", fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  featTitle: { fontSize: 17, fontWeight: 700, marginBottom: 8 },
  featBody: { fontSize: 14.5, lineHeight: 1.65, color: "#4B5563" },
  rateGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, maxWidth: 720, margin: "0 auto" },
  rateCard: { background: "#fff", border: "1px solid #EAECEF", borderRadius: 18, padding: 28, textAlign: "center" },
  rateCardFounder: { border: "1.5px solid rgba(124,58,237,0.35)", background: "rgba(124,58,237,0.03)" },
  rateName: { fontSize: 15, fontWeight: 700, color: "#0b7d7d", marginBottom: 6 },
  rateBig: { fontSize: 46, fontWeight: 800, color: "#0EA5A5", lineHeight: 1 },
  rateSub: { fontSize: 14.5, lineHeight: 1.6, color: "#4B5563", marginTop: 12 },
  calcCard: { background: "#fff", border: "1px solid #EAECEF", borderRadius: 18, padding: 28, maxWidth: 560, margin: "0 auto", textAlign: "center" },
  calcLead: { display: "block", fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 16 },
  slider: { width: "100%", accentColor: "#0EA5A5" },
  calcCount: { fontSize: 32, fontWeight: 800, color: "#111827", margin: "8px 0 20px" },
  calcResults: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  calcCell: { background: "#F6F8FA", borderRadius: 12, padding: "16px 8px" },
  calcVal: { fontSize: 26, fontWeight: 800 },
  calcLabel: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  calcNote: { fontSize: 12.5, color: "#9CA3AF", marginTop: 16, lineHeight: 1.5 },
  formCard: { background: "#fff", border: "1px solid #EAECEF", borderRadius: 18, padding: 28, maxWidth: 480, margin: "0 auto" },
  input: { width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 15, marginBottom: 12, fontFamily: "inherit", outline: "none" },
  formErr: { color: "#991B1B", fontSize: 13.5, marginBottom: 12 },
  formCta: { width: "100%", background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer" },
  successTitle: { fontSize: 24, fontWeight: 800, marginBottom: 8 },
  successBody: { fontSize: 15, color: "#4B5563", marginBottom: 18 },
  successLinkLabel: { fontSize: 13, color: "#6B7280", marginBottom: 6 },
  successLink: { fontSize: 17, fontWeight: 700, color: "#0EA5A5", wordBreak: "break-all", marginBottom: 20 },
  faqItem: { borderBottom: "1px solid #EAECEF", padding: "16px 0" },
  faqQ: { fontSize: 16, fontWeight: 700, marginBottom: 6 },
  faqA: { fontSize: 14.5, lineHeight: 1.6, color: "#4B5563" },
  footer: { textAlign: "center", padding: "40px 20px 56px" },
};

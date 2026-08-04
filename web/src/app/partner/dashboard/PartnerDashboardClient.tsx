"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";

/**
 * Native partner dashboard. Reads the `t` token from the URL (set in the
 * welcome email), fetches /api/partner/stats, and shows the referral
 * link, live counters, and an earnings breakdown by currency.
 *
 * Self-contained inline styling (no shared shell) so a partner who isn't
 * a Gadit user still gets a clean, on-brand page.
 */

type Bucket = { pending: number; released: number; paid: number };
type Stats = {
  name: string;
  code: string;
  tier: "standard" | "founder";
  rateYearOne: number;
  rateLifetime: number;
  status: string;
  link: string;
  clicks: number;
  signups: number;
  payingCustomers: number;
  commissionCount: number;
  earnings: Record<string, Bucket>;
};

const COPY = {
  he: {
    dir: "rtl" as const,
    loading: "טוען את האזור שלך…",
    notFound: "לא מצאנו את הקישור הזה. כדאי לוודא שכל הכתובת הועתקה מהמייל, או לפנות אלינו.",
    hi: "היי",
    yourLink: "הקישורים האישיים שלך",
    linksHint: "קישור לכל מוצר. כל מי שנכנס דרכו ונרשם נזקף לך, בכל שפה.",
    linkGeneral: "Gadit (כללי)",
    linkFamilies: "למשפחות",
    linkSchools: "לבתי ספר",
    copy: "העתקת קישור",
    copied: "הועתק ✓",
    linkLangLabel: "שפת הקישור",
    clicks: "קליקים",
    signups: "נרשמו",
    paying: "לקוחות משלמים",
    earnings: "הרווחים שלך",
    pending: "בהמתנה",
    available: "זמין לתשלום",
    paid: "שולם",
    pendingNote: "משתחרר 30 יום אחרי כל תשלום",
    tierStandard: "שותף",
    tierFounder: "שותף מייסד",
    rateStandard: "25% שנה ראשונה · 10% לכל החיים",
    rateFounder: "30% שנה ראשונה · 10% לכל החיים",
    howTitle: "איך זה עובד",
    how1: "כדאי לשתף את הקישור האישי שלך.",
    how2: "כל מי שנרשם ומשלם דרכו משויך אליך ל-60 יום, גם אם נרשם מאוחר יותר.",
    how3: "על כל חודש שהלקוח משלם בפועל נכנסת עמלה. הרווח משתחרר אחרי 30 יום ומשולם פעם בחודש.",
    back: "לאתר Gadit",
    empty: "עדיין אין רווחים. אפשר לשתף את הקישור ולהתחיל.",
  },
  en: {
    dir: "ltr" as const,
    loading: "Loading your dashboard…",
    notFound: "We couldn't find this link. Make sure you copied the full address from your email, or contact us.",
    hi: "Hi",
    yourLink: "Your personal links",
    linksHint: "One link per product. Anyone who lands through it and signs up is credited to you, in any language.",
    linkGeneral: "Gadit (general)",
    linkFamilies: "Families",
    linkSchools: "Schools",
    copy: "Copy link",
    copied: "Copied ✓",
    linkLangLabel: "Link language",
    clicks: "Clicks",
    signups: "Signups",
    paying: "Paying customers",
    earnings: "Your earnings",
    pending: "Pending",
    available: "Available",
    paid: "Paid",
    pendingNote: "Releases 30 days after each payment",
    tierStandard: "Partner",
    tierFounder: "Founder Partner",
    rateStandard: "25% year one · 10% for life",
    rateFounder: "30% year one · 10% for life",
    howTitle: "How it works",
    how1: "Share your personal link.",
    how2: "Anyone who signs up and pays through it is credited to you for 60 days, even if they sign up later.",
    how3: "You earn on every month the customer actually pays. Earnings release after 30 days and pay out monthly.",
    back: "Gadit home",
    empty: "No earnings yet. Share your link to get started.",
  },
};

const CUR_SYMBOL: Record<string, string> = { ils: "₪", usd: "$", eur: "€", gbp: "£" };

function money(minor: number, currency: string): string {
  const sym = CUR_SYMBOL[currency] ?? currency.toUpperCase() + " ";
  return `${sym}${(minor / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// The 14 UI languages, with native names, for the link-language picker.
// A partner shares gadit.app/<lang>/?ref=<code>; the middleware sets the
// language from the prefix and the ?ref= is preserved through the rewrite,
// so the audience lands in that language AND the click is attributed.
const LINK_LANGS: Array<{ code: string; native: string }> = [
  { code: "en", native: "English" },
  { code: "he", native: "עברית" },
  { code: "ru", native: "Русский" },
  { code: "es", native: "Español" },
  { code: "ar", native: "العربية" },
  { code: "fr", native: "Français" },
  { code: "de", native: "Deutsch" },
  { code: "pt", native: "Português" },
  { code: "it", native: "Italiano" },
  { code: "cs", native: "Čeština" },
  { code: "sk", native: "Slovenčina" },
  { code: "ja", native: "日本語" },
  { code: "hi", native: "हिन्दी" },
  { code: "am", native: "አማርኛ" },
];
// A partner link = a landing path + ?ref=<code>, in the chosen language.
// RefCapture (mounted in the root layout) reads ?ref on EVERY page, so the
// referral is attributed no matter which product page they land on.
const PRODUCT_PATHS = {
  general: "",
  families: "/families/landing",
  schools: "/schools/landing",
} as const;
type ProductKey = keyof typeof PRODUCT_PATHS;

function buildRefLink(code: string, lang: string, path = ""): string {
  const base = "https://www.gadit.app";
  const prefix = lang === "en" ? "" : `/${lang}`;
  return path
    ? `${base}${prefix}${path}?ref=${code}`
    : `${base}${prefix}/?ref=${code}`;
}

export function PartnerDashboardClient() {
  const { lang } = useLang();
  const href = useHref();
  const t = COPY[lang === "he" ? "he" : "en"];
  const dir = t.dir;

  const [stats, setStats] = useState<Stats | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [linkLang, setLinkLang] = useState<string>(lang); // language for the shared links

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("t");
    if (!token) {
      setState("error");
      return;
    }
    fetch(`/api/partner/stats?t=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Stats) => {
        setStats(d);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  async function copyLink(product: ProductKey) {
    if (!stats) return;
    try {
      await navigator.clipboard.writeText(buildRefLink(stats.code, linkLang, PRODUCT_PATHS[product]));
      setCopiedKey(product);
      setTimeout(() => setCopiedKey((k) => (k === product ? null : k)), 1800);
    } catch { /* clipboard blocked — ignore */ }
  }

  const currencies = stats ? Object.keys(stats.earnings) : [];
  const hasEarnings = currencies.length > 0;

  return (
    <div dir={dir} style={S.page}>
      <style>{RESPONSIVE_CSS}</style>

      {/* Top bar — like a real affiliate portal, brand left, exit right. */}
      <div style={S.topbar}>
        <div style={S.topbarInner}>
          <Link href={href("/")} style={S.wordmark} translate="no">
            Gad<span style={{ color: "#0EA5A5", fontStyle: "italic", fontWeight: 600 }}>it</span>
          </Link>
          <Link href={href("/")} style={S.topBack}>{t.back} →</Link>
        </div>
      </div>

      <div style={S.shell}>
        {state === "loading" && <div style={S.muted}>{t.loading}</div>}
        {state === "error" && <div style={S.errorBox}>{t.notFound}</div>}

        {state === "ready" && stats && (
          <>
            {/* Identity */}
            <div style={S.headRow}>
              <div>
                <h1 style={S.h1}>{t.hi} {stats.name || ""}</h1>
                <div style={S.rateLine}>
                  {`${Math.round(stats.rateYearOne * 100)}% ${lang === "he" ? "שנה ראשונה" : "year one"} · ${Math.round(stats.rateLifetime * 100)}% ${lang === "he" ? "לכל החיים" : "for life"}`}
                </div>
              </div>
              <span style={{ ...S.tierBadge, ...(stats.tier === "founder" ? S.tierFounder : S.tierStandard) }}>
                {stats.tier === "founder" ? t.tierFounder : t.tierStandard}
              </span>
            </div>

            {/* KPI row */}
            <div className="pd-kpi" style={S.kpiGrid}>
              <Kpi label={t.clicks} value={stats.clicks.toLocaleString()} accent="#0EA5A5" />
              <Kpi label={t.signups} value={stats.signups.toLocaleString()} accent="#7C3AED" />
              <Kpi label={t.paying} value={stats.payingCustomers.toLocaleString()} accent="#0891B2" />
              <Kpi label={t.available} value={hasEarnings ? money(stats.earnings[currencies[0]].released, currencies[0]) : "—"} accent="#16A34A" />
            </div>

            {/* Body: links + how (main) · earnings (sidebar) */}
            <div className="pd-body" style={S.body}>
              <div style={S.col}>
                {/* Referral links — one per product, RefCapture attributes
                    ?ref on any of them. Shared 14-language picker. */}
                <div style={S.card}>
                  <div style={S.cardLabel}>{t.yourLink}</div>
                  <div style={S.subtle}>{t.linksHint}</div>
                  {(["general", "families", "schools"] as ProductKey[]).map((product) => {
                    const label = product === "general" ? t.linkGeneral : product === "families" ? t.linkFamilies : t.linkSchools;
                    return (
                      <div key={product} style={{ marginBottom: 12 }}>
                        <div style={S.linkProductLabel}>{label}</div>
                        <div style={S.linkRow}>
                          <div style={S.linkText} dir="ltr">{buildRefLink(stats.code, linkLang, PRODUCT_PATHS[product])}</div>
                          <button type="button" onClick={() => copyLink(product)} style={S.copyBtn}>
                            {copiedKey === product ? t.copied : t.copy}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div style={S.linkLangRow}>
                    <span style={S.linkLangLabel}>{t.linkLangLabel}</span>
                    <select value={linkLang} onChange={(e) => setLinkLang(e.target.value)} style={S.linkLangSelect}>
                      {LINK_LANGS.map((l) => (<option key={l.code} value={l.code}>{l.native}</option>))}
                    </select>
                  </div>
                </div>

                {/* How it works */}
                <div style={S.card}>
                  <div style={S.cardLabel}>{t.howTitle}</div>
                  <ol style={S.ol}>
                    <li style={S.li}>{t.how1}</li>
                    <li style={S.li}>{t.how2}</li>
                    <li style={S.li}>{t.how3}</li>
                  </ol>
                </div>
              </div>

              {/* Earnings sidebar */}
              <div style={S.col}>
                <div style={S.card}>
                  <div style={S.cardLabel}>{t.earnings}</div>
                  {!hasEarnings && <div style={S.muted}>{t.empty}</div>}
                  {currencies.map((cur) => {
                    const b = stats.earnings[cur];
                    return (
                      <div key={cur} style={S.earnBlock}>
                        <div style={S.earnBig} dir="ltr">{money(b.released, cur)}</div>
                        <div style={S.earnBigLabel}>{t.available}</div>
                        <div style={S.earnSplit}>
                          <EarnCell label={t.pending} value={money(b.pending, cur)} />
                          <EarnCell label={t.paid} value={money(b.paid, cur)} />
                        </div>
                      </div>
                    );
                  })}
                  {hasEarnings && <div style={S.pendingNote}>{t.pendingNote}</div>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={S.kpiCard}>
      <div style={{ ...S.kpiValue, color: accent }} dir="ltr">{value}</div>
      <div style={S.kpiLabel}>{label}</div>
    </div>
  );
}

function EarnCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={S.earnCell}>
      <div style={S.earnValue} dir="ltr">{value}</div>
      <div style={S.earnLabel}>{label}</div>
    </div>
  );
}

// Inline styles can't media-query; a tiny stylesheet widens the KPI row to
// 4-across and the body to a 2-column (main + earnings) layout on desktop.
const RESPONSIVE_CSS = `
@media (min-width: 720px) { .pd-kpi { grid-template-columns: repeat(4, 1fr) !important; } }
@media (min-width: 900px) { .pd-body { grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr) !important; } }
`;

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "#F4F6F8",
    fontFamily: "var(--font-rubik, -apple-system, Segoe UI, Roboto, sans-serif)",
    color: "#111827",
    paddingBottom: 64,
  },
  topbar: { background: "#fff", borderBottom: "1px solid #E9ECEF" },
  topbarInner: { maxWidth: 1120, margin: "0 auto", padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  wordmark: { fontSize: 22, fontWeight: 800, color: "#111827", textDecoration: "none", letterSpacing: "-0.02em" },
  topBack: { color: "#6B7280", textDecoration: "none", fontSize: 13.5, fontWeight: 600 },
  shell: { maxWidth: 1120, margin: "0 auto", padding: "28px 22px 0" },
  muted: { color: "#6B7280", fontSize: 15, padding: "12px 0" },
  errorBox: { background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", borderRadius: 12, padding: 20, fontSize: 15, lineHeight: 1.6 },
  headRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 22 },
  h1: { fontSize: 26, fontWeight: 800, margin: 0 },
  rateLine: { color: "#6B7280", fontSize: 14, marginTop: 6 },
  tierBadge: { fontSize: 12.5, fontWeight: 700, padding: "6px 14px", borderRadius: 999, whiteSpace: "nowrap" },
  tierStandard: { background: "rgba(14,165,165,0.12)", color: "#0b7d7d" },
  tierFounder: { background: "rgba(124,58,237,0.12)", color: "#6D28D9" },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 18 },
  kpiCard: { background: "#fff", border: "1px solid #E9ECEF", borderRadius: 16, padding: "20px 18px", boxShadow: "0 1px 2px rgba(16,24,40,0.04)" },
  kpiValue: { fontSize: 32, fontWeight: 800, lineHeight: 1.1 },
  kpiLabel: { fontSize: 13, color: "#6B7280", marginTop: 6, fontWeight: 500 },
  body: { display: "grid", gridTemplateColumns: "1fr", gap: 18 },
  col: { display: "flex", flexDirection: "column", gap: 18, minWidth: 0 },
  card: { background: "#fff", border: "1px solid #E9ECEF", borderRadius: 16, padding: 22, boxShadow: "0 1px 2px rgba(16,24,40,0.04)" },
  cardLabel: { fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 6, letterSpacing: 0.4, textTransform: "uppercase" },
  subtle: { fontSize: 12.5, color: "#6B7280", marginBottom: 14, lineHeight: 1.5 },
  linkProductLabel: { fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 },
  linkRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  linkText: { flex: 1, minWidth: 180, fontSize: 14, fontWeight: 600, color: "#0E7C74", wordBreak: "break-all", background: "#F4F6F8", borderRadius: 8, padding: "9px 12px" },
  copyBtn: { background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 9, padding: "9px 16px", fontWeight: 700, fontSize: 13.5, cursor: "pointer", whiteSpace: "nowrap" },
  linkLangRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 8 },
  linkLangLabel: { fontSize: 13, color: "#6B7280" },
  linkLangSelect: { fontSize: 14, padding: "6px 10px", borderRadius: 8, border: "1px solid #D1D5DB", background: "#fff", cursor: "pointer", fontFamily: "inherit" },
  earnBlock: { marginBottom: 10 },
  earnBig: { fontSize: 30, fontWeight: 800, color: "#16A34A", lineHeight: 1.1 },
  earnBigLabel: { fontSize: 12.5, color: "#6B7280", marginTop: 2, marginBottom: 14 },
  earnSplit: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, borderTop: "1px solid #F0F2F4", paddingTop: 12 },
  earnCell: { textAlign: "start" },
  earnValue: { fontSize: 17, fontWeight: 700, color: "#374151" },
  earnLabel: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  pendingNote: { fontSize: 12, color: "#9CA3AF", marginTop: 14 },
  ol: { margin: 0, paddingInlineStart: 20 },
  li: { fontSize: 14.5, lineHeight: 1.7, color: "#374151", marginBottom: 6 },
};

"use client";

import { useEffect, useState } from "react";

/**
 * Revenue dashboard. Reads /api/admin/revenue.
 *
 * Shows MRR/ARR, per-tier × billing-period breakdown, full active
 * subscriber list, at-risk subscriptions (past_due / unpaid /
 * incomplete), and recently-canceled customers.
 */

type AdminLang = "en" | "he";

const SECRET_KEY = "gadit_admin_secret_v1";
const ADMIN_LANG_KEY = "gadit_admin_lang_v1";

type Plan = "basic" | "clear" | "deep";

type Subscriber = {
  uid: string;
  email: string | null;
  plan: Plan;
  billing: "monthly" | "yearly" | "unknown";
  monthlyUsd: number;
  status: string;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  signedUpAt: string | null;
  stripeCustomerId: string | null;
  country: string | null;
};

type RevenueResponse = {
  generatedAt: string;
  summary: {
    mrrUsd: number;
    arrUsd: number;
    activeCount: number;
    atRiskCount: number;
    recentlyCanceledCount: number;
  };
  breakdown: {
    clearMonthly: { count: number; mrr: number };
    clearYearly:  { count: number; mrr: number };
    deepMonthly:  { count: number; mrr: number };
    deepYearly:   { count: number; mrr: number };
  };
  active: Subscriber[];
  atRisk: Subscriber[];
  recentlyCanceled: Subscriber[];
};

const STRINGS: Record<AdminLang, {
  title: string;
  loading: string;
  langToggle: string;
  unlockTitle: string;
  unlockBody: string;
  unlockCta: string;
  unlockPlaceholder: string;
  navOverview: string;
  navUsers: string;
  navRevenue: string;
  navCampaigns: string;
  navSearches: string;
  navReports: string;
  cardMRR: string;
  cardARR: string;
  cardActive: string;
  cardAtRisk: string;
  breakdownTitle: string;
  clearMonthly: string;
  clearYearly: string;
  deepMonthly: string;
  deepYearly: string;
  activeTitle: string;
  atRiskTitle: string;
  recentlyCanceledTitle: string;
  emptyActive: string;
  emptyAtRisk: string;
  emptyCanceled: string;
  colCustomer: string;
  colPlan: string;
  colBilling: string;
  colMRR: string;
  colStatus: string;
  colSignedUp: string;
  colStripe: string;
  openInStripe: string;
  billingMonthly: string;
  billingYearly: string;
  billingUnknown: string;
  willCancel: string;
}> = {
  en: {
    title: "Gadit · Revenue",
    loading: "Loading…",
    langToggle: "עברית",
    unlockTitle: "Admin · Revenue",
    unlockBody: "Enter ADMIN_SECRET to view revenue.",
    unlockCta: "Unlock",
    unlockPlaceholder: "ADMIN_SECRET",
    navOverview: "Overview",
    navUsers: "Users",
    navRevenue: "Revenue",
    navCampaigns: "Campaigns",
    navSearches: "Activity",
    navReports: "Reports",
    cardMRR: "Monthly recurring",
    cardARR: "Annual recurring",
    cardActive: "Active subscriptions",
    cardAtRisk: "At risk",
    breakdownTitle: "MRR breakdown",
    clearMonthly: "Clear · monthly",
    clearYearly:  "Clear · yearly",
    deepMonthly:  "Deep · monthly",
    deepYearly:   "Deep · yearly",
    activeTitle: "Active subscribers",
    atRiskTitle: "At-risk subscriptions",
    recentlyCanceledTitle: "Recently canceled (30 days)",
    emptyActive: "No active subscribers yet.",
    emptyAtRisk: "No at-risk subscriptions — clean books.",
    emptyCanceled: "No cancellations in the last 30 days.",
    colCustomer: "Customer",
    colPlan: "Plan",
    colBilling: "Billing",
    colMRR: "MRR",
    colStatus: "Status",
    colSignedUp: "Signed up",
    colStripe: "Stripe",
    openInStripe: "Open",
    billingMonthly: "Monthly",
    billingYearly: "Yearly",
    billingUnknown: "—",
    willCancel: "Cancels at period end",
  },
  he: {
    title: "Gadit · הכנסות",
    loading: "טוען…",
    langToggle: "English",
    unlockTitle: "ניהול · הכנסות",
    unlockBody: "הזן את ADMIN_SECRET כדי לצפות בהכנסות.",
    unlockCta: "פתח",
    unlockPlaceholder: "ADMIN_SECRET",
    navOverview: "סקירה",
    navUsers: "משתמשים",
    navRevenue: "הכנסות",
    navCampaigns: "קמפיינים",
    navSearches: "פעילות",
    navReports: "דיווחים",
    cardMRR: "הכנסה חודשית",
    cardARR: "הכנסה שנתית",
    cardActive: "מנויים פעילים",
    cardAtRisk: "בסיכון",
    breakdownTitle: "פירוט הכנסה חודשית",
    clearMonthly: "Clear · חודשי",
    clearYearly:  "Clear · שנתי",
    deepMonthly:  "Deep · חודשי",
    deepYearly:   "Deep · שנתי",
    activeTitle: "מנויים פעילים",
    atRiskTitle: "מנויים בסיכון",
    recentlyCanceledTitle: "בוטלו לאחרונה (30 ימים)",
    emptyActive: "עוד אין מנויים פעילים.",
    emptyAtRisk: "אין מנויים בסיכון — ספרים נקיים.",
    emptyCanceled: "אין ביטולים ב-30 הימים האחרונים.",
    colCustomer: "לקוח",
    colPlan: "מסלול",
    colBilling: "חיוב",
    colMRR: "MRR",
    colStatus: "סטטוס",
    colSignedUp: "נרשם",
    colStripe: "Stripe",
    openInStripe: "פתח",
    billingMonthly: "חודשי",
    billingYearly: "שנתי",
    billingUnknown: "—",
    willCancel: "מבוטל בסוף התקופה",
  },
};

function FlagImg({ iso2 }: { iso2: string }) {
  return (
    <img
      src={`https://flagcdn.com/40x30/${iso2.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/80x60/${iso2.toLowerCase()}.png 2x`}
      width={18}
      height={13}
      alt=""
      loading="lazy"
      style={{ borderRadius: 2, display: "inline-block", verticalAlign: "middle", boxShadow: "0 0 0 0.5px rgba(15,23,42,0.18)" }}
    />
  );
}

function planBadge(plan: Plan) {
  if (plan === "deep")  return { label: "Deep",  bg: "#EDE9FE", fg: "#5B21B6" };
  if (plan === "clear") return { label: "Clear", bg: "#CFFAFE", fg: "#0E7490" };
  return                       { label: "Basic", bg: "#F3F4F6", fg: "#4B5563" };
}

function formatDate(iso: string | null, lang: AdminLang): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  void lang;
  return `${dd}/${mm}/${yyyy}`;
}

export default function AdminRevenueClient() {
  const [secret, setSecret] = useState<string | null>(null);
  const [data, setData] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminLang, setAdminLang] = useState<AdminLang>("en");
  const t = STRINGS[adminLang];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(SECRET_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setSecret(stored);
    const storedLang = localStorage.getItem(ADMIN_LANG_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (storedLang === "he" || storedLang === "en") setAdminLang(storedLang);
  }, []);

  const toggleLang = () => {
    const next: AdminLang = adminLang === "en" ? "he" : "en";
    setAdminLang(next);
    if (typeof window !== "undefined") localStorage.setItem(ADMIN_LANG_KEY, next);
  };

  useEffect(() => {
    if (!secret) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetch(`/api/admin/revenue?secret=${encodeURIComponent(secret)}`)
      .then(async (r) => {
        if (r.status === 401) {
          localStorage.removeItem(SECRET_KEY);
          setSecret(null);
          throw new Error(adminLang === "he" ? "סיסמה שגויה." : "Wrong secret.");
        }
        if (!r.ok) {
          const j = (await r.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error ?? `HTTP ${r.status}`);
        }
        return r.json() as Promise<RevenueResponse>;
      })
      .then((j) => setData(j))
      .catch((e) => setError(String(e instanceof Error ? e.message : e)))
      .finally(() => setLoading(false));
  }, [secret, adminLang]);

  const handleSecretSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("secret") as HTMLInputElement | null;
    const value = input?.value.trim();
    if (!value) return;
    localStorage.setItem(SECRET_KEY, value);
    setSecret(value);
  };

  if (!secret) {
    return (
      <main
        dir={adminLang === "he" ? "rtl" : "ltr"}
        style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" }}
      >
        <form
          onSubmit={handleSecretSubmit}
          style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 28, maxWidth: 400, width: "100%", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <h1 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#111827" }}>{t.unlockTitle}</h1>
          <p style={{ margin: "0 0 16px", fontSize: 14, color: "#6B7280" }}>{t.unlockBody}</p>
          <input name="secret" type="password" placeholder={t.unlockPlaceholder} autoFocus style={inputStyle} />
          <button type="submit" style={buttonStyle}>{t.unlockCta}</button>
        </form>
      </main>
    );
  }

  return (
    <main
      dir={adminLang === "he" ? "rtl" : "ltr"}
      style={{ minHeight: "100vh", background: "#F9FAFB", padding: "24px 16px 64px", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
          <button onClick={toggleLang} style={{ ...buttonStyle, width: "auto", padding: "8px 16px", background: "#F3F4F6", color: "#374151" }}>
            {t.langToggle}
          </button>
        </div>

        <nav style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
          <NavLink href="/admin" label={t.navOverview} />
          <NavLink href="/admin/users" label={t.navUsers} />
          <NavLink href="/admin/revenue" label={t.navRevenue} active />
          <NavLink href="/admin/campaigns" label={t.navCampaigns} />
          <NavLink href="/admin/searches" label={t.navSearches} />
          <NavLink href="/admin/reports" label={t.navReports} />
        </nav>

        {loading && <div style={{ padding: 32, textAlign: "center", color: "#6B7280" }}>{t.loading}</div>}
        {error && (
          <div style={{ background: "#FEF2F2", color: "#991B1B", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        {data && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
              <BigCard label={t.cardMRR} value={`$${data.summary.mrrUsd.toFixed(2)}`} accent="#0EA5A5" />
              <BigCard label={t.cardARR} value={`$${data.summary.arrUsd.toFixed(2)}`} accent="#0E7490" />
              <BigCard label={t.cardActive} value={data.summary.activeCount} accent="#7C3AED" />
              <BigCard label={t.cardAtRisk} value={data.summary.atRiskCount} accent={data.summary.atRiskCount > 0 ? "#DC2626" : "#9CA3AF"} />
            </div>

            {/* Breakdown */}
            <div style={{ ...cardStyle, marginBottom: 24 }}>
              <div style={sectionTitleStyle}>{t.breakdownTitle}</div>
              <BreakdownRow label={t.clearMonthly} count={data.breakdown.clearMonthly.count} mrr={data.breakdown.clearMonthly.mrr} color="#0EA5A5" />
              <BreakdownRow label={t.clearYearly}  count={data.breakdown.clearYearly.count}  mrr={data.breakdown.clearYearly.mrr}  color="#0E7490" />
              <BreakdownRow label={t.deepMonthly}  count={data.breakdown.deepMonthly.count}  mrr={data.breakdown.deepMonthly.mrr}  color="#7C3AED" />
              <BreakdownRow label={t.deepYearly}   count={data.breakdown.deepYearly.count}   mrr={data.breakdown.deepYearly.mrr}   color="#5B21B6" />
            </div>

            {/* Active subscribers */}
            <SubscriberTable
              title={t.activeTitle}
              rows={data.active}
              empty={t.emptyActive}
              adminLang={adminLang}
              t={t}
            />

            {/* At-risk subscribers */}
            {data.atRisk.length > 0 && (
              <SubscriberTable
                title={t.atRiskTitle}
                rows={data.atRisk}
                empty={t.emptyAtRisk}
                adminLang={adminLang}
                t={t}
                accentColor="#DC2626"
              />
            )}

            {/* Recently canceled */}
            <SubscriberTable
              title={t.recentlyCanceledTitle}
              rows={data.recentlyCanceled}
              empty={t.emptyCanceled}
              adminLang={adminLang}
              t={t}
            />
          </>
        )}
      </div>
    </main>
  );
}

function SubscriberTable({
  title, rows, empty, adminLang, t, accentColor,
}: {
  title: string;
  rows: Subscriber[];
  empty: string;
  adminLang: AdminLang;
  t: (typeof STRINGS)["en"];
  accentColor?: string;
}) {
  return (
    <div style={{ ...cardStyle, marginBottom: 24 }}>
      <div style={{ ...sectionTitleStyle, color: accentColor ?? "#6B7280" }}>{title}</div>
      {rows.length === 0 ? (
        <div style={{ color: "#9CA3AF", fontSize: 13, padding: "12px 0" }}>{empty}</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                <Th>{t.colCustomer}</Th>
                <Th align="center">{t.colPlan}</Th>
                <Th align="center">{t.colBilling}</Th>
                <Th align="center">{t.colMRR}</Th>
                <Th align="center">{t.colStatus}</Th>
                <Th>{t.colSignedUp}</Th>
                <Th align="center">{t.colStripe}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const badge = planBadge(r.plan);
                const billingLabel =
                  r.billing === "monthly" ? t.billingMonthly :
                  r.billing === "yearly"  ? t.billingYearly :
                  t.billingUnknown;
                return (
                  <tr key={r.uid} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "10px 12px", textAlign: "start", color: "#111827" }}>
                      {r.email ?? "—"}
                      {r.country && (
                        <span style={{ marginInlineStart: 6, display: "inline-flex", verticalAlign: "middle" }}>
                          <FlagImg iso2={r.country} />
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span style={{ background: badge.bg, color: badge.fg, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center", color: "#374151" }}>{billingLabel}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center", color: "#111827", fontWeight: 600 }}>
                      {r.monthlyUsd > 0 ? `$${r.monthlyUsd.toFixed(2)}` : "—"}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span style={{ fontSize: 11, color: r.status === "active" || r.status === "trialing" ? "#0E7490" : "#DC2626", textTransform: "capitalize", fontWeight: 600 }}>
                        {r.status || "—"}
                      </span>
                      {r.cancelAtPeriodEnd && (
                        <div style={{ fontSize: 10, color: "#DC2626", marginTop: 2 }}>{t.willCancel}</div>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "start", color: "#6B7280", fontSize: 12 }}>
                      {formatDate(r.signedUpAt, adminLang)}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      {r.stripeCustomerId ? (
                        <a
                          href={`https://dashboard.stripe.com/customers/${r.stripeCustomerId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#7C3AED", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                        >
                          {t.openInStripe} ↗
                        </a>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <a
      href={href}
      style={{
        padding: "8px 14px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        textDecoration: "none",
        background: active ? "#111827" : "#FFFFFF",
        color: active ? "#FFFFFF" : "#374151",
        border: active ? "1px solid #111827" : "1px solid #E5E7EB",
      }}
    >
      {label}
    </a>
  );
}

function BigCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent ?? "#111827", lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function BreakdownRow({ label, count, mrr, color }: { label: string; count: number; mrr: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 999, background: color, marginInlineEnd: 10 }} />
      <span style={{ flex: 1, fontSize: 13, color: "#374151" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#6B7280", marginInlineEnd: 14 }}>{count}</span>
      <span style={{ fontSize: 14, color: "#111827", fontWeight: 600, minWidth: 70, textAlign: "end" }}>${mrr.toFixed(2)}</span>
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: "center" }) {
  return (
    <th style={{ padding: "10px 12px", textAlign: align ?? "start", color: "#6B7280", fontWeight: 600, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>
      {children}
    </th>
  );
}

const cardStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  padding: 16,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#6B7280",
  marginBottom: 12,
  letterSpacing: 0.5,
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #D1D5DB",
  fontSize: 14,
  marginBottom: 12,
  outline: "none",
  fontFamily: "inherit",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  background: "#0EA5A5",
  color: "white",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

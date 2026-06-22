"use client";

import { useEffect, useState } from "react";

/**
 * Campaign / UTM attribution dashboard. Reads /api/admin/campaigns.
 *
 * Shows: per-source rollup with conversion %, recent attributed signups
 * for spot-checking, and a clear visualization of how each campaign
 * contributes vs direct traffic.
 */

type AdminLang = "en" | "he";

const SECRET_KEY = "gadit_admin_secret_v1";
const ADMIN_LANG_KEY = "gadit_admin_lang_v1";

type Plan = "basic" | "clear" | "deep";

type SourceRow = {
  source: string;
  signups: number;
  paid: number;
  conversionPct: number;
  byMedium: Record<string, number>;
  byCampaign: Record<string, number>;
};

type AttributedSignup = {
  uid: string;
  email: string | null;
  createdAt: string | null;
  plan: Plan;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  landingPath: string | null;
  country: string | null;
};

type CampaignsResponse = {
  since: string;
  totals: { attributedSignups: number; directSignups: number; allSignups: number };
  sources: SourceRow[];
  recent: AttributedSignup[];
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
  cardAttributed: string;
  cardDirect: string;
  cardAll: string;
  sourcesTitle: string;
  colSource: string;
  colSignups: string;
  colPaid: string;
  colConversion: string;
  recentTitle: string;
  recentEmpty: string;
  colWhen: string;
  colWho: string;
  colSrc: string;
  colMedium: string;
  colCampaign: string;
  colPlan: string;
  sinceLabel: string;
}> = {
  en: {
    title: "Gadit · Campaigns",
    loading: "Loading…",
    langToggle: "עברית",
    unlockTitle: "Admin · Campaigns",
    unlockBody: "Enter ADMIN_SECRET to view campaign attribution.",
    unlockCta: "Unlock",
    unlockPlaceholder: "ADMIN_SECRET",
    navOverview: "Overview",
    navUsers: "Users",
    navRevenue: "Revenue",
    navCampaigns: "Campaigns",
    navSearches: "Activity",
    navReports: "Reports",
    cardAttributed: "Attributed signups",
    cardDirect: "Direct signups",
    cardAll: "All signups",
    sourcesTitle: "Signups by source",
    colSource: "Source",
    colSignups: "Signups",
    colPaid: "Paid",
    colConversion: "Conversion",
    recentTitle: "Recent attributed signups",
    recentEmpty: "No UTM-attributed signups yet — share a bio link and they'll appear here.",
    colWhen: "When",
    colWho: "Who",
    colSrc: "Source",
    colMedium: "Medium",
    colCampaign: "Campaign",
    colPlan: "Plan",
    sinceLabel: "Since",
  },
  he: {
    title: "Gadit · קמפיינים",
    loading: "טוען…",
    langToggle: "English",
    unlockTitle: "ניהול · קמפיינים",
    unlockBody: "הזן את ADMIN_SECRET כדי לצפות בייחוס קמפיינים.",
    unlockCta: "פתח",
    unlockPlaceholder: "ADMIN_SECRET",
    navOverview: "סקירה",
    navUsers: "משתמשים",
    navRevenue: "הכנסות",
    navCampaigns: "קמפיינים",
    navSearches: "פעילות",
    navReports: "דיווחים",
    cardAttributed: "הרשמות מיוחסות",
    cardDirect: "הרשמות ישירות",
    cardAll: "סך הרשמות",
    sourcesTitle: "הרשמות לפי מקור",
    colSource: "מקור",
    colSignups: "הרשמות",
    colPaid: "משלמים",
    colConversion: "המרה",
    recentTitle: "הרשמות מיוחסות אחרונות",
    recentEmpty: "עוד לא הגיעו הרשמות עם UTM. שתף קישור ביו והן יופיעו כאן.",
    colWhen: "מתי",
    colWho: "מי",
    colSrc: "מקור",
    colMedium: "Medium",
    colCampaign: "קמפיין",
    colPlan: "מסלול",
    sinceLabel: "מאז",
  },
};

const SOURCE_COLORS: Record<string, string> = {
  instagram: "#E1306C",
  facebook:  "#1877F2",
  tiktok:    "#111827",
  twitter:   "#1DA1F2",
  x:         "#111827",
  linkedin:  "#0A66C2",
  youtube:   "#FF0000",
  google:    "#34A853",
  direct:    "#9CA3AF",
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

function formatRelative(iso: string | null, lang: AdminLang): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (lang === "he") {
    if (diff < 3600_000) return `לפני ${Math.max(1, Math.floor(diff / 60_000))} דק'`;
    if (diff < 86_400_000) return `לפני ${Math.floor(diff / 3600_000)} שע'`;
    if (diff < 7 * 86_400_000) return `לפני ${Math.floor(diff / 86_400_000)} ימים`;
    return d.toLocaleDateString("he-IL", { day: "numeric", month: "short" });
  }
  if (diff < 3600_000) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export default function AdminCampaignsClient() {
  const [secret, setSecret] = useState<string | null>(null);
  const [data, setData] = useState<CampaignsResponse | null>(null);
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
    fetch(`/api/admin/campaigns?secret=${encodeURIComponent(secret)}`)
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
        return r.json() as Promise<CampaignsResponse>;
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
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
            {data && (
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                {t.sinceLabel} {new Date(data.since).toLocaleDateString(adminLang === "he" ? "he-IL" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            )}
          </div>
          <button onClick={toggleLang} style={{ ...buttonStyle, width: "auto", padding: "8px 16px", background: "#F3F4F6", color: "#374151" }}>
            {t.langToggle}
          </button>
        </div>

        <nav style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
          <NavLink href="/admin" label={t.navOverview} />
          <NavLink href="/admin/users" label={t.navUsers} />
          <NavLink href="/admin/revenue" label={t.navRevenue} />
          <NavLink href="/admin/campaigns" label={t.navCampaigns} active />
          <NavLink href="/admin/searches" label={t.navSearches} />
          <NavLink href="/admin/reports" label={t.navReports} />
        </nav>

        {loading && (
          <div style={{ padding: 32, textAlign: "center", color: "#6B7280" }}>{t.loading}</div>
        )}
        {error && (
          <div style={{ background: "#FEF2F2", color: "#991B1B", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        {data && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
              <BigCard label={t.cardAttributed} value={data.totals.attributedSignups} accent="#0EA5A5" />
              <BigCard label={t.cardDirect} value={data.totals.directSignups} accent="#9CA3AF" />
              <BigCard label={t.cardAll} value={data.totals.allSignups} accent="#111827" />
            </div>

            {/* Source breakdown */}
            <div style={{ ...cardStyle, marginBottom: 24 }}>
              <div style={sectionTitleStyle}>{t.sourcesTitle}</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                    <Th>{t.colSource}</Th>
                    <Th align="center">{t.colSignups}</Th>
                    <Th align="center">{t.colPaid}</Th>
                    <Th align="center">{t.colConversion}</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.sources.map((s) => {
                    const color = SOURCE_COLORS[s.source.toLowerCase()] ?? "#6B7280";
                    return (
                      <tr key={s.source} style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "10px 12px", textAlign: "start" }}>
                          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 999, background: color, marginInlineEnd: 8, verticalAlign: "middle" }} />
                          <span style={{ fontWeight: 500, color: "#111827", textTransform: "capitalize" }}>{s.source}</span>
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "center", color: "#374151", fontWeight: 600 }}>{s.signups}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center", color: s.paid > 0 ? "#0E7490" : "#9CA3AF", fontWeight: 600 }}>{s.paid}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center", color: "#111827" }}>
                          {s.signups > 0 ? `${s.conversionPct}%` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Recent attributed signups */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>{t.recentTitle}</div>
              {data.recent.length === 0 ? (
                <div style={{ color: "#9CA3AF", fontSize: 13, padding: "12px 0" }}>{t.recentEmpty}</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                        <Th>{t.colWhen}</Th>
                        <Th>{t.colWho}</Th>
                        <Th>{t.colSrc}</Th>
                        <Th>{t.colMedium}</Th>
                        <Th>{t.colCampaign}</Th>
                        <Th align="center">{t.colPlan}</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent.map((row) => {
                        const badge = planBadge(row.plan);
                        return (
                          <tr key={row.uid} style={{ borderBottom: "1px solid #F3F4F6" }}>
                            <td style={{ padding: "10px 12px", textAlign: "start", color: "#6B7280", fontSize: 12 }}>
                              {formatRelative(row.createdAt, adminLang)}
                            </td>
                            <td style={{ padding: "10px 12px", textAlign: "start", color: "#111827" }}>
                              {row.email ?? "—"}
                              {row.country && (
                                <span style={{ marginInlineStart: 6, display: "inline-flex", verticalAlign: "middle" }}>
                                  <FlagImg iso2={row.country} />
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "10px 12px", textAlign: "start", color: "#374151", textTransform: "capitalize" }}>{row.source ?? "—"}</td>
                            <td style={{ padding: "10px 12px", textAlign: "start", color: "#374151" }}>{row.medium ?? "—"}</td>
                            <td style={{ padding: "10px 12px", textAlign: "start", color: "#374151" }}>{row.campaign ?? "—"}</td>
                            <td style={{ padding: "10px 12px", textAlign: "center" }}>
                              <span style={{ background: badge.bg, color: badge.fg, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                                {badge.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
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

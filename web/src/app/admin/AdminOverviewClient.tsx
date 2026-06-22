"use client";

import { useEffect, useState } from "react";

/**
 * Admin overview dashboard — the morning-glance view.
 *
 * Reads /api/admin/overview which aggregates everything in one bulk
 * RPC pass: user counts, MRR, search activity, conversion funnel,
 * top words, top languages, top countries.
 *
 * Mirrors the gate + chrome of /admin/users so the two pages feel like
 * one product. The ADMIN_SECRET stored in localStorage is shared
 * across all admin pages — once unlocked here, /admin/users etc.
 * inherit the credential.
 */

type AdminLang = "en" | "he";

const SECRET_KEY = "gadit_admin_secret_v1";
const ADMIN_LANG_KEY = "gadit_admin_lang_v1";

type Overview = {
  generatedAt: string;
  users: {
    total: number;
    byPlan: { basic: number; clear: number; deep: number };
    signupsToday: number;
    signupsWeek: number;
    signupsMonth: number;
  };
  revenue: {
    mrrUsd: number;
    activeSubscriptions: number;
    arrUsd: number;
  };
  activity: {
    searchesToday: number;
    searchesWeek: number;
    searchesMonth: number;
    topWords: Array<{ word: string; lang: string; count: number }>;
    byLang: Array<{ lang: string; count: number }>;
  };
  funnel: {
    anonymousMonth: number;
    signedUpMonth: number;
    paidMonth: number;
    anonToSignup: number;
    signupToPaid: number;
  };
  geo: {
    topCountries: Array<{ code: string; count: number }>;
  };
};

const STRINGS: Record<AdminLang, {
  title: string;
  loading: string;
  signOut: string;
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
  cardActiveSubs: string;
  cardTotalUsers: string;
  cardSignupsWeek: string;
  cardSearchesToday: string;
  cardSignupsToday: string;
  perMonth: string;
  perYear: string;
  funnelTitle: string;
  funnelAnonymous: string;
  funnelSignedUp: string;
  funnelPaid: string;
  funnelAnonToSignup: string;
  funnelSignupToPaid: string;
  topWordsTitle: string;
  topLangsTitle: string;
  topCountriesTitle: string;
  planBasic: string;
  planClear: string;
  planDeep: string;
  noActivity: string;
  generatedAtLabel: string;
}> = {
  en: {
    title: "Gadit · Overview",
    loading: "Loading…",
    signOut: "Sign out",
    langToggle: "עברית",
    unlockTitle: "Admin · Overview",
    unlockBody: "Enter ADMIN_SECRET to view the overview dashboard.",
    unlockCta: "Unlock",
    unlockPlaceholder: "ADMIN_SECRET",
    navOverview: "Overview",
    navUsers: "Users",
    navRevenue: "Revenue",
    navCampaigns: "Campaigns",
    navSearches: "Activity",
    navReports: "Reports",
    cardMRR: "Monthly revenue",
    cardActiveSubs: "Active subscriptions",
    cardTotalUsers: "Total users",
    cardSignupsWeek: "Signups · 7 days",
    cardSearchesToday: "Searches today",
    cardSignupsToday: "Signups today",
    perMonth: "/mo",
    perYear: "≈ $%/yr",
    funnelTitle: "Conversion funnel · 30 days",
    funnelAnonymous: "Anonymous visitors who searched",
    funnelSignedUp: "Signed up",
    funnelPaid: "Paying customers",
    funnelAnonToSignup: "Anonymous → signup",
    funnelSignupToPaid: "Signup → paid",
    topWordsTitle: "Top searched words",
    topLangsTitle: "Searches by language",
    topCountriesTitle: "Top countries",
    planBasic: "Basic",
    planClear: "Clear",
    planDeep: "Deep",
    noActivity: "No activity yet",
    generatedAtLabel: "Updated",
  },
  he: {
    title: "Gadit · סקירה",
    loading: "טוען…",
    signOut: "יציאה",
    langToggle: "English",
    unlockTitle: "ניהול · סקירה",
    unlockBody: "הזן את ADMIN_SECRET כדי לצפות בלוח הסקירה.",
    unlockCta: "פתח",
    unlockPlaceholder: "ADMIN_SECRET",
    navOverview: "סקירה",
    navUsers: "משתמשים",
    navRevenue: "הכנסות",
    navCampaigns: "קמפיינים",
    navSearches: "פעילות",
    navReports: "דיווחים",
    cardMRR: "הכנסה חודשית",
    cardActiveSubs: "מנויים פעילים",
    cardTotalUsers: "סך משתמשים",
    cardSignupsWeek: "הרשמות · 7 ימים",
    cardSearchesToday: "חיפושים היום",
    cardSignupsToday: "הרשמות היום",
    perMonth: "/חודש",
    perYear: "≈ $%/שנה",
    funnelTitle: "משפך המרה · 30 ימים",
    funnelAnonymous: "אנונימיים שחיפשו",
    funnelSignedUp: "נרשמו",
    funnelPaid: "משלמים",
    funnelAnonToSignup: "אנונימי → רישום",
    funnelSignupToPaid: "רישום → תשלום",
    topWordsTitle: "מילים פופולריות",
    topLangsTitle: "חיפושים לפי שפה",
    topCountriesTitle: "מדינות מובילות",
    planBasic: "Basic",
    planClear: "Clear",
    planDeep: "Deep",
    noActivity: "אין פעילות עדיין",
    generatedAtLabel: "עודכן",
  },
};

const LANG_NAMES: Record<string, string> = {
  he: "עברית", en: "English", ar: "العربية", ru: "Русский",
  es: "Español", pt: "Português", fr: "Français", de: "Deutsch",
  cs: "Čeština", sk: "Slovenčina", it: "Italiano", ja: "日本語",
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

export default function AdminOverviewClient() {
  const [secret, setSecret] = useState<string | null>(null);
  const [data, setData] = useState<Overview | null>(null);
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
    fetch(`/api/admin/overview?secret=${encodeURIComponent(secret)}`)
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
        return r.json() as Promise<Overview>;
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

  // Secret gate
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
          <input
            name="secret"
            type="password"
            placeholder={t.unlockPlaceholder}
            autoFocus
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>{t.unlockCta}</button>
        </form>
      </main>
    );
  }

  const updatedTime = data ? new Date(data.generatedAt).toLocaleTimeString(adminLang === "he" ? "he-IL" : "en-GB", { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <main
      dir={adminLang === "he" ? "rtl" : "ltr"}
      style={{ minHeight: "100vh", background: "#F9FAFB", padding: "24px 16px 64px", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
            {data && (
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                {t.generatedAtLabel} · {updatedTime}
              </div>
            )}
          </div>
          <button onClick={toggleLang} style={{ ...buttonStyle, width: "auto", padding: "8px 16px", background: "#F3F4F6", color: "#374151" }}>
            {t.langToggle}
          </button>
        </div>

        {/* Sub-nav — links to other admin pages */}
        <nav style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
          <NavLink href="/admin" label={t.navOverview} active />
          <NavLink href="/admin/users" label={t.navUsers} />
          <NavLink href="/admin/revenue" label={t.navRevenue} />
          <NavLink href="/admin/campaigns" label={t.navCampaigns} />
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
            {/* Top-level KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
              <BigCard
                label={t.cardMRR}
                value={`$${data.revenue.mrrUsd.toFixed(2)}`}
                accent="#0EA5A5"
                sub={t.perYear.replace("%", data.revenue.arrUsd.toFixed(0))}
              />
              <BigCard
                label={t.cardActiveSubs}
                value={data.revenue.activeSubscriptions}
                accent="#7C3AED"
                sub={`${data.users.byPlan.clear} Clear · ${data.users.byPlan.deep} Deep`}
              />
              <BigCard
                label={t.cardTotalUsers}
                value={data.users.total}
                accent="#111827"
                sub={`+${data.users.signupsWeek} ${adminLang === "he" ? "השבוע" : "this week"}`}
              />
              <BigCard
                label={t.cardSignupsToday}
                value={data.users.signupsToday}
                accent="#0EA5A5"
              />
              <BigCard
                label={t.cardSignupsWeek}
                value={data.users.signupsWeek}
                accent="#0EA5A5"
              />
              <BigCard
                label={t.cardSearchesToday}
                value={data.activity.searchesToday}
                accent="#111827"
                sub={`${data.activity.searchesWeek} ${adminLang === "he" ? "השבוע" : "this week"}`}
              />
            </div>

            {/* Funnel + Top Words side-by-side on desktop, stacked on mobile */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {/* Funnel */}
              <div style={cardStyle}>
                <div style={sectionTitleStyle}>{t.funnelTitle}</div>
                <FunnelRow label={t.funnelAnonymous} value={data.funnel.anonymousMonth} color="#9CA3AF" max={Math.max(data.funnel.anonymousMonth, 1)} />
                <FunnelRow label={t.funnelSignedUp} value={data.funnel.signedUpMonth} color="#0EA5A5" max={Math.max(data.funnel.anonymousMonth, 1)} />
                <FunnelRow label={t.funnelPaid} value={data.funnel.paidMonth} color="#7C3AED" max={Math.max(data.funnel.anonymousMonth, 1)} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px dashed #E5E7EB" }}>
                  <span style={{ fontSize: 12, color: "#6B7280" }}>{t.funnelAnonToSignup}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{data.funnel.anonToSignup}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontSize: 12, color: "#6B7280" }}>{t.funnelSignupToPaid}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{data.funnel.signupToPaid}%</span>
                </div>
              </div>

              {/* Top languages */}
              <div style={cardStyle}>
                <div style={sectionTitleStyle}>{t.topLangsTitle}</div>
                {data.activity.byLang.length === 0 ? (
                  <div style={{ color: "#9CA3AF", fontSize: 13, padding: "12px 0" }}>{t.noActivity}</div>
                ) : (
                  <div>
                    {data.activity.byLang.slice(0, 8).map((row) => {
                      const max = data.activity.byLang[0].count;
                      const pct = (row.count / max) * 100;
                      return (
                        <div key={row.lang} style={{ marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 13, color: "#374151" }}>{LANG_NAMES[row.lang] ?? row.lang}</span>
                            <span style={{ fontSize: 13, color: "#6B7280" }}>{row.count}</span>
                          </div>
                          <div style={{ background: "#F3F4F6", borderRadius: 4, height: 6, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "#0EA5A5" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Top words full width */}
            <div style={{ ...cardStyle, marginBottom: 24 }}>
              <div style={sectionTitleStyle}>{t.topWordsTitle}</div>
              {data.activity.topWords.length === 0 ? (
                <div style={{ color: "#9CA3AF", fontSize: 13, padding: "12px 0" }}>{t.noActivity}</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                  {data.activity.topWords.map((w, i) => (
                    <div key={`${w.lang}_${w.word}_${i}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#F9FAFB", borderRadius: 6, fontSize: 13 }}>
                      <span>
                        <span style={{ color: "#9CA3AF", marginInlineEnd: 8 }}>#{i + 1}</span>
                        <span style={{ fontWeight: 500, color: "#111827" }}>{w.word}</span>
                        <span style={{ color: "#9CA3AF", marginInlineStart: 6, fontSize: 11 }}>{w.lang}</span>
                      </span>
                      <span style={{ color: "#6B7280", fontWeight: 600 }}>{w.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top countries */}
            {data.geo.topCountries.length > 0 && (
              <div style={cardStyle}>
                <div style={sectionTitleStyle}>{t.topCountriesTitle}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {data.geo.topCountries.map(({ code, count }) => (
                    <div key={code} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, border: "1px solid #E5E7EB", background: "#FFFFFF", fontSize: 13, color: "#374151" }}>
                      {code === "?" ? <span>🌐</span> : <FlagImg iso2={code} />}
                      <span style={{ fontWeight: 500 }}>{code}</span>
                      <span style={{ color: "#9CA3AF" }}>·</span>
                      <span style={{ color: "#6B7280" }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {label}
    </a>
  );
}

function BigCard({ label, value, accent, sub }: { label: string; value: string | number; accent?: string; sub?: string }) {
  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent ?? "#111827", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function FunnelRow({ label, value, color, max }: { label: string; value: number; color: string; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{value}</span>
      </div>
      <div style={{ background: "#F3F4F6", borderRadius: 4, height: 8, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color }} />
      </div>
    </div>
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

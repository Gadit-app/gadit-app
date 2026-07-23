"use client";

import { useEffect, useState } from "react";
import { useAdminContext } from "./admin-context";

/**
 * Admin overview dashboard — the morning-glance view.
 *
 * Reads /api/admin/overview which aggregates everything in one bulk
 * RPC pass: user counts, MRR, search activity, conversion funnel,
 * top words, top languages, top countries.
 *
 * The persistent sidebar + secret gate live in AdminShell (the parent
 * layout). This page just renders content + fetches its data.
 */

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
    compAccounts?: number;
    payingByTier?: { clear: number; deep: number; family: number; schools: number };
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

// Page titles deliberately mirror the sidebar nav labels word-for-word
// (Gadi 2026-06-22) — consistency cue that says "this is the page you
// clicked, in the same words". One source of truth would be cleaner but
// duplicating into each page's STRINGS keeps the per-page i18n dict
// self-contained.
const STRINGS = {
  en: {
    title: "Overview",
    loading: "Loading…",
    cardMRR: "Monthly revenue",
    cardActiveSubs: "Active subscriptions",
    cardTotalUsers: "Total users",
    cardSignupsWeek: "Signups · 7 days",
    cardSearchesToday: "Searches today",
    cardSignupsToday: "Signups today",
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
    noActivity: "No activity yet",
    generatedAtLabel: "Updated",
    thisWeek: "this week",
  },
  he: {
    title: "סקירה",
    loading: "טוען…",
    cardMRR: "הכנסה חודשית",
    cardActiveSubs: "מנויים פעילים",
    cardTotalUsers: "סך משתמשים",
    cardSignupsWeek: "הרשמות · 7 ימים",
    cardSearchesToday: "חיפושים היום",
    cardSignupsToday: "הרשמות היום",
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
    noActivity: "אין פעילות עדיין",
    generatedAtLabel: "עודכן",
    thisWeek: "השבוע",
  },
} as const;

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
  const { secret, lang } = useAdminContext();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = STRINGS[lang];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetch(`/api/admin/overview?secret=${encodeURIComponent(secret)}`)
      .then(async (r) => {
        if (!r.ok) {
          const j = (await r.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error ?? `HTTP ${r.status}`);
        }
        return r.json() as Promise<Overview>;
      })
      .then((j) => setData(j))
      .catch((e) => setError(String(e instanceof Error ? e.message : e)))
      .finally(() => setLoading(false));
  }, [secret]);

  const updatedTime = data ? new Date(data.generatedAt).toLocaleTimeString(lang === "he" ? "he-IL" : "en-GB", { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
        {data && (
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
            {t.generatedAtLabel} · {updatedTime}
          </div>
        )}
      </div>

      {loading && <div style={{ padding: 32, textAlign: "center", color: "#6B7280" }}>{t.loading}</div>}
      {error && (
        <div style={{ background: "#FEF2F2", color: "#991B1B", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {data && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
            <BigCard label={t.cardMRR} value={`$${data.revenue.mrrUsd.toFixed(2)}`} accent="#0EA5A5" sub={t.perYear.replace("%", data.revenue.arrUsd.toFixed(0))} />
            <BigCard label={t.cardActiveSubs} value={data.revenue.activeSubscriptions} accent="#7C3AED" sub={tierBreakdown(data.revenue.payingByTier)} subLtr />
            <BigCard label={t.cardTotalUsers} value={data.users.total} accent="#111827" sub={`+${data.users.signupsWeek} ${t.thisWeek}`} />
            <BigCard label={t.cardSignupsToday} value={data.users.signupsToday} accent="#0EA5A5" />
            <BigCard label={t.cardSignupsWeek} value={data.users.signupsWeek} accent="#0EA5A5" />
            <BigCard label={t.cardSearchesToday} value={data.activity.searchesToday} accent="#111827" sub={`${data.activity.searchesWeek} ${t.thisWeek}`} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
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
    </>
  );
}

// Paying subscribers by real tier, e.g. "3 Clear · 4 Family · 2 Deep".
// Only non-zero tiers, brand-order (Clear, Deep, Family, Schools). Labels
// stay Latin (brand rule), so the caller renders this LTR to avoid the
// numbers scrambling in the RTL admin.
function tierBreakdown(t?: { clear: number; deep: number; family: number; schools: number }): string {
  if (!t) return "";
  const parts: string[] = [];
  if (t.clear)   parts.push(`${t.clear} Clear`);
  if (t.deep)    parts.push(`${t.deep} Deep`);
  if (t.family)  parts.push(`${t.family} Family`);
  if (t.schools) parts.push(`${t.schools} Schools`);
  return parts.join(" · ");
}

function BigCard({ label, value, accent, sub, subLtr }: { label: string; value: string | number; accent?: string; sub?: string; subLtr?: boolean }) {
  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent ?? "#111827", lineHeight: 1 }}>{value}</div>
      {sub && <div dir={subLtr ? "ltr" : undefined} style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>{sub}</div>}
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

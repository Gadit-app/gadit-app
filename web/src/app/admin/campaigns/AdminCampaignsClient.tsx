"use client";

import { useEffect, useState } from "react";
import { useAdminContext } from "../admin-context";

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

const STRINGS = {
  en: {
    title: "Campaigns",
    loading: "Loading…",
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
    title: "קמפיינים",
    loading: "טוען…",
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
} as const;

const SOURCE_COLORS: Record<string, string> = {
  instagram: "#E1306C", facebook: "#1877F2", tiktok: "#111827",
  twitter: "#1DA1F2", x: "#111827", linkedin: "#0A66C2",
  youtube: "#FF0000", google: "#34A853", direct: "#9CA3AF",
};

function FlagImg({ iso2 }: { iso2: string }) {
  return (
    <img
      src={`https://flagcdn.com/40x30/${iso2.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/80x60/${iso2.toLowerCase()}.png 2x`}
      width={18} height={13} alt="" loading="lazy"
      style={{ borderRadius: 2, display: "inline-block", verticalAlign: "middle", boxShadow: "0 0 0 0.5px rgba(15,23,42,0.18)" }}
    />
  );
}

function planBadge(plan: Plan) {
  if (plan === "deep")  return { label: "Deep",  bg: "#EDE9FE", fg: "#5B21B6" };
  if (plan === "clear") return { label: "Clear", bg: "#CFFAFE", fg: "#0E7490" };
  return                       { label: "Basic", bg: "#F3F4F6", fg: "#4B5563" };
}

function formatRelative(iso: string | null, lang: "en" | "he"): string {
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
  const { secret, lang } = useAdminContext();
  const [data, setData] = useState<CampaignsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = STRINGS[lang];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetch(`/api/admin/campaigns?secret=${encodeURIComponent(secret)}`)
      .then(async (r) => {
        if (!r.ok) {
          const j = (await r.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error ?? `HTTP ${r.status}`);
        }
        return r.json() as Promise<CampaignsResponse>;
      })
      .then((j) => setData(j))
      .catch((e) => setError(String(e instanceof Error ? e.message : e)))
      .finally(() => setLoading(false));
  }, [secret]);

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
        {data && (
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
            {t.sinceLabel} {new Date(data.since).toLocaleDateString(lang === "he" ? "he-IL" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}
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
            <BigCard label={t.cardAttributed} value={data.totals.attributedSignups} accent="#0EA5A5" />
            <BigCard label={t.cardDirect} value={data.totals.directSignups} accent="#9CA3AF" />
            <BigCard label={t.cardAll} value={data.totals.allSignups} accent="#111827" />
          </div>

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
                          <td style={{ padding: "10px 12px", textAlign: "start", color: "#6B7280", fontSize: 12 }}>{formatRelative(row.createdAt, lang)}</td>
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
    </>
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

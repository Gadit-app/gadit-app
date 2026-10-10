"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminContext } from "../admin-context";
import type { LedgerResponse, LedgerSend, LedgerSeries, LedgerUserRow } from "@/lib/email-drip/ledger";

/**
 * /admin/emails — permanent email-delivery ledger.
 *
 * Renders what OUR Firestore records about every automated email: the
 * signup series, the Family, Individual and school series, and the one-off
 * reminders (login, trial, Play upgrade, Family welcome, payment problem),
 * independent of Resend's short log-retention window. Built 2026-07-08,
 * widened to every series 2026-10-10. Our own accounts are listed with an
 * "internal" badge and never counted.
 */

type Filter = "all" | LedgerSeries;
const SERIES_ORDER: LedgerSeries[] = ["signup", "family", "individual", "school", "reminders"];

const STRINGS = {
  en: {
    title: "Emails",
    sub: "Every email the system sent, from our own permanent ledger (not limited by Resend's retention window).",
    statUsers: "Users reached",
    statSends: "Total sends",
    stat7d: "Sends · 7 days",
    internalNote: (n: number) => `Our own accounts are not counted (${n} listed with an "internal" badge).`,
    seriesTitle: "SERIES",
    series: {
      signup: "Signup",
      family: "Family",
      individual: "Individual",
      school: "Schools",
      reminders: "Reminders",
    } as Record<LedgerSeries, string>,
    live: "Live",
    off: "Off",
    fromDate: (d: string) => `accounts from ${d}`,
    reached: "users",
    week: "7 days",
    total: "sends",
    lastSent: "last",
    all: "All",
    funnelTitle: "SIGNUP FUNNEL",
    funnelStep: "Step",
    funnelHe: "Hebrew",
    funnelEn: "English",
    funnelOther: "Other",
    funnelTotal: "Total",
    tableTitle: "PER USER",
    colEmail: "User",
    colLang: "Lang",
    colSends: "Emails",
    colNotified: "Signup alert",
    searchPlaceholder: "Filter by email…",
    loading: "Loading…",
    error: "Failed to load.",
    internal: "internal",
    internalTitle: "Our own account, not counted",
    skipped: "skipped",
    approx: "Approximate: dated from the grace window",
    noTime: "Sent (no time stamped)",
    empty: "No emails in this series yet.",
    legacy: "an older version of the series",
  },
  he: {
    title: "מיילים",
    sub: "כל מייל שהמערכת שלחה, מהרישום הקבוע שלנו (לא מוגבל בחלון השמירה של Resend).",
    statUsers: "משתמשים שקיבלו",
    statSends: "סך שליחות",
    stat7d: "שליחות · 7 ימים",
    internalNote: (n: number) => `החשבונות שלנו לא נספרים (${n} מופיעים עם תג "פנימי").`,
    seriesTitle: "סדרות",
    series: {
      signup: "הרשמה",
      family: "Family",
      individual: "Individual",
      school: "בתי ספר",
      reminders: "תזכורות",
    } as Record<LedgerSeries, string>,
    live: "פעילה",
    off: "כבויה",
    fromDate: (d: string) => `לחשבונות מ-${d}`,
    reached: "משתמשים",
    week: "7 ימים",
    total: "שליחות",
    lastSent: "אחרון",
    all: "הכל",
    funnelTitle: "משפך סדרת ההרשמה",
    funnelStep: "שלב",
    funnelHe: "עברית",
    funnelEn: "אנגלית",
    funnelOther: "אחרות",
    funnelTotal: 'סה"כ',
    tableTitle: "לפי משתמש",
    colEmail: "משתמש",
    colLang: "שפה",
    colSends: "מיילים",
    colNotified: "התראת הרשמה",
    searchPlaceholder: "סינון לפי אימייל…",
    loading: "טוען…",
    error: "הטעינה נכשלה.",
    internal: "פנימי",
    internalTitle: "חשבון שלנו, לא נספר",
    skipped: "דולג",
    approx: "משוער: לפי חלון החסד",
    noTime: "נשלח (בלי שעה רשומה)",
    empty: "עדיין לא נשלחו מיילים בסדרה הזו.",
    legacy: "גרסה קודמת של הסדרה",
  },
};

function fmtDate(iso: string | null | undefined, lang: "en" | "he"): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(lang === "he" ? "he-IL" : "en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" });
  } catch {
    return iso.slice(0, 10);
  }
}

function fmtFull(iso: string | null | undefined, lang: "en" | "he"): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(lang === "he" ? "he-IL" : "en-GB");
  } catch {
    return iso;
  }
}

const SERIES_COLOR: Record<LedgerSeries, { bg: string; fg: string }> = {
  signup: { bg: "#E0F6F4", fg: "#0E7490" },
  family: { bg: "#FCE7F3", fg: "#9D174D" },
  individual: { bg: "#EDE9FE", fg: "#5B21B6" },
  school: { bg: "#FEF3C7", fg: "#92400E" },
  reminders: { bg: "#F3F4F6", fg: "#374151" },
};

const pill: React.CSSProperties = { fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap" };

export function AdminEmailsClient() {
  const { secret, lang } = useAdminContext();
  const t = STRINGS[lang];
  const [data, setData] = useState<LedgerResponse | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/emails?secret=${encodeURIComponent(secret)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: LedgerResponse) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [secret]);

  const rows = useMemo(() => {
    if (!data) return [] as Array<{ u: LedgerUserRow; sends: LedgerSend[] }>;
    const q = query.trim().toLowerCase();
    const out: Array<{ u: LedgerUserRow; sends: LedgerSend[] }> = [];
    for (const u of data.users) {
      if (q && !(u.email ?? u.uid).toLowerCase().includes(q)) continue;
      const sends = filter === "all" ? u.sends : u.sends.filter((s) => s.series === filter);
      if (!sends.some((s) => !s.skipped)) continue;
      out.push({ u, sends });
    }
    return out;
  }, [data, query, filter]);

  if (error) return <div style={{ padding: 24, color: "#B91C1C" }}>{t.error}</div>;
  if (!data) return <div style={{ padding: 24, color: "#6B7280" }}>{t.loading}</div>;

  const label = (series: LedgerSeries, key: string) => data.labels[series]?.[key]?.[lang] ?? key;
  const seriesInfo = (s: LedgerSeries) => data.series.find((x) => x.id === s);

  const card: React.CSSProperties = { background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 };
  const capLabel: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: 0.5, textTransform: "uppercase" };
  const num: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

  const sendMark = (s: LedgerSend) =>
    s.skipped ? t.skipped : s.at ? `${s.approx ? "≈" : ""}${fmtDate(s.at, lang)}` : "✓";
  const sendTitle = (s: LedgerSend) =>
    [s.skipped ? t.skipped : s.at ? fmtFull(s.at, lang) : t.noTime, s.approx ? t.approx : "", s.lang ? s.lang : ""].filter(Boolean).join(" · ");

  const langsOf = (sends: LedgerSend[]) => Array.from(new Set(sends.filter((s) => !s.skipped && s.lang).map((s) => s.lang as string)));

  const activeSeries = filter === "all" ? null : seriesInfo(filter);
  const columns = activeSeries ? activeSeries.order : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{t.title}</h1>
        <p style={{ fontSize: 13.5, color: "#6B7280", marginTop: 4 }}>{t.sub}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        {[
          { l: t.statUsers, v: data.counts.usersWithEmails },
          { l: t.statSends, v: data.counts.totalSends },
          { l: t.stat7d, v: data.counts.sentLast7Days },
        ].map((s) => (
          <div key={s.l} style={{ ...card, textAlign: "center" }}>
            <div style={capLabel}>{s.l}</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4, ...num }}>{s.v.toLocaleString()}</div>
          </div>
        ))}
      </div>
      {data.counts.internalUsers > 0 && (
        <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: -10 }}>{t.internalNote(data.counts.internalUsers)}</div>
      )}

      {/* Series summary: one card per series, click to filter */}
      <div>
        <div style={{ ...capLabel, marginBottom: 8 }}>{t.seriesTitle}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
          {SERIES_ORDER.map((id) => {
            const s = seriesInfo(id);
            if (!s) return null;
            const c = SERIES_COLOR[id];
            const on = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(on ? "all" : id)}
                style={{
                  ...card,
                  padding: 14,
                  textAlign: "start",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  border: on ? `2px solid ${c.fg}` : "1px solid #E5E7EB",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                  <span style={{ ...pill, background: c.bg, color: c.fg, fontSize: 12 }}>{t.series[id]}</span>
                  <span
                    title={s.from ? t.fromDate(s.from) : undefined}
                    style={{ ...pill, background: s.live ? "#DCFCE7" : "#FEE2E2", color: s.live ? "#166534" : "#991B1B" }}
                  >
                    {s.live ? t.live : t.off}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 10, alignItems: "baseline" }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, ...num }}>{s.usersReached}</div>
                    <div style={{ fontSize: 11.5, color: "#6B7280" }}>{t.reached}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, ...num, color: s.sends7d ? "#059669" : "#9CA3AF" }}>{s.sends7d}</div>
                    <div style={{ fontSize: 11.5, color: "#6B7280" }}>{t.week}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, ...num, color: "#4B5563" }}>{s.sends}</div>
                    <div style={{ fontSize: 11.5, color: "#6B7280" }}>{t.total}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 6, minHeight: 15 }}>
                  {s.lastSentAt ? `${t.lastSent}: ${fmtDate(s.lastSentAt, lang)}` : ""}
                  {s.from ? `${s.lastSentAt ? " · " : ""}${t.fromDate(s.from)}` : ""}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Signup funnel, every language */}
      {(filter === "all" || filter === "signup") && (
        <div style={card}>
          <div style={{ ...capLabel, marginBottom: 12 }}>{t.funnelTitle}</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ color: "#6B7280" }}>
                  <th style={{ textAlign: "start", padding: "6px 8px" }}>{t.funnelStep}</th>
                  <th style={{ textAlign: "center", padding: "6px 8px" }}>{t.funnelHe}</th>
                  <th style={{ textAlign: "center", padding: "6px 8px" }}>{t.funnelEn}</th>
                  <th style={{ textAlign: "center", padding: "6px 8px" }}>{t.funnelOther}</th>
                  <th style={{ textAlign: "center", padding: "6px 8px" }}>{t.funnelTotal}</th>
                </tr>
              </thead>
              <tbody>
                {data.counts.funnel.map((row) => {
                  const other = data.counts.perKey.signup?.[row.step]?.byLang ?? {};
                  const otherTitle = Object.entries(other)
                    .filter(([l]) => l !== "he" && l !== "en")
                    .map(([l, n]) => `${l}: ${n}`)
                    .join(", ");
                  return (
                    <tr key={row.step} style={{ borderTop: "1px solid #F3F4F6" }}>
                      <td style={{ padding: 8 }}>{label("signup", row.step)}</td>
                      <td style={{ textAlign: "center", padding: 8, ...num }}>{row.he}</td>
                      <td style={{ textAlign: "center", padding: 8, ...num }}>{row.en}</td>
                      <td style={{ textAlign: "center", padding: 8, ...num }} title={otherTitle}>{row.other}</td>
                      <td style={{ textAlign: "center", padding: 8, fontWeight: 600, ...num }}>{row.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Per-user table */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={capLabel}>{t.tableTitle}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["all", ...SERIES_ORDER] as Filter[]).map((f) => {
              const on = filter === f;
              const c = f === "all" ? { bg: "#0EA5A5", fg: "#0EA5A5" } : SERIES_COLOR[f];
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 999,
                    cursor: "pointer",
                    fontSize: 12.5,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    border: "none",
                    background: on ? c.fg : "#F3F4F6",
                    color: on ? "#fff" : "#374151",
                  }}
                >
                  {f === "all" ? t.all : t.series[f]}
                </button>
              );
            })}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 13.5, minWidth: 220 }}
          />
        </div>
        {rows.length === 0 ? (
          <div style={{ padding: 16, color: "#9CA3AF", fontSize: 13.5 }}>{t.empty}</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ color: "#6B7280", verticalAlign: "bottom" }}>
                  <th style={{ textAlign: "start", padding: "6px 8px" }}>{t.colEmail}</th>
                  <th style={{ textAlign: "center", padding: "6px 8px" }}>{t.colLang}</th>
                  {activeSeries ? (
                    columns.map((k) => (
                      <th key={k} style={{ textAlign: "center", padding: "6px 6px", fontSize: 11.5, fontWeight: 600, minWidth: 74, maxWidth: 120, color: activeSeries.legacy.includes(k) ? "#B0B7C3" : undefined, background: activeSeries.legacy.includes(k) ? "#FAFAFA" : undefined }} title={activeSeries.legacy.includes(k) ? `${label(activeSeries.id, k)} (${t.legacy})` : label(activeSeries.id, k)}>
                        <div style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{label(activeSeries.id, k)}</div>
                        <div style={{ color: "#9CA3AF", fontWeight: 500, ...num }}>{data.counts.perKey[activeSeries.id]?.[k]?.total ?? 0}</div>
                      </th>
                    ))
                  ) : (
                    <th style={{ textAlign: "start", padding: "6px 8px" }}>{t.colSends}</th>
                  )}
                  {(filter === "all" || filter === "signup") && <th style={{ textAlign: "center", padding: "6px 8px" }}>{t.colNotified}</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ u, sends }) => (
                  <tr key={u.uid} style={{ borderTop: "1px solid #F3F4F6", opacity: u.internal ? 0.75 : 1 }}>
                    <td style={{ padding: 8, textAlign: "start", whiteSpace: "nowrap" }}>
                      <span dir="ltr">{u.email ?? u.uid.slice(0, 10)}</span>
                      {u.internal && (
                        <span title={t.internalTitle} style={{ ...pill, background: "#EEF2FF", color: "#4338CA", marginInlineStart: 6 }}>
                          {t.internal}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "center", padding: 8 }}>
                      {langsOf(sends).length ? (
                        <span style={{ display: "inline-flex", gap: 4 }}>
                          {langsOf(sends).map((l) => (
                            <span key={l} style={{ ...pill, background: l === "he" ? "#E0F6F4" : "#F3F4F6", color: l === "he" ? "#0E7490" : "#4B5563" }}>
                              {l.toUpperCase()}
                            </span>
                          ))}
                        </span>
                      ) : (
                        "·"
                      )}
                    </td>
                    {activeSeries ? (
                      columns.map((k) => {
                        const s = sends.find((x) => x.key === k);
                        return (
                          <td
                            key={k}
                            title={s ? sendTitle(s) : ""}
                            style={{ textAlign: "center", padding: 8, color: !s ? "#D1D5DB" : s.skipped ? "#9CA3AF" : "#059669", fontSize: s?.skipped ? 11.5 : 13, ...num }}
                          >
                            {s ? sendMark(s) : "·"}
                          </td>
                        );
                      })
                    ) : (
                      <td style={{ padding: 8 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {sends
                            .filter((s) => !s.skipped)
                            .map((s) => {
                              const c = SERIES_COLOR[s.series];
                              return (
                                <span key={`${s.series}:${s.rawKey}`} title={`${t.series[s.series]} · ${sendTitle(s)}`} style={{ ...pill, fontWeight: 600, background: c.bg, color: c.fg }}>
                                  {label(s.series, s.key)} · <span style={num}>{sendMark(s)}</span>
                                </span>
                              );
                            })}
                        </div>
                      </td>
                    )}
                    {(filter === "all" || filter === "signup") && (
                      <td style={{ textAlign: "center", padding: 8, color: u.notifiedSignupAt ? "#059669" : "#D1D5DB" }}>{u.notifiedSignupAt ? "✓" : "·"}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

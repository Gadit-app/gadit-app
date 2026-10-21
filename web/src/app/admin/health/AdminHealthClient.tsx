"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminContext, type AdminLang } from "../admin-context";

/**
 * Subscriber health (Gadi 2026-10-21): every paying or trialing subscriber in
 * four segments by last usage, a short "needs attention" strip, and one
 * table filterable by segment and sortable by next charge. Data from
 * /api/admin/health (lib/admin-health.ts), cached there for 10 minutes.
 */

type Segment = "A" | "B" | "C" | "D";
type Kind = "family" | "individual" | "schools" | "legacy";

type Row = {
  uid: string;
  email: string | null;
  name: string | null;
  kind: Kind;
  status: string;
  kids: number;
  members: number;
  memberAccounts: number;
  c7: number;
  c30: number;
  searchesEver: number;
  notebook: number;
  lastUseMs: number | null;
  daysSinceUse: number | null;
  lastSeenMs: number | null;
  segment: Segment;
  nextChargeMs: number | null;
  endsMs: number | null;
  amount: number | null;
  currency: string | null;
  billing: "monthly" | "yearly" | null;
  monthlyUsd: number;
  cancelAtPeriodEnd: boolean;
  hasCard: boolean | null;
  paused: boolean;
  utmCampaign: string | null;
  signupMs: number | null;
  signupDays: number | null;
  stripeCustomerId: string | null;
};

type SegSummary = { count: number; paying: number; trialing: number; payingMonthlyUsd: number; trialMonthlyUsd: number; share: number };

type Report = {
  generatedAt: string;
  cached?: boolean;
  fx: { ilsPerUsd: number; source: "live" | "fallback" };
  total: number;
  segments: Record<Segment, SegSummary>;
  rows: Row[];
};

const SEGMENTS: Segment[] = ["A", "B", "C", "D"];
const DAY = 86_400_000;

const SEG_COLOR: Record<Segment, { fg: string; bg: string; bar: string }> = {
  A: { fg: "#166534", bg: "#DCFCE7", bar: "#16A34A" },
  B: { fg: "#92400E", bg: "#FEF3C7", bar: "#F59E0B" },
  C: { fg: "#9A3412", bg: "#FFEDD5", bar: "#EA580C" },
  D: { fg: "#991B1B", bg: "#FEE2E2", bar: "#DC2626" },
};

const STRINGS = {
  en: {
    title: "Subscriber health",
    intro: (n: number) => `${n} subscribers, paying and in trial. A family counts once, the owner with every member.`,
    loading: "Loading…",
    refresh: "Refresh",
    updated: "Updated",
    fromCache: "saved copy, refresh for live",
    fx: (r: number, live: boolean) => `Rate: $1 = ₪${r.toFixed(2)}${live ? "" : " (fixed fallback)"}`,
    seg: { A: "Active", B: "Fading", C: "Dormant", D: "Never used" } as Record<Segment, string>,
    segHint: { A: "Used in the last 7 days", B: "Last use 8 to 30 days ago", C: "Used before, nothing for 30+ days", D: "No searches and an empty notebook" } as Record<Segment, string>,
    payingTrial: (p: number, t: number) => `${p} paying · ${t} in trial`,
    perMonth: "a month",
    plusTrial: (v: string) => `+${v} in trial`,
    ofAll: "of subscribers",
    attnTitle: "Needs attention",
    attnCharge: "Paying, not using, charged within 14 days",
    attnTrial: "Trial never used, ends within 7 days",
    attnNoKids: "Family with no child profile",
    attnNone: "Nothing here right now",
    all: "All",
    colUser: "Subscriber",
    colPlan: "Plan",
    colStatus: "Status",
    colKids: "Kids",
    colSearches: "Searches 7d / 30d",
    colNotebook: "Notebook",
    colLastUse: "Days since use",
    colNext: "Next charge",
    colSource: "Source",
    colAge: "Signed up",
    never: "never",
    today: "today",
    noCharge: "none",
    inDays: (n: number) => (n <= 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`),
    days: (n: number) => `${n} days`,
    ends: "ends",
    cancels: "Cancels",
    noCard: "No card",
    paused: "Paused",
    ever: (n: number) => `${n} ever`,
    status: { active: "Paying", trialing: "Trial", past_due: "Payment failed" } as Record<string, string>,
    kind: { family: "Family", individual: "Individual", schools: "Schools", legacy: "Legacy" } as Record<Kind, string>,
    monthly: "month",
    yearly: "year",
    empty: "No subscribers in this segment",
    sortHint: "Sort by next charge",
  },
  he: {
    title: "בריאות מנויים",
    intro: (n: number) => `${n} מנויים, משלמים ובניסיון. משפחה נספרת פעם אחת, ההורה עם כל בני המשפחה.`,
    loading: "טוען…",
    refresh: "רענון",
    updated: "עודכן",
    fromCache: "עותק שמור, רענון לנתונים חיים",
    fx: (r: number, live: boolean) => `שער: ‎$1 = ₪${r.toFixed(2)}${live ? "" : " (שער קבוע לגיבוי)"}`,
    seg: { A: "פעילים", B: "דועכים", C: "רדומים", D: "אף פעם לא השתמשו" } as Record<Segment, string>,
    segHint: { A: "השתמשו ב-7 הימים האחרונים", B: "שימוש אחרון לפני 8 עד 30 ימים", C: "השתמשו בעבר, כלום כבר 30 ימים ומעלה", D: "אף חיפוש ומחברת ריקה" } as Record<Segment, string>,
    payingTrial: (p: number, t: number) => `${p} משלמים · ${t} בניסיון`,
    perMonth: "לחודש",
    plusTrial: (v: string) => `ועוד ${v} בניסיון`,
    ofAll: "מהמנויים",
    attnTitle: "דורש תשומת לב",
    attnCharge: "משלמים שלא משתמשים, חיוב ב-14 הימים הקרובים",
    attnTrial: "ניסיון בלי שום שימוש, מסתיים ב-7 הימים הקרובים",
    attnNoKids: "משפחה בלי פרופיל ילד",
    attnNone: "אין כרגע",
    all: "הכל",
    colUser: "מנוי",
    colPlan: "מסלול",
    colStatus: "סטטוס",
    colKids: "ילדים",
    colSearches: "חיפושים 7 / 30 ימים",
    colNotebook: "מחברת",
    colLastUse: "ימים מאז שימוש",
    colNext: "חיוב הבא",
    colSource: "מקור",
    colAge: "ותק",
    never: "אף פעם",
    today: "היום",
    noCharge: "אין",
    inDays: (n: number) => (n <= 0 ? "היום" : n === 1 ? "מחר" : `בעוד ${n} ימים`),
    days: (n: number) => `${n} ימים`,
    ends: "מסתיים",
    cancels: "מבטל",
    noCard: "ללא כרטיס",
    paused: "מושהה",
    ever: (n: number) => `${n} מאז ומעולם`,
    status: { active: "משלם", trialing: "ניסיון", past_due: "חיוב נכשל" } as Record<string, string>,
    kind: { family: "Family", individual: "Individual", schools: "בתי ספר", legacy: "מסלול ישן" } as Record<Kind, string>,
    monthly: "חודש",
    yearly: "שנה",
    empty: "אין מנויים בקבוצה הזו",
    sortHint: "מיון לפי חיוב הבא",
  },
} as const;

type T = (typeof STRINGS)[AdminLang];

const KIND_BADGE: Record<Kind, { bg: string; fg: string }> = {
  family: { bg: "#DCFCE7", fg: "#166534" },
  individual: { bg: "#EDE9FE", fg: "#5B21B6" },
  schools: { bg: "#FEF3C7", fg: "#92400E" },
  legacy: { bg: "#F3F4F6", fg: "#374151" },
};

function fmtDate(ms: number | null): string {
  if (!ms) return "";
  const d = new Date(ms);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function fmtMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase(), maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${amount} ${currency.toUpperCase()}`;
  }
}

const usd = (n: number) => `$${n.toFixed(2)}`;

export default function AdminHealthClient() {
  const { secret, lang } = useAdminContext();
  const t = STRINGS[lang];
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Segment | "all">("all");
  const [sortAsc, setSortAsc] = useState(true);

  // setState only inside the promise callbacks, so the first load can run
  // from the effect without a synchronous render cascade.
  const run = useCallback((fresh: boolean) => {
    fetch(`/api/admin/health?secret=${encodeURIComponent(secret)}${fresh ? "&fresh=1" : ""}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) {
          const j = (await r.json().catch(() => null)) as { error?: string; details?: string } | null;
          throw new Error(j?.details ?? j?.error ?? `HTTP ${r.status}`);
        }
        return r.json() as Promise<Report>;
      })
      .then((j) => { setData(j); setError(null); })
      .catch((e) => setError(String(e instanceof Error ? e.message : e)))
      .finally(() => setLoading(false));
  }, [secret]);

  useEffect(() => { run(false); }, [run]);

  const refresh = () => { setLoading(true); setError(null); run(true); };

  const now = data ? Date.parse(data.generatedAt) : 0;

  const attention = useMemo(() => {
    if (!data) return { charge: [] as Row[], trial: [] as Row[], noKids: [] as Row[] };
    const within = (ms: number | null, days: number) => ms != null && ms - now <= days * DAY && ms >= now - DAY;
    return {
      charge: data.rows.filter((r) => (r.status === "active" || r.status === "past_due") && (r.segment === "C" || r.segment === "D") && within(r.nextChargeMs, 14)),
      trial: data.rows.filter((r) => r.status === "trialing" && r.segment === "D" && within(r.nextChargeMs, 7)),
      noKids: data.rows.filter((r) => r.kind === "family" && r.kids === 0),
    };
  }, [data, now]);

  const rows = useMemo(() => {
    if (!data) return [];
    const list = tab === "all" ? data.rows.slice() : data.rows.filter((r) => r.segment === tab);
    const key = (r: Row) => r.nextChargeMs ?? r.endsMs;
    list.sort((a, b) => {
      const ka = key(a), kb = key(b);
      if (ka == null && kb == null) return 0;
      if (ka == null) return 1;
      if (kb == null) return -1;
      return sortAsc ? ka - kb : kb - ka;
    });
    return list;
  }, [data, tab, sortAsc]);

  return (
    <>
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {data && (
            <span style={{ fontSize: 12.5, color: "#9CA3AF" }}>
              {t.updated} {new Date(data.generatedAt).toLocaleTimeString(lang === "he" ? "he-IL" : "en-US", { hour: "2-digit", minute: "2-digit" })}
              {data.cached ? ` · ${t.fromCache}` : ""}
            </span>
          )}
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "1px solid #D1D5DB", background: "#fff", color: "#374151", fontWeight: 700, fontSize: 14, cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "inherit" }}
          >
            <IconRefresh />
            {loading ? "…" : t.refresh}
          </button>
        </div>
      </div>
      {data && (
        <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>
          {t.intro(data.total)} <span style={{ color: "#9CA3AF" }}>{t.fx(data.fx.ilsPerUsd, data.fx.source === "live")}</span>
        </div>
      )}

      {loading && !data && <div style={{ padding: 32, textAlign: "center", color: "#6B7280" }}>{t.loading}</div>}
      {error && <div style={{ background: "#FEF2F2", color: "#991B1B", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}

      {data && (
        <>
          {/* 1. Segment cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, marginBottom: 20 }}>
            {SEGMENTS.map((s) => {
              const g = data.segments[s];
              const c = SEG_COLOR[s];
              const on = tab === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTab(on ? "all" : s)}
                  style={{ textAlign: "start", background: "white", border: `1px solid ${on ? c.bar : "#E5E7EB"}`, borderTop: `4px solid ${c.bar}`, borderRadius: 12, padding: 16, cursor: "pointer", fontFamily: "inherit", boxShadow: on ? `0 0 0 2px ${c.bg}` : "none" }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: c.fg }}>{t.seg[s]}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: c.fg, background: c.bg, borderRadius: 999, padding: "2px 8px" }}>{g.share}% {t.ofAll}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 2 }}>{t.segHint[s]}</div>
                  <div style={{ fontSize: 34, fontWeight: 700, color: "#111827", lineHeight: 1.1, marginTop: 10 }}>{g.count}</div>
                  <div style={{ fontSize: 12.5, color: "#4B5563", marginTop: 4 }}>{t.payingTrial(g.paying, g.trialing)}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginTop: 8 }}>
                    {usd(g.payingMonthlyUsd)} <span style={{ fontSize: 12, fontWeight: 500, color: "#6B7280" }}>{t.perMonth}</span>
                  </div>
                  {g.trialMonthlyUsd > 0 && <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 2 }}>{t.plusTrial(usd(g.trialMonthlyUsd))}</div>}
                </button>
              );
            })}
          </div>

          {/* 2. Needs attention */}
          <div style={{ ...cardStyle, marginBottom: 20, borderInlineStart: "4px solid #DC2626" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ color: "#DC2626", display: "inline-flex" }}><IconAlert /></span>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>{t.attnTitle}</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              <AttnList title={t.attnCharge} rows={attention.charge} t={t} detail={(r) => `${t.seg[r.segment]} · ${t.colNext} ${t.inDays(Math.ceil(((r.nextChargeMs ?? now) - now) / DAY))}`} />
              <AttnList title={t.attnTrial} rows={attention.trial} t={t} detail={(r) => `${t.ends} ${t.inDays(Math.ceil(((r.nextChargeMs ?? now) - now) / DAY))}${r.hasCard === false ? ` · ${t.noCard}` : ""}`} />
              <AttnList title={t.attnNoKids} rows={attention.noKids} t={t} detail={(r) => `${t.status[r.status] ?? r.status} · ${t.seg[r.segment]}`} />
            </div>
          </div>

          {/* 3. Table */}
          <div style={cardStyle}>
            <nav style={{ display: "flex", gap: 4, flexWrap: "wrap", borderBottom: "1px solid #E5E7EB", marginBottom: 12 }}>
              {(["all", ...SEGMENTS] as const).map((k) => {
                const on = tab === k;
                const n = k === "all" ? data.total : data.segments[k].count;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setTab(k)}
                    style={{ padding: "8px 14px", fontSize: 14, fontWeight: on ? 700 : 600, color: on ? "#0F6F6C" : "#6B7280", background: "transparent", border: "none", borderBottom: `2px solid ${on ? "#0EA5A5" : "transparent"}`, marginBottom: -1, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {k === "all" ? t.all : t.seg[k]} <span style={{ color: "#9CA3AF", fontWeight: 600 }}>{n}</span>
                  </button>
                );
              })}
            </nav>
            {rows.length === 0 ? (
              <div style={{ color: "#9CA3AF", fontSize: 13, padding: "12px 0" }}>{t.empty}</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <Th>{t.colUser}</Th>
                      <Th>{t.colPlan}</Th>
                      <Th>{t.colStatus}</Th>
                      <Th center>{t.colKids}</Th>
                      <Th center>{t.colSearches}</Th>
                      <Th center>{t.colNotebook}</Th>
                      <Th center>{t.colLastUse}</Th>
                      <Th>
                        <button type="button" onClick={() => setSortAsc((v) => !v)} title={t.sortHint} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "transparent", border: "none", padding: 0, cursor: "pointer", font: "inherit", color: "#0F6F6C", letterSpacing: "inherit", textTransform: "inherit" }}>
                          {t.colNext}
                          <IconSort asc={sortAsc} />
                        </button>
                      </Th>
                      <Th>{t.colSource}</Th>
                      <Th center>{t.colAge}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => <HealthTableRow key={r.uid} r={r} t={t} now={now} />)}
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

function HealthTableRow({ r, t, now }: { r: Row; t: T; now: number }) {
  const seg = SEG_COLOR[r.segment];
  const kb = KIND_BADGE[r.kind];
  const statusColor = r.status === "past_due" ? "#DC2626" : r.status === "trialing" ? "#0891B2" : "#0E7490";
  const cell: React.CSSProperties = { padding: "10px 12px", textAlign: "start", verticalAlign: "top", color: "#374151" };
  const center: React.CSSProperties = { ...cell, textAlign: "center" };
  const when = r.nextChargeMs ?? r.endsMs;
  return (
    <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
      <td style={{ ...cell, borderInlineStart: `3px solid ${seg.bar}` }}>
        <div style={{ color: "#111827", fontWeight: 600, direction: "ltr", textAlign: "start", unicodeBidi: "plaintext" }}>{r.email ?? r.uid}</div>
        {r.name && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{r.name}</div>}
      </td>
      <td style={cell}>
        <span style={{ background: kb.bg, color: kb.fg, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{t.kind[r.kind]}</span>
      </td>
      <td style={cell}>
        <div style={{ fontSize: 12, fontWeight: 600, color: statusColor, whiteSpace: "nowrap" }}>{t.status[r.status] ?? r.status}</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 3 }}>
          {r.cancelAtPeriodEnd && <Badge bg="#FEE2E2" fg="#991B1B">{t.cancels}</Badge>}
          {r.status === "trialing" && r.hasCard === false && <Badge bg="#FEF3C7" fg="#92400E">{t.noCard}</Badge>}
          {r.paused && <Badge bg="#F3F4F6" fg="#374151">{t.paused}</Badge>}
        </div>
      </td>
      <td style={{ ...center, color: r.kind === "family" && r.kids === 0 ? "#DC2626" : "#374151", fontWeight: r.kind === "family" && r.kids === 0 ? 700 : 400 }}>
        {r.kind === "family" ? r.kids : ""}
      </td>
      <td style={center}>
        <span style={{ fontWeight: 600, color: "#111827" }}>{r.c7}</span>
        <span style={{ color: "#9CA3AF" }}> / </span>
        <span>{r.c30}</span>
        {r.searchesEver > 0 && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{t.ever(r.searchesEver)}</div>}
      </td>
      <td style={center}>{r.notebook}</td>
      <td style={center}>
        <span style={{ background: seg.bg, color: seg.fg, padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
          {r.daysSinceUse == null ? t.never : r.daysSinceUse === 0 ? t.today : r.daysSinceUse}
        </span>
      </td>
      <td style={{ ...cell, whiteSpace: "nowrap" }}>
        {when ? (
          <>
            <div style={{ color: r.cancelAtPeriodEnd ? "#9CA3AF" : "#111827", fontWeight: 600 }}>
              {r.cancelAtPeriodEnd ? `${t.ends} ` : ""}{fmtDate(when)}
            </div>
            <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>
              {t.inDays(Math.ceil((when - now) / DAY))}
              {r.amount != null && r.currency && !r.cancelAtPeriodEnd && (
                <>
                  {" · "}
                  {r.stripeCustomerId ? (
                    <a href={`https://dashboard.stripe.com/customers/${r.stripeCustomerId}`} target="_blank" rel="noopener noreferrer" style={{ color: "#6D28D9", fontWeight: 600, textDecoration: "none", direction: "ltr", unicodeBidi: "isolate" }}>
                      {fmtMoney(r.amount, r.currency)}
                    </a>
                  ) : (
                    <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>{fmtMoney(r.amount, r.currency)}</span>
                  )}
                  {r.billing ? ` / ${r.billing === "yearly" ? t.yearly : t.monthly}` : ""}
                </>
              )}
            </div>
          </>
        ) : (
          <span style={{ color: "#9CA3AF" }}>{t.noCharge}</span>
        )}
      </td>
      <td style={{ ...cell, fontSize: 12, color: "#6B7280", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.utmCampaign ?? ""}>
        {r.utmCampaign ?? ""}
      </td>
      <td style={{ ...center, fontSize: 12, color: "#6B7280", whiteSpace: "nowrap" }} title={fmtDate(r.signupMs)}>
        {r.signupDays != null ? t.days(r.signupDays) : ""}
      </td>
    </tr>
  );
}

function AttnList({ title, rows, t, detail }: { title: string; rows: Row[]; t: T; detail: (r: Row) => string }) {
  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
        {title} <span style={{ color: rows.length ? "#DC2626" : "#9CA3AF" }}>({rows.length})</span>
      </div>
      {rows.length === 0 ? (
        <div style={{ fontSize: 12.5, color: "#9CA3AF" }}>{t.attnNone}</div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4, maxHeight: 220, overflowY: "auto" }}>
          {rows.map((r) => (
            <li key={r.uid} style={{ fontSize: 12.5, lineHeight: 1.35, padding: "4px 0", borderBottom: "1px solid #F3F4F6" }}>
              <div style={{ color: "#111827", fontWeight: 600, direction: "ltr", textAlign: "start", unicodeBidi: "plaintext", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.email ?? r.uid}
              </div>
              <div style={{ color: "#6B7280" }}>{r.name ? `${r.name} · ` : ""}{detail(r)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Badge({ children, bg, fg }: { children: React.ReactNode; bg: string; fg: string }) {
  return <span style={{ background: bg, color: fg, padding: "1px 6px", borderRadius: 4, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>{children}</span>;
}

function Th({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <th style={{ padding: "10px 12px", textAlign: center ? "center" : "start", color: "#6B7280", fontWeight: 600, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {children}
    </th>
  );
}

function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/></svg>
  );
}
function IconAlert() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
  );
}
function IconSort({ asc }: { asc: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {asc ? <polyline points="6 15 12 9 18 15" /> : <polyline points="6 9 12 15 18 9" />}
    </svg>
  );
}

const cardStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  padding: 16,
};

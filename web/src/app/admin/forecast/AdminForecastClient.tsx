"use client";

import { useEffect, useState } from "react";
import { useAdminContext } from "../admin-context";

type Money = Record<string, number>;
type DayItem = { kind: "conversion" | "renewal" | "retry"; amount: number; currency: string; email: string | null; tier: string };
type Day = { date: string; conversions: Money; renewals: Money; retries: Money; count: number; items: DayItem[] };
type Forecast = {
  generatedAt: string; tz: string;
  counts: { subscriptions: number; upcomingCharges: number };
  next7: { conversions: Money; renewals: Money };
  next30: { conversions: Money; renewals: Money };
  next90: { conversions: Money; renewals: Money };
  days: Day[];
};

const SYM: Record<string, string> = { usd: "$", ils: "₪", eur: "€", gbp: "£" };
function money(m: Money): string {
  const parts = Object.entries(m).filter(([, v]) => v > 0.005).map(([c, v]) => `${SYM[c] ?? ""}${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}${SYM[c] ? "" : " " + c.toUpperCase()}`);
  return parts.length ? parts.join("  ·  ") : "—";
}
function sumMoney(...ms: Money[]): Money {
  const out: Money = {};
  for (const m of ms) for (const [c, v] of Object.entries(m)) out[c] = (out[c] ?? 0) + v;
  return out;
}

const COPY = {
  en: {
    title: "Cash flow", sub: "What lands in your account, and when — live from Stripe.",
    loading: "Loading…", win7: "Next 7 days", win30: "Next 30 days", win90: "Next 90 days",
    conversions: "New (trials converting)", renewals: "Renewals", total: "Total incoming",
    colDate: "Date", colWhat: "What", colIn: "Incoming", conv: "conversion", renew: "renewal", retry: "retry",
    today: "Today", tomorrow: "Tomorrow", note: (n: number, s: number) => `${n} upcoming charges across ${s} subscriptions.`,
  },
  he: {
    title: "תזרים עתידי", sub: "כמה כסף נכנס לחשבון, ומתי — חי מ-Stripe.",
    loading: "טוען…", win7: "7 ימים קדימה", win30: "30 יום קדימה", win90: "90 יום קדימה",
    conversions: "חדש (ניסיונות שממירים)", renewals: "חידושים", total: "סך נכנס",
    colDate: "תאריך", colWhat: "מה", colIn: "נכנס", conv: "המרה", renew: "חידוש", retry: "ניסיון חוזר",
    today: "היום", tomorrow: "מחר", note: (n: number, s: number) => `${n} חיובים צפויים מתוך ${s} מנויים.`,
  },
};

export default function AdminForecastClient() {
  const { secret, lang } = useAdminContext();
  const t = COPY[lang];
  const dir = lang === "he" ? "rtl" : "ltr";
  const [data, setData] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/admin/forecast?secret=${encodeURIComponent(secret)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => null))?.error ?? `HTTP ${r.status}`);
        return r.json() as Promise<Forecast>;
      })
      .then(setData)
      .catch((e) => setError(String(e instanceof Error ? e.message : e)))
      .finally(() => setLoading(false));
  }, [secret]);

  const todayKey = data ? data.days.find(() => true) && new Intl.DateTimeFormat("en-CA", { timeZone: data.tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()) : "";

  return (
    <div dir={dir}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
        <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }}>
          {loading ? t.loading : data ? `${t.sub} · ${t.note(data.counts.upcomingCharges, data.counts.subscriptions)}` : t.sub}
        </p>
      </div>

      {error && <div style={{ background: "#FEF2F2", color: "#991B1B", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}

      {data && (
        <>
          {/* Rolling window cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 26 }}>
            {([["win7", data.next7], ["win30", data.next30], ["win90", data.next90]] as const).map(([k, w]) => (
              <div key={k} style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>{t[k]}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#0E7490" }}>{money(sumMoney(w.conversions, w.renewals))}</div>
                <div style={{ marginTop: 10, fontSize: 13, color: "#374151", display: "flex", flexDirection: "column", gap: 3 }}>
                  <span><span style={{ color: "#16A34A", fontWeight: 700 }}>↑</span> {t.conversions}: <b>{money(w.conversions)}</b></span>
                  <span style={{ color: "#6B7280" }}>↻ {t.renewals}: <b>{money(w.renewals)}</b></span>
                </div>
              </div>
            ))}
          </div>

          {/* Daily forecast */}
          <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#F9FAFB" }}>
                <tr>
                  <th style={th}>{t.colDate}</th>
                  <th style={th}>{t.colWhat}</th>
                  <th style={{ ...th, textAlign: "end" }}>{t.colIn}</th>
                </tr>
              </thead>
              <tbody>
                {data.days.map((d) => {
                  const isOpen = open === d.date;
                  const total = sumMoney(d.conversions, d.renewals, d.retries);
                  const nConv = d.items.filter((i) => i.kind === "conversion").length;
                  const nRenew = d.items.filter((i) => i.kind !== "conversion").length;
                  return (
                    <FragmentRow
                      key={d.date}
                      d={d} isOpen={isOpen} total={total} nConv={nConv} nRenew={nRenew} t={t} dir={dir}
                      isToday={d.date === todayKey}
                      onToggle={() => setOpen(isOpen ? null : d.date)}
                    />
                  );
                })}
                {data.days.length === 0 && (
                  <tr><td colSpan={3} style={{ ...td, textAlign: "center", color: "#9CA3AF" }}>—</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function FragmentRow({ d, isOpen, total, nConv, nRenew, t, dir, isToday, onToggle }: {
  d: Day; isOpen: boolean; total: Money; nConv: number; nRenew: number;
  t: typeof COPY["en"]; dir: string; isToday: boolean; onToggle: () => void;
}) {
  const kindColor = { conversion: "#16A34A", renewal: "#6B7280", retry: "#DC2626" } as const;
  const kindLabel = { conversion: t.conv, renewal: t.renew, retry: t.retry } as const;
  return (
    <>
      <tr onClick={onToggle} style={{ borderTop: "1px solid #F3F4F6", cursor: "pointer", background: isToday ? "#ECFEFF" : undefined }}>
        <td style={{ ...td, fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>
          {isToday ? `${t.today} · ` : ""}{d.date}
        </td>
        <td style={{ ...td, color: "#6B7280", fontSize: 13 }}>
          {nConv > 0 && <span style={{ color: "#16A34A", fontWeight: 600 }}>{nConv} {t.conv}{nConv > 1 ? "s" : ""}</span>}
          {nConv > 0 && nRenew > 0 && " · "}
          {nRenew > 0 && <span>{nRenew} {t.renew}{nRenew > 1 ? "s" : ""}</span>}
          <span style={{ marginInlineStart: 8, color: "#9CA3AF" }}>{isOpen ? "▲" : "▼"}</span>
        </td>
        <td style={{ ...td, textAlign: "end", fontWeight: 800, color: "#0E7490", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{money(total)}</td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={3} style={{ padding: "0 16px 12px", background: "#FAFAFA" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 8 }}>
              {d.items.map((i, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, padding: "3px 0" }} dir={dir}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: kindColor[i.kind], minWidth: 74 }}>{kindLabel[i.kind]}</span>
                  <span style={{ color: "#374151", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }} dir="ltr">{i.email || "—"}</span>
                  <span style={{ color: "#9CA3AF", fontSize: 12 }}>{i.tier}</span>
                  <span style={{ fontWeight: 700, color: "#0E7490", fontVariantNumeric: "tabular-nums" }} dir="ltr">{money({ [i.currency]: i.amount })}</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const th: React.CSSProperties = { padding: "10px 16px", textAlign: "start", fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: 0.5, textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "12px 16px", fontSize: 14, textAlign: "start" };

"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminContext } from "../admin-context";

/**
 * /admin/partners — run the in-house partner (affiliate) program.
 *
 * Lists every partner with clicks / signups / paying customers and an
 * earnings breakdown by currency. The payable balance is each currency's
 * `released` bucket (held 30 days, not yet paid). Per-partner actions:
 * promote to founder, suspend, and "mark paid" (the monthly payout).
 */

type Bucket = { pending: number; released: number; paid: number };
type Row = {
  id: string;
  code: string;
  name: string;
  email: string;
  tier: "standard" | "founder";
  status: "active" | "suspended";
  clicks: number;
  signups: number;
  payingCustomers: number;
  commissionCount: number;
  earnings: Record<string, Bucket>;
  dashboardUrl: string;
  createdAt: string;
};

const T = {
  en: {
    title: "Partners",
    sub: "In-house affiliate program. Payable = released earnings held 30 days, not yet paid.",
    none: "No partners yet.",
    loading: "Loading…",
    partner: "Partner",
    tier: "Tier",
    funnel: "Clicks / Signups / Paying",
    payable: "Payable (owed)",
    pending: "Pending",
    paidTotal: "Paid to date",
    actions: "Actions",
    standard: "Standard",
    founder: "Founder",
    promote: "Make founder",
    demote: "Make standard",
    suspend: "Suspend",
    activate: "Activate",
    markPaid: "Mark payable as paid",
    copyDash: "Copy dashboard link",
    copied: "Copied ✓",
    confirmPaid: "Mark all released (payable) commissions as PAID for this partner? This is the record that you've sent the money.",
    suspended: "Suspended",
  },
  he: {
    title: "שותפים",
    sub: "תוכנית שותפים עצמאית. לתשלום = רווחים ששוחררו אחרי 30 יום ועדיין לא שולמו.",
    none: "עדיין אין שותפים.",
    loading: "טוען…",
    partner: "שותף",
    tier: "דרגה",
    funnel: "קליקים / נרשמו / משלמים",
    payable: "לתשלום (חוב)",
    pending: "בהמתנה",
    paidTotal: "שולם עד היום",
    actions: "פעולות",
    standard: "רגיל",
    founder: "מייסד",
    promote: "הפוך למייסד",
    demote: "הפוך לרגיל",
    suspend: "השהה",
    activate: "הפעל",
    markPaid: "סמן חוב כשולם",
    copyDash: "העתק קישור דשבורד",
    copied: "הועתק ✓",
    confirmPaid: "לסמן את כל העמלות ששוחררו (לתשלום) של השותף הזה כשולמו? זה התיעוד שהעברת את הכסף.",
    suspended: "מושהה",
  },
};

const CUR_SYMBOL: Record<string, string> = { ils: "₪", usd: "$", eur: "€", gbp: "£" };
function money(minor: number, currency: string): string {
  const sym = CUR_SYMBOL[currency] ?? currency.toUpperCase() + " ";
  return `${sym}${(minor / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function sumBuckets(e: Record<string, Bucket>, key: keyof Bucket): { cur: string; val: number }[] {
  return Object.entries(e)
    .map(([cur, b]) => ({ cur, val: b[key] }))
    .filter((x) => x.val > 0);
}

export default function AdminPartnersClient() {
  const { secret, lang } = useAdminContext();
  const t = T[lang];
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/partners?secret=${encodeURIComponent(secret)}`);
    if (res.ok) {
      const d = await res.json();
      setRows(d.partners ?? []);
    }
  }, [secret]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(partnerId: string, action: string) {
    if (action === "markPaid" && !window.confirm(t.confirmPaid)) return;
    setBusy(partnerId + action);
    try {
      await fetch(`/api/admin/partners?secret=${encodeURIComponent(secret)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId, action }),
      });
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function copyDash(row: Row) {
    try {
      await navigator.clipboard.writeText(row.dashboardUrl);
      setCopiedId(row.id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch { /* ignore */ }
  }

  return (
    <div>
      <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: "#111827" }}>{t.title}</h1>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6B7280" }}>{t.sub}</p>

      {rows === null && <div style={{ color: "#6B7280" }}>{t.loading}</div>}
      {rows !== null && rows.length === 0 && <div style={{ color: "#6B7280" }}>{t.none}</div>}

      {rows !== null && rows.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map((r) => {
            const payable = sumBuckets(r.earnings, "released");
            const pending = sumBuckets(r.earnings, "pending");
            const paid = sumBuckets(r.earnings, "paid");
            return (
              <div key={r.id} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{r.name || r.email}</span>
                      <span style={{ ...pill, ...(r.tier === "founder" ? pillFounder : pillStd) }}>
                        {r.tier === "founder" ? t.founder : t.standard}
                      </span>
                      {r.status === "suspended" && <span style={{ ...pill, background: "#FEE2E2", color: "#991B1B" }}>{t.suspended}</span>}
                      <span style={{ ...pill, background: "#F3F4F6", color: "#374151", direction: "ltr" }}>{r.code}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 4 }}>{r.email}</div>
                  </div>
                  <div style={{ textAlign: "end" }}>
                    <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4 }}>{t.funnel}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", direction: "ltr" }}>
                      {r.clicks} / {r.signups} / {r.payingCustomers}
                    </div>
                  </div>
                </div>

                {/* Money row */}
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 12, paddingTop: 12, borderTop: "1px solid #F3F4F6" }}>
                  <Money label={t.payable} items={payable} strong />
                  <Money label={t.pending} items={pending} />
                  <Money label={t.paidTotal} items={paid} />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                  {payable.length > 0 && (
                    <button style={btnPrimary} disabled={busy === r.id + "markPaid"} onClick={() => act(r.id, "markPaid")}>
                      {t.markPaid}
                    </button>
                  )}
                  {r.tier === "standard"
                    ? <button style={btn} onClick={() => act(r.id, "promote")}>{t.promote}</button>
                    : <button style={btn} onClick={() => act(r.id, "demote")}>{t.demote}</button>}
                  {r.status === "active"
                    ? <button style={btn} onClick={() => act(r.id, "suspend")}>{t.suspend}</button>
                    : <button style={btn} onClick={() => act(r.id, "activate")}>{t.activate}</button>}
                  <button style={btn} onClick={() => copyDash(r)}>{copiedId === r.id ? t.copied : t.copyDash}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Money({ label, items, strong }: { label: string; items: { cur: string; val: number }[]; strong?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: strong ? 18 : 15, fontWeight: strong ? 800 : 600, color: strong ? "#0EA5A5" : "#374151", direction: "ltr", textAlign: "start" }}>
        {items.length === 0 ? "—" : items.map((x) => money(x.val, x.cur)).join(" · ")}
      </div>
    </div>
  );
}

const card: React.CSSProperties = { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 18 };
const pill: React.CSSProperties = { fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999 };
const pillStd: React.CSSProperties = { background: "rgba(14,165,165,0.12)", color: "#0b7d7d" };
const pillFounder: React.CSSProperties = { background: "rgba(124,58,237,0.12)", color: "#6D28D9" };
const btn: React.CSSProperties = { background: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const btnPrimary: React.CSSProperties = { background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" };

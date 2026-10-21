"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * "התחילו ולא סיימו" (Gadi 2026-10-21): people who opened /checkout and
 * left before entering a card, live from Stripe, with the recovery emails
 * each one got (lib/checkout-recovery.ts). A phone, when we have one, opens
 * WhatsApp.
 */

type Row = {
  subId: string;
  customerId: string | null;
  uid: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  plan: "family" | "individual" | "other";
  lang: string;
  createdAt: string;
  ageHours: number;
  internal: boolean;
  blocked: string | null;
  e1At: number | null;
  e2At: number | null;
  e3At: number | null;
  nextStep: 1 | 2 | 3 | null;
};

const S = {
  he: {
    title: "התחילו ולא סיימו",
    sub: "פתחו את דף התשלום ולא הזינו כרטיס. מתעדכן מ-Stripe.",
    off: "מיילי ההחזרה כבויים (emailConfig/checkoutRecovery.enabled). שום מייל לא נשלח.",
    on: "מיילי ההחזרה פעילים.",
    empty: "אין כרגע הרשמות פתוחות.",
    colWho: "מי", colPlan: "מסלול", colWhen: "מתי", colMails: "מיילים", colPhone: "טלפון",
    ago: (h: number) => (h < 1 ? "פחות משעה" : h < 48 ? `לפני ${Math.round(h)} שעות` : `לפני ${Math.round(h / 24)} ימים`),
    none: "עוד לא נשלח",
    next: (n: number) => `הבא: מייל ${n}`,
    internal: "שלנו",
    blocked: { unsubscribed: "הסירו את עצמם", suppressed: "כתובת חסומה", no_email: "אין מייל", internal: "חשבון שלנו" } as Record<string, string>,
    load: "טוען…",
  },
  en: {
    title: "Started and didn't finish",
    sub: "Opened the payment page and never entered a card. Live from Stripe.",
    off: "Recovery emails are OFF (emailConfig/checkoutRecovery.enabled). Nothing is sent.",
    on: "Recovery emails are ON.",
    empty: "No open signups right now.",
    colWho: "Who", colPlan: "Plan", colWhen: "When", colMails: "Emails", colPhone: "Phone",
    ago: (h: number) => (h < 1 ? "under an hour" : h < 48 ? `${Math.round(h)}h ago` : `${Math.round(h / 24)} days ago`),
    none: "none yet",
    next: (n: number) => `next: email ${n}`,
    internal: "ours",
    blocked: { unsubscribed: "unsubscribed", suppressed: "address blocked", no_email: "no email", internal: "our account" } as Record<string, string>,
    load: "Loading…",
  },
};

const PLAN_BADGE: Record<Row["plan"], { label: string; bg: string; fg: string }> = {
  family: { label: "Family", bg: "#DCFCE7", fg: "#166534" },
  individual: { label: "Individual", bg: "#EDE9FE", fg: "#5B21B6" },
  other: { label: "Clear/Deep", bg: "#F3F4F6", fg: "#374151" },
};

function waLink(phone: string): string {
  let d = phone.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("0")) d = "972" + d.slice(1); // a local Israeli number
  return `https://wa.me/${d}`;
}

function shortDate(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AbandonedCheckouts({ secret, lang }: { secret: string; lang: "he" | "en" }) {
  const t = S[lang];
  const [data, setData] = useState<{ enabled: boolean; count: number; rows: Row[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch(`/api/admin/checkout-recovery?secret=${encodeURIComponent(secret)}`, { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error ?? `HTTP ${r.status}`);
        setData(j);
        setError(null);
      })
      .catch((e) => setError(String(e instanceof Error ? e.message : e)));
  }, [secret]);

  useEffect(() => { load(); }, [load]);

  const cell: React.CSSProperties = { padding: "10px 12px", textAlign: "start", verticalAlign: "top", fontSize: 13 };
  const th: React.CSSProperties = { padding: "10px 12px", textAlign: "start", color: "#6B7280", fontWeight: 600, fontSize: 11, letterSpacing: 0.5 };

  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{t.title}</div>
        {data && <span style={{ fontSize: 13, fontWeight: 700, color: "#B45309" }}>{data.count}</span>}
      </div>
      <div style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 10 }}>{t.sub}</div>
      {data && (
        <div style={{ fontSize: 12.5, marginBottom: 12, padding: "6px 10px", borderRadius: 8, display: "inline-block", background: data.enabled ? "#ECFDF5" : "#FFF7ED", color: data.enabled ? "#0E7A52" : "#9A3412" }}>
          {data.enabled ? t.on : t.off}
        </div>
      )}
      {error && <div style={{ color: "#991B1B", fontSize: 13 }}>{error}</div>}
      {!data && !error && <div style={{ color: "#9CA3AF", fontSize: 13 }}>{t.load}</div>}
      {data && data.rows.length === 0 && <div style={{ color: "#9CA3AF", fontSize: 13, padding: "8px 0" }}>{t.empty}</div>}
      {data && data.rows.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                <th style={th}>{t.colWho}</th>
                <th style={th}>{t.colPlan}</th>
                <th style={th}>{t.colWhen}</th>
                <th style={th}>{t.colMails}</th>
                <th style={th}>{t.colPhone}</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => {
                const b = PLAN_BADGE[r.plan];
                const sent = ([[1, r.e1At], [2, r.e2At], [3, r.e3At]] as const).filter(([, at]) => !!at);
                return (
                  <tr key={r.subId} style={{ borderBottom: "1px solid #F3F4F6", opacity: r.internal ? 0.6 : 1 }}>
                    <td style={cell}>
                      <div style={{ fontWeight: 600, color: "#111827" }}><bdi>{r.name || ", "}</bdi>{r.internal && <span style={{ marginInlineStart: 6, fontSize: 11, color: "#6D28D9" }}>{t.internal}</span>}</div>
                      <div style={{ color: "#6B7280", fontSize: 12 }} dir="ltr">{r.email ?? ", "}</div>
                    </td>
                    <td style={cell}>
                      <span style={{ background: b.bg, color: b.fg, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{b.label}</span>
                    </td>
                    <td style={{ ...cell, color: "#374151" }}>
                      {t.ago(r.ageHours)}
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>{shortDate(Date.parse(r.createdAt))}</div>
                    </td>
                    <td style={{ ...cell, color: "#374151" }}>
                      {sent.length ? sent.map(([n, at]) => <div key={n}>{`E${n} · ${shortDate(at as number)}`}</div>) : <span style={{ color: "#9CA3AF" }}>{t.none}</span>}
                      {r.blocked ? (
                        <div style={{ fontSize: 11, color: "#B45309" }}>{t.blocked[r.blocked] ?? r.blocked}</div>
                      ) : r.nextStep ? (
                        <div style={{ fontSize: 11, color: "#0E7490" }}>{t.next(r.nextStep)}</div>
                      ) : null}
                    </td>
                    <td style={cell}>
                      {r.phone ? (
                        <a href={waLink(r.phone)} target="_blank" rel="noopener noreferrer" dir="ltr" style={{ color: "#0E7490", fontWeight: 600, textDecoration: "none" }}>{r.phone}</a>
                      ) : <span style={{ color: "#9CA3AF" }}>, </span>}
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

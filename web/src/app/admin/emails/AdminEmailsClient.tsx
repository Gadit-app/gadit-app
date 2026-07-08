"use client";

import { useEffect, useState } from "react";
import { useAdminContext } from "../admin-context";

/**
 * /admin/emails — permanent email-delivery ledger.
 *
 * Renders what OUR Firestore records about every email the system
 * sent (drip sequence stamps + signup notification), independent of
 * Resend's short log-retention window. Built 2026-07-08 ahead of the
 * marketing campaign so Gadi can answer "who got which email and
 * when" at any point in the future.
 */

const DRIP_STEPS = ["welcome", "meanings", "etymology", "visual", "summary"] as const;
type DripStep = (typeof DRIP_STEPS)[number];

type EmailUserRow = {
  uid: string;
  email: string | null;
  createdAt: string | null;
  dripLang: "he" | "en" | null;
  sent: Record<string, string>;
  notifiedSignupAt: string | null;
};

type EmailsResponse = {
  counts: {
    usersWithEmails: number;
    totalSends: number;
    sentLast7Days: number;
    perKey: Record<string, number>;
    funnel: Array<{ step: string; he: number; en: number; total: number }>;
  };
  users: EmailUserRow[];
};

const STRINGS = {
  en: {
    title: "Emails",
    sub: "Every email the system sent, from our own permanent ledger (not limited by Resend's retention window).",
    statUsers: "Users reached",
    statSends: "Total sends",
    stat7d: "Sends · 7 days",
    funnelTitle: "DRIP FUNNEL",
    funnelStep: "Step",
    funnelHe: "Hebrew",
    funnelEn: "English",
    funnelTotal: "Total",
    tableTitle: "PER USER",
    colEmail: "User",
    colLang: "Drip",
    colNotified: "Signup alert",
    searchPlaceholder: "Filter by email…",
    loading: "Loading…",
    error: "Failed to load.",
    stepLabels: {
      welcome: "Welcome (day 0)",
      meanings: "Meanings (day 2)",
      etymology: "Etymology (day 5)",
      visual: "Visual (day 9)",
      summary: "Summary (day 14)",
    } as Record<DripStep, string>,
  },
  he: {
    title: "מיילים",
    sub: "כל מייל שהמערכת שלחה, מהרישום הקבוע שלנו (לא מוגבל בחלון השמירה של Resend).",
    statUsers: "משתמשים שקיבלו",
    statSends: "סך שליחות",
    stat7d: "שליחות · 7 ימים",
    funnelTitle: "משפך הרצף",
    funnelStep: "שלב",
    funnelHe: "עברית",
    funnelEn: "אנגלית",
    funnelTotal: 'סה"כ',
    tableTitle: "לפי משתמש",
    colEmail: "משתמש",
    colLang: "רצף",
    colNotified: "התראת הרשמה",
    searchPlaceholder: "סינון לפי אימייל…",
    loading: "טוען…",
    error: "הטעינה נכשלה.",
    stepLabels: {
      welcome: "ברוכים הבאים (יום 0)",
      meanings: "משמעויות (יום 2)",
      etymology: "אטימולוגיה (יום 5)",
      visual: "ויזואלי (יום 9)",
      summary: "סיכום (יום 14)",
    } as Record<DripStep, string>,
  },
} as const;

function fmtDate(iso: string | null | undefined, lang: "en" | "he"): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(lang === "he" ? "he-IL" : "en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export function AdminEmailsClient() {
  const { secret, lang } = useAdminContext();
  const t = STRINGS[lang];
  const [data, setData] = useState<EmailsResponse | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/emails?secret=${encodeURIComponent(secret)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: EmailsResponse) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [secret]);

  if (error) return <div style={{ padding: 24, color: "#B91C1C" }}>{t.error}</div>;
  if (!data) return <div style={{ padding: 24, color: "#6B7280" }}>{t.loading}</div>;

  const filtered = query.trim()
    ? data.users.filter((u) => (u.email ?? "").toLowerCase().includes(query.trim().toLowerCase()))
    : data.users;

  const card: React.CSSProperties = {
    background: "white",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    padding: 16,
  };
  const label: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: "#6B7280",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  };

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
            <div style={label}>{s.l}</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              {s.v.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <div style={card}>
        <div style={{ ...label, marginBottom: 12 }}>{t.funnelTitle}</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ color: "#6B7280", textAlign: "start" }}>
                <th style={{ textAlign: "start", padding: "6px 8px" }}>{t.funnelStep}</th>
                <th style={{ textAlign: "center", padding: "6px 8px" }}>{t.funnelHe}</th>
                <th style={{ textAlign: "center", padding: "6px 8px" }}>{t.funnelEn}</th>
                <th style={{ textAlign: "center", padding: "6px 8px" }}>{t.funnelTotal}</th>
              </tr>
            </thead>
            <tbody>
              {data.counts.funnel.map((row) => (
                <tr key={row.step} style={{ borderTop: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "8px" }}>{t.stepLabels[row.step as DripStep] ?? row.step}</td>
                  <td style={{ textAlign: "center", padding: "8px", fontVariantNumeric: "tabular-nums" }}>{row.he}</td>
                  <td style={{ textAlign: "center", padding: "8px", fontVariantNumeric: "tabular-nums" }}>{row.en}</td>
                  <td style={{ textAlign: "center", padding: "8px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-user table */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={label}>{t.tableTitle}</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13.5,
              minWidth: 220,
            }}
          />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ color: "#6B7280" }}>
                <th style={{ textAlign: "start", padding: "6px 8px" }}>{t.colEmail}</th>
                <th style={{ textAlign: "center", padding: "6px 8px" }}>{t.colLang}</th>
                {DRIP_STEPS.map((s) => (
                  <th key={s} style={{ textAlign: "center", padding: "6px 8px" }} title={t.stepLabels[s]}>
                    {t.stepLabels[s].split(" ")[0]}
                  </th>
                ))}
                <th style={{ textAlign: "center", padding: "6px 8px" }}>{t.colNotified}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.uid} style={{ borderTop: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "8px", direction: "ltr", textAlign: "start" }}>{u.email ?? u.uid.slice(0, 10)}</td>
                  <td style={{ textAlign: "center", padding: "8px" }}>
                    {u.dripLang ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: u.dripLang === "he" ? "#E0F6F4" : "#F3F4F6",
                          color: u.dripLang === "he" ? "#0E7490" : "#4B5563",
                        }}
                      >
                        {u.dripLang.toUpperCase()}
                      </span>
                    ) : (
                      "·"
                    )}
                  </td>
                  {DRIP_STEPS.map((s) => {
                    const iso = u.sent[`${s}-${u.dripLang ?? "he"}`] ?? u.sent[`${s}-he`] ?? u.sent[`${s}-en`];
                    return (
                      <td
                        key={s}
                        style={{ textAlign: "center", padding: "8px", color: iso ? "#059669" : "#D1D5DB", fontVariantNumeric: "tabular-nums" }}
                        title={iso ? new Date(iso).toLocaleString() : ""}
                      >
                        {iso ? fmtDate(iso, lang) : "·"}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: "center", padding: "8px", color: u.notifiedSignupAt ? "#059669" : "#D1D5DB" }}>
                    {u.notifiedSignupAt ? "✓" : "·"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

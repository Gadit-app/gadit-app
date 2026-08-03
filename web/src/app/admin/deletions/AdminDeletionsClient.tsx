"use client";

import { useEffect, useState } from "react";
import { useAdminContext } from "../admin-context";

/**
 * Deletion audit log — every account removal, self-service or admin,
 * written by lib/deletion-log.ts. Answers "who/what deleted this
 * account and when" (Gadi 2026-08-03, corinne/shannon self-delete
 * mystery). Read-only: this page never deletes anything, it just shows
 * the log newest-first.
 */

const SECRET_KEY = "gadit_admin_secret_v1";

type DeletionRow = {
  id: string;
  uid?: string;
  email?: string | null;
  source?: "self" | "admin";
  plan?: string | null;
  subscriptionStatus?: string | null;
  isFamily?: boolean;
  isSchool?: boolean;
  canceledSubs?: number;
  at?: string;
};

type ApiResponse = { rows: DeletionRow[] };

type AdminLang = "en" | "he";

const STRINGS: Record<AdminLang, {
  title: string;
  subtitle: (n: number) => string;
  loading: string;
  empty: string;
  colWhen: string;
  colEmail: string;
  colSource: string;
  colPlan: string;
  colFlags: string;
  colCanceled: string;
  sourceSelf: string;
  sourceAdmin: string;
  family: string;
  school: string;
}> = {
  en: {
    title: "Deletions",
    subtitle: (n) => `${n.toLocaleString()} account${n === 1 ? "" : "s"} removed`,
    loading: "Loading…",
    empty: "No deletions recorded yet. The log starts filling on the next account removal after this deploys.",
    colWhen: "When",
    colEmail: "Email",
    colSource: "By",
    colPlan: "Plan",
    colFlags: "Flags",
    colCanceled: "Subs canceled",
    sourceSelf: "Self",
    sourceAdmin: "Admin",
    family: "Family",
    school: "School",
  },
  he: {
    title: "מחיקות",
    subtitle: (n) => `${n.toLocaleString()} ${n === 1 ? "חשבון נמחק" : "חשבונות נמחקו"}`,
    loading: "טוען…",
    empty: "אין עדיין מחיקות ביומן. היומן יתחיל להתמלא במחיקת החשבון הבאה לאחר שהקוד יעלה לפרודקשן.",
    colWhen: "מתי",
    colEmail: "אימייל",
    colSource: "מי מחק",
    colPlan: "תוכנית",
    colFlags: "סימונים",
    colCanceled: "מנויים שבוטלו",
    sourceSelf: "עצמי",
    sourceAdmin: "אדמין",
    family: "משפחה",
    school: "בית ספר",
  },
};

function formatWhen(iso: string | undefined, lang: AdminLang): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return lang === "he" ? "עכשיו" : "now";
  if (diff < 3_600_000) {
    const m = Math.floor(diff / 60_000);
    return lang === "he" ? `לפני ${m} ד׳` : `${m}m ago`;
  }
  if (diff < 86_400_000) {
    const h = Math.floor(diff / 3_600_000);
    return lang === "he" ? `לפני ${h} ש׳` : `${h}h ago`;
  }
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export default function AdminDeletionsClient() {
  const { secret, lang: adminLang } = useAdminContext();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = STRINGS[adminLang];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetch(`/api/admin/deletion-log?secret=${encodeURIComponent(secret)}`)
      .then(async (r) => {
        if (r.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem(SECRET_KEY);
            window.location.reload();
          }
          throw new Error("Wrong secret.");
        }
        if (!r.ok) {
          const j = (await r.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error ?? `HTTP ${r.status}`);
        }
        return r.json() as Promise<ApiResponse>;
      })
      .then((j) => setData(j))
      .catch((e) => setError(String(e instanceof Error ? e.message : e)))
      .finally(() => setLoading(false));
  }, [secret]);

  const rows = data?.rows ?? [];

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
        <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }}>
          {loading ? t.loading : data ? t.subtitle(rows.length) : ""}
        </p>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", color: "#991B1B", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {data && rows.length === 0 && !error && (
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 32, textAlign: "center", color: "#6B7280", fontSize: 14 }}>
          {t.empty}
        </div>
      )}

      {rows.length > 0 && (
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#F9FAFB" }}>
              <tr>
                <th style={thStyle}>{t.colWhen}</th>
                <th style={thStyle}>{t.colEmail}</th>
                <th style={thStyle}>{t.colSource}</th>
                <th style={thStyle}>{t.colPlan}</th>
                <th style={thStyle}>{t.colFlags}</th>
                <th style={{ ...thStyle, textAlign: "end" }}>{t.colCanceled}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid #F3F4F6" }}>
                  <td style={{ ...tdStyle, color: "#6B7280", fontSize: 13, whiteSpace: "nowrap" }}>
                    {formatWhen(r.at, adminLang)}
                  </td>
                  <td style={{ ...tdStyle, color: "#111827", fontWeight: 500 }} dir="ltr">
                    {r.email || <span style={{ color: "#9CA3AF" }}>{r.uid ?? "—"}</span>}
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: r.source === "admin" ? "#EDE9FE" : "#F3F4F6",
                        color: r.source === "admin" ? "#6D28D9" : "#374151",
                      }}
                    >
                      {r.source === "admin" ? t.sourceAdmin : t.sourceSelf}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: "#374151", fontSize: 13 }} dir="ltr">
                    {r.plan || "—"}
                    {r.subscriptionStatus ? (
                      <span style={{ color: "#9CA3AF" }}> · {r.subscriptionStatus}</span>
                    ) : null}
                  </td>
                  <td style={{ ...tdStyle, fontSize: 12 }}>
                    <span style={{ display: "inline-flex", gap: 4 }}>
                      {r.isFamily && <Flag label={t.family} color="#0E7490" bg="#ECFEFF" />}
                      {r.isSchool && <Flag label={t.school} color="#92400E" bg="#FEF3C7" />}
                      {!r.isFamily && !r.isSchool && <span style={{ color: "#D1D5DB" }}>—</span>}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "end", fontVariantNumeric: "tabular-nums", color: r.canceledSubs ? "#0E7490" : "#9CA3AF", fontWeight: r.canceledSubs ? 600 : 400 }}>
                    {r.canceledSubs ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Flag({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 6px", borderRadius: 5, fontWeight: 600, background: bg, color }}>
      {label}
    </span>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 16px",
  textAlign: "start",
  fontSize: 11,
  fontWeight: 600,
  color: "#6B7280",
  letterSpacing: 0.5,
  textTransform: "uppercase",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 16px",
  fontSize: 14,
  textAlign: "start",
};

"use client";

import { useEffect, useState } from "react";
import { useAdminContext } from "../admin-context";

/**
 * Failed sign-ins, grouped by address (Gadi 2026-10-10, after a subscriber
 * was stuck on a forgotten password for weeks without anyone knowing). Each
 * row says what the account really is, so the fix is obvious: a Google-only
 * account typing a password, an address with no account, or a forgotten
 * password. "Got in" = signed in after the last failure.
 */

const SECRET_KEY = "gadit_admin_secret_v1";

type Group = {
  email: string | null;
  count: number;
  last: string;
  first: string;
  codes: Record<string, number>;
  pages: string[];
  modes: string[];
  recovered: boolean;
  account: null | { exists: boolean; providers?: string[]; lastSignIn?: string | null; created?: string | null };
};

type AdminLang = "en" | "he";
const S: Record<AdminLang, Record<string, string>> = {
  en: { title: "Sign-in problems", sub: "failed sign-ins in the log", loading: "Loading…", empty: "No failed sign-ins yet.", when: "Last", email: "Email", tries: "Tries", what: "What happened", account: "The account", status: "Status", got: "Got in", stuck: "Still stuck", none: "No such account", google: "Google only", pwd: "Email + password", both: "Google + password", link: "Email link", lastIn: "last sign-in" },
  he: { title: "בעיות התחברות", sub: "ניסיונות התחברות שנכשלו ביומן", loading: "טוען…", empty: "עוד אין ניסיונות שנכשלו.", when: "אחרון", email: "אימייל", tries: "ניסיונות", what: "מה קרה", account: "החשבון", status: "מצב", got: "נכנס", stuck: "עדיין תקוע", none: "אין חשבון כזה", google: "רק Google", pwd: "מייל וסיסמה", both: "Google וסיסמה", link: "קישור במייל", lastIn: "התחברות אחרונה" },
};

const CODE_HE: Record<string, string> = {
  "auth/invalid-credential": "מייל או סיסמה שגויים",
  "auth/wrong-password": "סיסמה שגויה",
  "auth/user-not-found": "אין משתמש",
  "auth/too-many-requests": "יותר מדי ניסיונות",
  "auth/popup-closed-by-user": "סגר את חלון Google",
  "auth/popup-blocked": "חלון Google נחסם",
  "auth/network-request-failed": "בעיית רשת",
  "auth/email-already-in-use": "המייל כבר רשום",
  "auth/weak-password": "סיסמה חלשה",
  "auth/invalid-email": "מייל לא תקין",
};

function when(iso: string, lang: AdminLang): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 3_600_000) return lang === "he" ? `לפני ${Math.max(1, Math.floor(diff / 60_000))} ד׳` : `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
  if (diff < 86_400_000) return lang === "he" ? `לפני ${Math.floor(diff / 3_600_000)} ש׳` : `${Math.floor(diff / 3_600_000)}h ago`;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AdminAuthErrorsClient() {
  const { secret, lang } = useAdminContext();
  const t = S[lang];
  const [data, setData] = useState<{ groups: Group[]; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/auth-errors?secret=${encodeURIComponent(secret)}`)
      .then(async (r) => {
        if (r.status === 401) { localStorage.removeItem(SECRET_KEY); window.location.reload(); throw new Error("Wrong secret."); }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(String(e instanceof Error ? e.message : e)));
  }, [secret]);

  const kind = (g: Group) => {
    if (!g.account) return "—";
    if (!g.account.exists) return t.none;
    const p = g.account.providers ?? [];
    const gg = p.includes("google.com"), pw = p.includes("password");
    return gg && pw ? t.both : gg ? t.google : pw ? t.pwd : t.link;
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
        <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }}>{data ? `${data.total} ${t.sub}` : t.loading}</p>
      </div>
      {error && <div style={{ background: "#FEF2F2", color: "#991B1B", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
      {data && data.groups.length === 0 && (
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 32, textAlign: "center", color: "#6B7280", fontSize: 14 }}>{t.empty}</div>
      )}
      {data && data.groups.length > 0 && (
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead style={{ background: "#F9FAFB" }}>
              <tr>{[t.when, t.email, t.tries, t.what, t.account, t.status].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {data.groups.map((g, i) => (
                <tr key={(g.email ?? "") + i} style={{ borderTop: "1px solid #F3F4F6" }}>
                  <td style={{ ...td, color: "#6B7280", whiteSpace: "nowrap" }}>{when(g.last, lang)}</td>
                  <td style={{ ...td, fontWeight: 500, color: "#111827" }} dir="ltr">{g.email ?? (g.modes.join(", ") || "—")}</td>
                  <td style={{ ...td, fontVariantNumeric: "tabular-nums" }}>{g.count}</td>
                  <td style={{ ...td, fontSize: 12.5 }}>
                    {Object.entries(g.codes).map(([c, n]) => (
                      <div key={c}>{lang === "he" ? CODE_HE[c] ?? c : c}{n > 1 ? ` ×${n}` : ""}</div>
                    ))}
                  </td>
                  <td style={{ ...td, fontSize: 12.5 }}>
                    <div>{kind(g)}</div>
                    {g.account?.lastSignIn && <div style={{ color: "#9CA3AF" }}>{t.lastIn}: {when(new Date(g.account.lastSignIn).toISOString(), lang)}</div>}
                  </td>
                  <td style={td}>
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: g.recovered ? "#ECFDF5" : "#FEF3C7", color: g.recovered ? "#047857" : "#92400E" }}>
                      {g.recovered ? t.got : t.stuck}
                    </span>
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

const th: React.CSSProperties = { textAlign: "start", fontSize: 12, fontWeight: 600, color: "#6B7280", padding: "10px 14px" };
const td: React.CSSProperties = { padding: "10px 14px", fontSize: 13.5, color: "#374151", verticalAlign: "top" };

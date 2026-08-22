"use client";

/**
 * Coaches section for the /family owner dashboard (Gadi 2026-08-22). The
 * parent grants a coach access to a specific child by email, sees active
 * grants, and can revoke any of them. Self-contained: fetches the family's
 * children (via switch-member) and the grants (via /api/family/coach).
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

type Member = { id: string; name: string; isOwner: boolean };
type Grant = { id: string; coachEmail: string; memberId: string; memberName: string };

const T: Record<string, {
  title: string; lede: string; emailPh: string; childPh: string; add: string; adding: string;
  none: string; revoke: string; forChild: string; invalidEmail: string; pickChild: string; err: string;
}> = {
  en: {
    title: "Coaches",
    lede: "Give a coach access to a child's profile to add words during lessons. Revoke anytime.",
    emailPh: "Coach's email",
    childPh: "Which child?",
    add: "Grant access",
    adding: "Granting...",
    none: "No coaches yet.",
    revoke: "Revoke",
    forChild: "for",
    invalidEmail: "Enter a valid email.",
    pickChild: "Pick a child.",
    err: "Something went wrong. Try again.",
  },
  he: {
    title: "מאמנים",
    lede: "תן למאמן גישה לפרופיל של ילד כדי להוסיף מילים במהלך השיעורים. אפשר לבטל בכל רגע.",
    emailPh: "האימייל של המאמן",
    childPh: "איזה ילד?",
    add: "הענקת גישה",
    adding: "מעניק...",
    none: "אין עדיין מאמנים.",
    revoke: "ביטול",
    forChild: "עבור",
    invalidEmail: "הזן אימייל תקין.",
    pickChild: "בחר ילד.",
    err: "משהו השתבש. נסה שוב.",
  },
};
function t(lang: string) { return T[lang] ?? T.en; }

export function CoachesSection() {
  const { user } = useAuth();
  const { lang, dir } = useLang();
  const c = t(lang);

  const [kids, setKids] = useState<Member[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [email, setEmail] = useState("");
  const [memberId, setMemberId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const [mRes, gRes] = await Promise.all([
        fetch("/api/family/switch-member", { headers: { Authorization: `Bearer ${idToken}` } }),
        fetch("/api/family/coach", { headers: { Authorization: `Bearer ${idToken}` } }),
      ]);
      if (mRes.ok) {
        const d = (await mRes.json()) as { members?: Member[] };
        setKids((d.members ?? []).filter((m) => !m.isOwner));
      }
      if (gRes.ok) {
        const d = (await gRes.json()) as { grants?: Grant[] };
        setGrants(d.grants ?? []);
      }
    } catch { /* leave as-is */ }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!user || busy) return;
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setError(c.invalidEmail); return; }
    if (!memberId) { setError(c.pickChild); return; }
    setBusy(true); setError("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/family/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ coachEmail: e, memberId }),
      });
      if (!res.ok) throw new Error();
      setEmail(""); setMemberId("");
      await load();
    } catch {
      setError(c.err);
    } finally {
      setBusy(false);
    }
  }

  async function revoke(grantId: string) {
    if (!user) return;
    setError("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/family/coach/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ grantId }),
      });
      if (!res.ok) throw new Error();
      setGrants((g) => g.filter((x) => x.id !== grantId));
    } catch {
      setError(c.err);
    }
  }

  const inputStyle: React.CSSProperties = {
    flex: 1, minWidth: 0, padding: "11px 13px", borderRadius: 12, border: "1px solid var(--rule)",
    background: "var(--surface)", color: "var(--ink)", fontSize: 15, fontFamily: "inherit",
  };

  return (
    <section dir={dir} style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>{c.title}</h2>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 16, maxWidth: 560 }}>{c.lede}</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder={c.emailPh} style={{ ...inputStyle, flexBasis: 220 }} dir="ltr"
        />
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} style={{ ...inputStyle, flexBasis: 150 }}>
          <option value="">{c.childPh}</option>
          {kids.map((k) => <option key={k.id} value={k.id}>{k.name || "—"}</option>)}
        </select>
        <button
          type="button" onClick={add} disabled={busy}
          style={{ background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 12, padding: "11px 20px", fontSize: 15, fontWeight: 700, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, fontFamily: "inherit" }}
        >
          {busy ? c.adding : c.add}
        </button>
      </div>
      {error && <div style={{ color: "#DC2626", fontSize: 13, marginBottom: 8 }}>{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {grants.length === 0 ? (
          <div style={{ fontSize: 14, color: "var(--ink-muted)" }}>{c.none}</div>
        ) : (
          grants.map((g) => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, border: "1px solid var(--rule)", background: "var(--surface)" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis" }} dir="ltr">{g.coachEmail}</div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{c.forChild} {g.memberName || "—"}</div>
              </div>
              <button
                type="button" onClick={() => revoke(g.id)}
                style={{ background: "transparent", color: "#DC2626", border: "1px solid color-mix(in srgb, #DC2626 40%, transparent)", borderRadius: 999, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
              >
                {c.revoke}
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

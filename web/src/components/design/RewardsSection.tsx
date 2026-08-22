"use client";

/**
 * Rewards section for the /family owner dashboard (kids gamification v2,
 * "approach B", Gadi 2026-08-23). The parent gives a child GIFT points as a
 * treat; the child spends them in the skin store. This makes the store work
 * for EVERY family, not only Yooniz families — Yooniz is just another way to
 * top up the same wallet.
 *
 * Gift points are cosmetic-only, never affect ranks, and are capped per week
 * (shared with the Yooniz gift). One tap gives; the row shows what's left this
 * week. Self-contained: fetches the family's children via switch-member.
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

type Member = { id: string; name: string; isOwner: boolean; role?: string };

const AMOUNTS = [10, 20, 30] as const;

const T: Record<string, { title: string; lede: string; none: string; give: string; gave: string; left: string; capped: string; err: string }> = {
  en: {
    title: "Rewards",
    lede: "Give a child gift points as a treat. They spend them on new skins in the store. Points are just for looks and never affect ranks.",
    none: "Add a child to give rewards.",
    give: "Give",
    gave: "sent",
    left: "left this week",
    capped: "Weekly limit reached. More next week.",
    err: "Something went wrong. Try again.",
  },
  he: {
    title: "פרסים",
    lede: "תן לילד נקודות מתנה כפרס. הוא מוציא אותן על סקינים חדשים בחנות. הנקודות הן לקישוט בלבד ולא משפיעות על הדרגה.",
    none: "הוסף ילד כדי לתת פרסים.",
    give: "תן",
    gave: "נשלחו",
    left: "נשארו השבוע",
    capped: "הגעת למכסה השבועית. עוד בשבוע הבא.",
    err: "משהו השתבש. נסה שוב.",
  },
};
function t(lang: string) { return T[lang] ?? T.en; }

export function RewardsSection() {
  const { user } = useAuth();
  const { lang, dir } = useLang();
  const c = t(lang);

  const [kids, setKids] = useState<Member[]>([]);
  const [busy, setBusy] = useState<string | null>(null); // memberId being gifted
  const [result, setResult] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/family/switch-member", { headers: { Authorization: `Bearer ${idToken}` } });
      if (res.ok) {
        const d = (await res.json()) as { members?: Member[] };
        setKids((d.members ?? []).filter((m) => !m.isOwner && (m.role === "boy" || m.role === "girl")));
      }
    } catch { /* leave as-is */ }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function give(memberId: string, amount: number) {
    if (!user || busy) return;
    setBusy(memberId); setError("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/family/gift-points", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ memberId, amount }),
      });
      const d = (await res.json()) as { granted?: number; remainingThisWeek?: number };
      if (!res.ok) throw new Error();
      const msg = (d.granted ?? 0) > 0
        ? `🎁 +${d.granted} ${c.gave} · ${d.remainingThisWeek ?? 0} ${c.left}`
        : c.capped;
      setResult((r) => ({ ...r, [memberId]: msg }));
    } catch {
      setError(c.err);
    } finally {
      setBusy(null);
    }
  }

  if (kids.length === 0) return null;

  return (
    <section dir={dir} style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>🎁 {c.title}</h2>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 16, maxWidth: 560 }}>{c.lede}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {kids.map((k) => (
          <div key={k.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, border: "1px solid var(--rule)", background: "var(--surface)", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{k.name || "—"}</div>
              {result[k.id] && <div style={{ fontSize: 12.5, color: "var(--accent, #0EA5A5)", fontWeight: 600, marginTop: 2 }}>{result[k.id]}</div>}
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => give(k.id, a)}
                  disabled={busy === k.id}
                  style={{
                    background: "color-mix(in srgb, var(--accent, #0EA5A5) 12%, transparent)",
                    color: "var(--accent, #0EA5A5)", border: "1px solid color-mix(in srgb, var(--accent, #0EA5A5) 40%, transparent)",
                    borderRadius: 999, padding: "7px 14px", fontSize: 14, fontWeight: 800,
                    cursor: busy === k.id ? "default" : "pointer", opacity: busy === k.id ? 0.5 : 1,
                    fontFamily: "inherit", fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {c.give} {a}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {error && <div style={{ color: "#DC2626", fontSize: 13, marginTop: 8 }}>{error}</div>}
    </section>
  );
}

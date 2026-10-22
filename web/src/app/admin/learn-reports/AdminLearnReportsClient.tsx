"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminContext, type AdminLang } from "../admin-context";

/**
 * "Wrong translation?" reports from learning-mode word cards (2026-10-22,
 * Hebrew as a second language first). One row per word and person; the
 * count is how many times that person tapped it. Mark fixed once the bank
 * (lib/learn/hebrew-bank.ts) is corrected.
 */
type Row = {
  id: string; lang: string; word: string; translation: string; nq?: string | null; en?: string | null;
  ui: string; lessonId?: string | null; topic?: string | null; email?: string | null; uid: string;
  count?: number; firstAt?: string; lastAt?: string; status: "open" | "fixed" | "wontfix";
};
type Status = Row["status"];
type Counts = { open: number; fixed: number; wontfix: number; total: number };

const STRINGS: Record<AdminLang, {
  title: string; sub: string; loading: string; none: string; error: string;
  tabs: Record<Status | "all", string>; mark: Record<Status, string>;
  translation: string; ui: string; lesson: string; who: string; times: (n: number) => string;
}> = {
  en: {
    title: "Learning words", sub: "\"Wrong translation?\" taps on learning-mode word cards. Fix the word in the bank, then mark it fixed.",
    loading: "Loading…", none: "No reports.", error: "Error",
    tabs: { open: "Open", fixed: "Fixed", wontfix: "Won't fix", all: "All" },
    mark: { open: "Reopen", fixed: "Mark fixed", wontfix: "Won't fix" },
    translation: "Translation shown", ui: "App language", lesson: "Lesson", who: "Reported by",
    times: (n) => (n === 1 ? "once" : `${n} times`),
  },
  he: {
    title: "מילים בלימוד שפה", sub: "לחיצות על \"תרגום לא נכון?\" בכרטיסיות של לימוד שפה. מתקנים את המילה במאגר ומסמנים כתוקן.",
    loading: "טוען…", none: "אין דיווחים.", error: "שגיאה",
    tabs: { open: "פתוחים", fixed: "תוקנו", wontfix: "לא יטופלו", all: "הכל" },
    mark: { open: "לפתוח שוב", fixed: "סמן כתוקן", wontfix: "לא יטופל" },
    translation: "התרגום שהוצג", ui: "שפת האפליקציה", lesson: "שיעור", who: "דווח על ידי",
    times: (n) => (n === 1 ? "פעם אחת" : `${n} פעמים`),
  },
};

export default function AdminLearnReportsClient() {
  const { secret, lang } = useAdminContext();
  const t = STRINGS[lang];
  const dir = lang === "he" ? "rtl" : "ltr";
  const [rows, setRows] = useState<Row[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [filter, setFilter] = useState<Status | "all">("open");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ secret });
      if (filter !== "all") qs.set("status", filter);
      const r = await fetch(`/api/admin/learn-reports?${qs}`);
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      setRows(j.items as Row[]);
      setCounts(j.counts as Counts);
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [secret, filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function mark(id: string, status: Status) {
    const r = await fetch(`/api/admin/learn-reports?secret=${encodeURIComponent(secret)}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }),
    });
    if (r.ok) void load();
    else setErr(`HTTP ${r.status}`);
  }

  return (
    <div dir={dir}>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
      <p style={{ margin: "6px 0 16px", fontSize: 14, color: "#6B7280", lineHeight: 1.5 }}>{t.sub}</p>
      <div style={{ display: "inline-flex", flexWrap: "wrap", gap: 4, padding: 4, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, marginBottom: 16 }}>
        {(["open", "fixed", "wontfix", "all"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)}
            style={{ padding: "6px 14px", borderRadius: 8, border: 0, cursor: "pointer", font: "inherit", fontSize: 14, background: filter === f ? "#0EA5A5" : "transparent", color: filter === f ? "#fff" : "#6B7280", fontWeight: filter === f ? 600 : 400 }}>
            {t.tabs[f]}{counts ? ` (${f === "all" ? counts.total : counts[f]})` : ""}
          </button>
        ))}
      </div>
      {err && <div role="alert" style={{ background: "#FEF2F2", color: "#991B1B", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{t.error}: {err}</div>}
      {loading ? (
        <p style={{ color: "#6B7280" }}>{t.loading}</p>
      ) : rows.length === 0 ? (
        <p style={{ color: "#6B7280" }}>{t.none}</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {rows.map((r) => (
            <div key={r.id} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "12px 14px", display: "grid", gap: 6 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10 }}>
                <b style={{ fontSize: 20, color: "#111827" }} dir="auto">{r.nq || r.word}</b>
                <span style={{ fontSize: 15, color: "#111827" }}>{t.translation}: <b dir="auto">{r.translation || "?"}</b></span>
                {r.en && <span style={{ fontSize: 13, color: "#6B7280" }} dir="ltr">({r.en})</span>}
                <span style={{ fontSize: 12, color: "#6B7280", marginInlineStart: "auto" }} dir="ltr">{(r.lastAt ?? "").slice(0, 16).replace("T", " ")}</span>
              </div>
              <div style={{ fontSize: 13, color: "#6B7280", display: "flex", flexWrap: "wrap", gap: 12 }}>
                <span>{t.ui}: {r.ui}</span>
                {(r.topic || r.lessonId) && <span>{t.lesson}: <span dir="auto">{r.topic || r.lessonId}</span></span>}
                <span>{t.who}: <span dir="ltr">{r.email || r.uid}</span> · {t.times(r.count ?? 1)}</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(["fixed", "wontfix", "open"] as const).filter((s) => s !== r.status).map((s) => (
                  <button key={s} type="button" onClick={() => void mark(r.id, s)}
                    style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #E5E7EB", background: s === "fixed" ? "#0EA5A5" : "#F9FAFB", color: s === "fixed" ? "#fff" : "#111827", cursor: "pointer", font: "inherit", fontSize: 13 }}>
                    {t.mark[s]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

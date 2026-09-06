"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminContext } from "../admin-context";

/**
 * Admin — live activity log. Every word search and image generation, newest
 * first: time, type, word, language, and which subscriber. Reads
 * /api/admin/activity. "Load more" pages back via the atMs cursor; the
 * refresh button (and optional auto-refresh) pulls the newest events.
 */

type Item = {
  kind: "word" | "image";
  word: string;
  lang: string;
  uid: string | null;
  plan: string;
  email: string | null;
  atMs: number;
  at: string | null;
};

const TEAL = "#0EA5A5";
const INK = "#111827";
const MUTED = "#6B7280";
const RULE = "#E5E7EB";
const SOFT = "#F3F4F6";

const PLAN_STYLE: Record<string, { bg: string; fg: string }> = {
  basic: { bg: "#F3F4F6", fg: "#6B7280" },
  clear: { bg: "rgba(14,165,165,0.12)", fg: "#0B8A8A" },
  deep: { bg: "rgba(124,58,237,0.12)", fg: "#6D28D9" },
  family: { bg: "#E3F5EC", fg: "#0E7A52" },
  schools: { bg: "#FEF6EC", fg: "#B45309" },
  anon: { bg: "#F3F4F6", fg: "#9CA3AF" },
  unknown: { bg: "#F3F4F6", fg: "#9CA3AF" },
};

const PLAN_LABEL: Record<string, { he: string; en: string }> = {
  basic: { he: "חינם", en: "Basic" },
  clear: { he: "Clear", en: "Clear" },
  deep: { he: "Deep", en: "Deep" },
  family: { he: "Family", en: "Family" },
  schools: { he: "בתי ספר", en: "Schools" },
  anon: { he: "אנונימי", en: "Anon" },
  unknown: { he: "לא ידוע", en: "Unknown" },
};

function fmt(atMs: number, he: boolean): { date: string; time: string } {
  if (!atMs) return { date: "-", time: "" };
  const d = new Date(atMs);
  const date = d.toLocaleDateString(he ? "he-IL" : "en-GB", { timeZone: "Asia/Jerusalem", day: "2-digit", month: "2-digit", year: "2-digit" });
  const time = d.toLocaleTimeString(he ? "he-IL" : "en-GB", { timeZone: "Asia/Jerusalem", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return { date, time };
}

export default function AdminActivityClient() {
  const { secret, lang } = useAdminContext();
  const he = lang === "he";
  const [items, setItems] = useState<Item[]>([]);
  const [nextBefore, setNextBefore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [auto, setAuto] = useState(false);
  const autoRef = useRef(auto);
  autoRef.current = auto;

  const load = useCallback(async (before?: number) => {
    const url = `/api/admin/activity?secret=${encodeURIComponent(secret)}&limit=200${before ? `&before=${before}` : ""}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || String(r.status));
    return (await r.json()) as { items: Item[]; nextBefore: number | null };
  }, [secret]);

  const refresh = useCallback(async () => {
    try {
      setErr(null);
      const j = await load();
      setItems(j.items);
      setNextBefore(j.nextBefore);
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => { refresh(); }, [refresh]);

  // Optional 15s auto-refresh so the log feels live.
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => { if (autoRef.current) refresh(); }, 15000);
    return () => clearInterval(id);
  }, [auto, refresh]);

  const loadMore = async () => {
    if (!nextBefore) return;
    setLoadingMore(true);
    try {
      const j = await load(nextBefore);
      setItems((prev) => [...prev, ...j.items]);
      setNextBefore(j.nextBefore);
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoadingMore(false);
    }
  };

  const planLabel = (p: string) => (he ? (PLAN_LABEL[p]?.he ?? p) : (PLAN_LABEL[p]?.en ?? p));

  return (
    <div dir={he ? "rtl" : "ltr"} style={{ color: INK, fontFamily: "inherit" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 4 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{he ? "לוג פעילות" : "Activity log"}</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: MUTED, cursor: "pointer" }}>
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} style={{ accentColor: TEAL }} />
            {he ? "רענון אוטומטי" : "Auto refresh"}
          </label>
          <button onClick={refresh} style={btn(false)}>{he ? "רענן" : "Refresh"}</button>
        </div>
      </div>
      <p style={{ margin: "0 0 18px", fontSize: 14, color: MUTED }}>
        {he
          ? "כל חיפוש מילה וכל תמונה, מהחדש לישן: תאריך, שעה, מילה, שפה, ומי המנוי. הנתונים מצטברים מרגע הפריסה."
          : "Every word search and image, newest first: date, time, word, language, and which subscriber. Data accrues from deploy."}
      </p>

      {loading && <div style={{ color: MUTED, fontSize: 14 }}>{he ? "טוען..." : "Loading..."}</div>}
      {err && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FBD5D5", color: "#B91C1C", borderRadius: 10, padding: 14, fontSize: 14 }}>
          {he ? "שגיאה: " : "Error: "}{err}
        </div>
      )}

      {!loading && !err && items.length === 0 && (
        <div style={{ color: MUTED, fontSize: 14, background: "white", border: `1px solid ${RULE}`, borderRadius: 12, padding: 18 }}>
          {he ? "אין עדיין אירועים. הלוג מתחיל להתמלא מהחיפוש הבא." : "No events yet. The log fills from the next search onward."}
        </div>
      )}

      {items.length > 0 && (
        <div style={{ background: "white", border: `1px solid ${RULE}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 640 }}>
              <thead>
                <tr style={{ background: SOFT, color: MUTED, textAlign: he ? "right" : "left" }}>
                  <Th he={he} en="Time" hew="זמן" />
                  <Th he={he} en="Type" hew="סוג" />
                  <Th he={he} en="Word" hew="מילה" />
                  <Th he={he} en="Lang" hew="שפה" />
                  <Th he={he} en="Subscriber" hew="מנוי" />
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => {
                  const { date, time } = fmt(it.atMs, he);
                  const ps = PLAN_STYLE[it.plan] ?? PLAN_STYLE.unknown;
                  return (
                    <tr key={i} style={{ borderTop: `1px solid ${SOFT}` }}>
                      <td style={td()}>
                        <span style={{ fontVariantNumeric: "tabular-nums", color: INK, fontWeight: 600 }}>{time}</span>
                        <span style={{ color: MUTED, marginInlineStart: 6, fontSize: 12 }}>{date}</span>
                      </td>
                      <td style={td()}>
                        {it.kind === "image"
                          ? <span title={he ? "תמונה" : "image"} style={{ fontSize: 15 }}>🖼️</span>
                          : <span title={he ? "מילה" : "word"} style={{ fontSize: 15 }}>🔤</span>}
                      </td>
                      <td style={{ ...td(), fontWeight: 700, color: INK }}>{it.word}</td>
                      <td style={td()}><span style={{ textTransform: "uppercase", fontSize: 12, color: MUTED, fontWeight: 600 }}>{it.lang}</span></td>
                      <td style={td()}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ color: it.email ? INK : MUTED, direction: "ltr", unicodeBidi: "isolate" }}>
                            {it.email ?? (it.uid ? it.uid.slice(0, 8) + "…" : (he ? "אנונימי" : "anon"))}
                          </span>
                          <span style={{ background: ps.bg, color: ps.fg, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                            {planLabel(it.plan)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {nextBefore && (
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button onClick={loadMore} disabled={loadingMore} style={btn(true)}>
            {loadingMore ? (he ? "טוען..." : "Loading...") : (he ? "טען עוד" : "Load more")}
          </button>
        </div>
      )}
    </div>
  );
}

function Th({ he, en, hew }: { he: boolean; en: string; hew: string }) {
  return <th style={{ padding: "10px 12px", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}>{he ? hew : en}</th>;
}
function td(): React.CSSProperties {
  return { padding: "9px 12px", verticalAlign: "middle", whiteSpace: "nowrap" };
}
function btn(primary: boolean): React.CSSProperties {
  return {
    border: `1px solid ${primary ? TEAL : RULE}`,
    background: primary ? "rgba(14,165,165,0.10)" : "white",
    color: primary ? TEAL : MUTED,
    fontWeight: 700, fontSize: 13, padding: "8px 18px", borderRadius: 8, cursor: "pointer",
  };
}

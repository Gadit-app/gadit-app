"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminContext, type AdminLang } from "../admin-context";
import { gameName } from "@/lib/tester-games";
import type { PaySlip } from "@/lib/tester-pay";

/**
 * Game testers (Gadi 2026-11-02: Osher and Din).
 * Notes: every note, newest first, with the voice note and its transcript.
 *   A bug → "approve" (pays 10, Claude may fix it). An idea → "liked" (pays
 *   5) or "build it" (pays 5, Claude may build it), and "built" (+50). A
 *   duplicate or nonsense → "not for pay". Claude acts only on approved notes.
 * Pay: each child's MONTHLY pay, computed from what they did, and a
 *   "paid in Yooniz" button.
 */

type Note = { id: string; name: string; game: string; kind: string; word: string; path: string; transcript: string; hasAudio: boolean; status: string; payAs: string | null; at: number | null };

const KIND: Record<string, string> = { fun: "😍", boring: "😴", hard: "😵", easy: "🥱", bug: "🐞", idea: "💡", voice: "🎤" };
const RATINGS = new Set(["fun", "boring", "hard", "easy"]);

const S: Record<AdminLang, Record<string, string>> = {
  he: {
    title: "בודקי משחקים", sub: "הערות של אושר ודין מתוך המשחקים, והשכר שלהם ב-Yoon. Claude מטפל רק בהערות שאישרתם.",
    tabNotes: "הערות", tabPay: "שכר",
    none: "עוד אין הערות", all: "הכול", new: "חדשות", approved: "אושרו ל-Claude", liked: "רעיון שאהבנו", done: "טופלו", skip: "לא לתשלום",
    approveBug: "🐞 לאשר באג (+10)", likeIdea: "💡 אהבתי (+5)", buildIdea: "🛠️ לבנות את זה (+5, ל-Claude)", built: "🚀 נבנה (+50)", fixed: "✅ תוקן",
    asBug: "🐞 לאשר כבאג (+10)", asIdea: "💡 לאשר כרעיון (+5)", skipBtn: "לא לתשלום (כפול או לא רלוונטי)", reset: "להחזיר לחדשות",
    rating: "דירוג (נספר כבדיקת משחק)", word: "מילה", page: "עמוד", voiceX: "הקלטה: פי 1.5",
    week: "חודש", thisWeek: "החודש", earned: "הרוויח", tax: "לקופה (10%)", net: "להעביר ב-Yooniz", pending: "מחכה לאישור",
    paidBtn: "✅ סימנתי ששילמתי ב-Yooniz", paidAt: "שולם ב-Yooniz", copy: "📋 להעתיק תלוש", copied: "הועתק", noKids: "אין ילדים בודקים",
    capped: "הגיע לתקרה השבועית (150) באחד השבועות", run: "🎮 בדיקת משחק", bug: "🐞 באג", idea: "💡 רעיון", builtRow: "🚀 רעיון שנבנה", team: "🤝 בונוס צוות", note: "🎤 הקלטה", royalty: "🎡 תמלוגים",
    rowPaid: "", rowWait: "מחכה", rowNo: "לא נספר",
    levels: "junior:🐣 בודק מתחיל|tester:🛠️ בודק|senior:⭐ בודק בכיר|lead:👑 ראש צוות",
  },
  en: {
    title: "Game testers", sub: "Osher and Din's notes from inside the games, and their pay in Yoon. Claude acts only on notes you approve.",
    tabNotes: "Notes", tabPay: "Pay",
    none: "No notes yet", all: "All", new: "New", approved: "Approved for Claude", liked: "Liked idea", done: "Done", skip: "Not for pay",
    approveBug: "🐞 Approve bug (+10)", likeIdea: "💡 Liked it (+5)", buildIdea: "🛠️ Build it (+5, for Claude)", built: "🚀 Built (+50)", fixed: "✅ Fixed",
    asBug: "🐞 Approve as bug (+10)", asIdea: "💡 Approve as idea (+5)", skipBtn: "Not for pay (duplicate or off)", reset: "Back to new",
    rating: "Rating (counts as a test run)", word: "word", page: "page", voiceX: "Voice note: ×1.5",
    week: "Month", thisWeek: "This month", earned: "Earned", tax: "Family pot (10%)", net: "To pay in Yooniz", pending: "Waiting for approval",
    paidBtn: "✅ I paid it in Yooniz", paidAt: "Paid in Yooniz", copy: "📋 Copy pay slip", copied: "Copied", noKids: "No child testers",
    capped: "Hit the weekly cap (150) in one of the weeks", run: "🎮 Test run", bug: "🐞 Bug", idea: "💡 Idea", builtRow: "🚀 Idea built", team: "🤝 Team bonus", note: "🎤 Voice note", royalty: "🎡 Royalties",
    rowPaid: "", rowWait: "waiting", rowNo: "didn't count",
    levels: "junior:🐣 Junior|tester:🛠️ Tester|senior:⭐ Senior|lead:👑 Lead",
  },
};

const STATUS_COLOR: Record<string, [string, string]> = {
  new: ["#EEF2FF", "#4338CA"], approved: ["#DCFCE7", "#166534"], liked: ["#FEF9C3", "#854D0E"], done: ["#F3F4F6", "#6B7280"], skip: ["#FEE2E2", "#991B1B"],
};
const addMonths = (month: string, n: number) => { const [y, m] = month.split("-").map(Number); const d = new Date(Date.UTC(y, m - 1 + n, 15)); return d.toISOString().slice(0, 7); };

export default function AdminTestersClient() {
  const { secret, lang } = useAdminContext();
  const t = S[lang];
  const levels = Object.fromEntries(t.levels.split("|").map((x) => x.split(":"))) as Record<string, string>;
  const [tab, setTab] = useState<"notes" | "pay">("notes");
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [week, setWeek] = useState<string | null>(null);
  const [thisWeek, setThisWeek] = useState<string | null>(null);
  const [slips, setSlips] = useState<PaySlip[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const api = useCallback((q = "") => `/api/admin/testers?secret=${encodeURIComponent(secret)}${q}`, [secret]);
  const load = useCallback(async () => {
    if (!secret) return;
    try {
      const r = await fetch(api());
      const j = (await r.json()) as { notes?: Note[]; error?: string };
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      setNotes(j.notes ?? []);
    } catch (e) { setError(String(e instanceof Error ? e.message : e)); }
  }, [secret, api]);
  const loadPay = useCallback(async (w: string | null) => {
    if (!secret) return;
    setSlips(null);
    try {
      const r = await fetch(api(`&pay=1${w ? `&month=${w}` : ""}`));
      const j = (await r.json()) as { month: string; thisMonth: string; slips: PaySlip[]; error?: string };
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      setWeek(j.month); setThisWeek(j.thisMonth); setSlips(j.slips);
    } catch (e) { setError(String(e instanceof Error ? e.message : e)); }
  }, [secret, api]);
  useEffect(() => {
    let alive = true;
    (async () => { if (alive) await load(); })();
    return () => { alive = false; };
  }, [load]);
  useEffect(() => {
    if (tab !== "pay" || slips) return;
    let alive = true;
    (async () => { if (alive) await loadPay(week); })();
    return () => { alive = false; };
  }, [tab, slips, week, loadPay]);

  const setStatus = async (id: string, status: string, payAs?: "bug" | "idea") => {
    setNotes((ns) => ns?.map((n) => (n.id === id ? { ...n, status, payAs: payAs ?? n.payAs } : n)) ?? ns);
    setSlips(null);
    await fetch(api(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status, payAs }) }).catch(() => undefined);
  };
  const markPaid = async (s: PaySlip) => {
    setSlips((ss) => ss?.map((x) => (x.uid === s.uid ? { ...x, paid: { at: Date.now(), net: s.net } } : x)) ?? ss);
    await fetch(api(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "paid", uid: s.uid, month: s.month, net: s.net }) }).catch(() => undefined);
  };
  const slipText = (s: PaySlip) => {
    const L = lang === "he" ? "he" : "en";
    const lines = s.rows.filter((r) => r.state === "paid").map((r) => `${t[r.type === "built" ? "builtRow" : r.type]}${r.ticket ? ` #${r.ticket}` : ""} · ${gameName(r.game, L)}: +${r.yoon}`);
    return [`🧪 ${s.name} · ${t.week} ${s.month.slice(5, 7)}/${s.month.slice(0, 4)}`, ...lines, `${t.earned}: ${s.earned} Yoon`, `${t.tax}: ${s.tax}`, `${t.net}: ${s.net} Yoon`].join("\n");
  };
  const copy = async (s: PaySlip) => {
    try { await navigator.clipboard.writeText(slipText(s)); setCopied(s.uid); setTimeout(() => setCopied(null), 1500); } catch { /* fine */ }
  };

  const shown = (notes ?? []).filter((n) => filter === "all" || n.status === filter);
  const count = (s: string) => (notes ?? []).filter((n) => n.status === s).length;
  const fmt = (ms: number | null) => (ms ? new Date(ms).toLocaleString(lang === "he" ? "he-IL" : "en-GB", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "");
  const L = lang === "he" ? "he" : "en";

  const actions = (n: Note) => {
    const b: [string, () => void, boolean?][] = [];
    if (RATINGS.has(n.kind)) return b;
    const type = n.payAs ?? (n.kind === "bug" ? "bug" : n.kind === "idea" ? "idea" : null);
    if (type === "bug") {
      if (n.status !== "approved" && n.status !== "done") b.push([t.approveBug, () => setStatus(n.id, "approved", "bug"), true]);
      if (n.status === "approved") b.push([t.fixed, () => setStatus(n.id, "done", "bug")]);
    } else if (type === "idea") {
      if (n.status !== "liked" && n.status !== "approved" && n.status !== "done") b.push([t.likeIdea, () => setStatus(n.id, "liked", "idea"), true]);
      if (n.status !== "approved" && n.status !== "done") b.push([t.buildIdea, () => setStatus(n.id, "approved", "idea")]);
      if (n.status !== "done") b.push([t.built, () => setStatus(n.id, "done", "idea")]);
    } else {
      b.push([t.asBug, () => setStatus(n.id, "approved", "bug"), true]);
      b.push([t.asIdea, () => setStatus(n.id, "liked", "idea"), true]);
    }
    if (n.status !== "skip") b.push([t.skipBtn, () => setStatus(n.id, "skip")]);
    if (n.status !== "new") b.push([t.reset, () => setStatus(n.id, "new")]);
    return b;
  };

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 900 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, color: "#111827" }}>🧪 {t.title}</h1>
        <p style={{ margin: "6px 0 0", color: "#6B7280" }}>{t.sub}</p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {(["notes", "pay"] as const).map((x) => (
          <button key={x} type="button" onClick={() => setTab(x)} style={{ ...pill, fontSize: 16, ...(tab === x ? pillOn : {}) }}>{x === "notes" ? t.tabNotes : `💰 ${t.tabPay}`}</button>
        ))}
      </div>
      {error ? <p style={{ color: "#B91C1C" }}>{error}</p> : null}

      {tab === "notes" ? (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["all", "new", "approved", "liked", "done", "skip"] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} style={{ ...pill, ...(filter === f ? pillOn : {}) }}>
                {t[f]}{f !== "all" ? ` · ${count(f)}` : ""}
              </button>
            ))}
          </div>
          {notes && !shown.length ? <p style={{ color: "#6B7280" }}>{t.none}</p> : null}
          <div style={{ display: "grid", gap: 10 }}>
            {shown.map((n) => {
              const [bg, fg] = STATUS_COLOR[n.status] ?? STATUS_COLOR.new;
              return (
                <div key={n.id} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 14, display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 24 }}>{KIND[n.kind] ?? "🧪"}</span>
                    <strong style={{ color: "#111827" }}>{n.name}</strong>
                    <span style={{ background: "#F3F4F6", borderRadius: 999, padding: "2px 10px", fontSize: 13, color: "#374151" }}>{gameName(n.game, L)}</span>
                    {n.word ? <span style={{ fontSize: 13, color: "#6B7280" }}>{t.word}: <bdi>{n.word}</bdi></span> : null}
                    <span style={{ marginInlineStart: "auto", fontSize: 13, color: "#6B7280" }}>{fmt(n.at)}</span>
                    {!RATINGS.has(n.kind) ? <span style={{ background: bg, color: fg, borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{t[n.status] ?? n.status}</span> : null}
                  </div>
                  {RATINGS.has(n.kind) ? <span style={{ fontSize: 13, color: "#6B7280" }}>{t.rating}</span> : null}
                  {n.transcript ? <p style={{ margin: 0, background: "#F5F3FF", borderRadius: 10, padding: "8px 12px", fontSize: 16, color: "#111827" }}>🎤 &quot;{n.transcript}&quot;</p> : null}
                  {n.hasAudio ? (
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <audio controls preload="none" src={api(`&audio=${n.id}`)} style={{ width: "100%", maxWidth: 420 }} />
                      <span style={{ fontSize: 12, color: "#7C3AED" }}>{t.voiceX}</span>
                    </div>
                  ) : null}
                  {n.path ? <span style={{ fontSize: 12, color: "#9CA3AF" }}>{t.page}: {n.path}</span> : null}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {actions(n).map(([label, fn, main]) => (
                      <button key={label} type="button" onClick={fn} style={{ ...btn, ...(main ? { background: "#0EA5A5", color: "#fff", borderColor: "#0EA5A5" } : {}) }}>{label}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {week ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, color: "#111827" }}>
              <button type="button" style={btn} onClick={() => { setSlips(null); setWeek(addMonths(week, -1)); }}>{lang === "he" ? "›" : "‹"}</button>
              <span>{week === thisWeek ? t.thisWeek : `${t.week} ${week.slice(5, 7)}/${week.slice(0, 4)}`}</span>
              <button type="button" style={btn} disabled={week === thisWeek} onClick={() => { setSlips(null); setWeek(addMonths(week, 1)); }}>{lang === "he" ? "‹" : "›"}</button>
            </div>
          ) : null}
          {!slips ? <p style={{ color: "#6B7280" }}>…</p> : !slips.length ? <p style={{ color: "#6B7280" }}>{t.noKids}</p> : null}
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {(slips ?? []).map((s) => (
              <div key={s.uid} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: 16, display: "grid", gap: 10, alignContent: "start" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <strong style={{ fontSize: 18, color: "#111827" }}>{s.name}</strong>
                  <span style={{ background: "#FEF3C7", color: "#92400E", borderRadius: 999, padding: "2px 10px", fontSize: 13, fontWeight: 700 }}>{levels[s.level.key]} · {s.level.tickets}</span>
                </div>
                <span style={{ fontSize: 14, color: "#047857", fontWeight: 700 }}>✅ {lang === "he" ? "רשימת בדיקות" : "Checklist"}: {s.checks.done}/{s.checks.total}</span>
                <div style={{ display: "grid", gap: 4 }}>
                  {s.rows.map((r) => (
                    <div key={r.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 14, color: r.state === "no" ? "#9CA3AF" : "#111827" }}>
                      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t[r.type === "built" ? "builtRow" : r.type]}{r.ticket ? ` #${r.ticket}` : ""} · {gameName(r.game, L)}</span>
                      <b style={{ flex: "0 0 auto", color: r.state === "paid" ? "#166534" : r.state === "pending" ? "#92400E" : "#9CA3AF" }}>{r.state === "paid" ? `+${r.yoon}` : r.state === "pending" ? t.rowWait : t.rowNo}</b>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 8, display: "grid", gap: 2, fontSize: 15, color: "#111827" }}>
                  <span>{t.earned}: <b>{s.earned}</b> Yoon{s.capped ? ` · ${t.capped}` : ""}</span>
                  <span>{t.tax}: <b>{s.tax}</b></span>
                  <span style={{ fontSize: 18 }}>{t.net}: <b style={{ color: "#4338CA" }}>{s.net} Yoon</b></span>
                  {s.pending ? <span style={{ color: "#92400E", fontSize: 13 }}>{t.pending}: {s.pending}</span> : null}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {s.paid ? <span style={{ background: "#DCFCE7", color: "#166534", borderRadius: 10, padding: "6px 12px", fontWeight: 700 }}>{t.paidAt} · {fmt(s.paid.at)}</span>
                    : <button type="button" onClick={() => markPaid(s)} style={{ ...btn, background: "#0EA5A5", color: "#fff", borderColor: "#0EA5A5" }}>{t.paidBtn}</button>}
                  <button type="button" onClick={() => copy(s)} style={btn}>{copied === s.uid ? t.copied : t.copy}</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const pill: React.CSSProperties = { border: "1px solid #E5E7EB", background: "#fff", color: "#374151", borderRadius: 999, padding: "6px 14px", fontSize: 14, cursor: "pointer", fontWeight: 600 };
const pillOn: React.CSSProperties = { background: "#111827", color: "#fff", borderColor: "#111827" };
const btn: React.CSSProperties = { border: "1px solid #E5E7EB", background: "#fff", color: "#111827", borderRadius: 10, padding: "6px 12px", fontSize: 14, cursor: "pointer", fontWeight: 600 };

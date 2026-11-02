"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminContext, type AdminLang } from "../admin-context";

/**
 * Game testers' notes (Gadi 2026-11-02: Osher and Din). Every note, newest
 * first, with the voice note and its transcript. "Approve for Claude" is
 * Gadi's go-ahead: Claude acts on a note only after it is approved here.
 */

type Note = { id: string; name: string; game: string; kind: string; word: string; path: string; transcript: string; hasAudio: boolean; status: string; at: number | null };

const KIND: Record<string, string> = { fun: "😍", boring: "😴", hard: "😵", easy: "🥱", bug: "🐞", idea: "💡", voice: "🎤" };

const S: Record<AdminLang, Record<string, string>> = {
  he: {
    title: "בודקי משחקים", sub: "הערות של אושר ודין מתוך המשחקים. Claude מטפל רק בהערות שאישרתם.",
    none: "עוד אין הערות", all: "הכול", new: "חדשות", approved: "אושרו ל-Claude", done: "טופלו", skip: "לא לטפל",
    approve: "לאשר ל-Claude", skipBtn: "לא לטפל", doneBtn: "טופל", reset: "להחזיר לחדשות", word: "מילה", page: "עמוד",
    kinds: "fun:כיף|boring:משעמם|hard:קשה מדי|easy:קל מדי|bug:באג|idea:רעיון|voice:הקלטה",
  },
  en: {
    title: "Game testers", sub: "Notes from Osher and Din inside the games. Claude acts only on notes you approve.",
    none: "No notes yet", all: "All", new: "New", approved: "Approved for Claude", done: "Done", skip: "Skipped",
    approve: "Approve for Claude", skipBtn: "Skip", doneBtn: "Done", reset: "Back to new", word: "word", page: "page",
    kinds: "fun:Fun|boring:Boring|hard:Too hard|easy:Too easy|bug:Bug|idea:Idea|voice:Voice",
  },
};

const STATUS_COLOR: Record<string, [string, string]> = {
  new: ["#EEF2FF", "#4338CA"], approved: ["#DCFCE7", "#166534"], done: ["#F3F4F6", "#6B7280"], skip: ["#FEF3C7", "#92400E"],
};

export default function AdminTestersClient() {
  const { secret, lang } = useAdminContext();
  const t = S[lang];
  const kindName = Object.fromEntries(t.kinds.split("|").map((x) => x.split(":"))) as Record<string, string>;
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(async () => {
    if (!secret) return;
    try {
      const r = await fetch(`/api/admin/testers?secret=${encodeURIComponent(secret)}`);
      const j = (await r.json()) as { notes?: Note[]; error?: string };
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      setNotes(j.notes ?? []);
    } catch (e) { setError(String(e instanceof Error ? e.message : e)); }
  }, [secret]);
  useEffect(() => {
    let alive = true;
    (async () => { if (alive) await load(); })();
    return () => { alive = false; };
  }, [load]);

  const setStatus = async (id: string, status: string) => {
    setNotes((ns) => ns?.map((n) => (n.id === id ? { ...n, status } : n)) ?? ns);
    await fetch(`/api/admin/testers?secret=${encodeURIComponent(secret)}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }),
    }).catch(() => undefined);
  };

  const shown = (notes ?? []).filter((n) => filter === "all" || n.status === filter);
  const count = (s: string) => (notes ?? []).filter((n) => n.status === s).length;
  const fmt = (ms: number | null) => (ms ? new Date(ms).toLocaleString(lang === "he" ? "he-IL" : "en-GB", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "");

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 900 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, color: "#111827" }}>🧪 {t.title}</h1>
        <p style={{ margin: "6px 0 0", color: "#6B7280" }}>{t.sub}</p>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(["all", "new", "approved", "done", "skip"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} style={{ ...pill, ...(filter === f ? pillOn : {}) }}>
            {t[f]}{f !== "all" ? ` · ${count(f)}` : ""}
          </button>
        ))}
      </div>
      {error ? <p style={{ color: "#B91C1C" }}>{error}</p> : null}
      {notes && !shown.length ? <p style={{ color: "#6B7280" }}>{t.none}</p> : null}
      <div style={{ display: "grid", gap: 10 }}>
        {shown.map((n) => {
          const [bg, fg] = STATUS_COLOR[n.status] ?? STATUS_COLOR.new;
          return (
            <div key={n.id} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 14, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 24 }}>{KIND[n.kind] ?? "🧪"}</span>
                <strong style={{ color: "#111827" }}>{n.name}</strong>
                <span style={{ color: "#374151" }}>{kindName[n.kind] ?? n.kind}</span>
                <span style={{ background: "#F3F4F6", borderRadius: 999, padding: "2px 10px", fontSize: 13, color: "#374151" }}>{n.game}</span>
                {n.word ? <span style={{ fontSize: 13, color: "#6B7280" }}>{t.word}: <bdi>{n.word}</bdi></span> : null}
                <span style={{ marginInlineStart: "auto", fontSize: 13, color: "#6B7280" }}>{fmt(n.at)}</span>
                <span style={{ background: bg, color: fg, borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{t[n.status] ?? n.status}</span>
              </div>
              {n.transcript ? <p style={{ margin: 0, background: "#F5F3FF", borderRadius: 10, padding: "8px 12px", fontSize: 16, color: "#111827" }}>🎤 &quot;{n.transcript}&quot;</p> : null}
              {n.hasAudio ? <audio controls preload="none" src={`/api/admin/testers?secret=${encodeURIComponent(secret)}&audio=${n.id}`} style={{ width: "100%", maxWidth: 420 }} /> : null}
              {n.path ? <span style={{ fontSize: 12, color: "#9CA3AF" }}>{t.page}: {n.path}</span> : null}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {n.status !== "approved" ? <button type="button" onClick={() => setStatus(n.id, "approved")} style={{ ...btn, background: "#0EA5A5", color: "#fff", borderColor: "#0EA5A5" }}>{t.approve}</button> : null}
                {n.status !== "done" ? <button type="button" onClick={() => setStatus(n.id, "done")} style={btn}>{t.doneBtn}</button> : null}
                {n.status !== "skip" ? <button type="button" onClick={() => setStatus(n.id, "skip")} style={btn}>{t.skipBtn}</button> : null}
                {n.status !== "new" ? <button type="button" onClick={() => setStatus(n.id, "new")} style={btn}>{t.reset}</button> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const pill: React.CSSProperties = { border: "1px solid #E5E7EB", background: "#fff", color: "#374151", borderRadius: 999, padding: "6px 14px", fontSize: 14, cursor: "pointer", fontWeight: 600 };
const pillOn: React.CSSProperties = { background: "#111827", color: "#fff", borderColor: "#111827" };
const btn: React.CSSProperties = { border: "1px solid #E5E7EB", background: "#fff", color: "#111827", borderRadius: 10, padding: "6px 12px", fontSize: 14, cursor: "pointer", fontWeight: 600 };

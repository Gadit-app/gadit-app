"use client";

/**
 * /admin/help-chat (2026-11-15): the help assistant's switch, the last test
 * run (scripts/help-chat-eval.ts --save) and every question and answer.
 */

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useAdminContext } from "../admin-context";

type Log = { id: string; ts: string | null; email: string; lang: string; platform: string; plan: string; convId: string; question: string; answer: string; escalate: boolean; reason: string; linkId: string; helped: boolean | null; cost: number; tester: boolean; internal: boolean };
type Case = { id: string; lang: string; platform: string; q: string; answer: string; escalate: boolean; reason: string; linkId: string; ok: boolean; bad: string[]; cost: number };
type Data = {
  config: { enabled?: boolean; audience?: string };
  today: { count?: number; cost?: number; escalated?: number };
  logs: Log[];
  evalRun: { id: string; at: string | null; pass: number; total: number; cost: number; cases: Case[] } | null;
};

const S = {
  he: {
    title: "העוזר של Gadit", on: "פועל", off: "כבוי", turnOn: "להפעיל", turnOff: "לכבות", testers: "רק בודקים וחשבונות שלנו", all: "כל המשתמשים המחוברים (מבוגרים)",
    today: "היום", questions: "שאלות", cost: "עלות", handed: "הועברו לאדם", helped: "עזר", notHelped: "לא עזר",
    evalTitle: "בדיקה אחרונה", passed: "עברו", failed: "נכשלו", showAll: "להראות את כל המקרים", hideAll: "להסתיר",
    logTitle: "שיחות", onlyHanded: "רק מה שהועבר לאדם", onlyBad: "רק 'לא עזר'", search: "חיפוש", none: "אין עדיין שיחות", load: "טוען", err: "הטעינה נכשלה",
    q: "שאלה", a: "תשובה",
  },
  en: {
    title: "Gadit help assistant", on: "On", off: "Off", turnOn: "Turn on", turnOff: "Turn off", testers: "Testers and our accounts only", all: "Every signed-in adult",
    today: "Today", questions: "questions", cost: "cost", handed: "handed to a person", helped: "helpful", notHelped: "not helpful",
    evalTitle: "Last test run", passed: "passed", failed: "failed", showAll: "Show every case", hideAll: "Hide",
    logTitle: "Conversations", onlyHanded: "Handed to a person only", onlyBad: "'Not helpful' only", search: "Search", none: "No conversations yet", load: "Loading", err: "Loading failed",
    q: "Question", a: "Answer",
  },
};

export default function AdminHelpChatClient() {
  const { secret, lang } = useAdminContext();
  const t = S[lang === "he" ? "he" : "en"];
  const [data, setData] = useState<Data | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [onlyHanded, setOnlyHanded] = useState(false);
  const [onlyBad, setOnlyBad] = useState(false);
  const [q, setQ] = useState("");
  const [allCases, setAllCases] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/help-chat?secret=${encodeURIComponent(secret)}`);
      if (!res.ok) throw new Error(String(res.status));
      setData((await res.json()) as Data);
      setState("ready");
    } catch { setState("failed"); }
  }, [secret]);
  useEffect(() => { const id = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(id); }, [load]);

  const save = async (patch: { enabled?: boolean; audience?: string }) => {
    await fetch(`/api/admin/help-chat?secret=${encodeURIComponent(secret)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    void load();
  };

  const logs = useMemo(() => (data?.logs ?? []).filter((l) => (!onlyHanded || l.escalate) && (!onlyBad || l.helped === false) && (!q || `${l.question} ${l.answer} ${l.email}`.toLowerCase().includes(q.toLowerCase()))), [data, onlyHanded, onlyBad, q]);
  const rated = (data?.logs ?? []).filter((l) => l.helped !== null);
  const helpedN = rated.filter((l) => l.helped).length;

  if (state === "loading") return <p style={{ color: "#6B7280" }}>{t.load}…</p>;
  if (state === "failed" || !data) return <p style={{ color: "#b91c1c" }}>{t.err}</p>;
  const on = data.config.enabled === true;
  const ev = data.evalRun;
  const card: CSSProperties = { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: 22, color: "#111827" }}>{t.title}</h1>

      <section style={{ ...card, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <span style={{ padding: "4px 12px", borderRadius: 999, fontWeight: 700, background: on ? "#dcfce7" : "#f3f4f6", color: on ? "#166534" : "#6B7280" }}>{on ? t.on : t.off}</span>
        <button type="button" onClick={() => void save({ enabled: !on })} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #0EA5A5", background: on ? "#fff" : "#0EA5A5", color: on ? "#0EA5A5" : "#fff", fontWeight: 700, cursor: "pointer" }}>{on ? t.turnOff : t.turnOn}</button>
        <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><input type="radio" checked={data.config.audience !== "all"} onChange={() => void save({ audience: "testers" })} /> {t.testers}</label>
        <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><input type="radio" checked={data.config.audience === "all"} onChange={() => void save({ audience: "all" })} /> {t.all}</label>
        <span style={{ marginInlineStart: "auto", color: "#6B7280" }}>
          {t.today}: {data.today.count ?? 0} {t.questions} · {t.cost} ${(data.today.cost ?? 0).toFixed(3)} · {data.today.escalated ?? 0} {t.handed}
          {rated.length > 0 && <> · {t.helped} {helpedN}/{rated.length}</>}
        </span>
      </section>

      {ev && (
        <section style={card}>
          <h2 style={{ margin: "0 0 8px", fontSize: 17 }}>{t.evalTitle}: {ev.pass}/{ev.total} {t.passed} <span style={{ color: "#6B7280", fontWeight: 400, fontSize: 13 }}>({ev.at?.slice(0, 16).replace("T", " ")} UTC · ${Number(ev.cost).toFixed(3)})</span></h2>
          <div style={{ display: "grid", gap: 8 }}>
            {(ev.cases ?? []).filter((c) => allCases || !c.ok).map((c) => (
              <div key={c.id} style={{ borderInlineStart: `4px solid ${c.ok ? "#22c55e" : "#ef4444"}`, padding: "6px 10px", background: c.ok ? "#f0fdf4" : "#fef2f2", borderRadius: 6 }}>
                <div style={{ fontSize: 13, color: "#6B7280" }}>{c.id} · {c.lang} · {c.platform} · {c.escalate ? `→ ${c.reason}` : c.reason} · {c.linkId}{c.bad?.length ? ` · ${c.bad.join(", ")}` : ""}</div>
                <div dir="auto" style={{ fontWeight: 700 }}>{c.q}</div>
                <div dir="auto" style={{ whiteSpace: "pre-wrap" }}>{c.answer || "(handoff)"}</div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setAllCases((v) => !v)} style={{ marginTop: 8, border: 0, background: "none", color: "#0EA5A5", cursor: "pointer", fontWeight: 700 }}>{allCases ? t.hideAll : t.showAll}</button>
        </section>
      )}

      <section style={card}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 17 }}>{t.logTitle} ({logs.length})</h2>
          <label><input type="checkbox" checked={onlyHanded} onChange={(e) => setOnlyHanded(e.target.checked)} /> {t.onlyHanded}</label>
          <label><input type="checkbox" checked={onlyBad} onChange={(e) => setOnlyBad(e.target.checked)} /> {t.onlyBad}</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} style={{ padding: "4px 10px", border: "1px solid #E5E7EB", borderRadius: 8 }} />
        </div>
        {logs.length === 0 ? <p style={{ color: "#6B7280" }}>{t.none}</p> : (
          <div style={{ display: "grid", gap: 8 }}>
            {logs.map((l) => (
              <div key={l.id} style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 10, background: l.escalate ? "#fff7ed" : l.helped === false ? "#fef2f2" : "#fff" }}>
                <div style={{ fontSize: 12.5, color: "#6B7280" }}>{l.ts?.slice(0, 16).replace("T", " ")} · {l.email}{l.internal ? " (ours)" : l.tester ? " (tester)" : ""} · {l.lang} · {l.platform} · {l.plan} · {l.escalate ? `→ ${l.reason}` : l.reason} · {l.linkId} · ${l.cost.toFixed(4)}{l.helped === true ? ` · 👍` : l.helped === false ? ` · 👎` : ""}</div>
                <div dir="auto"><b>{t.q}:</b> {l.question}</div>
                <div dir="auto" style={{ whiteSpace: "pre-wrap" }}><b>{t.a}:</b> {l.answer || "(handoff)"}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

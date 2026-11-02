"use client";

/**
 * The QA checklist on a tester's page (Gadi 2026-11-02): every game, what to
 * play and what to check, ticked right on the screen. Hebrew or English.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import Link from "next/link";
import { useHref } from "@/lib/href";
import { sfx } from "@/lib/game-sfx";
import { CHECKLIST, CHECK_TOTAL } from "@/lib/tester-checklist";

type L = "he" | "en";
const T = {
  he: { done: (n: number, t: number) => `סימנת ${n} מתוך ${t} בדיקות`, where: "איפה:", together: "👥 עם האח", go: "▶ למשחק", open: "לפתוח", close: "לסגור", all: "✅ הכול בוצע!", left: (n: number) => `נשארו ${n}`, tip: "משחקים, בודקים, ומסמנים. כל דבר שמוצאים שולחים ב-🧪.", loading: "טוענים את הרשימה" },
  en: { done: (n: number, t: number) => `You ticked ${n} of ${t} checks`, where: "Where:", together: "👥 With your brother", go: "▶ Open the game", open: "Open", close: "Close", all: "✅ All done!", left: (n: number) => `${n} left`, tip: "Play, check, and tick. Send anything you find with 🧪.", loading: "Loading the list" },
};

export function TesterChecklist({ user, l }: { user: User; l: L }) {
  const t = T[l];
  const href = useHref();
  const [checks, setChecks] = useState<Record<string, number> | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/tester/checklist", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        const j = (await r.json()) as { checks?: Record<string, number> };
        if (!alive) return;
        const c = j.checks ?? {};
        setChecks(c);
        // open the first section that is not finished
        setOpen(CHECKLIST.find((s) => s.items.some((i) => !c[i.id]))?.id ?? null);
      } catch { if (alive) setChecks({}); }
    })();
    return () => { alive = false; };
  }, [user]);

  const toggle = useCallback(async (id: string) => {
    if (!checks) return;
    const done = !checks[id];
    if (done) sfx.correct(); else sfx.tap();
    setChecks((c) => {
      const n = { ...(c ?? {}) };
      if (done) n[id] = Date.now(); else delete n[id];
      return n;
    });
    try {
      await fetch("/api/tester/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ id, done }),
      });
    } catch { /* the tick stays on screen; it saves next time */ }
  }, [checks, user]);

  const count = useMemo(() => (checks ? CHECKLIST.reduce((a, s) => a + s.items.filter((i) => checks[i.id]).length, 0) : 0), [checks]);
  if (!checks) return <p className="tp-muted">{t.loading}…</p>;

  return (
    <div className="tc-root">
      <style>{CSS}</style>
      <section className="tc-top">
        <strong>{count === CHECK_TOTAL ? t.all : t.done(count, CHECK_TOTAL)}</strong>
        <div className="tc-bar"><i style={{ width: `${(count / CHECK_TOTAL) * 100}%` }} /></div>
        <span className="tc-tip">{t.tip}</span>
      </section>
      {CHECKLIST.map((s) => {
        const n = s.items.filter((i) => checks[i.id]).length;
        const full = n === s.items.length;
        const isOpen = open === s.id;
        return (
          <section key={s.id} className={`tc-sec${full ? " is-full" : ""}`}>
            <button type="button" className="tc-head" onClick={() => setOpen(isOpen ? null : s.id)} aria-expanded={isOpen}>
              <span className="tc-mark">{full ? "✅" : `${n}/${s.items.length}`}</span>
              <span className="tc-title">{l === "he" ? s.he : s.en}</span>
              {s.together ? <span className="tc-tog">{t.together}</span> : null}
              <span className="tc-chev" aria-hidden="true">{isOpen ? "▴" : "▾"}</span>
            </button>
            {isOpen ? (
              <div className="tc-body">
                <div className="tc-go-row">
                  {s.link ? <Link href={href(s.link)} className="tc-go">{t.go}</Link> : null}
                  <span className="tc-where">{t.where} {l === "he" ? s.where.he : s.where.en}</span>
                </div>
                <ul>
                  {s.items.map((i) => (
                    <li key={i.id}>
                      <label className={`tc-item${checks[i.id] ? " is-on" : ""}`}>
                        <input type="checkbox" checked={!!checks[i.id]} onChange={() => toggle(i.id)} />
                        <span className="tc-box" aria-hidden="true">{checks[i.id] ? "✓" : ""}</span>
                        <span>{l === "he" ? i.he : i.en}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

const CSS = `
.tc-root{display:grid;gap:10px}
.tc-top{background:linear-gradient(135deg,#047857,#10b981);color:#fff;border-radius:22px;padding:16px;display:grid;gap:8px;text-align:center}
.tc-top strong{font-size:20px}
.tc-bar{height:12px;border-radius:999px;background:#ffffff33;overflow:hidden}
.tc-bar i{display:block;height:100%;background:#fde68a;border-radius:999px;transition:width .3s}
.tc-tip{font-size:14px;opacity:.9}
.tc-sec{background:#fff;border-radius:18px;box-shadow:0 3px 12px #1e1b4b12;overflow:hidden}
.tc-sec.is-full{background:#f0fdf4}
.tc-head{width:100%;display:flex;align-items:center;gap:10px;border:0;background:none;padding:12px 14px;font:inherit;color:#1e1b4b;cursor:pointer;text-align:start}
.tc-mark{flex:0 0 auto;min-width:46px;text-align:center;background:#eef2ff;color:#4338ca;border-radius:999px;padding:3px 8px;font-weight:800;font-size:13px}
.tc-sec.is-full .tc-mark{background:none;font-size:18px}
.tc-title{flex:1;min-width:0;font-weight:800;font-size:16px}
.tc-tog{flex:0 0 auto;font-size:12px;background:#fef3c7;color:#92400e;border-radius:999px;padding:2px 8px;font-weight:700}
.tc-chev{flex:0 0 auto;color:#6b7280}
.tc-body{padding:0 14px 14px;display:grid;gap:8px}
.tc-where{font-size:13px;color:#6b7280}
.tc-go-row{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center}
.tc-go{background:#4338ca;color:#fff;border-radius:999px;padding:8px 16px;font-weight:800;text-decoration:none;box-shadow:0 3px 0 #312e81}
.tc-go:active{transform:translateY(2px);box-shadow:0 1px 0 #312e81}
.tc-body ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}
.tc-item{position:relative;display:grid;grid-template-columns:30px minmax(0,1fr);gap:10px;align-items:center;border:2px solid #eef2ff;border-radius:14px;padding:10px 12px;cursor:pointer;font-size:16px}
.tc-item input{position:absolute;opacity:0;pointer-events:none}
.tc-box{width:28px;height:28px;border-radius:8px;border:2px solid #a5b4fc;display:grid;place-items:center;font-weight:900;color:#fff;font-size:18px}
.tc-item.is-on{border-color:#bbf7d0;background:#f0fdf4}
.tc-item.is-on .tc-box{background:#10b981;border-color:#10b981}
.tc-item:focus-within{outline:3px solid #a5b4fc;outline-offset:2px}
`;

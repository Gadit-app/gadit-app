"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";

/**
 * "First steps" card at the top of the school dashboard (Gadi 2026-10-10),
 * the same steps as the pilot onboarding emails. Each step ticks itself when
 * it happens; only "teachers have the login" is ticked by hand. Gone once
 * every step is done.
 */

type Props = {
  lang: string;
  curriculum?: string;
  classrooms: number;
  words: number;
  logo: boolean;
  checklist?: { activity?: string; teachers?: string };
};

const COPY = {
  he: {
    title: "הצעדים הראשונים",
    sub: (d: number, n: number) => `${d} מתוך ${n} הושלמו`,
    steps: {
      curriculum: ["בחירת תוכנית הלימודים וסוג בית הספר", "לקבוצות המילים"],
      classroom: ["הוספת הכיתות שבפיילוט, עם שם המורה של כל כיתה", "לכיתות"],
      lesson: ["הקרנת שיעור ראשון בכיתה", "לקבוצות המילים"],
      activity: ["חידון או משחק לכיתה", "לקבוצות המילים"],
      teachers: ["מסירת פרטי הכניסה למורים בשכבות המשתתפות", "סיימתי"],
      logo: ["העלאת הלוגו של בית הספר", "להגדרות"],
    },
  },
  en: {
    title: "First steps",
    sub: (d: number, n: number) => `${d} of ${n} done`,
    steps: {
      curriculum: ["Choose your curriculum and school type", "Word sets"],
      classroom: ["Add the pilot classes, each with its teacher", "Classes"],
      lesson: ["Project your first lesson in class", "Word sets"],
      activity: ["Run a class quiz or game", "Word sets"],
      teachers: ["Give the login to teachers in the participating grades", "Done"],
      logo: ["Upload the school logo", "Settings"],
    },
  },
} as const;

export function SchoolChecklist({ lang, curriculum, classrooms, words, logo, checklist, onTab }: Props & { onTab: (t: "classrooms" | "settings") => void }) {
  const { user } = useAuth();
  const href = useHref();
  const c = lang === "he" ? COPY.he : COPY.en;
  const [teachersLocal, setTeachersLocal] = useState(false);

  const done = {
    curriculum: !!curriculum,
    classroom: classrooms > 0,
    lesson: words > 0,
    activity: !!checklist?.activity,
    teachers: !!checklist?.teachers || teachersLocal,
    logo,
  };
  const keys = Object.keys(done) as Array<keyof typeof done>;
  const count = keys.filter((k) => done[k]).length;
  if (count === keys.length) return null;

  async function markTeachers() {
    setTeachersLocal(true);
    try {
      await fetch("/api/schools/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user?.getIdToken()}` },
        body: JSON.stringify({ step: "teachers" }),
      });
    } catch { /* stays ticked on this screen */ }
  }

  const action = (k: keyof typeof done) => {
    const label = c.steps[k][1];
    if (k === "teachers") return <button type="button" className="sc-act" onClick={() => void markTeachers()}>{label}</button>;
    if (k === "classroom") return <button type="button" className="sc-act" onClick={() => onTab("classrooms")}>{label}</button>;
    if (k === "logo") return <button type="button" className="sc-act" onClick={() => onTab("settings")}>{label}</button>;
    return <Link className="sc-act" href={href("/sets")}>{label}</Link>;
  };

  return (
    <section className="sc-card" aria-label={c.title}>
      <style>{CSS}</style>
      <div className="sc-head">
        <h2 className="sc-title">{c.title}</h2>
        <span className="sc-sub">{c.sub(count, keys.length)}</span>
      </div>
      <div className="sc-bar"><span style={{ width: `${Math.round((count / keys.length) * 100)}%` }} /></div>
      <ol className="sc-list">
        {keys.map((k) => (
          <li key={k} className={done[k] ? "is-done" : ""}>
            <span className="sc-dot" aria-hidden="true">{done[k] ? "✓" : ""}</span>
            <span className="sc-text">{c.steps[k][0]}</span>
            {!done[k] && action(k)}
          </li>
        ))}
      </ol>
    </section>
  );
}

const CSS = `
.sc-card { background: var(--surface, #fff); border: 1px solid rgba(14,165,165,0.28); border-radius: 16px; padding: 18px 20px; margin-bottom: 24px; display: grid; gap: 12px; }
.sc-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.sc-title { margin: 0; font-size: 18px; font-weight: 700; color: var(--ink, #111827); }
.sc-sub { font-size: 13px; color: var(--ink-muted, #6B7280); font-variant-numeric: tabular-nums; }
.sc-bar { height: 6px; border-radius: 999px; background: rgba(14,165,165,0.12); overflow: hidden; }
.sc-bar span { display: block; height: 100%; background: #0F6F6C; border-radius: 999px; transition: width 300ms ease; }
.sc-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.sc-list li { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 14.5px; color: var(--ink, #111827); }
.sc-list li.is-done .sc-text { color: var(--ink-muted, #6B7280); text-decoration: line-through; text-decoration-color: rgba(107,114,128,0.5); }
.sc-dot { width: 22px; height: 22px; border-radius: 50%; flex: none; display: grid; place-items: center; font-size: 13px; font-weight: 800; color: #fff; background: transparent; box-shadow: inset 0 0 0 2px rgba(14,165,165,0.45); }
.sc-list li.is-done .sc-dot { background: #0F6F6C; box-shadow: none; }
.sc-text { flex: 1 1 200px; min-width: 0; }
.sc-act { font: inherit; font-size: 13px; font-weight: 700; color: #0F6F6C; background: rgba(14,165,165,0.10); border: 0; border-radius: 999px; padding: 5px 12px; cursor: pointer; text-decoration: none; }
`;

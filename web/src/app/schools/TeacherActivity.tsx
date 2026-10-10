"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

/**
 * The principal dashboard for schools without student codes (all Israeli
 * schools), built from what the teachers project in class (Gadi
 * 2026-10-10): words in the class dictionary, lessons, class quizzes and
 * games, an 8-week timeline, subjects, the words classes came back to, and
 * the recent lessons. Data: /api/schools/teacher-activity.
 */

type Data = {
  totals: { dictionary: number; wordsShown: number; lessons: number; lessonsThisWeek: number; activities: number };
  weeks: { week: string; words: number; lessons: number; activities: number }[];
  subjects: { subject: string; lessons: number; words: number }[];
  repeated: { word: string; days: number }[];
  recent: { day: string; title: string; subject: string; grade: string; words: number; quizzes: number }[];
};

const COPY = {
  he: {
    loading: "טוען את נתוני בית הספר...",
    empty: "עוד לא הוקרן שיעור. כשהמורים יקרינו מילים מקבוצות המילים, כאן תראו מה נלמד, באילו מקצועות ומתי.",
    dictionary: "מילים במילון בית הספר", lessons: "שיעורים עם Gadit", thisWeek: "שיעורים השבוע", activities: "חידונים ומשחקים לכיתה",
    weeks: "פעילות ב-8 השבועות האחרונים", weekOf: "שבוע", wordsLbl: "מילים", lessonsLbl: "שיעורים",
    subjects: "לפי מקצוע", repeated: "מילים שהכיתות חזרו אליהן", repeatedSub: "הוקרנו ביותר מיום אחד", daysLbl: "ימים",
    recent: "שיעורים אחרונים", quizLbl: "חידונים ומשחקים", noRepeat: "עוד אין מילים שהוקרנו ביותר מיום אחד.",
  },
  en: {
    loading: "Loading your school's numbers...",
    empty: "No lesson projected yet. When teachers project words from the word sets, you'll see here what was taught, in which subjects and when.",
    dictionary: "Words in the school dictionary", lessons: "Lessons with Gadit", thisWeek: "Lessons this week", activities: "Class quizzes and games",
    weeks: "Activity over the last 8 weeks", weekOf: "Week of", wordsLbl: "words", lessonsLbl: "lessons",
    subjects: "By subject", repeated: "Words classes came back to", repeatedSub: "projected on more than one day", daysLbl: "days",
    recent: "Recent lessons", quizLbl: "quizzes and games", noRepeat: "No word has been projected on more than one day yet.",
  },
};

const fmtDay = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

export function TeacherActivity({ lang }: { lang: string }) {
  const { user } = useAuth();
  const c = lang === "he" ? COPY.he : COPY.en;
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/schools/teacher-activity", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        if (!r.ok) throw new Error(String(r.status));
        const j = (await r.json()) as Data;
        if (!cancelled) setData(j);
      } catch {
        if (!cancelled) setErr(true);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (err) return null;
  if (!data) return <p className="ta-muted">{c.loading}</p>;
  const t = data.totals;
  const maxW = Math.max(1, ...data.weeks.map((w) => w.words));

  return (
    <section className="ta">
      <style>{CSS}</style>
      <div className="ta-stats">
        {[[c.dictionary, t.dictionary], [c.lessons, t.lessons], [c.thisWeek, t.lessonsThisWeek], [c.activities, t.activities]].map(([l, v]) => (
          <div key={String(l)} className="ta-stat"><div className="ta-num">{Number(v).toLocaleString()}</div><div className="ta-lbl">{l}</div></div>
        ))}
      </div>

      {t.lessons === 0 ? (
        <div className="ta-empty">{c.empty}</div>
      ) : (
        <>
          <div className="ta-card">
            <h3 className="ta-h">{c.weeks}</h3>
            <div className="ta-bars" role="img" aria-label={c.weeks}>
              {data.weeks.map((w) => (
                <div key={w.week} className="ta-bar-col" title={`${c.weekOf} ${fmtDay(w.week)}: ${w.words} ${c.wordsLbl}, ${w.lessons} ${c.lessonsLbl}`}>
                  <span className="ta-bar-val">{w.words || ""}</span>
                  <div className="ta-bar" style={{ height: `${Math.round((w.words / maxW) * 100)}%` }} />
                  <span className="ta-bar-day">{fmtDay(w.week)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ta-grid">
            <div className="ta-card">
              <h3 className="ta-h">{c.subjects}</h3>
              <ul className="ta-list">
                {data.subjects.map((s) => (
                  <li key={s.subject}><span>{s.subject}</span><span className="ta-muted">{s.lessons} {c.lessonsLbl} · {s.words} {c.wordsLbl}</span></li>
                ))}
              </ul>
            </div>
            <div className="ta-card">
              <h3 className="ta-h">{c.repeated}</h3>
              <p className="ta-muted ta-sub">{c.repeatedSub}</p>
              {data.repeated.length === 0 ? (
                <p className="ta-muted">{c.noRepeat}</p>
              ) : (
                <div className="ta-chips">
                  {data.repeated.map((r) => <span key={r.word} className="ta-chip">{r.word} <b>{r.days}</b></span>)}
                </div>
              )}
            </div>
          </div>

          <div className="ta-card">
            <h3 className="ta-h">{c.recent}</h3>
            <ul className="ta-list">
              {data.recent.map((l) => (
                <li key={l.day + l.title}>
                  <span><b>{fmtDay(l.day)}</b> · {l.subject}{l.title ? ` · ${l.title}` : ""}{l.grade ? ` · ${l.grade}` : ""}</span>
                  <span className="ta-muted">{l.words} {c.wordsLbl}{l.quizzes ? ` · ${l.quizzes} ${c.quizLbl}` : ""}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}

const CSS = `
.ta { display: grid; gap: 16px; }
.ta-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.ta-stat, .ta-card { background: var(--surface, #fff); border: 1px solid var(--hairline, rgba(15,23,42,0.1)); border-radius: 14px; padding: 16px 18px; min-width: 0; }
.ta-num { font-size: 28px; font-weight: 800; color: var(--ink, #111827); font-variant-numeric: tabular-nums; }
.ta-lbl { font-size: 13px; color: var(--ink-muted, #6B7280); margin-top: 2px; }
.ta-empty { background: rgba(14,165,165,0.08); border: 1px solid rgba(14,165,165,0.25); border-radius: 14px; padding: 16px 18px; color: #0E7490; font-size: 14.5px; line-height: 1.6; }
.ta-h { margin: 0 0 12px; font-size: 16px; font-weight: 700; color: var(--ink, #111827); }
.ta-sub { margin: -8px 0 12px; font-size: 12.5px; }
.ta-muted { color: var(--ink-muted, #6B7280); font-size: 13px; }
.ta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.ta-bars { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 8px; align-items: end; height: 170px; }
.ta-bar-col { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; gap: 4px; min-width: 0; }
.ta-bar { width: 70%; min-height: 3px; background: #0F6F6C; border-radius: 6px 6px 2px 2px; }
.ta-bar-val { font-size: 11.5px; font-weight: 700; color: var(--ink, #111827); font-variant-numeric: tabular-nums; }
.ta-bar-day { font-size: 11px; color: var(--ink-muted, #6B7280); font-variant-numeric: tabular-nums; }
.ta-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.ta-list li { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; font-size: 14px; color: var(--ink, #111827); border-bottom: 1px solid var(--hairline, rgba(15,23,42,0.06)); padding-bottom: 8px; }
.ta-list li:last-child { border-bottom: 0; padding-bottom: 0; }
.ta-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.ta-chip { font-size: 13px; padding: 4px 10px; border-radius: 999px; background: rgba(14,165,165,0.10); color: #0F6F6C; }
.ta-chip b { margin-inline-start: 4px; }
`;

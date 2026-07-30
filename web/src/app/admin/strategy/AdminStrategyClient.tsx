"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminContext } from "../admin-context";

/**
 * /admin/strategy — live tracker for the plan to reach 2,500 paying subs
 * by 2026-12-31. Not a static doc: checklists tick, and the state persists
 * in Firestore (strategicPlan/progress + /alumni). The plan body itself is
 * seeded separately (never in the repo) into strategicPlan/config.
 *
 * Design principle from the brief: every task is a self-contained WORK
 * ORDER (what, why, how, with what asset, what "done" means) so anyone
 * with admin access can run the plan without asking Gadi. The startup tab
 * renders the full order, not just a title.
 */

// ─── types (mirror the seed schema) ─────────────────────────────────
type Goal = { target: number; deadline: string; baseCase: number; mrrTargetUsd: number; mrrBaseCaseUsd: number; startingSubs: number; startingMrrUsd: number };
type NorthStar = { id: string; labelHe: string; labelEn: string; whyHe: string };
type Bet = { id: string; titleHe: string; bodyHe: string };
type Market = { id: string; wave: number; nameHe: string; months: string; mechanismHe: string; owner: string };
type ChannelTarget = { id: string; nameHe: string; target: number; actual: number; noteHe: string };
type MonthlyRamp = { id: string; labelHe: string; focusHe: string; targetCumulative: number; actual: number | null; hit: boolean | null; kpisHe: string[] };
type FunnelStage = { id: string; labelHe: string };
type AlumniCfg = { targetContacted: number; targetActivated: number; baseCaseActivated: number; whyHe: string; funnelStages: FunnelStage[] };
type StartupItem = { id: string; titleHe: string; whyHe: string; howHe: string[]; successMetricHe: string; estMinutes: number; week: number; stage: string };
type Task = { id: string; titleHe: string; whyHe: string; estMinutes: number };
type Config = {
  version: number;
  goal: Goal;
  northStar: NorthStar;
  honestNoteHe: string;
  bets: Bet[];
  markets: Market[];
  channelTargets: ChannelTarget[];
  monthlyRamp: MonthlyRamp[];
  alumni: AlumniCfg;
  startupChecklist: StartupItem[];
  dailyTasks: Task[];
  weeklyTasks: Task[];
};
type Progress = {
  daily: Record<string, string[]>;
  weekly: Record<string, string[]>;
  startup: Record<string, boolean>;
  channelActual: Record<string, number>;
  monthly: Record<string, { actual?: number; hit?: boolean }>;
};
type Alumni = { counts: Record<string, number>; weekly: Record<string, Record<string, number>> };
type ApiData = { config: Config | null; progress: Progress; alumni: Alumni };

type Tab = "overview" | "alumni" | "today" | "week" | "startup";
type Stage = "all" | "acquisition" | "activation" | "retention" | "referral" | "revenue";

// ─── date helpers (client-only; the page renders after mount) ───────
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isoWeekKey(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

// ─── UI strings (chrome only; the plan content is Hebrew in the seed) ─
const S = {
  he: {
    title: "תוכנית אסטרטגית",
    subtitle: "מעקב חי · 2,500 מנויים משלמים עד 31.12.2026",
    tabs: { overview: "סקירה", alumni: "בוגרות", today: "היום", week: "השבוע", startup: "התנעה" },
    payingNow: "משלמים כרגע",
    of: "מתוך",
    baseCase: "תרחיש בסיס",
    mrrNow: "MRR נוכחי",
    northStar: "כוכב הצפון",
    honestTitle: "הערה כנה",
    bets: "ארבעת ההימורים",
    channels: "יעדי ערוצים",
    target: "יעד",
    actual: "בפועל",
    monthly: "אבני דרך חודשיות",
    focus: "מיקוד",
    cumulative: "מצטבר",
    hit: "הושג",
    miss: "לא הושג",
    future: "עתידי",
    kpis: "מדדים",
    marketsTitle: "שווקים לפי גל",
    wave: "גל",
    mechanism: "מנגנון",
    owner: "אחראי",
    alumniWhy: "למה זה המדד הקובע",
    funnel: "משפך הבוגרות",
    activatedVsTarget: "קודים שהופעלו מול היעד",
    weeklyActivations: "הפעלות לפי שבוע",
    noWeekly: "עדיין אין נתונים שבועיים. עדכן את השלב \"קוד הופעל בכיתה\" ותצבור מגמה.",
    todayTitle: "משימות היום",
    todayDate: "היום",
    weekTitle: "משימות השבוע",
    weekLabel: "שבוע",
    startupTitle: "צ׳קליסט התנעה",
    startupSub: "כל פריט הוא הוראת עבודה מלאה. מישהו אחר יכול להריץ אותה.",
    filterWeek: "שבוע",
    filterStage: "שלב",
    allWeeks: "כל השבועות",
    allStages: "כל השלבים",
    why: "למה",
    how: "איך",
    success: "מה מגדיר הצלחה",
    minutes: "דק׳",
    weekN: "שבוע",
    done: "הושלם",
    empty: "התוכנית עדיין לא הוזרעה.",
    emptyHow: "הרץ פעם אחת מהמכונה שלך:",
    stages: { acquisition: "רכישה", activation: "הפעלה", retention: "שימור", referral: "הפניות", revenue: "הכנסה" },
    loading: "טוען…",
    error: "שגיאה בטעינה.",
  },
  en: {
    title: "Strategic plan",
    subtitle: "Live tracker · 2,500 paying subscribers by 2026-12-31",
    tabs: { overview: "Overview", alumni: "Alumni", today: "Today", week: "Week", startup: "Startup" },
    payingNow: "Paying now",
    of: "of",
    baseCase: "Base case",
    mrrNow: "Current MRR",
    northStar: "North star",
    honestTitle: "Honest note",
    bets: "The four bets",
    channels: "Channel targets",
    target: "Target",
    actual: "Actual",
    monthly: "Monthly milestones",
    focus: "Focus",
    cumulative: "Cumulative",
    hit: "Hit",
    miss: "Missed",
    future: "Future",
    kpis: "KPIs",
    marketsTitle: "Markets by wave",
    wave: "Wave",
    mechanism: "Mechanism",
    owner: "Owner",
    alumniWhy: "Why this is the deciding metric",
    funnel: "Alumni funnel",
    activatedVsTarget: "Codes activated vs target",
    weeklyActivations: "Activations by week",
    noWeekly: "No weekly data yet. Update \"code activated in class\" to build a trend.",
    todayTitle: "Today's tasks",
    todayDate: "Today",
    weekTitle: "This week's tasks",
    weekLabel: "Week",
    startupTitle: "Startup checklist",
    startupSub: "Each item is a full work order. Someone else can run it.",
    filterWeek: "Week",
    filterStage: "Stage",
    allWeeks: "All weeks",
    allStages: "All stages",
    why: "Why",
    how: "How",
    success: "Definition of done",
    minutes: "min",
    weekN: "Week",
    done: "Done",
    empty: "The plan has not been seeded yet.",
    emptyHow: "Run this once from your machine:",
    stages: { acquisition: "Acquisition", activation: "Activation", retention: "Retention", referral: "Referral", revenue: "Revenue" },
    loading: "Loading…",
    error: "Failed to load.",
  },
};

const TEAL = "#0EA5A5";
const INK = "#111827";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const GREEN = "#059669";
const RED = "#DC2626";

export default function AdminStrategyClient() {
  const { secret, lang } = useAdminContext();
  const t = S[lang];

  const [data, setData] = useState<ApiData | null>(null);
  const [paying, setPaying] = useState<number | null>(null);
  const [mrr, setMrr] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("today");

  const dayKey = useMemo(() => todayKey(), []);
  const weekKey = useMemo(() => isoWeekKey(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sRes, oRes] = await Promise.all([
          fetch(`/api/admin/strategy?secret=${encodeURIComponent(secret)}`),
          fetch(`/api/admin/overview?secret=${encodeURIComponent(secret)}`),
        ]);
        if (!sRes.ok) throw new Error("strategy fetch failed");
        const s = (await sRes.json()) as ApiData;
        if (!cancelled) setData(s);
        if (oRes.ok) {
          const o = await oRes.json();
          if (!cancelled) {
            setPaying(o?.revenue?.activeSubscriptions ?? null);
            setMrr(o?.revenue?.mrrUsd ?? null);
          }
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [secret]);

  // Fire-and-forget partial merge; caller has already updated local state.
  const patch = useCallback(
    (partial: Record<string, unknown>) => {
      fetch(`/api/admin/strategy?secret=${encodeURIComponent(secret)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      }).catch(() => {});
    },
    [secret],
  );

  // ---- mutations ----
  const toggleDaily = (id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const cur = prev.progress.daily[dayKey] ?? [];
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      patch({ progress: { daily: { [dayKey]: next } } });
      return { ...prev, progress: { ...prev.progress, daily: { ...prev.progress.daily, [dayKey]: next } } };
    });
  };
  const toggleWeekly = (id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const cur = prev.progress.weekly[weekKey] ?? [];
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      patch({ progress: { weekly: { [weekKey]: next } } });
      return { ...prev, progress: { ...prev.progress, weekly: { ...prev.progress.weekly, [weekKey]: next } } };
    });
  };
  const toggleStartup = (id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = !prev.progress.startup[id];
      patch({ progress: { startup: { [id]: next } } });
      return { ...prev, progress: { ...prev.progress, startup: { ...prev.progress.startup, [id]: next } } };
    });
  };
  const setChannelActual = (id: string, n: number) => {
    setData((prev) => {
      if (!prev) return prev;
      patch({ progress: { channelActual: { [id]: n } } });
      return { ...prev, progress: { ...prev.progress, channelActual: { ...prev.progress.channelActual, [id]: n } } };
    });
  };
  const setMonthly = (id: string, upd: { actual?: number; hit?: boolean }) => {
    setData((prev) => {
      if (!prev) return prev;
      const merged = { ...(prev.progress.monthly[id] ?? {}), ...upd };
      patch({ progress: { monthly: { [id]: merged } } });
      return { ...prev, progress: { ...prev.progress, monthly: { ...prev.progress.monthly, [id]: merged } } };
    });
  };
  const setAlumniCount = (stage: string, n: number) => {
    setData((prev) => {
      if (!prev) return prev;
      patch({ alumni: { counts: { [stage]: n } } });
      return { ...prev, alumni: { ...prev.alumni, counts: { ...prev.alumni.counts, [stage]: n } } };
    });
  };
  const setAlumniWeekly = (stage: string, n: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const wk = { ...(prev.alumni.weekly[weekKey] ?? {}), [stage]: n };
      patch({ alumni: { weekly: { [weekKey]: wk } } });
      return { ...prev, alumni: { ...prev.alumni, weekly: { ...prev.alumni.weekly, [weekKey]: wk } } };
    });
  };

  if (loading) return <div style={{ color: MUTED, fontSize: 14, padding: 24 }}>{t.loading}</div>;
  if (error || !data) return <div style={{ color: RED, fontSize: 14, padding: 24 }}>{t.error}</div>;

  const { config, progress, alumni } = data;

  if (!config) {
    return (
      <div>
        <Header t={t} />
        <div style={{ ...card, marginTop: 16, textAlign: "start" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: INK }}>{t.empty}</div>
          <div style={{ fontSize: 13, color: MUTED, margin: "10px 0 8px" }}>{t.emptyHow}</div>
          <pre style={{ background: "#F3F4F6", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 12, fontSize: 12, overflowX: "auto", direction: "ltr", textAlign: "left" }}>
{`curl -X POST "https://www.gadit.app/api/admin/strategy/seed?secret=$ADMIN_SECRET" \\
  -H "Content-Type: application/json" \\
  --data-binary @strategic-plan-seed.json`}
          </pre>
        </div>
      </div>
    );
  }

  const goalTarget = config.goal.target;
  const pct = paying != null ? Math.min(100, Math.round((paying / goalTarget) * 1000) / 10) : 0;

  return (
    <div>
      <Header t={t} />

      {/* Progress bar toward the goal — real payers from /api/admin/overview */}
      <div style={{ ...card, marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <div>
            <span style={{ fontSize: 30, fontWeight: 800, color: TEAL }}>{paying ?? "—"}</span>
            <span style={{ fontSize: 15, color: MUTED, fontWeight: 600 }}> {t.of} {goalTarget.toLocaleString()}</span>
            <span style={{ fontSize: 13, color: MUTED, marginInlineStart: 10 }}>{t.payingNow}</span>
          </div>
          <div style={{ display: "flex", gap: 18, fontSize: 12.5, color: MUTED }}>
            <span>{t.baseCase}: <b style={{ color: INK }}>{config.goal.baseCase.toLocaleString()}</b></span>
            <span>{t.mrrNow}: <b style={{ color: INK }} dir="ltr">${mrr != null ? mrr.toLocaleString() : "—"}</b></span>
          </div>
        </div>
        <div style={{ marginTop: 12, height: 12, borderRadius: 999, background: "#F3F4F6", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${TEAL}, #0E7490)`, borderRadius: 999, transition: "width .4s" }} />
        </div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>{pct}%</div>

        {/* North star + honest note */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginTop: 16 }}>
          <Note tone="teal" title={`${t.northStar} · ${lang === "he" ? config.northStar.labelHe : config.northStar.labelEn}`} body={config.northStar.whyHe} />
          <Note tone="amber" title={t.honestTitle} body={config.honestNoteHe} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginTop: 18, flexWrap: "wrap" }}>
        {(["today", "week", "startup", "alumni", "overview"] as Tab[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            style={{
              padding: "8px 16px", borderRadius: 999, border: `1px solid ${tab === k ? TEAL : BORDER}`,
              background: tab === k ? TEAL : "#fff", color: tab === k ? "#fff" : INK,
              fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {t.tabs[k]}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        {tab === "today" && (
          <TaskList t={t} tasks={config.dailyTasks} checked={progress.daily[dayKey] ?? []} onToggle={toggleDaily} dateLabel={`${t.todayDate} · ${dayKey}`} title={t.todayTitle} />
        )}
        {tab === "week" && (
          <TaskList t={t} tasks={config.weeklyTasks} checked={progress.weekly[weekKey] ?? []} onToggle={toggleWeekly} dateLabel={`${t.weekLabel} · ${weekKey}`} title={t.weekTitle} />
        )}
        {tab === "startup" && (
          <StartupTab t={t} items={config.startupChecklist} done={progress.startup} onToggle={toggleStartup} />
        )}
        {tab === "alumni" && (
          <AlumniTab t={t} cfg={config.alumni} alumni={alumni} weekKey={weekKey} onCount={setAlumniCount} onWeekly={setAlumniWeekly} />
        )}
        {tab === "overview" && (
          <OverviewTab t={t} config={config} progress={progress} onChannel={setChannelActual} onMonthly={setMonthly} lang={lang} />
        )}
      </div>
    </div>
  );
}

// ─── header ─────────────────────────────────────────────────────────
function Header({ t }: { t: (typeof S)["he"] }) {
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: INK }}>{t.title}</h1>
      <div style={{ fontSize: 13.5, color: MUTED, marginTop: 4 }}>{t.subtitle}</div>
    </div>
  );
}

// ─── shared bits ────────────────────────────────────────────────────
const card: React.CSSProperties = { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18 };

function Note({ tone, title, body }: { tone: "teal" | "amber"; title: string; body: string }) {
  const bg = tone === "teal" ? "rgba(14,165,165,0.07)" : "rgba(217,119,6,0.08)";
  const bd = tone === "teal" ? "rgba(14,165,165,0.25)" : "rgba(217,119,6,0.25)";
  const fg = tone === "teal" ? "#0b7d7d" : "#b45309";
  return (
    <div style={{ background: bg, border: `1px solid ${bd}`, borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: fg, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

function EditableNumber({ value, onCommit, width = 70 }: { value: number; onCommit: (n: number) => void; width?: number }) {
  const [v, setV] = useState(String(value));
  // Sync to an externally-changed prop without an effect (React's
  // adjust-state-during-render pattern), so the field reflects a save
  // that happened elsewhere.
  const [seen, setSeen] = useState(value);
  if (seen !== value) {
    setSeen(value);
    setV(String(value));
  }
  return (
    <input
      type="number"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => { const n = parseInt(v, 10); onCommit(Number.isFinite(n) ? n : 0); }}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      style={{ width, padding: "5px 8px", borderRadius: 6, border: `1px solid ${BORDER}`, fontSize: 13, fontFamily: "inherit", textAlign: "center", direction: "ltr" }}
    />
  );
}

function Checkbox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      style={{
        width: 22, height: 22, flexShrink: 0, borderRadius: 6, cursor: "pointer",
        border: `2px solid ${checked ? TEAL : "#D1D5DB"}`, background: checked ? TEAL : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
      }}
    >
      {checked && <IconCheck />}
    </button>
  );
}

// ─── task list (today / week) ───────────────────────────────────────
function TaskList({ t, tasks, checked, onToggle, dateLabel, title }: {
  t: (typeof S)["he"]; tasks: Task[]; checked: string[]; onToggle: (id: string) => void; dateLabel: string; title: string;
}) {
  const doneCount = tasks.filter((x) => checked.includes(x.id)).length;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: INK }}>{title}</div>
          <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{dateLabel}</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: doneCount === tasks.length ? GREEN : MUTED }}>{doneCount}/{tasks.length}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tasks.map((task) => {
          const on = checked.includes(task.id);
          return (
            <div key={task.id} style={{ ...card, display: "flex", gap: 14, alignItems: "flex-start", opacity: on ? 0.72 : 1 }}>
              <Checkbox checked={on} onClick={() => onToggle(task.id)} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: INK, textDecoration: on ? "line-through" : "none" }}>{task.titleHe}</div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 1.55 }}>{task.whyHe}</div>
              </div>
              <span style={{ fontSize: 12, color: MUTED, whiteSpace: "nowrap", flexShrink: 0 }}>{task.estMinutes} {t.minutes}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── startup checklist (full work orders) ───────────────────────────
function StartupTab({ t, items, done, onToggle }: {
  t: (typeof S)["he"]; items: StartupItem[]; done: Record<string, boolean>; onToggle: (id: string) => void;
}) {
  const [week, setWeek] = useState<number | "all">("all");
  const [stage, setStage] = useState<Stage>("all");
  const weeks = Array.from(new Set(items.map((i) => i.week))).sort((a, b) => a - b);
  const shown = items.filter((i) => (week === "all" || i.week === week) && (stage === "all" || i.stage === stage));
  const doneCount = items.filter((i) => done[i.id]).length;

  const selStyle: React.CSSProperties = { padding: "7px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13, fontFamily: "inherit", background: "#fff" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: INK }}>{t.startupTitle}</div>
          <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{t.startupSub}</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: doneCount === items.length ? GREEN : MUTED }}>{doneCount}/{items.length}</div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <select value={String(week)} onChange={(e) => setWeek(e.target.value === "all" ? "all" : parseInt(e.target.value, 10))} style={selStyle}>
          <option value="all">{t.allWeeks}</option>
          {weeks.map((w) => <option key={w} value={w}>{t.filterWeek} {w}</option>)}
        </select>
        <select value={stage} onChange={(e) => setStage(e.target.value as Stage)} style={selStyle}>
          <option value="all">{t.allStages}</option>
          {(["acquisition", "activation", "retention", "referral", "revenue"] as const).map((s) => (
            <option key={s} value={s}>{t.stages[s]}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {shown.map((it) => {
          const on = !!done[it.id];
          return (
            <div key={it.id} style={{ ...card, opacity: on ? 0.78 : 1 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <Checkbox checked={on} onClick={() => onToggle(it.id)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 15.5, fontWeight: 700, color: INK }}>{it.titleHe}</span>
                    <Tag>{t.weekN} {it.week}</Tag>
                    <Tag tone="stage">{t.stages[it.stage as keyof typeof t.stages] ?? it.stage}</Tag>
                    <Tag tone="mins">{it.estMinutes} {t.minutes}</Tag>
                  </div>
                  <Field label={t.why} body={it.whyHe} />
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>{t.how}</div>
                    <ol style={{ margin: 0, paddingInlineStart: 20, display: "flex", flexDirection: "column", gap: 3 }}>
                      {it.howHe.map((step, i) => <li key={i} style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.5 }}>{step}</li>)}
                    </ol>
                  </div>
                  <div style={{ marginTop: 10, background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.22)", borderRadius: 8, padding: "8px 12px" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: GREEN, textTransform: "uppercase", letterSpacing: 0.4 }}>{t.success}: </span>
                    <span style={{ fontSize: 13.5, color: "#065F46" }}>{it.successMetricHe}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, body }: { label: string; body: string }) {
  return (
    <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.55 }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4, marginInlineEnd: 6 }}>{label}</span>
      {body}
    </div>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone?: "stage" | "mins" }) {
  const bg = tone === "stage" ? "rgba(124,58,237,0.1)" : tone === "mins" ? "#F3F4F6" : "rgba(14,165,165,0.1)";
  const fg = tone === "stage" ? "#6d28d9" : tone === "mins" ? MUTED : "#0b7d7d";
  return <span style={{ background: bg, color: fg, fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>{children}</span>;
}

// ─── alumni tab (the deciding engine) ───────────────────────────────
function AlumniTab({ t, cfg, alumni, weekKey, onCount, onWeekly }: {
  t: (typeof S)["he"]; cfg: AlumniCfg; alumni: Alumni; weekKey: string;
  onCount: (stage: string, n: number) => void; onWeekly: (stage: string, n: number) => void;
}) {
  const activated = alumni.counts.codeActivated ?? 0;
  const target = cfg.targetActivated;
  const base = cfg.baseCaseActivated;
  const actPct = Math.min(100, Math.round((activated / target) * 100));
  const weekEntries = Object.entries(alumni.weekly).sort(([a], [b]) => a.localeCompare(b));
  const maxWeek = Math.max(1, ...weekEntries.map(([, v]) => v.codeActivated ?? 0));
  const maxStage = Math.max(1, ...cfg.funnelStages.map((s) => alumni.counts[s.id] ?? 0));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Note tone="teal" title={t.alumniWhy} body={cfg.whyHe} />

      {/* The one metric that decides the forecast */}
      <div style={{ ...card, border: `2px solid ${TEAL}` }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#0b7d7d", textTransform: "uppercase", letterSpacing: 0.5 }}>{t.activatedVsTarget}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 40, fontWeight: 800, color: TEAL, lineHeight: 1 }}>{activated}</span>
          <span style={{ fontSize: 15, color: MUTED }}>{t.of} {target}</span>
          <span style={{ fontSize: 12.5, color: MUTED, marginInlineStart: "auto" }}>{t.baseCase}: {base}</span>
        </div>
        <div style={{ position: "relative", marginTop: 12, height: 14, borderRadius: 999, background: "#F3F4F6", overflow: "hidden" }}>
          <div style={{ width: `${actPct}%`, height: "100%", background: activated >= base ? GREEN : TEAL, borderRadius: 999, transition: "width .4s" }} />
          {/* base-case marker */}
          <div title={`${t.baseCase} ${base}`} style={{ position: "absolute", top: -3, insetInlineStart: `${Math.min(100, (base / target) * 100)}%`, width: 2, height: 20, background: "#b45309" }} />
        </div>
      </div>

      {/* Editable funnel */}
      <div style={card}>
        <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 12 }}>{t.funnel}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cfg.funnelStages.map((stage) => {
            const n = alumni.counts[stage.id] ?? 0;
            const w = Math.round((n / maxStage) * 100);
            const isKey = stage.id === "codeActivated";
            return (
              <div key={stage.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 130, flexShrink: 0, fontSize: 13.5, fontWeight: isKey ? 800 : 600, color: isKey ? "#0b7d7d" : INK }}>{stage.labelHe}</div>
                <div style={{ flex: 1, height: 22, borderRadius: 6, background: "#F3F4F6", overflow: "hidden" }}>
                  <div style={{ width: `${w}%`, height: "100%", background: isKey ? TEAL : "#CBD5E1", borderRadius: 6 }} />
                </div>
                <EditableNumber value={n} onCommit={(v) => onCount(stage.id, v)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly activations trend + this-week input */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{t.weeklyActivations}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: MUTED }}>
            <span dir="ltr">{weekKey}</span>
            <EditableNumber value={alumni.weekly[weekKey]?.codeActivated ?? 0} onCommit={(v) => onWeekly("codeActivated", v)} width={64} />
          </div>
        </div>
        {weekEntries.length === 0 ? (
          <div style={{ fontSize: 13, color: MUTED }}>{t.noWeekly}</div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, paddingTop: 8 }}>
            {weekEntries.map(([wk, v]) => {
              const val = v.codeActivated ?? 0;
              const h = Math.round((val / maxWeek) * 100);
              return (
                <div key={wk} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: INK }}>{val}</span>
                  <div style={{ width: "100%", maxWidth: 34, height: `${Math.max(4, h)}%`, background: TEAL, borderRadius: "4px 4px 0 0" }} />
                  <span style={{ fontSize: 9.5, color: MUTED, direction: "ltr", whiteSpace: "nowrap" }}>{wk.replace(/^\d+-/, "")}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── overview tab ───────────────────────────────────────────────────
function OverviewTab({ t, config, progress, onChannel, onMonthly, lang }: {
  t: (typeof S)["he"]; config: Config; progress: Progress;
  onChannel: (id: string, n: number) => void; onMonthly: (id: string, upd: { actual?: number; hit?: boolean }) => void;
  lang: "he" | "en";
}) {
  const monthOrder = ["aug", "sep", "oct", "nov", "dec"];
  const nowMonth = new Date().getMonth(); // 0=Jan; aug=7
  const monthIndex: Record<string, number> = { aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Bets */}
      <div>
        <SectionTitle>{t.bets}</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {config.bets.map((b, i) => (
            <div key={b.id} style={card}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(14,165,165,0.12)", color: "#0b7d7d", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: INK }}>{b.titleHe}</span>
              </div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{b.bodyHe}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Channel targets */}
      <div>
        <SectionTitle>{t.channels}</SectionTitle>
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          {config.channelTargets.map((ch, i) => {
            const actual = progress.channelActual[ch.id] ?? 0;
            const w = Math.min(100, Math.round((actual / ch.target) * 100));
            return (
              <div key={ch.id} style={{ padding: "12px 16px", borderTop: i ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{ch.nameHe}</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{ch.noteHe}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <EditableNumber value={actual} onCommit={(v) => onChannel(ch.id, v)} />
                    <span style={{ fontSize: 13, color: MUTED }}>/ {ch.target}</span>
                  </div>
                </div>
                <div style={{ marginTop: 8, height: 8, borderRadius: 999, background: "#F3F4F6", overflow: "hidden" }}>
                  <div style={{ width: `${w}%`, height: "100%", background: w >= 100 ? GREEN : TEAL, borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly ramp */}
      <div>
        <SectionTitle>{t.monthly}</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {config.monthlyRamp.map((m) => {
            const state = progress.monthly[m.id] ?? {};
            const isFuture = (monthIndex[m.id] ?? 99) > nowMonth;
            const hit = state.hit === true;
            const missed = state.hit === false;
            const bg = hit ? "rgba(5,150,105,0.07)" : missed ? "rgba(220,38,38,0.06)" : isFuture ? "#F9FAFB" : "#fff";
            const bd = hit ? "rgba(5,150,105,0.3)" : missed ? "rgba(220,38,38,0.3)" : BORDER;
            return (
              <div key={m.id} style={{ ...card, background: bg, border: `1px solid ${bd}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: INK }}>{m.labelHe}</span>
                      <span style={{ fontSize: 12.5, color: MUTED }}>{m.focusHe}</span>
                      {isFuture && <Tag tone="mins">{t.future}</Tag>}
                    </div>
                    <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4 }}>
                      {t.cumulative}: <b style={{ color: INK }}>{m.targetCumulative.toLocaleString()}</b>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                      {m.kpisHe.map((k, i) => <Tag key={i}>{k}</Tag>)}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: MUTED }}>{t.actual}</span>
                      <EditableNumber value={state.actual ?? 0} onCommit={(v) => onMonthly(m.id, { actual: v })} />
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" onClick={() => onMonthly(m.id, { hit: true })} style={pill(hit, GREEN)}>✓ {t.hit}</button>
                      <button type="button" onClick={() => onMonthly(m.id, { hit: false })} style={pill(missed, RED)}>✗ {t.miss}</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Markets (read-only) */}
      <div>
        <SectionTitle>{t.marketsTitle}</SectionTitle>
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          {[...config.markets].sort((a, b) => a.wave - b.wave).map((m, i) => (
            <div key={m.id} style={{ padding: "12px 16px", borderTop: i ? `1px solid ${BORDER}` : "none", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ width: 26, height: 26, borderRadius: 6, background: "#F3F4F6", color: MUTED, fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{m.wave}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{m.nameHe} <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>· {m.months}</span></div>
                <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{t.mechanism}: {m.mechanismHe} · {t.owner}: {m.owner}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <span style={{ display: "none" }}>{monthOrder.length}{lang}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>{children}</div>;
}

function pill(active: boolean, color: string): React.CSSProperties {
  return {
    padding: "5px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
    border: `1px solid ${active ? color : BORDER}`, background: active ? color : "#fff", color: active ? "#fff" : MUTED,
  };
}

// ─── icon ───────────────────────────────────────────────────────────
function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
  );
}

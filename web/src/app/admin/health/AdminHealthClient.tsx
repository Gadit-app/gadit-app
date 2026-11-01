"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useAdminContext, type AdminLang } from "../admin-context";

/**
 * Subscriber health (Gadi 2026-10-21): every paying or trialing subscriber in
 * four segments by last usage, a short "needs attention" strip, and one
 * table filterable by segment and sortable by next charge. Data from
 * /api/admin/health (lib/admin-health.ts), cached there for 10 minutes.
 */

type Segment = "A" | "B" | "C" | "D";
type Kind = "family" | "individual" | "schools" | "legacy";

type Row = {
  uid: string;
  email: string | null;
  name: string | null;
  kind: Kind;
  status: string;
  kids: number;
  members: number;
  memberAccounts: number;
  c7: number;
  c30: number;
  searchesEver: number;
  notebook: number;
  lastUseMs: number | null;
  daysSinceUse: number | null;
  lastSeenMs: number | null;
  segment: Segment;
  nextChargeMs: number | null;
  endsMs: number | null;
  amount: number | null;
  currency: string | null;
  billing: "monthly" | "yearly" | null;
  monthlyUsd: number;
  cancelAtPeriodEnd: boolean;
  hasCard: boolean | null;
  paused: boolean;
  utmCampaign: string | null;
  signupMs: number | null;
  signupDays: number | null;
  stripeCustomerId: string | null;
  lang: string;
  suppressed: boolean;
  nudges: { key: string; at: string }[];
  recommended: NudgeKey | null;
};

type NudgeKey = "act-first-word-family" | "act-first-word-indiv" | "act-first-word-2" | "act-add-child" | "act-return-family" | "act-return-indiv";
const NUDGE_KEYS: NudgeKey[] = ["act-return-family", "act-return-indiv", "act-add-child", "act-first-word-family", "act-first-word-indiv", "act-first-word-2"];
const NUDGE_LABEL: Record<AdminLang, Record<string, string>> = {
  he: {
    "act-return-family": "חזרה לשימוש · Family",
    "act-return-indiv": "חזרה לשימוש · Individual",
    "act-add-child": "להוסיף ילד",
    "act-first-word-family": "המילה הראשונה · Family",
    "act-first-word-indiv": "המילה הראשונה · Individual",
    "act-first-word-2": "המילה הראשונה, שוב",
    custom: "הודעה אישית",
  },
  en: {
    "act-return-family": "Come back · Family",
    "act-return-indiv": "Come back · Individual",
    "act-add-child": "Add a child",
    "act-first-word-family": "First word · Family",
    "act-first-word-indiv": "First word · Individual",
    "act-first-word-2": "First word, again",
    custom: "Personal message",
  },
};
/** Most inactive first: never used, dormant, fading, active; then days since use. */
const SEG_ORDER: Record<Segment, number> = { D: 0, C: 1, B: 2, A: 3 };
const byInactivity = (a: Row, b: Row) =>
  SEG_ORDER[a.segment] - SEG_ORDER[b.segment] ||
  (b.daysSinceUse ?? 1e9) - (a.daysSinceUse ?? 1e9) ||
  a.c30 - b.c30 ||
  a.c7 - b.c7;

type SegSummary = { count: number; paying: number; trialing: number; payingMonthlyUsd: number; trialMonthlyUsd: number; share: number };

type Report = {
  generatedAt: string;
  cached?: boolean;
  fx: { ilsPerUsd: number; source: "live" | "fallback" };
  total: number;
  segments: Record<Segment, SegSummary>;
  rows: Row[];
};

const SEGMENTS: Segment[] = ["A", "B", "C", "D"];
const DAY = 86_400_000;

const SEG_COLOR: Record<Segment, { fg: string; bg: string; bar: string }> = {
  A: { fg: "#166534", bg: "#DCFCE7", bar: "#16A34A" },
  B: { fg: "#92400E", bg: "#FEF3C7", bar: "#F59E0B" },
  C: { fg: "#9A3412", bg: "#FFEDD5", bar: "#EA580C" },
  D: { fg: "#991B1B", bg: "#FEE2E2", bar: "#DC2626" },
};

const STRINGS = {
  en: {
    title: "Subscriber health",
    intro: (n: number) => `${n} subscribers, paying and in trial. A family counts once, the owner with every member.`,
    loading: "Loading…",
    refresh: "Refresh",
    updated: "Updated",
    fromCache: "saved copy, refresh for live",
    fx: (r: number, live: boolean) => `Rate: $1 = ₪${r.toFixed(2)}${live ? "" : " (fixed fallback)"}`,
    seg: { A: "Active", B: "Fading", C: "Dormant", D: "Never used" } as Record<Segment, string>,
    segHint: { A: "Used in the last 7 days", B: "Last use 8 to 30 days ago", C: "Used before, nothing for 30+ days", D: "No searches and an empty notebook" } as Record<Segment, string>,
    payingTrial: (p: number, t: number) => `${p} paying · ${t} in trial`,
    perMonth: "a month",
    plusTrial: (v: string) => `+${v} in trial`,
    ofAll: "of subscribers",
    attnTitle: "Needs attention",
    attnCharge: "Paying, not using, charged within 14 days",
    attnTrial: "Trial never used, ends within 7 days",
    attnNoKids: "Family with no child profile",
    attnNone: "Nothing here right now",
    all: "All",
    colUser: "Subscriber",
    colPlan: "Plan",
    colStatus: "Status",
    colKids: "Kids",
    colSearches: "Searches 7d / 30d",
    colNotebook: "Notebook",
    colLastUse: "Days since use",
    colNext: "Next charge",
    colSource: "Source",
    colAge: "Signed up",
    never: "never",
    today: "today",
    noCharge: "none",
    inDays: (n: number) => (n <= 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`),
    days: (n: number) => `${n} days`,
    ends: "ends",
    cancels: "Cancels",
    noCard: "No card",
    paused: "Paused",
    ever: (n: number) => `${n} ever`,
    status: { active: "Paying", trialing: "Trial", past_due: "Payment failed" } as Record<string, string>,
    kind: { family: "Family", individual: "Individual", schools: "Schools", legacy: "Legacy" } as Record<Kind, string>,
    monthly: "month",
    yearly: "year",
    empty: "No subscribers in this segment",
    sortHint: "Sort by next charge",
    sortRisk: "Least active first",
    sortCharge: "By next charge",
    colMsg: "Message",
    noNeed: "Active, no message needed",
    lastSent: (k: string, d: string) => `Last sent: ${k} · ${d}`,
    sentTimes: (n: number) => `${n} sent so far`,
    noEmail: "No email address",
    unsub: "Unsubscribed",
    preview: "Preview",
    sendNow: "Send now",
    sending: "Sending…",
    sentOk: "Sent",
    failed: "Failed",
    selected: (n: number) => `${n} selected`,
    selectQuiet: "Select everyone who is not active",
    clearSel: "Clear",
    whichMsg: "Message",
    autoMsg: "The recommended message for each one",
    sendSelected: "Send to selected",
    confirm: (n: number, m: string) => `Send "${m}" to ${n} subscribers now?`,
    yesSend: "Yes, send",
    cancel: "Cancel",
    customSubject: "Subject",
    customBody: "Message ({name} = first name)",
    customCta: "Button text",
    customHint: "Hebrew text goes out right to left. The button opens Gadit in the person's language.",
    done: (ok: number, skip: number, fail: number) => `Sent ${ok}${skip ? ` · skipped ${skip}` : ""}${fail ? ` · failed ${fail}` : ""}`,
    close: "Close",
    groupHead: { D: "Never used, start here", C: "Dormant, 30+ days", B: "Fading, 8 to 30 days", A: "Active" } as Record<Segment, string>,
  },
  he: {
    title: "בריאות מנויים",
    intro: (n: number) => `${n} מנויים, משלמים ובניסיון. משפחה נספרת פעם אחת, ההורה עם כל בני המשפחה.`,
    loading: "טוען…",
    refresh: "רענון",
    updated: "עודכן",
    fromCache: "עותק שמור, רענון לנתונים חיים",
    fx: (r: number, live: boolean) => `שער: ‎$1 = ₪${r.toFixed(2)}${live ? "" : " (שער קבוע לגיבוי)"}`,
    seg: { A: "פעילים", B: "דועכים", C: "רדומים", D: "אף פעם לא השתמשו" } as Record<Segment, string>,
    segHint: { A: "השתמשו ב-7 הימים האחרונים", B: "שימוש אחרון לפני 8 עד 30 ימים", C: "השתמשו בעבר, כלום כבר 30 ימים ומעלה", D: "אף חיפוש ומחברת ריקה" } as Record<Segment, string>,
    payingTrial: (p: number, t: number) => `${p} משלמים · ${t} בניסיון`,
    perMonth: "לחודש",
    plusTrial: (v: string) => `ועוד ${v} בניסיון`,
    ofAll: "מהמנויים",
    attnTitle: "דורש תשומת לב",
    attnCharge: "משלמים שלא משתמשים, חיוב ב-14 הימים הקרובים",
    attnTrial: "ניסיון בלי שום שימוש, מסתיים ב-7 הימים הקרובים",
    attnNoKids: "משפחה בלי פרופיל ילד",
    attnNone: "אין כרגע",
    all: "הכל",
    colUser: "מנוי",
    colPlan: "מסלול",
    colStatus: "סטטוס",
    colKids: "ילדים",
    colSearches: "חיפושים 7 / 30 ימים",
    colNotebook: "מחברת",
    colLastUse: "ימים מאז שימוש",
    colNext: "חיוב הבא",
    colSource: "מקור",
    colAge: "ותק",
    never: "אף פעם",
    today: "היום",
    noCharge: "אין",
    inDays: (n: number) => (n <= 0 ? "היום" : n === 1 ? "מחר" : `בעוד ${n} ימים`),
    days: (n: number) => `${n} ימים`,
    ends: "מסתיים",
    cancels: "מבטל",
    noCard: "ללא כרטיס",
    paused: "מושהה",
    ever: (n: number) => `${n} מאז ומעולם`,
    status: { active: "משלם", trialing: "ניסיון", past_due: "חיוב נכשל" } as Record<string, string>,
    kind: { family: "Family", individual: "Individual", schools: "בתי ספר", legacy: "מסלול ישן" } as Record<Kind, string>,
    monthly: "חודש",
    yearly: "שנה",
    empty: "אין מנויים בקבוצה הזו",
    sortHint: "מיון לפי חיוב הבא",
    sortRisk: "הכי לא פעילים קודם",
    sortCharge: "לפי חיוב הבא",
    colMsg: "הודעה",
    noNeed: "פעילים, אין צורך בהודעה",
    lastSent: (k: string, d: string) => `נשלח לאחרונה: ${k} · ${d}`,
    sentTimes: (n: number) => `${n} הודעות עד היום`,
    noEmail: "אין כתובת מייל",
    unsub: "ביטלו קבלת מיילים",
    preview: "תצוגה",
    sendNow: "לשלוח עכשיו",
    sending: "שולח…",
    sentOk: "נשלח",
    failed: "נכשל",
    selected: (n: number) => `${n} נבחרו`,
    selectQuiet: "לבחור את כל מי שלא פעיל",
    clearSel: "ניקוי",
    whichMsg: "הודעה",
    autoMsg: "ההודעה המומלצת לכל אחד",
    sendSelected: "לשלוח לנבחרים",
    confirm: (n: number, m: string) => `לשלוח "${m}" ל-${n} מנויים עכשיו?`,
    yesSend: "כן, לשלוח",
    cancel: "ביטול",
    customSubject: "נושא",
    customBody: "ההודעה ({שם} = השם הפרטי)",
    customCta: "טקסט הכפתור",
    customHint: "הודעה בעברית יוצאת מימין לשמאל. הכפתור פותח את Gadit בשפה של המנוי.",
    done: (ok: number, skip: number, fail: number) => `נשלחו ${ok}${skip ? ` · דולגו ${skip}` : ""}${fail ? ` · נכשלו ${fail}` : ""}`,
    close: "סגירה",
    groupHead: { D: "אף פעם לא השתמשו, להתחיל כאן", C: "רדומים, 30 ימים ומעלה", B: "דועכים, 8 עד 30 ימים", A: "פעילים" } as Record<Segment, string>,
  },
} as const;

type T = (typeof STRINGS)[AdminLang];

const KIND_BADGE: Record<Kind, { bg: string; fg: string }> = {
  family: { bg: "#DCFCE7", fg: "#166534" },
  individual: { bg: "#EDE9FE", fg: "#5B21B6" },
  schools: { bg: "#FEF3C7", fg: "#92400E" },
  legacy: { bg: "#F3F4F6", fg: "#374151" },
};

function fmtDate(ms: number | null): string {
  if (!ms) return "";
  const d = new Date(ms);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function fmtMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase(), maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${amount} ${currency.toUpperCase()}`;
  }
}

const usd = (n: number) => `$${n.toFixed(2)}`;

export default function AdminHealthClient() {
  const { secret, lang } = useAdminContext();
  const t = STRINGS[lang];
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Segment | "all">("all");
  const [sortAsc, setSortAsc] = useState(true);
  const [sortMode, setSortMode] = useState<"risk" | "charge">("risk");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rowState, setRowState] = useState<Record<string, "sending" | "sent" | "failed">>({});
  const [extraNudges, setExtraNudges] = useState<Record<string, { key: string; at: string }[]>>({});
  const [choice, setChoice] = useState<"auto" | NudgeKey | "custom">("auto");
  const [custom, setCustom] = useState({ subject: "", body: "", cta: "" });
  const [pending, setPending] = useState<{ rows: Row[]; bulk: boolean } | null>(null);
  const [preview, setPreview] = useState<{ email: string; subject: string; html: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // setState only inside the promise callbacks, so the first load can run
  // from the effect without a synchronous render cascade.
  const run = useCallback((fresh: boolean) => {
    fetch(`/api/admin/health?secret=${encodeURIComponent(secret)}${fresh ? "&fresh=1" : ""}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) {
          const j = (await r.json().catch(() => null)) as { error?: string; details?: string } | null;
          throw new Error(j?.details ?? j?.error ?? `HTTP ${r.status}`);
        }
        return r.json() as Promise<Report>;
      })
      .then((j) => { setData(j); setError(null); })
      .catch((e) => setError(String(e instanceof Error ? e.message : e)))
      .finally(() => setLoading(false));
  }, [secret]);

  useEffect(() => { run(false); }, [run]);

  const refresh = () => { setLoading(true); setError(null); run(true); };

  const now = data ? Date.parse(data.generatedAt) : 0;

  const attention = useMemo(() => {
    if (!data) return { charge: [] as Row[], trial: [] as Row[], noKids: [] as Row[] };
    const within = (ms: number | null, days: number) => ms != null && ms - now <= days * DAY && ms >= now - DAY;
    return {
      charge: data.rows.filter((r) => (r.status === "active" || r.status === "past_due") && (r.segment === "C" || r.segment === "D") && within(r.nextChargeMs, 14)),
      trial: data.rows.filter((r) => r.status === "trialing" && r.segment === "D" && within(r.nextChargeMs, 7)),
      noKids: data.rows.filter((r) => r.kind === "family" && r.kids === 0),
    };
  }, [data, now]);

  const rows = useMemo(() => {
    if (!data) return [];
    const list = tab === "all" ? data.rows.slice() : data.rows.filter((r) => r.segment === tab);
    if (sortMode === "risk") return list.sort(byInactivity);
    const key = (r: Row) => r.nextChargeMs ?? r.endsMs;
    list.sort((a, b) => {
      const ka = key(a), kb = key(b);
      if (ka == null && kb == null) return 0;
      if (ka == null) return 1;
      if (kb == null) return -1;
      return sortAsc ? ka - kb : kb - ka;
    });
    return list;
  }, [data, tab, sortAsc, sortMode]);

  const nudgesOf = (r: Row) => [...(extraNudges[r.uid] ?? []), ...r.nudges];
  const keyFor = (r: Row, c: "auto" | NudgeKey | "custom"): string | null => (c === "auto" ? r.recommended : c);
  const sendable = (r: Row) => !!r.email && !r.suppressed;

  const api = (body: object) =>
    fetch(`/api/admin/activation-send?secret=${encodeURIComponent(secret)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then((r) => r.json() as Promise<{ ok?: boolean; error?: string; preview?: { email: string; subject: string; html: string }; results?: { email: string; status: string; key?: string }[] }>);

  const customBody = () => ({ custom: { subject: custom.subject, body: custom.body, cta: custom.cta } });
  const customReady = custom.subject.trim() !== "" && custom.body.trim() !== "";

  const showPreview = (r: Row, c: "auto" | NudgeKey | "custom") => {
    const k = keyFor(r, c);
    if (!k || !r.email) return;
    if (k === "custom" && !customReady) return;
    api({ emails: [r.email], preview: true, ...(k === "custom" ? customBody() : { key: k }) })
      .then((j) => { if (j.preview) setPreview(j.preview); else setNotice(j.error ?? "error"); })
      .catch((e) => setNotice(String(e)));
  };

  /** Send now: one request per message type, resend allowed (Gadi decides). */
  const doSend = async (list: Row[], c: "auto" | NudgeKey | "custom") => {
    setPending(null);
    const groups = new Map<string, Row[]>();
    for (const r of list) {
      const k = keyFor(r, c);
      if (!k || !sendable(r)) continue;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(r);
    }
    let ok = 0, skip = list.length, fail = 0;
    for (const [k, rs] of groups) {
      setRowState((m) => ({ ...m, ...Object.fromEntries(rs.map((r) => [r.uid, "sending" as const])) }));
      try {
        const j = await api({ emails: rs.map((r) => r.email), send: true, force: true, ...(k === "custom" ? customBody() : { key: k }) });
        const at = new Date().toISOString();
        for (const r of rs) {
          const res = j.results?.find((x) => x.email === r.email!.toLowerCase());
          const good = res?.status === "sent";
          skip -= 1;
          if (good) ok += 1; else fail += 1;
          setRowState((m) => ({ ...m, [r.uid]: good ? "sent" : "failed" }));
          if (good) setExtraNudges((m) => ({ ...m, [r.uid]: [{ key: k, at }, ...(m[r.uid] ?? [])] }));
        }
      } catch {
        fail += rs.length; skip -= rs.length;
        setRowState((m) => ({ ...m, ...Object.fromEntries(rs.map((r) => [r.uid, "failed" as const])) }));
      }
    }
    setSelected(new Set());
    setNotice(t.done(ok, skip, fail));
  };

  const toggle = (uid: string) => setSelected((s) => { const n = new Set(s); if (n.has(uid)) n.delete(uid); else n.add(uid); return n; });
  const choiceLabel = (c: "auto" | NudgeKey | "custom") => (c === "auto" ? t.autoMsg : NUDGE_LABEL[lang][c]);

  return (
    <>
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {data && (
            <span style={{ fontSize: 12.5, color: "#9CA3AF" }}>
              {t.updated} {new Date(data.generatedAt).toLocaleTimeString(lang === "he" ? "he-IL" : "en-US", { hour: "2-digit", minute: "2-digit" })}
              {data.cached ? ` · ${t.fromCache}` : ""}
            </span>
          )}
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "1px solid #D1D5DB", background: "#fff", color: "#374151", fontWeight: 700, fontSize: 14, cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "inherit" }}
          >
            <IconRefresh />
            {loading ? "…" : t.refresh}
          </button>
        </div>
      </div>
      {data && (
        <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>
          {t.intro(data.total)} <span style={{ color: "#9CA3AF" }}>{t.fx(data.fx.ilsPerUsd, data.fx.source === "live")}</span>
        </div>
      )}

      {loading && !data && <div style={{ padding: 32, textAlign: "center", color: "#6B7280" }}>{t.loading}</div>}
      {error && <div style={{ background: "#FEF2F2", color: "#991B1B", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}

      {data && (
        <>
          {/* 1. Segment cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, marginBottom: 20 }}>
            {SEGMENTS.map((s) => {
              const g = data.segments[s];
              const c = SEG_COLOR[s];
              const on = tab === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTab(on ? "all" : s)}
                  style={{ textAlign: "start", background: "white", border: `1px solid ${on ? c.bar : "#E5E7EB"}`, borderTop: `4px solid ${c.bar}`, borderRadius: 12, padding: 16, cursor: "pointer", fontFamily: "inherit", boxShadow: on ? `0 0 0 2px ${c.bg}` : "none" }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: c.fg }}>{t.seg[s]}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: c.fg, background: c.bg, borderRadius: 999, padding: "2px 8px" }}>{g.share}% {t.ofAll}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 2 }}>{t.segHint[s]}</div>
                  <div style={{ fontSize: 34, fontWeight: 700, color: "#111827", lineHeight: 1.1, marginTop: 10 }}>{g.count}</div>
                  <div style={{ fontSize: 12.5, color: "#4B5563", marginTop: 4 }}>{t.payingTrial(g.paying, g.trialing)}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginTop: 8 }}>
                    {usd(g.payingMonthlyUsd)} <span style={{ fontSize: 12, fontWeight: 500, color: "#6B7280" }}>{t.perMonth}</span>
                  </div>
                  {g.trialMonthlyUsd > 0 && <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 2 }}>{t.plusTrial(usd(g.trialMonthlyUsd))}</div>}
                </button>
              );
            })}
          </div>

          {/* 2. Needs attention */}
          <div style={{ ...cardStyle, marginBottom: 20, borderInlineStart: "4px solid #DC2626" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ color: "#DC2626", display: "inline-flex" }}><IconAlert /></span>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>{t.attnTitle}</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              <AttnList title={t.attnCharge} rows={attention.charge} t={t} detail={(r) => `${t.seg[r.segment]} · ${t.colNext} ${t.inDays(Math.ceil(((r.nextChargeMs ?? now) - now) / DAY))}`} />
              <AttnList title={t.attnTrial} rows={attention.trial} t={t} detail={(r) => `${t.ends} ${t.inDays(Math.ceil(((r.nextChargeMs ?? now) - now) / DAY))}${r.hasCard === false ? ` · ${t.noCard}` : ""}`} />
              <AttnList title={t.attnNoKids} rows={attention.noKids} t={t} detail={(r) => `${t.status[r.status] ?? r.status} · ${t.seg[r.segment]}`} />
            </div>
          </div>

          {/* 3. Table */}
          <div style={cardStyle}>
            <nav style={{ display: "flex", gap: 4, flexWrap: "wrap", borderBottom: "1px solid #E5E7EB", marginBottom: 12 }}>
              {(["all", ...SEGMENTS] as const).map((k) => {
                const on = tab === k;
                const n = k === "all" ? data.total : data.segments[k].count;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setTab(k)}
                    style={{ padding: "8px 14px", fontSize: 14, fontWeight: on ? 700 : 600, color: on ? "#0F6F6C" : "#6B7280", background: "transparent", border: "none", borderBottom: `2px solid ${on ? "#0EA5A5" : "transparent"}`, marginBottom: -1, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {k === "all" ? t.all : t.seg[k]} <span style={{ color: "#9CA3AF", fontWeight: 600 }}>{n}</span>
                  </button>
                );
              })}
            </nav>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
              {(["risk", "charge"] as const).map((m) => (
                <button key={m} type="button" onClick={() => setSortMode(m)} style={{ ...pillStyle, ...(sortMode === m ? pillOn : {}) }}>
                  {m === "risk" ? t.sortRisk : t.sortCharge}
                </button>
              ))}
              <span style={{ flex: 1 }} />
              <button type="button" onClick={() => setSelected(new Set(rows.filter((r) => r.segment !== "A" && sendable(r)).map((r) => r.uid)))} style={pillStyle}>{t.selectQuiet}</button>
            </div>

            {/* Bulk send bar */}
            <div style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 10, padding: 12, marginBottom: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <strong style={{ fontSize: 13, color: "#111827" }}>{t.selected(selected.size)}</strong>
                {selected.size > 0 && <button type="button" onClick={() => setSelected(new Set())} style={{ ...pillStyle, padding: "4px 10px" }}>{t.clearSel}</button>}
                <label style={{ fontSize: 13, color: "#374151", display: "inline-flex", gap: 6, alignItems: "center" }}>
                  {t.whichMsg}
                  <select value={choice} onChange={(e) => setChoice(e.target.value as typeof choice)} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #D1D5DB", fontFamily: "inherit", fontSize: 13 }}>
                    <option value="auto">{t.autoMsg}</option>
                    {NUDGE_KEYS.map((k) => <option key={k} value={k}>{NUDGE_LABEL[lang][k]}</option>)}
                    <option value="custom">{NUDGE_LABEL[lang].custom}</option>
                  </select>
                </label>
                <button
                  type="button"
                  disabled={selected.size === 0 || (choice === "custom" && !customReady)}
                  onClick={() => setPending({ rows: data.rows.filter((r) => selected.has(r.uid)), bulk: true })}
                  style={{ ...sendBtn, opacity: selected.size === 0 || (choice === "custom" && !customReady) ? 0.45 : 1 }}
                >
                  {t.sendSelected}
                </button>
              </div>
              {choice === "custom" && (
                <div style={{ display: "grid", gap: 8 }}>
                  <input dir="auto" placeholder={t.customSubject} value={custom.subject} onChange={(e) => setCustom({ ...custom, subject: e.target.value })} style={inputStyle} />
                  <textarea dir="auto" placeholder={t.customBody} rows={6} value={custom.body} onChange={(e) => setCustom({ ...custom, body: e.target.value })} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
                  <input dir="auto" placeholder={t.customCta} value={custom.cta} onChange={(e) => setCustom({ ...custom, cta: e.target.value })} style={inputStyle} />
                  <div style={{ fontSize: 12, color: "#6B7280" }}>{t.customHint}</div>
                </div>
              )}
              {pending?.bulk && (
                <div style={{ background: "#FFFBEB", border: "1px solid #F59E0B", borderRadius: 8, padding: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#92400E" }}>{t.confirm(pending.rows.filter((r) => sendable(r) && keyFor(r, choice)).length, choiceLabel(choice))}</span>
                  <button type="button" onClick={() => doSend(pending.rows, choice)} style={sendBtn}>{t.yesSend}</button>
                  <button type="button" onClick={() => setPending(null)} style={pillStyle}>{t.cancel}</button>
                </div>
              )}
              {notice && (
                <div style={{ fontSize: 13, color: "#0F6F6C", fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}>
                  {notice}
                  <button type="button" onClick={() => setNotice(null)} style={{ ...pillStyle, padding: "2px 8px", fontSize: 12 }}>{t.close}</button>
                </div>
              )}
            </div>

            {rows.length === 0 ? (
              <div style={{ color: "#9CA3AF", fontSize: 13, padding: "12px 0" }}>{t.empty}</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <Th>
                        <input
                          type="checkbox"
                          aria-label="all"
                          checked={rows.length > 0 && rows.every((r) => !sendable(r) || selected.has(r.uid))}
                          onChange={(e) => setSelected(e.target.checked ? new Set(rows.filter(sendable).map((r) => r.uid)) : new Set())}
                        />
                      </Th>
                      <Th>{t.colUser}</Th>
                      <Th>{t.colMsg}</Th>
                      <Th>{t.colPlan}</Th>
                      <Th>{t.colStatus}</Th>
                      <Th center>{t.colKids}</Th>
                      <Th center>{t.colSearches}</Th>
                      <Th center>{t.colNotebook}</Th>
                      <Th center>{t.colLastUse}</Th>
                      <Th>
                        <button type="button" onClick={() => setSortAsc((v) => !v)} title={t.sortHint} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "transparent", border: "none", padding: 0, cursor: "pointer", font: "inherit", color: "#0F6F6C", letterSpacing: "inherit", textTransform: "inherit" }}>
                          {t.colNext}
                          <IconSort asc={sortAsc} />
                        </button>
                      </Th>
                      <Th>{t.colSource}</Th>
                      <Th center>{t.colAge}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <Fragment key={r.uid}>
                        {sortMode === "risk" && (i === 0 || rows[i - 1].segment !== r.segment) && (
                          <tr>
                            <td colSpan={12} style={{ padding: "14px 12px 6px", fontSize: 13, fontWeight: 700, color: SEG_COLOR[r.segment].fg, background: SEG_COLOR[r.segment].bg }}>
                              {t.groupHead[r.segment]} · {rows.filter((x) => x.segment === r.segment).length}
                            </td>
                          </tr>
                        )}
                        <HealthTableRow
                          r={r}
                          t={t}
                          now={now}
                          lang={lang}
                          checked={selected.has(r.uid)}
                          onCheck={() => toggle(r.uid)}
                          nudges={nudgesOf(r)}
                          state={rowState[r.uid]}
                          canSend={sendable(r)}
                          onPreview={() => showPreview(r, "auto")}
                          onSend={() => setPending({ rows: [r], bulk: false })}
                          pending={!!pending && !pending.bulk && pending.rows[0]?.uid === r.uid}
                          onConfirm={() => doSend([r], "auto")}
                          onCancel={() => setPending(null)}
                        />
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {preview && (
        <div role="dialog" onClick={() => setPreview(null)} style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,.55)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, width: "min(680px, 100%)", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #E5E7EB", display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "#111827", unicodeBidi: "plaintext" }}>{preview.subject}</div>
                <div style={{ fontSize: 12, color: "#6B7280", direction: "ltr", textAlign: "start" }}>{preview.email}</div>
              </div>
              <button type="button" onClick={() => setPreview(null)} style={pillStyle}>{t.close}</button>
            </div>
            <iframe title="preview" srcDoc={preview.html} sandbox="" style={{ border: 0, width: "100%", height: "70vh" }} />
          </div>
        </div>
      )}
    </>
  );
}

type RowProps = {
  r: Row; t: T; now: number; lang: AdminLang;
  checked: boolean; onCheck: () => void;
  nudges: { key: string; at: string }[];
  state?: "sending" | "sent" | "failed";
  canSend: boolean;
  onPreview: () => void; onSend: () => void;
  pending: boolean; onConfirm: () => void; onCancel: () => void;
};

function HealthTableRow({ r, t, now, lang, checked, onCheck, nudges, state, canSend, onPreview, onSend, pending, onConfirm, onCancel }: RowProps) {
  const seg = SEG_COLOR[r.segment];
  const kb = KIND_BADGE[r.kind];
  const statusColor = r.status === "past_due" ? "#DC2626" : r.status === "trialing" ? "#0891B2" : "#0E7490";
  const cell: React.CSSProperties = { padding: "10px 12px", textAlign: "start", verticalAlign: "top", color: "#374151" };
  const center: React.CSSProperties = { ...cell, textAlign: "center" };
  const when = r.nextChargeMs ?? r.endsMs;
  return (
    <tr style={{ borderBottom: "1px solid #F3F4F6", background: checked ? "#F0FDFA" : undefined }}>
      <td style={{ ...cell, borderInlineStart: `3px solid ${seg.bar}` }}>
        <input type="checkbox" checked={checked} disabled={!canSend} onChange={onCheck} aria-label={r.email ?? r.uid} />
      </td>
      <td style={cell}>
        <div style={{ color: "#111827", fontWeight: 600, direction: "ltr", textAlign: "start", unicodeBidi: "plaintext" }}>{r.email ?? r.uid}</div>
        {r.name && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{r.name}</div>}
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{r.lang.toUpperCase()}</div>
      </td>
      <td style={{ ...cell, minWidth: 220 }}>
        {r.recommended ? (
          <div style={{ fontWeight: 700, color: "#111827", fontSize: 12.5 }}>{NUDGE_LABEL[lang][r.recommended]}</div>
        ) : (
          <div style={{ color: "#9CA3AF", fontSize: 12 }}>{t.noNeed}</div>
        )}
        {nudges[0] && (
          <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 3 }}>
            {t.lastSent(NUDGE_LABEL[lang][nudges[0].key] ?? nudges[0].key, fmtDate(Date.parse(nudges[0].at)))}
            {nudges.length > 1 ? ` · ${t.sentTimes(nudges.length)}` : ""}
          </div>
        )}
        {!r.email && <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>{t.noEmail}</div>}
        {r.suppressed && <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>{t.unsub}</div>}
        {r.recommended && canSend && (
          pending ? (
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              <button type="button" onClick={onConfirm} style={{ ...sendBtn, padding: "4px 10px", fontSize: 12 }}>{t.yesSend}</button>
              <button type="button" onClick={onCancel} style={{ ...pillStyle, padding: "4px 10px", fontSize: 12 }}>{t.cancel}</button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
              <button type="button" onClick={onPreview} style={{ ...pillStyle, padding: "4px 10px", fontSize: 12 }}>{t.preview}</button>
              <button type="button" onClick={onSend} disabled={state === "sending"} style={{ ...sendBtn, padding: "4px 10px", fontSize: 12 }}>
                {state === "sending" ? t.sending : t.sendNow}
              </button>
              {state === "sent" && <span style={{ fontSize: 12, fontWeight: 700, color: "#166534" }}>{t.sentOk}</span>}
              {state === "failed" && <span style={{ fontSize: 12, fontWeight: 700, color: "#DC2626" }}>{t.failed}</span>}
            </div>
          )
        )}
      </td>
      <td style={cell}>
        <span style={{ background: kb.bg, color: kb.fg, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{t.kind[r.kind]}</span>
      </td>
      <td style={cell}>
        <div style={{ fontSize: 12, fontWeight: 600, color: statusColor, whiteSpace: "nowrap" }}>{t.status[r.status] ?? r.status}</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 3 }}>
          {r.cancelAtPeriodEnd && <Badge bg="#FEE2E2" fg="#991B1B">{t.cancels}</Badge>}
          {r.status === "trialing" && r.hasCard === false && <Badge bg="#FEF3C7" fg="#92400E">{t.noCard}</Badge>}
          {r.paused && <Badge bg="#F3F4F6" fg="#374151">{t.paused}</Badge>}
        </div>
      </td>
      <td style={{ ...center, color: r.kind === "family" && r.kids === 0 ? "#DC2626" : "#374151", fontWeight: r.kind === "family" && r.kids === 0 ? 700 : 400 }}>
        {r.kind === "family" ? r.kids : ""}
      </td>
      <td style={center}>
        <span style={{ fontWeight: 600, color: "#111827" }}>{r.c7}</span>
        <span style={{ color: "#9CA3AF" }}> / </span>
        <span>{r.c30}</span>
        {r.searchesEver > 0 && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{t.ever(r.searchesEver)}</div>}
      </td>
      <td style={center}>{r.notebook}</td>
      <td style={center}>
        <span style={{ background: seg.bg, color: seg.fg, padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
          {r.daysSinceUse == null ? t.never : r.daysSinceUse === 0 ? t.today : r.daysSinceUse}
        </span>
      </td>
      <td style={{ ...cell, whiteSpace: "nowrap" }}>
        {when ? (
          <>
            <div style={{ color: r.cancelAtPeriodEnd ? "#9CA3AF" : "#111827", fontWeight: 600 }}>
              {r.cancelAtPeriodEnd ? `${t.ends} ` : ""}{fmtDate(when)}
            </div>
            <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>
              {t.inDays(Math.ceil((when - now) / DAY))}
              {r.amount != null && r.currency && !r.cancelAtPeriodEnd && (
                <>
                  {" · "}
                  {r.stripeCustomerId ? (
                    <a href={`https://dashboard.stripe.com/customers/${r.stripeCustomerId}`} target="_blank" rel="noopener noreferrer" style={{ color: "#6D28D9", fontWeight: 600, textDecoration: "none", direction: "ltr", unicodeBidi: "isolate" }}>
                      {fmtMoney(r.amount, r.currency)}
                    </a>
                  ) : (
                    <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>{fmtMoney(r.amount, r.currency)}</span>
                  )}
                  {r.billing ? ` / ${r.billing === "yearly" ? t.yearly : t.monthly}` : ""}
                </>
              )}
            </div>
          </>
        ) : (
          <span style={{ color: "#9CA3AF" }}>{t.noCharge}</span>
        )}
      </td>
      <td style={{ ...cell, fontSize: 12, color: "#6B7280", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.utmCampaign ?? ""}>
        {r.utmCampaign ?? ""}
      </td>
      <td style={{ ...center, fontSize: 12, color: "#6B7280", whiteSpace: "nowrap" }} title={fmtDate(r.signupMs)}>
        {r.signupDays != null ? t.days(r.signupDays) : ""}
      </td>
    </tr>
  );
}

function AttnList({ title, rows, t, detail }: { title: string; rows: Row[]; t: T; detail: (r: Row) => string }) {
  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
        {title} <span style={{ color: rows.length ? "#DC2626" : "#9CA3AF" }}>({rows.length})</span>
      </div>
      {rows.length === 0 ? (
        <div style={{ fontSize: 12.5, color: "#9CA3AF" }}>{t.attnNone}</div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4, maxHeight: 220, overflowY: "auto" }}>
          {rows.map((r) => (
            <li key={r.uid} style={{ fontSize: 12.5, lineHeight: 1.35, padding: "4px 0", borderBottom: "1px solid #F3F4F6" }}>
              <div style={{ color: "#111827", fontWeight: 600, direction: "ltr", textAlign: "start", unicodeBidi: "plaintext", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.email ?? r.uid}
              </div>
              <div style={{ color: "#6B7280" }}>{r.name ? `${r.name} · ` : ""}{detail(r)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Badge({ children, bg, fg }: { children: React.ReactNode; bg: string; fg: string }) {
  return <span style={{ background: bg, color: fg, padding: "1px 6px", borderRadius: 4, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>{children}</span>;
}

function Th({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <th style={{ padding: "10px 12px", textAlign: center ? "center" : "start", color: "#6B7280", fontWeight: 600, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {children}
    </th>
  );
}

function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/></svg>
  );
}
function IconAlert() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
  );
}
function IconSort({ asc }: { asc: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {asc ? <polyline points="6 15 12 9 18 15" /> : <polyline points="6 9 12 15 18 9" />}
    </svg>
  );
}

const pillStyle: React.CSSProperties = { padding: "6px 12px", borderRadius: 999, border: "1px solid #D1D5DB", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" };
const pillOn: React.CSSProperties = { background: "#0F6F6C", borderColor: "#0F6F6C", color: "#fff" };
const sendBtn: React.CSSProperties = { padding: "7px 14px", borderRadius: 8, border: "none", background: "#0F6F6C", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" };
const inputStyle: React.CSSProperties = { padding: "8px 10px", borderRadius: 8, border: "1px solid #D1D5DB", fontFamily: "inherit", fontSize: 13.5, width: "100%", boxSizing: "border-box", unicodeBidi: "plaintext" };

const cardStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  padding: 16,
};

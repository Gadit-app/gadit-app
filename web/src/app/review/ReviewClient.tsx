"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";
import { ClassroomStage } from "@/components/classroom/ClassroomStage";
import { LEVELS, PARTS, diagramBoard, levelText, projectorByLevel, quoteOf, type Decision, type LevelId, type Meaning, type Part, type PartId } from "@/lib/review-parts";
import type { SetItem, WordSet } from "@/lib/word-sets";

/**
 * The expert's content review (Gemara pilot, Gadi 2026-10-15). The ten draft
 * meanings, each part decided on its own: approve, fix (with corrections in
 * place) or reject. "הצגה כמו בכיתה" opens the real projector screen with the
 * draft. Every screen carries a watermark with the reviewer's email. Hebrew
 * only: the review is in Hebrew.
 *
 * 2026-10-17: a review loaded in groups (gemara-b01: five groups of ten) shows
 * one group at a time, with its progress and next / previous; each level text
 * is its own part, with what the projector shows per level; the questions for
 * the expert sit in the part they are about; each part lists the expert's own
 * earlier decisions on it (read only). A review without groups or level texts,
 * like the pilot, looks as before.
 */

type ListItem = { m: string; w: string; rev: number; parts: PartId[]; decided: Record<string, string> };
type Group = { n: number; title: string; ms: string[] };
type ListData = { title: string; expiresAt: string; name: string; email: string; meanings: ListItem[]; groups?: Group[] };
type SavedDecision = { decision: Decision; status: string; notes: string; fixes: Record<string, string>; quoteCheck?: { edition: string; tractate: string; daf: string; amud: string }; at: string; rev: number; historyId?: string };
/** kind "decision": one of the professional decisions; "question": a short question. */
type Question = { part?: string; kind: "decision" | "question"; q: string; options?: string[]; rec?: string };
type HistoryItem = { id: string; part: PartId; rev: number; at: string; before: { decision: Decision; status: string; at: string; recordedInHistory: boolean } | null; after: { decision: Decision; status: string }; notes: string; changed: string[] };
type MeaningData = { meaning: Meaning; parts: PartId[]; decisions: Record<string, SavedDecision>; questions?: Question[]; history?: HistoryItem[] };

const DECISION_LABEL: Record<Decision, string> = { approve: "אישור", fix: "תיקון", reject: "דחייה", clarify: "דורש בירור" };
const STATUS_LABEL: Record<string, string> = { approved: "אושר", draft: "לתיקון", rejected: "נדחה" };
const ERRORS: Array<[RegExp, string]> = [
  [/quote_check_required/, "כדי לאשר ציטוט צריך למלא את המהדורה, המסכת, הדף והעמוד שנבדקו."],
  [/fix_needs_a_change_or_a_note/, "בתיקון צריך לשנות נוסח או לכתוב הערה."],
  [/dash/, "בלי מקפים ארוכים (– או —). אפשר פסיק או נקודה."],
  [/answer_1_to_4/, "מספר התשובה הנכונה הוא 1, 2, 3 או 4."],
  [/empty/, "שדה נוסח לא יכול להישאר ריק."],
  [/too_long/, "אחד השדות ארוך מדי."],
  [/not_found/, "הגישה לבדיקה נסגרה."],
];
const errorText = (e: string) => ERRORS.find(([r]) => r.test(e))?.[1] ?? "השמירה לא הצליחה. נסו שוב.";
const shortTime = (iso: string) => new Date(iso).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem", day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });
const israelTime = (iso: string) => new Date(iso).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem", weekday: "long", day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
// A part waiting for clarification is not decided yet (2026-10-18).
const isDecided = (v: string | undefined) => !!v && v !== "clarify";
const doneOf = (x: ListItem) => x.parts.every((p) => isDecided(x.decided[p]));
const countText = (n: number, one: string, many: string) => (n === 1 ? one : `${n} ${many}`);

export function ReviewClient() {
  const { user, loading, promptLogin } = useAuth();
  const href = useHref();
  const [list, setList] = useState<ListData | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "closed" | "error">("loading");
  const [sel, setSel] = useState<string>("");
  const [cur, setCur] = useState<MeaningData | null>(null);
  const [stage, setStage] = useState(false);
  const [stageLv, setStageLv] = useState<LevelId | "">("");
  const [grp, setGrp] = useState(-1);

  const api = useCallback(async (q: string, init?: RequestInit) => {
    if (!user) throw new Error("login");
    const t = await user.getIdToken();
    return fetch(`/api/review${q}`, { ...init, headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${t}`, "Content-Type": "application/json" } });
  }, [user]);

  const loadList = useCallback(async () => {
    try {
      const r = await api("?view=list");
      if (r.status === 404) { setState("closed"); return; }
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as ListData;
      setList(d);
      setState("ready");
      // In a review with groups, start at the first group that is not finished yet.
      const g0 = d.groups?.length ? Math.max(0, d.groups.findIndex((g) => g.ms.some((m) => { const x = d.meanings.find((y) => y.m === m); return !!x && !doneOf(x); }))) : 0;
      setGrp((g) => (g >= 0 ? g : g0));
      setSel((s) => s || (d.groups?.length ? d.groups[g0]?.ms[0] : d.meanings[0]?.m) || "");
    } catch { setState("error"); }
  }, [api]);

  useEffect(() => {
    if (loading || !user) return;
    void (async () => { await loadList(); })();
  }, [loading, user, loadList]);

  useEffect(() => {
    if (!sel || !user) return;
    let alive = true;
    void (async () => {
      try {
        const r = await api(`?view=meaning&m=${encodeURIComponent(sel)}`);
        if (r.status === 404) { if (alive) setState("closed"); return; }
        const d = (await r.json()) as MeaningData;
        if (alive) setCur(d);
      } catch { if (alive) setState("error"); }
    })();
    return () => { alive = false; };
  }, [sel, user, api]);

  const onSaved = (m: string, part: PartId, d: SavedDecision, h: HistoryItem) => {
    setCur((c) => (c && c.meaning.m === m ? { ...c, decisions: { ...c.decisions, [part]: d }, history: [...(c.history ?? []), h] } : c));
    setList((l) => (l ? { ...l, meanings: l.meanings.map((x) => (x.m === m ? { ...x, decided: { ...x.decided, [part]: d.decision === "clarify" ? "clarify" : d.status } } : x)) } : l));
  };

  if (loading || (user && state === "loading")) return <Shell><p className="rv-muted">טוענים...</p></Shell>;
  if (!user) {
    return (
      <Shell>
        <h1 className="rv-h1">בדיקת תוכן</h1>
        <p className="rv-muted">כדי לראות את הבדיקה צריך להיכנס לחשבון.</p>
        <button type="button" className="rv-btn" onClick={() => promptLogin()}>כניסה</button>
      </Shell>
    );
  }
  if (state === "closed") {
    return (
      <Shell>
        <h1 className="rv-h1">בדיקת תוכן</h1>
        <p className="rv-muted">אין כאן תוכן לבדיקה.</p>
        <Link href={href("/account")} className="rv-link">לאזור האישי</Link>
      </Shell>
    );
  }
  if (state === "error" || !list) return <Shell><p className="rv-muted">לא הצלחנו לטעון את הבדיקה. נסו לרענן את הדף.</p></Shell>;

  const item = list.meanings.find((x) => x.m === sel);
  const groups = list.groups?.length ? list.groups : null;
  const g = groups ? groups[Math.max(0, grp)] : null;
  const shown = g ? list.meanings.filter((x) => g.ms.includes(x.m)) : list.meanings;
  const pos = shown.findIndex((x) => x.m === sel);
  // Choosing the meaning already open keeps it (clearing it would wait for a load that never comes).
  const go = (m: string) => { if (m !== sel) { setCur(null); setSel(m); } window.scrollTo({ top: 0 }); };
  const goGroup = (i: number) => { setGrp(i); const first = groups?.[i]?.ms[0]; if (first) go(first); };
  const done = shown.reduce((n, x) => n + x.parts.filter((p) => isDecided(x.decided[p])).length, 0);
  const all = shown.reduce((n, x) => n + x.parts.length, 0);
  const hasLevels = !!cur && LEVELS.some((l) => levelText(cur.meaning, l.id));
  const questions = cur?.questions ?? [];
  const nDecisions = questions.filter((q) => q.kind === "decision").length;
  const nQuestions = questions.filter((q) => q.kind === "question").length;
  return (
    <Shell watermark={list.email}>
      <header className="rv-head">
        <h1 className="rv-h1">{list.title}</h1>
        <p className="rv-muted">שלום {list.name}. הגישה פתוחה עד {israelTime(list.expiresAt)} (שעון ישראל). כל החלטה נשמרת מיד.</p>
      </header>
      {groups && (
        <nav className="rv-groups" aria-label="הקבוצות">
          {groups.map((x, i) => {
            const xs = list.meanings.filter((y) => x.ms.includes(y.m));
            const full = xs.filter(doneOf).length;
            return (
              <button key={x.n} type="button" className={`rv-group${x === g ? " is-on" : ""}${full === xs.length ? " is-done" : ""}`} aria-current={x === g ? "true" : undefined} onClick={() => goGroup(i)}>
                <span>קבוצה {x.n}</span>
                <small>{x.title}</small>
                <small>{full} מתוך {xs.length} משמעויות הושלמו</small>
              </button>
            );
          })}
        </nav>
      )}
      {g && (
        <div className="rv-progress">
          <div className="rv-bar" role="progressbar" aria-valuemin={0} aria-valuemax={all} aria-valuenow={done} aria-label={`קבוצה ${g.n}: ${done} מתוך ${all} חלקים הוחלטו`}><i style={{ width: `${all ? Math.round((done / all) * 100) : 0}%` }} /></div>
          <span>קבוצה {g.n}: {done} מתוך {all} חלקים הוחלטו</span>
        </div>
      )}
      <nav className="rv-chips" aria-label="המשמעויות">
        {shown.map((x, i) => {
          const n = x.parts.filter((p) => isDecided(x.decided[p])).length;
          return (
            <button key={x.m} type="button" className={`rv-chip${x.m === sel ? " is-on" : ""}${n === x.parts.length ? " is-done" : ""}`} onClick={() => go(x.m)}>
              <span>{x.w}{shown.filter((y) => y.w === x.w).length > 1 ? ` (${shown.filter((y, j) => y.w === x.w && j <= i).length})` : ""}</span>
              <small>{n} מתוך {x.parts.length}</small>
            </button>
          );
        })}
      </nav>
      {!cur || cur.meaning.m !== sel ? <p className="rv-muted">טוענים...</p> : (
        <section className="rv-meaning">
          <div className="rv-meaning-head">
            <h2>{cur.meaning.w}</h2>
            <div className="rv-stage-go">
              {hasLevels && (
                <select dir="rtl" aria-label="רמת הלימוד בהצגה" value={stageLv} onChange={(e) => setStageLv(e.target.value as LevelId | "")}>
                  <option value="">נוסח הבסיס</option>
                  {LEVELS.filter((l) => levelText(cur.meaning, l.id)).map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              )}
              <button type="button" className="rv-btn" onClick={() => setStage(true)}>הצגה כמו בכיתה</button>
            </div>
          </div>
          {(groups || hasLevels) && (
            <p className="rv-version">אתם בודקים את גרסה {cur.meaning.rev ?? 1} של המשמעות (<bdi dir="ltr">{cur.meaning.m}</bdi>).{g && pos >= 0 ? ` משמעות ${pos + 1} מתוך ${shown.length} בקבוצה ${g.n}.` : ""}</p>
          )}
          <p className="rv-muted">כך המורה יקרין את המשמעות לכיתה. התמונה עוד לא נוצרה, ולכן במסך אין תמונה.</p>
          {questions.length > 0 && (
            <p className="rv-qsum">
              במשמעות הזאת יש {[nDecisions ? countText(nDecisions, "הכרעה מקצועית אחת", "הכרעות מקצועיות") : "", nQuestions ? countText(nQuestions, "שאלה אחת", "שאלות") : ""].filter(Boolean).join(" ו")} אליכם. כל אחת מופיעה בחלק שהיא עוסקת בו.
            </p>
          )}
          {questions.filter((q) => !q.part || !cur.parts.includes(q.part as PartId)).map((q, i) => <QuestionBox key={`free-${i}`} q={q} />)}
          {hasLevels && <LevelBoard x={cur.meaning} decisions={cur.decisions} />}
          {PARTS.filter((p) => cur.parts.includes(p.id)).map((p) => (
            <PartCard key={`${cur.meaning.m}-${p.id}`} part={p} x={cur.meaning} saved={cur.decisions[p.id]} api={api}
              label={p.id === "definition" && hasLevels ? "הגדרת בסיס" : p.label}
              questions={questions.filter((q) => q.part === p.id)}
              history={(cur.history ?? []).filter((h) => h.part === p.id)}
              onSaved={(d, h) => onSaved(cur.meaning.m, p.id, d, h)} />
          ))}
          {g && groups && (
            <nav className="rv-next" aria-label="מעבר בין משמעויות">
              {pos > 0 ? <button type="button" className="rv-btn is-quiet" onClick={() => go(shown[pos - 1].m)}>המשמעות הקודמת: {shown[pos - 1].w}</button> : <span />}
              {pos >= 0 && pos < shown.length - 1 ? <button type="button" className="rv-btn" onClick={() => go(shown[pos + 1].m)}>המשמעות הבאה: {shown[pos + 1].w}</button>
                : groups.indexOf(g) < groups.length - 1 ? <button type="button" className="rv-btn" onClick={() => goGroup(groups.indexOf(g) + 1)}>לקבוצה {groups[groups.indexOf(g) + 1].n}</button>
                : <span className="rv-muted">זו המשמעות האחרונה שנטענה לבדיקה.</span>}
            </nav>
          )}
        </section>
      )}
      {stage && cur && item && (
        <StagePreview list={{ ...list, meanings: shown }} x={cur.meaning} lv={stageLv && levelText(cur.meaning, stageLv) ? stageLv : ""} onExit={() => setStage(false)} onGo={(m) => { if (m !== sel) { setCur(null); setSel(m); } }} />
      )}
    </Shell>
  );
}

/** What the projector shows at each level, by the publish rule and the decisions so far. */
function LevelBoard({ x, decisions }: { x: Meaning; decisions: Record<string, SavedDecision> }) {
  const rows = projectorByLevel(x, (p) => { const d = decisions[p]; return d && d.rev === x.rev ? d.status : undefined; });
  const decOf = (p: PartId) => { const d = decisions[p]; return d && d.rev === x.rev ? d.decision : undefined; };
  const why = (r: (typeof rows)[number]) => (r.shows === "none" ? "הגדרת הבסיס עוד לא אושרה, ולכן המשמעות לא תוצג במקרן באף רמה."
    : !r.own ? "אין נוסח ייעודי לרמה הזאת, ולכן יוצג נוסח הבסיס המאושר."
    : r.status === "approved" ? "נוסח ייעודי, אושר."
    : `יש נוסח ייעודי, והוא ${r.status === "rejected" ? "נדחה" : decOf(`level_${r.id}` as PartId) === "clarify" ? "סומן כדורש בירור" : r.status === "draft" ? "סומן לתיקון" : "עוד לא אושר"}. עד שיאושר, יוצג נוסח הבסיס המאושר.`);
  return (
    <div className="rv-levels">
      <h3>מה יוצג במקרן בכל רמה</h3>
      <p className="rv-muted">אישור הגדרת הבסיס לא מאשר אף נוסח לפי רמה. כל נוסח לפי רמה מאושר בחלק משלו, למטה.</p>
      <table>
        <thead><tr><th scope="col">רמה</th><th scope="col">מה יוצג</th><th scope="col">למה</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <th scope="row">{r.label}<small>{r.where}</small></th>
              <td>{r.shows === "none" ? <span className="rv-muted">לא יוצג</span> : r.text}</td>
              <td className={`rv-why s-${r.shows}`}>{why(r)}{r.own && r.shows === "base" ? <small>אחרי אישור יוצג: {r.own}</small> : null}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuestionBox({ q }: { q: Question }) {
  return (
    <aside className={`rv-q k-${q.kind}`}>
      <strong>{q.kind === "decision" ? "הכרעה מקצועית" : "שאלה אליכם"}</strong>
      <p>{q.q}</p>
      {q.options?.length ? <ul>{q.options.map((o) => <li key={o}>{o}</li>)}</ul> : null}
      {q.rec ? <p className="rv-muted">ההמלצה שלנו: {q.rec}</p> : null}
    </aside>
  );
}

function StagePreview({ list, x, lv, onExit, onGo }: { list: ListData; x: Meaning; lv: LevelId | ""; onExit: () => void; onGo: (m: string) => void }) {
  const idx = list.meanings.findIndex((y) => y.m === x.m);
  const dg = diagramBoard(x);
  const set: WordSet = useMemo(() => ({ id: "review-preview", subject: "gemara", title: x.unitTitle ?? "פיילוט: מונחי משא ומתן בגמרא", grade: "כיתות ז-ט", lang: "he", words: list.meanings.map((y) => y.w) }), [list, x.unitTitle]);
  // The draft as the projector would show it at the chosen level (the base text when none is chosen).
  const d = lv ? levelText(x, lv) : x.d;
  const items: SetItem[] = list.meanings.map((y) => ({ m: y.m, w: y.w, d: y.m === x.m ? d : "", rev: y.rev, ...(y.m === x.m && dg ? { dg } : {}) }));
  const q = quoteOf(x);
  return (
    <ClassroomStage
      word={x.w}
      definition={d}
      imageUrl={null}
      imageGenerating={false}
      examples={(x.examples ?? []).filter((e: Meaning) => e.kind === "ours").map((e: Meaning) => e.text)}
      quote={q?.text ? { text: q.text, tractate: q.tractate, daf: q.daf, amud: q.amud } : null}
      set={set}
      idx={idx}
      items={items}
      m={x.m}
      lang="he"
      onNavigate={(_w, m) => m && onGo(m)}
      onExit={onExit}
      onSearch={() => {}}
      preview={{ quiz: x.quiz ?? [], game: x.game ?? [] }}
    />
  );
}

function PartCard({ part, x, saved, api, onSaved, label, questions = [], history = [] }: {
  part: Part; x: Meaning; saved?: SavedDecision;
  api: (q: string, init?: RequestInit) => Promise<Response>;
  onSaved: (d: SavedDecision, h: HistoryItem) => void;
  label?: string; questions?: Question[]; history?: HistoryItem[];
}) {
  const fresh = saved && saved.rev === x.rev ? saved : undefined;
  const initial = () => Object.fromEntries(part.fields.filter((f) => f.set).map((f) => [f.key, fresh?.fixes?.[f.key] ?? f.get(x)]));
  const [vals, setVals] = useState<Record<string, string>>(initial);
  const [decision, setDecision] = useState<Decision | "">(fresh?.decision ?? "");
  const [notes, setNotes] = useState(fresh?.notes ?? "");
  const [qc, setQc] = useState(fresh?.quoteCheck ?? { edition: "", tractate: "", daf: "", amud: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const hasQuote = part.id !== "quote" || !!quoteOf(x)?.text;
  const level = LEVELS.find((l) => `level_${l.id}` === part.id);

  const save = async () => {
    if (!decision) return;
    setBusy(true); setMsg(null);
    try {
      const fixes = Object.fromEntries(Object.entries(vals).filter(([k, v]) => v.trim() !== (part.fields.find((f) => f.key === k)?.get(x) ?? "")));
      const r = await api("", { method: "POST", body: JSON.stringify({ m: x.m, part: part.id, decision, notes, fixes, ...(part.id === "quote" ? { quoteCheck: qc } : {}) }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg({ ok: false, text: errorText(String(d.error ?? r.status)) }); return; }
      const sd = d.decision as SavedDecision;
      onSaved(sd, {
        id: sd.historyId ?? sd.at, part: part.id, rev: sd.rev, at: sd.at,
        before: saved ? { decision: saved.decision, status: saved.status, at: saved.at, recordedInHistory: !!saved.historyId } : null,
        after: { decision: sd.decision, status: sd.status }, notes: sd.notes ?? "", changed: Object.keys(sd.fixes ?? {}),
      });
      setMsg({ ok: true, text: `נשמר: ${DECISION_LABEL[decision]}, ${new Date(sd.at).toLocaleTimeString("he-IL", { timeZone: "Asia/Jerusalem", hour: "2-digit", minute: "2-digit" })}` });
    } catch {
      setMsg({ ok: false, text: errorText("") });
    } finally { setBusy(false); }
  };

  return (
    <div className="rv-part" data-part={part.id}>
      <div className="rv-part-head">
        <h3>{label ?? part.label}</h3>
        <span className={`rv-status s-${fresh?.status ?? "none"}`}>{fresh ? STATUS_LABEL[fresh.status] : "טרם הוחלט"}</span>
      </div>
      {questions.map((q, i) => <QuestionBox key={i} q={q} />)}
      {level && <p className="rv-muted">הנוסח הזה יוצג במקרן {level.where} רק אחרי שתאשרו אותו כאן. עד אז מוצג שם נוסח הבסיס.</p>}
      {!hasQuote ? <p className="rv-muted">אין ציטוט במשמעות הזאת.</p> : (
        <>
          <div className="rv-fields">
            {part.fields.filter((f) => f.set || !f.hideEmpty || f.get(x)).map((f) => f.set ? (
              <label key={f.key} className={`rv-field${vals[f.key] !== f.get(x) ? " is-changed" : ""}`}>
                <span>{f.label}{vals[f.key] !== f.get(x) ? " (שונה)" : ""}</span>
                {f.kind === "bool" ? (
                  <select dir="rtl" value={vals[f.key]} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}>
                    <option value="true">נכון</option><option value="false">לא נכון</option>
                  </select>
                ) : f.long ? (
                  <textarea dir={f.key === "image_hint" ? "ltr" : "rtl"} rows={2} value={vals[f.key]} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />
                ) : (
                  <input dir={f.kind === "answer" ? "ltr" : "rtl"} value={vals[f.key]} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />
                )}
              </label>
            ) : (
              <div key={f.key} className="rv-field is-fixed"><span>{f.label}</span><p>{f.get(x) || "אין"}</p></div>
            ))}
          </div>
          {part.id === "quote" && (
            <fieldset className="rv-qc">
              <legend>לאישור הציטוט: מול מה בדקתם?</legend>
              {([["edition", "מהדורה, למשל דפוס וילנא"], ["tractate", "מסכת"], ["daf", "דף"], ["amud", "עמוד"]] as const).map(([k, ph]) => (
                <input key={k} dir="rtl" placeholder={ph} aria-label={ph} value={qc[k]} onChange={(e) => setQc({ ...qc, [k]: e.target.value })} />
              ))}
            </fieldset>
          )}
          <div className="rv-decide" role="radiogroup" aria-label={`החלטה: ${label ?? part.label}`}>
            {(["approve", "fix", "reject", "clarify"] as Decision[]).map((d) => (
              <button key={d} type="button" role="radio" aria-checked={decision === d} className={`rv-dec d-${d}${decision === d ? " is-on" : ""}`} onClick={() => setDecision(d)}>{DECISION_LABEL[d]}</button>
            ))}
          </div>
          <label className="rv-field">
            <span>הערות</span>
            <textarea dir="rtl" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <div className="rv-save">
            <button type="button" className="rv-btn" disabled={!decision || busy} onClick={() => void save()}>{busy ? "שומרים..." : "שמירה"}</button>
            {msg && <span className={msg.ok ? "rv-ok" : "rv-err"} role="status">{msg.text}</span>}
          </div>
          {history.length > 0 && (
            <details className="rv-hist">
              <summary>ההחלטות שלכם על החלק הזה ({history.length})</summary>
              <ol>
                {history.map((h) => (
                  <li key={h.id}>
                    <span>{shortTime(h.at)}, גרסה {h.rev}: {h.before ? `${DECISION_LABEL[h.before.decision]} ← ` : ""}<b>{DECISION_LABEL[h.after.decision]}</b></span>
                    {h.changed.length ? <small>שדות ששונו: {h.changed.map((k) => part.fields.find((f) => f.key === k)?.label ?? k).join(", ")}</small> : null}
                    {h.notes ? <small>הערה: {h.notes}</small> : null}
                  </li>
                ))}
              </ol>
              <p className="rv-muted">לקריאה בלבד. כל החלטה חדשה מתווספת לרשימה, ואף החלטה קודמת לא נמחקת.</p>
            </details>
          )}
        </>
      )}
    </div>
  );
}

function Shell({ children, watermark }: { children: React.ReactNode; watermark?: string }) {
  const href = useHref();
  const wm = watermark
    ? `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='360' height='200'><text x='20' y='120' transform='rotate(-24 180 100)' font-family='Arial' font-size='15' fill='rgba(15,61,62,0.10)'>${watermark.replace(/[<>&'"]/g, "")} · Gadit</text></svg>`)}")`
    : undefined;
  return (
    <div className="rv-root" dir="rtl" lang="he">
      <style>{CSS}</style>
      <header className="rv-top">
        <Link href={href("/")} className="wb-wordmark" dir="ltr">Gad<span className="wb-wordmark-it">it</span></Link>
        <Link href={href("/account")} className="rv-link">לאזור האישי</Link>
      </header>
      <main className="rv-main">{children}</main>
      {wm && <div className="rv-wm" aria-hidden="true" style={{ backgroundImage: wm }} />}
    </div>
  );
}

const CSS = `
.rv-root{min-height:100vh;background:#F6F9F8;color:#0F2E2D}
.rv-top{display:flex;justify-content:space-between;align-items:center;padding:16px clamp(16px,4vw,40px);border-bottom:1px solid #E2EAE8;background:#fff}
.rv-main{max-width:920px;margin:0 auto;padding:28px clamp(16px,4vw,32px) 80px;display:grid;gap:18px}
.rv-h1{margin:0;font-size:clamp(24px,3vw,32px);font-weight:800}
.rv-muted{margin:0;color:#52625F;font-size:15px;line-height:1.6}
.rv-link{color:#0B6E6E;font-weight:600;font-size:15px}
.rv-btn{font:inherit;font-size:15px;font-weight:700;padding:10px 18px;border-radius:12px;border:0;background:#0E8F8C;color:#fff;cursor:pointer}
.rv-btn:disabled{opacity:.45;cursor:default}
.rv-btn:focus-visible,.rv-chip:focus-visible,.rv-dec:focus-visible,.rv-group:focus-visible{outline:3px solid #B45309;outline-offset:2px}
.rv-btn.is-quiet{background:#fff;color:#0B6E6E;border:1.5px solid #0E8F8C}
.rv-head{display:grid;gap:6px}
.rv-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.rv-group{font:inherit;display:grid;gap:2px;align-content:start;text-align:right;padding:10px 12px;border-radius:12px;border:1.5px solid #D5E3E0;background:#fff;color:#0F2E2D;cursor:pointer}
.rv-group span{font-weight:800;font-size:15px}
.rv-group small{font-size:12px;color:#52625F;line-height:1.4}
.rv-group.is-on{border-color:#0E8F8C;background:#E3F4F2}
.rv-group.is-done small:last-child{color:#15803D;font-weight:700}
.rv-progress{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:14px;color:#52625F;font-weight:600}
.rv-bar{flex:1 1 220px;height:10px;border-radius:999px;background:#E2EAE8;overflow:hidden}
.rv-bar i{display:block;height:100%;background:#0E8F8C;border-radius:999px}
.rv-chips{display:flex;flex-wrap:wrap;gap:8px}
.rv-chip{font:inherit;display:grid;gap:2px;text-align:center;padding:8px 14px;border-radius:12px;border:1.5px solid #D5E3E0;background:#fff;color:#0F2E2D;cursor:pointer;font-weight:700;font-size:15px}
.rv-chip small{font-weight:500;font-size:12px;color:#52625F}
.rv-chip.is-on{border-color:#0E8F8C;background:#E3F4F2}
.rv-chip.is-done small{color:#15803D}
.rv-meaning{display:grid;gap:14px}
.rv-meaning-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.rv-meaning-head h2{margin:0;font-size:30px}
.rv-stage-go{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.rv-stage-go select{font:inherit;font-size:15px;padding:8px 10px;border-radius:10px;border:1.5px solid #D5E3E0;background:#fff;color:#0F2E2D}
.rv-version{margin:0;font-size:14px;font-weight:700;color:#0B6E6E}
.rv-qsum{margin:0;font-size:15px;font-weight:700;color:#5B3B00;background:#FFF8EA;border-radius:10px;padding:8px 12px}
.rv-q{border-inline-start:4px solid #D97706;background:#FFF8EA;border-radius:10px;padding:10px 12px;display:grid;gap:4px}
.rv-q.k-question{border-color:#0E8F8C;background:#EEF8F7}
.rv-q strong{font-size:13px;color:#5B3B00}
.rv-q.k-question strong{color:#0B5C5C}
.rv-q p{margin:0;font-size:15px;line-height:1.6}
.rv-q ul{margin:0;padding-inline-start:20px;font-size:14px;line-height:1.6}
.rv-levels{background:#fff;border:1px solid #E2EAE8;border-radius:16px;padding:16px 18px;display:grid;gap:10px;overflow-x:auto}
.rv-levels h3{margin:0;font-size:19px}
.rv-levels table{border-collapse:collapse;width:100%;font-size:15px;line-height:1.55}
.rv-levels th,.rv-levels td{text-align:right;vertical-align:top;padding:8px;border-top:1px solid #E2EAE8}
.rv-levels thead th{font-size:13px;color:#52625F;border-top:0}
.rv-levels tbody th{font-weight:700;width:22%}
.rv-levels small{display:block;font-weight:500;font-size:12px;color:#52625F;margin-top:2px}
.rv-why{width:32%;font-size:14px}
.rv-why.s-own{color:#15803D}
.rv-why.s-base{color:#5B3B00}
.rv-part{background:#fff;border:1px solid #E2EAE8;border-radius:16px;padding:16px 18px;display:grid;gap:12px}
.rv-part-head{display:flex;justify-content:space-between;align-items:center;gap:10px}
.rv-part-head h3{margin:0;font-size:19px}
.rv-status{font-size:13px;font-weight:700;border-radius:999px;padding:3px 12px;background:#EEF2F1;color:#52625F}
.rv-status.s-approved{background:#DCFCE7;color:#15803D}.rv-status.s-draft{background:#FEF3C7;color:#92400E}.rv-status.s-rejected{background:#FEE2E2;color:#B91C1C}
.rv-fields{display:grid;gap:10px}
.rv-field{display:grid;gap:4px}
.rv-field>span{font-size:13px;font-weight:600;color:#52625F}
.rv-field input,.rv-field textarea,.rv-field select,.rv-qc input{font:inherit;font-size:16px;padding:8px 10px;border-radius:10px;border:1.5px solid #D5E3E0;background:#FBFDFC;color:#0F2E2D;width:100%;box-sizing:border-box}
.rv-field textarea{resize:vertical;line-height:1.5}
.rv-field.is-changed input,.rv-field.is-changed textarea,.rv-field.is-changed select{border-color:#F3B544;background:#FFF8EA}
.rv-field.is-fixed p{margin:0;font-size:16px;line-height:1.6;background:#F6F9F8;border-radius:10px;padding:8px 10px}
.rv-qc{border:1.5px dashed #F3B544;border-radius:12px;padding:10px 12px;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:8px;margin:0}
.rv-qc legend{font-size:13px;font-weight:700;color:#92400E;padding:0 6px}
.rv-decide{display:flex;gap:8px;flex-wrap:wrap}
.rv-dec{font:inherit;font-size:15px;font-weight:700;padding:8px 18px;border-radius:999px;border:1.5px solid #D5E3E0;background:#fff;cursor:pointer;color:#0F2E2D}
.rv-dec.d-approve.is-on{background:#16A34A;border-color:#16A34A;color:#fff}
.rv-dec.d-fix.is-on{background:#D97706;border-color:#D97706;color:#fff}
.rv-dec.d-reject.is-on{background:#DC2626;border-color:#DC2626;color:#fff}
.rv-dec.d-clarify.is-on{background:#4F46E5;border-color:#4F46E5;color:#fff}
.rv-save{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.rv-ok{color:#15803D;font-weight:600;font-size:14px}.rv-err{color:#B91C1C;font-weight:600;font-size:14px}
.rv-hist{border-top:1px dashed #D5E3E0;padding-top:8px}
.rv-hist summary{cursor:pointer;font-weight:700;font-size:14px;color:#0B6E6E}
.rv-hist ol{margin:8px 0;padding-inline-start:20px;display:grid;gap:6px;font-size:14px}
.rv-hist li small{display:block;color:#52625F}
.rv-next{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;padding-top:6px}
.rv-wm{position:fixed;inset:0;z-index:90;pointer-events:none;background-repeat:repeat}
@media (max-width:640px){.rv-qc{grid-template-columns:1fr 1fr}.rv-levels tbody th,.rv-why{width:auto}}
`;

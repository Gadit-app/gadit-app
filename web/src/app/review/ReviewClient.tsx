"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";
import { ClassroomStage } from "@/components/classroom/ClassroomStage";
import { PARTS, diagramBoard, quoteOf, type Decision, type Meaning, type Part, type PartId } from "@/lib/review-parts";
import type { SetItem, WordSet } from "@/lib/word-sets";

/**
 * The expert's content review (Gemara pilot, Gadi 2026-10-15). The ten draft
 * meanings, each part decided on its own: approve, fix (with corrections in
 * place) or reject. "הצגה כמו בכיתה" opens the real projector screen with the
 * draft. Every screen carries a watermark with the reviewer's email. Hebrew
 * only: the review is in Hebrew.
 */

type ListItem = { m: string; w: string; rev: number; parts: PartId[]; decided: Record<string, string> };
type ListData = { title: string; expiresAt: string; name: string; email: string; meanings: ListItem[] };
type SavedDecision = { decision: Decision; status: string; notes: string; fixes: Record<string, string>; quoteCheck?: { edition: string; tractate: string; daf: string; amud: string }; at: string; rev: number };
type MeaningData = { meaning: Meaning; parts: PartId[]; decisions: Record<string, SavedDecision> };

const DECISION_LABEL: Record<Decision, string> = { approve: "אישור", fix: "תיקון", reject: "דחייה" };
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
const israelTime = (iso: string) => new Date(iso).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem", weekday: "long", day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function ReviewClient() {
  const { user, loading, promptLogin } = useAuth();
  const href = useHref();
  const [list, setList] = useState<ListData | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "closed" | "error">("loading");
  const [sel, setSel] = useState<string>("");
  const [cur, setCur] = useState<MeaningData | null>(null);
  const [stage, setStage] = useState(false);

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
      setSel((s) => s || d.meanings[0]?.m || "");
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

  const onSaved = (m: string, part: PartId, d: SavedDecision) => {
    setCur((c) => (c && c.meaning.m === m ? { ...c, decisions: { ...c.decisions, [part]: d } } : c));
    setList((l) => (l ? { ...l, meanings: l.meanings.map((x) => (x.m === m ? { ...x, decided: { ...x.decided, [part]: d.status } } : x)) } : l));
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
  return (
    <Shell watermark={list.email}>
      <header className="rv-head">
        <h1 className="rv-h1">{list.title}</h1>
        <p className="rv-muted">שלום {list.name}. הגישה פתוחה עד {israelTime(list.expiresAt)} (שעון ישראל). כל החלטה נשמרת מיד.</p>
      </header>
      <nav className="rv-chips" aria-label="המשמעויות">
        {list.meanings.map((x, i) => {
          const done = x.parts.filter((p) => x.decided[p]).length;
          return (
            <button key={x.m} type="button" className={`rv-chip${x.m === sel ? " is-on" : ""}${done === x.parts.length ? " is-done" : ""}`} onClick={() => { setCur(null); setSel(x.m); }}>
              <span>{x.w}{list.meanings.filter((y) => y.w === x.w).length > 1 ? ` (${list.meanings.filter((y, j) => y.w === x.w && j <= i).length})` : ""}</span>
              <small>{done} מתוך {x.parts.length}</small>
            </button>
          );
        })}
      </nav>
      {!cur || cur.meaning.m !== sel ? <p className="rv-muted">טוענים...</p> : (
        <section className="rv-meaning">
          <div className="rv-meaning-head">
            <h2>{cur.meaning.w}</h2>
            <button type="button" className="rv-btn" onClick={() => setStage(true)}>הצגה כמו בכיתה</button>
          </div>
          <p className="rv-muted">כך המורה יקרין את המשמעות לכיתה. התמונה עוד לא נוצרה, ולכן במסך אין תמונה.</p>
          {PARTS.filter((p) => cur.parts.includes(p.id)).map((p) => (
            <PartCard key={`${cur.meaning.m}-${p.id}`} part={p} x={cur.meaning} saved={cur.decisions[p.id]} api={api} onSaved={(d) => onSaved(cur.meaning.m, p.id, d)} />
          ))}
        </section>
      )}
      {stage && cur && item && (
        <StagePreview list={list} x={cur.meaning} onExit={() => setStage(false)} onGo={(m) => { setCur(null); setSel(m); }} />
      )}
    </Shell>
  );
}

function StagePreview({ list, x, onExit, onGo }: { list: ListData; x: Meaning; onExit: () => void; onGo: (m: string) => void }) {
  const idx = list.meanings.findIndex((y) => y.m === x.m);
  const dg = diagramBoard(x);
  const set: WordSet = useMemo(() => ({ id: "review-preview", subject: "gemara", title: x.unitTitle ?? "פיילוט: מונחי משא ומתן בגמרא", grade: "כיתות ז-ט", lang: "he", words: list.meanings.map((y) => y.w) }), [list, x.unitTitle]);
  const items: SetItem[] = list.meanings.map((y) => ({ m: y.m, w: y.w, d: y.m === x.m ? x.d : "", rev: y.rev, ...(y.m === x.m && dg ? { dg } : {}) }));
  const q = quoteOf(x);
  return (
    <ClassroomStage
      word={x.w}
      definition={x.d}
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

function PartCard({ part, x, saved, api, onSaved }: {
  part: Part; x: Meaning; saved?: SavedDecision;
  api: (q: string, init?: RequestInit) => Promise<Response>;
  onSaved: (d: SavedDecision) => void;
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

  const save = async () => {
    if (!decision) return;
    setBusy(true); setMsg(null);
    try {
      const fixes = Object.fromEntries(Object.entries(vals).filter(([k, v]) => v.trim() !== (part.fields.find((f) => f.key === k)?.get(x) ?? "")));
      const r = await api("", { method: "POST", body: JSON.stringify({ m: x.m, part: part.id, decision, notes, fixes, ...(part.id === "quote" ? { quoteCheck: qc } : {}) }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg({ ok: false, text: errorText(String(d.error ?? r.status)) }); return; }
      onSaved(d.decision);
      setMsg({ ok: true, text: `נשמר: ${DECISION_LABEL[decision]}, ${new Date(d.decision.at).toLocaleTimeString("he-IL", { timeZone: "Asia/Jerusalem", hour: "2-digit", minute: "2-digit" })}` });
    } catch {
      setMsg({ ok: false, text: errorText("") });
    } finally { setBusy(false); }
  };

  return (
    <div className="rv-part">
      <div className="rv-part-head">
        <h3>{part.label}</h3>
        <span className={`rv-status s-${fresh?.status ?? "none"}`}>{fresh ? STATUS_LABEL[fresh.status] : "טרם הוחלט"}</span>
      </div>
      {!hasQuote ? <p className="rv-muted">אין ציטוט במשמעות הזאת.</p> : (
        <>
          <div className="rv-fields">
            {part.fields.map((f) => f.set ? (
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
          <div className="rv-decide" role="radiogroup" aria-label={`החלטה: ${part.label}`}>
            {(["approve", "fix", "reject"] as Decision[]).map((d) => (
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
.rv-btn:focus-visible,.rv-chip:focus-visible,.rv-dec:focus-visible{outline:3px solid #B45309;outline-offset:2px}
.rv-head{display:grid;gap:6px}
.rv-chips{display:flex;flex-wrap:wrap;gap:8px}
.rv-chip{font:inherit;display:grid;gap:2px;text-align:center;padding:8px 14px;border-radius:12px;border:1.5px solid #D5E3E0;background:#fff;color:#0F2E2D;cursor:pointer;font-weight:700;font-size:15px}
.rv-chip small{font-weight:500;font-size:12px;color:#52625F}
.rv-chip.is-on{border-color:#0E8F8C;background:#E3F4F2}
.rv-chip.is-done small{color:#15803D}
.rv-meaning{display:grid;gap:14px}
.rv-meaning-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.rv-meaning-head h2{margin:0;font-size:30px}
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
.rv-save{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.rv-ok{color:#15803D;font-weight:600;font-size:14px}.rv-err{color:#B91C1C;font-weight:600;font-size:14px}
.rv-wm{position:fixed;inset:0;z-index:90;pointer-events:none;background-repeat:repeat}
@media (max-width:640px){.rv-qc{grid-template-columns:1fr 1fr}}
`;

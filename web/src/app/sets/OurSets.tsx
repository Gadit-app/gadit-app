"use client";

import { WaitText } from "@/components/WaitText";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useHref } from "@/lib/href";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { LANGUAGES, langNameIn, type Lang } from "@/lib/i18n";
import { registerWordSet, type WordSet } from "@/lib/word-sets";
import { isSchoolSetId, splitSetWords, setLangOf, cleanSetLevel, SCHOOL_SET_LEVELS, SCHOOL_SET_MAX_WORDS, SCHOOL_SET_MAX_SETS, SCHOOL_SET_TITLE_MAX, type SchoolSetLevel } from "@/lib/school-set-ids";
import { OUR_SETS_COPY, fillCopy, type OurSetsCopy } from "./our-sets-copy";

/**
 * "Our sets" at the top of /sets (Gadi 2026-10-17): the school's own word
 * sets. The teacher names a set and adds words by typing them (one per
 * line), from a photo of the book page (/api/ocr, then the page's key terms),
 * or by the lesson topic; the list stays editable until it is saved. A saved
 * set opens on the projector exactly like a ready set (?present=1&set=<id>):
 * same word page, picture, examples, class quiz and game. Stored per school
 * via /api/school-sets, with its own definition for every word (written when
 * the set is saved) and a level, elementary or middle and high school, that
 * sets the pictures, definitions, examples and class quiz. In the viewer's UI
 * language (every UI language).
 */

/** lang null: follows the words' script until the teacher picks one. */
type Editor = { id?: string; title: string; text: string; level: SchoolSetLevel; lang: string | null };
type OurSet = WordSet & { defs?: Record<string, string> };
type Busy = "" | "photo" | "topic" | "save" | "delete";

/** The projector's close button returns here, with this set open
 *  (same key as the curriculum browser; read by the word page). */
const SETS_RETURN_KEY = "gadit-sets-return";
function rememberReturn(setId: string) {
  try {
    sessionStorage.setItem(SETS_RETURN_KEY, JSON.stringify({ setId, url: window.location.pathname + window.location.search }));
  } catch { /* storage blocked */ }
}

const RTL_LANGS = new Set(["he", "ar", "fa"]);

/** "12 words"; Arabic counted nouns take their own forms. */
function wordsN(c: OurSetsCopy, lang: string, n: number): string {
  if (lang !== "ar") return `${n} ${c.words}`;
  if (n === 1) return "كلمة واحدة";
  if (n === 2) return "كلمتان";
  const r = n % 100;
  return `${n} ${r >= 3 && r <= 10 ? "كلمات" : r >= 11 ? "كلمةً" : "كلمة"}`;
}

export default function OurSets() {
  const { user, schoolId } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const c = OUR_SETS_COPY[lang as Lang] ?? OUR_SETS_COPY.en;

  const [sets, setSets] = useState<OurSet[] | null>(null);
  const [defaultLevel, setDefaultLevel] = useState<SchoolSetLevel>("elementary");
  const [open, setOpen] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [confirmDel, setConfirmDel] = useState("");
  const [busy, setBusy] = useState<Busy>("");
  const [msg, setMsg] = useState<{ text: string; bad?: boolean; wait?: boolean } | null>(null);
  const [topicOpen, setTopicOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);

  // The school's sets; back from the projector, the set it was opened from is open.
  useEffect(() => {
    if (!user || !schoolId) return;
    let alive = true;
    user.getIdToken()
      .then((tk) => fetch("/api/school-sets", { headers: { Authorization: `Bearer ${tk}` }, cache: "no-store" }))
      .then((r) => (r.ok ? r.json() : { sets: [] }))
      .then((j: { sets?: OurSet[]; defaultLevel?: string }) => {
        if (!alive) return;
        const list = Array.isArray(j.sets) ? j.sets : [];
        // With the set's own definitions, so the projector shows them (classroomDef).
        for (const s of list) registerWordSet(s, s.defs ?? {});
        setDefaultLevel(cleanSetLevel(j.defaultLevel));
        setSets(list);
        try {
          const r = JSON.parse(sessionStorage.getItem(SETS_RETURN_KEY) || "null") as { setId?: string } | null;
          if (r?.setId && isSchoolSetId(r.setId) && list.some((s) => s.id === r.setId)) setOpen(r.setId);
        } catch { /* storage blocked */ }
      })
      .catch(() => { if (alive) setSets([]); });
    return () => { alive = false; };
  }, [user, schoolId]);

  if (!user || !schoolId || !sets) return null;

  const words = editor ? splitSetWords(editor.text) : [];
  const tooMany = words.length > SCHOOL_SET_MAX_WORDS;

  const authed = async (url: string, init: RequestInit = {}) => {
    const tk = await user.getIdToken();
    return fetch(url, { ...init, headers: { ...(init.headers ?? {}), Authorization: `Bearer ${tk}` } });
  };

  /** Suggested words go under the teacher's own, without repeats. */
  const addWords = (list: string[]) => {
    setEditor((e) => (e ? { ...e, text: splitSetWords([e.text, ...list].join("\n")).join("\n") } : e));
  };
  const suggest = async (from: "photo" | "topic", text: string): Promise<boolean> => {
    const r = await authed("/api/school-sets/words", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from, text }) });
    const j = (await r.json().catch(() => ({}))) as { words?: string[] };
    const list = Array.isArray(j.words) ? j.words : [];
    if (!r.ok || !list.length) return false;
    addWords(list);
    setMsg({ text: c.added });
    return true;
  };

  async function fromPhoto(file: File) {
    if (busy) return;
    setBusy("photo");
    setMsg({ text: c.reading, wait: true });
    try {
      // The same page reader as the homework photo.
      const fd = new FormData();
      fd.append("image", file);
      const r = await authed("/api/ocr", { method: "POST", body: fd });
      const text = (((await r.json().catch(() => ({}))) as { text?: string }).text ?? "").trim();
      if (!r.ok || text.length < 2 || !(await suggest("photo", text))) setMsg({ text: c.photoFail, bad: true });
    } catch {
      setMsg({ text: c.photoFail, bad: true });
    } finally {
      setBusy("");
    }
  }

  async function fromTopic() {
    const t = topic.trim();
    if (busy || t.length < 2) return;
    setBusy("topic");
    setMsg({ text: c.finding, wait: true });
    try {
      if (await suggest("topic", t)) setTopic("");
      else setMsg({ text: c.noWords, bad: true });
    } catch {
      setMsg({ text: c.noWords, bad: true });
    } finally {
      setBusy("");
    }
  }

  async function save() {
    if (!editor || busy) return;
    const title = editor.title.trim();
    if (!title) return setMsg({ text: c.needName, bad: true });
    if (!words.length) return setMsg({ text: c.needWords, bad: true });
    if (tooMany) return setMsg({ text: fillCopy(c.tooMany, { max: SCHOOL_SET_MAX_WORDS }), bad: true });
    setBusy("save");
    setMsg(null);
    try {
      const r = await authed("/api/school-sets", {
        method: editor.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(editor.id ? { id: editor.id } : {}), title, words, level: editor.level, lang: editor.lang ?? setLangOf(words) }),
      });
      const j = (await r.json().catch(() => ({}))) as { set?: OurSet; error?: string };
      if (!r.ok || !j.set) {
        setMsg({ text: j.error === "too_many_sets" ? fillCopy(c.limit, { max: SCHOOL_SET_MAX_SETS }) : j.error === "too_many_words" ? fillCopy(c.tooMany, { max: SCHOOL_SET_MAX_WORDS }) : c.err, bad: true });
        return;
      }
      const set = j.set;
      registerWordSet(set, set.defs ?? {});
      setSets((list) => (editor.id ? (list ?? []).map((s) => (s.id === set.id ? set : s)) : [set, ...(list ?? [])]));
      setOpen(set.id);
      closeEditor();
    } catch {
      setMsg({ text: c.err, bad: true });
    } finally {
      setBusy("");
    }
  }

  async function remove(id: string) {
    if (busy) return;
    setBusy("delete");
    try {
      const r = await authed(`/api/school-sets?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (r.ok || r.status === 404) {
        setSets((list) => (list ?? []).filter((s) => s.id !== id));
        if (open === id) setOpen("");
      }
    } catch { /* stays listed */ } finally {
      setBusy("");
      setConfirmDel("");
    }
  }

  function startEditor(e: Editor) {
    setEditor(e);
    setMsg(null);
    setTopic("");
    setTopicOpen(false);
    setConfirmDel("");
  }
  function closeEditor() {
    setEditor(null);
    setTopic("");
    setTopicOpen(false);
  }

  const atLimit = sets.length >= SCHOOL_SET_MAX_SETS;

  return (
    <section className="os" dir={dir}>
      <style>{CSS}</style>
      <div className="os-head">
        <h2 className="os-h2">
          {c.title}
          {sets.length > 0 && <span className="os-count">{sets.length}</span>}
        </h2>
        {!editor && (
          <button type="button" className="os-new" disabled={atLimit} title={atLimit ? fillCopy(c.limit, { max: SCHOOL_SET_MAX_SETS }) : undefined} onClick={() => startEditor({ title: "", text: "", level: defaultLevel, lang: null })}>
            <PlusIcon /> {c.create}
          </button>
        )}
      </div>

      {editor && (
        <div className="os-editor">
          <label className="os-label" htmlFor="os-name">{c.nameLabel}</label>
          <input id="os-name" className="os-input" dir={dir} value={editor.title} maxLength={SCHOOL_SET_TITLE_MAX} placeholder={c.namePh}
            onChange={(e) => { setEditor({ ...editor, title: e.target.value }); setMsg(null); }} />

          <span className="os-label" id="os-level">{c.levelLabel}</span>
          <div className="os-levels" role="radiogroup" aria-labelledby="os-level">
            {SCHOOL_SET_LEVELS.map((l) => (
              <button key={l} type="button" role="radio" aria-checked={editor.level === l} className={"os-level" + (editor.level === l ? " on" : "")}
                onClick={() => setEditor({ ...editor, level: l })}>
                {l === "secondary" ? c.secondary : c.elementary}
              </button>
            ))}
          </div>

          <label className="os-label" htmlFor="os-lang">{c.langLabel}</label>
          <select id="os-lang" className="os-input os-select" dir={dir} value={editor.lang ?? setLangOf(words)}
            onChange={(e) => setEditor({ ...editor, lang: e.target.value })}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{langNameIn(l.code, lang)}</option>
            ))}
          </select>

          <label className="os-label" htmlFor="os-words">{c.wordsLabel}</label>
          <textarea id="os-words" className="os-input os-text" dir={dir} rows={7} value={editor.text} placeholder={c.wordsPh}
            onChange={(e) => { setEditor({ ...editor, text: e.target.value }); setMsg(null); }} />
          <div className={"os-counter" + (tooMany ? " bad" : "")}>{fillCopy(c.counter, { n: words.length, max: SCHOOL_SET_MAX_WORDS })}</div>

          <div className="os-tools">
            <button type="button" className="os-tool" disabled={!!busy} onClick={() => photoRef.current?.click()}>
              {busy === "photo" ? <span className="os-spin" aria-hidden /> : <CameraIcon />} {c.photo}
            </button>
            <input ref={photoRef} type="file" accept="image/*" hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void fromPhoto(f); e.target.value = ""; }} />
            <button type="button" className={"os-tool" + (topicOpen ? " on" : "")} disabled={!!busy && busy !== "topic"} aria-expanded={topicOpen} onClick={() => setTopicOpen((v) => !v)}>
              <SparkIcon /> {c.topic}
            </button>
          </div>
          {topicOpen && (
            <div className="os-topic">
              <input className="os-input" dir={dir} value={topic} maxLength={120} placeholder={c.topicPh} aria-label={c.topic}
                onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void fromTopic(); } }} />
              <button type="button" className="os-tool solid" disabled={!!busy || topic.trim().length < 2} onClick={() => void fromTopic()}>
                {busy === "topic" ? <span className="os-spin light" aria-hidden /> : null} {c.topicGo}
              </button>
            </div>
          )}

          {msg && <p className={"os-msg" + (msg.bad ? " bad" : "")} role={msg.bad ? "alert" : "status"}>{msg.wait && busy ? <WaitText text={msg.text} /> : msg.text}</p>}

          <div className="os-actions">
            <button type="button" className="os-save" disabled={!!busy} onClick={() => void save()}>
              {busy === "save" ? <span className="os-spin light" aria-hidden /> : null} {busy === "save" ? <WaitText text={c.savingDefs} /> : c.save}
            </button>
            <button type="button" className="os-cancel" disabled={busy === "save"} onClick={closeEditor}>{c.cancel}</button>
          </div>
        </div>
      )}

      {sets.length === 0 && !editor ? (
        <p className="os-empty">{c.empty}</p>
      ) : (
        <ul className="os-list">
          {sets.map((set) => {
            const isOpen = open === set.id;
            const first = set.words[0] ?? "";
            const link = (w: string) => href(`/word/${encodeURIComponent(w)}?present=1&set=${encodeURIComponent(set.id)}`);
            return (
              <li key={set.id} className={"os-row" + (isOpen ? " open" : "")}>
                <button type="button" className="os-row-head" aria-expanded={isOpen} onClick={() => { setOpen(isOpen ? "" : set.id); setConfirmDel(""); }}>
                  <span className="os-row-title">{set.title}</span>
                  <span className="os-row-level">{set.level === "secondary" ? c.secondary : c.elementary}</span>
                  <span className="os-row-level lang">{langNameIn(set.lang, lang)}</span>
                  <span className="os-row-meta">{wordsN(c, lang, set.words.length)}</span>
                  <Chevron down={isOpen} rtl={dir === "rtl"} />
                </button>
                {isOpen && (
                  <div className="os-row-body">
                    <div className="os-chips" dir={RTL_LANGS.has(set.lang) ? "rtl" : "ltr"}>
                      {set.words.map((w) => (
                        <Link key={w} href={link(w)} className="os-chip" onClick={() => rememberReturn(set.id)}>{w}</Link>
                      ))}
                    </div>
                    <div className="os-row-actions">
                      {first && (
                        <Link href={link(first)} className="os-present" onClick={() => rememberReturn(set.id)}>
                          <ScreenIcon /> {c.present} <span>· {wordsN(c, lang, set.words.length)}</span>
                        </Link>
                      )}
                      <span className="os-row-tools">
                        <button type="button" className="os-link" disabled={!!busy || !!editor} onClick={() => startEditor({ id: set.id, title: set.title, text: set.words.join("\n"), level: cleanSetLevel(set.level), lang: set.lang })}>{c.edit}</button>
                        <button type="button" className="os-link danger" disabled={!!busy} onClick={() => setConfirmDel(confirmDel === set.id ? "" : set.id)}>{c.del}</button>
                      </span>
                    </div>
                    {confirmDel === set.id && (
                      <div className="os-confirm" role="alert">
                        <span>{c.delAsk}</span>
                        <button type="button" className="os-danger" disabled={!!busy} onClick={() => void remove(set.id)}>
                          {busy === "delete" ? <span className="os-spin light" aria-hidden /> : null} {c.delYes}
                        </button>
                        <button type="button" className="os-cancel" onClick={() => setConfirmDel("")}>{c.cancel}</button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ── Icons (inline, like the rest of /sets) ───────────────────────────── */

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
    </svg>
  );
}
function ScreenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" />
    </svg>
  );
}
function Chevron({ down, rtl }: { down?: boolean; rtl: boolean }) {
  const rot = down ? -90 : rtl ? 0 : 180;
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: `rotate(${rot}deg)`, transition: "transform .2s", flexShrink: 0 }}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

const CSS = `
.os{--c:#0E8A8A;margin:0 0 28px}
.os-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px}
.os-h2{display:flex;align-items:center;gap:10px;font-size:18px;font-weight:800;margin:0;color:var(--ink)}
.os-count{font-size:13px;font-weight:700;color:var(--ink-faint);background:var(--surface);border:1px solid var(--rule);border-radius:999px;padding:1px 9px}
.os-new{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:12px;border:none;background:var(--c);color:#fff;font:inherit;font-weight:800;font-size:15px;cursor:pointer}
.os-new:hover{filter:brightness(1.07)}
.os-new:disabled{opacity:.55;cursor:default;filter:none}
.os-empty{margin:0;padding:14px 16px;border:1px dashed color-mix(in srgb,var(--c) 35%,var(--rule));border-radius:14px;background:var(--surface);color:var(--ink-muted);font-size:15px;line-height:1.6}
.os-editor{display:flex;flex-direction:column;gap:6px;background:var(--surface);border:1px solid color-mix(in srgb,var(--c) 40%,var(--rule));border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 1px 2px rgba(11,18,32,.04)}
.os-label{font-size:13.5px;font-weight:700;color:var(--ink-soft);margin-top:6px}
.os-label:first-child{margin-top:0}
.os-input{width:100%;box-sizing:border-box;font:inherit;font-size:16px;color:var(--ink);background:var(--paper);border:1px solid var(--rule);border-radius:11px;padding:10px 12px;outline:none}
.os-input:focus{border-color:#0EA5A5;box-shadow:0 0 0 3px rgba(14,165,165,.15)}
.os-text{resize:vertical;line-height:1.6;min-height:150px}
.os-counter{font-size:12.5px;font-weight:600;color:var(--ink-faint)}
.os-counter.bad{color:#B42318}
.os-tools{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
.os-tool{display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:11px;border:1.5px solid var(--c);background:transparent;color:var(--c);font:inherit;font-weight:700;font-size:14px;cursor:pointer}
.os-tool:hover,.os-tool.on{background:color-mix(in srgb,var(--c) 8%,#fff)}
.os-tool.solid{background:var(--c);color:#fff;flex-shrink:0}
.os-tool:disabled{opacity:.55;cursor:default}
.os-topic{display:flex;gap:8px;margin-top:4px}
.os-topic .os-input{flex:1;min-width:0}
.os-msg{margin:6px 0 0;font-size:14px;color:var(--ink-muted)}
.os-msg.bad{color:#B42318}
.os-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.os-save{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:12px;border:none;background:var(--c);color:#fff;font:inherit;font-weight:800;font-size:15px;cursor:pointer}
.os-save:disabled{opacity:.6;cursor:default}
.os-cancel{padding:10px 16px;border-radius:12px;border:1px solid var(--rule);background:var(--surface);color:var(--ink-soft);font:inherit;font-weight:700;font-size:14.5px;cursor:pointer}
.os-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.os-row{background:var(--surface);border:1px solid var(--rule);border-inline-start:3px solid var(--c);border-radius:14px;overflow:hidden}
.os-row.open{border-color:color-mix(in srgb,var(--c) 45%,var(--rule));border-inline-start-color:var(--c)}
.os-row-head{width:100%;display:flex;align-items:center;gap:10px;padding:13px 14px;border:none;background:none;font:inherit;color:var(--ink);cursor:pointer;text-align:start}
.os-row-head:hover .os-row-title{color:var(--c)}
.os-row-title{flex:1;min-width:0;font-weight:700;font-size:15.5px;line-height:1.4}
.os-levels{display:inline-flex;gap:4px;align-self:flex-start;background:var(--paper-deep,#EEF2F1);padding:4px;border-radius:12px;flex-wrap:wrap}
.os-level{border:1px solid transparent;background:transparent;font:inherit;font-size:14.5px;font-weight:700;color:var(--ink-soft);padding:7px 14px;border-radius:9px;cursor:pointer}
.os-level:hover{color:var(--ink)}
.os-level.on{background:var(--surface);color:var(--c);border-color:color-mix(in srgb,var(--c) 35%,var(--rule));box-shadow:0 1px 3px rgba(11,18,32,.1)}
.os-select{max-width:320px;cursor:pointer}
.os-row-level.lang{color:var(--ink-soft);background:var(--paper);border-color:var(--rule)}
.os-row-level{flex-shrink:0;font-size:12px;font-weight:700;color:var(--c);background:color-mix(in srgb,var(--c) 8%,#fff);border:1px solid color-mix(in srgb,var(--c) 20%,#fff);border-radius:7px;padding:1px 8px}
.os-row-meta{flex-shrink:0;font-size:12.5px;font-weight:700;color:var(--ink-faint);background:var(--paper);border-radius:7px;padding:2px 8px}
.os-row-body{padding:0 14px 14px;display:flex;flex-direction:column;gap:12px}
.os-chips{display:flex;flex-wrap:wrap;gap:6px}
.os-chip{font-size:14px;font-weight:600;color:var(--c);background:color-mix(in srgb,var(--c) 7%,#fff);border:1px solid color-mix(in srgb,var(--c) 18%,#fff);border-radius:9px;padding:5px 10px;text-decoration:none}
.os-chip:hover{background:color-mix(in srgb,var(--c) 13%,#fff)}
.os-row-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.os-present{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;background:var(--c);color:#fff;font-weight:800;font-size:15px;text-decoration:none}
.os-present span{font-size:12.5px;font-weight:600;opacity:.85}
.os-present:hover{filter:brightness(1.07)}
.os-row-tools{display:inline-flex;gap:4px}
.os-link{border:none;background:none;font:inherit;font-weight:700;font-size:14px;color:var(--ink-muted);padding:6px 8px;border-radius:8px;cursor:pointer}
.os-link:hover{color:var(--ink);background:var(--paper)}
.os-link.danger:hover{color:#B42318}
.os-link:disabled{opacity:.5;cursor:default}
.os-confirm{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 12px;border-radius:12px;background:#FEF3F2;color:#7A271A;font-size:14.5px;font-weight:600}
.os-confirm span{flex:1;min-width:180px}
.os-danger{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;border:none;background:#B42318;color:#fff;font:inherit;font-weight:800;font-size:14px;cursor:pointer}
.os-confirm .os-cancel{padding:8px 14px}
.os-spin{width:16px;height:16px;border-radius:50%;border:2px solid color-mix(in srgb,var(--c) 25%,#fff);border-top-color:var(--c);animation:osspin .8s linear infinite;flex-shrink:0}
.os-spin.light{border-color:rgba(255,255,255,.35);border-top-color:#fff}
@keyframes osspin{to{transform:rotate(360deg)}}
@media (max-width:560px){
  .os-topic{flex-direction:column}
  .os-row-head{flex-wrap:wrap;row-gap:6px}
  .os-row-title{flex-basis:100%}
  .os-select{max-width:none}
  .os-row-actions{flex-direction:column;align-items:stretch}
  .os-present{justify-content:center}
  .os-row-tools{justify-content:center}
}
@media (prefers-reduced-motion:reduce){.os-spin{animation:none}}
`;

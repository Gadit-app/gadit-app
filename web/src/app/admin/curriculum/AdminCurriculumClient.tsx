"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminContext } from "../admin-context";
import {
  CATALOG_IDS, catalogView, arSubject, arLevel, arTopic, type CatalogId, type ViewTopic,
} from "@/lib/curriculum-catalog";

/**
 * /admin/curriculum (Gadi 2026-10-04): fix any word or definition in any
 * curriculum unit without asking for a code change. Pick a level and a
 * subject (or search), open a unit, edit its key words and in-lesson
 * definitions, save. A save takes effect at once on the projector, and the
 * picture, examples, quiz and game follow the new definition. Every
 * catalog: Israel (Hebrew), Arab state education, South Africa CAPS.
 */

const CAT_NAME: Record<CatalogId, { he: string; en: string }> = {
  "il-he": { he: "ישראל, עברית", en: "Israel, Hebrew" },
  "il-ar": { he: "חינוך ערבי ממלכתי", en: "Arab state education" },
  "za-caps": { he: "דרום אפריקה, CAPS", en: "South Africa, CAPS" },
};
/** Names for the admin: the Arab catalog shown with its Hebrew names. */
function adminCatalog(id: CatalogId, he: boolean) {
  const v = catalogView(id);
  const ar = id === "il-ar" && he;
  return {
    levels: v.levels.map((l) => ({ key: l.key, name: ar ? arLevel(l.key)?.he ?? l.name : l.name })),
    subjects: v.subjects.map((x) => ({ key: x.key, name: ar ? arSubject(x.key)?.he ?? x.name : x.name })),
    topics: v.topics,
    defaultLevel: v.defaultLevel,
    gradeLabel: v.gradeLabel,
    sub: (t: ViewTopic) => (id === "il-ar" ? arTopic(t.id)?.th ?? "" : ""),
  };
}

const SECRET_KEY = "gadit_admin_secret_v1";
type Row = { w: string; d: string };

const STR = {
  he: {
    title: "קטלוג תוכנית הלימודים",
    sub: "כל נושא בכל מקצוע: מילות המפתח וההגדרה של כל מילה בתוך השיעור. משנים, שומרים, וזה מופיע מיד במקרן.",
    catalog: "תוכנית", level: "שכבה", subject: "מקצוע", all: "כל המקצועות", search: "חיפוש נושא",
    units: "נושאים", ready: "מוכן", edited: "נערך", none: "בחר נושא מהרשימה",
    word: "מילה", def: "ההגדרה בשיעור", add: "הוספת מילה", save: "שמירה", saving: "שומר...", saved: "נשמר",
    regen: "יצירה מחדש", regenAsk: "ליצור את כל המילים מחדש? השינויים שלך בנושא הזה יימחקו.", yes: "כן, ליצור מחדש", no: "ביטול",
    preview: "פתיחה במקרן", loading: "טוען...", remove: "הסרה", error: "שגיאה",
  },
  en: {
    title: "Curriculum catalog",
    sub: "Every unit in every subject: its key words and each word's in-lesson definition. Edit, save, and the projector shows it at once.",
    catalog: "Curriculum", level: "Level", subject: "Subject", all: "All subjects", search: "Search units",
    units: "units", ready: "ready", edited: "edited", none: "Pick a unit from the list",
    word: "Word", def: "Definition in the lesson", add: "Add a word", save: "Save", saving: "Saving...", saved: "Saved",
    regen: "Generate again", regenAsk: "Generate all words again? Your edits to this unit will be lost.", yes: "Yes, generate again", no: "Cancel",
    preview: "Open on the projector", loading: "Loading...", remove: "Remove", error: "Error",
  },
};

export default function AdminCurriculumClient() {
  const { secret, lang } = useAdminContext();
  const t = STR[lang];
  const he = lang === "he";
  const [catId, setCatId] = useState<CatalogId>("il-he");
  const cat = useMemo(() => adminCatalog(catId, he), [catId, he]);
  const [level, setLevel] = useState("elementary");
  const [subject, setSubject] = useState("");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState("");
  const [ready, setReady] = useState<Set<string>>(new Set());
  const [edited, setEdited] = useState<Set<string>>(new Set());

  const api = useCallback((qs: string) => `/api/admin/curriculum?secret=${encodeURIComponent(secret)}${qs}`, [secret]);

  useEffect(() => {
    let alive = true;
    fetch(api("&ready=1"))
      .then((r) => {
        if (r.status === 401) { localStorage.removeItem(SECRET_KEY); window.location.reload(); }
        return r.ok ? r.json() : null;
      })
      .then((j: { ids: string[]; edited: string[] } | null) => {
        if (!alive || !j) return;
        setReady(new Set(j.ids));
        setEdited(new Set(j.edited));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [api]);

  const subjectName = useCallback((key: string) => cat.subjects.find((x) => x.key === key)?.name ?? key, [cat]);
  const subjects = useMemo(
    () => cat.subjects.filter((s) => cat.topics.some((x) => x.s === s.key && x.l === level)),
    [cat, level],
  );
  const topics = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return cat.topics.filter((x) =>
      needle
        ? x.t.toLowerCase().includes(needle) || cat.sub(x).includes(needle) || subjectName(x.s).toLowerCase().includes(needle)
        : x.l === level && (!subject || x.s === subject),
    ).slice(0, 400);
  }, [cat, level, subject, q, subjectName]);
  const open = openId ? cat.topics.find((x) => x.id === openId) : undefined;

  const sel: React.CSSProperties = { padding: "8px 10px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "inherit", background: "#fff" };

  return (
    <div dir={he ? "rtl" : "ltr"}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
        <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4, maxWidth: 720 }}>{t.sub}</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <label style={{ fontSize: 13, color: "#6B7280" }}>{t.catalog}</label>
        <select style={sel} value={catId} onChange={(e) => {
          const id = e.target.value as CatalogId;
          setCatId(id); setLevel(catalogView(id).defaultLevel); setSubject(""); setOpenId("");
        }}>
          {CATALOG_IDS.map((id) => <option key={id} value={id}>{CAT_NAME[id][he ? "he" : "en"]}</option>)}
        </select>
        <label style={{ fontSize: 13, color: "#6B7280" }}>{t.level}</label>
        <select style={sel} value={level} onChange={(e) => { setLevel(e.target.value); setSubject(""); }}>
          {cat.levels.map((l) => <option key={l.key} value={l.key}>{l.name}</option>)}
        </select>
        <label style={{ fontSize: 13, color: "#6B7280" }}>{t.subject}</label>
        <select style={{ ...sel, minWidth: 200 }} value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="">{t.all}</option>
          {subjects.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
        </select>
        <input style={{ ...sel, flex: "1 1 200px", minWidth: 0 }} type="search" placeholder={t.search} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 380px) minmax(0, 1fr)", gap: 16, alignItems: "start" }}>
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, maxHeight: "75vh", overflowY: "auto" }}>
          <div style={{ padding: "10px 14px", fontSize: 12.5, color: "#6B7280", borderBottom: "1px solid #F3F4F6" }}>
            {topics.length} {t.units}
          </div>
          {topics.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setOpenId(x.id)}
              style={{
                display: "block", width: "100%", textAlign: he ? "right" : "left", padding: "10px 14px", border: "none",
                borderBottom: "1px solid #F3F4F6", background: x.id === openId ? "#ECFEFF" : "transparent", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }} dir="auto">{x.t}</div>
              {cat.sub(x) && <div style={{ fontSize: 12.5, color: "#374151", marginTop: 1 }}>{cat.sub(x)}</div>}
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span>{subjectName(x.s)}</span>
                {x.g && <span>{cat.gradeLabel(x.g)}</span>}
                {edited.has(x.id) ? (
                  <span style={{ color: "#7C3AED", fontWeight: 700 }}>{t.edited}</span>
                ) : ready.has(x.id) ? (
                  <span style={{ color: "#0E8A8A", fontWeight: 700 }}>{t.ready}</span>
                ) : null}
              </div>
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 18, minWidth: 0 }}>
          {open ? (
            <UnitEditor
              key={open.id}
              topic={open}
              head={[subjectName(open.s), open.g ? cat.gradeLabel(open.g) : ""].filter(Boolean).join(" · ")}
              sub={cat.sub(open)}
              api={api}
              t={t}
              he={he}
              onSaved={(id) => { setEdited((s) => new Set(s).add(id)); setReady((s) => new Set(s).add(id)); }}
              onRegen={(id) => { setEdited((s) => { const n = new Set(s); n.delete(id); return n; }); }}
            />
          ) : (
            <p style={{ color: "#6B7280", margin: 0 }}>{t.none}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function UnitEditor({ topic, head, sub, api, t, he, onSaved, onRegen }: {
  topic: ViewTopic;
  head: string;
  sub: string;
  api: (qs: string) => string;
  t: (typeof STR)["he"];
  he: boolean;
  onSaved: (id: string) => void;
  onRegen: (id: string) => void;
}) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [setLang, setSetLang] = useState("he");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState(false);

  const apply = (j: { set: { words: string[]; lang: string }; defs: Record<string, string> }) => {
    setRows(j.set.words.map((w) => ({ w, d: j.defs[w] ?? "" })));
    setSetLang(j.set.lang || "he");
  };

  useEffect(() => {
    let alive = true;
    fetch(api(`&id=${encodeURIComponent(topic.id)}`))
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => { if (alive) apply(j); })
      .catch((e) => alive && setStatus(`${t.error} ${e}`));
    return () => { alive = false; };
  }, [api, topic.id, t.error]);

  const post = async (body: object, okMsg: string) => {
    setBusy(true);
    setStatus("");
    try {
      const r = await fetch(api(""), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: topic.id, ...body }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.status);
      apply(j);
      setStatus(okMsg);
      return true;
    } catch (e) {
      setStatus(`${t.error}: ${e instanceof Error ? e.message : e}`);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const set = (i: number, k: keyof Row, v: string) => setRows((r) => r && r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const move = (i: number, dir: -1 | 1) => setRows((r) => {
    if (!r || i + dir < 0 || i + dir >= r.length) return r;
    const n = [...r]; [n[i], n[i + dir]] = [n[i + dir], n[i]]; return n;
  });
  const wordDir = setLang === "he" || setLang === "ar" || setLang === "fa" ? "rtl" : "ltr";
  const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14.5, fontFamily: "inherit" };
  const btn = (bg: string, fg = "#fff"): React.CSSProperties => ({ padding: "9px 16px", borderRadius: 9, border: bg === "#fff" ? "1px solid #D1D5DB" : "none", background: bg, color: fg, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" });
  const base = he ? "/he" : "";

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 12.5, color: "#0E8A8A", fontWeight: 700 }}>{head}</div>
          <h2 style={{ margin: "2px 0 0", fontSize: 20, color: "#111827" }} dir="auto">{topic.t}</h2>
          {sub && <div style={{ fontSize: 13.5, color: "#374151", marginTop: 2 }}>{sub}</div>}
        </div>
        {rows && rows[0]?.w && (
          <a href={`${base}/word/${encodeURIComponent(rows[0].w)}?present=1&set=${encodeURIComponent(topic.id)}`} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: "#0E7490", fontWeight: 600 }}>
            {t.preview}
          </a>
        )}
      </div>

      {!rows ? (
        <p style={{ color: "#6B7280" }}>{status || t.loading}</p>
      ) : (
        <>
          <div style={{ display: "grid", gap: 10 }}>
            {rows.map((r, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "28px minmax(110px, 200px) minmax(0, 1fr) auto", gap: 8, alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 4 }}>
                  <button type="button" aria-label="up" onClick={() => move(i, -1)} style={{ border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 11, lineHeight: 1 }}>▲</button>
                  <button type="button" aria-label="down" onClick={() => move(i, 1)} style={{ border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 11, lineHeight: 1 }}>▼</button>
                </div>
                <input style={{ ...input, fontWeight: 700 }} dir={wordDir} value={r.w} placeholder={t.word} onChange={(e) => set(i, "w", e.target.value)} />
                <textarea style={{ ...input, minHeight: 58, resize: "vertical", lineHeight: 1.5 }} dir={wordDir} value={r.d} placeholder={t.def} onChange={(e) => set(i, "d", e.target.value)} />
                <button type="button" title={t.remove} aria-label={t.remove} onClick={() => setRows((x) => x && x.filter((_, j) => j !== i))} style={{ border: "none", background: "none", cursor: "pointer", color: "#DC2626", fontSize: 18, paddingTop: 6 }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 16 }}>
            <button type="button" style={btn("#fff", "#111827")} onClick={() => setRows((r) => [...(r ?? []), { w: "", d: "" }])}>+ {t.add}</button>
            <button type="button" style={btn("#0E8A8A")} disabled={busy} onClick={async () => { if (await post({ rows: rows.filter((x) => x.w.trim()) }, t.saved)) onSaved(topic.id); }}>
              {busy ? t.saving : t.save}
            </button>
            <span style={{ flex: 1 }} />
            {asking ? (
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 13.5, color: "#92400E" }}>
                {t.regenAsk}
                <button type="button" style={btn("#B45309")} disabled={busy} onClick={async () => { setAsking(false); if (await post({ action: "regen" }, t.saved)) onRegen(topic.id); }}>{t.yes}</button>
                <button type="button" style={btn("#fff", "#111827")} onClick={() => setAsking(false)}>{t.no}</button>
              </span>
            ) : (
              <button type="button" style={btn("#fff", "#92400E")} onClick={() => setAsking(true)}>{t.regen}</button>
            )}
          </div>
          {status && <p style={{ marginTop: 10, fontSize: 13.5, color: status.startsWith(t.error) ? "#DC2626" : "#0E8A8A" }}>{status}</p>}
        </>
      )}
    </>
  );
}

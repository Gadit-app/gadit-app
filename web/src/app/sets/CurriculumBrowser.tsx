"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHref } from "@/lib/href";
import { getWordSet, registerWordSet, type WordSet } from "@/lib/word-sets";
import {
  CUR_LEVELS, CUR_CATEGORIES, CUR_SUBJECTS, CUR_TOPICS, curSubject, topicsOf, readySetsOf,
  subjectIcon, categoryIcon, gradeLabel, curLevelHe, type CurSubject, type CurTopic,
} from "@/lib/curriculum-catalog";

/**
 * /sets in Hebrew: the full Israeli curriculum (Gadi 2026-10-03), גן to
 * תיכון, every subject with its own soft-3D icon. Level tabs, then subjects
 * grouped by field, then the subject's units; opening a unit loads (or
 * generates once) its key words, and "הצגה בכיתה" walks the class through
 * them on the projector. The hand-made sets show first under their subject.
 * State lives in the URL (?l=&s=&t=) so the back button and shared links work.
 */

// One soft accent per field, so the sections read as separate worlds.
const CAT_COLOR: Record<string, string> = {
  language: "#2F6FB0", math: "#0E8A7E", sciences: "#1F8FA8", "foreign-languages": "#6D55B8",
  "jewish-studies": "#B0573F", "history-civics": "#9A6B1F", "geography-environment": "#3B8A4E",
  "social-sciences": "#A0487A", computers: "#3E5BB0", "arts-media": "#C0522F",
  "body-health": "#C2414B", engineering: "#4A6378", vocational: "#7A6A3A", "early-childhood": "#C27A1F",
};
const DEFAULT_LEVEL = "elementary";
const LEVEL_STORE = "gadit-sets-level";

function norm(s: string) {
  return s.replace(/[֑-ׇ"״׳']/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}
/** Query matches at the start of a word, or after one prefix letter
 *  (ו ה ב ל כ), so "שברים" finds "בשברים" but not "משברים". */
function matches(text: string, q: string) {
  if (!q) return true;
  const t = norm(text);
  if (q.includes(" ")) return t.includes(q);
  return t.split(/[\s,:.()-]+/).some((w) => w.startsWith(q) || (/^[והבלכ]/.test(w) && w.slice(1).startsWith(q)));
}

export default function CurriculumBrowser() {
  const href = useHref();
  const router = useRouter();
  const sp = useSearchParams();
  const subjectKey = sp?.get("s") ?? "";
  const subject = subjectKey ? curSubject(subjectKey) : undefined;
  // useSearchParams keeps this page client-rendered, so reading the
  // remembered level in the initializer is safe.
  const [level, setLevelState] = useState(() => {
    const fromUrl = sp?.get("l");
    if (fromUrl) return fromUrl;
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem(LEVEL_STORE) : null;
      if (saved && CUR_LEVELS.some((l) => l.key === saved)) return saved;
    } catch { /* storage blocked */ }
    return DEFAULT_LEVEL;
  });
  const [query, setQuery] = useState("");

  const go = (params: Record<string, string | undefined>, push = true) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    const url = href(`/sets${q.toString() ? `?${q}` : ""}`);
    if (push) router.push(url, { scroll: true });
    else router.replace(url, { scroll: false });
  };
  const setLevel = (l: string) => {
    setLevelState(l);
    try { localStorage.setItem(LEVEL_STORE, l); } catch { /* storage blocked */ }
    if (subject) go({ s: subject.key, l }, false);
  };

  return (
    <div className="wordbook cb" dir="rtl">
      <style>{CSS}</style>
      <header className="cb-top">
        <Link href={href("/")} className="cb-wordmark" dir="ltr" aria-label="Gadit home">
          Gad<span>it</span>
        </Link>
      </header>
      <main className="cb-main">
        {subject ? (
          <SubjectView
            subject={subject}
            level={level}
            setLevel={setLevel}
            openTopic={sp?.get("t") ?? ""}
            onBack={() => go({ l: level })}
            onTopic={(t) => go({ s: subject.key, l: level, t: t || undefined }, false)}
          />
        ) : (
          <HomeView
            level={level}
            setLevel={setLevel}
            query={query}
            setQuery={setQuery}
            openSubject={(s, l) => go({ s, l: l ?? level })}
            openTopic={(t) => go({ s: t.s, l: t.l, t: t.id })}
          />
        )}
      </main>
    </div>
  );
}

/* ── Home: level tabs, fields, subject cards, search ─────────────────── */

function HomeView(props: {
  level: string;
  setLevel: (l: string) => void;
  query: string;
  setQuery: (q: string) => void;
  openSubject: (s: string, l?: string) => void;
  openTopic: (t: CurTopic) => void;
}) {
  const { level, setLevel, query, setQuery, openSubject, openTopic } = props;
  const counts = useMemo(() => {
    const c: Record<string, Record<string, number>> = {};
    for (const t of CUR_TOPICS) ((c[t.l] ||= {})[t.s] = (c[t.l]?.[t.s] ?? 0) + 1);
    return c;
  }, []);
  const q = norm(query);
  const sections = CUR_CATEGORIES.map((cat) => ({
    cat,
    subjects: CUR_SUBJECTS.filter((s) => s.cat === cat.key && counts[level]?.[s.key]),
  })).filter((x) => x.subjects.length > 0);

  return (
    <>
      <h1 className="cb-h1">קבוצות מילים לכל מקצועות הלימוד</h1>
      <p className="cb-sub">
        בוחרים שכבה ומקצוע, פותחים נושא ומקרינים לכיתה.
        <br />
        לכל מילה יש הגדרה, תמונה, דוגמאות, חידון ומשחק.
      </p>

      <div className="cb-search">
        <SearchIcon />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש מקצוע או נושא, למשל שברים"
          aria-label="חיפוש מקצוע או נושא"
        />
      </div>

      {q ? (
        <SearchResults q={q} openSubject={openSubject} openTopic={openTopic} />
      ) : (
        <>
          <LevelTabs level={level} setLevel={setLevel} counts={(l) => Object.keys(counts[l] ?? {}).length} unit="מקצועות" />
          <nav className="cb-cats" aria-label="תחומים">
            {sections.map(({ cat }) => (
              <a key={cat.key} href={`#cat-${cat.key}`} className="cb-cat-chip" style={{ ["--c" as string]: CAT_COLOR[cat.key] }}>
                <img src={categoryIcon(cat.key)} alt="" width={22} height={22} loading="lazy" />
                {cat.he}
              </a>
            ))}
          </nav>
          <div className="cb-board">
            {sections.map(({ cat, subjects }) => (
              <section key={cat.key} id={`cat-${cat.key}`} className="cb-panel" style={{ ["--c" as string]: CAT_COLOR[cat.key] }}>
                <h2 className="cb-h2">
                  <img src={categoryIcon(cat.key)} alt="" width={32} height={32} loading="lazy" />
                  {cat.he}
                </h2>
                <div className="cb-tiles">
                  {subjects.map((s) => (
                    <SubjectCard key={s.key} s={s} n={counts[level][s.key]} onClick={() => openSubject(s.key)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function LevelTabs({ level, setLevel, counts, unit, only }: {
  level: string; setLevel: (l: string) => void; counts: (l: string) => number; unit: string; only?: string[];
}) {
  return (
    <div className="cb-levels" role="tablist" aria-label="שכבת גיל" style={{ gridTemplateColumns: `repeat(${only?.length ?? CUR_LEVELS.length}, minmax(0, 1fr))` }}>
      {CUR_LEVELS.filter((l) => !only || only.includes(l.key)).map((l) => (
        <button
          key={l.key}
          type="button"
          role="tab"
          aria-selected={l.key === level}
          className={"cb-level" + (l.key === level ? " on" : "")}
          onClick={() => setLevel(l.key)}
        >
          <b className="full">{l.he}</b>
          <b className="short">{l.key === "middle" ? "חטיבה" : l.he}</b>
          <span>{counts(l.key)} {unit}</span>
        </button>
      ))}
    </div>
  );
}

function SubjectCard({ s, n, onClick, big }: { s: CurSubject; n: number; onClick: () => void; big?: boolean }) {
  return (
    <button type="button" className={"cb-card" + (big ? " big" : "")} onClick={onClick} style={big ? { ["--c" as string]: CAT_COLOR[s.cat] } : undefined}>
      <span className="cb-card-img">
        <img src={subjectIcon(s.key)} alt="" width={72} height={72} loading="lazy" />
      </span>
      <span className="cb-card-name">{s.he}</span>
      <span className="cb-card-meta">
        {n} נושאים
        {s.dati ? <span className="cb-dati">ממ״ד</span> : null}
      </span>
    </button>
  );
}

function SearchResults({ q, openSubject, openTopic }: {
  q: string; openSubject: (s: string, l?: string) => void; openTopic: (t: CurTopic) => void;
}) {
  const subjects = CUR_SUBJECTS.filter((s) => matches(s.he, q)).slice(0, 12);
  const topics = CUR_TOPICS.filter((t) => matches(t.t, q)).slice(0, 60);
  if (!subjects.length && !topics.length) {
    return <p className="cb-empty">לא מצאנו מקצוע או נושא כזה. כדאי לנסות מילה אחרת או קצרה יותר.</p>;
  }
  return (
    <>
      {subjects.length > 0 && (
        <section className="cb-section">
          <h2 className="cb-h2 plain">מקצועות</h2>
          <div className="cb-grid">
            {subjects.map((s) => (
              <SubjectCard
                big
                key={s.key}
                s={s}
                n={topicsOf(s.key).length}
                onClick={() => openSubject(s.key, topicsOf(s.key)[0]?.l)}
              />
            ))}
          </div>
        </section>
      )}
      {topics.length > 0 && (
        <section className="cb-section">
          <h2 className="cb-h2 plain">נושאים</h2>
          <ul className="cb-results">
            {topics.map((t) => {
              const s = curSubject(t.s)!;
              return (
                <li key={t.id}>
                  <button type="button" className="cb-result" onClick={() => openTopic(t)} style={{ ["--c" as string]: CAT_COLOR[s.cat] }}>
                    <img src={subjectIcon(s.key)} alt="" width={40} height={40} loading="lazy" />
                    <span className="cb-result-text">
                      <span className="cb-result-title">{t.t}</span>
                      <span className="cb-result-meta">{s.he} · {curLevelHe(t.l)}{t.g ? ` · ${gradeLabel(t.g)}` : ""}</span>
                    </span>
                    <Chevron />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}

/* ── Subject: its levels, ready sets, and units ──────────────────────── */

function SubjectView({ subject, level, setLevel, openTopic, onBack, onTopic }: {
  subject: CurSubject; level: string; setLevel: (l: string) => void; openTopic: string;
  onBack: () => void; onTopic: (id: string) => void;
}) {
  const levels = CUR_LEVELS.map((l) => l.key).filter((l) => topicsOf(subject.key, l).length > 0);
  const lv = levels.includes(level) ? level : levels[0];
  const topics = topicsOf(subject.key, lv);
  const ready = readySetsOf(subject.key, lv);
  const cat = CUR_CATEGORIES.find((c) => c.key === subject.cat);
  const [filter, setFilter] = useState("");
  const f = norm(filter);
  const shown = f ? topics.filter((t) => matches(t.t, f)) : topics;

  return (
    <div style={{ ["--c" as string]: CAT_COLOR[subject.cat] }}>
      <button type="button" className="cb-back" onClick={onBack}>
        <Chevron flip /> כל המקצועות
      </button>
      <div className="cb-hero">
        <span className="cb-hero-img">
          <img src={subjectIcon(subject.key)} alt="" width={120} height={120} />
        </span>
        <div>
          {cat && cat.he !== subject.he && <div className="cb-hero-cat">{cat.he}</div>}
          <h1 className="cb-h1 tight">{subject.he}</h1>
          <div className="cb-hero-meta">
            {topicsOf(subject.key).length} נושאים
            {subject.dati ? <span className="cb-dati">חינוך ממלכתי דתי</span> : null}
          </div>
        </div>
      </div>

      {levels.length > 1 && (
        <LevelTabs level={lv} setLevel={setLevel} counts={(l) => topicsOf(subject.key, l).length} unit="נושאים" only={levels} />
      )}

      {ready.length > 0 && (
        <section className="cb-section">
          <h2 className="cb-h2 plain">קבוצות מוכנות</h2>
          <ul className="cb-topics">
            {ready.map((set) => (
              <ReadyRow key={set.id} set={set} open={openTopic === set.id} onToggle={() => onTopic(openTopic === set.id ? "" : set.id)} />
            ))}
          </ul>
        </section>
      )}

      <section className="cb-section">
        <h2 className="cb-h2 plain">
          נושאי הלימוד ב{curLevelHe(lv)}
          <span className="cb-h2-count">{topics.length}</span>
        </h2>
        {topics.length > 12 && (
          <div className="cb-search small">
            <SearchIcon />
            <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="חיפוש נושא" aria-label="חיפוש נושא" />
          </div>
        )}
        <ul className="cb-topics">
          {shown.map((t) => (
            <TopicRow key={t.id} t={t} open={openTopic === t.id} onToggle={() => onTopic(openTopic === t.id ? "" : t.id)} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function ReadyRow({ set, open, onToggle }: { set: WordSet; open: boolean; onToggle: () => void }) {
  const href = useHref();
  return (
    <li className={"cb-topic" + (open ? " open" : "")}>
      <button type="button" className="cb-topic-head" onClick={onToggle} aria-expanded={open}>
        <span className="cb-topic-title">{set.title}</span>
        {set.grade && <span className="cb-grade">{set.grade.startsWith("כית") ? set.grade : gradeLabel(set.grade)}</span>}
        <Chevron down={open} />
      </button>
      {open && (
        <div className="cb-topic-body">
          <WordChips set={set} />
          <PresentButton href={href(`/word/${encodeURIComponent(set.words[0])}?present=1&set=${encodeURIComponent(set.id)}`)} n={set.words.length} />
        </div>
      )}
    </li>
  );
}

function TopicRow({ t, open, onToggle }: { t: CurTopic; open: boolean; onToggle: () => void }) {
  const href = useHref();
  const [set, setSet] = useState<WordSet | undefined>(() => getWordSet(t.id));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open || set) return;
    let alive = true;
    fetch(`/api/curriculum-set?id=${encodeURIComponent(t.id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: { set: WordSet; defs: Record<string, string> }) => {
        if (!alive) return;
        registerWordSet(d.set, d.defs);
        setSet(d.set);
      })
      .catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, [open, set, t.id]);

  return (
    <li className={"cb-topic" + (open ? " open" : "")}>
      <button type="button" className="cb-topic-head" onClick={onToggle} aria-expanded={open}>
        <span className="cb-topic-title">{t.t}</span>
        {t.g && <span className="cb-grade">{gradeLabel(t.g)}</span>}
        <Chevron down={open} />
      </button>
      {open && (
        <div className="cb-topic-body">
          {set ? (
            <>
              <WordChips set={set} />
              <PresentButton href={href(`/word/${encodeURIComponent(set.words[0])}?present=1&set=${encodeURIComponent(set.id)}`)} n={set.words.length} />
            </>
          ) : failed ? (
            <p className="cb-note">לא הצלחנו להכין את מילות המפתח כרגע. אפשר לנסות שוב בעוד רגע.</p>
          ) : (
            <p className="cb-note"><span className="cb-spin" aria-hidden /> מכינים את מילות המפתח של הנושא...</p>
          )}
        </div>
      )}
    </li>
  );
}

function WordChips({ set }: { set: WordSet }) {
  const href = useHref();
  return (
    <div className="cb-chips" dir={set.lang === "he" || set.lang === "ar" || set.lang === "fa" ? "rtl" : "ltr"}>
      {set.words.map((w) => (
        <Link key={w} href={href(`/word/${encodeURIComponent(w)}?present=1&set=${encodeURIComponent(set.id)}`)} className="cb-chip">
          {w}
        </Link>
      ))}
    </div>
  );
}

function PresentButton({ href, n }: { href: string; n: number }) {
  return (
    <Link href={href} className="cb-present">
      <ScreenIcon /> הצגה בכיתה <span>· {n} מילים</span>
    </Link>
  );
}

/* ── Icons (inline, no icon font) ─────────────────────────────────────── */

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function Chevron({ flip, down }: { flip?: boolean; down?: boolean }) {
  // RTL: "forward" points left.
  const rot = down ? -90 : flip ? 180 : 0;
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: `rotate(${rot}deg)`, transition: "transform .2s", flexShrink: 0 }}>
      <path d="m15 18-6-6 6-6" />
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

const CSS = `
.cb{min-height:100dvh;background:var(--paper);color:var(--ink)}
.cb-top{padding:18px 24px;border-bottom:1px solid var(--rule);background:var(--surface)}
.cb-wordmark{font-weight:800;font-size:20px;color:var(--ink);text-decoration:none;letter-spacing:-.02em}
.cb-wordmark span{font-style:italic;color:#0EA5A5}
.cb-main{max-width:1120px;margin:0 auto;padding:28px 20px 72px}
.cb-h1{font-size:clamp(24px,3.4vw,32px);font-weight:800;margin:0 0 8px;letter-spacing:-.01em;text-wrap:balance}
.cb-h1.tight{margin:2px 0 4px}
.cb-sub{color:var(--ink-muted);font-size:16px;line-height:1.6;margin:0 0 22px}
.cb-search{display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--rule);border-radius:14px;padding:0 14px;margin-bottom:22px;color:var(--ink-faint);box-shadow:0 1px 2px rgba(11,18,32,.04)}
.cb-search:focus-within{border-color:#0EA5A5;box-shadow:0 0 0 3px rgba(14,165,165,.15)}
.cb-search input{flex:1;min-width:0;border:none;outline:none;background:transparent;font:inherit;font-size:16px;color:var(--ink);padding:14px 0}
.cb-search.small{max-width:420px;margin-bottom:14px}
.cb-search.small input{padding:10px 0;font-size:15px}
.cb-levels{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;background:var(--paper-deep);padding:5px;border-radius:16px;margin-bottom:18px}
.cb-level{border:none;background:transparent;border-radius:12px;padding:10px 6px;font:inherit;font-weight:700;font-size:16px;color:var(--ink-soft);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;transition:background .15s,color .15s}
.cb-level b{font-weight:700}
.cb-level .short{display:none}
.cb-level span{font-size:12.5px;font-weight:600;color:var(--ink-faint)}
.cb-level:hover{color:var(--ink)}
.cb-level.on{background:var(--surface);color:var(--ink);box-shadow:0 1px 3px rgba(11,18,32,.1)}
.cb-level.on span{color:#0E8A8A}
.cb-cats{display:flex;flex-wrap:wrap;gap:8px;padding:2px 0 10px;margin-bottom:12px}
.cb-cat-chip{flex-shrink:0;display:inline-flex;align-items:center;gap:7px;padding:6px 12px 6px 10px;border-radius:999px;background:var(--surface);border:1px solid var(--rule);color:var(--ink-soft);font-weight:600;font-size:14px;text-decoration:none;white-space:nowrap}
.cb-cat-chip:hover{border-color:var(--c);color:var(--c)}
.cb-cat-chip img{border-radius:6px}
.cb-section{margin-bottom:34px;scroll-margin-top:16px}
.cb-h2{display:flex;align-items:center;gap:10px;font-size:20px;font-weight:800;margin:0 0 14px;color:var(--c,var(--ink))}
.cb-h2.plain{color:var(--ink);font-size:18px}
.cb-h2 img{border-radius:9px}
.cb-h2-count{font-size:13px;font-weight:700;color:var(--ink-faint);background:var(--surface);border:1px solid var(--rule);border-radius:999px;padding:1px 9px}
.cb-board{columns:3 320px;column-gap:14px}
.cb-panel{break-inside:avoid;margin-bottom:14px;background:var(--surface);border:1px solid var(--rule);border-radius:20px;padding:14px 12px 8px;scroll-margin-top:16px}
.cb-panel .cb-h2{font-size:17px;margin:0 2px 6px}
.cb-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:2px}
.cb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:12px}
.cb-card{display:flex;flex-direction:column;align-items:center;text-align:center;gap:5px;padding:10px 4px 9px;background:transparent;border:1px solid transparent;border-radius:16px;cursor:pointer;font:inherit;color:var(--ink);transition:background .15s}
.cb-card:hover{background:color-mix(in srgb,var(--c) 7%,#fff)}
.cb-card:hover .cb-card-img{transform:translateY(-2px)}
.cb-card.big{background:var(--surface);border-color:var(--rule);padding:14px 8px 12px}
.cb-card-img{width:72px;height:72px;border-radius:18px;overflow:hidden;background:color-mix(in srgb,var(--c) 8%,#FBFAF7);transition:transform .15s}
.cb-card-img img{width:100%;height:100%;object-fit:cover;display:block}
.cb-card-name{font-weight:700;font-size:14.5px;line-height:1.3;text-wrap:balance}
.cb-card-meta{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:4px 6px;white-space:nowrap;font-size:12.5px;font-weight:600;color:var(--ink-faint)}
.cb-dati{font-size:11.5px;font-weight:700;color:#8A4B2F;background:#FBEFE7;border-radius:6px;padding:1px 6px}
.cb-empty{color:var(--ink-muted);font-size:16px;padding:20px 0}
.cb-results{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.cb-result{width:100%;display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--surface);border:1px solid var(--rule);border-radius:14px;cursor:pointer;font:inherit;color:var(--ink);text-align:start}
.cb-result:hover{border-color:var(--c)}
.cb-result img{border-radius:10px;flex-shrink:0}
.cb-result-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.cb-result-title{font-weight:700;font-size:15.5px}
.cb-result-meta{font-size:13px;color:var(--ink-muted)}
.cb-back{display:inline-flex;align-items:center;gap:4px;border:none;background:none;font:inherit;font-weight:700;font-size:15px;color:var(--ink-muted);cursor:pointer;padding:4px 0;margin-bottom:12px}
.cb-back:hover{color:var(--ink)}
.cb-hero{display:flex;align-items:center;gap:18px;margin-bottom:22px}
.cb-hero-img{width:120px;height:120px;flex-shrink:0;border-radius:28px;overflow:hidden;background:color-mix(in srgb,var(--c) 8%,#FBFAF7);box-shadow:0 6px 18px rgba(11,18,32,.08)}
.cb-hero-img img{width:100%;height:100%;object-fit:cover;display:block}
.cb-hero-cat{font-size:14px;font-weight:700;color:var(--c)}
.cb-hero-meta{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--ink-muted);font-weight:600}
.cb-ready{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
.cb-ready-card{display:flex;flex-direction:column;gap:12px;background:var(--surface);border:1px solid var(--rule);border-top:3px solid var(--c);border-radius:16px;padding:14px}
.cb-ready-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.cb-ready-title{font-weight:700;font-size:16px}
.cb-grade{flex-shrink:0;font-size:12.5px;font-weight:700;color:var(--ink-faint);background:var(--paper);border-radius:7px;padding:2px 8px}
.cb-topics{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.cb-topic{background:var(--surface);border:1px solid var(--rule);border-radius:14px;overflow:hidden;transition:border-color .15s}
.cb-topic.open{border-color:color-mix(in srgb,var(--c) 45%,var(--rule))}
.cb-topic-head{width:100%;display:flex;align-items:center;gap:10px;padding:13px 14px;border:none;background:none;font:inherit;color:var(--ink);cursor:pointer;text-align:start}
.cb-topic-head:hover .cb-topic-title{color:var(--c)}
.cb-topic-title{flex:1;min-width:0;font-weight:700;font-size:15.5px;line-height:1.4}
.cb-topic-body{padding:0 14px 14px;display:flex;flex-direction:column;gap:12px}
.cb-chips{display:flex;flex-wrap:wrap;gap:6px}
.cb-chip{font-size:14px;font-weight:600;color:var(--c);background:color-mix(in srgb,var(--c) 7%,#fff);border:1px solid color-mix(in srgb,var(--c) 18%,#fff);border-radius:9px;padding:5px 10px;text-decoration:none}
.cb-chip:hover{background:color-mix(in srgb,var(--c) 13%,#fff)}
.cb-present{align-self:flex-start;display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;background:var(--c);color:#fff;font-weight:800;font-size:15px;text-decoration:none}
.cb-present span{font-size:12.5px;font-weight:600;opacity:.85}
.cb-present:hover{filter:brightness(1.07)}
.cb-ready-card .cb-present{margin-top:auto;align-self:stretch;justify-content:center}
.cb-note{display:flex;align-items:center;gap:10px;margin:0;color:var(--ink-muted);font-size:14.5px}
.cb-spin{width:16px;height:16px;border-radius:50%;border:2px solid color-mix(in srgb,var(--c) 25%,#fff);border-top-color:var(--c);animation:cbspin .8s linear infinite}
@keyframes cbspin{to{transform:rotate(360deg)}}
@media (max-width:560px){
  .cb-main{padding:20px 16px 60px}
  .cb-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .cb-tiles{grid-template-columns:repeat(3,minmax(0,1fr))}
  .cb-card-img{width:64px;height:64px}
  .cb-cats{flex-wrap:nowrap;overflow-x:auto;margin-inline:-16px;padding-inline:16px}
  .cb-level{font-size:14px;padding:9px 2px}
  .cb-level .full{display:none}
  .cb-level .short{display:inline}
  .cb-level span{font-size:11px}
  .cb-hero-img{width:88px;height:88px;border-radius:22px}
}
@media (prefers-reduced-motion:reduce){.cb-card,.cb-spin{transition:none;animation:none}}
`;

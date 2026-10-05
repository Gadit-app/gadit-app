"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHref } from "@/lib/href";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { SCHOOL_TYPES, CURRICULA, type Curriculum } from "@/lib/school-levels";
import { WORD_SETS, getWordSet, registerWordSet, type WordSet } from "@/lib/word-sets";
import {
  CATALOG_IDS, catalogView, readySetsOf, subjectIcon, categoryIcon,
  type CatalogId, type CatalogView, type ViewSubject, type ViewTopic,
} from "@/lib/curriculum-catalog";

/**
 * /sets: the national curriculum of the school (Gadi 2026-10-03/04). The
 * Israeli catalog (גן to תיכון, Hebrew, RTL) or South Africa's CAPS (Grades
 * 4 to 9, English, LTR) or Israel's Arab state education (Arabic, RTL),
 * every subject with its own soft-3D icon. Level
 * tabs, subjects grouped by field, then the subject's units; opening a unit
 * loads its key words, and "Present to class" walks the class through them
 * on the projector. A school picks its curriculum and type once
 * (/api/school/levels). State lives in the URL (?l=&s=&t=).
 */

// One soft accent per field, so the sections read as separate worlds.
const CAT_COLOR: Record<string, string> = {
  language: "#2F6FB0", math: "#0E8A7E", sciences: "#1F8FA8", "foreign-languages": "#6D55B8",
  "jewish-studies": "#B0573F", "history-civics": "#9A6B1F", "geography-environment": "#3B8A4E",
  "social-sciences": "#A0487A", computers: "#3E5BB0", "arts-media": "#C0522F",
  "body-health": "#C2414B", engineering: "#4A6378", vocational: "#7A6A3A", "early-childhood": "#C27A1F",
  religion: "#8A5A2B",
};

const STR = {
  he: {
    title: "קבוצות מילים לכל מקצועות הלימוד",
    sub1: "בוחרים שכבה ומקצוע, פותחים נושא ומקרינים לכיתה.",
    sub2: "לכל מילה יש הגדרה, תמונה, דוגמאות, חידון ומשחק.",
    search: "חיפוש מקצוע או נושא, למשל שברים",
    searchAria: "חיפוש מקצוע או נושא",
    levelsAria: "שכבת גיל",
    subjectsUnit: "מקצועות",
    topicsUnit: "נושאים",
    fields: "תחומים",
    all: "הכל",
    empty: "לא מצאנו מקצוע או נושא כזה. כדאי לנסות מילה אחרת או קצרה יותר.",
    subjectsH: "מקצועות",
    topicsH: "נושאים",
    back: "כל המקצועות",
    readyH: "קבוצות מוכנות",
    topicsIn: (lv: string) => `נושאי הלימוד ב${lv}`,
    topicSearch: "חיפוש נושא",
    dati: "ממ״ד",
    datiLong: "חינוך ממלכתי דתי",
    present: "הצגה בכיתה",
    words: "מילים",
    loading: "מכינים את מילות המפתח של הנושא...",
    fail: "לא הצלחנו להכין את מילות המפתח כרגע. אפשר לנסות שוב בעוד רגע.",
    term: (n: number) => `תקופה ${n}`,
    curH: "איזו תוכנית לימודים?",
    typeH: "מה סוג בית הספר?",
    pick1: "קבוצות המילים נפתחות לפי תוכנית הלימודים והשכבות של בית הספר.",
    pick2: "בוחרים פעם אחת, ולשינוי אפשר לפנות אלינו.",
    notOwnerH: "קבוצות המילים עוד לא נפתחו",
    notOwnerP: "קודם צריך לבחור את סוג בית הספר בחשבון של בית הספר, ואז ייפתחו הקבוצות של השכבות המתאימות.",
    err: "משהו השתבש. אפשר לנסות שוב.",
    catalog: "תוכנית לימודים",
  },
  en: {
    title: "Word sets for every subject",
    sub1: "Pick a phase and a subject, open a topic, and project it to the class.",
    sub2: "Every word comes with a definition, a picture, examples, a quiz and a game.",
    search: "Search a subject or topic, e.g. fractions",
    searchAria: "Search a subject or topic",
    levelsAria: "Phase",
    subjectsUnit: "subjects",
    topicsUnit: "topics",
    fields: "Learning areas",
    all: "All",
    empty: "No subject or topic found. Try another or a shorter word.",
    subjectsH: "Subjects",
    topicsH: "Topics",
    back: "All subjects",
    readyH: "Ready-made sets",
    topicsIn: (lv: string) => `Topics: ${lv}`,
    topicSearch: "Search topics",
    dati: "",
    datiLong: "",
    present: "Present to class",
    words: "words",
    loading: "Preparing the topic's key words...",
    fail: "We couldn't load the key words right now. Please try again in a moment.",
    term: (n: number) => `Term ${n}`,
    curH: "Which curriculum does your school follow?",
    typeH: "What kind of school is it?",
    pick1: "The word sets open by your school's curriculum and grades.",
    pick2: "You choose once; to change it later, contact us.",
    notOwnerH: "The word sets aren't open yet",
    notOwnerP: "The school account first chooses the school type, and then the sets for its grades open.",
    err: "Something went wrong. Please try again.",
    catalog: "Curriculum",
  },
  // Arabic UI for the Arab state education catalog: verbal nouns and
  // impersonal wording, so it fits a man and a woman alike.
  ar: {
    title: "مجموعات كلمات لكلّ المواضيع الدراسيّة",
    sub1: "اختيار المرحلة والموضوع، فتح الوحدة وعرضها على الصفّ.",
    sub2: "لكلّ كلمة تعريف وصورة وأمثلة واختبار ولعبة.",
    search: "بحث عن موضوع أو وحدة، مثلًا الكسور",
    searchAria: "بحث عن موضوع أو وحدة",
    levelsAria: "المرحلة",
    subjectsUnit: "مواضيع",
    topicsUnit: "وحدات",
    fields: "المجالات",
    all: "الكلّ",
    empty: "لم نجد موضوعًا أو وحدة كهذه. يمكن تجربة كلمة أخرى أو أقصر.",
    subjectsH: "المواضيع",
    topicsH: "الوحدات",
    back: "كلّ المواضيع",
    readyH: "مجموعات جاهزة",
    topicsIn: (lv: string) => `وحدات التعلّم في المرحلة ${lv}`,
    topicSearch: "بحث عن وحدة",
    dati: "",
    datiLong: "",
    present: "عرض على الصفّ",
    words: "كلمات",
    loading: "نحضّر الكلمات المفتاحيّة للوحدة...",
    fail: "لم نتمكّن من تحضير الكلمات المفتاحيّة الآن. يمكن المحاولة مرّة أخرى بعد قليل.",
    term: (n: number) => `الفصل ${n}`,
    curH: "أيّ منهاج تعليميّ؟",
    typeH: "ما نوع المدرسة؟",
    pick1: "تُفتح مجموعات الكلمات حسب المنهاج والصفوف في المدرسة.",
    pick2: "الاختيار مرّة واحدة، وللتغيير يمكن التواصل معنا.",
    notOwnerH: "مجموعات الكلمات لم تُفتح بعد",
    notOwnerP: "يجب أوّلًا اختيار نوع المدرسة في حساب المدرسة، وبعدها تُفتح مجموعات الصفوف المناسبة.",
    err: "حدث خطأ ما. يمكن المحاولة مرّة أخرى.",
    catalog: "المنهاج",
  },
};
type Ui = keyof typeof STR;
type Kind = "subjects" | "topics" | "words";
// Arabic counted nouns: 1 and 2 have their own forms, 3 to 10 take the
// plural, 11 to 99 the singular accusative, round hundreds the singular.
const AR_COUNT: Record<Kind, [string, string, string, string, string]> = {
  subjects: ["موضوع واحد", "موضوعان", "مواضيع", "موضوعًا", "موضوع"],
  topics: ["وحدة واحدة", "وحدتان", "وحدات", "وحدةً", "وحدة"],
  words: ["كلمة واحدة", "كلمتان", "كلمات", "كلمةً", "كلمة"],
};
function count(T: T, n: number, kind: Kind): string {
  if (T !== STR.ar) return `${n} ${kind === "words" ? T.words : kind === "subjects" ? T.subjectsUnit : T.topicsUnit}`;
  const f = AR_COUNT[kind];
  if (n === 1) return f[0];
  if (n === 2) return f[1];
  const r = n % 100;
  return `${n} ${r >= 3 && r <= 10 ? f[2] : r >= 11 ? f[3] : f[4]}`;
}
const uiOf = (lang: string): Ui => (lang === "he" ? "he" : lang === "ar" ? "ar" : "en");
type T = (typeof STR)["en"];

type Ctx = { view: CatalogView; T: T; allowed: string[] };
const CatCtx = createContext<Ctx | null>(null);
const useCat = () => useContext(CatCtx)!;
const inAllowed = (allowed: string[], t: ViewTopic) => allowed.includes(t.l);

function norm(s: string) {
  return s.replace(/[֑-ׇً-ٰٟـ"״׳']/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/\s+/g, " ").trim().toLowerCase();
}
/** Query matches at the start of a word, or after one Hebrew prefix letter
 *  (ו ה ב ל כ), so "שברים" finds "בשברים" but not "משברים". */
function matches(text: string, q: string) {
  if (!q) return true;
  const t = norm(text);
  if (q.includes(" ")) return t.includes(q);
  const qa = q.replace(/^ال/, "");
  return t.split(/[\s,:.()،-]+/).some((w) => w.startsWith(q) || (/^[והבלכ]/.test(w) && w.slice(1).startsWith(q))
    // Arabic: also after و ف ب ل ك and the article ال.
    || w.replace(/^[وفبلك]?(ال|ل)?/, "").startsWith(qa));
}
const topicsOf = (view: CatalogView, subject: string, level?: string) =>
  view.topics.filter((t) => t.s === subject && (!level || t.l === level));

export default function CurriculumBrowser({ legacy }: { legacy?: ReactNode }) {
  const href = useHref();
  const router = useRouter();
  const sp = useSearchParams();
  const { lang } = useLang();
  const { user } = useAuth();
  const [school, setSchool] = useState<{ levels: string[]; curriculum: Curriculum | ""; owner: boolean } | null>(null);
  useEffect(() => {
    if (!user) return;
    let alive = true;
    user.getIdToken()
      .then((tk) => fetch("/api/school/levels", { headers: { Authorization: `Bearer ${tk}` } }))
      .then((r) => (r.ok ? r.json() : { levels: [], curriculum: "", owner: false }))
      .then((j: { levels: string[]; curriculum: Curriculum | ""; owner: boolean }) => {
        if (alive) setSchool({ levels: j.levels ?? [], curriculum: j.curriculum ?? "", owner: !!j.owner });
      })
      .catch(() => { if (alive) setSchool({ levels: [], curriculum: "", owner: false }); });
    return () => { alive = false; };
  }, [user]);

  // "all" schools (Gadi's own) can switch catalogs; everyone else sees theirs.
  const [viewPick, setViewPick] = useState<CatalogId>(() => {
    const c = sp?.get("c") as CatalogId | null;
    return c && CATALOG_IDS.includes(c) ? c : lang === "he" ? "il-he" : lang === "ar" ? "il-ar" : "za-caps";
  });
  const sc = school?.curriculum;
  const viewId: CatalogId = sc === "il-he" || sc === "il-ar" || sc === "za-caps" ? sc : viewPick;
  const view = catalogView(viewId);
  const T = STR[view.ui];
  const storeKey = `gadit-sets-level-${viewId}`;
  const [levelState, setLevelState] = useState<string>(() => {
    const fromUrl = sp?.get("l");
    if (fromUrl) return fromUrl;
    try {
      return (typeof window !== "undefined" ? localStorage.getItem(storeKey) : null) || "";
    } catch { return ""; }
  });
  const allowed = view.levels.map((l) => l.key).filter((k) => school?.levels.includes(k));
  const lvl = allowed.includes(levelState) ? levelState : allowed.includes(view.defaultLevel) ? view.defaultLevel : allowed[0] ?? view.defaultLevel;
  const subjectKey = sp?.get("s") ?? "";
  const subject = subjectKey ? view.subjects.find((s) => s.key === subjectKey) : undefined;

  const go = (params: Record<string, string | undefined>, push = true) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    // A school with every catalog keeps the one it is looking at in the URL,
    // so coming back from the projector lands on the same catalog.
    if (school?.curriculum === "all" && !q.has("c")) q.set("c", viewId);
    const url = href(`/sets${q.toString() ? `?${q}` : ""}`);
    if (push) router.push(url, { scroll: true });
    else router.replace(url, { scroll: false });
  };
  const setLevel = (l: string) => {
    setLevelState(l);
    try { localStorage.setItem(storeKey, l); } catch { /* storage blocked */ }
    if (subject) go({ s: subject.key, l }, false);
  };

  if (school?.curriculum === "legacy" && legacy) return <>{legacy}</>;
  const pickUi = school && !allowed.length ? STR[uiOf(lang)] : T;
  const dir = school && !allowed.length ? (uiOf(lang) === "en" ? "ltr" : "rtl") : view.dir;

  return (
    <div className="wordbook cb" dir={dir}>
      <style>{CSS}</style>
      <header className="cb-top">
        <Link href={href("/")} className="cb-wordmark" dir="ltr" aria-label="Gadit home">
          Gad<span>it</span>
        </Link>
        {school?.curriculum === "all" && (
          <div className="cb-switch" role="group" aria-label={T.catalog}>
            {CATALOG_IDS.map((id) => (
              <button key={id} type="button" className={id === viewId ? "on" : ""} onClick={() => { setViewPick(id); go({ c: id }, false); }}>
                {CURRICULA.find((c) => c.key === id)?.[view.ui] ?? id}
              </button>
            ))}
          </div>
        )}
      </header>
      <main className="cb-main">
        <CatCtx.Provider value={{ view, T, allowed }}>
          {!school ? null : !allowed.length ? (
            <SchoolTypePicker T={pickUi} uiLang={uiOf(lang)} owner={school.owner} onSet={(levels, curriculum) => setSchool({ ...school, levels, curriculum })} />
          ) : subject ? (
            <SubjectView
              subject={subject}
              level={lvl}
              setLevel={setLevel}
              openTopic={sp?.get("t") ?? ""}
              onBack={() => go({ l: lvl })}
              onTopic={(t) => go({ s: subject.key, l: lvl, t: t || undefined }, false)}
            />
          ) : (
            <HomeView
              level={lvl}
              setLevel={setLevel}
              openSubject={(s, l) => go({ s, l: l ?? lvl })}
              openTopic={(t) => go({ s: t.s, l: t.l, t: t.id })}
            />
          )}
        </CatCtx.Provider>
      </main>
    </div>
  );
}

/* ── Home: level tabs, fields, subject cards, search ─────────────────── */

function HomeView(props: {
  level: string;
  setLevel: (l: string) => void;
  openSubject: (s: string, l?: string) => void;
  openTopic: (t: ViewTopic) => void;
}) {
  const { level, setLevel, openSubject, openTopic } = props;
  const { view, T, allowed } = useCat();
  const [query, setQuery] = useState("");
  const counts = useMemo(() => {
    const c: Record<string, Record<string, number>> = {};
    for (const t of view.topics) ((c[t.l] ||= {})[t.s] = (c[t.l]?.[t.s] ?? 0) + 1);
    return c;
  }, [view]);
  const q = norm(query);
  const sections = view.categories.map((cat) => ({
    cat,
    subjects: view.subjects.filter((s) => s.cat === cat.key && counts[level]?.[s.key]),
  })).filter((x) => x.subjects.length > 0);
  // Field filter (Gadi 2026-10-04): "All" shows every field, a field chip
  // shows only that field.
  const [catState, setCat] = useState("all");
  const cat = sections.some((x) => x.cat.key === catState) ? catState : "all";
  const shownSections = cat === "all" ? sections : sections.filter((x) => x.cat.key === cat);

  return (
    <>
      <h1 className="cb-h1">{T.title}</h1>
      <p className="cb-sub">
        {T.sub1}
        <br />
        {T.sub2}
      </p>

      <div className="cb-search">
        <SearchIcon />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={T.search} aria-label={T.searchAria} />
      </div>

      {q ? (
        <SearchResults q={q} openSubject={openSubject} openTopic={openTopic} />
      ) : (
        <>
          {allowed.length > 1 && (
            <LevelTabs level={level} setLevel={setLevel} counts={(l) => Object.keys(counts[l] ?? {}).length} kind="subjects" only={allowed} />
          )}
          <nav className="cb-cats" aria-label={T.fields}>
            <button type="button" className={"cb-cat-chip" + (cat === "all" ? " on" : "")} aria-pressed={cat === "all"} onClick={() => setCat("all")} style={{ ["--c" as string]: "#0E8A8A" }}>
              <AllIcon />
              {T.all}
            </button>
            {sections.map(({ cat: c }) => (
              <button type="button" key={c.key} className={"cb-cat-chip" + (cat === c.key ? " on" : "")} aria-pressed={cat === c.key} onClick={() => setCat(c.key)} style={{ ["--c" as string]: CAT_COLOR[c.key] }}>
                <img src={categoryIcon(c.key)} alt="" width={22} height={22} loading="lazy" />
                {c.name}
              </button>
            ))}
          </nav>
          <div className={"cb-board" + (cat === "all" ? "" : " solo")}>
            {shownSections.map(({ cat, subjects }) => (
              <section key={cat.key} id={`cat-${cat.key}`} className="cb-panel" style={{ ["--c" as string]: CAT_COLOR[cat.key] }}>
                <h2 className="cb-h2">
                  <img src={categoryIcon(cat.key)} alt="" width={32} height={32} loading="lazy" />
                  {cat.name}
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

function LevelTabs({ level, setLevel, counts, kind, only }: {
  level: string; setLevel: (l: string) => void; counts: (l: string) => number; kind: Kind; only?: string[];
}) {
  const { view, T } = useCat();
  const tabs = view.levels.filter((l) => !only || only.includes(l.key));
  const idx = Math.max(0, tabs.findIndex((l) => l.key === level));
  const n = tabs.length;
  const sign = view.dir === "rtl" ? -1 : 1;
  // A white pill slides under the chosen tab; the others keep a thin frame
  // so they read as clickable (Gadi 2026-10-04).
  return (
    <div className="cb-levels" role="tablist" aria-label={T.levelsAria} style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      <span
        className="cb-level-pill"
        aria-hidden
        style={{ width: `calc((100% - 10px - ${(n - 1) * 6}px) / ${n})`, transform: `translateX(calc(${sign * idx} * (100% + 6px)))` }}
      />
      {tabs.map((l) => (
        <button key={l.key} type="button" role="tab" aria-selected={l.key === level} className={"cb-level" + (l.key === level ? " on" : "")} onClick={() => setLevel(l.key)}>
          <b className="full">{l.name}</b>
          <b className="short">{l.short}</b>
          <span>{count(T, counts(l.key), kind)}</span>
        </button>
      ))}
    </div>
  );
}

function SubjectCard({ s, n, onClick, big }: { s: ViewSubject; n: number; onClick: () => void; big?: boolean }) {
  const { T } = useCat();
  return (
    <button type="button" className={"cb-card" + (big ? " big" : "")} onClick={onClick} style={big ? { ["--c" as string]: CAT_COLOR[s.cat] } : undefined}>
      <span className="cb-card-img">
        <img src={subjectIcon(s.key)} alt="" width={72} height={72} loading="lazy" />
      </span>
      <span className="cb-card-name">{s.name}</span>
      <span className="cb-card-meta">
        {count(T, n, "topics")}
        {s.dati && T.dati ? <span className="cb-dati">{T.dati}</span> : null}
      </span>
    </button>
  );
}

function topicMeta(view: CatalogView, T: T, t: ViewTopic) {
  return [t.g ? view.gradeLabel(t.g) : "", t.term ? T.term(t.term) : ""].filter(Boolean).join(" · ");
}

function SearchResults({ q, openSubject, openTopic }: {
  q: string; openSubject: (s: string, l?: string) => void; openTopic: (t: ViewTopic) => void;
}) {
  const { view, T, allowed } = useCat();
  const mine = (key: string) => topicsOf(view, key).filter((t) => inAllowed(allowed, t));
  const subjects = view.subjects.filter((s) => matches(s.name, q) && mine(s.key).length > 0).slice(0, 12);
  const topics = view.topics.filter((t) => inAllowed(allowed, t) && matches(t.t, q)).slice(0, 60);
  if (!subjects.length && !topics.length) return <p className="cb-empty">{T.empty}</p>;
  return (
    <>
      {subjects.length > 0 && (
        <section className="cb-section">
          <h2 className="cb-h2 plain">{T.subjectsH}</h2>
          <div className="cb-grid">
            {subjects.map((s) => (
              <SubjectCard big key={s.key} s={s} n={mine(s.key).length} onClick={() => openSubject(s.key, mine(s.key)[0]?.l)} />
            ))}
          </div>
        </section>
      )}
      {topics.length > 0 && (
        <section className="cb-section">
          <h2 className="cb-h2 plain">{T.topicsH}</h2>
          <ul className="cb-results">
            {topics.map((t) => {
              const s = view.subjects.find((x) => x.key === t.s)!;
              const lv = view.levels.find((l) => l.key === t.l)?.name ?? "";
              return (
                <li key={t.id}>
                  <button type="button" className="cb-result" onClick={() => openTopic(t)} style={{ ["--c" as string]: CAT_COLOR[s.cat] }}>
                    <img src={subjectIcon(s.key)} alt="" width={40} height={40} loading="lazy" />
                    <span className="cb-result-text">
                      <span className="cb-result-title">{t.t}</span>
                      <span className="cb-result-meta">{[s.name, lv, topicMeta(view, T, t)].filter(Boolean).join(" · ")}</span>
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
  subject: ViewSubject; level: string; setLevel: (l: string) => void; openTopic: string;
  onBack: () => void; onTopic: (id: string) => void;
}) {
  const { view, T, allowed } = useCat();
  const levels = view.levels.map((l) => l.key).filter((l) => allowed.includes(l) && topicsOf(view, subject.key, l).length > 0);
  const lv = levels.includes(level) ? level : levels[0];
  const topics = topicsOf(view, subject.key, lv);
  // The hand-made English sets stay available to English (CAPS) schools as
  // ready-made sets under English (Gadi 2026-10-05, Greenwarth's move to CAPS).
  const ready = view.id === "il-he"
    ? readySetsOf(subject.key, lv)
    : view.id === "za-caps" && subject.key === "english-home-language" && lv === "intermediate"
      ? WORD_SETS.filter((w) => w.lang === "en")
      : [];
  const cat = view.categories.find((c) => c.key === subject.cat);
  const [filter, setFilter] = useState("");
  const f = norm(filter);
  const shown = f ? topics.filter((t) => matches(t.t, f)) : topics;
  const lvName = view.levels.find((l) => l.key === lv)?.name ?? "";

  return (
    <div style={{ ["--c" as string]: CAT_COLOR[subject.cat] }}>
      <button type="button" className="cb-back" onClick={onBack}>
        <Chevron flip /> {T.back}
      </button>
      <div className="cb-hero">
        <span className="cb-hero-img">
          <img src={subjectIcon(subject.key)} alt="" width={120} height={120} />
        </span>
        <div>
          {cat && cat.name !== subject.name && <div className="cb-hero-cat">{cat.name}</div>}
          <h1 className="cb-h1 tight">{subject.name}</h1>
          <div className="cb-hero-meta">
            {count(T, topicsOf(view, subject.key).filter((t) => inAllowed(allowed, t)).length, "topics")}
            {subject.dati && T.datiLong ? <span className="cb-dati">{T.datiLong}</span> : null}
          </div>
        </div>
      </div>

      {levels.length > 1 && (
        <LevelTabs level={lv} setLevel={setLevel} counts={(l) => topicsOf(view, subject.key, l).length} kind="topics" only={levels} />
      )}

      {ready.length > 0 && (
        <section className="cb-section">
          <h2 className="cb-h2 plain">{T.readyH}</h2>
          <ul className="cb-topics">
            {ready.map((set) => (
              <ReadyRow key={set.id} set={set} open={openTopic === set.id} onToggle={() => onTopic(openTopic === set.id ? "" : set.id)} />
            ))}
          </ul>
        </section>
      )}

      <section className="cb-section">
        <h2 className="cb-h2 plain">
          {T.topicsIn(lvName)}
          <span className="cb-h2-count">{topics.length}</span>
        </h2>
        {topics.length > 12 && (
          <div className="cb-search small">
            <SearchIcon />
            <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={T.topicSearch} aria-label={T.topicSearch} />
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

/** One-time choice of the curriculum and school type; later changes only via Gadi. */
function SchoolTypePicker({ T, uiLang, owner, onSet }: {
  T: T; uiLang: Ui; owner: boolean; onSet: (levels: string[], curriculum: Curriculum) => void;
}) {
  const { user } = useAuth();
  const [cur, setCur] = useState<string>(uiLang === "ar" ? "il-ar" : uiLang === "en" ? "za-caps" : "");
  // A type's name in the picker's language (South African types stay English).
  const typeName = (x: (typeof SCHOOL_TYPES)[number]) =>
    uiLang === "he" && x.curriculum !== "za-caps" ? x.he : uiLang === "ar" && x.ar ? x.ar : x.en;
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState(false);
  const pick = async (type: string) => {
    if (!user) return;
    setBusy(type);
    setErr(false);
    try {
      const tk = await user.getIdToken();
      const r = await fetch("/api/school/levels", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tk}` }, body: JSON.stringify({ type }) });
      const j = await r.json();
      if (!r.ok && !j.levels) throw new Error(j.error);
      onSet(j.levels, j.curriculum ?? cur);
    } catch {
      setErr(true);
    } finally {
      setBusy("");
    }
  };
  if (!owner) {
    return (
      <div className="cb-pick">
        <h1 className="cb-h1">{T.notOwnerH}</h1>
        <p className="cb-sub">{T.notOwnerP}</p>
      </div>
    );
  }
  return (
    <div className="cb-pick">
      <h1 className="cb-h1">{cur ? T.typeH : T.curH}</h1>
      <p className="cb-sub">
        {T.pick1}
        <br />
        {T.pick2}
      </p>
      <div className="cb-pick-grid">
        {!cur
          ? CURRICULA.map((c) => (
              <button key={c.key} type="button" className="cb-pick-btn" onClick={() => setCur(c.key)}>
                {c[uiLang]}
              </button>
            ))
          : SCHOOL_TYPES.filter((x) => x.curriculum === cur).map((x) => (
              <button key={x.key} type="button" className="cb-pick-btn" disabled={!!busy} onClick={() => pick(x.key)}>
                {busy === x.key ? <span className="cb-spin" aria-hidden /> : null}
                {typeName(x)}
              </button>
            ))}
      </div>
      {cur && (
        <button type="button" className="cb-back" style={{ marginTop: 14 }} onClick={() => setCur("")}>
          <Chevron flip /> {T.curH}
        </button>
      )}
      {err && <p className="cb-note" style={{ marginTop: 14, justifyContent: "center" }}>{T.err}</p>}
    </div>
  );
}

function ReadyRow({ set, open, onToggle }: { set: WordSet; open: boolean; onToggle: () => void }) {
  const href = useHref();
  const { view } = useCat();
  return (
    <li className={"cb-topic" + (open ? " open" : "")}>
      <button type="button" className="cb-topic-head" onClick={onToggle} aria-expanded={open}>
        <span className="cb-topic-title">{set.title}</span>
        {set.grade && view.id === "il-he" && <span className="cb-grade">{set.grade.startsWith("כית") ? set.grade : view.gradeLabel(set.grade)}</span>}
        <Chevron down={open} />
      </button>
      {open && (
        <div className="cb-topic-body">
          <WordChips set={set} />
          <PresentButton href={href(`/word/${encodeURIComponent(set.words[0])}?present=1&set=${encodeURIComponent(set.id)}`)} n={set.words.length} setId={set.id} />
        </div>
      )}
    </li>
  );
}

function TopicRow({ t, open, onToggle }: { t: ViewTopic; open: boolean; onToggle: () => void }) {
  const href = useHref();
  const { user } = useAuth();
  const { view, T } = useCat();
  const [set, setSet] = useState<WordSet | undefined>(() => getWordSet(t.id));
  const [failed, setFailed] = useState(false);
  // Back from the projector the unit is already open: bring it into view.
  const li = useRef<HTMLLIElement>(null);
  const openAtMount = useRef(open);
  useEffect(() => {
    if (openAtMount.current) li.current?.scrollIntoView({ block: "center" });
  }, []);

  useEffect(() => {
    if (!open || set || !user) return;
    let alive = true;
    user.getIdToken()
      .then((tk) => fetch(`/api/curriculum-set?id=${encodeURIComponent(t.id)}`, { headers: { Authorization: `Bearer ${tk}` } }))
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: { set: WordSet; defs: Record<string, string> }) => {
        if (!alive) return;
        registerWordSet(d.set, d.defs);
        setSet(d.set);
      })
      .catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, [open, set, t.id, user]);

  const meta = topicMeta(view, T, t);
  return (
    <li ref={li} className={"cb-topic" + (open ? " open" : "")}>
      <button type="button" className="cb-topic-head" onClick={onToggle} aria-expanded={open}>
        <span className="cb-topic-title">{t.t}</span>
        {meta && <span className="cb-grade">{meta}</span>}
        <Chevron down={open} />
      </button>
      {open && (
        <div className="cb-topic-body">
          {set ? (
            <>
              <WordChips set={set} />
              <PresentButton href={href(`/word/${encodeURIComponent(set.words[0])}?present=1&set=${encodeURIComponent(set.id)}`)} n={set.words.length} setId={set.id} />
            </>
          ) : failed ? (
            <p className="cb-note">{T.fail}</p>
          ) : (
            <p className="cb-note"><span className="cb-spin" aria-hidden /> {T.loading}</p>
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
        <Link key={w} href={href(`/word/${encodeURIComponent(w)}?present=1&set=${encodeURIComponent(set.id)}`)} className="cb-chip" onClick={() => rememberReturn(set.id)}>
          {w}
        </Link>
      ))}
    </div>
  );
}

/** Where the projector's close button returns: this page, with the unit open
 *  (Gadi 2026-10-04). Read by the word page in present mode. */
export const SETS_RETURN_KEY = "gadit-sets-return";
function rememberReturn(setId: string) {
  try {
    sessionStorage.setItem(SETS_RETURN_KEY, JSON.stringify({ setId, url: window.location.pathname + window.location.search }));
  } catch { /* storage blocked */ }
}

function PresentButton({ href, n, setId }: { href: string; n: number; setId: string }) {
  const { T } = useCat();
  return (
    <Link href={href} className="cb-present" onClick={() => rememberReturn(setId)}>
      <ScreenIcon /> {T.present} <span>· {count(T, n, "words")}</span>
    </Link>
  );
}

/* ── Icons (inline, no icon font) ─────────────────────────────────────── */

function AllIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.6" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function Chevron({ flip, down }: { flip?: boolean; down?: boolean }) {
  // "Forward" points left in RTL and right in LTR; flip = back.
  const ltr = useContext(CatCtx)?.view.dir === "ltr";
  const rot = down ? -90 : (!!flip !== ltr) ? 180 : 0;
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
.cb-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.cb-switch{display:inline-flex;gap:4px;background:var(--paper-deep);padding:4px;border-radius:999px}
.cb-switch button{border:none;background:transparent;font:inherit;font-size:13.5px;font-weight:700;color:var(--ink-soft);padding:6px 12px;border-radius:999px;cursor:pointer}
.cb-switch button.on{background:var(--surface);color:var(--ink);box-shadow:0 1px 3px rgba(11,18,32,.1)}
.cb-main{max-width:1120px;margin:0 auto;padding:28px 20px 72px}
.cb-h1{font-size:clamp(24px,3.4vw,32px);font-weight:800;margin:0 0 8px;letter-spacing:-.01em;text-wrap:balance}
.cb-h1.tight{margin:2px 0 4px}
.cb-sub{color:var(--ink-muted);font-size:16px;line-height:1.6;margin:0 0 22px}
.cb-search{display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--rule);border-radius:14px;padding:0 14px;margin-bottom:22px;color:var(--ink-faint);box-shadow:0 1px 2px rgba(11,18,32,.04)}
.cb-search:focus-within{border-color:#0EA5A5;box-shadow:0 0 0 3px rgba(14,165,165,.15)}
.cb-search input{flex:1;min-width:0;border:none;outline:none;background:transparent;font:inherit;font-size:16px;color:var(--ink);padding:14px 0}
.cb-search.small{max-width:420px;margin-bottom:14px}
.cb-search.small input{padding:10px 0;font-size:15px}
.cb-levels{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;background:var(--paper-deep);padding:5px;border-radius:16px;margin-bottom:18px}
.cb-level-pill{position:absolute;top:5px;bottom:5px;inset-inline-start:5px;background:var(--surface);border-radius:12px;box-shadow:0 2px 6px rgba(11,18,32,.12);transition:transform .32s cubic-bezier(.3,.9,.3,1);pointer-events:none}
.cb-level{position:relative;z-index:1;border:1px solid #CBD8D2;background:rgba(255,255,255,.35);border-radius:12px;padding:10px 6px;font:inherit;font-weight:700;font-size:16px;color:var(--ink-soft);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;transition:background .15s,color .15s,border-color .15s}
.cb-level b{font-weight:700}
.cb-level .short{display:none}
.cb-level span{font-size:12.5px;font-weight:600;color:var(--ink-faint)}
.cb-level:hover{color:var(--ink);border-color:#0EA5A5;background:rgba(255,255,255,.6)}
.cb-level.on{background:transparent;border-color:transparent;color:var(--ink)}
.cb-level.on span{color:#0E8A8A}
.cb-cats{display:flex;flex-wrap:wrap;gap:8px;padding:2px 0 10px;margin-bottom:12px}
.cb-cat-chip{flex-shrink:0;display:inline-flex;align-items:center;gap:7px;padding:6px 12px 6px 10px;border-radius:999px;background:var(--surface);border:1px solid var(--rule);color:var(--ink-soft);font:inherit;font-weight:600;font-size:14px;text-decoration:none;white-space:nowrap;cursor:pointer;transition:background .15s,border-color .15s,color .15s}
.cb-cat-chip:hover{border-color:var(--c);color:var(--c)}
.cb-cat-chip.on{background:color-mix(in srgb,var(--c) 10%,#fff);border-color:var(--c);color:var(--c);font-weight:700}
.cb-board.solo{columns:auto}
.cb-board.solo .cb-tiles{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}
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
.cb-pick{max-width:640px;margin:24px auto 0;text-align:center}
.cb-pick .cb-sub{margin-inline:auto}
.cb-pick-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-top:8px;--c:#0E8A8A}
.cb-pick-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:16px 14px;border-radius:14px;border:1px solid var(--rule);background:var(--surface);font:inherit;font-weight:700;font-size:16px;color:var(--ink);cursor:pointer;transition:border-color .15s,background .15s}
.cb-pick-btn:hover{border-color:#0EA5A5;background:color-mix(in srgb,#0EA5A5 6%,#fff)}
.cb-pick-btn:disabled{opacity:.6;cursor:default}
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
@media (prefers-reduced-motion:reduce){.cb-level-pill,.cb-card,.cb-spin{transition:none;animation:none}}
`;

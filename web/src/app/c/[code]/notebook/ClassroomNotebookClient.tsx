"use client";

/**
 * Classroom Notebook — aggregated view of every word the class has
 * looked up. Anonymous (no auth), reaches the API via the classroom
 * code. Lets the teacher (or any kid) see "what did we search today"
 * and filter by student name when the roster is set up.
 *
 * Built 2026-06-29 alongside the topbar redesign so that pressing
 * "Class Notebook" in the topbar lands on a useful page rather than a
 * 404. Mirrors the look-and-feel of the regular /notebook page so a
 * kid switching between contexts feels at home.
 */

import { useEffect, useMemo, useState } from "react";
import { skinStyleVars, readStashedSkin } from "@/lib/school-skin";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";

type SearchEntry = {
  word: string;
  language: string;
  studentName: string;
  createdAt: string;
};

const COPY: Record<string, {
  title: string;
  emptyTitle: string;
  emptyBody: string;
  filterAll: string;
  filterLabel: string;
  errorTitle: string;
  errorBody: string;
  backToClassroom: string;
}> = {
  he: {
    title: "מחברת הכיתה",
    emptyTitle: "עוד אין חיפושים",
    emptyBody: "כשתלמיד יחפש מילה, היא תופיע כאן.",
    filterAll: "כל התלמידים",
    filterLabel: "סנן לפי תלמיד",
    errorTitle: "אופס, משהו השתבש",
    errorBody: "נסו לרענן את הדף.",
    backToClassroom: "← חזרה לכיתה",
  },
  en: {
    title: "Class Notebook",
    emptyTitle: "No searches yet",
    emptyBody: "When a student looks up a word it will show here.",
    filterAll: "All students",
    filterLabel: "Filter by student",
    errorTitle: "Something went wrong",
    errorBody: "Try refreshing the page.",
    backToClassroom: "← Back to classroom",
  },
  zu: {
    title: "Incwadi Yekilasi",
    emptyTitle: "Akukho kusesha okwamanje",
    emptyBody: "Uma umfundi ebheka igama, lizovela lapha.",
    filterAll: "Bonke abafundi",
    filterLabel: "Hlunga ngomfundi",
    errorTitle: "Kukhona okungahambanga kahle",
    errorBody: "Zama ukuvuselela ikhasi.",
    backToClassroom: "← Buyela ekilasini",
  },
  el: {
    title: "Τετράδιο τάξης",
    emptyTitle: "Δεν υπάρχουν αναζητήσεις ακόμη",
    emptyBody: "Όταν ένας μαθητής αναζητήσει μια λέξη, θα εμφανιστεί εδώ.",
    filterAll: "Όλοι οι μαθητές",
    filterLabel: "Φιλτράρισμα κατά μαθητή",
    errorTitle: "Κάτι πήγε στραβά",
    errorBody: "Δοκίμασε να ανανεώσεις τη σελίδα.",
    backToClassroom: "← Πίσω στην τάξη",
  },
  ar: {
    title: "دفتر الفصل",
    emptyTitle: "لا توجد عمليات بحث بعد",
    emptyBody: "عندما يبحث الطلاب عن كلمة، ستظهر هنا.",
    filterAll: "كل الطلاب",
    filterLabel: "تصفية حسب الطالب",
    errorTitle: "حدث خطأ",
    errorBody: "حاول تحديث الصفحة.",
    backToClassroom: "← العودة إلى الصف",
  },
  ru: {
    title: "Тетрадь класса",
    emptyTitle: "Пока нет поисков",
    emptyBody: "Когда ученик найдёт слово, оно появится здесь.",
    filterAll: "Все ученики",
    filterLabel: "Фильтр по ученику",
    errorTitle: "Что-то пошло не так",
    errorBody: "Попробуйте обновить страницу.",
    backToClassroom: "← Вернуться в класс",
  },
  hi: {
    title: "कक्षा की नोटबुक",
    emptyTitle: "अभी तक कोई खोज नहीं",
    emptyBody: "जब कोई छात्र शब्द खोजेगा, वह यहाँ दिखाई देगा।",
    filterAll: "सभी छात्र",
    filterLabel: "छात्र के अनुसार छानें",
    errorTitle: "कुछ गलत हो गया",
    errorBody: "पेज को रीफ्रेश करने का प्रयास करें।",
    backToClassroom: "← कक्षा में वापस",
  },
  am: {
    title: "የክፍል ማስታወሻ ደብተር",
    emptyTitle: "እስካሁን ምንም ፍለጋ የለም",
    emptyBody: "አንድ ተማሪ ቃል ሲፈልግ፣ እዚህ ይታያል።",
    filterAll: "ሁሉም ተማሪዎች",
    filterLabel: "በተማሪ ማጣራት",
    errorTitle: "የሆነ ስህተት ተፈጥሯል",
    errorBody: "ገጹን ለማደስ ሞክሩ።",
    backToClassroom: "← ወደ ክፍል ተመለሱ",
  },
};

type State =
  | { kind: "loading" }
  | { kind: "ok"; searches: SearchEntry[] }
  | { kind: "error" };

function useClassroomSkin(code: string) {
  const [skin, setSkin] = useState<string | null>(null);
  useEffect(() => { setSkin(readStashedSkin(code)); }, [code]);
  return skinStyleVars(skin);
}

export function ClassroomNotebookClient({ code }: { code: string }) {
  const { lang, dir } = useLang();
  const href = useHref();
  const c = COPY[lang] ?? COPY.en;
  const [state, setState] = useState<State>({ kind: "loading" });
  const [studentFilter, setStudentFilter] = useState<string>("");
  const skinVars = useClassroomSkin(code);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/classroom/searches?code=${encodeURIComponent(code)}`);
        if (cancelled) return;
        if (!res.ok) {
          setState({ kind: "error" });
          return;
        }
        const data = (await res.json()) as { searches: SearchEntry[] };
        setState({ kind: "ok", searches: data.searches });
      } catch {
        if (!cancelled) setState({ kind: "error" });
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  // Build the list of student names appearing in the search history,
  // for the filter dropdown. Empty strings (anonymous searches) get
  // collapsed into the "All" choice rather than shown as their own row.
  const studentOptions = useMemo(() => {
    if (state.kind !== "ok") return [] as string[];
    const set = new Set<string>();
    for (const s of state.searches) {
      if (s.studentName) set.add(s.studentName);
    }
    return Array.from(set).sort();
  }, [state]);

  const filteredSearches = useMemo(() => {
    if (state.kind !== "ok") return [] as SearchEntry[];
    if (!studentFilter) return state.searches;
    return state.searches.filter((s) => s.studentName === studentFilter);
  }, [state, studentFilter]);

  return (
    <div className="wordbook wb-school-page" dir={dir} style={skinVars}>
      <header className="wb-classroom-topbar">
        <Link href={href("/")} aria-label="Gadit" dir="ltr" className="wb-classroom-wordmark">
          Gad<span className="wb-classroom-wordmark-it">it</span>
        </Link>
        <nav className="wb-classroom-nav">
          <Link href={href(`/c/${code}`)} className="wb-classroom-nav-link">
            {c.backToClassroom}
          </Link>
        </nav>
      </header>

      <main className="wb-school-main" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <h1 style={{
          fontFamily: "var(--wb-serif)",
          fontSize: "clamp(26px, 4vw, 36px)",
          fontWeight: 700,
          color: "var(--ink)",
          margin: "0 0 24px",
        }}>
          {c.title}
        </h1>

        {state.kind === "loading" && (
          <div className="wb-classroom-notebook-skeleton" aria-hidden="true" />
        )}

        {state.kind === "error" && (
          <div className="wb-classroom-notebook-empty">
            <div className="wb-classroom-notebook-empty-title">{c.errorTitle}</div>
            <p>{c.errorBody}</p>
          </div>
        )}

        {state.kind === "ok" && state.searches.length === 0 && (
          <div className="wb-classroom-notebook-empty">
            <div className="wb-classroom-notebook-empty-title">{c.emptyTitle}</div>
            <p>{c.emptyBody}</p>
          </div>
        )}

        {state.kind === "ok" && state.searches.length > 0 && (
          <>
            {studentOptions.length > 0 && (
              <div className="wb-classroom-notebook-filter">
                <label htmlFor="student-filter">{c.filterLabel}:</label>
                <select
                  id="student-filter"
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                >
                  <option value="">{c.filterAll}</option>
                  {studentOptions.map((sn) => (
                    <option key={sn} value={sn}>{sn}</option>
                  ))}
                </select>
              </div>
            )}

            <ul className="wb-classroom-notebook-list">
              {filteredSearches.map((s, i) => (
                <li key={i} className="wb-classroom-notebook-row">
                  <Link
                    href={href(`/word/${encodeURIComponent(s.word)}?cls=${encodeURIComponent(code)}`)}
                    className="wb-classroom-notebook-word"
                    lang={s.language || undefined}
                  >
                    {s.word}
                  </Link>
                  <div className="wb-classroom-notebook-meta">
                    {s.studentName && (
                      <span className="wb-classroom-notebook-student">{s.studentName}</span>
                    )}
                    <span className="wb-classroom-notebook-time">
                      {formatRelativeTime(s.createdAt, lang)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

/** Lightweight relative-time formatter that doesn't drag in
 *  Intl.RelativeTimeFormat (which has spotty support across the older
 *  browsers a school computer might run). Returns short labels: "5m",
 *  "2h", "3d", or a calendar date for entries more than 7 days old. */
function formatRelativeTime(iso: string, lang: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) {
    return lang === "he" ? "עכשיו" : lang === "ar" ? "الآن" : lang === "ru" ? "сейчас" : lang === "hi" ? "अभी" : lang === "am" ? "አሁን" : "now";
  }
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  try {
    return new Date(iso).toLocaleDateString(lang);
  } catch {
    return new Date(iso).toLocaleDateString();
  }
}

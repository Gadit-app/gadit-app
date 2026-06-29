"use client";

/**
 * Kid-facing classroom landing.
 *
 * Resolves the code via /api/classroom/lookup. On success:
 *   - Shows the school logo + school name as the page chrome.
 *   - Shows the classroom name as the welcome line.
 *   - Renders a single search box. Submit routes to /word/<word>?cls=<CODE>
 *     so the result page knows to log this search to the classroom log.
 *
 * On invalid/expired code:
 *   - Soft error: "ask your teacher for the link again."
 *
 * Deliberately spartan: no nav, no footer, no upsell. A kid on a shared
 * classroom computer should see exactly one job-to-be-done: type a word.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";

type LookupOk = {
  schoolId: string;
  classroomId: string;
  schoolName: string;
  schoolLogoUrl: string | null;
  classroomName: string;
  students: string[];
  inSession: boolean;
  schedule: {
    startMinute: number;
    endMinute: number;
    days: number[];
    timezone: string;
  };
};
type LookupState =
  | { kind: "loading" }
  | { kind: "ok"; data: LookupOk }
  | { kind: "error" };

const COPY: Record<string, {
  welcomeTo: string;
  greetingPrefix: string;
  switchUser: string;
  pickName: string;
  classroomDefault: string;
  searchPh: string;
  searchBtn: string;
  sentencePh: string;
  errorTitle: string;
  errorBody: string;
  games: string;
  notebook: string;
}> = {
  he: {
    welcomeTo: "ברוכים הבאים",
    greetingPrefix: "שלום,",
    switchUser: "(לא אני)",
    pickName: "שלום! בחרו את השם שלכם",
    classroomDefault: "כיתה",
    searchPh: "הקלידו מילה",
    searchBtn: "חיפוש",
    sentencePh: "(אופציונלי) הקלידו את המשפט שבו מופיעה המילה כדי לקבל הגדרה מדויקת אחת",
    errorTitle: "הקוד לא תקין",
    errorBody: "בקשו מהמורה את הלינק שוב.",
    games: "משחקי מילים",
    notebook: "מחברת הכיתה",
  },
  en: {
    welcomeTo: "Welcome to",
    greetingPrefix: "Hi,",
    switchUser: "(not me)",
    pickName: "Hi! Pick your name",
    classroomDefault: "Classroom",
    searchPh: "Type a word",
    searchBtn: "Look up",
    sentencePh: "(Optional) Type the sentence where the word appears to get one precise definition",
    errorTitle: "Code not valid",
    errorBody: "Ask your teacher for the link again.",
    games: "Word Games",
    notebook: "Class Notebook",
  },
  hi: {
    welcomeTo: "स्वागत है",
    greetingPrefix: "नमस्ते,",
    switchUser: "(मैं नहीं)",
    pickName: "नमस्ते! अपना नाम चुनें",
    classroomDefault: "कक्षा",
    searchPh: "कोई शब्द लिखें",
    searchBtn: "खोजें",
    sentencePh: "(वैकल्पिक) वह वाक्य लिखें जिसमें शब्द आया है, सटीक एक परिभाषा मिलेगी",
    errorTitle: "कोड मान्य नहीं है",
    errorBody: "अपने शिक्षक से लिंक फिर से माँगें।",
    games: "शब्द खेल",
    notebook: "कक्षा की नोटबुक",
  },
};

/** Off-hours hint copy. Shown at the bottom of the kid view when the
 *  classroom code is reached outside the school's active-hours window.
 *  The search still works (basic dictionary) but image / kids'
 *  explanation / classroom game are off. The hint upsells to Family
 *  so a kid asking their parent gets pointed at the right product. */
const OFFHOURS_HINT: Record<string, { line1: string; cta: string; link: string }> = {
  he: {
    line1: "מחוץ לשעות הכיתה. מוצא מילים בלי תמונה והסבר לילדים.",
    cta: "רוצה את כל גדית בבית? המנוי המשפחתי",
    link: "/pricing",
  },
  en: {
    line1: "Outside class hours — looking words up without images and kids' explanation.",
    cta: "Want full Gadit at home? Family plan",
    link: "/pricing",
  },
  hi: {
    line1: "कक्षा के समय के बाहर — बिना तस्वीर और बच्चों की समझ के शब्द खोज रहे हैं।",
    cta: "घर पर पूरा Gadit चाहिए? Family प्लान",
    link: "/pricing",
  },
};

export function ClassroomKidClient({ code }: { code: string }) {
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const c = COPY[lang] ?? COPY.en;
  const [state, setState] = useState<LookupState>({ kind: "loading" });
  const [word, setWord] = useState("");
  const [sentence, setSentence] = useState("");
  // Persisted student identity. localStorage key is scoped to the
  // class code so the same browser used in two classrooms keeps two
  // independent identities. Anonymous kids leave this empty and the
  // search log gets stored without a studentName.
  const [studentName, setStudentName] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(`gadit-student-${code}`);
    if (saved) setStudentName(saved);
  }, [code]);

  function pickStudent(name: string) {
    setStudentName(name);
    try {
      window.localStorage.setItem(`gadit-student-${code}`, name);
    } catch {
      // private mode or storage disabled — name lives in memory only,
      // will be lost on refresh but the search bar still works.
    }
  }

  function clearStudent() {
    setStudentName("");
    try {
      window.localStorage.removeItem(`gadit-student-${code}`);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/classroom/lookup?code=${encodeURIComponent(code)}`);
        if (cancelled) return;
        if (!res.ok) {
          setState({ kind: "error" });
          return;
        }
        const data = (await res.json()) as LookupOk;
        setState({ kind: "ok", data });
      } catch {
        if (!cancelled) setState({ kind: "error" });
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = word.trim();
    if (!trimmed) return;
    if (state.kind !== "ok") return;
    const sent = sentence.trim();
    // Pass the optional context sentence through as ?sentence=… so the
    // word page picks the right meaning when the word is multi-sense.
    // Mirrors the homepage's optional-sentence input, restored after
    // Gadi (2026-06-28) noticed the kid view was missing it. Also pass
    // the picked student name as ?sn= so the log-search call from the
    // word page can tag the entry with who searched. And pass `&in=1`
    // when the classroom is currently in-session so the word page
    // unlocks image / kids' explanation / classroom game — those
    // features are gated to active classroom hours to prevent the
    // school code from becoming a free Family substitute at home.
    const sentenceParam = sent ? `&sentence=${encodeURIComponent(sent)}` : "";
    const studentParam = studentName ? `&sn=${encodeURIComponent(studentName)}` : "";
    const sessionParam = state.data.inSession ? `&in=1` : "";
    router.push(href(`/word/${encodeURIComponent(trimmed)}?cls=${encodeURIComponent(code)}${sentenceParam}${studentParam}${sessionParam}`));
  }

  if (state.kind === "loading") {
    return (
      <div className="wordbook wb-school-page" dir={dir} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        &nbsp;
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="wordbook wb-school-page" dir={dir} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <main style={{ maxWidth: 480, padding: "0 24px", textAlign: "center" }}>
          <h1 style={{
            fontFamily: "var(--wb-serif)",
            fontSize: 28,
            fontWeight: 700,
            color: "var(--ink)",
            margin: "0 0 12px",
          }}>{c.errorTitle}</h1>
          <p style={{
            fontFamily: "var(--wb-sans)",
            fontSize: 16,
            color: "var(--ink-soft)",
            margin: 0,
          }}>{c.errorBody}</p>
        </main>
      </div>
    );
  }

  const { data } = state;
  return (
    <div className="wordbook wb-school-page" dir={dir}>
      {/* Full Gadit topbar for the classroom. Gadi (2026-06-29) asked
          for the full Gadit interface here — same chrome as a Deep
          subscriber sees, including the Word Games and Notebook entry
          points. The bar uses Gadit teal (#0EA5A5), not the school
          mustard, because brand-color consistency across surfaces is
          load-bearing for Gadit's identity. Links open in the same
          tab so the back button returns home (no _blank to avoid
          orphaned tabs on a shared classroom computer). */}
      <header className="wb-classroom-topbar">
        <Link href={href("/")} aria-label="Gadit" dir="ltr" className="wb-classroom-wordmark">
          Gad<span className="wb-classroom-wordmark-it">it</span>
        </Link>
        <nav className="wb-classroom-nav">
          <Link href={href(`/c/${code}/games`)} className="wb-classroom-nav-link">
            {c.games}
          </Link>
          <Link href={href(`/c/${code}/notebook`)} className="wb-classroom-nav-link">
            {c.notebook}
          </Link>
          <ClassroomLangSwitch />
        </nav>
      </header>

      <main className="wb-school-main" style={{ paddingTop: "clamp(40px, 8vh, 80px)" }}>
        {/* School logo + name. The mustard chip falls back to a school
            crest icon when no logo is uploaded. */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <div
            className="wb-school-logo-slot"
            style={{
              width: 96,
              height: 96,
              marginBottom: 16,
              // Match the /schools dashboard fix: white background when
              // a logo is uploaded so transparent-PNG logos don't show
              // mustard bleed-through. Mustard placeholder kept for
              // the empty (no-logo-yet) state.
              ...(data.schoolLogoUrl ? {
                background: "#FFFFFF",
                border: "1px solid var(--hairline, #E5E7EB)",
              } : {}),
            }}
          >
            {data.schoolLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.schoolLogoUrl} alt="" />
            ) : (
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#0EA5A5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7l9-4 9 4-9 4-9-4z" />
                <path d="M21 10v6" />
                <path d="M5 9v5c0 2 3 4 7 4s7-2 7-4V9" />
              </svg>
            )}
          </div>
          {data.schoolName && (
            <div style={{
              fontFamily: "var(--wb-sans)",
              fontSize: 14,
              fontWeight: 600,
              color: "#0EA5A5",
              letterSpacing: "0.04em",
              marginBottom: 4,
            }}>
              {data.schoolName}
            </div>
          )}
          <h1 style={{
            fontFamily: "var(--wb-serif)",
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 700,
            color: "var(--ink)",
            margin: 0,
            textAlign: "center",
          }}>
            {studentName
              ? `${c.greetingPrefix} ${studentName}`
              : `${c.welcomeTo} ${data.classroomName || c.classroomDefault}`}
          </h1>
          {studentName && (
            <button
              type="button"
              onClick={clearStudent}
              style={{
                marginTop: 8,
                background: "transparent",
                border: "none",
                color: "var(--ink-soft, #6B7280)",
                fontFamily: "var(--wb-sans)",
                fontSize: 13,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              {c.switchUser}
            </button>
          )}
        </div>

        {/* Student picker — shows ONLY when the classroom has a roster
            AND the kid hasn't picked their identity yet (or just hit
            "not me"). Click a name → name persists in localStorage on
            this device + every search this session tags the log with
            the name so the teacher can see who searched what. */}
        {data.students.length > 0 && !studentName && (
          <div style={{ maxWidth: 560, margin: "0 auto 16px" }}>
            <p
              style={{
                fontFamily: "var(--wb-sans)",
                fontSize: 16,
                fontWeight: 600,
                color: "#0EA5A5",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              {c.pickName}
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                justifyContent: "center",
              }}
            >
              {data.students.map((sn) => (
                <button
                  key={sn}
                  type="button"
                  onClick={() => pickStudent(sn)}
                  style={{
                    padding: "10px 20px",
                    background: "rgba(14, 165, 165, 0.08)",
                    border: "1.5px solid rgba(14, 165, 165, 0.4)",
                    borderRadius: 999,
                    fontFamily: "var(--wb-sans)",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#0EA5A5",
                    cursor: "pointer",
                    transition: "background 180ms, transform 120ms",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(14, 165, 165, 0.18)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(14, 165, 165, 0.08)")}
                >
                  {sn}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* The search box. Word input + submit on one row, optional
            sentence input on a second row underneath so the kid can
            disambiguate a multi-sense word the way the homepage lets
            adults do. Search box hidden when a roster picker is open
            so the kid focuses on identifying themselves first. */}
        {(data.students.length === 0 || studentName) && (
        <form onSubmit={onSubmit} style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 560,
          margin: "0 auto",
        }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder={c.searchPh}
              autoFocus
              style={{
                flex: 1,
                padding: "14px 18px",
                border: "1px solid var(--hairline)",
                borderRadius: 14,
                background: "var(--surface)",
                fontFamily: "var(--wb-sans)",
                fontSize: 18,
                color: "var(--ink)",
                outline: "none",
              }}
            />
            <button
              type="submit"
              className="wb-school-cta"
              style={{ width: "auto", padding: "14px 24px", fontSize: 16 }}
            >
              {c.searchBtn}
            </button>
          </div>
          <textarea
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder={c.sentencePh}
            rows={2}
            style={{
              padding: "12px 16px",
              border: "1px solid var(--hairline)",
              borderRadius: 14,
              background: "var(--surface)",
              fontFamily: "var(--wb-sans)",
              fontSize: 15,
              color: "var(--ink)",
              outline: "none",
              resize: "vertical",
              minHeight: 60,
            }}
          />
        </form>
        )}

        {/* Off-hours soft hint. Render only when the classroom code is
            reached outside the school's active window. The kid keeps
            full search capability, just without image/kids' explanation
            /game; the hint pushes the parent to Family for the rich
            experience at home. */}
        {!data.inSession && (
          <div
            style={{
              maxWidth: 560,
              margin: "32px auto 0",
              padding: "14px 18px",
              background: "rgba(14, 165, 165, 0.08)",
              border: "1px solid rgba(14, 165, 165, 0.3)",
              borderRadius: 14,
              fontFamily: "var(--wb-sans)",
              fontSize: 14,
              color: "#0EA5A5",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: 6 }}>
              {(OFFHOURS_HINT[lang] ?? OFFHOURS_HINT.en).line1}
            </div>
            <Link
              href={href((OFFHOURS_HINT[lang] ?? OFFHOURS_HINT.en).link)}
              style={{
                fontWeight: 700,
                color: "#0EA5A5",
                textDecoration: "underline",
              }}
            >
              {(OFFHOURS_HINT[lang] ?? OFFHOURS_HINT.en).cta} →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

// Lang switcher for the classroom topbar. Small, kid-friendly — just
// the active language label with a popover of the four supported langs.
// Anonymous (no auth), persists via lang-context like the rest of /c.
const CLASSROOM_LANGS = [
  { code: "he", label: "עברית", flag: "il" },
  { code: "en", label: "English", flag: "gb" },
  { code: "ar", label: "العربية", flag: "sa" },
  { code: "ru", label: "Русский", flag: "ru" },
  { code: "hi", label: "हिन्दी", flag: "in" },
] as const;

function ClassroomLangSwitch() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);
  const active = CLASSROOM_LANGS.find((l) => l.code === lang) ?? CLASSROOM_LANGS[1];
  return (
    <div ref={wrapRef} className="wb-classroom-lang">
      <button
        type="button"
        className="wb-classroom-lang-chip"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
        </svg>
        <span>{active.label}</span>
      </button>
      {open && (
        <ul className="wb-classroom-lang-menu" role="listbox">
          {CLASSROOM_LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                className={l.code === lang ? "is-active" : ""}
                onClick={() => { setLang(l.code as typeof lang); setOpen(false); }}
              >
                <img
                  className="wb-classroom-lang-flag"
                  src={`https://flagcdn.com/40x30/${l.flag}.png`}
                  srcSet={`https://flagcdn.com/80x60/${l.flag}.png 2x`}
                  width="20"
                  height="15"
                  alt=""
                  loading="lazy"
                />
                <span>{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

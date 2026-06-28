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

import { useEffect, useState } from "react";
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
    const sent = sentence.trim();
    // Pass the optional context sentence through as ?sentence=… so the
    // word page picks the right meaning when the word is multi-sense.
    // Mirrors the homepage's optional-sentence input, restored after
    // Gadi (2026-06-28) noticed the kid view was missing it. Also pass
    // the picked student name as ?sn= so the log-search call from the
    // word page can tag the entry with who searched.
    const sentenceParam = sent ? `&sentence=${encodeURIComponent(sent)}` : "";
    const studentParam = studentName ? `&sn=${encodeURIComponent(studentName)}` : "";
    router.push(href(`/word/${encodeURIComponent(trimmed)}?cls=${encodeURIComponent(code)}${sentenceParam}${studentParam}`));
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
      {/* Minimal Gadit wordmark in the inline-start corner. Gadi
          (2026-06-28) flagged that the kid view had no Gadit brand
          mark at all — earlier we stripped the full Gadit topbar so
          the kid landing felt school-branded, but a tiny wordmark
          in the corner is required so users (and the eventual app-
          review reviewer) know what product they're inside. The
          mark is dimmed (#CA8A04 on cream) so it doesn't compete
          with the school branding directly below. */}
      <div
        style={{
          position: "absolute",
          top: 16,
          insetInlineStart: 20,
          zIndex: 1,
        }}
      >
        <Link
          href={href("/")}
          aria-label="Gadit"
          dir="ltr"
          style={{
            fontFamily: "var(--wb-serif), serif",
            fontWeight: 700,
            fontSize: 18,
            color: "#A16207",
            textDecoration: "none",
            letterSpacing: "-0.01em",
          }}
        >
          Gad<span style={{ color: "#0EA5A5", fontStyle: "italic" }}>it</span>
        </Link>
      </div>

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
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
              color: "#A16207",
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
                color: "#A16207",
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
                    background: "#FEF3C7",
                    border: "1.5px solid #FCD34D",
                    borderRadius: 999,
                    fontFamily: "var(--wb-sans)",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#A16207",
                    cursor: "pointer",
                    transition: "background 180ms, transform 120ms",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FCD34D")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#FEF3C7")}
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
      </main>
    </div>
  );
}

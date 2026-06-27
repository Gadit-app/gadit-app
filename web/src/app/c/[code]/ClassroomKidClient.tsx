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
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";

type LookupOk = {
  schoolId: string;
  classroomId: string;
  schoolName: string;
  schoolLogoUrl: string | null;
  classroomName: string;
};
type LookupState =
  | { kind: "loading" }
  | { kind: "ok"; data: LookupOk }
  | { kind: "error" };

const COPY: Record<string, {
  welcomeTo: string;
  classroomDefault: string;
  searchPh: string;
  searchBtn: string;
  errorTitle: string;
  errorBody: string;
}> = {
  he: {
    welcomeTo: "ברוכים הבאים",
    classroomDefault: "כיתה",
    searchPh: "הקלידו מילה",
    searchBtn: "חיפוש",
    errorTitle: "הקוד לא תקין",
    errorBody: "בקשו מהמורה את הלינק שוב.",
  },
  en: {
    welcomeTo: "Welcome to",
    classroomDefault: "Classroom",
    searchPh: "Type a word",
    searchBtn: "Look up",
    errorTitle: "Code not valid",
    errorBody: "Ask your teacher for the link again.",
  },
  hi: {
    welcomeTo: "स्वागत है",
    classroomDefault: "कक्षा",
    searchPh: "कोई शब्द लिखें",
    searchBtn: "खोजें",
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
    router.push(href(`/word/${encodeURIComponent(trimmed)}?cls=${encodeURIComponent(code)}`));
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
      <main className="wb-school-main" style={{ paddingTop: "clamp(40px, 8vh, 80px)" }}>
        {/* School logo + name. The mustard chip falls back to a school
            crest icon when no logo is uploaded. */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <div
            className="wb-school-logo-slot"
            style={{ width: 96, height: 96, marginBottom: 16 }}
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
            {c.welcomeTo} {data.classroomName || c.classroomDefault}
          </h1>
        </div>

        {/* The search box. One job. No nav, no extras. */}
        <form onSubmit={onSubmit} style={{
          display: "flex",
          gap: 10,
          maxWidth: 560,
          margin: "0 auto",
        }}>
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
        </form>
      </main>
    </div>
  );
}

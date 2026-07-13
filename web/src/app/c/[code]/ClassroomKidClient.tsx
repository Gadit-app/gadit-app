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
import { KidsModeToggle } from "@/components/KidsModeToggle";
import { useKidsMode } from "@/lib/use-kids-mode";
import VoiceInput from "@/components/VoiceInput";

// Inline SearchIcon — kept local to avoid a primitives import cycle and
// to match the homepage's identical SVG so the two surfaces look the
// same down to the pixel.
function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="m15 15 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

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
  am: {
    welcomeTo: "እንኳን ደህና መጣችሁ ወደ",
    greetingPrefix: "ሰላም፣",
    switchUser: "(እኔ አይደለሁም)",
    pickName: "ሰላም! ስማችሁን ምረጡ",
    classroomDefault: "ክፍል",
    searchPh: "ቃል ጻፉ",
    searchBtn: "ፈልጉ",
    sentencePh: "(ካስፈለገ) ቃሉ ያለበትን ዓረፍተ ነገር ጻፉ፣ አንድ ትክክለኛ ትርጉም ታገኛላችሁ",
    errorTitle: "ኮዱ ትክክል አይደለም",
    errorBody: "መምህራችሁን ሊንኩን እንደገና ጠይቁ።",
    games: "የቃላት ጨዋታዎች",
    notebook: "የክፍል ማስታወሻ ደብተር",
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
  am: {
    line1: "ከክፍል ሰዓት ውጭ ነን። ቃላት ያለ ምስል እና ያለ የልጆች ማብራሪያ እየፈለግን ነው።",
    cta: "ቤት ውስጥ ሙሉውን Gadit ትፈልጋላችሁ? የFamily እቅድ",
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
  // Kids Mode is on by default in the classroom view — kids reading on
  // a shared computer get the simpler, more visual renderings without
  // having to flip a switch. The toggle stays visible in the search
  // pill so an older student can turn it off if they want adult-level
  // definitions.
  const [, setKidsMode] = useKidsMode();
  const kidsAutoEnabledRef = useRef(false);
  useEffect(() => {
    if (kidsAutoEnabledRef.current) return;
    kidsAutoEnabledRef.current = true;
    setKidsMode(true);
  }, [setKidsMode]);

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
  // Layout mirrors the official Gadit homepage exactly. Per Gadi's
  // 2026-06-29 spec: classroom users see the same chrome the rest of
  // the product has, so the brand carries across surfaces. The only
  // differences from the public homepage:
  //   - Top nav: only "School Notebook" and "Play" (no Features /
  //     Pricing / Affiliates — those would confuse a kid in class).
  //   - Top right: lang switcher, SCHOOL tier chip, school avatar
  //     (no Share button, no login CTA — anonymous surface).
  //   - Hero: school logo + school name in place of the Gadit
  //     wordmark + tagline. The school IS the brand here.
  return (
    <div className="wordbook wb-shell-page wb-school-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href(`/c/${code}`)} className="wb-shell-wordmark" dir="ltr" aria-label="Gadit">
          Gad<span className="wb-shell-wordmark-it">it</span>
        </Link>
        <nav className="wb-shell-nav">
          <Link href={href(`/c/${code}/notebook`)} className="wb-shell-navlink">{c.notebook}</Link>
          <Link href={href(`/c/${code}/games`)} className="wb-shell-navlink">{c.games}</Link>
        </nav>
        <div className="wb-shell-actions">
          <ClassroomLangSwitch />
          <span className="wb-classroom-tier-chip">SCHOOL</span>
          {data.schoolLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.schoolLogoUrl}
              alt={data.schoolName || "School"}
              className="wb-classroom-avatar"
            />
          ) : (
            <div className="wb-classroom-avatar wb-classroom-avatar-fallback" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7l9-4 9 4-9 4-9-4z" />
                <path d="M5 9v5c0 2 3 4 7 4s7-2 7-4V9" />
              </svg>
            </div>
          )}
        </div>
      </header>

      <main className="wb-home-main">
        <div className="wb-home-center">
          {/* School hero — replaces the Gadit wordmark + tagline.
              Per spec, the school logo and name take the center stage
              here while everything around them stays Gadit chrome. */}
          <div className="wb-classroom-hero">
            <div className="wb-classroom-hero-logo">
              {data.schoolLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.schoolLogoUrl} alt="" />
              ) : (
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#0EA5A5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7l9-4 9 4-9 4-9-4z" />
                  <path d="M21 10v6" />
                  <path d="M5 9v5c0 2 3 4 7 4s7-2 7-4V9" />
                </svg>
              )}
            </div>
            {data.schoolName && (
              <div className="wb-classroom-hero-name">{data.schoolName}</div>
            )}
            <p className="wb-home-tagline">
              {studentName
                ? `${c.greetingPrefix} ${studentName}`
                : `${c.welcomeTo} ${data.classroomName || c.classroomDefault}`}
            </p>
            {studentName && (
              <button
                type="button"
                onClick={clearStudent}
                className="wb-classroom-switch-user"
              >
                {c.switchUser}
              </button>
            )}
          </div>

          {/* Student picker — only when there's a roster and no name picked yet. */}
          {data.students.length > 0 && !studentName && (
            <div className="wb-classroom-student-picker">
              <p className="wb-classroom-student-picker-prompt">{c.pickName}</p>
              <div className="wb-classroom-student-picker-chips">
                {data.students.map((sn) => (
                  <button
                    key={sn}
                    type="button"
                    onClick={() => pickStudent(sn)}
                    className="wb-classroom-student-chip"
                  >
                    {sn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* The search pill — exact same structure as the homepage's
              wb-home-search-box so the layout matches pixel-for-pixel.
              Kids toggle defaults ON (set on mount) but stays visible
              so a kid can flip it. plan="deep" passed to bypass the
              tier gate — classroom users get paid-tier features via
              the school subscription. */}
          {(data.students.length === 0 || studentName) && (
            <form className="wb-home-search" onSubmit={onSubmit}>
              <div className="wb-home-search-box">
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder={c.searchPh}
                  autoFocus
                  className="wb-home-search-input"
                  aria-label={c.searchPh}
                />
                <div className="wb-home-search-kids">
                  <KidsModeToggle plan="deep" />
                </div>
                <div className="wb-home-search-mic">
                  <VoiceInput
                    uiLang={lang}
                    getIdToken={async () => null}
                    onResult={(text) => {
                      setWord(text);
                    }}
                    enabled={true}
                    size="sm"
                    title="Voice"
                  />
                </div>
                <button
                  type="submit"
                  className="wb-home-search-submit"
                  aria-label={c.searchBtn}
                  title={c.searchBtn}
                >
                  <SearchIcon size={20} />
                </button>
              </div>
              <div className="wb-home-sentence-wrap">
                <textarea
                  value={sentence}
                  onChange={(e) => setSentence(e.target.value)}
                  placeholder={c.sentencePh}
                  rows={2}
                  className="wb-home-sentence-input"
                  aria-label={c.sentencePh}
                />
              </div>
            </form>
          )}

          {/* Off-hours soft hint. */}
          {!data.inSession && (
            <div className="wb-classroom-offhours">
              <div className="wb-classroom-offhours-line1">
                {(OFFHOURS_HINT[lang] ?? OFFHOURS_HINT.en).line1}
              </div>
              <Link
                href={href((OFFHOURS_HINT[lang] ?? OFFHOURS_HINT.en).link)}
                className="wb-classroom-offhours-cta"
              >
                {(OFFHOURS_HINT[lang] ?? OFFHOURS_HINT.en).cta} →
              </Link>
            </div>
          )}
        </div>
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

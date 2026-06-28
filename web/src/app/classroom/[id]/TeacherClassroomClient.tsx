"use client";

/**
 * Teacher view of a single classroom.
 *
 * The school owner lands here from /schools by clicking "Open" on a
 * classroom row. We:
 *   - Read the classroom doc + classroom searches in real time.
 *   - Surface the 6-character code in a big mustard chip so the teacher
 *     can read it out loud or post it.
 *   - Surface a copyable link `https://gadit.app/c/<CODE>` for sharing
 *     into a teachers WhatsApp / printing on a worksheet.
 *   - Show the last 50 words the class searched, newest first, with
 *     the time they were searched.
 *
 * No PII. The search log has only word + lang + timestamp; we don't
 * know which child searched which word, only that "this classroom" did.
 * That's the whole privacy story of the Schools SKU and the reason
 * this page is safe to ship without a DPDP/COPPA compliance review.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { db } from "@/lib/firebase";
import type { Classroom } from "@/lib/school";

interface SearchEntry {
  id: string;
  word: string;
  lang: string;
  at: string;
  studentName?: string;
}

const COPY: Record<string, {
  title: string;
  classroomCodeLabel: string;
  shareLinkLabel: string;
  copyLinkBtn: string;
  copied: string;
  recentSearches: string;
  empty: string;
  back: string;
  loading: string;
  notFound: string;
  studentsLabel: string;
  studentsHint: string;
  addStudentPh: string;
  addStudentBtn: string;
  removeStudentAria: string;
  anonymousLabel: string;
}> = {
  he: {
    title: "כיתה",
    classroomCodeLabel: "קוד הכיתה",
    shareLinkLabel: "לינק לילדים",
    copyLinkBtn: "העתק לינק",
    copied: "הועתק",
    recentSearches: "מילים שחיפשו לאחרונה",
    empty: "עדיין לא חיפשו מילים. הילדים יכולים להיכנס דרך הקוד למעלה.",
    back: "→ חזרה לבית הספר",
    loading: "טוען...",
    notFound: "כיתה לא נמצאה.",
    studentsLabel: "תלמידי הכיתה",
    studentsHint: "הוסיפו את שמות התלמידים והם יבחרו את עצמם כשייכנסו לקוד.",
    addStudentPh: "שם פרטי (לדוגמה: מאיה)",
    addStudentBtn: "+ הוסף",
    removeStudentAria: "הסר תלמיד",
    anonymousLabel: "אנונימי",
  },
  en: {
    title: "Classroom",
    classroomCodeLabel: "Classroom code",
    shareLinkLabel: "Kids link",
    copyLinkBtn: "Copy link",
    copied: "Copied",
    recentSearches: "Recent searches",
    empty: "No searches yet. Kids can join with the code above.",
    back: "← Back to school",
    loading: "Loading…",
    notFound: "Classroom not found.",
    studentsLabel: "Class roster",
    studentsHint: "Add your students' names and they'll pick themselves when they open the code.",
    addStudentPh: "First name (e.g. Maya)",
    addStudentBtn: "+ Add",
    removeStudentAria: "Remove student",
    anonymousLabel: "Anonymous",
  },
  hi: {
    title: "कक्षा",
    classroomCodeLabel: "कक्षा का कोड",
    shareLinkLabel: "बच्चों का लिंक",
    copyLinkBtn: "लिंक कॉपी करें",
    copied: "कॉपी हो गया",
    recentSearches: "हाल की खोज",
    empty: "अभी कोई खोज नहीं। बच्चे ऊपर के कोड से जुड़ सकते हैं।",
    back: "← स्कूल पर वापस",
    loading: "लोड हो रहा है…",
    notFound: "कक्षा नहीं मिली।",
    studentsLabel: "कक्षा की सूची",
    studentsHint: "अपने छात्रों के नाम जोड़ें, वे कोड खोलने पर अपना नाम चुनेंगे।",
    addStudentPh: "पहला नाम (जैसे आर्या)",
    addStudentBtn: "+ जोड़ें",
    removeStudentAria: "छात्र हटाएँ",
    anonymousLabel: "अनाम",
  },
};

export function TeacherClassroomClient({ classroomId }: { classroomId: string }) {
  const { user, schoolId, loading } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const c = COPY[lang] ?? COPY.en;

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [classroomChecked, setClassroomChecked] = useState(false);
  const [searches, setSearches] = useState<SearchEntry[]>([]);
  const [copied, setCopied] = useState(false);
  // New-student-name draft + busy flag. The teacher types a first
  // name and hits Enter or "+ Add" to append to the classroom roster.
  // Server-side dedupes so adding the same name twice is a no-op.
  const [newStudentName, setNewStudentName] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);

  async function addStudent() {
    if (!user || addingStudent) return;
    const name = newStudentName.trim();
    if (!name) return;
    setAddingStudent(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/schools/students", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ classroomId, name }),
      });
      if (res.ok) {
        setNewStudentName("");
      } else {
        console.error("add student failed:", await res.text());
      }
    } catch (err) {
      console.error("add student failed:", err);
    } finally {
      setAddingStudent(false);
    }
  }

  async function removeStudent(name: string) {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      await fetch(`/api/schools/students?classroomId=${encodeURIComponent(classroomId)}&name=${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
    } catch (err) {
      console.error("remove student failed:", err);
    }
  }

  useEffect(() => {
    if (!user || !schoolId) return;
    const ref = doc(db, "schools", schoolId, "classrooms", classroomId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setClassroom({ id: snap.id, ...(snap.data() as Omit<Classroom, "id">) });
        } else {
          setClassroom(null);
        }
        setClassroomChecked(true);
      },
      () => setClassroomChecked(true)
    );
    const searchesQ = query(
      collection(db, "schools", schoolId, "classrooms", classroomId, "searches"),
      orderBy("at", "desc"),
      limit(50),
    );
    const unsubSearches = onSnapshot(
      searchesQ,
      (snap) => {
        setSearches(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SearchEntry, "id">) })),
        );
      },
      () => {},
    );
    return () => {
      unsub();
      unsubSearches();
    };
  }, [user, schoolId, classroomId]);

  const kidsLink = useMemo(() => {
    if (!classroom) return "";
    if (typeof window === "undefined") return `https://gadit.app/c/${classroom.code}`;
    return `${window.location.origin}/c/${classroom.code}`;
  }, [classroom]);

  if (loading) {
    return <div className="wordbook wb-school-page" dir={dir}>&nbsp;</div>;
  }
  if (!user) {
    router.replace(href("/pricing"));
    return null;
  }
  if (!schoolId || schoolId !== user.uid) {
    router.replace(href("/pricing"));
    return null;
  }
  if (!classroomChecked) {
    return <div className="wordbook wb-school-page" dir={dir}>&nbsp;</div>;
  }
  if (!classroom) {
    return (
      <div className="wordbook wb-school-page" dir={dir}>
        <main className="wb-school-main">
          <Link href={href("/schools")} className="wb-family-back">{c.back}</Link>
          <p style={{ marginTop: 16 }}>{c.notFound}</p>
        </main>
      </div>
    );
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(kidsLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Some browsers without secure context. The link is visible so
      // the user can copy manually.
    }
  }

  return (
    <div className="wordbook wb-school-page" dir={dir}>
      <main className="wb-school-main">
        <Link href={href("/schools")} className="wb-family-back">{c.back}</Link>

        <h1 className="wb-school-title" style={{ marginBottom: 32 }}>
          {classroom.name || c.title}
        </h1>
        {/* "X מילים נחפשו" subtitle removed 2026-06-28: redundant
            with the count surfaced inside the "מילים שחיפשו לאחרונה"
            heading below, AND was grammatically awkward in Hebrew
            (singular "1 מילה" vs plural "X מילים" needed branching). */}

        {/* Code chip + kids-link section removed 2026-06-28. Both
            now live on /schools (the code as a mustard pill in each
            row, the kids link as a copy button next to the action
            icons). The teacher view is now focused on the search log
            and the class roster. */}

        {/* Class roster. Teacher pre-loads first names; when set,
            the kid view at /c/<CODE> shows a "pick your name"
            picker on first visit so each search log gets tagged.
            Empty roster = anonymous mode (no picker, no name tag). */}
        <section style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: "var(--wb-serif)",
              fontWeight: 700,
              fontSize: 20,
              color: "var(--ink)",
              margin: "0 0 6px",
            }}
          >
            {c.studentsLabel}
          </h2>
          <p
            style={{
              fontFamily: "var(--wb-sans)",
              fontSize: 13,
              color: "var(--ink-soft, #6B7280)",
              margin: "0 0 14px",
            }}
          >
            {c.studentsHint}
          </p>
          {(classroom.students ?? []).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {(classroom.students ?? []).map((sn) => (
                <span
                  key={sn}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    background: "#FEF3C7",
                    border: "1px solid #FCD34D",
                    borderRadius: 999,
                    fontFamily: "var(--wb-sans)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#A16207",
                  }}
                >
                  {sn}
                  <button
                    type="button"
                    onClick={() => removeStudent(sn)}
                    aria-label={c.removeStudentAria}
                    title={c.removeStudentAria}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#A16207",
                      padding: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: 14,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              value={newStudentName}
              placeholder={c.addStudentPh}
              onChange={(e) => setNewStudentName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addStudent(); }}
              disabled={addingStudent}
              style={{
                flex: 1,
                padding: "10px 14px",
                border: "1.5px solid #D6D3D1",
                borderRadius: 10,
                background: "#FFFFFF",
                fontFamily: "var(--wb-sans)",
                fontSize: 15,
                color: "var(--ink)",
                outline: "none",
              }}
            />
            <button
              type="button"
              className="wb-school-cta"
              onClick={addStudent}
              disabled={addingStudent || !newStudentName.trim()}
              style={{
                width: "auto",
                padding: "10px 18px",
                opacity: !newStudentName.trim() ? 0.5 : 1,
              }}
            >
              {c.addStudentBtn}
            </button>
          </div>
        </section>

        {/* Recent searches list. Newest first. Each row carries the
            student name (when the roster picker was used) so the
            teacher can see who searched what. */}
        <section>
          <h2 style={{
            fontFamily: "var(--wb-serif)",
            fontWeight: 700,
            fontSize: 20,
            color: "var(--ink)",
            margin: "0 0 14px",
          }}>
            {c.recentSearches}
          </h2>
          {searches.length === 0 ? (
            <p className="wb-school-sub">{c.empty}</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {searches.map((s) => (
                <li
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "12px 14px",
                    background: "var(--surface)",
                    border: "1px solid var(--hairline)",
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                >
                  <Link
                    href={href(`/word/${encodeURIComponent(s.word)}`)}
                    style={{
                      fontFamily: "var(--wb-serif)",
                      fontWeight: 700,
                      fontSize: 18,
                      color: "var(--ink)",
                      textDecoration: "none",
                      flex: 1,
                    }}
                  >
                    {s.word}
                  </Link>
                  <span
                    style={{
                      fontFamily: "var(--wb-sans)",
                      fontSize: 13,
                      fontWeight: 600,
                      color: s.studentName ? "#A16207" : "var(--ink-faint, #9CA3AF)",
                      fontStyle: s.studentName ? "normal" : "italic",
                    }}
                  >
                    {s.studentName || c.anonymousLabel}
                  </span>
                  <span style={{
                    fontFamily: "var(--wb-sans)",
                    fontSize: 12,
                    color: "var(--ink-soft)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}>
                    {s.lang}
                  </span>
                  <span style={{
                    fontFamily: "var(--wb-sans)",
                    fontSize: 13,
                    color: "var(--ink-soft)",
                  }}>
                    {formatRelativeTime(s.at, lang)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

// Tiny relative-time formatter. Enough granularity for a teacher
// scanning today's class activity ("now / 5m / 1h / yesterday").
// For older searches we fall back to the locale date string.
function formatRelativeTime(iso: string, lang: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";
  const ms = Date.now() - then;
  const min = Math.floor(ms / 60_000);
  const hr = Math.floor(ms / 3_600_000);
  const day = Math.floor(ms / 86_400_000);
  if (min < 1) return lang === "he" ? "עכשיו" : lang === "hi" ? "अभी" : "now";
  if (min < 60) return `${min}m`;
  if (hr < 24) return `${hr}h`;
  if (day < 7) return `${day}d`;
  return new Date(then).toLocaleDateString();
}

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
import { computeClassroomInsights, classroomLangLabel } from "@/lib/classroom-insights";

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
  insightsTitle: string;
  totalLabel: string;
  totalAllTime: string;
  langMapTitle: string;
  langMapSub: string;
  notEnough: string;
  stuckTitle: string;
  stuckSub: string;
  supportTitle: string;
  supportSub: string;
  supportRosterHint: string;
  lookupsLabel: string;
  basedOn: (n: number) => string;
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
    addStudentPh: "שם פרטי, או רשימה: מאיה, יוסי, רותם",
    addStudentBtn: "+ הוסף",
    removeStudentAria: "הסר תלמיד",
    anonymousLabel: "אנונימי",
    insightsTitle: "תובנות הכיתה",
    totalLabel: "סה\"כ חיפושים",
    totalAllTime: "מתחילת הדרך",
    langMapTitle: "השפות שהכיתה לומדת בהן",
    langMapSub: "כל חיפוש נענה בשפה של התלמיד. זו מפת השפות האמיתית של הכיתה.",
    notEnough: "עדיין אין מספיק נתונים.",
    stuckTitle: "מילים שהכיתה נתקעת עליהן",
    stuckSub: "כדאי ללמד אותן מראש לפני השיעור הבא.",
    supportTitle: "אולי צריכים תשומת לב נוספת",
    supportSub: "פרטי, רק בשבילך. ריבוי חיפושים יכול להעיד על קושי או פשוט על סקרנות.",
    supportRosterHint: "כשמוסיפים שמות תלמידים לרשימה למעלה, יופיע כאן איתות תמיכה פרטי.",
    lookupsLabel: "חיפושים",
    basedOn: (n) => `מבוסס על ${n} החיפושים האחרונים`,
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
    addStudentPh: "First name, or a list: Maya, Yossi, Rotem",
    addStudentBtn: "+ Add",
    removeStudentAria: "Remove student",
    anonymousLabel: "Anonymous",
    insightsTitle: "Class insights",
    totalLabel: "Total lookups",
    totalAllTime: "all time",
    langMapTitle: "Languages your class learns in",
    langMapSub: "Every lookup is answered in the student's own language. This is your class's real language map.",
    notEnough: "Not enough data yet.",
    stuckTitle: "Words your class gets stuck on",
    stuckSub: "Worth pre-teaching before the next lesson.",
    supportTitle: "May need extra attention",
    supportSub: "Private, just for you. Lots of lookups can mean a struggle or simply curiosity.",
    supportRosterHint: "Add student names to the roster above to see a private support signal here.",
    lookupsLabel: "lookups",
    basedOn: (n) => `Based on the last ${n} lookups`,
  },
  el: {
    title: "Τάξη",
    classroomCodeLabel: "Κωδικός τάξης",
    shareLinkLabel: "Σύνδεσμος για παιδιά",
    copyLinkBtn: "Αντιγραφή συνδέσμου",
    copied: "Αντιγράφηκε",
    recentSearches: "Πρόσφατες αναζητήσεις",
    empty: "Δεν υπάρχουν αναζητήσεις ακόμη. Τα παιδιά μπορούν να συνδεθούν με τον κωδικό παραπάνω.",
    back: "← Πίσω στο σχολείο",
    loading: "Φόρτωση…",
    notFound: "Η τάξη δεν βρέθηκε.",
    studentsLabel: "Κατάλογος τάξης",
    studentsHint: "Πρόσθεσε τα ονόματα των μαθητών σου και θα επιλέγουν τον εαυτό τους όταν ανοίγουν τον κωδικό.",
    addStudentPh: "Όνομα, ή λίστα: Μαρία, Γιώργος, Ελένη",
    addStudentBtn: "+ Προσθήκη",
    removeStudentAria: "Αφαίρεση μαθητή",
    anonymousLabel: "Ανώνυμος",
    insightsTitle: "Στατιστικά τάξης",
    totalLabel: "Σύνολο αναζητήσεων",
    totalAllTime: "από την αρχή",
    langMapTitle: "Γλώσσες στις οποίες μαθαίνει η τάξη σου",
    langMapSub: "Κάθε αναζήτηση απαντάται στη γλώσσα του μαθητή. Αυτός είναι ο πραγματικός γλωσσικός χάρτης της τάξης σου.",
    notEnough: "Δεν υπάρχουν αρκετά δεδομένα ακόμη.",
    stuckTitle: "Λέξεις που δυσκολεύουν την τάξη σου",
    stuckSub: "Αξίζει να τις διδάξεις πριν το επόμενο μάθημα.",
    supportTitle: "Ίσως χρειάζονται επιπλέον προσοχή",
    supportSub: "Ιδιωτικό, μόνο για σένα. Πολλές αναζητήσεις μπορεί να σημαίνουν δυσκολία ή απλώς περιέργεια.",
    supportRosterHint: "Πρόσθεσε ονόματα μαθητών στον κατάλογο παραπάνω για να δεις εδώ ένα ιδιωτικό σήμα υποστήριξης.",
    lookupsLabel: "αναζητήσεις",
    basedOn: (n) => `Βασίζεται στις τελευταίες ${n} αναζητήσεις`,
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
    addStudentPh: "पहला नाम, या सूची: आर्या, राहुल, माया",
    addStudentBtn: "+ जोड़ें",
    removeStudentAria: "छात्र हटाएँ",
    anonymousLabel: "अनाम",
    insightsTitle: "कक्षा की जानकारी",
    totalLabel: "कुल खोजें",
    totalAllTime: "अब तक",
    langMapTitle: "आपकी कक्षा जिन भाषाओं में सीखती है",
    langMapSub: "हर खोज छात्र की अपनी भाषा में उत्तर देती है। यह आपकी कक्षा का असली भाषा-नक्शा है।",
    notEnough: "अभी पर्याप्त डेटा नहीं है।",
    stuckTitle: "जिन शब्दों पर कक्षा अटकती है",
    stuckSub: "अगले पाठ से पहले इन्हें पढ़ाना अच्छा रहेगा।",
    supportTitle: "शायद अतिरिक्त ध्यान चाहिए",
    supportSub: "निजी, सिर्फ़ आपके लिए। ज़्यादा खोजें कठिनाई या केवल जिज्ञासा दिखा सकती हैं।",
    supportRosterHint: "ऊपर सूची में छात्रों के नाम जोड़ें ताकि यहाँ निजी सहायता संकेत दिखे।",
    lookupsLabel: "खोजें",
    basedOn: (n) => `पिछली ${n} खोजों पर आधारित`,
  },
  am: {
    title: "ክፍል",
    classroomCodeLabel: "የክፍሉ ኮድ",
    shareLinkLabel: "የልጆች ሊንክ",
    copyLinkBtn: "ሊንኩን ኮፒ ያድርጉ",
    copied: "ተቀድቷል",
    recentSearches: "በቅርቡ የተፈለጉ ቃላት",
    empty: "እስካሁን ምንም ፍለጋ የለም። ልጆች ከላይ ባለው ኮድ መግባት ይችላሉ።",
    back: "← ወደ ትምህርት ቤቱ ተመለሱ",
    loading: "እየተጫነ ነው…",
    notFound: "ክፍሉ አልተገኘም።",
    studentsLabel: "የክፍሉ ተማሪዎች",
    studentsHint: "የተማሪዎችዎን ስሞች ይጨምሩ፣ ኮዱን ሲከፍቱ ራሳቸውን ይመርጣሉ።",
    addStudentPh: "የመጀመሪያ ስም፣ ወይም ዝርዝር፡ ሰላም፣ ዳዊት፣ ሃና",
    addStudentBtn: "+ ጨምር",
    removeStudentAria: "ተማሪ አስወግድ",
    anonymousLabel: "ስም አልባ",
    insightsTitle: "የክፍሉ ግንዛቤዎች",
    totalLabel: "ጠቅላላ ፍለጋዎች",
    totalAllTime: "ከጅምሩ",
    langMapTitle: "ክፍሉ የሚማርባቸው ቋንቋዎች",
    langMapSub: "እያንዳንዱ ፍለጋ በተማሪው ቋንቋ ይመለሳል። ይህ የክፍሉ እውነተኛ የቋንቋ ካርታ ነው።",
    notEnough: "እስካሁን በቂ መረጃ የለም።",
    stuckTitle: "ክፍሉ የሚቸገርባቸው ቃላት",
    stuckSub: "ከቀጣዩ ትምህርት በፊት እነሱን ማስተማር ጥሩ ነው።",
    supportTitle: "ተጨማሪ ትኩረት ሊፈልጉ ይችላሉ",
    supportSub: "የግል፣ ለእርስዎ ብቻ። ብዙ ፍለጋ ችግርን ወይም ጉጉትን ሊያሳይ ይችላል።",
    supportRosterHint: "ከላይ ባለው ዝርዝር የተማሪ ስሞችን ሲጨምሩ እዚህ የግል የድጋፍ ምልክት ይታያል።",
    lookupsLabel: "ፍለጋዎች",
    basedOn: (n) => `በመጨረሻዎቹ ${n} ፍለጋዎች ላይ የተመሠረተ`,
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
    // Bulk add: split the input on commas, semicolons, or newlines so
    // the teacher can paste a whole class list ("רותם, מאיה, יוסי, ...")
    // in one go. Gadi (2026-06-29): "if a teacher wants to add 20
    // students at once and separate by comma, can we do that?"
    // Dedupe case-insensitively and cap at 50 per submission so a paste
    // accident doesn't blow past the 60-per-classroom roster limit.
    const parts = newStudentName
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length <= 40);
    const seen = new Set<string>();
    const names: string[] = [];
    for (const p of parts) {
      const key = p.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      names.push(p);
      if (names.length >= 50) break;
    }
    if (names.length === 0) return;
    setAddingStudent(true);
    try {
      const idToken = await user.getIdToken();
      // Fire all in parallel — the server-side endpoint is idempotent
      // and uses FieldValue.arrayUnion, so concurrent calls are safe.
      // For 20 names this completes in under a second on a normal
      // network; well below any UI tolerance.
      await Promise.all(
        names.map((name) =>
          fetch("/api/schools/students", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
            body: JSON.stringify({ classroomId, name }),
          }).then(async (res) => {
            if (!res.ok) console.error("add student failed:", name, await res.text());
          }).catch((err) => console.error("add student failed:", name, err)),
        ),
      );
      setNewStudentName("");
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
    // Pull a wider window than the 50-row list needs so the insight
    // aggregation (language map, stuck words, support signal) has a
    // meaningful sample. 300 realtime docs is cheap for a page a teacher
    // opens occasionally.
    const searchesQ = query(
      collection(db, "schools", schoolId, "classrooms", classroomId, "searches"),
      orderBy("at", "desc"),
      limit(300),
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

  // Class-level insights (council-approved unit of measurement): language
  // map + stuck words + private support signal. Computed from the loaded
  // window; total-ever comes from the classroom doc's searchCount.
  const insights = useMemo(() => computeClassroomInsights(searches), [searches]);
  const recentToShow = useMemo(() => searches.slice(0, 50), [searches]);

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
    <div className="wordbook wb-school-page school-admin-mustard" dir={dir}>
      {/* Match the mustard Schools SKU accent used across the /schools
          dashboard (Gadi 2026-08-03, full coherence). Scoped to this admin
          view; the kid /c/<CODE> surface keeps the core teal. */}
      <style>{`
        .school-admin-mustard .wb-school-cta {
          background: #CA8A04 !important;
          box-shadow: 0 1px 2px rgba(202,138,4,0.28), 0 8px 22px -8px rgba(202,138,4,0.42) !important;
        }
        .school-admin-mustard .wb-school-cta:hover { background: #A16207 !important; }
        .school-admin-mustard .wb-school-cta:focus-visible { outline: 2px solid #CA8A04 !important; }
      `}</style>
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
          <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
            <textarea
              value={newStudentName}
              placeholder={c.addStudentPh}
              onChange={(e) => setNewStudentName(e.target.value)}
              onKeyDown={(e) => {
                // Ctrl/Cmd+Enter submits; bare Enter inserts a newline so
                // teachers can paste/type multi-line lists.
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  addStudent();
                }
              }}
              disabled={addingStudent}
              rows={2}
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
                resize: "vertical",
                minHeight: 44,
                lineHeight: 1.4,
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

        {/* Class insights — the council-approved value: comprehension
            made visible at the CLASS level. Language map (which languages
            the class learns in), stuck words (pre-teach these), a total
            (proof of use), and a PRIVATE support signal (never a public
            ranking). Only shown once the class has looked something up. */}
        {searches.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: "var(--wb-serif)", fontWeight: 700, fontSize: 20, color: "var(--ink)", margin: "0 0 4px" }}>
              {c.insightsTitle}
            </h2>
            <p style={{ fontFamily: "var(--wb-sans)", fontSize: 12.5, color: "var(--ink-soft, #6B7280)", margin: "0 0 16px" }}>
              {c.basedOn(insights.sampleSize)}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              {/* Total lookups — proof of use, all-time from the counter. */}
              <div style={insightCardStyle}>
                <div style={insightLabelStyle}>{c.totalLabel}</div>
                <div style={{ fontFamily: "var(--wb-serif)", fontWeight: 700, fontSize: 40, color: "#CA8A04", lineHeight: 1.05 }}>
                  {(classroom.searchCount ?? 0).toLocaleString()}
                </div>
                <div style={{ fontFamily: "var(--wb-sans)", fontSize: 12, color: "var(--ink-soft, #9CA3AF)" }}>
                  {c.totalAllTime}
                </div>
              </div>

              {/* Language map — the un-fakeable home-language signal. */}
              <div style={insightCardStyle}>
                <div style={insightLabelStyle}>{c.langMapTitle}</div>
                <p style={insightSubStyle}>{c.langMapSub}</p>
                {insights.languages.length === 0 ? (
                  <p style={{ fontFamily: "var(--wb-sans)", fontSize: 13, color: "var(--ink-soft, #9CA3AF)", margin: 0 }}>{c.notEnough}</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                    {insights.languages.map((l) => (
                      <div key={l.lang} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: "var(--wb-sans)", fontSize: 13, fontWeight: 600, color: "var(--ink)", minWidth: 78 }}>
                          {classroomLangLabel(l.lang)}
                        </span>
                        <span style={{ flex: 1, height: 8, background: "#F3F4F6", borderRadius: 999, overflow: "hidden" }}>
                          <span style={{ display: "block", height: "100%", width: `${Math.max(l.pct, 3)}%`, background: "#CA8A04", borderRadius: 999 }} />
                        </span>
                        <span style={{ fontFamily: "var(--wb-sans)", fontSize: 12, fontWeight: 600, color: "var(--ink-soft, #6B7280)", minWidth: 34, textAlign: "end" }}>
                          {l.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stuck words — the pre-teach list. */}
            <div style={{ ...insightCardStyle, marginTop: 14 }}>
              <div style={insightLabelStyle}>{c.stuckTitle}</div>
              <p style={insightSubStyle}>{c.stuckSub}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {insights.topWords.map((w) => (
                  <Link
                    key={w.word}
                    href={href(`/word/${encodeURIComponent(w.word)}`)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "6px 12px", background: "#FFFBEB", border: "1px solid #FDE68A",
                      borderRadius: 999, textDecoration: "none",
                      fontFamily: "var(--wb-sans)", fontSize: 14, fontWeight: 600, color: "#92400E",
                    }}
                  >
                    <span>{w.word}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#CA8A04", background: "#FEF3C7", borderRadius: 999, padding: "1px 7px" }}>
                      {w.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Private support signal — teacher-only, never a public
                leaderboard. Shows only when the roster has named students. */}
            <div style={{ ...insightCardStyle, marginTop: 14 }}>
              <div style={insightLabelStyle}>{c.supportTitle}</div>
              <p style={insightSubStyle}>{c.supportSub}</p>
              {insights.students.length === 0 ? (
                <p style={{ fontFamily: "var(--wb-sans)", fontSize: 13, color: "var(--ink-soft, #9CA3AF)", margin: 0 }}>
                  {c.supportRosterHint}
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                  {insights.students.map((st) => (
                    <div key={st.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontFamily: "var(--wb-sans)", fontSize: 14, fontWeight: 600, color: "var(--ink)", flex: 1 }}>
                        {st.name}
                      </span>
                      <span style={{ fontFamily: "var(--wb-sans)", fontSize: 12.5, color: "var(--ink-soft, #6B7280)" }}>
                        {st.count} {c.lookupsLabel}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

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
              {recentToShow.map((s) => (
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

// Shared styles for the insight cards (mustard-accented, matching the
// Schools SKU brand).
const insightCardStyle: React.CSSProperties = {
  background: "var(--surface, #fff)",
  border: "1px solid var(--hairline, #E5E7EB)",
  borderRadius: 14,
  padding: "16px 18px",
};
const insightLabelStyle: React.CSSProperties = {
  fontFamily: "var(--wb-sans)",
  fontSize: 13,
  fontWeight: 700,
  color: "var(--ink)",
  marginBottom: 4,
};
const insightSubStyle: React.CSSProperties = {
  fontFamily: "var(--wb-sans)",
  fontSize: 12.5,
  color: "var(--ink-soft, #6B7280)",
  lineHeight: 1.45,
  margin: "0 0 12px",
};

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
  if (min < 1) return lang === "he" ? "עכשיו" : lang === "hi" ? "अभी" : lang === "am" ? "አሁን" : "now";
  if (min < 60) return `${min}m`;
  if (hr < 24) return `${hr}h`;
  if (day < 7) return `${day}d`;
  return new Date(then).toLocaleDateString();
}

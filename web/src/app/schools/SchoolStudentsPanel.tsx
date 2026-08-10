"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";
import { classroomLangLabel } from "@/lib/classroom-insights";
import { classroomColorFor } from "@/lib/school";

/**
 * Students tab of the /schools shell. Lists every named student across the
 * whole school with per-student stats (lookup count, classroom, top
 * language), sortable by activity, name, or classroom. A student is a
 * (classroom, name) pair since first names aren't unique across classes.
 * Data from /api/schools/insights (owner-authed).
 */

type StudentRow = {
  name: string;
  classroomId: string;
  classroomName: string;
  code: string;
  colorIndex: number;
  count: number;
  topLanguage: string;
};

type Sort = "activity" | "name" | "classroom";

type Copy = {
  loading: string;
  error: string;
  empty: string;
  hint: string;
  sortBy: string;
  sortActivity: string;
  sortName: string;
  sortClassroom: string;
  colName: string;
  colClassroom: string;
  colLang: string;
  colLookups: string;
  filterPh: string;
  countLabel: (n: number) => string;
};

const COPY: Record<string, Copy> = {
  he: {
    loading: "טוען...",
    error: "לא הצלחנו לטעון את התלמידים. אפשר לנסות שוב.",
    empty: "עדיין אין תלמידים עם פעילות. כדי לראות תלמידים בשמם, צריך להוסיף רשימת תלמידים לכיתה. אז כל ילד יבחר את שמו לפני החיפוש.",
    hint: "מבוסס על הפעילות האחרונה. ריבוי חיפושים יכול להעיד על קושי או על סקרנות.",
    sortBy: "מיון לפי",
    sortActivity: "פעילות",
    sortName: "שם",
    sortClassroom: "כיתה",
    colName: "תלמיד",
    colClassroom: "כיתה",
    colLang: "שפה",
    colLookups: "חיפושים",
    filterPh: "סינון לפי שם...",
    countLabel: (n) => `${n} תלמידים`,
  },
  en: {
    loading: "Loading…",
    error: "Couldn't load students. Please try again.",
    empty: "No students with activity yet. To see students by name, add a class roster so each child picks their name before searching.",
    hint: "Based on recent activity. Lots of lookups can mean a struggle or curiosity.",
    sortBy: "Sort by",
    sortActivity: "Activity",
    sortName: "Name",
    sortClassroom: "Classroom",
    colName: "Student",
    colClassroom: "Classroom",
    colLang: "Language",
    colLookups: "Lookups",
    filterPh: "Filter by name…",
    countLabel: (n) => `${n} students`,
  },
  el: {
    loading: "Φόρτωση…",
    error: "Δεν ήταν δυνατή η φόρτωση των μαθητών. Δοκιμάστε ξανά.",
    empty: "Δεν υπάρχουν μαθητές με δραστηριότητα ακόμη. Για να βλέπετε μαθητές με το όνομά τους, προσθέστε κατάλογο τάξης ώστε κάθε παιδί να επιλέγει το όνομά του πριν την αναζήτηση.",
    hint: "Βάσει πρόσφατης δραστηριότητας. Πολλές αναζητήσεις μπορεί να σημαίνουν δυσκολία ή περιέργεια.",
    sortBy: "Ταξινόμηση κατά",
    sortActivity: "Δραστηριότητα",
    sortName: "Όνομα",
    sortClassroom: "Τάξη",
    colName: "Μαθητής",
    colClassroom: "Τάξη",
    colLang: "Γλώσσα",
    colLookups: "Αναζητήσεις",
    filterPh: "Φιλτράρισμα κατά όνομα…",
    countLabel: (n) => `${n} μαθητές`,
  },
  hi: {
    loading: "लोड हो रहा है…",
    error: "छात्र लोड नहीं हो सके। फिर से कोशिश करें।",
    empty: "अभी कोई सक्रिय छात्र नहीं। नाम से छात्र देखने के लिए कक्षा की सूची जोड़ें ताकि हर बच्चा खोज से पहले अपना नाम चुने।",
    hint: "हाल की गतिविधि पर आधारित। ज़्यादा खोजें कठिनाई या जिज्ञासा दिखा सकती हैं।",
    sortBy: "क्रमबद्ध करें",
    sortActivity: "गतिविधि",
    sortName: "नाम",
    sortClassroom: "कक्षा",
    colName: "छात्र",
    colClassroom: "कक्षा",
    colLang: "भाषा",
    colLookups: "खोजें",
    filterPh: "नाम से छानें…",
    countLabel: (n) => `${n} छात्र`,
  },
  am: {
    loading: "እየተጫነ ነው…",
    error: "ተማሪዎችን መጫን አልተቻለም። እንደገና ይሞክሩ።",
    empty: "እስካሁን በእንቅስቃሴ ያለ ተማሪ የለም። ተማሪዎችን በስም ለማየት የክፍል ዝርዝር ይጨምሩ፣ እያንዳንዱ ልጅ ከፍለጋ በፊት ስሙን ይመርጣል።",
    hint: "በቅርብ እንቅስቃሴ ላይ የተመሠረተ። ብዙ ፍለጋ ችግርን ወይም ጉጉትን ሊያሳይ ይችላል።",
    sortBy: "ደርድር በ",
    sortActivity: "እንቅስቃሴ",
    sortName: "ስም",
    sortClassroom: "ክፍል",
    colName: "ተማሪ",
    colClassroom: "ክፍል",
    colLang: "ቋንቋ",
    colLookups: "ፍለጋዎች",
    filterPh: "በስም አጣራ…",
    countLabel: (n) => `${n} ተማሪዎች`,
  },
};

export function SchoolStudentsPanel({ lang }: { lang: string }) {
  const { user } = useAuth();
  const href = useHref();
  const t = COPY[lang] ?? COPY.en;

  const [rows, setRows] = useState<StudentRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState<Sort>("activity");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/schools/insights", { headers: { Authorization: `Bearer ${idToken}` } });
        if (!res.ok) { if (!cancelled) setError(true); return; }
        const json = (await res.json()) as { students?: StudentRow[] };
        if (!cancelled) setRows(json.students ?? []);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const view = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const filtered = (rows ?? []).filter((r) => !q || r.name.toLowerCase().includes(q));
    const sorted = [...filtered];
    if (sort === "activity") sorted.sort((a, b) => b.count - a.count);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else sorted.sort((a, b) => a.classroomName.localeCompare(b.classroomName) || b.count - a.count);
    return sorted;
  }, [rows, sort, filter]);

  if (loading) return <p style={{ color: "#78716C", fontSize: 15 }}>{t.loading}</p>;
  if (error || !rows) return <p style={{ color: "#B45309", fontSize: 15 }}>{t.error}</p>;
  if (rows.length === 0) {
    return (
      <div style={{ background: "#fff", border: "1px dashed #E5E0D8", borderRadius: 16, padding: "32px 24px", textAlign: "center" }}>
        <p style={{ color: "#78716C", fontSize: 15, margin: 0, lineHeight: 1.6 }}>{t.empty}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Controls: filter + sort */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t.filterPh}
          style={{ flex: "1 1 200px", maxWidth: 300, padding: "9px 14px", border: "1.5px solid #E5E0D8", borderRadius: 10, background: "#fff", fontSize: 14, outline: "none", color: "#1C1917" }}
        />
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12.5, color: "#78716C", fontWeight: 600 }}>{t.sortBy}</span>
          {(["activity", "name", "classroom"] as Sort[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSort(s)}
              style={{
                padding: "6px 12px", borderRadius: 999,
                border: sort === s ? "1.5px solid #CA8A04" : "1px solid #E5E0D8",
                background: sort === s ? "#FEF3C7" : "#fff",
                color: sort === s ? "#92400E" : "#78716C",
                fontSize: 12.5, fontWeight: sort === s ? 700 : 600, cursor: "pointer",
              }}
            >
              {s === "activity" ? t.sortActivity : s === "name" ? t.sortName : t.sortClassroom}
            </button>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 12, color: "#A8A29E", margin: "0 2px 14px" }}>{t.countLabel(view.length)} · {t.hint}</p>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {view.map((r) => (
          <div key={`${r.classroomId}:${r.name}`} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #EAE7E3", borderRadius: 12, padding: "12px 16px", flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1C1917", flex: "1 1 120px", minWidth: 100 }}>{r.name}</span>
            <Link href={href(`/classroom/${r.classroomId}`)} style={{ display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none", fontSize: 13, color: "#78716C", minWidth: 90 }}>
              <span style={{ width: 10, height: 10, borderRadius: 999, flexShrink: 0, background: classroomColorFor({ colorIndex: r.colorIndex }) }} />
              <span style={{ fontWeight: 600 }}>{r.classroomName || r.code}</span>
            </Link>
            <span style={{ fontSize: 12.5, color: "#78716C", minWidth: 64 }}>{r.topLanguage ? classroomLangLabel(r.topLanguage) : "—"}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#CA8A04", minWidth: 48, textAlign: "end" }}>{r.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

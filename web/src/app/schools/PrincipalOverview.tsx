"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";
import { classroomLangLabel, type LangCount, type WordCount } from "@/lib/classroom-insights";
import { classroomColorFor } from "@/lib/school";

/**
 * Principal's school-wide roll-up (the "Overview" tab of /schools).
 *
 * Rolls the class-level signal the council settled on up to the whole
 * building: total lookups, a school-wide language map + stuck words, and
 * a per-classroom list ranked by activity, each linking to the full
 * classroom view and offering the teacher's by-code link to hand off.
 * Data comes from /api/schools/insights (owner-authed aggregation).
 */

type ClassroomRow = {
  id: string;
  name: string;
  code: string;
  colorIndex: number;
  totalAllTime: number;
  sampleSize: number;
  topLanguage: string;
};

type ApiResponse = {
  totalAllTime: number;
  classroomCount: number;
  languages: LangCount[];
  topWords: WordCount[];
  sampleSize: number;
  classrooms: ClassroomRow[];
};

type Copy = {
  loading: string;
  error: string;
  empty: string;
  emptyNoActivity: string;
  totalLabel: string;
  classroomsLabel: string;
  langMapTitle: string;
  langMapSub: string;
  stuckTitle: string;
  stuckSub: string;
  notEnough: string;
  classroomsTitle: string;
  open: string;
  teacherLink: string;
  teacherLinkCopied: string;
  lookups: string;
  basedOn: (n: number) => string;
};

const COPY: Record<string, Copy> = {
  he: {
    loading: "טוען...",
    error: "לא הצלחנו לטעון את התובנות. אפשר לנסות שוב.",
    empty: "עדיין אין כיתות. הוסיפו כיתה ראשונה כדי לקבל קוד לילדים.",
    emptyNoActivity: "עדיין אין חיפושים. שתפו את קוד הכיתה עם התלמידים והחיפושים שלהם יופיעו כאן.",
    totalLabel: "סה\"כ חיפושים בבית הספר",
    classroomsLabel: "כיתות",
    langMapTitle: "השפות שבית הספר לומד בהן",
    langMapSub: "כל חיפוש נענה בשפה של התלמיד. זו מפת השפות של בית הספר.",
    stuckTitle: "מילים שבית הספר נתקע עליהן",
    stuckSub: "המילים שהכי הרבה תלמידים חיפשו, בכל הכיתות.",
    notEnough: "עדיין אין מספיק נתונים.",
    classroomsTitle: "כיתות לפי פעילות",
    open: "פתיחה",
    teacherLink: "לינק למורה",
    teacherLinkCopied: "הועתק",
    lookups: "חיפושים",
    basedOn: (n) => `מפות מבוססות על ${n} החיפושים האחרונים`,
  },
  en: {
    loading: "Loading…",
    error: "Couldn't load insights. Please try again.",
    empty: "No classrooms yet. Add your first classroom to get a code for the kids.",
    emptyNoActivity: "No lookups yet. Share the classroom code with your students and their searches will appear here.",
    totalLabel: "Total lookups across the school",
    classroomsLabel: "classrooms",
    langMapTitle: "Languages your school learns in",
    langMapSub: "Every lookup is answered in the student's own language. This is your school's language map.",
    stuckTitle: "Words your school gets stuck on",
    stuckSub: "The words the most students looked up, across all classes.",
    notEnough: "Not enough data yet.",
    classroomsTitle: "Classrooms by activity",
    open: "Open",
    teacherLink: "Teacher link",
    teacherLinkCopied: "Copied",
    lookups: "lookups",
    basedOn: (n) => `Maps based on the last ${n} lookups`,
  },
  zu: {
    loading: "Iyalayisha…",
    error: "Asikwazanga ukulayisha imininingwane. Sicela uzame futhi.",
    empty: "Awukho amakilasi okwamanje. Engeza ikilasi lakho lokuqala ukuze uthole ikhodi yezingane.",
    emptyNoActivity: "Awukho amagama afuniwe okwamanje. Yabelana ngekhodi yekilasi nabafundi bakho, ukusesha kwabo kuzovela lapha.",
    totalLabel: "Isamba sokubheka kuso sonke isikole",
    classroomsLabel: "amakilasi",
    langMapTitle: "Izilimi isikole sakho esifunda ngazo",
    langMapSub: "Konke ukubheka kuphendulwa ngolimi lomfundi uqobo. Leli yibalazwe lezilimi zesikole sakho.",
    stuckTitle: "Amagama isikole sakho esibambeka kuwo",
    stuckSub: "Amagama abhekwe abafundi abaningi, kuwo wonke amakilasi.",
    notEnough: "Ayikho idatha eyanele okwamanje.",
    classroomsTitle: "Amakilasi ngokomsebenzi",
    open: "Vula",
    teacherLink: "Isixhumanisi sikathisha",
    teacherLinkCopied: "Kukopishiwe",
    lookups: "ukubheka",
    basedOn: (n) => `Amabalazwe asekelwe ekubhekeni kokugcina okungu-${n}`,
  },
  el: {
    loading: "Φόρτωση…",
    error: "Δεν ήταν δυνατή η φόρτωση των στατιστικών. Δοκιμάστε ξανά.",
    empty: "Δεν υπάρχουν τάξεις ακόμη. Πρόσθεσε την πρώτη σου τάξη για να πάρεις κωδικό για τα παιδιά.",
    emptyNoActivity: "Δεν υπάρχουν αναζητήσεις ακόμη. Μοιράσου τον κωδικό της τάξης με τους μαθητές σου και οι αναζητήσεις τους θα εμφανιστούν εδώ.",
    totalLabel: "Συνολικές αναζητήσεις σε όλο το σχολείο",
    classroomsLabel: "τάξεις",
    langMapTitle: "Οι γλώσσες στις οποίες μαθαίνει το σχολείο σας",
    langMapSub: "Κάθε αναζήτηση απαντάται στη γλώσσα του μαθητή. Αυτός είναι ο γλωσσικός χάρτης του σχολείου σας.",
    stuckTitle: "Λέξεις που δυσκολεύουν το σχολείο σας",
    stuckSub: "Οι λέξεις που αναζήτησαν οι περισσότεροι μαθητές, σε όλες τις τάξεις.",
    notEnough: "Δεν υπάρχουν αρκετά δεδομένα ακόμη.",
    classroomsTitle: "Τάξεις κατά δραστηριότητα",
    open: "Άνοιγμα",
    teacherLink: "Σύνδεσμος εκπαιδευτικού",
    teacherLinkCopied: "Αντιγράφηκε",
    lookups: "αναζητήσεις",
    basedOn: (n) => `Χάρτες βάσει των τελευταίων ${n} αναζητήσεων`,
  },
  hi: {
    loading: "लोड हो रहा है…",
    error: "जानकारी लोड नहीं हो सकी। फिर से कोशिश करें।",
    empty: "अभी कोई कक्षा नहीं। बच्चों के लिए कोड पाने हेतु अपनी पहली कक्षा जोड़ें।",
    emptyNoActivity: "अभी कोई खोज नहीं। कक्षा कोड अपने छात्रों के साथ साझा करें, उनकी खोजें यहाँ दिखेंगी।",
    totalLabel: "स्कूल भर में कुल खोजें",
    classroomsLabel: "कक्षाएँ",
    langMapTitle: "आपका स्कूल जिन भाषाओं में सीखता है",
    langMapSub: "हर खोज छात्र की अपनी भाषा में उत्तर देती है। यह आपके स्कूल का भाषा-नक्शा है।",
    stuckTitle: "जिन शब्दों पर स्कूल अटकता है",
    stuckSub: "सभी कक्षाओं में सबसे ज़्यादा खोजे गए शब्द।",
    notEnough: "अभी पर्याप्त डेटा नहीं है।",
    classroomsTitle: "गतिविधि के अनुसार कक्षाएँ",
    open: "खोलें",
    teacherLink: "शिक्षक लिंक",
    teacherLinkCopied: "कॉपी हो गया",
    lookups: "खोजें",
    basedOn: (n) => `पिछली ${n} खोजों पर आधारित नक्शे`,
  },
  am: {
    loading: "እየተጫነ ነው…",
    error: "ግንዛቤዎቹን መጫን አልተቻለም። እንደገና ይሞክሩ።",
    empty: "እስካሁን ክፍሎች የሉም። ለልጆች ኮድ ለማግኘት የመጀመሪያ ክፍልዎን ይጨምሩ።",
    emptyNoActivity: "እስካሁን ፍለጋዎች የሉም። የክፍል ኮዱን ከተማሪዎችዎ ጋር ያጋሩ፣ ፍለጋዎቻቸው እዚህ ይታያሉ።",
    totalLabel: "በትምህርት ቤቱ ጠቅላላ ፍለጋዎች",
    classroomsLabel: "ክፍሎች",
    langMapTitle: "ትምህርት ቤቱ የሚማርባቸው ቋንቋዎች",
    langMapSub: "እያንዳንዱ ፍለጋ በተማሪው ቋንቋ ይመለሳል። ይህ የትምህርት ቤቱ የቋንቋ ካርታ ነው።",
    stuckTitle: "ትምህርት ቤቱ የሚቸገርባቸው ቃላት",
    stuckSub: "በሁሉም ክፍሎች ብዙ ተማሪዎች የፈለጓቸው ቃላት።",
    notEnough: "እስካሁን በቂ መረጃ የለም።",
    classroomsTitle: "ክፍሎች በእንቅስቃሴ",
    open: "ክፈት",
    teacherLink: "የመምህር ሊንክ",
    teacherLinkCopied: "ተቀድቷል",
    lookups: "ፍለጋዎች",
    basedOn: (n) => `ካርታዎች በመጨረሻዎቹ ${n} ፍለጋዎች ላይ የተመሠረቱ`,
  },
};

export function PrincipalOverview({ lang }: { lang: string }) {
  const { user } = useAuth();
  const href = useHref();
  const t = COPY[lang] ?? COPY.en;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/schools/insights", { headers: { Authorization: `Bearer ${idToken}` } });
        if (!res.ok) { if (!cancelled) setError(true); return; }
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const teacherLinkFor = useMemo(
    () => (code: string) =>
      typeof window === "undefined" ? `https://gadit.app/t/${code}` : `${window.location.origin}/t/${code}`,
    [],
  );

  async function copyTeacherLink(code: string) {
    try {
      await navigator.clipboard.writeText(teacherLinkFor(code));
      setCopiedCode(code);
      setTimeout(() => setCopiedCode((cur) => (cur === code ? null : cur)), 1600);
    } catch { /* clipboard blocked; no-op */ }
  }

  if (loading) return <p style={{ color: "#78716C", fontSize: 15 }}>{t.loading}</p>;
  if (error || !data) return <p style={{ color: "#B45309", fontSize: 15 }}>{t.error}</p>;

  if (data.classroomCount === 0) {
    return <p style={{ color: "#78716C", fontSize: 15 }}>{t.empty}</p>;
  }
  if (data.totalAllTime === 0 && data.sampleSize === 0) {
    // Classrooms exist but no lookups yet — don't tell them to add a classroom.
    return <p style={{ color: "#78716C", fontSize: 15 }}>{t.emptyNoActivity}</p>;
  }

  return (
    <div>
      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 14 }}>
        <div style={statMustard}>
          <span aria-hidden="true" style={{ position: "absolute", insetInlineEnd: -18, top: -18, width: 84, height: 84, borderRadius: "50%", background: "rgba(14,165,165,0.06)" }} />
          <div style={{ ...statLabel, position: "relative" }}>{t.totalLabel}</div>
          <div style={{ ...statNum, position: "relative" }}>{data.totalAllTime.toLocaleString()}</div>
        </div>
        <div style={statTeal}>
          <span aria-hidden="true" style={{ position: "absolute", insetInlineEnd: -18, top: -18, width: 84, height: 84, borderRadius: "50%", background: "rgba(14,165,165,0.06)" }} />
          <div style={{ ...statLabel, position: "relative" }}>{t.classroomsLabel}</div>
          <div style={{ ...statNum, position: "relative" }}>{data.classroomCount}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {/* School-wide language map */}
        <div style={card}>
          <div style={label}>{t.langMapTitle}</div>
          <p style={sub}>{t.langMapSub}</p>
          {data.languages.length === 0 ? (
            <p style={{ fontSize: 13, color: "#A8A29E", margin: 0 }}>{t.notEnough}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
              {data.languages.map((l) => (
                <div key={l.lang} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1C1917", minWidth: 78 }}>{classroomLangLabel(l.lang)}</span>
                  <span style={{ flex: 1, height: 8, background: "#F0EEEB", borderRadius: 999, overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: `${Math.max(l.pct, 3)}%`, background: "#0EA5A5", borderRadius: 999 }} />
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#78716C", minWidth: 34, textAlign: "end" }}>{l.pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* School-wide stuck words */}
        <div style={card}>
          <div style={label}>{t.stuckTitle}</div>
          <p style={sub}>{t.stuckSub}</p>
          {data.topWords.length === 0 ? (
            <p style={{ fontSize: 13, color: "#A8A29E", margin: 0 }}>{t.notEnough}</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {data.topWords.map((w) => (
                <Link key={w.word} href={href(`/word/${encodeURIComponent(w.word)}`)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "#ECFEFF", border: "1px solid #A5F3F0", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 600, color: "#0E7490" }}>
                  <span>{w.word}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "#0EA5A5", borderRadius: 999, padding: "1px 7px" }}>{w.count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <p style={{ fontSize: 12, color: "#A8A29E", margin: "10px 2px 0" }}>{t.basedOn(data.sampleSize)}</p>

      {/* Classrooms by activity */}
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1C1917", margin: "28px 0 12px" }}>{t.classroomsTitle}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.classrooms.map((cls) => (
          <div key={cls.id} style={{ ...card, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ width: 12, height: 12, borderRadius: 999, flexShrink: 0, background: classroomColorFor({ colorIndex: cls.colorIndex }) }} />
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1C1917" }}>{cls.name || cls.code}</div>
              <div style={{ fontSize: 12.5, color: "#78716C" }}>
                <span dir="ltr" style={{ fontFamily: "ui-monospace, monospace", letterSpacing: "0.06em" }}>{cls.code}</span>
                {cls.topLanguage ? ` · ${classroomLangLabel(cls.topLanguage)}` : ""}
              </div>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0EA5A5", minWidth: 90, textAlign: "center" }}>
              {cls.totalAllTime.toLocaleString()} {t.lookups}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href={href(`/classroom/${cls.id}`)} style={btnPrimary}>{t.open}</Link>
              <button type="button" onClick={() => copyTeacherLink(cls.code)} style={btnGhost}>
                {copiedCode === cls.code ? t.teacherLinkCopied : t.teacherLink}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const card: React.CSSProperties = { background: "#fff", border: "1px solid #EAE7E3", borderRadius: 16, padding: "18px 20px" };
const label: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#1C1917", marginBottom: 4 };
const sub: React.CSSProperties = { fontSize: 12.5, color: "#78716C", lineHeight: 1.45, margin: "0 0 12px" };
// Vibrant KPI cards (modern school dashboard, Gadi 2026-08-23).
// Clean Gadit-brand KPI cards: light surface, teal number, quiet border — the
// same restrained look as the rest of Gadit (Gadi 2026-08-25: drop the loud
// mustard/teal gradients, keep it clean and on-brand).
const statBase: React.CSSProperties = { borderRadius: 16, padding: "18px 20px", border: "1px solid var(--rule, #E7E5E4)", background: "var(--surface, #fff)", color: "var(--ink, #1C1917)", display: "flex", flexDirection: "column", gap: 4, position: "relative", overflow: "hidden", boxShadow: "0 1px 2px rgba(16,24,40,0.04)" };
const statMustard: React.CSSProperties = { ...statBase };
const statTeal: React.CSSProperties = { ...statBase };
const statNum: React.CSSProperties = { fontSize: 38, fontWeight: 800, color: "#0EA5A5", lineHeight: 1.05, fontVariantNumeric: "tabular-nums" };
const statLabel: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--ink-soft, #78716C)" };
const btnPrimary: React.CSSProperties = { background: "#0EA5A5", color: "#fff", borderRadius: 9, padding: "7px 14px", fontSize: 13, fontWeight: 700, textDecoration: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" };
const btnGhost: React.CSSProperties = { background: "#fff", color: "#0E7490", borderRadius: 9, padding: "7px 14px", fontSize: 13, fontWeight: 700, border: "1px solid #A5F3F0", cursor: "pointer", whiteSpace: "nowrap" };

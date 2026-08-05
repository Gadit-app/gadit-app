"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHref } from "@/lib/href";
import { useLang } from "@/lib/lang-context";
import { setsBySubject, type WordSet } from "@/lib/word-sets";

/**
 * /sets — themed vocabulary sets for teachers (schools council 2026-08-05).
 * Browse curated word groups by subject; "Present to class" opens the
 * first word in present mode with ?set= so the teacher steps through the
 * whole set on the classroom screen. A single word chip opens just that
 * word. Content lives in lib/word-sets.ts.
 */

const COPY: Record<string, { title: string; sub: string; present: string; words: string }> = {
  he: {
    title: "קבוצות מילים",
    sub: "בוחרים נושא, פותחים קבוצה, ומקרינים לכיתה. גדית מסביר כל מילה עם תמונה ודוגמאות.",
    present: "הצגה בכיתה",
    words: "מילים",
  },
  en: {
    title: "Word sets",
    sub: "Pick a subject, open a set, and project it to the class. Gadit explains each word with a picture and examples.",
    present: "Present to class",
    words: "words",
  },
};

export default function SetsClient() {
  const href = useHref();
  const router = useRouter();
  const { lang, dir } = useLang();
  const c = COPY[lang] ?? COPY.en;
  const groups = setsBySubject();

  const presentSet = (set: WordSet) =>
    router.push(href(`/word/${encodeURIComponent(set.words[0])}?present=1&set=${encodeURIComponent(set.id)}`));

  return (
    <div dir={dir} style={S.page}>
      <header style={S.header}>
        <Link href={href("/")} style={S.wordmark} dir="ltr" aria-label="Gadit home">
          Gad<span style={{ fontStyle: "italic" }}>it</span>
        </Link>
      </header>

      <main style={S.main}>
        <h1 style={S.h1}>{c.title}</h1>
        <p style={S.subtitle}>{c.sub}</p>

        {groups.map((g) => (
          <section key={g.key} style={S.section}>
            <h2 style={S.h2}>{g.he}</h2>
            <div style={S.grid}>
              {g.sets.map((set) => (
                <div key={set.id} style={S.card}>
                  <div style={S.cardHead}>
                    <span style={S.cardTitle}>{set.title}</span>
                    {set.grade && <span style={S.grade}>{set.grade}</span>}
                  </div>
                  <div style={S.chips} dir={set.lang === "en" ? "ltr" : "rtl"}>
                    {set.words.map((w) => (
                      <Link
                        key={w}
                        href={href(`/word/${encodeURIComponent(w)}?present=1&set=${encodeURIComponent(set.id)}`)}
                        style={S.chip}
                      >
                        {w}
                      </Link>
                    ))}
                  </div>
                  <button type="button" style={S.presentBtn} onClick={() => presentSet(set)}>
                    {c.present}
                    <span style={{ fontSize: 12, opacity: 0.85 }}>· {set.words.length} {c.words}</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: "100dvh", background: "#f6f4ee", color: "#1f2937" },
  header: { padding: "18px 24px", borderBottom: "1px solid rgba(31,41,55,0.06)" },
  wordmark: { fontWeight: 800, fontSize: 20, color: "#1f2937", textDecoration: "none", letterSpacing: "-0.02em" },
  main: { maxWidth: 1080, margin: "0 auto", padding: "28px 20px 64px" },
  h1: { fontSize: 30, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.01em" },
  subtitle: { color: "#6b7280", fontSize: 15.5, margin: "0 0 28px", maxWidth: 640 },
  section: { marginBottom: 34 },
  h2: { fontSize: 20, fontWeight: 800, margin: "0 0 14px", color: "#0b7d7d" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 },
  card: { background: "#fff", border: "1px solid rgba(31,41,55,0.08)", borderRadius: 16, padding: "16px 16px 14px", display: "flex", flexDirection: "column", gap: 12 },
  cardHead: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 },
  cardTitle: { fontWeight: 700, fontSize: 16.5 },
  grade: { fontSize: 12.5, fontWeight: 700, color: "#9CA3AF", flexShrink: 0 },
  chips: { display: "flex", flexWrap: "wrap", gap: 6 },
  chip: { fontSize: 13.5, fontWeight: 600, color: "#374151", background: "#F3F4F6", borderRadius: 8, padding: "4px 9px", textDecoration: "none", border: "1px solid transparent" },
  presentBtn: { marginTop: 2, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 14px", borderRadius: 12, border: "none", background: "#0EA5A5", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" },
};

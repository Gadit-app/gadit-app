"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useAdminContext } from "../admin-context";
import { classroomLangLabel } from "@/lib/classroom-insights";

/**
 * Admin · Schools — the cross-school console.
 *
 * List view: every school ranked by activity (name, contact, plan, classrooms,
 * total lookups). Click one to drop into that school's dashboard exactly as its
 * principal sees it: overview KPIs, top words, classrooms, and every student
 * with the words they looked up. Answers both of Gadi's asks — "walk into
 * Sharon's dashboard" and "see all schools as administrator."
 *
 * Auth: gated by the AdminShell secret to render, then sends the admin's
 * Firebase ID token to /api/admin/schools (ADMIN_EMAILS check server-side).
 */

const ADMIN_EMAIL = "gadibenlavi@gmail.com";

type SchoolRow = {
  id: string;
  name: string;
  contactEmail: string | null;
  plan: string;
  createdAt: string | null;
  classroomCount: number;
  totalSearches: number;
};

type WordCount = { word: string; count: number };
type LangCount = { lang: string; count: number; pct: number };

type ClassroomRow = {
  id: string;
  name: string;
  code: string;
  colorIndex: number;
  totalAllTime: number;
  sampleSize: number;
  topLanguage: string;
};

type StudentRow = {
  name: string;
  classroomId: string;
  classroomName: string;
  code: string;
  colorIndex: number;
  count: number;
  topLanguage: string;
  words: WordCount[];
};

type SchoolDetail = {
  school: { id: string; name: string; contactEmail: string | null; plan: string; createdAt: string | null };
  totalAllTime: number;
  classroomCount: number;
  languages: LangCount[];
  topWords: WordCount[];
  sampleSize: number;
  classrooms: ClassroomRow[];
  students: StudentRow[];
};

const COPY = {
  en: {
    title: "Schools",
    subtitle: (n: number, s: number) => `${n} schools · ${s.toLocaleString()} lookups all-time`,
    loading: "Loading…",
    signInAdmin: "Sign in as admin",
    notAdmin: "This account is not an administrator.",
    empty: "No schools yet. Schools appear here after the first Schools checkout.",
    colSchool: "School",
    colContact: "Contact",
    colPlan: "Plan",
    colClasses: "Classes",
    colLookups: "Lookups",
    unnamed: "(unnamed school)",
    back: "All schools",
    kpiLookups: "Total lookups",
    kpiClasses: "Classrooms",
    kpiLanguages: "Languages",
    kpiSample: "Recent sample",
    topWords: "Most-searched words",
    classrooms: "Classrooms",
    students: "Students",
    noStudents: "No named student activity yet.",
    noWords: "No words in the recent window.",
    wordsFor: (n: string) => `Words ${n} looked up`,
    searchesLabel: "searches",
    tapStudent: "Tap a student to see the words they looked up.",
  },
  he: {
    title: "בתי ספר",
    subtitle: (n: number, s: number) => `${n} בתי ספר · ${s.toLocaleString()} חיפושים מאז ומעולם`,
    loading: "טוען…",
    signInAdmin: "התחבר כאדמין",
    notAdmin: "החשבון הזה אינו מנהל מערכת.",
    empty: "אין עדיין בתי ספר. בית ספר יופיע כאן אחרי הרכישה הראשונה.",
    colSchool: "בית ספר",
    colContact: "איש קשר",
    colPlan: "מסלול",
    colClasses: "כיתות",
    colLookups: "חיפושים",
    unnamed: "(בית ספר ללא שם)",
    back: "כל בתי הספר",
    kpiLookups: "סך חיפושים",
    kpiClasses: "כיתות",
    kpiLanguages: "שפות",
    kpiSample: "מדגם אחרון",
    topWords: "המילים המחופשות ביותר",
    classrooms: "כיתות",
    students: "תלמידים",
    noStudents: "אין עדיין פעילות תלמידים עם שם.",
    noWords: "אין מילים בחלון האחרון.",
    wordsFor: (n: string) => `מילים ש${n} חיפש`,
    searchesLabel: "חיפושים",
    tapStudent: "הקש על תלמיד כדי לראות אילו מילים חיפש.",
  },
};

const CLASS_COLORS = ["#0EA5A5", "#7C3AED", "#EA580C", "#DB2777", "#2563EB", "#16A34A", "#CA8A04", "#DC2626"];
function classColor(i: number) {
  return CLASS_COLORS[((i % CLASS_COLORS.length) + CLASS_COLORS.length) % CLASS_COLORS.length];
}

export default function AdminSchoolsClient() {
  const { user, loading: authLoading, promptLogin } = useAuth();
  const { lang } = useAdminContext();
  const t = COPY[lang];
  const dir: "rtl" | "ltr" = lang === "he" ? "rtl" : "ltr";

  const [list, setList] = useState<{ schools: SchoolRow[]; totalSchools: number; totalSearches: number } | null>(null);
  const [detail, setDetail] = useState<SchoolDetail | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openStudent, setOpenStudent] = useState<string | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const loadList = useCallback(async () => {
    if (!user || !isAdmin) return;
    setLoading(true);
    setError("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/admin/schools", { headers: { Authorization: `Bearer ${idToken}` } });
      if (!res.ok) throw new Error("HTTP " + res.status);
      setList(await res.json());
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const loadDetail = useCallback(
    async (schoolId: string) => {
      if (!user || !isAdmin) return;
      setLoading(true);
      setError("");
      setOpenStudent(null);
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(`/api/admin/schools?schoolId=${encodeURIComponent(schoolId)}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        setDetail(await res.json());
      } catch (e) {
        setError(String(e instanceof Error ? e.message : e));
      } finally {
        setLoading(false);
      }
    },
    [user, isAdmin],
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      promptLogin(t.signInAdmin);
      return;
    }
    if (selected) loadDetail(selected);
    else loadList();
  }, [authLoading, user, promptLogin, selected, loadList, loadDetail, t.signInAdmin]);

  const openSchool = (id: string) => {
    setDetail(null);
    setSelected(id);
  };
  const goBack = () => {
    setSelected(null);
    setDetail(null);
  };

  if (!authLoading && user && !isAdmin) {
    return <div style={{ color: "#991B1B", fontSize: 14 }}>{t.notAdmin}</div>;
  }

  // ---------- Detail view ----------
  if (selected) {
    return (
      <div dir={dir}>
        <button onClick={goBack} style={backBtn}>
          {dir === "rtl" ? "→ " : "← "}
          {t.back}
        </button>
        {loading && <div style={{ color: "#6B7280", fontSize: 14, marginTop: 16 }}>{t.loading}</div>}
        {error && <div style={errBox}>{error}</div>}
        {detail && (
          <>
            <div style={{ marginTop: 8, marginBottom: 20 }}>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#111827" }} dir="auto">
                {detail.school.name || t.unnamed}
              </h1>
              <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }} dir="ltr">
                {detail.school.contactEmail || detail.school.id}
                {detail.school.plan ? ` · ${detail.school.plan}` : ""}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
              <Kpi label={t.kpiLookups} value={detail.totalAllTime} accent="#0EA5A5" />
              <Kpi label={t.kpiClasses} value={detail.classroomCount} />
              <Kpi label={t.kpiLanguages} value={detail.languages.length} accent="#7C3AED" />
              <Kpi label={t.kpiSample} value={detail.sampleSize} />
            </div>

            {/* Top words */}
            {detail.topWords.length > 0 && (
              <Section title={t.topWords}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {detail.topWords.map((w) => (
                    <a
                      key={w.word}
                      href={`/word/${encodeURIComponent(w.word)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={chip}
                      dir="auto"
                    >
                      {w.word}
                      <span style={{ color: "#0E7490", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{w.count}</span>
                    </a>
                  ))}
                </div>
              </Section>
            )}

            {/* Classrooms */}
            {detail.classrooms.length > 0 && (
              <Section title={t.classrooms}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                  {detail.classrooms.map((c) => (
                    <div key={c.id} style={{ ...card, borderInlineStart: `4px solid ${classColor(c.colorIndex)}` }}>
                      <div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }} dir="auto">
                        {c.name || c.code}
                      </div>
                      <div style={{ color: "#6B7280", fontSize: 12, marginTop: 4, display: "flex", gap: 8 }}>
                        <span style={{ fontVariantNumeric: "tabular-nums" }}>{c.totalAllTime.toLocaleString()} {t.searchesLabel}</span>
                        {c.topLanguage && <span>· {classroomLangLabel(c.topLanguage)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Students */}
            <Section title={t.students}>
              {detail.students.length === 0 ? (
                <div style={emptyBox}>{t.noStudents}</div>
              ) : (
                <>
                  <p style={{ color: "#9CA3AF", fontSize: 12, margin: "0 0 10px" }}>{t.tapStudent}</p>
                  <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                    {detail.students.map((s) => {
                      const key = `${s.classroomId}:${s.name}`;
                      const open = openStudent === key;
                      return (
                        <div key={key} style={{ borderTop: "1px solid #F3F4F6" }}>
                          <button
                            onClick={() => setOpenStudent(open ? null : key)}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "12px 16px",
                              background: open ? "#F9FAFB" : "white",
                              border: "none",
                              cursor: "pointer",
                              textAlign: dir === "rtl" ? "right" : "left",
                            }}
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: classColor(s.colorIndex),
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontWeight: 600, color: "#111827", fontSize: 14 }} dir="auto">
                              {s.name}
                            </span>
                            <span style={{ color: "#9CA3AF", fontSize: 12 }} dir="auto">
                              {s.classroomName || s.code}
                            </span>
                            <span style={{ marginInlineStart: "auto", display: "flex", gap: 10, alignItems: "center" }}>
                              {s.topLanguage && (
                                <span style={{ color: "#6B7280", fontSize: 12 }}>{classroomLangLabel(s.topLanguage)}</span>
                              )}
                              <span style={{ color: "#0E7490", fontWeight: 700, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
                                {s.count.toLocaleString()}
                              </span>
                              <span style={{ color: "#9CA3AF", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
                            </span>
                          </button>
                          {open && (
                            <div style={{ padding: "0 16px 14px" }}>
                              {s.words.length === 0 ? (
                                <div style={{ color: "#9CA3AF", fontSize: 13, padding: "4px 0" }}>{t.noWords}</div>
                              ) : (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                  {s.words.map((w) => (
                                    <a
                                      key={w.word}
                                      href={`/word/${encodeURIComponent(w.word)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{ ...chip, fontSize: 13, padding: "5px 10px" }}
                                      dir="auto"
                                    >
                                      {w.word}
                                      {w.count > 1 && (
                                        <span style={{ color: "#0E7490", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                                          {w.count}
                                        </span>
                                      )}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Section>
          </>
        )}
      </div>
    );
  }

  // ---------- List view ----------
  return (
    <div dir={dir}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
        <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }}>
          {loading ? t.loading : list ? t.subtitle(list.totalSchools, list.totalSearches) : ""}
        </p>
      </div>

      {error && <div style={errBox}>{error}</div>}

      {list && list.schools.length === 0 && <div style={emptyBox}>{t.empty}</div>}

      {list && list.schools.length > 0 && (
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#F9FAFB" }}>
              <tr>
                <th style={th}>{t.colSchool}</th>
                <th style={th}>{t.colContact}</th>
                <th style={th}>{t.colPlan}</th>
                <th style={{ ...th, textAlign: "end" }}>{t.colClasses}</th>
                <th style={{ ...th, textAlign: "end" }}>{t.colLookups}</th>
              </tr>
            </thead>
            <tbody>
              {list.schools.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => openSchool(s.id)}
                  style={{ borderTop: "1px solid #F3F4F6", cursor: "pointer" }}
                >
                  <td style={{ ...td, color: "#111827", fontWeight: 600 }} dir="auto">
                    {s.name || t.unnamed}
                  </td>
                  <td style={{ ...td, color: "#6B7280", fontSize: 13 }} dir="ltr">
                    {s.contactEmail || "—"}
                  </td>
                  <td style={{ ...td, color: "#6B7280", fontSize: 13 }}>{s.plan || "—"}</td>
                  <td style={{ ...td, textAlign: "end", fontVariantNumeric: "tabular-nums", color: "#374151" }}>
                    {s.classroomCount}
                  </td>
                  <td style={{ ...td, textAlign: "end", fontVariantNumeric: "tabular-nums", color: "#0E7490", fontWeight: 700 }}>
                    {s.totalSearches.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent ?? "#111827", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", letterSpacing: 0.5, textTransform: "uppercase", margin: "0 0 12px" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

const th: React.CSSProperties = { padding: "10px 16px", textAlign: "start", fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: 0.5, textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "12px 16px", fontSize: 14, textAlign: "start" };
const card: React.CSSProperties = { background: "white", border: "1px solid #E5E7EB", borderRadius: 10, padding: 12 };
const chip: React.CSSProperties = {
  display: "inline-flex",
  gap: 6,
  alignItems: "center",
  padding: "6px 12px",
  borderRadius: 999,
  background: "#F3F4F6",
  color: "#374151",
  fontSize: 14,
  fontWeight: 500,
  textDecoration: "none",
};
const backBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#0E7490",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  padding: 0,
};
const errBox: React.CSSProperties = { background: "#FEF2F2", color: "#991B1B", padding: 12, borderRadius: 8, margin: "16px 0", fontSize: 14 };
const emptyBox: React.CSSProperties = { background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 32, textAlign: "center", color: "#6B7280", fontSize: 14 };

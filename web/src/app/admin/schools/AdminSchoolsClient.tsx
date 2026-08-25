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
  ownerSearches: number;
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
  loggedCount?: number;
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
  school: { id: string; name: string; contactEmail: string | null; plan: string; createdAt: string | null; ownerSearches: number };
  totalAllTime: number;
  classroomCount: number;
  languages: LangCount[];
  topWords: WordCount[];
  sampleSize: number;
  loggedTotal: number;
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
    colLookups: "Classroom",
    colOwner: "Owner",
    kpiOwner: "Owner's own lookups",
    unnamed: "(unnamed school)",
    back: "All schools",
    kpiLookups: "Counter total",
    kpiLogged: "Logged searches",
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
    loggedLabel: "logged",
    tapStudent: "Tap a student to see the words they looked up.",
    mismatchNote: "Counter total and logged searches differ. If logged is 0, no searches ever came through the /c/CODE classroom flow for this school.",
    del: "Delete",
    delTitle: "Delete this school?",
    delBody: (n: string) => `This permanently removes "${n}" and all its classrooms and search logs. It does not cancel any Stripe subscription. Type DELETE to confirm.`,
    delConfirm: "Delete school",
    delCancel: "Cancel",
    deleting: "Deleting…",
    mergeBtn: "Merge into another school",
    mergeTitle: "Merge this school into another",
    mergeLead: "Every classroom and search log here moves into the school you pick, then this record is deleted. Classroom codes keep working. Billing is untouched. Pick the school to KEEP (usually the one with the active subscription).",
    mergePickPlaceholder: "Choose the school to keep…",
    mergeConfirm: "Merge",
    mergeCancel: "Cancel",
    merging: "Merging…",
    mergeDone: (c: number, s: number) => `Merged ${c} classrooms and ${s} searches.`,
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
    colLookups: "כיתתי",
    colOwner: "בעלים",
    kpiOwner: "חיפושי בעל החשבון",
    unnamed: "(בית ספר ללא שם)",
    back: "כל בתי הספר",
    kpiLookups: "מונה (searchCount)",
    kpiLogged: "חיפושים שנרשמו",
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
    loggedLabel: "נרשמו",
    tapStudent: "הקש על תלמיד כדי לראות אילו מילים חיפש.",
    mismatchNote: "המונה (searchCount) והחיפושים שנרשמו בפועל שונים. אם 'נרשמו' הוא 0, אף חיפוש לא עבר דרך זרימת הכיתה /c/CODE בבית ספר הזה.",
    del: "מחיקה",
    delTitle: "למחוק את בית הספר?",
    delBody: (n: string) => `פעולה זו מוחקת לצמיתות את "${n}" וכל הכיתות ויומני החיפוש שלו. היא לא מבטלת מנוי Stripe. הקלד DELETE כדי לאשר.`,
    delConfirm: "מחק בית ספר",
    delCancel: "ביטול",
    deleting: "מוחק…",
    mergeBtn: "מזג לבית ספר אחר",
    mergeTitle: "מיזוג בית הספר הזה לתוך אחר",
    mergeLead: "כל הכיתות ויומני החיפוש כאן עוברים לבית הספר שתבחר, ואז הרשומה הזו נמחקת. קודי הכיתות ממשיכים לעבוד. החיוב לא מושפע. בחר את בית הספר שיישאר (בדרך כלל זה עם המנוי הפעיל).",
    mergePickPlaceholder: "בחר את בית הספר שיישאר…",
    mergeConfirm: "מזג",
    mergeCancel: "ביטול",
    merging: "ממזג…",
    mergeDone: (c: number, s: number) => `מוזגו ${c} כיתות ו-${s} חיפושים.`,
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
  const [delTarget, setDelTarget] = useState<SchoolRow | null>(null);
  const [delText, setDelText] = useState("");
  const [delBusy, setDelBusy] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeInto, setMergeInto] = useState("");
  const [mergeBusy, setMergeBusy] = useState(false);

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
    if (selected) {
      loadDetail(selected);
      if (!list) loadList(); // keep the merge-target picker populated
    } else {
      loadList();
    }
    // list intentionally excluded: we only want the top-up load once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, promptLogin, selected, loadList, loadDetail, t.signInAdmin]);

  const deleteSchool = async () => {
    if (!user || !delTarget || delBusy) return;
    setDelBusy(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/admin/schools?schoolId=${encodeURIComponent(delTarget.id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      setDelTarget(null);
      setDelText("");
      loadList();
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setDelBusy(false);
    }
  };

  const mergeSchools = async () => {
    if (!user || !selected || !mergeInto || mergeBusy) return;
    setMergeBusy(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/admin/schools/merge", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: selected, targetId: mergeInto }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      setMergeOpen(false);
      setMergeInto("");
      // Source is gone; jump to the surviving target's detail.
      setDetail(null);
      setSelected(mergeInto);
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setMergeBusy(false);
    }
  };

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
              <button
                onClick={() => { setMergeInto(""); setMergeOpen(true); }}
                style={{ marginTop: 10, padding: "8px 14px", borderRadius: 8, border: "1px solid #7C3AED", background: "#F5F3FF", color: "#6D28D9", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                {t.mergeBtn}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 12 }}>
              <Kpi label={t.kpiOwner} value={detail.school.ownerSearches} accent="#7C3AED" />
              <Kpi label={t.kpiLookups} value={detail.totalAllTime} accent="#0EA5A5" />
              <Kpi label={t.kpiLogged} value={detail.loggedTotal} accent={detail.loggedTotal !== detail.totalAllTime ? "#DC2626" : "#0EA5A5"} />
              <Kpi label={t.kpiClasses} value={detail.classroomCount} />
              <Kpi label={t.kpiSample} value={detail.sampleSize} />
            </div>
            {detail.loggedTotal !== detail.totalAllTime && (
              <div style={{ background: "#FDE7E7", color: "#991B1B", padding: 12, borderRadius: 8, marginBottom: 24, fontSize: 13 }}>
                {t.mismatchNote}
              </div>
            )}

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
                      <div style={{ color: "#6B7280", fontSize: 12, marginTop: 4, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontVariantNumeric: "tabular-nums" }}>{c.totalAllTime.toLocaleString()} {t.searchesLabel}</span>
                        <span
                          style={{ fontVariantNumeric: "tabular-nums", color: (c.loggedCount ?? 0) !== c.totalAllTime ? "#DC2626" : "#6B7280" }}
                        >
                          · {(c.loggedCount ?? 0).toLocaleString()} {t.loggedLabel}
                        </span>
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

        {mergeOpen && (
          <div
            onClick={() => !mergeBusy && setMergeOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 14, padding: 24, maxWidth: 460, width: "100%" }} dir={dir}>
              <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#111827" }}>{t.mergeTitle}</h3>
              <p style={{ color: "#4B5563", fontSize: 14, lineHeight: 1.5, margin: "0 0 16px" }}>{t.mergeLead}</p>
              <select
                value={mergeInto}
                onChange={(e) => setMergeInto(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 14, marginBottom: 16, background: "white" }}
              >
                <option value="">{t.mergePickPlaceholder}</option>
                {(list?.schools ?? [])
                  .filter((s) => s.id !== selected)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {(s.name || s.contactEmail || s.id)}{s.plan ? ` (${s.plan})` : ""}
                    </option>
                  ))}
              </select>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setMergeOpen(false)}
                  disabled={mergeBusy}
                  style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  {t.mergeCancel}
                </button>
                <button
                  onClick={mergeSchools}
                  disabled={mergeBusy || !mergeInto}
                  style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: mergeInto ? "#7C3AED" : "#C4B5FD", color: "white", fontSize: 14, fontWeight: 700, cursor: mergeInto ? "pointer" : "not-allowed" }}
                >
                  {mergeBusy ? t.merging : t.mergeConfirm}
                </button>
              </div>
            </div>
          </div>
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
                <th style={{ ...th, textAlign: "end" }}>{t.colOwner}</th>
                <th style={th}></th>
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
                  <td style={{ ...td, textAlign: "end", fontVariantNumeric: "tabular-nums", color: "#7C3AED", fontWeight: 700 }}>
                    {s.ownerSearches.toLocaleString()}
                  </td>
                  <td style={{ ...td, textAlign: "end", width: 40 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDelTarget(s); setDelText(""); }}
                      title={t.del}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", fontSize: 13, padding: "4px 6px" }}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {delTarget && (
        <div
          onClick={() => !delBusy && setDelTarget(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 14, padding: 24, maxWidth: 440, width: "100%" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#111827" }}>{t.delTitle}</h3>
            <p style={{ color: "#4B5563", fontSize: 14, lineHeight: 1.5, margin: "0 0 16px" }}>
              {t.delBody(delTarget.name || delTarget.contactEmail || delTarget.id)}
            </p>
            <input
              value={delText}
              onChange={(e) => setDelText(e.target.value)}
              placeholder="DELETE"
              dir="ltr"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 14, marginBottom: 16, outline: "none" }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setDelTarget(null)}
                disabled={delBusy}
                style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                {t.delCancel}
              </button>
              <button
                onClick={deleteSchool}
                disabled={delBusy || delText.trim() !== "DELETE"}
                style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: delText.trim() === "DELETE" ? "#DC2626" : "#FCA5A5", color: "white", fontSize: 14, fontWeight: 700, cursor: delText.trim() === "DELETE" ? "pointer" : "not-allowed" }}
              >
                {delBusy ? t.deleting : t.delConfirm}
              </button>
            </div>
          </div>
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

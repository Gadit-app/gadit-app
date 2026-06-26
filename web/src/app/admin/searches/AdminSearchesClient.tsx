"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminContext } from "../admin-context";

type WordRow = {
  word: string;
  count: number;
  lastAt: string | null;
};

type LangStats = {
  totalSearches: number;
  uniqueWords: number;
};

type ApiResponse = {
  totals: {
    totalSearches: number;
    uniqueWords: number;
    byLang: Record<string, LangStats>;
  };
  byLang: Record<string, WordRow[]>;
};

type AdminLang = "en" | "he";
const ADMIN_LANG_KEY = "gadit_admin_lang_v1";
const SECRET_KEY = "gadit_admin_secret_v1";

// Order the language tabs the way the marketing site lists them. Any
// language present in the API but missing here will be appended at the
// end alphabetically.
const LANG_ORDER = ["he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja"];

const LANG_LABEL: Record<string, string> = {
  he: "עברית",
  en: "English",
  ar: "العربية",
  ru: "Русский",
  es: "Español",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
  cs: "Čeština",
  sk: "Slovenčina",
  it: "Italiano",
  ja: "日本語",
};

const STRINGS: Record<AdminLang, {
  title: string;
  loading: string;
  signOut: string;
  langToggle: string;
  unlockTitle: string;
  unlockBody: string;
  unlockCta: string;
  unlockPlaceholder: string;
  statTotalSearches: string;
  statUniqueWords: string;
  statLanguages: string;
  noLangData: string;
  colRank: string;
  colWord: string;
  colCount: string;
  colLastSeen: string;
  emptyState: string;
  downloadCsv: string;
  historicCsv: string;
  historicLoading: string;
  historicHint: string;
  searchPlaceholder: string;
  showingFooter: (n: number, total: number) => string;
}> = {
  en: {
    title: "Activity",
    loading: "Loading…",
    signOut: "Sign out",
    langToggle: "עברית",
    unlockTitle: "Admin · Searches",
    unlockBody: "Enter ADMIN_SECRET to view search analytics.",
    unlockCta: "Unlock",
    unlockPlaceholder: "ADMIN_SECRET",
    statTotalSearches: "Total searches",
    statUniqueWords: "Unique words",
    statLanguages: "Languages",
    noLangData: "No data yet for this language.",
    colRank: "#",
    colWord: "Word",
    colCount: "Searches",
    colLastSeen: "Last search",
    emptyState: "No searches recorded yet. The counter starts on the next /api/define hit after this code deploys.",
    downloadCsv: "Download CSV (with counts)",
    historicCsv: "Download historic CSV (all-time, no counts)",
    historicLoading: "Loading historic…",
    historicHint: "Historic = every word ever cached (anyone-ever-searched), no popularity. Counter-based table above is for searches made since the counter shipped.",
    searchPlaceholder: "Filter words…",
    showingFooter: (n, total) => `Showing ${n} of ${total} words.`,
  },
  he: {
    title: "פעילות",
    loading: "טוען…",
    signOut: "התנתקות",
    langToggle: "English",
    unlockTitle: "אדמין · חיפושים",
    unlockBody: "הכנס ADMIN_SECRET לצפייה באנליטיקת חיפושים.",
    unlockCta: "פתיחה",
    unlockPlaceholder: "ADMIN_SECRET",
    statTotalSearches: "סך חיפושים",
    statUniqueWords: "מילים ייחודיות",
    statLanguages: "שפות",
    noLangData: "אין עדיין נתונים לשפה זו.",
    colRank: "#",
    colWord: "מילה",
    colCount: "חיפושים",
    colLastSeen: "חיפוש אחרון",
    emptyState: "אין עדיין חיפושים. המונה מתחיל בחיפוש הבא לאחר שהקוד יעלה לפרודקשן.",
    downloadCsv: "הורד CSV (עם ספירות)",
    historicCsv: "הורד CSV היסטורי (כל הזמן, בלי ספירות)",
    historicLoading: "טוען היסטוריה…",
    historicHint: "היסטורי = כל מילה שאי פעם נשמרה במטמון (מישהו פעם חיפש), ללא פופולריות. הטבלה עם הספירות למעלה היא רק מהרגע שהמונה עלה.",
    searchPlaceholder: "סנן מילים…",
    showingFooter: (n, total) => `מציג ${n} מתוך ${total} מילים.`,
  },
};

function formatRelative(iso: string | null, lang: AdminLang): string {
  if (!iso) return ", ";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return lang === "he" ? "עכשיו" : "now";
  if (diff < 3_600_000) {
    const m = Math.floor(diff / 60_000);
    return lang === "he" ? `לפני ${m} ד׳` : `${m}m ago`;
  }
  if (diff < 86_400_000) {
    const h = Math.floor(diff / 3_600_000);
    return lang === "he" ? `לפני ${h} ש׳` : `${h}h ago`;
  }
  if (diff < 7 * 86_400_000) {
    const dys = Math.floor(diff / 86_400_000);
    return lang === "he" ? `לפני ${dys} ימים` : `${dys}d ago`;
  }
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function csvEscape(s: string): string {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function buildCsv(rows: WordRow[]): string {
  const lines = ["rank,word,count,lastAt"];
  rows.forEach((r, i) => {
    lines.push([i + 1, csvEscape(r.word), r.count, r.lastAt ?? ""].join(","));
  });
  return lines.join("\n") + "\n";
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export default function AdminSearchesClient() {
  // Secret + lang come from the AdminShell context (layout.tsx). The
  // shell renders the unlock gate, sidebar, lang toggle, and sign-out;
  // this page just consumes the values and fetches its data.
  const { secret, lang: adminLang } = useAdminContext();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<string>("he");
  const [filter, setFilter] = useState("");
  const [historicLoading, setHistoricLoading] = useState(false);
  const t = STRINGS[adminLang];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetch(`/api/admin/searches?secret=${encodeURIComponent(secret)}&limit=500`)
      .then(async (r) => {
        if (r.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem(SECRET_KEY);
            window.location.reload();
          }
          throw new Error("Wrong secret.");
        }
        if (!r.ok) {
          const j = (await r.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error ?? `HTTP ${r.status}`);
        }
        return r.json() as Promise<ApiResponse>;
      })
      .then((j) => {
        setData(j);
        // Pick the first language tab that actually has data, falling
        // back to whatever's currently active so a refresh after the
        // user picked English doesn't snap back to Hebrew.
        const hasActive = j.byLang[activeLang]?.length;
        if (!hasActive) {
          const langs = Object.keys(j.byLang).sort(
            (a, b) => (j.totals.byLang[b]?.totalSearches ?? 0) - (j.totals.byLang[a]?.totalSearches ?? 0),
          );
          if (langs[0]) setActiveLang(langs[0]);
        }
      })
      .catch((e) => setError(String(e instanceof Error ? e.message : e)))
      .finally(() => setLoading(false));
    // activeLang excluded from deps — switching tabs shouldn't refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret]);

  const handleHistoricDownload = async () => {
    if (!secret || historicLoading) return;
    setHistoricLoading(true);
    try {
      const r = await fetch(`/api/admin/searches/historic?secret=${encodeURIComponent(secret)}`);
      if (!r.ok) {
        const j = (await r.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error ?? `HTTP ${r.status}`);
      }
      const json = (await r.json()) as { byLang: Record<string, string[]> };
      const words = json.byLang[activeLang] ?? [];
      const lines = ["word"];
      for (const w of words) lines.push(csvEscape(w));
      downloadCsv(`gadit-searches-historic-${activeLang}.csv`, lines.join("\n") + "\n");
    } catch (e) {
      alert(String(e instanceof Error ? e.message : e));
    } finally {
      setHistoricLoading(false);
    }
  };

  const tabs = useMemo(() => {
    if (!data) return [];
    const present = Object.keys(data.byLang);
    const ordered = [...LANG_ORDER.filter((l) => present.includes(l))];
    for (const l of present) if (!ordered.includes(l)) ordered.push(l);
    return ordered;
  }, [data]);

  const rows = data?.byLang[activeLang] ?? [];
  const filteredRows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.word.toLowerCase().includes(q));
  }, [rows, filter]);

  // ---------- Dashboard ----------
  // No secret gate or chrome — the shared AdminShell (layout.tsx) owns
  // those. This page just renders content.
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
        <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }}>
          {loading ? t.loading : data ? `${data.totals.uniqueWords.toLocaleString()} ${adminLang === "he" ? "מילים ייחודיות" : "unique words"}` : ""}
        </p>
      </div>
      <div>
        {error && (
          <div style={{ background: "#FEF2F2", color: "#991B1B", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        {data && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
            <StatCard label={t.statTotalSearches} value={data.totals.totalSearches} />
            <StatCard label={t.statUniqueWords} value={data.totals.uniqueWords} />
            <StatCard label={t.statLanguages} value={Object.keys(data.byLang).length} accent="#0EA5A5" />
          </div>
        )}

        {data && tabs.length === 0 && (
          <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 32, textAlign: "center", color: "#6B7280", fontSize: 14 }}>
            {t.emptyState}
          </div>
        )}

        {data && tabs.length > 0 && (
          <>
            {/* Language tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {tabs.map((lang) => {
                const stats = data.totals.byLang[lang];
                const isActive = lang === activeLang;
                return (
                  <button
                    key={lang}
                    onClick={() => { setActiveLang(lang); setFilter(""); }}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: isActive ? "2px solid #0EA5A5" : "1px solid #E5E7EB",
                      background: isActive ? "#ECFEFF" : "white",
                      color: isActive ? "#0E7490" : "#374151",
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      cursor: "pointer",
                      display: "inline-flex",
                      gap: 6,
                      alignItems: "center",
                    }}
                    dir="ltr"
                  >
                    <span>{LANG_LABEL[lang] ?? lang}</span>
                    <span style={{ color: isActive ? "#0E7490" : "#9CA3AF", fontSize: 11, fontVariantNumeric: "tabular-nums" }}>
                      {(stats?.uniqueWords ?? 0).toLocaleString()} · {(stats?.totalSearches ?? 0).toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filter + downloads */}
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder={t.searchPlaceholder}
                style={{ ...inputStyle, marginBottom: 0, maxWidth: 320 }}
              />
              <button
                onClick={() => downloadCsv(`gadit-searches-${activeLang}.csv`, buildCsv(rows))}
                style={{ ...buttonStyle, background: "#0EA5A5", color: "white", width: "auto", padding: "10px 16px" }}
                disabled={rows.length === 0}
              >
                {t.downloadCsv}
              </button>
              <button
                onClick={handleHistoricDownload}
                style={{ ...buttonStyle, background: "#F3F4F6", color: "#374151", width: "auto", padding: "10px 16px" }}
                disabled={historicLoading}
              >
                {historicLoading ? t.historicLoading : t.historicCsv}
              </button>
            </div>
            <p style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 16 }}>
              {t.historicHint}
            </p>

            {rows.length === 0 ? (
              <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 32, textAlign: "center", color: "#6B7280", fontSize: 14 }}>
                {t.noLangData}
              </div>
            ) : (
              <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "#F9FAFB" }}>
                    <tr>
                      <th style={thStyle}>{t.colRank}</th>
                      <th style={thStyle}>{t.colWord}</th>
                      <th style={{ ...thStyle, textAlign: "end" }}>{t.colCount}</th>
                      <th style={{ ...thStyle, textAlign: "end" }}>{t.colLastSeen}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((r, i) => (
                      <tr key={r.word} style={{ borderTop: "1px solid #F3F4F6" }}>
                        <td style={{ ...tdStyle, color: "#9CA3AF", fontVariantNumeric: "tabular-nums", width: 50 }}>
                          {i + 1}
                        </td>
                        <td style={{ ...tdStyle, color: "#111827", fontWeight: 500 }} dir="auto">
                          {r.word}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "end", fontVariantNumeric: "tabular-nums", color: "#0E7490", fontWeight: 600 }}>
                          {r.count.toLocaleString()}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "end", color: "#6B7280", fontSize: 13 }}>
                          {formatRelative(r.lastAt, adminLang)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: "12px 16px", borderTop: "1px solid #F3F4F6", color: "#9CA3AF", fontSize: 12, textAlign: "start" }}>
                  {t.showingFooter(filteredRows.length, rows.length)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: 0.5, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent ?? "#111827", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F9FAFB",
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const cardStyle: React.CSSProperties = {
  background: "white",
  maxWidth: 400,
  margin: "120px auto 0",
  padding: 32,
  border: "1px solid #E5E7EB",
  borderRadius: 12,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #E5E7EB",
  background: "white",
  fontSize: 14,
  color: "#111827",
  marginBottom: 12,
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "none",
  background: "#0EA5A5",
  color: "white",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const thStyle: React.CSSProperties = {
  padding: "10px 16px",
  textAlign: "start",
  fontSize: 11,
  fontWeight: 600,
  color: "#6B7280",
  letterSpacing: 0.5,
  textTransform: "uppercase",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 16px",
  fontSize: 14,
  textAlign: "start",
};

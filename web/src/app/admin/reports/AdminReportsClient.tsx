"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminContext, type AdminLang } from "../admin-context";
import { CATEGORY_LABEL, customerCategory, type CustomerCategory } from "@/lib/internal-accounts";

interface Report {
  id: string;
  categories: string[];
  details: string;
  word: string;
  uiLang: string;
  pageUrl: string;
  contextSnapshot: string;
  userId: string | null;
  userEmail: string | null;
  userPlan: string;
  /** From the reporter's user doc (route); null when it could not be read. */
  userCategory?: CustomerCategory | null;
  createdAt: string;
  status: "open" | "reviewed" | "fixed" | "wontfix";
  adminNote: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface Counts {
  open: number;
  reviewed: number;
  fixed: number;
  wontfix: number;
  total: number;
}

type ReportStatus = Report["status"];

/** Admin copy in the admin language (he/en), independent of the site language. */
const STRINGS: Record<AdminLang, {
  title: string;
  loading: string;
  noReports: string;
  word: string;
  anonymous: string;
  error: string;
  updateFailed: string;
  showContext: string;
  hideContext: string;
  openPage: string;
  tabs: Record<ReportStatus | "all", string>;
  mark: Record<ReportStatus, string>;
  counts: (c: Counts) => string;
}> = {
  en: {
    title: "Reports",
    loading: "Loading…",
    noReports: "No reports.",
    word: "Word",
    anonymous: "anonymous",
    error: "Error",
    updateFailed: "Update failed",
    showContext: "Show context",
    hideContext: "Hide context",
    openPage: "Open page",
    tabs: { open: "Open", reviewed: "Reviewed", fixed: "Fixed", wontfix: "Won't fix", all: "All" },
    mark: { open: "Mark open", reviewed: "Mark reviewed", fixed: "Mark fixed", wontfix: "Mark won't fix" },
    counts: (c) => `${c.total} total · ${c.open} open · ${c.reviewed} reviewed · ${c.fixed} fixed · ${c.wontfix} won't fix`,
  },
  he: {
    title: "דיווחים",
    loading: "טוען…",
    noReports: "אין דיווחים.",
    word: "מילה",
    anonymous: "אנונימי",
    error: "שגיאה",
    updateFailed: "העדכון נכשל",
    showContext: "הצג הקשר",
    hideContext: "הסתר הקשר",
    openPage: "פתח עמוד",
    tabs: { open: "פתוחים", reviewed: "נבדקו", fixed: "תוקנו", wontfix: "לא יטופלו", all: "הכל" },
    mark: { open: "סמן כפתוח", reviewed: "סמן כנבדק", fixed: "סמן כתוקן", wontfix: "סמן כלא יטופל" },
    counts: (c) => `${c.total} סה"כ · ${c.open} פתוחים · ${c.reviewed} נבדקו · ${c.fixed} תוקנו · ${c.wontfix} לא יטופלו`,
  },
};

/** The reporter as one of the four customer categories. Prefers the route's
 *  userCategory (read from the user doc); otherwise maps the stored plan, so
 *  legacy clear/deep never show as labels. */
function planLabel(r: Report, t: (typeof STRINGS)[AdminLang]): string {
  if (r.userCategory) return CATEGORY_LABEL[r.userCategory];
  if (!r.userId || !r.userPlan || r.userPlan === "anonymous") return t.anonymous;
  return CATEGORY_LABEL[customerCategory({ plan: r.userPlan }, r.userId)];
}

export default function AdminReportsClient() {
  const { secret, lang } = useAdminContext();
  const t = STRINGS[lang];
  const dir: "ltr" | "rtl" = lang === "he" ? "rtl" : "ltr";
  const [reports, setReports] = useState<Report[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionErr, setActionErr] = useState("");
  const [filter, setFilter] = useState<"all" | ReportStatus>("open");
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ secret });
      if (filter !== "all") qs.set("status", filter);
      const res = await fetch(`/api/admin/reports?${qs.toString()}`);
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error ?? "HTTP " + res.status);
      }
      const json = await res.json();
      setReports(json.items as Report[]);
      setCounts(json.counts as Counts);
      setErrorMsg("");
    } catch (e) {
      console.error("admin reports load:", e);
      setErrorMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [secret, filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReports();
  }, [loadReports]);

  async function updateReport(id: string, status?: ReportStatus, adminNote?: string) {
    setActionErr("");
    try {
      const res = await fetch(`/api/admin/reports?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, adminNote }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error ?? "HTTP " + res.status);
      }
      setReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, ...(status && { status }), ...(adminNote !== undefined && { adminNote }) }
            : r
        )
      );
      // Reload counts
      loadReports();
    } catch (e) {
      console.error("update report:", e);
      setActionErr(`${t.updateFailed}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (errorMsg) {
    return <Frame dir={dir}>{t.error}: {errorMsg}</Frame>;
  }

  return (
    // Rendered inside the AdminShell layout, which already provides
    // background, padding and centering. Just a fragment + the inner
    // content here — no extra <main> wrapper.
    <div dir={dir}>
      <div>
        <div className="mb-6 flex items-baseline justify-between flex-wrap gap-3">
          <div>
            {/* Title mirrors the sidebar nav label ("דיווחים" / "Reports"). */}
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>
              {t.title}
            </h1>
          </div>
          {counts && (
            <p className="text-xs text-slate-500">
              {t.counts(counts)}
            </p>
          )}
        </div>

        {actionErr && (
          <div role="alert" style={{ background: "#FEF2F2", color: "#991B1B", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {actionErr}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 inline-flex border border-slate-200 flex-wrap">
          {(["open", "reviewed", "fixed", "wontfix", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-lg text-sm transition-all"
              style={{
                background: filter === f ? "#2563EB" : "transparent",
                color: filter === f ? "white" : "rgb(100 116 139)",
                fontWeight: filter === f ? 600 : 400,
              }}
            >
              {t.tabs[f]}{" "}
              {counts && f !== "all" && counts[f as keyof Omit<Counts, "total">] !== undefined && (
                <span className="ms-1 opacity-70">({counts[f as keyof Omit<Counts, "total">]})</span>
              )}
            </button>
          ))}
        </div>

        {/* Reports table */}
        {loading ? (
          <p className="text-sm text-slate-500 py-12 text-center">{t.loading}</p>
        ) : reports.length === 0 ? (
          <p className="text-sm text-slate-500 py-12 text-center">{t.noReports}</p>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl p-5"
                style={{
                  border: "1px solid rgb(226 232 240 / 0.9)",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.04)",
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <StatusBadge status={r.status} label={t.tabs[r.status] ?? r.status} />
                      <span className="text-xs text-slate-400">
                        {new Date(r.createdAt).toLocaleString(lang === "he" ? "he-IL" : "en-GB")}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">
                        <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{r.userEmail ?? t.anonymous}</span> ({planLabel(r, t)})
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">{r.uiLang}</span>
                    </div>
                    <p className="text-base font-semibold mb-1" style={{ color: "#0F172A" }}>
                      {t.word}: <span dir="auto">{r.word || "-"}</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {r.categories.map((c) => (
                        <span
                          key={c}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgb(239 246 255)",
                            color: "rgb(29 78 216)",
                          }}
                        >
                          {c.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                    {r.details && (
                      <p className="text-sm text-slate-600 mb-2 whitespace-pre-wrap" dir="auto">
                        {r.details}
                      </p>
                    )}
                    {r.pageUrl && (
                      <a
                        href={r.pageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                        dir="ltr"
                      >
                        {t.openPage} →
                      </a>
                    )}
                  </div>
                </div>

                {/* Admin actions */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                  {(["open", "reviewed", "fixed", "wontfix"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateReport(r.id, s)}
                      disabled={r.status === s}
                      className="text-xs px-2.5 py-1 rounded-md transition-colors disabled:opacity-40 disabled:cursor-default"
                      style={{
                        background: r.status === s ? "rgb(239 246 255)" : "transparent",
                        color: r.status === s ? "rgb(29 78 216)" : "rgb(100 116 139)",
                        border: "1px solid rgb(226 232 240)",
                      }}
                    >
                      {t.mark[s]}
                    </button>
                  ))}
                  <button
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    className="text-xs px-2.5 py-1 ms-auto text-slate-500 hover:text-slate-800"
                  >
                    {expanded === r.id ? t.hideContext : t.showContext}
                  </button>
                </div>

                {/* Context snapshot */}
                {expanded === r.id && (
                  <pre
                    className="mt-3 p-3 rounded-lg text-xs overflow-x-auto"
                    style={{
                      background: "rgb(248 250 252)",
                      color: "rgb(51 65 85)",
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                    dir="ltr"
                  >
                    {r.contextSnapshot}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Frame({ children, dir }: { children: React.ReactNode; dir: "ltr" | "rtl" }) {
  return (
    <div dir={dir} style={{ padding: 24 }}>
      <div className="max-w-2xl mx-auto text-center text-slate-500 text-sm">{children}</div>
    </div>
  );
}

function StatusBadge({ status, label }: { status: Report["status"]; label: string }) {
  const colors: Record<Report["status"], { bg: string; text: string }> = {
    open: { bg: "rgb(254 226 226)", text: "rgb(153 27 27)" },
    reviewed: { bg: "rgb(254 249 195)", text: "rgb(133 77 14)" },
    fixed: { bg: "rgb(220 252 231)", text: "rgb(22 101 52)" },
    wontfix: { bg: "rgb(241 245 249)", text: "rgb(71 85 105)" },
  };
  const c = colors[status];
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-semibold"
      style={{ background: c.bg, color: c.text }}
    >
      {label}
    </span>
  );
}

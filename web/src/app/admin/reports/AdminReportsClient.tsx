"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";

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

const ADMIN_EMAIL = "gadibenlavi@gmail.com";

export default function AdminReportsClient() {
  const { user, loading: authLoading, promptLogin } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "reviewed" | "fixed" | "wontfix">(
    "open"
  );
  const [expanded, setExpanded] = useState<string | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const loadReports = useCallback(async () => {
    if (!user || !isAdmin) return;
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const url =
        filter === "all"
          ? "/api/admin/reports"
          : `/api/admin/reports?status=${filter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      setReports(json.items as Report[]);
      setCounts(json.counts as Counts);
    } catch (e) {
      console.error("admin reports load:", e);
      setErrorMsg(String(e));
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, filter]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      promptLogin("Sign in as admin");
      return;
    }
    loadReports();
  }, [authLoading, user, promptLogin, loadReports]);

  async function updateReport(id: string, status?: Report["status"], adminNote?: string) {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      await fetch("/api/admin/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ id, status, adminNote }),
      });
      // Optimistic update
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
    }
  }

  if (authLoading) {
    return <Frame>Loading…</Frame>;
  }
  if (!user) {
    return <Frame>Please sign in.</Frame>;
  }
  if (!isAdmin) {
    return <Frame>403 — admin access only.</Frame>;
  }
  if (errorMsg) {
    return <Frame>Error: {errorMsg}</Frame>;
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 px-4" dir="ltr">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-baseline justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
              Error reports
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Logged in as {user.email}
            </p>
          </div>
          {counts && (
            <p className="text-xs text-slate-500">
              {counts.total} total · {counts.open} open · {counts.reviewed} reviewed ·{" "}
              {counts.fixed} fixed · {counts.wontfix} won&apos;t fix
            </p>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 inline-flex border border-slate-200">
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
              {f}{" "}
              {counts && counts[f as keyof Counts] !== undefined && f !== "all" && (
                <span className="ms-1 opacity-70">({counts[f as keyof Counts]})</span>
              )}
            </button>
          ))}
        </div>

        {/* Reports table */}
        {loading ? (
          <p className="text-sm text-slate-500 py-12 text-center">Loading…</p>
        ) : reports.length === 0 ? (
          <p className="text-sm text-slate-500 py-12 text-center">No reports.</p>
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
                      <StatusBadge status={r.status} />
                      <span className="text-xs text-slate-400">
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">
                        {r.userEmail ?? "anonymous"} ({r.userPlan})
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">{r.uiLang}</span>
                    </div>
                    <p className="text-base font-semibold mb-1" style={{ color: "#0F172A" }}>
                      Word: <span dir="auto">{r.word || "(none)"}</span>
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
                      <p className="text-sm text-slate-600 mb-2 whitespace-pre-wrap">
                        {r.details}
                      </p>
                    )}
                    {r.pageUrl && (
                      <a
                        href={r.pageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Open page →
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
                      Mark {s}
                    </button>
                  ))}
                  <button
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    className="text-xs px-2.5 py-1 ms-auto text-slate-500 hover:text-slate-800"
                  >
                    {expanded === r.id ? "Hide context" : "Show context"}
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
                  >
                    {r.contextSnapshot}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto text-center text-slate-500 text-sm">{children}</div>
    </main>
  );
}

function StatusBadge({ status }: { status: Report["status"] }) {
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
      {status}
    </span>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";

type Plan = "basic" | "clear" | "deep";

type AdminUserRow = {
  uid: string;
  email: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  providers: string[];
  emailVerified: boolean;
  disabled: boolean;
  plan: Plan;
  country: string | null;
  lastSeenAt: string | null;
  searchCount: number;
  lastSearchAt: string | null;
  stripeCustomerId: string | null;
  subscriptionStatus: string | null;
};

type ApiResponse = {
  counts: {
    total: number;
    filtered: number;
    byPlan: { basic: number; clear: number; deep: number };
    byCountry: Record<string, number>;
    signupsLast7Days: number;
    signupsLast30Days: number;
  };
  users: AdminUserRow[];
};

const SECRET_KEY = "gadit_admin_secret_v1";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const today = new Date();
  const diff = today.getTime() - d.getTime();
  if (diff < 60_000) return "now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "2-digit" });
}

function planBadge(plan: Plan): { label: string; bg: string; fg: string } {
  if (plan === "deep")  return { label: "Deep",  bg: "#EDE9FE", fg: "#5B21B6" };
  if (plan === "clear") return { label: "Clear", bg: "#CFFAFE", fg: "#0E7490" };
  return                       { label: "Basic", bg: "#F3F4F6", fg: "#4B5563" };
}

function countryFlag(iso2: string | null): string {
  if (!iso2 || iso2.length !== 2) return "🌐";
  // Convert ISO 3166-1 alpha-2 to regional-indicator flag emoji.
  const A = 0x1f1e6;
  const codePoints = [...iso2.toUpperCase()].map((c) => A + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...codePoints);
}

export default function AdminUsersClient() {
  const [secret, setSecret] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<"" | Plan>("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"createdAt" | "lastSeenAt" | "searchCount" | "plan" | "country">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Bootstrap secret from localStorage. set-state-in-effect is flagged
  // by react-hooks but this is the textbook pattern: server-render with
  // null, hydrate, then upgrade to the persisted value once we know
  // localStorage exists.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(SECRET_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setSecret(stored);
  }, []);

  // Fetch whenever we have a secret
  useEffect(() => {
    if (!secret) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetch(`/api/admin/users?secret=${encodeURIComponent(secret)}`)
      .then(async (r) => {
        if (r.status === 401) {
          localStorage.removeItem(SECRET_KEY);
          setSecret(null);
          throw new Error("Wrong secret.");
        }
        if (!r.ok) {
          const j = (await r.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error ?? `HTTP ${r.status}`);
        }
        return r.json() as Promise<ApiResponse>;
      })
      .then((j) => setData(j))
      .catch((e) => setError(String(e instanceof Error ? e.message : e)))
      .finally(() => setLoading(false));
  }, [secret]);

  const handleSecretSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("secret") as HTMLInputElement | null;
    const value = input?.value.trim();
    if (!value) return;
    localStorage.setItem(SECRET_KEY, value);
    setSecret(value);
  };

  const filteredSorted = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    let rows = data.users.filter((r) => {
      if (q && !(r.email ?? "").toLowerCase().includes(q) && !r.uid.toLowerCase().includes(q)) return false;
      if (planFilter && r.plan !== planFilter) return false;
      if (countryFilter && (r.country ?? "") !== countryFilter) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "searchCount") return dir * (a.searchCount - b.searchCount);
      if (sortBy === "plan") return dir * a.plan.localeCompare(b.plan);
      if (sortBy === "country") return dir * ((a.country ?? "zz").localeCompare(b.country ?? "zz"));
      const av = a[sortBy] ?? "";
      const bv = b[sortBy] ?? "";
      return dir * (av < bv ? -1 : av > bv ? 1 : 0);
    });
    return rows;
  }, [data, search, planFilter, countryFilter, sortBy, sortDir]);

  // ---------- Login gate ----------
  if (!secret) {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8, color: "#111827" }}>Admin · Users</h1>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>
            Enter ADMIN_SECRET to view the user dashboard.
          </p>
          {/* A hidden username field gives the browser's password manager
              the (origin + username + password) triple it needs to offer
              autofill. Without a username field most password managers
              skip the save prompt entirely. The value 'gadit-admin' is a
              constant identifier — it isn't displayed, only used so the
              browser can distinguish this credential from other Gadit
              accounts saved at the same origin. */}
          <form onSubmit={handleSecretSubmit} autoComplete="on">
            <input
              type="text"
              name="username"
              value="gadit-admin"
              autoComplete="username"
              readOnly
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              tabIndex={-1}
              aria-hidden="true"
            />
            <input
              type="password"
              name="secret"
              autoFocus
              autoComplete="current-password"
              placeholder="ADMIN_SECRET"
              style={inputStyle}
            />
            <button type="submit" style={buttonStyle}>Unlock</button>
          </form>
        </div>
      </main>
    );
  }

  // ---------- Dashboard ----------
  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827" }}>Gadit · Users</h1>
            <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }}>
              {data ? `${data.counts.total} total users` : loading ? "Loading…" : ""}
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem(SECRET_KEY);
              setSecret(null);
              setData(null);
            }}
            style={{ ...buttonStyle, background: "#F3F4F6", color: "#374151", width: "auto", padding: "8px 16px" }}
          >
            Sign out
          </button>
        </header>

        {error && (
          <div style={{ background: "#FEF2F2", color: "#991B1B", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Stat cards */}
        {data && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
            <StatCard label="Total users" value={data.counts.total} />
            <StatCard label="Signups · 7 days" value={data.counts.signupsLast7Days} />
            <StatCard label="Signups · 30 days" value={data.counts.signupsLast30Days} />
            <StatCard label="Basic" value={data.counts.byPlan.basic} accent="#9CA3AF" />
            <StatCard label="Clear" value={data.counts.byPlan.clear} accent="#0EA5A5" />
            <StatCard label="Deep" value={data.counts.byPlan.deep} accent="#7C3AED" />
          </div>
        )}

        {/* Country breakdown */}
        {data && Object.keys(data.counts.byCountry).length > 0 && (
          <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 12, letterSpacing: 0.5 }}>BY COUNTRY</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(data.counts.byCountry).slice(0, 30).map(([cc, n]) => (
                <button
                  key={cc}
                  onClick={() => setCountryFilter(countryFilter === cc ? "" : cc)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: countryFilter === cc ? "2px solid #0EA5A5" : "1px solid #E5E7EB",
                    background: countryFilter === cc ? "#ECFEFF" : "white",
                    fontSize: 13,
                    color: "#374151",
                    cursor: "pointer",
                    display: "inline-flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  <span>{countryFlag(cc === "?" ? null : cc)}</span>
                  <span style={{ fontWeight: 500 }}>{cc}</span>
                  <span style={{ color: "#9CA3AF" }}>·</span>
                  <span style={{ color: "#6B7280" }}>{n}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or uid…"
            style={{ ...inputStyle, flex: "1 1 220px", marginBottom: 0 }}
          />
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as "" | Plan)}
            style={{ ...inputStyle, width: "auto", marginBottom: 0 }}
          >
            <option value="">All plans</option>
            <option value="basic">Basic</option>
            <option value="clear">Clear</option>
            <option value="deep">Deep</option>
          </select>
          {countryFilter && (
            <button
              onClick={() => setCountryFilter("")}
              style={{ ...buttonStyle, width: "auto", padding: "0 16px", background: "#F3F4F6", color: "#374151" }}
            >
              ✕ {countryFilter}
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <tr>
                  <Th label="Email" />
                  <Th label="Plan"      onClick={() => toggleSort("plan", sortBy, sortDir, setSortBy, setSortDir)} active={sortBy === "plan"} dir={sortDir} />
                  <Th label="Country"   onClick={() => toggleSort("country", sortBy, sortDir, setSortBy, setSortDir)} active={sortBy === "country"} dir={sortDir} />
                  <Th label="Signed up" onClick={() => toggleSort("createdAt", sortBy, sortDir, setSortBy, setSortDir)} active={sortBy === "createdAt"} dir={sortDir} />
                  <Th label="Last seen" onClick={() => toggleSort("lastSeenAt", sortBy, sortDir, setSortBy, setSortDir)} active={sortBy === "lastSeenAt"} dir={sortDir} />
                  <Th label="Searches"  onClick={() => toggleSort("searchCount", sortBy, sortDir, setSortBy, setSortDir)} active={sortBy === "searchCount"} dir={sortDir} align="right" />
                  <Th label="Provider" />
                </tr>
              </thead>
              <tbody>
                {filteredSorted.map((u) => {
                  const badge = planBadge(u.plan);
                  return (
                    <tr key={u.uid} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "12px 16px", color: "#111827" }}>
                        <div style={{ fontWeight: 500 }}>{u.email ?? "(no email)"}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{u.uid.slice(0, 16)}…</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: badge.bg, color: badge.fg, padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#374151" }}>
                        {u.country ? (
                          <span>{countryFlag(u.country)} {u.country}</span>
                        ) : (
                          <span style={{ color: "#D1D5DB" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#6B7280" }}>{formatDate(u.createdAt)}</td>
                      <td style={{ padding: "12px 16px", color: "#6B7280" }}>{formatDate(u.lastSeenAt ?? u.lastSignInAt)}</td>
                      <td style={{ padding: "12px 16px", color: "#374151", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {u.searchCount}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#6B7280", fontSize: 12 }}>
                        {u.providers.map((p) => p.replace(".com", "").replace("password", "email")).join(", ")}
                      </td>
                    </tr>
                  );
                })}
                {filteredSorted.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>
                      {data ? "No matching users." : "Loading…"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {data && (
          <p style={{ marginTop: 12, fontSize: 12, color: "#9CA3AF" }}>
            Showing {filteredSorted.length} of {data.counts.total}. Country is captured automatically on each authenticated API hit via Vercel edge geolocation; users who have never returned since this feature shipped won&apos;t have a country yet.
          </p>
        )}
      </div>
    </main>
  );
}

function Th({
  label,
  onClick,
  active,
  dir,
  align,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  dir?: "asc" | "desc";
  align?: "right";
}) {
  return (
    <th
      onClick={onClick}
      style={{
        textAlign: align ?? "left",
        padding: "12px 16px",
        fontSize: 11,
        fontWeight: 600,
        color: active ? "#0EA5A5" : "#6B7280",
        letterSpacing: 0.5,
        textTransform: "uppercase",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      {active && (dir === "asc" ? " ↑" : " ↓")}
    </th>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: 0.5, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent ?? "#111827", marginTop: 4 }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function toggleSort(
  key: "createdAt" | "lastSeenAt" | "searchCount" | "plan" | "country",
  currentKey: string,
  currentDir: "asc" | "desc",
  setKey: (k: typeof key) => void,
  setDir: (d: "asc" | "desc") => void,
) {
  if (currentKey === key) {
    setDir(currentDir === "asc" ? "desc" : "asc");
  } else {
    setKey(key);
    setDir(key === "searchCount" || key === "createdAt" || key === "lastSeenAt" ? "desc" : "asc");
  }
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

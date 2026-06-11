"use client";

import { useEffect, useMemo, useState } from "react";

type Plan = "basic" | "clear" | "deep";

type AdminUserRow = {
  uid: string;
  email: string | null;
  displayName: string | null;
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

type AdminLang = "en" | "he";
const ADMIN_LANG_KEY = "gadit_admin_lang_v1";

// All admin-dashboard strings live in one dictionary so adding a third
// language (or tweaking copy) is a single-file edit. Keys mirror the
// English label so reading the JSX still tells you what's on screen.
const STRINGS: Record<AdminLang, {
  title: string;
  totalUsersFooter: (n: number) => string;
  loading: string;
  signOut: string;
  langToggle: string;
  statTotalUsers: string;
  statSignups7: string;
  statSignups30: string;
  statBasic: string;
  statClear: string;
  statDeep: string;
  byCountry: string;
  searchPlaceholder: string;
  allPlans: string;
  basic: string;
  clear: string;
  deep: string;
  allTime: string;
  last7: string;
  last30: string;
  last90: string;
  dateRangeTitle: string;
  colUser: string;
  colPlan: string;
  colCountry: string;
  colSignedUp: string;
  colLastSeen: string;
  colSearches: string;
  colProvider: string;
  noUsers: string;
  showingFooter: (n: number, total: number) => string;
  countryFooterNote: string;
  unlockTitle: string;
  unlockBody: string;
  unlockCta: string;
  unlockPlaceholder: string;
}> = {
  en: {
    title: "Gadit · Users",
    totalUsersFooter: (n) => `${n} total users`,
    loading: "Loading…",
    signOut: "Sign out",
    langToggle: "עברית",
    statTotalUsers: "Total users",
    statSignups7: "Signups · 7 days",
    statSignups30: "Signups · 30 days",
    statBasic: "Basic",
    statClear: "Clear",
    statDeep: "Deep",
    byCountry: "BY COUNTRY",
    searchPlaceholder: "Search email or uid…",
    allPlans: "All plans",
    basic: "Basic",
    clear: "Clear",
    deep: "Deep",
    allTime: "All time",
    last7: "Last 7 days",
    last30: "Last 30 days",
    last90: "Last 90 days",
    dateRangeTitle: "Filter by signup date range",
    colUser: "User",
    colPlan: "Plan",
    colCountry: "Country",
    colSignedUp: "Signed up",
    colLastSeen: "Last seen",
    colSearches: "Searches",
    colProvider: "Provider",
    noUsers: "No matching users.",
    showingFooter: (n, total) => `Showing ${n} of ${total}.`,
    countryFooterNote: "Country is captured automatically on each authenticated API hit via Vercel edge geolocation; users who haven't returned since this feature shipped won't have a country yet.",
    unlockTitle: "Admin · Users",
    unlockBody: "Enter ADMIN_SECRET to view the user dashboard.",
    unlockCta: "Unlock",
    unlockPlaceholder: "ADMIN_SECRET",
  },
  he: {
    title: "Gadit · משתמשים",
    totalUsersFooter: (n) => `סך הכל ${n} משתמשים`,
    loading: "טוען…",
    signOut: "התנתקות",
    langToggle: "English",
    statTotalUsers: "סך משתמשים",
    statSignups7: "הרשמות · 7 ימים",
    statSignups30: "הרשמות · 30 ימים",
    statBasic: "Basic",
    statClear: "Clear",
    statDeep: "Deep",
    byCountry: "לפי מדינה",
    searchPlaceholder: "חיפוש לפי אימייל או מזהה…",
    allPlans: "כל המסלולים",
    basic: "Basic",
    clear: "Clear",
    deep: "Deep",
    allTime: "כל הזמן",
    last7: "7 ימים אחרונים",
    last30: "30 ימים אחרונים",
    last90: "90 ימים אחרונים",
    dateRangeTitle: "סנן לפי טווח תאריכי הצטרפות",
    colUser: "משתמש",
    colPlan: "מסלול",
    colCountry: "מדינה",
    colSignedUp: "תאריך הצטרפות",
    colLastSeen: "פעילות אחרונה",
    colSearches: "חיפושים",
    colProvider: "ספק",
    noUsers: "אין משתמשים תואמים.",
    showingFooter: (n, total) => `מציג ${n} מתוך ${total}.`,
    countryFooterNote: "המדינה נלכדת אוטומטית בכל קריאת API מאומתת באמצעות Vercel edge geolocation. משתמשים שלא חזרו מאז שהפיצ'ר הזה עלה לא יציגו מדינה.",
    unlockTitle: "ניהול · משתמשים",
    unlockBody: "הכנס ADMIN_SECRET כדי לראות את דף הניהול.",
    unlockCta: "פתח",
    unlockPlaceholder: "ADMIN_SECRET",
  },
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

// Locale chosen so dates read naturally in whichever language the
// admin has selected. The previous English-only formatting produced
// strings like "10 Jun 2026" which the RTL layout then visually
// reversed into "Jun 2026 10" — the fix is to format dates IN Hebrew
// when in Hebrew mode so the string is RTL-native and renders correctly.
function formatRelative(iso: string | null, lang: AdminLang): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const today = new Date();
  const diff = today.getTime() - d.getTime();
  if (lang === "he") {
    if (diff < 60_000) return "כעת";
    if (diff < 3600_000) {
      const n = Math.floor(diff / 60_000);
      return `לפני ${n} ${n === 1 ? "דקה" : "דקות"}`;
    }
    if (diff < 86_400_000) {
      const n = Math.floor(diff / 3600_000);
      return `לפני ${n} ${n === 1 ? "שעה" : "שעות"}`;
    }
    if (diff < 7 * 86_400_000) {
      const n = Math.floor(diff / 86_400_000);
      return `לפני ${n} ${n === 1 ? "יום" : "ימים"}`;
    }
    return d.toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "2-digit" });
  }
  if (diff < 60_000) return "now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
}

// Absolute calendar date for the table cells. Gadi specifically asked
// to see real dates rather than "1d ago" labels — "1d ago" reads fast
// for recent activity but becomes useless when you want to know WHICH
// day someone signed up, especially for monthly cohort analysis.
// We render BOTH: the absolute date as the primary value (visible at a
// glance, sortable, copyable), and the relative form as a smaller
// secondary line below.
function formatAbsoluteDate(iso: string | null, lang: AdminLang): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (lang === "he") {
    // "10 ביוני 2026" — RTL-native, reads correctly under dir=rtl.
    return d.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
  }
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatAbsoluteTooltip(iso: string | null, lang: AdminLang): string {
  if (!iso) return "";
  const d = new Date(iso);
  const locale = lang === "he" ? "he-IL" : "en-GB";
  return d.toLocaleString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  // Date range filter: how many days back to include. Default "all".
  // Operates on the signup date (createdAt), which matches the way Gadi
  // tends to read this dashboard — "show me everyone who joined in the
  // last 7/30/90 days" is the common cohort cut.
  const [dateRange, setDateRange] = useState<"" | "7d" | "30d" | "90d">("");
  // Language toggle. Defaults to English (the admin dashboard's original
  // language); switch persisted in localStorage so Gadi's preference
  // sticks between visits. Hebrew mode flips the page to RTL via the
  // `dir` attribute on the main element below.
  const [adminLang, setAdminLang] = useState<AdminLang>("en");
  const t = STRINGS[adminLang];

  // Bootstrap secret from localStorage. set-state-in-effect is flagged
  // by react-hooks but this is the textbook pattern: server-render with
  // null, hydrate, then upgrade to the persisted value once we know
  // localStorage exists.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(SECRET_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setSecret(stored);
    const storedLang = localStorage.getItem(ADMIN_LANG_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (storedLang === "he" || storedLang === "en") setAdminLang(storedLang);
  }, []);

  const toggleLang = () => {
    const next: AdminLang = adminLang === "en" ? "he" : "en";
    setAdminLang(next);
    if (typeof window !== "undefined") localStorage.setItem(ADMIN_LANG_KEY, next);
  };

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
    const rangeMs: number | null =
      dateRange === "7d" ? 7 * 86_400_000 :
      dateRange === "30d" ? 30 * 86_400_000 :
      dateRange === "90d" ? 90 * 86_400_000 :
      null;
    const cutoff = rangeMs ? Date.now() - rangeMs : 0;
    let rows = data.users.filter((r) => {
      if (q && !(r.email ?? "").toLowerCase().includes(q) && !r.uid.toLowerCase().includes(q)) return false;
      if (planFilter && r.plan !== planFilter) return false;
      if (countryFilter && (r.country ?? "") !== countryFilter) return false;
      if (rangeMs) {
        if (!r.createdAt) return false;
        if (new Date(r.createdAt).getTime() < cutoff) return false;
      }
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "searchCount") return dir * (a.searchCount - b.searchCount);
      if (sortBy === "plan") {
        // Plan sort: order tiers semantically (basic < clear < deep)
        // rather than alphabetically. Reading "deep first when sorted
        // desc" matches the expectation.
        const rank = { basic: 0, clear: 1, deep: 2 };
        return dir * (rank[a.plan] - rank[b.plan]);
      }
      if (sortBy === "country") return dir * ((a.country ?? "zz").localeCompare(b.country ?? "zz"));
      const av = a[sortBy] ?? "";
      const bv = b[sortBy] ?? "";
      return dir * (av < bv ? -1 : av > bv ? 1 : 0);
    });
    return rows;
  }, [data, search, planFilter, countryFilter, sortBy, sortDir, dateRange]);

  // ---------- Login gate ----------
  const pageDir = adminLang === "he" ? "rtl" : "ltr";
  if (!secret) {
    return (
      <main style={pageStyle} dir={pageDir}>
        <div style={cardStyle}>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8, color: "#111827" }}>{t.unlockTitle}</h1>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>{t.unlockBody}</p>
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
              placeholder={t.unlockPlaceholder}
              style={inputStyle}
              dir="ltr"
            />
            <button type="submit" style={buttonStyle}>{t.unlockCta}</button>
          </form>
        </div>
      </main>
    );
  }

  // ---------- Dashboard ----------
  // Direction follows the chosen admin language: LTR in EN, RTL in HE.
  // The forced-LTR setup we had earlier was specifically to defeat the
  // visitor browser's locale; now that language is an explicit toggle
  // we want the page to actually flip in Hebrew mode.
  return (
    <main style={pageStyle} dir={pageDir}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
            <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }}>
              {data ? t.totalUsersFooter(data.counts.total) : loading ? t.loading : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={toggleLang}
              style={{ ...buttonStyle, background: "#F3F4F6", color: "#374151", width: "auto", padding: "8px 16px" }}
              title={adminLang === "en" ? "Switch to Hebrew" : "Switch to English"}
            >
              {t.langToggle}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem(SECRET_KEY);
                setSecret(null);
                setData(null);
              }}
              style={{ ...buttonStyle, background: "#F3F4F6", color: "#374151", width: "auto", padding: "8px 16px" }}
            >
              {t.signOut}
            </button>
          </div>
        </header>

        {error && (
          <div style={{ background: "#FEF2F2", color: "#991B1B", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Stat cards — labels and big numbers centered inside each card
            (Gadi's June 11 ask). Pulls the eye to the value first and
            balances the row visually regardless of label length, which
            matters in Hebrew where "סך משתמשים" and "הרשמות · 30 ימים"
            measure very differently. */}
        {data && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
            <StatCard label={t.statTotalUsers} value={data.counts.total} />
            <StatCard label={t.statSignups7} value={data.counts.signupsLast7Days} />
            <StatCard label={t.statSignups30} value={data.counts.signupsLast30Days} />
            <StatCard label={t.statBasic} value={data.counts.byPlan.basic} accent="#9CA3AF" />
            <StatCard label={t.statClear} value={data.counts.byPlan.clear} accent="#0EA5A5" />
            <StatCard label={t.statDeep} value={data.counts.byPlan.deep} accent="#7C3AED" />
          </div>
        )}

        {/* Country breakdown */}
        {data && Object.keys(data.counts.byCountry).length > 0 && (
          <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 12, letterSpacing: 0.5, textTransform: "uppercase" }}>{t.byCountry}</div>
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
            placeholder={t.searchPlaceholder}
            style={{ ...inputStyle, flex: "1 1 220px", marginBottom: 0 }}
          />
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as "" | Plan)}
            style={{ ...inputStyle, width: "auto", marginBottom: 0 }}
          >
            <option value="">{t.allPlans}</option>
            <option value="basic">{t.basic}</option>
            <option value="clear">{t.clear}</option>
            <option value="deep">{t.deep}</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as "" | "7d" | "30d" | "90d")}
            style={{ ...inputStyle, width: "auto", marginBottom: 0 }}
            title={t.dateRangeTitle}
          >
            <option value="">{t.allTime}</option>
            <option value="7d">{t.last7}</option>
            <option value="30d">{t.last30}</option>
            <option value="90d">{t.last90}</option>
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
                  <Th label={t.colUser} />
                  <Th label={t.colPlan}      onClick={() => toggleSort("plan", sortBy, sortDir, setSortBy, setSortDir)} active={sortBy === "plan"} dir={sortDir} />
                  <Th label={t.colCountry}   onClick={() => toggleSort("country", sortBy, sortDir, setSortBy, setSortDir)} active={sortBy === "country"} dir={sortDir} />
                  <Th label={t.colSignedUp}  onClick={() => toggleSort("createdAt", sortBy, sortDir, setSortBy, setSortDir)} active={sortBy === "createdAt"} dir={sortDir} />
                  <Th label={t.colLastSeen}  onClick={() => toggleSort("lastSeenAt", sortBy, sortDir, setSortBy, setSortDir)} active={sortBy === "lastSeenAt"} dir={sortDir} />
                  <Th label={t.colSearches}  onClick={() => toggleSort("searchCount", sortBy, sortDir, setSortBy, setSortDir)} active={sortBy === "searchCount"} dir={sortDir} align="end" />
                  <Th label={t.colProvider} />
                </tr>
              </thead>
              <tbody>
                {filteredSorted.map((u) => {
                  const badge = planBadge(u.plan);
                  return (
                    <tr key={u.uid} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "12px 16px", color: "#111827" }}>
                        {u.displayName && (
                          <div style={{ fontWeight: 600, color: "#111827", marginBottom: 2 }}>
                            {u.displayName}
                          </div>
                        )}
                        {/* Email + uid stay as ASCII strings; the browser
                            renders them LTR even inside an RTL container
                            because their characters are strong-LTR. No need
                            for an explicit dir override here — and removing
                            it lets the cell's start-edge align follow the
                            page direction (right in HE, left in EN). */}
                        <div style={{ fontWeight: u.displayName ? 400 : 500, color: u.displayName ? "#4B5563" : "#111827" }}>
                          {u.email ?? "(no email)"}
                        </div>
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
                      <td
                        style={{ padding: "12px 16px", color: "#111827", whiteSpace: "nowrap" }}
                        title={formatAbsoluteTooltip(u.createdAt, adminLang)}
                      >
                        <div style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                          {formatAbsoluteDate(u.createdAt, adminLang)}
                        </div>
                        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                          {formatRelative(u.createdAt, adminLang)}
                        </div>
                      </td>
                      <td
                        style={{ padding: "12px 16px", color: "#111827", whiteSpace: "nowrap" }}
                        title={formatAbsoluteTooltip(u.lastSeenAt ?? u.lastSignInAt, adminLang)}
                      >
                        <div style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                          {formatAbsoluteDate(u.lastSeenAt ?? u.lastSignInAt, adminLang)}
                        </div>
                        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                          {formatRelative(u.lastSeenAt ?? u.lastSignInAt, adminLang)}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#374151", textAlign: "end", fontVariantNumeric: "tabular-nums" }}>
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
                      {data ? t.noUsers : t.loading}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {data && (
          <p style={{ marginTop: 12, fontSize: 12, color: "#9CA3AF" }}>
            {t.showingFooter(filteredSorted.length, data.counts.total)} {t.countryFooterNote}
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
  align?: "end";
}) {
  return (
    <th
      onClick={onClick}
      style={{
        // textAlign: "start" / "end" respect the page direction, so
        // headers right-align in RTL (Hebrew) and left-align in LTR
        // (English) automatically without a per-language branch.
        // Earlier hardcoded "left"/"right" was the source of the
        // Hebrew-mode misalignment — headers appeared on the LEFT
        // (literal left) of their columns instead of on the RIGHT
        // (RTL row-start) where they belong.
        textAlign: align ?? "start",
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

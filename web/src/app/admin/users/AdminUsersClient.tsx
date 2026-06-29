"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminContext } from "../admin-context";

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
  statPaying: string;
  statPayingTooltip: string;
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
  colActions: string;
  deleteUserLabel: string;
  deleteConfirm: (email: string) => string;
  deleteSuccess: (email: string) => string;
  deleteError: (msg: string) => string;
  noUsers: string;
  showingFooter: (n: number, total: number) => string;
  countryFooterNote: string;
  unlockTitle: string;
  unlockBody: string;
  unlockCta: string;
  unlockPlaceholder: string;
}> = {
  en: {
    title: "Users",
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
    statPaying: "Paying",
    statPayingTooltip: "Active or trialing Stripe subscriptions. Excludes family members and manual grants.",
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
    colActions: "Actions",
    deleteUserLabel: "Delete user",
    deleteConfirm: (email) => `Delete ${email}?\n\nThis removes the Firebase Auth account, the user document, and the entire notebook subtree. The email can sign up again afterwards.\n\nThis cannot be undone.`,
    deleteSuccess: (email) => `Deleted ${email}.`,
    deleteError: (msg) => `Delete failed: ${msg}`,
    noUsers: "No matching users.",
    showingFooter: (n, total) => `Showing ${n} of ${total}.`,
    countryFooterNote: "Country is captured automatically on each authenticated API hit via Vercel edge geolocation; users who haven't returned since this feature shipped won't have a country yet.",
    unlockTitle: "Admin · Users",
    unlockBody: "Enter ADMIN_SECRET to view the user dashboard.",
    unlockCta: "Unlock",
    unlockPlaceholder: "ADMIN_SECRET",
  },
  he: {
    title: "משתמשים",
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
    statPaying: "משלמים בפועל",
    statPayingTooltip: "מנויי Stripe פעילים או בתקופת ניסיון. ללא בני משפחה והקצאות ידניות.",
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
    colActions: "פעולות",
    deleteUserLabel: "מחיקת משתמש",
    deleteConfirm: (email) => `למחוק את ${email}?\n\nהפעולה מוחקת את חשבון Firebase Auth, את מסמך המשתמש, ואת כל המחברת שלו. האימייל יוכל להירשם שוב לאחר מכן.\n\nאי אפשר לבטל את הפעולה.`,
    deleteSuccess: (email) => `${email} נמחק.`,
    deleteError: (msg) => `המחיקה נכשלה: ${msg}`,
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
    paying: { total: number; clear: number; deep: number };
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
  if (!iso) return ", ";
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
function formatAbsoluteDate(iso: string | null, _lang: AdminLang): string {
  if (!iso) return ", ";
  const d = new Date(iso);
  // Numeric slash format (10/06/2026) reads identically in both languages
  // — it's just digits and separators, no locale-specific words, no bidi
  // reordering. Gadi asked for this format explicitly after the long
  // Hebrew form "10 ביוני 2026" felt too verbose for a scannable table.
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
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

// flagcdn.com returns real flag PNGs that render the same on Windows,
// Mac, Linux, iOS, Android. The original regional-indicator emoji
// approach only rendered as a flag on systems with emoji-flag glyphs
// (mostly Mac/iOS); on Windows it fell back to two lowercase ASCII
// letters ('il'), which is what Gadi saw next to the country code
// 'IL' — looking like "il IL" duplicated.
function FlagImg({ iso2 }: { iso2: string }) {
  return (
    <img
      src={`https://flagcdn.com/40x30/${iso2.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/80x60/${iso2.toLowerCase()}.png 2x`}
      width={18}
      height={13}
      alt=""
      loading="lazy"
      style={{ borderRadius: 2, display: "inline-block", verticalAlign: "middle", boxShadow: "0 0 0 0.5px rgba(15,23,42,0.18)" }}
    />
  );
}

export default function AdminUsersClient() {
  // Secret + lang come from AdminContext now (the layout's AdminShell
  // handles the unlock gate + lang toggle + sidebar). This page just
  // reads them and gets on with its job.
  const { secret, lang: adminLang } = useAdminContext();
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
  // UIDs currently being deleted — the row's trash button stays
  // disabled and shows a spinner until the API responds. Set, not
  // boolean, so concurrent deletes don't fight over one flag.
  const [deletingUids, setDeletingUids] = useState<Set<string>>(new Set());
  const t = STRINGS[adminLang];

  // Delete a user via /api/admin/delete-user. The endpoint nukes the
  // Firebase Auth account, the /users/{uid} doc, and the entire
  // notebook subcollection in one shot. On success we splice the row
  // out of local state instead of refetching the whole list — snappier
  // and avoids the loading spinner flash.
  const handleDeleteUser = async (u: AdminUserRow) => {
    if (!u.email) {
      alert(t.deleteError("user has no email"));
      return;
    }
    if (!secret) return;
    if (!window.confirm(t.deleteConfirm(u.email))) return;

    setDeletingUids((s) => {
      const next = new Set(s);
      next.add(u.uid);
      return next;
    });

    try {
      const res = await fetch(
        `/api/admin/delete-user?secret=${encodeURIComponent(secret)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: u.email }),
        },
      );
      const json = (await res.json().catch(() => null)) as
        | { error?: string; deletedAuthUser?: boolean }
        | null;
      if (!res.ok) {
        alert(t.deleteError(json?.error ?? `HTTP ${res.status}`));
        return;
      }
      // Splice the deleted row out of local state.
      setData((d) =>
        d
          ? {
              ...d,
              users: d.users.filter((row) => row.uid !== u.uid),
              counts: { ...d.counts, total: Math.max(0, d.counts.total - 1) },
            }
          : d,
      );
    } catch (e) {
      alert(t.deleteError(String(e instanceof Error ? e.message : e)));
    } finally {
      setDeletingUids((s) => {
        const next = new Set(s);
        next.delete(u.uid);
        return next;
      });
    }
  };

  // Fetch whenever we have a secret. On 401 we wipe the secret so the
  // shell shows the unlock prompt again — the shell reads SECRET_KEY
  // from the same localStorage key, so removing it forces the gate.
  useEffect(() => {
    if (!secret) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetch(`/api/admin/users?secret=${encodeURIComponent(secret)}`)
      .then(async (r) => {
        if (r.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem(SECRET_KEY);
            // Hard reload — simplest way to make the shell re-evaluate
            // the gate state without wiring a setter through context.
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
      .then((j) => setData(j))
      .catch((e) => setError(String(e instanceof Error ? e.message : e)))
      .finally(() => setLoading(false));
  }, [secret]);

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

  // ---------- Dashboard ----------
  // No secret gate or chrome here — the shared AdminShell (layout.tsx)
  // owns the gate, sidebar, lang toggle and sign-out. This page just
  // renders the page-specific content as a fragment.
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
        <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }}>
          {data ? t.totalUsersFooter(data.counts.total) : loading ? t.loading : ""}
        </p>
      </div>
      <div>
        {error && (
          <div style={{ background: "#FEF2F2", color: "#991B1B", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Stat cards, labels and big numbers centered inside each card
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
            {/* Paying = real Stripe subscriptions (active or trialing).
                Excludes Family members and manual grants. Gadi
                (2026-06-29) flagged that the Deep count above mixes
                paying subscribers with manually-added family/schools
                members and was misleading. This card cuts through. */}
            <StatCard
              label={t.statPaying}
              value={data.counts.paying.total}
              accent="#059669"
              title={t.statPayingTooltip}
              sublabel={`${data.counts.paying.deep} Deep · ${data.counts.paying.clear} Clear`}
            />
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
                  {cc === "?" ? <span>🌐</span> : <FlagImg iso2={cc} />}
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
              {/* Column widths: User gets a sensible max so it stops
                  auto-expanding to fill the whole row (which created
                  the huge gap between user and plan Gadi flagged).
                  Plan / Country / Searches stay narrow with centered
                  content. Dates get enough room for a dd/mm/yyyy +
                  relative line. Provider is narrow. */}
              <colgroup>
                <col style={{ width: "30%" }} />
                <col style={{ width: 110 }} />
                <col style={{ width: 110 }} />
                <col style={{ width: 130 }} />
                <col style={{ width: 130 }} />
                <col style={{ width: 100 }} />
                <col style={{ width: 100 }} />
                <col style={{ width: 60 }} />
              </colgroup>
              <thead style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <tr>
                  <Th label={t.colUser} />
                  <Th label={t.colPlan}      onClick={() => toggleSort("plan", sortBy, sortDir, setSortBy, setSortDir)} active={sortBy === "plan"} dir={sortDir} align="center" />
                  <Th label={t.colCountry}   onClick={() => toggleSort("country", sortBy, sortDir, setSortBy, setSortDir)} active={sortBy === "country"} dir={sortDir} align="center" />
                  <Th label={t.colSignedUp}  onClick={() => toggleSort("createdAt", sortBy, sortDir, setSortBy, setSortDir)} active={sortBy === "createdAt"} dir={sortDir} />
                  <Th label={t.colLastSeen}  onClick={() => toggleSort("lastSeenAt", sortBy, sortDir, setSortBy, setSortDir)} active={sortBy === "lastSeenAt"} dir={sortDir} />
                  <Th label={t.colSearches}  onClick={() => toggleSort("searchCount", sortBy, sortDir, setSortBy, setSortDir)} active={sortBy === "searchCount"} dir={sortDir} align="center" />
                  <Th label={t.colProvider} align="center" />
                  <Th label={t.colActions} align="center" />
                </tr>
              </thead>
              <tbody>
                {filteredSorted.map((u) => {
                  const badge = planBadge(u.plan);
                  return (
                    <tr key={u.uid} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      {/* Every cell now sets textAlign:"start" explicitly.
                          'start' is the logical CSS value that resolves to
                          left in LTR and right in RTL — leaving it implicit
                          let some browsers fall back to literal "left" for
                          table cells, which is why the Hebrew rendering
                          kept stacking everything against the left edge.
                          Now the data follows the headers correctly:
                          start-aligned in both languages. */}
                      <td style={{ padding: "12px 16px", color: "#111827", textAlign: "start" }}>
                        {u.displayName && (
                          <div style={{ fontWeight: 600, color: "#111827", marginBottom: 2 }}>
                            {u.displayName}
                          </div>
                        )}
                        <div style={{ fontWeight: u.displayName ? 400 : 500, color: u.displayName ? "#4B5563" : "#111827" }}>
                          {u.email ?? "(no email)"}
                        </div>
                        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{u.uid.slice(0, 16)}…</div>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ background: badge.bg, color: badge.fg, padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#374151", textAlign: "center" }}>
                        {/* Country: real flag image + ISO code once.
                            The earlier 'emoji flag + code' rendered as
                            'il IL' on Windows (no emoji-flag glyph,
                            fell back to regional-indicator letters).
                            Now it's a clean flagcdn PNG followed by
                            the code. */}
                        {u.country ? (
                          <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                            <FlagImg iso2={u.country} />
                            <span>{u.country}</span>
                          </span>
                        ) : (
                          <span style={{ color: "#D1D5DB" }}>, </span>
                        )}
                      </td>
                      <td
                        style={{ padding: "12px 16px", color: "#111827", whiteSpace: "nowrap", textAlign: "start" }}
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
                        style={{ padding: "12px 16px", color: "#111827", whiteSpace: "nowrap", textAlign: "start" }}
                        title={formatAbsoluteTooltip(u.lastSeenAt ?? u.lastSignInAt, adminLang)}
                      >
                        <div style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                          {formatAbsoluteDate(u.lastSeenAt ?? u.lastSignInAt, adminLang)}
                        </div>
                        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                          {formatRelative(u.lastSeenAt ?? u.lastSignInAt, adminLang)}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#374151", textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
                        {u.searchCount}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#6B7280", fontSize: 12, textAlign: "center" }}>
                        {u.providers.map((p) => p.replace(".com", "").replace("password", "email")).join(", ")}
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          disabled={deletingUids.has(u.uid)}
                          title={t.deleteUserLabel}
                          aria-label={t.deleteUserLabel}
                          style={{
                            background: "transparent",
                            border: "1px solid #FCA5A5",
                            color: deletingUids.has(u.uid) ? "#9CA3AF" : "#DC2626",
                            borderRadius: 6,
                            padding: "5px 8px",
                            cursor: deletingUids.has(u.uid) ? "wait" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: deletingUids.has(u.uid) ? 0.6 : 1,
                          }}
                        >
                          {deletingUids.has(u.uid) ? (
                            <span style={{ fontSize: 11 }}>…</span>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M3 6h18" />
                              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredSorted.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>
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
    </>
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
  align?: "end" | "center";
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

function StatCard({
  label,
  value,
  accent,
  title,
  sublabel,
}: {
  label: string;
  value: number;
  accent?: string;
  title?: string;
  sublabel?: string;
}) {
  return (
    <div
      title={title}
      style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, textAlign: "center" }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: 0.5, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent ?? "#111827", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
        {value.toLocaleString()}
      </div>
      {sublabel && (
        <div style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
          {sublabel}
        </div>
      )}
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

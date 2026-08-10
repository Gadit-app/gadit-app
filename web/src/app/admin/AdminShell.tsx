"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminContextProvider, type AdminLang } from "./admin-context";

/**
 * AdminShell — the persistent chrome that wraps every /admin/* page.
 *
 * Responsibilities:
 *   - Hold the ADMIN_SECRET in localStorage and show the unlock form
 *     before any page below renders. Children only mount once unlocked.
 *   - Render a fixed sidebar with nav links to every admin page, the
 *     language toggle, and "back to app" / "sign out" actions.
 *   - Provide the (secret, lang) tuple to child pages via context so
 *     they don't have to re-do the gate themselves.
 *
 * In RTL (Hebrew), the sidebar parks on the right (the natural starting
 * edge); in LTR (English) it's on the left. Achieved via the parent
 * `dir` attribute + `inset-inline-start: 0` on the sidebar — no manual
 * positioning per language.
 */

const SECRET_KEY = "gadit_admin_secret_v1";
const ADMIN_LANG_KEY = "gadit_admin_lang_v1";

const STRINGS = {
  en: {
    unlockTitle: "Admin · Gadit",
    unlockBody: "Enter ADMIN_SECRET to view the dashboard.",
    unlockCta: "Unlock",
    unlockPlaceholder: "ADMIN_SECRET",
    overview: "Overview",
    strategy: "Strategy",
    users: "Subscribers",
    revenue: "Revenue",
    campaigns: "Campaigns",
    emails: "Emails",
    activity: "Activity",
    reports: "Reports",
    partners: "Partners",
    deletions: "Deletions",
    wordsets: "Word sets",
    secMarketing: "Marketing & growth",
    secUsers: "Subscribers",
    secFinance: "Finance",
    secContent: "Content & support",
    backToApp: "Back to app",
    signOut: "Sign out",
    langToggle: "עברית",
    wrongSecret: "Wrong secret.",
  },
  he: {
    unlockTitle: "ניהול · Gadit",
    unlockBody: "הזן את ADMIN_SECRET כדי לצפות בלוח הניהול.",
    unlockCta: "פתח",
    unlockPlaceholder: "ADMIN_SECRET",
    overview: "סקירה",
    strategy: "תוכנית אסטרטגית",
    users: "מנויים",
    revenue: "הכנסות",
    campaigns: "קמפיינים",
    emails: "מיילים",
    activity: "פעילות",
    reports: "דיווחים",
    partners: "שותפים",
    deletions: "מחיקות",
    wordsets: "מערכי מילים",
    secMarketing: "שיווק וצמיחה",
    secUsers: "מנויים",
    secFinance: "כספים",
    secContent: "תוכן ותמיכה",
    backToApp: "חזרה לאפליקציה",
    signOut: "התנתק",
    langToggle: "English",
    wrongSecret: "סיסמה שגויה.",
  },
} as const satisfies Record<AdminLang, Record<string, string>>;

type NavItem = {
  href: string;
  labelKey: keyof typeof STRINGS["en"];
  icon: React.ReactNode;
};

// Grouped nav (Gadi 2026-08-05, modelled on the Yooniz admin sidebar):
// section headers by topic so it's easier to navigate. A null title = the
// top group (Overview / Strategy) with no header.
type NavSection = { titleKey: keyof typeof STRINGS["en"] | null; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  { titleKey: null, items: [
    { href: "/admin",           labelKey: "overview",  icon: <IconHome />   },
  ] },
  { titleKey: "secUsers", items: [
    { href: "/admin/users",     labelKey: "users",     icon: <IconUsers />    },
    { href: "/admin/searches",  labelKey: "activity",  icon: <IconActivity /> },
    { href: "/admin/deletions", labelKey: "deletions", icon: <IconTrash />    },
  ] },
  { titleKey: "secMarketing", items: [
    { href: "/admin/strategy",  labelKey: "strategy",  icon: <IconTarget /> },
    { href: "/admin/campaigns", labelKey: "campaigns", icon: <IconMegaphone /> },
    { href: "/admin/partners",  labelKey: "partners",  icon: <IconHandshake /> },
  ] },
  { titleKey: "secFinance", items: [
    { href: "/admin/revenue",   labelKey: "revenue",   icon: <IconCoins /> },
  ] },
  { titleKey: "secContent", items: [
    { href: "/admin/sets",      labelKey: "wordsets",  icon: <IconGrid /> },
    { href: "/admin/emails",    labelKey: "emails",    icon: <IconMail /> },
    { href: "/admin/reports",   labelKey: "reports",   icon: <IconFlag /> },
  ] },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [secret, setSecret] = useState<string | null>(null);
  const [adminLang, setAdminLang] = useState<AdminLang>("en");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname() ?? "/admin";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedSecret = localStorage.getItem(SECRET_KEY);
    if (storedSecret) setSecret(storedSecret);
    const storedLang = localStorage.getItem(ADMIN_LANG_KEY);
    if (storedLang === "he" || storedLang === "en") setAdminLang(storedLang);
    setMounted(true);
  }, []);

  const toggleLang = () => {
    const next: AdminLang = adminLang === "en" ? "he" : "en";
    setAdminLang(next);
    if (typeof window !== "undefined") localStorage.setItem(ADMIN_LANG_KEY, next);
  };

  const signOut = () => {
    if (typeof window !== "undefined") localStorage.removeItem(SECRET_KEY);
    setSecret(null);
  };

  const handleSecretSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("secret") as HTMLInputElement | null;
    const value = input?.value.trim();
    if (!value) return;
    localStorage.setItem(SECRET_KEY, value);
    setSecret(value);
  };

  // Avoid SSR/CSR mismatch: render nothing until we've hydrated and
  // decided whether to show the gate or the dashboard. A flash of the
  // wrong layout for one frame reads worse than a brief blank.
  if (!mounted) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#F9FAFB",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      />
    );
  }

  const t = STRINGS[adminLang];
  const isRtl = adminLang === "he";

  // Secret gate — no sidebar yet, just the unlock card.
  if (!secret) {
    return (
      <main
        dir={isRtl ? "rtl" : "ltr"}
        style={{
          minHeight: "100vh",
          background: "#F9FAFB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <form
          onSubmit={handleSecretSubmit}
          style={{
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            padding: 28,
            maxWidth: 400,
            width: "100%",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <h1 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#111827" }}>
            {t.unlockTitle}
          </h1>
          <p style={{ margin: "0 0 16px", fontSize: 14, color: "#6B7280" }}>{t.unlockBody}</p>
          <input
            name="secret"
            type="password"
            placeholder={t.unlockPlaceholder}
            autoFocus
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>{t.unlockCta}</button>
          {/* Language toggle right under the unlock CTA so a Hebrew
              admin who lands on an English-default shell can flip
              before unlocking. */}
          <button
            type="button"
            onClick={toggleLang}
            style={{
              ...buttonStyle,
              marginTop: 8,
              background: "#F3F4F6",
              color: "#374151",
            }}
          >
            {t.langToggle}
          </button>
        </form>
      </main>
    );
  }

  // Unlocked — render the sidebar + the page children.
  return (
    <AdminContextProvider value={{ secret, lang: adminLang }}>
      <main
        dir={isRtl ? "rtl" : "ltr"}
        style={{
          minHeight: "100vh",
          background: "#F9FAFB",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <style>{ADMIN_SHELL_MOBILE_CSS}</style>
        <div className="admin-shell-flex" style={{ display: "flex", minHeight: "100vh" }}>
          {/* Sidebar, fixed width, sticky to the start edge.
              `align-self: stretch` + `height: 100vh` makes the dark
              background reach all the way to the viewport bottom even
              when the content area is short (Gadi 2026-06-22: the
              previous flex-start layout left the sidebar floating at
              its own intrinsic height with the gray bg showing under
              it). A 3px teal stripe on the inner edge (RTL: left, LTR:
              right) is the brand accent that ties the chrome to the
              Gadit wordmark's italic-teal "it". */}
          <aside
            className="admin-shell-aside"
            style={{
              width: 220,
              flexShrink: 0,
              background: "#111827",
              color: "#F9FAFB",
              padding: "24px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              position: "sticky",
              top: 0,
              alignSelf: "stretch",
              height: "100vh",
              overflowY: "auto",
              borderInlineEnd: "3px solid #0EA5A5",
            }}
          >
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 6px", marginBottom: 16 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#FFFFFF", direction: "ltr" }}>
                Gad<span style={{ color: "#0EA5A5", fontStyle: "italic" }}>it</span>
              </span>
              <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
                {isRtl ? "ניהול" : "Admin"}
              </span>
            </div>

            {/* Language toggle right under the logo */}
            <button
              onClick={toggleLang}
              style={{
                background: "#1F2937",
                color: "#E5E7EB",
                border: "1px solid #374151",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: 8,
              }}
            >
              {t.langToggle}
            </button>

            {/* Nav items */}
            <nav className="admin-shell-nav" style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 8 }}>
              {NAV_SECTIONS.map((section, si) => (
                <div key={si} className="admin-nav-group" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {section.titleKey && (
                    <div
                      className="admin-nav-section-title"
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                        color: "#6B7280",
                        padding: "14px 10px 4px",
                      }}
                    >
                      {t[section.titleKey]}
                    </div>
                  )}
                  {section.items.map((item) => {
                    const active =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 10px",
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          textDecoration: "none",
                          color: active ? "#FFFFFF" : "#9CA3AF",
                          background: active ? "#0EA5A5" : "transparent",
                          transition: "background 0.15s, color 0.15s",
                        }}
                      >
                        <span style={{ width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          {item.icon}
                        </span>
                        <span>{t[item.labelKey]}</span>
                      </a>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Bottom, back to app + sign out, pinned to the bottom
                so they're always reachable without scroll. */}
            <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #1F2937", display: "flex", flexDirection: "column", gap: 2 }}>
              <a
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                  color: "#9CA3AF",
                }}
              >
                <span style={{ width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <IconArrowOut />
                </span>
                <span>{t.backToApp}</span>
              </a>
              <button
                onClick={signOut}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: "transparent",
                  border: "none",
                  color: "#9CA3AF",
                  cursor: "pointer",
                  textAlign: "start",
                }}
              >
                <span style={{ width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <IconLogout />
                </span>
                <span>{t.signOut}</span>
              </button>
            </div>
          </aside>

          {/* Main content area */}
          <div className="admin-shell-content" style={{ flex: 1, padding: "24px 16px 64px", minWidth: 0 }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              {children}
            </div>
          </div>
        </div>
      </main>
    </AdminContextProvider>
  );
}

// ----- Icons (tiny SVGs to avoid pulling in a library) -----

function IconHome() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  );
}
function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  );
}
function IconTarget() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
  );
}
function IconCoins() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>
  );
}
function IconMegaphone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
  );
}
function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  );
}
function IconActivity() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  );
}
function IconFlag() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
  );
}
function IconHandshake() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg>
  );
}
function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
  );
}
function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
  );
}
function IconArrowOut() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
  );
}
function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
  );
}

// Mobile: the fixed 220px dark sidebar eats most of a phone screen and
// crushes the content (Gadi 2026-08-04). Below 768px the shell stacks:
// the sidebar becomes a compact top bar with a horizontal wrapping nav,
// and the content takes the full width.
const ADMIN_SHELL_MOBILE_CSS = `
@media (max-width: 768px) {
  .admin-shell-flex { flex-direction: column; }
  .admin-shell-aside {
    width: 100% !important;
    height: auto !important;
    position: static !important;
    flex-direction: row !important;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px !important;
    padding: 10px 12px !important;
    border-inline-end: none !important;
    border-bottom: 3px solid #0EA5A5 !important;
    overflow: visible !important;
  }
  .admin-shell-nav { flex-direction: row !important; flex-wrap: wrap; margin-top: 0 !important; gap: 4px !important; }
  .admin-shell-nav a { padding: 8px 11px !important; }
  .admin-shell-content { padding: 16px 12px 48px !important; }
}
`;

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #D1D5DB",
  fontSize: 14,
  marginBottom: 12,
  outline: "none",
  fontFamily: "inherit",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  background: "#0EA5A5",
  color: "white",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

"use client";

/**
 * WbUserMenu — avatar button that opens a small popover with account
 * actions ("Account details", "Sign out").
 *
 * Replaces the bare <Link href="/account"> on .wb-avatar across every
 * CrispTech-design page (Home / Pricing / Features / Notebook / Word /
 * Account). The old single-link behavior forced users into the Account
 * page just to log out, which is a multi-tap dead-end — especially
 * confusing for someone who signed in by mistake (e.g. on a household
 * shared device) and just wants out.
 *
 * Behavior:
 *   - Avatar is a button. Tap → dropdown opens below.
 *   - Two actions: "Account details" (→ /account) and "Sign out"
 *     (calls auth-context.logout()).
 *   - Closes on outside click, Escape, or option selection.
 *   - Positions on the start side or end side depending on the page's
 *     dir attribute so it stays within the viewport in both LTR and RTL.
 *
 * Visual: matches .wb-avatar (teal disk / 34px / first-letter or photo).
 * Dropdown is a small white card with rounded corners and soft shadow,
 * tracking the rest of the wordbook surface chrome.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import type { Lang } from "@/lib/i18n";

type Copy = {
  account: string;
  family: string;
  school: string;
  dashboard: string;
  signOut: string;
  openMenu: string;
};

const COPY: Record<string, Copy> = {
  en: { account: "Account",            family: "My family",         school: "My school",         dashboard: "Partner area",  signOut: "Sign out",    openMenu: "Open account menu" },
  he: { account: "החשבון שלי",          family: "המשפחה שלי",        school: "בית הספר שלי",      dashboard: "אזור שותפים",   signOut: "התנתקות",     openMenu: "פתח תפריט חשבון" },
  ar: { account: "حسابي",               family: "عائلتي",           school: "مدرستي",            dashboard: "منطقة الشركاء", signOut: "تسجيل الخروج", openMenu: "افتح قائمة الحساب" },
  ru: { account: "Аккаунт",             family: "Моя семья",         school: "Моя школа",         dashboard: "Партнёрам",     signOut: "Выйти",       openMenu: "Открыть меню аккаунта" },
  es: { account: "Cuenta",              family: "Mi familia",        school: "Mi escuela",        dashboard: "Área de socios", signOut: "Cerrar sesión", openMenu: "Abrir menú de cuenta" },
  pt: { account: "Conta",               family: "Minha família",     school: "Minha escola",      dashboard: "Área de parceiros", signOut: "Sair",        openMenu: "Abrir menu da conta" },
  fr: { account: "Compte",              family: "Ma famille",        school: "Mon école",         dashboard: "Espace partenaires", signOut: "Déconnexion", openMenu: "Ouvrir le menu du compte" },
  de: { account: "Konto",               family: "Meine Familie",     school: "Meine Schule",      dashboard: "Partnerbereich", signOut: "Abmelden",    openMenu: "Kontomenü öffnen" },
  cs: { account: "Účet",                family: "Moje rodina",       school: "Moje škola",        dashboard: "Pro partnery",  signOut: "Odhlásit se", openMenu: "Otevřít menu účtu" },
  sk: { account: "Účet",                family: "Moja rodina",       school: "Moja škola",        dashboard: "Pre partnerov", signOut: "Odhlásiť sa", openMenu: "Otvoriť menu účtu" },
  it: { account: "Account",             family: "La mia famiglia",   school: "La mia scuola",     dashboard: "Area partner",  signOut: "Esci",        openMenu: "Apri menu account" },
  ja: { account: "アカウント",            family: "私の家族",            school: "私の学校",            dashboard: "パートナーエリア", signOut: "ログアウト",   openMenu: "アカウントメニューを開く" },
  hi: { account: "खाता",                 family: "मेरा परिवार",       school: "मेरा स्कूल",         dashboard: "पार्टनर क्षेत्र", signOut: "साइन आउट",    openMenu: "खाता मेनू खोलें" },
  am: { account: "መለያ",                 family: "ቤተሰቤ",             school: "ትምህርት ቤቴ",        dashboard: "የአጋሮች ክፍል",   signOut: "ዘግተው ይውጡ",  openMenu: "የመለያ ምናሌ ክፈት" },
};

// Tier chip colors. Mirrors the same scheme used on /account and
// /pricing — Basic gray, Clear teal, Deep purple — so a signed-in user
// recognises their plan badge across every surface.
function tierStyle(
  plan: "basic" | "clear" | "deep",
  opts: { familyId?: string | null; schoolId?: string | null } = {},
): { label: string; bg: string; fg: string } {
  // Family and Schools both store plan="deep" (same feature set). Show the
  // REAL tier on the chip so a Family owner reads "Family", not "Deep"
  // (Gadi 2026-08-05). Family = brand blue; Schools = mustard.
  if (opts.familyId) return { label: "Family",  bg: "#DBEAFE", fg: "#1D4ED8" };
  if (opts.schoolId) return { label: "Schools", bg: "#FEF3C7", fg: "#92400E" };
  if (plan === "deep")  return { label: "Deep",  bg: "#F3EEFF", fg: "#7C3AED" };
  if (plan === "clear") return { label: "Clear", bg: "#E0F6F4", fg: "#0E7490" };
  return                       { label: "Basic", bg: "#F3F4F6", fg: "#4B5563" };
}

import { FamilyProfileSwitcher } from "./FamilyProfileSwitcher";

export function WbUserMenu() {
  const { user, plan, familyId, schoolId, familyRole, logout } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();
  const href = useHref();
  const [open, setOpen] = useState(false);
  // Which inline side the dropdown anchors to. Computed at open time
  // from the trigger's actual viewport position — the avatar lives at
  // the inline-END of the topbar on desktop but at the inline-START
  // (next to the wordmark, mobile identity cluster) on phones, so a
  // hardcoded side sends the panel off-screen on one of them. Gadi's
  // 2026-07-03 screenshot: EN mobile, menu clipped off the left edge.
  const [alignStart, setAlignStart] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const toggleOpen = () => {
    const el = wrapRef.current;
    if (el && typeof window !== "undefined") {
      const r = el.getBoundingClientRect();
      const triggerCenter = r.left + r.width / 2;
      const viewportCenter = window.innerWidth / 2;
      // The panel must grow toward the roomy half of the screen.
      // "Anchor to inline-start" means: LTR → left edge pinned, grows
      // right; RTL → right edge pinned, grows left.
      setAlignStart(
        dir === "rtl" ? triggerCenter > viewportCenter : triggerCenter < viewportCenter,
      );
    }
    setOpen((v) => !v);
  };

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const c = COPY[lang] ?? COPY.en;
  const initial = (user.email?.[0] || user.displayName?.[0] || "G").toUpperCase();

  const onSignOut = async () => {
    setOpen(false);
    try {
      await logout();
      // After logout, route to home in the user's current language so
      // the now-anonymous user lands somewhere coherent rather than
      // staying on /account (which would just bounce them back to a
      // login modal).
      router.push(href("/"));
    } catch (err) {
      console.error("logout failed:", err);
    }
  };

  // Side chosen at open time (see toggleOpen): anchor the panel so it
  // grows toward the page interior from wherever the trigger actually
  // sits, desktop actions cluster or mobile identity cluster alike.
  const sideOffset: React.CSSProperties = alignStart
    ? { insetInlineStart: 0 }
    : { insetInlineEnd: 0 };

  const tier = tierStyle(plan, { familyId, schoolId });

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {/* Plan chip, clicking it opens the same menu as clicking the
          avatar, so the entire grouping reads as one control. Hidden
          on very narrow viewports to keep the topbar from wrapping. */}
      <button
        type="button"
        aria-label={c.openMenu}
        onClick={toggleOpen}
        className="wb-tier-chip"
        style={{
          padding: "4px 10px",
          borderRadius: 999,
          background: tier.bg,
          color: tier.fg,
          border: "none",
          cursor: "pointer",
          fontFamily:
            lang === "he" ? "var(--wb-he)"
              : lang === "ar" ? "var(--wb-ar)"
                : "var(--wb-sans)",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          lineHeight: 1.4,
          whiteSpace: "nowrap",
        }}
      >
        {tier.label}
      </button>
      <button
        type="button"
        className="wb-avatar"
        aria-label={c.openMenu}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggleOpen}
        style={{ border: "none", padding: 0, cursor: "pointer" }}
      >
        {user.photoURL ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={user.photoURL} alt="" />
        ) : (
          <span>{initial}</span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            insetBlockStart: "calc(100% + 8px)",
            ...sideOffset,
            minWidth: 200,
            // Never wider than the viewport minus a safe gutter — a
            // long email (menu header) must ellipsize, not push the
            // panel off-screen on narrow phones.
            maxWidth: "min(300px, calc(100vw - 24px))",
            background: "var(--surface, #FFFFFF)",
            color: "var(--ink, #111827)",
            border: "1px solid var(--hairline, #E5E7EB)",
            borderRadius: 12,
            boxShadow: "0 12px 32px rgba(13, 22, 38, 0.10), 0 2px 6px rgba(13, 22, 38, 0.06)",
            padding: 6,
            zIndex: 100,
            fontFamily:
              lang === "he"
                ? "var(--wb-he, Rubik, system-ui, sans-serif)"
                : lang === "ar"
                ? "var(--wb-ar, 'Noto Naskh Arabic', system-ui, sans-serif)"
                : "var(--wb-sans, Inter, system-ui, sans-serif)",
            // Match page direction so menu text aligns correctly
            direction: dir,
          }}
        >
          {/* Email row, read-only context so the user knows which
              account they're about to act on. Important when several
              family members share a device. */}
          {user.email && (
            <div
              style={{
                padding: "8px 12px 10px",
                fontSize: 12,
                color: "var(--muted, #6B7280)",
                borderBottom: "1px solid var(--hairline, #F3F4F6)",
                marginBottom: 4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={user.email}
            >
              {user.email}
            </div>
          )}
          {/* Shared-device family profile switcher — lets a kid switch
              to a sibling on a shared computer without a new code. */}
          <FamilyProfileSwitcher onSwitch={() => setOpen(false)} />
          <Link
            role="menuitem"
            href={href("/account")}
            onClick={() => setOpen(false)}
            style={{
              display: "block",
              padding: "10px 12px",
              borderRadius: 8,
              color: "var(--ink, #111827)",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper, #F9FAFB)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {c.account}
          </Link>
          {/* Family menu item appears only for owners of a Family
              subscription (familyId === own uid). Paired members (kids
              + secondary parents) don't need to manage the family. */}
          {familyId && user.uid === familyId && (
            <Link
              role="menuitem"
              href={href("/family")}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "10px 12px",
                borderRadius: 8,
                color: "var(--ink, #111827)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper, #F9FAFB)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {c.family}
            </Link>
          )}
          {/* My school menu item appears only for owners of a Schools
              subscription (schoolId === own uid). The principal lands
              on /schools/manage to manage classrooms + see weekly word
              digests. Gadi (2026-06-29) flagged that this was routing
              to /schools (the marketing landing) which is wrong for an
              owner who clicked "My school" expecting their dashboard.
              Teachers (when we add a teacher seat in V2) would route
              somewhere else. */}
          {schoolId && user.uid === schoolId && (
            <Link
              role="menuitem"
              href={href("/schools/manage")}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "10px 12px",
                borderRadius: 8,
                color: "var(--ink, #111827)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper, #F9FAFB)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {c.school}
            </Link>
          )}
          {/* Partner area is commercial — never shown to a kid. */}
          {familyRole !== "kid" && (
            <Link
              role="menuitem"
              href={href("/partners")}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "10px 12px",
                borderRadius: 8,
                color: "var(--ink, #111827)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper, #F9FAFB)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {c.dashboard}
            </Link>
          )}
          <button
            role="menuitem"
            type="button"
            onClick={onSignOut}
            style={{
              display: "block",
              width: "100%",
              textAlign: dir === "rtl" ? "right" : "left",
              padding: "10px 12px",
              borderRadius: 8,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--ink, #111827)",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper, #F9FAFB)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {c.signOut}
          </button>
        </div>
      )}
    </div>
  );
}

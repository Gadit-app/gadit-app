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
import type { Lang } from "@/lib/i18n";

type Copy = { account: string; signOut: string; openMenu: string };

const COPY: Record<Lang, Copy> = {
  en: { account: "Account",            signOut: "Sign out",    openMenu: "Open account menu" },
  he: { account: "החשבון שלי",          signOut: "התנתקות",     openMenu: "פתח תפריט חשבון" },
  ar: { account: "حسابي",               signOut: "تسجيل الخروج", openMenu: "افتح قائمة الحساب" },
  ru: { account: "Аккаунт",             signOut: "Выйти",       openMenu: "Открыть меню аккаунта" },
  es: { account: "Cuenta",              signOut: "Cerrar sesión", openMenu: "Abrir menú de cuenta" },
  pt: { account: "Conta",               signOut: "Sair",        openMenu: "Abrir menu da conta" },
  fr: { account: "Compte",              signOut: "Déconnexion", openMenu: "Ouvrir le menu du compte" },
  de: { account: "Konto",               signOut: "Abmelden",    openMenu: "Kontomenü öffnen" },
  cs: { account: "Účet",                signOut: "Odhlásit se", openMenu: "Otevřít menu účtu" },
};

// Tier chip colors. Mirrors the same scheme used on /account and
// /pricing — Basic gray, Clear teal, Deep purple — so a signed-in user
// recognises their plan badge across every surface.
function tierStyle(plan: "basic" | "clear" | "deep"): {
  label: string; bg: string; fg: string;
} {
  if (plan === "deep")  return { label: "Deep",  bg: "#F3EEFF", fg: "#7C3AED" };
  if (plan === "clear") return { label: "Clear", bg: "#E0F6F4", fg: "#0E7490" };
  return                       { label: "Basic", bg: "#F3F4F6", fg: "#4B5563" };
}

export function WbUserMenu() {
  const { user, plan, logout } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

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
      // After logout, route to home so the now-anonymous user lands
      // somewhere coherent rather than staying on /account (which
      // would just bounce them back to a login modal).
      router.push("/");
    } catch (err) {
      console.error("logout failed:", err);
    }
  };

  // Always pin the dropdown to the end side of the wrapper so it
  // extends toward the page interior — never off-screen. In LTR this
  // means its right edge aligns with the avatar's right edge (dropdown
  // grows leftward); in RTL its left edge aligns with the avatar's
  // left edge (dropdown grows rightward). The earlier insetInlineStart
  // fallback for RTL pushed the menu off the left of the viewport when
  // the avatar sat in the top-left (its visual position in RTL).
  const sideOffset: React.CSSProperties = { insetInlineEnd: 0 };

  const tier = tierStyle(plan);

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
      {/* Plan chip — clicking it opens the same menu as clicking the
          avatar, so the entire grouping reads as one control. Hidden
          on very narrow viewports to keep the topbar from wrapping. */}
      <button
        type="button"
        aria-label={c.openMenu}
        onClick={() => setOpen((v) => !v)}
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
        onClick={() => setOpen((v) => !v)}
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
          {/* Email row — read-only context so the user knows which
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
          <Link
            role="menuitem"
            href="/account"
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

"use client";

import { createContext, useContext } from "react";

/**
 * Tiny context shared across every /admin/* page. The layout (which is
 * the only thing that creates this provider) handles the secret gate
 * and the language toggle, then exposes both values to the per-page
 * AdminClient components below.
 *
 * Children read with useAdminContext() — no prop drilling, no re-fetching
 * the secret from localStorage on every page.
 */

export type AdminLang = "en" | "he";

export type AdminContextValue = {
  /** The ADMIN_SECRET the user unlocked the dashboard with. */
  secret: string;
  /** Current admin UI language (independent of the public app lang). */
  lang: AdminLang;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export const AdminContextProvider = AdminContext.Provider;

export function useAdminContext(): AdminContextValue {
  const v = useContext(AdminContext);
  if (!v) {
    // This should be impossible — pages only render once the layout
    // has unlocked the gate. If you see this, the page was rendered
    // outside the /admin route segment.
    throw new Error("useAdminContext called outside /admin/* layout");
  }
  return v;
}

import type { Metadata } from "next";
import { AdminShell } from "./AdminShell";

/**
 * Shared layout for every /admin/* page.
 *
 * Wraps children in AdminShell which renders the persistent sidebar,
 * handles the ADMIN_SECRET unlock gate, and exposes (secret, lang) to
 * children via AdminContext. Per-page components don't have to re-do
 * any of that.
 *
 * The title template prefixes every admin tab with "Gadit - Admin" so
 * the admin tab is instantly recognisable in a crowded browser tab bar
 * even when truncated (Gadi 2026-08-11). Each page sets just its section
 * name (e.g. "Revenue") and the tab reads "Gadit - Admin · Revenue".
 */
export const metadata: Metadata = {
  title: {
    default: "Gadit - Admin",
    template: "Gadit - Admin · %s",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

import { AdminShell } from "./AdminShell";

/**
 * Shared layout for every /admin/* page.
 *
 * Wraps children in AdminShell which renders the persistent sidebar,
 * handles the ADMIN_SECRET unlock gate, and exposes (secret, lang) to
 * children via AdminContext. Per-page components don't have to re-do
 * any of that.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

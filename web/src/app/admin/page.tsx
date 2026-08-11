import AdminOverviewClient from "./AdminOverviewClient";

/**
 * Admin overview dashboard — the morning-glance view of the whole app.
 * Lives at /admin (the root admin URL) so a bookmark to /admin lands
 * here. Same ADMIN_SECRET gate as the other admin pages; once unlocked,
 * the secret stays in localStorage and the nested pages (/admin/users,
 * /admin/revenue, /admin/campaigns) reuse it.
 *
 * Not indexed.
 */
export const metadata = {
  title: "Overview",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminOverviewClient />;
}

import AdminStrategyClient from "./AdminStrategyClient";

/**
 * Strategic marketing plan tracker. Same ADMIN_SECRET gate (handled by the
 * /admin layout) as the sibling admin pages.
 */
export const metadata = {
  title: "Admin · Strategy, Gadit",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminStrategyClient />;
}

import AdminPartnersClient from "./AdminPartnersClient";

/**
 * Partner (affiliate) program management. Same ADMIN_SECRET gate (handled
 * by the /admin layout) as the sibling admin pages.
 */
export const metadata = {
  title: "Admin · Partners, Gadit",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminPartnersClient />;
}

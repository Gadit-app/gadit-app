import AdminSearchesClient from "./AdminSearchesClient";

/**
 * Internal search-analytics dashboard — top searched words per UI
 * language, gated by ADMIN_SECRET on the server endpoint.
 *
 * Not indexed; reuses the same secret + sessionStorage pattern as
 * /admin/users so unlocking one unlocks both for the tab session.
 */
export const metadata = {
  title: "Admin · Searches, Gadit",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminSearchesClient />;
}

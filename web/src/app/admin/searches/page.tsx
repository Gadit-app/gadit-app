import AdminSearchesClient from "./AdminSearchesClient";

/**
 * Internal search-analytics dashboard — top searched words per UI
 * language, gated by ADMIN_SECRET on the server endpoint.
 *
 * Not indexed. The secret and admin language come from the shared
 * AdminShell (localStorage), so unlocking any admin page unlocks this one.
 */
export const metadata = {
  title: "Top words",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminSearchesClient />;
}

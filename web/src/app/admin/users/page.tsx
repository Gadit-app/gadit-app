import AdminUsersClient from "./AdminUsersClient";

/**
 * Internal user dashboard — gated by ADMIN_SECRET on the server endpoint.
 *
 * Page is fully client-side: prompts for the admin secret on first visit
 * (stored in sessionStorage so a tab refresh doesn't re-prompt), calls
 * /api/admin/users with it, renders the table.
 *
 * Not indexed (the parent /admin segment has no public links anywhere) and
 * the endpoint refuses without the secret, so accidental discovery yields
 * a 401, not data.
 */
export const metadata = {
  title: "Admin · Users, Gadit",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminUsersClient />;
}

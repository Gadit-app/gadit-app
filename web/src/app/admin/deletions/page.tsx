import AdminDeletionsClient from "./AdminDeletionsClient";

/**
 * Deletion audit log — every account removal (self-service + admin),
 * newest first. Gated by ADMIN_SECRET on the server endpoint. Not
 * indexed; reuses the shared AdminShell chrome.
 */
export const metadata = {
  title: "Admin · Deletions, Gadit",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminDeletionsClient />;
}

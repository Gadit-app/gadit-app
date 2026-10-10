import AdminAuthErrorsClient from "./AdminAuthErrorsClient";

/**
 * Failed sign-ins, grouped by address. Gated by ADMIN_SECRET on the server
 * endpoint. Not indexed; reuses the shared AdminShell chrome.
 */
export const metadata = {
  title: "Sign-in problems",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminAuthErrorsClient />;
}

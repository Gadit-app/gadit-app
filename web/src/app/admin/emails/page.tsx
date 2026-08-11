import { AdminEmailsClient } from "./AdminEmailsClient";

/**
 * Internal email-delivery ledger — gated by ADMIN_SECRET on the server
 * endpoint (/api/admin/emails). Shows which drip emails every user
 * received and when, from our permanent Firestore stamps rather than
 * Resend's short-retention dashboard.
 */
export const metadata = {
  title: "Emails",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminEmailsClient />;
}

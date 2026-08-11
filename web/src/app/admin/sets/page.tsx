import AdminSetsClient from "./AdminSetsClient";

/**
 * Classroom word-set review grid. Per set: every word's curated
 * definition, cached projector image, and cached examples, with
 * one-click regenerate + a per-set batch warm. Gated by ADMIN_SECRET
 * (shell gate + server endpoints). Not indexed.
 */
export const metadata = {
  title: "Word sets",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminSetsClient />;
}

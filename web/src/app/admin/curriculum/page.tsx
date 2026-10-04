import AdminCurriculumClient from "./AdminCurriculumClient";

/**
 * Curriculum catalog editor: the key words and in-lesson definitions of
 * every curriculum unit. Gated by ADMIN_SECRET (shell gate + server API).
 */
export const metadata = {
  title: "Curriculum",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminCurriculumClient />;
}

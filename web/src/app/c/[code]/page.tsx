import type { Metadata } from "next";
import { ClassroomKidClient } from "./ClassroomKidClient";

/**
 * /c/<CODE> — kid landing page for a classroom.
 *
 * No authentication. A kid types the code their teacher posted on the
 * board, lands here, sees their school's logo + a friendly welcome, and
 * a single search box. Words they search go to /word/<word>?cls=<CODE>
 * which writes a search log entry via /api/classroom/log-search.
 *
 * Why no auth: students under 13 don't have email addresses they can
 * use to sign up, and Gadit's whole school value prop is "kids share
 * one classroom computer." The class code is the only identifier; the
 * URL itself is the credential.
 */
export const metadata: Metadata = {
  title: "Classroom, Gadit",
  robots: { index: false, follow: false },
};

export default async function ClassroomKidRoute({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <ClassroomKidClient code={code} />;
}

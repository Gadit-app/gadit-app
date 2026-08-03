import type { Metadata } from "next";
import { TeacherByCodeClient } from "./TeacherByCodeClient";

/**
 * /t/<CODE> — teacher-by-code classroom insights.
 *
 * Gadi 2026-08-03: teachers have no accounts (the Schools SKU has no
 * student or teacher logins by design). The principal shares this
 * per-classroom link and the teacher sees ONLY their own class's
 * insights — language map, stuck words, a private support signal —
 * with no login. Same Kahoot-style trust model as /c/<CODE>: the code
 * is the key.
 */
export const metadata: Metadata = {
  title: "Class insights, Gadit",
  robots: { index: false, follow: false },
};

export default async function TeacherByCodeRoute({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <TeacherByCodeClient code={code} />;
}

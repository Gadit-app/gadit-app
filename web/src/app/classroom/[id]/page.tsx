import type { Metadata } from "next";
import { TeacherClassroomClient } from "./TeacherClassroomClient";

/**
 * /classroom/<id> — teacher view for one classroom.
 *
 * Shows the classroom code prominently (so the teacher can post it on
 * the board), the most recent words searched by the class, and an
 * export option. Only the school owner can open this page — auth
 * gating happens in the client.
 */
export const metadata: Metadata = {
  title: "Classroom, Gadit",
  robots: { index: false, follow: false },
};

export default async function ClassroomTeacherRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TeacherClassroomClient classroomId={id} />;
}

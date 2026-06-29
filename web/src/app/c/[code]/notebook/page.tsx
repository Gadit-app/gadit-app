import { ClassroomNotebookClient } from "./ClassroomNotebookClient";
import { normalizeClassCode } from "@/lib/school";

export const dynamic = "force-dynamic";

export default async function ClassroomNotebookPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: raw } = await params;
  const code = normalizeClassCode(raw);
  return <ClassroomNotebookClient code={code ?? raw} />;
}

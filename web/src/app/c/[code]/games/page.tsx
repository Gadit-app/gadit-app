import { ClassroomGamesClient } from "./ClassroomGamesClient";
import { normalizeClassCode } from "@/lib/school";

export const dynamic = "force-dynamic";

export default async function ClassroomGamesPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: raw } = await params;
  const code = normalizeClassCode(raw);
  return <ClassroomGamesClient code={code ?? raw} />;
}

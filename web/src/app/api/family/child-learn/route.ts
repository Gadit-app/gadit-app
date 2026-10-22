import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { isLearnLang, learnTargets, type Reads } from "@/lib/learn/engine";
import { setupLearn } from "@/lib/learn/setup";

/**
 * POST /api/family/child-learn  (Bearer, the family owner)
 *   { memberId, lang: "en" | "he" | null, reads: "no" | "little" | "yes", ui }
 *
 * The parent's learning setting for one child (2026-10-22): until now only
 * the child set learning mode on their own device. Writes the child's
 * users/{uid}.learn through the same helper as the child's own setup
 * (lib/learn/setup), so both write the same fields.
 *
 * Owner-only, like /api/family/progress: the caller's uid is the family
 * doc's id, and the member must be a paired child of that family. The
 * language must be one the child's app language can learn (learnTargets);
 * the child's own app language counts, else the dashboard's.
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const h = req.headers.get("Authorization") || "";
  const user = await verifyUserAndGetPlan(h.startsWith("Bearer ") ? h.slice(7) : null);
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const memberId = typeof b.memberId === "string" ? b.memberId.slice(0, 128) : "";
  if (!memberId || memberId.includes("/")) return NextResponse.json({ error: "member_required" }, { status: 400 });

  const db = getAdminDb();
  const fam = db.collection("families").doc(user.userId);
  if (!(await fam.get()).exists) return NextResponse.json({ error: "not_family_owner" }, { status: 403 });
  const member = (await fam.collection("members").doc(memberId).get()).data() as { userId?: string | null; role?: string } | undefined;
  if (!member) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (member.role === "father" || member.role === "mother") return NextResponse.json({ error: "not_a_child" }, { status: 400 });
  if (!member.userId) return NextResponse.json({ error: "not_linked" }, { status: 409 });

  const ref = db.collection("users").doc(member.userId);
  const childUi = ((await ref.get()).get("uiLang") as string | undefined) || (typeof b.ui === "string" ? b.ui.slice(0, 8) : "he");
  const lang = b.lang === null ? null : isLearnLang(b.lang) ? b.lang : undefined;
  if (lang === undefined) return NextResponse.json({ error: "lang_required" }, { status: 400 });
  if (lang && !learnTargets(childUi).includes(lang)) return NextResponse.json({ error: "lang_not_offered" }, { status: 400 });
  const reads: Reads = b.reads === "no" || b.reads === "yes" ? b.reads : "little";
  await setupLearn(ref, lang, reads);
  return NextResponse.json({ ok: true, setup: { lang, reads, ui: childUi } });
}

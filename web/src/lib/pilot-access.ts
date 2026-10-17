import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { isPilotTopicId } from "@/lib/pilot-topics";
import { isSchoolSetId } from "@/lib/school-set-ids";
import { schoolSetGate } from "@/lib/school-sets";

/**
 * Who may open a pilot unit (Gemara phase B, 2026-10-15): an explicit list of
 * school ids per pilot. Server only. Any other school gets a 404, as if the
 * unit did not exist.
 */
const PILOT_SCHOOLS: Record<string, string[]> = {
  // The internal demo school, and Gadi's own school.
  "cur-gmp-pilot01": ["6pBDVLnkZRaVk5Ndq2h9nnKRqal1", "ePziqplUyOZ5WrGs5N1pYhrRmLw2"],
};

export function pilotAllows(id: string, schoolId: string | null | undefined): boolean {
  return !!schoolId && (PILOT_SCHOOLS[id] ?? []).includes(schoolId);
}

/** May this signed-in user open the pilot unit? By users/{uid}.schoolId.
 *  Always true for a unit that is not a pilot. */
export async function pilotAllowsUser(id: string, uid: string): Promise<boolean> {
  if (!isPilotTopicId(id)) return true;
  try {
    const schoolId = (await getAdminDb().collection("users").doc(uid).get()).get("schoolId") as string | undefined;
    return pilotAllows(id, schoolId);
  } catch {
    return false;
  }
}

/**
 * The server-side gate of every route that takes a set id. A unit that is not
 * a pilot passes untouched (null: no new requirement, nothing read). A pilot
 * unit needs a signed-in user (401) whose school is on the list (else 404).
 */
export async function pilotGate(req: Request, setId: string | null | undefined): Promise<NextResponse | null> {
  // A school's own set (2026-10-17): a signed-in member of that school only.
  if (isSchoolSetId(setId)) return schoolSetGate(req, setId);
  if (!isPilotTopicId(setId)) return null;
  const h = req.headers.get("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return NextResponse.json({ error: "login_required" }, { status: 401 });
  let uid = "";
  try {
    uid = (await getAdminAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }
  if (await pilotAllowsUser(setId as string, uid)) return null;
  return NextResponse.json({ error: "not_found" }, { status: 404 });
}

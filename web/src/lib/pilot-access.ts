import { getAdminDb } from "@/lib/firebase-admin";
import { isPilotTopicId } from "@/lib/pilot-topics";

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

/** For a user id (or a school id from a class code): may it open this pilot unit?
 *  Always true for a unit that is not a pilot. */
export async function pilotAllowsUser(id: string, uid: string): Promise<boolean> {
  if (!isPilotTopicId(id)) return true;
  if (pilotAllows(id, uid)) return true;
  try {
    const schoolId = (await getAdminDb().collection("users").doc(uid).get()).get("schoolId") as string | undefined;
    return pilotAllows(id, schoolId);
  } catch {
    return false;
  }
}

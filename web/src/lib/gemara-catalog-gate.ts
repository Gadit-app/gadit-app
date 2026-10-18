import "server-only";
import { curTopic } from "@/lib/curriculum-catalog";

/**
 * The 23 older Gemara catalog units (words and definitions written by the
 * engine, never reviewed by an expert) can be closed for chosen schools only
 * (2026-10-18), so a pilot school teaches Gemara from approved content alone.
 * Server only. Shipped OFF: the list comes from the server variable
 * GEMARA_CATALOG_OFF_SCHOOLS (school ids, comma separated); unset or empty =
 * no school, nothing changes anywhere. Other subjects, other schools and the
 * pilot unit are never affected.
 */
export function gemaraCatalogOffSchools(): Set<string> {
  return new Set((process.env.GEMARA_CATALOG_OFF_SCHOOLS ?? "").split(",").map((s) => s.trim()).filter(Boolean));
}

/** One of the older Gemara catalog units (by grade). */
export const isOldGemaraCatalogUnit = (id: string | null | undefined): boolean => !!id && curTopic(id)?.s === "gemara";

/** Is this unit closed for this (verified) school? */
export function gemaraCatalogClosed(id: string | null | undefined, schoolId: string | null | undefined): boolean {
  return !!schoolId && isOldGemaraCatalogUnit(id) && gemaraCatalogOffSchools().has(schoolId);
}

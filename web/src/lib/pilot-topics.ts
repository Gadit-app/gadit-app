/**
 * Pilot units (Gemara phase B, 2026-10-15). A pilot unit behaves like a normal
 * curriculum unit of its subject on the projector, but it is in NO catalog, so
 * no school ever sees it in /sets. It exists only from its imported Firestore
 * document (curriculumSets/<id>, written by scripts/gemara/import-pilot.mjs),
 * its words are never generated, and only the schools on its allow-list can
 * open it (lib/pilot-access.ts, server only). Ids start with "cur-" so every
 * curriculum code path accepts them, and never collide with a catalog hash.
 */
export type PilotTopic = { id: string; s: string; l: string; g: string; t: string };

export const PILOT_TOPICS: PilotTopic[] = [
  { id: "cur-gmp-pilot01", s: "gemara", l: "middle", g: "ז-ט", t: "פיילוט: מונחי משא ומתן בגמרא" },
];

const BY_ID = new Map(PILOT_TOPICS.map((t) => [t.id, t]));
export const pilotTopic = (id: string | null | undefined): PilotTopic | undefined => (id ? BY_ID.get(id) : undefined);
export const isPilotTopicId = (id: string | null | undefined): boolean => !!pilotTopic(id);

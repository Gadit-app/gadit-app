import crypto from "node:crypto";

/** The picture of one meaning, variant 1 or 2: imageCache/img_inv_<lang>_<hash>. Keyed on the
 *  meaning's stable id, never its text, so rewording a gloss keeps the picture. */
export function invPicKey(lang: string, w: string, id: string, v: number): string {
  const hash = crypto.createHash("sha256").update(`${w}|${id}|${v}`).digest("hex").slice(0, 24);
  return `img_inv_${lang}_${hash}`;
}

/** The game's own art, drawn once by the admin route: imageCache/img_inv_scene_<name>. */
export const INV_SCENE: Record<string, { prompt: string; quality: "low" | "medium" }> = {
  bg: {
    quality: "medium",
    prompt: "A soft modern 3D landscape like one frame of a premium animated film, for a children's game, seen from the ground. The bottom fifth is a gentle rounded green meadow with a few tiny flowers; far away on the horizon a cozy little village of rounded pastel houses and a windmill. The top four fifths are a huge open sky in a soft gradient from warm peach at the horizon to light turquoise above, with a few small soft clouds near the edges, leaving the middle open. Warm late-afternoon light, calm and uncluttered, no characters.",
  },
  imp: {
    quality: "low",
    prompt: "A soft modern 3D character like a premium animated film: a cute mischievous little round purple creature with big shiny eyes and a sneaky grin, wearing a tiny black eye mask like a cartoon costume thief, caught by surprise, small arms up. Alone in the center on a plain white background, whole body visible.",
  },
};
export const invSceneKey = (name: string) => `img_inv_scene_${name}`;

/** The second picture shows another example of the same meaning, so the child learns the meaning, not one picture. */
export const variantBrief = (brief: string, v: number) =>
  v === 1 ? brief : `${brief}. Show a different example of it than the most typical picture: another color, kind, angle or moment.`;

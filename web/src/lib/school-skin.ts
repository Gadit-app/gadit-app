/**
 * School skin = a single accent colour a principal sets for their classroom
 * surface, ideally matched to their logo. Applied by overriding the classroom
 * pages' --accent / --teal CSS variables so the topbar, buttons, and hero take
 * the school's colour instead of Gadit's default teal.
 *
 * The kid landing (/c/<CODE>) fetches it and stashes it in sessionStorage so
 * the word page and sub-pages can theme without another round trip.
 */

export const DEFAULT_ACCENT = "#0EA5A5";
export const SKIN_SESSION_PREFIX = "gadit_cls_skin_";

/** A small, friendly preset palette a principal can pick from. */
export const SKIN_PRESETS: { name: string; hex: string }[] = [
  { name: "Teal", hex: "#0EA5A5" },
  { name: "Purple", hex: "#7C3AED" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Green", hex: "#16A34A" },
  { name: "Orange", hex: "#EA580C" },
  { name: "Pink", hex: "#DB2777" },
  { name: "Mustard", hex: "#CA8A04" },
  { name: "Red", hex: "#DC2626" },
];

export function isHex(v: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(v);
}

/** Darken a hex colour by `amt` (0..1) for hover/active shades. */
export function darkenHex(hex: string, amt = 0.16): string {
  if (!isHex(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.round(((n >> 16) & 255) * (1 - amt)));
  const g = Math.max(0, Math.round(((n >> 8) & 255) * (1 - amt)));
  const b = Math.max(0, Math.round((n & 255) * (1 - amt)));
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/** CSS-variable style object that themes a classroom surface to `accent`.
 *  Returns {} when there is no custom accent so the default teal stays. */
export function skinStyleVars(accent?: string | null): React.CSSProperties {
  if (!accent || !isHex(accent) || accent.toLowerCase() === DEFAULT_ACCENT.toLowerCase()) return {};
  return {
    "--accent": accent,
    "--teal": accent,
    "--accent-strong": darkenHex(accent),
  } as React.CSSProperties;
}

/** Read the skin a /c/<CODE> visit stashed for this classroom code. */
export function readStashedSkin(code: string): string | null {
  try {
    const v = sessionStorage.getItem(SKIN_SESSION_PREFIX + code);
    return v && isHex(v) ? v : null;
  } catch {
    return null;
  }
}

/** Stash the classroom's skin so sibling pages can theme without a refetch. */
export function stashSkin(code: string, accent: string | null): void {
  try {
    if (accent && isHex(accent)) sessionStorage.setItem(SKIN_SESSION_PREFIX + code, accent);
    else sessionStorage.removeItem(SKIN_SESSION_PREFIX + code);
  } catch {
    /* private mode / disabled storage — theming just falls back to default */
  }
}

/**
 * Best-effort dominant-colour extraction from a logo image element, for the
 * "auto from logo" suggestion. Samples the drawn pixels, ignores near-white,
 * near-black, and near-grey, and returns the most saturated frequent bucket.
 * Returns null if the canvas is tainted (cross-origin without CORS) or nothing
 * usable is found — the UI then falls back to presets / manual pick.
 */
export function dominantColorFromImage(img: HTMLImageElement): string | null {
  try {
    const w = 48, h = 48;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const buckets = new Map<string, { count: number; r: number; g: number; b: number; sat: number }>();
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 128) continue;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const light = (max + min) / 2;
      if (light > 235 || light < 25) continue; // skip near-white / near-black
      const sat = max === 0 ? 0 : (max - min) / max;
      if (sat < 0.18) continue; // skip greys
      const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
      const e = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0, sat: 0 };
      e.count += 1; e.r += r; e.g += g; e.b += b; e.sat = sat;
      buckets.set(key, e);
    }
    let best: { score: number; r: number; g: number; b: number } | null = null;
    for (const e of buckets.values()) {
      const score = e.count * (0.5 + e.sat);
      if (!best || score > best.score) best = { score, r: e.r / e.count, g: e.g / e.count, b: e.b / e.count };
    }
    if (!best) return null;
    const hex = "#" + [best.r, best.g, best.b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
    return isHex(hex) ? hex : null;
  } catch {
    return null; // tainted canvas or unsupported
  }
}

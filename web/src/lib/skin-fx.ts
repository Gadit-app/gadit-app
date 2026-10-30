/** Skin effects trigger (see components/SkinFx.tsx). Safe anywhere, any user:
 *  only a child wearing a skin sees anything. */
export type SkinFxKind = "word" | "practice";
export const SKIN_FX_EVENT = "gadit:skin-fx";

export function playSkinFx(kind: SkinFxKind): void {
  try { window.dispatchEvent(new CustomEvent(SKIN_FX_EVENT, { detail: { kind } })); } catch { /* no window */ }
}

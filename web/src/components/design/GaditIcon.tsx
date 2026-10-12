/**
 * Gadit's own 3D icons (Gadi 2026-10-12, made in GPT from our style prompt):
 * public/icons/<name>.webp, 256px with a transparent background. Decorative,
 * so they are hidden from screen readers; the text beside them says it.
 */
export type GaditIconName =
  | "notebook" | "spell" | "read" | "say" | "play"
  | "photo" | "upload" | "paste" | "todo" | "workbook" | "topics" | "test"
  | "duel" | "same-device" | "invite" | "code" | "online" | "bot"
  | "streak" | "goal" | "rank";

export function GaditIcon({ name, size = 24, className }: { name: GaditIconName; size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/icons/${name}.webp`} alt="" aria-hidden="true" width={size} height={size} className={`gd-icon${className ? ` ${className}` : ""}`} decoding="async" />
  );
}

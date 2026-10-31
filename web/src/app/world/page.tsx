import type { Metadata } from "next";
import { WorldMap } from "./WorldMap";

/** /world: the map of word worlds (Gadi 2026-10-30). */
export const metadata: Metadata = {
  title: "Word Worlds, Gadit",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <WorldMap />;
}

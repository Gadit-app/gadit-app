import type { Metadata } from "next";
import { MapClient } from "./MapClient";

/** /journey/map: the islands of the journey, the monsters met and the trees of the known words. Private, not indexed.
 *  /journey/map?demo=1 is a sample map with nothing read or saved. */
export const metadata: Metadata = { title: "My map, Gadit", robots: { index: false, follow: false } };

export default async function MapRoute({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo } = await searchParams;
  return <MapClient demo={demo === "1"} />;
}

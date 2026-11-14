import type { Metadata } from "next";
import { JourneyClient } from "./JourneyClient";

/** /journey: a profile's word cards (the index). Private, not indexed, not linked yet.
 *  /journey?demo=1 shows a sample index with nothing read or saved. */
export const metadata: Metadata = { title: "My index, Gadit", robots: { index: false, follow: false } };

export default async function JourneyRoute({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo } = await searchParams;
  return <JourneyClient demo={demo === "1"} />;
}

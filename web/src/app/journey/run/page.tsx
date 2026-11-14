import type { Metadata } from "next";
import { RunClient } from "./RunClient";

/** /journey/run: the run to the fortress. Private, not indexed, not linked yet.
 *  /journey/run?demo=1 is a sample run with nothing read or saved. */
export const metadata: Metadata = { title: "The road to the fortress, Gadit", robots: { index: false, follow: false } };

export default async function RunRoute({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo } = await searchParams;
  return <RunClient demo={demo === "1"} />;
}

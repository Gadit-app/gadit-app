import type { Metadata } from "next";
import { BetaWordClient } from "./BetaWordClient";

/**
 * /beta/word/[word] — V2 result screen.
 *
 * Server component just resolves the dynamic param (Next 16 makes
 * params a Promise) and hands it to the client, which manages the
 * SSE streaming + result rendering with the V2 ResultView.
 *
 * Robots-disallowed (the legacy /word/[word] handles SEO during the
 * transition).
 */
export const metadata: Metadata = {
  title: "Gadit",
  robots: { index: false, follow: false },
};

export default async function BetaWordPage({
  params,
}: {
  params: Promise<{ word: string }>;
}) {
  const { word } = await params;
  const decoded = decodeURIComponent(word);
  return <BetaWordClient initialWord={decoded} />;
}

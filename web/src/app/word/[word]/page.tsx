import type { Metadata } from "next";
import { WordClient } from "./WordClient";

/**
 * /word/[word] — result screen.
 *
 * Server component resolves the dynamic param (Next 16 makes params a
 * Promise) and hands it to the client, which manages the SSE streaming
 * and renders the result with all attached modals (Compose / Quiz /
 * Report).
 *
 * Indexed: false — search engines don't gain anything from individual
 * dictionary URLs given the ephemeral, AI-generated nature of the
 * content. Cache-friendly URLs are reachable via internal Notebook
 * links and direct sharing instead.
 */
export const metadata: Metadata = {
  title: "Gadit",
  robots: { index: false, follow: false },
};

export default async function WordRoute({
  params,
}: {
  params: Promise<{ word: string }>;
}) {
  const { word } = await params;
  const decoded = decodeURIComponent(word);
  return <WordClient initialWord={decoded} />;
}

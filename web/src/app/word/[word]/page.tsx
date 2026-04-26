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
 * Indexable: search engines reach individual dictionary URLs and find
 * them useful long-tail traffic ("affect vs effect", "ephemeral
 * meaning Hebrew", etc.). Each /word/X is a publicly viewable page —
 * the first 5 searches are unmetered for any IP, so a Google crawler
 * picks up real content rather than a sign-up wall. Pre-launch, this
 * is the single biggest distribution lever we have besides word of
 * mouth.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ word: string }>;
}): Promise<Metadata> {
  const { word } = await params;
  const decoded = decodeURIComponent(word);
  return {
    title: `${decoded} — Gadit`,
    description: `Meanings, examples, etymology, and idioms for "${decoded}" — in 7 languages.`,
    alternates: {
      canonical: `https://www.gadit.app/word/${encodeURIComponent(decoded)}`,
    },
  };
}

export default async function WordRoute({
  params,
}: {
  params: Promise<{ word: string }>;
}) {
  const { word } = await params;
  const decoded = decodeURIComponent(word);
  return <WordClient initialWord={decoded} />;
}

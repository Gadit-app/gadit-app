import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-titles";
import { PlayPage } from "./PlayClient";

/**
 * /play — Word Games hub for Deep subscribers.
 *
 * Five game modes share one engine. Words come from the user's
 * Notebook; if it's too small, we top up with popular-word cache
 * entries in the same language. Deep-only — server returns 402
 * for Basic/Clear on /api/notebook anyway.
 */
const BASE_METADATA: Metadata = {
  title: "Word Games, Gadit",
  robots: { index: false, follow: false },
};

/** Same metadata, with the tab title in the visitor's UI language. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("play", BASE_METADATA);
}

export default async function PlayRoute({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // A lesson link (/play?lesson=...) opens on a loading screen, not the games menu.
  const { lesson } = await searchParams;
  return <PlayPage openingLesson={!!lesson} />;
}

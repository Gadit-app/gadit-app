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

export default function PlayRoute() {
  return <PlayPage />;
}

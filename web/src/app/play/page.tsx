import type { Metadata } from "next";
import { PlayPage } from "./PlayClient";

/**
 * /play — Word Games hub for Deep subscribers.
 *
 * Five game modes share one engine. Words come from the user's
 * Notebook; if it's too small, we top up with popular-word cache
 * entries in the same language. Deep-only — server returns 402
 * for Basic/Clear on /api/notebook anyway.
 */
export const metadata: Metadata = {
  title: "Word Games, Gadit",
  robots: { index: false, follow: false },
};

export default function PlayRoute() {
  return <PlayPage />;
}

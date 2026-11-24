import type { Metadata } from "next";
import { InvadersClient } from "./InvadersClient";

/** /invaders: The Invading Words (Gadi 2026-11-24). Testers and the admin only for now; not linked yet. */
export const metadata: Metadata = {
  title: "The Invading Words, Gadit",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <InvadersClient />;
}

import type { Metadata } from "next";
import { PracticePage } from "./PracticeClient";

/**
 * /practice — spaced-repetition flashcard practice (Deep tier).
 *
 * Routed from the "Practice now" CTA on /notebook. Anonymous and
 * non-Deep users are bounced before any data is fetched. Indexed:
 * false (private user data + ephemeral practice state).
 */
export const metadata: Metadata = {
  title: "Practice — Gadit",
  robots: { index: false, follow: false },
};

export default function PracticeRoute() {
  return <PracticePage />;
}

import type { Metadata } from "next";
import { BetaPracticePage } from "./BetaPracticeClient";

/**
 * /beta/practice — Spaced-repetition flashcard practice (Deep tier).
 *
 * Routed from the "Practice now" CTA on /beta/notebook. Anonymous and
 * non-Deep users are bounced before any data is fetched.
 */
export const metadata: Metadata = {
  title: "Practice — Gadit",
  robots: { index: false, follow: false },
};

export default function BetaPractice() {
  return <BetaPracticePage />;
}

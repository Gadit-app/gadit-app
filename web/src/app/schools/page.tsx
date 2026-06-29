import type { Metadata } from "next";
import { SchoolsLandingClient } from "./SchoolsLandingClient";

/**
 * /schools — public marketing landing page for the Schools tier.
 *
 * Architecture (after Gadi's 2026-06-29 council synthesis + 3-AI
 * review):
 *   1. Hero            — H1 + sub + sticky price chip + CTA
 *   2. The Problem     — pedagogical, "words you don't see kids miss"
 *   3. How It Works    — 3-step setup (code → join → see)
 *   4. Teacher View    — annotated dashboard mockup
 *   5. Privacy Moat    — diagram + "Kahoot-style classroom code"
 *   6. Pricing         — 2 cards, 14-day trial
 *   7. FAQ             — 8 blocker-removal questions
 *   8. Final CTA       — same button repeated
 *
 * Dashboard for paying school owners lives at /schools/manage now;
 * the landing client auto-redirects them on mount so the principal
 * who clicks "Schools" in the topbar lands in their dashboard
 * (not on marketing copy).
 */
export const metadata: Metadata = {
  title: "Schools | Gadit",
  description:
    "See every word your class doesn't understand. Real-time dashboard, no student accounts, no IT setup. $69/month, 14 days free.",
};

export default function SchoolsLandingRoute() {
  return <SchoolsLandingClient />;
}

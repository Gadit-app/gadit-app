import type { Metadata } from "next";
import { CoachClient } from "./CoachClient";

/**
 * /coach — a coach's students. A parent grants a coach access to a specific
 * child (in /family); the coach signs in here with that email and enters the
 * child's profile to add words during a lesson. All gating is server-side
 * (the grant), matched by the coach's verified email.
 */
export const metadata: Metadata = {
  title: "Coach, Gadit",
  robots: { index: false, follow: false },
};

export default function CoachRoute() {
  return <CoachClient />;
}

import type { Metadata } from "next";
import { ReviewClient } from "./ReviewClient";

/**
 * /review — the expert's content review (Gemara pilot, 2026-10-15).
 * Open only to an account with an open review grant; everyone else sees
 * that there is nothing here. Not indexed.
 */
export const metadata: Metadata = {
  title: "בדיקת תוכן, Gadit",
  robots: { index: false, follow: false },
};

export default function ReviewRoute() {
  return <ReviewClient />;
}

import type { Metadata } from "next";
import { HomePage } from "./HomeClient";

/**
 * / — Gadit homepage.
 *
 * Dark navy canvas, hero with the search-as-CTA, value props, tier
 * teaser, footer. Anonymous and signed-in users both land here.
 */
export const metadata: Metadata = {
  title: "Gadit — Every word, understood.",
  description:
    "A dictionary that meets you in context — meanings, origins, idioms, and a vivid image, in 7 languages.",
};

export default function Home() {
  return <HomePage />;
}

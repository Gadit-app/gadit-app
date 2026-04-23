import type { Metadata } from "next";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
  title: "Compare two words — Gadit",
  description: "See the exact difference between two confusable or similar-looking words, side by side.",
  alternates: {
    canonical: "https://www.gadit.app/compare",
  },
};

export default function ComparePage() {
  return <CompareClient />;
}

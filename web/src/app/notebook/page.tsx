import type { Metadata } from "next";
import NotebookClient from "./NotebookClient";

export const metadata: Metadata = {
  title: "My word notebook — Gadit",
  description: "Your saved words, ready for review with spaced repetition.",
  alternates: {
    canonical: "https://www.gadit.app/notebook",
  },
};

export default function NotebookPage() {
  return <NotebookClient />;
}

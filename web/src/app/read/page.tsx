import type { Metadata } from "next";
import { ReaderClient } from "./ReaderClient";

export const metadata: Metadata = {
  title: "Understand every word, Gadit",
  description:
    "Paste or photograph a text. Gadit turns every word into a tap, so you can go word by word and understand the whole passage.",
};

export default function ReadPage() {
  return <ReaderClient />;
}

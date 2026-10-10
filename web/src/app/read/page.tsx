import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-titles";
import { ReaderClient } from "./ReaderClient";

const BASE_METADATA: Metadata = {
  title: "Understand every word, Gadit",
  description:
    "Paste or photograph a text. Gadit turns every word into a tap, so you can go word by word and understand the whole passage.",
};

/** Same metadata, with the tab title in the visitor's UI language. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("read", BASE_METADATA);
}

export default function ReadPage() {
  return <ReaderClient />;
}

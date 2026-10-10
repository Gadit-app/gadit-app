import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-titles";
import { HelpClient } from "./HelpClient";

const BASE_METADATA: Metadata = {
  title: "How to use Gadit",
  description: "Short, tap-through guides for everything in Gadit: searching a word, saving words, Kids Mode, the reader, connecting a child's device, and more.",
};

/** Same metadata, with the tab title in the visitor's UI language. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("help", BASE_METADATA);
}

export default function HelpPage() {
  return <HelpClient />;
}

import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-titles";
import { SayClient } from "./SayClient";

const BASE_METADATA: Metadata = {
  title: "Gadit, Say it in another language",
  description:
    "Type a sentence, pick the language you're learning, and hear exactly how to say it, in the right accent, across 30+ languages.",
};

/** Same metadata, with the tab title in the visitor's UI language. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("say", BASE_METADATA);
}

export default function Page() {
  return <SayClient />;
}

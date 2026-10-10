import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-titles";
import { FeaturesPage } from "./FeaturesClient";

const BASE_METADATA: Metadata = {
  title: "Gadit, Features",
  description: "Everything Gadit does, meanings, examples, idioms, etymology, AI image, kids' explanation, sentence composition, quizzes.",
};

/** Same metadata, with the tab title in the visitor's UI language. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("features", BASE_METADATA);
}

export default function Page() {
  return <FeaturesPage />;
}

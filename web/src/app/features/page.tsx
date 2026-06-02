import type { Metadata } from "next";
import { FeaturesPage } from "./FeaturesClient";

export const metadata: Metadata = {
  title: "Gadit — Features",
  description: "Everything Gadit does — meanings, examples, idioms, etymology, AI image, kids' explanation, sentence composition, quizzes.",
};

export default function Page() {
  return <FeaturesPage />;
}

import type { Metadata } from "next";
import { HelpClient } from "./HelpClient";

export const metadata: Metadata = {
  title: "How to use Gadit",
  description: "Short, tap-through guides for everything in Gadit: searching a word, saving words, Kids Mode, the reader, connecting a child's device, and more.",
};

export default function HelpPage() {
  return <HelpClient />;
}

import type { Metadata } from "next";
import { SayClient } from "./SayClient";

export const metadata: Metadata = {
  title: "Gadit, Say it in another language",
  description:
    "Type a sentence, pick the language you're learning, and hear exactly how to say it, in the right accent, across 30+ languages.",
};

export default function Page() {
  return <SayClient />;
}

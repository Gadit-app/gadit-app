import type { Metadata } from "next";
import { IndividualsLandingClient } from "./IndividualsLandingClient";

export const metadata: Metadata = {
  title: "Gadit for you, understand every word",
  description:
    "The dictionary that explains any word at your level, in 30+ languages, saves it, and helps you remember it. Every meaning, examples, an image, games and practice.",
};

export default function Page() {
  return <IndividualsLandingClient />;
}

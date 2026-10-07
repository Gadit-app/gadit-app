import type { Metadata } from "next";
import { headers } from "next/headers";
import { IndividualsLandingSwitch } from "./IndividualsLandingSwitch";

export async function generateMetadata(): Promise<Metadata> {
  const lang = (await headers()).get("x-gadit-lang");
  if (lang === "he") {
    return {
      title: "Gadit Individual · להבין כל מילה עד הסוף",
      description: "כל המשמעויות של כל מילה, עם דוגמאות, תמונה ומקור המילה, ומחברת שזוכרת כל מילה. 14 יום ניסיון חינם.",
    };
  }
  return {
    title: "Gadit for you, understand every word",
    description:
      "The dictionary that explains any word at your level, in 30+ languages, saves it, and helps you remember it. Every meaning, examples, an image, games and practice.",
  };
}

export default function Page() {
  return <IndividualsLandingSwitch />;
}

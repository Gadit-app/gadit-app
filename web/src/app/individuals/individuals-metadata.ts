import type { Metadata } from "next";
import { headers } from "next/headers";
import { pageTitle } from "@/lib/page-titles";

/** Shared with /individuals/landing. Title in every UI language; the
 *  description is written in he + en (other languages get the English one). */
export async function individualsMetadata(): Promise<Metadata> {
  const lang = (await headers()).get("x-gadit-lang");
  const title = await pageTitle("individuals");
  if (lang === "he") {
    return {
      title,
      description: "כל המשמעויות של כל מילה, עם דוגמאות, תמונה ומקור המילה, ומחברת שזוכרת כל מילה. 14 יום ניסיון חינם.",
    };
  }
  return {
    title,
    description:
      "The dictionary that explains any word at your level, in 30+ languages, saves it, and helps you remember it. Every meaning, examples, an image, games and practice.",
  };
}

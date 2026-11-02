import type { Metadata } from "next";
import { CatchClient } from "./CatchClient";

/** /catch: Letter Fireflies (Gadi 2026-11-02), open to every player. */
export const metadata: Metadata = {
  title: "Letter Fireflies, Gadit",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CatchClient />;
}

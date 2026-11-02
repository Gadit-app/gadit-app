import type { Metadata } from "next";
import { TesterPayClient } from "./TesterPayClient";

/** /tester: a game tester's pay slip (Gadi 2026-11-02). */
export const metadata: Metadata = {
  title: "My pay slip, Gadit",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <TesterPayClient />;
}

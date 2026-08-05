import type { Metadata } from "next";
import SetsClient from "./SetsClient";

export const metadata: Metadata = {
  title: "Word Sets, Gadit",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SetsClient />;
}

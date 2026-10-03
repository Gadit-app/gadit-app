import type { Metadata } from "next";
import { Suspense } from "react";
import SetsClient from "./SetsClient";

export const metadata: Metadata = {
  title: "Word Sets, Gadit",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense>
      <SetsClient />
    </Suspense>
  );
}

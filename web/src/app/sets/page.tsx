import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-titles";
import { Suspense } from "react";
import SetsClient from "./SetsClient";

const BASE_METADATA: Metadata = {
  title: "Word Sets, Gadit",
  robots: { index: false, follow: false },
};

/** Same metadata, with the tab title in the visitor's UI language. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("sets", BASE_METADATA);
}

export default function Page() {
  return (
    <Suspense>
      <SetsClient />
    </Suspense>
  );
}

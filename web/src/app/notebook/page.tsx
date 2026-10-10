import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-titles";
import { NotebookPage } from "./NotebookClient";

/**
 * /notebook — personal vocabulary library with the Galaxy view (Deep
 * tier). Authentication + tier gating are handled inside the client.
 * Indexed: false (private user data).
 */
const BASE_METADATA: Metadata = {
  title: "Notebook, Gadit",
  robots: { index: false, follow: false },
};

/** Same metadata, with the tab title in the visitor's UI language. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("notebook", BASE_METADATA);
}

export default function NotebookRoute() {
  return <NotebookPage />;
}

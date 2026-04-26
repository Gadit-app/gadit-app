import type { Metadata } from "next";
import { NotebookPage } from "./NotebookClient";

/**
 * /notebook — personal vocabulary library with the Galaxy view (Deep
 * tier). Authentication + tier gating are handled inside the client.
 * Indexed: false (private user data).
 */
export const metadata: Metadata = {
  title: "Notebook — Gadit",
  robots: { index: false, follow: false },
};

export default function NotebookRoute() {
  return <NotebookPage />;
}

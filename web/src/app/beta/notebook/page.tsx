import type { Metadata } from "next";
import { BetaNotebookPage } from "./BetaNotebookClient";

/**
 * /beta/notebook — V2 personal vocabulary library with the Galaxy view.
 *
 * Robots-disallowed (legacy /notebook keeps serving production).
 * Authentication and Deep-tier gating are handled inside the client.
 */
export const metadata: Metadata = {
  title: "Notebook — Gadit",
  robots: { index: false, follow: false },
};

export default function BetaNotebook() {
  return <BetaNotebookPage />;
}

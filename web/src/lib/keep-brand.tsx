import { Fragment, type ReactNode } from "react";

/**
 * "Gadit" inside a label styled `text-transform: uppercase` became "GADIT"
 * (night QA 2026-11-18: "WATCH GADIT", "צפו ב-GADIT"). The brand is always
 * written "Gadit", so it keeps its own case inside such a label.
 */
export function keepBrand(text: string | undefined | null): ReactNode {
  if (!text || !text.includes("Gadit")) return text ?? null;
  return text.split("Gadit").map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <span style={{ textTransform: "none" }}>Gadit</span>}
      {part}
    </Fragment>
  ));
}

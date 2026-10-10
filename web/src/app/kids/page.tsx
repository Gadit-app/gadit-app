import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-titles";
import { KidsSwitcherClient } from "./KidsSwitcherClient";

/**
 * /kids — the shared-device "Who's using?" switcher (Kids Mode). The tablet is
 * signed in once as the parent; each kid taps their tile (optionally behind a
 * 4-digit PIN) to enter their own area. A focus mode, not a login. Gadi
 * 2026-08-22, per the Yooniz Kids Mode spec.
 */
const BASE_METADATA: Metadata = {
  title: "Kids Mode, Gadit",
  robots: { index: false, follow: false },
};

/** Same metadata, with the tab title in the visitor's UI language. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("kids", BASE_METADATA);
}

export default function KidsRoute() {
  return <KidsSwitcherClient />;
}

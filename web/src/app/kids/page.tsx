import type { Metadata } from "next";
import { KidsSwitcherClient } from "./KidsSwitcherClient";

/**
 * /kids — the shared-device "Who's using?" switcher (Kids Mode). The tablet is
 * signed in once as the parent; each kid taps their tile (optionally behind a
 * 4-digit PIN) to enter their own area. A focus mode, not a login. Gadi
 * 2026-08-22, per the Yooniz Kids Mode spec.
 */
export const metadata: Metadata = {
  title: "Kids Mode, Gadit",
  robots: { index: false, follow: false },
};

export default function KidsRoute() {
  return <KidsSwitcherClient />;
}

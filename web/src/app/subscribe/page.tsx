import type { Metadata } from "next";
import { SubscribeClient } from "./SubscribeClient";

export const metadata: Metadata = {
  title: "Gadit plans",
  robots: { index: false, follow: false },
};

/** App Store plans in the iOS app (SubscribeClient). */
export default function SubscribePage() {
  return <SubscribeClient />;
}

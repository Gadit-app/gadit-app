import type { Metadata } from "next";
import { FamilyPairClient } from "./FamilyPairClient";

export const metadata: Metadata = {
  title: "Pair device, Gadit",
  robots: { index: false, follow: false },
};

export default function FamilyPairRoute() {
  return <FamilyPairClient />;
}

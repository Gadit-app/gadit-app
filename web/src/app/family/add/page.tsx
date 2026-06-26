import type { Metadata } from "next";
import { FamilyAddClient } from "./FamilyAddClient";

export const metadata: Metadata = {
  title: "Add member, Gadit",
  robots: { index: false, follow: false },
};

export default function FamilyAddRoute() {
  return <FamilyAddClient />;
}

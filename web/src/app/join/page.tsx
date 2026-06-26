import type { Metadata } from "next";
import { JoinClient } from "./JoinClient";

export const metadata: Metadata = {
  title: "Join a family, Gadit",
  robots: { index: false, follow: false },
};

export default function JoinRoute() {
  return <JoinClient />;
}

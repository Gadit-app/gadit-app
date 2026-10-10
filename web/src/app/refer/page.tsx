import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-titles";
import { ReferClient } from "./ReferClient";

const BASE_METADATA: Metadata = {
  title: "Invite friends, Gadit",
  description: "Invite a friend to Gadit. When they subscribe through your link, you get a free month.",
};

/** Same metadata, with the tab title in the visitor's UI language. */
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("refer", BASE_METADATA);
}

export default function ReferPage() {
  return <ReferClient />;
}

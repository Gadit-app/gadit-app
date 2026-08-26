import type { Metadata } from "next";
import { ReferClient } from "./ReferClient";

export const metadata: Metadata = {
  title: "Invite friends, Gadit",
  description: "Invite a friend to Gadit. When they subscribe through your link, you get a free month.",
};

export default function ReferPage() {
  return <ReferClient />;
}

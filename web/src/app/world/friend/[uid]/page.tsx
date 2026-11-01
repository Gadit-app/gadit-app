import type { Metadata } from "next";
import { FriendWorld } from "../../FriendWorld";

/** /world/friend/<uid>: an approved friend's world, read only (Gadi 2026-11-01). */
export const metadata: Metadata = {
  title: "Word Worlds, Gadit",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  return <FriendWorld uid={uid} />;
}

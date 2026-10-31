import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isWorldId } from "@/lib/world/worlds";
import { WorldClient } from "../WorldClient";

/** /world/<id>: one world of the world game (Gadi 2026-10-30). */
export const metadata: Metadata = {
  title: "Word Worlds, Gadit",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isWorldId(id)) notFound();
  return <WorldClient worldId={id} />;
}

import type { Metadata } from "next";
import { DuelJoinClient } from "./DuelJoinClient";

/**
 * /duel/<CODE> — the link a player sends to invite someone to a Word Duel
 * (Gadi 2026-10-11). Any signed-in account can join, Basic included.
 */
export const metadata: Metadata = {
  title: "Word Duel, Gadit",
  robots: { index: false, follow: false },
};

export default async function DuelRoute({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <DuelJoinClient code={code.replace(/\D/g, "").slice(0, 6)} />;
}

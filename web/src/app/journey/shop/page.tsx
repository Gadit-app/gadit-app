import type { Metadata } from "next";
import { ShopClient } from "./ShopClient";

/** /journey/shop: looks for the child's runner, paid with the coins of the known words. Private, not indexed. */
export const metadata: Metadata = { title: "The shop, Gadit", robots: { index: false, follow: false } };

export default async function ShopRoute({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo } = await searchParams;
  return <ShopClient demo={demo === "1"} />;
}

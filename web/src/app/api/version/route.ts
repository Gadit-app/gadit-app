import { NextResponse } from "next/server";

/**
 * Current deployed build id, read fresh on every request (never cached).
 * The client compares this to the build id baked into its bundle
 * (NEXT_PUBLIC_BUILD_ID) and reloads when a newer deploy is live, so users
 * are always on the latest version with no manual refresh. See AutoUpdater.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET() {
  return NextResponse.json(
    { v: process.env.VERCEL_GIT_COMMIT_SHA || "dev" },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

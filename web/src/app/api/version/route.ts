import { NextResponse, type NextRequest } from "next/server";

/**
 * Current deployed build id, read fresh on every request (never cached).
 * The client compares this to the build id baked into its bundle
 * (NEXT_PUBLIC_BUILD_ID) and reloads when a newer deploy is live, so users
 * are always on the latest version with no manual refresh. See AutoUpdater.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET(req: NextRequest) {
  // Admin only: the Node.js runtime actually serving this deploy (security
  // advisories name exact patch versions, 2026-10-26).
  const admin = !!process.env.ADMIN_SECRET && req.nextUrl.searchParams.get("secret") === process.env.ADMIN_SECRET;
  return NextResponse.json(
    { v: process.env.VERCEL_GIT_COMMIT_SHA || "dev", ...(admin ? { node: process.version, region: process.env.VERCEL_REGION ?? null } : {}) },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

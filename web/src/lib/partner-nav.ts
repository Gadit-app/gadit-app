"use client";

import type { User } from "firebase/auth";

/**
 * Resolve where "Partner area" should go for the current user (Gadi
 * 2026-08-18). An existing partner goes straight to THEIR dashboard
 * (via the emailed dashboardToken, resolved from their account email);
 * everyone else goes to the /partners marketing landing. Async because it
 * asks /api/partner/me; callers await then router.push the result.
 */
export async function resolvePartnerArea(
  user: User | null | undefined,
  href: (p: string) => string,
): Promise<string> {
  const landing = href("/partners");
  if (!user) return landing;
  try {
    const idToken = await user.getIdToken();
    const res = await fetch("/api/partner/me", {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (!res.ok) return landing;
    const d = (await res.json()) as { isPartner?: boolean; token?: string };
    if (d.isPartner && d.token) {
      return href(`/partner/dashboard?t=${encodeURIComponent(d.token)}`);
    }
  } catch {
    /* fall through to the landing */
  }
  return landing;
}

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";

/**
 * Kid route guard (council 2026-08-04). Hiding commercial links from a
 * kid's nav isn't enough: a bored child can type /pricing or /partners
 * straight into the address bar and reach a checkout. This client guard
 * is the backstop, a kid session (familyRole === "kid") that lands on a
 * commercial / marketing / account-management route is bounced home.
 *
 * It's client-side because Gadit's auth lives in the browser (Firebase
 * client SDK, no session cookie), so there's no request the middleware
 * could gate. The redirect fires as soon as auth resolves; a kid never
 * transacts, so the brief render before the bounce is harmless.
 */

// URL prefixes (all UI langs) so we can strip the locale segment.
const LANGS = new Set(["he", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja", "hi", "am", "en", "uk", "tr", "pl", "fa", "id", "nl", "el", "zu", "vi", "fil", "af", "sw"]);

// First path segment (after any locale) a kid must never reach.
const BLOCKED = new Set([
  "pricing",
  "individuals",
  "partner",
  "partners",
  "affiliate",
  "affiliates",
  "checkout",
  "families",
  "family",
  "schools",
]);

export function KidRouteGuard() {
  const { familyRole, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const href = useHref();

  useEffect(() => {
    if (loading || familyRole !== "kid") return;
    const segs = pathname.split("/").filter(Boolean);
    const first = segs.length && LANGS.has(segs[0]) ? segs[1] : segs[0];
    if (first && BLOCKED.has(first)) {
      router.replace(href("/"));
    }
  }, [familyRole, loading, pathname, router, href]);

  return null;
}

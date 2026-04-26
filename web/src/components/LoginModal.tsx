"use client";

/**
 * LoginModal — global wrapper around the V2 modal.
 *
 * Kept as a thin alias so existing layout.tsx (and any external callers)
 * can keep importing `LoginModal` from "@/components/LoginModal" without
 * caring about the V2 internals.
 */

import { LoginModalV2 } from "./design/LoginModalV2";

export default function LoginModal() {
  return <LoginModalV2 />;
}

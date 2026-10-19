"use client";

import { useSyncExternalStore } from "react";
import { isIosApp } from "./native-app";
import { nativeAuthAvailable, type NativeAuthProvider } from "./native-auth";

const noop = () => () => {};

/**
 * React hook for "running inside the Gadit iOS app" (see lib/native-app.ts).
 * Server render and the hydration pass read false, then the client re-renders
 * with the real value, so there is no hydration mismatch. The UA never changes
 * during a session, so there is nothing to subscribe to.
 */
export function useIsIosApp(): boolean {
  return useSyncExternalStore(noop, isIosApp, () => false);
}

/** True when the iOS app can run the native sign-in sheet for `provider`
 * (lib/native-auth.ts). False on the web, Android and older app builds. */
export function useNativeAuthAvailable(provider: NativeAuthProvider): boolean {
  return useSyncExternalStore(noop, () => nativeAuthAvailable(provider), () => false);
}

"use client";

/**
 * Kids Mode under every tool's title (Gadi 2026-10-11: it switches the
 * whole app to kid language and kid games, so it belongs to every section,
 * not to a banner on the games page). Family members only, like before.
 */
import { useAuth } from "@/lib/auth-context";
import { KidsModeToggle } from "@/components/KidsModeToggle";

export function ToolKidsToggle() {
  const { user, plan, kidsAccess } = useAuth();
  if (!user || !kidsAccess || (plan !== "clear" && plan !== "deep")) return null;
  return (
    <div className="wb-tool-kids">
      <KidsModeToggle plan={plan} />
    </div>
  );
}

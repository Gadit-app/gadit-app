"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { canStepBack } from "@/lib/back-nav";

/**
 * A "back" link that acts like the browser's Back button: when the page the
 * user came from is `href` (or, with `anyPrevious`, any page of this site),
 * a tap steps back in history instead of pushing `href` again, so the
 * browser's Back afterwards keeps going back rather than returning here.
 * Opened from outside (a shared link, an email, a new tab) it is an ordinary
 * link to `href`. Ctrl/Cmd/middle click keep the normal "open in new tab".
 */
export function BackLink({
  href,
  anyPrevious = false,
  className,
  style,
  children,
  ...rest
}: {
  href: string;
  anyPrevious?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  "aria-label"?: string;
  dir?: string;
}) {
  const router = useRouter();
  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (canStepBack(anyPrevious ? undefined : href)) {
      e.preventDefault();
      router.back();
    }
  }
  return (
    <Link href={href} className={className} style={style} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}

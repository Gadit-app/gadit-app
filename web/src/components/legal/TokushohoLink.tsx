"use client";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { JP_YEN_LIVE } from "@/lib/jp-legal";

/** The Japanese label of the disclosure page (Act on Specified Commercial Transactions). */
export const TOKUSHOHO_LABEL = "特定商取引法に基づく表記";

/**
 * Footer / price-area link to /tokushoho, rendered for Japanese visitors only
 * (the disclosure is a Japanese legal requirement; other languages reach it
 * from inside the page's own language picker). Tagged gd-buy: the page lists
 * prices, so it is hidden inside the Play / iOS apps like every sales link.
 * `separator` prints the "·" that sits between footer links before the link.
 */
export function TokushohoLink({
  separator,
  sepStyle,
  style,
  className,
}: {
  separator?: boolean;
  sepStyle?: CSSProperties;
  style?: CSSProperties;
  className?: string;
}) {
  const { lang } = useLang();
  const href = useHref();
  if (lang !== "ja" || !JP_YEN_LIVE) return null;
  return (
    <>
      {separator && <span className="gd-buy" style={sepStyle}>·</span>}
      <Link href={href("/tokushoho")} className={className ? `gd-buy ${className}` : "gd-buy"} style={style}>
        {TOKUSHOHO_LABEL}
      </Link>
    </>
  );
}

/** A link to an app path that keeps the reader's language prefix (/ja/pricing). */
export function LangLink({ path, children }: { path: string; children: ReactNode }) {
  const href = useHref();
  return <Link href={href(path)}>{children}</Link>;
}

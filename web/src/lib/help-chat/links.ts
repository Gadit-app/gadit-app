/**
 * The links the help assistant may hand out (Gadi 2026-11-15, built on the
 * Yooniz advisor). The model never writes a URL: it picks one id from this
 * list (or "none"), the server checks the id, and the chat window turns it
 * into a link in the user's language. A guide opens on top of the current
 * page (?guide=<id>), every guide id is a key of GUIDES in lib/guides.ts.
 *
 * Money pages (prices, plans, buying) are never offered inside the Google
 * Play or iOS app.
 */

export const GUIDE_LINKS = [
  "search", "listen", "niqqud", "save", "context", "wordpage", "extras", "kids", "install", "addchild", "pair",
  "dashboard", "alerts", "homework", "ranks", "reader", "say", "practice", "games", "duel", "account", "cancel",
] as const;

export const PAGE_LINKS = {
  help: "/help",
  notebook: "/notebook",
  family: "/family",
  account: "/account",
  play: "/play",
  read: "/read",
  sayPage: "/say",
  exercises: "/exercises",
  homeworkPage: "/homework",
  subjects: "/subjects",
  join: "/join",
  contact: "/contact",
  privacy: "/privacy",
  deleteAccount: "/delete-account",
  pricing: "/pricing",
  families: "/families",
  schools: "/schools",
} as const;

/** Pages that sell: never offered in the store apps. */
export const MONEY_LINKS = new Set<string>(["pricing", "families", "schools"]);

export type GuideLink = (typeof GUIDE_LINKS)[number];
export type PageLink = keyof typeof PAGE_LINKS;
export type HelpLinkId = `guide:${GuideLink}` | `page:${PageLink}` | "none";

export const ALL_LINK_IDS: HelpLinkId[] = [
  "none",
  ...GUIDE_LINKS.map((g) => `guide:${g}` as HelpLinkId),
  ...(Object.keys(PAGE_LINKS) as PageLink[]).map((p) => `page:${p}` as HelpLinkId),
];

/** The ids the model may choose on this platform. */
export function linkIdsFor(app: boolean): HelpLinkId[] {
  return ALL_LINK_IDS.filter((id) => !(app && id.startsWith("page:") && MONEY_LINKS.has(id.slice(5))));
}

/** Where a link id goes: a guide over the current page, or a page path (no language prefix). */
export function linkTarget(id: string): { kind: "guide"; guide: GuideLink } | { kind: "page"; path: string } | null {
  if (id.startsWith("guide:")) {
    const g = id.slice(6) as GuideLink;
    return (GUIDE_LINKS as readonly string[]).includes(g) ? { kind: "guide", guide: g } : null;
  }
  if (id.startsWith("page:")) {
    const p = id.slice(5) as PageLink;
    return p in PAGE_LINKS ? { kind: "page", path: PAGE_LINKS[p] } : null;
  }
  return null;
}

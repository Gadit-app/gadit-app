/**
 * One icon per learning tool (Gadi 2026-10-11, the nav council): a treasure
 * chest for My Words, a backpack for Homework, an open book with a tap for
 * Every Word, a speech bubble with sound for Say it, a controller for
 * Games. Line icons that follow the text colour; shown beside each tool's
 * page title and in the top bar.
 */
export type ToolIconId = "notebook" | "spell" | "read" | "say" | "play";

export function ToolIcon({ id, size = 22, className }: { id: ToolIconId; size?: number; className?: string }) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    "aria-hidden": true, className,
  };
  switch (id) {
    case "notebook": // treasure chest
      return (
        <svg {...common}>
          <path d="M3 10.5V8.8C3 6.7 4.8 5 7 5h10c2.2 0 4 1.7 4 3.8v1.7" />
          <rect x="3" y="10.5" width="18" height="9.5" rx="1.6" />
          <path d="M8 5.3v14.7M16 5.3v14.7" />
          <rect x="10.4" y="9.3" width="3.2" height="4" rx="0.8" />
        </svg>
      );
    case "spell": // backpack
      return (
        <svg {...common}>
          <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
          <path d="M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6" />
          <path d="M8 22v-5.5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2V22" />
          <path d="M8 10.5h8" />
        </svg>
      );
    case "read": // open book with a tapped word
      return (
        <svg {...common}>
          <path d="M12 7v13" />
          <path d="M3 18.5V5a1 1 0 0 1 1-1h4.5A3.5 3.5 0 0 1 12 7.5 3.5 3.5 0 0 1 15.5 4H20a1 1 0 0 1 1 1v13.5a1 1 0 0 1-1 1h-5.5A2.5 2.5 0 0 0 12 22a2.5 2.5 0 0 0-2.5-2.5H4a1 1 0 0 1-1-1Z" />
          <path d="M15 10.5h3" />
          <circle cx="16.5" cy="13.8" r="1.3" fill="currentColor" stroke="none" />
        </svg>
      );
    case "say": // speech bubble with sound
      return (
        <svg {...common}>
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          <path d="M9.5 10.3c.7.9.7 2.5 0 3.4" />
          <path d="M12.5 8.6c1.5 1.8 1.5 5 0 6.8" />
          <path d="M15.5 7c2.2 2.6 2.2 7.4 0 10" />
        </svg>
      );
    case "play": // game controller
      return (
        <svg {...common}>
          <path d="M6 11h4M8 9v4" />
          <path d="M15 12h.01M18 10h.01" />
          <path d="M17.3 5H6.7a4 4 0 0 0-4 3.6C2.6 9.4 2 14.5 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.4-1.4a2 2 0 0 1 1.4-.6h4.4a2 2 0 0 1 1.4.6L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.5-.6-6.6-.7-7.3A4 4 0 0 0 17.3 5Z" />
        </svg>
      );
  }
}

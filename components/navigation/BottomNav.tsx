"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/quotes", label: "Quotes", d: "M4 18V9m5 9V5m5 13v-7m5 7V7" },
  { href: "/chart", label: "Chart", d: "M4 19h16M7 16V9m0-3v3m5 7v-4m0-4v4m5 4V8m0-3v3" },
  { href: "/trade", label: "Trade", d: "M7 4v13m0 0-3-3m3 3 3-3M17 20V7m0 0-3 3m3-3 3 3" },
  { href: "/history", label: "History", d: "M12 7v5l3 2M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4" },
  { href: "/settings", label: "Settings", d: "M4 7h10m4 0h2M4 17h2m4 0h10M16 4v6M8 14v6" },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-panel pb-[env(safe-area-inset-bottom)] md:inset-y-0 md:right-auto md:w-20 md:flex-col md:justify-start md:border-r md:border-t-0 md:pt-[env(safe-area-inset-top)]">
      {ITEMS.map((i) => {
        const active = path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] md:flex-none md:py-4 ${active ? "text-ink" : "text-mute"}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#4c8dff" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={i.d} /></svg>
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}

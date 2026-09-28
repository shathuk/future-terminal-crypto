"use client";
import { useMarket } from "@/components/quotes/MarketProvider";

const MAP = {
  connected: { dot: "bg-up", text: "Connected" },
  reconnecting: { dot: "bg-warn", text: "Reconnecting" },
  disconnected: { dot: "bg-down", text: "Disconnected" },
  idle: { dot: "bg-mute", text: "No symbols" },
} as const;

export default function ConnectionBadge() {
  const { status } = useMarket();
  const m = MAP[status];
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-mute" role="status">
      <span className={`h-2 w-2 rounded-full ${m.dot}`} />{m.text}
    </span>
  );
}

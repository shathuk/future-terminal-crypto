"use client";
import { useState } from "react";

const RANGES = ["Today", "Yesterday", "This week", "This month", "Custom"];
const STATS = ["Total P&L", "Trades", "Winning", "Losing", "Commission"];

export default function HistoryShell() {
  const [r, setR] = useState("Today");
  return (
    <div>
      <div role="group" aria-label="Date range" className="flex gap-2 overflow-x-auto px-4 py-3">
        {RANGES.map((x) => <button key={x} className="chip whitespace-nowrap" aria-pressed={r === x} onClick={() => setR(x)}>{x}</button>)}
      </div>
      <dl className="grid grid-cols-2 gap-px border-y border-line bg-line">
        {STATS.map((s) => (
          <div key={s} className="bg-bg px-4 py-3">
            <dt className="text-xs text-mute">{s}</dt>
            <dd className="text-lg tabular-nums">—</dd>
          </div>
        ))}
      </dl>
      <p className="px-4 pt-4 text-sm text-mute">No trades to show for {r.toLowerCase()}.</p>
      <p className="px-4 pt-2 text-xs text-mute">Binance only returns trade history from the last 3 months, so older custom ranges will not be available.</p>
    </div>
  );
}

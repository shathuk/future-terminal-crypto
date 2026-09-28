"use client";
import { useState } from "react";
import TimeframeBar from "./TimeframeBar";
import CandleChart from "./CandleChart";

function fmt(p?: string) {
  if (!p) return "—";
  const i = p.indexOf("."); const d = i < 0 ? 0 : p.length - i - 1;
  return Number(p).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function ChartScreen({ symbol }: { symbol: string }) {
  const [tf, setTf] = useState("15m");
  const [price, setPrice] = useState<string>();
  return (
    <>
      <div className="flex items-baseline justify-between px-4 pt-3">
        <span className="text-xl font-semibold tabular-nums">{fmt(price)}</span>
        <span className="text-xs text-mute">Times shown in your local timezone</span>
      </div>
      <TimeframeBar value={tf} onChange={setTf} />
      <div className="h-[calc(100dvh-15rem)] min-h-[320px] border-y border-line">
        <CandleChart symbol={symbol} interval={tf} onPrice={setPrice} />
      </div>
    </>
  );
}

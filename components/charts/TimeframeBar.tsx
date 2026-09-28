"use client";
import { TIMEFRAMES } from "@/lib/binance/intervals";

export default function TimeframeBar({ value, onChange }: { value: string; onChange: (api: string) => void }) {
  return (
    <div role="group" aria-label="Timeframe" className="flex gap-2 overflow-x-auto px-4 py-3">
      {TIMEFRAMES.map((t) => (
        <button key={t.api} className="chip" aria-pressed={value === t.api} onClick={() => onChange(t.api)}>{t.label}</button>
      ))}
    </div>
  );
}

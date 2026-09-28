"use client";
import { useState } from "react";

const TABS = ["Positions", "Pending", "New order"] as const;
type OrderType = "Market" | "Limit" | "Stop Market" | "Stop Limit";

export default function TradeShell() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Positions");
  const [type, setType] = useState<OrderType>("Market");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const needsTrigger = type === "Stop Market" || type === "Stop Limit";
  const needsLimit = type === "Limit" || type === "Stop Limit";

  return (
    <div>
      <p className="mx-4 mt-3 rounded-md bg-raised px-3 py-2 text-sm text-mute">Trading is not connected. Nothing on this screen can place an order yet.</p>
      <div role="tablist" className="flex gap-2 px-4 py-3">
        {TABS.map((t) => (
          <button key={t} role="tab" className="chip flex-1" aria-pressed={tab === t} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "Positions" && <p className="px-4 text-sm text-mute">No open positions to show.</p>}
      {tab === "Pending" && <p className="px-4 text-sm text-mute">No pending orders to show.</p>}

      {tab === "New order" && (
        <div className="space-y-4 px-4 pb-6">
          <div>
            <label className="label" htmlFor="ot">Order type</label>
            <select id="ot" className="field" value={type} onChange={(e) => setType(e.target.value as OrderType)}>
              <option>Market</option><option>Limit</option><option>Stop Market</option><option>Stop Limit</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["BUY", "SELL"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setSide(s)} aria-pressed={side === s}
                className={`min-h-11 rounded-md border text-sm font-medium ${side === s ? (s === "BUY" ? "border-up bg-up/15 text-up" : "border-down bg-down/15 text-down") : "border-line text-mute"}`}>{s}</button>
            ))}
          </div>
          {needsTrigger && <div><label className="label" htmlFor="tp">Trigger price</label><input id="tp" className="field" inputMode="decimal" /></div>}
          {needsLimit && <div><label className="label" htmlFor="lp">Limit price</label><input id="lp" className="field" inputMode="decimal" /></div>}
          <div><label className="label" htmlFor="q">Quantity</label><input id="q" className="field" inputMode="decimal" placeholder="0.001" /></div>
          <div>
            <label className="label" htmlFor="lev">Leverage</label>
            <select id="lev" className="field" defaultValue="10">{[1, 2, 5, 10, 20].map((l) => <option key={l} value={l}>{l}x</option>)}</select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label" htmlFor="sl">Stop loss</label><input id="sl" className="field" inputMode="decimal" /></div>
            <div><label className="label" htmlFor="tk">Take profit</label><input id="tk" className="field" inputMode="decimal" /></div>
          </div>
          <button type="button" disabled className={`min-h-12 w-full rounded-md text-base font-semibold text-white opacity-50 ${side === "BUY" ? "bg-up" : "bg-down"}`}>
            {side === "BUY" ? "Buy" : "Sell"}
          </button>
        </div>
      )}
    </div>
  );
}

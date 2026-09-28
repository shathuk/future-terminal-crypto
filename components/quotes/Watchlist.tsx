"use client";
import Link from "next/link";
import { useState } from "react";
import { useMarket } from "./MarketProvider";

type Sym = { symbol: string; base: string };

function decimals(p?: string) { const i = p?.indexOf(".") ?? -1; return i < 0 ? 0 : (p as string).length - i - 1; }
function fmt(p?: string) {
  if (!p) return "—";
  const d = decimals(p);
  return Number(p).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function Watchlist() {
  const { ready, symbols, ticks, add, remove, move } = useMarket();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState(false);
  const [all, setAll] = useState<Sym[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function loadSymbols() {
    if (all) return;
    setErr(null);
    try {
      const r = await fetch("/api/binance/symbols");
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Could not load symbols.");
      setAll(j.symbols);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load symbols.");
    }
  }

  const term = q.trim().toUpperCase();
  const rows = symbols.filter((s) => s.includes(term));
  const results = term && all ? all.filter((s) => !symbols.includes(s.symbol) && (s.symbol.includes(term) || s.base.includes(term))).slice(0, 20) : [];

  if (!ready) return null;
  return (
    <div>
      <div className="flex items-end gap-2 p-4">
        <div className="flex-1">
          <label htmlFor="sym" className="label">Search or add symbol</label>
          <input id="sym" className="field" value={q} onFocus={loadSymbols} onChange={(e) => setQ(e.target.value)} placeholder="BTC, DOGE…" autoCapitalize="characters" autoComplete="off" />
        </div>
        <button className="chip" aria-pressed={edit} onClick={() => setEdit((v) => !v)}>{edit ? "Done" : "Edit"}</button>
      </div>

      {term && (
        <div className="border-y border-line bg-panel">
          <p className="px-4 pt-3 text-xs text-mute">Add from Binance USDT-M perpetuals</p>
          {err && (
            <div className="px-4 py-3 text-sm text-down">
              {err} <button className="underline" onClick={() => { setAll(null); loadSymbols(); }}>Try again</button>
            </div>
          )}
          {!err && !all && <p className="px-4 py-3 text-sm text-mute">Loading symbols…</p>}
          {all && results.length === 0 && <p className="px-4 py-3 text-sm text-mute">No new symbols match &quot;{q}&quot;.</p>}
          <ul>
            {results.map((s) => (
              <li key={s.symbol}>
                <button className="flex min-h-12 w-full items-center justify-between px-4 text-left" onClick={() => { add(s.symbol); setQ(""); }}>
                  <span>{s.symbol}</span><span className="text-sm text-accent">Add</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="divide-y divide-line border-y border-line">
        {rows.map((s, idx) => {
          const t = ticks[s] ?? {};
          const pct = t.pct !== undefined ? Number(t.pct) : undefined;
          const body = (
            <>
              <div>
                <div className="font-medium">{s}</div>
                <div className="text-xs tabular-nums text-mute">Bid {fmt(t.bid)} / Ask {fmt(t.ask)}</div>
              </div>
              <div className="text-right tabular-nums">
                <div>{fmt(t.last)}</div>
                <div className={`text-xs ${pct === undefined ? "text-mute" : pct >= 0 ? "text-up" : "text-down"}`}>
                  {pct === undefined ? "—" : `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`}
                </div>
              </div>
            </>
          );
          return (
            <li key={s}>
              {edit ? (
                <div className="flex min-h-16 items-center justify-between gap-2 px-4">
                  <div className="font-medium">{s}</div>
                  <div className="flex gap-2">
                    <button className="chip px-3" aria-label={`Move ${s} up`} disabled={idx === 0 || !!term} onClick={() => move(s, -1)}>↑</button>
                    <button className="chip px-3" aria-label={`Move ${s} down`} disabled={idx === rows.length - 1 || !!term} onClick={() => move(s, 1)}>↓</button>
                    <button className="chip px-3 text-down" aria-label={`Remove ${s}`} onClick={() => remove(s)}>Remove</button>
                  </div>
                </div>
              ) : (
                <Link href={`/chart?symbol=${s}`} className="flex min-h-16 items-center justify-between px-4 py-3 active:bg-panel">{body}</Link>
              )}
            </li>
          );
        })}
      </ul>
      {symbols.length === 0 && <p className="px-4 pt-4 text-sm text-mute">Your watchlist is empty. Search a symbol above to add it.</p>}
      {symbols.length > 0 && rows.length === 0 && !term.length && null}
    </div>
  );
}

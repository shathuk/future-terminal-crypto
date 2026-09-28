"use client";
import { useEffect, useRef, useState } from "react";
import { CandlestickSeries, ColorType, CrosshairMode, createChart, type IChartApi, type ISeriesApi, type UTCTimestamp } from "lightweight-charts";
import { ManagedSocket, klineUrl } from "@/lib/binance/websocket";

type Status = "loading" | "connecting" | "live" | "reconnecting" | "error";
const LABEL: Record<Status, string> = { loading: "Loading…", connecting: "Connecting…", live: "Live", reconnecting: "Reconnecting…", error: "Error" };
const DOT: Record<Status, string> = { loading: "bg-mute", connecting: "bg-warn", live: "bg-up", reconnecting: "bg-warn", error: "bg-down" };

const decimals = (p: string) => { const i = p.indexOf("."); return i < 0 ? 0 : p.length - i - 1; };

export default function CandleChart({ symbol, interval, onPrice }: { symbol: string; interval: string; onPrice?: (p: string) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const series = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceCb = useRef(onPrice);
  priceCb.current = onPrice;
  const [status, setStatus] = useState<Status>("loading");
  const [err, setErr] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Create the chart once.
  useEffect(() => {
    if (!el.current) return;
    const c = createChart(el.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "#0d1117" }, textColor: "#8b98a8", attributionLogo: false },
      grid: { vertLines: { color: "#1a212b" }, horzLines: { color: "#1a212b" } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "#262f3b" },
      timeScale: { borderColor: "#262f3b", timeVisible: true, secondsVisible: false, rightOffset: 4 },
    });
    series.current = c.addSeries(CandlestickSeries, {
      upColor: "#2bb39a", downColor: "#e5534b", borderVisible: false, wickUpColor: "#2bb39a", wickDownColor: "#e5534b",
    });
    chart.current = c;
    return () => { c.remove(); chart.current = null; series.current = null; };
  }, []);

  // Load history, then stream live candles. Re-runs when symbol/timeframe change.
  useEffect(() => {
    let cancelled = false;
    let needsRefill = false;
    // Shift timestamps so the axis shows the device's local time (chart itself is UTC-only).
    const off = -new Date().getTimezoneOffset() * 60;
    setStatus("loading");
    setErr(null);

    async function load(reset: boolean) {
      const r = await fetch(`/api/binance/klines?symbol=${symbol}&interval=${interval}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Could not load candles.");
      if (cancelled) return;
      const rows: string[][] = j.candles;
      if (!rows.length) throw new Error("No candles returned for this symbol.");
      const dec = Math.max(...rows.slice(-50).flatMap((c) => c.slice(1).map(decimals)));
      series.current?.applyOptions({ priceFormat: { type: "price", precision: dec, minMove: 10 ** -dec } });
      series.current?.setData(rows.map((c) => ({
        time: (Number(c[0]) / 1000 + off) as UTCTimestamp, open: +c[1], high: +c[2], low: +c[3], close: +c[4],
      })));
      if (reset) chart.current?.timeScale().setVisibleLogicalRange({ from: rows.length - 100, to: rows.length + 4 });
      priceCb.current?.(rows[rows.length - 1][4]);
    }

    const sock = new ManagedSocket(
      (msg) => {
        const k = (msg?.data ?? msg)?.k;
        if (!k) return;
        try {
          series.current?.update({ time: (k.t / 1000 + off) as UTCTimestamp, open: +k.o, high: +k.h, low: +k.l, close: +k.c });
          priceCb.current?.(k.c);
        } catch { /* out-of-order frame during a refill: ignore */ }
      },
      (s) => {
        if (cancelled) return;
        if (s === "connecting") setStatus("connecting");
        else if (s === "retrying") { needsRefill = true; setStatus("reconnecting"); }
        else if (s === "open") {
          setStatus("live");
          if (needsRefill) { needsRefill = false; load(false).catch(() => {}); } // fill candles missed while offline
        }
      },
    );

    load(true)
      .then(() => { if (!cancelled) sock.setUrl(klineUrl(symbol, interval)); })
      .catch((e) => { if (!cancelled) { setErr(e instanceof Error ? e.message : "Could not load candles."); setStatus("error"); } });

    return () => { cancelled = true; sock.destroy(); };
  }, [symbol, interval, retryKey]);

  return (
    <div className="relative h-full w-full">
      <div ref={el} className="h-full w-full" />
      <span className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded bg-bg/80 px-2 py-1 text-[11px] text-mute" role="status">
        <span className={`h-2 w-2 rounded-full ${DOT[status]}`} />{LABEL[status]}
      </span>
      {status === "error" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-bg/90 px-6 text-center">
          <p className="text-sm text-down">{err}</p>
          <button className="chip" onClick={() => setRetryKey((k) => k + 1)}>Try again</button>
        </div>
      )}
    </div>
  );
}

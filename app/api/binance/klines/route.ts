import { NextResponse } from "next/server";
import { VALID_INTERVALS } from "@/lib/binance/intervals";

export const runtime = "nodejs";
export const preferredRegion = "sin1";

const BASE = process.env.MARKET_REST_BASE ?? "https://fapi.binance.com";

// Public candles. Input is validated so this route can't be used to reach other Binance paths.
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const symbol = (sp.get("symbol") ?? "").toUpperCase();
  const interval = sp.get("interval") ?? "";
  if (!/^[A-Z0-9]{3,20}$/.test(symbol) || !VALID_INTERVALS.has(interval)) {
    return NextResponse.json({ error: "Invalid symbol or timeframe." }, { status: 400 });
  }
  try {
    const r = await fetch(`${BASE}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=500`, { cache: "no-store" });
    if (r.status === 451 || r.status === 403) return NextResponse.json({ error: "Binance blocked this server's region." }, { status: 502 });
    if (r.status === 429 || r.status === 418) return NextResponse.json({ error: "Binance rate limit reached. Please wait before retrying." }, { status: 429 });
    if (!r.ok) return NextResponse.json({ error: `Binance returned ${r.status}.` }, { status: 502 });
    const rows = (await r.json()) as unknown[][];
    // [openTime, open, high, low, close]; prices stay as strings to keep Binance's exact precision.
    const candles = rows.map((k) => [String(k[0]), String(k[1]), String(k[2]), String(k[3]), String(k[4])]);
    return NextResponse.json({ candles });
  } catch {
    return NextResponse.json({ error: "Could not reach Binance." }, { status: 502 });
  }
}

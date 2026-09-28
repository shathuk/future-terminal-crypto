import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const preferredRegion = "sin1"; // keep away from US regions, which Binance may block

const BASE = process.env.MARKET_REST_BASE ?? "https://fapi.binance.com";

// Public data only. Cached so repeated searches don't spend Binance request weight.
export async function GET() {
  try {
    const r = await fetch(`${BASE}/fapi/v1/exchangeInfo`, { next: { revalidate: 300 } });
    if (r.status === 451 || r.status === 403) {
      return NextResponse.json({ error: "Binance blocked this server's region." }, { status: 502 });
    }
    if (!r.ok) return NextResponse.json({ error: `Binance returned ${r.status}.` }, { status: 502 });
    const j = await r.json();
    const symbols = ((j.symbols ?? []) as any[])
      .filter((s) => s.contractType === "PERPETUAL" && s.quoteAsset === "USDT" && s.status === "TRADING")
      .map((s) => ({ symbol: String(s.symbol), base: String(s.baseAsset) }));
    if (symbols.length === 0) return NextResponse.json({ error: "Unexpected symbol list format." }, { status: 502 });
    return NextResponse.json({ symbols }, { headers: { "Cache-Control": "public, s-maxage=300" } });
  } catch {
    return NextResponse.json({ error: "Could not reach Binance." }, { status: 502 });
  }
}

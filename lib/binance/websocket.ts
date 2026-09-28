export type SockStatus = "idle" | "connecting" | "open" | "retrying";

/**
 * One WebSocket that never gives up silently: reconnects with backoff + jitter,
 * and force-reconnects if no message arrives for STALE_MS (dead connection).
 */
const STALE_MS = 20_000;

export class ManagedSocket {
  private ws: WebSocket | null = null;
  private url: string | null = null;
  private attempts = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private watchdog: ReturnType<typeof setInterval>;
  private lastMsg = 0;

  constructor(
    private onMessage: (data: any) => void,
    private onStatus: (s: SockStatus, attempts: number) => void,
  ) {
    this.watchdog = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN && Date.now() - this.lastMsg > STALE_MS) this.ws.close();
    }, 5_000);
  }

  setUrl(url: string | null) {
    if (url === this.url) return;
    this.url = url;
    this.teardown();
    this.attempts = 0;
    if (url) this.open();
    else this.onStatus("idle", 0);
  }

  /** Reconnect right away (tab visible again, network back) instead of waiting for backoff. */
  nudge() {
    if (this.url && (!this.ws || this.ws.readyState > WebSocket.OPEN)) {
      clearTimeout(this.timer);
      this.open();
    }
  }

  destroy() {
    clearInterval(this.watchdog);
    this.url = null;
    this.teardown();
  }

  private open() {
    if (!this.url) return;
    this.onStatus(this.attempts ? "retrying" : "connecting", this.attempts);
    const ws = new WebSocket(this.url);
    this.ws = ws;
    ws.onopen = () => { this.attempts = 0; this.lastMsg = Date.now(); this.onStatus("open", 0); };
    ws.onmessage = (e) => {
      this.lastMsg = Date.now();
      try { this.onMessage(JSON.parse(e.data)); } catch { /* ignore malformed frame */ }
    };
    ws.onerror = () => ws.close();
    ws.onclose = () => { if (this.ws === ws) { this.ws = null; this.retry(); } };
  }

  private retry() {
    if (!this.url) return;
    this.attempts += 1;
    this.onStatus("retrying", this.attempts);
    const delay = Math.min(15_000, 500 * 2 ** Math.min(this.attempts, 5)) * (0.5 + Math.random() / 2);
    this.timer = setTimeout(() => this.open(), delay);
  }

  private teardown() {
    clearTimeout(this.timer);
    const ws = this.ws;
    this.ws = null;
    if (ws) { ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null; ws.close(); }
  }
}

const WS_BASE = process.env.NEXT_PUBLIC_MARKET_WS_BASE ?? "wss://fstream.binance.com";

// Binance split its WebSocket URLs: regular market data on /market, book ticker on /public.
export function marketUrl(symbols: string[]): string | null {
  if (!symbols.length) return null;
  return `${WS_BASE}/market/stream?streams=${symbols.map((s) => `${s.toLowerCase()}@ticker`).join("/")}`;
}
export function bookUrl(symbols: string[]): string | null {
  if (!symbols.length) return null;
  return `${WS_BASE}/public/stream?streams=${symbols.map((s) => `${s.toLowerCase()}@bookTicker`).join("/")}`;
}

export function klineUrl(symbol: string, interval: string): string {
  return `${WS_BASE}/market/stream?streams=${symbol.toLowerCase()}@kline_${interval}`;
}

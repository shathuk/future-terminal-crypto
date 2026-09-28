// UI label -> Binance kline interval. Shared by the UI and the klines API route.
export const TIMEFRAMES = [
  { label: "1m", api: "1m" }, { label: "3m", api: "3m" }, { label: "5m", api: "5m" },
  { label: "15m", api: "15m" }, { label: "30m", api: "30m" }, { label: "1H", api: "1h" },
  { label: "4H", api: "4h" }, { label: "1D", api: "1d" }, { label: "1W", api: "1w" },
] as const;
export const VALID_INTERVALS = new Set<string>(TIMEFRAMES.map((t) => t.api));

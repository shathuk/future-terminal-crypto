"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ManagedSocket, bookUrl, marketUrl, type SockStatus } from "@/lib/binance/websocket";

export type Tick = { last?: string; pct?: string; bid?: string; ask?: string };
export type FeedStatus = "connected" | "reconnecting" | "disconnected" | "idle";

type Ctx = {
  ready: boolean;
  symbols: string[];
  ticks: Record<string, Tick>;
  status: FeedStatus;
  add: (s: string) => void;
  remove: (s: string) => void;
  move: (s: string, dir: -1 | 1) => void;
};

const KEY = "ft.watchlist.v1";
const DEFAULT = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "BNBUSDT"];
const MarketCtx = createContext<Ctx | null>(null);

export function useMarket() {
  const c = useContext(MarketCtx);
  if (!c) throw new Error("useMarket outside MarketProvider");
  return c;
}

type SS = { s: SockStatus; a: number };

export default function MarketProvider({ children }: { children: React.ReactNode }) {
  const [symbols, setSymbols] = useState<string[]>(DEFAULT);
  const [ready, setReady] = useState(false);
  const [ticks, setTicks] = useState<Record<string, Tick>>({});
  const [mk, setMk] = useState<SS>({ s: "idle", a: 0 });
  const [pb, setPb] = useState<SS>({ s: "idle", a: 0 });
  const [online, setOnline] = useState(true);
  const socks = useRef<{ m: ManagedSocket; p: ManagedSocket } | null>(null);
  const buf = useRef<Record<string, Tick>>({});
  const flushing = useRef(false);

  const handle = useCallback((msg: any) => {
    const d = msg?.data ?? msg;
    if (!d?.s) return;
    const patch: Tick | null =
      d.e === "24hrTicker" ? { last: d.c, pct: d.P }
      : d.e === "bookTicker" || ("b" in d && "a" in d && !("c" in d)) ? { bid: d.b, ask: d.a }
      : null;
    if (!patch) return;
    buf.current[d.s] = { ...buf.current[d.s], ...patch };
    if (!flushing.current) {
      flushing.current = true;
      setTimeout(() => {
        const b = buf.current; buf.current = {}; flushing.current = false;
        setTicks((prev) => {
          const next = { ...prev };
          for (const k of Object.keys(b)) next[k] = { ...prev[k], ...b[k] };
          return next;
        });
      }, 250); // batch updates so the list re-renders ~4x/sec at most
    }
  }, []);

  // Sockets (created first so the URL effect below finds them)
  useEffect(() => {
    const m = new ManagedSocket(handle, (s, a) => setMk({ s, a }));
    const p = new ManagedSocket(handle, (s, a) => setPb({ s, a }));
    socks.current = { m, p };
    const wake = () => {
      setOnline(navigator.onLine);
      if (document.visibilityState === "visible") { m.nudge(); p.nudge(); }
    };
    setOnline(navigator.onLine);
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("online", wake);
    window.addEventListener("offline", wake);
    return () => {
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("online", wake);
      window.removeEventListener("offline", wake);
      m.destroy(); p.destroy(); socks.current = null;
    };
  }, [handle]);

  // Load saved watchlist
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const saved = raw ? JSON.parse(raw) : null;
      if (Array.isArray(saved) && saved.every((x) => typeof x === "string")) setSymbols(saved);
    } catch { /* storage unavailable: keep defaults */ }
    setReady(true);
  }, []);

  // Point sockets at the current symbol set
  useEffect(() => {
    if (!ready || !socks.current) return;
    socks.current.m.setUrl(marketUrl(symbols));
    socks.current.p.setUrl(bookUrl(symbols));
  }, [symbols, ready]);

  const save = (next: string[]) => {
    setSymbols(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };
  const add = (s: string) => { if (!symbols.includes(s)) save([...symbols, s]); };
  const remove = (s: string) => save(symbols.filter((x) => x !== s));
  const move = (s: string, dir: -1 | 1) => {
    const i = symbols.indexOf(s), j = i + dir;
    if (i < 0 || j < 0 || j >= symbols.length) return;
    const next = [...symbols];
    [next[i], next[j]] = [next[j], next[i]];
    save(next);
  };

  const status: FeedStatus =
    symbols.length === 0 ? "idle"
    : !online ? "disconnected"
    : mk.s === "open" && pb.s === "open" ? "connected"
    : Math.max(mk.a, pb.a) >= 3 ? "disconnected"
    : "reconnecting";

  const value = useMemo(() => ({ ready, symbols, ticks, status, add, remove, move }), [ready, symbols, ticks, status]); // eslint-disable-line react-hooks/exhaustive-deps
  return <MarketCtx.Provider value={value}>{children}</MarketCtx.Provider>;
}
